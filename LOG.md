# Angels Consumer Web App — Development Log

## [2026-11-14] Bugfix: Real-Time Cart Subtotal & Total Reactivity & Decoupled Variant Pricing
- **Real-Time Cart Reactivity (`app/cart/page.tsx`)**:
  - Fixed frozen cart totals: Added `cartSignature` to `previewOrder` effect dependency array with a 200ms debounce.
  - Added optimistic reactivity: Cached `serverTotals` is invalidated immediately on `cartSignature` change so `estimatedTotal` updates at 0ms latency when quantity is increased or decreased.
  - Keyed `cartSignature` by `i.id || i.configurationHash || i.productId` to prevent signature collisions across multiple variants of the same product.
- **Decoupled Variant Pricing from Base Product Discount (`app/cart/page.tsx` & `features/cart/cartSlice.ts`)**:
  - Fixed bug where base product's fixed `discountedPrice` (e.g. ₹400 on ₹500 base product) clamped variant prices (e.g. ₹1800 2kg cake clamped down to ₹400).
  - Refactored `effectivePrice` and `cartSlice` (`loadGuestCart`, `addToGuestCart`, `updateGuestQuantity`) to calculate discount percentages relative to unit price when variants are present, preserving full variant pricing.
- **Testing & Verification**:
  - Added test case in `test/cart-slice-variants.test.ts` verifying that variants maintain independent price scaling and do not clamp to base discounts.
  - All 7 test suites pass cleanly (`cart-configuration-hash.test.ts`, `cart-slice-variants.test.ts`, `cart-promo-slice.test.ts`, `cart-revalidation-helper.test.ts`, `pricing.test.ts`, `product-card-dietary.test.ts`, `product-modal-dietary.test.ts`).
  - Next.js production build (`npm run build`) succeeded with 17/17 routes generated cleanly.

## [2026-11-14] Feature: Variants, Modifiers & Add-ons Integration (Phase 4: Cart Page & Order History Displays)
- **Cart Page Line Item Customization Breakdown (`app/cart/page.tsx`)**:
  - Uniquely keyed line items using `item.id || item.configurationHash || item.productId`, eliminating duplicate key collisions for multiple variants of the same product.
  - Rendered variant size badge (e.g. `500g`, `1 kg`) directly alongside the product name.
  - Rendered chip tags for each selected modifier/add-on with tax-inclusive surcharge pricing (e.g. `+ Eggless (+₹50)`, `+ Sparkler Candle (+₹40)`).
  - Updated `handleUpdateQuantity` and `handleRemove` to pass line identifier (`id || configurationHash`), enabling independent quantity changes and removals for different sizes/customizations of the same product.
- **Order Details Customization Snapshot (`app/orders/[id]/page.tsx`)**:
  - Binds to backend order item snapshot `item.customizations`: renders variant name alongside product title and chip badges for selected add-on modifiers.
- **Documentation & Task Completion**:
  - Updated `.agents/architecture.md` with complete architectural documentation of the Variants & Modifiers subsystem.
  - Production build verification: `npm run build` completed successfully (17/17 pages generated cleanly).
  - All test suites (`cart-configuration-hash.test.ts`, `cart-slice-variants.test.ts`, `cart-promo-slice.test.ts`, `cart-revalidation-helper.test.ts`, `dietary-badge.test.ts`, `pricing.test.ts`, `product-card-dietary.test.ts`, `product-modal-dietary.test.ts`) PASS.

## [2026-11-14] Feature: Variants, Modifiers & Add-ons Integration (Phase 3: Customization UI & Card Interaction)
- **Product Details & Customization Modal (`components/ui/ProductModal.tsx`)**:
  - Implemented interactive **Size / Variant Selector**: renders responsive pill cards displaying variant size/weight names (e.g. 500g, 1 kg) with real-time tax-inclusive pricing, active state highlights, and out-of-stock indicators.
  - Implemented **Modifier Groups Selector**: renders single-choice groups (`maxSelections === 1`) as radio controls and multi-choice groups (`maxSelections > 1`) as checkboxes, displaying add-on price surcharges (`+₹50` or `Free`).
  - Added real-time pricing computation: dynamically sums `(Variant Base Price + Modifiers Surcharge)` with GST calculations.
  - Added mandatory group validation: blocks addition and prompts user (`Select [Group Name]`) if required modifier minimums are unsatisfied.
  - Updated Add-to-Cart payload to pass `variantId`, `modifierOptionIds`, and snapshots to backend and guest Redux store.
  - Dynamic weight fact update: binds to `activeVariant.weight` when a size variant is chosen.
- **Catalog Card & CTA Interaction (`components/ui/ProductCard.tsx` & `components/ui/AddToCart.tsx`)**:
  - Products with variants dynamically compute and render starting price as `"From " + formatCurrency(minPrice)`.
  - For products with variants or modifier groups, primary card button renders **"CUSTOMISE"** with tune icon. Tapping "CUSTOMISE" opens the customization modal directly.
  - Preserved direct quick-add stepper for simple standalone products without variants or required choices.
- **Testing & Verification**:
  - Verified `test/product-card-dietary.test.ts` and `test/product-modal-dietary.test.ts` (PASS).
  - Verified `tsc --noEmit` compiles with 0 errors.

