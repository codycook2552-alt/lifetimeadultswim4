-- Enable RLS on sessions table
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Allow read access for everyone (needed for booking and viewing schedule)
CREATE POLICY "Enable read access for all users" ON sessions
    FOR SELECT TO anon, authenticated USING (true);

-- Allow authenticated users (Admins/Instructors) to create sessions
CREATE POLICY "Enable insert for authenticated users" ON sessions
    FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update sessions (e.g. changing capacity, time)
CREATE POLICY "Enable update for authenticated users" ON sessions
    FOR UPDATE TO authenticated USING (true);

-- Allow authenticated users to delete sessions
CREATE POLICY "Enable delete for authenticated users" ON sessions
    FOR DELETE TO authenticated USING (true);
