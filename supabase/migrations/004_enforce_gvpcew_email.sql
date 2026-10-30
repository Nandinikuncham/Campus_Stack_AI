-- ========================================================
-- Migration 004: Enforce GVPCEW Email Domain & Set College
-- ========================================================

-- Update handle_new_user trigger to enforce @gvpcew.ac.in and set default college
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate that email domain ends with @gvpcew.ac.in
  IF NEW.email IS NULL OR LOWER(NEW.email) NOT LIKE '%@gvpcew.ac.in' THEN
    RAISE EXCEPTION 'Only official @gvpcew.ac.in email addresses are permitted.';
  END IF;

  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    email,
    avatar_url,
    college
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    'Gayatri Vidya Parishad College of Engineering for Women(A)'
  )
  ON CONFLICT (id) DO UPDATE
  SET college = 'Gayatri Vidya Parishad College of Engineering for Women(A)';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on auth.users (if permissions allow in Supabase SQL editor)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    DROP TRIGGER on_auth_user_created ON auth.users;
  END IF;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION WHEN OTHERS THEN
  -- In case user doesn't have superuser permission on auth schema, continue
  NULL;
END;
$$;

-- Update existing profiles' college name to the official college name
UPDATE public.profiles
SET college = 'Gayatri Vidya Parishad College of Engineering for Women(A)'
WHERE college IS NULL 
   OR college = '' 
   OR college ILIKE '%Gayatri%'
   OR college ILIKE '%GVP%';
