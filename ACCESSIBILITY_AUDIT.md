# Accessibility Audit - WCAG 2.2 AA

Phase 1 audit only. No production code changes were made.

Audit date: May 6, 2026  
Scope reviewed: React app shell, navigation, footer, landing/search, comps, stats, builder, leaderboard, match history, bookmarks/settings modals, hover cards/tooltips, legal pages, global styles, and ESLint setup.

Note: the worktree already had changes in `client/src/pages/AboutPage.jsx`, `client/src/pages/AboutPage.module.css`, and `archive/` before this audit. The current `AboutPage` returns `null`, so findings describe the code as it exists now.

## Phase 2-3 Update

Implementation date: May 6, 2026

### Fixed In Phases 2-3

- Added `eslint-plugin-jsx-a11y` to the client ESLint flat config and installed it as a dev dependency.
- Added `npm run lint:a11y` in `client/package.json`.
- Documented the accessibility lint command in `client/README.md`.
- Removed nested/duplicate routed `<main>` landmarks by keeping the app shell as the single main landmark and changing page-level wrappers to non-landmark containers.
- Converted expandable comp rows and match cards from mouse-only clickable containers to native buttons with `aria-expanded`.
- Converted leaderboard sorting from clickable `<th>` cells to buttons inside scoped sortable headers with `aria-sort`.
- Converted leaderboard row navigation from clickable `<tr>` rows to real player links.
- Added accessible names to region and Riot ID search controls.
- Connected search validation errors to their inputs with `aria-invalid`, `aria-describedby`, and `role="alert"`.
- Added `role="status"`/`role="alert"` to several loading, syncing, placeholder, and API error states.
- Added `aria-modal` and `aria-labelledby` to settings and bookmark dialogs.
- Added `aria-pressed` to region pills, stats tabs, cost filters, and builder filter buttons where state is visually selected.
- Hid several decorative SVG icons from assistive tech and added `rel="noopener noreferrer"` to external CTA links.
- Added missing `type="button"` on teammate filter controls.

### Verification Run

- `npm run lint --prefix client`: passed with 10 warnings.
- `npm run lint:a11y --prefix client`: passed with 10 warnings.
- `npm run build --prefix client`: passed. Vite reported the existing large chunk warning.
- `npm test`: passed 9 server tests.

### Remaining Lint Warnings After Phase 2-3

These JSX accessibility warnings remained after Phase 2-3 because they required keyboard/focus behavior work rather than safe Phase 3 markup tweaks. They were resolved in the Phase 4 pass below:

- `BookmarkModal.jsx`: overlay click handling still needs focus-aware modal behavior.
- `SettingsModal.jsx`: overlay click handling still needs focus-aware modal behavior.
- `DraggableUnit.jsx`: builder draggable unit wrappers still need full keyboard interaction.
- `UnitIcon.jsx`: clickable unit icon wrappers still need a safer keyboard/control model.

## Phase 4 Update

Implementation date: May 6, 2026

### Fixed In Phase 4

- Added a skip-to-main-content link in `client/src/App.jsx` targeting the single app-level `#main-content` landmark.
- Added a global `:focus-visible` ring in `client/src/styles/globals.css`, plus focused treatments for nav links, footer links, modal controls, comp rows, match cards, and unit icons.
- Added `aria-controls` to the mobile menu button and connected it to the primary navigation drawer.
- Added focus containment and focus return for the mobile navigation drawer.
- Prevented the off-canvas mobile navigation links from staying focusable while the drawer is visually closed.
- Added shared focus-trap behavior for settings and bookmark dialogs, including initial focus, Tab/Shift+Tab containment, Escape close, and focus return to the opener.
- Kept overlay-click-to-close behavior for dialogs while removing the previous JSX a11y overlay warnings.
- Added Escape handling to close Riot ID candidate result lists in the landing, nav, and standard search inputs.
- Added Enter/Space keyboard activation and focus styling for unit icon click targets and draggable unit wrappers where click behavior already existed.

### Verification Run

- `npm run lint --prefix client`: passed with no warnings.
- `npm run lint:a11y --prefix client`: passed with no warnings.
- `npm run build --prefix client`: passed. Vite still reports the existing large chunk warning.
- `npm test`: passed 9 server tests.
- Local browser smoke check at `http://[::1]:5173`: app rendered, skip link appeared on first Tab, mobile drawer opened and closed with Escape, and bookmark dialog closed with Escape.

