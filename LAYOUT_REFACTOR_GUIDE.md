# Layout Components Refactor - Implementation Guide

## 📦 What Was Done

Separated the monolithic MainLayout component into three independent, reusable components with enhanced functionality.

### Components Created

#### 1. **Sidebar Component** (`src/components/layout/Sidebar.tsx`)
Independent sidebar navigation component with menu management.

**Features:**
- ✅ Logo and branding
- ✅ Dynamic menu loading from API
- ✅ Hierarchical menu structure
- ✅ Expandable/collapsible menu items
- ✅ Active route highlighting
- ✅ Demo menu item
- ✅ Logout button
- ✅ Smooth open/close animation
- ✅ Responsive design

**Props:**
```typescript
interface SidebarProps {
  isOpen: boolean;  // Controls sidebar visibility
}
```

#### 2. **TopBar Component** (`src/components/layout/TopBar.tsx`)
Modern top navigation bar with user actions.

**Features:**
- ✅ Menu toggle button
- ✅ **Notifications** with badge counter
- ✅ **Settings** quick access
- ✅ **Profile dropdown** with:
  - User avatar and name
  - Profile link
  - Settings link
  - Logout option
- ✅ Responsive design
- ✅ Sticky positioning

**Props:**
```typescript
interface TopBarProps {
  isSidebarOpen: boolean;      // Current sidebar state
  onToggleSidebar: () => void; // Toggle callback
}
```

#### 3. **MainLayout Component** (`src/components/layout/MainLayout.tsx`)
Simplified layout orchestrator.

**Responsibilities:**
- Manages sidebar open/close state
- Renders Sidebar and TopBar
- Renders page content with routes
- Provides layout structure

---

## 🎨 Component Architecture

### Before (Monolithic)
```
MainLayout (344 lines)
├── All menu logic
├── All UI rendering
├── Sidebar UI
├── Top bar UI
└── Route rendering
```

### After (Modular)
```
MainLayout (34 lines)
├── Sidebar Component (independent)
│   ├── Menu loading
│   ├── Menu rendering
│   ├── Navigation logic
│   └── Logout
└── TopBar Component (independent)
    ├── Menu toggle
    ├── Notifications
    ├── Settings
    └── Profile dropdown
```

---

## 🚀 Usage

### MainLayout (Simplified)

```tsx
import { MainLayout } from '@/components/layout/MainLayout';

function App() {
  return <MainLayout />;
}
```

### Using Components Independently

```tsx
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

function CustomLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen">
      <Sidebar isOpen={sidebarOpen} />
      
      <div className="flex-1">
        <TopBar
          isSidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="p-6">
          {/* Your content */}
        </main>
      </div>
    </div>
  );
}
```

---

## ✨ New Features

### 1. Notifications System

**Location:** TopBar component (right side)

**Features:**
- Badge with unread count
- Popover with notification list
- Unread indicator (blue dot)
- Mark all as read button
- View all notifications link

**Mock Data Structure:**
```typescript
{
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}
```

**Customization:**
```tsx
// In TopBar.tsx, update the notifications array
const notifications = [
  {
    id: 1,
    title: 'Your notification title',
    message: 'Notification message',
    time: '5 minutes ago',
    unread: true,
  },
  // Add more...
];
```

### 2. Settings Button

**Location:** TopBar component (right side)

**Action:** Navigates to `/settings` route

**Customization:**
```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={() => navigate('/settings')}
>
  <Settings className="h-5 w-5" />
</Button>
```

### 3. Profile Dropdown

**Location:** TopBar component (right side)

**Features:**
- User avatar (circular with initials)
- User name and role display
- Dropdown menu with:
  - Profile link (`/profile`)
  - Settings link (`/settings`)
  - Logout action

**Customization:**
```tsx
// Update user info
<div className="hidden md:block text-left">
  <p className="text-sm font-medium">Admin User</p>
  <p className="text-xs text-muted-foreground">Administrator</p>
</div>

// Add more menu items
<DropdownMenuItem onClick={() => navigate('/help')}>
  <HelpCircle className="mr-2 h-4 w-4" />
  <span>Help</span>
</DropdownMenuItem>
```

---

## 📋 Component Details

### Sidebar Component

**State Management:**
- `expandedItems` - Tracks expanded menu items
- `menuItems` - Stores loaded menu structure
- `menusLoading` - Loading state for menus

**Key Functions:**
- `buildMenuTree()` - Converts API menus to hierarchical structure
- `findParentsOfActivePath()` - Auto-expands parent of active page
- `toggleExpand()` - Toggles menu item expansion
- `renderMenuItem()` - Recursively renders menu items

**Styling:**
- Width: 256px (w-64) when open, 0 when closed
- Smooth transition animation
- Active route highlighting with primary color
- Hover states on menu items

