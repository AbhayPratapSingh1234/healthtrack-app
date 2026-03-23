-- Add advanced health metrics columns to daily_health_logs table
ALTER TABLE daily_health_logs
ADD COLUMN heart_rate INTEGER,
ADD COLUMN cholesterol_total DECIMAL(5,2),
ADD COLUMN cholesterol_hdl DECIMAL(5,2),
ADD COLUMN cholesterol_ldl DECIMAL(5,2),
ADD COLUMN sleep_hours DECIMAL(4,2),
ADD COLUMN water_intake DECIMAL(5,2),
ADD COLUMN body_fat_percentage DECIMAL(5,2),
ADD COLUMN mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
ADD COLUMN daily_steps INTEGER;
