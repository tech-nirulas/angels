import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { getDietaryClassification } from '../utils/dietary.ts';

// 1. Static component checks on DietaryBadge.tsx
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

// MUI Components and dimensions
assert.ok(content.includes('Tooltip'), 'Must use MUI Tooltip');
assert.ok(content.includes('15') && content.includes('18'), 'Must support small (15px) and medium (18px) outer box');
assert.ok(content.includes('7') && content.includes('8'), 'Must support small (7px) and medium (8px) inner dot');
assert.ok(content.includes('50%'), 'Must use 50% border radius for inner dot');

// Exports
assert.ok(content.includes('export function DietaryBadge'), 'Must have named export DietaryBadge');
assert.ok(content.includes('export default DietaryBadge'), 'Must have default export DietaryBadge');
assert.ok(content.includes('export { getDietaryClassification'), 'Must re-export getDietaryClassification');

// 2. Direct unit test assertions for getDietaryClassification

// vegetarian tags -> green and circle
const vegResult = getDietaryClassification(['vegetarian']);
assert.ok(vegResult, 'Vegetarian tag must return classification');
assert.strictEqual(vegResult.color, '#16A34A', 'Vegetarian must be green #16A34A');
assert.strictEqual(vegResult.label, 'Vegetarian');
assert.strictEqual(vegResult.isVeg, true);
assert.strictEqual(vegResult.isNonVeg, false);
assert.strictEqual(vegResult.isEgg, false);
assert.strictEqual((vegResult as any).shape, 'circle', 'Vegetarian must have circle shape');

const veganResult = getDietaryClassification(['vegan']);
assert.ok(veganResult && veganResult.isVeg && veganResult.color === '#16A34A');
assert.strictEqual((veganResult as any).shape, 'circle');

const eggFreeResult = getDietaryClassification(['egg_free']);
assert.ok(eggFreeResult && eggFreeResult.isVeg && eggFreeResult.color === '#16A34A');
assert.strictEqual((eggFreeResult as any).shape, 'circle');

// non_vegetarian tags -> red and triangle
const nonVegResult = getDietaryClassification(['non_vegetarian']);
assert.ok(nonVegResult, 'Non-vegetarian tag must return classification');
assert.strictEqual(nonVegResult.color, '#DC2626', 'Non-vegetarian must be red #DC2626');
assert.strictEqual(nonVegResult.label, 'Non-Vegetarian');
assert.strictEqual(nonVegResult.isNonVeg, true);
assert.strictEqual(nonVegResult.isVeg, false);
assert.strictEqual(nonVegResult.isEgg, false);
assert.strictEqual((nonVegResult as any).shape, 'triangle', 'Non-Vegetarian must have triangle shape');

const nonVegAltResult = getDietaryClassification(['nonveg']);
assert.ok(nonVegAltResult && nonVegAltResult.isNonVeg && nonVegAltResult.color === '#DC2626');
assert.strictEqual((nonVegAltResult as any).shape, 'triangle');

// contains_egg tags -> amber and triangle
const eggResult = getDietaryClassification(['contains_egg']);
assert.ok(eggResult, 'Contains egg tag must return classification');
assert.strictEqual(eggResult.color, '#D97706', 'Contains egg must be amber #D97706');
assert.strictEqual(eggResult.label, 'Contains Egg');
assert.strictEqual(eggResult.isEgg, true);
assert.strictEqual(eggResult.isVeg, false);
assert.strictEqual(eggResult.isNonVeg, false);
assert.strictEqual((eggResult as any).shape, 'triangle', 'Contains Egg must have triangle shape');

const eggAllergenContains = getDietaryClassification([], { contains: ['eggs'] });
assert.ok(eggAllergenContains && eggAllergenContains.isEgg && eggAllergenContains.color === '#D97706');

const eggAllergenBool = getDietaryClassification([], { egg: true });
assert.ok(eggAllergenBool && eggAllergenBool.isEgg && eggAllergenBool.color === '#D97706');

// cross-contamination mayContain: ["eggs"] on vegetarian product -> stays vegetarian (not egg)
const crossContamVeg = getDietaryClassification(['vegetarian'], { mayContain: ['eggs'] });
assert.ok(crossContamVeg, 'Cross-contamination product must have classification');
assert.strictEqual(crossContamVeg.color, '#16A34A', 'Cross-contamination on veg product must stay green vegetarian');
assert.strictEqual(crossContamVeg.isVeg, true);
assert.strictEqual(crossContamVeg.isEgg, false);

// explicit veg overrides ambiguous allergen info contains
const explicitVegWithAllergenContains = getDietaryClassification(['vegetarian'], { contains: ['eggs'] });
assert.strictEqual(
  explicitVegWithAllergenContains?.color,
  '#16A34A',
  'Explicit vegetarian tag must not be overridden by allergen fallback unless contains_egg is explicitly tagged'
);
assert.strictEqual(explicitVegWithAllergenContains?.isVeg, true);

// cross-contamination mayContain on unclassified product -> returns null (not egg)
const unclassifiedMayContain = getDietaryClassification([], { mayContain: ['eggs'] });
assert.strictEqual(unclassifiedMayContain, null, 'mayContain trace warning should not mark product as contains_egg');

// missing/unclassified -> returns null
assert.strictEqual(getDietaryClassification(), null, 'undefined args must return null');
assert.strictEqual(getDietaryClassification([]), null, 'empty array must return null');
assert.strictEqual(getDietaryClassification(null), null, 'null tags must return null');
assert.strictEqual(getDietaryClassification(['gluten_free', 'nut_free']), null, 'lifestyle only tags without primary status must return null');

console.log('PASS: DietaryBadge component and unit tests passed cleanly');
