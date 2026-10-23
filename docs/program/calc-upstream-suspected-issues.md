# Calc: observed upstream cases requiring review

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

## CALC-026 — AVX2 eight-way alignment comment names sixteen positions

Status: confirmed source comment/code mismatch; behavior defect not established.
Pinned mdds3.2.1 soa/block_util.hpp, adjust_block_positions specialization
avx2_x64_lu8, says the section length is divisible by 16. Its actual mask 31,
stride 32 and eight four-lane SIMD operations process groups of 32 positions.
The code and lane grouping agree; the explanatory comment differs.

Evidence: unchanged full source block_util.hpp in the verified pinned archive,
avx2_x64_lu8 specialization. This arm64 native probe does not enable AVX2,
and no successful AVX2 runtime result is claimed. Decision: retain original
executable behavior; do not change its mask, stride or lanes to match the
comment. The browser SIMD specialization remains an explicit inventory gap.

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

## CALC-027: Moved-from logical size remains while metadata moves away

Status: confirmed original moved-state distinction; not classified as a defect.

The pinned mdds3.2.1 `soa/main_def.inl` move constructor (lines 450-454) moves
`m_hdl_event` and `m_block_store`, then initializes `m_cur_size` from the source
primitive value without resetting the source. `size`, `block_size` and `empty`
(lines 3580-3600) observe logical size and metadata separately. On the verified
libc++ target, moving an initialized three-element owner leaves its source with
`size()==3`, `block_size()==0` and `empty()==true`. Clearing that source resets
its logical size. Native self-move assignment uses a temporary and swap and
preserves the original data ownership.

Evidence: unchanged full original headers compiled by
`scripts/mdds-container-native-probe.mjs`; all217 native lifetime sequences and
`soa/container.test.ts`, including the actual default empty event owner. The
corpus retains complete before/after states, event values and final destructor
logs. This is defined member behavior plus a selected standard-library moved
vector observation; no promise about all allocators or consumer reuse follows.
Consumer expectations for moved objects remain unreviewed. Decision: preserve
original size, metadata and assignment behavior; add no normalization/reset.

Original SoA row positions and scalar queries have different end contracts.
Pinned `soa/main_def.inl` lines522-610 return a valid iterator/zero-offset pair
when the row equals logical size, before reading a hint. `get_impl`, `get_type`
and `is_empty` reject that row with the original out-of-range diagnostic.
Retained swap-valid hints keep cached parent/index values, and lookup applies
its original admission and backward-search conditions (lines3925-3985). These
are reviewed API distinctions, not classified defects. The290-sequence native
container corpus preserves them and excludes endpoint private-field claims.

## CALC-028: Resize passes a container row to block overwrite

Status: suspicious argument; original scalar calls reproduced, managed
consumer effects remain unverified.

Pinned mdds 3.2.1 `soa/main_def.inl` lines 4835-4846 computes the retained
block start and end, then calls `block_funcs::overwrite_values` with
`new_end_row + 1` and `end_row_in_block - new_end_row`. Its first argument
is a container row even when the retained block begins at a nonzero row.
The dispatcher forwards this value unchanged. Original managed block
`overwrite_values` bodies in `types.hpp` form a block iterator from
`m_array.begin() + pos`, which makes their indexing convention relevant.

Initialized example: eleven-cell owner with bool at row 0, three int8 cells
at rows 4..6 and two bool cells at rows 9..10, with empty gaps. Resize to
five cells retains one int8 cell in the block starting at row 4. The actual
original overwrite call receives offset 5, count 2 on a three-cell block;
original block resize then receives size 1. A relative offset for that
retained block would be 1. Calls then release and delete the lower bool block.

Evidence: unchanged full original headers compiled by
`scripts/mdds-container-native-probe.mjs`, existing forwarding standard
`observed_funcs` aliases and `soa/container.test.ts`. The native seed 36,
resize-to-5 case records overwrite `[0,1,3,5,2]`, resize `[1,1,3,1]`,
release `[2,0,2]` and delete `[3,0,2]` (operation code, actual scalar type,
pre-operation block size, remaining arguments). Complete original states,
capacities and final events are retained in `native-container-cases.json`.

Standard unmanaged overwrite is an original no-op, so this example does
not prove a scalar value defect or a valid managed failure. Complete managed
consumer reachability/invariants remain unreviewed; no native undefined
iterator range receives an invented successful result. Decision: preserve
the exact original global offset and ordering; add no relative-offset repair.

## CALC-029: Failed scalar append retains its new metadata slot

Status: suspicious exception state; custom null-returning native callback
reproduced. Ordinary standard scalar creation reachability is unverified.

Pinned mdds 3.2.1 `soa/main_def.inl` lines1063-1080 adds a new metadata slot
before calling `create_new_block_with_new_cell`; logical size increases after
that helper succeeds. The helper at lines3986-4003 creates a zero-size block
and throws `general_error("Failed to create new block.")` when its ADL factory
returns nullptr. That path does not remove the metadata slot. The original
public declaration at `soa/main.hpp` lines681-698 states append/iterator
behavior but does not specify a strong exception guarantee.

The unchanged native probe calls actual public `push_back(failure_cell{})`.
Its explicit custom ADL type has the bool category, a factory returning nullptr,
and a registered scalar append callback which is never reached. Starting from
a zero-size owner, the error leaves logical size0, block count1, positions[0],
sizes[1] and a null payload. Starting from two empty cells, it leaves logical
size2, block count2, positions[0,2], sizes[2,1] and two null payloads. No owner
acquisition occurs. Actual `clear` followed by ordinary bool append succeeds;
complete native states and final lifetime events are retained in the last two
cases of `soa/native-container-cases.json` and compared by `container.test.ts`.

This caller deliberately exercises the original null guard. The twelve standard
factories normally return allocated blocks; allocation failure throws instead
of returning nullptr. This evidence does not prove a normal Calc failure,
managed/custom consumer reachability or a promised exception guarantee violation.
No failed replacement with a dangling old pointer is executed or certified.
Decision: retain metadata-before-creation, exact diagnostic and size update
ordering; add no rollback or empty-tail coalescing repair.

## CALC-030: Erase end-lookup failure reports the start row

Status: suspicious diagnostic argument; original native error reproduced.
Range validation and data mutation behavior remain unchanged.

Pinned mdds3.2.1 `soa/main_def.inl` lines2182-2196 first locates `start_row`,
then locates `end_row` starting at that block. When the second lookup fails,
the original `throw_block_position_not_found` call at line2196 passes
`start_row` to the error formatter. A valid start with an invalid end therefore
reports the valid start as the logical position which could not be found.

The unchanged original native five-cell bool owner rejects `erase(0,5)` with
`multi_type_vector::erase_impl#2196: block position not found! (logical pos=0,
block size=1, logical size=5)`. It also rejects an end equal to uint64 maximum
with the same reported logical pos0. Actual metadata, payload, capacities and
ownership events are unchanged after each rejected public call. A failed first
lookup instead uses source line2191 and reports its actual start argument.

Evidence: genuine unchanged full original native container compiled with
ASan/UBSan by `scripts/mdds-container-native-probe.mjs`; appended filled-five
bool error sequence in `soa/native-container-cases.json`, compared through
actual shared `container.test.ts` and both original lookup guards in `main.ts`.
This is an error-path observation, not evidence of successful out-of-range
access or an invalid range accepted by Calc. Decision: preserve the exact
start-row argument, diagnostic source line and pre-mutation guards; do not
substitute the end row or a locally improved message.

## CALC-031: Hinted scalar release reads empty metadata before its row guard

Status: suspicious bounds-check order; original ASan/UBSan failure reproduced.
This native undefined behavior does not establish an intended result.

Pinned mdds3.2.1 `soa/main_def.inl:3708` calls hinted block lookup before the
public scalar-release guard. Original lookup at `main_def.inl:3957` reads
`m_block_store.positions[0]` even when the destination has no blocks. A valid
hint from another nonempty container is ignored by the parent check, then this
empty-vector access still occurs. The public release documentation in
`soa/main.hpp:1036-1056` describes an out-of-range exception for an invalid row.
That exception is not reached in this native case.

Reproducer with unchanged full headers and default libc++ traits: construct
`db(0)` and a separate boolean `other(1, true)`, retain `other.begin()`, then call
`db.release(other.begin(), 0, value)`. ASan/UBSan reports null-reference binding
in libc++ vector, a read at `main_def.inl:3957`, and aborts through hinted
release at3708. Task202610100153-570FFF retains the exact caller input and
sanitizer stderr in its native verification artifacts.

Decision: preserve the original lookup and guard ordering. No synthetic
exception, early guard, recovery or alternate mutation is added to the shared
implementation. Native UB is not recorded as a defined portable result. Plain
empty/moved-source bounds guards and valid hints on destinations with metadata
remain in the complete typed acceptance corpus. JavaScript storage bounds
behavior is an existing representation boundary; native UB/ABI parity remains
unverified. This may affect other original hinted callers sharing the lookup,
but only scalar release is reproduced here.

## CALC-032: Intern fast path overwrites a populated destination without releasing it

Status: suspicious ownership condition; initialized native output reproduced.