## [2026-11-14] Feature: Variants, Modifiers & Add-ons Integration (Phase 2: RTK Endpoints & Cart Redux Slice)
- **Cart API Endpoints (`features/cart/cartEndpoints.ts`)**:
  - Expanded `AddToCartDto` with optional `variantId`, `modifierOptionIds`, and `itemNotes`.
  - Updated `updateCartQuantity` and `removeFromCart` to accept `itemIdentifier` (supporting `cartItemId`, `configurationHash`, or `productId`).
  - Updated `MergeCartDto` to accept full line metadata (`variantId`, `modifierOptionIds`, `selectedVariant`, `selectedModifiers`, `itemNotes`, `snapshotPrice`).
  - Updated `app/cart/page.tsx` and `app/verify-otp/page.tsx` merge triggers to pass the enriched guest item metadata to the server.
- **Cart Redux Slice (`features/cart/cartSlice.ts`)**:
  - Added `SelectedVariantSnapshot` and `SelectedModifierSnapshot` types.
  - Upgraded `CartItem` model to include `variantId`, `configurationHash`, `selectedVariant`, `selectedModifiers`, and `itemNotes`.
  - Upgraded `addToGuestCart` to hash the line configuration via `computeClientConfigHash`. Same products with different variants or modifier sets now cleanly instantiate separate line items. Adding identical configurations increments existing line quantity.
  - Upgraded `updateGuestQuantity` and `removeFromGuestCart` to look up items by `id || configurationHash || productId`.
  - Upgraded `loadGuestCart` and `saveGuestCart` in `localStorage` to preserve all variant and customization attributes with backward-compatibility for legacy guest items.
- **Testing & Verification**:
  - Created `test/cart-slice-variants.test.ts` testing multi-variant line separation, modifier price additions, identical configuration quantity increments, and hash-based updates and deletions (all PASS).
  - Verified `test/cart-promo-slice.test.ts` passes cleanly.
  - Verified `tsc --noEmit` compiles with 0 errors.

## [2026-11-14] Feature: Variants, Modifiers & Add-ons Integration (Phase 1: Domain Models & Hashing)
- **Domain Interfaces (`interfaces/product.interface.ts`)**:
  - Added TypeScript models for `ProductVariant` (size, price, compareAtPrice, weight, displayOrder, stock status).
  - Added TypeScript models for `ModifierOption`, `ModifierGroup`, and `ProductModifierGroup`.
  - Extended `Product` interface to support optional `hasVariants`, `variants`, and `modifierGroups`.
- **Client Configuration Hashing (`utils/cartHash.ts`)**:
  - Implemented standalone RFC 1321 pure JavaScript `md5` algorithm with zero external dependencies.
  - Implemented `computeClientConfigHash(productId, variantId, modifierOptionIds)` identically matching `aimk_backend`'s `CartService.computeConfigurationHash`.
  - Produces byte-for-byte identical 32-character hex MD5 hashes to Node backend crypto.
  - Gracefully returns bare `productId` for simple items without variants/options.
- **Unit Testing (`test/cart-configuration-hash.test.ts`)**:
  - Created test suite asserting identical hash outputs to `crypto.createHash('md5')`, sorting stability, and fallback to `productId`.
  - Verified with Node test runner: all assertions PASS.

## [2026-11-14] Feature: Upgrade Dietary Indicator Badges to Full FSSAI 2020 Standard (SVG Upward Triangle)
- **FSSAI Compliance Upgrade**:
  - Aligned dietary symbols with Food Safety and Standards Authority of India (FSSAI) Labelling and Display Regulations 2020.
  - **Vegetarian**: Green square border (`#16A34A`) with solid green circular dot.
  - **Non-Vegetarian**: Red square border (`#DC2626`) with solid red upward-pointing equilateral triangle (`▲`).
  - **Contains Egg**: Amber square border (`#D97706`) with solid amber upward-pointing equilateral triangle (`▲`).
- **Domain Logic Classification (`utils/dietary.ts`)**:
  - Extended `DietaryClassification` interface with `shape: "circle" | "triangle"`.
  - Configured `getDietaryClassification` to assign `shape: "circle"` to vegetarian/vegan/eggless products, and `shape: "triangle"` to non-vegetarian and contains-egg products.
- **UI Component Rendering (`components/common/DietaryBadge.tsx`)**:
  - Upgraded inner symbol rendering: renders crisp inline SVG polygon `<polygon points="5,1 9.2,8.8 0.8,8.8" fill={color} />` with `aria-hidden="true"` when `shape === "triangle"`.
  - Preserves 50% border-radius circular dot for `shape === "circle"`.
  - Retains zero layout shift across `ProductCard`, `FeaturedSection`, and `ProductModal`.
- **Testing & Verification**:
  - Updated `test/dietary-badge.test.ts` with shape assertions for all dietary classifications and verified SVG polygon markup in source.
  - Ran all project test suites: `test/dietary-badge.test.ts`, `test/product-card-dietary.test.ts`, and `test/product-modal-dietary.test.ts` (all PASS).
  - Verified `npx tsc --noEmit` (0 errors) and Next.js production build `npm run build` (success).


## [2026-11-13] Fix: Cart Coupon Auto-Revalidation & Stale Promo Invalidation on Cart Mutation
- **Root Cause Fixed**:
  - Previously, `appliedPromo` stored a static discount amount in Redux (`cartSlice.ts`) when applied on high-value carts.
  - Removing items, clearing the cart, or changing quantities did not re-evaluate or revoke the coupon. This caused lower-value carts (e.g. ₹130.20) or empty carts with newly added cheap items to inherit the old coupon deduction (e.g. -₹349.13), resulting in confusing ₹0.00 displays.
- **Redux Slice Hardening (`features/cart/cartSlice.ts`)**:
  - Enhanced `clearGuestCart` to immediately reset `appliedPromo = null`.
  - Added `updatePromoDiscount` action to update re-evaluated discount amounts dynamically.
