# Property Management Code Review & Optimization Guide

## 🚨 CRITICAL ISSUES (Production Blockers)

### 1. **API Reloading on Every Keystroke - SEVERITY: HIGH**

**Current Problem:**
Your form triggers API calls on EVERY keystroke. This is a **major production anti-pattern** that will:
- Overload your backend (1000s of unnecessary requests)
- Create terrible UX with constant loading states
- Waste bandwidth and potentially hit API rate limits
- Cause race conditions with stale data
- Increase server costs significantly

**Root Cause:**
The `onUpdate` function in CreatePropertyForm triggers `setPropertyItems()` which causes the entire form to re-render, and child components (PropertyItem) re-mount or re-initialize their SearchableSelect dropdowns.

**Evidence:**
```typescript
// PropertyItem.tsx - Lines 338-350
onChange={(v) => {
  setLocalVisitorItem(v ?? null);
  handleVisitorItemSelect(v); // This calls onUpdate
}}

// CreatePropertyForm.tsx - Line 191
const handleUpdatePropertyItem = (itemId: string, updatedFields: Partial<typeof propertyItems[0]>) => {
  setPropertyItems(prevItems =>  // This causes re-render
    prevItems.map(item =>
      item.id === itemId ? { ...item, ...updatedFields } : item
    )
  );
};
```

**Solution - React.memo + useCallback:**

```typescript
// CreatePropertyForm.tsx
import React, { useCallback, useMemo } from 'react';

const handleUpdatePropertyItem = useCallback((itemId: string, updatedFields: Partial<typeof propertyItems[0]>) => {
  setPropertyItems(prevItems =>
    prevItems.map(item =>
      item.id === itemId ? { ...item, ...updatedFields } : item
    )
  );
}, []); // Empty deps - function never changes

// Wrap PropertyItem with React.memo
const MemoizedPropertyItem = React.memo(PropertyItem);

// In JSX
{propertyItems.map((item, index) => (
  <MemoizedPropertyItem
    key={item.id}
    item={item}
    index={index}
    onUpdate={handleUpdatePropertyItem}
    // ... other props
  />
))}
```

**SearchableSelect should have internal debouncing:**
```typescript
// SearchableSelect.tsx should debounce API calls (already implemented at 300ms)
// Verify this is working - check network tab for delayed requests
```

---

## 🔴 HIGH PRIORITY ISSUES

### 2. **Expensive Calculations on Every Render**

**Problem:**
```typescript
// PrisonerPropertyScreen.tsx - Lines 708-741
// This runs on EVERY render (potentially 100s of times per second)
const currencyTotals: Record<string, { symbol: string; total: number }> = {};
properties.forEach((property) => {
  if (property.currency_name && property.amount) {
    const currencyName = property.currency_name;
    const currencySymbol = property.currency_symbol || currencyName;
    const amount = parseFloat(property.amount) || 0;
    // ... calculation
  }
});
```

**Solution - useMemo:**
```typescript
const { currencyTotals, totalValueDisplay } = useMemo(() => {
  const totals: Record<string, { symbol: string; total: number }> = {};
  
  properties.forEach((property) => {
    if (property.currency_name && property.amount) {
      const currencyName = property.currency_name;
      const currencySymbol = property.currency_symbol || currencyName;
      const amount = parseFloat(property.amount) || 0;
      
      if (!totals[currencyName]) {
        totals[currencyName] = { symbol: currencySymbol, total: 0 };
      }
      totals[currencyName].total += amount;
    }
  });
  
  // Format display
  const keys = Object.keys(totals);
  let display = '';
  if (keys.length > 0) {
    display = keys
      .map(currencyName => {
        const { symbol, total } = totals[currencyName];
        const formatted = total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        return `${symbol} ${formatted}`;
      })
      .join(' | ');
  } else {
    display = 'No value';
  }
  
  return { currencyTotals: totals, totalValueDisplay: display };
}, [properties]); // Only recalculate when properties change
```

### 3. **Missing useCallback for Event Handlers**

**Problem:**
Every render creates new function references, causing child components to re-render.

