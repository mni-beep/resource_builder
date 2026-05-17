# 📊 Graph & Diagram Rendering Reference

> **Standalone reference for `tools/render_graph.py` — the headless image generation pipeline.**

This file is the single source of truth for generating publication-quality graphs, circuit schematics, and vector diagrams. It is consumed by both the DOCX pipeline (`build.js`) and the PPTX pipeline (`build-pptx.js`). After generating images, embed them via `C.imageFromFile()` (DOCX) or `C.imageSlide()` (PPTX).

---

## ⚡ Quick Start

```powershell
python tools/render_graph.py --spec content/my-resource/graphs/q1.json --out images/q1-graph.png
python tools/render_graph.py --example   # dump ready-to-use example specs
```

Store spec JSON files in a `graphs/` subfolder inside your content directory:
```
content/my-resource/
├── 01-cover.js
├── 10-section-a.js
├── graphs/
│   ├── iv-curve.json
│   ├── photoelectric.json
│   └── circuit-led-switch.json
```

---

## Spec Types

| `"type"` | Renderer | Output | Use Cases |
|---|---|---|---|
| `"graph"` | matplotlib | PNG (300 DPI) | I-V curves, force-distance, wave patterns, projectile trajectories, K_max vs f, energy level diagrams, any xy-plot |
| `"circuit"` | schemdraw | SVG | Circuit schematics — resistors, capacitors, diodes, transistors, opamps, logic gates, Arduino wiring |
| `"diagram"` | svgwrite | SVG | Force diagrams (free-body), ray optics, block diagrams, flowcharts, custom vector art |

---

## 1. Graph Spec (`"type": "graph"`)

```json
{
  "type": "graph",
  "title": "I-V Characteristic of an Ohmic Resistor",
  "xlabel": "Voltage (V)",
  "ylabel": "Current (A)",
  "xlabel_italic": true,
  "ylabel_italic": true,
  "width": 6, "height": 4, "dpi": 300,
  "grid": true,
  "x_intercept_line": true,
  "y_intercept_line": true,
  "xlim": [0, 12], "ylim": [0, 0.6],
  "series": [
    {
      "label": "R = 22 Ω",
      "type": "scatter",
      "x": [0, 2, 4, 6, 8, 10],
      "y": [0, 0.09, 0.18, 0.27, 0.36, 0.45],
      "style": {"color": "#2B579A", "marker": "o", "markersize": 6}
    }
  ],
  "trend_line": [
    {
      "label": "Line of best fit",
      "x": [0, 2, 4, 6, 8, 10],
      "y": [0, 0.09, 0.18, 0.27, 0.36, 0.45],
      "degree": 1,
      "color": "#C00000"
    }
  ],
  "legend": true
}
```

### Graph spec fields

| Field | Type | Description |
|---|---|---|
| `title` | string | Graph title (bold, centered) |
| `xlabel` / `ylabel` | string | Axis labels |
| `xlabel_italic` / `ylabel_italic` | bool | Italicise axis labels (for variable names per VCAA) |
| `width` / `height` | float | Figure dimensions in inches (default 6×4) |
| `dpi` | int | Output resolution (default 300) |
| `grid` | bool | Show grid lines |
| `x_intercept_line` / `y_intercept_line` | bool | Draw axis-intercept lines at 0 |
| `xlim` / `ylim` | [min, max] | Axis limits |
| `series` | array | Data series to plot (see below) |
| `trend_line` | array | Best-fit lines (linear regression or nth-degree polyfit) |
| `annotations` | array | Text labels with optional arrows |
| `legend` | bool | Show legend |
| `x_ticks` / `y_ticks` | array | Custom tick positions |

**Series types:** `"line"`, `"scatter"`, `"bar"`, `"errorbar"`, `"fill"`

**Style object:** `{"color": "#hex", "linewidth": 1.5, "linestyle": "-", "marker": "o", "markersize": 6, "alpha": 1.0}`

---

## 2. Circuit Spec (`"type": "circuit"`)

Circuit schematics are rendered via **schemdraw** (v0.22). Schemdraw traces a **path** — each element extends from the endpoint of the previous one. To form a closed circuit, the path must return to its starting point.

### 2.1 Layout Modes

Three layout modes are supported:

