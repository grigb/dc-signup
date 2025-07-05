# DC Signup System – Handover 2025-07-03 15:56

## Project Status
Offline-first PWA works for basic signup flow but manual admin tooling is missing. MCP Playwright setup now functional; browser binaries installed, static `dist` server auto-started via tooling.

## Key Decisions (this session)
1. MCP Playwright used interactively to discover UI bugs.
2. Identified blocker: form remains on first screen when email already exists – need admin UI to manage duplicates.
3. Direction chosen: build simple admin backend to list, select, and delete member rows.

## Priority Next Steps
1. Build `/admin/index.html` page that:
   • fetches members from Supabase (`members` table) via REST API; fallback to offline JSON when offline.
   • renders paginated table with checkbox per row + "Select All".
   • provides bulk delete button (calls Supabase `delete` RPC) + confirmation modal.
2. Add server-side security: require `service_role` key or Supabase RLS role to delete.
3. Wire link from current hidden admin button or route guard.
4. Add Playwright interactive exploration to verify deletion.
5. Document env vars required (`SUPABASE_SERVICE_ROLE_KEY`).

## Technical Notes
* Use existing `src/admin.html` as starting point – currently static, expand with JS using same Supabase client as front-end.
* Reuse `/src/apply-schemas.js` helpers for client config detection.
* For offline, store fetched members in IndexedDB; allow delete of local cache. 