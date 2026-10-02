# Continuous proposal architecture

This revision supersedes the three-page 9:16 design in the original Milestone A spec and plan.

`ProposalPreview` contains the editor-facing toolbar and `ProposalScaleFrame`. On desktop, the frame scales the 1080px composition to available width. At viewport widths <=900px, it uses scale 1 and the quote content flows at native CSS size. ResizeObserver tracks content height, editing, font loading and mobile tab switching; matchMedia updates the sizing mode at the breakpoint.

`ProposalDocument` owns the single `#proposal-document` root. It is 1080 logical pixels wide on desktop and fills its container on mobile, with automatic height. HeroSection separately scales its unchanged 1080 × 810px composition to its container. Future export sizing will be handled separately. No toolbar or editor controls are inside the document. Sections are ordered as follows:

1. HeroSection: stable 4:3 full-bleed editorial photo canvas with overlaid studio identity, issue label, thin three-line headline and small photography label. Couple/date/location caption is inside the lower-left of the cover, with no separate repeated introduction.
2. No separate introduction or repeated wedding information: this document confirms final costs.
3. EventSection repeated from proposal.events: event details and its services/prices.
4. InvestmentSection: total calculated from all services.
5. TermsSection: existing notes, rendered only when nonempty; no invented contractual text.
6. FooterSection: studio identity only. Marketing slogans and service descriptions are omitted from the confirmation layout; descriptions remain in the data model.

There is no pagination, fixed document height, page aspect ratio or page indicator. More events/services/notes in the data extend the same document. No new editor controls, export functionality or storage have been introduced.

Art direction: near-black content, Bodoni Moda 400 display headline (106px, .88 line-height, -.02em tracking) and investment number (62px desktop, 44px mobile); Lora customer names/content serif and Inter body text. Lora is also the Vietnamese glyph fallback for editable display titles. Hero is 1080 × 810 logical pixels regardless of document content length. The former 20% sizing observer/helper and its obsolete tests are removed. ProposalImage still accepts src, alt, positionX, positionY and zoom; the hero uses 50% 50%, zoom 1.

Desktop quote typography: Lora event titles 36px/400, Inter metadata 18px/400, services/prices 22px/400, section label 20px/500, total label 18px/500, VND 16px. Spacing: title-to-metadata 16px, metadata-to-services 30px, rows 16px, list-to-divider 40px, divider-to-event 48px. Mobile quote typography uses actual CSS sizes: event titles 23px, metadata 12.5px, services/prices 16px, section and total labels 11.5px, VND 11px. Service grids retain left names/right prices with 16px mobile column gap; prices never wrap, long names may wrap. Hero art direction and composition remain unchanged.

Local placeholder: `public/assets/solis-wedding-details-cover.png`, generated with the built-in imagegen tool. Existing photographs are preserved. Prompt:

> Use case: photorealistic-natural. Asset type: local illustrative hero background for luxury wedding proposal magazine, landscape aspect ratio 4:3. Primary request: refined wedding-detail photograph, no faces or visible people. Composition: right third and lower-right contains a small natural ivory rose and calla lily wedding bouquet resting on ivory silk wedding gown fabric with sheer veil draped softly, on a warm muted taupe stone bench in an architectural interior. Bouquet and fabric together are the only focal subject, beautifully lit, realistic high-end wedding editorial. Left 60% and upper-left are uninterrupted simple dark warm taupe plaster/stone wall with soft subtle light and clean negative space for ivory typography to be added in CSS. Left lower region also calm for customer caption. Mood: tasteful film photography, rich warm charcoal shadows, ivory silk luminous but no blown highlights, no dramatic vignette or uniform black overlay. Avoid: people, faces, hands, lettering, watermark, logos, graphics, ornate decorations. No text.

Verification: 15 tests pass; production build passes. Hero measures 1080 × 810px on desktop and mobile; long Vietnamese couple names reduce to 32px and wrap without horizontal overflow.
