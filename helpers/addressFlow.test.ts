// Integration check: the shipped navigation logic end-to-end, no browser needed.
// Covers the flows a click-through can't reach deterministically (refresh,
// Back, malicious returnTo) because they are pure URL in -> URL out.
//
// Run: npx tsx helpers/addressFlow.test.ts
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { addressReturnPath, addressesPathFor, safeReturnTo } from './safeRedirect.helper';

/** Mirrors what /addresses does on mount + on success. */
const onMount = (search: string) => addressReturnPath(new URLSearchParams(search).get('returnTo'));
/** Mirrors what the cart/navbar do when linking in. */
const entry = (from: string) => addressesPathFor(from);

const cases: Array<[string, string, string]> = [
  // label, /addresses?returnTo=…, expected landing after a successful action
  ['cart → select → cart', '?returnTo=%2Fcart', '/cart'],
  ['checkout step → checkout', '?returnTo=%2Fcart%3Fstep%3Dcheckout', '/cart?step=checkout'],
  ['profile → edit → profile', '?returnTo=%2Fprofile', '/profile'],
  ['orders → → orders', '?returnTo=%2Forders', '/orders'],
  // missing / invalid / hostile
  ['no returnTo', '', '/profile'],
  ['empty returnTo', '?returnTo=', '/profile'],
  ['absolute URL', '?returnTo=https%3A%2F%2Fevil.com', '/profile'],
  ['protocol-relative', '?returnTo=%2F%2Fevil.com', '/profile'],
  ['backslash trick', '?returnTo=%2F%5Cevil.com', '/profile'],
  ['javascript:', '?returnTo=javascript%3Aalert(1)', '/profile'],
  ['self-return (loop guard)', '?returnTo=%2Faddresses', '/profile'],
  ['self-return with query', '?returnTo=%2Faddresses%3Fx%3D1', '/profile'],
  ['nested self-return', '?returnTo=%2Faddresses%2Fa1', '/profile'],
  ['bounce to login', '?returnTo=%2Flogin', '/profile'],
];

for (const [label, search, expected] of cases) {
  assert.strictEqual(onMount(search), expected, `${label}: got ${onMount(search)}`);
}

// Entry points only ever emit a returnTo the page will accept.
for (const from of ['/cart', '/profile', '/orders', undefined as unknown as string]) {
  const href = entry(from);
  assert.ok(href === '/addresses' || href.startsWith('/addresses?returnTo='), `bad href: ${href}`);
  // Whatever it emits must resolve to a real, non-looping landing.
  const landing = onMount(href.split('?')[1] ?? '');
  assert.notStrictEqual(landing, '/addresses', `entry ${href} would loop`);
}

// No redirect loop is reachable from any entry point.
const reachable = ['/cart', '/profile', '/orders'].flatMap((from) => {
  const landing = onMount(entry(from).split('?')[1] ?? '');
  return [landing];
});
for (const landing of reachable) {
  assert.ok(!landing.startsWith('/addresses'), `landing ${landing} re-enters /addresses`);
}

// The guard is the SAME function 1D.1 uses — no second system.
assert.strictEqual(safeReturnTo('//evil.com'), null, 'shared guard must reject');
assert.strictEqual(safeReturnTo('/cart'), '/cart', 'shared guard must allow');

// ── Payload contract (read off the real source, not duplicated by hand) ────────
const page = readFileSync(new URL('../app/addresses/page.tsx', import.meta.url), 'utf8');
const iface = readFileSync(new URL('../interfaces/address.interface.ts', import.meta.url), 'utf8');

// 1. The picker can only offer values the backend DTO accepts. An "OFFICE" type
//    400s in production, and the earlier bug was a value the UI could emit that
//    the API rejects — so the *source* is the assertion, not a copy of it.
const frontendTypes = new Set<string>();
for (const m of iface.matchAll(/^export type AddressType = (.+);$/gm)) {
  for (const t of m[1].matchAll(/"([A-Z_]+)"/g)) frontendTypes.add(t[1]!);
}
const offered = [...page.matchAll(/\{ value: "([A-Z_]+)", label:/g)].map((m) => m[1]!);
assert.ok(offered.length > 0, 'found the address-type options');
for (const v of offered) {
  assert.ok(frontendTypes.has(v), `offered "${v}" must be in AddressType`);
}
assert.deepStrictEqual([...frontendTypes].sort(), ['HOME', 'OTHER', 'WORK'], 'enum pinned');

// 2. Every field the UI requires must exist in the DTO's required set, and the
//    form must actually render an input for each one (a missing input = a
//    permanently-disabled submit, which is how a save would silently break).
const dtoRequired = new Set(['city', 'state', 'postcode']);  // @IsNotEmpty in the DTO
// Scoped to the REQUIRED_FIELDS array literal — a looser pattern also matches
// unrelated pairs like MAP_LIBRARIES' ["places", "geocoding"].
const requiredBlock = page.match(/REQUIRED_FIELDS[^=]*=\s*\[([\s\S]*?)\];/)?.[1] ?? '';
assert.ok(requiredBlock, 'found the REQUIRED_FIELDS array');
const uiRequired = [...requiredBlock.matchAll(/\["(\w+)",\s*"[^"]+"\]/g)].map((m) => m[1]!);
assert.deepStrictEqual([...new Set(uiRequired)].sort(), [...dtoRequired].sort(),
  'REQUIRED_FIELDS must mirror CreateAddressDto @IsNotEmpty exactly');
for (const f of dtoRequired) {
  assert.ok(new RegExp(`form\\.${f}\\b`).test(page), `form.${f} must be read`);
}

// 3. The submit button must gate on EXACTLY those fields. This is the bug the
//    test was written for: the button required line1+recipientName (both
//    @IsOptional() in the DTO) and omitted `state` (which the DTO requires) —
//    so it blocked valid saves and would still have let a missing state through.
const disableExpr = page.match(/disabled=\{([^}]*isLoading[^}]*)\}/)?.[1] ?? '';
assert.ok(disableExpr, 'found the submit disabled expression');
const gated = [...disableExpr.matchAll(/!form\.(\w+)/g)].map((m) => m[1]!);
assert.deepStrictEqual(gated.sort(), [...dtoRequired].sort(),
  'submit must be gated on exactly the DTO-required fields');

console.log(`addressFlow: ${cases.length + 8 + offered.length + dtoRequired.size + 3} assertions passed`);
