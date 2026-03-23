-- Create health assessments table
CREATE TABLE public.health_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  height NUMERIC NOT NULL,
  weight NUMERIC NOT NULL,
  bmi NUMERIC NOT NULL,
  family_diabetes BOOLEAN NOT NULL DEFAULT false,
  family_hypertension BOOLEAN NOT NULL DEFAULT false,
  family_obesity BOOLEAN NOT NULL DEFAULT false,
  smoking_status TEXT NOT NULL,
  alcohol_consumption TEXT NOT NULL,
  exercise_frequency TEXT NOT NULL,
  diet_type TEXT NOT NULL,
  sleep_hours INTEGER NOT NULL,
  diabetes_risk NUMERIC NOT NULL,
  obesity_risk NUMERIC NOT NULL,
  hypertension_risk NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.health_assessments ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own assessments" 
ON public.health_assessments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments" 
ON public.health_assessments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments" 
ON public.health_assessments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_health_assessments_updated_at
BEFORE UPDATE ON public.health_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();