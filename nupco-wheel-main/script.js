/* =========================
   Data: fields + simple quiz
   Loaded from questions.json
   ========================= */
let CYBER_FIELDS = [];
let QUIZ_BANK = {};

// Load questions from JSON file
async function loadQuestions() {
  try {
    const response = await fetch("questions.json");
    const data = await response.json();
    CYBER_FIELDS = data.fields;
    QUIZ_BANK = data.questions;
    console.log("✅ Questions loaded successfully");
    return true;
  } catch (error) {
    console.error("❌ Error loading questions:", error);
    alert("خطأ في تحميل الأسئلة. يرجى التحديث.");
    return false;
  }
}

/* =========================
   DOM
   ========================= */
const wheelStage = document.getElementById("wheel-stage");
const wheelCanvas = document.getElementById("cyberWheel");
const wheelSpinBtn = document.getElementById("wheel-spin-btn");

const quizModal = document.getElementById("quiz-modal");
const quizClose = document.getElementById("quiz-close");
const quizField = document.getElementById("quiz-field");
const quizQuestion = document.getElementById("quiz-question");
const quizOptions = document.getElementById("quiz-options");
const quizFeedback = document.getElementById("quiz-feedback");
const quizContinue = document.getElementById("quiz-continue");

/* =========================
   Game levels system
   ========================= */
const GAME_STATE = {
  currentRound: 1,
  totalRounds: 4,
  correctAnswers: 0,
  answeredFields: new Set(),
};

function updateLevelDisplay() {
  const levelDisplay = document.getElementById("level-display");
  const progressBar = document.getElementById("level-progress");
  const scoreDisplay = document.getElementById("score-display");

  if (levelDisplay) {
    levelDisplay.textContent = `الجولة ${GAME_STATE.currentRound} من ${GAME_STATE.totalRounds}`;
  }

  if (progressBar) {
    const progress =
      ((GAME_STATE.currentRound - 1) / GAME_STATE.totalRounds) * 100;
    progressBar.style.width = `${progress}%`;
  }

  if (scoreDisplay) {
    scoreDisplay.textContent = `النقاط: ${GAME_STATE.correctAnswers}`;
  }
}

function advanceRound() {
  if (GAME_STATE.currentRound < GAME_STATE.totalRounds) {
    GAME_STATE.currentRound++;
    updateLevelDisplay();
  } else {
    showGameCompleteMessage();
  }
}

function showGameCompleteMessage() {
  quizModal.classList.remove("hidden");

  // Check win/lose condition
  const isWin = GAME_STATE.correctAnswers >= 3;

  // Get modal content and add win/lose class
  const modalContent = document.querySelector("#quiz-modal .modal-content");
  modalContent.classList.remove("win", "lose");
  modalContent.classList.add(isWin ? "win" : "lose", "result-modal", "center");

  // Hide quiz title
  document.getElementById("quiz-title").style.display = "none";

  // Set result icon
  quizField.innerHTML = `<div class="result-icon">${isWin ? "🎉" : "😔"}</div>`;
  quizField.className = "";

  // Set result title
  quizQuestion.className = "result-title";
  quizQuestion.textContent = isWin ? "مبروك! فزت!" : "للأسف! خسرت";

  // Set summary
  quizFeedback.className = "result-summary";
  if (isWin) {
    quizFeedback.textContent = "أحسنت! أنت الآن خبير في الأمن السيبراني! 🌟";
  } else {
    quizFeedback.textContent = "حاول مرة أخرى لتحسين نتيجتك! 💪";
  }
  quizFeedback.style.color = "";

  // Clear options grid and replace with result content
  quizOptions.style.display = "block";
  quizOptions.innerHTML = "";

  // Create score display
  const scoreDiv = document.createElement("div");
  scoreDiv.className = "result-score";
  scoreDiv.innerHTML = `<span class="final-score-text">النتيجة النهائية: ${GAME_STATE.correctAnswers} من ${GAME_STATE.totalRounds}</span>`;
  quizOptions.appendChild(scoreDiv);

  // Add actions
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "actions";

  const restartBtn = document.createElement("button");
  restartBtn.className = "btn primary";
  restartBtn.textContent = "ابدأ من جديد";
  restartBtn.addEventListener("click", resetGame);

  actionsDiv.appendChild(restartBtn);
  quizOptions.appendChild(actionsDiv);

  quizContinue.classList.add("hidden");
}

