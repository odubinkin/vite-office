# Calc coordinate foundation

Calc implementation lives in `apps/office/src/sc`, independently of Writer.
The first core task is `202610090711-S6VCEJ`, on branch `calc`; branch integration
belongs to the user. Its baseline is LibreOffice commit
`9bc445578031fecf56086729d8e4940c77e14d65`. The ignored
`vendor/libreoffice-reference` symlink reads the existing reference in
`vite-office`; it does not change that checkout.

`sc/inc/types.ts` retains native coordinate type names. `sc/inc/address.ts`
owns sheet limits, sentinels, validity helpers and reference flags. The numerical
`ScAddress` and `ScRange` owners live in `sc/source/core/tool/address.ts` and are
exported through the header boundary. There are no browser models or Writer
dependencies in these owners.

The standard bounds are 1,048,576 rows, 16,384 columns and 10,000 sheets. Address
assignment narrows rows to signed 32 bits and columns/sheets to signed 16 bits.
The default address/range is zero; the invalid constructor sets every coordinate
to -1. `IsValid()` checks nonnegative coordinates only; `ValidAddress()` and
`ValidRange()` apply document row/column bounds and the global sheet bound.

Address-pair range construction independently orders all three axes. Numeric
six-coordinate construction and range copies preserve the supplied order.
Endpoints are independent value owners; assignment retains their identity.
Containment and intersection include both endpoints. Address ordering is
sheet, column, row; row-major import/export ordering is sheet, row, column.

`Move()` retains the original inclusive `GetTableCount()` boundary. It clamps
the actual address and returns false when movement exceeds any bound. Error
outputs retain the requested narrowed coordinates; an overflowing sheet error
is always `MAXTAB + 1`. Range movement processes both endpoints after a failure
and suppresses movement along an axis spanning the entire sheet.

Task `202610090725-D6Z7XD` adds the original sticky reference updates on the
same `ScRange` owner. `MoveSticky()` retains maximum end anchors only for
multi-coordinate ranges. When an endpoint first reaches a sheet maximum, it
can become sticky and its error output is corrected to that maximum. The
starting endpoint must still be valid; sheet overflow cannot become sticky.
`IncEndColSticky()` and `IncEndRowSticky()` narrow the addition before limiting
it and leave already sticky endpoints in place. Reversed and singleton ranges
use ordinary increments. Conditional insert/delete adjustments apply strictly
after the supplied boundary and independently limit both endpoint offsets.

`scripts/calc-address-native-probe.mjs` extracts the original inline numerical
constructors and nine complete movement/update definitions without editing their
bodies. A small C++ shell supplies native integer types and the three document
bounds getters. The compiled probe runs 768 sticky movement states with
ASan/UBSan and records every result and error endpoint in a committed fixture.
Calc tests compare all of these outputs; ordinary tests need neither the native
compiler nor an upstream checkout. `node scripts/calc-address-native-probe.mjs
--check` optionally regenerates and verifies the fixture, including full-source
and extracted-body SHA-256 hashes. This proves those numeric movement states,
not full ScDocument integration, the other compiled but unexecuted update
methods, undefined signed arithmetic domains or whole Calc parity.

## Reference address and sheet limits

Task `202610090749-C6C6AB` adds `ScRefAddress` at its original `sc/inc/address`
boundary. Its default coordinates are zero and all three relative flags are
false. Numeric construction retains signed coordinate widths. Copies own an
independent address; assignment and both `Set()` overloads retain the receiving
address identity. The flags are independent of coordinates. Equality compares
the address and each flag; `GetAddress()` returns the stable owner corresponding
to the native const reference. C++ const-method enforcement is not represented
by JavaScript object references. Formatting is pending the real document and
address-convention owners; there is no replacement formatter.

`sc/inc/sheetlimits.ts` owns immutable explicit `ScSheetLimits` maxima and delegates
the existing numerical helpers. Row/column checks use those maxima, while sheet
checks use the global `MAXTAB`. Ranges are checked without sorting or changing
endpoints. Counts add one with native return widths. `MaxColAsString()` retains
the original standard/jumbo constant choice, including for custom maxima.
JavaScript references preserve the object lifetime independently of a document;
no native reference-count shim is introduced. `CreateDefault()` remains absent
until the real `ScModule` and jumbo-default options from `documen2.cxx` exist.
Source-derived header tests do not establish compiled differential parity or the
full formula/selection behavior of upstream consumer tests linked in inventory.

