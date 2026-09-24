# Upstream parity plan for the implemented Vite Office runtime

## Baseline, scope, and meaning of parity

This plan concerns the **currently implemented** runtime, not the unimplemented
LibreOffice suite. The reference is the local, pinned LibreOffice
`libreoffice-26.8.0.2` checkout at `9bc445578031fecf56086729d8e4940c77e14d65`
(`vendor/libreoffice-reference`). The local corpus is the 167 production modules
in [`parity/runtime-inventory.json`](parity/runtime-inventory.json) and the 45
bounded Writer records in
[`parity/writer-command-slice.json`](parity/writer-command-slice.json), checked
against [`source-provenance.json`](source-provenance.json), the code, and the
pinned source. At this baseline the runtime inventory classifies 102 modules as
upstream mechanisms, 46 as browser adaptations, and 19 as local infrastructure.
It records 92 unverified contract statuses, 131 unverified behavior statuses,
and 78 unverified default statuses. These counts describe **missing evidence**,
not 92/131/78 proven defects. Conversely, 43 `verified` atomic records prove
their stated narrow assertions, not parity of every public operation in those
modules. The two approved exceptions concern recovery.

The target is equivalent behavior, defaults, object ownership, model types,
command contracts, and source responsibility for every browser-relevant part
of the implemented slice. TypeScript and React need their own module and
rendering boundaries; those boundaries should carry platform input/output and
presentation only. Preserve upstream `sw`, `sfx2`, `svl`, `editeng`, `xmloff`,
`package`, and `framework` responsibilities and use the corresponding upstream
path and module name where feasible. An exact C++ file split is unnecessary
when ES modules require a split, but a matching path must not merely contain a
facade while its real policy lives in `sw/browser` or React.

**Fixed product exceptions:** do not add recovery; do not change the browser
autosave schedule, its storage policy, or the browser Open/Save/Save As/Export
UI and workflows. Their internals may continue to call upstream-shaped shell
and filter contracts. Do not change inventory schemas, validators, generators,
or the inventory mechanism. Update existing inventory **data** and parity
evidence as implementation tasks finish. Native printing, OS integration,
Java/UNO bridges, extensions, and nonbrowser suites are outside this plan
unless an implemented browser feature actually depends on their semantics.

## Audit findings and disposition

The table distinguishes a code-proven divergence from a bounded parity gap or
an audit candidate. `P0` is a current architectural/default mismatch; `P1` is
a current behavior or contract gap; `P2` is cleanup or evidence debt. Upstream
paths below refer to the pinned local checkout.

The full runtime-inventory coverage can be grouped as follows. This grouping
accounts for all 167 entries without counting tests or future-suite placeholders
as implemented capabilities:

| Runtime areas (`subsystem` values) | Modules | Audit focus |
| --- | ---: | --- |
| Framework launcher, services, dispatch, accelerators, browser presentation and composition | 39 | Sfx slot/state contracts, generated commands, shortcuts, locale, and justified browser routing |
| Formatting model, Writer document/node model, undo, numbering, and page layout | 50 | Pool item types/defaults, graph ownership, frame/number-tree invariants, and undo |
| Writer shell, view, edit window, and document shell | 18 | PaM, command execution/state, dialog boundaries, and lifecycle ownership |
| ODF filter, package, xmloff, and Worker bridge | 24 | Stream/property import/export, package defaults, and transport isolation |
| Document lifecycle, storage contracts, and inert recovery markers | 9 | Shell save contracts; preserve approved browser persistence and absent recovery |
| Writer/browser editing, presentation, workflows, platform ports, clipboard, and test helper | 27 | Keep device/UI ports, remove duplicate policy and obsolete adapters |

The recovery markers (`framework/source/services/autorecovery.ts`,
`svl/source/misc/recovery.ts`, and `sw/browser/presentation/WriterRecoveryPrompt.tsx`)
are empty provenance stubs, not a live recovery feature. Their presence is an
inventory artifact, but this plan leaves them and recovery behavior untouched
under the fixed product exception.

