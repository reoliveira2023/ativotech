# 🖥️ AtivoTech — Deploy na Railway

SaaS de gestão de ativos de TI — guia completo de deploy na Railway.

---

## 🏗️ Arquitetura no Railway

```
Railway Project: ativotech
├── 🐘 PostgreSQL        (banco gerenciado)
├── ⚙️  ativotech-backend  (NestJS API)
└── 🌐 ativotech-frontend (Next.js)
```

---

## 🚀 Passo a Passo — Deploy na Railway

### 1. Crie uma conta na Railway
Acesse [railway.app](https://railway.app) e faça login com GitHub.

---

### 2. Crie um novo projeto

- Clique em **"New Project"**
- Escolha **"Empty Project"**

---

### 3. Adicione o PostgreSQL

- Clique em **"+ New"** → **"Database"** → **"Add PostgreSQL"**
- Aguarde o banco subir
- Clique no banco → aba **"Variables"**
- Copie o valor de **`DATABASE_URL`** (vai usar no backend)

---

### 4. Deploy do Backend

#### 4a. Adicione o serviço
- Clique em **"+ New"** → **"GitHub Repo"**
- Selecione o repositório `ativotech`
- Railway vai detectar a pasta `backend/` — se não detectar, configure:
  - **Root Directory:** `backend`

#### 4b. Configure as variáveis de ambiente do Backend
Vá em **Variables** do serviço backend e adicione:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | Cole o valor copiado do PostgreSQL |
| `JWT_SECRET` | `uma_string_longa_e_aleatoria_minimo_32_chars` |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `OPENAI_API_KEY` | `sk-...` (opcional, para IA com GPT-4) |

> ⚠️ **NÃO** defina `PORT` — o Railway injeta automaticamente.

#### 4c. Configure o Build do Backend
Em **Settings** do serviço backend:
- **Root Directory:** `backend`
- **Build Command:** `npm install && npx prisma generate && npm run build`
- **Start Command:** `npx prisma migrate deploy && (npx ts-node prisma/seed.ts || true) && node dist/main`

#### 4d. Obtenha a URL do Backend
Após o deploy, vá em **Settings** → **Networking** → **Generate Domain**
Anote a URL (ex: `https://ativotech-backend.up.railway.app`)

---

### 5. Deploy do Frontend

#### 5a. Adicione o serviço
- Clique em **"+ New"** → **"GitHub Repo"**
- Selecione o mesmo repositório `ativotech`
- Configure:
  - **Root Directory:** `frontend`

#### 5b. Configure as variáveis de ambiente do Frontend
Vá em **Variables** do serviço frontend e adicione:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL do backend (ex: `https://ativotech-backend.up.railway.app`) |

> ⚠️ **NÃO** defina `PORT` — o Railway injeta automaticamente.

#### 5c. Configure o Build do Frontend
Em **Settings** do serviço frontend:
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start`

#### 5d. Gere o domínio do Frontend
Em **Settings** → **Networking** → **Generate Domain**

---

### 6. ✅ Pronto!

Acesse o domínio do frontend e faça login:
- **Email:** admin@demo.com
- **Senha:** demo123

---

## 📋 Checklist de Variáveis

### Backend (serviço `ativotech-backend`)
- [ ] `DATABASE_URL` — URL do PostgreSQL do Railway
- [ ] `JWT_SECRET` — string aleatória longa (min. 32 chars)
- [ ] `JWT_EXPIRES_IN` — ex: `7d`
- [ ] `NODE_ENV` — `production`
- [ ] `OPENAI_API_KEY` — opcional, para GPT-4

### Frontend (serviço `ativotech-frontend`)
- [ ] `NEXT_PUBLIC_API_URL` — URL pública do backend

### Não defina manualmente
- ❌ `PORT` — Railway injeta automaticamente em ambos os serviços

---

## ⚙️ Comandos de Build e Start

### Backend
```bash
# Build
npm install && npx prisma generate && npm run build

# Start (produção)
npx prisma migrate deploy && node dist/main
```

### Frontend
```bash
# Build
npm install && npm run build

# Start (produção)
npm run start
```

---

## 🔧 Testar localmente antes do deploy

```bash
# Backend (na pasta /backend)
cp .env.example .env
# Edite .env com seu DATABASE_URL local
npm install
npx prisma migrate dev
npx ts-node prisma/seed.ts
npm run build
npm run start:prod

# Frontend (na pasta /frontend)
cp .env.example .env
# Edite NEXT_PUBLIC_API_URL=http://localhost:3001
npm install
npm run build
npm run start
```

---

## 🐛 Troubleshooting

### Backend não sobe
- Verifique se `DATABASE_URL` está correta
- Verifique se `JWT_SECRET` está definido
- Veja os logs em Railway → serviço → aba **Logs**

### Frontend não conecta ao backend
- Verifique se `NEXT_PUBLIC_API_URL` aponta para a URL correta do backend
- Certifique-se de que a URL **não tem barra no final**: ✅ `https://...railway.app` ❌ `https://...railway.app/`
- Verifique se o backend está rodando (acesse a URL do backend diretamente)

### Erro de CORS
- O backend está configurado com `origin: true` (aceita qualquer origem)
- Se quiser restringir, edite `main.ts` e restrinja para o domínio do frontend

### Seed não rodou (sem dados demo)
Execute manualmente via Railway CLI:
```bash
railway run --service ativotech-backend npx ts-node prisma/seed.ts
```

---

## 📁 Estrutura do Projeto

```
ativotech/
├── backend/
│   ├── railway.json        ← configuração Railway
│   ├── nixpacks.toml       ← build pipeline
│   ├── package.json        ← scripts de build/start
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── main.ts         ← PORT dinâmica (process.env.PORT)
│       └── modules/
│
├── frontend/
│   ├── railway.json        ← configuração Railway
│   ├── nixpacks.toml       ← build pipeline
│   ├── next.config.js      ← output standalone
│   ├── package.json        ← start com PORT dinâmica
│   └── src/
│       └── lib/api.ts      ← usa NEXT_PUBLIC_API_URL
│
└── README.md               ← este guia
```

---

## 🔐 Segurança em Produção

1. **JWT_SECRET**: Use uma string com 64+ caracteres aleatórios. Gere com:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **CORS**: Após o deploy, restrinja o CORS no `main.ts`:
   ```typescript
   cors: {
     origin: ['https://seu-frontend.up.railway.app'],
     credentials: true,
   }
   ```

3. **Banco de dados**: O Railway gerencia backups automáticos no plano Pro.

---

Desenvolvido para Railway. Pronto para produção! 🚀
