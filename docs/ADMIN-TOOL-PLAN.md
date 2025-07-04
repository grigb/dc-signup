# Minimal Admin Member Viewer & Remover: Plan & Strategy

**Date:** [Today]

## Purpose
Ship a simple, robust admin tool for viewing and removing users, with offline support, in line with deployment urgency and project rules.

## Requirements
- List all members from Supabase `members` table
- Delete individual members (with confirmation)
- Bulk delete (select multiple, single confirmation modal)
- Offline support: show cached member list if offline (IndexedDB)
- Minimal code, no refactor, no new abstractions
- Document all changes and update this plan as work progresses

## Implementation Steps

### 1. Member Listing
- Fetch all members from Supabase on page load (or login)
- Render in a table: Name, Email, Status, Joined date, Actions
- Checkbox per row for bulk selection

### 2. Delete Functionality
- Single delete: "Delete" button per row, triggers confirmation modal
- Bulk delete: "Select All" checkbox, "Delete Selected" button, triggers confirmation modal for all selected

### 3. Offline Support
- On successful fetch, cache member list in IndexedDB
- On fetch failure (offline), load from IndexedDB
- Show "Offline" banner if using cached data

### 4. Minimal UI
- Add checkboxes to each row and a "Select All" in the table header
- Add a "Delete Selected" button above the table
- Use a single modal for all confirmations

### 5. Documentation
- Add a changelog entry and update docs as per rules
- Update this plan as work progresses (MANDATORY)

## Mandate
- This plan must be updated as work progresses.
- All major implementation decisions and changes must be reflected here.
- Documentation of plans and updates is required for all future admin tool work.

## [Update: Implementation Complete]
**Date:** [Today]

- Implemented minimal IndexedDB cache for members in admin.html
- Added checkboxes for bulk select/delete, with a single confirmation modal for both single and bulk delete
- All code is embedded in admin.html, minimal, and matches existing project patterns
- No refactor or new abstractions introduced
- Manual testing performed; further improvements should update this plan 

## Feature/Fix: Robust Form Auto-Transition After Submission
**Date**: 2025-07-03
**Files Modified**: src/index.html
**Why**: The form sometimes failed to return to the initial state after submission, leaving users stuck on the confirmation step. This was a critical UX and deployment blocker.
**What Changed**:
- Updated `submitConfirmedData` to robustly hide the confirmation step and show the form, ensuring all relevant style properties are set.
- No new files or dependencies added.
**Testing**: Manual submission and confirmation now always returns to the form view.
**Notes**: Follows all CLAUDE.md and project documentation requirements. No impact on other flows. 