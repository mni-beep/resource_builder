# E5_MODEL_BIBLE.md — Pedagogical Reference for Building E5 PPTX Decks

> **Read this whenever you are crafting content for an E5 PPTX deck.** This document is the *pedagogical* reference — what GOOD content looks like in each phase, why each phase exists, and how to avoid the common failure modes that make E5 decks feel like generic lessons with E5 labels slapped on top. For the *technical* helpers (`C.e5EngageSlide()`, `C.e5ExploreSlide()`, etc.), see `PPTX_BUILDER_REFERENCE.md` Section 10. This document does **not** repeat those helpers — it tells you what to put *inside* them.
>
> The bible is deliberately subject-agnostic. Adapt the worked examples to whatever subject the user is teaching.

---

## 0. How to use this document

When you are about to build an E5 deck:

1. **Read Sections 1–3 once** to ground yourself in the model's intent (foundations + the arc).
2. **For each slide you are about to write, open the matching phase section (4–8) and run its checklist** before drafting the bullet text, hook, or task.
3. **Before finalising the deck, run the cross-phase quality gate (Section 11) and the anti-pattern audit (Section 13).**

If you find yourself writing text that doesn't pass the phase checklist, stop and re-draft. A weak Engage poisons the whole arc — students arrive at Explain already disengaged.

---

## 1. Foundations — what the E5 model actually is

### 1.1 Origin and intent

The 5E instructional model was formalised by **Roger Bybee and the Biological Sciences Curriculum Study (BSCS)** in the late 1980s, building on Atkin–Karplus's earlier "learning cycle" (1962). It was designed for science but generalises to any concept-rich subject.

Bybee's central claim: students don't construct robust understanding when a teacher *explains first* and they *practise after*. Instead, learning is most durable when:

1. The learner is **curious before** they are told.
2. The learner has **direct experience with the phenomenon** before they meet the formal language.
3. The teacher provides **explicit, precise definitions only after** the learner has something to attach those definitions to.
4. The learner then **transfers** the idea to a new context to test its generality.
5. The learner finally **evaluates their own understanding** to consolidate it.

This is the constructivist–cognitivist compromise: **inquiry up front, explicit teaching in the middle, application at the back**.

### 1.2 Cognitive load theory and the E5 arc

Sweller's cognitive load theory (1988+) explains *why* the E5 ordering works:

| Phase | Dominant load type | Why it works |
|---|---|---|
| Engage | Germane (curiosity, schema activation) | A small surprise primes the brain to encode what's coming. Without activation, new information competes with nothing — and is forgotten. |
| Explore | Intrinsic (handling the phenomenon) | Direct interaction gives students concrete referents. Without referents, the Explain phase becomes "words for words." |
| Explain | Intrinsic (formal vocabulary, definitions) | Vocabulary is now low-cost: students attach a name to something they've already seen. |
| Elaborate | Germane (transfer, schema strengthening) | Applying to a new context forces students to abstract the schema beyond its original example. |
| Evaluate | Retrieval-based (consolidation) | Self-assessment + retrieval practice locks the schema into long-term memory. |

**If you skip a phase or reorder it, you push the wrong load onto students at the wrong moment.** Skipping Engage means Explain has to do double work. Skipping Explore means Explain becomes abstract and forgettable. Skipping Elaborate means students hold the idea only in the original context. Skipping Evaluate means there is no retrieval and the schema decays fast.

### 1.3 Why the **Learning Intention** slide precedes Engage

Hattie's effect-size research (and almost every modern pedagogy framework) places "clear learning intentions and success criteria" at the top of the high-impact list. The Learning Intention slide is NOT a re-statement of the lesson title. It is a *contract* that tells students:

- **WHAT** they will know or be able to do by the end (a verb + a noun).
- **HOW** they will know they've got it (success criteria — usually 2–4 concrete observables).

Place the Learning Intention slide *before* Engage so students enter the hook already oriented. They can be curious *with a purpose*.

