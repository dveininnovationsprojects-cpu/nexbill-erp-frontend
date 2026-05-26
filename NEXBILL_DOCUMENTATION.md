# NexBill ERP — Complete Project Documentation

**Version:** 1.0  
**Stack:** React 19 + Vite + React Router + Axios  
**Backend:** Spring Boot (localhost:8080)  
**Frontend:** localhost:5173

---

## TABLE OF CONTENTS

1. Project Overview
2. Authentication & Role System
3. Admin vs Cashier — Full Difference
4. Page-by-Page Feature Breakdown
5. Billing → Invoice → Payment Flow
6. Product Management
7. Inventory Management
8. Invoice Module
9. Payment Methods
10. What is Empty / Incomplete
11. Suggested Additions

---

## 1. PROJECT OVERVIEW

NexBill ERP is a Smart Billing and Inventory Management System built for retail businesses.

It has two types of users:
- **Admin** — Full control over the system
- **Cashier** — Only billing and counter operations

The frontend is a Single Page Application (SPA) built with React. All routes are protected by role. If a cashier tries to access an admin page, they are redirected automatically.

---

## 2. AUTHENTICATION & ROLE SYSTEM

### How Login Works

1. User enters email and password on `/login`
2. Frontend calls `POST /api/auth/login`
3. Backend returns a JWT token
4. Frontend then calls `GET /api/admin/pending-cashiers` with that token
   - If response is **200 OK** → user is **ADMIN**
   - If response is **403 Forbidden** → user is **CASHIER**
5. Role + token is saved in `localStorage` as `nexbill_user`

### Why This Approach?

The JWT token does not contain a role claim. So the frontend probes an admin-only endpoint to detect the role. This is a workaround — ideally the backend should return the role in the login response.

### Cashier Registration Flow

1. Cashier goes to `/register` and submits their details
2. Account is created with status = `PENDING`
3. Cashier cannot login until Admin approves
4. Admin sees the pending cashier in the Bell notification
5. Admin clicks Approve → fills Phone, Branch, Counter Number, Shift Timing, Basic Salary
6. Calls `POST /api/admin/approve-cashier/{email}`
7. Cashier status becomes `ACTIVE` → can now login

### Admin Registration

Admin registers on the same `/register` page but enters a secret key configured in the backend `application.properties` file under `admin.secret.key`.

---

## 3. ADMIN vs CASHIER — FULL DIFFERENCE

### Sidebar Navigation

| Menu Item   | Admin | Cashier |
|-------------|-------|---------|
| Dashboard   | ✅    | ✅      |
| Products    | ✅    | ✅      |
| Inventory   | ✅    | ❌      |
| Customers   | ✅    | ✅      |
| Billing     | ✅    | ✅      |
| Payments    | ✅    | ✅      |
| Invoices    | ✅    | ✅      |
| Reports     | ✅    | ❌      |
| Settings    | ✅    | ❌      |
| Profile     | ✅    | ✅      |

### Feature Access Difference

| Feature                        | Admin | Cashier |
|-------------------------------|-------|---------|
| Add / Edit / Delete Products  | ✅    | ❌ View only |
| Update Inventory Stock        | ✅    | ❌ No access |
| View Low Stock Alerts         | ✅    | ❌      |
| Approve Cashiers              | ✅    | ❌      |
| Create Invoice manually       | ✅    | ❌ Auto from billing |
| Mark Invoice as Paid          | ✅    | ❌      |
| Delete Invoice                | ✅    | ❌      |
| View ALL cashiers' bills      | ✅    | ❌ Own bills only |
| View ALL cashiers' payments   | ✅    | ❌ Own payments only |
| Filter payments by cashier    | ✅    | ❌      |
| Bell Notifications            | ✅    | ❌      |
| Settings page                 | ✅    | ❌      |
| Reports page                  | ✅    | ❌      |
| Create new bill (POS)         | ❌    | ✅      |
| Add items to cart             | ❌    | ✅      |
| Apply discount at billing     | ❌    | ✅      |
| Collect payment at counter    | ❌    | ✅      |
| View own shift info           | ❌    | ✅      |