- **Pure Revalidation Logic (`utils/cartPromo.ts`)**:
  - Implemented `decidePromoRevalidation` to evaluate keep/update/remove decisions deterministically based on cart items count and validation responses.
  - Implemented `calculateSafePromoSaving` to clamp promo savings to the cart subtotal, preventing negative or ₹0 totals before revalidation finishes.
- **Reactive Revalidation on Cart Mutation (`app/cart/page.tsx`)**:
  - Added reactive effect that monitors `cartSignature` (`productId:quantity:currentPrice`) and active promo code.
  - If the cart is emptied: automatically purges the coupon.
  - When cart items change: calls `/offer/validate-code` with current cart items. If the cart drops below `minOrderValue` (e.g. ₹599) or is ineligible, automatically removes the coupon and alerts the customer via snackbar toast. If eligible, updates the discount to the newly recalculated amount.
  - Hardened `handleClearCart` to drop `appliedPromo`.
  - Added promo error inspection in `previewOrder` response to clear ineligible coupons if flagged by the server.
- **Testing & Verification**:
  - Added unit tests in `test/cart-promo-slice.test.ts` verifying `clearGuestCart` and `updatePromoDiscount`.
  - Added unit tests in `test/cart-revalidation-helper.test.ts` verifying decision engine and safe clamped savings.
  - Verified `tsc --noEmit` compiles with 0 errors.
  - All test suites in `angels` pass cleanly.


## [2026-11-13] Feature: Whole-Rupee Rounded Tax-Inclusive Pricing & Clean Formatting
- **Pricing Logic (`utils/pricing.ts`)**:
  - Synchronized `taxInclusive(preTax, gstRate)` to round to nearest whole rupee (`Math.round(price * (1 + rate / 100))`) in lockstep with `aimk_backend/src/modules/order/pricing.helper.ts`.
  - Added reusable `formatCurrency(amount)` helper that displays whole numbers cleanly (e.g. `₹90`) and retains decimals only when fractional paise exist.
- **Component Formatting**:
  - Updated `ProductCard.tsx`: product cards now format prices cleanly as `₹90` without unnecessary `.00` decimals.
  - Updated `ProductModal.tsx`: modal quick view and struck-through prices render whole-rupee amounts cleanly.
  - Updated `FeaturedSection.tsx`: featured grid items render whole numbers cleanly.
  - Updated `cart/page.tsx`: line items, subtotals, promo savings, and final pay button format as clean whole rupees.
  - Updated `orders/page.tsx` & `orders/[id]/page.tsx`: order history cards and order details display whole-rupee totals and line items.
- **Testing & Verification**:
  - Added unit test `test/pricing.test.ts` asserting `taxInclusive(86, 5) === 90`, `taxInclusive(86.3, 5) === 91`, and `formatCurrency` behavior.
  - TDD RED -> GREEN cycle verified with node test runner.

## [2026-11-13] Fix: Extract `utils/dietary.ts`, Refine Allergen Parsing & Optical Alignments
- **Extract Pure Utility (`utils/dietary.ts`)**:
  - Extracted `getDietaryClassification`, `DietaryClassification`, and `PRIMARY_DIETARY_TAGS` to standalone pure utility module.
  - Refined allergen parsing: correctly checks `contains` array and boolean flags while ignoring `mayContain` trace warnings.
  - Safeguarded explicit vegetarian, vegan, and egg-free tags against ambiguous allergen fallback.
- **Component & UI Alignments**:
  - Updated `DietaryBadge.tsx` to re-export and utilize `getDietaryClassification` from `@/utils/dietary`.
  - Added optical top margin (`mt: "2.5px"`) to `ProductCard.tsx` and `FeaturedSection.tsx` for clean vertical centering with typography glyphs.
  - Linked `ProductModal.tsx` to the centralized `PRIMARY_DIETARY_TAGS` export.
- **Unit Testing**:
  - Expanded `test/dietary-badge.test.ts` to directly import and assert all dietary classification cases: vegetarian, non-vegetarian, contains-egg, cross-contamination trace warnings (`mayContain`), and unclassified states.


## [2026-11-13] Feature: Integrate DietaryBadge in ProductModal Quick View
- **ProductModal Quick View Integration (`components/ui/ProductModal.tsx`)**:
  - Mounted `DietaryBadge` alongside the modal product title (`<Typography variant="h4">`) in a responsive flex row with `alignItems: "flex-start"` and `gap: 1.25`, passing `size="medium"`, `dietaryTags={product.dietaryTags}`, and `allergenInfo={product.allergenInfo}`.
  - Enhanced the dietary section by replacing generic text tags with an explicit authoritative dietary classification tag ("100% Vegetarian", "Non-Vegetarian", or "Contains Egg") paired directly with `DietaryBadge` (`size="small"`, `showTooltip={false}`).
  - Leveraged `getDietaryClassification` from `@/components/common/DietaryBadge` to ensure standard FSSAI colors and labels (`#16A34A` / `#DC2626` / `#D97706`).
  - Filtered primary classification tags from lifestyle tags, neatly presenting independent lifestyle preferences (e.g. `gluten_free`, `sugar_free`, `vegan`) with distinct chips.
  - Strictly adhered to MUI `sx` styling and avoided Tailwind CSS on MUI components.
- **Testing & Verification (`test/product-modal-dietary.test.ts`)**:
  - Authored test suite asserting import of `DietaryBadge` and `getDietaryClassification`, `size="medium"` configuration on the title row, `dietaryTags` and `allergenInfo` prop passing, and presence of explicit "100% Vegetarian" classification tags.
  - Followed strict TDD (RED failure -> GREEN pass).
  - Validated TypeScript type-checking (`tsc --noEmit`) and Next.js 16 production build (`npm run build`) with Turbopack with 0 errors.

