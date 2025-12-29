-- Set REPLICA IDENTITY FULL
-- This ensures that 'UPDATE' and 'DELETE' events contain the full 'old' record,
-- which allows clients to filter events correctly even if columns change.

ALTER TABLE lists REPLICA IDENTITY FULL;
ALTER TABLE tasks REPLICA IDENTITY FULL;
ALTER TABLE list_members REPLICA IDENTITY FULL;
ALTER TABLE updates REPLICA IDENTITY FULL;
