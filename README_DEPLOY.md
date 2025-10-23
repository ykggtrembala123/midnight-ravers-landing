# 🚀 Landing Page Midnigth Raver$ — Deploy Guide

## ✅ O que está incluído neste projeto

- ✅ Landing Page completa com design minimalista preto absoluto
- ✅ Logo WBG verde + favicon preto
- ✅ Fonte Impact customizada
- ✅ Música de fundo com controle de mute
- ✅ Timer countdown até 29/10/2025
- ✅ Formulário de captura de leads
- ✅ Google Analytics integrado
- ✅ **MIGRADO PARA POSTGRESQL (SUPABASE)**
- ✅ **PRONTO PARA DEPLOY NA VERCEL**

---

## 📦 Estrutura do Projeto

```
midnight_ravers_landing/
├── client/               # Frontend (React + Tailwind)
│   ├── public/          # Assets (logos, música, favicon)
│   └── src/             # Código React
├── server/              # Backend (Express + tRPC)
│   ├── db.ts           # Queries PostgreSQL (Supabase)
│   └── routers.ts      # API tRPC
├── drizzle/            # Schema PostgreSQL
│   └── schema.ts       # Tabelas (users, leads_midnight_ravers)
├── package.json        # Dependências (incluindo postgres)
└── drizzle.config.ts   # Config PostgreSQL
```

---

## 🔧 Instalação Local (Opcional)

Se você quiser testar localmente antes de fazer deploy:

```bash
# 1. Extrair o ZIP
unzip midnight_ravers_landing_FINAL.zip
cd midnight_ravers_landing

# 2. Instalar dependências
pnpm install

# 3. Criar arquivo .env
cp .env.example .env

# 4. Editar .env com suas credenciais
# DATABASE_URL=postgresql://...
# JWT_SECRET=...

# 5. Rodar localmente
pnpm dev
```

---

## 🚀 Deploy na Vercel + Supabase

### Passo 1: Criar Banco de Dados no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em **"New Project"**
3. Preencha:
   - **Name:** `midnight-ravers-db`
   - **Database Password:** Crie uma senha forte (anote!)
   - **Region:** South America (São Paulo)
   - **Plan:** Free
4. Aguarde 2-3 minutos

### Passo 2: Criar Tabelas no Supabase

1. No Supabase, vá em **"SQL Editor"**
2. Clique em **"New query"**
3. Cole este SQL:

```sql
-- Tabela de usuários
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  "openId" VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  "loginMethod" VARCHAR(64),
  role VARCHAR(20) DEFAULT 'user' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "lastSignedIn" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabela de leads
CREATE TABLE leads_midnight_ravers (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  instagram VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Índice para busca rápida por email
CREATE INDEX idx_leads_email ON leads_midnight_ravers(email);

-- Segurança (RLS)
ALTER TABLE leads_midnight_ravers ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT público (formulário da landing page)
CREATE POLICY "Permitir insert público" ON leads_midnight_ravers
  FOR INSERT
  WITH CHECK (true);

-- Permitir SELECT apenas autenticado
CREATE POLICY "Permitir select autenticado" ON leads_midnight_ravers
  FOR SELECT
  USING (auth.role() = 'authenticated');
```

4. Clique em **"Run"**

### Passo 3: Obter Connection String

1. No Supabase, vá em **"Settings"** → **"Database"**
2. Role até **"Connection string"**
3. Selecione **"URI"**
4. Copie a URL e substitua `[YOUR-PASSWORD]` pela senha que você criou

Exemplo:
```
postgresql://postgres:minhasenha123@db.abcdefghijk.supabase.co:5432/postgres
```

### Passo 4: Subir Código no GitHub

```bash
# 1. Inicializar Git
git init

# 2. Adicionar arquivos
git add .

# 3. Commit
git commit -m "Landing Page Midnigth Raver$ - Pronto para deploy"

# 4. Criar repositório no GitHub
# Vá em github.com/new e crie um repo chamado "midnight-ravers-landing"

# 5. Conectar e fazer push
git remote add origin https://github.com/SEU_USUARIO/midnight-ravers-landing.git
git branch -M main
git push -u origin main
```

### Passo 5: Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New..."** → **"Project"**
3. Selecione o repositório `midnight-ravers-landing`
4. Clique em **"Import"**

### Passo 6: Configurar Variáveis de Ambiente

Na tela de configuração, clique em **"Environment Variables"** e adicione:

