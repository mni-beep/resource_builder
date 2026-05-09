// Week 2 Slide Deck: Measuring, Constraints & Real-Object Sketching
// Year 9 D&T - 3D Printing & Fusion 360
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fs = require("fs");
const {
  FaRuler, FaCompass, FaDraftingCompass, FaCheck, FaTimes, FaArrowRight,
  FaLightbulb, FaPencilRuler, FaCube, FaSearch, FaBullseye,
  FaObjectGroup, FaClipboardCheck, FaExclamationTriangle, FaQuestionCircle,
  FaChalkboardTeacher, FaUserEdit
} = require("react-icons/fa");
const {
  MdHorizontalRule, MdOutlineVerticalAlignBottom, MdJoinFull,
  MdSquare, MdCircle, MdStraighten
} = require("react-icons/md");

// ===================== ICON UTIL =====================
async function iconToBase64Png(IconComponent, color = "#0F2A47", size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}

// ===================== PALETTE =====================
const C = {
  ink:        "0F2A47",   // deep navy (primary)
  inkLight:   "21456E",   // lighter navy
  paper:      "FFFFFF",   // white
  bg:         "F4F7FB",   // pale blueprint background
  rule:       "DCE3EC",   // light rule
  cyan:       "0891B2",   // CAD selection cyan (secondary)
  cyanLight:  "CFEFF6",   // pale cyan tint
  amber:      "F59E0B",   // amber accent (for highlights/dimensions)
  amberLight: "FEF3C7",
  green:      "10B981",   // success
  red:        "DC2626",   // error
  muted:      "64748B"    // muted gray text
};

const FONT_HEAD = "Calibri";
const FONT_BODY = "Calibri";

// ===================== SHADOW HELPER =====================
const softShadow = () => ({ type: "outer", color: "0F2A47", blur: 12, offset: 3, angle: 90, opacity: 0.08 });

// ===================== SLIDE HELPERS =====================

// Repeating motif: subtle blueprint corner brackets at top-right of every content slide
function addCornerMark(slide) {
  // tiny tick mark in top-right corner
  slide.addShape("rect", { x: 9.55, y: 0.25, w: 0.18, h: 0.02, fill: { color: C.cyan }, line: { color: C.cyan, width: 0 } });
  slide.addShape("rect", { x: 9.71, y: 0.25, w: 0.02, h: 0.18, fill: { color: C.cyan }, line: { color: C.cyan, width: 0 } });
}

// Page label at top-left for content slides
function addLessonChip(slide, lessonNum, lessonTitle) {
  slide.addText(`LESSON ${lessonNum}`, {
    x: 0.5, y: 0.27, w: 1.2, h: 0.28,
    fontSize: 10, fontFace: FONT_HEAD, bold: true, color: C.cyan, charSpacing: 4,
    align: "left", valign: "middle", margin: 0
  });
  slide.addText(lessonTitle, {
    x: 1.7, y: 0.27, w: 7, h: 0.28,
    fontSize: 10, fontFace: FONT_HEAD, color: C.muted, charSpacing: 1,
    align: "left", valign: "middle", margin: 0
  });
  // thin separator under header
  slide.addShape("line", { x: 0.5, y: 0.62, w: 9.0, h: 0,
    line: { color: C.rule, width: 0.75 } });
}

function addFooter(slide, slideNum, totalSlides) {
  slide.addText("Year 9 D&T  ·  3D Printing & Fusion 360  ·  Week 2", {
    x: 0.5, y: 5.32, w: 6, h: 0.22,
    fontSize: 9, fontFace: FONT_BODY, color: C.muted, italic: true, align: "left", valign: "middle", margin: 0
  });
  slide.addText(`${slideNum} / ${totalSlides}`, {
    x: 8.7, y: 5.32, w: 1.0, h: 0.22,
    fontSize: 9, fontFace: FONT_BODY, color: C.muted, align: "right", valign: "middle", margin: 0
  });
}

