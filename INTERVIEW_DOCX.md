# INTERVIEW_DOCX.md — DOCX-Specific Interview Questions

> **Read this file when the user selected DOCX in Question 0.**  
> For PPTX resources, read [`INTERVIEW_PPTX.md`](INTERVIEW_PPTX.md) instead.  
> For the universal questions (Q0, Q2, Q3, Q7, Q8, Q9) and build steps, see [`AGENTS.md`](AGENTS.md).

---

## Question 1: DOCX RESOURCE TYPE

**For DOCX:**
- [ ] **Single worksheet** (1–2 pages, theory + questions only)
- [ ] **Multi-lesson booklet** (several lessons with cover page, contents, references)
- [ ] **Multi-lesson booklet + paired teacher edition** (student booklet + separate answer key with teaching notes)
- [ ] **Week-by-week unit guide** (teacher planning document — curriculum map table with columns for Week, Topic, Content, Activities, Resources, Assessment, Inclusion)
- [ ] **Assessment / exam** (questions only, possibly with separate marking key)
- [ ] **Lab / practical manual** (procedures + report templates)
- [ ] **Revision / study guide** (dense theory, reference tables, no questions)
- [ ] **In-class activities** (printable activity sheets — card sorts, station rotations, group challenges, etc.)
- [ ] **Problem set** (topic-organised practice problems with worked examples, mirrored "now you try" pairs, and integrated answer key)
- [ ] **Other** (describe): ___________

---

## Question 4: STRUCTURE (tailor to DOCX resource type)

> **Agent note:** The questions below are organised by resource type. Only ask the questions for the type the user selected in Q1. If the user can't answer a specific number, use the defaults shown in parentheses.

**For ALL DOCX types — ask these two universal questions first:**
- How many pages do you expect? ___________ (default: let the agent decide based on content)
- Should it be portrait or landscape? [ ] Portrait (default)  [ ] Landscape (for unit guides, wide tables)

**Then ask ONLY the questions for the chosen type:**

| Resource Type | Ask These Questions |
|---|---|
| **Single worksheet** | Theory first then questions, or interleaved? |
| **Multi-lesson booklet** | Weeks spanned, lessons per week. Cover/contents/how-to/reference pages? (default: all yes) |
| **Booklet + teacher edition** | Same as booklet PLUS: teacher "How to Teach" guide? Marking criteria? Teacher output filename? |
| **Unit guide** | Weeks spanned, lessons per week. Custom table columns? (default: Week \| Topic \| Content \| Activities \| Resources \| Assessment \| Inclusion) |
| **Assessment / exam** | Number of sections, total marks, time limit. Per-section question counts (MC, SA, ER). Separate marking key? |
| **Lab manual** | Number of labs. Procedure + report template for each? Safety notes? |
| **Revision guide** | Number of topics. Summary or detailed? Glossary/formula sheet/practice questions? |
| **In-class activities** | Number of activities. Materials list/reflection/teacher instructions/cover page? Activity types? |
| **Problem set** | Number of sections (default 5). Questions per section (8–12). Difficulty progression. Worked examples + mirrored problems. Answer key format. Cover page? |

> **After collecting the type-specific answers, proceed to Q5 (if applicable) or skip to Q2 in AGENTS.md.**

---

## Question 5: WORKSHEETS & QUESTION MIX

> **This section is for DOCX resources (worksheets, booklets, assessments, problem sets).**  
> **Skip for:** assessments, unit guides, lab manuals, revision guides, and in-class activities — these resource types have their own question/activity structures defined in Question 4. Q5 only appears for worksheets and booklets.

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

---

## Question 6: SCAFFOLDING INTENSITY

> **Skip for:** assessments, unit guides, lab manuals, revision guides, and in-class activities (these types have their own activity/question structures). Scaffolding only applies when a DOCX worksheet or booklet is being built.

How much support baked in?
- [ ] Heavy — sentence starters, planning steps, hints pointing to exact answers, hidden answers under every "try it"
- [ ] Moderate — hints, some sentence starters, checklists
- [ ] Light — minimal hints, mostly blank answer spaces
- [ ] Mix — easy questions heavily scaffolded, harder questions less so

---

## DOCX Phase 2 Notes

### Teacher Edition Patterns

When building a booklet + teacher edition, the teacher edition is a separate build (separate `build.js` invocation with different `resource.config.json`, pointing at a different content folder like `content/my-booklet-teacher/`). Teacher content modules use:

- **Answer boxes**: Green left-border box with "✓ ANSWER" heading. Body text is green.
- **Teaching notes**: Amber left-border box with "⚠ TEACHING NOTE" heading.
- **Marking criteria**: For extended response questions, include point breakdowns inside teaching notes.
- **Teacher cover**: Red "TEACHER COPY — CONFIDENTIAL" cover page.

See `DOCX_BUILDER_REFERENCE.md` Section 9 for the full teacher edition patterns.

### Content folder naming for DOCX types

| Resource type | Example module names |
|---|---|
| Single worksheet | `01-worksheet.js` |
| Multi-week booklet | `01-cover.js`, `02-contents.js`, `03-howto.js`, `10-lesson1.js`, `90-reference.js` |
| Booklet + teacher edition | Student folder + teacher folder, built separately |
| Unit guide | `01-cover.js`, `10-unit-guide.js` |
| Assessment | `01-cover-sheet.js`, `10-section-a.js`, `20-section-b.js`, `90-marking-key.js` |
| Lab manual | `01-cover.js`, `10-lab1-procedure.js`, `11-lab1-report.js` |
| Revision guide | `01-cover.js`, `10-topic1.js`, `20-topic2.js`, `90-formula-sheet.js` |
| In-class activities | `01-cover.js`, `10-activity1.js`, `20-activity2.js`, `90-teacher-notes.js` |

> **📊 Rendered graphs/diagrams:** If the user requested graphs or diagrams in Question 8, store graph spec JSON files in a `graphs/` subfolder inside the content directory (e.g., `content/my-resource/graphs/photoelectric.json`). Generate images with `python tools/render_graph.py --spec ... --out images/...` BEFORE running `node build.js`. Embed with `C.imageFromFile()`. Full spec API in `DOCX_BUILDER_REFERENCE.md` Section 15.

---

> **Return to [`AGENTS.md`](AGENTS.md) for the universal Phase 2 build steps (config, run, report) and Rules.**
> For the full DOCX helper API, see [`DOCX_BUILDER_REFERENCE.md`](DOCX_BUILDER_REFERENCE.md).
