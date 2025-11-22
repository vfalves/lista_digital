# 📋 Sistema de Lista de Presença Biométrica

## 🎯 Visão Geral

Sistema completo de gerenciamento de listas de presença com autenticação biométrica usando a WebAuthn API. O sistema permite cadastrar profissionais usando a digital do celular, criar listas de presença para treinamentos e gerar PDFs formatados seguindo o modelo corporativo.

## 🏗️ Arquitetura

- **Backend:** FastAPI + Supabase (PostgreSQL)
- **Frontend:** HTML5 + CSS3 + JavaScript (WebAuthn API)
- **Banco de Dados:** Supabase (3 tabelas)
- **Geração de PDF:** ReportLab
- **Autenticação:** WebAuthn (Biometria nativa do dispositivo)

## 📱 Funcionalidades

### 1. Cadastro de Profissionais
- Formulário com: Nome, Email, Função, Empresa
- Captura de digital usando WebAuthn
- Validação de duplicação por credential_id
- Lista de profissionais cadastrados em tempo real

### 2. Criação de Lista de Presença
- Formulário completo seguindo o modelo corporativo:
  - Nome da Instalação
  - Data e Hora da Reunião
  - Título do Curso
  - Conteúdo do Curso
  - Dados do Instrutor (Nome, Função, Qualificação)
  - Localização
- Início automático do cronômetro

### 3. Registro de Presença
- Leitura de digital dos participantes
- Busca automática dos dados no banco
- Preenchimento automático da lista
- Numeração sequencial automática
- Registro de data/hora de entrada

### 4. Finalização e PDF
- Botão "Fim de Reunião"
- Cálculo automático da duração
- Geração de PDF formatado conforme modelo
- Download automático do PDF

## 🗄️ Estrutura do Banco de Dados

### Tabela: professionals
```sql
- id (UUID, PK)
- code (TEXT, UNIQUE) -- credential_id em base64
- name (TEXT)
- email (TEXT, UNIQUE)
- profession (TEXT)
- company (TEXT)
- created_at (TIMESTAMP)
```

### Tabela: attendance_lists
```sql
- id (UUID, PK)
- installation_name (TEXT)
- meeting_date (DATE)
- meeting_time (TIME)
- duration (TEXT, nullable)
- course_title (TEXT)
- course_content (TEXT)
- instructor_name (TEXT)
- instructor_role (TEXT)
- instructor_qualification (TEXT)
- location (TEXT)
- start_time (TIMESTAMP)
- end_time (TIMESTAMP, nullable)
- status (TEXT) -- 'active' ou 'completed'
- created_at (TIMESTAMP)
```

### Tabela: attendance_records
```sql
- id (UUID, PK)
- list_id (UUID, FK -> attendance_lists)
- professional_id (UUID, FK -> professionals)
- entry_time (TIMESTAMP)
- local (TEXT)
- row_number (INTEGER)
- created_at (TIMESTAMP)
```

## 🔌 Endpoints da API

### Profissionais
- `POST /api/professionals` - Cadastrar profissional
- `GET /api/professionals` - Listar todos
- `GET /api/professionals/by-code/{code}` - Buscar por credential_id

### Listas de Presença
- `POST /api/attendance-lists` - Criar nova lista
- `GET /api/attendance-lists` - Listar todas
- `GET /api/attendance-lists/{id}` - Buscar específica
- `PUT /api/attendance-lists/{id}/complete` - Finalizar reunião

### Registros de Presença
- `POST /api/attendance-records` - Registrar presença
- `GET /api/attendance-records/list/{list_id}` - Buscar registros de uma lista

### Outros
- `GET /api/` - Mensagem de boas-vindas
- `GET /api/health` - Health check
- `GET /api/attendance-lists/{id}/pdf` - Gerar PDF

## 🌐 Páginas do Sistema

### 1. index.html
Menu principal com 3 opções:
- Cadastro de Profissionais
- Gerenciar Lista de Presença
- Visualizar Listas

### 2. cadastro.html
- Formulário de cadastro
- Captura de biometria via WebAuthn
- Lista de profissionais cadastrados

### 3. lista-presenca.html
Duas abas:
- **Criar Nova Lista:** Formulário completo
- **Gerenciar Lista Ativa:** 
  - Botão para escanear digital
  - Tabela de participantes em tempo real
  - Botão "Finalizar Reunião"

### 4. visualizar-listas.html
- Grid com todas as listas (ativas e finalizadas)
- Modal com detalhes completos
- Botão para baixar PDF (listas finalizadas)

## 🔐 Segurança WebAuthn

