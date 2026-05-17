# 📄📊 Teaching Resource Builder

**Generate scaffolded teaching resources as `.docx` worksheets/booklets AND `.pptx` slide decks — programmatically.**

Describe what you want, answer a few questions, and an AI agent produces print-ready Word documents and presentation-ready PowerPoint files. No Microsoft Office required to build. Backed by 7 modular instruction files that guide agents through interview → content creation → graph rendering → build.

---

## 🌐 Web Questionnaire

Use the hosted questionnaire to quickly generate a structured prompt for an AI coding agent. The form supports two modes:
- **📋 Guided questionnaire** — answer structured questions about your resource
- **✏️ Custom instructions** — describe exactly what you want in your own words

👉 **[https://webtoolquestionaire-git-main-mni-beeps-projects.vercel.app/](https://webtoolquestionaire-git-main-mni-beeps-projects.vercel.app/)**

Fill in the form (or type your instructions), copy the generated prompt, and paste it into your AI agent to build the resource.

---

## ✨ What It Produces

### DOCX (printable paper resources)

| Resource Type | Status |
|---|---|
| **Single worksheet** | ✅ Tested — 1–2 pages, theory + MC + short answer + extended response |
| **Multi-lesson booklet** | ✅ Tested — cover, contents, how-to page, lessons, glossary |
| **Booklet + teacher edition** | ✅ Tested — student booklet + separate answer key with marking criteria |
| **Unit guide / curriculum map** | ✅ Tested — landscape table, 7 columns, full term planning |
| **Assessment / exam** | ✅ Tested — sections, marking key, VCAA-compliant math styling (italic variables, native DOCX equations) |
| **Lab / practical manual** | 🆕 Available — procedures + report templates |
| **Revision / study guide** | 🆕 Available — dense theory, reference tables |
| **In-class activities** | 🆕 Available — card sorts, station rotations, group challenges, observation stations |
| **Printed resources** | 🆕 Available — auto-generated card sets, templates, recording sheets, checklists, cut-out materials |
| **Problem set** | ✅ Tested — topic-organised practice with worked examples, "now you try" mirrored pairs, integrated answer key (Physics fields tested) |

### PPTX (screen-presented slide decks)

| Resource Type | Status |
|---|---|
| **E5 lesson deck** | ✅ Tested — 5-phase (Engage→Explore→Explain→Elaborate→Evaluate), colour-coded |
| **Standard lesson deck** | ✅ Tested — title → objectives → theory → worked examples → questions → summary |
| **Revision deck** | 🆕 Available — topic review with section dividers |
| **Assessment walkthrough** | 🆕 Available — slide-by-slide questions, answers in speaker notes |
| **Lab/practical intro** | 🆕 Available — safety, procedure, checklist |
| **Short presentation** | 🆕 Available — 5–8 slides, quick intro or recap |

---

## 🎨 Key Features

### DOCX
- **14+ question types** — MC, short answer, extended response, fill-in tables, three-tier scaffolding, comparison tables, practical-on-paper, code-writing
- **Configurable scaffolding** — Heavy (sentence starters + hidden answers), Moderate (hints + checklists), Light (blank spaces), or Mix
- **Structured boxes** — Callout boxes, worked examples (green), hint boxes (grey), lesson banners, teacher sign-off, completion checklists
- **Diagrams** — ASCII diagrams using box-drawing characters (offline-friendly), open-source images from subject repositories (OpenStax, Wikimedia, PhET, NASA, etc.), OR **programmatically rendered graphs/diagrams** via `tools/render_graph.py` (matplotlib for scientific graphs, schemdraw for circuit schematics, svgwrite for vector diagrams)
- **VCAA exam styling** — Italic scalar variables, native DOCX math equations (`C.mathPara()`, `C.mathFormula()`, `C.mathSubscript()`), clean exam body without decorative colours. See [`VCAA_STYLING.md`](VCAA_STYLING.md).
- **Teacher editions** — Separate build with green answer boxes, amber teaching notes, marking criteria, confidential cover page. See [`TEACHER_EDITION.md`](TEACHER_EDITION.md).
- **Printed resource generator** — Auto-built card sets, jigsaw pieces, recording sheets, peer-review checklists, drawing templates — cut-out ready with dashed borders
- **Problem set builder** — Topic-organised practice with graduated difficulty (Easy→Hard within sections), worked examples + mirrored "now you try" pairs, and integrated or separate answer key
- **Word corruption protection** — Dynamic numbering registry eliminates unused abstractNum definitions that caused Word to reject large documents

### PPTX
- **E5 instructional model** — Learning Intention → Engage → Explore → Explain → Elaborate → Evaluate, with colour-coded phase buttons and SM (Success Measure) bars
- **25+ slide types** — title, objectives, content, two-column, tables, images, worked examples, MC, short answer, extended response, checklists, callouts, big ideas, ASCII diagrams, custom
- **Speaker notes** — All answers, teaching guidance, and marking criteria go into speaker notes for Presenter View (no separate teacher file needed)
- **🎬 Embedded YouTube videos** — Auto-searches the web for relevant educational videos, downloads via `yt-dlp`, embeds playable MP4 directly in Engage/Explore slides (see below)
- **🖼️ Open-source images** — Auto-resolved from `content/images/` with figure captions
- **📊 Rendered graphs & diagrams** — Generate publication-quality scientific graphs, circuit schematics, and vector diagrams from JSON specs using `tools/render_graph.py`. Embed via `C.imageSlide()`. See `PPTX_BUILDER_REFERENCE.md` Section 11.
- **Companion worksheets** — E5 Elaborate phase can pair with a DOCX worksheet (activities + peer review + answer key)

### Circuit Diagram Engine ⚡

A complete circuit layout system built on schemdraw (v0.22) with 200+ elements across 16 categories:

| Mode | Behaviour |
|---|---|
| **Series** (auto-layout) | Just list components — engine builds a proper clockwise rectangular loop. Battery on left, components on right/bottom rails, switch on return. Guaranteed loop closure. |
| **Parallel** | Branches via `{"branch": [...]}` objects with automatic push/pop node management |
| **Manual** | Full control with explicit directions per element |

```powershell
python tools/render_graph.py --spec content/my-resource/graphs/led-circuit.json --out images/led-circuit.svg
```

### Image Acquisition
- **Unified image downloader** — `tools/download_image.py` is the single entrypoint for direct image URLs and page scraping
- **Browser-assisted fallback** — `tools/browser_image_helper.cjs` renders JS-heavy pages with Playwright and downloads the best visible candidate when static scraping is not enough
- **Source-aware routing** — Handles direct URLs, Wikimedia Commons, OpenClipart, PHIL/CDC, OpenStax, Pixabay, NASA, and similar sources without switching workflows
- **Safer downloads** — Rejects HTML masquerading as image files, keeps browser-like headers, and uses screenshot fallback for canvas/SPA cases such as Desmos
- **Known limits** — Cloudflare/authenticated sources such as Library of Congress, David Rumsey, and most Fritzing/Tinkercad project links still require manual capture

### Graph & Diagram Generation 📊

| Renderer | Tool | Output | Use Cases |
|---|---|---|---|
| Scientific graphs | `matplotlib` (headless Agg backend) | PNG @ 300 DPI | I-V curves, force-distance, wave patterns, projectile trajectories, K_max vs f, energy level diagrams |
| Circuit schematics | `schemdraw` | SVG | Resistors, capacitors, diodes, transistors, opamps, logic gates, Arduino/electronics wiring |
| Vector diagrams | `svgwrite` | SVG | Force diagrams (free-body), ray optics, block diagrams, flowcharts |

```powershell
# Generate a graph from a JSON spec
python tools/render_graph.py --spec content/my-resource/graphs/iv-curve.json --out images/iv-curve.png

# Dump example specs for all three renderer types
python tools/render_graph.py --example
```

All rendered output uses **VCAA-compliant defaults** (Calibri 11pt, clean black-on-white, italic axis labels for variables, 300 DPI). Full spec API in [`GRAPH_RENDERING.md`](GRAPH_RENDERING.md).

### YouTube Video Pipeline 🎬

| Step | What happens |
|---|---|
| 1. Search | Agent searches YouTube via browser, extracts real video titles/channels/URLs (never placeholders) |
| 2. Download | `yt-dlp.exe` in `tools/` downloads the video on first build, caches to `content/videos/` |
| 3. Embed | Video appears in the **right column of Engage or Explore slides** — not a standalone slide |
| 4. Playback | PowerPoint-compatible MP4 (H.264 video + AAC audio). `ffmpeg` is optional — without it, the builder uses a single native MP4 stream that still plays in PowerPoint |

### Corruption Detection 🛡️

Both `build.js` and `build-pptx.js` now scan assembled content for:
- Nested arrays (missing `...` spread on array-returning helpers)
- `null`/`undefined` elements
- Invalid slide definition types

If corruption is detected, the build **refuses to continue** with a clear error message naming the likely cause.

---

## 🚀 How It Works

### For Users

1. **Describe your resource** to an AI agent — "I need a Year 9 E5 lesson on series circuits with an embedded video"
2. **Answer the interview** — the agent asks about format (DOCX/PPTX), resource type, subject, difficulty, question mix, scaffolding, images, videos, etc.
3. **The agent builds it** — creates content modules, updates config, runs the build
4. **Get your file** — open `.docx` in Word or `.pptx` in PowerPoint

### For AI Agents

**7 modular instruction files** — each covers one concern:

| File | Covers |
|---|---|
| **`AGENTS.md`** | Entry point — mandatory interview (9 questions), subject auto-detect gates, Phase 2 build steps, rules |
| **`DOCX_BUILDER_REFERENCE.md`** | DOCX helpers (`C.*` and `H.*`), content module template, booklet structure, scaffolding, embedding |
| **`PPTX_BUILDER_REFERENCE.md`** | PPTX helpers (`C.*` and `H.*`), slide types, E5 model helpers, embedding |
| **`GRAPH_RENDERING.md`** | Graph/circuit/diagram JSON spec API — matplotlib, schemdraw (200+ elements, 3 layout modes), svgwrite |
| **`TEACHER_EDITION.md`** | Teacher/answer editions — green answer boxes, amber teaching notes, marking criteria, cover page |
| **`VCAA_STYLING.md`** | VCAA exam math styling — 6 rules, italic variables, native DOCX equations, clean exam body |
| **`E5_MODEL_BIBLE.md`** | E5 pedagogy — what good content looks like per phase, failure modes, quality gate |

### Quick Start

```powershell
npm install              # one-time: installs project dependencies, including Playwright
npx playwright install chromium   # one-time: enables browser-backed image extraction
python -m pip install matplotlib numpy schemdraw svgwrite  # one-time: graph/diagram rendering
# ... agent creates content modules ...
node build.js            # generate .docx
node build-pptx.js       # generate .pptx
npm run build:pptx       # alias
```

Output lands in `output/`.

---

## 📁 Project Structure

```
resource_builder/
├── build.js                    ← DOCX build pipeline (+ validation)
├── build-pptx.js               ← PPTX build pipeline (+ validation)
├── common.js                   ← DOCX shared helpers (C) — includes math equation helpers (C.mathPara, C.mathFormula, etc.)
├── common-pptx.js              ← PPTX shared helpers (C) + video download
├── resource.config.json        ← Per-resource config
├── content/                    ← Resource subfolders
│   ├── vce-physics-u34-exam/          ← DOCX: VCE Units 3&4 exam (20 MC + 19 ER, 120 marks, marking key, VCAA math styling)
│   ├── physics-fields-problem-set/    ← DOCX: Physics fields problem set (proper math equations via C.math* helpers)
│   ├── series-circuits-worksheet/     ← DOCX: companion worksheet
│   ├── dichotomous-key-e5-lesson/     ← PPTX: E5 lesson example
│   ├── electronics-intro-pptx/        ← PPTX: standard lesson example
│   ├── electronics-project-booklet/   ← DOCX: multi-lesson booklet
│   ├── electricity-unit-guide/        ← DOCX: curriculum map
│   ├── performance-styles-booklet/    ← DOCX: multi-lesson booklet
│   ├── e5-voltage-lesson/             ← PPTX: E5 lesson example
│   ├── circuit-components-worksheet/  ← DOCX: single worksheet
│   ├── diseases-comparison-worksheet/ ← DOCX: comparison worksheet
│   ├── diseases-unit-guide/           ← DOCX: week-by-week unit guide (landscape 7-column table)
│   ├── atomic-theory-activities/      ← DOCX: in-class activities (5 activity modules + teacher notes)
│   ├── atomic-theory-printables/      ← DOCX: printed resources (cards, templates, checklists)
│   ├── images/                        ← Shared image files
│   └── videos/                        ← Cached YouTube MP4s
├── tools/
│   ├── render_graph.py         ← Graph/circuit/diagram renderer (matplotlib + schemdraw + svgwrite)
│   ├── browser_image_helper.cjs ← Playwright helper for JS-rendered image extraction
│   ├── download_image.py        ← Unified image downloader / scraper entrypoint
│   ├── validate.js              ← Content module validator
│   ├── diagnose_docx.js         ← DOCX corruption diagnostics
│   └── yt-dlp.exe              ← YouTube downloader (one-time setup)
├── AGENTS.md                   ← Agent instructions
├── DOCX_BUILDER_REFERENCE.md   ← DOCX technical reference
├── PPTX_BUILDER_REFERENCE.md   ← PPTX technical reference
├── GRAPH_RENDERING.md          ← 🆕 Graph/circuit/diagram spec API (standalone pipeline)
├── TEACHER_EDITION.md          ← 🆕 Teacher/answer edition patterns
├── VCAA_STYLING.md             ← 🆕 VCAA exam math styling rules
├── E5_MODEL_BIBLE.md           ← E5 pedagogy reference
├── README.md                   ← This file
├── package.json
└── output/                     ← Generated .docx/.pptx files
```

---

## 🧱 Dependencies

| Dependency | Purpose | Required? |
|---|---|---|
| [`docx`](https://www.npmjs.com/package/docx) | Pure JS `.docx` generator | ✅ For DOCX |
| [`pptxgenjs`](https://www.npmjs.com/package/pptxgenjs) | Pure JS `.pptx` generator | ✅ For PPTX |
| [`playwright`](https://www.npmjs.com/package/playwright) | Browser-rendered image extraction for JS-heavy sources | ⚠️ Needed for automated web image capture |
| Python + `requests` + `beautifulsoup4` | Unified image downloader and source-specific scraping | ⚠️ Needed for automated web image capture |
| Python + `matplotlib` + `numpy` + `schemdraw` + `svgwrite` | Graph/circuit/diagram rendering (`tools/render_graph.py`) | ⚠️ Needed for programmatic diagram generation |
| `yt-dlp.exe` (in `tools/`) | YouTube video downloader | ✅ For video embedding |
| `ffmpeg` (system PATH or `tools/`) | Best-quality video encoding | ⚠️ Optional — fallback works without it |
| Node.js 18+ | Runtime | ✅ |

---

## 📄 License

Unlicensed. Use it to build whatever teaching resources you need.

