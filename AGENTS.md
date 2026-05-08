# AGENTS.md — Project Instructions for AI Agents

## What this project is

A Node.js pipeline that generates `.docx` teaching resources (worksheets, booklets, unit guides, assessments, lab manuals, revision guides) from JavaScript content modules. The full specification is in `DOCX_BUILDER_REFERENCE.md`.

## Your job as an agent

When a user asks you to create a teaching resource, first ask whether they want:
1. **A DOCX document** (worksheet, booklet, unit guide, assessment, lab manual, revision guide) — uses `build.js`
2. **A PPTX slide deck** (standard lesson, E5 lesson, revision presentation, assessment walkthrough, lab intro) — uses `build-pptx.js`

Then ask whether they want to:
1. **Give custom instructions** — they tell you exactly what they want in their own words, and you build from that
2. **Go through the questionnaire** — you walk through the structured interview below to gather requirements

If they choose custom instructions, extract the details you need and skip to Phase 2. If they choose the questionnaire, proceed with Phase 1 below.

Never assume — always ask. Never write code before you have all the answers.

**Key difference between DOCX and PPTX:** DOCX is for printable paper resources (flowing pages of text/tables/questions). PPTX is for screen-presented slide decks (fixed-canvas slides with bullets, images, speaker notes for teacher answers). The interview process is largely the same — you just map answers to the appropriate pipeline. See `PPTX_BUILDER_REFERENCE.md` for all PPTX helpers.

---

## Phase 1: INTERVIEW (only if user chose the questionnaire)

Ask the following questions. The questions you ask **branch based on Question 0 and Question 1** — the output format and resource type determine which follow-ups are relevant. Do NOT ask every question for every resource type. Tailor the interview to what the user wants.

---

### Question 0: OUTPUT FORMAT (determines which pipeline to use)

What format should the resource be?
- [ ] **DOCX (printable document)** — worksheets, booklets, unit guides, assessments, lab manuals, revision guides
- [ ] **PPTX (slide deck)** — standard lessons, E5 lessons, revision presentations, assessment walkthroughs, lab introductions

> **If DOCX:** Use `build.js`, reference `DOCX_BUILDER_REFERENCE.md`, content modules return arrays of docx elements.
> **If PPTX:** Use `build-pptx.js`, reference `PPTX_BUILDER_REFERENCE.md`, content modules return arrays of slide definition objects. Answers and teaching notes go into **speaker notes** (not separate teacher edition files).

---

### Question 1: RESOURCE TYPE (determines everything else)

**For DOCX:**
- [ ] **Single worksheet** (1–2 pages, theory + questions only)
- [ ] **Multi-lesson booklet** (several lessons with cover page, contents, references)
- [ ] **Multi-lesson booklet + paired teacher edition** (student booklet + separate answer key with teaching notes)
- [ ] **Week-by-week unit guide** (teacher planning document — curriculum map table with columns for Week, Topic, Content, Activities, Resources, Assessment, Inclusion)
- [ ] **Assessment / exam** (questions only, possibly with separate marking key)
- [ ] **Lab / practical manual** (procedures + report templates)
- [ ] **Revision / study guide** (dense theory, reference tables, no questions)
- [ ] **Other** (describe): ___________

**For PPTX:**
- [ ] **Standard lesson deck** (8–15 slides: title → objectives → theory → worked examples → questions → summary)
- [ ] **E5 lesson deck** (8–15 slides: Learning Intention → Engage → Explore → Explain → Elaborate → Evaluate, colour-coded phase dividers)
- [ ] **Short presentation** (5–8 slides: brief topic intro or recap)
- [ ] **Revision deck** (15–30 slides: comprehensive topic review with questions)
- [ ] **Assessment walkthrough** (10–20 slides: exam questions presented slide-by-slide with answers in speaker notes)
- [ ] **Lab/practical intro** (5–10 slides: safety, procedure, checklist)
- [ ] **Other** (describe): ___________

