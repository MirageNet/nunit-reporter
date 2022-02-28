import * as core from "@actions/core";
import { readResults, Annotation } from "./nunit";
import { countReset } from "console";
import * as annotations from "./annotations";

function generateSummary(annotation: Annotation): string {
  return `* ${annotation.title}\n   ${annotation.message}`;
}

async function run(): Promise<void> {
  try {
    const path = core.getInput("path");
    const numFailures = parseInt(core.getInput("numFailures"));
    const title = core.getInput("reportTitle");

    const results = await readResults(path);

    const summary =
      results.failed > 0
        ? `${results.failed} tests failed`
        : `${results.passed} tests passed`;

    let details =
      results.failed === 0
        ? `** ${results.passed} tests passed**`
        : `
**${results.passed} tests passed**
**${results.failed} tests failed**
`;
    core.startGroup("Test Report for ${title}");

    core.info(summary);

    for (const ann of results.annotations) {
      const annStr = generateSummary(ann);
      const newDetails = `${details}\n${annStr}`;
      if (newDetails.length > 65000) {
        details = `${details}\n\n ... and more.`;
        break;
      } else {
        details = newDetails;
      }
    }
    core.info(details);

    for (let testResult of results.annotations.slice(0, numFailures)) {
      annotations.annotate(testResult);
    }

    /*
    await octokit.checks.create({
      head_sha: (pr && pr["head"] && pr["head"].sha) || context.sha,
      name: `Tests Report: ${title}`,
      owner: context.repo.owner,
      repo: context.repo.repo,
      status: "completed",
      conclusion:
        results.failed > 0 || results.passed === 0 ? "failure" : "success",
      output: {
        title,
        summary,
        annotations: results.annotations.slice(0, numFailures),
        text: details,
      },
    });
    */

    core.endGroup();
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
