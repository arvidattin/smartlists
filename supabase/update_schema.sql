-- 1. Create list_members table for collaboration
create table list_members (
  id uuid default gen_random_uuid() primary key,
  list_id uuid references lists(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  role text check (role in ('owner', 'editor', 'viewer')) not null default 'viewer',
  status text check (status in ('pending', 'accepted')) not null default 'pending',
  invited_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(list_id, user_id)
);

-- 2. Add customization columns to lists table
alter table lists add column if not exists icon_name text default 'list';
alter table lists add column if not exists icon_color text default '#6366f1';

-- 3. Enable RLS on list_members
alter table list_members enable row level security;

-- 4. RLS Policies for list_members
-- Users can view memberships they are part of
create policy "Users can view own memberships." on list_members for select using ( auth.uid() = user_id );
-- List owners can view all members of their lists
create policy "List owners can view members." on list_members for select using ( exists ( select 1 from lists where lists.id = list_members.list_id and lists.owner_id = auth.uid() ) );
-- List owners can invite people (insert)
create policy "List owners can invite members." on list_members for insert with check ( exists ( select 1 from lists where lists.id = list_members.list_id and lists.owner_id = auth.uid() ) );
-- Users can update their own status (accept invites)
create policy "Users can accept invites." on list_members for update using ( auth.uid() = user_id );

-- 5. UPDATE RLS Policies for Lists to include members
-- Drop old policies to avoid conflicts or confusion (safest approach is to recreate)
drop policy if exists "Users can view own lists." on lists;
drop policy if exists "Users can update own lists." on lists;

-- View: Owner OR Member (accepted)
create policy "Users can view accessible lists." on lists for select using ( 
    auth.uid() = owner_id 
    or exists (select 1 from list_members where list_members.list_id = lists.id and list_members.user_id = auth.uid() and list_members.status = 'accepted') 
);

-- Update: Owner can update
create policy "Owners can update lists." on lists for update using ( auth.uid() = owner_id );

-- 6. UPDATE RLS Policies for Tasks (Owner OR Member)
drop policy if exists "Users can view tasks in own lists." on tasks;
drop policy if exists "Users can insert tasks in own lists." on tasks;
drop policy if exists "Users can update tasks in own lists." on tasks;
drop policy if exists "Users can delete tasks in own lists." on tasks;

-- Helper condition for access
-- (Owner of list) OR (Member of list with 'accepted' status)
create policy "Users can view accessible tasks." on tasks for select using (
    exists (
        select 1 from lists 
        left join list_members on lists.id = list_members.list_id
        where lists.id = tasks.list_id 
        and (lists.owner_id = auth.uid() or (list_members.user_id = auth.uid() and list_members.status = 'accepted'))
    )
);

create policy "Users can insert accessible tasks." on tasks for insert with check (
    exists (
        select 1 from lists 
        left join list_members on lists.id = list_members.list_id
        where lists.id = tasks.list_id 
        and (lists.owner_id = auth.uid() or (list_members.user_id = auth.uid() and list_members.status = 'accepted'))
    )
);

create policy "Users can update accessible tasks." on tasks for update using (
    exists (
        select 1 from lists 
        left join list_members on lists.id = list_members.list_id
        where lists.id = tasks.list_id 
        and (lists.owner_id = auth.uid() or (list_members.user_id = auth.uid() and list_members.status = 'accepted'))
    )
);

create policy "Users can delete accessible tasks." on tasks for delete using (
    exists (
        select 1 from lists 
        left join list_members on lists.id = list_members.list_id
        where lists.id = tasks.list_id 
        and (lists.owner_id = auth.uid() or (list_members.user_id = auth.uid() and list_members.status = 'accepted'))
    )
);
