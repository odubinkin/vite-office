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

## CALC-007: row-mark Shift retains collapsed boundaries and reversed intervals

- Source: [`ScMarkArray::Shift`](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sc/source/core/data/markarr.cxx)
  and `ScMarkArrayIter::Next` in the same file; original `ScMarkEntry` signed30
  boundary is declared in `sc/inc/markarr.hxx`.
- Observation: Shift modifies each boundary independently and clamps it after
  signed30 assignment. It does not remove duplicate boundaries or normalize
  alternating marked/unmarked entries.
- Reproduction: with inclusive maximum row 7, mark rows 2 through 4, then call
  `Shift(0, -20)`. Original stored entries become `(0,false)`, `(0,true)`,
  `(0,false)`. `HasMarks()` remains true, `HasOneMark()` returns `[1,0]`, and the
  iterator yields the reversed selected interval `[1,0]`.
- Related boundary detail: starting with all rows selected and shifting by
  `536870912`, the signed30 field narrows before the clamp and the ending row
  becomes 0. This field-width behavior is source-defined on the compared native
  compiler; it is not a normalization repair opportunity.
- Evidence: complete unchanged original classes/methods compile with debug
  assertions and ASan/UBSan. Portable [native sequences](../../apps/office/src/sc/source/core/data/native-mark-array-cases.json),
  [comparison and literal Shift test](../../apps/office/src/sc/source/core/data/markarr.test.ts)
  and [native probe](../../scripts/calc-markarr-native-probe.mjs) preserve these
  results. `ScMultiSel::ShiftRows` is an original caller in
  `sc/source/core/data/markmulti.cxx`.
- Assessment: confirmed source outcome, suspected edge case. Whether consumers
  prevent these displacements or tolerate collapsed intervals is not yet
  established; this is not a confirmed user-visible defect.
- Decision: retain the original field width, clipping order, duplicate
  boundaries, queries and iterator outputs. Do not normalize or fix upstream.

## CALC-008: Clipping admits a zero-length interval at the minimum border

Status: original debug assertion reproduced; undefined access outside parity
certification, not a confirmed user-visible defect.

The pinned external mdds3.2.1 `flat_segment_tree_def.inl:838`
`adjust_segment_range` rejects `end_key < min`, using a strict comparison, before
clipping the start. For bounds `[0,8)`, `insert_front(-1,0,1)` passes the initial
`end > start` check, then clips to `[0,0)`. In `insert_to_pos`, start/end positions
refer to the same left node, but removal starts at its next node. The original
path eventually dereferences a null intrusive pointer.

Evidence: `scripts/mdds-flat-segment-native-probe.mjs --suspected-clipping`
executes genuine source-verified mdds/Boost headers with debug assertions and
sanitizers. Boost reports `Assertion failed: (px != 0)` in `intrusive_ptr.hpp`.
The optional diagnostic log stays under ignored `output/playwright/mdds-native`.
The exact archive/patch/header hashes are in the committed native fixture.

Calc callers may already exclude such outside-border intervals; their complete
invariants remain unreviewed. Decision: preserve the original strict guard and
clipping order. Do not add a zero-span fix or certify an invented native outcome
for this undefined path.

## CALC-009: Hinted search overloads handle unusable hints differently

Status: source condition and defined native outputs reproduced; intent uncertain.

In original mdds3.2.1 `flat_segment_tree_def.inl:595-602`, key-only hinted search
passes `pos.get_pos()` directly to `search_by_key_impl`. The value-output overload
checks null/foreign hints and a hint positioned past the query, then falls back
to the first leaf. The key-only overload's header documentation describes the
same fallback, but its implementation differs.

Example: tree `[0,8)` with initial value9; query2 with a default null iterator.
Key-only search returns end, while value-output search succeeds with9. With a
live foreign tree of the same bounds and initial value42, key-only search reads
42 from that foreign leaf, while value-output search succeeds with9. Both
examples use initialized live owners; no dangling pointer is involved.

Evidence: every portable native snapshot compares both hinted overload families,
including default, local, past-query and foreign hints; independent literal
assertions are in `external/mdds/include/mdds/flat_segment_tree.test.ts`.
Consumer hint ownership requirements and historical intent remain unreviewed.
Decision: preserve the overload distinction and foreign-hint observations.

## CALC-010: A single source can hide multiple intervals in the other source

Status: original defined output reproduced; consumer intent unreviewed.

