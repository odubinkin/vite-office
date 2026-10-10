# Observed Writer upstream cases requiring review

These observations come from the pinned LibreOffice baseline
`9bc445578031fecf56086729d8e4940c77e14d65` (`libreoffice-26.8.0.2`). They document
suspicious source conditions and their consequences. They are not confirmed
upstream defect reports: complete consumer invariants, history and intended
behavior have not been established.

The user explicitly requires reproducing upstream behavior. Recording a case
here does not authorize fixing it, normalizing it or changing defaults. Writer
retains the original defined behavior. Undefined native arithmetic or invalid
lifetimes are outside parity certification; no invented successful result is
assigned to them.

Each entry records original source, an initialized example or proof, evidence,
remaining uncertainty and the current implementation decision, following
[the shared observation format](upstream-suspected-issues.md). No upstream issue
was filed or external publication performed.

## WRITER-001: Hanging first-line setters replace relative left units with empty-context twips

Status: suspicious unit/context loss; original source expressions verified and
portable initialized examples reproduced. Complete native consumer invariants
and a compiled native differential result remain unverified.

Original [`SvxLRSpaceItem::SetTextFirstLineOffset`](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/editeng/source/items/frmitems.cxx#L738)
removes an old negative offset and adds a new negative offset by resolving both
measures with an empty `SvxFontUnitMetrics` context and assigning a fresh
`SvxIndentValue::twips` to the stored left margin. Original
[`SetTextLeft`](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/editeng/source/items/frmitems.cxx#L775)
performs the same empty-context addition when the first-line offset is negative.
[`GetTextLeft`](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/editeng/source/items/frmitems.cxx#L862)
returns a newly resolved twip measure in that hanging-offset case. A font-relative
left value can therefore lose both its original unit and its font-dependent
contribution before a later layout receives initialized font metrics.

Initialized example: set text-left to `2 FONT_EM`, then first-line to
`-1 FONT_CJK_ADVANCE`. Empty metrics resolve both font contributions to zero;
the stored left margin and returned text-left value become `0 TWIP`.
With subsequently supplied metrics `em=100`, `ic=200`, first-line resolves to
`-200` and `ResolveTextLeft` returns `200` through its original subtraction,
while `GetTextLeft` still returns the empty-context `0 TWIP`. The original
first-line measure retains its `-1 FONT_CJK_ADVANCE` unit/value.

A second initialized example starts with left `200 TWIP`, right `70 TWIP` and
first-line `-30 TWIP`; stored left is `170 TWIP`. Applying the published
text-left unit member15 with `2.5 FONT_EM` changes stored left to `-30 TWIP`
and subsequent text-left resolution to zero, even with `em=120`. Applying the
right unit member14 instead retains the stored left `170 TWIP` and resolves
right to `300` with those metrics. This distinction is separate from the
locally corrected swapped member IDs; the ID swap was a port defect, not an
upstream suspected issue.

Evidence: exact pinned `frmitems.cxx` definitions and original metrics/unit
contracts in `include/editeng/lrspitem.hxx`; existing
[`native-lr-font-units.test.ts`](../../apps/office/src/editeng/source/items/native-lr-font-units.test.ts)
case `negative relative first line retains native empty-context conversion
while explicit metrics resolve it`, plus the independent initialized
hanging-side examples in
[`native-lr-member-routing.test.ts`](../../apps/office/src/sw/source/core/table/native-lr-member-routing.test.ts).
Task `202610101340-HB1SPN` records source hashes and upstream-absent acceptance.
These tests execute the portable implementation, not pinned upstream code.

Complete native callers may constrain LR items to absolute units when using
hanging indentation; the separate paragraph text-left/first-line item classes
also provide other layout contracts. Those invariants and historical intent
remain unreviewed. Decision: preserve the empty-context resolution, setter
order, twip reassignment and getter distinction. Do not retain a relative unit,
substitute later font metrics or normalize the original behavior.

## Recording future observations

Add a stable `WRITER-###` case ID, pinned source location, original condition,
concrete defined result or a clearly labelled source proof, existing acceptance
evidence, consumer uncertainty and the preservation decision. Update an entry
when stronger evidence arrives. An unusual source expression is sufficient for
an observation, not sufficient for a confirmed defect classification or an
implementation change.