### Remaining After Phase 4

- The comp builder still does not have a complete keyboard drag-and-drop workflow. Unit placement/toggle click targets now support Enter/Space where click behavior existed, but moving units/items, removing units/items, and board-cell operation still need the fuller Phase 7 builder pass.
- Candidate search results are keyboard-dismissable, but they still need richer announced-result semantics or combobox/listbox treatment in Phase 5.
- Hover cards/tooltips remain hover-first and need focus/screen-reader behavior in a later phase.
- Manual testing is still required for focus order, focus return, screen-reader dialog announcements, mobile drawer behavior, and browser zoom/reflow.

## Phase 5 Update

Implementation date: May 6, 2026

### Fixed In Phase 5

- Added a global `.sr-only` utility for accessible help/status text that does not change the visual design.
- Added persistent screen-reader help text for Riot ID and region controls in the landing search, nav search, standard match-history search, and bookmark modal search.
- Added `role="search"` and `aria-busy` to Riot ID search forms while resolution is in progress.
- Added screen-reader-only resolving status messages for Riot ID lookup and player verification.
- Added live candidate-count announcements for Riot ID candidate results and grouped candidate lists with an accessible prompt.
- Cleared stale search validation errors and candidate lists when users edit Riot ID input values.
- Kept Escape dismissal for candidate results and added the same behavior to bookmark modal suggestions without closing the whole modal first.
- Connected comp search result counts to the search input and exposed the count as a polite status update.
- Added accessible descriptions for the stats patch selector and stats search field.
- Added grouped semantics to stats cost filters, stats type controls, and leaderboard region filters.
- Added accessible loading/error/empty status handling for comps, stats, leaderboard, match-history empty states, builder loading/empty states, bookmark empty states, and filtered no-result states.
- Added a leaderboard API error state with `role="alert"` without changing API behavior.

### Verification Run

- `npm run lint --prefix client`: passed with no warnings.
- `npm run lint:a11y --prefix client`: passed with no warnings.
- `npm run build --prefix client`: passed. Vite still reports the existing large chunk warning.
- `npm test`: passed 9 server tests.
- In-app browser smoke check was attempted, but Browser Use reported no active Codex browser pane available from this thread. Manual browser verification remains required.

### Remaining After Phase 5

- Riot ID candidates are now announced as grouped button results, but a full combobox/listbox implementation is still optional future hardening if the search UX becomes more complex.
- Search invalid, empty, candidate, and API loading/error states still need NVDA or VoiceOver smoke testing.
- The comp builder still needs the fuller keyboard drag-and-drop and equivalent action workflow planned for Phase 7.
- Hover cards/tooltips remain hover-first and need focus/screen-reader behavior in a later phase.
- 200% zoom, 320px width, reduced motion, and color-contrast checks remain manual verification items.

## Phase 6 Update

Implementation date: May 6, 2026

### Fixed In Phase 6

- Added stable IDs plus `aria-expanded`, `aria-controls`, and labelled expanded regions for comp rows and match cards.
- Exposed expanded match scoreboards and teammate comp groups as labelled regions/lists instead of anonymous card content.
- Added a list relationship to match-history card collections and partner comp rows.
- Added stats table captions, hidden table descriptions, scoped column headers, and scoped row headers for unit/item/trait rows.
- Added leaderboard table captions, hidden table descriptions, scoped row headers for players, and clearer sortable column button labels.
- Preserved real leaderboard player links while adding non-color win-rate labels.
- Added visible text ratings and accessible labels to stats average-placement and win-rate metrics so color is not the only cue.
- Added accessible trait chip text that includes trait name, unit count, and tier while keeping decorative trait icons silent.
- Localized new comp, match-history, stats-table, leaderboard-table, and metric-rating strings in English and Spanish.

### Verification Run

- `npm run lint --prefix client`: passed with no warnings.
- `npm run lint:a11y --prefix client`: passed with no warnings.
- `npm run build --prefix client`: passed. Vite still reports the existing large chunk warning.
- `npm test`: passed 9 server tests.
- Locale JSON parse check for `en.json` and `es.json`: passed.
- `git diff --check` on Phase 6 files: passed; Git still reports line-ending normalization warnings for touched files.
- Local browser smoke check at `http://[::1]:5173`: `/stats`, `/leaderboard`, and `/comps` rendered their page headings with no browser console errors. The smoke check did not verify populated tables because the API data/server state was not part of this phase.