| `"layout"` | Behaviour | Use when |
|---|---|---|
| `"series"` (default) | **Auto-layout.** Battery on left rail (UP), top wire RIGHT, components on right rail (DOWN), switch on bottom return (LEFT), close back to battery. Just list components; engine builds the rectangle. | Simple series circuits — 90% of teaching resources |
| `"parallel"` | **Branches via push/pop.** Main loop as series, with `{"branch": [...]}` sub-arrays for parallel paths. | Circuits with parallel components, ammeters/voltmeters in branches |
| `"manual"` | **Explicit directions per element.** User responsible for correctness. | Complex topologies the auto-layout can't handle |

### 2.2 Auto-Layout Series (`"layout": "series"`)

The engine automatically builds a clockwise rectangular loop. Just list the components:

```json
{
  "type": "circuit",
  "layout": "series",
  "elements": [
    {"element": "battery", "label": "9V"},
    {"element": "resistor", "label": "R₁ = 10kΩ"},
    {"element": "led", "label": "LED"},
    {"element": "switch", "label": "SW1"}
  ]
}
```

**What the engine does:**
1. Battery goes **UP** on the left rail (positive terminal at top, per convention)
2. Wire goes **RIGHT** across the top rail
3. First half of components go **DOWN** on the right rail
4. Wire goes **LEFT** across the bottom return
5. Remaining components + switch go on the bottom return rail
6. Final wire closes back to battery

**Rules the engine enforces:**

| Rule | Description |
|---|---|
| **R1 — Loop closure** | Net displacement is guaranteed (0,0) — the circuit always closes |
| **R2 — Battery position** | Always on left rail, positive UP (conventional current clockwise) |
| **R3 — Switch placement** | Always on the bottom return rail (conventional position) |
| **R4 — Component distribution** | Components evenly split between right rail (DOWN) and bottom rail (LEFT) |
| **R5 — Ground handling** | If a `"ground"` element is present, the circuit terminates at ground (no loop closure needed — valid open circuit) |

**What goes where (distribution logic):**

| Element type | Where it goes |
|---|---|
| `battery`, `battery_cell`, `source_v`, `source_sin`, `source_i` | Left rail, UP |
| `resistor`, `capacitor`, `inductor`, `diode`, `zener`, `led`, `lamp`, `motor`, `fuse`, `thermistor`, `photoresistor`, `speaker`, `solar`, `relay` | Right rail (first half) or bottom rail (second half) |
| `switch`, `switch_spdt`, `switch_dpdt`, `button` | **Always** bottom return rail |
| `ground`, `ground_signal`, `ground_chassis` | End of circuit — terminates path |

### 2.3 Parallel Branches (`"layout": "parallel"`)

```json
{
  "type": "circuit",
  "layout": "parallel",
  "elements": [
    {"element": "battery", "label": "9V"},
    {"branch": [
      {"element": "resistor", "direction": "right", "label": "R₁ = 10kΩ"},
      {"element": "led", "direction": "right", "label": "LED1"}
    ]},
    {"branch": [
      {"element": "resistor", "direction": "right", "label": "R₂ = 22kΩ"},
      {"element": "led", "direction": "right", "label": "LED2"}
    ]},
    {"element": "switch", "label": "SW1"}
  ]
}
```

Each branch saves the current drawing position with `push()`, draws its components, then restores with `pop()` so the next branch starts from the same node.

> **⚠️ Branch constraint:** All elements within a branch must end at the same endpoint for proper rejoin. Use equal-length components or adjust with `.length()`.

### 2.4 Manual Mode (`"layout": "manual"`)

For complex topologies beyond auto-layout. You specify explicit `"direction"` per element:

```json
{
  "type": "circuit",
  "layout": "manual",
  "elements": [
    {"element": "battery", "direction": "up", "label": "9V"},
    {"element": "line", "direction": "right"},
    {"element": "resistor", "direction": "down", "label": "R₁ = 10kΩ"},
    {"element": "line", "direction": "left"},
    {"element": "led", "direction": "down", "label": "LED"},
    {"element": "line", "direction": "right"},
    {"element": "switch", "direction": "down", "label": "SW1"},
    {"element": "line", "direction": "left"}
  ]
}
```

> **⚠️ Manual validation:** In manual mode, YOU are responsible for loop closure. Trace your directions on paper: do they return to (0,0)?

### 2.5 Key schemdraw Features Used

