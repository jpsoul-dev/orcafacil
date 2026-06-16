-- Migration to optimize RLS policies for better database performance.
-- Replaces direct calls to auth.uid() with (SELECT auth.uid()) so that the PostgreSQL
-- query planner evaluates and caches the user ID once per query instead of per-row.
-- Reference: https://supabase.com/docs/guides/database/postgres/row-level-security#rls-performance-recommendations

---------------------------------------------------------
-- 1. Table: notifications
---------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage notifications" ON "public"."notifications";
CREATE POLICY "Admins can manage notifications" ON "public"."notifications" 
  USING ((EXISTS ( SELECT 1
                  FROM "public"."profiles"
                  WHERE (("profiles"."id" = (SELECT "auth"."uid"())) AND ("profiles"."is_admin" = true)))));

---------------------------------------------------------
-- 2. Table: profiles
---------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert own profile" ON "public"."profiles";
CREATE POLICY "Users can insert own profile" ON "public"."profiles" 
  FOR INSERT WITH CHECK (((SELECT "auth"."uid"()) = "id"));

DROP POLICY IF EXISTS "Users can update own profile" ON "public"."profiles";
CREATE POLICY "Users can update own profile" ON "public"."profiles" 
  FOR UPDATE USING (((SELECT "auth"."uid"()) = "id"));

DROP POLICY IF EXISTS "Users can view own profile" ON "public"."profiles";
CREATE POLICY "Users can view own profile" ON "public"."profiles" 
  FOR SELECT USING (((SELECT "auth"."uid"()) = "id"));

---------------------------------------------------------
-- 3. Table: catalog_items
---------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage their own catalog items" ON "public"."catalog_items";
CREATE POLICY "Users can manage their own catalog items" ON "public"."catalog_items" 
  TO "authenticated" 
  USING (((SELECT "auth"."uid"()) = "user_id")) 
  WITH CHECK (((SELECT "auth"."uid"()) = "user_id"));

---------------------------------------------------------
-- 4. Table: companies
---------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage their own company" ON "public"."companies";
CREATE POLICY "Users can manage their own company" ON "public"."companies" 
  TO "authenticated" 
  USING (((SELECT "auth"."uid"()) = "user_id")) 
  WITH CHECK (((SELECT "auth"."uid"()) = "user_id"));

---------------------------------------------------------
-- 5. Table: customers
---------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage their own customers" ON "public"."customers";
CREATE POLICY "Users can manage their own customers" ON "public"."customers" 
  TO "authenticated" 
  USING (((SELECT "auth"."uid"()) = "user_id")) 
  WITH CHECK (((SELECT "auth"."uid"()) = "user_id"));

---------------------------------------------------------
-- 6. Table: quotes
---------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage their own quotes" ON "public"."quotes";
CREATE POLICY "Users can manage their own quotes" ON "public"."quotes" 
  TO "authenticated" 
  USING (((SELECT "auth"."uid"()) = "user_id")) 
  WITH CHECK (((SELECT "auth"."uid"()) = "user_id"));

---------------------------------------------------------
-- 7. Table: quote_items
---------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage their own quote items" ON "public"."quote_items";
CREATE POLICY "Users can manage their own quote items" ON "public"."quote_items" 
  TO "authenticated" 
  USING ((EXISTS ( SELECT 1
                  FROM "public"."quotes"
                  WHERE (("quotes"."id" = "quote_items"."quote_id") AND ("quotes"."user_id" = (SELECT "auth"."uid"())))))) 
  WITH CHECK ((EXISTS ( SELECT 1
                        FROM "public"."quotes"
                        WHERE (("quotes"."id" = "quote_items"."quote_id") AND ("quotes"."user_id" = (SELECT "auth"."uid"()))))));

---------------------------------------------------------
-- 8. Table: quote_receipts
---------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage their own receipts" ON "public"."quote_receipts";
CREATE POLICY "Users can manage their own receipts" ON "public"."quote_receipts" 
  USING (((SELECT "auth"."uid"()) = "user_id")) 
  WITH CHECK (((SELECT "auth"."uid"()) = "user_id"));

---------------------------------------------------------
-- 9. Table: receipt_items
---------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage their own receipt items" ON "public"."receipt_items";
CREATE POLICY "Users can manage their own receipt items" ON "public"."receipt_items" 
  USING ((EXISTS ( SELECT 1
                  FROM "public"."quote_receipts" "qr"
                  WHERE (("qr"."id" = "receipt_items"."receipt_id") AND ("qr"."user_id" = (SELECT "auth"."uid"())))))) 
  WITH CHECK ((EXISTS ( SELECT 1
                        FROM "public"."quote_receipts" "qr"
                        WHERE (("qr"."id" = "receipt_items"."receipt_id") AND ("qr"."user_id" = (SELECT "auth"."uid"()))))));

---------------------------------------------------------
-- 10. Table: notification_reads
---------------------------------------------------------
DROP POLICY IF EXISTS "Users can mark notifications as read" ON "public"."notification_reads";
CREATE POLICY "Users can mark notifications as read" ON "public"."notification_reads" 
  FOR INSERT WITH CHECK (((SELECT "auth"."uid"()) = "user_id"));

DROP POLICY IF EXISTS "Users can view their own reads" ON "public"."notification_reads";
CREATE POLICY "Users can view their own reads" ON "public"."notification_reads" 
  FOR SELECT USING (((SELECT "auth"."uid"()) = "user_id"));
