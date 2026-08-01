# Workspace Rules: Angels Consumer Web App (Next.js)

Welcome, agent! You are working on the primary consumer-facing web application of **Angels in My Kitchen** (`angels`), a Next.js application using React 19, Material-UI, and Three.js.

Please read and adhere strictly to the rules and references below before performing any tasks or edits.

---

## Critical Rules & Guidelines

1. **Keep Documentation Sync'd**: You MUST update the documentation in this `.agents/` folder whenever you introduce new features, pages, components, or state slices. Refer to [maintenance.md](file:///home/ujjwal/Desktop/angels_projects/angels/.agents/maintenance.md) for instructions.
2. **Framework Context (Next.js 16/React 19)**:
   - This project uses Next.js 16 and React 19, which contains breaking changes compared to older versions. Heed deprecation notices.
   - Use App Router (pages are under `app/`).
   - Components under `app/` are Server Components by default. Add `"use client";` at the top of files that use hooks, state, or event handlers.
3. **Premium Visual Aesthetics**:
   - The user-facing app should look extremely polished and premium.
   - Utilizes Material-UI (MUI), Tailwind CSS v4, Framer Motion, and GSAP for micro-animations and smooth transitions.
   - Uses Three.js inside `components/3d/` (e.g. `CakeScene.tsx` for 3D cake customization or display).
4. **Environment & Commands**:
   - The application runs on port `8080` locally.
   - Run the development server with `./local.sh` (or `npm run dev -- -p 8080`).
   - The backend API URL is configured via `NEXT_PUBLIC_BASE_URL` (usually `http://localhost:9090`).
   - Local storage/cookie security: Twilio test OTPs and Razorpay credentials are bound for local test checkouts.
5. **Incremental Step-by-Step Execution**: Do NOT do everything all at once. Even within a milestone, proceed strictly 1 or 2 small steps at a time. After completing 1 or 2 steps, stop and inform the user what to check, how to test/verify it, and wait for feedback if needed.
6. **Activity Log (`LOG.md`)**: Maintain a `LOG.md` file in the root of the project (`LOG.md`) as a detailed history log of all changes made and their rationale for traceability.


---

## Workspace Directories & References

- **Architecture Details**: Review [architecture.md](file:///home/ujjwal/Desktop/angels_projects/angels/.agents/architecture.md) for details on components, state management, checkout flows, and 3D scenes.
- **Workflow Guide (Ask/Plan/Architect/Orchestrate/Debug)**: Review [workflows.md](file:///home/ujjwal/Desktop/angels_projects/angels/.agents/workflows.md) to see how to approach user-facing enhancements.
- **Sync & Maintenance Checklist**: Review [maintenance.md](file:///home/ujjwal/Desktop/angels_projects/angels/.agents/maintenance.md) to ensure all documentation is kept up-to-date with your code changes.
