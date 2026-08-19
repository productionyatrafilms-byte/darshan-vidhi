const btnEn = document.querySelector(".english");
const btnHi = document.querySelector(".hindi");
const btnGu = document.querySelector(".gujrati");
const topicLinks = document.querySelectorAll(".topic");

const DEFAULT_LANG = "English";
const LANG_KEY = "selectedLanguage";
let translations = {};
let isNavigating = false;
let landscapeAlertShown = false;

function checkScreenSize() {
  const isMobile =
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  if (isMobile && window.innerWidth < 768) {
    if (!landscapeAlertShown) {
      landscapeAlertShown = true;
      alert("Please use Landscape!");
    }
  } else {
    landscapeAlertShown = false;
  }
}

window.addEventListener("load", checkScreenSize);
window.addEventListener("resize", checkScreenSize);


// audio files for each language
const audioEn = new Audio("./assets/audio/Eng.mpeg");
const audioHi = new Audio("./assets/audio/Hin.mpeg");
const audioGu = new Audio("./assets/audio/Guj.mpeg");

// stop any currently playing language audio, then play the requested one
function playLanguageAudio(lang) {
  [audioEn, audioHi, audioGu].forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });

  let audioToPlay;
  if (lang === "English") {
    audioToPlay = audioEn;
  } else if (lang === "Hindi") {
    audioToPlay = audioHi;
  } else if (lang === "Gujarati") {
    audioToPlay = audioGu;
  }

  if (audioToPlay) {
    audioToPlay.play().catch((err) => {
      console.error("Error playing language audio:", err);
    });
  }
}

// get saved language from localStorage
function getSavedLanguage() {
  return localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
}

// set active button
function setActiveButton(activeBtn) {
  [btnEn, btnHi, btnGu].forEach((btn) => btn.classList.remove("active"));
  activeBtn.classList.add("active");
}

// apply language
function applyLanguage(lang, save = true) {
  const langData = translations[lang];
  if (!langData) return;

  if (save) {
    localStorage.setItem(LANG_KEY, lang);
  }

  document.documentElement.lang = lang;

  if (lang === "English") {
    document.body.setAttribute("data-lang", "en");
    setActiveButton(btnEn);
  } else if (lang === "Hindi") {
    document.body.setAttribute("data-lang", "hi");
    setActiveButton(btnHi);
  } else if (lang === "Gujarati") {
    document.body.setAttribute("data-lang", "gu");
    setActiveButton(btnGu);
  }

  document.querySelectorAll("[data-lang-key]").forEach((el) => {
    const key = el.getAttribute("data-lang-key");
    if (langData[key] !== undefined) {
      el.innerHTML = String(langData[key]).replace(/\n/g, "<br>");
    }
  });
}

// page fade in
window.addEventListener("DOMContentLoaded", () => {
  fetch("./assets/json/data.json")
    .then((res) => res.json())
    .then((data) => {
      translations = data;

      // Apply saved language immediately — no flash to English
      const savedLang = getSavedLanguage();
      applyLanguage(savedLang, false);

      requestAnimationFrame(() => {
        // Re-apply after first paint to be safe
        applyLanguage(savedLang, false);
        document.body.classList.add("page-loaded");
      });
    })
    .catch((err) => console.error("Error loading translations:", err));
});

// topic click -> fade out -> navigate
topicLinks.forEach((topic) => {
  topic.addEventListener("click", (e) => {
    if (isNavigating) return;
    isNavigating = true;

    e.preventDefault();

    const targetUrl = topic.getAttribute("href");

    topicLinks.forEach((item) => {
      item.style.pointerEvents = "none";
    });

    setTimeout(() => {
      document.body.classList.add("page-fade-out");
    }, 500);

    setTimeout(() => {
      window.location.href = targetUrl;
    }, 1000);
  });
});

// button clicks — save on manual selection + play corresponding audio
btnEn.addEventListener("click", () => {
  applyLanguage("English");
  playLanguageAudio("English");
});

btnHi.addEventListener("click", () => {
  applyLanguage("Hindi");
  playLanguageAudio("Hindi");
});

btnGu.addEventListener("click", () => {
  applyLanguage("Gujarati");
  playLanguageAudio("Gujarati");
});