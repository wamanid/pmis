# Authentication API Endpoints Summary

## 1. Login Endpoint

**URL:** `POST /api/auth/login/`

**Request:**
```json
{
  "username": "rokello",
  "password": "password123"
}
```

**Response (MFA Not Required):**
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

**Response (MFA Required):**
```json
{
  "message": "MFA code sent. Please verify to complete login.",
  "session_key": "lMeOjDXgEPys20IYZ5ETmLcSdyKF8-ihrfKaxny21No",
  "mfa_required": true,
  "mfa_method": "both"
}
```

---

## 2. MFA Verification Endpoint

**URL:** `POST /api/auth/mfa/verify/`

**Request:**
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
    "profile": {
      "phone_number": "256775065459",
      "phone_verified": false,
      "email_verified": false,
      "mfa_enabled": true,
      "mfa_method": "both",
      "created_at": "2025-10-25T06:20:00.604006Z",
      "updated_at": "2025-10-25T06:28:59.041589Z"
    }
  },
  "access_token": "newAccessToken123",
  "refresh_token": "newRefreshToken456",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read write"
}
```

**Response (Error):**
```json
{
  "error": "Invalid or expired code"
}
```

---

## 3. Resend OTP Endpoint

**URL:** `POST /api/auth/resend-otp/`

**Request:**
```json
{
  "username": "rokello"
}
```

**Response:**
```json
{
  "message": "OTP resent successfully",
  "session_key": "newSessionKey789",
  "mfa_required": true,
  "mfa_method": "both"
}
```

---

## Frontend Implementation

### Request Flow

1. **User enters credentials** → `POST /api/auth/login/`
   
2. **Check `mfa_required` in response:**
   - **If `false` or not present:** Store tokens → Redirect to dashboard
   - **If `true`:** Store `session_key` → Show OTP form

3. **User enters OTP** → `POST /api/auth/mfa/verify/`
   - Send `{ session_key, code }`
   - Store tokens from response → Redirect to dashboard

### LocalStorage Keys

After successful authentication:
- `auth_token` - Access token for API requests
- `refresh_token` - Token for refreshing access token
- `user_data` - JSON string of user object

### Error Handling

All errors are handled by axios interceptors:
- 400: Bad request
- 401: Unauthorized (auto-clears tokens)
- 403: Forbidden
- 404: Not found
- 500: Server error
- Network errors: Connection issues

### Session Management

- `session_key` is stored temporarily during MFA flow
- Cleared after successful verification
- If session expires, user is redirected back to login