## [2026-11-13] Feature: Integrate DietaryBadge in ProductCard & FeaturedSection
- **Product Card Integration (`components/ui/ProductCard.tsx`)**:
  - Mounted `DietaryBadge` alongside product name in a flexible header row with `alignItems: "flex-start"` and `gap: 0.75`.
  - Configured `size="small"`, passing `dietaryTags={product.dietaryTags}` and `allergenInfo={product.allergenInfo}`.
  - Maintained single-line clamp truncation (`WebkitLineClamp: 1`, `flex: 1`) preventing any layout or visual shifts.
- **Featured Section Integration (`components/sections/FeaturedSection.tsx`)**:
  - Mounted `DietaryBadge` in `FeaturedProductCard` header alongside product name with `alignItems: "flex-start"`, `gap: 0.75`, and `size="small"`.
  - Preserved existing margins and truncation styles.
- **Testing & Verification (`test/product-card-dietary.test.ts`)**:
  - Created test suite asserting import and mounting of `DietaryBadge` in both `ProductCard.tsx` and `FeaturedSection.tsx` with proper props.
  - Executed TDD verification (RED -> GREEN).
  - Validated TypeScript type-checking (`tsc --noEmit`) and Next.js 16 production build (`npm run build`) with Turbopack with 0 errors.

## [2026-11-13] Feature: Add Standard Indian DietaryBadge Component
- **Component Implementation (`components/common/DietaryBadge.tsx`)**:
  - Implemented reusable `DietaryBadge` rendering standard FSSAI Indian dietary indicators:
    - **Vegetarian** (`#16A34A`): Green border with green circular dot for `vegetarian`, `vegan`, and `egg_free`.
    - **Non-Vegetarian** (`#DC2626`): Red border with red circular dot for `non_vegetarian`.
    - **Contains Egg** (`#D97706`): Amber border with amber circular dot for `contains_egg` and products with egg allergen indications.
  - Implemented pure helper `getDietaryClassification(dietaryTags, allergenInfo)`.
  - Added MUI Tooltip integration, accessible `role="img"` and `aria-label`, supporting `small` (15px/7px) and `medium` (18px/8px) sizes.
  - Authoritative classification safeguard: returns `null` if unclassified, preventing false dietary claims.
- **Testing & Verification (`test/dietary-badge.test.ts`)**:
  - Added test suite asserting accessibility semantics (`role="img"`, `aria-label`), color standards (`#16A34A`, `#DC2626`, `#D97706`), tag classification triggers, and dimensions.
  - Executed TDD verification (RED -> GREEN).
  - Validated Next.js 16 production build (`npm run build`) and TypeScript type-check (`tsc --noEmit`) with 0 errors.
- **Documentation**:
  - Updated `.agents/architecture.md` with Dietary Classification & FSSAI Badges specification.

## [2026-11-09] Contact Details, Call Center, Toll-Free & Address Migration
- **Created Centralized Contact Source (`constants/contact.ts`)**:
  - Centralized all official contact channels, numbers, links, and addresses into `CONTACT_INFO` with `getWhatsappUrl` helper.
  - **Email**: `callcenter@nirulas.com` (`mailto:callcenter@nirulas.com`)
  - **Toll-Free Phone**: `1800 102 5247` (`tel:18001025247`)
  - **Mobile Phone**: `+91 84448 49940` (`tel:+918444849940`)
  - **WhatsApp Support**: `+91 92500 10686` (`https://wa.me/919250010686`)
  - **Address**: `A-65, Sector 64, Noida, Uttar Pradesh 201301`
- **Global Footer (`components/layout/Footer.tsx`)**:
  - Replaced internal `CONTACT` object with imports from `constants/contact`.
  - Added dedicated Toll-Free line with `SupportAgentOutlinedIcon` and Mobile line with `PhoneAndroidOutlinedIcon`.
  - Updated WhatsApp icon button and chat link to use the unified `9250010686` support channel.
- **Homepage Custom Cake Section (`components/sections/OrderSection.tsx`)**:
  - Replaced hardcoded `WHATSAPP_NUMBER` with `CONTACT_INFO.getWhatsappUrl(...)` targeting `9250010686`.
- **Custom Cake Builder (`app/customize/page.tsx`)**:
  - Updated order submission WhatsApp redirect, reference check button, and direct discussion CTA to use `CONTACT_INFO.getWhatsappUrl(...)` targeting `9250010686`.
- **Documentation & Architecture (`.agents/architecture.md`)**:
  - Updated architecture docs to reflect `constants/contact.ts` as the single source of truth for branding/contact metadata.
- **Verification**:
  - Verified 0 remaining occurrences of legacy contact numbers/emails in source code via grep.
  - Production build (`npm run build` with Turbopack) completed successfully with 0 errors.

## [2026-11-05] Delivery Window Auto-Detection (no user selection)

- **The customer never picks a delivery window.** It is derived strictly from the current IST wall clock — backend is the authority (`aimk_backend/src/modules/delivery-fee/delivery-window.ts`): 00:00–03:59 → midnight, 04:00–07:59 → early_morning (₹99), else standard. `CreateOrderDto` no longer accepts a `deliveryWindow` field, so a crafted payload cannot select the ₹99 fee.
- **Cart page**: removed the delivery-window selector; a read-only notice shows when a premium window is currently active ("Early-morning delivery applies now (4–8am) — ₹99…"). `previewOrder`/`createOrder` send no window; the server's `deliveryWindow` from the preview response overrides the local guess.
- **`utils/pricing.ts`** gained `detectDeliveryWindow()` — the exact same offset math as the backend, pinned against 7 boundary cases (03:59/04:00/07:59/08:00 IST etc.).

