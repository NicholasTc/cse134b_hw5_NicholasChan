CSS Nesting and @scope (Baseline 2024/2025): I used native CSS Nesting (e.g., .links { & a { … } }) to co-locate related rules without a preprocessor, reducing selector repetition and improving readability. I also used the @scope (.about) { … } at-rule so styles only apply within the About section, which prevents accidental bleed and makes components more modular. Both features are part of the modern CSS Baseline and help me write cleaner, safer, and more maintainable styles.

Note: for all of the content and placeholder, it does not accurately reflect my resume values and skills, as I typed them just on top of my head, will revise this in the future upon further stages in the project.

## Part 4 Notes

### Theme Toggle (4.1)

- The toggle button lives in the main navigation on every page (top-right beside the links). It is hidden when JavaScript is unavailable; a `<noscript>` note appears instead.
- Clicking the toggle switches between the default dark palette and the light palette by updating CSS custom properties. The current choice is saved in `localStorage` under the key `ntc-theme`, so refreshing or opening another page retains the same theme.
- To demonstrate for the grader: open any page (e.g., `index.html`), click the toggle, refresh, and confirm the theme persists.

### View Transition API (4.2)

- Approach: **MPA** (multi-page). Navigations between primary pages opt into `document.startViewTransition`, so the entire page fades between states when supported.
- Trigger instructions: use the header navigation links (Home ⇄ Projects ⇄ About ⇄ Contact, as well as both form pages) to see the transition. The repo link is excluded because it leaves the origin.
- Fallbacks: browsers without View Transition support (or users with `prefers-reduced-motion: reduce`) simply navigate normally—no special steps required.