> **If E5 lesson deck is chosen**, each lesson follows this 5-phase sequence with colour-coded phase dividers. Use `C.e5LessonPlan()` for rapid 5-phase lessons, or individual `C.e5EngageSlide()`, `C.e5ExploreSlide()`, etc. when you need more control. See `PPTX_BUILDER_REFERENCE.md` Section 10.

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

**For PPTX E5 lesson decks:**
- How many lessons does this cover? ___________
- Approximate total slides: ___________ (typical: 8–15 per lesson)
- Should it have a title slide? [ ] Yes  [ ] No
- Should each lesson start with a learning objectives slide? [ ] Yes  [ ] No
- Should each lesson end with a summary slide? [ ] Yes  [ ] No
- Slide format: [ ] Widescreen 16:9 (default)  [ ] Standard 4:3

> | Phase | Colour | Icon | Typical slides | Purpose |
> |---|---|---|---|---|
> | Engage | Orange | 💡 | 1–2 | Hook, prior knowledge, curiosity |
> | Explore | Teal | 🔍 | 1–2 | Hands-on investigation, inquiry |
> | Explain | Blue | 📖 | 2–4 | Explicit teaching, formal definitions |
> | Elaborate | Purple | 🔗 | 1–2 | Apply to new contexts, extend |
> | Evaluate | Red | ✅ | 1–2 | Check understanding, reflect, assess |

**E5-specific follow-ups:**
- Approximate slides per phase: Engage __ Explore __ Explain __ Elaborate __ Evaluate __
- Should each phase have its own divider slide? [ ] Yes (recommended)  [ ] No
- Should the Explore phase include a data collection table? [ ] Yes  [ ] No
- Should the Evaluate phase include a self-assessment rubric? [ ] Yes  [ ] No

> **🎬 Video placement in E5 decks:** Embedded YouTube videos should go **inside the Engage or Explore slide** (right column), NOT on a standalone slide. Pass `videoUrl` and `videoCaption` in the `engage` or `explore` plan object:
> ```js
> engage: {
>   heading: "...",
>   bodyText: [...],
>   videoUrl: "https://www.youtube.com/watch?v=REAL_ID",
>   videoCaption: "Channel — Title (X:XX)",
>   // ...
> }
> ```
> The Engage/Explore slides auto-detect YouTube URLs, download via `yt-dlp`, and embed the MP4 in the right column. Video takes priority over `imagePath` or `mindMap`. See Step 3c for the full YouTube search procedure.

**For PPTX standard lesson decks:**
- How many lessons does this cover? ___________
- Approximate total slides: ___________ (typical: 8–15 per lesson)
- Should each lesson start with a learning objectives slide? [ ] Yes  [ ] No
- Should each lesson end with a summary slide? [ ] Yes  [ ] No
- Should it have a title slide? [ ] Yes  [ ] No
- Slide format: [ ] Widescreen 16:9 (default)  [ ] Standard 4:3

**For PPTX revision decks:**
- How many topics to cover? ___________
- Use section divider slides between topics? [ ] Yes  [ ] No
- Include practice questions? [ ] Yes  [ ] No
- If yes, how many per topic? ___________

**For PPTX assessment walkthroughs:**
- How many questions total? ___________
- Show answers on separate slides or in speaker notes? [ ] Speaker notes (recommended)  [ ] Separate slides
- Include worked solutions? [ ] Yes  [ ] No

**For revision / study guides:**
- How many topics to cover? ___________
- Dense summary or detailed reference? [ ] Summary  [ ] Detailed

---

### Question 5: WORKSHEETS & QUESTION MIX