## [2026-11-05] Tax-Inclusive Pricing & Delivery Windows (Cart/Checkout)

- **`utils/pricing.ts` (new)** — `taxInclusive(price, gstRate)` and `gstFromInclusive(total, gstRate)`; mirrors `aimk_backend/src/modules/order/pricing.helper.ts`. Display-only: checkout payloads keep sending pre-tax `currentPrice`/`basePrice` — the backend converts, converting client-side would double-charge GST.
- **Cart page (`app/cart/page.tsx`)**:
  - All money math now runs on tax-inclusive values (`cartTotalIncl`); the old pre-tax `cartTotal` parallel total was deleted.
  - Item rows, strike-through prices, line totals, subtotal: tax-inclusive.
  - Total shows `incl. GST ₹x` (server `gstAmount` when preview responds, local extraction estimate otherwise).
  - Free-delivery threshold 500 → **250** (progress bar, remaining text, info chip).
  - Delivery-window selector (Standard ₹49 / free ≥ ₹250 · Early Morning 4–8am ₹99 · Midnight 12–4am ₹99, all-inclusive of 18% service charge); `deliveryWindow` sent to `order/preview` and `createOrder`; the ₹99 window fee applies regardless of order value.
- **Guest carts carry `gstRate`** (cartSlice type + `AddToCart`, `ProductModal`, `FeaturedSection` payloads) so guest pricing matches logged-in pricing.
- Backend delivery-fee rules are admin-editable (`/admin/delivery-fee-rules`); these constants are local fallback estimates only — server preview is authoritative.

## [2026-09-18] Display Typography Migration: Cravelo Demo to Fraunces Google Variable Font

- **Replaced Cravelo with Fraunces (`app/layout.tsx`, `lib/theme.ts`)**:
  - Removed unlicensed personal-use `Cravelo-DEMO-Regular.otf` and associated license notice file.
  - Configured **Fraunces** via `next/font/google` with Latin subset, variable weights, and CSS variable `--font-fraunces`.
  - Updated `TYPOGRAPHY.displayFont` in `lib/theme.ts` to reference `var(--font-fraunces), Georgia, serif`.
  - Fixes missing character set limitations (numbers 0-9, currency ₹, punctuation, apostrophes in product names/specials) and eliminates font-swap layout shifts.

## [2026-09-07] Sub-Navigation Bar Redesign & Hero Stacking Fix

- **CakesCategoryNav.tsx — Full Redesign**:
  - **Opaque background**: Changed from `rgba(255,255,255,0.92)` with `backdrop-filter: blur(16px)` to fully opaque `background.paper` (`#FFFFFF`). Eliminates the hero banner bleeding through the nav bar.
  - **No-wrap horizontal scroll**: Desktop tabs now use `whiteSpace: nowrap` inside a scrollable flex container with `overflowX: auto` and hidden scrollbar. Labels like "Viral Trending Desserts" and "Dessert Tubs (150 gms)" no longer wrap onto multiple lines.
  - **Scroll fade masks**: Left/right gradient fade indicators appear dynamically when the scroll container is overflowing, hinting at off-screen categories.
  - **Bottom accent underline**: Hover/active tabs show a 2px primary-color bottom border for clear visual hierarchy, replacing the previous background-color-only hover.
  - **Semantic buttons**: Desktop tabs now use `<button>` elements instead of `<div>` for keyboard accessibility and screen-reader support. Added `focus-visible` outline.
  - **Fixed popup positioning**: Dropdown popup for parent categories now anchors flush to `barRect.bottom` instead of subtracting 30px, preventing gap/overlap issues.
  - **Mobile chip improvements**: Increased touch target to `minHeight: 36px`, added pill-shaped `borderRadius: 18px`, added container padding (`px: 1.5`) so edge chips aren't flush, subtler border color.
  - **Removed unused imports**: Cleaned up `usePathname` import and variable.

- **theme.ts — AppBar Opacity Fix**:
  - Changed `MuiAppBar.backgroundColor` from `${background.accent}DD` (87% opacity) to fully opaque `background.accent`. Prevents main header from showing the hero behind it when scrolling.


## [2026-08-25] WhatsApp-First Custom Cake Flow on /customize & Luxury OrderSection Redesign

- **Direct WhatsApp Consultation on `/customize` (`app/customize/page.tsx`)**:
  - Added a high-converting "Instant Baker Consultation / Skip the Form" hero card at the top of the `/customize` container.
  - Allows customers to bypass filling in the full form and immediately connect with master bakers via WhatsApp (`https://wa.me/919478370346`) with pre-filled greeting text.
  - Added a stylish section divider leading to the full detailed customization form below for users who prefer submitting structured specifications, flavor selections, and inspiration image attachments.
  - Fixed MUI v6 / React 19 `slotProps={{ inputLabel: { shrink: true } }}` date input compatibility.

- **OrderSection Redesign (`components/sections/OrderSection.tsx`)**:
  - Revamped the "Let's Create Something Unforgettable" section into a luxury showcase with radial ambient lighting, frosted glassmorphism feature cards, hover animations, and subtle top accent bars.
  - Updated pickup copy from *"or you can pick up from our Defence Colony outlet."* to *"or you can pick up from your nearby outlet."*
  - Reorganized CTAs to highlight instant WhatsApp consultation alongside the direct link to the custom order page.

