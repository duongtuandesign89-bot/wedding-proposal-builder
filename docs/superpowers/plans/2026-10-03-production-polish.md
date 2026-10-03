# Production Polish Implementation Plan

> Execute inline using executing-plans and verification-before-completion. User requests implementation now; no approval pauses, extra worktree, polish commits/pushes or deployment.

**Goal:** Verify production readiness and fix demonstrated reliability/responsive defects without redesign.
**Architecture:** Preserve React state navigation, IndexedDB version/name, business data, Hero ownership and canonical C1 export pipeline. Fix only confirmed failures at their source.
**Tech Stack:** Existing Vite/React/TypeScript/CSS and tests; no new dependencies.
**Spec:** `/Users/macbook/.codex/attachments/cb7919bc-8a9e-49b3-998e-3f96bdfc5546/Văn bản đã dán.txt`.

## Constraints and Review Focus

- Preserve approved visual, features, existing proposals/images and database schema.
- Verify startup with empty and saved storage; failed saves must never show saved.
- Verify Hero replace/delete does not affect another proposal; object URLs have bounded ownership.
- Verify mobile Editor and modals at 390/430/768 and desktop >=1280; long text wraps without price overlap.
- Verify four JPG/PNG presets on production preview; export remains readonly and double-action locked.
- Only add regression tests for actual defects. No new framework/features.

## Tasks

- [x] Audit source/tests/defaults/debug artifacts/lifecycles. Add missing preview script, exact metadata and concise README. Validate build and production startup.
- [x] Reproduce reliability and responsive issues on production preview, with own drafts only. For each confirmed bug: failing regression, minimal fix, passing regression. Verify Library, Hero, amounts, long-content and export scenarios; document physical-device limitations.
- [x] Run full tests/build, production browser verification and diff check; fresh independent review; report files/issues/visual changes/dependencies/manual gaps and stop without committing polish.

## Ledger

- C1 checkpoint `1529e340d27e3cddf459ac2d0178545999b80562` pushed to origin/main. Clean baseline, 135 tests and build passed immediately before checkpoint.
- Initial findings: package.json lacks preview script, README missing, HTML description differs from required text. createDefaultProposal has empty names/location and zero prices, no test data. Diagnostic console.error is intentional failure reporting, not debug console.log.
- Ruling: keep current main checkout and ledger inline; user explicitly requests local uncommitted polish after checkpoint, no separate worktree or per-task commits.
- Production preview: http://127.0.0.1:4173/ (`npm run preview -- --host 127.0.0.1 --strictPort`); server initially needed sandbox approval for listen, no application defect. Production reload verified after final build.
- Chrome empty storage startup and saved storage startup pass. Own drafts only: Create/Open/Edit/Autosave/Back/Duplicate/Search/Reload and newest-first ordering verified. Delete confirmation/cancel/Escape verified in UI; actual destructive deletion and independent Hero ownership verified by existing fake-IndexedDB tests, not performed on user data.
- Editor inputs do not overflow at 390/430/768/1280px. Key actions have existing 44px targets. Delete dialog fits 390px; export dialog fits 390×500 shortened viewport and closes correctly. This is viewport simulation, not a physical soft-keyboard test.
- Long content: 4 events ×4 services, negative adjustment, introduction, 5 long notes, 5 long terms and contact. Long Vietnamese service/location wrap without price overlap. Literal Vietnamese text, empty/zero and negative amounts verified; real OS IME composition remains manual.
- Actual Chrome downloads: both names JPG1080 1080×4710; bride-only PNG1080 1080×4710; groom-only JPG1440 1440×6280; no names PNG1440 1440×6280. Long PNG visually inspected through complete footer. No export root after capture, success focus resets; export double-action/error-reset and readonly timestamps covered by existing automated tests.
- IAB custom Hero upload, crop offset and zoom170%, save/back/reload/reopen verified (Blob source restored, image naturalWidth1448, styles width/height170%, left−31.5%, top−35%). JPG1080/PNG1080/JPG1440/PNG1440 UI success verified. Saved timestamp14:51 remained unchanged after all exports. IAB file chooser took an extended tool-level wait; no app hang inferred. No claims of physical Safari download verification. Hero replace/remove/rejection/isolation covered by existing automated tests.
- Independent fresh reviewer found no Critical/Important issues, one error-copy accuracy issue. Regraded as worth fixing because deletion followed by refresh failure falsely promised no data deletion. `does not claim data was preserved when deletion succeeds but refreshing the library fails` observed RED, neutral message in App.tsx, then full suite GREEN136/136. No operation, visual, storage or export architecture changed.
- Source audit: no debug console.log or dev URLs/absolute paths in runtime source. Diagnostic console.error kept for real failures. Strict additional unused locals/parameters check passes. Test fixtures retained; no DB name/version/data reset. No dependencies added. Existing white transparent logo was not repurposed into a low-contrast favicon or regenerated; suitable favicon asset remains a user-supplied predeploy option.
- Final review limitations accepted: physical Safari/download/memory, mobile OS keyboards and true Vietnamese IME need manual device check; browser geometry/interaction proven separately by execution above. Baseline automated safety tests remain intact. No polish commit, push or deployment.
