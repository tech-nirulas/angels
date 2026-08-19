// features/auth/msg91Widget.ts
//
// Single source of truth for the MSG91 OTP widget.
//
// WHY THIS IS A MODULE-LEVEL SINGLETON (do not "simplify" this into a hook that
// re-initialises per component):
//
// MSG91's otp-provider.js binds its exposed methods to `window` exactly once,
// permanently, and bound to the FIRST widget instance:
//
//   exposeMethodsToWindow() {
//     !window.hasOwnProperty("sendOtp") && ... && Object.defineProperties(window, {
//       sendOtp:   { value: (n,r,o)       => this.sendOtpExposed(n,r,o),   writable:false, configurable:false },
//       verifyOtp: { value: (n,r,o,s=null)=> this.verifyOtpExposed(n,r,o,s), writable:false, configurable:false },
//     })
//   }
//
// while initSendOTP() DESTROYS the previous instance every time it is called:
//
//   const i = document.querySelector("msg91-otp-provider");
//   i && document.body.removeChild(i);
//   const n = document.createElement("msg91-otp-provider"); ...
//
// So a second initSendOTP() call (e.g. client-side navigation between two pages
// that each initialise the widget) tears down instance #1's DOM node and builds
// instance #2 — but `window.verifyOtp` still routes into the destroyed instance
// #1, whose subscriptions are gone. Its callbacks then never fire, OTP
// verification silently stalls, and no login request is ever made.
//
// Initialising exactly once per page load is therefore a correctness
// requirement, not an optimisation.

const MSG91_SCRIPT_SRC = 'https://verify.msg91.com/otp-provider.js';

const WIDGET_ID =
  process.env.NEXT_PUBLIC_MSG91_WIDGET_ID || '366644664c4a323237353039';
const TOKEN_AUTH =
  process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH || '512331Tv4ORqfJ6a436578P1';

let widgetReady: Promise<void> | null = null;

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof (window as any).initSendOTP === 'function') {
      resolve();
      return;
    }

    const existing = document.querySelector(
      `script[src="${MSG91_SCRIPT_SRC}"]`
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Failed to load the MSG91 OTP script.')),
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = MSG91_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Failed to load the MSG91 OTP script.'));
    document.head.appendChild(script);
  });
}

// initSendOTP() creates the widget element, but the component only publishes
// window.sendOtp/window.verifyOtp later, from inside its own async init.
function waitForExposedMethods(timeoutMs = 15000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const tick = () => {
      const win = window as any;
      if (
        typeof win.sendOtp === 'function' &&
        typeof win.verifyOtp === 'function'
      ) {
        resolve();
        return;
      }
      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error('MSG91 widget did not finish initialising.'));
        return;
      }
      setTimeout(tick, 100);
    };
    tick();
  });
}

/** Loads and initialises the MSG91 widget exactly once per page load. */
export function ensureMsg91Widget(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(
      new Error('The MSG91 widget requires a browser environment.')
    );
  }

  if (widgetReady) return widgetReady;

  widgetReady = loadScript()
    .then(() => {
      const initSendOTP = (window as any).initSendOTP;
      if (typeof initSendOTP !== 'function') {
        throw new Error('MSG91 script loaded but initSendOTP is unavailable.');
      }

      initSendOTP({
        widgetId: WIDGET_ID,
        tokenAuth: TOKEN_AUTH,
        exposeMethods: true,
        // The SDK throws if `success` is missing, but real handling lives in the
        // per-call callbacks passed to sendOtp/verifyOtp below. MSG91's docs say
        // listening to both fires two events for the same result, so these stay
        // diagnostic-only.
        success: (data: any) =>
          console.log(
            '[MSG91] global success (diagnostic only). keys:',
            Object.keys(data || {})
          ),
        failure: (err: any) =>
          console.log('[MSG91] global failure (diagnostic only):', err),
      });

      return waitForExposedMethods();
    })
    .catch((err) => {
      // Allow a later retry rather than caching the failure forever.
      widgetReady = null;
      throw err;
    });

  return widgetReady;
}

/** MSG91 expects a country-code-prefixed number; default to India (91). */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('91') ? digits : `91${digits}`;
}

/**
 * The MSG91 access token (a JWT) as returned by verifyOtp. MSG91's docs leave
 * the verifyOtp sample response blank, so the field order here is empirical:
 * it yields the JWT that /widget/verifyAccessToken documents as
 * "JWT access_token from verify OTP API".
 */
function extractAccessToken(response: any): string | undefined {
  return (
    response?.message ||
    response?.data ||
    response?.['access-token'] ||
    response?.token ||
    undefined
  );
}

/** Sends an OTP and resolves with the reqId to use for verification. */
export async function sendPhoneOtp(phone: string): Promise<string | undefined> {
  await ensureMsg91Widget();

  return new Promise((resolve, reject) => {
    (window as any).sendOtp(
      normalizePhone(phone),
      (data: any) => {
        const reqId = data?.reqId ?? data?.reqid ?? data?.message ?? undefined;
        console.log('[MSG91] sendOtp success. reqId captured:', !!reqId);
        resolve(reqId);
      },
      (err: any) =>
        reject(
          new Error(
            typeof err === 'string'
              ? err
              : err?.message || 'Failed to send SMS OTP'
          )
        )
    );
  });
}

/** Verifies an OTP and resolves with the MSG91 access token. */
export async function verifyPhoneOtp(
  otp: string,
  reqId?: string
): Promise<string> {
  await ensureMsg91Widget();

  return new Promise((resolve, reject) => {
    console.log('[MSG91] verifyOtp called. reqId present:', !!reqId);
    (window as any).verifyOtp(
      otp,
      (response: any) => {
        const token = extractAccessToken(response);
        console.log('[MSG91] verifyOtp response diagnostic:', {
          keys: Object.keys(response || {}),
          tokenLength: token?.length,
          tokenParts: token?.split('.')?.length,
        });
        if (!token) {
          reject(
            new Error('OTP verified but no access token was returned.')
          );
          return;
        }
        resolve(token);
      },
      (err: any) =>
        reject(
          new Error(
            typeof err === 'string'
              ? err
              : err?.message || 'OTP verification failed'
          )
        ),
      reqId
    );
  });
}
