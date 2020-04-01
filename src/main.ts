
import {setFailed, getInput} from '@actions/core';
import {GitHub, context} from '@actions/github';
import { readResults, Annotation } from './nunit';

async function run(): Promise<void> {
  try {
    const path = getInput('path');
    const numFailures = parseInt(getInput('numFailures'));
    const accessToken = getInput('access-token');

    const results = await readResults(path);

    const octokit = new GitHub(accessToken);
    const req = {
      ...context.repo,
      ref: context.sha
    }
    const res = await octokit.checks.listForRef(req);

    const check_run_id = res.data.check_runs.filter(check => check.name === 'build')[0].id
    
    const annotation_level = results.failed > 0 ? 'failure' : 'notice';
    const annotation = new Annotation(
      'test',
      0,
      0,
      0,
      0,
      annotation_level,
      `Passed tests ${results.passed}\nFailed tests ${results.failed}`);

    await octokit.checks.update({
      ...context.repo,
      check_run_id,
      output: {
        title: "Test Results",
        summary: `Num passed etc`,
        annotations: [annotation, ...results.annotations].slice(0, numFailures)
      }
    });

  } catch (error) {
    setFailed(error.message);
  }
}

run();

