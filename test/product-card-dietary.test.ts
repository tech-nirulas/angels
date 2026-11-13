import assert from 'node:assert';
import { readFileSync } from 'node:fs';

const card = readFileSync(new URL('../components/ui/ProductCard.tsx', import.meta.url), 'utf8');
const featured = readFileSync(new URL('../components/sections/FeaturedSection.tsx', import.meta.url), 'utf8');

// ProductCard checks
assert.ok(card.includes('DietaryBadge'), 'ProductCard must import and render DietaryBadge');
assert.ok(
  card.includes('from "@/components/common/DietaryBadge"') || card.includes("from '@/components/common/DietaryBadge'"),
  'ProductCard must import DietaryBadge from @/components/common/DietaryBadge'
);
assert.ok(
  card.includes('dietaryTags={product.dietaryTags}'),
  'ProductCard must pass dietaryTags={product.dietaryTags} to DietaryBadge'
);
assert.ok(
  card.includes('allergenInfo={product.allergenInfo}'),
  'ProductCard must pass allergenInfo={product.allergenInfo} to DietaryBadge'
);
assert.ok(
  card.includes('size="small"'),
  'ProductCard must pass size="small" to DietaryBadge'
);

// FeaturedSection checks
assert.ok(featured.includes('DietaryBadge'), 'FeaturedSection must import and render DietaryBadge');
assert.ok(
  featured.includes('from "@/components/common/DietaryBadge"') || featured.includes("from '@/components/common/DietaryBadge'"),
  'FeaturedSection must import DietaryBadge from @/components/common/DietaryBadge'
);
assert.ok(
  featured.includes('dietaryTags={product.dietaryTags}'),
  'FeaturedSection must pass dietaryTags={product.dietaryTags} to DietaryBadge'
);
assert.ok(
  featured.includes('allergenInfo={product.allergenInfo}'),
  'FeaturedSection must pass allergenInfo={product.allergenInfo} to DietaryBadge'
);
assert.ok(
  featured.includes('size="small"'),
  'FeaturedSection must pass size="small" to DietaryBadge'
);

console.log('PASS: ProductCard dietary badge integration');
