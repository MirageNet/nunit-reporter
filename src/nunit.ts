import parser from 'xml2json'
import {create} from '@actions/glob'
import {promises as fs} from 'fs'
import github from '@actions/github';


export class Annotation {
  public constructor(
    public readonly path: string,
    public readonly start_line: number,
    public readonly end_line: number,
    public readonly start_column: number,
    public readonly end_column: number,
    public readonly annotation_level: "failure" | "notice" | "warning",
    public readonly message: string
  ) {}
}

function getLocation(stacktrace: string): [string, number] {
  // assertions stack traces
  const matches = stacktrace.matchAll(/in (.*):(\d+)/g)

  for (const match of matches) {
    const lineNo = parseInt(match[2])
    if (lineNo !== 0) return [match[1], lineNo]
  }

  // exceptions stack traces
  const matches2 = stacktrace.matchAll(/\(at (.*):(\d+)\)/g)

  for (const match of matches2) {
    const lineNo = parseInt(match[2])
    if (lineNo !== 0) return [match[1], lineNo]
  }

  return ['', 0]
}

export function testCaseAnnotation(testcase: any): Annotation | null {
  if (testcase.result === 'Failed') {
    const [filename, lineno] = getLocation(testcase.failure['stack-trace'])

    const sanitizedFilename = filename.replace(/^\/github\/workspace\//, '')
    const message = testcase.failure.message
    const classname = testcase.classname
    const methodname = testcase.methodname

    return new Annotation(
      sanitizedFilename,
      lineno,
      lineno,
      0,
      0,
      "failure",
      `Failed test ${methodname} in ${classname}\n${message}`
    )
  }
  return null
}

export class TestResult {
  public constructor(
    public readonly passed: number,
    public readonly failed: number,
    public readonly annotations: Annotation[]
  ) {}
}

function getTestCasesAnnotations(testsuite: any): Annotation[] {
  if ('test-case' in testsuite) {
    const testCases = testsuite['test-case']

    const annotations = Array.isArray(testCases)
      ? testCases.map(testCaseAnnotation)
      : [testCaseAnnotation(testCases)]

    return annotations.filter((x): x is Annotation => x !== null)
  }
  return []
}

function getTestSuiteAnnotations(testsuite: any): Annotation[] {
  if ('test-suite' in testsuite) {
    const childsuits = testsuite['test-suite']

    const annotations = Array.isArray(childsuits)
      ? childsuits.map(getAnnotations)
      : [getAnnotations(childsuits)]

    return annotations.flat()
  }
  return []
}

function getAnnotations(testsuite: any): Annotation[] {
  const testCasesAnnotations = getTestCasesAnnotations(testsuite)

  const testSuiteAnnotations = getTestSuiteAnnotations(testsuite)

  const result = testCasesAnnotations.concat(testSuiteAnnotations)

  return result
}

export function parseNunit(nunitReport: string): TestResult {
  const nunitResults: any = parser.toJson(nunitReport, {
    object: true,
    coerce: true
  })

  const testRun = nunitResults['test-run']

  const annotations = getAnnotations(testRun)

  return new TestResult(testRun.passed, testRun.failed, annotations)
}

function combine(result1: TestResult, result2: TestResult): TestResult {
  const passed = result1.passed + result2.passed
  const failed = result1.failed + result2.failed
  const annotations = result1.annotations.concat(result2.annotations)

  return new TestResult(passed, failed, annotations)
}

async function* resultGenerator(path: string): AsyncGenerator<TestResult> {
  const globber = await create(path, {followSymbolicLinks: false})

  for await (const file of globber.globGenerator()) {
    const data = await fs.readFile(file, 'utf8')
    yield parseNunit(data)
  }
}

export async function readResults(path: string): Promise<TestResult> {
  const results: TestResult[] = []
  for await (const result of resultGenerator(path)) results.push(result)

  return results.reduce(combine)
}
