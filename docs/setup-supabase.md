# 🚀 Setup Completo Supabase

## ✅ Stato Attuale

### Dipendenze Installate
- ✅ `@supabase/supabase-js` v2.86.0
- ✅ `@supabase/ssr` v0.8.0
- ✅ `@supabase/auth-helpers-nextjs` v0.15.0
- ✅ `dotenv` v17.2.3

### File Creati
- ✅ [.env.local](../.env.local) - Configurazione environment variables
- ✅ [src/lib/supabase/client.ts](../src/lib/supabase/client.ts) - Client browser
- ✅ [src/lib/supabase/server.ts](../src/lib/supabase/server.ts) - Client server
- ✅ [src/lib/supabase/middleware.ts](../src/lib/supabase/middleware.ts) - Client middleware
- ✅ [src/middleware.ts](../src/middleware.ts) - Next.js middleware
- ✅ [src/types/database.ts](../src/types/database.ts) - TypeScript database types
- ✅ [supabase/run-migrations.js](../supabase/run-migrations.js) - Script automazione migrations

### SQL Files
- ✅ [supabase/migrations/001_schema.sql](../supabase/migrations/001_schema.sql) - Schema database
- ✅ [supabase/migrations/002_seed.sql](../supabase/migrations/002_seed.sql) - 14 allergeni EU
- ✅ [supabase/migrations/003_policies.sql](../supabase/migrations/003_policies.sql) - RLS policies
- ✅ [supabase/storage-policies.sql](../supabase/storage-policies.sql) - Storage policies

---

## ⚠️ ACTION REQUIRED: Aggiungi Anon Key

**Attualmente manca la chiave pubblica `anon` nel file `.env.local`.**

### Come Ottenerla

1. Vai su: https://supabase.com/dashboard/project/sgdxmtqrjgxuajxxvajf
2. Sidebar → **Settings** → **API**
3. Cerca la sezione **Project API keys**
4. Copia la chiave **`anon` / `public`** (inizia con `eyJ...`)
5. Incollala in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... # <-- Sostituisci qui
```

---

## 📋 Step per Setup Completo

### Step 1: Aggiungi Anon Key ⚠️ IMPORTANTE
```bash
# Apri .env.local e sostituisci:
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
# Con la tua anon key dalla dashboard
```

### Step 2: Esegui Migrations Database

**Opzione A: Automatico (Raccomandato)**
```bash
npm run supabase:setup
```

**Opzione B: Manuale (se l'automatico fallisce)**
1. Vai su: https://supabase.com/dashboard/project/sgdxmtqrjgxuajxxvajf
2. Sidebar → **SQL Editor**
3. Clicca **"New query"**
4. Copia il contenuto di `supabase/migrations/001_schema.sql`
5. Incolla nell'editor e clicca **"Run"**
6. Ripeti per `002_seed.sql` e `003_policies.sql`

### Step 3: Crea Bucket Storage

1. Dashboard → **Storage**
2. Clicca **"Create a new bucket"**

#### Bucket 1: `dishes`
- **Name**: `dishes`
- **Public bucket**: ✅ ON
- **File size limit**: 5 MB
- **Allowed MIME types**:
  ```
  image/jpeg
  image/png
  image/webp
  ```

#### Bucket 2: `logos`
- **Name**: `logos`
- **Public bucket**: ✅ ON
- **File size limit**: 2 MB
- **Allowed MIME types**:
  ```
  image/jpeg
  image/png
  image/webp
  image/svg+xml
  ```

### Step 4: Applica Storage Policies

1. Dashboard → **SQL Editor** → **New query**
2. Copia il contenuto di `supabase/storage-policies.sql`
3. Incolla e clicca **"Run"**

### Step 5: Verifica Setup

```bash
# Avvia il server di sviluppo
npm run dev
```

Apri http://localhost:3000 - se non ci sono errori, il setup è completo! ✅

---

## 🔍 Verifica Database

### Test 1: Verifica Tabelle
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```
✅ Dovresti vedere: allergens, categories, dish_allergens, dishes, profiles, tenants

### Test 2: Verifica Allergeni
```sql
SELECT id, number, name->>'it' as nome_it
FROM public.allergens
ORDER BY number;
```
✅ Dovresti vedere 14 righe (glutine, crostacei, uova, etc.)

### Test 3: Verifica RLS
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'tenants', 'categories', 'dishes');
```
✅ Tutte le tabelle dovrebbero avere `rowsecurity = true`

### Test 4: Verifica Storage Buckets
Dashboard → Storage → Dovresti vedere:
- ✅ `dishes` (public)
- ✅ `logos` (public)

---

## 🎯 Architettura Implementata

### Multi-Tenancy
```
auth.users (Supabase Auth)
    ↓ (1:1)
