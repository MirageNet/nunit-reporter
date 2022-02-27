import {create} from '@actions/glob'
import {promises as fs} from 'fs'
import {parseNunit as parseV1, isV1} from './v1'
import {parseNunit as parseV2, isV2} from './v2'
import {TestResult} from './data'
import {parseStringPromise} from 'xml2js'

function combine(result1: TestResult, result2: TestResult): TestResult {
  const passed = result1.passed + result2.passed
  const failed = result1.failed + result2.failed
  const annotations = result1.annotations.concat(result2.annotations)

  return new TestResult(passed, failed, annotations)
}

export async function parseNunit(data: string): Promise<TestResult> {
  const report: any = await parseStringPromise(data, {
    trim: true,
    mergeAttrs: true,
    explicitArray: false
  })

  if (isV1(report)) {
    return await parseV1(report)
  } else if (isV2(report)) {
    return await parseV2(report)
  } else {
    throw new Error('unsupported xml format')
  }
}

async function* resultGenerator(path: string): AsyncGenerator<TestResult> {
  const globber = await create(path, {followSymbolicLinks: false})

  for await (const file of globber.globGenerator()) {
    const data = await fs.readFile(file, 'utf8')
    try {
      const result = parseNunit(data)
      yield result
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`failed to process report '${file}': ${err.message}`)
    }
  }
}

export async function readResults(path: string): Promise<TestResult> {
  let results = new TestResult(0, 0, [])

  for await (const result of resultGenerator(path))
    results = combine(results, result)

  return results
}
