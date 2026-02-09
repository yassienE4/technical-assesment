# Recruitment Platform Backend

A Node.js + Express backend service for managing candidate profiles, built with TypeScript and PostgreSQL.

## 📋 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js v5
- **Language:** TypeScript (ES2023)
- **Database:** PostgreSQL 16
- **ORM:** Prisma v7
- **Package Manager:** npm
- **Development:** ts-node-dev (hot reload)
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
```

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

### 6. Seed the Database

Populate the database with initial candidate data:

```bash
npm run seed
```

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

## 📁 Project Structure

```
.
├── dist/                          # Compiled TypeScript output (production)
├── generated/                     # Prisma-generated types
├── node_modules/                  # Dependencies
├── prisma/
│   ├── schema.prisma             # Database schema definition
│   └── migrations/                # Database migration files
├── services/                      # Business logic and services
├── models/
│   └── candidate.ts              # Candidate type definition
├── index.ts                       # Application entry point
├── tsconfig.json                  # TypeScript configuration
├── prisma.config.ts              # Prisma configuration
├── docker-compose.yml             # Docker Compose setup
├── .env                          # Environment variables (local)
├── .env.example                  # Environment variables template
├── package.json                  # Project dependencies
└── README.md                     # This file
```

## 📊 Database Schema

### Candidate Model

The application manages candidate profiles with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier (UUID) |
| fullName | string | Candidate's full name |
| headline | string | Professional headline |
| location | string | Geographic location |
| yearsOfExperience | integer | Years of professional experience |
| skills | string[] | Array of technical/professional skills |
| availability | string | Job availability status |
| status | string | Candidate status (e.g., pending, reviewed) |
| score | integer | Candidate evaluation score |
| updatedAt | timestamp | Last updated timestamp |

## 🔧 Troubleshooting

### "connect ECONNREFUSED 127.0.0.1:5432"

The PostgreSQL database is not running. Ensure Docker is running and start the database:

```bash
docker-compose up -d
```

### "relation 'Candidate' does not exist"

Migrations have not been applied. Run:

```bash
npm run prisma:migrate
```

### Port 5432 already in use

Another service is using the PostgreSQL port. Either:
- Stop the conflicting service
- Change the port in `docker-compose.yml` (e.g., `5433:5432`)

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

## 📝 Notes

- Environment variables are loaded from `.env` via `dotenv`
- Hot reload in development uses `ts-node-dev` for instant feedback
- TypeScript strict mode is enabled for type safety
- All TypeScript files are compiled to `dist/` for production
- Source maps are generated for easier debugging

## 🤝 Development Workflow

1. Create a new feature branch
2. Make changes and verify with `npm run dev`
3. Build for production with `npm run build`
4. Use Prisma Studio to validate database changes
5. Commit and push changes

---

**Created:** February 2026
