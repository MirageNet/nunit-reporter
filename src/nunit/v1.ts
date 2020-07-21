import {TestResult, Annotation, sanitizePath, getLocation} from './data'

export function getTestCases(testsuite: any): any[] {
  let testCases = []

  if ('test-suite' in testsuite) {
    const childsuits = testsuite['test-suite']

    const childsuitCases = Array.isArray(childsuits)
      ? childsuits.map(getTestCases)
      : [getTestCases(childsuits)]

    testCases = childsuitCases.flat()
  }

  if ('test-case' in testsuite) {
    const childcases = testsuite['test-case']

    if (Array.isArray(childcases)) testCases = testCases.concat(childcases)
    else testCases.push(childcases)
  }

  return testCases
}

export function isV1(nunitResults: any): boolean {
  return !!nunitResults['test-run']
}

export async function parseNunit(nunitResults: any): Promise<TestResult> {
  const testRun = nunitResults['test-run']
  const testCases = getTestCases(testRun)
  const failedCases = testCases.filter(tc => tc.result === 'Failed')

  const annotations = failedCases.map(testCaseAnnotation)

  return new TestResult(
    parseInt(testRun.passed),
    parseInt(testRun.failed),
    annotations
  )
}

export function testCaseAnnotation(testcase: any): Annotation {
  const [filename, lineno] =
    'stack-trace' in testcase.failure
      ? getLocation(testcase.failure['stack-trace'])
      : ['unknown', 0]

  const sanitizedFilename = sanitizePath(filename)
  const message = testcase.failure.message
  const classname = testcase.classname
  const methodname = testcase.methodname

  const stacktrace =
    'stack-trace' in testcase.failure
      ? testcase.failure['stack-trace'].substring(0, 65536)
      : ''

  return new Annotation(
    sanitizedFilename,
    lineno,
    lineno,
    0,
    0,
    'failure',
    `Failed test ${methodname} in ${classname}`,
    message,
    stacktrace
  )
}
