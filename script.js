/* Student Grade Calculator - vanilla JavaScript */

/* ---------- Configuration ----------
   Change thresholds here to match your institution's grading system.
   Grades are checked from top to bottom; the first one whose `min` the
   percentage reaches is used. */
const GRADING_SCALE = {
  passPercentage: 40, // a subject passes at this percentage or above
  grades: [
    { grade: "A", min: 90 },
    { grade: "B", min: 80 },
    { grade: "C", min: 70 },
    { grade: "D", min: 60 },
    { grade: "E", min: 40 },
    { grade: "F", min: 0 }
  ]
};

const STORAGE_KEY = "studentGradeCalculator.v1";

/* ---------- Pure calculation helpers (no DOM) ---------- */

function getGrade(percentage) {
  for (const level of GRADING_SCALE.grades) {
    if (percentage >= level.min) return level.grade;
  }
  return GRADING_SCALE.grades[GRADING_SCALE.grades.length - 1].grade;
}

function roundTo2(n) {
  return Number(n.toFixed(2));
}

/* Checks raw subjects ({name, max, obtained} as strings).
   Returns { errors: [{index, field, message}], ... } */
function validateSubjects(subjects) {
  const errors = [];
  if (subjects.length === 0) {
    errors.push({ index: -1, field: "", message: "Add at least one subject before calculating." });
    return errors;
  }
  subjects.forEach((s, i) => {
    const label = "Subject " + (i + 1);
    const name = String(s.name).trim();
    const maxText = String(s.max).trim();
    const obtText = String(s.obtained).trim();
    const max = Number(maxText);
    const obtained = Number(obtText);

    if (name === "") errors.push({ index: i, field: "name", message: label + ": enter a subject name." });

    if (maxText === "" || !Number.isFinite(max)) {
      errors.push({ index: i, field: "max", message: label + ": enter a valid number for maximum marks." });
    } else if (max <= 0) {
      errors.push({ index: i, field: "max", message: label + ": maximum marks must be greater than 0." });
    }

    if (obtText === "" || !Number.isFinite(obtained)) {
      errors.push({ index: i, field: "obtained", message: label + ": enter a valid number for obtained marks." });
    } else if (obtained < 0) {
      errors.push({ index: i, field: "obtained", message: label + ": obtained marks cannot be negative." });
    } else if (Number.isFinite(max) && max > 0 && obtained > max) {
      errors.push({ index: i, field: "obtained", message: label + ": obtained marks cannot be more than maximum marks." });
    }
  });
  return errors;
}

/* Assumes subjects already passed validation. */
function calculateResults(subjects) {
  const rows = subjects.map((s) => {
    const max = Number(s.max);
    const obtained = Number(s.obtained);
    const percentage = (obtained / max) * 100;
    return {
      name: String(s.name).trim(),
      obtained: obtained,
      max: max,
      percentage: percentage,
      grade: getGrade(percentage),
      passed: percentage >= GRADING_SCALE.passPercentage
    };
  });

  const totalObtained = rows.reduce((sum, r) => sum + r.obtained, 0);
  const totalMax = rows.reduce((sum, r) => sum + r.max, 0);
  const overallPercentage = (totalObtained / totalMax) * 100;
  const averagePercentage = rows.reduce((sum, r) => sum + r.percentage, 0) / rows.length;

  return {
    rows: rows,
    totalObtained: roundTo2(totalObtained),
    totalMax: roundTo2(totalMax),
    overallPercentage: overallPercentage,
    averagePercentage: averagePercentage,
    overallGrade: getGrade(overallPercentage),
    passed: rows.every((r) => r.passed)
  };
}

/* Export for the Node test only; ignored in the browser. */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { GRADING_SCALE, getGrade, validateSubjects, calculateResults };
}

/* ---------- Browser code ---------- */

