import * as core from '@actions/core'
import * as github from '@actions/github'
import {setTimeout} from 'timers/promises'

const workflowId = core.getInput('workflow', {required: true})
const inputs = core.getInput('inputs')
const ref = core.getInput('ref')
const octokit = github.getOctokit(process.env.GITHUB_TOKEN)

let run = await runWorkflow(workflowId)

core.saveState('runId', run.id)
core.saveState('status', 'in_progress')

core.notice(`Workflow is running: ${run.html_url}`, {title: run.name})

run = await waitForWorkflowCompleted(run)

if (['cancelled', 'failure', 'timed_out'].includes(run.conclusion)) {
  core.saveState('status', 'failure')
  core.error(`Workflow was finished with failure status "${run.conclusion}"`, {title: run.name})
  core.setFailed(`Workflow "${run.name}" was finished with failure status "${run.conclusion}"`)
  process.exit(1)
}

if (['action_required', 'neutral', 'skipped', 'stale'].includes(run.conclusion)) {
  core.saveState('status', 'failure')
  core.error(`Workflow was finished with unexpected status "${run.conclusion}"`, {title: run.name})
  core.setFailed(`Workflow "${run.name}" was finished with unexpected status "${run.conclusion}"`)
  process.exit(1)
}

core.saveState('status', 'success')

core.notice('Workflow was finished successfully', {title: run.name})

async function runWorkflow(workflowId) {
  await octokit.rest.actions.createWorkflowDispatch({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    workflow_id: workflowId,
    ref,
    inputs: inputs ? JSON.parse(inputs) : undefined
  })

  let run

  while (!['queued', 'in_progress'].includes(run?.status)) {
    await setTimeout(3000)
  
    const response = await octokit.rest.actions.listWorkflowRuns({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      workflow_id: workflowId,
      per_page: 1
    })

    run = response.data.workflow_runs[0]
  }

  return run
}

async function waitForWorkflowCompleted(run) {
  while (run.status !== 'completed') {
    await setTimeout(3000)

    const response = await octokit.rest.actions.getWorkflowRunAttempt({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      run_id: run.id,
      attempt_number: run.run_attempt,
    })

    run = response.data
  }

  return run
}

