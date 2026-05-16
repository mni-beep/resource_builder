# AGENTS.md — Project Instructions for AI Agents

## What this project is

A Node.js pipeline that generates `.docx` teaching resources (worksheets, booklets, unit guides, assessments, lab manuals, revision guides, in-class activities) and `.pptx` slide decks (lessons, revision, assessment walkthroughs) from JavaScript content modules. The full specifications are in `DOCX_BUILDER_REFERENCE.md` and `PPTX_BUILDER_REFERENCE.md`.

## Your job as an agent

When a user asks you to create a teaching resource, first ask whether they want:
1. **A DOCX document** (worksheet, booklet, unit guide, assessment, lab manual, revision guide, in-class activities, printed resources, problem set) — uses `build.js`
2. **A PPTX slide deck** (standard lesson, E5 lesson, revision presentation, assessment walkthrough, lab intro) — uses `build-pptx.js`

Then ask whether they want to:
1. **Give custom instructions** — they tell you exactly what they want in their own words, and you build from that
2. **Go through the questionnaire** — you walk through the structured interview below to gather requirements (or they can use `interview.html` — a browser form with both guided and custom modes)

If they choose custom instructions, extract the details you need and skip to Phase 2 below. You must still:
- Update `resource.config.json` with the correct fields based on what they described
- Create content modules in `content/<resource-name>/` with numeric prefixes
- Use `C.*` and `H.*` helpers for all content
- Run `node build.js` (DOCX) or `node build-pptx.js` (PPTX)
- Fill in any gaps with sensible defaults — never loop back to the user for missing fields

Never assume — always ask. Never write code before you have all the answers.

**Key difference between DOCX and PPTX:** DOCX is for printable paper resources (flowing pages of text/tables/questions). PPTX is for screen-presented slide decks (fixed-canvas slides with bullets, images, speaker notes for teacher answers). The interview process is largely the same — you just map answers to the appropriate pipeline.

---

## Phase 1: INTERVIEW (only if user chose the questionnaire)

Ask the following questions. The questions you ask **branch based on Question 0 and Question 1** — the output format and resource type determine which follow-ups are relevant. Do NOT ask every question for every resource type. Tailor the interview to what the user wants.

---

### Question 0: OUTPUT FORMAT (determines which pipeline to use)

What format should the resource be?
- [ ] **DOCX (printable document)** — worksheets, booklets, unit guides, assessments, lab manuals, revision guides, in-class activities, printed resources (card sets, templates, recording sheets, checklists), problem sets (topic-organised practice with worked examples + answer key)
- [ ] **PPTX (slide deck)** — standard lessons, E5 lessons, revision presentations, assessment walkthroughs, lab introductions

> **If DOCX:** Use `build.js`, reference `DOCX_BUILDER_REFERENCE.md`, content modules return arrays of docx elements.
> **If PPTX:** Use `build-pptx.js`, reference `PPTX_BUILDER_REFERENCE.md`, content modules return arrays of slide definition objects. Answers and teaching notes go into **speaker notes** (not separate teacher edition files).

---

### Question 1: RESOURCE TYPE + Q4–Q6 (branches by format)

> **The full resource type lists, Q4 structure questions, Q5 question mix, and Q6 scaffolding are now in separate files to reduce context window size. Open the file that matches Question 0:**

| User chose | Open this file | Contains |
|---|---|---|
| **DOCX** | [`INTERVIEW_DOCX.md`](INTERVIEW_DOCX.md) | Q1 DOCX types, Q4 DOCX structure (worksheet/booklet/assessment/lab/revision/activities/printables/problem-set), Q5 question mix, Q6 scaffolding, DOCX Phase 2 notes |
| **PPTX** | [`INTERVIEW_PPTX.md`](INTERVIEW_PPTX.md) | Q1 PPTX types, Q4 PPTX structure (standard/E5/revision/assessment/lab), E5 details & visual style, companion worksheet branching, PPTX Phase 2 notes |

**After you've collected the answers from the format-specific file, return here for Questions 7–9 and Phase 2.**

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

### Question 7: OUTPUT (ask for ALL resource types)

- Output filename: ___________
- Header text (running header on each page — DOCX only): ___________
- Creator/author name for document metadata: ___________

---

### Question 8: DIAGRAMS & IMAGES (ask for ALL resource types)