[Original `rtl_uString_intern`](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sal/rtl/ustring.cxx#L587)
asserts both pointers. When the source already carries the intern flag, it
acquires the source and writes it to `*newStr`. This branch does not release
the data previously stored in the destination. The other branch saves the
previous destination and releases it after interning.

The task34 unchanged-body capture creates an interned source containing
`[65,66]`, copies it into separate destination data, then calls
`rtl_uString_intern(&destination, internedSource)`. Native call181 changes
the destination identity from56 to55. Allocation56 retains refcount1,
length2, capacity2 and units `[65,66,0]`; no free event occurs. The previous
allocation stays live in subsequent native snapshots. The probe's explicit
process cleanup happens only after all observations are recorded.

Evidence: `scripts/rtl-ustring-ownership-native-probe.mjs` compiles the
complete original function and its original dependencies under ASan/UBSan.
`apps/office/src/sal/rtl/native-ustring-ownership-cases.json` retains3336
complete observations as lossless deltas; its raw state SHA256 is
`665e3f8e7f0d1ccede35d17809b26694319812aaf695e1383ee8edb40d46c7a4`.
`ustring-ownership.test.ts` compares the entire allocation and handle state,
including the displaced allocation and source refcount, after every call.

Remaining uncertainty: a populated destination on this fast path may violate
an intended caller invariant. The broader consumer requirements and history
have not been established, so this is not a confirmed upstream defect report.
Decision: preserve the original branch and overwrite order. Do not insert a
release or normalize callers to hide the observation.

## CALC-033: Intern-table growth applies next-prime selection twice

Status: suspicious growth policy; initialized native table layout reproduced.

[Original hash-table implementation](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sal/rtl/hash.cxx)
resizes when entry count reaches integer `nSize/2`. Its intern caller passes
`getNextSize(nSize)` to resize; resize passes that request to table allocation,
which applies `getNextSize` again. Each selection uses the first prime strictly
greater than its argument. The initial request1024 allocates2039 slots.
Growth from2039 requests4093 but allocates8191, skipping the intermediate
table size. Native call2283 grows the table to8191 and inserts entry1020.

Evidence: task34's unchanged complete `hash.cxx` body and dependencies compile
under ASan/UBSan. Every physical occupied slot, table size and entry count is
captured before and after growth in `native-ustring-ownership-cases.json`;
the complete raw output SHA256 is
`665e3f8e7f0d1ccede35d17809b26694319812aaf695e1383ee8edb40d46c7a4`.
`ustring-ownership.test.ts` reconstructs and compares all3336 complete snapshots.

Remaining uncertainty: this may be an intentional capacity/growth policy;
the design history and expected memory/performance tradeoff are unknown.
Decision: retain both selections, threshold and resulting original layout.
Do not replace the result with a conventional single next-prime growth.

## CALC-034: SharedString self-move can retain freed data

Status: suspicious ownership condition; original full-header sanitizer
reproduction retained. No upstream defect report or repair is implied.

[Original move assignment](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/include/svl/sharedstring.hxx#L97)
releases both current fields, then assigns each result of
`std::exchange(r.field, nullptr)` back to the destination field. It has no
self guard. When source and destination are the same object, exchange temporarily
sets the field to null, then the assignment restores the old pointer.
If releasing the original field destroyed its last reference, that pointer
has already been freed. Copy assignment has an explicit self guard.

Reproducer: construct `OUString x` from one UTF16 unit, construct
`SharedString s(x)`, then clear x so s owns the last data reference.
Call `s = std::move(s)`, followed by `s.getLength()`.
Task202610101521-5TVQA9 compiles the full original headers/source with genuine
RTL lifetime dependencies. The probe's invalid selector2 emits the marker
`after-self-move-before-length`; ASan then reports heap-use-after-free
in the original SharedString::getLength. Full stderr stays in the ignored
native evidence directory. The portable fixture retains only the pre-UB
marker and diagnosed condition, explicitly `definedResult:false`.

Remaining uncertainty: self-move may be excluded by original caller invariants;
the broader consumers and design history have not been established.
Decision: preserve native release/exchange/assignment order and absence of
a self guard. No synthetic safe result, special-case nulling or ownership
repair is added. Safe static-data self-move remains in the complete defined
native corpus; invalid dynamic self-move has no portable post-UB expectation.

## CALC-035: Lithuanian conditional case mapping checks position beyond length

Status: suspicious source condition only; native service output has not been
reproduced. No confirmed defect or repair is implied.

[Original conditional case mapping](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/i18nutil/source/utility/casefolding.cxx#L85)
checks `langIs("lt") && pos > len && accent_above(str[pos+1])` for U+0049,
U+004A and U+012E. For a position inside a string (`0 <= pos < len`),
`pos > len` is false, so this branch cannot select the Lithuanian
accent-above mapping. For example, position0 in a two-unit input cannot
reach that mapping through this condition. This is a predicate observation,
not a captured case-conversion result.

Evidence: unchanged pinned `i18nutil/source/utility/casefolding.cxx`,
`getConditionalValue`, lines85–88, inspected while resolving SharedStringPool's
original CharClass dependency. The original UNO/i18npool/i18nutil/ICU service
has not yet been ported or exercised here. Full callers, mapping tables,
locale service and intended index semantics remain to be checked before
drawing a service-level conclusion.

Decision: preserve the exact source condition when porting this owner. Do not
change the comparison or replace the original locale service with JavaScript
casing. Record a native reproduction when the actual service is available.


## CALC-036: Case-mapping flag comments reverse the direction names

Status: source documentation inconsistency; no runtime defect or repair is implied.

The pinned include/i18nutil/casefolding.hxx declares LowerToUpper0x01 with the
comment "Upper to Lower mapping", and UpperToLower0x02 with "Lower to Upper
mapping". The names and numeric behavior agree with the switch in
i18nutil/source/utility/casefolding.cxx: LowerToUpper uses u_toupper, while
UpperToLower uses u_tolower. The two explanatory comments describe the opposite
direction and can mislead a port or review.

Evidence: unchanged full pinned header and getValue source, inspected in
task202610101731-H21CAK. The numeric mapping contracts are also used by task38
native fallback-reachability comparison. This observation does not certify
complete locale-aware casefolding output or its original UNO service.

Decision: retain original names, values and runtime behavior. Record the comment
inconsistency; do not invert flags or mappings to follow the comments.


## CALC-037: Generated Locale type initialization retains an upstream weak-memory TODO

Status: upstream-documented concurrency concern; no concurrent failure has been
reproduced and no repair is implied.

[The original plain-struct type emitter](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/codemaker/source/cppumaker/cpputype.cxx#L1991)
emits a static raw type-description pointer, an outer null check and a call to
`typelib_static_struct_type_init`. Its own TODO warns that on some weak-memory
platforms another thread can observe an invalid pointed-to value. The actual
Locale.hpp emitted by the pinned cppumaker retains this sequence and warning.

Evidence: full unchanged PlainStructType::dumpNormalGetCppuType source and ten
genuine headers generated in task202610101731-H21CAK. Native Locale value
constructor/copy/move observations do not exercise concurrent type lookup.
Original static_types.cxx also contains the inner static-initialization mutex;
its synchronization and the generated outer pointer read need to be considered
together before concluding there is a defect.

Decision: preserve the generated behavior and original type-registration
contracts. Do not invent an atomic repair or claim a reproduced concurrency
problem from this source TODO. Browser realm and worker boundaries remain
separate verification requirements.

## CALC-038: Standalone internal NotValue mode reads beyond case extras

Status: native undefined behavior reproduced with an initialized caller;
reachability from ordinary case-operation consumers remains unverified.

[Original `casefolding::getValue`](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/i18nutil/source/utility/casefolding.cxx#L122)
tries up to `MaxCaseMappingExtras` (three) entries from a table-defined offset.
The complete original extras table has 352 entries. U+1E9E selects value-table
address 1694, type 234 and extras offset 350. Its final two entries have types
42 and 64; neither intersects the internal `MappingType::NotValue` bit 128.
The loop consequently reaches extras index 352 before its RuntimeException
fallback, although this index is outside the array.

Initialized example: `sal_Unicode input[2] = {0x1e9e, 0}`, position 0, length 1,
empty genuine generated Locale, and standalone NotValue as the mapping mode.
The instrumented original body reports `index 352 out of bounds for type
'const Mapping[352]'` and terminates with SIGABRT. All 67 genuine SAL and two
CPPU dependency units, the unchanged case-mapping/ICU bodies, and the generated
Locale/UNO header code are instrumented with ASan/UBSan. Native platform
frameworks remain outside instrumentation.

Evidence: [the full case-value probe](../../scripts/casefolding-native-probe.mjs),
its isolated `internal-bit-ub` caller, and ignored complete native diagnostic
`output/playwright/casefolding-native/internal-bit-ub.stderr`. NotValue describes
internal table indirection; this synthetic caller is not evidence that an
ordinary lower/upper/title/folding consumer passes it as a standalone mode.

Decision: retain the original loop and table. Record this diagnostic separately
from the defined Unicode observations, assign no portable expected value to
the undefined native read, and do not add a table-bound repair or normalize
mapping flags. Consumer reachability and intended mode constraints require
separate review.

## CALC-039: Type-reference name equality ignores equal-length suffixes after zero

Status: suspicious caller-domain condition; original native const predicate
reproduced with ASan/UBSan-identical output.

[Original `typelib_typedescriptionreference_equals`](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/cppu/source/typelib/typelib.cxx#L2226)
first checks reference identity, then type class and logical name length. Its
last comparison uses `rtl_ustr_compare`, which stops at the first zero unit.

Example: two distinct, fully initialized public C reference records have the
same type class and real owned names `[65,0,66]` and `[65,0,67]`. Both names have
logical length3. Original reference equality returns true although the final
logical units differ. Different logical lengths still return false; different
type classes still return false. No name/reference acquire or release occurs.

Evidence: [the full native type primitive caller](../../scripts/uno-type-primitives-native-probe.mjs),
all123904 initialized class/name combinations in committed
`native-type-primitives-cases.json`, and
[portable reference comparison replay](../../apps/office/src/cppu/source/typelib/typelib.test.ts).
The caller compiles genuine full SAL/CPPU owners and constructs original C
header records only for const comparison. It supplies no type registry or
allocation replacement.

These embedded-zero names are synthetic predicate inputs. Reachability through
ordinary valid UNO type registration/naming consumers is unproven; this is
not a demonstrated defect of valid registered type names.

Decision: preserve the original terminated comparison and length guard. Do not
replace it with known-length comparison, normalize names, or silently repair
the upstream function.

## CALC-040: Conflicting enum completion default does not replace the existing default

Status: synthetic conflicting-provider condition reproduced with normal and
ASan/UBSan-identical output; ordinary consumer reachability remains unverified.

[Original typelib registration](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/cppu/source/typelib/typelib.cxx#L1443)
completes an already initialized incomplete enum by swapping its value count,
name array and value array. It retains the existing nDefaultEnumValue. A raw
uninitialized reference takes the separate whole-specific-record transfer path.

Initialized caller example: an incomplete registered enum has default0 and no
values. A new complete description with the same name/class supplies default42
and values42/51. Registration returns the existing allocation, now with both
values and names, but its default remains0. The complete native lifecycle trace
retains every field/count/identity observation; portable replay matches it.

Evidence: [the genuine original registry caller](../../scripts/uno-registry-native-driver.mjs),
the registry stream in native-type-primitives-cases.json, and
[complete portable ownership replay](../../apps/office/src/cppu/source/typelib/registry.test.ts).
[Original Test::testEnum](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/cppu/qa/typelib.cxx#L38)
expects the initial default0 to remain0 for a consistent provider. Preserving
known static metadata may therefore be intentional; this conflicting caller
is not proof of a defect in valid ordinary UNO enum completion.

Decision: retain the original selected-field swaps, including the unchanged
existing default. Do not copy the incoming default, normalize enum values or
claim an ordinary consumer failure from this witness.

## CALC-041: Derived-member lookup may retain an additional base description reference

Status: the extra base acquisition is reproduced through complete original
lookup with initialized synthetic members/interfaces. Ordinary producer lifecycle,
reachability and an actual leak remain unverified; no consumer defect is claimed.

[Original getByName](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/cppu/source/typelib/typelib.cxx#L1943)
looks up the base reference, acquires its description through
typelib_typedescriptionreference_getDescription, and passes both to
createDerivedInterfaceMemberDescription. Its failed-construction path releases
the description, interface and base reference. Its successful path does not
explicitly release the separately acquired base description.

[Original internal construction](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/cppu/source/typelib/typelib.cxx#L1745)
borrows the base while copying values and acquires copied type/name owners. It
stores the transferred interface and base reference, with no separate base
description pointer. The method/attribute destructor releases those stored
owners. For these weak member references, reference release does not itself
release pType; the apparent extra description acquisition merits review.

Evidence: the original private-constructor corpus remains independently scoped.
The full unchanged getByName path is now executed by the derivedrefs mode in
scripts/uno-lookup-native-probe.mjs: initialized method/attribute descriptions
and their actual weak references show the additional base-description count
retained on each successful derived lookup, while failed construction balances
its acquired base/interface/reference owners. Complete normal/ASan/UBSan output
and portable replay agree. This confirms the acquisition on these initialized
synthetic inputs, not an ordinary producer leak or long-term shutdown behavior.

Decision: preserve original operations. No extra base release, changed weak
reference semantics or lookup repair is added. Full ordinary service/cache/shutdown
reachability still requires separate consumer evidence.

## CALC-042: Sequence-name lookup does not check the second prefix character

Status: reproduced with an initialized synthetic name through complete unchanged
native getByName/SAL/CPPU owners; ordinary valid-consumer reachability remains
unverified. No valid-consumer defect is demonstrated.

[Original getByName](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/cppu/source/typelib/typelib.cxx#L1919)
enters sequence lookup when the name has more than two UTF16 units and its first
unit is `[`. It uses name.copy(2) without checking that the second unit is `]`.
The actual native lookup accepts `[xlong`, preserves that entire original type
name and creates a sequence whose element reference resolves to long. Normal
and fully instrumented ASan/UBSan dependency builds produce identical complete
lookup streams; the portable replay preserves the same routing/counts.

Evidence: scripts/uno-lookup-native-probe.mjs lookup mode and
apps/office/src/cppu/source/typelib/native-lookup-cases.json retain the complete
source hashes, native stream/digest and input, with adjacent original portable
lookup replay. This extends the initial source-only suspicion; it does not prove
that ordinary producers violate an assumed canonical-name precondition.

The implementation keeps the original predicate and two-unit skip. No prefix
validation, canonicalization, normalization or upstream repair is added.

## CALC-043: Failed interface-member factories retain acquired descriptions

Status: reproduced with initialized synthetic wrong-kind and incomplete-interface
inputs through full unchanged native SAL/CPPU factories. Ordinary producer
reachability, expected naming/type preconditions and an actual consumer leak
remain unverified; no ordinary-consumer defect is claimed.

[Original method factory](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/cppu/source/typelib/typelib.cxx#L1032)
and
[original extended attribute factory](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/cppu/source/typelib/typelib.cxx#L1120)
first acquire the interface description through getByName. If that description
has another type class, or list-only complete returns false, they return without
releasing that acquired description. The local OUString is destroyed on return;
the raw description pointer has no RAII owner. Successful construction transfers
the acquired interface into the member description, whose destructor releases
it. Missing lookups acquire no description.

Evidence: scripts/uno-member-factories-native-probe.mjs failure mode executes both
original factories with an initialized registered enum and an initialized
registered incomplete interface. Each corresponding early return retains one
additional description count. Prior owned output is released before lookup;
other missing/bad-name branches preserve expected acquired counts. Complete
normal/ASan/UBSan failure streams match (728 bytes), and the portable public
factory replay matches every field and count. Native setup uses the genuine
no-base interface factory; portable caller initialization isolates the member
factory behavior and does not verify the still-unported interface constructor.

Decision: preserve original operations and return ordering. No extra description
release, exception, name validation or completion repair is added. Full valid
producer/service/shutdown reachability still needs separate consumer evidence.

## CALC-044: Integral format capacity macros omit space for binary negative minima

- Source: pinned `include/rtl/string.h` defines `RTL_STR_MAX_VALUEOFINT32`33 and `RTL_STR_MAX_VALUEOFINT64`65; `include/rtl/ustring.h` aliases these values and recommends them for a buffer holding both the result and terminating NUL. Actual `sal/rtl/strtmpl.hxx::valueOfInt` writes a minus sign, all magnitude digits and then zero.
- Observation: the complete original native C formatting stream observes signed32 minimum in radix2 with length33 and signed64 minimum with length65, excluding the terminator. They require34 and66 units respectively. Normal and ASan/UBSan streams agree using independently sufficient96-unit caller buffers; full untouched sentinels and terminator are retained. Unsigned64 requires65 units and fits its original macro.
- Suspicion: the documented signed macro recommendation is one unit short for these binary minima. `StringNumber` uses the original macro-sized member buffer; its physical layout and consumer impact are not established by this C caller. No out-of-bounds or post-undefined-behavior output is claimed from these sufficient-buffer observations.
- Evidence: `scripts/rtl-integer-format-native-probe.mjs`; `sal/rtl/native-integer-format-cases.json`; complete adjacent portable replay in `integer-format.test.ts`. Full unchanged346-source native dependency closure and complete48492536-byte stream are retained. The macros and result lengths are observed together.
- Port decision: retain original33/65/65 constants and integral result/terminator behavior. Do not enlarge macros, truncate the negative minimum or silently certify insufficient buffers. Actual ordinary consumers and separate `OUString::number`/concat owners remain unverified.

## CALC-045: Failed interface factory retains its allocation and acquired bases

Status: reproduced with deliberately unavailable bases through the complete
unchanged native SAL/CPPU interface factory. Ordinary producer reachability,
expected interface preconditions and an actual consumer leak remain unverified.

[Original multiple-inheritance interface factory](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/cppu/source/typelib/typelib.cxx#L903)
releases old output, allocates an empty interface and acquires its name before
resolving and completing direct bases. A null description or failed list-only
completion returns without releasing the new interface or the bases already
acquired; the output remains null. The raw local interface pointer has no RAII
owner, and its canonical weak prefix has not yet been assigned.

Evidence: `scripts/uno-interface-factories-native-probe.mjs` failure mode uses
both a real weak member reference without a provider and an empty base produced
by the original interface factory itself. In each case, the new interface name
count changes from1 to2 and remains2 after caller base release. For the existing
empty base, its description count changes from1 to2 and remains1 after caller
release; its owned name also remains acquired. Missing descriptions acquire no
base. Prior output and its members are released first. Complete normal and
ASan/UBSan failure streams agree (272 bytes); the portable actual public C
factory replay compares every initialized field and count. Leak detection is
disabled for retained original registries/failures, so no leak-detector verdict
or ordinary-consumer failure is claimed.

Decision: preserve allocation, acquisition and return ordering. Add no extra
release, exception, completion repair or naming validation. Valid service
producers and native shutdown behavior need separate consumer evidence.

## CALC-046: Failed ASCII allocation becomes a null-data OUString

Status: reproduced through the original source-provided replaceable allocator
pointer. Ordinary OS OOM, consumer reachability and destruction of such a value
remain unverified; the null-data value is intentionally retained without calling
its destructor.

Pinned `sal/rtl/ustring.cxx::rtl_uString_newFromAscii` releases prior owned data
before allocation and returns with a null output if the allocator returns null.
`include/rtl/ustring.hxx::OUString::createFromAscii(const char*)` then constructs
an OUString from that pointer with SAL_NO_ACQUIRE. That constructor simply stores
the pointer and performs no validation or allocation-failure exception.

Evidence: `scripts/rtl-ascii-create-native-probe.mjs` failure mode sets the
original `rtl_allocateString` function pointer to a caller allocator returning
null. Full unchanged dependencies retain the null C result and the null-data
C++ value. Complete normal and ASan/UBSan failure observations agree (180 bytes),
including original release/allocation/free ordering. The native null-data value
is heap-constructed with copy elision and deliberately retained; no post-invalid
consumer, null destructor, sanitizer failure or ordinary OS OOM is claimed.

Decision: preserve null pointer transfer and the original ordering. Add no
invented empty-string fallback, std::bad_alloc translation or allocation repair.

## CALC-047: Static initialized-name lookup retains an uninitialized acquisition

Status: reproduced with a deliberately uninitialized canonical reference through
full unchanged native SAL/CPPU owners. Ordinary producer reachability, expected
static-initializer preconditions and an actual consumer leak remain unverified.

Pinned `cppu/source/typelib/static_types.cxx::igetTypeByName` acquires a reference
through `typelib_typedescriptionreference_getByName`. It returns that reference
only when both its description and canonical weak prefix are initialized. On the
other path it returns null without releasing the acquired reference. The caller
then constructs/registers a new description and receives the canonical reference,
while the earlier acquisition remains counted. No RAII owner releases the raw
local reference.

Evidence: `scripts/uno-static-types-native-probe.mjs` uninitialized mode first calls
the actual static type initializer for an enum name and then the actual static
enum initializer for the same name. Complete normal and ASan/UBSan streams agree
(772 bytes), including the retained acquisition, canonical transfer, static/live
counts and every initialized owned-name/description field. The adjacent public
portable replay matches the full captured stream. Leak detection is disabled for
original retained registry/static owners; no leak-detector verdict is claimed.

Decision: retain the original acquisition and registration ordering. Add no extra
release, lookup repair, synthesized exception or normalization. Valid ordinary
service producers and native shutdown behavior require separate consumer evidence.

## CALC-048: Type compatibility permits same-width signed/unsigned transitions

Status: reproduced as type-predicate/table behavior through complete unchanged
native SAL/CPPU owners. Actual value conversion, bit preservation, range checks,
ordinary consumer effects and upstream intent remain unverified.

Pinned `include/typelib/typedescription.h` describes isAssignableFrom as widening
conversion without data loss. Actual `cppu/source/typelib/typelib.cxx` defines
`s_aAssignableFromTab` with mutual signed/unsigned compatibility for short, long
and hyper widths. The public reference predicate returns true for each direction
between the actual corresponding original basic type references. A type-only
predicate checks no source value or range. This appears broader than the header's
widening/no-data-loss wording; it does not prove that the downstream converter
loses information or that the table is erroneous.

Evidence: `scripts/uno-assignability-native-probe.mjs` matrix mode observes all121
entries of the actual native constant and all1681 prepared reference pairs,
including these six directions. Complete normal and ASan/UBSan streams agree
(606448 bytes). The portable replay compares both the full table and actual public
predicate/description-wrapper outputs, with initialized owned names/counts and no
handwritten native type factory or expected numeric algorithm.

Decision: preserve the original table and predicate. Add no unsigned range gate,
value check, conversion repair or adjusted compatibility result. Actual original
value conversion and valid consumer evidence require a separate observation.


## CALC-049: Indexed width lookup retains a duplicate row before checking its flag

Status: reproduced through unchanged original lookup classes and width getters.
Upstream intent and complete transliteration service effects remain unverified.

Pinned `i18nutil/source/utility/widthfolding_data.h` contains two half2full rows
for U+0022: U+FF02 with flag1 and U+201D with flag2; U+0027 similarly selects
U+FF07 or U+2019. Original `oneToOneMappingWithFlag::makeIndex` stores the last
row for each key without considering the owner's flag. Indexed `find` checks
only that stored row's flag. The normal half2full getter therefore preserves
U+0022/U+0027, while the JIS getter returns U+201D/U+2019. The earlier normal
rows remain in the original table but do not participate in indexed selection.

Evidence: `scripts/casefolding-iterator-native-probe.mjs` tables mode captures
all original tables, six getters and every BMP key; lookup mode also captures
binary and indexed selection for both complete tables and eleven masks.
Normal and ASan/UBSan streams match (3420032 and 27525324 bytes). Portable replay
compares every captured result and actual borrowed row mutation/identity.

Decision: preserve table order, duplicates, index assignment and flag checking.
Do not prefilter rows, choose an earlier matching row or repair quote conversion.

## CALC-050: Case iterator resets a pending expansion at the logical input end

Status: reproduced through unchanged original getNextChar and initialized caller
histories. Complete original consumer QA and upstream intent remain unverified.

Pinned `i18nutil/source/utility/casefolding.cxx` checks idx>=len and resets the
MappingElement before testing pending map entries. With FullFolding and
IGNORE_CASE, terminal U+00DF yields one U+0073 followed by zero, although the
first Mapping has nmap2/current1. Terminal U+FB03 likewise yields only its first
U+0066 from a three-unit expansion. Adding U+0041 after either character allows
the pending expansion to drain before the final character is folded.
Original `i18npool/source/transliteration/transliteration_caseignore.cxx` has
NOT_END_OF_STR checks including current<nmap, so its caller can request those
pending units; this is source inspection, not an executed service verdict.

Evidence: `scripts/casefolding-iterator-native-probe.mjs` histories mode captures
all14 result/state/error/identity fields per call, including these four inputs.
Its complete 10787896-byte normal and ASan/UBSan streams agree. Portable replay
matches every observation. Native uninitialized map cells after reset are masked
and are not claimed to have zero defaults.

Decision: preserve early end checking, reset ordering and returned units. Add no
pending-tail drain or adjusted logical length.

## CALC-051: Boolean scalar copy normalizes bytes that sequence copy preserves

Status: reproduced through unchanged original CPPu/SAL owners with initialized
unsigned-byte inputs. Ordinary producer reachability, consumer effects and
upstream intent remain unverified.

Pinned `include/sal/types.h` defines sal_Bool as unsigned char. The BOOLEAN
branches of `cppu/source/uno/copy.hxx` explicitly apply bool(source) when copying
a scalar into data or Any. Inputs 2 and 255 become 1. Original
`cppu/source/uno/sequence.cxx::icopyConstructFromElements` instead uses memcpy
for BOOLEAN elements and retains 2 and 255 across its copied sequence histories.
These paths therefore preserve different representations for initialized nonzero
unsigned-byte values. This bounded difference does not establish an application
bug or that supported ordinary boolean producers emit such values.

Evidence: `scripts/uno-copy-native-probe.mjs` and its existing complete portable
replay retain scalar normalization. `scripts/uno-sequence-native-probe.mjs`
lifecycle mode executes the complete unchanged original sequence/data/any units
and genuine dependencies, including both values across construction, COW, resize
and assignment histories. Complete normal and ASan/UBSan streams match
(2089840 lifecycle bytes); the portable replay matches every captured byte.
Shared observers keep their default strict scalar boolean contract and opt into
unsigned-byte observations only for the original sequence corpus.

Decision: preserve both original paths. Add no sequence normalization or scalar
raw-byte preservation. Do not infer binary ABI or full downstream behavior parity.

## CALC-052: Signed scalar comparison reinterprets an unsigned-hyper source

Status: reproduced through complete unchanged original numeric equality and
initialized supported scalar types. Ordinary consumer effects and upstream intent
remain unverified.

Pinned `cppu/source/uno/eq.hxx::_equalData` reads an UNSIGNED_HYPER source
as sal_Int64 in the BYTE, SHORT, LONG and HYPER destination branches. Those
branches then call std::cmp_equal with that signed value. For example, BYTE -1
compared to UNSIGNED_HYPER 18446744073709551615 returns true. Reversing those
operands reaches the UNSIGNED_HYPER destination branch, which reads the unsigned
value correctly, and returns false. The equality result is therefore asymmetric
for this initialized pair. This is a bounded source comparison observation; it
does not establish that an ordinary Calc producer relies on the result or that
the cast is unintended.

Evidence: `scripts/uno-equality-native-probe.mjs` numeric mode records all declared
operand labels, typed value bits and original internal/reference/full-description
comparison results. Complete normal and ASan/UBSan streams match (2112864 bytes).
Both directions above are present and all three APIs agree per direction. The
portable replay matches the entire stream and retains the explicit signed reads.
Original out-of-range floating-to-unsigned casts are excluded from this corpus
and do not participate in this observation.

Decision: preserve the source destination/source switches and signed reads.
Add no mathematical equality repair, symmetric dispatch or numeric coercion gate.

## CALC-053: Interface assignment takes a base member address through null

Status: reproduced in complete unchanged original assignment with real registered
interface types. Normal build observations are bounded; native undefined behavior
and ordinary application reachability remain unverified.

Pinned `cppu/source/uno/assign.hxx::_assignData` walks a supplied interface
description's first-base chain using `&pBaseTypeDescription->aBase`. When a
nonmatching chain reaches the root interface, its base is null. The original
expression takes the common-prefix member address through that null pointer.
In the tested normal LP64 build, the resulting pointer becomes null and assignment
continues to queryInterface. UBSan rejects this expression at assign.hxx422 with
"member access within null pointer"; the process aborts under the existing halt
configuration. The types come from the real original interface factory; no fake
provider or substitute type descriptor participates.

Evidence: `scripts/uno-assignment-native-probe.mjs` separates `interface-chain`
from the five defined modes. Its normal capture is 24896 bytes; its sanitized
capture terminates with SIGABRT and the exact original null-member diagnostic.
The other five modes have identical complete normal/ASan/UBSan streams. This
observes a source expression and a compiler configuration, without claiming
stable native undefined behavior or a Calc consumer bug.

Decision: preserve the original normal control flow using the existing common
record identity. Add no rejection or alternate interface conversion. Record the
sanitizer result separately; do not label this path defined or sanitizer parity.

## CALC-054: Flattened Any address alias bypasses assignment type compatibility

Status: reproduced with original Any construction and initialized caller addresses.
Supported ordinary producer reachability and upstream intent remain unverified.

Pinned `cppu/source/uno/assign.hxx::_assignData` checks type equality when the
initial destination and source addresses are identical. After flattening a source
Any, it instead returns true immediately if the destination address matches the
flattened data address. It does not repeat the type check. In the bounded caller,
an original CHAR Any holds 0xd800 and the destination names SHORT while pointing
to that Any's actual data. Assignment returns true without a value write; ordinary
CHAR-to-SHORT assignment otherwise returns false. Only the actual initialized
CHAR value is observed, with no reinterpretation claim for a SHORT object.

Evidence: the native assignment `diagnostics` mode includes this real constructor
and alias shortcut. Complete normal/ASan/UBSan streams match (180 bytes), including
original result, Any type/name/count and CHAR observations. Unsupported initialized
compound metadata in the same diagnostic mode certifies no ordinary producer.

Decision: retain the flattened address shortcut and its lack of a second type
check. Add no compatibility repair or extra value conversion.

## CALC-055: Any move construction leaves a non-null moved-from VOID address

Status: reproduced and explicitly documented as intentional in upstream. This
looks like a dangling pointer, but no incorrect ordinary consumer result is proven.

Pinned `include/com/sun/star/uno/Any.hxx::Any(Any&&)` first constructs an empty
Any, swaps pType/pData/pReserved, then repairs only the destination's inline
reserved-data address. The moved-from object becomes VOID while its pData points
to the new Any's original empty-data address. That address can later dangle.
Upstream explicitly says only non-nullness is relevant: assignment treats a null
source as a request for default construction. Native VOID operations do not read
a value through this pointer. Move assignment has different behavior: it swaps
both existing values and repairs both inline aliases.

Evidence: `scripts/uno-any-ownership-native-probe.mjs` histories mode records all
initialized supported type pairs, move/copy/clear/setValue operations, actual
borrowed Type/name/description/ref/value fields and ordered virtual callbacks.
The complete 5871200-byte normal/ASan/UBSan histories agree. It directly observes
the moved-from VOID type and pData equal to the new Any's empty address, remaining
non-null. Empty/moved VOID reserved contents and dangling-pointer dereferences are
not observed or certified; physical/native uninitialized byte semantics remain
unverified.

Decision: preserve both original move variants and the moved-from non-null
address. Add no source reset, null normalization or dangling-pointer dereference.


## CALC-056: Distinct interface pointers can compare equal after invalid root replies

Status: reproduced only with diagnostic callers that violate the XInterface root
query contract. No incorrect result from a valid UNO producer is established.

Pinned `include/com/sun/star/uno/Reference.hxx::BaseReference::operator ==` first
checks raw pointer identity, then compares the pointers returned by two root
XInterface queries. It catches RuntimeException but does not reject a null query
result. Two distinct diagnostic callers returning VOID, STRING or a null interface
therefore yield two null roots and can compare equal. The original root query
contract requires the proper canonical interface identity; these replies violate
that producer requirement. This is a noteworthy defensive behavior, not a proven
upstream defect for ordinary valid interfaces.

Evidence: complete `identity` capture in
`scripts/uno-reference-query-native-probe.mjs`, including ordered actual virtual
callbacks, both queried owners, all initialized type/name/ref/count fields and
exception destruction. The complete 5189724-byte normal/ASan/UBSan streams match,
and the portable replay matches every byte. No null dereference or uninitialized
reserved contents are observed.

Decision: preserve original comparison and exception selection. Add no extra
null-result rejection or substitute identity provider.

## CALC-057: queryInterface omits arities15 and16 between14 and17

Status: reproduced compile-time contract gap; no incorrect runtime result or
valid consumer failure is established.

Pinned `include/cppuhelper/queryinterface.hxx` declares ordered template overloads
for1..14 and17..19 interface pointers. The source jumps directly from14 to17,
with no15/16 declarations. Both ordinary calls fail overload resolution. This
may be intentional legacy coverage rather than an implementation defect; the
absence alone does not prove a bug. Existing overloads still compare declared
static types in order and return the first acquired interface Any, including
a matching typed NULL.

Evidence: Task50 first genuine caller compilation against the complete unchanged
header fails with “no matching function for call to queryInterface” beginning
with15 pointers. Compiler notes show14 requires15 total arguments (including
rType), while17 requires18. Full failed compiler diagnostics are retained in
`output/playwright/task50-checks/native-write.log` and the native build manifest.
Dedicated repeatable compile-only15/16 witnesses in the final native probe
both exit1 with complete original diagnostics and source/diagnostic hashes.
Final --write/--check reproduces them; no rejected body is executed.

Decision: preserve the actual1..14/17..19 family and restrict the erased declared
argument-list arities accordingly. Add no missing overload or runtime fallback.


## CALC-058: internal WeakReference<XWeak> duplicates assignment signatures

Status: reproduced original compiler rejection; no valid runtime consumer failure
is established.

Pinned `include/cppuhelper/weakref.hxx` declares both a typed
`operator=(Reference<interface_type> const&)` and a `LIBO_INTERNAL_ONLY` overload
for `Reference<XWeak> const&`. Instantiating `WeakReference<XWeak>` in this
configuration gives the same signature twice and the original compiler rejects
the class. The public helper's separate XWeak constructor/assignment overloads
remain valid; other typed wrappers are usable. This may be an intentionally
unsupported specialization rather than an upstream defect.

Evidence: Task53 complete unchanged original `weak.cxx` builds successfully,
but the first genuine full caller fails when instantiating this specialization.
Original diagnostic is “multiple overloads of 'operator=' instantiate to the
same signature”. Complete failed compiler diagnostics and source/configuration
hashes remain in `output/playwright/task53-checks/native-write-first.log` and
`native-first-failed-manifest.json`. An isolated genuine syntax-only compiler witness now reproduces exit1 with complete source, argv, diagnostics and header hash in the native fixture/probe. No rejected specialization body executes.

Decision: preserve the restriction at the erased compiler specialization binding.
Retain the usable XWeak helper overloads and valid XInterface/XAdapter wrappers.
Do not invent a missing overload, discard an original declaration or change the
source/configuration to make the rejected class run.

## CALC-059: clear retains the helper pointer after disposal throws

Status: source-inspected suspicious failure state; allocator leakage and a valid
ordinary consumer failure have not been independently established.

Pinned `cppuhelper/source/weak.cxx::WeakReferenceHelper::clear` disposes its listener,
releases it and resets `m_pImpl` inside one try block. If listener disposal throws
RuntimeException, the catch only diagnoses it; release/reset are not reached.
The listener already cleared its adapter member before calling `removeReference`,
so `get()` can return an empty reference while the helper still owns its listener.
A later successful clear releases it. Nonempty assignment calls clear and then
replaces `m_pImpl`, which appears capable of losing the retained pointer if that
clear fails. This is a failure-state ownership concern, not a proven allocation
leak or general invalidity of the normal API.

Evidence: complete pinned `OWeakRefListener::dispose`,
`WeakReferenceHelper::clear` and both hard-reference assignment bodies. Task53's
whole original `errors` stream includes a concrete adapter throwing RuntimeException
from removal and a subsequent clear; the portable stream preserves the original
callback/state/ownership observations. The pointer-overwrite allocation concern
above is an inference from source order, not a separate native leak certificate.

Decision: preserve the exact catch boundary, pointer publication and assignment
order. Add no unconditional reset, retry or cleanup rule to repair this concern.

## CALC-060: normal generated enum getter rejects internal scoped enums

Status: confirmed original compiler restriction for a configuration combination;
not an established defect in the upstream library build.

Original `codemaker/source/cppumaker/cpputype.cxx::EnumType::dumpNormalGetCppuType`
passes its first generated enum constant directly to the `sal_Int32` default-value
parameter of `typelib_static_enum_type_init`. With `LIBO_INTERNAL_ONLY`, the
original generated declaration is an enum class, so that implicit conversion is
rejected. A genuine default-mode cppumaker InteractionClassification header and
an unchanged syntax-only caller reproduce the error. No rejected body executes.

Evidence: task55 full failure at both InteractionClassification and IOErrorCode
in `native-write-semantic-idl.log`; failed manifest retains complete original and
generated hashes. The isolated original witness in
`output/playwright/task55-checks/enum-normal/manifest.json` retains the complete
caller, real generation/compiler argv, exit1, full diagnostics and both generated
header hashes. Its complete headers are retained in the adjacent generated folder.
Original `EnumType::dumpComprehensiveGetCppuType` emits an explicit integer cast.

Decision: preserve original generated behavior. Actual `cppuhelper/Library_cppuhelper.mk`
and the selected bridge use internal comprehensive API; task55 uses original
cppumaker `-C` accordingly. Do not patch the normal getter, remove scoped enums
or infer that the supported comprehensive library configuration is broken.

## CALC-061: descriptor type name treats embedded NUL differently by delimiter branch

Status: confirmed original branch-dependent string boundary; not an established
defect for supported/loadable environment names.

In cppu/source/uno/EnvDcp.cxx, uno_EnvDcp_getTypeName searches for the first colon
over the descriptor's explicit length. With a colon, it constructs that bounded
prefix. Without a colon, it calls rtl_uString_newFromStr on terminated input.
A real OUString can retain embedded NUL, so UTF16 units [103,0,99] produce a
one-unit type name [103]; [103,0,99,58,112] produce the three-unit prefix
[103,0,99]. Whether such names denote a supported environment is not certified.
The purpose path retains its leading colon and entire explicit-length suffix.

Evidence: task57 genuine --write/--check builds the complete original descriptor
source/header and every dependency owner normal-ASan/UBSan. Whole functions24684,
aliases16572 and wrappers11944-byte observations match the portable shared
owners. output/playwright/task57-checks/decoded-functions.json consumes both
complete original C streams, preserving every initialized string/refcount/
identity observation. Input indices8/9 reproduce the branch difference.

Decision: preserve the original bounded-versus-terminated calls and all output
ownership. Do not normalize with a single native JS split/slice rule, discard
NUL units uniformly, add descriptor validation or repair upstream behavior.

## CALC-062: ObjectEntry type lookup ignores secondary interface bases

Status: confirmed original lookup difference; full environment consumers and a user-visible defect are unverified.

At pinned9bc445578031fecf56086729d8e4940c77e14d65, cppu/source/uno/lbenv.cxx ObjectEntry::find walks only pBaseTypeDescription. cppu/source/typelib/typelib.cxx initializes this compatibility field from ppBaseTypes[0]. A genuine interface entry.Child deriving from entry.Multi(entry.A, entry.B) is assignable to entry.B according to the original typelib_typedescriptionreference_isAssignableFrom, but an ObjectEntry storing only entry.Child returns null for entry.B. Adding a separate entry.B record makes the lookup succeed. Root XInterface returns the first record directly. Distinct actual descriptors named entry.A still match through td_equals.

Evidence: scripts/uno-object-entry-native-probe.mjs builds all101 original desktop dependencies and includes the whole unchanged lbenv.cxx in a pure caller; normal-ASan/UBSan find836-byte streams match all initialized portable observations in lbenv.test.ts. output/playwright/task60-checks/decoded-find-prefix.json records the exact initial query rows: entry.B misses while assignability is true. The full stream remains in native-object-entry-cases.json and normal/asan caller.find outputs. This is a direct internal lookup experiment, not a complete environment or consumer QA port.

Decision: preserve the primary-base chain and first-record root shortcut. Do not replace it with a traversal of every ppBaseTypes entry or a JS inheritance shortcut.

## CALC-063: mdds block swap copies two values even when moves are available

Status: confirmed original copy-based swap; not an established defect. Copy-only ValueT requirements may explain the choice.

Pinned mdds3.2.1 types.hpp element_block::swap_values declares ValueT v1=*it1, v2=*it2, then copy-assigns both references. An instrumented movable noexcept ValueT therefore has two copy constructions, two copy assignments and two temporary destructions for each pair, including the same reference. Direct std::iter_swap over the same real storage uses one move temporary and two move assignments. This may create additional transient string references, but no complete Calc consumer defect or performance regression is demonstrated.

Evidence: task65 scripts/mdds-object-value-native-probe.mjs includes whole unchanged verified original headers and captures full normal-only owned streams in native-object-value-cases.json. swap_d/swap_f/swap_self retain the two copies; reverse_d/reverse_f witness the separate std::iter_swap path. Actual SharedString/CellTextAttr full source owners are also compiled unchanged.

Decision: retain the original two-copy block algorithm. Do not replace it with std::swap, pointer/reference exchange or a JS destructuring swap for owned values. The selected native iterator swap remains a separate language binding.

## CALC-064: range write skips overwrite_values for a different partial last block

Status: confirmed source asymmetry; a managed-pointee or Calc consumer defect is not established.

Pinned mdds3.2.1 soa/main_def.inl set_cells_to_multi_blocks_block1_non_empty extends a first block of the incoming category. If the range ends inside a nonempty last block of a different category, it calls block_funcs::erase for that last block without a preceding overwrite_values. The corresponding set_cells_to_multi_blocks_block1_non_equal path calls overwrite_values before erase. This is suspicious for block categories whose overwrite operation owns separate pointee cleanup. Actual Calc pointee registrations and supported consumer reachability are still unported, so no leak or user-visible defect is claimed.

Evidence: task70 scripts/mdds-container-range-native-probe.mjs includes the complete unchanged original SoA/types/macros headers and compares whole normal-only scalar23968-case and owned-value streams. These streams cover the asymmetric category transition and retain its original special-member/event behavior; owned unmanaged values do not prove managed-pointee cleanup. No sanitizer or memory-safety conclusion is inferred.

Decision: preserve the exact original erase call and ordering. Do not insert overwrite_values or normalize the two algorithms. Revisit this suspicion when actual managed Calc cell owners and their consumers are connected.

## CALC-065: failed prefix replacement retains shortened metadata and old payload

Status: confirmed controlled original trait-failure outcome; ordinary Calc failure handling and its recovery behavior are unverified.

Pinned mdds3.2.1 soa/main_def.inl set_cells_to_single_block first shortens the current block metadata when replacing its upper part, then creates and fills a replacement block for the lower values. A creation failure or throwing assign_values_from_block propagates without restoring the original metadata. For a three-row double block and a one-row uint16 prefix, the retained container has logical size3, metadata size2 and old element payload size3. This is suspicious for callers that continue using the container after an exception; no guarantee of such continued use or full Calc consumer defect is established.

Evidence: task70 native-container-range-cases.json scalar stream includes two controlled caller-only trait failures against complete unchanged original headers. The null creation throws the original logic_error text; assignment failure invokes the original unique_ptr deleter on the empty new block before propagation. Both complete retained-state/clear streams match the portable owner. These are explicit fault-injection witnesses, not naturally occurring allocation failures, sanitizer results or a certification of generic exception safety.

Decision: preserve the original metadata-before-allocation order, temporary cleanup and retained partial state. Do not add rollback or normalize the block after failure.

## CALC-066: opcode diagnostic numeric fallback is unreachable

Status: confirmed original unreachable tail; no Calc consumer defect is established.

At pinned9bc445578031fecf56086729d8e4940c77e14d65, include/formula/opcode.hxx OpCodeEnumToString returns a name in every explicit switch case. Its default asserts(false) and returns "???". The following ostringstream conversion of the numeric opcode can therefore never run, including in release builds where assert is disabled. This looks like a leftover fallback; the header explicitly labels the helper as debug-only with unstable output, so this is not a demonstrated spreadsheet defect.

Evidence: task74 scripts/formula-opcode-native-probe.mjs compiles the whole unchanged original header normally with NDEBUG and compares all65536UInt16 diagnostics. Unknown code1 returns "???"; original range-end sentinel values36/49/67/72/84/180/521 also return "???". A separate ordinary debug caller without NDEBUG confirms the original assertion and SIGABRT for code1. No sanitizer or memory-safety inference is involved.

Decision: preserve the actual release switch output. Do not replace "???" with the unreachable numeric conversion or manufacture names for range sentinels. Native debug process termination is recorded as a separate profile; the browser owner claims release behavior only.

## CALC-067: early parameter-count return hides some string-op byte fields

Status: confirmed original control-flow asymmetry; no user-visible Calc defect is established.

At pinned9bc445578031fecf56086729d8e4940c77e14d65, FormulaToken::GetParamCount first returns zero for special opcodes below ocStopDiv unless they belong to its explicit exception list. The later string-token branch nevertheless checks ocBad, ocStringXML, ocStringName and ocDPFieldName and reads their byte count. In particular, a real FormulaStringOpToken(ocStringXML, string) with SetByte(3) returns zero before reaching that branch. The coexistence of the early filter and later explicit cases looks suspicious, but the complete compiler and Calc consumers are not implemented and their intended use is not established.

Evidence: task75 scripts/formula-token-native-probe.mjs compiles whole original token and compiler headers plus complete original selected member definitions over actual SAL, SharedString and Boost owners. Its normal-only values stream observes byte3 through original initialization and a zero parameter count for the actual ocStringXML token. The portable implementation preserves the same early return and reachable string cases; the initial unit-test expectation of three was corrected to the observed zero. The two already-excluded ocBad/ocStringXML comparisons are documented at the original TS branch rather than emitted as unreachable comparisons. A further whole65536-opcode stream checks original GetParamCount for actual FormulaStringOpToken values with bytes0/1/255, including the reachable ocStringName/ocDPFieldName alternatives. No sanitizer or memory-safety conclusion is involved.

Decision: preserve the original early return and later cases. Do not move the string-token branch or derive parameter counts directly from stored bytes. Revisit consumer reachability when the original compiler/input owners are connected.

## CALC-068: hybrid result equality omits the empty-display flag

Status: confirmed original field omission; a Calc consumer defect is not established.

Pinned sc/source/core/tool/token.cxx ScHybridCellToken::operator== compares the base type/opcode, mfDouble, maString and maFormula, but does not compare mbEmptyDisplayedAsString. Two valid zero-valued tokens with an empty shared string and the same formula therefore compare equal even when IsEmptyDisplayedAsString differs. The analogous ScEmptyCellToken equality does compare its display flag. Full consumer behavior is still unported, so this is a suspicious asymmetry, not a demonstrated spreadsheet defect.

Evidence: task76 scripts/sc-result-token-native-probe.mjs compiles complete unchanged original selected class declarations/member definitions over real shared owners. The ordinary NDEBUG hybrid stream includes the valid empty-string flag pair (pattern0) and preserves flag_equal1; other initialized release-only combinations do not claim satisfaction of the native debug assertion.

Decision: retain the original omission and both query results. Do not add the flag to equality. Native debug assertion termination and full ScFormulaResult consumers remain unverified.

## CALC-069: scalar matrix construction accepts a type rejected by matrix queries

Status: confirmed original constructor/query asymmetry in the pinned mdds dependency; a Calc consumer defect is not established.

The original multi_type_matrix mtv_traits registers int8_element_block, while to_mtm_type and get_numeric/numeric do not recognize int8 for std_string_traits. Its scalar constructor delegates directly to the vector without matrix type validation. A fully initialized 1x1 matrix filled with int8_t(4) therefore constructs successfully, but get_numeric and numeric throw the original unknown-element-type diagnostic. The range constructor explicitly validates its first block and rejects an int8 range during construction. This may be intentional legacy/internal support; actual Calc consumers use their own UInt16/UInt8 integer aliases, which are recognized.

Evidence: task78 scripts/calc-matrix-native-probe.mjs compiles the full unchanged mdds3.2.1 multi_type_matrix/vector headers from the pinned LibreOffice download.lst archive and patch, over genuine dependencies. The ordinary scalar stream captures rangeerror, numericerror and allnumericerror from initialized actual int8 matrices. No invalid lifetime, sanitizer or memory-safety inference is involved.

Decision: preserve registration and the different validation points. Do not silently promote int8 to the configured integer type or add a scalar-constructor check. Revisit consumer reachability when the original ScMatrix owner is connected.

## CALC-070: matrix geometry dispatch omits its supported integer element type

Status: confirmed original dependency dispatch omission; a user-visible Calc defect is not established.

Pinned mdds3.2.1 multi_type_matrix recognizes its configured integer block as element_integer for typed queries and input-range copy. The matrix-to-matrix copy and transpose switches handle numeric, boolean, string and empty, but omit element_integer. Their default throws the original unknown-element-type diagnostic. Resize constructs a temporary and calls matrix copy, so it also throws when copying a nonempty integer section. A zero dimension bypasses copying and clears successfully.

Evidence: task79 scripts/calc-matrix-geometry-native-probe.mjs compiles full unchanged original matrix/vector headers over genuine dependencies. Its ordinary initialized streams observe the omission for std_string_traits int32, original Calc matrix_traits UInt16 and matrix_flag_traits UInt8. An earlier string section is retained in the destination when matrix copy later encounters an integer; failed transpose and resize preserve the source and release temporary strings. Input-range integer copy succeeds. Original ScMatrixImpl::MatCopy/MatTrans/Resize source paths use these operations, but their complete consumers and document behavior are not yet implemented or certified.

Decision: preserve the missing switch alternatives, partial destination updates and exception/lifetime behavior. Do not add integer branches or make copy transactional. Revisit actual consumer reachability when ScMatrix and its flag operations are connected.

## CALC-071: inclusive matrix walk endpoint accepts the row count

Status: confirmed original range validation asymmetry in the pinned mdds dependency; a Calc consumer defect is not established.

Original ranged multi_type_matrix::walk rejects an endpoint only when end.row is greater than the row count, although the endpoint is inclusive. A fully initialized 2x2 matrix containing one numeric block therefore accepts start(0,0), end(2,0) and calls the visitor with three elements: the third belongs to the next column in the underlying column-major store. This observation uses an existing initialized third element, not an invalid iterator or an out-of-storage read. The parallel ranged overload has the same strict greater-than validation; its corresponding boundary behavior has not yet been separately certified.

Evidence: task80 scripts/calc-matrix-walk-native-probe.mjs compiles whole unchanged original matrix/vector headers with verified pinned dependency sources. Its ordinary scalar stream records one numeric section of size3 for the initialized 2x2 spill caller. The portable full-stream replay matches the same section. Original ScMatrix/input consumers and user-visible reachability remain unimplemented.

Decision: preserve the original validation and inclusive traversal. Do not change greater-than to greater-than-or-equal or clamp the section to a column. Do not use this initialized case to claim safety for endpoints at the final column or invalid store positions.


## CALC-072: matrix resize overloads use different error initializers and may preserve prior cell data

Status: confirmed original fallback asymmetry and storage behavior; a user-visible defect is not established.

In pinned sc/source/core/tool/scmatrix.cxx, invalid-size constructors and the unfilled ScMatrixImpl::Resize initialize a1x1 matrix with FormulaError::MatrixSize. The filled Resize overload instead uses FormulaError::StackOverflow. The underlying mdds resize constructs a filled temporary and copies existing cells into it, so an existing cell can overwrite that fallback error. Starting from a zero-sized matrix preserves the selected error; resizing an already initialized1x1 matrix to an invalid one-zero shape may retain its old cell instead.

Evidence: task84 ordinary unchanged original constructor/Resize/geometry definitions over genuine mdds/SAL/SVL. Complete native and portable streams cover both overloads, empty-before-invalid fallback and initialized-cell preservation; no invalid memory access, sanitizer or large allocation is required.

Decision: preserve the two error choices and the existing-cell copy behavior. Do not force the new error into retained cells or normalize the filled overload to MatrixSize. Revisit actual interpreter/UI consumer reachability when those owners are implemented.


## CALC-073: PutError omits coordinate validation and can write into the next column

Status: confirmed original coordinate-write asymmetry; a user-visible defect is not established.

ScMatrixImpl::PutError calls maMat.set directly, whereas coordinate number/string/boolean/empty/path writes first check ValidColRow. In a2x2 matrix, PutError(StackOverflow,0,3) therefore writes the encoded error at flat offset3, corresponding to column1,row1, despite row3 being outside the declared rows. A column9,row0 write instead exceeds the underlying storage and throws its normal bounds exception. Other scalar writes with invalid coordinates do nothing.

Evidence: task85 ordinary unchanged original coordinate definitions over genuine mdds/SAL/SVL/formula dependencies. Complete original/portable streams compare this initialized in-storage write and a normal bounds exception, alongside coordinate Get/predicate observations. No out-of-storage read, sanitizer or fake interpreter is needed.

Decision: preserve the missing guard, column-major mapping and native exception behavior. Do not clamp coordinates or normalize PutError to other scalar writes. Actual interpreter/UI consumer reachability remains future work.


## CALC-074: ScCellValue self move assignment empties the cell

Status: confirmed original logical behavior for scalar families; no claim that self move must retain the old value.

ScCellValue::operator=(ScCellValue&&) first clears the destination, then moves rCell.maData and resets the source. When destination and source are the same cell, the first clear already makes the source empty. Self move assignment therefore loses a prior numeric or string value and leaves CELLTYPE_NONE. This is defined scalar behavior in the selected source, not a pointer lifetime or allocator experiment.

Evidence: task86 complete ordinary original scalar stream compares number/string self move, normal move source emptiness, scalar setters and swaps; only actual empty/number/SharedString alternatives are instantiated. No fake formula/rich-text object or sanitizer is used.

Decision: preserve the clearing order and source reset. Do not insert a self-move early return to retain the value. Document/cell-store/UI consumer reachability remains future work.

## CALC-075: matrix formula Assign overloads differ in numeric upper-left cloning

Status: confirmed original overload/alias asymmetry; a user-visible defect is not established.

ScMatrixFormulaCellToken::Assign(const ScMatrixCellResultToken&) calls base Assign then CloneUpperLeftIfNecessary. The generic Assign(const FormulaToken&) identifies a matrix-result argument and calls only base Assign, retaining its numeric upper-left reference. SetUpperLeftDouble on that generic target therefore also changes the source transport result and the original shared numeric token; the typed target keeps its independent original numeric value. Typed self-assignment clones its numeric upper-left; generic self-assignment returns immediately. A call through the nonvirtual ScMatrixCellResultToken base likewise shares the upper-left.

Evidence: task88 scripts/calc-matrix-token-native-probe.mjs compiles complete unchanged original matrix-result token classes/member scopes with real formula tokens and verified real matrix constructor/storage dependencies, normally only. The full stream observes typed/generic assignments, source/target mutations, self-assignment and qualified base assignment. No pointer address, native ownership counter or sanitizer experiment is needed.

Decision: preserve both overloads and their aliases. Use the actual FormulaToken type witness for the generic overload and qualified prototype calls for native nonvirtual base selection. Do not silently add numeric cloning to the generic branch. Real formula-cell/interpreter/UI reachability remains future work.

## CALC-076: numeric matrix formula copies compare unequal to their source

Status: confirmed surprising original clone/equality interaction; a user-visible defect is not established.

ScMatrixFormulaCellToken copy construction clones a double upper-left via CloneUpperLeftIfNecessary. Its equality delegates to ScMatrixCellResultToken, which compares upper-left pointer identity. Thus a numeric matrix formula token compares unequal to its own copy/Clone despite equal values, matrix identity and dimensions. Null and shared nonnumeric upper-left tokens can compare equal after copying.

Evidence: task88 complete original normal matrix-result token stream records formula_equal for null, double, string, unknown and error upper-left tokens, including original constructors and virtual Clone/equality bodies. Portable replay preserves every result. No native ownership count or memory-management experiment is required.

Decision: preserve identity comparison and numeric cloning. Do not substitute upper-left value equality or share the mutable numeric token to make copies compare equal. Actual formula-cell/UI effects remain unverified.

## CALC-077: formula multiline cache survives an external string-token mutation

Status: confirmed original cache/alias behavior; a user-visible defect is not established.

ScFormulaResult stores ordinary string-token identity and caches IsMultiline. If a caller retains the genuine mutable FormulaStringToken and changes its string after that query, subsequent GetString/GetResult expose the new text but keep the prior multiline flag. Calling SetToken again resets the cache and rescans. A string changing from A to A-LF-B can therefore retain false until the result setter runs.

Evidence: task89 full unchanged ScFormulaResult/header/source over genuine token/matrix/string dependencies, normal native public histories and complete portable replay. The caller retains an actual token and uses original SetString; no private-state or lifetime violation is forced.

Decision: preserve cache and reset responsibilities. Do not rescan on every query or invent an observer binding to mutate the result flag. Actual formula-cell/UI reachability remains unverified.

## CALC-078: GetErrorOrDouble retains caller error output

Status: confirmed original output-reference behavior; caller requirements and user-visible defects remain unverified.

The cached-value fast path assigns rVal but does not clear rErr. Later paths likewise test the caller's existing rErr before numeric classification and may return true without writing rVal, even for string/unknown values. An initialized caller error can therefore survive a successful numeric query; fresh NONE is observably different. Internal SetResultError controls the result's own error and does not reset caller storage.

Evidence: task89 complete unchanged native result class/source histories query each state with initialized NONE and DivisionByZero out errors and a fixed initialized numeric output. Portable replay preserves all return values and untouched fields without changing thresholds or forcing private state.

Decision: preserve original output writes and precedence. Do not automatically clear caller error or numeric storage. Audit actual original consumer initialization when those owners are ported.

## CALC-079: token removal skips adjacent duplicate RPN references

Status: confirmed original traversal asymmetry; a user-visible defect is not established.

FormulaTokenArray::RemoveToken shifts remaining RPN entries down after a match, then the outer forward loop increments its index. An adjacent equal reference shifted into the current slot is skipped. Removing code token x from RPN x,x,x,y leaves one x reference and y, despite removal from active code. Nonadjacent duplicates can both be removed.

Evidence: task90 complete unchanged selected normal array functions and initialized pointer ranges over genuine tokens. The caller retains genuine token references, so the leftover RPN identity is live; no freed-pointer or sanitizer experiment is used. Complete portable replay preserves active RPN contents and lengths.

Decision: preserve original forward-index traversal and leftover identity. Do not decrement the scan index, deduplicate or clean all matches. Audit actual compiler/document consumer effects when those owners are ported.

## CALC-080: moved token array retains finalized source flag

Status: confirmed original moved-source metadata behavior; a defect is not established.

FormulaTokenArray::Move transfers buffers and zeros source nLen/nRPN but leaves source flags/error/recalc state. Moving a finalized code array therefore leaves an empty source that still rejects appending a new token. Clear restores the ordinary editable default. Copying nonempty code also finalizes its copied buffer, irrespective of the source's prior flag.

Evidence: task90 unchanged original constructor/Assign/Move/Finalize/Add functions, initialized normal source/copy/move histories and explicit moved-source append observation. Portable replay matches all flags, lengths, identities and rejection.

Decision: preserve moved-source flags and original finalization/rejection. Do not silently reset or reopen the moved-from array. User-visible consumer effects remain unverified.

## CALC-081: mutable shared default calculation opcode set

Status: confirmed original cross-instance value alias; a user-visible defect is not established.

ScCalcConfig::setOpenCLConfigToDefault assigns a static shared_ptr to a mutable sorted_vector. Changing a default configuration's set also changes later default constructions and reset results; reset reassigns that same set rather than rebuilding its contents. The partial default operation also leaves maOpenCLDevice and document-specific settings untouched, whereas full reset clears those value fields.

Evidence: task92 unchanged original full headers and instance methods with genuine o3tl::sorted_vector and OUString, normal mode only. An initialized caller inserts ocOffset into the shared default, observes a later construction and reset, then removes it to restore the original set. Portable replay retains the exact alias/contents and ordered uniqueness. No memory/sanitizer experiment or actual document consumer defect claim.

Decision: preserve original mutable default identity and partial-reset field behavior. Do not freeze, clone or reconstruct the static set. Audit actual configuration consumers when those owners are ported.

## CALC-082: unspecified grammar convention extraction leaves enum range

Status: source-confirmed unsupported sentinel conversion; a user-visible defect is not established.

FormulaGrammar::extractRefConvention clears the English bit, performs signed right shift and subtracts kConventionOffset, then casts to AddressConvention. For GRAM_UNSPECIFIED=-1 the integer expression computes-259, outside the original AddressConvention enum range. Calling convention-dependent OOXML/Excel predicates on this sentinel therefore cannot serve as valid initialized native enum evidence.

Evidence: unchanged pinned grammar.hxx expression, original enum declarations and task93 ordinary full grammar caller. The preliminary observer was corrected before acceptance: negative grammar states retain valid English/language/support observations, while native convention/ref/Excel fields explicitly say excluded. No sanitizer or invalid-enum process behavior is certified. Portable code preserves the original signed arithmetic; no sentinel fallback or invented validation is added.

Decision: retain upstream arithmetic and audit original caller preconditions when document/compiler owners are ported. Do not infer user-visible damage from this source expression alone.

## CALC-083: document option equality omits ignore-line-breaks flag

Status: source-inspected comparator omission; rationale and user-visible consequences are unverified.

ScDocOptions declares bIgnoreLineBreaks, resets it to false, and exposes IsIgnoreLineBreaks/SetIgnoreLineBreaks. Its inline operator== explicitly compares the other option fields but never reads bIgnoreLineBreaks. The flag is therefore absent from the original equality expression.

Evidence: pinned sc/inc/docoptio.hxx member/accessors/inline equality and sc/source/core/tool/docoptio.cxx reset body, inspected during task94 dependency analysis. No native ScDocOptions instance or document consumer has been reproduced: its genuine locale/configuration/formatter peers are still pending. This is source evidence only, not an executed document comparison or proven defect.

Decision: preserve the original equality expression when the actual owner is ported and audit downstream change/save detection. Do not silently add the flag to comparison or supply fake peers to manufacture native evidence.

## CALC-084: reference text equality depends on receiver sheet limits

Status: confirmed original initialized comparison asymmetry with different bounds; a user-visible defect is not established.

ScSingleRefToken/ScDoubleRefToken::TextEqual passes its own mrSheetLimits to checkTextEqual. Both references are converted at the origin using only those limits. A single token at(4,4,0) with maximum column/row1 and another at(5,5,0) with maxima20/30 therefore compare text-equal in the first direction (both coordinates collapse to invalid), but not in reverse (both are distinct valid coordinates). Raw token equality remains false. Copies and clones retain the receiver limits and the same result.

Evidence: task95 complete original class/helper/member definitions over genuine reference/address/limit headers, initialized normal-only bounds/copybounds/clonebounds observations, and matching portable replay. Intended same-document/bounds caller preconditions and real sorting consumers remain unverified; no unsupported staticcast, overflow, memory or full document experiment.

Decision: preserve receiver-limit selection and original invalid-coordinate normalization. Audit real compiler/document/sort callers before attributing user-visible impact; do not silently symmetrize the comparison.

## CALC-085: reference-list tokens compare collection identity

Status: confirmed original initialized equality behavior; rationale and user-visible consequences are unverified.

ScRefListToken::operator== compares the address of its own aRefList vector with the other token's GetRefList() before comparing mbArrayResult. Distinct copies/clones have independent vector objects and therefore compare unequal even when all copied ranges and the array-result flag match. Self comparison succeeds. ScTableRefToken copies clone an area token; a list-token area consequently makes a table copy compare unequal under the original area-payload comparator.

Evidence: task96 complete unchanged original list/table class declarations and members over genuine shared/reference dependencies, initialized normal-only self/copy/Clone/list/table-area observations and full portable replay. Native getters and constructors permit this initialized list-area input; whether real document consumers use it remains unverified. No private-state forcing, fake type peers or memory/count experiment.

Decision: preserve collection-object equality and area Clone semantics. Audit original union/structured-reference consumers before identifying a defect; do not substitute deep list equality.

## CALC-086: external range equality creates a value temporary

Status: source-confirmed implicit right-hand token copy; rationale and user-visible impact are unverified.

ScExternalDoubleRefToken::operator== declares auto rhs = static_cast<const ScExternalDoubleRefToken&>(r). Plain auto drops the reference qualifier, so rhs is a value copy rather than a borrowed reference. The original defaulted token copy constructor copies reference-data fields and the SharedString value before name/range comparison. This is an extra native value temporary on the comparison path.

Evidence: pinned sc/source/core/tool/token.cxx comparison declaration and sc/inc/token.hxx defaulted copy constructor, inspected in task97. The normal complete original method stream confirms equality outcomes, but no count/allocation/performance or concurrency experiment is performed. Whether this is intentional and whether real consumers are affected remain unverified.

Decision: preserve observed synchronous value comparisons. Under the user-authorized JS GC adaptation, do not reproduce incidental native stack copies or reference-count traffic when reading initialized final-class values has the same result; actual string/refdata copy/move constructors remain explicit where their copied/moved state is observable. Do not claim a user-visible defect or silently alter equality.

## CALC-087: matrix-range token equality omits its range

Status: confirmed original initialized equality behavior; intended consumer semantics and user-visible consequences are unverified.

ScMatrixRangeToken adds maRef and true IsMatrixRangeToken but inherits ScMatrixToken::operator== without overriding it. The inherited comparator checks only FormulaToken type/opcode and matrix identity. Two actual matrix-range tokens with different stored coordinate endpoints therefore compare equal when sharing a matrix. It also compares equal with an ordinary ScMatrixToken holding that same matrix; inherited TextEqual follows the same virtual comparison.

Evidence: task98 complete original class/header/member scopes over real matrix peers/full original matrix implementation declaration, normal initialized same-matrix/different-range/base-token/null-matrix comparisons and matching portable replay. Original range members remain distinct value copies. No invalid staticcast/type fabrication or memory/count experiment; original document/interpreter consumer behavior remains unexecuted.

Decision: preserve inherited matrix identity comparison and range-value copying. Audit original interpreter/grouping consumers later, without silently adding coordinates or class-kind checks to equality.

## CALC-088: external range extension has asymmetric result handling

Status: confirmed original initialized token-level outcomes; actual compiler/parser consumer effects are unverified.

The range helper accepts an external-double left operand in its initial kind guard but does not select it as the result double. With a local single on the right it reaches the no-result return and yields null. With a local double on the right it clones that local double, extends its data from the external left operand when 3D guards allow, and returns an ordinary local-double token without the original external file/table metadata. External-single plus local single has a separate branch that creates an external-double result and retains file/table identity.

Evidence: task99 full unchanged original extendRangeReference/class/reference-data scopes with real initialized peers, clone-path normal complete result/input stream including external/local kind and flag combinations, and matching portable replay. Cases use the actual resulting type/file id, no invalid casts or fake metadata provider. Parser/compile preconditions, whether these combinations occur in normal documents and user-visible harm remain unverified; unique native reuse optimization is a separate explicitly documented GC boundary.

Decision: preserve original acceptance/rejection/result kinds and metadata behavior. Audit real original parser/range consumers later; do not silently externalize results or extend rejected combinations.

## CALC-089: merge span copying and equality handle Which differently

Status: confirmed original source behavior; caller consequences and whether this is intentional are unverified.

ScMergeAttr explicit copy construction initializes SfxPoolItem with fixed ATTR_MERGE144, so copying and Clone reset a source whose Which was changed. Its assignment operator copies only the two spans and leaves the recipient base identity unchanged. Same-type equality delegates to SfxPoolItem::operator==, which asserts matching ItemType and returns true without comparing Which, then compares the spans. Thus equal spans in the same item type compare equal despite different Which values. ScMergeFlagAttr uses a defaulted copy constructor instead, retaining the base identity.

Evidence: complete original declarations and bodies in sc/inc/attrib.hxx, sc/source/core/data/attrib.cxx and svl/source/items/poolitem.cxx at the repository pin; task103 source-backed copy/Clone/assignment/equality tests over real shared items. No compiled-native differential, invalid-type assertion or complete document QA claim. Normal Calc callers may always retain the fixed attribute id, making this a deliberate type-specific contract rather than a defect.

Decision: preserve fixed-id copying, payload-only assignment and same-type Which-independent equality. Do not normalize equality or copy the base id in ScMergeAttr; audit real document callers later.

Task104 source follow-up for CALC-089: ScProtectionAttr also explicitly initializes its fixed ATTR_PROTECTION149 in the copy constructor, copies only payload in assignment and ignores Which in same-type equality. Preserve the same pattern; intended fixed-id caller constraints remain unverified.

## CALC-090: configuration node copying drops description

Status: source-confirmed omission; intended schema/consumer semantics and user-visible impact are unverified.

Node copy construction initializes only layer and finalized metadata. Its OUString description member is default-constructed empty. GroupNode clone invokes that base copy constructor, so both clone modes lose the group description; cloned child groups lose their descriptions too, although child templates are retained through clone(true). This may intentionally strip schema metadata.

Evidence: pinned configmgr/source/node.hxx and node.cxx plus groupnode.cxx, reviewed in task105. Source-backed tests use real initialized GroupNode trees and verify empty cloned descriptions while originals retain theirs. No compiled-native differential or complete configuration-service QA claim.

Decision: preserve omission without silently copying descriptions. Audit real schema/configuration consumers before calling it a defect.

## CALC-091: unsigned configuration type classification uses type compatibility rather than range

Status: source-confirmed initialized type-level behavior; intended schema/parser constraints and user-visible impact are unverified.

configmgr getDynamicType selects a signed schema type for unsigned short/long/hyper when Any.has of the corresponding signed type succeeds. That predicate delegates through isExtractableTo and uno_type_isAssignableFromData to the original typelib primitive compatibility table. The table accepts each same-width signed/unsigned pair regardless of the stored numeric value. Thus even maximum unsigned values classify as TYPE_SHORT/TYPE_INT/TYPE_LONG; the wider/error false alternatives cannot be reached through ordinary initialized primitive Any values. This is not a numeric fit test.

Evidence: pinned configmgr/source/type.cxx, include/com/sun/star/uno/Any.hxx, cppu/source/uno/data.cxx and cppu/source/typelib/typelib.cxx, inspected in task106. Source-backed tests use actual Any/UnoType values, including maximum unsigned boundaries. No fake has result or value-provider subclass, compiled differential, native memory or full configuration-service QA claim. False alternatives remain source-reviewed only; raw TypeScript coverage does not certify their reachability.

Decision: retain the original assignability call and classification. Boolean-indexed result alternatives preserve the original selection in JS without inventing range checks or unreachable producer states. Audit real configuration/parser consumers before labeling it a defect.

## CALC-092: modification removal can recurse to an empty forbidden path

Status: source-confirmed recursion into a failed precondition; native release outcome and real consumer reachability are unverified.

Modifications::remove asserts that its path is nonempty. After removing the addressed child, it recursively calls remove on the parent path whenever the immediate parent has no children. If deleting the last root subtree, that parent path is empty. A native debug assertion can therefore fail; with assertions disabled the next path iterator dereference is outside the valid domain, so no particular no-op, crash or return value is promised.

Evidence: complete pinned configmgr/source/modifications.hxx and modifications.cxx, reviewed in task107. Valid removal histories retain another root sibling and verify recursive parent pruning without entering the invalid domain. No invalid native execution, sanitizer/memory experiment, compiled differential or complete configuration-service QA claim.

Decision: preserve the recursive algorithm without silently adding a root-stop guard. Document the invalid-domain boundary and audit actual callers before identifying a user-visible defect.

## CALC-093: malformed configuration suffix validation depends on node existence

Status: source-confirmed early-return behavior; real consumer expectations and user-visible impact are unverified.

Data::resolvePathRepresentation returns null as soon as the current node is missing, before validating the separator or parsing remaining segments. For example, a bare quoted first component followed by junk is resolved to a component key before checking the trailing separator. When that component exists, the method throws bad path; when absent, it returns null without rejecting the same malformed suffix. Canonical/finalized outputs remain unassigned, while the path vector may contain a successfully traversed prefix. This may deliberately prioritize missing-node lookup over full syntax validation.

Evidence: complete pinned configmgr/source/data.hxx/cxx, reviewed in task108, with source-backed real Data/Group tests comparing the same malformed suffix for an existing and absent component. No fake node/provider, compiled differential, native invalid-domain experiment or full configuration-service QA claim.

Decision: retain early return and partial-output timing. Do not introduce eager whole-path validation or transactional outputs without an upstream contract change; audit real consumers before calling it a defect.


## CALC-094: hexadecimal XML references overwrite the numeric value

Status: source-confirmed algorithm; native debug/release difference and consumer impact require care.

XmlReader::handleReference assigns each hex digit to val instead of accumulating it. The terminating semicolon is then passed to convertToHex and replaces val with its uint32 error sentinel0xffffffff before the loop breaks. Native debug asserts isUnicodeCodePoint(val); the source release encoder truncates its four output bytes to FF BF BF BF, which strict UTF8 conversion rejects. The earlier overflow throw inside the loop is unreachable: valid digits0..15 are Unicode code points and all invalid digits break before that test.

Evidence: pinned xmlreader/source/xmlreader.cxx, include/o3tl/numeric.hxx and include/rtl/character.hxx; task110 public Reader byte-output tests and exhaustive256byte native JS classification proof. No compiled-native differential, debug execution or claim that malformed hex input returns a valid scalar.

Decision: preserve the source release byte behavior and conversion failure; omit only the provably unreachable overflow throw. Audit actual configuration consumers before identifying user-visible consequences.

## CALC-095: normalized CDATA can retain markup and duplicate content

Status: source-confirmed flow-boundary behavior; intended semantics and real caller impact unverified.

In normalized text mode, scanCdataSection advances pos beyond the CDATA closing delimiter. If the prior whitespace state is None or Span, handleNormalizedText appends flowBegin through this advanced pos, including the CDATA markup, then appends the CDATA content again through normalizeLineEnds. Thus a<![CDATA[b]]> produces a<![CDATA[b]]>b. Initial CDATA and a preceding whitespace Break use different paths.

Evidence: complete pinned XmlReader::handleNormalizedText and scanCdataSection, with task110 actual reader tests of Start/None/Span/Break cases. No compiled-native differential or full configuration-service QA claim.

Decision: retain source output without moving the flush boundary or normalizing CDATA differently. Audit real consumers later.

## CALC-096: attribute CR normalization consults the global reader position

Status: source-confirmed use of global peek; defined in-range behavior covered, invalid native ranges excluded.

The non-collapsing handleAttributeValue CR branch advances the local pointer but checks peek(), which reads global pos rather than the byte after the CR. For an actual attribute X CR LF Y, text not starting LF yields two spaces; text starting LF yields one space. With attribute X CR Y and following text starting LF, Y is skipped. Values ending CR with that same global LF can violate the native local range invariant; no native release result is promised for those invalid accesses.

Evidence: pinned XmlReader::handleAttributeValue and header peek; task110 actual public reader inputs and attribute queries. No invalid native execution, sanitizer, memory experiment or compiled differential claim.

Decision: preserve global-peek behavior on defined inputs. Browser invalid input offsets retain native DataView RangeError; this is a host boundary, not native undefined-behavior emulation. Audit schema/configuration consumers later.


## CALC-097: boolean cell-attribute Clone resets Which while implicit copy retains it

Status: source-confirmed construction difference; normal pool callers and user-visible consequences remain unverified.

ScShrinkToFitCell, ScVerticalStackCell, ScLineBreakCell and ScHyphenateCell have implicit copy constructors that copy the SfxBoolItem base and retain a changed source Which. Their Clone implementations instead construct a new concrete item from GetValue, restoring that class's fixed attribute identity. Same-type SfxBoolItem equality compares only the payload after the base item-type assertion, so differing Which values do not make otherwise equal bool items unequal.

Evidence: complete pinned attrib.hxx/cxx, scitems.hxx, include/svl/eitem.hxx, cenumitm.cxx and SfxPoolItem::operator== scopes; task112 actual owned-item copy/Clone/equality histories and real shared pool/item-set consumers. No fake provider, native invalid downcast execution, compiled differential, native instance-cache or full document QA claim.

Decision: preserve implicit-copy identity, fixed-id Clone and payload-only same-type equality. Correct shared bool behavior and its previous Which-sensitive test rather than duplicate a Calc-specific workaround. Audit normal document/pool callers before calling this a defect.


## CALC-098: sorted_vector initializer-list construction retains duplicate values

Status: source-confirmed constructor difference; user-visible impact remains unverified.

The original include/o3tl/sorted_vector.hxx initializer-list constructor copies values and calls std::sort without a unique pass. Single insertion rejects comparator-equivalent values. ScCondFormatItem takes that actual vector by const reference or move, so construction and copies must preserve duplicate indices. Its Clone reconstructs from the vector and restores Which154, whereas implicit copy retains the source Which. Preserve this behavior; do not normalize through repeated unique insertions. Task113 tests real shared vector and Calc item histories. No compiled native or full-document QA claim.

## CALC-099: page-scale Any accepts signed16 negative values as unsigned dimensions

Status: source-confirmed typed conversion, not identified as a defect.

ScPageScaleToItem::PutValue extracts sal_uInt16 from an actual Any. Original cppu/source/uno/assign.hxx accepts SHORT and UNSIGNED_SHORT at equal width by reading their bits as unsigned16. Thus a typed signed16 -1 becomes65535, while a LONG is rejected even when its value would fit. Preserve actual shared Any conversion; do not add a value-range policy to the native typed path. The explicit browser scalar transport only accepts unsigned16 numbers. Task113 uses the existing actual CPPU owners; no duplicate conversion engine.


## CALC-100: enum-item equality ignores Which while its hash includes Which

Status: source-confirmed asymmetry; valid pooled-caller impact remains unverified.

SfxEnumItemInterface compares GetEnumValue after the native base type assertion, without comparing Which. SfxEnumItem additionally compares full EnumT payload. Its hashCode returns Which xor GetEnumValue. Consequently same-type equal enum items with different Which values can have different hashes. Calc ScViewObjectModeItem reuses the template for three page-output identities. Keep equality and hashing as written; audit native item-manager key partitioning before identifying a defect. Task114 checks actual shared generic values and Calc copies. No full document/native runtime certification.


## CALC-101: unsigned16 legacy Any input wraps out-of-range signed32 values

Status: explicit upstream compatibility, not identified as a defect.

CntUInt16Item::PutValue first attempts sal_uInt16 extraction, then deliberately accepts sal_Int32 for old callers. It emits warnings for negative or overflowing values but still static_casts to unsigned16, so signed32 65537 becomes1 and -1 becomes65535. CntUInt32Item projects unsigned bits through signed32 Any, accepting the corresponding signed32 extraction. Preserve these paths through actual shared CPPU, without adding a range rejection to typed Any input. Existing checked JS scalar constructor bounds remain a separately documented browser domain.

Unsigned16/32 same-type equality also ignores Which after the original base assertion, while their o3tl hash fold includes Which. This parallels CALC-100; keep the source contracts and inspect native pool key partitioning before declaring a defect. ScIndentItem implicit copy retains Which, but its value-based Clone restores131. Task115 checks these real shared/Calc histories; no compiled native or full-document certification.


## CALC-102: angle values accept signed32 minimum while presentation negates negative signed32

Status: source-level suspicious arithmetic; native runtime consequences unexecuted.

Degree100 is a signed32 hundredths-of-degree value. SdrAngleItem stores that payload without normalization. In svx/source/svdraw/svdattr.cxx GetPresentation copies it into sal_Int32 nValue and performs nValue = -nValue when negative. For INT32_MIN the positive mathematical result does not fit signed32, so this expression appears to enter C++ signed-overflow undefined behavior. No sanitizer/native experiment or invented expected text is added. Preserve valid full-width stored angle values and do not add normalization or a minimum-value rejection. Localized presentation remains pending; resolve its defined-domain adaptation with the real locale/presentation owners.

ScRotateValueItem implicit copy retains Which, while its GetValue-based Clone restores135; SdrAngleItem Clone explicitly retains Which. Task116 tests actual shared/Calc copy histories and degree values, not the suspicious native presentation path.


## CALC-103: alignment setters can return success after failed extraction or ignored member

Status: source-confirmed behavior; consumer-visible impact remains unverified.

SvxVerJustifyItem::PutValue ignores the result of extracting the default long member. Failure leaves the initialized STANDARD value, resets the stored mode to Standard and returns true. Its typed VerticalAlignment member instead returns false without mutation on extraction failure. SvxRotateModeItem also replaces failed long extraction with STANDARD, stores Standard and returns true. SvxHorJustifyItem unknown members succeed without changing state; QueryValue likewise succeeds while leaving the output Any untouched. Preserve all these differences rather than adding uniform rejection.

Vertical querying through MID_HORJUST_ADJUST maps both Standard and Block to VerticalAlignment_TOP, so that member cannot round-trip those modes. The default member uses CellVertJustify2 long values and preserves all five normal modes. These member/type distinctions are tested with actual shared items/Any and generated normal enum types. No full document/native QA or defect certification.


## CALC-104: margin writes enforce only an upper bound before signed16 narrowing

Status: source-confirmed behavior, consumer-visible defect not established.

SvxMarginItem::PutValue extracts sal_Int32 and rejects values greater than SHRT_MAX, or its rounded mm100 equivalent when CONVERT_TWIPS is selected. It does not reject values below SHRT_MIN. Negative values can therefore narrow into positive signed16 margins: raw -32769 becomes32767; converted -60000mm100 rounds to -34016twips and narrows to31520. Preserve the upper-only check and original conversion order using actual shared integral conversion, without adding a lower clamp. QueryValue returns signed32 and converts in the other direction when requested.

SvxOrientationItem matches only exact9000/27000hundredths when not stacked; negative -9000 and45000 remain Standard, while stacked overrides the angle. Keep these constructor rules without modulo normalization. Task118 uses real items/Any/common unit definitions and Writer consumers, not a fake document or compiled native probe.


## CALC-105: Stacked direction has no entry in the frame-direction presentation table

Status: source-level suspicion; no native memory experiment or consumer-visible failure established.

The pinned include/editeng/frmdir.hxx declares Stacked from WritingMode2::STACKED (7). SvxFrameDirectionItem QueryValue and PutValue explicitly handle this direction. In editeng/source/items/frmitems.cxx, getFrmDirResId has seven resource entries (indices0through6), and GetPresentation indexes that table using GetEnumValue without a local bounds check. Stacked and Unknown therefore deserve review if they reach that presentation path. The logical value/UNO mappings retain native behavior. Localized resource presentation remains unported; no fallback label or new clamp has been introduced. Task119 documents this discrepancy without executing invalid native memory access.


## CALC-106: strikeout and emphasis unknown members report success without updating output

Status: source-confirmed behavior; consumer-visible defect not established.

In editeng/source/items/textitem.cxx, SvxCrossedOutItem QueryValue/PutValue and SvxEmphasisMarkItem QueryValue/PutValue return true for unknown member identifiers after removing CONVERT_TWIPS, without modifying the destination or stored value. Strikeout bool member uses common Any2Bool: failed bool and signed32 extraction resets the value to NONE while still succeeding; its numeric member instead fails extraction without mutation. Emphasis invalid numeric input fails, but an unknown stored style maps to NONE on query. PosBelow wins when both position flags are present. Preserve these differences and original typed Any behavior rather than adding validation or normalizing flags. Localized presentation is not exercised; no native memory probe is used. Task121 tests public value histories and reuses the actual common helper for Writer automatic first-line flags.


## CALC-107: unknown font posture is truthy and reverse slants lose their reverse component

Status: source-confirmed behavior; consumer-visible defect not established.

SvxPostureItem GetBoolValue in editeng/source/items/textitem.cxx checks GetValue() >= ITALIC_OBLIQUE, so ITALIC_DONTKNOW also reports true. The former local upper bound incorrectly excluded DONTKNOW and is corrected in task122. VCL ConvertFontSlant maps reverse oblique/italic to ordinary OBLIQUE/NORMAL because the internal enum has no reverse forms; unknown initialized values fall back to DONTKNOW. QueryValue/PutValue unknown members return true with output/state untouched, while bool updates use Any2Bool fallback to NONE. Preserve these source behaviors. Native presentation/diagnostic/assertion paths are excluded; no native memory probe is used. The original SfxEnumItem equality ignoresWhich and is now shared by posture; earlier local identity-sensitive expectations are corrected from source rather than preserved as an intentional deviation.


## CALC-108: font weight uses upper thresholds and falls back to unknown above BLACK

Status: source-confirmed behavior; consumer-visible defect not established.

VCL ConvertFontWeight maps each input float to the first greater-or-equal weight constant. Values above BLACK200 and NaN fall back to WEIGHT_DONTKNOW, rather than clamping to BLACK; native float32 casts affect values just above100or200. The pinned MEDIUM wire weight is105. SvxWeightItem bool failure through Any2Bool resets to NORMAL, while numeric extraction failure leaves state unchanged; unknown members report untouched success. Its legacy signed32 extraction after failed double extraction cannot succeed for actual Any: cppu/source/uno/assign.hxx accepts BYTE/SHORT/UNSIGNED_SHORT/LONG/UNSIGNED_LONG for LONG, and all of those plus FLOAT/DOUBLE for DOUBLE. Both original extraction calls are retained without constructing a fake peer to force an impossible success path. Original threshold/cast/failure ordering is preserved, without adding clamps or native memory probes. Task123 also corrects earlier local Which-sensitive weight equality to the original shared payload comparison.


## CALC-109: ControlToItem delegates in the item-to-control direction

Status: suspicious source direction; original behavior preserved.

Pinned `svtools/source/misc/unitconv.cxx:138` implements `ControlToItem(nIn, eCtrl, eItem)` by returning `ItemToControl(nIn, eItem, eCtrl)`. The called function maps the item unit to the field unit. It does not invert that conversion even though the public function name suggests the opposite direction.

Initialized examples: `ControlToItem(200, FieldUnit::POINT, MapUnit::MapTwip)` gives10, as does `ItemToControl(200, MapUnit::MapTwip, FieldUnit::POINT)`. Converting200points into twips would instead give4000. Native `SvxFontHeightItem::SetHeight` with four arguments also calls this helper; its caller invariants and intended historical behavior have not been established.

The shared implementation retains the exact same-direction delegation. Literal initialized assertions in `apps/office/src/svtools/source/misc/native-unitconv.test.ts` distinguish it from a plausible inverse. Source inspection and ordinary TypeScript tests provide the evidence; no native build, sanitizer, binary/ABI certification or upstream issue publication occurred. An upstream correction would require separate evidence and user direction; this record does not authorize changing behavior.


## CALC-110: Font-height percentages multiply in unsigned32 before division

Status: source-defined arithmetic preserved; caller overflow limits remain unreviewed.

Pinned editeng/source/items/textitem.cxx:1055 and:1071 compute sal_uInt32((nNewHeight*nNewProp)/100) in both SvxFontHeightItem::SetHeight overloads. Height is unsigned32 and property unsigned16: multiplication wraps in unsigned32 before division. Keeping an unbounded product until after division changes the result.

Initialized height4294967295 and prop65535 produce product modulo2^32 equal4294901761 and stored height42949017. The TypeScript value owner casts unsigned32 before integral division and asserts the literal result. Zero height is native-valid; native same-type equality compares height/property/unit and ignoresWhich, correcting the prior local expectation.

The4argument overload also uses the same-direction ControlToItem helper from CALC109: height100, delta2points and coremm100 store123. Native callers may constrain these values; no full caller invariant, native binary execution, sanitizer or upstream issue report is claimed. Original defined behavior is preserved.


## CALC-111: Font-height Any updates have different failure mutation boundaries

Status: original source behavior preserved; complete consumer invariants remain unreviewed.

Pinned editeng/source/items/textitem.cxx:909ff resets property/unit before checking scalar height type/range. A correctly typed FontHeight struct with invalid Height also resets property/unit, while a wrong struct type leaves them untouched. Failed signed-short property extraction returns true without mutation. Difference update reconstructs original height before extracting the new value: a failed update can change height; repeated failures can reconstruct again with old proportion still present.

Initialized example: stored height200, prop125, relative unit, then an invalid bool Any for difference member with CONVERT_TWIPS. The call returns false and height160 with prop125 unchanged; a second failed call leaves height128. Struct Diff is ignored on successful put. Negative point difference stores signed-short bits in unsigned nProp, so querying Diff after putting-1 can return65535. Native real-height relative multiplication also wraps unsigned32 before division and the absolute reconstruction clamps rather than underflows.

Actual Any and source-derived initialized assertions in native-font-height-transport.test.ts preserve these results. No failure is normalized into an atomic update, no fake extraction peer forces unreachable numeric fallbacks, and no native binary/ABI execution or external defect report is claimed.


## CALC-112: Dark-color exception compares the full packed value

Status: source behavior preserved; the explicit exception may be intentional, no confirmed defect.

Pinned tools/source/generic/color.cxx IsDark compares the complete stored value with 0x729fcf. This opaque default shape color takes the integer luminance threshold62: its luminance151 therefore returns false. The same RGB channels with transparency1 bypass that exception and use WCAG luminance83 against threshold87, returning true. Transparency thus changes this brightness predicate even though both luminance methods themselves depend only on RGB.

The initialized color.test.ts assertions retain both cases. No RGB-only normalization or upstream fix is applied. Automatic and transparent constants sharing 0xffffffff are preserved as deliberate role aliases, not classified as an error.


## CALC-113: ComplexColor equality and hashing use different state fields

Status: original field behavior retained; potential equality/hash invariant violation, no upstream defect claim.

Pinned docmodel/source/color/ComplexColor.cxx operator== compares representation, three components, system type, last Color, theme index and transformation sequence. It omits final Color and theme usage. getHash includes final Color, but omits theme index and usage.

Two initialized RGB values with identical components and transformations compare equal after only one final Color is changed, while their field-based hashes can differ. This may conflict with equal-key hash requirements if such states enter the same hashed container. Different theme indices can compare unequal while sharing a hash; that collision alone is valid.

ComplexColor.test.ts preserves these cases, including usage-only equality/hash stability. No fields are added to equality or removed from hashing. Browser logical hashes deliberately reuse the existing scalar binding and do not certify binary std::hash<double>/size_t results; the source field mismatch exists independently of that language adaptation. Native theme/UNO consumers still require further integration review.

## CALC-114: XMLFontAutoStylePool Add returns empty for a new entry

Status: original return behavior retained; no upstream defect claim.

Pinned `xmloff/source/style/XMLFontAutoStylePool.cxx` initializes `sPoolName` to
empty in `XMLFontAutoStylePool::Add`. The existing-entry branch assigns the
stored name. The new-entry branch allocates and registers `sName`, but does not
assign it to `sPoolName` before the final return. Consequently the first Add
returns empty, the next identical Add returns the stored name, and Find can
read that name immediately after insertion. This looks surprising for an API
returning the assigned name, although callers that ignore Add and use Find
are unaffected. Preserve the source behavior and exercise both paths; the
browser property boundary registers then looks up the actual entry.

The same pool deliberately compares symbol encoding separately from all
non-symbol encodings. Full style/family/pitch values participate in its key,
while different non-symbol encodings compare equivalent. Preserve this source
rule and the source encoding export, which writes only `x-symbol`.

## CALC-115: shadow PutValue ignores IsTransparent and most extraction failures

- Upstream: `editeng/source/items/frmitems.cxx`, `SvxShadowItem::PutValue`, pinned commit `9bc445578031fecf56086729d8e4940c77e14d65`.
- Observation: `QueryValue` publishes both packed Color transparency and IsTransparent. Put reads IsTransparent but commits only Location, ShadowWidth and packed Color, so changing only the flag does not change the stored Color alpha. Non-location member extraction results and full ShadowFormat extraction results do not replace the initial success result; an incompatible Any can therefore return true and commit the queried state. A conversion query narrows width through signed short before conversion back, so even a failed field extraction can change a large stored width.
- Source example: an opaque shadow remains opaque after a successful IsTransparent=true write. Width65535 queried in mm100 becomes115596, narrows to-15476, converts back to-8774twips and stores uint16 value56762 even when the incoming width Any has the wrong type.
- Status: suspicious behavior or legacy contract, not a confirmed upstream bug. Preserve the original path and verify it with actual shared Any values; no corrective normalization.
- Local evidence: `apps/office/src/editeng/source/items/native-shadow-item.test.ts`, `apps/office/src/editeng/source/items/frmitems.shadow.ts`. Native localized presentation, raw boolean bytes and full document integration remain outside this record.

## CALC-116: SvxLineItem style member overlaps the conversion flag

- Upstream: `include/editeng/memberids.h` defines MID_LINE_STYLE0x90; `include/svl/poolitem.hxx` defines CONVERT_TWIPS0x80. `editeng/source/items/frmitems.cxx`, SvxLineItem::PutValue strips the conversion bit before switching on the member, including its MID_LINE_STYLE case. Pinned commit `9bc445578031fecf56086729d8e4940c77e14d65`.
- Observation: after byte conversion and removing0x80, the member is at most0x7f. The MID_LINE_STYLE0x90 branch therefore cannot be selected; passing0x90 selects unsupported0x10 and returns false. For a numeric Any, the source allocates a new zero-width border before rejecting the member. An absent-line scalar QueryValue returns true with untouched Any, whereas the same unsupported member on a present line returns false.
- Status: suspicious identifier/control-flow overlap, not a confirmed upstream bug. Preserve the failed style write and the observable allocation. Source-fold the unreachable style mutation instead of introducing a dead branch or fake test provider.
- Local evidence: `apps/office/src/editeng/source/items/native-line-item.test.ts`, `apps/office/src/editeng/source/items/frmitems.line.ts`. Complete BoxItem Any and broad native document behavior remain separately unverified.

## CALC-117: page descriptor name is omitted from copy and equality

- Upstream: `include/svx/pageitem.hxx` and `svx/source/items/pageitem.cxx`, SvxPageItem copy constructor/operator==, pinned commit `9bc445578031fecf56086729d8e4940c77e14d65`.
- Observation: the class stores descriptor name, numbering type, landscape and usage. The copy constructor copies only the three latter fields, leaving the name default-empty. Equality also ignores the name. Native GetPresentation reads the name, so copying can change later presentation text despite value equality.
- Status: possibly intentional auxiliary presentation state, not a confirmed defect. Preserve omission and do not invent a name getter or copy fix. The existing browser noarg state projection observes the actual fields separately from native typed Any.
- Local evidence: `apps/office/src/svx/source/items/pageitem.test.ts`, `apps/office/src/sc/source/core/data/pageattr.test.ts`; actual shared item-set copy retains the same omission. Native localized presentation is still pending.

## CALC-118: page numbering admission has no matching lower-bound presentation guard

- Upstream: `svx/source/items/pageitem.cxx`, SvxPageItem::PutValue and GetNumberingDescription, same pinned commit.
- Observation: PutValue accepts an extracted signed32 numbering value and casts to the fixed signed16 SvxNumType, including-1. GetNumberingDescription checks only `eNumType <= NUMBER_NONE` before indexing its six-entry classic-name array with that value; it has no explicit nonnegative check.
- Status: source-level suspicious invalid-data path, not a reproduced native runtime failure. Preserve the defined Put/Query behavior; do not execute/simulate undefined native array memory access or assert a specific crash outcome. Localized presentation/numbering services remain unported.
- Local evidence: `apps/office/src/svx/source/items/pageitem.test.ts` verifies negative admission and query only. The native source audit is the evidence for the unported presentation path.

## CALC-119: set-item rvalue constructor copies its named argument

- Upstream: `svl/source/items/sitem.cxx`, `SfxSetItem(sal_uInt16, SfxItemSet&&)`, and `svx/source/items/pageitem.cxx` forwarding constructor, pinned commit `9bc445578031fecf56086729d8e4940c77e14d65`.
- Observation: the Svx wrapper forwards `std::move(_pSet)`, but the base initializes `maSet(pS)`. A named rvalue-reference parameter is an lvalue expression, so this selects the `SfxItemSet` copy constructor; it does not move or reset the original set. This looks surprising for the rvalue overload and may be intentional or an overlooked copy optimization.
- Status: source-level ownership/copy observation, not a confirmed defect or memory failure. Preserve the actual copy behavior. Both erased argument categories share the same ordinary JS copy path; do not infer a move operation from the signature, port native reference counting, or add a memory manager.
- Local evidence: `apps/office/src/svl/source/items/sitem.ts`, `apps/office/src/svl/source/items/sitem.test.ts`, `apps/office/src/sc/source/core/data/pageattr.test.ts` verify independent copies with retained input pool/parent/states and unchanged source. No native compiler or memory probe is used.

## CALC-120: an all-zero slot package rescans its empty map on every access

- Upstream: `svl/source/items/itempool.cxx`, `ItemInfoPackage::getSlotIDToWhichIDMap`, pinned commit `9bc445578031fecf56086729d8e4940c77e14d65`.
- Observation: the implementation fills its cache whenever `maSlotIDToWhichIDMap.empty()`, inserting only entries with nonzero SlotID. If every slot is zero, the map remains empty and each later call scans the metadata again. The comment says it will be filled only once, but no separate initialized marker exists. The returned map identity and lookup results remain stable.
- Status: source-level possible redundant-work/cache concern, not a confirmed defect. Preserve repeated reads and the same empty map; do not introduce an initialized flag or change package semantics.
- Local evidence: `apps/office/src/svl/source/items/iteminfo.test.ts` counts actual static-entry reads across empty/nonempty cache calls; `apps/office/src/svl/source/items/itempool.ts` follows the source empty-map condition. No native performance, compiler or memory probe is used.

## CALC-121: namespace QName caches survive table changes and cold/hot unknown outputs differ

- Upstream: `xmloff/source/core/namespacemap.cxx`, assignment/Add/AddIfKnown and GetKeyByQName/GetQNameByKey, pinned commit `9bc445578031fecf56086729d8e4940c77e14d65`.
- Observation: assignment replaces namespace tables but leaves destination QName caches; Add/AddIfKnown also do not invalidate them. A cached generated QName can retain an old prefix after a new alias becomes canonical. A cached parsed name can retain its old key while its URI output is read from the replacement reverse table. New copy construction starts with empty caches. For an unknown/nonnamespace/xmlns prefix, a cold parsed name leaves a provided URI output untouched; a cache hit assigns the key lookup result, commonly an empty string.
- Status: possibly intentional cache-lifetime assumptions or surprising output contracts, not a confirmed defect. Preserve exact lookup/cache/write paths; do not add invalidation or normalize cold outputs.
- Local evidence: `apps/office/src/xmloff/source/core/namespacemap.test.ts` exercises stale assignment/alias cache values and independent cold/hot output witnesses.

## CALC-122: Add returns requested URI resolution when an existing prefix blocks insertion

- Upstream: same file/commit, `SvXMLNamespaceMap::Add`.
- Observation: the method resolves the requested URI key before testing prefix existence. If the prefix already exists, it leaves that prefix mapping unchanged but returns the resolved key for the requested URI, including UNKNOWN for a new URI; that can differ from GetKeyByPrefix on the same prefix.
- Status: source-level surprising return contract, not a confirmed bug. Preserve the returned key and unchanged tables; do not turn Add into replacement or return the existing-prefix key.
- Local evidence: the shared namespace-map test uses independent existing/new URI witnesses.

## CALC-123: automatic namespace keys can reach reserved marker values

- Upstream: same file/commit, `SvXMLNamespaceMap::Add_`, plus reserved markers in `include/xmloff/namespacemap.hxx`.
- Observation: automatic allocation starts at0x8000 and increments an unsigned16 key until a free reverse-map key is found. It does not skip XMLNS65533/NONE65534/UNKNOWN65535 marker values. Explicit Add rejects NONE, yet auto allocation can produce it.
- Status: source-level capacity/identity concern, not a native memory failure or confirmed defect. Preserve the logical key rule. A bounded JS fixture fills explicit keys0x8000through65533 once, then checks the single automatic scan reaches NONE and subsequent name resolution follows the defined release fallbacks. This checks identifiers, not native allocation or memory management. Full key-space exhaustion and its nonterminating source search are not executed or simulated.
- Local evidence: `apps/office/src/xmloff/source/core/namespacemap.test.ts`; no native compiler, sanitizer, hash-table implementation or memory probe.

## CALC-124: attribute Add4 accepts an unresolved namespace while Set4 rejects it

- Upstream: `xmloff/source/core/SvXMLAttrCollection.cxx` at pinned commit `9bc445578031fecf56086729d8e4940c77e14d65`, four-string AddAttr and SetAt overloads, with namespace-map Add semantics from CALC-122.
- Observation: an existing prefix bound to a different URI can make Add return UNKNOWN. AddAttr still appends an attribute with this key and returns true, so namespace/prefix queries return empty. SetAt explicitly returns false on that same key and preserves the previous attribute.
- Status: surprising source-level asymmetry, not a confirmed upstream defect. Preserve both behaviors; do not silently reject Add or repair/rebind the namespace.
- Local evidence: `apps/office/src/xmloff/source/core/xmlcnimp.test.ts`, conflict and nonmutation witnesses.

## CALC-125: removed XML attributes leave namespace history affecting equality

- Upstream: the same pinned collection file, Remove and operator==.
- Observation: Remove erases only the ordered attribute vector. Namespace-map entries remain, and equality compares that map as well as attributes. Removing all qualified attributes therefore leaves a count-zero collection unequal to a fresh empty one. Adding a same-URI prefix alias also changes the canonical prefix reported for earlier attributes through their stored key.
- Status: observable historical state, possibly deliberate; not a confirmed defect. Preserve unpruned namespace tables, alias semantics and source equality.
- Local evidence: `apps/office/src/xmloff/source/core/xmlcnimp.test.ts`, retained-history/copy and alias witnesses.

## CALC-126: brush100percent transparency retains alpha1

- Upstream: pinned `editeng/source/items/frmitems.cxx`, lcl_PercentToTransparency, TransparencyToPercent and SvxBrushItem color-transparency members.
- Observation: the helper deliberately uses0xfe and documents that0xff must not be returned. Writing100percent produces alpha1, so the fully-transparent member remains false and the non-graphic isUsed test remains true, while reading the percentage returns100.
- Status: surprising reserved-marker behavior, not a confirmed defect. Preserve integer truncation, signed8 conversion and Color alpha assignment rather than changing the scale to255 or rounding differently.
- Local evidence: `apps/office/src/editeng/source/items/native-brush-color.test.ts`, percentage/flag witnesses; no native compiler or memory probe.

## CALC-127: a const brush getter can change hash while equality stays true

- Upstream: pinned `include/editeng/brushitem.hxx` getComplexColor updates final color from GetColor; `editeng/source/items/frmitems.cxx` brush hash includes ComplexColor. See CALC-113 for native ComplexColor equality/hash field differences.
- Observation: two copied color brushes initially compare equal and have identical field hashes. Calling getComplexColor on only one can change its ComplexColor final color and hash, while equality remains true because final color is omitted from that comparison. Calling the getter on both synchronizes their final-color states.
- Status: source-level const/getter/hash invariant concern, not a confirmed upstream defect or claim of portable native binary hash values. Preserve the side effect and original field folds; do not alter shared ComplexColor equality/hash or make copy construction invoke the getter.
- Local evidence: explicit getter/hash regression in `apps/office/src/editeng/source/items/native-brush-color.test.ts`; only logical JS values and source field rules are checked.

## CALC-128: disabling automatic escapement retains a near-marker manual offset

- Upstream: pinned `editeng/source/items/textitem.cxx`, SvxEscapementItem::PutValue MID_AUTO_ESC; `include/editeng/escapementitem.hxx` declares ordinary33/-8, height58 and automatic±14000 markers.
- Observation: enabling automatic mode uses the current offset sign (zero becomes positive) without changing proportional height. Disabling automatic mode changes±14000to±13999 by one unit, preserving height and sign. It does not restore the ordinary33/-8 offset or the mode-setter height58. Non-marker offsets remain unchanged.
- Status: surprising distinction between mode setter and automatic property transition, not a confirmed upstream defect. Preserve source behavior and shared Any2Bool failure fallback; do not substitute font metrics, ordinary script percentages or off0/100 values.
- Local evidence: `apps/office/src/editeng/source/items/native-escapement.test.ts`, automatic/manual transition witness with literal source values; no native compiler or memory probe.

## CALC-129: kerning unit query narrows converted distance back to signed16

- Upstream: pinned `editeng/source/items/textitem.cxx`, SvxKerningItem::QueryValue; original common integral twip-to-mm100 conversion.
- Observation: the stored signed16 twip value is converted to mm100, then explicitly cast back to signed16 before Any insertion. A valid stored32767twips becomes57797mm100 before narrowing, yielding queried-7739; stored-32768twips yields queried7737. Query does not mutate storage, clamp/saturate or widen to a32bit Any. Practical formatting ranges may avoid the boundary.
- Status: surprising source transport overflow, not a confirmed upstream defect. Preserve integral rounding, explicit short narrowing and original16bit transport; do not fix the source by saturating or widening the property.
- Local evidence: `apps/office/src/editeng/source/items/native-text-spacing.test.ts`, literal original boundary/half-rounding queries; no native compiler or memory probe.

## CALC-130: script-hint property accepts values outside its localized label table

- Upstream: pinned `editeng/source/items/textitem.cxx`, SvxScriptHintItem::PutValue/QueryValue/GetValueText; native ScriptHintType has5declared values0..4.
- Observation: the property setter extracts any unsigned16 value and constructs the enum without a0..4range check. For example5or65535is accepted and queried unchanged. GetValueText later indexes a5entry translated-label array with `.at(static_cast<size_t>(eValue))`, so such stored values would reach an out-of-range checked lookup if localized presentation is requested.
- Status: source-level admission/presentation mismatch, not a confirmed upstream defect. Preserve numeric value acceptance and transport; do not silently clamp/reject based on the label table or introduce a fake label fallback. Localized presentation itself is deferred.
- Local evidence: `apps/office/src/editeng/source/items/native-text-modes.test.ts`, arbitrary unsigned16 hint round trip; the native presentation consequence is inspected in source only, not compiled/executed.

## CALC-131: equal line-spacing items can hash differently due to inactive fields

- Upstream: pinned `editeng/source/items/paraitem.cxx`, SvxLineSpacingItem::operator== and hashCode.
- Observation: equality ignores absolute height when the absolute rule is Auto, and ignores inactive proportional/additive values. Hashing folds all five stored fields. Default-height200 and default-height0 items therefore compare equal in Auto/Off state while their logical field hashes differ.
- Status: source equality/hash invariant concern, not a confirmed defect or portable binary hash claim. Preserve active-field comparison and all-field hashing.
- Local evidence: `apps/office/src/editeng/source/items/native-line-spacing.test.ts`, independent default heights and complete copied-state witnesses.

## CALC-132: unknown line-spacing property members can normalize state successfully

- Upstream: the same pinned file, SvxLineSpacingItem::QueryValue and PutValue default member branches.
- Observation: an unknown query member reports a diagnostic but returns true without changing its output. PutValue first projects current state to the two-short descriptor; an unknown member retains successful extraction and applies that descriptor. For example Auto/Off with stored height777 becomes stored height100, even though the input Any was not used.
- Status: surprising successful normalization, not a confirmed defect. Preserve return values, ignored input and state changes; do not replace the native diagnostic branch with false.
- Local evidence: `apps/office/src/editeng/source/items/native-line-spacing.test.ts`, unknown-member query preservation and write normalization.

## CALC-133: negative line-spacing heights convert differently by mode

- Upstream: the same pinned file, SvxLineSpacingItem::PutValue LEADING versus FIX/MINIMUM conversion order.
- Observation: LEADING converts the signed short distance. FIX/MINIMUM first assign the same short into unsigned16 line height and then convert. A descriptor height-1mm100 remains-1twip in LEADING but converts wrapped65535mm100 to37154twips in FIX.
- Status: surprising source cast-order consequence, not a confirmed defect. Preserve signed versus unsigned conversion order and short storage rather than rejecting or saturating negative input.
- Local evidence: `apps/office/src/editeng/source/items/native-line-spacing.test.ts`, real typed descriptor conversion witnesses; no native compiler or memory probe.

## CALC-134: non-ISO Kurdish fallback conditions spell the language krm

- Upstream: pinned `i18nlangtag/source/languagetag/languagetag.cxx`, non-ISO LanguageTag::getFallbackStrings branch.
- Observation: Latin-script legacy ku fallbacks test the language string krm, while the ISO branch and language tables use kmr for Northern Kurdish. Thus these particular extra ku candidates are added for krm-Latn and are absent for the corresponding kmr-Latn input. Other language/country fallbacks still apply.
- Status: suspected transposition, not a confirmed defect. Preserve the source spelling and order instead of silently changing it to kmr.
- Local evidence: `apps/office/src/editeng/source/items/native-tab-values.test.ts`, literal fallback sequences over decomposed source fields; no native compiler or ICU implementation.

## CALC-135: inserting a tab item into itself removes alternating entries

- Upstream: pinned `editeng/source/items/paraitem.cxx`, SvxTabStopItem::Insert(const SvxTabStopItem*).
- Observation: the first pass removes matching target positions while its index and Count both refer to the live source. If source and target are the same item, removing a tab shifts the next tab before the incremented index. Self-insertion of positions1,2,3,4 therefore retains2,4; the second pass cannot restore the erased entries.
- Status: source aliasing concern, not a confirmed defect. Preserve both live passes; do not silently clone the input or turn self-insertion into a no-op.
- Local evidence: `apps/office/src/editeng/source/items/native-tab-item.test.ts`, literal self-merge witness; no native compiler or memory probe.

## CALC-136: tab count narrowing can hide values from equality but retain them in hashing

- Upstream: pinned `include/editeng/tstpitem.hxx` Count and GetPos return unsigned16; `editeng/source/items/paraitem.cxx` equality loops over Count while hashCode iterates the complete vector.
- Observation:65536stored tabs narrow to Count0 and can compare equal to an empty item with the same default distance, while hashes differ. Index65535 also collides with SVX_TAB_NOTFOUND: insertion at that existing position cannot remove it first, so the position-only vector rejects the replacement. Copy construction still copies every stored entry.
- Status: source width/invariant concern, not a confirmed defect or portable binary hash claim. Preserve the original narrowing, sentinel and loop domains instead of clamping size or changing equality.
- Local evidence: `apps/office/src/editeng/source/items/native-tab-item.test.ts`, initialized65536entry vector and actual typed query; no undefined index access, native compiler or memory probe.

## CALC-137: BlockLine paragraph adjustment falls back to Left

- Upstream: pinned `include/editeng/adjustitem.hxx` SetAdjust/GetAdjust and `editeng/source/items/paraitem.cxx` constructor/PutValue.
- Observation: SvxAdjust declares BlockLine4, but SetAdjust assigns six primary bits only for Left,Right,Block,Center,ParaStart,ParaEnd. BlockLine therefore leaves all six false and GetAdjust returns Left. The property setter admits0..6, so4succeeds and queries0. End/other initialized int values also have the direct-setter Left fallback.
- Status: surprising declaration/storage mapping, not a confirmed defect. Preserve source flags/fallback rather than retain a browser-only BlockLine-to-justify implementation.
- Local evidence: `apps/office/src/editeng/source/items/native-adjust-item.test.ts` and real Writer ODT alignment regression, no native compiler/probe.

## CALC-138: failed paragraph spacing property extraction writes minus one successfully

- Upstream: pinned `editeng/source/items/paraitem.cxx`, SvxAdjustItem::PutValue numeric spacing members.
- Observation: every spacing branch initializes a signed short to-1 and ignores the extraction result before calling the setter. A boolean/empty Any therefore returns true while storing65535in unsigned word-spacing fields, or-1in signed letter-spacing/glyph-scaling fields. Query of unsigned word65535 is signed short-1. There is no property range check.
- Status: surprising failed-extraction mutation, not a confirmed defect. Preserve initialization, cast order and successful return rather than reject or keep prior values. Direct setters retain declared-width conversions.
- Local evidence: `apps/office/src/editeng/source/items/native-adjust-item.test.ts`, actual typed Any failures and all seven numeric members.

## CALC-139: default spelling invalid-end marker wraps on insertion

- Upstream: pinned `editeng/source/editeng/edtspell.cxx`, WrongList constructor and TextInserted.
- Observation: default invalid interval is [0, size_t max]. Inserting one unit at position1 follows invalid-end >= position and adds the length without a sentinel check, producing unsigned64 zero for invalid-end while retaining invalid-start0. There are no spelling ranges in this example.
- Status: surprising unsigned sentinel arithmetic, not a confirmed defect. Preserve the original branch and unsigned arithmetic; do not clamp or reinterpret the marker.
- Local evidence: `apps/office/src/editeng/source/editeng/native-wrong-list.test.ts`; source-derived literal assertions without native compiler/probe.

## CALC-140: spelling-range split retains the original insertion loop limit

- Upstream: pinned `editeng/source/editeng/edtspell.cxx`, WrongList::TextInserted.
- Observation: the loop captures the original vector size. Splitting a range inserts before it and increments the index inside the branch as well as at loop end. With [1,7] and [10,12], insertion of3separator units at5 yields [1,5], [6,10], [10,12]; the original trailing range is not shifted because its new index reaches the captured limit. The second split start is position+1, independently of inserted length.
- Status: suspicious captured-bound/split behavior, not a confirmed defect. Preserve both the limit and increments and record the result rather than repairing upstream semantics.
- Local evidence: `apps/office/src/editeng/source/editeng/native-wrong-list.test.ts`.

## CALC-141: replacing an item set from itself clears its direct values

- Upstream: pinned `svl/source/items/itemset.cxx`, SfxItemSet::Set.
- Observation: Set clears the destination before examining the source. When both references identify the same set, its direct values disappear and the operation may return false. The returned flag describes subsequent insertions rather than the initial clear. Inherited SET values may still be copied by the deep path when a parent exists.
- Status: surprising self-assignment and return behavior, not a confirmed defect. Preserve the ordering; do not add a self-assignment shortcut.
- Local evidence: `apps/office/src/svl/source/items/native-itemset-set-holder.test.ts`.

## CALC-142: URL field Name is copied but excluded from equality and hashing

- Upstream: pinned `include/editeng/flditem.hxx` SvxURLField m_Name/GetName/SetName and `editeng/source/items/flditem.cxx` SvxURLField::operator==/hashCode.
- Observation: copy/Clone preserves m_Name (documented as alternative text), but equality compares only format, URL, representation and target frame. Hash uses the same four values. Two fields differing only in Name remain equal; inserting their SvxFieldItem values into the real SfxItemSet can therefore return unchanged and retain the previous Name.
- Status: potentially surprising omitted state, not a confirmed defect. Preserve all copied strings and the literal equality/hash omission; do not add Name to comparison/hash to repair upstream.
- Local evidence: `apps/office/src/editeng/source/items/native-field-values.test.ts`, including independent copies and an actual item-set change-gate assertion. No native compiler/probe or memory test.

## CALC-143: IPAex Mincho search alias is spelled ipaexmimcho

- Upstream: pinned `unotools/source/misc/fontdefs.cxx`, GetEnglishSearchFontName dictionary entry `ipaex\u660E\u671D` maps to `ipaexmimcho`.
- Observation: the English alias differs from the apparent Mincho spelling used by related entries. Native normalization of IPAex明朝 reaches this exact value; correcting the apparent typo would change physical font lookup.
- Status: suspicious spelling, not a confirmed defect. Preserve `ipaexmimcho` exactly; do not change it to a guessed English family.
- Local evidence: complete source dictionary projection and `unotools/source/misc/native-font-names.test.ts`. No native compiler/probe.

## CALC-144: font search dictionary contains conflicting duplicate Chinese keys

- Upstream: pinned `unotools/source/misc/fontdefs.cxx`, static FontNameDictionary initializer in GetEnglishSearchFontName. The literal contains155 rows but153 unique keys.
- Observation: 方正黑体 appears with `fzhei` and later `fzheiti`; 方正楷体 appears with `fzkai` and later `fzkaiti`. A unique-key unordered_map cannot retain both aliases for one search key. Direct native testSingleElement does not cover these conflicts.
- Status: suspicious conflicting initialization, not a confirmed defect. Preserve all literal rows/order in the resource. The browser binding performs sequential unique insertion and retains first values `fzhei`/`fzkai`, without overwriting with later entries or claiming a cross-standard-library constructor-selection guarantee. Other native platform outcomes are not verified; no compiler/probe is introduced to investigate container internals.
- Local evidence: exact source-row audit and `unotools/source/misc/native-font-names.test.ts`, which checks the documented first-insertion choice separately from ordinary dictionary pairs. These two ambiguous mappings do not justify full native-library parity promotion.

## CALC-145: hyphenated font dictionary keys are unreachable after normalization

- Upstream: pinned `unotools/source/misc/fontdefs.cxx`, GetEnglishSearchFontName strips ASCII punctuation except semicolon/parentheses before querying its literal dictionary.
- Observation: literal keys `hg正楷書体-pro` -> `hgseikaishotaipro` and `hg丸ｺﾞｼｯｸ-pro` -> `hgmarugothicmpro` contain ASCII hyphens, which are removed before lookup. Their normalized forms have no dictionary entry, so these inputs return `hg正楷書体pro` and `hg丸ｺﾞｼｯｸpro` instead of the apparent intended English aliases.
- Status: potentially unreachable source entries, not a confirmed defect. Preserve both raw keys and the original preprocessing order. Do not normalize dictionary keys, add aliases or special-case the two inputs.
- Local evidence: complete dictionary/source audit and `unotools/source/misc/native-font-names.test.ts`. No native compiler/probe and no full physical font resolution claim.


## CALC-146: style-index Clear retains the family vectors

- Upstream: pinned `svl/source/items/IndexedStyleSheets.cxx`, IndexedStyleSheets::Clear, Reindex and GetStyleSheetsByFamily; declarations in `include/svl/IndexedStyleSheets.hxx`.
- Observation: Clear invokes the cleanup callback and clears each primary vector slot in insertion order, then clears the primary vector and name map. It does not clear any of the six family vectors. GetNumberOfStyleSheets can therefore return0 while a previously borrowed family vector still contains earlier pointers; adding a new style appends to that stale family vector. Explicit Reindex clears and rebuilds all family vectors.
- Status: suspicious omitted index reset, not a confirmed defect. Preserve the exact omission and explicit rebuild behavior. Observe only styles retained externally, so those native pointers remain valid; do not invent results for dereferencing dangling pointers after actual destruction. JS object references/GC do not recreate native deletion.
- Local evidence: `apps/office/src/svl/source/items/native-indexed-style-sheets.test.ts` and `apps/office/e2e/shared/indexed-style-sheets.spec.ts`, including partial null-slot visibility during callbacks, retained family views and later explicit Reindex. No native compiler/probe or memory-management experiment.

## CALC-147: style search has disabled general visibility filtering

- Upstream: pinned `svl/source/items/style.cxx`, DoesStyleMatchStyleSheetPredicate::Check and SfxStyleSheetIterator constructor/GetSearchMask; flags in `include/svl/style.hxx`.
- Observation: the general bMatchVisibility expression is commented out. A hidden style matching ordinary application flags is still returned. Hidden-only search separately admits IsHidden styles, and any style with the Hidden mask bit also matches. Combining Hidden with Used disables the special Hidden-only term because GetSearchMask restores Used; the remaining mask/usage OR terms apply. AllVisible admits hidden styles as well.
- Status: potentially surprising historical filter behavior, not a confirmed bug. Preserve the exact expression, usage/visibility virtual-call order and AllVisible fast path; do not restore the commented visibility check.
- Local evidence: `apps/office/src/svl/source/items/native-style-iterator.test.ts`, source-derived fixtures over the actual shared index. No native compiler/probe or claim of a native iterator QA port.

## CALC-148: style iterator Find stores a primary index consumed as a family index by Next

- Upstream: pinned `svl/source/items/style.cxx`, SfxStyleSheetIterator::Find, operator[] and Next.
- Observation: Find stores the absolute primary-vector position returned by FindPositionsByNameAndPredicate. With the exact All mask and a specific family, Next treats that position as a family-vector index. For primary styles [Char:a, Para:b, Para:c], First/Next returns b/c, but Find(b)/Next returns b/null. The predicate path uses absolute positions consistently and returns c after Find(b).
- Status: suspicious mismatch of index spaces, not a confirmed defect. Preserve Find and Next assignments and path selection; do not translate Find results into family offsets or reset cursors on failed searches.
- Local evidence: `apps/office/src/svl/source/items/native-style-iterator.test.ts` and `apps/office/e2e/shared/style-iterator.spec.ts`. These are source-derived observations; full production stylesheet/pool construction is still pending.

## CALC-149: style iterator fast-path Count narrows through uint16

- Upstream: pinned `svl/source/items/style.cxx`, SfxStyleSheetIterator::Count and First; declared Count return type is sal_Int32 in `include/svl/style.hxx`.
- Observation: trivial all-family and exact-All family counts cast collection size to sal_uInt16 before returning it as sal_Int32. The predicate count does not use that narrowing. A real index containing 65536 same-family matching styles therefore produces Count=0 and First=null on either fast path, while a filtered iterator produces Count=65536 and a non-null First.
- Status: potentially unintended historical narrowing, not a confirmed bug or a claim that all document formats allow this many styles. Preserve modulo-65536 conversion only where the source applies it.
- Local evidence: `apps/office/src/svl/source/items/native-style-iterator.test.ts`, with 65536 distinct actual indexed caller identities and OUString names. No native binary, allocator or memory-sanitizer experiment.

## CALC-150: style-pool addition traverses the destination index

- Upstream: pinned `svl/source/items/style.cxx`, SfxStyleSheetBasePool::operator+=, AddStyleSheetCallback and the pool copy constructor.
- Observation: operator+= checks that argument r differs from this, but invokes ApplyToAllStyleSheets on this->pImpl->mxIndexedStyleSheets rather than r's collection. Its callback calls this->Add. A newly constructed empty destination therefore visits no styles even when r is nonempty; the copy constructor creates an empty index and delegates to this operation. For a nonempty destination the callback can modify the same collection being traversed, so no defined mutation result is assumed here.
- Status: suspicious source-side destination/argument mismatch, not a confirmed defect. Preserve it when implementing the pool; do not silently change traversal to r or assign a result to invalidated native iterators.
- Local evidence: task171 first recorded the pinned source analysis. Task173 implements actual core pool owners and checks empty-destination copy/assignment in `apps/office/src/svl/source/items/native-style-model.test.ts`. A throwing native virtual copy factory is also checked: the exception exits before an invalidated traversal advances. No normal nonempty-destination iterator result, complete UNO pool implementation or native runtime probe is claimed.

## CALC-151: merged pool ranges remain cached after replacing the secondary chain

- Upstream: pinned `svl/source/items/itempool.cxx`, SfxItemPool::GetMergedIdRanges and SetSecondaryPool; pool-only SfxItemSet construction in `svl/source/items/itemset.cxx`.
- Observation: GetMergedIdRanges computes only while maPoolRanges is empty. SetSecondaryPool changes master/secondary links without clearing this cache. After first computing ranges for pools [10..12]+[1..2], replacing the secondary with [20..22] leaves GetMergedIdRanges and subsequently constructed pool-only item sets at [1..2,10..12]. Default/slot lookup follows the new live chain and can resolve20..22 despite those old ranges.
- Status: potentially surprising cache lifetime/precondition, not a confirmed defect; callers may be expected to freeze chain topology before constructing sets. Preserve the absence of invalidation and ordinary copied range-value semantics. Do not add an automatic cache reset or infer native metadata from browser snapshot defaults.
- Local evidence: `apps/office/src/svl/source/items/native-pool-chain.test.ts` and `apps/office/e2e/shared/pool-chain.spec.ts`, real registered metadata packages, shared pools and item sets. Source-derived cases; no native compiler/probe or new memory manager.

## CALC-152: base style copy retains the source pool pointer when added to another pool

- Upstream: pinned `svl/source/items/style.cxx`, SfxStyleSheetBase copy constructor, SfxStyleSheetBasePool::Create(const SfxStyleSheetBase&) and Add.
- Observation: the base copy constructor retains r.m_pPool, and the default copy factory simply constructs that base copy. Add stores the copy in the destination index without rebinding its pool pointer. With actual base pools A/B, B.Add(aStyleFromA) therefore stores a different style whose GetPool still returns A. Subsequent style operations use A for parent/name validation, notifications and lazy item-set creation.
- Status: suspicious cross-pool ownership contract, not a confirmed defect; derived factories may intentionally override it. Preserve the original pointer and default factory rather than silently rebinding to the index owner.
- Local evidence: actual core owners in `apps/office/src/svl/source/items/native-style-model.test.ts`. Full derived style/UNO pool behavior remains unimplemented; no native probe.

## CALC-153: base Make stores a new style without a creation notification

- Upstream: pinned `svl/source/items/style.cxx`, SfxStyleSheetBasePool::Make and StoreStyleSheet; descriptive comment in `include/svl/style.hxx`.
- Observation: the header comment promises a StyleSheetCreated notification from Make, but the actual implementation only calls Create and StoreStyleSheet, and StoreStyleSheet only adds to the index. There is no current StyleSheetCreated enum member in hint.hxx. Successful rename does emit StyleSheetModifiedExtended.
- Status: likely stale explanatory comment or intentional silent creation, not a confirmed defect. Preserve silent Make/Insert storage; do not invent a creation hint or substitute another ID.
- Local evidence: actual listener over actual pool creation/rename in `apps/office/src/svl/source/items/native-style-model.test.ts` and `apps/office/e2e/shared/style-model.spec.ts`.

## CALC-154: Add reparents existing children away from the replaced style

- Upstream: pinned `svl/source/items/style.cxx`, SfxStyleSheetBasePool::Add, Remove and ChangeParent.
- Observation: Add's comment describes recreating a style and reconnecting its children, but Add first calls Remove. Remove immediately changes matching children's parent to the old style's parent before broadcasting Erased. Add then inserts the replacement and broadcasts Changed without restoring those child links. Replacing a root style therefore leaves its former children with an empty parent, rather than the replacement's name.
- Status: suspicious replacement/description mismatch, not a confirmed defect or a claim about overriding derived factories. Preserve child Modified then old Erased then new Changed order and the resulting core parent values.
- Local evidence: actual target/source core style pools in `apps/office/src/svl/source/items/native-style-model.test.ts`; no fake provider or native runtime experiment.

## CALC-155: style-pool destruction emits Dying before and after clearing

- Upstream: pinned `svl/source/items/style.cxx`, SfxStyleSheetBasePool destructor, and `svl/source/notify/SfxBroadcaster.cxx`, SfxBroadcaster destructor.
- Observation: the pool destructor first broadcasts Dying and quietly clears its index. The inherited broadcaster destructor then broadcasts another Dying before detaching listeners. A retained listener therefore sees the same pool with populated primary index on the first notification and empty primary index on the second.
- Status: potentially surprising duplicate lifecycle notification, not a confirmed defect; derived/base destruction phases may intentionally differ. Preserve both notifications and their index-state order, without adding an idempotent disposed flag or collapsing them.
- Local evidence: actual core pool/listener in `apps/office/src/svl/source/items/native-style-model.test.ts` and `apps/office/e2e/shared/style-model.spec.ts`. Explicit Dispose binds native destructor execution; JS GC owns physical storage and no reference-count lifetime engine is recreated.

## CALC-156: shared style-pool copy factory slices to the base style

- Upstream: pinned `include/svl/style.hxx`, SfxStyleSheetPool uses the base Create overloads and overrides only the field factory; `svl/source/items/style.cxx`, base copy factory and Add.
- Observation: Make on SfxStyleSheetPool creates SfxStyleSheet, but Add uses the inherited Create(const SfxStyleSheetBase&) and constructs SfxStyleSheetBase. The stored replacement therefore lacks listener/broadcaster roles despite living in a derived pool. Explicit SfxStyleSheet copy construction separately copies all three native bases.
- Status: suspicious inherited factory asymmetry, not a confirmed defect; derived consumers may avoid this path or override it. Preserve slicing, and do not assign a supported result to later invalid static parent casts involving the sliced object.
- Local evidence: actual shared pools and styles in `apps/office/src/svl/source/items/native-style-sheet.test.ts`; no fake provider or native probe.

## CALC-157: removing a retained parent can leave the child subscribed to it

- Upstream: pinned `svl/source/items/style.cxx`, base-pool Remove/ChangeParent and SfxStyleSheet::SetParent.
- Observation: Remove erases the parent from the index before calling ChangeParent. The child changes its stored parent through SetParent, but the derived old-parent lookup now finds no object and skips EndListening. If the removed parent is held alive externally, its broadcasts still reach the child despite the cleared parent name. Final parent destruction detaches the remaining subscription.
- Status: potentially surprising retained-parent notification link, not a confirmed defect. Preserve removal/reparent/lookup ordering and the missing-parent guard rather than retaining an invented old lookup pointer.
- Local evidence: actual externally held parent/child owners and forwarded hints in `apps/office/src/svl/source/items/native-style-sheet.test.ts`.

## CALC-158: constructor parent name does not create a subscription

- Upstream: pinned `svl/source/items/style.cxx`, SfxStyleSheet field constructor and SetParent.
- Observation: construction passes the parent name only into the base style fields. It does not StartListening to that parent. A later SetParent with the same name returns early and also does not attach. Changing to another value and back does establish the ordinary notification chain.
- Status: potentially caller-dependent initialization behavior, not a confirmed defect or claim about later Calc overrides. Preserve stored name versus subscription state; do not silently subscribe during construction.
- Local evidence: actual shared factory/parent/style instances in `apps/office/src/svl/source/items/native-style-sheet.test.ts`.

## CALC-159: reentrant pool clearing can precede parent subscription rebinding

- Upstream: pinned `svl/source/items/style.cxx`, SfxStyleSheet::SetParent invokes base SetParent before its old/new parent lookups; the base broadcasts Modified synchronously.
- Observation: a pool listener can Clear the index during that Modified callback while external references keep all styles alive. The base has already stored the new parent name, but both derived lookups can then fail: the old subscription remains and no new subscription is created. No cached parent pointers bridge the callback.
- Status: potentially surprising reentrant ordering, not a confirmed defect. Preserve the broadcast-before-lookups order and both null guards. Do not infer outcomes for invalid cyclic graphs or dead style pointers.
- Local evidence: actual pool Clear callback with retained owners in `apps/office/src/svl/source/items/native-style-sheet.test.ts`; this is a source-derived scenario, not a native memory or sanitizer experiment.

## CALC-160: first user-default construction saves metadata before creating the entry

- Upstream: pinned `svl/source/items/itempool.cxx`, impCreateUserDefault, ItemInfoUser constructor and SetUserDefaultItem.
- Observation: impCreateUserDefault inserts the original ItemInfo into maUserItemInfos before allocating/constructing ItemInfoUser. If the value clone/construction throws, maItemInfos still contains the original entry while override bookkeeping already exists. The replacement path instead constructs a new entry before assigning it and deleting the previous user entry.
- Status: potential first-insertion exception-safety issue, not a confirmed defect. Preserve statement ordering; do not add a rollback absent from upstream. No normal post-first-failure cleanup/lifetime outcome is claimed.
- Local evidence: pinned source audit. `apps/office/src/svl/source/items/native-user-defaults.test.ts` tests the defined replacement-clone failure path, where the previous user metadata/value remains intact; it does not claim a native first-failure cleanup test or run a compiler/memory probe.

## CALC-161 — Duplicate SAX attributes are retained during manifest property export

- Source: `comphelper/source/xml/attributelist.cxx` (`AttributeList::AddAttribute`) and `package/source/manifest/ManifestExport.cxx` (root property scan and file-entry loop), pinned commit `9bc445578031fecf56086729d8e4940c77e14d65`.
- Observation: duplicate-name assertion is commented out with an upstream TODO noting test failures. Root scanning stops after a complete path/media/version triplet,but file-entry emission traverses every property. Repeated Version properties can therefore retain the initial document version while emitting duplicate version attributes in the entry.
- Status: suspicious source case,not a confirmed defect for valid native package producers. Preserve original ordered list/events and do not deduplicate or rewrite values. Literal PropertyValue/AttributeList regressions cover this represented behavior;no native compiler or memory probe is used.

## CALC-162 — Level-two manifest entries do not check root validity

- Source: `package/source/manifest/ManifestImport.cxx`, `ManifestImport::startElement` level1/level2 dispatch, pinned commit `9bc445578031fecf56086729d8e4940c77e14d65`.
- Observation: an unrecognized root marks its scope invalid,but the level-two file-entry branch calls `doFileEntry` without checking the parent validity. A recognized manifest file entry below a different root can still enter the result vector.
- Status: suspicious source behavior,not a confirmed defect for valid package producers. Preserve the original dispatch and test actual PropertyValue output;do not propagate root invalidity as an invented fix. Native reader parse failures and package admission are separate responsibilities.

## CALC-163 — Manifest namespace conversion searches past an unknown inner binding

- Source: `package/source/manifest/ManifestImport.cxx`, `PushNameAndNamespaces`, `ConvertNameWithNamespace` and `ConvertName`, pinned commit `9bc445578031fecf56086729d8e4940c77e14d65`.
- Observation: a namespace alias bound to an unrecognized URI in an inner scope returns an empty conversion,so lookup continues to a recognized outer binding instead of stopping at the shadowing declaration. The same conversion also applies a recognized default namespace to unprefixed attribute names. Raw original names remain the final fallback.
- Status: compatibility leniency is plausible;the source explicitly mentions accepting inconsistent older documents. Preserve these cases rather than replacing them with standard namespace-resolution behavior. Literal XML/SAX cases exercise the shared importer;no native compiler or memory probe is used.

## CALC-164 — Recursive package-folder consistency assignment can replace an earlier true flag

- Source: `package/source/zippackage/ZipPackageFolder.cxx`, `ZipPackageFolder::LookForUnexpectedODF12Streams`, pinned commit `9bc445578031fecf56086729d8e4940c77e14d65`.
- Observation: ordinary child folders assign their recursive result directly to `bHasUnexpected` instead of OR-ing it with the current flag. An earlier unexpected stream can therefore cease to affect the final result if a subsequently visited folder has no unexpected entries.
- Status: suspicious source logic,preserved literally. Native contents use unordered-map traversal,whose bucket order is not a contract to reproduce as binary data. JS Map supplies logical catalog traversal;tests state their order explicitly and do not claim native compiler/hash-layout ordering or broad package parity. No invented monotonic correction or native memory/compiler probe is used.

## CALC-165: Size item HEIGHT extraction failure returns success

- Source: `editeng/source/items/frmitems.cxx`, `SvxSizeItem::PutValue`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`.
- Observation: failed signed32 WIDTH extraction returns false;the corresponding HEIGHT branch returns true without changing the height. SIZE struct extraction failure returns false. This may be a historical inconsistency.
- Decision: preserve the distinct return values and unchanged payload;source-derived tests exercise all three real Any paths. Do not normalize failure handling.

## CALC-166: Writer size short extraction can silently reset fields

- Source: `sw/source/core/layout/atrfrm.cxx`, `SwFormatFrameSize::PutValue`, same pinned baseline.
- Observation: percentage and percentage-relation members initialize a signed16 temporary to zero and ignore extraction failure. An incompatible Any can therefore reset the field to zero and return success. Width,height,size and sizing-type members instead check extraction. Writer queries also always convert dimensions,whereas PutValue converts only when requested. Unknown query members return true with unchanged output;unknown put members return false.
- Decision: preserve these source branches and native bool-access preconditions without a compatibility fallback or correction. Actual Any regression tests cover the distinctions;broader document consequences remain unverified.

## CALC-167: Terminal zero-span rich-text attribute has no section start

- Source: `editeng/source/editeng/editobj.cxx`, `EditTextObjectImpl::GetAllSections`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`.
- Observation: for nonempty text,an attribute whose start/end both equal paragraph length contributes only the existing final border. Section construction has no section starting at that final border. FindBySectionStart then fails;debug asserts and the ordinary source path returns before swapping output. Previously supplied caller output therefore remains unchanged. No upstream engine-producer reachability or document effect is established.
- Decision: preserve release early return and caller output;do not append a fabricated zero-length end section or clear output on failure. Empty paragraphs still have the original0..0section. Source-derived actual ContentInfo/attribute regression covers the distinction.

## CALC-168: Font fill color does not determine its independent transparency flag

- Source: `vcl/source/font/font.cxx`, `Font::SetFillColor`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`.
- Observation: only a changed fill color enters the setter body. A changed transparent color sets mbTransparent=true,while a changed opaque color leaves the flag unchanged. Repeating the same transparent color after SetTransparent(false) therefore retains false. These fields are explicitly marked compatibility state in ImplFont;the asymmetry may be intentional.
- Decision: preserve guarded assignment and independent flag state. Do not derive transparency from current fill color,force false for opaque fill,or apply side effects to no-op assignments. Actual shared Font regressions cover all transitions. No wider renderer/document effect is claimed.

## CALC-169: Font IsSameInstance also accepts equal independent values

- Source: `vcl/source/font/font.cxx`, `Font::IsSameInstance`;`include/vcl/font.hxx`, ImplType;`include/o3tl/cow_wrapper.hxx`, operator==;pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`.
- Observation: the method name suggests an identity predicate,but its implementation uses the same cow_wrapper operator== as Font equality. That operator returns same_object OR dereferenced value equality. Independently changed handles that arrive at equal values therefore compare true. This is an unexpected naming contract,not an established upstream defect.
- Decision: preserve the exact value result and correct our earlier identity-only implementation/test. Reuse represented Font equality;do not port C++ reference counting or physical COW merely to reproduce this observable predicate. Other full Font fields remain outside current verified scope.

## CALC-170 — SAX numeric success does not require consuming a number

- Source: `sal/rtl/math.cxx` `stringToDouble`, native QA
  `sal/qa/rtl/math/test-rtl-math.cxx` `test_stringToDouble_bad`, and
  `sax/source/tools/converter.cxx` `Converter::convertDouble` read overloads.
- Observation: malformed inputs such as `garbage` or `.` leave the numeric
  result zero and parsed end at the beginning, with conversion status `Ok`.
  SAX returns success based on status alone, and optional rest retains the
  entire input. A numeric prefix followed by junk also succeeds.
- Status: explicitly source-tested RTL behavior; suspicious only when a
  caller assumes success means a complete valid number. No upstream bug or
  reachable Calc import error is established.
- Port: preserve value, status, consumed end and SAX success/rest behavior.
  Consumers must follow their own upstream checks; no stricter shared parser.

## CALC-171 — document-option comparison ignores a setting and observes a cache

- Source: `sc/inc/docoptio.hxx` `ScDocOptions::operator==` and
  `GetFormulaSearchType`,plus setters in `sc/source/core/tool/docoptio.cxx`.
- Observation: equality omits `bIgnoreLineBreaks`,although copy/reset retain
  it. Equality compares `eFormulaSearchType` directly. Calling the const lazy
  mode getter on only one of two equal Unknown-mode values can make them
  unequal without a setting change;normalizing both restores equality.
- Status: source-observable comparison contract;no claim that a reachable
  consumer loses settings or that upstream intends different behavior.
- Port: preserve both effects;test independent copies and lazy normalization.

## CALC-172 — locale measurement text UK maps to US

- Source: `unotools/source/i18n/localedatawrapper.cxx`
  `mapMeasurementStringToEnum`,and shipped LC_CTYPE measurement fields.
- Observation: only ASCII-case-insensitive metric maps to Metric. All other
  strings,including the UK spelling present in two source locale resources,
  map to US. en_GB itself explicitly uses Metric.
- Status: source policy,possibly intentional;not a demonstrated upstream bug.
- Port: preserve mapping and the original resource values without guessing a
  browser Intl/territory-specific measurement policy.

## CALC-173 — empty qualified fallback matches an empty table fallback

- Source: `i18nlangtag/source/isolang/isolang.cxx`
  `MsLangId::Conversion::lookupFallbackLocale`,BCP47 entry search.
- Observation: Locale Language `qlt` with empty Variant matches the first
  empty `mpFallback` in the BCP47 table,so returns `ca-ES-valencia` rather
  than the final en-US fallback. The condition compares fallback text
  without requiring it to be nonempty.
- Status: source-observable boundary only;full LanguageTag/producer
  reachability and upstream intent are not established. No bug claim.
- Port: preserve this exact result;do not add an empty-string guard.

## CALC-174 — English country table has conflicting and mislabeled rows

- Source: `i18nlangtag/source/isolang/isolang.cxx`
  `aImplIsoLangEngEntries` and the Unicode
  `MsLangId::Conversion::convertIsoNamesToLanguage` overload.
- Observation: `KI` (Kiribati) occurs first with LANGUAGE_ENGLISH_UK and later
  with LANGUAGE_ENGLISH_US. The first-match search returns UK for en/KI;
  the later US row cannot win this table search. Another `NG` row carries the
  comment Sierra Leone, while NG denotes Nigeria and Sierra Leone uses SL.
  Normal en/NG lookup is already intercepted by the earlier main ISO table
  and returns its Nigeria-specific raw ID; en/SL is not resolved by this
  Unicode overload. The separate byte overload may attempt LanguageTag and
  is outside this observation.
- Status: suspicious source table duplication/comment mismatch, not proof of
  intended replacement values or a demonstrated downstream document failure.
- Port: preserve all rows and comments' source context, retain first-match and
  ISO-before-English priority, test en/KI, en/NG and en/SL explicitly. Do not
  deduplicate, reorder or silently replace NG with SL.

## CALC-175 — general language parser consumes only the prefix before NUL

- Source: LibreOffice `LanguageTagImpl::canonicalize` passes UTF8 getStr() to
  liblangtag0.6.8 `lt_tag_parse`; `lt_tag_scanner_new` copies with strdup and
  records strlen. The pinned source/data archives are traced in task193.
- Observation: logical input en followed by embedded NUL and -INVALID reaches
  the library as the C-string prefix en, which can parse and canonicalize to
  en. This is a source-derived outcome, not a native binary observation.
- Status: suspicious input-boundary behavior; no claim of a reachable ODF/XML
  document failure or of the intended policy for embedded NUL.
- Port: preserve this specific parser boundary and test the full logical input.
  Do not truncate unrelated OUString values or raw Locale conversions globally.

## CALC-176 — first language variant prefix is a byte-prefix comparison

- Source: liblangtag0.6.8 `lt_tag_parse_state`, STATE_VARIANT, uses case-insensitive
  prefix-length comparison against the canonicalized partial tag. The pinned
  registry's 1901 variant lists Prefix de; den is a registered language with no
  replacement alias in the shipped supplemental metadata.
- Observation: de is also a byte prefix of den, so den-1901 passes this first-
  variant prefix check. The parser does not require a subtag boundary there.
  Later variant combinations have further exact-prefix/duplicate checks.
- Status: suspicious source-derived acceptance edge; no native execution,
  standards-conformance verdict or demonstrated downstream document effect.
- Port: preserve this acceptance and an independent regression vector rather
  than tightening the comparison to a language/subtag equality check.


## CALC-177 — Unicode extension key spelling changes type acceptance

Source: pinned liblangtag0.6.8 `extensions/lt-ext-ldml-u.c`,
`_lt_ext_ldml_u_lookup_key` and `_lt_ext_ldml_u_lookup_type`;raw forwarding in
`liblangtag/lt-extension.c` and `lt-ext-module.c`. The key lookup compares names
case-insensitively and stores the original token. Type lookup then selects XML
keys with case-sensitive `@name = key`,using that stored raw spelling.
Consequently callback tokens `ca,gregory` succeed,whereas `CA,gregory` fail with
`Unknown -u- extension type: gregory`;a clipped `CA` alone is accepted and emits
`ca`. No intervening forwarding owner lowercases the token. Preserve this
behavior. Evidence is source-derived and replayed in the managed actual
callback;outer LanguageTag fast-path/normalization reachability and executed
native library results are not claimed. Task195.

## CALC-178 — Unicode extension discovers transform-only keys

Source: same pinned `_lt_ext_ldml_u_lookup_key`,the native `lt-xml.c` BCP47 group
order/transform merge and `data/common/bcp47/transform.xml`. Unicode key discovery
scans all seven groups and selects every key without filtering `@extension`.
Thus `m0` from the transform group,whose XML declares `extension="t"`,is accepted
by the u callback,and `m0,ungegn` emits `m0-ungegn`. Its type lookup also omits an
extension filter. The t callback explicitly filters `@extension = 't'`.
Preserve the source lookup;do not silently impose a modern extension namespace
filter. This is a source-derived suspicious boundary,not a standards verdict or
proof of outer LibreOffice document reachability/native execution. Task195.

## CALC-179 — Unicode getter sorting changes a later type lookup

Source: same pinned `_lt_ext_ldml_u_get_tag` sorts `d->tags` in place,while
`_lt_ext_ldml_u_lookup_type` uses the last container and the separately retained
`current_type`. Callback tokens `nu,latn,ca` leave the current family calendar
and last container `ca`. Calling get_tag sorts containers into `ca,nu-latn`.
A subsequent `buddhist` token looks up raw key `nu` in calendar data and fails;
it would succeed before the getter call. Preserve this observable callback
state effect;the getter is not replaced with a nonmutating copy sort.
Tests execute the managed callback sequence;actual full-tag incremental API
reachability and native binary execution remain unproven. Task195.


## CALC-180 — transform fields after a language reject a second key

Source: pinned liblangtag0.6.8 `extensions/lt-ext-ldml-t.c`,
`_lt_ext_ldml_t_parse_tag` STATE_FIELD2. Discovery of a new key here happens only
when the nested tag has no language. Thus normal `en-t-m0-ungegn-x0-private`
is accepted,but `en-t-de-m0-ungegn-x0-private` fails at x0 as an invalid field
value. The same first field works with a nested language;the restriction starts
after its first value. Preserve this branch,without extending field discovery
or sorting fields. Evidence is source-derived plus managed normal-parser and
callback regressions;no native execution or outer LanguageTag reachability
claim. Task196.

## CALC-181 — redundant canonical replacement clears private use

Source: same pinned `liblangtag/lt-tag.c`, `_lt_tag_subtract`, `_lt_tag_replace`
and `_lt_tag_canonicalize`. Both helpers test the privateuse pointer,which the
constructor always creates,even when its string is empty. Searching a redundant
prefix for `zh-cmn-x-FOO` finds zh-cmn with preferred cmn. Subtraction clears the
original private value and replacement copies the preferred tag's empty value;
canonical output is cmn. Preserve this behavior,including the mutation of the
actual tag fields. This differs from ordinary en-x-FOO,which retains FOO when
no redundant replacement occurs. Source-derived evidence,not native binary
execution or a standards verdict. Task196.

## CALC-182 — multi-variant parse can leave a duplicated string cache

Source: same pinned `lt_tag_parse_state` second-variant path explicitly frees
and rebuilds the ALL-filter cache for exact prefix comparison before appending
the variant. `_lt_tag_parse` then appends the whole supplied input string to
that nonempty cache at bail. For a single full parse of sl-rozaj-biske,the first
ALL getter returns sl-rozaj-sl-rozaj-biske. Canonicalization changes filters and
rebuilds from actual fields,producing sl-rozaj-biske. Preserve both the transient
cache value and canonical result;do not silently invalidate it after append.
Evidence is source-derived and replayed in managed tag/Chromium/Worker tests;
no executed native oracle or whole LibreOffice UI effect is claimed. Task196.

## CALC-183 — normal private-use parsing accepts a wildcard token

Source: same pinned `lt_tag_parse_state` PRIVATEUSETOKEN/PRIVATEUSETOKEN2 accepts
any scanner token with length<=8. The scanner admits a standalone asterisk and
allow_wildcard=false only disables the separate wildcard-range dispatch,not
this length branch. Therefore normal x-* parses and canonicalizes to x-*.
Preserve the original normal parser result;do not add an alphanumeric check
absent from this branch. Source-derived managed normal-parser/browser evidence,
not a full outer LanguageTag validity or native execution claim. Task196.

## CALC-185 — ODFF numeric overflow becomes a compiler argument error

Source: pinned LibreOffice `9bc445578031fecf56086729d8e4940c77e14d65`,
`sc/source/core/tool/compiler.cxx`, `ScCompiler::ParseValue` ODFF/OOXML branch.
When RTL parsing reports OutOfRange, the compiler sets IllegalArgument (502)
and still creates the numeric token. The source itself asks why infinity is
not instead accepted and diagnosed by the interpreter. Consequently numeric
`1e999` has a compiler error, while arithmetic `1e308*1e308` reaches interpreter
IllegalFPOperation (503). Preserve this distinction; do not normalize both to
a generic numeric error. Source-derived evidence and real document error
regressions in task200; no native execution or defect verdict is claimed.
CALC-184 belongs to the deferred task197 snapshot and is not reused here.

## CALC-186 — a deleted arithmetic reference can still read cell A1

Source: pinned LibreOffice `9bc445578031fecf56086729d8e4940c77e14d65`,
`sc/source/core/tool/interpr4.cxx`, `PopSingleRef` and `GetDouble` single-ref
branches. `GetDouble` initializes its output address to zero. `PopSingleRef`
sets NoRef for an initialized deleted reference and leaves that address
unchanged. `GetDouble` then still reads the cell at that address through
`GetCellValue`, preserving the previous NoRef error. Thus, on sheet zero,
a deleted reference used in arithmetic can evaluate a dirty A1 even though
the expression ultimately reports NoRef. Final direct-reference resolution
has a separate error guard and does not make this read. Preserve both paths;
do not skip the arithmetic read merely because an error already exists.
Task201 tests initialized reference data and actual formula cells. This is
source-derived evidence, not native execution or a claim about imported
malformed formulas, locale coercion or full UI effects.

## CALC-187 — formula number output need not preserve the last binary64 digits

Source: pinned LibreOffice `9bc445578031fecf56086729d8e4940c77e14d65`,
`FormulaCompiler::AppendDouble` and `sal/rtl/strtmpl.hxx` doubleToString.
Formula output requests Automatic/Max, but the shared formatter ordinarily
rounds to15significant decimal digits. For example,1.2345678901234567 is written
as1.23456789012346 and parsing that text changes the binary64 value. Exact
integers below2^53 instead retain their full digits; the top five finite
binary64 values also use the separate17digit overflow-avoidance branch.
Preserve these source distinctions instead of substituting JS shortest text
as the finished formula output. JS shortest conversion is used only for the
decimal decomposition before the native rounding/presentation steps. Task202
has source-derived and managed regression witnesses, not native execution or
a claim that this intentional precision policy is a confirmed upstream bug.

## CALC-188 — horizontal iterator sheet reset retains the old allocation bound

Source: pinned LibreOffice `9bc445578031fecf56086729d8e4940c77e14d65`,
`ScHorizontalCellIterator` constructor and SetTab in `dociter.cxx`, plus
`ScColContainer::operator[]` in `colcontainer.hxx`. Only construction clamps
nEndCol to the first sheet's allocated columns. SetTab retains that bound
and directly indexes columns on the next sheet without a fresh allocation
check. Thus a shorter second sheet is outside the visibly safe source domain;
whether all native callers enforce that precondition remains unverified.
Preserve the original bound and native valid-domain cursor behavior. The JS
implementation explicitly rejects a missing sheet or a retained nonempty
column range that the next sheet has not allocated;it neither creates columns
nor silently re-clamps. Task203 covers supported resets and the rejected
precondition. This is source-derived,not native execution,physical memory
emulation or a claim of a confirmed document-level upstream defect.

## CALC-189: Negative F precision can under-allocate the native output buffer

Status: an original memory-safety failure was reproduced under AddressSanitizer; no returned value
is certified for that failing call.

The pinned
[doubleToString allocation estimate](../../vendor/libreoffice-reference/sal/rtl/strtmpl.hxx#L1562)
combines `nDigits`, `nDecPlaces` and an optional grouping allowance before `alloca`. The later
[negative-F integer fill](../../vendor/libreoffice-reference/sal/rtl/strtmpl.hxx#L1661) can write
more units than that estimate permits.

Native call: value `1e14`, format F, decimal places `-15`, decimal separator period, groups
`{1, 0}`, group separator comma, and trailing-zero erasure false. Here `nExp` is 14 and `nDigits`
is 0. The estimate reserves 24 Unicode units; the integer fill executes 14 iterations, each writing
a separator and a zero. The isolated original caller aborts with `SIGABRT` and
`dynamic-stack-buffer-overflow` at `strtmpl.hxx:1667`. This is an observed failure of that input,
not proof that every negative-F call fails or a confirmed upstream issue report.

Evidence: the
[unchanged-source observation caller](../../scripts/rtl-double-format-native-probe.mjs),
[original fixture](../../apps/office/src/sal/rtl/native-double-format-cases.json),
[isolated sanitizer diagnostic](../../.agentplane/tasks/202610182355-2WD4TX/native-isolated-stack-overflow.log)
and [task 25 verification](../../.agentplane/tasks/202610182355-2WD4TX/verification.md). The
separate returned-output matrix compares 122,765 states under full normal/ASanUBSan SAL/CPPU graphs.
A conservative allocation-domain check excludes 1,203 potentially unsafe matrix inputs; that count
does not assert 1,203 individually reproduced failures.

Decision: retain the original format selection, precision, rounding, grouping and emission sequence.
Do not clamp negative precision or repair grouping to make the case look normal. Managed string
storage does not reproduce native stack corruption, and the aborted native call is not assigned an
invented normal-output parity certificate. This ledger update changes no kernel code.

## CALC-190: OUStringBuffer setLength does not implement its documented zero fill

Status: source/comment mismatch, with initialized native nonzero-payload observations; complete
caller expectations remain unverified.

The pinned
[setLength documentation and body](../../vendor/libreoffice-reference/include/rtl/ustrbuf.hxx#L447)
say extension appends null characters. The body instead reserves if needed, otherwise writes only
the new terminator, and updates the length. It does not clear all newly exposed cells. The
[reserve implementation](../../vendor/libreoffice-reference/sal/rtl/strtmpl.hxx#L1218) retains the
old logical payload and initializes its logical terminator; native spare allocation is not a promise
of initialized zeroes.

Source-derived initialized example: start with capacity 4 and logical `ABCD`, truncate length to 1,
then restore length 4 without allocation. The first truncation writes zero at index 1; the later
extension preserves the already initialized `C` and `D` at indices 2 and 3. The logical units become
`A, NUL, C, D`. This exact example is a source derivation, not a separately captured native call.

Evidence: the genuine
[OUStringBuffer observation caller](../../scripts/rtl-oustringbuffer-native-probe.mjs),
[original fixture](../../apps/office/src/sal/rtl/native-oustringbuffer-cases.json) and
[task 26 verification](../../.agentplane/tasks/202610190012-CMHQFZ/verification.md). Its
within-capacity length events explicitly initialize spare cells, then observe nonzero `0x4321` units
after extension. The growing case compares initialized prefix/capacity/terminator and fills unknown
new payload before reading; it does not inspect uninitialized native memory or prove those bytes are
zero.

Decision: preserve the body, including the unchanged-length no-op and the
reserve-versus-direct-terminator branch. Do not add zero filling to match the comment. The
[managed owner](../../apps/office/src/sal/inc/rtl/ustrbuf.ts) retains those explicit operations.
Typed-array initialization is a host storage property, not an asserted native guarantee.

## CALC-191: UpperCharToUnicode checks destination exhaustion only before its loop

Status: source-only bounds concern; no native overflow experiment or affected-caller proof has been
performed.

The pinned
[ImplUpperCharToUnicode](../../vendor/libreoffice-reference/sal/textenc/tcvtbyte.cxx#L122) checks
whether the destination is empty once, then loops over the full source, writing and advancing the
destination without another end comparison. The final counters follow that full-source traversal. In
contrast, the nearby public conversion contract accepts a destination capacity, and other conversion
loops check it while writing.

Source-level example: two initialized ASCII source bytes and a destination capacity of one pass the
initial nonempty-destination check; the loop then attempts two writes. Whether every original caller
supplies at least one destination unit per source byte is not established here. Do not claim an
observed sanitizer failure or a defined returned buffer for this hypothetical overrun. A separate
corner is that the initial empty-destination branch reports an error even when the source is empty.

Evidence:
[original implementation](../../vendor/libreoffice-reference/sal/textenc/tcvtbyte.cxx#L122),
[original declaration](../../vendor/libreoffice-reference/sal/textenc/tcvtbyte.hxx#L28), and the
[public conversion declaration](../../vendor/libreoffice-reference/include/rtl/textcvt.h#L109). This
converter is not implemented in the managed kernel at the time of this entry.

Decision: retain the original initial check, loop order, flags and counters when porting this
responsibility. Do not silently add a per-character destination check as an upstream fix. Document
valid caller/storage preconditions and keep undefined memory effects outside native output
certification. The explicitly documented `ASCII_US` import compatibility with MS-1252 in
`textenc.cxx` is intentional source behavior, and is not classified as a defect by this entry.

## CALC-192: reverse replacement table contains an out-of-order registered-sign entry

Status: source/table inconsistency with genuine normal and ASan/UBSan conversion witnesses;
intent and all affected callers remain unverified.

The pinned [replacement string table](../../vendor/libreoffice-reference/sal/textenc/convertsimple.cxx#L370)
places `0x0AE0` with comment `REGISTERED SIGN` between `0x00AB` and `0x00BB`. The expected
registered-sign code point is `0x00AE`; the literal entry also breaks the ordering required by the
following [binary search](../../vendor/libreoffice-reference/sal/textenc/convertsimple.cxx#L416).
This is not merely a mislabeled successful lookup: the out-of-order entry can prevent nearby
replacement rows from being reached.

The [original native caller](../../scripts/rtl-singlebyte-reverse-native-probe.mjs) invokes the unchanged
full converter with actual `ASCII_US` data, destination capacity seven and both replacement flags
(`0x300`). `U+00A9` writes `(c)` and `U+00AB` writes `<<`, with no undefined status. `U+00AE`,
`U+00BB`, `U+00BC` and `U+0AE0` instead write `?`, consume one UTF-16 unit and report undefined
status `8`. The `U+00BB` and `U+00BC` replacement rows are present in the source. Both genuine
native graphs return identical bytes; initialized sentinel storage is retained after the output.

Evidence: [authenticated native observations](../../apps/office/src/sal/textenc/native-singlebyte-reverse-cases.json),
[bounded extracted witnesses](../../.agentplane/tasks/202610191146-5W55E9/evidence/native-suspect-witnesses.json)
and the [managed original owner](../../apps/office/src/sal/textenc/convertsimple.ts).

Decision: keep the literal `0x0AE0`, original table order and original binary search. Do not substitute
`0x00AE`, sort the table or add a special registered-sign fallback as a compatibility fix. The current
port does not claim complete caller intent or a native public-codec integration certificate.

## CALC-193: private Unicode byte mapping writes before checking destination capacity

Status: original logical destination-capacity overrun reproduced with initialized oversized backing
storage; no native physical allocation overflow experiment has been performed.

The pinned [undefined-character handler](../../vendor/libreoffice-reference/sal/textenc/handleundefinedunicodetotextchar.cxx#L82)
handles `U+F100..U+F1FF` plus `RTL_UNICODETOTEXT_FLAGS_PRIVATE_MAPTO0` before any destination-end
comparison. It writes the mapped byte, advances both pointers and returns success. The
[reverse converter](../../vendor/libreoffice-reference/sal/textenc/convertsimple.cxx#L580) calls that handler
before its normal temporary-buffer capacity check.

A genuine full native call with `ASCII_US` data, source `U+F100`, logical destination capacity zero
and flag `0x400` writes byte zero into an initialized sentinel backing array. It returns one written
byte, one consumed unit and status zero, despite the advertised capacity being zero. The independently
called handler similarly advances a nonzero initial destination offset beyond its supplied end.
Normal and ASan/UBSan observations agree. This experiment deliberately provides physical backing
storage for the observed write; it does not demonstrate a sanitizer failure for a zero-sized allocation.
Whether all production callers reserve a sufficient byte-per-unit backing allocation remains unproved.

Evidence: [original native probe](../../scripts/rtl-singlebyte-reverse-native-probe.mjs),
[authenticated fixture](../../apps/office/src/sal/textenc/native-singlebyte-reverse-cases.json),
[bounded witness](../../.agentplane/tasks/202610191146-5W55E9/evidence/native-suspect-witnesses.json)
and [managed handler](../../apps/office/src/sal/textenc/handleundefinedunicodetotextchar.ts).

Decision: preserve the original private-mapping order, logical write and returned counters. Do not
insert a destination-capacity guard or clamp the count. Borrowed typed storage binds initialized
native buffer views; its handling of writes outside the physical allocation does not certify native
undefined-memory behavior.

## CALC-194: attribute lookup validates an uninitialized row but trusts a single initialized run

Status: source inspection and managed logical reproduction; no compiled native reproduction has
been performed. Whether callers always satisfy a valid-row precondition remains unproved.

The pinned [ScAttrArray::Search](../../vendor/libreoffice-reference/sc/source/core/data/attarray.cxx#L189)
returns index zero immediately when the array has one entry. It does not inspect the requested row.
[GetPattern](../../vendor/libreoffice-reference/sc/source/core/data/attarray.cxx#L235) and
[GetPatternRange](../../vendor/libreoffice-reference/sc/source/core/data/attarray.cxx#L250) validate
rows only while the array is empty; initialized arrays delegate directly to Search. Consequently an
out-of-range row can return the single canonical run after initialization,where an uninitialized array
returns null. Multiple-run lookup rejects rows beyond its final end through binary search.

Decision: preserve these source branches in the managed
[ScAttrArray](../../apps/office/src/sc/source/core/data/attarray.ts). The
[regression](../../apps/office/src/sc/source/core/data/attarray.test.ts) explicitly distinguishes empty,
single-run and multiple-run results. Normal document/table UI boundaries validate coordinates.
Do not silently normalize this source behavior while implementing font-size UI.

## CALC-195: standard row height narrows before multiplying a font height

Status: pinned source inspection only; no compiled native reproduction or undefined-behavior claim.

[lcl_GetAttribHeight](../../vendor/libreoffice-reference/sc/source/core/data/column2.cxx#L866)
assigns the UInt32 font height to UInt16, then performs `nHeight *= 1.18`. Large font heights
therefore first narrow modulo 65536. A floating result outside the UInt16 range has no certified
conversion in this port. Emphasis and margin additions also store back into UInt16. The current
normal UI sizes use the defined representable range.

Decision: retain source field widths, truncation, emphasis, margins and the 23-twip correction in
[column2.ts](../../apps/office/src/sc/source/core/data/column2.ts). Do not silently widen the
algorithm or certify extreme native floating conversions from managed tests.

## CALC-196: automatic height context accumulates across selected sheets

Status: source inspection and managed logical regression; no compiled native reproduction.
Whether this cross-sheet height policy is intentional remains unproved.

[AdjustBlockHeight](../../vendor/libreoffice-reference/sc/source/ui/view/viewfun2.cxx#L151)
constructs one RowHeightContext before walking the selected sheets.
[GetOptimalHeightsInColumn](../../vendor/libreoffice-reference/sc/source/core/data/table1.cxx#L89)
passes its existing array to the column calculation, whose standard path only raises values when
its attribute height is larger. There is no reset between sheets. Consequently a later selected
sheet can retain an earlier sheet's larger calculated row height even when its own fonts are smaller.

Decision: preserve shared context ordering in
[AdjustBlockHeight](../../apps/office/src/sc/source/ui/view/viewfun2.ts) and exercise it with real
selected sheets in [rowheight.test.ts](../../apps/office/src/sc/source/core/data/rowheight.test.ts).
Do not add an independent per-sheet reset as an unrequested upstream fix.

## CALC-197: empty signed numeric input can become a valid minimum font weight

Status: pinned source inspection and managed logical reproduction; no compiled native reproduction.

The signed UTF16 [SAX number converter](../../vendor/libreoffice-reference/sax/source/tools/converter.cxx#L689)
checks complete consumption after an optional minus and digit scan, then clamps the RTL result.
Empty input, whitespace-only input and a bare minus can therefore succeed with the supplied lower
bound. The original [font-weight handler](../../vendor/libreoffice-reference/xmloff/source/style/weighhdl.cxx#L72)
uses bounds 100..900, so these inputs become THIN. Its DONTKNOW weight exports as `0`, which
reimports through the same clamp as THIN rather than DONTKNOW.

Decision: preserve the source parser, clamping and handler map. Managed witnesses are in
[converter-number.test.ts](../../apps/office/src/sax/source/tools/converter-number.test.ts) and
[character-hdl.test.ts](../../apps/office/src/xmloff/source/style/character-hdl.test.ts).
Do not add a digit-presence check or special-case the DONTKNOW roundtrip without an upstream change.

## CALC-198: RGB import validates shape but propagates invalid hex digits as signed bits

Status: pinned source inspection and managed port; compiled native reproduction remains pending.

The [SAX color converter](../../vendor/libreoffice-reference/sax/source/tools/converter.cxx#L640)
requires seven characters and a leading hash, but does not reject invalid hexadecimal digits.
[convertToHex](../../vendor/libreoffice-reference/include/o3tl/numeric.hxx#L27) returns -1 for
an invalid character and combines paired results with signed shifts and bitwise OR. The color
converter similarly combines RGB pairs and returns success. Thus a shape-valid invalid color can
produce negative color bits instead of a failed conversion. Invalid shape leaves its output untouched.

Decision: retain this source behavior in the shared
[converter](../../apps/office/src/sax/source/tools/converter.ts) and consumed signed32
[numeric helper](../../apps/office/src/o3tl/inc/numeric.ts). Both document filters must consume
the same native color handler behavior rather than introduce a format-specific strict regular expression.


## CALC-199: underline variant slots reset line color while the general toggle preserves it

- Status: source behavior retained; no upstream correction inferred.
- Pinned source: `sc/source/ui/view/formatsh.cxx`, `ScFormatShell::ExecuteAttr`, cases `SID_ATTR_CHAR_UNDERLINE` and `SID_ULINE_VAL_SINGLE/DOUBLE/DOTTED` (around lines730–786).
- Observation: the general no-argument underline slot copies the effective `SvxUnderlineItem` before changing its line style. The variant slots construct a fresh item, so selecting or toggling a variant resets color/complex-color state to native item defaults.
- Managed implementation: `sc/source/ui/view/formatsh.ts`, `SetCharacterFormat` and `SetUnderlineStyle`, preserves this distinction. The shared Format menu uses the native Single/Double slots and source numeric identities.
- Evidence: `calc-character-format.test.tsx` tests an actual colored native item, visible menu dispatch, reset alpha, exact style state and undo. These are source-based managed checks, not compiled LibreOffice comparison evidence.


## CALC-200: the initial break-iterator scalar cache treats U+0000 differently

Status: pinned source inspection; compiled source reproduction is still pending in task37.

`BreakIteratorImpl::getScriptClass` in
`i18npool/source/breakiterator/breakiteratorImpl.cxx` initializes its function-static
`lastChar` to zero and `nRet` to WEAK, and recomputes only when the requested character
changes. Therefore an initial U+0000 request returns WEAK without consulting
`i18nutil::GetScriptClass`. After a different character has been requested, a U+0000 request
recomputes through `i18nutil/source/utility/scriptclass.cxx`; its compatibility table maps
BASIC_LATIN to LATIN and does not list U+0000 among the special WEAK characters.
The resulting classification depends on the preceding scalar-cache history.

Decision: preserve the original cache initialization and update logic when porting the
consumed break-iterator script methods. Do not silently initialize a different sentinel or
remove the cache merely to obtain uniform null-character behavior. The source byte identities
are retained in task37's `font-script-source-baseline.json`; this observation is not a claim
of compiled full LibreOffice service parity.

## CALC-201: grouped-sheet script selection does not enumerate every selected sheet

Status: pinned source inspection, retained by the current simple-mark browser binding.

`ScMarkData::FillRangeListWithMarks` in `sc/source/core/data/markdata.cxx` explicitly
contains `TODO: for multiple selected tables enter multiple ranges !!!`. Its simple-mark
branch appends `aMarkRange` once. `ScViewFunc::GetSelectionScriptType` calls this method
without extending the resulting ranges to all grouped sheets, and
`ScDocument::GetRangeScriptType` in `documen6.cxx` reads each range's start sheet.

Consequently, applying a family to grouped sheets can choose script attributes from one
sheet even when another selected sheet contains a different script. Attribute application
still affects the grouped sheets. This can leave a different script's font unchanged there.

Decision: retain the source distinction between script aggregation and grouped attribute
application. Do not silently union every selected sheet's scripts in the browser binding.
This observation does not certify full native multi-mark or formatted-cell cache behavior.

## CALC-202: invalid background color can still apply an opaque transparency property

Status: source-composition candidate; a compiled whole-native-import reproduction is pending.

The cell map in `sc/source/filter/xml/xmlstyle.cxx` maps the same
`fo:background-color` attribute to both `CellBackColor` and
`IsCellBackgroundTransparent`. `XMLColorTransparentPropHdl::importXML` in
`xmloff/source/style/xmlbahdl.cxx` reports a failed RGB conversion for a value such as
`invalid`, whereas `XMLIsTransparentPropHdl::importXML` always succeeds and reports
false for every value other than the exact `transparent` token. The separate bool property
therefore remains admissible even when its accompanying RGB property is rejected.

`sc/inc/CommonProperties.hxx` and `cellsuno.cxx` bind these properties to the real brush's
`MID_BACK_COLOR` and `MID_GRAPHIC_TRANSPARENT`. The latter branch of
`SvxBrushItem::PutValue` sets alpha to 255 for false. Over the transparent-white pool default
in `sc/source/core/data/docpool.cxx`, applying only this successful property yields opaque
white. Task38's consumed mapper reproduces this result with an invalid-color diagnostic.
Native property-list ordering and the complete UNO import transaction still require a
whole-native witness before this is described as a confirmed LibreOffice import bug.

Decision: retain the two independent source handlers and native brush writes. Do not turn
their merged attribute into an atomic browser validator that suppresses the successful bool
property merely because RGB parsing failed. The regression uses independently authored XML
in `ods-native-colors.test.ts`; it does not certify the complete native importer.

## CALC-203: parameterless color commands retain the previous complex-color identity

Status: pinned source inspection and consumed-item regression; complete native theme rendering
has not been reproduced.

In `sc/source/ui/view/formatsh.cxx`, the no-argument `SID_ATTR_CHAR_COLOR` and
`SID_BACKGROUND_COLOR` branches obtain the recent `NamedColor`'s resolved final color,
copy the selected font-color item or brush, and replace only its plain color. The native
setters in `include/editeng/colritem.hxx` and `include/editeng/brushitem.hxx` do not replace
the owned complex-color value. In contrast, the background argument branch explicitly
copies `rNewColorItem.getComplexColor()` as well.

Thus a parameterless background action can apply the RGB value of a recent Accent5 color
while retaining the selected brush's Accent3 identity and transformations. A later theme
re-resolution could therefore behave differently from the argument-bearing action even
when the currently resolved RGB values agree. This is a suspected inconsistency rather
than a claim about the complete native renderer.

Decision: preserve the source branch distinction. Task38's actual native brush/history
regression in `calc-color.test.tsx` checks retained shading/graphic transparency, replacement
of complex metadata on an explicit argument, retention of the old theme identity on a
recent-color action, and restoration through the real attribute undo document.

## CALC-204: an active view overrides the configured automatic-font comparison color

Status: pinned `ScPatternAttr::fillColor` inspection and consumed value regression.

In `sc/source/core/data/patattr.cxx`, the automatic/ignore-font branch computes
`aSysTextColor` from the supplied cached font color or configuration. Its final
`SfxViewShell::Current()` branch nevertheless chooses plain white or black from background
brightness whenever any current view exists. The computed system color is used only when
there is no current view. This also distinguishes Print behavior on a dark background:
with a current view the result is white; without one it is the earlier plain-black print
color. The browser binding supplies actual current-view presence and configuration colors
as borrowed values; it does not emulate those unported services.

Decision: retain the original branch ordering rather than always using configuration or
always forcing black for Print. Literal current-view/no-view and cached configuration cases
are retained in `patattr.test.ts`; full native view-service execution remains unverified.

## CALC-205: font growth can reduce oversized values or wrap below the shrink minimum

Status: pinned `ScFormatShell::ExecuteAttr` expressions and 16 initialized standalone C++
witnesses; complete LibreOffice/VCL execution is not claimed.

In `sc/source/ui/view/formatsh.cxx`, Grow computes unsigned32 `nSize + 40` before taking
`min(..., 19998)`. Therefore growing 22000 twips reduces it to 19998, and growing
`0xffffffff` wraps to 39 twips. The 40-twip minimum belongs only to Shrink. Shrink converts
its unsigned subtraction to signed32 for `std::max<sal_Int32>`; sufficiently large heights
can consequently become 40 twips. These are initialized integer inputs accepted by the
native font-height item, rather than claims about undefined floating-point casts.

Decision: retain the exact conversions and limits. Task89YNKC compiles the original pinned
expressions in an isolated witness and compares all 16 observations with the JavaScript
operation. `calc-font-step.test.tsx` retains ordinary, zero, oversized and wrap cases.

## CALC-206: stepping one script can clear mixed heights of other scripts

Status: pinned selection/item-set/pool-cache path and real Calc pattern/history regression.

The Grow/Shrink branch first copies the complete selected font-height script set, including
INVALID entries of scripts whose values differ between selected cells. It then replaces
only the selected-script items. `ScViewFunc::ApplyUserItemSet` preserves those INVALID entries
with `Put(..., false)`, while `ScItemPoolCache::ApplyTo` uses the default `Put` behavior when
merging the delta into each cell: INVALID clears the existing direct item to default.

For example, Latin12 in both selected cells and Asian15/20 can become Latin14 and default
Asian height after a Latin Grow. Omitting the unselected script entries would avoid the
reset but would differ from the source.

Decision: retain the original full script-set delta and default-clearing application.
`calc-font-step.test.tsx` checks the reset and real Undo/Redo restoration of both prior
Asian heights. This also corrects the previous local pattern application that copied
INVALID into a cell instead of clearing its direct item as the native pool cache does.

## CALC-207: script-set cloning ignores an explicitly requested destination pool

Status: pinned `SvxScriptSetItem::Clone` and real shared-pool regression.

In `editeng/source/items/textitem.cxx`, `SvxScriptSetItem::Clone(SfxItemPool*)` leaves its
parameter unnamed and constructs the new item with the original contained set's pool.
This differs from the target-pool copy facility of the base `SfxSetItem` contract.

Decision: retain original-pool cloning. `native-script-set-item.test.ts` supplies a distinct
real destination pool and verifies that the clone still belongs to the original one,
with independent contained state and retained INVALID entries. No replacement pool or
compatibility wrapper is introduced.

## CALC-208: multi-selection merging can omit unallocated default columns

Status: pinned `ScTable::MergeSelectionPattern` and consumed core selection regression.

In `sc/source/core/data/table2.cxx`, the multi-selection path clamps each marked column
span to allocated columns. It has no default-column merge after that loop. In contrast,
`ScTable::MergePatternArea` explicitly merges `aDefaultColData` when a simple rectangle
extends beyond allocated columns.

An allocated selected cell with height240 and another marked column outside the allocated
prefix can therefore retain a uniform240 selection result instead of becoming mixed with
the default200. The equivalent simple rectangle does become mixed.

Decision: preserve the two source paths. `selection-pattern.test.ts` checks the conditional
unallocated-column example without allocating cells to hide the difference. This is not a
certificate of full native sheet-view or device services.

## CALC-209: repeated identical formatting still records Undo and marks the document modified

Status: pinned `ApplyAttributesOperation.cxx`, base `Operation::canRunTheOperation` and
consumed Calc history regressions.

The view's selection-pattern path invokes `ApplyAttributesToCellOperation` or
`ApplyAttributesWithChangedRangeOperation`. Their ordinary record-enabled branches create
an undo action and call the document modificator without testing whether the resulting
pattern differs. The base operation admission is true; these operation classes do not
replace it with an equality check. A repeated explicit font size, alignment or color can
therefore consume another Undo entry even though the stored attribute values are unchanged.

Decision: preserve the native operation record and modified notification separately from
the browser's boolean indication of whether attributes changed. Tests for FontHeight,
alignment and color retain the repeated entry, the actual bounded undo-stack limit and
Undo/Redo through the unchanged intermediate value. Failed input admission and mixed-script
Grow with no uniform item still leave history untouched.

## CALC-210: whole-sheet font queries clip to data while the formatting path retains the full marks

Status: pinned `viewfunc.cxx` source inspection and consumed view-query regression.

`ScViewFunc::GetSelectionPattern` calls `ShrinkToDataArea` for an exact whole-sheet simple
mark. Its comment says this is consistent with `ApplySelectionPattern`; the pinned file's
only call to that helper is the query call. The current apply path copies the actual marks,
excludes filtered cells and converts them to multi marks before invoking attribute operations.
It does not perform the same clipping at that point. A font state can therefore describe
only occupied data while formatting still receives the original whole-sheet marks.

Decision: preserve the query clipping and keep the actual view selection unchanged. The
port derives bounds from the real typed cell blocks, excludes formatting-only cells and
retains the native clipping function's partially mutated outputs on failure. This source
observation does not certify the unported filtered-cell, alternate sheet-view, operation
allocation or device-layout services.

## CALC-211: mixed line formatting toggles through a fresh factory item and loses independent line color

Status: pinned `SfxBindings::Execute_Impl` and consumed Calc Overline regression.

For a uniform SET/default toggleable enum, bindings clone the current item and flip its
boolean projection, retaining line color and other metadata. For INVALID (mixed) state,
bindings instead create the slot's default item, set its mapped Which and enable it. Thus
selecting differently formatted cells and toggling Overline can reset an existing explicit
line color to the fresh item's `font-color` default while setting SINGLE overline.

Decision: preserve the original factory branch. The shared toggle preparation and actual
Calc selection/history tests check the distinct uniform-color-preserving and mixed-color-
resetting outcomes. This is a source-based consumed contract, not a full native bindings,
UNO dispatch or device-painting certificate.

## CALC-212: strikeout text treats every nonempty non-slash value as X

Status: pinned `XMLCrossedOutTextPropHdl::importXML` and native-handler/Calc XML regressions.

The text handler tests only whether the string is empty and whether its first UTF16 code
unit is `/`. Every other nonempty value, including lowercase x, whitespace, arbitrary
words and a leading surrogate, successfully assigns `FontStrikeout::X`. It does not validate
that the text is the literal uppercase X.

Decision: preserve that conversion exactly in the shared handler and in the real Calc
style importer. Tests include slash suffixes, whitespace, an emoji and arbitrary words;
empty input returns false without changing the accumulated Any.

## CALC-213: strikeout none properties can preserve an already active accumulated style

Status: pinned crossed-out type/style/width handlers and independently authored Calc XML.

When a non-NONE short is already present, the type handler retains it for incoming NONE or
SINGLE; the style handler retains it for both recognized incoming style values. Width NONE
also preserves the existing style. Thus `style=solid,width=bold,type=none` retains BOLD in
actual XML attribute order rather than clearing strikeout. DOUBLE overrides SINGLE/BOLD
but retains SLASH/X; BOLD width upgrades SINGLE but retains DOUBLE/SLASH/X.

Decision: retain original ordered maps, actual SAX order, signed/unsigned Any projections
and no-write behavior. Shared and Calc tests verify the explicit contradictory-property
examples. Native DONTKNOW is not present in the export maps and is not invented as a new
ODF token. No full mapper/service or rich-text device certificate is claimed.

## CALC-214: a negative signed projection can force a SHORT Any writeback

Status: pinned `cdouthdl.cxx` integer declarations/casts and genuine Any tests in managed and
browser/Worker runtimes.

Type and width merge candidates are `sal_uInt16`, while the extracted old value is
`sal_Int16`. Retaining a negative signed projection assigns its unsigned representation to
the candidate. Their subsequent promoted comparison is unequal, so the handler casts back
to `sal_Int16` and writes the Any. For an original UNSIGNED_SHORT Any carrying65535, the
native signed extraction yields-1 and the merge writes SHORT-1. The style handler's direct
preservation path does not perform that assignment and retains the original UNSIGNED_SHORT.

Decision: preserve unsigned candidates, signed comparison and final short writeback. Tests
initialize real unsigned-short Any values65535/32768 and verify their signed projections
and final type identities. LONG-to-SHORT narrowing is not assumed: the existing original
Any extraction rules do not admit LONG. These are initialized native value-contract
witnesses;ordinary valid ODF strikeout tokens do not produce negative enum values.

## CALC-215: outline font paints its central glyph and line rasters white

Status: pinned `vcl/source/outdev/text.cxx`, `OutputDevice::ImplDrawSpecialText`.

After eight one-pixel draws in the original text and line colors, the outline branch sets
text, underline and overline colors to COL_WHITE and draws the central raster. This is
white even when the cell background has another color; it is not a transparent cutout.

Decision: retain the ordered source offsets and white central alpha raster in the shared
browser SVG filter. The actual glyph and independently colored line pixels form the
source graphic once. Browser drawing uses CSS pixels and actual observed layout bounds;
this does not certify native device scaling, font metrics or rich-text painting.

## CALC-216: failed boolean XML conversion still replaces the output Any

Status: pinned `xmloff/source/style/xmlbahdl.cxx`, `XMLBoolPropHdl::importXML`.

The handler initializes false, calls the original strict boolean converter, writes that
boolean into the Any, then returns the converter result. Rejected forms such as `1` and
`TRUE` therefore replace a previous numeric Any with a false bool while returning false.

Decision: preserve this shared value contract. The Calc property mapper honors the false
return and diagnoses the rejected property rather than applying its intermediate Any.
Export extracts an actual bool and leaves the caller's string unchanged on type failure.

## CALC-217: direct-format deletion leaves the unallocated default-column tail unchanged

Status: pinned `ScTable::ApplyPatternArea`, `ScTable::DeleteArea` and `ScTable::DeleteSelection`
in `sc/source/core/data/table2.cxx`.

Applying a pattern through MaxCol updates `aDefaultColData` for unallocated columns.
The deletion paths visit only `aCol`: DeleteArea clamps its last column to the allocated
size, and DeleteSelection loops allocated columns. Neither clears `aDefaultColData`.
Consequently a whole-sheet Clear may remove direct formatting from allocated columns
while the unallocated tail retains the previously applied pattern.

Decision: preserve the source traversal and allocation behavior. Tests apply an actual
full-sheet pattern, allocate the real content column, clear its range and inspect the
unchanged tail through the genuine document owner. No allocation or default-tail reset
is added to disguise the difference. Attribute Undo captures the real source patterns.

## CALC218 — Column metric dialog quantizes the unchanged default and minimum

Pinned `sc/source/ui/miscdlgs/mtrindlg.cxx` initializes normalized twips,converts them
into a two-decimal configured field unit,and reads converted/denormalized twips on OK.
With `STD_COL_WIDTH=1280`,the actual result is1281twips after2.26cm or1282twips after0.89in.
The factory's2twip minimum rounds to a zero display-unit minimum;accepting zero reaches
native DIRECT hiding while retaining the prior stored width. Preserve this behavior.
`sc/source/ui/miscdlgs/mtrindlg.test.ts` covers both unit results,zero and the one-metre maximum.
Native widget/device services and arbitrary decimal precisions are not certified.

## CALC219 — Maximum column width wraps the recorded UInt16 HMM argument

Pinned `cellsh3.cxx` accepts metric twips directly,but constructs a separate recording request
with `static_cast<sal_uInt16>(TwipsToEvenHMM(nVal))`. `global.hxx` rounds127/144 then doubles.
The56693twip maximum records100000HMM narrowed to34464;the live column retains56693twips.
Preserve this order rather than replacing the recording argument with a wider browser value.
`sc/source/ui/view/column-width.test.ts` observes the actual separate completed request.
Macro recorder services and replay through full UNO transformations remain unported.

## CALC220 — Numeric mixed fractions preserve native negative-sign asymmetry

Pinned `vcl/source/control/field.cxx::ToScaledWholeAndDec` removes the numerator sign,
applies the negative marker to the whole part,then adds the unsigned fractional magnitude.
Consequently `-1/2` parses as+0.5 and `-1 1/2` as-0.5. Preserve this source arithmetic.
`vcl/source/control/field.test.ts` checks both original alternatives and division-by-zero failure.
Currency parsing,translated unit catalogs and full native widget services remain unported.

## CALC221 — Native width storage includes one extra terminal column

Pinned `table1.cxx` creates column widths and flags with inclusive `MaxCol()+1` as their
compressed-array limit. Preserve that sentinel while validating public column setters through
`ValidCol`. Browser geometry and ODS clamp runs to the actual `MaxCol` and do not emit an
extra cell/column. `sc/source/core/data/native-column-width.test.ts` pins the sentinel separately
from actual document limits. This observation does not establish an upstream defect.

## CALC222 — Signed ODF column width narrows after HMM conversion

Pinned `XMLMeasurePropHdl::importXML` uses `convertMeasureToCore` with signed32 defaults.
`ScTableColumnsObj::SetOnePropertyValue` converts the HMM integer to twips before the
UInt16 `ScDocFunc::SetWidthOrHeight` argument. Thus `-1cm` becomes-567twips narrowed to64969,
rather than zero. Preserve these source defaults and narrowing;do not add a positive-width clamp.
`sc/source/filter/xml/ods-native-columns.test.ts` supplies independently authored negative XML.
The complete UNO property/service graph and undefined native arithmetic domains are unverified.

## CALC223 — Unicode type cache starts with a NUL/UNASSIGNED fast path

Pinned `unicode::getUnicodeType` initializes its thread-local cached character and type to0.
A first call with NUL returns UNASSIGNED without querying ICU's CONTROL category. After a
different character,NUL receives the normal category. Preserve this cache behavior per JS realm.
The complete native character-type witness includes the original fast path and all1114112 scalars.
`external/icu/source/common/native-character-types.test.ts` compares the unchanged native byte
protocol,then checks the later NUL lookup. Native OS threading and full Unicode utilities remain
unported;this is a bounded shared numeric-field prerequisite.

## CALC224 — Indentation ODF property narrows to signed16 HMM

Pinned `cellsuno.cxx` publishes ATTR_INDENT as signed16 HMM even though ScIndentItem stores
UInt16 twips. XML uses XML_TYPE_MEASURE16 and `fo:margin-left`. Large positive indentation
therefore wraps when exported;negative imported HMM converts to twips then narrows to UInt16.
Preserve this boundary instead of adding a positive clamp or silently widening the ODF property.
`ods-indent-rows.test.ts` independently exercises signed input and native saturation.
The full UNO property-service graph remains unported.

## CALC225 — Fully filtered indentation selection falls back to the cursor

Pinned `ScViewFunc::ChangeIndent` removes filtered rows from copied marks,then converts them
to multi marks. If no multi mark remains,it marks the current cell without rechecking its filter
state. Thus a fully filtered selection can still indent the cursor cell. Preserve this original
ordering;`cell-indent-row-height.test.ts` records the resulting attribute change. Protection,
merged cells and alternate sheet views remain outside the represented operation.

## CALC226 — Text-output cache refresh drops right indentation

Pinned `output2.cxx` initializes its string-output cache indentation for Left or Right alignment,
but its later pattern refresh only retains Left indentation. `DrawEditParam::calcMargins`
independently includes indentation on the actual aligned side. This appears to make the native
string path depend on cache refresh ordering. Do not invent a corrected native cache here:
the full string-output/device/cache machinery remains unported. The browser projects current
native margin/indent items using the represented margin arithmetic;full native paint/cache parity
is explicitly unverified.

## CALC227 — Rectangular frame redo loses adjacent-border envelopes

Pinned `ScViewFunc::ApplyPatternLines` (`sc/source/ui/view/viewfunc.cxx`) computes
`GetSelectionCover` before recording `ScUndoSelectionAttr`, so Undo restores both the
selected cells and their adjacent borders. `ScUndoSelectionAttr::DoChange(false)`
(`sc/source/ui/undo/undoblk3.cxx`) calls `MarkToMulti`, applies the pattern, then calls
`MarkToSimple` before `ApplySelectionFrame`. For a rectangular mark, `MarkToSimple`
calls `ResetMark`, clearing all four envelope lists (`sc/source/core/data/markdata.cxx`).
`ScDocument::ApplySelectionFrame` consumes these lists without rebuilding them
(`sc/source/core/data/document.cxx`). Thus Redo clears the selected rectangle again
but leaves the adjacent borders restored by Undo. Preserve this source ordering;
do not regenerate envelopes to silently repair it. `border-history.test.ts` verifies
the selected and neighboring edges independently, including retained request-item copies.
Native drawing, merged-cell paint extents and rich-edit history remain unported.

## CALC228 — Mixed frame-style changes bypass attribute undo

Pinned `ScViewFunc::SetSelectionFrameLines` (`sc/source/ui/view/viewfun2.cxx`) sends
uniform outer/diagonal items through `ApplyAttributes`, which records attribute history.
If any of those selected items is INVALID, it instead converts working marks to multi
and calls `ScDocument::ApplySelectionLineStyle` directly. That branch records no undo
operation before marking the document modified. Preserve the branch and existing history;
do not silently add a synthetic undo action. `calc-borders.test.tsx` distinguishes
uniform single-cell history from genuinely different perimeter items in a rectangle.
Protection, rich edit, alternate views and native paint services remain unported.

## CALC229 — Toolbar preset lines bypass Calc's current default line

Pinned `DispatchBorderItem` (`svx/source/tbxctrls/tbcontrl.cxx`) now calls
`GuessLinesWidths` with `SvxBorderLineWidth::Thin` (15twips) for non-diagonal presets.
Calc's `ScFormatShell::ExecuteAttr` (`sc/source/ui/view/formatsh.cxx`) still substitutes
its stored current frame line only for requested lines whose outer width is zero.
Thus toolbar presets apply black solid 0.75pt edges even after changing the current
frame color/style; they do not use the remembered default line. The diagonal presets
independently use Hairline (1twip). Preserve these actual source values and the zero-width
substitution branch. `calc-borders.test.tsx` checks preset widths/colors after a real
style/color workflow. Full UNO argument transformation and native widgets remain unported.

## CALC230 — None line style retains empty diagonal line pointers

Pinned `ScViewFunc::SetSelectionFrameLines` (`sc/source/ui/view/viewfun2.cxx`) clears
outer edge pointers when the requested line is absent. Its diagonal branch instead
calls `UpdateLineAttrs` with that absent source,which returns without changing the
shared temporary line,and then stores the temporary through `SvxLineItem::SetLine`.
For the None request this leaves a present zero-width diagonal rather than a null
pointer. Preserve both the empty value and explicit item state;do not normalize them
to the No Borders preset's null diagonal items. `calc-borders.test.tsx` checks the
actual native diagonal binding after removing outer/diagonal lines with None.
Full native widget,UNO and rendering-service parity remain unverified.

## CALC231 — Border set-cache inheritance collapses independent distances

Pinned `ScItemPoolCache::ApplyTo` (`sc/source/core/data/poolcach.cxx`) merges an
incoming SET border with an existing border item. If the incoming right distance is
zero,it assigns the old right distance to all four sides. Thus an old left distance
of3 and right distance of8 become8 on every side,rather than retaining independent
old distances. Preserve this right-side test and SetAllDistances call. The real
set-cache case in `border-frame.test.ts` checks the resulting left distance;the
single-item cache path remains a different whole-item replacement operation.

## CALC232 — Frame query treats the last allocated column as the selection end

Pinned `ScTable::MergeBlockFrame` (`sc/source/core/data/table2.cxx`) clamps the end
column to allocated columns before calculating each column's right-edge distance.
A selection extending into unallocated columns can therefore report the right border
of its last allocated column as the outer right border. Preserve the clamp and the
resulting validity/color/style query behavior;do not substitute the logical selection
end or synthesize allocated cells. `border-frame.test.ts` checks an extended actual
selection whose reported right line still comes from the last allocated column.
Full merged/device/alternate-view paint parity remains unverified.

### CALC233 — diagonal width-only XML properties remain active without diagonal shorthand

- Pinned source: `sc/source/filter/xml/xmlstyli.cxx`, `ScXMLCellImportPropertyMapper::finished`; `sc/source/filter/xml/xmlstyle.cxx`, `aXMLScCellStylesProperties`; `editeng/source/items/frmitems.cxx`, `SvxLineItem::PutValue`.
- Observation: outer per-side width properties are disabled independently of whether a border shorthand exists. Diagonal old/new width properties are disabled only inside the branch requiring a diagonal shorthand. A width-only diagonal declaration therefore remains an active property for the original line item. New-spelling preference applies inside the shorthand merge branch; otherwise original SAX property order remains observable.
- Impact: a diagonal width-only declaration can create a solid line even though the same component widths supplied without an outer border do not create outer lines. This asymmetry looks accidental but is retained.
- Local preservation: the Calc border property importer retains this original branch and the existing actual SvxLineItem conversion. Independent ODF fixtures assert the resulting width-only diagonal. Full native UNO property services remain outside the consumed slice.

### CALC234 — compound border width parsing ignores trailing tokens

- Pinned source: `xmloff/source/style/bordrhdl.cxx`, `XMLBorderWidthHdl::importXML`.
- Observation: the shared original handler reads exactly three measures and never checks for a fourth token. Additional trailing text is accepted while only inner width, distance and outer width are assigned.
- Impact: malformed compound width declarations can be imported without rejection. The browser port formerly rejected them, which differed from the pinned source.
- Local preservation: the shared handler now consumes the original first three measures. An independent Calc ODF fixture includes a trailing token and verifies the original resulting component widths. Writer uses the same handler.

### CALC235 — XML text shadow accepts every value except exact none

- Pinned source: `xmloff/source/style/shdwdhdl.cxx`, `XMLShadowedPropHdl::importXML`.
- Observation: the original handler does not parse a shadow color or displacement. It writes true for every string other than the exact token `none`,including empty text,whitespace,uppercase variants and malformed declarations,and always returns success.
- Impact: malformed or differently spaced ODF shadow values enable the shadow effect;export subsequently canonicalizes them to `1pt 1pt`.
- Local preservation: the shared actual-Any handler retains the exact comparison and fixed export spelling. Literal lexical tests cover these inputs;no browser normalization is added.

### CALC236 — XML constants handler returns success without output for out-of-range values

- Pinned source: `xmloff/source/style/XMLConstantsPropertyHandler.cxx`, `XMLConstantsPropertyHandler::exportXML`.
- Observation: after successful enum/integer extraction,the original handler checks the0..65535 range. The out-of-range branch emits a diagnostic but leaves the success bool true and the caller's existing output unchanged. An in-range unmapped constant instead returns false and assigns empty output when no default token exists.
- Impact: callers can receive success together with stale XML text for invalid numeric input.
- Local preservation: the common handler retains both original return/output branches. Actual Any tests independently assert negative,oversized and unmapped values.

### CALC237 — no-argument Wrap Text completes API requests while typed arguments do not

- Pinned source: `sc/source/ui/view/formatsh.cxx`, `ScFormatShell::ExecuteAttr`, `SID_ATTR_ALIGN_LINEBREAK` branches.
- Observation: the no-argument toggle reads the actual selection pattern,applies its negated boolean and unconditionally calls `rReq.Done(aNewSet)` with the resulting cell item. The argument-present branch applies the mapped item and reaches the ordinary final completion guard,which does not complete API requests.
- Impact: otherwise equivalent API operations have different completion and argument-recording states. This asymmetry may be intentional recording behavior;it is preserved rather than normalized by the browser adapter.
- Local preservation: actual SfxRequest tests independently assert the unconditional API toggle completion,recorded Which139 value and unfinished typed API request,alongside normal typed completion and existing completed requests. Full native macro/UNO recording remains unported.

### CALC238 — cached script setter checks logical column validity but assumes allocated storage

- Pinned source: `sc/source/core/data/table1.cxx`, `ScTable::SetScriptType`; `sc/inc/colcontainer.hxx`, `ScColContainer::operator[]`; `sc/source/core/data/column2.cxx`, `ScColumn::SetScriptType`.
- Observation: the table setter only checks ValidCol before directly indexing aCol. The container operator does not grow or allocate its vector. The column setter updates only an already-present CellTextAttr slot. The const table getter instead checks IsColValid before indexing.
- Impact: a logically valid but unallocated column is not admitted by the setter's storage precondition;calling it can access outside the native vector. This may be a deliberate populated-cell caller assumption,not a defect in normal callers.
- Local preservation: cached reads return NONE for unallocated columns;setters do not allocate columns or metadata. Existing-column writes retain UNKNOWN/default/reset semantics. The browser's underlying absent-column access throws instead of inventing storage;native undefined accesses and their failure representation are not executed or claimed as parity. Grouped-formula cache discard remains unported and no grouped-formula context is owned by this slice.

### CALC239 — Calc/EditEngine formatting transfer has asymmetric table and alignment ownership

- Pinned source: `sc/source/core/data/patattr.cxx`, `ScPatternAttr::FillToEditItemSet`, `GetFromEditItemSet`, `FillEditParaItems`.
- Observation: table-style family,height,weight and color participate in transfer,but posture,underline,overline and language ignore table styles. Script spacing is always forced off,even when the cell item is true. Forward automatic color clears a direct EditEngine color item. Reverse Left/default adjustment omits a cell alignment write,so an existing Right alignment survives.
- Impact: the transfer is not a general inverse operation;table-style bold and italic can have different transfer precedence. Reverse left alignment may retain pre-existing cell alignment. Source comments explain automatic color,script spacing and the default text/number alignment distinction;the table-style asymmetry may be deliberate or incomplete.
- Local preservation: retain these exact source rules and test absent/default/SET states separately. Do not normalize table-style behavior or clear cell alignment to force round-trip symmetry. Native render/number/hash caches remain absent in the existing data slice;no dummy InvalidateCaches service is added.

### CALC240 — style detachment and rename distinguish pointer ownership from stored names

- Pinned source: `sc/source/core/data/patattr.cxx`, `ScPatternAttr::SetStyleSheet`, `StyleToName`, `CellAttributeHelper::RenameCellStyle`, `CellStyleDeleted`, `AllStylesToNames`; `sc/inc/patattr.hxx` defaults.
- Observation: SetStyleSheet(null) clears the borrowed style and parent but leaves an existing stored name intact. Default attachment clears only direct fields whose style state is SET,including inherited SET. Rename removes exact matching style pointers from name groups,ignores SetName's boolean return and reinserts using the actual resulting name. Single-style deletion visits registered patterns but not the separately owned default;all-to-name teardown explicitly forces and visits the default.
- Impact: a nonempty style name does not prove an attached style pointer. Failed rename does not imply the requested name entered the registry. Direct formatting/default-state behavior is not a wholesale reset. These may be intentional ownership/lifecycle rules rather than defects.
- Local preservation: retain null/name and SET/default distinctions,exact pointer matching,actual-name re-insertion after failed rename and default-pattern separation. Native style resolution and absent derived caches are not emulated.

### CALC241 — builtin/API style aliases are ordered and pool page defaults differ from style setup

- Pinned source: `sc/source/core/tool/stylehelper.cxx`, ordered ScDisplayNameMap and ScStyleNameConversion; `sc/source/core/data/docpool.cxx` static defaults; `sc/source/core/data/stlsheet.cxx`, page GetItemSet setup.
- Observation: builtin `Heading 1` precedes compatibility programmatic alias `Heading1`. Programmatic `Heading1` resolves to display `Heading 1`,whose display-to-programmatic conversion then chooses `Heading 1`;a custom display `Heading1` is escaped with ` (user)`. Decoding removes one exact suffix before considering family or map. Pool ScaleToPages is1 and paper size is zero;document-backed page-style setup later installs scale-to-pages0 and configured paper size.
- Impact: alias round trips need not retain the old programmatic spelling,and pool defaults must not be mistaken for configured page style values. Source comments describe the compatibility and escaping intent;these are not asserted defects.
- Local preservation: keep initializer order,sentinel iteration,case-sensitive UTF16 suffix and one-suffix removal. Do not sort/deduplicate aliases,normalize spelling,replace pool values with style configuration or invent unavailable rich header/footer defaults.

## CALC242: Feature tag ASCII_US decoding retains upper-byte Windows-1252 mappings

Status: source-confirmed compatibility behavior whose relevance to malformed
font-axis tags is uncertain;preserved,not classified as a confirmed defect.

Pinned `vcl/source/font/Feature.cxx::featureCodeAsString` constructs a terminated
four-byte string and calls OStringToOUString with RTL_TEXTENCODING_ASCII_US.
The original `sal/textenc/textenc.cxx::aImplUSASCIIByteCvtData` explicitly uses
`aImplMS1252ToUniTab` for bytes0x80..0xff. Thus initialized tag0x807fff41 produces
Euro,U+007F,U+00FF,A rather than strict ASCII rejection or bytewise Unicode.
An embedded zero truncates the intermediate C string. The axis parser separately
accepts only ASCII letters,digits and spaces;this concerns direct aggregate tags.

Evidence: actual native table and converter plus literal expected-value tests in
`apps/office/src/vcl/source/font/FontVariation.test.ts`. The first test expectation
incorrectly assumed private-use mapping;source inspection corrected that
expectation while leaving the implementation and native descriptor unchanged.
Decision: retain original table selection,terminator behavior and float output;
do not introduce a host decoder or normalize malformed aggregate tags.

## CALC243: Numbering validity depends on SetLevel overload and conversion

Status: source-confirmed asymmetry;consumer consequences remain to be reviewed.

Pinned `editeng/source/items/numitem.cxx::SvxNumRule::SetLevel` reference overload
replaces a format only when the old slot is invalid or the new format differs.
Calling SetLevel(i,equalFormat,false) on an already valid slot therefore keeps
it valid. The pointer overload sets validity before calling the reference
overload;it can expose an equal previously invalid physical value without a
replacement. Get returns only valid formats;GetLevel ignores the validity bit.
`SvxConvertNumRule` uses GetLevel and writes every overlapping level with the
default true validity,so invalid physical source values become valid destination
values. Null source slots use source-kind fallbacks during this conversion.

Evidence: the original bodies and literal storage/identity/value assertions in
`apps/office/src/editeng/source/items/native-num-rule.test.ts`.
Decision: retain all three behaviors and the original overload ordering.
Do not normalize the validity bit or convert through the valid-only getter.

## CALC244: English EditEngine Asian defaults use the interface-font fallback

Status: source-confirmed default selection whose rationale is uncertain;preserved.

Pinned `editeng/source/items/textitem.cxx::GetDefaultFonts` requests CJK_TEXT with
LANGUAGE_ENGLISH_US. The shipped English DefaultFonts node in
`officecfg/registry/data/org/openoffice/VCL.xcu` has no CJK_TEXT property.
`DefaultFontConfiguration::getDefaultFont` therefore returns empty and
`vcl/source/outdev/font.cxx::OutputDevice::GetDefaultFont` calls
getUserInterfaceFont. Its configured UI_SANS lookup succeeds,so the no-device
OnlyOne branch uses the first configured interface font token,Segoe UI.
This is logical metadata;actual device substitution and glyph fallback can differ.

Evidence: original role/language array,config node and VCL fallback,plus literal
three-family assertions in `native-default-fonts.test.ts`. The prior shared helper
threw an invented exception for missing configured roles;the first new two tests
exposed that mismatch and their failing raw report is retained. The implementation
now follows the original fallback. Unknown enum roles also retain this release
fallback instead of that exception. No CJK family was hardcoded into production.
Decision: preserve these defaults and separate actual device font selection.

## CALC245: Rich-text style changes and field updates preserve different cache rules

Pinned `editeng/source/editeng/editobj.cxx` implements `SetStyleSheet` without
clearing portion info. `ChangeStyleSheetName` delegates to `ImpChangeStyleSheets`
without clearing it either. `ChangeStyleSheets`, however, clears it whenever
a paragraph matches, even when the requested name and family already equal the
previous values. This asymmetry may depend on the callers' layout responsibilities;
it is preserved rather than normalized.

Pinned `editeng/source/editeng/fieldupdater.cxx` passes every `EE_FEATURE_FIELD`
item to `UpdatePageRelativeURLs`, including table and unspecified fields. The
callback owns semantic selection. Neither it nor `updateTableFields` clears
portion info. Task57 tests actual field holders and cache identity through these
operations. These are source observations, not confirmed upstream defects.

## CALC246: Default header/footer areas are null but the XML diagnostic dereferences them

Pinned `sc/source/core/data/attrib.cxx` constructs ScPageHFItem with three empty
unique_ptr areas. Its `dumpAsXml` calls GetLeftArea/GetCenterArea/GetRightArea
and dereferences each result without a null guard. The separate successful UNO
PutValue path materializes missing areas through a real ScEditEngineDefaulter.
A caller may guarantee initialized areas before requesting diagnostics;that
precondition has not been established here,so this is a suspected issue rather
than a confirmed upstream defect. Task58 preserves default null areas and their
distinction from a real empty text value. The diagnostic and UNO content paths
remain unported;no normalization or replacement engine is added.

## CALC-247: Data-area clamping precedes retain-old and only-down modifiers

Status: source behavior retained;possible contract inconsistency.

In `sc/source/core/data/table1.cxx:940`,the comments say `bIncludeOld` retains
at least the initial area and `bOnlyDown` modifies only the final row. The method
nevertheless clamps both input column references to `aCol.size()-1` before either
modifier is considered. With the native initial one allocated column,an input
E9:E9 becomes A9:A9 even with include-old=true or only-down=true.
The complete native consumer/configuration intent is unverified. The port retains
this clamp and tests it with genuine initial column storage;no coordinate repair
or eager allocation is added. Task `202610210052-FZA8S9` records the evidence.

## CALC-248: IllegalArgumentException unknown-position documentation and generated zero default

Status: source-confirmed documentation/default discrepancy; not a confirmed defect.

Pinned `udkapi/com/sun/star/lang/IllegalArgumentException.idl` documents -1 when
ArgumentPosition is unknown. The original comprehensive cppumaker default
constructor nevertheless initializes the sal_Int16 member to zero, as prescribed
by the generator's scalar default rules. A default-constructed exception therefore
carries the first argument's index without the caller supplying a position.
Whether callers must explicitly assign -1 for unknown arguments is not specified
by the constructor contract. Task `202610210335-7QBK8C` retains native zero and
checks default/member/copy/move/assignment plus signed16 boundary values against
original generated C++ over unchanged libraries. Do not normalize the default to
-1 in browser code or replace the actual generated exception with a JS Error.

## CALC-249: approximate Kahan cancellation can discard an integer remainder

Status: suspicious numerical consequence; original portable native output reproduced.

In the pinned `sc/inc/kahan.hxx`, `KahanSum::get()` returns zero when the delayed
term and the compensated total have opposite signs and `rtl::math::approxEqual`
considers them equal in magnitude. This test precedes adding the delayed term.
The consumed non-SSE2 path consequently returns zero after adding
`1e16`, `1`, `-1e16` to a default accumulator, although their exact mathematical
sum is one. Reversing those three input terms produces the same result. This
may be intentional cancellation policy; the intended numerical contract and
upstream history have not been established.

Evidence: `scripts/calc-kahan-native-probe.mjs --check` compiles the unchanged
complete original header with verified full SAL dependencies. Cases zero and
one in `apps/office/src/sc/inc/native-kahan-cases.json` contain both initialized
input orders and bit-exact zero outputs from matching normal and ASan/UBSan
runs. `apps/office/src/sc/inc/kahan.test.ts` compares the actual local owner
against those original observations. The document aggregate test also retains
`=SUM(1E16;1;-1E16)` as zero, following the native reverse argument traversal.
The local accumulator preserves this source behavior; no numerical correction
is authorized by this observation. SSE2 and long-double paths remain outside
this native observation profile.

## CALC-250: full-sheet area teardown stops before the last slot

Status: suspicious source condition; exact boundary retained locally.

The optimized whole-sheet branch in `sc/source/core/data/bcaslot.cxx`,
`ScBroadcastAreaSlotMachine::EndListeningArea`, sets `pStop = ppSlots + nEnd`
and iterates with `++pp < pStop`. With the inclusive final offset
`nEnd == mnBcaSlots - 1`, this visits offsets zero through `nEnd - 1`.
The general range branch uses `nOff <= nEnd` instead. The corresponding
optimized deletion/update branches use the same ending bound.

The default native logarithmic distribution has 172032 slots per sheet, so
the optimized end-listening traversal ends at offset 172030. The initialized
geometry witness in `sc/source/core/data/bcaslot.test.ts` retains that exact
bound. This is source-derived evidence, not a compiled full-native area
lifecycle observation. Whether higher-level invariants guarantee an empty
last slot in these calls has not been established. The local ordinary area
machine preserves the source ending bound.

## CALC-251: nested area iteration resets the erased-entry shortcut

Status: source-derived reentrant edge; intent not established.

Both `ScBroadcastAreaSlot::AreaBroadcast` overloads set
`mbHasErasedArea = false` when beginning an iteration, including a nested
iteration of the same slot. Entries already marked for deferred erasure are
skipped only when this shortcut is true. A nested iteration after the last
listeners have been removed can therefore visit those marked entries and
report a broadcast attempt through their empty Svt broadcasters. Physical
erasure still waits for the outer iteration to finish.

The reentrant case in `sc/source/core/data/bcaslot.test.ts` retains this
source behavior: the nested call returns true while no extra listener callback
runs. Full compiled native area-object observations are not claimed. The
local code keeps the original reset and deferred-erasure order.

## CALC-252: mixed encoded NaN error payloads vary between native builds

Status: original complete native header observations differ across normal
and ASan/UBSan builds; no sanitizer error was reported.

`sc/inc/arraysumfunctor.hxx` intentionally sends non-NoValue NaNs back through
compensated floating arithmetic when rescanning an array containing encoded
empty values. Its source comment already questions the intended error
propagation. Multiple distinct encoded NaN errors can then compete through
ordinary arithmetic. An observation with encoded NoValue, encoded
DivisionByZero and 42 produces different NaN payloads on the second mutating
Kahan getter between the normal and instrumented native callers.

Evidence is retained in the task73 numeric observation archive, including
`ambiguous-driver.cpp` and both `ambiguous-*-caller.values` streams. The caller
uses unchanged complete original `arraysumfunctor.hxx`/`kahan.hxx` and verified
original SAL objects. The accepted bit-exact array fixture separately uses
4096 finite/NoValue-empty and isolated infinity profiles with identical normal/instrumented output.
Mixed error-NaN payload attribution is not certified by that fixture.

The local implementation retains source arithmetic and rescan ordering.
Mutable local double references use Float64Array backing so JavaScript packed
number-array canonicalization does not erase the only encoded NoValue payload
before the native rescan can recognize it. This storage adaptation preserves
native scalar bits; it does not resolve the upstream mixed-payload ambiguity.


## CALC-253: AutoSum adjacency checks only the scan axis

Pinned source: `sc/source/core/tool/token.cxx`,
`ScTokenArray::GetAdjacentExtendOfOuterFuncRefs`.

The four directional branches compare only the referenced row or column with
its neighboring scan coordinate. They do not require the other coordinate or
sheet to match the formula position. For example, a formula at A4 containing
`SUM(B1:B3)` reports a top-adjacent reference with extent row0,despite referring
to column B. The AutoSum classification in `sc/source/ui/view/viewfun2.cxx`
consumes this outcome when deciding whether to sum existing aggregates.

This is a source-derived suspicion rather than a certified whole-application
failure. Preserve the original axis-only checks;adding a same-column/same-row
filter would change the upstream contract. The actual-token witness is in
`sc/source/ui/view/native-autosum.test.ts`.

## CALC-254: a table area retained in RPN can be skipped by both traversal paths

Pinned source: `sc/source/core/tool/token.cxx`, anonymous `TokenPointers`,
`ScTokenArray::AdjustReferenceOnCopy` and `ScTokenArray::AdjustAbsoluteRefs`.

When a source-order `ScTableRefToken` retains the very same area token that
also appears in RPN, that area has at least two native owning references.
`getHandledToken` therefore returns the table token instead of its area,
with a comment that the area is handled in RPN. However, `skipToken` skips
an RPN token whose reference count exceeds one. Under this ownership graph,
neither adjustment loop visits the area reference.

This is a conditional source-derived suspicion. It does not establish that
the compiler produces this graph for an ordinary table formula, nor that
the full application exposes a user-visible failure. Keep the original
skip/projection rules. The actual retained-area/RPN identity vector is in
`sc/source/core/tool/token-copy.test.ts`;it checks the skipped outcome rather
than silently changing traversal to visit the area.

## CALC-255: a fixed-end group listener can notify a nonoverlapping member

Pinned source: `sc/source/core/tool/grouparealistener.cxx`,
`FormulaGroupAreaListener::collectFormulaCells(SCROW,SCROW,...)`.

When the start row is relative and the end row is fixed, the method first
checks the changed span against the top member's range. Its subsequent loop
uses `nRefRow1 <= nRefRow2`, where the second value is the fixed reference end;
it does not stop at the changed span's last row.

For a valid three-cell group referencing row ranges [2,4], [3,4], [4,4],
a change confined to row3 selects all three formulas. The final member's
range does not overlap the changed row. This appears to cause excess dirty
notification rather than an incorrect value by itself. Preserve the original
loop bound;the actual grouped-cell/column witness is in
`sc/source/core/tool/group-area-listener.test.ts`. This is source-derived
evidence,not a whole-application native differential.

## CALC-256: direct area deletion can leave a pending grouped-area pointer

Pinned source: `sc/source/core/data/bcaslot.cxx`,
`ScBroadcastAreaSlot::DelBroadcastAreasInRange`, `EraseArea`,
and `ScBroadcastAreaSlotMachine::BulkBroadcastGroupAreas`.

When direct range deletion removes an area's last slot membership during a
bulk broadcast, `DelBroadcastAreasInRange` removes it from the ordinary
`aBulkBroadcastAreas` set and deletes it. It does not remove the area from
`m_BulkGroupAreas`. In contrast, the last-membership path in `EraseArea`
explicitly calls `RemoveBulkGroupArea`. If a grouped area was already queued
when direct deletion frees it, the grouped map may retain a dangling pointer
until its later flush.

This is a conditional ownership suspicion. No native use-after-free execution
or reachable whole-application failure has been established. Retain the
distinct source removal points. JavaScript GC replaces physical deletion;
do not manufacture native dangling-memory behavior or silently add the missing
group-map removal to the direct-deletion path.

## CALC-257: failed column cursor initialization remains cached

Reference: `sc/source/core/data/mtvelements.cxx`,
`ColumnBlockPositionSet::getBlockPosition`, pinned LibreOffice source
`9bc445578031fecf56086729d8e4940c77e14d65`.

The first lookup inserts a `ColumnBlockPosition` before calling
`InitColumnBlockPosition`. If initialization fails, the method returns null
without erasing the inserted entry. A second lookup for the same sheet and
column returns that retained entry directly, without another initialization.
Thus a missing-sheet lookup can return null first and an uninitialized cursor
on repetition.

This is a conditional caller-contract suspicion; no whole-application native
failure is established. Preserve insertion, lookup and failure ordering.
The source-bound context test observes the cached owner through public lookup
without consuming its uninitialized iterators. Managed allocation does not
simulate native allocator failure or physical mutex behavior.

## CALC-258: unspecified parameter classifications stop returning Value after slot six

Reference: `sc/source/core/tool/parclass.cxx`, the assumptions above `pRawData`
and `ScParameterClassification::GetParameterType`, pinned LibreOffice source
`9bc445578031fecf56086729d8e4940c77e14d65`.

The introductory comment says unspecified opcodes accept only Value parameters,
without a parameter-count check or Bounds result. The executable lookup instead
returns Value for the seven zero-initialized parameter slots, but Bounds for
indices seven and above when the opcode has no repeated-parameter definition.
For example, `ocAbs` is absent from the static table; its parameter six resolves
to Value and parameter seven resolves to Bounds. The return-type sentinel still
resolves to Value.

This is a source-comment/lookup-contract discrepancy, not an established valid
formula regression: ABS itself does not accept eight arguments. Preserve the
runtime lookup, including UInt16 narrowing and the distinct return sentinel.
Independent source vectors cover the boundary;no whole-native class execution
or user-visible LibreOffice failure is claimed.

## CALC-259: the first Ctrl-click includes the old active cell

Status: surprising behavior; explicitly described as an intentional upstream
workaround, not a confirmed defect.

Pinned `sc/source/ui/view/select.cxx`, `ScViewFunctionSet::SetCursorAtCell`,
lines 793–811, handles a Ctrl-click with no previous marks by initializing a
block at the old cursor before initializing the clicked cell. The source
comment labels this `#i3875# *Hack*` and explicitly requires both old and new
cells to be highlighted. Its same-cell case retains one marked cell.

Example: with A1 active and no marked range, Ctrl-click D4 selects A1 and D4;
it does not select D4 alone. The normal subsequent Ctrl-click branch can
subtract already marked cells through native negative block conversion.

Evidence: the pinned source and the actual owner vector in
[mouse-block.test.ts](../../apps/office/src/sc/source/ui/view/mouse-block.test.ts)
(`keeps original function-set anchors and the first-Ctrl-click old cursor
inclusion`). Full historical issue context and the upstream selection engine's
other modes have not been audited. Decision: preserve this branch and its
original defaults without replacing it with a browser-only selection rule.

## CALC-260: updated global names normalize the sheet only on insertion

Status: surprising contract asymmetry; not a confirmed upstream defect.

Pinned `sc/source/core/data/refupdatecontext.cxx`, lines 18–65,
`UpdatedRangeNames::setUpdatedName`, maps every sheet index below -1 to -1.
The three readers `isNameUpdated`, `getUpdatedNames` and `isEmpty` perform
literal key lookups without applying that normalization.

After `setUpdatedName(-8, 4)`, querying sheet -1 reports the updated name,
whereas querying sheet -8 reports absence. Callers must use the canonical
global-name index when reading. The local owner preserves the asymmetry;
it does not normalize every public method for convenience.

Evidence: the pinned methods and the actual value-owner scenario in
[clipboard-reference.test.ts](../../apps/office/src/sc/source/core/data/clipboard-reference.test.ts)
(`retains original sparse column output and insertion-only global-name normalization`).
No claim is made that a defined upstream caller passes a noncanonical index
to the readers. Decision: retain the original insertion and lookup behavior.

## CALC-261: filtered block copying adds the no-row sentinel to its count

Status: surprising helper contract; not a confirmed defect in a defined UI call.

Pinned `sc/source/core/data/FilterData.cxx`, `firstNonFilteredRow`, returns
`std::numeric_limits<SCROW>::max()` when no eligible row is found. Pinned
`sc/source/core/data/document.cxx`, `CopyNonFilteredFromClip`, lines 2893–2920,
adds the difference between that result and the old source row to its
filtered-row count before checking whether the result exceeds the source end.
It also publishes that sentinel through the source-row output.

For a source cursor of 1 and an entirely filtered range ending at row 5,
the helper returns 2147483646 and advances the cursor to 2147483647. It does
not return the five filtered rows in the requested interval. The enclosing
paste orchestration may prevent such calls; that reachability is not certified.

Evidence: the pinned methods and
[clipboard-block.test.ts](../../apps/office/src/sc/source/core/data/clipboard-block.test.ts)
(`retains signed SCROW-max sentinel and its original filtered-row count accumulation`).
Decision: preserve the original accumulator and output instead of clamping them.

## CALC-262: empty selected Undo initialization retains one null sheet slot

Status: surprising diagnostic fallback; not a confirmed defect in a defined UI call.

Pinned `sc/source/core/data/markdata.cxx`, `ScMarkData::GetLastSelected`,
lines 194–200, reports a diagnostic and returns 0 when no sheet is selected.
Pinned `sc/source/core/data/document.cxx`, `ScDocument::InitUndoSelected`,
lines 2076–2105, loops inclusively through that result and appends a null slot
for every unselected sheet. Thus an empty selection leaves the Undo document
with a table-vector size of 1 and `FetchTable(0) == nullptr`.

Evidence: the pinned methods and
[clipboard-undo-init.test.ts](../../apps/office/src/sc/source/core/data/clipboard-undo-init.test.ts)
(`replaces previous Undo content with exactly selected sparse sheets and independent option defaults`).
Whether ordinary upstream UI callers can supply an empty selection has not
been established. Decision: preserve the slot and original diagnostic fallback,
without replacing the result with an empty vector.
