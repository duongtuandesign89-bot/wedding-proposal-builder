# Milestone B1 — Dynamic quote editor

`App` consumes `useProposalEditor`, which owns the serializable Proposal state. Functional state updates use stable IDs and immutable array/object copies. Event/service/adjustment IDs are generated once when adding, using crypto.randomUUID with a timestamp/counter fallback.

Data additions: `Proposal.adjustments: Adjustment[]`, where Adjustment is `{ id, name, amount: number }`. Existing `events[].services[]` now has full editing operations including optional description. Collapse and delete-confirmation states belong to keyed EventEditor components, never to Proposal data.

`calculateProposalTotal(proposal)` derives `sum(events[].services[].price) + sum(adjustments[].amount)`. Services remain nonnegative; adjustments and totals can be signed. No separately stored total. AmountField keeps temporary editing text (including a lone minus) outside Proposal and updates numeric values live; blur restores thousands separators. Empty/invalid numeric input becomes zero.

Event actions: add, edit, confirmed delete, up/down, collapse/expand. Service actions: add (focus new name), edit name/optional description/price, immediate delete. Adjustment actions: add/edit/delete with signed amounts. All are in-memory and live; refresh restores demo data, as persistence is outside B1.

Proposal keeps A's Hero and responsive composition. Optional descriptions reuse secondary metadata typography; adjustments reuse service row/grid tokens before total. Empty sections and metadata are omitted. Previously hidden demo descriptions are blank so the initial preview retains A's approved visual.

Verification: 41 tests (including all 15 A tests), production build, 375/390/430px browser checks and default-preview geometry/style comparison against checkpoint c7ead02.
