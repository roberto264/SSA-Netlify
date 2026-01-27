# Swiss Solar Academy - Mit Login & Datenbank

## Setup Anleitung

### 1. Supabase Datenbank einrichten

1. Gehe zu deinem Supabase Projekt: https://supabase.com/dashboard/project/iyuxooqzreodwenonniz
2. Klick auf **"SQL Editor"** (links)
3. Klick **"New Query"**
4. Öffne die Datei `supabase-schema.sql` und kopiere den gesamten Inhalt
5. Füge ihn ein und klick **"Run"**

### 2. Supabase Auth aktivieren

1. Gehe zu **"Authentication"** → **"Providers"**
2. Stelle sicher, dass **"Email"** aktiviert ist
3. Optional: Deaktiviere "Confirm email" für einfacheres Testen unter **"Authentication"** → **"Settings"**

### 3. Environment Variables in Netlify

Füge diese zwei Variables hinzu (Site settings → Environment variables):

- `VITE_SUPABASE_URL` = `https://iyuxooqzreodwenonniz.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `sb_publishable_0aVb5jLTvJPOElWSJjccsQ_dP_UPeMy`
- `OPENAI_API_KEY` = dein OpenAI Key (hast du schon)

### 4. Deploy

Push zu GitHub → Netlify baut automatisch neu.

---

## Features

### Für Lernende:
- Login/Registrierung
- Persönlicher Fortschritt wird gespeichert
- Quiz-Ergebnisse werden gespeichert
- Rollenspiel-Sessions werden gespeichert

### Für Arbeitgeber:
- Übersicht aller Mitarbeiter der eigenen Firma
- Fortschritt und Quiz-Ergebnisse einsehen

### Für Betreiber (Admin):
- Alle Lernenden sehen
- Detailliertes Profil mit Soft Skills
- Filter nach Firma

---

## Benutzer-Rollen

Neue Benutzer werden automatisch als "lernender" angelegt.

Um einen Benutzer zum Admin zu machen:
1. Gehe zu Supabase → **"Table Editor"** → **"profiles"**
2. Finde den Benutzer
3. Ändere `role` zu `betreiber` oder `arbeitgeber`

---

## Struktur

```
src/
├── lib/
│   ├── supabase.js      # Supabase Client
│   ├── AuthContext.jsx  # Login State
│   └── database.js      # Datenbank Hooks
├── components/
│   └── AuthPage.jsx     # Login/Register
├── modules/             # Kursmodule
├── personas/            # AI Kunden
└── App.jsx              # Hauptapp
```
