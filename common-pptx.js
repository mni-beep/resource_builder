// ============================================================
// common-pptx.js — SHARED PPTX FORMATTING & HELPER MODULE
// Used by build-pptx.js. Content modules receive this as "C".
// ============================================================
// Returns SLIDE DEFINITION objects (not raw pptxgenjs calls).
// build-pptx.js reads these definitions and renders them.
// ============================================================

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// ---- ICON SYSTEM (React + sharp for SVG → base64 PNG) ----
let _sharp, _React, _ReactDOMServer, _iconComponents;
let _ICONS = {};  // pre-rendered icon cache: name → "image/png;base64,..."
let _iconsReady = false;

function _loadIconDeps() {
  if (_iconsReady) return true;
  try {
    _sharp = require('sharp');
    _React = require('react');
    _ReactDOMServer = require('react-dom/server');
    const Fa = require('react-icons/fa');
    const Md = require('react-icons/md');
    _iconComponents = { ...Fa, ...Md };
    _iconsReady = true;
    return true;
  } catch (e) {
    console.warn('  ⚠ Icon dependencies not available — falling back to Unicode emoji.');
    console.warn('    Install with: npm install sharp react react-dom react-icons');
    return false;
  }
}

/** Render a React icon component to a base64 PNG data URI. */
async function _iconToBase64Png(IconComponent, color = "2B579A", size = 256) {
  if (!_sharp) return null;
  try {
    const svg = _ReactDOMServer.renderToStaticMarkup(
      _React.createElement(IconComponent, { color: `#${color}`, size: String(size) })
    );
    const png = await _sharp(Buffer.from(svg)).png().toBuffer();
    return "image/png;base64," + png.toString("base64");
  } catch (e) { return null; }
}

/**
 * Pre-render a core set of named icons for use by slide helpers.
 * Call once at startup (from build-pptx.js). Returns a map of name→dataURI.
 */
async function initIcons() {
  if (!_loadIconDeps()) return _ICONS;
  const C = _iconComponents;
  const pairs = [
    ["check",       C.FaCheck,                 "10B981"],
    ["cross",       C.FaTimes,                 "DC2626"],
    ["arrow",       C.FaArrowRight,            "0891B2"],
    ["bulb",        C.FaLightbulb,             "F59E0B"],
    ["pencil",      C.FaPencilRuler,           "0891B2"],
    ["cube",        C.FaCube,                  "0891B2"],
    ["search",      C.FaSearch,                "0891B2"],
    ["target",      C.FaBullseye,              "F59E0B"],
    ["warning",     C.FaExclamationTriangle,   "F59E0B"],
    ["question",    C.FaQuestionCircle,        "F59E0B"],
    ["teacher",     C.FaChalkboardTeacher,     "FFFFFF"],
    ["student",     C.FaUserEdit,              "0891B2"],
    ["ruler",       C.FaRuler,                 "0891B2"],
    ["compass",     C.FaDraftingCompass,       "0891B2"],
    ["clipboard",   C.FaClipboardCheck,        "0891B2"],
    ["objects",     C.FaObjectGroup,           "0891B2"],
    ["straight",    C.MdStraighten,            "0891B2"],
    ["square",      C.MdSquare,                "0891B2"],
    ["horiz",       C.MdHorizontalRule,        "0891B2"],
  ];
  for (const [name, comp, color] of pairs) {
    try {
      _ICONS[name] = await _iconToBase64Png(comp, color);
    } catch (e) { /* skip individual failures */ }
  }
  console.log(`  🎨 ${Object.keys(_ICONS).length} icons pre-rendered`);
  return _ICONS;
}

/** Get a pre-rendered icon by name. Returns base64 data URI or null. */
function icon(name) {
  return _ICONS[name] || null;
}

// ---- COLOUR PALETTE (shared with DOCX pipeline) ----
const COLOURS = {
  primary: "2B579A",    // deep blue — headers, banners, table header fills
  accent: "4A90D9",     // lighter blue — subtitle, secondary accents
  warning: "E8A838",    // amber — safety callouts
  greenLine: "5A9E5A",  // green — practical tags, checklists
  greyText: "808080",   // grey — hints, sentence starters
  darkGrey: "595959",   // darker grey — subtitles
  greenWE: "70AD47",    // green — worked example border
  greenBg: "E2EFDA",    // light green — worked example background
  white: "FFFFFF",
  black: "000000",

  // ---- Claude-inspired rich palette ----
  navy:       "0F2A47",   // deep navy — dark slide backgrounds
  navyLight:  "21456E",   // lighter navy
  cyan:       "0891B2",   // CAD/cyan — secondary accent, corner marks
  cyanLight:  "CFEFF6",   // pale cyan tint
  amber:      "F59E0B",   // amber accent — highlights, dimensions, callouts
  amberLight: "FEF3C7",   // pale amber tint
  green:      "10B981",   // success green (more vibrant)
  greenBg2:   "D1FAE5",   // light green background
  red:        "DC2626",   // error red
  redLight:   "FEE2E2",   // light red background
  muted:      "64748B",   // muted grey-blue text
  paleBg:     "F4F7FB",   // pale blueprint/paper background
  rule:       "DCE3EC",   // light rule lines

  // ---- E5 Instructional Model colours ----
  e5Engage:    "E86A17",  // warm orange — hook, curiosity, prior knowledge
  e5EngageBg:  "FFF0E5",  // light orange
  e5Explore:   "008080",  // teal — investigation, hands-on discovery
  e5ExploreBg: "E0F0F0",  // light teal
  e5Explain:   "2B579A",  // deep blue (same as primary) — explicit teaching
  e5ExplainBg: "E8F0FE",  // light blue
  e5Elaborate: "7B2D8E",  // purple — apply, extend, connect
  e5ElaborateBg: "F3E5F5",// light purple
  e5Evaluate:  "C00000",  // red — check understanding, assess
  e5EvaluateBg: "FFEBEE", // light red
};

// ---- SLIDE DIMENSIONS ----
// Standard 4:3: 10 x 7.5 inches
// Widescreen 16:9: 13.33 x 7.5 inches (default for modern presentations)
const SLIDE = {
  widescreen: { w: 13.33, h: 7.5 },
  standard: { w: 10, h: 7.5 },
};

// ---- FONT CONVENTIONS ----
const FONT = {
  body: "Calibri",
  heading: "Calibri",
  mono: "Consolas",
};

// ---- DEFAULT THEME COLOURS (passed to PptxGenJS) ----
const themeColours = {
  headFontColor: COLOURS.primary,
  txtFontColor: "333333",
};

// ============================================================
// SLIDE DEFINITION HELPERS
// Each returns a plain object that build-pptx.js understands.
// ============================================================

/**
 * Title slide — big title, subtitle, optional author.
 */
function titleSlide(title, subtitle, author) {
  const def = { type: "title", title, subtitle };
  if (author) def.author = author;
  return def;
}

/**
 * Section divider — full-bleed coloured slide with section name.
 */
function sectionDivider(sectionName, subtitle) {
  return { type: "divider", title: sectionName, subtitle: subtitle || "" };
}

/**
 * Content slide — heading + bullet points.
 * @param {string} title - slide heading
 * @param {string[]} bullets - array of bullet point strings
 * @param {object} opts - { notes, hint (italic grey text below title), twoColumn (split bullets into two columns) }
 */
function contentSlide(title, bullets, opts = {}) {
  return { type: "content", title, bullets, ...opts };
}

/**
 * Two-column slide — heading + left content + right content.
 * Each column is an array of { type: "bullets"|"text"|"image", ... } objects.
 */
function twoColumnSlide(title, leftItems, rightItems, opts = {}) {
  return { type: "twoColumn", title, left: leftItems, right: rightItems, ...opts };
}

/**
 * Table slide — heading + table.
 * @param {string} title
 * @param {string[]} headers - column headers
 * @param {string[][]} rows - 2D array of cell text
 * @param {number[]} colWidths - column widths in inches (optional, auto-calculated)
 */
function tableSlide(title, headers, rows, colWidths, opts = {}) {
  return { type: "table", title, headers, rows, colWidths: colWidths || null, ...opts };
}

/**
 * Image slide — heading + image + caption.
 * @param {string} title
 * @param {string} imagePath - relative path to image file
 * @param {string} caption - figure caption text
 * @param {object} opts - { size: {w,h} in inches }
 */
function imageSlide(title, imagePath, caption, opts = {}) {
  return { type: "image", title, image: imagePath, caption: caption || "", ...opts };
}

