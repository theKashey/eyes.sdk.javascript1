import assert from 'assert'
import {rename, rm, mkdir} from 'fs/promises'
import {resolve, join} from 'path'
import {extractBranchingTimestamp} from '../../src/utils/extract-branching-timestamp'
import * as utils from '@applitools/utils'

describe('extract branching timestamp', () => {
  afterEach(() => {
    extractBranchingTimestamp.clearCache()
  })

  describe('local repo', () => {
    const repoDir = resolve('./test/fixtures/git-repo')

    before(async () => {
      // make a valid repo
      await rename(join(repoDir, '.git-fake'), join(repoDir, '.git'))
    })

    after(async () => {
      await rename(join(repoDir, '.git'), join(repoDir, '.git-fake'))
    })

    it('works and caches response', async () => {
      const result1 = await extractBranchingTimestamp({parentBranchName: 'master', branchName: 'some-feat'}, {cwd: repoDir})
      assert.strictEqual(result1, '2020-02-06T15:20:56+02:00')

      const result2 = await extractBranchingTimestamp({parentBranchName: 'master', branchName: 'some-feat'}, {cwd: repoDir})
      assert.strictEqual(result2, '2020-02-06T15:20:56+02:00')
    })
  })

  describe('remote repo', () => {
    const repoDir = resolve('./test/fixtures/git-remote-repo')

    afterEach(async () => {
      await rm(repoDir, {recursive: true, force: true})
    })

    beforeEach(async () => {
      await mkdir(repoDir)
    })

    it('fetches missing parent branch', async () => {
      await utils.process.execute(
        `git clone --single-branch --branch some-branch-name https://github.com/applitools/testing-exmaple-repo.git .`,
        {cwd: repoDir},
      )

      const result = await extractBranchingTimestamp({parentBranchName: 'master', branchName: 'some-branch-name'}, {cwd: repoDir})
      assert.strictEqual(result, '2020-02-19T17:14:31+02:00')
    })

    it('fetches missing feature branch', async () => {
      await utils.process.execute(
        `git clone --single-branch --branch master https://github.com/applitools/testing-exmaple-repo.git . && git fetch origin +refs/pull/1/merge && git checkout -qf FETCH_HEAD`,
        {cwd: repoDir},
      )
      const result = await extractBranchingTimestamp({parentBranchName: 'master', branchName: 'some-branch-name'}, {cwd: repoDir})
      assert.strictEqual(result, '2020-02-19T17:14:31+02:00')
    })

    it('fetches missing commits in the feature branch', async () => {
      await utils.process.execute(
        `git clone --depth=1 --branch some-branch-name https://github.com/applitools/testing-exmaple-repo.git .`,
        {cwd: repoDir},
      )
      const result = await extractBranchingTimestamp({parentBranchName: 'master', branchName: 'some-branch-name'}, {cwd: repoDir})
      assert.strictEqual(result, '2020-02-19T17:14:31+02:00')
    })

    it("throws error when can't get the info", async () => {
      await utils.process.execute(
        `git clone --branch some-branch-name https://github.com/applitools/testing-exmaple-repo.git .`,
        {cwd: repoDir},
      )
      await assert.rejects(
        extractBranchingTimestamp({parentBranchName: 'no-there', branchName: 'some-branch-name'}, {cwd: repoDir}),
        err => err.message.includes('fatal: --unshallow on a complete repository does not make sense'),
      )
    })
  })
})