## [2026-08-22] Homepage Order Section Simplified; Footer Rebuilt with Real Business Info

**Homepage "Order" section was a second, non-functional custom-cake form**

`OrderSection` (rendered on `/`) duplicated the full custom-cake enquiry — first/last name, email, phone, occasion, event date, a vision textarea — but its submit handler was `e.preventDefault(); setSubmitted(true)`. It never called an API. Meanwhile `/customize` (`app/customize/page.tsx`) already implements the real version of this exact flow: image upload to the media API, delivery address, a real `useCreateCakeRequestMutation`, and a WhatsApp handoff. Two forms for the same task, only one of which worked.

- Replaced the form with a compact info block (booking lead time, what to share, delivery area) plus two buttons: **Start Customizing** → `/customize`, and **Chat on WhatsApp** → `wa.me/919478370346` (the same number `/customize` already uses).
- Also dropped placeholder content left over from the original template: "orders over €200", "Paris and Île-de-France" → replaced with real, checkable copy ("Delhi NCR", "our Defence Colony outlet" — matching the seeded `Outlet` named "Defence Colony Outlet").

**Footer pointed to a bakery in Paris**

`components/layout/Footer.tsx` was unmodified template content: address "12 Rue du Pain, Paris 75004", phone "+33 1 42 77 88 99", email "hello@lafarine.com", copyright "© La Farine". The three link columns (`Our Story`, `Gift Cards`, `Wedding Cakes`, `Classes`, `Hours & Location`, `Wholesale`, `Careers`, etc.) all had `href="#"` — none of those pages exist on this site.

- Verified real contact info against the backend rather than guessing: `GET /legal-entity` → "Angels in My Kitchen Foods Pvt Ltd", address `E-42, Defence Colony, Main Market, New Delhi 110024`, `contact@angelsinmykitchen.com`, `+91 11 4165 5000`. WhatsApp number reused from `/customize`.
- Link columns rebuilt to only the routes that actually exist: **Shop** (Home, Menu, Cakes, Customize a Cake) and **My Account** (My Orders, My Addresses, My Profile, Cart), using `next/link` instead of dead `href="#"` anchors.
- The "Stay Sweet" newsletter box had no backend (`aimk_backend` has no subscribe endpoint) and its "Join" button had no `onClick` at all — replaced with a real "Get in Touch" block (address, `mailto:`, `tel:`, WhatsApp).
- Dropped the bottom-bar Privacy Policy / Terms of Use / Cookie Settings links — those pages don't exist either, so they were dead links; left just the (corrected) copyright line.
- Social icons: Instagram/Facebook kept decorative (no real handles to link to, so none were invented); WhatsApp icon now links to the real number.

**Verified in the browser**: `/` → `#order` section shows no form fields, both CTAs work (Start Customizing routes to `/customize`, confirmed via `location.pathname`); footer confirmed to have zero `href="#"` links — all 11 hrefs resolve to real routes, `mailto:`, `tel:`, or a real `wa.me` link; no horizontal overflow at 375px or 1280px.

## [2026-08-20] Product Info Modal Redesign, Reactive Quantity Controls & Order Tracking Progress

- **Product Modal (`components/ui/ProductModal.tsx`)**:
  - Redesigned with a strict 1:1 square aspect ratio image container, square thumbnail gallery strip (`58px × 58px`), modern badge cluster with frosted blur backdrop, display typography, allergen warnings, and four detailed tabs (Overview, Nutrition Facts, Storage & Care, Customer Reviews with verified buyer badges).
  - Built self-contained, reactive Add to Cart & quantity increment/decrement controls (`-` `[qty]` `+`) using RTK Query `useAddToCartMutation`, `useGetCartQuery`, `useUpdateCartQuantityMutation`, `useRemoveFromCartMutation`, and local guest cart synchronization.
- **Consumer Order Tracking (`app/orders/[id]/page.tsx`)**:
  - Aligned `ORDER_STEPS` to include `pending` as the first milestone ("Order Placed"), resolving the 0% empty bar issue for newly placed orders.
- **`FeaturedSection.tsx`**:
  - Converted thunk dispatches to RTK Query `useAddToCartMutation` to ensure cart caches and badge counts remain perfectly synchronized across the entire site.

## [2026-08-20] Product Modal Fix & Redesign, Shared Order Status Config

**Add to Cart in the product modal never worked**

`ProductModal` declared `onAddToCart: (product) => void` and called `onAddToCart(product)`, but every page passes the same `handleAddToCart(e, product)` it gives `ProductCard` — event first. So `e` was the product object and `e.stopPropagation()` threw a `TypeError` on the first line, killing the click silently. This affected `/menu`, `/cakes`, `/cakes/[slug]` and `MenuSection`.

`FeaturedSection` was broken differently: its modal passed an inline `(p) => dispatch(addToCart(toCartItem(product)))` where **`addToCart` was never imported** (`TS2304: Cannot find name 'addToCart'`), and it bypassed the auth/guest split its own `handleAddToCart` implements.

- `ProductModal`'s prop is now `(e: React.MouseEvent, product: Product)`, matching `ProductCard`, and it invokes `onAddToCart(e, product)`.
- `FeaturedSection` now passes its real `handleAddToCart`, so the modal and the cards share one path (server cart when logged in, guest cart otherwise, then open the cart).

**Modal redesign**

