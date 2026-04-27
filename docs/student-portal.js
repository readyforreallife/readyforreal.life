const PORTAL_SETTINGS_KEY = "rfrl-student-portal-supabase-v1";
const PAGE_ENTRY_MODE = new URLSearchParams(window.location.search).get("entry") || "";
const PAGE_HASH = window.location.hash || "";
const DEFAULT_STORAGE_BUCKET = "portal-files";
const EMBEDDED_SUPABASE_URL = normalizeUrl(
  document.documentElement.dataset.supabaseUrl || "",
);
const EMBEDDED_SUPABASE_ANON_KEY =
  document.documentElement.dataset.supabaseAnonKey || "";
const EMBEDDED_STORAGE_BUCKET =
  document.documentElement.dataset.storageBucket || DEFAULT_STORAGE_BUCKET;

const DEFAULT_ASSIGNMENTS = {
  student: [
    {
      id: "pocc-scenario",
      title: "POCC Scenario Response",
      objective:
        "Use the POCC sequence to make a stronger call under pressure and explain why it protects trust and long-term outcomes.",
      due_label: "Due this week",
      rubric_focus: "Decision quality, consequence awareness, accountability",
      sort_order: 10,
    },
    {
      id: "digital-reputation",
      title: "Digital Reputation Reflection",
      objective:
        "Analyze one online choice and show how it affects credibility, opportunity, and self-respect.",
      due_label: "Due Friday",
      rubric_focus: "Self-awareness, judgment, real-life transfer",
      sort_order: 20,
    },
    {
      id: "repair-move",
      title: "Repair Move Practice",
      objective:
        "Write and rehearse an accountable repair response after a mistake or conflict.",
      due_label: "Due next Monday",
      rubric_focus: "Ownership, communication, follow-through",
      sort_order: 30,
    },
  ],
  instructor: [
    {
      id: "launch-plan",
      title: "Launch Plan",
      objective:
        "Map how you want to use the program, which students you are serving, and what success should look like.",
      due_label: "Start here",
      rubric_focus: "Planning, program fit, readiness",
      sort_order: 10,
    },
    {
      id: "resource-organization",
      title: "Resource Organization",
      objective:
        "Upload and organize the guides, notes, and files you want close at hand during delivery.",
      due_label: "This week",
      rubric_focus: "Organization, clarity, implementation",
      sort_order: 20,
    },
    {
      id: "reflection-loop",
      title: "Reflection Loop",
      objective:
        "Capture what is working, what students need, and what you want to adjust next.",
      due_label: "Ongoing",
      rubric_focus: "Reflection, coaching, iteration",
      sort_order: 30,
    },
  ],
};

const DEFAULT_WORKBOOK_PROMPTS = {
  student: [
    {
      id: "weekly-reset",
      title: "Weekly Reset",
      prompt:
        "What real-life moment challenged you most this week, and what would your strongest self do next time?",
      sort_order: 10,
    },
    {
      id: "identity-build",
      title: "Identity Builder",
      prompt:
        "What kind of person are you becoming through this program, and what proof do you already have?",
      sort_order: 20,
    },
    {
      id: "coaching-bridge",
      title: "Coaching Bridge",
      prompt:
        "What feedback are you going to act on immediately, and what will it look like in action?",
      sort_order: 30,
    },
  ],
  instructor: [
    {
      id: "delivery-notes",
      title: "Delivery Notes",
      prompt:
        "What did you notice about student engagement, transfer, and clarity during delivery?",
      sort_order: 10,
    },
    {
      id: "coaching-priority",
      title: "Coaching Priority",
      prompt:
        "What is the next most important coaching move for your group or class?",
      sort_order: 20,
    },
    {
      id: "implementation-proof",
      title: "Implementation Proof",
      prompt:
        "What evidence do you want to save that shows progress, momentum, or impact?",
      sort_order: 30,
    },
  ],
};

