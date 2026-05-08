// ============================================================
// common.js — SHARED FORMATTING & HELPER MODULE
// Used by build.js. Content modules receive this as "C".
// ============================================================

const {
  Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
  HeadingLevel, PageBreak, Header, Footer, PageNumber,
  NumberFormat
} = require('docx');

// ---- COLOUR PALETTE ----
const COLOURS = {
  primary: "2B579A",    // deep blue — headers, banners, table header fills
  accent: "4A90D9",     // lighter blue — cover subtitle, secondary accents
  warning: "E8A838",    // amber — safety callouts, student details boxes
  greenLine: "5A9E5A",  // green — practical-on-paper tags, checklists
};

// ---- PAGE GEOMETRY (A4) ----
const a4PageProps = {
  page: {
    size: { width: 11906, height: 16838 },   // A4 portrait in DXA
    margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 }
  }
};

const a4LandscapeProps = {
  page: {
    size: { width: 16838, height: 11906 },   // A4 landscape in DXA
    margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 }
  }
};

// ---- DOCUMENT STYLES ----
const docStyles = {
  default: {
    document: {
      run: { font: "Calibri", size: 22 }     // 11pt default body
    }
  }
};

// ---- NUMBERING CONFIG ----
// Pre-defines all common MC references so any content module can use
// any reference like mc-q1, mc-ws3, etc. without pre-declaration.
// Format: a. b. c. d. — resets for each unique reference.
const _mcLevel = {
  level: 0,
  format: NumberFormat.LOWER_LETTER,
  text: "%1.",
  alignment: AlignmentType.LEFT,
  style: { paragraph: { indent: { left: 720, hanging: 360 } } }
};

// Generate mc-default + mc-{prefix}{number} for all single-letter prefixes
// and common multi-letter prefixes. Any agent can use mc-X{n} without
// pre-declaration as long as the prefix is listed here.
// Single-letter: mc-a1..mc-z50  → covers mc-l1, mc-s1, mc-q1, mc-p1 etc.
// Multi-letter:  mc-ws1..mc-ws50, mc-def1..mc-def50  → backward compat
const PREFIXES = [
  ...'abcdefghijklmnopqrstuvwxyz'.split(''),  // single-letter a-z
  'ws', 'def'   // common multi-letter prefixes (worksheet, default)
];
const _mcConfigs = [
  { reference: "mc-default", levels: [_mcLevel] }
];
for (const prefix of PREFIXES) {
  for (let i = 1; i <= 50; i++) {
    _mcConfigs.push({ reference: `mc-${prefix}${i}`, levels: [_mcLevel] });
  }
}

const numberingConfig = { config: _mcConfigs };

// ---- HEADER / FOOTER ----
function studentHeader(text) {
  return new Header({
    children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 0 },
      children: [new TextRun({ text, italics: true, color: "808080", size: 18 })]
    })]
  });
}

function studentFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "Page ", size: 18, color: "808080" }),
        new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080" })
      ]
    })]
  });
}

// Teacher edition header (red-tinted, used for answer booklets)
function teacherHeader(text) {
  return new Header({
    children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 0 },
      children: [new TextRun({ text: "TEACHER COPY · " + text, italics: true, color: "C00000", size: 18 })]
    })]
  });
}

// Teacher edition footer
function teacherFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "CONFIDENTIAL · Page ", size: 18, color: "C00000" }),
        new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "C00000" })
      ]
    })]
  });
}

// ---- PAGE BREAK ----
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// ---- HEADINGS ----
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 240 },
    children: [new TextRun({ text, bold: true, color: COLOURS.primary, size: 36 })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 160 },
    children: [new TextRun({ text, bold: true, color: COLOURS.primary, size: 28 })]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text, bold: true, color: COLOURS.primary, size: 24 })]
  });
}

function h4(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_4,
    spacing: { before: 160, after: 100 },
    children: [new TextRun({ text, bold: true, color: COLOURS.primary, size: 22 })]
  });
}

