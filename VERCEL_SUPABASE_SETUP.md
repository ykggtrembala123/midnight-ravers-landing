# 🚀 Configuração Vercel + Supabase - Landing Page Midnigth Raver$

## 📋 Pré-requisitos

- Conta no GitHub (já criada)
- Conta na Vercel (já criada)
- Conta no Supabase (criar em [supabase.com](https://supabase.com))

---

## 1️⃣ Configurar Banco de Dados no Supabase

### Passo 1: Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em **"New Project"**
3. Preencha:
   - **Name:** `midnight-ravers-db`
   - **Database Password:** Crie uma senha forte (guarde ela!)
   - **Region:** South America (São Paulo) - mais próximo do Brasil
   - **Pricing Plan:** Free
4. Clique em **"Create new project"**
5. Aguarde 2-3 minutos até o projeto ser criado

### Passo 2: Criar Tabela de Leads

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**
3. Cole o seguinte SQL:

```sql
-- Criar tabela de leads
CREATE TABLE leads_midnight_ravers (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  instagram VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Criar índice no email para buscas rápidas
CREATE INDEX idx_leads_email ON leads_midnight_ravers(email);

-- Habilitar Row Level Security (RLS) - segurança
ALTER TABLE leads_midnight_ravers ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir INSERT público (formulário da landing page)
CREATE POLICY "Permitir insert público" ON leads_midnight_ravers
  FOR INSERT
  WITH CHECK (true);

-- Criar política para permitir SELECT apenas autenticado (você acessar os dados)
CREATE POLICY "Permitir select autenticado" ON leads_midnight_ravers
  FOR SELECT
  USING (auth.role() = 'authenticated');
```

4. Clique em **"Run"** (ou pressione Ctrl+Enter)
5. Você deve ver: `Success. No rows returned`

### Passo 3: Obter Connection String

1. No menu lateral, clique em **"Settings"** (ícone de engrenagem)
2. Clique em **"Database"**
3. Role até **"Connection string"**
4. Selecione **"URI"** (não Pooler)
5. Copie a connection string, ela será algo como:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
6. **Importante:** Substitua `[YOUR-PASSWORD]` pela senha que você criou no Passo 1

**Exemplo final:**
```
postgresql://postgres:minhasenha123@db.abcdefghijk.supabase.co:5432/postgres
```

---

## 2️⃣ Adaptar o Projeto para PostgreSQL (Supabase)

O projeto atual usa MySQL, mas o Supabase usa PostgreSQL. Vou criar um script de migração.

### Arquivo: `drizzle.config.ts` (atualizado)

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql", // MUDANÇA: mysql -> postgresql
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Arquivo: `drizzle/schema.ts` (atualizado para PostgreSQL)

```typescript
import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";

/**
 * Tabela de usuários (autenticação)
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * Tabela de leads da landing page
 */
export const leadsMiddnightRavers = pgTable("leads_midnight_ravers", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  instagram: varchar("instagram", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Lead = typeof leadsMiddnightRavers.$inferSelect;
export type InsertLead = typeof leadsMiddnightRavers.$inferInsert;
```

### Arquivo: `server/db.ts` (atualizado para PostgreSQL)

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { InsertUser, users, leadsMiddnightRavers, InsertLead } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // PostgreSQL: ON CONFLICT ... DO UPDATE
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ========== LEADS ==========

export async function createLead(lead: InsertLead) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.insert(leadsMiddnightRavers).values(lead);
}

export async function getAllLeads() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(leadsMiddnightRavers).orderBy(leadsMiddnightRavers.createdAt);
}
```

### Instalar Dependência PostgreSQL

Adicione no `package.json`:

```json
{
  "dependencies": {
    "postgres": "^3.4.4"
  }
}
```

Ou rode:
```bash
pnpm add postgres
```

---

## 3️⃣ Deploy na Vercel

### Passo 1: Push do Código no GitHub

```bash
git add .
git commit -m "Configuração final: Google Analytics + Supabase"
git push origin main
```

### Passo 2: Importar Projeto na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New..."** → **"Project"**
3. Selecione o repositório `midnight-ravers-landing`
4. Clique em **"Import"**

### Passo 3: Configurar Variáveis de Ambiente

Na tela de configuração, clique em **"Environment Variables"** e adicione:

#### DATABASE_URL (Supabase)
```
postgresql://postgres:suasenha@db.xxxxx.supabase.co:5432/postgres
```
- **Environments:** Production, Preview, Development

#### JWT_SECRET
```
sua-chave-secreta-super-segura-aqui-12345678901234567890
```
- **Environments:** Production, Preview, Development

#### VITE_APP_TITLE
```
WBG — Midnight Raver$ Landing Page
```
- **Environments:** Production, Preview, Development

#### VITE_APP_LOGO
```
/wbg-logo.png
```
- **Environments:** Production, Preview, Development

### Passo 4: Fazer Deploy

1. Clique em **"Deploy"**
2. Aguarde 2-5 minutos
3. Acesse o site gerado (ex: `midnight-ravers-landing.vercel.app`)

---

## 4️⃣ Verificar se Está Funcionando

1. Acesse o site
2. Clique em "CLICK TO ENTER"
3. Preencha o formulário
4. Verifique no Supabase:
   - Vá em **"Table Editor"**
   - Selecione `leads_midnight_ravers`
   - Veja se o lead apareceu

---

## 5️⃣ Exportar Leads do Supabase

### Opção 1: Via Interface (Simples)

1. No Supabase, vá em **"Table Editor"**
2. Selecione `leads_midnight_ravers`
3. Clique no botão **"..."** (três pontos) no canto superior direito
4. Clique em **"Download as CSV"**

### Opção 2: Via SQL (Avançado)

1. Vá em **"SQL Editor"**
2. Execute:
```sql
SELECT * FROM leads_midnight_ravers ORDER BY created_at DESC;
```
3. Clique em **"Download CSV"**

---

## 📧 Como Enviar os Emails no Dia 29/10

Você tem **3 opções** principais:

### Opção 1: Mailchimp (Recomendado - Mais Fácil)

**Vantagens:**
- Interface visual simples
- Templates prontos
- Gratuito até 500 contatos
- Relatórios de abertura/cliques

**Como fazer:**

1. **Criar conta no Mailchimp** ([mailchimp.com](https://mailchimp.com))

2. **Importar leads:**
   - Exporte os leads do Supabase como CSV
   - No Mailchimp, vá em **"Audience"** → **"Import contacts"**
   - Faça upload do CSV
   - Mapeie os campos: `email`, `full_name`, etc.

3. **Criar campanha:**
   - Clique em **"Create"** → **"Email"**
   - Escolha **"Regular"**
   - Preencha:
     - **To:** Sua lista importada
     - **From:** Seu email (ex: `contato@wbg.com`)
     - **Subject:** `🔑 Sua senha de acesso exclusivo - Midnigth Raver$ | WBG`

4. **Design do email:**

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #000000;
      color: #ffffff;
      padding: 40px;
      text-align: center;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #0a0a0a;
      padding: 40px;
      border: 1px solid #333;
    }
    h1 {
      font-size: 32px;
      letter-spacing: 0.2em;
      margin-bottom: 20px;
    }
    .password {
      font-size: 48px;
      font-weight: bold;
      letter-spacing: 0.3em;
      background-color: #1a1a1a;
      padding: 20px;
      margin: 30px 0;
      border: 2px solid #ffffff;
    }
    .cta {
      display: inline-block;
      background-color: #ffffff;
      color: #000000;
      padding: 15px 40px;
      text-decoration: none;
      font-weight: bold;
      letter-spacing: 0.1em;
      margin-top: 30px;
    }
    .footer {
      margin-top: 40px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="URL_DA_LOGO_VERDE" alt="WBG" width="150" />
    
    <h1>MIDNIGTH RAVER$</h1>
    
    <p style="font-size: 16px; letter-spacing: 0.1em; margin: 20px 0;">
      Você está cadastrado! Aqui está sua senha de acesso exclusivo:
    </p>
    
    <div class="password">
      RAVER2024
    </div>
    
    <p style="font-size: 14px; line-height: 1.6;">
      Use essa senha para acessar a coleção completa com <strong>até 20% de desconto</strong> 
      antes do lançamento oficial no dia <strong>07/11</strong>.
    </p>
    
    <a href="https://seu-site-da-loja.com" class="cta">
      ACESSAR COLEÇÃO AGORA
    </a>
    
    <div class="footer">
      <p>We Believe In Ghosts</p>
      <p>© 2025 WBG. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
```

