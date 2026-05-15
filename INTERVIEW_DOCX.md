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
- How many weeks does this span? ___________
- How many lessons per week? ___________
- What columns should the table have? (Default: Week | Topic | Content | Activities | Resources & Experiments | Assessment & Homework | Disability Inclusion Adjustment)
- Should it be landscape or portrait? [ ] Landscape (recommended for 6+ columns)  [ ] Portrait

**For assessments / exams:**
- How many sections? ___________
- Total marks: ___________
- Time limit (if stated on cover): ___________
- Question mix per section (can differ between sections):
  - Section 1: MC ___ Short answer ___ Extended response ___
  - Section 2: MC ___ Short answer ___ Extended response ___
  - (etc. for each section)
- Should there be a separate marking key document? [ ] Yes  [ ] No

**For lab / practical manuals:**
- How many labs/practicals? ___________
- Should each have a procedure section AND a report template? [ ] Yes  [ ] No
- Any safety notes required? ___________

**For revision / study guides:**
- How many topics to cover? ___________
- Dense summary or detailed reference? [ ] Summary  [ ] Detailed
- Should it include a glossary? [ ] Yes  [ ] No
- Should it include a formula / cheat sheet? [ ] Yes  [ ] No
- Should it include practice questions? [ ] Yes  [ ] No
- If yes, how many questions per topic? ___________

**For in-class activities:**
- How many activities? ___________
- Should each activity include a materials list? [ ] Yes  [ ] No
- Should each activity include reflection / exit ticket questions? [ ] Yes  [ ] No
- Should it include a teacher instructions page (setup, timing, answers)? [ ] Yes  [ ] No
- Should it have a cover page? [ ] Yes  [ ] No
- Any specific activity types or themes? ___________ (card sorts, station rotations, group challenges, circuit builders, data collection, design tasks, discussion prompts — leave blank for variety)

**For problem sets:**
- How many problem sections/sets? ___________ (default 5 — one per topic)
- How many questions per section total? ___________ (default 8–12)
- Difficulty progression: [ ] Easy → Hard within each section  [ ] Section-by-section increasing  [ ] Mixed difficulty throughout
- Include worked examples? [ ] Yes (___ per section, default 2)  [ ] No
- Include "Now you try" mirrored problems after each worked example? [ ] Yes  [ ] No
- Answer key: [ ] Integrated — answers at end of document  [ ] Separate answer key document  [ ] No answers (student self-check only)
- Include reference / formula sheet? [ ] Yes (1 page, front or back)  [ ] No
- Cover page? [ ] Yes (title + topic list)  [ ] No
- Student working space: [ ] Minimal — compact layout  [ ] Standard — 3–5 lines per short answer  [ ] Generous — full working lines
- Include diagram-based problems? [ ] Yes  [ ] No

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

---

> **Return to [`AGENTS.md`](AGENTS.md) for the universal Phase 2 build steps (config, run, report) and Rules.**
> For the full DOCX helper API, see [`DOCX_BUILDER_REFERENCE.md`](DOCX_BUILDER_REFERENCE.md).
