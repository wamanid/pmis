# DataTable - Location Filter Integration

## ✅ Feature Implemented

Successfully integrated **location filter refresh** into the DataTable component. Now all DataTable instances automatically refetch data when location filters (region, district, station) change.

---

## 🔄 How It Works

### Automatic Data Refresh

When location filters change in the `LocationFilter` component:

1. ✅ `FilterContext` dispatches `filterChanged` event
2. ✅ `useFilterRefresh` hook listens for the event
3. ✅ DataTable automatically refetches data
4. ✅ New data displayed with updated filters

**No additional code needed in components using DataTable!**

---

## 📝 Implementation

### Updated File
**`src/components/common/DataTable.tsx`**

### Changes Made

#### 1. Import Hook
```typescript
import { useFilterRefresh } from '../../hooks/useFilterRefresh';
```

#### 2. Extract Fetch Function
```typescript
// Fetch data from URL
const fetchData = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await axios.get(url);
    setData(Array.isArray(response.data) ? response.data : response.data.data || []);
  } catch (err: any) {
    setError(err.message || 'Failed to fetch data');
  } finally {
    setLoading(false);
  }
};
```

#### 3. Use Filter Refresh Hook
```typescript
// Fetch data on mount and when filters change
useFilterRefresh(fetchData, [url]);
```

### Before (Old Code)
```typescript
useEffect(() => {
  const fetchData = async () => {
    // ... fetch logic
  };
  fetchData();
}, [url]); // Only refetches when URL changes
```

### After (New Code)
```typescript
const fetchData = async () => {
  // ... fetch logic
};

useFilterRefresh(fetchData, [url]); // Refetches on mount, URL change, AND filter change
```

---

## 🎯 What This Means

### For All DataTable Instances

Every component using DataTable now automatically:

✅ **Refetches on mount** - Initial data load  
✅ **Refetches on filter change** - When user changes region/district/station  
✅ **Refetches on URL change** - When URL prop changes  
✅ **Shows loading state** - During refetch  
✅ **Handles errors** - If refetch fails  

---

## 💡 Usage Examples

### Example 1: Prisoner List Screen

```typescript
<DataTable
  url="/api/admission/prisoners/"
  title="Prisoner Records"
  columns={columns}
  config={{...}}
/>
```

**Behavior:**
- Loads prisoners on mount
- When user changes location filter → automatically refetches prisoners
- Shows loading spinner during refetch
- Updates table with new filtered data

### Example 2: Dashboard Statistics

```typescript
<DataTable
  url="/api/admission/dashboard/"
  title="Dashboard Stats"
  columns={columns}
  config={{...}}
/>
```

**Behavior:**
- Loads dashboard data on mount
- When user changes location filter → automatically refetches dashboard
- No additional code needed!

### Example 3: Any Data Table

```typescript
<DataTable
  url="/api/any/endpoint/"
  title="Any Data"
  columns={columns}
  config={{...}}
/>
```

**Behavior:**
- Works automatically for ANY DataTable instance
- Filter integration is built-in
- Zero configuration required

---

## 🔄 Complete Flow

```
User Changes Location Filter
    ↓
FilterContext.setRegion/setDistrict/setStation()
    ↓
window.dispatchEvent(new CustomEvent('filterChanged'))
    ↓
useFilterRefresh hook listens for event
    ↓
Calls fetchData() function
    ↓
DataTable shows loading state
    ↓
axios.get(url) with new filter params
    ↓
axiosInstance adds filter params automatically
    ↓
Backend receives request with filters
    ↓
Backend returns filtered data
    ↓
DataTable updates with new data
    ↓
User sees updated table
```

---

## 🔌 Integration with FilterContext

### How Filters Are Applied

The `axiosInstance` request interceptor automatically adds location filters to ALL API requests:

```typescript
// In axiosInstance.ts
axiosInstance.interceptors.request.use((config) => {
  const filterStorage = localStorage.getItem('pmis_user_filters');
  if (filterStorage) {
    const filters = JSON.parse(filterStorage);
    
    if (filters.region) config.params.region = filters.region;
    if (filters.district) config.params.district = filters.district;
    if (filters.station) config.params.station = filters.station;
  }
  
  return config;
});
```

### Example API Request

**User selects:**
- Region: Kampala
- District: Kampala Central
- Station: Central Police Station

**DataTable makes request:**
```
GET /api/admission/prisoners/?region=1&district=5&station=12
```

**Filters automatically added by axios interceptor!**

---

## 📊 Components Affected

