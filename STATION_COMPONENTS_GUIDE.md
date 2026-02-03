# Station Components - Implementation Guide

## 📦 What Was Created

Two comprehensive components for working with prison stations: a searchable dropdown selector and a detailed view component.

### Core Files Created/Updated

#### 1. Model Files
- **`src/models/system_administration/station.ts`** - Station type definitions
- **`src/models/system_administration/index.ts`** - Updated with station exports

#### 2. Service File
- **`src/services/systemAdministrationService.ts`** - Updated with station functions
  - `fetchStations()` - Get stations with extensive filtering options
  - `fetchStationById()` - Get single station details
  - `createStation()`, `updateStation()`, `patchStation()`, `deleteStation()`

#### 3. Component Files
- **`src/components/common/StationSelect.tsx`** - Searchable dropdown selector
- **`src/components/common/StationSelect.example.tsx`** - Usage examples
- **`src/components/station/StationDetail.tsx`** - Detailed station view component
- **`src/components/common/index.ts`** - Updated with exports

---

## ✨ Components Overview

### 1. StationSelect Component

A searchable dropdown for selecting stations with advanced filtering capabilities.

#### Features
- ✅ **Searchable dropdown** - Real-time search with API integration
- ✅ **Multi-level filtering** - Filter by region, district, category, gender, security level, station type
- ✅ **Async loading** - Fetches from API with loading states
- ✅ **Error handling** - User-friendly error messages
- ✅ **Smart display** - Shows station name, code, district, and region
- ✅ **TypeScript** - Full type safety

### 2. StationDetail Component

A comprehensive detail view for displaying complete station information.

#### Features
- ✅ **Complete information display** - All station details organized in cards
- ✅ **Loading states** - Skeleton loaders while fetching
- ✅ **Error handling** - User-friendly error messages
- ✅ **Responsive layout** - Grid-based responsive design
- ✅ **Visual indicators** - Badges for status, icons for categories
- ✅ **Capacity tracking** - Shows capacity, occupancy, congestion, overcrowding status

---

## 🚀 Quick Start

### StationSelect - Basic Usage

```tsx
import { useState } from 'react';
import { RegionSelect, DistrictSelect, StationSelect } from '@/components/common';

function MyComponent() {
  const [region, setRegion] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [station, setStation] = useState<string>('');

  const handleRegionChange = (value: string) => {
    setRegion(value);
    setDistrict('');
    setStation('');
  };

  const handleDistrictChange = (value: string) => {
    setDistrict(value);
    setStation('');
  };

  return (
    <div className="space-y-4">
      <RegionSelect
        value={region}
        onValueChange={handleRegionChange}
      />
      
      <DistrictSelect
        value={district}
        onValueChange={handleDistrictChange}
        regionId={region}
      />
      
      <StationSelect
        value={station}
        onValueChange={setStation}
        regionId={region}
        districtId={district}
      />
    </div>
  );
}
```

### StationDetail - Basic Usage

```tsx
import { StationDetail } from '@/components/station/StationDetail';

function MyComponent() {
  const stationId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

  return (
    <StationDetail 
      stationId={stationId}
      onError={(error) => console.error(error)}
    />
  );
}
```

---

## 📋 Component APIs

### StationSelect Props

```typescript
interface StationSelectProps {
  value?: string;              // Selected station ID (UUID)
  onValueChange?: (value: string) => void;  // Selection callback
  regionId?: string;           // Filter by region UUID
  districtId?: string;         // Filter by district UUID
  categoryId?: string;         // Filter by category UUID
  genderId?: string;           // Filter by gender UUID
  securityLevelId?: string;    // Filter by security level UUID
  stationTypeId?: string;      // Filter by station type UUID
  placeholder?: string;        // Placeholder text (default: "Select station...")
  disabled?: boolean;          // Disable component (default: false)
  className?: string;          // Additional CSS classes
}
```

### StationDetail Props

```typescript
interface StationDetailProps {
  stationId: string;           // Station UUID to display
  onError?: (error: string) => void;  // Error callback
}
```

---

## 🔧 API Integration

### Endpoint

