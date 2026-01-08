# DistrictSelect Component

A searchable dropdown component for selecting districts from the system administration API, with support for filtering by region.

## Features

- ✅ **Searchable**: Real-time search with API integration
- ✅ **Region Filtering**: Automatically filters districts by selected region
- ✅ **Async Loading**: Fetches districts from API with loading states
- ✅ **Error Handling**: Displays error messages if API fails
- ✅ **Smart Disabled State**: Auto-disables when no region is selected
- ✅ **Accessible**: Built on Radix UI primitives
- ✅ **Keyboard Navigation**: Full keyboard support
- ✅ **Responsive**: Works on all screen sizes
- ✅ **TypeScript**: Full type safety

## Installation

The component is already installed in your project. Simply import it:

```tsx
import { DistrictSelect } from '@/components/common/DistrictSelect';
// or
import { DistrictSelect } from '@/components/common';
```

## Basic Usage

```tsx
import { useState } from 'react';
import { RegionSelect, DistrictSelect } from '@/components/common';

function MyComponent() {
  const [region, setRegion] = useState<string>('');
  const [district, setDistrict] = useState<string>('');

  return (
    <>
      <RegionSelect
        value={region}
        onValueChange={(value) => {
          setRegion(value);
          setDistrict(''); // Clear district when region changes
        }}
      />
      
      <DistrictSelect
        value={district}
        onValueChange={setDistrict}
        regionId={region}
        placeholder="Select a district..."
      />
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `undefined` | The selected district ID (UUID) |
| `onValueChange` | `(value: string) => void` | `undefined` | Callback when selection changes |
| `regionId` | `string` | `undefined` | Region ID to filter districts by |
| `placeholder` | `string` | `'Select district...'` | Placeholder text when no selection |
| `disabled` | `boolean` | `false` | Disable the component |
| `className` | `string` | `undefined` | Additional CSS classes |

## Examples

### 1. Basic Usage with Region

```tsx
const [region, setRegion] = useState<string>('');
const [district, setDistrict] = useState<string>('');

const handleRegionChange = (value: string) => {
  setRegion(value);
  setDistrict(''); // Reset district when region changes
};

<>
  <RegionSelect
    value={region}
    onValueChange={handleRegionChange}
  />
  
  <DistrictSelect
    value={district}
    onValueChange={setDistrict}
    regionId={region}
  />
</>
```

### 2. With Labels

```tsx
import { Label } from '@/components/ui/label';

<div className="space-y-4">
  <div className="space-y-2">
    <Label>Region *</Label>
    <RegionSelect
      value={region}
      onValueChange={handleRegionChange}
    />
  </div>
  
  <div className="space-y-2">
    <Label>District *</Label>
    <DistrictSelect
      value={district}
      onValueChange={setDistrict}
      regionId={region}
    />
    {!region && (
      <p className="text-xs text-muted-foreground">
        Please select a region first
      </p>
    )}
  </div>
</div>
```

### 3. In a Form

```tsx
function LocationForm() {
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    district: '',
  });

  const handleRegionChange = (value: string) => {
    setFormData({ ...formData, region: value, district: '' });
  };

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
      </div>

      <Button type="submit" disabled={!formData.region || !formData.district}>
        Submit
      </Button>
    </form>
  );
}
```

### 4. Multiple Locations

```tsx
function MultipleLocations() {
  const [primary, setPrimary] = useState({ region: '', district: '' });
  const [secondary, setSecondary] = useState({ region: '', district: '' });

  return (
    <div className="space-y-6">
      <div>
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

      <div>
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

## API Integration

The component fetches data from:

```
GET /api/system-administration/districts/
```

### Query Parameters

- `search` - Search term for filtering districts
- `region` - Region UUID to filter districts by
- `is_active` - Filter by active status (default: true)
- `ordering` - Sort order (default: 'name')
- `page` - Page number for pagination

### Response Format

```json
{
  "count": 123,
  "next": "/api/system-administration/districts/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "name": "District Name",
      "description": "District Description",
      "region": "region-uuid",
      "region_name": "Region Name",
      "is_active": true,
      "created_datetime": "2025-11-02T17:11:31.820Z",
      "updated_datetime": "2025-11-02T17:11:31.820Z"
    }
  ]
}
```

## Features in Detail

### Region Filtering

- **Automatic**: Districts are automatically filtered by `regionId` prop
- **Dynamic**: Updates when `regionId` changes
- **Smart Disabled**: Component disables when no region is selected
- **Clear Message**: Shows "Please select a region first" when needed

### Search Functionality

- **Real-time search** - Updates as you type
- **Server-side filtering** - API handles search
- **Debounced** - Reduces API calls (via useEffect)
- **Case-insensitive** - Backend handles matching

### Loading States

- **Spinner** - Shows while fetching data
- **Empty state** - "No district found" message
- **Error state** - User-friendly error display
- **Region required** - Shows message when no region selected

### Display Format

- **Primary text** - District name
- **Secondary text** - Description (if available)
- **Tertiary text** - Region name
- **Check mark** - Selected indicator
- **Filtered** - Only active districts shown

## Important: Clearing District on Region Change

Always clear the district value when the region changes:

```tsx
const handleRegionChange = (value: string) => {
  setRegion(value);
  setDistrict(''); // ⚠️ Important: Clear district when region changes
};
```

This prevents having a district selected that doesn't belong to the current region.

## TypeScript Support

Full TypeScript support with exported types:

```tsx
import type { DistrictSelectProps } from '@/components/common/DistrictSelect';
import type { District } from '@/models/system_administration';
```

## Service Functions

### Available Functions

```typescript
// Fetch districts with filters
const districts = await fetchDistricts({
  region: 'region-uuid',
  search: 'Central',
  is_active: true,
  ordering: 'name',
  page: 1
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

## Troubleshooting

### Districts not loading

**Possible causes:**
- No region selected
- API endpoint not accessible
- Authentication token missing/invalid

**Solutions:**
1. Ensure `regionId` prop is provided
2. Check browser console for errors
3. Verify API endpoint in axiosInstance

### Component always disabled

**Possible causes:**
- `regionId` prop is empty/undefined
- `disabled` prop is true

**Solutions:**
1. Verify region is selected first
2. Check `disabled` prop value

### Wrong districts showing

**Possible causes:**
- `regionId` not updated when region changes
- District not cleared when region changes

**Solutions:**
1. Ensure `regionId` matches selected region
2. Clear district value when region changes

## Best Practices

1. **Always clear district when region changes**
   ```tsx
   const handleRegionChange = (value: string) => {
     setRegion(value);
     setDistrict(''); // Clear district
   };
   ```

2. **Show helpful messages**
   ```tsx
   {!region && (
     <p className="text-xs text-muted-foreground">
       Please select a region first
     </p>
   )}
   ```

3. **Validate both selections**
   ```tsx
   <Button disabled={!region || !district}>
     Submit
   </Button>
   ```

4. **Use with RegionSelect**
   - Always pair with RegionSelect component
   - Maintain proper parent-child relationship

## Related Components

- **RegionSelect** - For selecting regions (required parent)
- **DataTable** - For displaying districts in a table
- **Select** - Basic select component (non-searchable)

## Examples

See `DistrictSelect.example.tsx` for more detailed examples including:
- Basic usage with region
- Form integration with validation
- Multiple district selections
- Disabled state

## License

Part of the PMIS UI project.