```typescript
// CreatePropertyForm.tsx - Missing useCallback
const handleEdit = async (property: PrisonerProperty) => {
  // ... implementation
};

const handleDelete = (property: PrisonerProperty) => {
  // ... implementation
};
```

**Solution:**
```typescript
const handleEdit = useCallback(async (property: PrisonerProperty) => {
  try {
    setLoaderText("Loading property details...");
    setNewDialogLoader(true);
    const freshData = await fetchPropertyById(property.id);
    if ('error' in freshData) {
      toast.error(freshData.error);
      return;
    }
    setSelectedProperty(freshData);
    setIsCreateDialogOpen(true);
  } catch (error) {
    toast.error('Failed to load property details');
  } finally {
    setNewDialogLoader(false);
  }
}, [setNewDialogLoader, setLoaderText, setSelectedProperty, setIsCreateDialogOpen]);

const handleDelete = useCallback((property: PrisonerProperty) => {
  setSelectedProperty(property);
  setIsDeleteDialogOpen(true);
}, []);
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### 4. **Massive Commented-Out Code (Technical Debt)**

**Problem:**
Your codebase has 100+ lines of commented code (mock data, old implementations).

**Files with excessive comments:**
- PrisonerPropertyScreen.tsx: ~300 lines of mock data and commented functions
- PropertyItem.tsx: Multiple commented approaches
- CreatePropertyForm.tsx: Old implementation code

**Action Items:**
1. **Delete all commented mock data** - it's in git history if you need it
2. **Remove commented old implementations** - confuses maintainers
3. **Keep only documentation comments** that explain "why", not "what"

**Examples to DELETE:**
```typescript
// DELETE THIS:
// const mockProperties: Property[] = [ ... 100 lines ... ];
// const mockPropertyTypes: PropertyType[] = [ ... ];

// DELETE THIS:
// const handleAddPropertyItem = () => { ... };
// const handleRemovePropertyItem = (itemId: string) => { ... };

// KEEP THIS:
// Skip if this is the initial edit mode load
if (mode === "edit" && selectedProperty?.prisoner === prisonerInfo.prisoner) {
  return;
}
```

### 5. **Inconsistent Error Handling**

**Problem:**
Some functions use `handleResponseError`, others use `handleServerError`, some just toast.

**Solution - Standardize:**
```typescript
// Create a centralized error handler
export const handleAPIError = (error: any, fallbackMessage: string = "Operation failed") => {
  if (error?.response?.data?.error) {
    toast.error(error.response.data.error);
  } else if (error?.message) {
    toast.error(error.message);
  } else {
    toast.error(fallbackMessage);
  }
};

// Usage:
try {
  const response = await addProperty(property);
  if ('error' in response) {
    handleAPIError(response, "Failed to add property");
    return;
  }
  // success logic
} catch (error) {
  handleAPIError(error, "Failed to add property");
}
```

### 6. **Prop Drilling (6+ Levels Deep)**

**Problem:**
```typescript
<CreatePropertyForm
  setNewDialogLoader={setNewDialogLoader}
  setLoaderText={setLoaderText}
  setIsNextCreateDialogOpen={setIsNextCreateDialogOpen}
  setProperties={setProperties}
  setDataTableRefreshKey={setDataTableRefreshKey}
  setPrisonerInfo={setPrisonerInfo}
  // ... 10+ more props
/>

// Then PropertyItem receives 20+ props
```

**Solution - Context API:**
```typescript
// PropertyFormContext.tsx
export const PropertyFormContext = createContext<{
  prisonerInfo: { prisoner: string; prisonerName: string; prisonerNumber: string };
  setPrisonerInfo: (info: any) => void;
  visitorInfo: { visitor: string };
  setVisitorInfo: (info: any) => void;
  setNewDialogLoader: (loading: boolean) => void;
  setLoaderText: (text: string) => void;
  // ... other shared state
}>({} as any);

