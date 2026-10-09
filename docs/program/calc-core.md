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
domains, token storage, complete document/compiler/listener ownership and complex
range references remain subsequent work; module and whole Calc parity stay
unverified. The upstream `testFormulaRefData` initial single-reference assertions
are retained; its complex extension assertions belong to the next owner.

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
and single formula references are task 5 of that first ten-task interval.

Source research includes the per-file MPL 2.0 and inherited Apache notices in
`sc/inc/address.hxx`, `sc/inc/sheetlimits.hxx`, `sc/inc/refdata.hxx`,
`sc/source/core/tool/refdata.cxx` and `sc/source/core/tool/address.cxx`, and MPL 2.0 in
`sc/inc/types.hxx`. The TypeScript implementation is independently authored
from those numerical contracts; the original sources remain research-only.
