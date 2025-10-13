/* =========================
   NUPCO-themed email set
   Loaded from emails.json
   ========================= */
let emails = [];

// Load emails from JSON file
async function loadEmails() {
  try {
    const response = await fetch("emails.json");
    emails = await response.json();
    console.log("✅ Emails loaded successfully");
    return true;
  } catch (error) {
    console.error("❌ Error loading emails:", error);
    alert("خطأ في تحميل الرسائل. يرجى التحديث.");
    return false;
  }
}

/* =========================
   State
   ========================= */
let selectedEmails = [];
let currentEmailIndex = 0;
let score = 0;
let timeLeft = 60;
let timerId = null;
let incorrectAnswers = [];
let reviewIndex = 0;

/* =========================
   DOM
   ========================= */
const emailCard = document.getElementById("email-card");
const emailSubject = document.getElementById("email-subject");
const emailSender = document.getElementById("email-sender");
const emailContent = document.getElementById("email-content");
const emailTagsEl = document.getElementById("email-tags");

const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");

const deleteBtn = document.getElementById("delete-btn");
const reportBtn = document.getElementById("report-btn");

const instructionModal = document.getElementById("instruction-modal");
const startBtn = document.getElementById("start-btn");

const reviewModal = document.getElementById("review-modal");
const closeModal = document.getElementById("close-modal");
const reviewEmailSubject = document.getElementById("review-email-subject");
const reviewEmailSender = document.getElementById("review-email-sender");
const reviewEmailContent = document.getElementById("review-email-content");
const reviewExplanation = document.getElementById("review-explanation");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const replayBtn = document.getElementById("replay-btn");

const endScreen = document.getElementById("end-screen");
const endSummary = document.getElementById("end-summary");
const endReviewBtn = document.getElementById("end-review-btn");
const endReplayBtn = document.getElementById("end-replay-btn");

/* =========================
   Utils
   ========================= */
function disableLinks(el) {
  el.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", (e) => e.preventDefault());
    a.style.pointerEvents = "none";
    a.style.color = "#0b68d0";
    a.style.textDecoration = "underline";
  });
}
function selectRandomEmails() {
  const copy = [...emails].sort(() => Math.random() - 0.5);
  selectedEmails = copy.slice(0, 5);
}
function renderTags(tags) {
  emailTagsEl.innerHTML = "";
  (tags || []).forEach((t) => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = t;
    emailTagsEl.appendChild(span);
  });
}

/* =========================
   Game flow
   ========================= */
function startGame() {
  selectedEmails = [];
  currentEmailIndex = 0;
  score = 0;
  timeLeft = 60;
  incorrectAnswers = [];
  scoreDisplay.textContent = score;

  selectRandomEmails();
  displayEmail();

  clearInterval(timerId);
  timerId = setInterval(updateTimer, 1000);

  deleteBtn.disabled = false;
  reportBtn.disabled = false;
  endScreen.classList.add("hidden");
  reviewModal.classList.add("hidden");
}

function displayEmail() {
  if (currentEmailIndex >= selectedEmails.length) {
    endGame();
    return;
  }
  const email = selectedEmails[currentEmailIndex];

  emailCard.dataset.badge = email.badge || email.tags?.[0] || "رسالة";

  emailSubject.textContent = `الموضوع: ${email.subject}`;
  emailSender.textContent = `من: ${email.sender}`;
  emailContent.innerHTML = email.content;
  disableLinks(emailContent);
  renderTags(email.tags);
}

function updateTimer() {
  timeLeft--;
  timerDisplay.textContent = timeLeft;
  if (timeLeft <= 0) {
    endGame();
  }
}

function handleUserChoice(userThinksIsPhishing) {
  const email = selectedEmails[currentEmailIndex];
  const correct = email.isPhishing;

  if (userThinksIsPhishing === correct) {
    score++;
    scoreDisplay.textContent = score;
  } else {
    incorrectAnswers.push({ email, userChoice: userThinksIsPhishing });
  }

  currentEmailIndex++;
  displayEmail();
}

function endGame() {
  clearInterval(timerId);
  deleteBtn.disabled = true;
  reportBtn.disabled = true;

  const total = selectedEmails.length;
  const missed = incorrectAnswers.length;

  // Check win/lose condition
  const isWin = score >= 3;

  // Get modal content and add win/lose class
  const modalContent = document.querySelector("#end-screen .modal-content");
  modalContent.classList.remove("win", "lose");
  modalContent.classList.add(isWin ? "win" : "lose");

  // Set result icon
  const resultIcon = document.getElementById("result-icon");
  resultIcon.textContent = isWin ? "🎉" : "😔";

  // Set result title
  const endTitle = document.getElementById("end-title");
  endTitle.textContent = isWin ? "مبروك! فزت!" : "للأسف! خسرت";

  // Set summary
  endSummary.textContent = missed
    ? "لديك رسائل لم تصب فيها — يمكنك مراجعتها أو البدء من جديد."
    : "أحسنت! أجبت على جميع الأسئلة بشكل صحيح!";

  // Set final score
  const finalScore = document.getElementById("final-score");
  finalScore.textContent = `النتيجة النهائية: ${score} من ${total}`;

  endScreen.classList.remove("hidden");

  // If no mistakes, hide the review button
  endReviewBtn.style.display = missed ? "inline-flex" : "none";
}

/* =========================
   Review (explanations shown here only)
   ========================= */
function fillReviewCard() {
  const item = incorrectAnswers[reviewIndex];
  if (!item) return;

  const email = item.email;

  document.querySelector("#review-modal .email-card").dataset.badge =
    email.badge || email.tags?.[0] || "رسالة";

  reviewEmailSubject.textContent = `الموضوع: ${email.subject}`;
  reviewEmailSender.innerHTML = `من: <span class="highlight">${email.sender}</span>`;
  reviewEmailContent.innerHTML = email.content;
  disableLinks(reviewEmailContent);
  reviewExplanation.textContent = email.explanation || "لا يوجد توضيح متاح.";

  prevBtn.disabled = reviewIndex === 0;
  nextBtn.disabled = reviewIndex === incorrectAnswers.length - 1;
}

/* =========================
   Events
   ========================= */
deleteBtn.addEventListener("click", () => handleUserChoice(false));
reportBtn.addEventListener("click", () => handleUserChoice(true));

startBtn.addEventListener("click", async () => {
  // Load emails if not already loaded
  if (emails.length === 0) {
    const loaded = await loadEmails();
    if (!loaded) return;
  }

  instructionModal.classList.add("hidden");
  document.querySelector(".game-container").classList.remove("hidden");
  startGame();
});

nextBtn.addEventListener("click", () => {
  if (reviewIndex < incorrectAnswers.length - 1) {
    reviewIndex++;
    fillReviewCard();
  }
});
prevBtn.addEventListener("click", () => {
  if (reviewIndex > 0) {
    reviewIndex--;
    fillReviewCard();
  }
});
closeModal.addEventListener("click", () => reviewModal.classList.add("hidden"));

replayBtn.addEventListener("click", () => {
  reviewModal.classList.add("hidden");
  startGame();
});

endReplayBtn.addEventListener("click", () => {
  endScreen.classList.add("hidden");
  startGame();
});

endReviewBtn.addEventListener("click", () => {
  endScreen.classList.add("hidden");
  if (incorrectAnswers.length) {
    reviewIndex = 0;
    fillReviewCard();
    reviewModal.classList.remove("hidden");
  }
});
