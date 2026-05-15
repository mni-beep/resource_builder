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
 * Also handles richBullet format: { runs: [...] } → unpacked into text array.
 */
function toTextProps(items, defaultOpts = {}) {
  if (!Array.isArray(items)) return items;
  const out = [];
  for (const item of items) {
    if (typeof item === 'string') {
      out.push({ text: item, options: { ...defaultOpts } });
    } else if (item && typeof item.runs === 'object' && !Array.isArray(item.runs)) {
      // Single richRun object: { text, bold?, italic?, color?, fontSize? }
      const r = item.runs;
      out.push({ text: r.text || '', options: { ...defaultOpts, bold: r.bold, italic: r.italic, color: r.color, fontSize: r.fontSize } });
    } else if (item && Array.isArray(item.runs)) {
      // richBullet format: { runs: [{ text, bold?, italic?, color?, fontSize? }] }
      for (const r of item.runs) {
        out.push({ text: r.text || '', options: { ...defaultOpts, bold: r.bold, italic: r.italic, color: r.color, fontSize: r.fontSize } });
      }
    } else if (item && typeof item.text === 'string') {
      out.push({ text: item.text, options: { ...defaultOpts, ...(item.options || {}) } });
    } else {
      out.push({ text: String(item), options: { ...defaultOpts } });
    }
  }
  return out;
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
  const { validateContentArray } = require('./tools/validate');
  validateContentArray(allSlides, "slide",
    "e5LessonPlan(), linedAnswerSpace()");

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

// ============================================================
// CHROME RENDERER — adds corner marks, lesson chips, footers
// ============================================================

function renderChrome(slide, def, slideNum, totalSlides, slideW) {
  const ch = def.chrome;
  if (!ch) return;
  const sw = slideW || 10;  // default to 10" for backward compatibility

  // Corner mark (top-right bracket) — positioned relative to slide width
  if (ch.cornerMark) {
    const cm = C.CHROME.cornerMark;
    const x = sw - 0.45, y = 0.25;
    slide.addShape("rect", { x, y, w: cm.w, h: cm.h, fill: { color: cm.color }, line: { color: cm.color, width: 0 } });
    slide.addShape("rect", { x: x + cm.w + cm.gap, y, w: cm.h, h: cm.w, fill: { color: cm.color }, line: { color: cm.color, width: 0 } });
  }

  // Lesson chip (top-left)
  if (ch.lessonNum) {
    const lc = C.CHROME.lessonChip;
    slide.addText(`LESSON ${ch.lessonNum}`, {
      x: 0.5, y: 0.27, w: 1.2, h: 0.28,
      fontSize: lc.fontSize, fontFace: lc.fontFace, bold: lc.bold,
      color: lc.color, charSpacing: lc.charSpacing,
      align: "left", valign: "middle", margin: 0
    });
    if (ch.lessonTitle) {
      slide.addText(ch.lessonTitle, {
        x: 1.7, y: 0.27, w: sw - 3.0, h: 0.28,
        fontSize: 10, fontFace: C.FONT.body, color: C.COLOURS.muted, charSpacing: 1,
        align: "left", valign: "middle", margin: 0
      });
    }
    // Thin separator under header
    slide.addShape("line", { x: 0.5, y: 0.62, w: sw - 1.0, h: 0,
      line: { color: C.COLOURS.rule, width: 0.75 } });
  }

  // Footer
  if (ch.footer) {
    const ft = C.CHROME.footer;
    const footerText = ch.footerText || "";
    slide.addText(footerText, {
      x: 0.5, y: 5.32, w: sw - 4.0, h: 0.22,
      fontSize: ft.fontSize, fontFace: ft.fontFace, color: ft.color, italic: ft.italic,
      align: "left", valign: "middle", margin: 0
    });
    slide.addText(`${slideNum} / ${totalSlides || '?'}`, {
      x: sw - 1.3, y: 5.32, w: 1.0, h: 0.22,
      fontSize: ft.fontSize, fontFace: ft.fontFace, color: ft.color,
      align: "right", valign: "middle", margin: 0
    });
  }

  // Speaker notes — build single notes string (pptxgenjs addNotes REPLACES, not appends)
  // Prefer def._notesText (pre-built by the renderer) over raw def.notes
  if (def._notesText) {
    slide.addNotes(def._notesText);
  } else if (def.notes) {
    slide.addNotes(def.notes);
  }
}

function renderSlide(pptx, def, slideNum, totalSlides, slideW, slideH) {
  const sw = slideW || 10;
  const sh = slideH || 7.5;
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
            autoPage: def.autoPage !== false  // auto-paginate large tables by default
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

      // ---- CHART SLIDE ----
      case "chart": {
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
        if (def.data && def.data.length > 0) {
          slide.addChart(pptx.ChartType[def.chartType] || pptx.ChartType.bar, def.data, {
            x: def.position ? def.position.x || 1.0 : 1.0,
            y: def.position ? def.position.y || 1.3 : 1.3,
            w: def.size ? def.size.w || 11.3 : 11.3,
            h: def.size ? def.size.h || 5.5 : 5.5,
            showLegend: def.showLegend,
            showTitle: def.showTitle,
            catAxisLabel: def.catAxisLabel || "",
            valAxisLabel: def.valAxisLabel || "",
            catAxisLabelColor: "333333",
            valAxisLabelColor: "333333",
          });
        }
        if (def.notes) slide.addNotes(def.notes);
        break;
      }

      // ---- SHAPE SLIDE ----
      case "shape": {
        const slide = pptx.addSlide();
        if (def.title) {
          slide.addText(def.title, {
            x: 0.5, y: 0.3, w: "90%", h: 0.7,
            fontSize: 28, bold: true, color: C.COLOURS.primary,
            fontFace: C.FONT.heading
          });
          slide.addShape(pptx.ShapeType.rect, {
            x: 0.5, y: 1.05, w: "90%", h: 0.04,
            fill: { color: C.COLOURS.primary }
          });
        }
        if (def.shapes && def.shapes.length > 0) {
          for (const sh of def.shapes) {
            const shapeName = pptx.shapes[sh.name] || pptx.ShapeType[sh.name] || sh.name;
            slide.addShape(shapeName, {
              ...sh.options,
              shapeName: sh.options?.shapeName || undefined,
            });
          }
        }
        if (def.notes) slide.addNotes(def.notes);
        break;
      }

      // ---- AUDIO SLIDE ----
      case "audio": {
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
        if (def.audio) {
          const audioOpts = {
            type: "audio",
            path: def.audio,
            x: def.position ? def.position.x || 1.0 : 1.0,
            y: def.position ? def.position.y || 1.5 : 1.5,
            w: def.position ? def.position.w || 11.3 : 11.3,
            h: def.position ? def.position.h || 2.0 : 2.0,
          };
          if (def.cover) audioOpts.cover = def.cover;
          slide.addMedia(audioOpts);
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
        // Build single notes string (pptxgenjs addNotes REPLACES, not appends)
        const nytNotes = [];
        if (def.answers && def.answers.length > 0) {
          nytNotes.push("👇 ANSWERS (for teacher):\n" + def.answers.map((a, i) => `  ${i + 1}. ${a}`).join('\n'));
        }
        if (def.notes) nytNotes.push(def.notes);
        if (nytNotes.length > 0) slide.addNotes(nytNotes.join('\n\n'));
        slide.addText("Try this on your own. Check your answers with your teacher.", {
          x: 0.7, y: 4.5, w: "86%", h: 0.5,
          fontSize: 14, italic: true, color: C.COLOURS.greyText,
          fontFace: C.FONT.body
        });
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
        // Answer + notes in speaker notes (single addNotes call — pptxgenjs replaces)
        const mcNotes = [];
        if (def.answer) mcNotes.push(`✓ Answer: ${def.answer}`);
        if (def.notes) mcNotes.push(def.notes);
        if (mcNotes.length > 0) slide.addNotes(mcNotes.join('\n\n'));
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
        let contentY = 2.0;
        if (def.planningSteps && def.planningSteps.length > 0) {
          const steps = def.planningSteps.map((s, i) => `Step ${i + 1}: ${s}`);
          slide.addText(toTextProps(steps, { bullet: true }), {
            x: 0.7, y: contentY, w: "86%", h: 2.0,
            fontSize: 14,
            fontFace: C.FONT.body, valign: "top",
            lineSpacing: 20
          });
          contentY += def.planningSteps.length * 0.4 + 0.3;
        }
        // Sentence starters (rendered below planning steps)
        if (def.sentenceStarters && def.sentenceStarters.length > 0) {
          slide.addText("Sentence starters:", {
            x: 0.7, y: contentY, w: "86%", h: 0.4,
            fontSize: 13, bold: true, italic: true, color: C.COLOURS.greyText,
            fontFace: C.FONT.body
          });
          contentY += 0.4;
          const starterItems = def.sentenceStarters.map(s => typeof s === 'string' ? s : s.text || '');
          slide.addText(toTextProps(starterItems, { bullet: true }), {
            x: 0.9, y: contentY, w: "82%", h: 2.0,
            fontSize: 13, italic: true, color: C.COLOURS.greyText,
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
        if (def.notes) slide.addNotes(def.notes);
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
        if (def.notes) slide.addNotes(def.notes);
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
        if (def.notes) slide.addNotes(def.notes);
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
        if (def.notes) slide.addNotes(def.notes);
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
        if (def.notes) slide.addNotes(def.notes);
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
        if (def.notes) slide.addNotes(def.notes);
        break;
      }

      // ---- CUSTOM SLIDE ----
      case "custom": {
        const slide = pptx.addSlide();
        if (typeof def.render === 'function') {
          def.render(slide, H);
        }
        // Skip renderChrome for E5 slides and others that set chrome === false
        if (def.chrome !== false) {
          renderChrome(slide, def, slideNum, totalSlides, sw);
        }
        break;
      }

      // ============================================================
      // RICH LAYOUT SLIDES (Claude-inspired)
      // ============================================================

      // ---- LESSON TITLE SLIDE (dark cover) ----
      case "lessonTitle": {
        const slide = pptx.addSlide();
        slide.background = { fill: C.COLOURS.navy };

        // Decorative grid — spans full slide width
        const gridCols = Math.ceil(sw);
        for (let i = 0; i < gridCols + 1; i++) {
          slide.addShape("line", { x: i * 1.0, y: 0, w: 0, h: sh,
            line: { color: def.accentColor || C.COLOURS.cyan, width: 0.4, transparency: 85 } });
        }
        const gridRows = Math.ceil(sh);
        for (let j = 0; j < gridRows; j++) {
          slide.addShape("line", { x: 0, y: j * 1.0, w: sw, h: 0,
            line: { color: def.accentColor || C.COLOURS.cyan, width: 0.4, transparency: 85 } });
        }

        // Lesson chip
        slide.addShape("rect", { x: 0.6, y: 0.6, w: 1.7, h: 0.4,
          fill: { color: def.accentColor || C.COLOURS.cyan }, line: { color: def.accentColor || C.COLOURS.cyan, width: 0 } });
        slide.addText(`LESSON ${String(def.lessonNum).padStart(2, '0')}`, {
          x: 0.6, y: 0.6, w: 1.7, h: 0.4,
          fontSize: 12, fontFace: C.FONT.heading, color: C.COLOURS.white, bold: true, charSpacing: 4,
          align: "center", valign: "middle", margin: 0
        });

        // Big title
        slide.addText(def.title, {
          x: 0.6, y: 1.2, w: sw - 1.2, h: 1.0,
          fontSize: 44, fontFace: C.FONT.heading, color: C.COLOURS.white, bold: true, margin: 0
        });

        // Hook
        if (def.hook) {
          slide.addText("HOOK", {
            x: 0.6, y: 2.6, w: 1, h: 0.25,
            fontSize: 10, fontFace: C.FONT.heading, color: C.COLOURS.amber, bold: true, charSpacing: 4, margin: 0
          });
          slide.addText(def.hook, {
            x: 0.6, y: 2.9, w: 5.6, h: 1.5,
            fontSize: 22, fontFace: C.FONT.heading, color: C.COLOURS.white, bold: true,
            lineSpacingMultiple: 1.15, margin: 0
          });
        }
        if (def.hookSubtitle) {
          slide.addText(def.hookSubtitle, {
            x: 0.6, y: 4.4, w: 5.6, h: 0.5,
            fontSize: 14, fontFace: C.FONT.body, color: C.COLOURS.cyanLight, italic: true, margin: 0
          });
        }

        // Timing
        if (def.timing) {
          slide.addText(def.timing, {
            x: 0.6, y: 5.32, w: 5, h: 0.22,
            fontSize: 9, fontFace: C.FONT.body, color: def.accentColor || C.COLOURS.cyan, charSpacing: 3, margin: 0
          });
        }
        slide.addText(`${slideNum} / ${totalSlides || '?'}`, {
          x: sw - 1.3, y: 5.32, w: 1.0, h: 0.22,
          fontSize: 9, fontFace: C.FONT.body, color: C.COLOURS.cyanLight, align: "right", margin: 0
        });
        if (def.notes) slide.addNotes(def.notes);
        break;
      }

      // ---- ROADMAP SLIDE (week-ahead overview) ----
      case "roadmap": {
        const slide = pptx.addSlide();
        slide.background = { fill: C.COLOURS.white };
        // Corner mark
        const cm = C.CHROME.cornerMark;
        const cmX = sw - 0.45;
        slide.addShape("rect", { x: cmX, y: 0.25, w: cm.w, h: cm.h, fill: { color: cm.color }, line: { color: cm.color, width: 0 } });
        slide.addShape("rect", { x: cmX + cm.w + cm.gap, y: 0.25, w: cm.h, h: cm.w, fill: { color: cm.color }, line: { color: cm.color, width: 0 } });

        // Eyebrow
        if (def.eyebrow) {
          slide.addText(def.eyebrow, {
            x: 0.5, y: 0.45, w: 8, h: 0.3,
            fontSize: 11, fontFace: C.FONT.heading, color: C.COLOURS.cyan, bold: true, charSpacing: 6, margin: 0
          });
        }
        // Title
        slide.addText(def.title, {
          x: 0.5, y: 0.78, w: 9, h: 0.7,
          fontSize: 30, fontFace: C.FONT.heading, color: C.COLOURS.navy, bold: true, margin: 0
        });

        // Cards
        const cards = def.cards || [];
        const cardW = 2.85, cardH = 3.1, gap = 0.225;
        const startX = 0.5;
        cards.forEach((c, i) => {
          const x = startX + i * (cardW + gap);
          const y = 1.75;
          // Card body
          slide.addShape("rect", { x, y, w: cardW, h: cardH,
            fill: { color: C.COLOURS.white }, line: { color: C.COLOURS.rule, width: 1 },
            shadow: C.softShadow() });
          // Top accent strip
          slide.addShape("rect", { x, y, w: cardW, h: 0.08,
            fill: { color: C.COLOURS.cyan }, line: { color: C.COLOURS.cyan, width: 0 } });
          // Big number
          slide.addText(c.n, {
            x: x + 0.3, y: y + 0.25, w: 1.4, h: 0.9,
            fontSize: 56, fontFace: C.FONT.heading, color: C.COLOURS.cyan, bold: true, margin: 0, valign: "top"
          });
          // Icon (if available)
          if (c.icon) {
            const iconData = typeof c.icon === 'string' ? C.icon(c.icon) : c.icon;
            if (iconData) {
              slide.addImage({ data: iconData, x: x + cardW - 0.85, y: y + 0.35, w: 0.55, h: 0.55 });
            }
          }
          // Title
          slide.addText(c.title, {
            x: x + 0.3, y: y + 1.35, w: cardW - 0.6, h: 0.85,
            fontSize: 17, fontFace: C.FONT.heading, color: C.COLOURS.navy, bold: true, margin: 0
          });
          // Subtitle
          slide.addText(c.sub, {
            x: x + 0.3, y: y + 2.25, w: cardW - 0.6, h: 0.7,
            fontSize: 12, fontFace: C.FONT.body, color: C.COLOURS.muted, margin: 0
          });
        });

        // Takeaway
        if (def.takeaway) {
          slide.addText(def.takeaway, {
            x: 0.5, y: 5.05, w: 9, h: 0.3,
            fontSize: 12, fontFace: C.FONT.body, color: C.COLOURS.navy, italic: true, margin: 0
          });
        }
        // Footer
        slide.addText("", { x: 0.5, y: 5.32, w: sw - 4.0, h: 0.22, fontSize: 9, fontFace: C.FONT.body, color: C.COLOURS.muted, italic: true, margin: 0 });
        slide.addText(`${slideNum} / ${totalSlides || '?'}`, { x: sw - 1.3, y: 5.32, w: 1.0, h: 0.22, fontSize: 9, fontFace: C.FONT.body, color: C.COLOURS.muted, align: "right", margin: 0 });
        if (def.notes) slide.addNotes(def.notes);
        break;
      }

      // ---- NUMBERED INTENTS SLIDE ----
      case "numberedIntents": {
        const slide = pptx.addSlide();
        slide.background = { fill: C.COLOURS.white };
        // Corner mark
        const cm = C.CHROME.cornerMark;
        slide.addShape("rect", { x: sw - 0.45, y: 0.25, w: cm.w, h: cm.h, fill: { color: cm.color }, line: { color: cm.color, width: 0 } });
        slide.addShape("rect", { x: sw - 0.29, y: 0.25, w: cm.h, h: cm.w, fill: { color: cm.color }, line: { color: cm.color, width: 0 } });

        renderChrome(slide, def, slideNum, totalSlides, sw);

        slide.addText(def.title, {
          x: 0.5, y: 0.85, w: sw - 1.0, h: 0.6,
          fontSize: 28, fontFace: C.FONT.heading, color: C.COLOURS.navy, bold: true, margin: 0
        });

        const intents = def.intents || [];
        const ix = 0.5, iy = 1.85, iw = 9.0, ih = 0.85;
        intents.forEach((it, i) => {
          const y = iy + i * (ih + 0.2);
          slide.addShape("rect", { x: ix, y, w: iw, h: ih,
            fill: { color: C.COLOURS.paleBg }, line: { color: C.COLOURS.rule, width: 0 } });
          // Number band
          slide.addShape("rect", { x: ix, y, w: 1.1, h: ih,
            fill: { color: C.COLOURS.cyan }, line: { color: C.COLOURS.cyan, width: 0 } });
          slide.addText(it.num, {
            x: ix, y, w: 1.1, h: ih,
            fontSize: 28, fontFace: C.FONT.heading, color: C.COLOURS.white, bold: true,
            align: "center", valign: "middle", margin: 0
          });
          slide.addText(it.text, {
            x: ix + 1.35, y, w: iw - 1.55, h: ih,
            fontSize: 18, fontFace: C.FONT.heading, color: C.COLOURS.navy,
            valign: "middle", margin: 0
          });
        });

        if (def.timing) {
          slide.addText(def.timing, {
            x: 0.5, y: 4.85, w: 9, h: 0.3,
            fontSize: 11, fontFace: C.FONT.body, color: C.COLOURS.muted, italic: true, margin: 0
          });
        }
        if (def.notes) slide.addNotes(def.notes);
        break;
      }

      // ---- COMPARISON COLUMNS SLIDE ----
      case "comparisonColumns": {
        const slide = pptx.addSlide();
        slide.background = { fill: C.COLOURS.white };
        renderChrome(slide, def, slideNum, totalSlides, sw);

        slide.addText(def.title, {
          x: 0.5, y: 0.85, w: sw - 1.0, h: 0.6,
          fontSize: 26, fontFace: C.FONT.heading, color: C.COLOURS.navy, bold: true, margin: 0
        });

        const colW = 4.3, colH = 3.0, colY = 2.0;
        [def.left, def.right].forEach((col, ci) => {
          const x = ci === 0 ? 0.5 : 5.2;
          const isWinner = col.winner;
          slide.addShape("rect", { x, y: colY, w: colW, h: colH,
            fill: { color: C.COLOURS.white },
            line: { color: isWinner ? C.COLOURS.cyan : C.COLOURS.rule, width: isWinner ? 2 : 1 },
            shadow: C.softShadow() });
          // Header bar
          slide.addShape("rect", { x, y: colY, w: colW, h: 0.55,
            fill: { color: isWinner ? C.COLOURS.cyan : C.COLOURS.amberLight },
            line: { color: "FFFFFF", width: 0 } });
          slide.addText(col.header || "", {
            x, y: colY, w: colW, h: 0.55,
            fontSize: 14, fontFace: C.FONT.heading,
            color: isWinner ? C.COLOURS.white : C.COLOURS.navy,
            bold: true, charSpacing: 2,
            align: "center", valign: "middle", margin: 0
          });
          // Big text
          if (col.bigText) {
            slide.addText(col.bigText, {
              x, y: colY + 0.7, w: colW, h: 0.7,
              fontSize: 38, fontFace: C.FONT.heading,
              color: isWinner ? C.COLOURS.cyan : C.COLOURS.muted,
              bold: true, align: "center", margin: 0
            });
          }
          if (col.bigSub) {
            slide.addText(col.bigSub, {
              x, y: colY + 1.45, w: colW, h: 0.4,
              fontSize: 14, fontFace: C.FONT.body,
              color: isWinner ? C.COLOURS.cyan : C.COLOURS.muted,
              italic: true, align: "center", margin: 0
            });
          }
          if (col.detailBullets && col.detailBullets.length > 0) {
            slide.addText(col.detailBullets.map(b => ({ text: b, options: { bullet: true, fontSize: 12 } })), {
              x: x + 0.1, y: colY + 2.05, w: colW - 0.2, h: 0.85,
              fontFace: C.FONT.body, color: C.COLOURS.navy, align: "center",
              valign: "top", paraSpaceAfter: 2
            });
          }
        });

        if (def.bottomRule) {
          slide.addShape("rect", { x: 0.5, y: 5.1, w: 9, h: 0.3,
            fill: { color: C.COLOURS.amberLight }, line: { color: C.COLOURS.amberLight, width: 0 } });
          slide.addText(def.bottomRule, {
            x: 0.5, y: 5.1, w: 9, h: 0.3,
            fontSize: 12, fontFace: C.FONT.heading, color: C.COLOURS.navy, bold: true,
            align: "center", valign: "middle", margin: 0
          });
        }
        if (def.notes) slide.addNotes(def.notes);
        break;
      }

      // ---- MCQ CARD SLIDE ----
      case "mcqCard": {
        const slide = pptx.addSlide();
        slide.background = { fill: C.COLOURS.white };
        renderChrome(slide, def, slideNum, totalSlides, sw);

        if (def.eyebrow) {
          slide.addText(def.eyebrow, {
            x: 0.5, y: 0.85, w: 6, h: 0.3,
            fontSize: 11, fontFace: C.FONT.heading, color: C.COLOURS.cyan, bold: true, charSpacing: 5, margin: 0
          });
        }
        slide.addText(def.stem, {
          x: 0.5, y: 1.18, w: 9, h: 0.6,
          fontSize: 24, fontFace: C.FONT.heading, color: C.COLOURS.navy, bold: true, margin: 0
        });

        const opts = def.options || [];
        const ow = 4.3, oh = 1.3, ogap = 0.25;
        const baseX = 0.5, baseY = 2.0;
        opts.forEach((o, i) => {
          const col = i % 2, row = Math.floor(i / 2);
          const x = baseX + col * (ow + ogap);
          const y = baseY + row * (oh + ogap);
          slide.addShape("rect", { x, y, w: ow, h: oh,
            fill: { color: C.COLOURS.white },
            line: { color: o.correct ? C.COLOURS.cyan : C.COLOURS.rule, width: o.correct ? 2.5 : 1 },
            shadow: C.softShadow() });
          // Letter chip
          slide.addShape("rect", { x, y, w: 0.6, h: oh,
            fill: { color: o.correct ? C.COLOURS.cyan : C.COLOURS.paleBg }, line: { color: "FFFFFF", width: 0 } });
          slide.addText(o.letter, {
            x, y, w: 0.6, h: oh,
            fontSize: 28, fontFace: C.FONT.heading,
            color: o.correct ? C.COLOURS.white : C.COLOURS.muted,
            bold: true, align: "center", valign: "middle", margin: 0
          });
          slide.addText(o.text, {
            x: x + 0.8, y: y + 0.18, w: ow - 1.0, h: 0.5,
            fontSize: 20, fontFace: C.FONT.heading, color: C.COLOURS.navy, bold: true, margin: 0
          });
          if (o.why) {
            slide.addText(o.correct ? `✓ correct  ·  ${o.why}` : o.why, {
              x: x + 0.8, y: y + 0.72, w: ow - 1.0, h: 0.4,
              fontSize: 11, fontFace: C.FONT.body,
              color: o.correct ? C.COLOURS.green : C.COLOURS.muted, italic: true, margin: 0
            });
          }
        });
        if (def.notes) slide.addNotes(def.notes);
        break;
      }

      // ---- PROCESS STEPS SLIDE ----
      case "processSteps": {
        const slide = pptx.addSlide();
        slide.background = { fill: C.COLOURS.white };
        renderChrome(slide, def, slideNum, totalSlides, sw);

        slide.addText(def.title, {
          x: 0.5, y: 0.85, w: sw - 1.0, h: 0.55,
          fontSize: 26, fontFace: C.FONT.heading, color: C.COLOURS.navy, bold: true, margin: 0
        });
        if (def.subtitle) {
          slide.addText(def.subtitle, {
            x: 0.5, y: 1.4, w: 9, h: 0.35,
            fontSize: 13, fontFace: C.FONT.body, color: C.COLOURS.muted, italic: true, margin: 0
          });
        }

        const steps = def.steps || [];
        if (def.layout === "horizontal") {
          // Horizontal step strip
          const sw = 2.0, sh = 1.55, sgap = 0.2;
          const startX = 0.5, stepY = 2.0;
          steps.forEach((st, i) => {
            const x = startX + i * (sw + sgap);
            slide.addShape("rect", { x, y: stepY, w: sw, h: sh,
              fill: { color: C.COLOURS.paleBg }, line: { color: C.COLOURS.rule, width: 0 } });
            // Number circle
            slide.addShape("ellipse", { x: x + 0.15, y: stepY + 0.15, w: 0.5, h: 0.5,
              fill: { color: C.COLOURS.cyan }, line: { color: C.COLOURS.cyan, width: 0 } });
            slide.addText(st.n || String(i + 1), {
              x: x + 0.15, y: stepY + 0.15, w: 0.5, h: 0.5,
              fontSize: 18, fontFace: C.FONT.heading, color: C.COLOURS.white, bold: true,
              align: "center", valign: "middle", margin: 0
            });
            slide.addText(st.title || st.t || "", {
              x: x + 0.15, y: stepY + 0.75, w: sw - 0.3, h: 0.3,
              fontSize: 14, fontFace: C.FONT.heading, color: C.COLOURS.navy, bold: true, margin: 0
            });
            slide.addText(st.desc || st.d || "", {
              x: x + 0.15, y: stepY + 1.05, w: sw - 0.3, h: 0.45,
              fontSize: 10, fontFace: C.FONT.body, color: C.COLOURS.muted, margin: 0
            });
            // Arrow between
            if (i < steps.length - 1 && C.icon("arrow")) {
              slide.addImage({ data: C.icon("arrow"), x: x + sw + 0.04, y: stepY + sh/2 - 0.07, w: 0.14, h: 0.14 });
            }
          });
        } else {
          // Vertical list
          const sx = 0.5, sy = 1.95, sw2 = 9, sh2 = 0.58, sgap2 = 0.07;
          steps.forEach((st, i) => {
            const y = sy + i * (sh2 + sgap2);
            slide.addShape("rect", { x: sx, y, w: sw2, h: sh2,
              fill: { color: i % 2 === 0 ? C.COLOURS.paleBg : C.COLOURS.white },
              line: { color: C.COLOURS.rule, width: 0 } });
            slide.addShape("ellipse", { x: sx + 0.15, y: y + 0.1, w: 0.4, h: 0.4,
              fill: { color: C.COLOURS.cyan }, line: { color: C.COLOURS.cyan, width: 0 } });
            slide.addText(String(i + 1), {
              x: sx + 0.15, y: y + 0.1, w: 0.4, h: 0.4,
              fontSize: 14, fontFace: C.FONT.heading, color: C.COLOURS.white, bold: true,
              align: "center", valign: "middle", margin: 0
            });
            slide.addText(st.title || st.t || "", {
              x: sx + 0.7, y: y + 0.05, w: 5.0, h: 0.3,
              fontSize: 14, fontFace: C.FONT.heading, color: C.COLOURS.navy, bold: true, valign: "middle", margin: 0
            });
            slide.addText(st.desc || st.d || "", {
              x: sx + 0.7, y: y + 0.3, w: sw2 - 0.85, h: 0.25,
              fontSize: 11, fontFace: C.FONT.body, color: C.COLOURS.muted, margin: 0
            });
          });
        }
        if (def.notes) slide.addNotes(def.notes);
        break;
      }

      // ---- STEP STRIP SLIDE (worked example steps) ----
      case "stepStrip": {
        const slide = pptx.addSlide();
        slide.background = { fill: C.COLOURS.white };
        renderChrome(slide, def, slideNum, totalSlides, sw);

        if (def.eyebrow) {
          slide.addText(def.eyebrow, {
            x: 0.5, y: 0.85, w: 5, h: 0.3,
            fontSize: 11, fontFace: C.FONT.heading, color: C.COLOURS.amber, bold: true, charSpacing: 5, margin: 0
          });
        }
        slide.addText(def.title, {
          x: 0.5, y: 1.15, w: 9, h: 0.5,
          fontSize: 22, fontFace: C.FONT.heading, color: C.COLOURS.navy, bold: true, margin: 0
        });

        const steps = def.steps || [];
        const sw = 2.0, sh = 1.55, sgap = 0.2;
        const startX = 0.5, stepY = 1.9;
        steps.forEach((st, i) => {
          const x = startX + i * (sw + sgap);
          slide.addShape("rect", { x, y: stepY, w: sw, h: sh,
            fill: { color: C.COLOURS.paleBg }, line: { color: C.COLOURS.rule, width: 0 } });
          slide.addShape("ellipse", { x: x + 0.15, y: stepY + 0.15, w: 0.5, h: 0.5,
            fill: { color: C.COLOURS.cyan }, line: { color: C.COLOURS.cyan, width: 0 } });
          slide.addText(st.n || String(i + 1), {
            x: x + 0.15, y: stepY + 0.15, w: 0.5, h: 0.5,
            fontSize: 18, fontFace: C.FONT.heading, color: C.COLOURS.white, bold: true,
            align: "center", valign: "middle", margin: 0
          });
          slide.addText(st.t || st.title || "", {
            x: x + 0.15, y: stepY + 0.75, w: sw - 0.3, h: 0.3,
            fontSize: 14, fontFace: C.FONT.heading, color: C.COLOURS.navy, bold: true, margin: 0
          });
          slide.addText(st.d || st.desc || "", {
            x: x + 0.15, y: stepY + 1.05, w: sw - 0.3, h: 0.45,
            fontSize: 10, fontFace: C.FONT.body, color: C.COLOURS.muted, margin: 0
          });
          if (i < steps.length - 1 && C.icon("arrow")) {
            slide.addImage({ data: C.icon("arrow"), x: x + sw + 0.04, y: stepY + sh/2 - 0.07, w: 0.14, h: 0.14 });
          }
        });

        // Callout box
        if (def.calloutBox) {
          const cb = def.calloutBox;
          slide.addShape("rect", { x: 0.5, y: 3.7, w: 9, h: 1.3,
            fill: { color: C.COLOURS.amberLight }, line: { color: C.COLOURS.amberLight, width: 0 } });
          slide.addShape("rect", { x: 0.5, y: 3.7, w: 0.08, h: 1.3,
            fill: { color: C.COLOURS.amber }, line: { color: C.COLOURS.amber, width: 0 } });
          if (C.icon("warning")) {
            slide.addImage({ data: C.icon("warning"), x: 0.75, y: 3.85, w: 0.4, h: 0.4 });
          }
          slide.addText(cb.title || "", {
            x: 1.3, y: 3.78, w: 7, h: 0.32,
            fontSize: 13, fontFace: C.FONT.heading, color: C.COLOURS.navy, bold: true, charSpacing: 1, margin: 0
          });
          slide.addText(cb.text || "", {
            x: 1.3, y: 4.13, w: 8.0, h: 0.8,
            fontSize: 13, fontFace: C.FONT.body, color: C.COLOURS.navy, margin: 0
          });
        }
        if (def.notes) slide.addNotes(def.notes);
        break;
      }

      // ---- TASK CARDS SLIDE ----
      case "taskCards": {
        const slide = pptx.addSlide();
        slide.background = { fill: C.COLOURS.white };
        renderChrome(slide, def, slideNum, totalSlides, sw);

        if (def.eyebrow) {
          slide.addText(def.eyebrow, {
            x: 0.5, y: 0.85, w: sw - 1.0, h: 0.3,
            fontSize: 11, fontFace: C.FONT.heading, color: C.COLOURS.cyan, bold: true, charSpacing: 5, margin: 0
          });
        }
        slide.addText(def.title, {
          x: 0.5, y: 1.18, w: 9, h: 0.55,
          fontSize: 22, fontFace: C.FONT.heading, color: C.COLOURS.navy, bold: true, margin: 0
        });

        const tasks = def.tasks || [];
        const tw = 2.85, th = 2.55, tx = 0.5, ty = 1.95, tgap = 0.225;
        tasks.forEach((t, i) => {
          const x = tx + i * (tw + tgap);
          slide.addShape("rect", { x, y: ty, w: tw, h: th,
            fill: { color: C.COLOURS.white }, line: { color: C.COLOURS.rule, width: 1 },
            shadow: C.softShadow() });
          // Top accent
          slide.addShape("rect", { x, y: ty, w: tw, h: 0.06,
            fill: { color: C.COLOURS.amber }, line: { color: C.COLOURS.amber, width: 0 } });
          // Emoji
          if (t.emoji) {
            slide.addText(t.emoji, {
              x: x + 0.2, y: ty + 0.2, w: 0.8, h: 0.8,
              fontSize: 38, margin: 0
            });
          }
          // Time chip
          if (t.time) {
            slide.addShape("rect", { x: x + tw - 1.0, y: ty + 0.25, w: 0.85, h: 0.3,
              fill: { color: C.COLOURS.paleBg }, line: { color: C.COLOURS.rule, width: 0 } });
            slide.addText(t.time, {
              x: x + tw - 1.0, y: ty + 0.25, w: 0.85, h: 0.3,
              fontSize: 10, fontFace: C.FONT.heading, color: C.COLOURS.cyan, bold: true,
              align: "center", valign: "middle", margin: 0
            });
          }
          // Title
          slide.addText(t.title, {
            x: x + 0.2, y: ty + 1.1, w: tw - 0.4, h: 0.4,
            fontSize: 18, fontFace: C.FONT.heading, color: C.COLOURS.navy, bold: true, margin: 0
          });
          // Description
          slide.addText(t.steps || t.desc || "", {
            x: x + 0.2, y: ty + 1.55, w: tw - 0.4, h: 0.95,
            fontSize: 12, fontFace: C.FONT.body, color: C.COLOURS.muted, margin: 0
          });
        });

        // Bottom checklist
        if (def.bottomChecklist) {
          slide.addShape("rect", { x: 0.5, y: 4.7, w: 9.0, h: 0.45,
            fill: { color: C.COLOURS.navy }, line: { color: C.COLOURS.navy, width: 0 } });
          slide.addText(def.bottomChecklist, {
            x: 0.5, y: 4.7, w: 9.0, h: 0.45,
            fontSize: 11, fontFace: C.FONT.heading, color: C.COLOURS.cyanLight, charSpacing: 1,
            align: "center", valign: "middle", margin: 0
          });
        }
        if (def.notes) slide.addNotes(def.notes);
        break;
      }

      // ---- KEY IDEA SLIDE ----
      case "keyIdea": {
        const slide = pptx.addSlide();
        slide.background = { fill: C.COLOURS.white };
        renderChrome(slide, def, slideNum, totalSlides, sw);

        if (def.eyebrow) {
          slide.addText(def.eyebrow, {
            x: 0.5, y: 0.85, w: 5, h: 0.3,
            fontSize: 11, fontFace: C.FONT.heading, color: C.COLOURS.amber, bold: true, charSpacing: 5, margin: 0
          });
        }
        slide.addText(def.title, {
          x: 0.5, y: 1.15, w: 9, h: 0.7,
          fontSize: 36, fontFace: C.FONT.heading, color: C.COLOURS.navy, bold: true, margin: 0
        });

        if (def.definition) {
          slide.addText(def.definition, {
            x: 0.5, y: 1.95, w: 9, h: 0.85,
            fontSize: 17, fontFace: C.FONT.body, color: C.COLOURS.navy, margin: 0
          });
        }

        // Two-column comparison
        const colY2 = 3.0, colH2 = 1.95;
        [def.left, def.right].forEach((col, ci) => {
          const x = ci === 0 ? 0.5 : 5.1;
          const isGood = !col.problem;
          slide.addShape("rect", { x, y: colY2, w: 4.4, h: colH2,
            fill: { color: C.COLOURS.white },
            line: { color: isGood ? C.COLOURS.cyan : C.COLOURS.amber, width: isGood ? 2 : 1.5 } });
          // Header bar
          slide.addShape("rect", { x, y: colY2, w: 4.4, h: 0.4,
            fill: { color: isGood ? C.COLOURS.cyan : C.COLOURS.amberLight },
            line: { color: "FFFFFF", width: 0 } });
          if (!isGood && C.icon("cross")) {
            slide.addImage({ data: C.icon("cross"), x: x + 0.12, y: colY2 + 0.07, w: 0.27, h: 0.27 });
          }
          if (isGood && C.icon("check")) {
            slide.addImage({ data: C.icon("check"), x: x + 0.12, y: colY2 + 0.07, w: 0.27, h: 0.27 });
          }
          slide.addText(col.header || "", {
            x: x + (isGood ? 0.5 : 0.45), y: colY2 + 0.05, w: 3.4, h: 0.3,
            fontSize: 13, fontFace: C.FONT.heading,
            color: isGood ? C.COLOURS.white : C.COLOURS.navy,
            bold: true, valign: "middle", margin: 0
          });
          if (col.bullets && col.bullets.length > 0) {
            slide.addText(col.bullets.map(b => ({ text: b, options: { bullet: true, fontSize: 12 } })), {
              x: x + 0.2, y: colY2 + 0.5, w: 4.0, h: 1.4,
              fontFace: C.FONT.body, color: C.COLOURS.navy, paraSpaceAfter: 4
            });
          }
        });

        if (def.bottomTakeaway) {
          slide.addText(def.bottomTakeaway, {
            x: 0.5, y: 5.1, w: 9, h: 0.3,
            fontSize: 13, fontFace: C.FONT.heading, color: C.COLOURS.cyan, bold: true, italic: true,
            align: "center", margin: 0
          });
        }
        if (def.notes) slide.addNotes(def.notes);
        break;
      }

      // ---- WRAP-UP SLIDE ----
      case "wrapUp": {
        const slide = pptx.addSlide();
        slide.background = { fill: C.COLOURS.navy };

        // Decorative grid — spans full slide width
        const wGridCols = Math.ceil(sw);
        for (let i = 0; i < wGridCols + 1; i++) {
          slide.addShape("line", { x: i * 1.0, y: 0, w: 0, h: sh,
            line: { color: C.COLOURS.cyan, width: 0.4, transparency: 90 } });
        }
        const wGridRows = Math.ceil(sh);
        for (let j = 0; j < wGridRows; j++) {
          slide.addShape("line", { x: 0, y: j * 1.0, w: sw, h: 0,
            line: { color: C.COLOURS.cyan, width: 0.4, transparency: 90 } });
        }

        if (def.eyebrow) {
          slide.addText(def.eyebrow, {
            x: 0.6, y: 0.55, w: sw - 2.0, h: 0.32,
            fontSize: 11, fontFace: C.FONT.heading, color: C.COLOURS.cyan, bold: true, charSpacing: 5, margin: 0
          });
        }
        slide.addText(def.title, {
          x: 0.6, y: 0.95, w: sw - 1.2, h: 0.85,
          fontSize: 38, fontFace: C.FONT.heading, color: C.COLOURS.white, bold: true, margin: 0
        });

        // Takeaways with checkmarks
        const takeaways = def.takeaways || [];
        const ty2 = 2.05;
        takeaways.forEach((t, i) => {
          const y = ty2 + i * 0.55;
          if (C.icon("check")) {
            slide.addImage({ data: C.icon("check"), x: 0.6, y: y + 0.07, w: 0.28, h: 0.28 });
          }
          slide.addText(t, {
            x: 1.0, y, w: sw - 1.8, h: 0.45,
            fontSize: 18, fontFace: C.FONT.heading, color: C.COLOURS.white, valign: "middle", margin: 0
          });
        });

        // Next week banner
        if (def.nextTitle || def.nextText) {
          slide.addShape("rect", { x: 0.6, y: 4.0, w: sw - 1.2, h: 1.15,
            fill: { color: C.COLOURS.amber }, line: { color: C.COLOURS.amber, width: 0 } });
          slide.addText(def.nextTitle, {
            x: 0.85, y: 4.15, w: 4, h: 0.3,
            fontSize: 11, fontFace: C.FONT.heading, color: C.COLOURS.navy, bold: true, charSpacing: 4, margin: 0
          });
          slide.addText(def.nextText, {
            x: 0.85, y: 4.42, w: sw - 1.6, h: 0.65,
            fontSize: 16, fontFace: C.FONT.heading, color: C.COLOURS.navy, bold: true, margin: 0
          });
        }

        slide.addText(`${slideNum} / ${totalSlides || '?'}`, {
          x: sw - 1.3, y: 5.32, w: 1.0, h: 0.22,
          fontSize: 9, fontFace: C.FONT.body, color: C.COLOURS.cyanLight, align: "right", margin: 0
        });
        if (def.notes) slide.addNotes(def.notes);
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

(async () => {
  // Initialize icon system (pre-render icons)
  await C.initIcons();

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
    pptx.defineLayout({ name: "CUSTOM", width: C.SLIDE.widescreen.w, height: C.SLIDE.widescreen.h });
    pptx.layout = "CUSTOM";
  } else {
    pptx.defineLayout({ name: "CUSTOM", width: C.SLIDE.standard.w, height: C.SLIDE.standard.h });
    pptx.layout = "CUSTOM";
  }

  // ── Slide Masters (if defined in config) ──
  if (config.slideMasters && Array.isArray(config.slideMasters)) {
    for (const master of config.slideMasters) {
      const masterDef = C.slideMaster(master);
      pptx.addSlideMaster({
        title: masterDef.title,
        objects: masterDef.objects || [],
        background: masterDef.background || undefined,
        slideNumber: masterDef.slideNumber || undefined,
      });
      console.log(`  🎨 Slide master: ${masterDef.title}`);
    }
  }

  // ── Sections (group slides) ──
  let currentSection = null;
  const renderedSlideDefs = [];  // non-section defs only

  // Render all slides
  const totalSlides = allSlideDefs.filter(d => d.type !== "section").length;
  const slideW = config.landscape ? C.SLIDE.widescreen.w : C.SLIDE.standard.w;
  const slideH = config.landscape ? C.SLIDE.widescreen.h : C.SLIDE.standard.h;

  let slideIndex = 0;
  for (const def of allSlideDefs) {
    if (def.type === "section") {
      pptx.addSection({ title: def.title });
      currentSection = def.title;
      continue;
    }
    slideIndex++;
    renderSlide(pptx, def, slideIndex, totalSlides, slideW, slideH);

    // ── Slide numbers (per-slide config) ──
    const lastSlide = pptx.slides[pptx.slides.length - 1];
    if (lastSlide && (def.slideNumber || config.slideNumbers)) {
      const sn = def.slideNumber || config.slideNumbers;
      lastSlide.slideNumber = {
        x: sn.x || "50%",
        y: sn.y || "95%",
        color: sn.color || C.COLOURS.greyText,
        fontSize: sn.fontSize || 10,
      };
    }
  }

  // Write output
  const outputPath = config.outputFile || './output/resource.pptx';
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    const writeOpts = { fileName: outputPath };
    if (config.compression) writeOpts.compression = true;
    await pptx.writeFile(writeOpts);
    console.log(`✓ Done → ${outputPath}`);
    console.log(`  ${totalSlides} slides generated.`);
    if (config.slideMasters) console.log(`  ${config.slideMasters.length} slide master(s).`);
    if (config.compression) console.log(`  Compression: enabled.`);
    console.log();
  } catch (err) {
    console.error(`✗ Build failed: ${err.message}`);
    process.exit(1);
  }
})();
