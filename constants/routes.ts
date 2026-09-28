// constants/routes.ts
/**
 * Routes reachable without authentication.
 *
 * Prefix-matched, so `/menu` also covers `/menu/category/<slug>`.
 * The previous exact-match list lived in AuthProvider and would have treated
 * `/menu/category/xyz` as protected, bouncing anonymous menu browsing to /login.
 */
export const PUBLIC_ROUTES = ['/login', '/register', '/', '/menu', '/cart', '/customize'];

/** Prefix match — publicRoutes.includes() was exact and silently wrong for subpaths. */
export const isPublicPath = (pathname: string): boolean =>
  PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
