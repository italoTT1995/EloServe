-- =========================================================================
-- ELOSERVE - CONFIGURAÇÃO DO SUPABASE STORAGE PARA O CARDÁPIO
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard)
-- =========================================================================

-- 1. Cria o Bucket 'cardapio' como público
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cardapio',
  'cardapio',
  true,
  5242880, -- Limite de 5MB por foto (as fotos enviadas pelo sistema já são comprimidas para < 80KB)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- 2. Habilita Políticas de Acesso (RLS) para permitir leitura e envio de fotos

-- A) Leitura pública: qualquer pessoa ou cliente do cardápio online pode ver a foto
DROP POLICY IF EXISTS "Imagens de cardapio sao publicas" ON storage.objects;
CREATE POLICY "Imagens de cardapio sao publicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'cardapio');

-- B) Upload de fotos: permite que o painel do restaurante envie fotos de produtos
DROP POLICY IF EXISTS "Permitir upload de fotos do cardapio" ON storage.objects;
CREATE POLICY "Permitir upload de fotos do cardapio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cardapio');

-- C) Atualização de fotos: permite trocar a foto de um produto existente
DROP POLICY IF EXISTS "Permitir update de fotos do cardapio" ON storage.objects;
CREATE POLICY "Permitir update de fotos do cardapio"
ON storage.objects FOR UPDATE
USING (bucket_id = 'cardapio');

-- D) Remoção de fotos: permite excluir fotos de produtos apagados
DROP POLICY IF EXISTS "Permitir delete de fotos do cardapio" ON storage.objects;
CREATE POLICY "Permitir delete de fotos do cardapio"
ON storage.objects FOR DELETE
USING (bucket_id = 'cardapio');

-- Confirmação
SELECT id, name, public, created_at FROM storage.buckets WHERE id = 'cardapio';
