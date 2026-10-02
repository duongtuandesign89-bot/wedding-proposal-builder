# Milestone B1 — Dynamic Quote Editor

**Goal:** Personalized dynamic quotes without redesigning the approved continuous Proposal.
**Architecture:** `useProposalEditor` owns immutable JSON data updates. EventEditor owns only collapse/confirmation/focus UI state. Currency utilities derive the total from services plus signed adjustments.
**Stack:** Existing React + TypeScript + CSS, Vitest. No dependencies.
**Spec:** User brief in attachment `9eea6517-7f7a-417a-89cd-9196ec66022b`.

## Constraints and rulings
- Work in the current checkout for the existing localhost review; no commit/push/B2.
- User explicitly requests immediate implementation after a short plan, without architecture approval pauses.
- Preserve Hero, desktop/mobile typography and spacing for existing data.
- Empty demo descriptions to preserve the previously approved visual; descriptions entered by users render as secondary text.
- Allow negative adjustments and negative final totals; no invented zero floor for discounts.
- Event reordering only; service reordering is optional and omitted.
- No persistence, exports, uploads, new packages, or backend.

## Tasks
1. Tests first: cover add/delete/reorder events, stable IDs, immutability, service CRUD, signed adjustments, empty/invalid prices, description rendering and empty proposal. Preserve all A tests.
2. Data: add Adjustment and required adjustments array, typed patch helpers in useProposalEditor, signed parsing/formatting and calculateProposalTotal.
3. Editor: extract EventEditor, inline event deletion confirmation, collapse controls, event up/down, dynamic services with optional descriptions/new-name focus, signed amount editor and adjustment CRUD.
4. Preview: conditional empty sections/metadata; optional secondary description and adjustments before total, using existing editorial tokens.
5. Verification: full tests + build, inspect desktop and mobile 375/390/430, compare default Proposal geometry with A; review diff; leave server running.

## Review focus
- Duplicate names must not confuse ID-based updates/deletion.
- UI state follows IDs after reorder; new events expand.
- A standalone minus sign must survive typing until amount digits arrive; state stays numeric.
- Empty sections do not leave orphan labels/dividers.
- Demo visual unchanged despite new optional content support.

## Progress
- Baseline inspected: clean main at c7ead02; 15 tests pass.
- Complete: dynamic immutable hook, Editor controls, description/adjustment preview, empty states.
- Red/green: 18 initial behavior/utility failures and 4 empty/description preview failures became passing; all 15 A tests retained.
- Review: independent reviewer found no important issue; added 4 data-boundary tests for unique IDs, duplicate names, immutable frozen inputs, serializability and guarded reorder.
- Verification: 41 tests pass; production build passes; git diff --check passes.
- Browser: added event/service, long Vietnamese service + description, negative adjustment and live total verified. Mobile 375/390/430: service 16px, title 23px, description 12.5px, no horizontal overflow.
- A/B regression: all 78 default Proposal DOM elements match computed typography/color/spacing and geometry normalized to 1080px, using the actual HEAD checkpoint served separately for comparison.
- Demo restored for handoff; localhost 5173 running. No commit, push or B2.
