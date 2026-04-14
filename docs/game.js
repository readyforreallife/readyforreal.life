const GAME_STORAGE_KEY = "rfrl-challenge-best";
const GAME_HISTORY_KEY = "rfrl-challenge-history";
const QUESTION_COUNT = 10;
const QUESTION_TIME = 20;

const startBtn = document.getElementById("startChallengeBtn");
const startBtnDuplicate = document.getElementById("startChallengeBtnDuplicate");
const playAgainBtn = document.getElementById("playAgainBtn");
const nextBtn = document.getElementById("nextQuestionBtn");
const playerNameInput = document.getElementById("playerName");
const roundCountEl = document.getElementById("roundCount");
const roundCountLiveEl = document.getElementById("roundCountLive");
const bestScoreEl = document.getElementById("bestScore");
const liveScoreEl = document.getElementById("liveScore");
const streakEl = document.getElementById("streakCount");
const timerEl = document.getElementById("timerCount");
const progressFillEl = document.getElementById("progressFill");
const categoryBadgeEl = document.getElementById("categoryBadge");
const difficultyBadgeEl = document.getElementById("difficultyBadge");
const questionObjectiveEl = document.getElementById("questionObjective");
const questionPromptEl = document.getElementById("questionPrompt");
const answersEl = document.getElementById("answerGrid");
const explanationEl = document.getElementById("answerExplanation");
const startPanel = document.getElementById("startPanel");
const gamePanel = document.getElementById("gamePanel");
const resultsPanel = document.getElementById("resultsPanel");
const resultsScoreEl = document.getElementById("resultsScore");
const resultsSummaryEl = document.getElementById("resultsSummary");
const leaderboardEl = document.getElementById("leaderboard");
const burstEl = document.getElementById("burstLayer");

let questions = [];
let currentIndex = 0;
let score = 0;
let streak = 0;
let timeLeft = QUESTION_TIME;
let timerId = null;
let answered = false;
let playerName = "Player";

function renderAnswerFeedback(prefix, question) {
  explanationEl.innerHTML = `
    <div><strong>${prefix}</strong> ${question.explanation}</div>
    <div class="feedback-meta"><strong>Correct answer:</strong> ${question.correctAnswer}</div>
    <div class="feedback-meta"><strong>Bloom's level:</strong> ${question.bloom} — ${question.bloomExplanation}</div>
  `;
}

function shuffle(list) {
  return [...list]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
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
  if (score > best) {
    localStorage.setItem(GAME_STORAGE_KEY, String(score));
  }

  const history = JSON.parse(localStorage.getItem(GAME_HISTORY_KEY) || "[]");
  history.push({
    name: playerName,
    score,
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
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function updateHud() {
  const roundText = `${currentIndex + 1} / ${questions.length}`;
  liveScoreEl.textContent = score.toLocaleString();
  streakEl.textContent = String(streak);
  timerEl.textContent = String(timeLeft);
  roundCountEl.textContent = roundText;
  if (roundCountLiveEl) {
    roundCountLiveEl.textContent = roundText;
  }
  progressFillEl.style.width = `${((currentIndex) / questions.length) * 100}%`;
}

function finishRound() {
  stopTimer();
  saveScore();
  loadBestScore();
  loadLeaderboard();
  gamePanel.hidden = true;
  resultsPanel.hidden = false;
  resultsScoreEl.textContent = score.toLocaleString();
  const best = Number(localStorage.getItem(GAME_STORAGE_KEY) || 0);
  const status = score >= best ? "New best round." : "Strong work. Run it again and push higher.";
  resultsSummaryEl.textContent = `${playerName}, you finished with a ${streak}-question streak at peak. ${status}`;
}

function showQuestion() {
  const question = questions[currentIndex];
  answered = false;
  timeLeft = QUESTION_TIME;
  categoryBadgeEl.textContent = question.category;
  difficultyBadgeEl.textContent = question.bloom;
  if (questionObjectiveEl) {
    questionObjectiveEl.textContent = question.objective;
  }
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
  timerId = window.setInterval(() => {
    timeLeft -= 1;
    updateHud();
    if (timeLeft <= 0) {
      stopTimer();
      handleTimeout(question);
    }
  }, 1000);
}

function handleTimeout(question) {
  if (answered) return;
  answered = true;
  streak = 0;
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
  if (answered) return;
  answered = true;
  stopTimer();
  answersEl.querySelectorAll("button").forEach((choice) => {
    choice.disabled = true;
  });

  if (isCorrect) {
    const points = 500 + timeLeft * 25 + streak * 40;
    score += points;
    streak += 1;
    button.classList.add("correct");
    renderAnswerFeedback(`Correct. +${points.toLocaleString()} points.`, question);
    startBurst();
  } else {
    streak = 0;
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

function nextQuestion() {
  currentIndex += 1;
  if (currentIndex >= questions.length) {
    finishRound();
    return;
  }
  showQuestion();
}

function beginGame() {
  playerName = playerNameInput.value.trim() || "Player";
  questions = shuffle(window.RFRL_GAME_QUESTIONS || []).slice(0, QUESTION_COUNT);
  currentIndex = 0;
  score = 0;
  streak = 0;
  startPanel.hidden = true;
  resultsPanel.hidden = true;
  gamePanel.hidden = false;
  progressFillEl.style.width = "0%";
  showQuestion();
}

startBtn?.addEventListener("click", beginGame);
startBtnDuplicate?.addEventListener("click", beginGame);
playAgainBtn?.addEventListener("click", beginGame);
nextBtn?.addEventListener("click", nextQuestion);

loadBestScore();
loadLeaderboard();
