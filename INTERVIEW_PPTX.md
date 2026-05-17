# INTERVIEW_PPTX.md — PPTX-Specific Interview Questions

> **Read this file when the user selected PPTX in Question 0.**  
> For DOCX resources, read [`INTERVIEW_DOCX.md`](INTERVIEW_DOCX.md) instead.  
> For universal questions (Q0, Q2, Q3, Q7, Q8, Q9) and build steps, see [`AGENTS.md`](AGENTS.md).

---

## Question 1: PPTX RESOURCE TYPE

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

## Question 4: STRUCTURE (tailor to PPTX resource type)

> **Agent note:** Only ask the questions for the type the user selected in Q1. Use the defaults in parentheses if the user can't specify.

**For ALL PPTX types — ask these two universal questions first:**
- Approximate total slides: ___________ (default: let the agent decide)
- Slide format: [ ] Widescreen 16:9 (default)  [ ] Standard 4:3

**Then ask ONLY the questions for the chosen type:**

| Resource Type | Ask These Questions |
|---|---|
| **Standard lesson** | Number of lessons. Title/objectives/summary slides? (default: all yes). Visual style: Rich/Modern or Clean/Traditional? |
| **E5 lesson** | Number of lessons. Standard or Extended depth? Slides per phase (defaults: 1/1/2/1/1). Companion worksheet? Visual style: Rich/Modern or Clean/Traditional? |
| **Revision deck** | Number of topics. Section dividers? Practice questions + how many per topic? |
| **Assessment walkthrough** | Number of questions. Answers in speaker notes or separate slides? Worked solutions? |
| **Lab/practical intro** | Slides count. Safety and checklist slides? |

> **After collecting the type-specific answers, proceed to Q2 in AGENTS.md.**

---

## VISUAL STYLE (for ALL PPTX resource types)

Ask the user which visual style they prefer:
- [ ] **Rich / modern** (recommended) — dark navy cover slides with grid pattern, card-based layouts with shadows, cyan/amber accent colours, SVG icons, roadmaps for multi-lesson overviews, numbered intent cards, visual MCQ cards. Uses the full Claude-inspired design system. Best for student-facing lessons.
- [ ] **Clean / traditional** — blue header bars, simple bullet lists, classic worked example slides. Lighter, faster to author. Best for quick presentations or staff-facing decks.
- [ ] **Mixed** — use rich title/overview/wrap-up slides but keep body content in traditional bullet style. Good balance.

> **If rich/modern is chosen:** The agent should use `C.lessonTitleSlide()`, `C.roadmapSlide()`, `C.numberedIntentsSlide()`, `C.comparisonColumnsSlide()`, `C.mcqCardSlide()`, `C.processStepsSlide()`, `C.stepStripSlide()`, `C.taskCardsSlide()`, `C.keyIdeaSlide()`, and `C.wrapUpSlide()` wherever applicable. Cards get `C.softShadow()`. Icons from the pre-rendered set (19 icons) can be referenced by name via `C.icon("name")`.
>
> **If traditional is chosen:** Use the original helpers: `C.titleSlide()`, `C.contentSlide()`, `C.mcQuestionSlide()`, `C.workedExampleSlide()`, `C.comparisonSlide()`, etc.
>
> **If mixed is chosen:** Use rich helpers for structural slides (title, roadmap, wrap-up) and traditional helpers for body content.

