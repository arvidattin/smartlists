-- Enable Realtime for tables
-- This is often required for Supabase subscriptions to work

alter publication supabase_realtime add table lists;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table updates;
alter publication supabase_realtime add table list_members;