### Como funciona:
1. **Cadastro:**
   - Sistema cria credencial biométrica usando `navigator.credentials.create()`
   - Credential ID é convertido para base64
   - ID é armazenado no Supabase vinculado ao profissional

2. **Autenticação:**
   - Sistema solicita autenticação com `navigator.credentials.get()`
   - Usuário coloca o dedo no leitor
   - Credential ID retornado é usado para buscar profissional
   - Presença é registrada automaticamente

### Requisitos:
- ✅ HTTPS (já disponível no domínio)
- ✅ Navegador compatível (Chrome, Safari, Edge, Firefox moderno)
- ✅ Dispositivo com biometria (impressão digital ou Face ID)

## 🚀 Como Usar

### Para Administradores:

1. **Cadastrar Profissionais:**
   - Acesse "Cadastro de Profissionais"
   - Preencha os dados
   - Clique em "Cadastrar e Vincular Digital"
   - Coloque o dedo no leitor quando solicitado

2. **Criar Lista de Presença:**
   - Acesse "Gerenciar Lista de Presença"
   - Aba "Criar Nova Lista"
   - Preencha todos os campos
   - Clique em "Criar Lista de Presença"

3. **Registrar Presenças:**
   - Aba "Gerenciar Lista Ativa"
   - Clique em "Registrar Presença"
   - Cada participante coloca o dedo no leitor
   - Dados são preenchidos automaticamente

4. **Finalizar Reunião:**
   - Clique em "Finalizar Reunião"
   - Sistema calcula duração
   - PDF é gerado e baixado automaticamente

### Para Participantes:

1. **Cadastro (uma vez):**
   - Vá ao administrador
   - Forneça seus dados
   - Vincule sua digital

2. **Registrar Presença:**
   - Coloque o dedo no leitor quando solicitado
   - Pronto! Presença registrada

## 📄 Formato do PDF

O PDF gerado segue exatamente o modelo corporativo fornecido:
- Cabeçalho bilíngue (PT/EN)
- Informações da instalação e reunião
- Dados do instrutor
- Tabela de participantes (até 30 linhas)
- Notas e rodapé padrão
- Código do documento

## 🔧 Configuração Técnica

### Backend (.env)
```env
SUPABASE_URL=https://xpxiwsqbgopdfdioljul.supabase.co
SUPABASE_KEY=eyJhbGc...
CORS_ORIGINS=*
```

### Frontend
- URLs dinâmicas usando `window.location.origin`
- WebAuthn configurado com `platform` authenticator
- Atualização em tempo real dos dados

## 🐛 Resolução de Problemas

### "Navegador não suporta biometria"
- Use Chrome, Safari, Edge ou Firefox moderno
- Verifique se está acessando via HTTPS

### "Digital não reconhecida"
- Certifique-se de que foi cadastrado primeiro
- Limpe o sensor e tente novamente
- Use o mesmo dedo do cadastro

### "Profissional já cadastrado"
- Esta digital já está vinculada a outro usuário
- Use outra digital ou remova o cadastro anterior

### Erro ao gerar PDF
- Verifique os logs do backend
- Confirme que todos os dados foram salvos corretamente

## 📊 URLs do Sistema

- **Frontend:** https://attendance-bio.preview.emergentagent.com
- **API Backend:** https://biometric-attend-5.preview.emergentagent.com/api
- **Health Check:** https://biometric-attend-5.preview.emergentagent.com/api/health
- **Supabase Dashboard:** https://supabase.com/dashboard/project/xpxiwsqbgopdfdioljul

## 🎨 Design

- Design moderno com gradiente roxo
- Cards interativos com hover effects
- Responsivo para mobile e desktop
- Ícones emoji para melhor UX
- Mensagens de feedback em tempo real

## ✅ Status do Sistema

- ✅ Backend FastAPI funcionando
- ✅ Integração Supabase ativa
- ✅ Frontend HTML/CSS/JS operacional
- ✅ WebAuthn implementado
- ✅ Geração de PDF funcionando
- ✅ Todas as páginas criadas
- ✅ API completa testada

## 📝 Próximos Passos (Opcional)

1. Adicionar autenticação de administrador
2. Implementar edição de registros
3. Adicionar filtros e busca
4. Exportar dados para Excel
5. Gráficos e estatísticas
6. Notificações por email
7. Backup automático

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do backend: `tail -f /var/log/supervisor/backend.*.log`
2. Teste a API: `curl http://localhost:8001/api/health`
3. Verifique o console do navegador (F12)

---

**Desenvolvido com ❤️ usando FastAPI, Supabase e WebAuthn**
