# CiviConnect (SewaSuchak) — Full Project Description Report

> **Project Name:** CiviConnect / SewaSuchak
> **Report Date:** March 13, 2026
> **Repository Root:** `d:/desktop/Civiconnect`

---

## 1. Project Overview

**CiviConnect** (branded locally as **SewaSuchak**, meaning *Service Reporter* in Nepali) is a full-stack civic issue-reporting and government transparency web platform. It bridges the gap between **citizens** and **local government authorities** by providing a structured, digital channel for:

- Reporting public infrastructure problems (roads, water, electricity, sanitation, etc.)
- Tracking the status of those reports in real-time
- Holding local governments accountable through public project and budget transparency

The platform is designed for **three distinct user roles**:

| Role | Description |
|---|---|
| **Citizen** | Reports issues, votes on others' reports, leaves comments, and tracks resolution status. |
| **Official** | Reviews assigned issues, updates their status, adds resolution notes and proof images. |
| **Admin** | Manages departments, assigns issues, oversees platform-wide activity. |

---

## 2. Core Problem Statement

In many municipalities (particularly in South Asia), citizens lack a formal, accessible, and transparent mechanism to:

1. Report civic problems (e.g., broken roads, water leaks, power outages).
2. Know whether their complaints have been received and acted upon.
3. View where public money is being spent on government projects.

CiviConnect solves all three problems in a single unified web application.

---

## 3. Key Features

### 3.1 Citizen-Facing Features

#### 🚨 Issue Reporting

- Citizens can submit a new civic issue with a **title**, **description**, **category** (Road, Water, Electricity, Sanitation, etc.), and **geo-location**.
- Issues can be tagged with a **priority level**: `LOW`, `NORMAL`, `HIGH`, or `CRITICAL`.
- Supports **image and video uploads** as proof of the problem (via Multer file handling on the backend).
- An **OTP-based email verification** step is required before a report is submitted to prevent spam.

#### 📍 Map View

- All reported issues are displayed on an **interactive Google Maps** interface.
- Citizens can browse and filter issues geographically.
- Markers on the map are color-coded or annotated based on the issue status.

#### 📋 Issue Feed / Live Tracker

- A public feed (`/feed`) shows all reported issues across the city.
- Each issue card shows its current **status**, **vote count**, and **comments**.
- Citizens can **upvote** issues to signal community urgency (one vote per user per issue, enforced at the database level).
- Citizens can **comment** on issues to provide additional context.

#### 🔄 Duplicate Detection

- The `DuplicateCheck` component warns citizens if a very similar issue has already been reported nearby, preventing redundant submissions.

#### 🔐 Authentication System

- Users register with **email + password**.
- Email is verified via a **time-limited OTP code** sent through Gmail SMTP.
- Sessions are managed with **JWT tokens** (stateless authentication).
- Passwords are stored hashed using **bcryptjs**.

---

### 3.2 Government Portal (Official/Admin Features)

A dedicated **Government Portal** (`/gov-portal`) is accessible to Officials and Admins.

#### 📂 Department Management

- Government departments (e.g., *Roads Department*, *Water Supply Board*) are modeled as first-class entities.
- Issues can be **assigned to specific departments** for ownership and accountability.

#### ✅ Issue Status Management

Officials can update an issue through the following lifecycle:

```
REPORTED → ACKNOWLEDGED → IN_PROGRESS → RESOLVED
                                      ↘ REJECTED (with rejection reason)
```

- When resolving, an official can upload a **proof image** and write a **government note** (`govNote`).
- Rejected issues require a mandatory `rejectionReason` field.

#### 🏗️ Project Tracker (Budget Transparency)

- Officials can create and manage **public infrastructure projects** with:
  - Title, description, and associated department.
  - **Budget** (total allocated amount) and **Spent Amount** (tracked incrementally).
  - Start date, end date, and geo-location (latitude/longitude or address).
  - Status: `PLANNED`, `ONGOING`, `COMPLETED`, or `DELAYED`.
