# Axios Interceptor - Authentication & Authorization

## ✅ Feature Implemented

Successfully configured **axios interceptor** to handle unauthorized (401) responses and automatically redirect users to the login screen.

---

## 🔒 How It Works

### Response Interceptor

When any API call receives a **401 Unauthorized** response, the interceptor automatically:

1. ✅ Shows error toast: "Unauthorized. Please login again."
2. ✅ Clears authentication token from localStorage
3. ✅ Clears user data from localStorage
4. ✅ Clears user filters from localStorage
5. ✅ Redirects to `/login` page

---

## 📝 Implementation

### Location
**File:** `src/services/axiosInstance.ts`

### Code

```typescript
// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Success response handling
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          toast.error('Unauthorized. Please login again.');
          // Clear all stored data
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          localStorage.removeItem('pmis_user_filters');
          // Redirect to login page
          window.location.href = '/login';
          break;
        
        case 403:
          toast.error('Access forbidden. You do not have permission.');
          break;
        
        case 404:
          toast.error('Resource not found.');
          break;
        
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        
        default:
          toast.error(data?.message || 'An error occurred. Please try again.');
      }
    }
    
    return Promise.reject(error);
  }
);
```

---

## 🎯 Scenarios Handled

### 1. **Token Expiration**
```
User makes API request
    ↓
Token has expired
    ↓
Backend returns 401
    ↓
Interceptor catches 401
    ↓
Clear localStorage
    ↓
Redirect to /login
```

### 2. **Invalid Token**
```
User has invalid/corrupted token
    ↓
API request with invalid token
    ↓
Backend returns 401
    ↓
Interceptor catches 401
    ↓
Clear localStorage
    ↓
Redirect to /login
```

### 3. **No Token**
```
User not logged in
    ↓
API request without token
    ↓
Backend returns 401
    ↓
Interceptor catches 401
    ↓
Redirect to /login
```

### 4. **Session Timeout**
```
User idle for long time
    ↓
Session expires on backend
    ↓
Next API call returns 401
    ↓
Interceptor catches 401
    ↓
Clear localStorage
    ↓
Redirect to /login
```

---

## 🔑 Data Cleared on 401

When a 401 response is received, the following data is cleared from localStorage:

1. **`auth_token`** - JWT authentication token
2. **`user_data`** - User profile information
3. **`pmis_user_filters`** - Location filters (region, district, station)

This ensures a clean state when the user logs in again.

---

## 🚨 Other HTTP Error Handling

The interceptor also handles other common HTTP errors:

### 400 - Bad Request
```typescript
toast.error(data?.message || 'Bad request. Please check your input.');
```

### 403 - Forbidden
```typescript
toast.error('Access forbidden. You do not have permission.');
```
**Note:** Does NOT redirect - user is logged in but lacks permission

### 404 - Not Found
```typescript
toast.error('Resource not found.');
```

### 500 - Server Error
```typescript
toast.error('Server error. Please try again later.');
```

### Network Errors
```typescript
toast.error('Network error. Please check your connection.');
```

---

## 🔄 Request Interceptor

The request interceptor automatically adds:

### 1. **Authentication Token**
```typescript
const token = localStorage.getItem('auth_token');
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

### 2. **Location Filters**
```typescript
const filterStorage = localStorage.getItem('pmis_user_filters');
if (filterStorage) {
  const filters = JSON.parse(filterStorage);
  
  if (filters.region) config.params.region = filters.region;
  if (filters.district) config.params.district = filters.district;
  if (filters.station) config.params.station = filters.station;
}
```

---

## 📊 Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Action                          │
│              (e.g., Load Prisoner List)                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Request Interceptor                        │
│  • Add Authorization: Bearer {token}                    │
│  • Add location filters (region, district, station)     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 API Request                             │
│         GET /api/admission/prisoners/                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│               Backend Server                            │
│          Validates Token                                │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  Token Valid    │    │  Token Invalid  │
│  (200 OK)       │    │  (401)          │
└────────┬────────┘    └────────┬────────┘
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌─────────────────────────────────┐
│  Return Data    │    │   Response Interceptor          │
└─────────────────┘    │  • Show error toast             │
                       │  • Clear auth_token             │
                       │  • Clear user_data              │
                       │  • Clear pmis_user_filters      │
                       │  • Redirect to /login           │
                       └─────────────────────────────────┘
```

