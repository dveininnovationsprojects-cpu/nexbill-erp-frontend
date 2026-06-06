# Required Backend Changes for NexBill ERP

## Issue: Cashier Cannot View Invoices
Cashiers get "Session expired or unauthorized" when trying to view invoices because `/api/billing/history` is ADMIN-only.

---

## Solution: 3 File Changes

### 1. BillingController.java
**Change permission from ADMIN-only to both ADMIN + CASHIER:**

```java
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CASHIER')")
@GetMapping("/history")
public ResponseEntity<List<Invoice>> getBillingHistory() {
    return ResponseEntity.ok(billingService.getAllBillsForUser());
}
```

---

### 2. BillingServiceImpl.java
**Add role-based filtering method:**

```java
@Override
public List<Invoice> getAllBillsForUser() {
    String currentUserEmail = SecurityContextHolder.getContext()
        .getAuthentication().getName();
    
    User currentUser = userRepository.findByEmail(currentUserEmail)
        .orElseThrow(() -> new RuntimeException("User not found"));
    
    if (currentUser.getRole() == Role.ADMIN) {
        return invoiceRepository.findAllByOrderByInvoiceDateDesc();
    } else {
        return invoiceRepository.findByCashierEmailOrderByInvoiceDateDesc(currentUserEmail);
    }
}
```

---

### 3. InvoiceRepository.java
**Add query methods:**

```java
List<Invoice> findAllByOrderByInvoiceDateDesc();
List<Invoice> findByCashierEmailOrderByInvoiceDateDesc(String cashierEmail);
```

---

## Testing

### As Admin:
```bash
curl -H "Authorization: Bearer <admin-token>" http://localhost:8080/api/billing/history
# Should return ALL invoices
```

### As Cashier:
```bash
curl -H "Authorization: Bearer <cashier-token>" http://localhost:8080/api/billing/history
# Should return only that cashier's invoices
```

---

## Frontend Already Updated ✅
- CashierInvoices.jsx uses `/api/billing/history`
- api.js sends Bearer token automatically
- No frontend changes needed

---

## After Backend Fix
1. Restart Spring Boot backend
2. Login as cashier in frontend
3. Navigate to Invoices page
4. Should see list of invoices without "Session expired" error
