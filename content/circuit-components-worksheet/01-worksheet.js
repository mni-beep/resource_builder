// 01-worksheet.js — Year 9 Science: Circuit Components & Symbols
// Mixed ability, moderate scaffolding, interleaved theory + questions
const { Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType } = require('docx');

module.exports = function worksheet(C, H) {
  const { borderAll, cellH, cellP, cellPr, cellE, cellHint, cellWE, cellWELabel } = H;

  return [

    // ===== TITLE =====
    C.h1("Circuit Components & Symbols"),
    C.p("Year 9 Science — Electricity Unit", { italic: true, color: "808080", spacing: { after: 200 } }),

    C.calloutBox("LEARNING OBJECTIVES", [
      C.p("By the end of this worksheet, you should be able to:"),
      C.bullet("Name at least six common circuit components and describe what each one does."),
      C.bullet("Draw and recognise standard circuit symbols."),
      C.bullet("Match a real component to its symbol."),
      C.bullet("Draw a complete circuit diagram using correct symbols."),
    ]),

    // ====================================================================
    // THEORY BLOCK 1 — Circuit Components
    // ====================================================================
    C.h2("Part A — What Goes Into a Circuit?"),
    C.p("Every working circuit is made of components. Each component has a specific job. Some provide energy, some use energy, and some control the flow of electricity."),
    C.p("The table below shows the most common components you will meet in Year 9 Science. Study it before you answer the questions.", { spacing: { after: 160 } }),

    C.h3("Common Circuit Components"),

    // ---- COMPONENT REFERENCE TABLE ----
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [2000, 3120, 3120, 1120],
      rows: [
        new TableRow({ tableHeader: true, children: [
          cellH("Component", 2000),
          cellH("What it does", 3120),
          cellH("Looks like (real)", 3120),
          cellH("Symbol", 1120),
        ]}),
        new TableRow({ children: [
          cellP("Battery / Cell", 2000),
          cellPr([
            new Paragraph({ children: [new TextRun({ text: "Provides electrical energy to the circuit. The + and − terminals must be connected the right way around.", size: 20 })], spacing: { after: 40 } }),
          ], 3120),
          cellP("Cylinder with a bump on one end (+), flat on the other (−). AA, AAA, 9V.", 3120),
          cellP("See Part B", 1120),
        ]}),
        new TableRow({ children: [
          cellP("Switch", 2000),
          cellPr([
            new Paragraph({ children: [new TextRun({ text: "Controls whether current can flow. CLOSED = current flows (on). OPEN = no current (off).", size: 20 })], spacing: { after: 40 } }),
          ], 3120),
          cellP("A lever or button that makes or breaks a connection.", 3120),
          cellP("See Part B", 1120),
        ]}),
        new TableRow({ children: [
          cellP("Globe / LED", 2000),
          cellPr([
            new Paragraph({ children: [new TextRun({ text: "Converts electrical energy into light. LEDs only work one way around — the longer leg is positive.", size: 20 })], spacing: { after: 40 } }),
          ], 3120),
          cellP("Small glass bulb (globe) or clear plastic bead with two metal legs (LED).", 3120),
          cellP("See Part B", 1120),
        ]}),
        new TableRow({ children: [
          cellP("Resistor", 2000),
          cellPr([
            new Paragraph({ children: [new TextRun({ text: "Limits the amount of current in a circuit. Protects components like LEDs from too much current.", size: 20 })], spacing: { after: 40 } }),
          ], 3120),
          cellP("Small cylinder with coloured stripes (the colour code tells you the resistance value).", 3120),
          cellP("See Part B", 1120),
        ]}),
        new TableRow({ children: [
          cellP("Buzzer", 2000),
          cellPr([
            new Paragraph({ children: [new TextRun({ text: "Converts electrical energy into sound. Used in alarms, timers, and doorbells.", size: 20 })], spacing: { after: 40 } }),
          ], 3120),
          cellP("Small black disc, often with a hole in the top.", 3120),
          cellP("See Part B", 1120),
        ]}),
        new TableRow({ children: [
          cellP("Motor", 2000),
          cellPr([
            new Paragraph({ children: [new TextRun({ text: "Converts electrical energy into movement (rotation). Used in fans, robots, and electric cars.", size: 20 })], spacing: { after: 40 } }),
          ], 3120),
          cellP("Metal cylinder with a spinning shaft. Often has a small gear on the shaft.", 3120),
          cellP("See Part B", 1120),
        ]}),
      ]
    }),

    C.p("", { spacing: { after: 160 } }),

    // ====================================================================
    // QUESTION BLOCK 1 — Multiple Choice
    // ====================================================================
    C.sectionTag("Questions — Part A"),
    C.p("Answer these questions using the table above.", { italic: true, spacing: { after: 120 } }),

    new Paragraph({ children: [
      new TextRun({ text: "1. ", bold: true }),
      new TextRun("Which component provides electrical energy to the circuit?")
    ], spacing: { before: 160, after: 80 } }),
    ...["Switch.", "Battery.", "Resistor.", "Buzzer."].map(opt =>
      new Paragraph({ numbering: { reference: "mc-ws1", level: 0 }, children: [new TextRun(opt)], spacing: { after: 40 } })
    ),
    C.hintBox("Reread the first data row of the table — the answer is in the 'What it does' column."),

    ...C.mcQuestion(2, "A closed switch means the circuit is:", [
      "Broken and no current can flow.",
      "Complete and current can flow.",
      "Only working if the battery is 9V.",
      "The same as having no switch at all."
    ], "mc-ws2"),

    ...C.mcQuestion(3, "What would happen if you connected a battery directly to an LED without a resistor?", [
      "The LED would glow normally.",
      "Nothing — a circuit needs at least four components.",
      "Too much current would flow and the LED could be destroyed.",
      "The battery would run out instantly."
    ], "mc-ws3"),

    C.pageBreak(),

    // ====================================================================
    // THEORY BLOCK 2 — Circuit Symbols
    // ====================================================================
    C.h2("Part B — Circuit Symbols"),
    C.p("When engineers and scientists draw circuits, they don't sketch realistic pictures of each component. Instead they use simple symbols — a kind of universal shorthand that anyone in the world can read, no matter what language they speak."),
    C.p("Using symbols makes circuit diagrams clean, fast to draw, and easy to read. The table below shows the standard symbols you need to know for Year 9.", { spacing: { after: 160 } }),

    C.h3("Standard Circuit Symbols"),

    // ---- SYMBOL REFERENCE TABLE ----
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [1800, 1800, 2880, 2880],
      rows: [
        new TableRow({ tableHeader: true, children: [
          cellH("Component", 1800),
          cellH("Symbol", 1800),
          cellH("How to draw it", 2880),
          cellH("Tip", 2880),
        ]}),
        new TableRow({ children: [
          cellP("Cell / Battery", 1800),
          cellP("─├├─", 1800),
          cellPr([
            new Paragraph({ children: [new TextRun({ text: "Long line = +, short thick line = −. A battery is two or more cells stacked.", size: 20 })], spacing: { after: 40 } }),
          ], 2880),
          cellPr([
            new Paragraph({ children: [new TextRun({ text: "Long line positive, short line negative. Draw them in pairs for a battery.", size: 20, italics: true, color: "808080" })], spacing: { after: 40 } }),
          ], 2880),
        ]}),
        new TableRow({ children: [
          cellP("Switch (open)", 1800),
          cellP("─○  ○─", 1800),
          cellPr([
            new Paragraph({ children: [new TextRun({ text: "Two small circles with a gap between them. The line lifts away to show it's open.", size: 20 })], spacing: { after: 40 } }),
          ], 2880),
          cellPr([
            new Paragraph({ children: [new TextRun({ text: "Open = gap; Closed = line connects the circles. Think 'open door, open circuit — no flow.'", size: 20, italics: true, color: "808080" })], spacing: { after: 40 } }),
          ], 2880),
        ]}),
        new TableRow({ children: [
          cellP("Lamp / Globe", 1800),
          cellP("─(⊗)─", 1800),
          cellPr([
            new Paragraph({ children: [new TextRun({ text: "A circle with a cross inside. The circle represents the glass bulb; the cross is the filament.", size: 20 })], spacing: { after: 40 } }),
          ], 2880),
          cellPr([
            new Paragraph({ children: [new TextRun({ text: "Circle + X inside. Easy to remember: X marks the spot where light comes out.", size: 20, italics: true, color: "808080" })], spacing: { after: 40 } }),
          ], 2880),
        ]}),
        new TableRow({ children: [
          cellP("Resistor", 1800),
          cellP("─[▬▬]─", 1800),
          cellPr([
            new Paragraph({ children: [new TextRun({ text: "A rectangle. Sometimes drawn as a zigzag line in older diagrams.", size: 20 })], spacing: { after: 40 } }),
          ], 2880),
          cellPr([
            new Paragraph({ children: [new TextRun({ text: "Rectangle — simple. If you see a zigzag in a textbook, it means the same thing.", size: 20, italics: true, color: "808080" })], spacing: { after: 40 } }),
          ], 2880),
        ]}),
        new TableRow({ children: [
          cellP("Buzzer", 1800),
          cellP("─(◗)─", 1800),
          cellPr([
            new Paragraph({ children: [new TextRun({ text: "A half-circle on top of two lines. Looks a bit like a bell or a speaker from the side.", size: 20 })], spacing: { after: 40 } }),
          ], 2880),
          cellPr([
            new Paragraph({ children: [new TextRun({ text: "Half-circle shape. Remember 'half a bell'.", size: 20, italics: true, color: "808080" })], spacing: { after: 40 } }),
          ], 2880),
        ]}),
        new TableRow({ children: [
          cellP("Motor", 1800),
          cellP("─(Ⓜ)─", 1800),
          cellPr([
            new Paragraph({ children: [new TextRun({ text: "A circle with the letter M inside. M stands for Motor.", size: 20 })], spacing: { after: 40 } }),
          ], 2880),
          cellPr([
            new Paragraph({ children: [new TextRun({ text: "Circle with M. Easiest symbol to remember — M for Motor.", size: 20, italics: true, color: "808080" })], spacing: { after: 40 } }),
          ], 2880),
        ]}),
        new TableRow({ children: [
          cellP("Connecting wire", 1800),
          cellP("─────", 1800),
          cellPr([
            new Paragraph({ children: [new TextRun({ text: "A straight line. Wires connect all the other components together in a loop.", size: 20 })], spacing: { after: 40 } }),
          ], 2880),
          cellPr([
            new Paragraph({ children: [new TextRun({ text: "Use a ruler! Straight lines make diagrams professional and easy to read.", size: 20, italics: true, color: "808080" })], spacing: { after: 40 } }),
          ], 2880),
        ]}),
      ]
    }),

    C.p("", { spacing: { after: 160 } }),

    // ====================================================================
    // QUESTION BLOCK 2 — Fill-in Table + Short Answer
    // ====================================================================
    C.sectionTag("Questions — Part B"),

    // --- Fill-in table (Q4) ---
    new Paragraph({ children: [
      new TextRun({ text: "4. ", bold: true }),
      new TextRun("Complete the table by drawing the correct symbol for each component.")
    ], spacing: { before: 160, after: 80 } }),
    C.hintBox("Use the symbol reference table above to check your drawings."),

    new Table({
      width: { size: 6240, type: WidthType.DXA },
      alignment: AlignmentType.CENTER,
      columnWidths: [3120, 3120],
      rows: [
        new TableRow({ tableHeader: true, children: [
          cellH("Component", 3120),
          cellH("Draw its symbol here", 3120),
        ]}),
        new TableRow({ children: [
          cellP("Battery (2 cells)", 3120),
          cellE(3120, 2),
        ]}),
        new TableRow({ children: [
          cellP("Switch (closed)", 3120),
          cellE(3120, 2),
        ]}),
        new TableRow({ children: [
          cellP("Lamp / Globe", 3120),
          cellE(3120, 2),
        ]}),
        new TableRow({ children: [
          cellP("Resistor", 3120),
          cellE(3120, 2),
        ]}),
        new TableRow({ children: [
          cellP("Motor", 3120),
          cellE(3120, 2),
        ]}),
      ]
    }),

    // --- Short answer Q5 ---
    new Paragraph({ children: [
      new TextRun({ text: "5. ", bold: true }),
      new TextRun("Why do we use symbols instead of drawing realistic pictures of each component in a circuit diagram? Give two reasons.")
    ], spacing: { before: 240, after: 80 } }),
    C.sentenceStarter("We use circuit symbols because they are __________________ and __________________ ."),
    ...C.linedAnswerSpace(3),

    // --- Short answer Q6 ---
    new Paragraph({ children: [
      new TextRun({ text: "6. ", bold: true }),
      new TextRun("Look at the symbol: ─(◗)─ . Name the component and describe what it does.")
    ], spacing: { before: 240, after: 80 } }),
    C.sentenceStarter("This symbol represents a __________________ , which is used to..."),
    ...C.linedAnswerSpace(2),

    C.pageBreak(),

    // ====================================================================
    // EXTENDED RESPONSE
    // ====================================================================
    C.sectionTag("Extended Response"),

    new Paragraph({ children: [
      new TextRun({ text: "7. ", bold: true }),
      new TextRun("A student is building a simple torch using a battery, a switch, and a globe. Draw the circuit diagram for this torch using the correct circuit symbols, then explain why the switch needs to be closed for the globe to light up. Aim for 80–100 words.")
    ], spacing: { before: 200, after: 80 } }),

    C.hintBox("Think about: what does a switch do to the circuit loop? What must be true for current to flow?"),

    // Planning steps (moderate scaffolding)
    new Paragraph({ children: [
      new TextRun({ text: "PLAN YOUR ANSWER:", bold: true, color: C.COLOURS.primary, size: 22 })
    ], spacing: { before: 160, after: 80 } }),
    C.scaffoldStep(1, "What three components go in the torch circuit?", "Look at the question again"),
    C.scaffoldStep(2, "What does a closed switch do that an open switch does not?", null),
    C.scaffoldStep(3, "What happens to the loop when the switch is open?", null),

    C.calloutBox("✅ YOUR DRAWING MUST INCLUDE:", [
      C.bullet("A battery symbol with long and short lines"),
      C.bullet("A switch symbol drawn in the CLOSED position"),
      C.bullet("A globe/lamp symbol"),
      C.bullet("Wires connecting everything in one complete loop"),
      C.bullet("Arrows showing the direction of conventional current"),
    ], C.COLOURS.greenLine),

    ...C.drawingSpace(2.5, "Drawing space — draw your circuit diagram here:"),

    new Paragraph({ children: [
      new TextRun({ text: "NOW EXPLAIN YOUR ANSWER:", bold: true, color: C.COLOURS.primary, size: 22 })
    ], spacing: { before: 240, after: 80 } }),

    new Paragraph({
      children: [
        new TextRun({ text: "The torch circuit contains three components: a ", italics: true, color: "808080" }),
        new TextRun({ text: "________________ , a switch, and a globe." })
      ],
      spacing: { after: 80 }, indent: { left: 240 }
    }),
    ...C.linedAnswerSpace(2),

    new Paragraph({
      children: [
        new TextRun({ text: "The switch must be closed because ", italics: true, color: "808080" }),
        new TextRun({ text: "________________________________________ ." })
      ],
      spacing: { before: 80, after: 80 }, indent: { left: 240 }
    }),
    ...C.linedAnswerSpace(2),

    new Paragraph({
      children: [
        new TextRun({ text: "If the switch were open, the circuit would be ", italics: true, color: "808080" }),
        new TextRun({ text: "________________ and no current could flow." })
      ],
      spacing: { before: 80, after: 80 }, indent: { left: 240 }
    }),
    ...C.linedAnswerSpace(2),

    C.pageBreak(),

    // ====================================================================
    // PRACTICAL ON PAPER
    // ====================================================================
    C.sectionTag("Practical on Paper", C.COLOURS.greenLine),

    C.h4("Activity — Build a Circuit from Symbols"),
    C.p("Below are four circuit symbols connected in a loop. Each symbol is labelled with a letter A–D."),
    C.p("Your task:", { bold: true, spacing: { after: 80 } }),
    C.bullet("(a)  Write the name of each component in the table below."),
    C.bullet("(b)  Decide: will the buzzer make sound? Circle YES or NO."),
    C.bullet("(c)  Explain your answer using the correct science vocabulary."),

    // Simple ASCII diagram of a circuit
    new Table({
      width: { size: 7280, type: WidthType.DXA },
      columnWidths: [7280],
      alignment: AlignmentType.CENTER,
      rows: [new TableRow({
        height: { value: 2400, rule: "atLeast" },
        children: [new TableCell({
          borders: borderAll(C.COLOURS.primary, 8),
          width: { size: 7280, type: WidthType.DXA },
          shading: { fill: "FAFAFA", type: ShadingType.CLEAR },
          margins: { top: 240, bottom: 240, left: 240, right: 240 },
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [
              new TextRun({ text: "  [A]          [B]          [C]          [D]", font: "Consolas", size: 22 })
            ], spacing: { after: 120 } }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [
              new TextRun({ text: "──├├───  ──○──○───  ──(◗)───  ──(⊗)───", font: "Consolas", size: 22 })
            ], spacing: { after: 80 } }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [
              new TextRun({ text: "└──────────────────────────────┘", font: "Consolas", size: 22 })
            ]}),
          ]
        })]
      })]
    }),

    C.p("Figure 1: Circuit with four components labelled A through D.", { italic: true, alignment: AlignmentType.CENTER, color: "808080", size: 20, spacing: { after: 160 } }),

    // Component identification table
    new Table({
      width: { size: 7280, type: WidthType.DXA },
      alignment: AlignmentType.CENTER,
      columnWidths: [1820, 1820, 1820, 1820],
      rows: [
        new TableRow({ tableHeader: true, children: [
          cellH("Label", 1820),
          cellH("Component name", 1820),
          cellH("Label", 1820),
          cellH("Component name", 1820),
        ]}),
        new TableRow({ children: [
          cellP("A", 1820), cellE(1820, 2),
          cellP("B", 1820), cellE(1820, 2),
        ]}),
        new TableRow({ children: [
          cellP("C", 1820), cellE(1820, 2),
          cellP("D", 1820), cellE(1820, 2),
        ]}),
      ]
    }),

    C.p("", { spacing: { after: 80 } }),

    new Paragraph({ children: [
      new TextRun({ text: "Will the buzzer make sound?    ", bold: true }),
      new TextRun({ text: "   YES   /   NO   (circle one)", bold: true }),
    ], spacing: { before: 160, after: 120 } }),

    C.sentenceStarter("The buzzer will / will not make sound because _____________________________________________ ."),
    ...C.linedAnswerSpace(2),

    C.hintBox("Hint: Look at the switch symbol. Is it open or closed? Remember — a circuit needs a complete loop."),

    C.pageBreak()
  ];
};
