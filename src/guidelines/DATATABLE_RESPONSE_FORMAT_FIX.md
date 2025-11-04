# DataTable - Response Format Fix

## ✅ Issue Fixed

Successfully updated **DataTable component** to handle **paginated API responses** with `results` property.

---

## 🐛 Problem

### API Response Format
The backend returns paginated data in this format:
```json
{
  "count": 123,
  "next": "http://api.example.org/accounts/?page=4",
  "previous": "http://api.example.org/accounts/?page=2",
  "results": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "prison_number": "PN-2024-001",
      "first_name": "John",
      "last_name": "Doe",
      ...
    }
  ]
}
```

### Old Code
```typescript
setData(Array.isArray(response.data) ? response.data : response.data.data || []);
```

**Problem:**
- ✅ Handles direct arrays: `[...]`
- ✅ Handles wrapped data: `{ data: [...] }`
- ❌ **Does NOT handle paginated**: `{ results: [...] }`

**Result:** Data was being returned but not displayed in table!

---

## ✅ Solution

### New Code
```typescript
// Handle different response formats:
// 1. Direct array: [...]
// 2. Paginated: { results: [...] }
// 3. Wrapped: { data: [...] }
if (Array.isArray(response.data)) {
  setData(response.data);
} else if (response.data.results) {
  setData(response.data.results);
} else if (response.data.data) {
  setData(response.data.data);
} else {
  setData([]);
}
```

**Now handles:**
- ✅ Direct arrays: `[...]`
- ✅ **Paginated responses: `{ results: [...] }`**
- ✅ Wrapped data: `{ data: [...] }`
- ✅ Empty/invalid responses: `[]`

---

## 📝 Supported Response Formats

### Format 1: Direct Array
```json
[
  { "id": 1, "name": "Item 1" },
  { "id": 2, "name": "Item 2" }
]
```
**Handled by:** `Array.isArray(response.data)`

### Format 2: Paginated (Django REST Framework)
```json
{
  "count": 123,
  "next": "...",
  "previous": "...",
  "results": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
  ]
}
```
**Handled by:** `response.data.results`

### Format 3: Wrapped Data
```json
{
  "data": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
  ]
}
```
**Handled by:** `response.data.data`

### Format 4: Empty/Invalid
```json
{}
```
or
```json
{ "message": "No data" }
```
**Handled by:** Fallback to `[]`

---

## 🔄 How It Works

### Response Processing Flow

```
API Response
    ↓
Check: Is it an array?
    ├─ YES → Use response.data directly
    └─ NO → Check: Does it have 'results'?
            ├─ YES → Use response.data.results
            └─ NO → Check: Does it have 'data'?
                    ├─ YES → Use response.data.data
                    └─ NO → Use empty array []
    ↓
Set data state
    ↓
Table renders with data
```

---

## 🎯 Why This Matters

### Django REST Framework Pagination

Django REST Framework (DRF) uses this pagination format by default:

```python
# Django settings.py
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 100
}
```

**Response structure:**
```json
{
  "count": 150,
  "next": "http://localhost:8000/api/prisoners/?page=2",
  "previous": null,
  "results": [ /* actual data here */ ]
}
```

The actual data is in the `results` array, not at the root level.

---

## 📊 Before vs After

### Before
```typescript
// Old code
setData(Array.isArray(response.data) ? response.data : response.data.data || []);

// API returns: { results: [...] }
// Extracted: response.data.data (undefined)
// Result: [] (empty array)
// Table: No data displayed ❌
```

### After
```typescript
// New code
if (response.data.results) {
  setData(response.data.results);
}

// API returns: { results: [...] }
// Extracted: response.data.results
// Result: [...] (actual data)
// Table: Data displayed ✅
```

---

## 🧪 Testing

### Test Scenario 1: Paginated Response
**API Response:**
```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    { "id": "1", "prison_number": "PN-001", "full_name": "John Doe" },
    { "id": "2", "prison_number": "PN-002", "full_name": "Jane Smith" }
  ]
}
```
**Expected:** Table shows 2 prisoners ✅

### Test Scenario 2: Direct Array
**API Response:**
```json
[
  { "id": "1", "name": "Item 1" },
  { "id": "2", "name": "Item 2" }
]
```
**Expected:** Table shows 2 items ✅

### Test Scenario 3: Wrapped Data
**API Response:**
```json
{
  "data": [
    { "id": "1", "name": "Item 1" }
  ]
}
```
**Expected:** Table shows 1 item ✅

### Test Scenario 4: Empty Response
**API Response:**
```json
{
  "count": 0,
  "results": []
}
```
**Expected:** Table shows "No data available" ✅

---

## 💡 Additional Benefits

### 1. **Pagination Metadata Available**
```typescript
// You can access pagination info if needed
const response = await axiosInstance.get(url);
const count = response.data.count;
const next = response.data.next;
const previous = response.data.previous;
const results = response.data.results;
```

### 2. **Future Enhancement Possibility**
```typescript
// Could implement server-side pagination
const [totalCount, setTotalCount] = useState(0);
const [nextPage, setNextPage] = useState<string | null>(null);

const fetchData = async () => {
  const response = await axiosInstance.get(url);
  if (response.data.results) {
    setData(response.data.results);
    setTotalCount(response.data.count);
    setNextPage(response.data.next);
  }
};
```

### 3. **Backward Compatible**
- Still works with direct arrays
- Still works with wrapped data
- No breaking changes for existing code

---

## 📝 Notes

### Django REST Framework Pagination

**Default pagination response:**
```json
{
  "count": 1023,           // Total number of items
  "next": "http://...",    // URL for next page (or null)
  "previous": "http://...", // URL for previous page (or null)
  "results": [...]         // Current page data
}
```

**Key points:**
- `count` - Total items across all pages
- `next` - URL to fetch next page
- `previous` - URL to fetch previous page
- `results` - Array of items for current page

### Client-Side vs Server-Side Pagination

**Current implementation:**
- ✅ Fetches all data from `results`
- ✅ Client-side pagination (DataTable handles it)
- ✅ Client-side filtering
- ✅ Client-side sorting

**Future enhancement:**
- Could implement server-side pagination
- Use `next`/`previous` URLs
- Reduce data transfer
- Better performance for large datasets

---

## ✅ Summary

### Changes Made
- ✅ Updated data extraction logic
- ✅ Added support for paginated responses (`results`)
- ✅ Maintained backward compatibility
- ✅ Added fallback for invalid responses

### Response Formats Supported
1. ✅ Direct arrays: `[...]`
2. ✅ Paginated: `{ results: [...] }`
3. ✅ Wrapped: `{ data: [...] }`
4. ✅ Empty: `{}`

### Result
**DataTable now correctly displays data from paginated API responses!** 🎯

The prisoner data is now being displayed in the table! ✅
