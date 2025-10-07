/* =========================
   Data: fields + simple quiz
   ========================= */
const CYBER_FIELDS = [
  { id: "passwords", ar: "كلمات المرور" },
  { id: "phishing", ar: "التصيّد" },
  { id: "mfa", ar: "التحقق الثنائي" },
  { id: "wifi", ar: "شبكات Wi-Fi" },
  { id: "updates", ar: "التحديثات" },
  { id: "privacy", ar: "الخصوصية" },
  { id: "malware", ar: "برمجيات خبيثة" },
  { id: "social", ar: "هندسة اجتماعية" },
];

const QUIZ_BANK = {
  passwords: {
    q: "ما أفضل طريقة لإنشاء كلمة مرور قوية؟",
    options: [
      "أن تكون قصيرة وسهلة",
      "استخدام اسمك وتاريخ ميلادك",
      "مزج أحرف كبيرة وصغيرة وأرقام ورموز",
      "استخدام نفس الكلمة لكل الحسابات",
    ],
    correct: 2,
  },
  phishing: {
    q: "ما علامة شائعة على رسالة تصيّد؟",
    options: [
      "لغة رسمية بلا أخطاء",
      "طلب عاجل مع رابط غريب",
      "مرسل معروف داخل الشركة دائمًا",
      "الرسالة بلا أي روابط",
    ],
    correct: 1,
  },
  mfa: {
    q: "فائدة التحقق الثنائي (MFA) هي…",
    options: [
      "يزيد سرعة الدخول فقط",
      "يمنع كل الهجمات نهائيًا",
      "يضيف طبقة أمان عبر كود/تطبيق",
      "يلغي الحاجة لكلمة المرور",
    ],
    correct: 2,
  },
  wifi: {
    q: "الأكثر أمانًا في شبكة Wi-Fi عامة:",
    options: [
      "الدخول للحسابات البنكية مباشرة",
      "استخدام VPN عند الحاجة",
      "إيقاف التحديثات",
      "مشاركة الشبكة مع الغرباء",
    ],
    correct: 1,
  },
  updates: {
    q: "لماذا نثبت تحديثات النظام/التطبيقات؟",
    options: [
      "لتغيير الشكل فقط",
      "لإصلاح ثغرات وتحسين الأمان",
      "لتقليل مساحة الجهاز",
      "لا داعي للتحديثات",
    ],
    correct: 1,
  },
  privacy: {
    q: "قبل تحميل تطبيق جديد يُفضّل أن…",
    options: [
      "تقبل كل الأذونات فورًا",
      "تراجع التقييمات والصلاحيات",
      "تشارك بياناتك للتجربة",
      "تفعل الموقع دائمًا",
    ],
    correct: 1,
  },
  malware: {
    q: "وصلك مرفق .exe من مرسل مجهول، ماذا تفعل؟",
    options: [
      "تثبته فورًا",
      "ترسله لزميل",
      "تتجاهله وتبلّغ الأمن السيبراني",
      "تنزله ثم تفحصه لاحقًا",
    ],
    correct: 2,
  },
  social: {
    q: "شخص يدّعي من الـ IT يطلب كلمة مرورك بالهاتف:",
    options: [
      "تعطيه الكلمة",
      "ترفض وتبلّغ القسم المختص",
      "تطلب منه إرسالها واتساب",
      "تعطيه جزءًا منها",
    ],
    correct: 1,
  },
};

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
  slices: CYBER_FIELDS,
  spinning: false,
  ANG: (2 * Math.PI) / CYBER_FIELDS.length,
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
  const targetIndex = Math.floor(Math.random() * N);
  const rounds = Math.floor(Math.random() * 3) + 3; // 3..5 turns
  const finalRot =
    rounds * 2 * Math.PI + (N - targetIndex) * WHEEL.ANG - WHEEL.ANG / 2;
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
  quizField.textContent = `المجال: ${field.ar}`;
  quizFeedback.textContent = "";
  quizContinue.classList.add("hidden");
  quizOptions.innerHTML = "";
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
    btn.addEventListener("click", () => handleQuizAnswer(i, bank.correct));
    quizOptions.appendChild(btn);
  });

  quizModal.classList.remove("hidden");
}

function handleQuizAnswer(chosen, correct) {
  if (_answered) return;
  _answered = true;

  const btns = [...quizOptions.querySelectorAll(".option-btn")];
  btns.forEach((b, i) => {
    if (i === correct) b.classList.add("correct");
    if (i === chosen && chosen !== correct) b.classList.add("wrong");
    b.disabled = true;
  });

  if (chosen === correct) {
    quizFeedback.textContent = "إجابة صحيحة! 👏";
  } else {
    quizFeedback.textContent = "إجابة غير صحيحة. جرّب مرة أخرى مع مجال آخر.";
  }
  quizContinue.classList.remove("hidden");
}

/* =========================
   Events
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  fitWheel();
  wheelSpinBtn.addEventListener("click", spinWheel);
  quizContinue.addEventListener("click", () => {
    quizModal.classList.add("hidden");
    // ready to spin again
  });
  quizClose.addEventListener("click", () => {
    quizModal.classList.add("hidden");
  });
});