- The product image is now locked to **1:1** via an aspect-ratio box. The image spec for this slot (`IMAGE_SLOTS.productGallery`) has always been `1:1`, but the old flex layout stretched it to fill the panel height.
- Removed the duplicated title: the shell rendered `DialogTitle` with the product name *and* the modal rendered it again as an `h4`. `ModalProvider` now renders the title bar only when a title is given, and floats a close button over the content otherwise. Added an opt-in `disableContentPadding` so the image panel can run edge-to-edge.
- Price and Add to Cart moved into a sticky footer bar so they stay reachable while the details/nutrition/reviews area scrolls, instead of sitting below the fold.
- Fixed a mobile overflow: the grid track used `1fr` (i.e. `minmax(auto, 1fr)`), so it could not shrink below the min-content width of the fixed-width thumbnail strip — the 380px image overflowed a 311px dialog. Now `minmax(0, 1fr)` with `minWidth: 0` on both columns.
- Migrated the deprecated `TabIndicatorProps` to `slotProps={{ indicator }}` for MUI v9.

**Order statuses**

- Added `utils/orderStatus.ts` and removed the two duplicated inline `STATUS_CONFIG` maps in `app/orders/page.tsx` and `app/orders/[id]/page.tsx`. It is a byte-identical copy of `aimk_admin/utils/orderStatus.ts`; the storefront's list was already correct, the admin's was not. **Change both together.**
- Dropped a dead `"completed"` status check in the review gate — not a value in the Prisma enum.

**Verified in the browser**: adding to cart from the modal moved the badge 0→1 on `/menu` and 1→2 on the home page with no page errors; the image measures exactly 380×380 at 1280px and 271×271 at 375px, with no horizontal overflow at either size.

## [2026-08-20] Active Product Filtering on Menu, Featured, and Cakes Pages

- Updated `productsEndpoints.ts` (`features/products/productsEndpoints.ts`):
  - Added query parameter serialization to `getAllProducts`, `getProductsByCategory`, and `getFeaturedProducts`.
  - Fixed endpoint URL for `getFeaturedProductsPaginated` to `product/featured/paginated`.
- Updated `app/menu/page.tsx`: Passed `isActive: true` in `useGetPaginatedProductsQuery` and `useGetProductsByCategoryPaginatedQuery`.
- Updated `components/sections/MenuSection.tsx`: Passed `isActive: true` in `useGetPaginatedProductsQuery` and `useGetProductsByCategoryPaginatedQuery`.
- Updated `components/sections/FeaturedSection.tsx`: Passed `{ isActive: true }` in `useGetFeaturedProductsQuery`.
- Updated `app/cakes/page.tsx`: Passed `isActive: true` in `useGetPaginatedProductsQuery`.
- Updated `app/cakes/[slug]/page.tsx`: Passed `isActive: true` in `useGetProductsByCategorySlugPaginatedQuery`.

## [2026-08-20] Active Category Filtering on Menu and Home Sections

- Updated `categoryEndpoints.ts` (`features/categories/categoryEndpoints.ts`): Extended `getAllCategories` to accept `{ isActive?: boolean; search?: string } | void` and serialize parameters to `GET /category`.
- Updated `app/menu/page.tsx`: Requested `useGetAllCategoriesQuery({ isActive: true })` so only active categories appear in the menu sidebar and mobile category dropdown.
- Updated `components/sections/CategoriesSection.tsx`: Requested `useGetAllCategoriesQuery({ isActive: true })`.
- Updated `components/sections/MenuSection.tsx`: Passed `isActive: true` to `useGetAllCategoriesPaginatedQuery`.

