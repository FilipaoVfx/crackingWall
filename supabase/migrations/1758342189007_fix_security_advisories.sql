/*
# Security Fix: Function Search Path Configuration
Fix security advisories by setting proper search_path for database functions

## Query Description: This operation improves security by setting proper search_path for functions, preventing potential SQL injection attacks through search_path manipulation. This is a safety enhancement with no data impact.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Modifying function definitions to include proper search_path
- No data changes, only function security improvements

## Security Implications:
- RLS Status: No changes
- Policy Changes: No
- Auth Requirements: No changes

## Performance Impact:
- Indexes: No changes
- Triggers: No changes
- Estimated Impact: Minimal positive impact on security
*/

-- Fix search_path for increment_likes function
CREATE OR REPLACE FUNCTION increment_likes(wallpaper_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE wallpapers 
  SET likes = likes + 1,
      updated_at = NOW()
  WHERE id = wallpaper_id;
END;
$$;

-- Fix search_path for decrement_likes function
CREATE OR REPLACE FUNCTION decrement_likes(wallpaper_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE wallpapers 
  SET likes = GREATEST(likes - 1, 0),
      updated_at = NOW()
  WHERE id = wallpaper_id;
END;
$$;

-- Fix search_path for increment_downloads function
CREATE OR REPLACE FUNCTION increment_downloads(wallpaper_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE wallpapers 
  SET downloads = downloads + 1,
      updated_at = NOW()
  WHERE id = wallpaper_id;
END;
$$;

-- Fix search_path for handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.created_at,
    NEW.created_at
  );
  RETURN NEW;
END;
$$;

-- Recreate the trigger (just to be safe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