> **This section is for DOCX resources AND for PPTX E5 Elaborate companion worksheets.**
> **Skip the detailed question-types checklist for standard PPTX lesson/revision decks** — in PPTX, questions are individual slides (MC → `C.mcQuestionSlide()`, short answer → `C.shortAnswerSlide()`, extended response → `C.extendedResponseSlide()`), and the number of each was covered in Question 4. For PPTX, use the abbreviated E5 Elaborate worksheet section below instead.

**For DOCX resources (worksheets, booklets, assessments):**

For each section/lesson, what question types?
- [ ] Multiple choice — how many per section? ___
- [ ] Short answer with sentence starters — how many? ___
- [ ] Extended response with planning scaffolds — how many? ___
- [ ] Fill-in tables / diagrams
- [ ] Three-tier scaffolding tables (worked → hinted → independent)
- [ ] Comparison questions (side-by-side tables)
- [ ] Structured planning forms (project proposals, testing logs, bills of materials)
- [ ] Hands-on demo activities with post-activity reflection
- [ ] Troubleshooting / fault-finding scenarios
- [ ] Teach-back / explain-to-others prompts
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

**For PPTX E5 lesson decks — Elaborate worksheet (ask ONLY if E5 was chosen):**

> The Elaborate phase is where students apply their learning. You can build a companion DOCX worksheet that students complete during this phase, or use slide-level activities (fill-in tables, checklists, "create your own" prompts). Many teachers prefer a printed worksheet for the Elaborate phase so students have a tangible record.

Ask the user:
- Would you like a **companion DOCX worksheet** for the Elaborate phase?
  [ ] **Yes — build a separate worksheet** (the PPTX slides guide the activity; the worksheet records answers)
  [ ] **No — use slide-level activities only** (fill-in tables, checklists, prompts on slides)

**If YES → branch into DOCX worksheet questioning:**

> You are temporarily switching to the DOCX worksheet workflow. Answer these questions for the Elaborate companion worksheet, then return to the PPTX flow for Questions 6–9.

Collect these details for the worksheet:
- What should the worksheet include? (use the DOCX question mix checklist above)
  - [ ] Fill-in tables / data recording sheets
  - [ ] Step-by-step procedure with answer blanks
  - [ ] Diagram annotation / labelling
  - [ ] Short-answer reflection questions — how many? ___
  - [ ] Create-your-own activity (e.g. "make your own dichotomous key")
  - [ ] Peer review / swap-with-partner section
- Scaffolding intensity (from Question 6):
  [ ] Heavy  [ ] Moderate  [ ] Light  [ ] Mix
- Worksheet output filename: ___________
- Should answers go in the PPTX speaker notes, the worksheet itself (hidden/separate section), or both?
  [ ] Speaker notes only (teacher sees in Presenter View)
  [ ] Separate answer section in the worksheet
  [ ] Both

> **Once the worksheet details are collected**, return to the PPTX questioning flow — continue with Question 6 (Scaffolding) through Question 9 as they apply to the main PPTX deck.
>
> **When it's time to build**: the companion worksheet is a separate DOCX built via `build.js`. Create a second content directory (e.g. `content/your-resource-name-worksheet/`), update `resource.config.json` to point to it, and run `node build.js`. Then switch back to the PPTX config and run `node build-pptx.js`. The PPTX and DOCX are built separately but designed to be used together in the same lesson.

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
**Note:** For PPTX, `"landscape": false` = standard 4:3 (10×7.5"); `"landscape": true` = widescreen 16:9 (13.33×7.5"). Widescreen is the modern default. `header` and `footer` are not used by the PPTX pipeline.

### Step 2: Create the resource subfolder and plan content modules

Create a new subfolder under `content/` for this resource. Name it after the resource (kebab-case, e.g. `electricity-unit-guide`, `photosynthesis-worksheet`, `circuits-lesson-deck`). Then create content files with numeric prefixes so they load in order:

**For DOCX:**
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

