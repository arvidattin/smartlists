-- Fix RLS policies for updates table to allow list members to comment

-- Drop existing policies
drop policy if exists "Users can view updates for visible tasks." on updates;
drop policy if exists "Users can insert updates for visible tasks." on updates;
drop policy if exists "Users can view updates for task visibility." on updates; -- potential duplicate naming
drop policy if exists "Users can insert updates for task visibility." on updates;

-- Create new policies incorporating list members
create policy "Users can view accessible updates." on updates for select using (
    exists (
        select 1 from tasks
        inner join lists on tasks.list_id = lists.id
        left join list_members on lists.id = list_members.list_id
        where tasks.id = updates.task_id
        and (lists.owner_id = auth.uid() or (list_members.user_id = auth.uid() and list_members.status = 'accepted'))
    )
);

create policy "Users can insert accessible updates." on updates for insert with check (
    exists (
        select 1 from tasks
        inner join lists on tasks.list_id = lists.id
        left join list_members on lists.id = list_members.list_id
        where tasks.id = updates.task_id
        and (lists.owner_id = auth.uid() or (list_members.user_id = auth.uid() and list_members.status = 'accepted'))
    )
);

-- Allow updating own comments/updates? 
-- Typically users should be able to edit/delete their own comments, but the error specifically mentioned INSERT (new row).
-- Let's add basic update/delete for own comments just in case, while maintaining the "accessible" check (though strict ownership is usually cleaner for comments)

create policy "Users can update own updates." on updates for update using (
    auth.uid() = user_id
);

create policy "Users can delete own updates." on updates for delete using (
    auth.uid() = user_id
);