5. **Agendar envio:**
   - Clique em **"Schedule"**
   - Selecione **29/10/2025** às **00:00** (meia-noite)
   - Confirme

---

### Opção 2: SendGrid (Mais Técnico)

**Vantagens:**
- API poderosa
- Gratuito até 100 emails/dia
- Integração com código

**Como fazer:**

1. **Criar conta no SendGrid** ([sendgrid.com](https://sendgrid.com))

2. **Obter API Key:**
   - Vá em **"Settings"** → **"API Keys"**
   - Clique em **"Create API Key"**
   - Copie a chave

3. **Criar script de envio:**

```javascript
// send-emails.js
const sgMail = require('@sendgrid/mail');
const { createClient } = require('@supabase/supabase-js');

// Configurar SendGrid
sgMail.setApiKey('SUA_API_KEY_AQUI');

// Configurar Supabase
const supabase = createClient(
  'https://xxxxx.supabase.co',
  'sua-anon-key-aqui'
);

async function sendEmails() {
  // Buscar todos os leads
  const { data: leads, error } = await supabase
    .from('leads_midnight_ravers')
    .select('*');

  if (error) {
    console.error('Erro ao buscar leads:', error);
    return;
  }

  // Enviar email para cada lead
  for (const lead of leads) {
    const msg = {
      to: lead.email,
      from: 'contato@wbg.com', // Seu email verificado no SendGrid
      subject: '🔑 Sua senha de acesso exclusivo - Midnigth Raver$ | WBG',
      html: `
        <div style="font-family: Arial; background: #000; color: #fff; padding: 40px; text-align: center;">
          <h1 style="font-size: 32px; letter-spacing: 0.2em;">MIDNIGTH RAVER$</h1>
          <p>Olá ${lead.full_name},</p>
          <p>Sua senha de acesso exclusivo:</p>
          <div style="font-size: 48px; font-weight: bold; background: #1a1a1a; padding: 20px; margin: 30px 0; border: 2px solid #fff;">
            RAVER2024
          </div>
          <p>Acesse agora com até 20% de desconto!</p>
          <a href="https://seu-site.com" style="display: inline-block; background: #fff; color: #000; padding: 15px 40px; text-decoration: none; font-weight: bold; margin-top: 30px;">
            ACESSAR COLEÇÃO
          </a>
          <p style="margin-top: 40px; font-size: 12px; color: #666;">We Believe In Ghosts</p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`Email enviado para ${lead.email}`);
    } catch (error) {
      console.error(`Erro ao enviar para ${lead.email}:`, error);
    }
  }
}

