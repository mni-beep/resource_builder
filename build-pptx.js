// ============================================================
// build-pptx.js — UNIVERSAL PPTX TEACHING RESOURCE BUILDER
// ============================================================
// This file is STABLE. An AI agent should NEVER need to edit it.
// The agent's job:
//   1. Create content modules in   content/*.js
//   2. Update metadata in          resource.config.json
//   3. Run:                        node build-pptx.js
// ============================================================

const fs = require('fs');
const path = require('path');
const PptxGenJS = require('pptxgenjs');

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

// ---- Load PPTX common helpers ----
let C;
try {
  C = require('./common-pptx.js');
} catch (e) {
  console.error('✗ Missing common-pptx.js — this is the shared PPTX formatting/helper module.');
  process.exit(1);
}

// ============================================================
// LOCAL HELPERS (H) — PPTX-specific cell/table helpers
// Much simpler than DOCX since pptxgenjs handles table rendering.
// ============================================================

/**
 * Normalize an array of text items into pptxgenjs TextProps format.
 * pptxgenjs requires { text, options } objects; plain strings cause errors.
 */
function toTextProps(items, defaultOpts = {}) {
  if (!Array.isArray(items)) return items;
  return items.map(item => {
    if (typeof item === 'string') {
      return { text: item, options: { ...defaultOpts } };
    }
    if (item && typeof item.text === 'string') {
      return { text: item.text, options: { ...defaultOpts, ...(item.options || {}) } };
    }
    return { text: String(item), options: { ...defaultOpts } };
  });
}

/**
 * Create a table header cell style object.
 */
function cellH(text) {
  return { text, options: { bold: true, color: "FFFFFF", fill: { color: C.COLOURS.primary }, align: "center", valign: "middle", fontSize: 14 } };
}

/**
 * Create a plain table cell style object.
 */
function cellP(text) {
  return { text, options: { fill: { color: "FFFFFF" }, valign: "middle", fontSize: 12 } };
}

/**
 * Create a worked example cell (green tint).
 */
function cellWE(text) {
  return { text, options: { fill: { color: C.COLOURS.greenBg }, valign: "middle", fontSize: 12, border: { type: "solid", color: C.COLOURS.greenWE, pt: 1 } } };
}

/**
 * Create a hint cell (italic grey).
 */
function cellHint(text) {
  return { text, options: { italic: true, color: C.COLOURS.greyText, fill: { color: "FFFFFF" }, valign: "middle", fontSize: 11 } };
}

/**
 * Create an empty cell (for student fill-in).
 */
function cellE() {
  return { text: "________", options: { fill: { color: "FFFFFF" }, valign: "middle", fontSize: 12, color: "BFBFBF" } };
}

/**
 * Format an array of rows for pptxgenjs (each cell gets text + options).
 */
function formatRow(cells) {
  return cells.map(cell => {
    if (typeof cell === 'string') return { text: cell, options: { fontSize: 12 } };
    return cell;
  });
}

const H = {
  cellH,
  cellP,
  cellWE,
  cellHint,
  cellE,
  formatRow,
};

// ============================================================
// CONTENT LOADER
// ============================================================

