# Calc coordinate foundation

## Shared container utilities and traits

Task `202610092012-8RZCZ1` ports original mdds `util.hpp`: empty events,
lu16/default execution/empty dispatcher traits, clone tag type witness,
optional trace depth scope and logical position utilities. Standard traits
register the existing twelve shared block owners. Actual delayed iterators
provide original forward/reverse random-access distance without another store.

Input-end calculation preserves empty-before-bound and UInt64 wrap before
comparison; bigint is exact, number projections require exact bounded indices.
Position movement copies the borrowed iterator/offset pair and follows original
signed32 casts and forward/back block traversal. Trace cleanup pairs one
construction/disposal in finally to adapt original RAII exception unwind;
absent trace is a sink and nested callbacks are suppressed. Compile-time empty
policy/clone types are explicit identity witnesses, not scheduler behavior.

Native comparisons use unchanged real soa containers and iterators. Portable
TS tests borrow complete original node projections only as generic iterator
syntax; no TS soa container is certified or synthesized. Full types_util
compile traits, call-site tracing macros, alternate size/iterator categories,
native reference/const/allocator/destructor ABI and actual MTV/Calc document/UI
remain subsequent real dependencies. CALC-023 records the original arithmetic
preconditions without adding a bounds/overflow repair.

## Shared block dispatch and scalar callbacks

Task `202610091956-H5APAX` ports original `block_funcs.hpp` static dispatch
and the scalar `MDDS_MTV_DEFINE_ELEMENT_CALLBACKS` owner, with all twelve
standard value registrations. Per-method maps retain native discriminator
selection, both erase overloads, null deletion and unequal-ID early false.
Unknown-handler diagnostics and matching-type swap assertions remain.
Explicit type witnesses replace native ADL/overload selection; JS number
values never select float/double/integer type IDs heuristically.

All operations reuse actual shared scalar owners and their delayed store.
Unchanged genuine headers compare 3616 sequences/26990 complete steps/2182
full snapshots, including scalar callback IDs/defaults and dispatcher
mutations, plus all17 unknown-handler method calls and empty specialization.
Scalar output references and single-scalar forwarding have explicit TS
adapters. Pointer callbacks, managed values, nonprimitive variadic
constructors, native reference/allocator/destructor semantics,
util/default traits/trace/complete MTV and Calc document/UI remain unverified.
Unknown non-null deletion still throws as original; CALC-022 records its
upstream destructor TODO without a behavior repair.

## Shared scalar element blocks

Task `202610091926-N4ZGYX` adds original mdds `types.hpp` unmanaged
element/copyable/default block owners and all twelve standard scalar aliases,
plus their real shared `global.hpp` runtime exception parent. All operations
reuse the existing `delayed_delete_vector`; standard double and uint16 blocks
are the original aliases required by Calc `mtvelements.hxx`.

Template specialization becomes an explicit TS class factory carrying the
native type ID, T{}, conversion and optional original debug build witness
(default false). Scalar/reference and const qualification use explicit borrowed
store/iterator adapters. All primitive static operations, copy/clone, live ranges,
forward pairwise swaps and original reserve/source-iterator order remain.
Resize compares against integer `capacity / 2`. Unmanaged overwrite and
production print remain no-ops. The coherent types header remains one owner
above the 500-line review target and below the 1000-line hard limit; it does
not duplicate the separately owned native store or arbitrary module fragments.

Genuine unchanged native headers compare 3616 sequences with 26990 complete
two-owner step records and 2182 losslessly interned snapshots. Nine scalar
families also compare original mixed double InputIt conversion. Original bool
`at` diagnostics are isolated and recorded as CALC-021 without assigning a
successful native result. Native bool data, mixed bigint source conversions,
alternate StoreT/allocators, object lifetimes/exception guarantees, invalidated
source iterators, managed/noncopyable/clone_value owners, callback macros,
dispatcher/default traits, complete multi_type_vector and Calc columns remain
unverified. Those are actual following dependencies, not placeholder engines.

## Shared delayed element storage

Task `202610091909-KYNP7H` adds the original mdds3.2.1
`multi_type_vector/delayed_delete_vector` owner under
`apps/office/src/external/mdds/include/mdds`, shared by application consumers.
This is the default backing store in original mdds element blocks referenced
by `sc/inc/mtvelements.hxx`; complete element blocks, multi_type_vector and
Calc columns remain the next dependencies, not implemented by this task.

