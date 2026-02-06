const scenarioGrid = document.getElementById("scenarioGrid");
const introPanel = document.getElementById("introPanel");
const gamePanel = document.getElementById("gamePanel");
const aiPanel = document.getElementById("aiPanel");
const scenarioTitle = document.getElementById("scenarioTitle");
const scenarioSummary = document.getElementById("scenarioSummary");
const scenarioTags = document.getElementById("scenarioTags");
const stepPrompt = document.getElementById("stepPrompt");
const choicesEl = document.getElementById("choices");
const toolAnswerEl = document.getElementById("toolAnswer");
const conceptAnswerEl = document.getElementById("conceptAnswer");
const whyAnswerEl = document.getElementById("whyAnswer");
const submitDecision = document.getElementById("submitDecision");
const nextStepBtn = document.getElementById("nextStep");
const feedbackPanel = document.getElementById("feedbackPanel");
const consequenceEl = document.getElementById("consequence");
const aiFeedbackEl = document.getElementById("aiFeedback");
const aiOptionsEl = document.getElementById("aiOptions");
const aiVideoEl = document.getElementById("aiVideo");
const budgetBar = document.getElementById("budgetBar");
const timeBar = document.getElementById("timeBar");
const trustBar = document.getElementById("trustBar");
const chatEl = document.getElementById("chat");
const aiToggle = document.getElementById("aiToggle");
const chatMessage = document.getElementById("chatMessage");
const sendChat = document.getElementById("sendChat");
const exportSession = document.getElementById("exportSession");
const openSettings = document.getElementById("openSettings");
const exportCsv = document.getElementById("exportCsv");
const settingsDialog = document.getElementById("settingsDialog");
const endpointUrlInput = document.getElementById("endpointUrl");
const apiKeyInput = document.getElementById("apiKey");
const modelNameInput = document.getElementById("modelName");
const saveSettings = document.getElementById("saveSettings");
const teacherToggle = document.getElementById("teacherToggle");
const resourceSelect = document.getElementById("resourceSelect");
const yearPreviewEl = document.getElementById("yearPreview");
const monthPreviewEl = document.getElementById("monthPreview");
const yearPreviewGridEl = document.getElementById("yearPreviewGrid");
const previewTabButtons = document.querySelectorAll(".tab-button");
const monthTabsEl = document.getElementById("monthTabs");
const monthToggle = document.getElementById("monthToggle");
const infoBadges = document.querySelectorAll(".info-badge");
const currentDateEl = document.getElementById("currentDate");
const currentScenarioLabelEl = document.getElementById("currentScenarioLabel");

let scenarios = [];
let weeklyScenarios = [];
let rubric = null;
let currentScenario = null;
let currentStepId = null;
let selectedChoice = null;
let meters = { budget: 50, time: 50, trust: 50 };
let sessionLog = [];
let chatLog = [];
let stepChatIndex = 0;
let followUpIndex = 0;
let teacherMode = false;
const TEACHER_PIN = "4429";

const ROTATION_START = "2026-02-02";
const WEEKS_PER_YEAR = 40;
const SCENARIOS_PER_WEEK = 7;
const SCENARIO_YEAR_KEY = "decision-lab-scenario-year";

const settingsKey = "decision-lab-settings";

function loadSettings() {
  const saved = localStorage.getItem(settingsKey);
  if (!saved) return {};
  try {
    return JSON.parse(saved);
  } catch {
    return {};
  }
}

function saveSettingsToStorage(settings) {
  localStorage.setItem(settingsKey, JSON.stringify(settings));
}

function loadTeacherMode() {
  const saved = localStorage.getItem("decision-lab-teacher-mode");
  teacherMode = saved === "true";
  updateTeacherControls();
}

function updateTeacherControls() {
  if (!openSettings || !exportSession || !exportCsv) return;
  openSettings.classList.toggle("hidden", !teacherMode);
  exportSession.classList.toggle("hidden", !teacherMode);
  exportCsv.classList.toggle("hidden", !teacherMode);
}

async function loadData() {
  try {
    const [scenarioRes, rubricRes] = await Promise.all([
      fetch("scenarios.json"),
      fetch("rubric.json")
    ]);
    const scenarioData = await scenarioRes.json();
    const rubricData = await rubricRes.json();
    scenarios = scenarioData.scenarios;
    rubric = rubricData;
  } catch (error) {
    const scenarioScript = document.getElementById("scenariosData");
    const rubricScript = document.getElementById("rubricData");
    if (!scenarioScript || !rubricScript) {
      alert("Scenario data missing. Please run a local server or check files.");
      throw error;
    }
    const scenarioData = JSON.parse(scenarioScript.textContent || "{}");
    const rubricData = JSON.parse(rubricScript.textContent || "{}");
    scenarios = scenarioData.scenarios || [];
    rubric = rubricData;
  }
  if (!rubric) {
    alert("Rubric data missing. Please run a local server or check files.");
    return;
  }
  const yearData = getScenarioYear();
  scenarios = yearData.scenarios;
  weeklyScenarios = getWeeklyScenarios(yearData);
  renderScenarioCards();
  applySettingsToUI();
  renderYearPreview();
  renderIntroMeta();
  loadTeacherMode();
}

