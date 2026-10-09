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

Document/compiler-dependent parsing, formatting and reference updates, range-pair
lists, native pointer/iterator/refcount/move lifetime and undefined arithmetic
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
All four real V8 coverage metrics must be 100%. Full-suite scheduling starts
with Calc task 1 of 10 here; run the full suite after task 10, then repeat each
ten completed Calc agentplane tasks. Targeted affected-module tests run on
intervening tasks. Writer acceptance files and coverage settings remain intact.
The coordinate foundation and sticky reference tasks are Calc tasks 1 and 2;
inventory reconciliation is task 3, reference addresses/sheet limits are task 4,
single formula references are task 5, and complex formula references are task 6
of that first ten-task interval. Numerical range lists are task 7 and big
address/range coordinates are task 8; the full run is still due after task 10.

Source research includes the per-file MPL 2.0 and inherited Apache notices in
`sc/inc/address.hxx`, `sc/inc/sheetlimits.hxx`, `sc/inc/refdata.hxx`,
`sc/source/core/tool/refdata.cxx`, `sc/inc/rangelst.hxx`,
`sc/source/core/tool/rangelst.cxx`, `sc/inc/bigrange.hxx` and
`sc/source/core/tool/address.cxx`, and MPL 2.0 in
`sc/source/core/data/bigrange.cxx` and
`sc/inc/types.hxx`. The TypeScript implementation is independently authored
from those numerical contracts; the original sources remain research-only.