- [ ] ASCII diagrams only (box-drawing characters, works offline)
- [ ] Open-source images from subject repositories (see list below)
- [ ] 📊 Rendered graphs/diagrams (via `tools/render_graph.py` — matplotlib, schemdraw, svgwrite)
- [ ] Both
- [ ] None — text and tables only

**If graphs/diagrams are requested:** The project includes `tools/render_graph.py` which can generate publication-quality graphs (line/scatter/bar plots), electrical circuit schematics, and vector diagrams (force diagrams, ray optics). See `DOCX_BUILDER_REFERENCE.md` Section 15 for the full spec API. Rendered images land in `images/` and are embedded via `C.imageFromFile()` (DOCX) or `C.imageSlide()` (PPTX).

**If images are requested**, ask which sources they prefer:

> **🟢 = automated  🟡 = may need tuning  🟠 = screenshot fallback  🔴 = manual only**

**Science (Biology, Chemistry, Physics, Earth Science):**
- [ ] 🟢 OpenStax — https://openstax.org
- [ ] 🟢 PhET Interactive Simulations — https://phet.colorado.edu
- [ ] 🟢 Wikimedia Commons — https://commons.wikimedia.org
- [ ] 🟢 Public Health Image Library (PHIL) — https://phil.cdc.gov

**Mathematics:**
- [ ] 🟢 OpenStax, Wikimedia Commons
- [ ] 🟠 Desmos — https://www.desmos.com

**Computing / Technology:**
- [ ] 🟢 Wikimedia Commons
- [ ] 🔴 Fritzing, Tinkercad (manual only)

**Humanities / Social Sciences:**
- [ ] 🟢 OpenStax, Wikimedia Commons
- [ ] 🔴 Library of Congress, David Rumsey Map Collection (manual only)

**Geography / Earth Science:**
- [ ] 🟡 NASA Earth Observatory  [ ] 🟢 USGS  [ ] 🟢 Wikimedia Commons

**General (all subjects):**
- [ ] 🟢 OpenClipArt, The Noun Project, Pixabay

**Image usage notes:**
- How many images total? ___  ·  Max per section? ___  ·  Preferred size? [ ] Small  [ ] Medium  [ ] Large  [ ] Full page
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

**For DOCX resources:**
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

**For PPTX resources:**
```json
{
  "type": "pptx",
  "title": "From interview — the presentation title",
  "creator": "From interview — author name",
  "outputFile": "./output/filename.pptx",
  "contentDir": "./content/your-resource-name",
  "landscape": true
}
```
**Note:** For PPTX, `"landscape": false` = standard 4:3; `"landscape": true` = widescreen 16:9. `header` and `footer` are not used by PPTX.

### Step 2: Create the resource subfolder and plan content modules

Create a new subfolder under `content/` for this resource. Name it after the resource (kebab-case). Create content files with numeric prefixes so they load in order. See [`INTERVIEW_DOCX.md`](INTERVIEW_DOCX.md) or [`INTERVIEW_PPTX.md`](INTERVIEW_PPTX.md) for type-specific folder naming conventions.

Numbers don't need to be consecutive — leave gaps so sections can be inserted later.

**If building a teacher edition**, create a second subfolder and run `build.js` twice with different configs. Teacher content modules use answer boxes (green), teaching notes (amber), and marking criteria — see `DOCX_BUILDER_REFERENCE.md` Section 9.

### Step 3: Write each content module

> **The content module template, helper cheat sheets, and full API surface for your format are in the reference files.** Do NOT write content modules until you've opened the appropriate reference:

| Building | Open this file | Key sections |
|---|---|---|
| **DOCX** | [`DOCX_BUILDER_REFERENCE.md`](DOCX_BUILDER_REFERENCE.md) | Section 4 (C helpers), Section 5 (H helpers), Section 7 (template), Section 8 (booklet structure), Section 14 (cheat sheet), Section 15 (graph rendering) |
| **PPTX** | [`PPTX_BUILDER_REFERENCE.md`](PPTX_BUILDER_REFERENCE.md) | Section 2 (C helpers), Section 3 (H helpers), Section 4 (template), Section 9 (cheat sheet), Section 10 (graph & diagram embedding) |
| **E5 PPTX** | Also read [`E5_MODEL_BIBLE.md`](E5_MODEL_BIBLE.md) | Pedagogical reference — mandatory before drafting any E5 slide content |

