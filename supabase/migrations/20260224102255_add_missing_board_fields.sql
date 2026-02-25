/*
  # Add Missing Board Fields

  ## Changes
  1. Add description field to boards table
  2. Add settings field to boards table for future extensibility

  ## Notes
  - description is optional text field
  - settings is JSONB for flexible configuration storage
*/

-- Add missing fields to boards table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'boards' AND column_name = 'description'
  ) THEN
    ALTER TABLE boards ADD COLUMN description TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'boards' AND column_name = 'settings'
  ) THEN
    ALTER TABLE boards ADD COLUMN settings JSONB DEFAULT '{}';
  END IF;
END $$;
