-- Enable RLS
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockouts ENABLE ROW LEVEL SECURITY;

-- Availability Policies
-- Allow instructors to view their own availability (or all if needed for booking)
CREATE POLICY "Enable read access for all users" ON availability
    FOR SELECT TO anon, authenticated USING (true);

-- Allow instructors to insert/update/delete their own availability
CREATE POLICY "Enable insert for authenticated users" ON availability
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Enable update for authenticated users" ON availability
    FOR UPDATE TO authenticated USING (auth.uid() = instructor_id);

CREATE POLICY "Enable delete for authenticated users" ON availability
    FOR DELETE TO authenticated USING (auth.uid() = instructor_id);


-- Blockout Policies
CREATE POLICY "Enable read access for all users" ON blockouts
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON blockouts
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Enable delete for authenticated users" ON blockouts
    FOR DELETE TO authenticated USING (auth.uid() = instructor_id);
