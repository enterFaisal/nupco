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
  totalRounds: 10,
  questionTimer: null,
};

// Cybersecurity questions database
const questionsDatabase = [
  {
    question:
      "تثبيت برنامج مكافحة الفيروسات يجعل جهازك محمياً بنسبة 100% من جميع التهديدات السيبرانية.",
    answer: "trick",
    explanation:
      "خدعة! برامج مكافحة الفيروسات مهمة لكنها ليست حماية كاملة. يجب استخدام عدة طبقات أمنية.",
  },
  {
    question:
      "كلمات المرور القوية يجب أن تحتوي على مزيج من الأحرف الكبيرة والصغيرة والأرقام والرموز.",
    answer: "fact",
    explanation:
      "حقيقة! كلمات المرور القوية والمعقدة تجعل اختراق حسابك أصعب بكثير.",
  },
  {
    question:
      "فتح مرفقات البريد الإلكتروني من مصادر غير معروفة آمن تماماً إذا كان لديك برنامج مكافحة فيروسات.",
    answer: "trick",
    explanation:
      "خدعة! المرفقات من مصادر غير موثوقة خطيرة ويمكن أن تحتوي على برمجيات خبيثة.",
  },
  {
    question: "المصادقة الثنائية (2FA) تضيف طبقة حماية إضافية لحساباتك.",
    answer: "fact",
    explanation:
      "حقيقة! المصادقة الثنائية تتطلب خطوة تحقق إضافية، مما يجعل اختراق حسابك أصعب.",
  },
  {
    question:
      "استخدام نفس كلمة المرور لجميع حساباتك يجعلها أسهل في التذكر ولا يشكل خطراً أمنياً.",
    answer: "trick",
    explanation:
      "خدعة! إذا تم اختراق كلمة مرور واحدة، فإن جميع حساباتك ستكون في خطر.",
  },
  {
    question:
      "التحديثات الأمنية للأنظمة والتطبيقات مهمة لحماية جهازك من الثغرات الأمنية.",
    answer: "fact",
    explanation: "حقيقة! التحديثات تصلح الثغرات الأمنية المكتشفة وتحمي نظامك.",
  },
  {
    question:
      "شبكات الواي فاي العامة (Public WiFi) آمنة تماماً للقيام بالمعاملات المصرفية.",
    answer: "trick",
    explanation:
      "خدعة! شبكات الواي فاي العامة غير آمنة ويمكن للمهاجمين التجسس على بياناتك.",
  },
  {
    question:
      "النسخ الاحتياطي المنتظم لبياناتك المهمة يحميك من فقدان البيانات في حالة الهجمات السيبرانية.",
    answer: "fact",
    explanation:
      "حقيقة! النسخ الاحتياطي يضمن عدم فقدان بياناتك حتى في حالة تعرضك لهجوم.",
  },
  {
    question:
      "رسائل البريد الإلكتروني من البنوك أو الشركات الرسمية دائماً آمنة ويمكن الثقة بها.",
    answer: "trick",
    explanation:
      "خدعة! هجمات التصيد الاحتيالي تتظاهر بأنها من جهات رسمية. تحقق دائماً من المرسل.",
  },
  {
    question:
      "استخدام VPN (الشبكة الافتراضية الخاصة) يساعد في حماية خصوصيتك عند تصفح الإنترنت.",
    answer: "fact",
    explanation:
      "حقيقة! VPN يشفر اتصالك ويخفي عنوان IP الخاص بك، مما يحمي خصوصيتك.",
  },
  {
    question:
      "يمكن تخزين كلمات المرور في ملف نصي على سطح المكتب للوصول السريع.",
    answer: "trick",
    explanation:
      "خدعة! هذا خطير جداً! استخدم مدير كلمات مرور آمن بدلاً من ذلك.",
  },
  {
    question:
      "هجمات التصيد الاحتيالي (Phishing) تحاول خداعك للكشف عن معلوماتك الحساسة.",
    answer: "fact",
    explanation:
      "حقيقة! التصيد الاحتيالي هو محاولة خداع لسرقة معلوماتك الشخصية أو المالية.",
  },
  {
    question:
      "تطبيقات الهاتف المحمول من المصادر غير الرسمية آمنة للتثبيت دائماً.",
    answer: "trick",
    explanation:
      "خدعة! التطبيقات من مصادر غير رسمية قد تحتوي على برمجيات خبيثة. استخدم المتاجر الرسمية فقط.",
  },
  {
    question:
      "يمكن للبرمجيات الخبيثة (Malware) سرقة بياناتك أو إلحاق الضرر بنظامك.",
    answer: "fact",
    explanation:
      "حقيقة! البرمجيات الخبيثة يمكن أن تسرق البيانات، تتلف الملفات، أو تتحكم في جهازك.",
  },
  {
    question:
      "مشاركة موقعك الجغرافي في كل منشور على وسائل التواصل الاجتماعي لا يشكل أي مخاطر أمنية.",
    answer: "trick",
    explanation:
      "خدعة! مشاركة موقعك باستمرار يمكن أن يكشف عن روتينك اليومي ويعرضك للمخاطر.",
  },
];

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

    console.log(`Host initialized with room ${roomId}`);
    console.log(`Controller URL: ${controllerUrl}`);
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
    });

    console.log(`Player ${playerNumber} joined room ${roomId}`);

    // If both players connected, enable start button
    if (Object.keys(gameState.players).length === 2) {
      io.to("host").emit("game:ready");
    }
  });

  // Host starts game
  socket.on("host:start", () => {
    if (Object.keys(gameState.players).length !== 2) {
      socket.emit("host:error", { message: "يجب أن يكون هناك لاعبان للبدء" });
      return;
    }

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

    console.log("New game started");
  });

  // Disconnect
  socket.on("disconnect", () => {
    const player = gameState.players[socket.id];
    if (player) {
      delete gameState.players[socket.id];
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
