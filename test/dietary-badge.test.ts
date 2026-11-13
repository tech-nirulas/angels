import assert from 'node:assert';
import { readFileSync } from 'node:fs';

const content = readFileSync(
  new URL('../components/common/DietaryBadge.tsx', import.meta.url),
  'utf8',
);

// Accessibility
assert.ok(content.includes('role="img"'), 'Must have role="img" for accessibility');
assert.ok(content.includes('aria-label='), 'Must have aria-label for accessibility');

// Colors (FSSAI standard colors)
assert.ok(content.includes('#16A34A'), 'Must use green #16A34A for vegetarian');
assert.ok(content.includes('#DC2626'), 'Must use red #DC2626 for non-vegetarian');
assert.ok(content.includes('#D97706'), 'Must use amber #D97706 for contains_egg');

// Tag recognitions
assert.ok(content.includes('vegetarian'), 'Must recognize vegetarian tag');
assert.ok(content.includes('non_vegetarian'), 'Must recognize non_vegetarian tag');
assert.ok(content.includes('contains_egg'), 'Must recognize contains_egg tag');

// MUI Components and dimensions
assert.ok(content.includes('Tooltip'), 'Must use MUI Tooltip');
assert.ok(content.includes('15') && content.includes('18'), 'Must support small (15px) and medium (18px) outer box');
assert.ok(content.includes('7') && content.includes('8'), 'Must support small (7px) and medium (8px) inner dot');
assert.ok(content.includes('50%'), 'Must use 50% border radius for inner dot');

// Exports
assert.ok(content.includes('export function DietaryBadge'), 'Must have named export DietaryBadge');
assert.ok(content.includes('export default DietaryBadge'), 'Must have default export DietaryBadge');

console.log('PASS: DietaryBadge component tests');