### Remaining After Phase 6

- Screen-reader table navigation still needs manual NVDA or VoiceOver testing on populated stats and leaderboard data.
- Match card and comp row expand/collapse announcements need manual screen-reader verification with real match/comp data.
- The match-history card layout remains visually card-based rather than a full HTML table; current fixes add list/region/card semantics, but a future deeper redesign could add a dedicated table view if users need denser screen-reader navigation.
- Hover cards remain hover-first and still need focus/screen-reader behavior in a later pass.
- Builder keyboard drag-and-drop, reduced motion, touch target sizing, 200% zoom, and 320px reflow remain planned for Phase 7/manual verification.

## Phase 7 Update

Implementation date: May 6, 2026

### Fixed In Phase 7

- Added a global `prefers-reduced-motion: reduce` fallback that disables nonessential animations/transitions and forces automatic scroll behavior.
- Stopped the landing mouse glow from tracking the pointer for reduced-motion users.
- Changed the landing starfield to render a static star field instead of continuously animating when reduced motion is requested.
- Hid landing scanline/mouse-glow motion effects in reduced-motion mode while preserving the page layout and theme.
- Added reduced-motion handling for nav drawer/backdrop transitions, modal fades, loading/sync pulse dots, and unit icon hover scaling.
- Increased touch hit areas for nav, footer links, search controls, stats tabs/cost filters, leaderboard region/pagination controls, modal close/remove buttons, builder filter buttons, and equipped item controls.
- Improved narrow-width wrapping for landing cards/search, comp page headers, comp rows, match cards, stats controls/metric labels, leaderboard controls/pagination, bookmark modal search, settings modal spacing, and builder toolbar/panels.
- Added small-screen table width caps for stats and leaderboard so dense tabular data remains horizontally scrollable instead of crushing text at 320px/200% zoom.

### Verification Run

- `npm run lint --prefix client`: passed with no warnings.
- `npm run lint:a11y --prefix client`: passed with no warnings.
- `npm run build --prefix client`: passed. Vite still reports the existing large chunk warning.
- `npm test`: passed 9 server tests.
- `git diff --check` on Phase 7 files: passed; Git still reports line-ending normalization warnings for touched files.
- Local browser smoke check at `http://[::1]:5173`: `/`, `/comps`, `/stats`, `/leaderboard`, and `/builder` loaded with no browser console errors. The landing page heading query returned no semantic heading for the wordmark, which is an existing page-structure issue outside this phase.

### Remaining After Phase 7

- Reduced-motion behavior still needs manual OS/browser preference testing, especially landing, modals, nav drawer, match-history loading states, and any About page scroll sequence if that route is restored.
- 200% zoom and 320px reflow need visual manual testing with real populated comp, stats, leaderboard, match-history, and builder data.
- Touch target sizing improved across the main controls, but board hexes, item slots, and drag/drop interactions still need real-device touch testing.
- The comp builder still does not have a complete keyboard-accessible drag-and-drop alternative; this remains the largest accessibility gap.
- Hover cards/tooltips remain hover-first and still need focus/screen-reader behavior in a later pass.

## Final Verification Update

Verification date: May 6, 2026

### Passed

- `npm run lint --prefix client`: passed with no warnings.
- `npm run lint:a11y --prefix client`: passed with no warnings.
- `npm run build --prefix client`: passed.
- `npm test`: passed 9 server tests.
- Local browser smoke check at `http://[::1]:5173`: `/`, `/comps`, `/stats`, `/leaderboard`, and `/builder` each exposed one main landmark and one page heading, and no browser console errors were reported.

### Fixed During Final Verification

- Converted the landing page visual wordmark from a plain `div` to an `h1` so the home route has a semantic page heading without changing the visual design.

### Warnings / Known Automated Limitations

- Vite still reports the existing large bundle warning after build. This is a performance/code-splitting warning, not an accessibility test failure.
- No axe/Playwright automated accessibility audit script beyond `eslint-plugin-jsx-a11y` is currently configured.
- Browser smoke checks verified landmarks/headings/console health only; they do not replace screen-reader, keyboard-only, zoom, contrast, or real-device testing.

### Remaining Manual Testing Before Production

