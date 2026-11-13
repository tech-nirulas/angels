# Cart Coupon Auto-Revalidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure applied coupons/promo codes in the cart are automatically re-validated or removed whenever cart items are modified, emptied, or no longer meet eligibility criteria (such as minimum order value).

**Architecture:** 
1. In `cartSlice.ts`, enhance `clearGuestCart` so clearing cart items also resets `appliedPromo`. Add an `updatePromoDiscount` action for updating re-evaluated discount amounts cleanly.
2. In `app/cart/page.tsx`, introduce a reactive revalidation effect that triggers when cart items (`normalizedItems`) change while an `appliedPromo` is present.
3. If items change and `appliedPromo` exists, evaluate against the backend `/offer/validate-code` (or server preview):
   - If the cart subtotal is 0 or empty, automatically dispatch `removePromo()`.
   - If the backend returns ineligibility (e.g., minimum order value of ₹599 not met), dispatch `removePromo()` and notify the user via snackbar.
   - If the coupon remains valid, update the stored `discountAmount` to the new recalculated value.
4. In `app/cart/page.tsx`, if `previewOrder` encounters a promotion rejection, clear the promo instead of keeping stale local savings.
5. Create unit tests in `test/cart-promo-slice.test.ts` and `test/cart-revalidation-helper.test.ts` to test and guarantee the logic.

**Tech Stack:** Next.js 16, React 19, Redux Toolkit, Node test runner (`node:assert`).

---

## Global Constraints
- Framework: Next.js 16 / React 19 (App Router). Heed deprecation notices.
- Styling: MUI `sx` prop; keep aesthetic and layout consistent.
- Incrementality: Step-by-step changes with verification.
- Documentation: Update `LOG.md` in `angels`.

---

## Review Focus
1. When cart becomes empty, `appliedPromo` must be cleared immediately.
2. When an item is removed causing cart subtotal to drop below `minOrderValue` (e.g. ₹599), the coupon must be revoked and the user informed.
3. When item quantity changes but cart remains above ₹599, the coupon discount amount must recalculate to match the new 25% value.
4. When adding a new item after removing items, the coupon must not apply old stale discount amounts.
5. Unauthenticated (guest) and authenticated users must both experience consistent coupon revalidation.

---

### Task 1: Redux Slice Hardening (`cartSlice.ts`)

**Files:**
- Modify: `features/cart/cartSlice.ts`
- Test: `test/cart-promo-slice.test.ts`

**Interfaces:**
- Consumes: `AppliedPromoInfo`, `CartState`
- Produces: Updated `clearGuestCart` (resets `appliedPromo = null`), `updatePromoDiscount(discountAmount: number)` action.

- [ ] **Step 1: Write failing test in `test/cart-promo-slice.test.ts`**
  Test that `clearGuestCart` clears `appliedPromo`, and `updatePromoDiscount` updates the discount amount without losing the promo code.

- [ ] **Step 2: Run test to verify it fails**
  Run: `node test/cart-promo-slice.test.ts`
  Expected: FAIL

- [ ] **Step 3: Update `features/cart/cartSlice.ts`**
  - In `clearGuestCart`: add `state.appliedPromo = null;`.
  - Add `updatePromoDiscount(state, action: PayloadAction<number>)` reducer to update `state.appliedPromo.discountAmount`.

- [ ] **Step 4: Run test to verify it passes**
  Run: `node test/cart-promo-slice.test.ts`
  Expected: PASS

- [ ] **Step 5: Commit**
  Run: `git add features/cart/cartSlice.ts test/cart-promo-slice.test.ts && git commit -m "fix(cart): clear appliedPromo on clearGuestCart and add updatePromoDiscount"`

---

### Task 2: Reactive Coupon Revalidation on Cart Mutation (`app/cart/page.tsx`)

**Files:**
- Modify: `app/cart/page.tsx`
- Test: `test/cart-revalidation-helper.test.ts`

**Interfaces:**
- Consumes: `normalizedItems`, `appliedPromo`, `validateOfferCode`, `dispatch`
- Produces: Auto-revalidation effect and immediate stale discount guard.

- [ ] **Step 1: Write helper logic & test in `test/cart-revalidation-helper.test.ts`**
  Test cart validation decision helper: given cart items and applied promo, verify whether coupon should be auto-dropped or recalculated.

- [ ] **Step 2: Run test to verify it fails**
  Run: `node test/cart-revalidation-helper.test.ts`
  Expected: FAIL

- [ ] **Step 3: Implement revalidation effect in `app/cart/page.tsx`**
  - Add `useEffect` that watches `normalizedItems` and `appliedPromo?.code`.
  - If `normalizedItems.length === 0` and `appliedPromo`: dispatch `removePromo()`.
  - When `normalizedItems` changes and `appliedPromo` exists:
    - Debounce/call `validateOfferCode` with current items.
    - If response returns `eligible === false` (e.g. minimum order not met): dispatch `removePromo()` and trigger `showSnack(errMessage, "error")`.
    - If response returns `eligible === true`: dispatch `applyPromo` / `updatePromoDiscount` with updated `res.data.discountAmount`.
  - Guard local calculation: `promoSaving` should be capped at `cartTotalIncl` (`Math.min(appliedPromo.discountAmount, cartTotalIncl)`) as a defense-in-depth measure.
  - In `previewOrder` `.catch()`: if preview fails specifically due to a promotion issue, drop the promo code.

- [ ] **Step 4: Run test to verify helper tests pass**
  Run: `node test/cart-revalidation-helper.test.ts`
  Expected: PASS

- [ ] **Step 5: Commit**
  Run: `git add app/cart/page.tsx test/cart-revalidation-helper.test.ts && git commit -m "feat(cart): auto-revalidate promo code on cart item changes and remove ineligible coupons"`

---

### Task 3: Update `LOG.md` & Full End-to-End Verification

**Files:**
- Modify: `LOG.md`

- [ ] **Step 1: Run all test suites in `angels`**
  Run: `node test/pricing.test.ts && node test/cart-promo-slice.test.ts && node test/cart-revalidation-helper.test.ts`
  Expected: All PASS.

- [ ] **Step 2: Verify `npm run lint` or `npm run build`**
  Run Next.js build or lint check to ensure no TypeScript or bundling regressions.

- [ ] **Step 3: Update `LOG.md`**
  Document the bug, root cause, and the applied fix in `LOG.md`.

- [ ] **Step 4: Commit**
  Run: `git add LOG.md && git commit -m "docs: record cart coupon auto-revalidation fix in LOG.md"`
