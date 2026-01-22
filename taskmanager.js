"use strict";

/* =========================
   Tasks UI
========================= */
const form = document.getElementById("taskForm");
const list = document.getElementById("list");
const calendarDiv = document.getElementById("calendar");
const tasksTitle = document.getElementById("tasksTitle");
const themeToggle = document.getElementById("themeToggle");
const nameInput = document.getElementById("taskName");
const dateInput = document.getElementById("taskDate");

let tasks = [];
let selectedDate = null;

/* =========================
   Home / Tasks screens
========================= */
const enterBtn = document.getElementById("enterBtn");
const backBtn = document.getElementById("backBtn");

/* =========================
   Exams (sidebar only)
========================= */
const examListSidebar = document.getElementById("examListSidebar");

// Modal
const editExamsBtn = document.getElementById("editExamsBtn");
const editExamsModal = document.getElementById("editExamsModal");
const examSelect = document.getElementById("examSelect");
const subjectSelect = document.getElementById("subjectSelect");
const examDateInput = document.getElementById("examDateInput");
const saveExamsBtn = document.getElementById("saveExamsBtn");
const removeExamBtn = document.getElementById("removeExamBtn");
const cancelExamsBtn = document.getElementById("cancelExamsBtn");

/* =========================
   Helpers
========================= */
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/* =========================
   Tasks persistence
========================= */
function loadTasks() {
  try {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* =========================
   Theme persistence
========================= */
function initTheme() {
  if (!themeToggle) return;

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "מצב בהיר";
  } else {
    themeToggle.textContent = "מצב כהה";
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    themeToggle.textContent = isDark ? "מצב בהיר" : "מצב כהה";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

/* =========================
   Calendar
========================= */
function renderCalendar() {
  if (!calendarDiv) return;
  calendarDiv.innerHTML = "";

  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const dayDate = new Date();
    dayDate.setDate(today.getDate() + i);
    const dateStr = formatDate(dayDate);

    const dayDiv = document.createElement("div");
    dayDiv.className = "calendar-day";
    dayDiv.dataset.date = dateStr;
    dayDiv.textContent = `${dayDate.getDate()}/${dayDate.getMonth() + 1}`;

    if (tasks.some((t) => t.date === dateStr)) dayDiv.classList.add("has-tasks");
    if (selectedDate === dateStr) dayDiv.classList.add("selected");

    dayDiv.addEventListener("click", () => {
      selectedDate = dateStr;
      renderTasks();
      renderCalendar();
    });

    calendarDiv.appendChild(dayDiv);
  }
}

/* =========================
   Task list
========================= */
function renderTasks() {
  if (!list) return;
  list.innerHTML = "";

  let tasksToShow = tasks;

  if (selectedDate) {
    tasksToShow = tasks.filter((t) => t.date === selectedDate);
    if (tasksTitle) tasksTitle.textContent = `משימות ליום ${selectedDate}`;
  } else {
    if (tasksTitle) tasksTitle.textContent = "כל המשימות";
  }

  tasksToShow.forEach((task) => {
    const li = document.createElement("li");
    if (task.done) li.classList.add("done");

    const textDiv = document.createElement("div");
    textDiv.className = "task-text";
    textDiv.textContent = `${task.name} (${task.date})`;

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "task-actions";

    const doneBtn = document.createElement("button");
    doneBtn.type = "button";
    doneBtn.textContent = task.done ? "↩️" : "✔️";
    doneBtn.addEventListener("click", () => {
      task.done = !task.done;
      saveTasks();
      renderTasks();
      renderCalendar();
    });

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.textContent = "✏️";
    editBtn.addEventListener("click", () => {
      nameInput.value = task.name;
      dateInput.value = task.date;

      tasks = tasks.filter((t) => t.id !== task.id);
      saveTasks();
      renderTasks();
      renderCalendar();
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.textContent = "🗑️";
    delBtn.addEventListener("click", () => {
      tasks = tasks.filter((t) => t.id !== task.id);
      saveTasks();
      renderTasks();
      renderCalendar();
    });

    actionsDiv.append(doneBtn, editBtn, delBtn);
    li.append(textDiv, actionsDiv);
    list.appendChild(li);
  });
}

function initTaskForm() {
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const date = dateInput.value;
    if (!name || !date) return;

    tasks.push({ id: Date.now(), name, date, done: false });

    saveTasks();
    form.reset();
    renderTasks();
    renderCalendar();
  });
}

/* =========================
   Screen navigation
========================= */
function initScreenNav() {
  if (enterBtn) enterBtn.addEventListener("click", () => document.body.classList.add("show-tasks"));
  if (backBtn) backBtn.addEventListener("click", () => document.body.classList.remove("show-tasks"));
}

/* =========================
   Exams persistence
========================= */
const EXAMS_STORAGE_KEY = "exams";

function loadExams() {
  try {
    const saved = localStorage.getItem(EXAMS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveExams() {
  localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
}

function formatExamDateForDisplay(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [, m, d] = iso.split("-");
  const y = iso.split("-")[0];
  return `${d}/${m}/${y}`;
}

function renderExamList(listEl, data) {
  if (!listEl) return;
  listEl.innerHTML = "";
  data.forEach((exam) => {
    const li = document.createElement("li");
    li.textContent = `${exam.subject} - ${formatExamDateForDisplay(exam.date)}`;
    listEl.appendChild(li);
  });
}

const defaultExams = [
  { subject: "פרקי מכונות", date: "2025-12-20" },
  { subject: "דינמיקה", date: "2025-12-22" },
  { subject: "תרמודינמיקה", date: "2025-12-25" },
];

let exams = loadExams() || defaultExams;
saveExams();

function removePastExams() {
  const todayStr = formatDate(new Date());

  exams = exams.filter((exam) => {
    if (!exam.date || !/^\d{4}-\d{2}-\d{2}$/.test(exam.date)) return true;
    return exam.date >= todayStr;
  });

  saveExams();
  renderExamList(examListSidebar, exams);
}

function populateExamSelect() {
  if (!examSelect) return;

  examSelect.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "בחר מבחן לעריכה (לא חובה)";
  examSelect.appendChild(placeholder);

  exams.forEach((exam, index) => {
    const opt = document.createElement("option");
    opt.value = String(index);
    opt.textContent = `${exam.subject} - ${formatExamDateForDisplay(exam.date)}`;
    examSelect.appendChild(opt);
  });
}

function closeExamsModal() {
  if (!editExamsModal) return;
  editExamsModal.classList.remove("show");
}

function initExamsModal() {
  if (examSelect) {
    examSelect.addEventListener("change", () => {
      const idx = examSelect.value === "" ? -1 : Number(examSelect.value);

      if (idx >= 0 && exams[idx]) {
        const exam = exams[idx];

        if (subjectSelect && [...subjectSelect.options].some((o) => o.value === exam.subject)) {
          subjectSelect.value = exam.subject;
        } else if (subjectSelect) {
          subjectSelect.selectedIndex = 0;
        }

        if (examDateInput) examDateInput.value = exam.date || "";
      } else {
        if (subjectSelect) subjectSelect.selectedIndex = 0;
        if (examDateInput) examDateInput.value = "";
      }
    });
  }

  // ✅ FIXED: correct braces + opens modal from sidebar button
  console.log("editExamsBtn:", editExamsBtn);
console.log("editExamsModal:", editExamsModal);

editExamsBtn?.addEventListener("click", (e) => {
  e.preventDefault();

  console.log("Edit exams clicked");

  removePastExams();
  populateExamSelect();

  if (examSelect) examSelect.value = "";
  if (subjectSelect) subjectSelect.selectedIndex = 0;
  if (examDateInput) examDateInput.value = "";

  // Force show (CSS + inline style) so it cannot “fail silently”
  if (editExamsModal) {
    editExamsModal.classList.add("show");
    editExamsModal.style.display = "flex";
  }

  console.log("Modal classes:", editExamsModal?.className);
});

  if (saveExamsBtn) {
    saveExamsBtn.addEventListener("click", () => {
      const subject = subjectSelect ? subjectSelect.value : "";
      const date = examDateInput ? examDateInput.value : "";

      if (!subject || !date) {
        alert("אנא בחר מקצוע ותאריך.");
        return;
      }

      const selectedIndex = examSelect && examSelect.value !== "" ? Number(examSelect.value) : -1;

      if (selectedIndex >= 0 && exams[selectedIndex]) {
        exams[selectedIndex].subject = subject;
        exams[selectedIndex].date = date;
      } else {
        exams.push({ subject, date });
      }

      saveExams();
      removePastExams();
      populateExamSelect();

      if (examSelect) examSelect.value = "";
      if (subjectSelect) subjectSelect.selectedIndex = 0;
      if (examDateInput) examDateInput.value = "";

      closeExamsModal();
    });
  }

  if (removeExamBtn) {
    removeExamBtn.addEventListener("click", () => {
      const selectedIndex = examSelect && examSelect.value !== "" ? Number(examSelect.value) : -1;

      if (selectedIndex < 0 || !exams[selectedIndex]) {
        alert("אנא בחר מבחן למחיקה.");
        return;
      }

      if (!confirm("האם אתה בטוח שברצונך למחוק את המבחן?")) return;

      exams.splice(selectedIndex, 1);
      saveExams();
      removePastExams();
      populateExamSelect();

      if (examSelect) examSelect.value = "";
      if (subjectSelect) subjectSelect.selectedIndex = 0;
      if (examDateInput) examDateInput.value = "";
    });
  }

  if (cancelExamsBtn) cancelExamsBtn.addEventListener("click", closeExamsModal);

  if (editExamsModal) {
    editExamsModal.addEventListener("click", (e) => {
      if (e.target === editExamsModal) closeExamsModal();
    });
  }

  setInterval(removePastExams, 60 * 60 * 1000);
}

/* =========================
   Boot
========================= */
tasks = loadTasks();

initTheme();
initTaskForm();
initScreenNav();

renderTasks();
renderCalendar();

removePastExams();
initExamsModal();