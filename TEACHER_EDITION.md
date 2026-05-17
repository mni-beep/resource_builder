# 📝 Teacher Edition Patterns

> **Standalone reference for building teacher/answer editions of DOCX resources.**

This file documents the patterns used when building a paired teacher edition — a separate `.docx` file containing answers, teaching notes, and marking criteria. The teacher edition is a separate build (separate `build.js` invocation with different `resource.config.json`, typically pointing at a different content folder like `content/my-booklet-teacher/`).

---

## 1. Teacher Colour Palette

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

---

## 2. Answer Box

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

---

## 3. Teaching Note Box

Amber left-border box with "⚠ TEACHING NOTE" heading. Used for pacing advice, common misconceptions, and marking approach notes.

```js
function teachingNote(bodyParagraphs) {
  // Same structure as answerBox but with amber colours
  // Borders: TC.amberBorder, Background: TC.amberBg, Heading: TC.amber
}
```

---

## 4. Question Reference

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

---

## 5. Answer Paragraphs and Bullets

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

---

## 6. Marking Criteria

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

---

## 7. Teacher Cover Page

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

---

## 8. "How to Teach" Guide

Structured page with:
- **Pacing** — time estimates per lesson
- **Common Misconceptions** — bulleted list of pitfalls
- **Marking Approach** — how to score each question type

---

## 9. common.js Additions for Teacher Edition

`common.js` already exports these teacher-specific functions:

```
teacherHeader(text)    → Header object (red-themed)
teacherFooter()        → Footer object (red-themed, "CONFIDENTIAL")
```

Teachers use the same `C.studentHeader()`/`C.studentFooter()` or these teacher-specific variants depending on design choice. The teacher edition typically reuses most `C.*` helpers, adding the TC colour palette and answer/note boxes locally in its build script.

---

## 10. Workflow

```powershell
# 1. Build the student booklet
#    contentDir: "./content/my-booklet"
#    outputFile: "./output/student-booklet.docx"
node build.js

# 2. Update resource.config.json:
#    contentDir: "./content/my-booklet-teacher"
#    outputFile: "./output/teacher-booklet.docx"
#    header: "Teacher Edition — Confidential"

# 3. Build the teacher edition
node build.js
```

Two separate `build.js` invocations with different configs targeting different content folders. Teacher content modules use answer boxes (green), teaching notes (amber), and marking criteria from this file.

---

> **End of Reference.** For student resource construction, see `DOCX_BUILDER_REFERENCE.md`. For interview instructions about booklet+teacher-edition combos, see `AGENTS.md` and `INTERVIEW_DOCX.md`.
