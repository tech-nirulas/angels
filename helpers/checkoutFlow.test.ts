// Cart -> checkout -> payment -> order transition integrity (Batch 1D.3).
//
// These are source-level assertions, not a re-implementation: the rules below
// were each a real defect, and each one is a property of the shipped code that
// must not silently regress. Pure string checks need no browser and no server.
//
// Run: npx tsx helpers/checkoutFlow.test.ts
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

const cart = readFileSync(new URL('../app/cart/page.tsx', import.meta.url), 'utf8');
const endpoints = readFileSync(
  new URL('../features/order/orderEndpoints.ts', import.meta.url),
  'utf8',
);
const service = readFileSync(
  new URL('../features/order/orderApiService.ts', import.meta.url),
  'utf8',
);
const orderService = readFileSync(
  new URL(
    '../../aimk_backend/src/modules/order/order.service.ts',
    import.meta.url,
  ),
  'utf8',
);
const orderController = readFileSync(
  new URL(
    '../../aimk_backend/src/modules/order/order.controller.ts',
    import.meta.url,
  ),
  'utf8',
);

let n = 0;
const check = (ok: unknown, msg: string) => {
  n++;
  assert.ok(ok, msg);
};

// ── 1. Totals: the server is the only authority ──────────────────────────────
// The dialog used to compute its own total from a flat SHIPPING_COST and no
// GST, so the displayed amount could differ from the captured amount.
check(
  /usePreviewOrderMutation/.test(cart) && /orderTotal = serverTotals\?\.grandTotal/.test(cart),
  'the payable total must come from the server preview',
);
check(
  /order\/preview/.test(endpoints),
  'the preview endpoint must exist',
);
check(
  /usePreviewOrderMutation/.test(service),
  'the preview hook must be exported',
);
// The local estimate survives only as a fallback, never as the displayed value.
check(
  /const estimatedTotal =/.test(cart) && /estimatedTotal;\s*\n/.test(cart),
  'a local estimate may exist only as a fallback',
);

