# NexBill ERP — Admin Frontend API Requirements

All APIs require: `Authorization: Bearer <token>` header

Base URL: `http://localhost:8080`

---

## 1. AUTH

| Method | Endpoint | Body | Response | Used In |
|--------|----------|------|----------|---------|
| POST | `/api/auth/login` | `{ email, password }` | `{ token, message }` | Login |
| POST | `/api/auth/register` | `{ name, email, password, role, adminSecretKey }` | `{ message }` | Register |
| POST | `/api/auth/logout` | — | — | Layout (logout) |
| POST | `/api/auth/forgot-password` | `{ email }` | `{ message }` | ForgotPassword |
| POST | `/api/auth/verify-otp` | `{ email, otp }` | `{ message }` | ForgotPassword |
| POST | `/api/auth/reset-password` | `{ email, otp, newPassword }` | `{ message }` | ForgotPassword |

---

## 2. ADMIN — Cashier Management

| Method | Endpoint | Body | Response | Used In |
|--------|----------|------|----------|---------|
| GET | `/api/admin/pending-cashiers` | — | `[{ name, email }]` | AdminDashboard, Layout (bell) |
| POST | `/api/admin/approve-cashier/{email}` | `{ phone, branch, counterNumber, shiftTiming, basicSalary }` | `{ message }` | AdminDashboard, Layout (modal) |

---

## 3. PRODUCTS

| Method | Endpoint | Body | Response | Used In |
|--------|----------|------|----------|---------|
| GET | `/api/products/all` | — | `[Product]` | Products, Inventory, AdminDashboard (KPI) |
| GET | `/api/products/{id}` | — | `Product` | — |
| GET | `/api/products/search?keyword=` | — | `[Product]` | — |
| POST | `/api/products/add` | `Product` | `Product` | Products (add) |
| PUT | `/api/products/update/{id}` | `Product` | `Product` | Products (edit), Inventory (stock adjust) |
| DELETE | `/api/products/delete/{id}` | — | `{ message }` | Products (delete) |

**Product fields:** `sku, name, category, sellingPrice, purchasePrice, stock, minStock, gstRate, barcode, supplier, expiryDate, description, imageUrl`

---

## 4. CATEGORIES

| Method | Endpoint | Body | Response | Used In |
|--------|----------|------|----------|---------|
| GET | `/api/categories/all` | — | `[{ id, name }]` | Products (category dropdown) |
| POST | `/api/categories/add` | `{ name, description }` | `Category` | — |
| PUT | `/api/categories/update/{id}` | `{ name, description }` | `Category` | — |
| DELETE | `/api/categories/delete/{id}` | — | `{ message }` | — |

---

## 5. INVENTORY

| Method | Endpoint | Body | Response | Used In |
|--------|----------|------|----------|---------|
| GET | `/api/inventory/low-stock` | — | `[InventoryResponse]` | AdminDashboard (KPI), Layout (bell notifications) |
| GET | `/api/inventory/product/{productId}` | — | `InventoryResponse` | — |
| POST | `/api/inventory/add/{productId}?quantity=` | — | `{ message }` | — |
| POST | `/api/inventory/reduce/{productId}?quantity=` | — | `{ message }` | — |
| PUT | `/api/inventory/reorder-level/{productId}?newLevel=` | — | `{ message }` | — |

**InventoryResponse fields:** `inventoryId, productId, productName, sku, availableQuantity, reorderLevel, updatedAt`

---

## 6. CUSTOMERS

| Method | Endpoint | Body | Response | Used In |
|--------|----------|------|----------|---------|
| GET | `/api/customers` | — | `[CustomerResponseDto]` | Customers (list) |
| GET | `/api/customers/search?mobile=` | — | `CustomerResponseDto` | — |
| POST | `/api/customers` | `{ name, mobile, email, creditLimit }` | `CustomerResponseDto` | Customers (add) |
| PUT | `/api/customers/{id}` | `{ name, mobile, email, creditLimit }` | `CustomerResponseDto` | Customers (edit) |
| PUT | `/api/customers/{id}/ledger?bill=&paid=` | — | `CustomerResponseDto` | — |

