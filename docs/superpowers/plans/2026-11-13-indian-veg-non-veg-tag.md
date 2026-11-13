# Indian Veg & Non-Veg Tag Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement authoritative Indian edible product dietary badges (green square with circle for Vegetarian and red/brown square with circle for Non-Vegetarian/Contains Egg) across the Angels in My Kitchen consumer website (`angels`), backed by schema and admin updates in `aimk_backend` and `aimk_admin`.

**Architecture:** Extend the backend `DietaryStatus` enum to include `non_vegetarian` and `contains_egg`, expose these options in the admin product form, backfill existing products, and implement an accessible `DietaryBadge` component in `angels` rendered across `ProductCard`, `FeaturedProductCard`, and `ProductModal`.

**Tech Stack:** Next.js 16 (App Router), React 19, Material-UI (MUI), PostgreSQL, Prisma ORM, NestJS, Node.js v24.

**Spec:** file:///home/ujjwal/.gemini/antigravity/brain/ec7f02a8-314c-4041-9699-4c20307314fd/veg_non_veg_tag_plan.md

## Global Constraints
- Preserve documentation integrity and update `.agents/` and `LOG.md` in all touched workspaces (`angels`, `aimk_backend`, `aimk_admin`).
- Do NOT use Tailwind CSS for MUI components; use MUI's `sx` prop or themes.
- React 19 / Next.js 16 compatibility — use `"use client";` on interactive components.
- FSSAI symbol compliance: Green (`#16A34A`) for Vegetarian, Red/Brown (`#DC2626` / `#7F2200`) for Non-Vegetarian, Amber/Brown (`#D97706` / `#7F2200`) for Contains Egg.
- Strict data truthfulness: Never fabricate or guess dietary status without authoritative product data or safe fallbacks.

## Review Focus
1. Product with empty or missing `dietaryTags` array: `DietaryBadge` must safely return `null` (or unobtrusive unclassified state) rather than crash or falsely label as veg/non-veg.
2. Case sensitivity / formatting differences in tags (e.g. `NON_VEGETARIAN`, `non-vegetarian`, `nonveg`, `contains_egg`): normalizer must handle all variants robustly.
3. Bakery cakes with egg vs meat products: egg items must clearly display "Contains Egg" in tooltip / label rather than generic "Non-Vegetarian" meat label.
4. Screen readers and keyboard navigation: `DietaryBadge` must have `role="img"` and meaningful `aria-label` ("Vegetarian", "Non-Vegetarian", "Contains Egg").
5. Layout shift on `ProductCard`: badge must be inline with title with fixed width/height so cards in the grid remain perfectly aligned.

---

### Task 1: Extend Backend DietaryStatus Enum & DTOs (`aimk_backend`)

**Files:**
- Modify: `aimk_backend/prisma/schema/dietary-status.prisma:1-11`
- Test: `aimk_backend/test/dietary-status.spec.ts`

**Interfaces:**
- Produces: `DietaryStatus.non_vegetarian`, `DietaryStatus.contains_egg` in `@prisma/client`.

- [ ] **Step 1: Write the test verifying DietaryStatus enum includes `non_vegetarian` and `contains_egg`**

Create `aimk_backend/test/dietary-status.spec.ts`:
```typescript
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

const schema = readFileSync(
  new URL('../prisma/schema/dietary-status.prisma', import.meta.url),
  'utf8',
);

assert.ok(schema.includes('non_vegetarian'), 'DietaryStatus must include non_vegetarian');
assert.ok(schema.includes('contains_egg'), 'DietaryStatus must include contains_egg');
console.log('PASS: DietaryStatus enum test');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types aimk_backend/test/dietary-status.spec.ts`
Expected: FAIL with assertion error.

- [ ] **Step 3: Update `dietary-status.prisma` and generate Prisma client**

Update `aimk_backend/prisma/schema/dietary-status.prisma`:
```prisma
enum DietaryStatus {
  vegetarian
  vegan
  gluten_free
  dairy_free
  nut_free
  sugar_free
  egg_free
  halal
  kosher
  non_vegetarian
  contains_egg
}
```
Run Prisma generate: `cd /home/ujjwal/Desktop/angels_projects/aimk_backend && npx prisma generate`

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types aimk_backend/test/dietary-status.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /home/ujjwal/Desktop/angels_projects/aimk_backend
git add prisma/schema/dietary-status.prisma test/dietary-status.spec.ts
git commit -m "feat(schema): add non_vegetarian and contains_egg to DietaryStatus enum"
```

---

### Task 2: Expose Non-Veg & Egg Options in Admin Form (`aimk_admin`)

**Files:**
- Modify: `aimk_admin/components/ui/Product/sections/DietarySection.tsx:15-26`
- Test: `aimk_admin/test/dietary-options.spec.ts`

**Interfaces:**
- Consumes: Updated enum values `non_vegetarian` and `contains_egg`.
- Produces: Admin UI allowing toggling of `non_vegetarian` and `contains_egg`.

- [ ] **Step 1: Write test verifying admin DIETARY_OPTIONS has non_vegetarian and contains_egg**

Create `aimk_admin/test/dietary-options.spec.ts`:
```typescript
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

