/**
 * Phase 0 Payload-First Security Test Specification for Osas Motorcycle Firestore Rules.
 * Verifies all Dirty Dozen adversarial payloads against firestore.rules.
 */

export interface SecurityTestCase {
  id: string;
  title: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  actor: 'guest' | 'unverified-admin-email' | 'customer-a' | 'customer-b' | 'admin';
  payload?: Record<string, unknown>;
  expected: 'ALLOW' | 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_CASES: SecurityTestCase[] = [
  {
    id: 'DD-01',
    title: 'Unauthenticated order create is denied',
    collectionPath: '/orders/ORD-1001',
    operation: 'create',
    actor: 'guest',
    payload: { id: 'ORD-1001', userId: 'anon', status: 'Pending' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-02',
    title: 'Unverified admin email cannot mutate catalog',
    collectionPath: '/motorcycles/bajaj-boxer-bm100',
    operation: 'update',
    actor: 'unverified-admin-email',
    payload: { priceNGN: 100 },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-03',
    title: 'Customer A cannot spoof userId as Customer B on order create',
    collectionPath: '/orders/ORD-1002',
    operation: 'create',
    actor: 'customer-a',
    payload: { id: 'ORD-1002', userId: 'customer-b', status: 'Pending' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-04',
    title: 'Shadow field isAdmin/isPaid rejected on order create',
    collectionPath: '/orders/ORD-1003',
    operation: 'create',
    actor: 'customer-a',
    payload: { id: 'ORD-1003', userId: 'customer-a', status: 'Pending', isPaid: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-05',
    title: 'Customer cannot shortcut order status to Delivered on create',
    collectionPath: '/orders/ORD-1004',
    operation: 'create',
    actor: 'customer-a',
    payload: { id: 'ORD-1004', userId: 'customer-a', status: 'Delivered' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-06',
    title: 'Customer cannot alter motorcycle priceNGN',
    collectionPath: '/motorcycles/bajaj-boxer-bm100',
    operation: 'update',
    actor: 'customer-a',
    payload: { priceNGN: 1 },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-07',
    title: 'Customer A cannot read Customer B order PII',
    collectionPath: '/orders/ORD-B-1005',
    operation: 'get',
    actor: 'customer-a',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-08',
    title: 'Customer A cannot run unfiltered list query on /orders',
    collectionPath: '/orders',
    operation: 'list',
    actor: 'customer-a',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-09',
    title: 'Invalid path document ID rejected',
    collectionPath: '/orders/invalid$id!poison',
    operation: 'create',
    actor: 'customer-a',
    payload: { id: 'invalid$id!poison', userId: 'customer-a', status: 'Pending' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-10',
    title: 'Client-forged createdAt timestamp rejected',
    collectionPath: '/orders/ORD-1006',
    operation: 'create',
    actor: 'customer-a',
    payload: { id: 'ORD-1006', userId: 'customer-a', status: 'Pending', createdAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-11',
    title: 'Customer cannot revert terminal Delivered order back to Pending',
    collectionPath: '/orders/ORD-A-DELIVERED',
    operation: 'update',
    actor: 'customer-a',
    payload: { status: 'Pending' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-12',
    title: 'Customer cannot self-register as admin in /admins',
    collectionPath: '/admins/customer-a',
    operation: 'create',
    actor: 'customer-a',
    payload: { email: 'attacker@gmail.com', role: 'admin' },
    expected: 'PERMISSION_DENIED',
  },
];