- Keyboard-only navigation for every route, including Shift+Tab reverse order.
- Enter/Space activation for search controls, nav, filters, sortable tables, comp rows, match cards, modals, and builder controls.
- Escape closing behavior for mobile menu, modals, dropdowns, and candidate lists.
- NVDA or VoiceOver smoke test for landmarks, headings, forms, live regions, dialogs, tables, expanded scoreboards, and comp rows.
- 200% zoom and 320px mobile-width reflow checks with populated data.
- Reduced-motion preference check in the OS/browser.
- Color contrast review for text over glassmorphism, tinted metrics, trait chips, placement colors, and landing cards.
- Search invalid, empty, candidate, loading, and API error states.
- Real-device touch testing for nav, filters, modals, builder controls, board hexes, item slots, and dense tables.

### Remaining WCAG 2.2 AA Risks

- Critical risk: the comp builder still lacks a complete keyboard-accessible alternative to drag-and-drop placement, moving, equipping, and removal workflows.
- High risk: hover cards/tooltips remain hover-first; keyboard and screen-reader users may not get equivalent champion, item, and trait detail access.
- Medium risk: table/card semantics are improved, but dense match-history and comp-card experiences still require screen-reader validation with real data.
- Medium risk: 200% zoom, 320px reflow, and target sizing need manual confirmation on populated pages and real touch devices.
- Medium risk: color-contrast and non-color status cues need manual review across dark/light themes and glass/tinted surfaces.
- Low risk: route-specific document titles are still not implemented.
- Low risk: the About route/content remains dependent on existing page state and should be manually reviewed if restored for production.

## App Map

- App shell, nav, footer: `client/src/App.jsx`, `client/src/App.module.css`
- Global theme and base styles: `client/src/styles/globals.css`, `client/src/styles/theme.css`
- Landing/search/bookmarks: `client/src/pages/LandingPage.jsx`, `client/src/components/LandingSearchBar.jsx`, `client/src/components/NavSearchBar.jsx`, `client/src/components/SearchBar.jsx`, `client/src/components/BookmarkStrip.jsx`, `client/src/components/BookmarkModal.jsx`
- Comps: `client/src/pages/CompPage.jsx`, `client/src/components/CompRow.jsx`, `client/src/components/comp-row/*`
- Builder: `client/src/pages/CompBuilderPage.jsx`, `client/src/components/TFTBoard.jsx`, `client/src/components/DraggableUnit.jsx`, `client/src/components/DraggableItem.jsx`, `client/src/components/UnitRoster.jsx`, `client/src/components/ItemPicker.jsx`, `client/src/components/EquippedItems.jsx`, `client/src/components/FilterBar.jsx`
- Match history: `client/src/pages/MatchHistoryPage.jsx`, `client/src/components/MatchTable.jsx`, `client/src/components/match-table/*`, `client/src/components/SummonerProfileCard.jsx`, `client/src/components/TeammatesCard.jsx`, `client/src/components/LPGraph.jsx`
- Stats and leaderboard tables: `client/src/pages/StatsPage.jsx`, `client/src/pages/LeaderboardPage.jsx`
- Hover cards/tooltips: `client/src/components/shared/HoverableBoardPieces.jsx`, `client/src/components/UnitCard.jsx`, `client/src/components/ItemCard.jsx`, `client/src/components/TraitCard.jsx`, `client/src/hooks/useHoverCard.js`
- Animated/about sections: `client/src/pages/AboutPage.jsx`, `client/src/components/ScrollImageSequence.jsx`, `client/src/components/ScrollStorySequence.jsx`
- Legal pages: `client/src/pages/TermsOfService.jsx`, `client/src/pages/PrivacyPolicy.jsx`
- Tooling: `client/eslint.config.js`, `client/package.json`

## Critical Issues

### C1. Comp builder drag-and-drop is pointer-first and lacks a complete keyboard path

- File/component: `client/src/pages/CompBuilderPage.jsx`, `client/src/components/DraggableUnit.jsx`, `client/src/components/DraggableItem.jsx`, `client/src/components/TFTBoard.jsx`, `client/src/components/EquippedItems.jsx`
- Problem: The builder configures only `PointerSensor`; units/items are wrapped in draggable `div`s, board removal is right-click/context-menu based, and equipped item removal is advertised through `title` text with right-click behavior only.
- Why it matters: Keyboard-only and many assistive tech users cannot reliably place units, move units, equip items, remove units/items, or toggle board state. This blocks the core comp-builder workflow.
- Suggested fix: Add a `KeyboardSensor` and accessible DnD instructions, expose equivalent buttons/menus for place/move/remove/star/item actions, add labels for board cells and pieces, and avoid right-click-only actions.
- Verification: Partly automated with `jsx-a11y` and Playwright keyboard tests; needs manual keyboard and screen-reader testing.

