-- Add recurring_group_id to sessions table to track series
ALTER TABLE sessions 
ADD COLUMN recurring_group_id UUID;

-- Optional: Index for faster lookups of series
CREATE INDEX idx_sessions_recurring_group_id ON sessions(recurring_group_id);
