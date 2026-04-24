const PORTAL_SETTINGS_KEY = "rfrl-student-portal-settings-v2";
const DEMO_STORE_KEY = "rfrl-student-portal-demo-v1";
const DEMO_TEACHER_PIN = "RFRL-TEACHER";
const PAGE_ENTRY_MODE = new URLSearchParams(window.location.search).get("entry") || "";
const PAGE_HASH = window.location.hash || "";

const SAMPLE_STUDENTS = [
  {
    id: "ava-james",
    accessCode: "RFRL-701",
    name: "Ava James",
    cohort: "Spring 2026 Student Group",
    track: "Core Skills Focus",
    avatar: "🚀",
    welcomeTitle: "Welcome, Ava.",
    welcomeCopy:
      "You are not just taking a class. You are building the kind of judgment, character, and real-world readiness people remember.",
    bio: {
      proud:
        "I want to become the kind of person younger students can trust and copy for the right reasons.",
      goal:
        "My long-term goal is to graduate strong, work in health care, and be known for being dependable under pressure.",
      strengths:
        "I stay calm when other people panic, I care about doing the right thing, and I do well when expectations are clear.",
      support:
        "Direct feedback helps me most. I also do better when I can break a big assignment into smaller steps.",
    },
    assignments: [
      {
        id: "pocc-scenario",
        title: "POCC Scenario Response",
        objective:
          "Use the POCC sequence to make a stronger call under pressure and explain why it protects trust and long-term outcomes.",
        dueLabel: "Due this week",
        rubricFocus: "Decision quality, consequence awareness, accountability",
      },
      {
        id: "digital-reputation",
        title: "Digital Reputation Reflection",
        objective:
          "Analyze one online choice and show how it affects credibility, opportunity, and self-respect.",
        dueLabel: "Due Friday",
        rubricFocus: "Self-awareness, judgment, real-life transfer",
      },
      {
        id: "repair-move",
        title: "Repair Move Practice",
        objective:
          "Write and rehearse an accountable repair response after a mistake or conflict.",
        dueLabel: "Due next Monday",
        rubricFocus: "Ownership, communication, follow-through",
      },
    ],
  },
  {
    id: "jaden-ortega",
    accessCode: "RFRL-884",
    name: "Jaden Ortega",
    cohort: "Spring 2026 Student Group",
    track: "Leadership Focus",
    avatar: "🛡️",
    welcomeTitle: "Welcome, Jaden.",
    welcomeCopy:
      "This portal is your personal operations room. The more seriously you take the reflections, assignments, and coaching here, the more prepared you become for the moments where other people will count on you.",
    bio: {
      proud:
        "I want to be someone my team can count on when stress is high and emotions are loud.",
      goal:
        "I want to lead in athletics now and eventually in law enforcement or emergency response.",
      strengths:
        "I care about team trust, I recover quickly after pressure, and I like measurable progress.",
      support:
        "I do best with honest coaching, clear standards, and examples that connect to real life.",
    },
    assignments: [
      {
        id: "team-pressure",
        title: "Team Pressure Decision Lab",
        objective:
          "Respond to a peer-pressure scenario in a way that protects reputation, team trust, and long-term goals.",
        dueLabel: "Due this week",
        rubricFocus: "Integrity, courage, leadership under pressure",
      },
      {
        id: "authority-feedback",
        title: "Authority & Feedback Response",
        objective:
          "Show how to respond well when corrected by a teacher, coach, or supervisor.",
        dueLabel: "Due Friday",
        rubricFocus: "Coachability, professionalism, self-control",
      },
      {
        id: "family-duty",
        title: "Family Responsibility Planning",
        objective:
          "Map a decision that balances school, family responsibility, and future opportunity.",
        dueLabel: "Due next Monday",
        rubricFocus: "Trade-offs, planning, maturity",
      },
    ],
  },
  {
    id: "mia-thomas",
    accessCode: "RFRL-552",
    name: "Mia Thomas",
    cohort: "Spring 2026 Student Group",
    track: "Communication Focus",
    avatar: "✨",
    welcomeTitle: "You belong here, Mia.",
    welcomeCopy:
      "This is your place to grow your voice, sharpen your choices, and finish with something to be deeply proud of.",
    bio: {
      proud:
        "I want to become more confident speaking up with respect and staying steady when emotions get big.",
      goal:
        "I want to build enough confidence to lead small groups, present clearly, and help younger students feel seen.",
      strengths:
        "I care deeply about people, I notice things others miss, and I want feedback that helps me improve quickly.",
      support:
        "I do best with examples, calm coaching, and clear reminders of what success looks like.",
    },
    assignments: [
      {
        id: "respectful-voice",
        title: "Respectful Voice Roleplay",
        objective:
          "Practice responding with calm clarity during a tense interaction with a peer or adult.",
        dueLabel: "Due this week",
        rubricFocus: "Respect, tone, controlled response",
      },
      {
        id: "pause-label-reframe",
        title: "Pause-Label-Reframe Journal",
        objective:
          "Use the regulation model to process a real moment of frustration and write a wiser response.",
        dueLabel: "Due Friday",
        rubricFocus: "Self-regulation, reflection, honesty",
      },
      {
        id: "future-self-letter",
        title: "Future Self Letter",
        objective:
          "Write to your future self about the kind of reputation and character you are building now.",
        dueLabel: "Due next Monday",
        rubricFocus: "Identity, long-view thinking, pride",
      },
    ],
  },
];

