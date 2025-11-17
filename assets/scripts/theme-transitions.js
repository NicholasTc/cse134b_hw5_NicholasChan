const root = document.documentElement;
const prefersReducedMotion = window.matchMedia
  ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
  : false;

const storageKeys = {
  theme: "ntc-theme",
  custom: "ntc-theme-custom",
};

const presetThemes = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
  { id: "midnight", label: "Midnight" },
  { id: "sand", label: "Sand" },
];

const fontStacks = {
  inter: {
    body: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    display:
      '"Space Grotesk", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  },
  serif: {
    body: '"Georgia", "Times New Roman", serif',
    display: '"Playfair Display", "Georgia", serif',
  },
  mono: {
    body: '"SFMono-Regular", ui-monospace, "JetBrains Mono", Menlo, Monaco, Consolas, "Liberation Mono", monospace',
    display:
      '"SFMono-Regular", ui-monospace, "JetBrains Mono", Menlo, Monaco, Consolas, monospace',
  },
};

const defaultCustomTheme = {
  bg: "#0b0f17",
  text: "#e5e7eb",
  accent: "#60a5fa",
  font: "inter",
};

const readStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn("Storage read failed", error);
    return null;
  }
};

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn("Storage write failed", error);
  }
};

const removeStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
};

const getStoredTheme = () => readStorage(storageKeys.theme);
const setStoredTheme = (value) => writeStorage(storageKeys.theme, value);

const getStoredCustomTheme = () => {
  const raw = readStorage(storageKeys.custom);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Unable to parse custom theme", error);
    return null;
  }
};

const setStoredCustomTheme = (value) =>
  writeStorage(storageKeys.custom, JSON.stringify(value));
const clearStoredCustomTheme = () => removeStorage(storageKeys.custom);

const ensureCustomStyleElement = () => {
  let style = document.getElementById("custom-theme-vars");
  if (!style) {
    style = document.createElement("style");
    style.id = "custom-theme-vars";
    document.head.appendChild(style);
  }
  return style;
};

const applyCustomStyles = (values) => {
  const style = ensureCustomStyleElement();
  const fontSet = fontStacks[values.font] || fontStacks.inter;
  style.textContent = `
:root[data-theme="custom"]{
  --bg:${values.bg};
  --surface:color-mix(in oklab, ${values.bg} 88%, ${values.text});
  --text:${values.text};
  --muted:color-mix(in oklab, ${values.text} 60%, ${values.bg});
  --line:color-mix(in oklab, ${values.bg} 70%, ${values.text});
  --accent:${values.accent};
  --btn-primary:${values.accent};
  --btn-primary-ink:${values.text};
  --btn-dark:${values.bg};
  --btn-dark-border:color-mix(in oklab, ${values.bg} 80%, ${values.text});
  --font-body:${fontSet.body};
  --font-display:${fontSet.display};
}
`;
};

const clearCustomStyles = () => {
  const style = document.getElementById("custom-theme-vars");
  if (style) {
    style.textContent = "";
  }
};

const setThemeLabel = (themeId) => {
  const label = document.querySelector("[data-theme-label]");
  if (!label) return;
  if (themeId === "custom") {
    label.textContent = "Custom";
    return;
  }
  const theme = presetThemes.find((entry) => entry.id === themeId);
  label.textContent = theme ? theme.label : "Dark";
};

const highlightActiveTheme = (activeTheme) => {
  const optionButtons = document.querySelectorAll("[data-theme-option]");
  optionButtons.forEach((button) => {
    const selected =
      button.dataset.themeOption === activeTheme ? "true" : "false";
    button.dataset.selected = selected;
  });
  const customButton = document.querySelector("[data-theme-custom-open]");
  if (customButton) {
    if (activeTheme === "custom") {
      customButton.dataset.selected = "true";
    } else {
      customButton.removeAttribute("data-selected");
    }
  }
};

const applyTheme = (themeId, options = {}) => {
  let nextTheme = themeId;
  const isPreset = presetThemes.some((entry) => entry.id === themeId);
  if (!isPreset && themeId !== "custom") {
    nextTheme = "dark";
  }

  if (nextTheme === "custom") {
    const customValues =
      options.customValues || getStoredCustomTheme() || defaultCustomTheme;
    applyCustomStyles(customValues);
  } else {
    clearCustomStyles();
  }

  root.dataset.theme = nextTheme === "custom" ? "custom" : nextTheme;
  setThemeLabel(nextTheme);
  highlightActiveTheme(nextTheme);
};

