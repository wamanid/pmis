# DistrictSelect Component - Implementation Guide

## 📦 What Was Created

A fully-featured, searchable dropdown component for selecting districts with automatic region filtering.

### Core Files Created

#### 1. Model Files
- **`src/models/system_administration/district.ts`** - District type definitions
- **`src/models/system_administration/index.ts`** - Updated with district exports

#### 2. Service File
- **`src/services/systemAdministrationService.ts`** - Updated with district functions
  - `fetchDistricts()` - Get districts with search/pagination/region filter
  - `fetchDistrictById()` - Get single district
  - `createDistrict()` - Create new district
  - `updateDistrict()` - Update district
  - `patchDistrict()` - Partial update
  - `deleteDistrict()` - Delete district

#### 3. Component Files
- **`src/components/common/DistrictSelect.tsx`** - Main component
- **`src/components/common/DistrictSelect.example.tsx`** - Usage examples
- **`src/components/common/DistrictSelect.README.md`** - Documentation
- **`src/components/common/index.ts`** - Updated with exports

---

## ✨ Features

### Component Features
- ✅ **Searchable dropdown** - Real-time search with API integration
- ✅ **Region filtering** - Automatically filters by selected region
- ✅ **Async loading** - Fetches from API with loading states
- ✅ **Error handling** - User-friendly error messages
- ✅ **Smart disabled state** - Auto-disables when no region selected
- ✅ **Keyboard navigation** - Full accessibility support
- ✅ **Responsive design** - Works on all screen sizes
- ✅ **TypeScript** - Full type safety

### API Features
- ✅ **Search** - Server-side search filtering
- ✅ **Region filter** - Filter districts by region UUID
- ✅ **Active filter** - Only shows active districts
- ✅ **Pagination** - Support for paginated results
- ✅ **Ordering** - Sort by name (default)
- ✅ **Full CRUD** - Create, Read, Update, Delete operations

---

## 🚀 Quick Start

### Basic Usage with RegionSelect

```tsx
import { useState } from 'react';
import { RegionSelect, DistrictSelect } from '@/components/common';

function MyComponent() {
  const [region, setRegion] = useState<string>('');
  const [district, setDistrict] = useState<string>('');

  const handleRegionChange = (value: string) => {
    setRegion(value);
    setDistrict(''); // ⚠️ Important: Clear district when region changes
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Region *</Label>
        <RegionSelect
          value={region}
          onValueChange={handleRegionChange}
        />
      </div>
      
      <div>
        <Label>District *</Label>
        <DistrictSelect
          value={district}
          onValueChange={setDistrict}
          regionId={region}
        />
      </div>
    </div>
  );
}
```

---

## 📋 Component API

### Props

```typescript
interface DistrictSelectProps {
  value?: string;              // Selected district ID (UUID)
  onValueChange?: (value: string) => void;  // Selection callback
  regionId?: string;           // Region ID to filter districts
  placeholder?: string;        // Placeholder text (default: "Select district...")
  disabled?: boolean;          // Disable component (default: false)
  className?: string;          // Additional CSS classes
}
```

### Key Differences from RegionSelect

| Feature | RegionSelect | DistrictSelect |
|---------|--------------|----------------|
| Filtering | None | Filters by `regionId` |
| Auto-disable | No | Yes (when no region) |
| Dependencies | None | Requires region selection |
| Message | None | Shows "Select region first" |

---

## 🔧 API Integration

### Endpoint

