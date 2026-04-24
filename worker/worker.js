const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;
const RESOURCE_LIBRARY = [
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

const WORKBOOK_PROMPTS = [
  {
    id: "weekly-reset",
    title: "Weekly Reset",
    prompt:
      "What real-life moment challenged you most this week, and what would your strongest self do next time?",
    sortOrder: 10,
  },
  {
    id: "identity-build",
    title: "Identity Builder",
    prompt:
      "What kind of person are you becoming through this program, and what proof do you already have?",
    sortOrder: 20,
  },
  {
    id: "coaching-bridge",
    title: "Coaching Bridge",
    prompt:
      "What teacher feedback are you going to act on immediately, and what will it look like in action?",
    sortOrder: 30,
  },
];

const STUDENT_SEEDS = [
  {
    id: "ava-james",
    accessCode: "RFRL-701",
    name: "Ava James",
    cohort: "Spring 2026 Vanguard Cohort",
    track: "Foundations Track",
    avatar: "🚀",
    welcomeTitle: "Welcome to the Vanguard, Ava.",
    welcomeCopy:
      "You are not just taking a class. You are building the kind of judgment, character, and real-world readiness people remember. Every finished assignment is proof that you are becoming someone strong, reliable, and hard to shake.",
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
        sortOrder: 10,
      },
      {
        id: "digital-reputation",
        title: "Digital Reputation Reflection",
        objective:
          "Analyze one online choice and show how it affects credibility, opportunity, and self-respect.",
        dueLabel: "Due Friday",
        rubricFocus: "Self-awareness, judgment, real-life transfer",
        sortOrder: 20,
      },
      {
        id: "repair-move",
        title: "Repair Move Practice",
        objective:
          "Write and rehearse an accountable repair response after a mistake or conflict.",
        dueLabel: "Due next Monday",
        rubricFocus: "Ownership, communication, follow-through",
        sortOrder: 30,
      },
    ],
  },
  {
    id: "jaden-ortega",
    accessCode: "RFRL-884",
    name: "Jaden Ortega",
    cohort: "Spring 2026 Vanguard Cohort",
    track: "Leadership Track",
    avatar: "🛡️",
    welcomeTitle: "Your leadership lane is opening up, Jaden.",
    welcomeCopy:
      "This portal is your personal operations room. The more seriously you take the reflections, assignments, and coaching here, the more prepared you become for the moments where other people will count on you to choose well.",
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
        sortOrder: 10,
      },
      {
        id: "authority-feedback",
        title: "Authority & Feedback Response",
        objective:
          "Show how to respond well when corrected by a teacher, coach, or supervisor.",
        dueLabel: "Due Friday",
        rubricFocus: "Coachability, professionalism, self-control",
        sortOrder: 20,
      },
      {
        id: "family-duty",
        title: "Family Responsibility Planning",
        objective:
          "Map a decision that balances school, family responsibility, and future opportunity.",
        dueLabel: "Due next Monday",
        rubricFocus: "Trade-offs, planning, maturity",
        sortOrder: 30,
      },
    ],
  },
  {
    id: "mia-thomas",
    accessCode: "RFRL-552",
    name: "Mia Thomas",
    cohort: "Spring 2026 Trailblazer Cohort",
    track: "Confidence & Communication Track",
    avatar: "✨",
    welcomeTitle: "You belong here, Mia.",
    welcomeCopy:
      "This is your place to grow your voice, sharpen your choices, and finish with something to be deeply proud of. Every reflection, draft, and feedback note here is part of your evidence that you are becoming stronger in real life.",
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
        sortOrder: 10,
      },
      {
        id: "pause-label-reframe",
        title: "Pause-Label-Reframe Journal",
        objective:
          "Use the regulation model to process a real moment of frustration and write a wiser response.",
        dueLabel: "Due Friday",
        rubricFocus: "Self-regulation, reflection, honesty",
        sortOrder: 20,
      },
      {
        id: "future-self-letter",
        title: "Future Self Letter",
        objective:
          "Write to your future self about the kind of reputation and character you are building now.",
        dueLabel: "Due next Monday",
        rubricFocus: "Identity, long-view thinking, pride",
        sortOrder: 30,
      },
    ],
  },
];

function buildCorsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = String(env.ALLOWED_ORIGIN || "*")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const allowOrigin =
    allowed.includes("*") || (origin && allowed.includes(origin))
      ? origin || "*"
      : allowed[0] || "*";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(data, status, corsHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function nowIso() {
  return new Date().toISOString();
}

function plusMs(ms) {
  return new Date(Date.now() + ms).toISOString();
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function normalizePath(pathname) {
  return pathname.replace(/\/+$/, "") || "/";
}

function ensureDb(env) {
  if (!env.PORTAL_DB) {
    throw new Error("PORTAL_DB binding is missing.");
  }
  return env.PORTAL_DB;
}

async function sha256(value) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hashSecret(value, env) {
  const pepper = env.PORTAL_AUTH_PEPPER || env.APP_SECRET || "rfrl-portal-pepper";
  return sha256(`${pepper}:${value}`);
}

function randomToken() {
  return `${crypto.randomUUID()}${crypto.randomUUID().replaceAll("-", "")}`;
}

async function createSession(env, role, studentId = null) {
  const db = ensureDb(env);
  const token = randomToken();
  const tokenHash = await hashSecret(token, env);
  const sessionId = crypto.randomUUID();
  const createdAt = nowIso();
  const expiresAt = plusMs(SESSION_TTL_MS);

  await db
    .prepare(
      `INSERT INTO sessions (
        id, role, student_id, token_hash, created_at, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(sessionId, role, studentId, tokenHash, createdAt, expiresAt)
    .run();

  return { token, expiresAt };
}

async function requireSession(request, env, expectedRole = null) {
  const auth = request.headers.get("Authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return null;
  }

  const db = ensureDb(env);
  const tokenHash = await hashSecret(match[1], env);
  const session = await db
    .prepare(
      `SELECT id, role, student_id AS studentId, expires_at AS expiresAt
       FROM sessions
       WHERE token_hash = ? AND expires_at > ?`,
    )
    .bind(tokenHash, nowIso())
    .first();

  if (!session) {
    return null;
  }

  if (expectedRole && session.role !== expectedRole) {
    return { forbidden: true };
  }

  return session;
}

async function deleteSession(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) return;
  const db = ensureDb(env);
  const tokenHash = await hashSecret(match[1], env);
  await db.prepare(`DELETE FROM sessions WHERE token_hash = ?`).bind(tokenHash).run();
}

async function loadAssignments(db, studentId) {
  const { results } = await db
    .prepare(
      `SELECT
         assignment_id AS id,
         title,
         objective,
         due_label AS dueLabel,
         rubric_focus AS rubricFocus,
         sort_order AS sortOrder,
         submission,
         ready_for_review AS readyForReview,
         review_status AS reviewStatus,
         review_score AS reviewScore,
         review_celebration AS reviewCelebration,
         review_coaching AS reviewCoaching,
         updated_at AS updatedAt,
         reviewed_at AS reviewedAt
       FROM student_assignments
       WHERE student_id = ?
       ORDER BY sort_order ASC, assignment_id ASC`,
    )
    .bind(studentId)
    .all();

  return results.map((row) => ({
    id: row.id,
    title: row.title,
    objective: row.objective,
    dueLabel: row.dueLabel,
    rubricFocus: row.rubricFocus,
    sortOrder: row.sortOrder,
    submission: row.submission || "",
    readyForReview: Boolean(row.readyForReview),
    updatedAt: row.updatedAt || "",
    review: {
      status: row.reviewStatus || "Not reviewed",
      score: row.reviewScore || "",
      celebration: row.reviewCelebration || "",
      coaching: row.reviewCoaching || "",
      reviewedAt: row.reviewedAt || "",
    },
  }));
}

async function loadWorkbookPrompts(db, studentId) {
  const { results } = await db
    .prepare(
      `SELECT
         p.id,
         p.title,
         p.prompt,
         p.sort_order AS sortOrder,
         COALESCE(e.response, '') AS response,
         COALESCE(e.updated_at, '') AS updatedAt
       FROM workbook_prompts p
       LEFT JOIN student_workbook_entries e
         ON e.prompt_id = p.id AND e.student_id = ?
       ORDER BY p.sort_order ASC, p.id ASC`,
    )
    .bind(studentId)
    .all();

  return results;
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

async function buildStudentPayload(db, studentId) {
  const student = await db
    .prepare(
      `SELECT
         id,
         display_name AS name,
         cohort,
         track,
         avatar,
         welcome_title AS welcomeTitle,
         welcome_copy AS welcomeCopy,
         bio_proud AS proud,
         bio_goal AS goal,
         bio_strengths AS strengths,
         bio_support AS support
       FROM students
       WHERE id = ? AND active = 1`,
    )
    .bind(studentId)
    .first();

  if (!student) {
    return null;
  }

  const assignments = await loadAssignments(db, studentId);
  const workbookPrompts = await loadWorkbookPrompts(db, studentId);
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
      bio: {
        proud: student.proud || "",
        goal: student.goal || "",
        strengths: student.strengths || "",
        support: student.support || "",
      },
    },
    assignments,
    workbookPrompts,
    resources: RESOURCE_LIBRARY,
    feedback: buildFeedback(assignments),
    progress,
  };
}

async function handleLegacyFeedback(request, env, corsHeaders) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const payload = await readJson(request);
  if (!payload) {
    return json({ error: "Invalid JSON" }, 400, corsHeaders);
  }

  const systemPrompt = `You are an instructional coach for a decision-making course. Provide concise, supportive feedback.
Return JSON only with keys: feedback (string), options (array of 2-3 strings), video_query (string).
Make feedback specific to the student's tool/concept/why and the scenario stakes.
Options should be actionable next-step choices.`;

  const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(payload) },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!openAiResponse.ok) {
    return json(
      {
        error: "OpenAI request failed",
        details: await openAiResponse.text(),
      },
      502,
      corsHeaders,
    );
  }

  const data = await openAiResponse.json();
  return new Response(data?.choices?.[0]?.message?.content || "{}", {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

async function bootstrapPortal(env) {
  const db = ensureDb(env);
  const timestamp = nowIso();

  for (const prompt of WORKBOOK_PROMPTS) {
    await db
      .prepare(
        `INSERT INTO workbook_prompts (id, title, prompt, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           title = excluded.title,
           prompt = excluded.prompt,
           sort_order = excluded.sort_order,
           updated_at = excluded.updated_at`,
      )
      .bind(
        prompt.id,
        prompt.title,
        prompt.prompt,
        prompt.sortOrder,
        timestamp,
        timestamp,
      )
      .run();
  }

  for (const student of STUDENT_SEEDS) {
    await db
      .prepare(
        `INSERT INTO students (
          id, display_name, cohort, track, avatar, welcome_title, welcome_copy,
          bio_proud, bio_goal, bio_strengths, bio_support, active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          display_name = excluded.display_name,
          cohort = excluded.cohort,
          track = excluded.track,
          avatar = excluded.avatar,
          welcome_title = excluded.welcome_title,
          welcome_copy = excluded.welcome_copy,
          bio_proud = excluded.bio_proud,
          bio_goal = excluded.bio_goal,
          bio_strengths = excluded.bio_strengths,
          bio_support = excluded.bio_support,
          active = 1,
          updated_at = excluded.updated_at`,
      )
      .bind(
        student.id,
        student.name,
        student.cohort,
        student.track,
        student.avatar,
        student.welcomeTitle,
        student.welcomeCopy,
        student.bio.proud,
        student.bio.goal,
        student.bio.strengths,
        student.bio.support,
        timestamp,
        timestamp,
      )
      .run();

    const accessCodeHash = await hashSecret(student.accessCode, env);
    await db
      .prepare(
        `INSERT INTO student_credentials (student_id, access_code_hash, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(student_id) DO UPDATE SET
           access_code_hash = excluded.access_code_hash,
           updated_at = excluded.updated_at`,
      )
      .bind(student.id, accessCodeHash, timestamp)
      .run();

    for (const assignment of student.assignments) {
      await db
        .prepare(
          `INSERT INTO student_assignments (
            student_id, assignment_id, title, objective, due_label, rubric_focus,
            sort_order, submission, ready_for_review, review_status, review_score,
            review_celebration, review_coaching, updated_at, reviewed_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, '', 0, 'Not reviewed', '', '', '', ?, '')
          ON CONFLICT(student_id, assignment_id) DO UPDATE SET
            title = excluded.title,
            objective = excluded.objective,
            due_label = excluded.due_label,
            rubric_focus = excluded.rubric_focus,
            sort_order = excluded.sort_order`,
        )
        .bind(
          student.id,
          assignment.id,
          assignment.title,
          assignment.objective,
          assignment.dueLabel,
          assignment.rubricFocus,
          assignment.sortOrder,
          timestamp,
        )
        .run();
    }

    for (const prompt of WORKBOOK_PROMPTS) {
      await db
        .prepare(
          `INSERT OR IGNORE INTO student_workbook_entries (student_id, prompt_id, response, updated_at)
           VALUES (?, ?, '', ?)`,
        )
        .bind(student.id, prompt.id, timestamp)
        .run();
    }
  }
}

async function handlePortalAuthLogin(request, env, corsHeaders) {
  const payload = await readJson(request);
  if (!payload?.studentId || !payload?.accessCode) {
    return json({ error: "Student ID and access code are required." }, 400, corsHeaders);
  }

  const db = ensureDb(env);
  const student = await db
    .prepare(
      `SELECT s.id
       FROM students s
       JOIN student_credentials c ON c.student_id = s.id
       WHERE s.id = ? AND c.access_code_hash = ? AND s.active = 1`,
    )
    .bind(String(payload.studentId).trim().toLowerCase(), await hashSecret(String(payload.accessCode).trim(), env))
    .first();

  if (!student) {
    return json({ error: "Student ID or access code did not match." }, 401, corsHeaders);
  }

  const session = await createSession(env, "student", student.id);
  const portal = await buildStudentPayload(db, student.id);
  return json({ token: session.token, expiresAt: session.expiresAt, portal }, 200, corsHeaders);
}

async function handleTeacherLogin(request, env, corsHeaders) {
  const payload = await readJson(request);
  const enteredPin = String(payload?.pin || "").trim();
  const expectedPin = String(env.TEACHER_PORTAL_PIN || "").trim();

  if (!expectedPin) {
    return json({ error: "Teacher PIN is not configured in the worker." }, 500, corsHeaders);
  }

  if (!enteredPin || enteredPin !== expectedPin) {
    return json({ error: "Teacher PIN did not match." }, 401, corsHeaders);
  }

  const session = await createSession(env, "teacher");
  return json({ token: session.token, expiresAt: session.expiresAt }, 200, corsHeaders);
}

async function handleStudentMe(request, env, corsHeaders) {
  const session = await requireSession(request, env, "student");
  if (!session) return json({ error: "Unauthorized." }, 401, corsHeaders);
  if (session.forbidden) return json({ error: "Forbidden." }, 403, corsHeaders);
  const portal = await buildStudentPayload(ensureDb(env), session.studentId);
  if (!portal) return json({ error: "Student record not found." }, 404, corsHeaders);
  return json(portal, 200, corsHeaders);
}

async function handleStudentBio(request, env, corsHeaders) {
  const session = await requireSession(request, env, "student");
  if (!session) return json({ error: "Unauthorized." }, 401, corsHeaders);
  const payload = await readJson(request);
  if (!payload) return json({ error: "Invalid JSON." }, 400, corsHeaders);

  await ensureDb(env)
    .prepare(
      `UPDATE students
       SET bio_proud = ?, bio_goal = ?, bio_strengths = ?, bio_support = ?, updated_at = ?
       WHERE id = ?`,
    )
    .bind(
      String(payload.proud || "").trim(),
      String(payload.goal || "").trim(),
      String(payload.strengths || "").trim(),
      String(payload.support || "").trim(),
      nowIso(),
      session.studentId,
    )
    .run();

  return handleStudentMe(request, env, corsHeaders);
}

async function handleStudentAssignment(request, env, corsHeaders, assignmentId) {
  const session = await requireSession(request, env, "student");
  if (!session) return json({ error: "Unauthorized." }, 401, corsHeaders);
  const payload = await readJson(request);
  if (!payload) return json({ error: "Invalid JSON." }, 400, corsHeaders);

  const submission = String(payload.submission || "").trim();
  const readyForReview = payload.readyForReview === true;
  const updatedAt = nowIso();

  const existing = await ensureDb(env)
    .prepare(
      `SELECT review_status AS reviewStatus
       FROM student_assignments
       WHERE student_id = ? AND assignment_id = ?`,
    )
    .bind(session.studentId, assignmentId)
    .first();

  if (!existing) {
    return json({ error: "Assignment not found." }, 404, corsHeaders);
  }

  const nextReviewStatus =
    readyForReview && existing.reviewStatus === "Not reviewed"
      ? "In review"
      : existing.reviewStatus;

  await ensureDb(env)
    .prepare(
      `UPDATE student_assignments
       SET submission = ?, ready_for_review = ?, review_status = ?, updated_at = ?
       WHERE student_id = ? AND assignment_id = ?`,
    )
    .bind(
      submission,
      readyForReview ? 1 : 0,
      nextReviewStatus,
      updatedAt,
      session.studentId,
      assignmentId,
    )
    .run();

  return handleStudentMe(request, env, corsHeaders);
}

async function handleStudentWorkbook(request, env, corsHeaders, promptId) {
  const session = await requireSession(request, env, "student");
  if (!session) return json({ error: "Unauthorized." }, 401, corsHeaders);
  const payload = await readJson(request);
  if (!payload) return json({ error: "Invalid JSON." }, 400, corsHeaders);

  await ensureDb(env)
    .prepare(
      `UPDATE student_workbook_entries
       SET response = ?, updated_at = ?
       WHERE student_id = ? AND prompt_id = ?`,
    )
    .bind(
      String(payload.response || "").trim(),
      nowIso(),
      session.studentId,
      promptId,
    )
    .run();

  return handleStudentMe(request, env, corsHeaders);
}

async function handleTeacherStudents(request, env, corsHeaders) {
  const session = await requireSession(request, env, "teacher");
  if (!session) return json({ error: "Unauthorized." }, 401, corsHeaders);
  const db = ensureDb(env);
  const { results } = await db
    .prepare(
      `SELECT
         s.id,
         s.display_name AS name,
         s.cohort,
         s.track,
         s.avatar,
         COALESCE(a.assignment_count, 0) AS assignmentCount,
         COALESCE(a.approved_count, 0) AS approvedCount,
         COALESCE(w.workbook_done, 0) AS workbookDone
       FROM students s
       LEFT JOIN (
         SELECT
           student_id,
           COUNT(*) AS assignment_count,
           SUM(CASE
             WHEN review_status IN ('Approved', 'Exceeds expectations') THEN 1
             ELSE 0
           END) AS approved_count
         FROM student_assignments
         GROUP BY student_id
       ) a ON a.student_id = s.id
       LEFT JOIN (
         SELECT
           student_id,
           SUM(CASE
             WHEN TRIM(COALESCE(response, '')) != '' THEN 1
             ELSE 0
           END) AS workbook_done
         FROM student_workbook_entries
         GROUP BY student_id
       ) w ON w.student_id = s.id
       WHERE s.active = 1
       ORDER BY s.display_name ASC`,
    )
    .all();

  const workbookTotal = WORKBOOK_PROMPTS.length;
  return json(
    {
      students: results.map((row) => {
        const assignmentCount = Number(row.assignmentCount || 0);
        const total = assignmentCount + workbookTotal;
        const completed =
          Number(row.approvedCount || 0) + Number(row.workbookDone || 0);
        return {
          id: row.id,
          name: row.name,
          cohort: row.cohort,
          track: row.track,
          avatar: row.avatar,
          progress: {
            completed,
            total,
            percent: total ? Math.round((completed / total) * 100) : 0,
          },
        };
      }),
    },
    200,
    corsHeaders,
  );
}

async function handleTeacherStudent(request, env, corsHeaders, studentId) {
  const session = await requireSession(request, env, "teacher");
  if (!session) return json({ error: "Unauthorized." }, 401, corsHeaders);
  const portal = await buildStudentPayload(ensureDb(env), studentId);
  if (!portal) return json({ error: "Student not found." }, 404, corsHeaders);
  return json(portal, 200, corsHeaders);
}

async function handleTeacherReview(request, env, corsHeaders, studentId, assignmentId) {
  const session = await requireSession(request, env, "teacher");
  if (!session) return json({ error: "Unauthorized." }, 401, corsHeaders);
  const payload = await readJson(request);
  if (!payload) return json({ error: "Invalid JSON." }, 400, corsHeaders);

  await ensureDb(env)
    .prepare(
      `UPDATE student_assignments
       SET review_status = ?, review_score = ?, review_celebration = ?, review_coaching = ?,
           reviewed_at = ?, updated_at = ?, ready_for_review = CASE
             WHEN ? IN ('Approved', 'Exceeds expectations', 'Needs revision', 'In review')
             THEN 1 ELSE ready_for_review END
       WHERE student_id = ? AND assignment_id = ?`,
    )
    .bind(
      String(payload.status || "Not reviewed"),
      String(payload.score || "").trim(),
      String(payload.celebration || "").trim(),
      String(payload.coaching || "").trim(),
      nowIso(),
      nowIso(),
      String(payload.status || "Not reviewed"),
      studentId,
      assignmentId,
    )
    .run();

  return handleTeacherStudent(request, env, corsHeaders, studentId);
}

async function handleBootstrap(request, env, corsHeaders) {
  const payload = await readJson(request);
  const providedSecret = String(payload?.secret || "").trim();
  const expectedSecret = String(env.PORTAL_BOOTSTRAP_SECRET || "").trim();

  if (!expectedSecret) {
    return json({ error: "PORTAL_BOOTSTRAP_SECRET is not configured." }, 500, corsHeaders);
  }
  if (!providedSecret || providedSecret !== expectedSecret) {
    return json({ error: "Bootstrap secret did not match." }, 401, corsHeaders);
  }

  await bootstrapPortal(env);
  return json(
    {
      ok: true,
      studentsSeeded: STUDENT_SEEDS.length,
      workbookPromptsSeeded: WORKBOOK_PROMPTS.length,
    },
    200,
    corsHeaders,
  );
}

export default {
  async fetch(request, env) {
    const corsHeaders = buildCorsHeaders(request, env);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = normalizePath(url.pathname);

    if (path === "/" || path === "/feedback") {
      return handleLegacyFeedback(request, env, corsHeaders);
    }

    try {
      if (path === "/portal/health" && request.method === "GET") {
        return json({ ok: true, service: "student-portal-api" }, 200, corsHeaders);
      }

      if (path === "/portal/admin/bootstrap" && request.method === "POST") {
        return handleBootstrap(request, env, corsHeaders);
      }

      if (path === "/portal/auth/login" && request.method === "POST") {
        return handlePortalAuthLogin(request, env, corsHeaders);
      }

      if (path === "/portal/auth/logout" && request.method === "POST") {
        await deleteSession(request, env);
        return json({ ok: true }, 200, corsHeaders);
      }

      if (path === "/portal/teacher/login" && request.method === "POST") {
        return handleTeacherLogin(request, env, corsHeaders);
      }

      if (path === "/portal/student/me" && request.method === "GET") {
        return handleStudentMe(request, env, corsHeaders);
      }

      if (path === "/portal/student/bio" && request.method === "PUT") {
        return handleStudentBio(request, env, corsHeaders);
      }

      const studentAssignmentMatch = path.match(/^\/portal\/student\/assignments\/([^/]+)$/);
      if (studentAssignmentMatch && request.method === "PUT") {
        return handleStudentAssignment(
          request,
          env,
          corsHeaders,
          decodeURIComponent(studentAssignmentMatch[1]),
        );
      }

      const studentWorkbookMatch = path.match(/^\/portal\/student\/workbook\/([^/]+)$/);
      if (studentWorkbookMatch && request.method === "PUT") {
        return handleStudentWorkbook(
          request,
          env,
          corsHeaders,
          decodeURIComponent(studentWorkbookMatch[1]),
        );
      }

      if (path === "/portal/teacher/students" && request.method === "GET") {
        return handleTeacherStudents(request, env, corsHeaders);
      }

      const teacherStudentMatch = path.match(/^\/portal\/teacher\/students\/([^/]+)$/);
      if (teacherStudentMatch && request.method === "GET") {
        return handleTeacherStudent(
          request,
          env,
          corsHeaders,
          decodeURIComponent(teacherStudentMatch[1]),
        );
      }

      const teacherReviewMatch = path.match(
        /^\/portal\/teacher\/students\/([^/]+)\/assignments\/([^/]+)\/review$/,
      );
      if (teacherReviewMatch && request.method === "PUT") {
        return handleTeacherReview(
          request,
          env,
          corsHeaders,
          decodeURIComponent(teacherReviewMatch[1]),
          decodeURIComponent(teacherReviewMatch[2]),
        );
      }

      return json({ error: "Not found." }, 404, corsHeaders);
    } catch (error) {
      return json(
        {
          error: "Server error.",
          details: error instanceof Error ? error.message : String(error),
        },
        500,
        corsHeaders,
      );
    }
  },
};
