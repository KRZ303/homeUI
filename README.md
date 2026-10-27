# ETS Smart Home — Vue 3 + TypeScript demo

A working, touch-first demo of the **Elastic Tile System (ETS) V4** smart-home UI, built from the canonical specification in [`ETS_Smart_Home_UI_Specification_V4_Final_Approved.md`](./ETS_Smart_Home_UI_Specification_V4_Final_Approved.md).

## Run

```bash
npm install --include=dev
npm run dev
```

`--include=dev` matters if your shell has `NODE_ENV=production`, which makes npm skip dev dependencies.

Production build:

```bash
npm run build
npm run preview
```

## What is implemented

- **All 5 swimlanes and 45 entities** from the spec's canonical `INITIAL_ENTITIES` payload (`src/data/entities.json` is extracted verbatim from §8.6).
- **All 17 widget archetypes**: lights, group master switch, scene, vertical blind, elastic sensor graphs, ambient AI context, HVAC coordinator, thermostats, AC, TV, stateful appliances, vacuum, WebRTC camera/doorbell, locks, smoke alarm, security history and the Matter 1.6 Joint Fabric hub.
- **Invariant tile anatomy**: 44 px top-left icon, oversized 52 px top-row capsule (`-inset-1`), inline main buttons with Collapse-to-dropdown, Row 2+ secondary pills, embedded sliders and sideways expansion into secondary sliders.
- **Spatial canvas**: portrait 4-column / landscape 8-column transpose, room title top or left spine, 1:1 swipe tracking, 8 px direction lock, 0.25× rubber-banding, 55 px commit threshold and spring snap.
- **24h sensor graphs**: smooth cubic curves, independent axes for mixed units, min/max and Y-axis pills, heating step area, 3×3 legend, and pointer hover scrubbing that updates readouts.
- **Deep-dive modal**: grid-size selection per archetype, opt-in expanders, expanded-content toggles, one-tap composition, nested tile manager and live Matter 1.6 JSON inspector.
- **Composition rules**: Rule A group/width-preservation and add-as-secondary-button choice, Rule B nested drawer, Rule C sensor graph merge.
- **Live state**: device actions, appliance cycle timer, NFC commissioning toast, slider and blind dragging, reset.

## Interaction split

- Tap the circular icon → immediate device action.
- Drag a slider tile (or the blind's vertical capsule) → continuous value adjustment.
- Tap the tile body → deep-dive configuration modal.
- Swipe the ambient ticker / free canvas → change room (portrait: horizontal, landscape: vertical).
- Expand arrows are opt-in per tile and cycle the footprint.

## Stack

Vue 3.5, TypeScript, Vite 6, Tailwind CSS v4. Icons are bundled (Lucide) plus the spec's inline MDI drawing registry — no icon CDN.

The app is deliberately frontend-only: all device state lives in the reactive store (`src/stores/home.ts`), so it runs without a Home Assistant backend.
