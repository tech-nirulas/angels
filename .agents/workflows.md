# Agent Workflows: Angels Consumer Web App

This guide outlines how an agent should approach asking, planning, architecting, orchestrating, and debugging tasks on the consumer web portal.

---

## 1. Ask (Information Gathering)
When exploring customer pages, catalog filters, or checkouts:
- **Route first**: Check `app/<page-folder>` to understand routing paths and page layouts.
- **Inspect features API / slice**: Check `features/` for the state slice (e.g. `cart/cartSlice.ts` or `cart/cartThunk.ts`) and RTK Query services.
- **MUI Theme customizers**: Look at `app/layout.tsx` to find theme configurations and global CSS injections.

---

## 2. Plan (Designing Premium UI Changes)
Before coding visual elements:
- Ensure the proposed changes fit **warm, high-end bakery design aesthetics** (e.g., soft curves, subtle pastel backgrounds, card shadows).
- Identify and plan micro-animations (e.g. hover lifts, checkout dialog slide-ins).
- Check responsiveness (mobile breakpoint behavior is critical as most orders come from phones).
- Verify impact on guest checkout vs. logged-in user flows.

---

## 3. Architect (Coding Patterns)

When adding a new consumer-facing feature (e.g., product reviews/ratings):
1. **API Integration**:
   - Add review queries/mutations in a slice under `features/products/productApiService.ts` or create `features/reviews/reviewsApiService.ts`.
   - Register it in `redux/api.ts`.
2. **Interactive UI Component**:
   - Create reviews card inside `components/ui/` or `components/sections/`.
   - Add animations using Framer Motion:
     ```tsx
     import { motion } from "framer-motion";
     // Wrap components in <motion.div> for entry reveals
     ```
3. **Cart & LocalStorage Sync**:
   - If adding client-side checkout states, manage them inside `features/cart/cartSlice.ts`.
   - Keep asynchronous actions separated in `features/cart/cartThunk.ts`.

---

## 4. Orchestrate (Execution Steps)
- Keep UI separate from API connections; pass RTK query hook data as props to presentation components.
- Ensure Google Maps and Razorpay SDK scripts load conditionally without blocking Page Speed Index.
- Run lint audits (`npm run lint`) before committing.

---

## 5. Debug & Error Resolver

### Port Collision (8080)
- **Problem**: Next.js server collides with backend or admin panel, or defaults to 3000.
- **Solution**: The local startup script `local.sh` sets the port to 8080 (`npm run dev -- -p 8080`). Run `./local.sh` to start.

### Three.js WebGL / Canvas Size Mismatch
- **Problem**: The 3D cake canvas overflows, looks stretched, or does not render when parent container expands.
- **Solution**: Look at `components/3d/CakeScene.tsx`. Ensure the resize listener in `useEffect` updates the camera aspect ratio and renderer size using `mountRef.current.clientWidth/Height` rather than `window.innerWidth/Height`.

### Razorpay checkout window load failures
- **Problem**: `window.Razorpay is not defined` errors.
- **Solution**: Ensure the checkout logic fetches the Razorpay script dynamically before calling `new window.Razorpay(options)`. Add `<Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />` in your layout or trigger dynamic script loaders.

### Google Maps API keys
- **Problem**: Google Maps frame displays "For development purposes only" watermark or fails to load.
- **Solution**: Check `local.sh` and make sure `NEXT_PUBLIC_GOOGLE_MAPS_KEY` is set to the correct authorized key string.