function renderScenarioCards() {
  scenarioGrid.innerHTML = "";
  const list = weeklyScenarios.length ? weeklyScenarios : scenarios;
  list.forEach((scenario) => {
    const card = document.createElement("div");
    card.className = "scenario-card";
    card.innerHTML = `
      <h3>${scenario.title}</h3>
      <p>${scenario.summary}</p>
      <div class="tags">
        ${scenario.stakes.map((stake) => `<span class="tag">${stake}</span>`).join("")}
      </div>
    `;
    card.addEventListener("click", () => startScenario(scenario.id));
    scenarioGrid.appendChild(card);
  });
}

function renderYearPreview() {
  if (!yearPreviewEl || !scenarios.length) return;
  const now = new Date();
  const startDate = new Date(getScenarioYear().startDate);
  const weeks = [];

  for (let week = 0; week < WEEKS_PER_YEAR; week += 1) {
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + week * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const monthKey = weekStart.toLocaleString(undefined, { month: "long", year: "numeric" });
    weeks.push({ week, weekStart, weekEnd, monthKey });
  }

  const months = new Map();
  const monthKeys = [];
  const monthCursor = new Date(startDate);
  monthCursor.setDate(1);
  for (let i = 0; i < 12; i += 1) {
    const key = monthCursor.toLocaleString(undefined, { month: "long", year: "numeric" });
    monthKeys.push(key);
    months.set(key, []);
    monthCursor.setMonth(monthCursor.getMonth() + 1);
  }
  weeks.forEach((week) => {
    if (months.has(week.monthKey)) {
      months.get(week.monthKey).push(week);
    }
  });

  monthPreviewEl.innerHTML = "";
  yearPreviewGridEl.innerHTML = "";
  const monthGrid = document.createElement("div");
  monthGrid.className = "month-grid";

  months.forEach((weekList, monthKey) => {
    const card = document.createElement("div");
    card.className = "month-card";
    card.innerHTML = `<div class=\"month-title\">${monthKey}</div>`;
    const weekListEl = document.createElement("div");
    weekListEl.className = "week-list";

    weekList.forEach((weekInfo) => {
      const weekRow = document.createElement("div");
      weekRow.className = "week-row";
      if (isCurrentWeek(weekInfo.weekStart, now)) {
        weekRow.classList.add("current-week");
      }
      const label = document.createElement("div");
      label.textContent = `Week ${weekInfo.week + 1}`;

      const scenarioWrap = document.createElement("div");
      const scenarioStart = weekInfo.week * SCENARIOS_PER_WEEK;
      const weekScenarios = scenarios.slice(scenarioStart, scenarioStart + SCENARIOS_PER_WEEK);

      weekScenarios.forEach((scenario, index) => {
        const unlockDate = new Date(weekInfo.weekStart);
        unlockDate.setDate(weekInfo.weekStart.getDate() + index);
        unlockDate.setHours(0, 0, 0, 0);
        const isUnlocked = now >= unlockDate;

        const chip = document.createElement("span");
        chip.className = "scenario-chip";
        const title = document.createElement("span");
        title.textContent = scenario.title;
        if (!isUnlocked) title.classList.add("blurred");

        const categories = document.createElement("span");
        categories.textContent = `(${scenario.stakes.join(", ")})`;
        if (!isUnlocked) categories.classList.add("blurred");

        chip.appendChild(title);
        chip.appendChild(categories);

        if (!isUnlocked) {
          const lock = document.createElement("span");
          lock.className = "lock-pill";
          lock.textContent = `Locked until ${unlockDate.toLocaleDateString()}`;
          chip.appendChild(lock);
        }

        scenarioWrap.appendChild(chip);
      });

      weekRow.appendChild(label);
      weekRow.appendChild(scenarioWrap);
      weekListEl.appendChild(weekRow);
    });

    card.appendChild(weekListEl);
    monthGrid.appendChild(card);
  });

  const currentMonthKey = now.toLocaleString(undefined, { month: "long", year: "numeric" });
  const activeMonthKey = monthKeys.includes(currentMonthKey) ? currentMonthKey : monthKeys[0];

  renderMonthTabs(monthKeys, activeMonthKey, months, now, startDate);
  renderMonthContent(activeMonthKey, months, now, startDate);
  yearPreviewGridEl.classList.add("hidden");
  if (previewTabButtons.length) {
    previewTabButtons.forEach((button) => button.classList.remove("active"));
    previewTabButtons[0].classList.add("active");
  }
  initMonthToggle();
}

