# Repository Guidelines

## Project Structure & Module Organization
- `index.html` owns the landing page markup, section anchors, and data attributes consumed by the scripts; keep it the single source for structure and IDs.
- `main.js` should remain a thin ES-module entry that imports `initPageInteractions` from `script.js`; avoid adding business logic so the bootstrap stays predictable.
- `script.js` groups the navigation toggle, smooth scroll, typed headline, and carousel helpers; keep related utilities adjacent and export pure helpers when you add testable logic.
- `styles.css` houses shared tokens under `:root` and reusable patterns like `.card`; update variables before introducing new hard-coded colors or spacing.
- `assets/` stores optimized media (prefer SVG/WebP with kebab-case filenames).

## Build, Test, and Development Commands
- `python3 -m http.server 5173` starts a lightweight static server; refresh the browser after edits to confirm interactions still bind correctly.
- `npx serve@latest .` serves the site with gzip headers for CDN parity; use this path when validating cache or header-sensitive changes.
- No bundler runs—write browser-friendly modules and gate optional dependencies so static hosting keeps working.

## Coding Style & Naming Conventions
- Use two-space indentation in JavaScript and CSS, and favor `const`/`let` alongside arrow functions for new utilities.
- Name functions descriptively (`initTypedHeadline`) and express data attributes in kebab case (`data-carousel-slide`).
- Keep CSS class names semantic or utility-aligned (e.g., `.bg-night`), and lean on existing tokens from `:root` before adding new values.

## Testing Guidelines
- Run manual regression passes in Chromium, Firefox, and Safari, verifying smooth scrolling, mobile navigation, carousel controls, and the typed headline.
- When adding logic, extract pure helpers from `script.js` so they can be unit-tested later; note any gaps or limitations in your PR description.
- Capture reproduction steps for bugs in the issue tracker so future contributors can validate fixes quickly.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat:`, `fix:`, `chore:`) and scope each commit to one concern; reference issue IDs when available.
- PRs should state the purpose, browsers or devices used for verification, and include before/after screenshots for visual changes.
- Request a review before merging and confirm automation (when introduced) passes without warnings.

## Accessibility & Performance Checks
- Preserve keyboard access for interactive elements, maintaining focus outlines and updating `aria-expanded` states accurately.
- Audit color contrast when updating `styles.css` tokens and compress or lazy-load new media to keep first paint fast.
