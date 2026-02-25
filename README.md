# zerOxine – evolution in progress ⚡

![zerOxine maintenance screen](preview.png) <!-- you can add a screenshot later -->

**zerOxine** is a futuristic maintenance landing page that doubles as a Progressive Web App (PWA). While the core platform undergoes a “quantum infrastructure upgrade”, visitors can still access essential knowledge resources (PDF sheets) and install the page as a standalone application for quick future access.

This repository contains the complete front‑end code – a single `index.html` with embedded CSS/JS, a PWA manifest, and a custom install button that follows the best practices for modern web app installation.

---

## ✨ Features

- **Glitch‑art maintenance header** – reflects the “evolution in progress” mood with animated glitch effects.
- **Resource nexus** – downloadable PDF cards (Physics, Mathematics, Chemistry, Biology) with interactive hover effects and metadata.
- **Team section** – always‑colorful profile images (no grayscale filter, as requested) with glowing animated frames.
- **PWA ready**:
  - Web app manifest (`manifest.json`) with theme colours and icons.
  - Custom install button that appears when the site becomes installable.
  - `beforeinstallprompt` event handling – no intrusive browser infobar, only the polished button.
  - Full standalone mode: when installed, the app opens without browser chrome.
- **Fully responsive** – looks sharp on mobile, tablet, and desktop.
- **Placeholder link handling** – non-functional preview buttons give visual feedback when clicked.

---

## 📁 Project Structure
