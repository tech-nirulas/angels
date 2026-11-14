# FSSAI Triangle Symbol Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the dietary indicator badges in the Angels in My Kitchen website (`angels`) to full FSSAI 2020 compliance: green circle for Vegetarian and crisp upward-pointing equilateral triangle for Non-Vegetarian and Contains Egg.

**Architecture:** Extend `DietaryClassification` in `angels/utils/dietary.ts` with a `shape: "circle" | "triangle"` property, and upgrade `angels/components/common/DietaryBadge.tsx` to render an inline SVG equilateral triangle for non-vegetarian/egg items while preserving the solid circle for vegetarian items.

**Tech Stack:** Next.js 16 (App Router), React 19, Material-UI (MUI), SVG, TypeScript, Node.js v24.

**Spec:** file:///home/ujjwal/.gemini/antigravity/brain/ec7f02a8-314c-4041-9699-4c20307314fd/fssai_symbol_upgrade_plan.md

## Global Constraints
- Preserve documentation integrity and update `.agents/` and `LOG.md` in `angels`.
- Do NOT use Tailwind CSS for MUI components; use MUI's `sx` prop or themes.
- React 19 / Next.js 16 compatibility — use `"use client";` on interactive components.
- FSSAI 2020 symbol standards:
  - Vegetarian: Green square outline (`#16A34A`) + filled circular dot.
  - Non-Vegetarian: Red/Brown square outline (`#DC2626` / `#7F2200`) + filled equilateral triangle ($\blacktriangle$).
  - Contains Egg: Amber square outline (`#D97706`) + filled equilateral triangle ($\blacktriangle$).
- Subpixel crispness: Use inline SVG polygon (`viewBox="0 0 10 10"`) for triangle geometry to eliminate pixel aliasing on mobile and high-DPI screens.

## Review Focus
1. Sizing and alignment of triangle vs circle: Triangle must be visually balanced within the square box (15px small, 18px medium) without touching outer borders or shifting baseline.
2. SVG accessibility: Triangle SVG must have `aria-hidden="true"` since parent `Box` already provides `role="img"` and `aria-label`.
3. Shape property type safety: `classification.shape` must be strictly typed as `"circle" | "triangle"`.
4. Card and modal layout stability: Swapping circle for triangle must cause zero layout shifts in `ProductCard`, `FeaturedSection`, or `ProductModal`.
5. Null safety: Missing or unclassified dietary tags must continue to return `null` cleanly.

---

### Task 1: Add Shape Property to Dietary Classification Logic (`angels`)

**Files:**
- Modify: `angels/utils/dietary.ts:1-25` and `angels/utils/dietary.ts:90-170`
- Test: `angels/test/dietary-badge.test.ts`

**Interfaces:**
- Produces: `DietaryClassification.shape: "circle" | "triangle"` in `@/utils/dietary`.

- [ ] **Step 1: Write the failing unit tests for shape classification**

In `angels/test/dietary-badge.test.ts`, add assertions:
```typescript
const vegResult = getDietaryClassification(['vegetarian']);
assert.strictEqual(vegResult?.shape, 'circle', 'Vegetarian must have circle shape');

const nonVegResult = getDietaryClassification(['non_vegetarian']);
assert.strictEqual(nonVegResult?.shape, 'triangle', 'Non-Vegetarian must have triangle shape');

const eggResult = getDietaryClassification(['contains_egg']);
assert.strictEqual(eggResult?.shape, 'triangle', 'Contains Egg must have triangle shape');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/ujjwal/Desktop/angels_projects/angels && node --experimental-strip-types test/dietary-badge.test.ts`
Expected: FAIL (property `shape` is undefined)

- [ ] **Step 3: Update `angels/utils/dietary.ts` with shape property**

