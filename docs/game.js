const WORKER_URL = "https://flat-flower-4af8mmmf-agreement-admin.mikeyterry44.workers.dev";
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
const hostLiveBtn = document.getElementById("hostLiveBtn");
const startLiveSessionBtn = document.getElementById("startLiveSessionBtn");
const liveCodeRow = document.getElementById("liveCodeRow");
const liveSessionCodeEl = document.getElementById("liveSessionCode");
const copyJoinLinkBtn = document.getElementById("copyJoinLinkBtn");
const liveQrPanelEl = document.getElementById("liveQrPanel");
const liveQrImageEl = document.getElementById("liveQrImage");
const liveQrLinkEl = document.getElementById("liveQrLink");
const liveSessionStatusEl = document.getElementById("liveSessionStatus");
const joinCodeInput = document.getElementById("joinCodeInput");
const joinNameInput = document.getElementById("joinNameInput");
const joinTeamSelect = document.getElementById("joinTeamSelect");
const joinLiveBtn = document.getElementById("joinLiveBtn");
const joinHintEl = document.getElementById("joinHint");
const waitingCardEl = document.getElementById("waitingCard");
const waitingTitleEl = document.getElementById("waitingTitle");
const waitingTextEl = document.getElementById("waitingText");
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
const soloLeaderboardEl = document.getElementById("soloLeaderboard");
const classroomLeaderboardEl = document.getElementById("classroomLeaderboard");
const clearLeaderboardBtn = document.getElementById("clearLeaderboardBtn");
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
  turnIndex: 0,
  live: {
    active: false,
    host: false,
    code: "",
    hostKey: "",
    participantId: "",
    participantName: "",
    participantTeam: "",
    pollId: null,
    clockId: null,
    session: null,
    selectedChoice: -1
  }
};

function shuffle(list) {
  return [...list]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function workerRequest(payload) {
  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    const rawError = String(data.error || "").trim();
    if (rawError === "Unknown action.") {
      throw new Error("The live challenge backend is still on the older Worker version. Redeploy the latest Worker code, then try Host Live Session again.");
    }
    throw new Error(rawError || "The live challenge request failed.");
  }
  return data;
}

function loadBestScore() {
  const best = Number(localStorage.getItem(GAME_STORAGE_KEY) || 0);
  bestScoreEl.textContent = best.toLocaleString();
}

function renderLeaderboardList(target, entries, emptyText) {
  target.innerHTML = "";
  if (!entries.length) {
    const empty = document.createElement("li");
    empty.textContent = emptyText;
    target.appendChild(empty);
    return;
  }

  entries.slice(0, 10).forEach((entry, index) => {
    const row = document.createElement("li");
    const theme = entry.theme || "Mixed";
    row.innerHTML = `<span>#${index + 1} · ${escapeHtml(entry.name)}<small>${escapeHtml(theme)} round</small></span><strong>${entry.score.toLocaleString()}</strong>`;
    target.appendChild(row);
  });
}

function loadLeaderboard() {
  const history = JSON.parse(localStorage.getItem(GAME_HISTORY_KEY) || "[]");
  const soloHistory = history.filter((entry) => (entry.mode || "solo") === "solo");
  const classroomHistory = history.filter((entry) => entry.mode === "classroom");
  renderLeaderboardList(soloLeaderboardEl, soloHistory, "Be the first to set a solo score.");
  renderLeaderboardList(classroomLeaderboardEl, classroomHistory, "Be the first to set a classroom score.");
}

function saveScore() {
  const best = Number(localStorage.getItem(GAME_STORAGE_KEY) || 0);
  if (state.score > best) {
    localStorage.setItem(GAME_STORAGE_KEY, String(state.score));
  }

  const history = JSON.parse(localStorage.getItem(GAME_HISTORY_KEY) || "[]");
  const label = state.mode === "classroom" ? `${state.playerName} · ${state.theme}` : state.playerName;
  history.push({
    name: label,
    mode: state.mode,
    theme: state.theme,
    score: state.score,
    playedAt: new Date().toISOString()
  });
  history.sort((a, b) => b.score - a.score);
  localStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
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
  if (state.mode !== "classroom" || !state.teams.length) return null;
  return state.teams[state.turnIndex];
}

