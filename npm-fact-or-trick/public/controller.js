// Determine the Socket.IO namespace and path based on current URL
const currentPath = window.location.pathname;
const namespace = currentPath.startsWith("/fact-or-trick")
  ? "/fact-or-trick"
  : "/";
const socketPath =
  namespace === "/fact-or-trick" ? "/fact-or-trick/socket.io/" : "/socket.io/";

// Connect to Socket.IO
const socket = io(namespace, {
  path: socketPath,
});

// DOM Elements
const connectingScreen = document.getElementById("connecting-screen");
const waitingScreen = document.getElementById("waiting-screen");
const questionScreen = document.getElementById("question-screen");
const answeredScreen = document.getElementById("answered-screen");
const resultScreen = document.getElementById("result-screen");
const finalScreen = document.getElementById("final-screen");
const disconnectedScreen = document.getElementById("disconnected-screen");

const playerBadge = document.getElementById("player-badge");
const playerName = document.getElementById("player-name");
const roundNum = document.getElementById("round-num");
const totalRoundsEl = document.getElementById("total-rounds");
const playerScore = document.getElementById("player-score");

const factBtn = document.getElementById("fact-btn");
const trickBtn = document.getElementById("trick-btn");

const yourAnswer = document.getElementById("your-answer");
const yourAnswerBadge = document.getElementById("your-answer-badge");
const feedbackIcon = document.getElementById("feedback-icon");
const feedbackTitle = document.getElementById("feedback-title");

const correctAnswerDisplay = document.getElementById("correct-answer-display");
const yourAnswerDisplay = document.getElementById("your-answer-display");
const yourTimeDisplay = document.getElementById("your-time-display");
const pointsEarnedDisplay = document.getElementById("points-earned-display");
const totalScoreDisplay = document.getElementById("total-score-display");
const resultIcon = document.getElementById("result-icon");
const resultTitle = document.getElementById("result-title");

const finalIcon = document.getElementById("final-icon");
const finalMessage = document.getElementById("final-message");
const finalScoreValue = document.getElementById("final-score-value");

const reconnectBtn = document.getElementById("reconnect-btn");
const readyBtn = document.getElementById("ready-btn");
const readyBtnText = document.getElementById("ready-btn-text");
const waitingStatusText = document.getElementById("waiting-status-text");
const waitingAnimation = document.getElementById("waiting-animation");

let currentPlayerNumber = null;
let currentScore = 0;
let buttonsEnabled = false;
let isReady = false;
let refreshTimerInterval = null;

// Get room ID from URL
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("room");

if (!roomId) {
  alert("رمز الغرفة غير موجود في الرابط");
  showScreen("disconnected");
} else {
  // Join game
  socket.emit("player:join", { roomId });
}

// Player joined successfully
socket.on("player:joined", ({ playerNumber, playerName: name }) => {
  currentPlayerNumber = playerNumber;
  playerName.textContent = name;
  isReady = false;

  showScreen("waiting");
  readyBtn.classList.remove("disabled");
  readyBtnText.textContent = "جاهز";
  waitingStatusText.textContent = "اضغط جاهز للبدء";
  waitingAnimation.classList.add("hidden");
  console.log(`Joined as ${name}`);
});

// Player error
socket.on("player:error", ({ message }) => {
  alert(message);
  showScreen("disconnected");
});

// Ready button handler
readyBtn.addEventListener("click", () => {
  if (isReady) return;
  
  isReady = true;
  socket.emit("player:ready");
  readyBtn.classList.add("disabled");
  readyBtnText.textContent = "✓ جاهز";
  waitingStatusText.textContent = "انتظر اللاعب الآخر...";
  waitingAnimation.classList.remove("hidden");
});

// Player ready status update
socket.on("player:readyStatus", ({ allReady }) => {
  if (allReady) {
    waitingStatusText.textContent = "اللعبة ستبدأ قريباً...";
  }
});

// Game started
socket.on("game:started", () => {
  console.log("Game started, waiting for first question...");
});

// Question started
socket.on(
  "question:start",
  ({ questionNumber, totalQuestions, question, timeLimit }) => {
    showScreen("question");

    roundNum.textContent = questionNumber;
    totalRoundsEl.textContent = totalQuestions;

    // Enable buttons
    buttonsEnabled = true;
    factBtn.classList.remove("disabled");
    trickBtn.classList.remove("disabled");
  }
);

// Answer button handlers
factBtn.addEventListener("click", () => {
  if (!buttonsEnabled) return;
  submitAnswer("fact");
});

trickBtn.addEventListener("click", () => {
  if (!buttonsEnabled) return;
  submitAnswer("trick");
});

function submitAnswer(answer) {
  if (!buttonsEnabled) return;

  buttonsEnabled = false;
  factBtn.classList.add("disabled");
  trickBtn.classList.add("disabled");

  socket.emit("player:answer", { answer });
}

