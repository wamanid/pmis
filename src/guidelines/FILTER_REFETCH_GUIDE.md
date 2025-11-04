# Filter Auto-Refetch System - Implementation Guide

## 🎯 What Changed

Updated the FilterContext to emit events instead of reloading the page, allowing components to automatically refetch data when filters change.

---

## 🔄 How It Works

### Event-Based System

When a filter changes:
1. Filter saved to state and localStorage
2. `filterChanged` event emitted
3. Components listening to the event refetch their data
4. UI updates with new filtered data

**No page reload required!** ✨

---

## 💡 Implementation

### FilterContext Changes

```typescript
// Instead of page reload
window.location.reload();

// Now emits event
window.dispatchEvent(new CustomEvent('filterChanged', { 
  detail: { region, district, station } 
}));
```

### Custom Hook: useFilterRefresh

Created a convenient hook to handle filter changes:

```typescript
import { useFilterRefresh } from '@/hooks/useFilterRefresh';

function MyComponent() {
  const [data, setData] = useState([]);

  const loadData = async () => {
    const response = await axiosInstance.get('/api/data');
    setData(response.data);
  };

  // Automatically refetch when filters change
  useFilterRefresh(loadData);

  return <div>{/* render data */}</div>;
}
```

---

## 🚀 Usage Examples

### Example 1: Simple Data Fetching

```tsx
import { useState } from 'react';
import { useFilterRefresh } from '@/hooks/useFilterRefresh';
import axiosInstance from '@/services/axiosInstance';

function PrisonerList() {
  const [prisoners, setPrisoners] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPrisoners = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/prisoners/');
      setPrisoners(response.data.results);
    } catch (error) {
      console.error('Failed to load prisoners:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load on mount and when filters change
  useFilterRefresh(loadPrisoners);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {prisoners.map(prisoner => (
        <div key={prisoner.id}>{prisoner.name}</div>
      ))}
    </div>
  );
}
```

### Example 2: With Dependencies

```tsx
import { useState } from 'react';
import { useFilterRefresh } from '@/hooks/useFilterRefresh';

function StationStats() {
  const [stats, setStats] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('2024-01');

  const loadStats = async () => {
    const response = await axiosInstance.get('/api/stats/', {
      params: { month: selectedMonth }
    });
    setStats(response.data);
  };

  // Refetch when filters OR selectedMonth changes
  useFilterRefresh(loadStats, [selectedMonth]);

  return <div>{/* render stats */}</div>;
}
```

### Example 3: Multiple Data Sources

```tsx
import { useFilterRefresh } from '@/hooks/useFilterRefresh';

function Dashboard() {
  const [prisoners, setPrisoners] = useState([]);
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState(null);

  const loadAllData = async () => {
    // Load multiple data sources
    const [prisonersRes, staffRes, statsRes] = await Promise.all([
      axiosInstance.get('/api/prisoners/'),
      axiosInstance.get('/api/staff/'),
      axiosInstance.get('/api/stats/')
    ]);

    setPrisoners(prisonersRes.data.results);
    setStaff(staffRes.data.results);
    setStats(statsRes.data);
  };

  // All data refetches when filters change
  useFilterRefresh(loadAllData);

  return (
    <div>
      <PrisonerSection data={prisoners} />
      <StaffSection data={staff} />
      <StatsSection data={stats} />
    </div>
  );
}
```

### Example 4: Manual Event Listening

If you prefer not to use the hook:

```tsx
import { useEffect, useState } from 'react';

function MyComponent() {
  const [data, setData] = useState([]);

  const loadData = async () => {
    const response = await axiosInstance.get('/api/data');
    setData(response.data);
  };

  useEffect(() => {
    // Load on mount
    loadData();

    // Listen for filter changes
    const handleFilterChange = (event: CustomEvent) => {
      console.log('Filters changed:', event.detail);
      loadData();
    };

    window.addEventListener('filterChanged', handleFilterChange as EventListener);

    return () => {
      window.removeEventListener('filterChanged', handleFilterChange as EventListener);
    };
  }, []);

  return <div>{/* render data */}</div>;
}
```

