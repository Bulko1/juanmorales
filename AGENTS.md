# AGENTS.md

## Key facts

- **No build step.** Files are served as-is. Open `index.html` or run `docker compose up` from root.
- **Language:** All UI text and comments are in Spanish (es).
- **Theme system:** Dark/light toggle via `data-theme` attribute on `<html>`, persisted in `localStorage` key `theme`. Default is dark.
- **Docker (`Dockerfile`):** Nginx Alpine image, copies all files to `/usr/share/nginx/html`, exposes port 80.
- **Single `.git/` at root** version-controls the entire project.
- **Estructura completa:** Ver `README.md`.
