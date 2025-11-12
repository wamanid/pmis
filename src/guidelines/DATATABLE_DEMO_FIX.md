# DataTable Demo - Mock API Fix

## Issue
The demo APIs were getting 304 (Not Modified) status codes because:
1. The DataTable component uses **axios** for HTTP requests
2. The demo was using `window.fetch` interceptor
3. Axios was making actual HTTP requests to `/api/demo/*` endpoints
4. Browser was returning cached 304 responses

## Solution
Replaced `window.fetch` interceptor with **axios interceptors** to properly mock the API.

## Changes Made

### File: `src/components/common/DataTable.demo.tsx`

#### 1. Added axios import
```tsx
import axios from 'axios';
```

#### 2. Replaced fetch interceptor with axios interceptors
- **Request Interceptor**: Intercepts requests to `/api/demo/*` URLs
- **Response Interceptor**: Handles mock responses properly
- Returns mock data without making actual HTTP requests

#### 3. Added setup and cleanup functions
```tsx
const setupMockApi = () => {
  // Sets up axios interceptors for mock API
};

const cleanupMockApi = () => {
  // Removes interceptors when component unmounts
};
```

#### 4. Updated component lifecycle
```tsx
useEffect(() => {
  setupMockApi();  // Setup on mount
  setMounted(true);
  
  return () => {
    cleanupMockApi();  // Cleanup on unmount
  };
}, []);
```

## How It Works

### Before (Broken)
```
DataTable Component
    ↓
  axios.get('/api/demo/users')
    ↓
  Actual HTTP Request
    ↓
  Browser Cache (304 Not Modified)
    ↓
  Error or stale data
```

### After (Fixed)
```
DataTable Component
    ↓
  axios.get('/api/demo/users')
    ↓
  Axios Request Interceptor
    ↓
  Check if URL starts with '/api/demo/'
    ↓
  Return mock data immediately
    ↓
  No actual HTTP request made
    ↓
  Fresh data every time
```

## Benefits

1. ✅ **No 304 errors** - No actual HTTP requests are made
2. ✅ **Fresh data** - Mock data is returned directly, no caching
3. ✅ **Simulated delay** - 500ms delay to simulate network latency
4. ✅ **Clean lifecycle** - Interceptors are properly cleaned up on unmount
5. ✅ **No side effects** - Only affects `/api/demo/*` URLs

## Testing

To verify the fix:

1. Navigate to `/demo/datatable`
2. Open browser DevTools → Network tab
3. You should see:
   - **No actual HTTP requests** to `/api/demo/*`
   - Tables load with mock data
   - All features work (search, sort, pagination, export)

## Mock API Endpoints

The following endpoints are mocked:

- `/api/demo/users` - 15 user records
- `/api/demo/products` - 8 product records

## Adding More Mock Endpoints

To add more mock endpoints:

1. Add data to `mockApiServer` object:
```tsx
const mockApiServer = {
  '/api/demo/users': [...],
  '/api/demo/products': [...],
  '/api/demo/your-new-endpoint': [
    // Your mock data here
  ],
};
```

2. Use in DataTable:
```tsx
<DataTable
  url="/api/demo/your-new-endpoint"
  title="Your Table"
  columns={columns}
/>
```

## Notes

- The axios interceptor is **scoped to the demo component**
- It's automatically cleaned up when navigating away
- It only affects URLs starting with `/api/demo/`
- Real API calls to other endpoints work normally
- The 500ms delay simulates realistic network conditions

## Technical Details

### Request Interceptor
- Checks if URL starts with `/api/demo/`
- Simulates 500ms network delay
- Returns mock data by throwing a custom response object
- Prevents actual HTTP request from being made

### Response Interceptor
- Catches the "thrown" mock response
- Returns it as a successful response
- Allows real errors to pass through normally

This approach ensures the demo works perfectly without needing a backend API!