function loadContentModules(contentDir) {
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
    console.log(`📁 Created: ${contentDir}/`);
  }

  const files = fs.readdirSync(contentDir)
    .filter(f => f.endsWith('.js'))
    .sort();

  if (files.length === 0) {
    console.error(`✗ No .js files found in ${contentDir}/`);
    console.error('  Add content modules. See PPTX_BUILDER_REFERENCE.md for the template.');
    process.exit(1);
  }

  console.log(`\n📊 Building: ${config.title}`);
  console.log(`📁 Content dir: ${contentDir}/ (${files.length} modules)`);

  const allSlides = [];

  for (const file of files) {
    const modulePath = path.join(contentDir, file);
    const requirePath = './' + path.join(contentDir, file).replace(/\\/g, '/');
    try {
      const mod = require(requirePath);
      if (typeof mod !== 'function') {
        console.warn(`  ⚠ Skipping ${file} — does not export a function`);
        continue;
      }
      const slides = mod(C, H);
      if (!Array.isArray(slides)) {
        console.warn(`  ⚠ Skipping ${file} — export did not return an array`);
        continue;
      }
      allSlides.push(...slides);
      console.log(`  ✓ ${file} → ${slides.length} slide(s)`);
    } catch (err) {
      console.error(`  ✗ Error loading ${file}: ${err.message}`);
      console.error(err.stack);
      process.exit(1);
    }
  }

  console.log(`  Total slides: ${allSlides.length}\n`);

  // ---- VALIDATION: detect nested arrays or corrupt slide definitions ----
  const badIndices = [];
  allSlides.forEach((el, i) => {
    if (Array.isArray(el)) badIndices.push(i);
    else if (el === undefined || el === null) badIndices.push(i);
    else if (typeof el !== 'object') badIndices.push(i);
  });
  if (badIndices.length > 0) {
    console.error(`  ✗ CORRUPTION DETECTED — ${badIndices.length} element(s) at indices ${badIndices.slice(0, 10).join(', ')} are invalid.`);
    console.error('    Likely cause: missing spread operator (...) on a helper that returns an array.');
    console.error('    Each slide helper returns a single slide definition object — arrays should be spread.');
    process.exit(1);
  }

  return allSlides;
}

// ============================================================
// SLIDE RENDERER — maps slide definitions to pptxgenjs calls
// ============================================================

function hexToRGB(hex) {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return { r, g, b };
}

