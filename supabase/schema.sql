-- Create profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users not null primary key,
  username text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- Create lists table
create table lists (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references profiles(id) not null,
  title text not null,
  type text check (type in ('standard', 'advanced')) not null default 'standard',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tasks table
create table tasks (
  id uuid default gen_random_uuid() primary key,
  list_id uuid references lists(id) on delete cascade not null,
  title text not null,
  status boolean default false not null,
  priority text check (priority in ('low', 'normal', 'high')) default 'normal',
  due_date timestamp with time zone,
  assignee_id uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create updates table (for comments and logs)
create table updates (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  message text not null,
  type text check (type in ('comment', 'log')) default 'comment',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Basic RLS policies (Row Level Security)
alter table profiles enable row level security;
alter table lists enable row level security;
alter table tasks enable row level security;
alter table updates enable row level security;

-- Profiles: Public read, self update
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- Lists: CRUD for owner
create policy "Users can view own lists." on lists for select using ( auth.uid() = owner_id );
create policy "Users can insert own lists." on lists for insert with check ( auth.uid() = owner_id );
create policy "Users can update own lists." on lists for update using ( auth.uid() = owner_id );
create policy "Users can delete own lists." on lists for delete using ( auth.uid() = owner_id );

-- Tasks: CRUD for list owner (simplified for now)
create policy "Users can view tasks in own lists." on tasks for select using ( exists ( select 1 from lists where lists.id = tasks.list_id and lists.owner_id = auth.uid() ) );
create policy "Users can insert tasks in own lists." on tasks for insert with check ( exists ( select 1 from lists where lists.id = tasks.list_id and lists.owner_id = auth.uid() ) );
create policy "Users can update tasks in own lists." on tasks for update using ( exists ( select 1 from lists where lists.id = tasks.list_id and lists.owner_id = auth.uid() ) );
create policy "Users can delete tasks in own lists." on tasks for delete using ( exists ( select 1 from lists where lists.id = tasks.list_id and lists.owner_id = auth.uid() ) );

-- Updates: View for task visibility (list owner)
create policy "Users can view updates for visible tasks." on updates for select using ( exists ( select 1 from tasks join lists on tasks.list_id = lists.id where tasks.id = updates.task_id and lists.owner_id = auth.uid() ) );
create policy "Users can insert updates for visible tasks." on updates for insert with check ( exists ( select 1 from tasks join lists on tasks.list_id = lists.id where tasks.id = updates.task_id and lists.owner_id = auth.uid() ) );