**For PPTX:**
```
content/
└── your-resource-name/    ← CREATE THIS SUBFOLDER
    ├── 01-title.js        ← title slide
    ├── 02-objectives.js   ← learning objectives slide
    ├── 10-topic1.js       ← theory slides for topic 1
    ├── 11-topic1-questions.js  ← practice questions for topic 1
    ├── 20-topic2.js       ← theory slides for topic 2
    ├── 21-topic2-questions.js  ← practice questions for topic 2
    ├── ...                ← more topics
    └── 90-summary.js      ← wrap-up / summary slide
```

Numbers don't need to be consecutive — leave gaps so sections can be inserted later.

**If building a teacher edition as well**, create a second subfolder (e.g. `your-resource-name-teacher/`). The teacher edition is built by running `build.js` a second time with a different `resource.config.json` pointing at the teacher folder. Teacher content modules use answer boxes (green), teaching notes (amber), and marking criteria — see `DOCX_BUILDER_REFERENCE.md` Section 9.

Set `contentDir` in `resource.config.json` to point at this subfolder:
```json
{ "contentDir": "./content/your-resource-name" }
```

### Step 3: Write each content module

**For DOCX modules:** Every module follows this exact pattern:
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

**For PPTX modules:** Every module follows this pattern:
```js
module.exports = function sectionName(C, H) {
  return [
    // ... slide definition objects using C.* helpers only ...
  ];
};
```

Use the helpers documented in `PPTX_BUILDER_REFERENCE.md`:
- `C.titleSlide()`, `C.sectionDivider()` — structural slides
- `C.objectivesSlide()`, `C.summarySlide()` — lesson framing
- `C.contentSlide()`, `C.twoColumnSlide()` — bullet content
- `C.calloutSlide()`, `C.bigIdeaSlide()` — highlight slides
- `C.workedExampleSlide()`, `C.nowYouTrySlide()` — worked examples (answers in speaker notes)
- `C.mcQuestionSlide()`, `C.shortAnswerSlide()`, `C.extendedResponseSlide()` — question slides
- `C.tableSlide()`, `C.fillTableSlide()` — table slides
- `C.comparisonSlide()`, `C.checklistSlide()` — structured content
- `C.imageSlide()`, `C.diagramSlide()` — visual slides
- `C.customSlide()` — advanced: raw pptxgenjs access
- `H.cellH()`, `H.cellP()`, `H.cellWE()`, `H.cellHint()`, `H.cellE()` — table cell styling
- `H.formatRow()` — normalize row arrays

**PPTX Speaker Notes:** All answers, teaching guidance, and marking criteria go into speaker notes via `def.notes` or `C.answerNotes()`. The PPTX pipeline does NOT produce separate teacher edition files — the teacher uses Presenter View to see answers.

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

### Step 3c: Handle YouTube videos (if user requested embedded videos in Question 8)

When the user asks for embedded YouTube videos, you MUST search the web for relevant videos rather than use placeholder URLs. The procedure:

1. **Search YouTube via browser** — use the MCP browser tools (NOT `fetch_webpage` — YouTube blocks it):
   - Navigate to `https://www.youtube.com/results?search_query=YOUR+SEARCH+TERMS`
   - Use `mcp_microsoft_pla_browser_evaluate` to extract video titles, channels, lengths, and URLs with this script:
     ```js
     () => { const results = []; document.querySelectorAll('ytd-video-renderer, ytd-rich-item-renderer').forEach((item, i) => { const t = item.querySelector('#video-title'); const c = item.querySelector('ytd-channel-name a'); const l = item.querySelector('ytd-thumbnail-overlay-time-status-renderer span'); if (t) results.push({ index: i+1, title: t.textContent.trim(), channel: c?.textContent.trim()||'', length: l?.textContent.trim()||'', url: t.getAttribute('href')||'' }); }); return JSON.stringify(results.slice(0, 8), null, 2); }
     ```

2. **Verify the best match** — navigate to the watch page and confirm the page title contains the expected video title.

