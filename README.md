# ESP32 Thermistor Smart Home Tutorial (Vite + React)

Interactive client-side tutorial for building a Freenove Section 12 thermistor sensor and integrating it with Home Assistant over MQTT.

Live site: https://alex-zissis.github.io/smart-home-thermistor-tutorial/

## Run locally

```bash
cd tutorial-web
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

Build output is in `tutorial-web/dist` and can be deployed to static hosting.

## Pages hosting notes

- `vite.config.js` uses `base: './'` so the app can be served from a subpath.
- GitHub Pages deploy is handled by `.github/workflows/deploy-pages.yml` on push to `main`.
- Do not commit `dist/` or `docs/`; Actions builds from source and deploys the artifact.
- For Google-hosted static pages, upload `dist` contents as-is.

## What is interactive

- Developer-onramp guided path from Arduino IDE install to Home Assistant dashboard.
- Includes an early Sketch 1.1 Blink warmup step to practice breadboard wiring + flashing before MQTT work.
- Teaching aids include concept mapping from common software patterns to embedded/MQTT workflows.
- Visuals included: IDE setup flow, serial monitor preview, Blink circuit image from absolute page 42, and thermistor circuit image from page 115.
- Inline coding cards in the firmware step guide learners to implement `setupWifi`, `setupMqtt`, `calculateTempC`, and `report` from stubs.
- Workshop reference assets now live in `tutorial-web/src/assets`: `C_Tutorial.pdf`, `Sketch_12.1.Thermometer.ino`, and `docker-compose.reference.yaml`.
- Step-by-step completion checklist with local progress persistence.
- Uses TanStack Router for page routes: `/`, `/config`, `/math`, `/troubleshooting`.
- Guided Steps default to Focus Mode and support deep-link query params on the guide page, e.g. `/?mode=focus&step=mqtt_flash` or `/?mode=accordion&step=breadboard`.
- Instructor Mode is enabled by URL query param `?debug=1` and reveals coaching notes per step plus workshop diagnostics commands.
- Config builder for WiFi/MQTT values.
- Generated snippets for Arduino sketch constants, Home Assistant YAML, and MQTT verification commands.
- Thermistor math sandbox (ADC -> voltage/resistance/temperature).
