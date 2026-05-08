// ============================================================
// build.js — UNIVERSAL DOCX TEACHING RESOURCE BUILDER
// ============================================================
// This file is STABLE. An AI agent should NEVER need to edit it.
// The agent's job:
//   1. Create content modules in   content/*.js
//   2. Update metadata in          resource.config.json
//   3. Run:                        node build.js
// ============================================================

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
  HeadingLevel, PageBreak
} = require('docx');

// ---- Load resource configuration ----
const CONFIG_PATH = './resource.config.json';
let config;
try {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch (e) {
  console.error('✗ Missing or invalid resource.config.json');
  console.error('  Create one with: title, creator, outputFile, header, contentDir');
  process.exit(1);
}

// ---- Load common helpers ----
let C;
try {
  C = require('./common.js');
} catch (e) {
  console.error('✗ Missing common.js — this is the shared formatting/helper module.');
  console.error('  See DOCX_BUILDER_REFERENCE.md Section 4 for the full API surface.');
  process.exit(1);
}

// ============================================================
// LOCAL HELPERS (H) — table-cell factories
// These are the same for every resource. Define once.
// ============================================================

function borderAll(color, size) {
  return {
    top: { style: BorderStyle.SINGLE, size, color },
    bottom: { style: BorderStyle.SINGLE, size, color },
    left: { style: BorderStyle.SINGLE, size, color },
    right: { style: BorderStyle.SINGLE, size, color },
  };
}

function cellH(text, w) {
  return new TableCell({
    borders: borderAll(C.COLOURS.primary, 8),
    width: { size: w, type: WidthType.DXA },
    shading: { fill: C.COLOURS.primary, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 22 })] })]
  });
}

function cellP(text, w) {
  return new TableCell({
    borders: borderAll("BFBFBF", 4),
    width: { size: w, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, size: 22 })] })]
  });
}

function cellPr(paragraphs, w) {
  return new TableCell({
    borders: borderAll("BFBFBF", 4),
    width: { size: w, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: paragraphs
  });
}

function cellE(w, n = 3) {
  const lines = [];
  for (let i = 0; i < n; i++) lines.push(new Paragraph({ children: [new TextRun(" ")] }));
  return new TableCell({
    borders: borderAll("BFBFBF", 4),
    width: { size: w, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: lines
  });
}

function cellHint(text, w) {
  return new TableCell({
    borders: borderAll("BFBFBF", 4),
    width: { size: w, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, italics: true, color: "808080", size: 20 })] })]
  });
}

function cellWE(text, w) {
  return new TableCell({
    borders: borderAll("70AD47", 6),
    width: { size: w, type: WidthType.DXA },
    shading: { fill: "E2EFDA", type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, size: 22 })] })]
  });
}

function cellWELabel(label, text, w) {
  return new TableCell({
    borders: borderAll("70AD47", 6),
    width: { size: w, type: WidthType.DXA },
    shading: { fill: "E2EFDA", type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [
      new Paragraph({ children: [new TextRun({ text: label, bold: true, color: "385723", size: 18 })], spacing: { after: 40 } }),
      new Paragraph({ children: [new TextRun({ text, size: 22 })] })
    ]
  });
}

function bdCell(headerText, bodyText, fillColour, w) {
  return new TableCell({
    borders: borderAll(C.COLOURS.primary, 12),
    width: { size: w, type: WidthType.DXA },
    shading: { fill: fillColour, type: ShadingType.CLEAR },
    margins: { top: 240, bottom: 240, left: 100, right: 100 },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: headerText, bold: true, color: C.COLOURS.primary, size: 20 })], spacing: { after: 80 } }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: bodyText, size: 22 })] }),
    ]
  });
}

function bdCellRich(headerText, bodyParas, fillColour, w) {
  return new TableCell({
    borders: borderAll(C.COLOURS.primary, 12),
    width: { size: w, type: WidthType.DXA },
    shading: { fill: fillColour, type: ShadingType.CLEAR },
    margins: { top: 240, bottom: 240, left: 100, right: 100 },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: headerText, bold: true, color: C.COLOURS.primary, size: 20 })], spacing: { after: 80 } }),
      ...bodyParas
    ]
  });
}

