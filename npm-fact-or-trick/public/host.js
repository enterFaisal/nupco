// Connect to Socket.IO
const socket = io();

// DOM Elements
const waitingScreen = document.getElementById("waiting-screen");
const questionScreen = document.getElementById("question-screen");
const resultsScreen = document.getElementById("results-screen");
const finalScreen = document.getElementById("final-screen");

const qrCanvas = document.getElementById("qr-canvas");
const player1Slot = document.getElementById("player1-slot");
const player2Slot = document.getElementById("player2-slot");
const startGameBtn = document.getElementById("start-game-btn");
const newGameBtn = document.getElementById("new-game-btn");

const roundNumber = document.getElementById("round-number");
const totalRounds = document.getElementById("total-rounds");
const timer = document.getElementById("timer");
const questionText = document.getElementById("question-text");

const player1Answer = document.getElementById("player1-answer");
const player2Answer = document.getElementById("player2-answer");
const player1Score = document.getElementById("player1-score");
const player2Score = document.getElementById("player2-score");

const correctAnswer = document.getElementById("correct-answer");
const player1Result = document.getElementById("player1-result");
const player2Result = document.getElementById("player2-result");
const nextTimer = document.getElementById("next-timer");

const winnerName = document.getElementById("winner-name");
const player1FinalScore = document.getElementById("player1-final-score");
const player2FinalScore = document.getElementById("player2-final-score");

let currentRoomId = null;
let questionTimerInterval = null;
let nextQuestionCountdown = null;

// Initialize host
socket.emit("host:init");

// Helper function to generate QR code using server API (NO CDN NEEDED!)
function generateQRCode(url) {
  console.log("🔄 Loading QR code from server...");

  // Clear any existing QR codes or fallbacks
  const container = qrCanvas.parentElement;
  const existingQRs = container.querySelectorAll("img[alt='QR Code']");
  const existingFallbacks = container.querySelectorAll(".url-fallback");

  existingQRs.forEach((qr) => qr.remove());
  existingFallbacks.forEach((fb) => fb.remove());

  // Create an image element instead of using canvas
  const qrImage = document.createElement("img");
  qrImage.style.cssText =
    "max-width: 200px; height: auto; display: block;"; /* Even smaller for horizontal layout */
  qrImage.alt = "QR Code";

  // Use server API to generate QR code
  const qrApiUrl = `/api/qrcode?url=${encodeURIComponent(url)}`;
  qrImage.src = qrApiUrl;

  qrImage.onload = () => {
    console.log("✅ QR Code loaded successfully!");
  };

  qrImage.onerror = () => {
    console.error("❌ Failed to load QR code from server");
    showURLAsFallback(url);
  };

  // Replace canvas with image
  qrCanvas.style.display = "none";
  container.appendChild(qrImage);
}

// Fallback function to show URL as text
function showURLAsFallback(url) {
  // Check if fallback already exists
  const existingFallback =
    qrCanvas.parentElement.querySelector(".url-fallback");
  if (existingFallback) {
    existingFallback.querySelector(".url-text").textContent = url;
    return;
  }

  const urlContainer = document.createElement("div");
  urlContainer.className = "url-fallback";
  urlContainer.style.cssText =
    "background: white; padding: 24px; border-radius: 16px; word-break: break-all; color: #1c2346; font-weight: 700; font-size: 18px; text-align: center; max-width: 400px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);";

  const label = document.createElement("div");
  label.style.cssText =
    "margin-bottom: 12px; font-size: 16px; color: #e06e0e; font-weight: 600;";
  label.textContent = "📱 افتح هذا الرابط على هاتفك:";

  const urlText = document.createElement("div");
  urlText.className = "url-text";
  urlText.style.cssText =
    "word-break: break-all; user-select: all; direction: ltr; text-align: center;";
  urlText.textContent = url;

  const copyBtn = document.createElement("button");
  copyBtn.style.cssText =
    "margin-top: 16px; padding: 12px 24px; background: #e06e0e; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;";
  copyBtn.textContent = "📋 نسخ الرابط";
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(url).then(() => {
      copyBtn.textContent = "✅ تم النسخ!";
      setTimeout(() => {
        copyBtn.textContent = "📋 نسخ الرابط";
      }, 2000);
    });
  };

  urlContainer.appendChild(label);
  urlContainer.appendChild(urlText);
  urlContainer.appendChild(copyBtn);
  qrCanvas.parentElement.appendChild(urlContainer);
}

