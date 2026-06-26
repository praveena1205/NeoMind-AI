/*
  # Fix infinite recursion in profiles RLS policies

  ## Problem
  The "Admins can view all profiles" and "Admins can update all profiles" policies
  query the `profiles` table from within a `profiles` policy, which causes infinite
  recursion (error code 42P17).

  ## Fix
  Replace the recursive subquery with auth.jwt() to read the role from the JWT
  app_metadata, which does not trigger RLS and avoids the recursion.

  ## Changes
  - Drop the two recursive admin policies on profiles
  - Recreate them using auth.jwt() -> 'app_metadata' -> 'role' check
*/

-- Drop the recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Recreate using JWT metadata (no recursive table scan)
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