### Example 5: With React Query

```tsx
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

function MyComponent() {
  const { data, refetch } = useQuery({
    queryKey: ['prisoners'],
    queryFn: () => axiosInstance.get('/api/prisoners/')
  });

  useEffect(() => {
    const handleFilterChange = () => {
      refetch();
    };

    window.addEventListener('filterChanged', handleFilterChange);
    return () => window.removeEventListener('filterChanged', handleFilterChange);
  }, [refetch]);

  return <div>{/* render data */}</div>;
}
```

---

## 🎨 User Experience

### Filter Change Flow

```
User selects filter
    ↓
Filter saved to localStorage
    ↓
'filterChanged' event emitted
    ↓
Components listening to event refetch data
    ↓
UI updates with filtered data
    ↓
No page reload! ✨
```

### Visual Feedback

1. **User selects filter** → Filter button updates to show location name
2. **Components show loading** → Spinners or skeleton loaders
3. **Data loads** → New filtered data appears
4. **Smooth transition** → No page flash or scroll reset

---

## ✅ Benefits

### 1. **No Page Reload**
- Smooth user experience
- Maintains scroll position
- Preserves form data
- Faster than full page reload

### 2. **Granular Control**
- Each component controls its own refetch
- Can add loading states per component
- Can handle errors independently

### 3. **Flexible**
- Works with any data fetching library
- Compatible with React Query, SWR, etc.
- Easy to add to existing components

### 4. **Automatic**
- Components automatically refetch on filter change
- No manual trigger needed
- Consistent behavior across app

---

## 📋 Migration Guide

### Update Existing Components

**Before (manual refetch):**
```tsx
function MyComponent() {
  const { region, district, station } = useFilters();
  const [data, setData] = useState([]);

  useEffect(() => {
    loadData();
  }, [region, district, station]); // Manual dependencies

  const loadData = async () => {
    const response = await axiosInstance.get('/api/data');
    setData(response.data);
  };

  return <div>{/* render */}</div>;
}
```

**After (automatic refetch):**
```tsx
import { useFilterRefresh } from '@/hooks/useFilterRefresh';

function MyComponent() {
  const [data, setData] = useState([]);

  const loadData = async () => {
    const response = await axiosInstance.get('/api/data');
    setData(response.data);
  };

  useFilterRefresh(loadData); // Automatic!

  return <div>{/* render */}</div>;
}
```

---

## 🔧 Advanced Usage

### Debounced Refetch

```tsx
import { useFilterRefresh } from '@/hooks/useFilterRefresh';
import { debounce } from 'lodash';
import { useMemo } from 'react';

function MyComponent() {
  const [data, setData] = useState([]);

  const loadData = async () => {
    const response = await axiosInstance.get('/api/data');
    setData(response.data);
  };

  // Debounce to avoid rapid refetches
  const debouncedLoad = useMemo(
    () => debounce(loadData, 300),
    []
  );

  useFilterRefresh(debouncedLoad);

  return <div>{/* render */}</div>;
}
```

### Conditional Refetch

```tsx
import { useFilterRefresh } from '@/hooks/useFilterRefresh';

function MyComponent() {
  const [data, setData] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadData = async () => {
    if (!autoRefresh) return; // Skip if disabled
    
    const response = await axiosInstance.get('/api/data');
    setData(response.data);
  };

  useFilterRefresh(loadData, [autoRefresh]);

  return (
    <div>
      <label>
        <input 
          type="checkbox" 
          checked={autoRefresh}
          onChange={(e) => setAutoRefresh(e.target.checked)}
        />
        Auto-refresh on filter change
      </label>
      {/* render data */}
    </div>
  );
}
```

### With Error Handling