### 1.4 The arc as a single thought, not five lessons

A common mistake is treating the five phases as five disconnected blocks. They aren't. The whole deck should answer **one** conceptual question. Examples:

- "Why do some circuits light up and others don't?"
- "How do plants turn sunlight into food?"
- "What makes a sentence persuasive?"

Engage *poses* the question (often implicitly through a phenomenon). Explore *investigates* it. Explain *names* the mechanism. Elaborate *applies* it. Evaluate *tests* whether the student can answer the original question themselves.

When you sit down to write, **write the one-question on a scratch line first**. Every slide must serve it. If a slide doesn't help answer it, cut the slide.

---

## 2. The arc at a glance

```
   LEARNING INTENTION
          │
          ▼
   ┌─────────────┐
   │  ENGAGE     │   curiosity ↑   prior knowledge surfaced
   └─────────────┘
          │
          ▼
   ┌─────────────┐
   │  EXPLORE    │   direct experience   no formal terms yet
   └─────────────┘
          │
          ▼
   ┌─────────────┐
   │  EXPLAIN    │   formal vocabulary + precise definitions
   └─────────────┘
          │
          ▼
   ┌─────────────┐
   │  ELABORATE  │   transfer to a NEW context
   └─────────────┘
          │
          ▼
   ┌─────────────┐
   │  EVALUATE   │   self-check + retrieval
   └─────────────┘
          │
          ▼
       SUMMARY
```

Read this as a **single thought-arc**, not a checklist. The phases are not equal in airtime — Explain typically gets the most slides; Evaluate gets the fewest.

---

## 3. Cross-cutting principles

Before diving into individual phases, internalise these:

1. **One concept per deck.** If you have two concepts, build two decks. The arc breaks when it tries to carry two ideas.
2. **No formal vocabulary before Explain.** Use everyday words in Engage and Explore. Save the technical terms for the moment you can land them with definitions.
3. **Students do something every 2–3 slides.** If you have 4 consecutive slides of teacher-talk, you've lost them. Insert a quick prompt, a turn-and-talk, a prediction, a mini-task.
4. **Make the *student's mental action* explicit on every slide.** Every slide should imply "the student is now ___ing." If you can't fill that blank, the slide is filler.
5. **Visuals serve cognition, not decoration.** A photo that doesn't help students think should not be there. Refer to the contextual placement guide in `AGENTS.md`.
6. **Speaker notes are the teacher's safety net.** Anything a teacher needs to say, pause for, or check — put it in `def.notes`. Don't bury it in slide body text.

---

## 4. Phase 1 — ENGAGE 💡 (Orange)

### 4.1 Purpose

Open the curiosity gap. **Surface what students already (mis)understand**, and create a small puzzle their existing schema cannot solve. They should leave Engage thinking *"huh — I don't quite know the answer to that."*

### 4.2 Cognitive function

- **Activates prior knowledge** so the new content has somewhere to attach.
- **Surfaces misconceptions** the teacher can target in Explain.
- **Creates germane load** (interest) without overwhelming intrinsic load (no new technical terms yet).

### 4.3 What GOOD looks like

A good Engage slide does ONE of these:

| Hook type | Pattern | Example shape |
|---|---|---|
| **Discrepant event** | Show something that contradicts intuition | "Here are two identical-looking cups of water. One floats an egg, one sinks it. Why?" |
| **Provocative question** | Pose a question students can't yet answer but can guess at | "Could you survive on a planet where one day lasted six months?" |
| **Familiar phenomenon, fresh angle** | Take something mundane and reframe it | "You've crossed a road a thousand times. What is your brain *actually* doing in that moment?" |
| **Prediction task** | Give them a setup and ask what they think will happen | "If I drop this feather and this hammer in a vacuum tube, which hits first? Vote." |
| **Image / video / sound puzzle** | A visual that demands explanation | A timelapse, a strange waveform, a photo with no caption |
| **Quick personal-stakes prompt** | Tie the concept to the student's life | "Think of the last time you got really angry. What changed in your body?" |

