# Sidebar - Filter Refetch Integration

## ✅ Integration Complete

Successfully integrated the `useFilterRefresh` hook into the Sidebar component to reload menus when location filters change.

---

## 🔧 Changes Made

### Before

```tsx
export function Sidebar({ isOpen }: SidebarProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menusLoading, setMenusLoading] = useState(true);

  // Load menus from API only on mount
  useEffect(() => {
    const loadMenus = async () => {
      try {
        setMenusLoading(true);
        const response = await fetchMenus();
        const menus = buildMenuTree(response.results);
        setMenuItems(menus);
      } catch (error) {
        console.error('Failed to load menus:', error);
      } finally {
        setMenusLoading(false);
      }
    };

    loadMenus();
  }, []); // Only runs once on mount
}
```

### After

```tsx
import { useFilterRefresh } from '../../hooks/useFilterRefresh';

export function Sidebar({ isOpen }: SidebarProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menusLoading, setMenusLoading] = useState(true);

  // Load menus from API
  const loadMenus = async () => {
    try {
      setMenusLoading(true);
      const response = await fetchMenus();
      const menus = buildMenuTree(response.results);
      setMenuItems(menus);
    } catch (error) {
      console.error('Failed to load menus:', error);
    } finally {
      setMenusLoading(false);
    }
  };

  // Load menus on mount AND when location filters change
  useFilterRefresh(loadMenus);
}
```

---

## 🎯 What This Does

### Dynamic Menu Loading

The sidebar now reloads menus when location filters change, allowing for:

1. **Location-specific menus** - Different menu items based on selected station/district/region
2. **Permission-based menus** - Menus filtered by user's access to specific locations
3. **Dynamic navigation** - Menu structure adapts to current location context

### Automatic Refetch Triggers

Menus reload when:

1. **Component mounts** - Initial menu load
2. **Location filters change** - When region, district, or station is selected

---

## 🔄 Data Flow

```
User selects "Luzira Prison" in TopBar
    ↓
'filterChanged' event emitted
    ↓
useFilterRefresh detects event in Sidebar
    ↓
loadMenus() is called
    ↓
fetchMenus() API call (with location filters auto-injected)
    ↓
Backend returns menus for Luzira Prison
    ↓
Sidebar updates with location-specific menus
```

---

## 💡 Use Cases

### Use Case 1: Station-Specific Menus

```
User at National Level:
├── Dashboard
├── All Stations
├── Reports (All)
└── System Admin

User selects "Luzira Prison":
├── Dashboard (Luzira)
├── Prisoner Management
├── Staff Management
├── Reports (Luzira)
└── Station Settings
```

### Use Case 2: Permission-Based Access

```
User with Regional Access:
- Selects "Central Region"
- Menus show only Central Region stations
- Cannot access other regions

User with National Access:
- Selects any region/district/station
- Menus show all available options
- Full system access
```

### Use Case 3: Role-Based Menus

```
Station Commander:
- Selects their station
- Sees operational menus
- Limited admin access

Regional Director:
- Selects any station in region
- Sees oversight menus
- Regional admin access
```

---

## 🎨 Visual Flow

```
┌─────────────────────────────────────┐
│ TopBar                               │
│ [📍 Uganda] [🔔] [⚙️] [👤]          │
└─────────────────────────────────────┘
│
│ Sidebar shows:
│ ├── Dashboard
│ ├── All Stations
│ ├── National Reports
│ └── System Admin
│
▼ User selects "Luzira Prison"
│
┌─────────────────────────────────────┐
│ TopBar                               │
│ [📍 Luzira Prison] [🔔] [⚙️] [👤]  │
└─────────────────────────────────────┘
│
│ Sidebar reloads and shows:
│ ├── Dashboard (Luzira)
│ ├── Prisoner Management
│ ├── Admissions
│ ├── Staff Deployment
│ ├── Reports (Luzira)
│ └── Station Settings
```

---

## 🔧 Backend Integration

### Menu API with Location Filters

The backend should filter menus based on location parameters:

```python
# Backend example (Django)
def get_menus(request):
    user = request.user
    region = request.GET.get('region')
    district = request.GET.get('district')
    station = request.GET.get('station')
    
    # Base menus for user role
    menus = Menu.objects.filter(roles__in=user.roles.all())
    
    # Filter by location context
    if station:
        # Station-specific menus
        menus = menus.filter(
            Q(level='station') | 
            Q(level='all')
        ).filter(
            Q(stations__id=station) | 
            Q(stations__isnull=True)
        )
    elif district:
        # District-level menus
        menus = menus.filter(
            Q(level__in=['district', 'all'])
        ).filter(
            Q(districts__id=district) | 
            Q(districts__isnull=True)
        )
    elif region:
        # Regional menus
        menus = menus.filter(
            Q(level__in=['region', 'all'])
        ).filter(
            Q(regions__id=region) | 
            Q(regions__isnull=True)
        )
    else:
        # National level menus
        menus = menus.filter(level__in=['national', 'all'])
    
    return JsonResponse({
        'results': list(menus.values())
    })
```