Single erase at logical begin delays physical removal. Range erase keeps its
distinct original behavior. Reserve, resize, shrink and assign clear hidden
entries in the original call order. Copy retains hidden entries and offset;
swap exchanges the backing vector but leaves both offsets unchanged. Borrowed
iterator positions follow the actual backing vector through defined swap.
The suspicious offset behavior is recorded as CALC-020 without repair.

Required scalar T{} witnesses replace erased template syntax; initialized
number, boolean, bigint and string families are supported. Native capacity
observations use the host libc++ target and allocated backing slots, including
its vector<bool> word capacity and distinct resize growth. Other allocator/STL
families, object destruction and exceptions, invalidated iterator lifetime,
native bool data pointers, full element-store and module parity remain
unverified. Ordinary tests replay complete portable native results without
upstream files, network or a compiler.

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

## Compressed selected-row arrays

Task `202610091459-8FSH81` adds original `ScMarkEntry`, `ScMarkArray` and
`ScMarkArrayIter` at the `sc/inc/markarr`/`sc/source/core/data/markarr` boundary.
The array retains the real immutable `ScSheetLimits` reference. It starts with
one unmarked terminal boundary; entries describe inclusive intervals from the
previous boundary plus one. Entry rows retain the original signed30 bitfield,
including narrowing before Shift clipping. No document or shared string stand-in
is introduced while building the document prerequisites.

Binary Search keeps the original negative-row first-interval result and resets
its output index to zero on failure. Marking retains the complete native
split/shrink/combine algorithm. Two unreachable insertion guards are expressed
directly with invariant proofs; the native probe retains them unchanged. `Set`
takes initialized entries without normalization. Equality compares only entries;
copy/assignment owns independent values and assignment keeps receiving limits.
Explicit `move`/`moveAssign` adapts native move-overload syntax. Moved-vector states
compare the probe's native standard library; unspecified C++ moved-from states
are not a guarantee across standard libraries.

Navigation, single-interval detection and iterator outputs preserve caller
reference values on failure. The iterator borrows the array and reads its current
entries after mutation/reset. Module-private storage allows the original array
and iterator friend access without exposing a new public vector getter.
`Shift` modifies each eligible boundary separately, applying signed64 offset and
signed30 assignment before clipping, without coalescing collapsed boundaries.
One native case yields a selected interval `[1,0]`; it is recorded as CALC-007 in
the suspicious-case journal and deliberately retained.

`scripts/calc-markarr-native-probe.mjs` compiles complete unchanged original
classes and every out-of-line definition with native integer types and the three
needed sheet-limits fields/getters. Six original pinned blobs and complete group
hashes are checked under ASan/UBSan. All 2814 initialized sequences compare
stored vector equality, marking, lookup, navigation, single marks, both owner
states and repeated/reset iterator outputs. Original `mark_test.cxx` Search
assertions retain literal standard-bound expectations. Run the probe with
`--check` to reproduce the committed fixture; normal tests require neither
upstream nor a compiler. Native debug assertions remain enabled in these defined
cases.

Full multi-selection/document/column/UI consumers, native allocation/capacity
and pointer lifetimes, uninitialized entries, empty Search, malformed unsafe
mutation and undefined signed64 overflow remain uncertified. No coverage
exclusions or replacement normalization are added; inventory semantic parity
remains unverified. All 77 Calc tests retain actual100 Istanbul coverage. This is
task6 of the resumed interval; full-suite validation remains due at task10.

Source research also includes MPL 2.0 and inherited Apache notices in
`sc/inc/markarr.hxx` and `sc/source/core/data/markarr.cxx`, and MPL 2.0 in
`include/tools/long.hxx`. The TypeScript code is independently authored from
these contracts; native originals remain read-only research input.

## Shared external mdds segment storage

Task7 implements `external/mdds/include/mdds/{node,ref_pair,flat_segment_tree_itr,flat_segment_tree}.ts`
as shared owners. `ScFlatBoolRowSegments` and `ScMultiSel` need this actual
dependency before their wrappers can be ported. No Writer storage copy or
replacement interval union is introduced. The module graph allows `sc -> external`
and forbids external dependencies on application/browser owners.

The original linked leaf boundaries represent half-open intervals. The terminal
leaf stores `value_type{}` independently of the tree's initial value. Insertion
coalesces leaves and returns the original start iterator/change flag. Searches
preserve failed output parameters. The search index is a separate exact-size
non-leaf pool, constructed by original bottom-up adjacent pairing; searching
never builds it implicitly. Copy constructs leaves without an index, move
transfers ownership, and original shifts retain their ordering/default-tail
behavior. Forward/reverse iterator types are distinct; `ref_pair` borrows live
key/value fields, while segment iterators cache values on movement and preserve
the original end/copy/assignment cache distinctions.

