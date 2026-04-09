using System.Security.Claims;
using Cheersly.Api.Services;

namespace Cheersly.Api.Tests.Services;

[TestClass]
public class EntraClaimsTransformerTests
{
    private readonly EntraClaimsTransformer _sut = new();

    [TestMethod]
    public async Task TransformAsync_ReturnsOriginalPrincipal_WhenIdentityIsNotAuthenticated()
    {
        // Arrange
        var principal = new ClaimsPrincipal(new ClaimsIdentity());

        // Act
        var result = await _sut.TransformAsync(principal);

        // Assert
        Assert.AreSame(principal, result);
    }

    [TestMethod]
    public async Task TransformAsync_AddsStandardRoleClaims_FromRolesClaims()
    {
        // Arrange
        var claims = new[]
        {
            new Claim("roles", "Admin"),
            new Claim("roles", "Normal"),
            new Claim(ClaimTypes.Email, "user@example.com")
        };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));

        // Act
        var result = await _sut.TransformAsync(principal);

        // Assert
        var roleValues = result.FindAll(ClaimTypes.Role).Select(claim => claim.Value).ToList();
        CollectionAssert.AreEquivalent(new[] { "Admin", "Normal" }, roleValues);
    }

    [TestMethod]
    public async Task TransformAsync_DoesNotDuplicateExistingRoleClaims()
    {
        // Arrange
        var claims = new[]
        {
            new Claim(ClaimTypes.Role, "Admin"),
            new Claim("roles", "Admin")
        };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));

        // Act
        var result = await _sut.TransformAsync(principal);

        // Assert
        var roleClaims = result.FindAll(ClaimTypes.Role).ToList();
        Assert.AreEqual(1, roleClaims.Count);
        Assert.AreEqual("Admin", roleClaims[0].Value);
    }
}