**Image handling:** If the user requested open-source images, see `DOCX_BUILDER_REFERENCE.md` Section "Image download workflow" and verification loop. If the user requested graphs or diagrams, see `DOCX_BUILDER_REFERENCE.md` Section 15 (for DOCX) or `PPTX_BUILDER_REFERENCE.md` Section 10 (for PPTX). If the user requested YouTube videos (PPTX), see the video helpers in `PPTX_BUILDER_REFERENCE.md`.

### Step 4: Run the build

**If graphs/diagrams were requested:** Render them first — create JSON spec files in `content/<resource-name>/graphs/` and run:
```powershell
python tools/render_graph.py --spec content/<resource-name>/graphs/q1.json --out images/q1-graph.png
```
Repeat for each graph/circuit/diagram. Then build the document:

**For DOCX:**
```powershell
node build.js
```

**For PPTX:**
```powershell
node build-pptx.js
```

### Step 5: Report
Tell the user:
- Where the output file is
- How many content modules were created
- For DOCX: approximate page count (1 module ≈ 2–5 pages)
- For PPTX: how many slides were generated

---

## Rules

1. **Prefer not to edit `build.js`, `build-pptx.js`, `common.js`, or `common-pptx.js`.** They are infrastructure. When a bug prevents correct output, you may fix them — keep changes minimal and targeted. Always explain the fix to the user.
2. **NEVER skip Phase 1.** Even if the user's request seems specific, confirm with the interview questions.
3. **If the user leaves any field blank — fill it yourself.** Make the best choice for the context. Never halt the build or loop back to the user just because a field is empty.
4. **ALWAYS numeric-prefix your content files.** Order matters.
5. **ALWAYS use `C.*` and `H.*` helpers.** Do not construct raw `Paragraph`, `TableCell`, or pptxgenjs slide objects unless a custom case genuinely needs it.
6. **ONE concept per content file.** Don't put multiple lessons in one file.
7. **For DOCX:** Use `C.pageBreak()` between major sections (between lessons, between theory and questions, before reference material).
8. **For PPTX:** Each slide definition object = one slide. Answers and teaching notes go into **speaker notes**, not separate files. Use `C.customSlide()` only as a last resort.
9. **ALWAYS spread array-returning helpers.** Some `C.*` helpers return arrays, not single elements. You MUST spread them with `...` when pushing into your content array, or the DOCX/PPTX will silently corrupt.

   **DOCX helpers that return arrays (spread with `...`):**
   - `C.linedAnswerSpace(n)` → `content.push(...C.linedAnswerSpace(3))`
   - `C.drawingSpace(height, label)` → `content.push(...C.drawingSpace(2, "Label"))`
   - `C.lessonBanner(num, title, subtitle)` → `content.push(...C.lessonBanner(1, "Title", "Sub"))`
   - `C.mcQuestion(n, stem, opts, ref)` → `content.push(...C.mcQuestion(1, "Q?", [...], "mc-q1"))`

   **PPTX helpers that return arrays:**
   - `C.e5LessonPlan(skillLabel, plan)` → `slides.push(...C.e5LessonPlan(...))`

10. **Every checked companion-worksheet type MUST appear as a distinct activity.** When the user selects question types for a companion DOCX worksheet, do not skip, merge, or drop any checked type.
11. **For E5 decks, `E5_MODEL_BIBLE.md` is mandatory reading.** Open it before drafting Engage/Explore/Explain/Elaborate/Evaluate content. Run the cross-phase quality gate before building.

---

## File Reference — open the right files for your task

| I'm building… | Read these files |
|---|---|
| DOCX worksheet / booklet / assessment / lab / revision / activities | `AGENTS.md` + `INTERVIEW_DOCX.md` + `DOCX_BUILDER_REFERENCE.md` |
| PPTX standard lesson / revision / assessment walkthrough / lab intro | `AGENTS.md` + `INTERVIEW_PPTX.md` + `PPTX_BUILDER_REFERENCE.md` |
| PPTX E5 lesson | `AGENTS.md` + `INTERVIEW_PPTX.md` + `PPTX_BUILDER_REFERENCE.md` + `E5_MODEL_BIBLE.md` |
| DOCX booklet + teacher edition | Above + `DOCX_BUILDER_REFERENCE.md` Section 9 |
| PPTX with companion DOCX worksheet | Both interview files + both reference files |