The source-only LibreOffice checkout does not include unpacked external headers.
Its pinned `download.lst` specifies `mdds-3.2.1.tar.xz` with SHA256
`673f5bb94612dbba581fc92b99b5e5dd1a53e29496a5dbc936432f6b0687c112`, and
`boost_1_91_0.tar.xz` with SHA256
`2f975c10da79511c2f218189fc8a12eef1a92e3bd18206e9841d406296d065eb`.
For optional native research, obtain these exact archives from the LibreOffice
`Makefile.fetch` source prefix `https://dev-www.libreoffice.org/src/`, verify
their hashes, and extract under ignored `output/playwright/mdds-native`.
Extract genuine Boost headers, apply the exact pinned
`external/mdds/gcc-12-silence-use-after-free.patch.1` with `patch -p1` to mdds,
then link ignored `vendor/mdds-reference` to that unpacked mdds directory.
Network source reads require the existing explicit authorization. Ordinary
tests do not fetch anything, require that link, or invoke a native compiler.

`scripts/mdds-flat-segment-native-probe.mjs --check` reproduces the portable
fixture. It checks pinned LibreOffice blobs, both archives, the original patch,
and every actual mdds/Boost compiler header against freshly extracted verified
archives. Genuine unchanged headers compile with debug assertions and ASan/UBSan.
All 3020 initialized sequences compare 16,256 command steps and both full owner
observations; 490 distinct complete snapshots are shared by index without
removing observations. Numeric
and boolean specializations, clipping/rejection, all search families and hints,
copy/move/self-assignment, clear, interval shifts, forward/reverse boundaries,
segment ranges and index readiness are covered. Native coordinates from
`fst_test_shift_right_bool`, `fst_test_shift_right_skip_start_node` and
`fst_test_leaf_search` merge cases are retained. Suspected native cases are
recorded as CALC-008/009 in the separate journal, with behavior preserved.

Numeric Calc keys and initialized primitive values are the implemented domain.
Wider templates/value classes, native allocation/refcount/deletion timing,
dangling iterators, debug dumps, generic exceptions and undefined border/overflow
operations remain uncertified. Explicit zero-value context and copy/move/operator
methods adapt C++ type/runtime features; GC owns references. Proven unreachable
malformed-tree diagnostics use documented invariants without coverage exclusions.
Inventory semantic parity remains unverified. Original MIT notices and the exact
mdds MIT license are retained. The full-suite cycle remains due at task10.

## Boolean row and column segment owners

Task8 (`202610091610-0168S5`) adds `sc/inc/segmenttree.ts` and the original
`sc/source/core/data/segmenttree.ts` owner. Both boolean facades reuse the shared
mdds implementation and the original private bool specialization. Defaults are
false; bounds are explicit inclusive maxima. Rows retain signed32 coordinates,
columns signed16 coordinates. Setters and range outputs are inclusive; removal
passes half-open boundaries to mdds, and insertion retains skip-start behavior.
Copies own new leaves and start with an unbuilt index and default search hint.

The search hint and `RangeIterator` position are the same owner field. Separate
range iterators and searches therefore affect each other's position. Failed
public operations preserve caller output fields. `ForwardIterator` retains its
monotonic position and interval cache even after owner mutation. `findLastTrue`
returns signed32 maximum when no true interval exists. These original contracts
are preserved; reviewed distinctions are recorded in the suspicious-case journal.

`ScGlobal` retains its original static state owner in `core/data/global.ts`,
re-exported through `inc/global.ts`. Its threaded-group-calculation flag starts
false. Index construction checks that flag; an already prepared query does not.
`makeReady` checks it even when the index is ready. A narrow lint exception keeps
the native static class API. The debug assertion becomes a fail-fast JavaScript
Error; native process abort, release-build diagnostics and concurrent memory
behavior remain uncertified. `dumpAsString` retains the original ASCII text
through immutable JavaScript strings; RTL allocation/refcount/capacity is pending.

`node scripts/calc-bool-segments-native-probe.mjs --check` reproduces 436 defined
sequences using unchanged original declarations and complete needed bool method
groups, genuine verified mdds/Boost, native coordinate widths and the exact global
flag declaration/definition. ASan/UBSan checks both owner snapshots after every
command; observation copies leave live hints and iterator caches untouched.
`--thread-assertion` diagnoses the original assertion in a separate process.
Only the actual opaque RTL return type is declared; native diagnostic dump bodies
are unlinked. No native storage or string engine substitute is introduced.
Ordinary tests read the committed fixture without upstream, compiler or network.

