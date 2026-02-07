# Module Refactoring Prompt Template

Use this prompt template to reorganize any module with flat folder structure into a clean, modular architecture.

---

## Prompt Template

```
Role: Act as a senior frontend developer and UI/UX architect.

Context:
For long-term maintainability, scalability, and ease of debugging, frontend projects should follow a module-based folder structure rather than placing all UI (.tsx) files in a single directory.

The application contains a main menu module called [MODULE_NAME] Management, with the following sub-modules (menu items):

[LIST YOUR MENU ITEMS HERE - Example:]
- Sub-module 1
- Sub-module 2  
- Sub-module 3
- Sub-module 4

Current Structure:
[DESCRIBE CURRENT FLAT STRUCTURE - Example:]
All component files are currently in src/components/[module_name]/ directory:
- Feature1Form.tsx
- Feature1List.tsx
- Feature2Screen.tsx
- Feature3Details.tsx
[etc...]

Task:
Help reorganize the frontend codebase into a clean, modular folder structure that:

1. Groups UI components (.tsx) by sub-module, aligned with the menu structure above
2. Avoids dumping all screens/components into one flat folder
3. Improves readability, navigation, and ease of future enhancements

Additionally:

In the services/[module_name] directory, create matching subfolders for each sub-module
Ensure naming is consistent, intuitive, and scalable for future menu additions

Deliverables:

1. Reorganize all component files into appropriate subfolders
2. Create parallel services folder structure with index.ts barrel exports
3. Update route imports to reflect new paths
4. **Systematically fix all import paths in moved files**
5. Use git mv to preserve file history
6. Commit changes with descriptive message
7. Create documentation file showing new structure

Best Practices to Follow:

✅ Use clear, descriptive camelCase folder names
✅ Maintain Screen.tsx, Form.tsx, List.tsx pattern consistently
✅ Create tab container components at subfolder root
✅ Parallel services structure matching components exactly
✅ Barrel exports (index.ts) for clean imports
✅ Menu-aligned structure for intuitive navigation
✅ **Fix import paths systematically after moving files**

Import Path Correction Strategy:

After restructuring, imports will break because files moved to different depths. Fix them systematically:

**1. Calculate File Depth:**
- Files at `[module]/Component.tsx` = 1 level deep → use `../ui/component`
- Files at `[module]/subfolder/Component.tsx` = 2 levels deep → use `../../ui/component`
- Files at `[module]/sub1/sub2/Component.tsx` = 3 levels deep → use `../../../ui/component`

**2. Container Component Imports:**
When a container imports from subfolders:
```typescript
// BEFORE (flat structure):
import FeatureList from './FeatureList';

// AFTER (nested structure):
import FeatureList from './featureFolder/FeatureList';
```

**3. Fix Order (do in this sequence):**
a) Update route file imports first
b) Fix container component imports to subfolders
c) Fix relative imports in 2-level deep files
d) Fix relative imports in 3-level deep files
e) Verify no overcorrected paths (too many `../`)

**4. PowerShell Bulk Fix Commands:**
```powershell
# Fix 2-level deep files (in subfolders)
Get-ChildItem -Recurse -Path "src/components/[module]" -Filter "*.tsx" | 
  ForEach-Object { 
    $c = (Get-Content $_.FullName -Raw -Encoding UTF8) -replace "from '\.\./ui/", "from '../../ui/"; 
    Set-Content -Path $_.FullName -Value $c -NoNewline -Encoding UTF8 
  }

# Fix 3-level deep files (in nested subfolders)
Get-ChildItem -Recurse -Path "src/components/[module]" -Filter "*.tsx" | 
  ForEach-Object { 
    $c = (Get-Content $_.FullName -Raw -Encoding UTF8) -replace "from '\.\./\.\./ui/", "from '../../../ui/"; 
    Set-Content -Path $_.FullName -Value $c -NoNewline -Encoding UTF8 
  }
```

**5. Test Iteratively:**
- Run `npm run dev` after each batch of fixes
- Check Vite error messages for remaining broken imports
- Fix specific files manually if bulk commands miss edge cases
- Verify container imports point to correct subfolders

**6. Common Import Patterns:**
```typescript
// Shared UI components
import { Button } from '../../../ui/button';
import { Card } from '../../ui/card';

// Container importing from subfolder
import FeatureForm from './feature/FeatureForm';
import FeatureList from './feature/FeatureList';

// Service imports
import { featureService } from '../../../services/[module]/feature';
```

⚠️ **Critical:** Import paths are the #1 issue after restructuring. Budget extra time for systematic fixes.

Constraints:

- Use git mv for all file moves to preserve history
- Structure must support future growth without major refactoring
- Follow the exact pattern demonstrated in the Medical module refactoring (commit 9d6c64a)
```

---

## How to Use This Template

### Step 1: Identify Your Module
Replace `[MODULE_NAME]` with your actual module name (e.g., Discharge, Gate, Station, Rehabilitation)

### Step 2: Document Menu Structure
List all menu items/sub-modules. Look at your sidebar/navigation to identify the hierarchy:

Example for Discharge Module:
```
- Discharge Overview
- Discharge Requests
- Suspended Sentence
- Child Handover
- Subsistence Allowances
```

### Step 3: List Current Files
Navigate to the module folder and list all files:
```powershell
ls src/components/[module_name]/*.tsx
```

### Step 4: Customize the Prompt
Fill in:
- `[MODULE_NAME]` - e.g., "Discharge & Exit"
- `[module_name]` - e.g., "discharge"
- List of menu items
- Current file list

