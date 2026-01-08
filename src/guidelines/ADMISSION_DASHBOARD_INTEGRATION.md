# AdmissionDashboard - Filter Refetch Integration

## ✅ Integration Complete

Successfully integrated the `useFilterRefresh` hook into the AdmissionDashboard component.

---

## 🔧 Changes Made

### Before

```tsx
export function AdmissionDashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    period: 'daily'
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await admissionService.getAdmissionDashboard(filters);
        setDashboardData(data);
      } catch (error) {
        toast.error('Failed to load admission dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);  // Only reloads when local filters change
}
```

### After

```tsx
import { useFilterRefresh } from '../../hooks/useFilterRefresh';

export function AdmissionDashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    period: 'daily'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await admissionService.getAdmissionDashboard(filters);
      setDashboardData(data);
    } catch (error) {
      toast.error('Failed to load admission dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount, when filters change, AND when location filters change
  useFilterRefresh(loadData, [filters]);
}
```

---

## 🎯 What This Does

### Automatic Refetch Triggers

The dashboard now automatically refetches data when:

1. **Component mounts** - Initial data load
2. **Local filters change** - When `period` or other dashboard filters change
3. **Location filters change** - When region, district, or station is selected in TopBar

### Data Flow

```
User selects "Central Region" in TopBar
    ↓
'filterChanged' event emitted
    ↓
useFilterRefresh detects the event
    ↓
loadData() is called
    ↓
admissionService.getAdmissionDashboard(filters) is called
    ↓
axiosInstance automatically includes region parameter
    ↓
API returns filtered data for Central Region
    ↓
Dashboard updates with filtered data
```

---

## 🔄 How Location Filters Are Applied

### Automatic Parameter Injection

The `admissionService.getAdmissionDashboard()` function receives location filters automatically:

```typescript
// In admissionService.ts
export const getAdmissionDashboard = async (filters?: DashboardFilters) => {
  const params = new URLSearchParams();
  
  // Local filters
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);
  if (filters?.period) params.append('period', filters.period);
  
  // Location filters are automatically added by axiosInstance interceptor
  // No need to manually add region, district, station here!
  
  const response = await axiosInstance.get<DashboardResponse>(url);
  return response.data;
};
```

### Axios Interceptor

The axios interceptor automatically adds location filters from localStorage:

```typescript
// In axiosInstance.ts
axiosInstance.interceptors.request.use((config) => {
  const filters = JSON.parse(localStorage.getItem('pmis_user_filters'));
  
  if (!config.params) config.params = {};
  
  // Automatically add location filters
  if (filters.region) config.params.region = filters.region;
  if (filters.district) config.params.district = filters.district;
  if (filters.station) config.params.station = filters.station;
  
  return config;
});
```

### Final API Request

```
GET /api/admission/dashboard/?period=daily&region=uuid&district=uuid&station=uuid
                              ↑              ↑                ↑              ↑
                              Local filter   Auto-injected location filters
```

---

## ✨ User Experience

### Scenario 1: User Selects Region

```
1. User clicks LocationFilter in TopBar
2. Selects "Central Region"
3. Dashboard shows loading spinner
4. API fetches admission data for Central Region
5. Dashboard updates with filtered data
6. All stats, charts, and tables show Central Region data
```

### Scenario 2: User Changes Both Filters

```
1. User has "Central Region" selected
2. User changes period filter to "monthly"
3. Dashboard refetches with both filters:
   - period=monthly
   - region=central-region-uuid
4. Dashboard shows monthly stats for Central Region
```

### Scenario 3: User Clears Location Filter

```
1. User clicks "Clear all" in LocationFilter
2. Dashboard refetches without location filters
3. Dashboard shows data for all regions/districts/stations
```

---

## 📊 Benefits

### 1. **Automatic Synchronization**
- Dashboard always reflects current location filter
- No manual refresh needed
- Consistent data across the app

### 2. **Combined Filtering**
- Local filters (period, dates) work with location filters
- Both are sent in the same API request
- Backend can filter by multiple criteria

### 3. **Clean Code**
- Single `loadData` function
- No duplicate useEffect hooks
- Easy to maintain

### 4. **Better UX**
- Smooth loading states
- Clear feedback when filters change
- No page reload

---

## 🎨 Visual Flow

```
┌─────────────────────────────────────────┐
│ TopBar                                   │
│ [📍 Central Region] [🔔] [⚙️] [👤]      │
└─────────────────────────────────────────┘
              ↓ User selects region
┌─────────────────────────────────────────┐
│ AdmissionDashboard                       │
│                                          │
│ [Loading spinner...]                     │
│                                          │
└─────────────────────────────────────────┘
              ↓ Data loads
┌─────────────────────────────────────────┐
│ AdmissionDashboard - Central Region      │
│                                          │
│ Total Admissions: 150                    │
│ Pending Approval: 12                     │
│ Armed Personnel: 5                       │
│                                          │
│ [Charts showing Central Region data]     │
└─────────────────────────────────────────┘
```

---

## 🔧 Customization

### Add More Local Filters

```tsx
const [filters, setFilters] = useState<DashboardFilters>({
  period: 'daily',
  start_date: '',
  end_date: '',
  category: ''  // New filter
});

// Hook automatically refetches when any filter changes
useFilterRefresh(loadData, [filters]);
```

### Disable Auto-Refetch Conditionally

```tsx
const [autoRefresh, setAutoRefresh] = useState(true);

const loadData = async () => {
  if (!autoRefresh) return;  // Skip if disabled
  
  setLoading(true);
  const data = await admissionService.getAdmissionDashboard(filters);
  setDashboardData(data);
  setLoading(false);
};

useFilterRefresh(loadData, [filters, autoRefresh]);
```

### Add Debouncing

```tsx
import { debounce } from 'lodash';
import { useMemo } from 'react';

const loadData = async () => {
  setLoading(true);
  const data = await admissionService.getAdmissionDashboard(filters);
  setDashboardData(data);
  setLoading(false);
};

const debouncedLoad = useMemo(
  () => debounce(loadData, 300),
  [filters]
);

useFilterRefresh(debouncedLoad, [filters]);
```

---

## ✅ Summary

Successfully integrated `useFilterRefresh` into AdmissionDashboard:

✅ Automatically refetches when location filters change  
✅ Maintains local filter functionality (period, dates)  
✅ Combines location and local filters in API requests  
✅ Clean, maintainable code  
✅ Smooth user experience without page reload  

**Result:** Dashboard now responds to both local and global location filters automatically! 🎯
