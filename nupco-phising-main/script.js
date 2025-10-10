/* =========================
   NUPCO-themed email set
   (mix of legit + phishing)
   ========================= */
const emails = [
  {
    subject: "تحديث عاجل لحساب المورد",
    sender: "support@vendor-nupco.com",
    content: `
      <p>المورد العزيز،</p>
      <p>تم تعليق حسابك على بوابة الموردين. لتجنّب إيقاف التعامل نرجو تحديث البيانات البنكية عبر الرابط:</p>
      <a href="http://nupco-vendors-verify.com/login">تحديث الحساب الآن</a>
      <p>سيتم إيقاف جميع الأوامر خلال 24 ساعة.</p>
    `,
    tags: ["بوابة الموردين", "بيانات بنكية", "رابط خارجي"],
    badge: "رسالة",
    isPhishing: true,
    explanation:
      "النطاق غير رسمي ويطلب تحديث بيانات حساسة بشكل عاجل — مؤشر تصيّد.",
  },
  {
    subject: "تأكيد أمر شراء (PO) – أدوية حرجة",
    sender: "procurement@nupco.com",
    content: `
      <p>الزملاء الكرام،</p>
      <p>تم إصدار أمر شراء للأدوية الحرجة. التفاصيل عبر البوابة الداخلية.</p>
      <p><a href="https://portal.nupco.com/">https://portal.nupco.com/</a></p>
    `,
    tags: ["أمر شراء", "بوابة داخلية"],
    badge: "رسالة",
    isPhishing: false,
    explanation: "مرسلة من نطاق رسمي وبرابط داخلي دون طلب معلومات حساسة.",
  },
  {
    subject: "فواتير متأخرة – ضرورة التسديد فورًا",
    sender: "billing@nupco-payments.com",
    content: `
      <p>عميلنا العزيز،</p>
      <p>لديك 3 فواتير مستحقة. يرجى السداد عبر الرابط:</p>
      <a href="http://nupco-payments.com/quickpay">سداد فوري</a>
      <p>سيتم إيقاف الخدمة خلال 12 ساعة.</p>
    `,
    tags: ["فواتير", "رابط دفع", "استعجال"],
    badge: "رسالة",
    isPhishing: true,
    explanation: "رابط دفع على نطاق غير رسمي ولهجة استعجال — تصيّد.",
  },
  {
    subject: "دعوة منافسة: توريد مستلزمات مختبرية",
    sender: "tenders@nupco.com",
    content: `
      <p>السادة الموردون،</p>
      <p>التقديم عبر بوابة المناقصات:</p>
      <p><a href="https://tenders.nupco.com/">https://tenders.nupco.com/</a></p>
      <p>آخر موعد للتقديم: الأحد القادم.</p>
    `,
    tags: ["منافسة", "مناقصات"],
    badge: "رسالة",
    isPhishing: false,
    explanation: "نطاق ورسالة رسميان، وروابط صحيحة.",
  },
  {
    subject: "مرفق: كشف رواتب شهرية",
    sender: "hr@nupco-hr.com",
    content: `
      <p>الموظف العزيز،</p>
      <p>افتح الملف المرفق (Password: Nupc0!). في حال تعذر الفتح ثبّت الإضافة:</p>
      <a href="http://update-plugin-salary.com/addon.exe">تنزيل الإضافة</a>
    `,
    tags: ["مرفق محمي", "تنزيل برنامج"],
    badge: "رسالة",
    isPhishing: true,
    explanation:
      "تنزيل برنامج من موقع مجهول + مرفق محمي بكلمة مرور — تصيّد/برمجيات خبيثة.",
  },
  {
    subject: "استبيان داخلي: تحسين تجربة المورد",
    sender: "supplier.experience@nupco.com",
    content: `
      <p>الزملاء الكرام،</p>
      <p>نأمل تعبئة الاستبيان عبر Microsoft Forms:</p>
      <p><a href="https://forms.office.com/">https://forms.office.com/</a></p>
      <p>مع الشكر، إدارة التميز</p>
    `,
    tags: ["استبيان", "Microsoft Forms"],
    badge: "رسالة",
    isPhishing: false,
    explanation: "رابط موثوق والمرسل داخلي.",
  },
  {
    subject: "رسوم هيئة الغذاء والدواء على الشحنات",
    sender: "sfda-clear@nupco-clearance.com",
    content: `
      <p>لتحرير الشحنة، نرجو السداد عبر الرابط:</p>
      <a href="http://sfda-fastpay.net/">دفع الرسوم</a>
      <p>سيتم إتلاف الشحنة خلال ساعتين.</p>
    `,
    tags: ["جمارك/فسح", "رابط دفع خارجي", "استعجال شديد"],
    badge: "رسالة",
    isPhishing: true,
    explanation: "نطاق غير رسمي وتهديد زمني — تصيّد.",
  },
  {
    subject: "تنبيه أمني: إعادة تعيين كلمة المرور",
    sender: "it.security@nupco.com",
    content: `
      <p>رُصدت محاولة تسجيل دخول من جهاز غير معروف. يمكنك تغيير كلمة المرور عبر:</p>
      <p><a href="https://password.nupco.com/">https://password.nupco.com/</a></p>
    `,
    tags: ["تنبيه أمني", "بوابة داخلية"],
    badge: "رسالة",
    isPhishing: false,
    explanation: "تنبيه مشروع مع رابط داخلي لإدارة كلمة المرور.",
  },
];

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

startBtn.addEventListener("click", () => {
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