const DEMO_WORKBOOK_PROMPTS = [
  {
    id: "weekly-reset",
    title: "Weekly Reset",
    prompt:
      "What real-life moment challenged you most this week, and what would your strongest self do next time?",
  },
  {
    id: "identity-build",
    title: "Identity Builder",
    prompt:
      "What kind of person are you becoming through this program, and what proof do you already have?",
  },
  {
    id: "coaching-bridge",
    title: "Coaching Bridge",
    prompt:
      "What teacher feedback are you going to act on immediately, and what will it look like in action?",
  },
];

const DEMO_RESOURCES = [
  {
    title: "Program Guide",
    description:
      "See the full structure, goals, and instructional framework behind the course.",
    href: "program.html",
    label: "Open Guide",
    meta: ["Program structure", "Student-facing context"],
  },
  {
    title: "Curriculum Library",
    description:
      "Browse the larger curriculum library, theory, pacing ideas, and support materials.",
    href: "curriculum-library.html",
    label: "Open Library",
    meta: ["Assignments", "Pacing", "Support materials"],
  },
  {
    title: "Challenge Game",
    description:
      "Practice quick judgment calls in the live challenge environment.",
    href: "game.html",
    label: "Play Game",
    meta: ["Practice", "Applied scenarios"],
  },
  {
    title: "One-Pager",
    description:
      "Keep the core MMMF one-pager close for quick review and orientation.",
    href: "one-pager.html",
    label: "Open One-Pager",
    meta: ["Overview", "Quick reference"],
  },
  {
    title: "Program Details",
    description:
      "Review the deeper explanation of how the program is designed and delivered.",
    href: "details.html",
    label: "View Details",
    meta: ["Manual", "Program rationale"],
  },
  {
    title: "Founders & Mission",
    description:
      "Read the program story and the people behind it so students know what they joined.",
    href: "bio.html",
    label: "Meet the Founders",
    meta: ["Mission", "Origin story"],
  },
];

const loginForm = document.getElementById("studentLoginForm");
const studentIdInput = document.getElementById("studentIdInput");
const studentCodeInput = document.getElementById("studentCodeInput");
const restoreLastStudentBtn = document.getElementById("restoreLastStudentBtn");
const studentLoginStatus = document.getElementById("studentLoginStatus");
const sampleAccounts = document.getElementById("sampleAccounts");
const portalApiUrlInput = document.getElementById("portalApiUrlInput");
const portalBootstrapSecretInput = document.getElementById("portalBootstrapSecretInput");
const savePortalApiBtn = document.getElementById("savePortalApiBtn");
const bootstrapPortalBtn = document.getElementById("bootstrapPortalBtn");
const portalSetupStatus = document.getElementById("portalSetupStatus");
const teacherPinInput = document.getElementById("teacherPinInput");
const teacherUnlockBtn = document.getElementById("teacherUnlockBtn");
const teacherStatus = document.getElementById("teacherStatus");
const studentPortal = document.getElementById("studentPortal");
const teacherWorkspace = document.getElementById("teacherWorkspace");
const welcomeCohort = document.getElementById("welcomeCohort");
const welcomeTitle = document.getElementById("welcomeTitle");
const welcomeCopy = document.getElementById("welcomeCopy");
const welcomeMeta = document.getElementById("welcomeMeta");
const identityCardName = document.getElementById("identityCardName");
const identityCardTrack = document.getElementById("identityCardTrack");
const progressSummary = document.getElementById("progressSummary");
const progressFill = document.getElementById("progressFill");
const teacherWorkspaceToggle = document.getElementById("teacherWorkspaceToggle");
const studentLogoutBtn = document.getElementById("studentLogoutBtn");
const bioForm = document.getElementById("bioForm");
const bioProudInput = document.getElementById("bioProudInput");
const bioGoalInput = document.getElementById("bioGoalInput");
const bioStrengthsInput = document.getElementById("bioStrengthsInput");
const bioSupportInput = document.getElementById("bioSupportInput");
const bioStatus = document.getElementById("bioStatus");
const bioPreview = document.getElementById("bioPreview");
const assignmentList = document.getElementById("assignmentList");
const workbookList = document.getElementById("workbookList");
const resourceList = document.getElementById("resourceList");
const feedbackList = document.getElementById("feedbackList");
const teacherLockBtn = document.getElementById("teacherLockBtn");
const teacherStudentSelect = document.getElementById("teacherStudentSelect");
const teacherBioPreview = document.getElementById("teacherBioPreview");
const teacherQuickStats = document.getElementById("teacherQuickStats");
const teacherAssignmentReviews = document.getElementById("teacherAssignmentReviews");

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function showStatus(el, message, type = "") {
  el.textContent = message;
  el.className = "status-line";
  if (type) el.classList.add(type);
}

