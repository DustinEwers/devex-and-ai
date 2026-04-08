using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;

namespace Cheersly.Api.Services;

/// <summary>
/// Transforms claims from Entra ID tokens to ensure role claims are properly mapped.
/// Maps the "roles" claim (which can be a JSON array or single string) to ClaimsIdentity role claims.
/// </summary>
public class EntraClaimsTransformer : IClaimsTransformation
{
    public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        var claimsIdentity = principal.Identity as ClaimsIdentity;
        if (claimsIdentity == null || !claimsIdentity.IsAuthenticated)
        {
            return Task.FromResult(principal);
        }

        // The roles claim may already be mapped by TokenValidationParameters.RoleClaimType
        // This transformer is a fallback/additional normalization step
        // In case roles come in as "roles" claims, ensure they're added to the identity

        var roleClaims = principal.FindAll("roles").ToList();
        if (roleClaims.Any())
        {
            var newIdentity = new ClaimsIdentity(claimsIdentity.Claims, claimsIdentity.AuthenticationType, 
                claimsIdentity.NameClaimType, ClaimTypes.Role);
            
            foreach (var roleClaim in roleClaims)
            {
                // Add role claim with standard ClaimTypes.Role type
                if (!newIdentity.HasClaim(ClaimTypes.Role, roleClaim.Value))
                {
                    newIdentity.AddClaim(new Claim(ClaimTypes.Role, roleClaim.Value));
                }
            }
            
            return Task.FromResult(new ClaimsPrincipal(newIdentity));
        }

        return Task.FromResult(principal);
    }
}
