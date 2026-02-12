"use strict";

/* =========================
Elements
========================= */
const form = document.getElementById("taskForm");
const list = document.getElementById("list");
const calendarDiv = document.getElementById("calendar");
const tasksTitle = document.getElementById("tasksTitle");
const themeToggle = document.getElementById("themeToggle");
const nameInput = document.getElementById("taskName");
const dateInput = document.getElementById("taskDate");

const enterBtn = document.getElementById("enterBtn");
const backBtn = document.getElementById("backBtn");

const examListSidebar = document.getElementById("examListSidebar");

// Exams modal
const editExamsBtn = document.getElementById("editExamsBtn");
const editExamsModal = document.getElementById("editExamsModal");
const examSelect = document.getElementById("examSelect");
const subjectSelect = document.getElementById("subjectSelect");
const examDateInput = document.getElementById("examDateInput");
const saveExamsBtn = document.getElementById("saveExamsBtn");
const removeExamBtn = document.getElementById("removeExamBtn");
const cancelExamsBtn = document.getElementById("cancelExamsBtn");

// Past exams modal
const pastExamsBtn = document.getElementById("pastExamsBtn");
const pastExamsModal = document.getElementById("pastExamsModal");
const pastExamsList = document.getElementById("pastExamsList");
const gradeStats = document.getElementById("gradeStats");
const closePastExamsBtn = document.getElementById("closePastExamsBtn");

const goalForm = document.getElementById("goalForm");
const goalInput = document.getElementById("goalInput");
const goalDisplay = document.getElementById("goalDisplay");
const goalText = document.getElementById("goalText");
const clearGoalBtn = document.getElementById("clearGoalBtn");
const celebrationContainer = document.getElementById("celebrationContainer");

let currentGoal = null;
let hasAchieved = false;

let tasks = [];
let selectedDate = null;
let upcomingExams = [];
let pastExams = [];