| Priority / confidence | Local evidence | Pinned upstream owner and difference | Required disposition |
| --- | --- | --- | --- |
| P0 / confirmed | `sw/browser/presentation/writer-view.tsx` owns `showLineNumbers` with `useState(false)`; `sw/browser/editor/WriterPlainTextEditor.tsx` numbers every measured line and toggles paint from that prop. | `sw/source/core/doc/lineinfo.cxx`, `sw/inc/lineinfo.hxx`, `sw/source/core/text/txtfrm.cxx`, and `sw/source/core/text/frmpaint.cxx` keep document-owned `SwLineNumberInfo`, count/paint options, and layout-aware numbering. Upstream defaults include paint=false and count-by=5. | Add the applicable `SwLineNumberInfo` and shell command/state ownership in matching `sw` paths; React only reads and submits. Preserve browser painting as the device output. Verify defaults, per-paragraph `RES_LINENUMBER`, page restarts, undo, and ODT handling for the supported subset. |
| P0 / confirmed | `sw/source/core/attr/swatrset.ts`, `sw/source/core/doc/poolfmt-defaults.ts`, `sw/source/filter/xml/xmlimp.ts`, and `sw/browser/presentation/writer-view.tsx` use `SfxInt16Item` or `SfxInt16ListItem` for `RES_PARATR_TABSTOP`. | `sw/source/core/bastyp/init.cxx` registers `SvxTabStopItem`; `sw/source/uibase/shells/textsh1.cxx` uses the same item and its default/relative-indent semantics. A scalar/list of positions loses stop alignment, fill character, and default-stop policy. | Implement the relevant `SvxTabStopItem` contract under `editeng/source/items`, register it in `SwAttrPool`, and pass that item through `SwTextShell`, rulers/dialogs, ODF import/export, and undo. Remove the integer surrogate after migration tests. |
| P0 / confirmed architecture; exact geometry to measure | `sw/browser/editor/WriterPlainTextEditor.tsx` constructs `SwTextFrameInput`, invokes `createSwPageFrames` during React render, numbers lines, and keeps measured line arrays in React state. `sw/browser/presentation/writer-view-projection.ts` also calculates effective line height; `sw/browser/editor/writer-page-pagination.ts` reconverts projection DTOs to frame inputs. | In `sw/source/core/text/itrform2.cxx`, `sw/source/core/text/txtfrm.cxx`, `sw/source/core/layout/flowfrm.cxx`, and `sw/source/core/layout/newfrm.cxx`, formatting, flow, frames, and page creation are core layout responsibilities. `newfrm.ts` currently builds an immutable array with a small keep-with-next rule, rather than maintaining a frame graph. | Keep DOM measurement as a browser device port, then let `sw/source/core/text` and `sw/source/core/layout` own line metrics, frame identity/invalidation, flow, line numbering, and pagination. React receives an immutable frame projection and paints it. Delete the reverse DTO adapter and duplicate spacing computation. Compare page breaks and text extents to pinned fixtures before claiming behavior parity. |
| P1 / confirmed | `xmloff/source/core/xml-parser.ts` throws on every processing instruction. | `sax/source/fastparser/fastparser.cxx` forwards processing instructions; `xmloff/source/core/xmlimp.cxx` accepts them with a no-op handler. | Match upstream handling for legal processing instructions and comments while keeping browser resource ceilings and hostile XML protection. Add import tests with otherwise valid ODT streams. |
| P1 / confirmed bounded gap | `sw/source/core/doc/list.ts` has one map/counter pass, a browser-facing `WriterParagraphList` DTO, and normalization of malformed values; `sw/source/core/SwNumberTree/SwNodeNum.ts` is a bounded tree. | `sw/source/core/doc/list.cxx` and `sw/source/core/SwNumberTree/SwNodeNum.cxx` own registered number-tree nodes, invalidation, position ordering, restart/continuation and notifications. The 45 records cover specific default list operations and one restart value, not the complete implemented list surface. | Keep authoritative list state in `SwList`/`SwNodeNum` and `SwTextNode` item sets; make the DTO a read-only browser/transfer view. Audit every supported promotion, demotion, restart, split, merge, copy, ODT round trip, and undo against upstream transitions. Do not broaden format support merely to satisfy this phase. |
| P1 / confirmed boundary debt | `sw/browser/presentation/writer-view.tsx` creates pooled formatting items, converts points/twips, and calls `SwWrtShell.SetParagraphItems` directly. `WriterAdvancedFormattingControls.tsx` embeds line-spacing choices and tab/flow policy. `WriterRulers.tsx` computes and commits page and paragraph model changes. | `sw/source/uibase/shells/textsh1.cxx`, `sw/source/uibase/wrtsh/wrtsh1.cxx`, `sw/source/uibase/uiview/view.cxx`, `editeng/source/items/paraitem.cxx`, and `svtools/source/control/ruler.cxx` own command validation, item conversion, ruler semantics, and defaults. | Move item creation, validation, and undoable command execution to the matching shell/model modules. React keeps drafts, pointer positions, and visuals. Bind controls to `SfxBindings` slot state; test mixed selection, cancelled dialogs, unchanged values, and upstream defaults. |
| P1 / confirmed boundary debt | `sw/source/filter/xml/odt-filter-service.ts` and `sw/source/filter/xml/odt-transfer.ts` define the worker transport beside XML filter code; `sw/source/core/doc/writer-document-codec.ts` and `item-codec.ts` serialize a parallel model graph for that transfer. | `sw/source/filter/xml/swxml.cxx`, `wrtxml.cxx`, `xmlexp.cxx`, `xmlimp.cxx`, and `xmloff` own filter semantics; worker structured clone is browser execution machinery. | Keep one ODT filter implementation and one authoritative `SwDoc` graph. Put transport/envelope and clone codec under `sw/browser/filter/xml` (or a clearly browser-only transfer boundary); ensure round-trip conversion is lossless for every supported item and that shell/filter interfaces do not expose transport records. This is an architectural change only; retain storage/save behavior. |
| P1 / audit before change | `package/source/zipapi/*`, `package/source/manifest/ManifestExport.ts`, `xmloff/source/style/*`, `xmloff/source/text/*`, and `sw/source/filter/xml/*` are mostly `unverified` at module level even though 15 bounded ODF records are `verified`. | Compare `package/source/zipapi`, `package/source/manifest`, `xmloff/source/style`, `xmloff/source/text`, and `sw/source/filter/xml` source and tests. Strict rejection, default attributes, namespaces, style inheritance, and serialization order can differ without appearing in the current small fixture set. | Build a stream/property/round-trip comparison matrix, then fix **demonstrated** differences in the upstream owner. Preserve browser ZIP/XML resource ceilings and Worker cancellation where required. Record unchanged matches rather than rewriting them. |
| P1 / audit before change | `svl/source/items/*`, `svl/source/notify/*`, `svl/source/undo/undo.ts`, `editeng/source/items/*`, `sw/source/core/doc*`, `sw/source/core/txtnode/*`, `sw/source/core/crsr/pam.ts`, and `sw/source/core/undo/*` have broad module-level unverified statuses. | Corresponding `svl`, `editeng`, `sw/inc`, and `sw/source/core` types define pooled-item identity, parent/default lookup, notifications, PaM registration, node mutation, and undo grouping. | Audit all exported operations and default constructors against matching pinned symbols. Prioritize cases reachable from current Writer commands, ODT, and clipboard; repair type/ownership differences at source, then add upstream-based edge cases and update inventory data. |
| P2 / confirmed obsolete or redundant adapters | `sfx2/source/control/dispatch.ts::GetCommands()` only aliases `GetSlots()` and is used by no production caller; `sw/browser/presentation/writer-command-surfaces.ts` only reexports `writerMenuPlacements`; `sw/browser/editor/writer-page-pagination.ts` reconverts the projection for a core calculation. | The pinned Sfx slot and Writer layout owners have no need for these extra public boundaries. | Remove the alias/reexport once tests and imports are migrated; fold the page-spacing conversion into the single layout projection. Retain `BrowserWriterEditWindow`, browser selection/geometry, clipboard, VCL device and React store boundaries because the platform requires them. |
| P2 / audit before deletion | `sw/source/core/txtnode/text-run-projection.ts`, `sw/source/filter/basflt/writer-transfer.ts`, `sw/source/filter/html/html-filter-types.ts`, `sw/browser/presentation/writer-command-presentation.ts`, and `framework/browser/presentation/command-surface.ts` are additional DTO/adapter layers. | `sw/source/uibase/dochdl/swdtflvr.cxx`, `sw/source/filter/html`, `sfx2/source/control`, and generated UI resources separate transfer, filter, dispatch, and presentation contracts. | Trace each caller and producer. Consolidate duplicated transforms or policy; retain a layer only if it crosses a real DOM, clipboard, Worker, filter, or React subscription boundary. Do not replace a useful platform port with direct DOM use in `sw/source`. |

