/**
 * لوحة التحكم الرئيسية - NUPCO
 * نظام مركزي لإطلاق جميع الأنشطة
 */

// إدارة الحالة
let currentActivity = null;
let selectedActivityUrl = null;
let activityWindows = new Map();

// عناصر الصفحة
const activityCards = document.querySelectorAll(".activity-card");
const modal = document.getElementById("launch-modal");
const closeModalBtn = document.getElementById("close-modal");
const launchFullscreenBtn = document.getElementById("launch-fullscreen");
const launchWindowBtn = document.getElementById("launch-window");
const launchTabBtn = document.getElementById("launch-tab");
const statusIndicator = document.getElementById("status-indicator");
const currentActivityDisplay = document.getElementById("current-activity");

// تهيئة اللوحة
function init() {
  setupEventListeners();
  updateStatus("جاهز", false);
  console.log("✅ تم تهيئة لوحة التحكم");
}

// إعداد مستمعات الأحداث
function setupEventListeners() {
  // نقرات بطاقات الأنشطة
  activityCards.forEach((card) => {
    card.addEventListener("click", () => {
      const activityName = card.dataset.activity;
      const activityUrl = card.dataset.url;
      const activityTitle = card.querySelector(".activity-title").textContent;

      handleActivitySelect(activityName, activityUrl, activityTitle);
    });

    // دعم لوحة المفاتيح
    card.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });

  // عناصر التحكم في النافذة المنبثقة
  closeModalBtn.addEventListener("click", closeModal);
  launchFullscreenBtn.addEventListener("click", () =>
    launchActivity("fullscreen")
  );
  launchWindowBtn.addEventListener("click", () => launchActivity("window"));
  launchTabBtn.addEventListener("click", () => launchActivity("tab"));

  // إغلاق النافذة عند النقر على الخلفية
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // مفتاح ESC لإغلاق النافذة
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });

  // تحذير قبل الإغلاق إذا كانت هناك أنشطة قيد التشغيل
  window.addEventListener("beforeunload", (e) => {
    if (activityWindows.size > 0) {
      e.preventDefault();
      e.returnValue = "هناك أنشطة قيد التشغيل. هل تريد حقاً الإغلاق؟";
      return e.returnValue;
    }
  });
}

// التعامل مع اختيار النشاط
function handleActivitySelect(activityName, activityUrl, activityTitle) {
  console.log(`🎯 تم اختيار النشاط: ${activityName}`);

  selectedActivityUrl = activityUrl;
  currentActivity = activityTitle;

  // فتح مباشرة في تبويب جديد بدون عرض النافذة المنبثقة
  const fullUrl = window.location.origin + activityUrl;
  window.open(fullUrl, "_blank");

  updateStatus("نشط", true);
  currentActivityDisplay.textContent = currentActivity;
}

