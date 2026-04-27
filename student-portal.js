const PORTAL_SETTINGS_KEY = "rfrl-student-portal-supabase-v1";
const PAGE_ENTRY_MODE = new URLSearchParams(window.location.search).get("entry") || "";
const PAGE_HASH = window.location.hash || "";
const DEFAULT_STORAGE_BUCKET = "portal-files";
const ADVANCED_SETTINGS_ACCESS_KEY = "4429";
const DEFAULT_CONFIRMATION_REDIRECT_URL = "https://readyforreal.life/student-portal.html";
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

const COURSE_WEEKS = [
  {
    week: 1,
    module: "Module 1 · Modern Manners",
    title: "Set the tone and build belonging",
    focus:
      "Launch the culture of the course with presence, greetings, listening, and the expectation that respect is visible.",
    studentActions: [
      "Practice greetings, introductions, and active-listening sentence stems.",
      "Notice how tone, posture, and presence affect trust in real situations.",
    ],
    studentEvidence: [
      "Short reflection on first impressions and respect habits.",
      "Participation in modeled greetings and listening drills.",
    ],
    instructorMoves: [
      "Model the expected tone from the first five minutes of class.",
      "Teach and rehearse greeting, entry, and discussion norms explicitly.",
    ],
    instructorPrep: [
      "Prepare quick role-play prompts and room routines.",
      "Decide what respectful participation looks like in this group.",
    ],
  },
  {
    week: 2,
    module: "Module 1 · Modern Manners",
    title: "Strengthen conversation habits",
    focus:
      "Build consistency with eye contact, turn-taking, attention, and how to carry yourself in classrooms, homes, and community spaces.",
    studentActions: [
      "Use conversation stems in structured partner and small-group practice.",
      "Track one real-life setting where manners change the outcome.",
    ],
    studentEvidence: [
      "Scenario-based etiquette reflection.",
      "Weekly practice notes connected to daily interactions.",
    ],
    instructorMoves: [
      "Give fast feedback on tone, interruption, and listening quality.",
      "Use low-stakes scenarios before moving into higher-pressure conversations.",
    ],
    instructorPrep: [
      "Choose two or three everyday situations students recognize immediately.",
      "Plan visible anchors for conversation stems and expectations.",
    ],
  },
  {
    week: 3,
    module: "Module 1 · Modern Manners",
    title: "Transfer respect into real settings",
    focus:
      "Move from practice drills to public-facing situations like school interactions, family communication, and workplace readiness.",
    studentActions: [
      "Apply manners and presence to one real conversation outside class.",
      "Reflect on what changed when you communicated more intentionally.",
    ],
    studentEvidence: [
      "Real-world transfer reflection.",
      "Short performance task using a school, home, or job scenario.",
    ],
    instructorMoves: [
      "Push students to name where this skill shows up outside the classroom.",
      "Use examples that connect respect to opportunity and credibility.",
    ],
    instructorPrep: [
      "Bring examples tied to interviews, meetings, family conflict, or teamwork.",
      "Prepare a simple rubric for respectful communication habits.",
    ],
  },
  {
    week: 4,
    module: "Module 2 · Emotional Intelligence",
    title: "Name emotions before they run the moment",
    focus:
      "Help students notice triggers, feelings, and escalation patterns instead of reacting on autopilot.",
    studentActions: [
      "Map triggers and identify what pressure feels like in the body.",
      "Practice naming emotions with more precision and honesty.",
    ],
    studentEvidence: [
      "Trigger map or self-awareness check-in.",
      "Workbook reflection on emotional patterns under pressure.",
    ],
    instructorMoves: [
      "Keep this practical and performance-based, not therapeutic.",
      "Normalize that noticing escalation early is a strength, not weakness.",
    ],
    instructorPrep: [
      "Prepare language supports for emotion labeling.",
      "Select scenarios where emotion clearly shapes judgment.",
    ],
  },
  {
    week: 5,
    module: "Module 2 · Emotional Intelligence",
    title: "Teach the PLRR regulation routine",
    focus:
      "Introduce Pause, Label, Reframe, Respond as a repeatable regulation routine students can use in class and beyond.",
    studentActions: [
      "Use PLRR in guided scenarios and explain each step out loud.",
      "Practice slowing down before speaking or deciding.",
    ],
    studentEvidence: [
      "PLRR scenario response.",
      "Teacher-observed regulation routine practice.",
    ],
    instructorMoves: [
      "Model the routine step by step with think-aloud language.",
      "Compare impulsive reactions with regulated responses using the same scenario.",
    ],
    instructorPrep: [
      "Prepare one scenario that predictably escalates and one that can be repaired.",
      "Post the routine visually for reference during practice.",
    ],
  },
  {
    week: 6,
    module: "Module 2 · Emotional Intelligence",
    title: "Make regulation transferable",
    focus:
      "Reinforce that emotional regulation is for arguments, online choices, deadlines, embarrassment, and pressure across contexts.",
    studentActions: [
      "Apply PLRR to one academic, social, or family challenge.",
      "Explain how a regulated response protects long-term goals.",
    ],
    studentEvidence: [
      "Transfer reflection using a personal or realistic scenario.",
      "Short check for independent use of regulation language.",
    ],
    instructorMoves: [
      "Press for transfer: where else does this show up this week?",
      "Celebrate control, not just compliance.",
    ],
    instructorPrep: [
      "Collect examples from digital, peer, school, and family contexts.",
      "Prepare debrief questions about consequence and self-respect.",
    ],
  },
  {
    week: 7,
    module: "Module 3 · Conflict Navigation",
    title: "Slow conflict down before it spreads",
    focus:
      "Teach students to recognize conflict patterns, pressure points, and the difference between reaction and strategy.",
    studentActions: [
      "Identify where conflict escalates fastest for you or the scenario.",
      "Practice response options that keep dignity intact.",
    ],
    studentEvidence: [
      "Conflict pattern reflection.",
      "Role-play notes on de-escalation choices.",
    ],
    instructorMoves: [
      "Use conflict examples students find believable, not overly polished ones.",
      "Reinforce that strength includes self-control and timing.",
    ],
    instructorPrep: [
      "Choose common peer, classroom, and family tension scenarios.",
      "Prepare escalation-versus-de-escalation comparison examples.",
    ],
  },
  {
    week: 8,
    module: "Module 3 · Conflict Navigation",
    title: "Use strong language under pressure",
    focus:
      "Develop boundary language, disagreement language, and calmer ways to respond when emotions rise.",
    studentActions: [
      "Rehearse assertive but respectful language in conflict situations.",
      "Practice timing, brevity, and boundaries in role-play.",
    ],
    studentEvidence: [
      "Conflict language script or voice response.",
      "Observed use of calm, direct, accountable wording.",
    ],
    instructorMoves: [
      "Coach students away from passive or explosive responses.",
      "Pause role-plays often enough to refine language, not just complete the scene.",
    ],
    instructorPrep: [
      "Prepare sentence stems for boundaries, disagreement, and pause requests.",
      "Decide what effective response quality looks like for scoring.",
    ],
  },
  {
    week: 9,
    module: "Module 3 · Conflict Navigation",
    title: "Practice accountability and repair",
    focus:
      "Teach students how to own harm, repair trust, and follow through instead of offering shallow apologies.",
    studentActions: [
      "Write or rehearse an accountable repair response.",
      "Explain what follow-through makes an apology believable.",
    ],
    studentEvidence: [
      "Accountability or repair plan.",
      "Reflection on trust rebuilding and personal responsibility.",
    ],
    instructorMoves: [
      "Make the distinction between apology language and actual repair explicit.",
      "Use examples where trust is rebuilt through action, not words alone.",
    ],
    instructorPrep: [
      "Bring scenarios involving mistakes, gossip, disrespect, or digital harm.",
      "Prepare a repair checklist that includes ownership and follow-through.",
    ],
  },
  {
    week: 10,
    module: "Module 4 · Digital Citizenship",
    title: "See the long life of digital choices",
    focus:
      "Connect online behavior to reputation, opportunity, privacy, and self-respect.",
    studentActions: [
      "Audit one type of digital choice for audience, permanence, and consequence.",
      "Discuss how online habits affect credibility offline.",
    ],
    studentEvidence: [
      "Digital footprint reflection.",
      "Scenario analysis tied to reputation and consequence.",
    ],
    instructorMoves: [
      "Keep the conversation grounded in future opportunity, not fear only.",
      "Use current examples that feel relevant without glamorizing bad choices.",
    ],
    instructorPrep: [
      "Gather realistic cases involving posts, screenshots, privacy, or online conflict.",
      "Prepare prompts about audience, permanence, and trust.",
    ],
  },
  {
    week: 11,
    module: "Module 4 · Digital Citizenship",
    title: "Use POCC for better online decisions",
    focus:
      "Apply the decision framework to digital pressure, fast choices, and competing priorities.",
    studentActions: [
      "Use Pause, Options, Consequences, Choose in online or social scenarios.",
      "Explain how stronger decision steps protect future opportunity.",
    ],
    studentEvidence: [
      "POCC scenario response.",
      "Written explanation of options and consequences before the final choice.",
    ],
    instructorMoves: [
      "Model the thinking path, not just the correct answer.",
      "Require students to compare weak, average, and strong decision quality.",
    ],
    instructorPrep: [
      "Prepare scenarios with social pressure, digital permanence, and short-term temptation.",
      "Plan how students will show each POCC step visibly.",
    ],
  },
  {
    week: 12,
    module: "Module 4 · Digital Citizenship",
    title: "Repair and reset online behavior",
    focus:
      "Move beyond warning language into practical steps for owning digital mistakes and changing habits.",
    studentActions: [
      "Create a reset plan for a digital habit or mistake pattern.",
      "Identify boundaries and accountability supports that protect reputation.",
    ],
    studentEvidence: [
      "Digital repair or reset plan.",
      "Workbook reflection on identity, responsibility, and restraint.",
    ],
    instructorMoves: [
      "Keep the emphasis on agency and habit change.",
      "Coach students toward concrete next steps, not vague promises.",
    ],
    instructorPrep: [
      "Prepare examples involving oversharing, reactions, rumors, or impulsive posting.",
      "Decide what a credible reset plan includes.",
    ],
  },
  {
    week: 13,
    module: "Module 5 · Personal Growth",
    title: "Clarify identity and standards",
    focus:
      "Help students define the kind of person they are becoming and what standards they want to be known for.",
    studentActions: [
      "Name the values, habits, and identity markers you want to strengthen.",
      "Connect course skills to who you are becoming.",
    ],
    studentEvidence: [
      "Identity builder reflection.",
      "Short goal-setting or standards statement.",
    ],
    instructorMoves: [
      "Keep this concrete and behavioral, not abstract only.",
      "Tie identity to repeatable habits students can practice this week.",
    ],
    instructorPrep: [
      "Prepare prompts about character, maturity, trust, and reputation.",
      "Choose examples that connect standards to daily behavior.",
    ],
  },
  {
    week: 14,
    module: "Module 5 · Personal Growth",
    title: "Build responsibility and follow-through",
    focus:
      "Shift from insight into disciplined action through routines, goals, and self-management.",
    studentActions: [
      "Set a specific behavior goal with visible follow-through.",
      "Track one habit that supports maturity and reliability.",
    ],
    studentEvidence: [
      "Personal growth plan.",
      "Habit or follow-through checkpoint.",
    ],
    instructorMoves: [
      "Coach toward realistic commitments students can actually maintain.",
      "Reinforce that maturity is proven through consistency.",
    ],
    instructorPrep: [
      "Prepare examples of goal-setting with accountability supports.",
      "Plan how to check progress without overloading students.",
    ],
  },
  {
    week: 15,
    module: "Module 5 · Personal Growth",
    title: "Practice leadership and transfer",
    focus:
      "Show students how the course skills transfer into leadership, service, teamwork, and future-facing readiness.",
    studentActions: [
      "Use course language to support or guide others in a scenario.",
      "Reflect on how these skills travel into next semester, work, family, or community life.",
    ],
    studentEvidence: [
      "Transfer reflection or leadership mini-task.",
      "Self-assessment on growth across the semester.",
    ],
    instructorMoves: [
      "Surface examples of leadership that look like steadiness and reliability, not just charisma.",
      "Ask students to show how multiple skills connect in one real situation.",
    ],
    instructorPrep: [
      "Prepare synthesis prompts spanning communication, regulation, decision-making, and repair.",
      "Plan for students to articulate growth in their own language.",
    ],
  },
  {
    week: 16,
    module: "Milestone Week · Capstone",
    title: "Synthesize, celebrate, and launch forward",
    focus:
      "Close the course by looking back at growth, demonstrating transfer, and setting the next standard for life beyond the class.",
    studentActions: [
      "Complete a capstone reflection or performance task using course frameworks.",
      "Name the habits and decisions you will carry forward after the semester.",
    ],
    studentEvidence: [
      "Capstone response or presentation.",
      "Final reflection on growth, transfer, and next steps.",
    ],
    instructorMoves: [
      "Celebrate earned growth while still naming the next level of responsibility.",
      "Use synthesis tasks that require students to connect modules, not recall isolated facts.",
    ],
    instructorPrep: [
      "Prepare a capstone prompt that blends multiple modules and both frameworks.",
      "Plan a closing routine that reinforces pride, identity, and continuation.",
    ],
  },
];