```
GET /api/system-administration/stations/
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | `string` | Search term for filtering |
| `region` | `string` | Region UUID to filter by |
| `district` | `string` | District UUID to filter by |
| `category` | `string` | Category UUID to filter by |
| `gender` | `string` | Gender UUID to filter by |
| `security_level` | `string` | Security level UUID to filter by |
| `station_type` | `string` | Station type UUID to filter by |
| `is_active` | `boolean` | Filter by active status (default: true) |
| `ordering` | `string` | Sort field (default: 'name') |
| `page` | `number` | Page number for pagination |

### Response Format

```json
{
  "count": 123,
  "next": "/api/system-administration/stations/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "name": "Luzira Maximum Security Prison",
      "station_code": "LUZ-001",
      "district_name": "Kampala",
      "region_name": "Central",
      "security_level_name": "Maximum",
      "category_name": "Main Prison",
      "station_type_name": "Prison",
      "gender_name": "Male",
      "capacity": "1500",
      "occupancy": "1800",
      "congestion": "120%",
      "is_overcrowded": "true",
      "manual_capacity": 1500,
      "date_opened": "1925-01-01",
      "physical_address": "Luzira, Kampala",
      "phone_number": "+256-XXX-XXXXXX",
      "email": "luzira@prisons.go.ug",
      "pmis_available": true,
      "is_active": true
    }
  ]
}
```

---

## 💡 Usage Examples

### Example 1: Complete Location Hierarchy

```tsx
function LocationSelector() {
  const [location, setLocation] = useState({
    region: '',
    district: '',
    station: ''
  });

  return (
    <div className="space-y-4">
      <div>
        <Label>Region *</Label>
        <RegionSelect
          value={location.region}
          onValueChange={(value) => setLocation({ 
            region: value, 
            district: '', 
            station: '' 
          })}
        />
      </div>

      <div>
        <Label>District *</Label>
        <DistrictSelect
          value={location.district}
          onValueChange={(value) => setLocation({ 
            ...location, 
            district: value, 
            station: '' 
          })}
          regionId={location.region}
        />
      </div>

      <div>
        <Label>Station *</Label>
        <StationSelect
          value={location.station}
          onValueChange={(value) => setLocation({ 
            ...location, 
            station: value 
          })}
          regionId={location.region}
          districtId={location.district}
        />
      </div>
    </div>
  );
}
```

### Example 2: Station with Detail View

```tsx
function StationViewer() {
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [station, setStation] = useState('');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Station</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <RegionSelect
            value={region}
            onValueChange={(value) => {
              setRegion(value);
              setDistrict('');
              setStation('');
            }}
          />
          <DistrictSelect
            value={district}
            onValueChange={(value) => {
              setDistrict(value);
              setStation('');
            }}
            regionId={region}
          />
          <StationSelect
            value={station}
            onValueChange={setStation}
            regionId={region}
            districtId={district}
          />
        </CardContent>
      </Card>

      {station && <StationDetail stationId={station} />}
    </div>
  );
}
```

### Example 3: Advanced Filtering

```tsx
function AdvancedStationSelector() {
  const [filters, setFilters] = useState({
    region: '',
    district: '',
    category: '',
    gender: '',
    securityLevel: '',
    station: ''
  });

  return (
    <StationSelect
      value={filters.station}
      onValueChange={(value) => setFilters({ ...filters, station: value })}
      regionId={filters.region}
      districtId={filters.district}
      categoryId={filters.category}
      genderId={filters.gender}
      securityLevelId={filters.securityLevel}
    />
  );
}
```

---

## 🎨 StationDetail Component Sections

The StationDetail component displays information in organized cards:

### 1. Header Card
- Station name and code
- Active/Inactive status badge
- Region, District, Security Level, Date Opened

### 2. Classification Card
- Category
- Station Type
- Gender
- Jurisdiction Area

### 3. Capacity & Occupancy Card
- Manual Capacity
- Current Capacity
- Occupancy
- Congestion
- Overcrowded status badge

### 4. Contact Information Card
- Phone Number
- Fax Number
- Email
- Alternate Email
- Physical Address
- Postal Address
- GPS Location

### 5. System Information Card
- PMIS Available status
- Created datetime
- Last Updated datetime

---

## ⚠️ Important: Cascading Selections

**Always clear dependent selections when parent changes:**

```tsx
// ✅ Correct
const handleRegionChange = (value: string) => {
  setRegion(value);
  setDistrict('');  // Clear district
  setStation('');   // Clear station
};

const handleDistrictChange = (value: string) => {
  setDistrict(value);
  setStation('');   // Clear station
};

// ❌ Incorrect - doesn't clear dependent selections
const handleRegionChange = (value: string) => {
  setRegion(value);  // Missing clears!
};
```

---

## 📚 Service Functions

```typescript
// Fetch stations with filters
const stations = await fetchStations({
  region: 'region-uuid',
  district: 'district-uuid',
  category: 'category-uuid',
  gender: 'gender-uuid',
  security_level: 'security-level-uuid',
  station_type: 'station-type-uuid',
  is_active: true,
  search: 'Luzira',
  ordering: 'name'
});

