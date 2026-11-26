# Osas Motorcycle — Firestore Security Specification (Phase 0)

## 1. Data Invariants
1. **Default-Deny Safety Net:** Every unspecified path under `/databases/{database}/documents` is denied (`allow read, write: if false`).
2. **Public Catalog Integrity:** Visitors may `get` and `list` `/motorcycles/{bikeId}`, `/spareParts/{partId}`, and `get` `/showroom/public` (containing zero PII and no admin PINs), while only verified admins (`isAdmin()`) may `create`, `update`, or `delete` catalog records or showroom settings.
3. **Owner-Only PII Isolation:** Customer orders (`/orders`), test-ride bookings (`/testRides`), trade-in appraisals (`/tradeIns`), and user garage records (`/users/{userId}`) contain PII (`whatsapp`, `customerName`, `deliveryLocation`, `email`) and are strictly readable only by the owning verified user (`resource.data.userId == request.auth.uid`) or an authorized dealer admin (`isAdmin()` / `isBootstrappedAdmin()` for queries).
4. **No Self-Assigned Admin Roles:** Users cannot create or mutate `/admins/{uid}` or add privilege fields to `/users/{userId}`.
5. **Immutable Ownership & Server Timestamps:** `userId` and `createdAt` (`== request.time` on create) cannot be altered on update; `updatedAt` must equal `request.time`.
6. **Strict ID & Payload Boundaries:** All document IDs match `^[a-zA-Z0-9_\-]+$` (`<= 128` chars), all strings enforce bounded `.size()`, arrays enforce `.size() <= MAX` and first-element type validation, and unknown shadow keys are rejected via `keys().hasOnly(...)`.

## 2. The "Dirty Dozen" Payloads (Expected `PERMISSION_DENIED`)
1. **Unauthenticated Order Write:** Unauthenticated request creating `/orders/ORD-1` without `request.auth` -> DENIED.
2. **Email Spoofing (`email_verified: false`):** Authenticated token claiming `willosezele@gmail.com` with `email_verified: false` attempting admin write on `/motorcycles/boxer-1` -> DENIED.
3. **UID Impersonation on Order Create:** Signed-in user `uidA` creating `/orders/ORD-2` with `userId: "uidB"` -> DENIED.
4. **Shadow Field Injection:** Signed-in user creating `/orders/ORD-3` with extra ghost key `isPaid: true` or `role: "admin"` -> DENIED (`keys().hasOnly`).
5. **Status Shortcutting on Create:** Signed-in user creating `/orders/ORD-4` with `status: "Delivered"` instead of `"Pending"` -> DENIED.
6. **Non-Admin Catalog Tampering:** Standard signed-in customer updating `priceNGN: 1` on `/motorcycles/bajaj-boxer-bm100` -> DENIED.
7. **PII Cross-User Read:** Signed-in user `uidA` reading `/orders/ORD-owned-by-uidB` -> DENIED.
8. **Blanket Order List Scraping:** Signed-in user `uidA` running unfiltered `collection(db, 'orders')` list query without `where('userId', '==', uidA)` -> DENIED (`allow list` requires `resource.data.userId == request.auth.uid || isBootstrappedAdmin()`).
9. **ID Poisoning:** Signed-in user writing `/orders/` with a 300-character or `$invalid!` document ID -> DENIED (`isValidId`).
10. **Client-Forged Timestamp:** Signed-in user creating `/orders/ORD-5` with `createdAt` set to a past client `Timestamp` instead of `serverTimestamp()` -> DENIED (`incoming().createdAt == request.time`).
11. **Terminal State Bypass:** Non-admin user updating an order whose `status` is already `"Delivered"` back to `"Pending"` -> DENIED.
12. **Self-Promotion to Admin:** Standard user `uidA` creating `/admins/uidA` with `role: "admin"` -> DENIED.