function renderIntroMeta() {
  if (currentDateEl) {
    const now = new Date();
    currentDateEl.textContent = now.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  if (currentScenarioLabelEl) {
    const todayScenario = getTodayScenario();
    currentScenarioLabelEl.textContent = todayScenario ? todayScenario.title : "Boundary Test";
  }
}

function getTodayScenario() {
  if (!scenarios.length) return null;
  const now = new Date();
  const yearData = getScenarioYear();
  const startDate = new Date(yearData.startDate);
  const weekIndex = Math.max(0, Math.min(WEEKS_PER_YEAR - 1, getWeekIndex(startDate, now)));
  const dayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const scenarioIndex = weekIndex * SCENARIOS_PER_WEEK + dayIndex;
  return scenarios[scenarioIndex] || null;
}

function buildMonthCard(monthKey, weekList, now, startDate) {
  const card = document.createElement("div");
  card.className = "month-card";
  card.innerHTML = `<div class=\"month-title\">${monthKey}</div>`;
  const weekListEl = document.createElement("div");
  weekListEl.className = "week-list";

  weekList.forEach((weekInfo) => {
    const weekRow = document.createElement("div");
    weekRow.className = "week-row";
    if (isCurrentWeek(weekInfo.weekStart, now)) {
      weekRow.classList.add("current-week");
    }
    const label = document.createElement("div");
    label.textContent = `Week ${weekInfo.week + 1}`;
    const scenarioWrap = document.createElement("div");
    const scenarioStart = weekInfo.week * SCENARIOS_PER_WEEK;
    const weekScenarios = scenarios.slice(scenarioStart, scenarioStart + SCENARIOS_PER_WEEK);
    weekScenarios.forEach((scenario, index) => {
      const unlockDate = new Date(weekInfo.weekStart);
      unlockDate.setDate(weekInfo.weekStart.getDate() + index);
      unlockDate.setHours(0, 0, 0, 0);
      const isUnlocked = now >= unlockDate;

      const chip = document.createElement("span");
      chip.className = "scenario-chip";
      const title = document.createElement("span");
      title.textContent = scenario.title;
      if (!isUnlocked) title.classList.add("blurred");
      const categories = document.createElement("span");
      categories.textContent = `(${scenario.stakes.join(", ")})`;
      if (!isUnlocked) categories.classList.add("blurred");

      chip.appendChild(title);
      chip.appendChild(categories);
      if (!isUnlocked) {
        const lock = document.createElement("span");
        lock.className = "lock-pill";
        lock.textContent = `Locked until ${unlockDate.toLocaleDateString()}`;
        chip.appendChild(lock);
      }
      scenarioWrap.appendChild(chip);
    });
    weekRow.appendChild(label);
    weekRow.appendChild(scenarioWrap);
    weekListEl.appendChild(weekRow);
  });

  card.appendChild(weekListEl);
  return card;
}

function renderMonthTabs(monthKeys, activeKey, months, now, startDate) {
  if (!monthTabsEl) return;
  monthTabsEl.innerHTML = "";
  monthKeys.forEach((key) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "month-tab";
    btn.textContent = key;
    if (key === activeKey) btn.classList.add("active");
    btn.addEventListener("click", () => {
      monthTabsEl.querySelectorAll(".month-tab").forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");
      renderMonthContent(key, months, now, startDate);
    });
    monthTabsEl.appendChild(btn);
  });
}

function initMonthToggle() {
  if (!monthToggle || !monthTabsEl) return;
  monthToggle.addEventListener("click", () => {
    monthTabsEl.classList.toggle("collapsed");
    const isCollapsed = monthTabsEl.classList.contains("collapsed");
    monthToggle.setAttribute("aria-expanded", isCollapsed ? "false" : "true");
  });
}

function renderMonthContent(monthKey, months, now, startDate) {
  monthPreviewEl.innerHTML = "";
  const weekList = months.get(monthKey) || [];
  const currentWeek = weekList.find((week) => isCurrentWeek(week.weekStart, now));
  const currentDayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;

  const card = document.createElement("div");
  card.className = "month-card";
  card.innerHTML = `<div class=\"month-title\">${monthKey}</div>`;

  if (!currentWeek) {
    const empty = document.createElement("div");
    empty.textContent = "No active week in this month yet.";
    empty.className = "lock-pill";
    card.appendChild(empty);
    monthPreviewEl.appendChild(card);
    return;
  }

  const scenarioStart = currentWeek.week * SCENARIOS_PER_WEEK;
  const weekScenarios = scenarios.slice(scenarioStart, scenarioStart + SCENARIOS_PER_WEEK);
  const todayScenario = weekScenarios[currentDayIndex];
  const unlockDate = new Date(currentWeek.weekStart);
  unlockDate.setDate(currentWeek.weekStart.getDate() + currentDayIndex);
  unlockDate.setHours(0, 0, 0, 0);

  const list = document.createElement("div");
  list.className = "week-list";
  const row = document.createElement("div");
  row.className = "week-row current-week";
  const label = document.createElement("div");
  label.textContent = now.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  const chip = document.createElement("span");
  chip.className = "scenario-chip";
  const title = document.createElement("span");
  title.textContent = todayScenario ? todayScenario.title : "No scenario available";
  const categories = document.createElement("span");
  categories.textContent = todayScenario ? `(${todayScenario.stakes.join(", ")})` : "";
  chip.appendChild(title);
  chip.appendChild(categories);
  if (now < unlockDate) {
    title.classList.add("blurred");
    categories.classList.add("blurred");
    const lock = document.createElement("span");
    lock.className = "lock-pill";
    lock.textContent = `Locked until ${unlockDate.toLocaleDateString()}`;
    chip.appendChild(lock);
  }
  row.appendChild(label);
  row.appendChild(chip);
  list.appendChild(row);
  card.appendChild(list);
  monthPreviewEl.appendChild(card);
}

function isCurrentWeek(weekStart, now) {
  const start = startOfWeekMonday(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return now >= start && now <= end;
}

previewTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    previewTabButtons.forEach((el) => el.classList.remove("active"));
    button.classList.add("active");
  });
});