> **🎨 Rich visual style in E5 slides:** When the user selects **Rich / modern**, all E5 slides automatically use the enhanced palette:
> - Phase buttons and SM bars are **phase-coloured** (not flat red/green)
> - Headings use **navy (#0F2A47)** for professional contrast
> - Callout boxes echo the **phase tint colour**
> - Content cards get a **subtle shadow** (`E5_THEME.cardShadow`)
> - SVG **icons** from the pre-rendered set can be used via `opts.iconName`
> - The Learning Intention slide uses **navy/cyan accents** instead of red/green
>
> The rich styling is **automatic** — content modules don't need to enable it. Just select "Rich / modern" in the interview and the E5 render helpers apply it.

---

## COMPANION WORKSHEETS (for E5 and Standard PPTX decks)

### For E5 lesson decks — Elaborate worksheet

> The Elaborate phase is where students apply their learning. You can build a companion DOCX worksheet that students complete during this phase.

Ask the user:
- Would you like a **companion DOCX worksheet** for the Elaborate phase?
  [ ] **Yes — build a separate worksheet** (the PPTX slides guide the activity; the worksheet records answers)
  [ ] **No — use slide-level activities only** (fill-in tables, checklists, prompts on slides)
  [ ] **No — no slide activities** (theory and worked examples only, no student tasks)

### For PPTX standard lesson decks — companion worksheet

> Standard lessons can also have a companion DOCX worksheet for practice questions, activities, or note-taking.

Ask the user:
- Would you like a **companion DOCX worksheet** to accompany the standard lesson?
  [ ] **Yes — build a separate worksheet** (printed handout with questions/activities)
  [ ] **No — slide activities only** (fill-in tables, checklists, prompts on slides)
  [ ] **No — no slide activities** (theory and worked examples only, no student tasks)

**If YES →** branch into DOCX worksheet questioning. Read [`INTERVIEW_DOCX.md`](INTERVIEW_DOCX.md) Question 5 for the full question-types checklist. The worksheet is built via `build.js` as a separate DOCX file, then the PPTX is built separately via `build-pptx.js`.

**⚠️ HARD RULE: EVERY question type the user checks in Question 5 MUST appear as a distinct activity or section in the companion worksheet.** If the user checks 10 types, the worksheet must contain at least 10 corresponding activities or question blocks.

Collect these additional details for the worksheet (YES path only):
- **Scaffolding intensity** (from Question 6): [ ] Heavy  [ ] Moderate  [ ] Light  [ ] Mix
- **Worksheet output filename:** ___________
- **Where should answers go?** [ ] Speaker notes only  [ ] Separate answer section  [ ] Both

---

## VIDEOS, IMAGES & DIAGRAMS — Contextual Placement for PPTX

> **Refer to this guide when the user requests visuals.** Decide contextually what medium fits each slide best.

| Slide type | Best visual | Why |
|---|---|---|
| **Engage** | 🎬 Video (preferred) or 🖼️ image | Hooking curiosity — motion and narration work best. Fall back to a striking image if no good video exists. |
| **Explore** | 🎬 Video (preferred), 🖼️ image, or 🧠 mind map | Investigation — a hands-on demo video or a rich diagram sparks inquiry. A mind-map works for concept-mapping prompts. |
| **Explain** (core vocab) | 🖼️ Image, 📐 ASCII diagram, or 📊 rendered graph | Explicit teaching — a labelled diagram, clear illustration, or data plot supports definitions. Video is too passive here. |
| **Explain** (worked example) | 📐 ASCII diagram or none | Step-by-step reasoning — a small monospaced diagram of the circuit keeps focus on the working. |
| **Explain** (comparison) | 🖼️ Image or 📐 ASCII diagram | Side-by-side visuals help students compare at a glance. |
| **Elaborate** | None (worksheet-driven) | Students are working on the companion worksheet — no visual needed on the slide. |
| **Evaluate** | None | Exit ticket / self-assessment — visual would distract. |
| **Summary** | None | Bullet takeaway text is sufficient. |

> **⚠️ HARD RULE — Images vs Videos:** If the user checked open-source images in Question 8 but did NOT request videos, use IMAGES on Engage and Explore slides first. Only use `videoUrl` when the user explicitly requested video content, OR when all image sources have been exhausted (see fallback chain below).

> **🔁 Image → Video fallback chain:** For Engage and Explore slides, if after exhausting all approved image sources no suitable image is found, fall back to YouTube video search. Announce: "No relevant image found for [slide title] — searching YouTube for a contextual video instead." Fallback order: images first (all approved sources) → YouTube video → ASCII diagram/mindMap → text-only.

---

## PPTX Phase 2 Notes

### Speaker Notes as Teacher Edition

The PPTX pipeline uses **speaker notes** for all teacher-only content:
- MC answers → `slide.addNotes("✓ Answer: B")`
- Now You Try answers → `slide.addNotes("👇 ANSWERS...")`
- Teaching guidance → `C.teacherNotes("Pacing: 10 min...")`

A single `.pptx` file serves as both the student-facing deck AND the teacher edition — the teacher sees answers in Presenter View. No separate teacher edition file is produced.

### Content folder naming for PPTX types

| Resource type | Example module names |
|---|---|
| Standard lesson | `01-title.js`, `02-objectives.js`, `10-topic1.js`, `90-summary.js` |
| E5 lesson | `01-title.js`, `02-li.js`, `10-engage.js`, `20-explore.js`, `30-explain.js`, `40-elaborate.js`, `50-evaluate.js`, `90-summary.js` |
| Revision deck | `01-title.js`, `10-topic1.js`, `10-topic1-questions.js`, `90-summary.js` |
| Assessment walkthrough | `01-title.js`, `10-section1.js`, `90-wrapup.js` |
| Lab intro | `01-title.js`, `10-safety.js`, `20-procedure.js`, `90-checklist.js` |

> **📊 Rendered graphs/diagrams:** If the user requested graphs or diagrams in Question 8, store graph spec JSON files in a `graphs/` subfolder inside the content directory (e.g., `content/my-lesson/graphs/iv-curve.json`). Generate images with `python tools/render_graph.py --spec ... --out images/...` BEFORE running `node build-pptx.js`. Embed with `C.imageSlide()`. Full spec API in `DOCX_BUILDER_REFERENCE.md` Section 15; PPTX embedding patterns in `PPTX_BUILDER_REFERENCE.md` Section 11.

---

> **Return to [`AGENTS.md`](AGENTS.md) for the universal Phase 2 build steps (config, run, report) and Rules.**
> For the full PPTX helper API, see [`PPTX_BUILDER_REFERENCE.md`](PPTX_BUILDER_REFERENCE.md).
> For E5 pedagogical guidance, see [`E5_MODEL_BIBLE.md`](E5_MODEL_BIBLE.md).
