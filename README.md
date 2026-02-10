# Recruitment Platform Backend

A Node.js + Express backend service for managing candidate profiles, built with TypeScript and PostgreSQL.

## 📋 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js v5
- **Language:** TypeScript (ES2023)
- **Database:** PostgreSQL 16
- **ORM:** Prisma v7
- **Package Manager:** npm
- **Development:** tsx (hot reload)
- **Build Output:** dist/ (compiled JavaScript)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Docker** and **Docker Compose**

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd assesment
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root by copying from `.env.example`:

```bash
cp .env.example .env
```

The `.env` file should contain:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/mydb?schema=public"
API_KEY="dev-api-key"
CORS_ORIGIN="http://localhost:3000"
```

**Note:** The database runs on port `5433` (not 5432) to avoid conflicts with local PostgreSQL installations.

### 4. Start PostgreSQL Database

Start the PostgreSQL container using Docker Compose:

```bash
docker-compose up -d
```

Verify the database is running:

```bash
docker-compose ps
```

### 5. Run Prisma Migrations

Apply database migrations:

```bash
npm run prisma:migrate
```

This will create the database schema including:
- `Candidate` table with all fields
- `AuditEvent` table for tracking changes

### 6. Seed the Database

Populate the database with initial candidate data:

```bash
npm run seed
```

This will load sample candidate data from `data/candidates.json`.

### 7. Generate Prisma Client

Make sure all files are generated

```bash
npm run prisma:generate
```

This will create folder /generated.

## 💻 Running the Project

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:8080` and automatically reload when you save changes.

### Production Build

Build the TypeScript code to JavaScript:

```bash
npm run build
```

Compiled output will be in the `dist/` directory.

### Start Production Server

```bash
npm start
```

## 🛠️ Useful Commands

### Prisma Studio

Explore and manage your database graphically:

```bash
npm run prisma:studio
```

Opens an interactive database UI at `http://localhost:5555`

### Database Management

Stop the PostgreSQL container:

```bash
docker-compose down
```

Stop and remove all containers and volumes:

```bash
docker-compose down -v
```

### View Logs

```bash
docker-compose logs -f db
```

## 🌐 API Endpoints

All `/api/*` endpoints require an API key in the `x-api-key` header.

### Health Check

**GET** `/health`

Returns server and database health status. No authentication required.

```bash
curl -X GET "http://localhost:8080/health"
```

Response:
```json
{
  "success": true,
  "uptime": 123.456,
  "timestamp": 1707604123456,
  "status": "ok",
  "db": "ok"
}
```

### List Candidates

**GET** `/api/candidates`

List all candidates with support for search, filtering, sorting, and pagination.

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `q` | string | Full-text search across name, headline, and skills | `q=JavaScript` |
| `location` | string | Filter by location (case-insensitive contains) | `location=San Francisco` |
| `skill` | string | Filter by exact skill match | `skill=React` |
| `status` | string | Filter by status (case-insensitive contains) | `status=interviewing` |
| `availability` | string | Filter by availability (case-insensitive contains) | `availability=immediate` |
| `minExp` | number | Minimum years of experience | `minExp=3` |
| `maxExp` | number | Maximum years of experience | `maxExp=10` |
| `sort` | string | Sort field: `updatedAt`, `createdAt`, `fullName`, `yearsOfExperience`, `score` | `sort=yearsOfExperience` |
| `order` | string | Sort order: `asc` or `desc` | `order=desc` |
| `page` | number | Page number (starts at 1) | `page=1` |
| `pageSize` | number | Number of items per page (default: 12, max: 100) | `pageSize=10` |

**Example Requests:**

