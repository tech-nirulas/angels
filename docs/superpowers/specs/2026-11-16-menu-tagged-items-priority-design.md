# Menu Merchandising Tags Priority & Recommended Tag Design

**Date:** 2026-11-16  
**Status:** Approved by User  
**Scope:** `aimk_backend`, `aimk_admin`, `angels`, `nirulas`

---

## 1. Intent & Why

When browsing the online menu, customers are most likely to convert when presented immediately with the kitchen's standout items—namely **Best Sellers**, **Recommended** items, **Featured** items, and **New Arrivals**.

Previously:
1. Standout products were not prioritized on the menu; queries defaulted to sorting strictly by creation timestamp (`createdAt: desc`), meaning high-converting or celebrated items were scattered across arbitrary pages.
2. The database had flags for `bestSeller`, `featured`, and `newArrival`, but lacked a dedicated merchandising flag for **Recommended** products.

This design introduces the **`recommended`** product badge across the backend schema, admin merchandising controls, and consumer UIs, and establishes an end-to-end priority ordering so all tagged items appear at the very start of the menu under the default view.

---

## 2. Merchandising Priority Hierarchy

Under the default menu view (when no explicit sort like price or rating is selected by the user), items will be sorted with the following precedence:

1. **`bestSeller`** (`true` first) — High-volume customer favorites.
2. **`recommended`** (`true` first) — Chef / kitchen curated recommendations.
3. **`featured`** (`true` first) — Promotional or spotlighted items.
4. **`newArrival`** (`true` first) — Fresh additions to the menu.
5. **`createdAt`** (`desc`) — Chronological tiebreaker.

When a user explicitly selects a sort order (e.g., "Price: Low to High", "Highest Rated", "Name: A to Z"), the explicit criterion is strictly respected without pinning badges to the top.

---

## 3. Scope of Changes Across Repositories

### 3.1 Backend (`aimk_backend`)
- **Prisma Schema (`prisma/schema/product.prisma`):**
  Add `recommended Boolean @default(false)` to `Product` model.
- **Migration:**
  Create migration adding column `recommended` with default `false`:
  ```sql
  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "recommended" BOOLEAN NOT NULL DEFAULT false;
  ```
  Run `prisma generate` to update `@prisma/client`.
- **DTOs (`src/modules/product/dto/`):**
  - In `create-product.dto.ts` and `product-filter.dto.ts`, add `@IsOptional() @IsBoolean() recommended?: boolean;`.
- **Product Service (`src/modules/product/product.service.ts`):**
  In `findAllPaginated`, `findAllByCategoryPaginated`, and `findAllByCategorySlugPaginated`, when `sortBy` is default (`createdAt`), construct Prisma's multi-tier order:
  ```typescript
  const orderBy: Prisma.ProductOrderByWithRelationInput[] = 
    safeSortBy === 'createdAt'
      ? [
          { bestSeller: 'desc' },
          { recommended: 'desc' },
          { featured: 'desc' },
          { newArrival: 'desc' },
          { createdAt: safeSortOrder },
        ]
      : [{ [safeSortBy]: safeSortOrder }];
  ```

### 3.2 Admin Panel (`aimk_admin`)
- **Product Interfaces & Forms:**
  - Update `Product` interface to include `recommended: boolean;`.
  - In `components/ui/Product/sections/SeoSection.tsx`, add a "Recommended" checkbox with tooltip under *Badges & Merchandising Highlights*.
  - In `components/ui/Product/ProductForm.tsx`, bind `recommended` in initial values and submit serialization.

### 3.3 Consumer Web App (`angels`) & Multi-brand App (`nirulas`)
- **Interfaces (`interfaces/product.interface.ts`):**
  - Add `recommended: boolean;` to `Product`.
- **Badges (`ProductCard.tsx` & `ProductModal.tsx`):**
  - Render a crisp "Recommended" chip/badge (e.g., deep purple `#7C3AED` or theme accent) alongside "Best Seller" (amber/gold), "Featured", and "New" (blue).
- **Menu Sorting Memo (`app/menu/page.tsx`):**
  - In `useMemo` for `sortedProducts`, when `sortBy === 'default'`, maintain priority scoring:
    ```typescript
    const getScore = (p: Product) =>
      (p.bestSeller ? 4 : 0) +
      (p.recommended ? 3 : 0) +
      (p.featured ? 2 : 0) +
      (p.newArrival ? 1 : 0);
    return getScore(b) - getScore(a);
    ```

---

## 4. Verification Strategy

1. **Backend Tests:**
   - Execute query test verifying that when `sortBy` is default, items with `bestSeller: true` and `recommended: true` appear ahead of untagged products on Page 1.
   - Verify that when `sortBy=basePrice&sortOrder=asc`, products sort by base price ascending regardless of flags.
2. **Admin Form Verification:**
   - Verify the "Recommended" checkbox appears in the product edit modal under Badges & Merchandising Highlights and saves to the database.
3. **Frontend Menu Verification:**
   - Visit `/menu` in `angels` and verify tagged items cluster in order at the beginning of the list.
   - Toggle sort dropdown to "Price: Low to High" and confirm items rearrange strictly by price.
