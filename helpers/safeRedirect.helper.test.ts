// helpers/safeRedirect.helper.test.ts
// One runnable check for the returnTo trust boundary (open-redirect guard).
// Run: npx tsx helpers/safeRedirect.helper.test.ts
import assert from 'node:assert';
import {
  addressReturnPath,
  addressesPathFor,
  loginPathFor,
  safeReturnTo,
} from './safeRedirect.helper';

const cases: Array<[string | null | undefined, string | null]> = [
  // valid in-app paths pass through unchanged
  ['/orders', '/orders'],
  ['/profile/edit?tab=password', '/profile/edit?tab=password'],
  ['/orders/abc-123', '/orders/abc-123'],
  // open-redirect / protocol-relative / backslash tricks are refused
  ['//evil.com', null],
  ['https://evil.com', null],
  ['http://evil.com/x', null],
  ['/\\evil.com', null],
  ['javascript:alert(1)', null],
  ['/login', null],
  ['/login?returnTo=/orders', null],
  // empty / missing
  [null, null],
  [undefined, null],
  ['', null],
];

for (const [input, expected] of cases) {
  assert.strictEqual(
    safeReturnTo(input),
    expected,
    `safeReturnTo(${JSON.stringify(input)}) should be ${JSON.stringify(expected)}`
  );
}

// loginPathFor: public routes need no login, protected ones carry the destination.
assert.strictEqual(loginPathFor('/menu'), '', 'public route must not force login');
assert.strictEqual(loginPathFor('/menu/category/birthday'), '', 'public subpath must not force login');
assert.strictEqual(loginPathFor('/cart'), '', '/cart is browsable as guest');
assert.strictEqual(loginPathFor('/orders'), '/login?returnTo=%2Forders', 'protected route carries destination');
assert.strictEqual(
  loginPathFor('/profile/edit', '?tab=password'),
  '/login?returnTo=%2Fprofile%2Fedit%3Ftab%3Dpassword',
  'query string must survive the round trip'
);

// Round trip: what login lands on is exactly what the gate asked for.
const asked = loginPathFor('/profile/edit', '?tab=password');
const returnTo = new URLSearchParams(asked.split('?')[1]).get('returnTo');
assert.strictEqual(returnTo, '/profile/edit?tab=password', 'returnTo must round-trip exactly');

// addressReturnPath: never loops back to /addresses, always has a fallback.
assert.strictEqual(addressReturnPath('/cart'), '/cart', 'cart origin returns to cart');
assert.strictEqual(addressReturnPath('/profile'), '/profile', 'profile origin returns to profile');
assert.strictEqual(addressReturnPath(null), '/profile', 'missing returnTo falls back, never null');
assert.strictEqual(addressReturnPath(undefined), '/profile', 'undefined falls back');
assert.strictEqual(addressReturnPath(''), '/profile', 'empty falls back');
// open-redirect + self-reference must not survive
assert.strictEqual(addressReturnPath('//evil.com'), '/profile', 'open redirect rejected');
assert.strictEqual(addressReturnPath('https://evil.com'), '/profile', 'absolute URL rejected');
assert.strictEqual(addressReturnPath('/\\evil.com'), '/profile', 'backslash trick rejected');
assert.strictEqual(addressReturnPath('/addresses'), '/profile', 'self-return would loop');
assert.strictEqual(addressReturnPath('/addresses?returnTo=/cart'), '/profile', 'self-return w/ query loops');
assert.strictEqual(addressReturnPath('/addresses/abc'), '/profile', 'subpath self-return loops');
// cart state (query string) must survive
assert.strictEqual(
  addressReturnPath('/cart?step=checkout'),
  '/cart?step=checkout',
  'query params on the return path are preserved'
);

// addressesPathFor: only ever emits a path that addressReturnPath accepts.
assert.strictEqual(addressesPathFor('/cart'), '/addresses?returnTo=%2Fcart');
assert.strictEqual(addressesPathFor(), '/addresses', 'no origin -> bare page');
assert.strictEqual(addressesPathFor('//evil.com'), '/addresses', 'malicious origin dropped');
assert.ok(
  addressesPathFor('/cart').startsWith('/addresses?returnTo='),
  'entry point must carry the origin'
);

console.log(`safeRedirect.helper: ${cases.length + 25} assertions passed`);
