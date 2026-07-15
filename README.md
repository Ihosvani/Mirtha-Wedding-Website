# Mirtha & Andres — Wedding Website

A beautiful, bilingual (English / Spanish) single-page wedding website for  
**Mirtha America Noa Zambrano** and **Andres Alfonso**.

**Features**
- Elegant design — Ivory, Gold, Sage Green, Dark Wood colour palette
- Full-screen hero with your background photo
- Event details (date, time, venue)
- 📍 Google Maps button
- 🗓 Add-to-Calendar (Google Calendar + .ics download for Apple/Outlook)
- ✉ RSVP form with guest-name autocomplete and data stored via Formspree
- 🌐 One-click EN ⇄ ES language toggle

---

## Quick-start checklist

### 1 — Add the background image
Drop your photo into the `images/` folder as **`bg.jpg`**.

### 2 — Set the wedding date
Open `script.js` and update the `WEDDING_CONFIG` block near the top:

```js
const WEDDING_CONFIG = {
  date:        "2025-12-20",        // ← ISO format YYYY-MM-DD
  dateLabelEN: "December 20, 2025", // ← English display label
  dateLabelES: "20 de diciembre de 2025", // ← Spanish display label
  ...
};
```

### 3 — Set up Formspree (RSVP data storage)
Formspree is a free service that emails you every RSVP submission and stores
responses in an online dashboard — no backend required.

1. Go to <https://formspree.io> and create a free account.
2. Create a new form; copy your **Form ID** (looks like `xpwzabcd`).
3. Open `index.html`, search for `YOUR_FORM_ID`, and replace it:

```html
<form ... action="https://formspree.io/f/xpwzabcd" ...>
```

That's it! Every confirmed RSVP will appear in your Formspree dashboard and
be forwarded to your email.

### 4 — Replace the guest list
Open `guests.json` and replace the placeholder entries with the real list:

```json
[
  { "id": 1, "first": "Ana",    "last": "García" },
  { "id": 2, "first": "Carlos", "last": "Martínez" }
]
```

The RSVP form autocomplete reads from this file.

### 5 — Publish on GitHub Pages
1. Go to your repository **Settings → Pages**.
2. Under *Source*, choose `Deploy from a branch`.
3. Select `main` (or `master`) branch, root `/` folder.
4. Click **Save** — your site will be live at  
   `https://<your-username>.github.io/<repo-name>/`

---

## File structure

```
├── index.html      ← Single-page site
├── styles.css      ← All styles
├── script.js       ← Language toggle, calendar, RSVP logic
├── guests.json     ← Guest list for autocomplete
└── images/
    └── bg.jpg      ← Your background photo (add this!)
```

---

*Made with ♥ for Mirtha & Andres*