## Single formula reference data

Task `202610090758-MBH4QY` ports initialized `ScSingleRefData` through its original
`sc/inc/refdata` boundary and `sc/source/core/tool/refdata` implementation. Storage
has no fabricated zero defaults: callers must initialize flags and coordinates as
required by upstream's raw token union. Native implicit copies are represented by
explicit copying/assignment of all raw fields. The eight flag bits retain their
original relative/deleted column, row and sheet order, followed by 3D and relative
name markers. Deleted getters return -1; raw equality retains hidden coordinates.

Relative column/row validity uses signed document maxima, relative sheet validity
uses the global signed `MAXTAB` domain, and absolute sheet validity excludes the
document's table count. `ValidExternal()` ignores deleted flags and accepts raw
sheet -1 for the external cache. `toAbs()` ignores deletion, narrows resolved
coordinates, checks axes independently and applies global sheet bounds.
`SetAddress()` updates raw offsets and adds invalid-axis deletion flags without
clearing old deletion. `PutInOrder()` retains the original per-axis operations,
transferring relative/deleted axis flags and relative-name provenance while
retaining each endpoint's 3D flag.

The structural document view adds only `GetSheetLimits()` to the existing movement
getter boundary; it does not replace `ScDocument`. The native probe compiles all
30 unchanged non-debug single-reference definitions and original inline value
owners with four document getters. Portable acceptance compares 2048 flag/domain
states, 1024 updates, 2048 reorderings, 40 initializers, 12 mutation snapshots and
five equality outputs. `node scripts/calc-refdata-native-probe.mjs --check`
reproduces the fixture under ASan/UBSan and checks exact pinned Git blobs plus
source/extracted SHA-256 hashes. Debug-only dumping, undefined/uninitialized
domains, token storage and complete document/compiler/listener ownership
remain subsequent work; module and whole Calc parity stay
unverified. The upstream `testFormulaRefData` initial single-reference assertions
are retained; its complex extension assertions are retained by the owner below.

## Complex formula reference data

Task `202610090816-5YGKY3` adds `ScComplexRefData` beside the original single
reference owner. Its two endpoints retain their identity through assignment and
initialization. The independent trim flag defaults to false, survives initializers
and is omitted from equality. `toAbs()` constructs an address-pair `ScRange`, so
it independently orders resolved axes even when raw endpoints are reversed.
External validity compares masked sheet getters and accepts the first endpoint's
external cache domain; it does not impose a second local sheet-validity check.

`Extend()` retains the original single/complex overloads and their relative,
3D and relative-name inheritance, including references to its own endpoints or
itself. `SetRange()` delegates monotone deletion to existing single references.
Whole-row/column detection requires absolute axis flags. The complex sticky
methods use masked endpoint getters and resolve relative offsets against the
formula position before signed narrowing. They belong to the reference owner
and have distinct contracts from the numerical `ScRange` updates.

The same test comparison probe compiles the original complex class, all 14
unchanged non-debug definitions and original range constructors/order. The saved
fixture covers 3072 property/ordering states, 6400 single extensions, 1600 complex
extensions, 300 aliased extensions, 1792 sticky updates, 256 mixed-address
initializers, 36 range/flag initializers and four equality outputs. Portable tests
compare every output and retain both original complex extension assertions from
`testFormulaRefData`. `node scripts/calc-refdata-native-probe.mjs --complex-check`
reproduces those states with ASan/UBSan and pinned full-source/extracted-body
hashes. The existing single-reference body and fixture remain unchanged.

The combined implementation retains both classes in the original `refdata`
module. Its grouping was reviewed against the upstream owner boundary; splitting
these owners would move native responsibilities without improving that boundary.
No production C++ or generated application code is introduced. Native comparison
runs are optional during ordinary portable tests. Full document, raw token,
compiler and listener integration, debug-only dumping and undefined native domains
remain unverified.