function clearStatus(el) {
  el.textContent = "";
  el.className = "status-line";
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildDefaultSettings() {
  return {
    apiBaseUrl: "",
    bootstrapSecret: "",
    studentToken: "",
    teacherToken: "",
    lastStudentId: "",
    teacherSelectedStudentId: "",
  };
}

function loadSettings() {
  const base = buildDefaultSettings();
  const raw = localStorage.getItem(PORTAL_SETTINGS_KEY);
  if (!raw) return base;
  try {
    return { ...base, ...JSON.parse(raw) };
  } catch {
    return base;
  }
}

function buildDemoStore() {
  return {
    students: SAMPLE_STUDENTS.map((student, index) => ({
      ...deepClone(student),
      assignments: student.assignments.map((assignment, assignmentIndex) => ({
        ...assignment,
        sortOrder: (assignmentIndex + 1) * 10,
        submission: "",
        readyForReview: false,
        review: {
          status: "Not reviewed",
          score: "",
          celebration: "",
          coaching: "",
          reviewedAt: "",
        },
      })),
      workbookPrompts: DEMO_WORKBOOK_PROMPTS.map((prompt, promptIndex) => ({
        ...prompt,
        sortOrder: (promptIndex + 1) * 10,
        response: "",
      })),
      sortOrder: index,
    })),
  };
}

function loadDemoStore() {
  const raw = localStorage.getItem(DEMO_STORE_KEY);
  if (!raw) return buildDemoStore();
  try {
    const parsed = JSON.parse(raw);
    return parsed?.students?.length ? parsed : buildDemoStore();
  } catch {
    return buildDemoStore();
  }
}

let settings = loadSettings();
let demoStore = loadDemoStore();
let state = {
  studentPortal: null,
  teacherStudents: [],
  teacherStudentDetail: null,
};

function saveSettings() {
  localStorage.setItem(PORTAL_SETTINGS_KEY, JSON.stringify(settings));
}

function saveDemoStore() {
  localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(demoStore));
}

function normalizeBaseUrl(url) {
  return String(url || "").trim().replace(/\/+$/, "");
}

function getApiBaseUrl() {
  return normalizeBaseUrl(
    settings.apiBaseUrl ||
      window.__RFRL_PORTAL_API_BASE__ ||
      document.documentElement.dataset.portalApiBase ||
      "",
  );
}

function buildApiUrl(path) {
  const base = getApiBaseUrl();
  if (!base) throw new Error("Portal API base URL is not set yet.");
  return `${base}${path}`;
}

function hasLiveApi() {
  return Boolean(getApiBaseUrl());
}

function isDemoStudentToken() {
  return String(settings.studentToken || "").startsWith("demo:");
}

function isDemoTeacherToken() {
  return settings.teacherToken === "demo-teacher";
}

async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  const response = await fetch(buildApiUrl(path), {
    method: options.method || "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      payload?.error ||
        payload?.details ||
        `Request failed with status ${response.status}.`,
    );
  }

  return payload;
}

function studentAuthHeaders() {
  return settings.studentToken
    ? { Authorization: `Bearer ${settings.studentToken}` }
    : {};
}

function teacherAuthHeaders() {
  return settings.teacherToken
    ? { Authorization: `Bearer ${settings.teacherToken}` }
    : {};
}

function findDemoStudent(studentId) {
  return demoStore.students.find((student) => student.id === studentId) || null;
}

function computeProgress(assignments, workbookPrompts) {
  const completedAssignments = assignments.filter((assignment) =>
    ["Approved", "Exceeds expectations"].includes(assignment.review.status),
  ).length;
  const completedWorkbook = workbookPrompts.filter((prompt) =>
    String(prompt.response || "").trim(),
  ).length;
  const total = assignments.length + workbookPrompts.length || 1;
  const completed = completedAssignments + completedWorkbook;
  return {
    completed,
    total,
    percent: Math.round((completed / total) * 100),
  };
}

function buildFeedback(assignments) {
  return assignments
    .filter((assignment) => assignment.review.status !== "Not reviewed")
    .map((assignment) => ({
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      review: assignment.review,
    }));
}

function buildDemoPortal(studentId) {
  const student = findDemoStudent(studentId);
  if (!student) return null;
  const assignments = deepClone(student.assignments);
  const workbookPrompts = deepClone(student.workbookPrompts);
  const progress = computeProgress(assignments, workbookPrompts);

  return {
    student: {
      id: student.id,
      name: student.name,
      cohort: student.cohort,
      track: student.track,
      avatar: student.avatar,
      welcomeTitle: student.welcomeTitle,
      welcomeCopy: student.welcomeCopy,
      bio: deepClone(student.bio),
    },
    assignments,
    workbookPrompts,
    resources: deepClone(DEMO_RESOURCES),
    feedback: buildFeedback(assignments),
    progress,
  };
}