#### DATABASE_URL
```
postgresql://postgres:suasenha@db.xxxxx.supabase.co:5432/postgres
```
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### JWT_SECRET
```
sua-chave-secreta-super-segura-aqui-12345678901234567890
```
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- **Dica:** Gere uma chave em [randomkeygen.com](https://randomkeygen.com/)

#### VITE_APP_TITLE
```
WBG — Midnight Raver$ Landing Page
```
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### VITE_APP_LOGO
```
/wbg-logo.png
```
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### Passo 7: Fazer Deploy

1. Clique em **"Deploy"**
2. Aguarde 2-5 minutos
3. Acesse o site gerado (ex: `midnight-ravers-landing.vercel.app`)

---

## ✅ Verificar se Está Funcionando

1. Acesse o site
2. Clique em "CLICK TO ENTER"
3. Preencha o formulário com dados de teste
4. Verifique no Supabase:
   - Vá em **"Table Editor"**
   - Selecione `leads_midnight_ravers`
   - Veja se o lead apareceu

---

## 📊 Exportar Leads do Supabase

### Via Interface (Simples)

1. No Supabase, vá em **"Table Editor"**
2. Selecione `leads_midnight_ravers`
3. Clique no botão **"..."** (três pontos)
4. Clique em **"Download as CSV"**

### Via SQL

1. Vá em **"SQL Editor"**
2. Execute:
```sql
SELECT * FROM leads_midnight_ravers ORDER BY created_at DESC;
```
3. Clique em **"Download CSV"**

---

## 📧 Enviar Emails no Dia 29/10

### Opção Recomendada: Mailchimp

1. **Criar conta:** [mailchimp.com](https://mailchimp.com)
2. **Importar leads:** Exporte CSV do Supabase e importe no Mailchimp
3. **Criar campanha:**
   - Subject: `🔑 Sua senha de acesso exclusivo - Midnigth Raver$ | WBG`
   - Template: Use o exemplo no arquivo `VERCEL_SUPABASE_SETUP.md`
4. **Agendar:** 29/10/2025 às 00:00

---

## 📈 Google Analytics

O Google Analytics já está configurado!

- **ID:** `G-XMCY5PP1PQ`
- **Acesse:** [analytics.google.com](https://analytics.google.com)
- **Veja:** Visitantes, páginas mais acessadas, conversões

---

## 🔧 Atualizações Futuras

Para atualizar o site:

```bash
# 1. Fazer mudanças no código
# 2. Commit
git add .
git commit -m "Descrição da mudança"

# 3. Push
git push origin main
```

A Vercel vai detectar e fazer redeploy automaticamente!

---

## 📁 Arquivos Importantes

- **`client/public/wbg-logo.png`** — Logo verde principal
- **`client/public/favicon.png`** — Logo preta (favicon)
- **`client/public/midnight-ravers.mp3`** — Música de fundo
- **`client/public/impact.ttf`** — Fonte Impact
- **`drizzle/schema.ts`** — Schema do banco PostgreSQL
- **`server/db.ts`** — Queries do banco
- **`client/src/pages/Home.tsx`** — Página principal

---

## 🆘 Problemas Comuns

### Erro: "Database Connection Failed"

**Solução:** Verifique se a `DATABASE_URL` está correta na Vercel.

### Formulário não envia

**Solução:** Verifique se a tabela `leads_midnight_ravers` foi criada no Supabase.

### Música não toca

**Solução:** Certifique-se de que o arquivo `midnight-ravers.mp3` está em `client/public/`.

### Erro de build na Vercel

**Solução:** Verifique se todas as variáveis de ambiente foram configuradas.

---

## 📞 Suporte

- **Documentação Vercel:** [vercel.com/docs](https://vercel.com/docs)
- **Documentação Supabase:** [supabase.com/docs](https://supabase.com/docs)
- **Comunidade Vercel:** [vercel.com/discord](https://vercel.com/discord)

---

## ✅ Checklist Final

- [ ] Projeto criado no Supabase
- [ ] Tabelas criadas (users, leads_midnight_ravers)
- [ ] Connection string copiada
- [ ] Código no GitHub
- [ ] Projeto importado na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado
- [ ] Site testado e funcionando
- [ ] Formulário capturando leads
- [ ] Google Analytics rastreando
- [ ] Plano de envio de emails preparado

---

**Boa sorte com o lançamento! 🚀**

**We Believe In Ghosts.** 🌑

