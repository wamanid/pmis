# Changelog

All notable changes to this project should be documented in this file.

## [Unreleased] - YYYY-MM-DD

### Fixed
- Hardened client-side authentication flow to reduce XSS and sensitive-data leaks:
  - Centralized storage access using safeSetItem / safeGetItem / safeRemoveItem.
  - Replaced direct localStorage calls with the safe helpers in src/services/authService.ts.
  - Ensured tokens and user data are set/cleared consistently via setAuth() / clearAuth().

### Security
- Removed/disabled debug logging that could expose Authorization headers or full response bodies:
  - Updated src/services/axiosInstance.ts to avoid logging request/response headers and bodies in all environments; included only minimal, non-sensitive debug markers (disabled in production).
  - On 401 responses axiosInstance now clears stored auth data and shows a generic "Unauthorized" message instead of logging full error objects.

### Changed
- src/services/authService.ts
  - Added TypeScript-safe storage wrappers and used them across login, verifyOtp, resendOtp, logout flows.
  - Persisted user JSON in a single key and parse safely when reading.

- src/services/axiosInstance.ts
  - Wrapped localStorage reads in try/catch.
  - Standardized user-friendly toast messages by status code (400, 401, 403, 404, 500).
  - Avoided printing complete error objects to the console.

- src/components/authentication/LoginScreen.tsx
  - Removed console.error usage to prevent accidental sensitive data leaks.
  - Disabled double-submit points (removed onClick duplicate handlers) and ensured loading state is always cleared on all code paths.
  - Added fallbacks for network errors when axios interceptor doesn't provide a response.

### Notes / Recommendations
- Prefer httpOnly, Secure, SameSite cookies for tokens (server change required) to eliminate JS-readable tokens in localStorage.
- Add Content Security Policy (CSP) headers and sanitize any server-provided HTML/messages before rendering.
- Implement rate limiting and brute-force protections on login/OTP endpoints backend-side.
- Run a repository-wide search to remove any remaining console.* calls and direct localStorage usage:
  - grep -RIn "console\." src || true
  - grep -RIn "localStorage" src || true
  - grep -RIn "dangerouslySetInnerHTML" src || true

## Previous releases
- (Populate as you create releases)