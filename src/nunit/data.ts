import {relative} from 'path'

export class Annotation {
  public constructor(
    public readonly path: string,
    public readonly start_line: number,
    public readonly end_line: number,
    public readonly start_column: number,
    public readonly end_column: number,
    public readonly annotation_level: 'failure' | 'notice' | 'warning',
    public readonly title: string,
    public readonly message: string,
    public readonly raw_details: string
  ) {}
}

export class TestResult {
  public constructor(
    public readonly passed: number,
    public readonly failed: number,
    public readonly annotations: Annotation[]
  ) {}
}

export function getLocation(stacktrace: string): [string, number] {
  // assertions stack traces as reported by unity
  const matches = stacktrace.matchAll(/in (.*):(\d+)/g)

  for (const match of matches) {
    const lineNo = parseInt(match[2])
    if (lineNo !== 0) return [match[1], lineNo]
  }

  // assertions stack traces as reported by dotnet
  const matches2 = stacktrace.matchAll(/in (.*):line (\d+)/g)

  for (const match of matches2) {
    const lineNo = parseInt(match[2])
    if (lineNo !== 0) return [match[1], lineNo]
  }

  // exceptions stack traces as reported by unity
  const matches3 = stacktrace.matchAll(/\(at (.*):(\d+)\)/g)

  for (const match of matches3) {
    const lineNo = parseInt(match[2])
    if (lineNo !== 0) return [match[1], lineNo]
  }

  // exceptions stack traces as reported by dotnet
  const matches4 = stacktrace.matchAll(/\(at (.*):line (\d+)\)/g)

  for (const match of matches4) {
    const lineNo = parseInt(match[2])
    if (lineNo !== 0) return [match[1], lineNo]
  }

  return ['unknown', 0]
}

export function sanitizePath(filename: string): string {
  if (filename.startsWith('/github/workspace'))
    return relative('/github/workspace', filename)
  else return relative(process.cwd(), filename).replace(/\\/g, '/')
}
