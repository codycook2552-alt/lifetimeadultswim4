-- Run this script in the Supabase SQL Editor to update your database schema

-- Add missing columns to class_types table
ALTER TABLE class_types 
ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'Beginner',
ADD COLUMN IF NOT EXISTS price_package numeric DEFAULT 0;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'class_types';
