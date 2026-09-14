# Product Catalog

A small full-stack CRUD application secured with single sign-on. An ASP.NET Core
Web API backend (.NET 8, EF Core, SQL Server) exposes product data; an Angular 18
frontend consumes it. Authentication is delegated to Keycloak as an external
OpenID Connect provider, so every product operation requires a signed token.

## Architecture

The backend is a single Web API project with clear layer separation, wired
together through interfaces and dependency injection:

```
Controller  ->  Service (business logic)  ->  Repository (data access)  ->  EF Core / SQL Server

## Why these libraries
- **EF Core (SqlServer + Design)** — the data access itself. Hand-rolling
  ADO.NET for standard CRUD would be more code for no benefit.
- **Swashbuckle** — Swagger UI in development, so the API is explorable without a
  separate client.
- **Microsoft.AspNetCore.Authentication.JwtBearer** — validates the tokens
  Keycloak issues. The standard, framework-supported way to do JWT auth.
- **angular-oauth2-oidc** — implements the OIDC Authorization Code + PKCE flow on
  the client.

## Authentication (SSO)

Single sign-on is implemented with **Keycloak** as an external OpenID Connect
identity provider. The Angular app never handles credentials: it redirects the
user to Keycloak to log in, receives a signed JWT, and attaches it to every API
call. The backend validates that token before any product operation runs.

## Prerequisites

- .NET 8 SDK
- Node.js 18+ and the Angular CLI (`npm install -g @angular/cli`)
- Docker (for SQL Server and Keycloak)

## Running the application

Start the two containers, configure Keycloak once, then run the backend and
frontend. Order matters: the backend applies migrations on startup and the
frontend needs Keycloak reachable to log in.

### 1. SQL Server

```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=Your_password123" \
  -p 1433:1433 --name productcatalog-sql \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

The default connection string in `appsettings.json` targets this instance. On
Windows you can instead use LocalDB by changing the connection string to
`Server=(localdb)\\MSSQLLocalDB;Database=ProductCatalog;Trusted_Connection=True`.

### 2. Keycloak

```bash
docker run -d --name productcatalog-keycloak \
  -p 8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest start-dev
```

Open the admin console at `http://localhost:8080` (admin / admin) and configure:

1. **Realm** — create a realm named `productcatalog`.
2. **Client** — create an OpenID Connect client with client ID
   `productcatalog-spa`. Leave client authentication **off** (public client, so
   PKCE is used). Set:
   - Valid redirect URIs: `http://localhost:4200/*`
   - Valid post logout redirect URIs: `http://localhost:4200/*`
   - Web origins: `http://localhost:4200`
3. **User** — create a user and set a password (turn off "Temporary").

The API's `Keycloak:Authority` in `appsettings.json` points at this realm:
`http://localhost:8080/realms/productcatalog`.

### 3. Backend

```bash
cd backend/src/ProductCatalog.Api

# one-time: install the EF Core CLI if you don't have it
dotnet tool install --global dotnet-ef

# one-time: create the initial migration
dotnet ef migrations add InitialCreate

dotnet run
```

The API starts on `http://localhost:5080` with Swagger at
`http://localhost:5080/swagger`. Migrations are applied on startup, so the schema
is created once the migration exists.

### 4. Frontend

```bash
cd frontend
npm install
npm start
```

The app runs on `http://localhost:4200`. Opening it redirects to Keycloak to log
in; after logging in you land on the product list.

## API

All endpoints require a valid bearer token — calling them without one returns
`401 Unauthorized`.

| Method | Route                | Description        |
|--------|----------------------|--------------------|
| GET    | `/api/products`      | List all products  |
| GET    | `/api/products/{id}` | Get one product    |
| POST   | `/api/products`      | Create a product   |
| PUT    | `/api/products/{id}` | Update a product   |
| DELETE | `/api/products/{id}` | Delete a product   |

## Tested with

Ubuntu Linux, .NET 8, Node.js 18, Angular 18, SQL Server 2022 and Keycloak
running in Docker. The full create/read/update/delete loop and the login flow
were verified end to end through the browser.
