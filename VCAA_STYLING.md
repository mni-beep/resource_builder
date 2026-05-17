# 🎓 VCAA Exam Styling Reference

> **MANDATORY for VCE/VCAL assessments.** Applies to Physics, Chemistry, Biology, Science, Maths, and Mathematics subjects.

This file is the single source of truth for VCAA-compliant math typesetting in exams and assessments. It is triggered automatically by the subject-detection gate in `AGENTS.md`.

---

## Auto-Detect Gate

When the user specifies a subject containing any of: **Physics, Chemistry, Biology, Science, Maths, Mathematics** — the following gate activates automatically:

> All scalar algebraic variables in ITALIC. Use `C.mathPara()`, `C.mathFormula()`, `C.mathSubscript()`, `C.mathSuperscript()` for equations. Exam body MUST be plain — no `C.sectionTag()` with coloured bars, no `C.calloutBox()` in question sections.

For **Electronics, Computing, Arduino** subjects: Use `tools/render_graph.py` with schemdraw for circuit schematics. ASCII box-drawing diagrams are also acceptable.

For all other subjects: No special gate applies. Build normally.

---

## Rule 1 — Italic Scalar Variables

All algebraic scalar variables MUST be rendered in italic. Use `new TextRun({ text: "v", italics: true })` for inline variables within question stems and answer options.

```js
// WRONG — plain variable:
new TextRun("v = 3.0 × 10⁶ m s⁻¹")
// RIGHT — italic variable:
new TextRun({ text: "v", italics: true }),
new TextRun(" = 3.0 × 10⁶ m s⁻¹")
```

---

## Rule 2 — Native DOCX Math for Equations

Use `C.mathPara()` for paragraphs containing equations, and `C.mathFormula()` for proper fractions, radicals, subscripts, and superscripts. NEVER use Unicode-only superscripts/subscripts as the primary equation rendering — they are acceptable only in inline running text where DOCX math would be excessive.

```js
// WRONG — Unicode approximation:
C.p("F = Gm₁m₂/r²")
// RIGHT — proper math fraction:
C.mathPara(["F = ", C.mathFormula([{ type: 'frac', num: 'Gm₁m₂', den: 'r²' }])])
```

---

## Rule 3 — Subscripts and Superscripts

Use `C.mathSubscript("v", "1")` and `C.mathSuperscript("m", "2")` for individual subscripted/superscripted variables. Use `C.mathFormula()` for compound expressions.

```js
// Inline subscripted variable:
C.mathPara([C.mathSubscript("v", "1"), " = 0 m s⁻¹"])
// Compound expression with fraction + subscript:
C.mathFormula([
  C.mathSubscript("v", "avg"),
  " = ",
  { type: 'frac', num: 'Δx', den: 'Δt' }
])
```

---

## Rule 4 — Clean Exam Body, No Decorative Colours

The exam question body should use plain black text on white. Do NOT use `C.sectionTag()` with coloured bars, `C.calloutBox()`, or `C.hintBox()` in the question sections. These are for workbooks/booklets only. The cover page may use colour. The marking key may use green answer boxes (teacher edition pattern).

```js
// EXAM BODY — use plain headings, no colour:
C.h2("Question 1 — Projectile Motion [6 marks]")
// NOT:
C.sectionTag("Unit 3 · Area of Study 1: Motion", C.COLOURS.primary)  // ← remove from exam body
```

---

## Rule 5 — MC Option Variables in Italic

When multiple-choice options contain algebraic variables, those variables must be italic. Build custom option paragraphs instead of relying on `C.mcQuestion()` plain-text options when the options contain maths.

```js
// For MC options with algebraic variables, use custom paragraphs:
const mcOptsWithItalic = (n, stem, opts, ref) => {
  const items = [
    new Paragraph({ spacing: { before: 160, after: 80 }, children: [
      new TextRun({ text: `${n}. `, bold: true }), new TextRun(stem)
    ]})
  ];
  opts.forEach((optParts, i) => {
    // optParts is an array of { text, italics? } objects
    items.push(new Paragraph({
      numbering: { reference: ref, level: 0 },
      spacing: { after: 40 },
      children: optParts.map(p => new TextRun({ text: p.text, italics: p.italics || false }))
    }));
  });
  return items;
};
```

---

## Rule 6 — Vector Notation

Vectors may be rendered in bold (VCAA convention). Use `new TextRun({ text: "F", bold: true })` for vector variables where appropriate.

---

## Quick Summary Table

| Element | VCAA Style | Helper to use |
|---|---|---|
| Scalar variable (v, m, t, E) | *italic* | `new TextRun({ text: "v", italics: true })` |
| Subscript (v₁) | native subscript | `C.mathSubscript("v", "1")` |
| Superscript (m²) | native superscript | `C.mathSuperscript("m", "2")` |
| Fraction (Gm/r²) | stacked fraction | `C.mathFormula([{ type: 'frac', num: 'Gm', den: 'r²' }])` |
| Display equation | mixed text + math | `C.mathPara([...elements])` |
| Square root | radical symbol | `C.mathFormula([{ type: 'sqrt', value: '2gh' }])` |
| Vector | **bold** | `new TextRun({ text: "F", bold: true })` |
| Unit (m s⁻¹, N kg⁻¹) | regular weight | `new TextRun(" m s⁻¹")` — Unicode superscript OK for units |
| Section divider | plain heading | `C.h2()` or `C.h3()` — no coloured `C.sectionTag()` |
| Exam instructions | plain paragraph | `C.p()` — no callout boxes in exam body |

---

> **End of Reference.** For full DOCX content module construction, see `DOCX_BUILDER_REFERENCE.md`. For the interview auto-detect gate, see `AGENTS.md`.
