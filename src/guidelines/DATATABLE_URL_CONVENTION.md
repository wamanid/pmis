# DataTable URL Convention

## ✅ Important: URL Format

When using the **DataTable component**, URLs should **NOT** include the `/api/` prefix because it's already included in the `axiosInstance` base URL.

---

## 🚫 Common Mistake

### ❌ WRONG - Including /api/ prefix
```typescript
<DataTable
  url="/api/admission/prisoners/"  // ❌ WRONG
  columns={columns}
/>
```

**Result:**
```
Base URL: http://localhost:8000/api/
URL: /api/admission/prisoners/
Final URL: http://localhost:8000/api/api/admission/prisoners/  ❌ DUPLICATED!
```

---

## ✅ Correct Usage

### ✅ RIGHT - Without /api/ prefix
```typescript
<DataTable
  url="admission/prisoners/"  // ✅ CORRECT
  columns={columns}
/>
```

**Result:**
```
Base URL: http://localhost:8000/api/
URL: admission/prisoners/
Final URL: http://localhost:8000/api/admission/prisoners/  ✅ CORRECT!
```

---

## 📋 URL Format Rules

### Rule 1: No /api/ Prefix
```typescript
// ❌ WRONG
url="/api/admission/prisoners/"
url="/api/dashboard/"
url="/api/users/"

// ✅ CORRECT
url="admission/prisoners/"
url="dashboard/"
url="users/"
```

### Rule 2: No Leading Slash (Optional)
```typescript
// Both work, but without leading slash is cleaner
url="admission/prisoners/"   // ✅ Recommended
url="/admission/prisoners/"  // ✅ Also works (axios handles it)
```

### Rule 3: Include Trailing Slash (Django Convention)
```typescript
// ✅ CORRECT - Django expects trailing slash
url="admission/prisoners/"

// ⚠️ May work but not recommended
url="admission/prisoners"
```

---

## 🔧 How It Works

### axiosInstance Configuration

```typescript
// In src/services/axiosInstance.ts
const API_BASE_URL = 'http://localhost:8000/api/';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,  // Already includes /api/
  // ...
});
```

### URL Concatenation

```typescript
// DataTable makes request
axiosInstance.get('admission/prisoners/')

// Axios combines:
// baseURL + url
// 'http://localhost:8000/api/' + 'admission/prisoners/'
// = 'http://localhost:8000/api/admission/prisoners/'  ✅
```

---

## 📊 Examples

### Example 1: Prisoner List
```typescript
<DataTable
  url="admission/prisoners/"  // ✅
  title="Prisoner Records"
  columns={prisonerColumns}
/>
```
**Final URL:** `http://localhost:8000/api/admission/prisoners/`

### Example 2: Dashboard
```typescript
<DataTable
  url="admission/dashboard/"  // ✅
  title="Dashboard Statistics"
  columns={dashboardColumns}
/>
```
**Final URL:** `http://localhost:8000/api/admission/dashboard/`

### Example 3: Users
```typescript
<DataTable
  url="users/"  // ✅
  title="User Management"
  columns={userColumns}
/>
```
**Final URL:** `http://localhost:8000/api/users/`

### Example 4: Nested Resource
```typescript
<DataTable
  url="admission/prisoners/123/visits/"  // ✅
  title="Prisoner Visits"
  columns={visitColumns}
/>
```
**Final URL:** `http://localhost:8000/api/admission/prisoners/123/visits/`

---

## 🐛 Debugging URL Issues

### Check the Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Make a request
4. Check the request URL

### Common Issues

#### Issue 1: Duplicate /api/
```
URL: http://localhost:8000/api/api/admission/prisoners/
Problem: /api/ appears twice
Solution: Remove /api/ from DataTable url prop
```

#### Issue 2: Missing /api/
```
URL: http://localhost:8000/admission/prisoners/
Problem: /api/ is missing
Solution: Ensure axiosInstance is being used (not default axios)
```

#### Issue 3: 404 Not Found
```
URL: http://localhost:8000/api/admission/prisoners
Problem: Missing trailing slash
Solution: Add trailing slash: "admission/prisoners/"
```

---

## 🔄 Migration Guide

### If You Have Existing DataTables

**Step 1: Find all DataTable instances**
```bash
# Search for DataTable components
grep -r "<DataTable" src/components/
```

**Step 2: Check URL props**
```typescript
// Look for URLs starting with /api/
url="/api/..."
```

**Step 3: Remove /api/ prefix**
```typescript
// Before
url="/api/admission/prisoners/"

// After
url="admission/prisoners/"
```

**Step 4: Test**
- Open the page
- Check Network tab
- Verify URL is correct

---

## 📝 Quick Reference

### URL Format Checklist

- [ ] ❌ Does NOT start with `/api/`
- [ ] ✅ Starts with endpoint name (e.g., `admission/`)
- [ ] ✅ Ends with trailing slash `/`
- [ ] ✅ Uses relative path (no domain)

### Correct Examples
```typescript
✅ "admission/prisoners/"
✅ "dashboard/"
✅ "users/"
✅ "reports/monthly/"
✅ "settings/profile/"
```

### Incorrect Examples
```typescript
❌ "/api/admission/prisoners/"  // Duplicate /api/
❌ "http://localhost:8000/api/admission/prisoners/"  // Full URL not needed
❌ "admission/prisoners"  // Missing trailing slash
❌ "/admission/prisoners/"  // Leading slash not needed (but works)
```

---

## 🎯 Why This Convention?

### 1. **Centralized Base URL**
- Base URL defined once in `axiosInstance.ts`
- Easy to change for different environments
- No hardcoded domains in components

### 2. **Consistency**
- All API calls use same pattern
- Services and DataTable work the same way
- Predictable behavior

### 3. **Environment Flexibility**
```typescript
// Development
const API_BASE_URL = 'http://localhost:8000/api/';

// Staging
const API_BASE_URL = 'https://staging.example.com/api/';

// Production
const API_BASE_URL = 'https://api.example.com/api/';

// Components don't change!
<DataTable url="admission/prisoners/" />
```

### 4. **DRY Principle**
- Don't repeat `/api/` in every component
- Single source of truth
- Less error-prone

---

## ✅ Summary

### Key Points

1. **Remove `/api/` prefix** from DataTable URLs
2. **axiosInstance base URL** already includes `/api/`
3. **Use relative paths** like `admission/prisoners/`
4. **Include trailing slash** for Django endpoints
5. **Check Network tab** to verify correct URLs

### Correct Pattern
```typescript
<DataTable
  url="admission/prisoners/"  // No /api/ prefix
  title="Prisoner Records"
  columns={columns}
/>
```

### Result
```
✅ http://localhost:8000/api/admission/prisoners/
```

**Follow this convention for all DataTable instances!** 🎯
