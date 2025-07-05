# Essential Work to Fix (2025-07-01)

## Critical Problems Discovered

| # | Area | Symptom | Root Cause (suspected) |
|---|------|---------|------------------------|
| 1 | Playwright Tests | All but 3 specs time-out on `#name` locator | Specs load a non-existent path (file URL or localhost:4100); real app is served from `dist/` on :4173 |
| 2 | Join Button | Clicking **Join the Community** does nothing | Exception in `renderCreatorTypes` → `document.getElementById('creatorTypeDisplay')` returns `null`; aborts `submitConfirmedData` |
| 3 | Database Insert | `supabase.from('submissions').insert()` returns `null` | Table/RLS missing or anon key lacks `insert` permission |
| 4 | Creator Types RPC | `supabase.rpc('get_creator_types_json')` returns `{ data: null }` | Function absent or no execute rights, fallback to local JSON |
| 5 | Modal Race Condition | (Patched) Modal showed blank if data not yet loaded | Needed async wait; patch applied ✔︎ |
| 6 | Service Worker | 404 for `sw.js` after build | Copy path wrong when `cp -R src dist` runs |
| 7 | Console Noise | CSP inline-style warnings, mixed content when HTTP | Non-blocking, but should tidy later |

## Proposed Fix Strategy

### Phase 0 – Stabilise Test Harness (Highest Priority)
1. Ensure `npm run build` executes before tests.
2. Update Playwright specs:
   • Use `test.use({ baseURL: 'http://localhost:4173' })` (already in config).
   • Replace any `page.goto(file://…)` with `page.goto('/')`.
3. Confirm at least one smoke test passes (load page, fill name/email, open modal).

### Phase 1 – Crash-Fix Join Flow
1. Add **null-checks** in `renderCreatorTypes` and `resetForm` so absence of optional elements does not throw.
2. Verify `creatorTypeDisplay` exists in all relevant states or gate its manipulation.
3. Re-run manual flow: fill form, select types, click **Join** – ensure no JS error and UI feedback appears.

### Phase 2 – Database Connectivity
1. Use Supabase dashboard:
   • Confirm `submissions` table exists and anon role has `insert` permission.
   • Confirm `get_creator_types_json` RPC exists & grants execute to anon.
2. If quick access isn’t available, implement localStorage/offline queue first (already partly present) and only POST when online.
3. Update `.env.example` with expected keys.

### Phase 3 – Service-Worker & Assets
1. Copy `src/sw.js` and `src/manifest.json` into `dist/` during build.
2. Verify `navigator.serviceWorker.register('/sw.js')` resolves without 404.

### Phase 4 – Refactor Tests for Real Data
1. After Phase 2, write a Playwright fixture to seed Supabase with a test row or stub responses.
2. Validate that insert actually reaches DB and confirmation UI shows.

### Phase 5 – Quality / Guardrails (Optional Once Stable)
1. Re-enable GitHub Action build & test workflow.
2. Add linting (ESLint) & prettier.
3. Add Husky pre-commit hook blocking edits to `dist/`.

### Deliverables by End of Fix Cycle
- Passing Playwright smoke test in CI.
- Working join flow (data stored + user feedback).
- Updated README build/test docs.
- Updated Supabase schema or fallback local storage.
- Clean console (no uncaught errors).

---

> **Next Action**: Implement Phase 0 changes so we can rely on tests to guard regressions.
