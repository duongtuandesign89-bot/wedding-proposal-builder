# Local Proposal Library Implementation Plan

> Implement inline with executing-plans and test-driven-development. User explicitly requests immediate implementation, no additional approval pauses, no B4 commits/pushes. Work in the current approved workspace.

**Goal:** Library-first local drafts, complete data/image persistence, safe duplication and debounced saving without changing Proposal art direction.
**Architecture:** Native IndexedDB v1 (`solis-proposal-builder`) stores `proposals` and `images`. Stored Proposal excludes runtime image src and refers to an image ID. Each draft owns its Blob, duplicated atomically with new IDs; replaced/deleted Blobs are removed in the same transaction. Editor session reconstructs and owns runtime URLs. A sequential autosave controller debounces 700ms, deduplicates business snapshots and flushes on navigation/visibility/pagehide. Storage failure reports an honest warning and retains memory editing.
**Stack:** Existing React/TS/CSS, native IndexedDB; fake-indexeddb dev-only for tests. No runtime dependency.
**Spec:** /Users/macbook/.codex/attachments/b2843401-b674-4fea-b0b3-86a8094a049b/Văn bản đã dán.txt

## Constraints
- Checkpoint B3 pushed separately as 69abd20; B4 remains uncommitted.
- No backend/account/export/deployment or next milestone.
- Library starts empty; demo is a test fixture only. New default uses unique proposal/event/service IDs, one event and two zero-price services.
- Original Blob bytes preserved; crop saved independently; no base64/recompression.
- Internal back awaits successful flush; failed writes keep user in Editor with retry and warning.
- Async unload is best effort only: 700ms debounce plus visibility/pagehide flush, warn on pending unload.
- Existing editor/preview regression tests use extracted EditorWorkspace with demo initial state, not the library-first App.

## Review focus
- Rapid edits during in-flight save and repeated flush must not overwrite newest snapshot or falsely report saved.
- Failed image writes must preserve previous draft and image atomically; retries retain original Blob in memory.
- Replacing/deleting clone image must not affect original, and no orphan images accumulate.
- UI-only collapse/mobile tabs must not change updatedAt.
- Closing/loading sessions must release URLs, but not revoke active preview during collapse/mobile changes.

## Tasks / progress ledger
1. Storage + defaults: add repository tests RED; implement DB transactions/default factory/duplicate nested IDs/search-sort; GREEN full suite.
2. Autosave + image bridge: controller and session tests RED; implement debounce, queued flush, resource ownership, lifecycle; GREEN suite.
3. Library + App integration: UI tests RED; library search/actions/confirmation/error states, workspace nav/status; preserve old tests on workspace. GREEN suite/build.
4. Browser verify create/edit/reload/image/duplicate/delete/mobile, fresh independent review, fix Important findings RED→GREEN, final suite/build/server. No commit.

Plan decisions: individual Blob per draft prioritizes safe deletion over deduplication; native DB avoids runtime packages. Metadata title/couple derived from stored business data rather than duplicated top-level fields. Main checkout continued to keep approved localhost/workflow; no extra branch/worktree or commit is created.

### Execution ledger
- Task 1 complete: 10 repository tests pass. Blob persistence uses Node Blob in tests because jsdom Blob is not structured-clone capable; production stores browser Blob unchanged. Original-image new-ID bug caught by tests and fixed. Failed image replacement preserves old transaction state.
- Task 2 complete: 3 autosave tests pass for debounce/deduplication, edits during slow save, and failure/retry; existing 8 Hero tests pass with File callback bridge.
- Task 3 complete: library-first creation/edit/back/remount, search/duplicate/confirm-delete, unavailable DB memory mode tests pass. Full suite 75 before two additional repository tests; build passes.
- Reviewer dispatched read-only; browser checks in progress. No B4 commit.
- Final review: no Critical/Important findings in single-session scope. Stale status after reverting a failed in-flight save fixed with RED→GREEN test; loaded URL now released on image removal/replacement, verified RED→GREEN under StrictMode. Failed back retains editable data and retry succeeds. Signed negative totals fixed RED→GREEN in Library.
- Task 4 complete: 82 tests pass in 16 files; TypeScript/Vite build passes. Browser verified empty start, new draft, original Blob upload, crop 55/50/2.5, internal-back flush, reload to Library and restoration, duplicate and independent Hero removal, Vietnamese location search. Library/Preview mobile390 no horizontal overflow, 44px Library actions,16px service type; Proposal styles/files unchanged.
- Browser holds two deliberately named `Kiểm thử B4` test drafts for review; no user draft deletion or demo seeding. Server localhost5173 remains running.
- Scope rulings: simultaneous editing of the same draft in multiple tabs has no conflict resolution in B4; browser/process termination is best-effort (short debounce/lifecycle flush and pending unload warning), not a durability guarantee. No next milestone/B4 commit/push.