- Each project supports **Project Updates** — timestamped progress posts with optional images.
- This feature is designed to give citizens full visibility into how government funds are spent.

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                          │
│           Next.js 16 App (React 19 + TypeScript)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐ │
│  │  Issue   │ │  Map     │ │  Feed    │ │  Gov Portal        │ │
│  │  Report  │ │  View    │ │  Tracker │ │  (Projects/Issues) │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP/JSON REST API
┌───────────────────────────▼─────────────────────────────────────┐
│                       BACKEND SERVER                           │
│           Express.js + TypeScript (Node.js Runtime)            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │  Auth Routes │ │ Issue Routes │ │ Project/Dept Routes      │ │
│  │  /api/auth   │ │ /api/issues  │ │ /api/projects            │ │
│  └──────┬───────┘ └──────┬───────┘ └─────────────┬────────────┘ │
│         └────────────────┼──────────────────────┘             │
│                  Prisma ORM                                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                     SQLite DATABASE                            │
│  Users │ Issues │ Media │ Votes │ Comments │ Departments │       │
│  Projects │ ProjectUpdates │ OTPs                               │
└─────────────────────────────────────────────────────────────────┘
           │                           │
    ┌──────▼──────┐           ┌────────▼──────┐
    │ Google Maps │           │  Gmail SMTP   │
    │     API     │           │ (Nodemailer)  │
    └─────────────┘           └───────────────┘
```

---

## 5. Technology Stack

### 5.1 Frontend

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16 (App Router) | React framework, SSR/SSG, routing |
| **React** | 19 | UI component library |
| **TypeScript** | Latest | Type-safe development |
| **Tailwind CSS** | v4 | Utility-first responsive styling |
| **Framer Motion** | Latest | Page transitions and UI animations |
| **Lucide React** | Latest | Icon system |
| **Google Maps JS API** | Latest | Interactive map for issue visualization |
| **@react-google-maps/api** | Latest | React wrapper for Google Maps |
| **EmailJS** | Latest | Client-side email (optional/secondary) |

### 5.2 Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | Latest LTS | JavaScript runtime |
| **Express.js** | Latest | REST API framework |
| **TypeScript** | Latest | Type-safe server-side code |
| **Prisma ORM** | Latest | Type-safe database access layer |
| **JWT (jsonwebtoken)** | Latest | Stateless session/authentication |
| **bcryptjs** | Latest | Secure password hashing |
| **Multer** | Latest | Multipart file upload handling |
| **Nodemailer** | Latest | OTP & notification emails via Gmail SMTP |
| **nodemon + ts-node** | Latest | Auto-restart dev server |

### 5.3 Database

| Technology | Purpose |
|---|---|
| **SQLite** | Local, file-based relational database |
| **Prisma** | Migration management and query building |

---

## 6. Database Schema (Entities)

```
User
  ├── id (UUID), email (unique), password (hashed), name, phone
  ├── role: CITIZEN | OFFICIAL | ADMIN
  ├── isVerified (boolean)
  ├── → Issues[], Votes[], Comments[]

Issue
  ├── id, title, description, category, latitude, longitude, address
  ├── status: REPORTED | ACKNOWLEDGED | IN_PROGRESS | RESOLVED | REJECTED
  ├── priority: LOW | NORMAL | HIGH | CRITICAL
  ├── imageUrl, videoUrl
  ├── authorId → User
  ├── departmentId → Department
  ├── rejectionReason, proofImageUrl, govNote
  └── → Votes[], Comments[], Media[]

Department
  ├── id, name (unique), description, logoUrl
  └── → Projects[], Issues[]

Project
  ├── id, title, description
  ├── budget (Float), spentAmount (Float)
  ├── startDate, endDate
  ├── status: PLANNED | ONGOING | COMPLETED | DELAYED
  ├── latitude, longitude, address
  ├── departmentId → Department
  └── → ProjectUpdates[]

ProjectUpdate
  ├── id, title, description, imageUrl
  └── projectId → Project

Media
  ├── id, url, type: IMAGE | VIDEO
  └── issueId → Issue