| Feature | What it does | Used in |
|---|---|---|
| `.up()`, `.down()`, `.left()`, `.right()` | Set element direction AND where next element starts | All modes |
| `.tox(target_anchor)` | Extend element horizontally to match target's x-coordinate | Loop closure in auto-layout |
| `.toy(target_anchor)` | Extend element vertically to match target's y-coordinate | Loop closure |
| `.at(anchor)` | Place element at a specific anchor of another element | Parallel mode, manual |
| `.anchor(name)` | Align element's named anchor with current position | Alignment |
| `.push()` / `.pop()` | Save/restore drawing position for branches | Parallel mode |
| `.dot()` / `.idot()` | Junction dot at end/start of element | All modes |
| `.length(n)` | Set exact length for a two-terminal element | Custom sizing |
| `.label(text, loc)` | Add label at specified location | All modes |
| `.reverse()` | Reverse element direction (e.g., LED polarity) | All modes |
| `Wire('|-')`, `Wire('n')`, `Wire('c')` | Auto-routed connecting wires between anchors | Manual mode |
| `Line(arrow='->')` | Arrowhead on wire (current direction indicator) | Manual mode |
| `Switch(action='open')` | Draw switch in open position | All modes |

### 2.6 Element Parameter Reference

Many elements accept parameters for visual customization:

```json
{"element": "capacitor", "polar": true, "label": "10μF"}
{"element": "led", "fill": "red", "label": "LED"}
{"element": "diode", "fill": true, "label": "D1"}
{"element": "switch", "action": "close", "label": "SW1"}
{"element": "inductor", "core": true, "label": "L1"}
{"element": "resistor", "style": "iec", "label": "R1"}
```

| Parameter | Applies to | Values | Effect |
|---|---|---|---|
| `polar` | Capacitor, Capacitor2 | `true`/`false` | Polarized capacitor symbol |
| `fill` | Diode, LED, Zener, Schottky, SCR, Triac | `true`/`"red"`/`"green"` etc. | Fill the diode body |
| `action` | Switch, SwitchSpdt | `"open"`, `"close"` | Switch position |
| `nc` | Switch, Button | `true`/`false` | Normally-closed switch |
| `core` | Inductor | `true`/`false` | Show magnetic core |
| `circle` | BjtNpn, BjtPnp, JFetN, JFetP, NMos, PMos | `true`/`false` | Enclose transistor in circle |
| `t1`, `t2` | Transformer | `int` or `tuple` | Turns on primary/secondary |
| `loop` | Transformer | `true`/`false` | Loop core vs straight core |

### 2.7 Complete Element Catalog

All elements available in schemdraw v0.22 (underscore_case names):

| Category | Elements |
|---|---|
| **Passives** | `resistor`, `resistor_var`, `capacitor`, `capacitor2`, `capacitor_var`, `inductor`, `inductor2`, `fuse`, `thermistor`, `photoresistor`, `ldr`, `memristor`, `crystal`, `cpe` |
| **Semiconductors** | `diode`, `zener`, `led`, `led2`, `schottky`, `diode_tunnel`, `diode_shockley`, `diode_tvs`, `varactor`, `diac`, `triac`, `scr`, `photodiode`, `neon` |
| **Sources** | `battery`, `battery_cell`, `battery_double`, `source_v`, `source_i`, `source_sin`, `source_pulse`, `source_square`, `source_triangle`, `source_ramp`, `source_controlled`, `source_controlled_i`, `source_controlled_v`, `solar` |
| **Switches** | `switch`, `switch_spdt`, `switch_spdt2`, `switch_dpst`, `switch_dpdt`, `switch_reed`, `switch_rotary`, `switch_dip`, `button`, `breaker` |
| **Meters** | `meter_v`, `meter_a`, `meter_i`, `meter_ohm`, `meter_analog`, `meter_digital`, `meter_arrow`, `oscilloscope` |
| **Transistors** | `bjt_npn`, `bjt_pnp`, `bjt_npn2`, `bjt_pnp2`, `nfet`, `pfet`, `nfet2`, `pfet2`, `jfet`, `jfet_n`, `jfet_p`, `jfet_n2`, `jfet_p2`, `nmos`, `pmos`, `nmos2`, `pmos2`, `npn_schottky`, `pnp_schottky`, `igbt_n`, `igbt_p`, `npn_photo`, `pnp_photo`, `hemt` |
| **Opamps & ICs** | `opamp`, `ic`, `ic_dip`, `ic_555`, `ic_pin`, `multiplexer`, `seven_segment`, `voltage_regulator` |
| **Connectors** | `line`, `wire`, `dot`, `dotdotdot`, `arrow`, `arrowhead`, `gap`, `jumper`, `terminal`, `header`, `plug`, `jack` |
| **Ground/Power** | `ground`, `ground_signal`, `ground_chassis`, `vss`, `vdd` |
| **Audio** | `speaker`, `mic`, `audio_jack` |
| **Transformers** | `transformer` |
| **Motors/Actuators** | `motor`, `lamp`, `lamp2`, `relay` |
| **RF** | `antenna`, `antenna_loop`, `antenna_loop2`, `coax`, `triax`, `spark_gap` |
| **Vacuum tubes** | `vacuum_tube`, `tube_diode`, `triode`, `tetrode`, `pentode`, `nixie_tube` |
| **Compound** | `optocoupler`, `rectifier`, `wheatstone`, `current_mirror`, `voltage_mirror` |
| **Flowchart** | `box`, `ellipse`, `diamond`, `parallelogram`, `container`, `connect` |

