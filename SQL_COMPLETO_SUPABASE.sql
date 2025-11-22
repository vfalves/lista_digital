-- ============================================
-- SQL COMPLETO PARA SUPABASE
-- Sistema de Lista de Presença Biométrica
-- ============================================

-- 1. Adicionar coluna registration_code (se não existir)
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS registration_code TEXT UNIQUE;

-- 2. Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_professionals_registration_code 
ON professionals(registration_code);

-- 3. Gerar códigos únicos para profissionais já cadastrados
DO $$
DECLARE
    prof RECORD;
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    -- Loop por todos os profissionais sem código
    FOR prof IN 
        SELECT id 
        FROM professionals 
        WHERE registration_code IS NULL
    LOOP
        -- Gerar código único
        code_exists := TRUE;
        WHILE code_exists LOOP
            -- Formato: PRF-2025-XXXX (4 caracteres aleatórios)
            new_code := 'PRF-2025-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || prof.id::TEXT) FROM 1 FOR 4));
            
            -- Verificar se já existe
            SELECT EXISTS(
                SELECT 1 
                FROM professionals 
                WHERE registration_code = new_code
            ) INTO code_exists;
        END LOOP;
        
        -- Atualizar profissional com código único
        UPDATE professionals 
        SET registration_code = new_code 
        WHERE id = prof.id;
        
        -- Log (opcional)
        RAISE NOTICE 'Código gerado para profissional %: %', prof.id, new_code;
    END LOOP;
    
    RAISE NOTICE 'Códigos gerados com sucesso!';
END $$;

-- 4. Verificar resultado
SELECT 
    id,
    name,
    email,
    registration_code,
    created_at
FROM professionals
ORDER BY created_at DESC
LIMIT 10;
