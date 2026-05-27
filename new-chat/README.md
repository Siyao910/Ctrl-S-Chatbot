# Ctrl+S (Save Earth)

An English-language interactive educational website inspired by SDG Target 12.5: reduce waste generation through prevention, reduction, recycling, and reuse.

## Features

- AI Recycling Chatbot demonstration with curated guidance for common waste items
- Three learning modules about reduction, recycling, and special waste
- Waste Sorting Challenge mini game with eight items and scoring
- Achievement badge collection and action checklist
- Persistent progress using browser `localStorage`
- Responsive design for desktop and mobile screens

## Run Locally

Open `index.html` directly in a browser, or start a local static server:

```powershell
python -m http.server 4173
```

Then visit `http://localhost:4173`.

## API Note

No API is required for the current demonstration. The chatbot uses an offline curated knowledge base so it is fast, safe, and suitable for presentation.

To support unrestricted generative answers in a future version, connect the chat interface to a server-side AI endpoint. An API key must never be exposed directly in browser JavaScript.
