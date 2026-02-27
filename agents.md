# Agents Notes

## Project overview
- Stack: Vite + React + TypeScript (client-side only).
- Router: TanStack Router.
- Hosting target: GitHub Pages from the `docs/` folder on `main`.
- App goal: interactive workshop for ESP32 thermistor -> MQTT -> Home Assistant.

## Dev conventions and standards
- Use TypeScript for all app code (`.tsx`/`.ts`).
- Keep pages separated in `src/pages` and shared UI in `src/components`.
- Keep app-wide shell/layout in `src/AppShell.tsx`.
- Prefer explicit, readable constants for workshop snippets and step content.
- Preserve existing visual style and accessibility basics (`aria-label`, keyboard-friendly controls).
- Run checks before publishing:
  - `npx tsc --noEmit`
  - `npm run build`

## Publishing to GitHub Pages
This repo does **manual** Pages publishing from `main/docs`. Always build and sync before pushing.

1. Build production assets:
   - `npm run build`
2. Refresh `docs/` from `dist/` (delete stale hashed bundles):
   - `rsync -a --delete dist/ docs/`
3. Verify `docs/.nojekyll` exists so Pages serves assets without Jekyll processing:
   - `touch docs/.nojekyll`
4. Commit and push:
   - `git add -A`
   - `git commit -m "Update tutorial site"`
   - `git push origin main`
5. Verify site:
   - `https://alex-zissis.github.io/smart-home-thermistor-tutorial/`

## Quick troubleshooting
- If route shows `Not Found` on Pages, confirm router `basepath` handling in `src/main.tsx`.
- If stale JS/CSS loads, re-run `rsync -a --delete dist/ docs/` and push again.
