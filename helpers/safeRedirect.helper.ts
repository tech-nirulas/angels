// helpers/safeRedirect.helper.ts
/**
 * Single source of truth for post-login destination ("returnTo").
 *
 * Two jobs, both tiny on purpose:
 *  1. `loginPathFor`  — where to send an anonymous user who asked for a protected page.
 *  2. `safeReturnTo`  — where to land them after they actually authenticate.
 *
 * `safeReturnTo` refuses anything that isn't a single-slash-prefixed in-app path.
 * That blocks open-redirects (`//evil.com`, `https://evil.com`, `/\evil.com`)
 * and protocol-relative URLs. It is the trust boundary, so it stays explicit
 * rather than relying on next/navigation.
 */
import { isPublicPath } from '@/constants/routes';

export const loginPathFor = (pathname: string, search?: string): string => {
  // Must use the SAME predicate the auth gate uses, or the two disagree on
  // subpaths (login would demand auth on a page the gate considers public).
  if (isPublicPath(pathname)) return '';
  const query = search && search !== '?' ? `?${search.replace(/^\?/, '')}` : '';
  return `/login?returnTo=${encodeURIComponent(`${pathname}${query}`)}`;
};

export const safeReturnTo = (returnTo: string | null | undefined): string | null => {
  if (!returnTo) return null;
  // Must start with exactly one '/' — blocks '//host' and '/\host'.
  if (!returnTo.startsWith('/') || returnTo.startsWith('//') || returnTo.startsWith('/\\')) {
    return null;
  }
  if (returnTo.startsWith('/login')) return null; // never bounce back to login
  return returnTo;
};

/**
 * Where `/addresses` sends the user once an action succeeded.
 *
 * Same trust boundary as `safeReturnTo` (reused, not re-implemented) plus two
 * extras this page needs: it never returns to itself (that would reload the
 * page and lose the snackbar confirming the action), and a missing/invalid
 * returnTo falls back to the account section rather than dumping the user on
 * a bare list with no way onward.
 */
export const addressReturnPath = (returnTo: string | null | undefined): string => {
  const safe = safeReturnTo(returnTo);
  if (!safe || safe === '/addresses' || safe.startsWith('/addresses?') || safe.startsWith('/addresses/')) {
    return '/profile';
  }
  return safe;
};

/** `/addresses?returnTo=…` for a caller that is about to navigate there. */
export const addressesPathFor = (from?: string): string => {
  const safe = safeReturnTo(from);
  return safe ? `/addresses?returnTo=${encodeURIComponent(safe)}` : '/addresses';
};
