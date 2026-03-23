-- Populate profiles for existing users who don't have one
INSERT INTO public.profiles (id, role)
SELECT au.id, 'user'
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