## Numerical range lists

Task `202610090833-ERVAK2` ports numerical `ScRangeList` through its original
`sc/inc/rangelst` header and `sc/source/core/tool/rangelst` source boundary.
It reuses `ScAddress` and `ScRange`. Appending and copying own independent values;
accessors and iteration borrow mutable values. Equality compares vector order.
`Find()` returns the first enclosing range, and `Contains()` tests one enclosing
range rather than the union of the list. Empty combined bounds and corners are
zero. Cell counting adds each range independently, including overlapping entries,
and uses exact unsigned 64-bit modular accumulation through `bigint`.

`Join()` retains matching-axis adjacency, containment, source ownership and
restart order. The append cache starts at -1; appending raises it, while removal,
direct vector insertion and borrowed mutation do not recalculate it. `RemoveAll()`
resets it, and copy/swap retain it. Partial combining scans backward only while
start rows lie within the original two-row window. Insertion retains the native
OR overlap predicates and defers joining constructed ranges. Deletion removes
contained entries first, then applies the original one/two/three/four-fragment
helpers and ordered deferred joins. The original top-edge one-fragment trim uses
the deleting start row plus one. The upstream equal-sheet deletion assumption and
existing multitab behavior are retained; no general 3D subtraction is invented.

Four redundant native guard paths cannot be false after their preceding numeric
conditions: the two trailing one-fragment conditions, the encountered Join source
index comparison, and the final interior-fragment guard. TS expresses those
implications directly, with proof comments; native source bodies remain unchanged
in the comparison probe. This preserves defined native outcomes and enables real
100% branch coverage without exclusions or fabricated non-native input values.
The coherent range-list owner and original anonymous helper grouping remain in
one source file after reviewing its 500-line decomposition threshold.

`scripts/calc-rangelst-native-probe.mjs` compiles the original class, complete
selected numerical definition/helper intervals and native inline address/range
bodies under ASan/UBSan. Its 13,432 sequences compare public outcomes after every
operation, including ordered fragments, cache-sensitive follow-ups, counts,
bounds, corners, lookup and intersections. Literal numerical examples from
`ucalc_rangelst.cxx` retain original coordinates and cell assertions. Run
`node scripts/calc-rangelst-native-probe.mjs --check` to reproduce the committed
fixture and exact pinned source/body hashes; ordinary tests remain portable.

Document/compiler-dependent parsing and formatting, pair-list name sorting,
native pointer/iterator/refcount/move lifetime and undefined arithmetic
remain pending. `SCSIZE` stays at the original address header and represents
counts/indices within JavaScript exact integer inputs; full pointer-width input
arithmetic is unverified. Neither these finite native outputs nor local coverage
establish whole Calc parity.

## Big address and range coordinates

Task `202610090858-QP6EMJ` ports `ScBigAddress` and `ScBigRange` from
`sc/inc/bigrange.hxx` and `sc/source/core/data/bigrange.cxx`. The header boundary
re-exports the coherent core/data owner, including the original inline methods
and out-of-line validity definition. Exact `bigint` values retain signed64
coordinates, including both extrema and values above the JavaScript integer
precision limit. Defaults are zero; increments default to one. Copies own
independent values, assignment retains endpoint identities and getters retain
raw values. No document, ordinary-coordinate or shared owner is duplicated.

`IsValid()` accepts either signed64 extreme independently on each axis; ordinary
values use document column/row maxima and an exclusive table-count boundary.
`MakeAddress()` clips negative values to zero, columns/rows to document maxima
and sheets to global `MAXTAB`. Raw range construction preserves reversed
endpoints. `MakeRange()` delegates the existing address-pair constructor and
therefore sorts the clipped axes without mutating big values. Containment and
intersection use the original inclusive raw comparisons; equality retains order.

`scripts/calc-bigrange-native-probe.mjs` compiles the unchanged complete original
big classes and validity body with native ordinary constructors/order under
ASan/UBSan. The decimal-string fixture preserves exact values and records 6552
address states, 3468 range relation states, eight address and five range mutation
snapshots, ordinary conversion and eight equality outcomes. Portable tests compare
every saved output. Run `node scripts/calc-bigrange-native-probe.mjs --check` to
reproduce it with exact pinned Git blobs and full-source/extracted-body hashes.
The compiler and upstream checkout are unnecessary for ordinary tests.

