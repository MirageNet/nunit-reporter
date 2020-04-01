import {setFailed, getInput} from '@actions/core'
import {GitHub, context} from '@actions/github'
import {readResults} from './nunit'

async function run(): Promise<void> {
  try {
    const path = getInput('path')
    const numFailures = parseInt(getInput('numFailures'))
    const accessToken = getInput('access-token')

    const results = await readResults(path)

    const octokit = new GitHub(accessToken)

    const summary =
      results.failed > 0
        ? `${results.failed} tests failed`
        : `${results.passed} tests passed`

    await octokit.checks.create({
      head_sha: context.sha,
      name: 'Tests',
      owner: context.repo.owner,
      repo: context.repo.repo,
      status: 'completed',
      conclusion: results.failed > 0 ? 'failure' : 'success',
      output: {
        title: 'Test Results',
        summary,
        annotations: results.annotations.slice(0, numFailures)
      }
    })
  } catch (error) {
    setFailed(error.message)
  }
}

run()
