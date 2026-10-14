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