## [2026-08-08] Self-Contained Permissions Package (@aimk/permissions)
- Bundled `@aimk/permissions` package inside `packages/aimk-permissions` within the `angels` repository.
- Updated [package.json](file:///home/ujjwal/Desktop/angels_projects/angels/package.json#L12) dependency from `"file:../aimk-permissions"` to `"file:./packages/aimk-permissions"`.
- Resolved Next.js Turbopack workspace root inference error caused by external relative file dependencies (`../`).

## [2026-08-06] Slashed Prices & Discount Consistency Fix (Category & Cart)
- Added `discountedPrice`, `discountPct`, `discountFlat`, and `discountName` fields to `Product` interface in [interfaces/product.interface.ts](file:///home/ujjwal/Desktop/angels_projects/angels/interfaces/product.interface.ts#L15).
- Updated `cartSlice.ts` (`loadGuestCart`, `saveGuestCart`, `addToGuestCart`, `updateGuestQuantity`) to store and calculate effective item prices (`discountedPrice ?? basePrice`) and line totals correctly for guest cart.
- Updated `AddToCart.tsx` to forward `discountedPrice` and `discountPct` in the payload when adding to guest cart.
- Updated [app/cart/page.tsx](file:///home/ujjwal/Desktop/angels_projects/angels/app/cart/page.tsx#L742) to calculate `unitPrice` and `lineTotal` using effective discounted prices, and display slashed original prices (e.g. ~~₹890.00~~) and `-10%` discount badges on cart item cards.

## [2026-08-06] React FormHelperTextProps Console Error Fix (/cart)
- Replaced deprecated `FormHelperTextProps` prop on MUI `TextField` in [app/cart/page.tsx](file:///home/ujjwal/Desktop/angels_projects/angels/app/cart/page.tsx#L956) with `slotProps={{ helperText: { ... } }}` to resolve React 19 un-recognized DOM element prop warning.

## [2026-08-06] Offers & Coupons Integration (/cart & AvailableCouponsDrawer)
- Added `getAvailableOffers` and `validateOfferCode` RTK Query endpoints to `features/offer/offerEndpoints.ts` and exported `useGetAvailableOffersQuery` & `useValidateOfferCodeMutation` in `features/offer/offerApiService.ts`.
- Added `appliedPromo` state, `applyPromo` and `removePromo` actions, and `selectAppliedPromo` selector to `features/cart/cartSlice.ts`.
- Created `components/ui/AvailableCouponsDrawer.tsx` featuring coupon code pills, copy buttons, eligibility criteria details, and 1-click **Apply** button.
- Updated `app/cart/page.tsx` with a *"View Available Coupons & Offers ✨"* button, green applied promo pill with "Remove" action, live coupon code validation, and dynamic financial summary calculations (`Subtotal - Coupon Discount + Shipping = Total`).
- Wired `promoCode` payload into order placement mutation (`createOrder`).

## [2026-08-06] Global Category Nav Bar + Floating CTA Improvements

### Floating Auxiliary Popup Alignment
- Fixed vertical gap issue: Updated `top` positioning calculation from `barRect.bottom` to `barRect.bottom - 6`. The auxiliary popup card now sits flush under the category navbar and active tab pill with zero gap.

### SiteShell Architecture
- Created `components/layout/SiteShell.tsx` — a new global client-side shell component that renders `<Navbar>`, `<CakesCategoryNav>`, `<Footer>`, and `<FloatingCustomizeCTA>` once, globally, for all consumer pages.
- Updated `lib/Providers.tsx` to wrap `{children}` inside `<SiteShell>`, making the header/footer appear on every page without per-page duplication.
- `SiteShell` is route-aware via `usePathname()`: suppresses `<CakesCategoryNav>` and `<Footer>` on auth routes (`/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-otp`).

### Per-Page Cleanup
- Stripped `<Navbar>` and `<Footer>` from 9 consumer pages that previously rendered them manually: `page.tsx`, `menu`, `cart`, `orders`, `orders/[id]`, `profile`, `profile/edit`, `addresses`, `customize`.
- Simplified `app/cakes/layout.tsx` to a transparent passthrough `<>{children}</>` since all layout concerns are now handled by `SiteShell`.

### Navbar Change
- Removed `{ label: "Cakes", href: "/cakes" }` from `NAV_LINKS` in `Navbar.tsx`.
- Cakes are now discoverable entirely through the always-visible `CakesCategoryNav` bar below the Navbar.

### CakesCategoryNav — Fixed-Position Floating Popup
- Upgraded the desktop hover dropdown from `position: absolute` (which pushed content and was contained in the bar's stacking context) to a `position: fixed` floating popup anchored via `getBoundingClientRect()`.
- Added `tabRefs` map and `popupPos` state to track each category tab's bounding rect.
- Added 150ms `scheduleClose`/`clearLeaveTimer` debounce so the pointer can travel from the category tab into the popup without it closing prematurely.
- Removed unused `Grid` and `Paper` MUI imports.

### FloatingCustomizeCTA — Centering Fix + Sitewide
- Fixed centering: replaced CSS `transform: translateX(-50%)` in `sx` prop (which conflicted with Framer Motion's transform pipeline) with Framer Motion's own `style={{ x: "-50%" }}` prop, which composes correctly with the animated `y` value.
- Added route exclusion guard: returns `null` on `/customize` and all auth pages so it never appears where it shouldn't.
- Moved from `app/cakes/layout.tsx` to `SiteShell` — now visible globally on all consumer pages.

**Build result**: ✅ 0 errors, 17/17 pages generated.


## [2026-07-31] Project Rules & Milestone Setup
- Updated `.agents/AGENTS.md` with step-by-step incremental execution rules and LOG.md maintenance requirements.
- Initialized `LOG.md` for activity logging.

## [2026-07-31] Milestone 4: Customize Cake Request Feature (Step 3)
- Built `/customize` custom cake request form page.

## [2026-07-31] Milestone 6: Payment Service + Cash on Delivery (COD) (Step 3)
- Added Cash on Delivery (COD) payment option to checkout flow on `/cart`.

## [2026-07-31] Milestone 5: Offers System & Hero Carousel (Step 4 - Carousel Wireup)
- Updated `HeroSection.tsx` to fetch active offers and display promotional banners.

## [2026-07-31] Milestone 8: Product Reviews & Ratings System
- Added `ReviewDialog` on `/orders/[id]` and Reviews Tab in `ProductModal.tsx` on `/menu`.

## [2026-08-01] Milestone 11: Customer Directory & Loyalty Profile
- Added Loyalty Rewards Tier Card on `/profile` page.

## [2026-08-01] Milestone 14: Strict Interfaces Consolidation & Type Safety Refactoring
- Standardized all domain interfaces in `interfaces/` directory (`order.interface.ts`, `loyalty.interface.ts`, `user.interface.ts`, `product.interface.ts`).
- Updated components and pages (`app/orders/page.tsx`, `profile/page.tsx`) to import directly from `@/interfaces/`.
- Guaranteed 100% type-safe compilation across all consumer web app routes.

## [2026-08-06] Milestone 15: Custom Cakes Menu Navigation & Floating Customize CTA Bar
- Added `CategoryWithChildren` interface in `interfaces/category.interface.ts`.
- Added RTK Query endpoints `getCategoryTree`, `getCategoryBySlug`, and `getProductsByCategorySlugPaginated`.
- Built `CakesCategoryNav.tsx` sticky sub-header mega navigation component with desktop hover drop-down cards and mobile scrollable chip-bar + bottom sheet drawer.
- Built `FloatingCustomizeCTA.tsx` scroll-triggered floating island bar with smooth Framer Motion animations.
- Created `/cakes` main catalog and `/cakes/[slug]` category catalog pages with SEO breadcrumbs, sorting, search, pagination, and modal product view.
- Updated `Navbar.tsx` navigation links.