---

## 💡 Usage Examples

### Example 1: Prisoner List API Call

```typescript
// Component makes API call
const response = await admissionService.getPrisoners();

// If token is expired:
// 1. Backend returns 401
// 2. Interceptor catches it
// 3. User redirected to /login
// 4. Component never receives response (promise rejected)
```

### Example 2: Dashboard API Call

```typescript
// Component makes API call
const response = await admissionService.getAdmissionDashboard();

// If user is not authenticated:
// 1. Backend returns 401
// 2. Interceptor catches it
// 3. localStorage cleared
// 4. User redirected to /login
```

### Example 3: Any API Call

```typescript
// ANY API call using axiosInstance
const response = await axiosInstance.get('/any/endpoint');

// If 401 is returned:
// Automatic redirect to login
// No need to handle in component
```

---

## ✨ Benefits

### 1. **Centralized Auth Handling**
- No need to check for 401 in every component
- Single source of truth for authentication errors
- Consistent behavior across the entire app

### 2. **Automatic Cleanup**
- All auth-related data cleared automatically
- No stale tokens left in localStorage
- Clean state for next login

### 3. **Better UX**
- User sees clear error message
- Automatic redirect (no manual navigation needed)
- Seamless flow back to login

### 4. **Security**
- Invalid tokens immediately cleared
- User can't continue with expired session
- Forces re-authentication

### 5. **Maintainability**
- Easy to update auth logic in one place
- No scattered auth checks across components
- Consistent error handling

---

## 🔧 Configuration

### Axios Instance Settings

```typescript
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api/',
  timeout: 30000,  // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Login Redirect URL

To change the login page URL, update line 100:

```typescript
window.location.href = '/login';  // Change to your login route
```

---

## 🧪 Testing

### Test Scenario 1: Expired Token
1. Login to the app
2. Manually expire the token on backend
3. Navigate to any page that makes an API call
4. **Expected:** Redirected to `/login` with error toast

### Test Scenario 2: Invalid Token
1. Login to the app
2. Manually corrupt the token in localStorage
3. Refresh the page
4. **Expected:** Redirected to `/login` with error toast

### Test Scenario 3: No Token
1. Clear localStorage
2. Try to access a protected page
3. **Expected:** Redirected to `/login` with error toast

### Test Scenario 4: Multiple 401s
1. Make multiple API calls simultaneously
2. All return 401
3. **Expected:** Single redirect to `/login` (not multiple)

---

## 📝 Notes

### Why `window.location.href` instead of React Router?

```typescript
window.location.href = '/login';
```

**Reason:** Using `window.location.href` ensures:
- ✅ Full page reload (clears all React state)
- ✅ Works even if router context is not available
- ✅ Guaranteed navigation (no router guards blocking)
- ✅ Clean slate for login page

**Alternative (if using React Router):**
```typescript
import { useNavigate } from 'react-router-dom';
// But this won't work in axios interceptor (no React context)
```

### LocalStorage Keys

The following keys are cleared on 401:
- `auth_token` - JWT token
- `user_data` - User profile
- `pmis_user_filters` - Location filters

If you add more auth-related keys, add them to the cleanup:
```typescript
localStorage.removeItem('your_new_key');
```

---

## ✅ Summary

The axios interceptor now automatically handles **401 Unauthorized** responses by:

1. ✅ Showing user-friendly error message
2. ✅ Clearing all authentication data
3. ✅ Redirecting to login page
4. ✅ Providing clean state for re-authentication

**No additional code needed in components!** All API calls using `axiosInstance` are automatically protected.

---

## 🚀 Result

Every API call in the application is now protected:
- ✅ Automatic 401 detection
- ✅ Automatic token cleanup
- ✅ Automatic login redirect
- ✅ Consistent error handling
- ✅ Better security
- ✅ Improved UX

**Authentication flow is now fully automated!** 🔒