3. **Use the video in the content module:**
   ```js
   C.videoSlide("🎬 Watch: Topic Title",
     "https://www.youtube.com/watch?v=REAL_VIDEO_ID",
     "Video: Channel Name — 'Full Video Title' (X:XX)",
     { notes: C.teacherNotes("Pause at X:XX for discussion.") }
   )
   ```
   The builder auto-downloads via `yt-dlp.exe` in `tools/` and caches to `content/videos/`.

4. **If no suitable video found** — tell the user and fall back to a content slide. Never use `YOUR_VIDEO_ID_HERE` as a placeholder.

**What does NOT work:**
- `fetch_webpage` on YouTube or Google — redirects to login pages, returns no results
- `mcp_microsoft_mar_convert_to_markdown` on YouTube watch pages — returns only the site footer, no video data
- Guessing common YouTube video IDs without verifying — almost always hits nonexistent or region-blocked videos

**Important:**
- Always use the **full absolute URL** (`https://www.youtube.com/watch?v=VIDEO_ID`), never the relative `/watch?v=...` path that the scraper returns
- `yt-dlp.exe` must be present in the project's `tools/` folder (one-time setup)
- `ffmpeg` is **optional** — if present (system PATH or `tools/ffmpeg.exe`), the builder downloads best-quality H.264 video + AAC audio and merges them for pristine PowerPoint playback. If absent, it falls back to a single native MP4 stream — still playable in PowerPoint, just slightly lower quality. No user action needed either way.

### Step 4: Run the build

**For DOCX:**
```powershell
node build.js
```

**For PPTX:**
```powershell
node build-pptx.js
```
Or via npm script: `npm run build:pptx`

### Step 5: Report
Tell the user:
- Where the output file is
- How many content modules were created
- For DOCX: how many pages the document is (approx — 1 content module ≈ 2–5 pages depending on density)
- For PPTX: how many slides were generated

---

## Rules

1. **Prefer not to edit `build.js`, `build-pptx.js`, `common.js`, or `common-pptx.js`.** They are infrastructure. However, when a bug in these files prevents correct output (e.g. API mismatches, rendering errors), you may fix them — keep changes minimal and targeted. Always explain the fix to the user.
2. **NEVER skip Phase 1.** Even if the user's request seems specific, confirm with the interview questions.
3. **ALWAYS numeric-prefix your content files.** Order matters.
4. **ALWAYS use `C.*` and `H.*` helpers.** Do not construct raw `Paragraph`, `TableCell`, or pptxgenjs slide objects unless a custom case genuinely needs it.
5. **ONE concept per content file.** Don't put multiple lessons in one file.
6. **For DOCX:** Use `C.pageBreak()` between major sections (between lessons, between theory and questions, before reference material).
7. **For PPTX:** Each slide definition object = one slide. Answers and teaching notes go into **speaker notes**, not separate files. Use `C.customSlide()` only as a last resort.
8. **ALWAYS spread array-returning helpers.** Some `C.*` helpers return arrays, not single elements. You MUST spread them with `...` when pushing into your content array, or the DOCX/PPTX will silently corrupt. The builders will now detect and refuse to build if this happens, but the right fix is to spread them correctly from the start.

   **DOCX helpers that return arrays (spread with `...`):**
   - `C.linedAnswerSpace(n)` → `content.push(...C.linedAnswerSpace(3))`
   - `C.drawingSpace(height, label)` → `content.push(...C.drawingSpace(2, "Label"))`
   - `C.lessonBanner(num, title, subtitle)` → `content.push(...C.lessonBanner(1, "Title", "Sub"))`
   - `C.mcQuestion(n, stem, opts, ref)` → `content.push(...C.mcQuestion(1, "Q?", [...], "mc-q1"))`

   **PPTX helpers that return arrays:**
   - `C.e5LessonPlan(skillLabel, plan)` → `slides.push(...C.e5LessonPlan(...))`