### What the current inventory does and does not establish

* The 45 Writer records are deliberately atomic and often list major
  `scopeLimitations`: same-paragraph editing, bounded clipboard formats, selected
  built-in styles, selected ODF properties, and selected UI commands. Keep their
  verified status for those exact assertions, but create additional records
  **using the existing schema** for the remaining behavior of implemented
  commands. Do not promote a whole module from an atomic test result.
* Audit all 102 upstream-mechanism modules, including currently aligned Sfx
  dispatch and shell plumbing. Audit the 19 local-infrastructure modules for
  ownership and removal; `framework` launcher/Worker protocol and storage
  ports can be justified by the browser, while filter transports and model
  codecs need the boundary review above. Audit all 46 browser adaptations for
  domain policy that should reside in the upstream-shaped owner. A `browser-
  adaptation` label is not itself a waiver of functional parity.
* Review all 20 `filenameDivergences` in `source-provenance.json` against their
  stated `stackNecessity`. Keep legitimate ES-module, generated-resource, and
  device-boundary splits. Move any implemented upstream responsibility currently
  hidden behind a browser or helper path to its corresponding path, updating
  source-provenance and runtime-inventory **records**, not their schemas.
* Avoid adding nominal source files whose only purpose is to look like the
  upstream tree. A file is aligned when its code owns the matching upstream
  responsibility and preserves the relevant interfaces and defaults.

