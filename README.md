# Smart Placement Tracker

Production-ready MERN placement management platform for colleges and universities.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, Tailwind CSS, Redux Toolkit, Axios, Recharts, Socket.IO Client |
| Backend | Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Multer, Socket.IO |
| Security | Helmet, CORS, rate limiting, mongo-sanitize |

## Features

- Student & admin authentication (JWT, forgot/reset password)
- Student profile, resume PDF upload, skills, projects, certifications
- Placement drives with eligibility (CGPA, branch, backlogs, skills)
- Application tracking (Applied → Selected/Rejected)
- Real-time notifications (Socket.IO)
- Admin analytics dashboards & report export (PDF/Excel)
- AI helpers: ATS score, skill gap, drive recommendations, placement prediction

## Project Structure

```
Placement_Tracker/
├── backend/          # Express API (MVC)
├── frontend/         # React + Vite app
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB running locally or Atlas URI

### 1. Backend

```bash
cd backend
cp .env.example .env   # edit MONGODB_URI & JWT_SECRET
npm install
npm run seed           # sample data
npm run dev            # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev            # http://localhost:5173
```

### Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@college.edu | admin123 |
| Student | rahul@cse.edu | student123 |

## API Examples

```bash
# Health
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@college.edu","password":"admin123"}'

# Get drives (with token)
curl http://localhost:5000/api/drives \
  -H "Authorization: Bearer YOUR_TOKEN"

# Apply for drive (student)
curl -X POST http://localhost:5000/api/applications/apply/DRIVE_ID \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

## Deployment

### Backend (Render)

1. Create Web Service, connect repo, root: `backend`
2. Build: `npm install`
3. Start: `npm start`
4. Env: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (Vercel URL)

### Frontend (Vercel)

1. Import repo, root: `frontend`
2. Env: `VITE_API_URL=https://your-api.onrender.com/api`
3. Env: `VITE_SOCKET_URL=https://your-api.onrender.com`
4. Build: `npm run build`, output: `dist`

### MongoDB

Use [MongoDB Atlas](https://www.mongodb.com/atlas) and set `MONGODB_URI` on Render.

## Recommended Improvements

- OAuth (Google/GitHub) login
- OpenAI integration for resume parsing
- Interview scheduling calendar
- Mobile app (React Native)
- CI/CD with GitHub Actions
- Unit & E2E tests (Jest, Cypress)

## Docker

```bash
# Set JWT_SECRET in .env or environment
docker compose up --build
```

- Frontend: http://localhost:5173  
- API: http://localhost:5000/api  
- MongoDB: localhost:27017  

## Architecture

```
Browser → React (Redux) → REST API (Express) → MongoDB
                ↓
           Socket.IO (notifications, drives, applications)
```

- **Redux:** `auth` (session), `theme` (dark/light), `notifications` (inbox + socket)
- **Protected routes:** `ProtectedRoute` → `DashboardLayout` → page via `<Outlet />`
- **Resume files:** served only via `GET /api/students/resume/file` (not public `/uploads`)

## API Documentation

See [docs/API.md](docs/API.md).

## Recent Improvements (v1.1)

- Fixed admin **Applications**, **Companies**, **Drives** routing and blank pages
- JWT error handling (401 for expired/invalid tokens)
- Auth bootstrap + loading gate on protected routes
- Secure resume download; removed public upload static serving
- Shared `PageState` (loading/error/empty) across dashboards
- Admin inbox vs broadcast routes split
- Settings page, 404 page, Docker Compose
- Enhanced Resume AI analyzer UI

## License

MIT


//Admin Login:
  Email: admin@college.edu
  Password: admin123

Student Logins (password: student123):
  rahul@cse.edu
  priya@it.edu
  amit@ece.edu
  sneha@cse.edu
  vikram@mech.edu
  sadaf@it.edu