const populateCustomForm = (form, values) => {
  if (!form) return;
  const themeValues = { ...defaultCustomTheme, ...values };
  const bgInput = form.querySelector('input[name="bg"]');
  const textInput = form.querySelector('input[name="text"]');
  const accentInput = form.querySelector('input[name="accent"]');
  const fontSelect = form.querySelector('select[name="font"]');
  if (bgInput) bgInput.value = themeValues.bg;
  if (textInput) textInput.value = themeValues.text;
  if (accentInput) accentInput.value = themeValues.accent;
  if (fontSelect) fontSelect.value = themeValues.font;
};

const initThemePicker = () => {
  const picker = document.querySelector("[data-theme-picker]");
  if (!picker) return;

  const trigger = picker.querySelector("[data-theme-trigger]");
  const panel = picker.querySelector("[data-theme-panel]");
  const closeButton = picker.querySelector("[data-theme-close]");
  const optionButtons = picker.querySelectorAll("[data-theme-option]");
  const customOpen = picker.querySelector("[data-theme-custom-open]");
  const customForm = picker.querySelector("[data-theme-custom-form]");
  const saveCustomButton = picker.querySelector("[data-theme-custom-save]");
  const cancelCustomButton = picker.querySelector("[data-theme-custom-cancel]");
  const resetButton = picker.querySelector("[data-theme-reset]");

  root.classList.add("js-ready");

  const savedTheme = getStoredTheme();
  const savedCustom = getStoredCustomTheme();
  const initialTheme =
    savedTheme === "custom" && savedCustom
      ? "custom"
      : savedTheme || root.dataset.theme || "dark";
  applyTheme(initialTheme, { customValues: savedCustom || undefined });

  if (customForm && savedCustom) {
    populateCustomForm(customForm, savedCustom);
  }

  const togglePanel = (open) => {
    const shouldOpen =
      typeof open === "boolean" ? open : panel?.hidden === true;
    if (!panel || !trigger) return;
    panel.hidden = !shouldOpen;
    trigger.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    if (!shouldOpen && customForm) {
      customForm.hidden = true;
      customOpen?.removeAttribute("data-selected");
    }
    if (shouldOpen) {
      panel.focus?.();
    }
  };

  trigger?.addEventListener("click", () => togglePanel(true));
  closeButton?.addEventListener("click", () => togglePanel(false));

  document.addEventListener("click", (event) => {
    if (!panel || panel.hidden) return;
    if (!picker.contains(event.target)) {
      togglePanel(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel && !panel.hidden) {
      togglePanel(false);
    }
  });

  optionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const themeId = button.dataset.themeOption;
      if (!themeId) return;
      setStoredTheme(themeId);
      if (themeId === "custom") {
        const stored = getStoredCustomTheme() || defaultCustomTheme;
        applyTheme("custom", { customValues: stored });
      } else {
        applyTheme(themeId);
      }
      togglePanel(false);
    });
  });

  customOpen?.addEventListener("click", () => {
    if (!customForm) return;
    const nextHidden = !customForm.hidden;
    customForm.hidden = nextHidden;
    if (!nextHidden) {
      const stored = getStoredCustomTheme() || defaultCustomTheme;
      populateCustomForm(customForm, stored);
      customForm.querySelector("input[name='bg']")?.focus();
      customOpen.dataset.selected = "true";
    } else {
      customOpen.removeAttribute("data-selected");
    }
  });

  cancelCustomButton?.addEventListener("click", () => {
    if (!customForm) return;
    customForm.hidden = true;
    customOpen?.removeAttribute("data-selected");
  });

  saveCustomButton?.addEventListener("click", () => {
    if (!customForm) return;
    const formData = new FormData(customForm);
    const customValues = {
      bg: formData.get("bg") || defaultCustomTheme.bg,
      text: formData.get("text") || defaultCustomTheme.text,
      accent: formData.get("accent") || defaultCustomTheme.accent,
      font: formData.get("font") || defaultCustomTheme.font,
    };
    setStoredCustomTheme(customValues);
    setStoredTheme("custom");
    applyTheme("custom", { customValues });
    customForm.hidden = true;
    customOpen?.setAttribute("data-selected", "true");
    togglePanel(false);
  });

  resetButton?.addEventListener("click", () => {
    clearStoredCustomTheme();
    setStoredTheme("dark");
    applyTheme("dark");
    if (customForm) {
      customForm.hidden = true;
    }
    customOpen?.removeAttribute("data-selected");
    togglePanel(false);
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
  initThemePicker();
  initViewTransitions();
};

document.addEventListener("DOMContentLoaded", init);
