# Product Catalog

A small full-stack CRUD application: an ASP.NET Core Web API backend (.NET 8, EF
Core, SQL Server) and an Angular 18 frontend. Products can be listed, created,
edited, and deleted.

## Architecture

The backend is a single Web API project with clear layer separation, wired
together through interfaces and dependency injection:

```
Controller  ->  Service (business logic)  ->  Repository (data access)  ->  EF Core / SQL Server
```

- **Controllers** stay thin: they translate HTTP to service calls and map
  results to status codes.
- **Services** own the business logic (timestamps, orchestration) and speak in
  DTOs, never exposing the entity to the outside.
- **Repositories** own data access behind `IProductRepository`, so the service
  layer never depends on EF Core directly and is straightforward to unit test.
- **Mapping** between entities and DTOs is hand-written in `ProductMapper`.

This is deliberately layered but not over-built. For a single-entity CRUD,
patterns like CQRS/MediatR or a generic repository would add ceremony without
value; the structure here scales to more entities by adding the same four small
pieces per entity, and splits cleanly into separate projects later if needed.

## Why these libraries

- **EF Core (SqlServer + Design)** — the data access itself. Hand-rolling ADO.NET
  for standard CRUD would be more code for no benefit.
- **Swashbuckle** — Swagger UI in development, so the API is explorable without
  a separate client.

No AutoMapper (mapping is trivial and explicit is clearer), no MediatR, no
FluentValidation — DataAnnotations on the DTOs cover validation here.

## Prerequisites

- .NET 8 SDK
- Node.js 18+ and the Angular CLI (`npm install -g @angular/cli`)
- SQL Server. The default connection string targets a local instance on
  `localhost,1433` with SQL auth. The quickest cross-platform option is Docker:

  ```bash
  docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=Your_password123" \
    -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
  ```

  On Windows you can instead use LocalDB by changing the connection string in
  `appsettings.json` to:
  `Server=(localdb)\\MSSQLLocalDB;Database=ProductCatalog;Trusted_Connection=True`

## Running the backend

```bash
cd backend/src/ProductCatalog.Api

# one-time: install the EF Core CLI if you don't have it
dotnet tool install --global dotnet-ef

# create the initial migration (the app applies migrations on startup)
dotnet ef migrations add InitialCreate

dotnet run
```

The API starts on `http://localhost:5080` with Swagger at
`http://localhost:5080/swagger`. Migrations are applied automatically on
startup, so once the migration exists the schema is created for you.

## Running the frontend

```bash
cd frontend
npm install
npm start
```

The app runs on `http://localhost:4200` and talks to the API at the URL in
`src/environments/environment.ts`. CORS on the backend already allows the Angular
dev origin.

## API

| Method | Route                | Description        |
|--------|----------------------|--------------------|
| GET    | `/api/products`      | List all products  |
| GET    | `/api/products/{id}` | Get one product    |
| POST   | `/api/products`      | Create a product   |
| PUT    | `/api/products/{id}` | Update a product   |
| DELETE | `/api/products/{id}` | Delete a product   |

## Adding SSO (optional task)

The clean seam for authentication is `Program.cs`. To add OpenID Connect:

1. Register an app with an identity provider. The brief suggests ADFS, but ADFS
   needs Windows Server + Active Directory, which is heavy to stand up locally.
   Keycloak or Duende IdentityServer in Docker give the same OIDC flow with far
   less setup and are simple to justify.
2. Add `Microsoft.AspNetCore.Authentication.JwtBearer`, configure the authority
   and audience, and call `AddAuthentication().AddJwtBearer(...)`.
3. Add `app.UseAuthentication()` before `app.UseAuthorization()`, and protect
   controllers with `[Authorize]`.
4. On the Angular side, add an HTTP interceptor that attaches the access token
   (e.g. via `angular-oauth2-oidc`).

## Note

These files were authored by hand and not compiled in the environment they were
generated in. Run `dotnet restore` / `npm install` locally to pull dependencies
before first build.