```bash
# Basic list with pagination
curl -X GET "http://localhost:8080/api/candidates?page=1&pageSize=10" \
  -H "x-api-key: dev-api-key"

# Search for JavaScript developers
curl -X GET "http://localhost:8080/api/candidates?q=JavaScript&page=1&pageSize=10" \
  -H "x-api-key: dev-api-key"

# Filter by location and skill
curl -X GET "http://localhost:8080/api/candidates?location=San%20Francisco&skill=React" \
  -H "x-api-key: dev-api-key"

# Filter by experience range and sort
curl -X GET "http://localhost:8080/api/candidates?minExp=3&maxExp=7&sort=yearsOfExperience&order=asc" \
  -H "x-api-key: dev-api-key"

# Filter by status and availability
curl -X GET "http://localhost:8080/api/candidates?status=interviewing&availability=immediate" \
  -H "x-api-key: dev-api-key"
```

**Response:**
```json
{
  "data": [
    {
      "id": "cand_001",
      "fullName": "Alice Johnson",
      "headline": "Senior Full-Stack Developer",
      "location": "San Francisco, CA",
      "yearsOfExperience": 8,
      "skills": ["JavaScript", "React", "Node.js", "TypeScript"],
      "availability": "2 weeks notice",
      "status": "interviewing",
      "score": 85,
      "shortlisted": true,
      "rejected": false,
      "updatedAt": "2026-02-10T12:00:00.000Z",
      "createdAt": "2026-02-08T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

### Get Candidate by ID

**GET** `/api/candidates/:id`

Get detailed information about a specific candidate, including audit log.

**Example:**

```bash
curl -X GET "http://localhost:8080/api/candidates/cand_001" \
  -H "x-api-key: dev-api-key"
```

**Response:**
```json
{
  "id": "cand_001",
  "fullName": "Alice Johnson",
  "headline": "Senior Full-Stack Developer",
  "location": "San Francisco, CA",
  "yearsOfExperience": 8,
  "skills": ["JavaScript", "React", "Node.js", "TypeScript"],
  "availability": "2 weeks notice",
  "status": "interviewing",
  "score": 85,
  "shortlisted": true,
  "rejected": false,
  "updatedAt": "2026-02-10T12:00:00.000Z",
  "createdAt": "2026-02-08T10:00:00.000Z",
  "auditLog": [
    {
      "id": "audit_123",
      "at": "2026-02-10T12:00:00.000Z",
      "action": "status_updated",
      "from": "screening",
      "to": "interviewing"
    }
  ]
}
```

### Update Candidate

**PATCH** `/api/candidates/:id`

Update candidate status, shortlisted, or rejected flags. All changes are tracked in the audit log.

**Body Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Update candidate status |
| `shortlisted` | boolean | Mark candidate as shortlisted |
| `rejected` | boolean | Mark candidate as rejected |

**Example:**

```bash
# Update status
curl -X PATCH "http://localhost:8080/api/candidates/cand_001" \
  -H "x-api-key: dev-api-key" \
  -H "Content-Type: application/json" \
  -d '{"status": "interviewing"}'

# Shortlist candidate
curl -X PATCH "http://localhost:8080/api/candidates/cand_001" \
  -H "x-api-key: dev-api-key" \
  -H "Content-Type: application/json" \
  -d '{"shortlisted": true}'

# Update multiple fields
curl -X PATCH "http://localhost:8080/api/candidates/cand_001" \
  -H "x-api-key: dev-api-key" \
  -H "Content-Type: application/json" \
  -d '{"status": "offer_extended", "shortlisted": true}'
```

**Response:**
```json
{
  "id": "cand_001",
  "fullName": "Alice Johnson",
  "headline": "Senior Full-Stack Developer",
  "location": "San Francisco, CA",
  "yearsOfExperience": 8,
  "skills": ["JavaScript", "React", "Node.js", "TypeScript"],
  "availability": "2 weeks notice",
  "status": "interviewing",
  "score": 85,
  "shortlisted": true,
  "rejected": false,
  "updatedAt": "2026-02-10T12:05:00.000Z",
  "createdAt": "2026-02-08T10:00:00.000Z",
  "auditLog": [
    {
      "id": "audit_124",
      "at": "2026-02-10T12:05:00.000Z",
      "action": "status_updated",
      "from": "screening",
      "to": "interviewing"
    }
  ]
}
```

### Get Related Candidates

**GET** `/api/candidates/:id/related`

Get up to 8 candidates related to the specified candidate, ranked by similarity score.

**Example:**

```bash
curl -X GET "http://localhost:8080/api/candidates/cand_001/related" \
  -H "x-api-key: dev-api-key"