### API Request Example

```
GET /api/menus/?station=luzira-uuid&region=central-uuid&district=kampala-uuid
```

---

## ✨ Benefits

### 1. **Context-Aware Navigation**
- Menus adapt to selected location
- Users see only relevant options
- Reduced clutter and confusion

### 2. **Dynamic Permissions**
- Location-based access control
- Automatic menu filtering
- Secure navigation structure

### 3. **Better UX**
- Clear context indication
- Relevant menu items
- Intuitive navigation

### 4. **Scalability**
- Easy to add location-specific features
- Flexible menu structure
- Maintainable codebase

---

## 🎯 Best Practices

### 1. **Cache Menus**

```tsx
// Add caching to avoid frequent reloads
const menuCache = useRef<Map<string, MenuItem[]>>(new Map());

const loadMenus = async () => {
  const cacheKey = `${region}-${district}-${station}`;
  
  if (menuCache.current.has(cacheKey)) {
    setMenuItems(menuCache.current.get(cacheKey)!);
    return;
  }
  
  const response = await fetchMenus();
  const menus = buildMenuTree(response.results);
  menuCache.current.set(cacheKey, menus);
  setMenuItems(menus);
};
```

### 2. **Show Loading State**

```tsx
// Already implemented in Sidebar
{menusLoading ? (
  <div className="space-y-2">
    {[1, 2, 3, 4, 5].map((i) => (
      <Skeleton key={i} className="h-9 w-full" />
    ))}
  </div>
) : (
  menuItems.map((item) => renderMenuItem(item))
)}
```

### 3. **Handle Errors Gracefully**

```tsx
const [menuError, setMenuError] = useState<string | null>(null);

const loadMenus = async () => {
  try {
    setMenusLoading(true);
    setMenuError(null);
    const response = await fetchMenus();
    const menus = buildMenuTree(response.results);
    setMenuItems(menus);
  } catch (error) {
    setMenuError('Failed to load menus');
    console.error('Failed to load menus:', error);
  } finally {
    setMenusLoading(false);
  }
};
```

### 4. **Preserve Expanded State**

```tsx
// Already implemented - expandedItems state is preserved
const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set([]));

// Menus reload but expansion state remains
useFilterRefresh(loadMenus);
```

---

## 🐛 Troubleshooting

### Menus Not Updating

**Cause:** Backend not filtering by location

**Solution:**
```python
# Ensure backend uses location parameters
region = request.GET.get('region')
district = request.GET.get('district')
station = request.GET.get('station')
```

### Menus Flashing on Filter Change

**Cause:** No loading state or caching

**Solution:**
```tsx
// Add caching or optimistic updates
const [cachedMenus, setCachedMenus] = useState<MenuItem[]>([]);

const loadMenus = async () => {
  // Show cached menus immediately
  if (cachedMenus.length > 0) {
    setMenuItems(cachedMenus);
  }
  
  // Load fresh menus in background
  const response = await fetchMenus();
  const menus = buildMenuTree(response.results);
  setMenuItems(menus);
  setCachedMenus(menus);
};
```

### Expanded Items Reset

**Cause:** State not preserved during reload

**Solution:**
```tsx
// Already handled - expandedItems is separate state
// Not affected by menu reload
```

---

## 📊 Performance Considerations

### Optimization Tips

1. **Debounce Menu Loads**
```tsx
const debouncedLoadMenus = useMemo(
  () => debounce(loadMenus, 300),
  []
);

useFilterRefresh(debouncedLoadMenus);
```

2. **Cache Menu Responses**
```tsx
// Use React Query or SWR
const { data: menus } = useQuery({
  queryKey: ['menus', region, district, station],
  queryFn: fetchMenus,
  staleTime: 5 * 60 * 1000 // 5 minutes
});
```

3. **Lazy Load Menu Items**
```tsx
// Load top-level menus first
// Load children on expand
```

---

## ✅ Summary

Successfully integrated `useFilterRefresh` into Sidebar:

✅ Menus reload when location filters change  
✅ Supports location-specific navigation  
✅ Enables permission-based menu filtering  
✅ Maintains expanded state during reload  
✅ Shows loading state during refetch  
✅ Clean, maintainable implementation  

**Result:** Sidebar now provides context-aware, dynamic navigation based on selected location! 🎯

---

## 🔗 Related Components

This integration works seamlessly with:

- **TopBar** - LocationFilter triggers menu reload
- **FilterContext** - Provides location state
- **AdmissionDashboard** - Also uses useFilterRefresh
- **Other components** - Can follow same pattern

All components now respond to location filter changes automatically! 🚀
