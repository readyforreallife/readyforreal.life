const GAME_STORAGE_KEY = "rfrl-challenge-best";
const GAME_HISTORY_KEY = "rfrl-challenge-history";
const DEFAULT_QUESTION_COUNT = 10;
const DEFAULT_QUESTION_TIME = 20;

const startBtn = document.getElementById("startChallengeBtn");
const startBtnDuplicate = document.getElementById("startChallengeBtnDuplicate");
const playAgainBtn = document.getElementById("playAgainBtn");
const nextBtn = document.getElementById("nextQuestionBtn");
const playerNameInput = document.getElementById("playerName");
const gameModeEl = document.getElementById("gameMode");
const themeSelectEl = document.getElementById("themeSelect");
const questionCountSelectEl = document.getElementById("questionCountSelect");
const timerSelectEl = document.getElementById("timerSelect");
const teamCountSelectEl = document.getElementById("teamCountSelect");
const teamFieldsEl = document.getElementById("teamFields");
const teamGridEl = document.getElementById("teamGrid");
const roundCountEl = document.getElementById("roundCount");
const roundCountLiveEl = document.getElementById("roundCountLive");
const bestScoreEl = document.getElementById("bestScore");
const liveScoreEl = document.getElementById("liveScore");
const streakEl = document.getElementById("streakCount");
const timerEl = document.getElementById("timerCount");
const currentTurnEl = document.getElementById("currentTurn");
const progressFillEl = document.getElementById("progressFill");
const categoryBadgeEl = document.getElementById("categoryBadge");
const difficultyBadgeEl = document.getElementById("difficultyBadge");
const questionObjectiveEl = document.getElementById("questionObjective");
const questionPromptEl = document.getElementById("questionPrompt");
const answersEl = document.getElementById("answerGrid");
const explanationEl = document.getElementById("answerExplanation");
const modeSummaryEl = document.getElementById("modeSummary");
const themeSummaryEl = document.getElementById("themeSummary");
const modeNoteEl = document.getElementById("modeNote");
const startPanel = document.getElementById("startPanel");
const gamePanel = document.getElementById("gamePanel");
const resultsPanel = document.getElementById("resultsPanel");
const resultsScoreEl = document.getElementById("resultsScore");
const resultsSummaryEl = document.getElementById("resultsSummary");
const leaderboardEl = document.getElementById("leaderboard");
const classroomBoardEl = document.getElementById("classroomBoard");
const burstEl = document.getElementById("burstLayer");

const state = {
  questions: [],
  currentIndex: 0,
  score: 0,
  streak: 0,
  timeLeft: DEFAULT_QUESTION_TIME,
  timerId: null,
  answered: false,
  playerName: "Player",
  mode: "solo",
  theme: "Mixed",
  questionCount: DEFAULT_QUESTION_COUNT,
  timerSeconds: DEFAULT_QUESTION_TIME,
  teams: [],
  turnIndex: 0
};

