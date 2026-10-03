# Milestone B3 — Proposal content and optional sections

**Goal:** Short client-specific introduction, notes, terms and contact in the approved continuous quote.
**Architecture:** Per-section enabled is the only visibility source. Plain text strings/arrays in Proposal, immutable hook updates. Shared content list editor and numbered editorial renderer. Native details groups keep collapse UI outside business data and preserve mounted B2 image resource ownership.
**Spec:** User B3 attachment 914a6239-aa6f-4ed4-9d90-2ba0affb9a36.

## Decisions
- Introduction `{ enabled:false, text:'' }`; notes/terms `{ enabled:true, items:string[] }`; contact `{ enabled:true, studioName, phone, optional fields }`.
- Contact studioName replaces settings.studioName as the single source of identity.
- Notes/terms operations address ordered string-array entries by index; no per-item local state or ID is needed for these plain text lists.
- Adjustments remain visible whenever present, total always visible and unchanged.
- Default notes 2 short entries, terms 2 short entries, contact only studioName populated. No invented phone/address or fixed marketing slogan.
- Keep current group numbering for existing sections, append 06–09; add collapse to long groups, preserve mounted children.

## Tasks
1. Add failing UI/preview tests for toggles, empty/whitespace suppression, note/term add/edit/delete/reorder, optional contacts, Vietnamese text and serializability.
2. Extend typed data/demo/hook. Update the legacy notes test fixture for the required new schema; retain its original behavior assertions.
3. Add EditorGroup/EditorTextarea/ContentListEditor/ContentEditor, append controls and native collapse for long groups.
4. Add IntroductionSection/EditorialListSection and expanded FooterSection, conditional rendering and token-based editorial CSS. Remove legacy combined TermsSection.
5. Full tests/build and independent review; browser desktop/mobile + preserve Hero/services/total against checkpoint B2; localhost running for review.

## Constraints
No commit/push/B4, persistence, exports, packages, redesign of Hero/crop/event/service/total, rich text or contentEditable.

## Verification
- Completed implementation and independent static review: no actionable findings.
- 61 tests passed; production TypeScript/Vite build passed; git diff --check clean.
- Browser live introduction/contact editing and native Hero group collapse verified.
- Preview checked at 375/390/430px: no horizontal page overflow; numbered notes/terms and contact retain continuous editorial layout.
- Hero/services/total style rules and crop/calculation behavior preserved by diff review and existing regression tests.
- Demo restored; development server available at http://127.0.0.1:5173/. No B3 commit/push or B4 work.

## Review focus
- Blank enabled sections have no wrapper, divider or spacing.
- Disabling preserves editable data; reenable restores content/order.
- Empty list rows are filtered before Proposal numbering.
- Collapsing Editor groups cannot revoke active uploaded Hero URLs.
- Text is rendered as plain text, body case and line breaks preserved.
