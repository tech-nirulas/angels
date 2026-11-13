import assert from 'node:assert';
import {
  decidePromoRevalidation,
  calculateSafePromoSaving,
} from '../utils/cartPromo.ts';

const promo = {
  code: 'AIMKWEB25',
  discountAmount: 349.13,
  title: '25% Off',
};

// 1. If no promo is applied, decision is KEEP
assert.deepStrictEqual(
  decidePromoRevalidation(null, 5),
  { action: 'KEEP' }
);

// 2. If cart is empty, decision is REMOVE
assert.deepStrictEqual(
  decidePromoRevalidation(promo, 0),
  { action: 'REMOVE', reason: 'Cart is empty' }
);

// 3. If validation fails (e.g. min order not met), decision is REMOVE with reason
const failedValidation = {
  eligible: false,
  message: "Minimum order value of ₹599 required for code 'AIMKWEB25'",
};
assert.deepStrictEqual(
  decidePromoRevalidation(promo, 1, failedValidation),
  {
    action: 'REMOVE',
    reason: "Minimum order value of ₹599 required for code 'AIMKWEB25'",
  }
);

// 4. If validation succeeds with new discount amount, decision is UPDATE
const updatedValidation = {
  eligible: true,
  discountAmount: 200,
};
assert.deepStrictEqual(
  decidePromoRevalidation(promo, 2, updatedValidation),
  {
    action: 'UPDATE',
    newDiscountAmount: 200,
  }
);

// 5. If validation succeeds with same discount amount, decision is KEEP
const sameValidation = {
  eligible: true,
  discountAmount: 349.13,
};
assert.deepStrictEqual(
  decidePromoRevalidation(promo, 1, sameValidation),
  { action: 'KEEP' }
);

// 5b. Real backend response format without explicit "eligible" boolean field
const realBackendResponse = {
  offerId: '6c05ec87-b1f1-459c-90b6-b3d1400800bf',
  code: 'AIMKWEB25',
  discountAmount: 158,
};
assert.deepStrictEqual(
  decidePromoRevalidation(promo, 1, realBackendResponse),
  {
    action: 'UPDATE',
    newDiscountAmount: 158,
  },
  'Real backend response without explicit eligible flag must be recognized as valid and update discount'
);

// 6. calculateSafePromoSaving clamps savings to cart total (no negative totals)
assert.strictEqual(
  calculateSafePromoSaving(promo, 130.20),
  130.20,
  'Discount of 349.13 on cart of 130.20 must be clamped to 130.20'
);
assert.strictEqual(
  calculateSafePromoSaving(promo, 1000),
  349.13,
  'Discount of 349.13 on cart of 1000 stays 349.13'
);
assert.strictEqual(
  calculateSafePromoSaving(promo, 0),
  0,
  'Discount on 0 cart must be 0'
);
assert.strictEqual(
  calculateSafePromoSaving(null, 500),
  0,
  'No promo returns 0'
);

console.log('PASS: cartPromo helper tests passed cleanly');