### C2. Expandable comp and match cards are clickable `div`s without keyboard semantics

- File/component: `client/src/components/CompRow.jsx`, `client/src/components/match-table/MatchCard.jsx`
- Problem: Expand/collapse is attached to non-focusable `div` elements with `onClick`; there is no `button`, `tabIndex`, `Enter`/`Space` handling, `aria-expanded`, or `aria-controls`.
- Why it matters: Keyboard and screen-reader users cannot discover or open teammate comp details or expanded scoreboards.
- Suggested fix: Use a real `button` for the expand control or make the card header contain a button that owns the expanded region. Add `aria-expanded`, `aria-controls`, and stable IDs.
- Verification: Automated lint can catch part of this; manual keyboard and screen-reader testing required.

### C3. Leaderboard table uses non-keyboard clickable headers and rows

- File/component: `client/src/pages/LeaderboardPage.jsx`
- Problem: Sort is handled by `onClick` on `th`; player navigation is handled by `onClick` on `tr`. Neither is keyboard-focusable or announced as interactive.
- Why it matters: Keyboard users cannot sort the leaderboard or activate player rows, which blocks key table functions.
- Suggested fix: Put sort `button`s inside `th` with `aria-sort`; use real links/buttons in the player cell or make the row contain a focusable primary link.
- Verification: Automated lint can catch interactive non-controls; manual table keyboard testing required.

## High Issues

### H1. Duplicate `main` landmarks across routed pages

- File/component: `client/src/App.jsx` plus `CompPage.jsx`, `CompBuilderPage.jsx`, `MatchHistoryPage.jsx`, `StatsPage.jsx`, `LeaderboardPage.jsx`, `TermsOfService.jsx`
- Problem: `App.jsx` wraps routes in `<main>`, while many pages render another `<main>`.
- Why it matters: Nested or duplicate main landmarks make screen-reader landmark navigation unreliable.
- Suggested fix: Keep a single app-level `<main id="main-content">` and change page-level wrappers to `section`/`div`, or remove the app-level main and let each page own the landmark consistently.
- Verification: Automated axe landmark rules plus manual screen-reader landmark navigation.

### H2. No skip-to-main-content link

- File/component: `client/src/App.jsx`, `client/src/App.module.css`
- Problem: Keyboard users must tab through navigation/search/settings controls before reaching page content.
- Why it matters: WCAG 2.4.1 requires a way to bypass repeated blocks.
- Suggested fix: Add a visually hidden skip link before nav targeting `#main-content`, revealed on focus.
- Verification: Manual keyboard testing; axe may flag bypass issues.

### H3. Focus states are inconsistent and sometimes removed

- File/component: `client/src/styles/globals.css`, `client/src/App.module.css`, multiple component CSS modules
- Problem: There is no global `:focus-visible` treatment. Several controls use `outline: none` and only some inputs restore a custom focus style; links, icon buttons, cards, tabs, pagination, nav links, and modal controls are inconsistent.
- Why it matters: Keyboard users can lose track of focus, especially on dark/glass surfaces.
- Suggested fix: Add a global `:focus-visible` ring compatible with the existing theme tokens and fill gaps in component modules.
- Verification: Manual keyboard testing across all pages; visual regression review.

### H4. Mobile nav drawer lacks full dialog/disclosure behavior

- File/component: `client/src/App.jsx`, `client/src/App.module.css`
- Problem: The hamburger has `aria-expanded` but no `aria-controls`; the drawer does not trap focus, does not return focus to the opener, and background content remains in the tab order while the menu is open.
- Why it matters: Keyboard and screen-reader users can navigate behind an open menu and lose context.
- Suggested fix: Add an ID and `aria-controls`, manage focus on open/close, return focus to the opener, and consider `inert`/focus containment for background content on mobile.
- Verification: Manual keyboard, Shift+Tab, Escape, and screen-reader testing.

### H5. Modals lack `aria-modal`, focus trap, initial focus, and focus return