Pinned `sc/source/core/data/markmulti.cxx:72` `HasOneMark` tests each source
independently and enters its success path when either source has one mark. It
does not require an unsuccessful source to have no marks. With maximum row7,
global rows2..3 and separate column1 marks at rows0 and6, it returns true with
rows2..3, although `GetMark(1,0)` and `GetMark(1,6)` are also true.

The native fixture and independent `retains raw Set bounds and HasOneMark source
distinctions` test in `markmulti.test.ts` retain all results. Whether upstream
callers exclude mixed single/multiple sources remains unknown. Decision: preserve
the original OR predicate and output rows.

## CALC-011: Missing-column start scanning compares existing arrays with row marks

Status: original defined distinction reproduced; intended meaning uncertain.

`GetStartOfEqualColumns` in pinned `markmulti.cxx:157` compares an existing
column against `aRowSel` when the last column has no storage. `HasEqualRowsMarked`
instead compares a missing column with the existing column's absent marks.
Allocate unmarked columns0..2 by deselecting columns1..2, then mark global
rows2..3. `HasEqualRowsMarked(2,3)` is true, while
`GetStartOfEqualColumns(3,0)` returns3. Existing and missing columns have the same
visible global row marks, but their raw comparison paths differ.

Native observations and the independent missing-column test retain this case.
Complete consumer requirements and historical intent remain unreviewed.
Decision: preserve both original comparison paths.

## CALC-012: Bulk Set single-mark bounds can exceed the stored marked interval

Status: original defined output reproduced; not a confirmed user-visible defect.

`ScMultiSel::Set` in pinned `markmulti.cxx:264` omits an unmarked terminal
entry. With maximum row7 and a range selecting column1 rows2..4, raw entries
are `(1,false),(4,true)`. `ScMarkArray::HasOneMark` interprets that two-entry
shape as ending at the sheet maximum and reports `[2,7]`. The multi-selection
iterator reports `[2,4]`, and `GetMark(1,5)` is false.

The native fixture and independent raw-Set test retain these differing outputs.
Consumer assumptions after the optimized initializer need review. Decision:
retain original raw storage and predicates; do not append a terminal or repair
`HasOneMark`.

## CALC-013: Column deletion extending past storage retains its last entry

Status: original defined boundary reproduced; caller restrictions unreviewed.

Pinned `markmulti.cxx:354` `ShiftCols` limits a deletion reaching the vector
end to `size - start - 1`. With maximum column5, mark columns1..3 at rows2..4,
then `ShiftCols(1,-20)`. The vector loses two entries and retains original
column3 at column1. Selection count becomes1, `GetMark(1,3)` stays true, and
`GetMultiSelArray(2)` is null.

Unchanged native shift bodies and the independent trailing-deletion test retain
this case. A trailing reserved-entry convention or restrictions on deletion
offsets have not been established. Decision: preserve the count and trailing
value; do not change the native expression.

## CALC-014: Selected-tab self-move aborts inside the compared native library

Status: native libc++220106 sanitizer failure; not a portable LibreOffice defect
classification or a defined-outcome parity claim.

Pinned `markdata.cxx:62` move assignment assigns `maTabMarked` from its moved
source. Construct a selection with explicit bounds, select sheet0, then assign
it from `std::move` of itself. On the compared libc++220106 runtime, ASan reports
heap-use-after-free in `std::__tree::__move_assign`, called by original
`ScMarkData::operator=(ScMarkData&&)`. The original owner and library methods are
unchanged. This concerns self-aliasing and library implementation; caller use
and results on other standard libraries remain unreviewed.

The research probe provides a separate `--self-move-diagnostic` mode. Defined
portable fixtures use distinct-owner moves; the sanitizer diagnostic is retained
separately instead of inventing a successful native result. Decision: retain the
original move expressions; no upstream self-move guard or library repair is added.

## CALC-015: A previous empty column can affect later occupied-column envelopes

Status: original initialized output reproduced; consumer intent unreviewed.

Pinned `markdata.cxx:701` `GetSelectionCover` sets `bPrevColUnMarked` true at
line853 and does not reset it when subsequent columns are marked. With explicit
maximum column5/row7, mark column1 rows2..4 and columns3..4 rows2..4. The left
envelope contains column3 rows2..4 even though those cells are selected. The
right envelope also contains selected column4 rows2..4: the skipped previous-row
comparison leaves its cursor at the original start for the final scan.

