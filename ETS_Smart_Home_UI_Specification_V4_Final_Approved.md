# Elastic Tile System (ETS) — Smart Home UI & Widget Design Specification (V4 — Final Approved)

**Document revision:** V4 — 26 October 2026  
**Design baseline:** ETS v1.6 — reconciled superset of V1, V2 and V3  
**Owner decision (approved):** Rule A / Group Together preserves the target tile’s existing width, subject to a minimum of two columns; it must never shrink a wider host. See §§2.2 and 5.3.  

---

## 1. Executive Summary, Vision & Core Design Pillars

The **Elastic Tile System (ETS)** is a spatial, touch-first Smart Home UI and widget design system engineered for AI agents and human interface designers. It unifies the expressive, high-density customization of **Home Assistant Bubble Cards** and **`mini-graph-card`** with the structured, predictable room/domain organization of **Apple Home**, **Google Home (Nest Hub)**, and **Samsung SmartThings**, while providing native UI archetypes for every device class through the **Matter 1.6** specification.

### 1.1 Core Design Pillars

1. **Zero Non-Widget Chrome:**
   * There are no outer window frames, top application bars, navigation pill containers, page bezels, or section borders.
   * Even the **Ambient Status & Sensor Ticker** ($4 \times 0.5$ sub-row at the top of each room) floats directly on the `#1C1C1C` infinite canvas without a container box or border.
   * Only the device widgets themselves possess physical card surfaces (`#303030` standard matte surface, `#2E3440` sensor graph surface, `#31537A` active group surface, `#2B3F46` active AI context surface, `#26292E` WebRTC camera surface, and `#2B3B4E` Joint Fabric hub surface).

2. **Physical 2D Spatial Canvas with Orientation Transpose:**
   * Rooms and functional domains exist on a single, unified, continuous 2D plane navigated via 1:1 touch-tracking swipe gestures with physical rubber-band resistance and spring inertia—inspired by the physical spatial feel of the PlayStation 3 XMB (XrossMediaBar), but modernized for touchscreens as a **single unified view** (never a separate overview mode).
   * In **Portrait (Mobile / Wall Switch)**, rooms flow horizontally along the $X$-axis while tiles pack into a 4-column vertical grid ($Y$-axis).
   * In **Landscape (Google Nest Hub / Tablet)**, the $X$ and $Y$ semantics transpose: rooms stack along a borderless vertical left spine ($Y$-axis) while tiles pack into an 8-column horizontal ribbon ($X$-axis).

3. **Invariant Top-Row Geometry (`44px` Content Height):**
   * Every tile—regardless of footprint ($1 \times 1$, $2 \times 1$, $2 \times 2$, $2 \times 3$, $3 \times 2$, $3 \times 3$, $4 \times 1$, $4 \times 2$, or $4 \times 3$) or collapsed/expanded state—anchors its $44\text{px} \times 44\text{px}$ circular device icon at the exact same top-left coordinate (`top: 12px, left: 12px`).
   * The $44\text{px}$ icon and the text (title + subtitle) immediately following it define the **Top Row**. Nothing else may ever enter the Top Row except the **Oversized Slider/Progress Capsule** and up to **4 Main Buttons** (or their collapsed borderless Dropdown Trigger).

4. **Oversized Slider & Progress Capsule (`-inset-1` / $52\text{px}$ Halo):**
   * Full-card background fills for sliders and appliance progress bars are strictly eliminated.
   * **Horizontal Sliders & Progress Bars:** Confined to an oversized pill capsule inside the Top Row (`-inset-1`), making the capsule **$52\text{px}$ high** so it extends **$4\text{px}$ before, above, and below the $44\text{px}$ circular icon** (creating a clean halo around the icon) and runs symmetrically to $4\text{px}$ past the right edge of the Top Row.
   * **Minimum $2\times$ Width ($C \ge 2$) for All Sliders:** Every tile with an interactive slider must be at least $2$ columns wide ($C \ge 2$) so the slider capsule and label text are never cramped or truncated.
   * **Vertical Sliders ($2 \times 3$ Minimum Footprint):** Require a minimum footprint of $2$ columns wide by $3$ rows tall ($2 \times 3$). The $52\text{px}$-wide vertical slider capsule sits on the **left side** (`top: 8px, bottom: 8px, left: 8px, width: 52px`), wrapping $4\text{px}$ around the top-left $44\text{px}$ circular icon and extending straight down to the bottom-left of the tile.

5. **Strict Separation of Main Buttons (Top Row) vs. Secondary Buttons (Bottom Bar):**
   * **Main Buttons (`mainButtons`, up to 4):** Populate the right side of the Top Row. When overlapping a slider or progress bar underneath, they use a translucent background with backdrop blur (`backdrop-blur-[2px]`) so the slider fill remains visible beneath them. When horizontal space is constrained, they collapse into a **borderless, backgroundless Dropdown Trigger & Popover** where only the actual button pills have backgrounds/borders.
   * **Secondary Buttons (`secondaryButtons`, Row $2+$ Only):** Populate the Bottom Bar (Row $2+$) as oval pills, group member toggles, programme selectors, or embedded sliders. They **never** enter the Top Row and are completely hidden whenever a tile is $1$ row high ($R = 1$).

6. **Clean 3-Way Interaction Split (Zero `i` or Drag Icons):**
   * **Tap Circular Icon** $\rightarrow$ Immediate primary device action (toggle ON/OFF, pause/resume cycle, lock/unlock, cycle graph size, or pair via NFC).
   * **Drag Across Slider Tile** $\rightarrow$ Live continuous level, brightness, volume, fan speed, or blind position adjustment.
   * **Tap Tile Body** $\rightarrow$ Opens the **Deep-Dive Configuration & Matter 1.6 Endpoint Modal** (completely eliminating the need for an `i` info button or a visible drag grip handle `⋮⋮`).

---

## 2. Complete Chronological Registry of Design Decisions & Hard Constraints (Session Audit)

To ensure any AI agent or engineer implementing or benchmarking this specification reproduces every single requirement established from the first message of the session to the final iteration, the following **20 mandatory rules and negative constraints** are strictly enforced:

### 2.1 Visual & Chrome Constraints ("What NOT to Do")
1. **Zero Non-Widget Boxes or Borders:**
   * Do **not** render a top application bar, a room-switcher pill container, an outer page frame/bezel, or a border around the ambient status ticker.
   * Only the device widgets themselves have card surfaces.
2. **No Separate "XMB Overview" Mode:**
   * PlayStation 3's XMB is the inspiration for the **physical 2D panning feel** on an endless plane—not a separate overview mode. There is only **one unified spatial view**.
3. **Pure Borderless Room Typography (Top-Centered or Left-Aligned in Portrait; Vertical Spine in Landscape):**
   * In **Portrait**, the active room title (e.g., `Salon & Światła`) is pure borderless text. By default (`portraitTitlePos = 'top'`), it is **centered at the top** (`18px` bold white) flanked by subtle borderless adjacent room peeks (`← Prev Room` on the left, `Next Room →` on the right in `text-white/25 hover:text-white/65`). It can also be toggled to stack along the left side (`portraitTitlePos = 'left'`, `w-36`).
   * In **Landscape (Google Nest Hub Mode)**, room titles stack vertically along a borderless left spine (`md:w-44`).
4. **No Perimeter Borders on Slider Tiles:**
   * Do **not** add a CSS border around the outer perimeter of a card to signify that it is a slider.
   * Slider presence is signified by the **inset margin** between the card perimeter and the internal capsule track (`8px` inset from the card edge) plus the subtle vertical drag-thumb indicator (`w-1 h-4 rounded-full bg-white/45`) inside the active slider fill.
5. **No Full-Card Background Sliders or Progress Bars:**
   * Never fill the entire multi-row background of a card (`2x2`, `4x2`, `2x3`) as a slider or progress bar. All horizontal sliders and progress bars live strictly inside the **Oversized Top-Row Capsule** (`-inset-1`, $52\text{px}$ high); all vertical sliders live strictly inside the **Oversized Left-Column Capsule** ($52\text{px}$ wide).
