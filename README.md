# Tourism Management Backend

A production-grade NestJS backend system built with Prisma ORM and PostgreSQL for managing tourists, passport details, and visa applications. The application implements secure JWT authentication, refresh token rotation, global/route-specific rate limiting, secure Helmet headers, dynamic CORS, soft deletes, and Swagger documentation.

---

## Features

* **JWT-Based Authentication**: Secure login flow for employees using access tokens (expiring in 15 minutes).
* **Refresh Token Rotation**: Enhanced security via stateful refresh tokens stored in the database as cryptographically hashed values, rotated automatically on token refresh (expiring in 30 days).
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
  * Case-insensitive queries for Employee and Tourist text searches.
  * Explicit sorting filters (`sortBy`, `sortOrder` defaulting to `createdAt desc`).
  * Tourist status filtering based on the `ACTIVE` | `INACTIVE` | `BLACKLISTED` state.
* **Visa Application Module**: State-machine-driven visa workflow:
  * Transitions: `DRAFT` &rarr; `SUBMITTED` &rarr; `IN_REVIEW` &rarr; `APPROVED`/`REJECTED`/`CANCELLED`.
  * Unique application numbers generated sequentially per calendar year (`VA-YYYY-000001`).
  * Automatic timestamps for submission and decision events.
  * Modification limits restricted exclusively to the `DRAFT` status.
