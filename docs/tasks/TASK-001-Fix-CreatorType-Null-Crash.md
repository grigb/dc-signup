# TASK-001: Fix `creatorTypeDisplay` Null Crash

## Background
Clicking **Join the Community** throws a JS error:
```
TypeError: Cannot set properties of null (setting 'innerHTML')
    at renderCreatorTypes (...)
```
`renderCreatorTypes()` and `resetForm()` assume `document.getElementById('creatorTypeDisplay')` is always present, but that element doesn’t exist on the landing view after submission.

## Objective
Guard the code so it never crashes if the element is missing **and** ensure the element is present when needed.

## Scope / Files
* `src/index.html` – inline `<script>` containing `renderCreatorTypes`, `resetForm`, submission logic.
* (Optional) HTML template: ensure a hidden `<span id="creatorTypeDisplay">` exists globally.

## Steps
1. In `renderCreatorTypes()` and `resetForm()`:
   ```js
   const display = document.getElementById('creatorTypeDisplay');
   if (display) { /* existing logic */ }
   ```
2. Option A – always-present element (preferred):
   • Add `<span id="creatorTypeDisplay" style="display:none"></span>` inside the form markup so JS always finds it.
3. Build & run locally:
   ```bash
   npm run build
   npx serve dist
   ```
4. Fill form and click **Join** – confirm no JS exceptions in console.

## Acceptance Criteria
- Form submission no longer throws `TypeError`.
- Confirmation step (or error message) appears instead of silent failure.
- Console is free of uncaught exceptions related to creator type display.

## Estimated Effort
~15 minutes. Feel free to commit directly to `feature/consolidation` branch.
