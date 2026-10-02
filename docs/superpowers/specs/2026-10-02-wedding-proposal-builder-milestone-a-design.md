# Wedding Proposal Builder — Milestone A Design

## Intent

Build a local-first V1 for Solis Studio to compose bespoke wedding photo and film proposals. The editor should feel efficient and contemporary; the client-facing proposal must feel like a high-end wedding magazine rather than a SaaS pricing screen.

## Scope

- Vite, React, and TypeScript foundation with minimal dependencies.
- Typed proposal data model and separate demo data.
- Live editor for couple, general information, two wedding events, and their services.
- Three fixed-composition 9:16 proposal pages: cover, wedding days, and investment.
- Desktop split view and mobile Edit/Preview tabs.
- Solis Studio white logo on dark imagery.
- VND formatting and calculated service total.

Out of scope: persistence, authentication, backend, uploads, automatic travel/time pricing, exports, deployment, AI, add/remove/reorder controls, and Milestone B work.

## Architecture

`App` owns the in-memory `Proposal` state and passes narrow update callbacks to editor sections. Proposal pages consume the same state as pure render components. Editor and proposal styles use separate roots and stylesheets; proposal pages render at a fixed 1080×1920 coordinate system and are scaled as whole units by a frame component.

## Visual System

The editor uses a compact clean sans-serif productivity system. The proposal uses warm paper, charcoal, restrained muted gold, editorial serif typography, hairline rules, large type, asymmetric whitespace, and full-bleed photography. No gradients, decorative wedding clichés, SaaS cards, heavy shadows, or excessive rounding.

## Validation

Unit tests cover currency formatting, totals, and proposal updates. Production build must pass. The live app must be checked at 1440, 1280, 430, and 390 CSS-pixel widths without unwanted horizontal overflow.
