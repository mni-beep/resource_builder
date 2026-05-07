# AGENTS.md — Project Instructions for AI Agents

## What this project is

A Node.js pipeline that generates `.docx` teaching resources (worksheets, booklets, unit guides, assessments, lab manuals, revision guides) from JavaScript content modules. The full specification is in `DOCX_BUILDER_REFERENCE.md`.

## Your job as an agent

When a user asks you to create a teaching resource, first ask whether they:
1. **Give custom instructions** — they tell you exactly what they want in their own words, and you build from that
2. **Go through the questionnaire** — you walk through the structured interview below to gather requirements

If they choose custom instructions, extract the details you need and skip to Phase 2. If they choose the questionnaire, proceed with Phase 1 below.

Never assume — always ask. Never write code before you have all the answers.

---

## Phase 1: INTERVIEW (only if user chose the questionnaire)

Ask the following questions. The questions you ask **branch based on Question 1** — the resource type determines which follow-ups are relevant. Do NOT ask every question for every resource type. Tailor the interview to what the user wants.

---

### Question 1: RESOURCE TYPE (determines everything else)

What kind of document is this?
- [ ] **Single worksheet** (1–2 pages, theory + questions only)
- [ ] **Multi-lesson booklet** (several lessons with cover page, contents, references)
- [ ] **Multi-lesson booklet + paired teacher edition** (student booklet + separate answer key with teaching notes)
- [ ] **Week-by-week unit guide** (teacher planning document — curriculum map table with columns for Week, Topic, Content, Activities, Resources, Assessment, Inclusion)
- [ ] **Assessment / exam** (questions only, possibly with separate marking key)
- [ ] **Lab / practical manual** (procedures + report templates)
- [ ] **Revision / study guide** (dense theory, reference tables, no questions)
- [ ] **Other** (describe): ___________

---

### Question 2: SUBJECT & SCOPE (ask for ALL resource types)

- Subject area: ___________
- Specific topic(s) to cover: ___________
- If multiple topics, list them in order: ___________

---

### Question 3: YEAR LEVEL & DIFFICULTY (ask for ALL resource types)

- Year/grade: ___________
- Difficulty: [ ] Lower ability / heavily scaffolded  [ ] Mixed ability  [ ] Extension / advanced
- Reading age (approximate): ___________

---

### Question 4: STRUCTURE (tailor to resource type)

**For single worksheets:**
- Theory first then questions, or interleaved? ___________

**For multi-lesson booklets / unit guides:**
- How many weeks does this span? ___________
- How many lessons per week? ___________
- Total number of lessons: ___________ (calculated: weeks × lessons/week)
- Should it have a cover page? [ ] Yes  [ ] No
- Should it have a contents page? [ ] Yes  [ ] No
- Should it have a "How to Use This Workbook" page? [ ] Yes  [ ] No
- Should it have a reference section (glossary, formula sheet, cheat sheet)? [ ] Yes  [ ] No

**For booklet + teacher edition (if Question 1 selected that option):**
- Should the teacher edition include a "How to Teach" guide (pacing, common misconceptions, marking approach)? [ ] Yes  [ ] No
- Should each question include marking criteria with point breakdowns? [ ] Yes  [ ] No
- Teacher edition output filename: ___________

**For unit guide / curriculum map tables:**
- What columns should the table have? (Default: Week | Topic | Content | Activities | Resources & Experiments | Assessment & Homework | Disability Inclusion Adjustment)
- Should it be landscape or portrait? [ ] Landscape (recommended for 6+ columns)  [ ] Portrait

**For assessments / exams:**
- How many sections? ___________
- Should there be a separate marking key document? [ ] Yes  [ ] No
- Time limit (if stated on cover): ___________

**For lab / practical manuals:**
- How many labs/practicals? ___________
- Should each have a procedure section AND a report template? [ ] Yes  [ ] No
- Any safety notes required? ___________

**For revision / study guides:**
- How many topics to cover? ___________
- Dense summary or detailed reference? [ ] Summary  [ ] Detailed

---

### Question 5: QUESTION MIX (ask for worksheets, booklets, assessments)

> **Skip this section for unit guides, revision/study guides, and lab manuals** (they use tables, not student questions).

For each section/lesson, what question types?
- [ ] Multiple choice — how many per section? ___
- [ ] Short answer with sentence starters — how many? ___
- [ ] Extended response with planning scaffolds — how many? ___
- [ ] Fill-in tables / diagrams
- [ ] Practical-on-paper activities
- [ ] Code-writing by hand (for programming/CS subjects)
- [ ] Worked examples — how many per section? ___
- [ ] "Now you try" mirrored problems with hidden answers

