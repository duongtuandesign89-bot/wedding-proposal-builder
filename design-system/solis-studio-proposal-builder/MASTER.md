# Solis Studio Proposal Builder — Design System

This project-specific system overrides generic wedding-app recommendations. The approved brief explicitly rejects traditional pink, script-heavy and ornamental wedding styling.

## Product split

- Editor: clean, calm productivity interface with compact sans-serif labels and accessible form controls.
- Proposal: one continuous luxury editorial document with serif display type, whitespace, hairline dividers and photography. Desktop scales a 1080px logical composition. Mobile (<=900px) uses responsive quote content at native CSS size; the hero alone retains its independently scaled 1080 × 810px composition. No pagination or card UI. Future export output is a separate concern.
- Keep both CSS systems namespaced and visually independent.

## Palette

| Token | Value | Role |
|---|---:|---|
| Warm Ivory | `#F3EFE7` | Quiet background |
| Paper | `#FAF8F3` | Proposal and editor surface |
| Charcoal | `#171714` | Primary ink |
| Warm Black | `#11110F` | Dark editorial fields |
| Muted Gold | `#A98C59` | Restrained accent only |
| Taupe | `#A69C8D` | Secondary metadata |

## Typography

- Proposal cover display: Bodoni Moda (400), high-contrast fashion-editorial serif. Content/customer serif and Vietnamese display fallback: Lora (400).
- Proposal body: Inter (400/500), with Arial fallback.
- Editor UI: DM Sans with Arial fallback, independent of Proposal styling.
- Do not use script typefaces.
- Fixed 4:3 hero (1080 × 810 logical pixels), independent of content length. Cover title overlays the image at 106 logical pixels with .88 line-height. Couple issue caption is 48 logical pixels, reducing to 32px for long names and wrapping safely. UI fields remain unchanged.
- Desktop quote: section label 20px/500, number 17px/500, Lora title 36px/400, Inter metadata 18px/400, services/prices 22px/400, total label 18px/500, Bodoni total 62px/400, VND 16px. Service rows have 16px vertical gap and 32px column gap; divider spacing is 40px before/48px after.
- Mobile quote CSS sizes: section label 11.5px, number 10px, Lora title 23px, metadata 12.5px, services/prices 16px, Bodoni total 44px and VND 11px. Body weight 400, label weight 500. Preserve editorial rows and no-wrap prices, allowing genuinely long names to wrap. Do not reflow hero composition.

## Interaction and accessibility

- Use controlled React state and native form semantics.
- Touch targets are at least 44px; focus rings remain visible.
- Mobile uses explicit Edit/Preview buttons, not swipe-only navigation.
- Respect `prefers-reduced-motion`; avoid decorative animation.
- Preserve readable contrast and prevent horizontal overflow from long content.

## Avoid

Pink wedding palettes, decorative gradients, glassmorphism, neon, heavy shadows, generic SaaS cards, heart/floral clichés, over-rounded controls and decorative icons. A localized light left-side photo gradient and charcoal edge transition are allowed for legibility and continuity; no text boxes or uniform dark photo overlay.
