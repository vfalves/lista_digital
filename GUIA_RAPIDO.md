# 🚀 Guia Rápido - Sistema de Lista de Presença Biométrica

## ⚡ Acesso Rápido

**URL Principal:** https://attendance-bio.preview.emergentagent.com

## 📱 3 Passos para Usar

### 1️⃣ CADASTRAR PROFISSIONAIS (Uma vez por pessoa)

1. Acesse a página inicial
2. Clique em **"Cadastro de Profissionais"**
3. Preencha:
   - Nome Completo
   - Email Corporativo
   - Função
   - Empresa
4. Clique em **"Cadastrar e Vincular Digital"**
5. **Coloque seu dedo no leitor biométrico do celular** 👆
6. Pronto! Profissional cadastrado ✅

**⚠️ Importante:** Cada profissional precisa fazer este cadastro apenas UMA vez. A digital fica vinculada permanentemente.

---

### 2️⃣ CRIAR LISTA DE PRESENÇA (Início da Reunião)

1. Acesse **"Gerenciar Lista de Presença"**
2. Aba **"Criar Nova Lista"**
3. Preencha os dados da reunião:
   - Nome da Instalação (ex: FPSO MV29)
   - Data e Hora (já vem preenchido com data/hora atual)
   - Título do Curso
   - Conteúdo (pode copiar e colar)
   - Dados do Instrutor (Nome, Função, Qualificação)
   - Localização (ex: MV29)
4. Clique em **"🚀 Criar Lista de Presença"**
5. Sistema muda automaticamente para aba "Gerenciar Lista Ativa"
6. **Cronômetro inicia automaticamente** ⏱️

---

### 3️⃣ REGISTRAR PRESENÇAS (Durante a Reunião)

1. Na aba **"Gerenciar Lista Ativa"**
2. Para cada participante:
   - Clique em **"🔐 Registrar Presença"**
   - Participante coloca o dedo no leitor 👆
   - **Dados aparecem automaticamente na tabela!** ✨
   
**O sistema preenche sozinho:**
- Número sequencial
- Nome completo
- Email
- Função
- Empresa
- Hora de entrada (data/hora exata)

3. Repita para todos os participantes

---

### 4️⃣ FINALIZAR REUNIÃO (Ao término)

1. Quando a reunião terminar, clique em **"✅ Finalizar Reunião"**
2. Confirme a ação
3. Sistema:
   - ⏱️ Calcula automaticamente a duração
   - 📄 Gera PDF formatado
   - ⬇️ Abre PDF para download
4. Pronto! Lista concluída e arquivada ✅

---

## 📊 VISUALIZAR LISTAS ANTERIORES

1. Acesse **"Visualizar Listas"**
2. Veja todas as listas (ativas e finalizadas)
3. Clique em **"Ver Detalhes"** para ver participantes
4. Clique em **"📄 Baixar PDF"** para listas finalizadas

---

## 🎯 Exemplo Prático

**Cenário:** Treinamento de Segurança com 10 participantes

1. **08:00** - Instrutor cria lista de presença
2. **08:00-08:15** - Participantes vão chegando e colocam o dedo (cada um registra sua presença)
3. **08:15-09:00** - Treinamento acontece
4. **09:00** - Instrutor clica em "Finalizar Reunião"
5. **Resultado:** PDF com duração "1h0min" e lista completa de 10 participantes

---

## 🔐 Sobre a Biometria

### Como funciona:
- Usa o **leitor nativo do seu celular** (mesmo que você usa para desbloquear)
- Não armazena imagem da digital (apenas código criptografado)
- 100% seguro e LGPD compliant
- Funciona offline depois de cadastrado

### Compatibilidade:
- ✅ iPhone 5S ou superior (Touch ID ou Face ID)
- ✅ Android com leitor biométrico
- ✅ Navegadores: Chrome, Safari, Edge, Firefox
- ⚠️ Precisa de HTTPS (já está configurado)

### Se não funcionar:
1. Verifique se está usando HTTPS
2. Atualize o navegador
3. Permita acesso ao sensor quando solicitado
4. Limpe o sensor e tente novamente

---

## ❓ Dúvidas Frequentes

**Q: Posso usar qualquer dedo?**
A: Sim, mas use o mesmo dedo no cadastro e nos registros de presença.

**Q: E se alguém não tem biometria?**
A: Infelizmente, o sistema requer dispositivo com biometria. É por segurança.

**Q: Posso editar uma lista depois de finalizada?**
A: Não, listas finalizadas são imutáveis por questões de auditoria.

**Q: Quantas pessoas podem registrar presença?**
A: Ilimitado! O PDF suporta até 30 na primeira página.

**Q: Posso criar várias listas ao mesmo tempo?**
A: Apenas uma lista pode estar ativa por vez.

**Q: Como faço backup dos dados?**
A: Dados estão seguros no Supabase. PDFs podem ser arquivados localmente.

---

## 🆘 Problemas Comuns

### "Profissional já cadastrado com esta digital"
→ Esta digital já está em uso. Use outra digital ou remova o cadastro antigo.

### "Profissional não encontrado"
→ Faça o cadastro primeiro na opção "Cadastro de Profissionais".

### "Esta lista já foi finalizada"
→ Crie uma nova lista para registrar novas presenças.

### "Navegador não suporta biometria"
→ Use Chrome, Safari ou Edge. Certifique-se de estar em HTTPS.

---

## 📞 Suporte

- 📖 Documentação completa: `/app/README_SISTEMA_BIOMETRICO.md`
- 🔍 Verificar logs: `tail -f /var/log/supervisor/backend.*.log`
- 🏥 Health check: https://biometric-attend-5.preview.emergentagent.com/api/health

---

**✅ Sistema Operacional e Pronto para Uso!**

**Desenvolvido com WebAuthn API - Seguro, Rápido, Confiável** 🔐
