# RegionSelect Component - Implementation Guide

## 📦 What Was Created

A fully-featured, searchable dropdown component for selecting regions from the system administration API.

### Core Files Created

#### 1. Model Files
- **`src/models/system_administration/region.ts`** - Region type definitions
- **`src/models/system_administration/index.ts`** - Barrel exports

#### 2. Service File
- **`src/services/systemAdministrationService.ts`** - API service for regions
  - `fetchRegions()` - Get regions with search/pagination
  - `fetchRegionById()` - Get single region
  - `createRegion()` - Create new region
  - `updateRegion()` - Update region
  - `patchRegion()` - Partial update
  - `deleteRegion()` - Delete region

#### 3. Component Files
- **`src/components/common/RegionSelect.tsx`** - Main component
- **`src/components/common/RegionSelect.example.tsx`** - Usage examples
- **`src/components/common/RegionSelect.README.md`** - Documentation
- **`src/components/common/index.ts`** - Updated with exports

---

## ✨ Features

### Component Features
- ✅ **Searchable dropdown** - Real-time search with API integration
- ✅ **Async loading** - Fetches from API with loading states
- ✅ **Error handling** - User-friendly error messages
- ✅ **Keyboard navigation** - Full accessibility support
- ✅ **Responsive design** - Works on all screen sizes
- ✅ **TypeScript** - Full type safety
- ✅ **Customizable** - Props for styling and behavior

### API Features
- ✅ **Search** - Server-side search filtering
- ✅ **Pagination** - Support for paginated results
- ✅ **Ordering** - Sort by name (default)
- ✅ **Full CRUD** - Create, Read, Update, Delete operations

---

## 🚀 Quick Start

### Basic Usage

```tsx
import { useState } from 'react';
import { RegionSelect } from '@/components/common';

function MyComponent() {
  const [region, setRegion] = useState<string>('');

  return (
    <RegionSelect
      value={region}
      onValueChange={setRegion}
      placeholder="Select a region..."
    />
  );
}
```

### With Label

```tsx
import { Label } from '@/components/ui/label';

<div className="space-y-2">
  <Label>Region</Label>
  <RegionSelect
    value={region}
    onValueChange={setRegion}
  />
</div>
```

### In a Form

```tsx
function MyForm() {
  const [formData, setFormData] = useState({
    name: '',
    region: '',
  });

  return (
    <form>
      <RegionSelect
        value={formData.region}
        onValueChange={(value) => setFormData({ ...formData, region: value })}
      />
    </form>
  );
}
```

---

## 📋 Component API

### Props

```typescript
interface RegionSelectProps {
  value?: string;              // Selected region ID (UUID)
  onValueChange?: (value: string) => void;  // Selection callback
  placeholder?: string;        // Placeholder text (default: "Select region...")
  disabled?: boolean;          // Disable component (default: false)
  className?: string;          // Additional CSS classes
}
```

---

## 🔧 API Integration

### Endpoint