/**
 * Worked example slide — green-themed slide with step-by-step solution.
 * @param {string} title - "Worked Example: ..."
 * @param {string[]} steps - array of step text strings (or rich objects)
 * @param {object} opts - { question, notes }
 */
function workedExampleSlide(title, steps, opts = {}) {
  return { type: "workedExample", title, steps, ...opts };
}

/**
 * Now You Try slide — green-themed with hidden answer in notes.
 * @param {string} title
 * @param {string} question
 * @param {string[]} answerParts - answer text (goes into speaker notes)
 */
function nowYouTrySlide(title, question, answerParts) {
  return { type: "nowYouTry", title, question, answers: answerParts || [] };
}

/**
 * Multiple choice question slide.
 * @param {number} n - question number
 * @param {string} stem - question text
 * @param {string[]} options - 4 option strings
 * @param {string} hint - optional hint text
 * @param {string} answer - correct answer (goes into speaker notes)
 */
function mcQuestionSlide(n, stem, options, hint, answer) {
  return { type: "mcQuestion", n, stem, options, hint: hint || "", answer: answer || "" };
}

/**
 * Short answer slide — question + sentence starter + blank space.
 */
function shortAnswerSlide(title, question, sentenceStarter, numLines = 3) {
  return { type: "shortAnswer", title, question, sentenceStarter: sentenceStarter || "", numLines };
}

/**
 * Extended response slide — planning steps + writing space.
 */
function extendedResponseSlide(title, question, planningSteps, sentenceStarters) {
  return {
    type: "extendedResponse",
    title,
    question,
    planningSteps: planningSteps || [],
    sentenceStarters: sentenceStarters || []
  };
}

/**
 * Fill-in table slide — pre-built table with some cells blank.
 */
function fillTableSlide(title, headers, rows, hint) {
  return { type: "fillTable", title, headers, rows, hint: hint || "" };
}

/**
 * Callout slide — a highlighted box with key information.
 */
function calloutSlide(title, bullets, calloutType) {
  return { type: "callout", title, bullets: bullets || [], calloutType: calloutType || "info" };
}

/**
 * Checklist slide — a list of items with checkboxes.
 */
function checklistSlide(title, items) {
  return { type: "checklist", title, items: items || [] };
}

/**
 * Comparison slide — side-by-side comparison of two concepts.
 */
function comparisonSlide(title, leftHeader, leftBullets, rightHeader, rightBullets) {
  return {
    type: "comparison",
    title,
    leftHeader: leftHeader || "",
    leftBullets: leftBullets || [],
    rightHeader: rightHeader || "",
    rightBullets: rightBullets || []
  };
}

/**
 * Big idea slide — one key concept, prominently displayed.
 */
function bigIdeaSlide(idea, subtitle) {
  return { type: "bigIdea", idea, subtitle: subtitle || "" };
}

/**
 * Diagram slide — for ASCII diagrams rendered in monospace.
 */
function diagramSlide(title, asciiLines, caption) {
  return { type: "diagram", title, ascii: asciiLines || [], caption: caption || "" };
}

/**
 * Custom slide — pass a render function for advanced cases.
 * @param {function} renderFn - (slide, H) => void — receives pptxgenjs slide + H helpers
 */
function customSlide(renderFn) {
  return { type: "custom", render: renderFn };
}

/**
 * Learning objectives slide — standard start-of-lesson slide.
 */
function objectivesSlide(lessonTitle, objectives) {
  return { type: "objectives", title: lessonTitle, bullets: objectives || [] };
}

/**
 * End slide / summary slide.
 */
function summarySlide(title, bullets) {
  return { type: "summary", title: title || "Summary", bullets: bullets || [] };
}

// ============================================================
// RICH TEXT HELPERS (used within slide definitions)
// ============================================================

/**
 * Create a rich text run object (for mixed-format text).
 */
function richRun(text, opts = {}) {
  return { text, ...opts };
  // opts: bold, italic, color, fontSize, font,
  //       underline, strike, highlight, glow, reflection, shadow
}

/**
 * Create a bullet item that can be a string or rich array.
 */
function richBullet(runs) {
  if (typeof runs === 'string') return runs;
  return { runs };  // array of richRun objects
}

// ============================================================
// SPEAKER NOTES HELPERS
// ============================================================

/**
 * Format speaker notes for teacher edition content.
 */
function teacherNotes(text) {
  return `📝 TEACHER NOTES:\n${text}`;
}

/**
 * Format answer notes for hidden answers.
 */
function answerNotes(answers) {
  if (!answers || answers.length === 0) return "";
  return `✓ ANSWERS:\n${answers.map((a, i) => `  ${i + 1}. ${a}`).join('\n')}`;
}

// ============================================================
// IMAGE HELPERS
// ============================================================

/**
 * Resolve and validate an image path.
 * Returns the absolute path if the file exists, otherwise logs a warning.
 */
function resolveImage(imagePath) {
  // Try relative to project root first
  const absPath = path.resolve(imagePath);
  if (fs.existsSync(absPath)) return absPath;

  // Try relative to content/images/
  const contentImgPath = path.resolve('./content/images', imagePath);
  if (fs.existsSync(contentImgPath)) return contentImgPath;

  console.warn(`  ⚠ Image not found: ${imagePath} — slide will be created without image`);
  return null;
}

// ============================================================
// E5 INSTRUCTIONAL MODEL HELPERS
// ============================================================
// E5 INSTRUCTIONAL MODEL HELPERS (generalised layout)
// Every E5 slide has consistent chrome:
//   Top-left:  skill/concept label ("Skill 1: Defining Classification")
//   Top-right: red rounded phase button ("Explore" / "Explain" / etc.)
//   Bottom:    green SM (Success Measure) bar
// ============================================================

/**
 * E5 Theme — customise colours, positions, fonts for all E5 slides.
 * Override any property before building.
 *
 * Phase colours (used for button, SM bar, accents):
 *   Engage=Orange, Explore=Teal, Explain=Blue, Elaborate=Purple, Evaluate=Red
 */
const _E5_PHASE_COLOURS = {
  "Engage":    { fill: "E86A17", light: "FFF0E5", text: "FFFFFF", icon: "bulb" },
  "Explore":   { fill: "008080", light: "E0F0F0", text: "FFFFFF", icon: "search" },
  "Explain":   { fill: "2B579A", light: "E8F0FE", text: "FFFFFF", icon: "pencil" },
  "Elaborate": { fill: "7B2D8E", light: "F3E5F5", text: "FFFFFF", icon: "cube" },
  "Evaluate":  { fill: "C00000", light: "FFEBEE", text: "FFFFFF", icon: "target" },
};

/** Get phase colours for a given phase name. */
function _phaseColours(phaseName) {
  return _E5_PHASE_COLOURS[phaseName] || { fill: "C00000", light: "FFEBEE", text: "FFFFFF", icon: "target" };
}

const E5_THEME = {
  slideH: 7.5,          // slide height (same for widescreen & standard)
  // Phase button (top-right) — fill/light are set dynamically per phase
  phaseButton: {
    fontFace: "Calibri",
    fontSize: 13, italic: true, bold: false,
    x: "78%", y: 0.25, w: 1.9, h: 0.45, rectRadius: 0.08,
  },
  // SM bar (full-width bottom bar) — colour is set dynamically per phase
  smBar: {
    fontFace: "Calibri",
    fontSize: 13, bold: false,
    height: 0.55, yOffset: 0.55,   // bar top = slideH - height, text inset
  },
  // Skill label (top-left)
  skillLabel: {
    color: "333333", fontFace: "Calibri", fontSize: 11,
    x: 0.5, y: 0.15, w: "72%", h: 0.5,
  },
  // Heading (below skill label)
  heading: {
    color: "0F2A47", fontFace: "Calibri", fontSize: 26, bold: true,
    x: 0.5, y: 0.75, w: "72%", h: 0.7,
  },
  // Body text defaults
  body: { color: "333333", fontFace: "Calibri", fontSize: 15 },
  // Two-column split positions
  leftCol:  { x: 0.5,  w: "52%" },
  rightCol: { x: "56%", w: "40%" },
  // Callout box (used in Explain & continuation slides) — light tint is phase-aware
  callout: {
    fontFace: "Calibri", fontSize: 14,
    borderWidth: 1, rectRadius: 0.06,
  },
  // Card shadow (rich styling — subtle drop shadow on content areas)
  cardShadow: { type: "outer", color: "0F2A47", blur: 8, offset: 2, angle: 90, opacity: 0.06 },
  // Learning Intention two-panel slide
  liPanel: {
    leftBg: "F4F7FB", rightBg: "E8F0FE",
    leftTextColor: "0F2A47", rightTextColor: "0F2A47",
    headingFontSize: 32,
    accent: "0891B2",  // cyan accent for decorative elements
  },
};

