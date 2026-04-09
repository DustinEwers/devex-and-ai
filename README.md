# The Post-Code Bottleneck: DevEx for the Agentic Era

## Skill Repos to Check Out
https://github.com/EveryInc/compound-engineering-plugin 
https://github.com/obra/superpowers
https://github.com/addyosmani/agent-skills
https://github.com/dotnet/skills/tree/main/plugins
https://github.com/github/awesome-copilot
https://agent-skills-hub.github.io/

Repo for OpenClaw Skills (which you can steal for your coding agents)
https://docs.openclaw.ai/tools/clawhub

## Agent Skills Definition
https://agentskills.io/home


# Demo App: Cheersly

Cheersly is a workplace recognition application where employees give cheers to coworkers using a monthly point allocation. The solution includes a React frontend, a .NET API, and PostgreSQL, with Microsoft Entra ID used for authentication.

## Tech Stack

- React 18 + Vite + TypeScript + Tailwind CSS
- .NET 10 Web API
- PostgreSQL 14
- Docker Compose for local development
- Microsoft Entra ID for sign-in and API authorization

## Repository Layout

- `src/frontend` - React frontend
- `src/api/Cheersly.Api` - .NET API
- `src/api/Cheersly.Api.Tests` - API test project
- `docker-compose.yml` - Local multi-container setup
- `docs/auth-entra.md` - Detailed Entra setup notes
- `spec/` - Project specifications

## Prerequisites

You need the following installed locally:

- Docker Desktop with Docker Compose
- Node.js 18 or later if you want to run the frontend outside Docker
- .NET 10 SDK if you want to run the API outside Docker
- An Azure subscription or Microsoft Entra tenant where you can create app registrations
- Permission to register applications in Entra ID, such as Application Developer, Application Administrator, or Global Administrator

## Local Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd devex-and-ai
```

### 2. Create the Frontend Environment File

Copy the frontend environment template:

```bash
cd src/frontend
cp .env.example .env.local
```

Update `src/frontend/.env.local` with your Microsoft Entra values:

```env
VITE_ENTRA_CLIENT_ID=<frontend-app-client-id>
VITE_ENTRA_AUTHORITY=https://login.microsoftonline.com/<tenant-id>/v2.0
VITE_ENTRA_REDIRECT_URI=http://localhost:3000/
VITE_ENTRA_API_SCOPE=api://<api-app-client-id>/user_impersonation
VITE_API_BASE_URL=http://localhost:5000
```

If you run the frontend directly with `npm run dev` instead of Docker, use `http://localhost:5173/` for `VITE_ENTRA_REDIRECT_URI`.

### 3. Configure the API Entra Settings

Update `src/api/Cheersly.Api/appsettings.Development.json` or provide equivalent environment variables:

```json
{
	"Entra": {
		"TenantId": "<tenant-id>",
		"ClientId": "<api-app-client-id>",
		"Authority": "https://login.microsoftonline.com/<tenant-id>/v2.0",
		"Audience": "api://<api-app-client-id>"
	}
}
```

When running through Docker, the API must allow the frontend origin. For the compose-based setup, set the API frontend URL to `http://localhost:3000`.

Example environment override for the API:

```env
Frontend__Url=http://localhost:3000
```

### 4. Start the Application with Docker Compose

From the repository root:

```bash
docker compose up -d --build
```

The default local endpoints are:

- Frontend: `http://localhost:3000`
- API: `http://localhost:5000`
- PostgreSQL: `localhost:5432`

To stop the stack:

```bash
docker compose down
```

### 5. Seed Test Data

The repository includes optional SQL seed scripts under `test-data/` for local development:

- `test-data/seed-store-items.sql` inserts demo users and store items.
- `test-data/seed-demo-cheers.sql` inserts 8 demo users and 40 demo cheer records for the public feed.

Run either script from the repository root by piping it into `psql` inside the running PostgreSQL container:

```powershell
Get-Content test-data/seed-store-items.sql | docker compose exec -T db psql -U postgres -d cheersly
Get-Content test-data/seed-demo-cheers.sql | docker compose exec -T db psql -U postgres -d cheersly
```

The cheer seed script is safe to rerun. It removes previously seeded demo cheers for the `@cheersly.demo.local` users, recreates the 40 demo records, and recalculates those demo users' point totals.

## Microsoft Entra App Registration

Cheersly uses two Entra app registrations:

1. An API app registration for the backend.
2. A Single-page application registration for the React frontend.

Microsoft recommends separate registrations for client apps and APIs, and recommends SPA redirect URIs for browser-based apps using the authorization code flow with PKCE.

### 1. Register the API Application

In the Microsoft Entra admin center:

1. Go to `Identity` > `Applications` > `App registrations` > `New registration`.
2. Name the app something like `Cheersly API`.
3. Choose the supported account type for your tenant. For most internal deployments, use single-tenant.
4. Leave the redirect URI empty.
5. Register the application.

Record these values from the Overview page:

- Application (client) ID
- Directory (tenant) ID

### 2. Expose the API Scope

In the API app registration:

1. Open `Expose an API`.
2. Set the Application ID URI. The default `api://<api-client-id>` is sufficient for local development.
3. Add a delegated scope with these values:
	 - Scope name: `user_impersonation`
	 - Who can consent: `Admins and users`
	 - Admin consent display name: `Access Cheersly API`
	 - Admin consent description: `Allow the application to access the Cheersly API on behalf of the signed-in user`
	 - User consent display name: `Access Cheersly API`
	 - User consent description: `Allow this app to access the Cheersly API on your behalf`
	 - State: `Enabled`