The native document shell supplies only the existing three bounds getters for
comparison; production uses the existing structural getter view. Full document,
change-tracking and reference-update integration and native pointer/move lifetime
remain pending. Signed64 overflow is undefined in native C++; fixtures use defined
arithmetic and do not establish behavior outside that domain. Inventory retains
unverified semantic parity, independently of 100% local coverage.

## Reference transpose and growth

Task `202610090915-GRTK08` ports `ScRefUpdateRes` at the original
`sc/source/core/inc/refupdat` boundary and three static operations at
`sc/source/core/tool/refupdat`. Existing `ScAddress`, `ScRange` and document
getters are reused. `DoTranspose()` retains signed16 column/sheet temporaries,
signed32 row/SCCOLROW arithmetic and repeated sheet wrapping with positive
table counts. Output tuples represent native mutable coordinate references.

`UpdateTranspose()` affects only references wholly contained by the source.
Both transformed endpoints are calculated before assignment, preserving native
alias behavior and receiving endpoint identity. A contained reference returns
`UR_UPDATED` even when the coordinates remain equal. `UpdateGrow()` calculates
both predicates before mutation, permits a one-row header offset and assigns
native-width endpoints without document clipping. Source/ref and destination/
endpoint aliases retain the original outcomes. The all-static class remains the
original public owner; its targeted lint annotation does not change behavior.

The native probe compiles the complete unchanged three-method interval and
original header, constructors, ordering and containment under ASan/UBSan.
Portable tests compare all 20203 initialized growth/transpose/alias outcomes
and retain independent literal contracts. Reproduce it with
`node scripts/calc-refupdat-native-probe.mjs --check`, which checks pinned Git
blobs and full-source/extracted SHA256 hashes. Ordinary tests need no compiler
or upstream checkout. Full
consumer integration, native debug checks and undefined arithmetic remain
pending; no replacement methods or fake document owners are introduced.

## Relative reference wrapping

Task `202610091325-52SMH5` resumes the core after Writer merge and TS7/Istanbul
migration. `ScRefUpdate.MoveRelWrap()` reuses existing complex references,
addresses, range ordering and sheet limits. It resolves and sorts the absolute
range first, wraps each relative endpoint axis exactly once at its supplied
column/row mask or document table-count-minus-one sheet mask, sorts the result
again and writes it back through `SetRange()`. This is not modulo: a coordinate
can remain above a small wrap mask after the single subtraction. Absolute axes
are not wrapped; endpoint flags are not exchanged by numerical range sorting.
Deleted raw values, monotone deletion flags, trim state and endpoint identity
remain owned by the existing reference data.

`scripts/calc-refwrap-native-probe.mjs` compiles the unchanged original helper,
complete `MoveRelWrap` body and complete numerical single/complex reference owners
with original address/range bodies. Its 15,616 initialized states compare mixed
relative flags, invalid sentinels, custom limits and distinct wrap masks, positive
table counts, sorted raw outputs and retained flags. ASan/UBSan checks remain
enabled; `NDEBUG` selects release semantics because native debug validity checks
restrict sheet maxima to standard/jumbo constants. Debug assertion enforcement,
undefined arithmetic and full compiler/token/named-range consumers remain
unverified. Run `node scripts/calc-refwrap-native-probe.mjs --check` for exact
pinned blob/body hash and fixture reproduction. Ordinary TS tests need neither
upstream nor C++; format generated JSON with repository Prettier after `--write`.

All 52 Calc tests pass with actual100 Istanbul coverage. This is task 1 of the
next ten-task interval; the user explicitly resumed the paused goal after merging
Writer, TS7 and Istanbul. Full-suite validation is due at task 10 of this interval.

## Ordinary coordinate reference updates