const content = readFileSync(
  new URL('../components/ui/Product/sections/DietarySection.tsx', import.meta.url),
  'utf8',
);

assert.ok(content.includes('"non_vegetarian"'), 'DIETARY_OPTIONS must include non_vegetarian');
assert.ok(content.includes('"contains_egg"'), 'DIETARY_OPTIONS must include contains_egg');
console.log('PASS: Admin dietary options test');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types aimk_admin/test/dietary-options.spec.ts`
Expected: FAIL

- [ ] **Step 3: Update `DietarySection.tsx` with new options and colored badges**

Update `DIETARY_OPTIONS` in `aimk_admin/components/ui/Product/sections/DietarySection.tsx`:
Add `"non_vegetarian"` and `"contains_egg"`.
Ensure chip colors reflect dietary status:
- `"vegetarian"` / `"vegan"` / `"egg_free"`: `success`
- `"non_vegetarian"`: `error`
- `"contains_egg"`: `warning`

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types aimk_admin/test/dietary-options.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /home/ujjwal/Desktop/angels_projects/aimk_admin
git add components/ui/Product/sections/DietarySection.tsx test/dietary-options.spec.ts
git commit -m "feat(admin): add non-veg and contains-egg dietary tags in product editor"
```

---

### Task 3: Data Backfill for Existing Products (`aimk_backend`)

**Files:**
- Create: `aimk_backend/prisma/backfill-dietary-tags.ts`
- Test: `aimk_backend/test/backfill-dietary-tags.spec.ts`

**Interfaces:**
- Produces: Correct `dietaryTags` on database products (chicken items &rarr; `non_vegetarian`, egg items &rarr; `contains_egg`, pastries & breads &rarr; `vegetarian`).

- [ ] **Step 1: Write test checking known products mapping**

Create `aimk_backend/test/backfill-dietary-tags.spec.ts` asserting mapping logic for:
- `chicken-sausage-roll` &rarr; `non_vegetarian`
- `chicken-keema-sandwich` &rarr; `non_vegetarian`
- `creamy-chicken-puff-patty` &rarr; `non_vegetarian`
- `melt-in-mouth-chocolate-eclairs` &rarr; `contains_egg`
- `french-baguette` &rarr; `vegetarian`

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types aimk_backend/test/backfill-dietary-tags.spec.ts`
Expected: FAIL

- [ ] **Step 3: Implement `backfill-dietary-tags.ts` mapping script**

Create `aimk_backend/prisma/backfill-dietary-tags.ts` with explicit SKU / slug mapping to update Prisma product records.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types aimk_backend/test/backfill-dietary-tags.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /home/ujjwal/Desktop/angels_projects/aimk_backend
git add prisma/backfill-dietary-tags.ts test/backfill-dietary-tags.spec.ts
git commit -m "feat(data): add backfill script for product dietary tags"
```

---

### Task 4: Create Reusable DietaryBadge Component in Angels (`angels`)

**Files:**
- Create: `angels/components/common/DietaryBadge.tsx`
- Test: `angels/test/dietary-badge.test.ts`

**Interfaces:**
- Produces: `DietaryBadge({ dietaryTags, allergenInfo, size, showTooltip, className })`.
- Standard FSSAI badges:
  - Green border `#16A34A` + green circle for Vegetarian.
  - Red border `#DC2626` + red circle for Non-Vegetarian.
  - Amber/Brown border `#D97706` + circle for Contains Egg.

- [ ] **Step 1: Write the test suite for DietaryBadge**

Create `angels/test/dietary-badge.test.ts`:
```typescript
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

const content = readFileSync(
  new URL('../components/common/DietaryBadge.tsx', import.meta.url),
  'utf8',
);

assert.ok(content.includes('role="img"'), 'Must have role=img for accessibility');
assert.ok(content.includes('#16A34A'), 'Must use green for veg');
assert.ok(content.includes('#DC2626'), 'Must use red for non-veg');
assert.ok(content.includes('vegetarian'), 'Must recognize vegetarian tag');
assert.ok(content.includes('non_vegetarian'), 'Must recognize non_vegetarian tag');
assert.ok(content.includes('contains_egg'), 'Must recognize contains_egg tag');
console.log('PASS: DietaryBadge component tests');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/ujjwal/Desktop/angels_projects/angels && node --experimental-strip-types test/dietary-badge.test.ts`
Expected: FAIL (file does not exist)

- [ ] **Step 3: Implement `DietaryBadge.tsx` in `angels/components/common/`**

