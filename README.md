# HostelCare — Hostel Maintenance & Issue Tracking System

A full-stack hostel maintenance issue tracking application based on the supplied ER diagram. Frontend: Next.js App Router, React, TypeScript and Tailwind CSS. Backend: Next.js Route Handlers. Primary relational database: PostgreSQL via Prisma. MongoDB stores supplementary activity logs and is optional for local development.

## Features included
- Student registration and login using bcrypt password hashing and HTTP-only JWT session cookies.
- Student issue creation and issue listing.
- Warden/admin staff assignment and status controls in the dashboard.
- Assigned staff work-start and resolution controls in the dashboard.
- Student feedback controls for resolved issues.
- Dashboard statistics and role-scoped issue listing.
- MongoDB activity event logging.

## Requirements
- Node.js 20.9+
- PostgreSQL 14+
- MongoDB Community Server or MongoDB Atlas

## Setup
1. Extract the ZIP and open this folder in VS Code.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a PostgreSQL database named `hostel_maintenance`.
4. Copy `.env.example` to `.env` and update `DATABASE_URL` and `JWT_SECRET`. `MONGODB_URI` is optional; set it to enable activity logs.
5. Create the PostgreSQL tables:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
6. Seed required issue statuses and one demo hostel/room:
   ```bash
   npx tsx prisma/seed.ts
   ```
7. Start the app:
   ```bash
   npm run dev
   ```
8. Visit http://localhost:3000.

## Important first-run notes
- Public registration intentionally creates STUDENT accounts only. Do not expose public staff, warden or admin registration.
- The seed creates room `204` in `Demo Hostel`. Student registration can leave room number blank or use `204`.
- To create a warden/staff/admin account for demonstration, register a normal account, then update its `role` in PostgreSQL using Prisma Studio or SQL. Example:
  ```sql
  UPDATE "User" SET role = 'WARDEN' WHERE email = 'warden@example.com';
  UPDATE "User" SET role = 'STAFF', "staffRole" = 'Electrician' WHERE email = 'staff@example.com';
  ```
  Log out and log in again after changing a role so the session refreshes.
- Add a staff user before testing the assignment endpoint. The endpoint is `PATCH /api/issues/{id}/assign` with JSON `{ "staffId": "..." }`.
- Staff can update status with `PATCH /api/issues/{id}/status` and JSON `{ "statusName": "IN_PROGRESS" }` or `RESOLVED`.
- Students can submit feedback to `POST /api/issues/{id}/feedback` after resolution with `{ "rating": 5, "comments": "Fixed properly" }`.

## API summary
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register student |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET, POST | `/api/issues` | List/create issues |
| PATCH | `/api/issues/:id/assign` | Warden/admin assigns staff |
| PATCH | `/api/issues/:id/status` | Authorized status update |
| POST | `/api/issues/:id/feedback` | Student feedback |
| GET | `/api/dashboard` | Dashboard counts |

## How the database maps to the team's ER diagram
The PostgreSQL schema represents Hostel, Room, Student profile, Staff profile, Maintenance_Issue, Issue_Status and Feedback. A shared `User` table provides login credentials and roles; its `role`, `course`, `staffRole` and `roomNo` fields represent student/staff identity details. `IssueComment` is an optional extension for issue discussion. MongoDB stores supplementary `activity_logs` documents and does not replace PostgreSQL relational records.

## Role setup and demo workflow
Public signup creates student accounts only. For a demo, register student, staff and warden accounts, then promote the latter accounts through Prisma Studio or SQL. Example SQL:
```sql
UPDATE "User" SET role = 'WARDEN' WHERE email = 'warden@example.com';
UPDATE "User" SET role = 'STAFF', "staffRole" = 'Electrician' WHERE email = 'staff@example.com';
```
Log out and back in after changing a role. Wardens/admins can assign issues from the dashboard; assigned staff can start work and resolve issues; students can rate resolved issues. Ensure you promote at least one staff account before assigning work.

This is a project MVP and still needs operational hardening before production, including rate limiting, account recovery, deployment secrets and institution-specific access policies.
