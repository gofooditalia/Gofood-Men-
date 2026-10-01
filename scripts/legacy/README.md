# Script legacy

Script e dati usati una sola volta durante lo sviluppo, conservati come riferimento. Non fanno parte dell'app.

| File | Cosa era |
|---|---|
| `generate_migration.js` + `menu_data.json` | Generava `menu_migration.sql` dal vecchio menu JSON di Magna Roma |
| `menu_migration.sql` | Import del menu Magna Roma nel database |
| `belle_epoque_menu.sql` | Import del menu Belle Epoque Palermo |
| `seed_shifts.js` | Creava i turni di prenotazione di Magna Roma (sostituito dalla migrazione `034_seed_shifts_magnaroma.sql`) |
| `debug_shifts.js` | Debug dei turni di prenotazione |

Gli script `*_shifts.js` leggono `.env` dalla cartella in cui vengono lanciati: eseguirli dalla radice del progetto, ad esempio `node scripts/legacy/debug_shifts.js`.