---

## 3. Diagram Spec (`"type": "diagram"`)

```json
{
  "type": "diagram",
  "width": 500, "height": 400,
  "background": "#FFFFFF",
  "shapes": [
    {"type": "rect", "attrs": {"insert": [200, 250], "size": [100, 80], "fill": "#E8F0FE", "stroke": "#2B579A", "stroke_width": 2}},
    {"type": "circle", "attrs": {"center": [100, 100], "r": 30, "fill": "#FFE0E0"}}
  ],
  "labels": [
    {"text": "m", "attrs": {"insert": [235, 295], "font_family": "Calibri", "font_size": 14, "fill": "#333333", "font_style": "italic"}}
  ],
  "arrows": [
    {"start": [250, 330], "end": [250, 380], "color": "#C00000", "stroke_width": 2.5}
  ]
}
```

---

## 4. VCAA Compliance

All rendered output uses VCAA-compliant defaults:
- **Font:** Calibri 11pt (body), 13pt (titles), 10pt (ticks)
- **Math variables:** Set `"xlabel_italic": true` / `"ylabel_italic": true` for italic axis labels
- **Colours:** Clean black-on-white, muted grid (#cccccc), blue primary (#2B579A)
- **Resolution:** 300 DPI PNG for sharp DOCX/PPTX embedding
- **Dimensions:** 6×4 inches default — fits portrait A4 with margins

---

## 5. Embedding in DOCX and PPTX

### DOCX embedding

```js
// In your DOCX content module:
const graphPath = path.join(__dirname, '..', '..', 'images', 'q13-photoelectric.png');

content.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [C.imageFromFile(graphPath, { width: 450, height: 300 })]
}));
content.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 160 },
  children: [new TextRun({ text: "Figure 1: K_max vs frequency for sodium", italics: true, size: 18, color: "595959" })]
}));
```

### PPTX embedding

```js
// In your PPTX content module:
C.imageSlide(
  "I-V Characteristic of an Ohmic Resistor",
  "images/iv-curve.png",
  "Figure 1: Current is directly proportional to voltage (R = 22 Ω).",
  { notes: "Key teaching point: gradient = 1/R" }
)
```

Or with content slides that combine text + graph:

```js
C.contentSlide("Photoelectric Effect Results", [
  "The graph shows K_max vs frequency for sodium.",
  "Below the threshold frequency f₀, no electrons are emitted.",
], {
  image: "images/photoelectric-graph.png",
  imageSize: { x: 5.5, y: 1.8, w: 4.5, h: 3.2 },
  notes: "f₀ ≈ 5.5 × 10¹⁴ Hz, φ = hf₀ ≈ 2.3 eV"
})
```

---

## 6. Dump Example Specs

```powershell
python tools/render_graph.py --example
```

Prints ready-to-use example JSON specs for all three renderer types.

---

## 7. Dependencies

All installed in the project Python environment:

```powershell
python -m pip install matplotlib numpy schemdraw svgwrite
```

| Package | Version | Role |
|---|---|---|
| matplotlib | 3.10.9 | Scientific graphs (Agg backend, mathtext for equations) |
| numpy | 2.4.5 | Numerical arrays, polynomial fitting |
| schemdraw | 0.22 | Electrical circuit schematics |
| svgwrite | 1.4.3 | Custom vector diagrams |

---

> **End of Reference.** For DOCX content module construction, see `DOCX_BUILDER_REFERENCE.md`. For PPTX slide construction, see `PPTX_BUILDER_REFERENCE.md`.