Vote         → (userId, issueId) unique per user per issue
Comment      → content, userId, issueId
OTP          → email, code, type: SIGNUP | REPORT, expiresAt
```

---

## 7. API Routes Structure

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register a new citizen account |
| `POST` | `/login` | Login and receive JWT |
| `POST` | `/verify-otp` | Verify email OTP after signup |
| `POST` | `/send-otp` | Resend an OTP code |

### Issues (`/api/issues`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Fetch all issues (with filters) |
| `POST` | `/` | Create a new issue report |
| `GET` | `/:id` | Fetch a single issue by ID |
| `PATCH` | `/:id/status` | Update issue status (Official) |
| `POST` | `/:id/vote` | Upvote an issue |
| `POST` | `/:id/comment` | Comment on an issue |
| `POST` | `/:id/media` | Upload media for an issue |

### Projects (`/api/projects`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List all government projects |
| `POST` | `/` | Create a new project (Admin) |
| `GET` | `/:id` | Get project details with updates |
| `PATCH` | `/:id` | Update project info/status |
| `POST` | `/:id/updates` | Add a progress update to a project |

---

## 8. Application Pages (Frontend Routes)

| Route | Page | Description |
|---|---|---|
| `/` | Home / Landing | Hero section, feature highlights, stats, CTA |
| `/login` | Login Page | Email + password login with animated UI |
| `/signup` | Signup Page | New citizen registration form |
| `/verify-otp` | OTP Verification | Enter OTP sent to email after signup |
| `/report` | Issue Report Form | Multi-step form: type → location → media → OTP |
| `/feed` | Live Issue Feed | Real-time public issue tracker with filters |
| `/map` | Map View | Google Maps with all issues plotted as markers |
| `/gov-portal` | Government Portal | Dashboard for Officials and Admins |
| `/gov-portal/projects` | Projects List | All government projects with budget view |
| `/gov-portal/projects/:id` | Project Detail | Budget, timeline, updates for one project |

---

## 9. Frontend Components

| Component | Description |
|---|---|
| `Navbar.tsx` | Top navigation with auth state and role-based links |
| `Footer.tsx` | Site-wide footer with links and branding |
| `LocationPicker.tsx` | Google Maps picker embedded in the report form |
| `MediaUpload.tsx` | Drag-and-drop image/video uploader |
| `IssueTypeSelector.tsx` | Category selector with icons for issue types |
| `DuplicateCheck.tsx` | Nearby duplicate issue detector and warning UI |
| `LiveIssueTracker.tsx` | Real-time issue card feed with vote/comment UI |
| `StatusCard.tsx` | Visual status badge and timeline card for issues |

---

## 10. Security & Reliability Design

| Concern | Approach |
|---|---|
| **Authentication** | JWT with expiry; stored securely client-side |
| **Password Security** | bcryptjs hashing (irreversible) |
| **Email Verification** | Time-limited OTP required before issue submission and account activation |
| **Authorization** | Role-based middleware (`CITIZEN`, `OFFICIAL`, `ADMIN`) on protected routes |
| **Input Validation** | Server-side validation on all API endpoints |
| **File Uploads** | Multer with type and size constraints |
| **Database Safety** | Prisma ORM with parameterized queries (prevents SQL injection) |

---

## 11. Development Setup

### Prerequisites

- Node.js (LTS)
- npm
- A Google Maps API Key
- Gmail account with App Password for SMTP

### Running Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev       # nodemon + ts-node
```

### Running Frontend

```bash
cd frontend
npm install
npm run dev       # Next.js dev server (default: http://localhost:3000)
```

### Environment Variables

**Backend `.env`:**

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_jwt_secret"
GMAIL_USER="your@gmail.com"
GMAIL_PASS="your_app_password"
```

**Frontend `.env.local`:**

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_key"
```

---

## 12. Project Goals & Impact

CiviConnect is built with the following long-term vision:

1. **Transparency**: Citizens can see the real status of their complaints and where government money is going.
2. **Accountability**: Officials are responsible for updating issue statuses with documented proof.
3. **Community Power**: Voting and commenting lets the community prioritize the most impactful problems.
4. **Data-Driven Governance**: Aggregated issue data (by category, area, priority) can help municipalities allocate resources smarter.
5. **Scalability**: While SQLite is used for development, the Prisma ORM setup makes migration to PostgreSQL or MySQL trivial for production deployment.

---

## 13. Potential Future Enhancements

- [ ] Push notifications when an issue status changes
- [ ] Admin analytics dashboard (heat maps, issue statistics by category/area)
- [ ] Mobile application (React Native)
- [ ] Multi-language support (Nepali / English)
- [ ] Integration with actual municipal government APIs
- [ ] PostgreSQL for production-grade deployment
- [ ] Offline-first PWA support for low-connectivity areas
- [ ] SMS-based OTP as an alternative to email

---

*This document describes the CiviConnect / SewaSuchak project as of March 2026. All architecture, features, and technology choices are documented based on the current codebase.*
