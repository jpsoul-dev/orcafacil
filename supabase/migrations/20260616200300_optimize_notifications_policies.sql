-- Migration to resolve 'Multiple Permissive Policies' performance warning on public.notifications
-- Splits the broad 'FOR ALL' admin policy into specific 'INSERT', 'UPDATE', and 'DELETE' policies.
-- This ensures that SELECT queries do not evaluate the admin checks redundantly, 
-- as the 'Anyone can view notifications' policy already permits SELECT for all roles.

-- 1. Drop the old ALL policy
DROP POLICY IF EXISTS "Admins can manage notifications" ON "public"."notifications";

-- 2. Create optimized policies for admin actions
CREATE POLICY "Admins can insert notifications" ON "public"."notifications" 
  FOR INSERT 
  WITH CHECK ((EXISTS ( SELECT 1
                        FROM "public"."profiles"
                        WHERE (("profiles"."id" = (SELECT "auth"."uid"())) AND ("profiles"."is_admin" = true)))));

CREATE POLICY "Admins can update notifications" ON "public"."notifications" 
  FOR UPDATE 
  USING ((EXISTS ( SELECT 1
                   FROM "public"."profiles"
                   WHERE (("profiles"."id" = (SELECT "auth"."uid"())) AND ("profiles"."is_admin" = true)))));

CREATE POLICY "Admins can delete notifications" ON "public"."notifications" 
  FOR DELETE 
  USING ((EXISTS ( SELECT 1
                   FROM "public"."profiles"
                   WHERE (("profiles"."id" = (SELECT "auth"."uid"())) AND ("profiles"."is_admin" = true)))));