```tsx
import { useFilterRefresh } from '@/hooks/useFilterRefresh';
import { toast } from 'sonner';

function MyComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/api/data');
      setData(response.data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useFilterRefresh(loadData);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{/* render data */}</div>;
}
```

---

## 🎯 Best Practices

### 1. **Use the Hook**
```tsx
// ✅ Good - Use the hook
useFilterRefresh(loadData);

// ❌ Avoid - Manual event listening
useEffect(() => {
  window.addEventListener('filterChanged', loadData);
  return () => window.removeEventListener('filterChanged', loadData);
}, []);
```

### 2. **Add Loading States**
```tsx
// ✅ Good - Show loading feedback
const loadData = async () => {
  setLoading(true);
  const response = await axiosInstance.get('/api/data');
  setData(response.data);
  setLoading(false);
};
```

### 3. **Handle Errors**
```tsx
// ✅ Good - Handle errors gracefully
const loadData = async () => {
  try {
    const response = await axiosInstance.get('/api/data');
    setData(response.data);
  } catch (error) {
    toast.error('Failed to load data');
  }
};
```

### 4. **Memoize Callbacks**
```tsx
// ✅ Good - Stable callback reference
const loadData = useCallback(async () => {
  const response = await axiosInstance.get('/api/data');
  setData(response.data);
}, []);

useFilterRefresh(loadData);
```

---

## 📊 Performance

### Pros
- ✅ No page reload (faster)
- ✅ Maintains UI state
- ✅ Granular loading states
- ✅ Better user experience

### Cons
- ⚠️ Each component refetches independently
- ⚠️ Multiple API calls if many components
- ⚠️ Need to add hook to each component

### Optimization Tips

**1. Batch Requests**
```tsx
// Load multiple resources in one request
const loadData = async () => {
  const response = await axiosInstance.get('/api/dashboard/all');
  setPrisoners(response.data.prisoners);
  setStaff(response.data.staff);
  setStats(response.data.stats);
};
```

**2. Use React Query**
```tsx
// Automatic caching and deduplication
const { data } = useQuery({
  queryKey: ['prisoners', filters],
  queryFn: () => axiosInstance.get('/api/prisoners/')
});
```

**3. Debounce Refetches**
```tsx
// Avoid rapid refetches
const debouncedLoad = useMemo(
  () => debounce(loadData, 300),
  []
);
```

---

## 🐛 Troubleshooting

### Data Not Refetching

**Cause:** Component not listening to filter changes

**Solution:**
```tsx
// Add the hook
import { useFilterRefresh } from '@/hooks/useFilterRefresh';
useFilterRefresh(loadData);
```

### Multiple Refetches

**Cause:** Multiple components refetching simultaneously

**Solution:**
```tsx
// Use React Query for caching
import { useQuery } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ['data'],
  queryFn: loadData,
  staleTime: 5000 // Cache for 5 seconds
});
```

### Stale Data

**Cause:** Component not re-rendering after refetch

**Solution:**
```tsx
// Ensure state updates
const loadData = async () => {
  const response = await axiosInstance.get('/api/data');
  setData([...response.data]); // Force new array reference
};
```

---

## ✅ Summary

Successfully implemented **event-based filter refetch system**:

✅ No page reload - smooth user experience  
✅ Custom hook for easy integration  
✅ Automatic refetch on filter changes  
✅ Granular control per component  
✅ Compatible with any data fetching library  
✅ Maintains UI state and scroll position  

**Result:** Components automatically refetch data when filters change, without page reload! 🚀

---

## 📚 Files Created/Updated

**Created:**
- `src/hooks/useFilterRefresh.ts` - Custom hook for filter-based refetching

**Updated:**
- `src/contexts/FilterContext.tsx` - Emit events instead of page reload

**Usage:**
```tsx
import { useFilterRefresh } from '@/hooks/useFilterRefresh';

function MyComponent() {
  const loadData = async () => {
    // Your data fetching logic
  };

  useFilterRefresh(loadData);

  return <div>{/* Your UI */}</div>;
}
```