function resetGame() {
  GAME_STATE.currentRound = 1;
  GAME_STATE.correctAnswers = 0;
  GAME_STATE.answeredFields.clear();
  updateLevelDisplay();

  // Reset modal styling
  const modalContent = document.querySelector("#quiz-modal .modal-content");
  modalContent.classList.remove("win", "lose", "result-modal", "center");

  // Show quiz title again
  document.getElementById("quiz-title").style.display = "block";

  // Reset fields
  quizField.innerHTML = "";
  quizField.className = "quiz-field";
  quizQuestion.className = "quiz-question";
  quizFeedback.className = "quiz-feedback";
  quizOptions.innerHTML = "";
  quizOptions.style.display = "";

  quizModal.classList.add("hidden");
}

/* =========================
   Wheel rendering (canvas)
   ========================= */
const BRAND_SLICE_COLORS = [
  "#ffb36a",
  "#ff6a3d",
  "#e3151c",
  "#2a2f57",
  "#1c2346",
  "#e06e0e",
  "#5cb85c",
  "#0bbbd6",
];

const WHEEL = {
  rot: 0,
  slices: [],
  spinning: false,
  ANG: 0,
};

function drawWheel(rot = 0) {
  const ctx = wheelCanvas.getContext("2d");
  const box = document.querySelector(".wheel-box");
  const size = Math.round(box.clientWidth || 320);
  // HiDPI
  wheelCanvas.width = size * 2;
  wheelCanvas.height = size * 2;

  const W = wheelCanvas.width,
    H = wheelCanvas.height;
  const cx = W / 2,
    cy = H / 2;
  const R = Math.min(W, H) / 2 - W * 0.02;

  ctx.clearRect(0, 0, W, H);

  for (let i = 0; i < WHEEL.slices.length; i++) {
    const start = rot + i * WHEEL.ANG;
    const end = start + WHEEL.ANG;

    const c1 = BRAND_SLICE_COLORS[i % BRAND_SLICE_COLORS.length];
    const c2 = BRAND_SLICE_COLORS[(i + 1) % BRAND_SLICE_COLORS.length];
    const grad = ctx.createLinearGradient(cx, cy - R, cx, cy + R);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, start, end);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Divider
    ctx.lineWidth = W * 0.006;
    ctx.strokeStyle = "rgba(255,255,255,.18)";
    ctx.stroke();

    // Label
    const mid = (start + end) / 2;
    const rx = cx + R * 0.62 * Math.cos(mid);
    const ry = cy + R * 0.62 * Math.sin(mid);

    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(mid + Math.PI / 2);
    ctx.fillStyle = "#fff";
    ctx.font = `${Math.round(W / 28)}px "Cairo", Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    wrapFillText(ctx, WHEEL.slices[i].ar, 0, 0, R * 0.44, Math.round(W / 30));
    ctx.restore();
  }

  // center hub
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,.95)";
  ctx.fill();

  // outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.lineWidth = W * 0.012;
  ctx.strokeStyle = "rgba(255,255,255,.24)";
  ctx.stroke();
}

function wrapFillText(ctx, text, x, y, maxWidth, lh) {
  const words = String(text).split(/\s+/);
  let line = "",
    lines = [];
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (ctx.measureText(t).width <= maxWidth) line = t;
    else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  const offset = (-(lines.length - 1) * lh) / 2;
  lines.forEach((ln, i) => ctx.fillText(ln, x, y + offset + i * lh));
}

function fitWheel() {
  drawWheel(WHEEL.rot);
}
window.addEventListener("resize", fitWheel, { passive: true });

/* =========================
   Spin + pick + quiz
   ========================= */
let _answered = false;

function spinWheel() {
  if (WHEEL.spinning) return;
  WHEEL.spinning = true;
  wheelSpinBtn.disabled = true;

  const N = WHEEL.slices.length;
  let targetIndex;
  let attempts = 0;

  // Try to pick a field that hasn't been answered in this level
  do {
    targetIndex = Math.floor(Math.random() * N);
    attempts++;
  } while (
    GAME_STATE.answeredFields.has(WHEEL.slices[targetIndex].id) &&
    attempts < 20
  );

  const rounds = Math.floor(Math.random() * 3) + 3; // 3..5 turns
  const finalRot =
    rounds * 2 * Math.PI +
    (N - targetIndex) * WHEEL.ANG -
    WHEEL.ANG / 2 -
    Math.PI / 2;
  const D = 3200; // ms
  const t0 = performance.now();
  const easeOut = (t) => 1 - (1 - t) * (1 - t);

  function tick(now) {
    const p = Math.min((now - t0) / D, 1);
    WHEEL.rot = easeOut(p) * finalRot;
    drawWheel(WHEEL.rot);
    if (p < 1) requestAnimationFrame(tick);
    else {
      WHEEL.spinning = false;
      wheelSpinBtn.disabled = false;
      const picked = WHEEL.slices[targetIndex];
      openQuizForField(picked);
    }
  }
  requestAnimationFrame(tick);
}

function openQuizForField(field) {
  const bank = QUIZ_BANK[field.id] || null;

  // Reset modal styling
  const modalContent = document.querySelector("#quiz-modal .modal-content");
  modalContent.classList.remove("win", "lose", "result-modal", "center");

  // Show quiz title
  document.getElementById("quiz-title").style.display = "block";

  // Reset content
  quizField.innerHTML = `المجال: ${field.ar}`;
  quizField.className = "quiz-field";
  quizQuestion.className = "quiz-question";
  quizFeedback.className = "quiz-feedback";
  quizFeedback.textContent = "";
  quizContinue.classList.add("hidden");
  quizOptions.innerHTML = "";
  quizOptions.style.display = "";
  _answered = false;

  if (!bank) {
    quizQuestion.textContent = "سؤال غير متاح لهذا المجال.";
    quizContinue.classList.remove("hidden");
    quizModal.classList.remove("hidden");
    return;
  }

  quizQuestion.textContent = bank.q;

  // Render options
  bank.options.forEach((txt, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn";
    btn.textContent = txt;
    btn.addEventListener("click", () =>
      handleQuizAnswer(i, bank.correct, field.id)
    );
    quizOptions.appendChild(btn);
  });

  quizModal.classList.remove("hidden");
}

function handleQuizAnswer(chosen, correct, fieldId) {
  if (_answered) return;
  _answered = true;

  // Add the field to the answered set to avoid repeats
  GAME_STATE.answeredFields.add(fieldId);

  const btns = [...quizOptions.querySelectorAll(".option-btn")];
  btns.forEach((b, i) => {
    if (i === correct) b.classList.add("correct");
    if (i === chosen && chosen !== correct) b.classList.add("wrong");
    b.disabled = true;
  });

  if (chosen === correct) {
    GAME_STATE.correctAnswers++;
    quizFeedback.textContent = "إجابة صحيحة! 👏";
    quizFeedback.style.color = "#5cb85c";
  } else {
    quizFeedback.textContent = "إجابة غير صحيحة. لا بأس!";
    quizFeedback.style.color = "#ffb36a";
  }

  updateLevelDisplay();
  quizContinue.classList.remove("hidden");
}

/* =========================
   Events
   ========================= */
document.addEventListener("DOMContentLoaded", async () => {
  // Load questions first
  const loaded = await loadQuestions();
  if (!loaded) return;

  // Initialize wheel with loaded data
  WHEEL.slices = CYBER_FIELDS;
  WHEEL.ANG = (2 * Math.PI) / CYBER_FIELDS.length;

  fitWheel();
  updateLevelDisplay();

  wheelSpinBtn.addEventListener("click", spinWheel);

  quizContinue.addEventListener("click", () => {
    quizModal.classList.add("hidden");
    // Advance to next round after any answer (correct or incorrect)
    advanceRound();
  });

  quizClose.addEventListener("click", () => {
    quizModal.classList.add("hidden");
  });
});