// عرض النافذة المنبثقة
function showModal() {
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

// إغلاق النافذة المنبثقة
function closeModal() {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "auto";
}

// إطلاق النشاط بالطريقة المحددة
function launchActivity(method) {
  if (!selectedActivityUrl) {
    console.error("❌ لم يتم تحديد رابط النشاط");
    return;
  }

  const fullUrl = window.location.origin + selectedActivityUrl;
  console.log(`🚀 إطلاق ${currentActivity} في وضع ${method}`);

  switch (method) {
    case "fullscreen":
      launchFullscreen(fullUrl);
      break;
    case "window":
      launchWindow(fullUrl);
      break;
    case "tab":
      launchTab(fullUrl);
      break;
  }

  updateStatus("نشط", true);
  currentActivityDisplay.textContent = currentActivity;
  closeModal();
}

// إطلاق في وضع ملء الشاشة
function launchFullscreen(url) {
  const width = window.screen.width;
  const height = window.screen.height;

  const windowFeatures = `width=${width},height=${height},left=0,top=0,fullscreen=yes,menubar=no,toolbar=no,location=no,status=no`;

  const activityWindow = window.open(url, "_blank", windowFeatures);

  if (activityWindow) {
    activityWindows.set(currentActivity, activityWindow);

    // محاولة الدخول إلى وضع ملء الشاشة
    setTimeout(() => {
      try {
        if (activityWindow.document.documentElement.requestFullscreen) {
          activityWindow.document.documentElement
            .requestFullscreen()
            .then(() => {
              console.log("✅ تم تفعيل وضع ملء الشاشة");
            })
            .catch((err) => {
              console.log(
                "ℹ️ وضع ملء الشاشة غير متاح، استخدام النافذة المكبرة"
              );
            });
        }
      } catch (err) {
        console.log("ℹ️ وضع ملء الشاشة غير متاح");
      }
    }, 1000);

    monitorWindow(activityWindow, currentActivity);
  } else {
    alert("⚠️ تم منع فتح النافذة. يرجى السماح بالنوافذ المنبثقة لهذا الموقع.");
  }
}

// إطلاق في نافذة جديدة
function launchWindow(url) {
  const width = Math.min(1920, window.screen.width * 0.9);
  const height = Math.min(1080, window.screen.height * 0.9);
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;

  const windowFeatures = `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=yes,location=yes,status=yes,resizable=yes,scrollbars=yes`;

  const activityWindow = window.open(url, "_blank", windowFeatures);

  if (activityWindow) {
    activityWindows.set(currentActivity, activityWindow);
    activityWindow.focus();
    monitorWindow(activityWindow, currentActivity);
  } else {
    alert("⚠️ تم منع فتح النافذة. يرجى السماح بالنوافذ المنبثقة لهذا الموقع.");
  }
}

// إطلاق في تبويب جديد
function launchTab(url) {
  const activityWindow = window.open(url, "_blank");

  if (activityWindow) {
    activityWindows.set(currentActivity, activityWindow);
    activityWindow.focus();
    monitorWindow(activityWindow, currentActivity);
  } else {
    alert("⚠️ تم منع فتح التبويب. يرجى السماح بالنوافذ المنبثقة لهذا الموقع.");
  }
}

// مراقبة إغلاق النافذة
function monitorWindow(windowRef, activityName) {
  const checkInterval = setInterval(() => {
    if (windowRef.closed) {
      console.log(`🔴 تم إغلاق النشاط: ${activityName}`);
      activityWindows.delete(activityName);
      clearInterval(checkInterval);

      // تحديث الحالة إذا لم تكن هناك أنشطة قيد التشغيل
      if (activityWindows.size === 0) {
        updateStatus("جاهز", false);
        currentActivityDisplay.textContent = "لم يتم تحديد نشاط";
      } else {
        // تحديث لعرض الأنشطة المتبقية
        const remaining = Array.from(activityWindows.keys()).join("، ");
        currentActivityDisplay.textContent = remaining;
      }
    }
  }, 1000);
}

// تحديث عرض الحالة
function updateStatus(text, isActive) {
  statusIndicator.textContent = text;

  if (isActive) {
    statusIndicator.classList.add("active");
  } else {
    statusIndicator.classList.remove("active");
  }
}

// وظيفة الإطلاق السريع
function quickLaunch(activityUrl, activityName) {
  const fullUrl = window.location.origin + activityUrl;
  currentActivity = activityName;
  selectedActivityUrl = activityUrl;

  // فتح مباشرة في تبويب جديد
  window.open(fullUrl, "_blank");
  updateStatus("نشط", true);
  currentActivityDisplay.textContent = activityName;
}

// اختصارات لوحة المفاتيح
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + أرقام للإطلاق السريع
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
    const activities = [
      { key: "1", url: "/wheel", name: "عجلة التوعية" },
      { key: "2", url: "/phishing", name: "صيد التصيد" },
      { key: "3", url: "/fact-or-trick", name: "حقيقة أم خدعة" },
      { key: "4", url: "/first-day", name: "اليوم الأول" },
      { key: "5", url: "/control-room", name: "غرفة التحكم" },
    ];

    const activity = activities.find((a) => a.key === e.key);
    if (activity) {
      e.preventDefault();
      console.log(`⚡ إطلاق سريع: ${activity.name}`);
      quickLaunch(activity.url, activity.name);
    }
  }

  // F1 للمساعدة
  if (e.key === "F1") {
    e.preventDefault();
    showHelp();
  }
});

// عرض المساعدة
function showHelp() {
  alert(`🎮 اختصارات لوحة المفاتيح:

Ctrl+1: عجلة التوعية
Ctrl+2: صيد التصيد
Ctrl+3: حقيقة أم خدعة
Ctrl+4: اليوم الأول
Ctrl+5: غرفة التحكم

F1: عرض المساعدة
ESC: إغلاق النافذة المنبثقة`);
}

// إضافة تأثير بصري للبطاقات
activityCards.forEach((card) => {
  card.addEventListener("mouseenter", () => {
    card.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
  });

  card.addEventListener("mouseleave", () => {
    card.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
  });
});

// دعم التنقل بلوحة المفاتيح
document.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    document.body.classList.add("keyboard-nav");
  }
});

document.addEventListener("mousedown", () => {
  document.body.classList.remove("keyboard-nav");
});

// التهيئة عند جاهزية الصفحة
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// إتاحة الوصول من Console
window.NUPCOLauncher = {
  quickLaunch,
  showHelp,
  activities: activityWindows,
  status: () => ({
    current: currentActivity,
    running: activityWindows.size,
    windows: Array.from(activityWindows.keys()),
  }),
};

console.log(`
╔═══════════════════════════════════════╗
║   لوحة التحكم الرئيسية - NUPCO       ║
║   جاهزة للتشغيل                      ║
╚═══════════════════════════════════════╝

📋 الاختصارات المتاحة:
   Ctrl+1-5: إطلاق سريع للأنشطة
   F1: عرض المساعدة
   
💡 أوامر Console:
   NUPCOLauncher.status()
   NUPCOLauncher.showHelp()
`);
