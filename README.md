# Elastic Home

An interactive smart-home design system built around a continuous spatial canvas rather than dashboard pages. Rooms drift past as one physical surface; intelligent widgets resize, reflow, and expose only the controls that matter.

## Run

Requires Node.js 20.19+ or 22.12+.

```sh
npm install --include=dev
npm run dev
```

Open the local URL printed by Vite.

```sh
npm run typecheck   # TypeScript
npm test            # Reducer and interaction tests
npm run test:e2e    # Chromium browser tests
npm run build       # Production build in dist/
```

For a new development machine, run `npx playwright install chromium` before the browser suite.

## Explore the prototype

- **Move through rooms:** swipe horizontally in portrait and vertically in landscape. Native scrolling provides inertia and scroll snapping. The dots below the canvas offer keyboard-accessible room navigation.
- **Scroll within a room:** room content scrolls on the transposed axis—vertical in portrait, horizontal in landscape.
- **Use a device:** tap its icon for the primary action. Tap elsewhere on the tile for details.
- **Adjust directly:** drag brightness and volume sliders, change climate targets and modes, or configure and start the dishwasher. Its simulated cycle advances while running.
- **Expand a widget:** use its corner expansion control to reveal secondary controls. The footprint changes and neighboring widgets spring into their new positions.
- **Compose devices:** choose **Arrange**, then drag a small light onto a lighting group. Expand the group to see its nested controls. Open a grouped light's details to remove it from the group.

The four local rooms are Living room, Kitchen, Bedroom, and Studio. State is realistic but intentionally local: there is no backend, authentication, Home Assistant connection, or persisted state.

## Design system

The interface uses a four-column reference grid without fixed card geometry. Widgets can span arbitrary rows and columns; landscape transposes both the navigation axes and the footprint spans.

| Token | Value | Role |
| --- | --- | --- |
| Ink | `#101312` | Continuous canvas |
| Surface | `#202624` | Widget surface |
| Raised | `#2B3230` | Inset controls and dialogs |
| Chalk | `#F1F4ED` | Primary type |
| Celadon | `#B9D8C0` | Active light and action state |
| Ember | `#E6A374` | Climate emphasis |

Instrument Sans handles room-scale display and numeric climate values. Manrope handles controls and status copy. Both variable fonts are bundled locally. Room titles and environmental labels float directly on the canvas; backgrounds belong to widgets and transient overlays.

Motion uses native scrolling and Motion layout springs. `prefers-reduced-motion` disables nonessential transitions and smooth navigation.

## Structure

```text
src/
  components/
    controls.tsx       Shared buttons and range controls
    DetailsDialog.tsx  Native accessible device dialog
    DeviceIcon.tsx     Device icon mapping
    RoomCanvas.tsx     Floating room context and widget grid
    Widget.tsx         Adaptive device variants and drag targets
  data/home.ts         Local room and device fixtures
  state/homeReducer.ts Typed state transitions and composition
  App.tsx              Spatial navigation, drag context, and lifecycle
  styles.css           Tokens, grid, orientation, and component styles
  types.ts             Domain model and status formatting
e2e/home.spec.ts       Browser smoke tests
```

`ha-inspiration-screenshots/` contains the supplied visual research. The implementation takes cues from its tactile controls and meaningful state colors without reproducing its dashboard layout.

## Extending

Add a fixture in `src/data/home.ts`, then either reuse an existing `DeviceKind` or add a typed variant in `Widget.tsx`. Keep state transitions in `homeReducer`; do not mutate fixture objects. Use `canExpand` only when the expanded view reveals useful content, and `acceptsChildren` only for valid composition targets.

See `AGENTS.md` for contributor constraints and verification expectations.
