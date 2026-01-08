# DataTable Row Spacing - Implementation Guide

## ✅ Feature Added

Successfully added **row spacing configuration** to the DataTable component with three modes: **Compact**, **Normal**, and **Cozy**.

---

## 🎯 What Was Added

### New Feature: Row Spacing Control

A button that allows users to cycle through three different row spacing modes for better data visibility and comfort.

**Spacing Modes:**
1. **Compact** - Minimal padding (`px-2 py-1`) for dense data
2. **Normal** - Standard padding (`px-4 py-3`) - default
3. **Cozy** - Extra padding (`px-6 py-4`) for comfortable reading

---

## 🔧 Changes Made

### 1. Updated Types (`DataTable.types.ts`)

**Added RowSpacing type:**
```typescript
export type RowSpacing = 'compact' | 'normal' | 'cozy';
```

**Added to DataTableConfig:**
```typescript
export interface DataTableConfig {
  // ... existing properties
  rowSpacing?: RowSpacing;
}
```

**Updated DEFAULT_CONFIG:**
```typescript
export const DEFAULT_CONFIG: Required<DataTableConfig> = {
  // ... existing properties
  rowSpacing: 'normal',
};
```

### 2. Updated Component (`DataTable.tsx`)

**Added State:**
```typescript
const [rowSpacing, setRowSpacing] = useState<RowSpacing>(
  mergedConfig.rowSpacing || 'normal'
);
```

**Added Helper Functions:**
```typescript
// Get row spacing classes
const getRowSpacingClasses = () => {
  switch (rowSpacing) {
    case 'compact':
      return 'px-2 py-1';
    case 'cozy':
      return 'px-6 py-4';
    case 'normal':
    default:
      return 'px-4 py-3';
  }
};

// Cycle through row spacing options
const cycleRowSpacing = () => {
  const spacings: RowSpacing[] = ['compact', 'normal', 'cozy'];
  const currentIndex = spacings.indexOf(rowSpacing);
  const nextIndex = (currentIndex + 1) % spacings.length;
  setRowSpacing(spacings[nextIndex]);
};
```

**Added UI Button:**
```tsx
<Button
  variant="outline"
  size="sm"
  onClick={cycleRowSpacing}
  className="gap-2"
  title={`Row spacing: ${rowSpacing}`}
>
  <AlignJustify className="h-4 w-4" />
  <span className="capitalize">{rowSpacing}</span>
</Button>
```

**Applied to Table Cells:**
```tsx
// Header cells
<th className={`${getRowSpacingClasses()} text-left text-sm font-medium ...`}>

// Body cells
<td className={`${getRowSpacingClasses()} text-sm`}>
```

---

## 🚀 Usage

### Basic Usage (Default)

```tsx
<DataTable
  url="/api/users"
  title="User Management"
  columns={columns}
  // rowSpacing defaults to 'normal'
/>
```

### Set Initial Row Spacing

```tsx
<DataTable
  url="/api/users"
  title="User Management"
  columns={columns}
  config={{
    rowSpacing: 'compact'  // Start with compact spacing
  }}
/>
```

### All Spacing Options

```tsx
// Compact - for dense data tables
<DataTable
  url="/api/users"
  title="User Management"
  columns={columns}
  config={{
    rowSpacing: 'compact'
  }}
/>

// Normal - standard spacing (default)
<DataTable
  url="/api/users"
  title="User Management"
  columns={columns}
  config={{
    rowSpacing: 'normal'
  }}
/>

// Cozy - for comfortable reading
<DataTable
  url="/api/users"
  title="User Management"
  columns={columns}
  config={{
    rowSpacing: 'cozy'
  }}
/>
```

---

## 🎨 Visual Comparison

### Compact Mode
```
┌────────────────────────────────────┐
│ ID │ Name     │ Email              │
├────┼──────────┼────────────────────┤
│ 1  │ John Doe │ john@example.com   │ ← Minimal padding
│ 2  │ Jane     │ jane@example.com   │
└────────────────────────────────────┘
Padding: px-2 py-1
Best for: Large datasets, dashboards
```