The slide should fit in **30–90 seconds of teacher airtime**. Engage is NOT a lecture.

### 4.4 What BAD looks like (common failure modes)

- **The "definition" Engage.** Putting the formal definition of the topic on the Engage slide. (That's Explain, not Engage.)
- **The "outcome" Engage.** Stating what students will learn rather than making them curious about it.
- **The "history" Engage.** "In 1687, Isaac Newton…" — no student is hooked by a date.
- **Too many bullets.** Engage shouldn't be a list. 1–2 lines of prompt + 1 image/video is plenty.
- **Pre-loading vocabulary.** "Today we'll discover the *cellular respiration pathway* of *mitochondria*." Now the curiosity gap is gone — you've already told them the answer is "cellular respiration."
- **Closed yes/no questions with obvious answers.** "Did you know plants need sunlight?" — every student says yes and tunes out.

### 4.5 Sentence patterns that work for Engage prompts

- "What if ___?"
- "Look at ___. What's strange?"
- "I'm going to ___. Predict what happens."
- "When was the last time you ___? What was going on?"
- "Two things look the same but behave differently. Why?"
- "If you had to explain ___ to a Year 3, what would you say?"

### 4.6 Visual choice for Engage

From the contextual placement guide: **video preferred, image as fallback, then ASCII diagram, then text-only.** A motion hook (video) almost always out-performs a static image for activating curiosity. If you use an image, it must be striking and uncaptioned — let students wonder.

### 4.7 Speaker notes for Engage

The notes should contain:
- The teacher's prompt question, verbatim.
- 2–3 likely student responses (including misconceptions).
- A signposting line: "Don't resolve the question yet — we come back to it in Explain."

### 4.8 Engage checklist

Before finalising an Engage slide:

- [ ] Does it pose a question or puzzle the student can't yet answer?
- [ ] Have I avoided all formal vocabulary?
- [ ] Is there a clear *student action* (predict / observe / discuss)?
- [ ] Is the slide < 90 seconds of teacher airtime?
- [ ] Do the speaker notes include the teacher's prompt + 2–3 likely responses?
- [ ] Does the visual (if any) genuinely create curiosity rather than just decorate?

---

## 5. Phase 2 — EXPLORE 🔍 (Teal)

### 5.1 Purpose

Give students **direct, structured experience with the phenomenon** before they meet the formal explanation. They should generate questions, notice patterns, and form intuitions. The teacher's role is to set up, observe, and *withhold the answer*.

### 5.2 Cognitive function

- **Builds concrete referents** (mental images, hands-on memories) that the Explain phase's vocabulary will name.
- **Generates productive failure.** Students will get things partly wrong — that's fine. Their wrong attempts make the correct explanation memorable.
- **Distributes intrinsic load** by letting students encounter complexity in small, manageable interactions rather than as a wall of definitions.

### 5.3 What GOOD looks like

Explore activities take one of these shapes:

| Activity shape | Example |
|---|---|
| **Hands-on investigation** | "Build the simplest circuit you can that lights the bulb." |
| **Data collection** | "Measure your pulse before and after 30 jumping jacks. Record both." |
| **Pattern hunt** | "Here are 12 leaves. Sort them into groups. Tell me your rule." |
| **Sorting / classifying** | "Drag each item into 'living', 'non-living', or 'used to be living'." |
| **Simulation / model** | A PhET sim where students vary one parameter and observe outputs. |
| **Structured noticing** | "Watch this 90-second clip. Write down 3 things you noticed and 1 question." |
| **Compare-and-contrast** | "Look at these two writing samples. What's different?" |

The slide(s) should give students **a clear task, a clear deliverable, and time**. Recommend a time budget on the slide (e.g. "5 minutes — record in your book").

### 5.4 What BAD looks like

- **Explore with no doing.** A slide that says "Let's explore X" but the students just sit and listen — that's Explain wearing an Explore label.
- **Open-ended to the point of paralysis.** "Investigate magnets" — students don't know what to do. Constrain the task.
- **Pre-explaining the result.** "We will explore how forces work. Forces are pushes and pulls that…" — now there's nothing to discover.
- **Activities that ignore the phenomenon.** A worksheet of definitions is not exploration.
- **No deliverable.** If students don't write, sort, draw, or talk about something specific, the exploration evaporates.

### 5.5 Designing the Explore deliverable

The deliverable is the bridge into Explain. Design backward:

1. What concept will Explain introduce? (e.g. "series vs parallel circuits")
2. What direct experience would make that concept *obvious*? (e.g. building both and seeing one fail when a bulb is removed)
3. What does the student produce from that experience? (e.g. a labelled diagram of each circuit + a sentence describing what happened when they removed a bulb)
4. THAT is the Explore deliverable.

### 5.6 Data tables for Explore

For Explore phases that involve measurement or structured noticing, embed a fill-in table on the slide (use `C.e5ExploreSlide()` with a table, or `C.e5ContinuationSlide(... null, { table: {...} })` for the second Explore slide). Tables turn vague "observe stuff" into concrete "fill these cells."

### 5.7 Sentence patterns for Explore prompts

- "Try ___. Record what happens."
- "Sort these into ___. Then tell me your rule."
- "Build the simplest ___ you can that ___."
- "Notice 3 things. Write one question."
- "Compare A and B. What's the same? What's different?"
- "Vary [one thing]. Keep everything else the same. What changes?"

### 5.8 Visual choice for Explore

Video for demonstrating a procedure students will then mirror. Image or mind-map for concept-sorting tasks. ASCII diagram only if the diagram itself is the thing being investigated.

### 5.9 Speaker notes for Explore

- Time budget for the activity.
- What to circulate and look for (e.g. "Listen for groups using the word 'flow' — flag them for Explain").
- Misconceptions to expect.
- A holding line: "Don't correct them yet — let them notice the inconsistency themselves."

### 5.10 Explore checklist

- [ ] Is there a clear *do this* task, not just "let's explore"?
- [ ] Is there a deliverable (sketch, table, sentence, sort)?
- [ ] Is the time budget on the slide?
- [ ] Have I avoided pre-explaining the result?
- [ ] Does the activity produce a referent the Explain phase can name?
- [ ] Have I left at least one productive misconception for Explain to resolve?

---

## 6. Phase 3 — EXPLAIN 📖 (Blue)

### 6.1 Purpose

Now — and only now — introduce the **formal vocabulary, precise definitions, and the underlying mechanism**. Students have something to attach the words to. This is the most teacher-led phase. It is *also* the phase most prone to becoming "the whole lesson."

### 6.2 Cognitive function

- **Names the schema** students built in Explore. Naming is what makes a fuzzy intuition usable.
- **Corrects misconceptions** surfaced in Engage and Explore.
- **Builds precision.** The difference between everyday language ("electricity flows") and disciplinary language ("conventional current flows from + to −") matters.

### 6.3 What GOOD looks like

Explain is broken into 2–4 slides, each doing ONE of these:

| Slide type | What's on it |
|---|---|
| **Core vocabulary slide** | 2–4 key terms with crisp one-line definitions. Tied back to the Explore experience. |
| **Mechanism slide** | The how/why behind what students saw. Often with a labelled diagram or process flow. |
| **Worked example** | A specific instance of the concept worked through step-by-step. |
| **Comparison / contrast** | If the concept is best understood against its opposite (series vs parallel, mitosis vs meiosis). |
| **Misconception correction** | "You might think ___. Here's why that's not quite right." Tied directly to misconceptions observed in Explore. |

The first Explain slide should **explicitly bridge from Explore**: "Remember when you built two circuits and one stopped working? That's because…"

### 6.4 What BAD looks like

- **Wall of definitions.** 6 terms × 3 lines each = 18 lines of text. Nothing sticks.
- **No bridge from Explore.** Students don't see how the words connect to what they just did.
- **Generic worked examples.** A worked example that uses different numbers/context than Explore. The connection breaks.
- **Teacher-talk for 10 minutes straight.** Insert a 30-second turn-and-talk or a "now-you-try" mirrored problem.
- **Ambiguous definitions.** "Energy is the ability to do stuff." If you can't be precise, you don't yet understand it well enough to teach it.
- **Pre-emptive complexity.** Adding edge cases and exceptions before the main idea has landed.

### 6.5 The vocabulary slide pattern

For each term:

```
Term:           [bold, navy or blue]
Definition:     [one sentence, plain language]
Example:        [drawn directly from the Explore activity if possible]
Non-example:    [what it ISN'T — only if a known misconception]
```

Limit to **3 terms per slide**. If you have 6 terms, split across two Explain slides.

### 6.6 The worked example pattern

Every worked example slide should follow:

1. **State the question** (specific, not generic).
2. **Identify what's known and what's asked.**
3. **Walk through the steps with reasoning** ("we use ___ because ___"), not just the calculation.
4. **State the answer with units / qualifiers.**
5. **Pair with a "now you try"** mirrored problem (same structure, different numbers). Hide the answer in speaker notes.

The "now you try" is what converts passive watching into active practice.

### 6.7 The comparison slide pattern

When the concept is best taught against its opposite, use `C.comparisonColumnsSlide()` (rich) or `C.comparisonSlide()` (traditional). Each column should have:

- A clear label.
- 3–5 short points (parallel structure: same kind of statement in each column).
- A bottom-line take-away: "The key difference is ___."

### 6.8 Visual choice for Explain

- **Core vocab:** labelled image or clean ASCII diagram. Video is too passive here — students need to inspect, not watch.
- **Worked example:** small ASCII diagram (e.g. the circuit) or nothing — keep focus on the working.
- **Comparison:** side-by-side images / diagrams.

### 6.9 Speaker notes for Explain

- The teacher's narration for each definition (verbatim if it's a tight point).
- The misconception being addressed.
- The cue to pause for the "now you try."
- Hidden answer to the now-you-try.

