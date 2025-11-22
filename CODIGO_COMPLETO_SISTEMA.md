# 📦 CÓDIGO COMPLETO DO SISTEMA DE LISTA DE PRESENÇA BIOMÉTRICA

## 🗄️ 1. SQL DO BANCO DE DADOS (SUPABASE)

Execute este SQL no Supabase Dashboard → SQL Editor:

```sql
-- ============================================
-- CÓDIGO COMPLETO PARA SUPABASE
-- APAGUE TUDO E COLE ESTE CÓDIGO
-- ============================================

-- Dropar tudo primeiro (para limpar)
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS attendance_lists CASCADE;
DROP TABLE IF EXISTS professionals CASCADE;

-- Criar tabela professionals COM registration_code
CREATE TABLE professionals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  registration_code TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  profession TEXT NOT NULL,
  company TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela attendance_lists
CREATE TABLE attendance_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  installation_name TEXT NOT NULL,
  meeting_date DATE NOT NULL,
  meeting_time TIME NOT NULL,
  duration TEXT,
  course_title TEXT NOT NULL,
  course_content TEXT NOT NULL,
  instructor_name TEXT NOT NULL,
  instructor_role TEXT NOT NULL,
  instructor_qualification TEXT NOT NULL,
  location TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela attendance_records
CREATE TABLE attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES attendance_lists(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  entry_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  local TEXT NOT NULL,
  row_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_professionals_code ON professionals(code);
CREATE INDEX idx_professionals_email ON professionals(email);
CREATE INDEX idx_professionals_registration_code ON professionals(registration_code);
CREATE INDEX idx_attendance_lists_status ON attendance_lists(status);
CREATE INDEX idx_attendance_records_list_id ON attendance_records(list_id);
CREATE INDEX idx_attendance_records_professional_id ON attendance_records(professional_id);

-- Ativar Row Level Security
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Políticas para professionals
CREATE POLICY "Enable all for professionals" ON professionals FOR ALL USING (true) WITH CHECK (true);

-- Políticas para attendance_lists
CREATE POLICY "Enable all for attendance_lists" ON attendance_lists FOR ALL USING (true) WITH CHECK (true);

-- Políticas para attendance_records
CREATE POLICY "Enable all for attendance_records" ON attendance_records FOR ALL USING (true) WITH CHECK (true);
```

---

## ⚙️ 2. BACKEND (.env)

Arquivo: `/app/backend/.env`

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"

# Supabase Configuration
SUPABASE_URL="https://xpxiwsqbgopdfdioljul.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhweGl3c3FiZ29wZGZkaW9sanVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU3NjQxOSwiZXhwIjoyMDc5MTUyNDE5fQ.h3tPQuL87CnRtBUZbE8W0MoPysCHb4a7G0dtCgKZ9YQ"
```

---

## 🔗 LINK DO SISTEMA:

**Frontend:** https://attendance-bio.preview.emergentagent.com

**Como usar:**
1. Acesse pelo celular (precisa de leitor biométrico)
2. Cadastre profissionais com digital
3. Crie listas de presença
4. Registre presença por biometria ou código
5. Baixe PDFs formatados

---

## 📚 ARQUIVOS DISPONÍVEIS:

Todos os códigos estão em:
- `/app/backend/server.py` - Backend completo
- `/app/frontend/public/index.html` - Menu principal
- `/app/frontend/public/cadastro.html` - Cadastro com biometria
- `/app/frontend/public/lista-presenca.html` - Gerenciar listas
- `/app/frontend/public/visualizar-listas.html` - Visualizar e baixar PDFs

---

## 🚀 COMANDOS ÚTEIS:

```bash
# Reiniciar backend
sudo supervisorctl restart backend

# Reiniciar frontend
sudo supervisorctl restart frontend

# Ver logs do backend
tail -f /var/log/supervisor/backend.err.log

# Ver status
sudo supervisorctl status
```

---

**Sistema completo e funcional!** 🎉
