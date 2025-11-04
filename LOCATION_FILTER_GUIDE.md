# Location Filter System - Implementation Guide

## 📦 What Was Created

A comprehensive location filtering system that persists user selections and automatically includes them in all API requests.

### Components Created

#### 1. **FilterContext** (`src/contexts/FilterContext.tsx`)
Global state management for location filters.

**Features:**
- ✅ Manages region, district, and station selections
- ✅ Persists to localStorage automatically
- ✅ Provides filter parameters for API requests
- ✅ Cascading clear (changing region clears district and station)
- ✅ React Context API for global access

**API:**
```typescript
interface FilterContextType {
  region: string;
  district: string;
  station: string;
  setRegion: (value: string) => void;
  setDistrict: (value: string) => void;
  setStation: (value: string) => void;
  getFilterParams: () => Record<string, string>;
  clearFilters: () => void;
}
```

#### 2. **LocationFilter Component** (`src/components/common/LocationFilter.tsx`)
UI component for selecting location filters.

**Features:**
- ✅ Popover interface with filter dropdowns
- ✅ Badge showing active filter count
- ✅ Cascading selection (region → district → station)
- ✅ Clear all filters button
- ✅ Responsive design
- ✅ Integrated with FilterContext

#### 3. **Updated TopBar** (`src/components/layout/TopBar.tsx`)
Added LocationFilter to the top navigation bar.

**Location:** Between menu toggle and notifications

#### 4. **Updated axiosInstance** (`src/services/axiosInstance.ts`)
Automatically includes filter parameters in all API requests.

**Features:**
- ✅ Reads filters from localStorage
- ✅ Adds to query parameters automatically
- ✅ Doesn't override existing params
- ✅ Works with all API calls

---

## 🚀 How It Works

### 1. User Flow

```
User logs in
    ↓
Opens LocationFilter in TopBar
    ↓
Selects Region
    ↓
Selects District (filtered by region)
    ↓
Selects Station (filtered by district)
    ↓
Filters saved to localStorage
    ↓
All API requests include these filters automatically
```

### 2. Data Flow

```
LocationFilter Component
    ↓
useFilters() hook
    ↓
FilterContext (global state)
    ↓
localStorage (persistence)
    ↓
axiosInstance interceptor
    ↓
API Request (with filter params)
```

### 3. Cascading Behavior

When user changes a parent filter, child filters are automatically cleared:

```typescript
// Changing region clears district and station
setRegion('new-region-id')
  → district = ''
  → station = ''

// Changing district clears station
setDistrict('new-district-id')
  → station = ''
```

---

## 💡 Usage

### Using the LocationFilter Component

The component is already integrated in the TopBar. Users can:

1. Click the "Location Filter" button in the top bar
2. Select region, district, and station
3. Filters are automatically saved and applied

### Using Filters in Your Code

#### Access Current Filters

```tsx
import { useFilters } from '@/contexts/FilterContext';

function MyComponent() {
  const { region, district, station } = useFilters();

  return (
    <div>
      <p>Current Region: {region}</p>
      <p>Current District: {district}</p>
      <p>Current Station: {station}</p>
    </div>
  );
}
```

#### Update Filters Programmatically

```tsx
import { useFilters } from '@/contexts/FilterContext';

function MyComponent() {
  const { setRegion, setDistrict, setStation } = useFilters();

  const handleSelectLocation = () => {
    setRegion('region-uuid');
    setDistrict('district-uuid');
    setStation('station-uuid');
  };

  return (
    <button onClick={handleSelectLocation}>
      Set Location
    </button>
  );
}
```

#### Get Filter Parameters

```tsx
import { useFilters } from '@/contexts/FilterContext';

function MyComponent() {
  const { getFilterParams } = useFilters();

  const loadData = async () => {
    const filters = getFilterParams();
    // Returns: { region: 'uuid', district: 'uuid', station: 'uuid' }
    
    const response = await fetch('/api/data', {
      params: filters
    });
  };

  return <button onClick={loadData}>Load Data</button>;
}
```

#### Clear All Filters

```tsx
import { useFilters } from '@/contexts/FilterContext';

function MyComponent() {
  const { clearFilters } = useFilters();

  return (
    <button onClick={clearFilters}>
      Clear All Filters
    </button>
  );
}
```