### 6.10 Explain checklist

- [ ] Does the first Explain slide bridge explicitly from Explore?
- [ ] Are definitions precise but year-level-appropriate?
- [ ] Is each term tied to a concrete referent from Explore?
- [ ] Have I capped terms at 3 per slide?
- [ ] Is there at least one worked example + now-you-try pair?
- [ ] Have I addressed the misconceptions surfaced in Engage/Explore?
- [ ] No more than 3 consecutive teacher-talk slides without student action?

---

## 7. Phase 4 — ELABORATE 🔗 (Purple)

### 7.1 Purpose

Take the schema students now have and **apply it to a new context**. This is the test of whether they've abstracted the idea or only memorised the original example.

### 7.2 Cognitive function

- **Strengthens schema** by forcing abstraction beyond the original case.
- **Surfaces shallow understanding.** Students who only memorised the worked example will fail at transfer; the teacher can catch this here.
- **Builds confidence** through deliberate practice.

### 7.3 What GOOD looks like

Elaborate is task-driven. Typical shapes:

| Task shape | Example |
|---|---|
| **New-context application** | "We learned series circuits with bulbs. Now design one with a buzzer and a switch." |
| **Real-world problem** | "Your phone charger broke. Using what you know about circuits, sketch what might have gone wrong." |
| **Design / create** | "Design a 60-second persuasive speech using all three persuasive techniques." |
| **Extend with a twist** | "We solved this for two objects. What changes for three? For ten?" |
| **Cross-link to another topic** | "How does what you learned about forces explain how rockets work?" |
| **Open-ended investigation** | "Pick a household appliance. Predict what's inside. Sketch the circuit." |

