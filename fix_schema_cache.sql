-- Run this in Supabase SQL Editor to fix the "Could not find column in schema cache" error

-- 1. Force PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';

-- 2. Verify the columns exist (just for your peace of mind)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'class_types'
AND column_name IN ('difficulty', 'price_package');
