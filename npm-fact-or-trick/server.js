require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const QRCode = require("qrcode");
const path = require("path");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "host.html"));
});

app.get("/controller", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "controller.html"));
});

// QR Code API endpoint - generates QR code as PNG image
app.get("/api/qrcode", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    // Generate QR code as PNG buffer (smaller size)
    const qrCodeBuffer = await QRCode.toBuffer(url, {
      width: 200, // Even smaller for horizontal layout
      margin: 2,
      color: {
        dark: "#1c2346",
        light: "#ffffff",
      },
      type: "png",
    });

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    res.send(qrCodeBuffer);
  } catch (error) {
    console.error("QR code generation error:", error);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

// Game state
let gameState = {
  roomId: null,
  players: {},
  currentQuestion: -1,
  questions: [],
  gameStarted: false,
  questionStartTime: null,
  roundInProgress: false,
  totalRounds: 7,
  questionTimer: null,
  playersReady: {},
};

// Load questions from JSON file
const fs = require("fs");
const path = require("path");

let questionsDatabase = [];

try {
  const questionsPath = path.join(__dirname, "questions.json");
  const questionsData = fs.readFileSync(questionsPath, "utf8");
  questionsDatabase = JSON.parse(questionsData);
  console.log(
    `✅ Loaded ${questionsDatabase.length} questions from questions.json`
  );
} catch (error) {
  console.error("❌ Error loading questions.json:", error.message);
  console.error("⚠️ Using empty questions array. Please create questions.json");
  questionsDatabase = [];
}

// Generate unique room ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Initialize new game
function initializeGame() {
  gameState.roomId = generateRoomId();
  gameState.players = {};
  gameState.currentQuestion = -1;
  gameState.gameStarted = false;
  gameState.questionStartTime = null;
  gameState.roundInProgress = false;
  gameState.playersReady = {};

  // Shuffle and select questions
  const shuffled = [...questionsDatabase].sort(() => Math.random() - 0.5);
  gameState.questions = shuffled.slice(0, gameState.totalRounds);

  console.log(`New game initialized with room ID: ${gameState.roomId}`);
  return gameState.roomId;
}

// Calculate score based on correctness and speed
function calculateScore(isCorrect, responseTime) {
  if (!isCorrect) return 0;

  const maxPoints = 1000;
  const maxTime = 10; // 10 seconds

  // Speed bonus: faster answers get more points
  const timeBonus = Math.max(0, (maxTime - responseTime) / maxTime);
  const score = Math.round(maxPoints * (0.5 + 0.5 * timeBonus));

  return score;
}

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Host requests game initialization
  socket.on("host:init", () => {
    const roomId = initializeGame();
    socket.join("host");

    // Generate QR code URL - support multiple deployment environments
    let controllerUrl;

    if (process.env.PUBLIC_URL) {
      // Use custom public URL if provided (for Cloudflare Tunnel, custom domains, etc.)
      controllerUrl = `${process.env.PUBLIC_URL}/controller?room=${roomId}`;
    } else {
      // Fallback to automatic detection
      const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
      const host = process.env.HOST || "localhost:3000";
      controllerUrl = `${protocol}://${host}/controller?room=${roomId}`;
    }

    socket.emit("host:initialized", {
      roomId,
      controllerUrl,
      totalRounds: gameState.totalRounds,
    });

    console.log(`\n🎮 Host initialized with room ${roomId}`);
    console.log(`📱 Mobile Controller URL: ${controllerUrl}\n`);
  });

  // Player joins game
  socket.on("player:join", ({ roomId }) => {
    // Check if room exists and game hasn't started
    if (roomId !== gameState.roomId) {
      socket.emit("player:error", { message: "غرفة اللعبة غير موجودة" });
      return;
    }

    if (gameState.gameStarted) {
      socket.emit("player:error", { message: "اللعبة قد بدأت بالفعل" });
      return;
    }

    // Check player limit
    const playerCount = Object.keys(gameState.players).length;
    if (playerCount >= 2) {
      socket.emit("player:error", { message: "اللعبة ممتلئة (2 لاعبين فقط)" });
      return;
    }

    // Add player
    const playerNumber = playerCount + 1;
    gameState.players[socket.id] = {
      id: socket.id,
      number: playerNumber,
      name: `اللاعب ${playerNumber}`,
      score: 0,
      answers: [],
    };
    gameState.playersReady[socket.id] = false;

    socket.join(roomId);

    socket.emit("player:joined", {
      playerNumber,
      playerName: `اللاعب ${playerNumber}`,
    });

    // Notify host
    io.to("host").emit("player:connected", {
      playerNumber,
      playerName: `اللاعب ${playerNumber}`,
      totalPlayers: Object.keys(gameState.players).length,
      isReady: false,
    });

    console.log(`Player ${playerNumber} joined room ${roomId}`);
  });

  // Player ready
  socket.on("player:ready", () => {
    const player = gameState.players[socket.id];
    if (!player || gameState.gameStarted) return;

    gameState.playersReady[socket.id] = true;

    // Notify host
    io.to("host").emit("player:ready", {
      playerNumber: player.number,
    });

    // Check if all players are ready
    const allPlayersReady =
      Object.keys(gameState.players).length === 2 &&
      Object.values(gameState.playersReady).every((ready) => ready === true);

    // Notify all players about ready status
    io.to(gameState.roomId).emit("player:readyStatus", {
      allReady: allPlayersReady,
    });

    if (allPlayersReady) {
      // Auto-start game when both players are ready
      gameState.gameStarted = true;
      gameState.currentQuestion = 0;

      io.to("host").emit("game:started");
      io.to(gameState.roomId).emit("game:started");

      // Start first question after a delay
      setTimeout(() => {
        startQuestion();
      }, 2000);

      console.log("Game started - both players ready");
    }
  });

  // Host starts game (deprecated - now auto-starts when both ready)
  socket.on("host:start", () => {
    // Check if both players are ready
    const allPlayersReady =
      Object.keys(gameState.players).length === 2 &&
      Object.values(gameState.playersReady).every((ready) => ready === true);

    if (!allPlayersReady) {
      socket.emit("host:error", {
        message: "يجب أن يكون كلا اللاعبان جاهزين للبدء",
      });
      return;
    }

    if (gameState.gameStarted) return;

    gameState.gameStarted = true;
    gameState.currentQuestion = 0;

    io.to("host").emit("game:started");
    io.to(gameState.roomId).emit("game:started");

    // Start first question after a delay
    setTimeout(() => {
      startQuestion();
    }, 2000);

    console.log("Game started");
  });

  // Player submits answer
  socket.on("player:answer", ({ answer }) => {
    if (!gameState.roundInProgress) return;

    const player = gameState.players[socket.id];
    if (!player) return;

    // Check if already answered
    const currentAnswers = player.answers[gameState.currentQuestion];
    if (currentAnswers) return;

    // Calculate response time
    const responseTime = (Date.now() - gameState.questionStartTime) / 1000;
    const currentQuestion = gameState.questions[gameState.currentQuestion];
    const isCorrect = answer === currentQuestion.answer;
    const points = calculateScore(isCorrect, responseTime);

    // Store answer
    player.answers[gameState.currentQuestion] = {
      answer,
      responseTime,
      isCorrect,
      points,
    };

    // Update score
    player.score += points;

    // Notify player
    socket.emit("player:answered", {
      answer,
      responseTime,
    });

    // Notify host of player answer
    io.to("host").emit("player:hasAnswered", {
      playerNumber: player.number,
    });

    console.log(
      `Player ${player.number} answered: ${answer} (${
        isCorrect ? "correct" : "wrong"
      }) in ${responseTime.toFixed(2)}s`
    );

    // Check if both players answered
    checkAllAnswered();
  });

  // New game request
  socket.on("host:newGame", () => {
    if (gameState.questionTimer) {
      clearTimeout(gameState.questionTimer);
    }

    const roomId = initializeGame();
    socket.join("host");

    // Generate QR code URL - support multiple deployment environments
    let controllerUrl;

    if (process.env.PUBLIC_URL) {
      controllerUrl = `${process.env.PUBLIC_URL}/controller?room=${roomId}`;
    } else {
      const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
      const host = process.env.HOST || "localhost:3000";
      controllerUrl = `${protocol}://${host}/controller?room=${roomId}`;
    }

    io.to("host").emit("host:initialized", {
      roomId,
      controllerUrl,
      totalRounds: gameState.totalRounds,
    });

    console.log(`\n🎮 New game started with room ${roomId}`);
    console.log(`📱 Mobile Controller URL: ${controllerUrl}\n`);
  });

  // Disconnect
  socket.on("disconnect", () => {
    const player = gameState.players[socket.id];
    if (player) {
      delete gameState.players[socket.id];
      delete gameState.playersReady[socket.id];
      io.to("host").emit("player:disconnected", {
        playerNumber: player.number,
      });
      console.log(`Player ${player.number} disconnected`);
    }
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start a question
function startQuestion() {
  const questionIndex = gameState.currentQuestion;
  if (questionIndex >= gameState.questions.length) {
    endGame();
    return;
  }

  gameState.roundInProgress = true;
  gameState.questionStartTime = Date.now();

  const question = gameState.questions[questionIndex];

  io.to("host").emit("question:start", {
    questionNumber: questionIndex + 1,
    totalQuestions: gameState.questions.length,
    question: question.question,
    timeLimit: 10,
  });

  io.to(gameState.roomId).emit("question:start", {
    questionNumber: questionIndex + 1,
    totalQuestions: gameState.questions.length,
    question: question.question,
    timeLimit: 10,
  });

  console.log(`Question ${questionIndex + 1} started`);

  // Auto-end question after time limit
  gameState.questionTimer = setTimeout(() => {
    endQuestion();
  }, 10000);
}

// Check if all players answered
function checkAllAnswered() {
  const playerIds = Object.keys(gameState.players);
  const allAnswered = playerIds.every((id) => {
    const player = gameState.players[id];
    return player.answers[gameState.currentQuestion] !== undefined;
  });

  if (allAnswered && gameState.roundInProgress) {
    clearTimeout(gameState.questionTimer);
    setTimeout(() => {
      endQuestion();
    }, 1000);
  }
}

// End current question and show results
function endQuestion() {
  if (!gameState.roundInProgress) return;

  gameState.roundInProgress = false;

  const question = gameState.questions[gameState.currentQuestion];
  const results = [];

  Object.values(gameState.players).forEach((player) => {
    const answer = player.answers[gameState.currentQuestion] || {
      answer: null,
      responseTime: 10,
      isCorrect: false,
      points: 0,
    };

    results.push({
      playerNumber: player.number,
      playerName: player.name,
      answer: answer.answer,
      responseTime: answer.responseTime,
      isCorrect: answer.isCorrect,
      points: answer.points,
      totalScore: player.score,
    });
  });

  // Send results to host
  io.to("host").emit("question:results", {
    correctAnswer: question.answer,
    results,
  });

  // Send results to each player
  Object.keys(gameState.players).forEach((socketId) => {
    const player = gameState.players[socketId];
    const answer = player.answers[gameState.currentQuestion] || {
      answer: null,
      responseTime: 10,
      isCorrect: false,
      points: 0,
    };

    io.to(socketId).emit("question:results", {
      correctAnswer: question.answer,
      yourAnswer: answer.answer,
      isCorrect: answer.isCorrect,
      responseTime: answer.responseTime,
      points: answer.points,
      totalScore: player.score,
    });
  });

  console.log(`Question ${gameState.currentQuestion + 1} ended`);

  // Move to next question
  setTimeout(() => {
    gameState.currentQuestion++;
    if (gameState.currentQuestion < gameState.questions.length) {
      startQuestion();
    } else {
      endGame();
    }
  }, 5000);
}

// End game and show final results
function endGame() {
  const players = Object.values(gameState.players);
  players.sort((a, b) => b.score - a.score);

  const finalResults = players.map((player, index) => ({
    playerNumber: player.number,
    playerName: player.name,
    score: player.score,
    rank: index + 1,
  }));

  io.to("host").emit("game:ended", {
    results: finalResults,
    winner: finalResults[0],
  });

  players.forEach((player) => {
    const rank = finalResults.find(
      (r) => r.playerNumber === player.number
    ).rank;
    io.to(player.id).emit("game:ended", {
      rank,
      score: player.score,
      isWinner: rank === 1,
    });
  });

  console.log("Game ended");
}

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.BIND_HOST || "0.0.0.0";

httpServer.listen(PORT, HOST, () => {
  console.log(`🎮 Fact or Trick server running on port ${PORT}`);
  console.log(`🌐 Server listening on ${HOST}:${PORT}`);

  if (process.env.PUBLIC_URL) {
    console.log(`🔗 Public URL: ${process.env.PUBLIC_URL}`);
    console.log(`📱 Players can access: ${process.env.PUBLIC_URL}/controller`);
  } else {
    console.log(`🌐 Local access: http://localhost:${PORT}`);
  }

  console.log(`\n✅ Ready to accept connections!`);
});
