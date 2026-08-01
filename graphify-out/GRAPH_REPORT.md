# Graph Report - .  (2026-08-01)

## Corpus Check
- 23 files · ~169,223 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 483 nodes · 672 edges · 46 communities (26 shown, 20 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.83)
- Token cost: 150 input · 100 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Auth Pages & OTP Verification|Auth Pages & OTP Verification]]
- [[_COMMUNITY_Cart Page & Delivery Checkout|Cart Page & Delivery Checkout]]
- [[_COMMUNITY_Category API Service & Buttons|Category API Service & Buttons]]
- [[_COMMUNITY_API Services & Reauth Base Query|API Services & Reauth Base Query]]
- [[_COMMUNITY_Password Recovery & Reset Pages|Password Recovery & Reset Pages]]
- [[_COMMUNITY_Consumer App Layout & Typography|Consumer App Layout & Typography]]
- [[_COMMUNITY_GraphQL Codegen & Dev Dependencies|GraphQL Codegen & Dev Dependencies]]
- [[_COMMUNITY_Apollo Client & MUI Dependencies|Apollo Client & MUI Dependencies]]
- [[_COMMUNITY_Saved Addresses Management|Saved Addresses Management]]
- [[_COMMUNITY_Home Page & Featured Products|Home Page & Featured Products]]
- [[_COMMUNITY_Categories Section & Circular Cards|Categories Section & Circular Cards]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_User Service & Localization|User Service & Localization]]
- [[_COMMUNITY_Server Cart Thunk Actions|Server Cart Thunk Actions]]
- [[_COMMUNITY_Consumer Environment & API URLs|Consumer Environment & API URLs]]
- [[_COMMUNITY_Product Reviews & Modal Components|Product Reviews & Modal Components]]
- [[_COMMUNITY_3D Cake Customizer Scene|3D Cake Customizer Scene]]
- [[_COMMUNITY_Hero Banners & Campaign Offers|Hero Banners & Campaign Offers]]
- [[_COMMUNITY_Development Log & App Rules|Development Log & App Rules]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `useAppSelector` - 16 edges
3. `useToast()` - 11 edges
4. `useAppDispatch()` - 11 edges
5. `saveEncryptedToken()` - 9 edges
6. `Root` - 9 edges
7. `baseQueryWithReauth()` - 9 edges
8. `VerifyOtpPage()` - 6 edges
9. `RootPaginate` - 6 edges
10. `LoginPage()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `AddressesPage()` --calls--> `useAppSelector`  [EXTRACTED]
  app/addresses/page.tsx → lib/store.ts
- `OrdersPage()` --calls--> `useAppSelector`  [EXTRACTED]
  app/orders/page.tsx → lib/store.ts
- `AddressFormDialog()` --calls--> `useToast()`  [EXTRACTED]
  app/addresses/page.tsx → hooks/useToast.ts
- `ForgotPasswordPage()` --calls--> `useToast()`  [EXTRACTED]
  app/forgot-password/page.tsx → hooks/useToast.ts
- `VerifyOtpPage()` --indirect_call--> `selectGuestCartItems()`  [INFERRED]
  app/verify-otp/page.tsx → features/cart/cartSlice.ts

## Import Cycles
- 3-file cycle: `features/cart/cartSlice.ts -> lib/store.ts -> redux/reducer.ts -> features/cart/cartSlice.ts`

## Communities (46 total, 20 thin omitted)

### Community 0 - "Auth Pages & OTP Verification"
Cohesion: 0.09
Nodes (31): AuthStep, LoginPage(), VerifyOtpPage(), AddToCartButton(), CartBadge(), AuthStep, LoginModal(), LoginModalProps (+23 more)

### Community 1 - "Cart Page & Delivery Checkout"
Cohesion: 0.05
Nodes (18): CartPage(), effectivePrice(), CAKE_SIZES, FLAVOR_OPTIONS, OCCASIONS, COMPLAINT_TYPES, ORDER_STEPS, OrderProgress() (+10 more)

### Community 2 - "Category API Service & Buttons"
Cohesion: 0.09
Nodes (29): AddToCartButtonProps, baseQuery, categoryApiService, categoryEndpoints(), EndpointDefinitions, baseQuery, productApiService, EndpointDefinitions (+21 more)

### Community 3 - "API Services & Reauth Base Query"
Cohesion: 0.09
Nodes (20): addressApiService, baseQuery, baseQueryWithReauth(), cakeApiService, cakeEndpoints(), CustomCakePayload, EndpointDefinitions, cartApiService (+12 more)

### Community 4 - "Password Recovery & Reset Pages"
Cohesion: 0.10
Nodes (19): ForgotPasswordPage(), schema, getStrength(), ResetPasswordPage(), schema, MaterialFreeInputMultiSelectProps, MaterialMultiSelectFieldProps, MaterialPasswordField() (+11 more)

### Community 5 - "Consumer App Layout & Typography"
Cohesion: 0.09
Nodes (19): cormorant, dmMono, lato, metadata, playfair, ModalContext, ModalContextValue, ModalProps (+11 more)

### Community 6 - "GraphQL Codegen & Dev Dependencies"
Cohesion: 0.09
Nodes (22): devDependencies, eslint, eslint-config-next, @graphql-codegen/cli, @graphql-codegen/typescript, @graphql-codegen/typescript-operations, @graphql-codegen/typescript-react-apollo, tailwindcss (+14 more)

### Community 7 - "Apollo Client & MUI Dependencies"
Cohesion: 0.09
Nodes (23): dependencies, @apollo/client, @emotion/cache, @emotion/react, @emotion/server, @emotion/styled, formik, framer-motion (+15 more)

### Community 8 - "Saved Addresses Management"
Cohesion: 0.13
Nodes (15): ADDRESS_TYPE_OPTIONS, AddressesPage(), AddressFormDialog(), DEFAULT_CENTER, emptyForm(), INDIA_STATES, MAP_LIBRARIES, addressEndpoints() (+7 more)

### Community 9 - "Home Page & Featured Products"
Cohesion: 0.11
Nodes (11): FeaturedProductCard(), FeaturedSection(), getImageUrl(), ProductModalDynamic, toCartItem(), CategoryChipProps, getImageUrl(), MenuSection() (+3 more)

### Community 10 - "Categories Section & Circular Cards"
Cohesion: 0.10
Nodes (9): CircularCategoryItem, CircularCategorySkeleton, containerVariants, itemVariants, shimmer, TESTIMONIALS, ImageWithFallback, ImageWithFallbackProps (+1 more)

### Community 11 - "TypeScript Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 12 - "User Service & Localization"
Cohesion: 0.21
Nodes (11): userApiService, EndpointDefinitions, userEndpoints(), Localization, Permission, Role, ChangePasswordResponse, GetAllUsersPaginatedResponse (+3 more)

### Community 13 - "Server Cart Thunk Actions"
Cohesion: 0.18
Nodes (7): addToServerCart, clearServerCart, fetchServerCart, removeFromServerCart, updateServerCartQuantity, decryptToken(), getDecryptedToken()

### Community 14 - "Consumer Environment & API URLs"
Cohesion: 0.18
Nodes (10): NEXT_PUBLIC_BASE_URL, NEXT_PUBLIC_ENV, NEXT_PUBLIC_GOOGLE_CLIENT_ID, NEXT_PUBLIC_GOOGLE_MAPS_KEY, NEXT_PUBLIC_MEDIA_BASE_URL, NEXT_PUBLIC_MSG91_TOKEN_AUTH, NEXT_PUBLIC_MSG91_WIDGET_ID, NEXT_PUBLIC_RAZORPAY_KEY (+2 more)

### Community 15 - "Product Reviews & Modal Components"
Cohesion: 0.24
Nodes (8): getImageUrl(), MenuPage(), parseSortBy(), ProductCard(), ProductCardProps, ProductModalDynamic, SidebarButtonProps, SORT_OPTIONS

### Community 16 - "3D Cake Customizer Scene"
Cohesion: 0.44
Nodes (6): authApiService, LoginRequest, LoginResponse, SignupRequest, SignupResponse, AuthValidator

### Community 17 - "Hero Banners & Campaign Offers"
Cohesion: 0.29
Nodes (5): fadeInUp, float, pulse, rotate, shimmer

### Community 18 - "Development Log & App Rules"
Cohesion: 0.29
Nodes (5): fadeInUp, float, pulse, rotate, shimmer

### Community 21 - "Community 21"
Cohesion: 0.40
Nodes (4): @mui/material/styles, Palette, PaletteOptions, TypeBackground

### Community 22 - "Community 22"
Cohesion: 0.50
Nodes (4): Styling & Animation System, Three.js Interactive Cakes, Documentation Maintenance Policy, Designing Premium UI

### Community 23 - "Community 23"
Cohesion: 0.67
Nodes (3): Cart Sync & Checkout Flow, Unified Passwordless Experience, Session Lifespans & RTR

### Community 26 - "Community 26"
Cohesion: 0.67
Nodes (3): 3D Cake Customization Flow, Consumer App Rules (AGENTS.md), Consumer App Log (LOG.md)

## Knowledge Gaps
- **207 isolated node(s):** `AuthStep`, `DEFAULT_CENTER`, `MAP_LIBRARIES`, `ADDRESS_TYPE_OPTIONS`, `INDIA_STATES` (+202 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAppSelector` connect `Auth Pages & OTP Verification` to `Saved Addresses Management`, `Cart Page & Delivery Checkout`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `useToast()` connect `Password Recovery & Reset Pages` to `Saved Addresses Management`, `Auth Pages & OTP Verification`, `Categories Section & Circular Cards`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `Root` connect `Category API Service & Buttons` to `Saved Addresses Management`, `3D Cake Customizer Scene`, `API Services & Reauth Base Query`, `User Service & Localization`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `AuthStep`, `DEFAULT_CENTER`, `MAP_LIBRARIES` to the rest of the system?**
  _211 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auth Pages & OTP Verification` be split into smaller, more focused modules?**
  _Cohesion score 0.08673469387755102 - nodes in this community are weakly interconnected._
- **Should `Cart Page & Delivery Checkout` be split into smaller, more focused modules?**
  _Cohesion score 0.05391120507399577 - nodes in this community are weakly interconnected._
- **Should `Category API Service & Buttons` be split into smaller, more focused modules?**
  _Cohesion score 0.08536585365853659 - nodes in this community are weakly interconnected._