- File/component: `client/src/components/SettingsModal.jsx`, `client/src/components/BookmarkModal.jsx`
- Problem: Dialogs use `role="dialog"` but do not set `aria-modal="true"`, do not focus an element on open, do not trap focus, and do not return focus to the opener on close.
- Why it matters: Screen-reader and keyboard users can interact with background content or lose their previous place.
- Suggested fix: Add accessible modal focus management, `aria-modal`, `aria-labelledby`, initial focus, Escape close, overlay close, and focus return.
- Verification: Manual keyboard/screen-reader testing; axe can detect some dialog issues.

### H6. Search and form controls rely on placeholders or generic ARIA labels

- File/component: `SearchBar.jsx`, `LandingSearchBar.jsx`, `NavSearchBar.jsx`, `BookmarkModal.jsx`, `FilterBar.jsx`, `StatsPage.jsx`
- Problem: Several region selectors and text inputs do not have visible labels or associated labels. Some use placeholder-only naming; others use hardcoded English `aria-label`s.
- Why it matters: Placeholder text disappears during entry and is not a reliable accessible name. Hardcoded labels bypass localization.
- Suggested fix: Add visible labels where design permits, otherwise add visually hidden labels with `htmlFor`/`id`; localize all ARIA labels.
- Verification: Automated label checks plus manual screen-reader form review.

### H7. Validation, loading, and error states are not consistently announced

- File/component: `SearchBar.jsx`, `LandingSearchBar.jsx`, `NavSearchBar.jsx`, `BookmarkModal.jsx`, `MatchHistoryPage.jsx`, `CompPage.jsx`, `StatsPage.jsx`, `LeaderboardPage.jsx`
- Problem: Errors and loading messages are usually plain `p`/`div` elements without `role="alert"`, `role="status"`, or `aria-live`; inputs are not linked to errors with `aria-describedby`/`aria-invalid`.
- Why it matters: Screen-reader users may not know that validation failed, candidates appeared, data is loading, syncing started, or an API error occurred.
- Suggested fix: Add live regions for async states, `role="alert"` for validation/API errors, and connect fields to error/help text.
- Verification: Manual screen-reader testing; axe can catch some form associations.

### H8. Hover cards/tooltips are hover-only and hidden from assistive tech

- File/component: `HoverableBoardPieces.jsx`, `UnitRoster.jsx`, `ItemPicker.jsx`, `TraitList.jsx`, `UnitCard.jsx`, `ItemCard.jsx`, `TraitCard.jsx`
- Problem: Detail cards open on mouse hover only. Tooltip containers use `role="tooltip"` with `aria-hidden="true"` and are not reachable from keyboard/focus.
- Why it matters: Keyboard and screen-reader users cannot inspect champion/item/trait details that mouse users can reveal.
- Suggested fix: Open hover cards on focus as well as hover, connect triggers with `aria-describedby` where useful, and avoid contradictory `role="tooltip"` plus `aria-hidden`.
- Verification: Manual keyboard and screen-reader testing; automated lint can catch some ARIA misuse.

### H9. Tables and stat displays need stronger semantics

- File/component: `StatsPage.jsx`, `LeaderboardPage.jsx`, `TeammatesCard.jsx`, `MatchTable.jsx`
- Problem: Some tables lack captions/descriptions; numeric headers/cells lack `scope`; teammate rows use `role="button"` on `tr`; match history is card-based despite presenting dense tabular stat data.
- Why it matters: Screen-reader users need row/column context and clear descriptions for stat-heavy views.
- Suggested fix: Add captions or `aria-describedby`, `scope="col"` headers, real buttons/links inside rows, and accessible summaries for card-based match data.
- Verification: Automated table checks plus manual screen-reader table navigation.

### H10. Several stat meanings rely heavily on color

- File/component: `StatsPage.jsx`, `LeaderboardPage.jsx`, `MatchTable.module.css`, `CompRow.module.css`
- Problem: Avg placement, win rate, placement tiers, trait tiers, cost colors, and positive/negative stat styling are communicated largely by color.
- Why it matters: WCAG requires information not be conveyed by color alone.
- Suggested fix: Add text labels, abbreviations, symbols with accessible names, or `aria-label`s that include the meaning behind color-coded values.
- Verification: Manual review; automated contrast tools cannot fully verify color-only meaning.

### H11. About page currently has no perceivable page content

- File/component: `client/src/pages/AboutPage.jsx`
- Problem: The current component returns `null`.
- Why it matters: The `/about` route is linked in primary navigation but provides no heading, content, or landmark content for any user.
- Suggested fix: Restore or rebuild the intended about content with a page heading and accessible animated sequence behavior.
- Verification: Manual route check; automated route smoke test can catch missing heading/content.

