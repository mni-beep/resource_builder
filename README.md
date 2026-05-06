# 📄 DOCX Teaching Resource Builder

**Generate scaffolded paper-based teaching resources as `.docx` files — programmatically.**

Describe what you want, answer a few questions, and this tool produces a print-ready Word document complete with theory sections, worked examples, multiple-choice questions, short-answer prompts, extended-response scaffolds, practical-on-paper activities, diagrams, and reference sheets. No Microsoft Office required.

---

## ✨ What It Produces

| Resource Type | Example |
|---|---|
| **Single worksheet** | "Photosynthesis: Light & Dark Reactions" — 2 pages, theory + 5 MC + 3 short answer |
| **Multi-week booklet** | "Year 10 Electronics & Arduino" — 6 weeks × 4 lessons, cover page, contents, glossary |
| **Booklet + teacher edition** | Student booklet + separate answer key with teaching notes, marking criteria, and pedagogical guidance |
| **Unit guide / curriculum map** | "Year 9 Electricity" — landscape table with 7 columns: Week, Topic, Content, Activities, Resources, Assessment, Inclusion |
| **Assessment / exam** | "Semester 1 Physics Exam" — student paper + separate marking key |
| **Lab / practical manual** | "Chemistry Lab Manual" — procedures, report templates, scaffolded analysis |
| **Revision / study guide** | "VCE Biology Unit 3 Summary" — dense theory, reference tables, formula sheets |

---

## 🎨 Features

### Question Types (all paper-friendly)

- **Multiple choice** — 4 options per question, with easy "warm-up" questions that ramp in difficulty
- **Short answer** — sentence starters so students know how to begin
- **Extended response** — planning scaffolds (5-step prompts) then paragraph starters with lined spaces
- **Fill-in tables** — pre-built tables with some cells blank for student completion
- **Practical-on-paper** — spot-the-error tables, sketch-and-label boxes, checklist-driven drawing tasks
- **Code-writing by hand** — for programming/CS subjects
- **Worked examples** — step-by-step solved problems in bordered boxes
- **"Now you try"** — mirrored problems with answers hidden below a "cover this" divider

### Scaffolding Intensity (configurable)

| Level | What's baked in |
|---|---|
| **Heavy** | Sentence starters, planning steps, hints pointing to exact answer locations, hidden answers under every "try it" |
| **Moderate** | Hints, some sentence starters, checklists |
| **Light** | Minimal hints, mostly blank answer spaces |
| **Mix** | Easy questions heavily scaffolded, harder questions progressively less so |

### Structured Content Boxes

- **Callout boxes** — key concepts, learning objectives, critical rules, safety warnings, checklists
- **Worked example boxes** — bordered green boxes with step-by-step solutions
- **Hint boxes** — italic grey prompts directing students to exact answer locations
- **Answer boxes** — green left-border boxes with "✓ ANSWER" for teacher editions
- **Teaching note boxes** — amber left-border boxes with "⚠ TEACHING NOTE" for pedagogical guidance
- **Big display cells** — thick-bordered highlight boxes for key facts

### Diagrams & Images

- **ASCII diagrams** — circuits, flowcharts, and diagrams using box-drawing characters (╔═╗╚═╝). Works offline, always renders.
- **Open-source images** — pull from subject-specific repositories (OpenStax, Wikimedia Commons, PhET, NASA, USGS, Fritzing, and more). Images are fetched, verified for license compatibility, and embedded directly into the document.
- **Figure captions** — auto-generated below every image.

### Document Structure

- Cover pages with student detail fields
- Table of contents pages
- "How to use" pages (for booklets)
- Running headers and footers with page numbers
- Reference sections (glossaries, formula sheets, cheat sheets, pinout diagrams)

---

## 🚀 How It Works

### For Humans

1. **Describe your resource** to an AI agent — "I need a Year 9 worksheet on tectonic plate boundaries"
2. **Answer the interview** — the agent asks about resource type, subject, difficulty, question mix, scaffolding level, diagrams, etc.
3. **The agent builds it** — creates content modules, updates config, and runs the build
4. **Get your `.docx`** — open it in Word, Google Docs, or LibreOffice

### For AI Agents

The project contains two instruction files:
- **`AGENTS.md`** — mandatory interview process (9 questions covering every aspect of the resource)
- **`DOCX_BUILDER_REFERENCE.md`** — complete technical reference for every helper function, pattern, and convention

Agents never touch `build.js` or `common.js` — they only write content modules and update `resource.config.json`.

### Quick Start (manual)

```powershell
npm install          # install the docx library (one time)
# ... agent creates content/*.js files ...
node build.js        # generate the .docx
```

Output lands in `output/`.

---

## 📁 Project Structure

```
resource_builder/
├── build.js                    ← 🔒 Stable — the build pipeline (never edited)
├── common.js                   ← 🔒 Stable — shared formatting & helpers
├── resource.config.json        ← ✏️  Edit per resource (title, creator, filename, header, contentDir)
├── content/                    ← ✏️  One subfolder per resource
│   ├── electricity-unit-guide/ ←     Example: Year 9 Electricity
│   │   ├── 01-cover.js
│   │   └── 10-unit-guide.js
│   ├── photosynthesis-worksheet/←    Another resource
│   │   └── 01-worksheet.js
│   └── arduino-booklet-week1/  ←     Another resource
│       ├── 01-cover.js
│       ├── 02-contents.js
│       ├── 10-lesson1.js
│       └── ...
├── AGENTS.md                   ← 📖 Agent instructions (interview + build)
├── DOCX_BUILDER_REFERENCE.md   ← 📖 Full technical reference
├── package.json
└── output/                     ← Generated .docx files
```

---

## 🧱 Built On

- **[`docx`](https://www.npmjs.com/package/docx)** — Pure JavaScript `.docx` generator (Office Open XML). No Microsoft Office, no LibreOffice, no external binaries needed. Works anywhere Node.js runs.
- **Node.js** — Any recent version (14+).

---

## 📋 Supported Subjects (for image sourcing)

| Subject | Image Sources |
|---|---|
| Biology, Chemistry, Physics | OpenStax, PhET, Wikimedia Commons, PHIL (CDC) |
| Mathematics | OpenStax, Wikimedia Commons, Desmos |
| Computing / Electronics | Wikimedia Commons, Fritzing, Tinkercad |
| History / Social Sciences | OpenStax, Wikimedia Commons, Library of Congress, David Rumsey Maps |
| Geography / Earth Science | NASA Earth Observatory, USGS, Wikimedia Commons |
| General (any subject) | OpenClipArt, The Noun Project, Pixabay |

---

## 📄 License

This project is unlicensed. Use it to build whatever teaching resources you need.