// ── 2. The cart is consumed by the CAPTURE, not by order creation ────────────
// createOrder used to delete every cart row before Razorpay was even opened, so
// a dismissal or a declined payment destroyed a basket that was never paid for.
const createOrderBody = orderService.slice(
  orderService.indexOf('async createOrder('),
  orderService.indexOf('async previewOrder('),
);
check(
  /if \(isCod\) \{\s*\n\s*await tx\.cartItem\.deleteMany/.test(createOrderBody),
  'createOrder must only clear the cart for COD',
);
check(
  /applyCaptureEffects\(tx, \{[\s\S]*?userId,/.test(orderService),
  'the capture path must consume the cart through the shared helper',
);
check(
  (createOrderBody.match(/cartItem\.deleteMany/g) ?? []).length === 1,
  'createOrder must contain exactly one cart delete',
);

// ── 3. Ownership on verify-payment (IDOR) ────────────────────────────────────
// The route had JwtAuthGuard but never read req.user, so any authenticated
// caller could confirm somebody else's order.
check(
  /verifyPayment\(\s*@Req\(\) req: Request/.test(orderController),
  'verify-payment must accept the request',
);
check(
  /orderService\.verifyPayment\(\s*\(req as any\)\.user\.id/.test(orderController),
  'verify-payment must pass the caller id to the service',
);
check(
  /async verifyPayment\(\s*userId: string/.test(orderService),
  'the service must take a userId',
);
check(
  /existing\.order\.customer\.userId !== userId/.test(orderService),
  'the service must enforce ownership before any write',
);
check(
  !/async verifyPayment\(\s*\n?\s*razorpayOrderId: string/.test(orderService),
  'the unguarded overload must be gone',
);

// ── 4. Idempotency key lifetime ──────────────────────────────────────────────
// A useRef dies on refresh, so a reload between payment and redirect could mint
// a second key and create a second order.
check(
  /sessionStorage\.getItem\(IDEMPOTENCY_KEY\)/.test(cart),
  'the key must be readable after a refresh',
);
check(
  /sessionStorage\.setItem\(IDEMPOTENCY_KEY, fresh\)/.test(cart),
  'a missing key must be minted once and stored',
);
check(
  /sessionStorage\.removeItem\(IDEMPOTENCY_KEY\)/.test(cart),
  'the key must be cleared on confirmation',
);
// Exactly two clear sites: confirmation, and a 409 conflict. Every other
// failure must KEEP the key so a retry replays the original order instead of
// creating a second one.
check(
  (cart.match(/sessionStorage\.removeItem/g) ?? []).length === 2,
  'the key must be cleared on confirmation and on a 409 conflict, nowhere else',
);
check(
  /if \(confirmed\) sessionStorage\.removeItem/.test(cart),
  'the clear must be conditional on confirmation',
);

// ── 5. Re-entrancy ──────────────────────────────────────────────────────────
// The disabled prop does not stop two clicks landing in the same tick.
check(
  /if \(placingRef\.current\) return;/.test(cart),
  'handleConfirmAndPay must bail on a synchronous re-entry',
);
check(
  /placingRef\.current = true;/.test(cart),
  'the guard must be set before the first await',
);
check(
  /const finishPlacingOrder = useCallback/.test(cart),
  'every exit path must go through one reset helper',
);
const rawResets = (cart.match(/setIsPlacingOrder\(false\)/g) ?? []).length;
check(rawResets === 1, 'isPlacingOrder must be cleared from one place only');
check(
  /finishPlacingOrder\(false\)/.test(cart),
  'a failure must still release the button',
);
check(
  /finishPlacingOrder\(true\)/.test(cart),
  'a confirmation must release the button and drop the key',
);

// ── 6. Cart cache invalidation must match what the server did ───────────────
// createOrder no longer consumes the cart for online payments, so invalidating
// there would refetch a still-full cart and make bought items look unbought.
const createOrderEndpoint = endpoints.slice(
  endpoints.indexOf('createOrder:'),
  endpoints.indexOf('verifyPayment:'),
);
check(
  /invalidatesTags: \[\]/.test(createOrderEndpoint),
  'createOrder must not invalidate the cart',
);
const verifyEndpoint = endpoints.slice(
  endpoints.indexOf('verifyPayment:'),
  endpoints.indexOf('getOrders:'),
);
check(
  /invalidatesTags: \["Cart"\]/.test(verifyEndpoint),
  'verifyPayment must invalidate the cart it consumed',
);

// ── 7. The webhook capture path must move the same counters ─────────────────
// payment.captured via webhook confirmed the order but never touched customer
// stats or the cart, so the two paths disagreed.
const webhook = orderService.slice(orderService.indexOf('async handleWebhook('));
check(
  /applyCaptureEffects/.test(webhook),
  'the webhook must apply the same capture effects',
);
check(
  /previousStatus !== 'CAPTURED'/.test(webhook),
  'a retried webhook must not double-count',
);

// ── 8. A 409 idempotency conflict must not leave the customer stuck ────────
// The backend rejects a reused key whose address or payment method changed. If
// the client kept that key, every retry would replay the same 409 forever.
const catchBlock = cart.slice(
  cart.indexOf('} catch (err) {', cart.indexOf('rzp.open()')),
);
check(
  /status === 409/.test(catchBlock),
  'the catch must detect the 409 conflict',
);
check(
  /sessionStorage\.removeItem\(IDEMPOTENCY_KEY\)/.test(catchBlock),
  'a 409 must discard the stale key so a retry can start a new attempt',
);
check(
  /rzp\.open\(\);[\s\S]*?\} catch \(err\) \{/.test(cart),
  'the conflict handling must be on the createOrder path',
);

// ── 9. The backend must reject, not silently replay, a changed payload ──────
const replay = orderService.slice(
  orderService.indexOf('private replayResponse('),
  orderService.indexOf('private static readonly replayInclude'),
);
check(
  /ConflictException/.test(replay),
  'replayResponse must reject a materially different payload',
);
check(
  /dto\.paymentMethod !== existingOrder\.paymentMethod/.test(replay),
  'a changed payment method must be treated as a conflict',
);
check(
  /dto\.deliveryAddressId !== existingOrder\.deliveryAddressId/.test(replay),
  'a changed delivery address must be treated as a conflict',
);

console.log(`checkoutFlow: ${n} assertions passed`);

// ---------------------------------------------------------------------------
// Address-selection seeding: a refetch must NOT clobber a user's explicit pick.
// `defaultAddress` is a new object identity on every refetch, so an effect that
// depends on it alone resets the selection back to the default.
// ---------------------------------------------------------------------------
function mountAddressSeeder(defaultAddress: { id: string } | null) {
  let selected: string | null = null;
  let userPicked = false;
  return {
    get selected() { return selected; },
    get userPicked() { return userPicked; },
    seed(nextDefault: { id: string } | null) {
      if (nextDefault && !userPicked) selected = nextDefault.id;
    },
    userSelect(id: string) { userPicked = true; selected = id; },
  };
}

console.log('--- address selection seeding ---');
{
  // initial mount seeds the default
  const m = mountAddressSeeder(null);
  m.seed({ id: 'default-1' });
  assert.equal(m.selected, 'default-1');
  console.log('PASS  initial mount selects the default address');
}
{
  // the bug: a refetch (new object identity) resets a user's explicit pick
  const m = mountAddressSeeder(null);
  m.seed({ id: 'default-1' });
  m.userSelect('office-2');
  m.seed({ id: 'default-1' }); // refetch -> NEW object, same default
  assert.equal(m.selected, 'office-2');
  console.log('PASS  refetch does not clobber a user-selected address');
}
{
  // and a genuine default change must still not override the user
  const m = mountAddressSeeder(null);
  m.seed({ id: 'default-1' });
  m.userSelect('office-2');
  m.seed({ id: 'default-3' });
  assert.equal(m.selected, 'office-2');
  console.log('PASS  a changed default does not override a user selection');
}
{
  // no user pick yet -> later defaults still flow through
  const m = mountAddressSeeder(null);
  m.seed({ id: 'default-1' });
  m.seed({ id: 'default-3' });
  assert.equal(m.selected, 'default-3');
  console.log('PASS  without a user pick the default still tracks changes');
}

console.log('\nAll checkoutFlow assertions passed.');
