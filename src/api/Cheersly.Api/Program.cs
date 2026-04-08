using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Cheersly.Api.Data;
using Cheersly.Api.Middleware;
using Cheersly.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Add controllers
builder.Services.AddControllers();

// Configure CORS for the frontend application
var allowedFrontendOrigins = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
{
    "http://localhost:3000",
    "http://localhost:5173"
};

var configuredFrontendOrigin = builder.Configuration["Frontend:Url"]
    ?? builder.Configuration["Cors:FrontendUrl"];

if (!string.IsNullOrWhiteSpace(configuredFrontendOrigin))
{
    allowedFrontendOrigins.Add(configuredFrontendOrigin);
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend",
        policy => policy
            .WithOrigins(allowedFrontendOrigins.ToArray())
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

// Configure database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<CheerslyDbContext>(options =>
{
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        // Note: EnableRetryOnFailure conflicts with transactions used by SaveChangesAsync
        // For production, consider implementing retry logic at the service layer instead
        npgsqlOptions.CommandTimeout(30);
    });
});

// Configure authentication using Entra (Azure AD) settings from configuration (section: Entra)
var configuration = builder.Configuration;
var entraSection = configuration.GetSection("Entra");
var authority = entraSection["Authority"];
var audience = entraSection["Audience"] ?? entraSection["ClientId"];
var tenantId = entraSection["TenantId"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var validAudiences = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
    var validIssuers = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

    if (!string.IsNullOrEmpty(authority))
    {
        options.Authority = authority;
        validIssuers.Add(authority.TrimEnd('/'));
    }

    if (!string.IsNullOrEmpty(audience))
    {
        validAudiences.Add(audience);

        if (!audience.StartsWith("api://", StringComparison.OrdinalIgnoreCase))
        {
            validAudiences.Add($"api://{audience}");
        }
    }

    if (!string.IsNullOrEmpty(tenantId))
    {
        validIssuers.Add($"https://login.microsoftonline.com/{tenantId}");
        validIssuers.Add($"https://login.microsoftonline.com/{tenantId}/v2.0");
        validIssuers.Add($"https://sts.windows.net/{tenantId}/");
    }

    var tokenValidationParameters = new TokenValidationParameters
    {
        RoleClaimType = "roles",
        NameClaimType = ClaimTypes.Name
    };

    if (validAudiences.Count > 0)
    {
        tokenValidationParameters.ValidAudiences = validAudiences.ToArray();
    }

    if (validIssuers.Count > 0)
    {
        tokenValidationParameters.ValidIssuers = validIssuers.ToArray();
    }

    options.TokenValidationParameters = tokenValidationParameters;

    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = ctx =>
        {
            var logger = ctx.HttpContext.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("Auth");
            logger.LogWarning(ctx.Exception, "Authentication failed: {Message}", ctx.Exception.Message);
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            // Suppress the default WWW-Authenticate header details in production logs
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("Auth");
            logger.LogInformation("Authentication challenge: {Error}, {ErrorDescription}", context.Error, context.ErrorDescription);
            return Task.CompletedTask;
        }
    };
});

// Add authorization and a sample admin policy
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdmin", policy => policy.RequireRole("Admin"));
});

// Claims transformer: normalize Entra role claims into ClaimsIdentity role claims
builder.Services.AddScoped<Microsoft.AspNetCore.Authentication.IClaimsTransformation, EntraClaimsTransformer>();

// Register services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICheerService, CheerService>();
builder.Services.AddScoped<IStoreService, StoreService>();
builder.Services.AddScoped<IAdminStoreService, AdminStoreService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<CheerslyDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");

    try
    {
        await dbContext.Database.MigrateAsync();
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to apply database migrations at startup");
        throw;
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

// Sync authenticated users to database
app.UseUserSync();

// Map controllers
app.MapControllers();

//app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", (ClaimsPrincipal user) =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return Results.Ok(new { user = user.Identity?.Name, forecast });
})
.WithName("GetWeatherForecast")
.RequireAuthorization();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

// Make Program accessible to test projects
public partial class Program { }
