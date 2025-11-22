# 📋 PASSO A PASSO - Executar SQL no Supabase

## 🎯 O que você vai fazer:
Adicionar a coluna `registration_code` no banco de dados para que o sistema gere códigos únicos para cada profissional.

---

## 📍 PASSO 1: Acesse o Supabase

1. Abra seu navegador
2. Acesse: **https://supabase.com/dashboard/project/xpxiwsqbgopdfdioljul**
3. Faça login se necessário

---

## 📍 PASSO 2: Abra o SQL Editor

1. No menu lateral esquerdo, procure por **"SQL Editor"** 🔍
2. Clique em **"SQL Editor"**
3. Você verá uma tela com um editor de código

---

## 📍 PASSO 3: Crie uma Nova Query

1. Clique no botão **"New Query"** (ou "+ New query")
2. Uma nova aba vai abrir com um editor vazio

---

## 📍 PASSO 4: Cole o SQL

**COPIE TODO O CÓDIGO ABAIXO** e cole no editor:

```sql
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
```

---

## 📍 PASSO 5: Execute o SQL

1. Com o código colado no editor, clique no botão **"Run"** (▶️ Play)
   - Ou pressione **Ctrl+Enter** (Windows/Linux)
   - Ou pressione **Cmd+Enter** (Mac)

2. Aguarde alguns segundos...

---

## ✅ PASSO 6: Verifique o Resultado

Você deve ver:

1. **Mensagens de sucesso** na parte inferior:
   ```
   NOTICE: Código gerado para profissional ...
   NOTICE: Códigos gerados com sucesso!
   ```

2. **Uma tabela com resultados** mostrando:
   - Nome dos profissionais
   - Emails
   - **Códigos de registro** (ex: PRF-2025-A7B2, PRF-2025-K9M3, etc.)

---

## 🎉 PRONTO!

Se você viu os códigos na tabela, **está tudo certo!**

Agora:
1. Acesse o sistema: https://attendance-bio.preview.emergentagent.com
2. Cadastre um novo profissional
3. Após a biometria, você verá o **modal com o código único** ✅
4. Use qualquer um dos dois métodos para registrar presença! 🎯

---

## 🐛 Resolução de Problemas

### ❌ Erro: "column already exists"
**Solução:** Tudo certo! A coluna já existe. Ignore este erro.

### ❌ Erro: "permission denied"
**Solução:** 
1. Vá em **Project Settings** > **API**
2. Use a chave **service_role** ao invés de **anon**
3. Ou execute via SQL Editor (já tem permissão)

### ❌ Erro: "table professionals does not exist"
**Solução:** Verifique se você executou o SQL de criação das tabelas antes.

### ❌ Nenhum resultado aparece
**Solução:** Isso é normal se você não tem profissionais cadastrados ainda. Cadastre um novo profissional e o código será gerado automaticamente.

---

## 📞 Verificação Final

Para ter certeza que funcionou, execute esta query simples:

```sql
SELECT COUNT(*) as total_com_codigo
FROM professionals
WHERE registration_code IS NOT NULL;
```

Se retornar um número > 0, **está perfeito!** ✅

---

**Qualquer dúvida, me chame! 🚀**
