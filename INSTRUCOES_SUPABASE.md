# 🔧 Instruções para Adicionar Coluna no Supabase

## ⚠️ IMPORTANTE: Execute este SQL no Supabase

Para que o sistema funcione com códigos de registro únicos, você precisa adicionar uma coluna no banco de dados.

### 📍 Como executar:

1. Acesse: https://supabase.com/dashboard/project/xpxiwsqbgopdfdioljul
2. Vá em **"SQL Editor"** no menu lateral
3. Clique em **"New Query"**
4. Cole o SQL abaixo:

```sql
-- Adicionar coluna registration_code à tabela professionals
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS registration_code TEXT UNIQUE;

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_professionals_registration_code 
ON professionals(registration_code);

-- Gerar códigos para profissionais já existentes
DO $$
DECLARE
    prof RECORD;
    new_code TEXT;
BEGIN
    FOR prof IN SELECT id FROM professionals WHERE registration_code IS NULL
    LOOP
        new_code := 'PRF-2024-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
        UPDATE professionals 
        SET registration_code = new_code 
        WHERE id = prof.id;
    END LOOP;
END $$;
```

5. Clique em **"Run"** ou pressione `Ctrl+Enter`
6. Aguarde a mensagem de sucesso ✅

---

## ✅ Verificar se funcionou:

Execute esta query para verificar:

```sql
SELECT id, name, email, registration_code 
FROM professionals 
LIMIT 5;
```

Você deve ver a coluna `registration_code` preenchida com códigos no formato `PRF-2024-XXXX`.

---

## 🎯 O que isso faz:

1. **Adiciona coluna:** Cria a coluna `registration_code` na tabela `professionals`
2. **Garante unicidade:** Define a coluna como UNIQUE para evitar códigos duplicados
3. **Cria índice:** Melhora a performance de busca por código
4. **Atualiza registros existentes:** Gera códigos para profissionais já cadastrados

---

## 🚨 Se der erro:

**Erro: "column already exists"**
- ✅ Tudo certo! A coluna já existe, ignore o erro

**Erro: "permission denied"**
- ⚠️ Use a chave **service_role** ao invés da chave anon
- Ou execute via Dashboard do Supabase

**Erro: "syntax error"**
- ⚠️ Verifique se copiou todo o SQL corretamente
- Execute linha por linha se necessário

---

## 📞 Suporte

Após executar o SQL, teste o cadastro de um novo profissional para verificar se o código de registro está sendo gerado.

---

**✅ Depois de executar o SQL, o sistema estará 100% funcional com os dois modos de autenticação!**
