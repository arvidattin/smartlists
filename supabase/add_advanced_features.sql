-- Add new columns to tasks
alter table tasks add column if not exists due_date timestamp with time zone;
alter table tasks add column if not exists assignee_id uuid references profiles(id);

-- Create subtasks table
create table if not exists subtasks (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade not null,
  title text not null,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for subtasks
alter table subtasks enable row level security;

-- RLS Policies for Subtasks (inherited access from tasks/lists)
create policy "Users can view accessible subtasks." on subtasks for select using (
    exists (
        select 1 from tasks 
        where tasks.id = subtasks.task_id 
        and (
             -- Use the existing task policy logic or simplify
             exists (
                select 1 from lists 
                left join list_members on lists.id = list_members.list_id
                where lists.id = tasks.list_id 
                and (lists.owner_id = auth.uid() or (list_members.user_id = auth.uid() and list_members.status = 'accepted'))
             )
        )
    )
);

create policy "Users can insert accessible subtasks." on subtasks for insert with check (
    exists (
        select 1 from tasks 
        where tasks.id = subtasks.task_id 
        and (
             exists (
                select 1 from lists 
                left join list_members on lists.id = list_members.list_id
                where lists.id = tasks.list_id 
                and (lists.owner_id = auth.uid() or (list_members.user_id = auth.uid() and list_members.status = 'accepted'))
             )
        )
    )
);

create policy "Users can update accessible subtasks." on subtasks for update using (
    exists (
        select 1 from tasks 
        where tasks.id = subtasks.task_id 
        and (
             exists (
                select 1 from lists 
                left join list_members on lists.id = list_members.list_id
                where lists.id = tasks.list_id 
                and (lists.owner_id = auth.uid() or (list_members.user_id = auth.uid() and list_members.status = 'accepted'))
             )
        )
    )
);

create policy "Users can delete accessible subtasks." on subtasks for delete using (
    exists (
        select 1 from tasks 
        where tasks.id = subtasks.task_id 
        and (
             exists (
                select 1 from lists 
                left join list_members on lists.id = list_members.list_id
                where lists.id = tasks.list_id 
                and (lists.owner_id = auth.uid() or (list_members.user_id = auth.uid() and list_members.status = 'accepted'))
             )
        )
    )
);

-- Set Replica Identity for realtime
ALTER TABLE subtasks REPLICA IDENTITY FULL;
