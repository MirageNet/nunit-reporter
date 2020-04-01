/*
import core from '@actions/core';
import github from '@actions/github';
import glob from '@actions/glob';
import parser from 'xml2json';
import fs from 'fs';
import { TestResult } from './nunit';


async function run(): Promise<void> {
  try {
    const path = core.getInput('path');
    const includeSummary = core.getInput('includeSummary');
    const numFailures = core.getInput('numFailures');
    const accessToken = core.getInput('access-token');
    const testSrcPath = core.getInput('testSrcPath');
    const globber = await glob.create(path, { followSymbolicLinks: false });

    let numTests = 0;
    let numSkipped = 0;
    let numFailed = 0;
    let numErrored = 0;
    let testDuration = 0;

    let annotations : Object[] = [];

    for await (const file of globber.globGenerator()) {
      const data = await fs.promises.readFile(file, "utf8");
      const results = 
      var json = parser.toJson(data, { object : true});
      if (json.testsuite) {
        const testsuite = json.testsuite;
        testDuration += Number(testsuite.time);
        numTests += Number(testsuite.tests);
        numErrored += Number(testsuite.errors);
        numFailed += Number(testsuite.failures);
        numSkipped += Number(testsuite.skipped);
        

        if (Array.isArray(testsuite.testcase)) {
          for (const testcase of testsuite.testcase) {
            await testFunction(testcase)
          }
        } else {
          //single test
          await testFunction(testsuite.testcase)
        }
      }
    }

    const octokit = new github.GitHub(accessToken);
    const req = {
      ...github.context.repo,
      ref: github.context.sha
    }
    const res = await octokit.checks.listForRef(req);

    const check_run_id = res.data.check_runs.filter(check => check.name === 'build')[0].id

    const annotation_level = numFailed + numErrored > 0 ? 'failure' : 'notice';
    const annotation = {
      path: 'test',
      start_line: 0,
      end_line: 0,
      start_column: 0,
      end_column: 0,
      annotation_level,
      message: `Junit Results ran ${numTests} in ${testDuration} seconds ${numErrored} Errored, ${numFailed} Failed, ${numSkipped} Skipped`,
    };
    // const annotation = {
    //   path: 'test',
    //   start_line: 1,
    //   end_line: 1,
    //   start_column: 2,
    //   end_column: 2,
    //   annotation_level,
    //   message: `[500] failure`,
    // };


    const update_req = {
      ...github.context.repo,
      check_run_id,
      output: {
        title: "Junit Results",
        summary: `Num passed etc`,
        annotations: [annotation, ...annotations]
      }
    }
    await octokit.checks.update(update_req);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

*/
