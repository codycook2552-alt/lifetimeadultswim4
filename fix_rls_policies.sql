-- Enable RLS on tables (good practice, likely already on)
ALTER TABLE class_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Policy for class_types: Allow full access to authenticated users (Admins/Instructors)
-- In a stricter prod environment, you'd check for specific roles, but this unblocks you now.
CREATE POLICY "Enable all access for authenticated users" ON class_types
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy for packages: Allow full access to authenticated users
CREATE POLICY "Enable all access for authenticated users" ON packages
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Also ensure public read access is allowed if needed (usually for landing pages)
CREATE POLICY "Enable read access for all users" ON class_types
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Enable read access for all users" ON packages
    FOR SELECT
    TO anon
    USING (true);