### Normal Mode (Default)
```
┌────────────────────────────────────┐
│ ID │ Name     │ Email              │
├────┼──────────┼────────────────────┤
│    │          │                    │
│ 1  │ John Doe │ john@example.com   │ ← Standard padding
│    │          │                    │
│ 2  │ Jane     │ jane@example.com   │
│    │          │                    │
└────────────────────────────────────┘
Padding: px-4 py-3
Best for: General purpose tables
```

### Cozy Mode
```
┌────────────────────────────────────┐
│ ID │ Name     │ Email              │
├────┼──────────┼────────────────────┤
│    │          │                    │
│    │          │                    │
│ 1  │ John Doe │ john@example.com   │ ← Extra padding
│    │          │                    │
│    │          │                    │
│ 2  │ Jane     │ jane@example.com   │
│    │          │                    │
│    │          │                    │
└────────────────────────────────────┘
Padding: px-6 py-4
Best for: Detailed views, readability
```

---

## 💡 How It Works

### User Interaction

1. **Click the spacing button** (shows current mode)
2. **Cycles through modes**: Compact → Normal → Cozy → Compact
3. **Instant visual feedback** - table updates immediately
4. **Persists during session** - stays until page reload

### Button States

```
[≡ Compact] → Click → [≡ Normal] → Click → [≡ Cozy] → Click → [≡ Compact]
```

---

## 🎯 Use Cases

### Use Case 1: Dense Data Dashboard

**Scenario:** Displaying many records in limited space

**Solution:** Use Compact mode
```tsx
<DataTable
  url="/api/dashboard/metrics"
  title="System Metrics"
  columns={columns}
  config={{
    rowSpacing: 'compact',
    lengthMenu: [25, 50, 100]
  }}
/>
```

**Benefits:**
- More rows visible without scrolling
- Efficient use of screen space
- Quick data scanning

### Use Case 2: Standard Data Table

**Scenario:** General purpose data display

**Solution:** Use Normal mode (default)
```tsx
<DataTable
  url="/api/users"
  title="User Management"
  columns={columns}
  // rowSpacing: 'normal' is default
/>
```

**Benefits:**
- Balanced spacing
- Good readability
- Works for most cases

### Use Case 3: Detailed Record View

**Scenario:** Displaying detailed information per row

**Solution:** Use Cozy mode
```tsx
<DataTable
  url="/api/prisoners/details"
  title="Prisoner Details"
  columns={detailedColumns}
  config={{
    rowSpacing: 'cozy',
    lengthMenu: [5, 10, 25]
  }}
/>
```

**Benefits:**
- Comfortable reading
- Clear row separation
- Reduced eye strain

---

## ✨ Features

### 1. **One-Click Toggle**
- Single button to cycle through modes
- No dropdown or menu needed
- Instant visual feedback

### 2. **Visual Indicator**
- Button shows current mode
- Icon (AlignJustify) indicates spacing
- Capitalized text for clarity

### 3. **Consistent Application**
- Applied to all table cells
- Header and body cells match
- Filter row also respects spacing

### 4. **Configurable Default**
- Set initial spacing in config
- Overrides component default
- User can still change it

### 5. **Responsive**
- Works on all screen sizes
- Button visible in controls bar
- Spacing scales appropriately

---

## 🎨 Customization

### Change Spacing Values

```typescript
// In DataTable.tsx
const getRowSpacingClasses = () => {
  switch (rowSpacing) {
    case 'compact':
      return 'px-1 py-0.5';  // ← Even more compact
    case 'cozy':
      return 'px-8 py-5';    // ← Even more spacious
    case 'normal':
    default:
      return 'px-4 py-3';
  }
};
```

### Add More Spacing Options