This scope becomes the value used for `VITE_ENTRA_API_SCOPE`:

```text
api://<api-app-client-id>/user_impersonation
```

### 3. Add App Roles for Authorization

In the API app registration, open `App roles` and create roles for the application. At minimum:

- `Admin`
- `Normal`

Use `Users/Groups` as the allowed member type if you want to assign roles to signed-in users.

These roles are used by the API authorization layer and are mapped from the `roles` claim.

### 4. Register the Frontend SPA Application

Create a second app registration for the React frontend:

1. Go to `Identity` > `Applications` > `App registrations` > `New registration`.
2. Name the app something like `Cheersly Frontend`.
3. Choose the same supported account type used for the API app.
4. Under Redirect URI, choose `Single-page application (SPA)`.
5. Add the local redirect URI:
	 - `http://localhost:3000/` for Docker Compose
	 - `http://localhost:5173/` if you also run Vite directly outside Docker
6. Register the application.

Record the frontend Application (client) ID.

### 5. Grant the Frontend Access to the API

In the frontend app registration:

1. Open `API permissions`.
2. Select `Add a permission`.
3. Choose `My APIs`.
4. Select the `Cheersly API` registration.
5. Choose `Delegated permissions`.
6. Select `user_impersonation`.
7. Add the permission.
8. Grant admin consent if your tenant requires it.

### 6. Assign Users to Roles

To test admin-only functionality:

1. Go to `Enterprise applications`.
2. Open the service principal for the API app.
3. Open `Users and groups`.
4. Assign users or groups to the `Admin` or `Normal` app roles.

## Configuration Reference

### Frontend Configuration

The frontend reads these values from `src/frontend/.env.local`:

| Variable | Description |
| --- | --- |
| `VITE_ENTRA_CLIENT_ID` | Frontend SPA application client ID |
| `VITE_ENTRA_AUTHORITY` | Entra authority URL, usually `https://login.microsoftonline.com/<tenant-id>/v2.0` |
| `VITE_ENTRA_REDIRECT_URI` | Registered SPA redirect URI |
| `VITE_ENTRA_API_SCOPE` | API delegated scope, usually `api://<api-client-id>/user_impersonation` |
| `VITE_API_BASE_URL` | Base URL of the backend API |

### API Configuration

The API reads these values from `src/api/Cheersly.Api/appsettings.Development.json` or environment variables:

| Key | Description |
| --- | --- |
| `Entra:TenantId` | Tenant ID |
| `Entra:ClientId` | API application client ID |
| `Entra:Authority` | Entra authority URL |
| `Entra:Audience` | Expected token audience, typically `api://<api-client-id>` |
| `Frontend:Url` or `Cors:FrontendUrl` | Allowed frontend origin for CORS |

Equivalent environment variable names:

- `Entra__TenantId`
- `Entra__ClientId`
- `Entra__Authority`
- `Entra__Audience`
- `Frontend__Url`

## Running Outside Docker

If you want to run services directly on the host:

### Frontend

```bash
cd src/frontend
npm install
npm run dev
```

### API

```bash
cd src/api/Cheersly.Api
dotnet run
```

If you use host-based frontend development, update:

- `VITE_ENTRA_REDIRECT_URI=http://localhost:5173/`
- `Frontend__Url=http://localhost:5173`

## Testing

### Frontend

```bash
cd src/frontend
npm test
```

### API

```bash
cd src/api/Cheersly.Api.Tests
dotnet test
```

## Troubleshooting

### `sh: vite: not found` in Docker

This usually means the frontend bind mount hid container-installed dependencies. The compose setup includes a dedicated volume for `/app/node_modules`. Rebuild the frontend service:

```bash
docker compose up -d --build frontend
```

### 401 or 403 from the API

Check the following:

- The frontend app registration has delegated permission to the API scope.
- `VITE_ENTRA_API_SCOPE` matches the scope exposed by the API app registration.
- `Entra:Audience` matches the token audience.
- The signed-in user is assigned the correct app role in Enterprise Applications.

### CORS errors in the browser

Ensure the API allows the same origin you are using in the browser:

- Docker frontend: `http://localhost:3000`
- Host Vite frontend: `http://localhost:5173`

### Redirect URI mismatch

Make sure the URI configured in Entra exactly matches the frontend URL used during sign-in, including scheme, host, port, and trailing slash where applicable.- [docs/auth-entra.md](docs/auth-entra.md)
- [spec/spec-infrastructure-microsoft-entra-auth.md](spec/spec-infrastructure-microsoft-entra-auth.md)
- [spec/spec-infrastructure-frontend-microsoft-entra-auth.md](spec/spec-infrastructure-frontend-microsoft-entra-auth.md)
- [src/frontend/README.md](src/frontend/README.md)

## Microsoft Learn References

- [Register an application in Microsoft Entra ID](https://learn.microsoft.com/entra/identity-platform/quickstart-register-app)
- [How to add a redirect URI to your application](https://learn.microsoft.com/entra/identity-platform/how-to-add-redirect-uri)
- [Configure an application to expose a web API](https://learn.microsoft.com/entra/identity-platform/quickstart-configure-app-expose-web-apis)
- [Configure app permissions to access a web API](https://learn.microsoft.com/entra/identity-platform/quickstart-configure-app-access-web-apis)