// ---- Internal: add chrome to any E5 slide ----
function _e5Chrome(slideDef, skillLabel, phaseName, smText) {
  // Store chrome properties on the slide definition for the renderer
  slideDef._e5 = {
    skillLabel: skillLabel || "",
    phase: phaseName || "",
    smText: smText || "",
  };
  return slideDef;
}

// ---- Internal: render the E5 chrome onto a pptxgenjs slide ----
function _e5RenderChrome(slide, def) {
  const ec = def._e5;
  if (!ec) return;
  const T = E5_THEME;
  const pc = _phaseColours(ec.phase);  // phase-aware default colours

  // 1. Skill label (top-left) — uses theme colour, fallback to navy
  if (ec.skillLabel) {
    slide.addText(ec.skillLabel, {
      x: T.skillLabel.x, y: T.skillLabel.y, w: T.skillLabel.w, h: T.skillLabel.h,
      fontSize: T.skillLabel.fontSize, fontFace: T.skillLabel.fontFace,
      color: T.skillLabel.color || COLOURS.navy,
    });
  }

  // 2. Phase button (top-right) — honour T.phaseButton.fill/textColor if set, else use phase defaults
  if (ec.phase) {
    const pb = T.phaseButton;
    const btnFill = pb.fill || pc.fill;
    const btnTextColor = pb.textColor || pc.text;
    slide.addShape("roundRect", {
      x: pb.x, y: pb.y, w: pb.w, h: pb.h,
      fill: { color: btnFill },
      rectRadius: pb.rectRadius || 0.08,
      shadow: T.cardShadow,
    });
    slide.addText(ec.phase, {
      x: pb.x, y: pb.y, w: pb.w, h: pb.h,
      fontSize: pb.fontSize, fontFace: pb.fontFace,
      color: btnTextColor, italic: pb.italic, bold: pb.bold,
      align: "center", valign: "middle",
    });
  }

  // 3. SM bar (bottom) — honour T.smBar.fill/textColor if set, else use phase light colour
  if (ec.smText) {
    const sb = T.smBar;
    const barY = T.slideH - sb.height;
    const smFill = sb.fill || pc.light;
    const smTextColor = sb.textColor || "333333";
    slide.addShape("rect", {
      x: 0, y: barY, w: "100%", h: sb.height,
      fill: { color: smFill },
    });
    slide.addText("SM: " + ec.smText, {
      x: 0.5, y: barY + 0.08, w: "92%", h: sb.height - 0.16,
      fontSize: sb.fontSize, fontFace: sb.fontFace,
      color: smTextColor, bold: sb.bold,
      valign: "middle",
    });
  }
}

// ---- Internal: strip pptxgenjs-specific shape type (pptxgenjs uses string "roundRect" not enum) ----
// pptxgenjs ShapeType is pptx.ShapeType.roundRect — but since _e5RenderChrome runs inside
// the render function where we have access to pptx object, we use string literal "roundRect".
// The build-pptx.js custom renderer passes (slide, H) — slide is pptxgenjs slide.
// slide.addShape("roundRect", ...)   ← works in pptxgenjs as a string.

// ============================================================
// E5 SLIDE HELPERS (return custom slide definitions)
// ============================================================

/**
 * E5 Learning Intention slide — two-panel framing slide.
 * Left: white bg, "Learning Intention" heading + objective text.
 * Right: light green bg, "Success Measure" badge, Skill/Knowledge/Attitude checkboxes.
 *
 * @param {string} skillLabel - e.g. "Concept 1: Classification systems"
 * @param {string} intention - e.g. "To be able to explain the term Classification"
 * @param {object} measures - { skill: string[], knowledge: string, attitude: string }
 *   skill: array of "I can..." checkbox items
 *   knowledge: "I understand..." text
 *   attitude: "I will..." text
 */
function e5LearningIntentionSlide(skillLabel, intention, measures = {}) {
  const def = {
    type: "custom",
    _e5Intent: { skillLabel, intention, measures },
    render: function (slide, H) {
      const T = E5_THEME;

      // Left panel — white
      slide.addShape("rect", {
        x: 0, y: 0, w: "50%", h: T.slideH,
        fill: { color: T.liPanel.leftBg },
      });
      // Right panel — light green
      slide.addShape("rect", {
        x: "50%", y: 0, w: "50%", h: T.slideH,
        fill: { color: T.liPanel.rightBg },
      });

      // Left content
      if (skillLabel) {
        slide.addText(skillLabel, {
          x: 0.3, y: 0.2, w: "46%", h: 0.5,
          fontSize: 11, fontFace: T.skillLabel.fontFace,
          color: T.skillLabel.color,
        });
      }
      slide.addText("Learning Intention", {
        x: "5%", y: 1.8, w: "40%", h: 1.0,
        fontSize: T.liPanel.headingFontSize, bold: true,
        fontFace: T.heading.fontFace, color: T.liPanel.leftTextColor,
        align: "center", valign: "middle",
      });
      if (intention) {
        // Thin decorative line — phase-aware colour
        slide.addShape("rect", {
          x: "12%", y: 3.0, w: "26%", h: 0.02,
          fill: { color: T.liPanel.accent },
        });
        slide.addText(intention, {
          x: "8%", y: 3.3, w: "34%", h: 3.0,
          fontSize: 16, fontFace: T.body.fontFace, color: T.body.color,
          align: "center", valign: "top", lineSpacing: 22,
        });
      }

      // Right content — Success Measure
      // White badge
      slide.addShape("roundRect", {
        x: "57%", y: 0.6, w: "28%", h: 0.55,
        fill: { color: "FFFFFF" },
        rectRadius: 0.06,
      });
      slide.addText("Success Measure", {
        x: "57%", y: 0.6, w: "28%", h: 0.55,
        fontSize: 15, bold: true, fontFace: T.heading.fontFace,
        color: T.liPanel.rightTextColor, align: "center", valign: "middle",
      });

      let ry = 1.5;

      // Skill checkboxes
      if (measures.skill && measures.skill.length > 0) {
        slide.addText("Skill:", {
          x: "56%", y: ry, w: "38%", h: 0.4,
          fontSize: 14, bold: true, fontFace: T.body.fontFace,
          color: T.liPanel.rightTextColor,
        });
        ry += 0.45;
        measures.skill.forEach(item => {
          slide.addText("☐  " + item, {
            x: "58%", y: ry, w: "36%", h: 0.35,
            fontSize: 13, fontFace: T.body.fontFace, color: T.body.color,
          });
          ry += 0.38;
        });
        ry += 0.2;
      }

      // Knowledge
      if (measures.knowledge) {
        slide.addText("Knowledge:", {
          x: "56%", y: ry, w: "38%", h: 0.4,
          fontSize: 14, bold: true, fontFace: T.body.fontFace,
          color: T.liPanel.rightTextColor,
        });
        ry += 0.45;
        slide.addText(measures.knowledge, {
          x: "58%", y: ry, w: "36%", h: 0.35,
          fontSize: 13, fontFace: T.body.fontFace, color: T.body.color,
        });
        ry += 0.55;
      }

      // Attitude
      if (measures.attitude) {
        slide.addText("Attitude:", {
          x: "56%", y: ry, w: "38%", h: 0.4,
          fontSize: 14, bold: true, fontFace: T.body.fontFace,
          color: T.liPanel.rightTextColor,
        });
        ry += 0.45;
        slide.addText(measures.attitude, {
          x: "58%", y: ry, w: "36%", h: 0.35,
          fontSize: 13, fontFace: T.body.fontFace, color: T.body.color,
        });
      }
    }
  };
  return def;
}

/**
 * E5 Engage slide — "Why are we learning this?" relevance hook.
 * Two-column: body text left, image/illustration right.
 *
 * @param {string} skillLabel - e.g. "Skill 1: Defining Classification"
 * @param {string} heading - e.g. "Why are we learning this?"
 * @param {string|string[]} bodyText - paragraph(s) explaining relevance
 * @param {string} imagePath - optional path to illustration (right column)
 * @param {string} smText - success measure, e.g. "I understand the importance of classification"
 * @param {object} opts - { notes, videoUrl (YouTube URL for right-column video), videoCaption? }
 */