The complete unchanged native fixture retains cover `[0,1,0,5,5,0]`, left ranges
at columns0,2,3 and right ranges at columns2,4,5, all at rows2..4. The independent
portable test also checks actual cell marks. Decision: preserve original flag
lifetime and scan conditions; no reset or envelope normalization is introduced.

## CALC-016: Repeated cover generation appends existing envelopes

Status: original repeated-call output reproduced; caller lifecycle unreviewed.

`GetSelectionCover` in pinned `markdata.cxx:701` appends envelope ranges without
clearing its four list owners. With simple columns1..3/rows2..4, calling it twice
stores the same top range twice. `ResetMark` clears the envelope lists while
retaining selected sheets and stored rectangle values. The original consumers
may ensure a reset before each cover; that requirement has not been established.

Repeated calls are retained in the complete native sequences and an independent
borrowed-envelope test. Decision: preserve accumulation and original reset
responsibilities; no implicit clear is added to cover generation.

## CALC-017: Conditional numerical update ignores failed range lookup

Status: source observation only; caller preconditions unreviewed, no defined
native outcome or confirmed user-visible defect classification.

Pinned `segmenttree.cxx:105` `ScFlatSegmentsImpl::setValueIf` constructs a local
uninitialized RangeData and ignores the boolean result of `getRangeData` before
reading its value and last-position fields. For an initial row outside the
owner domain, lookup can return false without initializing those fields. The
subsequent predicate and cursor advance would read uninitialized native data.
The loop also uses the original cached segment endpoint after a predicate call;
arbitrary reentrant mutation requirements have not been established.

The unchanged source groups and numeric probe retain the original condition.
Defined comparisons use valid initial lookup positions or a vacuous reversed
interval; predicate call order is retained and compared. No sanitizer result is
claimed for uninitialized reads, and no successful malformed-input result is
invented. JS scratch fields only select mutable-output reference overloads;
invalid native inputs are not certified. Decision: preserve the original
precondition and ignored result; do not add clipping, lookup fallback or guard
behavior without a separate explicit upstream-deviation decision.

## CALC-018: Out-of-domain range bit update can make no cursor progress

Status: reproducible original non-progress loop; caller preconditions unreviewed,
no complete Calc consumer defect classification or successful result assigned.

Pinned `compressedarray.cxx:314` AndValue and `:340` OrValue use Search's last
entry fallback for a starting position after the maximum. On an array max7,
AndValue(8,8,NONE) with tail3 or OrValue(8,8,Hidden) with tail0 enters the changed
value branch, computes start8/end7, and calls SetValue(8,7,...). SetValue rejects
that range, then Search(end+1), Search(8), returns the same entry. No state or
cursor advances, so the loop repeats indefinitely. This source condition is
preserved in TypeScript and in the complete unchanged native groups.

Each genuine original call is isolated in a separate process; a 1000ms timeout
terminates the owned diagnostic process and records ETIMEDOUT/SIGTERM. The source
trace establishes non-progress; the timeout alone is not a general termination
proof. Defined successful fixtures use valid initial positions or vacuous ranges.
Decision: retain the original precondition and loop; no clipping, bailout or
fallback guard is added. Wider caller validation remains to be reviewed.

## CALC-019: Ordinary preserving-size removal leaves its fill argument unused

Status: source observation confirmed by defined unchanged native sequences;
caller intent and user-visible defect classification unreviewed.

Pinned `compressedarray.cxx:283` RemovePreservingSize records GetLastPos, calls
Remove, then passes the endpoint difference into InsertPreservingSize. Remove
always restores the terminal endpoint to nMaxAccess (`:279`). For ordinary
initialized owners whose previous endpoint equals nMaxAccess, that difference
is zero. InsertPreservingSize's fill loop is empty, so rFillValue is unused.
For max7/default3 with rows2..4 set8 and row5 set1, removing rows2..4
with fill0 leaves row2 as1 and rows3..7, including the tail, as3. The nominal
fill0 does not replace the tail. The independent test also retains the analogous
default1/fill15 result.

The complete native corpus and independent test retain that call order and exact
result. No implicit tail-fill or size correction is added. Unusual prior endpoint
states and broader column consumers are not certified by this observation.
Decision: preserve upstream behavior and record it for future consumer review.

## CALC-020 — mdds delayed vector swaps storage without front offsets