All components using DataTable now have automatic filter refresh:

### Current Implementations

1. **PrisonerListScreen** (`/admissions-management/prisoners`)
   - URL: `/api/admission/prisoners/`
   - Filters: ✅ Automatic

2. **Future DataTable Instances**
   - Any new DataTable component
   - Filters: ✅ Automatic (no code needed)

---

## ✨ Benefits

### 1. **Zero Configuration**
```typescript
// Just use DataTable - filters work automatically!
<DataTable url="/api/data/" columns={columns} />
```

### 2. **Consistent Behavior**
- All DataTables behave the same way
- Predictable user experience
- No scattered filter logic

### 3. **Maintainable**
- Filter logic in one place (DataTable component)
- Easy to update behavior globally
- No duplicate code

### 4. **Automatic**
- No manual refetch calls needed
- No filter state management in components
- Works out of the box

### 5. **Performance**
- Only refetches when filters actually change
- Proper loading states
- Error handling included

---

## 🧪 Testing

### Test Scenario 1: Filter Change
1. Open Prisoner List page
2. Change region filter
3. **Expected:** Table shows loading spinner, then refetches with new data

### Test Scenario 2: Multiple Filter Changes
1. Open Prisoner List page
2. Change region → district → station quickly
3. **Expected:** Table refetches after each change

### Test Scenario 3: Clear Filters
1. Open Prisoner List page with filters applied
2. Click "Clear All Filters"
3. **Expected:** Table refetches with no filters

### Test Scenario 4: Navigation
1. Apply filters
2. Navigate to different page with DataTable
3. **Expected:** New page's DataTable uses same filters

---

## 🔧 Hook Details

### useFilterRefresh Hook

**Location:** `src/hooks/useFilterRefresh.ts`

**Signature:**
```typescript
useFilterRefresh(
  refetchCallback: () => void | Promise<void>,
  dependencies?: any[]
)
```

**Parameters:**
- `refetchCallback` - Function to call when filters change
- `dependencies` - Optional dependencies (like useEffect)

**Behavior:**
- Calls callback on mount
- Listens for `filterChanged` event
- Calls callback when event fires
- Cleans up event listener on unmount

**Usage in DataTable:**
```typescript
const fetchData = async () => {
  // Fetch logic
};

useFilterRefresh(fetchData, [url]);
```

---

## 📝 Notes

### Why Not Use useEffect?

**Old Approach (useEffect):**
```typescript
useEffect(() => {
  fetchData();
}, [url]); // Only refetches when URL changes
```

**Problem:** Doesn't refetch when filters change

**New Approach (useFilterRefresh):**
```typescript
useFilterRefresh(fetchData, [url]);
```

**Solution:** Refetches on mount, URL change, AND filter change

### Event-Based Architecture

The filter system uses custom events for loose coupling:

```typescript
// FilterContext dispatches event
window.dispatchEvent(new CustomEvent('filterChanged', {
  detail: { region, district, station }
}));

// useFilterRefresh listens for event
window.addEventListener('filterChanged', handleFilterChange);
```

**Benefits:**
- ✅ No direct dependencies between components
- ✅ Easy to add new listeners
- ✅ Flexible architecture
- ✅ Testable

---

## 🚀 Future Enhancements

### Potential Improvements

1. **Debouncing**
   ```typescript
   // Debounce rapid filter changes
   const debouncedFetch = debounce(fetchData, 300);
   useFilterRefresh(debouncedFetch, [url]);
   ```

2. **Loading Optimization**
   ```typescript
   // Show subtle loading indicator instead of full spinner
   const [isRefreshing, setIsRefreshing] = useState(false);
   ```

3. **Cache Management**
   ```typescript
   // Cache results per filter combination
   const cacheKey = `${url}-${region}-${district}-${station}`;
   ```

4. **Optimistic Updates**
   ```typescript
   // Show filtered data immediately, refetch in background
   ```

---

## ✅ Summary

The DataTable component now has **built-in location filter integration**:

✅ **Automatic refetch** when filters change  
✅ **Zero configuration** required  
✅ **Consistent behavior** across all instances  
✅ **Proper loading states** during refetch  
✅ **Error handling** included  
✅ **Event-based architecture** for loose coupling  

### Components Updated
- ✅ `DataTable.tsx` - Added useFilterRefresh hook
- ✅ All DataTable instances - Automatic filter refresh

### Result
**Every DataTable in the application now automatically responds to location filter changes!** 🎯

No additional code needed in components using DataTable - it just works! 🚀