**If the user can't specify exact numbers, use sensible defaults:**
| Resource type | Default question mix per section |
|---|---|
| Worksheet | 4–6 MC, 2–3 short answer, 1 extended |
| Booklet/unit lesson | 3–4 MC, 2 short answer, 1 extended, 1–2 worked examples |
| Assessment | 6–10 MC, 4–6 short answer, 2–3 extended |

---

### Question 6: SCAFFOLDING INTENSITY (ask for worksheets, booklets)

> **Skip for assessments and unit guides** (assessments have no scaffolding by default; unit guides are teacher planning documents).

How much support baked in?
- [ ] Heavy — sentence starters, planning steps, hints pointing to exact answers, hidden answers under every "try it"
- [ ] Moderate — hints, some sentence starters, checklists
- [ ] Light — minimal hints, mostly blank answer spaces
- [ ] Mix — easy questions heavily scaffolded, harder questions less so

---

### Question 7: OUTPUT (ask for ALL resource types)

- Output filename: ___________
- Header text (running header on each page): ___________
- Creator/author name for document metadata: ___________

---

### Question 8: DIAGRAMS & IMAGES (ask for ALL resource types)

- [ ] ASCII diagrams only (box-drawing characters, works offline)
- [ ] Open-source images from subject repositories (see list below)
- [ ] Both
- [ ] None — text and tables only

**If images are requested**, ask which sources they prefer:

**Science (Biology, Chemistry, Physics, Earth Science):**
- [ ] OpenStax — https://openstax.org (free textbooks, CC-BY, high-quality diagrams)
- [ ] PhET Interactive Simulations — https://phet.colorado.edu (screenshots of sims, CC-BY)
- [ ] Wikimedia Commons — https://commons.wikimedia.org (search by topic, check individual license)
- [ ] Public Health Image Library (PHIL) — https://phil.cdc.gov (medical/microbiology)

**Mathematics:**
- [ ] OpenStax — https://openstax.org (free math textbooks, CC-BY)
- [ ] Wikimedia Commons — https://commons.wikimedia.org (graphs, geometric diagrams)
- [ ] Desmos — https://www.desmos.com (screenshots of graphs, free to use educationally)

**Computing / Technology:**
- [ ] Wikimedia Commons — https://commons.wikimedia.org (circuit diagrams, logic gates, hardware photos)
- [ ] Fritzing — https://fritzing.org (breadboard/circuit diagrams, CC-BY-SA)
- [ ] Tinkercad — https://www.tinkercad.com (screenshots of circuits, educational use)

**Humanities / Social Sciences:**
- [ ] OpenStax — https://openstax.org (free textbooks, CC-BY)
- [ ] Wikimedia Commons — https://commons.wikimedia.org (historical maps, primary sources)
- [ ] Library of Congress — https://www.loc.gov (public domain historical materials)
- [ ] David Rumsey Map Collection — https://www.davidrumsey.com (historical maps, CC-BY-NC-SA)

**Geography / Earth Science:**
- [ ] NASA Earth Observatory — https://earthobservatory.nasa.gov (satellite imagery, public domain)
- [ ] USGS — https://www.usgs.gov (geological diagrams, public domain)
- [ ] Wikimedia Commons — https://commons.wikimedia.org

**General (all subjects):**
- [ ] OpenClipArt — https://openclipart.org (public domain clip art)
- [ ] The Noun Project — https://thenounproject.com (icons, check individual license)
- [ ] Pixabay — https://pixabay.com (photos and illustrations, free use)
- [ ] Other source (specify): ___________

**Image usage notes:**
- How many images total across the resource? ___
- Maximum images per section? ___
- Preferred image size? [ ] Small (inline icon)  [ ] Medium (~1/3 page)  [ ] Large (~1/2 page)  [ ] Full page
- Always include alt text / figure captions? [ ] Yes  [ ] No

---

### Question 9: SPECIAL CONTENT (ask for ALL resource types)

- Any specific examples, analogies, or mnemonics to include? ___________
- Any specific content to AVOID? ___________
- Colour scheme preference? (or use default from common.js) ___________
- Any existing content modules in `content/` that should be preserved? ___________

---

## Phase 2: BUILD (only after the user has answered Phase 1)

Once you have all answers:

### Step 1: Update `resource.config.json`
Set these fields based on the interview answers:
```json
{
  "title": "From interview — the document title",
  "creator": "From interview — author name",
  "outputFile": "./output/filename.docx",
  "header": "From interview — running header text",
  "contentDir": "./content/your-resource-name",
  "footer": true,
  "landscape": false
}
```
**Note:** Set `"landscape": true` for unit guides and any resource with 6+ table columns. Default is `false` (portrait A4).

### Step 2: Create the resource subfolder and plan content modules

