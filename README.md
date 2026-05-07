# 📄 DOCX Teaching Resource Builder

**Generate scaffolded paper-based teaching resources as `.docx` files — programmatically.**

Describe what you want, answer a few questions, and this tool produces a print-ready Word document complete with theory sections, worked examples, multiple-choice questions, short-answer prompts, extended-response scaffolds, practical-on-paper activities, diagrams, and reference sheets. No Microsoft Office required.

---

## ✨ What It Produces

| Resource Type | Example |
|---|---|
| **Single worksheet** | (TESTED WORKING) "Photosynthesis: Light & Dark Reactions" — 2 pages, theory + 5 MC + 3 short answer |
| **Multi-week booklet** | (TESTED WORKING) "Year 10 Electronics & Arduino" — 6 weeks × 4 lessons, cover page, contents, glossary |
| **Booklet + teacher edition** | (TESTED WORKING) Student booklet + separate answer key with teaching notes, marking criteria, and pedagogical guidance |
| **Unit guide / curriculum map** | (TESTED WORKING) "Year 9 Electricity" — landscape table with 7 columns: Week, Topic, Content, Activities, Resources, Assessment, Inclusion |
| **Assessment / exam** | (UNTESTED) "Semester 1 Physics Exam" — student paper + separate marking key |
| **Lab / practical manual** | (UNTESTED) "Chemistry Lab Manual" — procedures, report templates, scaffolded analysis |
| **Revision / study guide** | (UNTESTED)  "VCE Biology Unit 3 Summary" — dense theory, reference tables, formula sheets |

---

## 🎨 Features

### Question Types (all paper-friendly)

- **Multiple choice** — 4 options per question, with easy "warm-up" questions that ramp in difficulty (first answer often visible in a nearby hint box)
- **Short answer** — sentence starters so students know how to begin, plus fill-in-the-blank chains that build a full paragraph when completed
- **Extended response** — planning scaffolds (5-step prompts), then paragraph starters interleaved with lined writing spaces, plus a "what to include" checklist
- **Fill-in tables** — pre-built tables with some cells blank for student completion; reference tables above provide all the answers
- **Three-tier scaffolding tables** — worked example row (green borders) → hinted row (grey italic hints) → independent rows (blank cells), e.g. "Spot the Error" or "YES/NO/Why" activity tables
- **Comparison questions** — structured side-by-side tables comparing concepts, styles, or theories (e.g. "Rich Theatre vs Poor Theatre", "Series vs Parallel")
- **Practical-on-paper** — spot-the-error tables, sketch-and-label boxes, checklist-driven drawing tasks
- **Structured planning forms** — project proposals with material lists, component tables, and success criteria; pre-formatted testing logs (Test # | Setup | Result | Notes)
- **Hands-on demo activities** — step-by-step practical exercises (`C.scaffoldStep`) paired with post-activity reflection questions and sentence starters
- **Troubleshooting scenarios** — "Problem: X happens. What are possible causes?" with diagnosis steps and guided solution write-ups
- **Teach-back / explain-to-others** — structured prompts preparing students to teach a concept to a peer, including 5-step planning scaffolds and teaching script templates
- **Worked examples** — step-by-step solved problems in bordered green boxes, with bold step headings and bullet-point reasoning
- **"Now you try"** — mirrored problems with answers hidden below a "👇 ANSWER (cover this until you've tried)" divider
- **Code-writing by hand** — for programming/CS subjects

### Scaffolding Intensity (configurable)

| Level | What's baked in |
|---|---|
| **Heavy** | Sentence starters, planning steps, hints pointing to exact answer locations, hidden answers under every "try it" |
| **Moderate** | Hints, some sentence starters, checklists |
| **Light** | Minimal hints, mostly blank answer spaces |
| **Mix** | Easy questions heavily scaffolded, harder questions progressively less so |

### Structured Content Boxes

- **Callout boxes** — key concepts, learning objectives, critical rules, safety warnings, quick summaries, project overviews, teaching tips, activity goals (12+ pre-built titles with colour conventions)
- **Worked example boxes** — bordered green boxes with step-by-step solutions; can contain tables, ASCII diagrams, and multi-paragraph explanations
- **Hint boxes** — italic grey prompts directing students to exact answer locations (e.g. "Look at the reference table on page 3 — the answer is in the first row")
- **Lesson / phase banners** — full-width section dividers with number, title, and subtitle (e.g. "LESSON 2: Poor Theatre · Poland, 1960s" or "PHASE 3: Build & Finish · Weeks 5–6")
- **Quick summary boxes** — at-a-glance reference with bold-labelled bullets (Founder | Time | Goal | Main tools | Famous quote)
- **Activity goal callouts** — single-sentence objective for hands-on exercises, styled in the resource's primary colour
- **Teacher sign-off boxes** — milestone gates with checklist and signature line (e.g. "✅ TEACHER SIGN-OFF — BREADBOARD PROTOTYPE")
- **Completion checklists** — phase or project-end boxes with ☐ task items and a success message ("WELL DONE! You have completed your project. 🎉")
- **Project proposal forms** — structured input forms with component/materials tables and success criteria sections
- **Answer boxes** — green left-border boxes with "✓ ANSWER" for teacher editions
- **Teaching note boxes** — amber left-border boxes with "⚠ TEACHING NOTE" for pedagogical guidance
- **Big display cells** — thick-bordered highlight boxes for key facts, with custom background fill and centred header + body

### Diagrams & Images

- **ASCII diagrams** — circuits, flowcharts, and diagrams using box-drawing characters (╔═╗╚═╝). Works offline, always renders.
- **Open-source images** — pull from subject-specific repositories (OpenStax, Wikimedia Commons, PhET, NASA, USGS, Fritzing, and more). Images are fetched, verified for license compatibility, and embedded directly into the document.
- **Figure captions** — auto-generated below every image.

### Document Structure

- **Cover pages** — title + subtitle + decorative dividers + student detail fields (name, class, teacher, dates)
- **Table of contents pages** — multi-column tables with ☐ checkboxes, phase/week tags, section numbers, and page number slots
- **"How to use" pages** — workbook navigation with phase/lesson overview callouts and icon legend (📖 Theory, 📘 Worked Example, ✏️ Fill-In, etc.)
- **Running headers and footers** — italic grey header on every page; page numbers centred in footer
- **Phase / lesson banners** — full-width section dividers at the start of every major section
- **Drafting & sketch spaces** — labelled drawing areas (`.drawingSpace()`) for circuit schematics, enclosure designs, and project sketches
- **Reference sections** — glossaries (Term | Definition tables), resistor colour code tables (Colour | Digit | Multiplier | Example), soldering guides (good vs bad joints, common mistakes), 3D printing quick-reference (settings table + design considerations), formula sheets (Ohm's Law, LED resistor calculation with worked examples)
- **Comparison tables** — side-by-side feature comparison across styles/theories/formulas (e.g. 3 performance styles across 7 dimensions)
- **Project summary tables** — final reflection format (Aspect | Your answer) for post-project debrief
- **Teacher sign-off pages** — milestone gate sections with checklist and signature line
- **Completion pages** — final "PROJECT COMPLETION CHECKLIST" with ☐ items and celebratory message
- **Landscape curriculum maps** — 7-column tables for unit guides (Week | Topic | Content | Activities | Resources | Assessment | Inclusion) with multi-paragraph cells

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