## Medium Issues

### M1. Navigation active state should be verified across React Router output

- File/component: `client/src/App.jsx`
- Problem: `NavLink` usually emits `aria-current="page"`, but the app applies active styling via class callbacks and should explicitly verify the current link is announced.
- Why it matters: Screen-reader users need to know the current page.
- Suggested fix: Confirm `NavLink` output in browser; add explicit `aria-current` only if React Router does not emit it in this version.
- Verification: Manual DOM/screen-reader check.

### M2. Decorative SVGs/icons are inconsistently hidden

- File/component: `LandingPage.jsx`, `BookmarkStrip.jsx`, `ScrollStorySequence.jsx`, table/card icon components
- Problem: Some decorative SVGs lack `aria-hidden="true"`; some meaningful icon-only buttons have labels, but decorative icons inside links/cards may still be exposed.
- Why it matters: Unnamed or redundant graphics add noise to screen-reader output.
- Suggested fix: Mark decorative SVGs `aria-hidden="true" focusable="false"` and ensure meaningful icon-only controls have accessible names.
- Verification: Automated lint plus manual screen-reader output.

### M3. Icon image alt text needs intent review

- File/component: `UnitIcon.jsx`, `ItemIcon.jsx`, `StatsPage.jsx`, `SummonerProfileCard.jsx`, `BoardDisplay.jsx`
- Problem: Some champion/item icons have meaningful `alt`, some repeated icons may duplicate adjacent text, and rank icons use tier-only alt text.
- Why it matters: Meaningful images need useful names; decorative/redundant images should be silent.
- Suggested fix: Keep meaningful isolated icon alt text, set empty alt when adjacent visible text already names the entity, and improve rank icon alt to include rank context.
- Verification: Manual screen-reader review.

### M4. Reduced-motion support is partial

- File/component: `LandingPage.jsx`, `LandingPage.module.css`, `ScrollImageSequence.jsx`, `ScrollStorySequence.jsx`, `MatchHistoryPage.module.css`, modal CSS
- Problem: Some components check `prefers-reduced-motion`, but canvas starfield, mouse glow, CSS animations/transitions, scroll-linked frame updates, and modal fade animations need a full pass.
- Why it matters: Motion-sensitive users may experience discomfort, and scroll-linked animation can interfere with navigation.
- Suggested fix: Add global and component-level reduced-motion rules; pause nonessential animation and use instant transitions where appropriate.
- Verification: Manual reduced-motion testing; browser emulation.

### M5. Search candidate dropdowns need combobox/listbox semantics or simpler announced results

- File/component: `RiotIdCandidates.jsx`, `LandingSearchBar.jsx`, `NavSearchBar.jsx`, `SearchBar.jsx`, `BookmarkModal.jsx`
- Problem: Candidate lists appear dynamically as groups of buttons but are not announced as search results and are not associated with the search input.
- Why it matters: Screen-reader users may not know that multiple Riot ID candidates appeared.
- Suggested fix: Add an `aria-live` result summary and/or implement accessible combobox/listbox semantics. Keep the current visual design.
- Verification: Manual screen-reader testing.

### M6. Tabs/segmented controls need selected-state semantics

- File/component: `StatsPage.jsx`, `FilterBar.jsx`
- Problem: Stats tabs and builder sort/category controls are button groups visually, but do not expose `aria-pressed`, `aria-selected`, `role="tablist"`, or grouped labels consistently.
- Why it matters: Assistive tech users need to know which filter/tab is active.
- Suggested fix: For true tabs use `role="tablist"`/`tab`; for filters use `aria-pressed` and accessible group labels.
- Verification: Automated ARIA checks plus manual screen-reader testing.

### M7. Legal/footer text is very small and uppercase

- File/component: `App.module.css`, `TermsOfService.module.css`, `PrivacyPolicy.module.css`, `globals.css`
- Problem: Footer links/disclaimer use about `0.6rem` uppercase text with wide letter spacing. Global uppercase styling affects readability across content-heavy pages.
- Why it matters: Small uppercase text can be difficult to read at default size and at zoom, especially for legal/disclaimer content.
- Suggested fix: Raise minimum footer text size, preserve branding where possible, and consider normal-case body text on legal pages.
- Verification: Manual readability and 200% zoom testing.

### M8. Touch targets are inconsistent

