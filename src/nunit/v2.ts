import {TestResult, Annotation, sanitizePath, getLocation} from './data'

export function getTestCases(testsuite: any): any[] {
  let testCases = []

  if ('test-suite' in testsuite) {
    const childsuits = testsuite['test-suite']

    const childsuitCases = Array.isArray(childsuits)
      ? childsuits.map(c => getTestCases(c['results']))
      : [getTestCases(childsuits['results'])]

    testCases = childsuitCases.flat()
  }

  if ('test-case' in testsuite) {
    const childcases = testsuite['test-case']

    if (Array.isArray(childcases)) testCases = testCases.concat(childcases)
    else testCases.push(childcases)
  }

  return testCases
}

export function isV2(nunitResults: any): boolean {
  return !!nunitResults['test-results']
}

export async function parseNunit(nunitResults: any): Promise<TestResult> {
  const testRun = nunitResults['test-results']
  const testCases = getTestCases(testRun)
  const failedCases = testCases.filter(tc => tc.result === 'Failure')
  const passedCases = testCases.filter(tc => tc.success === 'True')

  const annotations = failedCases.map(testCaseAnnotation)

  return new TestResult(passedCases.length, failedCases.length, annotations)
}

function testCaseAnnotation(testcase: any): Annotation {
  const stackTrace = testcase.failure['stack-trace']
  const [filename, lineno] = stackTrace
    ? getLocation(testcase.failure['stack-trace'])
    : ['unknown', 0]

  const sanitizedFilename = sanitizePath(filename)
  const message = testcase.failure.message

  const classname = testcase.classname || testcase.name
  const methodname = testcase.methodname || testcase.description
  const title = `Failed test '${methodname}' in '${classname}'`

  return new Annotation(
    sanitizedFilename,
    lineno,
    lineno,
    0,
    0,
    'failure',
    title,
    message,
    stackTrace.substring(0, 65536)
  )
}
