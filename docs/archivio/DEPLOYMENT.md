# 🚀 Guida al Deploy

## Deploy su Vercel (Consigliato)

Vercel è la piattaforma ottimale per Next.js, creata dagli stessi sviluppatori del framework.

### Setup

1. **Crea un account su Vercel**
   - Vai su [vercel.com](https://vercel.com)
   - Registrati con GitHub, GitLab o email

2. **Collega il repository**
   ```bash
   # Inizializza Git (se non fatto)
   git init
   git add .
   git commit -m "Initial commit - Magna Roma Menu"
   
   # Crea repository su GitHub e collegalo
   git remote add origin [URL_TUO_REPO]
   git push -u origin main
   ```

3. **Deploy da Vercel Dashboard**
   - Clicca "New Project" su Vercel
   - Importa il repository GitHub
   - Vercel rileverà automaticamente Next.js
   - Clicca "Deploy"

### Deploy da CLI

```bash
# Installa Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy in produzione
vercel --prod
```

### Configurazione Dominio Personalizzato

1. Vai su Project Settings → Domains
2. Aggiungi il tuo dominio (es: menu.magnaromatrattoria.com)
3. Configura i DNS secondo le istruzioni

## Deploy su Netlify

```bash
# Installa Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy in produzione
netlify deploy --prod
```

## Deploy su Railway

1. Vai su [railway.app](https://railway.app)
2. Crea nuovo progetto da GitHub
3. Seleziona il repository
4. Railway configura tutto automaticamente

## Variabili d'Ambiente (se necessarie)

Crea file `.env.local` per variabili locali:

```bash
# Esempio
NEXT_PUBLIC_SITE_URL=https://tuo-dominio.com
```

Per produzione, aggiungi le variabili nella dashboard del provider.

## Generazione QR Code

Dopo il deploy:

1. **Ottieni URL produzione** (es: `https://magnaroma-menu.vercel.app`)

2. **Genera QR Code**:
   - [QR Code Generator](https://www.qr-code-generator.com/)
   - [QRCode Monkey](https://www.qrcode-monkey.com/)

3. **Personalizza il QR**:
   - Colori: Usa #8B0000 (rosso Roma) e #D4AF37 (oro)
   - Logo: Aggiungi logo Magna Roma al centro
   - Formato: PNG o SVG ad alta risoluzione

4. **Stampa**:
   - Dimensione minima: 5x5 cm
   - Posiziona sui tavoli o su supporti eleganti

### Template QR Code per Stampa

Suggerimenti per il design:

```
┌─────────────────────┐
│                     │
│    [QR CODE]        │
│                     │
│  Magna Roma         │
│  Trattoria          │
│                     │
│  Scannerizza per    │
│  vedere il menu     │
│                     │
└─────────────────────┘
```

## Performance Check

Dopo il deploy, verifica:

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

Target:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 95+

## Monitoraggio

### Vercel Analytics (Gratis)

Abilita analytics in:
- Vercel Dashboard → Project → Analytics

### Google Analytics (Opzionale)

Aggiungi in `layout.tsx`:

```typescript
// Installa: npm install @next/third-parties
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  )
}
```

## Backup e Aggiornamenti

### Backup Menu

Mantieni backup del file `menu.json`:

```bash
# Crea backup
cp src/data/menu.json src/data/menu.backup.json

# Versiona con Git
git add src/data/menu.json
git commit -m "Update: aggiunti nuovi piatti"
git push
```

### Aggiornamenti Rapidi

Per modifiche rapide al menu:

1. Modifica `menu.json` localmente
2. Testa con `npm run dev`
3. Commit e push
4. Vercel/Netlify deploiano automaticamente

## Troubleshooting

### Build Fallito

```bash
# Verifica errori localmente
npm run build

# Se ok, ma fallisce online:
# - Verifica Node version (18+)
# - Controlla logs in dashboard provider
```

### Immagini Non Caricate

- Verifica path corretti in `menu.json`
- Controlla che file esistano in `/public/images/dishes/`
- Usa format supportati: JPG, PNG, WebP, SVG

### Performance Lenta

- Ottimizza immagini (max 1200px width)
- Usa WebP invece di JPG/PNG
- Verifica su [PageSpeed](https://pagespeed.web.dev/)

## Costi

- **Vercel**: Gratis per hobby (consigliato per questo progetto)
- **Netlify**: Gratis per progetti personali
- **Railway**: Gratis con limiti, poi $5/mese
- **Dominio**: €10-20/anno

## Best Practices

1. **Testing pre-deploy**:
   ```bash
   npm run build
   npm start
   ```

2. **Ottimizzazione immagini**:
   - Comprimi con [TinyPNG](https://tinypng.com/)
   - Converti in WebP

3. **Cache**:
   - Next.js gestisce cache automaticamente
   - Vercel/Netlify hanno CDN globale

4. **Sicurezza**:
   - Nessun dato sensibile (menu è pubblico)
   - HTTPS automatico con tutti i provider

---

**Ready to go live! 🚀**