### Dashboard Difference

**Admin Dashboard shows:**
- Today's Revenue KPI
- Total Products KPI
- Active Cashiers KPI
- Low Stock Alerts KPI
- Pending Cashier Approvals list with Approve button
- Monthly Sales bar chart (mock)
- Recent Transactions table (skeleton — not connected yet)

**Cashier Dashboard shows:**
- Today's Bills KPI (hardcoded 0 — not connected)
- Today's Sales KPI (hardcoded 0 — not connected)
- Customers Served KPI (hardcoded 0 — not connected)
- Shift Timing KPI (hardcoded — not connected)
- Quick Actions buttons (New Bill, Search Product, View Invoices, Customer Lookup)
- Recent Bills table (skeleton — not connected)

---

## 4. PAGE-BY-PAGE FEATURE BREAKDOWN

### Admin Pages

**AdminDashboard.jsx**
- 4 KPI cards: Revenue, Products, Cashiers, Low Stock
- Pending cashier approval list — fetches from `/api/admin/pending-cashiers`
- Approve modal with form: Phone, Branch, Counter, Shift, Salary
- Monthly bar chart (static mock data — not real)
- Recent transactions table (skeleton only — no API connected)

**Products.jsx (Admin)**
- Full CRUD: Add, Edit, Delete products
- Fields: SKU, Name, Category, Selling Price, Purchase Price, Stock, GST Rate
- Search by name or SKU
- Filter by category
- Categories fetched from `/api/categories/all`
- Products fetched from `/api/products/all`
- Falls back to dummy data if API fails

**Inventory.jsx (Admin only)**
- View all products with stock levels
- Update stock quantity via modal
- Filter: All / Low Stock / Out of Stock
- 4 KPI cards: Total Products, Healthy Stock, Low Stock, Out of Stock
- Low stock = stock < minStock
- Out of stock = stock = 0
- Uses mock data (not connected to backend yet)

**Billing.jsx (Admin)**
- View-only table of all bills from all cashiers
- Filter by status: All / Paid / Pending / Cancelled
- Filter by cashier name
- Search by invoice, customer, cashier
- 4 KPI cards: Total Revenue, Total Bills, Paid Bills, Pending Bills
- Uses mock data (MOCK_BILLS array — not connected)
- Admin CANNOT create a bill here — only view

**Invoices.jsx (Admin)**
- Full invoice management
- Create new invoice manually via modal
- View all invoices from all cashiers
- PDF preview modal with full invoice document
- Print / Save as PDF (opens new browser window)
- Send email (simulated — shows toast)
- Mark invoice as Paid
- Delete invoice
- Filter by status: All / Paid / Pending / Overdue / Draft
- Search by invoice ID, customer name, email
- Pagination (6 per page)
- 4 KPI cards: Total Invoices, Total Revenue, Pending, Overdue

**Payments.jsx (Admin)**
- View all payments from all cashiers
- Filter by cashier, status
- Search by payment ID, invoice, customer
- 4 KPI cards: Total Collected, Pending, Failed, Transactions
- Payment Method Breakdown sidebar (bar chart showing Cash/UPI/Card/NetBanking amounts)
- Uses mock data

**Customers.jsx (Admin)**
- EMPTY — `return null`
- Not built yet

**Reports.jsx (Admin)**
- EMPTY — `return null`
- Not built yet

**Settings.jsx (Admin only)**
- 6 tabs: Business Profile, Invoice Settings, Tax & GST, Notifications, Security, System
- Business Profile: Company name, email, phone, address, GSTIN, PAN, CIN, logo upload
- Invoice Settings: Prefix, starting number, due days, currency, date format, footer note, display toggles
- Tax & GST: GST slab selection (0/5/12/18/28%), CGST/SGST/IGST rates, HSN/SAC toggle
- Notifications: Email, SMS, In-App notification toggles, daily/weekly summary
- Security: Change password, 2FA toggle, session timeout, active sessions, login activity
- System: Accent color picker, compact mode, animations, timezone, language, data retention