function e5EngageSlide(skillLabel, heading, bodyText, imagePath, smText, opts = {}) {
  const def = _e5Chrome({ type: "custom", notes: opts.notes || "" }, skillLabel, "Engage", smText);
  def._e5Body = { heading, bodyText, imagePath, videoUrl: opts.videoUrl || "" };
  def.render = function (slide, H) {
    _e5RenderChrome(slide, def);
    const T = E5_THEME;

    // Heading
    slide.addText(heading || "", {
      x: T.heading.x, y: T.heading.y, w: T.heading.w, h: T.heading.h,
      fontSize: T.heading.fontSize, bold: T.heading.bold,
      fontFace: T.heading.fontFace, color: T.heading.color,
    });

    // Body text (left column)
    const body = Array.isArray(bodyText) ? bodyText : [bodyText || ""];
    const bodyStr = body.join('\n\n');
    slide.addText(bodyStr, {
      x: T.leftCol.x, y: 1.8, w: T.leftCol.w, h: 4.6,
      fontSize: T.body.fontSize, fontFace: T.body.fontFace,
      color: T.body.color, valign: "top", lineSpacing: 20,
    });

    // Right column: video takes priority over image
    if (opts.videoUrl) {
      const videoPath = downloadYouTube(opts.videoUrl, null, { maxHeight: 720, timeout: 300000 });
      if (videoPath && fs.existsSync(videoPath)) {
        slide.addMedia({
          type: "video",
          path: videoPath,
          x: T.rightCol.x, y: 1.5, w: "36%", h: 3.6,
        });
        if (opts.videoCaption) {
          slide.addText(opts.videoCaption, {
            x: T.rightCol.x, y: 5.2, w: "36%", h: 0.4,
            fontSize: 10, italic: true, color: COLOURS.greyText,
            align: "center", fontFace: FONT.body,
          });
        }
      }
    } else if (imagePath) {
      const resolved = resolveImage(imagePath);
      if (resolved) {
        slide.addImage({
          path: resolved,
          x: T.rightCol.x, y: 1.5, w: "36%", h: 4.0,
        });
      }
    }
    if (def.notes) slide.addNotes(def.notes);
  };
  return def;
}

/**
 * E5 Explore slide — investigation prompts with visual.
 * Two-column: probing questions/prompts left, image/graphic right.
 *
 * @param {string} skillLabel - e.g. "Skill 1: Defining Classification"
 * @param {string} heading - e.g. "Skill 1: Defining Classification"
 * @param {string[]} prompts - probing/discussion questions
 * @param {string} imagePath - optional image/graphic (right column)
 * @param {string} smText - success measure
 * @param {object} opts - { notes, mindMap (text label for simple mind-map graphic), videoUrl (YouTube URL for right-column video), videoCaption? }
 */
function e5ExploreSlide(skillLabel, heading, prompts, imagePath, smText, opts = {}) {
  const def = _e5Chrome({ type: "custom", notes: opts.notes || "" }, skillLabel, "Explore", smText);
  def._e5Body = { heading, prompts, imagePath, mindMap: opts.mindMap || "", videoUrl: opts.videoUrl || "" };
  def.render = function (slide, H) {
    _e5RenderChrome(slide, def);
    const T = E5_THEME;

    // Heading
    slide.addText(heading || "", {
      x: T.heading.x, y: T.heading.y, w: T.heading.w, h: T.heading.h,
      fontSize: T.heading.fontSize, bold: T.heading.bold,
      fontFace: T.heading.fontFace, color: T.heading.color,
    });

    // Prompts (left column)
    const promptItems = (prompts || []).map(p => typeof p === 'string' ? { text: p, options: { bullet: true } } : p);
    slide.addText(promptItems, {
      x: T.leftCol.x, y: 1.8, w: T.leftCol.w, h: 4.6,
      fontSize: T.body.fontSize, fontFace: T.body.fontFace,
      color: T.body.color, valign: "top", lineSpacing: 24,
    });

    // Right column: video > image > mind-map
    if (opts.videoUrl) {
      const videoPath = downloadYouTube(opts.videoUrl, null, { maxHeight: 720, timeout: 300000 });
      if (videoPath && fs.existsSync(videoPath)) {
        slide.addMedia({
          type: "video",
          path: videoPath,
          x: T.rightCol.x, y: 1.5, w: "36%", h: 3.6,
        });
        if (opts.videoCaption) {
          slide.addText(opts.videoCaption, {
            x: T.rightCol.x, y: 5.2, w: "36%", h: 0.4,
            fontSize: 10, italic: true, color: COLOURS.greyText,
            align: "center", fontFace: FONT.body,
          });
        }
      }
    } else if (imagePath) {
      const resolved = resolveImage(imagePath);
      if (resolved) {
        slide.addImage({
          path: resolved,
          x: T.rightCol.x, y: 1.5, w: "36%", h: 4.0,
        });
      }
    } else if (opts.mindMap) {
      // Simple mind-map visual: oval with label
      slide.addShape("ellipse", {
        x: "62%", y: 2.0, w: "28%", h: 3.0,
        fill: { color: "FFFFFF" },
        line: { color: "A8D08D", width: 1.5 },
      });
      slide.addText(opts.mindMap, {
        x: "62%", y: 3.0, w: "28%", h: 1.0,
        fontSize: 16, bold: true, fontFace: T.heading.fontFace,
        color: T.heading.color, align: "center", valign: "middle",
      });
    }

    if (def.notes) slide.addNotes(def.notes);
  };
  return def;
}

/**
 * E5 Explain slide — explicit teaching: vocabulary, reading, key concepts.
 * Single-column with optional green callout box.
 *
 * @param {string} skillLabel
 * @param {string} heading - e.g. "Skill 1 - Key Vocabulary:" or "Skill 1: Defining Classification"
 * @param {Array} contentBlocks - array of { type: "definition"|"paragraph"|"bullet", text, term? }
 *   e.g. [{ type:"definition", term:"Classification", text:"The act of arranging..." }, ...]
 * @param {string} calloutText - optional text for a green callout box (e.g. "What did you learn?")
 * @param {string} smText - success measure
 * @param {object} opts - { notes, imagePath (optional right-column image) }
 */
function e5ExplainSlide(skillLabel, heading, contentBlocks, calloutText, smText, opts = {}) {
  const def = _e5Chrome({ type: "custom", notes: opts.notes || "" }, skillLabel, "Explain", smText);
  def._e5Body = { heading, contentBlocks, calloutText, imagePath: opts.imagePath || "" };
  def.render = function (slide, H) {
    _e5RenderChrome(slide, def);
    const T = E5_THEME;

    // Heading
    slide.addText(heading || "", {
      x: T.heading.x, y: T.heading.y, w: T.heading.w, h: T.heading.h,
      fontSize: T.heading.fontSize, bold: T.heading.bold,
      fontFace: T.heading.fontFace, color: T.heading.color,
    });

    // Check if we have a right-column image
    const hasImage = !!(opts.imagePath && resolveImage(opts.imagePath));
    const leftW = hasImage ? T.leftCol.w : "90%";
    let contentY = 1.8;

    // Content blocks
    const blocks = contentBlocks || [];
    blocks.forEach(block => {
      if (typeof block === 'string') {
        // Plain string → treat as paragraph
        slide.addText(block, {
          x: T.leftCol.x, y: contentY, w: leftW, h: 0.5,
          fontSize: T.body.fontSize, fontFace: T.body.fontFace,
          color: T.body.color, valign: "top",
        });
        contentY += 0.55;
      } else if (block.type === 'definition') {
        // Bold term + definition text
        slide.addText([
          { text: block.term + ": ", options: { bold: true, fontSize: T.body.fontSize, fontFace: T.body.fontFace, color: T.body.color } },
          { text: block.text, options: { fontSize: T.body.fontSize, fontFace: T.body.fontFace, color: T.body.color } },
        ], {
          x: T.leftCol.x, y: contentY, w: leftW, h: 0.7,
          valign: "top", lineSpacing: 18,
        });
        contentY += 0.75;
      } else if (block.type === 'paragraph') {
        slide.addText(block.text, {
          x: T.leftCol.x, y: contentY, w: leftW, h: 1.2,
          fontSize: T.body.fontSize, fontFace: T.body.fontFace,
          color: T.body.color, valign: "top", lineSpacing: 18,
        });
        contentY += 1.2;
      } else if (block.type === 'bullet') {
        const items = Array.isArray(block.text) ? block.text : [block.text];
        slide.addText(items.map(i => ({ text: i, options: { bullet: true } })), {
          x: T.leftCol.x, y: contentY, w: leftW, h: items.length * 0.45,
          fontSize: T.body.fontSize, fontFace: T.body.fontFace,
          color: T.body.color, valign: "top", lineSpacing: 20,
        });
        contentY += items.length * 0.45 + 0.1;
      }
    });

    // Callout box — phase-aware colours
    if (calloutText) {
      const cb = T.callout;
      const pc = _phaseColours(def._e5 && def._e5.phase);
      contentY += 0.2;
      slide.addShape("roundRect", {
        x: T.leftCol.x, y: contentY, w: leftW, h: 0.7,
        fill: { color: pc.light },
        line: { color: pc.fill, width: cb.borderWidth || 1 },
        rectRadius: cb.rectRadius,
        shadow: T.cardShadow,
      });
      slide.addText(calloutText, {
        x: parseFloat(T.leftCol.x) + 0.3, y: contentY, w: "82%", h: 0.7,
        fontSize: cb.fontSize, fontFace: cb.fontFace,
        color: "333333", valign: "middle",
      });
    }

    // Optional right image
    if (hasImage) {
      slide.addImage({
        path: resolveImage(opts.imagePath),
        x: T.rightCol.x, y: 1.5, w: "36%", h: 4.0,
      });
    }

    if (def.notes) slide.addNotes(def.notes);
  };
  return def;
}