## Execution sequence

Each stage is a separately reviewable implementation task. Earlier stages
establish contracts needed by later ones; within a stage, change only the
files relevant to the proven discrepancy.

1. **Lock the comparison set and evidence (P0).** For every export, default,
   command, and emitted artifact in the 167 modules, record the exact upstream
   file/symbol, local owner, contract, default, and a pinned assertion or
   differential fixture in the existing runtime and command inventory data.
   Mark an unsupported native-only operation explicitly; distinguish browser
   necessity from a convenience workaround. Use existing inventory validators,
   `check:source-tree`, and `check:source-provenance`. Output: a prioritized
   discrepancy ledger and no unreviewed `unverified` status for reachable
   operations. This stage changes inventory **content only**.
2. **Restore model item types and defaults (P0).** Replace the tab-stop integer
   surrogate with `SvxTabStopItem` across pool, style defaults, shell, dialogs,
   rulers, ODF and undo. Add document-owned `SwLineNumberInfo` with its pinned
   defaults and shell state, including paragraph count flags. Put user-facing
   values through Sfx slots/items rather than direct React item construction.
   Output: same model item identity and default behavior on new, imported,
   edited, saved, and reopened documents.
3. **Restore Writer layout ownership (P0).** Introduce a stable layout graph
   owned by `sw/source/core/layout` and `sw/source/core/text`, with invalidation
   on document/style/page/item changes. Browser measurement supplies device
   glyph/line metrics; core determines line spacing, paragraph gaps, follows,
   page transitions, and line numbers. Simplify `WriterPlainTextEditor` and
   `writer-view-projection` to paint the resulting frame snapshot. Output:
   upstream-comparable pagination for the supported document structures at
   multiple widths, fonts, page styles, and zoom/device pixel ratios.