**Profile.jsx (Admin)**
- Left column: Avatar with photo upload, role badge, stats (Users managed, Invoices), Account info card, Quick actions
- Right column: Personal info (editable), Administrator Details with permissions list, Security section, Activity log, Sign out card, Danger zone
- Change password modal
- Logout confirmation modal

### Cashier Pages

**CashierDashboard.jsx**
- 4 KPI cards: Today's Bills, Today's Sales, Customers Served, Shift (all hardcoded 0 / — )
- Quick Actions: New Bill, Search Product, View Invoices, Customer Lookup (buttons not wired)
- Recent Bills table (skeleton only)

**CashierBilling.jsx**
- Left panel: Product search grid (click to add to cart)
- Right panel: Cart with quantity controls
- GST auto-calculated per product rate
- Discount: flat (₹) or percentage (%)
- GST breakdown shown per rate slab
- Generate Invoice button → opens Invoice Preview Modal
- Invoice Preview Modal shows: all items, subtotal, GST breakdown, discount, grand total
- Payment section inside modal: Cash / UPI / Card / Net Banking
- Confirm Payment → 2 second simulate → Success
- On success: "New Bill" button clears cart
- Print Invoice button opens print-ready HTML in new tab

**CashierProducts.jsx**
- View-only product list
- Search by name or SKU
- Filter by category
- Shows: SKU, Name, Category, Selling Price, GST%, Stock status
- NO Purchase Price shown (admin-only info)
- NO Add/Edit/Delete buttons
- Stock color: Green = OK, Yellow = Low (< 20), Red = Out of Stock

**CashierCustomers.jsx**
- EMPTY — `return null`
- Not built yet

**CashierInvoices.jsx**
- Cashier's own invoices only
- 3 KPI cards: My Invoices, Revenue Collected, Pending
- Cashier info strip: Name, Counter, Shift, Date
- Search by invoice ID or customer
- Filter by status: All / Paid / Pending / Overdue
- Pagination (5 per page)
- Actions per invoice: Preview (eye icon), Download PDF, Send Email
- Full PDF preview modal with professional invoice document
- Invoice shows: Company header, Bill To, Handled By, Items table with GST, Totals, Terms, Signature

**CashierPayments.jsx**
- Cashier's own payments only
- 3 KPI cards: Total Collected, Pending Amount, Total Transactions
- Search by payment ID, invoice, customer
- Filter by status: All / Success / Pending / Failed
- Table: Payment ID, Invoice, Customer, Amount, Method, Status, Date

**Profile.jsx (Cashier)**
- Same file as Admin Profile but shows different content
- Left column: Avatar, Cashier role badge, stats (Bills, Today), Account info, Quick actions
- Right column: Personal info (editable), Cashier Details (Counter, Branch, Shift, Salary, Employee ID, Joining Date), Security, Activity log, Sign out, Danger zone

---

## 5. BILLING → INVOICE → PAYMENT FLOW

### Cashier Flow (Current — Mock Data)

```
Step 1: Cashier opens /cashier/billing
Step 2: Search product by name or SKU
Step 3: Click product card → added to cart
Step 4: Adjust quantity with + / - buttons
Step 5: Apply discount (% or flat ₹)
Step 6: Click "Generate Invoice"
Step 7: Invoice Preview Modal opens
        → Shows all items, GST breakdown, grand total
Step 8: Select payment method (Cash / UPI / Card / Net Banking)
Step 9: Click "Confirm Payment · ₹XXXX"
Step 10: 2 second processing simulation
Step 11: "Payment Successful!" screen
Step 12: Click "New Bill" → cart clears → ready for next customer
```