Elaborate often **pairs with a companion DOCX worksheet**. The slide guides the task; the worksheet records the work.

### 7.4 What BAD looks like

- **Repeat-of-worked-example.** Same problem with different numbers = practice, not elaboration.
- **Vague "discuss this" prompts** with no deliverable.
- **Too much at once.** A 12-step open-ended design challenge in 5 minutes.
- **Disconnected.** A task that doesn't actually use the concept just taught.

### 7.5 Designing the transfer task

Use this test: **could a student answer this task by memorising the Explain slides alone?** If yes, you don't have an Elaborate task — you have more Explain. If no — they have to *think with* the concept — it's an Elaborate task.

### 7.6 Worksheet or slide?

- **Companion DOCX worksheet** is the gold standard for Elaborate when the task is substantive (>5 minutes, written output). Students have a record they can take home.
- **Slide-level activity** (fill-in table, checklist, prompt) works for shorter tasks or when a worksheet isn't practical.
- **No activity** is acceptable only for a "demo lesson" / theory-only deck — explicitly chosen by the user.

### 7.7 Visual choice for Elaborate

Usually **none on the slide** — students are working on the worksheet or task. The slide is a launching pad, not a textbook page.

### 7.8 Speaker notes for Elaborate

- Time budget.
- What success looks like (1–2 lines).
- Common stuck points and how to unblock them.
- Extension prompts for fast finishers.