function shuffle(list) {
  return [...list]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function renderAnswerFeedback(prefix, question) {
  explanationEl.innerHTML = `
    <div><strong>${prefix}</strong> ${question.explanation}</div>
    <div class="feedback-meta"><strong>Correct answer:</strong> ${question.correctAnswer}</div>
    <div class="feedback-meta"><strong>Bloom's level:</strong> ${question.bloom} — ${question.bloomExplanation}</div>
  `;
}

function loadBestScore() {
  const best = Number(localStorage.getItem(GAME_STORAGE_KEY) || 0);
  bestScoreEl.textContent = best.toLocaleString();
}

function loadLeaderboard() {
  const history = JSON.parse(localStorage.getItem(GAME_HISTORY_KEY) || "[]");
  leaderboardEl.innerHTML = "";
  if (!history.length) {
    const empty = document.createElement("li");
    empty.textContent = "Be the first to set a score.";
    leaderboardEl.appendChild(empty);
    return;
  }

  history.slice(0, 5).forEach((entry, index) => {
    const row = document.createElement("li");
    row.innerHTML = `<span>#${index + 1} · ${entry.name}</span><strong>${entry.score.toLocaleString()}</strong>`;
    leaderboardEl.appendChild(row);
  });
}

function saveScore() {
  const best = Number(localStorage.getItem(GAME_STORAGE_KEY) || 0);
  if (state.score > best) {
    localStorage.setItem(GAME_STORAGE_KEY, String(state.score));
  }

  const history = JSON.parse(localStorage.getItem(GAME_HISTORY_KEY) || "[]");
  const label = state.mode === "classroom"
    ? `${state.playerName} · ${state.theme}`
    : state.playerName;

  history.push({
    name: label,
    score: state.score,
    playedAt: new Date().toISOString()
  });
  history.sort((a, b) => b.score - a.score);
  localStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
}

function startBurst() {
  burstEl.innerHTML = "";
  const colors = ["#c49540", "#1b6b6b", "#ffffff", "#e8d198"];
  for (let i = 0; i < 18; i += 1) {
    const particle = document.createElement("span");
    particle.className = "burst-dot";
    particle.style.background = colors[i % colors.length];
    particle.style.left = `${50 + (Math.random() * 24 - 12)}%`;
    particle.style.top = `${50 + (Math.random() * 24 - 12)}%`;
    particle.style.setProperty("--dx", `${Math.random() * 220 - 110}px`);
    particle.style.setProperty("--dy", `${Math.random() * 180 - 90}px`);
    particle.style.animationDelay = `${Math.random() * 120}ms`;
    burstEl.appendChild(particle);
  }
}

function stopTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

function getActiveTeam() {
  if (state.mode !== "classroom" || !state.teams.length) {
    return null;
  }
  return state.teams[state.turnIndex];
}

function renderClassroomBoard() {
  classroomBoardEl.innerHTML = "";

  if (state.mode !== "classroom" || !state.teams.length) {
    const row = document.createElement("li");
    row.innerHTML = `<div><span>${state.playerName}</span><small>Solo round</small></div><strong>${state.score.toLocaleString()}</strong>`;
    classroomBoardEl.appendChild(row);
    return;
  }

  state.teams
    .slice()
    .sort((a, b) => b.score - a.score)
    .forEach((team) => {
      const row = document.createElement("li");
      if (getActiveTeam() && getActiveTeam().name === team.name) {
        row.classList.add("active");
      }
      row.innerHTML = `<div><span>${team.name}</span><small>${team.correct} correct</small></div><strong>${team.score.toLocaleString()}</strong>`;
      classroomBoardEl.appendChild(row);
    });
}

function updateHud() {
  const roundText = `${Math.min(state.currentIndex + 1, state.questions.length)} / ${state.questions.length}`;
  liveScoreEl.textContent = state.score.toLocaleString();
  streakEl.textContent = String(state.streak);
  timerEl.textContent = String(state.timeLeft);
  roundCountEl.textContent = roundText;
  roundCountLiveEl.textContent = roundText;
  progressFillEl.style.width = `${(state.currentIndex / Math.max(state.questions.length, 1)) * 100}%`;

  const activeTeam = getActiveTeam();
  currentTurnEl.textContent = activeTeam ? activeTeam.name : state.playerName;
  modeNoteEl.textContent = activeTeam
    ? `${activeTeam.name} is up. Let the team talk quickly, lock one answer, then use the explanation to debrief before the next turn.`
    : `Solo mode is running. Use the explanation after each question to turn the round into coaching, not just scorekeeping.`;

  renderClassroomBoard();
}

function buildQuestionSet() {
  const bank = window.RFRL_GAME_QUESTIONS || [];
  const themed = state.theme === "Mixed"
    ? bank
    : bank.filter((question) => question.theme === state.theme);

  const primary = shuffle(themed);
  if (state.theme === "Mixed" || primary.length >= state.questionCount) {
    return primary.slice(0, state.questionCount);
  }

  const topUp = shuffle(
    bank.filter((question) => question.theme !== state.theme)
  );
  return [...primary, ...topUp].slice(0, state.questionCount);
}

function showQuestion() {
  const question = state.questions[state.currentIndex];
  state.answered = false;
  state.timeLeft = state.timerSeconds;
  categoryBadgeEl.textContent = `${question.theme} · ${question.category}`;
  difficultyBadgeEl.textContent = question.bloom;
  questionObjectiveEl.textContent = question.objective;
  questionPromptEl.textContent = question.prompt;
  explanationEl.innerHTML = "";
  nextBtn.hidden = true;
  answersEl.innerHTML = "";

  const choiceOrder = shuffle(
    question.choices.map((choice, index) => ({ choice, index }))
  );

  choiceOrder.forEach(({ choice, index }, buttonIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `answer-card palette-${buttonIndex % 4}`;
    button.innerHTML = `<span class="answer-symbol">${["▲", "◆", "●", "■"][buttonIndex % 4]}</span><span>${choice}</span>`;
    button.addEventListener("click", () => handleAnswer(button, index === question.answer, question));
    answersEl.appendChild(button);
  });

  updateHud();
  stopTimer();
  state.timerId = window.setInterval(() => {
    state.timeLeft -= 1;
    updateHud();
    if (state.timeLeft <= 0) {
      stopTimer();
      handleTimeout(question);
    }
  }, 1000);
}

function handleTimeout(question) {
  if (state.answered) return;
  state.answered = true;
  state.streak = 0;
  renderAnswerFeedback("Time.", question);

  answersEl.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
    if (button.textContent.includes(question.choices[question.answer])) {
      button.classList.add("correct");
    }
  });

  nextBtn.hidden = false;
  updateHud();
}

function handleAnswer(button, isCorrect, question) {
  if (state.answered) return;
  state.answered = true;
  stopTimer();

  answersEl.querySelectorAll("button").forEach((choice) => {
    choice.disabled = true;
  });

  const activeTeam = getActiveTeam();

  if (isCorrect) {
    const points = 500 + state.timeLeft * 25 + state.streak * 40;
    state.score += points;
    state.streak += 1;
    button.classList.add("correct");
    renderAnswerFeedback(`Correct. +${points.toLocaleString()} points.`, question);
    if (activeTeam) {
      activeTeam.score += points;
      activeTeam.correct += 1;
    }
    startBurst();
  } else {
    state.streak = 0;
    button.classList.add("incorrect");
    answersEl.querySelectorAll("button").forEach((choice) => {
      if (choice.textContent.includes(question.choices[question.answer])) {
        choice.classList.add("correct");
      }
    });
    renderAnswerFeedback("Not this one.", question);
  }

  nextBtn.hidden = false;
  updateHud();
}