if (typeof document !== "undefined") {
  const $ = (id) => document.getElementById(id);
  const el = {
    form: $("grade-form"), name: $("student-name"), cls: $("student-class"),
    list: $("subject-list"), empty: $("subject-empty"), error: $("error-box"),
    add: $("add-btn"), print: $("print-btn"), reset: $("reset-btn"), sample: $("sample-btn"),
    emptyResults: $("empty-results"), content: $("results-content"), rows: $("result-rows"),
    statusCard: $("status-card")
  };
  let rowCounter = 0;
  let calculated = false;

  /* --- Subject rows (built with DOM methods, never innerHTML) --- */
  function makeField(labelText, type, extra) {
    const id = "field-" + extra.key + "-" + rowCounter;
    const wrap = document.createElement("div");
    wrap.className = "field";
    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = labelText;
    const input = document.createElement("input");
    input.id = id;
    input.type = type;
    input.dataset.field = extra.key;
    input.placeholder = extra.placeholder;
    input.value = extra.value;
    if (type === "number") { input.min = "0"; input.step = "any"; input.inputMode = "decimal"; }
    else { input.maxLength = 60; input.autocomplete = "off"; }
    wrap.append(label, input);
    return wrap;
  }

  function addSubjectRow(data) {
    rowCounter += 1;
    const d = data || { name: "", max: "", obtained: "" };
    const row = document.createElement("div");
    row.className = "subject-row";
    row.append(
      makeField("Subject name", "text", { key: "name", placeholder: "e.g. Mathematics", value: d.name }),
      makeField("Maximum marks", "number", { key: "max", placeholder: "100", value: d.max }),
      makeField("Obtained marks", "number", { key: "obtained", placeholder: "0", value: d.obtained })
    );
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn btn-secondary btn-remove";
    remove.textContent = "✕";
    remove.setAttribute("aria-label", "Remove this subject");
    remove.title = "Remove subject";
    remove.addEventListener("click", () => {
      row.remove();
      updateEmptyState();
      afterEdit();
    });
    row.append(remove);
    el.list.append(row);
    updateEmptyState();
  }

  function updateEmptyState() {
    el.empty.hidden = el.list.children.length > 0;
  }

  function readSubjects() {
    return Array.from(el.list.children).map((row) => ({
      name: row.querySelector('[data-field="name"]').value,
      max: row.querySelector('[data-field="max"]').value,
      obtained: row.querySelector('[data-field="obtained"]').value
    }));
  }

  function setSubjects(subjects) {
    el.list.replaceChildren();
    subjects.forEach(addSubjectRow);
    updateEmptyState();
  }

  /* --- Errors --- */
  function clearErrors() {
    el.error.hidden = true;
    el.error.replaceChildren();
    el.list.querySelectorAll("input").forEach((i) => i.removeAttribute("aria-invalid"));
  }

  function showErrors(errors) {
    clearErrors();
    const title = document.createElement("strong");
    title.textContent = "Please fix the following:";
    const ul = document.createElement("ul");
    errors.forEach((e) => {
      const li = document.createElement("li");
      li.textContent = e.message;
      ul.append(li);
      const row = el.list.children[e.index];
      if (row && e.field) row.querySelector('[data-field="' + e.field + '"]').setAttribute("aria-invalid", "true");
    });
    el.error.append(title, ul);
    el.error.hidden = false;
  }

  /* --- Results --- */
  const fmtMarks = (n) => String(roundTo2(n));
  const fmtPct = (n) => n.toFixed(2) + "%";

  function makeCell(text, className) {
    const td = document.createElement("td");
    td.textContent = text;
    if (className) td.className = className;
    return td;
  }

  function makeBadge(passed) {
    const span = document.createElement("span");
    span.className = "badge " + (passed ? "pass" : "fail");
    span.textContent = passed ? "PASS" : "FAIL";
    return span;
  }

  function showResults(r) {
    $("res-percentage").textContent = fmtPct(r.overallPercentage);
    $("res-grade").textContent = r.overallGrade;
    $("res-status").textContent = r.passed ? "PASS" : "FAIL";
    $("res-obtained").textContent = fmtMarks(r.totalObtained);
    $("res-max").textContent = fmtMarks(r.totalMax);
    $("res-average").textContent = fmtPct(r.averagePercentage);
    el.statusCard.className = "stat " + (r.passed ? "pass" : "fail");

    el.rows.replaceChildren();
    r.rows.forEach((s) => {
      const tr = document.createElement("tr");
      const gradeCell = makeCell(s.grade, "grade");
      const statusCell = document.createElement("td");
      statusCell.append(makeBadge(s.passed));
      tr.append(makeCell(s.name), makeCell(fmtMarks(s.obtained), "num"), makeCell(fmtMarks(s.max), "num"),
                makeCell(fmtPct(s.percentage), "num"), gradeCell, statusCell);
      el.rows.append(tr);
    });

    $("print-name").textContent = el.name.value.trim() || "Not provided";
    $("print-class").textContent = el.cls.value.trim() || "Not provided";
    $("print-date").textContent = new Date().toLocaleDateString();

    el.emptyResults.hidden = true;
    el.content.hidden = false;
  }

  function hideResults() {
    el.content.hidden = true;
    el.emptyResults.hidden = false;
  }

  /* Returns true if results were shown. */
  function runCalculation() {
    const subjects = readSubjects();
    const errors = validateSubjects(subjects);
    if (errors.length > 0) {
      showErrors(errors);
      calculated = false;
      hideResults();
      saveState();
      return false;
    }
    clearErrors();
    showResults(calculateResults(subjects));
    calculated = true;
    saveState();
    return true;
  }

  /* --- LocalStorage --- */
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        student: el.name.value, department: el.cls.value,
        subjects: readSubjects(), calculated: calculated
      }));
    } catch (e) { /* storage may be blocked or full; the app still works */ }
  }

  function loadState() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!data || typeof data !== "object" || !Array.isArray(data.subjects)) return false;
      el.name.value = typeof data.student === "string" ? data.student.slice(0, 80) : "";
      el.cls.value = typeof data.department === "string" ? data.department.slice(0, 80) : "";
      const clean = data.subjects.filter((s) => s && typeof s === "object").slice(0, 50).map((s) => ({
        name: typeof s.name === "string" ? s.name.slice(0, 60) : "",
        max: typeof s.max === "string" || typeof s.max === "number" ? String(s.max) : "",
        obtained: typeof s.obtained === "string" || typeof s.obtained === "number" ? String(s.obtained) : ""
      }));
      setSubjects(clean);
      if (data.calculated === true) runCalculation();
      return true;
    } catch (e) {
      try { localStorage.removeItem(STORAGE_KEY); } catch (err) { /* ignore */ }
      return false;
    }
  }

  /* When inputs change, old results may be out of date, so hide them. */
  function afterEdit() {
    if (calculated) { calculated = false; hideResults(); }
    saveState();
  }

  /* --- Events --- */
  el.add.addEventListener("click", () => {
    addSubjectRow();
    el.list.lastElementChild.querySelector("input").focus();
    afterEdit();
  });

  el.form.addEventListener("submit", (e) => { e.preventDefault(); runCalculation(); });
  el.form.addEventListener("input", afterEdit);

  el.sample.addEventListener("click", () => {
    el.name.value = "Sample Student";
    el.cls.value = "Grade 12 Science";
    setSubjects([
      { name: "Mathematics", max: "100", obtained: "80" },
      { name: "Physics", max: "100", obtained: "35" },
      { name: "Chemistry", max: "100", obtained: "90" }
    ]);
    runCalculation();
  });

  el.print.addEventListener("click", () => {
    if (runCalculation()) window.print();
  });

  el.reset.addEventListener("click", () => {
    if (!window.confirm("Reset everything? This clears the form, results and saved data.")) return;
    el.name.value = "";
    el.cls.value = "";
    calculated = false;
    clearErrors();
    setSubjects([{ name: "", max: "", obtained: "" }]);
    hideResults();
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  });

  /* --- Start --- */
  if (!loadState()) setSubjects([{ name: "", max: "", obtained: "" }]);
}
