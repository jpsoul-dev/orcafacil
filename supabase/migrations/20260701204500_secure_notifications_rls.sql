-- Migration to secure SELECT query on notifications table.
-- Drops overly permissive 'Anyone can view notifications' policy (which allowed anonymous reads).
-- Replaces with a policy restricting SELECT to authenticated users.

-- 1. Drop existing policy
DROP POLICY IF EXISTS "Anyone can view notifications" ON "public"."notifications";

-- 2. Create restricted policy
CREATE POLICY "Authenticated users can view notifications" ON "public"."notifications"
  FOR SELECT
  TO authenticated
  USING (true);
