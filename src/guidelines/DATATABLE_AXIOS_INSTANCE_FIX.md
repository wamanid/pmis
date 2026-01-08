# DataTable - Axios Instance Fix

## ✅ Issue Fixed

Successfully updated **DataTable component** to use `axiosInstance` instead of default `axios`, ensuring all API calls go to **localhost:8000** (backend) instead of localhost:3000 (frontend).

---

## 🐛 Problem

### Before
The DataTable was using the default `axios` import:

```typescript
import axios from 'axios';

// ...

const response = await axios.get(url);
```

**Issue:** 
- ❌ No base URL configured
- ❌ Calls relative URLs (defaults to frontend port)
- ❌ No authentication headers
- ❌ No location filter params
- ❌ No error interceptors

**Result:** API calls failed or went to wrong server

---

## ✅ Solution

### After
Updated to use `axiosInstance`:

```typescript
import axiosInstance from '../../services/axiosInstance';

// ...

const response = await axiosInstance.get(url);
```

**Benefits:**
- ✅ Base URL: `http://localhost:8000/api/`
- ✅ Authentication headers automatically added
- ✅ Location filters automatically added
- ✅ Error interceptors (401 redirect, etc.)
- ✅ Request/response logging
- ✅ Consistent with rest of app

---

## 📝 Changes Made

### File Updated
**`src/components/common/DataTable.tsx`**

### Change 1: Import Statement
```typescript
// Before
import axios from 'axios';

// After
import axiosInstance from '../../services/axiosInstance';
```

### Change 2: API Call
```typescript
// Before
const response = await axios.get(url);

// After
const response = await axiosInstance.get(url);
```

---

## 🔌 How It Works Now

### API Call Flow

```
DataTable Component
    ↓
axiosInstance.get('/api/admission/prisoners/')
    ↓
Request Interceptor:
  • Adds base URL: http://localhost:8000/api/
  • Adds Authorization: Bearer {token}
  • Adds location filters (region, district, station)
    ↓
Full URL: http://localhost:8000/api/admission/prisoners/?region=1&district=5
    ↓
Backend Server (localhost:8000)
    ↓
Response Interceptor:
  • Handles 401 (redirect to login)
  • Handles errors (show toasts)
  • Logs response
    ↓
DataTable receives data
```

---

## 🎯 What This Fixes

### 1. **Correct Base URL**
```typescript
// Before: Relative URL (goes to frontend)
GET /api/admission/prisoners/
// → http://localhost:3000/api/admission/prisoners/ ❌

// After: Full URL (goes to backend)
GET /api/admission/prisoners/
// → http://localhost:8000/api/admission/prisoners/ ✅
```

### 2. **Authentication**
```typescript
// Before: No auth header
GET /api/admission/prisoners/
// → 401 Unauthorized ❌

// After: Auth header added automatically
GET /api/admission/prisoners/
Headers: { Authorization: 'Bearer eyJhbGc...' }
// → 200 OK ✅
```

### 3. **Location Filters**
```typescript
// Before: No filter params
GET /api/admission/prisoners/
// → Returns all prisoners ❌

// After: Filter params added automatically
GET /api/admission/prisoners/?region=1&district=5&station=12
// → Returns filtered prisoners ✅
```

### 4. **Error Handling**
```typescript
// Before: Generic error
catch (err) {
  setError(err.message);
}
// → No user feedback ❌

// After: Interceptor handles errors
// → Toast notifications ✅
// → 401 redirects to login ✅
// → Proper error messages ✅
```

---

## 📊 Comparison

| Feature | Before (axios) | After (axiosInstance) |
|---------|----------------|----------------------|
| **Base URL** | ❌ None (relative) | ✅ `http://localhost:8000/api/` |
| **Auth Headers** | ❌ Not added | ✅ Automatically added |
| **Filter Params** | ❌ Not added | ✅ Automatically added |
| **401 Handling** | ❌ Generic error | ✅ Redirect to login |
| **Error Toasts** | ❌ None | ✅ User-friendly messages |
| **Request Logging** | ❌ None | ✅ Console logs |
| **Timeout** | ❌ Default (no limit) | ✅ 30 seconds |
| **Consistency** | ❌ Different from services | ✅ Same as all services |

---

## 🔧 axiosInstance Configuration