function buildDemoTeacherStudents() {
  return demoStore.students
    .map((student) => {
      const portal = buildDemoPortal(student.id);
      return {
        id: student.id,
        name: student.name,
        cohort: student.cohort,
        track: student.track,
        avatar: student.avatar,
        progress: portal.progress,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function updateDemoStudent(studentId, updater) {
  const student = findDemoStudent(studentId);
  if (!student) return null;
  updater(student);
  saveDemoStore();
  return buildDemoPortal(studentId);
}

function renderSampleAccounts() {
  sampleAccounts.innerHTML = SAMPLE_STUDENTS.map(
    (student) => `
      <button class="sample-card" type="button" data-student-fill="${escapeHtml(student.id)}">
        <strong>${escapeHtml(student.avatar)} ${escapeHtml(student.name)}</strong>
        <p>${escapeHtml(student.cohort)} · ${escapeHtml(student.track)}</p>
        <div class="sample-pill">ID ${escapeHtml(student.id)}</div>
        <div class="sample-pill">Code ${escapeHtml(student.accessCode)}</div>
      </button>
    `,
  ).join("");

  sampleAccounts.querySelectorAll("[data-student-fill]").forEach((card) => {
    card.addEventListener("click", () => {
      const studentId = card.getAttribute("data-student-fill");
      const student = SAMPLE_STUDENTS.find((item) => item.id === studentId);
      if (!student) return;
      studentIdInput.value = student.id;
      studentCodeInput.value = student.accessCode;
      clearStatus(studentLoginStatus);
    });
  });
}

function syncSettingsInputs() {
  portalApiUrlInput.value = settings.apiBaseUrl || "";
  portalBootstrapSecretInput.value = settings.bootstrapSecret || "";
}

function resetPortalScrollForEntry() {
  if (!PAGE_ENTRY_MODE && PAGE_HASH !== "#teacher-access") return;

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  if (PAGE_HASH === "#teacher-access") {
    window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}`);
  }

  const scrollTop = () => window.scrollTo(0, 0);
  scrollTop();
  requestAnimationFrame(scrollTop);
  window.addEventListener("load", scrollTop, { once: true });
  window.addEventListener("pageshow", scrollTop, { once: true });
  setTimeout(scrollTop, 120);
}

function badgeClass(status) {
  switch (status) {
    case "Approved":
    case "Exceeds expectations":
      return "complete";
    case "Ready for review":
    case "In review":
      return "review";
    case "Needs revision":
      return "revise";
    default:
      return "pending";
  }
}

function renderPortal() {
  const portal = state.studentPortal;
  if (!portal?.student) {
    studentPortal.classList.remove("visible");
    return;
  }

  studentPortal.classList.add("visible");
  const { student, progress, assignments, workbookPrompts, feedback, resources } = portal;

  welcomeCohort.textContent = student.cohort;
  welcomeTitle.textContent = student.welcomeTitle;
  welcomeCopy.textContent = student.welcomeCopy;
  welcomeMeta.innerHTML = `
    <span class="chip">${escapeHtml(student.avatar)} ${escapeHtml(student.name)}</span>
    <span class="chip">${escapeHtml(student.track)}</span>
    <span class="chip">${progress.completed}/${progress.total} milestones complete</span>
  `;
  identityCardName.textContent = `${student.avatar} ${student.name}`;
  identityCardTrack.textContent = `${student.track} · Student ID ${student.id}`;
  progressSummary.textContent = `${progress.completed} of ${progress.total} milestones complete`;
  progressFill.style.width = `${progress.percent}%`;

  bioProudInput.value = student.bio.proud || "";
  bioGoalInput.value = student.bio.goal || "";
  bioStrengthsInput.value = student.bio.strengths || "";
  bioSupportInput.value = student.bio.support || "";
  bioPreview.innerHTML = `
    <div><strong>What they are building:</strong><br>${escapeHtml(student.bio.proud)}</div>
    <div style="margin-top:12px"><strong>Future goal:</strong><br>${escapeHtml(student.bio.goal)}</div>
    <div style="margin-top:12px"><strong>Strengths:</strong><br>${escapeHtml(student.bio.strengths)}</div>
    <div style="margin-top:12px"><strong>Support that helps:</strong><br>${escapeHtml(student.bio.support)}</div>
  `;

  assignmentList.innerHTML = assignments
    .map((assignment) => {
      const statusText = assignment.readyForReview
        ? assignment.review.status === "Not reviewed"
          ? "Ready for review"
          : assignment.review.status
        : "In progress";
      return `
        <article class="assignment-card">
          <div class="assignment-head">
            <div>
              <div class="mini-label">${escapeHtml(assignment.dueLabel)}</div>
              <h4>${escapeHtml(assignment.title)}</h4>
            </div>
            <span class="status-badge ${badgeClass(statusText)}">${escapeHtml(statusText)}</span>
          </div>
          <p>${escapeHtml(assignment.objective)}</p>
          <div class="assignment-meta">
            <span class="chip">${escapeHtml(assignment.rubricFocus)}</span>
          </div>
          <label style="margin-top:14px">
            Student response / reflection
            <textarea id="submission-${assignment.id}" placeholder="Write your response, plan, or workbook reflection here.">${escapeHtml(assignment.submission)}</textarea>
          </label>
          <div class="assignment-actions">
            <button class="btn primary" type="button" data-save-assignment="${assignment.id}">Save Work</button>
            <button class="btn secondary" type="button" data-ready-assignment="${assignment.id}">Mark Ready for Review</button>
          </div>
          ${
            assignment.review.status !== "Not reviewed"
              ? `<div class="feedback-box">
                  <strong>Teacher result:</strong> ${escapeHtml(assignment.review.status)}${
                    assignment.review.score ? ` · Score ${escapeHtml(assignment.review.score)}` : ""
                  }
                  <div style="margin-top:10px"><strong>Celebration:</strong><br>${escapeHtml(assignment.review.celebration || "Not added yet.")}</div>
                  <div style="margin-top:10px"><strong>Coaching:</strong><br>${escapeHtml(assignment.review.coaching || "Not added yet.")}</div>
                </div>`
              : ""
          }
        </article>
      `;
    })
    .join("");

  workbookList.innerHTML = workbookPrompts
    .map(
      (prompt) => `
        <article class="workbook-card">
          <div class="mini-label">Workbook prompt</div>
          <h4>${escapeHtml(prompt.title)}</h4>
          <p>${escapeHtml(prompt.prompt)}</p>
          <label style="margin-top:14px">
            Your reflection
            <textarea id="workbook-${prompt.id}" placeholder="Write your workbook response here.">${escapeHtml(prompt.response || "")}</textarea>
          </label>
          <div class="assignment-actions">
            <button class="btn primary" type="button" data-save-workbook="${prompt.id}">Save Reflection</button>
          </div>
        </article>
      `,
    )
    .join("");

  resourceList.innerHTML = resources
    .map(
      (resource) => `
        <article class="resource-card">
          <div class="mini-label">Success resource</div>
          <h4>${escapeHtml(resource.title)}</h4>
          <p>${escapeHtml(resource.description)}</p>
          <div class="resource-meta">
            ${resource.meta.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("")}
          </div>
          <a class="resource-link" href="${escapeHtml(resource.href)}">${escapeHtml(resource.label)}</a>
        </article>
      `,
    )
    .join("");

  feedbackList.innerHTML = !feedback.length
    ? `<div class="empty">
         No teacher feedback has been added yet. Once your teacher reviews your work,
         celebration, scores, and coaching notes will show up here.
       </div>`
    : feedback
        .map(
          (item) => `
            <article class="assignment-card">
              <div class="assignment-head">
                <div>
                  <div class="mini-label">Reviewed assignment</div>
                  <h4>${escapeHtml(item.assignmentTitle)}</h4>
                </div>
                <span class="status-badge ${badgeClass(item.review.status)}">${escapeHtml(item.review.status)}</span>
              </div>
              <p><strong>Score:</strong> ${escapeHtml(item.review.score || "Pending")}</p>
              <div class="feedback-box">
                <strong>Celebration</strong>
                <div style="margin-top:8px">${escapeHtml(item.review.celebration || "No celebration note yet.")}</div>
              </div>
              <div class="feedback-box">
                <strong>Coaching</strong>
                <div style="margin-top:8px">${escapeHtml(item.review.coaching || "No coaching note yet.")}</div>
              </div>
            </article>
          `,
        )
        .join("");

  bindStudentActions();
}

function saveDemoAssignment(assignmentId, submission, readyForReview) {
  state.studentPortal = updateDemoStudent(state.studentPortal.student.id, (student) => {
    const assignment = student.assignments.find((item) => item.id === assignmentId);
    if (!assignment) return;
    assignment.submission = submission;
    assignment.readyForReview = readyForReview;
    if (readyForReview && assignment.review.status === "Not reviewed") {
      assignment.review.status = "In review";
    }
  });
  renderPortal();
}

function saveDemoWorkbook(promptId, response) {
  state.studentPortal = updateDemoStudent(state.studentPortal.student.id, (student) => {
    const prompt = student.workbookPrompts.find((item) => item.id === promptId);
    if (!prompt) return;
    prompt.response = response;
  });
  renderPortal();
}

function bindStudentActions() {
  assignmentList.querySelectorAll("[data-save-assignment]").forEach((button) => {
    button.addEventListener("click", async () => {
      const assignmentId = button.getAttribute("data-save-assignment");
      const textarea = document.getElementById(`submission-${assignmentId}`);
      if (isDemoStudentToken()) {
        saveDemoAssignment(assignmentId, textarea.value.trim(), false);
        if (isDemoTeacherToken()) await loadTeacherStudentIfOpen();
        return;
      }
      try {
        state.studentPortal = await apiRequest(`/portal/student/assignments/${encodeURIComponent(assignmentId)}`, {
          method: "PUT",
          headers: studentAuthHeaders(),
          body: { submission: textarea.value.trim(), readyForReview: false },
        });
        renderPortal();
      } catch (error) {
        showStatus(studentLoginStatus, error.message);
      }
    });
  });

  assignmentList.querySelectorAll("[data-ready-assignment]").forEach((button) => {
    button.addEventListener("click", async () => {
      const assignmentId = button.getAttribute("data-ready-assignment");
      const textarea = document.getElementById(`submission-${assignmentId}`);
      if (isDemoStudentToken()) {
        saveDemoAssignment(assignmentId, textarea.value.trim(), true);
        if (isDemoTeacherToken()) await loadTeacherStudentIfOpen();
        return;
      }
      try {
        state.studentPortal = await apiRequest(`/portal/student/assignments/${encodeURIComponent(assignmentId)}`, {
          method: "PUT",
          headers: studentAuthHeaders(),
          body: { submission: textarea.value.trim(), readyForReview: true },
        });
        renderPortal();
      } catch (error) {
        showStatus(studentLoginStatus, error.message);
      }
    });
  });

  workbookList.querySelectorAll("[data-save-workbook]").forEach((button) => {
    button.addEventListener("click", async () => {
      const promptId = button.getAttribute("data-save-workbook");
      const textarea = document.getElementById(`workbook-${promptId}`);
      if (isDemoStudentToken()) {
        saveDemoWorkbook(promptId, textarea.value.trim());
        if (isDemoTeacherToken()) await loadTeacherStudentIfOpen();
        return;
      }
      try {
        state.studentPortal = await apiRequest(`/portal/student/workbook/${encodeURIComponent(promptId)}`, {
          method: "PUT",
          headers: studentAuthHeaders(),
          body: { response: textarea.value.trim() },
        });
        renderPortal();
      } catch (error) {
        showStatus(studentLoginStatus, error.message);
      }
    });
  });
}

async function loadStudentPortal() {
  if (!settings.studentToken) {
    studentPortal.classList.remove("visible");
    return;
  }

  if (isDemoStudentToken()) {
    const studentId = settings.studentToken.replace(/^demo:/, "");
    state.studentPortal = buildDemoPortal(studentId);
    if (!state.studentPortal) {
      settings.studentToken = "";
      saveSettings();
      studentPortal.classList.remove("visible");
      return;
    }
    settings.lastStudentId = studentId;
    saveSettings();
    renderPortal();
    return;
  }

  try {
    state.studentPortal = await apiRequest("/portal/student/me", {
      headers: studentAuthHeaders(),
    });
    settings.lastStudentId = state.studentPortal.student.id;
    saveSettings();
    renderPortal();
  } catch (error) {
    settings.studentToken = "";
    saveSettings();
    state.studentPortal = null;
    studentPortal.classList.remove("visible");
    showStatus(studentLoginStatus, error.message);
  }
}

async function loginStudent(studentId, accessCode) {
  const normalizedId = String(studentId || "").trim().toLowerCase();
  const normalizedCode = String(accessCode || "").trim();

  if (!hasLiveApi()) {
    const student = demoStore.students.find(
      (item) => item.id === normalizedId && item.accessCode === normalizedCode,
    );
    if (!student) {
      showStatus(studentLoginStatus, "Student ID or access code did not match.");
      return;
    }
    settings.studentToken = `demo:${student.id}`;
    settings.lastStudentId = student.id;
    saveSettings();
    state.studentPortal = buildDemoPortal(student.id);
    showStatus(studentLoginStatus, `${student.name} is signed in in demo mode.`, "success");
    renderPortal();
    window.scrollTo({
      top: document.getElementById("studentPortal").offsetTop - 14,
      behavior: "smooth",
    });
    return;
  }

  try {
    const payload = await apiRequest("/portal/auth/login", {
      method: "POST",
      body: { studentId: normalizedId, accessCode: normalizedCode },
    });
    settings.studentToken = payload.token;
    settings.lastStudentId = payload.portal.student.id;
    saveSettings();
    state.studentPortal = payload.portal;
    showStatus(studentLoginStatus, `${payload.portal.student.name} is signed in.`, "success");
    renderPortal();
    window.scrollTo({
      top: document.getElementById("studentPortal").offsetTop - 14,
      behavior: "smooth",
    });
  } catch (error) {
    showStatus(studentLoginStatus, error.message);
  }
}

async function saveBio() {
  if (isDemoStudentToken()) {
    state.studentPortal = updateDemoStudent(state.studentPortal.student.id, (student) => {
      student.bio.proud = bioProudInput.value.trim();
      student.bio.goal = bioGoalInput.value.trim();
      student.bio.strengths = bioStrengthsInput.value.trim();
      student.bio.support = bioSupportInput.value.trim();
    });
    showStatus(bioStatus, "Your bio was saved in demo mode.", "success");
    renderPortal();
    await loadTeacherStudentIfOpen();
    return;
  }

  try {
    state.studentPortal = await apiRequest("/portal/student/bio", {
      method: "PUT",
      headers: studentAuthHeaders(),
      body: {
        proud: bioProudInput.value.trim(),
        goal: bioGoalInput.value.trim(),
        strengths: bioStrengthsInput.value.trim(),
        support: bioSupportInput.value.trim(),
      },
    });
    showStatus(bioStatus, "Your bio was saved for you and your teacher.", "success");
    renderPortal();
    await loadTeacherStudentIfOpen();
  } catch (error) {
    showStatus(bioStatus, error.message);
  }
}

function updateTeacherVisibility() {
  teacherWorkspace.classList.toggle("visible", Boolean(settings.teacherToken));
  teacherWorkspaceToggle.style.display = settings.teacherToken ? "inline-flex" : "none";
}

async function teacherLogin(pin) {
  const normalizedPin = String(pin || "").trim();

  if (!hasLiveApi()) {
    if (normalizedPin !== DEMO_TEACHER_PIN) {
      showStatus(teacherStatus, `Use demo teacher PIN ${DEMO_TEACHER_PIN}.`);
      return;
    }
    settings.teacherToken = "demo-teacher";
    saveSettings();
    showStatus(teacherStatus, "Teacher review unlocked in demo mode.", "success");
    updateTeacherVisibility();
    await loadTeacherStudents();
    window.scrollTo({ top: teacherWorkspace.offsetTop - 14, behavior: "smooth" });
    return;
  }

  try {
    const payload = await apiRequest("/portal/teacher/login", {
      method: "POST",
      body: { pin: normalizedPin },
    });
    settings.teacherToken = payload.token;
    saveSettings();
    showStatus(teacherStatus, "Teacher review unlocked.", "success");
    updateTeacherVisibility();
    await loadTeacherStudents();
    window.scrollTo({ top: teacherWorkspace.offsetTop - 14, behavior: "smooth" });
  } catch (error) {
    showStatus(teacherStatus, error.message);
  }
}

async function loadTeacherStudents() {
  if (!settings.teacherToken) return;

  if (isDemoTeacherToken()) {
    state.teacherStudents = buildDemoTeacherStudents();
    if (!settings.teacherSelectedStudentId && state.teacherStudents[0]) {
      settings.teacherSelectedStudentId = state.teacherStudents[0].id;
      saveSettings();
    }
    renderTeacherWorkspace();
    await loadTeacherStudentIfOpen();
    return;
  }

  try {
    const payload = await apiRequest("/portal/teacher/students", {
      headers: teacherAuthHeaders(),
    });
    state.teacherStudents = payload.students || [];
    if (!settings.teacherSelectedStudentId && state.teacherStudents[0]) {
      settings.teacherSelectedStudentId = state.teacherStudents[0].id;
      saveSettings();
    }
    renderTeacherWorkspace();
    await loadTeacherStudentIfOpen();
  } catch (error) {
    settings.teacherToken = "";
    saveSettings();
    state.teacherStudents = [];
    state.teacherStudentDetail = null;
    updateTeacherVisibility();
    showStatus(teacherStatus, error.message);
  }
}

async function loadTeacherStudentIfOpen() {
  if (!settings.teacherToken || !settings.teacherSelectedStudentId) return;

  if (isDemoTeacherToken()) {
    state.teacherStudentDetail = buildDemoPortal(settings.teacherSelectedStudentId);
    renderTeacherWorkspace();
    return;
  }

  try {
    state.teacherStudentDetail = await apiRequest(
      `/portal/teacher/students/${encodeURIComponent(settings.teacherSelectedStudentId)}`,
      { headers: teacherAuthHeaders() },
    );
    renderTeacherWorkspace();
  } catch (error) {
    showStatus(teacherStatus, error.message);
  }
}

function renderTeacherWorkspace() {
  teacherStudentSelect.innerHTML = state.teacherStudents
    .map(
      (student) => `
        <option value="${escapeHtml(student.id)}"${
          student.id === settings.teacherSelectedStudentId ? " selected" : ""
        }>${escapeHtml(student.name)} · ${escapeHtml(student.track)}</option>
      `,
    )
    .join("");

  const detail = state.teacherStudentDetail;
  if (!detail?.student) {
    teacherBioPreview.innerHTML = "Open teacher review to load a student profile.";
    teacherQuickStats.innerHTML = "";
    teacherAssignmentReviews.innerHTML = "";
    return;
  }

  teacherBioPreview.innerHTML = `
    <strong>${escapeHtml(detail.student.name)}</strong><br>
    ${escapeHtml(detail.student.bio.proud)}<br><br>
    <strong>Future goal:</strong> ${escapeHtml(detail.student.bio.goal)}<br>
    <strong>Strengths:</strong> ${escapeHtml(detail.student.bio.strengths)}<br>
    <strong>Support:</strong> ${escapeHtml(detail.student.bio.support)}
  `;

  teacherQuickStats.innerHTML = `
    ${escapeHtml(detail.student.cohort)}<br>
    ${escapeHtml(detail.student.track)}<br>
    ${detail.progress.completed}/${detail.progress.total} milestones complete
  `;

  teacherAssignmentReviews.innerHTML = detail.assignments
    .map(
      (assignment) => `
        <article class="teacher-review-card">
          <div class="teacher-head">
            <div>
              <div class="mini-label">${escapeHtml(assignment.dueLabel)}</div>
              <h4>${escapeHtml(assignment.title)}</h4>
            </div>
            <span class="status-badge ${badgeClass(assignment.review.status)}">${escapeHtml(assignment.review.status)}</span>
          </div>
          <p>${escapeHtml(assignment.objective)}</p>
          <div class="feedback-box" style="margin-top:14px">
            <strong>Student submission</strong>
            <div style="margin-top:8px">${escapeHtml(assignment.submission || "No submission added yet.")}</div>
          </div>
          <div class="teacher-actions">
            <label style="flex:1 1 120px">
              Score
              <input id="review-score-${assignment.id}" type="text" value="${escapeHtml(assignment.review.score)}" placeholder="3.8 / 4" />
            </label>
            <label style="flex:1 1 220px">
              Review status
              <select id="review-status-${assignment.id}">
                ${["Not reviewed", "In review", "Needs revision", "Approved", "Exceeds expectations"]
                  .map(
                    (status) =>
                      `<option value="${escapeHtml(status)}"${
                        status === assignment.review.status ? " selected" : ""
                      }>${escapeHtml(status)}</option>`,
                  )
                  .join("")}
              </select>
            </label>
          </div>
          <label style="margin-top:14px">
            Celebration note
            <textarea id="review-celebration-${assignment.id}" placeholder="What did the student do especially well?">${escapeHtml(assignment.review.celebration)}</textarea>
          </label>
          <label>
            Coaching note / next step
            <textarea id="review-coaching-${assignment.id}" placeholder="What should the student work on next?">${escapeHtml(assignment.review.coaching)}</textarea>
          </label>
          <div class="teacher-actions">
            <button class="btn secondary" type="button" data-save-review="${assignment.id}">Save Review</button>
          </div>
        </article>
      `,
    )
    .join("");

  teacherAssignmentReviews.querySelectorAll("[data-save-review]").forEach((button) => {
    button.addEventListener("click", async () => {
      const assignmentId = button.getAttribute("data-save-review");

      if (isDemoTeacherToken()) {
        state.teacherStudentDetail = updateDemoStudent(settings.teacherSelectedStudentId, (student) => {
          const assignment = student.assignments.find((item) => item.id === assignmentId);
          if (!assignment) return;
          assignment.review.score = document.getElementById(`review-score-${assignmentId}`).value.trim();
          assignment.review.status = document.getElementById(`review-status-${assignmentId}`).value;
          assignment.review.celebration = document.getElementById(`review-celebration-${assignmentId}`).value.trim();
          assignment.review.coaching = document.getElementById(`review-coaching-${assignmentId}`).value.trim();
          assignment.review.reviewedAt = new Date().toISOString();
          assignment.readyForReview = true;
        });
        renderTeacherWorkspace();
        if (state.studentPortal?.student?.id === settings.teacherSelectedStudentId) {
          await loadStudentPortal();
        }
        return;
      }

      try {
        state.teacherStudentDetail = await apiRequest(
          `/portal/teacher/students/${encodeURIComponent(
            settings.teacherSelectedStudentId,
          )}/assignments/${encodeURIComponent(assignmentId)}/review`,
          {
            method: "PUT",
            headers: teacherAuthHeaders(),
            body: {
              score: document.getElementById(`review-score-${assignmentId}`).value.trim(),
              status: document.getElementById(`review-status-${assignmentId}`).value,
              celebration: document.getElementById(`review-celebration-${assignmentId}`).value.trim(),
              coaching: document.getElementById(`review-coaching-${assignmentId}`).value.trim(),
            },
          },
        );
        renderTeacherWorkspace();
        if (state.studentPortal?.student?.id === settings.teacherSelectedStudentId) {
          await loadStudentPortal();
        }
      } catch (error) {
        showStatus(teacherStatus, error.message);
      }
    });
  });
}

async function logoutStudent() {
  if (!isDemoStudentToken() && settings.studentToken) {
    try {
      await apiRequest("/portal/auth/logout", {
        method: "POST",
        headers: studentAuthHeaders(),
      });
    } catch {
      // best effort only
    }
  }

  settings.studentToken = "";
  saveSettings();
  state.studentPortal = null;
  studentPortal.classList.remove("visible");
  showStatus(studentLoginStatus, "Student portal signed out.", "success");
}

async function bootstrapStarterCohort() {
  if (!hasLiveApi()) {
    demoStore = buildDemoStore();
    saveDemoStore();
    showStatus(portalSetupStatus, "Demo starter cohort reset on this device.", "success");
    return;
  }

  if (!portalBootstrapSecretInput.value.trim()) {
    showStatus(portalSetupStatus, "Enter the bootstrap secret first.");
    return;
  }

  try {
    const payload = await apiRequest("/portal/admin/bootstrap", {
      method: "POST",
      body: { secret: portalBootstrapSecretInput.value.trim() },
    });
    settings.bootstrapSecret = portalBootstrapSecretInput.value.trim();
    saveSettings();
    showStatus(
      portalSetupStatus,
      `Seeded ${payload.studentsSeeded} students and ${payload.workbookPromptsSeeded} workbook prompts.`,
      "success",
    );
  } catch (error) {
    showStatus(portalSetupStatus, error.message);
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await loginStudent(studentIdInput.value, studentCodeInput.value);
});

restoreLastStudentBtn.addEventListener("click", async () => {
  if (!settings.studentToken) {
    showStatus(studentLoginStatus, "No saved student session was found on this device.");
    return;
  }
  await loadStudentPortal();
});

savePortalApiBtn.addEventListener("click", () => {
  settings.apiBaseUrl = normalizeBaseUrl(portalApiUrlInput.value);
  settings.bootstrapSecret = portalBootstrapSecretInput.value.trim();
  saveSettings();
  showStatus(portalSetupStatus, "Backend settings saved on this device.", "success");
});

bootstrapPortalBtn.addEventListener("click", bootstrapStarterCohort);

teacherUnlockBtn.addEventListener("click", async () => {
  await teacherLogin(teacherPinInput.value);
});

teacherWorkspaceToggle.addEventListener("click", () => {
  if (!settings.teacherToken) return;
  window.scrollTo({ top: teacherWorkspace.offsetTop - 14, behavior: "smooth" });
});

teacherLockBtn.addEventListener("click", () => {
  settings.teacherToken = "";
  saveSettings();
  state.teacherStudents = [];
  state.teacherStudentDetail = null;
  updateTeacherVisibility();
  clearStatus(teacherStatus);
});

studentLogoutBtn.addEventListener("click", logoutStudent);

bioForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await saveBio();
});

teacherStudentSelect.addEventListener("change", async () => {
  settings.teacherSelectedStudentId = teacherStudentSelect.value;
  saveSettings();
  await loadTeacherStudentIfOpen();
});

renderSampleAccounts();
syncSettingsInputs();
updateTeacherVisibility();
resetPortalScrollForEntry();

if (settings.studentToken) {
  loadStudentPortal();
}

if (settings.teacherToken) {
  loadTeacherStudents();
}