// In CreatePropertyForm:
const formContextValue = useMemo(() => ({
  prisonerInfo,
  setPrisonerInfo,
  visitorInfo,
  setVisitorInfo,
  setNewDialogLoader,
  setLoaderText,
}), [prisonerInfo, visitorInfo]);

return (
  <PropertyFormContext.Provider value={formContextValue}>
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Child components can now use useContext(PropertyFormContext) */}
      <PropertyItem item={item} index={index} />
    </form>
  </PropertyFormContext.Provider>
);

// In PropertyItem:
const { prisonerInfo, setNewDialogLoader } = useContext(PropertyFormContext);
```

---

## 🟢 NICE TO HAVE IMPROVEMENTS

### 7. **Type Safety Issues**

```typescript
// ❌ BAD - using 'any'
const [loading, setLoading] = useState<any>({ visitor: false, property: false });

// ✅ GOOD - proper typing
interface LoadingState {
  visitor: boolean;
  property: boolean;
  type: boolean;
}
const [loading, setLoading] = useState<LoadingState>({ 
  visitor: false, 
  property: false, 
  type: false 
});
```

### 8. **Magic Strings**

```typescript
// ❌ BAD
if (p.property_status_name === 'Stored') { ... }

// ✅ GOOD
export const PROPERTY_STATUS = {
  STORED: 'Stored',
  RELEASED: 'Released',
  DAMAGED: 'Damaged',
  LOST: 'Lost',
  DESTROYED: 'Destroyed',
} as const;

if (p.property_status_name === PROPERTY_STATUS.STORED) { ... }
```

### 9. **Missing Loading States**

Your DataTable component handles its own loading, but form submissions should show feedback:

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const onSubmit = async () => {
  setIsSubmitting(true);
  try {
    // ... validation and submission
  } finally {
    setIsSubmitting(false);
  }
};

// In JSX:
<Button type="submit" disabled={isSubmitting} style={{backgroundColor: '#650000'}}>
  {isSubmitting ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      {selectedProperty ? 'Updating...' : 'Creating...'}
    </>
  ) : (
    selectedProperty ? 'Update Property' : 'Create Property'
  )}
</Button>
```

---

## 📊 PERFORMANCE METRICS TO TRACK

After implementing fixes, verify:

1. **Network Tab**: Should see max 1 API call per dropdown selection (not on every keystroke)
2. **React DevTools Profiler**: PropertyItem should NOT re-render when typing in text inputs
3. **Render Count**: Add `console.log('PropertyItem render')` - should only log when user changes selection, not on typing
4. **Bundle Size**: Check if removing commented code reduces bundle size

---

## 🎯 IMPLEMENTATION PRIORITY

### Phase 1: Critical Fixes (Week 1)
1. ✅ Add React.memo to PropertyItem
2. ✅ Add useCallback to handleUpdatePropertyItem
3. ✅ Add useMemo to currency calculations
4. ✅ Verify SearchableSelect debouncing is working

### Phase 2: Code Quality (Week 2)
1. Remove all commented code
2. Standardize error handling
3. Add proper TypeScript types
4. Add loading states to buttons

### Phase 3: Architecture (Week 3)
1. Consider Context API for deep prop drilling
2. Extract constants for magic strings
3. Add comprehensive error boundaries
4. Write unit tests for critical functions

---

## 🧪 TESTING CHECKLIST

After fixes:
- [ ] Type in Quantity field - Network tab shows NO API calls
- [ ] Select from dropdown - Network tab shows 1 API call ONLY
- [ ] Change prisoner - Related fields clear correctly
- [ ] Edit property - All fields populate correctly
- [ ] Submit form - Loading state shows, then success/error toast
- [ ] Check React DevTools - Minimal re-renders

---

## 📚 RESOURCES

- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [useMemo and useCallback](https://react.dev/reference/react/useMemo)
- [React.memo](https://react.dev/reference/react/memo)
- [Debouncing in React](https://www.freecodecamp.org/news/debouncing-explained/)

---

**Summary:** Your code works functionally, but has serious performance issues that would fail code review at any senior-level company. The keystroke API issue alone would be a production blocker. Implement the Critical Fixes ASAP before deploying to production.
