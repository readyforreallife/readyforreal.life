const PORTAL_SETTINGS_KEY = "rfrl-student-portal-supabase-v1";
const PAGE_ENTRY_MODE = new URLSearchParams(window.location.search).get("entry") || "";
const EXPECTED_PORTAL_ROLE = PAGE_ENTRY_MODE === "instructor" ? "instructor" : "student";
const PAGE_HASH = window.location.hash || "";
const DEFAULT_STORAGE_BUCKET = "portal-files";
const COMMUNITY_PROFILE_BUCKET = "community-profiles";
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
      title: "POCC Decision Practice",
      objective:
        "Learn the POCC decision sequence, use it on a realistic pressure moment, and explain the choice you would make.",
      due_label: "Due this week",
      rubric_focus: "Pause, options, consequences, choice, accountability",
      student_steps: [
        "Learn it: POCC means Pause, Options, Consequences, Choose.",
        "Pick one realistic pressure moment: a friend pushes you, someone posts something about you, you are tempted to lie, or you are angry and want to react.",
        "Write one sentence for each POCC step before you choose.",
        "End with the exact words or action you would use.",
      ],
      student_resources: [
        "Use the Week 11 roadmap card: Use POCC for better online decisions.",
        "Use any class notes or workbook examples about decision-making, digital choices, or conflict pressure.",
      ],
      student_prompt:
        "Situation: ____. Pause: ____. Options: ____. Consequences: ____. Choose: ____. Why this protects my future self: ____.",
      sort_order: 10,
    },
    {
      id: "digital-reputation",
      title: "Digital Reputation Investigation",
      objective:
        "Study one online choice, then explain how it can affect credibility, opportunity, and self-respect.",
      due_label: "Due Friday",
      rubric_focus: "Self-awareness, judgment, real-life transfer",
      student_steps: [
        "Learn it: a digital choice can be a post, comment, like, share, screenshot, username, message, or photo.",
        "Choose one example. It can be a made-up example, a public example discussed in class, or one of your own choices without naming private people.",
        "Analyze it with three questions: What does this make people believe about me? What opportunity could it help or hurt? Does it match the person I want to become?",
        "Write one stronger replacement choice.",
      ],
      student_resources: [
        "Use the Week 10 roadmap card: See the long life of digital choices.",
        "Use the Week 12 roadmap card if your example involves repair, deleting, apologizing, or changing a habit.",
      ],
      student_prompt:
        "Online choice I am analyzing: ____. Credibility effect: ____. Opportunity effect: ____. Self-respect effect: ____. Better choice next time: ____.",
      sort_order: 20,
    },
    {
      id: "repair-move",
      title: "Accountability and Repair Practice",
      objective:
        "Write a repair response that owns the mistake, explains the impact, and names the follow-through.",
      due_label: "Due next Monday",
      rubric_focus: "Ownership, communication, follow-through",
      student_steps: [
        "Choose a school, home, friendship, work, or online mistake someone could realistically make.",
        "Write what happened without excuses.",
        "Name who was affected and how.",
        "Write the repair move: apology, changed behavior, replacement action, or follow-up check-in.",
      ],
      student_resources: [
        "Use the Week 9 roadmap card: Practice accountability and repair.",
        "Use conflict language from Weeks 7-8 if the repair involves another person.",
      ],
      student_prompt:
        "What happened: ____. Who was affected: ____. My accountable words: ____. My follow-through action: ____.",
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

const DOCUMENT_SUBMISSION_TEMPLATES = [
  {
    key: "participant-workbook",
    title: "Participant Workbook",
    type: "workbook",
    fields: [
      { id: "section", label: "Workbook section, activity, or page", kind: "text" },
      { id: "written_response", label: "Written response", kind: "textarea" },
      { id: "reflection", label: "Reflection or evidence of growth", kind: "textarea" },
      {
        id: "completion_checks",
        label: "Completion checks",
        kind: "checks",
        options: [
          "I completed the requested activity.",
          "I checked my response for honesty and detail.",
          "I am ready for instructor review.",
        ],
      },
    ],
  },
  {
    key: "casel-survey",
    title: "CASEL Self-Efficacy Survey",
    type: "survey",
    fields: [
      {
        id: "survey_phase",
        label: "Survey timing",
        kind: "choice",
        options: ["Pre-Course", "Post-Course"],
      },
      { id: "grade_track", label: "Grade / track", kind: "text" },
      {
        id: "casel_scores",
        label: "Enter your scores or summary of selected ratings",
        kind: "textarea",
      },
      {
        id: "growth_notes",
        label: "What did you notice about your growth?",
        kind: "textarea",
      },
    ],
  },
  {
    key: "scenario-cards",
    title: "Scenario Card Response",
    type: "scenario",
    fields: [
      { id: "scenario_title", label: "Scenario card or prompt", kind: "text" },
      { id: "response_choice", label: "What would you do?", kind: "textarea" },
      { id: "reasoning", label: "Why is that the strongest response?", kind: "textarea" },
      {
        id: "framework_used",
        label: "Framework used",
        kind: "checks",
        options: ["PLRR", "POCC", "Respectful communication", "Repair move"],
      },
    ],
  },
  {
    key: "manners-in-motion",
    title: "Manners in Motion Challenge",
    type: "challenge",
    fields: [
      { id: "challenge", label: "Challenge card or action", kind: "text" },
      { id: "what_happened", label: "What happened when you tried it?", kind: "textarea" },
      { id: "next_time", label: "What will you improve next time?", kind: "textarea" },
      {
        id: "completed",
        label: "Completion",
        kind: "checks",
        options: ["I attempted the challenge.", "I reflected on the result."],
      },
    ],
  },
  {
    key: "registration-intake",
    title: "Registration and Intake Form",
    type: "intake",
    fields: [
      { id: "organization", label: "School / organization", kind: "text" },
      { id: "track", label: "Implementation track", kind: "text" },
      { id: "needs", label: "Needs, goals, or context", kind: "textarea" },
      {
        id: "agreements",
        label: "Acknowledgements",
        kind: "checks",
        options: [
          "The information is accurate.",
          "I understand this initiates program onboarding.",
          "I consent to review and follow-up.",
        ],
      },
    ],
  },
  {
    key: "facilitator-certification",
    title: "Facilitator Certification / Licensing Agreement",
    type: "agreement",
    fields: [
      { id: "organization", label: "Organization represented", kind: "text" },
      { id: "agreement_number", label: "Agreement number, if assigned", kind: "text" },
      {
        id: "agreement_checks",
        label: "Agreement acknowledgements",
        kind: "checks",
        options: [
          "I understand the intellectual-property restrictions.",
          "I understand the licensed-use expectations.",
          "I am submitting this for owner review.",
        ],
      },
      { id: "signature_name", label: "Typed signature name", kind: "text" },
    ],
  },
  {
    key: "instructor-guide",
    title: "Instructor Guide / Facilitation Notes",
    type: "instructor",
    fields: [
      { id: "week_or_section", label: "Week, module, or guide section", kind: "text" },
      { id: "delivery_notes", label: "Delivery notes", kind: "textarea" },
      { id: "student_response", label: "Student response or evidence noticed", kind: "textarea" },
      { id: "adjustments", label: "Adjustments for next session", kind: "textarea" },
    ],
  },
  {
    key: "general-document",
    title: "Other Program Document or Form",
    type: "document",
    fields: [
      { id: "document_name", label: "Document/form name", kind: "text" },
      { id: "prompt_or_item", label: "Prompt, question, or item being completed", kind: "textarea" },
      { id: "response", label: "Response", kind: "textarea" },
      {
        id: "review_ready",
        label: "Review status",
        kind: "checks",
        options: ["This is complete and ready for review."],
      },
    ],
  },
];

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

const STUDENT_WEEK_GUIDES = {
  1: {
    learn: ["Respect is visible: people can see it in greeting, posture, listening, tone, and follow-through."],
    do: ["Practice a 20-second introduction with eye contact, name, and one clear sentence about yourself.", "Use active listening once: repeat back the main idea before you respond."],
    submit: ["Write the greeting or listening stem you used and what changed in the interaction."],
    transfer: ["Try it with a teacher, family member, coworker, or classmate before the next session."],
  },
  2: {
    learn: ["Conversation habits are small choices: interrupting, waiting, asking a follow-up, and showing attention all change trust."],
    do: ["Have a three-turn conversation: ask, listen, follow up.", "Notice one moment when you wanted to interrupt and what you did instead."],
    submit: ["Describe the conversation and name one habit you want to improve next time."],
    transfer: ["Use the same habit in a class discussion, family conversation, or text exchange."],
  },
  3: {
    learn: ["Manners are not just politeness. They are a way to protect opportunity and show maturity in real settings."],
    do: ["Choose one real setting: school office, job conversation, family request, team project, or public place.", "Use respectful tone, timing, and wording on purpose."],
    submit: ["Explain what you did, how the other person responded, and what you learned."],
    transfer: ["Repeat the same respectful move in a harder setting."],
  },
  4: {
    learn: ["Naming an emotion early helps you control the next choice before the emotion controls you."],
    do: ["Pick one trigger from this week.", "Name the emotion, body signal, and usual reaction."],
    submit: ["Complete this sentence: When ___ happened, I felt ___, my body ___, and my usual reaction is ___."],
    transfer: ["Notice the same body signal once before you respond."],
  },
  5: {
    learn: ["PLRR means Pause, Label, Reframe, Respond. It is a regulation routine for pressure moments."],
    do: ["Use PLRR on one scenario from class or real life.", "Write one sentence for each step."],
    submit: ["Pause: ___. Label: ___. Reframe: ___. Respond: ___."],
    transfer: ["Try the pause step before answering when you feel rushed, embarrassed, or irritated."],
  },
  6: {
    learn: ["Regulation is useful anywhere pressure shows up: family, school, online, deadlines, conflict, or disappointment."],
    do: ["Choose one pressure moment and apply PLRR again without help.", "Explain how your response protects a long-term goal."],
    submit: ["Describe the pressure, your PLRR response, and the future goal it protects."],
    transfer: ["Use PLRR in one non-classroom situation this week."],
  },
  7: {
    learn: ["Conflict usually escalates in patterns. You can slow the pattern down by noticing the trigger, the reaction, and the next best move."],
    do: ["Map a conflict: trigger, first reaction, risk, better response.", "Choose words that keep dignity for both people."],
    submit: ["Write the conflict map and the calmer response you would try."],
    transfer: ["Use a pause or boundary sentence before a disagreement grows."],
  },
  8: {
    learn: ["Strong language is calm, clear, and direct. It is not passive, explosive, or disrespectful."],
    do: ["Write two boundary sentences and one disagreement sentence.", "Practice saying them without sarcasm or extra attack words."],
    submit: ["Submit your three sentences and when you would use each one."],
    transfer: ["Use one respectful boundary sentence in a real situation."],
  },
  9: {
    learn: ["A real apology includes ownership, impact, repair, and follow-through. Words alone are not enough."],
    do: ["Choose a mistake scenario and write a repair response.", "Name the action that would rebuild trust."],
    submit: ["Submit the repair response and the follow-through action."],
    transfer: ["Look for one small way to repair trust through action, not just words."],
  },
  10: {
    learn: ["Digital choices last longer than the feeling that caused them. Screenshots, shares, and search results can affect reputation."],
    do: ["Choose a digital choice: post, comment, share, like, message, photo, username, or screenshot.", "Ask: audience, permanence, consequence."],
    submit: ["Explain who could see it, how long it could last, and what it could cost or build."],
    transfer: ["Pause before one post, message, or reaction this week."],
  },
  11: {
    learn: ["POCC means Pause, Options, Consequences, Choose. It helps you slow down before a fast online or social decision."],
    do: ["Use POCC on a scenario involving pressure, temptation, anger, embarrassment, or online conflict.", "Compare at least two options before choosing."],
    submit: ["Submit one sentence for Pause, Options, Consequences, and Choose."],
    transfer: ["Use POCC before replying to something that bothers you."],
  },
  12: {
    learn: ["A digital reset means changing a pattern: deleting is sometimes helpful, but repair and future boundaries matter too."],
    do: ["Choose one digital habit to reset.", "Name the trigger, replacement habit, and accountability support."],
    submit: ["Submit a reset plan with one boundary you will use."],
    transfer: ["Change one notification, follow, privacy setting, or posting habit."],
  },
  13: {
    learn: ["Identity is built by repeated choices. Standards are what you want your actions to prove about you."],
    do: ["Choose three words you want to be known for.", "Connect each word to one behavior people can actually see."],
    submit: ["Submit your three standards and the behaviors that prove them."],
    transfer: ["Pick one standard to practice for a full day."],
  },
  14: {
    learn: ["Responsibility is follow-through: doing what you said, checking your work, and making it right when you miss."],
    do: ["Set one behavior goal for the week.", "Track whether you did it for at least three days."],
    submit: ["Submit your goal, your three-day check, and what helped or got in the way."],
    transfer: ["Use a reminder, checklist, or accountability person."],
  },
  15: {
    learn: ["Leadership is not only being in front. It can look like steadiness, service, encouragement, and making the group better."],
    do: ["Choose one way to help another person or improve a group situation.", "Use one course skill while doing it."],
    submit: ["Explain what you did, which skill you used, and what changed."],
    transfer: ["Use the same leadership move outside class."],
  },
  16: {
    learn: ["The capstone asks you to prove transfer: show how the course skills now help you make better real-life choices."],
    do: ["Choose one real or realistic situation and use at least two course tools, such as PLRR, POCC, repair, respectful communication, or digital reset."],
    submit: ["Submit your capstone response with the situation, tools used, choice made, and next standard."],
    transfer: ["Name one habit you will keep after the course ends."],
  },
};

const WEEKLY_DISCUSSION_QUESTIONS = {
  1: "How can a respectful first impression change the way a group feels and works together?",
  2: "Which conversation habit do you need most right now, and how will you practice it in one real setting this week?",
  3: "Describe one real situation where respect could change the outcome. What would you do before, during, and after the moment?",
  4: "What is one emotion that can run the moment for people? How can naming it early help you choose a stronger response?",
  5: "Think about a trigger or pressure point. What warning signs show up first, and what reset move can help you respond instead of react?",
  6: "How can repair after a mistake protect trust better than pretending nothing happened?",
  7: "What does responsible decision-making look like when there are several good or bad options in front of you?",
  8: "Use the Pause, Look, Reason, Respond sequence on a realistic choice. What changes when you slow the decision down?",
  9: "How does one online choice affect credibility, opportunity, and self-respect? Use a real or realistic example from social media, messaging, gaming, or school tech.",
  10: "What boundary or communication habit helps friendships stay respectful when there is pressure, conflict, or misunderstanding?",
  11: "How can you show accountability in a family, school, or workplace situation without making excuses?",
  12: "What is one workplace-ready habit that shows maturity before you ever say a word?",
  13: "Choose a conflict or pressure scenario. What would a strong repair, reset, or next step sound like?",
  14: "What personal standard do you want people to connect with your name, and what habit would prove it?",
  15: "What does leadership look like when you are not the loudest person in the room?",
  16: "Which course tool will you keep using after the class ends, and how will it help you make better real-life choices?",
};

const DISCUSSION_TOPICS = [
  {
    key: "week-01-introduction",
    week: 1,
    label: "Start Here",
    title: "Introduction Discussion",
    prompt:
      "Introduce yourself to the class. Share your name, one goal you have for this course, and one real-life skill you hope to strengthen.",
    focus: ["Belonging", "Community start", "Course goals"],
  },
  ...COURSE_WEEKS.map((week) => {
    const guide = STUDENT_WEEK_GUIDES[week.week] || {};
    return {
      key: `week-${String(week.week).padStart(2, "0")}`,
      week: week.week,
      label: `Week ${week.week}`,
      title: `Week ${week.week}: ${week.title}`,
      prompt: WEEKLY_DISCUSSION_QUESTIONS[week.week],
      focus: [
        week.module,
        (guide.learn || [])[0] || week.summary,
        (guide.submit || [])[0] || "Connect your response to the weekly assignment.",
      ],
    };
  }),
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
    communityLabel: "Learning Community",
    communityTitle: "The students and instructors in your program",
    communityCopy:
      "See who is enrolled, the photo they chose to share, and the short introduction that helps the community know them.",
    imageNote:
      "Add a current photo so your page feels personal and other enrolled users can recognize you.",
    imageStatusSuccess: "Profile image saved and shared with the enrolled community.",
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
    communityLabel: "Program Community",
    communityTitle: "Students and instructors enrolled in this program",
    communityCopy:
      "Use this shared community view to recognize the people in the program, see their identity card, and get to know who they are.",
    imageNote:
      "Add a current photo so students and instructors can recognize you as part of the enrolled program community.",
    imageStatusSuccess: "Profile image saved and shared with the program community.",
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
const welcomeProfileImage = document.getElementById("welcomeProfileImage");
const welcomeProfileFallback = document.getElementById("welcomeProfileFallback");
const editWelcomeProfileBtn = document.getElementById("editWelcomeProfileBtn");
const identityCardName = document.getElementById("identityCardName");
const identityCardTrack = document.getElementById("identityCardTrack");
const progressSummary = document.getElementById("progressSummary");
const progressFill = document.getElementById("progressFill");
const studentLogoutBtn = document.getElementById("studentLogoutBtn");
const deleteAccountBtn = document.getElementById("deleteAccountBtn");
const accountStatus = document.getElementById("accountStatus");
const bioForm = document.getElementById("bioForm");
const bioProudInput = document.getElementById("bioProudInput");
const bioGoalInput = document.getElementById("bioGoalInput");
const bioStrengthsInput = document.getElementById("bioStrengthsInput");
const bioSupportInput = document.getElementById("bioSupportInput");
const bioStatus = document.getElementById("bioStatus");
const bioPreview = document.getElementById("bioPreview");
const profileImagePreview = document.getElementById("profileImagePreview");
const profileImageFallback = document.getElementById("profileImageFallback");
const profileImageNote = document.getElementById("profileImageNote");
const profileImageInput = document.getElementById("profileImageInput");
const uploadProfileImageBtn = document.getElementById("uploadProfileImageBtn");
const profileImageStatus = document.getElementById("profileImageStatus");
const assignmentList = document.getElementById("assignmentList");
const workbookList = document.getElementById("workbookList");
const discussionList = document.getElementById("discussionList");
const discussionStatus = document.getElementById("discussionStatus");
const resourceList = document.getElementById("resourceList");
const feedbackList = document.getElementById("feedbackList");
const documentSubmissionForm = document.getElementById("documentSubmissionForm");
const documentSubmissionTemplate = document.getElementById("documentSubmissionTemplate");
const documentSubmissionFields = document.getElementById("documentSubmissionFields");
const documentSubmissionNotes = document.getElementById("documentSubmissionNotes");
const documentSubmissionStatus = document.getElementById("documentSubmissionStatus");
const documentSubmissionList = document.getElementById("documentSubmissionList");
const fileUploadInput = document.getElementById("fileUploadInput");
const uploadFileBtn = document.getElementById("uploadFileBtn");
const fileUploadStatus = document.getElementById("fileUploadStatus");
const fileList = document.getElementById("fileList");
const communitySectionLabel = document.getElementById("communitySectionLabel");
const communitySectionTitle = document.getElementById("communitySectionTitle");
const communitySectionCopy = document.getElementById("communitySectionCopy");
const communityDirectoryList = document.getElementById("communityDirectoryList");
const courseRoadmapLabel = document.getElementById("courseRoadmapLabel");
const courseRoadmapTitle = document.getElementById("courseRoadmapTitle");
const courseRoadmapCopy = document.getElementById("courseRoadmapCopy");
const courseRoadmapList = document.getElementById("courseRoadmapList");
const classroomViewPanels = document.querySelectorAll("[data-classroom-view]");
const classroomNavigationLinks = document.querySelectorAll("[data-classroom-nav]");
const classroomSearchInput = document.getElementById("classroomSearchInput");
const classroomWeekNavList = document.getElementById("classroomWeekNavList");
const classroomWeekCount = document.getElementById("classroomWeekCount");
const classroomAssignmentCount = document.getElementById("classroomAssignmentCount");
const classroomDiscussionCount = document.getElementById("classroomDiscussionCount");
const classroomDocumentCount = document.getElementById("classroomDocumentCount");
const classroomFileCount = document.getElementById("classroomFileCount");
const classroomFeedbackCount = document.getElementById("classroomFeedbackCount");
const classroomCommunityCount = document.getElementById("classroomCommunityCount");
const classroomResourceCount = document.getElementById("classroomResourceCount");
const classroomProgressPercent = document.getElementById("classroomProgressPercent");
const classroomProgressText = document.getElementById("classroomProgressText");
const classroomAssignmentTotal = document.getElementById("classroomAssignmentTotal");
const classroomDocumentTotal = document.getElementById("classroomDocumentTotal");
const classroomFeedbackTotal = document.getElementById("classroomFeedbackTotal");
const expandRoadmapBtn = document.getElementById("expandRoadmapBtn");
const collapseRoadmapBtn = document.getElementById("collapseRoadmapBtn");
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
const identityModal = document.getElementById("identityModal");
const identityModalCloseBtn = document.getElementById("identityModalCloseBtn");
const identityModalRole = document.getElementById("identityModalRole");
const identityModalTitle = document.getElementById("identityModalTitle");
const identityModalImage = document.getElementById("identityModalImage");
const identityModalFallback = document.getElementById("identityModalFallback");
const identityModalCohort = document.getElementById("identityModalCohort");
const identityModalName = document.getElementById("identityModalName");
const identityModalTrack = document.getElementById("identityModalTrack");
const identityModalSummary = document.getElementById("identityModalSummary");

let settings = loadSettings();
let supabaseClient = null;
let authSubscription = null;
const CLASSROOM_HASH_TO_VIEW = {
  "#classroom-overview": "overview",
  "#classroom-contents": "contents",
  "#classroom-assignments": "assignments",
  "#classroom-discussions": "discussions",
  "#classroom-documents": "documents",
  "#classroom-submissions": "submissions",
  "#classroom-grades": "grades",
  "#classroom-community": "community",
  "#classroom-resources": "resources",
};
const CLASSROOM_VIEW_TO_HASH = Object.fromEntries(
  Object.entries(CLASSROOM_HASH_TO_VIEW).map(([hash, view]) => [view, hash]),
);
let selectedClassroomWeek = getWeekFromHash() || 1;
let selectedClassroomView = getInitialClassroomView();
let state = {
  session: null,
  user: null,
  profile: null,
  communityProfile: null,
  communityProfiles: [],
  assignments: [],
  workbookEntries: [],
  discussionPosts: [],
  discussionReplies: [],
  discussionError: "",
  documentSubmissions: [],
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

function safeDomId(value) {
  return String(value || "").replace(/[^a-z0-9_-]/gi, "-");
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

  const params = new URLSearchParams(window.location.search);
  params.delete("entry");

  const cleanedSearch = params.toString();
  const cleanedUrl = `${window.location.pathname}${cleanedSearch ? `?${cleanedSearch}` : ""}`;
  window.history.replaceState({}, "", cleanedUrl);

  const scrollTop = () => window.scrollTo(0, 0);
  scrollTop();
  requestAnimationFrame(scrollTop);
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
  if (isInstructorOrOwner(role)) {
    return `${name} has a secure instructor home base for pacing, lesson delivery, facilitation notes, and implementation reflection across the full 16-week course.`;
  }
  return `${name} has a secure student home base for weekly assignments, workbook reflections, personal files, and saved feedback across the full 16-week course.`;
}

function normalizePortalRole(role) {
  return String(role || "student").trim().toLowerCase();
}

function isInstructorOrOwner(role) {
  return ["instructor", "owner"].includes(normalizePortalRole(role));
}

function defaultTrackForRole(role) {
  return isInstructorOrOwner(role) ? "Instructor Workspace" : "Core Skills Focus";
}

function defaultCohortForRole(role) {
  return isInstructorOrOwner(role) ? "Instruction Team" : "Ready for Real Life Cohort";
}

function defaultAvatarForRole(role) {
  return isInstructorOrOwner(role) ? "🧭" : "🚀";
}

function roleLabel(role) {
  const normalizedRole = normalizePortalRole(role);
  return isInstructorOrOwner(normalizedRole) ? normalizedRole : "student";
}

function portalCopyForRole(role) {
  return ROLE_PORTAL_COPY[role] || ROLE_PORTAL_COPY.student;
}

function createCommunitySummary(profile) {
  const parts = [
    profile.bio_proud,
    profile.bio_goal,
    profile.bio_strengths,
    profile.bio_support,
  ]
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  if (!parts.length) {
    return "This enrolled user has not added a shared introduction yet.";
  }

  return parts.join(" ");
}

function renderProfileImage(profile) {
  const imageUrl = profile?.profile_image_url || "";
  const fallbackAvatar = profile?.avatar || defaultAvatarForRole(profile?.role);
  const hasImage = Boolean(imageUrl);

  if (profileImagePreview) {
    if (hasImage) {
      profileImagePreview.src = imageUrl;
      profileImagePreview.hidden = false;
      profileImagePreview.style.display = "";
    } else {
      profileImagePreview.hidden = true;
      profileImagePreview.removeAttribute("src");
      profileImagePreview.style.display = "none";
    }
  }

  if (profileImageFallback) {
    profileImageFallback.textContent = fallbackAvatar;
    profileImageFallback.hidden = hasImage;
    profileImageFallback.style.display = hasImage ? "none" : "";
  }

  if (welcomeProfileImage) {
    if (hasImage) {
      welcomeProfileImage.src = imageUrl;
      welcomeProfileImage.hidden = false;
      welcomeProfileImage.style.display = "";
    } else {
      welcomeProfileImage.hidden = true;
      welcomeProfileImage.removeAttribute("src");
      welcomeProfileImage.style.display = "none";
    }
  }

  if (welcomeProfileFallback) {
    welcomeProfileFallback.textContent = fallbackAvatar;
    welcomeProfileFallback.hidden = hasImage;
    welcomeProfileFallback.style.display = hasImage ? "none" : "";
  }
}

function openIdentityModal(profile, options = {}) {
  if (!identityModal || !profile) return;

  const heading = options.heading || "Learn About Me";
  const imageUrl = profile.profile_image_url || "";
  const fallbackAvatar = profile.avatar || defaultAvatarForRole(profile.role);
  const summary = createCommunitySummary(profile);

  identityModalRole.textContent = String(profile.role || "program member");
  identityModalTitle.textContent = heading;
  identityModalCohort.textContent = profile.cohort || "Ready for Real Life";
  identityModalName.textContent = profile.display_name || "Program Member";
  identityModalTrack.textContent = `${profile.role || "member"} · ${profile.track || ""}`;
  identityModalSummary.textContent = summary;

  if (imageUrl) {
    identityModalImage.src = imageUrl;
    identityModalImage.hidden = false;
    identityModalImage.style.display = "";
    identityModalFallback.hidden = true;
    identityModalFallback.style.display = "none";
  } else {
    identityModalImage.hidden = true;
    identityModalImage.removeAttribute("src");
    identityModalImage.style.display = "none";
    identityModalFallback.hidden = false;
    identityModalFallback.style.display = "";
    identityModalFallback.textContent = fallbackAvatar;
  }

  identityModal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeIdentityModal() {
  if (!identityModal) return;
  identityModal.hidden = true;
  document.body.style.overflow = "";
}

function renderCourseRoadmap(role) {
  if (!courseRoadmapList) return;

  const isInstructor = isInstructorOrOwner(role);
  courseRoadmapList.innerHTML = COURSE_WEEKS.map(
    (week, index) => {
      const guide = STUDENT_WEEK_GUIDES[week.week];
      return `
      <details class="week-card" id="classroom-week-${week.week}" ${index === 0 ? "open" : ""}>
        <summary class="week-head">
          <div>
            <div class="mini-label">${escapeHtml(week.module)}</div>
            <h4>${escapeHtml(week.title)}</h4>
            <p class="week-focus">${escapeHtml(week.focus)}</p>
          </div>
          <span class="week-summary-actions">
            <span class="week-number">Week ${week.week}</span>
            <span class="week-toggle" aria-hidden="true"></span>
          </span>
        </summary>
        <div class="week-details">
          <div class="week-list">
            ${
              isInstructor
                ? `
                  <section class="week-list-block">
                    <strong>Student experience this week</strong>
                    <ul>
                      ${week.studentActions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                    </ul>
                  </section>
                  <section class="week-list-block">
                    <strong>What to look for</strong>
                    <ul>
                      ${week.studentEvidence.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                    </ul>
                  </section>
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
                    <strong>Learn first</strong>
                    <ul>
                      ${(guide?.learn || [week.focus]).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                    </ul>
                  </section>
                  <section class="week-list-block">
                    <strong>Do this</strong>
                    <ul>
                      ${(guide?.do || week.studentActions).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                    </ul>
                  </section>
                  <section class="week-list-block">
                    <strong>Submit or show</strong>
                    <ul>
                      ${(guide?.submit || week.studentEvidence).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                    </ul>
                  </section>
                  <section class="week-list-block">
                    <strong>Try it in real life</strong>
                    <ul>
                      ${(guide?.transfer || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                    </ul>
                  </section>
                `
            }
          </div>
        </div>
      </details>
    `;
    },
  ).join("");
}

function assignmentTemplatesForRole(role) {
  return DEFAULT_ASSIGNMENTS[role] || DEFAULT_ASSIGNMENTS.student;
}

function assignmentTemplateByKey(role, key) {
  return assignmentTemplatesForRole(role).find((assignment) => assignment.id === key) || null;
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

function computeProgress(assignments, workbookEntries, documentSubmissions = []) {
  const completedAssignments = assignments.filter((assignment) =>
    ["Approved", "Exceeds expectations"].includes(assignment.review_status),
  ).length;
  const completedWorkbook = workbookEntries.filter((entry) =>
    String(entry.response || "").trim(),
  ).length;
  const completedDocuments = documentSubmissions.filter(
    (submission) => submission.status === "approved",
  ).length;
  const total = assignments.length + workbookEntries.length + documentSubmissions.length || 1;
  const completed = completedAssignments + completedWorkbook + completedDocuments;
  return {
    completed,
    total,
    percent: Math.round((completed / total) * 100),
  };
}

function countReviewedItems(assignments, documentSubmissions) {
  const reviewedAssignments = assignments.filter(
    (assignment) => assignment.review_status !== "Not reviewed",
  ).length;
  const reviewedDocuments = documentSubmissions.filter(
    (submission) =>
      submission.owner_feedback ||
      submission.owner_score ||
      ["needs_revision", "approved", "returned"].includes(submission.status),
  ).length;
  return reviewedAssignments + reviewedDocuments;
}

function normalizeClassroomWeek(value) {
  const weekNumber = Number.parseInt(value, 10);
  if (!Number.isFinite(weekNumber)) return 1;
  return Math.min(Math.max(weekNumber, 1), COURSE_WEEKS.length);
}

function getWeekFromHash() {
  const match = window.location.hash.match(/^#classroom-week-(\d+)$/);
  return match ? normalizeClassroomWeek(match[1]) : null;
}

function getViewFromHash() {
  if (getWeekFromHash()) return "contents";
  return CLASSROOM_HASH_TO_VIEW[window.location.hash] || null;
}

function getInitialClassroomView() {
  return getViewFromHash() || "overview";
}

function updateClassroomWeekHash(weekNumber) {
  const nextHash = `#classroom-week-${weekNumber}`;
  if (window.location.hash === nextHash) return;
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${nextHash}`);
}

function updateClassroomViewHash(view) {
  const nextHash = CLASSROOM_VIEW_TO_HASH[view] || "#classroom-overview";
  if (window.location.hash === nextHash) return;
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${nextHash}`);
}

function applySelectedClassroomView() {
  classroomViewPanels.forEach((panel) => {
    panel.hidden = panel.dataset.classroomView !== selectedClassroomView;
  });

  classroomNavigationLinks.forEach((link) => {
    const isActive = link.dataset.classroomNav === selectedClassroomView;
    link.classList.toggle("active", isActive);
    link.classList.toggle("primary-tab", isActive && link.classList.contains("classroom-tab"));
    link.setAttribute("aria-current", isActive ? "page" : "false");
  });
}

function selectClassroomView(view, options = {}) {
  selectedClassroomView = CLASSROOM_VIEW_TO_HASH[view] ? view : "overview";
  if (options.updateHash !== false) {
    updateClassroomViewHash(selectedClassroomView);
  }
  applySelectedClassroomView();
}

function applySelectedClassroomWeek() {
  const selectedWeek = normalizeClassroomWeek(selectedClassroomWeek);
  selectedClassroomWeek = selectedWeek;

  courseRoadmapList?.querySelectorAll("details.week-card").forEach((card) => {
    const weekMatch = card.id.match(/^classroom-week-(\d+)$/);
    const isSelected = Number(weekMatch?.[1]) === selectedWeek;
    card.hidden = !isSelected;
    card.open = isSelected;
  });

  classroomWeekNavList?.querySelectorAll("[data-classroom-week-link]").forEach((link) => {
    const isSelected = Number(link.getAttribute("data-classroom-week-link")) === selectedWeek;
    link.classList.toggle("active", isSelected);
    link.setAttribute("aria-current", isSelected ? "true" : "false");
    const marker = link.querySelector("[data-week-marker]");
    if (marker) marker.textContent = isSelected ? "✓" : "•";
  });
}

function selectClassroomWeek(weekNumber, options = {}) {
  selectedClassroomWeek = normalizeClassroomWeek(weekNumber);
  selectedClassroomView = "contents";
  if (options.updateHash !== false) {
    updateClassroomWeekHash(selectedClassroomWeek);
  }
  applySelectedClassroomView();
  applySelectedClassroomWeek();
}

function renderClassroomDashboard(progress, profile) {
  const reviewedCount = countReviewedItems(state.assignments, state.documentSubmissions);

  if (classroomWeekCount) classroomWeekCount.textContent = String(COURSE_WEEKS.length);
  if (classroomAssignmentCount) classroomAssignmentCount.textContent = String(state.assignments.length);
  if (classroomDiscussionCount) classroomDiscussionCount.textContent = String(DISCUSSION_TOPICS.length);
  if (classroomDocumentCount) classroomDocumentCount.textContent = String(state.documentSubmissions.length);
  if (classroomFileCount) classroomFileCount.textContent = String(state.files.length);
  if (classroomFeedbackCount) classroomFeedbackCount.textContent = String(reviewedCount);
  if (classroomCommunityCount) classroomCommunityCount.textContent = String(state.communityProfiles.length);
  if (classroomResourceCount) classroomResourceCount.textContent = String(DEFAULT_RESOURCES.length);

  if (classroomProgressPercent) classroomProgressPercent.textContent = `${progress.percent}%`;
  if (classroomProgressText) {
    classroomProgressText.textContent = `${progress.completed} of ${progress.total} milestones complete`;
  }
  if (classroomAssignmentTotal) classroomAssignmentTotal.textContent = String(state.assignments.length);
  if (classroomDocumentTotal) classroomDocumentTotal.textContent = String(state.documentSubmissions.length);
  if (classroomFeedbackTotal) classroomFeedbackTotal.textContent = String(reviewedCount);

  if (classroomWeekNavList) {
    classroomWeekNavList.innerHTML = COURSE_WEEKS.map(
      (week) => `
        <a href="#classroom-week-${week.week}" data-classroom-week-link="${week.week}">
          <span>Week ${week.week}</span>
          <span data-week-marker aria-hidden="true">${week.week === selectedClassroomWeek ? "✓" : "•"}</span>
        </a>
      `,
    ).join("");
  }

  const searchValue = classroomSearchInput?.value?.trim().toLowerCase() || "";
  if (searchValue) {
    filterClassroomWeeks(searchValue);
  }

  document.body.dataset.portalRole = profile.role || "student";
  applySelectedClassroomView();
  applySelectedClassroomWeek();
}

function filterClassroomWeeks(query) {
  classroomWeekNavList?.querySelectorAll("a").forEach((link) => {
    const weekId = link.getAttribute("data-classroom-week-link");
    const card = weekId ? document.getElementById(`classroom-week-${weekId}`) : null;
    const text = card?.textContent.toLowerCase() || link.textContent.toLowerCase();
    link.hidden = Boolean(query) && !text.includes(query);
  });
  applySelectedClassroomWeek();
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
    handleSessionChange(session, { scrollToWelcome: false }).catch((error) => {
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

async function ensureCommunityProfile(user, profile) {
  const supabase = getSupabase();
  const { data: existing, error: existingError } = await supabase
    .from("community_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingError) throw existingError;

  const payload = {
    user_id: user.id,
    display_name: profile.display_name,
    role: profile.role,
    cohort: profile.cohort,
    track: profile.track,
    avatar: profile.avatar,
    bio_proud: profile.bio_proud || "",
    bio_goal: profile.bio_goal || "",
    bio_strengths: profile.bio_strengths || "",
    bio_support: profile.bio_support || "",
  };

  if (existing) {
    const { data, error } = await supabase
      .from("community_profiles")
      .update(payload)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("community_profiles")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

async function resolveCommunityImageUrls(communityProfiles) {
  if (!communityProfiles?.length) return [];
  const supabase = getSupabase();

  return Promise.all(
    communityProfiles.map(async (profile) => {
      if (!profile.profile_image_path) {
        return { ...profile, profile_image_url: "" };
      }

      const { data, error } = await supabase.storage
        .from(COMMUNITY_PROFILE_BUCKET)
        .createSignedUrl(profile.profile_image_path, 3600);

      if (error) {
        return { ...profile, profile_image_url: "" };
      }

      return { ...profile, profile_image_url: data?.signedUrl || "" };
    }),
  );
}

async function loadCommunityProfiles() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("community_profiles")
    .select("*")
    .order("role", { ascending: false })
    .order("display_name", { ascending: true });

  if (error) throw error;
  return resolveCommunityImageUrls(data || []);
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

async function loadDocumentSubmissions(userId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("document_submissions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

async function loadDiscussionData() {
  const supabase = getSupabase();
  const { data: posts, error: postsError } = await supabase
    .from("discussion_posts")
    .select("*")
    .order("topic_key", { ascending: true })
    .order("created_at", { ascending: true });

  if (postsError) {
    return { posts: [], replies: [], error: postsError.message };
  }

  const { data: replies, error: repliesError } = await supabase
    .from("discussion_replies")
    .select("*")
    .order("created_at", { ascending: true });

  if (repliesError) {
    return { posts: posts || [], replies: [], error: repliesError.message };
  }

  return { posts: posts || [], replies: replies || [], error: "" };
}

async function loadPortalData(defaults = null, options = {}) {
  const user = state.user;
  if (!user) return;

  const { scrollToWelcome = false } = options;

  const profile = await ensureProfile(user, defaults || {});

  let communityProfile = null;
  let communityProfiles = [];

  try {
    communityProfile = await ensureCommunityProfile(user, profile);
    communityProfiles = await loadCommunityProfiles();
    communityProfile =
      communityProfiles.find((item) => item.user_id === user.id) || communityProfile;
  } catch (error) {
    console.warn("Community profile features are not ready yet.", error);
  }

  const [assignments, workbookEntries, documentSubmissions, files, discussionData] = await Promise.all([
    ensureAssignments(user.id, profile.role),
    ensureWorkbookEntries(user.id, profile.role),
    loadDocumentSubmissions(user.id),
    loadFiles(user.id),
    loadDiscussionData(),
  ]);

  state.profile = profile;
  state.communityProfile = communityProfile;
  state.communityProfiles = communityProfiles;
  state.assignments = assignments;
  state.workbookEntries = workbookEntries;
  state.discussionPosts = discussionData.posts;
  state.discussionReplies = discussionData.replies;
  state.discussionError = discussionData.error;
  state.documentSubmissions = documentSubmissions;
  state.files = files;
  renderPortal({ scrollToWelcome });
}

function renderLoggedOutState() {
  state.session = null;
  state.user = null;
  state.profile = null;
  state.communityProfile = null;
  state.communityProfiles = [];
  state.assignments = [];
  state.workbookEntries = [];
  state.discussionPosts = [];
  state.discussionReplies = [];
  state.discussionError = "";
  state.documentSubmissions = [];
  state.files = [];
  document.body.classList.remove("portal-instructor", "portal-student");
  updateAuthenticatedView(false);
  studentPortal.classList.remove("visible");
  clearStatus(bioStatus);
  clearStatus(fileUploadStatus);
  clearStatus(accountStatus);
}

function discussionPostCountForTopic(topicKey) {
  return state.discussionPosts.filter((post) => post.topic_key === topicKey).length;
}

function discussionRepliesByCurrentUser(topicKey) {
  if (!state.user) return [];
  return state.discussionReplies.filter(
    (reply) => reply.topic_key === topicKey && reply.user_id === state.user.id,
  );
}

function renderDiscussionReplies(postId) {
  const replies = state.discussionReplies.filter((reply) => reply.post_id === postId);
  if (!replies.length) return `<div class="empty">No replies yet.</div>`;

  return replies
    .map(
      (reply) => `
        <div class="discussion-reply">
          <strong>${escapeHtml(reply.display_name)}</strong>
          <span class="subtle"> · ${escapeHtml(new Date(reply.created_at).toLocaleString())}</span>
          <div style="margin-top:8px;white-space:pre-wrap">${escapeHtml(reply.body)}</div>
        </div>
      `,
    )
    .join("");
}

function renderDiscussionTopic(topic) {
  const topicPosts = state.discussionPosts.filter((post) => post.topic_key === topic.key);
  const myPost = topicPosts.find((post) => post.user_id === state.user?.id);
  const peerPosts = topicPosts.filter((post) => post.user_id !== state.user?.id);
  const replyTargets = new Set(
    discussionRepliesByCurrentUser(topic.key)
      .filter((reply) => peerPosts.some((post) => post.id === reply.post_id))
      .map((reply) => reply.post_id),
  );
  const replyProgress = Math.min(replyTargets.size, 2);
  const postId = `discussion-post-${safeDomId(topic.key)}`;

  return `
    <article class="discussion-topic-card ${myPost ? "" : "locked"}">
      <div class="assignment-head">
        <div>
          <div class="mini-label">${escapeHtml(topic.label)}</div>
          <h4>${escapeHtml(topic.title)}</h4>
        </div>
        <span class="status-badge ${myPost && replyProgress >= 2 ? "complete" : myPost ? "review" : "pending"}">
          ${myPost ? `${replyProgress}/2 replies` : "Post first"}
        </span>
      </div>
      <div class="discussion-prompt">${escapeHtml(topic.prompt)}</div>
      <div class="assignment-meta">
        ${topic.focus.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("")}
      </div>
      <label style="margin-top:14px">
        Your initial discussion post
        <textarea id="${escapeHtml(postId)}" placeholder="Write your post before viewing classmates.">${escapeHtml(myPost?.body || "")}</textarea>
      </label>
      <div class="assignment-actions">
        <button class="btn primary" type="button" data-save-discussion-post="${escapeHtml(topic.key)}">
          ${myPost ? "Update My Post" : "Publish My Post"}
        </button>
      </div>
      ${
        myPost
          ? `<div class="discussion-post">
              <div class="mini-label">Classmate posts unlocked</div>
              <p class="subtle">Reply to at least two classmates by the end of the week. Use a specific connection, a thoughtful question, or encouragement that helps them keep growing.</p>
              ${
                peerPosts.length
                  ? peerPosts
                      .map(
                        (post) => `
                          <div class="discussion-post">
                            <strong>${escapeHtml(post.display_name)}</strong>
                            <span class="subtle"> · ${escapeHtml(new Date(post.created_at).toLocaleString())}</span>
                            <div style="margin-top:8px;white-space:pre-wrap">${escapeHtml(post.body)}</div>
                            <div style="margin-top:12px">
                              <div class="mini-label">Replies</div>
                              ${renderDiscussionReplies(post.id)}
                            </div>
                            <label style="margin-top:12px">
                              Reply to ${escapeHtml(post.display_name)}
                              <textarea id="discussion-reply-${escapeHtml(post.id)}" placeholder="Write a specific reply that connects to their idea."></textarea>
                            </label>
                            <div class="assignment-actions">
                              <button class="btn secondary" type="button" data-save-discussion-reply="${escapeHtml(post.id)}">Post Reply</button>
                            </div>
                          </div>
                        `,
                      )
                      .join("")
                  : `<div class="empty">No classmates have posted here yet. When they do, their posts will appear here for replies.</div>`
              }
            </div>`
          : `<div class="discussion-lock-note">Classmate posts are hidden until you publish your own response for this topic.</div>`
      }
    </article>
  `;
}

function renderDiscussions() {
  if (!discussionList) return;

  if (state.discussionError) {
    discussionList.innerHTML = `
      <div class="empty">
        Discussions need the updated Supabase schema before they can save posts and replies.
        Run the updated schema in Supabase, then refresh this page.
        <br><br>${escapeHtml(state.discussionError)}
      </div>
    `;
    return;
  }

  discussionList.innerHTML = DISCUSSION_TOPICS.map(renderDiscussionTopic).join("");
}

async function handleSessionChange(session, options = {}) {
  const { scrollToWelcome = false } = options;
  state.session = session || null;
  state.user = session?.user || null;

  if (!state.user) {
    renderLoggedOutState();
    return;
  }

  settings.lastAuthEmail = state.user.email || settings.lastAuthEmail;
  saveSettings();
  await loadPortalData(null, { scrollToWelcome });
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
  const profile = state.profile;
  const isPrivilegedPortalUser = isInstructorOrOwner(profile.role);
  studentPortal.classList.toggle("instructor-view", isPrivilegedPortalUser);
  studentPortal.classList.toggle("student-view", !isPrivilegedPortalUser);
  document.body.classList.toggle("portal-instructor", isPrivilegedPortalUser);
  document.body.classList.toggle("portal-student", !isPrivilegedPortalUser);
  document.querySelectorAll(".instructor-nav-link").forEach((link) => {
    link.hidden = !isPrivilegedPortalUser;
    link.setAttribute("aria-hidden", String(!isPrivilegedPortalUser));
    link.tabIndex = isPrivilegedPortalUser ? 0 : -1;
    link.style.display = isPrivilegedPortalUser ? "" : "none";
  });

  const roleCopy = portalCopyForRole(profile.role);
  const firstName = profile.display_name.split(/\s+/)[0] || profile.display_name;
  const progress = computeProgress(
    state.assignments,
    state.workbookEntries,
    state.documentSubmissions,
  );

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
  communitySectionLabel.textContent = roleCopy.communityLabel;
  communitySectionTitle.textContent = roleCopy.communityTitle;
  communitySectionCopy.textContent = roleCopy.communityCopy;
  if (profileImageNote) {
    profileImageNote.textContent = roleCopy.imageNote;
  }
  renderCourseRoadmap(profile.role);
  renderClassroomDashboard(progress, profile);
  renderProfileImage(state.communityProfile || profile);

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
      const assignmentGuide = assignmentTemplateByKey(profile.role, assignment.assignment_key);
      const displayTitle = assignmentGuide?.title || assignment.title;
      const displayObjective = assignmentGuide?.objective || assignment.objective;
      const displayRubric = assignmentGuide?.rubric_focus || assignment.rubric_focus;
      const displaySteps = assignmentGuide?.student_steps || [];
      const displayResources = assignmentGuide?.student_resources || [];
      const displayPrompt = assignmentGuide?.student_prompt || "";
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
              <h4>${escapeHtml(displayTitle)}</h4>
            </div>
            <span class="status-badge ${badgeClass(statusText)}">${escapeHtml(statusText)}</span>
          </div>
          <p>${escapeHtml(displayObjective)}</p>
          <div class="assignment-meta">
            <span class="chip">${escapeHtml(displayRubric)}</span>
          </div>
          ${
            displaySteps.length
              ? `<div class="student-help-box">
                  <strong>How to do this</strong>
                  <ol>${displaySteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
                </div>`
              : ""
          }
          ${
            displayResources.length
              ? `<div class="student-help-box soft">
                  <strong>Where to look first</strong>
                  <ul>${displayResources.map((resource) => `<li>${escapeHtml(resource)}</li>`).join("")}</ul>
                </div>`
              : ""
          }
          <label style="margin-top:14px">
            Your response / reflection
            <textarea id="submission-${assignment.id}" placeholder="${escapeHtml(displayPrompt || "Write your response here.")}">${escapeHtml(assignment.submission || "")}</textarea>
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

  renderDocumentSubmissionStudio();
  renderDiscussions();

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
  const documentFeedbackItems = state.documentSubmissions.filter(
    (submission) =>
      submission.owner_feedback ||
      submission.owner_score ||
      ["needs_revision", "approved", "returned"].includes(submission.status),
  );

  const assignmentFeedbackHtml = feedbackItems
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
        .join("");
  const documentFeedbackHtml = documentFeedbackItems
    .map(
      (submission) => `
        <article class="assignment-card">
          <div class="assignment-head">
            <div>
              <div class="mini-label">Document review</div>
              <h4>${escapeHtml(submission.document_title)}</h4>
            </div>
            <span class="status-badge ${submission.status === "approved" ? "complete" : submission.status === "needs_revision" ? "revise" : "review"}">${escapeHtml(formatSubmissionStatus(submission.status))}</span>
          </div>
          <p><strong>Score:</strong> ${escapeHtml(submission.owner_score || "Pending")}</p>
          <div class="feedback-box">
            <strong>Reviewer note</strong>
            <div style="margin-top:8px">${escapeHtml(submission.owner_feedback || "No note yet.")}</div>
          </div>
        </article>
      `,
    )
    .join("");

  feedbackList.innerHTML =
    assignmentFeedbackHtml || documentFeedbackHtml
      ? `${assignmentFeedbackHtml}${documentFeedbackHtml}`
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

  communityDirectoryList.innerHTML = state.communityProfiles.length
    ? state.communityProfiles
        .map((communityProfile) => {
          const summary = createCommunitySummary(communityProfile);
          const image = communityProfile.profile_image_url
            ? `<button class="inline-link-btn" type="button" data-open-community="${escapeHtml(communityProfile.user_id)}" aria-label="Open ${escapeHtml(communityProfile.display_name)} profile image" style="padding:0;border:none;background:none">
                 <img class="community-avatar" src="${escapeHtml(communityProfile.profile_image_url)}" alt="${escapeHtml(communityProfile.display_name)} profile photo" />
               </button>`
            : `<button class="inline-link-btn" type="button" data-open-community="${escapeHtml(communityProfile.user_id)}" aria-label="Open ${escapeHtml(communityProfile.display_name)} profile image" style="padding:0;border:none;background:none">
                 <div class="community-avatar community-fallback">${escapeHtml(communityProfile.avatar || defaultAvatarForRole(communityProfile.role))}</div>
               </button>`;

          return `
            <article class="community-card">
              <div class="community-card-top">
                ${image}
                <div>
                  <div class="mini-label">${escapeHtml(communityProfile.cohort || "")}</div>
                  <h4>${escapeHtml(communityProfile.display_name)}</h4>
                  <div class="community-role">${escapeHtml(communityProfile.role)} · ${escapeHtml(communityProfile.track || "")}</div>
                </div>
              </div>
              <div class="community-bio">${escapeHtml(summary)}</div>
              <div class="community-actions">
                <button class="inline-link-btn" type="button" data-learn-community="${escapeHtml(communityProfile.user_id)}">
                  Learn About Me
                </button>
              </div>
            </article>
          `;
        })
        .join("")
    : `<div class="empty">Community introductions will appear here after enrolled users add a photo and shared bio.</div>`;

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

function formatSubmissionStatus(status) {
  switch (status) {
    case "draft":
      return "Draft";
    case "submitted":
      return "Submitted";
    case "in_review":
      return "In review";
    case "needs_revision":
      return "Needs revision";
    case "approved":
      return "Approved";
    case "returned":
      return "Returned";
    default:
      return status || "Submitted";
  }
}

function formatSubmissionAnswers(answers) {
  if (!answers || typeof answers !== "object") return "";
  return Object.entries(answers)
    .filter(([key]) => key !== "_notes")
    .map(([key, value]) => {
      const label = key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
      const text = Array.isArray(value) ? value.join(", ") : value;
      return `<div><strong>${escapeHtml(label)}:</strong> ${escapeHtml(text || "No response")}</div>`;
    })
    .join("");
}

function selectedDocumentSubmissionTemplate() {
  const key = documentSubmissionTemplate?.value || DOCUMENT_SUBMISSION_TEMPLATES[0]?.key;
  return (
    DOCUMENT_SUBMISSION_TEMPLATES.find((template) => template.key === key) ||
    DOCUMENT_SUBMISSION_TEMPLATES[0]
  );
}

function renderDocumentSubmissionTemplateOptions() {
  if (!documentSubmissionTemplate) return;
  if (documentSubmissionTemplate.options.length) return;

  documentSubmissionTemplate.innerHTML = DOCUMENT_SUBMISSION_TEMPLATES.map(
    (template) =>
      `<option value="${escapeHtml(template.key)}">${escapeHtml(template.title)}</option>`,
  ).join("");
}

function renderDocumentSubmissionFields() {
  if (!documentSubmissionFields) return;
  const template = selectedDocumentSubmissionTemplate();
  if (!template) {
    documentSubmissionFields.innerHTML = "";
    return;
  }

  documentSubmissionFields.innerHTML = template.fields
    .map((field) => {
      const fieldId = `document-field-${field.id}`;
      if (field.kind === "textarea") {
        return `
          <label>
            ${escapeHtml(field.label)}
            <textarea id="${escapeHtml(fieldId)}" data-document-field="${escapeHtml(field.id)}" placeholder="Write your response here."></textarea>
          </label>
        `;
      }

      if (field.kind === "choice") {
        return `
          <label>
            ${escapeHtml(field.label)}
            <select id="${escapeHtml(fieldId)}" data-document-field="${escapeHtml(field.id)}">
              ${(field.options || []).map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join("")}
            </select>
          </label>
        `;
      }

      if (field.kind === "checks") {
        return `
          <fieldset class="assignment-card" style="margin:0">
            <legend class="mini-label">${escapeHtml(field.label)}</legend>
            ${(field.options || [])
              .map(
                (option, index) => `
                  <label style="display:grid;grid-template-columns:18px minmax(0,1fr);align-items:start;gap:10px;margin-top:10px">
                    <input type="checkbox" data-document-field="${escapeHtml(field.id)}" value="${escapeHtml(option)}" style="width:16px;height:16px;margin-top:2px" />
                    <span>${escapeHtml(option)}</span>
                  </label>
                `,
              )
              .join("")}
          </fieldset>
        `;
      }

      return `
        <label>
          ${escapeHtml(field.label)}
          <input id="${escapeHtml(fieldId)}" data-document-field="${escapeHtml(field.id)}" placeholder="Type your response here." />
        </label>
      `;
    })
    .join("");
}

function collectDocumentSubmissionAnswers(template) {
  const answers = {};
  template.fields.forEach((field) => {
    const inputs = Array.from(
      documentSubmissionFields.querySelectorAll(`[data-document-field="${field.id}"]`),
    );

    if (field.kind === "checks") {
      answers[field.id] = inputs
        .filter((input) => input.checked)
        .map((input) => input.value);
      return;
    }

    answers[field.id] = inputs[0]?.value?.trim() || "";
  });

  answers._notes = documentSubmissionNotes?.value.trim() || "";
  return answers;
}

function renderDocumentSubmissionStudio() {
  if (!documentSubmissionForm || !documentSubmissionList) return;
  renderDocumentSubmissionTemplateOptions();
  if (!documentSubmissionFields.children.length) {
    renderDocumentSubmissionFields();
  }

  documentSubmissionList.innerHTML = state.documentSubmissions.length
    ? state.documentSubmissions
        .map(
          (submission) => `
            <article class="resource-card">
              <div class="assignment-head">
                <div>
                  <div class="mini-label">${escapeHtml(submission.document_type || "document")}</div>
                  <h4>${escapeHtml(submission.document_title)}</h4>
                </div>
                <span class="status-badge ${submission.status === "approved" ? "complete" : submission.status === "needs_revision" ? "revise" : "review"}">${escapeHtml(formatSubmissionStatus(submission.status))}</span>
              </div>
              <p>${escapeHtml(submission.submitted_at ? `Submitted ${new Date(submission.submitted_at).toLocaleString()}` : "Saved for review")}</p>
              <div class="feedback-box">
                ${formatSubmissionAnswers(submission.answers)}
                ${
                  submission.answers?._notes
                    ? `<div style="margin-top:8px"><strong>Notes:</strong> ${escapeHtml(submission.answers._notes)}</div>`
                    : ""
                }
              </div>
              ${
                submission.owner_feedback || submission.owner_score
                  ? `<div class="feedback-box">
                      <strong>Owner / instructor review</strong>
                      <div style="margin-top:8px"><strong>Score:</strong> ${escapeHtml(submission.owner_score || "Pending")}</div>
                      <div style="margin-top:8px">${escapeHtml(submission.owner_feedback || "No note yet.")}</div>
                    </div>`
                  : ""
              }
            </article>
          `,
        )
        .join("")
    : `<div class="empty">No forms or documents have been submitted yet.</div>`;
}

async function submitDocumentSubmission(event) {
  event.preventDefault();
  if (!state.user) {
    showStatus(documentSubmissionStatus, "Sign in before submitting a document.");
    return;
  }

  const template = selectedDocumentSubmissionTemplate();
  if (!template) {
    showStatus(documentSubmissionStatus, "Choose a document first.");
    return;
  }

  const answers = collectDocumentSubmissionAnswers(template);
  const hasResponse = Object.entries(answers).some(([key, value]) => {
    if (key === "_notes") return false;
    if (Array.isArray(value)) return value.length > 0;
    return String(value || "").trim();
  });

  if (!hasResponse) {
    showStatus(documentSubmissionStatus, "Add at least one response before submitting.");
    return;
  }

  showStatus(documentSubmissionStatus, "Submitting document for review...");
  const supabase = getSupabase();
  const { error } = await supabase.rpc("submit_document_response", {
    document_key: template.key,
    document_title: template.title,
    document_type: template.type,
    response_answers: answers,
    next_status: "submitted",
  });

  if (error) throw error;
  documentSubmissionForm.reset();
  renderDocumentSubmissionFields();
  await loadPortalData();
  showStatus(documentSubmissionStatus, "Document submitted for owner/instructor review.", "success");
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

async function saveDiscussionPost(topicKey) {
  const textarea = document.getElementById(`discussion-post-${safeDomId(topicKey)}`);
  const body = textarea?.value.trim() || "";
  if (!body) {
    showStatus(discussionStatus, "Write your discussion post before publishing.");
    return;
  }

  const supabase = getSupabase();
  const { error } = await supabase.rpc("submit_discussion_post", {
    target_topic_key: topicKey,
    post_body: body,
  });

  if (error) throw error;
  await loadPortalData();
  showStatus(discussionStatus, "Discussion post saved. Classmate posts are now unlocked for that topic.", "success");
}

async function saveDiscussionReply(postId) {
  const textarea = document.getElementById(`discussion-reply-${postId}`);
  const body = textarea?.value.trim() || "";
  if (!body) {
    showStatus(discussionStatus, "Write your reply before posting.");
    return;
  }

  const supabase = getSupabase();
  const { error } = await supabase.rpc("submit_discussion_reply", {
    target_post_id: postId,
    reply_body: body,
  });

  if (error) throw error;
  await loadPortalData();
  showStatus(discussionStatus, "Reply posted. Keep going until you have replied to at least two classmates.", "success");
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

  discussionList?.querySelectorAll("[data-save-discussion-post]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await saveDiscussionPost(button.getAttribute("data-save-discussion-post"));
      } catch (error) {
        showStatus(discussionStatus, error.message);
      }
    });
  });

  discussionList?.querySelectorAll("[data-save-discussion-reply]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await saveDiscussionReply(button.getAttribute("data-save-discussion-reply"));
      } catch (error) {
        showStatus(discussionStatus, error.message);
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

  communityDirectoryList.querySelectorAll("[data-open-community], [data-learn-community]").forEach((button) => {
    button.addEventListener("click", () => {
      const userId =
        button.getAttribute("data-open-community") ||
        button.getAttribute("data-learn-community");
      const profile = state.communityProfiles.find((item) => item.user_id === userId);
      if (!profile) return;
      openIdentityModal(profile, { heading: "Learn About Me" });
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

async function uploadProfileImage() {
  if (!state.user) {
    showStatus(profileImageStatus, "Sign in before saving a profile image.");
    return;
  }

  const file = profileImageInput.files?.[0];
  if (!file) {
    showStatus(profileImageStatus, "Choose an image first.");
    return;
  }

  if (!String(file.type || "").startsWith("image/")) {
    showStatus(profileImageStatus, "Please choose an image file.");
    return;
  }

  const supabase = getSupabase();
  const previousPath = state.communityProfile?.profile_image_path || "";
  const storagePath = `${state.user.id}/profile-${Date.now()}-${safeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(COMMUNITY_PROFILE_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  if (previousPath) {
    await supabase.storage.from(COMMUNITY_PROFILE_BUCKET).remove([previousPath]);
  }

  const { data, error } = await supabase
    .from("community_profiles")
    .update({ profile_image_path: storagePath })
    .eq("user_id", state.user.id)
    .select("*")
    .single();

  if (error) throw error;

  state.communityProfiles = await loadCommunityProfiles();
  state.communityProfile =
    state.communityProfiles.find((item) => item.user_id === state.user.id) || data;
  renderPortal();
  profileImageInput.value = "";
  showStatus(profileImageStatus, portalCopyForRole(state.profile?.role).imageStatusSuccess, "success");
}

async function signInUser(email, password) {
  if (!hasSupabaseConfig()) {
    showStatus(studentLoginStatus, "Save your Supabase settings first.");
    return;
  }

  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(email || "").trim(),
    password: String(password || "").trim(),
  });

  if (error) throw error;
  settings.lastAuthEmail = String(email || "").trim();
  saveSettings();
  if (data?.session) {
    await handleSessionChange(data.session, { scrollToWelcome: true });
  }
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
  await handleSessionChange(data.session, { scrollToWelcome: true });
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
  const { data: enrollmentAllowed, error: enrollmentError } = await supabase.rpc(
    "can_create_portal_account",
    {
      account_email: email,
      requested_role: role,
    },
  );

  if (enrollmentError) {
    showStatus(
      signupStatus,
      "The course registration gate is not set up yet. Ask the teacher to run the updated Supabase SQL.",
    );
    return;
  }

  if (!enrollmentAllowed) {
    showStatus(
      signupStatus,
      "Register for the course first. After your registration is approved, use the same email address here to create your account.",
    );
    return;
  }

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
  const bioPayload = {
    bio_proud: bioProudInput.value.trim(),
    bio_goal: bioGoalInput.value.trim(),
    bio_strengths: bioStrengthsInput.value.trim(),
    bio_support: bioSupportInput.value.trim(),
  };

  const { data, error } = await supabase
    .from("profiles")
    .update(bioPayload)
    .eq("id", state.user.id)
    .select("*")
    .single();

  if (error) throw error;
  state.profile = data;
  try {
    const { data: communityData, error: communityError } = await supabase
      .from("community_profiles")
      .update(bioPayload)
      .eq("user_id", state.user.id)
      .select("*")
      .single();

    if (communityError) throw communityError;
    state.communityProfiles = await loadCommunityProfiles();
    state.communityProfile =
      state.communityProfiles.find((item) => item.user_id === state.user.id) || {
        ...communityData,
        profile_image_url: state.communityProfile?.profile_image_url || "",
      };
  } catch (communityError) {
    console.warn("Community bio save skipped.", communityError);
  }
  renderPortal();
  showStatus(
    bioStatus,
    "Your bio was saved and shared with the enrolled program community.",
    "success",
  );
}

async function logoutUser() {
  if (!supabaseClient) return;
  const { error } = await supabaseClient.auth.signOut({ scope: "local" });
  if (error) throw error;
  renderLoggedOutState();
  showStatus(studentLoginStatus, "Signed out.", "success");
}

async function deleteOwnAccount() {
  if (!state.user) {
    showStatus(accountStatus, "Sign in before deleting your account.");
    return;
  }

  const confirmation = window.prompt(
    "This permanently deletes your portal account, profile, assignments, workbook entries, and uploaded files. Type DELETE to continue.",
  );
  if (confirmation !== "DELETE") {
    showStatus(accountStatus, "Account deletion cancelled.");
    return;
  }

  deleteAccountBtn.disabled = true;
  showStatus(accountStatus, "Deleting your account...");
  const supabase = getSupabase();
  const { error } = await supabase.rpc("delete_own_portal_account");
  if (error) {
    deleteAccountBtn.disabled = false;
    throw error;
  }

  await supabase.auth.signOut({ scope: "local" }).catch(() => {});
  renderLoggedOutState();
  showStatus(studentLoginStatus, "Your account was deleted.", "success");
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
    await handleSessionChange(data.session, { scrollToWelcome: false });
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

deleteAccountBtn?.addEventListener("click", async () => {
  try {
    await deleteOwnAccount();
  } catch (error) {
    showStatus(accountStatus, error.message);
  }
});

uploadFileBtn.addEventListener("click", async () => {
  try {
    await uploadSelectedFile();
  } catch (error) {
    showStatus(fileUploadStatus, error.message);
  }
});

uploadProfileImageBtn.addEventListener("click", async () => {
  try {
    await uploadProfileImage();
  } catch (error) {
    showStatus(profileImageStatus, error.message);
  }
});

documentSubmissionTemplate?.addEventListener("change", renderDocumentSubmissionFields);

classroomSearchInput?.addEventListener("input", () => {
  filterClassroomWeeks(classroomSearchInput.value.trim().toLowerCase());
});

classroomNavigationLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const view = link.dataset.classroomNav;
    if (!view) return;
    event.preventDefault();
    selectClassroomView(view);
  });
});

classroomWeekNavList?.addEventListener("click", (event) => {
  const link = event.target.closest("[data-classroom-week-link]");
  if (!link) return;
  event.preventDefault();
  selectClassroomWeek(link.getAttribute("data-classroom-week-link"));
});

expandRoadmapBtn?.addEventListener("click", () => {
  const card = document.getElementById(`classroom-week-${selectedClassroomWeek}`);
  if (card) card.open = true;
});

collapseRoadmapBtn?.addEventListener("click", () => {
  const card = document.getElementById(`classroom-week-${selectedClassroomWeek}`);
  if (card) card.open = false;
});

window.addEventListener("hashchange", () => {
  const weekFromHash = getWeekFromHash();
  if (weekFromHash) {
    selectClassroomWeek(weekFromHash, { updateHash: false });
    return;
  }
  const viewFromHash = getViewFromHash();
  if (viewFromHash) {
    selectClassroomView(viewFromHash, { updateHash: false });
  }
});

documentSubmissionForm?.addEventListener("submit", async (event) => {
  try {
    await submitDocumentSubmission(event);
  } catch (error) {
    showStatus(documentSubmissionStatus, error.message);
  }
});

editWelcomeProfileBtn.addEventListener("click", () => {
  profileImageInput?.click();
});

welcomeProfileImage?.addEventListener("click", () => {
  const profile = state.communityProfile || state.profile;
  if (!profile) return;
  openIdentityModal(profile, { heading: "Your Profile Image" });
});

welcomeProfileFallback?.addEventListener("click", () => {
  const profile = state.communityProfile || state.profile;
  if (!profile) return;
  openIdentityModal(profile, { heading: "Your Profile Image" });
});

identityModalCloseBtn?.addEventListener("click", () => {
  closeIdentityModal();
});

identityModal?.addEventListener("click", (event) => {
  if (event.target === identityModal) {
    closeIdentityModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && identityModal && !identityModal.hidden) {
    closeIdentityModal();
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
      return handleSessionChange(data.session, { scrollToWelcome: false });
    })
    .catch((error) => {
      showStatus(studentLoginStatus, error.message);
    });
}
