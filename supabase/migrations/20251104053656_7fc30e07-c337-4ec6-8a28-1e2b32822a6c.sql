-- Add new columns to health_assessments table for additional medical information
ALTER TABLE public.health_assessments
ADD COLUMN past_illnesses text[],
ADD COLUMN current_symptoms text[],
ADD COLUMN location text,
ADD COLUMN allergies text[];

-- Add comment to describe the new columns
COMMENT ON COLUMN public.health_assessments.past_illnesses IS 'Array of past major illnesses';
COMMENT ON COLUMN public.health_assessments.current_symptoms IS 'Array of current health symptoms';
COMMENT ON COLUMN public.health_assessments.location IS 'User location for environmental analysis';
COMMENT ON COLUMN public.health_assessments.allergies IS 'Array of user allergies';