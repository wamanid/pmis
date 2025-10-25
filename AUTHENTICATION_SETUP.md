# Authentication Implementation

## Overview
Implemented backend API integration for the login system with axios interceptors for centralized request/response handling.

## Files Created/Modified

### 1. **src/services/axiosInstance.ts** (NEW)
- Configured axios instance with base URL: `http://localhost:8000/api/`
- **Request Interceptor:**
  - Automatically adds Bearer token from localStorage to all requests
  - Logs requests for debugging
  
- **Response Interceptor:**
  - Handles all HTTP error responses (400, 401, 403, 404, 500)
  - Shows user-friendly toast notifications for errors
  - Auto-clears auth token on 401 (Unauthorized)
  - Handles network errors gracefully

### 2. **src/services/authService.ts** (NEW)
Authentication service with the following functions:

- `login(credentials)` - POST to `/api/auth/login/`
  - Sends username and password
  - Returns OTP sent confirmation and session_id
  
- `verifyOtp(otpData)` - POST to `/api/auth/verify-otp/`
  - Verifies OTP code
  - Stores auth token and user data in localStorage on success
  
- `resendOtp(username)` - POST to `/api/auth/resend-otp/`
  - Resends OTP to user
  
- `logout()` - POST to `/api/auth/logout/`
  - Clears localStorage
  
- `getCurrentUser()` - Get user data from localStorage
- `isAuthenticated()` - Check if user has valid token

### 3. **src/components/authentication/LoginScreen.tsx** (MODIFIED)
Updated to use real API calls:

- `handleCredentialsSubmit` - Calls backend `/api/auth/login/` endpoint
- `handleOtpSubmit` - Calls backend `/api/auth/verify-otp/` endpoint  
- `handleResendOtp` - Calls backend `/api/auth/resend-otp/` endpoint
- Added session_id state management for OTP flow
- Proper error handling with try-catch blocks

## API Endpoints Expected

The backend should implement these endpoints:

1. **POST /api/auth/login/**
   ```json
   Request: { "username": "string", "password": "string" }
   Response: {
     "success": true,
     "message": "OTP sent successfully",
     "data": {
       "otp_sent": true,
       "session_id": "string"
     }
   }
   ```

2. **POST /api/auth/verify-otp/**
   ```json
   Request: { "username": "string", "otp": "string", "session_id": "string" }
   Response: {
     "success": true,
     "message": "Login successful",
     "data": {
       "token": "string",
       "user": {
         "id": "string",
         "username": "string",
         "name": "string",
         "role": "string",
         "station_id": number
       }
     }
   }
   ```

3. **POST /api/auth/resend-otp/**
   ```json
   Request: { "username": "string" }
   Response: {
     "success": true,
     "message": "OTP resent successfully",
     "data": { "session_id": "string" }
   }
   ```

4. **POST /api/auth/logout/**
   ```json
   Request: {}
   Response: { "success": true }
   ```

## Features

✅ Axios interceptors for all API requests
✅ Automatic token management (stored in localStorage)
✅ Centralized error handling with user-friendly messages
✅ Network error detection
✅ Auto-logout on 401 errors
✅ Request/response logging for debugging
✅ Session ID management for OTP flow
✅ TypeScript interfaces for type safety

## Testing

Make sure your backend API is running at `http://localhost:8000/api/` before testing the login flow.

To test:
1. Start the backend server
2. Run `npm run dev` for the frontend
3. Navigate to the login page
4. Enter credentials and verify OTP flow works correctly