const DEFAULT_RESOURCES = [
  {
    title: "Program Guide",
    description:
      "See the structure, goals, and instructional framework behind the course.",
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
      "Read the program story and the people behind it so users know what they joined.",
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
const signupForm = document.getElementById("signupForm");
const signupNameInput = document.getElementById("signupNameInput");
const signupEmailInput = document.getElementById("signupEmailInput");
const signupPasswordInput = document.getElementById("signupPasswordInput");
const signupRoleInput = document.getElementById("signupRoleInput");
const signupCohortInput = document.getElementById("signupCohortInput");
const signupTrackInput = document.getElementById("signupTrackInput");
const signupStatus = document.getElementById("teacherStatus");
const portalApiUrlInput = document.getElementById("portalApiUrlInput");
const portalBootstrapSecretInput = document.getElementById("portalBootstrapSecretInput");
const storageBucketInput = document.getElementById("storageBucketInput");
const savePortalApiBtn = document.getElementById("savePortalApiBtn");
const clearSupabaseConfigBtn = document.getElementById("clearSupabaseConfigBtn");
const portalSetupStatus = document.getElementById("portalSetupStatus");
const studentPortal = document.getElementById("studentPortal");
const welcomeCohort = document.getElementById("welcomeCohort");
const welcomeTitle = document.getElementById("welcomeTitle");
const welcomeCopy = document.getElementById("welcomeCopy");
const welcomeMeta = document.getElementById("welcomeMeta");
const identityCardName = document.getElementById("identityCardName");
const identityCardTrack = document.getElementById("identityCardTrack");
const progressSummary = document.getElementById("progressSummary");
const progressFill = document.getElementById("progressFill");
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
const fileUploadInput = document.getElementById("fileUploadInput");
const uploadFileBtn = document.getElementById("uploadFileBtn");
const fileUploadStatus = document.getElementById("fileUploadStatus");
const fileList = document.getElementById("fileList");

let settings = loadSettings();
let supabaseClient = null;
let authSubscription = null;
let state = {
  session: null,
  user: null,
  profile: null,
  assignments: [],
  workbookEntries: [],
  files: [],
};

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function showStatus(el, message, type = "") {
  if (!el) return;
  el.textContent = message;
  el.className = "status-line";
  if (type) el.classList.add(type);
}

function clearStatus(el) {
  if (!el) return;
  el.textContent = "";
  el.className = "status-line";
}

function loadSettings() {
  const defaults = {
    supabaseUrl: EMBEDDED_SUPABASE_URL,
    supabaseAnonKey: EMBEDDED_SUPABASE_ANON_KEY,
    storageBucket: EMBEDDED_STORAGE_BUCKET,
    lastAuthEmail: "",
  };
  const raw = localStorage.getItem(PORTAL_SETTINGS_KEY);
  if (!raw) return defaults;
  try {
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function saveSettings() {
  localStorage.setItem(PORTAL_SETTINGS_KEY, JSON.stringify(settings));
}

function normalizeUrl(url) {
  return String(url || "").trim().replace(/\/+$/, "");
}

function hasSupabaseConfig() {
  return Boolean(settings.supabaseUrl && settings.supabaseAnonKey);
}

function syncSettingsInputs() {
  portalApiUrlInput.value = settings.supabaseUrl || "";
  portalBootstrapSecretInput.value = settings.supabaseAnonKey || "";
  storageBucketInput.value = settings.storageBucket || DEFAULT_STORAGE_BUCKET;
  studentIdInput.value = settings.lastAuthEmail || "";
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

function getSupabase() {
  if (!supabaseClient) {
    throw new Error("Save your Supabase settings first.");
  }
  return supabaseClient;
}

function createWelcomeCopy(role, name) {
  if (role === "instructor") {
    return `${name} has a secure home base for notes, files, planning, and reflection. Everything here should stay private to this instructor account.`;
  }
  return `${name} has a secure home base for assignments, workbook reflections, personal files, and saved feedback. Everything here should stay private to this student account.`;
}

function defaultTrackForRole(role) {
  return role === "instructor" ? "Instructor Workspace" : "Core Skills Focus";
}

function defaultCohortForRole(role) {
  return role === "instructor" ? "Instruction Team" : "Ready for Real Life Cohort";
}

function defaultAvatarForRole(role) {
  return role === "instructor" ? "🧭" : "🚀";
}

function assignmentTemplatesForRole(role) {
  return DEFAULT_ASSIGNMENTS[role] || DEFAULT_ASSIGNMENTS.student;
}

function workbookTemplatesForRole(role) {
  return DEFAULT_WORKBOOK_PROMPTS[role] || DEFAULT_WORKBOOK_PROMPTS.student;
}

function safeFileName(name) {
  return String(name || "file")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (!value) return "0 B";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function computeProgress(assignments, workbookEntries) {
  const completedAssignments = assignments.filter((assignment) =>
    ["Approved", "Exceeds expectations"].includes(assignment.review_status),
  ).length;
  const completedWorkbook = workbookEntries.filter((entry) =>
    String(entry.response || "").trim(),
  ).length;
  const total = assignments.length + workbookEntries.length || 1;
  const completed = completedAssignments + completedWorkbook;
  return {
    completed,
    total,
    percent: Math.round((completed / total) * 100),
  };
}

function initializeSupabaseClient() {
  if (!hasSupabaseConfig()) {
    supabaseClient = null;
    authSubscription?.unsubscribe?.();
    authSubscription = null;
    return false;
  }

  if (!window.supabase?.createClient) {
    showStatus(
      portalSetupStatus,
      "Supabase client library did not load. Check your internet connection and reload.",
    );
    return false;
  }

  authSubscription?.unsubscribe?.();
  supabaseClient = window.supabase.createClient(
    settings.supabaseUrl,
    settings.supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  );

  authSubscription = supabaseClient.auth.onAuthStateChange((_event, session) => {
    handleSessionChange(session).catch((error) => {
      showStatus(studentLoginStatus, error.message);
    });
  }).data.subscription;

  return true;
}

async function ensureProfile(user, defaults = {}) {
  const supabase = getSupabase();
  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing;

  const role = defaults.role || user.user_metadata?.role || "student";
  const displayName =
    defaults.displayName ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Portal User";
  const cohort = defaults.cohort || user.user_metadata?.cohort || defaultCohortForRole(role);
  const track = defaults.track || user.user_metadata?.track || defaultTrackForRole(role);
  const avatar = defaults.avatar || defaultAvatarForRole(role);
  const firstName = displayName.split(/\s+/)[0] || displayName;

  const insertPayload = {
    id: user.id,
    email: user.email,
    role,
    display_name: displayName,
    cohort,
    track,
    avatar,
    welcome_title: role === "instructor" ? `Welcome, ${firstName}.` : `Welcome, ${firstName}.`,
    welcome_copy: createWelcomeCopy(role, firstName),
    bio_proud: "",
    bio_goal: "",
    bio_strengths: "",
    bio_support: "",
  };

  const { data: inserted, error: insertError } = await supabase
    .from("profiles")
    .insert(insertPayload)
    .select("*")
    .single();

  if (insertError) throw insertError;
  return inserted;
}

async function ensureAssignments(userId, role) {
  const supabase = getSupabase();
  const { data: existing, error } = await supabase
    .from("user_assignments")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  if (existing?.length) return existing;

  const payload = assignmentTemplatesForRole(role).map((assignment) => ({
    user_id: userId,
    assignment_key: assignment.id,
    title: assignment.title,
    objective: assignment.objective,
    due_label: assignment.due_label,
    rubric_focus: assignment.rubric_focus,
    sort_order: assignment.sort_order,
    submission: "",
    ready_for_review: false,
    review_status: "Not reviewed",
    review_score: "",
    review_celebration: "",
    review_coaching: "",
  }));

  const { data: inserted, error: insertError } = await supabase
    .from("user_assignments")
    .insert(payload)
    .select("*")
    .order("sort_order", { ascending: true });

  if (insertError) throw insertError;
  return inserted || [];
}

async function ensureWorkbookEntries(userId, role) {
  const supabase = getSupabase();
  const { data: existing, error } = await supabase
    .from("user_workbook_entries")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  if (existing?.length) return existing;

  const payload = workbookTemplatesForRole(role).map((prompt) => ({
    user_id: userId,
    prompt_key: prompt.id,
    title: prompt.title,
    prompt: prompt.prompt,
    response: "",
    sort_order: prompt.sort_order,
  }));

  const { data: inserted, error: insertError } = await supabase
    .from("user_workbook_entries")
    .insert(payload)
    .select("*")
    .order("sort_order", { ascending: true });

  if (insertError) throw insertError;
  return inserted || [];
}

async function loadFiles(userId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("user_files")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

async function loadPortalData(defaults = null) {
  const user = state.user;
  if (!user) return;

  const profile = await ensureProfile(user, defaults || {});
  const [assignments, workbookEntries, files] = await Promise.all([
    ensureAssignments(user.id, profile.role),
    ensureWorkbookEntries(user.id, profile.role),
    loadFiles(user.id),
  ]);

  state.profile = profile;
  state.assignments = assignments;
  state.workbookEntries = workbookEntries;
  state.files = files;
  renderPortal();
}

function renderLoggedOutState() {
  state.session = null;
  state.user = null;
  state.profile = null;
  state.assignments = [];
  state.workbookEntries = [];
  state.files = [];
  studentPortal.classList.remove("visible");
  clearStatus(bioStatus);
  clearStatus(fileUploadStatus);
}

async function handleSessionChange(session) {
  state.session = session || null;
  state.user = session?.user || null;

  if (!state.user) {
    renderLoggedOutState();
    return;
  }

  settings.lastAuthEmail = state.user.email || settings.lastAuthEmail;
  saveSettings();
  await loadPortalData();
}

function renderPortal() {
  if (!state.profile) {
    studentPortal.classList.remove("visible");
    return;
  }

  studentPortal.classList.add("visible");

  const profile = state.profile;
  const firstName = profile.display_name.split(/\s+/)[0] || profile.display_name;
  const progress = computeProgress(state.assignments, state.workbookEntries);

  welcomeCohort.textContent = profile.cohort || defaultCohortForRole(profile.role);
  welcomeTitle.textContent = profile.welcome_title || `Welcome, ${firstName}.`;
  welcomeCopy.textContent =
    profile.welcome_copy || createWelcomeCopy(profile.role, firstName);
  welcomeMeta.innerHTML = `
    <span class="chip">${escapeHtml(profile.avatar || defaultAvatarForRole(profile.role))} ${escapeHtml(profile.display_name)}</span>
    <span class="chip">${escapeHtml(profile.role)}</span>
    <span class="chip">${escapeHtml(profile.track || defaultTrackForRole(profile.role))}</span>
    <span class="chip">${progress.completed}/${progress.total} milestones complete</span>
  `;

  identityCardName.textContent = `${profile.avatar || defaultAvatarForRole(profile.role)} ${profile.display_name}`;
  identityCardTrack.textContent = `${profile.track || defaultTrackForRole(profile.role)} · ${profile.email}`;
  progressSummary.textContent = `${progress.completed} of ${progress.total} milestones complete`;
  progressFill.style.width = `${progress.percent}%`;

  bioProudInput.value = profile.bio_proud || "";
  bioGoalInput.value = profile.bio_goal || "";
  bioStrengthsInput.value = profile.bio_strengths || "";
  bioSupportInput.value = profile.bio_support || "";
  bioPreview.innerHTML = `
    <div><strong>What they are building:</strong><br>${escapeHtml(profile.bio_proud || "Nothing saved yet.")}</div>
    <div style="margin-top:12px"><strong>Future goal:</strong><br>${escapeHtml(profile.bio_goal || "Nothing saved yet.")}</div>
    <div style="margin-top:12px"><strong>Strengths:</strong><br>${escapeHtml(profile.bio_strengths || "Nothing saved yet.")}</div>
    <div style="margin-top:12px"><strong>Support that helps:</strong><br>${escapeHtml(profile.bio_support || "Nothing saved yet.")}</div>
  `;

  assignmentList.innerHTML = state.assignments
    .map((assignment) => {
      const statusText = assignment.ready_for_review
        ? assignment.review_status === "Not reviewed"
          ? "Ready for review"
          : assignment.review_status
        : "In progress";

      return `
        <article class="assignment-card">
          <div class="assignment-head">
            <div>
              <div class="mini-label">${escapeHtml(assignment.due_label)}</div>
              <h4>${escapeHtml(assignment.title)}</h4>
            </div>
            <span class="status-badge ${badgeClass(statusText)}">${escapeHtml(statusText)}</span>
          </div>
          <p>${escapeHtml(assignment.objective)}</p>
          <div class="assignment-meta">
            <span class="chip">${escapeHtml(assignment.rubric_focus)}</span>
          </div>
          <label style="margin-top:14px">
            Your response / reflection
            <textarea id="submission-${assignment.id}" placeholder="Write your response here.">${escapeHtml(assignment.submission || "")}</textarea>
          </label>
          <div class="assignment-actions">
            <button class="btn primary" type="button" data-save-assignment="${assignment.id}">Save Work</button>
            <button class="btn secondary" type="button" data-ready-assignment="${assignment.id}">Mark Ready for Review</button>
          </div>
          ${
            assignment.review_status !== "Not reviewed"
              ? `<div class="feedback-box">
                  <strong>Saved review:</strong> ${escapeHtml(assignment.review_status)}${
                    assignment.review_score ? ` · Score ${escapeHtml(assignment.review_score)}` : ""
                  }
                  <div style="margin-top:10px"><strong>Celebration:</strong><br>${escapeHtml(assignment.review_celebration || "Not added yet.")}</div>
                  <div style="margin-top:10px"><strong>Coaching:</strong><br>${escapeHtml(assignment.review_coaching || "Not added yet.")}</div>
                </div>`
              : ""
          }
        </article>
      `;
    })
    .join("");

  workbookList.innerHTML = state.workbookEntries
    .map(
      (entry) => `
        <article class="workbook-card">
          <div class="mini-label">Workbook prompt</div>
          <h4>${escapeHtml(entry.title)}</h4>
          <p>${escapeHtml(entry.prompt)}</p>
          <label style="margin-top:14px">
            Your reflection
            <textarea id="workbook-${entry.id}" placeholder="Write your reflection here.">${escapeHtml(entry.response || "")}</textarea>
          </label>
          <div class="assignment-actions">
            <button class="btn primary" type="button" data-save-workbook="${entry.id}">Save Reflection</button>
          </div>
        </article>
      `,
    )
    .join("");

  resourceList.innerHTML = DEFAULT_RESOURCES.map(
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
  ).join("");

  const feedbackItems = state.assignments.filter(
    (assignment) => assignment.review_status !== "Not reviewed",
  );

  feedbackList.innerHTML = feedbackItems.length
    ? feedbackItems
        .map(
          (assignment) => `
            <article class="assignment-card">
              <div class="assignment-head">
                <div>
                  <div class="mini-label">Saved review</div>
                  <h4>${escapeHtml(assignment.title)}</h4>
                </div>
                <span class="status-badge ${badgeClass(assignment.review_status)}">${escapeHtml(assignment.review_status)}</span>
              </div>
              <p><strong>Score:</strong> ${escapeHtml(assignment.review_score || "Pending")}</p>
              <div class="feedback-box">
                <strong>Celebration</strong>
                <div style="margin-top:8px">${escapeHtml(assignment.review_celebration || "No celebration note yet.")}</div>
              </div>
              <div class="feedback-box">
                <strong>Coaching</strong>
                <div style="margin-top:8px">${escapeHtml(assignment.review_coaching || "No coaching note yet.")}</div>
              </div>
            </article>
          `,
        )
        .join("")
    : `<div class="empty">No feedback has been saved on this account yet.</div>`;

  fileList.innerHTML = state.files.length
    ? state.files
        .map(
          (file) => `
            <article class="resource-card">
              <div class="mini-label">Private upload</div>
              <h4>${escapeHtml(file.file_name)}</h4>
              <p>${escapeHtml(file.mime_type || "Stored file")} · ${escapeHtml(formatBytes(file.file_size_bytes))}</p>
              <div class="assignment-actions">
                <button class="btn secondary" type="button" data-open-file="${file.id}">Open File</button>
                <button class="btn secondary" type="button" data-delete-file="${file.id}">Delete File</button>
              </div>
            </article>
          `,
        )
        .join("")
    : `<div class="empty">No private files have been uploaded yet.</div>`;

  bindPortalActions();
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

async function saveAssignment(assignmentId, readyForReview) {
  const textarea = document.getElementById(`submission-${assignmentId}`);
  const submission = textarea?.value.trim() || "";
  const supabase = getSupabase();
  const updatePayload = {
    submission,
    ready_for_review: readyForReview,
  };

  if (readyForReview) {
    updatePayload.review_status = "In review";
  }

  const { error } = await supabase
    .from("user_assignments")
    .update(updatePayload)
    .eq("id", assignmentId)
    .eq("user_id", state.user.id);

  if (error) throw error;
  await loadPortalData();
}

async function saveWorkbookEntry(entryId) {
  const textarea = document.getElementById(`workbook-${entryId}`);
  const response = textarea?.value.trim() || "";
  const supabase = getSupabase();
  const { error } = await supabase
    .from("user_workbook_entries")
    .update({ response })
    .eq("id", entryId)
    .eq("user_id", state.user.id);

  if (error) throw error;
  await loadPortalData();
}

async function openFile(fileId) {
  const fileRecord = state.files.find((item) => item.id === fileId);
  if (!fileRecord) return;
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from(settings.storageBucket)
    .createSignedUrl(fileRecord.storage_path, 60);

  if (error) throw error;
  if (data?.signedUrl) {
    window.open(data.signedUrl, "_blank", "noopener");
  }
}

async function deleteFile(fileId) {
  const fileRecord = state.files.find((item) => item.id === fileId);
  if (!fileRecord) return;
  const supabase = getSupabase();

  const { error: storageError } = await supabase.storage
    .from(settings.storageBucket)
    .remove([fileRecord.storage_path]);
  if (storageError) throw storageError;

  const { error: rowError } = await supabase
    .from("user_files")
    .delete()
    .eq("id", fileRecord.id)
    .eq("user_id", state.user.id);
  if (rowError) throw rowError;

  await loadPortalData();
}

function bindPortalActions() {
  assignmentList.querySelectorAll("[data-save-assignment]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await saveAssignment(button.getAttribute("data-save-assignment"), false);
        showStatus(bioStatus, "Assignment draft saved.", "success");
      } catch (error) {
        showStatus(studentLoginStatus, error.message);
      }
    });
  });

  assignmentList.querySelectorAll("[data-ready-assignment]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await saveAssignment(button.getAttribute("data-ready-assignment"), true);
        showStatus(bioStatus, "Assignment marked ready for review.", "success");
      } catch (error) {
        showStatus(studentLoginStatus, error.message);
      }
    });
  });

  workbookList.querySelectorAll("[data-save-workbook]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await saveWorkbookEntry(button.getAttribute("data-save-workbook"));
        showStatus(bioStatus, "Workbook reflection saved.", "success");
      } catch (error) {
        showStatus(studentLoginStatus, error.message);
      }
    });
  });

  fileList.querySelectorAll("[data-open-file]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await openFile(button.getAttribute("data-open-file"));
      } catch (error) {
        showStatus(fileUploadStatus, error.message);
      }
    });
  });

  fileList.querySelectorAll("[data-delete-file]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await deleteFile(button.getAttribute("data-delete-file"));
        showStatus(fileUploadStatus, "File deleted from your private storage.", "success");
      } catch (error) {
        showStatus(fileUploadStatus, error.message);
      }
    });
  });
}