function startScenario(id) {
  const studentName = document.getElementById("studentName").value.trim();
  const studentGrade = document.getElementById("studentGrade").value.trim();
  const studentAge = document.getElementById("studentAge").value.trim();
  if (!studentName) {
    alert("Please enter a student name.");
    return;
  }

  currentScenario = weeklyScenarios.find((scenario) => scenario.id === id) ||
    scenarios.find((scenario) => scenario.id === id);
  currentStepId = currentScenario.startStep;
  meters = { ...currentScenario.meters };
  sessionLog = [];
  chatLog = [];
  stepChatIndex = 0;
  followUpIndex = 0;

  introPanel.classList.add("hidden");
  gamePanel.classList.remove("hidden");
  aiPanel.classList.remove("hidden");

  scenarioTitle.textContent = currentScenario.title;
  scenarioSummary.textContent = currentScenario.summary;
  scenarioTags.innerHTML = currentScenario.stakes.map((stake) => `<span class="tag">${stake}</span>`).join("");

  const profile = {
    studentName,
    studentGrade,
    studentAge,
    scenarioId: id,
    startTime: new Date().toISOString()
  };
  sessionLog.push({ type: "profile", data: profile });

  updateMeters();
  renderStep();
  renderChatIntro();
}

function renderStep() {
  selectedChoice = null;
  feedbackPanel.classList.add("hidden");
  nextStepBtn.classList.add("hidden");
  toolAnswerEl.value = "";
  conceptAnswerEl.value = "";
  whyAnswerEl.value = "";

  if (currentStepId === "end") {
    stepPrompt.textContent = "Scenario complete. Review your decisions and reflections.";
    choicesEl.innerHTML = "";
    submitDecision.classList.add("hidden");
    nextStepBtn.textContent = "Restart";
    nextStepBtn.classList.remove("hidden");
    return;
  }

  const step = currentScenario.steps[currentStepId];
  stepPrompt.textContent = step.prompt;
  choicesEl.innerHTML = "";
  submitDecision.classList.remove("hidden");

  step.choices.forEach((choice) => {
    const choiceEl = document.createElement("div");
    choiceEl.className = "choice";
    choiceEl.textContent = choice.text;
    choiceEl.addEventListener("click", () => {
      document.querySelectorAll(".choice").forEach((el) => el.classList.remove("active"));
      choiceEl.classList.add("active");
      selectedChoice = choice;
    });
    choicesEl.appendChild(choiceEl);
  });
}