// ---- BODY TEXT ----
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after !== undefined ? opts.after : 120, before: opts.before || 0 },
    alignment: opts.alignment || AlignmentType.LEFT,
    indent: opts.indent || undefined,
    children: [new TextRun({
      text,
      italics: opts.italic || false,
      bold: opts.bold || false,
      color: opts.color || undefined,
      size: opts.size || 22,
      font: opts.font || undefined
    })]
  });
}

// ---- BULLETS ----
function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text, size: 22 })]
  });
}

function bulletRich(runs) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    children: runs
  });
}

// ---- CALLOUT BOX ----
function calloutBox(title, children, accentColour) {
  const colour = accentColour || COLOURS.primary;
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      // Title bar
      new TableRow({
        children: [new TableCell({
          borders: {
            top: { style: BorderStyle.SINGLE, size: 12, color: colour },
            left: { style: BorderStyle.SINGLE, size: 12, color: colour },
            right: { style: BorderStyle.SINGLE, size: 12, color: colour },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: colour }
          },
          width: { size: 9360, type: WidthType.DXA },
          shading: { fill: colour, type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 200, right: 200 },
          children: [new Paragraph({
            children: [new TextRun({ text: title, bold: true, color: "FFFFFF", size: 24 })]
          })]
        })]
      }),
      // Body
      new TableRow({
        children: [new TableCell({
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: colour },
            left: { style: BorderStyle.SINGLE, size: 12, color: colour },
            right: { style: BorderStyle.SINGLE, size: 12, color: colour },
            bottom: { style: BorderStyle.SINGLE, size: 12, color: colour }
          },
          width: { size: 9360, type: WidthType.DXA },
          margins: { top: 200, bottom: 200, left: 200, right: 200 },
          children: children
        })]
      })
    ]
  });
}

// ---- HINT BOX ----
function hintBox(text) {
  return new Paragraph({
    spacing: { before: 40, after: 80 },
    indent: { left: 240 },
    children: [new TextRun({ text: "💡 " + text, italics: true, color: "808080", size: 20 })]
  });
}

// ---- SENTENCE STARTER ----
// Halves any consecutive underscore run so inline blanks (e.g.
// "________") always fit on one line without wrapping.
function sentenceStarter(text) {
  const fixed = text.replace(/_+/g, m => '_'.repeat(Math.ceil(m.length / 2)));
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    indent: { left: 240 },
    children: [new TextRun({ text: fixed, italics: true, color: "808080", size: 20 })]
  });
}

// ---- SCAFFOLD STEP ----
function scaffoldStep(n, prompt, hint) {
  const children = [
    new TextRun({ text: `Step ${n}: `, bold: true, color: COLOURS.primary }),
    new TextRun({ text: prompt, size: 22 })
  ];
  if (hint) {
    children.push(new TextRun({ text: ` (Hint: ${hint})`, italics: true, color: "808080", size: 20 }));
  }
  children.push(new TextRun({ text: "\n" + "_".repeat(40), size: 20, color: "BFBFBF" }));
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    indent: { left: 240 },
    children
  });
}

// ---- LINED ANSWER SPACE ----
function linedAnswerSpace(count) {
  return Array.from({ length: count }, () =>
    new Paragraph({
      spacing: { before: 200, after: 200 },
      children: [new TextRun({ text: "_".repeat(90), color: "BFBFBF", size: 20, bold: true })]
    })
  );
}

// ---- DRAWING SPACE ----
function drawingSpace(heightInches, label) {
  const result = [];
  if (label) {
    result.push(new Paragraph({
      spacing: { before: 160, after: 60 },
      children: [new TextRun({ text: label, bold: true, size: 20 })]
    }));
  }
  const lines = Math.round(heightInches * 6); // ~6 lines per inch
  const borderDef = {
    top: { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" }
  };
  result.push(new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({
      height: { value: heightInches * 1440, rule: "atLeast" },
      children: [new TableCell({
        borders: borderDef,
        width: { size: 9360, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 80, right: 80 },
        children: Array.from({ length: lines }, () =>
          new Paragraph({ children: [new TextRun({ text: " ", size: 22 })] })
        )
      })]
    })]
  }));
  return result;
}

