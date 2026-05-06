# TFT Double Up Stats Site

## Project Overview

This is a web app for **Teamfight Tactics Double Up**.

It aggregates live match data from the Riot API, displays top team comps, provides a drag-and-drop comp builder, and lets users look up match history for one or two summoners.

---

## Codex Workflow

For any task that touches multiple files, changes architecture, or has unclear scope, follow this workflow:

1. **Explore first**
   - Read the relevant files before editing.
   - Understand the current data flow, component structure, and API shape.
   - Do not guess where logic lives.

2. **Plan**
   - Briefly identify which files need to change and why.
   - Call out any assumptions.
   - Keep the plan small and actionable.

3. **Implement**
   - Make the smallest clean change that solves the problem.
   - Keep behavior consistent with the existing project style.
   - Avoid unrelated refactors.

4. **Verify**
   - Run the relevant tests, build, or manual checks.
   - Fix root causes instead of hiding errors.

5. **Commit**
   - Use a clear descriptive commit message.
   - Open a PR with `gh` when appropriate.

Skip the planning step only for very small, obvious fixes such as typos, one-line changes, or simple renames.

---

## Verification Requirements

Always verify work before considering it complete.

### API Routes

- Run the server.
- Hit the endpoint with `curl`, a browser, or a small test script.
- Confirm the response shape matches what the client expects.

### React Components

- Run the frontend.
- Check the visual output in the browser.
- Compare against the design system rules.
- If changing layout, styling, or animation, describe what changed visually.

### Riot API Changes

- Confirm the build passes.
- Make sure `RIOT_API_KEY` is never exposed to client-side code, logs, error payloads, or browser-visible output.

### Comp Aggregation Logic

- Add or update a unit test using a fixture match payload.
- Assert on the final comp shape, not just that the function runs.

### Error Handling

- Never suppress errors just to make a build pass.
- Fix the root cause.
- Preserve useful error messages while avoiding sensitive data leaks.

---

## Code Standards

- Use `async/await`.
- Do not use raw promise chains unless there is a clear reason.
- Handle Riot API `429` responses.
  - Respect the `Retry-After` header.
  - Back off and retry safely.
- Never log or expose `RIOT_API_KEY`.
- Validate summoner name and tag input before calling the Riot API.
- Keep React component files under roughly 200 lines.
  - Extract sub-components early.
- Comment non-obvious Riot API behavior.
  - Example: match ID format differences by region.
- Filter all Data Dragon responses to:

```js
set === CURRENT_SET