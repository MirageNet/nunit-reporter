import {parseStringPromise} from 'xml2js'
import {promises as fs} from 'fs'
import {parseNunit, readResults} from '../src/nunit/index'
import {testCaseAnnotation} from '../src/nunit/v1'

test('parse v1 TestCase', async () => {
  const data = `
                <test-case id="1480" name="ServerUpdate" fullname="Mirror.Tests.NetworkIdentityTests.ServerUpdate" methodname="ServerUpdate" classname="Mirror.Tests.NetworkIdentityTests" runstate="Runnable" seed="1748324986" result="Failed" start-time="2020-03-22 14:13:33Z" end-time="2020-03-22 14:13:33Z" duration="0.052314" asserts="0">
    <properties />
    <failure>
      <message><![CDATA[  Expected: 1
  But was:  0
  ]]></message>
      <stack-trace><![CDATA[at Mirror.Tests.NetworkIdentityTests.ServerUpdate () [0x00194] in /github/workspace/Assets/Mirror/Tests/Editor/NetworkIdentityTests.cs:895
  ]]></stack-trace>
    </failure>
    <output><![CDATA[You are trying to create a MonoBehaviour using the 'new' keyword.  This is not allowed.  MonoBehaviours can only be added using AddComponent(). Alternatively, your script can inherit from ScriptableObject or no base class at all
  Closing connection: connection(0). Received message Mirror.UpdateVarsMessage that required authentication, but the user has not authenticated yet
  Closing connection: connection(0). Received message Mirror.UpdateVarsMessage that required authentication, but the user has not authenticated yet
  ]]></output>
  </test-case>
  `
  const testCase: any = await parseStringPromise(data, {
    trim: true,
    mergeAttrs: true,
    explicitArray: false
  })

  const annotation = testCaseAnnotation(testCase['test-case'])

  expect(annotation).toBeTruthy()

  expect(annotation.path.replace(/\\/g, '/')).toContain(
    'Assets/Mirror/Tests/Editor/NetworkIdentityTests.cs'
  )
  expect(annotation.start_line).toBe(895)
  expect(annotation.end_line).toBe(895)
  expect(annotation.title).toBe(
    'Failed test ServerUpdate in Mirror.Tests.NetworkIdentityTests'
  )
  expect(annotation.message).toBe('Expected: 1\n  But was:  0')
  expect(annotation.annotation_level).toBe('failure')
})

test('parse v1 Results', async () => {
  const data = await fs.readFile('__tests__/editmode-results.xml', 'utf8')

  const results = await parseNunit(data)
  expect(results.passed).toBe(332)
  expect(results.failed).toBe(1)

  const annotation = results.annotations[0]
  expect(annotation.path.replace(/\\/g, '/')).toContain(
    'Assets/Mirror/Tests/Editor/NetworkIdentityTests.cs'
  )
  expect(annotation.start_line).toBe(895)
  expect(annotation.end_line).toBe(895)
  expect(annotation.title).toBe(
    'Failed test ServerUpdate in Mirror.Tests.NetworkIdentityTests'
  )
  expect(annotation.message).toBe('Expected: 1\n  But was:  0')
  expect(annotation.annotation_level).toBe('failure')
})

test('parse v2 Results', async () => {
  const data = await fs.readFile('__tests__/failed-results-v2.xml', 'utf8')

  const results = await parseNunit(data)

  expect(results.passed).toBe(137)
  expect(results.failed).toBe(10)
  expect(results.annotations.length).toBe(10)

  const annotation = results.annotations[0]
  expect(annotation).toMatchInlineSnapshot(`
    Annotation {
      "annotation_level": "failure",
      "end_column": 0,
      "end_line": 0,
      "message": "RemoteException: verbose: using stderr for log output",
      "path": "unknown",
      "raw_details": "at Invoke, D:\\\\a\\\\ps-csproj\\\\ps-csproj\\\\src\\\\process\\\\process.psm1:238
    at <ScriptBlock>, D:\\\\a\\\\ps-csproj\\\\ps-csproj\\\\test\\\\process.tests.ps1:17",
      "start_column": 0,
      "start_line": 0,
      "title": "Failed test 'long messages does not break output' in 'Processing output from invoke.long messages does not break output'",
    }
  `)
})

test('parse all Results', async () => {
  var results = await readResults('__tests__/*.xml')

  expect(results.annotations).toHaveLength(16)
})
