const body = document.body;
const header = document.querySelector("#site-header");
const progress = document.querySelector(".scroll-progress span");
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector("#site-nav");
const splashCount = document.querySelector(".splash-count");
const splashProgress = document.querySelector(".splash-load-line span");
const splash = document.querySelector(".splash");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Opening sequence. Keep one consistent timeline so the mark never flashes or
// exits before its wordmark and tagline have finished resolving.
const splashDuration = reduceMotion ? 0 : 2200;
const splashStart = performance.now();

function animateCount(now) {
  const elapsed = now - splashStart;
  const value = Math.min(100, Math.round((elapsed / splashDuration) * 100));
  if (splashCount) splashCount.textContent = String(value).padStart(2, "0");
  if (splashProgress) splashProgress.style.transform = `scaleX(${value / 100})`;
  if (elapsed < splashDuration) requestAnimationFrame(animateCount);
}

if (!reduceMotion) requestAnimationFrame(animateCount);

function finishSplash() {
  body.classList.remove("is-loading");
  body.classList.add("loaded");
  window.setTimeout(() => splash?.remove(), 900);
}

// Never make the opening dependent on external font or image loading.
window.setTimeout(finishSplash, splashDuration);

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
let previousScroll = 0;
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

  if (y > previousScroll && y > 260 && !nav.classList.contains("open")) {
    header.style.transform = "translateY(-100%)";
  } else {
    header.style.transform = "";
  }

  previousScroll = Math.max(y, 0);
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