```
GET /api/system-administration/regions/
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | `string` | Search term for filtering |
| `ordering` | `string` | Sort field (default: 'name') |
| `page` | `number` | Page number for pagination |

### Response Format

```json
{
  "count": 123,
  "next": "/api/system-administration/regions/?page=2",
  "previous": null,
  "results": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Central Region",
      "description": "Central administrative region",
      "is_active": true,
      "created_datetime": "2025-11-02T16:45:48.277Z",
      "updated_datetime": "2025-11-02T16:45:48.277Z",
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

### Example 1: Basic Selection

```tsx
const [selectedRegion, setSelectedRegion] = useState<string>('');

<RegionSelect
  value={selectedRegion}
  onValueChange={setSelectedRegion}
/>
```

### Example 2: Form Integration

```tsx
function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    region: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div>
        <Label>Region *</Label>
        <RegionSelect
          value={formData.region}
          onValueChange={(value) => setFormData({ ...formData, region: value })}
        />
      </div>

      <Button type="submit" disabled={!formData.region}>
        Submit
      </Button>
    </form>
  );
}
```

### Example 3: Disabled State

```tsx
<RegionSelect
  value={region}
  onValueChange={setRegion}
  disabled={isLoading}
/>
```

### Example 4: Custom Width

```tsx
<RegionSelect
  value={region}
  onValueChange={setRegion}
  className="w-[300px]"
/>
```

### Example 5: With React Hook Form

```tsx
import { useForm, Controller } from 'react-hook-form';

function MyForm() {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="region"
        control={control}
        rules={{ required: 'Region is required' }}
        render={({ field, fieldState }) => (
          <div>
            <RegionSelect
              value={field.value}
              onValueChange={field.onChange}
            />
            {fieldState.error && (
              <p className="text-red-600 text-sm">{fieldState.error.message}</p>
            )}
          </div>
        )}
      />
    </form>
  );
}
```

---

## 🎨 Component Architecture

### Data Flow

```
Component Mount
    ↓
useEffect Hook
    ↓
fetchRegions() API Call
    ↓
Set Loading State
    ↓
API Response
    ↓
Update Regions State
    ↓
Render Dropdown
    ↓
User Types in Search
    ↓
Update Search Query
    ↓
useEffect Triggers
    ↓
Fetch Filtered Results
    ↓
Update Dropdown
```

### State Management

```typescript
const [open, setOpen] = useState(false);           // Dropdown open/close
const [regions, setRegions] = useState<Region[]>([]); // Region list
const [loading, setLoading] = useState(false);     // Loading state
const [searchQuery, setSearchQuery] = useState(''); // Search term
const [error, setError] = useState<string | null>(null); // Error state
```

---

## 🔍 Features in Detail

### 1. Search Functionality

- **Real-time search** - Updates as you type
- **Server-side filtering** - API handles search
- **Debounced** - Reduces API calls (via useEffect)
- **Case-insensitive** - Backend handles matching

### 2. Loading States

- **Spinner** - Shows while fetching data
- **Empty state** - "No region found" message
- **Error state** - User-friendly error display

### 3. Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Focus component |
| Enter/Space | Open dropdown |
| Arrow Up/Down | Navigate options |
| Enter | Select option |
| Escape | Close dropdown |
| Type | Search regions |

### 4. Display Format

- **Primary text** - Region name
- **Secondary text** - Description (if available)
- **Check mark** - Selected indicator
- **Filtered** - Only active regions shown

---

## 📚 Service Functions

### Available Functions

```typescript
// Fetch regions with optional filters
const regions = await fetchRegions({
  search: 'Central',
  ordering: 'name',
  page: 1
});

// Get single region
const region = await fetchRegionById('uuid');

// Create region
const newRegion = await createRegion({
  name: 'New Region',
  description: 'Description'
});

// Update region
const updated = await updateRegion('uuid', {
  name: 'Updated Name'
});

// Partial update
const patched = await patchRegion('uuid', {
  description: 'New description'
});

// Delete region
await deleteRegion('uuid');
```

---

## 🎯 Type Definitions

### Region Model

```typescript
interface Region {
  id: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  name: string;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
}
```

### List Response

```typescript
interface RegionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Region[];
}
```

### Query Parameters

```typescript
interface RegionQueryParams {
  ordering?: string;
  page?: number;
  search?: string;
}
```

---

## 🧪 Testing

### Manual Testing

1. Navigate to a page using RegionSelect
2. Click the dropdown
3. Type to search for regions
4. Select a region
5. Verify selection is displayed

### Integration Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { RegionSelect } from './RegionSelect';

test('renders and selects region', async () => {
  const handleChange = jest.fn();
  
  render(
    <RegionSelect
      value=""
      onValueChange={handleChange}
    />
  );
  
  // Open dropdown
  fireEvent.click(screen.getByRole('combobox'));
  
  // Wait for regions to load
  await screen.findByText('Central Region');
  
  // Select region
  fireEvent.click(screen.getByText('Central Region'));
  
  // Verify callback
  expect(handleChange).toHaveBeenCalled();
});
```

---

## 🐛 Troubleshooting

### Regions not loading

**Possible causes:**
- API endpoint not accessible
- Authentication token missing/invalid
- CORS issues
- Backend not running

**Solutions:**
1. Check browser console for errors
2. Verify API endpoint in axiosInstance
3. Check authentication token
4. Test API directly with Postman

### Search not working

**Possible causes:**
- API doesn't support search parameter
- Network issues
- Search query not being sent

**Solutions:**
1. Check Network tab in DevTools
2. Verify API supports `?search=` parameter
3. Check service implementation

### Component not displaying

**Possible causes:**
- Missing UI components
- CSS not loaded
- Import errors

**Solutions:**
1. Verify all shadcn/ui components are installed
2. Check Tailwind CSS configuration
3. Check import paths

---

## 📁 File Structure

```
src/
├── models/
│   └── system_administration/
│       ├── region.ts              # Region types
│       └── index.ts               # Exports
├── services/
│   └── systemAdministrationService.ts  # API service
└── components/
    └── common/
        ├── RegionSelect.tsx       # Main component
        ├── RegionSelect.example.tsx  # Examples
        ├── RegionSelect.README.md    # Documentation
        └── index.ts               # Exports
```

---

## ✅ Checklist

- [x] Model created (`region.ts`)
- [x] Service created (`systemAdministrationService.ts`)
- [x] Component created (`RegionSelect.tsx`)
- [x] Examples created (`RegionSelect.example.tsx`)
- [x] Documentation created (`RegionSelect.README.md`)
- [x] Exports updated (`index.ts`)
- [x] TypeScript types defined
- [x] Error handling implemented
- [x] Loading states implemented
- [x] Search functionality working
- [x] Keyboard navigation supported
- [x] Accessible (ARIA labels)
- [x] Responsive design

---

## 🎉 Summary

You now have a **fully-featured RegionSelect component** that:

✅ Fetches regions from API  
✅ Supports real-time search  
✅ Has loading and error states  
✅ Is fully accessible  
✅ Works in forms  
✅ Is type-safe with TypeScript  
✅ Has comprehensive documentation  
✅ Includes usage examples  

**Ready to use!** 🚀

```tsx
import { RegionSelect } from '@/components/common';

<RegionSelect
  value={region}
  onValueChange={setRegion}
/>
```
