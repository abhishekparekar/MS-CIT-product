# ITPL MS-CIT Management SaaS - Backend REST API

Production-ready, Multi-Tenant B2B SaaS REST API Backend built with **Node.js, Express, and MongoDB Atlas**.

---

## 🌟 SaaS Core Capabilities

- **Multi-Tenant Franchise Architecture:** Complete data isolation per franchise center with tenant subscriptions, quotas, and licensing.
- **Role-Based Access Control (RBAC):** `superadmin` (Platform Owner), `franchise` (Center Admin), `student` (Learner).
- **Academic Lifecycle Management:** Student enrollment, automated roll number generation (`MSCIT-2026-0001`), batch scheduling, hall tickets.
- **Online Examination Engine:** Question bank, duration timers, automated scoring, percentage, and grade calculation (`A+`, `A`, `B`, `C`, `F`).
- **Marksheets & Certificates:** Automated marksheet generation and public certificate verification endpoint (`/api/certificates/verify/:certNumber`).
- **Fee Management & Receipts:** Installment tracking, payment modes (Cash/UPI/Bank), automated receipt numbers (`REC-2026-0001`).
- **Public Center Affiliation Engine:** Public center applications with automated tenant onboarding upon Super Admin approval.

---

## 🚀 Quick Setup & Execution

### 1. Configure MongoDB Atlas
In `backend/.env`, set your connection string:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mscit_saas?retryWrites=true&w=majority
JWT_SECRET=mscit_saas_ultra_secure_jwt_secret_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### 2. Seed Initial Database (Courses, Admin, Franchise, Exam)
```bash
cd backend
npm run seed
```

### 3. Start Backend Server
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

---

## 🔑 Default Seeded Demo Credentials

| Role | Email / Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@itpl.com` / `admin` | `admin123` | Full platform control, tenant licensing, fee audit |
| **Franchise Center** | `franchise@itpl.com` / `franchise` | `franchise123` | Shivaji Nagar Center (ITPL-101) |
| **Student** | `student@itpl.com` / `MSCIT-2026-0001` | `student123` | Enrolled in MS-CIT course |

---

## 📡 Key REST API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email / username / roll number & password
- `GET  /api/auth/me` - Get current session user

### 🏢 Tenants & Franchises (`/api/tenants`, `/api/franchises`)
- `GET  /api/franchises/me` - Logged in franchise profile & dashboard KPIs
- `GET  /api/tenants` - List all franchise centers (Admin)
- `POST /api/tenants` - Create / provision new franchise center
- `PUT  /api/tenants/:id` - Update franchise center details

### 🎓 Students (`/api/students`)
- `GET  /api/students` - Get students (filtered by franchise tenant)
- `POST /api/students` - Enroll student & generate roll number
- `POST /api/students/:id/hall-ticket` - Issue hall ticket

### 📖 Courses (`/api/courses`)
- `GET  /api/courses` - Public course catalog
- `POST /api/courses` - Create new course (Admin)

### 📝 Exams & Results (`/api/exams`)
- `GET  /api/exams` - Active exams list
- `POST /api/exams/:id/submit` - Take exam & auto-grade
- `GET  /api/exams/submissions` - View exam results

### 📜 Certificates & Marksheets (`/api/certificates`, `/api/marksheets`)
- `POST /api/marksheets` - Generate student marksheet
- `POST /api/certificates` - Generate verifiable certificate
- `GET  /api/certificates/verify/:certNumber` - Public certificate verification

### 💰 Fees & Receipts (`/api/fees`)
- `POST /api/fees/pay` - Record fee payment & generate receipt
- `GET  /api/fees/receipt/:receiptNumber` - View / print receipt

### 🤝 Public Affiliations (`/api/affiliations`)
- `POST /api/affiliations` - Public center application form
- `POST /api/affiliations/:id/approve` - Approve & provision tenant