Pinned dependency: mdds3.2.1 from LibreOffice `download.lst` at the recorded
baseline. Original `include/mdds/multi_type_vector/delayed_delete_vector.hpp`,
lines 123-126, exchanges only `m_vec`. Single front erase (lines 159-163)
increments `m_front_offset`, which is not exchanged by swap.

For original uint16 owners `[1,2,3,4]` and `[7,8,9,10]`, erase the first
element of the first owner, then swap. The first owner's visible range becomes
`[8,9,10]`; the second exposes `[1,2,3,4]`, including the previously hidden
element. A borrowed iterator into the first backing vector follows that vector
to the second owner and can still mutate its scalar under native swap rules.
This is reproduced using complete unchanged genuine headers under ASan/UBSan
in `scripts/mdds-delayed-vector-native-probe.mjs`; the committed fixture and
independent delayed-vector test retain both results.

If a retained offset exceeds the received vector size, the original unsigned
size subtraction and iterator arithmetic require separate undefined-state
review. No successful result is assigned to that family here. Element-block
and column consumers have not yet been reviewed for equal-offset preconditions.
Decision: preserve original storage-only swap; do not exchange/reset offsets.

## CALC-021 — mdds bool block at reference cannot represent vector<bool> results

Pinned dependency: original mdds3.2.1 `multi_type_vector/types.hpp`, the const
and mutable `element_block::at` overloads. Both declare value_type references;
the default delayed bool store delegates to `std::vector<bool>::at`, whose
const result is a bool value and whose mutable result is a proxy.

Instantiating the original mutable bool overload is rejected by clang because
its bool lvalue reference cannot bind to the proxy conversion. The original
const overload returns a reference to a temporary; taking that address and
reading it after return reproduces ASan stack-use-after-return with genuine
unchanged headers. `scripts/mdds-element-block-native-probe.mjs --bool-at`
keeps the compiler rejection, compiler warning and sanitizer diagnostics in
separate ignored research logs. No successful result is assigned to either
family, and no native header/signature is changed.

Original `detail::get_block_element_at` detects vector<bool> stores and reads
via cbegin instead of at. Its actual container callers still require review.
Defined bool comparison therefore uses original iterators/get_value and leaves
the at reference and bool data-pointer families uncertified. The TS scalar
projection does not prove native reference/lifetime parity. Decision: retain
the original source responsibility and call boundaries; do not add a native
safe-reference rewrite or claim a value for the undefined call.

## CALC-022 — unknown block deletion can throw from a destructor path

Pinned mdds3.2.1 `multi_type_vector/block_funcs.hpp` keeps a TODO in
`element_block_funcs::delete_block`: the method is called from destructors
and should not throw, but its actual unknown-type lookup throws the same
`general_error` as the other dispatch methods. Null pointers return before
lookup. An actual original `default_element_block<77,double>` with a standard
registered dispatcher reproduces the exact original unknown-delete message;
no fake native class or destructor catch/suppression is added.

This establishes the dispatcher behavior, not a demonstrated Calc destructor
failure: valid registered block lifetime is its caller precondition, and actual
Calc/MTV destructor paths still require review. Decision: preserve the original
exception and null fast path; record the TODO without changing the contract.

## CALC-023 — input-end bounds follow unsigned arithmetic without overflow checks

Pinned mdds3.2.1 `multi_type_vector/util.hpp`, `calc_input_end_position`, assigns
std::distance to the supplied size type and calculates pos + length - 1 before
checking the result against total_size. With UInt64, pos=UINT64_MAX, length=2,
total_size=1 wraps to end_pos=0 and returns 0,true. A reversed original random
access range has a negative signed distance; assigning it to UInt64 can also
wrap into an apparently in-range end position. Empty input returns 0,false
before inspecting even an out-of-range insertion position.

The genuine unchanged native helper and borrowed iterators reproduce these
results. This documents helper arithmetic, not a demonstrated Calc corruption:
normal forward ranges and bounded logical positions are caller preconditions,
and actual Calc/MTV consumers still require review. Decision: preserve UInt64
wrap and empty-input ordering; do not introduce overflow/reversed-range guards.

## CALC-024 — mutable-to-const iterator construction reconstructs the cache

Status: confirmed original API distinction, not classified as a defect.
Pinned mdds3.2.1 `multi_type_vector/soa/iterator.hpp` lines324-328 converts
a mutable iterator by constructing the updater from the three borrowed array
cursors, parent and private index. It does not copy the mutable cached node.
The implicit same-type copy constructor does copy that cached node.