/* =========================
Helpers
========================= */
function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function ensureId(exam) {
    if (!exam.id) {
        exam.id = Date.now().toString();
    }
    return exam;
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
Upcoming Exams persistence
========================= */
const UPCOMING_EXAMS_KEY = "upcomingExams";
const PAST_EXAMS_KEY = "pastExams";

const defaultUpcomingExams = [
    { subject: "פרקי מכונות", date: "2025-12-20" },
    { subject: "דינמיקה", date: "2025-12-22" },
    { subject: "תרמודינמיקה", date: "2025-12-25" }
];

function loadUpcomingExams() {
    try {
        const saved = localStorage.getItem(UPCOMING_EXAMS_KEY);
        const loaded = saved ? JSON.parse(saved) : defaultUpcomingExams;
        return loaded.map(ensureId);
    } catch {
        return defaultUpcomingExams.map(ensureId);
    }
}

function saveUpcomingExams() {
    localStorage.setItem(UPCOMING_EXAMS_KEY, JSON.stringify(upcomingExams));
}

function loadPastExams() {
    try {
        const saved = localStorage.getItem(PAST_EXAMS_KEY);
        return saved ? JSON.parse(saved).map(ensureId) : [];
    } catch {
        return [];
    }
}

function savePastExams() {
    localStorage.setItem(PAST_EXAMS_KEY, JSON.stringify(pastExams));
}

/* =========================
Theme
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
Tasks
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
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            const total = tasksToShow.length;
            const completed = tasksToShow.filter(t => t.done).length;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
            if (progressFill) progressFill.style.width = `${percent}%`;
            if (progressText) progressText.textContent = `${percent}%`;
            checkGoalAchievement(); 
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
    // Update progress for current view
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const total = tasksToShow.length;
    const completed = tasksToShow.filter(t => t.done).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${percent}%`;
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
Screen nav
========================= */
function initScreenNav() {
    if (enterBtn) enterBtn.addEventListener("click", () => document.body.classList.add("show-tasks"));
    if (backBtn) backBtn.addEventListener("click", () => document.body.classList.remove("show-tasks"));
}

/* =========================
Exams utils
========================= */
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

function migratePastExams() {
    const todayStr = formatDate(new Date());
    const newUpcoming = upcomingExams.filter(exam => exam.date >= todayStr);
    const potentialPast = upcomingExams.filter(exam => exam.date < todayStr);
    potentialPast.forEach(pastExam => {
        const exists = pastExams.some(pe => pe.subject === pastExam.subject && pe.date === pastExam.date);
        if (!exists) {
            const pastCopy = { ...pastExam, grade: null };
            ensureId(pastCopy);
            pastExams.push(pastCopy);
            savePastExams();
        }
    });
    upcomingExams = newUpcoming.map(ensureId);
    saveUpcomingExams();
    renderExamList(examListSidebar, upcomingExams);
    const examListHome = document.getElementById('examList');
    if (examListHome) {
        renderExamList(examListHome, upcomingExams);
    }
}

function populateExamSelect() {
    if (!examSelect) return;
    examSelect.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "בחר מבחן לעריכה (לא חובה)";
    examSelect.appendChild(placeholder);
    upcomingExams.forEach((exam, index) => {
        const opt = document.createElement("option");
        opt.value = String(index);
        opt.textContent = `${exam.subject} - ${formatExamDateForDisplay(exam.date)}`;
        examSelect.appendChild(opt);
    });
}

function closeExamsModal() {
    if (!editExamsModal) return;
    editExamsModal.classList.remove('show');
    editExamsModal.style.display = '';
}

function initExamsModal() {
    if (examSelect) {
        examSelect.addEventListener("change", () => {
            const idx = examSelect.value === "" ? -1 : Number(examSelect.value);
            if (idx >= 0 && upcomingExams[idx]) {
                const exam = upcomingExams[idx];
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
    if (editExamsBtn) {
        editExamsBtn.addEventListener("click", (e) => {
            e.preventDefault();
            migratePastExams();
            populateExamSelect();
            if (examSelect) examSelect.value = "";
            if (subjectSelect) subjectSelect.selectedIndex = 0;
            if (examDateInput) examDateInput.value = "";
            if (editExamsModal) {
                editExamsModal.classList.add("show");
                editExamsModal.style.display = "flex";
            }
        });
    }
    if (saveExamsBtn) {
        saveExamsBtn.addEventListener("click", () => {
            const subject = subjectSelect ? subjectSelect.value : "";
            const date = examDateInput ? examDateInput.value : "";
            if (!subject || !date) {
                alert("אנא בחר מקצוע ותאריך.");
                return;
            }
            const selectedIndex = examSelect && examSelect.value !== "" ? Number(examSelect.value) : -1;
            if (selectedIndex >= 0 && upcomingExams[selectedIndex]) {
                upcomingExams[selectedIndex].subject = subject;
                upcomingExams[selectedIndex].date = date;
            } else {
                upcomingExams.push({ id: Date.now().toString(), subject, date });
            }
            saveUpcomingExams();
            migratePastExams();
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
            if (selectedIndex < 0 || !upcomingExams[selectedIndex]) {
                alert("אנא בחר מבחן למחיקה.");
                return;
            }
            if (!confirm("האם אתה בטוח שברצונך למחוק את המבחן?")) return;
            upcomingExams.splice(selectedIndex, 1);
            saveUpcomingExams();
            migratePastExams();
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
}

/* =========================
Past Exams
========================= */
function renderPastExams() {
    if (!pastExamsList) return;
    pastExamsList.innerHTML = "";
    pastExams.forEach((exam) => {
        const div = document.createElement("div");
        div.className = "past-exam";
        const infoSpan = document.createElement("span");
        infoSpan.textContent = `${exam.subject} - ${formatExamDateForDisplay(exam.date)}`;
        const gradeSpan = document.createElement("span");
        gradeSpan.className = `grade-display ${exam.grade !== null ? "has-grade" : "no-grade"}`;
        gradeSpan.textContent = exam.grade !== null ? `${exam.grade}%` : "הוסף ציון";
        gradeSpan.addEventListener("click", () => editGrade(exam));
        div.append(infoSpan, gradeSpan);
        pastExamsList.appendChild(div);
    });
    renderGradeStats();
}

function editGrade(exam) {
    let gradeStr = prompt(`ציון עבור ${exam.subject} (${formatExamDateForDisplay(exam.date)}):\n(0-100)`);
    gradeStr = gradeStr?.trim();
    if (!gradeStr) return;
    const grade = parseFloat(gradeStr);
    if (isNaN(grade) || grade < 0 || grade > 100) {
        alert("ציון חייב להיות בין 0 ל-100");
        return;
    }
    exam.grade = Math.round(grade);
    savePastExams();
    renderPastExams();
}

function renderGradeStats() {
    if (!gradeStats) return;
    const gradedExams = pastExams.filter(e => e.grade !== null);
    if (gradedExams.length === 0) {
        gradeStats.innerHTML = "<p>אין ציונים זמינים עדיין</p>";
        return;
    }
    const totalGraded = gradedExams.length;
    const sum = gradedExams.reduce((acc, e) => acc + e.grade, 0);
    const avg = (sum / totalGraded).toFixed(1);
    const maxGrade = Math.max(...gradedExams.map(e => e.grade));
    const minGrade = Math.min(...gradedExams.map(e => e.grade));
    const totalPast = pastExams.length;
    gradeStats.innerHTML = `
        <p class="avg">ממוצע: ${avg}%</p>
        <p>הגבוה ביותר: ${maxGrade}%</p>
        <p>הנמוך ביותר: ${minGrade}%</p>
        <p>מבחנים כולל: ${totalPast} (${totalGraded} עם ציון)</p>
    `;
}

function closePastModal() {
    if (!pastExamsModal) return;
    pastExamsModal.classList.remove("show");
    pastExamsModal.style.display = "";
}

function initPastExams() {
    if (pastExamsBtn) {
        pastExamsBtn.addEventListener("click", () => {
            migratePastExams();
            renderPastExams();
            if (pastExamsModal) {
                pastExamsModal.classList.add("show");
                pastExamsModal.style.display = "flex";
            }
        });
    }
    if (closePastExamsBtn) {
        closePastExamsBtn.addEventListener("click", closePastModal);
    }
    if (pastExamsModal) {
        pastExamsModal.addEventListener("click", (e) => {
            if (e.target === pastExamsModal) closePastModal();
        });
    }
}
const GOAL_KEY = "currentGoal";
const GOAL_ACHIEVED_KEY = "goalAchieved";

function loadGoal() {
  try {
    const saved = localStorage.getItem(GOAL_KEY);
    currentGoal = saved ? JSON.parse(saved) : null;
    return currentGoal;
  } catch {
    return null;
  }
}

function saveGoal() {
  localStorage.setItem(GOAL_KEY, JSON.stringify(currentGoal));
}

function saveGoalAchieved(state) {
  localStorage.setItem(GOAL_ACHIEVED_KEY, JSON.stringify(state));
  hasAchieved = state;
}

function renderGoalDisplay() {
  if (!currentGoal) {
    if (goalDisplay) goalDisplay.style.display = "none";
    if (goalForm) goalForm.style.display = "flex";
    return;
  }

  if (goalForm) goalForm.style.display = "none";
  if (goalDisplay) goalDisplay.style.display = "block";
  if (goalText) goalText.textContent = `🎯 ${currentGoal}`;
}

function clearGoal() {
  currentGoal = null;
  hasAchieved = false;
  saveGoal();
  saveGoalAchieved(false);
  renderGoalDisplay();
}

function createConfetti() {
  const confettiPiece = document.createElement("div");
  confettiPiece.className = "confetti";
  const colors = ["red", "blue", "green", "purple", "pink"];
  confettiPiece.classList.add(colors[Math.floor(Math.random() * colors.length)]);
  
  const leftPos = Math.random() * 100;
  confettiPiece.style.left = leftPos + "%";
  confettiPiece.style.top = "-10px";
  confettiPiece.style.animation = `confetti-fall ${2 + Math.random() * 1}s linear forwards`;
  
  if (celebrationContainer) {
    celebrationContainer.appendChild(confettiPiece);
    setTimeout(() => confettiPiece.remove(), 4000);
  }
}

function celebrateAchievement() {
  // Create multiple confetti pieces
  for (let i = 0; i < 50; i++) {
    setTimeout(() => createConfetti(), i * 30);
  }

  // Show celebration text
  const celebrationText = document.createElement("div");
  celebrationText.className = "celebration-text";
  celebrationText.innerHTML = "🎉";
  document.body.appendChild(celebrationText);
  setTimeout(() => celebrationText.remove(), 1500);

  // Show achievement badge
  const badge = document.createElement("div");
  badge.className = "celebration-badge";
  badge.innerHTML = `✨ יעד הושג! ✨<br><span style="font-size: 1.5rem; margin-top: 10px; display: block;">${currentGoal}</span>`;
  document.body.appendChild(badge);
  setTimeout(() => badge.remove(), 2500);

  // Play sound effect (optional - creates a simple beep)
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    // Audio context not available or blocked
  }
}

function checkGoalAchievement() {
  if (!currentGoal || hasAchieved) return;

  const progressFill = document.getElementById("progressFill");
  if (!progressFill) return;

  const percent = parseFloat(progressFill.style.width) || 0;

  if (percent >= 100) {
    hasAchieved = true;
    saveGoalAchieved(true);
    celebrateAchievement();
  }
}

function initGoalFeature() {
  currentGoal = loadGoal();
  
  try {
    const saved = localStorage.getItem(GOAL_ACHIEVED_KEY);
    hasAchieved = saved ? JSON.parse(saved) : false;
  } catch {
    hasAchieved = false;
  }

  renderGoalDisplay();

  if (goalForm) {
    goalForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!goalInput) return;
      
      const goal = goalInput.value.trim();
      if (!goal) {
        alert("אנא הזן יעד");
        return;
      }

      currentGoal = goal;
      hasAchieved = false;
      saveGoal();
      saveGoalAchieved(false);
      if (goalInput) goalInput.value = "";
      renderGoalDisplay();
    });
  }

  if (clearGoalBtn) {
    clearGoalBtn.addEventListener("click", clearGoal);
  }
}
/* =========================
Boot
========================= */
tasks = loadTasks();
upcomingExams = loadUpcomingExams();
pastExams = loadPastExams();

initTheme();
initTaskForm();
initScreenNav();
initGoalFeature();
renderTasks();
renderCalendar();
migratePastExams();
initExamsModal();
initPastExams();

// Auto-migrate hourly
setInterval(migratePastExams, 60 * 60 * 1000);