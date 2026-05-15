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

> **If E5 lesson deck is chosen**, each lesson follows this 5-phase sequence with colour-coded phase dividers. Use `C.e5LessonPlan()` for rapid 5-phase lessons, or individual `C.e5EngageSlide()`, `C.e5ExploreSlide()`, etc. when you need more control. See `PPTX_BUILDER_REFERENCE.md` Section 10 for the technical helpers.
>
> **📘 MANDATORY: Before drafting any E5 slide content, read `E5_MODEL_BIBLE.md` end-to-end.** That file is the pedagogical reference — it tells you what GOOD content looks like in each phase, the common failure modes that make E5 decks feel hollow, and the cross-phase quality gate to run before declaring the deck done. `PPTX_BUILDER_REFERENCE.md` covers *how* to render the slides; `E5_MODEL_BIBLE.md` covers *what to put inside them*. Both are required reading for E5 work.

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
- Total marks: ___________
- Question mix per section: MC ___ Short answer ___ Extended response ___
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
- Slides per phase: Engage __ Explore __ Explain __ Elaborate __ Evaluate __ (defaults: 1/1/2/1/1 for Standard, 1/1/5/1/1 for Extended)
- Should each phase have its own divider slide? [ ] Yes (recommended)  [ ] No

**E5 lesson depth — how much content per phase?**
- [ ] **Standard E5** (6–8 slides total) — one slide per phase: Learning Intention, Engage, Explore, Explain, Elaborate, Evaluate. Clean, concise, no extras.
- [ ] **Extended E5** (12–20 slides total) — core vocabulary plus extra **theory detail slides**, **worked examples**, **now-you-try mirrored problems**, **comparison tables**, and **data-collection tables**, all integrated into their respective E5 phases (Explain extras go inside Explain, Explore tables inside Explore, etc.). Use this when you want deeper concept coverage.

> **⚠️ CRITICAL: If Extended E5 is chosen, ALL extra content slides MUST be interleaved into the E5 phase sequence — NEVER appended at the end.** The slide order follows the E5 arc: Title → Objectives → Learning Intention → Engage → Explore (with any data table) → Explain (core vocab + any extra theory/worked-examples/now-you-try/comparison) → Elaborate → Evaluate → Summary.

> **🔧 E5 Continuation Slides for multi-slide phases:** When a phase has more than 1 slide (e.g. Engage 2, Explore 2, Explain 2), every slide AFTER the first must carry the same E5 chrome (skill label, phase button, SM bar) so students always know which phase they're in. Use `C.e5ContinuationSlide(skillLabel, phaseName, smText, title, bullets, opts)` for these follow-on slides. It supports:
> - **Bullet mode:** Pass `bullets` as an array (like `C.contentSlide()`)
> - **Table mode:** Pass `null` for bullets and include `opts.table = { headers[], rows[][], colWidths[]? }`
> - **Icons & shadows:** Pass `opts.iconName` (e.g. `"bulb"`, `"search"`) for a pre-rendered SVG icon beside the heading, and the body gets a subtle card shadow automatically
> - **Phase-aware colours:** The phase button and SM bar automatically match the phase (orange=Engage, teal=Explore, blue=Explain, purple=Elaborate, red=Evaluate)
>
> **Never use `C.contentSlide()` or `C.tableSlide()` for the second+ slide in a multi-slide phase** — these lack E5 chrome and will look disconnected from the phase.

