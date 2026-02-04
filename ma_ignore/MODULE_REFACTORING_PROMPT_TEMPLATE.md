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
4. Use git mv to preserve file history
5. Commit changes with descriptive message
6. Create documentation file showing new structure

Best Practices to Follow:

✅ Use clear, descriptive camelCase folder names
✅ Maintain Screen.tsx, Form.tsx, List.tsx pattern consistently
✅ Create tab container components at subfolder root
✅ Parallel services structure matching components exactly
✅ Barrel exports (index.ts) for clean imports
✅ Menu-aligned structure for intuitive navigation

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
4. Use git mv to preserve file history
5. Commit changes with descriptive message
6. Create documentation file showing new structure

Best Practices to Follow:

✅ Use clear, descriptive camelCase folder names
✅ Maintain Screen.tsx, Form.tsx, List.tsx pattern consistently
✅ Create tab container components at subfolder root
✅ Parallel services structure matching components exactly
✅ Barrel exports (index.ts) for clean imports
✅ Menu-aligned structure for intuitive navigation

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
