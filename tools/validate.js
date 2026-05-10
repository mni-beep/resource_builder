// ============================================================
// tools/validate.js — Shared content validation for DOCX & PPTX
// ============================================================

/**
 * Validate an array of assembled content elements (DOCX) or slide definitions (PPTX).
 * Checks for nested arrays (missing spread) and null/undefined entries.
 *
 * @param {Array}  elements  - The assembled content array
 * @param {string} label     - "slide" or "element" (for error messages)
 * @param {string} spreadExamples - Comma-separated helper names to suggest
 * @returns {boolean} true if valid; prints error and exits process on failure
 */
function validateContentArray(elements, label = "element", spreadExamples = "linedAnswerSpace(), drawingSpace(), lessonBanner(), mcQuestion()") {
  const badIndices = [];
  elements.forEach((el, i) => {
    if (Array.isArray(el)) badIndices.push(i);
    else if (el === undefined || el === null) badIndices.push(i);
    else if (label === "slide" && typeof el !== 'object') badIndices.push(i);
  });

  if (badIndices.length > 0) {
    const count = badIndices.length;
    const sample = badIndices.slice(0, 10).join(', ');
    const reason = label === "slide"
      ? `${count} slide definition(s) at indices ${sample} are invalid (array, null, undefined, or non-object).`
      : `${count} element(s) at indices ${sample} are arrays or null/undefined.`;

    console.error(`  ✗ CORRUPTION DETECTED — ${reason}`);
    console.error('    Likely cause: missing spread operator (...) on a helper that returns an array.');
    console.error(`    Check calls to C.${spreadExamples}.`);
    if (label === "slide") {
      console.error('    Example: slides.push(...C.e5LessonPlan(...)) — NOT slides.push(C.e5LessonPlan(...)).');
    } else {
      console.error('    Example: ...C.linedAnswerSpace(3) — NOT C.linedAnswerSpace(3).');
    }
    process.exit(1);
  }

  return true;
}

module.exports = { validateContentArray };
