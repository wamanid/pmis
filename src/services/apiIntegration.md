# API Integration Guide

This document provides guidance on integrating the Station Dashboard with your Django backend API endpoints.

## Configuration

Update the following constants in `/services/mockApi.ts`:

```typescript
const API_BASE_URL = 'https://your-api-domain.com'; // Your Django API base URL
const STATION_ID = 1; // Station ID from authentication context
```

## Required API Endpoints

### 1. Lockup Statistics
**Endpoint:** `GET /api/stations/{station_id}/lockups/stats`

**Query Parameters:**
- `date` (optional): Filter by specific date (format: YYYY-MM-DD)
- `start_date` (optional): Date range start
- `end_date` (optional): Date range end

**Expected Response:**
```json
{
  "manual": 45,
  "system": 78,
  "total": 123,
  "trend": 12.5,
  "by_location": {
    "court": 35,
    "labour": 48,
    "station": 40
  },
  "by_type": [
    {"type_name": "Remand", "count": 56},
    {"type_name": "Convicted", "count": 45}
  ]
}
```

**Django View Logic:**
- Aggregate `StationManualLockup` and `StationSystemLockup` counts
- Group by `location` and `type`
- Calculate trend by comparing with previous week/month

---

### 2. Congestion Level
**Endpoint:** `GET /api/stations/{station_id}/congestion`

**Expected Response:**
```json
{
  "level": "High",
  "percentage": 87,
  "capacity": 500,
  "current": 435,
  "available": 65,
  "blocks_summary": {
    "total_blocks": 5,
    "overcrowded_blocks": 2,
    "at_capacity_blocks": 1
  }
}
```

**Django View Logic:**
- Sum all `Block.capacity` for the station
- Count current prisoners from `Cell` or `Ward` occupancy
- Calculate percentage and determine level:
  - Low: < 60%
  - Medium: 60-75%
  - High: 75-90%
  - Critical: > 90%

---

### 3. Complaint Statistics
**Endpoint:** `GET /api/stations/{station_id}/complaints/stats`

**Query Parameters:**
- `start_date` (optional): Date range start
- `end_date` (optional): Date range end

**Expected Response:**
```json
{
  "total": 156,
  "resolved": 98,
  "pending": 58,
  "by_priority": [
    {"priority": "Critical", "count": 12},
    {"priority": "Emergency", "count": 25}
  ],
  "by_nature": [
    {"name": "Facility", "count": 45},
    {"name": "Medical", "count": 32}
  ],
  "average_resolution_time": 3.5
}
```

**Django View Logic:**
- Query `StationComplaint` model
- Filter by `complaint_status` ('OPEN' vs 'CLOSED')
- Group by `complaint_priority` and `nature_of_complaint`
- Calculate average days between `complaint_date` and `date_of_response`

---

### 4. Admissions & Discharges
**Endpoint:** `GET /api/stations/{station_id}/admissions-discharges`

**Query Parameters:**
- `days` (default: 7): Number of days to retrieve

**Expected Response:**
```json
[
  {
    "date": "2025-10-08",
    "admissions": 12,
    "discharges": 8,
    "net_change": 4
  },
  {
    "date": "2025-10-09",
    "admissions": 15,
    "discharges": 10,
    "net_change": 5
  }
]
```

**Django View Logic:**
- Query admission/discharge records from prisoner admission model
- Group by date
- Calculate net change (admissions - discharges)

---

### 5. Block Allocation Summary
**Endpoint:** `GET /api/stations/{station_id}/blocks/allocation`

**Expected Response:**
```json
[
  {
    "blockName": "Maximum Security Block",
    "blockNumber": "A-001",
    "capacity": 100,
    "occupied": 87,
    "available": 13,
    "wards": [
      {
        "ward_name": "Ward A1",
        "ward_capacity": 50,
        "ward_occupied": 45
      }
    ]
  }
]
```

**Django View Logic:**
- Query `Block` model with related `Ward` data
- For each block:
  - Get total capacity from `Block.capacity`
  - Count occupied cells/wards
  - Include ward breakdown with occupancy

---

### 6. Staff Deployment
**Endpoint:** `GET /api/stations/{station_id}/staff/deployment`

**Query Parameters:**
- `date` (optional): Specific date (default: today)

**Expected Response:**
```json
[
  {
    "deployment_area": "Reception",
    "assigned": 45,
    "present": 42,
    "absent": 3,
    "by_rank": [
      {
        "rank": "Inspector",
        "assigned": 5,
        "present": 5,
        "absent": 0
      }
    ]
  }
]
```

**Django View Logic:**
- Query `StationShiftDeployment` for current date
- Join with `StationAttendance` to get present/absent counts
- Group by `deployment_area`
- Include breakdown by `rank`

---

## Authentication

All API requests should include authentication headers:

```typescript
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
};
```

## Error Handling

Implement proper error handling in the API service:

```typescript
try {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return await response.json();
} catch (error) {
  console.error('API call failed:', error);
  // Handle error appropriately
  throw error;
}
```

## Data Refresh

Consider implementing:
1. **Manual Refresh**: Button to reload dashboard data
2. **Auto Refresh**: Poll API every 5-10 minutes for live data
3. **WebSocket**: Real-time updates for critical metrics

## Additional Endpoints (Optional)

### Manual Lockups
`GET /api/stations/{station_id}/lockups/manual?date={date}`

Returns detailed list of manual lockup records.

### System Lockups
`GET /api/stations/{station_id}/lockups/system?date={date}`

Returns detailed list of system lockup records.

### Complaints List
`GET /api/stations/{station_id}/complaints?status={OPEN|CLOSED}`

Returns paginated list of complaints with full details.

### Staff Attendance
`GET /api/stations/{station_id}/staff/attendance?date={date}`

Returns detailed attendance records for a specific date.

## Migration Steps

1. Update `API_BASE_URL` in `/services/mockApi.ts`
2. Implement authentication token management
3. Replace mock functions with actual fetch calls
4. Test each endpoint individually
5. Implement error handling and loading states
6. Add retry logic for failed requests
7. Set up data refresh mechanism
