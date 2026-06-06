# NexBill ERP — Frontend

Smart E-Commerce Billing & Inventory Management System.

---

## Tech Stack

- React 19 + Vite
- React Router DOM
- Axios
- Lucide React (icons)
- CSS Modules

---

## Project Structure

```
src/
├── context/
│   └── AuthContext.jsx        # Login, logout, role detection
├── components/
│   ├── Layout.jsx             # Sidebar + Navbar (shared)
│   └── Layout.module.css
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx           # Cashier & Admin registration
│   ├── ForgotPassword.jsx
│   ├── admin/
│   │   └── AdminDashboard.jsx # Pending approvals, KPIs
│   └── cashier/
│       └── CashierDashboard.jsx
└── App.jsx                    # Routes + role guards
```

---

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd nexbill-erp-frontend
npm install
```

### 2. Backend Setup

Make sure the Spring Boot backend is running on `http://localhost:8080`

Backend repo setup:
- Java 17+
- Maven
- Configure `application.properties` with your DB and mail credentials

### 3. Run Frontend

```bash
npm run dev
```

App runs at → `http://localhost:5173`

> Vite automatically proxies `/api/*` → `http://localhost:8080`

---

## Auth Flow

| Role | Registration | Login |
|------|-------------|-------|
| **Admin** | Register page → Enter Admin Secret Key | Direct dashboard access |
| **Cashier** | Register page → Submit request | Only after Admin approves |

### Admin Secret Key
The secret key is configured in the backend `application.properties`:
```properties
admin.secret.key=YOUR_SECRET_KEY
```
Ask the backend team for the key.

---

## Routes

| Path | Access | Description |
|------|--------|-------------|
| `/login` | Public | Login page |
| `/register` | Public | Cashier / Admin registration |
| `/forgot-password` | Public | Password reset |
| `/admin/dashboard` | Admin only | Admin dashboard |
| `/cashier/dashboard` | Cashier only | Cashier dashboard |

---

## Role Detection

Since the JWT token does not include a `role` claim, the frontend determines the role by probing `/api/admin/pending-cashiers` after login:
- **200 OK** → Admin
- **403 Forbidden** → Cashier

---

## Pending Cashier Approval (Admin)

1. Cashier registers → status is `PENDING`
2. Admin logs in → Bell icon shows pending count
3. Click Bell → see pending list → click **Approve**
4. Fill in: Phone, Branch, Counter Number, Shift Timing, Basic Salary
5. Submit → Cashier status becomes `ACTIVE` → can now login

---

## Build for Production

```bash
npm run build
```

Output in `dist/` folder.

---

## Common Issues

| Issue | Fix |
|-------|-----|
| Blank page on load | Open browser console → run `localStorage.clear()` → refresh |
| `localhost refused to connect` | Run `npm run dev` first |
| Wrong dashboard after login | Clear localStorage and login again |
| 403 on API calls | Backend not running or token expired — re-login |
