# Milestone B2 — Hero Image Editor

**Goal:** Local image selection, nondestructive drag reposition and zoom in the approved Hero frame.
**Architecture:** Proposal.heroImage is serializable crop data. Pure crop utilities calculate cover geometry, clamp values and map pointer movement. PositionedImage renders the same geometry in Hero and Editor. useLocalHeroImage owns object URLs, decoding, validation and cleanup outside Proposal JSON.
**Spec:** User B2 brief in attachment 35e608fa-4a3d-4307-9f5d-02f421eb7a60.

## Tasks
1. Write/run failing crop utility and image editor tests: cover geometry, drag/clamp, zoom bounds, serialization, file validation, replace/reset/remove and URL cleanup.
2. Add HeroImage model/defaults and immutable hook update. Implement shared deterministic geometry and PositionedImage, retaining default cover composition.
3. Add HeroImageEditor after existing sections: local file picker, 4:3 pointer crop frame, keyboard arrow support, labeled zoom slider, reset/replace/remove, inline error/large-file warning. Decode before acceptance; revoke rejected/replaced/pending/unmounted URLs; last selection wins.
4. Run all tests/build, independent review, desktop/mobile visual/crop checks, compare default Proposal with B1; leave localhost running.

## Constraints
- No commit/push/B3, new packages, persistence, server upload, image re-encoding or original-file modifications.
- Hero/quote typography, gradients, frame and existing Editor sections stay unchanged.
- positionX/Y clamp 0–100; zoom 1–2.5. Default/reset 50/50/1.
- Drag translates screen movement into normalized coordinates based on scaled image overflow. No overflow on an axis means no movement on that axis.
- B4 may substitute storage behind the src string; blob URLs are session-only for B2.

## Review focus
- Invalid/corrupt images retain the previous crop.
- Image selection races/unmount do not leak URLs or apply stale results.
- CSS percentage geometry reproduces the same composition at different frame sizes.
- Pointer moves respect real overflow and never expose blank edges.
- Default crop matches B1.

## Completion
- Data, shared renderer, local resource hook and controls implemented; old unused ProposalImage replaced by PositionedImage.
- 54 tests pass, build passes; all 41 prior tests retained.
- Independent review found one source-change/drag race. Added a failing regression test, canceled stale drags, then verified the full suite green.
- Browser tested real PNG selection and matching Hero/Editor styles during drag/zoom/reset; mobile 375/390/430; default 78-element geometry/styles comparison against B1 matches.
- Default image restored, viewport reset, localhost 5173 running. No commit/push/B3.