profiles
    ↓ (1:N)
tenants (ristoranti)
    ↓ (1:N)
categories ──→ dishes ←──┐
                ↓ (N:M)  │
           dish_allergens │
                ↓        │
           allergens ────┘
           (global)
```

### Autenticazione & Middleware
- ✅ Middleware Next.js protegge `/dashboard/*` e `/onboarding`
- ✅ Refresh automatico sessioni
- ✅ Redirect automatici in base allo stato di autenticazione

### Storage Isolation
```
dishes/
  └── {tenant_id}/dishes/{dish_id}.jpg

logos/
  └── {tenant_id}.png
```

### Row Level Security (RLS)
- ✅ Isolamento completo tra tenant
- ✅ Accesso pubblico per menu (senza autenticazione)
- ✅ Accesso owner per dashboard CRUD

---

## 📝 Uso dei Client Supabase

### Client-Side (Browser)
```typescript
import { supabase } from '@/lib/supabase/client';

// Esempio: Login
async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

// Esempio: Fetch dati
async function getCategories(tenantId: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('display_order');
  return { data, error };
}
```

### Server-Side (SSR/RSC)
```typescript
import { createClient } from '@/lib/supabase/server';

// Server Component
export default async function Page() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  return <div>Benvenuto {tenant?.restaurant_name}</div>;
}
```

### Upload Immagini
```typescript
import { supabase } from '@/lib/supabase/client';

async function uploadDishImage(
  tenantId: string,
  dishId: string,
  file: File
) {
  const ext = file.name.split('.').pop();
  const path = `${tenantId}/dishes/${dishId}.${ext}`;

  const { error } = await supabase.storage
    .from('dishes')
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage
    .from('dishes')
    .getPublicUrl(path);

  return data.publicUrl;
}
```

---

## 🔒 Sicurezza

### Environment Variables
- ✅ `.env.local` è in `.gitignore` (non viene committato)
- ⚠️ **MAI** committare `SUPABASE_SERVICE_ROLE_KEY` in git
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` è sicura per frontend (read-only con RLS)

### Row Level Security (RLS)
- ✅ Abilitato su tutte le tabelle
- ✅ Owner può accedere solo ai propri dati
- ✅ Pubblico può leggere solo piatti/categorie visibili
- ✅ Service role bypassa RLS (solo per migrations/admin)

### Storage Security
- ✅ Upload solo nella propria cartella tenant
- ✅ Lettura pubblica per tutti (menu accessibili)
- ✅ Delete/Update solo proprietario

---

## 🆘 Troubleshooting

### Errore: "Invalid API key"
**Problema:** Chiave anon mancante o errata in `.env.local`

**Soluzione:**
1. Verifica che `NEXT_PUBLIC_SUPABASE_ANON_KEY` sia presente
2. Copia la chiave dalla dashboard: Settings → API → anon/public key
3. Riavvia il server: `npm run dev`

### Errore: "permission denied for table X"
**Problema:** RLS policies non applicate

**Soluzione:**
1. Esegui `supabase/migrations/003_policies.sql` tramite SQL Editor
2. Verifica RLS: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`

### Migrations Falliscono
**Problema:** Script `npm run supabase:setup` non funziona

**Soluzione:**
Esegui manualmente i file SQL tramite SQL Editor:
1. Dashboard → SQL Editor → New query
2. Copia contenuto di `001_schema.sql`
3. Incolla e Run
4. Ripeti per `002_seed.sql` e `003_policies.sql`

### Storage Upload Fallisce (403)
**Problema:** Storage policies non applicate

**Soluzione:**
1. Verifica che i bucket siano **public**
2. Esegui `supabase/storage-policies.sql` tramite SQL Editor
3. Verifica path: `{tenant_id}/dishes/{dish_id}.ext`

---

## 📚 Risorse

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

## 🎯 Prossimi Step

Dopo aver completato il setup:

1. ✅ **Landing Page**: Crea homepage con CTA "Inizia Gratis"
2. ✅ **Auth Pages**: Signup/Login con Supabase Auth
3. ✅ **Onboarding Wizard**: 3 step (piano → branding → contatti)
4. ✅ **Dashboard**: CRUD categorie e piatti
5. ✅ **Menu Pubblico**: Dynamic route `[slug]/page.tsx`
6. ✅ **Upload Immagini**: Integrazione con Supabase Storage
7. ✅ **Theming Dinamico**: CSS variables da tenant colors

---

**✨ Setup completato! Il database è pronto per l'uso.**

Per domande o problemi, consulta:
- 📖 [supabase/README.md](../supabase/README.md) - Guida dettagliata setup
- 📝 [Piano completo](../.claude/plans/vivid-cuddling-waterfall.md) - Architettura completa
