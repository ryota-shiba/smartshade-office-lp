const header = document.querySelector("[data-header]");
const mobileCta = document.querySelector("[data-mobile-cta]");
const reserveSection = document.querySelector("[data-reserve]");
const revealItems = document.querySelectorAll(".reveal");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.25 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const switchVisual = document.querySelector("[data-smart-switch]");
const switchButton = document.querySelector("[data-toggle]");
const stateText = document.querySelector("[data-state-text]");

const setSwitchState = (isOn) => {
  switchVisual.classList.toggle("is-off", !isOn);
  switchButton.setAttribute("aria-pressed", String(isOn));
  stateText.style.opacity = "0";
  window.setTimeout(() => {
    stateText.textContent = isOn
      ? "透明 — 圧迫感なく、空間を広く"
      : "不透明 — 視線を、完全にカット";
    stateText.style.opacity = "1";
  }, prefersReducedMotion ? 0 : 150);
};

switchButton?.addEventListener("click", () => {
  const next = switchButton.getAttribute("aria-pressed") !== "true";
  setSwitchState(next);
});

if (switchButton) {
  new IntersectionObserver(
    ([entry], observer) => {
      if (!entry.isIntersecting) return;
      switchButton.classList.add("pulse");
      observer.disconnect();
    },
    { threshold: 0.45 }
  ).observe(switchButton);
}

const countSection = document.querySelector("[data-count-section]");
const counters = document.querySelectorAll("[data-count]");
let counted = false;

const animateCounters = () => {
  if (counted || prefersReducedMotion) return;
  counted = true;
  counters.forEach((counter) => {
    const target = Number(counter.dataset.count);
    const isDecimal = target < 1;
    const start = performance.now();
    const duration = 1200;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      counter.textContent = isDecimal ? value.toFixed(1) : String(Math.round(value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
};

if (countSection) {
  new IntersectionObserver(
    ([entry], observer) => {
      if (!entry.isIntersecting) return;
      animateCounters();
      observer.disconnect();
    },
    { threshold: 0.35 }
  ).observe(countSection);
}

const momentSteps = document.querySelectorAll(".moment-step");
momentSteps.forEach((step) => {
  new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      momentSteps.forEach((item) => item.classList.remove("is-active"));
      step.classList.add("is-active");
    },
    { rootMargin: "-35% 0px -35% 0px", threshold: 0.1 }
  ).observe(step);
});

const simulator = document.querySelector("[data-simulator]");
const result = document.querySelector("[data-result]");
const unitPrice = 107100;
const height = 2.5;

const updateEstimate = () => {
  const placeButtons = [...document.querySelectorAll("[data-place].is-selected")];
  const width = Number(document.querySelector("[data-width].is-selected")?.dataset.width || 1.6);
  const multiplier = placeButtons.reduce((sum, button) => sum + Number(button.dataset.place), 0);
  const price = unitPrice * height * width * Math.max(multiplier, 1);
  const band = Math.floor(price / 100000) * 10;
  result.style.opacity = "0";
  window.setTimeout(() => {
    result.textContent = `${band}万円台〜`;
    result.style.opacity = "1";
  }, prefersReducedMotion ? 0 : 150);
};

simulator?.addEventListener("click", (event) => {
  const place = event.target.closest("[data-place]");
  const widthButton = event.target.closest("[data-width]");
  if (place) {
    place.classList.toggle("is-selected");
    const selectedPlaces = document.querySelectorAll("[data-place].is-selected");
    if (!selectedPlaces.length) place.classList.add("is-selected");
    updateEstimate();
  }
  if (widthButton) {
    document.querySelectorAll("[data-width]").forEach((button) => button.classList.remove("is-selected"));
    widthButton.classList.add("is-selected");
    updateEstimate();
  }
});

const form = document.querySelector("[data-form]");
const thanks = document.querySelector("[data-thanks]");
form?.addEventListener("submit", (event) => {
  event.preventDefault();
  form.hidden = true;
  thanks.hidden = false;
});

const handleScroll = () => {
  const scrolled = window.scrollY > 40;
  header?.classList.toggle("is-scrolled", scrolled);

  if (!mobileCta || !reserveSection) return;
  const heroPassed = window.scrollY > window.innerHeight * 0.7;
  const reserveTop = reserveSection.getBoundingClientRect().top;
  const beforeReserve = reserveTop > window.innerHeight * 0.7;
  mobileCta.classList.toggle("is-visible", heroPassed && beforeReserve);
};

window.addEventListener("scroll", handleScroll, { passive: true });
handleScroll();
updateEstimate();
