# Go!Food Menù

Piattaforma SaaS per creare e pubblicare il menu digitale di un ristorante, consultabile dai clienti tramite QR code.

Ogni ristorante ha la propria area di gestione e il proprio menu pubblico su `gofoodmenu.it/<slug>`.

- **Sito**: [gofoodmenu.it](https://gofoodmenu.it)
- **Prodotto di**: Go!Food di Giorgio Di Martino, Palermo

## Funzionalità

**Menu pubblico (cliente al tavolo)**
- Menu mobile-first con foto grandi dei piatti, navigazione per categorie
- 7 lingue: italiano, inglese, spagnolo, francese, tedesco, arabo, cinese
- Allergeni per piatto con pagina dedicata conforme al Reg. UE 1169/2011
- Filtro senza glutine
- Pagina di prenotazione online (`/prenota/<slug>`)

**Area ristoratore (`/dashboard`)**
- Gestione categorie, piatti e libreria foto
- Rilevamento allergeni e analisi del menu assistiti da AI
- Design Studio per personalizzare tema e colori del menu
- Prenotazioni con turni e notifiche email
- Esportazione del menu in PDF e QR code
- Abbonamento e fatturazione tramite Stripe
- Assistenza integrata (form di supporto e chat)

**Accesso**: registrazione, login, recupero password e wizard di onboarding.

## Stack

| Area | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS, Radix UI, Framer Motion |
| Database e auth | Supabase (Postgres, Auth, Storage), Prisma |
| Pagamenti | Stripe (checkout, portale clienti, webhook) |
| Email | Resend + React Email |
| AI | OpenRouter |
| Anti-spam | Google reCAPTCHA |

## Avvio in locale

```bash
npm install          # esegue anche prisma generate
npm run dev          # http://localhost:3000
```

Crea un file `.env.local` con queste variabili:

| Variabile | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Operazioni server-side su Supabase |
| `DATABASE_URL` | Connessione Prisma al database |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID` | Abbonamenti |
| `RESEND_API_KEY` | Invio email |
| `OPENROUTER_API_KEY` | Funzioni AI |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY` | reCAPTCHA |

## Script

| Comando | Cosa fa |
|---|---|
| `npm run dev` | Server di sviluppo (Turbopack) |
| `npm run build` | `prisma generate` + build di produzione |
| `npm start` | Avvia la build di produzione |
| `npm run lint` | ESLint |
| `npm run supabase:setup` | Applica le migrazioni in `supabase/migrations` |

## Struttura

```
gofoodmenu/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing commerciale
│   │   ├── [slug]/               # Menu pubblico del ristorante (+ /allergeni)
│   │   ├── prenota/[slug]/       # Prenotazione online
│   │   ├── dashboard/            # Area ristoratore
│   │   ├── onboarding/           # Wizard primo accesso
│   │   ├── api/                  # AI, Stripe, supporto, reCAPTCHA
│   │   └── auth/                 # Callback Supabase Auth
│   ├── components/               # UI, dashboard, email, prenotazioni, tema
│   ├── lib/                      # Supabase, Stripe, Prisma, theme engine
│   └── types/
├── supabase/migrations/          # Schema e migrazioni SQL
├── prisma/schema.prisma
└── docs/                         # Guide di setup e archivio storico
```

## Documentazione

- [Setup Supabase](docs/setup-supabase.md)
- [Setup Stripe](docs/setup-stripe.md)
- [Changelog](CHANGELOG.md)
- [Archivio](docs/archivio/): documenti della prima versione del progetto, nato come menu digitale per Magna Roma Trattoria

## Deploy

Il progetto è pensato per Vercel (Next.js, nessuna configurazione aggiuntiva nel repo). Le variabili d'ambiente vanno configurate anche nel progetto Vercel, e l'endpoint `/api/stripe/webhook` va registrato nella dashboard Stripe.

## Licenza

Il codice è distribuito con licenza MIT (vedi [LICENSE](LICENSE)). Il nome **Go!Food Menù**, il marchio **Go!Food**, il logo e gli asset grafici non sono coperti dalla licenza e restano riservati.

## Contatti

[help@gofoodmenu.it](mailto:help@gofoodmenu.it)