sendEmails();
```

4. **Rodar no dia 29:**
```bash
node send-emails.js
```

---

### Opção 3: Gmail + Google Sheets (Mais Manual)

**Vantagens:**
- Gratuito
- Não precisa de ferramentas externas

**Como fazer:**

1. Exporte os leads do Supabase como CSV
2. Importe no Google Sheets
3. Use a extensão **"Yet Another Mail Merge"** (YAMM)
4. Configure o template do email
5. Agende o envio para 29/10

---

## 🎯 Recomendação Final

**Para você:** Use o **Mailchimp** (Opção 1)

**Por quê:**
- ✅ Interface visual fácil
- ✅ Não precisa programar
- ✅ Agendamento automático
- ✅ Relatórios de abertura
- ✅ Gratuito até 500 contatos

---

## 📊 Checklist Final

- [ ] Projeto criado no Supabase
- [ ] Tabela `leads_midnight_ravers` criada
- [ ] Connection string copiada
- [ ] Código adaptado para PostgreSQL
- [ ] Push no GitHub
- [ ] Deploy na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Site testado e funcionando
- [ ] Formulário capturando leads no Supabase
- [ ] Google Analytics rastreando visitas
- [ ] Conta no Mailchimp criada
- [ ] Template de email preparado
- [ ] Envio agendado para 29/10

---

**Boa sorte com o lançamento! 🚀**

**We Believe In Ghosts.** 🌑

