# 📊 Programmatic PPTX Teaching Resource Builder — Reference Guide

> **Parallel pipeline to the DOCX builder — same architecture, slide-based output.**
> Uses [`pptxgenjs`](https://www.npmjs.com/package/pptxgenjs) to generate `.pptx` files.

---

## ⚡ Quick Start (for AI Agents)

1. **Read `AGENTS.md` first** — the interview determines whether the user wants DOCX or PPTX.
2. **Update `resource.config.json`** — set `"type": "pptx"` plus `title`, `creator`, `outputFile`, `contentDir`.
3. **Create content modules** in `content/` as `.js` files with numeric prefixes.
4. **Do NOT edit `build-pptx.js` or `common-pptx.js`** — they are stable infrastructure.
5. **Run** `node build-pptx.js` to generate the `.pptx`.

Every content module exports `function(C, H) → array` of slide definitions. Use `C.*` for all slide types. Use `H.*` for table cell styling.

### 🚨 CRITICAL: Spread array-returning helpers

Some `C.*` helpers return arrays of slide definitions, not single objects. You MUST spread them with `...` when pushing into your slides array, or the PPTX will silently corrupt.

| Helper | Usage |
|---|---|
| `C.e5LessonPlan(skillLabel, plan)` | `slides.push(...C.e5LessonPlan(...))` |

> **Rule of thumb:** If a helper builds multiple slides (like `e5LessonPlan` which creates 6), it returns an array. Spread it.

### 🧠 80/20 Cheat Card — covers 90% of slide needs

```js
module.exports = function myDeck(C, H) {
  return [
    C.titleSlide("Presentation Title", "Subtitle", "Author"),
    C.objectivesSlide("Learning Objectives", ["Obj 1", "Obj 2", "Obj 3"]),
    C.contentSlide("Topic Heading", ["Bullet 1", "Bullet 2", "Bullet 3"], { hint: "Optional hint", notes: "Teacher notes" }),
    C.twoColumnSlide("Comparison", ["Left 1", "Left 2"], ["Right 1", "Right 2"]),
    C.imageSlide("Diagram", "images/diagram.png", "Figure 1: Caption"),
    C.workedExampleSlide("Worked Example", ["Step 1: ...", "Step 2: ..."], { question: "Question text" }),
    C.nowYouTrySlide("Now You Try", "Question?", ["Answer 1", "Answer 2"]),
    C.mcQuestionSlide(1, "MC stem?", ["A", "B", "C", "D"], "Hint?", "Correct answer"),
    C.checklistSlide("Success Criteria", ["Item 1", "Item 2"]),
    C.bigIdeaSlide("Key takeaway", "— Subtitle"),
    C.summarySlide("What We've Learned", ["Takeaway 1", "Takeaway 2"]),
    // For E5 lessons:
    ...C.e5LessonPlan("Skill Label", { intention: "...", successMeasures: {...}, engage: {...}, explore: {...}, explain: {...}, elaborate: {...}, evaluate: {...} }),
  ];
};
```

---

## 1. Architecture

```
build-pptx.js
  │
  ├─ require('pptxgenjs')        → PptxGenJS
  ├─ require('./common-pptx.js') → C (colours, slide helpers, layout)
  │
  ├─ Defines local helpers → H (cellH, cellP, cellWE, cellHint, cellE, formatRow)
  │
  ├─ require('./content/file.js')(C, H)  → array of slide definition objects
  │
  ├─ Renders each slide definition as a pptxgenjs slide
  │
  └─ pptx.writeFile() → .pptx output
```

### Key difference from DOCX pipeline

| Concept | DOCX | PPTX |
|---|---|---|
| Output unit | Flowing paragraphs/pages | Fixed-canvas slides |
| Content module returns | Array of docx elements | Array of slide definition objects |
| Page breaks | `C.pageBreak()` | Each slide definition = 1 slide |
| Tables | Raw `Table` objects | `C.tableSlide(headers, rows)` |
| Images | `ImageRun` in Paragraphs | `C.imageSlide(title, path, caption)` |
| Teacher edition | Separate DOCX build with answer boxes | Speaker notes contain answers |
| Width unit | DXA (twentieths of a point) | Inches |
| Slide size | A4 portrait/landscape | Standard 4:3 or Widescreen 16:9 |

---

## 2. C — Common PPTX Module (`common-pptx.js`)

### 2.1 Constants

| Export | Type | Description |
|---|---|---|
| `C.COLOURS` | `object` | Extended palette — `{ primary, accent, warning, greenLine, greyText, darkGrey, greenWE, greenBg, white, black }` plus Claude-rich colours: `{ navy, navyLight, cyan, cyanLight, amber, amberLight, green, greenBg2, red, redLight, muted, paleBg, rule }` plus E5 phase colours: `{ e5Engage, e5EngageBg, e5Explore, e5ExploreBg, e5Explain, e5ExplainBg, e5Elaborate, e5ElaborateBg, e5Evaluate, e5EvaluateBg }` |
| `C.SLIDE` | `object` | `{ widescreen: {w, h}, standard: {w, h} }` — dimensions in inches |
| `C.FONT` | `object` | `{ body: "Calibri", heading: "Calibri", mono: "Consolas" }` |
| `C.CHROME` | `object` | Slide chrome config: `{ cornerMark, lessonChip, footer }` — see Section 2.8 |

### 2.2 Slide Definition Helpers

Every function returns a **slide definition object** — a plain `{}` that `build-pptx.js` renders.

```js
C.titleSlide(title, subtitle, author?)          // → title slide (full-bleed primary colour)
C.sectionDivider(sectionName, subtitle?)         // → divider slide (full-bleed primary)
C.objectivesSlide(lessonTitle, objectives[])     // → learning objectives slide
C.contentSlide(title, bullets[], opts?)          // → heading + bullet points
C.twoColumnSlide(title, leftItems[], rightItems[], opts?)  // → split layout
C.tableSlide(title, headers[], rows[][], colWidths[]?, opts?)  // → heading + table
C.imageSlide(title, imagePath, caption?, opts?)  // → heading + image + caption
C.videoSlide(title, videoSource, caption?, opts?) // → heading + embedded playable video (YouTube or local MP4)
C.workedExampleSlide(title, steps[], opts?)      // → green-themed worked example
C.nowYouTrySlide(title, question, answerParts[]) // → green "try it" with answers in notes
C.mcQuestionSlide(n, stem, options[], hint?, answer?)  // → MC question
C.shortAnswerSlide(title, question, sentenceStarter?, numLines?)  // → short answer
C.extendedResponseSlide(title, question, planningSteps[], sentenceStarters[])  // → extended response
C.fillTableSlide(title, headers[], rows[][], hint?)  // → fill-in table
C.calloutSlide(title, bullets[], calloutType?)  // → coloured callout box
C.checklistSlide(title, items[])                // → checklist with ☐ markers
C.comparisonSlide(title, leftHeader, leftBullets, rightHeader, rightBullets)  // → side-by-side
C.bigIdeaSlide(idea, subtitle?)                 // → one big concept, full-bleed primary
C.diagramSlide(title, asciiLines[], caption?)   // → monospaced ASCII diagram
C.summarySlide(title, bullets[])                // → end-of-lesson summary (full-bleed)
C.customSlide(renderFn)                         // → advanced: raw pptxgenjs slide
```

### 2.3 Slide Definition Options (`opts`)

| Option | Type | Used By | Description |
|---|---|---|---|
| `notes` | `string` | All | Speaker notes text |
| `hint` | `string` | `contentSlide` | Italic grey hint below title |
| `question` | `string` | `workedExampleSlide` | Question text above steps |
| `size` | `{x, y, w, h}` | `imageSlide` | Image position/size override |

### 2.4 Callout Types

| `calloutType` | Colour Scheme | Use Case |
|---|---|---|
| `"info"` (default) | Blue bg, primary border | General information, key concepts |
| `"warning"` | Amber bg, warning border | Safety warnings, critical rules |
| `"success"` | Green bg, green border | Checklists, success criteria |
| `"key"` | Purple bg, purple border | Must-remember facts |

### 2.5 Rich Text & Notes Helpers

```js
C.richRun(text, { bold, italic, color, fontSize, font })  // → rich text run object
C.richBullet(runs)               // → rich bullet (string or runs[])
C.teacherNotes(text)             // → "📝 TEACHER NOTES:\n" + text
C.answerNotes(answers[])         // → "✓ ANSWERS:\n  1. ...\n  2. ..."
C.resolveImage(imagePath)        // → absolute path if image exists, null otherwise
```

### 2.6 Image Path Resolution

`C.resolveImage(path)` checks:
1. Path relative to project root
2. Path relative to `content/images/`

Returns the absolute path or `null` (with a console warning).

### 2.7 Video / YouTube Helpers

```js
C.videoSlide(title, videoSource, caption?, opts?)
C.downloadYouTube(url, outputDir?, opts?)
```

**`C.videoSlide(title, videoSource, caption?, opts?)`**  
Creates a slide with an embedded, playable video. Supports:
- **YouTube URLs** — automatically downloads the video via `yt-dlp` on first build (cached in `content/videos/` for reuse)
- **Local MP4 files** — pass an absolute or relative path to an MP4 file

| Option | Type | Default | Description |
|---|---|---|---|
| `notes` | `string` | `""` | Speaker notes text |
| `autoPlay` | `boolean` | `false` | Auto-play video when slide appears |
| `maxHeight` | `number` | `720` | Max video height in pixels (for YouTube download quality) |
| `timeout` | `number` | `300000` | Download timeout in ms (5 minutes) |

**`C.downloadYouTube(url, outputDir?, opts?)`**  
Downloads a YouTube video as MP4 and returns the local file path (or null). Cached — reuses existing downloads. Requires `yt-dlp` to be installed (see below).

**Prerequisites for YouTube embedding:**

The pipeline requires [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) — an open-source YouTube downloader. Install it one of these ways:

```powershell
# Option 1: pip (Python)
pip install yt-dlp

# Option 2: Standalone binary (Windows)
winget install yt-dlp.yt-dlp

# Option 3: Place yt-dlp.exe in the project's tools/ folder
```

The builder checks three locations for yt-dlp: system PATH → `tools/yt-dlp.exe` → `python -m yt_dlp`. If not found, the slide shows a placeholder with the YouTube URL.

**Example usage in a content module:**

```js
// YouTube URL — downloaded and cached automatically
C.videoSlide("🎬 How Dichotomous Keys Work",
  "https://www.youtube.com/watch?v=i9KD7HwgtkI",
  "Video: Amoeba Sisters (6 min)",
  { notes: C.teacherNotes("Pause at 2:30 for discussion.") }
)

// Local MP4 file
C.videoSlide("Lab Demonstration",
  "./content/videos/lab-setup.mp4",
  "Demo: Setting up the circuit"
)
```

---

### 2.8 Chrome Configuration (`C.CHROME`)

Slides can carry optional "chrome" — corner marks, lesson chips, and footers — for visual consistency across a deck.

```js
C.CHROME = {
  cornerMark: { color: "0891B2", size: 0.15, x: 0.3, y: 0.15 },  // top-left cyan corner mark
  lessonChip: { color: "2B579A", textColor: "FFFFFF", fontSize: 10 },  // lesson number chip
  footer:     { color: "64748B", fontSize: 9 },  // bottom-centre footer text
};
```

Set `def.chrome` on any slide definition to activate chrome rendering:

```js
const slide = C.contentSlide("Title", ["bullet"]);
slide.chrome = { cornerMark: true, lessonChip: "L4", footer: "Unit 1 · Electronics" };
```

### 2.9 Charts, Shapes & Audio Slides

Native pptxgenjs chart, shape, and audio embedding — for data visualisation, annotated diagrams, and narrated slides.

```js
// Chart slide — bar, line, pie, scatter charts via pptxgenjs
C.chartSlide("Test Scores", "bar", [
  { name: "Topic 1", labels: ["Q1","Q2","Q3"], values: [8,12,10] },
  { name: "Topic 2", labels: ["Q1","Q2","Q3"], values: [6,9,14] },
], { showLegend: true, catAxisLabel: "Question", valAxisLabel: "Score", notes: "..." })

// Shape slide — freeform shapes with pptxgenjs
C.shapeSlide("Annotated Diagram", [
  { name: "rect", options: { x: 2, y: 2, w: 4, h: 3, fill: { color: "E8F0FE" } } },
  { name: "ellipse", options: { x: 1, y: 1, w: 2, h: 2, fill: { color: "FFE0E0" } } },
], { notes: "Key shapes labelled" })

// Audio slide — embedded audio with optional cover image
C.audioSlide("Narrated Instructions", "./content/audio/instructions.mp3",
  { cover: "./content/images/audio-icon.png", position: { x: 2, y: 3, w: 6, h: 1.5 } })
```

### 2.10 Hyperlinks, Masters, Backgrounds & Sections

```js
// Hyperlink — create clickable links for use in slide text
C.hyperlink("https://phet.colorado.edu", { tooltip: "Open simulation", isSlideLink: false })
C.hyperlink("slide-5", { tooltip: "Jump to summary", isSlideLink: true })

// Slide Master — define a custom master slide with background and objects
C.slideMaster({
  title: "Custom Master",
  background: { color: "F4F7FB" },
  objects: [{ type: "rect", options: { x: 0, y: 0, w: "100%", h: 0.5, fill: { color: "2B579A" } } }],
  slideNumber: C.slideNumberConfig({ x: "95%", y: "95%", color: "808080", fontSize: 10 }),
})

// Background — define a slide background (colour, gradient, or image)
C.background({ color: "2B579A" })                     // solid colour
C.background({ path: "./images/texture.png" })          // image fill
C.background({ data: "image/png;base64,..." })          // base64 data URI
C.background({ color: "2B579A", transparency: 50 })    // 50% transparent

// Section — group slides into named sections (visible in PowerPoint's slide sorter)
C.section("Topic 1: Motion")

// Slide Number Config — control appearance of auto-generated slide numbers
C.slideNumberConfig({ x: "50%", y: "95%", color: "808080", fontSize: 10 })

// Line Properties — reusable line/arrow styling for shapes and connectors
C.lineProps({ color: "2B579A", width: 2, dashType: "solid", beginArrowType: null, endArrowType: "arrow" })
```

---

## 3. H — Local Helpers (defined in `build-pptx.js`)

Table cell factories that return pptxgenjs-compatible cell objects `{ text, options }`:

```js
H.cellH(text)      // Header cell — primary fill, white bold text
H.cellP(text)      // Plain cell — white fill, black text
H.cellWE(text)     // Worked example cell — green tint
H.cellHint(text)   // Hint cell — italic grey
H.cellE()          // Empty cell — grey underscores
H.formatRow(cells) // Normalize a row array for pptxgenjs tables
```

---

## 4. Content Module Template

```js
// Section N — Title
module.exports = function sectionN(C, H) {
  return [

    // ===== TITLE SLIDE =====
    C.titleSlide("Presentation Title", "Subtitle", "Author Name"),

    // ===== SECTION DIVIDER =====
    C.sectionDivider("SECTION 1", "Topic description"),

    // ===== LEARNING OBJECTIVES =====
    C.objectivesSlide("Lesson Title", [
      "Objective 1",
      "Objective 2",
      "Objective 3",
    ]),

    // ===== CONTENT SLIDES =====
    C.contentSlide("Heading", [
      "Bullet point 1",
      "Bullet point 2",
      "Bullet point 3",
    ], { hint: "Optional hint text below the heading" }),

    // ===== TWO-COLUMN SLIDE =====
    C.twoColumnSlide("Comparison Title",
      ["Left point 1", "Left point 2"],
      ["Right point 1", "Right point 2"]
    ),

    // ===== COMPARISON SLIDE =====
    C.comparisonSlide("Side-by-Side",
      "LEFT HEADER", ["Left bullet 1", "Left bullet 2"],
      "RIGHT HEADER", ["Right bullet 1", "Right bullet 2"]
    ),

    // ===== CALLOUT SLIDE =====
    C.calloutSlide("CRITICAL RULE", [
      "Important point 1",
      "Important point 2",
    ], "warning"),

    // ===== TABLE SLIDE =====
    C.tableSlide("Reference Table",
      ["Column 1", "Column 2", "Column 3"],
      [
        ["Data", "Data", "Data"],
        ["Data", "Data", "Data"],
      ]
    ),

    // ===== IMAGE SLIDE =====
    C.imageSlide("Diagram Title", "content/images/diagram.png", "Figure 1: Caption text"),

    // ===== WORKED EXAMPLE =====
    C.workedExampleSlide("Example Title", [
      "Step 1: Do this first",
      "Step 2: Then this",
      "Step 3: Finally this",
    ], { question: "Question text appears above the steps" }),

    // ===== NOW YOU TRY =====
    C.nowYouTrySlide("Try It Yourself",
      "Question: Solve this similar problem.",
      ["Answer part 1", "Answer part 2"]  // hidden in speaker notes
    ),

    // ===== MULTIPLE CHOICE =====
    C.mcQuestionSlide(1, "What is the unit of current?",
      ["Volt (V)", "Ampere (A)", "Ohm (Ω)", "Watt (W)"],
      "Hint: it starts with A", "Ampere (A)"
    ),

    // ===== SHORT ANSWER =====
    C.shortAnswerSlide("Short Answer",
      "Define voltage in your own words.",
      "Voltage is the electrical __________________ that...",
      3  // number of blank lines
    ),

    // ===== EXTENDED RESPONSE =====
    C.extendedResponseSlide("Extended Response",
      "Explain why a complete circuit is necessary...",
      ["Step 1: Identify the key concept", "Step 2: Provide evidence"],
      ["The circuit requires...", "Without a complete path..."]
    ),

    // ===== FILL-IN TABLE =====
    C.fillTableSlide("Complete the Table",
      ["Quantity", "Unit", "Symbol"],
      [
        ["Voltage", "________________", "V"],
        ["________________", "Ampere", "A"],
      ],
      "Hint: Look at the reference table on the previous slide."
    ),

    // ===== CHECKLIST =====
    C.checklistSlide("What You Need", [
      "Understand the three requirements for a circuit",
      "Memorise the units: Volt, Ampere, Ohm",
      "Practice identifying complete vs incomplete circuits",
    ]),

    // ===== BIG IDEA =====
    C.bigIdeaSlide("Current flows ONLY in a complete loop.", "— The First Law of Circuits"),

    // ===== DIAGRAM (ASCII) =====
    C.diagramSlide("Circuit Diagram", [
      "┌───────[BATTERY 3V]───────┐",
      "│                          │",
      "├────[SWITCH]───[LED]──────┤",
      "└──────────────────────────┘",
    ], "Figure 1: A complete circuit"),

    // ===== SUMMARY =====
    C.summarySlide("What We've Learned", [
      "Key takeaway 1",
      "Key takeaway 2",
      "Key takeaway 3",
    ]),

    // ===== CUSTOM (advanced) =====
    C.customSlide((slide, H) => {
      // Direct pptxgenjs API access for advanced layouts
      slide.addText("Custom content", { x: 1, y: 1, w: 8, h: 1, fontSize: 24 });
    }),

  ];
};
```

---

## 5. Slide Layout Conventions

### 5.1 Default Layout

Most slides use this pattern:
- **Title bar**: 0.5" from left, 0.3" from top, 90% width, 0.7" height
- **Decorative line**: 0.04" high primary-colour rectangle below title
- **Content area**: starts at y=1.2–1.3, 86% width, centred
- **Font sizes**: Title 28pt, body 18pt, hints 12pt

### 5.2 Full-Bleed Slides

Title slides, section dividers, big ideas, and summaries use full-bleed primary colour backgrounds with white text:
- Background: `C.COLOURS.primary`
- Title: 36–44pt white bold
- Subtitle: 18–24pt light blue (`B0C4DE`)

### 5.3 Worked Example / Now You Try Slides

Green-themed:
- Header bar: `C.COLOURS.greenWE` background, white text
- "📘 WORKED EXAMPLE:" or "✏️ NOW YOU TRY:" prefix
- Answers on "Now You Try" go into **speaker notes** (teacher-only)

### 5.4 Table Slides

Tables use pptxgenjs's native `addTable()`:
- Header row: primary fill, white bold text (`H.cellH`)
- Data rows: white fill (`H.cellP`), or green tint for worked examples (`H.cellWE`)
- Grey underline (`________`) for blank cells (`H.cellE`)

---

## 6. Speaker Notes as Teacher Edition

The PPTX pipeline uses **speaker notes** for all teacher-only content:
- MC answers → `slide.addNotes("✓ Answer: B")`
- Now You Try answers → `slide.addNotes("👇 ANSWERS...")`
- Teaching guidance → `C.teacherNotes("Pacing: 10 min...")`

This means a single `.pptx` file serves as both the student-facing deck AND the teacher edition — the teacher sees answers in Presenter View.

---

## 7. Building Different Resource Types

| Resource Type | Typical Slides | Content Module Pattern |
|---|---|---|
| **Lesson deck** (30–45 min) | 8–15 slides | Title → Objectives → Theory (3–5) → Worked Example → Now You Try → MC (2–3) → Summary |
| **Short presentation** (15 min) | 5–8 slides | Title → Content (3–5) → Summary |
| **Revision deck** | 15–30 slides | Title → Topic dividers → Content per topic → Big ideas → Summary |
| **Assessment walkthrough** | 10–20 slides | Title → Section dividers → MC slides → Short answer slides → Summary |
| **Lab/practical intro** | 5–10 slides | Title → Objectives → Safety callout → Procedure steps → Checklist |

---

## 8. Configuration

`resource.config.json` fields for PPTX:

```json
{
  "type": "pptx",
  "title": "Presentation Title",
  "creator": "Author Name",
  "outputFile": "./output/presentation.pptx",
  "contentDir": "./content/my-pptx-deck",
  "landscape": false
}
```

- `type`: `"pptx"` (informational — the build script is chosen by the user, not the config)
- `landscape`: `false` → standard 4:3 (10×7.5"); `true` → widescreen 16:9 (13.33×7.5")
- `header`, `footer`: not used by PPTX pipeline (slides don't have running headers)

### Run Command

```powershell
node build-pptx.js
```

Or via npm script:
```powershell
npm run build:pptx
```

---

## 9. Quick-Reference Cheat Sheet

```js
// Constants
C.COLOURS.primary      // "2B579A"
C.COLOURS.warning       // "E8A838"
C.COLOURS.greenLine     // "5A9E5A"
C.COLOURS.greyText      // "808080"
C.SLIDE.widescreen      // { w: 13.33, h: 7.5 }
C.SLIDE.standard        // { w: 10, h: 7.5 }

// Slide types (all return slide definition objects)
C.titleSlide(title, subtitle, author?)
C.sectionDivider(name, subtitle?)
C.objectivesSlide(title, bullets[])
C.contentSlide(title, bullets[], { hint?, notes? })
C.twoColumnSlide(title, left[], right[], { notes? })
C.tableSlide(title, headers[], rows[][], colWidths[]?, { notes? })
C.imageSlide(title, path, caption?, { size?, notes? })
C.workedExampleSlide(title, steps[], { question?, notes? })
C.nowYouTrySlide(title, question, answers[])
C.mcQuestionSlide(n, stem, options[], hint?, answer?)
C.shortAnswerSlide(title, question, starter?, numLines?)
C.extendedResponseSlide(title, question, planningSteps[], sentenceStarters[])
C.fillTableSlide(title, headers[], rows[][], hint?)
C.calloutSlide(title, bullets[], calloutType?)
C.checklistSlide(title, items[])
C.comparisonSlide(title, leftH, leftB[], rightH, rightB[])
C.bigIdeaSlide(idea, subtitle?)
C.diagramSlide(title, asciiLines[], caption?)
C.summarySlide(title, bullets[])
C.customSlide((slide, H) => { ... })

// E5 Instructional Model helpers
C.E5_THEME                // customizable theme object
C.e5LearningIntentionSlide(skillLabel, intention, measures)
C.e5EngageSlide(skillLabel, heading, bodyText, imagePath?, smText, { notes? })
C.e5ExploreSlide(skillLabel, heading, prompts[], imagePath?, smText, { notes?, mindMap? })
C.e5ExplainSlide(skillLabel, heading, contentBlocks[], calloutText?, smText, { notes?, imagePath? })
C.e5ElaborateSlide(skillLabel, heading, instruction, activityItems[], smText, { notes? })
C.e5EvaluateSlide(skillLabel, heading, assessmentLink, smText, { notes?, rubricItems[] })
C.e5ContinuationSlide(skillLabel, phaseName, smText, title, bullets?, opts?)  // extra slides within same phase
C.e5LessonPlan(skillLabel, plan)   // convenience: bundles all phases

// Table cell helpers (H)
H.cellH(text)     // header cell
H.cellP(text)     // plain cell
H.cellWE(text)    // worked example cell
H.cellHint(text)  // hint cell
H.cellE()         // empty cell
H.formatRow(cells)  // normalize row array

// Rich text & utilities
C.richRun(text, { bold?, italic?, color?, fontSize?, font? })
C.richBullet(runs)
C.teacherNotes(text)
C.answerNotes(answers[])
C.resolveImage(path)

// Video / YouTube helpers
C.videoSlide(title, videoSource, caption?, { notes?, autoPlay?, maxHeight? })
C.downloadYouTube(url, outputDir?, { maxHeight?, timeout? })

// Charts, Shapes & Audio
C.chartSlide(title, chartType, data[], { showLegend?, showTitle?, catAxisLabel?, valAxisLabel?, notes? })
C.shapeSlide(title, shapes[], { notes? })
C.audioSlide(title, audioPath, { cover?, notes?, position? })

// Hyperlinks, Masters & Layout
C.hyperlink(url, { tooltip?, isSlideLink? })
C.slideMaster({ title?, objects[], background?, slideNumber? })
C.background({ color?, path?, data?, transparency? })
C.section("Section Name")
C.slideNumberConfig({ x?, y?, color?, fontSize? })
C.lineProps({ color?, width?, dashType?, beginArrowType?, endArrowType? })

// Icon system & chrome
C.initIcons()                  // async — pre-renders icon set
C.icon("check"|"bulb"|"search"|"target"|"arrow"|...)  // get pre-rendered icon data URI
C.softShadow(color?, blur?, offset?, opacity?)  // card shadow preset
C.CHROME                       // chrome configuration: { cornerMark, lessonChip, footer }

// Rich layout helpers (Claude-inspired)
C.lessonTitleSlide(lessonNum, title, hook, hookSubtitle?, { notes?, timing?, accentColor? })
C.roadmapSlide(eyebrow, title, cards[], { notes?, takeaway? })
C.numberedIntentsSlide(title, intents[], { notes?, timing? })
C.comparisonColumnsSlide(title, left, right, { notes?, bottomRule? })
C.mcqCardSlide(n, stem, options[], { notes?, eyebrow? })
C.processStepsSlide(title, steps[], { notes?, layout?, subtitle? })
C.stepStripSlide(eyebrow, title, steps[], { notes?, calloutBox? })
C.taskCardsSlide(eyebrow, title, tasks[], { notes?, bottomChecklist? })
C.keyIdeaSlide(eyebrow, title, definition, left, right, { notes?, bottomTakeaway? })
C.wrapUpSlide(eyebrow, title, takeaways[], nextTitle, nextText, { notes? })
C.e5ContinuationSlide(skillLabel, phaseName, smText, title, bullets?, opts?)  // multi-slide phases
C.successCriteriaPanel(title, items[], { intro? })  // render fragment
C.calloutStrip(text, type?)     // render fragment
```

> **📊 For graphs and diagrams:** Use `tools/render_graph.py` to generate publication-quality images from JSON specs. See Section 11 and `DOCX_BUILDER_REFERENCE.md` Section 15 for the full spec API.

---

## 10. E5 Instructional Model

The E5 model structures each lesson into 5 distinct phases. The PPTX pipeline provides colour-coded phase divider slides + content helpers for each phase.

### 10.1 E5 Colour Palette

| Phase | Colour Hex | Variable | Background Hex | Icon |
|---|---|---|---|---|
| Engage | `E86A17` | `C.COLOURS.e5Engage` | `FFF0E5` | 💡 |
| Explore | `008080` | `C.COLOURS.e5Explore` | `E0F0F0` | 🔍 |
| Explain | `2B579A` | `C.COLOURS.e5Explain` | `E8F0FE` | 📖 |
| Elaborate | `7B2D8E` | `C.COLOURS.e5Elaborate` | `F3E5F5` | 🔗 |
| Evaluate | `C00000` | `C.COLOURS.e5Evaluate` | `FFEBEE` | ✅ |

### 10.2 E5 Theme (customizable)

All E5 slides share a theme object — override `C.E5_THEME` before building to change colours, positions, and fonts:

```js
C.E5_THEME = {
  slideH: 7.5,
  phaseButton:   { fill: "C00000", textColor: "FFFFFF", fontFace: "Calibri", fontSize: 13, italic: true, x: "78%", y: 0.25, w: 1.9, h: 0.45 },
  smBar:         { fill: "A8D08D", textColor: "000000", fontFace: "Calibri", fontSize: 13, height: 0.55 },
  skillLabel:    { color: "333333", fontFace: "Calibri", fontSize: 11, x: 0.5, y: 0.15, w: "72%", h: 0.5 },
  heading:       { color: "000000", fontFace: "Calibri", fontSize: 26, bold: true, x: 0.5, y: 0.75, w: "72%", h: 0.7 },
  body:          { color: "333333", fontFace: "Calibri", fontSize: 15 },
  leftCol:       { x: 0.5, w: "52%" },
  rightCol:      { x: "56%", w: "40%" },
  callout:       { fill: "E2F0D9", borderColor: "A8D08D", textColor: "333333", fontFace: "Calibri", fontSize: 14 },
  liPanel:       { leftBg: "FFFFFF", rightBg: "E2F0D9", headingFontSize: 32 },
};
```

### 10.3 E5 Slide Helpers

Every E5 slide has **consistent chrome**: skill label (top-left), red phase button (top-right), green SM bar (bottom).

```js
// Learning Intention — two-panel framing slide (left: objective, right: success measures)
C.e5LearningIntentionSlide(skillLabel, intention, {
  skill: ["I can...", "I can..."],
  knowledge: "I understand...",
  attitude: "I will..."
})

// Engage — "Why are we learning this?" relevance hook with optional image
C.e5EngageSlide(skillLabel, heading, bodyText, imagePath?, smText, { notes? })

// Explore — probing questions with optional image or mind-map graphic
C.e5ExploreSlide(skillLabel, heading, prompts[], imagePath?, smText, { notes?, mindMap? })

// Explain — explicit teaching with definition/paragraph/bullet content blocks + optional callout
C.e5ExplainSlide(skillLabel, heading, contentBlocks[], calloutText?, smText, { notes?, imagePath? })
// contentBlock: { type: "definition"|"paragraph"|"bullet", text?, term? }

// Elaborate — application activity with instruction + activity table
C.e5ElaborateSlide(skillLabel, heading, instruction, activityItems[], smText, { notes? })
// activityItem: { name, description?, link? }

// Evaluate — exit ticket / self-assessment with optional rubric
C.e5EvaluateSlide(skillLabel, heading, assessmentLink, smText, { notes?, rubricItems[] })
```

**`C.e5ContinuationSlide(skillLabel, phaseName, smText, title, bullets?, opts?)`**

Creates an additional slide within a phase that carries the same E5 chrome (skill label, phase button, SM bar). Use for multi-slide phases — e.g., a second Engage slide or a second Explain slide.

| Option | Type | Default | Description |
|---|---|---|---|
| `notes` | `string` | `""` | Speaker notes |
| `hint` | `string` | `""` | Italic grey hint text below heading |
| `iconName` | `string` | `""` | Pre-rendered icon name from `C.icon()` catalog (e.g., `"check"`, `"bulb"`, `"search"`) |
| `table` | `object` | `null` | `{ headers[], rows[][], colWidths[]? }` — render a table instead of bullets |

```js
// Extra Explain slide with an icon and hint
C.e5ContinuationSlide(
  "Skill 1: Defining Classification",  // skillLabel
  "Explain",                            // phaseName
  "I understand the terms used",        // smText
  "More Key Vocabulary",                // title
  ["Kingdom: The highest taxonomic rank.", "Phylum: A group of related classes."],
  { hint: "These terms will appear in your assessment.", iconName: "pencil" }
)

// Continuation slide with a table instead of bullets
C.e5ContinuationSlide(
  "Skill 3: Circuit Analysis",
  "Explain",
  "I can calculate equivalent resistance",
  "Resistor Colour Codes",
  null,   // no bullets — table mode
  { table: { headers: ["Colour", "Digit", "Multiplier"], rows: [["Black", "0", "×1"], ["Brown", "1", "×10"]] } }
)
```

### 10.4 E5 Convenience Builder

`C.e5LessonPlan(skillLabel, plan)` bundles a learning intention slide + all 5 phases:

```js
C.e5LessonPlan("Skill 1: Defining Classification", {
  intention: "To be able to explain the term Classification",
  successMeasures: {
    skill: ["I can classify objects into groups", "I can identify living, non-living and dead things"],
    knowledge: "I understand how to classify items",
    attitude: "I will participate in the lesson and share my understanding",
  },
  engage: {
    heading: "Why are we learning this?",
    bodyText: "Classification happens all around us...",
    imagePath: "./content/images/science-illustration.png",
    smText: "I understand the importance of classification",
  },
  explore: {
    heading: "Skill 1: Defining Classification",
    prompts: ["If I give you a basket of different fruits...", "Why do we group similar objects?"],
    mindMap: "Classification",
    smText: "I can discuss the importance of classification",
  },
  explain: {
    heading: "Skill 1 - Key Vocabulary:",
    contentBlocks: [
      { type: "definition", term: "Classification", text: "The act of arranging into groups of similar things" },
      { type: "definition", term: "Taxonomy", text: "The branch of science concerned with classification..." },
    ],
    calloutText: "What did you learn from this reading?",
    smText: "I understand the terms used in classification",
  },
  elaborate: {
    heading: "Activities",
    instruction: "Please complete the following activity:",
    activityItems: [{ name: "Grouping everyday items" }],
    smText: "I can group everyday items",
  },
  evaluate: {
    heading: "Skill 1: Defining Classification",
    assessmentLink: "Skill 1 Exit ticket",
    rubricItems: ["I can define classification in my own words"],
    smText: "I can demonstrate my understanding of Classification",
  },
})
```

Produces 6 slides: 1 Learning Intention + 1 per phase.

### 10.5 E5 Slide Layout Details

**Every E5 slide shares this chrome:**
- **Top-left:** Skill/concept label in small grey text
- **Top-right:** Red rounded rectangle with phase name (Engage/Explore/Explain/Elaborate/Evaluate)
- **Bottom:** Full-width light green bar with "SM: success measure text"

**Learning Intention slide:** Two vertical panels. Left (white) has centred "Learning Intention" heading + objective text with a thin red decorative line. Right (light green) has a white "Success Measure" badge, then Skill (☐ checkboxes), Knowledge, and Attitude sections.

**Engage slide:** Two-column. Left: "Why are we learning this?" heading + body paragraphs. Right: illustration image (optional).

**Explore slide:** Two-column. Left: probing questions as bullets. Right: photograph or simple mind-map oval with a label.

**Explain slide:** Single-column (or two-column with optional image). Content blocks: definitions (bold term + text), paragraphs, or bullets. Optional pale green callout box at bottom.

**Elaborate slide:** Single-column. Instruction text + activity table with light-green rows. Activity names can be hyperlinked (red underlined).

**Evaluate slide:** Single-column. Centred red underlined assessment link (exit ticket). Optional numbered rubric criteria below.

---

## 11. Graph & Diagram Embedding

> **📊 Image generation is handled by a separate pipeline.** See [`GRAPH_RENDERING.md`](GRAPH_RENDERING.md) for the complete spec API — graph JSON format, circuit layout modes (series/parallel/manual), element catalog, VCAA compliance defaults, and the `tools/render_graph.py` CLI.

### Workflow

```powershell
# 1. Render the image FIRST
python tools/render_graph.py --spec content/my-lesson/graphs/iv-curve.json --out images/iv-curve.png
# 2. Embed in slide definitions, then build
node build-pptx.js
```

### Standalone image slide

```js
C.imageSlide("I-V Characteristic", "images/iv-curve.png",
  "Figure 1: Current is proportional to voltage (R = 22 Ω).",
  { notes: "gradient = 1/R" }
)
```

### Content slide with embedded image

```js
C.contentSlide("Photoelectric Effect", [
  "Below the threshold frequency f₀, no electrons are emitted.",
], {
  image: "images/photoelectric-graph.png",
  imageSize: { x: 5.5, y: 1.8, w: 4.5, h: 3.2 },
  notes: "f₀ ≈ 5.5 × 10¹⁴ Hz"
})
```

### Specs Location

Store graph specs alongside content modules:

```
content/my-lesson/
├── 01-title.js
├── graphs/
│   └── iv-curve.json
```

---

> **End of Reference.** Use this alongside `AGENTS.md` and `DOCX_BUILDER_REFERENCE.md` for the full picture.


```powershell
# 1. Render the graph/circuit/diagram
python tools/render_graph.py --spec content/my-lesson/graphs/iv-curve.json --out images/iv-curve.png

# 2. Reference the image in your PPTX content module
# 3. Build the deck
node build-pptx.js
```

### 11.3 Embedding in Slide Definitions

```js
// In any content module, use C.imageSlide():
module.exports = function mySlide(C, H) {
  return [
    C.imageSlide(
      "I-V Characteristic of an Ohmic Resistor",   // slide title
      "images/iv-curve.png",                         // path to rendered image
      "Figure 1: Current is directly proportional to voltage (R = 22 Ω).",  // caption
      { notes: "Key teaching point: gradient = 1/R" }
    )
  ];
};
```

### 11.4 Image Placement on Content Slides

For slides that combine text with a graph (e.g., Explain slides with data), use `C.contentSlide()` with the `image` option:

```js
C.contentSlide(
  "Photoelectric Effect Results",
  [
    "The graph shows K_max vs frequency for sodium.",
    "Below the threshold frequency f₀, no electrons are emitted.",
    "The gradient equals Planck's constant h.",
  ],
  {
    image: "images/photoelectric-graph.png",
    imageSize: { x: 5.5, y: 1.8, w: 4.5, h: 3.2 },
    notes: "f₀ ≈ 5.5 × 10¹⁴ Hz, φ = hf₀ ≈ 2.3 eV"
  }
)
```

### 11.5 Circuit Diagrams on Slides

```js
// Render first:
// python tools/render_graph.py --spec content/my-lesson/graphs/voltage-divider.json --out images/voltage-divider.svg

// Then embed in a slide:
C.imageSlide(
  "Voltage Divider Circuit",
  "images/voltage-divider.svg",
  "Figure 2: Two resistors in series divide the input voltage. V_out = V_in × R₂/(R₁+R₂)",
  { notes: "Walk through the derivation step by step." }
)
```

### 11.6 Graph Specs Location

Store graph spec JSON files alongside your content modules:

```
content/my-lesson/
├── 01-title.js
├── 10-explain.js
├── graphs/
│   ├── iv-curve.json
│   └── photoelectric.json
```

The `graphs/` subfolder keeps specs organised and co-located with the content that uses them.

---

> **End of Reference.** Use this alongside `AGENTS.md` and `DOCX_BUILDER_REFERENCE.md` for the full picture.