/**
 * E5 Continuation Slide — extra slides within a phase that carry
 * the same E5 chrome (skill label, phase button, SM bar) as the main
 * phase slide. Use for multi-slide phases (e.g. Engage 2, Explain 2).
 *
 * @param {string} skillLabel - same as the main phase slide
 * @param {string} phaseName  - "Engage"|"Explore"|"Explain"|"Elaborate"|"Evaluate"
 * @param {string} smText     - success measure text for the bottom bar
 * @param {string} title      - heading for this continuation slide
 * @param {string[]} bullets  - bullet points (like C.contentSlide) — pass null for table mode
 * @param {object} opts       - { notes, hint, iconName, table: { headers[], rows[][], colWidths[]? } }
 */
function e5ContinuationSlide(skillLabel, phaseName, smText, title, bullets, opts = {}) {
  const def = _e5Chrome({ type: "custom", notes: opts.notes || "" }, skillLabel, phaseName, smText);
  def._e5Body = { title, bullets, hint: opts.hint || "", iconName: opts.iconName || "", table: opts.table || null };
  def.render = function (slide, H) {
    _e5RenderChrome(slide, def);
    const T = E5_THEME;
    const pc = _phaseColours(phaseName);

    // Heading with optional icon
    const headingX = opts.iconName && icon(opts.iconName) ? parseFloat(T.heading.x) + 0.55 : T.heading.x;
    const headingW = opts.iconName && icon(opts.iconName) ? "68%" : T.heading.w;

    if (title) {
      if (opts.iconName && icon(opts.iconName)) {
        slide.addImage({
          data: icon(opts.iconName),
          x: T.heading.x, y: T.heading.y + 0.05, w: 0.45, h: 0.45,
        });
      }
      slide.addText(title, {
        x: headingX, y: T.heading.y, w: headingW, h: T.heading.h,
        fontSize: T.heading.fontSize, bold: T.heading.bold,
        fontFace: T.heading.fontFace, color: T.heading.color,
      });
    }

    // Optional hint
    let bodyY = 1.7;
    if (opts.hint) {
      slide.addText(opts.hint, {
        x: T.leftCol.x, y: 1.5, w: "90%", h: 0.35,
        fontSize: 12, italic: true, color: COLOURS.greyText, fontFace: T.body.fontFace,
      });
      bodyY = 2.0;
    }

    // Table mode
    if (opts.table) {
      const tbl = opts.table;
      const hdrRow = (tbl.headers || []).map(h => ({ text: h, options: { bold: true, color: "FFFFFF", fill: { color: pc.fill }, align: "center", fontSize: 12, valign: "middle" } }));
      const dataRows = (tbl.rows || []).map(row =>
        row.map(cell => {
          if (typeof cell === 'string') return { text: cell, options: { fontSize: 12, valign: "middle" } };
          return cell;
        })
      );
      const colW = tbl.colWidths || (tbl.headers || []).map(() => 8 / tbl.headers.length);
      const tblW = colW.reduce((a, b) => a + (typeof b === 'number' ? b : 1.5), 0);
      slide.addTable([hdrRow, ...dataRows], {
        x: 0.5, y: bodyY, w: Math.min(tblW, 12.3),
        colW: colW,
        rowH: [0.35, ...dataRows.map(() => 0.4)],
        border: { type: "solid", pt: 0.5, color: "BFBFBF" },
        fontFace: T.body.fontFace,
      });
    } else if (bullets && bullets.length > 0) {
      // Rich card background with subtle shadow
      slide.addShape("roundRect", {
        x: 0.5, y: bodyY - 0.1, w: "92%", h: (bullets.length * 0.45) + 0.6,
        fill: { color: COLOURS.white },
        shadow: T.cardShadow,
        rectRadius: 0.08,
      });
      slide.addText(bullets.map(b => typeof b === 'string' ? { text: b, options: { bullet: true } } : b), {
        x: 0.8, y: bodyY + 0.15, w: "88%", h: bullets.length * 0.45,
        fontSize: T.body.fontSize, fontFace: T.body.fontFace,
        color: T.body.color, valign: "top", lineSpacing: 22,
      });
    }

    if (def.notes) slide.addNotes(def.notes);
  };
  return def;
}

/**
 * E5 Elaborate slide — application, activity, extension task.
 * Single-column: instruction text + activity table.
 *
 * @param {string} skillLabel
 * @param {string} heading - e.g. "Activities"
 * @param {string} instruction - e.g. "Please complete the following activity:"
 * @param {Array} activityItems - array of { name, description?, link? } activity objects
 * @param {string} smText - success measure
 * @param {object} opts - { notes }
 */
function e5ElaborateSlide(skillLabel, heading, instruction, activityItems, smText, opts = {}) {
  const def = _e5Chrome({ type: "custom", notes: opts.notes || "" }, skillLabel, "Elaborate", smText);
  def._e5Body = { heading, instruction, activityItems };
  def.render = function (slide, H) {
    _e5RenderChrome(slide, def);
    const T = E5_THEME;
    const pc = _phaseColours("Elaborate");

    // Heading
    slide.addText(heading || "", {
      x: T.heading.x, y: T.heading.y, w: T.heading.w, h: T.heading.h,
      fontSize: T.heading.fontSize, bold: T.heading.bold,
      fontFace: T.heading.fontFace, color: T.heading.color,
    });

    // Instruction
    let ay = 1.8;
    if (instruction) {
      slide.addText(instruction, {
        x: 0.5, y: ay, w: "90%", h: 0.5,
        fontSize: T.body.fontSize, fontFace: T.body.fontFace,
        color: T.body.color,
      });
      ay += 0.6;
    }

    // Activity table — rich styled
    const items = activityItems || [];
    if (items.length > 0) {
      const headerRow = [
        { text: "Activities", options: { bold: true, color: "FFFFFF", fill: { color: pc.fill }, align: "center", fontSize: 14 } }
      ];
      const dataRows = items.map(item => [
        {
          text: (item.link ? "🔗 " : "") + (item.name || item),
          options: {
            fill: { color: pc.light },
            color: item.link ? pc.fill : "000000",
            underline: !!item.link,
            fontSize: 14,
            valign: "middle",
          }
        }
      ]);
      slide.addTable([headerRow, ...dataRows], {
        x: 1.0, y: ay, w: 8.0,
        colW: [8.0],
        rowH: [0.4, ...dataRows.map(() => 0.5)],
        border: { type: "solid", pt: 0.5, color: "BFBFBF" },
        fontFace: T.body.fontFace,
      });
    }

    if (def.notes) slide.addNotes(def.notes);
  };
  return def;
}

/**
 * E5 Evaluate slide — exit ticket, self-assessment, check for understanding.
 * Single-column: assessment link/instruction.
 *
 * @param {string} skillLabel
 * @param {string} heading - e.g. "Skill 1: Defining Classification"
 * @param {string} assessmentLink - text label for the exit ticket link
 * @param {string} smText - success measure
 * @param {object} opts - { notes, rubricItems[] (optional success criteria below link) }
 */