4. **Restore shell and UI contract boundaries (P1).** Move paragraph/ruler
   conversion, value validation, command state, and dialog commit policy out of
   `writer-view.tsx`, `WriterAdvancedFormattingControls`, `WriterRulers`, and
   related React components into `SwTextShell`, `SwWrtShell`, `SwView`, and
   pooled items. Keep JSX and accessibility interaction in React. Derive menu,
   toolbar, accelerator, labels, enabled/disabled state, and defaults from
   pinned resources and live bindings for every implemented command. Check
   keyboard, pointer, undo, and mixed-selection behavior. The deliberately
   different browser save UI is excluded.
5. **Restore list, selection, undo, and transfer invariants (P1).** Compare the
   current `SwList`/`SwNodeNum`, `SwPaM`, `SwTextNode`, `SwTransferable`, and
   undo implementation with matching pinned source and tests. Keep canonical
   positions and pool items authoritative through split/merge/restart/copy/
   paste/undo. Make React and clipboard DTOs projections only. Extend parity
   records for all currently reachable variants without treating unsupported
   object/table formats as this iteration's target.
6. **Restore filter and package contracts (P1).** Compare every supported ODT
   stream, token, style, property, list, hyperlink, package default, malformed
   input, and output ordering with pinned source/tests. Fix processing
   instructions and any other demonstrated mismatch. Separate Worker clone
   envelopes from `sw/source/filter/xml`; ensure a single canonical graph
   implementation and stable `SwDocShell`/filter contracts. The browser save
   schedule, storage policy, and dialogs remain as they are.
7. **Remove refactor residue and align paths (P2).** Delete the unused
   `GetCommands` alias, pass-through `writer-command-surfaces`, reverse page
   spacing adapter, and any redundant DTO/codec layers identified by caller
   tracing. Reconcile every local mapped path with its upstream module and
   update `source-provenance.json` and runtime-inventory data. Preserve genuine
   React, DOM, Worker, IndexedDB, file, clipboard, and font-device ports.
8. **Close the implemented-slice audit (gate).** Run existing source-tree,
   provenance, inventory, type, lint, unit, browser, ODT fixture, and static
   build checks. For each currently implemented operation, require a pinned
   upstream source/symbol, a matching contract/default, differential or
   assertion-level behavior evidence, and a clear browser exception when
   applicable. Review any remaining unverified or divergent records by hand;
   do not equate a passing aggregate test suite with upstream parity.

## Acceptance and non-goals

The plan is complete when every **implemented, browser-relevant** operation
has a defensible upstream owner, equivalent observable default and supported
behavior, a compatible model/interface contract, and a corresponding source
location or documented stack-required boundary. Tests should compare pinned
LibreOffice outputs or source assertions at the same operation granularity as
the inventory. UI may remain React; it must preserve the supported command's
behavior and state. A failing upstream comparison becomes a code task or an
explicit browser exception, never a silent `verified` claim.

This program does not implement other LibreOffice applications, unsupported
Writer structures, native integration, recovery, or a different autosave/save
experience. It does not redesign inventory machinery. Existing browser
exceptions in [`autosave-recovery.md`](autosave-recovery.md) and the parity
matrix remain product decisions; any stale prose about recovery should be
corrected only as documentation or inventory data, without adding recovery
code.
