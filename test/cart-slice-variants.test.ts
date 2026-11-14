import assert from 'node:assert';
import cartReducer, {
  addToGuestCart,
  updateGuestQuantity,
  removeFromGuestCart,
  clearGuestCart,
} from '../features/cart/cartSlice.ts';

// Reset guest cart
let state = cartReducer(undefined, clearGuestCart());
assert.strictEqual(state.guestItems.length, 0);

const mockBaseProduct = {
  id: 'prod-truffle-1',
  name: 'Dutch Truffle Cake',
  slug: 'dutch-truffle-cake',
  description: 'Rich chocolate truffle',
  basePrice: 500,
  inStock: true,
};

// 1. Add 500g variant (Price: 500)
state = cartReducer(
  state,
  addToGuestCart({
    productId: 'prod-truffle-1',
    quantity: 1,
    variantId: 'var-500g',
    selectedVariant: { id: 'var-500g', name: '500g', price: 500 },
    product: mockBaseProduct,
    unitPrice: 500,
  })
);

assert.strictEqual(state.guestItems.length, 1);
assert.strictEqual(state.guestItems[0].variantId, 'var-500g');
assert.strictEqual(state.guestItems[0].quantity, 1);
assert.strictEqual(state.guestItems[0].currentPrice, 500);
assert.strictEqual(state.guestItems[0].lineTotal, 500);

const hash500g = state.guestItems[0].configurationHash;
assert.ok(hash500g, '500g line must have configurationHash');

// 2. Add 1kg variant of the same product (Price: 950)
state = cartReducer(
  state,
  addToGuestCart({
    productId: 'prod-truffle-1',
    quantity: 1,
    variantId: 'var-1kg',
    selectedVariant: { id: 'var-1kg', name: '1 kg', price: 950 },
    product: mockBaseProduct,
    unitPrice: 950,
  })
);

// MUST be two distinct lines, NOT merged!
assert.strictEqual(state.guestItems.length, 2, 'Different variants must create separate line items');
assert.strictEqual(state.guestItems[1].variantId, 'var-1kg');
assert.strictEqual(state.guestItems[1].currentPrice, 950);
assert.strictEqual(state.guestItems[1].lineTotal, 950);

const hash1kg = state.guestItems[1].configurationHash;
assert.notStrictEqual(hash500g, hash1kg, 'Hash for 500g and 1kg must be different');

// 3. Add 500g variant AGAIN with a modifier (Eggless +₹50 = 550)
state = cartReducer(
  state,
  addToGuestCart({
    productId: 'prod-truffle-1',
    quantity: 1,
    variantId: 'var-500g',
    selectedVariant: { id: 'var-500g', name: '500g', price: 500 },
    modifierOptionIds: ['mod-eggless'],
    selectedModifiers: [
      { groupId: 'grp-prep', groupName: 'Preparation', optionId: 'mod-eggless', optionName: 'Eggless', price: 50 },
    ],
    product: mockBaseProduct,
    unitPrice: 550,
  })
);

// MUST be three distinct lines now (regular 500g, 1kg, eggless 500g)
assert.strictEqual(state.guestItems.length, 3, 'Variant with modifier must be a distinct line');

// 4. Add the SAME regular 500g again -> should increment quantity to 2
state = cartReducer(
  state,
  addToGuestCart({
    productId: 'prod-truffle-1',
    quantity: 1,
    variantId: 'var-500g',
    selectedVariant: { id: 'var-500g', name: '500g', price: 500 },
    product: mockBaseProduct,
    unitPrice: 500,
  })
);

assert.strictEqual(state.guestItems.length, 3, 'Adding identical configuration must increment existing line');
const line500g = state.guestItems.find((i) => i.configurationHash === hash500g);
assert.strictEqual(line500g?.quantity, 2);
assert.strictEqual(line500g?.lineTotal, 1000);

// 5. Update quantity of the 1kg item using its hash
state = cartReducer(
  state,
  updateGuestQuantity({
    itemIdentifier: hash1kg,
    quantity: 3,
  })
);

const line1kg = state.guestItems.find((i) => i.configurationHash === hash1kg);
assert.strictEqual(line1kg?.quantity, 3);
assert.strictEqual(line1kg?.lineTotal, 2850); // 950 * 3

// 6. Remove the eggless 500g item using its configuration hash
const egglessHash = state.guestItems.find((i) => i.selectedModifiers?.length === 1)?.configurationHash;
assert.ok(egglessHash);
state = cartReducer(state, removeFromGuestCart(egglessHash));
assert.strictEqual(state.guestItems.length, 2);
assert.ok(!state.guestItems.some((i) => i.configurationHash === egglessHash));

// 7. Verify variant price is not clamped when base product has a lower discountedPrice
const discountedBaseProduct = {
  id: 'prod-cake-discounted',
  name: 'Vanilla Celebration Cake',
  slug: 'vanilla-celebration-cake',
  description: 'Vanilla cake with base discount',
  basePrice: 500,
  discountedPrice: 400, // Base product discount
  inStock: true,
};

state = cartReducer(
  state,
  addToGuestCart({
    productId: 'prod-cake-discounted',
    quantity: 1,
    variantId: 'var-2kg-vanilla',
    selectedVariant: { id: 'var-2kg-vanilla', name: '2 kg', price: 1800 },
    product: discountedBaseProduct,
    unitPrice: 1800,
  })
);

const vanilla2kg = state.guestItems.find((i) => i.variantId === 'var-2kg-vanilla');
assert.ok(vanilla2kg);
assert.strictEqual(vanilla2kg?.currentPrice, 1800);
assert.strictEqual(vanilla2kg?.lineTotal, 1800, 'Variant lineTotal must not be clamped to base product discountedPrice (400)');

// Increment quantity of the 2kg variant to 2
state = cartReducer(
  state,
  updateGuestQuantity({
    itemIdentifier: vanilla2kg.configurationHash,
    quantity: 2,
  })
);
const updatedVanilla2kg = state.guestItems.find((i) => i.variantId === 'var-2kg-vanilla');
assert.strictEqual(updatedVanilla2kg?.quantity, 2);
assert.strictEqual(updatedVanilla2kg?.lineTotal, 3600, 'Variant lineTotal when quantity=2 must be 1800*2=3600');

console.log('PASS: cartSlice multi-variant and modifier line management tests passed cleanly');
