# AddressSelect Component

A comprehensive hierarchical address selection component that manages cascading location dropdowns for Uganda's administrative divisions.

## Features

- ✅ **Bi-directional Cascading**: Works both ways - top-down and bottom-up
- ✅ **Forward Cascade**: Region → District → County → Sub-County → Parish → Village
- ✅ **Reverse Cascade**: Village → Parish → Sub-County → County → District → Region
- ✅ **Auto-Reset**: Automatically clears dependent fields when parent changes
- ✅ **Auto-Populate**: Automatically fills parent fields when child is selected
- ✅ **API Integration**: Fetches data from system administration endpoints
- ✅ **Searchable**: All dropdowns support real-time search
- ✅ **Configurable Layout**: Support for 1, 2, or 3 column grid layouts
- ✅ **Flexible**: Can show/hide labels, disable all fields, custom styling

## API Endpoints

The component uses the following API endpoints with filtering:

```
/api/system-administration/regions/
/api/system-administration/districts/?region={region_id}
/api/system-administration/counties/?district={district_id}
/api/system-administration/sub-counties/?county={county_id}
/api/system-administration/parishes/?sub_county={sub_county_id}
/api/system-administration/villages/?parish={parish_id}
```

## Basic Usage

```tsx
import { useState } from 'react';
import { AddressSelect } from './components/common/AddressSelect';

function MyComponent() {
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [county, setCounty] = useState('');
  const [subCounty, setSubCounty] = useState('');
  const [parish, setParish] = useState('');
  const [village, setVillage] = useState('');

  return (
    <AddressSelect
      region={region}
      district={district}
      county={county}
      subCounty={subCounty}
      parish={parish}
      village={village}
      onRegionChange={setRegion}
      onDistrictChange={setDistrict}
      onCountyChange={setCounty}
      onSubCountyChange={setSubCounty}
      onParishChange={setParish}
      onVillageChange={setVillage}
    />
  );
}
```

## With React Hook Form

```tsx
import { useForm } from 'react-hook-form';
import { AddressSelect } from './components/common/AddressSelect';

interface FormData {
  region: string;
  district: string;
  county: string;
  sub_county: string;
  parish: string;
  village: string;
}

function MyForm() {
  const { watch, setValue, handleSubmit } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log('Address IDs:', data);
    // All fields contain IDs, not names
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AddressSelect
        region={watch('region')}
        district={watch('district')}
        county={watch('county')}
        subCounty={watch('sub_county')}
        parish={watch('parish')}
        village={watch('village')}
        onRegionChange={(value) => setValue('region', value)}
        onDistrictChange={(value) => setValue('district', value)}
        onCountyChange={(value) => setValue('county', value)}
        onSubCountyChange={(value) => setValue('sub_county', value)}
        onParishChange={(value) => setValue('parish', value)}
        onVillageChange={(value) => setValue('village', value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `region` | `string` | `undefined` | Selected region ID |
| `district` | `string` | `undefined` | Selected district ID |
| `county` | `string` | `undefined` | Selected county ID |
| `subCounty` | `string` | `undefined` | Selected sub-county ID |
| `parish` | `string` | `undefined` | Selected parish ID |
| `village` | `string` | `undefined` | Selected village ID |
| `onRegionChange` | `(value: string) => void` | `undefined` | Region change handler |
| `onDistrictChange` | `(value: string) => void` | `undefined` | District change handler |
| `onCountyChange` | `(value: string) => void` | `undefined` | County change handler |
| `onSubCountyChange` | `(value: string) => void` | `undefined` | Sub-county change handler |
| `onParishChange` | `(value: string) => void` | `undefined` | Parish change handler |
| `onVillageChange` | `(value: string) => void` | `undefined` | Village change handler |
| `disabled` | `boolean` | `false` | Disable all dropdowns |
| `className` | `string` | `''` | Additional CSS classes |
| `showLabels` | `boolean` | `true` | Show/hide field labels |
| `gridCols` | `1 \| 2 \| 3` | `2` | Number of columns in grid layout |
| `enableReverseCascade` | `boolean` | `true` | Enable automatic parent population when child is selected |

## Advanced Examples

### Custom Grid Layout (3 columns)

```tsx
<AddressSelect
  {...addressProps}
  gridCols={3}
/>
```

### Without Labels

```tsx
<AddressSelect
  {...addressProps}
  showLabels={false}
/>
```

### Single Column Layout

```tsx
<AddressSelect
  {...addressProps}
  gridCols={1}
