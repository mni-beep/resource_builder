# 📄 Programmatic DOCX Teaching Resource Builder — Reference Guide

> **Reverse-engineered from a working Electronics booklet builder.**
> This document describes the complete methodology, architecture, and all available features for generating scaffolded paper-based teaching resources (booklets, worksheets, assessments, lab manuals, reference sheets, revision guides — any printable classroom document) as `.docx` files using the [`docx`](https://www.npmjs.com/package/docx) npm library.

---

## ⚡ Quick Start (for AI Agents)

**Read `AGENTS.md` first** — it contains the mandatory interview process you must follow before building anything.

If you are an AI agent asked to build a teaching resource from this project, here is your workflow:

1. **Read `resource.config.json`** — update `title`, `creator`, `outputFile`, `header` to match the requested resource.
2. **Create content modules** in `content/` as `.js` files. Use numeric prefixes (`01-cover.js`, `02-theory.js`, `03-questions.js`) to control the order they appear. Follow the template in Section 7.
3. **Do NOT edit `build.js` or `common.js`** — they are stable infrastructure.
4. **Run** `node build.js` to generate the `.docx` output.

Every content module exports `function(C, H) → array`. Use `C.*` for all formatting (headings, paragraphs, callout boxes, questions, scaffolding). Use `H.*` for table cells. See the Cheat Sheet (Section 12) for every function signature.

---

## Table of Contents

1. [Project Architecture](#1-project-architecture)
2. [Dependencies & Setup](#2-dependencies--setup)
3. [The Two-Tier Helper System](#3-the-two-tier-helper-system)
4. [C — Common Module (`common.js`)](#4-c--common-module-commonjs)
5. [H — Local Helpers (defined in build script)](#5-h--local-helpers-defined-in-build-script)
6. [Document Assembly](#6-document-assembly)
7. [Content Module Template](#7-content-module-template)
10. [Scaffolding Patterns Catalogue](#10-scaffolding-patterns-catalogue)
11. [Practical-on-Paper Patterns](#11-practical-on-paper-patterns)
12. [Colour & Sizing Conventions](#12-colour--sizing-conventions)
13. [Building Different Resource Types](#13-building-different-resource-types)
14. [Quick-Reference Cheat Sheet](#14-quick-reference-cheat-sheet)

---

## 1. Project Architecture

### Core concept

A **build script** assembles content from **content modules** into a complete `.docx` document. The build script owns page-level concerns (margins, headers, footers, cover pages). Content modules own… content (theory, questions, activities, tables). Neither deals with raw `docx` constructors — everything goes through two helper tiers.

### Directory structure (generic)

```
project/
├── build.js               ← BUILD SCRIPT — assembles the final document
├── common.js              ← SHARED UTILITIES (the "C" module — colours, styles, helpers)
├── resource.config.json   ← PER-RESOURCE CONFIG (title, creator, output, contentDir)
├── content/               ← RESOURCE SUBFOLDERS — one per resource
│   ├── my-worksheet/      ←     Each resource in its own folder
│   │   └── 01-worksheet.js
│   ├── my-booklet/
│   │   ├── 01-cover.js
│   │   ├── 02-contents.js
│   │   └── 10-lesson1.js
│   └── my-unit-guide/
│       ├── 01-cover.js
│       └── 10-unit-guide.js
├── output/                ← generated .docx files land here
└── package.json
```

Each resource gets its own subfolder under `content/`. `resource.config.json` points at the subfolder via `contentDir`:
```json
{ "contentDir": "./content/my-resource-name" }
```

This structure scales to any resource type — you just rename the folder and files:

| Resource type | Content folder naming | Example module names |
|---|---|---|
| Multi-week booklet | `content/` | `01-cover.js`, `02-contents.js`, `10-lesson1.js`…`14-lesson4.js`, `90-reference.js` |
| Single worksheet | `content/` | `01-worksheet.js` |
| Unit guide / curriculum map | `content/` | `01-cover.js`, `10-unit-guide.js` |
| Assessment / exam | `content/` | `01-cover-sheet.js`, `10-section-a.js`, `20-section-b.js`, `90-marking-key.js` |
| Lab manual | `content/` | `01-cover.js`, `10-lab1-procedure.js`, `11-lab1-report.js`, `20-lab2.js` |
| Revision guide | `content/` | `01-cover.js`, `10-topic1.js`, `20-topic2.js`, `90-formula-sheet.js` |

### Data flow (generic)

```
build.js
  │
  ├─ require('docx')              → Document, Packer, Paragraph, TextRun, Table, etc.
  ├─ require('./common.js')       → C (colours, styles, page geometry, content helpers)
  │
  ├─ Defines local helper factories → H (cellH, cellP, cellE, cellHint, cellWE, etc.)
  │
  ├─ require('./content/section1.js')(C, H)  → array of docx elements
  ├─ require('./content/section2.js')(C, H)
  ├─ require('./content/section3.js')(C, H)
  ├─ require('./content/appendix.js')(C, H)
  │
  ├─ Assembles: [coverPage(), ...frontMatter(), ...contentModules, ...backMatter()]
  │
  └─ new Document({ ... }) → Packer.toBuffer() → fs.writeFileSync()
```

### Key Design Principles

1. **Content modules know nothing about `docx` internals.** They only call `C.*` and `H.*` functions. The `docx` import in content files is used sparingly (only when composing raw `Paragraph`/`TextRun`/`Table` elements inside worked examples that need custom formatting beyond what the helpers provide).

2. **The two-tier helper system** (`C` = shared, `H` = local) lets you keep global styling in one place while letting each build script customize its own table-cell factories. See [Section 3](#3-the-two-tier-helper-system).

3. **Every resource is just a different arrangement of the same building blocks.** A worksheet reuses the same question helpers (`C.mcQuestion`, `C.scaffoldStep`) as a booklet. A lab manual reuses the same table helpers and `C.workedExample`. You never rebuild the helpers — you just call them differently.

---

## 2. Dependencies & Setup

### Install

```powershell
npm install docx
```

### Core `docx` Imports Used

```js
const {
  Document, Packer, Paragraph, TextRun,
  Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
  HeadingLevel, PageBreak
} = require('docx');
```

| Import | Purpose |
|---|---|
| `Document` | Top-level document container |
| `Packer` | Serializes Document to a `.docx` buffer |
| `Paragraph` | Block-level text container |
| `TextRun` | Inline text span with formatting |
| `Table`, `TableRow`, `TableCell` | Table structures |
| `AlignmentType` | `CENTER`, `LEFT`, `RIGHT`, `JUSTIFIED` |
| `BorderStyle` | `SINGLE`, `DASHED`, `DOTTED`, etc. |
| `WidthType` | `DXA` (twentieths of a point) for column widths |
| `ShadingType` | `CLEAR` for cell background fills |
| `HeadingLevel` | `HEADING_1`, `HEADING_2`, etc. |
| `PageBreak` | `PageBreak` element for forced page breaks |

### Width Unit: DXA

All widths use **DXA** (twentieths of a point).

| Orientation | Usable width | Use Case |
|---|---|---|
| Portrait A4 | ≈ 9360 DXA | Most resources — worksheets, booklets, assessments |
| Landscape A4 | ≈ 14570 DXA | Unit guides, wide tables (6+ columns) |

**Portrait** common column splits:

| Columns | Each (DXA) | Use Case |
|---|---|---|
| 1 | 9360 | Full-width tables, drawing spaces |
| 2 | 4680 | Two-column layouts |
| 3 | 3120 | Three-column reference tables |
| 4 | 2340 | Four-column quick-reference tables |
| 5 | 1872 | Five-column data tables |
| 2:1 split | 6240 + 3120 | Description + answer columns |
| 3:1:1:1 split | 4800 + 1200 + 1200 + 2160 | Practical-on-paper activity tables |

---

## 3. The Two-Tier Helper System

### Tier 1: `C` — Common Module (`common.js`)

Shared across ALL resources. Contains:
- Colour palette
- Page geometry (default A4, configurable)
- Document styles & numbering config
- Header/footer generators
- Content helpers (headings, bullets, callout boxes, worked examples, question types, scaffolding)

**Every content module receives `C` as its first argument.**

This file is written once and rarely modified — new resources pull from the same `C`. You can extend it with new helpers over time, but existing helpers maintain backward compatibility.

### Tier 2: `H` — Local Helpers (defined in each `build.js`)

Table-cell factory functions. These are defined locally in the build script so they close over `C.COLOURS` (so cell border/fill colours match the resource's colour scheme). They are passed as the second argument to every content module.

**Every content module receives `H` as its second argument.**

You can also extend `H` per-resource if a particular document needs a custom cell type (e.g., a special assessment matrix cell). Just define it in `build.js` and pass it through.

---

## 4. C — Common Module (`common.js`)

This is the inferred API surface based on usage. Every function marked `→ type` returns docx element(s) suitable for spreading into an array. This module is the **single source of truth** for all formatting — write it once, use it across every resource you build.

### 4.1 Configuration & Styles

| Export | Type | Description |
|---|---|---|
| `C.COLOURS` | `object` | `{ primary, accent, warning, greenLine }` — hex strings |
| `C.docStyles` | `object` | Custom paragraph/character styles for the Document |
| `C.numberingConfig` | `object` | Numbering definitions (for MC options, steps, etc.) |
| `C.a4PageProps` | `object` | A4 portrait page dimensions, margins |
| `C.a4LandscapeProps` | `object` | A4 landscape page dimensions, margins |

### 4.2 Headers & Footers

```js
C.studentHeader("Week 1 · Unit 0: Introduction to Electronics")
// → Header object for the section

C.studentFooter()
// → Footer object (likely with page numbers)
```

### 4.3 Page & Section Breaks

```js
C.pageBreak()
// → PageBreak element
// Use between lessons and before major section changes.
```

### 4.4 Headings

```js
C.h1("How to Use This Workbook")
// → Paragraph with HeadingLevel.HEADING_1

C.h2("2.1   What is electricity, really?")
// → Paragraph with HeadingLevel.HEADING_2

C.h3("The water analogy")
// → Paragraph with HeadingLevel.HEADING_3

C.h4("Activity 2A — Spot the Break")
// → Paragraph with HeadingLevel.HEADING_4
```

### 4.5 Paragraphs & Text

```js
C.p("Some body text.")
// → Paragraph with standard body styling

C.p("Some text", { spacing: { after: 200 }, italic: true, alignment: AlignmentType.CENTER, color: "595959" })
// → Paragraph with optional formatting overrides
// Options: spacing, italic, alignment, color, indent
```

### 4.6 Bullets

```js
C.bullet("A simple bullet point.")
// → Bulleted paragraph (single TextRun)

C.bulletRich([
  new TextRun({ text: "Bold label: ", bold: true }),
  new TextRun("rest of the sentence.")
])
// → Bulleted paragraph with mixed-formatting TextRuns
// Use bulletRich whenever you need bold+normal in the same bullet.
```

### 4.7 Callout Boxes

```js
C.calloutBox("TITLE", [
  C.p("Body paragraph inside the box."),
  C.bullet("Bullet inside the box."),
], C.COLOURS.warning)
// → A bordered box with a coloured title bar and body content.
// The third argument is the accent colour for the title bar.
// Common colours: C.COLOURS.primary, C.COLOURS.warning, C.COLOURS.accent
```

**Callout box use cases:**

| Title | Colour | When to Use |
|---|---|---|
| `"LEARNING OBJECTIVES"` | `primary` | Start of each section/lesson |
| `"STUDENT DETAILS"` | `warning` | Cover page name/class/date fields |
| `"WATER vs ELECTRICITY"` | `primary` | Key concept comparisons |
| `"CRITICAL RULE"` | `warning` | Must-know safety/conceptual rules |
| `"⚠ A NOTE ON SAFETY"` | `warning` | Safety warnings |
| `"✅ CHECKLIST"` | `greenLine` | What a student answer must include |
| `"KEY CONCEPT"` | `primary` | Highlighting a central idea |
| `"DID YOU KNOW?"` | `accent` | Optional enrichment facts |
| `"COMMON MISTAKE"` | `warning` | Pitfalls to avoid |

### 4.8 Hint Boxes

```js
C.hintBox("Look at the reference table earlier in this section — the answer is on the first row.")
// → Italic grey hint paragraph, indented.
// Use to direct students to the exact location of an answer in the theory above.
```

### 4.9 Sentence Starters

```js
C.sentenceStarter("Voltage is the electrical __________________ that pushes...")
// → Italic grey paragraph that begins the student's answer for them.
// The underscores show where they fill in.
```

### 4.10 Scaffolded Steps

```js
C.scaffoldStep(1, "What is the conversion factor between A and mA?", "× 1000 or ÷ 1000?")
// → Numbered step with a prompt question and optional hint in parentheses.
// First arg: step number
// Second arg: the question/prompt for this step
// Third arg: optional hint text (pass null to omit)
```

### 4.11 Lined Answer Space

```js
C.linedAnswerSpace(3)
// → Returns N empty underlined lines for handwritten answers.
// Argument: number of lines to provide.
```

### 4.12 Drawing Space

```js
C.drawingSpace(3.5, "Drawing space:")
// → Returns a bordered box (height in inches) with an optional label.
// First arg: height in inches (float, e.g. 3.5)
// Second arg: optional label above the box
```

### 4.13 Worked Examples

```js
C.workedExample("Identifying Voltage, Current, and Resistance", [
  C.p("Question: A torch uses a 3 V battery..."),
  C.p(""),
  new Paragraph({ children: [new TextRun({ text: "Step 1: ...", bold: true, color: C.COLOURS.primary })] }),
  // ...more steps
])
// → A bordered box with:
//   - Title bar with "📘 WORKED EXAMPLE" label
//   - Body containing the steps (any docx elements)
// Each step heading uses bold primary-coloured text.
```

### 4.14 Lesson Banner

```js
C.lessonBanner(2, "Circuit Basics — Voltage, Current & Complete Circuits", "Unit 0 · Introduction to Electronics")
// → Full-width banner at the top of each lesson.
// Args: lesson number, lesson title, unit/subtitle
```

### 4.15 Section Tags

```js
C.sectionTag("Multiple Choice Questions")
// → Styled divider/heading for question sections.
// Optionally: C.sectionTag("Practical on Paper", C.COLOURS.greenLine) for colour override.
```

### 4.16 Multiple Choice Questions

```js
C.mcQuestion(2, "What is the unit of electrical current?", [
  "Volt (V)", "Ampere (A)", "Ohm (Ω)", "Watt (W)"
], "mc-q2")
// → Returns an array: [question paragraph, ...option paragraphs]
// Always spread with ... when using.
// Args:
//   1. Question number
//   2. Question stem (the question text)
//   3. Array of 4 option strings
//   4. Unique numbering reference (e.g. "mc-q2") for the option list
```

**MC scaffolding principle:** Early questions are deliberately easy. The first question's answer is often directly stated in a hint box or the theory on the same page. Difficulty ramps up through questions 4–6.

---

## 5. H — Local Helpers (defined in build script)

These are table-cell factory functions. They abstract away the verbose `TableCell` constructor. Each returns a `TableCell` object ready to be placed in a `TableRow`. Define them once in your `build.js` — they are the same for every resource unless you need a custom cell type.

### 5.1 `borderAll(color, size)`

```js
function borderAll(color, size) {
  return {
    top: { style: BorderStyle.SINGLE, size, color },
    bottom: { style: BorderStyle.SINGLE, size, color },
    left: { style: BorderStyle.SINGLE, size, color },
    right: { style: BorderStyle.SINGLE, size, color },
  };
}
```
Utility used by all cell factories. Not typically called directly in content modules.

### 5.2 Cell Type Reference

| Factory | Signature | Appearance | Use Case |
|---|---|---|---|
| `cellH(text, w)` | Header cell | **Primary-colour fill, white bold text** | Table headers |
| `cellP(text, w)` | Plain cell | Light grey border, black text | Regular data cells |
| `cellPr(paragraphs, w)` | Rich cell | Light grey border, multiple paragraphs | Cells with complex content |
| `cellE(w, n=3)` | Empty cell | Light grey border, N blank lines | Student fill-in cells |
| `cellHint(text, w)` | Hint cell | Light grey border, italic grey small text | In-table hints |
| `cellWE(text, w)` | Worked example cell | Green border, green-tinted background | Completed example cells |
| `cellWELabel(label, text, w)` | Labelled WE cell | Green border/tint, bold label + body | Example cells with a label badge |
| `bdCell(header, body, fill, w)` | Big-display cell | Thick primary border, large padding, centered | Key facts, "big idea" displays |
| `bdCellRich(header, bodyParas, fill, w)` | Rich big-display cell | Same as bdCell but body is paragraph array | Key facts with multi-paragraph body |

### 5.3 Cell Factory Details

#### `cellH(text, w)` — Header Cell
```js
cellH("Quantity", 2340)
```
- Primary colour background fill
- White bold 22pt text
- 8pt primary-colour border
- 80px top/bottom, 120px left/right margins

#### `cellP(text, w)` — Plain Data Cell
```js
cellP("Voltage", 2340)
```
- No background fill
- 4pt #BFBFBF grey border
- 22pt black text
- Same margins as cellH

#### `cellPr(paragraphs, w)` — Rich Paragraph Cell
```js
cellPr([para1, para2], 3120)
```
- Like cellP but accepts an array of Paragraph objects
- Use when a cell needs multiple paragraphs or mixed formatting

#### `cellE(w, n=3)` — Empty Fill-in Cell
```js
cellE(1200)       // 3 blank lines
cellE(1200, 5)    // 5 blank lines
```
- N empty paragraphs for handwritten answers
- Default 3 lines, override with second argument

#### `cellHint(text, w)` — Hint Cell
```js
cellHint("(hint: what does 'open' do to the loop?)", 2160)
```
- Italic grey (#808080) 20pt text
- Used inside activity tables to give partial scaffolding

#### `cellWE(text, w)` — Worked Example Cell
```js
cellWE("✓", 1200)
cellWE("Loop is complete; switch is closed.", 2160)
```
- Green border (#70AD47, 6pt)
- Light green background (#E2EFDA)
- 22pt text
- Used for the "fully worked" first row of practical-on-paper tables

#### `cellWELabel(label, text, w)` — Labelled Worked Example Cell
```js
cellWELabel("✓ EXAMPLE", "Battery, closed switch, LED, all in one loop.", 4800)
```
- Same green styling as cellWE
- First line: bold dark green (#385723) 18pt label
- Second line: 22pt body text
- Used for the first column of worked example rows

#### `bdCell(headerText, bodyText, fillColour, w)` — Big Display Cell
```js
bdCell("VOLTAGE", "Electrical pressure that pushes electrons", "E8F0FE", 4680)
```
- Thick primary-colour border (12pt)
- Large padding (240px all sides)
- Centred header (bold, primary-colour, 20pt) + centred body (22pt)
- Custom background fill colour
- Use for key concept highlight boxes

#### `bdCellRich(headerText, bodyParas, fillColour, w)` — Rich Big Display Cell
```js
bdCellRich("KEY IDEA", [para1, para2], "FFF3E0", 4680)
```
- Like bdCell but body is an array of Paragraph objects
- Use when the body needs bullets or multiple paragraphs

### 5.4 `hiddenAnswer(items)`

```js
hiddenAnswer([
  ["(a)", "20 ÷ 1000 = 0.02 A"],
  ["(b)", "0.5 × 1000 = 500 mA"],
])
```
- Returns an array of paragraphs (always spread with `...`)
- Starts with a "👇 ANSWER (cover this until you've tried):" header
- Each item is a `[label, answerText]` pair rendered as an italic bullet
- Place immediately after a "Now You Try" question block

---

## 6. Document Assembly

### 6.1 How `build.js` Works

The build script is **fully automatic** — it does not need editing per resource:

1. Reads `resource.config.json` for metadata (title, creator, output filename, header, landscape flag)
2. Scans `content/` directory for all `.js` files, sorted alphabetically
3. Requires each file and calls it as `module(C, H)`, collecting the returned arrays
4. Assembles all elements into a single `Document` with the configured page properties
5. Serializes to `.docx` via `Packer.toBuffer()` and writes to `output/`

**Config fields:**
```json
{
  "title": "Document Title",
  "creator": "Author Name",
  "outputFile": "./output/resource.docx",
  "header": "Running header text",
  "contentDir": "./content",
  "footer": true,
  "landscape": false
}
```
- `landscape`: set `true` for unit guides and resources with 6+ table columns
- `footer`: set `false` to suppress the page-number footer
- `header`: omit or set to `""` for no running header

### 6.2 How Content Modules Receive Their Arguments

Each content module exports a function `(C, H) → array`. They destructure only the helpers they actually use:

```js
// content/section2.js
module.exports = function section2(C, H) {
  const { borderAll, cellH, cellP, cellE, cellHint, cellWE, cellWELabel, hiddenAnswer } = H;

  return [
    C.h2("2.1   Topic"),
    C.p("Body text..."),
    // ...all content goes here
  ];
};
```

### 6.3 Adapting for Different Resource Types

The same `build.js` handles all resource types — you only change `resource.config.json` and `content/`. No separate build scripts needed.

**Unit guide** (landscape table): set `"landscape": true` in config. Content: `01-cover.js` + `10-unit-guide.js` (a `Table` with 7 columns, one row per week, using `cellPr()` for multi-paragraph cells).

**Minimal worksheet** (portrait, single file): set `"landscape": false`. Content: just `01-worksheet.js`.

**Multi-section resource** (booklet, exam, lab manual): Content files like `01-cover.js`, `10-section-a.js`, `20-section-b.js`, `90-appendix.js`. Numeric prefixes control order.

**Assessment with separate marking key**: Build twice — update `outputFile` in config between runs, or create two config files and run `build.js` against each.

---

## 7. Content Module Template

This is the **full-featured** template — the kitchen-sink version with every section type. For simpler resources, delete the sections you don't need. A quick worksheet might only use Theory + MC + Short Answer. A lab manual might only use Theory + Worked Examples + Practical.

Every content module file follows this skeleton:

```js
// Section N — Title
const {
  Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType
} = require('docx');

module.exports = function sectionN(C, H) {
  const { borderAll, cellH, cellP, cellE, cellHint, cellWE, cellWELabel, hiddenAnswer } = H;

  return [

    // ===== BANNER (optional — for lesson-style resources) =====
    C.lessonBanner(N, "Section Title", "Unit X · Topic"),
    C.p("", { spacing: { after: 120 } }),

    // ===== LEARNING OBJECTIVES (optional) =====
    C.calloutBox("LEARNING OBJECTIVES", [
      C.p("By the end of this section, you should be able to:"),
      C.bullet("Objective 1"),
      C.bullet("Objective 2"),
      C.bullet("Objective 3"),
      C.bullet("Objective 4"),
    ]),

    // ===== THEORY SECTION 1 =====
    C.h2("N.1   Topic heading"),
    C.p("Body paragraph explaining the concept."),
    C.p("Additional explanation."),

    C.h3("Sub-topic"),
    C.p("More detail..."),

    // Optional: reference table
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [2340, 2340, 2340, 2340],
      rows: [
        new TableRow({ tableHeader: true, children: [
          cellH("Col1", 2340), cellH("Col2", 2340), cellH("Col3", 2340), cellH("Col4", 2340)
        ]}),
        new TableRow({ children: [
          cellP("Data", 2340), cellP("Data", 2340), cellP("Data", 2340), cellP("Data", 2340)
        ]}),
      ]
    }),

    // Optional: callout box
    C.calloutBox("KEY CONCEPT", [
      C.p("Important information in a box."),
    ]),

    C.pageBreak(),

    // ===== THEORY SECTION 2 (if needed) =====
    C.h2("N.2   Another topic"),
    // ...

    C.pageBreak(),

    // ===== WORKED EXAMPLES (2–3) =====
    C.h2("N.3   Worked Examples"),

    C.workedExample("Example Title", [
      C.p("Question: ..."),
      C.p(""),
      new Paragraph({ children: [
        new TextRun({ text: "Step 1: ...", bold: true, color: C.COLOURS.primary })
      ], spacing: { before: 80, after: 60 } }),
      C.bulletRich([
        new TextRun({ text: "Key point: ", bold: true }),
        new TextRun("explanation.")
      ]),
      // ... more steps
    ]),

    C.p("", { spacing: { after: 120 } }),

    C.workedExample("✏️ Now You Try — Title", [
      C.p("Question: ..."),
      // ... question content with blanks
      // ...hiddenAnswer([...])   ← spread the hidden answer array
    ]),

    C.pageBreak(),

    // ===== MULTIPLE CHOICE =====
    C.sectionTag("Multiple Choice Questions"),
    C.p("Circle the correct answer. The first questions are gentle warm-ups.", { italic: true, spacing: { after: 120 } }),

    // Question 1 — often custom-built to be extra-easy with a hint
    new Paragraph({ children: [
      new TextRun({ text: "1. ", bold: true }),
      new TextRun("Question stem...")
    ], spacing: { before: 160, after: 80 } }),
    ...["Option A.", "Option B.", "Option C.", "Option D."].map(opt =>
      new Paragraph({ numbering: { reference: "mc-q1", level: 0 }, children: [new TextRun(opt)], spacing: { after: 40 } })
    ),
    C.hintBox("Look at the THEORY callout box on page X — the answer is stated there."),

    // Questions 2–6 — use the helper
    ...C.mcQuestion(2, "Question stem?", ["A", "B", "C", "D"], "mc-q2"),
    ...C.mcQuestion(3, "Question stem?", ["A", "B", "C", "D"], "mc-q3"),
    // ...

    C.pageBreak(),

    // ===== SHORT ANSWER =====
    C.sectionTag("Short Answer Questions"),
    C.p("Use the sentence starters and step-by-step prompts.", { italic: true, spacing: { after: 120 } }),

    // Fill-in table question
    new Paragraph({ children: [
      new TextRun({ text: "7. ", bold: true }),
      new TextRun("Question instruction...")
    ], spacing: { before: 160, after: 80 } }),
    C.hintBox("Look at the reference table on page X of this lesson."),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [3120, 3120, 3120],
      rows: [
        new TableRow({ tableHeader: true, children: [
          cellH("Col1", 3120), cellH("Col2", 3120), cellH("Col3", 3120)
        ]}),
        new TableRow({ children: [
          cellP("Known", 3120), cellP("Known", 3120), cellP("____________________", 3120)
        ]}),
      ]
    }),

    // Sentence starter question
    new Paragraph({ children: [
      new TextRun({ text: "8. ", bold: true }),
      new TextRun("Define X in your own words.")
    ], spacing: { before: 240, after: 80 } }),
    C.sentenceStarter("X is the __________________ that..."),
    ...C.linedAnswerSpace(2),

    // Scaffolded calculation question
    new Paragraph({ children: [
      new TextRun({ text: "9. ", bold: true }),
      new TextRun("Calculate... Show your working.")
    ], spacing: { before: 200, after: 80 } }),
    C.scaffoldStep(1, "Step 1 prompt?", "Hint in brackets"),
    C.scaffoldStep(2, "Step 2 prompt?", null),
    C.scaffoldStep(3, "Step 3: calculate =", null),

    C.pageBreak(),

    // ===== EXTENDED RESPONSE =====
    C.sectionTag("Extended Response"),

    new Paragraph({ children: [
      new TextRun({ text: "10. ", bold: true }),
      new TextRun("Extended question... Aim for 100–150 words.")
    ], spacing: { before: 200, after: 80 } }),

    C.hintBox("Use the planning steps to organise your answer first."),

    // Planning steps
    new Paragraph({ children: [
      new TextRun({ text: "PLANNING STEPS — fill these in first:", bold: true, color: C.COLOURS.primary, size: 22 })
    ], spacing: { before: 160, after: 80 } }),
    C.scaffoldStep(1, "Planning prompt?", "Hint"),
    C.scaffoldStep(2, "Planning prompt?", null),
    C.scaffoldStep(3, "Planning prompt?", null),
    C.scaffoldStep(4, "Planning prompt?", "Hint"),
    C.scaffoldStep(5, "Planning prompt?", null),

    // Writing section
    new Paragraph({ children: [
      new TextRun({ text: "NOW WRITE YOUR PARAGRAPH using the sentence starters:", bold: true, color: C.COLOURS.primary, size: 22 })
    ], spacing: { before: 240, after: 80 } }),

    // Sentence starters with blanks interspersed with lined spaces
    new Paragraph({
      children: [
        new TextRun({ text: "The student is incorrect because ", italics: true, color: "808080" }),
        new TextRun({ text: "______________________ . " })
      ],
      spacing: { after: 80 }, indent: { left: 240 }
    }),
    ...C.linedAnswerSpace(2),
    // ... more starters + spaces

    C.pageBreak(),

    // ===== PRACTICAL ON PAPER =====
    C.sectionTag("Practical on Paper", C.COLOURS.greenLine),

    // Activity 1: Spot-the-Break / Identify
    C.h4("Activity NA — Title"),
    C.p("Instruction paragraph."),
    C.p("The first row is a fully worked example. The second row gives you a HINT.", { italic: true, spacing: { after: 120 } }),

    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [4800, 1200, 1200, 2160],
      rows: [
        new TableRow({ tableHeader: true, children: [
          cellH("Description", 4800), cellH("YES", 1200), cellH("NO", 1200), cellH("Why?", 2160)
        ]}),
        // Row 1: Fully worked
        new TableRow({ children: [
          cellWELabel("✓ EXAMPLE", "Description of correct scenario.", 4800),
          cellWE("✓", 1200),
          cellWE("", 1200),
          cellWE("Explanation of why it works.", 2160),
        ]}),
        // Row 2: Hinted
        new TableRow({ children: [
          cellP("Description with a trap.", 4800),
          cellHint("(hint: clue)", 1200),
          cellHint("← or →", 1200),
          cellHint("(hint: clue)", 2160),
        ]}),
        // Rows 3+: Independent
        new TableRow({ children: [
          cellP("Another scenario.", 4800),
          cellE(1200), cellE(1200), cellE(2160)
        ]}),
      ]
    }),

    C.pageBreak(),

    // Activity 2: Sketch / Draw / Build
    C.h4("Activity NB — Title"),

    new Paragraph({ children: [
      new TextRun({ text: "STEP 1 — Study this worked example.", bold: true, color: C.COLOURS.primary, size: 24 })
    ], spacing: { before: 120, after: 80 } }),
    C.p("Below is a labelled example. Notice all the parts that are labelled."),

    // ... worked example diagram/table ...

    new Paragraph({ children: [
      new TextRun({ text: "STEP 2 — Now you draw your own.", bold: true, color: C.COLOURS.primary, size: 24 })
    ], spacing: { before: 240, after: 100 } }),
    C.p("Draw a labelled diagram. Use the checklist below."),

    C.calloutBox("✅ CHECKLIST — your sketch must include:", [
      C.bullet("Requirement 1"),
      C.bullet("Requirement 2"),
      C.bullet("Requirement 3"),
    ]),
    ...C.drawingSpace(3.5, "Drawing space:"),

    C.pageBreak()
  ];
};
```

---

## 8. Booklet Lesson Structure (Pedagogical Template)

When building a heavily-scaffolded student booklet, each lesson follows this exact pedagogical sequence. This is the proven pattern from Claude's working booklets:

### 8.1 Lesson Sequence (per lesson file)

```
1. LESSON BANNER          C.lessonBanner(N, "title", "subtitle")
2. LEARNING OBJECTIVES    C.calloutBox("LEARNING OBJECTIVES", [...])
3. THEORY                 C.h2() + C.h3() + C.p() + reference tables
4. WORKED EXAMPLES        C.workedExample() × 2–3, including 1 "Now You Try"
5. MULTIPLE CHOICE        Q1 easy with hint, Q2–Q6 ramping difficulty
6. SHORT ANSWER           Sentence starters, fill-in tables, scaffolded steps
7. EXTENDED RESPONSE      Planning steps → sentence starters → lined spaces
8. PRACTICAL ON PAPER     Spot-the-break tables, sketch builds, checklists
```

### 8.2 Theory Section Pattern

```js
C.h2("N.1   Topic heading"),
C.p("Body paragraph explaining the concept."),
C.p("Additional explanation using plain language."),

C.h3("Sub-topic"),
C.p("More detail..."),

// Optional: reference table using cellH/cellP
new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [2340, 2340, 2340, 2340],
  rows: [
    new TableRow({ tableHeader: true, children: [
      cellH("Col1", 2340), cellH("Col2", 2340), ...
    ]}),
    // data rows with cellP()
  ]
}),

// Optional: key concept callout box
C.calloutBox("KEY CONCEPT", [
  C.p("The important idea, stated clearly."),
  C.bullet("Supporting detail in a bullet."),
]),
```

### 8.3 Worked Examples Pattern

Every lesson needs 2–3 worked examples. The first two are fully solved; the third is a "Now You Try" with hidden answers.

**Full worked example:**
```js
C.workedExample("Descriptive Title", [
  C.p("Question: state the problem clearly."),
  C.p(""),
  new Paragraph({ children: [
    new TextRun({ text: "Step 1: Do this first.", bold: true, color: C.COLOURS.primary })
  ], spacing: { before: 80, after: 60 } }),
  C.bulletRich([
    new TextRun({ text: "Key result: ", bold: true }),
    new TextRun("the answer with explanation.")
  ]),
  // ... repeat for Step 2, Step 3 ...
  new Paragraph({ children: [
    new TextRun({ text: "Final answer: ", bold: true, color: C.COLOURS.primary }),
    new TextRun("the result.")
  ], spacing: { before: 100, after: 60 } }),
]),
```

**"Now You Try" with hidden answer:**
```js
C.workedExample("✏️ Now You Try — Title", [
  C.p("Question: try this similar problem on your own."),
  new Paragraph({ children: [
    new TextRun({ text: "💡 Hint: reminder of the key concept.", italics: true, color: "595959" })
  ], spacing: { after: 120 }, indent: { left: 240 } }),
  // Question parts with blanks
  new Paragraph({ children: [
    new TextRun({ text: "(a) ", bold: true }),
    new TextRun({ text: "____________", bold: true })
  ], spacing: { after: 80 }, indent: { left: 240 } }),
  // Hidden answer (always spread with ...)
  ...hiddenAnswer([
    ["(a)", "The answer to part (a)"],
    ["(b)", "The answer to part (b)"],
  ])
]),
```

### 8.4 Multiple Choice Pattern

Q1 is deliberately easy — the answer is often stated in the theory on the same page. Use a hint box to point students to the exact location. Q2–Q6 ramp in difficulty.

```js
C.sectionTag("Multiple Choice Questions"),
C.p("Circle the correct answer. The first questions are gentle warm-ups.", { italic: true, spacing: { after: 120 } }),

// Q1: custom-built, extra-easy, with hint
new Paragraph({ children: [
  new TextRun({ text: "1. ", bold: true }),
  new TextRun("Easy question stem...")
], spacing: { before: 160, after: 80 } }),
...["Option A.", "Option B.", "Option C.", "Option D."].map(opt =>
  new Paragraph({ numbering: { reference: "mc-q1", level: 0 }, children: [new TextRun(opt)], spacing: { after: 40 } })
),
C.hintBox("Look at the callout box on page 1 of this lesson — the answer is on the first line."),

// Q2–Q6: use the helper (ramping difficulty)
...C.mcQuestion(2, "Question stem?", ["A","B","C","D"], "mc-q2"),
...C.mcQuestion(3, "Harder question?", ["A","B","C","D"], "mc-q3"),
// ...
```

### 8.5 Short Answer Pattern

Mix of fill-in tables, sentence starters, and scaffolded calculation questions:

```js
C.sectionTag("Short Answer Questions"),
C.p("Use the sentence starters and step-by-step prompts.", { italic: true }),

// Fill-in table question
new Paragraph({ children: [
  new TextRun({ text: "7. ", bold: true }),
  new TextRun("Fill in the table...")
], spacing: { before: 160, after: 80 } }),
C.hintBox("Look at the reference table on page 1 of this lesson."),
// ... Table with cellP("____________________", w) for blanks ...

// Sentence starter question
new Paragraph({ children: [
  new TextRun({ text: "8. ", bold: true }),
  new TextRun("Define X in your own words.")
], spacing: { before: 240, after: 80 } }),
C.sentenceStarter("X is the __________________ that..."),
...C.linedAnswerSpace(2),

// Scaffolded calculation
new Paragraph({ children: [
  new TextRun({ text: "9. ", bold: true }),
  new TextRun("Calculate... Show your working.")
], spacing: { before: 200, after: 80 } }),
C.scaffoldStep(1, "What is the formula?", "It starts with V"),
C.scaffoldStep(2, "Convert units:", "mA → A: divide by 1000"),
C.scaffoldStep(3, "Calculate:", null),
```

### 8.6 Extended Response Pattern

Three-phase: Think → Plan → Write.

```js
C.sectionTag("Extended Response"),

new Paragraph({ children: [
  new TextRun({ text: "10. ", bold: true }),
  new TextRun("Extended question... Aim for 100–150 words.")
], spacing: { before: 200, after: 80 } }),

C.hintBox("Use the planning steps first, then the sentence starters."),

// Phase 1: Planning
new Paragraph({ children: [
  new TextRun({ text: "PLANNING STEPS — fill these in first:", bold: true, color: C.COLOURS.primary, size: 22 })
], spacing: { before: 160, after: 80 } }),
C.scaffoldStep(1, "What concept applies?", "Hint in brackets"),
C.scaffoldStep(2, "What evidence supports this?", null),
C.scaffoldStep(3, "What is the conclusion?", null),
C.scaffoldStep(4, "Preview your fix/solution:", null),

// Phase 2: Writing with starters
new Paragraph({ children: [
  new TextRun({ text: "NOW WRITE YOUR PARAGRAPH:", bold: true, color: C.COLOURS.primary, size: 22 })
], spacing: { before: 240, after: 80 } }),

new Paragraph({
  children: [
    new TextRun({ text: "The claim is incorrect because ", italics: true, color: "808080" }),
    new TextRun({ text: "______________________ ." })
  ],
  spacing: { after: 80 }, indent: { left: 240 }
}),
...C.linedAnswerSpace(2),
// ... more starter + space pairs
```

### 8.7 Practical-on-Paper Pattern

Two activity types:

**Type A — Identify/Judge table:**
Uses the Worked → Hinted → Independent tier system. First row fully worked (`cellWELabel` + `cellWE`), second row hinted (`cellHint`), remaining rows blank (`cellE`).

**Type B — Sketch/Build:**
```js
C.h4("Activity NB — Title"),

// Step 1: Study the worked example
new Paragraph({ children: [
  new TextRun({ text: "STEP 1 — Study this worked example.", bold: true, color: C.COLOURS.primary, size: 24 })
], spacing: { before: 120, after: 80 } }),
C.p("Below is a labelled example. Notice all the parts that are labelled."),
// ... diagram/table ...

// Step 2: Draw your own
new Paragraph({ children: [
  new TextRun({ text: "STEP 2 — Now you draw your own.", bold: true, color: C.COLOURS.primary, size: 24 })
], spacing: { before: 240, after: 100 } }),
C.calloutBox("✅ CHECKLIST — your sketch must include:", [
  C.bullet("Requirement 1"),
  C.bullet("Requirement 2"),
]),
...C.drawingSpace(3.5, "Drawing space:"),
```

---

## 9. Teacher Edition Patterns

When building a booklet with a paired teacher edition, these patterns are used in the teacher document. The teacher edition is a separate build (separate `build.js` invocation with different `resource.config.json`, typically pointing at a different content folder like `content/my-booklet-teacher/`).

### 9.1 Teacher Colour Palette

```js
const TC = {
  red: "C00000",           // teacher cover headings
  green: "385723",         // answer text
  greenBg: "E2EFDA",       // answer box background
  greenBorder: "70AD47",   // answer box border
  amber: "BF8F00",         // teaching note heading
  amberBg: "FFF2CC",       // teaching note background
  amberBorder: "FFC000",   // teaching note border
  greyText: "595959"       // question references
};
```

### 9.2 Answer Box

Green left-border box with "✓ ANSWER" heading. Body text is green.

```js
function answerBox(bodyParagraphs) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({ children: [new TableCell({
      borders: {
        top:    { style: BorderStyle.SINGLE, size: 6,  color: TC.greenBorder },
        bottom: { style: BorderStyle.SINGLE, size: 6,  color: TC.greenBorder },
        left:   { style: BorderStyle.SINGLE, size: 18, color: TC.greenBorder },
        right:  { style: BorderStyle.SINGLE, size: 6,  color: TC.greenBorder },
      },
      width: { size: 9360, type: WidthType.DXA },
      shading: { fill: TC.greenBg, type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 200, right: 200 },
      children: [
        new Paragraph({
          children: [new TextRun({ text: "✓ ANSWER", bold: true, color: TC.green, size: 22 })],
          spacing: { after: 80 }
        }),
        ...bodyParagraphs
      ]
    })] })]
  });
}
```

### 9.3 Teaching Note Box

Amber left-border box with "⚠ TEACHING NOTE" heading. Used for pacing advice, common misconceptions, and marking approach notes.

```js
function teachingNote(bodyParagraphs) {
  // Same structure as answerBox but with amber colours
  // Borders: TC.amberBorder, Background: TC.amberBg, Heading: TC.amber
}
```

### 9.4 Question Reference

Italic grey text linking teacher answers back to student questions:

```js
function qRef(text) {
  return new Paragraph({
    children: [new TextRun({ text, italics: true, color: TC.greyText, size: 20 })],
    spacing: { before: 200, after: 80 }
  });
}
// Usage: qRef("Q1: Best example of an INPUT")
```

### 9.5 Answer Paragraphs and Bullets

Green text for all answer content:

```js
function aPara(text) {
  return new Paragraph({
    children: [new TextRun({ text, color: TC.green, size: 22 })],
    spacing: { after: 60 }
  });
}
function aBullet(text) {
  return new Paragraph({
    children: [
      new TextRun({ text: "• ", color: TC.green, bold: true }),
      new TextRun({ text, color: TC.green })
    ],
    spacing: { after: 40 }, indent: { left: 240 }
  });
}
```

### 9.6 Marking Criteria

For extended response questions, include a marking criteria breakdown inside a teaching note:

```js
teachingNote([
  new Paragraph({ children: [
    new TextRun({ text: "MARKING CRITERIA (out of 6):", bold: true, size: 22 })
  ] }),
  new Paragraph({ children: [
    new TextRun({ text: "• 1 mark — States the circuit is incomplete / not a closed loop", size: 22 })
  ], spacing: { after: 40 } }),
  new Paragraph({ children: [
    new TextRun({ text: "• 1 mark — Recognises voltage IS present at the LED", size: 22 })
  ], spacing: { after: 40 } }),
  // ... more criteria ...
]),
```

### 9.7 Teacher Cover Page

Red "TEACHER COPY — CONFIDENTIAL" cover:

```js
function teacherCover() {
  return [
    new Paragraph({
      children: [new TextRun({ text: "TEACHER COPY", bold: true, size: 56, color: TC.red })],
      alignment: AlignmentType.CENTER, spacing: { before: 1800 }
    }),
    new Paragraph({
      children: [new TextRun({ text: "CONFIDENTIAL", bold: true, size: 36, color: TC.red })],
      alignment: AlignmentType.CENTER, spacing: { after: 600 }
    }),
    // ... course title, week, description ...
    // Red-bordered usage notice box
  ];
}
```

### 9.8 "How to Teach" Guide

Structured page with:
- **Pacing** — time estimates per lesson
- **Common Misconceptions** — bulleted list of pitfalls
- **Marking Approach** — how to score each question type

### 9.9 common.js Additions for Teacher Edition

`common.js` should export these additional functions:

```
teacherHeader(text)    → Header object (red-themed or standard)
teacherFooter()        → Footer object (same as studentFooter usually)
```

Teachers use the same `C.studentHeader()`/`C.studentFooter()` or these teacher-specific variants depending on design choice. The teacher edition typically reuses most `C.*` helpers, adding the TC colour palette and answer/note boxes locally in its build script.

---

## 10. Scaffolding Patterns Catalogue

### Pattern 1: "The Answer Is In The Hint"

The first multiple-choice question's answer is literally stated in the theory on the same page. The hint box tells the student exactly where to look.

```js
new Paragraph({ children: [
  new TextRun({ text: "1. ", bold: true }),
  new TextRun("Fill in the blank: \"In the water analogy, voltage is like __________.\"")
], spacing: { before: 160, after: 80 } }),
...["pressure.", "the colour of the pipe.", "the temperature of the water.", "the weight of the water."].map(opt =>
  new Paragraph({ numbering: { reference: "mc-q1", level: 0 }, children: [new TextRun(opt)], spacing: { after: 40 } })
),
C.hintBox("Look at the KEY CONCEPT callout box earlier in this section — the answer is on the first line."),
```

### Pattern 2: Worked → Hinted → Independent

Tables with three tiers of scaffolding:

| Tier | Cell Types Used | Student Effort |
|---|---|---|
| Row 1 (worked) | `cellWELabel` + `cellWE` | Read and understand |
| Row 2 (hinted) | `cellHint` cells with clues | Apply with guidance |
| Rows 3+ (independent) | `cellE` (empty) | Full recall and application |

### Pattern 3: Hidden Answer

After a "Now You Try" worked example, the answer is printed but preceded by a "cover this" instruction:

```js
...hiddenAnswer([
  ["(a)", "20 ÷ 1000 = 0.02 A"],
  ["(b)", "0.5 × 1000 = 500 mA"],
])
```

### Pattern 4: Think → Plan → Write

Extended response questions follow a three-phase structure:
1. **Planning steps** — `C.scaffoldStep()` prompts to structure thinking
2. **Sentence starters** — Italic grey text that begins each paragraph
3. **Lined spaces** — `C.linedAnswerSpace(N)` for handwritten completion

### Pattern 5: Checklist Before Drawing

Before students draw/sketch, a `C.calloutBox("✅ CHECKLIST", ...)` lists all required elements. This turns an open-ended task into a structured one.

### Pattern 6: Fill-in-the-Table

Pre-built tables with some cells pre-filled and others containing `____________________` for students to complete. Always paired with a `C.hintBox()` pointing to the theory reference table.

---

## 11. Practical-on-Paper Patterns

### 9.1 Spot-the-Break / Identify Activity

A table where students judge circuit scenarios:

```
┌──────────────────────────────────────┬─────┬─────┬──────────┐
│ Circuit description                  │ YES │ NO  │ Why?     │
├──────────────────────────────────────┼─────┼─────┼──────────┤
│ ✓ EXAMPLE: Battery, closed switch... │  ✓  │     │ Loop is  │
│                                      │     │     │ complete │
├──────────────────────────────────────┼─────┼─────┼──────────┤
│ Battery, OPEN switch...              │hint │hint │ hint     │
├──────────────────────────────────────┼─────┼─────┼──────────┤
│ Battery, LED, only one wire...       │     │     │          │
└──────────────────────────────────────┴─────┴─────┴──────────┘
```

**Column widths:** `[4800, 1200, 1200, 2160]` (total 9360)

### 9.2 Sketch a Circuit (Scaffolded Build)

Three-phase structure:
1. **STEP 1 — Study the worked example:** A diagram rendered with monospaced text (`font: "Consolas"`) inside a bordered/shaded table cell, with labelled parts
2. **STEP 2 — Draw your own:** A checklist of required elements + a `C.drawingSpace()` box
3. Conventional current flow direction labelled with italic grey text

### 9.3 ASCII Circuit Diagrams

Circuits are drawn using box-drawing characters in Consolas font inside a single table cell with light background:

```js
new TableCell({
  borders: borderAll(C.COLOURS.primary, 8),
  width: { size: 7280, type: WidthType.DXA },
  shading: { fill: "FAFAFA", type: ShadingType.CLEAR },
  margins: { top: 240, bottom: 240, left: 240, right: 240 },
  children: [
    new Paragraph({ alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: "── + ─── [BATTERY 3V] ─── − ──", font: "Consolas", size: 24 })
    ]}),
    // ... more lines using │ └ ─ ┘ characters
  ]
})
```

**Useful box-drawing characters:**
- `─` horizontal line
- `│` vertical line
- `┌` top-left corner
- `┐` top-right corner
- `└` bottom-left corner
- `┘` bottom-right corner
- `├` left T-junction
- `┤` right T-junction

### 9.4 Row Height Control

For diagram cells, set an explicit minimum row height:
```js
new TableRow({
  height: { value: 2880, rule: "atLeast" },
  children: [ ... ]
})
```
Value is in DXA. 2880 DXA ≈ 2 inches.

---

## 12. Colour & Sizing Conventions

### 10.1 Colour Palette

| Role | Hex | Constant | Used For |
|---|---|---|---|
| Primary brand | (defined in `C.COLOURS.primary`) | `C.COLOURS.primary` | Headers, banners, table header fills, key accents |
| Accent | (defined in `C.COLOURS.accent`) | `C.COLOURS.accent` | Cover page subtitle |
| Warning/amber | (defined in `C.COLOURS.warning`) | `C.COLOURS.warning` | Safety callouts, student details box |
| Green line | (defined in `C.COLOURS.greenLine`) | `C.COLOURS.greenLine` | Practical-on-paper section tags, checklists |
| Grey hint | `#808080` | — | Hint text, sentence starters, "cover this" labels |
| Grey border | `#BFBFBF` | — | Standard table cell borders |
| Green WE | `#70AD47` / `#E2EFDA` | — | Worked example cell borders/fill |
| Dark green WE label | `#385723` | — | Worked example label text |
| Page background | `#FAFAFA` | — | Diagram cell backgrounds |
| Medium grey | `#595959` | — | Subtitles, secondary text |

### 10.2 Font Sizes

| Element | Size (half-points) | Visual |
|---|---|---|
| Cover title | 72 | Very large |
| Cover week number | 56 | Large white on primary |
| Cover subtitle | 32–36 | Medium |
| Section headings (h2) | ~28–32 | Prominent |
| Sub-headings (h3/h4) | ~24–26 | Clear |
| Body text | 22 | Standard readable |
| Hint text | 20 | Slightly smaller |
| Worked example labels | 18 | Small badge |
| Table header cells | 22 bold | Standard |
| Consolas (diagrams) | 24 | Monospaced |

### 10.3 Spacing

| Element | Spacing |
|---|---|
| Paragraph after | Typically 80–120 DXA |
| Before a new question | 160–240 DXA |
| After a section divider | 120 DXA |
| Callout box padding | Built into the helper |
| Table cell margins | top: 80, bottom: 80, left: 120, right: 120 |
| Big display cell margins | top: 240, bottom: 240, left: 100, right: 100 |

---

## 13. Building Different Resource Types

All resource types use the same `build.js`. Only `resource.config.json` and `content/` differ.

### A. Single Worksheet
- Config: `"landscape": false`
- Content: `01-worksheet.js` — theory + questions in one file

### B. Unit Guide / Curriculum Map
- Config: `"landscape": true`
- Content: `01-cover.js`, `10-unit-guide.js` — landscape table (Week | Topic | Content | Activities | Resources | Assessment | Inclusion). Use `cellPr()` for multi-paragraph cells, `contentCell()` pattern for rich cells.

### C. Multi-Week Booklet
- Config: `"landscape": false`
- Content: `01-cover.js`, `02-contents.js`, `03-howto.js`, `10-lesson1.js`…`90-reference.js`
- Each lesson uses the Section 8 pedagogical sequence (objectives → theory → worked examples → MC → short answer → extended response → practical).

**With paired teacher edition:** Build twice with separate configs.
- Student config: `"outputFile": ".../Student.docx"`, `"header": "..."`
- Teacher config: `"outputFile": ".../Teacher.docx"`, `"header": "...Teacher Edition"`
- Teacher content uses answer boxes (green), teaching notes (amber), marking criteria.

### D. Assessment / Exam
- Config: `"landscape": false`
- Content: `01-cover-sheet.js`, `10-section-a.js`, `20-section-b.js`
- For a marking key: update `outputFile` and rebuild with answer-filled cells.

### E. Lab / Practical Manual
- Config: `"landscape": false`
- Content: `01-cover.js`, `10-lab1-procedure.js`, `11-lab1-report.js`, `20-lab2-procedure.js`, etc.
- Each lab: one procedure module + one report module (empty tables + drawing spaces).

### F. Revision / Study Guide
- Config: `"landscape": false`
- Content: `01-cover.js`, `10-topic1.js`, `20-topic2.js`, `90-formula-sheet.js`
- Uses `bdCell`/`bdCellRich` for key facts. No questions — dense theory with callout boxes.

### Content Planning Grid (for multi-section resources)

| Section | Theory Focus | Worked Examples | Questions |
|---|---|---|---|
| 1 | Core concept introduction | 2 examples | MC warm-ups + 1 short answer |
| 2 | Deeper mechanism | 2 examples | MC + 2 short answer |
| 3 | Application/calculation | 3 examples (incl. 1 "Now You Try") | Scaffolded calculation + short answer |
| 4 | Synthesis/connection | 2 examples | Extended response + practical-on-paper |

### Run Command

```powershell
node build.js
```

Output: `./output/ResourceName.docx`

---

## 14. Quick-Reference Cheat Sheet

### C (Common) Cheat Sheet

```js
// Page
C.pageBreak()

// Headings
C.h1("text")
C.h2("N.N   text")
C.h3("text")
C.h4("text")

// Body
C.p("text")
C.p("text", { spacing: { after: 200 }, italic: true })
C.bullet("text")
C.bulletRich([new TextRun({ text: "bold", bold: true }), new TextRun(" normal")])

// Structure
C.lessonBanner(num, "title", "subtitle")
C.sectionTag("title")
C.sectionTag("title", C.COLOURS.greenLine)

// Boxes
C.calloutBox("TITLE", [C.p("body"), C.bullet("item")], C.COLOURS.warning)
C.workedExample("Title", [C.p("step 1..."), ...])
C.hintBox("hint text")

// Scaffolding
C.sentenceStarter("The thing is __________________ because...")
C.scaffoldStep(1, "Prompt?", "Optional hint")
C.linedAnswerSpace(3)
C.drawingSpace(3.5, "Label:")

// Questions
C.mcQuestion(n, "stem?", ["A", "B", "C", "D"], "mc-ref")

// Config
C.COLOURS.primary
C.COLOURS.accent
C.COLOURS.warning
C.COLOURS.greenLine
C.docStyles
C.numberingConfig
C.a4PageProps
C.a4LandscapeProps
C.studentHeader("text")
C.studentFooter()
C.teacherHeader("text")   // for teacher editions
C.teacherFooter()

// Teacher Edition Helpers (defined locally in teacher build script)
answerBox([...])          // green left-border box with "✓ ANSWER"
teachingNote([...])       // amber left-border box with "⚠ TEACHING NOTE"
qRef("Q1: ...")           // italic grey question reference
aPara("text")             // green-tinted answer paragraph
aBullet("text")           // green-tinted answer bullet

// Booklet Pedagogical Sequence (per lesson)
//  1. Lesson Banner      C.lessonBanner(N, title, subtitle)
//  2. Objectives         C.calloutBox("LEARNING OBJECTIVES", [...])
//  3. Theory             C.h2() + C.h3() + C.p() + tables
//  4. Worked Examples    C.workedExample() × 2-3 (incl. 1 "Now You Try")
//  5. MC Questions       Q1 easy+hint, Q2-6 ramping (C.mcQuestion)
//  6. Short Answer       sentence starters, fill-in tables, scaffolded steps
//  7. Extended Response  planning steps → starters → lined spaces
//  8. Practical on Paper  spot-the-break or sketch-and-label
```

### H (Local Helpers) Cheat Sheet

```js
// Utility (rarely used directly in lessons)
borderAll("color", size)

// Table cells
cellH("Header Text", width)           // Header cell
cellP("Plain text", width)            // Data cell
cellPr([para1, para2], width)         // Rich paragraph cell
cellE(width)                          // Empty fill-in (3 lines)
cellE(width, 5)                       // Empty fill-in (5 lines)
cellHint("hint text", width)          // Hint cell
cellWE("text", width)                 // Worked example cell
cellWELabel("LABEL", "text", width)   // Labelled WE cell
bdCell("Header", "Body", "fillHex", width)       // Big display cell
bdCellRich("Header", [paras], "fillHex", width)  // Rich big display

// Hidden answers (always spread)
...hiddenAnswer([
  ["(a)", "answer text"],
  ["(b)", "answer text"],
])
```

### Table Construction Quick Pattern

```js
new Table({
  width: { size: 9360, type: WidthType.DXA },      // use 14570 for landscape
  columnWidths: [w1, w2, w3, w4],                   // must sum to table width
  rows: [
    new TableRow({ tableHeader: true, children: [
      cellH("H1", w1), cellH("H2", w2), ...
    ]}),
    new TableRow({ children: [
      cellP("data", w1), cellPr([richPara1, richPara2], w2), cellE(w3), ...
    ]}),
  ]
})
```

### TextRun Formatting Options

```js
new TextRun({
  text: "content",
  bold: true,
  italics: true,
  color: "808080",       // hex, no #
  size: 22,              // half-points
  font: "Consolas",      // for diagrams/code
})
```

---

## Appendix: `common.js` Exports

`common.js` exports the following API surface:

```
COLOURS          { primary, accent, warning, greenLine }
docStyles        docx styles definition
numberingConfig  docx numbering config
a4PageProps      { pageSize, margins } (portrait A4)
a4LandscapeProps { pageSize, margins } (landscape A4)

studentHeader(text)    → header object (student-themed)
studentFooter()        → footer object with page numbers
teacherHeader(text)    → header object (teacher-themed, for answer booklets)
teacherFooter()        → footer object (same as studentFooter typically)

pageBreak()            → PageBreak element

h1(text)               → Paragraph
h2(text)               → Paragraph
h3(text)               → Paragraph
h4(text)               → Paragraph

p(text, opts?)         → Paragraph
bullet(text)           → Paragraph
bulletRich(textRuns[]) → Paragraph

lessonBanner(num, title, subtitle)  → [Paragraph, ...]
sectionTag(title, colour?)          → Paragraph
calloutBox(title, children[], colour?) → [Paragraph, ...]
workedExample(title, children[])    → [Paragraph, ...]
hintBox(text)                       → Paragraph
sentenceStarter(text)               → Paragraph
scaffoldStep(n, prompt, hint?)      → Paragraph
linedAnswerSpace(count)             → Paragraph[]
drawingSpace(heightInches, label?)  → [Paragraph, ...]
mcQuestion(n, stem, options[], ref) → [Paragraph, ...]
```

---

> **End of Reference.** Use this document as the single source of truth for building any `.docx` teaching resource using this methodology.