```

**Response:**
```json
{
  "data": [
    {
      "id": "cand_005",
      "fullName": "Bob Smith",
      "headline": "Full-Stack JavaScript Developer",
      "location": "San Francisco, CA",
      "yearsOfExperience": 7,
      "skills": ["JavaScript", "React", "Node.js"],
      "availability": "immediate",
      "status": "screening",
      "score": 82,
      "shortlisted": false,
      "rejected": false,
      "updatedAt": "2026-02-09T14:00:00.000Z",
      "createdAt": "2026-02-08T11:00:00.000Z"
    }
  ]
}
```

## 🔍 Filtering, Sorting & Pagination Behavior

### Search (`q` parameter)

The `q` parameter performs full-text search across:
- **Full Name** (case-insensitive contains)
- **Headline** (case-insensitive contains)
- **Skills** (checks if any skill contains the search term)

Results match if ANY of these fields contain the search term.

### Filtering

Filters work together with AND logic. For example:
```
?location=San Francisco&skill=React&minExp=3
```
Returns candidates who:
- Are in San Francisco AND
- Have React as a skill AND
- Have at least 3 years of experience

**Filter Types:**
- **Contains filters** (`location`, `status`, `availability`): Case-insensitive partial match
- **Exact match** (`skill`): Must exactly match a skill in the array
- **Range filters** (`minExp`, `maxExp`): Numeric comparison

### Sorting

Available sort fields:
- `updatedAt` (default) - Most recently updated first
- `createdAt` - Most recently created first
- `fullName` - Alphabetical by name
- `yearsOfExperience` - By experience level
- `score` - By candidate score

Sort order:
- `desc` (default) - Descending order
- `asc` - Ascending order

### Pagination

- **Default page size:** 12 candidates
- **Maximum page size:** 100 candidates
- **Page numbering:** Starts at 1
- **Response includes:**
  - `page` - Current page number
  - `pageSize` - Number of items per page
  - `total` - Total number of matching candidates
  - `totalPages` - Total number of pages

### Caching

List results are cached for 5 minutes to improve performance. Cache is automatically cleared when:
- A candidate is updated (PATCH)
- Any mutation occurs

## 🧮 Related Candidates Scoring Logic

The `/api/candidates/:id/related` endpoint ranks candidates using a weighted similarity algorithm:

### Scoring Components

1. **Skill Overlap (50% weight)**
   ```
   score = (number of common skills / max(candidate skills, target skills)) × 50
   ```
   - Measures how many skills are shared between candidates
   - Uses Jaccard similarity (intersection/maximum)
   - Higher score for more shared skills

2. **Location Match (30% weight)**
   ```
   score = exact match ? 30 : 0
   ```
   - Full points if location matches exactly (case-insensitive)
   - Zero points if different location

3. **Experience Band Similarity (20% weight)**
   ```
   score = max(0, 20 - |experience_difference| × 2)
   ```
   - Compares years of experience
   - Loses 2 points per year of difference
   - Minimum score is 0

### Example Calculation

Target Candidate:
- Skills: `["JavaScript", "React", "Node.js"]` (3 skills)
- Location: `"San Francisco, CA"`
- Experience: `8 years`

Candidate A:
- Skills: `["JavaScript", "React", "TypeScript"]` (2 common: JS, React)
- Location: `"San Francisco, CA"` (match)
- Experience: `7 years` (1 year difference)

**Score Calculation:**
- Skill: `(2/3) × 50 = 33.3`
- Location: `30` (exact match)
- Experience: `20 - (1 × 2) = 18`
- **Total: 81.3**

Candidates are sorted by total score (descending) and the top 8 are returned.

## 📁 Project Structure

```
.
├── dist/                          # Compiled TypeScript output (production)
├── generated/                     # Prisma-generated types
├── node_modules/                  # Dependencies
├── data/
│   ├── candidates.json           # Seed data
│   └── seed.ts                   # Database seeding script
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   └── validations.ts            # Input validation schemas
├── middleware/
│   ├── apiKey.ts                 # API key authentication
│   └── errorHandler.ts           # Global error handling
├── models/                        # TypeScript type definitions
│   ├── candidate.ts
│   ├── candidateListResponse.ts
│   ├── candidateResponse.ts
│   ├── errorResponse.ts
│   ├── listCandidatesQuery.ts
│   └── updateCandidateRequest.ts
├── prisma/
│   ├── schema.prisma             # Database schema definition
│   └── migrations/               # Database migration files
├── services/
│   └── candidateService.ts       # Business logic and services
├── index.ts                       # Application entry point
├── tsconfig.json                  # TypeScript configuration
├── prisma.config.ts              # Prisma configuration
├── docker-compose.yml             # Docker Compose setup
├── .env                          # Environment variables (local, gitignored)
├── .env.example                  # Environment variables template
├── package.json                  # Project dependencies
└── README.md                     # This file
```

## 📊 Database Schema

### Candidate Model

The application manages candidate profiles with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier (primary key) |
| fullName | string | Candidate's full name |
| headline | string | Professional headline |
| location | string | Geographic location |
| yearsOfExperience | integer | Years of professional experience |
| skills | string[] | Array of technical/professional skills |
| availability | string | Job availability status |
| status | string | Candidate status (e.g., screening, interviewing) |
| score | integer | Candidate evaluation score |
| shortlisted | boolean | Whether candidate is shortlisted (default: false) |
| rejected | boolean | Whether candidate is rejected (default: false) |
| createdAt | timestamp | Record creation timestamp |
| updatedAt | timestamp | Last updated timestamp |

### AuditEvent Model

Tracks all changes made to candidates:

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier (primary key) |
| candidateId | string | Foreign key to Candidate |
| at | timestamp | When the change occurred (default: now) |
| action | string | Type of action (e.g., status_updated, shortlisted_updated) |
| from | string? | Previous value (optional) |
| to | string? | New value (optional) |

## ⚖️ Trade-offs & Design Decisions

### Current Implementation

1. **In-Memory Caching**
   - ✅ **Pro:** Simple to implement, no external dependencies
   - ✅ **Pro:** Fast response times for repeated queries
   - ❌ **Con:** Cache lost on server restart
   - ❌ **Con:** Not shared across multiple server instances
   - **Decision:** Acceptable for MVP/single-instance deployment

2. **Simple API Key Authentication**
   - ✅ **Pro:** Easy to implement and use
   - ✅ **Pro:** No complex token management
   - ❌ **Con:** No user-level permissions or roles
   - ❌ **Con:** Single shared key across all clients
   - **Decision:** Sufficient for internal/trusted clients

3. **Postgres Full-Text Search**
   - ✅ **Pro:** Built into database, no additional services
   - ✅ **Pro:** Works well for moderate data volumes
   - ❌ **Con:** Limited relevance ranking
   - ❌ **Con:** No fuzzy matching or typo tolerance
   - **Decision:** Good enough for structured candidate data

4. **Synchronous Related Candidates**
   - ✅ **Pro:** Simple algorithm, easy to understand
   - ✅ **Pro:** Accurate similarity scoring
   - ❌ **Con:** Loads all candidates into memory
   - ❌ **Con:** O(n) complexity, doesn't scale to millions
   - **Decision:** Acceptable for <100k candidates

5. **Audit Log on Updates Only**
   - ✅ **Pro:** Tracks important state changes
   - ✅ **Pro:** Simple to implement
   - ❌ **Con:** No tracking of reads or failed attempts
   - ❌ **Con:** No user attribution (who made the change)
   - **Decision:** Covers primary use case of status tracking

## 🚀 Next Improvements

### Short-term (Days)

1. **Add Test Coverage**
   - Unit tests for service layer
   - Integration tests for API endpoints
   - Test database seeding for isolation

2. **Enhanced Error Handling**
   - Rate limiting per API key
   - Request validation error details
   - Database connection retry logic

3. **API Documentation**
   - Swagger/OpenAPI spec generation
   - Interactive API documentation UI
   - Request/response examples

### Mid-term (Weeks)

4. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (admin, recruiter, viewer)
   - User attribution in audit logs
   - API key rotation mechanism

5. **Search Improvements**
   - Elasticsearch integration for better full-text search
   - Fuzzy matching for typo tolerance
   - Search result highlighting
   - Saved search queries

6. **Caching Strategy**
   - Redis for distributed caching
   - Cache invalidation strategies
   - Cache warming on startup
   - Configurable TTL per endpoint

7. **Related Candidates Optimization**
   - Pre-compute similarity scores
   - Use database queries for initial filtering
   - Consider vector embeddings for semantic similarity
   - Cache related candidates per profile

### Long-term (Months)

8. **Performance & Scalability**
   - Database indexing optimization
   - Query performance monitoring
   - Horizontal scaling support
   - Read replicas for queries

9. **Advanced Features**
   - Candidate notes and comments
   - File attachment support (resumes, portfolios)
   - Email notifications for status changes
   - Bulk operations (batch updates)
   - CSV import/export

10. **Analytics & Reporting**
    - Candidate pipeline metrics
    - Time-to-hire tracking
    - Skill demand analytics
    - Location-based insights

11. **Real-time Updates**
    - WebSocket support for live updates
    - Push notifications
    - Collaborative editing (conflict resolution)

12. **Machine Learning**
    - Candidate scoring predictions
    - Automated skill extraction from resumes
    - Interview success prediction
    - Personalized candidate recommendations

## 🔧 Troubleshooting

### "connect ECONNREFUSED 127.0.0.1:5433"

The PostgreSQL database is not running. Ensure Docker is running and start the database:

```bash
docker-compose up -d
```

### "relation 'Candidate' does not exist"

Migrations have not been applied. Run:

```bash
npm run prisma:migrate
```

### "Invalid API key"

Ensure your `.env` file contains the correct API key and you're passing it in the `x-api-key` header:

```bash
curl -H "x-api-key: dev-api-key" http://localhost:8080/api/candidates
```

### Port 5433 already in use

Another service is using port 5433. Either:
- Stop the conflicting service
- Change the port in `docker-compose.yml` (e.g., `5434:5432`)
- Update `DATABASE_URL` in `.env` accordingly

### TypeScript compilation errors

Ensure you're using Node.js v18 or higher:

```bash
node --version
```

If errors persist, reinstall dependencies:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Empty candidate list after seeding

Verify the seed script ran successfully:

```bash
npm run seed
```

Check the database using Prisma Studio:

```bash
npm run prisma:studio
```

### Server not reloading in development

If `npm run dev` doesn't hot-reload:
1. Check for syntax errors in your TypeScript files
2. Restart the dev server
3. Clear the `dist/` folder if it exists

## 📝 Notes

- **Authentication:** All `/api/*` endpoints require the `x-api-key` header
- **Environment:** Variables are loaded from `.env` via `dotenv`
- **Hot Reload:** Development uses `tsx watch` for instant feedback
- **TypeScript:** Strict mode enabled for type safety
- **Build Output:** All TypeScript files compile to `dist/` for production
- **Source Maps:** Generated for easier debugging
- **Database Port:** Uses 5433 (not 5432) to avoid conflicts
- **Caching:** List results cached for 5 minutes, cleared on updates

## 🤝 Development Workflow

1. Create a new feature branch
2. Make changes and verify with `npm run dev`
3. Test API endpoints with curl or Postman
4. Use Prisma Studio to validate database changes
5. Build for production with `npm run build`
6. Commit and push changes

## 📄 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production server |
| `npm run seed` | Populate database with sample data |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Apply database migrations |
| `npm run prisma:studio` | Open Prisma Studio UI |

---

**Created:** February 2026
**Stack:** Node.js + Express + TypeScript + PostgreSQL + Prisma
