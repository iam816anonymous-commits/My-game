# Deployment Documentation

## 1. Local Development
```bash
npm install
npm run dev
```

## 2. Production Build
```bash
npm run build
```
This generates an optimized static bundle in the `dist/` directory.

## 3. PWA Configuration
The game is configured as a Progressive Web App via `vite-plugin-pwa`. It includes:
- Offline asset caching.
- Manifest for home screen installation.
- Auto-update functionality.

## 4. CI/CD Requirements
- Node.js v18+ environment.
- Assets must be served via HTTPS for PWA and IndexedDB support.
