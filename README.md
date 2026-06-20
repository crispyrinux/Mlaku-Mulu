# Tourism Management Backend

[![Deploy Status](https://img.shields.io/badge/Render-Live-brightgreen?style=flat-square)](https://mlaku-mulu-api.onrender.com/)
[![API Docs](https://img.shields.io/badge/Swagger-API%20Docs-blue?style=flat-square)](https://mlaku-mulu-api.onrender.com/api/docs)

* **Production URL**: [https://mlaku-mulu-api.onrender.com/](https://mlaku-mulu-api.onrender.com/)
* **Production API Swagger Docs**: [https://mlaku-mulu-api.onrender.com/api/docs](https://mlaku-mulu-api.onrender.com/api/docs)

A production-grade NestJS backend system built with Prisma ORM and PostgreSQL for managing destinations, trips, assignments, tourists, passport details, and visa applications. The application implements secure employee and tourist authentication, refresh token rotation, global/route-specific rate limiting, secure Helmet headers, dynamic CORS, soft deletes, and Swagger documentation.

---

## Features

* **Dual-User Authentication (Employee & Tourist)**: Secure login flow using JWT access tokens (expiring in 15 minutes).
* **Refresh Token Rotation**: Enhanced security via stateful refresh tokens stored in the database as cryptographically hashed values, rotated automatically on token refresh (expiring in 30 days) for both employees and tourists.
* **Tourist Self-Service Portal**:
  * Secure endpoints mapping to JWT claims to prevent IDOR vulnerabilities.
  * Tourist profile retrieval (`GET /tourists/me`).
  * Assigned trip history list (`GET /tourists/me/trips`).
  * Specific trip detail checks (`GET /tourists/me/trips/:tripId`).
* **Global & Route-Specific Rate Limiting**: Standard rate limiting applied globally (default 100 requests / minute) with stricter overrides on login and refresh endpoints (5 attempts / minute) using `@nestjs/throttler`.
* **Helmet Security Headers**: Production-grade HTTP headers applied globally (defaults for X-Content-Type-Options, X-Frame-Options, Referrer-Policy, etc.).
* **CORS Hardening**: Strict, environment-driven origin mapping supporting multiple origins. Defaults to safe localhost values for local development.
* **Standardized Pagination, Search, Filtering & Sorting**:
  * Shared `PaginationQueryDto` class for clean query parameters validation.
  * Reusable pagination utility mapping query results to standard response wrappers:
    ```json
    {
      "success": true,
      "data": [...],
      "meta": {
        "page": 1,
        "limit": 10,
        "total": 100,
        "totalPages": 10
      }
    }
    ```
  * Case-insensitive queries for Employee, Tourist, and Destination text searches.
  * Explicit sorting filters (`sortBy`, `sortOrder` defaulting to `createdAt desc`).
  * Tourist status filtering based on the `ACTIVE` | `INACTIVE` | `BLACKLISTED` state.
* **Visa Application Module**: State-machine-driven visa workflow:
  * Transitions: `DRAFT` &rarr; `SUBMITTED` &rarr; `IN_REVIEW` &rarr; `APPROVED`/`REJECTED`/`CANCELLED`.
  * Unique application numbers generated sequentially per calendar year (`VA-YYYY-000001`).
  * Automatic timestamps for submission and decision events.
  * Modification limits restricted exclusively to the `DRAFT` status.
* **Soft Delete Logic**: Safety measure preventing permanent records deletion on critical entities (`Employee`, `Tourist`, `VisaApplication`, `Destination`, `Trip`).
* **Audit Trail**: Tracking creation and update logs of tourists and visa applications by capturing responsible employee IDs (`createdByEmployeeId`, `updatedByEmployeeId`).
* **Global Exception Filters**: Custom filters intercepting database exceptions (Prisma errors) and rate limiting violations (`ThrottlerException`) to return consistent, user-friendly JSON payloads.

---

## Tech Stack

| Technology | Purpose |
| ---------- | ------- |
| **NestJS** | Framework for scalable, modular server-side applications |
| **Prisma ORM** | Type-safe database access, mapping, and migrations |
| **PostgreSQL** | Relational database storage |
| **Passport & JWT** | Secure authentication and credentials verification |
| **Throttler** | Global and route-specific request rate limiting |
| **Helmet** | HTTP security headers decoration |
| **Swagger** | Interactive API documentation and sandboxed testing |
| **Bcrypt** | Secure hashing algorithm for passwords and refresh tokens |
| **Class Validator & Transformer** | Runtime DTO validation and request transformation |
| **Compression** | HTTP response payload compression |
| **Joi** | Environment configuration variables validation |

---

## Project Structure

```text
src/
├── common/
│   ├── decorators/      # Roles and UserTypes decorators
│   ├── DTO/             # Base PaginationQueryDto for validation inheritance
│   ├── exceptions/      # PrismaExceptionFilter and ThrottlerExceptionFilter
│   ├── guards/          # RolesGuard enforcing user type and role constraints
│   ├── interfaces/      # PaginatedResponse<T> interface layout
│   ├── security/        # Cryptographic password hashing helper service
│   └── utils/           # pagination.util.ts helper functions
├── config/
│   ├── app.config.ts    # Application runtime configs including throttle & CORS origins
│   ├── env.validation.t # Environment variables Joi validation schema
│   ├── jwt.config.ts    # JWT token expiration and secret settings
│   └── swagger.config.t # Swagger UI configurations
├── modules/
│   ├── auth/            # Auth controllers, login, guards, strategies, and decorators
│   ├── employee/        # Employee management endpoints and database entities
│   ├── tourists/        # Tourist profiles, self-service endpoints, and management
│   ├── passports/       # Decoupled passport details (1:1 with Tourist)
│   ├── destinations/    # Destination management endpoints and database entities
│   ├── trips/           # Trip scheduling and participant queries
│   ├── assignments/     # Penugasan staf (Employee) ke wisatawan (Tourist)
│   └── visa-applications/ # Core visa application workflow and query handlers
├── app.module.ts        # Main application module registering config and submodules
└── main.ts              # Entry point starting the NestJS HTTP server
```

---

## Domain Modules

### Auth Module
* **Responsibilities**: Handles employee and tourist login, logout, employee profile discovery (`/me`), and secure token refreshing. Implements refresh token database revocation and rotation checks. Strict rate limit applied (5 attempts / minute).
* **Endpoints**:
  * `POST /auth/login`
  * `POST /auth/refresh`
  * `POST /auth/logout`
  * `GET /auth/me`

### Employee Module
* **Responsibilities**: Facilitates employee profile updates, lists, and metadata modifications by admins. Exposes paginated and sorted query results.
* **Endpoints**:
  * `POST /employees`
  * `GET /employees`
  * `GET /employees/:id`
  * `PATCH /employees/:id`
  * `DELETE /employees/:id`

### Tourists Module
* **Responsibilities**: Manages tourist profiles, registrations, and self-service profile/trip queries. Exposes paginated list results supporting sorting, text search, and status filtering.
* **Endpoints**:
  * `GET /tourists/me` (Tourist only)
  * `GET /tourists/me/trips` (Tourist only)
  * `GET /tourists/me/trips/:tripId` (Tourist only)
  * `POST /tourists`
  * `GET /tourists`
  * `GET /tourists/:id`
  * `PATCH /tourists/:id`
  * `DELETE /tourists/:id`

### Passports Module
* **Responsibilities**: Handles decoupled passport metadata updates (issue dates, expiry, place of issue) separate from the tourist entity.
* **Endpoints**:
  * `POST /passports`
  * `GET /passports/:id`
  * `PATCH /passports/:id`

### Destinations Module
* **Responsibilities**: Manages destinations, supporting creation, updating, retrieval, and soft deletion.
* **Endpoints**:
  * `POST /destinations`
  * `GET /destinations`
  * `GET /destinations/:id`
  * `PATCH /destinations/:id`
  * `DELETE /destinations/:id`

### Trips Module
* **Responsibilities**: Manages schedules for pariwisata trips, including destination links and status updates.
* **Endpoints**:
  * `POST /trips`
  * `GET /trips`
  * `GET /trips/:id`
  * `PATCH /trips/:id`
  * `DELETE /trips/:id`

### Assignments Module
* **Responsibilities**: Records tourist penugasan assignments connecting employees to tourist pendampingan tasks.
* **Endpoints**:
  * `POST /assignments`
  * `GET /assignments`
  * `GET /assignments/:id`
  * `DELETE /assignments/:id`

### Visa Applications Module
* **Responsibilities**: Controls the primary business process. Generates application numbers, manages state transitions, and enforces audit constraints. Exposes paginated query results with status/country filtering.
* **Endpoints**:
  * `POST /api/v1/visa-applications`
  * `GET /api/v1/visa-applications`
  * `GET /api/v1/visa-applications/:id`
  * `PATCH /api/v1/visa-applications/:id`
  * `DELETE /api/v1/visa-applications/:id`
  * `PATCH /api/v1/visa-applications/:id/status`

---

## Authentication Flow

```text
  [ User Credentials ]
           │
           ▼
   POST /auth/login  <─── [Rate Limit: 5 requests / min]
           │
  ┌────────┴────────┐
  ▼                 ▼
[ 200 OK ]      [ 401 Unauthorized ]
  │                 │
  ├──► Access Token └──► "Invalid credentials"
  └──► Refresh Token
           │
  (Used for access)
           │
           ▼
    Protected APIs (Authorization Bearer <JWT>)
```

### Refresh Token Rotation (RTR)
When access tokens expire (15 min), clients call `/auth/refresh` sending the raw refresh token:
1. System validates the token signature and expiration.
2. Compares hashed input token with database logs (checks both `employeeId` and `touristId` relations).
3. Revokes the old refresh token (`revokedAt = now()`).
4. Generates a new access token and a new refresh token.
5. Persists the new refresh token hash and returns both tokens.
6. Re-using a revoked token invalidates the entire active session to block token theft.

---

## Authorization

All routes are protected by the `JwtAuthGuard` and the `RolesGuard`. The system is **secure by default**; if no `@UserTypes()` metadata is defined, it defaults to Employee-only access. 

| Endpoint | Authentication | Rate Limit | Allowed User Types / Roles |
| -------- | -------------- | ---------- | -------------------------- |
| `POST /auth/login` | Public | 5 req / min | Anyone |
| `POST /auth/refresh` | Public | 5 req / min | Anyone |
| `POST /auth/logout` | JWT Bearer | 100 req / min | `EMPLOYEE` (Any Role), `TOURIST` |
| `GET /auth/me` | JWT Bearer | 100 req / min | `EMPLOYEE` (Any Role) |
| `GET /tourists/me` | JWT Bearer | 100 req / min | `TOURIST` |
| `GET /tourists/me/trips` | JWT Bearer | 100 req / min | `TOURIST` |
| `GET /tourists/me/trips/:tripId` | JWT Bearer | 100 req / min | `TOURIST` |
| `POST /employees` | JWT Bearer | 100 req / min | `EMPLOYEE` (`SUPER_ADMIN`, `ADMIN`) |
| `GET /employees` | JWT Bearer | 100 req / min | `EMPLOYEE` (Any Role) |
| `GET /employees/:id` | JWT Bearer | 100 req / min | `EMPLOYEE` (Any Role) |
| `PATCH /employees/:id` | JWT Bearer | 100 req / min | `EMPLOYEE` (`SUPER_ADMIN`, `ADMIN`) |
| `DELETE /employees/:id` | JWT Bearer | 100 req / min | `EMPLOYEE` (`SUPER_ADMIN`, `ADMIN`) |
| `POST /tourists` | JWT Bearer | 100 req / min | `EMPLOYEE` (`SUPER_ADMIN`, `ADMIN`) |
| `GET /tourists` | JWT Bearer | 100 req / min | `EMPLOYEE` (Any Role) |
| `GET /tourists/:id` | JWT Bearer | 100 req / min | `EMPLOYEE` (Any Role) |
| `PATCH /tourists/:id` | JWT Bearer | 100 req / min | `EMPLOYEE` (`SUPER_ADMIN`, `ADMIN`) |
| `DELETE /tourists/:id` | JWT Bearer | 100 req / min | `EMPLOYEE` (`SUPER_ADMIN`) |
| `POST /passports` | JWT Bearer | 100 req / min | `EMPLOYEE` (`SUPER_ADMIN`, `ADMIN`) |
| `GET /passports/:id` | JWT Bearer | 100 req / min | `EMPLOYEE` (Any Role) |
| `PATCH /passports/:id` | JWT Bearer | 100 req / min | `EMPLOYEE` (`SUPER_ADMIN`, `ADMIN`) |
| `POST /destinations` | JWT Bearer | 100 req / min | `EMPLOYEE` (`SUPER_ADMIN`, `ADMIN`) |
| `GET /destinations` | JWT Bearer | 100 req / min | `EMPLOYEE` (Any Role) |
| `GET /destinations/:id` | JWT Bearer | 100 req / min | `EMPLOYEE` (Any Role) |
| `PATCH /destinations/:id` | JWT Bearer | 100 req / min | `EMPLOYEE` (`SUPER_ADMIN`, `ADMIN`) |
| `DELETE /destinations/:id` | JWT Bearer | 100 req / min | `EMPLOYEE` (`SUPER_ADMIN`, `ADMIN`) |
| `POST /trips` | JWT Bearer | 100 req / min | `EMPLOYEE` (`SUPER_ADMIN`, `ADMIN`) |
| `GET /trips` | JWT Bearer | 100 req / min | `EMPLOYEE` (Any Role) |
| `GET /trips/:id` | JWT Bearer | 100 req / min | `EMPLOYEE` (Any Role) |
| `PATCH /trips/:id` | JWT Bearer | 100 req / min | `EMPLOYEE` (`SUPER_ADMIN`, `ADMIN`) |
| `DELETE /trips/:id` | JWT Bearer | 100 req / min | `EMPLOYEE` (`SUPER_ADMIN`, `ADMIN`) |
| `POST /assignments` | JWT Bearer | 100 req / min | `EMPLOYEE` (`SUPER_ADMIN`, `ADMIN`) |
| `GET /assignments` | JWT Bearer | 100 req / min | `EMPLOYEE` (Any Role) |
| `GET /assignments/:id` | JWT Bearer | 100 req / min | `EMPLOYEE` (Any Role) |
| `DELETE /assignments/:id` | JWT Bearer | 100 req / min | `EMPLOYEE` (`SUPER_ADMIN`, `ADMIN`) |
| `POST /api/v1/visa-applications` | JWT Bearer | 100 req / min | `EMPLOYEE` (`SUPER_ADMIN`, `ADMIN`) |
| `GET /api/v1/visa-applications` | JWT Bearer | 100 req / min | `EMPLOYEE` (Any Role) |
| `GET /api/v1/visa-applications/:id`| JWT Bearer | 100 req / min | `EMPLOYEE` (Any Role) |
| `PATCH /api/v1/visa-applications/:id`| JWT Bearer | 100 req / min | `EMPLOYEE` (`SUPER_ADMIN`, `ADMIN`) |
| `DELETE /api/v1/visa-applications/:id`| JWT Bearer | 100 req / min | `EMPLOYEE` (`SUPER_ADMIN`) |
| `PATCH /api/v1/visa-applications/:id/status`| JWT Bearer| 100 req / min | `EMPLOYEE` (`SUPER_ADMIN`, `ADMIN`) |

---

## API Endpoints

### Auth

#### POST /auth/login
* **Description**: Logs in an employee or tourist and returns JWT access & refresh tokens.
* **Request**:
  ```json
  {
    "email": "tourist@example.com",
    "password": "password123"
  }
  ```
* **Response**:
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "a1b2c3d4..."
  }
  ```

#### POST /auth/refresh
* **Description**: Rotates the current refresh token and returns a new token pair.
* **Request**:
  ```json
  {
    "refreshToken": "a1b2c3d4..."
  }
  ```
* **Response**:
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "f5e4d3c2..."
  }
  ```

#### POST /auth/logout
* **Description**: Revokes all refresh tokens linked to the user session.
* **Response**: `204 No Content`

#### GET /auth/me
* **Description**: Retrieves current logged-in employee profile.

---

### Tourists Self-Service

#### GET /tourists/me
* **Description**: Retrieves the logged-in tourist's own profile.
* **Response**:
  ```json
  {
    "id": "ba09fdcb-a9f0-43c1-8832-029aa0053e82",
    "fullName": "Test Tourist User",
    "birthDate": "1995-05-20T00:00:00.000Z",
    "gender": "FEMALE",
    "nationality": "Singaporean",
    "email": "tourist.test@example.com",
    "phone": "+6588889999",
    "notes": "VIP guest",
    "status": "ACTIVE",
    "createdAt": "2026-06-20T01:43:04.854Z",
    "updatedAt": "2026-06-20T01:43:04.854Z",
    "createdByEmployeeId": "c4756c3c-fa39-4b8b-bd69-f75a12a5ba0d",
    "updatedByEmployeeId": null,
    "createdByEmployee": { "id": "...", "fullName": "..." },
    "updatedByEmployee": null,
    "passport": { ... }
  }
  ```

#### GET /tourists/me/trips
* **Description**: Returns all trips assigned to the tourist.
* **Response**:
  ```json
  [
    {
      "tripId": "trip-uuid",
      "tripName": "Tokyo Explorer",
      "tripDescription": "Tokyo sightseeing package",
      "startDate": "2026-07-01T00:00:00.000Z",
      "endDate": "2026-07-07T00:00:00.000Z",
      "tripStatus": "UPCOMING",
      "destinationName": "Sensoji Temple",
      "destinationCity": "Tokyo",
      "destinationCountry": "Japan"
    }
  ]
  ```

#### GET /tourists/me/trips/:tripId
* **Description**: Retrieves details of a specific trip assigned to the tourist. Checks participant mapping to prevent IDOR.
* **Response**: Single trip object details.

---

## Environment Variables

The system requires the following environment variables to run. Validation is performed on startup via the Joi schema.

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `PORT` | Yes | HTTP server port (e.g., `3000`) |
| `DATABASE_URL` | Yes | PostgreSQL connection URI string (`postgresql://user:pass@host:port/db`) |
| `JWT_ACCESS_SECRET` | Yes | Signing secret key for JWT access tokens |
| `JWT_ACCESS_EXPIRES_IN` | Yes | Expiry duration for access tokens (e.g., `15m`) |
| `JWT_REFRESH_SECRET` | Yes | Signing secret key for JWT refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | Yes | Expiry duration for refresh tokens (e.g., `30d`) |
| `CORS_ORIGIN` | No | Comma-separated list of allowed origins (defaults to dev localhost origins) |
| `THROTTLE_TTL` | No | Time-to-live window in milliseconds for rate limits (default: `60000`) |
| `THROTTLE_LIMIT` | No | Request threshold count within TTL window (default: `100`) |
| `ENABLE_SWAGGER` | No | Boolean toggle control for exposing Swagger UI (default: `false`) |

---

## Running Locally

### 1. Setup Environment
Clone the repository and create your `.env` file in the root directory following the **Environment Variables** specification.

### 2. Install Dependencies
```bash
npm install
```

### 3. Run PostgreSQL Database
Ensure you have a local PostgreSQL instance running, or launch one via Docker:
```bash
docker compose up -d
```

### 4. Database Migrations
Initialize database tables, schemas, and indices:
```bash
npx prisma db push
```

### 5. Start Application
```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

---

## Docker Usage

Use the following commands to spin up PostgreSQL containers defined in the setup configuration:

* **Start database container in background**:
  ```bash
  docker compose up -d
  ```

* **View container status**:
  ```bash
  docker compose ps
  ```

* **View container logs**:
  ```bash
  docker compose logs -f
  ```

* **Stop and remove database container**:
  ```bash
  docker compose down
  ```

---

## Deployment to Render

This project can be deployed easily on **Render** (as a Web Service) connected to a production PostgreSQL database (e.g., Render PostgreSQL, Neon, or Supabase).

### 1. Web Service Configurations

* **Runtime**: `Node`
* **Build Command**:
  ```bash
  npm install && npx prisma generate && npm run build && npx prisma migrate deploy
  ```
* **Start Command**:
  ```bash
  node dist/src/main
  ```
  *(Note: Due to the compilation of root-level configs, the compiled entry point resolves to `dist/src/main.js` instead of `dist/main.js`)*.

### 2. Environment Variables

Configure the following environment variables in the Render Web Service:

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `DATABASE_URL` | Yes | Connection URI to production PostgreSQL |
| `JWT_ACCESS_SECRET` | Yes | Signing secret key for JWT access tokens |
| `JWT_ACCESS_EXPIRES_IN` | Yes | Expiry duration for access tokens (e.g., `15m`) |
| `JWT_REFRESH_SECRET` | Yes | Signing secret key for JWT refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | Yes | Expiry duration for refresh tokens (e.g., `30d`) |
| `ENABLE_SWAGGER` | No | Set to `true` to enable Swagger in production |
| `CORS_ORIGIN` | No | Allowed frontend origin URLs |

### 3. Database Seeding

To create the default Super Admin (`superadmin@example.com` / `superadmin123`), run the following command in the Render **Shell** terminal once the service is online:

```bash
npx prisma db seed
```

---

## Swagger

Interactive API Swagger documentation is generated automatically on server launch in environments where it is enabled:

* **Production Swagger URL**: [https://mlaku-mulu-api.onrender.com/api/docs](https://mlaku-mulu-api.onrender.com/api/docs)
* **Local Swagger URL**: `http://localhost:<PORT>/api/docs` (default: `http://localhost:3000/api/docs`)
* **Enable Flag**: Set `ENABLE_SWAGGER=true` in environment variables.

---

## Security Features

* **Cryptographic Password Hashing**: Employee and Tourist passwords are encrypted using Bcrypt prior to storage.
* **Token Hashing**: Refresh tokens are cryptographically hashed using Bcrypt before DB insertions to prevent compromise in case of database leaks.
* **Refresh Token Rotation (RTR)**: Stateful token verification that revokes previous tokens and prevents token replay attacks.
* **User-Type Validation Guard**: Hardened validation checking `userType` claim in JWT payloads, secure by default.
* **Global Rate Limiting**: Limit API abuse to a default of 100 requests per minute.
* **Route Rate Limiting**: Stricter 5 attempts per minute rate limit applied to authentication paths (`/auth/login` and `/auth/refresh`).
* **CORS Hardening**: Strict, non-wildcard CORS config configured via allowed-origin list.
* **Helmet Security Headers**: Integrated Helmet middleware to add secure headers (CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy).
* **Request Validation**: Validation pipes mapping decorators (`class-validator`) reject invalid inputs before routes process them.

---

## Error Response Format

Unhandled system, database, and rate limiting exceptions are mapped to consistent client formats via exception filters.

### Conflict Exception Example (P2002 Unique Constraint)
```json
{
  "statusCode": 409,
  "timestamp": "2026-06-19T07:25:00.000Z",
  "path": "/tourists",
  "message": "Unique constraint violation"
}
```

### Rate Limit Exception Example (Too Many Requests)
```json
{
  "success": false,
  "message": "Too many requests",
  "statusCode": 429
}
```

### Validation Error Example (400 Bad Request)
```json
{
  "message": [
    "passport.passportNumber must be a string",
    "passport.passportNumber should not be empty"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## Development Notes

### Architectural Decisions

* **Feature-Based Modules**: Code is separated into self-contained domain boundaries (modules), promoting decoupling and easier maintenance as the backend expands.
* **Prisma ORM**: Chosen for type-safe query building, auto-generated typing definitions directly in sync with schema designs, and migration workflows.
* **Stateful Refresh Tokens**: Tokens are recorded dynamically in the database. This allows admins to invalidate active sessions instantly (e.g., during lockouts or security events).
* **Soft Delete Logic**: Retaining records while marking them with `deletedAt` maintains historical integrity for financial/audit trails while hiding them from standard queries.
