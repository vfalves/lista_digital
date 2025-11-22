-- Adicionar coluna registration_code à tabela professionals
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS registration_code TEXT UNIQUE;

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_professionals_registration_code ON professionals(registration_code);

-- Gerar códigos para profissionais existentes (se houver)
UPDATE professionals 
SET registration_code = 'PRF-2024-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4))
WHERE registration_code IS NULL;