---

## 🔧 Automatic API Integration

### How It Works

The axios interceptor automatically adds filter parameters to **all** API requests:

```typescript
// Your code
const response = await axiosInstance.get('/api/prisoners/');

// Actual request sent
GET /api/prisoners/?region=uuid&district=uuid&station=uuid
```

### Override Filters for Specific Requests

If you need to make a request without filters or with different filters:

```typescript
// Without filters
const response = await axiosInstance.get('/api/data', {
  params: { region: undefined, district: undefined, station: undefined }
});

// With custom filters
const response = await axiosInstance.get('/api/data', {
  params: { region: 'different-uuid' }
});
```

### Requests That Include Filters

✅ **Automatically included:**
- GET requests with query parameters
- POST/PUT/PATCH requests (filters in query params)
- All API calls through axiosInstance

❌ **Not included:**
- Requests with explicit filter params already set
- Direct fetch() calls (use axiosInstance instead)

---

## 📋 Component Details

### LocationFilter Component

**Visual Design:**
```
┌─────────────────────────┐
│ 📍 Location Filter  [2] │ ← Button with badge
└─────────────────────────┘
         ↓ (Click)
┌─────────────────────────────┐
│ Filter by Location          │
│ Select your location to     │
│ filter data across system   │
│                             │
│ Region                      │
│ [Select region...      ▼]   │
│                             │
│ District                    │
│ [Select district...    ▼]   │
│ Select a region first       │
│                             │
│ Station                     │
│ [Select station...     ▼]   │
│ Select a district first     │
│                             │
│ ─────────────────────────── │
│ 2 filters active  [Clear]   │
└─────────────────────────────┘
```

**Badge Behavior:**
- Shows count of active filters (1-3)
- Hidden when no filters active
- Blue background with white text

**Popover Behavior:**
- Opens on click
- Closes when clicking outside
- Stays open when interacting with dropdowns

---

## 🎯 localStorage Structure

### Storage Key
```
pmis_user_filters
```

### Data Format
```json
{
  "region": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "district": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "station": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

### Persistence
- Saved automatically on every change
- Loaded on app initialization
- Cleared on logout (optional - implement in AuthContext)
- Survives page refresh

---

## 🔒 Security Considerations

### Filter Validation

The backend should validate filter parameters:

```python
# Backend example
def get_prisoners(request):
    region = request.GET.get('region')
    district = request.GET.get('district')
    station = request.GET.get('station')
    
    # Validate user has access to these locations
    if not user_has_access(request.user, region, district, station):
        return HttpResponseForbidden()
    
    # Apply filters
    queryset = Prisoner.objects.all()
    if region:
        queryset = queryset.filter(region=region)
    if district:
        queryset = queryset.filter(district=district)
    if station:
        queryset = queryset.filter(station=station)
    
    return queryset
```

### User Permissions

Consider implementing:
- User-specific location restrictions
- Role-based filter access
- Audit logging of filter changes

---

## 🎨 Customization

### Change Filter Storage Key

```typescript
// In FilterContext.tsx
const STORAGE_KEY = 'your_custom_key';
```

### Add More Filters

```typescript
// In FilterContext.tsx
interface FilterContextType {
  region: string;
  district: string;
  station: string;
  category: string;  // New filter
  // ... rest
}

// Add state and methods
const [category, setCategoryState] = useState<string>('');

// Add to getFilterParams
const getFilterParams = (): Record<string, string> => {
  const params: Record<string, string> = {};
  if (region) params.region = region;
  if (district) params.district = district;
  if (station) params.station = station;
  if (category) params.category = category;  // New
  return params;
};
```

### Customize Badge Appearance

```tsx
// In LocationFilter.tsx
<Badge 
  variant="default"  // Change to: destructive, outline, secondary
  className="ml-2 h-5 px-1.5 text-xs"
>
  {activeFilterCount}
</Badge>
```

### Change Popover Width

```tsx
// In LocationFilter.tsx
<PopoverContent className="w-96" align="end">  // Changed from w-80
```

---

## 🐛 Troubleshooting

### Filters Not Persisting

**Cause:** localStorage not available or disabled

**Solution:**
```typescript
// Check if localStorage is available
if (typeof window !== 'undefined' && window.localStorage) {
  // Use localStorage
}
```

### Filters Not Applied to Requests

**Cause:** Not using axiosInstance

**Solution:**
```typescript
// ❌ Wrong
const response = await fetch('/api/data');