Create a new subfolder under `content/` for this resource. Name it after the resource (kebab-case, e.g. `electricity-unit-guide`, `photosynthesis-worksheet`). Then create content files with numeric prefixes so they load in order:

```
content/
└── your-resource-name/    ← CREATE THIS SUBFOLDER
    ├── 01-cover.js        ← cover page (if requested)
    ├── 02-contents.js     ← contents page (if requested)
    ├── 03-howto.js        ← how-to-use page (for booklets)
    ├── 10-section1.js     ← first content section
    ├── 11-section2.js     ← second content section
    ├── ...                ← more sections
    └── 90-appendix.js     ← reference material (if requested)
```

Numbers don't need to be consecutive — leave gaps so sections can be inserted later.

**If building a teacher edition as well**, create a second subfolder (e.g. `your-resource-name-teacher/`). The teacher edition is built by running `build.js` a second time with a different `resource.config.json` pointing at the teacher folder. Teacher content modules use answer boxes (green), teaching notes (amber), and marking criteria — see `DOCX_BUILDER_REFERENCE.md` Section 9.

Set `contentDir` in `resource.config.json` to point at this subfolder:
```json
{ "contentDir": "./content/your-resource-name" }
```

### Step 3: Write each content module
Every module follows this exact pattern:
```js
const { Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType } = require('docx');

module.exports = function sectionName(C, H) {
  const { borderAll, cellH, cellP, cellPr, cellE, cellHint, cellWE, cellWELabel, bdCell, bdCellRich, hiddenAnswer } = H;
  return [
    // ... content using C.* and H.* helpers only ...
  ];
};
```

Use the helpers documented in `DOCX_BUILDER_REFERENCE.md`:
- `C.h1()`, `C.h2()`, `C.h3()`, `C.h4()` — headings
- `C.p()`, `C.bullet()`, `C.bulletRich()` — body text
- `C.calloutBox()`, `C.workedExample()`, `C.hintBox()` — structured boxes
- `C.lessonBanner()`, `C.sectionTag()` — structural dividers
- `C.mcQuestion()`, `C.sentenceStarter()`, `C.scaffoldStep()` — question types
- `C.linedAnswerSpace()`, `C.drawingSpace()` — student answer areas
- `C.pageBreak()` — page breaks
- `H.cellH()`, `H.cellP()`, `H.cellPr()`, `H.cellE()`, `H.cellHint()`, `H.cellWE()`, `H.cellWELabel()` — table cells
- `H.bdCell()`, `H.bdCellRich()` — big display cells
- `H.hiddenAnswer()` — answers hidden below "now you try" questions

### Step 3b: Handle images (if user requested them in Question 8)

If the user chose open-source images:

1. **Create a download folder:** `content/images/`
2. **Fetch images** from the chosen sources (OpenStax, Wikimedia Commons, PhET, etc.). Verify each image's license is compatible (CC-BY, CC0, public domain).
3. **Save locally** with descriptive filenames (e.g. `chloroplast_diagram.png`, `circuit_battery_led.png`).
4. **Inject into content modules** using the `ImageRun` helper:

```js
const { ImageRun } = require('docx');
const fs = require('fs');

// Inside a Paragraph:
new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 120, after: 120 },
  children: [new ImageRun({
    data: fs.readFileSync('./content/images/chloroplast_diagram.png'),
    transformation: { width: 400, height: 300 }   // dimensions in DXA
  })]
})
```

5. **Always include a figure caption** below the image:
```js
C.p("Figure 1: Cross-section of a chloroplast showing thylakoid stacks (grana).", {
  italic: true, alignment: AlignmentType.CENTER, color: "808080", size: 20
})
```

6. **If the user chose ASCII diagrams**, use box-drawing characters with `font: "Consolas"` inside a bordered table cell (see `DOCX_BUILDER_REFERENCE.md` Section 9.3).

### Step 4: Run the build
```powershell
node build.js
```

### Step 5: Report
Tell the user:
- Where the output file is
- How many content modules were created
- How many pages the document is (approx — 1 content module ≈ 2–5 pages depending on density)

---

## Rules

1. **NEVER edit `build.js` or `common.js`.** They are infrastructure.
2. **NEVER skip Phase 1.** Even if the user's request seems specific, confirm with the interview questions.
3. **ALWAYS numeric-prefix your content files.** Order matters.
4. **ALWAYS use `C.*` and `H.*` helpers.** Do not construct raw `Paragraph` or `TableCell` objects unless a worked example genuinely needs custom formatting that the helpers don't provide.
5. **ONE concept per content file.** Don't put multiple lessons in one file.
6. **Use `C.pageBreak()` between major sections** (between lessons, between theory and questions, before reference material).