// ===================== BUILD =====================
(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9"; // 10" x 5.625"
  pres.author = "Year 9 D&T";
  pres.title = "Week 2: Measuring, Constraints & Real-Object Sketching";

  // Pre-render icons
  const ICN = {
    ruler:     await iconToBase64Png(FaRuler, "#" + C.cyan),
    compass:   await iconToBase64Png(FaDraftingCompass, "#" + C.cyan),
    bulb:      await iconToBase64Png(FaLightbulb, "#" + C.amber),
    pencil:    await iconToBase64Png(FaPencilRuler, "#" + C.cyan),
    cube:      await iconToBase64Png(FaCube, "#" + C.cyan),
    search:    await iconToBase64Png(FaSearch, "#" + C.cyan),
    target:    await iconToBase64Png(FaBullseye, "#" + C.amber),
    check:     await iconToBase64Png(FaCheck, "#" + C.green),
    cross:     await iconToBase64Png(FaTimes, "#" + C.red),
    arrow:     await iconToBase64Png(FaArrowRight, "#" + C.cyan),
    teacher:   await iconToBase64Png(FaChalkboardTeacher, "#FFFFFF"),
    student:   await iconToBase64Png(FaUserEdit, "#" + C.cyan),
    question:  await iconToBase64Png(FaQuestionCircle, "#" + C.amber),
    warning:   await iconToBase64Png(FaExclamationTriangle, "#" + C.amber),
    clipboard: await iconToBase64Png(FaClipboardCheck, "#" + C.cyan),
    horiz:     await iconToBase64Png(MdHorizontalRule, "#" + C.cyan),
    straight:  await iconToBase64Png(MdStraighten, "#" + C.cyan),
    square:    await iconToBase64Png(MdSquare, "#" + C.cyan)
  };

  const TOTAL = 22;
  let n = 0;

  // ============================================================
  // SLIDE 1 — COVER (dark)
  // ============================================================
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: C.ink };

    // Decorative grid in background (light dots / lines)
    // Grid: thin cyan crosshatch
    for (let i = 0; i < 11; i++) {
      s.addShape("line", { x: i * 1.0, y: 0, w: 0, h: 5.625, line: { color: C.cyan, width: 0.4, transparency: 85 } });
    }
    for (let j = 0; j < 7; j++) {
      s.addShape("line", { x: 0, y: j * 1.0, w: 10, h: 0, line: { color: C.cyan, width: 0.4, transparency: 85 } });
    }

    // Top label
    s.addText("YEAR 9  ·  DESIGN & TECHNOLOGY", {
      x: 0.6, y: 0.6, w: 8, h: 0.32,
      fontSize: 12, fontFace: FONT_HEAD, color: C.cyan, bold: true, charSpacing: 6,
      margin: 0
    });

    // Week chip
    s.addShape("rect", { x: 0.6, y: 1.1, w: 1.5, h: 0.45,
      fill: { color: C.cyan }, line: { color: C.cyan, width: 0 } });
    s.addText("WEEK 2", {
      x: 0.6, y: 1.1, w: 1.5, h: 0.45,
      fontSize: 14, fontFace: FONT_HEAD, color: C.paper, bold: true, charSpacing: 4,
      align: "center", valign: "middle", margin: 0
    });

    // Title
    s.addText("Measuring,\nConstraints &\nReal Objects", {
      x: 0.6, y: 1.75, w: 8.8, h: 2.5,
      fontSize: 56, fontFace: FONT_HEAD, color: C.paper, bold: true,
      lineSpacingMultiple: 1.0, margin: 0
    });

    // Subtitle
    s.addText("Three lessons that turn rough sketches into precise CAD-ready drawings.", {
      x: 0.6, y: 4.4, w: 8.5, h: 0.5,
      fontSize: 16, fontFace: FONT_BODY, color: C.cyanLight, italic: true,
      margin: 0
    });

    // Bottom corner accent
    s.addShape("rect", { x: 0.6, y: 5.05, w: 0.6, h: 0.05,
      fill: { color: C.amber }, line: { color: C.amber, width: 0 } });
    s.addText("Lessons 4 · 5 · 6", {
      x: 0.6, y: 5.15, w: 4, h: 0.3,
      fontSize: 12, fontFace: FONT_HEAD, color: C.paper, charSpacing: 2,
      margin: 0
    });
  }

  // ============================================================
  // SLIDE 2 — WEEK ROADMAP
  // ============================================================
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: C.paper };
    addCornerMark(s);

    // Title + eyebrow
    s.addText("THE WEEK AHEAD", {
      x: 0.5, y: 0.45, w: 8, h: 0.3,
      fontSize: 11, fontFace: FONT_HEAD, color: C.cyan, bold: true, charSpacing: 6, margin: 0
    });
    s.addText("Three lessons. One big skill: precise drawing.", {
      x: 0.5, y: 0.78, w: 9, h: 0.7,
      fontSize: 30, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
    });

    // 3 lesson cards in a row
    const cards = [
      {
        n: "04", title: "Measuring & Dimensioning",
        sub: "How to measure in mm and add proper dimension lines.",
        icon: ICN.straight
      },
      {
        n: "05", title: "Geometric Constraints",
        sub: "The seven rules that lock a sketch in place.",
        icon: ICN.compass
      },
      {
        n: "06", title: "Sketching Real Objects",
        sub: "Reverse engineer an everyday object, fully dimensioned.",
        icon: ICN.search
      }
    ];

    const cardW = 2.85, cardH = 3.1, gap = 0.225;
    const startX = 0.5;
    cards.forEach((c, i) => {
      const x = startX + i * (cardW + gap);
      const y = 1.75;
      // card body
      s.addShape("rect", { x, y, w: cardW, h: cardH,
        fill: { color: C.paper }, line: { color: C.rule, width: 1 },
        shadow: softShadow() });
      // top accent strip
      s.addShape("rect", { x, y, w: cardW, h: 0.08,
        fill: { color: C.cyan }, line: { color: C.cyan, width: 0 } });
      // big number
      s.addText(c.n, {
        x: x + 0.3, y: y + 0.25, w: 1.4, h: 0.9,
        fontSize: 56, fontFace: FONT_HEAD, color: C.cyan, bold: true, margin: 0,
        valign: "top"
      });
      // icon top-right
      s.addImage({ data: c.icon, x: x + cardW - 0.85, y: y + 0.35, w: 0.55, h: 0.55 });
      // title
      s.addText(c.title, {
        x: x + 0.3, y: y + 1.35, w: cardW - 0.6, h: 0.85,
        fontSize: 17, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
      });
      // subtitle
      s.addText(c.sub, {
        x: x + 0.3, y: y + 2.25, w: cardW - 0.6, h: 0.7,
        fontSize: 12, fontFace: FONT_BODY, color: C.muted, margin: 0
      });
    });

    // Bottom takeaway
    s.addText("By Friday, you'll be able to look at any object and produce a CAD-ready drawing.", {
      x: 0.5, y: 5.05, w: 9, h: 0.3,
      fontSize: 12, fontFace: FONT_BODY, color: C.ink, italic: true, margin: 0
    });

    addFooter(s, n, TOTAL);
  }

  // ============================================================
  // SLIDE 3 — LESSON 4 TITLE / HOOK
  // ============================================================
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: C.ink };

    // Lesson chip
    s.addShape("rect", { x: 0.6, y: 0.6, w: 1.7, h: 0.4,
      fill: { color: C.cyan }, line: { color: C.cyan, width: 0 } });
    s.addText("LESSON 04", {
      x: 0.6, y: 0.6, w: 1.7, h: 0.4,
      fontSize: 12, fontFace: FONT_HEAD, color: C.paper, bold: true, charSpacing: 4,
      align: "center", valign: "middle", margin: 0
    });

    // Big title
    s.addText("Measuring & Dimensioning", {
      x: 0.6, y: 1.2, w: 9, h: 1.0,
      fontSize: 44, fontFace: FONT_HEAD, color: C.paper, bold: true, margin: 0
    });

    // Hook (left) + visual (right)
    s.addText("HOOK", {
      x: 0.6, y: 2.6, w: 1, h: 0.25,
      fontSize: 10, fontFace: FONT_HEAD, color: C.amber, bold: true, charSpacing: 4, margin: 0
    });
    s.addText("If a phone case is 2 mm too small, your phone won't fit.\nIf it's 2 mm too big, it falls off.", {
      x: 0.6, y: 2.9, w: 5.6, h: 1.5,
      fontSize: 22, fontFace: FONT_HEAD, color: C.paper, bold: true,
      lineSpacingMultiple: 1.15, margin: 0
    });
    s.addText("Today: how millimetres and dimension lines stop that from happening.", {
      x: 0.6, y: 4.4, w: 5.6, h: 0.6,
      fontSize: 14, fontFace: FONT_BODY, color: C.cyanLight, italic: true, margin: 0
    });

    // Right: stylised "2mm too small" visual
    // Outline phone (background)
    s.addShape("roundRect", { x: 6.8, y: 2.6, w: 2.3, h: 2.4,
      fill: { color: C.ink }, line: { color: C.cyan, width: 1.5 },
      rectRadius: 0.15 });
    // Inner phone (smaller, mismatched)
    s.addShape("roundRect", { x: 6.95, y: 2.75, w: 2.0, h: 2.1,
      fill: { color: C.amber, transparency: 30 }, line: { color: C.amber, width: 2 },
      rectRadius: 0.12 });
    // 2mm gap labels
    s.addText("2 mm", {
      x: 6.7, y: 4.95, w: 2.5, h: 0.3,
      fontSize: 12, fontFace: FONT_HEAD, color: C.amber, bold: true, align: "center", margin: 0
    });

    // Bottom slide number
    s.addText("HOOK · 5 min", {
      x: 0.6, y: 5.32, w: 4, h: 0.22,
      fontSize: 9, fontFace: FONT_BODY, color: C.cyan, charSpacing: 3, margin: 0
    });
    s.addText(`${n} / ${TOTAL}`, {
      x: 8.7, y: 5.32, w: 1.0, h: 0.22,
      fontSize: 9, fontFace: FONT_BODY, color: C.cyanLight, align: "right", margin: 0
    });
  }

  // ============================================================
  // SLIDE 4 — L4 LEARNING INTENTIONS
  // ============================================================
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: C.paper };
    addCornerMark(s);
    addLessonChip(s, 4, "Measuring & Dimensioning");

    s.addText("By the end of today, you can…", {
      x: 0.5, y: 0.85, w: 9, h: 0.6,
      fontSize: 28, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
    });

    // 3 learning intentions as numbered cards
    const intents = [
      { num: "01", text: "Measure objects accurately in millimetres." },
      { num: "02", text: "Add dimension lines using correct conventions." },
      { num: "03", text: "Tell the difference between a sketch line and a dimension line." }
    ];

    const ix = 0.5, iy = 1.85, iw = 9.0, ih = 0.85;
    intents.forEach((it, i) => {
      const y = iy + i * (ih + 0.2);
      s.addShape("rect", { x: ix, y, w: iw, h: ih,
        fill: { color: C.bg }, line: { color: C.rule, width: 0 } });
      // left number band
      s.addShape("rect", { x: ix, y, w: 1.1, h: ih,
        fill: { color: C.cyan }, line: { color: C.cyan, width: 0 } });
      s.addText(it.num, {
        x: ix, y, w: 1.1, h: ih,
        fontSize: 28, fontFace: FONT_HEAD, color: C.paper, bold: true,
        align: "center", valign: "middle", margin: 0
      });
      s.addText(it.text, {
        x: ix + 1.35, y, w: iw - 1.55, h: ih,
        fontSize: 18, fontFace: FONT_HEAD, color: C.ink,
        valign: "middle", margin: 0
      });
    });

    // Pedagogical timing strip
    s.addText("Direct instruction → worked example → practice → check (45-60 min)", {
      x: 0.5, y: 4.85, w: 9, h: 0.3,
      fontSize: 11, fontFace: FONT_BODY, color: C.muted, italic: true, margin: 0
    });

    addFooter(s, n, TOTAL);
  }

  // ============================================================
  // SLIDE 5 — WHY MILLIMETRES?
  // ============================================================
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: C.paper };
    addCornerMark(s);
    addLessonChip(s, 4, "Measuring & Dimensioning");

    s.addText("Why millimetres, not centimetres?", {
      x: 0.5, y: 0.85, w: 9, h: 0.6,
      fontSize: 26, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
    });
    s.addText("CAD uses the smallest practical unit so tiny features stay accurate.", {
      x: 0.5, y: 1.4, w: 9, h: 0.4,
      fontSize: 14, fontFace: FONT_BODY, color: C.muted, italic: true, margin: 0
    });

    // Two comparison columns: cm vs mm
    const colW = 4.3, colH = 3.0, colY = 2.0;
    // CM column (less precise — amber border)
    s.addShape("rect", { x: 0.5, y: colY, w: colW, h: colH,
      fill: { color: C.paper }, line: { color: C.rule, width: 1 },
      shadow: softShadow() });
    s.addShape("rect", { x: 0.5, y: colY, w: colW, h: 0.55,
      fill: { color: C.amberLight }, line: { color: C.amberLight, width: 0 } });
    s.addText("centimetres (cm)", {
      x: 0.5, y: colY, w: colW, h: 0.55,
      fontSize: 14, fontFace: FONT_HEAD, color: C.ink, bold: true, charSpacing: 2,
      align: "center", valign: "middle", margin: 0
    });
    s.addText("4 cm", {
      x: 0.5, y: colY + 0.7, w: colW, h: 0.7,
      fontSize: 38, fontFace: FONT_HEAD, color: C.muted, bold: true, align: "center", margin: 0
    });
    s.addText("\"…and a bit\"", {
      x: 0.5, y: colY + 1.45, w: colW, h: 0.4,
      fontSize: 14, fontFace: FONT_BODY, color: C.muted, italic: true, align: "center", margin: 0
    });
    s.addText("Hard to be precise about features\nlike 0.5 cm holes or 0.3 cm walls.", {
      x: 0.6, y: colY + 2.05, w: colW - 0.2, h: 0.85,
      fontSize: 12, fontFace: FONT_BODY, color: C.ink, align: "center", margin: 0
    });

    // MM column (winner — cyan border)
    s.addShape("rect", { x: 5.2, y: colY, w: colW, h: colH,
      fill: { color: C.paper }, line: { color: C.cyan, width: 2 },
      shadow: softShadow() });
    s.addShape("rect", { x: 5.2, y: colY, w: colW, h: 0.55,
      fill: { color: C.cyan }, line: { color: C.cyan, width: 0 } });
    s.addText("millimetres (mm)", {
      x: 5.2, y: colY, w: colW, h: 0.55,
      fontSize: 14, fontFace: FONT_HEAD, color: C.paper, bold: true, charSpacing: 2,
      align: "center", valign: "middle", margin: 0
    });
    s.addText("42 mm", {
      x: 5.2, y: colY + 0.7, w: colW, h: 0.7,
      fontSize: 38, fontFace: FONT_HEAD, color: C.cyan, bold: true, align: "center", margin: 0
    });
    s.addText("exact, every time", {
      x: 5.2, y: colY + 1.45, w: colW, h: 0.4,
      fontSize: 14, fontFace: FONT_BODY, color: C.cyan, italic: true, align: "center", margin: 0
    });
    s.addText("Smaller unit = greater precision.\nIndustry standard for CAD and 3D printing.", {
      x: 5.3, y: colY + 2.05, w: colW - 0.2, h: 0.85,
      fontSize: 12, fontFace: FONT_BODY, color: C.ink, align: "center", margin: 0
    });

    // Bottom rule of thumb
    s.addShape("rect", { x: 0.5, y: 5.1, w: 9, h: 0.3,
      fill: { color: C.amberLight }, line: { color: C.amberLight, width: 0 } });
    s.addText("RULE OF THUMB:  1 cm = 10 mm  ·  Always work in mm in this class.", {
      x: 0.5, y: 5.1, w: 9, h: 0.3,
      fontSize: 12, fontFace: FONT_HEAD, color: C.ink, bold: true,
      align: "center", valign: "middle", margin: 0
    });

    addFooter(s, n, TOTAL);
  }

  // ============================================================
  // SLIDE 6 — ANATOMY OF A DIMENSION
  // ============================================================
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: C.paper };
    addCornerMark(s);
    addLessonChip(s, 4, "Measuring & Dimensioning");

    s.addText("Anatomy of a dimension", {
      x: 0.5, y: 0.85, w: 9, h: 0.55,
      fontSize: 26, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
    });
    s.addText("Every dimension has the same parts. Learn them once, use them forever.", {
      x: 0.5, y: 1.4, w: 9, h: 0.4,
      fontSize: 14, fontFace: FONT_BODY, color: C.muted, italic: true, margin: 0
    });

    // LEFT: diagram of a rectangle with dimension lines
    // Rectangle (the object being dimensioned)
    const rx = 1.0, ry = 2.6, rw = 3.5, rh = 1.6;
    s.addShape("rect", { x: rx, y: ry, w: rw, h: rh,
      fill: { color: C.cyanLight, transparency: 60 }, line: { color: C.ink, width: 2.5 } });

    // BOTTOM dimension line (width)
    const dLineY = ry + rh + 0.55;
    // Horizontal line
    s.addShape("line", { x: rx, y: dLineY, w: rw, h: 0,
      line: { color: C.amber, width: 1.5 } });
    // Left arrow (small triangle)
    s.addShape("rightTriangle", { x: rx - 0.005, y: dLineY - 0.06, w: 0.12, h: 0.12,
      fill: { color: C.amber }, line: { color: C.amber, width: 0 }, rotate: 180, flipV: true });
    s.addShape("rightTriangle", { x: rx + rw - 0.115, y: dLineY - 0.06, w: 0.12, h: 0.12,
      fill: { color: C.amber }, line: { color: C.amber, width: 0 } });
    // Extension lines (from object down to dim line)
    s.addShape("line", { x: rx, y: ry + rh + 0.05, w: 0, h: 0.5,
      line: { color: C.amber, width: 0.75, dashType: "dash" } });
    s.addShape("line", { x: rx + rw, y: ry + rh + 0.05, w: 0, h: 0.5,
      line: { color: C.amber, width: 0.75, dashType: "dash" } });
    // Number above dim line, centered
    s.addShape("rect", { x: rx + rw/2 - 0.45, y: dLineY - 0.18, w: 0.9, h: 0.3,
      fill: { color: C.paper }, line: { color: C.paper, width: 0 } });
    s.addText("50 mm", {
      x: rx + rw/2 - 0.45, y: dLineY - 0.18, w: 0.9, h: 0.3,
      fontSize: 12, fontFace: FONT_HEAD, color: C.ink, bold: true,
      align: "center", valign: "middle", margin: 0
    });

    // RIGHT dimension line (height)
    const dLineX = rx + rw + 0.55;
    s.addShape("line", { x: dLineX, y: ry, w: 0, h: rh,
      line: { color: C.amber, width: 1.5 } });
    s.addShape("rightTriangle", { x: dLineX - 0.06, y: ry - 0.005, w: 0.12, h: 0.12,
      fill: { color: C.amber }, line: { color: C.amber, width: 0 }, rotate: 270 });
    s.addShape("rightTriangle", { x: dLineX - 0.06, y: ry + rh - 0.115, w: 0.12, h: 0.12,
      fill: { color: C.amber }, line: { color: C.amber, width: 0 }, rotate: 90 });
    // Extension lines
    s.addShape("line", { x: rx + rw + 0.05, y: ry, w: 0.5, h: 0,
      line: { color: C.amber, width: 0.75, dashType: "dash" } });
    s.addShape("line", { x: rx + rw + 0.05, y: ry + rh, w: 0.5, h: 0,
      line: { color: C.amber, width: 0.75, dashType: "dash" } });
    // Height number
    s.addShape("rect", { x: dLineX - 0.45, y: ry + rh/2 - 0.15, w: 0.9, h: 0.3,
      fill: { color: C.paper }, line: { color: C.paper, width: 0 } });
    s.addText("25 mm", {
      x: dLineX - 0.45, y: ry + rh/2 - 0.15, w: 0.9, h: 0.3,
      fontSize: 12, fontFace: FONT_HEAD, color: C.ink, bold: true,
      align: "center", valign: "middle", margin: 0
    });

    // RIGHT: labelled checklist of the parts
    const lx = 6.4, ly = 2.2;
    const parts = [
      { tag: "01", title: "Sketch line", desc: "The actual shape (heavy black)." },
      { tag: "02", title: "Extension line", desc: "Thin dashed line from corner to dim line." },
      { tag: "03", title: "Dimension line", desc: "Coloured line with arrows on each end." },
      { tag: "04", title: "Number + unit", desc: "\"50 mm\" — sits centred on the line." }
    ];
    parts.forEach((p, i) => {
      const y = ly + i * 0.65;
      // tag
      s.addText(p.tag, {
        x: lx, y, w: 0.4, h: 0.55,
        fontSize: 14, fontFace: FONT_HEAD, color: C.cyan, bold: true,
        valign: "top", margin: 0
      });
      // title
      s.addText(p.title, {
        x: lx + 0.45, y, w: 3.0, h: 0.28,
        fontSize: 13, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
      });
      // desc
      s.addText(p.desc, {
        x: lx + 0.45, y: y + 0.28, w: 3.0, h: 0.28,
        fontSize: 11, fontFace: FONT_BODY, color: C.muted, margin: 0
      });
    });

    addFooter(s, n, TOTAL);
  }

  // ============================================================
  // SLIDE 7 — WORKED EXAMPLE
  // ============================================================
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: C.paper };
    addCornerMark(s);
    addLessonChip(s, 4, "Measuring & Dimensioning");

    // Eyebrow
    s.addText("WORKED EXAMPLE", {
      x: 0.5, y: 0.85, w: 5, h: 0.3,
      fontSize: 11, fontFace: FONT_HEAD, color: C.amber, bold: true, charSpacing: 5, margin: 0
    });
    s.addText("Watch me dimension this rectangle, step by step.", {
      x: 0.5, y: 1.15, w: 9, h: 0.5,
      fontSize: 22, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
    });

    // 4 step strip
    const steps = [
      { n: "1", t: "Measure", d: "Length first,\nthen height." },
      { n: "2", t: "Outside", d: "Dim lines go\noutside the shape." },
      { n: "3", t: "Arrows", d: "One arrow on\neach end." },
      { n: "4", t: "Number + mm", d: "Always include\nthe unit." }
    ];
    const sw = 2.0, sh = 1.55, gap = 0.2;
    const startX = 0.5;
    const stepY = 1.9;

    steps.forEach((st, i) => {
      const x = startX + i * (sw + gap);
      // body
      s.addShape("rect", { x, y: stepY, w: sw, h: sh,
        fill: { color: C.bg }, line: { color: C.rule, width: 0 } });
      // step number circle
      s.addShape("ellipse", { x: x + 0.15, y: stepY + 0.15, w: 0.5, h: 0.5,
        fill: { color: C.cyan }, line: { color: C.cyan, width: 0 } });
      s.addText(st.n, {
        x: x + 0.15, y: stepY + 0.15, w: 0.5, h: 0.5,
        fontSize: 18, fontFace: FONT_HEAD, color: C.paper, bold: true,
        align: "center", valign: "middle", margin: 0
      });
      // title
      s.addText(st.t, {
        x: x + 0.15, y: stepY + 0.75, w: sw - 0.3, h: 0.3,
        fontSize: 14, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
      });
      // desc
      s.addText(st.d, {
        x: x + 0.15, y: stepY + 1.05, w: sw - 0.3, h: 0.45,
        fontSize: 10, fontFace: FONT_BODY, color: C.muted, margin: 0
      });
      // arrow between cards (except last)
      if (i < steps.length - 1) {
        s.addImage({ data: ICN.arrow, x: x + sw + 0.04, y: stepY + sh/2 - 0.07, w: 0.14, h: 0.14 });
      }
    });

    // Common mistake callout
    s.addShape("rect", { x: 0.5, y: 3.7, w: 9, h: 1.3,
      fill: { color: C.amberLight }, line: { color: C.amberLight, width: 0 } });
    s.addShape("rect", { x: 0.5, y: 3.7, w: 0.08, h: 1.3,
      fill: { color: C.amber }, line: { color: C.amber, width: 0 } });
    s.addImage({ data: ICN.warning, x: 0.75, y: 3.85, w: 0.4, h: 0.4 });
    s.addText("Common mistake", {
      x: 1.3, y: 3.78, w: 7, h: 0.32,
      fontSize: 13, fontFace: FONT_HEAD, color: C.ink, bold: true, charSpacing: 1, margin: 0
    });
    s.addText("Writing \"50\" instead of \"50 mm\". Without the unit, the printer doesn't know whether you mean 50 mm, 50 cm, or 50 inches. Always include mm.", {
      x: 1.3, y: 4.13, w: 8.0, h: 0.8,
      fontSize: 13, fontFace: FONT_BODY, color: C.ink, margin: 0
    });

    addFooter(s, n, TOTAL);
  }

  // ============================================================
  // SLIDE 8 — YOUR TURN: GUIDED PRACTICE
  // ============================================================
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: C.paper };
    addCornerMark(s);
    addLessonChip(s, 4, "Measuring & Dimensioning");

    // Eyebrow + title
    s.addText("YOUR TURN  ·  10 MINUTES", {
      x: 0.5, y: 0.85, w: 6, h: 0.3,
      fontSize: 11, fontFace: FONT_HEAD, color: C.cyan, bold: true, charSpacing: 5, margin: 0
    });
    s.addText("Measure & dimension a rectangle", {
      x: 0.5, y: 1.15, w: 9, h: 0.55,
      fontSize: 24, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
    });

    // Two column: instructions | what to do
    // LEFT: instructions list
    const lx = 0.5, ly = 1.95, lw = 5.5;
    const tasks = [
      "Open your workbook to page 14.",
      "Get a ruler. Measure the items in the table in mm.",
      "Convert: 4 cm = ___ mm,  75 mm = ___ cm.",
      "Sketch a 50 × 25 mm rectangle on the grid.",
      "Add full dimensions to your sketch."
    ];
    tasks.forEach((t, i) => {
      const y = ly + i * 0.55;
      // numbered circle
      s.addShape("ellipse", { x: lx, y: y + 0.05, w: 0.35, h: 0.35,
        fill: { color: C.bg }, line: { color: C.cyan, width: 1.5 } });
      s.addText(String(i + 1), {
        x: lx, y: y + 0.05, w: 0.35, h: 0.35,
        fontSize: 12, fontFace: FONT_HEAD, color: C.cyan, bold: true,
        align: "center", valign: "middle", margin: 0
      });
      s.addText(t, {
        x: lx + 0.5, y, w: lw - 0.5, h: 0.45,
        fontSize: 14, fontFace: FONT_BODY, color: C.ink, valign: "middle", margin: 0
      });
    });

    // RIGHT: "Success criteria" panel
    const rx = 6.4, ry = 1.95, rw = 3.1, rh = 3.05;
    s.addShape("rect", { x: rx, y: ry, w: rw, h: rh,
      fill: { color: C.ink }, line: { color: C.ink, width: 0 } });
    s.addText("SUCCESS CRITERIA", {
      x: rx + 0.25, y: ry + 0.2, w: rw - 0.5, h: 0.3,
      fontSize: 11, fontFace: FONT_HEAD, color: C.cyan, bold: true, charSpacing: 4, margin: 0
    });
    s.addText("My sketch has…", {
      x: rx + 0.25, y: ry + 0.5, w: rw - 0.5, h: 0.4,
      fontSize: 16, fontFace: FONT_HEAD, color: C.paper, bold: true, margin: 0
    });
    const checks = [
      "All measurements in mm",
      "Dimension lines outside the shape",
      "Arrows on both ends",
      "Numbers clearly readable",
      "Origin marked with +"
    ];
    checks.forEach((c, i) => {
      const y = ry + 1.05 + i * 0.36;
      s.addImage({ data: ICN.check, x: rx + 0.25, y: y + 0.04, w: 0.2, h: 0.2 });
      s.addText(c, {
        x: rx + 0.55, y, w: rw - 0.7, h: 0.3,
        fontSize: 11, fontFace: FONT_BODY, color: C.paper, valign: "middle", margin: 0
      });
    });

    addFooter(s, n, TOTAL);
  }

  // ============================================================
  // SLIDE 9 — QUICK CHECK (MCQ)
  // ============================================================
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: C.paper };
    addCornerMark(s);
    addLessonChip(s, 4, "Measuring & Dimensioning");

    // Eyebrow
    s.addText("QUICK CHECK  ·  3 MINUTES", {
      x: 0.5, y: 0.85, w: 6, h: 0.3,
      fontSize: 11, fontFace: FONT_HEAD, color: C.cyan, bold: true, charSpacing: 5, margin: 0
    });

    // Question
    s.addText("Which is the correct way to write a dimension?", {
      x: 0.5, y: 1.18, w: 9, h: 0.6,
      fontSize: 24, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
    });

    // 4 answer cards (2x2 grid)
    const opts = [
      { letter: "A", text: "5",       correct: false, why: "missing the unit" },
      { letter: "B", text: "5 things", correct: false, why: "not a real unit"  },
      { letter: "C", text: "50 mm",   correct: true,  why: "number + mm — perfect" },
      { letter: "D", text: "fifty",   correct: false, why: "words, no number" }
    ];
    const ow = 4.3, oh = 1.3, ogap = 0.25;
    const baseX = 0.5, baseY = 2.0;
    opts.forEach((o, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = baseX + col * (ow + ogap);
      const y = baseY + row * (oh + ogap);
      // body — correct gets cyan border
      s.addShape("rect", { x, y, w: ow, h: oh,
        fill: { color: C.paper },
        line: { color: o.correct ? C.cyan : C.rule, width: o.correct ? 2.5 : 1 },
        shadow: softShadow() });
      // letter chip
      s.addShape("rect", { x, y, w: 0.6, h: oh,
        fill: { color: o.correct ? C.cyan : C.bg }, line: { color: "FFFFFF", width: 0 } });
      s.addText(o.letter, {
        x, y, w: 0.6, h: oh,
        fontSize: 28, fontFace: FONT_HEAD,
        color: o.correct ? C.paper : C.muted,
        bold: true, align: "center", valign: "middle", margin: 0
      });
      // option text
      s.addText(o.text, {
        x: x + 0.8, y: y + 0.18, w: ow - 1.0, h: 0.5,
        fontSize: 20, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
      });
      // why (small)
      s.addText(o.correct ? "✓ correct  ·  " + o.why : o.why, {
        x: x + 0.8, y: y + 0.72, w: ow - 1.0, h: 0.4,
        fontSize: 11, fontFace: FONT_BODY,
        color: o.correct ? C.green : C.muted, italic: true, margin: 0
      });
    });

    addFooter(s, n, TOTAL);
  }

  // ============================================================
  // SLIDE 10 — LESSON 5 TITLE / HOOK
  // ============================================================
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: C.ink };

    s.addShape("rect", { x: 0.6, y: 0.6, w: 1.7, h: 0.4,
      fill: { color: C.cyan }, line: { color: C.cyan, width: 0 } });
    s.addText("LESSON 05", {
      x: 0.6, y: 0.6, w: 1.7, h: 0.4,
      fontSize: 12, fontFace: FONT_HEAD, color: C.paper, bold: true, charSpacing: 4,
      align: "center", valign: "middle", margin: 0
    });

    s.addText("Geometric Constraints", {
      x: 0.6, y: 1.2, w: 9, h: 1.0,
      fontSize: 44, fontFace: FONT_HEAD, color: C.paper, bold: true, margin: 0
    });

    s.addText("HOOK", {
      x: 0.6, y: 2.6, w: 1, h: 0.25,
      fontSize: 10, fontFace: FONT_HEAD, color: C.amber, bold: true, charSpacing: 4, margin: 0
    });
    s.addText("You drew a square.\nLooks fine — until someone bumps it.", {
      x: 0.6, y: 2.9, w: 5.6, h: 1.4,
      fontSize: 22, fontFace: FONT_HEAD, color: C.paper, bold: true,
      lineSpacingMultiple: 1.15, margin: 0
    });
    s.addText("Constraints are the rules that stop your sketch from changing shape.", {
      x: 0.6, y: 4.35, w: 6, h: 0.6,
      fontSize: 14, fontFace: FONT_BODY, color: C.cyanLight, italic: true, margin: 0
    });

    // RIGHT: before/after squares (wonky vs clean)
    // Wonky square (slightly skewed, no constraints)
    s.addShape("rect", { x: 6.85, y: 2.55, w: 1.05, h: 0.95,
      fill: { color: C.amber, transparency: 60 }, line: { color: C.amber, width: 2 }, rotate: 6 });
    s.addText("no rules", {
      x: 6.7, y: 3.55, w: 1.4, h: 0.3,
      fontSize: 10, fontFace: FONT_HEAD, color: C.amber, italic: true, align: "center", margin: 0
    });
    // Arrow
    s.addImage({ data: ICN.arrow, x: 8.05, y: 2.95, w: 0.3, h: 0.3 });
    // Crisp square (with constraints)
    s.addShape("rect", { x: 8.45, y: 2.6, w: 1.0, h: 1.0,
      fill: { color: C.cyan, transparency: 60 }, line: { color: C.cyan, width: 2.5 } });
    s.addText("locked", {
      x: 8.3, y: 3.65, w: 1.3, h: 0.3,
      fontSize: 10, fontFace: FONT_HEAD, color: C.cyan, italic: true, align: "center", margin: 0
    });

    s.addText("DIRECT INSTRUCTION · 10 min", {
      x: 0.6, y: 5.32, w: 5, h: 0.22,
      fontSize: 9, fontFace: FONT_BODY, color: C.cyan, charSpacing: 3, margin: 0
    });
    s.addText(`${n} / ${TOTAL}`, {
      x: 8.7, y: 5.32, w: 1.0, h: 0.22,
      fontSize: 9, fontFace: FONT_BODY, color: C.cyanLight, align: "right", margin: 0
    });
  }

  // ============================================================
  // SLIDE 11 — L5 LEARNING INTENTIONS
  // ============================================================
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: C.paper };
    addCornerMark(s);
    addLessonChip(s, 5, "Geometric Constraints");

    s.addText("By the end of today, you can…", {
      x: 0.5, y: 0.85, w: 9, h: 0.6,
      fontSize: 28, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
    });

    const intents = [
      { num: "01", text: "Define what a constraint is in CAD." },
      { num: "02", text: "Identify the seven common constraints by name." },
      { num: "03", text: "Apply constraints to lock a sketch in place." }
    ];
    const ix = 0.5, iy = 1.85, iw = 9.0, ih = 0.85;
    intents.forEach((it, i) => {
      const y = iy + i * (ih + 0.2);
      s.addShape("rect", { x: ix, y, w: iw, h: ih,
        fill: { color: C.bg }, line: { color: C.rule, width: 0 } });
      s.addShape("rect", { x: ix, y, w: 1.1, h: ih,
        fill: { color: C.cyan }, line: { color: C.cyan, width: 0 } });
      s.addText(it.num, {
        x: ix, y, w: 1.1, h: ih,
        fontSize: 28, fontFace: FONT_HEAD, color: C.paper, bold: true,
        align: "center", valign: "middle", margin: 0
      });
      s.addText(it.text, {
        x: ix + 1.35, y, w: iw - 1.55, h: ih,
        fontSize: 18, fontFace: FONT_HEAD, color: C.ink,
        valign: "middle", margin: 0
      });
    });

    s.addText("Direct instruction → constraint detective → independent practice (45-60 min)", {
      x: 0.5, y: 4.85, w: 9, h: 0.3,
      fontSize: 11, fontFace: FONT_BODY, color: C.muted, italic: true, margin: 0
    });

    addFooter(s, n, TOTAL);
  }

  // ============================================================
  // SLIDE 12 — WHAT IS A CONSTRAINT? (analogy)
  // ============================================================
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: C.paper };
    addCornerMark(s);
    addLessonChip(s, 5, "Geometric Constraints");

    s.addText("What's a constraint?", {
      x: 0.5, y: 0.85, w: 9, h: 0.55,
      fontSize: 26, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
    });

    // Big definition box
    s.addShape("rect", { x: 0.5, y: 1.55, w: 9, h: 1.05,
      fill: { color: C.cyanLight }, line: { color: C.cyan, width: 0 } });
    s.addShape("rect", { x: 0.5, y: 1.55, w: 0.1, h: 1.05,
      fill: { color: C.cyan }, line: { color: C.cyan, width: 0 } });
    s.addText("A constraint is a rule you give a sketch line.", {
      x: 0.85, y: 1.65, w: 8.4, h: 0.45,
      fontSize: 22, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
    });
    s.addText("It tells the line how it must behave — and stops the sketch from changing shape when you don't want it to.", {
      x: 0.85, y: 2.1, w: 8.4, h: 0.45,
      fontSize: 14, fontFace: FONT_BODY, color: C.inkLight, italic: true, margin: 0
    });

    // Analogy section header
    s.addText("THINK OF IT LIKE…", {
      x: 0.5, y: 2.85, w: 9, h: 0.3,
      fontSize: 11, fontFace: FONT_HEAD, color: C.cyan, bold: true, charSpacing: 5, margin: 0
    });

    // Three analogies side by side
    const analogies = [
      { emoji: "🚆", title: "Train tracks", text: "Tracks must stay parallel — that's a parallel constraint." },
      { emoji: "📐", title: "Set square", text: "Forces a 90° corner every time — a perpendicular constraint." },
      { emoji: "🪢", title: "Anchored knot", text: "A point pinned to a line stays there — a coincident constraint." }
    ];
    const aw = 2.85, ah = 1.7, ax = 0.5, ay = 3.2, agap = 0.225;
    analogies.forEach((a, i) => {
      const x = ax + i * (aw + agap);
      s.addShape("rect", { x, y: ay, w: aw, h: ah,
        fill: { color: C.bg }, line: { color: C.rule, width: 0 } });
      s.addText(a.emoji, {
        x: x + 0.15, y: ay + 0.15, w: 0.7, h: 0.7,
        fontSize: 32, fontFace: FONT_HEAD, margin: 0
      });
      s.addText(a.title, {
        x: x + 0.95, y: ay + 0.2, w: aw - 1.1, h: 0.4,
        fontSize: 16, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
      });
      s.addText(a.text, {
        x: x + 0.2, y: ay + 0.95, w: aw - 0.4, h: 0.7,
        fontSize: 12, fontFace: FONT_BODY, color: C.muted, margin: 0
      });
    });

    addFooter(s, n, TOTAL);
  }

  // ============================================================
  // SLIDE 13 — THE 7 CONSTRAINTS (visual reference)
  // ============================================================
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: C.paper };
    addCornerMark(s);
    addLessonChip(s, 5, "Geometric Constraints");

    s.addText("The seven constraints you'll meet", {
      x: 0.5, y: 0.85, w: 9, h: 0.55,
      fontSize: 24, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
    });
    s.addText("Each one fixes a specific relationship. Memorise these — they show up every lesson.", {
      x: 0.5, y: 1.4, w: 9, h: 0.35,
      fontSize: 12, fontFace: FONT_BODY, color: C.muted, italic: true, margin: 0
    });

    // 7 constraint cards in a 4+3 layout
    // Each card: a tiny visual + name + 1-line desc
    const constraints = [
      { name: "Horizontal",    desc: "Snaps a line flat (left to right).", drawer: "horiz" },
      { name: "Vertical",      desc: "Snaps a line straight up & down.",   drawer: "vert" },
      { name: "Parallel",      desc: "Two lines stay side by side.",       drawer: "parallel" },
      { name: "Perpendicular", desc: "Two lines meet at exactly 90°.",     drawer: "perp" },
      { name: "Equal",         desc: "Two lines (or circles) match size.", drawer: "equal" },
      { name: "Coincident",    desc: "A point sits exactly on a line.",    drawer: "coincident" },
      { name: "Tangent",       desc: "A line just touches a circle.",      drawer: "tangent" }
    ];

    // 4 cards on top row, 3 on bottom row
    const cardW = 2.2, cardH = 1.55;
    const rowGap = 0.15;
    // Top row x: 0.5, 2.85, 5.2, 7.55 (4 cards × 2.2 + 3 gaps × 0.15 = 8.8 + 0.45 = 9.25, so end x ~9.75)
    // Better: ensure they fit in 9.5 wide content area
    // 4 cards * 2.2 = 8.8; 3 gaps = 0.45 → total 9.25 → start at 0.625 to centre
    const topY = 1.85;
    const botY = topY + cardH + 0.18;
    const topStartX = (10 - (4 * cardW + 3 * rowGap)) / 2;
    const botStartX = (10 - (3 * cardW + 2 * rowGap)) / 2;

    function drawConstraintMini(s, drawer, x, y, w, h) {
      // mini visual area centred at top of card
      const cx = x + w/2;
      const cy = y + 0.35;
      switch (drawer) {
        case "horiz": {
          s.addShape("line", { x: cx - 0.5, y: cy + 0.05, w: 1.0, h: 0,
            line: { color: C.cyan, width: 3.5 } });
          break;
        }
        case "vert": {
          s.addShape("line", { x: cx, y: cy - 0.3, w: 0, h: 0.7,
            line: { color: C.cyan, width: 3.5 } });
          break;
        }
        case "parallel": {
          s.addShape("line", { x: cx - 0.5, y: cy - 0.1, w: 1.0, h: 0,
            line: { color: C.cyan, width: 2.5 } });
          s.addShape("line", { x: cx - 0.5, y: cy + 0.2, w: 1.0, h: 0,
            line: { color: C.cyan, width: 2.5 } });
          break;
        }
        case "perp": {
          s.addShape("line", { x: cx - 0.05, y: cy - 0.3, w: 0, h: 0.7,
            line: { color: C.cyan, width: 2.5 } });
          s.addShape("line", { x: cx - 0.05, y: cy + 0.4, w: 0.5, h: 0,
            line: { color: C.cyan, width: 2.5 } });
          // tiny right-angle square
          s.addShape("rect", { x: cx - 0.05, y: cy + 0.32, w: 0.08, h: 0.08,
            fill: { color: C.paper }, line: { color: C.cyan, width: 1 } });
          break;
        }
        case "equal": {
          s.addShape("line", { x: cx - 0.5, y: cy - 0.05, w: 0.45, h: 0,
            line: { color: C.cyan, width: 2.5 } });
          s.addShape("line", { x: cx + 0.05, y: cy - 0.05, w: 0.45, h: 0,
            line: { color: C.cyan, width: 2.5 } });
          // equal tick marks
          s.addText("=", {
            x: cx - 0.15, y: cy + 0.05, w: 0.3, h: 0.25,
            fontSize: 16, fontFace: FONT_HEAD, color: C.amber, bold: true,
            align: "center", margin: 0
          });
          break;
        }
        case "coincident": {
          s.addShape("line", { x: cx - 0.5, y: cy + 0.1, w: 1.0, h: 0,
            line: { color: C.cyan, width: 2.5 } });
          s.addShape("ellipse", { x: cx - 0.07, y: cy + 0.03, w: 0.15, h: 0.15,
            fill: { color: C.amber }, line: { color: C.amber, width: 0 } });
          break;
        }
        case "tangent": {
          s.addShape("ellipse", { x: cx - 0.3, y: cy - 0.2, w: 0.55, h: 0.55,
            fill: { color: C.paper }, line: { color: C.cyan, width: 2.5 } });
          s.addShape("line", { x: cx + 0.25, y: cy - 0.3, w: 0, h: 0.7,
            line: { color: C.cyan, width: 2.5 } });
          break;
        }
      }
    }

    constraints.forEach((c, i) => {
      let x, y;
      if (i < 4) {
        x = topStartX + i * (cardW + rowGap);
        y = topY;
      } else {
        x = botStartX + (i - 4) * (cardW + rowGap);
        y = botY;
      }
      // card
      s.addShape("rect", { x, y, w: cardW, h: cardH,
        fill: { color: C.paper }, line: { color: C.rule, width: 1 },
        shadow: softShadow() });
      // top accent
      s.addShape("rect", { x, y, w: 0.06, h: cardH,
        fill: { color: C.cyan }, line: { color: C.cyan, width: 0 } });
      // mini visual (top)
      drawConstraintMini(s, c.drawer, x, y, cardW, cardH);
      // name
      s.addText(c.name, {
        x: x + 0.15, y: y + 0.85, w: cardW - 0.3, h: 0.32,
        fontSize: 14, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
      });
      // desc
      s.addText(c.desc, {
        x: x + 0.15, y: y + 1.18, w: cardW - 0.3, h: 0.4,
        fontSize: 10, fontFace: FONT_BODY, color: C.muted, margin: 0
      });
    });

    addFooter(s, n, TOTAL);
  }

  // ============================================================
  // SLIDE 14 — CONSTRAINT DETECTIVE (worked example)
  // ============================================================
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: C.paper };
    addCornerMark(s);
    addLessonChip(s, 5, "Geometric Constraints");

    s.addText("CONSTRAINT DETECTIVE", {
      x: 0.5, y: 0.85, w: 6, h: 0.3,
      fontSize: 11, fontFace: FONT_HEAD, color: C.amber, bold: true, charSpacing: 5, margin: 0
    });
    s.addText("Spot the constraint in each clue.", {
      x: 0.5, y: 1.15, w: 9, h: 0.5,
      fontSize: 22, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
    });

    // 5 clue rows
    const clues = [
      { hint: "Two lines that meet to form a perfect right angle.", answer: "PERPENDICULAR" },
      { hint: "A line that runs straight up and down.", answer: "VERTICAL" },
      { hint: "Two lines that stay the same distance apart, never touching.", answer: "PARALLEL" },
      { hint: "Two lines drawn at the same length.", answer: "EQUAL" },
      { hint: "A point that sits exactly on a line.", answer: "COINCIDENT" }
    ];
    const cy = 1.95;
    const ch = 0.55;
    const cgap = 0.07;
    clues.forEach((c, i) => {
      const y = cy + i * (ch + cgap);
      // row body
      s.addShape("rect", { x: 0.5, y, w: 9, h: ch,
        fill: { color: i % 2 === 0 ? C.bg : C.paper }, line: { color: C.rule, width: 0 } });
      // hint number
      s.addText(`0${i + 1}`, {
        x: 0.65, y, w: 0.5, h: ch,
        fontSize: 14, fontFace: FONT_HEAD, color: C.cyan, bold: true,
        valign: "middle", margin: 0
      });
      // hint text
      s.addText(c.hint, {
        x: 1.2, y, w: 5.5, h: ch,
        fontSize: 13, fontFace: FONT_BODY, color: C.ink,
        valign: "middle", margin: 0
      });
      // arrow
      s.addImage({ data: ICN.arrow, x: 6.85, y: y + ch/2 - 0.07, w: 0.14, h: 0.14 });
      // answer chip
      s.addShape("rect", { x: 7.1, y: y + 0.08, w: 2.2, h: ch - 0.16,
        fill: { color: C.cyanLight }, line: { color: C.cyan, width: 1 } });
      s.addText(c.answer, {
        x: 7.1, y: y + 0.08, w: 2.2, h: ch - 0.16,
        fontSize: 11, fontFace: FONT_HEAD, color: C.ink, bold: true, charSpacing: 2,
        align: "center", valign: "middle", margin: 0
      });
    });

    // Bottom tip
    s.addText("TEACHER TIP:  Walk through 1-2 together, then have students work the rest in pairs.", {
      x: 0.5, y: 5.05, w: 9, h: 0.3,
      fontSize: 11, fontFace: FONT_BODY, color: C.muted, italic: true, margin: 0
    });

    addFooter(s, n, TOTAL);
  }

  // ============================================================
  // SLIDE 15 — YOUR TURN: CONSTRAINTS PRACTICE
  // ============================================================
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: C.paper };
    addCornerMark(s);
    addLessonChip(s, 5, "Geometric Constraints");

    s.addText("YOUR TURN  ·  12 MINUTES", {
      x: 0.5, y: 0.85, w: 6, h: 0.3,
      fontSize: 11, fontFace: FONT_HEAD, color: C.cyan, bold: true, charSpacing: 5, margin: 0
    });
    s.addText("Lock down a perfect square", {
      x: 0.5, y: 1.15, w: 9, h: 0.55,
      fontSize: 24, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
    });

    // Left: the prompt
    const lx = 0.5, ly = 1.95, lw = 5.4;
    s.addText("List the THREE constraints you would use to make a perfect square.\n\nFor each one, write a sentence explaining why you chose it.", {
      x: lx, y: ly, w: lw, h: 1.4,
      fontSize: 15, fontFace: FONT_BODY, color: C.ink, margin: 0
    });

    // 3 numbered slots
    const slotY = 3.5, slotH = 0.45;
    for (let i = 0; i < 3; i++) {
      const y = slotY + i * (slotH + 0.08);
      s.addShape("ellipse", { x: lx, y: y + 0.05, w: 0.35, h: 0.35,
        fill: { color: C.bg }, line: { color: C.cyan, width: 1.5 } });
      s.addText(String(i + 1), {
        x: lx, y: y + 0.05, w: 0.35, h: 0.35,
        fontSize: 12, fontFace: FONT_HEAD, color: C.cyan, bold: true,
        align: "center", valign: "middle", margin: 0
      });
      // line for student to write on
      s.addShape("line", { x: lx + 0.5, y: y + slotH - 0.1, w: lw - 0.5, h: 0,
        line: { color: C.muted, width: 0.75, dashType: "dash" } });
    }

    // RIGHT: hint card
    const rx = 6.4, ry = 1.95, rw = 3.1, rh = 3.05;
    s.addShape("rect", { x: rx, y: ry, w: rw, h: rh,
      fill: { color: C.bg }, line: { color: C.rule, width: 0 } });
    s.addImage({ data: ICN.bulb, x: rx + 0.25, y: ry + 0.25, w: 0.45, h: 0.45 });
    s.addText("STUCK?  TRY THIS", {
      x: rx + 0.85, y: ry + 0.3, w: rw - 1, h: 0.32,
      fontSize: 11, fontFace: FONT_HEAD, color: C.cyan, bold: true, charSpacing: 4, margin: 0
    });
    s.addText("A square has 4 right angles and 4 equal sides.\n\nThink: which constraints control angles, and which control side length?", {
      x: rx + 0.25, y: ry + 0.95, w: rw - 0.5, h: 1.85,
      fontSize: 13, fontFace: FONT_BODY, color: C.ink, margin: 0
    });

    addFooter(s, n, TOTAL);
  }

  // ============================================================
  // SLIDE 16 — FULLY DEFINED (key concept)
  // ============================================================
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: C.paper };
    addCornerMark(s);
    addLessonChip(s, 5, "Geometric Constraints");

    s.addText("KEY IDEA", {
      x: 0.5, y: 0.85, w: 5, h: 0.3,
      fontSize: 11, fontFace: FONT_HEAD, color: C.amber, bold: true, charSpacing: 5, margin: 0
    });
    s.addText("Fully defined", {
      x: 0.5, y: 1.15, w: 9, h: 0.7,
      fontSize: 36, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
    });

    // Definition
    s.addText("A sketch is FULLY DEFINED when every line is locked down by dimensions and constraints. Nothing can move. Nothing can change.", {
      x: 0.5, y: 1.95, w: 9, h: 0.85,
      fontSize: 17, fontFace: FONT_BODY, color: C.ink, margin: 0
    });

    // Two-column comparison: under-defined (problem) vs fully-defined (target)
    const colY = 3.0, colH = 1.95;

    // LEFT: under-defined
    s.addShape("rect", { x: 0.5, y: colY, w: 4.4, h: colH,
      fill: { color: C.paper }, line: { color: C.amber, width: 1.5 } });
    s.addShape("rect", { x: 0.5, y: colY, w: 4.4, h: 0.4,
      fill: { color: C.amberLight }, line: { color: C.amberLight, width: 0 } });
    s.addImage({ data: ICN.cross, x: 0.65, y: colY + 0.07, w: 0.27, h: 0.27 });
    s.addText("Under-defined", {
      x: 1.0, y: colY + 0.05, w: 3.4, h: 0.3,
      fontSize: 13, fontFace: FONT_HEAD, color: C.ink, bold: true,
      valign: "middle", margin: 0
    });
    s.addText([
      { text: "Lines are still loose", options: { bullet: true, breakLine: true, fontSize: 12 } },
      { text: "Sketch can be dragged into a different shape", options: { bullet: true, breakLine: true, fontSize: 12 } },
      { text: "Fusion 360 shows it in BLUE", options: { bullet: true, fontSize: 12 } }
    ], {
      x: 0.7, y: colY + 0.5, w: 4.0, h: 1.4,
      fontSize: 12, fontFace: FONT_BODY, color: C.ink, paraSpaceAfter: 4, margin: 0
    });

    // RIGHT: fully defined
    s.addShape("rect", { x: 5.1, y: colY, w: 4.4, h: colH,
      fill: { color: C.paper }, line: { color: C.cyan, width: 2 } });
    s.addShape("rect", { x: 5.1, y: colY, w: 4.4, h: 0.4,
      fill: { color: C.cyan }, line: { color: C.cyan, width: 0 } });
    s.addImage({ data: ICN.check, x: 5.25, y: colY + 0.07, w: 0.27, h: 0.27 });
    s.addText("Fully defined", {
      x: 5.6, y: colY + 0.05, w: 3.4, h: 0.3,
      fontSize: 13, fontFace: FONT_HEAD, color: C.paper, bold: true,
      valign: "middle", margin: 0
    });
    s.addText([
      { text: "Every line has dimensions and constraints", options: { bullet: true, breakLine: true, fontSize: 12 } },
      { text: "Sketch holds its shape no matter what", options: { bullet: true, breakLine: true, fontSize: 12 } },
      { text: "Fusion 360 shows it in BLACK", options: { bullet: true, fontSize: 12 } }
    ], {
      x: 5.3, y: colY + 0.5, w: 4.0, h: 1.4,
      fontSize: 12, fontFace: FONT_BODY, color: C.ink, paraSpaceAfter: 4, margin: 0
    });

    // Bottom takeaway
    s.addText("Aim for fully defined. Black lines = good lines.", {
      x: 0.5, y: 5.1, w: 9, h: 0.3,
      fontSize: 13, fontFace: FONT_HEAD, color: C.cyan, bold: true, italic: true,
      align: "center", margin: 0
    });

    addFooter(s, n, TOTAL);
  }

  // ============================================================
  // SLIDE 17 — LESSON 6 TITLE / HOOK
  // ============================================================
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: C.ink };

    s.addShape("rect", { x: 0.6, y: 0.6, w: 1.7, h: 0.4,
      fill: { color: C.cyan }, line: { color: C.cyan, width: 0 } });
    s.addText("LESSON 06", {
      x: 0.6, y: 0.6, w: 1.7, h: 0.4,
      fontSize: 12, fontFace: FONT_HEAD, color: C.paper, bold: true, charSpacing: 4,
      align: "center", valign: "middle", margin: 0
    });

    s.addText("Sketching Real Objects", {
      x: 0.6, y: 1.2, w: 9, h: 1.0,
      fontSize: 44, fontFace: FONT_HEAD, color: C.paper, bold: true, margin: 0
    });

    s.addText("HOOK", {
      x: 0.6, y: 2.6, w: 1, h: 0.25,
      fontSize: 10, fontFace: FONT_HEAD, color: C.amber, bold: true, charSpacing: 4, margin: 0
    });
    s.addText("Designers don't invent shapes —\nthey measure what already exists.", {
      x: 0.6, y: 2.9, w: 6, h: 1.4,
      fontSize: 22, fontFace: FONT_HEAD, color: C.paper, bold: true,
      lineSpacingMultiple: 1.15, margin: 0
    });
    s.addText("Today: turn a real object into a CAD-ready sketch.", {
      x: 0.6, y: 4.35, w: 6, h: 0.5,
      fontSize: 14, fontFace: FONT_BODY, color: C.cyanLight, italic: true, margin: 0
    });

    // RIGHT: stylised "object → sketch" diagram
    // Eraser-ish rectangle (real object)
    s.addShape("roundRect", { x: 6.85, y: 2.65, w: 1.0, h: 0.55,
      fill: { color: C.amber, transparency: 30 }, line: { color: C.amber, width: 2 },
      rectRadius: 0.06 });
    s.addText("real", {
      x: 6.7, y: 3.25, w: 1.3, h: 0.25,
      fontSize: 10, fontFace: FONT_HEAD, color: C.amber, italic: true, align: "center", margin: 0
    });
    // Arrow with measurement annotation
    s.addImage({ data: ICN.arrow, x: 7.95, y: 2.85, w: 0.4, h: 0.4 });
    s.addText("measure", {
      x: 7.7, y: 3.3, w: 0.95, h: 0.2,
      fontSize: 9, fontFace: FONT_HEAD, color: C.cyan, italic: true, align: "center", margin: 0
    });
    // Sketched rectangle (CAD)
    s.addShape("rect", { x: 8.45, y: 2.65, w: 1.0, h: 0.55,
      fill: { color: "00000000", transparency: 100 }, line: { color: C.cyan, width: 2 } });
    // tiny dimension lines
    s.addShape("line", { x: 8.45, y: 3.4, w: 1.0, h: 0,
      line: { color: C.cyan, width: 1 } });
    s.addText("60 mm", {
      x: 8.4, y: 3.45, w: 1.1, h: 0.22,
      fontSize: 9, fontFace: FONT_HEAD, color: C.cyan, bold: true, align: "center", margin: 0
    });

    s.addText("INDEPENDENT WORK · 30 min", {
      x: 0.6, y: 5.32, w: 5, h: 0.22,
      fontSize: 9, fontFace: FONT_BODY, color: C.cyan, charSpacing: 3, margin: 0
    });
    s.addText(`${n} / ${TOTAL}`, {
      x: 8.7, y: 5.32, w: 1.0, h: 0.22,
      fontSize: 9, fontFace: FONT_BODY, color: C.cyanLight, align: "right", margin: 0
    });
  }

  // ============================================================
  // SLIDE 18 — L6 LEARNING INTENTIONS
  // ============================================================
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: C.paper };
    addCornerMark(s);
    addLessonChip(s, 6, "Sketching Real Objects");

    s.addText("By the end of today, you can…", {
      x: 0.5, y: 0.85, w: 9, h: 0.6,
      fontSize: 28, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
    });

    const intents = [
      { num: "01", text: "Apply measuring and dimensioning to a real object." },
      { num: "02", text: "Sketch an object to scale on a grid." },
      { num: "03", text: "Combine constraints and dimensions in a single sketch." }
    ];
    const ix = 0.5, iy = 1.85, iw = 9.0, ih = 0.85;
    intents.forEach((it, i) => {
      const y = iy + i * (ih + 0.2);
      s.addShape("rect", { x: ix, y, w: iw, h: ih,
        fill: { color: C.bg }, line: { color: C.rule, width: 0 } });
      s.addShape("rect", { x: ix, y, w: 1.1, h: ih,
        fill: { color: C.cyan }, line: { color: C.cyan, width: 0 } });
      s.addText(it.num, {
        x: ix, y, w: 1.1, h: ih,
        fontSize: 28, fontFace: FONT_HEAD, color: C.paper, bold: true,
        align: "center", valign: "middle", margin: 0
      });
      s.addText(it.text, {
        x: ix + 1.35, y, w: iw - 1.55, h: ih,
        fontSize: 18, fontFace: FONT_HEAD, color: C.ink,
        valign: "middle", margin: 0
      });
    });

    s.addText("Brief intro → 5-step model → 3 sketching tasks (45-60 min)", {
      x: 0.5, y: 4.85, w: 9, h: 0.3,
      fontSize: 11, fontFace: FONT_BODY, color: C.muted, italic: true, margin: 0
    });

    addFooter(s, n, TOTAL);
  }

  // ============================================================
  // SLIDE 19 — REVERSE ENGINEERING
  // ============================================================
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: C.paper };
    addCornerMark(s);
    addLessonChip(s, 6, "Sketching Real Objects");

    s.addText("Reverse engineering", {
      x: 0.5, y: 0.85, w: 9, h: 0.55,
      fontSize: 26, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
    });

    // Big definition
    s.addText("Looking at a real object and recreating it digitally — measurement by measurement.", {
      x: 0.5, y: 1.5, w: 9, h: 0.65,
      fontSize: 17, fontFace: FONT_BODY, color: C.inkLight, italic: true, margin: 0
    });

    // 3 contexts where it's used
    const cases = [
      { title: "Engineers", desc: "Replace a missing part by measuring an old one and 3D printing a copy." },
      { title: "Designers", desc: "Improve a product by understanding its current dimensions, then redesigning." },
      { title: "Students", desc: "Train your eye for proportion and accuracy — the foundation of CAD work." }
    ];
    const cw = 2.85, ch = 1.95, cx = 0.5, cy = 2.4, cgap = 0.225;
    cases.forEach((c, i) => {
      const x = cx + i * (cw + cgap);
      s.addShape("rect", { x, y: cy, w: cw, h: ch,
        fill: { color: C.paper }, line: { color: C.rule, width: 1 },
        shadow: softShadow() });
      s.addShape("rect", { x, y: cy, w: cw, h: 0.06,
        fill: { color: C.cyan }, line: { color: C.cyan, width: 0 } });
      s.addText(c.title, {
        x: x + 0.25, y: cy + 0.25, w: cw - 0.5, h: 0.4,
        fontSize: 18, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
      });
      s.addText(c.desc, {
        x: x + 0.25, y: cy + 0.7, w: cw - 0.5, h: 1.15,
        fontSize: 12, fontFace: FONT_BODY, color: C.muted, margin: 0
      });
    });

    // Bottom rule
    s.addShape("rect", { x: 0.5, y: 4.65, w: 9, h: 0.5,
      fill: { color: C.cyanLight }, line: { color: C.cyanLight, width: 0 } });
    s.addImage({ data: ICN.target, x: 0.7, y: 4.73, w: 0.32, h: 0.32 });
    s.addText("Today you become an engineer for 30 minutes.", {
      x: 1.15, y: 4.65, w: 8, h: 0.5,
      fontSize: 14, fontFace: FONT_HEAD, color: C.ink, bold: true, italic: true,
      valign: "middle", margin: 0
    });

    addFooter(s, n, TOTAL);
  }

  // ============================================================
  // SLIDE 20 — THE 5-STEP PROCESS
  // ============================================================
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: C.paper };
    addCornerMark(s);
    addLessonChip(s, 6, "Sketching Real Objects");

    s.addText("The 5-step sketching process", {
      x: 0.5, y: 0.85, w: 9, h: 0.55,
      fontSize: 26, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
    });
    s.addText("Use this every time. The order matters.", {
      x: 0.5, y: 1.4, w: 9, h: 0.35,
      fontSize: 13, fontFace: FONT_BODY, color: C.muted, italic: true, margin: 0
    });

    // Vertical step list (5 rows)
    const steps = [
      { t: "Identify the main shape", d: "Is it a rectangle? Circle? Combination? Decide before you start." },
      { t: "Measure the largest dimensions first", d: "Overall length and width — anchor your sketch with these." },
      { t: "Measure the smaller details", d: "Holes, curves, cuts. These hang off the big dimensions." },
      { t: "Sketch the outline first", d: "Get the big shape down before adding details." },
      { t: "Dimension and label every line", d: "Numbers + mm + constraints where they matter." }
    ];
    const sx = 0.5, sy = 1.95, sw = 9, sh = 0.58, sgap = 0.07;
    steps.forEach((st, i) => {
      const y = sy + i * (sh + sgap);
      // body
      s.addShape("rect", { x: sx, y, w: sw, h: sh,
        fill: { color: i % 2 === 0 ? C.bg : C.paper }, line: { color: C.rule, width: 0 } });
      // step number circle
      s.addShape("ellipse", { x: sx + 0.15, y: y + 0.1, w: 0.4, h: 0.4,
        fill: { color: C.cyan }, line: { color: C.cyan, width: 0 } });
      s.addText(String(i + 1), {
        x: sx + 0.15, y: y + 0.1, w: 0.4, h: 0.4,
        fontSize: 14, fontFace: FONT_HEAD, color: C.paper, bold: true,
        align: "center", valign: "middle", margin: 0
      });
      // title
      s.addText(st.t, {
        x: sx + 0.7, y: y + 0.05, w: 5.0, h: 0.3,
        fontSize: 14, fontFace: FONT_HEAD, color: C.ink, bold: true,
        valign: "middle", margin: 0
      });
      // desc
      s.addText(st.d, {
        x: sx + 0.7, y: y + 0.3, w: sw - 0.85, h: 0.25,
        fontSize: 11, fontFace: FONT_BODY, color: C.muted, margin: 0
      });
    });

    addFooter(s, n, TOTAL);
  }

  // ============================================================
  // SLIDE 21 — YOUR TURN: SKETCH YOUR ERASER
  // ============================================================
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: C.paper };
    addCornerMark(s);
    addLessonChip(s, 6, "Sketching Real Objects");

    s.addText("YOUR TURN  ·  3 OBJECTS  ·  30 MINUTES", {
      x: 0.5, y: 0.85, w: 9, h: 0.3,
      fontSize: 11, fontFace: FONT_HEAD, color: C.cyan, bold: true, charSpacing: 5, margin: 0
    });
    s.addText("Reverse engineer something on your desk.", {
      x: 0.5, y: 1.18, w: 9, h: 0.55,
      fontSize: 22, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
    });

    // 3 task cards
    const tasks = [
      {
        emoji: "🟦",
        title: "Eraser",
        time: "10 min",
        steps: "Length, width, height. Front view sketch with all dimensions."
      },
      {
        emoji: "🪙",
        title: "Coin",
        time: "10 min",
        steps: "Measure diameter. Sketch a circle to scale, label diameter."
      },
      {
        emoji: "📱",
        title: "Phone or calculator",
        time: "10 min",
        steps: "Length, width, position of one button or hole. Front view + dimensions."
      }
    ];
    const tw = 2.85, th = 2.55, tx = 0.5, ty = 1.95, tgap = 0.225;
    tasks.forEach((t, i) => {
      const x = tx + i * (tw + tgap);
      s.addShape("rect", { x, y: ty, w: tw, h: th,
        fill: { color: C.paper }, line: { color: C.rule, width: 1 },
        shadow: softShadow() });
      // top accent
      s.addShape("rect", { x, y: ty, w: tw, h: 0.06,
        fill: { color: C.amber }, line: { color: C.amber, width: 0 } });
      // emoji
      s.addText(t.emoji, {
        x: x + 0.2, y: ty + 0.2, w: 0.8, h: 0.8,
        fontSize: 38, margin: 0
      });
      // time chip top-right
      s.addShape("rect", { x: x + tw - 1.0, y: ty + 0.25, w: 0.85, h: 0.3,
        fill: { color: C.bg }, line: { color: C.rule, width: 0 } });
      s.addText(t.time, {
        x: x + tw - 1.0, y: ty + 0.25, w: 0.85, h: 0.3,
        fontSize: 10, fontFace: FONT_HEAD, color: C.cyan, bold: true,
        align: "center", valign: "middle", margin: 0
      });
      // title
      s.addText(t.title, {
        x: x + 0.2, y: ty + 1.1, w: tw - 0.4, h: 0.4,
        fontSize: 18, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
      });
      // steps text
      s.addText(t.steps, {
        x: x + 0.2, y: ty + 1.55, w: tw - 0.4, h: 0.95,
        fontSize: 12, fontFace: FONT_BODY, color: C.muted, margin: 0
      });
    });

    // Bottom checklist strip
    s.addShape("rect", { x: 0.5, y: 4.7, w: 9.0, h: 0.45,
      fill: { color: C.ink }, line: { color: C.ink, width: 0 } });
    s.addText("CHECK:  ruler used  ·  origin marked  ·  every line dimensioned in mm  ·  to scale", {
      x: 0.5, y: 4.7, w: 9.0, h: 0.45,
      fontSize: 11, fontFace: FONT_HEAD, color: C.cyanLight, charSpacing: 1,
      align: "center", valign: "middle", margin: 0
    });

    addFooter(s, n, TOTAL);
  }

  // ============================================================
  // SLIDE 22 — WEEK 2 WRAP-UP / EXIT TICKET
  // ============================================================
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: C.ink };

    // Decorative grid (light)
    for (let i = 0; i < 11; i++) {
      s.addShape("line", { x: i * 1.0, y: 0, w: 0, h: 5.625, line: { color: C.cyan, width: 0.4, transparency: 90 } });
    }
    for (let j = 0; j < 7; j++) {
      s.addShape("line", { x: 0, y: j * 1.0, w: 10, h: 0, line: { color: C.cyan, width: 0.4, transparency: 90 } });
    }

    s.addText("WEEK 2  ·  WRAP-UP", {
      x: 0.6, y: 0.55, w: 8, h: 0.32,
      fontSize: 11, fontFace: FONT_HEAD, color: C.cyan, bold: true, charSpacing: 5, margin: 0
    });
    s.addText("You can now do this.", {
      x: 0.6, y: 0.95, w: 9, h: 0.85,
      fontSize: 38, fontFace: FONT_HEAD, color: C.paper, bold: true, margin: 0
    });

    // 3 takeaways with checkmarks
    const takeaways = [
      "Measure any object in mm.",
      "Recognise and apply 7 geometric constraints.",
      "Produce a fully-dimensioned, fully-defined sketch."
    ];
    const ty = 2.05;
    takeaways.forEach((t, i) => {
      const y = ty + i * 0.55;
      s.addImage({ data: ICN.check, x: 0.6, y: y + 0.07, w: 0.28, h: 0.28 });
      s.addText(t, {
        x: 1.0, y, w: 8.2, h: 0.45,
        fontSize: 18, fontFace: FONT_HEAD, color: C.paper, valign: "middle", margin: 0
      });
    });

    // Connection to Week 3 banner
    s.addShape("rect", { x: 0.6, y: 4.0, w: 8.8, h: 1.15,
      fill: { color: C.amber }, line: { color: C.amber, width: 0 } });
    s.addText("NEXT WEEK", {
      x: 0.85, y: 4.15, w: 4, h: 0.3,
      fontSize: 11, fontFace: FONT_HEAD, color: C.ink, bold: true, charSpacing: 4, margin: 0
    });
    s.addText("Turning your 2D sketches into 3D models with Extrude & Revolve.", {
      x: 0.85, y: 4.42, w: 8.4, h: 0.65,
      fontSize: 16, fontFace: FONT_HEAD, color: C.ink, bold: true, margin: 0
    });

    s.addText(`${n} / ${TOTAL}`, {
      x: 8.7, y: 5.32, w: 1.0, h: 0.22,
      fontSize: 9, fontFace: FONT_BODY, color: C.cyanLight, align: "right", margin: 0
    });
  }

  // ===================== WRITE =====================
  await pres.writeFile({ fileName: "/home/claude/deck/Year9_Week2_Slides.pptx" });
  console.log(`Deck written with ${n} slides.`);
})();
