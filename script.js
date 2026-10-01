const body = document.body;
const header = document.querySelector("#site-header");
const progress = document.querySelector(".scroll-progress span");
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector("#site-nav");
const splashCount = document.querySelector(".splash-count");
const splashProgress = document.querySelector(".splash-load-line span");
const splash = document.querySelector(".splash");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const skipSplash = sessionStorage.getItem("wm-skip-splash") === "1";
if (skipSplash) {
  sessionStorage.removeItem("wm-skip-splash");
  body.classList.add("returning-home");
  history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  requestAnimationFrame(() => window.scrollTo(0, 0));
  window.addEventListener("load", () => {
    window.scrollTo(0, 0);
    window.setTimeout(() => { history.scrollRestoration = "auto"; }, 500);
  }, { once: true });
}

// Opening sequence. Keep one consistent timeline so the mark never flashes or
// exits before its wordmark and tagline have finished resolving.
const splashDuration = reduceMotion || skipSplash ? 0 : 2200;
const splashStart = performance.now();

function animateCount(now) {
  const elapsed = now - splashStart;
  const value = Math.min(100, Math.round((elapsed / splashDuration) * 100));
  if (splashCount) splashCount.textContent = String(value).padStart(2, "0");
  if (splashProgress) splashProgress.style.transform = `scaleX(${value / 100})`;
  if (elapsed < splashDuration) requestAnimationFrame(animateCount);
}

if (!reduceMotion && !skipSplash) requestAnimationFrame(animateCount);

function finishSplash() {
  body.classList.remove("is-loading");
  body.classList.add("loaded");
  window.setTimeout(() => splash?.remove(), 900);
}

// Never make the opening dependent on external font or image loading.
if (skipSplash) finishSplash();
else window.setTimeout(finishSplash, splashDuration);

// Navigation
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  menuButton.setAttribute("aria-label", open ? "Open menu" : "Close menu");
  nav.classList.toggle("open", !open);
  body.style.overflow = open ? "" : "hidden";
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
    nav.classList.remove("open");
    body.style.overflow = "";
  });
});

// Touch-friendly collection carousel
if (window.Swiper && document.querySelector(".collection-carousel")) {
  new Swiper(".collection-carousel", {
    slidesPerView: 1.08,
    spaceBetween: 12,
    speed: reduceMotion ? 0 : 850,
    grabCursor: true,
    watchOverflow: true,
    resistanceRatio: .7,
    keyboard: {
      enabled: true,
      onlyInViewport: true
    },
    navigation: {
      nextEl: ".collection-next",
      prevEl: ".collection-prev"
    },
    pagination: {
      el: ".collection-pagination",
      clickable: true
    },
    breakpoints: {
      700: {
        slidesPerView: 1.65,
        spaceBetween: 12
      },
      1050: {
        slidesPerView: 3,
        spaceBetween: 12
      }
    }
  });
}

// Playful watch-personality selector
const modeData = {
  quiet: {
    src: "assets/editorial-women.jpeg",
    alt: "Elegant rose-gold watch representing quiet confidence",
    caption: "QUIET CONFIDENCE",
    rotation: "-4deg"
  },
  bold: {
    src: "assets/editorial-men.jpeg",
    alt: "Dark chronograph representing bold presence",
    caption: "BOLD PRESENCE",
    rotation: "4deg"
  },
  natural: {
    src: "assets/editorial-wooden.jpeg",
    alt: "Detailed wooden watch representing natural character",
    caption: "NATURAL CHARACTER",
    rotation: "-2deg"
  }
};

const modeStage = document.querySelector(".mode-stage");
const modeCard = document.querySelector(".mode-card");
const modeImage = modeCard?.querySelector("img");
const modeCaption = document.querySelector(".mode-caption");
const modeOptions = document.querySelectorAll(".mode-option");
let modeTimer;

function activateMode(mode) {
  if (!modeData[mode] || modeStage.dataset.activeMode === mode) return;
  window.clearTimeout(modeTimer);
  modeCard.classList.add("switching");
  modeOptions.forEach((option) => {
    const active = option.dataset.mode === mode;
    option.classList.toggle("active", active);
    option.setAttribute("aria-selected", String(active));
  });

  modeTimer = window.setTimeout(() => {
    const next = modeData[mode];
    modeStage.dataset.activeMode = mode;
    modeImage.src = next.src;
    modeImage.alt = next.alt;
    modeCaption.textContent = next.caption;
    modeCard.style.transform = `rotate(${next.rotation})`;
    modeCard.classList.remove("switching");
  }, reduceMotion ? 0 : 230);
}

modeOptions.forEach((option) => {
  option.addEventListener("click", () => activateMode(option.dataset.mode));
  option.addEventListener("pointerenter", () => activateMode(option.dataset.mode));
});

// Editorial text reveal
document.querySelectorAll(".word-reveal").forEach((heading) => {
  const words = heading.textContent.trim().split(/\s+/);
  heading.innerHTML = words.map((word) => `<span class="word">${word}</span>`).join(" ");
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.13, rootMargin: "0px 0px -6% 0px" });