Create `angels/components/common/DietaryBadge.tsx`:
- Accepts `dietaryTags?: string[] | null`, `allergenInfo?: any`, `size?: "small" | "medium"`, `showTooltip?: boolean`, `className?: string`.
- Normalizes tags.
- Renders outer square (`15px` small, `18px` medium) with `1.5px` border and inner circle (`7px` small, `8px` medium).
- Colors:
  - Veg: Green `#16A34A`, label: "Vegetarian"
  - Non-Veg: Red `#DC2626`, label: "Non-Vegetarian"
  - Contains Egg: Amber `#D97706`, label: "Contains Egg"
- Tooltip wrapper from MUI `Tooltip`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types test/dietary-badge.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /home/ujjwal/Desktop/angels_projects/angels
git add components/common/DietaryBadge.tsx test/dietary-badge.test.ts
git commit -m "feat(ui): add standard Indian DietaryBadge component"
```

---

### Task 5: Integrate DietaryBadge in ProductCard & FeaturedSection (`angels`)

**Files:**
- Modify: `angels/components/ui/ProductCard.tsx:219-235`
- Modify: `angels/components/sections/FeaturedSection.tsx:197-212`
- Test: `angels/test/product-card-dietary.test.ts`

**Interfaces:**
- Consumes: `DietaryBadge` from `@/components/common/DietaryBadge`.

- [ ] **Step 1: Write test asserting DietaryBadge is mounted in ProductCard and FeaturedSection**

Create `angels/test/product-card-dietary.test.ts`:
```typescript
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

const card = readFileSync(new URL('../components/ui/ProductCard.tsx', import.meta.url), 'utf8');
const featured = readFileSync(new URL('../components/sections/FeaturedSection.tsx', import.meta.url), 'utf8');

assert.ok(card.includes('DietaryBadge'), 'ProductCard must import and render DietaryBadge');
assert.ok(featured.includes('DietaryBadge'), 'FeaturedSection must import and render DietaryBadge');
console.log('PASS: ProductCard dietary badge integration');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types test/product-card-dietary.test.ts`
Expected: FAIL

- [ ] **Step 3: Mount DietaryBadge in `ProductCard.tsx` and `FeaturedSection.tsx`**

In `ProductCard.tsx` and `FeaturedSection.tsx`:
Import `DietaryBadge` and wrap the product title in a flex row:
```tsx
<Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75, mb: 0.5 }}>
  <DietaryBadge dietaryTags={product.dietaryTags} allergenInfo={product.allergenInfo} size="small" />
  <Typography variant="h6" ...>{product.name}</Typography>
</Box>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types test/product-card-dietary.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /home/ujjwal/Desktop/angels_projects/angels
git add components/ui/ProductCard.tsx components/sections/FeaturedSection.tsx test/product-card-dietary.test.ts
git commit -m "feat(ui): mount DietaryBadge on product cards and featured section"
```

---

### Task 6: Integrate DietaryBadge in ProductModal Quick View (`angels`)

**Files:**
- Modify: `angels/components/ui/ProductModal.tsx:465-485`
- Test: `angels/test/product-modal-dietary.test.ts`

**Interfaces:**
- Consumes: `DietaryBadge` from `@/components/common/DietaryBadge`.

- [ ] **Step 1: Write test asserting DietaryBadge is used in ProductModal**

Create `angels/test/product-modal-dietary.test.ts`:
```typescript
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

const modal = readFileSync(new URL('../components/ui/ProductModal.tsx', import.meta.url), 'utf8');
assert.ok(modal.includes('DietaryBadge'), 'ProductModal must render DietaryBadge');
console.log('PASS: ProductModal dietary badge integration');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types test/product-modal-dietary.test.ts`
Expected: FAIL

- [ ] **Step 3: Update `ProductModal.tsx` to display DietaryBadge alongside title and dietary section**

In `angels/components/ui/ProductModal.tsx`:
Replace the generic text chip with the official `DietaryBadge` and an explicit text label ("100% Vegetarian", "Non-Vegetarian", or "Contains Egg").

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types test/product-modal-dietary.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /home/ujjwal/Desktop/angels_projects/angels
git add components/ui/ProductModal.tsx test/product-modal-dietary.test.ts
git commit -m "feat(ui): enhance ProductModal with DietaryBadge and dietary indicators"
```

---

### Task 7: Update Documentation & Activity Logs (`LOG.md`)

**Files:**
- Modify: `angels/LOG.md`
- Modify: `aimk_backend/LOG.md`
- Modify: `aimk_admin/LOG.md`

- [ ] **Step 1: Append changes and rationale to `LOG.md` in all 3 workspaces**
- [ ] **Step 2: Commit documentation updates**

```bash
cd /home/ujjwal/Desktop/angels_projects/angels && git add LOG.md && git commit -m "docs: record dietary badge implementation in LOG.md"
cd /home/ujjwal/Desktop/angels_projects/aimk_backend && git add LOG.md && git commit -m "docs: record dietary status enum changes in LOG.md"
cd /home/ujjwal/Desktop/angels_projects/aimk_admin && git add LOG.md && git commit -m "docs: record dietary options in LOG.md"
```
