-- Enable RLS on the realtime.messages table (required for private channels)
alter table realtime.messages enable row level security;

-- Allow authenticated users to listen to broadcast channels
-- You can make this more restrictive (e.g., check topic name) if needed
create policy "Authenticated can listen to broadcast"
on realtime.messages
for select
to authenticated
using ( true );

-- Allow authenticated users to send broadcast messages
create policy "Authenticated can broadcast"
on realtime.messages
for insert
to authenticated
with check ( true );