6. **No `i` Info Button and No Drag Grip Handle (`⋮⋮`):**
   * Never render an `i` button or a `⋮⋮` drag icon on any tile. Tapping the icon performs the device action; tapping the tile body opens the modal; dragging a non-slider tile (or using the modal's one-tap merge buttons) triggers tile composition.

### 2.2 Geometric, Button & Sensor Rules
7. **Invariant Top-Left Icon Anchor (`top: 12px, left: 12px`):**
   * The $44\text{px} \times 44\text{px}$ circular icon button (`w-11 h-11 rounded-full`) is always in the exact same top-left spot on every tile across all sizes ($1 \times 1$ through $4 \times 3$) and expansion states.
8. **Strict Top-Row Content Rule:**
   * Nothing may populate the Top Row (`h-11` / $44\text{px}$) except:
     1. The $44\text{px}$ circular icon on the left.
     2. The title and single-line subtitle immediately after the icon.
     3. The $52\text{px}$ oversized slider/progress capsule underneath the Top Row.
     4. Up to **4 Main Buttons** (`mainButtons`)—or their collapsed borderless Dropdown Button—on the right edge.
9. **Oversized Slider Capsule Halo (`4px` Around Icon):**
   * The slider/progress track must be slightly larger than the $44\text{px}$ main icon, extending **$4\text{px}$ before, above, and below the icon** (`-inset-1` = $52\text{px}$ height) and ending symmetrically $4\text{px}$ past the right edge of the Top Row.
10. **Minimum Width $2\times$ ($C \ge 2$) for All Sliders:**
    * Every slider-based entity (`slider_light`, `vertical_blind`, `rich_ac_row`, `stateful_tv`) must have a minimum width of **2 columns ($C \ge 2$)**. A slider tile may never be $1 \times 1$ (`lampka` and `głośnik Sonos` are $2 \times 1$).
11. **Vertical Slider Minimum Footprint ($2 \times 3$) & Left-Side Track:**
    * Vertical slider cards (`roleta`) must be at least **2 columns wide by 3 rows tall ($2 \times 3$)**. The $52\text{px}$-wide vertical slider capsule sits on the left side coming down from the top-left icon (`top-2 bottom-2 left-2 w-[52px]`), while the Top-Row text/dropdown and Rows 2–3 Secondary Buttons sit on the right (`pl-[54px]`).
12. **Official Rename: Main Buttons vs. Secondary Buttons:**
    * Top-row right-side buttons (up to 4) are **Main Buttons (`mainButtons`)**.
    * Bottom-bar buttons (Row $2+$ only) are **Secondary Buttons (`secondaryButtons`)**.
13. **Main Buttons Transparency Over Sliders:**
    * Whenever a slider or progress bar is present underneath the Top Row (`trackMode !== 'none'`), Main Buttons use a translucent background with backdrop blur (`bg-[#73B7B2]/30 text-teal-50 border border-[#73B7B2]/45 backdrop-blur-[2px]` when active; `bg-black/25 text-white/90 border border-white/10 backdrop-blur-[2px]` when inactive).
14. **Borderless & Backgroundless Main Buttons Dropdown:**
    * When Main Buttons do not fit inline and collapse into a Dropdown Button, both the **Dropdown Trigger** and the floating **Dropdown Popover Container** must have **no border and no background at all** (`bg-transparent border-0 shadow-none p-0`), while the individual Main Button pills inside the open dropdown retain their full pill background and border.
15. **Secondary Buttons Strictly in Row $2+$ & Hidden at $R = 1$:**
    * Secondary Buttons never enter the Top Row. When a card is $1$ row high ($R = 1$), all Secondary Buttons are hidden.
16. **Secondary Button Height, Alignment & Icon-Position Nuances (From Reference Screenshots):**
    * **Standard Secondary Oval Pills (`42px` height):** Used on `salon` (`Lampa`, `Grzybek`), `kuchnia` (`okno i salon`), etc. (`h-[42px] px-4 rounded-full`). Icon sits **to the left** of the label.
    * **Single Secondary Pill Right-Alignment:** When a tile has only $1$ Secondary Button (`kuchnia` $\rightarrow$ `okno i salon`, `TV` $\rightarrow$ `LED TV - film`), that pill is **right-aligned** (`ml-auto min-w-[148px]`) in the bottom bar.
    * **Momentary / Scene Ghost Pill (`ghost_momentary`):** Used on `TV` (`LED TV - film`). Has a near-transparent surface (`bg-white/[0.03] hover:bg-white/[0.08]`) when idle, places the icon **to the right** of the label (`LED TV - film [icon]`), and flashes `#73B7B2` for $650\text{ms}$ when tapped.
    * **Compact Group Member Pills (`34px` height):** Used on `roślinki` when expanded (`2 \times 2`). Rendered in a 4-column sub-grid (`grid-cols-4 gap-2`) at a shorter **$34\text{px}$ height** (`h-[34px]`), showing icons only at $C = 2$ and revealing member text labels at $C \ge 4$.
    * **Sideways Expansion Morphing into Sub-Sliders ($C \ge 4$):** When `salon` is expanded sideways from $2 \times 2$ to $4 \times 2$ via its right-edge `→` expander, its Secondary Buttons (`Lampa` and `Grzybek`) morph from toggle pills into **independent horizontally draggable Secondary Sliders** (`h-[44px] rounded-full bg-black/35`) with individual percentage readouts.
17. **Group Master Switch Asymmetric Toggle Logic (`roślinki`):**
    * `roślinki` is a group master switch (not a dimmer slider) with a slate-blue active card surface (`#31537A`). It starts collapsed at $2 \times 1$ with a bottom-center `↓` expander. Tapping the main icon toggles all 4 plant lights ON or OFF together; expanding `↓` to $2 \times 2$ lets the user selectively toggle individual plant pills OFF (or turn a single plant pill ON without turning on the rest).
18. **Opt-In Directional Expanders (`↓`, `→`, `↘`) & Exact Edge Anchoring:**
    * Cards do not display expansion chevrons unless enabled in `entity.expanders` (`{ down, right, diagonal }`), configurable per card inside the Deep-Dive Modal.
    * Enabled expanders are anchored at:
      * **Down (`↓`):** Bottom-center (`bottom-0.5 left-1/2 -translate-x-1/2`).
      * **Sideways (`→`):** Right-center (`right-0.5 top-1/2 -translate-y-1/2`).
      * **Diagonal (`↘`):** Bottom-right corner (`bottom-1 right-1.5`).
19. **Elastic Sensor & 24h Mini-Graph Progression (`1x1` $\rightarrow$ `2x2` $\rightarrow$ `3x3`):**
    * Inspired by Home Assistant's `mini-graph-card` on a `#2E3440` slate-navy surface:
      * **$1 \times 1$ (Smallest Sensor):** Shows only the top-left $44\text{px}$ icon, sensor title, and current state subtitle (`420 lx`, `540 ppm`, `5,73 °C`, `24,55 °C`).
      * **$2 \times 2$ (24h Mini-Graph):** Shows large primary (left) and secondary (right) state readouts above a smooth 24h cubic-bezier curve and shaded area fill with corner min/max badge pills.
      * **$3 \times 3$ (Analytical Multi-Sensor Graph):** Adds a **color-coded dot legend** (`salon`, `biuro`, `sypialnia`, `grzanie %`), **Min / Max extremes with timestamps**, **Left & Right Y-Axis badge markings** (`24,87` / `19,87` and `110` / `0`), X-axis timeline labels (`-24h`, `-12h`, `-6h`, `Teraz`), stepped heating background fill, and interactive pointer hover scrubbing.
20. **Tile Composition Rules (Rule A, Rule B & Rule C Sensor Merge):**
    * **Rule A (Simple $\rightarrow$ Simple / Slider Light):** Spawns a modal choice to either **(1) Group & control together** (**owner-approved width-preservation rule:** `span: { c: Math.max(2, curr.span.c), r: curr.span.r }`; retain any existing target width of 2, 3 or 4 columns; increase a 1-column target to 2; never shrink the target), or **(2) Add as a Secondary Button** in Row $2+$ (`span: { c: Math.max(2, curr.span.c), r: Math.max(2, curr.span.r) }`). Preserve the target row span for Group Together, except where the resulting archetype requires a larger minimum.
    * **Rule B (Complex $\rightarrow$ Complex):** Nests the dropped tile inside `nestedTiles` so it renders inside an expandable 4-column nested drawer (`Zagnieżdżone kafelki (N)`) when the host tile is expanded ($R \ge 2$).
    * **Rule C (Sensor Graph $\rightarrow$ Sensor Graph):** Automatically combines both sensors' `series` arrays onto a single $3 \times 3$ multi-sensor graph card with a color-coded legend.

---

## 3. Spatial Architecture, Continuous 2D Physics & Virtual Grid System

### 3.1 Continuous 2D Viewport & Gesture Physics

The viewport (`<main>`) renders room swimlanes along a continuous track driven by pointer events (`onPointerDown`, `onPointerMove`, `onPointerUp`, `onPointerCancel`):

1. **Directional Deadzone & Lock (`8px`):**
   * On pointer down (when no modal is open), the initial coordinates $(x_0, y_0)$ are recorded in `swipeStartRef`.
   * During pointer move, $\Delta x = x - x_0$ and $\Delta y = y - y_0$ are evaluated:
     * In **Portrait**, horizontal swiping activates when $|\Delta x| > 8\text{px}$ and $|\Delta x| > |\Delta y|$.
     * In **Landscape**, vertical swiping activates when $|\Delta y| > 8\text{px}$ and $|\Delta y| > |\Delta x|$.
2. **1:1 Pointer Tracking & Edge Rubber-Banding (`0.25x`):**
   * While `isSwipingViewport === true`, CSS transitions are disabled (`transition: 'none'`) so the track follows the finger/cursor 1:1.
   * If the user pulls past the first room (`activeLaneIdx === 0` and $\Delta > 0$) or past the last room (`activeLaneIdx === lanes.length - 1` and $\Delta < 0$), rubber-band damping is applied:
     $$\text{swipeOffsetPx} = 0.25 \times \Delta$$
3. **Commit Threshold (`55px`) & Spring Snap:**
   * On pointer release, if $\text{swipeOffsetPx} < -55\text{px}$ and `activeLaneIdx < lanes.length - 1`, `activeLaneIdx` increments by $1$.
   * If $\text{swipeOffsetPx} > 55\text{px}$ and `activeLaneIdx > 0`, `activeLaneIdx` decrements by $1$.
   * `swipeOffsetPx` resets to $0$ and snaps using:
     $$\text{transition: transform } 380\text{ms cubic-bezier}(0.22, 1, 0.36, 1)$$

### 3.2 Portrait vs. Landscape (Google Nest Hub) $X/Y$ Axis Transpose

| Viewport Mode | Primary Swimlane Axis (Rooms / Domains) | Secondary Content Axis (Tile Reflow) | Room Header Typography & Layout |
| :--- | :--- | :--- | :--- |
| **Portrait (`orientation = 'portrait'`)** | **Horizontal ($X$-Axis):** Swiping left/right moves between room columns via `translate3d(calc(-activeLaneIdx * 100% + swipeOffsetPx), 0, 0)`. | **Vertical ($Y$-Axis):** Tiles pack into a 4-column grid (`grid-cols-4 gap-3 grid-flow-row-dense`, `max-w-[540px]`) and scroll vertically. | **Top Mode (`portraitTitlePos = 'top'`, Default):** Centered `18px` bold white title (`text-lg font-bold`) with borderless adjacent room buttons (`← Prev` on left, `Next →` on right in `text-sm font-medium text-white/25 hover:text-white/65`).<br>**Left Spine Mode (`portraitTitlePos = 'left'`):** `144px` (`w-36`) left column of borderless room titles inside a `max-w-[740px]` flex row. |
| **Landscape (`orientation = 'landscape'`, Google Nest Hub Mode)** | **Vertical ($Y$-Axis):** Swiping up/down switches rooms along a borderless vertical left spine (`md:w-44`) via `translate3d(0, swipeOffsetPx, 0)`. | **Horizontal ($X$-Axis):** Tiles pack into an 8-column wide ribbon (`grid-cols-4 md:grid-cols-8 gap-3 grid-flow-row-dense min-w-[660px]`) inside a `max-w-6xl` container. | Borderless vertical list of room titles on the left (`text-xl font-bold text-white` when active; `text-base font-medium text-white/30 hover:text-white/65` when inactive). |

### 3.3 The $4 \times R$ Virtual Grid (Canvas, Not a Constraint)

Each room swimlane is a CSS Grid (`grid-auto-flow: row dense`, `gap: 12px` / `gap-3`). The grid acts as a snapping canvas rather than a rigid box constraint, supporting arbitrary aspect ratios:

* **Unit Column Width ($C$):** In Portrait (`max-w-[540px]` with $3 \times 12\text{px} = 36\text{px}$ total inter-column gap), $1$ virtual column ($1\text{fr}$) equals $\approx 25\%$ of the swimlane width (**$\approx 126\text{px}$ per column** at full `540px` container width). In Landscape (`md:grid-cols-8`), $1$ virtual column equals $12.5\%$ of the 8-column ribbon width.
* **Sub-Row ($R = 0.5$, `height: 32px` / `h-8`):** Reserved for the borderless **Ambient Status & Sensor Ticker** at the top of each swimlane.
* **Single Row ($R = 1$, `minHeight: 68px`):** Houses strictly the $44\text{px}$ **Top Row** plus $12\text{px}$ top/bottom card padding (`p-3`).
* **Double Row ($R = 2$, `minHeight: 140px`):** Houses the **Top Row** plus the **Bottom Bar** (`secondaryButtons`, embedded secondary slider, or $2 \times 2$ 24h mini-graph).
* **Triple Row ($R = 3$, `minHeight: 216px`):** Houses $2 \times 3$ vertical slider tiles (`roleta`), $3 \times 3$ analytical multi-sensor graphs, or 3-row expanded light tiles with color-temperature sliders (`2200 K – 6000 K`).

### 3.4 Canonical Tile Footprints ($C \times R$)

| Footprint ($C \times R$) | Archetype Name | Allowed Widget Types | Visible Anatomy | Example Entities |
| :--- | :--- | :--- | :--- | :--- |
| **$4 \times 0.5$** | **Borderless Ambient Ticker** | `AmbientTickerBar` | `28px` (`w-7 h-7`) circular lead icon badge on left + borderless horizontal telemetry items (`icon + tabular value`) on right. | Weather ticker (`10,99 °C`, `74,2%`, `981,0 hPa`, `pochmurno`), Indoor climate ticker, Energy flow ticker. |
| **$1 \times 1$** | **Compact Non-Slider Pill / State Sensor** | `scene_pill`, `sensor_graph` *(Never sliders!)* | Top Row only: $44\text{px}$ icon + compact title (`13px` bold) + current sensor value (`11px`). Main & Secondary buttons hidden. | `Sen` (scene), `natężenie` (`420 lx`), `CO₂ biuro` (`540 ppm`), `balkon` (`5,73 °C`), `łazienka` (`24,55 °C`). |
| **$2 \times 1$** | **Standard Single-Row Tile** | `slider_light`, `group_tile` (collapsed), `simple_thermostat`, `hvac_global_modes`, `closure_lock_tile`, `matter_smoke_alarm` | Top Row only: $44\text{px}$ icon + title (`15px` bold) & subtitle (`11px`) + $52\text{px}$ oversized slider/progress capsule + $1$ inline Main Button (or borderless Dropdown Trigger if $\ge 2$ Main Buttons). | `łóżko`, `lampka`, `roślinki` (collapsed), `wtyczka biuro`, `głośnik Sonos`, `Tryb HVAC`, `biuro` / `salon` / `sypialnia` thermostats, `bojler CWU`, `rekuperacja`, `zamek główny`, `brama garażowa`, `czujnik dymu i CO`, `zawór wody & ogród`. |
| **$2 \times 2$** | **Classic Feature Tile / 24h Mini-Graph** | `slider_light`, `group_tile` (expanded), `sensor_graph`, `webrtc_camera_tile` | Top Row (with $52\text{px}$ slider/progress capsule + Main Buttons dropdown) **+** Row 2 Bottom Bar (`secondaryButtons` oval pills, 4 group member pills, camera detection badge, or 24h dual-series SVG graph). | `salon`, `TV` (light), `kuchnia`, `salon 24h`, `biuro 24h`, `pompa ciepła`, `oczyszczacz`, `lodówka Samsung`, `piekarnik & płyta`, `kamera podjazd`, `wideodomofon`, `fotowoltaika PV`, `magazyn energii`. |
| **$2 \times 3$** | **Vertical Slider Tile (Minimum $2 \times 3$)** | `vertical_blind` | Top-left $44\text{px}$ icon + title, subtitle, and Main Buttons dropdown in Top Row; $52\text{px}$-wide vertical slider capsule on the left side coming down from the icon; stacked Secondary Buttons (`Otwórz 100%`, `Stop / 50%`, `Zamknij 0%`) in Rows 2–3 on the right (`pl-[54px]`). | `roleta` (expands sideways to $3 \times 3$ or $4 \times 3$ with lamella tilt slider). |
| **$3 \times 3$** | **Analytical Multi-Sensor Graph Tile** | `sensor_graph` | Top Row + large multi-zone readouts + color-coded dot legend (`salon`, `biuro`, `sypialnia`, `grzanie %`) + Min/Max extremes with timestamps + 24h multi-curve & stepped-area SVG chart with Left & Right Y-Axis badge pills (`24,87`/`19,87` & `110`/`0`) and X-axis time markers. | `temperatura i grzanie 24h` (or any two sensor cards merged together). |
| **$4 \times 1$** | **Full-Width Control Bar** | `rich_ac_row`, `stateful_tv`, `robot_vacuum_tile`, `matter_context_tile`, `matter_event_history`, `matter_fabric_hub` | Top Row with full telemetry + $52\text{px}$ oversized slider/progress capsule + up to $4$ inline Main Buttons. | `kontekst AI`, `ac_salon`, `ac_sypialnia`, `media_tv`, `robot sprzątający`, `historia zdarzeń (Matter 1.6)`, `sieć Matter 1.6 Joint Fabric`. |
| **$4 \times 2$** | **Rich Stateful Appliance / Expanded Group** | `stateful_dishwasher`, `slider_light` (expanded sideways) | Top Row (icon, live status, $52\text{px}$ progress/slider capsule, Main Buttons) **+** Bottom Bar (programme selector dropdown + modifier Secondary Buttons, or dual controllable Secondary Sliders). | `zmywara`, `pralka`, `ładowarka EV Wallbox`, or `salon` expanded sideways ($2 \times 2 \rightarrow 4 \times 2$). |

---

## 4. Universal Tile Anatomy, Top-Row Geometry & Button Hierarchy

### 4.1 Structural Diagrams of the Four Primary Layout Modes

#### A. Standard Horizontal Slider / Feature Tile (`2x2` or `4x2`)
```
+-----------------------------------------------------------------------+
|  [ (-inset-1 / 52px Oversized Top-Row Slider or Progress Capsule)   ] |
|  [  (ICON)  Title                  [Main Btn 1] [Main Btn 2] / 3 v  ] | <-- TOP ROW (44px content height)
|  [  (44px)  Subtitle • 68%                                          ] |
|                                                                       |
|  ( [Secondary Pill 1 (Lampa)] )     ( [Secondary Pill 2 (Grzybek)] )  | <-- BOTTOM BAR (Row 2+ Only: Secondary Buttons)
|                                  v                                    | <-- Opt-In Ghost Expander (↓, →, ↘)
+-----------------------------------------------------------------------+
```

#### B. Vertical Slider Tile (`roleta` — Minimum `2x3` Footprint)
```
+---------------------------------------------------+
| [52px]  Title (roleta)                      2 v   | <-- TOP ROW (44px content height)
| [ICON]  65% • Lamele 40°                          |
| [ || ]                                            |
| [ || ]  ( [ Otwórz 100%                     ^ ] ) | <-- ROW 2 (Right of 52px vertical slider)
| [ || ]  ( [ Stop / 50%                     || ] ) |
| [ || ]  ( [ Zamknij 0%                      v ] ) | <-- ROW 3 (Right of 52px vertical slider)
| [____]                                          > | <-- Right-Center Expander (→)
+---------------------------------------------------+
```

#### C. Elastic Sensor & 24h Mini-Graph Tile (`1x1` $\rightarrow$ `2x2` $\rightarrow$ `3x3`)
```
1x1 (State Only)          2x2 (24h Mini-Graph)                   3x3 (Multi-Sensor + Legend + Min/Max + Axis)
+------------------+      +-----------------------------------+  +---------------------------------------------------+
| (ICON) CO₂ biuro |      | (ICON) salon 24h             (L)  |  | (ICON) temperatura i grzanie 24h      [Act] [Gau] |
| (44px) 540 ppm   |      | (44px) Ostatnie 24h               |  | (44px) Ostatnie 24h                               |
+------------------+      |                                   |  | 23,14 °C                                 23,35 °C |
                          | 23,14 °C                 42,2 %   |  |                                          21,06 °C |
                          | [24,65]                   [48,4]  |  |   (o) salon   (o) biuro   (o) sypialnia  [#] grz  |
                          |   /\  /\    /\      /\            |  | Min: 19,87 °C (05:20)      Max: 24,87 °C (14:10)  |
                          |  /  \/  \__/  \____/  \___/\___   |  | [24,87]                                     [110] |
                          | [21,65]                   [42,27] |  |   /~~\___/~~~\____/~~~~\_______________________   |
                          +-----------------------------------+  | [19,87]      -24h   -12h   -6h   Teraz        [0] |
                                                                 +---------------------------------------------------+
```

### 4.2 Exact Mathematical & CSS Specification of `TileTopRow`

1. **Top Row Container:**
   * `relative w-full h-11 shrink-0 flex items-center justify-between select-none` ($44\text{px}$ height inside a `p-3` / $12\text{px}$-padded card).
2. **Oversized Capsule Track (`-inset-1` = $52\text{px}$ Height):**
   * `absolute -inset-1 rounded-full overflow-hidden pointer-events-none transition-colors`
   * Background class when `trackMode !== 'none'`: `bg-black/30`.
   * Active fill element: `absolute inset-y-0 left-0 rounded-full transition-all duration-100`
   * **Width Formula:** Because the capsule is $52\text{px}$ tall and wraps $4\text{px}$ around the $44\text{px}$ circular icon, a $0\%$ fill starts at the $52\text{px}$ icon halo boundary and interpolates linearly to $100\%$ of the capsule width:
     $$\text{width} = \begin{cases} \text{calc}\left(52\text{px} + (100\% - 52\text{px}) \times \frac{\text{clamp}(\text{trackPct}, 0, 100)}{100}\right) & \text{if } \text{trackActive} = \text{true} \\ 0\text{px} & \text{if } \text{trackActive} = \text{false} \end{cases}$$
   * **Controllable Slider Thumb Indicator:** When `trackMode === 'slider'` and `trackActive === true`, a vertical pill thumb is rendered inside the right edge of the fill:
     `absolute right-2 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-white/45`.
     Read-only progress bars (`trackMode === 'progress'`) omit this thumb.
3. **Invariant Top-Left Circular Icon (`44px`):**
   * `w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90`
   * Always stops pointer and click propagation (`onPointerDown={(e) => e.stopPropagation()}`, `onClick={(e) => { e.stopPropagation(); onIconClick(e); }}`) so tapping the icon triggers the immediate device action without opening the modal or dragging the slider.
4. **Title & Subtitle Stack:**
   * Title: `text-[15px]` (`text-[13px]` when $C = 1$) `font-bold text-white leading-tight truncate`.
   * Subtitle: `text-[11px] text-white/80 leading-tight mt-0.5 truncate tabular-nums`.
5. **Top-Row Main Buttons (`mainButtons`, Up to 4) & Inline Capacity Math:**
   * Maximum Main Buttons per tile: $4$ (`mainButtons.slice(0, 4)`).
   * Inline capacity (`maxInlineForSpan`) as a function of column span $C$:
     $$\text{maxInlineForSpan}(C) = \begin{cases} 4 & \text{if } C \ge 4 \\ 2 & \text{if } C = 3 \\ 1 & \text{if } C = 2 \\ 0 & \text{if } C = 1 \end{cases}$$
   * Collapse condition: `collapseToDropdown = cappedButtons.length > maxInlineForSpan(C)`.
6. **Main Buttons Translucent Styling Over Sliders:**
   * When `hasSliderUnderneath === true` (`trackMode !== 'none'`):
     * **Active Main Button:** `bg-[#73B7B2]/30 text-teal-50 border border-[#73B7B2]/45 backdrop-blur-[2px] hover:bg-[#73B7B2]/40`
     * **Inactive Main Button:** `bg-black/25 text-white/90 border border-white/10 backdrop-blur-[2px] hover:bg-black/40`
   * When `hasSliderUnderneath === false` (`trackMode === 'none'`):
     * **Active Main Button:** `customActiveClass || 'bg-[#73B7B2] text-[#182C2A]'`
     * **Inactive Main Button:** `'bg-white/[0.08] text-white/85 hover:bg-white/[0.16]'`
7. **Borderless & Backgroundless Main Buttons Dropdown:**
   * **Dropdown Trigger Button:**
     `h-9 px-1.5 flex items-center gap-1 text-xs font-semibold bg-transparent border-0 shadow-none transition-colors`
     Displays `[First Main Button Icon] [Total Count] [ChevronDown]`.
   * **Dropdown Floating Popover Container:**
     `absolute right-0 top-11 z-50 flex flex-col items-end gap-1.5 bg-transparent border-0 p-0 shadow-none`
   * **Individual Main Button Pills Inside Popover:**
     `h-9 px-3.5 rounded-full flex items-center gap-2 text-xs font-semibold whitespace-nowrap shadow-lg backdrop-blur-md transition-all` (using `getMainButtonClass` plus a trailing `<Check className="w-3.5 h-3.5 shrink-0 ml-0.5" />` when active).

### 4.3 Secondary Buttons (`secondaryButtons` — Strictly Row $2+$ Only)

Secondary Buttons live exclusively in Row $2+$ (`mt-auto pt-2.5`) and are completely hidden when $R = 1$:

| Secondary Button Archetype | Height & Geometry | Visual & Behavioral Rules | Example Entities |
| :--- | :--- | :--- | :--- |
| **1. Standard Secondary Oval Pill (`type: 'oval_pill'`)** | `h-[42px] px-4 rounded-full text-[13px] font-semibold gap-2` | Active: `bg-[#73B7B2] text-[#182C2A] shadow-sm`.<br>Inactive: `bg-black/25 hover:bg-black/35 text-white/90`.<br>Icon is placed **to the left** of the label.<br>If a tile has only $1$ Secondary Button (`secondaryBtns.length === 1`), it is **right-aligned** (`ml-auto min-w-[148px]`). | `salon` (`Lampa`, `Grzybek`), `kuchnia` (`okno i salon`), `pompa ciepła`, `oczyszczacz`, `lodówka Samsung`, `piekarnik & płyta`, `fotowoltaika PV`, `magazyn energii`. |
| **2. Momentary / Scene Ghost Pill (`type: 'ghost_momentary'`)** | `h-[42px] px-4 rounded-full text-[13px] font-semibold gap-2 ml-auto min-w-[148px]` | Idle: Near-transparent ghost surface (`bg-white/[0.03] hover:bg-white/[0.08] text-white/90`).<br>Icon is placed **to the right** of the label (`LED TV - film [icon]`).<br>Tapped: Flashes `bg-[#73B7B2] text-[#182C2A]` for $650\text{ms}$ (`triggerMomentary`). | `light_tv` (`LED TV - film`). |
| **3. Compact Group Member Pill (`group_tile` members)** | `h-[34px] px-2 rounded-full gap-1.5` in a `grid-cols-4 gap-2` sub-grid | Shorter $34\text{px}$ height to visually distinguish group member toggles from $42\text{px}$ independent sub-entity pills.<br>Active: `bg-[#73B7B2] text-[#1D3130]`.<br>Inactive: `bg-black/25 text-white/60`.<br>Displays icons only at $C = 2$; reveals member labels (`Kanapa`, `Sypialnia`, `Biuro L`, `Biuro P`) at $C \ge 4$. | `group_roslinki` (`roślinki` when expanded `↓` to $2 \times 2$). |
| **4. Sideways-Expanded Secondary Sliders ($C \ge 4$)** | `h-[44px] rounded-full bg-black/35 p-1 cursor-ew-resize` | When a `slider_light` tile with `oval_pill` Secondary Buttons is expanded sideways to $C \ge 4$ (e.g., `salon` at $4 \times 2$), each pill automatically morphs into a horizontally draggable slider with a `rgba(115, 183, 178, 0.85)` fill bar and live percentage readout (`75%`, `60%`). | `light_salon` (`Lampa` & `Grzybek` at $4 \times 2$). |
| **5. Appliance Programme & Modifier Pills** | `h-9 px-3.5 rounded-full text-xs` | Left pill: Programme selector (`bg-black/25 hover:bg-black/40 text-teal-200 font-semibold` with `ChevronDown`, cycling `Intensywny 70°C` $\rightarrow$ `Auto 45-65°C` $\rightarrow$ `Eco 50°C` $\rightarrow$ `Szybki 45°C`).<br>Right pills: 3 toggleable cycle modifiers (`Clean+`, `Speed+`, `Dry+` or `Solar PV`, `V2H 11kW`, `Limit 80%`). | `appliance_zmywara`, `appliance_pralka`, `ev_wallbox`. |
| **6. Embedded Secondary Slider Row (`EmbeddedSliderRow`)** | `h-9 rounded-full bg-black/35 p-1 cursor-ew-resize` | Full-width horizontal secondary slider in Row $2$ or Row $3$ for auxiliary continuous parameters (Color Temperature `2200 K – 6000 K`, AC Fan Speed `%`, Receiver Volume `%`, or Blind Lamella Tilt `0° – 90°`). | `light_salon` ($R = 3$), `ac_salon` ($R = 2$), `media_tv` ($R = 2$), `cover_roleta` ($C = 4$). |

---

## 5. Interaction Disambiguation, Opt-In Ghost Expanders & Composition Physics

### 5.1 Three-Way Pointer Disambiguation State Machine

Every tile implements deterministic pointer handling so icon taps, slider drags, and modal opens never conflict:

1. **Icon Tap (`onClick` on the $44\text{px}$ circular button):**
   * Calls `e.stopPropagation()` on both `onPointerDown` and `onClick`.
   * Executes the immediate primary action on the device:
     * `slider_light`: toggles `on: !curr.on`.
     * `group_tile`: if any member is active, turns all members OFF; if all are OFF, turns all members ON.
     * `scene_pill`: flashes `#73B7B2` for $650\text{ms}$ and toggles `active`.
     * `vertical_blind`: toggles `position` between `0%` and `100%`.
     * `sensor_graph`: cycles footprint $1 \times 1 \rightarrow 2 \times 2 \rightarrow 3 \times 3 \rightarrow \text{defaultSpan}$.
     * `hvac_global_modes`: toggles all HVAC modes ON/OFF.
     * `simple_thermostat`: quick-toggles heating between `24.0 °C (55% demand)` and `19.0 °C (0% demand)`.
     * `rich_ac_row` / `stateful_tv` / `robot_vacuum_tile`: toggles `on: !curr.on`.
     * `stateful_dishwasher`: cycles `idle` $\rightarrow$ `running` $\leftrightarrow$ `paused`.
     * `webrtc_camera_tile`: toggles `privacy: !curr.privacy`.
     * `closure_lock_tile`: toggles `locked: !curr.locked`.
     * `matter_smoke_alarm`: toggles ceiling bracket mount state (`mounted: !curr.mounted`), triggering or clearing the Matter 1.6 Unmounted Alert.
     * `matter_event_history`: toggles `armed: !curr.armed`.
     * `matter_fabric_hub`: simulates Pre-Powered NFC Commissioning, incrementing `threadNodes` and displaying a confirmation toast.
2. **Slider Drag (`onPointerDown` / `onPointerMove` / `onPointerUp`):**
   * On `SliderLightTile`, pointer down records $(x_0, y_0)$ and captures the pointer (`setPointerCapture`). If $|\Delta x| > 6\text{px}$, `movedRef.current = true` and `brightness` updates continuously from the pointer's relative $X$ coordinate ($1\%–100\%$, setting `on: true`).
   * On `VerticalBlindTile`, if $|\Delta y| > 5\text{px}$, `movedRef.current = true` and `position` updates continuously from the pointer's relative $Y$ coordinate ($0\%–100\%$).
3. **Tile Body Tap (`!movedRef.current` on pointer release):**
   * If the pointer is released with movement $\le 6\text{px}$ (not a drag), `setModalEntityId(ent.id)` is called, opening the **Deep-Dive Configuration & Matter 1.6 Endpoint Modal**.

### 5.2 Opt-In Ghost Directional Expanders (`TileGhostChrome`)

Cards do **not** show expanders unless enabled in `ent.expanders = { down: boolean, right: boolean, diagonal: boolean }`. Users can toggle which expanders appear on any card inside its Deep-Dive Modal.

| Direction | Property | Edge Position Class | Icon & Active State | Span Cycle Logic (`handleExpandTile`) |
| :--- | :--- | :--- | :--- | :--- |
| **Down (`↓`)** | `expanders.down` | `absolute bottom-0.5 left-1/2 -translate-x-1/2 z-30 w-6 h-5` | `ChevronDown` (`w-3.5 h-3.5`). Rotates `180deg` and turns `#73B7B2` when `r > defaultSpan.r`. | Cycles $R: 1 \rightarrow 2 \rightarrow 3 \rightarrow R_{\text{default}}$ (respecting $R_{\min} = 3$ for `vertical_blind`). |
| **Right (`→`)** | `expanders.right` | `absolute right-0.5 top-1/2 -translate-y-1/2 z-30 w-5 h-6` | `ChevronRight` (`w-3.5 h-3.5`). Rotates `180deg` and turns `#73B7B2` when `c > defaultSpan.c`. | Cycles $C: 1 \rightarrow 2 \rightarrow 3 \rightarrow 4 \rightarrow C_{\text{default}}$ (respecting $C_{\min} = 2$ for all slider-based tiles). |
| **Diagonal (`↘`)** | `expanders.diagonal` | `absolute bottom-1 right-1.5 z-30 w-5 h-5` | `ArrowDownRight` when default; `ArrowUpLeft` in `#73B7B2` when modified. | For `sensor_graph`, steps $1 \times 1 \rightarrow 2 \times 2 \rightarrow 3 \times 3 \rightarrow \text{defaultSpan}$. For other tiles, expands both $C$ and $R$ or resets to `defaultSpan`. |

### 5.3 Tile Composition Engine (`handleDropTileOnTile` — Rules A, B & C)

Tiles can be combined either by dragging a non-slider tile onto another tile or by clicking the one-tap `→ {other.title}` buttons inside the Deep-Dive Modal:

* **Rule A — Simple Entity Dropped onto Simple Entity or `slider_light`:**
  * `isSimpleEntity(ent)` returns `true` for tiles without nested children that are `slider_light` (with 0 secondary buttons), `scene_pill`, `simple_thermostat`, `closure_lock_tile`, `matter_smoke_alarm`, or `sensor_graph`.
  * Dropping a simple tile onto another simple tile or `slider_light` opens the **Rule A Choice Modal (`pendingMergeChoice`)** with two options:
    1. **`Zgrupuj i steruj razem` (`executeRuleAGroupTogether`) — APPROVED SIZING DECISION:** Merges both entities into the existing target tile without reducing its width. The resulting span is `span: { c: Math.max(2, curr.span.c), r: curr.span.r }`, subject to any larger minimum height required by the resulting archetype. Thus target widths $1, 2, 3, 4$ become $2, 2, 3, 4$ respectively; **a $3 \times R$ or $4 \times R$ host must never be forced down to $2 \times R$**. The source tile’s dimensions do not determine the result. The merged entity receives `title: "${target.title} + ${source.title}"`, combines ON state (`curr.on || sourceEnt.on`), and averages brightness (`Math.round(((curr.brightness || 50) + (sourceEnt.brightness || 50)) / 2)`). Removes `sourceId` from the lane. **Owner approval: 26 October 2026; resolved, not an open question.**
    2. **`Dodaj jako przycisk dodatkowy (Secondary button)` (`executeRuleAAddAsSecondaryButton`):** Converts `sourceEnt` into a new `oval_pill` (`{ id: "sec_${sourceEnt.id}", label: sourceEnt.title, icon: sourceEnt.iconType === 'mdi' ? sourceEnt.icon : 'table-lamp', active: Boolean(sourceEnt.on || sourceEnt.active), brightness: sourceEnt.brightness ?? 60, type: 'oval_pill' }`) inside the target tile's `secondaryButtons` array, expands the target tile to at least $2 \times 2$ (`span: { c: Math.max(2, curr.span.c), r: Math.max(2, curr.span.r) }`), enables its `down` and `right` expanders, sets `expandedContent.secondaryButtons = true`, and removes `sourceId` from the lane.
* **Rule B — Complex Entity Dropped onto Any Entity (`nestedTiles` & `renderNestedDrawer`):**
  * Appends `sourceId` to the target entity's `nestedTiles` array, enables `down` and `right` expanders on the target, and removes `sourceId` from the lane.
  * **Exact Nested Drawer Layout Specification (`renderNestedDrawer()`):** When the host tile has `nestedTiles.length > 0`, is expanded (`c > defaultSpan.c || r > defaultSpan.r`), and has `r >= 2`, `renderNestedDrawer()` renders at the bottom of the host tile:
    * **Outer Drawer Container:** `relative z-20 mt-2.5 pt-2.5 border-t border-white/10 flex flex-col gap-2` (with `onPointerDown` and `onClick` stopping propagation).
    * **Header Row & Count Label:** `flex items-center justify-between text-[11px] text-[#73B7B2] font-semibold px-1` containing `<CornerDownRight className="w-3 h-3" />` and the count label `Zagnieżdżone kafelki ({ent.nestedTiles.length})`.
    * **Nested 4-Column Grid:** `grid grid-cols-4 gap-2`, where each nested child ID is rendered via `renderWidget(nestedId, true)` (forcing `col-span-4`, `row-span-1`, and `minHeight: '68px'` inside the drawer).
    * **Unnesting (`handleUnnestTile`):** Inside the host tile's Deep-Dive Modal, each nested child is listed in a `bg-white/[0.05] px-3.5 py-2.5 rounded-2xl` row with a `Wypnij z powrotem na siatkę` button (`text-xs text-[#73B7B2] hover:underline`) that removes the child from `nestedTiles` and appends it back to its room swimlane `entityIds`.
* **Rule C — Sensor Graph Dropped onto Sensor Graph:**
  * When both `sourceEnt` and `targetEnt` have `type === 'sensor_graph'`, their `series` arrays are deduplicated by `id` and merged onto `targetEnt`, the title becomes `"${curr.title.replace(' 24h', '')} + ${sourceEnt.title.replace(' 24h', '')}"`, the footprint expands to $3 \times 3$ (`span: { c: Math.max(3, curr.span.c), r: Math.max(3, curr.span.r) }`), and `sourceId` is removed from the lane—immediately producing a multi-sensor $3 \times 3$ analytical chart with a color-coded legend.

---

## 6. Complete Widget Taxonomy & Component Specifications (All 17 Widget Archetypes + Controls & Modal)

The reference implementation defines **17 distinct widget archetypes** (`ent.type` values) across the 45 entities, plus the floating prototype controls bar and the deep-dive configuration modal:

### 6.1 `slider_light` — Dimmable / Color Light, Smart Plug, Smart Speaker, Heat Pump, Air Purifier, Fridge & Oven
* **Minimum Width:** $C \ge 2$ (`enforcedColSpanClass` clamps $C \in \{2, 3, 4\}$).
* **Surface:** `#303030` (`rounded-[30px] p-3`).
* **Top Row:**
  * Icon class when `on === true`: `bg-amber-400/35 text-amber-200`; when `off`: `bg-white/[0.09] text-white/70 hover:bg-white/[0.15]`.
  * Track: `trackMode="slider"`, `trackActive={ent.on}`, `trackPct={ent.brightness}`, `trackColorClass="bg-gradient-to-r from-amber-500/45 to-amber-400/35"`.
  * Subtitle: If `customSubtitle` is defined, displays `"${brightness}% • ${customSubtitle}"` when ON and `"wyłączono"` when OFF. Otherwise displays `"${brightness}%"` (plus `" • ${powerWatts}"` if `powerWatts` is defined) when ON, and `"wyłączono"` when OFF.
* **Bottom Bar ($R \ge 2$):**
  * Renders `secondaryButtons` in a 1-column (`ml-auto min-w-[148px]`) or 2-column (`grid-cols-2 gap-2.5`) grid.
  * When $C \ge 4$, non-momentary `secondaryButtons` morph into `h-[44px]` interactive sub-sliders.
  * When $R \ge 3$ and `ent.colorTemp` is defined, renders an `EmbeddedSliderRow` for `Temperatura barwowa` (`2200 K – 6000 K`).

### 6.2 `group_tile` — Entity Group Master Switch (`roślinki`)
* **Surface:** Dynamic background color—`#31537A` (slate-blue) when `anyActive === true` ($\ge 1$ member ON), `#303030` when all members are OFF.
* **Top Row:**
  * Icon class when `anyActive`: `bg-[#2C3745] text-[#73B7B2]`; when all OFF: `bg-white/[0.08] text-white/60`.
  * Subtitle: `"${activeCount}/${ent.members.length} • ${ent.soilMoisture || 'Aktywne'}"`.
  * Track: `trackMode="progress"`, `trackActive={anyActive}`, `trackPct={(activeCount / members.length) * 100}`, `trackColorClass="bg-[#73B7B2]/30"`.
* **Bottom Bar ($R \ge 2$):**
  * Renders `ent.members` in a `grid-cols-4 gap-2` row of compact `h-[34px]` pills (`bg-[#73B7B2] text-[#1D3130] shadow-sm` when active; `bg-black/25 text-white/60 hover:bg-black/35` when inactive).

### 6.3 `scene_pill` — Compact Scene Recall Pill (`Sen`)
* **Footprint:** Allowed at $1 \times 1$ (since it has no slider).
* **Top Row:**
  * Icon class when flashing or active: `bg-[#73B7B2] text-[#182C2A]`; when idle: `bg-white/[0.08] text-white/75`.
  * Subtitle: `null` when $C = 1$; `'aktywna'` or `'scena'` when $C \ge 2$.
  * Track: `trackMode="progress"`, `trackActive={isFlashing}`, `trackPct={100}`, `trackColorClass="bg-[#73B7B2]/35"`.

### 6.4 `vertical_blind` — Window Covering with Left-Side Vertical Slider (`roleta`)
* **Minimum Footprint:** Strictly $2 \times 3$ (`c = Math.max(2, ent.span.c)`, `r = 3`, `minHeight: '216px'`).
* **Left-Side Oversized Vertical Slider Capsule:**
  * Container: `absolute top-2 bottom-2 left-2 w-[52px] rounded-full bg-black/30 overflow-hidden pointer-events-none`.
  * Fill: `absolute inset-x-0 top-0 rounded-full bg-gradient-to-b from-[#3B6E6C]/80 to-[#73B7B2]/55 transition-all duration-100`.
  * Height formula:
    $$\text{height} = \text{calc}\left(52\text{px} + (100\% - 52\text{px}) \times \frac{\text{position}}{100}\right)$$
  * Bottom drag thumb inside fill: `absolute bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-white/50`.
* **Top Row:** $44\text{px}$ `window-shutter` icon at `top: 12px, left: 12px` (`bg-[#73B7B2] text-[#182C2A]` when `position > 0`; `bg-white/[0.1] text-white/75` when `0%`) + title (`roleta`), subtitle (`"${position}% • Lamele ${tilt}°"`), and borderless Main Buttons dropdown on the right.
* **Right-Hand Secondary Controls (`pl-[54px]` in Rows 2–3):**
  * 3 stacked full-width `h-9 px-3 rounded-full` buttons: `Otwórz 100%` (`ArrowUp`), `Stop / 50%` (`Pause`), and `Zamknij 0%` (`ArrowDown`).
  * When expanded sideways to $C = 4$ ($4 \times 3$), reveals an `EmbeddedSliderRow` for `Kąt nachylenia lameli` (`0° – 90°`).

### 6.5 `sensor_graph` — Elastic Sensor & 24h Mini-Graph Card (`1x1` $\rightarrow$ `2x2` $\rightarrow$ `3x3`)
* **Surface:** `#2E3440` (`rounded-[30px] p-3 overflow-hidden`).
* **Top Row:**
  * Icon class: `bg-[#3B4454] text-[#60A5FA]`. Tapping the icon cycles footprints $1 \times 1 \rightarrow 2 \times 2 \rightarrow 3 \times 3 \rightarrow \text{defaultSpan}$.
  * Subtitle: When $C < 2$ or $R < 2$ ($1 \times 1$ or $2 \times 1$), displays live compact telemetry `"${primary.current} ${primary.unit}"` (plus `" • ${secondary.current} ${secondary.unit}"` if $C \ge 2$). When $C \ge 2$ and $R \ge 2$ (graph visible), displays `"Ostatnie 24h"`.
* **$2 \times 2$ and $3 \times 3$ Big Readouts:**
  * Left primary value: `text-2xl sm:text-[26px] font-light tracking-tight text-white tabular-nums` + unit (`text-xs font-medium text-white/65`).
  * Right secondary value(s): If 2 series, renders the second series at `text-2xl sm:text-[26px] font-light` on the right. If $> 2$ series (such as `temperatura i grzanie 24h`), stacks series $2 \dots N$ on the right in `text-xs text-white/85 tabular-nums`.
  * Interactive Hover Scrubbing: Moving the pointer horizontally across the SVG graph updates `hoverIdx` ($0 \dots 11$), dynamically updating all displayed numeric readouts to the historical value at that point in the 24h timeline.
* **$3 \times 3$ Analytical Header (`c >= 3 && r >= 3`):**
  * **Color-Coded Legend:** Centered row of `w-2.5 h-2.5 rounded-full` color dots + series labels (`salon`, `biuro`, `sypialnia`) plus a `w-2.5 h-2.5 rounded-sm bg-[#6E2E3A]` square for `grzanie %` if `steppedAreaPoints` is present.
  * **Min / Max Extremes Row:** Displays `Min: {primary.min} {primary.unit} ({primary.minTime})` on the left and `Max: {primary.max} {primary.unit} ({primary.maxTime})` on the right.
* **24h SVG Graph Canvas (`viewBox="0 0 300 100"`):**
  * Bleeds cleanly to the bottom and side edges of the card (`-mx-3 -mb-3 mt-auto w-[calc(100%+24px)]`, height `68px` on $2 \times 2$ and `112px` on $3 \times 3$).
  * **Corner Y-Axis Marking Pills:** Translucent dark pills (`px-2 py-0.5 rounded-full bg-black/45 text-[10px] font-semibold text-white/85 tabular-nums`) in the top-left (`leftAxisMax`), bottom-left (`leftAxisMin`), top-right (`rightAxisMax`), and bottom-right (`rightAxisMin`).
  * **X-Axis Timeline Labels ($3 \times 3$):** `-24h`, `-12h`, `-6h`, `Teraz` centered along the bottom edge.
  * **Smooth Cubic-Bezier Curve Generation (`buildSmoothPath`):** Normalizes each 12-point array between `minVal` and `maxVal` and constructs smooth cubic bezier segments `C cx y0, cx y1, x1 y1` with `strokeWidth="2.6"` (primary) and `"2.0"` (secondary), plus optional `fillOpacity="0.22"` area fills (`s.fill === true`) and stepped heating background fills (`buildSteppedArea` in `rgba(122, 46, 58, 0.45)`).

### 6.6 `matter_context_tile` — Matter 1.6 Ambient Context AI Sensor (`kontekst AI`)
* **Surface:** `#2B3F46` when `active === true`, `#303030` when muted.
* **Top Row:** `Eye` / `EyeOff` icon (`bg-[#73B7B2] text-[#182C2A]` when `active`; `bg-white/[0.09] text-white/60` when muted) + subtitle (`"2 osoby • Relaks na kanapie"` when active; `"Czujnik prywatności wyciszony"` when muted) + 3 inline Main Buttons (`mmWave`, `Audio AI`, `Sugestie`).
* **Bottom Bar ($R \ge 2$):** Shows local audio context pill (`Dźwięk: Cicha muzyka • Brak alarmów`) and predictive scene pill (`Sugestia: Scena Film o 20:30`).

### 6.7 `hvac_global_modes` — Global HVAC Coordinator (`Tryb HVAC`)
* **Top Row:** `plug-off` icon + subtitle (`"Grzanie + Auto"`, `"Chłodzenie"`, or `"Wyłączone"`) + 3 Main Buttons: `Chłodzenie` (`Snowflake`, active `bg-[#3B82A6] text-white`), `Auto` (`Plug`, active `bg-[#73B7B2] text-[#1A2E2C]`), and `Grzanie` (`Flame`, active `bg-[#D96B27] text-[#1E120A]`).

### 6.8 `simple_thermostat` — Matter 1.6 Thermostat with Suggestions & Water Heater (`biuro`, `salon`, `sypialnia`, `bojler CWU`)
* **Top Row:**
  * `Thermometer` icon (`bg-amber-500/35 text-amber-200` when `demand > 0`; `bg-white/[0.08] text-white/65` when `demand === 0`).
  * Subtitle: `"${targetTemp.toFixed(1).replace('.', ',')} °C • ${demand}%"`.
  * Track: `trackMode="progress"`, `trackActive={demand > 0}`, `trackPct={demand}`, `trackColorClass="bg-[#9E5231]/75"` (terracotta heating demand fill).
  * Main Buttons: `Obniż (-0,5°C)` (`Minus`), `Podwyższ (+0,5°C)` (`Plus`), and optional `Sugestia {suggestedTemp}°C` (`Sparkles`).
* **Bottom Bar ($R \ge 2$):**
  * **Matter 1.6 Suggestion Banner:** Displays `"Matter 1.6: {source} ({suggestedTemp}°C)"` with a one-tap `Przyjmij` button.
  * **Preset Pills:** 3-column row (`Eco 19°C`, `Komfort 22°C`, `Boost 25°C`).

### 6.9 `rich_ac_row` — Full-Width Room Air Conditioner (`ac_salon`, `ac_sypialnia`)
* **Top Row ($4 \times 1$):**
  * `Snowflake` icon (`bg-[#73B7B2] text-[#182C2A]` when `on`; `bg-white/[0.09] text-white/70` when `off`) + subtitle `"${measuredTemp} °C → Cel ${targetTemp} °C"`.
  * Track: `trackMode="slider"`, `trackActive={ent.on}`, `trackPct={ent.fanSpeedPct}`, `trackColorClass="bg-gradient-to-r from-[#2D6880]/65 to-[#73B7B2]/45"`.
  * 4 Inline Main Buttons: `Swing` (`ac-swing`), `Wentylator` (`Fan`), `Jonizacja` (`ionizer`), and target temperature stepper badge (`22,0°C` / `20,5°C`).
* **Bottom Bar ($R \ge 2$):** Renders an `EmbeddedSliderRow` for `Prędkość turbiny nawiewu` (`0% – 100%`).

### 6.10 `stateful_tv` — Matter 1.6 Casting Video Player (`media_tv`)
* **Top Row ($4 \times 1$):**
  * `Tv` icon (`bg-[#73B7B2] text-[#182C2A]` when `on`; `bg-white/[0.09] text-white/65` when `off`) + subtitle (`"${source} • Głośność ${volume}%"` when ON; `"wyłączono"` when OFF).
  * Track: `trackMode="slider"`, `trackActive={ent.on}`, `trackPct={ent.volume}`, `trackColorClass="bg-gradient-to-r from-indigo-500/45 to-[#73B7B2]/45"`.
  * 3 Inline Main Buttons: Source cycler (`Netflix` $\rightarrow$ `PS5` $\rightarrow$ `Matter Cast`), `Pauza`/`Odtwarzaj`, and `Zasilanie` (`Power` in `bg-rose-500/35 text-rose-100`).
* **Bottom Bar ($R \ge 2$):** `EmbeddedSliderRow` for `Głośność amplitunera`.

### 6.11 `stateful_dishwasher` — Stateful Cycle Appliance (`zmywara`, `pralka`, `ładowarka EV Wallbox`)
* **Top Row ($4 \times 2$):**
  * **Icon & State Styling:**
    * Renders `<Car className="w-5 h-5" />` when `ent.iconName === 'ev-car'`, or `<MdiIcon name={ent.iconName || 'door-closed'} className="w-5 h-5" />` (`door-closed` for `zmywara`, `washing-machine` for `pralka`).
    * **Icon Class when Running / Paused (`!isIdle`):** `bg-[#73B7B2] text-[#182C2A]`.
    * **Icon Class when Idle (`isIdle`):** `bg-white/[0.09] text-white/70`.
  * **Idle State (`state === 'idle'`):**
    * Subtitle: `'zamknięto • gotowe'`.
    * Progress Capsule: `trackMode="progress"`, `trackActive = false` (`0px`).
    * Main Buttons:
      1. `Start za {delay}` (`Clock`, `showLabel: true`, cycles `DELAY_OPTIONS = ['0:00', '1:00', '2:00', '4:00']`).
      2. `Start!` (`Play`, `showLabel: true`, active $\rightarrow$ transitions to `state: 'running', progress: 24, remainingMinutes: 82`).
  * **Running / Paused State (`state === 'running' | 'paused'`):**
    * Subtitle: `"${state === 'paused' ? 'Wstrzymano' : 'W trakcie'} • ${remainingMinutes} min (${progress}%)"`.
    * Progress Capsule: `trackMode="progress"`, `trackActive = true`, `trackPct = progress`, `trackColorClass="bg-[#3B6E6C]/70"`. (A live `2200ms` timer increments `progress` and updates `remainingMinutes`).
    * Main Buttons:
      1. `Pauza` / `Wznów` (`Pause` / `Play`, `showLabel: true`, active).
      2. `Zakończ` (`Square`, `showLabel: true`, inactive $\rightarrow$ resets to `state: 'idle', progress: 0`).
* **Bottom Bar ($R \ge 2$):**
  * **Left Programme Selector Pill:** `h-9 px-3.5 rounded-full bg-black/25 hover:bg-black/40 text-xs font-semibold text-teal-200 flex items-center gap-1.5` with trailing `ChevronDown`. Clicking cycles through the 4 canonical programmes in `PROGRAMME_OPTIONS`:
    1. `'Intensywny 70°C'`
    2. `'Auto 45-65°C'`
    3. `'Eco 50°C'`
    4. `'Szybki 45°C'`
  * **Right Modifier Secondary Buttons:** 3 toggleable pills (`h-9 px-3.5 rounded-full text-xs font-medium`, `bg-[#73B7B2] text-[#1A2E2C]` when active; `bg-white/[0.05] hover:bg-white/[0.1] text-white` when inactive):
    * For `zmywara` and `pralka`: `Clean+` (`Sparkles`), `Speed+` (`Clock`), `Dry+` (`Wind`).
    * For `ev_wallbox` (`iconName === 'ev-car'`): `Solar PV` (`Sparkles`), `V2H 11kW` (`Clock`), `Limit 80%` (`Wind`).

### 6.12 `robot_vacuum_tile` — Matter Robotic Vacuum & Mop (`robot_roborock`)
* **Top Row ($4 \times 1$):** `robot-vacuum` MDI icon (`bg-[#73B7B2] text-[#182C2A]` when `on`; `bg-white/[0.09] text-white/70` when docked) + subtitle (`"${mode} • Bateria ${battery}%"` when running; `"W stacji dokującej • ${battery}%"` when off) + read-only progress capsule (`52%`, `bg-[#3B6E6C]/65`) + 3 inline room-zone Main Buttons (`Salon`, `Kuchnia`, `Hol`).

### 6.13 `webrtc_camera_tile` — Matter 1.5.1/1.6 WebRTC Camera & Video Doorbell (`kamera podjazd`, `wideodomofon`)
* **Surface:** `#26292E` (`2x2`).
* **Top Row:** `Camera` / `EyeOff` icon (`bg-[#73B7B2] text-[#182C2A]` when `!privacy`; `bg-rose-500/30 text-rose-200` when `privacy`) + PTZ preset subtitle (`'WebRTC wył.'` when `privacy`, else `ent.ptzPreset`) + 2 Main Buttons (`Preset PTZ`, `Prywatność`).
* **Bottom Bar ($R \ge 2$):** AI detection event pill (`Osoba (19:42) • Samochód` or `Paczka pod drzwiami (16:15)`) on the left + pulsing emerald `LIVE` badge on the right when `privacy === false`.

### 6.14 `closure_lock_tile` — UWB/Aliro Lock, Garage Closure & Irrigation Valve (`zamek główny`, `brama garażowa`, `zawór wody & ogród`)
* **Top Row ($2 \times 1$):** `Lock` / `Unlock` icon (`bg-[#73B7B2] text-[#182C2A]` when unlocked/open; `bg-white/[0.09] text-white/75` when locked/closed) + state & actor subtitle (`"${locked ? 'Zamknięte' : 'Otwarte'} • ${lastActor}"`) + `bg-[#3E5448]/85` travel progress capsule when unlocked/open (`65%` on `brama garażowa`, `100%` on `zawór wody & ogród`).

### 6.15 `matter_smoke_alarm` — Matter 1.6 Smoke & CO Alarm with Mount Sensor (`czujnik dymu i CO`)
* **Top Row ($2 \times 1$):** `AlertTriangle` icon (`bg-emerald-500/20 text-emerald-300` when `mounted === true`; `bg-amber-400 text-black` when unmounted). Tapping the icon simulates unmounting the unit from its ceiling bracket, switching the subtitle from `"Zamontowany w uchwycie • CO ${coPpm} ppm"` to `'UWAGA: Zdjęto z uchwytu sufitowego!'` and filling the Top Row with a crimson `bg-rose-600/55` alert capsule.

### 6.16 `matter_event_history` — Matter 1.6 Standardized Security Event History (`historia zdarzeń (Matter 1.6)`)
* **Surface:** `#303030` (`4x1` default footprint with `down: true` expander).
* **Top Row ($4 \times 1$):** `History` icon (`bg-[#73B7B2] text-[#182C2A]` when `armed === true`; `bg-white/[0.09] text-white/70` when disarmed) + title (`historia zdarzeń (Matter 1.6)`) + latest event subtitle (`"${events[0]?.time} — ${events[0]?.label}"`, i.e., `22:14 — Drzwi tarasowe: Zamknięto (Szczelne)`).
* **Bottom Bar ($R \ge 2$ when expanded `↓` to $4 \times 2$):** Renders `mt-auto pt-2.5 space-y-1.5` containing chronological event pills (`text-xs text-white/80 flex items-center justify-between bg-black/25 px-3 py-1.5 rounded-full`) with event description on the left and `font-mono text-[#73B7B2]` timestamp on the right.

### 6.17 `matter_fabric_hub` — Matter 1.6 Joint Fabric, Thread 1.4 HRAP & NFC Commissioning Hub (`sieć Matter 1.6 Joint Fabric`)
* **Surface:** `#2B3B4E` (`4x1` default footprint with `down: true` expander).
* **Top Row ($4 \times 1$):** `Radio` icon (`bg-[#73B7B2] text-[#182C2A]`) + title (`sieć Matter 1.6 Joint Fabric`) + subtitle (`"Thread 1.4 (${threadNodes} węzłów) • Wspólny Datastore"`).
* **Icon Tap Action:** Simulates **Matter 1.6 Pre-Powered NFC Commissioning**, incrementing `threadNodes` (`64` $\rightarrow$ `65`) and displaying the toast `'Zbliżono telefon NFC: Sparowano nowe urządzenie Matter 1.6 bez zasilania!'`.
* **3 Inline Main Buttons:** `Home Assistant`, `Apple Home`, and `Google Home` (`Wifi` icon, `showLabel: true`, `active: true`). Tapping any ecosystem button shows a toast confirming Joint Fabric datastore key synchronization.

### 6.18 Floating Prototype Controls Bar & Deep-Dive Configuration Modal
* **Floating Prototype Controls Bar (`fixed bottom-3 left-4 z-40`):**
  1. **Orientation Toggle:** Switches between `Portrait (Ikona = Akcja • Kafelek = Modal • Przesuń pokój)` and `Landscape (Nest Hub)`.
  2. **Portrait Room Title Position Toggle (visible in Portrait):** Switches `Tytuł pokoju: U góry` $\leftrightarrow$ `Po lewej`.
  3. **Reset Button (`Resetuj`):** Restores `INITIAL_ENTITIES` and `INITIAL_LANES`.
* **Deep-Dive Configuration Modal (Spawned by tapping any tile body):**
  * Backdrop: `fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4`.
  * Modal Card: `w-full max-w-lg bg-[#252525] rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`.
  1. **Header (`bg-[#2C2C2C] px-6 py-4`):** Entity title, `matterType`, current `{c}×{r}` span, and close (`X`) button.
  2. **Grid Footprint Selector (`Rozmiar kafelka na siatce (C × R)`):** Renders the exact permitted $C \times R$ size pills based on widget type:
     * **For `vertical_blind` (`modalEntity.type === 'vertical_blind'`):**
       `2×3`, `3×3`, `4×3` (`[{ c: 2, r: 3 }, { c: 3, r: 3 }, { c: 4, r: 3 }]`).
     * **For Horizontal Slider Widgets (`isSliderBasedEntity(modalEntity)` — `slider_light`, `rich_ac_row`, `stateful_tv`):**
       `2×1`, `2×2`, `3×2`, `4×1`, `4×2` (`[{ c: 2, r: 1 }, { c: 2, r: 2 }, { c: 3, r: 2 }, { c: 4, r: 1 }, { c: 4, r: 2 }]`), accompanied by the helper label `• Suwaki wymagają min. szerokości 2× (C ≥ 2)`.
     * **For All Non-Slider Widgets (`scene_pill`, `sensor_graph`, `group_tile`, `simple_thermostat`, `hvac_global_modes`, `stateful_dishwasher`, `robot_vacuum_tile`, `webrtc_camera_tile`, `closure_lock_tile`, `matter_smoke_alarm`, `matter_context_tile`, `matter_event_history`, `matter_fabric_hub`):**
       `1×1`, `2×1`, `2×2`, `3×3`, `4×1`, `4×2`, `4×3` (`[{ c: 1, r: 1 }, { c: 2, r: 1 }, { c: 2, r: 2 }, { c: 3, r: 3 }, { c: 4, r: 1 }, { c: 4, r: 2 }, { c: 4, r: 3 }]`).
  3. **Expander Visibility Toggles (`Widoczne strzałki rozwijania na kafelku`):** 3-column grid (`W dół (↓)` / `Środek na dole`, `W bok (→)` / `Środek po prawej`, `Ukośnie (↘)` / `Prawy dolny róg`).
  4. **Expanded Content Toggles (`Co pokazywać po rozwinięciu kafelka`):** 3-column grid (`Przyciski dodatkowe` / `Secondary buttons`, `Dodatkowy suwak` / `Barwa K / Nawiew`, `Szybkie presety` / `Tryby Eco / Komfort`).
  5. **Quick Room Tile Composition (`Połącz lub zagnieźdź z innym kafelkiem w tym pokoju`):** One-tap `→ {other.title}` pills for every other entity in `activeLane.entityIds`.
  6. **Nested Tiles Manager (`Zagnieżdżone kafelki`):** Appears when `modalEntity.nestedTiles.length > 0`, rendering each nested tile's title with a `Wypnij z powrotem na siatkę` action button.
  7. **Live Matter 1.6 JSON Inspector (`Stan JSON kafelka (Matter 1.6 Endpoint)`):** Renders `<pre className="bg-[#181818] p-3.5 rounded-2xl text-[11px] font-mono text-teal-200/90 overflow-x-auto">{JSON.stringify(modalEntity, null, 2)}</pre>` on a `#181818` dark code surface.

---

## 7. Visual Design Tokens, Custom SVG Icons & Declarative JSON Schema

### 7.1 Color & Surface Tokens

| Token Role | Hex / CSS Value | Usage |
| :--- | :--- | :--- |
| `canvas.bg` | `#1C1C1C` | Infinite 2D spatial viewport background (zero borders). |
| `tile.surface.default` | `#303030` | Standard matte widget surface (`rounded-[30px] p-3`). |
| `tile.surface.sensor` | `#2E3440` | Sensor & 24h mini-graph surface (`sensor_graph`). |
| `tile.surface.groupActive` | `#31537A` | Active group master switch surface (`group_roslinki`). |
| `tile.surface.contextActive` | `#2B3F46` | Active Matter 1.6 Ambient Context AI surface (`ambient_context_salon`). |
| `tile.surface.camera` | `#26292E` | WebRTC camera and video doorbell surface. |
| `tile.surface.fabricHub` | `#2B3B4E` | Matter 1.6 Joint Fabric Hub surface. |
| `modal.surface.card` | `#252525` | Deep-Dive Configuration Modal & Rule A Choice Modal surface (`rounded-[32px]`). |
| `modal.surface.header` | `#2C2C2C` | Deep-Dive Configuration Modal header bar. |
| `modal.surface.json` | `#181818` | Matter 1.6 JSON Inspector `<pre>` code block background. |
| `capsule.track.bg` | `rgba(0, 0, 0, 0.30)` | Oversized (`-inset-1`, $52\text{px}$) top-row or left-column slider/progress track. |
| `capsule.fill.light` | `linear-gradient(90deg, rgba(245,158,11,0.45), rgba(251,191,36,0.35))` | Warm amber slider fill for lights, plugs, heat pump, and solar/energy tiles. |
| `capsule.fill.ac` | `linear-gradient(90deg, rgba(45,104,128,0.65), rgba(115,183,178,0.45))` | Cool teal-blue slider fill for AC fan speed. |
| `capsule.fill.tv` | `linear-gradient(90deg, rgba(99,102,241,0.45), rgba(115,183,178,0.45))` | Indigo-to-teal slider fill for TV volume. |
| `capsule.fill.progress` | `rgba(59, 110, 108, 0.70)` | Muted teal fill for appliance progress bars and vertical blinds. |
| `capsule.fill.heatDemand` | `rgba(158, 82, 49, 0.75)` | Terracotta fill for active thermostat heating demand. |
| `accent.primary` | `#73B7B2` | Signature Bubble-Card sage-teal accent for active pills and indicators. |
| `accent.onPrimary` | `#182C2A` | Dark teal contrast text/icon color on `#73B7B2` pills. |

### 7.2 Custom MDI SVG Icon Registry (`MdiIcon` Component)

To guarantee zero external icon dependency failures, the following 17 custom MDI icons are rendered inline (`viewBox="0 0 24 24"`):
* `floor-lamp`: `<path d="M15 2L17 9H7L9 2H15M11 10H13V20H16V22H8V20H11V10Z" />`
* `mushroom`: `<path d="M12 2C6.5 2 2 6.5 2 12H22C22 6.5 17.5 2 12 2M9 6.5C8.2 6.5 7.5 5.8 7.5 5S8.2 3.5 9 3.5 10.5 4.2 10.5 5 9.8 6.5 9 6.5M15.5 8C14.4 8 13.5 7.1 13.5 6S14.4 4 15.5 4 17.5 4.9 17.5 6 16.6 8 15.5 8M9 14H15V20C15 21.1 14.1 22 13 22H11C9.9 22 9 21.1 9 20V14Z" />`
* `led-strip`: `<path d="M3 8.5L20 4.5M3 13L20 9M4 19.5L21 15.5" strokeLinecap="round" />` + 3 LED dots at `(7,9.8)`, `(12,8.6)`, `(17,7.5)`.
* `movie-check`: `<path d="M18 4L20 8H17L15 4H13L15 8H12L10 4H8L10 8H7L5 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H13.1C13 19.7 13 19.3 13 19C13 15.7 15.7 13 19 13C20.1 13 21.1 13.3 22 13.8V6C22 4.9 21.1 4 20 4H18M17.8 22L15 19.2L16.4 17.8L17.8 19.2L21.6 15.4L23 16.8L17.8 22Z" />`
* `pendant-lamps`: `<path d="M7 2H9V7L12 12H4L7 7V2M15 4H17V10L20 15H12L15 10V4M6.5 13.5H9.5C9.5 14.3 8.8 15 8 15S6.5 14.3 6.5 13.5M14.5 16.5H17.5C17.5 17.3 16.8 18 16 18S14.5 17.3 14.5 16.5Z" />`
* `bulbs-off`: `<path d="M2.3 1.7L1 3L5.1 7.1C4.4 8.2 4 9.6 4 11C4 13.8 5.6 16.2 8 17.4V20C8 20.6 8.4 21 9 21H15C15.4 21 15.7 20.8 15.9 20.5L19.7 24.3L21 23L2.3 1.7M12 4C9.8 4 7.9 5 6.6 6.5L16.7 16.6C18.1 15.2 19 13.2 19 11C19 7.1 15.9 4 12 4Z" />`
* `office-chair`: `<path d="M9 2C7.9 2 7 2.9 7 4V11C7 12.1 7.9 13 9 13H11V16H6V14H4V17C4 17.6 4.4 18 5 18H11V20H8V22H16V20H13V18H19C19.6 18 20 17.6 20 17V14H18V16H13V13H15C16.1 13 17 12.1 17 11V4C17 2.9 16.1 2 15 2H9Z" />`
* `table-lamp`: `<path d="M8 2H16L19 11H5L8 2M11 12H13V19H17V21H7V19H11V12Z" />`
* `window-shutter`: `<path d="M3 4H21V8H19V20H17V8H7V20H5V8H3V4M8 9H16V11H8V9M8 12H16V14H8V12M8 15H16V17H8V15M8 18H16V20H8V18Z" />`
* `plug-off`: `<path d="M2.3 1.7L1 3L6 8V12C6 14.8 7.9 17.1 10.5 17.8V21H13.5V17.8C14.3 17.6 15.1 17.2 15.7 16.7L20.7 21.7L22 20.4L2.3 1.7M16 8V3H14V8H11.8L18 14.2C18 13.5 18 12 18 12V8H16M10 3H8V5.2L10 7.2V3Z" />`
* `ac-swing`: `<path d="M4 4H20C21.1 4 22 4.9 22 6V12C22 13.1 21.1 14 20 14H4C2.9 14 2 13.1 2 12V6C2 4.9 2.9 4 4 4M5 10V12H19V10H5M8 16L6 20H8L10 16H8M12 16V21H14V16H12M16 16L18 20H20L18 16H16Z" />`
* `ionizer`: `<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14C0 17.31 2.69 20 6 20H19C21.76 20 24 17.76 24 15 24 12.36 21.95 10.22 19.35 10.04M11 19V15H8L13 8V12H16L11 19Z" />`
* `door-closed`: `<path d="M16 11H18V13H16V11M12 3H19C20.1 3 21 3.9 21 5V19H22V21H2V19H10V5C10 3.9 10.9 3 12 3M12 5V19H19V5H12Z" />`
* `washing-machine`: `<path d="M6 2H18C19.1 2 20 2.9 20 4V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V4C4 2.9 4.9 2 6 2M6 4V6H8V4H6M10 4V6H12V4H10M12 9C9.2 9 7 11.2 7 14S9.2 19 12 19 17 16.8 17 14 14.8 9 12 9M12 11C13.7 11 15 12.3 15 14S13.7 17 12 17 9 15.7 9 14 10.3 11 12 11Z" />`
* `fridge`: `<path d="M7 2H17C18.1 2 19 2.9 19 4V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V4C5 2.9 5.9 2 7 2M7 4V10H17V4H7M7 12V20H17V12H7M8 6H10V9H8V6M8 14H10V18H8V14Z" />`
* `oven`: `<path d="M4 2H20C21.1 2 22 2.9 22 4V20C22 21.1 21.1 22 20 22H4C2.9 22 2 21.1 2 20V4C2 2.9 2.9 2 4 2M6 5C5.4 5 5 5.4 5 6S5.4 7 6 7 7 6.6 7 6 6.6 5 6 5M10 5C9.4 5 9 5.4 9 6S9.4 7 10 7 11 6.6 11 6 10.6 5 10 5M18 5C17.4 5 17 5.4 17 6S17.4 7 18 7 19 6.6 19 6 18.6 5 18 5M5 9V19H19V9H5M7 11H17V17H7V11Z" />`
* `robot-vacuum`: `<path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 4C15.7 4 18.9 6.6 19.7 10H4.3C5.1 6.6 8.3 4 12 4M12 7C11.4 7 11 7.4 11 8S11.4 9 12 9 13 8.6 13 8 12.6 7 12 7M4 12H20C20 16.4 16.4 20 12 20S4 16.4 4 12Z" />`
* `solar-panel`: `<path d="M4 3H20C21.1 3 22 3.9 22 5V15C22 16.1 21.1 17 20 17H13V20H16V22H8V20H11V17H4C2.9 17 2 16.1 2 15V5C2 3.9 2.9 3 4 3M4 5V9H11V5H4M13 5V9H20V5H13M4 11V15H11V11H4M13 11V15H20V11H13Z" />`

### 7.3 Declarative JSON Schema for AI UI Generation

AI agents generating or mutating an Elastic Tile System layout must conform to the following entity contract:

```json
{
  "$schema": "https://ets.smarthome.design/v1.6/tile-schema.json",
  "id": "light_salon",
  "column": "lights",
  "type": "slider_light",
  "matterType": "Matter 1.6 Extended Color Light (0x010D)",
  "title": "salon",
  "iconType": "lucide",
  "icon": "Sofa",
  "on": true,
  "brightness": 68,
  "colorTemp": 3200,
  "span": { "c": 2, "r": 2 },
  "defaultSpan": { "c": 2, "r": 2 },
  "expanders": {
    "down": false,
    "right": true,
    "diagonal": false
  },
  "expandedContent": {
    "secondaryButtons": true,
    "secondarySlider": true,
    "presets": false
  },
  "nestedTiles": [],
  "mainButtons": [
    { "id": "warm", "label": "2700K", "iconType": "lucide", "icon": "Flame", "active": true },
    { "id": "day", "label": "4000K", "iconType": "lucide", "icon": "Sun", "active": false },
    { "id": "night", "label": "Noc 20%", "iconType": "lucide", "icon": "Moon", "active": false }
  ],
  "secondaryButtons": [
    { "id": "lampa", "label": "Lampa", "icon": "floor-lamp", "active": true, "brightness": 75, "type": "oval_pill" },
    { "id": "grzybek", "label": "Grzybek", "icon": "mushroom", "active": true, "brightness": 60, "type": "oval_pill" }
  ]
}
```

---

## 8. Appendix: Complete 5-Page Reference Demo Blueprint & 45-Entity Manifest

This appendix provides the exhaustive, deterministic specification of all **5 pages (swimlanes)** and all **45 smart home entities** in the reference prototype so an AI agent can reconstruct the entire application 1:1 from this `.md` document alone.

### 8.0 Reference Prototype Entity Distribution Summary ($45$ Total Entities)

| Page # | Lane ID | Room / Domain Title | Entity Count |
| :--- | :--- | :--- | :--- |
| **Page 1** | `'lights'` | **Salon & Światła** | **12** |
| **Page 2** | `'climate'` | **Klimat & HVAC** | **16** |
| **Page 3** | `'appliances'` | **Kuchnia & AGD** | **6** |
| **Page 4** | `'security'` | **Bezpieczeństwo** | **7** |
| **Page 5** | `'energy'` | **Energia & Matter 1.6** | **4** |
| **Total** | **5 Swimlanes** | **All Matter 1.6 Domains** | **45 Entities** |

---

### 8.1 Page 1 (`lights`): "Salon & Światła" (12 Entities)
* **Lane ID:** `'lights'`
* **Title:** `'Salon & Światła'`
* **Subtitle:** `'Oświetlenie, grupy, rolety i kontekst AI'`
* **Coordinates:** `{ x: 0, y: 0 }`
* **Ambient Ticker (`4 × 0.5`):**
  * **Lead Icon:** `'Sun'` (Lucide)
  * **Items:**
    1. `{ icon: 'Thermometer', text: '10,99 °C' }`
    2. `{ icon: 'Droplets', text: '74,2%' }`
    3. `{ icon: 'Gauge', text: '981,0 hPa' }`
    4. `{ icon: 'Cloud', text: 'pochmurno' }`
* **Ordered `entityIds` (12 Entities):**
  `['light_salon', 'light_tv', 'light_kuchnia', 'group_roslinki', 'light_lozko', 'light_lampka', 'scene_sen', 'sensor_lux_salon', 'cover_roleta', 'plug_biurko', 'speaker_salon', 'ambient_context_salon']`

#### Page 1 Summary Layout Table
| # | Entity ID | Type & Matter 1.6 Cluster | Default Span ($C \times R$) | Expanders (`↓, →, ↘`) | Title & Icon | Initial State & Subtitle | Top-Row `mainButtons` | Row 2+ `secondaryButtons` / Content |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `light_salon` | `slider_light` (`0x010D` Extended Color Light) | **`2 × 2`** | `right: true` | **salon** (`Sofa`) | `on: true`, `brightness: 68%`, `colorTemp: 3200K`. Subtitle: `68%` | 1. `2700K` (`Flame`, active)<br>2. `4000K` (`Sun`, inactive)<br>3. `Noc 20%` (`Moon`, inactive)<br>*(Collapsed into borderless dropdown `3 ⌄` at `2×2`; inline at `4×2`)* | 1. `Lampa` (`floor-lamp`, active, `75%`, `oval_pill`)<br>2. `Grzybek` (`mushroom`, active, `60%`, `oval_pill`)<br>*(Morph into dual controllable sliders when expanded sideways to `4×2`)* |
| 2 | `light_tv` | `slider_light` (`0x0101` Dimmable Light Strip) | **`2 × 2`** | None | **TV** (`led-strip`) | `on: false`, `brightness: 45%`, `colorTemp: 2700K`. Subtitle: `wyłączono` | 1. `HDMI Sync` (`Tv`, inactive)<br>2. `Bias 6500K` (`Sparkles`, active)<br>*(Collapsed into `2 ⌄` dropdown)* | 1. `LED TV - film` (`movie-check`, inactive, `40%`, `ghost_momentary` — right-aligned ghost pill with icon on right) |
| 3 | `light_kuchnia` | `slider_light` (`0x010C` Color Temp Pendant) | **`2 × 2`** | None | **kuchnia** (`pendant-lamps`) | `on: true`, `brightness: 80%`, `colorTemp: 4000K`. Subtitle: `80%` | 1. `Blat 100%` (`Sun`, active)<br>2. `Kolacja` (`Utensils`, inactive)<br>*(Collapsed into `2 ⌄` dropdown)* | 1. `okno i salon` (`bulbs-off`, inactive, `50%`, `oval_pill` — right-aligned pill) |
| 4 | `group_roslinki` | `group_tile` (`0x0045` Grow Light Group + Soil Sensor) | **`2 × 1`** | `down: true` | **roślinki** (`Sprout`) | Active surface `#31537A`. `4/4` members ON. Subtitle: `4/4 • 64% wilg.` | 1. `Boost UV` (`Sun`, active)<br>2. `Cykl 12h` (`Clock`, active)<br>*(Collapsed into `2 ⌄` dropdown)* | Hidden at `2×1`. Expanding `↓` to `2×2` reveals 4 compact member pills (`h-[34px]`):<br>1. `Kanapa` (`Sofa`, active)<br>2. `Sypialnia` (`Bed`, active)<br>3. `Biuro L` (`office-chair`, active)<br>4. `Biuro P` (`office-chair`, active) |
| 5 | `light_lozko` | `slider_light` (`0x0101` Dimmable Light) | **`2 × 1`** | None | **łóżko** (`led-strip`) | `on: false`, `brightness: 35%`, `colorTemp: 2400K`. Subtitle: `wyłączono` | 1. `Czytanie` (`Sun`, inactive — shown inline at `2×1`) | None |
| 6 | `light_lampka` | `slider_light` (`0x0101` NFC Bulb) | **`2 × 1`** | None | **lampka** (`table-lamp`) | `on: false`, `brightness: 55%`, `colorTemp: 2900K`. Subtitle: `wyłączono` | None | None |
| 7 | `scene_sen` | `scene_pill` (`0x0062` Scene Recall) | **`1 × 1`** | None | **Sen** (`Moon`) | `active: false`. Compact $1 \times 1$ non-slider pill | None | None |
| 8 | `sensor_lux_salon` | `sensor_graph` (`0x0400` Illuminance Sensor) | **`1 × 1`** | `diagonal: true` | **natężenie** (`Sun`) | Surface `#2E3440`. At `1×1` shows subtitle `420 lx`. Expands via `↘` or icon tap to `2×2` and `3×3` | 1. `24h` (`Clock`, active — visible when $C \ge 2$) | **Series 1 (`lux`):** `"Natężenie światła"`, current: `"420"`, unit: `"lx"`, color: `"#FBBF24"`, fill: `true`, min: `"0"` (`03:15`), max: `"890"` (`13:40`), points: `[5, 2, 0, 18, 95, 240, 510, 780, 890, 740, 520, 420]` |
| 9 | `cover_roleta` | `vertical_blind` (`0x0202` Modular Window Covering) | **`2 × 3`** | `right: true` | **roleta** (`window-shutter`) | `position: 65%`, `tilt: 40°`. Subtitle: `65% • Lamele 40°`. Left-side $52\text{px}$ vertical slider capsule | 1. `Lamele 45°` (`Sun`, active)<br>2. `0° Noc` (`Moon`, inactive)<br>*(Collapsed into `2 ⌄` dropdown)* | Right-hand column (`pl-[54px]`) in Rows 2–3:<br>1. `Otwórz 100%` (`ArrowUp`)<br>2. `Stop / 50%` (`Pause`)<br>3. `Zamknij 0%` (`ArrowDown`)<br>*(Plus `Kąt nachylenia lameli` 0°–90° slider at `4×3`)* |
| 10 | `plug_biurko` | `slider_light` (`0x010B` Dimmable Plug + Meter) | **`2 × 1`** | None | **wtyczka biuro** (`Plug`) | `on: true`, `brightness: 100%`, `powerWatts: "142 W"`. Subtitle: `100% • 142 W` | 1. `Auto-Off` (`Clock`, active — inline) | None |
| 11 | `speaker_salon` | `slider_light` (`0x0022` Smart Speaker) | **`2 × 1`** | None | **głośnik Sonos** (`Volume2`) | `on: true`, `brightness: 48%`. Subtitle: `48%` | 1. `Play/Pause` (`Play`, active)<br>2. `AirPlay` (`Radio`, inactive) | None |
| 12 | `ambient_context_salon` | `matter_context_tile` (Matter 1.6 Ambient Context AI) | **`4 × 1`** | `down: true` | **kontekst AI** (`Eye`) | Surface `#2B3F46`, `active: true`. Subtitle: `2 osoby • Relaks na kanapie` | 1. `mmWave` (`Waves`, active)<br>2. `Audio AI` (`Volume2`, active)<br>3. `Sugestie` (`Sparkles`, active)<br>*(All 3 shown inline at `4×1`)* | Expanding `↓` to `4×2` reveals:<br>• `Dźwięk: Cicha muzyka • Brak alarmów`<br>• `Sugestia: Scena Film o 20:30` |

---

### 8.2 Page 2 (`climate`): "Klimat & HVAC" (16 Entities)
* **Lane ID:** `'climate'`
* **Title:** `'Klimat & HVAC'`
* **Subtitle:** `'Termostaty Matter 1.6, wykresy 24h, AC i powietrze'`
* **Coordinates:** `{ x: 1, y: 0 }`
* **Ambient Ticker (`4 × 0.5`):**
  * **Lead Icon:** `'Home'` (Lucide)
  * **Items:**
    1. `{ icon: 'Sofa', text: '24,37 °C  41,8%' }`
    2. `{ icon: 'Bed', text: '22,52 °C  45,9%' }`
    3. `{ icon: 'Building2', text: '23,40 °C  43,5%' }`
* **Ordered `entityIds` (16 Entities):**
  `['sensor_multi_heating_3x3', 'sensor_co2_1x1', 'sensor_balkon_1x1', 'sensor_lazienka_1x1', 'sensor_salon_2x2', 'sensor_biuro_2x2', 'hvac_global', 'thermostat_biuro', 'thermostat_salon', 'thermostat_sypialnia', 'ac_salon', 'ac_sypialnia', 'heat_pump_dom', 'air_purifier_salon', 'water_heater_cwu', 'ventilation_reku']`

#### Page 2 Summary Layout Table
| # | Entity ID | Type & Matter 1.6 Cluster | Default Span ($C \times R$) | Expanders (`↓, →, ↘`) | Title & Icon | Initial State & Subtitle | Top-Row `mainButtons` | Row 2+ `secondaryButtons` / Graph Series Data |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `sensor_multi_heating_3x3` | `sensor_graph` (Multi-Zone Temp & Heating Telemetry 24h) | **`3 × 3`** | `right: true`, `diagonal: true` | **temperatura i grzanie 24h** (`Thermometer`) | Surface `#2E3440`. Subtitle: `Ostatnie 24h`. Left Y-axis: `24,87` / `19,87`; Right Y-axis: `110` / `0`. Stepped heating fill: `[65, 65, 78, 78, 45, 92, 92, 58, 58, 74, 62, 58]` | 1. `Min/Max` (`Activity`, active)<br>2. `Oś Y` (`Gauge`, active)<br>*(Both inline at `3×3`)* | **3 Series + Legend (`salon`, `biuro`, `sypialnia`, `grzanie %`):**<br>• **salon:** `23,14 °C`, `#FF2E4C`, min `19,87` (`05:20`), max `24,87` (`14:10`), pts: `[21.4, 22.1, 22.8, 21.2, 22.4, 23.8, 22.5, 22.3, 22.9, 23.4, 23.1, 23.14]`<br>• **biuro:** `23,35 °C`, `#00F0FF`, min `20,40` (`06:00`), max `24,74` (`13:35`), pts: `[21.1, 21.8, 22.3, 20.6, 22.5, 24.7, 23.9, 22.7, 23.1, 23.2, 23.3, 23.35]`<br>• **sypialnia:** `21,06 °C`, `#7CE38B`, min `19,87` (`04:45`), max `22,93` (`00:30`), pts: `[21.9, 21.8, 20.9, 20.4, 20.7, 20.8, 20.5, 20.4, 20.6, 20.9, 21.0, 21.06]` |
| 2 | `sensor_co2_1x1` | `sensor_graph` (`0x040D` CO₂ Air Quality) | **`1 × 1`** | `diagonal: true` | **CO₂ biuro** (`Wind`) | Surface `#2E3440`. At `1×1` shows `540 ppm` | None | **Series (`co2`):** `540 ppm`, `#73B7B2`, fill: `true`, min `415` (`04:10`), max `845` (`15:20`), pts: `[440, 425, 415, 460, 580, 720, 845, 760, 640, 590, 555, 540]` |
| 3 | `sensor_balkon_1x1` | `sensor_graph` (`0x0302` Outdoor Weather) | **`1 × 1`** | `diagonal: true` | **balkon** (`Cloud`) | Surface `#2E3440`. At `1×1` shows `5,73 °C` | None | **Series 1 (`balkon_temp`):** `5,73 °C`, `#38BDF8`, min `5,69` (`20:00`), max `13,41` (`13:39`), pts: `[12.8, 12.1, 10.9, 9.4, 8.2, 11.5, 13.41, 10.8, 8.1, 6.9, 5.9, 5.73]`<br>**Series 2 (`balkon_hum`):** `85,6 %`, `#C084FC`, fill: `true`, min `64,2` (`13:45`), max `94,55` (`05:30`), pts: `[78, 82, 88, 94.55, 89, 71, 64.2, 74, 81, 83, 85, 85.6]` |
| 4 | `sensor_lazienka_1x1` | `sensor_graph` (`0x0405` Humidity & Temp) | **`1 × 1`** | `diagonal: true` | **łazienka** (`Droplets`) | Surface `#2E3440`. At `1×1` shows `24,55 °C` | None | **Series 1 (`laz_temp`):** `24,55 °C`, `#C084FC`, min `22,85` (`06:15`), max `25,85` (`19:40`), pts: `[23.1, 23.0, 22.85, 23.1, 23.2, 23.4, 25.85, 24.9, 24.4, 24.5, 24.52, 24.55]`<br>**Series 2 (`laz_hum`):** `56,56 %`, `#3B82F6`, fill: `true`, min `48,86` (`12:00`), max `74,72` (`19:35`), pts: `[51, 50, 49, 48.86, 50, 52, 74.72, 65, 58, 57, 56.8, 56.56]` |
| 5 | `sensor_salon_2x2` | `sensor_graph` (24h Combined Temp & Humidity) | **`2 × 2`** | `diagonal: true` | **salon 24h** (`Thermometer`) | Surface `#2E3440`. Big readouts: `23,14 °C` (left) & `42,2 %` (right) + 24h graph | 1. `24h` (`Clock`, active) | **Series 1 (`sal_temp`):** `23,14 °C`, `#C084FC`, min `21,65` (`05:40`), max `24,65` (`14:15`), pts: `[22.1, 23.2, 22.9, 23.4, 23.5, 22.8, 22.6, 23.1, 22.9, 23.8, 23.1, 23.14]`<br>**Series 2 (`sal_hum`):** `42,2 %`, `#3B82F6`, fill: `true`, min `42,27` (`16:10`), max `48,4` (`08:25`), pts: `[44.2, 46.8, 43.1, 45.9, 47.2, 48.4, 46.1, 44.8, 43.5, 42.9, 42.4, 42.2]` |
| 6 | `sensor_biuro_2x2` | `sensor_graph` (24h Combined Temp & Humidity) | **`2 × 2`** | `diagonal: true` | **biuro 24h** (`Thermometer`) | Surface `#2E3440`. Big readouts: `23,35 °C` (left) & `45,26 %` (right) + 24h graph | 1. `24h` (`Clock`, active) | **Series 1 (`biu_temp`):** `23,35 °C`, `#C084FC`, min `21,74` (`06:10`), max `24,74` (`13:50`), pts: `[22.4, 23.0, 21.8, 22.9, 23.5, 24.74, 23.8, 23.1, 23.3, 23.4, 23.2, 23.35]`<br>**Series 2 (`biu_hum`):** `45,26 %`, `#3B82F6`, fill: `true`, min `44,18` (`17:00`), max `51,16` (`07:45`), pts: `[49.5, 48.2, 46.1, 47.8, 51.16, 48.9, 46.2, 45.8, 45.1, 44.6, 45.0, 45.26]` |
| 7 | `hvac_global` | `hvac_global_modes` (HVAC Coordinator) | **`2 × 1`** | `right: true` | **Tryb HVAC** (`plug-off`) | `modes: { cool: false, auto: true, heat: true }`. Subtitle: `Grzanie + Auto` | 1. `Chłodzenie` (`Snowflake`, `#3B82A6`)<br>2. `Auto` (`Plug`, `#73B7B2`, active)<br>3. `Grzanie` (`Flame`, `#D96B27`, active) | None |
| 8 | `thermostat_biuro` | `simple_thermostat` (`0x0301` Thermostat w/ Suggestions) | **`2 × 1`** | `down: true`, `right: true` | **biuro** (`Thermometer`) | `demand: 58%`, `targetTemp: 24.0`, `measuredTemp: 23.4`. Terracotta progress capsule (`58%`). Subtitle: `24,0 °C • 58%` | 1. `Obniż (-0,5°C)` (`Minus`)<br>2. `Podwyższ (+0,5°C)` (`Plus`)<br>3. `Sugestia 21.5°C` (`Sparkles`, active) | Expanding `↓` to `2×2` reveals Matter 1.6 Suggestion banner (`Taryfa Eco (Szczyt energetyczny) (21.5°C)` + `Przyjmij` button) and presets (`Eco 19°C`, `Komfort 22°C`, `Boost 25°C`) |
| 9 | `thermostat_salon` | `simple_thermostat` (`0x0301`) | **`2 × 1`** | None | **salon** (`Thermometer`) | `demand: 0%`, `targetTemp: 24.0`, `measuredTemp: 24.37`. Subtitle: `24,0 °C • 0%` | 1. `Minus`<br>2. `Plus`<br>3. `Sugestia 22°C` (`Sparkles`, active) | Matter 1.6 Suggestion: `Sugestia obecności Matter 1.6 (22.0°C)` |
| 10 | `thermostat_sypialnia` | `simple_thermostat` (`0x0301`) | **`2 × 1`** | None | **sypialnia** (`Thermometer`) | `demand: 0%`, `targetTemp: 19.0`, `measuredTemp: 22.52`. Subtitle: `19,0 °C • 0%` | 1. `Minus`<br>2. `Plus` | Presets (`Eco 19°C`, `Komfort 22°C`, `Boost 25°C`) when expanded |
| 11 | `ac_salon` | `rich_ac_row` (`0x0072` Room Air Conditioner) | **`4 × 1`** | `down: true` | **salon** (`Snowflake`) | `on: true`, `measuredTemp: 24.37`, `targetTemp: 22.0`, `fanSpeedPct: 60%`. Subtitle: `24,4 °C → Cel 22,0 °C` | 1. `Swing` (`ac-swing`, active)<br>2. `Wentylator` (`Fan`, active)<br>3. `Jonizacja` (`ionizer`, inactive)<br>4. `22,0°C` (`Thermometer`, active, `showLabel: true`) | Expanding `↓` to `4×2` reveals embedded slider: `Prędkość turbiny nawiewu` (`60%`) |
| 12 | `ac_sypialnia` | `rich_ac_row` (`0x0072`) | **`4 × 1`** | None | **sypialnia** (`Snowflake`) | `on: false`, `measuredTemp: 22.52`, `targetTemp: 20.5`, `fanSpeedPct: 40%`. Subtitle: `22,5 °C → Cel 20,5 °C` | 1. `Swing` (inactive)<br>2. `Wentylator` (inactive)<br>3. `Jonizacja` (inactive)<br>4. `20,5°C` (inactive, `showLabel: true`) | Embedded fan speed slider when expanded |
| 13 | `heat_pump_dom` | `slider_light` (`0x0309` Heat Pump) | **`2 × 2`** | None | **pompa ciepła** (`Flame`) | `on: true`, `brightness: 62%`. Subtitle: `62% • COP 4,6 • Zasilanie 34°C` | 1. `SG-Ready PV` (`Zap`, active)<br>2. `Tryb Cichy` (`Moon`, inactive) | 1. `Krzywa Eco` (`ionizer`, active, `60%`)<br>2. `CWU 52°C` (`ac-swing`, active, `80%`) |
| 14 | `air_purifier_salon` | `slider_light` (`0x002D` Air Purifier) | **`2 × 2`** | `right: true` | **oczyszczacz** (`Wind`) | `on: true`, `brightness: 45%`. Subtitle: `45% • PM2.5: 6 µg/m³ • HEPA 88%` | 1. `Jonizator` (`ionizer`, active)<br>2. `UV-C` (`Sparkles`, inactive) | 1. `Auto AQI` (`ionizer`, active, `50%`)<br>2. `Cichy 18dB` (`bulbs-off`, inactive, `20%`) |
| 15 | `water_heater_cwu` | `simple_thermostat` (`0x050F` Water Heater) | **`2 × 1`** | None | **bojler CWU** (`Thermometer`) | `demand: 65%`, `targetTemp: 55.0`, `measuredTemp: 49.5`. Subtitle: `55,0 °C • 65%` | 1. `Minus`<br>2. `Plus` | None |
| 16 | `ventilation_reku` | `slider_light` (`0x002B` Fan & HRV Control) | **`2 × 1`** | None | **rekuperacja** (`Fan`) | `on: true`, `brightness: 55%`. Subtitle: `55% • CO₂ 540 ppm • Odzysk 89%` | 1. `By-pass` (`Wind`, inactive)<br>2. `Kominek` (`Flame`, active) | None |

---

### 8.3 Page 3 (`appliances`): "Kuchnia & AGD" (6 Entities)
* **Lane ID:** `'appliances'`
* **Title:** `'Kuchnia & AGD'`
* **Subtitle:** `'Urządzenia stanowe, cykle, chłodzenie i roboty'`
* **Coordinates:** `{ x: 2, y: 0 }`
* **Ambient Ticker (`4 × 0.5`):**
  * **Lead Icon:** `'Utensils'` (Lucide)
  * **Items:**
    1. `{ icon: 'Zap', text: '1,42 kW' }`
    2. `{ icon: 'Droplets', text: '9,8 L / cykl' }`
    3. `{ icon: 'Tv', text: 'Matter Casting' }`
* **Ordered `entityIds` (6 Entities):**
  `['media_tv', 'appliance_zmywara', 'appliance_pralka', 'appliance_lodowka', 'appliance_piekarnik', 'robot_roborock']`

#### Page 3 Summary Layout Table
| # | Entity ID | Type & Matter 1.6 Cluster | Default Span ($C \times R$) | Expanders (`↓, →, ↘`) | Title & Icon | Initial State & Subtitle | Top-Row `mainButtons` | Row 2+ `secondaryButtons` / Modifiers |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `media_tv` | `stateful_tv` (`0x0023` Casting Video Player) | **`4 × 1`** | `down: true` | **TV** (`Tv`) | `on: true`, `playing: true`, `volume: 42%`. Subtitle: `Netflix • 4K • Głośność 42%` | 1. `Netflix` (`Tv`, active, `showLabel: true`)<br>2. `Pauza` (`Pause`, active)<br>3. `Zasilanie` (`Power`, active `bg-rose-500/35`) | Expanding `↓` to `4×2` reveals embedded slider: `Głośność amplitunera` (`42%`) |
| 2 | `appliance_zmywara` | `stateful_dishwasher` (`0x0075` Dishwasher) | **`4 × 2`** | `down: true` | **zmywara** (`door-closed`) | `state: 'idle'`, `progress: 34%`, `remainingMinutes: 78`, `delay: '0:00'`. Subtitle: `zamknięto • gotowe` | **When `idle`:**<br>1. `Start za 0:00` (`Clock`, `showLabel: true`, cycles `0:00`, `1:00`, `2:00`, `4:00`)<br>2. `Start!` (`Play`, active, `showLabel: true`)<br>**When `running`/`paused`:**<br>1. `Pauza` / `Wznów`<br>2. `Zakończ` (`Square`) | Left: Programme selector pill `Intensywny 70°C ⌄` (cycles `Intensywny 70°C`, `Auto 45-65°C`, `Eco 50°C`, `Szybki 45°C`)<br>Right: Modifier pills:<br>1. `Clean+` (`Sparkles`, inactive)<br>2. `Speed+` (`Clock`, active)<br>3. `Dry+` (`Wind`, inactive) |
| 3 | `appliance_pralka` | `stateful_dishwasher` (`0x0073` Laundry Washer) | **`4 × 2`** | `down: true` | **pralka** (`washing-machine`) | `state: 'running'`, `progress: 64%`, `remainingMinutes: 28`. Teal top-row progress capsule (`64%`). Subtitle: `W trakcie • 28 min (64%)` | 1. `Pauza` (`Pause`, active, `showLabel: true`)<br>2. `Zakończ` (`Square`, inactive, `showLabel: true`) | Left: Programme pill `Bawełna Eco 40°C • 1200 obr. ⌄`<br>Right: Modifier pills:<br>1. `Clean+` (active)<br>2. `Speed+` (active)<br>3. `Dry+` (inactive) |
| 4 | `appliance_lodowka` | `slider_light` (`0x0071` Fridge/Freezer) | **`2 × 2`** | None | **lodówka Samsung** (`fridge`) | `on: true`, `brightness: 75%`. Subtitle: `75% • Chłodziarka 3°C • Zamrażarka -18°C` | 1. `Wakacje` (`Snowflake`, inactive)<br>2. `Alarm drzwi` (`Bell`, active) | 1. `SuperCool` (`ionizer`, inactive, `100%`)<br>2. `Kostkarka` (`ac-swing`, active, `80%`) |
| 5 | `appliance_piekarnik` | `slider_light` (`0x007B` Oven & Cooktop) | **`2 × 2`** | None | **piekarnik & płyta** (`oven`) | `on: true`, `brightness: 82%`. Subtitle: `82% • Termoobieg 195°C • Sonda 62°C` | 1. `Para +` (`Droplets`, active)<br>2. `Pyroliza` (`Flame`, inactive) | 1. `AirFry 200°C` (`oven`, active, `90%`)<br>2. `Okap bieg 2` (`ac-swing`, active, `60%`) |
| 6 | `robot_roborock` | `robot_vacuum_tile` (`0x0074` Robotic Vacuum) | **`4 × 1`** | `down: true` | **robot sprzątający** (`robot-vacuum`) | `on: true`, `progress: 52%`, `battery: 94%`. Subtitle: `Odkurzanie + Mopowanie • Bateria 94%` | 1. `Salon` (`Compass`, `showLabel: true`)<br>2. `Kuchnia` (`Compass`, `showLabel: true`)<br>3. `Hol` (`Compass`, `showLabel: true`) | None |

---

### 8.4 Page 4 (`security`): "Bezpieczeństwo" (7 Entities)
* **Lane ID:** `'security'`
* **Title:** `'Bezpieczeństwo'`
* **Subtitle:** `'Kamery WebRTC, zamki UWB, bramy i historia Matter 1.6'`
* **Coordinates:** `{ x: 3, y: 0 }`
* **Ambient Ticker (`4 × 0.5`):**
  * **Lead Icon:** `'Shield'` (Lucide)
  * **Items:**
    1. `{ icon: 'Lock', text: 'Zamknięte (4/4)' }`
    2. `{ icon: 'Camera', text: '2 kamery WebRTC' }`
    3. `{ icon: 'Droplets', text: 'Gleba 58%' }`
* **Ordered `entityIds` (7 Entities):**
  `['camera_ogrod', 'doorbell_furta', 'lock_wejscie', 'garage_gate', 'alarm_smoke_co', 'water_valve_ogrod', 'security_history']`

#### Page 4 Summary Layout Table
| # | Entity ID | Type & Matter 1.6 Cluster | Default Span ($C \times R$) | Expanders (`↓, →, ↘`) | Title & Icon | Initial State & Subtitle | Top-Row `mainButtons` | Row 2+ `secondaryButtons` / Detections |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `camera_ogrod` | `webrtc_camera_tile` (Matter 1.5.1/1.6 WebRTC PTZ Camera) | **`2 × 2`** | `right: true` | **kamera podjazd** (`Camera`) | Surface `#26292E`, `privacy: false`. Subtitle: `Brama & Podjazd` | 1. `Preset PTZ` (`Compass`, inactive)<br>2. `Prywatność` (`Eye`, active) | Detection pill: `Osoba (19:42) • Samochód` + pulsing emerald `LIVE` badge |
| 2 | `doorbell_furta` | `webrtc_camera_tile` (Video Doorbell + Intercom) | **`2 × 2`** | None | **wideodomofon** (`Camera`) | Surface `#26292E`, `privacy: false`. Subtitle: `Furta wejściowa • 2-Way Audio` | 1. `Preset PTZ` (`Compass`, inactive)<br>2. `Prywatność` (`Eye`, active) | Detection pill: `Paczka pod drzwiami (16:15)` + pulsing emerald `LIVE` badge |
| 3 | `lock_wejscie` | `closure_lock_tile` (`0x000A` UWB & Aliro NFC Lock) | **`2 × 1`** | None | **zamek główny** (`Lock`) | `locked: true`, `battery: 88%`. Subtitle: `Zamknięte • UWB Auto-Unlock (Ty)` | None | None |
| 4 | `garage_gate` | `closure_lock_tile` (`0x0203` Modular Garage Closure) | **`2 × 1`** | None | **brama garażowa** (`Unlock`) | `locked: false`, `position: 65%` progress capsule. Subtitle: `Otwarte • Otwieranie 65% • Czujnik OK` | None | None |
| 5 | `alarm_smoke_co` | `matter_smoke_alarm` (`0x0076` Smoke & CO w/ Mount Sensor) | **`2 × 1`** | None | **czujnik dymu i CO** (`AlertTriangle`) | `mounted: true`, `coPpm: 0`. Subtitle: `Zamontowany w uchwycie • CO 0 ppm` *(Tapping icon unmounts detector & triggers crimson alert capsule)* | None | None |
| 6 | `water_valve_ogrod` | `closure_lock_tile` (`0x0042` Water Valve + Soil Sensor) | **`2 × 1`** | None | **zawór wody & ogród** (`Unlock`) | `locked: false`, `position: 100%` progress capsule. Subtitle: `Otwarte • Otwarty • Gleba trawnika 58%` | None | None |
| 7 | `security_history` | `matter_event_history` (Matter 1.6 Security Event Log) | **`4 × 1`** | `down: true` | **historia zdarzeń (Matter 1.6)** (`History`) | `armed: true`. Subtitle: `22:14 — Drzwi tarasowe: Zamknięto (Szczelne)` | None | Expanding `↓` to `4×2` reveals 3 chronological event pills:<br>• `22:14` — `Drzwi tarasowe: Zamknięto (Szczelne)`<br>• `19:42` — `Podjazd: Wykryto ruch (Osoba)`<br>• `16:15` — `Furta: Kurier zostawił paczkę` |

---

### 8.5 Page 5 (`energy`): "Energia & Matter 1.6" (4 Entities)
* **Lane ID:** `'energy'`
* **Title:** `'Energia & Matter 1.6'`
* **Subtitle:** `'Fotowoltaika, magazyn BESS, Wallbox V2H i Joint Fabric'`
* **Coordinates:** `{ x: 4, y: 0 }`
* **Ambient Ticker (`4 × 0.5`):**
  * **Lead Icon:** `'Zap'` (Lucide)
  * **Items:**
    1. `{ icon: 'Sun', text: '+3,85 kW PV' }`
    2. `{ icon: 'BatteryCharging', text: '86% BESS' }`
    3. `{ icon: 'Car', text: 'EV 78% (V2H)' }`
    4. `{ icon: 'Wifi', text: 'Joint Fabric OK' }`
* **Ordered `entityIds` (4 Entities):**
  `['solar_pv', 'home_battery', 'ev_wallbox', 'matter_joint_fabric']`

#### Page 5 Summary Layout Table
| # | Entity ID | Type & Matter 1.6 Cluster | Default Span ($C \times R$) | Expanders (`↓, →, ↘`) | Title & Icon | Initial State & Subtitle | Top-Row `mainButtons` | Row 2+ `secondaryButtons` / Modifiers |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `solar_pv` | `slider_light` (`0x0011` Solar Inverter PV) | **`2 × 2`** | None | **fotowoltaika PV** (`solar-panel`) | `on: true`, `brightness: 74%`. Subtitle: `74% • 3,85 kW • Dziś 24,6 kWh` | 1. `MPPT Dual` (`Sun`, active)<br>2. `Zero-Export` (`Shield`, inactive) | 1. `Autokonsumpcja` (`ionizer`, active, `85%`)<br>2. `Eksport 0,9 kW` (`ac-swing`, active, `40%`) |
| 2 | `home_battery` | `slider_light` (`0x0018` Battery Storage BESS) | **`2 × 2`** | None | **magazyn energii** (`BatteryCharging`) | `on: true`, `brightness: 86%`. Subtitle: `86% • 86% SoC (12,9 kWh) • Taryfa Dynamiczna` | 1. `Tania Taryfa` (`Zap`, active)<br>2. `Zasilanie Awaryjne` (`Shield`, active) | 1. `Peak Shaving` (`ionizer`, active, `90%`)<br>2. `Rezerwa 20%` (`plug-off`, active, `20%`) |
| 3 | `ev_wallbox` | `stateful_dishwasher` (Matter 1.5/1.6 Bidirectional EVSE V2H) | **`4 × 2`** | `down: true` | **ładowarka EV Wallbox** (`Car`) | `state: 'running'`, `progress: 54%`, `remainingMinutes: 44`. Teal top-row progress capsule (`54%`). Subtitle: `W trakcie • 44 min (54%)` | 1. `Pauza` (`Pause`, active, `showLabel: true`)<br>2. `Zakończ` (`Square`, inactive, `showLabel: true`) | Left: Programme pill `Tylko Słońce PV + V2H • 11 kW ⌄`<br>Right: Modifier pills:<br>1. `Solar PV` (`Sparkles`, active)<br>2. `V2H 11kW` (`Clock`, active)<br>3. `Limit 80%` (`Wind`, inactive) |
| 4 | `matter_joint_fabric` | `matter_fabric_hub` (Matter 1.6 Joint Fabric + Thread 1.4 HRAP + NFC) | **`4 × 1`** | `down: true` | **sieć Matter 1.6 Joint Fabric** (`Radio`) | Surface `#2B3B4E`, `threadNodes: 64`. Subtitle: `Thread 1.4 (64 węzłów) • Wspólny Datastore` *(Tapping icon pairs a new NFC device & increments node count)* | 1. `Home Assistant` (`Wifi`, active, `showLabel: true`)<br>2. `Apple Home` (`Wifi`, active, `showLabel: true`)<br>3. `Google Home` (`Wifi`, active, `showLabel: true`) | None |

---

### 8.6 Complete Initial State JSON Payload (`INITIAL_ENTITIES` — All 45 Entities)

For 100% deterministic reproduction by automated agents, below is the complete, unabridged `INITIAL_ENTITIES` state tree for all **45 entities** ($12 + 16 + 6 + 7 + 4 = 45$):

```json
{
  "light_salon": {
    "id": "light_salon",
    "column": "lights",
    "type": "slider_light",
    "matterType": "Matter 1.6 Extended Color Light (0x010D)",
    "title": "salon",
    "iconType": "lucide",
    "icon": "Sofa",
    "on": true,
    "brightness": 68,
    "colorTemp": 3200,
    "span": { "c": 2, "r": 2 },
    "defaultSpan": { "c": 2, "r": 2 },
    "expanders": { "down": false, "right": true, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": true, "presets": false },
    "nestedTiles": [],
    "mainButtons": [
      { "id": "warm", "label": "2700K", "iconType": "lucide", "icon": "Flame", "active": true },
      { "id": "day", "label": "4000K", "iconType": "lucide", "icon": "Sun", "active": false },
      { "id": "night", "label": "Noc 20%", "iconType": "lucide", "icon": "Moon", "active": false }
    ],
    "secondaryButtons": [
      { "id": "lampa", "label": "Lampa", "icon": "floor-lamp", "active": true, "brightness": 75, "type": "oval_pill" },
      { "id": "grzybek", "label": "Grzybek", "icon": "mushroom", "active": true, "brightness": 60, "type": "oval_pill" }
    ]
  },
  "light_tv": {
    "id": "light_tv",
    "column": "lights",
    "type": "slider_light",
    "matterType": "Matter 1.6 Dimmable Light Strip (0x0101)",
    "title": "TV",
    "iconType": "mdi",
    "icon": "led-strip",
    "on": false,
    "brightness": 45,
    "colorTemp": 2700,
    "span": { "c": 2, "r": 2 },
    "defaultSpan": { "c": 2, "r": 2 },
    "expanders": { "down": false, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": true, "presets": false },
    "nestedTiles": [],
    "mainButtons": [
      { "id": "sync", "label": "HDMI Sync", "iconType": "lucide", "icon": "Tv", "active": false },
      { "id": "bias", "label": "Bias 6500K", "iconType": "lucide", "icon": "Sparkles", "active": true }
    ],
    "secondaryButtons": [
      { "id": "led_tv_film", "label": "LED TV - film", "icon": "movie-check", "active": false, "brightness": 40, "type": "ghost_momentary" }
    ]
  },
  "light_kuchnia": {
    "id": "light_kuchnia",
    "column": "lights",
    "type": "slider_light",
    "matterType": "Matter 1.6 Color Temp Pendant (0x010C)",
    "title": "kuchnia",
    "iconType": "mdi",
    "icon": "pendant-lamps",
    "on": true,
    "brightness": 80,
    "colorTemp": 4000,
    "span": { "c": 2, "r": 2 },
    "defaultSpan": { "c": 2, "r": 2 },
    "hideSubtitleWhenOn": false,
    "expanders": { "down": false, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": true, "presets": false },
    "nestedTiles": [],
    "mainButtons": [
      { "id": "blat", "label": "Blat 100%", "iconType": "lucide", "icon": "Sun", "active": true },
      { "id": "kolacja", "label": "Kolacja", "iconType": "lucide", "icon": "Utensils", "active": false }
    ],
    "secondaryButtons": [
      { "id": "okno_salon", "label": "okno i salon", "icon": "bulbs-off", "active": false, "brightness": 50, "type": "oval_pill" }
    ]
  },
  "group_roslinki": {
    "id": "group_roslinki",
    "column": "lights",
    "type": "group_tile",
    "matterType": "Matter 1.5/1.6 Grow Light Group + Soil Sensor (0x0045)",
    "title": "roślinki",
    "iconType": "lucide",
    "icon": "Sprout",
    "soilMoisture": "64% wilg.",
    "span": { "c": 2, "r": 1 },
    "defaultSpan": { "c": 2, "r": 1 },
    "expanders": { "down": true, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": true, "presets": false },
    "nestedTiles": [],
    "mainButtons": [
      { "id": "uv_boost", "label": "Boost UV", "iconType": "lucide", "icon": "Sun", "active": true },
      { "id": "cycle_12h", "label": "Cykl 12h", "iconType": "lucide", "icon": "Clock", "active": true }
    ],
    "members": [
      { "id": "plant_sofa", "label": "Kanapa", "iconType": "lucide", "icon": "Sofa", "active": true },
      { "id": "plant_bed", "label": "Sypialnia", "iconType": "lucide", "icon": "Bed", "active": true },
      { "id": "plant_desk1", "label": "Biuro L", "iconType": "mdi", "icon": "office-chair", "active": true },
      { "id": "plant_desk2", "label": "Biuro P", "iconType": "mdi", "icon": "office-chair", "active": true }
    ]
  },
  "light_lozko": {
    "id": "light_lozko",
    "column": "lights",
    "type": "slider_light",
    "matterType": "Matter 1.6 Dimmable Light (0x0101)",
    "title": "łóżko",
    "iconType": "mdi",
    "icon": "led-strip",
    "on": false,
    "brightness": 35,
    "colorTemp": 2400,
    "span": { "c": 2, "r": 1 },
    "defaultSpan": { "c": 2, "r": 1 },
    "expanders": { "down": false, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": true, "presets": false },
    "nestedTiles": [],
    "mainButtons": [
      { "id": "read", "label": "Czytanie", "iconType": "lucide", "icon": "Sun", "active": false }
    ],
    "secondaryButtons": []
  },
  "light_lampka": {
    "id": "light_lampka",
    "column": "lights",
    "type": "slider_light",
    "matterType": "Matter 1.6 NFC-Commissioned Bulb (0x0101)",
    "title": "lampka",
    "iconType": "mdi",
    "icon": "table-lamp",
    "on": false,
    "brightness": 55,
    "colorTemp": 2900,
    "span": { "c": 2, "r": 1 },
    "defaultSpan": { "c": 2, "r": 1 },
    "expanders": { "down": false, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": true, "presets": false },
    "nestedTiles": [],
    "mainButtons": [],
    "secondaryButtons": []
  },
  "scene_sen": {
    "id": "scene_sen",
    "column": "lights",
    "type": "scene_pill",
    "matterType": "Matter 1.6 Scene Recall Cluster (0x0062)",
    "title": "Sen",
    "iconType": "lucide",
    "icon": "Moon",
    "active": false,
    "span": { "c": 1, "r": 1 },
    "defaultSpan": { "c": 1, "r": 1 },
    "expanders": { "down": false, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": [],
    "mainButtons": []
  },
  "sensor_lux_salon": {
    "id": "sensor_lux_salon",
    "column": "lights",
    "type": "sensor_graph",
    "matterType": "Matter 1.6 Illuminance & Temp Sensor (0x0400)",
    "title": "natężenie",
    "iconType": "lucide",
    "icon": "Sun",
    "span": { "c": 1, "r": 1 },
    "defaultSpan": { "c": 1, "r": 1 },
    "expanders": { "down": false, "right": false, "diagonal": true },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": [],
    "mainButtons": [
      { "id": "range_24h", "label": "24h", "iconType": "lucide", "icon": "Clock", "active": true }
    ],
    "series": [
      {
        "id": "lux",
        "label": "Natężenie światła",
        "current": "420",
        "unit": "lx",
        "color": "#FBBF24",
        "fill": true,
        "min": "0",
        "minTime": "03:15",
        "max": "890",
        "maxTime": "13:40",
        "points": [5, 2, 0, 18, 95, 240, 510, 780, 890, 740, 520, 420]
      }
    ]
  },
  "cover_roleta": {
    "id": "cover_roleta",
    "column": "lights",
    "type": "vertical_blind",
    "matterType": "Matter 1.5/1.6 Modular Window Covering (0x0202)",
    "title": "roleta",
    "iconType": "mdi",
    "icon": "window-shutter",
    "position": 65,
    "tilt": 40,
    "span": { "c": 2, "r": 3 },
    "defaultSpan": { "c": 2, "r": 3 },
    "expanders": { "down": false, "right": true, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": true, "presets": false },
    "nestedTiles": [],
    "mainButtons": [
      { "id": "tilt_45", "label": "Lamele 45°", "iconType": "lucide", "icon": "Sun", "active": true },
      { "id": "privacy_0", "label": "0° Noc", "iconType": "lucide", "icon": "Moon", "active": false }
    ]
  },
  "plug_biurko": {
    "id": "plug_biurko",
    "column": "lights",
    "type": "slider_light",
    "matterType": "Matter 1.6 Dimmable Plug-in Unit + Power Meter (0x010B)",
    "title": "wtyczka biuro",
    "iconType": "lucide",
    "icon": "Plug",
    "on": true,
    "brightness": 100,
    "powerWatts": "142 W",
    "span": { "c": 2, "r": 1 },
    "defaultSpan": { "c": 2, "r": 1 },
    "expanders": { "down": false, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": true, "presets": false },
    "nestedTiles": [],
    "mainButtons": [
      { "id": "eco_off", "label": "Auto-Off", "iconType": "lucide", "icon": "Clock", "active": true }
    ],
    "secondaryButtons": []
  },
  "speaker_salon": {
    "id": "speaker_salon",
    "column": "lights",
    "type": "slider_light",
    "matterType": "Matter 1.6 Smart Speaker / Audio Output (0x0022)",
    "title": "głośnik Sonos",
    "iconType": "lucide",
    "icon": "Volume2",
    "on": true,
    "brightness": 48,
    "span": { "c": 2, "r": 1 },
    "defaultSpan": { "c": 2, "r": 1 },
    "expanders": { "down": false, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": true, "presets": false },
    "nestedTiles": [],
    "mainButtons": [
      { "id": "play", "label": "Play/Pause", "iconType": "lucide", "icon": "Play", "active": true },
      { "id": "cast", "label": "AirPlay", "iconType": "lucide", "icon": "Radio", "active": false }
    ],
    "secondaryButtons": []
  },
  "ambient_context_salon": {
    "id": "ambient_context_salon",
    "column": "lights",
    "type": "matter_context_tile",
    "matterType": "Matter 1.6 Ambient Context Sensor (Provisional)",
    "title": "kontekst AI",
    "iconType": "lucide",
    "icon": "Eye",
    "active": true,
    "activity": "2 osoby • Relaks na kanapie",
    "soundContext": "Cicha muzyka • Brak alarmów",
    "prediction": "Sugestia: Scena Film o 20:30",
    "span": { "c": 4, "r": 1 },
    "defaultSpan": { "c": 4, "r": 1 },
    "expanders": { "down": true, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": [],
    "mainButtons": [
      { "id": "mmwave", "label": "mmWave", "iconType": "lucide", "icon": "Waves", "active": true },
      { "id": "audio_ai", "label": "Audio AI", "iconType": "lucide", "icon": "Volume2", "active": true },
      { "id": "auto_scene", "label": "Sugestie", "iconType": "lucide", "icon": "Sparkles", "active": true }
    ]
  },
  "sensor_multi_heating_3x3": {
    "id": "sensor_multi_heating_3x3",
    "column": "climate",
    "type": "sensor_graph",
    "matterType": "Matter 1.6 Multi-Zone Temp & Heating Telemetry (24h)",
    "title": "temperatura i grzanie 24h",
    "iconType": "lucide",
    "icon": "Thermometer",
    "span": { "c": 3, "r": 3 },
    "defaultSpan": { "c": 3, "r": 3 },
    "expanders": { "down": false, "right": true, "diagonal": true },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": [],
    "mainButtons": [
      { "id": "extrema", "label": "Min/Max", "iconType": "lucide", "icon": "Activity", "active": true },
      { "id": "axis", "label": "Oś Y", "iconType": "lucide", "icon": "Gauge", "active": true }
    ],
    "rightAxisMax": "110",
    "rightAxisMin": "0",
    "steppedAreaPoints": [65, 65, 78, 78, 45, 92, 92, 58, 58, 74, 62, 58],
    "series": [
      {
        "id": "temp_salon",
        "label": "salon",
        "current": "23,14",
        "unit": "°C",
        "color": "#FF2E4C",
        "min": "19,87",
        "minTime": "05:20",
        "max": "24,87",
        "maxTime": "14:10",
        "points": [21.4, 22.1, 22.8, 21.2, 22.4, 23.8, 22.5, 22.3, 22.9, 23.4, 23.1, 23.14]
      },
      {
        "id": "temp_biuro",
        "label": "biuro",
        "current": "23,35",
        "unit": "°C",
        "color": "#00F0FF",
        "min": "20,40",
        "minTime": "06:00",
        "max": "24,74",
        "maxTime": "13:35",
        "points": [21.1, 21.8, 22.3, 20.6, 22.5, 24.7, 23.9, 22.7, 23.1, 23.2, 23.3, 23.35]
      },
      {
        "id": "temp_sypialnia",
        "label": "sypialnia",
        "current": "21,06",
        "unit": "°C",
        "color": "#7CE38B",
        "min": "19,87",
        "minTime": "04:45",
        "max": "22,93",
        "maxTime": "00:30",
        "points": [21.9, 21.8, 20.9, 20.4, 20.7, 20.8, 20.5, 20.4, 20.6, 20.9, 21.0, 21.06]
      }
    ]
  },
  "sensor_co2_1x1": {
    "id": "sensor_co2_1x1",
    "column": "climate",
    "type": "sensor_graph",
    "matterType": "Matter 1.6 CO₂ Air Quality Sensor (0x040D)",
    "title": "CO₂ biuro",
    "iconType": "lucide",
    "icon": "Wind",
    "span": { "c": 1, "r": 1 },
    "defaultSpan": { "c": 1, "r": 1 },
    "expanders": { "down": false, "right": false, "diagonal": true },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": [],
    "mainButtons": [],
    "series": [
      {
        "id": "co2",
        "label": "Stężenie CO₂",
        "current": "540",
        "unit": "ppm",
        "color": "#73B7B2",
        "fill": true,
        "min": "415",
        "minTime": "04:10",
        "max": "845",
        "maxTime": "15:20",
        "points": [440, 425, 415, 460, 580, 720, 845, 760, 640, 590, 555, 540]
      }
    ]
  },
  "sensor_balkon_1x1": {
    "id": "sensor_balkon_1x1",
    "column": "climate",
    "type": "sensor_graph",
    "matterType": "Matter 1.6 Outdoor Weather Sensor (0x0302)",
    "title": "balkon",
    "iconType": "lucide",
    "icon": "Cloud",
    "span": { "c": 1, "r": 1 },
    "defaultSpan": { "c": 1, "r": 1 },
    "expanders": { "down": false, "right": false, "diagonal": true },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": [],
    "mainButtons": [],
    "series": [
      {
        "id": "balkon_temp",
        "label": "Temperatura",
        "current": "5,73",
        "unit": "°C",
        "color": "#38BDF8",
        "min": "5,69",
        "minTime": "20:00",
        "max": "13,41",
        "maxTime": "13:39",
        "points": [12.8, 12.1, 10.9, 9.4, 8.2, 11.5, 13.41, 10.8, 8.1, 6.9, 5.9, 5.73]
      },
      {
        "id": "balkon_hum",
        "label": "Wilgotność",
        "current": "85,6",
        "unit": "%",
        "color": "#C084FC",
        "fill": true,
        "min": "64,2",
        "minTime": "13:45",
        "max": "94,55",
        "maxTime": "05:30",
        "points": [78, 82, 88, 94.55, 89, 71, 64.2, 74, 81, 83, 85, 85.6]
      }
    ]
  },
  "sensor_lazienka_1x1": {
    "id": "sensor_lazienka_1x1",
    "column": "climate",
    "type": "sensor_graph",
    "matterType": "Matter 1.6 Humidity & Temp Sensor (0x0405)",
    "title": "łazienka",
    "iconType": "lucide",
    "icon": "Droplets",
    "span": { "c": 1, "r": 1 },
    "defaultSpan": { "c": 1, "r": 1 },
    "expanders": { "down": false, "right": false, "diagonal": true },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": [],
    "mainButtons": [],
    "series": [
      {
        "id": "laz_temp",
        "label": "Temperatura",
        "current": "24,55",
        "unit": "°C",
        "color": "#C084FC",
        "min": "22,85",
        "minTime": "06:15",
        "max": "25,85",
        "maxTime": "19:40",
        "points": [23.1, 23.0, 22.85, 23.1, 23.2, 23.4, 25.85, 24.9, 24.4, 24.5, 24.52, 24.55]
      },
      {
        "id": "laz_hum",
        "label": "Wilgotność",
        "current": "56,56",
        "unit": "%",
        "color": "#3B82F6",
        "fill": true,
        "min": "48,86",
        "minTime": "12:00",
        "max": "74,72",
        "maxTime": "19:35",
        "points": [51, 50, 49, 48.86, 50, 52, 74.72, 65, 58, 57, 56.8, 56.56]
      }
    ]
  },
  "sensor_salon_2x2": {
    "id": "sensor_salon_2x2",
    "column": "climate",
    "type": "sensor_graph",
    "matterType": "Matter 1.6 Combined Temp & Relative Humidity (24h)",
    "title": "salon 24h",
    "iconType": "lucide",
    "icon": "Thermometer",
    "span": { "c": 2, "r": 2 },
    "defaultSpan": { "c": 2, "r": 2 },
    "expanders": { "down": false, "right": false, "diagonal": true },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": [],
    "mainButtons": [
      { "id": "range_24h", "label": "24h", "iconType": "lucide", "icon": "Clock", "active": true }
    ],
    "series": [
      {
        "id": "sal_temp",
        "label": "Temperatura",
        "current": "23,14",
        "unit": "°C",
        "color": "#C084FC",
        "min": "21,65",
        "minTime": "05:40",
        "max": "24,65",
        "maxTime": "14:15",
        "points": [22.1, 23.2, 22.9, 23.4, 23.5, 22.8, 22.6, 23.1, 22.9, 23.8, 23.1, 23.14]
      },
      {
        "id": "sal_hum",
        "label": "Wilgotność",
        "current": "42,2",
        "unit": "%",
        "color": "#3B82F6",
        "fill": true,
        "min": "42,27",
        "minTime": "16:10",
        "max": "48,4",
        "maxTime": "08:25",
        "points": [44.2, 46.8, 43.1, 45.9, 47.2, 48.4, 46.1, 44.8, 43.5, 42.9, 42.4, 42.2]
      }
    ]
  },
  "sensor_biuro_2x2": {
    "id": "sensor_biuro_2x2",
    "column": "climate",
    "type": "sensor_graph",
    "matterType": "Matter 1.6 Combined Temp & Relative Humidity (24h)",
    "title": "biuro 24h",
    "iconType": "lucide",
    "icon": "Thermometer",
    "span": { "c": 2, "r": 2 },
    "defaultSpan": { "c": 2, "r": 2 },
    "expanders": { "down": false, "right": false, "diagonal": true },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": [],
    "mainButtons": [
      { "id": "range_24h", "label": "24h", "iconType": "lucide", "icon": "Clock", "active": true }
    ],
    "series": [
      {
        "id": "biu_temp",
        "label": "Temperatura",
        "current": "23,35",
        "unit": "°C",
        "color": "#C084FC",
        "min": "21,74",
        "minTime": "06:10",
        "max": "24,74",
        "maxTime": "13:50",
        "points": [22.4, 23.0, 21.8, 22.9, 23.5, 24.74, 23.8, 23.1, 23.3, 23.4, 23.2, 23.35]
      },
      {
        "id": "biu_hum",
        "label": "Wilgotność",
        "current": "45,26",
        "unit": "%",
        "color": "#3B82F6",
        "fill": true,
        "min": "44,18",
        "minTime": "17:00",
        "max": "51,16",
        "maxTime": "07:45",
        "points": [49.5, 48.2, 46.1, 47.8, 51.16, 48.9, 46.2, 45.8, 45.1, 44.6, 45.0, 45.26]
      }
    ]
  },
  "hvac_global": {
    "id": "hvac_global",
    "column": "climate",
    "type": "hvac_global_modes",
    "matterType": "Matter 1.6 HVAC System Coordinator",
    "title": "Tryb HVAC",
    "modes": { "cool": false, "auto": true, "heat": true },
    "span": { "c": 2, "r": 1 },
    "defaultSpan": { "c": 2, "r": 1 },
    "expanders": { "down": false, "right": true, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": []
  },
  "thermostat_biuro": {
    "id": "thermostat_biuro",
    "column": "climate",
    "type": "simple_thermostat",
    "matterType": "Matter 1.6 Thermostat w/ Suggestions (0x0301)",
    "title": "biuro",
    "demand": 58,
    "targetTemp": 24.0,
    "measuredTemp": 23.4,
    "preset": "Komfort",
    "matterSuggestion": {
      "active": true,
      "suggestedTemp": 21.5,
      "source": "Taryfa Eco (Szczyt energetyczny)",
      "status": "Wstrzymano (Ręczna zmiana użytkownika)"
    },
    "span": { "c": 2, "r": 1 },
    "defaultSpan": { "c": 2, "r": 1 },
    "expanders": { "down": true, "right": true, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": []
  },
  "thermostat_salon": {
    "id": "thermostat_salon",
    "column": "climate",
    "type": "simple_thermostat",
    "matterType": "Matter 1.6 Thermostat w/ Suggestions (0x0301)",
    "title": "salon",
    "demand": 0,
    "targetTemp": 24.0,
    "measuredTemp": 24.37,
    "preset": "Eco",
    "matterSuggestion": {
      "active": true,
      "suggestedTemp": 22.0,
      "source": "Sugestia obecności Matter 1.6",
      "status": "Zaakceptowano przez termostat"
    },
    "span": { "c": 2, "r": 1 },
    "defaultSpan": { "c": 2, "r": 1 },
    "expanders": { "down": false, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": []
  },
  "thermostat_sypialnia": {
    "id": "thermostat_sypialnia",
    "column": "climate",
    "type": "simple_thermostat",
    "matterType": "Matter 1.6 Thermostat w/ Suggestions (0x0301)",
    "title": "sypialnia",
    "demand": 0,
    "targetTemp": 19.0,
    "measuredTemp": 22.52,
    "preset": "Noc",
    "span": { "c": 2, "r": 1 },
    "defaultSpan": { "c": 2, "r": 1 },
    "expanders": { "down": false, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": []
  },
  "ac_salon": {
    "id": "ac_salon",
    "column": "climate",
    "type": "rich_ac_row",
    "matterType": "Matter 1.6 Room Air Conditioner (0x0072)",
    "title": "salon",
    "measuredTemp": 24.37,
    "targetTemp": 22.0,
    "on": true,
    "swing": true,
    "fan": true,
    "ionizer": false,
    "fanSpeedPct": 60,
    "span": { "c": 4, "r": 1 },
    "defaultSpan": { "c": 4, "r": 1 },
    "expanders": { "down": true, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": true, "presets": false },
    "nestedTiles": []
  },
  "ac_sypialnia": {
    "id": "ac_sypialnia",
    "column": "climate",
    "type": "rich_ac_row",
    "matterType": "Matter 1.6 Room Air Conditioner (0x0072)",
    "title": "sypialnia",
    "measuredTemp": 22.52,
    "targetTemp": 20.5,
    "on": false,
    "swing": false,
    "fan": false,
    "ionizer": false,
    "fanSpeedPct": 40,
    "span": { "c": 4, "r": 1 },
    "defaultSpan": { "c": 4, "r": 1 },
    "expanders": { "down": false, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": true, "presets": false },
    "nestedTiles": []
  },
  "heat_pump_dom": {
    "id": "heat_pump_dom",
    "column": "climate",
    "type": "slider_light",
    "matterType": "Matter 1.4/1.6 Heat Pump (0x0309)",
    "title": "pompa ciepła",
    "iconType": "lucide",
    "icon": "Flame",
    "on": true,
    "brightness": 62,
    "colorTemp": 3500,
    "customSubtitle": "COP 4,6 • Zasilanie 34°C",
    "span": { "c": 2, "r": 2 },
    "defaultSpan": { "c": 2, "r": 2 },
    "expanders": { "down": false, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": true, "presets": false },
    "nestedTiles": [],
    "mainButtons": [
      { "id": "sg_ready", "label": "SG-Ready PV", "iconType": "lucide", "icon": "Zap", "active": true },
      { "id": "silent", "label": "Tryb Cichy", "iconType": "lucide", "icon": "Moon", "active": false }
    ],
    "secondaryButtons": [
      { "id": "hp_eco", "label": "Krzywa Eco", "icon": "ionizer", "active": true, "brightness": 60, "type": "oval_pill" },
      { "id": "hp_cwu", "label": "CWU 52°C", "icon": "ac-swing", "active": true, "brightness": 80, "type": "oval_pill" }
    ]
  },
  "air_purifier_salon": {
    "id": "air_purifier_salon",
    "column": "climate",
    "type": "slider_light",
    "matterType": "Matter 1.2/1.6 Air Purifier + AQI Sensor (0x002D)",
    "title": "oczyszczacz",
    "iconType": "lucide",
    "icon": "Wind",
    "on": true,
    "brightness": 45,
    "customSubtitle": "PM2.5: 6 µg/m³ • HEPA 88%",
    "span": { "c": 2, "r": 2 },
    "defaultSpan": { "c": 2, "r": 2 },
    "expanders": { "down": false, "right": true, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": true, "presets": false },
    "nestedTiles": [],
    "mainButtons": [
      { "id": "ion", "label": "Jonizator", "iconType": "mdi", "icon": "ionizer", "active": true },
      { "id": "uv", "label": "UV-C", "iconType": "lucide", "icon": "Sparkles", "active": false }
    ],
    "secondaryButtons": [
      { "id": "pur_auto", "label": "Auto AQI", "icon": "ionizer", "active": true, "brightness": 50, "type": "oval_pill" },
      { "id": "pur_night", "label": "Cichy 18dB", "icon": "bulbs-off", "active": false, "brightness": 20, "type": "oval_pill" }
    ]
  },
  "water_heater_cwu": {
    "id": "water_heater_cwu",
    "column": "climate",
    "type": "simple_thermostat",
    "matterType": "Matter 1.4/1.6 Water Heater (0x050F)",
    "title": "bojler CWU",
    "demand": 65,
    "targetTemp": 55.0,
    "measuredTemp": 49.5,
    "preset": "Legionella OK",
    "span": { "c": 2, "r": 1 },
    "defaultSpan": { "c": 2, "r": 1 },
    "expanders": { "down": false, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": []
  },
  "ventilation_reku": {
    "id": "ventilation_reku",
    "column": "climate",
    "type": "slider_light",
    "matterType": "Matter 1.2/1.6 Fan & HRV Control (0x002B)",
    "title": "rekuperacja",
    "iconType": "lucide",
    "icon": "Fan",
    "on": true,
    "brightness": 55,
    "customSubtitle": "CO₂ 540 ppm • Odzysk 89%",
    "span": { "c": 2, "r": 1 },
    "defaultSpan": { "c": 2, "r": 1 },
    "expanders": { "down": false, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": true, "presets": false },
    "nestedTiles": [],
    "mainButtons": [
      { "id": "bypass", "label": "By-pass", "iconType": "lucide", "icon": "Wind", "active": false },
      { "id": "boost", "label": "Kominek", "iconType": "lucide", "icon": "Flame", "active": true }
    ],
    "secondaryButtons": []
  },
  "media_tv": {
    "id": "media_tv",
    "column": "appliances",
    "type": "stateful_tv",
    "matterType": "Matter 1.6 Casting Video Player (0x0023)",
    "title": "TV",
    "on": true,
    "playing": true,
    "source": "Netflix • 4K",
    "volume": 42,
    "muted": false,
    "span": { "c": 4, "r": 1 },
    "defaultSpan": { "c": 4, "r": 1 },
    "expanders": { "down": true, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": true, "presets": false },
    "nestedTiles": []
  },
  "appliance_zmywara": {
    "id": "appliance_zmywara",
    "column": "appliances",
    "type": "stateful_dishwasher",
    "matterType": "Matter 1.2/1.6 Dishwasher (0x0075)",
    "title": "zmywara",
    "iconName": "door-closed",
    "doorClosed": true,
    "state": "idle",
    "progress": 34,
    "remainingMinutes": 78,
    "delay": "0:00",
    "programme": "Intensywny 70°C",
    "cleanPlus": false,
    "speedPlus": true,
    "dryPlus": false,
    "waterTemp": 70,
    "span": { "c": 4, "r": 2 },
    "defaultSpan": { "c": 4, "r": 2 },
    "expanders": { "down": true, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": []
  },
  "appliance_pralka": {
    "id": "appliance_pralka",
    "column": "appliances",
    "type": "stateful_dishwasher",
    "matterType": "Matter 1.2/1.6 Laundry Washer + Dryer (0x0073)",
    "title": "pralka",
    "iconName": "washing-machine",
    "doorClosed": true,
    "state": "running",
    "progress": 64,
    "remainingMinutes": 28,
    "delay": "0:00",
    "programme": "Bawełna Eco 40°C • 1200 obr.",
    "cleanPlus": true,
    "speedPlus": true,
    "dryPlus": false,
    "waterTemp": 40,
    "span": { "c": 4, "r": 2 },
    "defaultSpan": { "c": 4, "r": 2 },
    "expanders": { "down": true, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": []
  },
  "appliance_lodowka": {
    "id": "appliance_lodowka",
    "column": "appliances",
    "type": "slider_light",
    "matterType": "Matter 1.2/1.6 Temperature Controlled Cabinet / Fridge (0x0071)",
    "title": "lodówka Samsung",
    "iconType": "mdi",
    "icon": "fridge",
    "on": true,
    "brightness": 75,
    "customSubtitle": "Chłodziarka 3°C • Zamrażarka -18°C",
    "span": { "c": 2, "r": 2 },
    "defaultSpan": { "c": 2, "r": 2 },
    "expanders": { "down": false, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": true, "presets": false },
    "nestedTiles": [],
    "mainButtons": [
      { "id": "vacation", "label": "Wakacje", "iconType": "lucide", "icon": "Snowflake", "active": false },
      { "id": "door_alarm", "label": "Alarm drzwi", "iconType": "lucide", "icon": "Bell", "active": true }
    ],
    "secondaryButtons": [
      { "id": "fridge_cool", "label": "SuperCool", "icon": "ionizer", "active": false, "brightness": 100, "type": "oval_pill" },
      { "id": "fridge_ice", "label": "Kostkarka", "icon": "ac-swing", "active": true, "brightness": 80, "type": "oval_pill" }
    ]
  },
  "appliance_piekarnik": {
    "id": "appliance_piekarnik",
    "column": "appliances",
    "type": "slider_light",
    "matterType": "Matter 1.3/1.6 Oven & Cooktop (0x007B)",
    "title": "piekarnik & płyta",
    "iconType": "mdi",
    "icon": "oven",
    "on": true,
    "brightness": 82,
    "customSubtitle": "Termoobieg 195°C • Sonda 62°C",
    "span": { "c": 2, "r": 2 },
    "defaultSpan": { "c": 2, "r": 2 },
    "expanders": { "down": false, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": true, "presets": false },
    "nestedTiles": [],
    "mainButtons": [
      { "id": "steam", "label": "Para +", "iconType": "lucide", "icon": "Droplets", "active": true },
      { "id": "pyro", "label": "Pyroliza", "iconType": "lucide", "icon": "Flame", "active": false }
    ],
    "secondaryButtons": [
      { "id": "oven_grill", "label": "AirFry 200°C", "icon": "oven", "active": true, "brightness": 90, "type": "oval_pill" },
      { "id": "hood_fan", "label": "Okap bieg 2", "icon": "ac-swing", "active": true, "brightness": 60, "type": "oval_pill" }
    ]
  },
  "robot_roborock": {
    "id": "robot_roborock",
    "column": "appliances",
    "type": "robot_vacuum_tile",
    "matterType": "Matter 1.2/1.6 Robotic Vacuum Cleaner (0x0074)",
    "title": "robot sprzątający",
    "on": true,
    "progress": 52,
    "mode": "Odkurzanie + Mopowanie",
    "battery": 94,
    "rooms": ["Salon", "Kuchnia", "Hol"],
    "span": { "c": 4, "r": 1 },
    "defaultSpan": { "c": 4, "r": 1 },
    "expanders": { "down": true, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": true, "presets": true },
    "nestedTiles": []
  },
  "camera_ogrod": {
    "id": "camera_ogrod",
    "column": "security",
    "type": "webrtc_camera_tile",
    "matterType": "Matter 1.5.1/1.6 WebRTC Security Camera (PTZ + Multi-Stream)",
    "title": "kamera podjazd",
    "on": true,
    "privacy": false,
    "ptzPreset": "Brama & Podjazd",
    "detections": "Osoba (19:42) • Samochód",
    "span": { "c": 2, "r": 2 },
    "defaultSpan": { "c": 2, "r": 2 },
    "expanders": { "down": false, "right": true, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": []
  },
  "doorbell_furta": {
    "id": "doorbell_furta",
    "column": "security",
    "type": "webrtc_camera_tile",
    "matterType": "Matter 1.5.1/1.6 Video Doorbell + Intercom Chime",
    "title": "wideodomofon",
    "on": true,
    "privacy": false,
    "ptzPreset": "Furta wejściowa • 2-Way Audio",
    "detections": "Paczka pod drzwiami (16:15)",
    "span": { "c": 2, "r": 2 },
    "defaultSpan": { "c": 2, "r": 2 },
    "expanders": { "down": false, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": []
  },
  "lock_wejscie": {
    "id": "lock_wejscie",
    "column": "security",
    "type": "closure_lock_tile",
    "matterType": "Matter 1.6 Door Lock w/ UWB & Aliro NFC (0x000A)",
    "title": "zamek główny",
    "locked": true,
    "battery": 88,
    "lastActor": "UWB Auto-Unlock (Ty)",
    "span": { "c": 2, "r": 1 },
    "defaultSpan": { "c": 2, "r": 1 },
    "expanders": { "down": false, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": []
  },
  "garage_gate": {
    "id": "garage_gate",
    "column": "security",
    "type": "closure_lock_tile",
    "matterType": "Matter 1.5/1.6 Modular Closure / Garage Door (0x0203)",
    "title": "brama garażowa",
    "locked": false,
    "position": 65,
    "lastActor": "Otwieranie 65% • Czujnik OK",
    "span": { "c": 2, "r": 1 },
    "defaultSpan": { "c": 2, "r": 1 },
    "expanders": { "down": false, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": []
  },
  "alarm_smoke_co": {
    "id": "alarm_smoke_co",
    "column": "security",
    "type": "matter_smoke_alarm",
    "matterType": "Matter 1.6 Smoke & CO Alarm w/ Mount Sensor (0x0076)",
    "title": "czujnik dymu i CO",
    "mounted": true,
    "coPpm": 0,
    "battery": 98,
    "span": { "c": 2, "r": 1 },
    "defaultSpan": { "c": 2, "r": 1 },
    "expanders": { "down": false, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": []
  },
  "water_valve_ogrod": {
    "id": "water_valve_ogrod",
    "column": "security",
    "type": "closure_lock_tile",
    "matterType": "Matter 1.3/1.5 Water Valve + Irrigation Soil Sensor (0x0042)",
    "title": "zawór wody & ogród",
    "locked": false,
    "position": 100,
    "lastActor": "Otwarty • Gleba trawnika 58%",
    "span": { "c": 2, "r": 1 },
    "defaultSpan": { "c": 2, "r": 1 },
    "expanders": { "down": false, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": []
  },
  "security_history": {
    "id": "security_history",
    "column": "security",
    "type": "matter_event_history",
    "matterType": "Matter 1.6 Standardized Security Sensor Event History",
    "title": "historia zdarzeń (Matter 1.6)",
    "armed": true,
    "events": [
      { "time": "22:14", "label": "Drzwi tarasowe: Zamknięto (Szczelne)" },
      { "time": "19:42", "label": "Podjazd: Wykryto ruch (Osoba)" },
      { "time": "16:15", "label": "Furta: Kurier zostawił paczkę" }
    ],
    "span": { "c": 4, "r": 1 },
    "defaultSpan": { "c": 4, "r": 1 },
    "expanders": { "down": true, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": []
  },
  "solar_pv": {
    "id": "solar_pv",
    "column": "energy",
    "type": "slider_light",
    "matterType": "Matter 1.4/1.6 Solar Inverter / PV Array (0x0011)",
    "title": "fotowoltaika PV",
    "iconType": "mdi",
    "icon": "solar-panel",
    "on": true,
    "brightness": 74,
    "customSubtitle": "3,85 kW • Dziś 24,6 kWh",
    "span": { "c": 2, "r": 2 },
    "defaultSpan": { "c": 2, "r": 2 },
    "expanders": { "down": false, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": true, "presets": false },
    "nestedTiles": [],
    "mainButtons": [
      { "id": "mppt", "label": "MPPT Dual", "iconType": "lucide", "icon": "Sun", "active": true },
      { "id": "zero_export", "label": "Zero-Export", "iconType": "lucide", "icon": "Shield", "active": false }
    ],
    "secondaryButtons": [
      { "id": "pv_self", "label": "Autokonsumpcja", "icon": "ionizer", "active": true, "brightness": 85, "type": "oval_pill" },
      { "id": "pv_grid", "label": "Eksport 0,9 kW", "icon": "ac-swing", "active": true, "brightness": 40, "type": "oval_pill" }
    ]
  },
  "home_battery": {
    "id": "home_battery",
    "column": "energy",
    "type": "slider_light",
    "matterType": "Matter 1.4/1.6 Battery Storage BESS (0x0018)",
    "title": "magazyn energii",
    "iconType": "lucide",
    "icon": "BatteryCharging",
    "on": true,
    "brightness": 86,
    "customSubtitle": "86% SoC (12,9 kWh) • Taryfa Dynamiczna",
    "span": { "c": 2, "r": 2 },
    "defaultSpan": { "c": 2, "r": 2 },
    "expanders": { "down": false, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": true, "presets": false },
    "nestedTiles": [],
    "mainButtons": [
      { "id": "grid_charge", "label": "Tania Taryfa", "iconType": "lucide", "icon": "Zap", "active": true },
      { "id": "island", "label": "Zasilanie Awaryjne", "iconType": "lucide", "icon": "Shield", "active": true }
    ],
    "secondaryButtons": [
      { "id": "bess_peak", "label": "Peak Shaving", "icon": "ionizer", "active": true, "brightness": 90, "type": "oval_pill" },
      { "id": "bess_backup", "label": "Rezerwa 20%", "icon": "plug-off", "active": true, "brightness": 20, "type": "oval_pill" }
    ]
  },
  "ev_wallbox": {
    "id": "ev_wallbox",
    "column": "energy",
    "type": "stateful_dishwasher",
    "matterType": "Matter 1.5/1.6 Bidirectional EVSE Wallbox (V2H + Tariff)",
    "title": "ładowarka EV Wallbox",
    "iconName": "ev-car",
    "doorClosed": true,
    "state": "running",
    "progress": 54,
    "remainingMinutes": 44,
    "delay": "07:00",
    "programme": "Tylko Słońce PV + V2H • 11 kW",
    "cleanPlus": true,
    "speedPlus": true,
    "dryPlus": false,
    "waterTemp": 80,
    "span": { "c": 4, "r": 2 },
    "defaultSpan": { "c": 4, "r": 2 },
    "expanders": { "down": true, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": []
  },
  "matter_joint_fabric": {
    "id": "matter_joint_fabric",
    "column": "energy",
    "type": "matter_fabric_hub",
    "matterType": "Matter 1.6 Joint Fabric Datastore + HRAP Thread 1.4 + NFC",
    "title": "sieć Matter 1.6 Joint Fabric",
    "on": true,
    "threadNodes": 64,
    "ecosystems": ["Home Assistant", "Apple Home", "Google Home"],
    "nfcReadyCount": 3,
    "span": { "c": 4, "r": 1 },
    "defaultSpan": { "c": 4, "r": 1 },
    "expanders": { "down": true, "right": false, "diagonal": false },
    "expandedContent": { "secondaryButtons": true, "secondarySlider": false, "presets": true },
    "nestedTiles": []
  }
}
```