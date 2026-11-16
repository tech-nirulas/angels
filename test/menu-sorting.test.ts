import assert from 'node:assert';

export function getProductPriorityScore(product: {
  bestSeller?: boolean;
  recommended?: boolean;
  featured?: boolean;
  newArrival?: boolean;
}): number {
  return (
    (product.bestSeller ? 8 : 0) +
    (product.recommended ? 4 : 0) +
    (product.featured ? 2 : 0) +
    (product.newArrival ? 1 : 0)
  );
}

export function sortMenuProductsByDefault<
  T extends {
    id: string;
    name: string;
    bestSeller?: boolean;
    recommended?: boolean;
    featured?: boolean;
    newArrival?: boolean;
    createdAt?: string | Date;
  }
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const scoreDiff = getProductPriorityScore(b) - getProductPriorityScore(a);
    if (scoreDiff !== 0) return scoreDiff;
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });
}

// ── Test Cases ─────────────────────────────────────────────────────────────────

const mockProducts = [
  { id: '1', name: 'Regular Croissant', createdAt: '2026-01-01' },
  { id: '2', name: 'New Arrival Sourdough', newArrival: true, createdAt: '2026-01-02' },
  { id: '3', name: 'Featured Baguette', featured: true, createdAt: '2026-01-03' },
  { id: '4', name: 'Chef Recommended Tart', recommended: true, createdAt: '2026-01-04' },
  { id: '5', name: 'Best Seller Truffle Cake', bestSeller: true, createdAt: '2026-01-05' },
  {
    id: '6',
    name: 'Top Pick (Best Seller + Recommended)',
    bestSeller: true,
    recommended: true,
    createdAt: '2026-01-06',
  },
];

const sorted = sortMenuProductsByDefault(mockProducts);

// 1. Assert order matches hierarchy
assert.strictEqual(sorted[0].id, '6', 'Top pick (Best Seller + Recommended) must rank #1');
assert.strictEqual(sorted[1].id, '5', 'Best Seller must rank #2');
assert.strictEqual(sorted[2].id, '4', 'Recommended must rank #3');
assert.strictEqual(sorted[3].id, '3', 'Featured must rank #4');
assert.strictEqual(sorted[4].id, '2', 'New Arrival must rank #5');
assert.strictEqual(sorted[5].id, '1', 'Untagged product must rank last');

// 2. Assert powers-of-two hierarchy prevents lower-tier aggregation leapfrogging
// Even with featured + newArrival (2 + 1 = 3), recommended (4) must strictly beat it
const edgeItems = [
  { id: 'lower_combo', name: 'Featured + New', featured: true, newArrival: true },
  { id: 'rec_only', name: 'Recommended Only', recommended: true },
];
const edgeSorted = sortMenuProductsByDefault(edgeItems);
assert.strictEqual(edgeSorted[0].id, 'rec_only', 'Recommended alone must rank higher than Featured + New combined');

// 3. Assert tiebreaker on identical scores preserves chronological order
const tiedItems = [
  { id: 'older_rec', name: 'Older Rec', recommended: true, createdAt: '2026-01-01' },
  { id: 'newer_rec', name: 'Newer Rec', recommended: true, createdAt: '2026-02-01' },
];
const tiedSorted = sortMenuProductsByDefault(tiedItems);
assert.strictEqual(tiedSorted[0].id, 'newer_rec', 'Newer item must win tiebreak among identical badge scores');

console.log('PASS: Menu merchandising priority sorting unit tests passed cleanly');