### 7.9 Elaborate checklist

- [ ] Does the task apply the concept to a NEW context?
- [ ] Is there a clear deliverable?
- [ ] Is the time budget explicit?
- [ ] Could a memoriser succeed without thinking? (If yes — redesign.)
- [ ] Are there unblock prompts for stuck students in the notes?
- [ ] Is there an extension for early finishers in the notes?

---

## 8. Phase 5 — EVALUATE ✅ (Red)

### 8.1 Purpose

**Check understanding** through retrieval and self-assessment. This is NOT a summative test — it's the lesson's exit ticket. Students confirm (to themselves and the teacher) what stuck.

### 8.2 Cognitive function

- **Retrieval practice.** The act of recalling strengthens long-term memory more than re-reading.
- **Metacognition.** Students rate their own confidence, which builds self-awareness.
- **Teacher feedback signal.** The teacher sees what landed and what didn't — feeding forward into next lesson.

### 8.3 What GOOD looks like

Evaluate is short — 1–2 slides. Typical shapes:

| Format | Example |
|---|---|
| **3-2-1 exit** | 3 things you learned, 2 things you can do, 1 question you still have. |
| **MCQ check** | 2–4 multiple-choice items that target the lesson's core concept. Use `C.mcqCardSlide()` for visual cards. |
| **Quick application** | One short problem you can do in 3 minutes. |
| **Self-rating + sentence** | "Rate your confidence 1–5. Write one sentence about what you'd ask the teacher next." |
| **Peer explain** | "Turn to your partner and explain ___ in 30 seconds. They listen, then swap." |
| **Two truths and a lie** | About today's content — students identify the false one. |

### 8.4 What BAD looks like

- **Evaluate that introduces new content.** No new ideas after Elaborate.
- **Evaluate as homework set.** "For homework, do questions 1–20." That's not evaluation — that's deferring it.
- **Vague self-rating** with no follow-up. "Rate yourself 1–5" → silence. Always pair with a written prompt.
- **Too long.** If Evaluate takes 15 minutes you've replaced the lesson with a test.

### 8.5 Tying Evaluate back to the Learning Intention

The Evaluate questions should be **direct evidence of the success criteria** stated on the Learning Intention slide. If the success criterion was "I can explain why parallel circuits keep working when one bulb breaks," the Evaluate question should be exactly that — not something tangential.

This loop (LI → Evaluate) is what makes the lesson coherent.

### 8.6 Visual choice for Evaluate

**None.** The slide should be clean — question and answer space. Visual would distract.

### 8.7 Speaker notes for Evaluate

