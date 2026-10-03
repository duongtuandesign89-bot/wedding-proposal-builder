# C1 High Quality Image Export Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline, with TDD and a final fresh read-only review. User explicitly requests immediate implementation without small-decision approval pauses. Do not commit C1.

**Goal:** Download a single continuous JPG/PNG proposal image, independent of viewport, without changing the approved preview or persisted data.

**Architecture:** A temporary offscreen ExportProposalRenderer mounts the same ProposalDocument at canonical 1080 logical pixels. Explicit export mode excludes mobile CSS; modern-screenshot rasterizes it at scale 1 or 4/3. Wait for exact fonts, image decoding and React crop/layout settlement, then measure, validate dimensions, capture, encode Blob, download and dispose resources.

**Tech Stack:** React, TypeScript, CSS, modern-screenshot, locally bundled existing Bodoni Moda/Lora/Inter font faces.

**Spec:** User attachment `/Users/macbook/.codex/attachments/75bcfa2e-fce7-4a3e-8541-f4407aea99c6/Văn bản đã dán.txt` (C1 sections 1–30).

## Global Constraints

- Default JPG quality 0.92, opaque proposal background; presets 1080 and 1440 pixels, auto full height.
- Same component tree/data/crop; no preview screenshot, no mobile reflow in export, no duplicated layout.
- No PDF/pages/backend/cloud/share/watermark; no C1 commit/push or C2.
- Flush pending autosave, then use current in-memory snapshot. Failed persistence does not replace current draft.
- Existing IndexedDB records/schema and preview visual must remain intact.
- Explicit conservative dimension/memory guard, plus actual canvas dimension/encoding validation; never silently downscale/crop.

## Review Focus

- Font failure/missing Vietnamese subset must fail rather than silently rasterize fallback (Task 2).
- Cached hero load and image changes during capture must preserve crop and own Blob URL lifetimes (Tasks 2, 3).
- Oversized image and null/wrong-format canvas encoding must exit busy state and clean DOM/canvas (Tasks 1–3).
- Export after pending edits uses current state; unchanged export does not update stored timestamp (Task 3).
- Mobile preview mode must still expose export control and modal keyboard focus, while export document remains canonical (Tasks 2–3).

### Task 1: Export values, filenames and safety

Files: `src/export/exportOptions.ts`, `src/utils/createProposalFilename.ts`, corresponding tests.
Interfaces: ExportFormat = 'jpg' | 'png'; ExportQuality = 'standard' | 'high'; calculateExportDimensions(logicalHeight, quality) -> width,height,scale; createProposalFilename(proposal,format) -> string.
- [x] Write tests with literal Unicode/single/empty/unsafe name cases; output heights 2500/4000/6000, scale 4/3, invalid/oversized dimensions.
- [x] Observe RED, implement utilities, verify GREEN.

### Task 2: Canonical renderer and capture pipeline

Files: `ExportProposalRenderer.tsx`, `exportProposal.ts`, `prepareExport.ts`, `downloadBlob.ts`, tests; minimal ProposalDocument props and CSS scoping.
Interfaces: exportProposal(proposal, options, heroBlob?) -> Promise<void>; prepareExport(root) -> Promise<void>.
- [x] RED tests: clean canonical root distinct from preview, same full sections/crop, font/image readiness/failure, output validation and cleanup on capture/encode errors.
- [x] Implement temporary mount, local font registration preserving same families/weights/optical sizing, wait loaded fonts/images/2 frames, safe canvas/Blob encoding and delayed URL cleanup.
- [x] Verify GREEN and full suite.

### Task 3: Export UX and autosave integration

Files: `ExportControl.tsx`, tests, export CSS, EditorWorkspace/ProposalEditor minimal header additions.
- [x] RED tests: defaults/options/cancel, busy lock, success reset, failure recovery, Escape/focus; flush pending then export current draft without unnecessary save.
- [x] Implement native dialog, focused radio groups, inline feedback; expose same export control in mobile preview navigation without changing proposal layout.
- [x] Verify GREEN, all tests/build; inspect actual JPG/PNG downloads and mobile viewport. Scenario E download-path limitation is recorded below, not claimed as verified.

## Execution ledger

- Baseline/checkpoint: 96 tests pass, build pass; `d453763a646a290ca735742950db0912530c8804` pushed to origin/main.
- User instruction overrides skill approval pauses, per-task commits and separate worktree: implement immediately in current served checkout; leave C1 uncommitted for manual review.
- Independent read-only review found three issues, fixed with RED/GREEN regression tests: swallowed rasterization failures producing an opaque blank canvas; silent font embedding failure; focus restoration before the export trigger became enabled. Capture now validates the mandatory logo region, embeds font bytes explicitly with bounded fetches, and restores focus after the closing React commit.
- Actual downloaded files inspected visually and with `sips`: bride-only JPG 1080×1881; two long Vietnamese names/two events/long notes JPG 1080×2555; groom-only/three events/positive and negative adjustments PNG 1080×4170; no names/long notes and terms high-quality JPG 1440×7863 (logical height about 5897). Full footer and Vietnamese glyphs present.
- Desktop and 390px mobile-preview PNG exports had identical SHA-256 `1b612fb0cfd16e3bd6e2200c2c7389c82bf7e3bb55e0773a41ab9da6306fca91`. Dialog fits 375px and 430px with no horizontal overflow; Escape closes and success restores focus. Temporary export hosts absent after capture.
- Stored custom Hero Blob was rendered/exported in IAB at 170% zoom with offset (image styles 170%/340%, left -31.5%, top -108%); UI reported success. IAB did not expose a download path for the final crop case, so that final file's pixels remain a user-review item. An earlier custom-Hero JPG 1080×1881 was downloaded and visually inspected. Chrome upload verification was blocked by extension file-URL permission; no permissions changed, no existing user records edited. Test data created only in agent-created drafts/duplicates. Physical iPhone/Safari download and memory behavior were not tested.
- Final C1 remains uncommitted; HEAD and origin/main remain checkpoint `d453763a646a290ca735742950db0912530c8804`. No C2 work.
- Final verification: 135/135 tests across 27 files pass; `npm run build` passes; `git diff --check` passes. Working tree contains only C1 source/tests/dependencies and this plan, no exported images or temporary capture artifacts. Existing dev server PID 3510 listens on http://127.0.0.1:5173/.