// ✅ Correct
import axiosInstance from '@/services/axiosInstance';
const response = await axiosInstance.get('/api/data');
```

### Filters Showing Wrong Data

**Cause:** Cached filter values

**Solution:**
```typescript
// Clear filters and reload
const { clearFilters } = useFilters();
clearFilters();
window.location.reload();
```

### Cascading Not Working

**Cause:** Using setState directly instead of context methods

**Solution:**
```typescript
// ❌ Wrong
setRegionState('new-value');

// ✅ Correct
const { setRegion } = useFilters();
setRegion('new-value');
```

---

## 📚 Integration Examples

### Example 1: Dashboard with Filters

```tsx
import { useFilters } from '@/contexts/FilterContext';
import { useEffect, useState } from 'react';

function Dashboard() {
  const { region, district, station } = useFilters();
  const [data, setData] = useState(null);

  useEffect(() => {
    // Data automatically filtered by axios interceptor
    loadDashboardData();
  }, [region, district, station]);

  const loadDashboardData = async () => {
    const response = await axiosInstance.get('/api/dashboard/stats');
    setData(response.data);
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {region && <p>Filtered by Region: {region}</p>}
      {/* Display data */}
    </div>
  );
}
```

### Example 2: Report with Filter Override

```tsx
import { useFilters } from '@/contexts/FilterContext';

function Report() {
  const { getFilterParams } = useFilters();

  const generateReport = async (includeAllStations: boolean) => {
    const filters = includeAllStations 
      ? { region: getFilterParams().region }  // Only region
      : getFilterParams();  // All filters

    const response = await axiosInstance.get('/api/reports', {
      params: filters
    });
  };

  return (
    <div>
      <button onClick={() => generateReport(false)}>
        Generate for Current Station
      </button>
      <button onClick={() => generateReport(true)}>
        Generate for All Stations in Region
      </button>
    </div>
  );
}
```

### Example 3: Clear Filters on Logout

```tsx
// In AuthContext.tsx
import { useFilters } from './FilterContext';

export function AuthProvider({ children }) {
  const { clearFilters } = useFilters();

  const logout = async () => {
    // Clear auth data
    localStorage.removeItem('auth_token');
    
    // Clear filters
    clearFilters();
    
    // Redirect to login
    navigate('/login');
  };

  // ... rest of auth logic
}
```

---

## ✅ Implementation Checklist

- [x] Created FilterContext with state management
- [x] Created LocationFilter component
- [x] Added LocationFilter to TopBar
- [x] Updated axiosInstance to include filters
- [x] Added FilterProvider to app root
- [x] Implemented localStorage persistence
- [x] Implemented cascading clear behavior
- [x] Added badge with filter count
- [x] Added clear all filters button
- [x] Documented usage and API

---

## 🎉 Summary

Successfully implemented a **comprehensive location filtering system** that:

### FilterContext
✅ Global state management  
✅ localStorage persistence  
✅ Cascading clear behavior  
✅ Easy-to-use React hooks  

### LocationFilter Component
✅ Clean popover UI  
✅ Badge with active count  
✅ Integrated with context  
✅ Responsive design  

### Automatic API Integration
✅ Filters added to all requests  
✅ No code changes needed  
✅ Override capability  
✅ Logged for debugging  

**Result:** Users can set their location once, and all data across the system is automatically filtered! 🚀

---

## 🔄 Future Enhancements

### Potential Improvements

1. **User Profile Integration**
   - Load default filters from user profile on login
   - Save user's preferred location
   - Auto-select based on user's assigned station

2. **Filter Presets**
   - Save multiple filter combinations
   - Quick switch between presets
   - Share presets with team

3. **Advanced Filtering**
   - Date range filters
   - Status filters
   - Custom filter builder

4. **Filter Analytics**
   - Track most used filters
   - Suggest relevant filters
   - Filter usage reports

5. **Multi-Station Support**
   - Select multiple stations
   - Compare data across stations
   - Aggregate views