The bool policy stays enabled because its original facade exposes no setter.
The initialized owner always retains both border nodes, making the public
`getFirst` failure guard unreachable. TS expresses that invariant directly;
the native probe keeps the guard unchanged. No coverage exclusions are used.
Numeric UInt16 segment owners, conditional setters/sums, other ScGlobal services,
multi-selection and document/browser consumers remain follow-up work. Native
allocation/pointer lifetime, malformed/uninitialized iterators and undefined
arithmetic remain unverified. Finite comparison evidence does not establish whole
module parity; inventory keeps semantic parity unverified. All82 Calc tests have
actual100 Istanbul coverage. Full-suite validation remains due at task10.

Source research retains MPL 2.0 and inherited Apache notices in the segmenttree
and global originals. Independently authored TypeScript preserves those contracts;
unchanged native originals remain read-only research inputs.

## Multi-selection owner and iterator

Task9 (`202610091638-6W99E8`) ports `sc/inc/markmulti.ts` and the original
`sc/source/core/data/markmulti.ts` owner. `ScMultiSel` owns independent column
arrays and a shared row array, reusing actual `ScMarkArray`, bool row segments,
range lists and sheet limits. Full-row updates use the row owner; partial
deselection first migrates intersecting row marks into columns. Counts report
marked column arrays only. Allocated unmarked columns make `IsEmpty` false even
when `HasAnyMarks` is false. Raw equality/start-column predicates and original
row/column shift expressions are retained.

`Set` copies and sorts the range list by first row, then stores the original raw
entries without adding a terminal unmarked boundary. Equal-key permutations in
native `std::sort` are unspecified; JS stable sorting preserves its row comparator,
while platform-specific raw tie order remains uncertified. `HasOneMark` keeps
its independent source predicates, including suspicious bounds documented as
CALC-010..013 in the journal. No normalization or upstream repair is added.

The iterator borrows an existing array when only one source has marks. With two
sources it creates the original bool-segment snapshot, so subsequent owner
mutation affects the borrowed mode but does not alter the snapshot. Failed
iteration preserves output rows. `GetRangeData` requires segment mode; its debug
assertion is adapted to a fail-fast Error, with native abort/release behavior
explicitly uncertified. Public accessors retain original borrowed array ownership;
`GetMarkArray` creates the original independent normalized value.

Native vector capacity affects logical results because array assignment retains
destination limits, while construction copies source limits. The private value
adapter therefore distinguishes reallocation, reused slots, tail construction,
copy/move assignment and clear-with-capacity retention. It reuses actual mark
array methods rather than recreating their storage. The compared libc++220106
profile records capacity growth, exact copy-assignment reallocation, retained
clear capacity, insertion/erase and self-move. Other standard-library policies,
native allocation/ABI and dangling/reallocated borrowed pointers remain
uncertified. Scalar output references and native move syntax use the existing
tuple/aggregate and explicit method adaptations.

`node scripts/calc-markmulti-native-probe.mjs --check` compares 550 initialized
sequences with unchanged complete selection classes/methods and real dependency
groups, including original `ScRangeList` and `SvRefBase`. It reuses the existing
bool/mdds verification, exact pinned blobs and group hashes, and ASan/UBSan.
Whole selected observations are interned without dropping commands or either
owner's comparison. Ordinary tests verify exact raw arrays through public value
equality and retained bounds by independently copying/resetting the actual array;
they require neither upstream nor a compiler/network.

The unchanged `ValidRow` has a temporary debug guard allowing only standard/jumbo
maxima. Custom explicit-bounds comparison therefore uses original release
semantics with `NDEBUG`; `--debug-assertion` separately diagnoses the original
iterator precondition with debug assertions enabled and standard bounds. Needed
bounds fields/constructor/methods are extracted exactly; full intrusive lifetime
services and unlinked RTL declarations are not replaced by engine stand-ins.
Literal standard-bound coordinates/expectations from both upstream multi-mark
tests are retained. Full `ScMarkData`, document/column/UI consumers, undefined
arithmetic, malformed storage and unsafe vector indices remain subsequent work.
Inventory semantic parity remains unverified; full-suite validation is due at
task10. Original research inputs retain their MPL 2.0/inherited Apache notices.

All88 Calc tests pass with actual100 Istanbul coverage: 1988 statements,
1546 branches, 346 functions and 1733 lines. No coverage exclusions are added.

## Mark-data selection owner and span conversions

