// 01-cover.js — Cover page for teacher unit guide
const { Paragraph, TextRun, AlignmentType, ShadingType } = require('docx');

module.exports = function coverPage(C, H) {
  return [
    new Paragraph({ spacing: { before: 2400 }, children: [] }),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 0 },
      children: [new TextRun({ text: "YEAR 9 SCIENCE", bold: true, size: 48, color: C.COLOURS.primary })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: "ELECTRICITY", bold: true, size: 64, color: C.COLOURS.primary })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: "6-Week Unit Guide & Curriculum Map", italics: true, size: 30, color: C.COLOURS.accent })]
    }),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 400 },
      shading: { type: ShadingType.CLEAR, fill: C.COLOURS.primary },
      children: [new TextRun({ text: "  Teacher Planning Document  ", bold: true, size: 28, color: "FFFFFF" })]
    }),

    C.p("", { spacing: { after: 600 } }),

    C.calloutBox("UNIT OVERVIEW", [
      C.p("This 6-week electricity unit covers 7 topics from circuit components through to electrical safety. Each week contains 3 lessons (18 lessons total). The unit progresses from foundational concepts (components, V/I/R) through circuit types (series, parallel) to calculation skills (Ohm's Law) and concludes with real-world safety applications.", { size: 22 }),
      C.p("", { spacing: { after: 80 } }),
      C.bulletRich([new TextRun({ text: "Total lessons: ", bold: true }), new TextRun("18 (6 weeks × 3 lessons)")]),
      C.bulletRich([new TextRun({ text: "Topics covered: ", bold: true }), new TextRun("3.1–3.7 Electricity")]),
      C.bulletRich([new TextRun({ text: "Assessment: ", bold: true }), new TextRun("7 online quizzes + practical tasks + end-of-unit review")]),
      C.bulletRich([new TextRun({ text: "Key skill: ", bold: true }), new TextRun("Ohm's Law calculations (V = I × R)")]),
    ]),

    C.p("", { spacing: { after: 400 } }),

    C.calloutBox("TEACHER DETAILS", [
      C.p("Teacher: ____________________   Class: ____________________"),
      C.p("Term: ____________________   Year: 2026"),
      C.p("Start date: ____________________   End date: ____________________"),
    ], C.COLOURS.warning),

    C.pageBreak()
  ];
};
