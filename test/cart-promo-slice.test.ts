import assert from 'node:assert';
import cartReducer, {
  applyPromo,
  clearGuestCart,
  updatePromoDiscount,
  selectAppliedPromo,
} from '../features/cart/cartSlice.ts';

// Initial state with an applied promo
const stateWithPromo = cartReducer(
  undefined,
  applyPromo({
    code: 'AIMKWEB25',
    discountAmount: 349.13,
    title: 'Flat 25% Off',
  })
);

assert.deepStrictEqual(stateWithPromo.appliedPromo, {
  code: 'AIMKWEB25',
  discountAmount: 349.13,
  title: 'Flat 25% Off',
});

// 1. clearGuestCart MUST clear appliedPromo
const stateAfterClear = cartReducer(stateWithPromo, clearGuestCart());
assert.strictEqual(
  stateAfterClear.appliedPromo,
  null,
  'clearGuestCart must reset appliedPromo to null'
);

// 2. updatePromoDiscount MUST update discountAmount while keeping code intact
const stateUpdated = cartReducer(stateWithPromo, updatePromoDiscount(150.50));
assert.strictEqual(
  stateUpdated.appliedPromo?.discountAmount,
  150.50,
  'updatePromoDiscount must update discountAmount to 150.50'
);
assert.strictEqual(
  stateUpdated.appliedPromo?.code,
  'AIMKWEB25',
  'updatePromoDiscount must keep original promo code'
);

console.log('PASS: cartSlice promo management tests passed cleanly');
