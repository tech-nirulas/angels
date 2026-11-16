# Menu Merchandising Tags Priority & Recommended Tag Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce the `recommended` merchandising tag to products and ensure all tagged items (Best Seller, Recommended, Featured, New Arrival) prioritize to the very beginning of the menu under the default view across pagination boundaries, while strictly honoring explicit user sort criteria (Price, Rating, Name).

**Architecture:** Add a `recommended Boolean @default(false)` column to PostgreSQL/Prisma in `aimk_backend`; configure `ProductService` pagination methods (`findAllPaginated`, `findAllByCategoryPaginated`, `findAllByCategorySlugPaginated`) to apply multi-column ordering when `sortBy === 'createdAt'`; expose the "Recommended" toggle in `aimk_admin`'s product form; and render a "Recommended" badge while aligning client-side default sort memoization in `angels` and `nirulas`.

**Tech Stack:** NestJS 11, Prisma 7, PostgreSQL, Next.js 16 (App Router), React 19, Material-UI (MUI), TypeScript, Jest.

**Spec:** [2026-11-16-menu-tagged-items-priority-design.md](file:///home/ujjwal/Desktop/angels_projects/angels/docs/superpowers/specs/2026-11-16-menu-tagged-items-priority-design.md)

---

## Global Constraints
- Preserve documentation integrity and update `.agents/` and `LOG.md` across all touched repositories (`aimk_backend`, `aimk_admin`, `angels`).
- Follow step-by-step incremental execution: 1 or 2 small steps at a time with testable verification.
- Material-UI styling rules: Do NOT use Tailwind CSS for MUI components; use MUI's `sx` prop or themes.
- React 19 / Next.js 16 App Router conventions: maintain `"use client";` directives where state/hooks are present.
- Explicit sorts must NOT be overridden: when a customer selects a sort like "Price: Low to High", products must be ordered strictly by that dimension.
- Database boolean ordering: PostgreSQL orders `true` before `false` in `desc` direction (`bestSeller: 'desc'`).

## Review Focus
1. **Multi-page Pagination Integrity:** Best sellers and recommended products located beyond the first 12 items in the database must appear on Page 1 when viewing the menu under default sorting.
2. **Sort Filter Isolation:** Selecting "Price: Low to High" or "Highest Rated" must sort purely by price or rating; badges must not disrupt the explicit sorting.
3. **Category Filtering Compatibility:** Priority ordering must work consistently whether viewing "All Items" or filtering by a specific category (e.g. Cakes, Pastries).
4. **Admin Mutation Persistence:** Creating or updating a product with `recommended: true` in `aimk_admin` must save properly and reflect immediately in backend responses.
5. **Zero Visual Layout Regressions:** Adding the "Recommended" badge chip must not distort product card aspect ratios or overlap existing badges (e.g. discount, dietary indicators).

---

### Task 1: Add `recommended` Field to Database & Prisma Schema (`aimk_backend`)

**Files:**
- Modify: `aimk_backend/prisma/schema/product.prisma:45-55`
- Create: `aimk_backend/prisma/migrations/20261116120000_add_product_recommended/migration.sql`

**Interfaces:**
- Produces: `recommended: Boolean` on `Product` model in `@prisma/client`.

- [x] **Step 1: Update Prisma schema with `recommended` column**
- [x] **Step 2: Create SQL migration**
- [x] **Step 3: Run migration and generate Prisma client**
- [x] **Step 4: Update activity log**

---

### Task 2: Update Product DTOs & Priority Query Ordering (`aimk_backend`)

**Files:**
- Modify: `aimk_backend/src/modules/product/dto/create-product.dto.ts`
- Modify: `aimk_backend/src/modules/product/dto/product-filter.dto.ts`
- Modify: `aimk_backend/src/modules/product/product.service.ts`
- Create: `aimk_backend/src/modules/product/product.service.spec.ts`

**Interfaces:**
- Consumes: `ProductFilterDto.recommended`, `CreateProductDto.recommended`
- Behavior: When `safeSortBy === 'createdAt'`, orders by `bestSeller: desc`, `recommended: desc`, `featured: desc`, `newArrival: desc`, `createdAt: safeSortOrder`.

- [x] **Step 1: Write unit test for priority ordering in `product.service.spec.ts`**
- [x] **Step 2: Run test to confirm expected behavior/failure**
- [x] **Step 3: Update `create-product.dto.ts` and `product-filter.dto.ts`**
- [x] **Step 4: Update `ProductService` queries**
- [x] **Step 5: Run unit tests and verify they pass**
- [x] **Step 6: Update backend activity log**

---

### Task 3: Add "Recommended" Control to Admin Panel (`aimk_admin`)

**Files:**
- Modify: `aimk_admin/interfaces/product.interface.ts`
- Modify: `aimk_admin/components/ui/Product/sections/SeoSection.tsx`
- Modify: `aimk_admin/components/ui/Product/ProductForm.tsx`

**Interfaces:**
- Produces: `Product.recommended: boolean` and `CreateProductPayload.recommended?: boolean`
- UI: "Recommended" checkbox in `SeoSection` alongside Featured, Best Seller, New Arrival.

- [x] **Step 1: Update `aimk_admin/interfaces/product.interface.ts`**
- [x] **Step 2: Add "Recommended" checkbox in `SeoSection.tsx`**
- [x] **Step 3: Bind `recommended` in `ProductForm.tsx`**
- [x] **Step 4: Verify Admin build & type checking**
- [x] **Step 5: Update admin activity log**

---

### Task 4: Add "Recommended" Badge and Priority Menu Sorting to Consumer Apps (`angels` & `nirulas`)

**Files:**
- Modify: `angels/interfaces/product.interface.ts`
- Modify: `angels/components/ui/ProductCard.tsx`
- Modify: `angels/components/ui/ProductModal.tsx`
- Modify: `angels/app/menu/page.tsx`
- Modify: `nirulas/interfaces/product.interface.ts` (if applicable) & `nirulas/app/menu/page.tsx`
- Create: `angels/test/menu-sorting.test.ts`

**Interfaces:**
- Produces: Visual "Recommended" Chip in `ProductCard` and `ProductModal`
- Behavior: When `sortBy === 'default'`, products sort with score:
  `bestSeller` (4) > `recommended` (3) > `featured` (2) > `newArrival` (1).

- [x] **Step 1: Write unit test in `angels/test/menu-sorting.test.ts`**
- [x] **Step 2: Run test and observe output**
- [x] **Step 3: Update `angels/interfaces/product.interface.ts`**
- [x] **Step 4: Add "Recommended" Chip in `ProductCard.tsx`**
- [x] **Step 5: Add "Recommended" BadgeChip in `ProductModal.tsx`**
- [x] **Step 6: Update `sortedProducts` in `angels/app/menu/page.tsx`**
- [x] **Step 7: Update `nirulas/app/menu/page.tsx` and `nirulas/types/product.ts`**
- [x] **Step 8: Run unit test and verify it passes**
- [x] **Step 9: Update activity logs**

---

### Task 5: End-to-End Verification & Documentation Sync

**Files:**
- Modify: `aimk_backend/.agents/architecture.md`
- Modify: `aimk_admin/.agents/architecture.md`
- Modify: `angels/.agents/architecture.md`

- [x] **Step 1: Run type checking and linters across modified projects**
  - In `aimk_backend`: `npm run build` (0 errors)
  - In `aimk_admin`: `npx tsc --noEmit` (0 errors on modified files)
  - In `angels`: `npx tsc --noEmit` (0 errors)
  - In `nirulas`: `npx tsc --noEmit` (0 errors)

- [x] **Step 2: Verification of Sorting Semantics & Edge Cases**
  - Executed tests in `aimk_backend/src/modules/product/product.service.spec.ts` (5/5 passing).
  - Executed tests in `angels/test/menu-sorting.test.ts` (passing).

- [x] **Step 3: Sync documentation in `.agents/`**
  - Updated `architecture.md` across `aimk_backend`, `aimk_admin`, and `angels`.