function renderClassroomBoardFromTeams(teams, activeTeamName = "", soloLabel = "") {
  classroomBoardEl.innerHTML = "";

  if (!teams.length) {
    const row = document.createElement("li");
    row.innerHTML = `<div><span>${escapeHtml(soloLabel || state.playerName)}</span><small>Solo round</small></div><strong>${state.score.toLocaleString()}</strong>`;
    classroomBoardEl.appendChild(row);
    return;
  }

  teams
    .slice()
    .sort((a, b) => b.score - a.score)
    .forEach((team) => {
      const row = document.createElement("li");
      if (activeTeamName && team.name === activeTeamName) {
        row.classList.add("active");
      }
      row.innerHTML = `<div><span>${escapeHtml(team.name)}</span><small>${team.correct || 0} correct</small></div><strong>${Number(team.score || 0).toLocaleString()}</strong>`;
      classroomBoardEl.appendChild(row);
    });
}

function renderClassroomBoard() {
  if (state.live.active && state.live.session) {
    renderClassroomBoardFromTeams(state.live.session.teams || [], state.live.session.activeTeam || "", state.live.participantName || state.playerName);
    return;
  }

  if (state.mode !== "classroom" || !state.teams.length) {
    renderClassroomBoardFromTeams([], "", state.playerName);
    return;
  }

  renderClassroomBoardFromTeams(state.teams, getActiveTeam() ? getActiveTeam().name : "");
}

function updateHud() {
  if (state.live.active && state.live.session) {
    updateLiveHud(state.live.session);
    return;
  }

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
  const themed = state.theme === "Mixed" ? bank : bank.filter((question) => question.theme === state.theme);
  const primary = shuffle(themed);
  if (state.theme === "Mixed" || primary.length >= state.questionCount) {
    return primary.slice(0, state.questionCount);
  }
  const topUp = shuffle(bank.filter((question) => question.theme !== state.theme));
  return [...primary, ...topUp].slice(0, state.questionCount);
}

function renderAnswerFeedback(prefix, question) {
  explanationEl.innerHTML = `
    <div><strong>${prefix}</strong> ${question.explanation}</div>
    <div class="feedback-meta"><strong>Correct answer:</strong> ${question.correctAnswer}</div>
    <div class="feedback-meta"><strong>Bloom's level:</strong> ${question.bloom} — ${question.bloomExplanation}</div>
  `;
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

  const choiceOrder = shuffle(question.choices.map((choice, index) => ({ choice, index })));
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
  if (state.live.active) {
    handleLiveAnswer(button, question);
    return;
  }
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
  if (state.live.active) {
    hostNextLiveQuestion();
    return;
  }
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
  return inputs.slice(0, count).map((input, index) => input.value.trim() || `Team ${index + 1}`);
}

function renderTeamInputs() {
  const isClassroom = gameModeEl.value === "classroom";
  teamFieldsEl.hidden = !isClassroom;
  if (!isClassroom) return;

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
  startBtnDuplicate.textContent = mode === "classroom" ? "Start Classroom Round" : `Start ${count}-Question Round`;
}

function beginGame() {
  stopLivePolling();
  state.live = {
    active: false,
    host: false,
    code: "",
    hostKey: "",
    participantId: "",
    participantName: "",
    participantTeam: "",
    pollId: null,
    session: null,
    selectedChoice: -1
  };
  waitingCardEl.hidden = true;

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
  state.teams = state.mode === "classroom" ? getTeamNames().map((name) => ({ name, score: 0, correct: 0 })) : [];

  startPanel.hidden = true;
  resultsPanel.hidden = true;
  gamePanel.hidden = false;
  progressFillEl.style.width = "0%";
  showQuestion();
}