function hiddenAnswer(items) {
  return [
    new Paragraph({
      children: [new TextRun({ text: "👇 ANSWER (cover this until you've tried):", bold: true, italics: true, color: "808080", size: 20 })],
      spacing: { before: 160, after: 60 }
    }),
    ...items.map(([label, text]) => C.bulletRich([
      new TextRun({ text: label + ": ", bold: true, italics: true }),
      new TextRun({ text, italics: true })
    ]))
  ];
}

const H = {
  borderAll, cellH, cellP, cellPr, cellE, cellHint,
  cellWE, cellWELabel, bdCell, bdCellRich, hiddenAnswer
};

// ============================================================
// CONTENT LOADER — scans content/ directory, loads all .js files
// Files are loaded in alphabetical order so you can control
// ordering with numeric prefixes: 01-cover.js, 02-theory.js, etc.
// ============================================================

function loadContentModules(contentDir) {
  // Auto-create the directory if it doesn't exist
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
    console.log(`📁 Created: ${contentDir}/`);
  }

  const files = fs.readdirSync(contentDir)
    .filter(f => f.endsWith('.js'))
    .sort(); // alphabetical = predictable ordering

  if (files.length === 0) {
    console.error(`✗ No .js files found in ${contentDir}/`);
    console.error('  Add content modules. See DOCX_BUILDER_REFERENCE.md Section 7 for the template.');
    process.exit(1);
  }

  console.log(`\n📄 Building: ${config.title}`);
  console.log(`📁 Content dir: ${contentDir}/ (${files.length} modules)`);

  const allContent = [];

  for (const file of files) {
    const modulePath = path.join(contentDir, file);
    // require() needs ./ or ../ prefix for relative paths
    const requirePath = './' + path.join(contentDir, file).replace(/\\/g, '/');
    try {
      const mod = require(requirePath);
      if (typeof mod !== 'function') {
        console.warn(`  ⚠ Skipping ${file} — does not export a function`);
        continue;
      }
      const elements = mod(C, H);
      if (!Array.isArray(elements)) {
        console.warn(`  ⚠ Skipping ${file} — export did not return an array`);
        continue;
      }
      allContent.push(...elements);
      console.log(`  ✓ ${file}`);
    } catch (err) {
      console.error(`  ✗ Error loading ${file}: ${err.message}`);
      process.exit(1);
    }
  }

  console.log(`  Total elements assembled: ${allContent.length}\n`);

  // ---- VALIDATION: detect nested arrays (missing spread on multi-element helpers) ----
  const badIndices = [];
  allContent.forEach((el, i) => {
    if (Array.isArray(el)) badIndices.push(i);
    else if (el === undefined || el === null) badIndices.push(i);
  });
  if (badIndices.length > 0) {
    console.error(`  ✗ CORRUPTION DETECTED — ${badIndices.length} element(s) at indices ${badIndices.slice(0, 10).join(', ')} are arrays or null/undefined.`);
    console.error('    Likely cause: missing spread operator (...) on a helper that returns an array.');
    console.error('    Check calls to C.linedAnswerSpace(), C.drawingSpace(), C.lessonBanner(), C.mcQuestion().');
    console.error('    Each should be spread: ...C.linedAnswerSpace(3), not C.linedAnswerSpace(3),');
    process.exit(1);
  }

  return allContent;
}

// ============================================================
// ASSEMBLE & BUILD
// ============================================================

const contentDir = config.contentDir || './content';
const allContent = loadContentModules(contentDir);

const doc = new Document({
  creator: config.creator || "Teaching Resource Builder",
  title: config.title || "Untitled Resource",
  styles: C.docStyles,
  numbering: C.numberingConfig,
  sections: [{
    properties: config.landscape ? C.a4LandscapeProps : C.a4PageProps,
    headers: config.header ? { default: C.studentHeader(config.header) } : undefined,
    footers: config.footer !== false ? { default: C.studentFooter() } : undefined,
    children: allContent
  }]
});

const outputPath = config.outputFile || './output/resource.docx';
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`✓ Done → ${outputPath}`);
}).catch(err => {
  console.error(`✗ Build failed: ${err.message}`);
  process.exit(1);
});