function renderSlide(pptx, def, slideNum) {
  try {
    switch (def.type) {

      // ---- TITLE SLIDE ----
      case "title": {
        const slide = pptx.addSlide();
        slide.background = { fill: C.COLOURS.primary };
        // Title
        slide.addText(def.title, {
          x: 1, y: 1.8, w: "80%", h: 1.6,
          fontSize: 44, bold: true, color: "FFFFFF",
          align: "center", fontFace: C.FONT.heading
        });
        // Subtitle
        if (def.subtitle) {
          slide.addText(def.subtitle, {
            x: 1.5, y: 3.5, w: "70%", h: 0.8,
            fontSize: 24, color: "FFFFFF",
            align: "center", fontFace: C.FONT.body
          });
        }
        // Author
        if (def.author) {
          slide.addText(def.author, {
            x: 1.5, y: 5.2, w: "70%", h: 0.6,
            fontSize: 16, color: "B0C4DE",
            align: "center", fontFace: C.FONT.body
          });
        }
        break;
      }

      // ---- SECTION DIVIDER ----
      case "divider": {
        const slide = pptx.addSlide();
        slide.background = { fill: C.COLOURS.primary };
        slide.addText(def.title, {
          x: 1, y: 2.0, w: "80%", h: 1.5,
          fontSize: 40, bold: true, color: "FFFFFF",
          align: "center", fontFace: C.FONT.heading
        });
        if (def.subtitle) {
          slide.addText(def.subtitle, {
            x: 1.5, y: 3.8, w: "70%", h: 0.8,
            fontSize: 20, color: "B0C4DE",
            align: "center", fontFace: C.FONT.body
          });
        }
        break;
      }

      // ---- CONTENT SLIDE (heading + bullets) ----
      case "content": {
        const slide = pptx.addSlide();
        // Title bar
        slide.addText(def.title, {
          x: 0.5, y: 0.3, w: "90%", h: 0.7,
          fontSize: 28, bold: true, color: C.COLOURS.primary,
          fontFace: C.FONT.heading
        });
        // Decorative line under title
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.5, y: 1.05, w: "90%", h: 0.04,
          fill: { color: C.COLOURS.primary }
        });
        // Hint text (optional)
        let bulletY = 1.3;
        if (def.hint) {
          slide.addText(def.hint, {
            x: 0.7, y: bulletY, w: "86%", h: 0.4,
            fontSize: 12, italic: true, color: C.COLOURS.greyText,
            fontFace: C.FONT.body
          });
          bulletY += 0.45;
        }
        // Bullets
        if (def.bullets && def.bullets.length > 0) {
          slide.addText(toTextProps(def.bullets, { bullet: true }), {
            x: 0.7, y: bulletY, w: "86%", h: 5.0,
            fontSize: 18,
            fontFace: C.FONT.body, valign: "top",
            lineSpacing: 28
          });
        }
        // Speaker notes
        if (def.notes) slide.addNotes(def.notes);
        break;
      }

      // ---- TWO-COLUMN SLIDE ----
      case "twoColumn": {
        const slide = pptx.addSlide();
        slide.addText(def.title, {
          x: 0.5, y: 0.3, w: "90%", h: 0.7,
          fontSize: 28, bold: true, color: C.COLOURS.primary,
          fontFace: C.FONT.heading
        });
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.5, y: 1.05, w: "90%", h: 0.04,
          fill: { color: C.COLOURS.primary }
        });
        // Left column
        if (def.left && def.left.length > 0) {
          slide.addText(toTextProps(def.left, { bullet: true }), {
            x: 0.5, y: 1.3, w: "43%", h: 5.5,
            fontSize: 16,
            fontFace: C.FONT.body, valign: "top",
            lineSpacing: 24
          });
        }
        // Right column
        if (def.right && def.right.length > 0) {
          slide.addText(toTextProps(def.right, { bullet: true }), {
            x: "52%", y: 1.3, w: "43%", h: 5.5,
            fontSize: 16,
            fontFace: C.FONT.body, valign: "top",
            lineSpacing: 24
          });
        }
        if (def.notes) slide.addNotes(def.notes);
        break;
      }

      // ---- TABLE SLIDE ----
      case "table": {
        const slide = pptx.addSlide();
        slide.addText(def.title, {
          x: 0.5, y: 0.3, w: "90%", h: 0.7,
          fontSize: 28, bold: true, color: C.COLOURS.primary,
          fontFace: C.FONT.heading
        });
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.5, y: 1.05, w: "90%", h: 0.04,
          fill: { color: C.COLOURS.primary }
        });

        if (def.headers && def.rows) {
          // Build cell arrays with styling
          const headerRow = def.headers.map(h => cellH(h));
          const dataRows = def.rows.map(row => formatRow(row));

          const allRows = [headerRow, ...dataRows];
          // Calculate column widths
          const colW = def.colWidths || def.headers.map(() => (9.0 / def.headers.length));

          slide.addTable(allRows, {
            x: 0.5, y: 1.3, w: 9.0,
            colW: colW,
            rowH: [0.5, ...dataRows.map(() => 0.4)],
            border: { type: "solid", pt: 0.5, color: "BFBFBF" },
            fontFace: C.FONT.body,
            autoPage: false
          });
        }
        if (def.notes) slide.addNotes(def.notes);
        break;
      }

      // ---- IMAGE SLIDE ----
      case "image": {
        const slide = pptx.addSlide();
        slide.addText(def.title, {
          x: 0.5, y: 0.3, w: "90%", h: 0.7,
          fontSize: 28, bold: true, color: C.COLOURS.primary,
          fontFace: C.FONT.heading
        });
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.5, y: 1.05, w: "90%", h: 0.04,
          fill: { color: C.COLOURS.primary }
        });

        const imgPath = C.resolveImage(def.image);
        if (imgPath) {
          slide.addImage({
            path: imgPath,
            x: def.size ? def.size.x || 1.0 : 1.0,
            y: 1.3,
            w: def.size ? def.size.w || 8.0 : 8.0,
            h: def.size ? def.size.h || 4.5 : 4.5,
          });
        } else {
          slide.addText("[Image not found: " + def.image + "]", {
            x: 1, y: 2, w: 8, h: 3,
            fontSize: 16, italic: true, color: C.COLOURS.greyText,
            align: "center"
          });
        }

        if (def.caption) {
          slide.addText(def.caption, {
            x: 1.0, y: 6.0, w: 8.0, h: 0.6,
            fontSize: 12, italic: true, color: C.COLOURS.greyText,
            align: "center", fontFace: C.FONT.body
          });
        }
        if (def.notes) slide.addNotes(def.notes);
        break;
      }

      // ---- VIDEO SLIDE ----
      case "video": {
        const slide = pptx.addSlide();
        // Title bar
        slide.addText(def.title, {
          x: 0.5, y: 0.3, w: "90%", h: 0.7,
          fontSize: 28, bold: true, color: C.COLOURS.primary,
          fontFace: C.FONT.heading
        });
        // Decorative line
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.5, y: 1.05, w: "90%", h: 0.04,
          fill: { color: C.COLOURS.primary }
        });

        const videoPath = def.video;
        if (videoPath && fs.existsSync(videoPath)) {
          slide.addMedia({
            type: "video",
            path: videoPath,
            x: 1.0, y: 1.3, w: 11.3, h: 4.8,
            autoPlay: def.autoPlay || false
          });
        } else {
          // Placeholder for missing video
          const msg = def.sourceUrl
            ? `🎬 Video not available offline.\nWatch at: ${def.sourceUrl}`
            : "🎬 [Video: " + (def.caption || "unavailable") + "]";
          slide.addText(msg, {
            x: 1, y: 2, w: 11.3, h: 3,
            fontSize: 16, color: C.COLOURS.greyText,
            align: "center", fontFace: C.FONT.body
          });
        }

        if (def.caption) {
          slide.addText(def.caption, {
            x: 1.0, y: 6.3, w: 11.3, h: 0.5,
            fontSize: 12, italic: true, color: C.COLOURS.greyText,
            align: "center", fontFace: C.FONT.body
          });
        }
        if (def.notes) slide.addNotes(def.notes);
        break;
      }

      // ---- WORKED EXAMPLE SLIDE ----
      case "workedExample": {
        const slide = pptx.addSlide();
        // Green header bar
        slide.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: "100%", h: 0.9,
          fill: { color: C.COLOURS.greenWE }
        });
        slide.addText("📘 WORKED EXAMPLE: " + def.title, {
          x: 0.5, y: 0.1, w: "90%", h: 0.7,
          fontSize: 24, bold: true, color: "FFFFFF",
          fontFace: C.FONT.heading
        });
        // Question (if provided)
        let stepY = 1.2;
        if (def.question) {
          slide.addText(def.question, {
            x: 0.7, y: stepY, w: "86%", h: 0.6,
            fontSize: 16, bold: true, fontFace: C.FONT.body
          });
          stepY += 0.7;
        }
        // Steps
        if (def.steps && def.steps.length > 0) {
          const stepItems = def.steps.map((s, i) =>
            `Step ${i + 1}: ${typeof s === 'string' ? s : s.text || ''}`
          );
          slide.addText(toTextProps(stepItems, { bullet: true }), {
            x: 0.7, y: stepY, w: "86%", h: 5.0,
            fontFace: C.FONT.body,
            valign: "top", lineSpacing: 26
          });
        }
        if (def.notes) slide.addNotes(def.notes);
        break;
      }

      // ---- NOW YOU TRY SLIDE ----
      case "nowYouTry": {
        const slide = pptx.addSlide();
        slide.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: "100%", h: 0.9,
          fill: { color: C.COLOURS.greenWE }
        });
        slide.addText("✏️ NOW YOU TRY: " + def.title, {
          x: 0.5, y: 0.1, w: "90%", h: 0.7,
          fontSize: 24, bold: true, color: "FFFFFF",
          fontFace: C.FONT.heading
        });
        if (def.question) {
          // question can be a string or an array of strings
          const qText = Array.isArray(def.question)
            ? def.question.map((q, i) => `${i + 1}. ${q}`).join('\n')
            : def.question;
          slide.addText(qText, {
            x: 0.7, y: 1.3, w: "86%", h: 3.0,
            fontSize: 16, fontFace: C.FONT.body,
            valign: "top", lineSpacing: 24
          });
        }
        // Hidden answer in speaker notes
        if (def.answers && def.answers.length > 0) {
          slide.addNotes("👇 ANSWERS (for teacher):\n" + def.answers.map((a, i) => `  ${i + 1}. ${a}`).join('\n'));
        }
        slide.addText("Try this on your own. Check your answers with your teacher.", {
          x: 0.7, y: 4.5, w: "86%", h: 0.5,
          fontSize: 14, italic: true, color: C.COLOURS.greyText,
          fontFace: C.FONT.body
        });
        if (def.notes) slide.addNotes(def.notes);
        break;
      }

      // ---- MULTIPLE CHOICE SLIDE ----
      case "mcQuestion": {
        const slide = pptx.addSlide();
        slide.addText(`Question ${def.n || ''}`, {
          x: 0.5, y: 0.3, w: "90%", h: 0.6,
          fontSize: 14, color: C.COLOURS.greyText,
          fontFace: C.FONT.body
        });
        slide.addText(def.stem, {
          x: 0.5, y: 0.8, w: "90%", h: 1.0,
          fontSize: 22, bold: true, fontFace: C.FONT.body
        });
        // Options
        if (def.options) {
          const optY = def.hint ? 2.2 : 2.0;
          def.options.forEach((opt, i) => {
            slide.addText(`${String.fromCharCode(97 + i)}.  ${opt}`, {
              x: 1.5, y: optY + i * 0.7, w: 7.0, h: 0.6,
              fontSize: 18, fontFace: C.FONT.body
            });
          });
        }
        // Hint
        if (def.hint) {
          slide.addText("💡 " + def.hint, {
            x: 0.7, y: 2.0, w: "86%", h: 0.4,
            fontSize: 12, italic: true, color: C.COLOURS.greyText,
            fontFace: C.FONT.body
          });
        }
        // Answer in speaker notes
        if (def.answer) {
          slide.addNotes(`✓ Answer: ${def.answer}`);
        }
        break;
      }

      // ---- SHORT ANSWER SLIDE ----
      case "shortAnswer": {
        const slide = pptx.addSlide();
        slide.addText(def.title, {
          x: 0.5, y: 0.3, w: "90%", h: 0.7,
          fontSize: 28, bold: true, color: C.COLOURS.primary,
          fontFace: C.FONT.heading
        });
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.5, y: 1.05, w: "90%", h: 0.04,
          fill: { color: C.COLOURS.primary }
        });
        if (def.question) {
          slide.addText(def.question, {
            x: 0.7, y: 1.3, w: "86%", h: 0.7,
            fontSize: 18, bold: true, fontFace: C.FONT.body
          });
        }
        let starterY = def.question ? 2.1 : 1.3;
        if (def.sentenceStarter) {
          slide.addText(def.sentenceStarter, {
            x: 0.9, y: starterY, w: "82%", h: 0.5,
            fontSize: 14, italic: true, color: C.COLOURS.greyText,
            fontFace: C.FONT.body
          });
          starterY += 0.5;
        }
        // Lined spaces
        const lines = def.numLines || 3;
        for (let i = 0; i < lines; i++) {
          slide.addShape(pptx.ShapeType.line, {
            x: 0.9, y: starterY + i * 0.6, w: "82%", h: 0,
            line: { color: "BFBFBF", width: 0.5 }
          });
        }
        if (def.notes) slide.addNotes(def.notes);
        break;
      }

      // ---- EXTENDED RESPONSE SLIDE ----
      case "extendedResponse": {
        const slide = pptx.addSlide();
        slide.addText(def.title, {
          x: 0.5, y: 0.3, w: "90%", h: 0.7,
          fontSize: 28, bold: true, color: C.COLOURS.primary,
          fontFace: C.FONT.heading
        });
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.5, y: 1.05, w: "90%", h: 0.04,
          fill: { color: C.COLOURS.primary }
        });
        if (def.question) {
          slide.addText(def.question, {
            x: 0.7, y: 1.2, w: "86%", h: 0.6,
            fontSize: 16, bold: true, fontFace: C.FONT.body
          });
        }
        // Planning steps
        if (def.planningSteps && def.planningSteps.length > 0) {
          const steps = def.planningSteps.map((s, i) => `Step ${i + 1}: ${s}`);
          slide.addText(toTextProps(steps, { bullet: true }), {
            x: 0.7, y: 2.0, w: "86%", h: 2.5,
            fontSize: 14,
            fontFace: C.FONT.body, valign: "top",
            lineSpacing: 20
          });
        }
        if (def.notes) slide.addNotes(def.notes);
        break;
      }

      // ---- FILL-IN TABLE SLIDE ----
      case "fillTable": {
        const slide = pptx.addSlide();
        slide.addText(def.title, {
          x: 0.5, y: 0.3, w: "90%", h: 0.7,
          fontSize: 28, bold: true, color: C.COLOURS.primary,
          fontFace: C.FONT.heading
        });
        if (def.hint) {
          slide.addText("💡 " + def.hint, {
            x: 0.7, y: 1.0, w: "86%", h: 0.4,
            fontSize: 12, italic: true, color: C.COLOURS.greyText,
            fontFace: C.FONT.body
          });
        }
        if (def.headers && def.rows) {
          const headerRow = def.headers.map(h => cellH(h));
          const dataRows = def.rows.map(row => formatRow(row));
          const tableY = def.hint ? 1.5 : 1.2;
          slide.addTable([headerRow, ...dataRows], {
            x: 0.5, y: tableY, w: 9.0,
            colW: def.colWidths || def.headers.map(() => 9.0 / def.headers.length),
            border: { type: "solid", pt: 0.5, color: "BFBFBF" },
            fontFace: C.FONT.body
          });
        }
        if (def.notes) slide.addNotes(def.notes);
        break;
      }

      // ---- CALLOUT SLIDE ----
      case "callout": {
        const slide = pptx.addSlide();
        const calloutColors = {
          info: { bg: "E8F0FE", border: C.COLOURS.primary, icon: "📌" },
          warning: { bg: "FFF3E0", border: C.COLOURS.warning, icon: "⚠" },
          success: { bg: C.COLOURS.greenBg, border: C.COLOURS.greenLine, icon: "✓" },
          key: { bg: "F3E5F5", border: "9C27B0", icon: "🔑" },
        };
        const cc = calloutColors[def.calloutType] || calloutColors.info;
        // Background box
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.5, y: 0.5, w: "90%", h: 6.0,
          fill: { color: cc.bg },
          line: { color: cc.border, width: 2 }
        });
        slide.addText(cc.icon + " " + def.title, {
          x: 1.0, y: 0.8, w: "80%", h: 0.7,
          fontSize: 26, bold: true, color: cc.border,
          fontFace: C.FONT.heading
        });
        if (def.bullets && def.bullets.length > 0) {
          slide.addText(toTextProps(def.bullets, { bullet: true }), {
            x: 1.2, y: 1.8, w: "76%", h: 4.0,
            fontSize: 18,
            fontFace: C.FONT.body, valign: "top",
            lineSpacing: 28
          });
        }
        break;
      }

      // ---- CHECKLIST SLIDE ----
      case "checklist": {
        const slide = pptx.addSlide();
        slide.addText(def.title, {
          x: 0.5, y: 0.3, w: "90%", h: 0.7,
          fontSize: 28, bold: true, color: C.COLOURS.primary,
          fontFace: C.FONT.heading
        });
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.5, y: 1.05, w: "90%", h: 0.04,
          fill: { color: C.COLOURS.primary }
        });
        if (def.items && def.items.length > 0) {
          const checkItems = def.items.map(item => "☐  " + item);
          slide.addText(toTextProps(checkItems), {
            x: 0.7, y: 1.3, w: "86%", h: 5.5,
            fontSize: 18, fontFace: C.FONT.body,
            valign: "top", lineSpacing: 32
          });
        }
        break;
      }

      // ---- COMPARISON SLIDE ----
      case "comparison": {
        const slide = pptx.addSlide();
        slide.addText(def.title, {
          x: 0.5, y: 0.3, w: "90%", h: 0.7,
          fontSize: 28, bold: true, color: C.COLOURS.primary,
          fontFace: C.FONT.heading
        });
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.5, y: 1.05, w: "90%", h: 0.04,
          fill: { color: C.COLOURS.primary }
        });
        // Left header
        slide.addText(def.leftHeader, {
          x: 0.5, y: 1.3, w: "43%", h: 0.5,
          fontSize: 20, bold: true, color: C.COLOURS.accent,
          align: "center", fontFace: C.FONT.heading
        });
        // Right header
        slide.addText(def.rightHeader, {
          x: "52%", y: 1.3, w: "43%", h: 0.5,
          fontSize: 20, bold: true, color: C.COLOURS.greenLine,
          align: "center", fontFace: C.FONT.heading
        });
        // Left bullets
        if (def.leftBullets && def.leftBullets.length > 0) {
          slide.addText(toTextProps(def.leftBullets, { bullet: true }), {
            x: 0.7, y: 1.9, w: "40%", h: 5.0,
            fontSize: 15,
            fontFace: C.FONT.body, valign: "top",
            lineSpacing: 22
          });
        }
        // Right bullets
        if (def.rightBullets && def.rightBullets.length > 0) {
          slide.addText(toTextProps(def.rightBullets, { bullet: true }), {
            x: "54%", y: 1.9, w: "40%", h: 5.0,
            fontSize: 15,
            fontFace: C.FONT.body, valign: "top",
            lineSpacing: 22
          });
        }
        if (def.notes) slide.addNotes(def.notes);
        break;
      }

      // ---- BIG IDEA SLIDE ----
      case "bigIdea": {
        const slide = pptx.addSlide();
        slide.background = { fill: C.COLOURS.primary };
        slide.addText(def.idea, {
          x: 1, y: 1.5, w: "80%", h: 2.5,
          fontSize: 36, bold: true, color: "FFFFFF",
          align: "center", fontFace: C.FONT.heading,
          valign: "middle"
        });
        if (def.subtitle) {
          slide.addText(def.subtitle, {
            x: 1.5, y: 4.5, w: "70%", h: 0.8,
            fontSize: 18, color: "B0C4DE",
            align: "center", fontFace: C.FONT.body
          });
        }
        break;
      }

      // ---- DIAGRAM SLIDE (ASCII) ----
      case "diagram": {
        const slide = pptx.addSlide();
        slide.addText(def.title, {
          x: 0.5, y: 0.3, w: "90%", h: 0.7,
          fontSize: 28, bold: true, color: C.COLOURS.primary,
          fontFace: C.FONT.heading
        });
        if (def.ascii && def.ascii.length > 0) {
          slide.addText(def.ascii.join('\n'), {
            x: 0.7, y: 1.2, w: "86%", h: 5.0,
            fontSize: 14, fontFace: C.FONT.mono,
            valign: "top", lineSpacing: 16
          });
        }
        if (def.caption) {
          slide.addText(def.caption, {
            x: 1.0, y: 6.5, w: 8.0, h: 0.5,
            fontSize: 12, italic: true, color: C.COLOURS.greyText,
            align: "center", fontFace: C.FONT.body
          });
        }
        break;
      }

      // ---- OBJECTIVES SLIDE ----
      case "objectives": {
        const slide = pptx.addSlide();
        slide.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: "100%", h: 1.1,
          fill: { color: C.COLOURS.primary }
        });
        slide.addText("LEARNING OBJECTIVES", {
          x: 0.5, y: 0.15, w: "90%", h: 0.4,
          fontSize: 16, color: "B0C4DE",
          fontFace: C.FONT.body
        });
        slide.addText(def.title, {
          x: 0.5, y: 0.5, w: "90%", h: 0.5,
          fontSize: 24, bold: true, color: "FFFFFF",
          fontFace: C.FONT.heading
        });
        if (def.bullets && def.bullets.length > 0) {
          slide.addText(toTextProps(def.bullets, { bullet: true }), {
            x: 0.7, y: 1.5, w: "86%", h: 5.0,
            fontSize: 18,
            fontFace: C.FONT.body, valign: "top",
            lineSpacing: 30
          });
        }
        break;
      }

      // ---- SUMMARY SLIDE ----
      case "summary": {
        const slide = pptx.addSlide();
        slide.background = { fill: C.COLOURS.primary };
        slide.addText(def.title, {
          x: 1, y: 0.8, w: "80%", h: 1.0,
          fontSize: 36, bold: true, color: "FFFFFF",
          align: "center", fontFace: C.FONT.heading
        });
        if (def.bullets && def.bullets.length > 0) {
          slide.addText(toTextProps(def.bullets, { bullet: true, color: "FFFFFF" }), {
            x: 1.5, y: 2.2, w: "70%", h: 4.0,
            fontSize: 20,
            fontFace: C.FONT.body, valign: "top",
            lineSpacing: 28
          });
        }
        break;
      }

      // ---- CUSTOM SLIDE ----
      case "custom": {
        const slide = pptx.addSlide();
        if (typeof def.render === 'function') {
          def.render(slide, H);
        }
        break;
      }

      default:
        console.warn(`  ⚠ Unknown slide type: "${def.type}" — skipping`);
    }
  } catch (err) {
    console.error(`  ✗ Error rendering slide ${slideNum} (type: ${def.type}): ${err.message}`);
    // Create a fallback error slide
    const slide = pptx.addSlide();
    slide.addText(`⚠ Slide ${slideNum} Error`, {
      x: 1, y: 2, w: 8, h: 1, fontSize: 24, color: "C00000", align: "center"
    });
    slide.addText(err.message, {
      x: 1, y: 3.5, w: 8, h: 2, fontSize: 14, color: "595959", align: "center"
    });
  }
}

