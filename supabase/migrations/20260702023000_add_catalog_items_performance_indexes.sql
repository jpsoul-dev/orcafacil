-- Migração: Adicionar índices de performance para catalog_items
CREATE INDEX IF NOT EXISTS idx_catalog_items_user_id ON public.catalog_items USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_catalog_items_user_id_name ON public.catalog_items USING btree (user_id, name);
CREATE INDEX IF NOT EXISTS idx_catalog_items_user_id_created_at ON public.catalog_items USING btree (user_id, created_at DESC);