### Where Invoice Goes After Billing

- Invoice should appear in `/cashier/invoices` list
- Payment should appear in `/cashier/payments` list
- Admin should see it in `/admin/billing`, `/admin/invoices`, `/admin/payments`
- **Currently this does NOT happen automatically** because billing uses mock data and is not connected to backend API

### When Backend is Connected

```
CashierBilling → POST /api/billing/create → returns invoice ID
                → POST /api/payments/record → records payment
CashierInvoices → GET /api/invoices/my → fetches cashier's invoices
CashierPayments → GET /api/payments/my → fetches cashier's payments
AdminBilling    → GET /api/billing/all → fetches all cashiers' bills
AdminInvoices   → GET /api/invoices/all → fetches all invoices
AdminPayments   → GET /api/payments/all → fetches all payments
```

---

## 6. PRODUCT MANAGEMENT

### Admin Can Do

| Action | API Endpoint |
|--------|-------------|
| View all products | GET /api/products/all |
| Add new product | POST /api/products/add |
| Edit product | PUT /api/products/update/{id} |
| Delete product | DELETE /api/products/delete/{id} |
| View categories | GET /api/categories/all |

### Product Fields

| Field | Admin | Cashier |
|-------|-------|---------|
| SKU | View + Edit | View only |
| Name | View + Edit | View only |
| Category | View + Edit | View only |
| Selling Price | View + Edit | View only |
| Purchase Price | View + Edit | **Hidden** |
| Stock Quantity | View + Edit | View only |
| GST Rate | View + Edit | View only |

**Purchase Price is hidden from cashier** — this is intentional to protect business margin information.

### Stock Warning

- Stock < 20 → shown in orange with ⚠ warning (Cashier view)
- Stock < minStock → shown as "Low Stock" badge (Admin inventory view)
- Stock = 0 → shown as "Out of Stock" in red

### Fallback Behavior

If the backend API fails or returns empty data, both Products pages fall back to hardcoded dummy data (DUMMY_PRODUCTS / FALLBACK arrays). This means the page never shows blank — it always shows something.

---

## 7. INVENTORY MANAGEMENT

### Admin Only Feature

Inventory page is completely hidden from cashiers. Only admins can access `/admin/inventory`.

### What Inventory Shows

- All products with current stock vs minimum stock
- Status badges: In Stock (green), Low Stock (yellow), Out of Stock (red)
- Last updated date per product
- Unit type (pcs, bags, bottles, etc.)

### Stock Update

Admin clicks "Update" button on any product → modal opens → enter new stock quantity → save. This updates the stock number and sets last updated date to today.

### KPI Cards

- Total Products: count of all inventory items
- Healthy Stock: items where stock >= minStock
- Low Stock: items where 0 < stock < minStock
- Out of Stock: items where stock = 0

### Bell Notification Integration

The Layout component fetches `/api/inventory/low-stock` every 30 seconds. If any items are low, the bell icon shows a count badge. Admin can see the low stock items in the notification dropdown without going to the inventory page.

### Currently Using Mock Data

The inventory page uses MOCK_INVENTORY array. When backend is connected, it should call:
- GET /api/inventory/all — to load all items
- PUT /api/inventory/update/{id} — to update stock

---

## 8. INVOICE MODULE

### Admin Invoice Features

- **Create Invoice manually** — fill customer details, add line items, set GST per item, apply discount, choose payment method
- **View all invoices** from all cashiers
- **PDF Preview** — full professional invoice document in modal
- **Print / Save PDF** — opens print-ready HTML page in new browser tab (auto-triggers print dialog)
- **Send Email** — currently simulated (shows toast, no real email sent)
- **Mark as Paid** — changes invoice status from Pending/Overdue to Paid
- **Delete Invoice** — removes from list
- **Filter** by status: All, Paid, Pending, Overdue, Draft
- **Search** by invoice ID, customer name, email
- **Pagination** — 6 invoices per page