Task `202610091335-767ATZ` adds original `UpdateRefMode` at `sc/inc/global` and
the ordinary `ScRefUpdate.Update()` scalar parameter contract. Its output tuple
contains the original result followed by six native mutable-reference coordinates.
The document getter view adds only `IsExpandRefs()`; the caller supplies the real
policy and no replacement document or default setting is introduced.

Insertion/deletion processes columns, rows then sheets with each subsequent
predicate using the coordinates already updated. Reference expansion retains
the before-movement test and after-movement endpoint adjustment. Start and end
deletion shrinking differ by one coordinate; sheets disable shrinking and adjust
their inclusive maximum to the new table count. Clipping, collapsed ends,
whole-axis and end-only sticky restoration preserve native result replacement
order. Movement tests containment in destination minus displacement. Reordering
affects sheets and intervening sheets only. Copy leaves raw coordinates untouched.

Native template destination casts and compound assignments use explicit signed16
column/sheet and signed32 row narrowing. Two secondary moved-range guards in
`lcl_MoveReorder` cannot execute after the initial moved-range return; TS states
the remaining native outcomes directly with proof comments. The original C++
helper bodies remain unchanged in the comparison probe.

`scripts/calc-refupdate-native-probe.mjs` compiles complete original helper,
expansion and ordinary Update intervals with exact pinned Git blobs and SHA256
hashes under ASan/UBSan. All 32,704 saved native outcomes compare raw coordinates
and result codes across both expansion policies, clipping, sticky references,
mixed axes, source containment, reversed raw ranges and sheet reorder directions.
Run `node scripts/calc-refupdate-native-probe.mjs --check` to reproduce them;
ordinary tests use the saved fixture. Full document/range-list/compiler consumers,
native aliased scalar output storage, debug checks
and undefined arithmetic remain unverified. Inventory retains unverified semantic
parity. All 57 Calc tests retain actual100 Istanbul coverage. This is task 2 of
the resumed ten-task interval; the next full suite is due at task 10.

## Signed64 big-range reference updates

Task `202610091348-5TZGNC` adds the original big-range `ScRefUpdate.Update`
overload at the same public owner. Native overload dispatch uses distinct first
arguments; the ordinary scalar signature and its output tuple remain unchanged.
The last TS overload retains existing ordinary `Parameters` inference. The big
overload narrows displacements to native signed32, reuses existing `ScBigRange`
and `ScBigAddress` values and preserves receiving endpoint identity.

Source and reference coordinates are snapshotted before insertion, including when
both arguments are the same range. Sequential axis predicates use updated reference
coordinates and the original source snapshot. No document bound clips these values.
Each exact signed64 min/max endpoint pair protects its whole axis. Positive insertion
overflow saturates to signed64 maximum; the saturation result remains UPDATED even
when the numerical value was already maximum. Defined negative insertion and movement
use unclipped exact arithmetic. Copy and reorder are untouched by this overload.

The original Move helper checks overflow and then performs signed64 `+=` anyway.
A true cut flag therefore implies undefined arithmetic in that original branch.
For every defined Move input both cut flags are false; TS states this remainder
directly with proof comments, retains the original pre-addition helper flag and
uses the original final range comparison for UPDATED. No wrapping policy, exception
or coverage exclusion is invented for native undefined inputs. Unchanged original
C++ helper/body intervals remain in the sanitizer comparison.

`scripts/calc-bigrefupdate-native-probe.mjs` compiles complete original big classes,
helpers and the Update overload with original numerical coordinate dependencies.
All 19,390 initialized defined outcomes compare exact decimal-string values,
results and source/reference aliases under ASan/UBSan. Cases include signed32
displacement extrema, signed64 sentinel/extreme coordinates, guarded saturation,
mixed axes and values beyond JavaScript Number precision. Conservative arithmetic
admission excludes possible unguarded signed64 overflow; protected whole axes are
retained. Exact pinned blobs and full/extracted SHA256 hashes are checked by
`node scripts/calc-bigrefupdate-native-probe.mjs --check`. Ordinary tests remain
independent of the compiler and upstream checkout. Native undefined/uninitialized
domains, debug checks and full document/compiler/change-tracking consumers remain
unverified; finite numerical fixtures do not establish whole Calc parity.

