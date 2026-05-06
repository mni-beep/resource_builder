// 10-unit-guide.js — 6-Week Electricity Unit Guide (Curriculum Map)
// Landscape table with 7 columns: Week | Topic | Content | Activities |
// Resources & Experiments | Assessment & Homework | Disability Inclusion Adjustment
const { Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType } = require('docx');

module.exports = function unitGuide(C, H) {
  const { borderAll, cellH, cellPr, cellP } = H;

  // Helper: create a cell with multiple paragraphs of content
  function contentCell(paragraphs, width) {
    return cellPr(paragraphs.map(t => {
      if (typeof t === 'string') {
        return new Paragraph({
          spacing: { after: 40 },
          children: [new TextRun({ text: t, size: 20 })]
        });
      }
      return t; // already a Paragraph
    }), width);
  }

  function boldPara(label, text) {
    return new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: label, bold: true, size: 20 }),
        new TextRun({ text, size: 20 })
      ]
    });
  }

  // ---- COLUMN WIDTHS (landscape A4: ~14570 DXA usable) ----
  const W = {
    week: 600,
    topic: 1200,
    content: 2400,
    activities: 2400,
    resources: 2400,
    assessment: 2120,
    inclusion: 3450
  };

  return [
    C.h1("Year 9 Science — Electricity Unit Guide"),
    C.p("6-week curriculum map · 7 topics · 18 lessons · Landscape format for easy scanning", { italic: true, color: "808080", spacing: { after: 200 } }),

    // =====================================================================
    // MAIN UNIT GUIDE TABLE
    // =====================================================================
    new Table({
      width: { size: 14570, type: WidthType.DXA },
      columnWidths: [W.week, W.topic, W.content, W.activities, W.resources, W.assessment, W.inclusion],
      rows: [

        // ---- HEADER ROW ----
        new TableRow({ tableHeader: true, children: [
          cellH("Week", W.week),
          cellH("Topic", W.topic),
          cellH("Content", W.content),
          cellH("Activities", W.activities),
          cellH("Resources & Experiments", W.resources),
          cellH("Assessment & Homework", W.assessment),
          cellH("Disability Inclusion Adjustment", W.inclusion),
        ]}),

        // ================================================================
        // WEEK 1 — 3.1 Circuit Components (Lessons 1–3)
        // ================================================================
        new TableRow({ children: [
          contentCell(["Week 1", "", "Lessons 1–3"], W.week),
          contentCell(["3.1 Circuit Components"], W.topic),
          contentCell([
            boldPara("Lesson 1: ", "Introduction to circuits. What is a circuit? The idea of a complete loop. Identifying common components by sight: battery, wires, switch, globe/LED."),
            boldPara("Lesson 2: ", "Component symbols and diagrams. Learn standard circuit symbols (battery, switch, globe, resistor, buzzer, motor, ammeter, voltmeter). Draw simple circuits using symbols."),
            boldPara("Lesson 3: ", "Component functions — what each part does. Conductors vs insulators. The role of the switch (open = off, closed = on). Practical: paper-based circuit drawing from descriptions."),
          ], W.content),
          contentCell([
            "• Component identification card sort (match picture → name → symbol)",
            "• Draw circuit symbols from a word description",
            "• Spot the error: identify missing components in circuit diagrams",
            "• Practical-on-paper: draw a complete torch circuit with labels",
            "• Conductors vs insulators sorting table (tick/cross)",
          ], W.activities),
          contentCell([
            boldPara("Equipment: ", "Circuit component kits (for demo), component symbol charts, conductor/insulator sample set."),
            boldPara("Experiments: ", "Simple battery + globe demo. Open vs closed switch observation."),
            boldPara("Textbook: ", "Chapter 3, Sections 3.1.1–3.1.3."),
            boldPara("Digital: ", "PhET Circuit Construction Kit (teacher demo)."),
          ], W.resources),
          contentCell([
            boldPara("Quiz: ", "Quiz 3.1 — Circuit Components (10 pts, online)."),
            boldPara("Homework: ", "Label components worksheet. Draw 5 circuit symbols from memory."),
            boldPara("Check: ", "Exit ticket — name 3 components and their functions."),
          ], W.assessment),
          contentCell([
            boldPara("Visual support: ", "Provide printed symbol reference chart (not just screen). Use colour-coded component cards (red = power, blue = load, green = control)."),
            boldPara("Fine motor: ", "Pre-drawn circuit templates — students label rather than drawing from scratch. Thicker pens/pencils available."),
            boldPara("Language: ", "Key vocabulary list with simple definitions provided at start of week. Sentence starters: 'This component is called a _____ and it _____ .'"),
            boldPara("Extension: ", "Research task — how have circuit symbols changed over time?"),
          ], W.inclusion),
        ]}),

        // ================================================================
        // WEEK 2 — 3.2 Voltage, Current and Resistance (Lessons 4–6)
        // ================================================================
        new TableRow({ children: [
          contentCell(["Week 2", "", "Lessons 4–6"], W.week),
          contentCell(["3.2 Voltage, Current & Resistance"], W.topic),
          contentCell([
            boldPara("Lesson 4: ", "Voltage — electrical 'push'. The water analogy: voltage = water pressure. Unit: volt (V). Common voltages (1.5V AA, 9V, 12V car, 230V mains). Where voltage comes from."),
            boldPara("Lesson 5: ", "Current — rate of charge flow. Water analogy: current = flow rate. Unit: ampere (A). Conventional current vs electron flow. Measuring current with an ammeter (connected in series)."),
            boldPara("Lesson 6: ", "Resistance — opposition to flow. Water analogy: resistance = pipe narrowness. Unit: ohm (Ω). Factors affecting resistance (material, length, thickness). Quick reference table linking V, I, R with symbols, units, and analogies."),
          ], W.content),
          contentCell([
            "• Water analogy discussion — draw the pipe/pump/valve model",
            "• Fill-in reference table: Quantity | Symbol | Unit | Measures",
            "• Unit conversion practice: mA ↔ A, kΩ ↔ Ω",
            "• Label voltage, current, and resistance on a simple circuit diagram",
            "• 'Which unit?' quick quiz — is this describing V, I, or R?",
          ], W.activities),
          contentCell([
            boldPara("Equipment: ", "Multimeters (demonstration), batteries of various voltages, simple resistor set."),
            boldPara("Experiments: ", "Water analogy physical demo (if available). Measure battery voltage with multimeter (teacher-led)."),
            boldPara("Textbook: ", "Chapter 3, Sections 3.2.1–3.2.4."),
            boldPara("Digital: ", "PhET — Ohm's Law simulation (explore mode)."),
          ], W.resources),
          contentCell([
            boldPara("Quiz: ", "Quiz 3.2 — Voltage, Current & Resistance (10 pts, online)."),
            boldPara("Homework: ", "Complete the V/I/R reference table. Convert 10 values (mA→A, etc.)."),
            boldPara("Check: ", "Water analogy paragraph — explain voltage and current to a Year 7 student."),
          ], W.assessment),
          contentCell([
            boldPara("Conceptual access: ", "Use the water analogy consistently across all lessons — it anchors abstract ideas. Show a short water pipe animation or physical demo."),
            boldPara("Memory support: ", "Mnemonic poster: 'V ery I mportant R ule' (V = I × R). Reference table pre-filled with 2 of 3 columns for some students."),
            boldPara("Language: ", "Avoid 'potential difference' until students are confident with 'voltage'. Scaffolded unit conversion: 'milli means ÷ 1000' cheat card."),
            boldPara("Extension: ", "Research electron flow vs conventional current — why do we still use the 'wrong' direction?"),
          ], W.inclusion),
        ]}),

        // ================================================================
        // WEEK 3 — 3.3 Series Circuits (Lessons 7–9)
        // ================================================================
        new TableRow({ children: [
          contentCell(["Week 3", "", "Lessons 7–9"], W.week),
          contentCell(["3.3 Series Circuits"], W.topic),
          contentCell([
            boldPara("Lesson 7: ", "What is a series circuit? Single path for current. Identifying series connections. Current is the SAME everywhere in a series circuit. Practical: trace the single loop."),
            boldPara("Lesson 8: ", "Voltage in series — voltage DIVIDES across components. Sum of voltage drops = supply voltage. Resistance in series — total R = R₁ + R₂ + R₃. Adding more globes makes each dimmer."),
            boldPara("Lesson 9: ", "Advantages and disadvantages of series circuits. Christmas tree lights problem (one goes out, all go out). Real-world uses: some sensor circuits, older fairy lights. Comparison preview with parallel."),
          ], W.content),
          contentCell([
            "• Draw series circuits with 1, 2, and 3 globes",
            "• Calculate total resistance in series (R = R₁ + R₂)",
            "• Predict brightness: 1 globe vs 2 globes in series — which is brighter?",
            "• Practical-on-paper: complete a series circuit table (V, I, R values)",
            "• Fault-finding: 'One globe blows — what happens to the other two?'",
          ], W.activities),
          contentCell([
            boldPara("Equipment: ", "Battery packs, globes, wires, switches (for demo series circuits)."),
            boldPara("Experiments: ", "Build series circuit with 1, 2, 3 globes — observe brightness change (teacher demo). Measure voltages around a series circuit."),
            boldPara("Textbook: ", "Chapter 3, Sections 3.3.1–3.3.4."),
            boldPara("Digital: ", "PhET Circuit Construction Kit — build series circuits virtually."),
          ], W.resources),
          contentCell([
            boldPara("Quiz: ", "Quiz 3.3 — Series Circuits (10 pts, online)."),
            boldPara("Homework: ", "Series circuit worksheet — calculate R_total for 5 circuits."),
            boldPara("Check: ", "Explain why Christmas lights used to be a problem — what was the cause?"),
          ], W.assessment),
          contentCell([
            boldPara("Sequential thinking: ", "Number steps in a series loop 1→2→3→4 — show there's only one path. Use a piece of string to physically trace the loop on a diagram."),
            boldPara("Maths support: ", "R_total = R₁ + R₂ is addition only — keep calculations simple (whole numbers). Provide calculator access and addition scaffold sheets."),
            boldPara("Visual: ", "Colour-code the single current path in red. Use traffic analogy — one-lane road, all cars go same speed."),
            boldPara("Extension: ", "Design a series circuit for a specific purpose (e.g. 3 LEDs with correct resistor)."),
          ], W.inclusion),
        ]}),

        // ================================================================
        // WEEK 4 — 3.4 Parallel Circuits (Lessons 10–12)
        // ================================================================
        new TableRow({ children: [
          contentCell(["Week 4", "", "Lessons 10–12"], W.week),
          contentCell(["3.4 Parallel Circuits"], W.topic),
          contentCell([
            boldPara("Lesson 10: ", "What is a parallel circuit? Multiple paths for current. Identifying parallel connections. Voltage is the SAME across each parallel branch. Current DIVIDES between branches."),
            boldPara("Lesson 11: ", "Resistance in parallel — total resistance is LESS than the smallest individual resistor. Formula: 1/R_total = 1/R₁ + 1/R₂. Adding more parallel branches DECREASES total resistance (more paths = easier flow)."),
            boldPara("Lesson 12: ", "Series vs parallel comparison. Household wiring — why our homes use parallel circuits (each appliance gets full voltage, can operate independently). Advantages: if one branch fails, others keep working."),
          ], W.content),
          contentCell([
            "• Draw parallel circuits with 2 and 3 branches",
            "• Calculate total resistance in parallel (simple 2-resistor cases)",
            "• Compare table: Series vs Parallel (voltage, current, resistance, uses)",
            "• Practical-on-paper: predict which circuit has brighter globes (series or parallel?)",
            "• Household wiring analysis — trace the parallel paths in a room diagram",
          ], W.activities),
          contentCell([
            boldPara("Equipment: ", "Battery packs, globes, wires, switches (for demo parallel circuits)."),
            boldPara("Experiments: ", "Build parallel circuit — add/remove branches, observe brightness (teacher demo). Compare series vs parallel with same number of globes."),
            boldPara("Textbook: ", "Chapter 3, Sections 3.4.1–3.4.4."),
            boldPara("Digital: ", "PhET Circuit Construction Kit — build parallel circuits."),
          ], W.resources),
          contentCell([
            boldPara("Quiz: ", "Quiz 3.4 — Parallel Circuits (10 pts, online)."),
            boldPara("Homework: ", "Series vs parallel comparison table. Parallel resistance calculations (3 problems)."),
            boldPara("Check: ", "Explain why household wiring uses parallel, not series."),
          ], W.assessment),
          contentCell([
            boldPara("Conceptual access: ", "Use the 'fork in the road' analogy — current reaches a junction and splits, taking all available paths. Traffic analogy: multi-lane road, more lanes = easier flow."),
            boldPara("Maths support: ", "1/R formula is challenging. Use 'product over sum' shortcut for 2 resistors: R_total = (R₁×R₂)/(R₁+R₂). Provide step-by-step calculation scaffold."),
            boldPara("Visual: ", "Colour-code each branch in a different colour. Pre-drawn parallel templates for students who struggle with drawing."),
            boldPara("Extension: ", "Calculate current in each branch given battery voltage and branch resistances."),
          ], W.inclusion),
        ]}),

        // ================================================================
        // WEEK 5 — 3.5 Measuring Electricity & 3.6 Ohm's Law (Lessons 13–15)
        // ================================================================
        new TableRow({ children: [
          contentCell(["Week 5", "", "Lessons 13–15"], W.week),
          contentCell(["3.5 Measuring Electricity", "3.6 Ohm's Law Calculations"], W.topic),
          contentCell([
            boldPara("Lesson 13 (3.5): ", "Measuring instruments — ammeter and voltmeter. Ammeter connected in SERIES (break the circuit). Voltmeter connected in PARALLEL (across the component). Reading analogue and digital scales."),
            boldPara("Lesson 14 (3.6): ", "Ohm's Law introduction: V = I × R. The formula triangle (cover what you want to find). Calculating voltage given I and R. Calculating current given V and R."),
            boldPara("Lesson 15 (3.6): ", "Calculating resistance given V and I. Unit conversions in Ohm's Law (mA→A before calculating). Worked examples for all three variations. 'Now you try' with hidden answers."),
          ], W.content),
          contentCell([
            "• Ammeter/voltmeter placement worksheet — where does each go?",
            "• Reading scales practice (analogue meter images)",
            "• Ohm's Law triangle drill — cover one, calculate",
            "• Worked examples: 3 full step-by-step solutions",
            "• 'Now you try' — 3 mirrored problems with hidden answers",
            "• Unit conversion practice integrated into Ohm's Law problems",
          ], W.activities),
          contentCell([
            boldPara("Equipment: ", "Multimeters, simple resistor sets, batteries, connecting wires."),
            boldPara("Experiments: ", "Measure V and I for a simple resistor circuit. Plot V vs I (should be linear = Ohm's Law verification). Teacher-led for safety."),
            boldPara("Textbook: ", "Chapter 3, Sections 3.5.1–3.5.3, 3.6.1–3.6.4."),
            boldPara("Digital: ", "PhET Ohm's Law simulation — manipulate V and R, observe I change."),
          ], W.resources),
          contentCell([
            boldPara("Quiz: ", "Quiz 3.5 — Measuring Electricity (10 pts) + Quiz 3.6 — Ohm's Law (10 pts), both online."),
            boldPara("Homework: ", "Ohm's Law problem set — 10 questions covering all three variations."),
            boldPara("Check: ", "Exit ticket — solve one Ohm's Law problem showing all working."),
          ], W.assessment),
          contentCell([
            boldPara("Instrument placement: ", "Mnemonic: 'A mimeters are Always in series' and 'V oltmeters are Very parallel'. Provide a decision flowchart for choosing series vs parallel connection."),
            boldPara("Maths support: ", "Ohm's Law triangle printed on every worksheet. All problems use whole numbers initially. Calculator use guide for division. Scaffolded calculation sheets with hints."),
            boldPara("Memory: ", "'V ery I mportant R ule' poster kept visible. Three-colour coding: V=blue, I=red, R=green — consistent across all materials."),
            boldPara("Extension: ", "Graph V vs I from experimental data. Calculate resistance from the gradient. Introduce power: P = V × I."),
          ], W.inclusion),
        ]}),

        // ================================================================
        // WEEK 6 — 3.6 Ohm's Law (continued) & 3.7 Electrical Safety (Lessons 16–18)
        // ================================================================
        new TableRow({ children: [
          contentCell(["Week 6", "", "Lessons 16–18"], W.week),
          contentCell(["3.6 Ohm's Law (cont.)", "3.7 Electrical Safety"], W.topic),
          contentCell([
            boldPara("Lesson 16 (3.6): ", "Ohm's Law application — real-world problems. Choosing correct resistors for LEDs. Why too much current destroys components. Short circuits — what they are and why they're dangerous (connects Ohm's Law to safety)."),
            boldPara("Lesson 17 (3.7): ", "Electrical safety devices — fuses (melt when current too high), circuit breakers (trip switch), insulation (plastic coating on wires), earthing (safety wire to ground). Australian safety standards (AS/NZS 3000)."),
            boldPara("Lesson 18 (3.7): ", "Safe vs unsafe practices. What to do in an electrical emergency (don't touch, turn off power, call 000). Water + electricity danger. Overloading power boards. Unit review and reflection."),
          ], W.content),
          contentCell([
            "• Ohm's Law applied problems — choose the right resistor for an LED",
            "• Safety scenario analysis — identify the danger in each situation",
            "• Design an electrical safety poster (paper-based)",
            "• 'What would you do?' — emergency response decision tree",
            "• Unit reflection: 3 things I learned, 2 things I'm still unsure about, 1 question",
          ], W.activities),
          contentCell([
            boldPara("Equipment: ", "Fuse examples (blown and intact), circuit breaker (for demo), insulated vs bare wire samples, safety posters."),
            boldPara("Experiments: ", "NOT a student experiment — teacher demo of fuse operation (very controlled). Show inside a plug to see fuse, insulation, earth wire."),
            boldPara("Textbook: ", "Chapter 3, Sections 3.6.5, 3.7.1–3.7.4."),
            boldPara("Digital: ", "Electrical safety videos (educational, not graphic). Australian Electrical Safety Office resources."),
          ], W.resources),
          contentCell([
            boldPara("Quiz: ", "Quiz 3.7 — Electrical Safety (10 pts, online)."),
            boldPara("Homework: ", "Safety poster design. Ohm's Law review worksheet."),
            boldPara("Assessment: ", "End-of-unit review test (cumulative, covering all 3.1–3.7)."),
          ], W.assessment),
          contentCell([
            boldPara("Safety messaging: ", "Keep safety discussions factual, not frightening. Focus on 'what to do right' rather than 'what could go wrong'. Use clear, simple safety rules (maximum 5 key rules)."),
            boldPara("Scenario approach: ", "Use illustrated safety scenarios with clear right/wrong choices. Allow oral discussion of safety scenarios before written responses."),
            boldPara("Review support: ", "Provide unit summary sheet (1-page) with key formulas, symbols, and safety rules. Offer review questions in advance. Allow alternative assessment: oral explanation of safety concepts."),
            boldPara("Extension: ", "Research Australian electrical safety statistics. Compare safety standards across countries. Investigate careers in electrical engineering."),
          ], W.inclusion),
        ]}),

      ]
    }),

    C.p("", { spacing: { after: 200 } }),
    C.p("Curriculum map — intended as a planning guide. Adjust pacing based on student progress and school timetable.", { italic: true, color: "808080", size: 18, alignment: AlignmentType.CENTER }),
  ];
};