Update `DietaryClassification` interface:
```typescript
export interface DietaryClassification {
  type: DietaryType;
  shape: "circle" | "triangle";
  isVeg: boolean;
  isNonVeg: boolean;
  isEgg: boolean;
  color: string;
  label: string;
}
```
In `getDietaryClassification`:
- Non-Veg: return `shape: "triangle"`, `color: "#DC2626"`
- Contains Egg: return `shape: "triangle"`, `color: "#D97706"`
- Vegetarian: return `shape: "circle"`, `color: "#16A34A"`

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/ujjwal/Desktop/angels_projects/angels && node --experimental-strip-types test/dietary-badge.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /home/ujjwal/Desktop/angels_projects/angels
git add utils/dietary.ts test/dietary-badge.test.ts
git commit -m "feat(dietary): add FSSAI shape classification (circle for veg, triangle for non-veg/egg)"
```

---

### Task 2: Upgrade DietaryBadge UI Component to Render SVG Triangle (`angels`)

**Files:**
- Modify: `angels/components/common/DietaryBadge.tsx:50-95`
- Test: `angels/test/dietary-badge.test.ts`

**Interfaces:**
- Consumes: `DietaryClassification.shape` from `@/utils/dietary`.
- Produces: Visual FSSAI badge with SVG polygon triangle for non-veg and egg.

- [ ] **Step 1: Write test verifying DietaryBadge contains triangle SVG rendering**

In `angels/test/dietary-badge.test.ts`, add source inspection assertion:
```typescript
const badgeSource = readFileSync(
  new URL('../components/common/DietaryBadge.tsx', import.meta.url),
  'utf8',
);
assert.ok(badgeSource.includes('polygon'), 'DietaryBadge must render polygon for triangle shape');
assert.ok(badgeSource.includes('shape === "triangle"'), 'DietaryBadge must check classification shape');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/ujjwal/Desktop/angels_projects/angels && node --experimental-strip-types test/dietary-badge.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement SVG Triangle in `DietaryBadge.tsx`**

In `angels/components/common/DietaryBadge.tsx`:
```tsx
const { color, label, shape } = classification;

const innerContent =
  shape === "triangle" ? (
    <Box
      component="svg"
      viewBox="0 0 10 10"
      aria-hidden="true"
      sx={{
        width: innerDimension,
        height: innerDimension,
        display: "block",
        flexShrink: 0,
      }}
    >
      <polygon points="5,1 9.2,8.8 0.8,8.8" fill={color} />
    </Box>
  ) : (
    <Box
      component="span"
      sx={{
        width: innerDimension,
        height: innerDimension,
        borderRadius: "50%",
        backgroundColor: color,
        flexShrink: 0,
      }}
    />
  );
```
Render `innerContent` inside the outer square.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/ujjwal/Desktop/angels_projects/angels && node --experimental-strip-types test/dietary-badge.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /home/ujjwal/Desktop/angels_projects/angels
git add components/common/DietaryBadge.tsx test/dietary-badge.test.ts
git commit -m "feat(ui): render FSSAI upward triangle for non-vegetarian and egg badges"
```

---

### Task 3: Verify All Test Suites, Builds, and Update Documentation (`angels`)

**Files:**
- Modify: `angels/LOG.md`
- Modify: `angels/.agents/architecture.md`

- [ ] **Step 1: Run all test suites across the project**

```bash
cd /home/ujjwal/Desktop/angels_projects/angels
node --experimental-strip-types test/dietary-badge.test.ts
node --experimental-strip-types test/product-card-dietary.test.ts
node --experimental-strip-types test/product-modal-dietary.test.ts
```
Expected: All 3 suites PASS.

- [ ] **Step 2: Run TypeScript and Next.js production build**

```bash
cd /home/ujjwal/Desktop/angels_projects/angels
npx tsc --noEmit
npm run build
```
Expected: 0 errors, build succeeds.

- [ ] **Step 3: Update `LOG.md` and `.agents/architecture.md`**

Document FSSAI 2020 triangle shape upgrade in `angels/LOG.md` and `angels/.agents/architecture.md`.

- [ ] **Step 4: Commit**

```bash
cd /home/ujjwal/Desktop/angels_projects/angels
git add LOG.md .agents/architecture.md docs/superpowers/plans/2026-11-14-fssai-triangle-symbol.md
git commit -m "docs: record FSSAI triangle symbol upgrade in LOG.md and architecture.md"
```
