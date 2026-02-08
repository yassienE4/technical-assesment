# Backend Engineer Technical Assessment

## Overview
Build a backend service for a **Recruitment Platform** that manages candidate profiles and supports searching, filtering, and profile updates.

This assessment focuses on:
- API design
- Correctness
- Data modeling
- Validation
- Production-minded fundamentals

**Timebox:** 4–6 hours  
**Deliverable:** GitHub repo or zip  
**Language / Framework:** Node.js **or** Python (FastAPI)  
**Storage:** In-memory acceptable; SQLite/Postgres is a plus (optional)

---

## 1) Requirements

### 1.1 Project Setup (Required)
Your service must be runnable locally with simple commands.

Provide a `README` with:
- How to install dependencies
- How to start the server
- Example requests (curl)
- Design decisions + trade-offs
- Time spent estimate

---

### 1.2 API Style (Required)
Choose **one** and be consistent:
- REST (recommended)
- GraphQL

You must implement:
- Request validation
- Consistent error responses
- Pagination on list endpoints

---

## 2) Data Model

### 2.1 Seed Data (Required)
Include a seed dataset of **20–40 candidates** in the repo (e.g. `data/candidates.json`) and load it on startup **OR** import it into a database.

### Candidate (minimum fields)
- `id` (string)
- `fullName` (string)
- `headline` (string)
- `location` (string)
- `yearsOfExperience` (number)
- `skills` (string[])
- `availability` (string)
- `updatedAt` (ISO date string)
- `status` (string)
- `score` (number)

### Backend-managed fields (Required)
- `shortlisted` (boolean)
- `rejected` (boolean)
- `auditLog` (array)

---

## 3) Core Endpoints (Required)

### Health
`GET /health`

### List Candidates
`GET /candidates`

Supports search, filter, sort, and pagination.

### Get Candidate by ID
`GET /candidates/:id`

### Update Candidate
`PATCH /candidates/:id`

### Related Candidates
`GET /candidates/:id/related`

---

## 4) Non-Functional Requirements

### Validation & Errors
Return consistent error responses.

### Security
Implement one basic security mechanism (API key, rate limit, or JWT stub).

### Observability
Log requests and errors.

---

## 5) Nice to Have
- Swagger docs
- Database + migrations
- Unit tests
- Docker
- Clean architecture

---

## 6) Deliverables
- Source code
- Seed data
- README
- Optional API collection

---

## 7) Evaluation Rubric
- API design & correctness (35%)
- Code quality & structure (30%)
- Validation & robustness (20%)
- Testing & maintainability (15%)