// Host initialized
socket.on(
  "host:initialized",
  ({ roomId, controllerUrl, totalRounds: total }) => {
    currentRoomId = roomId;
    totalRounds.textContent = total;

    // Generate QR code
    generateQRCode(controllerUrl);

    showScreen("waiting");
    resetPlayerSlots();
  }
);

// Player connected
socket.on("player:connected", ({ playerNumber, playerName, totalPlayers }) => {
  const slot = playerNumber === 1 ? player1Slot : player2Slot;
  slot.classList.add("connected");
  slot.querySelector(".status-indicator").classList.remove("waiting");
  slot.querySelector(".status-indicator").classList.add("connected");

  console.log(`${playerName} connected (${totalPlayers}/2)`);
});

// Game ready to start
socket.on("game:ready", () => {
  startGameBtn.classList.remove("hidden");
});

// Player disconnected
socket.on("player:disconnected", ({ playerNumber }) => {
  const slot = playerNumber === 1 ? player1Slot : player2Slot;
  slot.classList.remove("connected");
  slot.querySelector(".status-indicator").classList.remove("connected");
  slot.querySelector(".status-indicator").classList.add("waiting");

  startGameBtn.classList.add("hidden");
});

// Start game button
startGameBtn.addEventListener("click", () => {
  socket.emit("host:start");
});

// Game started
socket.on("game:started", () => {
  showScreen("question");
});

// Question started
socket.on(
  "question:start",
  ({ questionNumber, totalQuestions, question, timeLimit }) => {
    showScreen("question");

    roundNumber.textContent = questionNumber;
    questionText.textContent = question;

    // Reset player answer status
    resetPlayerAnswerStatus(player1Answer);
    resetPlayerAnswerStatus(player2Answer);

    // Start countdown
    let timeLeft = timeLimit;
    timer.textContent = timeLeft;

    if (questionTimerInterval) clearInterval(questionTimerInterval);

    questionTimerInterval = setInterval(() => {
      timeLeft--;
      timer.textContent = timeLeft;

      if (timeLeft <= 0) {
        clearInterval(questionTimerInterval);
      }
    }, 1000);
  }
);

// Player has answered
socket.on("player:hasAnswered", ({ playerNumber }) => {
  const answerBox = playerNumber === 1 ? player1Answer : player2Answer;
  const statusEl = answerBox.querySelector(".answer-status");

  statusEl.classList.remove("waiting");
  statusEl.classList.add("answered");
  statusEl.textContent = "✓ تم الإجابة";
});

// Question results
socket.on("question:results", ({ correctAnswer: correct, results }) => {
  if (questionTimerInterval) clearInterval(questionTimerInterval);

  showScreen("results");

  // Display correct answer
  correctAnswer.textContent = correct === "fact" ? "حقيقة" : "خدعة";

  // Display results for each player
  results.forEach((result) => {
    if (result.playerNumber === 1) {
      updatePlayerResult(player1Result, result, results);
      player1Score.textContent = result.totalScore;
      document.getElementById("player1-total-score").textContent =
        result.totalScore;
    } else {
      updatePlayerResult(player2Result, result, results);
      player2Score.textContent = result.totalScore;
      document.getElementById("player2-total-score").textContent =
        result.totalScore;
    }
  });

  // Update leaderboard bars
  updateLeaderboard(results);

  // Countdown to next question
  let countdown = 5;
  nextTimer.textContent = countdown;

  if (nextQuestionCountdown) clearInterval(nextQuestionCountdown);

  nextQuestionCountdown = setInterval(() => {
    countdown--;
    nextTimer.textContent = countdown;

    if (countdown <= 0) {
      clearInterval(nextQuestionCountdown);
    }
  }, 1000);
});

