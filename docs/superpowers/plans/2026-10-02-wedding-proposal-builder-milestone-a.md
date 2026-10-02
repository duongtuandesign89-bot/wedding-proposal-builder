# Wedding Proposal Builder — Milestone A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a polished, responsive local V1 for editing and previewing a bespoke three-page Solis Studio wedding proposal.

**Architecture:** React owns one typed in-memory proposal state. Focused editor components mutate it through typed callbacks, while isolated proposal page components render fixed 1080×1920 layouts inside a scaling frame.

**Tech Stack:** Vite, React, TypeScript, Vitest, CSS custom properties and plain CSS

**Spec:** `docs/superpowers/specs/2026-10-02-wedding-proposal-builder-milestone-a-design.md`

## Global Constraints

- Implement only Milestone A; no backend, persistence, export, deployment, AI, or automatic travel/time pricing.
- Keep Editor and Proposal visuals and CSS namespaces separate.
- Proposal artwork retains a fixed 9:16 composition while scaling as a whole.
- Use Solis Studio branding and the supplied white PNG logo.
- Avoid unnecessary production dependencies.

## Review Focus

- Empty text fields remain editable and do not crash preview rendering.
- Invalid or blank price input resolves safely without `NaN` in totals.
- Long Vietnamese event/location content does not create horizontal overflow.
- Mobile tab switching preserves all edits in memory.
- Proposal pages retain exact 9:16 dimensions across target viewport widths.

---

### Task 1: Foundation, types, demo data, and utilities

**Files:** Create Vite configuration, package manifests, `src/types/proposal.ts`, `src/data/demoProposal.ts`, `src/utils/currency.ts`, and utility tests.

**Interfaces:** Produce `Proposal`, `WeddingEvent`, `ServiceItem`, `formatCurrency`, and `calculateTotal` for all later tasks.

- [ ] Write failing currency and total tests, including invalid numeric values.
- [ ] Add the minimal project setup, types, fixtures, and utility implementations.
- [ ] Run unit tests and confirm they pass.

### Task 2: Live proposal state and editor

**Files:** Create `src/App.tsx`, editor section components, `src/styles/editor.css`, and interaction tests.

**Interfaces:** Consume `Proposal`; produce typed immutable update handlers for couple, general data, events, and services.

- [ ] Write failing interaction tests for live couple, event, service, and price changes.
- [ ] Implement focused editor sections with accessible, touch-friendly fields.
- [ ] Run tests and confirm state updates and mobile tab preservation pass.

### Task 3: Luxury proposal preview

**Files:** Create proposal frame and page components, `src/styles/proposal.css`, font declarations, logo and demo hero asset.

**Interfaces:** Consume `Proposal`; render three fixed 1080×1920 pages and calculated investment total.

- [ ] Write failing render tests for all three pages and calculated total.
- [ ] Implement Cover, Wedding Days, and Investment pages with isolated editorial styles.
- [ ] Verify the logo, demo image, Vietnamese copy, and currency output render correctly.

### Task 4: Responsive shell and final verification

**Files:** Create `src/styles/app.css` and complete responsive behavior in existing UI files.

**Interfaces:** Desktop split view at 1280/1440 and Edit/Preview tabs at 390/430.

- [ ] Add responsive layout assertions and implement whole-page proposal scaling.
- [ ] Run the full test suite and production build.
- [ ] Start `npm run dev`, inspect target viewports, and report the localhost URL and manual checklist.
