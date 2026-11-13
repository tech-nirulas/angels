import assert from 'node:assert';
import { taxInclusive, gstFromInclusive, gstRateOf, formatCurrency } from '../utils/pricing.ts';

// 1. taxInclusive whole-rupee rounding
assert.strictEqual(
  taxInclusive(86, 5),
  90,
  'Base ₹86 with 5% GST must round to whole rupee ₹90 (86 * 1.05 = 90.30)',
);

assert.strictEqual(
  taxInclusive(86.3, 5),
  91,
  'Base ₹86.30 with 5% GST must round to whole rupee ₹91 (86.30 * 1.05 = 90.615)',
);

assert.strictEqual(
  taxInclusive(100, 5),
  105,
  'Base ₹100 with 5% GST must equal ₹105',
);

assert.strictEqual(
  taxInclusive(250, 0),
  250,
  '0% GST item must equal base price ₹250',
);

// 2. gstFromInclusive paise precision
assert.strictEqual(
  gstFromInclusive(90, 5),
  4.29,
  'GST from inclusive ₹90 @ 5% must be ₹4.29',
);

assert.strictEqual(
  gstFromInclusive(91, 5),
  4.33,
  'GST from inclusive ₹91 @ 5% must be ₹4.33',
);

// 3. formatCurrency clean display
assert.strictEqual(formatCurrency(90), '₹90', 'Whole number 90 formats as ₹90');
assert.strictEqual(formatCurrency(90.00), '₹90', 'Whole number 90.00 formats as ₹90');
assert.strictEqual(formatCurrency(4.29), '₹4.29', 'Decimal 4.29 formats as ₹4.29');

console.log('PASS: taxInclusive, gstFromInclusive, and formatCurrency unit tests passed cleanly');
