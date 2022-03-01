using System;
using NUnit.Framework;

namespace nunit_reporter
{
    public class Tests
    {
        [SetUp]
        public void Setup()
        {
        }

        [Test]
        public void PassingTest()
        {
            Assert.Pass();
        }

        [Test]
        public void FailingTest()
        {
            Assert.Fail("This test should fail");
        }

        [Test]
        public void TestWithException()
        {
            throw new InvalidOperationException("Some error happened");
        }
    }
}