/>
```

### Multiple Addresses in Same Form

```tsx
function MultiAddressForm() {
  const { watch, setValue } = useForm();

  return (
    <div className="space-y-8">
      {/* Birth Place */}
      <div>
        <h3>Birth Place</h3>
        <AddressSelect
          region={watch('birth_region')}
          district={watch('birth_district')}
          county={watch('birth_county')}
          subCounty={watch('birth_sub_county')}
          parish={watch('birth_parish')}
          village={watch('birth_village')}
          onRegionChange={(v) => setValue('birth_region', v)}
          onDistrictChange={(v) => setValue('birth_district', v)}
          onCountyChange={(v) => setValue('birth_county', v)}
          onSubCountyChange={(v) => setValue('birth_sub_county', v)}
          onParishChange={(v) => setValue('birth_parish', v)}
          onVillageChange={(v) => setValue('birth_village', v)}
        />
      </div>

      {/* Home Address */}
      <div>
        <h3>Home Address</h3>
        <AddressSelect
          region={watch('home_region')}
          district={watch('home_district')}
          county={watch('home_county')}
          subCounty={watch('home_sub_county')}
          parish={watch('home_parish')}
          village={watch('home_village')}
          onRegionChange={(v) => setValue('home_region', v)}
          onDistrictChange={(v) => setValue('home_district', v)}
          onCountyChange={(v) => setValue('home_county', v)}
          onSubCountyChange={(v) => setValue('home_sub_county', v)}
          onParishChange={(v) => setValue('home_parish', v)}
          onVillageChange={(v) => setValue('home_village', v)}
        />
      </div>
    </div>
  );
}
```

## How It Works

### Forward Cascading (Top-Down)

When you select a parent location, child dropdowns are filtered:

1. **Region Selection**: User selects a region
   - District dropdown becomes enabled
   - Fetches districts filtered by selected region
   
2. **District Selection**: User selects a district
   - County dropdown becomes enabled
   - Fetches counties filtered by selected district
   - If region changes, district is cleared

3. **County Selection**: User selects a county
   - Sub-County dropdown becomes enabled
   - Fetches sub-counties filtered by selected county
   - If district changes, county is cleared

4. **Sub-County Selection**: User selects a sub-county
   - Parish dropdown becomes enabled
   - Fetches parishes filtered by selected sub-county
   - If county changes, sub-county is cleared

5. **Parish Selection**: User selects a parish
   - Village dropdown becomes enabled
   - Fetches villages filtered by selected parish
   - If sub-county changes, parish is cleared

6. **Village Selection**: User selects a village
   - If parish changes, village is cleared

### Reverse Cascading (Bottom-Up) ⭐ NEW

When you select a child location, parent fields are automatically populated:

1. **Village Selection**: User selects a village
   - Component fetches village details to get parish ID
   - Automatically sets parish
   - Then fetches parish details to get sub-county ID
   - Automatically sets sub-county
   - Continues up the chain to county → district → region

2. **Parish Selection**: User selects a parish (without village)
   - Component fetches parish details to get sub-county ID
   - Automatically sets sub-county
   - Continues up the chain to county → district → region

3. **Sub-County Selection**: User selects a sub-county (without parish/village)
   - Component fetches sub-county details to get county ID
   - Automatically sets county
   - Continues up the chain to district → region

4. **County Selection**: User selects a county (without sub-county/parish/village)
   - Component fetches county details to get district ID
   - Automatically sets district
   - Continues up the chain to region

5. **District Selection**: User selects a district (without county/sub-county/parish/village)
   - Component fetches district details to get region ID
   - Automatically sets region

### Auto-Reset Logic (Forward Cascade)

The component automatically clears dependent fields when a parent field changes:

```
Region changes → Clears: District, County, Sub-County, Parish, Village
District changes → Clears: County, Sub-County, Parish, Village
County changes → Clears: Sub-County, Parish, Village
Sub-County changes → Clears: Parish, Village
Parish changes → Clears: Village
```

### Auto-Populate Logic (Reverse Cascade)

The component automatically populates parent fields when a child field is selected:

```
Village selected → Populates: Parish, Sub-County, County, District, Region
Parish selected → Populates: Sub-County, County, District, Region
Sub-County selected → Populates: County, District, Region
County selected → Populates: District, Region
District selected → Populates: Region
```

### Disabling Reverse Cascade

If you want to disable the reverse cascading behavior:

```tsx
<AddressSelect
  {...addressProps}
  enableReverseCascade={false}
/>
```

## Data Flow

```
User selects Region (ID: "r1")
  ↓
Component calls onRegionChange("r1")
  ↓
Parent updates region state
  ↓
DistrictSelect fetches: /districts/?region=r1
  ↓
User selects District (ID: "d1")
  ↓
Component calls onDistrictChange("d1")
  ↓
Parent updates district state
  ↓
CountySelect fetches: /counties/?district=d1
  ↓
... and so on
```

## Notes

- All values are **IDs**, not names
- Dropdowns display **names** but store **IDs**
- Each dropdown is disabled until its parent has a value
- Search functionality is available in all dropdowns
- Component handles loading states and errors automatically

## See Also

- `RegionSelect.tsx` - Individual region selector
- `DistrictSelect.tsx` - Individual district selector
- `CountySelect.tsx` - Individual county selector
- `SubCountySelect.tsx` - Individual sub-county selector
- `ParishSelect.tsx` - Individual parish selector
- `VillageSelect.tsx` - Individual village selector
- `AddressSelect.example.tsx` - More usage examples