All 62 Calc tests retain actual100 Istanbul coverage. This is task 3 of the resumed
interval; full validation remains due at task 10.

JavaScript tuples represent native output reference parameters. Equality and
ordering methods represent C++ operators. Undefined native uninitialized
constructors, pointer layout, `size_t` hashing and native debug assertions are
not represented. Reference parsing/formatting, external links and subtraction
remain subsequent tasks. The registry records the
implemented foundation with semantic parity unverified; 100% local coverage
does not establish whole Calc or whole upstream API parity.

Common `svl`, `editeng`, `sfx2`, `framework`, `package`, `sax`, `xmloff`, `svx`
and `vcl` owners will be reused for Calc as needed. Shared changes require tests
of the affected shared module and its Writer/Calc consumers. Calc-specific
document, table, column, cell and formula ownership stays in `sc`. Shared
notification, undo, item pooling, document shell and ODF package mechanisms
must not be copied into the Calc tree.

The intentional browser I/O and recovery decisions in
[document-lifecycle.md](document-lifecycle.md) and
[autosave-recovery.md](autosave-recovery.md) also apply to Calc. ODS-specific
filters and storage adapters will use these shared shell contracts; no recovery
workflow is introduced.

Run `npm run test:coverage:calc`, `npm run typecheck`,
`npm run check:dependencies` and `npm run inventory:parity:calc` for the foundation.
All four real Istanbul coverage metrics must be 100%. Full-suite scheduling starts
with Calc task 1 of 10 here; run the full suite after task 10, then repeat each
ten completed Calc agentplane tasks. Targeted affected-module tests run on
intervening tasks. Writer acceptance files and coverage settings remain intact.
The coordinate foundation and sticky reference tasks are Calc tasks 1 and 2;
inventory reconciliation is task 3, reference addresses/sheet limits are task 4,
single formula references are task 5, and complex formula references are task 6
of that first ten-task interval. Numerical range lists are task 7 and big
address/range coordinates are task 8. Reference transpose/growth is task 9;
full-suite verification is task 10. That run is recorded in
[calc-full-test-cycle-1.md](calc-full-test-cycle-1.md): 14,097 office tests,
122 inventory tests and 303 browser scenarios pass. Calc and inventory retain
actual100 coverage. The user explicitly left one uncovered Writer painting
branch for another branch, and requested goal pause after the complete run.
The user resumed the goal after merging Writer, TS7 and Istanbul. Relative wrapping
and ordinary/big reference updating are tasks 1, 2 and 3 of the next interval;
range-list reference updating is task 4 and paired range owners are task 5.
The full cycle is due at task 10.

Source research includes the per-file MPL 2.0 and inherited Apache notices in
`sc/inc/address.hxx`, `sc/inc/sheetlimits.hxx`, `sc/inc/refdata.hxx`,
`sc/source/core/tool/refdata.cxx`, `sc/inc/rangelst.hxx`,
`sc/source/core/tool/rangelst.cxx`, `sc/inc/bigrange.hxx` and
`sc/source/core/tool/address.cxx`, `sc/source/core/inc/refupdat.hxx` and
`sc/source/core/tool/refupdat.cxx`, and MPL 2.0 in
`sc/source/core/data/bigrange.cxx` and
`sc/inc/types.hxx`. The TypeScript implementation is independently authored
from those numerical contracts; the original sources remain research-only.

## Range-list reference updates

Task `202610091404-4QBVYR` connects `ScRangeList::UpdateReference` to the existing
ordinary `ScRefUpdate::Update` owner. The native public signature and source
boundary remain intact; the structural document getter contract is reused.
Pre-deletion applies only to a single-sheet affected area. Column deletion runs
first, then row deletion overwrites its change result when both deltas are
negative. Complete deletion returns true; an initially empty list returns false.

Every surviving ordered range delegates the original scalar update. All results
other than `UR_NOTHING`, including sticky unchanged coordinates, set the changed
flag and assign the existing endpoints. The maximum-row cache only rises.
Negative row/column insertion mode then joins backward using borrowed entries,
repairing the index after multiple merges. Those joins do not independently set
the change result. No native diagnostic-only logging shim is added to production.

