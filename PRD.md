# Product Requirement Document (PRD)

**Project Name:** ITPL Education & Training Portal  
**Document Version:** 1.0.0  
**Status:** Approved / Active Baseline  
**Target Platform:** Web (Desktop & Mobile Responsive)  
**Primary Tech Stack:** React 19, React Router v6, Firebase (Auth, Realtime Database, Firestore, Storage)

---

## 1. Executive Summary & Product Vision

### 1.1 Objective
The **ITPL Education Portal** is a centralized, multi-tenant academic and franchise operations management system designed to connect:
1. **Public Prospective Students & Partners** seeking vocational, technical, or computer courses and franchise affiliations.
2. **Training Centers / Franchises** managing local student enrollments, batches, coaching, hall tickets, marksheets, and certifications.
3. **Students** accessing academic profiles, receipts, examination portals, and certificates.
4. **Super Administrators** supervising franchise affiliations, fee collections, student records, content uploads, and centralized inquiries.

### 1.2 Core Value Proposition
- **Automated Franchise Affiliation Workflow:** End-to-end paperless submission, review, approval, and account onboarding.
- **Hierarchical Access Control:** Role-segregated environments for Admin, Franchise, and Student users.
- **Academic Lifecycle Automation:** Integrated examination engine, automated hall-ticket generation, marksheet compilation, and certificate issuance.
- **Unified Fee & Payment Tracking:** Center-level and student-level financial auditability.

---

## 2. User Roles & Permissions Matrix

| User Role | Description | Key Capabilities |
| :--- | :--- | :--- |
| **Public Visitor** | Unauthenticated prospective students or center owners | View courses, demo lectures, testimonials, gallery; apply for admission; submit franchise affiliation requests; send contact messages. |
| **Student** | Enrolled student at an affiliated training center | Login via Student ID / Email; view profile & enrollment; download fee receipts; take online examinations; view results. |
| **Franchise / Center Admin** | Approved Training Center Director / Staff | Manage student admissions under center ID; issue hall tickets; grade / generate marksheets; issue completion certificates; monitor fee collections. |
| **Super Admin** | System Administrator / Head Office Authority | Review & approve/reject franchise affiliation requests; oversee all franchises and students; track overall fee dues; upload gallery content; manage system settings. |

---

## 3. End-to-End System Workflows & User Journeys

```
                    ┌──────────────────────────────────────────────┐
                    │            Public Visitor / User             │
                    └───────┬───────────────────────────────┬──────┘
                            │                               │
            Franchise Application                   Student Application
                            │                               │
                            ▼                               ▼
            ┌───────────────────────────────┐   ┌───────────────────────────────┐
            │ trainingCenterApplications DB │   │   admissionApplications DB    │
            └───────────────┬───────────────┘   └───────────────┬───────────────┘
                            │                               │
                            ▼ (Admin Review & Approval)     ▼ (Franchise Verification)
            ┌───────────────────────────────┐   ┌───────────────────────────────┐
            │        Super Admin            │   │      Franchise Center         │
            │   - Approves Center           │   │   - Enrolls Student           │
            │   - Activates Franchise Login │   │   - Assigns Student ID/Pass   │
            └───────────────┬───────────────┘   └───────────────┬───────────────┘
                            │                               │
                            ▼                               ▼
            ┌───────────────────────────────┐   ┌───────────────────────────────┐
            │   Franchise Portal Access     │   │     Student Portal Access     │
            │   (/franchise/dashboard)      │   │     (/student/dashboard)      │
            └───────────────┬───────────────┘   └───────────────┬───────────────┘
                            │                               │
                            ├─ Issue Hall Ticket            ├─ View Profile & Fees
                            ├─ Conduct Exam                 ├─ Take Online Exam
                            ├─ Generate Marksheet           ├─ Download Receipt
                            └─ Issue Certificate            └─ View Exam Status
```

---

## 4. Module-Wise Functional Requirements

### 4.1 Module 1: Public Marketing & Inquiries
- **Landing Page (`/`):**
  - Interactive hero banner, featured courses, institute accreditations, key statistics counters, notices, student testimonials.
- **Course Catalog (`/courses`):**
  - Categorized course listings with syllabus breakdowns, durations, eligibility, and fee details.
- **Demo Lectures (`/demo-lectures`):**
  - Curated video lectures showcasing teaching methodology.
- **Photo Gallery (`/gallery`):**
  - Dynamic gallery fetched from Firebase Storage/DB categorized by events, center activities, and convocations.