function finishRound() {
  stopTimer();
  saveScore();
  loadBestScore();
  loadLeaderboard();
  renderClassroomBoard();

  gamePanel.hidden = true;
  resultsPanel.hidden = false;
  resultsScoreEl.textContent = state.score.toLocaleString();

  if (state.mode === "classroom" && state.teams.length) {
    const winner = state.teams.slice().sort((a, b) => b.score - a.score)[0];
    resultsSummaryEl.textContent = `${winner.name} finished on top with ${winner.score.toLocaleString()} points. The round stayed in ${state.theme} mode with ${state.questions.length} scenario questions.`;
  } else {
    const best = Number(localStorage.getItem(GAME_STORAGE_KEY) || 0);
    const status = state.score >= best ? "New best round." : "Strong work. Run it again and push higher.";
    resultsSummaryEl.textContent = `${state.playerName}, you finished with a ${state.streak}-question streak at peak. ${status}`;
  }
}

function nextQuestion() {
  state.currentIndex += 1;
  if (state.currentIndex >= state.questions.length) {
    finishRound();
    return;
  }
  if (state.mode === "classroom" && state.teams.length) {
    state.turnIndex = (state.turnIndex + 1) % state.teams.length;
  }
  showQuestion();
}

function getTeamNames() {
  const count = Number(teamCountSelectEl.value || 3);
  const inputs = Array.from(teamGridEl.querySelectorAll("input"));
  const names = inputs.slice(0, count).map((input, index) => input.value.trim() || `Team ${index + 1}`);
  return names;
}

function renderTeamInputs() {
  const isClassroom = gameModeEl.value === "classroom";
  teamFieldsEl.hidden = !isClassroom;

  if (!isClassroom) {
    return;
  }

  const count = Number(teamCountSelectEl.value || 3);
  teamGridEl.innerHTML = "";

  for (let index = 0; index < count; index += 1) {
    const wrap = document.createElement("label");
    wrap.className = "team-input";
    wrap.innerHTML = `<span>Team ${index + 1} name</span><input type="text" maxlength="24" placeholder="Team ${index + 1}">`;
    teamGridEl.appendChild(wrap);
  }
}

function updateModeSummary() {
  const mode = gameModeEl.value;
  const theme = themeSelectEl.value;
  const count = Number(questionCountSelectEl.value || DEFAULT_QUESTION_COUNT);
  const timer = Number(timerSelectEl.value || DEFAULT_QUESTION_TIME);
  const themeLabel = theme === "Mixed" ? "Mixed real-life scenarios" : `${theme} scenarios`;

  modeSummaryEl.textContent = mode === "classroom" ? "Classroom teams" : "Solo";
  themeSummaryEl.textContent = `${themeLabel} · ${count} questions · ${timer}s each.`;
  roundCountEl.textContent = `1 / ${count}`;
  roundCountLiveEl.textContent = `1 / ${count}`;
  startBtnDuplicate.textContent = mode === "classroom"
    ? "Start Classroom Round"
    : `Start ${count}-Question Round`;
}

function beginGame() {
  state.playerName = playerNameInput.value.trim() || "Player";
  state.mode = gameModeEl.value;
  state.theme = themeSelectEl.value;
  state.questionCount = Number(questionCountSelectEl.value || DEFAULT_QUESTION_COUNT);
  state.timerSeconds = Number(timerSelectEl.value || DEFAULT_QUESTION_TIME);
  state.questions = buildQuestionSet();
  state.currentIndex = 0;
  state.score = 0;
  state.streak = 0;
  state.turnIndex = 0;
  state.answered = false;
  state.teams = state.mode === "classroom"
    ? getTeamNames().map((name) => ({ name, score: 0, correct: 0 }))
    : [];

  startPanel.hidden = true;
  resultsPanel.hidden = true;
  gamePanel.hidden = false;
  progressFillEl.style.width = "0%";
  showQuestion();
}

function attachEvents() {
  startBtn?.addEventListener("click", beginGame);
  startBtnDuplicate?.addEventListener("click", beginGame);
  playAgainBtn?.addEventListener("click", beginGame);
  nextBtn?.addEventListener("click", nextQuestion);
  gameModeEl?.addEventListener("change", () => {
    renderTeamInputs();
    updateModeSummary();
  });
  themeSelectEl?.addEventListener("change", updateModeSummary);
  questionCountSelectEl?.addEventListener("change", updateModeSummary);
  timerSelectEl?.addEventListener("change", updateModeSummary);
  teamCountSelectEl?.addEventListener("change", () => {
    renderTeamInputs();
    updateModeSummary();
  });
}

renderTeamInputs();
updateModeSummary();
loadBestScore();
loadLeaderboard();
renderClassroomBoard();
attachEvents();
