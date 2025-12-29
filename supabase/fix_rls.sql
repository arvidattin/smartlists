-- Fix for RLS Infinite Recursion
-- The issue is "lists" checks "list_members" which checks "lists" again.
-- Solution: Use a SECURITY DEFINER function to read "lists" without triggering RLS.

-- 1. Create helper function to check owner (Bypasses RLS)
create or replace function get_list_owner(list_uuid uuid)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select owner_id from lists where id = list_uuid;
$$;

-- 2. Drop problematic policies on list_members that reference "lists" directly
drop policy if exists "List owners can view members." on list_members;
drop policy if exists "List owners can invite members." on list_members;

-- 3. Recreate policies using the secure function
create policy "List owners can view members." 
on list_members for select 
using ( get_list_owner(list_id) = auth.uid() );

create policy "List owners can invite members." 
on list_members for insert 
with check ( get_list_owner(list_id) = auth.uid() );

-- 4. Ensure lists policies are clean (Re-run for safety, though they were likely fine if recursion is broken)
-- The "lists" policy "Users can view accessible lists." remains valid because it queries list_members,
-- but now list_members access for "Users can view own memberships" doesn't query lists back.