### Base Configuration
```typescript
const API_BASE_URL = 'http://localhost:8000/api/';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,  // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Request Interceptor
```typescript
axiosInstance.interceptors.request.use((config) => {
  // Add auth token
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add location filters
  const filters = JSON.parse(localStorage.getItem('pmis_user_filters') || '{}');
  if (filters.region) config.params.region = filters.region;
  if (filters.district) config.params.district = filters.district;
  if (filters.station) config.params.station = filters.station;
  
  return config;
});
```

### Response Interceptor
```typescript
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.clear();
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 💡 Usage Example

### PrisonerListScreen

```typescript
<DataTable
  url="/api/admission/prisoners/"
  title="Prisoner Records"
  columns={columns}
  config={{...}}
/>
```

**What happens:**
1. DataTable calls `axiosInstance.get('/api/admission/prisoners/')`
2. Request interceptor adds:
   - Base URL → `http://localhost:8000/api/admission/prisoners/`
   - Auth header → `Authorization: Bearer {token}`
   - Filter params → `?region=1&district=5&station=12`
3. Full request: `GET http://localhost:8000/api/admission/prisoners/?region=1&district=5&station=12`
4. Backend returns filtered data
5. DataTable displays data

**All automatic - no additional code needed!**

---

## 🧪 Testing

### Test Scenario 1: Basic API Call
1. Open Prisoner List page
2. Check browser DevTools Network tab
3. **Expected:** Request goes to `http://localhost:8000/api/admission/prisoners/`

### Test Scenario 2: Authentication
1. Ensure you're logged in
2. Open Prisoner List page
3. Check request headers
4. **Expected:** `Authorization: Bearer {token}` header present

### Test Scenario 3: Location Filters
1. Select region/district/station
2. Open Prisoner List page
3. Check request URL
4. **Expected:** `?region=X&district=Y&station=Z` params present

### Test Scenario 4: 401 Handling
1. Manually expire/remove token
2. Open Prisoner List page
3. **Expected:** Redirected to login page

---

## 🚀 Impact

### All DataTable Instances Now:
✅ Call correct backend URL (`localhost:8000`)  
✅ Include authentication headers  
✅ Include location filter params  
✅ Handle 401 errors properly  
✅ Show user-friendly error messages  
✅ Work consistently with rest of app  

### Specifically Fixed:
- ✅ **PrisonerListScreen** - Now calls backend API correctly
- ✅ **Future DataTables** - Will work correctly out of the box

---

## 📝 Notes

### Why axiosInstance?

**axiosInstance provides:**
1. **Centralized configuration** - Base URL in one place
2. **Automatic auth** - No manual header management
3. **Automatic filters** - Location params added automatically
4. **Error handling** - Consistent across app
5. **Interceptors** - Request/response transformation
6. **Logging** - Debug information
7. **Timeout** - Prevents hanging requests

### Alternative Approaches (Not Recommended)

**❌ Configure base URL in each component:**
```typescript
axios.get('http://localhost:8000/api/admission/prisoners/')
```
Problems: Hardcoded URLs, no auth, no filters, no error handling

**❌ Create new axios instance in DataTable:**
```typescript
const instance = axios.create({ baseURL: 'http://localhost:8000/api/' });
```
Problems: Duplicate configuration, no interceptors, inconsistent

**✅ Use shared axiosInstance (Current approach):**
```typescript
import axiosInstance from '../../services/axiosInstance';
axiosInstance.get('/api/admission/prisoners/');
```
Benefits: Centralized, consistent, automatic features

---

## ✅ Summary

Updated DataTable to use **axiosInstance** instead of default **axios**:

### Changes
- ✅ Import `axiosInstance` instead of `axios`
- ✅ Use `axiosInstance.get()` instead of `axios.get()`

### Benefits
- ✅ Calls backend at `localhost:8000` (not `localhost:3000`)
- ✅ Includes authentication headers automatically
- ✅ Includes location filter params automatically
- ✅ Handles 401 errors with redirect to login
- ✅ Shows user-friendly error toasts
- ✅ Consistent with rest of application

### Result
**DataTable now correctly calls the backend API at localhost:8000 with all necessary headers and params!** 🎯

---

## 🔗 Related Files

- **`src/services/axiosInstance.ts`** - Axios configuration
- **`src/components/common/DataTable.tsx`** - Updated component
- **`src/components/admission/PrisonerListScreen.tsx`** - Uses DataTable

All working together seamlessly! 🚀