- The correct answers (so the teacher can mark-on-the-fly).
- A "look for" cue: which response pattern indicates which misconception.
- The follow-up plan: "If most students missed Q2, re-teach ___ next lesson."

### 8.8 Evaluate checklist

- [ ] Does it directly test the Learning Intention's success criteria?
- [ ] Is it short (1–2 slides, 3–5 minutes of class time)?
- [ ] Is there a retrieval element (not just self-rating)?
- [ ] Are answers in speaker notes for the teacher?
- [ ] No new content introduced?

---

## 9. Learning Intention slide — the contract

The Learning Intention slide sits **before** Engage and is the deck's promise to students.

### 9.1 Structure

- **Title:** "Learning Intention" (or "Today's Goal" / "What you'll be able to do").
- **One verb + noun statement** of what students will know/do. Use observable verbs (explain, compare, build, predict, justify) — NOT vague ones (understand, know about, learn).
- **Success criteria:** 2–4 concrete observables, each starting "I can ___" or "I will ___."

### 9.2 Example

> **Learning Intention:** Explain why a parallel circuit keeps working when one bulb breaks, but a series circuit doesn't.
>
> **Success criteria:**
> - I can draw a series and a parallel circuit using correct symbols.
> - I can predict what happens to a circuit when one component is removed.
> - I can use the words *circuit*, *series*, *parallel*, *complete*, and *broken* correctly.

### 9.3 What BAD looks like

- "Students will learn about circuits." (Vague verb, vague noun.)
- A list of every concept in the lesson. (Too much — pick the core.)
- Success criteria that just restate the LI. (Useless.)
- Teacher-facing language ("By the end of this lesson, learners will…"). Speak to the student in second person.

---

## 10. Summary / Wrap-up slide

The closing slide. Three jobs:

1. **Recap the answer** to the one-question the deck posed at Engage.
2. **Highlight the 2–3 take-aways** in the student's own working language.
3. **Hint at what's next.** "Next lesson we'll see how this applies to ___" — keeps the arc going across lessons.

Use `C.wrapUpSlide()` for rich style or `C.summarySlide()` for traditional.

**Do not** put new content here. Do not list every term — pick the 2–3 that students must walk away with.

---

## 11. Cross-phase quality gate

Before declaring an E5 deck done, run this gate:

1. **One-question test.** Can you state the deck's single conceptual question in one sentence? Does every slide serve it?
2. **Phase coherence test.** Does Explore produce the referent that Explain names? Does Elaborate apply what Explain defined? Does Evaluate test what the Learning Intention promised?
3. **Student-action test.** On every slide, can you fill in "the student is now ___ing"? If not, cut or rewrite.
4. **Vocabulary timing test.** Does the first appearance of each formal term happen in Explain, not earlier?
5. **Cognitive load test.** Are there 3+ consecutive teacher-talk slides? Insert a student action.
6. **Continuation chrome test.** For any phase with >1 slide, does every slide AFTER the first use `C.e5ContinuationSlide()` so the phase chrome (skill label, phase button, SM bar) persists?
7. **Visual fit test.** Does every image / video genuinely illustrate the slide's content? (Run the image verification loop from `AGENTS.md` Step 3b.)
8. **Speaker-notes coverage test.** Does every Explain, Elaborate, and Evaluate slide have notes? Answers should not be on the slide body — they go in notes.
9. **Time budget test.** Does Engage = 5 min, Explore = 10–15 min, Explain = 15–20 min, Elaborate = 15–25 min, Evaluate = 5 min? Adjust if the total exceeds the period.
10. **Loop-closing test.** Does the Summary slide answer the Engage question, and do the Evaluate items match the Learning Intention's success criteria?

If any test fails — fix it before building.

---

## 12. Pacing reference (60-minute period)

