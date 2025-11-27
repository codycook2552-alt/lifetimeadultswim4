-- Allow authenticated users (Admins) to delete profiles
CREATE POLICY "Enable delete for authenticated users" ON profiles
    FOR DELETE
    TO authenticated
    USING (true);
