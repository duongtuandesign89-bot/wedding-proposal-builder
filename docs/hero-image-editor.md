# Milestone B2 — Hero Image Editor

`Proposal.heroImage` is `{ src: string, positionX: number, positionY: number, zoom: number }`. Position clamps to 0–100; zoom clamps to 1–2.5; reset uses 50/50/1. File and native dimensions are not included in Proposal JSON.

`heroCrop.ts` defines pure deterministic geometry: the image first covers the frame with preserved aspect ratio, then scales by zoom. Offsets are `-(scaled size - frame size) × position / 100`. Drag converts screen deltas to normalized positions using the image's overflow; an axis without overflow does not move. All edges remain covered.

`PositionedImage` reads natural image dimensions and renders that geometry with percentages. Both HeroSection and HeroImageEditor use this component at a 4:3 aspect ratio. The initial image-loading fallback uses cover/object-position with the same crop origin. No bitmap/canvas generation or image re-encoding occurs.

`useLocalHeroImage` owns local browser resources: validates JPEG/PNG/WEBP, creates one object URL per selection, verifies browser decoding, applies only the latest request, and revokes rejected/replaced/removed/pending/unmounted URLs. Large files (>30 MiB) receive a warning after successful decoding. Invalid files leave the current image intact. Future storage can replace this hook while preserving the serializable crop model and renderer; blob URLs are session-only in B2.

HeroImageEditor uses Pointer Events/capture for mouse and touch, with grab/grabbing cursors and touch-action none on the crop frame. Arrow keys move the image; Shift increases the step. Zoom has a labeled native slider. Reset keeps the current src; remove restores the default image. Replacement resets crop. A source change cancels any previous drag.

Verification: 54 tests pass (all 41 A/B1 tests retained), build passes, real PNG file selection/desktop drag/zoom/reset/remove verified in-browser, mobile 375/390/430 checks show correct 4:3 frames and no overflow. Default Proposal's 78-element geometry/colors/typography/spacing matches checkpoint B1. Native touch hardware and 20–30MP performance were not benchmarked.
