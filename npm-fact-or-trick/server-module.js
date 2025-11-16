require("dotenv").config();
const express = require("express");
const { Server } = require("socket.io");
const QRCode = require("qrcode");
const path = require("path");

const app = express();

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
      width: 200,
      margin: 2,
      color: {
        dark: "#1c2346",
        light: "#ffffff",
      },
      type: "png",
    });

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(qrCodeBuffer);
  } catch (error) {
    console.error("QR code generation error:", error);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

// Load questions from JSON file
const fs = require("fs");
// const path = require("path");

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

// Socket.IO initialization function
function initSocket(httpServer, namespace = "/fact-or-trick") {
  const io = new Server(httpServer, {
    path: `${namespace}/socket.io/`,
  });

  const factOrTrickIO = io.of(namespace);

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

    console.log(
      `[Fact or Trick] New game initialized with room ID: ${gameState.roomId}`
    );
    return gameState.roomId;
  }

  // Calculate score based on correctness and speed
  function calculateScore(isCorrect, responseTime) {
    if (!isCorrect) return 0;

    const maxPoints = 1000;
    const maxTime = 10;

    const timeBonus = Math.max(0, (maxTime - responseTime) / maxTime);
    const score = Math.round(maxPoints * (0.5 + 0.5 * timeBonus));

    return score;
  }

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

    factOrTrickIO.to("host").emit("question:start", {
      questionNumber: questionIndex + 1,
      totalQuestions: gameState.questions.length,
      question: question.question,
      timeLimit: 10,
    });

    factOrTrickIO.to(gameState.roomId).emit("question:start", {
      questionNumber: questionIndex + 1,
      totalQuestions: gameState.questions.length,
      question: question.question,
      timeLimit: 10,
    });

    console.log(`[Fact or Trick] Question ${questionIndex + 1} started`);

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

    factOrTrickIO.to("host").emit("question:results", {
      correctAnswer: question.answer,
      results,
    });

    Object.keys(gameState.players).forEach((socketId) => {
      const player = gameState.players[socketId];
      const answer = player.answers[gameState.currentQuestion] || {
        answer: null,
        responseTime: 10,
        isCorrect: false,
        points: 0,
      };

      factOrTrickIO.to(socketId).emit("question:results", {
        correctAnswer: question.answer,
        yourAnswer: answer.answer,
        isCorrect: answer.isCorrect,
        responseTime: answer.responseTime,
        points: answer.points,
        totalScore: player.score,
      });
    });

    console.log(
      `[Fact or Trick] Question ${gameState.currentQuestion + 1} ended`
    );

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

    factOrTrickIO.to("host").emit("game:ended", {
      results: finalResults,
      winner: finalResults[0],
    });

    players.forEach((player) => {
      const rank = finalResults.find(
        (r) => r.playerNumber === player.number
      ).rank;
      factOrTrickIO.to(player.id).emit("game:ended", {
        rank,
        score: player.score,
        isWinner: rank === 1,
      });
    });

    console.log("[Fact or Trick] Game ended");
  }

  // Socket.IO connection handling
  factOrTrickIO.on("connection", (socket) => {
    console.log(`[Fact or Trick] Client connected: ${socket.id}`);

    socket.on("host:init", () => {
      const roomId = initializeGame();
      socket.join("host");

      let controllerUrl;
      if (process.env.PUBLIC_URL) {
        controllerUrl = `${process.env.PUBLIC_URL}${namespace}/controller?room=${roomId}`;
      } else {
        const protocol =
          process.env.NODE_ENV === "production" ? "https" : "http";
        const host = process.env.HOST || "localhost:3000";
        controllerUrl = `${protocol}://${host}${namespace}/controller?room=${roomId}`;
      }

      socket.emit("host:initialized", {
        roomId,
        controllerUrl,
        totalRounds: gameState.totalRounds,
      });

      console.log(`\n[Fact or Trick] 🎮 Host initialized with room ${roomId}`);
      console.log(`[Fact or Trick] 📱 Mobile Controller URL: ${controllerUrl}\n`);
    });

    socket.on("player:join", ({ roomId }) => {
      if (roomId !== gameState.roomId) {
        socket.emit("player:error", { message: "غرفة اللعبة غير موجودة" });
        return;
      }

      if (gameState.gameStarted) {
        socket.emit("player:error", { message: "اللعبة قد بدأت بالفعل" });
        return;
      }

      const playerCount = Object.keys(gameState.players).length;
      if (playerCount >= 2) {
        socket.emit("player:error", {
          message: "اللعبة ممتلئة (2 لاعبين فقط)",
        });
        return;
      }

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

      factOrTrickIO.to("host").emit("player:connected", {
        playerNumber,
        playerName: `اللاعب ${playerNumber}`,
        totalPlayers: Object.keys(gameState.players).length,
        isReady: false,
      });

      console.log(
        `[Fact or Trick] Player ${playerNumber} joined room ${roomId}`
      );
    });

    // Player ready
    socket.on("player:ready", () => {
      const player = gameState.players[socket.id];
      if (!player || gameState.gameStarted) return;

      gameState.playersReady[socket.id] = true;

      // Notify host
      factOrTrickIO.to("host").emit("player:ready", {
        playerNumber: player.number,
      });

      // Check if all players are ready
      const allPlayersReady =
        Object.keys(gameState.players).length === 2 &&
        Object.values(gameState.playersReady).every((ready) => ready === true);

      // Notify all players about ready status
      factOrTrickIO.to(gameState.roomId).emit("player:readyStatus", {
        allReady: allPlayersReady,
      });

      if (allPlayersReady) {
        // Auto-start game when both players are ready
        gameState.gameStarted = true;
        gameState.currentQuestion = 0;

        factOrTrickIO.to("host").emit("game:started");
        factOrTrickIO.to(gameState.roomId).emit("game:started");

        setTimeout(() => {
          startQuestion();
        }, 2000);

        console.log("[Fact or Trick] Game started - both players ready");
      }
    });

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

      factOrTrickIO.to("host").emit("game:started");
      factOrTrickIO.to(gameState.roomId).emit("game:started");

      setTimeout(() => {
        startQuestion();
      }, 2000);

      console.log("[Fact or Trick] Game started");
    });

    socket.on("player:answer", ({ answer }) => {
      if (!gameState.roundInProgress) return;

      const player = gameState.players[socket.id];
      if (!player) return;

      const currentAnswers = player.answers[gameState.currentQuestion];
      if (currentAnswers) return;

      const responseTime = (Date.now() - gameState.questionStartTime) / 1000;
      const currentQuestion = gameState.questions[gameState.currentQuestion];
      const isCorrect = answer === currentQuestion.answer;
      const points = calculateScore(isCorrect, responseTime);

      player.answers[gameState.currentQuestion] = {
        answer,
        responseTime,
        isCorrect,
        points,
      };

      player.score += points;

      socket.emit("player:answered", {
        answer,
        responseTime,
      });

      factOrTrickIO.to("host").emit("player:hasAnswered", {
        playerNumber: player.number,
      });

      console.log(
        `[Fact or Trick] Player ${player.number} answered: ${answer} (${
          isCorrect ? "correct" : "wrong"
        })`
      );

      checkAllAnswered();
    });

    socket.on("host:newGame", () => {
      if (gameState.questionTimer) {
        clearTimeout(gameState.questionTimer);
      }

      const roomId = initializeGame();
      socket.join("host");

      let controllerUrl;
      if (process.env.PUBLIC_URL) {
        controllerUrl = `${process.env.PUBLIC_URL}${namespace}/controller?room=${roomId}`;
      } else {
        const protocol =
          process.env.NODE_ENV === "production" ? "https" : "http";
        const host = process.env.HOST || "localhost:3000";
        controllerUrl = `${protocol}://${host}${namespace}/controller?room=${roomId}`;
      }

      factOrTrickIO.emit("host:initialized", {
        roomId,
        controllerUrl,
        totalRounds: gameState.totalRounds,
      });

      console.log(`\n[Fact or Trick] 🎮 New game started with room ${roomId}`);
      console.log(`[Fact or Trick] 📱 Mobile Controller URL: ${controllerUrl}\n`);
    });

    socket.on("disconnect", () => {
      const player = gameState.players[socket.id];
      if (player) {
        delete gameState.players[socket.id];
        delete gameState.playersReady[socket.id];
        factOrTrickIO.to("host").emit("player:disconnected", {
          playerNumber: player.number,
        });
        console.log(`[Fact or Trick] Player ${player.number} disconnected`);
      }
      console.log(`[Fact or Trick] Client disconnected: ${socket.id}`);
    });
  });

  console.log(
    `✅ Fact or Trick Socket.IO initialized on namespace: ${namespace}`
  );
}

module.exports = { app, initSocket };