```typescript
// Add 'extra-cozy' mode
export type RowSpacing = 'compact' | 'normal' | 'cozy' | 'extra-cozy';

const getRowSpacingClasses = () => {
  switch (rowSpacing) {
    case 'compact':
      return 'px-2 py-1';
    case 'cozy':
      return 'px-6 py-4';
    case 'extra-cozy':
      return 'px-8 py-6';
    case 'normal':
    default:
      return 'px-4 py-3';
  }
};

const cycleRowSpacing = () => {
  const spacings: RowSpacing[] = ['compact', 'normal', 'cozy', 'extra-cozy'];
  // ... rest of logic
};
```

### Change Button Icon

```tsx
// Use different icon
import { LayoutList } from 'lucide-react';

<Button ...>
  <LayoutList className="h-4 w-4" />  {/* ← Different icon */}
  <span className="capitalize">{rowSpacing}</span>
</Button>
```

### Hide Button Text (Icon Only)

```tsx
<Button
  variant="outline"
  size="sm"
  onClick={cycleRowSpacing}
  title={`Row spacing: ${rowSpacing}`}
>
  <AlignJustify className="h-4 w-4" />
  {/* Remove text span */}
</Button>
```

---

## 📊 Spacing Comparison

| Mode | Padding | Height (approx) | Rows per 600px | Best For |
|------|---------|-----------------|----------------|----------|
| **Compact** | `px-2 py-1` | ~32px | ~18 rows | Dashboards, dense data |
| **Normal** | `px-4 py-3` | ~48px | ~12 rows | General tables |
| **Cozy** | `px-6 py-4` | ~64px | ~9 rows | Detailed views, forms |

---

## 🐛 Troubleshooting

### Spacing Not Changing

**Cause:** Classes not applied to cells

**Solution:**
```tsx
// Ensure getRowSpacingClasses() is called in both th and td
<th className={`${getRowSpacingClasses()} ...`}>
<td className={`${getRowSpacingClasses()} ...`}>
```

### Button Not Visible

**Cause:** Hidden in responsive layout

**Solution:**
```tsx
// Check button is in the controls bar
<div className="flex items-center gap-2 flex-wrap">
  {/* Row Spacing Button */}
  <Button ... />
</div>
```

### Spacing Resets on Page Reload

**Expected behavior** - Spacing is session-based

**To persist:**
```typescript
// Save to localStorage
const cycleRowSpacing = () => {
  const spacings: RowSpacing[] = ['compact', 'normal', 'cozy'];
  const currentIndex = spacings.indexOf(rowSpacing);
  const nextIndex = (currentIndex + 1) % spacings.length;
  const newSpacing = spacings[nextIndex];
  setRowSpacing(newSpacing);
  localStorage.setItem('datatable_row_spacing', newSpacing);
};

// Load from localStorage
const [rowSpacing, setRowSpacing] = useState<RowSpacing>(() => {
  const saved = localStorage.getItem('datatable_row_spacing');
  return (saved as RowSpacing) || mergedConfig.rowSpacing || 'normal';
});
```

---

## ✅ Summary

Successfully added **row spacing configuration** to DataTable:

✅ Three spacing modes: Compact, Normal, Cozy  
✅ One-click toggle button  
✅ Visual indicator showing current mode  
✅ Configurable default spacing  
✅ Applied to all table cells consistently  
✅ Responsive and accessible  

**Result:** Users can now adjust table density for optimal viewing! 🎯

---

## 📚 Complete Example

```tsx
import { DataTable } from '@/components/common';
import type { DataTableColumn } from '@/components/common/DataTable.types';

function PrisonerList() {
  const columns: DataTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true, filterable: true },
    { key: 'station', label: 'Station', sortable: true, filterable: true },
    { key: 'status', label: 'Status', filterable: true },
  ];

  return (
    <DataTable
      url="/api/prisoners"
      title="Prisoner Management"
      columns={columns}
      config={{
        search: true,
        pagination: true,
        lengthMenu: [10, 25, 50, 100],
        export: { pdf: true, csv: true, print: true },
        rowSpacing: 'normal'  // ← Row spacing config
      }}
    />
  );
}
```

**User can click the spacing button to cycle through:**
- Compact (dense)
- Normal (balanced)
- Cozy (spacious)

The DataTable now provides **flexible row spacing** for different viewing preferences! 🚀
