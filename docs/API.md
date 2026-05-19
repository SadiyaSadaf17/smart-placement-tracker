# Placement Tracker API Reference

Base URL: `http://localhost:5000/api`

## Authentication

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| POST | `/auth/forgot-password` | Public |
| PUT | `/auth/reset-password/:token` | Public |
| GET | `/auth/me` | Bearer token |
| POST | `/auth/logout` | Bearer token |

Header: `Authorization: Bearer <token>`

## Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/students/profile` | Profile |
| PUT | `/students/profile` | Update profile |
| POST | `/students/resume` | Upload PDF (multipart `resume`) |
| GET | `/students/resume/file` | Download own resume (auth) |
| GET | `/students/drives` | Eligible drives + eligibility |
| GET | `/students/analytics` | Dashboard stats |
| GET | `/students/ai-insights` | ATS, recommendations, prediction |
| GET | `/students/leaderboard` | Top students |

## Applications

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/applications/apply/:driveId` | Student |
| GET | `/applications/my` | Student |
| GET | `/applications` | Admin (query: `search`, `round`, `page`, `limit`) |
| PUT | `/applications/:id/round` | Admin body: `{ currentRound, remarks? }` |

## Drives & Companies

- `GET/POST/PUT/DELETE /drives` — admin mutations
- `GET /drives/:id/eligible-students` — admin
- `GET/POST/PUT/DELETE /companies` — admin write

## Admin

- `GET /admin/dashboard` — stats
- `GET /admin/students` — list (filters)
- `POST /admin/notifications/bulk` — broadcast

## Analytics & Reports

- `GET /analytics` — admin charts data
- `GET /reports/students/pdf|excel` — exports
- `GET /activity` — audit logs (admin)

## Socket.IO

Connect with `auth: { token }`. Events:

- Client → `join` (userId), `join-admin`
- Server → `notification`, `new-drive`, `new-application`, `application-update`, `selection`