```
GET /api/system-administration/districts/
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | `string` | Search term for filtering |
| `region` | `string` | Region UUID to filter by |
| `is_active` | `boolean` | Filter by active status (default: true) |
| `ordering` | `string` | Sort field (default: 'name') |
| `page` | `number` | Page number for pagination |

### Response Format

```json
{
  "count": 123,
  "next": "/api/system-administration/districts/?page=2",
  "previous": null,
  "results": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Kampala District",
      "description": "Capital district",
      "region": "region-uuid",
      "region_name": "Central Region",
      "is_active": true,
      "created_datetime": "2025-11-02T17:11:31.820Z",
      "updated_datetime": "2025-11-02T17:11:31.820Z",
      "deleted_datetime": null,
      "created_by": 1,
      "updated_by": 1,
      "deleted_by": null
    }
  ]
}
```

---

## 💡 Usage Examples

### Example 1: Basic Form

```tsx
function LocationForm() {
  const [formData, setFormData] = useState({
    region: '',
    district: '',
  });

  const handleRegionChange = (value: string) => {
    setFormData({ region: value, district: '' });
  };

  return (
    <form className="space-y-4">
      <div>
        <Label>Region *</Label>
        <RegionSelect
          value={formData.region}
          onValueChange={handleRegionChange}
        />
      </div>

      <div>
        <Label>District *</Label>
        <DistrictSelect
          value={formData.district}
          onValueChange={(value) => setFormData({ ...formData, district: value })}
          regionId={formData.region}
        />
        {!formData.region && (
          <p className="text-xs text-muted-foreground">
            Please select a region first
          </p>
        )}
      </div>
    </form>
  );
}
```

### Example 2: With Validation

```tsx
function ValidatedForm() {
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    district: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRegionChange = (value: string) => {
    setFormData({ ...formData, region: value, district: '' });
    setErrors({ ...errors, region: '', district: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.region) newErrors.region = 'Region is required';
    if (!formData.district) newErrors.district = 'District is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('Valid form data:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <Label>Region *</Label>
        <RegionSelect
          value={formData.region}
          onValueChange={handleRegionChange}
        />
        {errors.region && (
          <p className="text-xs text-red-600">{errors.region}</p>
        )}
      </div>

      <div>
        <Label>District *</Label>
        <DistrictSelect
          value={formData.district}
          onValueChange={(value) => {
            setFormData({ ...formData, district: value });
            setErrors({ ...errors, district: '' });
          }}
          regionId={formData.region}
        />
        {errors.district && (
          <p className="text-xs text-red-600">{errors.district}</p>
        )}
      </div>

      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### Example 3: Multiple Locations

```tsx
function MultipleLocations() {
  const [primary, setPrimary] = useState({ region: '', district: '' });
  const [secondary, setSecondary] = useState({ region: '', district: '' });

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3>Primary Location</h3>
        <RegionSelect
          value={primary.region}
          onValueChange={(value) => setPrimary({ region: value, district: '' })}
        />
        <DistrictSelect
          value={primary.district}
          onValueChange={(value) => setPrimary({ ...primary, district: value })}
          regionId={primary.region}
        />
      </div>

      <div className="space-y-4">
        <h3>Secondary Location</h3>
        <RegionSelect
          value={secondary.region}
          onValueChange={(value) => setSecondary({ region: value, district: '' })}
        />
        <DistrictSelect
          value={secondary.district}
          onValueChange={(value) => setSecondary({ ...secondary, district: value })}
          regionId={secondary.region}
        />
      </div>
    </div>
  );
}
```

---

## 🎨 Component Architecture

### Data Flow

```
Component Mount
    ↓
useEffect Hook (watches regionId & searchQuery)
    ↓
fetchDistricts({ region: regionId, search: searchQuery })
    ↓
Set Loading State
    ↓
API Response
    ↓
Update Districts State
    ↓
Render Dropdown
    ↓
User Selects Region (parent component)
    ↓
regionId Prop Changes
    ↓
useEffect Triggers
    ↓
Fetch Districts for New Region
    ↓
Update Dropdown
```

### State Management

```typescript
const [open, setOpen] = useState(false);                // Dropdown open/close
const [districts, setDistricts] = useState<District[]>([]); // District list
const [loading, setLoading] = useState(false);          // Loading state
const [searchQuery, setSearchQuery] = useState('');     // Search term
const [error, setError] = useState<string | null>(null); // Error state
```

---

## ⚠️ Important: Clear District on Region Change

**Always clear the district value when the region changes** to prevent having a district selected that doesn't belong to the current region.

### ✅ Correct Implementation

```tsx
const handleRegionChange = (value: string) => {
  setRegion(value);
  setDistrict(''); // Clear district when region changes
};

<RegionSelect
  value={region}
  onValueChange={handleRegionChange}
/>
```

### ❌ Incorrect Implementation

```tsx
// DON'T DO THIS - district won't be cleared
<RegionSelect
  value={region}
  onValueChange={setRegion} // Missing district clear logic
/>
```

---

## 🔍 Features in Detail

### 1. Region Filtering

- **Automatic** - Districts filtered by `regionId` prop
- **Dynamic** - Updates when `regionId` changes
- **Smart Disabled** - Disables when no region selected
- **Clear Message** - Shows "Please select a region first"

### 2. Search Functionality

- **Real-time search** - Updates as you type
- **Server-side filtering** - API handles search
- **Debounced** - Reduces API calls
- **Case-insensitive** - Backend handles matching

### 3. Loading States

- **Spinner** - Shows while fetching
- **Empty state** - "No district found"
- **Error state** - User-friendly error display
- **Region required** - Shows when no region selected

### 4. Display Format

- **Primary** - District name
- **Secondary** - Description (if available)
- **Tertiary** - Region name
- **Check mark** - Selected indicator

---

## 📚 Service Functions

```typescript
// Fetch districts for a region
const districts = await fetchDistricts({
  region: 'region-uuid',
  is_active: true,
  ordering: 'name'
});

// Search districts in a region
const filtered = await fetchDistricts({
  region: 'region-uuid',
  search: 'Kampala'
});

// Get single district
const district = await fetchDistrictById('uuid');

// Create district
const newDistrict = await createDistrict({
  name: 'New District',
  region: 'region-uuid',
  description: 'Description'
});

// Update district
const updated = await updateDistrict('uuid', {
  name: 'Updated Name'
});

// Delete district
await deleteDistrict('uuid');
```

---

## 🎯 Type Definitions

### District Model

```typescript
interface District {
  id: string;
  region_name: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  name: string;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
  region: string;
}
```

---

## 🐛 Troubleshooting

### Districts not loading

**Causes:**
- No region selected
- Invalid region ID
- API endpoint not accessible

**Solutions:**
1. Ensure `regionId` prop is provided
2. Verify region ID is valid UUID
3. Check browser console for errors

### Component always disabled

**Causes:**
- `regionId` is empty/undefined
- `disabled` prop is true

**Solutions:**
1. Select a region first
2. Check `disabled` prop value

### Wrong districts showing

**Causes:**
- `regionId` not updated
- District not cleared on region change

**Solutions:**
1. Ensure `regionId` matches selected region
2. Clear district when region changes

---

## ✅ Best Practices

1. **Always pair with RegionSelect**
   ```tsx
   <RegionSelect ... />
   <DistrictSelect regionId={region} ... />
   ```

2. **Clear district on region change**
   ```tsx
   const handleRegionChange = (value: string) => {
     setRegion(value);
     setDistrict('');
   };
   ```

3. **Show helpful messages**
   ```tsx
   {!region && <p>Please select a region first</p>}
   ```

4. **Validate both selections**
   ```tsx
   <Button disabled={!region || !district}>Submit</Button>
   ```

5. **Handle errors gracefully**
   ```tsx
   {error && <p className="text-red-600">{error}</p>}
   ```

---

## 📁 File Structure

```
src/
├── models/
│   └── system_administration/
│       ├── region.ts
│       ├── district.ts            # New
│       └── index.ts               # Updated
├── services/
│   └── systemAdministrationService.ts  # Updated with district functions
└── components/
    └── common/
        ├── RegionSelect.tsx
        ├── DistrictSelect.tsx     # New
        ├── DistrictSelect.example.tsx  # New
        ├── DistrictSelect.README.md    # New
        └── index.ts               # Updated
```

---

## ✅ Checklist

- [x] Model created (`district.ts`)
- [x] Service updated with district functions
- [x] Component created (`DistrictSelect.tsx`)
- [x] Examples created (`DistrictSelect.example.tsx`)
- [x] Documentation created (`DistrictSelect.README.md`)
- [x] Exports updated (`index.ts`)
- [x] TypeScript types defined
- [x] Error handling implemented
- [x] Loading states implemented
- [x] Region filtering working
- [x] Search functionality working
- [x] Smart disabled state working
- [x] Keyboard navigation supported
- [x] Accessible (ARIA labels)
- [x] Responsive design

---

## 🎉 Summary

You now have a **fully-featured DistrictSelect component** that:

✅ Fetches districts from API  
✅ Filters by selected region  
✅ Supports real-time search  
✅ Has loading and error states  
✅ Auto-disables when no region selected  
✅ Is fully accessible  
✅ Works in forms  
✅ Is type-safe with TypeScript  
✅ Has comprehensive documentation  
✅ Includes usage examples  

**Ready to use!** 🚀

```tsx
import { RegionSelect, DistrictSelect } from '@/components/common';

const [region, setRegion] = useState('');
const [district, setDistrict] = useState('');

<RegionSelect
  value={region}
  onValueChange={(value) => {
    setRegion(value);
    setDistrict(''); // Clear district
  }}
/>

<DistrictSelect
  value={district}
  onValueChange={setDistrict}
  regionId={region}
/>
```