> **🎨 Rich visual style in E5 slides:** When the user selects **Rich / modern** visual style (Question 4, PPTX section), all E5 slides automatically use the enhanced palette:
> - Phase buttons and SM bars are **phase-coloured** (not flat red/green)
> - Headings use **navy (#0F2A47)** for professional contrast
> - Callout boxes echo the **phase tint colour**
> - Content cards get a **subtle shadow** (`E5_THEME.cardShadow`)
> - SVG **icons** from the pre-rendered set can be used via `opts.iconName`
> - The Learning Intention slide uses **navy/cyan accents** instead of red/green
>
> The rich styling is **automatic** — content modules don't need to enable it. Just select "Rich / modern" in the interview and the E5 render helpers apply it.

> **🎬 Videos, images & diagrams — contextual placement:** When the user requests videos and/or images, the agent should **contextually decide** what visual medium fits each slide best, rather than following a rigid rule. Use this decision guide:
>
> | Slide type | Best visual | Why |
> |---|---|---|
> | **Engage** | 🎬 Video (preferred) or 🖼️ image | Hooking curiosity — motion and narration work best. Fall back to a striking image if no good video exists. |
> | **Explore** | 🎬 Video (preferred), 🖼️ image, or 🧠 mind map | Investigation — a hands-on demo video or a rich diagram sparks inquiry. A mind-map works for concept-mapping prompts. |
> | **Explain** (core vocab) | 🖼️ Image or 📐 ASCII diagram | Explicit teaching — a labelled diagram or clear illustration supports definitions. Video is too passive here. |
> | **Explain** (worked example) | 📐 ASCII diagram or none | Step-by-step reasoning — a small monospaced diagram of the circuit keeps focus on the working. |
> | **Explain** (comparison) | 🖼️ Image or 📐 ASCII diagram | Side-by-side visuals help students compare at a glance. |
> | **Elaborate** | None (worksheet-driven) | Students are working on the companion worksheet — no visual needed on the slide. |
> | **Evaluate** | None | Exit ticket / self-assessment — visual would distract. |
> | **Summary** | None | Bullet takeaway text is sufficient. |
>
> **⚠️ HARD RULE — Images vs Videos:** If the user checked open-source images in Question 8 but did NOT request/specify videos, use IMAGES on Engage and Explore slides first. Only use `videoUrl` when the user explicitly checked or requested video content, OR when all image sources have been exhausted and no relevant image could be found (see fallback chain below). The `imagePath` parameter on `C.e5EngageSlide()` and `C.e5ExploreSlide()` is the correct way to embed visuals when images are the selected medium.
>
> **🔁 Image → Video fallback chain:** For Engage and Explore slides (where video is a good alternative), if after exhausting all approved image sources + retries (see Step 3b verification loop) no suitable image is found, the agent MUST fall back to YouTube video search (Step 3c) to find a relevant video. Announce this fallback to the user: "No relevant image found for [slide title] — searching YouTube for a contextual video instead." The fallback order is: images first (all approved sources) → YouTube video → ASCII diagram/mindMap → text-only.
>
> **Video embedding:** Pass `videoUrl` and `videoCaption` in the Engage or Explore `opts` object. The builder auto-downloads via `yt-dlp` and embeds the MP4 in the right column. Video takes priority over `imagePath` or `mindMap` on those slides.
>
> **Image embedding:** For Explain slides, pass `imagePath` to `e5ExplainSlide()` opts, or use `C.imageSlide()` for standalone image slides. Images must be fetched from the user's chosen sources (see Step 3b).
>
> **ASCII diagrams:** Use `C.diagramSlide()` with box-drawing characters in `font: "Consolas"` when no suitable image is available, or when a diagram would be clearer than a photograph. See Step 3c for the full YouTube search procedure.

**For PPTX standard lesson decks:**
- How many lessons does this cover? ___________
- Approximate total slides: ___________ (typical: 8–15 per lesson)
- Should each lesson start with a learning objectives slide? [ ] Yes  [ ] No
- Should each lesson end with a summary slide? [ ] Yes  [ ] No
- Should it have a title slide? [ ] Yes  [ ] No
- Slide format: [ ] Widescreen 16:9 (default)  [ ] Standard 4:3

**For ALL PPTX resource types — VISUAL STYLE:**

Ask the user which visual style they prefer for the deck:
- [ ] **Rich / modern** (recommended) — dark navy cover slides with grid pattern, card-based layouts with shadows, cyan/amber accent colours, SVG icons, roadmaps for multi-lesson overviews, numbered intent cards, visual MCQ cards. Uses the full Claude-inspired design system. Best for student-facing lessons.
- [ ] **Clean / traditional** — blue header bars, simple bullet lists, classic worked example slides. Lighter, faster to author. Best for quick presentations or staff-facing decks.
- [ ] **Mixed** — use rich title/overview/wrap-up slides but keep body content in traditional bullet style. Good balance.

> **If rich/modern is chosen:** The agent should use `C.lessonTitleSlide()`, `C.roadmapSlide()`, `C.numberedIntentsSlide()`, `C.comparisonColumnsSlide()`, `C.mcqCardSlide()`, `C.processStepsSlide()`, `C.stepStripSlide()`, `C.taskCardsSlide()`, `C.keyIdeaSlide()`, and `C.wrapUpSlide()` wherever applicable. Cards get `C.softShadow()`. Icons from the pre-rendered set (19 icons) can be referenced by name via `C.icon("name")`.
>
> **If traditional is chosen:** Use the original helpers: `C.titleSlide()`, `C.contentSlide()`, `C.mcQuestionSlide()`, `C.workedExampleSlide()`, `C.comparisonSlide()`, etc.
>
> **If mixed is chosen:** Use rich helpers for structural slides (title, roadmap, wrap-up) and traditional helpers for body content.

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
- Should it include a glossary? [ ] Yes  [ ] No
- Should it include a formula / cheat sheet? [ ] Yes  [ ] No
- Should it include practice questions? [ ] Yes  [ ] No
- If yes, how many questions per topic? ___________

---

### Question 5: WORKSHEETS & QUESTION MIX

> **This section is for DOCX resources AND for companion DOCX worksheets (E5 Elaborate or standard PPTX lesson).**
> **Skip for:** assessments, unit guides, lab manuals, and revision guides — these resource types have their own question/activity structures defined in Question 4. Q5 only appears for worksheets, booklets, and PPTX companion worksheets.
> **Skip the detailed question-types checklist for PPTX slide-deck questions** — in PPTX, questions are individual slides (MC → `C.mcQuestionSlide()`, short answer → `C.shortAnswerSlide()`, extended response → `C.extendedResponseSlide()`), and the number of each was covered in Question 4. This section is for companion DOCX worksheets only.

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
  [ ] **No — no slide activities** (theory and worked examples only, no student tasks)

**For PPTX standard lesson decks — companion worksheet (ask if standard lesson was chosen):**

> Standard lessons can also have a companion DOCX worksheet for practice questions, activities, or note-taking. This is separate from the slide-based questions — the worksheet is a printed handout.

Ask the user:
- Would you like a **companion DOCX worksheet** to accompany the standard lesson?
  [ ] **Yes — build a separate worksheet** (printed handout with questions/activities)
  [ ] **No — slide activities only** (fill-in tables, checklists, prompts on slides)
  [ ] **No — no slide activities** (theory and worked examples only, no student tasks)

**If YES → branch into DOCX worksheet questioning (Question 5):**

> You are temporarily switching to the DOCX worksheet workflow. The question types for the companion worksheet are selected in **Question 5** (the same comprehensive checklist used for all DOCX resources). Do NOT show a separate, abbreviated checklist — use Question 5.

**If "slide activities only" →** build activities directly into the slides (fill-in tables, checklists, prompts, data-collection tables). Do NOT create a separate DOCX file. Skip Question 5 and the worksheet output filename fields.

**If "no slide activities" →** the lesson is theory and worked examples only. Skip Question 5 entirely. No student tasks, no companion worksheet, no activity slides.

Collect these additional details for the worksheet (YES path only):

- **Question types to include** — taken from Question 5. Use the FULL checklist (all item types: fill-in tables, three-tier scaffolding, comparison questions, structured planning forms, hands-on demo activities, troubleshooting/fault-finding, teach-back, practical-on-paper, "now you try" mirrored problems, diagram labelling, short answer, extended response, peer review, plus any subject-specific extras like code-writing).

> **⚠️ HARD RULE: EVERY question type the user checks in Question 5 MUST appear as a distinct activity or section in the companion worksheet.** Do not skip any checked type. Do not merge unrelated types into one activity. If the user checks 10 types, the worksheet must contain at least 10 corresponding activities or question blocks. The only exception is "code-writing by hand" for non-programming subjects — adapt it (e.g. circuit design, pseudocode, procedure writing) rather than omit it.

- **Scaffolding intensity** (from Question 6):
  [ ] Heavy  [ ] Moderate  [ ] Light  [ ] Mix
- **Worksheet output filename:** ___________
- **Where should answers go?**
  [ ] Speaker notes only (teacher sees in Presenter View)
  [ ] Separate answer section in the worksheet
  [ ] Both

> **Once the worksheet details are collected**, return to the PPTX questioning flow — continue with Question 6 (Scaffolding) through Question 9 as they apply to the main PPTX deck.
>
> **When it's time to build**: the companion worksheet is a separate DOCX built via `build.js`. Create a second content directory (e.g. `content/your-resource-name-worksheet/`), update `resource.config.json` to point to it, and run `node build.js`. Then switch back to the PPTX config and run `node build-pptx.js`. The PPTX and DOCX are built separately but designed to be used together in the same lesson.

---

### Question 6: SCAFFOLDING INTENSITY (ask for worksheets, booklets, and slide decks with a companion worksheet)

> **Skip for:** assessments, unit guides (assessment scaffolding not applicable; unit guides are teacher planning documents), and PPTX decks where the user chose **"No"** for the companion worksheet (either "No — slide activities only" or "No — no slide activities"). Scaffolding only applies when a DOCX worksheet is being built — slide-level activities don't use the scaffolding system.

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

> **🟢 = automated via `python tools/download_image.py --scrape ...`**
> **🟡 = automated, but may need article-specific tuning or may return the nearest live image after redirects**
> **🟠 = automated screenshot fallback**
> **🔴 = manual only**

**Science (Biology, Chemistry, Physics, Earth Science):**
- [ ] 🟢 OpenStax — https://openstax.org (browser-rendered figures via Playwright fallback)
- [ ] 🟢 PhET Interactive Simulations — https://phet.colorado.edu (`--scrape` works, gets sim screenshot via og:image)
- [ ] 🟢 Wikimedia Commons — https://commons.wikimedia.org (`--scrape` works, gets og:image thumbnail)
- [ ] 🟢 Public Health Image Library (PHIL) — https://phil.cdc.gov (use direct URL: `phil/PHIL_Images/{pid}/{pid}_lores.jpg`)

**Mathematics:**
- [ ] 🟢 OpenStax — https://openstax.org (browser-rendered figures via Playwright fallback)
- [ ] 🟢 Wikimedia Commons — https://commons.wikimedia.org (`--scrape` works)
- [ ] 🟠 Desmos — https://www.desmos.com (interactive SPA, automated screenshot fallback)

**Computing / Technology:**
- [ ] 🟢 Wikimedia Commons — https://commons.wikimedia.org (`--scrape` works)
- [ ] 🔴 Fritzing — https://fritzing.org (requires authenticated session; manual export recommended)
- [ ] 🔴 Tinkercad — https://www.tinkercad.com (public URLs often redirect to 404/login; manual export recommended)

**Humanities / Social Sciences:**
- [ ] 🟢 OpenStax — https://openstax.org (browser-rendered figures via Playwright fallback)
- [ ] 🟢 Wikimedia Commons — https://commons.wikimedia.org (`--scrape` works)
- [ ] 🔴 Library of Congress — https://www.loc.gov (Cloudflare challenge blocks automation; manual download required)
- [ ] 🔴 David Rumsey Map Collection — https://www.davidrumsey.com (Cloudflare "Verify Access" wall; manual access only)

**Geography / Earth Science:**
- [ ] 🟡 NASA Earth Observatory — https://earthobservatory.nasa.gov (browser-rendered fallback works, but old article links may redirect to the current EO landing page)
- [ ] 🟢 USGS — https://www.usgs.gov (`--scrape` works, finds og:image)
- [ ] 🟢 Wikimedia Commons — https://commons.wikimedia.org (`--scrape` works)

**General (all subjects):**
- [ ] 🟢 OpenClipArt — https://openclipart.org (`--scrape` works, finds PNG download URL)
- [ ] 🟢 The Noun Project — https://thenounproject.com (`--scrape` works, finds icon PNG via og:image)
- [ ] 🟢 Pixabay — https://pixabay.com (browser-rendered extraction + built-in `curl.exe` CDN fallback)
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

**Structural / framing slides:**
- `C.titleSlide()`, `C.sectionDivider()` — basic structural slides
- `C.lessonTitleSlide()` — 🆕 dark navy cover with decorative grid, lesson chip, hook text (Claude-inspired)
- `C.objectivesSlide()`, `C.summarySlide()` — lesson framing
- `C.wrapUpSlide()` — 🆕 dark takeaways slide with checkmarks + amber "next week" banner

**Content slides:**
- `C.contentSlide()`, `C.twoColumnSlide()` — bullet content
- `C.calloutSlide()`, `C.bigIdeaSlide()` — highlight slides
- `C.keyIdeaSlide()` — 🆕 big concept with two-column under/fully-defined comparison

**Overview & structure:**
- `C.roadmapSlide()` — 🆕 week-ahead lesson cards with big numbers, icons, accent strips
- `C.numberedIntentsSlide()` — 🆕 numbered learning intentions with cyan number band
- `C.processStepsSlide()` — 🆕 vertical/horizontal numbered step sequences

**Question slides:**
- `C.mcQuestionSlide()` — basic lettered MCQ
- `C.mcqCardSlide()` — 🆕 2×2 answer cards with letter chips, green border for correct answer
- `C.shortAnswerSlide()`, `C.extendedResponseSlide()` — written response slides

**Comparison & tables:**
- `C.comparisonSlide()` — basic two-column bullet comparison
- `C.comparisonColumnsSlide()` — 🆕 visual side-by-side with winner/loser styling, big text
- `C.tableSlide()`, `C.fillTableSlide()` — data tables
- `C.checklistSlide()` — checkbox lists

**Worked examples & practice:**
- `C.workedExampleSlide()`, `C.nowYouTrySlide()` — worked examples (answers in speaker notes)
- `C.stepStripSlide()` — 🆕 horizontal connected step cards with arrows + amber callout box

**Task/activity slides:**
- `C.taskCardsSlide()` — 🆕 activity cards with emoji, time chips, amber accent
- `C.imageSlide()`, `C.diagramSlide()` — visual slides
- `C.customSlide()` — advanced: raw pptxgenjs access

**Table cell styling:**
- `H.cellH()`, `H.cellP()`, `H.cellWE()`, `H.cellHint()`, `H.cellE()` — table cell styling
- `H.formatRow()` — normalize row arrays

> **🎨 Visual style — automatic vs opt-in:** The enhanced colour palette (`navy`, `cyan`, `amber`, `green`, `red` + light tints), 19 pre-rendered SVG icons (via `C.icon("check")`, `C.icon("arrow")`, etc.), and card shadows (`C.softShadow()`) are available to all slides. But the rich Claude-inspired layouts only apply when you use the 🆕 helpers. Existing helpers (`C.titleSlide()`, `C.contentSlide()`, `C.mcQuestionSlide()`, etc.) still work identically and produce the traditional blue-header style. Mix and match freely — a deck can use `C.lessonTitleSlide()` for a dark cover and `C.contentSlide()` for bullet slides in the same deck.
>
> **When to use which title slide:**
> - `C.lessonTitleSlide(n, title, hook, subtitle)` — dark navy cover with hook text. Best for standalone lessons or multi-lesson decks where each lesson gets its own dramatic intro.
> - `C.titleSlide(title, subtitle, author)` — traditional blue cover. Best for simple presentations, revision decks, or when you want the classic look.
>
> **When to use which overview:**
> - `C.roadmapSlide()` — for multi-lesson decks (e.g. Week 2 overview with Lessons 4/5/6 cards). Place after the title slide.
> - `C.numberedIntentsSlide()` — for single-lesson learning intentions. Place after the title or roadmap.

**PPTX Speaker Notes:** All answers, teaching guidance, and marking criteria go into speaker notes via `def.notes` or `C.answerNotes()`. The PPTX pipeline does NOT produce separate teacher edition files — the teacher uses Presenter View to see answers.

### Step 3b: Handle images (if user requested them in Question 8)

If the user chose open-source images:

> **Refer to the contextual placement guide above (E5 follow-ups section) to decide which slides need images vs videos vs ASCII diagrams vs nothing.**

#### Image download workflow (streamlined)

Use `tools/download_image.py` as the default entrypoint. It now escalates automatically from `requests`/BeautifulSoup to a Playwright browser helper when a page is JS-rendered.

**One-time setup for browser-rendered sources:**

```powershell
npm install
npx playwright install chromium
```

**Path A: single command (default for almost everything)**

```powershell
# Direct image URL from any CDN:
python tools/download_image.py "https://example.com/image.png" "./content/images/output.png"

# Wikimedia Commons file page (uses og:image):
python tools/download_image.py --scrape "https://commons.wikimedia.org/wiki/File:Ohm%27s_Law_with_Voltage_source.svg" "./content/images/ohms-law-diagram.png"

# OpenStax / Pixabay / NASA pages (browser-rendered fallback is automatic once Playwright is installed):
python tools/download_image.py --scrape "https://openstax.org/books/physics/pages/19-1-ohms-law" "./content/images/openstax-figure.webp"
python tools/download_image.py --scrape "https://pixabay.com/photos/search/series%20circuit/" "./content/images/pixabay-photo.jpg"

# OpenClipart detail page:
python tools/download_image.py --scrape "https://openclipart.org/detail/194747/simple-circuit" "./content/images/circuit.png"
```

**Path B: browser helper directly (use when you want to inspect candidates or force a screenshot)**

```powershell
# Dump rendered candidates as JSON:
node tools/browser_image_helper.cjs extract "https://openstax.org/books/physics/pages/19-1-ohms-law"

# Download the best rendered image candidate:
node tools/browser_image_helper.cjs download "https://pixabay.com/photos/search/series%20circuit/" "./content/images/output.jpg"

# Force a screenshot for canvas / SVG tools like Desmos:
node tools/browser_image_helper.cjs screenshot "https://www.desmos.com/calculator" "./content/images/desmos-graph.png"
```

**Path C: Browser element screenshot (universal fallback)**

If both Python and curl fail, use `browser_take_screenshot` with `fullPage: true` on the image page. Crop if needed. This always works but may have lower resolution.

**Path D: Manual-only sources**

For Library of Congress, David Rumsey, Fritzing, and most Tinkercad project URLs, automation is still blocked by Cloudflare, authentication, or public-link redirects. Use a manual export or a manually captured screenshot.

#### After downloading

1. **Save locally** with descriptive filenames (e.g. `chloroplast_diagram.png`, `circuit_battery_led.png`).
2. **Verify license** compatibility (CC-BY, CC0, public domain).
3. **Inject into content modules** using the `ImageRun` helper:

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

4. **Always include a figure caption** below the image:
```js
C.p("Figure 1: Cross-section of a chloroplast showing thylakoid stacks (grana).", {
  italic: true, alignment: AlignmentType.CENTER, color: "808080", size: 20
})
```

5. **If the user chose ASCII diagrams**, use box-drawing characters with `font: "Consolas"` inside a bordered table cell (see `DOCX_BUILDER_REFERENCE.md` Section 9.3).

#### ⚠️ Verify image-context alignment (MANDATORY — do this before building)

Every image placed on a slide or in a DOCX resource must **directly illustrate** what the surrounding text is explaining. A generic or tangentially-related image undermines the teaching resource.

> **🤖 Image-aware model verification:** After downloading each image candidate, you MUST verify it using the `view_image` tool together with your own vision capabilities. This is a two-step process:
>
> **Step A — View the image:**
>```
> view_image(filePath="<absolute-path-to-downloaded-image>")
>```
>
> **Step B — Evaluate relevance against slide context.** Ask yourself these questions about the image you just viewed:
>
> | Check | Question | Pass if... |
> |---|---|---|
> | 1. **Topic match** | Does the image's subject match the slide's specific topic? | The image shows exactly what the text is talking about — not something broader or narrower. |
> | 2. **Content accuracy** | Does the image contain the right objects/concepts? | A "circuit components" image should show actual circuit components — not a compass icon or unrelated graphic. |
> | 3. **Year-level appropriate** | Would a Year 9 student understand this image? | The image is simple enough. Avoid diagrams with 10+ labels for younger year levels. |
> | 4. **Scope match** | Does the image's scope match what the slide discusses? | Example: a slide about "why classify all life" should not show only animals. |
> | 5. **No contradiction** | Does the image contradict anything in the slide text? | Check: labels, colours, terminology all match what the text says. |
>
> **🔁 Retry loop — keep looking until you find a relevant image:**
>
> For each slide that needs an image, follow this escalation ladder. Do NOT settle for an irrelevant image — escalate until you find one that passes all 5 checks above, or exhaust all options:
>
> | Attempt | Source / Strategy | Action |
> |---|---|---|
> | 1 | Wikimedia Commons | Search with 2–3 different keyword variations on the file page. Use `node tools/browser_image_helper.cjs download` for each. View each with `view_image` and check relevance. |
> | 2 | OpenStax (if science/maths) | Search OpenStax book pages with `node tools/browser_image_helper.cjs download`. View and check. |
> | 3 | PhET / USGS / other approved sources | Try screenshots or scraped images. View and check. |
> | 4 | Rewrite slide text | If a partially-relevant image exists, rewrite the slide text to explicitly bridge the image to the concept (see example below). |
> | 5 | YouTube video (Engage/Explore only) | If all image sources exhausted, announce the fallback and search YouTube (Step 3c). |
> | 6 | mindMap (PPTX) or ASCII diagram (DOCX) | Use `mindMap` feature for Explore slides, or box-drawing characters for Explain slides. |
> | 7 | Text-only slide | Last resort — use no visual. This is acceptable for Elaborate and Evaluate slides. |
>
> **Per attempt, try at least 2 search URL variations before declaring that source exhausted.** If an image fails relevance checks, delete it (`Remove-Item`) to avoid clutter and try the next candidate.
>
> **Example — FAIL then FIX:**
> - ❌ Engage slide about "Why classify all life?" + image of animals only → fails check 4
> - ✅ Fix: Rewrite text to say "Look at the animals on the right. Scientists use the same sorting rules across ALL five kingdoms — not just animals. Classification gives every living thing its place." → bridges image to concept
>
> **Example — FAIL then ESCALATE:**
> - ❌ Downloaded `simple-circuit.png` from Wikimedia Commons → `view_image` shows a compass icon, not a circuit → delete it → try a different Wikimedia Commons file URL
> - ❌ Second Wikimedia Commons URL also returns wrong image → move to OpenStax
> - ❌ OpenStax image is about integrated circuits (too advanced for Year 9) → move to PhET screenshot
> - ✅ PhET screenshot shows a simple circuit with battery, bulb, switch → passes all 5 checks → use it

### Step 3c: Handle YouTube videos (if user requested embedded videos in Question 8, OR as image fallback)

When the user asks for embedded YouTube videos, OR when image search is exhausted (see Step 3b fallback chain), you MUST search the web for relevant videos rather than use placeholder URLs. **Use the contextual placement guide above to determine which slides should get videos — typically Engage and Explore, not Explain or Evaluate.**

The procedure:

1. **Search YouTube via browser** — use the MCP browser tools (NOT `fetch_webpage` — YouTube blocks it):
   - Navigate to `https://www.youtube.com/results?search_query=YOUR+SEARCH+TERMS`
   - Use `mcp_microsoft_pla_browser_evaluate` to extract video titles, channels, lengths, and URLs with this script:
     ```js
     () => { const results = []; document.querySelectorAll('ytd-video-renderer, ytd-rich-item-renderer').forEach((item, i) => { const t = item.querySelector('#video-title'); const c = item.querySelector('ytd-channel-name a'); const l = item.querySelector('ytd-thumbnail-overlay-time-status-renderer span'); if (t) results.push({ index: i+1, title: t.textContent.trim(), channel: c?.textContent.trim()||'', length: l?.textContent.trim()||'', url: t.getAttribute('href')||'' }); }); return JSON.stringify(results.slice(0, 8), null, 2); }
     ```

2. **Verify the best match** — navigate to the watch page and confirm the page title contains the expected video title.

3. **🔎 Subtitle download & contextual analysis (MANDATORY — do this before using the video):**

   For each candidate YouTube video (top 3 from search), download and analyze its subtitles to verify contextual relevance before embedding:

   ```powershell
   # Download auto-generated English subtitles (VTT format) for a candidate video:
   python -m yt_dlp --write-auto-subs --sub-lang en --skip-download --convert-subs vtt -o "content/videos/sub_%(id)s" "https://www.youtube.com/watch?v=VIDEO_ID"
   ```

   Or use the project's `yt-dlp` if available at `tools/yt-dlp.exe`:
   ```powershell
   .\tools\yt-dlp.exe --write-auto-subs --sub-lang en --skip-download --convert-subs vtt -o "content/videos/sub_%(id)s" "https://www.youtube.com/watch?v=VIDEO_ID"
   ```

   This downloads ONLY the subtitle file (not the full video), saving bandwidth and time. The `.vtt` file will appear as `content/videos/sub_VIDEO_ID.en.vtt`.

   **Read and analyze the subtitle file** against the slide context:
   ```
   read_file(filePath="content/videos/sub_VIDEO_ID.en.vtt")
   ```

   **Subtitle relevance check — the video passes if:**
   | Check | Criterion |
   |---|---|
   | 1. **Keyword density** | At least 3 slide-relevant terms appear in the first 60 seconds of the transcript. |
   | 2. **Topic alignment** | The transcript discusses the same concept as the slide — not a tangentially related topic. |
   | 3. **Year-level language** | The vocabulary and pace match Year 9 readability (no PhD-level jargon). |
   | 4. **Educational tone** | The video is instructional/educational, not a product review or unboxing. |

   **If the subtitles FAIL any check**, discard that candidate, delete the subtitle file, and try the next search result. If all 3 candidates fail, announce the fallback and move to mindMap / ASCII diagram / text-only.

   **If the subtitles PASS**, proceed to use the video. The builder will download the full MP4 later via `yt-dlp`.

   **Clean up subtitle files** after verification — they are only needed for the relevance check, not for the PPTX build.

4. **Use the video in the content module:**
   ```js
   C.videoSlide("🎬 Watch: Topic Title",
     "https://www.youtube.com/watch?v=REAL_VIDEO_ID",
     "Video: Channel Name — 'Full Video Title' (X:XX)",
     { notes: C.teacherNotes("Pause at X:XX for discussion.") }
   )
   ```
   The builder auto-downloads via `yt-dlp.exe` in `tools/` and caches to `content/videos/`.

5. **If no suitable video found** — tell the user and fall back to a content slide. Never use `YOUR_VIDEO_ID_HERE` as a placeholder.

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
3. **If the user leaves any field blank — fill it yourself.** Make the best choice for the context. Never halt the build or loop back to the user just because a field is empty. Output filenames, slide counts, analogies, colour schemes, image sizes — you decide. Only ask the user when the field is genuinely critical and you cannot infer a reasonable default.
4. **ALWAYS numeric-prefix your content files.** Order matters.
5. **ALWAYS use `C.*` and `H.*` helpers.** Do not construct raw `Paragraph`, `TableCell`, or pptxgenjs slide objects unless a custom case genuinely needs it.
6. **ONE concept per content file.** Don't put multiple lessons in one file.
7. **For DOCX:** Use `C.pageBreak()` between major sections (between lessons, between theory and questions, before reference material).
8. **For PPTX:** Each slide definition object = one slide. Answers and teaching notes go into **speaker notes**, not separate files. Use `C.customSlide()` only as a last resort.
9. **ALWAYS spread array-returning helpers.** Some `C.*` helpers return arrays, not single elements. You MUST spread them with `...` when pushing into your content array, or the DOCX/PPTX will silently corrupt. The builders will now detect and refuse to build if this happens, but the right fix is to spread them correctly from the start.
10. **Every checked companion-worksheet type MUST appear as a distinct activity.** When the user selects question types for a companion DOCX worksheet, do not skip, merge, or drop any checked type. If 10 types are checked, the worksheet must have at least 10 corresponding activities. The only exception: adapt "code-writing by hand" to the subject (e.g. circuit design) rather than omit it.
11. **For E5 decks, `E5_MODEL_BIBLE.md` is mandatory reading.** Open it before drafting Engage/Explore/Explain/Elaborate/Evaluate content. Run the cross-phase quality gate (Section 11 of the bible) before building. Skipping the bible produces decks that look like E5 but don't behave like E5 pedagogically.

   **DOCX helpers that return arrays (spread with `...`):**
   - `C.linedAnswerSpace(n)` → `content.push(...C.linedAnswerSpace(3))`
   - `C.drawingSpace(height, label)` → `content.push(...C.drawingSpace(2, "Label"))`
   - `C.lessonBanner(num, title, subtitle)` → `content.push(...C.lessonBanner(1, "Title", "Sub"))`
   - `C.mcQuestion(n, stem, opts, ref)` → `content.push(...C.mcQuestion(1, "Q?", [...], "mc-q1"))`

   **PPTX helpers that return arrays:**
   - `C.e5LessonPlan(skillLabel, plan)` → `slides.push(...C.e5LessonPlan(...))`