// ============================================================
// ASSEMBLE & BUILD
// ============================================================

const contentDir = config.contentDir || './content';
const allSlideDefs = loadContentModules(contentDir);

const pptx = new PptxGenJS();

// Set presentation properties
pptx.author = config.creator || "Teaching Resource Builder";
pptx.company = config.creator || "";
pptx.subject = config.title || "Teaching Resource";
pptx.title = config.title || "Untitled Resource";

// Set slide size
if (config.landscape) {
  // Landscape for PPTX is the default widescreen — keep as is
  // Actually "landscape" in PPTX is always landscape. We interpret:
  // landscape=false → standard 4:3 (10x7.5)
  // landscape=true  → widescreen 16:9 (13.33x7.5)
  pptx.defineLayout({ name: "CUSTOM", width: C.SLIDE.widescreen.w, height: C.SLIDE.widescreen.h });
  pptx.layout = "CUSTOM";
} else {
  pptx.defineLayout({ name: "CUSTOM", width: C.SLIDE.standard.w, height: C.SLIDE.standard.h });
  pptx.layout = "CUSTOM";
}

// Render all slides
allSlideDefs.forEach((def, i) => {
  renderSlide(pptx, def, i + 1);
});

// Write output
const outputPath = config.outputFile || './output/resource.pptx';
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

pptx.writeFile({ fileName: outputPath })
  .then(() => {
    console.log(`✓ Done → ${outputPath}`);
    console.log(`  ${allSlideDefs.length} slides generated.\n`);
  })
  .catch(err => {
    console.error(`✗ Build failed: ${err.message}`);
    process.exit(1);
  });