// ---- SECTION TAG ----
function sectionTag(title, colour) {
  const c = colour || COLOURS.primary;
  return new Paragraph({
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text: "▬▬ " + title + " ▬▬", bold: true, color: c, size: 26 })]
  });
}

// ---- LESSON BANNER ----
function lessonBanner(num, title, subtitle) {
  return [
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [9360],
      rows: [new TableRow({
        children: [new TableCell({
          borders: {
            top: { style: BorderStyle.SINGLE, size: 24, color: COLOURS.primary },
            bottom: { style: BorderStyle.SINGLE, size: 24, color: COLOURS.primary },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE }
          },
          width: { size: 9360, type: WidthType.DXA },
          shading: { fill: "F0F4FA", type: ShadingType.CLEAR },
          margins: { top: 200, bottom: 200, left: 240, right: 240 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 80 },
              children: [new TextRun({ text: `LESSON ${num}`, bold: true, color: COLOURS.primary, size: 18 })]
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 40 },
              children: [new TextRun({ text: title, bold: true, color: COLOURS.primary, size: 32 })]
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: subtitle, italics: true, color: "595959", size: 20 })]
            })
          ]
        })]
      })]
    }),
    new Paragraph({ spacing: { after: 200 }, children: [] })
  ];
}

// ---- WORKED EXAMPLE ----
function workedExample(title, children) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [new TableCell({
          borders: {
            top: { style: BorderStyle.SINGLE, size: 8, color: "70AD47" },
            left: { style: BorderStyle.SINGLE, size: 8, color: "70AD47" },
            right: { style: BorderStyle.SINGLE, size: 8, color: "70AD47" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "70AD47" }
          },
          width: { size: 9360, type: WidthType.DXA },
          shading: { fill: "70AD47", type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 200, right: 200 },
          children: [new Paragraph({
            children: [new TextRun({ text: "📘 WORKED EXAMPLE: " + title, bold: true, color: "FFFFFF", size: 22 })]
          })]
        })]
      }),
      new TableRow({
        children: [new TableCell({
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "70AD47" },
            left: { style: BorderStyle.SINGLE, size: 8, color: "70AD47" },
            right: { style: BorderStyle.SINGLE, size: 8, color: "70AD47" },
            bottom: { style: BorderStyle.SINGLE, size: 8, color: "70AD47" }
          },
          width: { size: 9360, type: WidthType.DXA },
          shading: { fill: "E2EFDA", type: ShadingType.CLEAR },
          margins: { top: 200, bottom: 200, left: 200, right: 200 },
          children: children
        })]
      })
    ]
  });
}

// ---- MULTIPLE CHOICE QUESTION ----
function mcQuestion(n, stem, options, ref) {
  const reference = ref || "mc-default";
  return [
    new Paragraph({
      spacing: { before: 160, after: 80 },
      children: [
        new TextRun({ text: `${n}. `, bold: true }),
        new TextRun(stem)
      ]
    }),
    ...options.map(opt =>
      new Paragraph({
        numbering: { reference, level: 0 },
        spacing: { after: 40 },
        children: [new TextRun(opt)]
      })
    )
  ];
}

module.exports = {
  COLOURS,
  docStyles,
  numberingConfig,
  a4PageProps,
  a4LandscapeProps,
  studentHeader,
  studentFooter,
  teacherHeader,
  teacherFooter,
  pageBreak,
  h1, h2, h3, h4,
  p, bullet, bulletRich,
  calloutBox, hintBox,
  sentenceStarter, scaffoldStep,
  linedAnswerSpace, drawingSpace,
  sectionTag, lessonBanner,
  workedExample, mcQuestion
};