Task10 (`202610091723-P9JYX4`) implements the complete original `ScMarkData`
owner at `sc/inc/markdata.ts` and `sc/source/core/data/markdata.ts`, reusing actual
multi-selection, mark arrays, ranges, bool segments and shared mdds. Original
flags, ordered selected sheets, simple/multi conversion, range-list import/export,
queries, shifts and all four selection envelopes retain their source conditions.
`ResetMark` preserves selected sheets and stored rectangles; empty replacement
also preserves current selected sheets. Repeated cover generation appends to
existing envelope lists. Native default list moves are added to the existing
`ScRangeList` owner so envelope moves reuse its actual storage and scalar cache.

Original `fstalgorithm.hxx` templates live in `sc/inc/fstalgorithm.ts`; explicit
span constructor arguments adapt template syntax. They iterate actual mdds leaves
or use the already-valid search index for the start-key overload. No rebuild or
alternate interval engine is introduced. Original `RowSpan`/`ColRowSpan` values
live at the `columnspanset` header/core-data boundaries; full column span-set scan
and action services remain separate unimplemented owners.

The unchanged complete native mark-data class/methods reproduce290
initialized sequences and1017 complete interned selected observations with real
range-list/ref-base/multi/bool mechanisms, actual span templates and genuine
verified mdds/Boost under ASan/UBSan. Original numerical document getter bodies
are linked through an explicit borrowed-bounds comparison carrier; this is not
a document/cell engine or full lifecycle implementation. Custom bounds use
original `NDEBUG` semantics because of the existing standard/jumbo debug guard.
Raw native top/bottom envelope lists remain saved; their unspecified unordered-map
row permutation is compared as complete multisets, with duplicates retained.
Left/right and other ordered outputs compare exactly. Full native map ordering,
allocation/ABI/pointer lifetime and selected-tab self-move behavior remain
uncertified. The isolated selected-tab self-move diagnostic retains the original
libc++220106 ASan heap-use-after-free report without assigning a defined result.
CALC-014..016 record self-move, the persistent previous-unmarked flag after a
column gap and repeated-envelope accumulation; all original expressions remain.

A separate unchanged-template probe compares256 boolean patterns and64 numerical
owners through every span overload, with genuine verified mdds/Boost and
ASan/UBSan. Current shared value types are boolean/number with numerical keys;
custom bool conversion, object/move-only values and non-numerical key families
remain unverified. The original terminal leaf is excluded by iterator-end
semantics; failed indexed search leaves output empty and never rebuilds the tree.

The complete737-line TypeScript mark-data owner is kept at the original class
boundary: flags, selected tabs and envelopes form one upstream-owned state. It
remains below the1000-line hard limit and is reviewed as one coherent owner,
rather than splitting its original state across invented modules.

All96 Calc tests pass with actual100 Istanbul coverage:2519 statements,
1854 branches,412 functions and2208 lines. No exclusions are added. With both upstream symlinks temporarily detached,
all96 Calc,5 affected shared and30 related inventory scenarios pass; the links
are restored by an EXIT trap. Ordinary acceptance needs no upstream/compiler or
network.

The task10 full application run executes14245 scenarios across539 files:
14244 pass, while the unchanged shared mdds native replay exceeds its existing
30000ms timeout during initial concurrent native/lint/inventory work. After all
heavy jobs finish, its complete5-test module passes unchanged under Istanbul in
14.15s, with actual100 coverage of all four mdds source owners:486 statements,
284 branches,86 functions and433 lines. No timeout/assertion/threshold changes
are introduced. Vitest reportOnFailure=false suppresses the failed full
application coverage report; global/Writer coverage is not certified from it,
and Writer coverage/implementation remains untouched per user instruction.

Full inventory coverage passes123 scenarios across38 files after its one
similar filesystem-test timeout is reproduced as a passing isolated test:
1734 statements,1292 branches,436 functions and1668 lines, all100%. Tooling14,
source-provenance3 and all303 browser scenarios pass (301 Writer,2 shared;
Calc has no dedicated browser scenarios yet). TS7, full lint, scoped formatting,
static build, documentation, ownership, file-size/source-tree and provenance
checks pass. Calc20 capabilities/141 modules and shared1/116 report zero
semantic violations; semantic parity remains unverified. This completes the
full-validation cadence at task10 of the resumed cycle.

## UInt16 row segment owner

Task 11 (`202610091813-7BY25G`), task 1 of the next 10-task cadence, extends the
existing `sc/inc/segmenttree` and `sc/source/core/data/segmenttree` owners with
`ScFlatUInt16RowSegments`, its `ForwardIterator` and original numeric operations
in `ScFlatSegmentsImpl`. Existing bool owners, mdds and ScGlobal are reused.
Explicit defaults and writes narrow to UInt16; row inputs narrow to signed 32-bit.
No independent interval engine or document/table stand-in is introduced.

