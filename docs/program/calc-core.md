# Calc coordinate foundation

## UI prerequisite priority

The user resumed the goal after task31's full run and requires the missing
core components for a real Calc UI first. The following dependencies take
priority over unrelated completion of generic mdds or formula features:

1. Original cell values and the shared string/text dependencies they actually
   use, with original variant tags and text metadata.
2. Required shared storage writes and original Calc cell-store registrations;
   reuse shared owners rather than build a parallel document model.
3. Original `ScColumn`, `ScTable` and `ScDocument` owners and the document
   operations required by the first editable sheet.
4. Original edit notifications and undo, reusing existing shared Svt/Sfx
   services where their contracts apply.
5. Original Calc view/input owners and browser presentation connected to those
   document operations, using the existing shared command/UI infrastructure.

Dependencies still control execution: a leaf declaration does not establish
document or UI readiness. Original formula and rich-text cell owners must be
ported where the actual cell-store contract needs them; they cannot be
replaced by synthetic browser cell variants. The existing browser Foundation
and coordinate/selection services do not yet provide an editable Calc sheet.

Task32 (`202610101342-SSE4NF`), the first task since task31's full run, ports
original `CellType` at `sc/inc/global`, `TEXTWIDTH_DIRTY` at
`sc/inc/globalnames`, and `CellTextAttr` at its original header/core-data
boundaries. Its width starts at65535 and its script at `UNKNOWN`8. The shared
`SvtScriptType` declaration lives once under `svl/inc/languageoptions`, mapped
to original `include/svl/languageoptions.hxx`; Calc imports that owner.

Public accessors adapt implicit native UInt16/UInt8 field assignment for
initialized finite integers. Optional-source construction and `assign` adapt
compiler-provided memberwise value copy/assignment, including self-assignment
and scalar trivial moves which leave their source fields unchanged. This
metadata owner adds no text measurement or document substitute.

`scripts/calc-celltextattr-native-probe.mjs` verifies all five complete pinned
source blobs and extracts the complete original enum, struct, constructor and
constant scopes unchanged. Its C++ wrapper supplies scalar SAL aliases and
input/output only, then compiles with ASan/UBSan. Portable fixtures retain
154 sequences and1232 complete three-owner field states covering boundaries,
copies, mutations and assignment; native field widths are2/1 bytes. The tests
do not require upstream files or a compiler. Native ABI/reference lifetime,
undefined casts, actual storage/document/view integration and complete shared
language services remain unverified. The three independent contracts have
separate capabilities for metadata, cell tags and shared script tags; broader
runtime semantic parity flags remain unverified.

All suspicious Calc cases are recorded in
[calc-upstream-suspected-issues.md](calc-upstream-suspected-issues.md), retaining
the original behavior. Other applications can own separate journals. The next
scheduled full run is task41; intervening tasks run Calc coverage and the
tests of affected shared modules.

Task32 verification passes with upstream symlinks absent: all106 Calc tests
in24 files and the shared script enum test. Actual Istanbul Calc counters
are2920 statements,2055 branches,474 functions and2564 lines, all100%; the
shared enum has6 statements,1 function and6 lines, all100%, with no branches.
Every recorded statement/function/branch counter is positive. Native
`--check`, typecheck, lint, JSDoc, size, dependencies, source tree/provenance,
both scoped inventories, routing and doctor pass. Source-provenance3 cases
and registry12 cases pass; doctor's two existing warnings are unchanged.
Journal body and all31 cases are preserved byte-for-byte. No Writer coverage
or implementation changes and no full run occur in this task.

## Shared Unicode ownership and intern pool

Task34 (`202610101428-D9PRQV`) adds actual RTL Unicode data ownership before
the original C++ `OUString` and `svl::SharedString` consumers. The existing SAL
header/template/C wrapper boundaries are extended; `sal/rtl/strimp.ts` owns
the original allocator globals, `sal/rtl/strimp.hxx.ts` owns their declarations
and flag macros, and `sal/rtl/hash.ts`
owns the complete original intern-table algorithms. Other applications can
reuse these shared modules without their own string-data implementation.

The original C empty is a concrete static identity with signed refcount
-1073741823, length0 and one zero unit. It remains distinct from the later
C++ `OUString` literal empty. Data retains UInt16 buffers, logical length,
allocated capacity and terminating zero. Copying allocates distinct data;
assignment acquires first, including selfassignment. Buffer copying releases
the previous owner last so that the source can alias its storage. Reserving
capacity releases the previous owner before allocating logical empty data.
Both orders and actual allocator/free events are compared with native code.

