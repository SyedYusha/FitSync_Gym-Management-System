# 🏋️‍♂️ FitSync - Gym Management System
### *Manage • Track • Grow*

![Release](https://img.shields.io/badge/Release-v1.0.0-green) ![License](https://img.shields.io/badge/License-MIT-blue) ![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen)

## 📖 About The Project
**FitSync** is a comprehensive, role-based SaaS web application designed to streamline and modernize gym operations. It replaces outdated paper-based tracking with a secure, real-time digital ecosystem. FitSync connects Gym Owners, Admins, Trainers, and Members through tailored dashboards, ensuring seamless communication, accurate financial tracking, and secure facility access.

Built with a mobile-first responsive design for members and a robust desktop interface for management, FitSync demonstrates enterprise-grade architecture using secure serverless functions and strict database policies.

---

## 🚀 Key Features

### 👑 Owner Dashboard (Business Intelligence)
* **Real-Time Analytics:** Live revenue charts, active plan tracking, and expiring membership alerts.
* **Business Reports:** Generate and export CSV reports for revenue, member status, and attendance.
* **System Settings:** Secure profile management and live system health monitoring.
* **Full CRUD Operations:** Complete control over members, plans, and system configurations.

### 🛡️ Admin Dashboard (Daily Operations)
* **Single-Page Operations Center:** Dynamic tabbed interface for managing Members, Attendance, Payments, and Expenses without page reloads.
* **Attendance Approval Workflow:** Secure, two-step check-in process where members request entry via mobile, and Admins approve for security.
* **Expense Tracking:** Real-time logging of gym bills, salaries, and maintenance costs.

### 📱 Member Portal (Mobile-First UX)
* **Responsive App-Like Interface:** Optimized for smartphones with bottom navigation and touch-friendly cards.
* **Self Check-In/Out:** Members can request gym entry directly from their phones.
* **Personal Dashboard:** View active plan details, days remaining, payment history, and personal check-in charts.

### 🏃 Trainer Portal
* **Client Management:** View assigned members and daily training schedules.
* **Role-Based Access:** Restricted access ensuring trainers only see relevant client data.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Custom Responsive Framework), Vanilla JavaScript (ES6 Modules).
* **Backend & Database:** Supabase (PostgreSQL).
* **Authentication:** Supabase Auth (JWT, Role-Based Access Control).
* **Serverless Compute:** Supabase Edge Functions (Deno) for secure administrative tasks.
* **Deployment:** Vercel (Continuous Deployment via GitHub).
* **Icons:** Lucide Icons.

---

## 🔐 Security & Architecture (Highlights)

1. **Row Level Security (RLS):** Every database table is protected by strict RLS policies. Users can only read/write data explicitly permitted by their role (Owner, Admin, Trainer, Member).
2. **Secure Edge Functions:** Sensitive operations (like creating or deleting authentication users) are handled via Supabase Edge Functions. This ensures the **Service Role Key** never touches the client-side browser, preventing critical security vulnerabilities.
3. **Role-Based Access Control (RBAC):** A custom `auth.guard.js` middleware intercepts routing, ensuring users are redirected to their specific dashboards and cannot access unauthorized routes.

---

## 📦 First Release Notes (v1.0.0)

**Release Date:** November 22, 2026

**What's New:**
* ✅ Complete Owner, Admin, Member, and Trainer dashboards.
* ✅ Implemented secure Member Check-In/Check-Out with Admin approval workflow.
* ✅ Added dynamic Revenue and Attendance charts.
* ✅ Integrated mobile-responsive CSS layer for all dashboards.
* ✅ Deployed secure Edge Functions for user lifecycle management.
* ✅ Added comprehensive database seeding for demo presentations.

---

## ⚙️ Local Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/FitSync_Gym-Management-System.git
   cd FitSync_Gym-Management-System