- **Affiliation Application (`/affiliation`):**
  - Multi-section form capturing Personal Info, Infrastructure (systems, classrooms, labs, area), Payment Details, and Proposed Login Credentials. Saves to `trainingCenterApplications`.
- **Student Direct Application (`/apply-now`, `/register`):**
  - Online student enrollment form capturing academic background and preferred training center.

---

### 4.2 Module 2: Authentication & Authorization Engine
- **Multi-Role Login Gateway (`/login`):**
  - Support for Email/Password, Student ID, Google Sign-in, and Facebook Sign-in.
  - Role dropdown selector (`student`, `franchise`, `admin`) to route authenticated sessions to their respective workspaces.
- **Session Management (`AuthContext.js` & `FranchiseAuthContext.js`):**
  - LocalStorage persistence for continuous session preservation across page reloads.
  - Firebase `onAuthStateChanged` listeners verifying real-time account status (`active` vs `disabled`/`pending`).
- **Route Guarding (`ProtectedRoute.js`):**
  - Intercepts unauthorized navigation, checks role permissions, displays animated validation states, and redirects unauthenticated users to `/login`.

---

### 4.3 Module 3: Super Admin Portal (`/admin/*`)
- **Dashboard (`/admin/dashboard`):**
  - Visual KPI metrics: Total Active Franchises, Total Enrolled Students, Revenue/Fees Collected, Pending Affiliation Inquiries.
  - Interactive animated SVG Donut Charts for student distribution and course metrics.
- **Affiliation Management (`/admin/students/affiliation-list` & `/admin/students/approved-affiliation`):**
  - Table of pending center requests with full infrastructure audit details.
  - Action buttons: "Approve Affiliation" (provisions active status) or "Reject".
- **Franchise Management (`/admin/franchise-list`, `/admin/add-franchise`):**
  - Comprehensive directory of all registered training centers with contact information and status toggles.
- **Financial Auditing (`/admin/franchise-fees`, `/admin/franchise-student-fees`, `/admin/students/payments`):**
  - Ledger tracking center affiliation fee settlements and student fee distributions.
- **Inquiry Inbox (`/admin/messages`):**
  - Management console for inquiries, queries, and feedback submitted via public contact forms.
- **Content Management (`/admin/gallery-upload`):**
  - Media uploader for adding pictures directly to Firebase Cloud Storage and DB.

---

### 4.4 Module 4: Franchise Portal (`/franchise/*`)
- **Franchise Dashboard (`/franchise/dashboard`):**
  - Center-specific overview: Active student count, pending admissions, fees collected, upcoming exams.
- **Student Enrollment (`/franchise/application-form`):**
  - Register new students directly under the franchise's unique `franchiseId`.
  - Automatic creation of student credentials in `studentCredentials`.
- **Student Directory (`/franchise/students/approved`, `/franchise/students/passed`):**
  - Filterable list of enrolled students, course allocations, and academic progression.
- **Academic Documents Generation & Issuance:**
  - **Hall Tickets (`/franchise/forms/hall-ticket`, `/franchise/downloads/hall-ticket`):** Generate and print exam admit cards containing roll numbers, exam dates, center address, and student photos.
  - **Exam Scheduling (`/franchise/forms/exam`):** Setup test schedules and assign courses.
  - **Marksheet Processing (`/franchise/forms/marksheet`, `/franchise/downloads/marksheet`):** Input subject-wise theory & practical marks; auto-calculate percentages, grades, and generate printable marksheets.
  - **Certificate Issuance (`/franchise/forms/certificate`, `/franchise/downloads/certificate`):** Create and print official course completion certificates with unique serial numbers.
- **Fee Management (`/franchise/fees`):**
  - Record payments, issue fee receipts, and view outstanding student dues.

---

### 4.5 Module 5: Student Portal (`/student/*`)
- **Student Dashboard (`/student/dashboard`):**
  - Displays student name, roll number, course, batch timing, center name, and examination status cards.
- **Student Profile (`/student/profile`, `/student/edit-profile`):**
  - View and edit contact details, address, and profile pictures.
- **Online Examination Engine (`/student/exam`):**
  - Timed online test interface.
  - Multiple-choice questions (MCQ) with question palettes (Answered, Unanswered, Marked for Review).
  - Automatic submission on timer expiration.
- **Receipt Center (`/student/receipt`):**
  - View and print official fee payment vouchers and transaction receipts.

---

## 5. Technical Architecture & Component Hierarchy

