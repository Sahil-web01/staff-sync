# StaffSync

[![Live Demo](https://img.shields.io/badge/Live%20Demo-staff--sync--wine.vercel.app-blue?style=for-the-badge&logo=vercel)](https://staff-sync-wine.vercel.app/)

> 🌐 **Live Website:** [https://staff-sync-wine.vercel.app/](https://staff-sync-wine.vercel.app/)

StaffSync is an enterprise-ready, multi-tenant employee leave management and workplace scheduling platform built with **Next.js (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Auth.js v5 (NextAuth)**, and **MongoDB Atlas** via Mongoose.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [How to Run on Your Computer](#how-to-run-on-your-computer)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Clone & Navigate to the Project](#2-clone--navigate-to-the-project)
  - [3. Install Dependencies](#3-install-dependencies)
  - [4. Configure Environment Variables](#4-configure-environment-variables)
  - [5. Start the Development Server](#5-start-the-development-server)
- [Step-by-Step Usage Guide](#step-by-step-usage-guide)
- [Architecture & Directory Structure](#architecture--directory-structure)
- [Security & Inactivity Policy](#security--inactivity-policy)
- [Available Scripts](#available-scripts)
- [License](#license)

---

## Overview

StaffSync streamlines workplace time-off requests, shift planning, and management oversight. It features strict multi-tenant isolation, ensuring that organizations only view and manage their own employees and leave requests.

---

## Key Features

- **Multi-Tenant Organization Isolation (`companyId`):**
  - All users, leave requests, and schedules are strictly segregated by company/workspace identifier.
  - Admins can only view and manage requests submitted by employees within their specific company.
- **Role-Based Access Control (RBAC):**
  - **Administrator:**
    - View and review pending time-off requests.
    - Approve requests with instant status updates.
    - Deny requests while attaching a custom rejection reason sent directly to the employee.
    - Monthly Decision History with automatic calendar month filtering and monthly statistics.
    - Delete past requests.
  - **Employee:**
    - Submit leave requests with flexible durations (**Full Day** or **Half Day**).
    - Provide leave reasons and choose future dates.
    - Track request statuses in real time (**Pending**, **Approved**, **Denied**).
    - Review the admin's denial explanation if a request is rejected.
    - Cancel or delete personal requests.
- **Auth.js v5 Authentication:**
  - Secure credential login with bcrypt password hashing.
  - JWT session strategy with TypeScript module augmentation.
  - Edge middleware protection for `/admin`, `/employee`, and `/dashboard` routes.
- **1-Month Inactivity Auto-Logout:**
  - Sliding activity tracking that detects if a user hasn't visited the website for 30+ days.
  - Automatically terminates expired sessions and safely redirects users to the login screen with an informative alert banner.
- **Modern Theme System:**
  - Fully responsive, accessible dark and light mode powered by `next-themes` and Tailwind CSS.
- **Server Actions & Optimistic UX:**
  - React 19 `useTransition` and Next.js Server Actions for fast, zero-lag mutations with automatic cache revalidation.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js (App Router, React 19) |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS v4, Lucide Icons |
| **Database** | MongoDB Atlas via Mongoose |
| **Authentication** | Auth.js v5 (`next-auth@beta`) & `bcryptjs` |
| **Theming** | `next-themes` |

---

## How to Run on Your Computer

Follow these simple steps to run StaffSync locally:

### 1. Prerequisites

Make sure you have the following installed on your machine:
- **Node.js** (v18.18.0 or v20+ recommended) — [Download Node.js](https://nodejs.org/)
- **npm** (bundled with Node.js) or **pnpm** / **yarn**
- A **MongoDB Atlas** database connection string (or a local MongoDB instance running on `mongodb://localhost:27017/staffsync`)

---

### 2. Clone & Navigate to the Project

Open your terminal or command prompt:

```bash
# Clone the repository (if downloading from Git)
git clone https://github.com/your-username/StaffSync.git

# Navigate into the staff-sync application directory
cd StaffSync/staff-sync
```

> **Note:** The Next.js application lives inside the `staff-sync` directory. Ensure your terminal prompt is located in `staff-sync` where `package.json` resides before running commands.

---

### 3. Install Dependencies

Install all required packages:

```bash
npm install
```

---

### 4. Configure Environment Variables

Create a `.env` file in the `staff-sync` directory:

```bash
# On Linux/macOS
touch .env

# On Windows PowerShell
New-Item -ItemType File -Name .env
```

Add your configuration to `.env`:

```env
# MongoDB Connection String (Replace with your Atlas or local URI)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/staffsync?appName=Cluster0

# NextAuth / Auth.js Secret Key
# Generate one in your terminal with: npx auth secret
AUTH_SECRET=your_generated_secret_key_here
```

---

### 5. Start the Development Server

Run the development server:

```bash
npm run dev
```

Once started, open your browser and visit:
```text
http://localhost:3000
```

---

## Step-by-Step Usage Guide

### 1. Create an Admin Account
1. Open [http://localhost:3000/signup](http://localhost:3000/signup).
2. Enter your Name, Email, Password, and a **Company / Workspace ID** (e.g., `acme-corp`).
3. Select the **Admin / Manager** role.
4. Click **Create Account**. You will be logged in and directed to `/admin`.

### 2. Create an Employee Account
1. Open a private/incognito window (or sign out).
2. Go to [http://localhost:3000/signup](http://localhost:3000/signup).
3. Register using the **same Company / Workspace ID** (e.g., `acme-corp`).
4. Select the **Employee** role.
5. Click **Create Account**. You will be directed to `/employee`.

### 3. Submit & Review Leave Requests
1. **As an Employee:**
   - Select a date and duration (**Full Day** or **Half Day**).
   - Enter your reason and click **Submit Request**.
   - Your submission appears under *My Submitted Requests* with a **Pending** badge.
2. **As an Admin:**
   - Go to `/admin`. The request appears immediately under *Pending Time Off Requests*.
   - Click **Approve** to accept, or **Deny** to provide a rejection reason in the modal dialog.
   - The decision moves to the *Monthly Decision History* table.
3. **Verify as Employee:**
   - Refresh or view the employee portal to see the updated status and the admin's denial reason (if rejected).

---

## Architecture & Directory Structure

```text
staff-sync/
├── actions/
│   └── leaveActions.ts         # Server actions (submit, approve, deny with reason, delete)
├── app/
│   ├── admin/
│   │   ├── action-buttons.tsx  # Approve, Deny (modal dialog), and Delete actions
│   │   └── page.tsx            # Admin dashboard & monthly decision history
│   ├── api/
│   │   ├── auth/[...nextauth]/ # Auth.js API route handler
│   │   ├── auth/register/      # User registration endpoint
│   │   ├── db-status/          # MongoDB health-check endpoint
│   │   ├── leave/              # REST leave endpoints
│   │   └── shifts/             # Shift management endpoints
│   ├── employee/
│   │   ├── time-off-form.tsx   # Leave request submission form (Full/Half day)
│   │   └── page.tsx            # Employee portal & personal request history
│   ├── login/
│   │   ├── login-form.tsx      # Login form with 30-day inactivity alert banner
│   │   └── page.tsx
│   ├── signup/
│   │   ├── signup-form.tsx     # Registration form with Company ID selection
│   │   └── page.tsx
│   ├── unauthorized/
│   │   └── page.tsx            # 403 Forbidden page
│   ├── globals.css             # Theme tokens & Tailwind utility classes
│   └── layout.tsx              # Root HTML layout with ThemeProvider
├── components/
│   ├── dashboard-sidebar.tsx   # Role-aware responsive navigation sidebar
│   ├── delete-request-button.tsx # Reusable client button for deleting requests
│   ├── theme-toggle.tsx        # Dark/light mode switcher
│   └── user-nav.tsx            # Header user profile dropdown & logout
├── lib/
│   ├── mongodb.ts              # Global cached Mongoose connection pool
│   └── utils.ts                # Class merging utility (clsx + tailwind-merge)
├── models/
│   ├── LeaveRequest.ts         # Mongoose schema for leaves (companyId, denialReason, etc.)
│   ├── Shift.ts                # Mongoose schema for shift rosters
│   └── User.ts                 # Mongoose schema for users (role, companyId, lastActive)
├── auth.config.ts              # Edge-compatible Auth.js configuration & session rules
├── auth.ts                     # Full Node.js Auth.js initialization & credentials provider
├── middleware.ts               # Route guard & 30-day inactivity redirect logic
└── package.json
```

---

## Security & Inactivity Policy

- **Multi-Tenant Protection:** Every database read, mutation, approval, and deletion query strictly validates `companyId: session.user.companyId`. Admins cannot access or alter requests from other organizations.
- **Role Verification:** Server actions verify `session.user.role === 'admin'` before allowing approval or denial of leave requests.
- **30-Day Inactivity Auto-Logout:** If an admin or employee does not visit the platform for more than 30 consecutive days, the middleware automatically clears their session cookies and redirects them to `/login?expired=true` with a clear explanation to sign in again.

---

## Available Scripts

In the `staff-sync` directory, you can run:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server at `localhost:3000` |
| `npm run build` | Builds the optimized production application bundle |
| `npm run start` | Starts the production server after building |
| `npm run lint` | Runs ESLint to check for syntax and style issues |
| `npx tsc --noEmit` | Runs the TypeScript compiler to verify all types |

---

## License

This project is open-source and available under the [MIT License](LICENSE).
