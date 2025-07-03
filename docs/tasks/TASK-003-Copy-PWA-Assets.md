# TASK-003: Ensure PWA Assets in Build Output

## Background
After running `npm run build` the `dist/` directory lacks:
* `sw.js` (service worker)
* `manifest.json`
* favicon / app icons

Browsers request these files at runtime → 404 → offline support & install prompt fail.

## Objective
Modify the build process so **all** required PWA assets are present in `dist/` and reachable at the root URL.

## Scope / Files
* `package.json` – `build` script.
* PWA asset files in `src/`: `sw.js`, `manifest.json`, `icons/*`.

## Steps
1. Open `package.json`, locate current build script:
   ```json
   "build": "rm -rf dist && cp -R src dist"
   ```
2. Add explicit asset copy (cross-platform):
   ```json
   "build": "rm -rf dist && cp -R src dist && cp src/sw.js src/manifest.json dist/ && cp -R src/icons dist/"
   ```
   (If using Windows dev, replace with Node copy script.)
3. Verify:
   ```bash
   npm run build
   ls dist | grep sw.js   # should list sw.js
   ls dist | grep manifest.json
   ls dist/icons          # icons folder exists
   ```
4. Serve locally (`npx serve dist`) and open devtools→Application→Manifest. It should load without errors. Service worker should register.

## Acceptance Criteria
- Visiting `/sw.js` and `/manifest.json` on local server returns 200.
- Lighthouse PWA audit passes service worker & manifest checks.

## Estimated Effort
5–10 minutes.