// Player answered (confirmation)
socket.on("player:answered", ({ answer, responseTime }) => {
  showScreen("answered");

  yourAnswer.textContent = answer === "fact" ? "حقيقة" : "خدعة";
  yourAnswerBadge.querySelector(".answer-value").textContent =
    answer === "fact" ? "حقيقة" : "خدعة";

  console.log(`Answer submitted: ${answer} in ${responseTime.toFixed(2)}s`);
});

// Question results
socket.on(
  "question:results",
  ({
    correctAnswer,
    yourAnswer: answer,
    isCorrect,
    responseTime,
    points,
    totalScore,
  }) => {
    showScreen("result");

    currentScore = totalScore;

    // Display correct answer
    correctAnswerDisplay.textContent =
      correctAnswer === "fact" ? "حقيقة" : "خدعة";
    correctAnswerDisplay.classList.add("correct");

    // Display player's answer
    if (answer) {
      yourAnswerDisplay.textContent = answer === "fact" ? "حقيقة" : "خدعة";
      yourAnswerDisplay.classList.toggle("correct", isCorrect);
      yourAnswerDisplay.classList.toggle("wrong", !isCorrect);
    } else {
      yourAnswerDisplay.textContent = "لم تجب";
      yourAnswerDisplay.classList.add("wrong");
    }

    // Display time
    yourTimeDisplay.textContent = `${responseTime.toFixed(1)} ثانية`;

    // Display points earned
    pointsEarnedDisplay.textContent = points > 0 ? `+${points}` : "0";
    pointsEarnedDisplay.classList.toggle("earned", points > 0);

    // Display total score
    totalScoreDisplay.textContent = totalScore;
    playerScore.textContent = totalScore;

    // Result status
    if (isCorrect) {
      resultIcon.textContent = "🎉";
      resultTitle.textContent = "إجابة صحيحة!";
      resultTitle.classList.add("correct");
      resultTitle.classList.remove("wrong");
    } else {
      resultIcon.textContent = "❌";
      resultTitle.textContent = answer
        ? "إجابة خاطئة"
        : "لم تجب في الوقت المحدد";
      resultTitle.classList.add("wrong");
      resultTitle.classList.remove("correct");
    }
  }
);

// Game ended
socket.on("game:ended", ({ rank, score, isWinner }) => {
  showScreen("final");

  finalScoreValue.textContent = score;

  if (isWinner) {
    finalIcon.textContent = "👑";
    finalMessage.textContent = "فزت!";
    finalMessage.classList.add("winner");
    finalMessage.classList.remove("loser");
  } else {
    finalIcon.textContent = "😊";
    finalMessage.textContent = "أحسنت!";
    finalMessage.classList.add("loser");
    finalMessage.classList.remove("winner");
  }

  // Start refresh countdown timer
  startRefreshTimer();

  console.log(`Game ended. Rank: ${rank}, Score: ${score}`);
});

// Refresh timer function
function startRefreshTimer() {
  const refreshTimerDisplay = document.getElementById("refresh-timer-display");
  let timeLeft = 15;

  if (refreshTimerInterval) {
    clearInterval(refreshTimerInterval);
  }

  refreshTimerDisplay.textContent = timeLeft;

  refreshTimerInterval = setInterval(() => {
    timeLeft--;
    refreshTimerDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(refreshTimerInterval);
    }
  }, 1000);
}

// Disconnect handling
socket.on("disconnect", () => {
  console.log("Disconnected from server");
  showScreen("disconnected");
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
  showScreen("disconnected");
});

// Reconnect button
reconnectBtn.addEventListener("click", () => {
  location.reload();
});

// Helper functions
function showScreen(screen) {
  connectingScreen.classList.add("hidden");
  waitingScreen.classList.add("hidden");
  questionScreen.classList.add("hidden");
  answeredScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  finalScreen.classList.add("hidden");
  disconnectedScreen.classList.add("hidden");

  switch (screen) {
    case "connecting":
      connectingScreen.classList.remove("hidden");
      break;
    case "waiting":
      waitingScreen.classList.remove("hidden");
      break;
    case "question":
      questionScreen.classList.remove("hidden");
      break;
    case "answered":
      answeredScreen.classList.remove("hidden");
      break;
    case "result":
      resultScreen.classList.remove("hidden");
      break;
    case "final":
      finalScreen.classList.remove("hidden");
      break;
    case "disconnected":
      disconnectedScreen.classList.remove("hidden");
      break;
  }
}

// Prevent accidental page refresh/close
window.addEventListener("beforeunload", (e) => {
  if (currentPlayerNumber && currentScore >= 0) {
    e.preventDefault();
    e.returnValue = "";
  }
});

// Prevent double-tap zoom on iOS
let lastTouchEnd = 0;
document.addEventListener(
  "touchend",
  (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  },
  false
);
