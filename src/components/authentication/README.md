# Authentication Components

## StaffSelect

A searchable dropdown component for selecting staff members from the `/api/accounts/staff-profiles/` API.

### Features

- **Searchable**: Type to search by staff ID or email
- **Debounced Search**: Optimized API calls with 300ms debounce
- **Filtering**: Support for organization, status, and availability filters
- **Loading States**: Shows loading indicator while fetching data
- **Responsive**: Works well on all screen sizes
- **Accessible**: Proper ARIA attributes and keyboard navigation

### Usage

```tsx
import { StaffSelect } from '@/components/authentication/StaffSelect';
import { useState } from 'react';

function MyComponent() {
  const [staffId, setStaffId] = useState<string>('');

  return (
    <StaffSelect
      value={staffId}
      onValueChange={setStaffId}
      placeholder="Select staff member..."
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `undefined` | Currently selected staff ID |
| `onValueChange` | `(value: string) => void` | **Required** | Callback when selection changes |
| `placeholder` | `string` | `'Select staff...'` | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the select |
| `className` | `string` | `undefined` | Additional CSS classes |
| `organizationFilter` | `string` | `undefined` | Filter by organization ID |
| `statusFilter` | `'pending' \| 'active' \| 'inactive' \| 'suspended'` | `undefined` | Filter by staff status |
| `availableOnly` | `boolean` | `undefined` | Show only available staff |

### Examples

#### Basic Usage

```tsx
<StaffSelect
  value={selectedStaffId}
  onValueChange={setSelectedStaffId}
/>
```

#### With Filters

```tsx
<StaffSelect
  value={selectedStaffId}
  onValueChange={setSelectedStaffId}
  statusFilter="active"
  availableOnly={true}
  organizationFilter="org-123"
/>
```

#### Disabled State

```tsx
<StaffSelect
  value={selectedStaffId}
  onValueChange={setSelectedStaffId}
  disabled={true}
/>
```

### API Integration

The component uses the `getStaffProfiles` service from `@/services/auth/staffProfileService.ts` which calls:

```
GET /api/accounts/staff-profiles/
```

**Query Parameters:**
- `search`: Search by staff ID or email
- `organization`: Filter by organization ID
- `status`: Filter by status
- `is_available`: Filter by availability
- `page_size`: Number of results (default: 50)

### Data Model

See `@/models/auth/staffProfile.ts` for the complete `StaffProfile` interface.

Key fields displayed:
- `staff_id`: Staff identification number
- `user_email`: Staff email address
- `organization_name`: Organization name
- `is_available`: Availability status (shown as green dot)

### Styling

The component uses shadcn/ui components:
- `Button` for the trigger
- `Popover` for the dropdown
- `Command` for search and selection

Custom styling can be applied via the `className` prop.