const ROLE_PORTAL_COPY = {
  student: {
    roadmapLabel: "16-Week Student Path",
    roadmapTitle: "What you will do each week of the course",
    roadmapCopy:
      "This is your full semester path. Each week shows the course focus, what you will practice, and what work or reflection proves your growth.",
    bioLabel: "Personal Bio",
    bioTitle: "Your story matters here",
    bioCopy:
      "This is the profile your teacher can see while reviewing your work. Use it to share what drives you, where you want to grow, and what support helps you do your best.",
    assignmentLabel: "Mission Hub",
    assignmentTitle: "Your assignments and growth path",
    assignmentCopy:
      "Complete work here, mark it ready for review, and come back to see teacher scoring, encouragement, and next-step coaching.",
    workbookLabel: "Workbook Studio",
    workbookTitle: "Reflection and workbook prompts",
    workbookCopy:
      "Your workbook lives right here so you can write, revise, and build evidence of growth over the full 16 weeks.",
    resourceLabel: "Success Resources",
    resourceTitle: "Guides, manuals, and tools",
    resourceCopy:
      "Everything you need to succeed should feel close, not hidden. These are the tools and references that support your work each week.",
    fileLabel: "Private File Vault",
    fileTitle: "Your files and uploads",
    fileCopy:
      "Upload private files to your own storage space. Only your logged-in account should be able to view, save, or delete these files.",
    feedbackLabel: "Teacher Feedback",
    feedbackTitle: "Saved feedback and review history",
    feedbackCopy:
      "Any feedback stored on your account lives here. This keeps your own review history private to your login.",
  },
  instructor: {
    roadmapLabel: "16-Week Instructor Guide",
    roadmapTitle: "How to facilitate each week of the course",
    roadmapCopy:
      "This version is built for delivery. Each week shows the student focus, the facilitation moves to teach it well, and what to prepare or look for.",
    bioLabel: "Instructor Profile",
    bioTitle: "Your delivery identity and notes",
    bioCopy:
      "Use this profile as your private teaching snapshot. It helps you track your purpose, your facilitation strengths, and what support helps you deliver the course well.",
    assignmentLabel: "Delivery Hub",
    assignmentTitle: "Weekly facilitation tasks and implementation work",
    assignmentCopy:
      "Use this space to plan, upload, reflect, and keep your facilitation work organized across the full 16-week sequence.",
    workbookLabel: "Facilitation Journal",
    workbookTitle: "Weekly instructor reflections",
    workbookCopy:
      "Keep weekly delivery notes, what students responded to, and what you want to adjust before the next class.",
    resourceLabel: "Facilitation Resources",
    resourceTitle: "Guides, manuals, pacing, and teaching tools",
    resourceCopy:
      "These resources are here to help you deliver the curriculum week by week with clarity, consistency, and strong transfer.",
    fileLabel: "Instructor File Vault",
    fileTitle: "Lesson files, notes, and private uploads",
    fileCopy:
      "Upload lesson notes, handouts, pacing tools, or any private files you want close at hand while facilitating the course.",
    feedbackLabel: "Review Archive",
    feedbackTitle: "Saved review history and coaching notes",
    feedbackCopy:
      "Anything saved on this account stays here as part of your private implementation and review record.",
  },
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
const loginGate = document.getElementById("loginGate");
const heroGrid = document.querySelector(".hero-grid");
const signupForm = document.getElementById("signupForm");
const signupNameInput = document.getElementById("signupNameInput");
const signupEmailInput = document.getElementById("signupEmailInput");
const signupPasswordInput = document.getElementById("signupPasswordInput");
const signupConfirmPasswordInput = document.getElementById("signupConfirmPasswordInput");
const signupRoleInput = document.getElementById("signupRoleInput");
const signupStatus = document.getElementById("teacherStatus");
const portalApiUrlInput = document.getElementById("portalApiUrlInput");
const portalBootstrapSecretInput = document.getElementById("portalBootstrapSecretInput");
const storageBucketInput = document.getElementById("storageBucketInput");
const portalSetupToggleBtn = document.getElementById("portalSetupToggleBtn");
const savePortalApiBtn = document.getElementById("savePortalApiBtn");
const clearSupabaseConfigBtn = document.getElementById("clearSupabaseConfigBtn");
const portalSetupStatus = document.getElementById("portalSetupStatus");
const teacherAccess = document.getElementById("teacher-access");
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
const courseRoadmapLabel = document.getElementById("courseRoadmapLabel");
const courseRoadmapTitle = document.getElementById("courseRoadmapTitle");
const courseRoadmapCopy = document.getElementById("courseRoadmapCopy");
const courseRoadmapList = document.getElementById("courseRoadmapList");
const bioSectionLabel = document.getElementById("bioSectionLabel");
const bioSectionTitle = document.getElementById("bioSectionTitle");
const bioSectionCopy = document.getElementById("bioSectionCopy");
const assignmentSectionLabel = document.getElementById("assignmentSectionLabel");
const assignmentSectionTitle = document.getElementById("assignmentSectionTitle");
const assignmentSectionCopy = document.getElementById("assignmentSectionCopy");
const workbookSectionLabel = document.getElementById("workbookSectionLabel");
const workbookSectionTitle = document.getElementById("workbookSectionTitle");
const workbookSectionCopy = document.getElementById("workbookSectionCopy");
const resourceSectionLabel = document.getElementById("resourceSectionLabel");
const resourceSectionTitle = document.getElementById("resourceSectionTitle");
const resourceSectionCopy = document.getElementById("resourceSectionCopy");
const fileSectionLabel = document.getElementById("fileSectionLabel");
const fileSectionTitle = document.getElementById("fileSectionTitle");
const fileSectionCopy = document.getElementById("fileSectionCopy");
const feedbackSectionLabel = document.getElementById("feedbackSectionLabel");
const feedbackSectionTitle = document.getElementById("feedbackSectionTitle");
const feedbackSectionCopy = document.getElementById("feedbackSectionCopy");

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

function getEmailConfirmationRedirectUrl() {
  const { protocol, hostname, origin, pathname } = window.location;
  const isLocalHost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0";

  if ((protocol === "https:" || protocol === "http:") && !isLocalHost) {
    return `${origin}${pathname}`;
  }

  return DEFAULT_CONFIRMATION_REDIRECT_URL;
}

function hasSupabaseConfig() {
  return Boolean(settings.supabaseUrl && settings.supabaseAnonKey);
}

function shouldShowPortalSetupByDefault() {
  return false;
}

function syncSettingsInputs() {
  portalApiUrlInput.value = settings.supabaseUrl || "";
  portalBootstrapSecretInput.value = settings.supabaseAnonKey || "";
  storageBucketInput.value = settings.storageBucket || DEFAULT_STORAGE_BUCKET;
  studentIdInput.value = settings.lastAuthEmail || "";
}

function updatePortalSetupVisibility(forceOpen = false) {
  if (!teacherAccess || !portalSetupToggleBtn) return;
  const shouldShow = forceOpen || shouldShowPortalSetupByDefault();
  teacherAccess.hidden = !shouldShow;
  portalSetupToggleBtn.textContent = shouldShow
    ? "Hide Advanced Connection Settings"
    : "Advanced Connection Settings";
  portalSetupToggleBtn.setAttribute("aria-expanded", String(shouldShow));
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

function scrollPortalWelcomeIntoView() {
  const scrollToPortal = () =>
    studentPortal?.scrollIntoView({ behavior: "smooth", block: "start" });

  scrollToPortal();
  requestAnimationFrame(scrollToPortal);
  setTimeout(scrollToPortal, 120);
}

function updateAuthenticatedView(isAuthenticated) {
  if (loginGate) {
    loginGate.hidden = isAuthenticated;
  }

  if (heroGrid) {
    heroGrid.classList.toggle("authenticated", isAuthenticated);
  }

  if (!isAuthenticated) {
    clearStatus(studentLoginStatus);
    clearStatus(signupStatus);
  }
}

function getSupabase() {
  if (!supabaseClient) {
    throw new Error("Save your Supabase settings first.");
  }
  return supabaseClient;
}

function createWelcomeCopy(role, name) {
  if (role === "instructor") {
    return `${name} has a secure instructor home base for pacing, lesson delivery, facilitation notes, and implementation reflection across the full 16-week course.`;
  }
  return `${name} has a secure student home base for weekly assignments, workbook reflections, personal files, and saved feedback across the full 16-week course.`;
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

function portalCopyForRole(role) {
  return ROLE_PORTAL_COPY[role] || ROLE_PORTAL_COPY.student;
}

function renderCourseRoadmap(role) {
  if (!courseRoadmapList) return;

  const isInstructor = role === "instructor";
  courseRoadmapList.innerHTML = COURSE_WEEKS.map(
    (week) => `
      <article class="week-card">
        <div class="week-head">
          <div>
            <div class="mini-label">${escapeHtml(week.module)}</div>
            <h4>${escapeHtml(week.title)}</h4>
          </div>
          <span class="week-number">Week ${week.week}</span>
        </div>
        <p class="week-focus">${escapeHtml(week.focus)}</p>
        <div class="week-list">
          <section class="week-list-block">
            <strong>${isInstructor ? "Student experience this week" : "What you will do"}</strong>
            <ul>
              ${(isInstructor ? week.studentActions : week.studentActions)
                .map((item) => `<li>${escapeHtml(item)}</li>`)
                .join("")}
            </ul>
          </section>
          <section class="week-list-block">
            <strong>${isInstructor ? "What to look for" : "What shows your growth"}</strong>
            <ul>
              ${(isInstructor ? week.studentEvidence : week.studentEvidence)
                .map((item) => `<li>${escapeHtml(item)}</li>`)
                .join("")}
            </ul>
          </section>
          ${
            isInstructor
              ? `
                <section class="week-list-block">
                  <strong>How to facilitate it</strong>
                  <ul>
                    ${week.instructorMoves.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                  </ul>
                </section>
                <section class="week-list-block">
                  <strong>Prep before you teach</strong>
                  <ul>
                    ${week.instructorPrep.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                  </ul>
                </section>
              `
              : `
                <section class="week-list-block">
                  <strong>Why it matters</strong>
                  <ul>
                    ${week.instructorMoves.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                  </ul>
                </section>
                <section class="week-list-block">
                  <strong>How to prepare yourself</strong>
                  <ul>
                    ${week.instructorPrep.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                  </ul>
                </section>
              `
          }
        </div>
      </article>
    `,
  ).join("");
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

async function loadPortalData(defaults = null, options = {}) {
  const user = state.user;
  if (!user) return;

  const { scrollToWelcome = false } = options;

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
  renderPortal({ scrollToWelcome });
}

function renderLoggedOutState() {
  state.session = null;
  state.user = null;
  state.profile = null;
  state.assignments = [];
  state.workbookEntries = [];
  state.files = [];
  updateAuthenticatedView(false);
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
  await loadPortalData(null, { scrollToWelcome: true });
}

function renderPortal(options = {}) {
  const { scrollToWelcome = false } = options;

  if (!state.profile) {
    updateAuthenticatedView(false);
    studentPortal.classList.remove("visible");
    return;
  }

  updateAuthenticatedView(true);
  studentPortal.classList.add("visible");
  studentPortal.classList.toggle("instructor-view", state.profile.role === "instructor");
  studentPortal.classList.toggle("student-view", state.profile.role !== "instructor");

  const profile = state.profile;
  const roleCopy = portalCopyForRole(profile.role);
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

  courseRoadmapLabel.textContent = roleCopy.roadmapLabel;
  courseRoadmapTitle.textContent = roleCopy.roadmapTitle;
  courseRoadmapCopy.textContent = roleCopy.roadmapCopy;
  bioSectionLabel.textContent = roleCopy.bioLabel;
  bioSectionTitle.textContent = roleCopy.bioTitle;
  bioSectionCopy.textContent = roleCopy.bioCopy;
  assignmentSectionLabel.textContent = roleCopy.assignmentLabel;
  assignmentSectionTitle.textContent = roleCopy.assignmentTitle;
  assignmentSectionCopy.textContent = roleCopy.assignmentCopy;
  workbookSectionLabel.textContent = roleCopy.workbookLabel;
  workbookSectionTitle.textContent = roleCopy.workbookTitle;
  workbookSectionCopy.textContent = roleCopy.workbookCopy;
  resourceSectionLabel.textContent = roleCopy.resourceLabel;
  resourceSectionTitle.textContent = roleCopy.resourceTitle;
  resourceSectionCopy.textContent = roleCopy.resourceCopy;
  fileSectionLabel.textContent = roleCopy.fileLabel;
  fileSectionTitle.textContent = roleCopy.fileTitle;
  fileSectionCopy.textContent = roleCopy.fileCopy;
  feedbackSectionLabel.textContent = roleCopy.feedbackLabel;
  feedbackSectionTitle.textContent = roleCopy.feedbackTitle;
  feedbackSectionCopy.textContent = roleCopy.feedbackCopy;
  renderCourseRoadmap(profile.role);

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
  if (scrollToWelcome) {
    scrollPortalWelcomeIntoView();
  }
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
  const confirmPassword = signupConfirmPasswordInput.value.trim();
  const role = signupRoleInput.value;
  const cohort = defaultCohortForRole(role);
  const track = defaultTrackForRole(role);

  if (!name || !email || !password || !confirmPassword) {
    showStatus(signupStatus, "Add your name, email, password, and password confirmation first.");
    return;
  }

  if (password !== confirmPassword) {
    showStatus(signupStatus, "Your password and confirmation need to match.");
    return;
  }

  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getEmailConfirmationRedirectUrl(),
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
    updatePortalSetupVisibility(false);
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
  updatePortalSetupVisibility(false);
});

portalSetupToggleBtn?.addEventListener("click", () => {
  if (teacherAccess.hidden) {
    const entered = window.prompt("Enter the security access key to open advanced settings:");
    if (String(entered || "").trim() !== ADVANCED_SETTINGS_ACCESS_KEY) {
      showStatus(portalSetupStatus, "Security access key not accepted.");
      updatePortalSetupVisibility(false);
      return;
    }
  }

  const willShow = teacherAccess.hidden;
  teacherAccess.hidden = !willShow;
  portalSetupToggleBtn.textContent = willShow
    ? "Hide Advanced Connection Settings"
    : "Advanced Connection Settings";
  portalSetupToggleBtn.setAttribute("aria-expanded", String(willShow));
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
updatePortalSetupVisibility();

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