### Cashier Invoice Features

- **View own invoices only** — cannot see other cashiers' invoices
- **PDF Preview** — same professional invoice document
- **Print / Save PDF** — same print functionality
- **Send Email** — simulated
- **NO create, edit, delete, mark paid** — read only
- **Filter** by status: All, Paid, Pending, Overdue
- **Pagination** — 5 invoices per page
- **Cashier info strip** at top showing: Name, Counter, Shift, Date

### Invoice Document Structure

Every invoice PDF contains:
1. Company header (NexBill ERP logo, address, GSTIN)
2. Invoice number, date, due date, payment mode
3. Bill To section (customer name, address, phone, email, GSTIN)
4. Handled By section (cashier name, counter) with status stamp
5. Line items table (Description, Qty, Rate, GST%, GST Amount, Total)
6. Totals section (Subtotal, GST Total, Discount, Grand Total)
7. Terms & Conditions
8. Authorized Signatory section
9. Thank you message

### Invoice Status Types

| Status | Color | Meaning |
|--------|-------|---------|
| Paid | Green | Payment received |
| Pending | Yellow | Invoice sent, payment awaited |
| Overdue | Red | Past due date, not paid |
| Draft | Gray | Created but not sent |

---

## 9. PAYMENT METHODS

### Where Each Method Appears

**CashierBilling (active payment collection):**
- Cash
- UPI
- Card
- Net Banking

**Admin Invoice Create Modal:**
- Cash
- Card
- UPI
- Bank Transfer
- Cheque
- Pending

**CashierPayments & AdminPayments (display only):**
- Cash
- UPI
- Card
- Net Banking

### Payment Status Types

| Status | Meaning |
|--------|---------|
| SUCCESS | Payment completed |
| PENDING | Payment initiated but not confirmed |
| FAILED | Payment attempt failed |

### Admin Payment Extra Features vs Cashier

| Feature | Admin | Cashier |
|---------|-------|---------|
| Filter by cashier | ✅ | ❌ |
| Payment method breakdown chart | ✅ | ❌ |
| See all cashiers' payments | ✅ | ❌ |
| See own payments only | — | ✅ |

---

## 10. WHAT IS EMPTY / INCOMPLETE

### Completely Empty Pages (return null)

| File | Route | Status |
|------|-------|--------|
| Customers.jsx | /admin/customers | Not built |
| CashierCustomers.jsx | /cashier/customers | Not built |
| Reports.jsx | /admin/reports | Not built |

### Pages with Mock / Dummy Data (not connected to backend)

| Page | What is Mock |
|------|-------------|
| AdminDashboard | Recent transactions table, Monthly chart |
| CashierDashboard | All 4 KPI values (hardcoded 0) |
| Billing.jsx | Entire bill list (MOCK_BILLS) |
| CashierBilling.jsx | Product list (MOCK_PRODUCTS) |
| Inventory.jsx | Entire inventory (MOCK_INVENTORY) |
| CashierInvoices.jsx | Invoice list (CASHIER_INVOICES) |
| CashierPayments.jsx | Payment list (MOCK_PAYMENTS) |
| Invoices.jsx | Invoice list (MOCK_INVOICES) |
| Payments.jsx | Payment list (MOCK_PAYMENTS) |
| Profile.jsx | Name, phone, stats, activity log |
| Settings.jsx | All settings (no save to backend) |

### Features Simulated (not real)

| Feature | Current Behavior |
|---------|-----------------|
| Send Email button | Shows toast only — no real email |
| Confirm Payment | 2 second setTimeout — no real API |
| Change Password | 1 second setTimeout — no real API |
| Settings Save | Shows toast only — no real save |
| Invoice Create | Adds to local state only — not saved to DB |

---

## 11. SUGGESTED ADDITIONS

### High Priority (Missing Core Features)

**1. Customers Module (Both Admin and Cashier)**

