-- Allow users to view lists they are invited to (pending status)
-- Previously, it was only 'accepted', which caused invites to appear with null list data.

drop policy if exists "Users can view accessible lists." on lists;

create policy "Users can view accessible lists." on lists for select using ( 
    auth.uid() = owner_id 
    or exists (
        select 1 from list_members 
        where list_members.list_id = lists.id 
        and list_members.user_id = auth.uid() 
        and list_members.status in ('accepted', 'pending') -- Added pending
    ) 
);