function e5EvaluateSlide(skillLabel, heading, assessmentLink, smText, opts = {}) {
  const def = _e5Chrome({ type: "custom", notes: opts.notes || "" }, skillLabel, "Evaluate", smText);
  def._e5Body = { heading, assessmentLink, rubricItems: opts.rubricItems || [] };
  def.render = function (slide, H) {
    _e5RenderChrome(slide, def);
    const T = E5_THEME;
    const pc = _phaseColours("Evaluate");

    // Heading
    slide.addText(heading || "", {
      x: T.heading.x, y: T.heading.y, w: T.heading.w, h: T.heading.h,
      fontSize: T.heading.fontSize, bold: T.heading.bold,
      fontFace: T.heading.fontFace, color: T.heading.color,
    });

    // Assessment link (centred, phase-coloured, underlined)
    if (assessmentLink) {
      slide.addText(assessmentLink, {
        x: "10%", y: 3.0, w: "80%", h: 0.8,
        fontSize: 20, fontFace: T.body.fontFace,
        color: pc.fill, underline: true,
        align: "center", valign: "middle",
      });
    }

    // Rubric items (optional, below link)
    if (opts.rubricItems && opts.rubricItems.length > 0) {
      slide.addText("Success Criteria:", {
        x: 1.0, y: 4.2, w: "80%", h: 0.4,
        fontSize: 12, bold: true, fontFace: T.body.fontFace,
        color: T.body.color,
      });
      const rubricText = opts.rubricItems.map((r, i) => `${i + 1}. ${r}`);
      slide.addText(rubricText.map(r => ({ text: r, options: { bullet: true } })), {
        x: 1.2, y: 4.6, w: "76%", h: 2.0,
        fontSize: 12, fontFace: T.body.fontFace,
        color: T.body.color, valign: "top", lineSpacing: 18,
      });
    }

    if (def.notes) slide.addNotes(def.notes);
  };
  return def;
}

/**
 * E5 Lesson Plan — convenience helper: builds a complete E5 lesson.
 * Returns a flat array of slide definitions.
 *
 * @param {string} skillLabel - e.g. "Skill 1: Defining Classification"
 * @param {object} plan - { intention?, successMeasures?, engage, explore, explain, elaborate, evaluate }
 *
 *   plan.successMeasures = { skill: string[], knowledge: string, attitude: string }
 *     (used on the Learning Intention framing slide)
 *
 *   plan.engage = { heading?, bodyText, imagePath?, smText?, notes? }
 *   plan.explore = { heading?, prompts[], imagePath?, mindMap?, smText?, notes? }
 *   plan.explain = { heading?, contentBlocks[], calloutText?, imagePath?, smText?, notes? }
 *   plan.elaborate = { heading?, instruction?, activityItems[], smText?, notes? }
 *   plan.evaluate = { heading?, assessmentLink?, rubricItems?, smText?, notes? }
 *
 * @returns {Array} flat array of slide definition objects
 *
 * Example:
 *   C.e5LessonPlan("Skill 1: Defining Classification", {
 *     intention: "To be able to explain the term Classification",
 *     successMeasures: { skill: ["I can classify objects into groups"], knowledge: "I understand...", attitude: "I will participate..." },
 *     engage:  { bodyText: "Classification happens all around us...", imagePath: "./science-illustration.png", smText: "I understand the importance" },
 *     explore: { prompts: ["Where do we see classification?", "Think about..."], mindMap: "Classification", smText: "I can list where I have seen classification" },
 *     explain: { contentBlocks: [{type:"definition", term:"Classification", text:"The act of arranging..."}], calloutText: "What did you learn?", smText: "I understand the terms" },
 *     elaborate: { instruction: "Please complete:", activityItems: [{name:"Grouping everyday items"}], smText: "I can group items" },
 *     evaluate: { assessmentLink: "Skill 1 Exit ticket", rubricItems: ["I can define classification"], smText: "I can demonstrate my understanding" },
 *   })
 */
function e5LessonPlan(skillLabel, plan = {}) {
  const slides = [];
  const sm = plan.successMeasures || {};

  // Helper: pick smText for a phase. Explicit smText wins; otherwise derive from intro SMs.
  function _sm(phaseExplicit, phaseKey) {
    if (phaseExplicit) return phaseExplicit;
    // Derive from intro successMeasures
    const map = {
      engage:    sm.attitude || "",
      explore:   (sm.skill && sm.skill[0]) || "",
      explain:   sm.knowledge || (sm.skill && sm.skill[1]) || "",
      elaborate: (sm.skill && sm.skill[1]) || (sm.skill && sm.skill[sm.skill.length - 1]) || "",
      evaluate:  (sm.skill && sm.skill[sm.skill.length - 1]) || (sm.skill && sm.skill[2]) || "",
    };
    return map[phaseKey] || "";
  }

  // 0. Learning Intention slide (if intention provided)
  if (plan.intention) {
    slides.push(e5LearningIntentionSlide(skillLabel, plan.intention, sm));
  }

  // 1. ENGAGE
  const eng = plan.engage || {};
  if (eng.bodyText || eng.heading) {
    slides.push(e5EngageSlide(
      skillLabel,
      eng.heading || "Why are we learning this?",
      eng.bodyText || "",
      eng.imagePath || "",
      _sm(eng.smText, "engage"),
      { notes: eng.notes || "", videoUrl: eng.videoUrl || "", videoCaption: eng.videoCaption || "" }
    ));
  }

  // 2. EXPLORE
  const exp = plan.explore || {};
  if ((exp.prompts && exp.prompts.length > 0) || exp.heading) {
    slides.push(e5ExploreSlide(
      skillLabel,
      exp.heading || skillLabel,
      exp.prompts || [],
      exp.imagePath || "",
      _sm(exp.smText, "explore"),
      { notes: exp.notes || "", mindMap: exp.mindMap || "", videoUrl: exp.videoUrl || "", videoCaption: exp.videoCaption || "" }
    ));
  }

  // 3. EXPLAIN
  const expl = plan.explain || {};
  if ((expl.contentBlocks && expl.contentBlocks.length > 0) || expl.heading) {
    slides.push(e5ExplainSlide(
      skillLabel,
      expl.heading || skillLabel + " - Key Vocabulary:",
      expl.contentBlocks || [],
      expl.calloutText || "",
      _sm(expl.smText, "explain"),
      { notes: expl.notes || "", imagePath: expl.imagePath || "" }
    ));
  }

  // 4. ELABORATE
  const elab = plan.elaborate || {};
  if ((elab.activityItems && elab.activityItems.length > 0) || elab.heading) {
    slides.push(e5ElaborateSlide(
      skillLabel,
      elab.heading || "Activities",
      elab.instruction || "Please complete the following activity:",
      elab.activityItems || [],
      _sm(elab.smText, "elaborate"),
      { notes: elab.notes || "" }
    ));
  }

  // 5. EVALUATE
  const eval_ = plan.evaluate || {};
  if (eval_.assessmentLink || eval_.heading) {
    slides.push(e5EvaluateSlide(
      skillLabel,
      eval_.heading || skillLabel,
      eval_.assessmentLink || "",
      _sm(eval_.smText, "evaluate"),
      { notes: eval_.notes || "", rubricItems: eval_.rubricItems || [] }
    ));
  }

  return slides;
}

// ============================================================
// VIDEO / YOUTUBE HELPERS
// ============================================================

const { execFileSync } = require('child_process');

/**
 * Find the yt-dlp executable. Checks:
 *   1. System PATH (just "yt-dlp")
 *   2. Project tools/ directory (tools/yt-dlp.exe on Windows, tools/yt-dlp on Unix)
 *   3. Python module (python -m yt_dlp)
 * @returns {{ cmd: string, args: string[] }|null} yt-dlp command + base args, or null if not found
 */
function _findYtDlp() {
  // 1. Try system PATH
  try {
    execFileSync('yt-dlp', ['--version'], { stdio: 'ignore' });
    return { cmd: 'yt-dlp', args: [] };
  } catch (_) { /* not in PATH */ }

  // 2. Try project tools/ directory
  const isWindows = process.platform === 'win32';
  const toolsPath = path.resolve(__dirname, 'tools', isWindows ? 'yt-dlp.exe' : 'yt-dlp');
  if (fs.existsSync(toolsPath)) {
    try {
      execFileSync(toolsPath, ['--version'], { stdio: 'ignore' });
      return { cmd: toolsPath, args: [] };
    } catch (_) { /* broken binary */ }
  }

  // 3. Try Python module
  try {
    execFileSync('python', ['-m', 'yt_dlp', '--version'], { stdio: 'ignore' });
    return { cmd: 'python', args: ['-m', 'yt_dlp'] };
  } catch (_) { /* not a python module */ }
  try {
    execFileSync('python3', ['-m', 'yt_dlp', '--version'], { stdio: 'ignore' });
    return { cmd: 'python3', args: ['-m', 'yt_dlp'] };
  } catch (_) { /* not a python module */ }

  return null;
}

/**
 * Download a YouTube video as an MP4 file using yt-dlp.
 * Returns the absolute path to the downloaded file, or null on failure.
 * Caches downloads — skips if the file already exists.
 *
 * @param {string} url - YouTube URL (watch?v=... or youtu.be/...)
 * @param {string} outputDir - directory to save the video (default: ./content/videos/)
 * @param {object} opts - { maxHeight (default 720), timeout (ms, default 5 min) }
 * @returns {string|null} absolute path to the downloaded MP4, or null
 */

