-- Add selected_text column to pdf_highlights table
ALTER TABLE pdf_highlights
ADD COLUMN IF NOT EXISTS selected_text TEXT DEFAULT '';

-- Update the trigger to include the new column
COMMENT ON COLUMN pdf_highlights.selected_text IS 'Der vom User markierte Text';