* **Soft Delete Logic**: Safety measure preventing permanent records deletion on critical entities (`Employee`, `Tourist`, `VisaApplication`).
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
│   ├── dto/             # Base PaginationQueryDto for validation inheritance
│   ├── exceptions/      # PrismaExceptionFilter and ThrottlerExceptionFilter
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
│   ├── tourists/        # Tourist profiles and management endpoints
│   ├── passports/       # Decoupled passport details (1:1 with Tourist)
│   ├── visa-applications/ # Core visa application workflow and query handlers
│   ├── destinations/    # Destination management and catalog
│   ├── trips/           # Trip scheduling and management
│   └── assignments/     # Tourist assignment to trips/employees
├── app.module.ts        # Main application module registering config and submodules
└── main.ts              # Entry point starting the NestJS HTTP server
```

---

## Domain Modules

### Auth Module
* **Responsibilities**: Handles employee login, logout, profile discovery (`/me`), and secure token refreshing. Implements refresh token database revocation and rotation checks. Strict rate limit applied (5 attempts / minute).
* **Endpoints**:
  * `POST /auth/login`
  * `POST /auth/refresh`
  * `POST /auth/logout`
  * `GET /auth/me`

### Employee Module
* **Responsibilities**: Facilitates employee profile updates, lists, and metadata modifications by super admins. Exposes paginated and sorted query results.
* **Endpoints**:
  * `POST /employees`
  * `GET /employees`
  * `GET /employees/:id`
  * `PATCH /employees/:id`
  * `DELETE /employees/:id`

### Tourists Module
* **Responsibilities**: Manages tourist profiles. On tourist creation, creates a nested passport record in a single transaction. Exposes paginated list results supporting sorting, text search, and status filtering.
* **Endpoints**:
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

### Visa Applications Module
* **Responsibilities**: Controls the primary business process. Generates application numbers, manages state transitions, and enforces audit constraints. Exposes paginated query results with status/country filtering.
* **Endpoints**:
  * `POST /api/v1/visa-applications`
  * `GET /api/v1/visa-applications`
  * `GET /api/v1/visa-applications/:id`
  * `PATCH /api/v1/visa-applications/:id`
  * `DELETE /api/v1/visa-applications/:id`
  * `PATCH /api/v1/visa-applications/:id/status`

### Destinations Module
* **Responsibilities**: Manages destination master data.
* **Endpoints**:
  * `POST /destinations`
  * `GET /destinations`
  * `GET /destinations/:id`
  * `PATCH /destinations/:id`
  * `DELETE /destinations/:id`

### Trips Module
* **Responsibilities**: Manages trip packages and scheduling.
* **Endpoints**:
  * `POST /trips`
  * `GET /trips`
  * `GET /trips/:id`
  * `PATCH /trips/:id`
  * `DELETE /trips/:id`

### Assignments Module
* **Responsibilities**: Manages assignments.
* **Endpoints**:
  * `POST /assignments`
  * `GET /assignments`
  * `GET /assignments/:id`
  * `DELETE /assignments/:id`

---

## Database Design

```mermaid
erDiagram
    Employee ||--o{ RefreshToken : has
    Employee ||--o{ Tourist : creates
    Employee ||--o{ Tourist : updates
    Employee ||--o{ VisaApplication : creates
    Employee ||--o{ VisaApplication : updates
    Tourist ||--|| Passport : has
    Tourist ||--o{ VisaApplication : applies
    
    Employee {
        uuid id PK
        string fullName
        string email UK
        string password
        Role role
        datetime birthDate
        Gender gender
        string nationality
        string passportNumber
        boolean isActive
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }
    
    RefreshToken {
        uuid id PK
        string tokenHash
        uuid employeeId FK
        datetime expiresAt
        datetime revokedAt
        datetime createdAt
        datetime updatedAt
    }
    
    Tourist {
        uuid id PK
        string fullName
        datetime birthDate
        Gender gender
        string nationality
        string email
        string phone
        string notes
        TouristStatus status
        uuid createdByEmployeeId FK
        uuid updatedByEmployeeId FK
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }
    
    Passport {
        uuid id PK
        uuid touristId FK UK
        string passportNumber UK
        datetime issueDate
        datetime expiryDate
        string placeOfIssue
        datetime createdAt
        datetime updatedAt
    }
    
    VisaApplication {
        uuid id PK
        string applicationNumber UK
        uuid touristId FK
        string country
        string visaType
        VisaApplicationStatus status
        datetime submissionDate
        datetime decisionDate
        string notes
        uuid createdByEmployeeId FK
        uuid updatedByEmployeeId FK
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }
```

### Entities

#### Employee
* **Purpose**: Represents system users (Staff, Admins, Super Admins).
* **Important fields**: `email` (unique), `password` (hashed), `role` (`SUPER_ADMIN`, `ADMIN`, `STAFF`).
* **Relationships**:
  * Has many `refreshTokens`.
  * Has many `createdTourists` and `updatedTourists`.
  * Has many `createdVisaApplications` and `updatedVisaApplications`.

#### Tourist
* **Purpose**: Represents clients booking travel and applying for visas.
* **Important fields**: `fullName`, `status` (`ACTIVE`, `INACTIVE`, `BLACKLISTED`), `createdByEmployeeId`.
* **Relationships**:
  * Has one `passport` (`1:1`).
  * Has many `visaApplications` (`1:N`).

#### Passport
* **Purpose**: Decoupled travel document details.
* **Important fields**: `passportNumber` (unique), `touristId` (unique).
* **Relationships**:
  * Belongs to a single `tourist`.

#### VisaApplication
* **Purpose**: Tracks travel authorization processes.
* **Important fields**: `applicationNumber` (unique, generated), `status` (`DRAFT`, `SUBMITTED`, `IN_REVIEW`, `APPROVED`, `REJECTED`, `CANCELLED`).
* **Relationships**:
  * Belongs to a `tourist`.
  * Created and updated by `employee`.

#### RefreshToken
* **Purpose**: Tracks valid active sessions for Token Rotation.
* **Important fields**: `tokenHash` (cryptographically hashed), `employeeId`, `expiresAt`, `revokedAt`.

---

## Authentication Flow

```text
  [ Employee Credentials ]
            │
            ▼
    POST /auth/login  <─── [Rate Limit: 5 requests / min]
            │
  ┌─────────┴─────────┐
  ▼                   ▼
[ 200 OK ]      [ 401 Unauthorized ]
  │                   │
  ├──► Access Token   └──► "Invalid credentials"
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
2. Compares hashed input token with database logs.
3. Revokes the old refresh token (`revokedAt = now()`).
4. Generates a new access token and a new refresh token.
5. Persists the new refresh token hash and returns both tokens.
6. Re-using a revoked token invalidates the entire active session to block token theft.

---

## Authorization

All routes are protected by the `JwtAuthGuard` except public endpoints. The codebase has a defined `RolesGuard` mapping `SUPER_ADMIN`, `ADMIN`, and `STAFF` roles.

| Endpoint | Authentication | Rate Limit | Allowed Roles |
| -------- | -------------- | ---------- | ------------- |
| `POST /auth/login` | Public | 5 req / min | Anyone |
| `POST /auth/refresh` | Public | 5 req / min | Anyone |
| `POST /auth/logout` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `GET /auth/me` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `POST /employees` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `GET /employees` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `GET /employees/:id` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `PATCH /employees/:id` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `DELETE /employees/:id` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `POST /tourists` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `GET /tourists` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `GET /tourists/:id` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `PATCH /tourists/:id` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `DELETE /tourists/:id` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `POST /passports` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `GET /passports/:id` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `PATCH /passports/:id` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `POST /api/v1/visa-applications` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `GET /api/v1/visa-applications` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `GET /api/v1/visa-applications/:id`| JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `PATCH /api/v1/visa-applications/:id`| JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `DELETE /api/v1/visa-applications/:id`| JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `PATCH /api/v1/visa-applications/:id/status`| JWT Bearer| 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `POST /destinations` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN` |
| `GET /destinations` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `GET /destinations/:id` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `PATCH /destinations/:id` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN` |
| `DELETE /destinations/:id` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN` |
| `POST /trips` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN` |
| `GET /trips` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `GET /trips/:id` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `PATCH /trips/:id` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN` |
| `DELETE /trips/:id` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN` |
| `POST /assignments` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN` |
| `GET /assignments` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `GET /assignments/:id` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN`, `STAFF` |
| `DELETE /assignments/:id` | JWT Bearer | 100 req / min | `SUPER_ADMIN`, `ADMIN` |


---

## API Endpoints

### Auth

#### POST /auth/login
* **Description**: Logs in an employee and returns JWT access & refresh tokens.
* **Request**:
  ```json
  {
    "email": "admin@example.com",
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
* **Request**: Empty body (bearer token header required).
* **Response**: `204 No Content`

#### GET /auth/me
* **Description**: Retrieves current logged-in employee profile.
* **Response**:
  ```json
  {
    "id": "c1611a91-4d33-4bb4-ac81-ec0e02613cfb",
    "fullName": "System Admin",
    "email": "admin@example.com",
    "role": "SUPER_ADMIN",
    "birthDate": "1990-01-01T00:00:00.000Z",
    "gender": "MALE",
    "nationality": "Indonesian",
    "passportNumber": "X1234567",
    "isActive": true,
    "createdAt": "2026-06-19T00:00:00.000Z",
    "updatedAt": "2026-06-19T00:00:00.000Z"
  }
  ```

---

### Employees

#### POST /employees
* **Description**: Creates a new employee profile (default role `STAFF`).
* **Request**:
  ```json
  {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "password": "securePassword123",
    "birthDate": "1995-08-20",
    "gender": "FEMALE",
    "nationality": "Singaporean",
    "passportNumber": "Y7654321"
  }
  ```
* **Response**:
  ```json
  {
    "id": "c76b9e28-dfcd-40a2-9fa9-4458d9bb5e9b",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "role": "STAFF",
    "birthDate": "1995-08-20T00:00:00.000Z",
    "gender": "FEMALE",
    "nationality": "Singaporean",
    "passportNumber": "Y7654321",
    "isActive": true,
    "createdAt": "2026-06-19T07:22:00.000Z",
    "updatedAt": "2026-06-19T07:22:00.000Z"
  }
  ```

#### GET /employees
* **Description**: Returns a paginated and searchable list of employees.
* **Query Parameters**:
  * `page` (optional, default: `1`)
  * `limit` (optional, default: `10`, max: `100`)
  * `search` (optional, matches fullName/email case-insensitively)
  * `sortBy` (optional, allowed: `id` | `fullName` | `email` | `createdAt` | `updatedAt`, default: `createdAt`)
  * `sortOrder` (optional, `asc` | `desc`, default: `desc`)
* **Response**:
  ```json
  {
    "success": true,
    "data": [ ... ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
  ```

#### GET /employees/:id
* **Description**: Gets employee details by UUID.
* **Response**: Same as `POST /employees` body response.

#### PATCH /employees/:id
* **Description**: Updates profile details for an employee.
* **Request**: Any fields from `POST /employees` body (optional).
* **Response**: Updated employee details.

#### DELETE /employees/:id
* **Description**: Soft deletes employee profile by setting `deletedAt`.
* **Response**: `204 No Content`

---

### Tourists

#### POST /tourists
* **Description**: Registers a tourist and links a passport in a single transaction.
* **Request**:
  ```json
  {
    "fullName": "John Doe",
    "birthDate": "1990-05-15",
    "gender": "MALE",
    "nationality": "United States",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "notes": "VIP guest",
    "passport": {
      "passportNumber": "A12345678",
      "issueDate": "2020-01-15",
      "expiryDate": "2030-01-15",
      "placeOfIssue": "New York, USA"
    }
  }
  ```
* **Response**:
  ```json
  {
    "id": "d052b618-910f-4886-8d69-5a1e27a6949b",
    "fullName": "John Doe",
    "birthDate": "1990-05-15T00:00:00.000Z",
    "gender": "MALE",
    "nationality": "United States",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "notes": "VIP guest",
    "status": "ACTIVE",
    "createdAt": "2026-06-19T07:23:00.000Z",
    "updatedAt": "2026-06-19T07:23:00.000Z",
    "createdByEmployeeId": "c1611a91-4d33-4bb4-ac81-ec0e02613cfb",
    "updatedByEmployeeId": null,
    "createdByEmployee": { "id": "...", "fullName": "..." },
    "updatedByEmployee": null,
    "passport": {
      "id": "f5165991-5a02-4742-a279-3e3e098df11a",
      "touristId": "d052b618-910f-4886-8d69-5a1e27a6949b",
      "passportNumber": "A12345678",
      "issueDate": "2020-01-15T00:00:00.000Z",
      "expiryDate": "2030-01-15T00:00:00.000Z",
      "placeOfIssue": "New York, USA",
      "createdAt": "2026-06-19T07:23:00.000Z",
      "updatedAt": "2026-06-19T07:23:00.000Z"
    }
  }
  ```

#### GET /tourists
* **Description**: Returns paginated, searchable, and filterable list of tourists.
* **Query Parameters**:
  * `page` (optional, default: `1`)
  * `limit` (optional, default: `10`, max: `100`)
  * `search` (optional, matches fullName/email case-insensitively)
  * `status` (optional, filter by status `ACTIVE` | `INACTIVE` | `BLACKLISTED`)
  * `sortBy` (optional, allowed: `id` | `fullName` | `createdAt` | `updatedAt`, default: `createdAt`)
  * `sortOrder` (optional, `asc` | `desc`, default: `desc`)
* **Response**:
  ```json
  {
    "success": true,
    "data": [ ... ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
  ```

#### GET /tourists/:id
* **Description**: Gets tourist details with passport.
* **Response**: Same as `POST /tourists` response.

#### PATCH /tourists/:id
* **Description**: Updates profile details (excludes passport edits).
* **Request**:
  ```json
  {
    "fullName": "John Jonathan Doe",
    "status": "INACTIVE"
  }
  ```
* **Response**: Updated tourist object.

#### DELETE /tourists/:id
* **Description**: Soft deletes the tourist record.
* **Response**: `204 No Content`

---

### Passports

#### POST /passports
* **Description**: Links passport information to an existing tourist.
* **Request**:
  ```json
  {
    "touristId": "d052b618-910f-4886-8d69-5a1e27a6949b",
    "passportNumber": "B98765432",
    "issueDate": "2021-05-10",
    "expiryDate": "2031-05-10",
    "placeOfIssue": "Chicago, USA"
  }
  ```
* **Response**: Created passport details.

#### GET /passports/:id
* **Description**: Returns passport details with tourist summary.
* **Response**: Passport details with nested tourist owner data.

#### PATCH /passports/:id
* **Description**: Updates details of passport (passport number cannot be changed).
* **Request**:
  ```json
  {
    "placeOfIssue": "Washington DC, USA"
  }
  ```
* **Response**: Updated passport object.

---

### Visa Applications

#### POST /api/v1/visa-applications
* **Description**: Creates a new application. Initial status is `DRAFT`.
* **Request**:
  ```json
  {
    "touristId": "d052b618-910f-4886-8d69-5a1e27a6949b",
    "country": "Japan",
    "visaType": "Tourist",
    "notes": "First time visit"
  }
  ```
* **Response**:
  ```json
  {
    "id": "e0b904e1-2795-46aa-abfb-940716ee4b0c",
    "applicationNumber": "VA-2026-000001",
    "touristId": "d052b618-910f-4886-8d69-5a1e27a6949b",
    "country": "Japan",
    "visaType": "Tourist",
    "status": "DRAFT",
    "submissionDate": null,
    "decisionDate": null,
    "notes": "First time visit",
    "createdByEmployeeId": "c1611a91-4d33-4bb4-ac81-ec0e02613cfb",
    "updatedByEmployeeId": null,
    "createdAt": "2026-06-19T07:24:00.000Z",
    "updatedAt": "2026-06-19T07:24:00.000Z",
    "tourist": { ... },
    "createdByEmployee": { "id": "...", "fullName": "..." },
    "updatedByEmployee": null
  }
  ```

#### GET /api/v1/visa-applications
* **Description**: Returns a paginated, searchable, and filtered list of applications.
* **Query Parameters**:
  * `page` (optional)
  * `limit` (optional)
  * `search` (optional, searches applicationNumber or tourist fullName)
  * `status` (optional, `DRAFT` | `SUBMITTED` | `IN_REVIEW` | `APPROVED` | `REJECTED` | `CANCELLED`)
  * `country` (optional)
* **Response**: Paginated items with metadata.

#### GET /api/v1/visa-applications/:id
* **Description**: Details of a visa application, including tourist and passport.
* **Response**: Application details.

#### PATCH /api/v1/visa-applications/:id
* **Description**: Updates application (allowed only if status is `DRAFT`).
* **Request**:
  ```json
  {
    "country": "South Korea",
    "visaType": "Business"
  }
  ```
* **Response**: Updated application details.

#### DELETE /api/v1/visa-applications/:id
* **Description**: Soft deletes the application.
* **Response**: `204 No Content`

#### PATCH /api/v1/visa-applications/:id/status
* **Description**: Steps through the application process status.
* **Request**:
  ```json
  {
    "status": "SUBMITTED",
    "notes": "Documents verified"
  }
  ```
* **Response**: Updated application details.

---

### Destinations

#### POST /destinations
* **Description**: Creates a new destination.
* **Response**: Created destination details.

#### GET /destinations
* **Description**: Returns a paginated list of destinations.
* **Response**: Paginated items with metadata.

#### GET /destinations/:id
* **Description**: Details of a destination.
* **Response**: Destination details.

#### PATCH /destinations/:id
* **Description**: Updates destination.
* **Response**: Updated destination details.

#### DELETE /destinations/:id
* **Description**: Soft deletes the destination.
* **Response**: `204 No Content`

---

### Trips

#### POST /trips
* **Description**: Creates a new trip.
* **Response**: Created trip details.

#### GET /trips
* **Description**: Returns a paginated list of trips.
* **Response**: Paginated items with metadata.

#### GET /trips/:id
* **Description**: Details of a trip.
* **Response**: Trip details.

#### PATCH /trips/:id
* **Description**: Updates trip.
* **Response**: Updated trip details.

#### DELETE /trips/:id
* **Description**: Soft deletes the trip.
* **Response**: `204 No Content`

---

### Assignments

#### POST /assignments
* **Description**: Assigns a tourist to an employee/trip.
* **Response**: Created assignment details.

#### GET /assignments
* **Description**: Returns a paginated list of assignments.
* **Response**: Paginated items with metadata.

#### GET /assignments/:id
* **Description**: Details of an assignment.
* **Response**: Assignment details.

#### DELETE /assignments/:id
* **Description**: Deletes the assignment.
* **Response**: `204 No Content`


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
npx prisma migrate dev
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

## Swagger

Interactive API Swagger documentation is generated automatically on server launch in environments where it is enabled:

* **Swagger URL**: `http://localhost:<PORT>/api/docs` (default: `http://localhost:3000/api/docs`)
* **Enable Flag**: Set `ENABLE_SWAGGER=true` in environment variables.

---

## Security Features

* **Cryptographic Password Hashing**: Employee passwords are encrypted using Bcrypt prior to storage.
* **Token Hashing**: Refresh tokens are cryptographically hashed using Bcrypt before DB insertions to prevent compromise in case of database leaks.
* **Refresh Token Rotation (RTR)**: Stateful token verification that revokes previous tokens and prevents token replay attacks.
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

## Future Roadmap

The application modular architecture has designated skeletons ready for future service expansion:
* **`DestinationModule`**: Location, descriptions, and operational flags for destinations.
* **`TripModule`**: Schedule departures, participant bounds, and travel group mappings.
* **`AssignmentModule`**: Assignment structures connecting Employees to Tourist workflows.

---

## Development Notes

### Architectural Decisions

* **Feature-Based Modules**: Code is separated into self-contained domain boundaries (modules), promoting decoupling and easier maintenance as the backend expands.
* **Prisma ORM**: Chosen for type-safe query building, auto-generated typing definitions directly in sync with schema designs, and migration workflows.
* **Stateful Refresh Tokens**: Tokens are recorded dynamically in the database. This allows admins to invalidate active sessions instantly (e.g., during lockouts or security events).
* **Soft Delete Logic**: Retaining records while marking them with `deletedAt` maintains historical integrity for financial/audit trails while hiding them from standard queries.
