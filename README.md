# StrengthLog — 8-day training PWA

A mobile-first, local-first React + TypeScript workout tracker for a custom asynchronous eight-day strength and hypertrophy rotation.

## Features

- Eight-day rotation with manual day selection and next/previous controls
- Five workout days and three rest days (including two consecutive rest days at the end)
- Weighted dips/pull-ups, squat, OHP, RDL, bench, paused variations, and accessories
- Editable exercises, sets, and rep ranges
- Set-by-set weights, reps, RPE and completion checkboxes
- Previous results and simple progression recommendations
- Workout history and JSON export/import
- Offline-ready PWA service worker after first online visit
- No login, API, server, or subscription required

## Run locally

Install Node.js 20+ then:

```bash
npm ci
npm run dev
```

Open the local URL Vite prints. To verify the production build:

```bash
npm run build
npm run preview
```

## Publish to GitHub Pages

1. This project lives in `Vukal/Hybrid2.0`.
2. Push changes to `main`.
3. In the repository, open **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. The included `.github/workflows/deploy.yml` workflow will build and deploy on each push to `main`.
5. Your app will appear at `https://vukal.github.io/Hybrid2.0/` after a successful deployment.
6. On mobile, open the site and use **Add to Home Screen** / **Install app** if your browser offers it.

Vite uses a relative base (`./`) so this project works at GitHub Pages subpaths.

## Storage and backups

Data is stored locally in the browser using `localStorage`. It is **not synced** across devices. Use **Settings → Export** to download a JSON backup and **Import** on another device to transfer it. Import replaces the current device's stored data. Browser data clearing or uninstalling the app may erase workouts.

The built-in progression is a customized, simplified interpretation of the training plan. The app assumes the minimum added-weight increment for belt-loaded dips/pull-ups is 2.5 kg. Edit exercises and targets to suit your equipment.

## Notes

- A completed workout saves only sets you marked as done; then advances the rotation by one day.
- A rest day can be completed to advance the rotation without adding a workout to history.
- Exercise edits persist in local storage; reset the template in Settings.
- The optional Day 6 lateral raise is included but can be removed.
- The PWA caches site assets after initial access; external fonts may fall back to system fonts offline.

## Source layout

- `src/main.tsx`: React entry point and production service worker registration.
- `src/App.tsx`: app shell, navigation, and status messages.
- `src/components/`: training, history, settings, exercise cards/editors, and header UI.
- `src/hooks/useTraining.ts`: rotation state, workout drafts, and workout/backup actions.
- `src/models/training.ts`: shared TypeScript domain types.
- `src/data/sessions.ts`: the default eight-day exercise plan.
- `src/lib/storage.ts`: local storage, backup validation, and initial store creation.
- `src/lib/progression.ts`: progression recommendations.
- `src/styles/`: base, training, exercise, panel, editor, and responsive styles; `index.css` preserves their cascade order.

## Making changes

Edit the source files and use `npm run dev` to see changes locally. Run `npm run build` before pushing. Every push to `main` automatically starts the GitHub Pages workflow, which builds and deploys the new version. Local edits and commits alone do not deploy. Manually rerun a workflow only when retrying a failed deployment, such as after enabling Pages in repository settings.

Edit files in `src`, rather than generated files in `dist`. Production JavaScript is intentionally bundled and minified; the source stays readable and modular. Workout data keeps the same `strengthlog-v1` storage key through this refactor.