Original indexed search and leaf-only policy retain different cursor behavior.
Value-only search and indexed sums use local iterators; leaf sums change the
owner hint. The numeric forward iterator uses the policy lookup first and leaf
lookup on subsequent cache misses, retaining original stale cache and failed
caller-output behavior. Copies retain default/policy but reset the hint.
Conditional setters visit current segments with original predicate call order
and require a successful valid-row lookup. Native invalid/uninitialized inputs
and arbitrary reentrant predicates remain uncertified. JS scratch output fields
select the existing mutable-output overload; these placeholders are not native
default values and range wrappers publish nothing on failure.

Numeric row insertion passes false for skip-start, unlike the bool owner. Sums
retain both original loops, failure/boundary conditions and hint ownership.
For every defined UInt16 facade, values <= 65535 and disjoint row lengths total
at most INT32_MAX: sum <= 65535 * 2147483647 < 2^47. The constructor maximum+1 and
loop arithmetic must stay within defined signed 32-bit arithmetic. Original checked
multiply/SAL_MAX_INT64 and saturating-add overflow branches cannot execute in
this specialization. Exact bigint products/additions express that proven domain
in TypeScript; native bodies and original safeint groups retain every guard.
Other generic value families are unimplemented and are not covered by the proof.

The native probe compares 706 defined sequences, both owners after every command,
all original numeric/template methods, conditional predicate traces, numerical
search/sum results, shifts/copies and iterator behavior under ASan/UBSan. It
reuses original bool 436/mdds 3020 verification, exact pinned/group hashes and
genuine patched mdds/Boost; observations query copies with leaf policy and leave
live hints/indexes untouched. Native RTL dump and logging allocation are unlinked;
TS diagnostics preserve original ASCII text through immutable strings. Full
allocator/ABI/pointer/thread/process lifetime and complete module parity remain
unverified. Complete snapshots are losslessly interned into 62 records: every
command result and both owner observations remain compared, and raw native
outputs remain available in the ignored research output directory. Five isolated
native thread-assertion processes reproduce the original checks.

All 100 Calc tests pass with actual 100% Istanbul coverage: 2623 statements,
1892 branches, 433 functions and 2301 lines. The affected shared mdds module has
5 passing tests and actual 100% coverage: 486 statements, 284 branches,
86 functions and 433 lines. With both upstream links temporarily detached,
100 Calc, 5 shared and 30 related inventory scenarios pass; the original links
are restored. Tooling 14, provenance 3, TS7, scoped lint/formatting, documentation,
boundaries, file size, source tree, provenance and routing checks pass. Calc
21 capabilities/141 modules and shared 1/116 report zero semantic violations.
Doctor retains two previously recorded warnings and reports no errors.

The 542-line segmenttree source (543 by the size checker) retains the original
coherent shared template and boolean/numeric owner boundary, below the 1000-line
hard limit. CALC-017 records the ignored failed lookup in the conditional setter
without assigning a defined native result or repairing the original expression.
This is task 1 of the next 10-task validation cycle; the full suite is not due.
No semantic status is promoted and Writer remains untouched.

## Compressed widths and row/column flags

Task 12 (`202610091841-PZT40R`), task 2 of the next 10-task cycle, adds complete
numeric `ScCompressedArray`, `ScBitMaskCompressedArray` and the borrowed iterator
at the original compressedarray header/core-data boundaries, with original
`CRFlags` at the global header. ScTable uses these owners for column widths and
row/column flags; its column owners use MaxCol()+1 and row flags use MaxRow().
No table/document stand-in is introduced. The bit-mask specialization reuses
one actual base owner rather than a separate interval engine.

Required scalar witnesses represent erased native access/data template arguments:
SCROW/SCCOL use signed 32/16 bits; UInt16/CRFlags use unsigned 16/8 bits.
They are syntax adapters with no invented defaults. Numerical POD entries are
copied independently during original memmove/reallocation operations. The
original nCount/nLimit and capacity-growth algorithm remain observable through
public mutation, and native observations read protected state without modifying
it or deriving from the original final bit-mask owner.

Search retains the first/last fallback for out-of-domain input. SetValue keeps
original inclusive bounds, temporary numerical value copy, split/shrink/combine
and capacity behavior. Two redundant guards are specialized with source proofs:
ordered Search plus the preceding failed branch implies the previous endpoint
is exactly start-1; active insertion is 0/Search/Search+1 and every preceding
combination/removal disables insertion, so its index cannot exceed nCount.
Native bodies retain both guards unchanged. No unreachable-state injection,
coverage exclusion or alternative storage algorithm is used.

