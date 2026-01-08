# RegionSelect Component

A searchable dropdown component for selecting regions from the system administration API.

## Features

- ✅ **Searchable**: Real-time search with API integration
- ✅ **Async Loading**: Fetches regions from API with loading states
- ✅ **Error Handling**: Displays error messages if API fails
- ✅ **Accessible**: Built on Radix UI primitives
- ✅ **Keyboard Navigation**: Full keyboard support
- ✅ **Responsive**: Works on all screen sizes
- ✅ **TypeScript**: Full type safety
- ✅ **Customizable**: Supports custom styling and placeholder

## Installation

The component is already installed in your project. Simply import it:

```tsx
import { RegionSelect } from '@/components/common/RegionSelect';
// or
import { RegionSelect } from '@/components/common';
```

## Basic Usage

```tsx
import { useState } from 'react';
import { RegionSelect } from '@/components/common/RegionSelect';

function MyComponent() {
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  return (
    <RegionSelect
      value={selectedRegion}
      onValueChange={setSelectedRegion}
      placeholder="Select a region..."
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `undefined` | The selected region ID (UUID) |
| `onValueChange` | `(value: string) => void` | `undefined` | Callback when selection changes |
| `placeholder` | `string` | `'Select region...'` | Placeholder text when no selection |
| `disabled` | `boolean` | `false` | Disable the component |
| `className` | `string` | `undefined` | Additional CSS classes |

## Examples

### 1. Basic Usage

```tsx
const [region, setRegion] = useState<string>('');

<RegionSelect
  value={region}
  onValueChange={setRegion}
/>
```

### 2. With Label

```tsx
import { Label } from '@/components/ui/label';

<div className="space-y-2">
  <Label htmlFor="region">Region</Label>
  <RegionSelect
    value={region}
    onValueChange={setRegion}
    placeholder="Choose a region..."
  />
</div>
```

### 3. In a Form

```tsx
function MyForm() {
  const [formData, setFormData] = useState({
    name: '',
    region: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        
        <div>
          <Label>Region</Label>
          <RegionSelect
            value={formData.region}
            onValueChange={(value) => setFormData({ ...formData, region: value })}
          />
        </div>
        
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
```

### 4. Disabled State

```tsx
<RegionSelect
  value={region}
  onValueChange={setRegion}
  disabled={true}
/>
```

### 5. Custom Styling

```tsx
<RegionSelect
  value={region}
  onValueChange={setRegion}
  className="w-[300px]"
/>
```

### 6. With React Hook Form

```tsx
import { useForm, Controller } from 'react-hook-form';

function MyForm() {
  const { control, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="region"
        control={control}
        rules={{ required: 'Region is required' }}
        render={({ field }) => (
          <RegionSelect
            value={field.value}
            onValueChange={field.onChange}
          />
        )}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

## API Integration

The component fetches data from:

```
GET /api/system-administration/regions/
```

### Query Parameters

- `search` - Search term for filtering regions
- `ordering` - Sort order (default: 'name')
- `page` - Page number for pagination

### Response Format

```json
{
  "count": 123,
  "next": "/api/system-administration/regions/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "name": "Region Name",
      "description": "Region Description",
      "is_active": true,
      "created_datetime": "2025-11-02T16:45:48.277Z",
      "updated_datetime": "2025-11-02T16:45:48.277Z"
    }
  ]
}
```

## Features in Detail

### Search

- Type in the search box to filter regions
- Search is performed server-side via API
- Results update in real-time as you type
- Debounced to avoid excessive API calls

### Loading States

- Shows spinner while fetching data
- Displays "No region found" when search returns empty
- Shows error message if API fails

### Keyboard Navigation

- **Tab** - Focus the component
- **Enter/Space** - Open dropdown
- **Arrow Up/Down** - Navigate options
- **Enter** - Select option
- **Escape** - Close dropdown
- **Type** - Search for regions

### Display

- Shows region name as the main text
- Shows description as secondary text (if available)
- Check mark indicates selected region
- Inactive regions are filtered out automatically

## Styling

The component uses:
- **Tailwind CSS** for styling
- **shadcn/ui** components (Button, Command, Popover)
- **Lucide React** for icons

### Customizing Styles

You can customize the appearance by:

1. **Using className prop**:
```tsx
<RegionSelect className="w-full max-w-md" />
```

2. **Modifying shadcn/ui components**:
Edit the base components in `components/ui/`

3. **Using Tailwind configuration**:
Adjust colors and spacing in `tailwind.config.js`

## Error Handling

The component handles:
- **Network errors** - Shows error message
- **Empty results** - Shows "No region found"
- **Loading states** - Shows spinner
- **API failures** - Logs to console and displays user-friendly message

## Performance

- **Debounced search** - Reduces API calls
- **Efficient rendering** - Only re-renders when necessary
- **Lazy loading** - Fetches data only when needed
- **Caching** - Uses React state to cache results

## Accessibility

- ✅ ARIA labels and roles
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader support
- ✅ Disabled state handling

## Browser Support

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## TypeScript Support

Full TypeScript support with exported types:

```tsx
import type { RegionSelectProps } from '@/components/common/RegionSelect';
import type { Region } from '@/models/system_administration';
```

## Troubleshooting

### Regions not loading

1. Check API endpoint is correct
2. Verify authentication token is valid
3. Check browser console for errors
4. Ensure backend API is running

### Search not working

1. Verify API supports `search` parameter
2. Check network tab for API calls
3. Ensure search query is being sent

### Styling issues

1. Check Tailwind CSS is configured
2. Verify shadcn/ui components are installed
3. Check for CSS conflicts

## Related Components

- **DataTable** - For displaying regions in a table
- **Select** - Basic select component (non-searchable)
- **Command** - Command palette component

## Service & Models

### Service: `systemAdministrationService.ts`

```tsx
import { fetchRegions } from '@/services/systemAdministrationService';

// Fetch all regions
const regions = await fetchRegions();

// Search regions
const filtered = await fetchRegions({ search: 'Central' });

// Paginate
const page2 = await fetchRegions({ page: 2 });
```

### Model: `models/system_administration/region.ts`

```tsx
interface Region {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_datetime: string;
  updated_datetime: string;
  deleted_datetime: string | null;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
}
```

## Examples

See `RegionSelect.example.tsx` for more detailed examples including:
- Basic usage
- Form integration
- Disabled state
- Multiple selectors

## License

Part of the PMIS UI project.