The unchanged native probe on real SoA containers modifies the mutable cached
node's type, position and size to42,99,55. Mutable copy retains those fields;
conversion reads the original array values. Original increment at end retains
the previous cache, while conversion at end starts with empty/zero/null public
fields. Equality at end ignores cached nodes. Native observations use get_node
for diagnostics; they do not assert legal end dereference or a defined end
private data, which iterator_node.hpp explicitly leaves undefined.

Evidence: scripts/mdds-iterator-native-probe.mjs, complete
soa/native-iterator-cases.json and the shared iterator.test.ts native-state
comparison. Consumer intent for mutable cache changes still needs review.
Decision: preserve copy/conversion/end distinctions; do not synchronize caches,
clear reached-end nodes or define the end private data.

## CALC-025 — internal block equality compares the left range prefix

Status: confirmed internal API distinction, not classified as a defect.
Pinned mdds3.2.1 soa/main_def.inl, default equal_blocks specialization, calls
the three-iterator std::equal overload. It compares lhs.begin..lhs.end against
the prefix starting at rhs.begin, and does not independently compare lengths.
An empty left block-pointer vector therefore compares equal to a nonempty right
vector. The original blocks_type::equals first checks positions, sizes and
element-block vector lengths; that owner still returns false for different
metadata lengths. A right range at least as long as the left is the helper
caller precondition; shorter invalid ranges receive no successful fixture result.

Evidence: unchanged private original owners and helper calls in
scripts/mdds-block-store-native-probe.mjs, complete native-block-store-cases.json
and shared soa/main.test.ts. Helper equality after clearing the left owner
returns true while blocks_type::equals returns false. Decision: preserve both
contracts and caller length checks; do not add an extra length guard or a fix.

## Reviewed API distinctions

These distinctions have been discussed but are not classified as defects:

- Original mdds `swap_values` exchanges each pair in forward order. For a
  single `[2,3,4]` block, swapping two elements starting at positions 0 and 1
  yields `[3,4,2]`; it does not snapshot overlapping whole ranges first.
  The unchanged native corpus and independent scalar-block test preserve this
  ordered alias behavior. Segment append/prepend acquire source iterators
  before reserving the destination; self-reserve can invalidate native source
  iterators and remains outside certified lifetime preconditions.

- mdds delayed vector `insert(iterator, const T&)` and
  `insert(const_iterator, T&&)` make a mutable-iterator/rvalue call ambiguous
  in the native compiler. The unchanged-header probe explicitly supplies a
  const value for the first overload and a const iterator for the second;
  both scalar results are retained. This is a compile-time overload distinction,
  not a runtime failure or an upstream repair.

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
- `ScFlatBoolRowSegments::RangeIterator` borrows the implementation's `maItr`.
  Two range iterators share their position, and `getRangeData` searches replace
  that same hint. A query can therefore change the next interval returned by an
  existing iterator. `ForwardIterator` separately caches its value/end and does
  not invalidate the cache on owner mutation. These are confirmed original
  mechanisms, not classified as defects: pinned `segmenttree.cxx` definitions
  at lines 140-165, 302-329 and 370-423 retain the state interactions. The
  portable 436 native sequences and independent cache/cursor tests in
  `sc/source/core/data/segmenttree.test.ts` preserve them. Complete consumer
  mutation/iteration requirements still need review; no invalidation or
  independent-cursor repair is added.

The numerical row owner's `ForwardIterator` first calls policy/indexed
`getRangeData`, then uses `getRangeDataLeaf` for later cache misses. Its later
lookup can therefore succeed after mutation invalidates the index while the
threaded-group flag forbids rebuilding. The bool iterator continues using the
policy lookup on cache misses. Numeric insertion also passes false for
skip-start-boundary, while bool insertion passes true. These are original API
distinctions, not defect classifications; all 706 unchanged numeric sequences
and independent policy/thread/insertion tests retain them.

## Recording future observations

Add a stable case ID, pinned source location, original condition, concrete
native result or a clearly labelled proof, existing test/probe evidence,
consumer uncertainty and the preservation decision. Update an entry when
stronger evidence arrives. A source expression that looks unusual is sufficient
for an observation, not sufficient for a confirmed defect classification or an
implementation change.