### TopBar Component

**State Management:**
- `notificationCount` - Number of unread notifications

**Key Features:**
- **Sticky positioning** - Always visible at top
- **Responsive** - Hides user name on mobile
- **Accessible** - Proper ARIA labels and keyboard navigation

**Styling:**
- Fixed height with padding
- Border bottom for separation
- Flexbox layout for alignment
- Z-index for proper stacking

---

## 🎯 Benefits of Refactoring

### 1. **Separation of Concerns**
- Each component has a single responsibility
- Easier to understand and maintain
- Clear component boundaries

### 2. **Reusability**
- Components can be used independently
- Easy to create alternative layouts
- Can be used in different contexts

### 3. **Maintainability**
- Smaller, focused files
- Easier to debug
- Simpler to test

### 4. **Scalability**
- Easy to add new features
- Can extend components independently
- Better code organization

### 5. **Performance**
- Components can be optimized individually
- Easier to implement code splitting
- Better React rendering optimization

---

## 🔧 Customization Guide

### Adding New TopBar Items

```tsx
// In TopBar.tsx, add between existing items
<Button
  variant="ghost"
  size="icon"
  onClick={() => navigate('/messages')}
>
  <MessageSquare className="h-5 w-5" />
</Button>
```

### Modifying Sidebar Width

```tsx
// In Sidebar.tsx, change the width class
className={`... ${isOpen ? 'w-80' : 'w-0'}`}  // Changed from w-64
```

### Changing Profile Avatar

```tsx
// Option 1: Use image
<img 
  src={userAvatar} 
  alt="User" 
  className="h-8 w-8 rounded-full"
/>

// Option 2: Use initials (current)
<div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
  <User className="h-4 w-4" />
</div>
```

### Adding Real Notification Data

```tsx
// Create a notifications hook
const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    // Fetch from API
    fetchNotifications().then(setNotifications);
  }, []);
  
  return notifications;
};

// Use in TopBar
const notifications = useNotifications();
```

---

## 📁 File Structure

```
src/components/layout/
├── MainLayout.tsx      # Main layout orchestrator (34 lines)
├── Sidebar.tsx         # Sidebar navigation component (new)
└── TopBar.tsx          # Top navigation bar component (new)
```

---

## 🐛 Known Issues

### Figma Asset Import Error

**Error:**
```
Cannot find module 'figma:asset/...' or its corresponding type declarations.
```

**Status:** Pre-existing error, not related to this refactor

**Impact:** None - the image still loads correctly at runtime

**Solution:** This is a TypeScript type checking issue with Figma plugin assets. It doesn't affect functionality.

---

## ✅ Migration Checklist

- [x] Created Sidebar component
- [x] Created TopBar component
- [x] Refactored MainLayout to use new components
- [x] Added notifications feature
- [x] Added settings button
- [x] Added profile dropdown
- [x] Maintained all existing functionality
- [x] Preserved menu loading logic
- [x] Preserved navigation logic
- [x] Preserved logout functionality
- [x] Maintained responsive design
- [x] Maintained styling consistency

---

## 🎉 Summary

Successfully refactored the layout into three independent, maintainable components:

### MainLayout (34 lines)
✅ Simplified orchestrator  
✅ Manages sidebar state  
✅ Renders child components  

### Sidebar (300+ lines)
✅ Complete navigation system  
✅ Menu loading and rendering  
✅ Hierarchical structure  
✅ Active route highlighting  

### TopBar (150+ lines)
✅ Menu toggle  
✅ Notifications with badge  
✅ Settings quick access  
✅ Profile dropdown with logout  

**Result:** More maintainable, scalable, and feature-rich layout system! 🚀

---

## 🔄 Future Enhancements

### Potential Improvements

1. **Real-time Notifications**
   - WebSocket integration
   - Push notifications
   - Sound alerts

2. **User Profile Integration**
   - Fetch user data from API
   - Display real avatar
   - Show user role and permissions

3. **Theme Switcher**
   - Add theme toggle in TopBar
   - Light/Dark mode support
   - User preference persistence

4. **Breadcrumbs**
   - Add breadcrumb navigation in TopBar
   - Show current page hierarchy
   - Clickable navigation path

5. **Search**
   - Global search in TopBar
   - Search across menus and content
   - Keyboard shortcut (Cmd/Ctrl + K)

6. **Responsive Improvements**
   - Mobile drawer for sidebar
   - Touch gestures
   - Better mobile menu

---

## 📚 Related Documentation

- [Sidebar Component API](#sidebar-component)
- [TopBar Component API](#topbar-component)
- [MainLayout Component API](#mainlayout-component)
- [Customization Guide](#customization-guide)
