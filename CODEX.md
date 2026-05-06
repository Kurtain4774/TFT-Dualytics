# Codex Instructions

## Project overview
This is a full-stack React application.

## Rules
- Do not change app behavior unless explicitly asked.
- Keep diffs small and reviewable.
- Prefer existing patterns over adding new libraries.
- Do not rename API routes, database fields, env vars, or public functions without asking.
- Do not modify generated files, build output, or lockfiles unless necessary.
- After code changes, run lint/build/test commands when available.

## Frontend
- React app.
- Preserve existing CSS module class names unless refactoring a specific component.
- Keep visual layout unchanged during non-UI refactors.

## Backend
- Preserve API response shapes.
- Preserve MongoDB collection/document structure unless explicitly asked.
- Keep route handlers thin when possible.

## Validation
Use these commands when relevant:
```bash
npm run lint
npm run build
npm test