**CustomerResponseDto fields:** `id, name, mobile, email, tier, totalSpentAmount, creditLimit, outstandingDebt`

---

## 7. SUPPLIERS

| Method | Endpoint | Body | Response | Used In |
|--------|----------|------|----------|---------|
| GET | `/api/suppliers` | — | `[SupplierResponseDto]` | Suppliers (list) |
| GET | `/api/suppliers/active` | — | `[SupplierResponseDto]` | — |
| GET | `/api/suppliers/{id}` | — | `SupplierResponseDto` | — |
| POST | `/api/suppliers` | `SupplierRequestDto` | `SupplierResponseDto` | Suppliers (add) |
| PUT | `/api/suppliers/{id}` | `SupplierRequestDto` | `SupplierResponseDto` | Suppliers (edit) |
| PUT | `/api/suppliers/{id}/toggle-status` | — | `{ message }` | — |
| PUT | `/api/suppliers/{id}/update-ledger?purchase=&paid=` | — | `SupplierResponseDto` | — |

**SupplierRequestDto fields:** `companyName, gstin, contactPerson, mobile, email, address, bankDetails`

> ⚠️ DELETE supplier endpoint is missing in backend — frontend calls it but backend has no `DELETE /api/suppliers/{id}`

---

## 8. BILLING / INVOICES

> ⚠️ Currently using MOCK DATA — no backend API connected yet

**APIs needed from backend:**

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/invoices` | — | `[Invoice]` |
| POST | `/api/invoices` | `InvoiceRequest` | `Invoice` |
| PUT | `/api/invoices/{id}/status` | `{ status }` | `Invoice` |
| DELETE | `/api/invoices/{id}` | — | `{ message }` |

---

## 9. PAYMENTS

> ⚠️ Currently using MOCK DATA — no backend API connected yet

**APIs needed from backend:**

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/payments` | — | `[Payment]` |
| GET | `/api/payments/summary` | — | `{ totalCollected, pending, failed }` |

---

## 10. REPORTS / SALES ANALYTICS

> ⚠️ Currently using MOCK DATA passed as props — no backend API connected yet

**APIs needed from backend:**

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/reports/sales?from=&to=` | — | `[SaleRecord]` |
| GET | `/api/reports/summary` | — | `{ revenue, orders, gst, discount }` |

---

## 11. SETTINGS

> ⚠️ All settings are local state only — no backend API connected yet

**APIs needed from backend:**

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/settings/business-profile` | — | `BusinessProfile` |
| PUT | `/api/settings/business-profile` | `BusinessProfile` | `{ message }` |
| PUT | `/api/settings/invoice` | `InvoiceSettings` | `{ message }` |
| PUT | `/api/settings/tax` | `TaxSettings` | `{ message }` |

---

## 12. PROFILE

> ⚠️ Profile info is hardcoded — no backend API connected yet

**APIs needed from backend:**

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/profile` | — | `{ name, phone, department, bio }` |
| PUT | `/api/profile` | `{ name, phone, department, bio }` | `{ message }` |
| PUT | `/api/profile/change-password` | `{ currentPassword, newPassword }` | `{ message }` |

---

## Summary — Backend Status

| Module | Status |
|--------|--------|
| Auth | ✅ Connected |
| Cashier Approval | ✅ Connected |
| Products | ✅ Connected |
| Categories | ✅ Connected |
| Inventory | ✅ Connected |
| Customers | ✅ Connected |
| Suppliers | ✅ Connected (DELETE missing) |
| Billing/Invoices | ❌ Mock data — API needed |
| Payments | ❌ Mock data — API needed |
| Reports/Analytics | ❌ Mock data — API needed |
| Settings | ❌ Local state — API needed |
| Profile | ❌ Hardcoded — API needed |