Admin should be able to:
- Add, edit, delete customers
- View customer purchase history
- Search by name, phone, email
- View total spend per customer

Cashier should be able to:
- Search existing customers while billing
- Add new customer quickly during billing
- View own customer interactions

**2. Reports Module (Admin only)**

Should include:
- Daily / Weekly / Monthly sales report
- Revenue by cashier
- Revenue by product category
- Top selling products
- GST summary report (for filing)
- Invoice status summary
- Payment method breakdown over time
- Export to PDF or Excel

**3. Connect CashierDashboard to Real API**

Currently all 4 KPI values are hardcoded 0. Should fetch:
- Today's bill count from `/api/billing/today/count`
- Today's sales total from `/api/billing/today/revenue`
- Customers served today from `/api/customers/today/count`
- Cashier's shift timing from their profile

**4. Connect Billing to Backend**

When cashier clicks Confirm Payment:
- POST to `/api/billing/create` with cart items, customer, discount, payment method
- POST to `/api/payments/record` with payment details
- Invoice should auto-appear in CashierInvoices
- Payment should auto-appear in CashierPayments

### Medium Priority (Improvements)

**5. Customer Selection in Billing**

Currently CashierBilling has no customer field. Should add:
- Search existing customer by phone/name
- Quick add new customer (name + phone minimum)
- Walk-in customer option (no customer record)

**6. Real Email Sending**

Currently Send Email button only shows a toast. Should:
- Call POST /api/invoices/{id}/send-email
- Backend sends actual email with PDF attachment

**7. Low Stock Reorder Alert**

When admin sees low stock in inventory:
- Add "Reorder" button that creates a purchase order
- Or at minimum send email notification to admin

**8. Cashier Performance in Admin Dashboard**

Admin dashboard should show:
- Bills per cashier today
- Revenue per cashier today
- Best performing cashier

**9. Invoice Number Auto-Generation**

Currently invoice IDs are hardcoded (INV-2026-001 etc). Should:
- Auto-generate from backend with prefix from Settings
- Sequential numbering that never repeats

**10. GST Report for Tax Filing**

Admin Reports should include:
- CGST collected total
- SGST collected total
- IGST collected total
- HSN-wise summary
- Monthly GST return summary

### Low Priority (Nice to Have)

**11. Dark Mode**

Settings already has accent color picker. Can extend to full dark mode toggle.

**12. Barcode Scanner Support**

In CashierBilling, support USB barcode scanner input to auto-add products to cart by scanning barcode.

**13. Multiple Counters Dashboard**

Admin can see live status of all counters — which cashier is active, how many bills processed, current cart value.

**14. Cashier Shift Report**

At end of shift, cashier gets a summary:
- Total bills processed
- Total cash collected
- Total UPI collected
- Total card collected
- Any discrepancies

**15. Refund / Return Module**

Currently there is no way to handle returns. Should add:
- Mark invoice as returned
- Create credit note
- Adjust inventory stock back

---

## QUICK REFERENCE — API ENDPOINTS USED

| Endpoint | Method | Used By |
|----------|--------|---------|
| /api/auth/login | POST | Login page |
| /api/auth/logout | POST | Layout logout |
| /api/admin/pending-cashiers | GET | Role detection, AdminDashboard, Layout bell |
| /api/admin/active-cashiers | GET | AdminDashboard KPI |
| /api/admin/approve-cashier/{email} | POST | AdminDashboard, Layout bell |
| /api/products/all | GET | Products, CashierProducts |
| /api/products/add | POST | Products (Admin) |
| /api/products/update/{id} | PUT | Products (Admin) |
| /api/products/delete/{id} | DELETE | Products (Admin) |
| /api/categories/all | GET | Products (Admin) |
| /api/inventory/all | GET | AdminDashboard KPI |
| /api/inventory/low-stock | GET | Layout bell notification |

---

*Document generated for NexBill ERP Frontend v1.0*  
*All mock data pages need backend API integration to show real data.*
