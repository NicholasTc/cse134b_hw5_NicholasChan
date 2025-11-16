const storageKey = "ntc-theme";
const root = document.documentElement;
const prefersReducedMotion = window.matchMedia
  ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
  : false;

const getStoredTheme = () => {
  try {
    return localStorage.getItem(storageKey);
  } catch (error) {
    console.warn("Theme preference unavailable", error);
    return null;
  }
};

const setStoredTheme = (value) => {
  try {
    localStorage.setItem(storageKey, value);
  } catch (error) {
    console.warn("Unable to persist theme preference", error);
  }
};

const applyTheme = (theme) => {
  const toggle = document.querySelector("[data-theme-toggle]");
  const label = document.querySelector("[data-theme-label]");
  const nextTheme = theme === "light" ? "light" : "dark";
  root.dataset.theme = nextTheme;
  if (toggle) {
    toggle.setAttribute("aria-pressed", nextTheme === "light" ? "true" : "false");
  }
  if (label) {
    label.textContent = nextTheme === "light" ? "Light" : "Dark";
  }
};

const initThemeToggle = () => {
  root.classList.add("js-ready");
  const saved = getStoredTheme();
  const initial = saved || root.dataset.theme || "dark";
  applyTheme(initial);
  const toggle = document.querySelector("[data-theme-toggle]");
  toggle?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
    applyTheme(nextTheme);
    setStoredTheme(nextTheme);
  });
};

const shouldHandleNavigation = () =>
  "startViewTransition" in document && !prefersReducedMotion;

const initViewTransitions = () => {
  if (!shouldHandleNavigation()) return;
  const links = document.querySelectorAll("a[data-nav-transition]");
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      if (link.target && link.target !== "_self") return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.href === window.location.href) return;
      event.preventDefault();
      document.startViewTransition(() => {
        window.location.href = url.href;
      });
    });
  });
};

const init = () => {
  initThemeToggle();
  initViewTransitions();
};

document.addEventListener("DOMContentLoaded", init);
