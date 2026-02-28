# Agents Notes

## Project overview
- Stack: Vite + React + TypeScript (client-side only).
- Router: TanStack Router.
- Hosting target: GitHub Pages via GitHub Actions artifact deploy (`.github/workflows/deploy-pages.yml`).
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
This repo uses **automated** Pages deploy from GitHub Actions. Do not commit `docs/`.

1. Build and validate locally before push:
   - `npx tsc --noEmit`
   - `npm run build`
2. Commit source changes only (never generated `dist`/`docs`):
   - `git add -A`
   - `git commit -m "Update tutorial site"`
   - `git push origin main`
3. GitHub Actions runs build + deploy automatically.
4. Verify site:
   - `https://alex-zissis.github.io/smart-home-thermistor-tutorial/`

## Quick troubleshooting
- If route shows `Not Found` on Pages, confirm router `basepath` handling in `src/main.tsx`.
- If deploy does not run, check repo `Settings -> Pages` and set source to `GitHub Actions`.
