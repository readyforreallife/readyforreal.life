const PORTAL_SETTINGS_KEY = "rfrl-student-portal-settings-v2";
const SAMPLE_STUDENTS = [
  {
    id: "ava-james",
    accessCode: "RFRL-701",
    name: "Ava James",
    cohort: "Spring 2026 Vanguard Cohort",
    track: "Foundations Track",
    avatar: "🚀",
  },
  {
    id: "jaden-ortega",
    accessCode: "RFRL-884",
    name: "Jaden Ortega",
    cohort: "Spring 2026 Vanguard Cohort",
    track: "Leadership Track",
    avatar: "🛡️",
  },
  {
    id: "mia-thomas",
    accessCode: "RFRL-552",
    name: "Mia Thomas",
    cohort: "Spring 2026 Trailblazer Cohort",
    track: "Confidence & Communication Track",
    avatar: "✨",
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

let settings = loadSettings();
let state = {
  studentPortal: null,
  teacherStudents: [],
  teacherStudentDetail: null,
};

function saveSettings() {
  localStorage.setItem(PORTAL_SETTINGS_KEY, JSON.stringify(settings));
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

async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  const response = await fetch(buildApiUrl(path), {
    method: options.method || "GET",
    headers,
    body:
      options.body === undefined
        ? undefined
        : JSON.stringify(options.body),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload?.error ||
      payload?.details ||
      `Request failed with status ${response.status}.`;
    throw new Error(message);
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

function renderSampleAccounts() {
  sampleAccounts.innerHTML = SAMPLE_STUDENTS.map(
    (student) => `
      <div class="sample-card">
        <strong>${escapeHtml(student.avatar)} ${escapeHtml(student.name)}</strong>
        <p>${escapeHtml(student.cohort)} · ${escapeHtml(student.track)}</p>
        <div class="sample-pill">ID ${escapeHtml(student.id)}</div>
        <div class="sample-pill">Code ${escapeHtml(student.accessCode)}</div>
      </div>
    `,
  ).join("");
}

function syncSettingsInputs() {
  portalApiUrlInput.value = settings.apiBaseUrl || "";
  portalBootstrapSecretInput.value = settings.bootstrapSecret || "";
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
              ? `
            <div class="feedback-box">
              <strong>Teacher result:</strong> ${escapeHtml(assignment.review.status)}${
                assignment.review.score
                  ? ` · Score ${escapeHtml(assignment.review.score)}`
                  : ""
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
          ${resource.meta
            .map((item) => `<span class="chip">${escapeHtml(item)}</span>`)
            .join("")}
        </div>
        <a class="resource-link" href="${escapeHtml(resource.href)}">${escapeHtml(resource.label)}</a>
      </article>
    `,
    )
    .join("");

  if (!feedback.length) {
    feedbackList.innerHTML = `
      <div class="empty">
        No teacher feedback has been added yet. Once your teacher reviews your work,
        celebration, scores, and coaching notes will show up here.
      </div>
    `;
  } else {
    feedbackList.innerHTML = feedback
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
  }

  bindStudentActions();
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

function bindStudentActions() {
  assignmentList.querySelectorAll("[data-save-assignment]").forEach((button) => {
    button.addEventListener("click", async () => {
      const assignmentId = button.getAttribute("data-save-assignment");
      const textarea = document.getElementById(`submission-${assignmentId}`);
      try {
        state.studentPortal = await apiRequest(`/portal/student/assignments/${encodeURIComponent(assignmentId)}`, {
          method: "PUT",
          headers: studentAuthHeaders(),
          body: {
            submission: textarea.value.trim(),
            readyForReview: false,
          },
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
      try {
        state.studentPortal = await apiRequest(`/portal/student/assignments/${encodeURIComponent(assignmentId)}`, {
          method: "PUT",
          headers: studentAuthHeaders(),
          body: {
            submission: textarea.value.trim(),
            readyForReview: true,
          },
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
  if (!getApiBaseUrl()) {
    showStatus(studentLoginStatus, "Save the Portal API base URL first.");
    return;
  }

  try {
    const payload = await apiRequest("/portal/auth/login", {
      method: "POST",
      body: {
        studentId: String(studentId || "").trim().toLowerCase(),
        accessCode: String(accessCode || "").trim(),
      },
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
  if (!getApiBaseUrl()) {
    showStatus(teacherStatus, "Save the Portal API base URL first.");
    return;
  }

  try {
    const payload = await apiRequest("/portal/teacher/login", {
      method: "POST",
      body: { pin: String(pin || "").trim() },
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
  try {
    state.teacherStudentDetail = await apiRequest(
      `/portal/teacher/students/${encodeURIComponent(settings.teacherSelectedStudentId)}`,
      {
        headers: teacherAuthHeaders(),
      },
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
              celebration: document
                .getElementById(`review-celebration-${assignmentId}`)
                .value.trim(),
              coaching: document
                .getElementById(`review-coaching-${assignmentId}`)
                .value.trim(),
            },
          },
        );
        renderTeacherWorkspace();
        if (
          state.studentPortal?.student?.id === settings.teacherSelectedStudentId
        ) {
          await loadStudentPortal();
        }
      } catch (error) {
        showStatus(teacherStatus, error.message);
      }
    });
  });
}

async function logoutStudent() {
  if (settings.studentToken) {
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
  if (!getApiBaseUrl()) {
    showStatus(portalSetupStatus, "Save the Portal API base URL first.");
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

if (settings.studentToken) {
  loadStudentPortal();
}

if (settings.teacherToken) {
  loadTeacherStudents();
}