document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

// Signature timepiece: real local time, active only while the section is seen.
const signatureSection = document.querySelector(".signature-timepiece");
const signatureTicks = document.querySelector(".signature-ticks");
const signatureHourHand = document.querySelector(".signature-hour-hand");
const signatureMinuteHand = document.querySelector(".signature-minute-hand");
const signatureSecondHand = document.querySelector(".signature-second-hand");
const signatureTrail = document.querySelector(".signature-second-trail");
const svgNamespace = "http://www.w3.org/2000/svg";
let signatureFrame;
let signatureClockRunning = false;

if (signatureTicks) {
  for (let minute = 0; minute < 60; minute += 1) {
    const line = document.createElementNS(svgNamespace, "line");
    const major = minute % 5 === 0;
    line.setAttribute("x1", "0");
    line.setAttribute("y1", major ? "-368" : "-374");
    line.setAttribute("x2", "0");
    line.setAttribute("y2", "-386");
    line.setAttribute("transform", `rotate(${minute * 6})`);
    if (major) line.classList.add("major");
    signatureTicks.appendChild(line);
  }
}

if (signatureTrail) {
  const pointOnTrail = (angle) => [
    380 * Math.sin(angle * Math.PI / 180),
    -380 * Math.cos(angle * Math.PI / 180)
  ];

  for (let index = 0; index < 32; index += 1) {
    const start = pointOnTrail(-(index + 1) * 1.6);
    const end = pointOnTrail(-index * 1.6);
    const path = document.createElementNS(svgNamespace, "path");
    path.setAttribute("d", `M${start[0]} ${start[1]}A380 380 0 0 1 ${end[0]} ${end[1]}`);
    path.style.opacity = String(.55 * (1 - index / 32));
    signatureTrail.appendChild(path);
  }
}

function updateSignatureClock() {
  const now = new Date();
  const milliseconds = now.getMilliseconds();
  const seconds = now.getSeconds() + milliseconds / 1000;
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;
  const secondAngle = seconds * 6;

  signatureHourHand?.setAttribute("transform", `rotate(${hours * 30})`);
  signatureMinuteHand?.setAttribute("transform", `rotate(${minutes * 6})`);
  signatureSecondHand?.setAttribute("transform", `rotate(${secondAngle})`);

  if (signatureClockRunning && !reduceMotion) signatureFrame = requestAnimationFrame(updateSignatureClock);
}

if (signatureSection) {
  const signatureObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      signatureSection.classList.add("is-visible");
      if (!signatureClockRunning) {
        signatureClockRunning = true;
        updateSignatureClock();
      }
    } else {
      signatureClockRunning = false;
      cancelAnimationFrame(signatureFrame);
    }
  }, { threshold: .3 });

  signatureObserver.observe(signatureSection);
  if (reduceMotion) updateSignatureClock();
}

const manifesto = document.querySelector(".manifesto");
const kineticWords = [...document.querySelectorAll(".word-reveal .word")];

function updateKineticWords() {
  if (!manifesto || !kineticWords.length || reduceMotion) return;

  const rect = manifesto.getBoundingClientRect();
  const travel = Math.max(manifesto.offsetHeight - window.innerHeight, 1);
  const sectionProgress = Math.min(1, Math.max(0, -rect.top / travel));
  const wavePosition = sectionProgress * (kineticWords.length + 2) - 1;

  kineticWords.forEach((word, index) => {
    const distance = Math.abs(index - wavePosition);
    const focus = Math.max(0, 1 - distance);
    const passed = index < wavePosition;
    const opacity = passed ? 0.56 + focus * 0.44 : 0.18 + focus * 0.82;
    const lift = 12 - focus * 24;
    const scale = 0.96 + focus * 0.1;

    word.style.setProperty("--word-opacity", opacity.toFixed(3));
    word.style.setProperty("--word-y", `${lift.toFixed(1)}px`);
    word.style.setProperty("--word-scale", scale.toFixed(3));
    word.style.setProperty("--word-spacing", `${(focus * 0.025).toFixed(3)}em`);
    word.style.fontWeight = String(Math.round(400 + focus * 200));
  });
}

// Scroll-linked details
let ticking = false;
const heroMedia = document.querySelector("[data-parallax]");

function updateScrollDetails() {
  const y = window.scrollY;
  const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = pageHeight > 0 ? y / pageHeight : 0;

  progress.style.transform = `scaleX(${ratio})`;
  header.classList.toggle("scrolled", y > 36);

  if (heroMedia && !reduceMotion && y < window.innerHeight * 1.2) {
    heroMedia.style.transform = `translate3d(0, ${y * 0.16}px, 0)`;
  }

  updateKineticWords();

  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(updateScrollDetails);
    ticking = true;
  }
}, { passive: true });

updateScrollDetails();
document.querySelector("#year").textContent = new Date().getFullYear();
