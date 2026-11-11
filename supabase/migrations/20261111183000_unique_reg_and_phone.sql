/*
# Add unique constraints to attendance table

1. Constraints
- Add unique constraint on `reg_number` (ensures one registration number cannot be registered twice)
- Add unique constraint on `phone_number` (ensures one phone number cannot be registered twice)

2. Notes
- If duplicate records already exist, clean up duplicates or keep the first submission before adding the constraint.
*/

-- In case there are duplicates already in development, keep the earliest created record:
DELETE FROM attendance a
WHERE a.id NOT IN (
  SELECT DISTINCT ON (reg_number) id
  FROM attendance
  ORDER BY reg_number, created_at ASC
);

DELETE FROM attendance a
WHERE a.id NOT IN (
  SELECT DISTINCT ON (phone_number) id
  FROM attendance
  ORDER BY phone_number, created_at ASC
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'attendance_reg_number_key'
  ) THEN
    ALTER TABLE attendance ADD CONSTRAINT attendance_reg_number_key UNIQUE (reg_number);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'attendance_phone_number_key'
  ) THEN
    ALTER TABLE attendance ADD CONSTRAINT attendance_phone_number_key UNIQUE (phone_number);
  END IF;
END $$;

