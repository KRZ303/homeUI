# AGENTS.md

## Project

Elastic Home is a Vite + React + TypeScript interactive design prototype. It is not a Home Assistant dashboard and has no backend. Preserve the continuous spatial-canvas model when adding features.

## Commands

```sh
npm install --include=dev
npm run dev
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

Run typecheck, unit tests, browser tests, and the production build before committing UI or state changes. The shell may default to `NODE_ENV=production`; Vitest explicitly sets its own test environment.

## Architecture

- `src/types.ts` owns the device model, typed actions, and shared status formatting.
- `src/data/home.ts` contains immutable local fixtures. Keep IDs stable and room membership derived from `roomId`.
- `src/state/homeReducer.ts` owns all device transitions. Never mutate state or put one-off control logic in event handlers when it belongs in the reducer.
- `src/components/Widget.tsx` adapts device content to kind, footprint, and state. Add a new device kind here only after typing it in `types.ts`.
- `src/components/RoomCanvas.tsx` and `src/App.tsx` own spatial navigation and composition context.
- `src/styles.css` is the design system. It uses custom properties and bespoke component styles, not Tailwind or dashboard component libraries.

## Spatial rules

- Portrait: horizontal room track, vertical room content.
- Landscape: vertical room track, horizontal room content.
- Keep native scrolling, inertia, scroll snapping, and the four-unit reference grid.
- Widget geometry comes from `--column-span` and `--row-span`; landscape transposes them in CSS.
- Only widgets and transient overlays have surfaces. Room titles and contextual labels float on the canvas.
- Expansion must reflow neighbors and reveal useful controls. Do not add permanent edit handles outside Arrange mode.
- Do not introduce tabs, page cards, navigation containers, or fixed one-size-fits-all tile layouts.

## Interaction and accessibility

- Device icon: primary action. Tile surface: details. Keep these as separate controls.
- Every interactive element needs an accessible name, keyboard behavior, visible focus, and an appropriate hit target.
- Preserve native range, select, progress, and dialog semantics.
- New capabilities must be usable without drag-and-drop. Composition uses Arrange mode; ungrouping lives in device details.
- Respect `prefers-reduced-motion` and test both orientations, including 390×844 portrait and 1024×600 hub landscape.
- Avoid placeholder or no-op controls. Local fixture transitions should behave consistently throughout the UI.

## Visual conventions

Use the existing Ink, Surface, Raised, Chalk, Celadon, and Ember tokens. Instrument Sans is for display; Manrope is for controls and status. Active color communicates state, not decoration. Keep copy concise and sentence case. Do not add decorative gradients, excessive borders, generic card chrome, or permanent information icons.

## Testing

- Reducer behavior: `src/state/homeReducer.test.ts`.
- Direct actions, dialogs, sliders, expansion, and appliances: `src/App.test.tsx`.
- Navigation, orientation, keyboard behavior, and composition: `e2e/home.spec.ts`.
- Keep Playwright tests out of Vitest's `include` pattern.
- Review screenshots after substantial visual changes and remove test artifacts before committing.
