import {setFailed, getInput} from '@actions/core'
import {GitHub, context} from '@actions/github'
import {readResults, Annotation} from './nunit'

function failDetails(annotations: Annotation[]) : string
{
  return annotations.map(n => `${n.messageformatted}`).join("\n\n");
}

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

    const details = results.failed > 0 ?
    `** ${results.passed} tests passed**`
    :`
**${results.passed} tests passed**
**${results.failed} tests failed**
# Failed Tests
${failDetails(results.annotations)}
`

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
        annotations: results.annotations.slice(0, numFailures),
        text : details
      }
    })
  } catch (error) {
    setFailed(error.message)
  }
}

run()
