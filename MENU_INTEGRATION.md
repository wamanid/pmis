# Menu Integration with Backend API

## Overview
The sidebar menu now fetches menu items dynamically from the backend API after successful login.

## API Endpoint

**URL:** `GET /api/system-administration/menus/`

**Response Structure:**
```json
{
  "count": 13,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "parent_name": "Parent Menu Name",
      "created_datetime": "2025-10-25T09:43:54.310473Z",
      "is_active": true,
      "updated_datetime": "2025-10-25T09:43:54.324013Z",
      "deleted_datetime": null,
      "name": "Menu Item Name",
      "url": "/path/to/page",
      "icon": "IconName",
      "created_by": 2,
      "updated_by": 2,
      "deleted_by": null,
      "parent": "parent-uuid-or-null"
    }
  ]
}
```

## Implementation

### 1. Menu Service (`src/services/menuService.ts`)

Created a new service to fetch menus from the backend:

```typescript
export const fetchMenus = async (): Promise<MenuResponse> => {
  const response = await axiosInstance.get<MenuResponse>('/system-administration/menus/');
  return response.data;
};
```

### 2. Menu Tree Building (`src/App.tsx`)

The `buildMenuTree()` function converts the flat API response into a hierarchical menu structure:

**Process:**
1. Filters only active menus (`is_active: true`)
2. Creates menu items with proper icon mapping
3. Converts URL to page identifier (e.g., `/station-management/lockup` → `station-management-lockup`)
4. Builds parent-child relationships based on `parent` field

**Example:**
```typescript
// API Response
{
  "id": "abc123",
  "name": "Lockup",
  "url": "/station-management/lockup",
  "icon": "Lock",
  "parent": "parent-id"
}

// Converted to
{
  id: "abc123",
  label: "Lockup",
  icon: Lock, // Lucide React component
  page: "station-management-lockup",
  children: []
}
```

### 3. Icon Mapping

Icons from the backend are mapped to Lucide React components:

```typescript
const iconMap: Record<string, LucideIcon> = {
  Building2,
  Lock,
  Users,
  Phone,
  Home,
  LogIn,
  BookOpen,
  MessageSquare,
  UserPlus,
  ClipboardCheck,
  // ... more icons
};
```

**Supported Icons:**
- Building2
- Lock
- Users
- Phone
- Home
- LogOut
- LogIn
- BookOpen
- MessageSquare
- UserPlus
- ClipboardCheck
- Package
- Scale
- TrendingUp
- DoorOpen
- ArrowLeftRight
- Stethoscope
- AlertTriangle
- HeartHandshake
- DollarSign
- Fingerprint
- FileText
- Settings

### 4. Menu Loading Flow

```
User logs in successfully
    ↓
App sets isAuthenticated = true
    ↓
useEffect triggers menu fetch
    ↓
GET /api/system-administration/menus/
    ↓
Backend returns menu items
    ↓
buildMenuTree() processes response
    ↓
Menu items rendered in sidebar
```

### 5. Page Routing

The `url` field from the backend is converted to a page identifier:

**Conversion:**
- Remove leading slash
- Replace remaining slashes with hyphens

**Examples:**
- `/station-management/lockup` → `station-management-lockup`
- `/admissions-management/admissions` → `admissions-management-admissions`
- `/station-management/entry-exit` → `station-management-entry-exit`

## Menu Hierarchy

The system supports multi-level menu hierarchies:

**Example Structure:**
```
Station Management (parent: null)
├── Lockup (parent: Station Management)
│   ├── Manual Lockup (parent: Lockup)
│   └── System Lockup (parent: Lockup)
├── Entry & Exit (parent: Station Management)
├── Staff Deployments (parent: Station Management)
└── Journals (parent: Station Management)
```

## Features

✅ **Dynamic menu loading** from backend API  
✅ **Hierarchical menu structure** with unlimited nesting  
✅ **Icon mapping** from string names to React components  
✅ **Active menu filtering** (only shows `is_active: true`)  
✅ **Auto-expand parent** of active menu item  
✅ **Loading state** with skeleton placeholders  
✅ **Error handling** with console logging  
✅ **Authentication-gated** (only loads after login)

## Error Handling

If menu loading fails:
- Error is logged to console
- Loading state is cleared
- Empty menu is displayed
- User can still navigate using direct URLs

## Adding New Icons

To add support for a new icon:

1. Import the icon from `lucide-react` in `App.tsx`:
```typescript
import { NewIcon } from "lucide-react";
```

2. Add to the `iconMap`:
```typescript
const iconMap: Record<string, LucideIcon> = {
  // ... existing icons
  NewIcon,
};
```

3. Backend can now use `"NewIcon"` as the icon value

## Testing

1. **Login** to the application
2. **Check browser console** for menu fetch request
3. **Verify menu items** appear in sidebar
4. **Test navigation** by clicking menu items
5. **Check hierarchy** - parent items should be expandable
6. **Verify icons** display correctly

## Backend Requirements

The backend must:
- Return menus in the specified JSON format
- Include all required fields (`id`, `name`, `url`, `icon`, `parent`, `is_active`)
- Use valid icon names from the supported list
- Set `is_active: true` for visible menus
- Use `null` for `parent` field on root-level menus
- Use parent UUID for child menus

## Files Modified

1. ✅ `src/services/menuService.ts` - New menu service
2. ✅ `src/App.tsx` - Updated import to use menuService
