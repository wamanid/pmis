# Changelog

All notable changes to this project should be documented in this file.

## [Unreleased] - 2026-01-23

### Fixed
- Fixed shift dropdown in Shift Deployments screen to use correct API endpoint and filter by selected station:
  - Changed from `/station-management/api/shift-details/` to `/station-management/api/shifts/`
  - Shift dropdown now only shows shifts belonging to the selected station
  - Clears shift selection when station changes to prevent invalid selections
  - Updated service layer with `fetchShifts()` function for proper shift data retrieval
