import {exec} from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
const pexec = promisify(exec)

const folders = [
  'eyes-selenium',
  'eyes-webdriverio-5',
  'eyes-webdriverio-4',
  'eyes-puppeteer',
  'eyes-playwright',
  'eyes-protractor',
  'eyes-nightwatch',
  'eyes-testcafe',
  'eyes-cypress',
  'eyes-storybook',
  'eyes-images',
  'eyes-webdriverio-5-service',
  'eyes-universal',
]

const versions = (await Promise.all(folders.map(async folder => {
  const packageJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'packages', folder, 'package.json')))
  const version = (await pexec(`npm view ${packageJson.name} version`)).stdout
  return `${packageJson.name.padEnd(40, ' ')}: ${version.toString().trim()}`
}))).join('\n')

console.log(versions)