function updateMeters() {
  budgetBar.style.width = `${clamp(meters.budget)}%`;
  timeBar.style.width = `${clamp(meters.time)}%`;
  trustBar.style.width = `${clamp(meters.trust)}%`;
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function scoreJustification(text) {
  const lower = text.toLowerCase();
  const scores = rubric.criteria.map((criterion) => {
    let matches = 0;
    criterion.keywords.forEach((word) => {
      if (lower.includes(word.toLowerCase())) matches += 1;
    });
    const score = Math.min(criterion.max, matches > 0 ? Math.ceil((matches / criterion.keywords.length) * criterion.max * 2) : 0);
    return { ...criterion, score };
  });

  let lengthBonus = 0;
  if (lower.length >= rubric.minimumLength) {
    lengthBonus = rubric.lengthScore;
  }

  const groupMatches = {
    tools: hasKeyword(lower, rubric.requiredGroups.tools) || hasLabel(lower, "tool"),
    concepts: hasKeyword(lower, rubric.requiredGroups.concepts) || hasLabel(lower, "concept"),
    why: hasKeyword(lower, rubric.requiredGroups.why) || hasLabel(lower, "why")
  };
  const matchedGroupCount = Object.values(groupMatches).filter(Boolean).length;
  const missingGroups = Object.entries(groupMatches)
    .filter(([, matched]) => !matched)
    .map(([group]) => group);

  return { scores, lengthBonus, groupMatches, matchedGroupCount, missingGroups };
}

submitDecision.addEventListener("click", () => {
  if (!selectedChoice) {
    alert("Select a decision first.");
    return;
  }
  const toolAnswer = toolAnswerEl.value.trim();
  const conceptAnswer = conceptAnswerEl.value.trim();
  const whyAnswer = whyAnswerEl.value.trim();
  if (!toolAnswer || !conceptAnswer || !whyAnswer) {
    alert("Complete all three boxes: Tool, Concept, and Why.");
    return;
  }
  const justification = `Tool: ${toolAnswer} Concept: ${conceptAnswer} Why: ${whyAnswer}`;

  const step = currentScenario.steps[currentStepId];
  const scoreResult = scoreJustification(justification);

  meters.budget += selectedChoice.meterImpact.budget;
  meters.time += selectedChoice.meterImpact.time;
  meters.trust += selectedChoice.meterImpact.trust;

  updateMeters();

  consequenceEl.textContent = selectedChoice.consequence;
  renderAiFeedback({
    toolAnswer,
    conceptAnswer,
    whyAnswer,
    choice: selectedChoice,
    step: currentScenario.steps[currentStepId],
    scenario: currentScenario
  });
  feedbackPanel.classList.remove("hidden");
  nextStepBtn.textContent = currentStepId === "end" ? "Restart" : "Next";
  nextStepBtn.classList.remove("hidden");

  sessionLog.push({
    type: "decision",
    step: currentStepId,
    choice: selectedChoice.id,
    toolAnswer,
    conceptAnswer,
    whyAnswer,
    justification,
    meters: { ...meters },
    score: scoreResult
  });
});

nextStepBtn.addEventListener("click", () => {
  if (currentStepId === "end") {
    introPanel.classList.remove("hidden");
    gamePanel.classList.add("hidden");
    aiPanel.classList.add("hidden");
    submitDecision.classList.remove("hidden");
    return;
  }

  currentStepId = selectedChoice ? selectedChoice.nextStep : currentStepId;
  if (currentStepId === "end") {
    stepPrompt.textContent = "Scenario complete. Review your decisions and reflections.";
  }
  renderStep();
  renderChatIntro();
});

function renderChatIntro() {
  chatEl.innerHTML = "";
  stepChatIndex = 0;
  followUpIndex = 0;
  if (currentStepId === "end") {
    addChatBubble("ai", "Scenario complete. Reflect on your choices before leaving.");
    return;
  }
  const step = currentScenario.steps[currentStepId];
  addChatBubble("ai", `${step.stakeholder}: ${step.aiPrompts[0]}`);
  stepChatIndex = 1;
}

function addChatBubble(role, text) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${role}`;
  bubble.textContent = text;
  chatEl.appendChild(bubble);
  chatEl.scrollTop = chatEl.scrollHeight;
}

function hasKeyword(text, keywords) {
  return keywords.some((word) => text.includes(word.toLowerCase()));
}

function hasLabel(text, label) {
  const pattern = new RegExp(`\\b${label}\\s*:\\b`, "i");
  return pattern.test(text);
}

async function handleChatSend() {
  const message = chatMessage.value.trim();
  if (!message) return;
  addChatBubble("user", message);
  chatMessage.value = "";

  const reply = await getAiReply(message);
  addChatBubble("ai", reply);
}

async function getAiReply(message) {
  const settings = loadSettings();
  const step = currentScenario.steps[currentStepId];

  if (!settings.endpointUrl) {
    const responses = step.aiPrompts;
    const prompts = responses.length ? responses : ["I hear you. Tell me more."];
    const prompt = prompts[stepChatIndex % prompts.length];
    stepChatIndex += 1;
    const followUps = [
      "What trade-off are you seeing here?",
      "Which boundary or value matters most right now?",
      "What is your best next step and why?",
      "What is the biggest risk if you choose that?",
      "How does this affect trust or long-term reputation?"
    ];
    const followUp = followUps[followUpIndex % followUps.length];
    followUpIndex += 1;
    return `${prompt} ${followUp}`;
  }

  const payload = {
    model: settings.modelName || undefined,
    messages: [
      {
        role: "system",
        content: `You are role-playing a stakeholder in a classroom decision scenario. Keep responses short, safe, and focused. Ask the student to justify decisions using unit language. Scenario: ${currentScenario.title}. Step: ${step.prompt}`
      },
      { role: "user", content: message }
    ],
    rubric
  };

  try {
    const response = await fetch(settings.endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(settings.apiKey ? { "Authorization": `Bearer ${settings.apiKey}` } : {})
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return data.reply || data.response || "Thanks. Explain your reasoning using unit language.";
  } catch (error) {
    return "Connection issue. Use the justification box to explain your reasoning.";
  }
}

async function renderAiFeedback(context) {
  const settings = loadSettings();
  if (settings.endpointUrl) {
    const ai = await getAiFeedback(context, settings);
    applyAiFeedback(ai, context);
    return;
  }
  const fallback = buildFallbackFeedback(context);
  applyAiFeedback(fallback, context);
}

async function getAiFeedback(context, settings) {
  const payload = {
    model: settings.modelName || undefined,
    type: "decision_feedback",
    scenario: {
      title: context.scenario.title,
      summary: context.scenario.summary,
      stakes: context.scenario.stakes
    },
    decision: {
      choice: context.choice.text,
      consequence: context.choice.consequence,
      tool: context.toolAnswer,
      concept: context.conceptAnswer,
      why: context.whyAnswer
    },
    rubric
  };

  try {
    const response = await fetch(settings.endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(settings.apiKey ? { "Authorization": `Bearer ${settings.apiKey}` } : {})
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return {
      feedback: data.feedback || data.response || "Thanks for your response. Reflect on your next step.",
      options: data.options || data.next_steps || [],
      videoQuery: data.video_query || data.videoQuery || "",
      videoUrl: data.video_url || data.videoUrl || ""
    };
  } catch (error) {
    return buildFallbackFeedback(context);
  }
}

function applyAiFeedback(ai, context) {
  if (aiFeedbackEl) {
    aiFeedbackEl.textContent = ai.feedback || "Thanks for your response. Reflect on your next step.";
  }
  if (aiOptionsEl) {
    aiOptionsEl.innerHTML = "";
    const options = ai.options && ai.options.length ? ai.options : buildDefaultOptions(context);
    options.slice(0, 3).forEach((option) => {
      const li = document.createElement("li");
      li.textContent = option;
      aiOptionsEl.appendChild(li);
    });
  }
  if (aiVideoEl) {
    const link = document.createElement("a");
    const query = ai.videoQuery || context.scenario.videoQuery || buildVideoQuery(context);
    const url = ai.videoUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = query ? `Search YouTube: ${query}` : "Search YouTube for related guidance";
    aiVideoEl.innerHTML = "";
    aiVideoEl.appendChild(link);
  }
}

function buildFallbackFeedback(context) {
  return {
    feedback: `You chose: ${context.choice.text} This protects you in the short term, but consider how it affects trust and long-term goals.`,
    options: buildDefaultOptions(context),
    videoQuery: buildVideoQuery(context)
  };
}

function buildDefaultOptions(context) {
  return [
    "Pause and gather one more fact before deciding.",
    "Ask a trusted adult or peer for a second perspective.",
    "Set a clear boundary and explain your long-term goal."
  ];
}

function buildVideoQuery(context) {
  const id = context.scenario.id || "";
  const title = context.scenario.title.toLowerCase();
  const tags = context.scenario.stakes.join(" ").toLowerCase();
  const hay = `${id} ${title} ${tags}`;

  const library = [
    { match: ["online", "rumor", "reputation", "digital"], query: "digital citizenship online reputation decision making" },
    { match: ["job", "employment", "manager", "workplace"], query: "workplace communication boundaries decision making" },
    { match: ["peer pressure", "safety", "ride", "driving"], query: "peer pressure safety decision making teens" },
    { match: ["group", "project", "team", "conflict"], query: "conflict resolution teamwork accountability students" },
    { match: ["health", "injury", "sports"], query: "sports injury decision making athlete health" },
    { match: ["budget", "money", "finances", "family"], query: "teen budgeting priorities trade-offs decision making" },
    { match: ["self-regulation", "impulse", "stress"], query: "self regulation impulse control teens" },
    { match: ["boundary", "boundaries"], query: "setting boundaries teens respectful communication" }
  ];

  for (const item of library) {
    if (item.match.some((term) => hay.includes(term))) {
      return item.query;
    }
  }

  const stakes = context.scenario.stakes.join(" ");
  return `${context.scenario.title} decision-making ${stakes}`;
}

sendChat.addEventListener("click", handleChatSend);
chatMessage.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleChatSend();
  }
});

aiToggle.addEventListener("change", () => {
  if (aiToggle.checked) {
    addChatBubble("ai", "Role-play enabled. Ask a question or explain your thinking.");
  }
});

exportSession.addEventListener("click", () => {
  if (!sessionLog.length) {
    alert("No session data to export yet.");
    return;
  }
  const blob = new Blob([JSON.stringify(sessionLog, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `decision-lab-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

openSettings.addEventListener("click", () => {
  settingsDialog.showModal();
});

saveSettings.addEventListener("click", () => {
  const settings = {
    endpointUrl: endpointUrlInput.value.trim(),
    apiKey: apiKeyInput.value.trim(),
    modelName: modelNameInput.value.trim()
  };
  saveSettingsToStorage(settings);
});

teacherToggle.addEventListener("click", () => {
  if (teacherMode) {
    teacherMode = false;
    localStorage.setItem("decision-lab-teacher-mode", "false");
    updateTeacherControls();
    return;
  }
  const pin = prompt("Enter teacher PIN");
  if (pin === null) return;
  if (pin === TEACHER_PIN) {
    teacherMode = true;
    localStorage.setItem("decision-lab-teacher-mode", "true");
    updateTeacherControls();
  } else {
    alert("Incorrect PIN.");
  }
});

if (resourceSelect) {
  resourceSelect.addEventListener("change", () => {
    const url = resourceSelect.value;
    if (url) {
      window.open(url, "_blank", "noopener");
      resourceSelect.value = "";
    }
  });
}

exportCsv.addEventListener("click", () => {
  if (!sessionLog.length) {
    alert("No session data to export yet.");
    return;
  }
  const rows = [];
  const headers = [
    "studentName",
    "studentGrade",
    "studentAge",
    "scenarioId",
    "step",
    "choice",
    "toolAnswer",
    "conceptAnswer",
    "whyAnswer",
    "timestamp"
  ];
  rows.push(headers.join(","));
  const profile = sessionLog.find((item) => item.type === "profile");
  const profileData = profile ? profile.data : {};
  sessionLog
    .filter((item) => item.type === "decision")
    .forEach((item) => {
      const row = [
        profileData.studentName || "",
        profileData.studentGrade || "",
        profileData.studentAge || "",
        profileData.scenarioId || "",
        item.step || "",
        item.choice || "",
        sanitizeCsv(item.toolAnswer || ""),
        sanitizeCsv(item.conceptAnswer || ""),
        sanitizeCsv(item.whyAnswer || ""),
        new Date().toISOString()
      ];
      rows.push(row.map(csvEscape).join(","));
    });
  const csvContent = rows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `decision-lab-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

function sanitizeCsv(value) {
  return value.replace(/\\r?\\n/g, " ").trim();
}

function csvEscape(value) {
  if (value.includes(",") || value.includes("\"")) {
    return `\"${value.replace(/\"/g, '\"\"')}\"`;
  }
  return value;
}

function applySettingsToUI() {
  const settings = loadSettings();
  endpointUrlInput.value = settings.endpointUrl || "";
  apiKeyInput.value = settings.apiKey || "";
  modelNameInput.value = settings.modelName || "";
}

function getScenarioYear() {
  const now = new Date();
  const stored = localStorage.getItem(SCENARIO_YEAR_KEY);
  if (stored) {
    try {
      const data = JSON.parse(stored);
      const startDate = new Date(data.startDate);
      const weeksPassed = getWeekIndex(startDate, now);
      if (weeksPassed < WEEKS_PER_YEAR) {
        return data;
      }
    } catch {
      // fall through to regenerate
    }
  }

  const startDate = new Date(ROTATION_START);
  const effectiveStart = now >= startDate ? startOfWeekMonday(now) : startDate;
  const seed = effectiveStart.toISOString().slice(0, 10).replace(/-/g, "");
  const scenarios = generateScenarioYear(seed);
  const data = {
    id: `year-${seed}`,
    startDate: effectiveStart.toISOString(),
    scenarios
  };
  localStorage.setItem(SCENARIO_YEAR_KEY, JSON.stringify(data));
  return data;
}

function getWeeklyScenarios(yearData) {
  const now = new Date();
  const startDate = new Date(yearData.startDate);
  const weekIndex = Math.max(0, Math.min(WEEKS_PER_YEAR - 1, getWeekIndex(startDate, now)));
  const start = weekIndex * SCENARIOS_PER_WEEK;
  return yearData.scenarios.slice(start, start + SCENARIOS_PER_WEEK);
}

function getWeekIndex(startDate, now) {
  const start = startOfWeekMonday(startDate);
  const diffMs = now.getTime() - start.getTime();
  if (diffMs < 0) return 0;
  return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
}

function startOfWeekMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function generateScenarioYear(seed) {
  const rng = mulberry32(hashSeed(seed));
  const contexts = buildContexts(rng, WEEKS_PER_YEAR);
  const templates = buildTemplates();
  const scenarios = [];

  contexts.forEach((context, weekIndex) => {
    templates.forEach((template, tIndex) => {
      const scenario = template(context, weekIndex, tIndex);
      scenarios.push(scenario);
    });
  });

  return scenarios;
}

function buildContexts(rng, count) {
  const settings = [
    "school hallway",
    "cafeteria",
    "bus stop",
    "after-school program",
    "practice field",
    "group chat",
    "library",
    "community center",
    "part-time job",
    "family living room",
    "neighborhood park",
    "student council",
    "club meeting",
    "classroom presentation",
    "online forum",
    "school event",
    "volunteer site",
    "tutoring session",
    "workplace shift",
    "team meeting"
  ];
  const stakeholders = [
    { primary: "Peer", secondary: "Teacher" },
    { primary: "Coach", secondary: "Parent" },
    { primary: "Manager", secondary: "Guardian" },
    { primary: "Friend", secondary: "Sibling" },
    { primary: "Team lead", secondary: "Advisor" },
    { primary: "Group partner", secondary: "Teacher" },
    { primary: "Supervisor", secondary: "Parent" },
    { primary: "Roommate", secondary: "Mentor" }
  ];
  const stakes = [
    ["Reputation", "Trust", "Long-term goals"],
    ["Safety", "Peer pressure", "Decision ownership"],
    ["Time pressure", "Grades", "Accountability"],
    ["Family stability", "Finances", "Responsibility"],
    ["Health", "Team impact", "Future opportunities"],
    ["Digital behavior", "Respect", "Credibility"],
    ["Employment", "Reliability", "School performance"],
    ["Conflict resolution", "Relationships", "Values"]
  ];

  const contexts = [];
  const used = new Set();
  while (contexts.length < count) {
    const setting = pick(settings, rng);
    const stakeholder = pick(stakeholders, rng);
    const stakeSet = pick(stakes, rng);
    const key = `${setting}-${stakeholder.primary}-${stakeSet[0]}`;
    if (used.has(key)) continue;
    used.add(key);
    contexts.push({
      setting,
      stakeholder,
      stakes: stakeSet
    });
  }
  return contexts;
}

function buildTemplates() {
  return [
    (context, weekIndex, tIndex) => ({
      id: `week${weekIndex + 1}-scenario${tIndex + 1}`,
      title: `Split Decision at the ${capitalize(context.setting)}`,
      summary: `You face a fast decision in the ${context.setting} that affects ${context.stakes[0].toLowerCase()}.`,
      stakes: context.stakes,
      roles: ["Student", context.stakeholder.primary, context.stakeholder.secondary],
      startStep: "step1",
      meters: { budget: 50, time: 50, trust: 50 },
      steps: buildThreeStepFlow(context, "pressure")
    }),
    (context, weekIndex, tIndex) => ({
      id: `week${weekIndex + 1}-scenario${tIndex + 2}`,
      title: `Conflict and Repair`,
      summary: `A conflict in the ${context.setting} requires a decision about accountability and trust.`,
      stakes: context.stakes,
      roles: ["Student", context.stakeholder.primary, context.stakeholder.secondary],
      startStep: "step1",
      meters: { budget: 45, time: 55, trust: 45 },
      steps: buildThreeStepFlow(context, "repair")
    }),
    (context, weekIndex, tIndex) => ({
      id: `week${weekIndex + 1}-scenario${tIndex + 3}`,
      title: `Pressure to Respond`,
      summary: `Someone wants an immediate response. You must decide between short-term relief and long-term outcomes.`,
      stakes: context.stakes,
      roles: ["Student", context.stakeholder.primary, context.stakeholder.secondary],
      startStep: "step1",
      meters: { budget: 55, time: 40, trust: 50 },
      steps: buildThreeStepFlow(context, "response")
    }),
    (context, weekIndex, tIndex) => ({
      id: `week${weekIndex + 1}-scenario${tIndex + 4}`,
      title: `Boundary Test`,
      summary: `Your boundary is challenged in the ${context.setting}.`,
      stakes: context.stakes,
      roles: ["Student", context.stakeholder.primary, context.stakeholder.secondary],
      startStep: "step1",
      meters: { budget: 50, time: 45, trust: 55 },
      steps: buildThreeStepFlow(context, "boundary")
    }),
    (context, weekIndex, tIndex) => ({
      id: `week${weekIndex + 1}-scenario${tIndex + 5}`,
      title: `Risk vs Reward Choice`,
      summary: `You must weigh risk vs reward with limited time and information.`,
      stakes: context.stakes,
      roles: ["Student", context.stakeholder.primary, context.stakeholder.secondary],
      startStep: "step1",
      meters: { budget: 40, time: 50, trust: 60 },
      steps: buildThreeStepFlow(context, "risk")
    }),
    (context, weekIndex, tIndex) => ({
      id: `week${weekIndex + 1}-scenario${tIndex + 6}`,
      title: `Support System Decision`,
      summary: `A decision requires asking for help or handling it alone.`,
      stakes: context.stakes,
      roles: ["Student", context.stakeholder.primary, context.stakeholder.secondary],
      startStep: "step1",
      meters: { budget: 55, time: 45, trust: 50 },
      steps: buildThreeStepFlow(context, "support")
    }),
    (context, weekIndex, tIndex) => ({
      id: `week${weekIndex + 1}-scenario${tIndex + 7}`,
      title: `Long View`,
      summary: `Your choice now will impact long-term reputation and opportunities.`,
      stakes: context.stakes,
      roles: ["Student", context.stakeholder.primary, context.stakeholder.secondary],
      startStep: "step1",
      meters: { budget: 50, time: 50, trust: 50 },
      steps: buildThreeStepFlow(context, "longview")
    })
  ];
}

function buildThreeStepFlow(context, type) {
  const stakeholder = context.stakeholder.primary;
  const secondary = context.stakeholder.secondary;
  const step1Prompt = {
    pressure: `In the ${context.setting}, ${stakeholder.toLowerCase()} pushes you to decide quickly.`,
    repair: `A mistake happened in the ${context.setting}. ${stakeholder} wants to know what you will do.`,
    response: `${stakeholder} expects an immediate response in the ${context.setting}.`,
    boundary: `${stakeholder} asks you to do something that crosses a boundary.`,
    risk: `You must choose a risky option or a safer option in the ${context.setting}.`,
    support: `You can ask for help in the ${context.setting}, but it may feel uncomfortable.`,
    longview: `You have a chance for short-term gain in the ${context.setting}, but it could hurt long-term trust.`
  }[type];

  return {
    step1: {
      prompt: step1Prompt,
      stakeholder,
      aiPrompts: [
        "I need your answer now. What are you going to do?",
        "You can decide fast or slow down. What’s your plan?"
      ],
      choices: [
        {
          id: "fast",
          text: "Respond fast to reduce pressure.",
          consequence: "Short-term relief, but risk increases.",
          meterImpact: { budget: 0, time: 6, trust: -6 },
          nextStep: "step2"
        },
        {
          id: "pause",
          text: "Pause, ask for information, and plan.",
          consequence: "You gain clarity and control, but lose time.",
          meterImpact: { budget: 0, time: -6, trust: 6 },
          nextStep: "step2"
        },
        {
          id: "boundary",
          text: "Set a boundary and explain your values.",
          consequence: "Trust may rise, but pressure increases.",
          meterImpact: { budget: 0, time: -4, trust: 4 },
          nextStep: "step2"
        }
      ]
    },
    step2: {
      prompt: `${secondary} asks how your decision affects others and the long-term outcome.`,
      stakeholder: secondary,
      aiPrompts: [
        "Think about the long view. What are the consequences?",
        "What trade-off are you making here?"
      ],
      choices: [
        {
          id: "explain",
          text: "Explain your trade-offs and long-term plan.",
          consequence: "You build credibility and trust.",
          meterImpact: { budget: 0, time: -2, trust: 8 },
          nextStep: "step3"
        },
        {
          id: "minimize",
          text: "Minimize the impact to avoid conflict.",
          consequence: "Short-term comfort, but trust drops.",
          meterImpact: { budget: 0, time: 2, trust: -6 },
          nextStep: "step3"
        }
      ]
    },
    step3: {
      prompt: `${stakeholder} follows up and asks what you will do if this happens again.`,
      stakeholder,
      aiPrompts: [
        "What is your Plan A and Plan B?",
        "How will you follow through?"
      ],
      choices: [
        {
          id: "plan",
          text: "Describe a plan and how you will follow through.",
          consequence: "You show accountability and growth.",
          meterImpact: { budget: 0, time: 2, trust: 8 },
          nextStep: "end"
        },
        {
          id: "avoid",
          text: "Give a vague answer to move on.",
          consequence: "You miss a chance to show responsibility.",
          meterImpact: { budget: 0, time: 2, trust: -4 },
          nextStep: "end"
        }
      ]
    }
  };
}

function pick(list, rng) {
  return list[Math.floor(rng() * list.length)];
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

loadData();

const infoPopover = document.createElement("div");
infoPopover.className = "info-popover hidden";
document.body.appendChild(infoPopover);

function showInfoPopover(target) {
  const text = target.getAttribute("data-tooltip");
  if (!text) return;
  infoPopover.textContent = text;
  infoPopover.classList.remove("hidden");
  const rect = target.getBoundingClientRect();
  const top = rect.bottom + 8;
  const left = rect.left + rect.width / 2;
  infoPopover.style.top = `${top}px`;
  infoPopover.style.left = `${left}px`;
  infoPopover.style.transform = "translateX(-50%)";
}

function hideInfoPopover() {
  infoPopover.classList.add("hidden");
}

infoBadges.forEach((badge) => {
  badge.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!infoPopover.classList.contains("hidden") && infoPopover.textContent === badge.getAttribute("data-tooltip")) {
      hideInfoPopover();
      return;
    }
    showInfoPopover(badge);
  });
});

document.addEventListener("click", () => {
  hideInfoPopover();
});
