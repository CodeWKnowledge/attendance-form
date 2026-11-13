/*
# Add date_of_birth to attendance table

1. Changes
- Add `date_of_birth` column (date, optional or required as format check) to the `attendance` table
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attendance' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE attendance ADD COLUMN date_of_birth date;
  END IF;
END $$;