// ---- Internal: check if ffmpeg is available (system PATH or project tools/) ----
function _hasFfmpeg() {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return true;
  } catch (_) { /* not in PATH */ }
  const isWindows = process.platform === 'win32';
  const toolsFfmpeg = path.resolve(__dirname, 'tools', isWindows ? 'ffmpeg.exe' : 'ffmpeg');
  if (fs.existsSync(toolsFfmpeg)) {
    try {
      execFileSync(toolsFfmpeg, ['-version'], { stdio: 'ignore' });
      return true;
    } catch (_) { /* broken binary */ }
  }
  return false;
}

function downloadYouTube(url, outputDir, opts = {}) {
  const ytDlp = _findYtDlp();
  if (!ytDlp) {
    console.error('  ✗ yt-dlp not found. Install it:');
    console.error('      pip install yt-dlp');
    console.error('    Or download from: https://github.com/yt-dlp/yt-dlp');
    return null;
  }

  // Extract video ID for caching filename
  const match = url.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  const videoId = match ? match[1] : null;
  if (!videoId) {
    console.error(`  ✗ Could not extract YouTube video ID from: ${url}`);
    return null;
  }

  const outDir = outputDir || path.resolve(__dirname, 'content', 'videos');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outputPath = path.resolve(outDir, `${videoId}.mp4`);

  // Skip if already downloaded (check > 50 KB to avoid keeping truncated files)
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 50 * 1024) {
    console.log(`  📹 Using cached video: ${outputPath}`);
    return outputPath;
  }

  const maxHeight = opts.maxHeight || 720;
  const timeout = opts.timeout || 300000; // 5 minutes

  console.log(`  📥 Downloading YouTube video: ${url}`);
  console.log(`     (max ${maxHeight}p, timeout ${Math.round(timeout / 1000)}s)`);

  try {
    // Check if ffmpeg is available for post-processing (producing pristine MP4).
    const hasFfmpeg = _hasFfmpeg();
    if (!hasFfmpeg) {
      console.log(`     ℹ ffmpeg not found — using single-stream MP4 download (PowerPoint-safe, slightly lower quality)`);
    }

    // Two strategies depending on ffmpeg availability:
    //   With ffmpeg:    download best video + best audio, merge + recode → pristine MP4
    //   Without ffmpeg: download a single native MP4 stream (already muxed, PowerPoint-compatible)
    const formatStr = hasFfmpeg
      ? `bestvideo[height<=${maxHeight}][vcodec^=avc1]+bestaudio[ext=m4a]/best[height<=${maxHeight}][ext=mp4]/best[height<=${maxHeight}]`
      : `best[height<=${maxHeight}][ext=mp4]/best[height<=${maxHeight}]`;

    // Build args array (no shell injection — execFileSync passes args directly)
    const args = [
      '-f', formatStr,
      '--merge-output-format', 'mp4',
      '-o', outputPath,
      url,
    ];
    if (hasFfmpeg) {
      args.splice(args.indexOf('--merge-output-format'), 0, '--recode-video', 'mp4');
    }

    execFileSync(ytDlp.cmd, [...ytDlp.args, ...args], {
      stdio: 'inherit',
      timeout,
      maxBuffer: 10 * 1024 * 1024,
    });
    const sizeMB = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(1);
    console.log(`  ✓ Downloaded: ${outputPath} (${sizeMB} MB)`);
    return outputPath;
  } catch (err) {
    console.error(`  ✗ Failed to download YouTube video: ${err.message}`);
    // Clean up partial download
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    return null;
  }
}

/**
 * Video slide — embeds a playable video (local MP4 or downloaded YouTube).
 * For YouTube URLs, the video is downloaded automatically via yt-dlp.
 *
 * @param {string} title - slide heading
 * @param {string} videoSource - local path or YouTube URL
 * @param {string} caption - optional caption below the video
 * @param {object} opts - { notes, autoPlay, maxHeight (for YouTube download) }
 * @returns {object} slide definition (or null if download failed)
 */
function videoSlide(title, videoSource, caption, opts = {}) {
  let videoPath = videoSource;

  // Detect YouTube URLs and attempt download
  if (typeof videoSource === 'string' &&
      (videoSource.includes('youtube.com') || videoSource.includes('youtu.be'))) {
    const downloaded = downloadYouTube(videoSource, null, {
      maxHeight: opts.maxHeight || 720,
      timeout: opts.timeout || 300000
    });
    if (!downloaded) {
      console.error('  ⚠ Video download failed — slide will show a placeholder');
      videoPath = null;
    } else {
      videoPath = downloaded;
    }
  }

  return {
    type: "video",
    title,
    video: videoPath,
    caption: caption || "",
    autoPlay: opts.autoPlay || false,
    notes: opts.notes || "",
    sourceUrl: (typeof videoSource === 'string' && videoSource.includes('youtube.com')) ? videoSource : "",
  };
}

// ============================================================
// CHROME & SHADOW HELPERS
// ============================================================

/** Soft card shadow — use with pptxgenjs shape shadow option. */
function softShadow(color = "0F2A47", blur = 12, offset = 3, opacity = 0.08) {
  return { type: "outer", color, blur, offset, angle: 90, opacity };
}

/** Chrome configuration for per-slide decorative elements. */
const CHROME = {
  cornerMark: { color: COLOURS.cyan, w: 0.18, h: 0.02, gap: 0.02 },
  lessonChip: {
    fontFace: FONT.body, fontSize: 10, color: COLOURS.cyan, charSpacing: 4, bold: true,
  },
  footer: {
    fontFace: FONT.body, fontSize: 9, color: COLOURS.muted, italic: true,
  },
};

// ============================================================
// RICH LAYOUT SLIDE HELPERS (Claude-inspired)
// ============================================================

/**
 * Lesson title slide — dark cover with decorative grid, lesson chip, hook.
 * @param {number} lessonNum - e.g. 4
 * @param {string} title - e.g. "Measuring & Dimensioning"
 * @param {string} hook - engaging hook text
 * @param {string} hookSubtitle - italic subtitle below hook
 * @param {object} opts - { notes, timing ("HOOK · 5 min"), accentColor }
 */
function lessonTitleSlide(lessonNum, title, hook, hookSubtitle, opts = {}) {
  return {
    type: "lessonTitle",
    lessonNum, title, hook, hookSubtitle,
    timing: opts.timing || "",
    accentColor: opts.accentColor || COLOURS.cyan,
    notes: opts.notes || "",
  };
}

/**
 * Roadmap / week-ahead slide — 3 lesson cards in a row.
 * @param {string} eyebrow - small top label e.g. "THE WEEK AHEAD"
 * @param {string} title - main heading
 * @param {Array} cards - [{ n, title, sub, icon? }] where n="04", icon is icon name string
 * @param {object} opts - { notes, takeaway (bottom italic text), totalSlides }
 */
function roadmapSlide(eyebrow, title, cards, opts = {}) {
  return {
    type: "roadmap",
    eyebrow: eyebrow || "",
    title: title || "",
    cards: cards || [],
    takeaway: opts.takeaway || "",
    notes: opts.notes || "",
  };
}

/**
 * Numbered learning intentions slide — each intent in a styled card with number band.
 * @param {string} title - e.g. "By the end of today, you can…"
 * @param {Array} intents - [{ num: "01", text: "..." }]
 * @param {object} opts - { notes, timing (pedagogical strip text) }
 */
function numberedIntentsSlide(title, intents, opts = {}) {
  return {
    type: "numberedIntents",
    title: title || "",
    intents: intents || [],
    timing: opts.timing || "",
    notes: opts.notes || "",
  };
}

/**
 * Comparison columns slide — side-by-side with winner/loser styling.
 * @param {string} title
 * @param {object} left - { header, bigText, bigSub, detailBullets, winner:bool }
 * @param {object} right - { header, bigText, bigSub, detailBullets, winner:bool }
 * @param {object} opts - { notes, bottomRule }
 */
function comparisonColumnsSlide(title, left, right, opts = {}) {
  return {
    type: "comparisonColumns",
    title: title || "",
    left: left || {},
    right: right || {},
    bottomRule: opts.bottomRule || "",
    notes: opts.notes || "",
  };
}

/**
 * MCQ card slide — 2×2 answer cards with visual feedback.
 * @param {number} n - question number
 * @param {string} stem - question text
 * @param {Array} options - [{ letter:"A", text:"...", correct:bool, why:"..." }]
 * @param {object} opts - { notes, eyebrow, totalSlides }
 */