The dedicated native comparison compiles unchanged range-list class/helper/body
intervals, the complete ordinary update helpers/body and existing inline address
owners. Seven pinned Git blobs and extracted source hashes are checked under
ASan/UBSan. Its 14,938 initialized cases compare change results, ordered raw
ranges, unsigned64 counts and subsequent cache-sensitive joins over all four
modes, axes, expansion settings, native parameter widths and same/multiple tabs.
Original `ucalc_rangelst` deletion tests retain their literal cell assertions.
Run `node scripts/calc-rangelist-update-native-probe.mjs --check`; ordinary tests
consume portable JSON and need neither upstream nor a compiler.

The existing coherent range-list source grouping was reviewed again after adding
this upstream method; its class and anonymous helpers remain together, below the
1000-line hard budget. Existing geometry fixtures/tests and shared/Writer sources
remain unchanged. Undefined arithmetic and borrowed where references invalidated
by native vector deletion remain outside certification. Full ScDocument,
compiler, parsing/formatting, listeners and browser consumers remain subsequent
work, so inventory semantic parity remains unverified. This is the fourth
completed task of the resumed ten-task interval; full validation is due at task10.


## Paired label and data ranges

Task `202610091416-KMHKFV` adds original inline `ScRangePair` to `sc/inc/address`
and `ScRangePairList` to its existing `sc/inc/rangelst`/`sc/source/core/tool/rangelst`
boundary. These values back original document column/row name ranges, compiler
label references and the label-range dialog. Two-range and copy construction own
independent ranges; there is no pair default constructor. Assignment retains the
receiving ranges/endpoints, and `GetRange` applies unsigned16 index conversion.

Pair lists start empty. Implicit value copies/assignment, `Append` and `Clone`
copy both ranges; access and lookup borrow current entries. Address lookup checks
label containment, while range lookup requires exact label equality. Data ranges
do not participate in lookup. Pair removal compares object identity. Sheet
deletion requires both label endpoints on that sheet, regardless of data sheets.
Reference updates snapshot the affected area and delegate both ranges to the
existing ordinary `ScRefUpdate`; they do not pre-delete or merge pairs.

`Join` retains equal-data containment and simultaneous label/data merge
predicates. Its right-column predicate compares the receiving data end with the
input data **end minus one**, unlike its label start predicate. Consequently it
can merge overlapping data ranges while rejecting ordinary parallel adjacency;
this upstream asymmetry is retained literally. Borrowed-source removal and
restart order remain original. An already encountered source is strictly before
the joined entry in the ascending scan, so the guaranteed native index decrement
is expressed directly with proof. No coverage exclusions are introduced.

The dedicated comparison compiles unchanged original pair/list classes, complete
numerical pair-list definitions and Join, native inline range owners and ordinary
reference-update helpers. Its 14,284 initialized sequences compare ordered values
and both lookup identities after every operation, including source aliases,
implicit copies, release identity no-ops, unsigned16 indices and parameter
widths. Pinned source and extracted hashes cover seven original blobs; ASan/UBSan
remain enabled. `NDEBUG` explicitly selects upstream release behavior: original
Join diagnoses a later-source removal path with an unconditional assertion even
after finding its source. Debug assertion enforcement remains unverified. Run
`node scripts/calc-rangepair-native-probe.mjs --check`; ordinary portable tests
require neither upstream nor a compiler.

The coherent original range-list/pair-list class and helper grouping was reviewed
again and stays below the 1000-line hard budget. `CreateNameSortedArray` and the
original name comparator remain pending actual document sheet-name and shared
collator owners; no replacement sorting policy is supplied. Complete document,
compiler, UNO and dialog integration, native vector allocation/refcount/pointer
lifetimes and undefined arithmetic remain uncertified. Existing range-list and
reference-update fixtures/tests and shared/Writer source remain unchanged.
Inventory stays semantically unverified. This is task5 of the resumed interval;
full verification remains due at task10.

Suspicious source conditions observed during these ports are tracked separately
in [upstream-suspected-issues.md](upstream-suspected-issues.md). Recording them
does not authorize changing upstream behavior; the user explicitly reaffirmed
that preservation requirement.
