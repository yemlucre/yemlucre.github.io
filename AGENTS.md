# Tea Project Agent Guide

## Project shape

- This is a dependency-free, static HTML/CSS/JavaScript site. The entry point is [index.html](index.html).
- Keep the existing boundaries: [css/style.css](css/style.css) owns presentation, [js/teas-data.js](js/teas-data.js) owns `BREW`, `IMGS`, and `TEAS`, and [js/app.js](js/app.js) owns rendering and interaction.
- Preserve classic script loading and the order in `index.html`: `teas-data.js` must load before `app.js`.
- Use paths relative to `index.html`; local images belong under `Picture/`.

## Development workflow

- Preview by opening `index.html` directly in a browser; a static server such as VS Code Live Server is optional.
- There is no package manifest, build step, test runner, or automated test suite. After UI or behavior changes, manually check search, type filters, card details/modal behavior, keyboard close behavior, responsive layout, and image loading.
- Read [README.md](README.md) for the tea data schema and GitHub Pages deployment details rather than duplicating that documentation here.

## Change conventions

- Keep the project vanilla and dependency-free unless the task explicitly requires a dependency or build system.
- Preserve global names and public data shape (`TEAS`, `BREW`, `IMGS`); tea IDs must be unique.
- Follow the existing CSS variables, class names, and responsive breakpoints before introducing new patterns.
- Treat values rendered by `app.js` as trusted static data. If user-controlled data is introduced, escape it before inserting HTML.
- Keep local asset filename casing exact for deployment hosts with case-sensitive filesystems.
- Prefer small, focused edits and avoid unrelated formatting or content changes.
