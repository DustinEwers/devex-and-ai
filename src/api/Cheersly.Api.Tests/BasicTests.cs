namespace Cheersly.Api.Tests;

[TestClass]
public class BasicTests
{
    [TestMethod]
    public void BasicTest_ShouldPass()
    {
        // Simple test to verify MSTest is working
        Assert.AreEqual(1, 1);
        Assert.IsTrue(true);
        Assert.IsNotNull("test");
    }
}