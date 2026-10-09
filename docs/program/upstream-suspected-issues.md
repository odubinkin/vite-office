# Observed upstream cases requiring review

These observations come from the pinned LibreOffice baseline
`9bc445578031fecf56086729d8e4940c77e14d65` (`libreoffice-26.8.0.2`). They document
suspicious source conditions and their consequences. They are not confirmed
upstream defect reports: complete consumer invariants, history and intended
behavior have not been established.

The user explicitly requires reproducing upstream behavior. Recording a case
here does not authorize fixing it, normalizing it or changing defaults. Calc
retains the original defined behavior. Undefined native arithmetic is outside
parity certification; it is not assigned invented wrap or saturation semantics.

Each entry records original source, an initialized example or proof, evidence,
remaining uncertainty and the current implementation decision. No upstream
issue was filed or external publication performed.

## CALC-001: Top-edge deletion trims from the deleting start

Status: suspicious condition; native output reproduced.

[Original `handleOneRange`](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sc/source/core/tool/rangelst.cxx#L572)
sets the surviving start row to `nDeleteRow1 + 1` when the deletion covers the
entry's column span and starts at or above its first row. It does not use the
deleting end row in this assignment.

Example: entry columns 2..5, rows 2..5, sheet 0; delete the same columns and
rows 2..4. The surviving native range starts at row 3 and ends at row 5, so it
still contains rows within the deleting area. Ordinary rectangle subtraction
would leave row 5 alone; the operation's upstream consumer context remains to
be reviewed.

Evidence: unchanged native fragment helpers in
[the range-list probe](../../scripts/calc-rangelst-native-probe.mjs), committed
`native-range-list-cases.json` and
[portable range-list acceptance](../../apps/office/src/sc/source/core/tool/rangelst.test.ts).
Decision: preserve the original start-plus-one result.

## CALC-002: A second deletion overwrites the first change result

Status: suspicious result contract under a diagnosed input combination;
native output and independent literal test reproduced.

[Original `ScRangeList::UpdateReference`](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sc/source/core/tool/rangelst.cxx#L375)
assigns `bChanged` from column deletion, then assigns it again from row deletion.
With two negative displacements, the second false result can erase a first true
result. The source emits `SAL_WARN_IF` for that combination, suggesting callers
may normally avoid it.

Example: list entries `(2,3,0)..(2,3,0)` and `(0,0,0)..(0,0,0)`; affected area
`(3,3,0)..(7,9,0)`; column and row displacement both -1. The first entry is
removed, the remaining entry is unchanged, and the final return is false.
Subsequent scalar updates can set the result back to true; complete deletion
also returns true through a separate path.

Evidence: [native pipeline probe](../../scripts/calc-rangelist-update-native-probe.mjs)
and literal test `preserves deletion-result overwrite and native backward joins
independent of changed` in
[range-list update acceptance](../../apps/office/src/sc/source/core/tool/rangelist-update.test.ts).
Decision: retain overwrite order and the original return value.

## CALC-003: Right-column pair joining compares data ends

Status: suspicious asymmetric predicate; native merge and nonmerge reproduced.

[Original `ScRangePairList::Join`](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sc/source/core/tool/rangelst.cxx#L1467)
compares the receiving label end with input label start minus one, but compares
the receiving **data end** with input **data end minus one**. Other directional
conditions use the expected opposite corner for the corresponding adjacency.

Example, sheet 0: receiving label columns 1..3, rows 1..3 and data columns 7..9,
rows 10..12. Input label columns 4..6 with the same rows and data columns 8..10
with the same data rows. Native output is one pair: label columns 1..6 and data
columns 7..10. Data ranges overlap. An otherwise parallel input data range
10..12 does not merge, because 9 is not 12 minus one.

Evidence: [unchanged native pair probe](../../scripts/calc-rangepair-native-probe.mjs)
and literal asymmetric merge/nonmerge checks in
[paired-range acceptance](../../apps/office/src/sc/source/core/tool/rangepair.test.ts).
The complete label-range dialog/compiler expectations remain unverified.
Decision: retain the input-end-minus-one predicate; no adjacency normalization.

## CALC-004: Later-source pair joining asserts after finding the source

Status: unconditional diagnostic on an initialized borrowed-source path;
release behavior reproduced; debug assertion enforcement not ported.

[Original `ScRangePairList::Join`](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sc/source/core/tool/rangelst.cxx#L1486)
searches for the borrowed source when the ascending scan has not encountered
its position yet. Even if that search finds and erases the source, execution
reaches `assert(false)` after the search loop.

Example: duplicate pairs in list positions 0 and 1; call `Join(list[1], true)`.
The receiving entry at position 0 can contain the later source. The search
locates position 1, removes it and still reaches the assertion. With `NDEBUG`,
execution restarts and retains the merged result.

Evidence: the pair probe compiles the unchanged body explicitly with `NDEBUG`
and ASan/UBSan; borrowed-source positions and duplicate restarts are included
in its portable sequences. The original debug diagnostic is a source-level
fact; full debug execution and caller reachability are not certified.
Decision: preserve native release values and restart order; record the diagnostic
rather than introduce a replacement runtime assertion policy.

## CALC-005: Insertion overlap uses an OR predicate

Status: suspicious overlap predicate; original numerical sequences reproduced.

[Original `ScRangeList::InsertRow`](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sc/source/core/tool/rangelst.cxx#L445)
uses `start <= entryEnd || end >= entryStart` for column overlap. Column insertion
uses the analogous row predicate. For independently ordered but disjoint spans,
that OR can be true. The following max/min intersection can then construct a
range with reversed endpoints; the numeric six-coordinate constructor preserves
that order.

Example: entry columns 1..4, rows 1..4, sheet 0; insert one row at row 5 over
columns 6..8. The predicate passes and the constructed new fragment has columns
6..4, row 5. Full callers may constrain insertion spans to avoid this combination;
that invariant has not been established.

Evidence: unchanged insertion bodies and disjoint-span profiles in the range-list
probe and its committed fixture, compared by range-list acceptance.
Decision: retain the OR predicate and raw endpoint construction.

## CALC-006: Signed64 movement checks overflow and then adds anyway

Status: potential undefined-arithmetic hazard; source-level proof only for the
overflowing domain. Reachability from valid document consumers is unverified.

[Original `lcl_MoveItCutBig`](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sc/source/core/tool/refupdat.cxx#L180)
computes an overflow flag with `lcl_IsWrapBig`, then unconditionally performs
signed64 `rRef += nDelta`. For example, signed64 maximum plus 1 crosses the
native signed domain even though the flag is true. `lcl_MoveBig` separately
protects positive insertion overflow but leaves negative underflow unguarded.
Whole-axis sentinel pairs are protected by the caller; this observation does
not establish a valid workbook scenario reaching the overflow.

Evidence: exact original helper bodies and defined-input admission rules in
[the signed64 probe](../../scripts/calc-bigrefupdate-native-probe.mjs), plus
[defined signed64 acceptance](../../apps/office/src/sc/source/core/tool/big-refupdate.test.ts).
Overflowing calls are excluded from its native differential certification.
Decision: retain defined native arithmetic and guards, do not claim a result
for native signed overflow, and do not invent wrap or additional saturation.

## Reviewed API distinctions

These distinctions have been discussed but are not classified as defects:

- `ScAddress::IsValid` checks only nonnegative coordinates. Document-bound
  helpers perform other validity checks. The different contracts are original.
- `ScAddress::Move` uses `GetTableCount()` as an inclusive limit and tests
  `dz > nMaxTab`. This can accept a position equal to table count. Some other
  document APIs use count as an exclusive limit; consumer intent for movement
  still needs review. [Original movement](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sc/source/core/tool/address.cxx#L2378)
  and existing address/native tests preserve this contract.
- Range construction from two address objects orders axes; numerical
  six-coordinate construction preserves raw order. The overload distinction
  is explicit in the original constructors.

## Recording future observations

Add a stable case ID, pinned source location, original condition, concrete
native result or a clearly labelled proof, existing test/probe evidence,
consumer uncertainty and the preservation decision. Update an entry when
stronger evidence arrives. A source expression that looks unusual is sufficient
for an observation, not sufficient for a confirmed defect classification or an
implementation change.
