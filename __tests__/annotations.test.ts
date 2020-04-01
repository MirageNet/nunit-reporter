import { testCaseAnnotation, parseNunit, Annotation, TestResult, readResults } from '../src/nunit'
import parser from 'xml2json';
import { promises as fs } from "fs";

test('parse TestCase', async () => {

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
    const testCase: any = parser.toJson(data, { object: true });

    const annotation = testCaseAnnotation(testCase['test-case']);

    expect(annotation).toBeTruthy();

    expect(annotation?.path).toBe("Assets/Mirror/Tests/Editor/NetworkIdentityTests.cs");
    expect(annotation?.start_line).toBe(895);
    expect(annotation?.end_line).toBe(895);
    expect(annotation?.message).toBe("Failed test ServerUpdate in Mirror.Tests.NetworkIdentityTests\nExpected: 1\n  But was:  0")
    expect(annotation?.annotation_level).toBe('failure');

})

test('parse Passed', async () => {

    const data = `
                <test-case id="1480" name="ServerUpdate" fullname="Mirror.Tests.NetworkIdentityTests.ServerUpdate" methodname="ServerUpdate" classname="Mirror.Tests.NetworkIdentityTests" runstate="Runnable" seed="1748324986" result="Passed" start-time="2020-03-22 14:13:33Z" end-time="2020-03-22 14:13:33Z" duration="0.052314" asserts="0">
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
    const testCase: any = parser.toJson(data, { object: true });

    const annotation = testCaseAnnotation(testCase['test-case']);

    expect(annotation).toBeNull();
})


test('parse Results', async () => {

    const data = await fs.readFile("__tests__/editmode-results.xml", 'utf8')

    const results = parseNunit(data);
    expect(results.passed).toBe(332);
    expect(results.failed).toBe(1);

    expect(results.annotations).toEqual(
        [ new Annotation("Assets/Mirror/Tests/Editor/NetworkIdentityTests.cs", 895, 895, 0,0,'failure', "Failed test ServerUpdate in Mirror.Tests.NetworkIdentityTests\nExpected: 1\n  But was:  0" )]
    )
});

test('parse all Results', async () => {

    var results = await readResults("__tests__/*.xml");

    expect(results.annotations).toEqual(
        [ 
            new Annotation(
                "Assets/Mirror/Tests/Editor/NetworkIdentityTests.cs", 
                895, 
                895, 
                0,
                0,
                'failure', 
                "Failed test ServerUpdate in Mirror.Tests.NetworkIdentityTests\nExpected: 1\n  But was:  0" ),
            new Annotation(
                "Assets/Mirror/Runtime/NetworkServer.cs", 
                448, 
                448, 
                0,
                0,
                'failure', 
                "Failed test ConnectedClientTest in Mirror.Tests.NetworkManagerTest\nUnhandled log message: '[Exception] Exception: Already listening'. Use UnityEngine.TestTools.LogAssert.Expect" ),
            new Annotation(
                "Assets/Mirror/Runtime/Transport/Tcp/Server.cs", 
                88, 
                88, 
                0,
                0,
                'failure', "Failed test ConnectedClientUriTest in Mirror.Tests.NetworkManagerTest\nUnhandled log message: '[Exception] SocketException: Address already in use'. Use UnityEngine.TestTools.LogAssert.Expect" ),
            new Annotation(
                "Assets/Mirror/Runtime/Transport/Tcp/Server.cs", 
                88, 
                88, 
                0,
                0,
                'failure', 
                "Failed test ConnectedHostTest in Mirror.Tests.NetworkManagerTest\nUnhandled log message: '[Exception] SocketException: Address already in use'. Use UnityEngine.TestTools.LogAssert.Expect" ),
        ]
    )
});