- File/component: `App.module.css`, `NavSearchBar.module.css`, `EquippedItems.module.css`, `StatsPage.module.css`, `MatchTable.module.css`, builder icon grids
- Problem: Some controls are below 44px in either width or height, including nav search controls, gear button, item slots, icon grids, and compact table controls.
- Why it matters: WCAG 2.2 target-size guidance improves use on touch and for users with motor impairments.
- Suggested fix: Increase hit areas with padding/min dimensions while preserving visual size where necessary.
- Verification: Manual responsive/touch testing.

### M9. 200% zoom and 320px layout need targeted checks

- File/component: app-wide CSS modules, especially `LandingPage.module.css`, `MatchTable.module.css`, `CompBuilderPage.module.css`, `LeaderboardPage.module.css`
- Problem: Many dense rows, grids, absolute board cells, and uppercase labels may overflow or become hard to use at 200% zoom / 320px width.
- Why it matters: WCAG reflow requires content remain usable without two-dimensional scrolling except where necessary for data tables.
- Suggested fix: Test key pages at 200% zoom and 320px width, then patch overflow/hit-area issues.
- Verification: Manual browser testing plus Playwright viewport checks.

## Low Issues

### L1. Tooling does not yet include accessibility linting or automated axe checks

- File/component: `client/eslint.config.js`, `client/package.json`
- Problem: ESLint exists but `eslint-plugin-jsx-a11y` is not installed/configured; no axe-based script was found.
- Why it matters: Automated checks catch regressions early.
- Suggested fix: Add `eslint-plugin-jsx-a11y` to the flat ESLint config and consider a lightweight axe/Playwright audit script for built pages.
- Verification: Automated.

### L2. Document title/meta per route were not found in reviewed code

- File/component: routed pages
- Problem: Pages do not appear to set route-specific `document.title`.
- Why it matters: Clear page titles help screen-reader and keyboard users orient after navigation.
- Suggested fix: Add a small route-title effect or metadata helper.
- Verification: Manual browser/screen-reader check; automated route smoke test possible.

### L3. Hardcoded English accessibility strings bypass i18n

- File/component: `StatsPage.jsx`, `NavSearchBar.jsx`, `ScrollImageSequence.jsx`, `ScrollStorySequence.jsx`, match stat titles
- Problem: Some labels/titles are hardcoded English while the app has i18n.
- Why it matters: Non-English users may receive mixed-language accessible names.
- Suggested fix: Move accessible labels, `title` text, captions, and status strings into locale files.
- Verification: Manual i18n review.

## Preliminary Manual Test Checklist

Add remaining manual-only checks here as fixes proceed:

- Keyboard-only navigation for every page.
- Shift+Tab reverse navigation.
- Enter/Space activation for buttons, links, rows, cards, tabs, filters, and builder controls.
- Escape closes mobile menu, settings modal, bookmark modal, dropdowns/popovers/tooltips.
- Focus returns to opener after closing overlays.
- NVDA or VoiceOver smoke test for page landmarks, headings, forms, tables, modals, and dynamic updates.
- 200% zoom test.
- 320px mobile width test.
- Reduced motion test.
- Color contrast check on text over images/glassmorphism and tinted stat labels.
- Search invalid state.
- Search empty/no-candidate state.
- API loading, sync, and error states.
- TFT-specific: champion icons, item icons, trait chips, comp cards, match cards, match expanded scoreboard, region selector, drag-and-drop builder, and stat color labels.

## Suggested Implementation Plan

1. Phase 2 tooling: add `eslint-plugin-jsx-a11y`, configure it conservatively, and add an accessibility script/documentation without breaking current `lint` or `build`.
2. Phase 3 safe semantics: fix duplicate landmarks, skip link, labels, decorative icons, live regions, table captions/scopes, and obvious ARIA cleanup.
3. Phase 4 keyboard/focus: add global `:focus-visible`, convert clickable cards/rows/headers to real controls, and harden nav/modal focus behavior.
4. Phase 5 forms/states: connect errors/help text, improve candidate announcements, and add accessible loading/error/empty states.
5. Phase 6 tables/cards/stats: finish table semantics, expand/collapse ARIA, non-color stat labels, and hover-card focus behavior.
6. Phase 7 builder/motion/responsive: add keyboard-accessible builder actions, reduced-motion coverage, touch target pass, and 200%/320px layout fixes.
7. Phase 8 verification: run lint/build/tests/a11y scripts, update this file with fixed/remaining issues and manual-test results.
