# MFA-Conditional Login Implementation

## Overview
Updated the authentication flow to handle conditional MFA (Multi-Factor Authentication) based on backend response. The system now:
- **If `mfa_required = false`**: Stores tokens immediately and redirects to Station Dashboard
- **If `mfa_required = true`**: Shows OTP form for verification

## Changes Made

### 1. Updated Response Interfaces (`src/services/authService.ts`)

#### New Interfaces
```typescript
export interface UserProfile {
  phone_number: string;
  phone_verified: boolean;
  email_verified: boolean;
  mfa_enabled: boolean;  // ← Key field for MFA check
  mfa_method: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: UserProfile;
}

export interface LoginResponse {
  message: string;
  error?: string;
  // MFA required response
  mfa_required?: boolean;
  mfa_method?: string;
  session_key?: string;
  // Successful login response (no MFA)
  user?: User;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
}
```

#### Updated `login()` Function
- Now checks `response.mfa_required`
- If `false` (or not present), stores tokens immediately in localStorage:
  - `auth_token` (access_token)
  - `refresh_token`
  - `user_data` (full user object)
- If `true`, stores `session_key` for OTP verification

### 2. Updated Login Handler (`src/components/authentication/LoginScreen.tsx`)

#### New Flow in `handleCredentialsSubmit()`
```typescript
const response = await login({ username, password });

if (response.mfa_required) {
  // MFA required - show OTP form
  setSessionId(response.session_key);
  setStep('otp');
  toast.success('OTP sent to your registered device');
} else {
  // MFA not required - tokens already stored, redirect
  toast.success('Login successful!');
  onLogin(); // Triggers redirect to dashboard
}
```

### 3. Updated App Routing (`src/App.tsx`)

#### Updated `handleLogin()` Function
```typescript
const handleLogin = () => {
  setIsAuthenticated(true);
  setActivePage("station-management-lockup"); // Redirects to Station Dashboard
};
```

## Login Flow Diagram

### MFA Not Required Flow
```
User enters credentials
    ↓
POST /api/auth/login/
    ↓
Backend returns: { mfa_required: false, access_token, user, ... }
    ↓
Frontend stores tokens in localStorage
    ↓
Calls onLogin()
    ↓
Redirects to Station Dashboard
```

### MFA Required Flow
```
User enters credentials
    ↓
POST /api/auth/login/
    ↓
Backend returns: { mfa_required: true, session_key, mfa_method, ... }
    ↓
Frontend shows OTP form
    ↓
User enters OTP
    ↓
POST /api/auth/mfa/verify/ with { session_key, code }
    ↓
Backend returns tokens and user data
    ↓
Frontend stores tokens
    ↓
Redirects to Station Dashboard
```

## Backend Response Format

### Login Response (MFA Not Required)
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "rokello",
    "email": "robinson.okello@pmis.go.ug",
    "first_name": "Robinson",
    "last_name": "Okello",
    "profile": {
      "phone_number": "256775065459",
      "phone_verified": false,
      "email_verified": false,
      "mfa_enabled": false,
      "mfa_method": "both",
      "created_at": "2025-10-25T06:20:00.604006Z",
      "updated_at": "2025-10-25T06:28:59.041589Z"
    }
  },
  "access_token": "1igrhr0sG4WksD9TdXIOnEzc3EA0Um",
  "refresh_token": "fO8h6j3UNxYP3tfmR70zvfBYw2U9GJ",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read write"
}
```

### Login Response (MFA Required)
```json
{
  "message": "MFA code sent. Please verify to complete login.",
  "session_key": "lMeOjDXgEPys20IYZ5ETmLcSdyKF8-ihrfKaxny21No",
  "mfa_required": true,
  "mfa_method": "both"
}
```

### MFA Verification Request
**Endpoint:** `POST /api/auth/mfa/verify/`

**Request Body:**
```json
{
  "session_key": "lMeOjDXgEPys20IYZ5ETmLcSdyKF8-ihrfKaxny21No",
  "code": "123456"
}
```

**Response (Success):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "rokello",
    "email": "robinson.okello@pmis.go.ug",
    "first_name": "Robinson",
    "last_name": "Okello",
    "profile": { ... }
  },
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read write"
}
```

## LocalStorage Data

### Stored After Successful Login (MFA disabled)
```javascript
localStorage.setItem('auth_token', response.access_token);
localStorage.setItem('refresh_token', response.refresh_token);
localStorage.setItem('user_data', JSON.stringify(response.user));
```

### Stored After OTP Verification (MFA enabled)
Same as above, but stored after OTP verification instead of initial login.

## Testing

### Test MFA Not Required
1. Login with user where backend returns `mfa_required: false` (or no `mfa_required` field)
2. Should immediately redirect to Station Dashboard
3. Check localStorage for `auth_token`, `refresh_token`, and `user_data`

### Test MFA Required
1. Login with user where backend returns `mfa_required: true`
2. Should show OTP form
3. Check that `session_key` is stored
4. Enter OTP
5. Should redirect to Station Dashboard after verification

## Files Modified

1. ✅ `src/services/authService.ts` - Updated interfaces and login function
2. ✅ `src/components/authentication/LoginScreen.tsx` - Updated login handler
3. ✅ `src/App.tsx` - Set default page after login

## Key Features

✅ Conditional MFA based on `mfa_required` flag in response  
✅ Automatic token storage for non-MFA users  
✅ Session key tracking for MFA flow  
✅ Proper error handling for both flows  
✅ Redirects to Station Dashboard after successful login  
✅ Supports both `mfa_method` types (email, SMS, both)  
✅ Maintains existing OTP verification flow for MFA users