Insertion extends the preceding entry at an exact boundary. Removal combines
identical adjacent entries and resets the terminal endpoint to nMaxAccess.
Both preserving-size methods retain their original call order, including the
observed unused fill value for ordinary RemovePreservingSize owners. Distinct
CopyFrom, source offsets, repeated terminal GetNextValue, source AND copies and
borrowed iterator cache/position behavior remain original. Iterator dereference
and addition require a valid entry/region. Numerical output-reference tuples
and fail-fast errors adapt native syntax; native process abortion is uncertified.

All 5272 defined sequences of four numeric/flag row/column specializations
compare both complete native owners after every command under ASan/UBSan.
640 losslessly interned complete snapshots preserve entries, count/capacity,
queries, terminal next behavior and reverse mask results. Complete original
header/definition groups and genuine original o3tl typed-flag/config headers are
used with exact pinned file/group hashes. Separate native processes reproduce
self-copy and typed-mask assertions. Invalid-start range AND/OR loops are
reproduced as bounded nontermination diagnostics, with no successful result
assigned and no guard added. CALC-018/019 record these observations.

Generic object values/equality/copy, allocation/ABI/native references, dangling
iterators, undefined arithmetic, malformed entry/index states, complete module
parity and table/document/browser consumers remain unverified. All 104 Calc tests pass
with actual 100% Istanbul coverage: 2904 statements, 2051 branches,
467 functions and 2548 lines. With both upstream links temporarily detached,
104 Calc and 30 related inventory tests pass; the original links are restored.
Tooling 14, provenance 3, TS7, scoped lint/formatting, documentation, boundaries,
file size/source tree, provenance, routing and doctor checks pass. Doctor retains
two previously recorded warnings and no errors. The coherent compressedarray
module is 475 physical lines and stays below both source size budgets.

Calc 22 capabilities/143 modules and shared 1/116 report zero runtime semantic
violations. Whole-module parity remains unverified. Writer remains untouched;
a full suite is not due at task 2/10.

## Shared SoA iterator owners

Task 202610092029-9SXZKS (task7/10) adds the original shared
iterator_node and soa/iterator owners over three separate borrowed position,
size and block arrays. Actual shared scalar blocks remain the data owners.
Each iterator owns its cached node, copies its value independently and keeps
borrowed parent/block pointer identity. Assignment and swap mutate cached
values in place, retaining existing node and grouped-cursor references.
Forward private index updates and reverse no-update policy keep source order.
End comparison skips cached-node equality; reaching end retains the previous
cache. Mutable-to-const construction reconstructs the node from its arrays,
while same-type copy preserves the cache. End private data is intentionally
undefined by upstream and is omitted from native observations.

The complete unchanged native headers are compiled on real SoA containers
under ASan/UBSan for seven layouts, all four iterator specializations, complete
forward/backward/pairwise assignment/swap/equality and mutable cache/conversion
states. The shared input verifier checks the complete compiler dependencies
against pinned archives and original LibreOffice patch. Ordinary tests consume
portable records without a compiler or original source checkout. Actual
advance_position also replays all694 original mutable/const position pairs
over the new runtime iterator owners.

STL cursor borrowing and const/static template syntax have explicit TypeScript
witnesses. Native debug instrumentation, pointer stream formatting, invalid
lifetimes, unbounded size_t indices, complete SoA container and Calc document/UI
remain unverified. The arrays in tests are populated from genuine observed
metadata; they do not certify a replacement container. Whole-module inventory
parity remains unverified.

## Shared SoA block-array ownership

Task 202610092047-Q9D4EA (task8/10) adds original private block_slot_type,
blocks_type and blocks_to_transfer owners in soa/main.ts, with original default
copy/mutate/equality helpers in soa/main_def.ts. Each metadata owner keeps three
separate normal vectors. Slot/transfer defaults, synchronized push/pop/insert/
erase/clear/reserve, position arithmetic and exact integrity diagnostics remain
original. Insertion/erase/clear affect metadata without deleting blocks or
adding enclosing-container event behavior. Copy/clone call the distinct actual
shared block_funcs aliases; move/vector/slot swaps retain storage/pointer identity.

vector_storage.ts is explicit shared language infrastructure for reserved slots
and constructed unmanaged scalar/pointer prefixes. Existing delayed vector
allocation/growth/insert/erase/assignment delegate to the same mechanics, while
its front deletion offset and bool capacity policy stay in their original owner.
Reserve allocates actual slots and leaves constructed size unchanged. This
adapter has no alternate block segmentation, column or document engine.

