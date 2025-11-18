# Login Flow - Debugging Guide

## Expected Flow

1. **User enters credentials** → Clicks "Continue"
2. **Frontend calls** `POST /api/auth/login/` with `{ username, password }`
3. **Backend responds** with:
   ```json
   {
     "success": true,
     "message": "OTP sent successfully",
     "data": {
       "otp_sent": true,
       "session_id": "some-session-id"
     }
   }
   ```
4. **Frontend receives response** → Sets `step` to `'otp'` → **OTP form shows**
5. **User enters OTP** → Clicks "Verify & Login"
6. **Frontend calls** `POST /api/auth/verify-otp/` with `{ username, otp, session_id }`
7. **Backend responds** → Stores token → Calls `onLogin()` → User logged in

## Current Implementation

### LoginScreen.tsx - handleCredentialsSubmit (lines 25-59)

```typescript
const handleCredentialsSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!username || !password) {
    toast.error('Please enter both username and password');
    return;
  }

  setLoading(true);
  
  try {
    const response = await login({ username, password });
    
    if (response.success) {  // ✅ Check if success is true
      if (response.data?.session_id) {
        setSessionId(response.data.session_id);
      }
      
      setStep('otp');  // ✅ THIS SHOWS THE OTP FORM
      toast.success(response.message || 'OTP sent to your registered device');
    } else {
      toast.error(response.error || 'Login failed. Please try again.');
    }
  } catch (error: any) {
    console.error('Login error:', error);
    if (!error.response) {
      toast.error('Failed to connect to server. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};
```

## Debugging Steps

### 1. Check Browser Console
Open DevTools (F12) and check the Console tab for:
- `API Request:` log showing the login request
- `API Response:` log showing the backend response
- Any error messages

### 2. Verify Backend Response Format
The backend MUST return:
```json
{
  "success": true,  // ← MUST be true to show OTP form
  "message": "OTP sent successfully",
  "data": {
    "otp_sent": true,
    "session_id": "..."  // Optional but recommended
  }
}
```

### 3. Common Issues

#### Issue: OTP form doesn't show
**Cause:** Backend returns `success: false` or error status code
**Solution:** Check backend logs and ensure it returns `success: true` on valid credentials

#### Issue: Error toast shows instead
**Cause:** Backend returns 4xx/5xx status code
**Solution:** Backend should return 200 status with `success: true`

#### Issue: Network error
**Cause:** Backend not running or wrong URL
**Solution:** 
- Ensure backend is running at `http://localhost:8000`
- Check CORS settings on backend
- Verify API endpoint is `/api/auth/login/`

### 4. Test with curl

```bash
# Test login endpoint
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'
```

Expected response:
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "otp_sent": true,
    "session_id": "abc123"
  }
}
```

## Response Field Handling

The code now handles both `message` and `error` fields:
- Success case: Uses `response.message`
- Failure case: Uses `response.error` (falls back to `response.message`)

This accommodates different backend response formats.