Interning retains the original hash, linear probes, wrap, static candidates,
duplicate handling and complete following-chain reinsertion. The initial
request1024 chooses2039; the original two next-prime applications grow it to
8191 at its load threshold. The original fast-path destination overwrite is
preserved and documented as suspicious
[CALC-032](calc-upstream-suspected-issues.md#calc-032-intern-fast-path-overwrites-a-populated-destination-without-releasing-it).

Browser storage uses concrete `Uint16Array` data and caller-owned pointer-slot
tuples. An ESM-writable carrier holds the two original replaceable allocation
function pointers. Default browser free releases the owned buffer reference
for garbage collection; physical native allocation/deallocation and reads
after free are outside certification. Uninitialized spare bytes are never
included as invented native zeroes. Initialized logical payload and both
initialized terminators are retained in every observed live allocation.

The pool and counters belong to one synchronous browser realm. No asynchronous
work crosses the native mutex-protected interval. Actual native pthread
recursive mutex and compiler atomic operations remain in the C++ probe;
native cross-thread synchronization is not claimed by the browser port.
After last-reference decrement and synchronous hash removal, the following
increment is necessarily1. The native recursive branch for a concurrent
separate acquire is therefore outside the reachable realm-local domain.
On the verified64-bit target the allocation size guard is always true for
nonnegative signed32 lengths; its original `o3tl::make_unsigned` assertion is
preserved. With active original constructor assertions, the hash helper's
null-copy return cannot be reached: failure aborts before returning, while
empty copying binds the static empty. These reductions do not certify release
builds, concurrent ownership or undefined arithmetic/pointer inputs.

`scripts/rtl-ustring-ownership-native-probe.mjs` verifies13 complete pinned
blobs and extracts29 complete unchanged scopes. ASan/UBSan captures3336
original calls, all live identities/counts/payloads/capacities/terminators,
all1400 caller handles, allocation/free events and complete intern table slots.
Twenty original assertion diagnostics are retained. The full native state
output is88879388 bytes with SHA256
`665e3f8e7f0d1ccede35d17809b26694319812aaf695e1383ee8edb40d46c7a4`.
Portable deltas are lossless: the capture script independently reconstructs
and compares every complete native snapshot before accepting the fixture.
Tests reconstruct the same complete observations without upstream access.

This dependency closure does not yet provide `OUString`, `SharedString`, a
Calc cell store, `ScColumn`, `ScTable`, `ScDocument` or an editable browser
sheet. Those actual owners remain the next UI prerequisites. Other RTL
algorithms, native ABI, alternate STL comparison magnitudes, uninitialized
memory, process-abort semantics, and physical/out-of-memory allocation beyond
the original replaceable allocator failures remain unverified. All scoped
runtime/provenance flags continue to express that bounded evidence.

Task34 scoped verification passes without either upstream symlink:106 Calc
tests in24 files and4 shared RTL tests in2 files. Actual Istanbul Calc
counters remain2920 statements,2055 branches,474 functions and2564 lines;
the5 executable RTL sources have265 statements,137 branches,50 functions
and207 lines. All four metrics are100%, every actual raw counter is positive,
and complete initialized free-callback fields are included in native event
comparison. Typecheck, lint, JSDoc, size, dependencies, source tree/provenance,
Calc/shared inventories, routing and doctor pass. The two inherited doctor
warnings remain. This is task3/10 after the last full run; next full is task41.
Writer-only coverage and implementation are unchanged.

## Shared UTF16 comparison for cell strings

Task33 (`202610101405-RCRBVD`) ports the original dependency used by
`svl::SharedString::operator==`: `rtl_ustr_reverseCompare_WithLength`.
`sal/rtl/strtmpl.ts` owns `CompareNormal` and `reverseCompare_WithLengths`;
`sal/rtl/ustring.ts` owns the C wrapper. The declaration boundary is
`sal/inc/rtl/ustring.h.ts`, mapped to original `include/rtl/ustring.h` in the
SAL library; its `.h` identity keeps the future C++ `ustring.hxx` owner distinct.

Original traversal starts at the declared ends and preserves exact UInt16
unit differences, returning the length difference only after a common suffix.
Embedded NUL is an ordinary unit; surrogate pairs receive no code-point or
locale reinterpretation. Borrowed `Uint16Array|null` views adapt native
buffers, explicit lengths narrow to signed32, and the static comparator
witness adapts the original empty template strategy. The original four
assertions become fail-fast errors. Native process abort/release builds and
invalid/dangling pointers remain outside this evidence. Positive loop length
and the original guards prove non-null access; storage must cover its declared
length without a new bounds repair.

The native probe verifies four whole pinned source blobs and compiles six
complete unchanged scopes with ASan/UBSan. It retains10084 calls and20168
direct/public results, including valid prefixes and borrowed offsets, empty
and null-zero inputs, embedded NUL, unsigned boundaries, surrogates, suffix
precedence and original signed32 argument narrowing. Four separate native
assertion callers retain their actual SIGABRT/stderr diagnostics. Portable
tests compare every result through both original owners and the public header.
SAL module registration protects these source/header owners from browser and
application dependencies. Runtime/provenance/exported-operation records and
one atomic shared capability remain semantically unverified for full-module
parity.

Actual RTL data allocation/refcounts, `OUString` and `SharedString` remain the
following required string owners. This task introduces no replacement string
store or document/UI model. It is task2 of10 since full task31; the next
scheduled full suite remains task41.

Task33 passes portable upstream-absent Calc106/24 and shared RTL2/1 tests;
actual Calc coverage remains S2920/B2055/F474/L2564 all100. The two shared
RTL owners have S21/B16/F3/L16 all100 with every raw counter positive. Native
`--check`, all static/source gates, both scoped inventories, source-provenance3
and module-boundary/registry24 cases pass. Calc inventory45capabilities/166
modules and shared22/136 have zero semantic violations; broader parity stays
unverified. Doctor's two inherited warnings remain. Original symlinks are
restored exactly, with no Writer/threshold/config changes or full suite run.
The header filename ledger records the necessary distinct module resolution
for original C `ustring.h` and C++ `ustring.hxx` contracts; source validation
is unchanged. Read-only function exports are extracted exhaustively from the
runtime records, outside the mutation-helper operation collection.

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
in [calc-upstream-suspected-issues.md](calc-upstream-suspected-issues.md). Recording them
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

## Shared SoA block lookup and reads

The original read-only container group now implements default/hinted block
lookup, mutable/const row positions and scalar/type/empty queries. Lookup uses
the original lower-bound overshoot correction over real shared position vectors.
Cached hint parent/index admission, integer half-row backward walk and reset
remain unchanged. Real foreign hints and retained hints after full vector swaps
are exercised without rebuilding their cached fields.

`position(size)` returns a valid endpoint pair before reading hint private data.
Scalar get, type and empty queries reject that row using the original diagnostic,
logical size and block count. The source-call line numbers are explicit pinned
`__LINE__` witnesses, not browser source locations. Native uint64 maximum rows
use `bigint` early-outs before metadata indexing. Scalar callbacks carry the
original type and empty value; numeric families are not inferred from JS values.

Original iterator alias construction bodies are shared in the implementation
module, while the declaration owner retains its actual original fields and
public factories. The normal STL adapter supplies standard lower_bound search
syntax over the existing borrowed vector; it adds no separate container engine.
The unchanged native probe retains the complete original217 lifetime prefix and
appends73 query sequences. It now compares290 sequences,8810 operations and9100
full initial/operation records, losslessly interned as4116 complete snapshots,
including290 final destruction logs. Ordinary tests need no upstream/compiler.

Scope remains the pinned unmanaged scalar/default-execution/no_trace target.
End-hint private fields are intentionally omitted. Invalid native hints/lifetimes,
wrong native scalar types, generic custom blocks, arbitrary values, allocator/ABI,
compile-time qualifications, static typed-position get/next/advance wrappers,
segment mutations and complete Calc column/document/browser remain unverified.
Whole module/behavior/contract/default parity flags remain false/unverified.

## Shared SoA position navigation and typed reads

Task `202610092239-B0Y0WD` ports original `next_position`,
`advance_position`, `logical_position` and static typed position `get` on
`soa/multi_type_vector`. Mutable and const navigation copy the original
iterator/offset pair. Within-block movement and boundary crossing retain
source order; advancement forwards the existing shared `util.advance_position`
implementation. Logical extraction reads the cached node directly.

The original `types.hpp` `get_block_element_at` uses its bool-store trait to
read via `cbegin` and iterator advancement; other stores use `at`. The actual
shared default block supplies that erased compile-time trait for its original
`delayed_delete_vector<T>`, and typed reads retain the existing block owners.
No replacement position or scalar engine is introduced.

The unchanged-header native corpus now has 350 complete sequences, 15734
operations, 16084 complete initial/operation records and 7161 lossless
snapshots. Every prior 290 sequence and its complete states/final events is
retained. Appended actual public callers cover all 12 scalar families,
mutable/const copies, within/across blocks, zero/forward/backward movement,
multiple-cell empty blocks, and final transition to end without endpoint
dereference. Native public `set` only prepares compound input; it is not a
ported or certified mutator.

The finite group is recorded as implemented; complete container/default,
custom/managed storage, invalid positions/lifetimes, ABI/qualifiers,
trace/debug/SIMD, arbitrary values and Calc column/document/browser behavior
remain unverified. Source file boundaries remain original; the existing
`types.ts` and now `soa/main.ts` exceed the 500-line review target but remain
below the enforced 1000-line limit. Their declarations and original member
bodies retain their upstream responsibilities rather than an artificial split.

## Shared SoA resize and empty-tail growth

Task `202610092254-YGCB8W` ports original `resize`, `resize_impl`,
`append_empty` and `push_back_empty` on the existing shared SoA container.
TypeScript combines its original declaration/member bodies in the same
owner file, consistent with the existing constructor/clear/lifetime members.
Actual metadata, search, typed block funcs, deletion helpers and iterators
are reused. Equal size is a no-op; zero clears; growth extends an empty
last block or appends a new empty block. Empty push returns the original
new/extended last block iterator.

Truncation keeps source overwrite and scalar resize order, retained block
size, lower-block release/deletion and metadata erase before logical size
assignment. The exact global overwrite offset remains unchanged and is
recorded in CALC-028; no upstream repair is introduced.

The native corpus now has 578 complete sequences, 24518 operations, 25096
full initial/operation states, 11463 lossless snapshots and 578 final logs.
Every prior 350 complete sequence/state/final event is retained. New actual
public callers cover all 12 unmanaged scalar families, empty/nonempty tails,
same/zero/grow/shrink, nonzero multi-cell block starts, block edges and lower
block removal, copy isolation, moved-source same/shrink error/clear and
read-after-resize. Forwarding original standard funcs and event callbacks
observe exact overwrite/resize/release/delete arguments without replacing
native algorithms. Native public set only prepares compound input.

Finite default/no_trace libc++ bounded scalar contracts are implemented;
whole container/module/default, managed/custom/throwing outcomes,
trace/debug/SIMD, invalid moved-source growth/lifetimes/overflow and full
Calc columns/documents/browser remain unverified. Source-shaped main and
container test files exceed the 500-line review target and retain their
original responsibilities below the enforced 1000-line limit.

## Shared SoA scalar append and new-cell ownership

Task `202610092310-2H4HBC` ports original `push_back`, `push_back_impl` and
`create_new_block_with_new_cell` directly in the existing shared owner, using
actual scalar callback families and metadata/iterator owners. A matching tail
appends its value before increasing block and logical sizes. An empty or
different tail gets a new metadata slot, then a newly created empty payload;
acquisition precedes scalar append, and logical size changes last. The original
helper releases/deletes old data before creation and retains its exact null
creation error. No numeric scalar family is inferred from JavaScript values.

Genuine unchanged full-header native comparisons retain all578 prior sequences
and add public appends, capacity growth, empty/different tails, copy isolation,
moved destinations, swaps and valid original size-one private helper replacement.
The caller-only member bridge invokes the original method without rewriting its
body. A custom native failure-cell ADL returning nullptr proves the exact original
error and failed metadata state; only clear/destruction follow that failure.
Forwarding operation observation records acquisition size zero before append.
Ordinary committed-fixture tests require neither upstream nor native compilation.

Scope remains pinned no_trace/default execution, all12 unmanaged standard scalar
families and finite initialized metadata. Native rvalue/ADL syntax is an explicit
existing callback witness. Managed/custom lifetimes, generic throwing allocators
and events, emplace variadic construction, other segment mutators, trace/debug/SIMD,
unbounded/invalid metadata and whole Calc columns/documents/browser remain gaps;
whole-module/default/QA parity flags remain false. CALC-029 records the custom
null-creation metadata observation without a rollback repair. Cycle2 task4/10 follows the
full validation in task `202610092130-FMVJ21`.

## Shared SoA range erase and adjacent-tail merge

Task `202610092323-JXAJ9S` ports original `erase`, `erase_impl`,
`erase_in_single_block` and `merge_with_next_block` directly in the existing
shared owner. Both lookup diagnostics and the reversed-range guard keep their
original order and arguments. Single/multiple block deletion preserves actual
scalar overwrite/resize/erase, metadata reduction, release/delete, position
adjustment and type/empty adjacency merge responsibilities. A nonempty merge
appends the source, resizes it to zero before release/deletion, then removes
its metadata, preserving the original managed-cell intention.

The original trait `loop_unrolling` selects the existing architecture-neutral
shared adjustment specialization. Actual deletion, registered scalar block
functions, three metadata vectors and iterator owners are reused. Bigint
out-of-range row witnesses retain native uint64 guards before exact bounded
index projection; no generic unbounded metadata certification is asserted.

Unchanged genuine full-header native callers preserve all664 prior complete
sequences and add every range of several11/13cell input geometries over all12
standard scalar families, filled/empty owners, contiguous unlike scalar types, adjacent same/different/empty
blocks and41block position shifts. Actual forwarding erase/block-append
observers retain offset/count/source type/size, full ownership/capacity/payload
states, copy isolation, reappend and final destruction. Complete owner snapshots
are losslessly interned separately to remove repeated storage; ordinary comparisons
reconstruct every field and raw native output remains complete. Compound input is
prepared with original public set, then loaded from complete captured fields;
set itself remains a subsequent group. No original algorithm body is generated
or rewritten. Ordinary fixture acceptance runs without upstream or a compiler.

Scope remains finite pinned no_trace/default execution and unmanaged standard
families. Managed/custom outcomes, native ABI and throwing callbacks/allocators,
trace/debug/SIMD, invalid or overflowing metadata, other segment mutators and
whole Calc columns/documents/browser remain gaps. Whole-module/default/QA flags
remain false. CALC-030 records the original invalid-end diagnostic start-row
argument without changing it. Cycle2 task5/10 follows full validation in taskFMVJ21.

## Shared SoA whole-container release

Task `202610092349-Z4XSP9` ports original `release()` directly in the shared
SoA owner. It walks actual borrowed block storage in source order, skips
null pointers, resizes each nonempty payload to zero, then releases and deletes
that block through existing registered funcs and event handlers. Pointer slots
are retained until the original metadata clear; logical size resets afterward.
This differs from clear/destruction, whose callbacks observe the original size.
The three metadata vectors retain their actual allocated capacity.

Actual unchanged-header public native callers retain all 7360 prior complete
sequence. Added all 12 standard-family callers cover homogeneous/empty owners,
compound and 41-block tables, repeat release, copy/clone isolation, swaps, moved
sources/destinations, release after erase/resize/append, and subsequent scalar or
empty growth. Complete payload/metadata/capacity/equality/endpoints/events and
forwarded resize/release/delete calls are compared without generated algorithms.
Ordinary committed-fixture acceptance requires no native compiler or upstream.

The selected finite unmanaged no_trace/default-execution contract is implemented;
managed/custom lifetimes, throwing events/allocators, instrumentation, ABI,
invalid/reentrant inputs, other segment mutation contracts and full Calc columns,
documents/browser remain gaps. Whole-module/default/QA flags stay false.
Source-shaped owner, full container observer and native caller files retain their
original responsibilities below the 1000-line hard limit. Cycle 2, task 6/10 follows
the full validation in task `202610092130-FMVJ21`.

## Shared SoA empty insertion

Task `202610100003-CBBFHZ` ports original plain/hinted `insert_empty` and
`insert_empty_impl` in the existing shared container. Zero length returns end
before lookup or cached hint access; positive-length errors preserve original
source diagnostics. Inserting into an empty block expands it, and insertion at
a data block start expands a previous empty block or adds empty metadata.

Interior insertion creates two slots, creates/acquires an empty typed payload,
then copies the smaller side. Equal sizes follow the original upper-copy path.
The lower-copy branch resizes existing data; the upper-copy branch erases copied
values, swaps metadata slots and restores the original position. Actual shared
block funcs, three vectors, iterator/hint lookup and trait-selected position
adjustment retain their responsibilities. Original `is_previous_block_of_type`
uses the existing explicit borrowed-store member-body convention in
`main_def.ts`; there is no alternate insertion engine or category owner. A
caller-only private bridge invokes its unchanged native body over every standard
category, including empty, without rewriting the original algorithm.

Unchanged-header native callers retain all 7600 earlier complete sequences.
Added all 12 standard scalar families include every bounded position of several
compound geometries and varied-value payloads, unequal/equal split sides,
ordinary/own/foreign/returned hints, long metadata shifts, exact zero-length and
invalid-row guards, copy isolation, reappend, release and final destruction.
Full values/capacities/ownership/metadata/events/endpoints/equality and returned
iterators are compared; forwarding original assignment observes exact source
size, offset and count. Actual native public set only prepares input and is not
certified as ported. Portable fixture tests require neither compiler nor upstream.

Complete native result fields, equality matrices and event logs are losslessly
interned alongside complete owner snapshots. The decoder restores every field,
including final destruction logs; raw original output and all caller sequences
are retained. This removes redundant storage after default formatting and JSON
import limits were observed, without changing algorithms or test criteria.

Scope remains finite initialized unmanaged no_trace/default execution.
Managed/custom/throwing/ABI/instrumentation, invalid or reentrant native inputs,
positive hinted lookup with empty metadata, overflow/unbounded storage and the
remaining segment mutators and full Calc documents/browser remain gaps.
Whole-module/default/QA flags stay false. Source-shaped owner/observers are
reviewed below the 1000-line hard limit. Cycle 2, task 7/10 follows fullFMVJ21.

## Shared SoA whole-block emptying

Task `202610100029-0KZNG5` ports original private `set_whole_block_empty`
and `is_next_block_of_type`. The body uses the existing explicit borrowed-store
member convention in `main_def.ts`, borrowing actual metadata, event handler,
registered block funcs and iterator parent. Original
ownership, callback and iterator modules are reused.

With overwrite false, the typed payload is resized to zero before original
release/delete/null. With overwrite true, release/delete observes its original
size. After deletion, original previous/next predicates choose between merging
both adjacent empty blocks, the previous only, the next only or neither. The
original sizes, metadata erase counts and returned iterator indices are retained;
logical size, surviving positions and metadata capacities are not normalized.

Unchanged-header private bridges invoke actual original methods. All 12 standard
families cover every nonempty block in several compound and varied-value inputs,
41-block metadata, both overwrite choices, repeated merges, copy isolation,
returned hint reuse, reappend, release and final destruction. Complete lossless
native records retain all 13432 previous sequences and their final events.
Original next-category calls cover every standard category and empty across
valid first/middle/last blocks. Native public set prepares inputs only.

Public set_empty and remaining range mutators, managed/custom/throwing behavior,
invalid native inputs, reentrancy, overflow, instrumentation/ABI, complete original
QA/module/default and Calc column/document/browser parity remain unverified.
The capability is implemented within this scope; whole parity flags remain false.
Source-shaped main/main_def, native caller and complete observer retain existing
responsibilities below the 1000-line hard limit. No new upstream suspicion has
been established. Cycle 2, task 8/10 follows fullFMVJ21.

## Shared SoA range emptying

Task `202610100046-PKFGQY` implements original plain/hinted `set_empty` and
complete `set_empty_impl`, single/multi-block and `set_new_block_to_middle`
bodies. The public owner supplies actual fields to the existing explicit
borrowed-member convention in `main_def.ts`. Actual shared block funcs,
metadata, event/delete/neighbor helpers and iterator parent retain their roles.

First-row lookup precedes reversed/end validation, preserving original pinned
1171/1186/1935 diagnostics. Already-empty single blocks return unchanged; whole
blocks reuse original emptying. Top/bottom overwrite and erase precede adjacent
empty extension or insertion. Multi-block mutation retains first/last/interior
ordering, boundary empty extensions, deletion/metadata erasure and returned
index. Original logical size is unchanged throughout.

Middle split inserts two slots and acquires a size-zero typed owner before
assignment. It copies the smaller side, choosing upper copy on equality, then
conditionally overwrites the emptied cells before resize or erase/slot swap.
Positions recalculate afterward. Splitting empty metadata retains the original
three temporary adjacent empty blocks without normalization.

Genuine unchanged-header public and private callers compare every complete
native field across all 12 standard unmanaged families. Selected compound and
varied inputs cover every finite valid inclusive range with overwrite true and
false. Valid own/foreign/returned hints, long metadata, guard ordering, copy
isolation, reappend, release and final destruction are observed. All 15076 prior
complete sequences and final logs remain unchanged. The new native input module
owns only this operation-group enumeration; it supplies no runtime algorithm,
expected results or replacement observer. Native public set prepares inputs only.

Complete owner records losslessly intern their full metadata, payload and
endpoint arrays, in addition to existing complete result/equality/event tables.
The decoder restores every original field. This removes redundant storage after
ordinary formatting exhausted the default heap, retaining all caller inputs,
complete original raw output, prior-prefix states and native lifetime records.
Ordinary default-heap formatting and full raw record comparisons pass.

Managed/custom/throwing outcomes, ABI/instrumentation/reentrancy/invalid inputs,
overflow, public range release and remaining set/range insert/transfer/emplace,
complete original QA/default/module and Calc column/document/browser parity
remain unverified. Capability implemented within this scope, whole flags false.
Source-shaped owners and shared full observer remain below the 1000-line hard
limit. No new upstream suspicion established. Cycle2task9/10 follows fullFMVJ21.

## Shared SoA public range release

Task `202610100109-QQ0KPB` adds original plain/hinted `release_range` from
`main_def.inl` 3782–3808. First-block lookup retains exact 3790/3805 diagnostics
before reversed/end validation. The actual shared `set_empty_impl` runs with
`overwrite=false`; logical size and original empty iterator remain unchanged.
No alternate range engine or scalar overwrite is introduced.

Existing original clear, whole release, destructor and new-cell store/event
bodies now retain their native `main_def` source boundary under the established
explicit borrowed-fields convention. Actual owner declarations remain in main,
including private new-cell and public lifetime witnesses; actual logical size
resets occur only after clear/release return. Destructor uses positions.size
and does not clear metadata or reset size. All original deletion, size-zero
resize, callback, null-failure, installation and append order is preserved.

Genuine unchanged-header native callers compare all 12 initialized unmanaged
families, every valid inclusive range of selected compound/varied geometry,
valid own/foreign/returned hints, long metadata and exact guard ordering.
Complete payload/capacity/metadata/owner/iterator/equality/events and actual
forwarded block operations are observed; copy, reappend, clear, whole release
and destruction retain the complete 28204-sequence prior prefix. New input
module only enumerates native callers, with the common full observer reused.

Managed/custom/throwing outcomes, ABI/instrumentation/reentrancy/invalid inputs,
overflow/unbounded storage, scalar release and remaining set/range insert,
transfer/emplace, full original QA/default/module and Calc column/document/UI
parity remain gaps. Implemented capability has all whole parity flags false.
No new upstream suspicion established; source behavior is preserved.
Cycle 2, task 10/10 includes the scheduled full suite and portable verification
with upstream absent and exact restoration. Writer-only coverage shortages,
if any, retain the user-directed exception without repair in this branch.

The complete native observer is shared by three independent original operation
groups: lifetime/query/navigation/size/append/erase/empty insertion, range empty
and middle split, and public range release. Every complete case and final event
is retained. The scheduled full run exposed a 31.8-second aggregate timeout;
grouping follows these original operations while preserving the existing
30-second per-test budget, fixture, assertions and coverage gates.

## Shared SoA scalar release overloads

Task `202610100153-570FFF` ports original `release_impl` from
`main_def.inl:1474-1495` and public scalar `release` from
`main_def.inl:3624-3737`. All three original overloads are available: typed value
return, borrowed output reference, and hinted output reference. Explicit shared
callbacks select the erased native type; `{ value: T }` borrows the original
output slot. First lookup retains diagnostics3631/3670/3711 before assigning
the output. Empty blocks assign the original typed default and return their
iterator; filled blocks assign the scalar before shared single-block emptying
with overwrite false. Logical size remains unchanged.

Original insert-empty, merge and position overload dispatch bodies reside in
`main_def`, borrowing actual fields and invoking the actual original private
insertion member. The owner retains all logical-size assignments. Position
selects its fixed diagnostics from actual mutable/const iterator aliases.
No second container or Calc-specific copy is introduced.

The genuine full-header C++ driver calls all three typed public overloads.
Its input-only module enumerates all12 standard families and every row of
selected5/11/13/17/41cell geometry. Own/foreign hints, cached returned hints on
empty and nonempty cells, copy isolation, repeated empty defaults, reappend,
destruction and size/uint64max/plain moved-empty guards are observed. Every
prior35740 complete native sequence and284896 full states remains in the
corpus. Complete native values, output/iterator results, operations, ownership,
payloads, capacities, metadata, endpoints and event logs remain portable through
the existing common decoder and observer.

[CALC-031](calc-upstream-suspected-issues.md#calc-031-hinted-scalar-release-reads-empty-metadata-before-its-row-guard)
records the independently reproduced original hinted-empty-destination native
undefined behavior, even with a valid foreign hint. The implementation preserves
the lookup order; native UB has no defined portable expected result.

This is cycle3 task1/10. The user requested a full suite now and a goal pause
after its results are handled, overriding the next scheduled task40 run. Whole
contract/behavior/default module parity remains unverified. Managed/custom/
throwing, instrumentation/ABI, reentrant/invalid/unbounded/overflow inputs,
remaining set/range insertion, transfer/emplace, complete original QA and Calc
column/document/browser UI remain pending.

Captured data is organized by original operation family: the original container
corpus retains35740 sequences, and the scalar-release corpus adds7992. Both
use the same full-field interner and the same decoder/observer with an explicit
corpus argument. This keeps ordinary defaultheap formatting and import practical
without dropping inputs, fields or assertions; raw native output remains one
complete original run. Exported original insertion/merge helper responsibilities
also have explicit internal-operation inventory records.

## Shared OUString and SharedString value owners

Task202610101521-5TVQA9 adds the actual shared SAL C++ header owner at
`sal/inc/rtl/ustring.ts` and the single SVL compiled SharedString class at
`svl/source/misc/sharedstring.ts`. Its original header reexports that class.
SVL uses the original SAL library dependency declared in `svl/Library_svl.mk`;
Calc and Writer reuse these owners rather than separate string models.

The bounded OUString dependency closure includes original literal/static data,
default/raw/copy/UTF16/no-acquire construction, runtime move construction,
copy/move assignment, destruction, clear and direct getters. C++ default empty
data carries static-only0x40000000 flags and differs from the C API empty.
Move construction resets the source through the C API; move assignment swaps
the two pointers. Explicit move factories and destructor calls represent C++
rvalues and deterministic lifetime in JavaScript. Numeric constructor input
witnesses sal_Unicode; native int/nullptr overload deletion, template/layout and
constant-expression rules remain compiler checks, with original rejected callers
captured separately.

SharedString retains both nullable original/folded fields, all original
construction/assignment/destructor operations, pointer getters, validity,
empty/length predicates, original-only equality and the original empty singleton.
Const references expose queries without destructor/assignment APIs.
OUString::unacquired borrows the actual pointer field: a held view follows later
assignment and move. Stable WeakMap-backed views perform no ownership work.
A null getter returns the original static EMPTY_STRING reference; a held live
field reference subsequently becoming null remains a null pointer, not a new
empty value. Accessing its length is original undefined behavior.

The native probe compiles full unchanged original OUString/SharedString headers,
the complete SharedString source and31 unchanged RTL dependency scopes.
Thirty-two full pinned source/header/configuration blobs are verified.
All4424 complete initialized owner/view/pointer/allocator/data observations are
recorded without selecting fields or dropping calls; the valid capture also
passes ASan/UBSan with identical output. Two original runtime assertions,
three compile-time constructor rejections and three separate original invalid
lifetime diagnostics have no fabricated post-UB golden values.
The prior3336 RTL snapshots and20 guards retain their exact driver and output
digests after moving source extraction into a common probe helper.

[CALC-034](calc-upstream-suspected-issues.md#calc-034-sharedstring-self-move-can-retain-freed-data)
records the original self-move ownership hazard without adding a guard.
Complete OUString conversion/search/formatting/append algorithms, native ABI,
const/compile-time enforcement, concurrent/native physical memory semantics
and full original QA remain unverified. Actual SharedStringPool, typed cell
payload/storage mutation, column/table/document and editable Calc UI remain
the next downstream dependencies. This is task4/10 after full task31; the next
scheduled whole-suite run is task41.

## Original shared Unicode comparisons and cached pool key

Task36 (`202610101555-J73K9F`) extends the existing shared SAL header owner
with original normal/reverse comparisons, length-before-pointer equality,
relational operators and the signed32 polynomial hash. `OUStringHash` retains
the actual signed32-to-size_t cast as unsigned64 `bigint` on the verified native
target. Other native widths remain unverified.

`svl/source/misc/sharedstringpool.ts` owns the original private `StringWithHash`
struct and its cached hash functor. Its by-value constructor moves the argument
into its sole owned string before calculating the cache. Explicit rvalue
factories and destructor calls represent C++ value lifetimes. Implicit copy,
move and assignment retain original member order; they copy the cache rather
than recompute it. Equality first checks the cached hash, then the actual string.
The shared SAL data/refcount owners are reused by both applications.

`scripts/rtl-string-key-native-probe.mjs` compiles the complete pinned C++
headers and unchanged complete original key/hash scope with32 full source blobs
and32 dependency scopes. Its8143 calls capture complete initialized owner/key
pointers, caches, refcounts, lengths, capacities, logical UTF16 units, terminators,
allocation/free events and signed/unsigned comparison/hash results. Inputs
include real hash collisions, embedded NULs, isolated surrogates, negative hashes,
by-value rvalue construction, memberwise copies/moves and self assignment.
The valid capture also passes ASan/UBSan with identical full output. Original
null-field hashing is diagnosed separately; no post-UB portable result is invented.

Shared native header configuration and full lifetime dependency extraction are
factored into `rtl-ustring-native-sources.mjs`. The earlier SharedString driver
remains `164be221` with4424 states,2 runtime guards,3 compile guards and3 invalid
lifetime diagnoses; the prior RTL ownership driver remains `44ad48ef` with3336
states and20 guards.

The original locale-aware `CharClass` service remains required before the actual
SharedStringPool can be ported. Its UNO/i18npool/i18nutil Unicode casing pipeline
is not replaced with JavaScript casing. This task adds no substitute pool, actual
Calc cell store, column/document or editable UI. Shortened/string-view template
comparison overloads, remaining OUString algorithms, native ABI/concurrency and
complete original consumer QA remain unverified. This is task5/10 since full
task31; the next scheduled full run is task41.

## Complete shared RTL character contracts

Task37 (`202610101620-25HQ9X`) ports the complete runtime owner from original
`include/rtl/character.hxx` into shared `sal/inc/rtl/character.ts`. Its22
functions and four detail constants preserve Unicode/scalar/surrogate predicates,
ASCII-only classification/conversion/comparison, ordered assertions and UTF16
split/combine semantics. Scalar detection short-circuits before validating a
surrogate; splitting a BMP point writes only the first output slot.

Original integral sal_uInt32 conversion is explicit at the JavaScript numeric
boundary. A readonly named object represents the original detail namespace;
Uint16Array represents the caller's valid output pointer storage. Native deleted
char/signed-char overloads and constant-expression/type/physical pointer rules
remain separate original compiler evidence, not synthetic runtime guarantees.

The original i18nutil casefolding owner directly depends on these functions.
This adds the actual shared decoding dependency required before its real
locale-aware service and SharedStringPool can be connected. It provides no
JavaScript Unicode casing replacement, fake CharClass or document model.

`scripts/rtl-character-native-probe.mjs` compiles the entire unchanged original
header with7 pinned full header/config-template blobs. It captures24 initialized
fields for all1114112 codepoints, including every1048576 supplementary point
and surrogate pair. Full native output is106954752 bytes, SHA256
`3ac04bb39846c8a0a4682442d1bdf7be9b3a45976a2fb295846b6012b0424511`.
A generic2082-run neighboring-delta encoding restores every original byte;
portable acceptance compares every field and the complete raw digest. It also
checks67300 ASCII-byte/cross-boundary comparisons, UInt32 conversion witnesses,
four constants,25 original runtime assertions and24 original rejected char
overloads. ASan/UBSan gives identical defined outputs. The original UTF32-buffer
consumer QA reference remains distinct from the generated header caller corpus.

Invalid physical pointers/undersized output, nonintegral or unsafe JavaScript
inputs, native ABI/template/constant-evaluation enforcement and complete original
consumer QA remain unverified. Actual CharClass/UNO/i18npool/i18nutil/ICU78.3,
SharedStringPool and Calc cell/column/document/editable UI owners remain required.
This is task6/10 since full task31; the next scheduled full run is task41.


## Native JavaScript Unicode correspondence before ICU implementation

Task38 first compares the actual pinned ICU78.3 scalar dependency with native
JavaScript, following the explicit native-first user requirement. The complete
[comparison report](calc-native-unicode-conformance.json) retains both measured
engines, every mismatch, original source/archive/driver/output hashes and the
original LibreOffice table-mask predicate determining fallback reachability.

All1,114,112 codepoints are tested, including surrogate codepoints. Node24.13.1
(ICU78.2, Unicode17) and real Chrome154 give identical observations. Native
`toLowerCase()` plus conversion to its first complete result codepoint agrees
with original scalar lowercase everywhere in those engines. Unadapted lowercase
expands U+0130 and has one mismatch; original LibreOffice tables intercept it
before either lower fallback. Native whole-string uppercase has102 mismatches,
including27 actual LowerToUpper fallback cases. Uppercase as a titlecase
candidate has160 mismatches, including77 actual ToTitle fallback cases.
Lowercase as a case-fold candidate has198 mismatches, including184 actual
SimpleFolding and181 actual FullFolding fallback cases. The standard native
interfaces have no direct scalar titlecase or Unicode case-fold mapping API.

The scalar lowercase adapter now uses native JavaScript after signed32 conversion
and original invalid-input identity handling. The uppercase, titlecase and fold
contracts retain the actual source algorithms, frozen UTrie2 and exception slots. No whole
ICU library is required by this evidence. Other engine/Unicode versions and
actual complete locale-aware string services remain unverified; the selected
native implementation must keep exhaustive pinned source-free replay tests.
The native capture includes71,303,168 raw bytes, original trie/exception index
observations,669 populated exception-slot values and pointer positions, signed
out-of-range inputs, folding option masks and all original generated data.
ASan/UBSan outputs agree completely. Another2,048 valid generic slot callers
verify both single- and double-word macro contracts without modifying original
generated data. Complete generated arrays, singleton fields and shared array
offsets remain in their original owners. Header modules retain their native
header discriminator for separate browser module resolution.

Portable checks run with all original-source links absent: Calc106 tests
pass with100% Istanbul coverage (2,920 statements,2,055 branches,474 functions,
2,564 lines). The affected shared dependency passes3 exhaustive tests with100%
coverage (116 statements,64 branches,20 functions,106 lines); every raw counter
is positive, including all executable source owners. The public header module
only reexports original delegates and has no executable coverage statements.
Twenty-eight affected tooling tests and type, documentation, lint, dependency,
source-tree, source-provenance and scoped inventory checks pass. Calc inventory
contains50 capabilities/181 modules including shared dependencies; shared has
27 capabilities/151 modules, both with zero semantic violations. Broad contract,
behavior, default and ownership parity remain unverified. The full run remains
scheduled for task41.

This closes a scalar dependency, not the real locale-aware string service or
SharedStringPool. The remaining UI prerequisite path is actual string mapping
and pool, typed cell storage in ScColumn/ScTable/ScDocument, document edits with
notifications and undo, then the Calc view/input adapter. Existing Writer/shared
owners are reused wherever upstream shares them; editable sheet UI is not yet
ready to connect.


## Locale value ownership and original case-mapping data

Task39 is in progress. The actual udkapi Locale.idl defines exactly three string
fields in order: Language, Country, Variant. The shared Locale value owner reuses
OUString for all fields and follows the cppumaker plain-struct constructor and
comparison contract, with explicit adapters for compiler-generated memberwise
copy/move/assignment and reverse-order destruction. It preserves exact UTF16
values, embedded zero units and case-sensitive language codes. IDL documentation
does not cause the value struct to validate or normalize BCP47/country strings.
UNO runtime type reflection and native generated-class correspondence remain
unverified; this owner is not a fake locale service or CharClass replacement.

The full original casefolding header flags and source arrays are present in their
actual i18nutil owners:256 signed indices,3328 type/value structs,352 three-unit
extra mappings, MaxCaseMappingExtras3 and NMAPPINGMAX3. The source extraction
helper verifies all full pinned IDL/cppumaker/header/data blobs and the complete
normalized data SHA730303b65854039af4ee7078aa78f04c5e002c53d9eac0babe8bc36a95b11dc1.
It is source data evidence; it does not execute cppumaker or original native
casefolding. Six source-contract tests pass with original source links absent,
with100% coverage across all three executable owners:46 statements,7 branches,
16 functions and46 lines. No broad parity or original QA port is claimed.

The getValue/getConditionalValue algorithms, real default UNO exception boundary,
native correspondence and remaining task39 gates are still required. No
placeholder function/service is connected to the core, and SharedStringPool,
ScColumn/ScTable/ScDocument and editable Calc UI remain pending. The next full
run remains scheduled for task41.


Task39 also adds the original internal cased_letter predicate and all ten
conditional const Mapping arrays at their actual casefolding.cxx owner. All21
structs retain type, signed count and the three initialized UTF16 words. The
predicate uses the original table index and CasedLetterMask; it adds no Unicode
category heuristic or locale normalization. Exports of translation-unit
internals support ESM ownership and adjacent replay tests; the public header
still declares only the implemented flags/struct layouts.

`scripts/casefolding-character-native-probe.mjs` compiles the complete unchanged
original arrays/macros/predicate interval and genuine full SAL/i18nutil/o3tl
headers. It verifies13 full pinned blobs and retains every65536 UTF16 result,
six original integral-conversion callers and every field of all21 structs.
Complete native output is524288 bytes with SHA256
`1c92a8b377f318e5e88c2cd7de18a7524f71aee66dfa643fe7f3a2bc3e72f917`.
Actual ASan/UBSan output is identical for all three corpora. No generated Locale,
UNO exception, getValue or getConditionalValue is instantiated/executed by
this primitive probe; these remain required by the active task39 contract.

Eight source-contract/native-replay tests in three files pass without all three
original source links. Four actual executable owners have S66/B9/F19/L65
all100%; every raw counter is positive. Original source links are restored
exactly. The corrected four-file boundary/provenance/runtime/registry tooling
selection passes30 cases; it supersedes an earlier three-file selection that
included a nonexistent test filename. New original udkapi/i18nutil roots now
have explicit allowed shared dependency directions and the existing protected
browser/worker/storage restrictions. Task39 remains in progress, with full
algorithm/default-exception/native generated-type work pending. Next full41.


## Original shared ASCII literal equality for locale codes

Task39 extends the existing SAL C wrapper/header and OUString header owner with
rtl_ustr_asciil_reverseEquals_WithLength and equalsAsciiL. The original langIs
macro's literal operator uses this method. It preserves length-before-read,
back-to-front comparison, embedded NUL and borrowed storage without case/locale
normalization or new bounds repairs. Uint8Array represents original char bytes;
original signed32 and selected signed-char conversion are explicit. No separate
Calc comparison, string allocator or temporary locale service is introduced.

`scripts/rtl-ascii-equality-native-probe.mjs` compiles complete unchanged original
equality/lifetime scopes and full genuine OUString headers, verifying31 pinned
full blobs. Both C and header methods are observed for all8,388,608 pairs of
UTF16 units and original ASCII0..127 bytes. Complete output is16777216 bytes
with SHA2565780cb29bd8009a2b1044d5b5f6666b2be0b6ed56b871e89c03551ee250fc0a5.
Another337 complete observations retain prefix/offset/null-zero inputs, actual
lt/tr/az literal operators, borrowed results, pointer/refcounts and unchanged
caller buffers. ASan/UBSan outputs are identical for both corpora. Original
negative-length assertion SIGABRT is captured separately. Logging, invalid
storage/ABI, unsigned-char targets and non-ASCII byte warnings are unverified.
The related original process getGlobalProcessId_002 QA reference is not claimed
ported or executed.

The first portable run correctly fails when Vitest deep Buffer comparison
exhausts its heap; the fixed test compares every byte with Buffer.equals, keeping
the same complete corpus/digest and100 thresholds. All18 tests in8 related
string/case/Locale files pass with all original links absent. Thirteen executable
owners have S516/B229/F120/L431 all100; an independent audit confirms every
raw statement/function/branch counter is positive. Fresh Calc coverage passes
106 tests in24 files, S2920/B2055/F474/L2564 all100, with all original source
links absent and restored exactly in finally. The serial metadata/tooling gates
pass after documenting an assertion callback:30 affected tooling tests, strict
source and boundary checks, shared/Calc inventories with zero semantic
violations, routing and doctor (zero errors, two inherited warnings).

This completes the literal-equality dependency only. Native generated Locale,
true UNO exception/reference boundaries, complete getValue/getConditionalValue,
CharClass/SharedStringPool and document/edit/UI remain required; task39 stays
DOING. This is still the eighth active task after full31, with next full41.


The task39 native type dependency build is now reproducible via
`node scripts/casefolding-native-types.mjs --compile`. It compiles21 true
cppumaker/codemaker/unoidl/SAL-helper translation units, including the genuine
legacy provider and parser/scanner generated from unchanged Bison/Flex grammars.
The compiler dependency manifest verifies112 full pinned LibreOffice blobs and
the cached Boost/mdds archives against original download.lst. All original
class declarations and method bodies are compiled unchanged. This is object
compilation evidence only: direct linking still needs real SAL/OSL/registry
library owners; generated Locale/UNO headers and native case mapping execution
remain pending. The helper adds no native substitute class or application
runtime dependency. Related type/lint/JSDoc/size/format/routing/doctor checks
pass; task39 remains DOING and the next full run remains41.


Task39 now supplies the complete original generator build through
`node scripts/casefolding-native-types.mjs --generate`. It compiles105 genuine
translation units and links the unchanged cppumaker entry point with actual
SAL/OSL, registry/store and SAL-helper owners. All336 full LibreOffice compiler
inputs/build rules and cached original Boost/mdds/dragonbox/fast_float archives
are verified; system zlib and macOS Foundation/CoreFoundation are the selected
native platform dependencies. Native artifacts remain ignored.

The original generator consumes byte-for-byte copies of the five pinned IDL
files through its actual SourceTreeProvider, emitting ten genuine Locale,
Exception, RuntimeException, XInterface and TypeClass headers. No handwritten
class or provider facade is used. Relative input-path handling initially
failed; exact local file URLs preserve the actual conversion contract. A large
CNS table initially exceeded the source verifier's default subprocess buffer;
the verifier now compares every byte using capacity derived from full blob
length, retaining strict equality and hashes.

A native caller using the generated Locale header observes original empty
fields, shared-string copy identity, empty moved-from fields and memberwise
move-assignment swaps. A native default RuntimeException caller links actual
cppu static_types/typelib owners and observes an empty message, null Context
and the registered RuntimeException type name. These bounded observations do
not certify portable UNO reflection or full locale-aware case mapping.
RuntimeException's original constructors call UnoType::get; that registration
side effect must be retained with the true dependency owner. Full source
getValue/getConditionalValue, portable exception/type/reference owners and
sanitized complete mapping correspondence remain required. Task39 is still
DOING; editable Calc UI is not ready. Next full run remains41.

## Genuine original locale-aware case-value reference

Task39 now provides `scripts/casefolding-native-probe.mjs --write|--check` and
the committed `native-casefolding-value-cases.json`. It compiles the complete
unchanged interval containing all conditional arrays, macros, cased_letter,
getConditionalValue and getValue, with genuine original full headers/data,
original generated Locale/RuntimeException and their actual CPPU type owners.
The original ICU scalar bodies/macros/full Unicode data supply the native
reference. This does not change task38's native-JS decisions for the portable
runtime.

All 67 genuine SAL and both required CPPU compilation units are rebuilt for
normal and ASan/UBSan callers; the mapping, ICU and generated header bodies
are instrumented too. Complete pinned LO blobs, original generated header
hashes, actual configuration templates and verified ICU/Boost/dragonbox/
fast_float archives are retained. Platform frameworks/libc are uninstrumented;
full platform, ABI, thread/type-cache and consumer contracts remain unverified.

Native observations cover all 1,114,112 Unicode code values in ten mapping
modes (11,141,120 rows), all 1,048,576 paired-surrogate second positions, and
1,038,336 conditional/value calls: 26 fully initialized caller contexts,
13 characters, 12 exact language values and all 256 mapping-bit combinations.
Contexts include embedded-zero/case-sensitive language values, original
Lithuanian pos>len witnesses, adjacent sigma/dot cases, explicit buffer
terminators, accent boundaries and independent declared lengths. They do not
certify every possible string, position or mode domain.

All 21 conditional Mapping references are observed through actual array
identity. Every conditional/value call retains all Mapping fields and the
native value-copy/input-preservation observation. Genuine default UNO
exceptions occur 239,616 times in direct conditional calls and 3,744 times
inside getValue: actual empty Message, null Context and the original registered
RuntimeException type name are observed. No native Locale/UNO/ICU stand-in or
portable JavaScript Error substitutes this evidence.

Normal/sanitized outputs match all 521,895,936 bytes. Each of the three raw
SHA256 digests is preserved; signed row-field differences plus gzip retain
every observation and are reconstructed byte-for-byte before fixture writing
or checking. The compact fixture is about 2 MB. CALC038 separately records the
actual sanitizer bounds failure for U+1E9E with standalone internal NotValue;
that undefined read has no portable expected value and is excluded from the
defined full-code corpus without changing the original function.

Shared inventory records the new native reference and keeps every broad parity
flag false. Portable getValue/getConditionalValue, genuine default UNO
exception/reference/type registration, service/CharClass/SharedStringPool and
actual cell/column/table/document/edit/UI remain required. Task39 remains
DOING; no full task verification, consumer QA or editable-UI readiness is
claimed. The scheduled full test run remains task41.

## Original UNO type comparison dependencies

Task39 adds the actual C typelib TypeClass and independently generated UNO
TypeClass declarations, the complete common C type-reference/description
records, the original really-weak classifier and source-owned const reference
equality. These are required original dependencies of the unfinished default
UNO exception/type boundary. They introduce no guessed record constructors,
type factory, allocation, registry, reference lifecycle or service facade.

The SAL dependency adds the genuine terminated Unicode comparison at its
original template/source/C-header boundaries. It retains the selected native
unsigned-unit difference and prefix magnitudes, zero termination and null
pointer assertions; known-length comparison remains its separate owner.
The classifier identifies only INTERFACE_METHOD and INTERFACE_ATTRIBUTE as
really weak. Interface and exception classes are not classified as weak.

The new native probe compiles all67 original SAL and both required CPPU units
in normal and ASan/UBSan modes, using genuine full headers and the actual
generated TypeClass. Native capture retains all33 enum values,262144 Unicode
witness pairs and123904 fully initialized public C record comparisons with
name/type count preservation and both-null identity. All347 full pinned source
blobs and output hashes are retained. These initialized records are genuine
const predicate inputs, not replacements for the original runtime allocators
or registry. The shared build helper verifies ICU inputs, but this caller
does not compile or link ICU code. CALC-039 records equal-length names with
different suffixes after embedded zero; original behavior is preserved.

`node scripts/uno-type-primitives-native-probe.mjs --check` reproduces every
captured byte and provenance field. Portable tests replay every captured byte
without a deep Buffer assertion. With all three original source links absent,
Calc106 tests/24 files retain19 executable owners S2920/B2055/F474/L2564 all100;
the affected shared closure22 tests/9 files covers17 executable owners
S601/B247/F126/L510 all100. Every raw statement/function/branch counter is
positive, and formatting leaves the genuine native caller byte-identical.
Complete portable type allocation, common-prefix pointer aliasing,
registration/acquire/release, Type/Reference/Any/default RuntimeException,
getValue/getConditionalValue, service/CharClass/SharedStringPool and Calc
cell/column/table/document/edit/UI remain required. Task39 remains DOING;
this bounded dependency does not establish editable-UI readiness.

The user requested a pause after the next scheduled full run at task41.
After that run, repair Calc/affected shared failures, leave Writer-only
coverage gaps for its separate branch, record the result and pause the goal
before further implementation.

## Original OSL atomic counts and extended type declarations

Task39 adds the real shared OSL signed32 interlocked count functions and their
C-header/internal-macro boundary. Native JS Atomics.add/sub supplies the atomic
operation; its previous value is adjusted and narrowed to signed32 to retain
the original operation's own return, including overflow. A later atomic load
would introduce a return race and is not used. Concrete Int32Array views retain
the addressed byte offset and neighboring cells. Ordinary ArrayBuffer storage
works for single-realm counts; the runtime does not construct or require a
SharedArrayBuffer. Shared counters can use one when the environment permits.

The genuine native caller now retains all16 return/storage fields for65556
diagonal/boundary count inputs through both original public C functions and
internal macros. Four original4-thread4096-call captures preserve all65536
adjusted returns, signed-boundary crossings and complete neighboring storage.
Normal and ASan/UBSan outputs agree. Portable workers load the actual authored
OSL module, retain every return, and require each worker's terminal exit.
This does not establish browser cross-origin isolation or full concurrent
CPPU registry ownership.

The complete extended typelib C records, initializer records, callback type
and deprecated five-field Uik are declared at their original header owners.
Every original field/typedef and genuine compiler size/alignment/offset/member
size observation is retained for15 full records. The original allocator uses
new char[sizeof(T)]; unspecified bytes are not read or assigned invented
defaults. Header declarations and native layout observations do not provide
the unfinished allocator, shared-prefix pointer aliasing, registration,
refcount lifecycle or portable native ABI.

The actual UNO default exception/type owners and getValue/getConditionalValue,
locale/string service/pool, document/edit/view/UI remain required. Task39 stays
DOING. The next full suite remains task41, followed by required Calc/shared
repairs and the user-requested goal pause; Writer-only coverage remains excluded.

## Original CPPU type registry ownership

Task39 implements original empty type allocations, common-prefix field/counter
ownership, acquire/release, complete specific-member destruction, name-only
reference lookup/creation, callback order and duplicate removal, registration,
identity-preserving specific-field transfer and late completion, on-demand
retention and the original256-entry typedef callback cache. Public C exports
stay at the original header boundary; internal newEmpty/getByName stay in the
source owner. Original completion/getDescription/full factories/static types
and Type/Any/Reference/default exception owners remain required and unfinished.

Each browser allocation has canonical typed views sharing its original atomic
signed32 count and common fields. Reference pType aliases description pSelf;
sequence's specific pType remains a separate slot. The nested aBase prefixes
identify the same allocation. Only actual original initialization writes are
ported; uninitialized positions/flags/Uik fields are absent. Actual specific-byte
memset during registration supplies its original zero values. Storage becomes
eligible for browser garbage collection after its owners are released. Full
native pointer ABI, cross-thread registry synchronization and singleton shutdown
remain unverified. Registry accesses are synchronous within one browser realm.

The true native probe calls unchanged full SAL/CPPU owners, genuine public and
internal headers, and original allocators. It retains all initialized fields,
name/type reference counts and identity witnesses after each operation, including
complete specific ownership graphs, late enum/compound/interface completion,
callback duplicates/misses/aliases, replacement output slots and256-entry cache
eviction. Normal and ASan/UBSan results must match byte-for-byte. Uninitialized
native fields and freed pointers are never read. Initialized counter-zero and
empty weak-pointer state witnesses exercise original safeguard branches;
they do not establish actual interleavings or ordinary user-level reachability.
Original cppu/qa/typelib.cxx tests are related references only; full static-type
and completion providers are still needed to port/execute them unchanged.

Calc and affected shared owners retain the100% coverage requirement with all
original source links absent. Native/provenance checks run with links restored.
The next scheduled full application run remains task41; fix Calc/affected shared
failures, leave Writer-only coverage for its branch, then pause the goal as the
user requested. This prerequisite does not establish editable Calc UI readiness.

## Original CPPU registration invariants

Task39 also retains all21 C assertion predicates in original registration order.
Twenty initialized invalid caller descriptions are independently passed to the
unchanged native registry in fresh processes. Each stops at its corresponding
original assertion with SIGABRT and no returned value or stdout; complete
diagnostics match in normal and ASan/UBSan builds, before any sanitizer finding.
Portable tests replay the same initialized inputs with a fresh registry for each
failure and compare the complete assertion expression, ignoring formatting
whitespace only. These deliberately invalid caller contracts do not establish
ordinary user-level reachability.

The retained-count assertion is satisfied by the original getByName acquisition
in valid ownership traces. Its invalid concurrent interleaving is not fabricated
for a synchronous browser realm. Private callChain receives an actual non-null
fresh empty output slot from its sole current caller, satisfying its two C
preconditions by construction. Debug-only OSL_ASSERT diagnostics are separate.
Browser Error adapts the fatal C assertion boundary; it does not establish native
process termination, recoverability or a default UNO RuntimeException owner.
Full factories/static types/Type/Any/Reference/default exceptions remain required
before locale-aware case values and their Calc string-service consumers.

## Original inherited CPPU member construction

Task39 ports complete internal copyExceptions and
createDerivedInterfaceMemberDescription. The original empty allocator, reference
counters and RTL string owners are reused. All parameter/exception arrays are
independent copies; their referenced types and names retain original acquisition
counts. Zero-length arrays remain allocated rather than null. Position/index,
oneway/readonly, return/attribute pointers and every parameter field follow
original writes. The base description is borrowed; the successful caller transfers
interface/base-reference ownership without additional acquisitions. Missing or
unsupported inputs preserve the output slot and caller ownership.

The native caller includes the complete unchanged typelib.cxx translation unit
to access its genuine private constructor, omitting only the duplicate standalone
object at link. All genuine SAL/static-type dependency owners remain linked.
Initialized original empty records are caller inputs, not replacement native
factory bodies. Full fields/counters/identity are observed before/after cloning,
source mutations and release in normal and sanitized builds. Direct constructor
evidence does not establish missing getByName consumer ownership.

The internal typelib-members.ts split stays in the original typelib directory
and preserves the public C header boundary, with an explicit filename-divergence
record required by the repository's fewer-than1000-line source limit. Complete
getByName/completion/full public factories/static types/Type/Any/Reference/default
UNO exceptions and their Calc string-service consumers remain required. Full
run41 and the subsequent user-requested goal pause remain scheduled.

## Shared bounded UTF16 search and substring ownership

Task39 extends the actual shared SAL templates, C/header boundary and OUString
owner with bounded character/view/reference indexOf, lastIndexOf and substring
copy. The native JS backend preserves exact UTF16 units, embedded zero, isolated
surrogates, logical lengths, offsets and original defaults. Empty substring
needles return -1. No ICU search implementation is needed for this contract.

Actual full-span copies acquire the original data through assign; other spans
reuse the original allocator and replacement/self-field lifetime order. The
complete native corpus records every returned offset, live refcount, logical
length, unit, terminator and identity before/after replacement and release.
All65536 character values and25 complete substring vectors produce8532312
bytes; the unchanged full original SAL/OUString dependency closure produces
identical normal and ASan/UBSan streams. Eleven original checked assertions
remain separate from returned values and map to Error with original expressions.

Invalid copy ranges are undefined by the public OUString contract. The original
NDEBUG diagnostic fallback is not certified by the checked profile. ASCII literal
search overloads, physical pointer/ABI/thread behavior and full upstream QA remain
unverified. The source StringLiterals::checkOUStringLiteral tests provide related
UTF16 search evidence, not a claim that their whole suite was executed. Original
getByName parsing/completion/factories and UNO exception/case-service consumers
remain unfinished. Full run41 and the subsequent requested goal pause remain
scheduled.

## Original bounded integer parsing for UNO type names

Task39 adds the required signed64 known-length SAL conversion and bounded UTF16
o3tl::toInt32. Original whitespace/control classification, sign handling, digit
classification, first-invalid stop, overflow-to-zero, signed32 range check and
default radix10 remain in their original shared owners. BigInt retains exact
signed64 accumulation and limits. The real C/header, radix macros and SAL signed32
limit macros are shared; no duplicated whitespace classifier or parser in Calc.

The genuine native caller includes unchanged original strtmpl.hxx and full
SAL/o3tl dependencies. It observes every UTF16 whitespace/digit predicate across
every radix2..36, original DivMod quotient/remainder/positive guard, C/o3tl
selected scalar contexts, every prefix of complete boundary/sign/control inputs
and default conversions. All returned bytes and nine original checked assertions
are retained separately. The original mutual SAL/o3tl inline-header directions
are reflected in protected module edges; browser/app dependencies remain blocked.

With explicit user approval, the dependency checker accepts only the original
two-member SAL/o3tl strongly connected component and its three exact source-path
and named-value-import witnesses. Additional bindings, other import forms, larger
components and unrelated cycles still fail. Native JS UTF16 search remains in
use; signed conversion uses native BigInt arithmetic with the original parser
rules because parseInt does not preserve whitespace or overflow behavior. No
additional runtime library is introduced.

Original terminated/byte/unsigned/template APIs, NDEBUG invalid-radix fallback,
arbitrary out-of-contract JS inputs, native ABI/thread lifetime and full upstream
QA remain unverified. The original overflow QA provides related evidence only.
Actual getByName/completion/UNO/default exception and case-service consumers stay
unfinished. Full run41 followed by the requested goal pause remains scheduled.

## Original borrowed UTF16 substring views

Task39 adds both original OUString.subView overloads to the shared SAL value and
const-reference owner required by derived-member type-name parsing. Native
Uint16Array.subarray retains exact UTF16 storage/offsets, embedded zero and
surrogate units without copying or acquiring the source string. Original range
assertions retain their order; the default overload delegates with the remainder.
The caller must keep the actual data owner alive and treat the borrowed units as
const. Views remain on the old buffer when the source is replaced and another
original copied owner still retains it. No additional string_view library is used.

The existing genuine native caller exercises both overloads over every valid range
for all UTF16 values and complete explicit inputs, with full view units and live
source/pointer/count witnesses. Checked invalid-range outcomes are separate fatal
assertion observations. No direct subView QA case was found in the available
sal/qa/rtl/strings sources; the generated native caller is separate evidence.
Native physical pointer lifetime/const enforcement/ABI, use after release,
arbitrary malformed JS inputs, invalid-range undefined behavior and full original
consumer QA remain unverified. Full getByName/type/exception/case-service work is
still required; full run41 followed by the requested pause remains scheduled.


## Original UNO type factories and lookup

Shared CPPU implements the original plain/struct/enum factories, reference
resolution and full getByName routing in its existing registry. This preserves
15 lazily registered basic types, sequence/derived member parsing, provider
callbacks, typedef resolution, and the acquired256-entry cache. Compound base
and member references, member names, copied enum values/defaults and polymorphic
flags retain original ownership. Recursive sequence members use the original
pointer-sized logical slot. Header danger-get/release contracts remain in the
original header owner. The lookup/size split keeps the source responsibility and
singleton while honoring the authored1000-line limit.

The browser retains contracts/structures/algorithms/defaults, not physical C++
object memory. nSize/nAlignment/member offsets describe the separately verified
logical LP64 UNO model; JS pointers, object byte layouts and vtables are not
claimed compatible. Exact UTF16 and observable values/counts/identities remain
covered by complete native streams. Original malformed sequence routing and
extra derived-base retention are preserved (CALC041/CALC042). The zero-count
reference guard is an initialized synthetic witness, not a concurrency test.

Full interface factories/completion/static types/Type/Any/Reference and the
actual default RuntimeException remain pending. Related original typelib and
recursion QA is source evidence only. Physical native ABI, other platform layouts,
threading/shutdown, malformed JS storage and full consumer QA remain unverified.
These dependencies do not yet provide an editable Calc document or UI.

## Original UNO type completion

The shared `cppu/source/typelib/typelib-complete.ts` preserves original `complete` and `typelib_typedescription_initTables` responsibilities. Member factories can request interface lists without recursively resolving attributes; public completion additionally creates member/function maps. Attribute resolution runs in reverse order before the already-complete guard, and writable attributes contribute separate getter/setter entries. Provider completion retains original typedef resolution, registration/identity and acquired256-entry cache eviction.

Full unchanged original SAL/CPPU dependencies provide normal and ASan/UBSan observation streams. Synthetic initialized original allocator records isolate completion and do not establish full interface/member factory or ordinary-consumer parity. Broad parity flags stay false. Native mutex scheduling, physical ABI, shutdown and full QA remain unverified. Original interface factories/static types and Type/Any/Reference/default RuntimeException remain prerequisites of the case service; Calc document/edit/view/UI remain unfinished.

Native observations cover all341 call-table compositions and260 enum completion/cache entries, plus interface-list/table and typedef success/failure outcomes. Complete streams contain53592 and40800 bytes. They also expose and correct a portable enum-factory bug: zero-count null input arrays must yield allocated empty output arrays without dereferencing the input; positive counts still copy independently. This is a portable regression correction, not a suspected upstream defect.

## Original UNO interface-member factories

The shared original `typelib_typedescription_newInterfaceMethod`, `typelib_typedescription_newInterfaceAttribute` and `typelib_typedescription_newExtendedInterfaceAttribute` now use the actual allocator, registry, list-only completion and SAL UTF16 owners. Preserve original last-colon parsing, relative member indices, oneway/readonly flags, parameter names/types/in/out flags and separately acquired method/getter/setter exception arrays. The original factory exception helper returns null for zero count; the distinct derived-member copy retains its allocated empty array. Reuse the existing internal checked C-assert adaptation for the fresh weak-member invariant.

Full unchanged original dependency observations compare initialized fields, dynamic parameter-name acquired counts, return/parameter/exception reference identity and all65536 UTF16 member-name units under normal and ASan/UBSan. Native setup calls the genuine no-base interface factory; portable initialized allocator records isolate the member factory contracts, without implementing or verifying the still-unported interface constructor. Failed wrong-kind/incomplete interface paths retain the original acquisitions; ordinary producer reachability, physical ABI, cross-thread scheduling/shutdown and full consumer QA remain unverified. Broad parity flags stay false. Original interface factories/static types/Type/Any/Reference/default RuntimeException/case service and Calc document/edit/view/UI remain unfinished.

## Original integral UTF16 formatting

Original SAL `valueOfInt` and signed32/signed64/unsigned64 C wrappers now share native JS `Number`/`BigInt.toString(radix)` after complete original comparison. Preserve signed argument widths, all35 radices2–36, lowercase digits, negative signs, terminating zero and unchanged initialized destination sentinels. The original header macro values remain33/65/65. The native caller uses independently sufficient96-unit buffers; CALC-044 records the signed-minimum binary capacity discrepancy without correcting upstream.

Full unchanged genuine SAL/CPPU dependencies under normal and ASan/UBSan produce120031 complete observations: all signed16 decimal values, type/power boundaries over every valid radix and deterministic wide inputs. The full48492536-byte stream (SHA256 `86bad3fa6dc25f7f9fb7dcf877adf89bac036acfa2d9a828458b816aa4764a17`) agrees with native JS formatting before its selection and is replayed through the real portable C declarations. Nine original null/radix assertions retain their source order and expressions as separate process diagnostics.

This is the actual formatting prerequisite for original inherited interface-member names. `StringNumber`, `OUString::number`, expression concatenation and the interface constructor remain required; C formatting alone does not certify their allocation/lifetime or macro-sized buffers. NDEBUG invalid-radix fallbacks, invalid buffers, native ABI and full consumer QA remain unverified. The task and goal stay active; full run41 then pause remains pending.

## Original lazy Unicode string expressions

The original `StringNumber`, `StringConcat`, marker and Unicode `ToStringHelper` specializations share `sal/inc/rtl/stringconcat.ts`, corresponding to `include/rtl/stringconcat.hxx`. Runtime dispatch adapts erased C++ specialization selection, while each expression retains actual borrowed operands. `OUString.number` signed32/signed64 overloads retain default radix10 and the original fixed local buffer; number construction copies its logical units. `OUString.Concat` creates the original unary marker expression, and the actual expression constructor calculates length first, allocates once and writes original left/right helpers with the final zero. Empty allocation retains the source-defined identity.

Original ASCII-uppercase strategy/range/replacement and C wrapper reuse the existing shared character owner. Borrowed output pointers are actual subarrays; no intermediate strings or independent allocator are used. Native original operands are kept alive through materialization. Tests observe full initialized local number units/zero, deferred source-owner and number changes, all UTF16 units, signed-char conversions and actual materialized payload/refcounts/empty identities. Original assertions remain separate process diagnostics.

Spare uninitialized number cells, insufficient macro-sized CALC044 binary-minimum buffers, physical ABI/lifetime/thread scheduling, native const/rvalue/template enforcement and unported C8/pointer/other literal/numeric specializations remain unverified. The unsigned64 number representation uses its actual C formatter directly; unsigned `OUString.number` overload/type witnesses are not certified. Original interface/default-exception/case-service/pool/document/edit/view/UI remain unfinished. Full run41 then user-requested pause remains pending.

### Original UNO interface factories

The shared CPPU `typelib-interface-factories.ts` now owns the original
`typelib_typedescription_newInterface`, `typelib_typedescription_newMIInterface`
and internal `BaseList` responsibilities. Public C bindings remain in
`cppu/inc/typelib/typedescription.ts`; the allocator, canonical prefix view,
registry, completion, logical LP64 size and shared SAL string owners are reused.
The source split honors the authored file-size limit.

BaseList visits ancestors before each direct base, preserving separate global
and per-direct-base uniqueness and the original member offsets. It uses actual
full-length OUString comparison and owned temporary set names. Derived names
are built through the original shared lazy StringConcat and OUString.number.
Own references and direct-base descriptions retain their original acquisition
and destruction behavior. `ppMembers` is a live interior view of the same
`ppAllMembers` storage, including both directions of in-bounds pointer writes.
The canonical weak prefix is assigned at the original late stage; default
counts, zero Uik fields, null call maps and incomplete status are preserved.

The unchanged native interface factory caller observes all initialized fields,
name units, acquired counts, output replacement, diamond order, repeated and
reordered bases, an explicitly completed empty base, all65536 UTF16 units and
source-defined failed-base retention. Normal and ASan/UBSan captures are compared
in full with the actual portable public C exports. The caller does not execute
full upstream consumer QA or prove ordinary failed-producer reachability.
Native ABI, cross-thread scheduling/shutdown and arbitrary JS array reflection
or out-of-bounds writes are outside this evidence. System libraries are
uninstrumented; original retained registries/failures are observed with leak
detection disabled. Broad parity flags remain false. Static types,
Type/Any/Reference/default RuntimeException and real case-value service remain
unfinished, so this checkpoint does not certify document/edit/view/UI readiness.

Nested-diamond observations also preserve per-direct-base deduplication and
registration into an existing canonical placeholder. The own-member view still
shares its complete array after the original raw transfer; actual public
completion produces the original member/function maps, and destruction releases
the transferred members and direct bases.

### Original terminated ASCII construction

Shared SAL now implements the original `rtl_uString_newFromAscii` and the
`OUString::createFromAscii` terminated-char overload. The existing template
length owner accepts char bytes as well as UTF16 units. Empty construction,
reference release and allocator owners are reused. Input is read to its first
NUL; positive output releases the prior owner before allocation and checks the
original ASCII range. The public C binding remains in its original header.

No-acquire value construction retains the actual C pointer, including null
allocation results. Direct owner-slot initialization adapts the erased nullable
pointer versus known-length-buffer overloads without inventing empty data.
Complete original normal/ASan/UBSan captures verify every127 nonzero first ASCII
byte with every128 second byte, input null/empty/embedded NUL, every initialized
output unit/zero/count and complete allocator/free ordering. A failure witness
uses the original replaceable allocation-function pointer; it is not an
ordinary OS OOM or an upstream method substitution. The original null-data
value is retained without destruction. Physical ABI, threading, malformed JS
buffers, null-value consumers/destruction, the distinct string_view/literal
construction overload and full consumer QA remain unverified. Broad parity
flags remain false. This supplies a genuine dependency for static type names;
static types/Type/Any/Reference/default RuntimeException and case values remain
unfinished.

## Original UNO static type initialization

The original `cppu/source/typelib/static_types.cxx` responsibility now lives in
`cppu/source/typelib/static_types.ts`. Its eight original public C exports are
reexported from the existing typedescription header. It reuses the single shared
CPPU registry/allocation/prefix/completion/layout/reference and SAL string owners.
There is no second type registry, fabricated XInterface or simplified exception
description. Basic types, all three root methods, Exception's Message/Context
and derived RuntimeException are constructed through the actual original factories.
These are type descriptions; original C++ Type/Any/Reference and default exception
values remain separate unfinished responsibilities.

Original static initializers preserve cache-cell identity, acquired/static counts,
idempotence, initialized-name reuse, original lazy sequence name construction,
compound bases/offsets/parameterized flags, enum default and incomplete interface
bases/lists. Uninitialized Uik is left uninitialized and never guessed or read by
the native witness. The original private alignment cap uses the already verified
selected LP64 logical layout. An initialized synthetic member alignment16 observes
that source clamp without certifying an ordinary compiled ABI.

The source has native mutexes and repeated checks surrounding static initialization.
The already selected synchronous realm-local model retains the first check; it
does not model native mutex scheduling or interleavings. Mutable one-element
reference tuples adapt original cache-cell addresses; native address arithmetic
and physical pointer ABI are outside that evidence. Actual `_ustr` constants use
shared OUStringLiteral storage, while terminated initializer names use the original
createFromAscii owner. No native method/body is substituted.

The complete native caller retains full hashes for346 unchanged sources and
rebuilds69 original dependency owners normally and under ASan/UBSan. Complete
initialized records, names, counts and layouts are compared byte for byte through
public portable calls. Source-defined checked assertions are observed separately.
System libraries are uninstrumented, leak detection is disabled and full consumer
QA/shutdown/native concurrency/malformed JS inputs remain unverified. CALC-047
records acquired uninitialized-name retention and preserves the original ordering.
Broad contract/behavior/default/verified flags remain false. Whole task39 and the
actual locale/case service/pool/document/view/UI remain unfinished; full41 and the
user-requested subsequent pause remain pending.

A separate original synthetic caller clears the returned mutable Exception
cache cell after root bootstrap and reenters with an existing XInterface. This
observes the original null cache result and unchanged retained static-owner
counts. It covers the source branch without claiming an ordinary producer, a
mutex race or a repaired bootstrap.

## Original UNO type compatibility and reference assignment

Original ASCII reference creation and reference assignment live in the existing
CPPU typelib owner. The original primitive compatibility table, reference ancestry
predicate and description wrappers live together in typelib-assignability.ts,
split only to keep the core owner below the authored file-size limit. Public C
exports reuse these owners once through the existing typedescription header.

The original private type_equals and public reference_equals have identical
predicates. Reuse the existing verified shared equality owner under the private
call name. Description equality casts only the compared common-prefix fields
and preserves object identity; it creates no new view and requires no allocator
bookkeeping. Existing danger-get/release owners preserve source ancestry traversal
for structures/exceptions and ordered multiple-interface bases. The exact original
11x11 table is source data inside the implementation module, not a public C header
export. It is compared with the actual native constant, including diagonal entries
that are bypassed by the public predicate's earlier identity shortcut. No value
conversion or invented JavaScript numeric range check replaces this type predicate.

ASCII names use original createFromAscii/reference_new and preserve terminator,
output replacement, name-only registry lookup and typedef miss. Assignment acquires
the source before releasing destination and retains self/both-null identity. The
observation includes a source held only by its old sequence destination: release
of that destination destroys the sequence and drops its element reference after
source acquisition. Nonidentical null assignments dereference invalid native
pointers and are not repaired or certified.

Full unchanged normal and ASan/UBSan builds capture all121 primitive table entries,
all1681 pairs of41 prepared actual/null references, initialized common fields, all
name units/counts and real ownership changes. Prepared callers include compounds,
exception ancestry, ordered multiple interfaces, sequences, weak members, a
synthetic scalar alias and original embedded-zero names. Complete portable replay
compares every captured byte/digest. System libraries are uninstrumented; leak
detection is disabled. Real value conversion/ranges, ordinary synthetic producers,
physical ABI/native mutex/thread scheduling/shutdown, malformed JS reflection/const
enforcement and full consumer QA remain unverified. CALC-048 preserves the observed
signed/unsigned table decisions. Type/Any/Reference/default RuntimeException values
and case values/service/pool/document/view/UI remain unfinished; whole task39 and
full41 then requested pause remain pending. Broad parity/verified flags stay false.


### Original UNO Type values

The shared `cppu/inc/com/sun/star/uno/Type.ts` binds the original Type.h class
declaration and Type.hxx inline members into one Type owner. Default construction
uses the actual VOID cache, copy and pointer construction acquire, both no-acquire
tags transfer ownership, and explicit disposal performs the original release.
Original rvalue construction still copies: only move assignment swaps pointers.
Copy assignment, acquired names, borrowed pointers, description replacement,
class/equality/compatibility methods reuse existing shared CPPU/SAL owners.
The original generated UDK TypeClass dependency is retained without a reverse edge.

Complete unchanged native header calls and all69 original dependency objects are
compared under normal and ASan/UBSan builds. Portable tests replay initialized
count/name/common fields and all15 basic Type value pairs. Null no-acquire values
are intentionally retained without destruction; no null destructor or invalid
native dereference is certified. Physical allocation/ABI, const/rvalue enforcement,
Array/legacy/UnoType helper templates, threading/shutdown/full QA and unfinished
Any/Reference/default RuntimeException/case service/pool/document/view/UI remain
unverified. Broad parity flags stay false; task39 and full41 then requested pause
remain pending.


### Original borrowed UNO Type cell views

The original `cppu::detail` helpers in `cppu/inc/unotype.ts` preserve the live
const Type alias of a reference pointer cell. Native cell-address identity uses a
WeakMap and an accessor view of the actual Type prototype. No Type constructor,
acquire, release, pointer-copy or independent static cache participates. The class
lookup helper delegates to the original shared C cache. Ordinary Type copies
and assignments continue to own their references independently of cell changes.

Complete unchanged original unotype.hxx/Type header calls and all69 original
SAL/CPPU objects are compared under normal and ASan/UBSan builds. Tests cover
all17 supported class cells and289 pairs, distinct equal-content cell addresses,
mutable replacement/null/restoration and actual copy/assignment lifetimes.
Borrowed aliases are never destroyed or assigned. Physical object/pointer
lifetime/ABI, compiler const enforcement, unsupported static classes, template/ADL
overload families and native scheduling/shutdown/full QA remain unverified.
Any/Reference/default RuntimeException/case/service/UI remain unfinished;
broad parity flags stay false, task39 stays DOING and full41 then pause is pending.

### Original UNO primitives and C records

The shared `cppu/source/uno/prim.ts` follows the original `prim.hxx` callback, sequence-size, empty sequence, VOID acquisition and normal empty Any initialization contracts. C callback and record declarations remain in their original UNO headers; the UNO sequence typedef reuses SAL. Original `data.cxx` global initializers live in `cppu/source/uno/data.ts`. The existing CPPU equality/acquire and OSL atomic owners are reused. Int32Array count storage and a single mutable pointer cell adapt original addressed fields/globals; they do not add an independent registry or data engine.

Empty Any construction leaves `pReserved` untouched and uses `pData=self` in the normal source configuration. Sequence size retains unsigned64 arithmetic wrap and the unsigned32 result guard, including initialized negative signed32 caller observations. These observations do not establish ordinary producer reachability or a defect. The native caller links 72 full unchanged SAL/CPPU translation units and compares complete normal/ASan/UBSan streams for arithmetic, count wrap/identity, callbacks, mapping description ownership and initialized fields. Native physical layout is recorded separately and does not represent a JS binary ABI. Full Any/data/sequence engines, queryInterface, Reference/default exceptions, debug1, native thread/object lifetime and case/service/UI consumers remain unfinished. Broad inventory parity flags remain false.

### Original UNO default construction

The shared `cppu/source/uno/constr.ts` implements both complete original `constr.hxx` default functions. Actual `data.cxx` recursive and C wrappers stay in `cppu/source/uno/data.ts`; public C declarations reexport that one owner. Construction retains base-first/reverse-member order and real enum defaults, including temporary description ownership. Strings, VOID types, empty Any and sequence values reuse the existing shared owners. Scalar/pointer storage uses caller-owned lvalue cells; compound member offsets denote actual caller-provided field addresses and nested storage. This adapts addressing without allocating guessed fields or introducing a public binary ABI, generated struct/provider or second type/memory registry.

The native caller uses 72 full unchanged SAL/CPPU translation units and real registered descriptions, poisoned unconstructed allocations and initialized reserved-field witnesses. Complete normal/ASan/UBSan streams cover fundamental defaults, inline/reference/full-description C boundaries, real enumerations and derived/nested/exception/empty/base-only compounds. Selected caller cleanup uses actual shared release functions; full destructor/copy/sequence/query/Any/Reference/default exception and downstream case/service/UI consumers remain unfinished. The normal diagnostic-only VOID default no-op is recorded without asserting supported arbitrary-class defaults. Broad parity flags remain false.

### Original UNO destruction and clear

Complete original destr.hxx normal LP64 destruction retains original type/reference/string release ownership, base-first/reverse own-member compound order, ascending element/subrange order and size returns, temporary/provided description lifetime, callback/null/default interface branches and actual atomic sequence zero transitions. Actual original data.cxx destructStruct/destructSequence/uno_type_destructData/uno_destructData, any.cxx uno_any_destruct/uno_any_clear and sequence.cxx uno_type_sequence_destroy boundaries reuse one real destruction owner. Native free is browser GC reclamation without synthetic field resets, provider/type factories or an independent memory registry. Existing SAL sequence char-tail declaration now accepts caller-addressed logical source byte-offset storage for non-byte elements; the original empty byte tail remains Int8Array. Scalar/pointer addresses and nested compound addresses retain actual caller cells/maps, without binary JS ABI. One stable Int32Array accessor address per actual sequence record reuses the existing OSL atomic owner; the static empty sequence count uses its existing address, no independent counter. Caller-initialized Any, registered compound and element descriptions are actual native type/string owners; FFI callbacks only observe caller pointers/order/counts. Full72 unchanged original native SAL/CPPU translation units normal/ASan/UBSan compare complete initialized fields/count/name/description streams for fundamental/default/enums/derived/nested/exception/empty/base-only data, every Any class, nested Any, every element class/ranges and sequence transitions/descriptions/zero-count C boundary. Both original zero-count assertions abort in native and retain the existing browser Error assertion adaptation. Normal diagnostic-only unexpected nested Any/TYPEDEF/unsupported element branches are observed without claiming supported generic producers. Copy/construction/assignment/queryInterface/Any/Sequence/Reference/default RuntimeException/case/service/UI consumer closure, native binary/pointer/object lifetime, 32-bit/debug1, native threads/shutdown and full upstream QA remain unfinished or unverified. System dependencies remain uninstrumented and leak detection disabled. Broad parity/default/verified flags remain false.

### Original UNO copy and Any construction

Original copy.hxx normal LP64 complete copy/default/convert operations and all eight actual any.cxx C boundaries plus real data.cxx copy/forward wrappers reuse actual shared type/reference/string/OSL/default/destruction/mapping owners. Preserve type acquisition, value defaults, enum default/description lookup, original Any flatten/null/VOID/source branches, live pData-to-pReserved alias, base-first/reverse own-member copying and reverse sequence conversion, shared sequence atomic increment and exact callback/mapping order, initialized-null mapping out cells, selected description ownership and source allocation-size guard. Source malloc/address expressions use native JS lazy addressed views of one uninitialized logical allocation; field offsets are source logical LP64 offsets, no physical JS binary ABI. Native first-member/nested address aliases and Any reserved-field addresses retain stable identity and live direct writes, with no type lookup/default initialization/provider work. Existing source-owned count views retain one actual count; no alternate type/sequence/interface provider or generated factory is introduced. Byte/primitive values keep their initialized logical type values and IEEE zero; Boolean uses native JS conversion only for valid initialized source data, not arbitrary JS normalization. Full72 unchanged native SAL/CPPU translation units normal/ASan/UBSan compare complete original initialized fields, real description/name/string/ref/callback/count observations through inline/reference/full-description/convert/assignment/null/default/flatten operations, full actual caller-owned type factories and sequences. Synthetic huge initialized header-only counts observe range guards without nonexistent tail reads; diagnostic-only nested Any/TYPEDEF/unexpected element branches certify no supported producer. Physical allocation/memory consumption/malloc resource failure/partial reserved-byte layout,32-bit/debug1/native threads/shutdown and full QA remain unverified. Actual C++ Any/Reference/default RuntimeException/Locale/case/service/UI consumer closure remains unfinished. Broad parity/default/verified flags stay false.

### Original Reference ownership and generated exception values

Continue the approved real Reference/default-exception dependency: bind original Reference.h/hxx direct default/pointer/copy/no-acquire/move constructors, get/is/Boolean/clear/set/assignment/destruction ownership operations into one shared Reference owner; preserve null defaults, acquire-before-release and clear-before-release callback visibility and release/transfer/null move assignment. Query/Any/throwing/interface-identity comparison constructors and operators remain separate unfinished responsibilities, not substitutes. Port actual generated Exception/RuntimeException IDL value classes (normal LIBO_INTERNAL_ONLY, OSL_DEBUG_LEVEL0, no source-location configuration), real shared OUString and Reference default/copy/move/assign/reverse lifetime, stable field owners, and actual cppumaker RuntimeException type initializer with unchanged typelib factory/register/release and leaked shared Type lifetime. No JavaScript Error/provider/type shim or independent exception registry. Full original native generated headers, true72 SAL/CPPU dependencies normal/ASan/UBSan and complete value/type/count/callback observations must precede source-absent raw100 acceptance. Debug source-location append, physical ABI/C++ interface casts/native threading/QA and full query/Any/case/service/UI remain unverified; broad flags remain false. This continues task39 under the user instruction to keep the current39/40/full41/fix/pause plan. The actual generated ASCII type-name constructor requires original rtl_uString_newFromLiteral, char-to-Unicode Copy and selected OUString const char array overload; extend existing shared SAL owners, preserve embedded-zero/trailer validity, ASCII assertion and release-last aliasing. Native JS typed-array operations adapt original array type/length/validation only, not another string factory.


### Original locale-aware scalar case values

The shared i18nutil owner now implements the original `getConditionalValue` and
`getValue` bodies. Exact Locale ASCII language comparison, conditional const entry
identity, complete independent Mapping value copies, surrogate-tail suppression,
combined scalar lookup, extras and task38-selected ICU scalar fallback retain the
pinned source contracts. Default exceptions use the actual shared generated
RuntimeException/Exception, Reference, OUString and typelib owners. The original
`casefolding.cxx` RuntimeException API dependency adds i18nutil -> cppu to the
approved source-root graph wiring; reverse, browser and application edges stay
forbidden. No cycle exception is needed for this acyclic dependency.

The original native probe rebuilt69 genuine SAL/CPPU translation units and the
unchanged original case/ICU scopes, verified360 full pinned blobs, and reproduced
all13,228,032 initialized observations identically under normal and ASan/UBSan
builds. Portable replay compares every native field, conditional identity, copy
independence, unchanged caller buffer and actual exception message/context/type.
Focused source coverage has76 statements,101 branch counters and9 functions, all
positive and S/B/F/L100. CALC-035 conditions are preserved; CALC-038 isolated
internal-bit undefined behavior has no invented portable expected output. Final source-absent Calc106/24files/19executable owners and related shared113/34files/41owners pass; every raw S/B/F counter is positive and S/B/F/L100. Calc totals are S2920/B2055/F474/L2564 and related shared S2707/B1333/F386/L2407. All three original source links are restored exactly before source/provenance checks. All13 declared gates pass including34 tooling tests; doctor reports0errors and two inherited warnings.

Full getNextChar/widthfolding, locale service/CharClass/SharedStringPool and Calc
cell/document/edit/view remain unfinished. Full generated API, Any/query,
physical C++ ABI, native threading, debug source-location configuration and
original consumer QA are outside this bounded scalar proof. Broad parity flags
stay false; next tasks remain40 and full41, followed by Calc/shared repairs and
the requested pause.


### Original case iterator and width lookup owners

Task40 completes the original getNextChar and MappingElement path with actual
oneToOneMapping/oneToOneMappingWithFlag instance classes, complete width tables,
all six independent lazy table getters, scalar decomposition/composition and
original transliteration flags. Native copy-deleted/final/const/physical layouts
remain explicit unverified platform contracts. MappingElement preserves stable
embedded Mapping and map identities; only current/type/nmap are native defaults.
Default map cells are uninitialized upstream and masked from native observations.
No default-zero or physical-layout claim follows from typed-array storage.

The stateless native casefolding/widthfolding static APIs are named readonly ESM
records; this preserves their function signatures and ownership while satisfying
the repository rule against classes containing only static methods. Numeric
flags reuse the original offapi enum/constant-group owners through a readonly
record; enum's source-derived sentinel is a literal as required by lint. No
validator or coverage exception is introduced.

Native capture uses actual original width/case bodies and oneToOneMapping TU,
true SAL/CPPU/ICU dependencies and independently generated offapi headers. The
original gbuild regular-header configuration selects cppumaker -L; bootstrap
mode's enum factory is not used as an internal regular header. Native --write and --check capture all370 original source hashes and identical
normal/ASan/UBSan streams; all four portable corpus replays pass. Source-absent
Calc106 and related shared117 tests pass with raw S/B/F/L100; all13 declared
gates pass. CALC-049/050 record preserved original quirks. No
complete string/Sequence/locale service/CharClass/pool/document/edit/UI parity is
claimed. Full task41/fix/pause remains immediately after task40.


### Full regression after task40

Task41 runs the complete source-absent office suite: 15084 tests across668 files,
with S28703/B19704/F6057/L25988 and every raw Istanbul counter positive (100%).
Calc19, shared182 and Writer205 executable owners each have raw S/B/F/L100.
No Writer coverage repair was needed. Complete inventory123/38 has its configured
V8 summary S1734/B1292/F436/L1668, all100%; no raw inventory counter file is
claimed because that configuration emits text and json-summary. Tooling33/9,
browser303 (Writer301/shared2/Calc0) and static2 bundles pass. Actual Calc UI
browser scenarios remain absent, consistently with the unimplemented UI.

Full lint initially traversed unchanged fast_float archive documentation under the
native build output. Only that original archive cache is now excluded from
repository-authored lint; application/probe/config sources retain their rules.
The inventory CLI composition test initially leaked a new ICU vendor reference
to disk. Its owned marker reader now handles all vendor references using required
fixture lookups, matching production vendor evidence resolution; all scoped
checks and complete inventory pass with original links absent. Original native
archives/implementations, coverage thresholds and runtime behavior are unchanged.
All3 exact original symlinks were restored. Remaining full static/repository gates
pass; task41 closes and the goal pauses at the user's requested full-run boundary.
Original service/pool/column/table/document/edit/view/UI work remains incomplete.


### Original UNO sequence C engine

Task42 ports the original sequence.cxx engine at its original shared CPPu owner,
with source-helper functions split into sequence-elements.ts for the600-line
budget. Actual SAL records/counts and CPPu construction/copy/destruction/type
owners are reused. All reference/full-description constructors, reallocation,
reference2One, assignment and zero-count destruction keep their original ordering.
Primitive raw memory operations adapt existing typed logical address views;
source tag/width selection and initialized scalar values remain intact.
Native sal_Bool memcpy preserves bytes2/255 while scalar copy.hxx converts them
to bool. The actual original source difference is preserved, not normalized away.

Shared native type/value/callback callers and portable observers are extracted
from the existing copy proof rather than duplicated. The old assembled native
copy driver remains byte-identical. Sequence observations include all actual
initialized values, type/string/count ownership and ordered callbacks. Native
physical allocator address/capacity/byte layout/resource OOM/NaN payloads and
indeterminate cells remain unverified. Signed-count diagnostic observations are
separately bounded and do not establish valid producer/malformed-header parity.
Native --write and --check verify 358 unchanged source hashes and complete
normal/ASan/UBSan streams (2089840 lifecycle, 1288 helper and 4460 guard bytes).
With all three original source links removed, Calc passes 106 tests in 24 files
and directly related shared modules pass 120 tests in 36 files. Raw coverage
is S/B/F/L100 for all 19 Calc and 49 shared executable owners; all counters
are positive. Public C++ Sequence template and real downstream casing service,
CharClass/SharedStringPool/cell/document/edit/view/UI owners remain required.
The next scheduled full run is task51; task41 remains the last complete run.

### Original CPPu UNO equality engine

Task43 represents original eq.hxx at shared CPPu eq.ts, with numeric and sequence
responsibilities split into adjacent eq-numeric.ts and eq-sequence.ts for the
authored file budget. Existing typed values, type references, logical addressed
storage, string equality, Any and callback/destruction owners are reused.
Actual data.cxx C/recursive equality entry points and retained binary query
dispatch stay at their source owner; prim.hxx only declares that query function.

Any flattening, exact numeric switches/casts, type identity, base-first/reverse
compound members, descending sequence elements, root-interface queries and
ordered releases follow the original. A native int64-to-float witness shows that
Math.fround(Number(integer64)) can double round. Native JS remains in use for
number/exact binary64 inputs; wider integer64 values need one exact ties-to-even
discarded-bit adaptation using BigInt. No additional SAL numeric library is added.

Native --write and --check verify all358 complete source hashes and identical
normal/ASan/UBSan streams: numeric2112864, scalar651680, sequence89468,
interface5008 and diagnostic28 bytes. All five complete portable replays match,
including cached method-description fields/identity and integer64 rounding ties.
With all three original source links absent, Calc106/24 and related shared125/37
tests pass; raw S/B/F/L100 spans all19/52 executable owners. A strengthened
five-case replay has raw100 for all three equality owners and verifies unchanged
hashes for every owner covered by the combined profile. All scoped gates pass.
Filtered native SAL_WARN output, physical allocation/ABI, NaN payload families,
undefined floating-to-u64 conversions and full upstream consumer QA remain
unverified. Public Sequence/UnoType and original services/CharClass/pool/Calc
cells/document/edit/view/UI remain required. Next scheduled full run is task51.

### Original UnoType and sequence type helpers

Task44 completes internal unotype.hxx overload selection and Sequence.hxx type
helper bodies through existing actual typelib and borrowed Type owners. Explicit
C++ type argument spellings and nested tuples adapt compiler erasure; they create
no UNO types and infer none from JS values. Actual generated ADL getters remain
at their original owners. Equivalent nested argument expressions retain the same
compiler specialization key, while different C++ types keep different keys even
when their canonical UNO reference is equal.

UnoSequenceType, Sequence<E>::s_pType, favourChar and global char-sequence helpers
retain independent original pointer cells. Recursive favour dispatch and the
supplied-element helper's first-call-only behavior are preserved. The stateless
UnoType template uses the repository's readonly ESM record convention.
Original --write and --check verify364 complete source hashes and13 generated
inputs, with all69 genuine dependency translation units rebuilt. Normal and
ASan/UBSan streams match: types1865864, sequences1915688 and seeded71876 bytes.
All three source-absent portable replays match. Calc106/24 and related shared128/38
tests pass with raw S/B/F/L100 across all19/53 executable owners; every raw
counter is positive. All13 scoped gates and exact Prettier pass. Physical ABI,
compiler-only enforcement, external SDK sal_Unicode alias configuration and full
consumer QA remain unverified. Public Any/genfunc/Sequence and original services,
CharClass/pool/Calc cells/document/edit/view/UI remain subsequent. Next full51.

### Original CPPu data assignment and value compatibility

Task45 adds original assign.hxx and data.cxx assignment prerequisites for public
Any extraction/isExtractableTo/has and genfunc. The exact numeric switches live
in adjacent assign-numeric.ts; actual C entry points and compound recursion stay
at data.ts. Existing shared type/default/copy/destruction/string/sequence/query
owners are reused. Native JS width operators, BigInt and Math.fround represent
these defined assignments without another library or conversion policy.

Initial self-address/type equality, null-source reset, Any flattening and alias
shortcut, type release-before-acquire, base-first/reverse compound partial writes,
sequence type-before-pointer equality and interface base/query/callback ordering
follow original source. Original --write and --check verify358 complete source hashes and13 generated
inputs, rebuilding all72 real translation units normal/ASan/UBSan. The five
defined/initialized diagnostic modes match completely: numeric174096,
matrix2594720, compounds54368, interfaces123792 and diagnostics180 bytes.
The separate interface-chain normal24896-byte stream has original assign.hxx422
UBSan SIGABRT, with no defined/UB/sanitizer parity claim. All six complete portable
replays match. Source-absent Calc106/24 and shared134/39 tests pass with raw
S/B/F/L100 across19/55 executable owners, every raw counter positive. The equality
caller remains byte-identical after observer extraction; all five old equality
replays still match. All13 scoped gates pass. CALC-053/054 record source quirks.
Undefined original expressions and initialized unsupported diagnostic inputs are
bounded separately; physical ABI/allocation/debug/thread/full consumer QA remain
unverified. Public Any/genfunc/Sequence and service/CharClass/pool/Calc document
and UI owners remain subsequent. Task41 is the last full run; next scheduled51.

### Original public Any ownership and C++ interface callbacks

Task46 adds original Any.h/Any.hxx ownership and metadata, with complete
original genfunc.h/hxx C++ acquire/release/query callbacks. Existing C Any,
copy/default/destruction, canonical reserved field address, Type/UnoType,
OUString and generated RuntimeException owners are reused. XInterface provides
only the genuine three-virtual-method declaration; Reference now borrows its
two-method projection instead of a duplicate contract.

Constructors, copy/self/move swaps, inline address repair, stable borrowed Type
view, metadata/setValue/clear and query reserved-interface transfer follow source.
Explicit source addresses/type arguments adapt erased C++ templates without type
inference or a runtime provider. Finally/dispose pairs adapt real returned Any
and caught RuntimeException destruction; other exceptions propagate.
Native --write/--check pass: 72 complete original translation units (69 genuine dependencies plus any/data/sequence), 367 complete source hashes and 13 genuine generated headers; four full initialized normal-ASan/UBSan streams identical (constructors266088, histories5871200, templates70928, callbacks13612 bytes). With all3 upstream links absent, Calc106/24 and related shared138/41 tests pass; 19/57 executable owners have every raw S/F/B counter positive and whole S/B/F/L100 (Calc2920/2055/474/2564; shared3754/2040/481/3353). All13 scoped gates and9 exact authored-source Prettier checks pass.
CALC-055 records the original intentional moved-from VOID data pointer; preserve it. Empty/moved VOID reserved
bytes and physical ABI/allocation/compile-only/debug/thread/full QA are unverified.
Any extraction/comparison/get/query/fromAny/toAny/ostream and public Sequence,
Reference/service/CharClass/pool/Calc cells/document/edit/view/UI remain subsequent.
Next full51; task41 remains the last full regression.


## Original public Any insertion extraction and data operations

Task47 continues the actual public Any owner with isExtractableTo/has, Any
comparison, selected insertion/extraction and toAny/fromAny copy/move helpers.
Actual C data/type/query/ownership and Type/OUString/Any owners are reused. The
original numeric specialization switches match existing shared assignNumeric;
reuse that source responsibility with each original direct source-class guard.
Generic extraction retains original C assignment and Any unwrapping instead.
Declared template types and source/destination addresses explicitly adapt erasure.

The caller's generated RuntimeException destination must use the actual class
default: its OUString literal empty storage differs from C data default flags.
Portable observations use nonowning direct field lvalues at genuine description
offsets and the actual class destructor, preserving initialized counts and values.
Three complete native initialized normal-ASan/UBSan streams match (949008,
2082240 and147104 bytes);369 complete source hashes and13 genuine generated
headers verified.
Source-absent Calc106/24 and related shared141/42 tests pass; all3 original links restored exactly. Whole19/57 executable owners have every raw S/F/B counter positive and S/B/F/L100 (Calc2920/2055/474/2564; shared3791/2068/490/3386). All13 effective scoped gates and3 exact authored-source Prettier checks pass. Remaining typed comparison/BaseReference interface identity, get/ostream, string-expression and external-only helper overloads, XInterface static helpers, public Sequence/Reference/services/CharClass/pool and Calc cells/document/edit/view/UI are subsequent source families. Physical ABI/allocator/resource/uninitialized reserved bytes/compile-only/debug/thread/shutdown/full consumer QA remain unverified.
Last full41; next full51, whole Calc goal active.


## Original Reference queries throwing and interface identity

Task48 ports original Reference.h/hxx query/queryThrow/setThrow constructors/set/static/member and Any query helpers, protected iquery/iquery_throw, root identity equality/inequality and selected non-null logical dereferences. Actual public Any, Type/UnoType, XInterface, generated RuntimeException, Reference and SAL OUString/lazy concatenation owners are reused. iquery transfers the real returned Any reserved interface ownership before destruction and propagates exceptions; equality catches only RuntimeException and destroys original temporaries. Failed throwing set retains prior pointer. Explicit erased template argument and distinct immutable enum type/value witnesses preserve native zero values without an inferred type/value provider or per-instance metadata. Non-interface Any/QUERY construction skips interface static initialization; set uses the typed helper even for non-interface Any. cppu_opt.cxx three complete C message owners preserve borrowed type-name fields, lazy concatenation, result acquire and local destruction. Whole normal-ASan/UBSan streams match queries319544/members73372/identity5189724/messages2042880 bytes:73 unchanged translation units,368 full source hashes and13 generated headers. Diagnostic invalid root replies are bounded observations, not valid UNO producer certification. Native --write and final --check pass:73 full unchanged translation units,368 complete source hashes,13 generated headers and156 terminal commands0. Complete initialized normal-ASan/UBSan streams identical queries319544/members73372/identity5189724/messages2042880 bytes. All3 original source links absent: Calc106/24 and related shared145/43 tests pass with every raw S/F/B counter positive and whole S/B/F/L100 for19/58 executable owners (Calc2920/2055/474/2564; shared3885/2112/511/3476). Exact links restored. All13 effective scoped gates and5 exact authored-source Prettier checks pass. Native null dereference assertions, physical Reference pointer ordering/hash/ostream/multiple-inheritance casts and compile-only deleted instantiations; later Any typed comparison/get/string expressions/external-only helpers, public Sequence/services/CharClass/pool and Calc cells/document/edit/view/UI remain subsequent. Physical ABI/allocator/uninitialized reserved bytes/debug/thread/shutdown/full consumer QA unverified. Broad flags remain false.
Last full41; next full51, whole Calc goal active.


## Original public Sequence value ownership and arrays

Task49 ports normal internal Sequence.h/hxx default/copy/adopt/length/elements/initializer constructor body, one actual pointer-cell ownership, destructor, copy assignment, true swap move assignment, get/length/has/size/const arrays/COW arrays/index/iterators/resize/swap and mutable range. Existing real C sequence allocation/default/copy/destruction, Sequence-type member-static cells, Type/UnoType/OSL/genfunc/data/array storage remain actual shared owners. Source has no move constructor: native rvalue construction copies the handle, unlike its move-assignment swap. The shared actual SAL enum typed witness preserves adoption versus integer length0, including NULL field adoption; existing numeric symbols stay0. Erased declared E and sizeof(E) bind compiler specialization identity only, with no instance type metadata, inferred value type or type/default/data provider. Const array/index/pointer-end expressions retain actual logical source storage and field addresses rather than claiming JS binary ABI or assembling copied E values. Native std::bad_alloc failure is represented by native JS RangeError at the same failed C result; original assertion rejection uses the existing browser Error adaptation. Genuine unchanged native --write passes:73 original translation units,370 full source hashes13 genuine generated headers; lifecycle239396/cold1004/guards896 bytes normal-ASan/UBSan identical, five separate original index/range/size assertion SIGABRT diagnostics agree. Pure caller uses actual scalar/OUString/Type/Any/Reference/nested Sequence/RuntimeException owning objects, native E initializer copy and raw live actual field lvalues; class defaults are never replaced by C-default inputs. Header-only huge guard observations never read absent tails and certify no ordinary producer. Native --write and final --check pass:73 full unchanged translation units,370 complete source hashes,13 generated headers and164 terminal commands (154 exit0;10 separately expected SIGABRT). Complete initialized normal-ASan/UBSan streams identical lifecycle239396/cold1004/guards896 bytes. All3 original source links absent: Calc106/24 and related shared149/44 tests pass with every raw S/F/B counter positive and whole S/B/F/L100 for19/59 executable owners (Calc2920/2055/474/2564; shared3952/2152/535/3539). Exact links restored. All13 effective scoped gates and6 exact authored-source Prettier checks pass. External-only mutable iterator/index bodies, ByteSequence bridge and ostream; physical pointer/layout/ABI/resource/native const/compiler-only restrictions (including prohibited Sequence<bool>), arbitrary element producer/alias/metadata safety, thread/shutdown/full consumer QA and service/CharClass/pool/Calc document/edit/view/UI remain unverified or subsequent. Broad flags remain false.
The real character-classification implementations return Sequence<OUString> and accept Sequence<Any>; this public owner closes that existing C-engine dependency before service/pool and Calc document/UI work. Last full41,next51, whole goal active.

## Original cppuhelper interface and service contract helpers

Task50 implements all actually declared original cppuhelper queryInterface overloads (1..14 and17..19;15/16 are absent, CALC-057) through one erased ordered argument list. Each declared static_type getter is evaluated in original order and later getters remain untouched after the first match. Matching NULL returns original typed NULL Any, mismatch returns actual empty Any, without a virtual interface query or inferred pointer type/provider. Real Type equality and Any default/acquisition/destruction remain existing shared owners. supportsService calls the original implementation getter once, retains that exact returned local Sequence, searches with existing full-length case-sensitive OUString equality over actual logical element field addresses, never requests COW, and destroys the local owner on return or exception. Original declaration reexports the single cxx body. XServiceInfo is the complete structural IDL method contract over the actual root interface, with logical addressed Sequence<string> output and no generated type/default/service implementation. Only original cppuhelper-to-cppu/SAL module edges are added; reverse/application/browser edges remain forbidden. Genuine full native helper/header/IDL ownership and complete initialized callback/type/name/ref/value streams are required; custom declared source-caller static_type methods invoke actual root/static typelib factories and supply no replacement library provider. Native --write and --check pass:74 complete unchanged translation units,375 full source hashes and15 genuine generated headers,161 terminal commands (157 exit0;2 expected NULL assertion SIGABRT;2 expected original missing-arity compiler exit1). Whole initialized normal-ASan/UBSan streams identical cold716/queries455732/services23136 bytes. With all3 original links absent together, Calc106/24 and related shared154/45 tests pass; all raw S/F/B counters positive and whole S/B/F/L100 for19/61 executable owners (Calc2920/2055/474/2564; shared3966/2158/537/3549). Exact links restored; task49 profile preserved append-only by the new helper test and all4 new source modules, including structural/reexport owners without executable counters. Scoped gate acceptance is recorded in the task evidence. Generated XServiceInfo static type/default implementations, actual weak object/adapter/listener/ImplHelper and service manager/context/locale/CharClass/pool/Calc cell/document/edit/view/UI remain subsequent. Physical pointer/ABI/resource/const/compiler-only/concurrency/shutdown/full consumer QA unverified. C++ NULL assertion is an explicit browser Error adaptation; no full public module parity claim. Broad flags false.
Last full41;next scheduled51. Whole Calc goal remains active; verified scope is limited to these real shared helper contracts.