The genuine native probe compiles the full unchanged headers and accesses the
original private storage through caller-only explicit template pointer-member
bridges. No original class body or access token changes. All888 sequences/8460
complete two-owner steps compare full arrays, selected host capacities, stable
pointer tokens, complete all12 scalar payload pools and results after every
command. All1753 complete states are losslessly interned for portable tests.
Default helpers retain null skipping, callback order/exception partial effects
and internal left-prefix equality. The metadata owner checks lengths before
that equality helper. CALC-025 records the distinction without a fix.

Native custom execution policies, object/destructor/allocator ABI, unbounded
size_t arithmetic, invalid ranges/self-insertion/dangling cursors and every full
multi_type_vector/Calc column/document/browser method remain unverified.
Original nested types export at file scope as TypeScript syntax adaptation;
this increment certifies no substitute enclosing container or whole-module parity.

## Shared SoA position adjustment

`external/mdds/include/mdds/multi_type_vector/soa/block_util.ts` retains the
original architecture-neutral `adjust_block_positions` specializations for
`none`, `lu4`, `lu8`, `lu16` and `lu32`. Each keeps the original early return,
explicit unrolled lanes, remainder mask and scalar tail. The callable factory
adapts C++ template-specialization syntax. The existing original default trait
still selects `lu16`; disabled SIMD values have no scalar fallback.

The helper borrows real `std_vector` positions from the shared SoA owner.
Only positions change. Sizes, block aliases, payloads, capacities and backing
identities stay intact. The original iterator cache remains a cache: position
writes are observed on its next original update, without forced synchronization.
Unsigned64 position plus signed64 delta uses exact `bigint` modulo arithmetic;
number witnesses require exactly representable inputs and outputs. Valid large
start indices return before index projection. Invalid negative indices retain
the original caller precondition and receive no successful fixture result.

The optional native probe compiles unchanged complete original headers and
observes the real private array owner through a standard caller-only template
access bridge. The portable corpus includes 1465 full cases, 7325 original scalar
calls and 8790 full before/after records, losslessly interned as 852 complete
snapshots. It retains all three metadata arrays, borrowed pointer identities,
reserved capacities and complete scalar payloads, including uint64 wrapping and
large signed64 index early returns. Ordinary tests require no upstream checkout,
compiler or network. Contextual original loop-unrolling QA is read as source;
it is not claimed as an executed or ported suite.

The pinned native target is arm64 with size_t64, absent SSE2/AVX2 and OpenMP0.
Architecture-specific vector instructions, OpenMP scheduling, other native
position widths, unsupported primary-template diagnostics, generic ABI/object
lifetimes, invalid inputs and the full SoA container/Calc column/document/UI
remain unverified. Inventory records preserve those gaps and unverified parity
statuses. CALC-026 records an AVX2 comment/code mismatch without changing code.

## Shared SoA container lifetime ownership

The actual `multi_type_vector` field owner now composes the existing original
`blocks_type`, scalar callbacks, block operations and iterator owners. Default,
handler, size, typed fill/range, copy, clone and move construction preserve
original member initialization and event ordering. Native scalar overloads and
handler value operations use explicit TypeScript witnesses; numeric types are
not inferred from JavaScript values. The original shared empty handler is reused.

Copy/move assignment retains the original temporary/swap/destructor sequence,
including self assignment. Event value swap exchanges field contents and retains
borrowed handler references. Deletion releases each block before deleting it and
nulling its pointer; clear resets metadata and logical size afterward. Explicit
`dispose` pairs with a valid native destructor boundary. Full swap, block shrink,
equality and all eight mutable/const forward/reverse endpoint factories reuse the
original owners. Reverse cursors adapt native base indices to the existing
shared iterator's dereference indices.

The portable corpus compares 217 complete original native sequences and 2579
operations, including all12 scalar families, exact invalid-range diagnostics,
zero-size early returns, complete metadata/capacities/payloads, pointer tokens,
handler values, event order, endpoint nodes and final destructor logs. Its 2796
full initial/operation records are losslessly interned into 1113 snapshots.
The optional probe compiles unchanged full headers under ASan/UBSan. Compound
inputs are prepared by original public `set`, then loaded as full test fixtures;
this does not certify or implement segment mutation.

Row/block lookup, scalar retrieval, segment mutation, trace/debug paths, generic
custom blocks/events, throwing native destructors, arbitrary input iterators,
invalid object lifetimes/end dereference, ABI/allocator behavior and complete
Calc columns/documents/browser UI remain unverified. Inventory retains false
whole-contract/default/behavior parity flags. CALC-027 records the moved-from
logical-size distinction without resetting it.