| Phase | Default airtime | When to extend | When to shrink |
|---|---|---|---|
| Learning Intention | 2 min | First lesson on the topic | Continuing previous lesson |
| Engage | 5 min | Strong hook with discussion | Time-pressed period |
| Explore | 10–15 min | Hands-on investigation | Brief sorting / noticing task |
| Explain | 15–20 min | Multiple concepts or worked examples | Single tight definition |
| Elaborate | 15–25 min | Worksheet-driven, deep transfer | Short MCQ-style application |
| Evaluate | 5 min | High-stakes consolidation | Quick self-rating |
| Summary | 2 min | Always keep brief | — |

Adjust the slide counts (the deck's *length*) to match airtime, not the other way around.

---

## 13. Anti-patterns — the things that ruin E5 decks

If you catch yourself doing any of these, stop and re-draft.

1. **Engage that's actually Explain.** Putting a definition or the lesson outline on the Engage slide. The curiosity gap is gone before it opened.
2. **Explore with no doing.** A slide titled "Explore" where the student passively watches. Re-label it or design a task.
3. **Explain that runs forever.** 6 slides of teacher-talk in a row. Insert action.
4. **Elaborate that's a repeat-with-different-numbers.** That's practice, not elaboration. Change the *context*, not just the values.
5. **Evaluate that introduces new content.** "Before you go, here's one more idea…" — no. The arc is closed.
6. **Multi-slide phase without continuation chrome.** Using `C.contentSlide()` for the 2nd Engage slide — students lose their phase orientation.
7. **Skipping the Learning Intention.** Without the LI, Evaluate has nothing to anchor to.
8. **Two concepts in one deck.** Build two decks.
9. **No Summary, or a Summary that lists every term.** Summary = the 2–3 things they must walk away with.
10. **Decorative-only visuals.** A photo of a generic landscape on a slide about plate tectonics adds nothing.
11. **Speaker notes left empty on question slides.** The teacher needs the answer.
12. **Vocabulary on Engage or Explore.** Save technical terms for Explain.
13. **No bridge from Explore to Explain.** The first Explain slide should reference the Explore activity by name.

---

## 14. Standard vs Extended E5 — content density

Recall from `AGENTS.md`:

- **Standard E5** (6–8 slides): one slide per phase. Use this for a short lesson, recap, or when you genuinely have one tight concept.
- **Extended E5** (12–20 slides): extra theory detail, worked examples, now-you-try, comparison tables, data-collection tables — all *interleaved into their phases*, NEVER appended at the end.

**The pedagogy is identical.** Extended E5 just allocates more slides to phases that need them (usually Explain). The arc must still be coherent — don't pile every extra slide into Explain and starve the others.

**Default Extended split:** Engage 1 / Explore 2 (incl. data table) / Explain 5 (vocab + 2 worked-example pairs + comparison) / Elaborate 1 / Evaluate 1 / Summary 1 = 11–12 slides. Adjust based on concept needs.

---

## 15. Differentiation across the arc

When a deck targets a mixed-ability class:

| Phase | How to differentiate |
|---|---|
| Engage | Hook works across abilities — but ensure the prompt can be answered with a guess (low floor). |
| Explore | Give a "minimum task" and an "extension." Stronger students go further. |
| Explain | Use the comparison slide pattern — visual side-by-side helps weaker readers. |
| Elaborate | This is the biggest differentiation lever. Worksheet has tiered tasks (scaffolded / standard / extension). |
| Evaluate | The MCQ + sentence pattern lets all students show partial credit. |

For a heavily-scaffolded lesson, increase Explain depth (more worked examples, hidden answers under now-you-try) and add sentence starters to the Elaborate worksheet.

---

## 16. Final author's note

The E5 model is a *thinking discipline*, not a slide template. The slide helpers in `PPTX_BUILDER_REFERENCE.md` make the layout fast — they don't make the lesson good. The lesson is good when:

- The one-question is sharp.
- Every phase does its actual job (not a different phase wearing its label).
- Students do something on every slide.
- The vocabulary appears at the moment it's earned.
- The Summary closes the loop the Engage opened.

If you keep those five things in mind while you write, the deck will work. The technical helpers will take care of the rest.
