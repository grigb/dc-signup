# TASK-002: Restore Supabase Data Flow

## Background
Form submissions fail silently: `supabase.from('submissions').insert()` returns `null` and `supabase.rpc('get_creator_types_json')` also returns `null`. This indicates missing table/RPC or insufficient permissions for the `anon` key.

## Objective
Ensure the front-end can:
1. Fetch creator-type JSON via Supabase RPC.
2. Insert new rows into `submissions` table.

## Prerequisites
* Access to the Supabase project’s dashboard (or psql connection).
* The anon public key currently embedded in `src/index.html`.

## Steps
1. **Verify/Create Table**
   ```sql
   create table if not exists public.submissions (
     id uuid primary key default uuid_generate_v4(),
     name text,
     email text,
     country text,
     creator_types jsonb,
     inserted_at timestamptz default now()
   );
   ```
2. **Row-Level Security (RLS)**
   ```sql
   alter table public.submissions enable row level security;
   create policy "Public inserts" on public.submissions for insert
     with check ( true );
   ```
3. **Grant privileges**
   ```sql
   grant insert on table public.submissions to anon;
   ```
4. **Verify/Create RPC**
   ```sql
   -- Returns cached creator types JSON
   create or replace function public.get_creator_types_json()
   returns jsonb as $$
     select jsonb_agg(row_to_json(ct)) from public.creator_types ct;
   $$ language sql stable;

   grant execute on function public.get_creator_types_json() to anon;
   ```
5. **Local Test**
   In browser console:
   ```js
   supabase.rpc('get_creator_types_json').then(console.log);
   supabase.from('submissions').insert({ name:'Test', email:'a@b.c' });
   ```
   Both calls should return non-null data.
6. **Fallback (if dashboard access blocked)**
   • Implement localStorage queue (`localDrafts`) already present in code; ensure on-online event drains queue via Supabase.

## Acceptance Criteria
- `creatorTypes` loads from Supabase (check Network tab).
- Submission returns `{ data: {...}, error: null }`.
- No console errors about Supabase.

## Estimated Effort
30–45 minutes with dashboard access. Commit any schema SQL to `supabase/setup.sql` for reproducibility.
