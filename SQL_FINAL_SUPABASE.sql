-- COPIE ESTE CÓDIGO COMPLETO E COLE NO SUPABASE

-- Adicionar coluna registration_code
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS registration_code TEXT;

-- Tornar a coluna única
ALTER TABLE professionals ADD CONSTRAINT professionals_registration_code_unique UNIQUE (registration_code);

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_professionals_registration_code ON professionals(registration_code);

-- Gerar códigos para profissionais existentes
UPDATE professionals 
SET registration_code = 'PRF-2025-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT || id::TEXT), 1, 4))
WHERE registration_code IS NULL;