function populateJoinTeams(teams) {
  const options = [`<option value="">Choose team</option>`]
    .concat((teams || []).map((team) => `<option value="${escapeHtml(team.name)}">${escapeHtml(team.name)}</option>`));
  joinTeamSelect.innerHTML = options.join("");
}

function setLiveStatus(text) {
  liveSessionStatusEl.textContent = text;
}

function updateLiveQr(code) {
  if (!liveQrPanelEl || !liveQrImageEl || !liveQrLinkEl) return;
  if (!code) {
    liveQrPanelEl.hidden = true;
    liveQrImageEl.removeAttribute("src");
    liveQrLinkEl.href = "#";
    liveQrLinkEl.textContent = "Join link will appear here once the host code is created.";
    return;
  }
  const joinLink = getJoinLink(code);
  liveQrPanelEl.hidden = false;
  liveQrImageEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encodeURIComponent(joinLink)}`;
  liveQrLinkEl.href = joinLink;
  liveQrLinkEl.textContent = joinLink;
}

function showWaitingCard(title, text) {
  waitingCardEl.hidden = false;
  waitingTitleEl.textContent = title;
  waitingTextEl.textContent = text;
}

function hideWaitingCard() {
  waitingCardEl.hidden = true;
}

function getJoinLink(code) {
  return `${window.location.origin}${window.location.pathname}?join=${encodeURIComponent(code)}`;
}

function stopLivePolling() {
  if (state.live.pollId) {
    window.clearInterval(state.live.pollId);
    state.live.pollId = null;
  }
}

function stopLiveClock() {
  if (state.live.clockId) {
    window.clearInterval(state.live.clockId);
    state.live.clockId = null;
  }
}

function getLiveTimeRemaining(session) {
  if (!session || !session.started || session.completed || session.revealed) {
    return Number(session && session.timerSeconds ? session.timerSeconds : DEFAULT_QUESTION_TIME);
  }
  const startedAt = String(session.questionStartedAt || "").trim();
  if (!startedAt) {
    return Number(session.timerSeconds || DEFAULT_QUESTION_TIME);
  }
  const elapsedMs = Date.now() - new Date(startedAt).getTime();
  const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  return Math.max(0, Number(session.timerSeconds || DEFAULT_QUESTION_TIME) - elapsedSeconds);
}

function refreshLiveClock() {
  if (!state.live.session) return;
  timerEl.textContent = String(getLiveTimeRemaining(state.live.session));
}

function syncLiveClock(session) {
  stopLiveClock();
  timerEl.textContent = String(getLiveTimeRemaining(session));
  if (!session || !session.started || session.completed || session.revealed) {
    return;
  }
  state.live.clockId = window.setInterval(refreshLiveClock, 1000);
}

function startLivePolling() {
  stopLivePolling();
  state.live.pollId = window.setInterval(async () => {
    if (!state.live.code) return;
    try {
      const response = await workerRequest({
        action: "challenge_get",
        code: state.live.code,
        host_key: state.live.host ? state.live.hostKey : "",
        participant_id: state.live.participantId
      });
      applyLiveSession(response.session);
    } catch (error) {
      setLiveStatus(error.message);
    }
  }, 2500);
}

function updateLiveHud(session) {
  const roundText = `${Math.min(session.currentIndex + 1, session.questionCount)} / ${session.questionCount}`;
  const myTeam = (session.teams || []).find((team) => team.name === state.live.participantTeam);
  const winnerScore = (session.teams || []).reduce((max, team) => Math.max(max, Number(team.score || 0)), 0);
  liveScoreEl.textContent = state.live.host ? winnerScore.toLocaleString() : Number((myTeam && myTeam.score) || 0).toLocaleString();
  streakEl.textContent = String(session.voteCounts ? Object.keys(session.voteCounts).length : 0);
  timerEl.textContent = String(getLiveTimeRemaining(session));
  roundCountEl.textContent = roundText;
  roundCountLiveEl.textContent = roundText;
  progressFillEl.style.width = `${(session.currentIndex / Math.max(session.questionCount, 1)) * 100}%`;
  currentTurnEl.textContent = session.activeTeam || (state.live.host ? state.playerName : state.live.participantName || "Participant");
  modeSummaryEl.textContent = state.live.host ? "Live host screen" : "Live participant";
  themeSummaryEl.textContent = `${session.theme} · ${session.questionCount} questions · ${session.timerSeconds}s pacing`;
  if (state.live.host) {
    const timeLeft = getLiveTimeRemaining(session);
    modeNoteEl.textContent = timeLeft > 0
      ? `${session.activeTeam || "Current team"} is active. Let teams vote before time runs out, then reveal the strongest answer and advance when you are ready.`
      : `${session.activeTeam || "Current team"} is out of time. Reveal the strongest answer to discuss it, then move to the next question.`;
  } else {
    const voteText = state.live.selectedChoice >= 0 && !session.revealed
      ? "Your vote is locked. Wait for the teacher to reveal the strongest response."
      : "Choose the strongest response before time runs out.";
    modeNoteEl.textContent = `You are joined as ${state.live.participantName || "participant"} on ${state.live.participantTeam || "your team"}. ${voteText}`;
  }
  renderClassroomBoardFromTeams(session.teams || [], session.activeTeam || "", state.live.participantName || state.playerName);
}

function renderLiveQuestion(session) {
  const question = session.currentQuestion;
  if (!question) return;

  categoryBadgeEl.textContent = `${question.theme} · ${question.category}`;
  difficultyBadgeEl.textContent = question.bloom;
  questionObjectiveEl.textContent = question.objective;
  questionPromptEl.textContent = question.prompt;
  answersEl.innerHTML = "";
  explanationEl.innerHTML = "";
  nextBtn.hidden = true;

  question.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `answer-card palette-${index % 4}`;
    button.innerHTML = `<span class="answer-symbol">${["▲", "◆", "●", "■"][index % 4]}</span><span>${escapeHtml(choice)}</span>`;
    if (!state.live.host && session.me && session.me.teamName) {
      const alreadySelected = state.live.selectedChoice === index;
      if (alreadySelected && !session.revealed) {
        button.classList.add("selected");
      }
    }
    if (session.revealed) {
      button.disabled = true;
      if (index === question.answer) {
        button.classList.add("correct");
      } else if (index === session.selectedAnswer) {
        button.classList.add("incorrect");
      }
    }
    button.addEventListener("click", () => handleLiveAnswer(button, question, index));
    answersEl.appendChild(button);
  });

  if (session.revealed) {
    renderAnswerFeedback(
      session.selectedAnswer === question.answer ? "Strong call." : "Here’s the strongest move.",
      {
        explanation: question.explanation,
        correctAnswer: question.correctAnswer,
        bloom: question.bloom,
        bloomExplanation: question.bloomExplanation
      }
    );
    if (state.live.host) {
      nextBtn.hidden = false;
      nextBtn.textContent = session.completed || session.currentIndex >= session.questionCount - 1 ? "Finish Round" : "Next Question";
    }
  }
}

function applyLiveSession(session) {
  state.live.session = session;
  populateJoinTeams(session.teams || []);
  updateLiveHud(session);
  syncLiveClock(session);
  liveCodeRow.hidden = !state.live.host;
  updateLiveQr(state.live.host ? session.code : "");
  startLiveSessionBtn.hidden = !state.live.host || session.started;
  liveSessionCodeEl.textContent = session.code;

  if (!session.started) {
    stopLiveClock();
    startPanel.hidden = false;
    gamePanel.hidden = true;
    resultsPanel.hidden = true;
    if (state.live.host) {
      showWaitingCard("Live session ready.", `Share code ${session.code} or the join link, then start the round when your teams are in.`);
      setLiveStatus(`Live session ${session.code} is ready. ${session.participants.length} participant(s) have joined.`);
    } else {
      showWaitingCard("You joined successfully.", `You are in ${state.live.participantTeam || "your team"}. Wait for the teacher to start the round.`);
      setLiveStatus(`Joined live session ${session.code}. Waiting for the teacher to start.`);
    }
    return;
  }

  hideWaitingCard();
  startPanel.hidden = true;
  gamePanel.hidden = false;
  resultsPanel.hidden = !session.completed;
  renderLiveQuestion(session);

  const winningTeam = (session.teams || []).slice().sort((a, b) => b.score - a.score)[0];
  resultsScoreEl.textContent = winningTeam ? Number(winningTeam.score || 0).toLocaleString() : "0";
  resultsSummaryEl.textContent = session.completed
    ? `${winningTeam ? winningTeam.name : "The class"} finished on top in the ${session.theme} round.`
    : `Live classroom session in progress. ${session.activeTeam || "A team"} is up right now.`;
}

async function hostLiveSession() {
  try {
    state.playerName = playerNameInput.value.trim() || "Teacher";
    state.theme = themeSelectEl.value;
    state.questionCount = Number(questionCountSelectEl.value || DEFAULT_QUESTION_COUNT);
    state.timerSeconds = Number(timerSelectEl.value || DEFAULT_QUESTION_TIME);
    state.questions = buildQuestionSet();
    const teams = gameModeEl.value === "classroom" ? getTeamNames() : [state.playerName];

    const response = await workerRequest({
      action: "challenge_create",
      host_name: state.playerName,
      theme: state.theme,
      question_count: state.questionCount,
      timer_seconds: state.timerSeconds,
      teams,
      questions: state.questions
    });

    state.live.active = true;
    state.live.host = true;
    state.live.code = response.session.code;
    state.live.hostKey = response.host_key;
    state.live.participantName = state.playerName;
    liveCodeRow.hidden = false;
    updateLiveQr(response.session.code);
    startLiveSessionBtn.hidden = false;
    liveSessionCodeEl.textContent = response.session.code;
    setLiveStatus(`Live session ${response.session.code} is ready. Share the code and start when your teams are in.`);
    applyLiveSession(response.session);
    startLivePolling();
  } catch (error) {
    window.alert(error.message);
  }
}

async function startHostedLiveSession() {
  try {
    const response = await workerRequest({
      action: "challenge_start",
      code: state.live.code,
      host_key: state.live.hostKey
    });
    applyLiveSession(response.session);
  } catch (error) {
    window.alert(error.message);
  }
}

async function joinLiveSession() {
  try {
    const code = String(joinCodeInput.value || "").trim().toUpperCase();
    const name = String(joinNameInput.value || "").trim() || "Participant";
    const teamName = String(joinTeamSelect.value || "").trim();
    if (!code) {
      throw new Error("Enter a live join code first.");
    }

    const joinResponse = await workerRequest({
      action: "challenge_join",
      code,
      name,
      team_name: teamName
    });

    state.live.active = true;
    state.live.host = false;
    state.live.code = code;
    state.live.participantId = joinResponse.session.me ? joinResponse.session.me.id : "";
    state.live.participantName = joinResponse.session.me ? joinResponse.session.me.name : name;
    state.live.participantTeam = joinResponse.session.me ? joinResponse.session.me.teamName : teamName;
    state.live.selectedChoice = -1;
    applyLiveSession(joinResponse.session);
    startLivePolling();
  } catch (error) {
    window.alert(error.message);
  }
}

async function handleLiveAnswer(button, question, explicitIndex = -1) {
  if (!state.live.session || !state.live.session.currentQuestion) return;
  if (state.live.session.revealed) return;

  const choiceIndex = explicitIndex;
  if (choiceIndex < 0) return;

  if (state.live.host) {
    try {
      const response = await workerRequest({
        action: "challenge_host_answer",
        code: state.live.code,
        host_key: state.live.hostKey,
        selected_answer: choiceIndex
      });
      if (choiceIndex === state.live.session.currentQuestion.answer) {
        startBurst();
      }
      applyLiveSession(response.session);
    } catch (error) {
      window.alert(error.message);
    }
    return;
  }

  if (!state.live.participantId) {
    window.alert("Join the live session first.");
    return;
  }

  try {
    state.live.selectedChoice = choiceIndex;
    answersEl.querySelectorAll("button").forEach((choiceButton, idx) => {
      choiceButton.classList.toggle("selected", idx === choiceIndex);
      choiceButton.disabled = true;
    });
    const response = await workerRequest({
      action: "challenge_submit_vote",
      code: state.live.code,
      participant_id: state.live.participantId,
      choice_index: choiceIndex
    });
    explanationEl.innerHTML = `<div><strong>Vote locked.</strong> Wait for the teacher to reveal the strongest answer for ${response.session.activeTeam || "this turn"}.</div>`;
    applyLiveSession(response.session);
  } catch (error) {
    window.alert(error.message);
  }
}

async function hostNextLiveQuestion() {
  try {
    const response = await workerRequest({
      action: "challenge_next",
      code: state.live.code,
      host_key: state.live.hostKey
    });
    state.live.selectedChoice = -1;
    applyLiveSession(response.session);
  } catch (error) {
    window.alert(error.message);
  }
}

function hydrateJoinFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const joinCode = String(params.get("join") || "").trim().toUpperCase();
  if (!joinCode) return;
  joinCodeInput.value = joinCode;
  setLiveStatus(`Join code ${joinCode} loaded from the link. Add your name, choose a team, and join.`);
  workerRequest({
    action: "challenge_get",
    code: joinCode
  }).then((response) => {
    populateJoinTeams(response.session.teams || []);
  }).catch(() => {
    joinHintEl.textContent = "That live join code could not be found yet. Double-check the code from the teacher screen.";
  });
}

function attachEvents() {
  startBtn?.addEventListener("click", beginGame);
  startBtnDuplicate?.addEventListener("click", beginGame);
  playAgainBtn?.addEventListener("click", () => {
    if (state.live.active) {
      startPanel.hidden = false;
      gamePanel.hidden = true;
      resultsPanel.hidden = true;
      showWaitingCard("Set up another live round.", "Create a fresh code to run another live classroom session.");
      return;
    }
    beginGame();
  });
  nextBtn?.addEventListener("click", nextQuestion);
  gameModeEl?.addEventListener("change", () => {
    renderTeamInputs();
    updateModeSummary();
    populateJoinTeams(getTeamNames().map((name) => ({ name })));
  });
  themeSelectEl?.addEventListener("change", updateModeSummary);
  questionCountSelectEl?.addEventListener("change", updateModeSummary);
  timerSelectEl?.addEventListener("change", updateModeSummary);
  teamCountSelectEl?.addEventListener("change", () => {
    renderTeamInputs();
    updateModeSummary();
    populateJoinTeams(getTeamNames().map((name) => ({ name })));
  });
  hostLiveBtn?.addEventListener("click", hostLiveSession);
  startLiveSessionBtn?.addEventListener("click", startHostedLiveSession);
  copyJoinLinkBtn?.addEventListener("click", async () => {
    if (!state.live.code) return;
    const link = getJoinLink(state.live.code);
    try {
      await navigator.clipboard.writeText(link);
      setLiveStatus(`Join link copied. Share ${state.live.code} or paste the direct link for your teams.`);
    } catch {
      window.prompt("Copy this join link for your class:", link);
    }
  });
  joinLiveBtn?.addEventListener("click", joinLiveSession);
  clearLeaderboardBtn?.addEventListener("click", () => {
    const code = window.prompt("Enter passcode to clear the saved leaderboard.");
    if (code === null) return;
    if (code.trim() !== "4429") {
      window.alert("That passcode is not correct.");
      return;
    }
    localStorage.removeItem(GAME_HISTORY_KEY);
    localStorage.removeItem(GAME_STORAGE_KEY);
    loadBestScore();
    loadLeaderboard();
    window.alert("Leaderboard cleared.");
  });
}

renderTeamInputs();
updateModeSummary();
populateJoinTeams(getTeamNames().map((name) => ({ name })));
loadBestScore();
loadLeaderboard();
renderClassroomBoard();
hydrateJoinFromQuery();
attachEvents();
