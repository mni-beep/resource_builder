# 📄📊 Teaching Resource Builder

**Generate scaffolded teaching resources as `.docx` worksheets/booklets AND `.pptx` slide decks — programmatically.**

Describe what you want, answer a few questions, and this tool produces print-ready Word documents and presentation-ready PowerPoint files. No Microsoft Office required to build.

---

## ✨ What It Produces

### DOCX (printable paper resources)

| Resource Type | Status |
|---|---|
| **Single worksheet** | ✅ Tested — 1–2 pages, theory + MC + short answer + extended response |
| **Multi-lesson booklet** | ✅ Tested — cover, contents, how-to page, lessons, glossary |
| **Booklet + teacher edition** | ✅ Tested — student booklet + separate answer key with marking criteria |
| **Unit guide / curriculum map** | ✅ Tested — landscape table, 7 columns, full term planning |
| **Assessment / exam** | 🆕 Available — sections, marking key support |
| **Lab / practical manual** | 🆕 Available — procedures + report templates |
| **Revision / study guide** | 🆕 Available — dense theory, reference tables |

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
- **Diagrams** — ASCII diagrams using box-drawing characters (offline-friendly), or open-source images from subject repositories (OpenStax, Wikimedia, PhET, NASA, etc.)
- **Teacher editions** — Separate build with green answer boxes, amber teaching notes, marking criteria

### PPTX
- **E5 instructional model** — Learning Intention → Engage → Explore → Explain → Elaborate → Evaluate, with colour-coded phase buttons and SM (Success Measure) bars
- **25+ slide types** — title, objectives, content, two-column, tables, images, worked examples, MC, short answer, extended response, checklists, callouts, big ideas, ASCII diagrams, custom
- **Speaker notes** — All answers, teaching guidance, and marking criteria go into speaker notes for Presenter View (no separate teacher file needed)
- **🎬 Embedded YouTube videos** — Auto-searches the web for relevant educational videos, downloads via `yt-dlp`, embeds playable MP4 directly in Engage/Explore slides (see below)
- **🖼️ Open-source images** — Auto-resolved from `content/images/` with figure captions
- **Companion worksheets** — E5 Elaborate phase can pair with a DOCX worksheet (activities + peer review + answer key)

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

Three instruction files control the workflow:
- **`AGENTS.md`** — Mandatory interview process (9 questions) + build phases + rules
- **`DOCX_BUILDER_REFERENCE.md`** — Complete DOCX helper reference (C.* and H.*)
- **`PPTX_BUILDER_REFERENCE.md`** — Complete PPTX helper reference (C.* and H.*)

### Quick Start

```powershell
npm install              # one-time: installs docx + pptxgenjs
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
├── common.js                   ← DOCX shared helpers (C)
├── common-pptx.js              ← PPTX shared helpers (C) + video download
├── resource.config.json        ← Per-resource config
├── content/                    ← Resource subfolders
│   ├── series-circuits-e5-lesson/     ← PPTX: E5 lesson with video
│   ├── series-circuits-worksheet/     ← DOCX: companion worksheet
│   ├── dichotomous-key-e5-lesson/     ← PPTX: E5 lesson example
│   ├── electronics-intro-pptx/        ← PPTX: standard lesson example
│   ├── electronics-project-booklet/   ← DOCX: multi-lesson booklet
│   ├── electricity-unit-guide/        ← DOCX: curriculum map
│   ├── performance-styles-booklet/    ← DOCX: multi-lesson booklet
│   ├── e5-voltage-lesson/             ← PPTX: E5 lesson example
│   ├── circuit-components-worksheet/  ← DOCX: single worksheet
│   ├── diseases-comparison-worksheet/ ← DOCX: comparison worksheet
│   ├── images/                        ← Shared image files
│   └── videos/                        ← Cached YouTube MP4s
├── tools/
│   └── yt-dlp.exe              ← YouTube downloader (one-time setup)
├── AGENTS.md                   ← Agent instructions
├── DOCX_BUILDER_REFERENCE.md   ← DOCX technical reference
├── PPTX_BUILDER_REFERENCE.md   ← PPTX technical reference
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
| `yt-dlp.exe` (in `tools/`) | YouTube video downloader | ✅ For video embedding |
| `ffmpeg` (system PATH or `tools/`) | Best-quality video encoding | ⚠️ Optional — fallback works without it |
| Node.js 14+ | Runtime | ✅ |

---

## 📄 License

Unlicensed. Use it to build whatever teaching resources you need.