### Step 5: Run the Prompt
Paste the customized prompt to get the same modular reorganization

### Step 6: Fix Import Paths After Restructuring
After moving files, systematically fix all broken imports:
1. Update route file imports
2. Fix container component imports to subfolders
3. Run bulk PowerShell commands for relative path corrections
4. Test iteratively with `npm run dev`
5. Fix any remaining specific errors manually

---

## Example: Discharge Module

```
Role: Act as a senior frontend developer and UI/UX architect.

Context:
For long-term maintainability, scalability, and ease of debugging, frontend projects should follow a module-based folder structure rather than placing all UI (.tsx) files in a single directory.

The application contains a main menu module called Discharge & Exit Management, with the following sub-modules (menu items):

- Discharge Overview
- Discharge Requests
- Suspended Sentence Discharge
- Child Handover
- Subsistence Allowances

Current Structure:
All component files are currently in src/components/discharge/ directory:
- DischargeChildHandoverForm.tsx
- DischargeChildHandoverList.tsx
- DischargeRequestForm.tsx
- DischargeRequestList.tsx
- DischargeSuspendedSentenceForm.tsx
- DischargeSuspendedSentenceList.tsx
- SubsistenceAllowancesForm.tsx
- SubsistenceAllowancesList.tsx
- PrisonerDischargeFormTabbed.tsx
- PrisonerDischargeList.tsx

Task:
Help reorganize the frontend codebase into a clean, modular folder structure that:

1. Groups UI components (.tsx) by sub-module, aligned with the menu structure above
2. Avoids dumping all screens/components into one flat folder
3. Improves readability, navigation, and ease of future enhancements

Additionally:

In the services/discharge directory, create matching subfolders for each sub-module
Ensure naming is consistent, intuitive, and scalable for future menu additions

Deliverables:

1. Reorganize all component files into appropriate subfolders
2. Create parallel services folder structure with index.ts barrel exports
3. Update route imports to reflect new paths (src/routes/discharge.routes.tsx)
4. **Systematically fix all import paths in moved files**
5. Use git mv to preserve file history
6. Commit changes with descriptive message
7. Create documentation file showing new structure

Best Practices to Follow:

✅ Use clear, descriptive camelCase folder names
✅ Maintain Screen.tsx, Form.tsx, List.tsx pattern consistently
✅ Create tab container components at subfolder root
✅ Parallel services structure matching components exactly
✅ Barrel exports (index.ts) for clean imports
✅ Menu-aligned structure for intuitive navigation
✅ **Fix import paths systematically after moving files**

Constraints:

- Use git mv for all file moves to preserve history
- Structure must support future growth without major refactoring
- Follow the exact pattern demonstrated in the Medical module refactoring (commit 9d6c64a)
```

---

## Quick Checklist

Before running the prompt, ensure you have:

- [ ] Module name identified
- [ ] Menu structure documented (from UI/sidebar)
- [ ] Current files listed
- [ ] Routes file identified (e.g., discharge.routes.tsx)
- [ ] Services folder exists (or needs creation)
- [ ] Current branch is clean (`git status`)
- [ ] Module overview/container component identified

After refactoring, don't forget to:

- [ ] Update route file imports
- [ ] Fix container component imports to subfolders
- [ ] Run PowerShell bulk import corrections
- [ ] Test with `npm run dev` iteratively
- [ ] Commit changes with descriptive message
- [ ] Create module structure documentation

---

## Expected Output Structure

After refactoring, you should have:

```
src/components/[module]/
├── [Module]Overview.tsx                    # Main dashboard
├── subModule1/
│   ├── SubModule1Details.tsx              # Container
│   ├── feature1/
│   │   ├── Feature1Form.tsx
│   │   └── Feature1List.tsx
│   └── feature2/
│       ├── Feature2Form.tsx
│       └── Feature2List.tsx
├── subModule2/
│   ├── SubModule2Details.tsx
│   └── feature/
│       ├── FeatureForm.tsx
│       └── FeatureList.tsx
└── [MODULE]_STRUCTURE.md                  # Documentation

src/services/[module]/
├── index.ts
├── subModule1/
│   └── index.ts
└── subModule2/
    └── index.ts
```

---

## Benefits You'll Achieve

✅ **Menu-aligned structure** - Navigate code by following UI  
✅ **Tab-based organization** - Each tab gets its own folder  
✅ **Consistent patterns** - Form-List-Screen throughout  
✅ **Team collaboration** - Clear boundaries, fewer conflicts  
✅ **Scalability** - Add features without restructuring  
✅ **Easy onboarding** - New developers understand structure quickly  
✅ **Preserved history** - Git tracks all file moves  
✅ **Systematic import fixing** - Clear strategy for path corrections  

---

## Common Pitfalls to Avoid

⚠️ **Import Path Errors** - Most common issue after restructuring. Follow the systematic fix strategy.  
⚠️ **Inconsistent Depth** - Some files 2 levels deep, some 3 levels. Check each file's actual depth.  
⚠️ **Container Imports** - Don't forget to update container components to import from subfolders.  
⚠️ **Overcorrection** - Using too many `../` can break imports. Count the actual levels needed.  
⚠️ **Batch Testing** - Test after each batch of import fixes, don't wait until the end.  

---

## Reference Implementation

See the Medical module refactoring for the pattern:
- Commit: `9d6c64a` (refactoring)
- Commit: `af3e233` (documentation)
- Documentation: `src/components/medical/MEDICAL_MODULE_STRUCTURE.md`

---

*Template Version: 1.0*  
*Created: February 4, 2026*  
*Based on: Medical Module Refactoring (9d6c64a)*