function mcqCardSlide(n, stem, options, opts = {}) {
  return {
    type: "mcqCard",
    n: n || 1,
    stem: stem || "",
    options: options || [],
    eyebrow: opts.eyebrow || "",
    notes: opts.notes || "",
  };
}

/**
 * Process steps slide — vertical or horizontal numbered steps.
 * @param {string} title
 * @param {Array} steps - [{ title, desc }]
 * @param {object} opts - { notes, layout ("vertical"|"horizontal"), subtitle }
 */
function processStepsSlide(title, steps, opts = {}) {
  return {
    type: "processSteps",
    title: title || "",
    steps: steps || [],
    layout: opts.layout || "vertical",
    subtitle: opts.subtitle || "",
    notes: opts.notes || "",
  };
}

/**
 * Step strip slide — horizontal connected step cards with arrows.
 * @param {string} eyebrow - small label e.g. "WORKED EXAMPLE"
 * @param {string} title
 * @param {Array} steps - [{ n, t (title), d (description) }]
 * @param {object} opts - { notes, calloutBox { title, text }, totalSlides }
 */
function stepStripSlide(eyebrow, title, steps, opts = {}) {
  return {
    type: "stepStrip",
    eyebrow: eyebrow || "",
    title: title || "",
    steps: steps || [],
    calloutBox: opts.calloutBox || null,
    notes: opts.notes || "",
  };
}

/**
 * Task cards slide — multiple activity cards with emoji, time chip, description.
 * @param {string} eyebrow - e.g. "YOUR TURN  ·  3 OBJECTS  ·  30 MINUTES"
 * @param {string} title
 * @param {Array} tasks - [{ emoji, title, time, steps }]
 * @param {object} opts - { notes, bottomChecklist, totalSlides }
 */
function taskCardsSlide(eyebrow, title, tasks, opts = {}) {
  return {
    type: "taskCards",
    eyebrow: eyebrow || "",
    title: title || "",
    tasks: tasks || [],
    bottomChecklist: opts.bottomChecklist || "",
    notes: opts.notes || "",
  };
}

/**
 * Success criteria panel — dark panel with checkmarks (used as right-column companion).
 * Returns a render fragment definition for use in custom slides.
 */
function successCriteriaPanel(title, items, opts = {}) {
  return { _panel: "successCriteria", title: title || "SUCCESS CRITERIA", items: items || [], intro: opts.intro || "" };
}

/**
 * Callout strip — amber warning/note strip for bottom of a slide.
 * Returns a render fragment definition.
 */
function calloutStrip(text, type = "warning") {
  return { _strip: "callout", text, type };
}

/**
 * Key idea slide — big definition with two-column comparison below.
 * @param {string} eyebrow - e.g. "KEY IDEA"
 * @param {string} title - the big concept name
 * @param {string} definition - explanatory paragraph
 * @param {object} left - { header, bullets, problem:bool }
 * @param {object} right - { header, bullets, problem:bool }
 * @param {object} opts - { notes, bottomTakeaway }
 */
function keyIdeaSlide(eyebrow, title, definition, left, right, opts = {}) {
  return {
    type: "keyIdea",
    eyebrow: eyebrow || "",
    title: title || "",
    definition: definition || "",
    left: left || {},
    right: right || {},
    bottomTakeaway: opts.bottomTakeaway || "",
    notes: opts.notes || "",
  };
}

/**
 * Wrap-up / exit ticket slide — dark background with takeaways and next-week banner.
 * @param {string} eyebrow - e.g. "WEEK 2  ·  WRAP-UP"
 * @param {string} title - e.g. "You can now do this."
 * @param {Array} takeaways - list of achievement strings
 * @param {string} nextTitle - e.g. "NEXT WEEK"
 * @param {string} nextText - e.g. "Turning your 2D sketches into 3D models..."
 * @param {object} opts - { notes }
 */
function wrapUpSlide(eyebrow, title, takeaways, nextTitle, nextText, opts = {}) {
  return {
    type: "wrapUp",
    eyebrow: eyebrow || "",
    title: title || "",
    takeaways: takeaways || [],
    nextTitle: nextTitle || "",
    nextText: nextText || "",
    notes: opts.notes || "",
  };
}

// ============================================================
// NEW HELPERS — Charts, Shapes, Audio, Hyperlinks,
//   Backgrounds, Slide Masters, Sections, Slide Numbers
// ============================================================

// ---- CHART SLIDE ----
function chartSlide(title, chartType, data, opts = {}) {
  return {
    type: "chart",
    title: title || "",
    chartType: chartType || "bar",
    data: data || [],
    showLegend: opts.showLegend !== false,
    showTitle: opts.showTitle !== false,
    catAxisLabel: opts.catAxisLabel || "",
    valAxisLabel: opts.valAxisLabel || "",
    notes: opts.notes || "",
    size: opts.size || null,
    position: opts.position || null,
  };
}

// ---- SHAPE SLIDE ----
function shapeSlide(title, shapes, opts = {}) {
  return {
    type: "shape",
    title: title || "",
    shapes: shapes || [],  // array of { name, options }
    notes: opts.notes || "",
  };
}

// ---- AUDIO SLIDE ----
function audioSlide(title, audioPath, opts = {}) {
  return {
    type: "audio",
    title: title || "",
    audio: audioPath,
    cover: opts.cover || null,
    notes: opts.notes || "",
    position: opts.position || null,
  };
}

// ---- HYPERLINK HELPER ----
function hyperlink(url, opts = {}) {
  return {
    url: url,
    tooltip: opts.tooltip || "",
    isSlideLink: opts.isSlideLink || false,
  };
}

// ---- SLIDE MASTER DEFINITION ----
function slideMaster(opts = {}) {
  return {
    type: "master",
    title: opts.title || "Custom Master",
    objects: opts.objects || [],  // { type, options } objects
    background: opts.background || null,
    slideNumber: opts.slideNumber || null,
  };
}

// ---- BACKGROUND DEFINITION ----
function background(def) {
  return def;  // { color, path, data, transparency }
}

// ---- SECTION DEFINITION ----
function section(title) {
  return { type: "section", title };
}

// ---- SLIDE NUMBER CONFIG ----
function slideNumberConfig(opts = {}) {
  return {
    x: opts.x || "50%",
    y: opts.y || "95%",
    color: opts.color || COLOURS.greyText,
    fontSize: opts.fontSize || 10,
  };
}

// ---- LINE PROPERTIES (for shapes) ----
function lineProps(opts = {}) {
  return {
    color: opts.color || COLOURS.primary,
    width: opts.width || 2,
    dashType: opts.dashType || "solid",
    beginArrowType: opts.beginArrowType || null,
    endArrowType: opts.endArrowType || null,
  };
}

module.exports = {
  // Constants
  COLOURS,
  SLIDE,
  FONT,
  themeColours,
  CHROME,

  // Icon system
  initIcons,
  icon,
  softShadow,

  // Slide definition helpers
  titleSlide,
  sectionDivider,
  contentSlide,
  twoColumnSlide,
  tableSlide,
  imageSlide,
  workedExampleSlide,
  nowYouTrySlide,
  mcQuestionSlide,
  shortAnswerSlide,
  extendedResponseSlide,
  fillTableSlide,
  calloutSlide,
  checklistSlide,
  comparisonSlide,
  bigIdeaSlide,
  diagramSlide,
  customSlide,
  objectivesSlide,
  summarySlide,

  // Rich layout helpers (Claude-inspired)
  lessonTitleSlide,
  roadmapSlide,
  numberedIntentsSlide,
  comparisonColumnsSlide,
  mcqCardSlide,
  processStepsSlide,
  stepStripSlide,
  taskCardsSlide,
  keyIdeaSlide,
  wrapUpSlide,
  successCriteriaPanel,
  calloutStrip,

  // E5 Instructional Model helpers
  E5_THEME,
  e5LearningIntentionSlide,
  e5EngageSlide,
  e5ExploreSlide,
  e5ExplainSlide,
  e5ElaborateSlide,
  e5EvaluateSlide,
  e5ContinuationSlide,
  e5LessonPlan,

  // Rich text helpers
  richRun,
  richBullet,

  // Speaker notes helpers
  teacherNotes,
  answerNotes,

  // Image helpers
  resolveImage,

  // Video / YouTube helpers
  downloadYouTube,
  videoSlide,

  // ── New helpers ──
  chartSlide, shapeSlide, audioSlide,
  hyperlink, slideMaster, background, section,
  slideNumberConfig, lineProps,
};