// Game ended
socket.on("game:ended", ({ results, winner }) => {
  if (questionTimerInterval) clearInterval(questionTimerInterval);
  if (nextQuestionCountdown) clearInterval(nextQuestionCountdown);

  showScreen("final");

  winnerName.textContent = winner.playerName;

  // Display final scores
  const player1Data = results.find((r) => r.playerNumber === 1);
  const player2Data = results.find((r) => r.playerNumber === 2);

  if (player1Data) {
    player1FinalScore.textContent = player1Data.score;
    document.getElementById("player1-final-score").textContent =
      player1Data.score;
  }

  if (player2Data) {
    player2FinalScore.textContent = player2Data.score;
    document.getElementById("player2-final-score").textContent =
      player2Data.score;
  }

  // Highlight winner
  const winnerCard =
    document.querySelectorAll(".final-score-card")[winner.playerNumber - 1];
  if (winnerCard) {
    winnerCard.classList.add("winner");
  }
});

// New game button
newGameBtn.addEventListener("click", () => {
  socket.emit("host:newGame");
});

// Helper functions
function showScreen(screen) {
  waitingScreen.classList.add("hidden");
  questionScreen.classList.add("hidden");
  resultsScreen.classList.add("hidden");
  finalScreen.classList.add("hidden");

  switch (screen) {
    case "waiting":
      waitingScreen.classList.remove("hidden");
      break;
    case "question":
      questionScreen.classList.remove("hidden");
      break;
    case "results":
      resultsScreen.classList.remove("hidden");
      break;
    case "final":
      finalScreen.classList.remove("hidden");
      break;
  }
}

function resetPlayerSlots() {
  [player1Slot, player2Slot].forEach((slot) => {
    slot.classList.remove("connected");
    const indicator = slot.querySelector(".status-indicator");
    indicator.classList.remove("connected");
    indicator.classList.add("waiting");
  });
  startGameBtn.classList.add("hidden");
}

function resetPlayerAnswerStatus(answerBox) {
  const statusEl = answerBox.querySelector(".answer-status");
  statusEl.classList.remove("answered");
  statusEl.classList.add("waiting");
  statusEl.textContent = "⏱️ في الانتظار...";

  answerBox.classList.remove("answered", "correct", "wrong");
}

function updatePlayerResult(resultElement, playerData, allResults) {
  // Update answer
  const answerBadge = resultElement.querySelector(".answer-badge");
  if (playerData.answer) {
    answerBadge.textContent = playerData.answer === "fact" ? "حقيقة" : "خدعة";
    answerBadge.classList.toggle("correct", playerData.isCorrect);
    answerBadge.classList.toggle("wrong", !playerData.isCorrect);
  } else {
    answerBadge.textContent = "لم يجب";
    answerBadge.classList.add("wrong");
  }

  // Update points earned
  const pointsEl = resultElement.querySelector(".points-earned");
  pointsEl.textContent = playerData.points > 0 ? `+${playerData.points}` : "0";
  pointsEl.classList.toggle("positive", playerData.points > 0);
}

function updateLeaderboard(results) {
  const maxScore = Math.max(...results.map((r) => r.totalScore)) || 1;

  results.forEach((result) => {
    const barId = `player${result.playerNumber}-score-bar`;
    const bar = document.getElementById(barId);

    if (bar) {
      const percentage = (result.totalScore / maxScore) * 100;
      bar.style.width = `${Math.max(percentage, 10)}%`;
    }
  });
}