async function uploadSelectedFile() {
  if (!state.user) {
    showStatus(fileUploadStatus, "Sign in before uploading files.");
    return;
  }

  const file = fileUploadInput.files?.[0];
  if (!file) {
    showStatus(fileUploadStatus, "Choose a file first.");
    return;
  }

  const supabase = getSupabase();
  const storagePath = `${state.user.id}/${Date.now()}-${safeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(settings.storageBucket)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
    });
  if (uploadError) throw uploadError;

  const { error: rowError } = await supabase.from("user_files").insert({
    user_id: state.user.id,
    file_name: file.name,
    storage_path: storagePath,
    mime_type: file.type || "application/octet-stream",
    file_size_bytes: file.size || 0,
  });
  if (rowError) throw rowError;

  fileUploadInput.value = "";
  await loadPortalData();
  showStatus(fileUploadStatus, "File uploaded to your private storage.", "success");
}

async function signInUser(email, password) {
  if (!hasSupabaseConfig()) {
    showStatus(studentLoginStatus, "Save your Supabase settings first.");
    return;
  }

  const supabase = getSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(email || "").trim(),
    password: String(password || "").trim(),
  });

  if (error) throw error;
  settings.lastAuthEmail = String(email || "").trim();
  saveSettings();
  showStatus(studentLoginStatus, "Signed in successfully.", "success");
}

async function resumeSession() {
  if (!hasSupabaseConfig()) {
    showStatus(studentLoginStatus, "Save your Supabase settings first.");
    return;
  }
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session) {
    showStatus(studentLoginStatus, "No saved session was found on this device.");
    return;
  }
  await handleSessionChange(data.session);
  showStatus(studentLoginStatus, "Saved session restored.", "success");
}

async function signUpUser() {
  if (!hasSupabaseConfig()) {
    showStatus(signupStatus, "Save your Supabase settings first.");
    return;
  }

  const name = signupNameInput.value.trim();
  const email = signupEmailInput.value.trim();
  const password = signupPasswordInput.value.trim();
  const role = signupRoleInput.value;
  const cohort = signupCohortInput.value.trim() || defaultCohortForRole(role);
  const track = signupTrackInput.value.trim() || defaultTrackForRole(role);

  if (!name || !email || !password) {
    showStatus(signupStatus, "Add your name, email, and password first.");
    return;
  }

  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role,
        cohort,
        track,
      },
    },
  });

  if (error) throw error;

  settings.lastAuthEmail = email;
  saveSettings();

  if (data.session?.user) {
    await ensureProfile(data.session.user, {
      displayName: name,
      role,
      cohort,
      track,
    });
    await handleSessionChange(data.session);
    showStatus(signupStatus, "Account created and signed in.", "success");
    signupForm.reset();
    return;
  }

  showStatus(
    signupStatus,
    "Account created. Check your email to confirm the account before signing in.",
    "success",
  );
  signupForm.reset();
}

async function saveBio() {
  if (!state.user) {
    showStatus(bioStatus, "Sign in before saving your bio.");
    return;
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      bio_proud: bioProudInput.value.trim(),
      bio_goal: bioGoalInput.value.trim(),
      bio_strengths: bioStrengthsInput.value.trim(),
      bio_support: bioSupportInput.value.trim(),
    })
    .eq("id", state.user.id)
    .select("*")
    .single();

  if (error) throw error;
  state.profile = data;
  renderPortal();
  showStatus(bioStatus, "Your profile was saved to your private account.", "success");
}

async function logoutUser() {
  if (!supabaseClient) return;
  const { error } = await supabaseClient.auth.signOut({ scope: "local" });
  if (error) throw error;
  renderLoggedOutState();
  showStatus(studentLoginStatus, "Signed out.", "success");
}

savePortalApiBtn.addEventListener("click", async () => {
  settings.supabaseUrl = normalizeUrl(portalApiUrlInput.value);
  settings.supabaseAnonKey = portalBootstrapSecretInput.value.trim();
  settings.storageBucket = storageBucketInput.value.trim() || DEFAULT_STORAGE_BUCKET;
  saveSettings();
  syncSettingsInputs();

  if (!initializeSupabaseClient()) {
    showStatus(portalSetupStatus, "Add a valid Supabase URL and anon key first.");
    return;
  }

  try {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    await handleSessionChange(data.session);
    showStatus(portalSetupStatus, "Supabase connection saved on this device.", "success");
  } catch (error) {
    showStatus(portalSetupStatus, error.message);
  }
});

clearSupabaseConfigBtn.addEventListener("click", () => {
  settings = {
    supabaseUrl: EMBEDDED_SUPABASE_URL,
    supabaseAnonKey: EMBEDDED_SUPABASE_ANON_KEY,
    storageBucket: EMBEDDED_STORAGE_BUCKET,
    lastAuthEmail: settings.lastAuthEmail || "",
  };
  saveSettings();
  syncSettingsInputs();
  initializeSupabaseClient();
  renderLoggedOutState();
  showStatus(portalSetupStatus, "Saved Supabase settings cleared from this device.", "success");
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await signInUser(studentIdInput.value, studentCodeInput.value);
  } catch (error) {
    showStatus(studentLoginStatus, error.message);
  }
});

restoreLastStudentBtn.addEventListener("click", async () => {
  try {
    await resumeSession();
  } catch (error) {
    showStatus(studentLoginStatus, error.message);
  }
});

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await signUpUser();
  } catch (error) {
    showStatus(signupStatus, error.message);
  }
});

bioForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await saveBio();
  } catch (error) {
    showStatus(bioStatus, error.message);
  }
});

studentLogoutBtn.addEventListener("click", async () => {
  try {
    await logoutUser();
  } catch (error) {
    showStatus(studentLoginStatus, error.message);
  }
});

uploadFileBtn.addEventListener("click", async () => {
  try {
    await uploadSelectedFile();
  } catch (error) {
    showStatus(fileUploadStatus, error.message);
  }
});

syncSettingsInputs();
resetPortalScrollForEntry();

if (initializeSupabaseClient()) {
  supabaseClient.auth
    .getSession()
    .then(({ data, error }) => {
      if (error) throw error;
      return handleSessionChange(data.session);
    })
    .catch((error) => {
      showStatus(studentLoginStatus, error.message);
    });
}
