# Microsoft Entra Authentication Setup for Cheersly API

This document provides step-by-step instructions for configuring Microsoft Entra ID (formerly Azure Active Directory) authentication for the Cheersly API.

## Overview

The Cheersly API uses JWT Bearer token authentication with Microsoft Entra ID. This allows secure, role-based access control (RBAC) for API endpoints with support for both single-tenant and multi-tenant scenarios.

## Prerequisites

- Azure subscription with access to Microsoft Entra ID
- Permissions to register applications in Entra (Application Administrator or Global Administrator role)
- .NET 10.0 SDK installed
- Access to the Cheersly API codebase

## App Registration Steps

### 1. Register the API Application in Entra

1. Navigate to the [Azure Portal](https://portal.azure.com)
2. Go to **Microsoft Entra ID** > **App registrations** > **New registration**
3. Configure the registration:
   - **Name**: `Cheersly API` (or your preferred name)
   - **Supported account types**: 
     - Single tenant (for organization-only access)
     - Multitenant (if supporting multiple organizations)
   - **Redirect URI**: Leave blank (not needed for API)
4. Click **Register**

### 2. Note Your Application Details

After registration, record these values (you'll need them for configuration):

- **Application (client) ID**: Found on the app's Overview page
- **Directory (tenant) ID**: Found on the app's Overview page
- **Authority URL**: `https://login.microsoftonline.com/{tenant-id}/v2.0`

### 3. Configure App Roles (Optional but Recommended)

To support Admin vs Normal user roles:

1. In your app registration, go to **App roles** > **Create app role**
2. Create an "Admin" role:
   - **Display name**: Admin
   - **Allowed member types**: Users/Groups
   - **Value**: `Admin`
   - **Description**: Administrator access to the Cheersly API
3. Create a "Normal" role:
   - **Display name**: Normal User
   - **Allowed member types**: Users/Groups
   - **Value**: `Normal`
   - **Description**: Standard user access to the Cheersly API
4. Click **Apply**

### 4. Expose an API Scope (for Frontend Integration)

1. Go to **Expose an API**
2. Click **Add a scope**
3. Accept the default Application ID URI (`api://{client-id}`) or customize it
4. Configure the scope:
   - **Scope name**: `user_impersonation`
   - **Who can consent**: Admins and users
   - **Admin consent display name**: Access Cheersly API
   - **Admin consent description**: Allows the app to access the Cheersly API on behalf of the signed-in user
   - **User consent display name**: Access Cheersly API
   - **User consent description**: Allow this app to access the Cheersly API on your behalf
   - **State**: Enabled
5. Click **Add scope**

### 5. Assign Users to Roles

1. Go to **Enterprise applications** (not App registrations)
2. Find your "Cheersly API" app
3. Go to **Users and groups** > **Add user/group**
4. Select users and assign them to the Admin or Normal role
5. Click **Assign**

## API Configuration

### Environment Variables

The API requires the following configuration values. Set these in your environment or configuration system.

#### Development (appsettings.Development.json)

```json
{
  "Entra": {
    "TenantId": "your-tenant-id-guid",
    "ClientId": "your-api-client-id-guid",
    "Authority": "https://login.microsoftonline.com/your-tenant-id-guid/v2.0",
    "Audience": "api://your-api-client-id-guid"
  }
}
```

#### Production (Environment Variables or Azure Key Vault)

**Never commit secrets to source control.** Use environment variables or Azure Key Vault:

- `Entra__TenantId` - Your Entra tenant ID
- `Entra__ClientId` - Your API application (client) ID
- `Entra__Authority` - `https://login.microsoftonline.com/{tenant-id}/v2.0`
- `Entra__Audience` - `api://{client-id}` or your custom audience

**Note**: For multi-tenant apps, use `common` instead of the tenant ID in the Authority URL.

### Configuration Examples

**Single-tenant (recommended for most scenarios):**
```json
{
  "Entra": {
    "TenantId": "12345678-1234-1234-1234-123456789012",
    "ClientId": "87654321-4321-4321-4321-210987654321",
    "Authority": "https://login.microsoftonline.com/12345678-1234-1234-1234-123456789012/v2.0",
    "Audience": "api://87654321-4321-4321-4321-210987654321"
  }
}
```

**Multi-tenant:**
```json
{
  "Entra": {
    "TenantId": "common",
    "ClientId": "87654321-4321-4321-4321-210987654321",
    "Authority": "https://login.microsoftonline.com/common/v2.0",
    "Audience": "api://87654321-4321-4321-4321-210987654321"
  }
}
```

## Testing the Integration

### 1. Build and Run the API

```bash
cd /workspaces/cheersly/src/api/Cheersly.Api
dotnet run
```

The API will start (typically on `https://localhost:5001` or `http://localhost:5000`).

### 2. Run Integration Tests

```bash
cd /workspaces/cheersly/src/api/Cheersly.Api.Tests
dotnet test
```

The test suite includes:
- Valid token authentication
- Missing token (401 response)
- Expired token (401 response)
- Admin role authorization

### 3. Obtain a Test Token

To test manually, you need a valid access token. Options:

**Option A: Use a tool like Postman**
1. Create a new request
2. Go to Authorization tab
3. Select OAuth 2.0
4. Configure:
   - Grant Type: Authorization Code (with PKCE)
   - Auth URL: `https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/authorize`
   - Access Token URL: `https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token`
   - Client ID: Your API client ID
   - Scope: `api://{client-id}/user_impersonation`
5. Get new token and copy it

**Option B: Use Azure CLI**
```bash
# Login
az login --tenant {tenant-id}

# Get token for API
az account get-access-token --resource api://{client-id}
```

### 4. Test the Endpoint

```bash
# Replace {token} with your actual token
curl -H "Authorization: Bearer {token}" https://localhost:5001/weatherforecast
```

Expected response:
- **200 OK** with weather data if token is valid
- **401 Unauthorized** if token is missing or invalid
- **403 Forbidden** if accessing an admin endpoint without Admin role

## Troubleshooting

### Issue: 401 Unauthorized with valid token

**Possible causes:**
- Token audience doesn't match configured `Audience`
- Token issuer doesn't match configured `Authority`
- Token has expired

**Debug steps:**
1. Decode the JWT at [jwt.ms](https://jwt.ms)
2. Verify `aud` (audience) claim matches your `Entra:Audience` config
3. Verify `iss` (issuer) claim matches your `Entra:Authority`
4. Check `exp` (expiration) claim is in the future

### Issue: Claims/roles not recognized

**Possible causes:**
- Users not assigned to app roles in Enterprise Applications
- Role claims not present in token

**Debug steps:**
1. Decode token and check for `roles` claim
2. Verify user is assigned to a role in Enterprise Applications > Users and groups
3. Check that `RoleClaimType` is set to `"roles"` in `Program.cs`

### Issue: CORS errors when calling from frontend

**Solution:**
Add CORS configuration in `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("https://localhost:5173") // Frontend URL
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// In Configure section
app.UseCors();
```

### Issue: Metadata endpoint unreachable

**Possible causes:**
- Firewall blocking access to `login.microsoftonline.com`
- Network proxy required

**Debug steps:**
1. Test endpoint manually: `https://login.microsoftonline.com/{tenant-id}/v2.0/.well-known/openid-configuration`
2. Configure proxy if needed in environment or `HttpClient` configuration

## Security Best Practices

1. **Always use HTTPS in production** - Token interception on HTTP is a critical security risk
2. **Never commit secrets** - Use environment variables, Key Vault, or secure CI/CD secrets
3. **Rotate keys regularly** - Entra handles JWT signing key rotation automatically
4. **Validate token claims** - Always validate issuer, audience, and expiration
5. **Use least-privilege roles** - Assign users the minimum role needed
6. **Monitor auth failures** - Set up alerts for unusual 401/403 patterns
7. **Keep packages updated** - Regularly update Microsoft.AspNetCore.Authentication.JwtBearer and related packages

## References

- [Microsoft Identity Platform Documentation](https://learn.microsoft.com/azure/active-directory/develop/)
- [JWT Bearer Authentication in ASP.NET Core](https://learn.microsoft.com/aspnet/core/security/authentication/)
- [Cheersly API Spec: Backend Entra Auth](/workspaces/cheersly/spec/spec-infrastructure-microsoft-entra-auth.md)
- [Cheersly Frontend Spec: Entra SSO](/workspaces/cheersly/spec/spec-infrastructure-frontend-microsoft-entra-auth.md)

## Support

For issues or questions:
1. Check logs in the API for detailed error messages
2. Review the [Troubleshooting](#troubleshooting) section above
3. Consult the specification files in `/spec/`
4. Review Microsoft Identity Platform documentation
