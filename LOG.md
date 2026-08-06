# Angels Consumer Web App — Development Log

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