### 5.1 Technology Stack
- **UI Framework:** React 19 (`react`, `react-dom`)
- **Routing Engine:** React Router DOM v6 (`react-router-dom`)
- **Icons & Styling:** `react-icons`, `styled-components`, Vanilla CSS design system
- **Backend / Database Services:**
  - **Firebase Auth:** Authentication & identity provider
  - **Firebase Realtime Database:** Low-latency JSON data store for applications, student records, and settings
  - **Cloud Firestore:** Document management
  - **Firebase Cloud Storage:** Image uploads, ID proofs, and certificates

### 5.2 Folder & Layout Mapping
```
src/
├── components/          # DashboardHeader, Sidebar, Navbar, Footer, FormInput
├── layouts/             # PublicLayout, AdminLayout, FranchiseLayout, StudentLayout
├── pages/
│   ├── public/          # Home, About, Courses, DemoLectures, Affiliation, ApplyNow, Login, Register
│   ├── admin/           # AdminDashboard, FranchiseList, Messages, Forms, Downloads
│   ├── franchise/       # FranchiseDashboard, ApplicationForm, Fees, Forms, Downloads
│   ├── student/         # StudentDashboard, Profile, Exam, Receipt
│   └── error/           # NotFound, Unauthorized
├── routes/              # AppRoutes.js, ProtectedRoute.js
├── utils/               # AuthContext.js, FranchiseAuthContext.js
└── firebase/            # config.js
```

---

## 6. Firebase Data Schema & Model Specifications

```json
{
  "users": {
    "{uid}": {
      "email": "string",
      "displayName": ["firstName", "lastName"],
      "role": "student | admin | franchise",
      "userType": "student | admin | franchise",
      "profile": {
        "firstName": "string",
        "lastName": "string",
        "phone": "string",
        "address": "string",
        "profileImage": "string (URL)"
      },
      "createdAt": "timestamp",
      "lastLogin": "timestamp",
      "isActive": true
    }
  },
  "trainingCenterApplications": {
    "{applicationId}": {
      "centerName": "string",
      "firmName": "string",
      "ownerName": "string",
      "contactNumber": "string",
      "email": "string",
      "centerAddress": "string",
      "district": "string",
      "state": "string",
      "trade": "string",
      "computerSystems": "number",
      "noOfClassroom": "number",
      "noOfLab": "number",
      "affiliationFee": "number",
      "userName": "string",
      "status": "Pending | Approved | Rejected",
      "submittedAt": "timestamp"
    }
  },
  "studentCredentials": {
    "{studentId}": {
      "email": "string",
      "password": "string",
      "franchiseId": "string",
      "status": "active | graduated | inactive",
      "studentInfo": {
        "firstName": "string",
        "lastName": "string",
        "rollNumber": "string",
        "course": "string",
        "batch": "string",
        "phone": "string",
        "admissionDate": "string"
      },
      "createdAt": "timestamp",
      "lastLogin": "timestamp"
    }
  },
  "messages": {
    "{messageId}": {
      "name": "string",
      "email": "string",
      "phone": "string",
      "subject": "string",
      "message": "string",
      "timestamp": "timestamp",
      "status": "unread | read | replied"
    }
  },
  "gallery": {
    "{imageId}": {
      "title": "string",
      "category": "string",
      "imageUrl": "string",
      "uploadedAt": "timestamp"
    }
  }
}
```

---

## 7. Non-Functional Requirements (NFRs)

1. **Security & Data Isolation:**
   - Franchise users can only query and mutate student records tagged with their specific `franchiseId`.
   - Admin routes require explicit `admin` verification credentials.
2. **Performance & Responsiveness:**
   - First Contentful Paint (FCP) < 1.5s on broadband connections.
   - Fully responsive layouts tailored for mobile, tablet, and high-resolution desktop displays.
3. **Availability & Reliability:**
   - Offline session persistence using LocalStorage fallback during temporary network disruptions.
   - Robust Firebase error handling with user-friendly alerts.
4. **Auditability & Integrity:**
   - Immutable timestamp logs on submissions (`submittedAt`, `createdAt`, `lastLoginFormatted`).
   - Unique alphanumeric generation for Roll Numbers, Student IDs, and Certificate Serial Keys.

---

## 8. Release Roadmap & Future Enhancements

- **Phase 1 (Current):** Full Franchise & Student Lifecycle, Examination Engine, Document Generation, Role-based Dashboards.
- **Phase 2 (Upcoming):** Integrated Online Payment Gateway (Razorpay / PayU) for direct affiliation and exam fee settlements.
- **Phase 3 (Upcoming):** Automated QR Code validation on downloadable Marksheets & Certificates for instant third-party verification.
- **Phase 4 (Upcoming):** Push & SMS Notifications for exam schedules, fee reminders, and admission confirmations.
