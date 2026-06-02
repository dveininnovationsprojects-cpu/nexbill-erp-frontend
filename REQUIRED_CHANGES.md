# Backend Fix Required - Invoice 400 Error

## Problem
- Admin Invoice page: 400 Bad Request
- Cashier Invoice page: 400 Bad Request
- Both pages calling `/api/billing/history`

## Root Cause
`/api/billing/history` endpoint has ADMIN-only permission AND backend might be expecting different return type or has error in getAllBills() method.

---

## Quick Fix (Backend)

### Check BillingController.java

```java
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CASHIER')")  // ✅ Allow both
@GetMapping("/history")
public ResponseEntity<List<Invoice>> getBillingHistory() {
    try {
        return ResponseEntity.ok(billingService.getAllBills());
    } catch (Exception e) {
        e.printStackTrace();  // Check backend console for error
        return ResponseEntity.badRequest().build();
    }
}
```

### Check BillingService.java

Make sure `getAllBills()` method returns proper List<Invoice>:

```java
public List<Invoice> getAllBills() {
    return invoiceRepository.findAll();  // or findAllByOrderByCreatedAtDesc()
}
```

### Check InvoiceRepository.java

```java
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findAllByOrderByCreatedAtDesc();
}
```

---

## Debug Steps

1. **Check Backend Console** - Look for exception stack trace when invoice page loads
2. **Check Invoice Entity** - Make sure all fields are properly annotated
3. **Check relationships** - Invoice -> Customer, Invoice -> Items relationships properly configured
4. **Test endpoint directly**:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8080/api/billing/history
   ```

---

## Common 400 Errors

1. **Circular reference in JSON serialization**
   - Solution: Add `@JsonManagedReference` and `@JsonBackReference` on relationships
   
2. **Null values in required fields**
   - Solution: Check Invoice entity for nullable fields
   
3. **Missing getter/setter methods**
   - Solution: Add `@Data` or `@Getter/@Setter` Lombok annotations

---

## After Fix
1. Restart Spring Boot backend
2. Check backend console for startup errors
3. Refresh invoice page in frontend
4. Should load without 400 error
