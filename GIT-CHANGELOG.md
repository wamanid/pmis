## [Upstream Sync – Nov 7, 2025]

**Source:** UPS-PMIS/figma-ui → merged into wamanid/pmis

**Merge Branch:** `test-upstream-sync` → `main` → `dev_env`

### ✅ Adopted from upstream:
- Updated `LoginScreen.tsx`, `AdmissionDashboard.tsx`, `StationDashboard.tsx`
- New structure in `menuService.ts`, `mockApi.ts`
- Adjusted `AUTHENTICATION_SETUP.md` for local dev base URL

### 🔒 Preserved local versions:
- `ComplaintForm.tsx`
- `ComplaintsScreen.tsx`
- `authService.ts`
- `axiosInstance.ts`

### 🧪 Tested:
- Login flow
- Station dashboard rendering
- Axios integration with local and production endpoints

---

## 🔁 3. **Set Up a Recurring Sync Strategy**

Here’s a lightweight plan to keep your repo aligned with the main team:

### 🔹 Monthly Sync Routine
- Add a calendar reminder: “Sync UPS-PMIS upstream”
- Run:
  ```bash
  git fetch upstream
  git checkout -b upstream-sync-YYYY-MM-DD
  git merge upstream/main --allow-unrelated-histories
