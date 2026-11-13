import assert from 'node:assert';
import { readFileSync } from 'node:fs';

const modal = readFileSync(new URL('../components/ui/ProductModal.tsx', import.meta.url), 'utf8');

// DietaryBadge import check
assert.ok(
  modal.includes('from "@/components/common/DietaryBadge"') || modal.includes("from '@/components/common/DietaryBadge'"),
  'ProductModal must import DietaryBadge from @/components/common/DietaryBadge'
);
assert.ok(modal.includes('DietaryBadge'), 'ProductModal must render DietaryBadge');
assert.ok(modal.includes('getDietaryClassification'), 'ProductModal must use getDietaryClassification');

// Title row check: medium size badge with dietaryTags and allergenInfo
assert.ok(modal.includes('size="medium"'), 'ProductModal must render DietaryBadge with size="medium" alongside title');
assert.ok(modal.includes('dietaryTags={product.dietaryTags}'), 'ProductModal must pass dietaryTags={product.dietaryTags} to DietaryBadge');
assert.ok(modal.includes('allergenInfo={product.allergenInfo}'), 'ProductModal must pass allergenInfo={product.allergenInfo} to DietaryBadge');

// Dietary section check: explicit classification tag
assert.ok(modal.includes('100% Vegetarian'), 'ProductModal dietary section must display explicit "100% Vegetarian" label');

console.log('PASS: ProductModal dietary badge integration');