// Get single station
const station = await fetchStationById('station-uuid');

// Create station
const newStation = await createStation({
  name: 'New Station',
  station_code: 'NEW-001',
  region: 'region-uuid',
  district: 'district-uuid',
  // ... other fields
});

// Update station
const updated = await updateStation('station-uuid', {
  name: 'Updated Name'
});

// Delete station
await deleteStation('station-uuid');
```

---

## 🎯 Type Definitions

### Station Model

```typescript
interface Station {
  id: string;
  name: string;
  station_code: string;
  district_name: string;
  region_name: string;
  security_level_name: string;
  category_name: string;
  station_type_name: string;
  gender_name: string;
  jurisdiction_area_name: string;
  capacity: string;
  occupancy: string;
  congestion: string;
  is_overcrowded: string;
  manual_capacity: number;
  date_opened: string;
  physical_address: string;
  postal_address: string;
  gps_location: string;
  phone_number: string;
  fax_number: string;
  email: string;
  alternate_email: string;
  pmis_available: boolean;
  is_active: boolean;
  created_datetime: string;
  updated_datetime: string;
  deleted_datetime: string | null;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
  district: string;
  region: string;
  security_level: string;
  category: string;
  station_type: string;
  jurisdiction_area: string;
  gender: string;
}
```

---

## 🐛 Troubleshooting

### Stations not loading

**Causes:**
- No filters applied
- Invalid filter IDs
- API endpoint not accessible

**Solutions:**
1. Check at least one filter is provided (region or district recommended)
2. Verify filter IDs are valid UUIDs
3. Check browser console for errors

### StationDetail shows error

**Causes:**
- Invalid station ID
- Station not found
- API error

**Solutions:**
1. Verify station ID is valid UUID
2. Check station exists in database
3. Check API response in Network tab

---

## ✅ Best Practices

1. **Use complete hierarchy**
   ```tsx
   <RegionSelect ... />
   <DistrictSelect regionId={region} ... />
   <StationSelect regionId={region} districtId={district} ... />
   ```

2. **Clear dependent selections**
   ```tsx
   const handleRegionChange = (value: string) => {
     setRegion(value);
     setDistrict('');
     setStation('');
   };
   ```

3. **Show station details**
   ```tsx
   {station && <StationDetail stationId={station} />}
   ```

4. **Handle errors gracefully**
   ```tsx
   <StationDetail 
     stationId={station}
     onError={(error) => toast.error(error)}
   />
   ```

5. **Validate selections**
   ```tsx
   <Button disabled={!region || !district || !station}>
     Submit
   </Button>
   ```

---

## 📁 File Structure

```
src/
├── models/
│   └── system_administration/
│       ├── region.ts
│       ├── district.ts
│       ├── station.ts            # New
│       └── index.ts              # Updated
├── services/
│   └── systemAdministrationService.ts  # Updated with station functions
└── components/
    ├── common/
    │   ├── StationSelect.tsx     # New
    │   ├── StationSelect.example.tsx  # New
    │   └── index.ts              # Updated
    └── station/
        └── StationDetail.tsx     # New
```

---

## ✅ Checklist

- [x] Model created (`station.ts`)
- [x] Service updated with station functions
- [x] StationSelect component created
- [x] StationDetail component created
- [x] Examples created
- [x] Exports updated
- [x] TypeScript types defined
- [x] Error handling implemented
- [x] Loading states implemented
- [x] Multi-level filtering working
- [x] Search functionality working
- [x] Detail view comprehensive
- [x] Responsive design
- [x] Accessible (ARIA labels)

---

## 🎉 Summary

You now have **two powerful station components**:

### StationSelect
✅ Searchable dropdown  
✅ Multi-level filtering (region, district, category, gender, security level, station type)  
✅ Real-time search  
✅ Loading and error states  
✅ Smart display (name, code, location)  

### StationDetail
✅ Complete station information  
✅ Organized in themed cards  
✅ Capacity and occupancy tracking  
✅ Contact information  
✅ System information  
✅ Visual indicators and badges  

**Ready to use!** 🚀

```tsx
import { StationSelect } from '@/components/common';
import { StationDetail } from '@/components/station/StationDetail';

// Selector
<StationSelect
  value={station}
  onValueChange={setStation}
  regionId={region}
  districtId={district}
/>

// Detail View
<StationDetail stationId={station} />
```
