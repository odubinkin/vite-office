# Vite Office Upstream LibreOffice Parity Plan

## Status and baseline

- Plan date: 2026-09-15.
- Agentplane task: `202609150900-RD8B9V`.
- Upstream baseline: LibreOffice tag `libreoffice-26.8.0.2`, peeled commit
  `9bc445578031fecf56086729d8e4940c77e14d65`.
- Local upstream checkout: `vendor/libreoffice-reference`.
- Scope: the functionality that is already implemented in Vite Office, plus the
  shared foundations on which that functionality depends.
- Primary suite in scope: Writer. Calc, Chart, Draw, Impress, Math, and Base are
  currently launcher placeholders and are not treated as implemented office
  modules by this plan.

This is an implementation plan, not a statement that path similarity or an
`implemented` inventory status already constitutes LibreOffice parity.

## Goal

For every browser-relevant capability already present in Vite Office:

1. preserve LibreOffice's public and internal contracts where they are part of
   the implemented slice;
2. preserve the corresponding LibreOffice ownership graph and data model;
3. keep default behavior and serialization semantics equal to the pinned
   upstream version;
4. place code under the upstream-equivalent module and source-unit path;
5. isolate unavoidable browser and React adaptations at explicit boundaries;
6. delete parallel models, pass-through facades, and compatibility layers that
   have no justified long-term role; and
7. prove parity behaviorally rather than by file presence or naming.

React components do not need to reproduce LibreOffice's VCL widget hierarchy.
They do need to consume the same command, state, resource, selection, and model
contracts and expose equivalent behavior for the supported command slice.

## Non-goals

The following are excluded until a browser feature actually requires them:

- native UNO extension loading, native process/service discovery, and desktop
  component registration;
- macros and Basic runtime execution;
- native OS dialogs, native clipboard implementations, scanners, and desktop
  shell integration;
- native printer drivers and pixel-identical desktop printing;
- desktop-only accessibility bridges and window-system backends;
- unimplemented suites merely represented by launcher cards; and
- wholesale porting of unrelated LibreOffice modules.

An excluded implementation does not authorize changing a contract already used
by an in-scope module. A small interface-compatible stub or browser port is
preferable to a second Vite Office-specific domain model.

## Parity decision rules

Every divergence must be recorded as exactly one of these classes:

| Class | Meaning | Required action |
| --- | --- | --- |
| P | Incorrect contract, ownership, default, or behavior | Replace with the pinned upstream semantics |
| A | Architecture divergence not required by TypeScript, React, or browser constraints | Refactor to the upstream architecture |
| B | Necessary browser/TypeScript adaptation | Keep behind a narrow port and document the exact divergence |
| X | Desktop-only functionality outside the browser product | Exclude explicitly; do not simulate false parity |

The burden of proof is on `B` and `X`. TypeScript syntax, garbage collection,
React rendering, asynchronous browser APIs, Web Workers, IndexedDB, and DOM
selection are valid adaptation reasons. Convenience, fewer files, a custom
command namespace, and easier component state management are not.

## Current implementation inventory

### Measured repository inventory

The current inventory records 112 production TypeScript/TSX modules under
`apps/office/src`, approximately 20.6 KLOC. There are 60 test modules with
approximately 13.5 KLOC, plus the shared test setup. The recorded provenance is:

| Classification | Modules | Assessment |
| --- | ---: | --- |
| `upstream-mechanism` | 71 | Requires semantic revalidation; the label currently proves neither API nor behavior parity |
| `browser-adaptation` | 27 | Generally legitimate in purpose, but several are in upstream core/UI paths and own domain behavior |
| `local-infrastructure` | 14 | Must be moved out of upstream-named paths or replaced by upstream-compatible contracts |

Recorded subsystems are:

| Subsystem | Modules | Subsystem | Modules |
| --- | ---: | --- | ---: |
| accelerators | 2 | application services | 7 |
| browser editor | 5 | browser platform | 5 |
| browser presentation | 7 | browser workflows | 1 |
| clipboard transfer | 1 | command shell | 1 |
| composition | 1 | dispatch | 1 |
| document lifecycle | 3 | document model | 17 |
| document shell | 1 | editing view | 2 |
| formatting model | 11 | numbering | 3 |
| ODF filter | 22 | recovery | 2 |
| recovery presentation | 1 | storage contract | 1 |
| undo/redo | 8 | workbench session | 3 |
| Writer shell | 4 | Writer UI configuration | 3 |

The runtime tree currently spans `editeng`, `framework`, `package`, `sfx2`,
`svl`, `sw`, `vcl`, and `xmloff`, with 74 of the 112 modules under `sw`.

### Capability inventory

`docs/program/parity/writer-command-slice.json` contains 35 Writer capability
records, `CAP-0101` through `CAP-0135`. Thirty-four are marked `implemented`;
only `CAP-0130` (bounded ODT round-trip compatibility) is marked `verified`.
The current inventory command also reports 66 open gaps.

The implemented surface comprises:

- command registration, dispatch, enablement, checked state, menu/toolbar/
  shortcut placement, and menu navigation;
- action-based undo/redo;
- model selection, pointer selection, caret movement, IME staging, and a
  `contenteditable` input bridge;
- text mutation, paragraph mutation, character and paragraph attributes,
  styles, hyperlinks, and list kind/level behavior;
- cut, copy, paste, plain-text/HTML transfer, and browser clipboard events;
- Writer document graph, pooled items, numbering rules, document shell, and
  lifecycle-generation state;
- ODF ZIP/manifest, XML import/export, and the bounded ODT round trip;
- browser file open/save/download, IndexedDB primary persistence, save
  acknowledgement, AutoRecovery, and recovery UI; and
- React Writer workbench, menu, toolbars, editor, properties panel, status
  chrome, hyperlink dialog, and recovery prompt.

The six non-Writer suite pages are application-shell placeholders. Their cards
and preview DTOs are not evidence of Calc/Chart/Draw/Impress/Math/Base parity.

Current capability-by-capability assessment:

| Capability | Current maturity | Parity risk found in this audit | Closure phase |
| --- | --- | --- | --- |
| CAP-0101 command registration/dispatch/state | implemented | Custom command namespace and dispatcher contract | P0, P1 |
| CAP-0102 undo/redo | implemented | Action direction is sound; cursor, lifecycle, list, and DOM-fallback integration diverge | P4 |
| CAP-0103 selection/select all | implemented | String paragraph identity and DOM-derived selection replace `SwPaM` | P2, P5 |
| CAP-0104 view visibility | implemented | Workflow DTO owns state instead of view options/bindings | P4, P6 |
| CAP-0105 list-kind mutation | implemented | Flat rule/list model and wrong default activation behavior | P3 |
| CAP-0106 list clipboard serialization | implemented | Transfer reads rendered DOM instead of the Writer model | P5 |
| CAP-0107 list-level mutation | implemented | Placeholder list shell and no `SwNodeNum` tree | P3, P4 |
| CAP-0108 nested-list clipboard serialization | implemented | DOM serialization and scan-derived list state | P3, P5 |
| CAP-0109 direct character formatting | implemented | Incorrect `WhichId`, hard-coded font default, custom slots | P0, P1, P3 |
| CAP-0110 cut/paste | implemented | DOM range DTO rather than `SwPaM`/model transfer | P2, P5 |
| CAP-0111 document graph ownership | implemented | `SwDoc extends SwModify`, missing managers, persisted UI IDs | P2 |
| CAP-0112 pooled items/item sets | implemented | Wrong IDs and incomplete used-state/range semantics | P0, P1 |
| CAP-0113 ODF ZIP/manifest | implemented | Strong bounded port; browser limits and contract leakage remain | P7 |
| CAP-0114 lifecycle generations | implemented | Parallel `OfficeDocument` state machine | P4 |
| CAP-0115 menu/toolbar/shortcut placement | implemented | Manually duplicated resources and non-UNO IDs | P1, P6 |
| CAP-0116 menu navigation | implemented | Browser behavior is valid but Writer-specific and resource-coupled | P6 |
| CAP-0117 pointer selection | implemented | DOM adapter is valid; canonical target position is not | P2, P5 |
| CAP-0118 keyboard caret movement | implemented | Browser adapter is valid; selection ownership is not canonical | P2, P5 |
| CAP-0119 IME | implemented | Required browser bridge mixed with DOM reconciliation | P5 |
| CAP-0120 browser clipboard events | implemented | Dependency direction into DOM-owning `SwTransferable` is reversed | P5 |
| CAP-0121 file workflow | implemented | Valid browser ports coordinated by an oversized workflow controller | P4, P7 |
| CAP-0122 recovery prompt | implemented | React is valid; recovery/lifecycle policy ownership is split | P4, P6, P7 |
| CAP-0123 paragraph structure | implemented | Core operations and shell ownership are incomplete | P2, P4 |
| CAP-0124 text mutation | implemented | Full-DOM reconciliation can replace whole paragraphs | P2, P5 |
| CAP-0125 paragraph properties | implemented | Item/style defaults and UI state do not match upstream | P1, P2, P3 |
| CAP-0126 character attributes | implemented | Incorrect IDs and snapshot-shaped core ownership | P0, P1, P2 |
| CAP-0127 numbering-rule ownership | implemented | Missing list manager/tree and divergent rule defaults | P3 |
| CAP-0128 ODF XML import | implemented | Bounded behavior works; context and lifecycle contracts diverge | P7 |
| CAP-0129 ODF XML export | implemented | Bounded behavior works; context and model contracts diverge | P7 |
| CAP-0130 ODT round trip | verified, bounded | Evidence is narrow and must remain explicitly bounded | P7, P8 |
| CAP-0131 IndexedDB primary persistence | implemented | Valid platform port serializes the parallel snapshot model | P4, P7 |
| CAP-0132 primary-save acknowledgement | implemented | Generation extension is detached from object-shell save completion | P4 |
| CAP-0133 AutoRecovery scheduling | implemented | Browser scheduling is valid; shell/framework ownership diverges | P4, P7 |
| CAP-0134 `contenteditable` input | implemented | DOM reconciliation creates a second writable model | P5 |
| CAP-0135 hyperlinks/ODF `text:a` | implemented | UI bypasses dispatch; selection and filter ownership need alignment | P1, P2, P5, P7 |

### What is already directionally sound

The following areas should be retained and tightened rather than discarded:

- the Writer text-node, hint, pooled-item, undo-action, and document-shell names
  are recognizably based on upstream concepts;
- ODF package and XML code is separated into `package`, `xmloff`, and Writer
  filter areas, and the Web Worker boundary is appropriate for the browser;
- browser file, clipboard, download, IndexedDB, local-font, lifecycle-event,
  and Worker ports are legitimate platform adaptations;
- the model, shell, React presentation, and end-to-end layers have substantial
  automated coverage; and
- the pinned upstream checkout and evidence records make deterministic
  comparison possible.

These strengths do not compensate for incompatible identifiers, ownership, or
default behavior in the same feature slice.

## Executive findings

### Critical contract defects

1. **Writer character `WhichId` values are wrong.**
   `apps/office/src/sw/inc/hintids.ts` assigns `RES_CHRATR_FONT = 1` and
   `RES_CHRATR_CJK_FONT = 20`. In pinned `sw/inc/hintids.hxx`, they are
   `RES_CHRATR_BEGIN + 6` and `RES_CHRATR_BEGIN + 21`, therefore 7 and 22.
   `RES_CHRATR_CTL_FONT = 27` is correct. A local test explicitly locks the
   incorrect Western font value into snapshots. This is a public data contract
   defect affecting item ranges, snapshots, mappings, and persistence.

2. **Command identity is incompatible.**
   `sw/uiconfig/swriter/menubar/menubar-commands.ts` publishes private IDs such
   as `writer.format.bold`, `writer.file.open-odt`, and
   `writer.list.default-numbering`. LibreOffice uses `.uno:` command URLs,
   generated Sfx slot IDs, `SfxRequest` arguments, item-set return state, and
   bindings invalidation. React does not require replacing those contracts.

3. **Path provenance is treated as semantic parity.**
   The current inventory succeeds despite the two defects above, 66 known gaps,
   placeholder modules, and browser/React implementations occupying upstream
   source paths. It checks evidence resolution and markers more strongly than
   constants, inheritance, API shape, defaults, ownership, or negative import
   boundaries.

These defects are P0: no new Writer feature should build on the affected
contracts until they are fixed and guarded.

### Unjustified core architecture divergences

| Area | Current implementation | Pinned upstream authority | Finding and target |
| --- | --- | --- | --- |
| `SwDoc` ownership | `sw/source/core/doc/doc.ts` declares `SwDoc extends SwModify` | `sw/inc/doc.hxx` declares final `SwDoc` and owns document managers | Remove the inheritance. Port the managers needed by the current slice and route state/list/style/undo/content operations through them. |
| Source-unit responsibility | `doc.ts` combines construction, styles, numbering, cloning, and persistence | `docnew.cxx`, `docfmt.cxx`, `docnum.cxx`, `DocumentStylePoolManager.cxx`, `DocumentListsManager.cxx` | Split by upstream responsibility. TS may combine a matching header/implementation pair, not unrelated upstream source units. |
| Notifications | Local document/nodes broadcast custom typed hints through a generic broadcaster | `sw/inc/calbck.hxx` uses `SwClient`/`SwModify` registration chains and modern `BroadcasterMixin` where appropriate | Implement the bounded upstream listener semantics, including registration, reparenting, and object-death behavior. Do not use document inheritance as a shortcut. |
| Serialization | `SwDoc`, `SwTextNode`, styles, items, item sets, hints, and numbering own `toSnapshot`/`fromSnapshot` | Core model is not an IndexedDB DTO graph | Move codecs to an explicit browser persistence/filter boundary. Core types expose canonical operations only. |
| Document identity | Persisted string paragraph IDs are part of `SwTextNode`; `viewfunc.ts` manufactures `writer-paragraph-N` | `SwNodes`, `SwNodeIndex`, `SwPosition`, and `SwPaM` define position/selection identity | Use canonical node/position identity. Keep stable React keys in an external view mapping, never in ODF or recovery domain state. |
| View snapshot | `WriterViewSnapshot` is advertised as immutable while containing mutable `SwDoc`/`SwTextNode` references | `SwView`, shells, bindings, and model notifications expose live state with explicit ownership | Replace it with a versioned presentation projection or direct shell getters. Do not freeze only the outer wrapper. |
| Lifecycle | `OfficeDocument` plus pure `markDocument*` transitions exists alongside `SfxObjectShell` | `include/sfx2/objsh.hxx` and `docfile.hxx` define stateful `SfxObjectShell`/`SfxMedium` contracts | Restore object-shell and medium identity. Keep asynchronous content/save/recovery generations as a documented browser extension on the shell. |
| Writer facade | `sw/source/core/doc/writer.ts` aliases canonical types and forwards snapshot methods | Consumers use Writer model types directly | Delete the facade after callers use `SwDoc`, `SwTextNode`, `SwPaM`, styles, and filter/browser codecs directly. |
| Numbering/list model | Flat DTOs and paragraph scans calculate markers | `sw/inc/list.hxx`, `SwNodeNum.hxx`, `number.cxx`, `list.cxx`, `DocumentListsManager.cxx` | Port `SwList`, `SwNodeNum`, list-item registration, and document list management for the supported list slice. |
| Styles | `poolfmt.ts` manually invents names, parent/follow links, and lazy style instances | `poolfmt.hxx`, `SwStyleNameMapper`, and `DocumentStylePoolManager.cxx` | Generate/port exact IDs and programmatic names, then implement actual default attributes, parent/follow behavior, and locale display names. |
| Fonts | All scripts default to hard-coded `Liberation Serif` | `fontcfg.cxx`, language/script configuration, and VCL default-font selection | Preserve script- and locale-specific model defaults; resolve to available browser fonts only at the VCL/browser device boundary. |

### Numbering defaults are behaviorally different

The current implementation uses fixed rules such as
`__WriterDefaultBullet`/`__WriterDefaultNumbering`, uniform level formats, and a
linear paragraph scan to display counters. Pinned
`SwWrtShell::NumOrBulletOn` searches for a suitable preceding rule, respects
paragraph-style and outline rules, continues list IDs, distinguishes automatic
rules, configures ten levels, and applies upstream bullet/numbering, font,
indent, and RTL defaults. This is not a cosmetic gap; it changes document data,
undo behavior, ODF output, and visible numbering.

### Command, dispatch, and UI resource divergences

1. `framework/source/dispatch/dispatchprovider.ts` is a large custom registry
   and shell dispatcher under an upstream path, but does not implement the
   corresponding LibreOffice dispatch-provider contract.
2. `sw/source/uibase/shells/writercommands.ts` combines labels, presentation
   metadata, enablement, state queries, and handlers under a path claiming
   `sw/sdi/swriter.sdi` provenance.
3. Menu and toolbar arrays duplicate command IDs, labels, and placement instead
   of consuming the pinned `menubar.xml`, `standardbar.xml`, `textobjectbar.xml`,
   and `numobjectbar.xml` resource contracts.
4. `sw/source/uibase/shells/listsh.ts` is only a two-value action type despite
   occupying the upstream `listsh.cxx` responsibility.
5. `sw/source/uibase/wrtsh/delete.ts` contains browser input grouping helpers,
   not the upstream Writer deletion source-unit behavior.

The target is a bounded but real Sfx dispatch path: `.uno:` URL to slot, slot to
shell, `SfxRequest`/`SfxItemSet` arguments and return state, bindings invalidation,
and context-sensitive shell selection. UI resources must be generated from, or
structurally equivalent to, the pinned XML/SDI sources. Unsupported entries may
be filtered at presentation time without changing the supported entries'
identity or order.

## UI and previous-refactoring residue

### React/browser code in upstream implementation paths

- `sw/source/uibase/uiview/view-session.ts` contains the actual `SwView`, while
  `view.tsx` contains React. Move `SwView` to the upstream-equivalent `view.ts`
  responsibility and the React workbench to `sw/browser/presentation`.
- `sw/source/uibase/app/swmodule.tsx` mixes `SwModule`, session creation,
  IndexedDB, Worker selection, timers, browser globals, recovery UI, and React.
  Keep the upstream-shaped module/factory in `sw/source`; move browser
  composition and React to `sw/browser`.
- `framework/source/services/desktop.tsx`, `bootstrap.tsx`, `SuiteCard.tsx`, and
  the current React-factory `modulemanager.ts` are launcher code, not UNO
  Desktop/ModuleManager implementations. Move them to `framework/browser` and
  reserve upstream paths for compatible contracts.
- Browser ODT Worker clients/runtimes should live in a browser integration
  subtree; only the actual Writer filter implementation belongs in
  `sw/source/filter/xml`.
- Generic browser storage/recovery helpers under `svl/source/misc` must move to
  a browser/platform subtree unless they implement the matching upstream
  `svl` contract.

### Redundant or leaking adapters

| Artifact | Problem | Disposition |
| --- | --- | --- |
| `sw/source/core/doc/writer.ts` | Alias/barrel facade and snapshot codec hide canonical ownership | Delete after import migration |
| `sw/browser/workflows/writer-workflows.ts` | Central controller owns file, ODT, storage, clipboard, view options, and status formatting | Decompose into `SfxObjectShell`/`SwDocShell`, `SwTransferable`, view option, and thin browser ports |
| `sw/browser/presentation/command-source.ts` | Three-method pass-through duplicates the dispatcher/bindings API | Delete; expose an upstream-shaped binding source to React |
| `WriterOperationStatus` union | A large browser workflow status model substitutes for shell/bindings/error reporting | Replace with command completion and binding notifications; keep platform errors at the port |
| `markDocumentHistoryRestored` | Production-unused lifecycle transition retained only by tests after action-based undo | Remove after lifecycle/undo migration |
| `viewfunc.ts` workbench helpers | String-ID document construction under an unrelated upstream source name | Move browser fixtures/composition out; implement matching view operations only when needed |
| `listsh.ts` alias | Placeholder claims an upstream implementation role | Replace with a real bounded shell or remove until implemented |
| duplicate comment in `core/doc/list.ts` | Mechanical refactor residue | Remove during list-model replacement |

### DOM as a second document model

The most serious UI-layer issue is not React itself; it is that DOM content and
`data-*` attributes temporarily become authoritative Writer data.

- `sw/source/uibase/dochdl/swdtflvr.ts` accepts `Document`, `Selection`, and
  `Range`, queries all Writer paragraphs, and reads paragraph/list/style data
  from the DOM. Upstream `SwTransferable` builds transfer content from the model
  and `SwPaM`, not by scraping the rendered view.
- `sw/browser/editor/writer-clipboard-events.ts` calls that DOM-owning transfer
  code, reversing the intended dependency direction.
- `edtwin.tsx` lets unsupported `beforeinput` operations mutate the DOM and then
  reconciles the full paragraph back into `SwWrtShell.InsertText`.
- `SwWrtShell.InsertText` diffs full DOM text and may fall back to a whole-
  paragraph replace undo action.
- `edtwin-paragraph.tsx` builds a temporary `<p>`, compares `innerHTML`, calls
  `replaceChildren`, and repairs selection afterward. This mixes React and
  imperative DOM ownership and is fragile for selection, IME, and formatted
  runs.
- `data-writer-paragraph-id`, list-kind/level, and hyperlink attributes are
  consumed as domain data rather than opaque rendering metadata.

Target rule: all editing and clipboard operations resolve a DOM endpoint to a
canonical `SwPosition`/`SwPaM` and mutate/read the model through `SwWrtShell` and
`SwTransferable`. Unsupported browser mutations are prevented and the canonical
model is reprojected; they are never accepted as a model replacement. React keys
and DOM markers remain opaque mappings owned by the browser editor adapter.

### Presentation defects and misleading parity

- `view.tsx` special-cases the hyperlink command, opens a React modal, and
  returns a fabricated executed result without dispatching the command. Dialog
  request and completion must flow through the command/controller contract.
- `view.tsx` reads `globalThis.getSelection()` for individual commands. One
  browser selection adapter should maintain the shell's canonical selection.
- Writer command and formatting toolbars duplicate rendering and state-query
  loops. Replace them with generic command-surface presenters.
- `textobjectbar` and `numobjectbar` are merged permanently. LibreOffice switches
  object bars with shell/context; the browser UI must do the same.
- The style selector offers styles whose real upstream attributes and behavior
  are not implemented. Do not advertise a style merely because its name exists.
- `WriterPropertiesPanel` is static, English-only output rather than a
  command/bindings-driven properties surface. Implement the supported controls
  or mark the panel unavailable.
- Workspace chrome displays a decorative ruler and hard-coded status values
  such as page count, plain-text mode, and language. Derive these from real
  layout/document state or remove them until that state exists.
- Labels are mostly hard-coded English. Resource identity and locale text must
  come from generated/pinned command and localization data, with a deliberate
  browser localization adapter.
- `WriterMenuBar` has a custom Writer-specific ARIA state machine. Keep the
  browser accessibility behavior, but make it a shared resource-driven menu
  presenter and clear its typeahead timer on unmount.

## Filter, storage, and recovery assessment

ODF is currently the strongest parity area, but its verified claim is bounded:

- store-only ZIP, ZIP32, and memory/file-size limits are acceptable browser
  constraints when explicitly recorded;
- `saxes` and Web Workers are acceptable implementation substitutions;
- XML parsing/export functions should converge on the relevant
  `SvXMLImportContext`/token/context ownership rather than remain unrelated
  procedural helpers under upstream names;
- `OfficeDocument` metadata must not leak into Writer XML/filter contracts;
- HTML clipboard import belongs to a filter or browser import boundary, not the
  DOM-owning `SwTransferable` implementation; and
- one bounded round-trip fixture does not establish general ODT parity.

IndexedDB, browser lifecycle events, leases, and asynchronous writes are valid
browser adaptations. Their contracts must attach to `SfxMedium`,
`SfxObjectShell`/`SwDocShell`, and framework AutoRecovery concepts rather than
define a parallel immutable document lifecycle. Schema changes required by
corrected `WhichId` or model contracts must bump the storage schema. Incompatible
pre-parity snapshots should be rejected with an explicit recovery diagnostic;
do not preserve incorrect core IDs through a permanent compatibility shim.

## Target architecture and source layout

The exact set grows only as the supported slice grows, but the dependency
direction must be:

```text
React presentation
  -> browser editor/composition adapters
    -> Sfx dispatch, bindings, view and document shells
      -> Writer core model/managers and svl/editeng foundations
        -> package/xmloff/filter code

browser platform ports
  -> injected into VCL/Sfx/filter boundaries
  -X-> Writer core domain model
```

Target responsibilities include:

```text
apps/office/src/
  editeng/                         # exact items used by the Writer slice
  framework/source/                # upstream-shaped dispatch/services only
  framework/browser/               # React launcher and browser composition
  package/source/zipapi/           # bounded package implementation
  sfx2/source/control/             # slots, request, bindings, dispatcher
  sfx2/source/doc/                 # SfxObjectShell and SfxMedium behavior
  svl/source/items/                # item pool/set/item contracts
  svl/source/notify/               # broadcaster/listener contracts
  svl/source/undo/                 # SfxUndoManager/actions
  sw/inc/                          # exact Writer IDs and public model contracts
  sw/source/core/doc/              # docnew/docfmt/docnum and document managers
  sw/source/core/docnode/          # SwNodes and position/index ownership
  sw/source/core/txtnode/          # SwTextNode, hints and attributes
  sw/source/core/undo/             # Writer undo actions
  sw/source/filter/                # model-based import/export logic
  sw/source/uibase/app/            # SwModule and SwDocShell
  sw/source/uibase/dochdl/         # model-based SwTransferable
  sw/source/uibase/shells/         # context shells and slot execution/state
  sw/source/uibase/uiview/         # SwView, not React
  sw/source/uibase/wrtsh/          # SwWrtShell operations
  sw/sdi/                          # generated/ported slot schema
  sw/uiconfig/swriter/             # generated pinned resource data
  sw/browser/composition/          # service assembly and lifecycle hooks
  sw/browser/editor/               # DOM/selection/input projection only
  sw/browser/persistence/          # snapshots, IndexedDB and migrations
  sw/browser/platform/             # file, clipboard, Worker and font ports
  sw/browser/presentation/         # React Writer UI
  vcl/browser/                     # browser device/window/system ports
  xmloff/source/                   # bounded XML context/token implementation
```

No module classified as `upstream-mechanism` may import React, JSX, DOM types,
`window`, `document`, IndexedDB, browser clipboard/file APIs, or browser Worker
construction. Exceptions require an explicit `B` record and a browser path.

## Contracts that must remain recognizable

For the implemented slice, preserve or introduce these upstream concepts rather
than Vite Office aliases:

- exact numeric `WhichId`, pool range, slot ID, and enum values;
- `.uno:` command URLs and their argument/state item contracts;
- `SfxPoolItem`, `SfxItemSet`, `SfxItemPool`, invalid/disabled item states, and
  bounded sharing/range semantics used by Writer;
- `SfxBroadcaster`/listener and Writer `SwModify`/`SwClient` semantics where the
  current model depends on them;
- `SfxUndoAction`, `SfxUndoManager`, Writer undo grouping, comments, cursor
  restore, and default history behavior;
- `SfxObjectShell`, `SfxMedium`, `SwDocShell`, modified/save-completion/close
  behavior, and object identity;
- `SwDoc` manager composition, `SwNodes`, `SwNodeIndex`, `SwPosition`, `SwPaM`,
  `SwTextNode`, and the relevant content operation ownership;
- `SwList`, `SwNodeNum`, `SwNumRule`, list IDs, continuation, and level defaults;
- Writer style pool IDs, programmatic/display names, parent/follow links, and
  real default attribute sets;
- `SwView`, `SwWrtShell`, context shells, Sfx bindings invalidation, and view
  options;
- model-based `SwTransferable` and filter-driven clipboard formats; and
- the bounded `xmloff` import/export context and token contracts used by ODT.

Names may be idiomatic TypeScript where the language requires it, but public
shape and ownership must remain mechanically traceable to the pinned source.

## Execution plan

Each work package must have its own Agentplane task, upstream evidence, explicit
acceptance tests, and capability-record updates. Packages are ordered by data
contract dependency, not UI visibility.

### Phase 0 — Make parity measurable

#### P0.1 Exact invariant manifest

- Generate a checked-in manifest for every currently used Writer/editeng/svl
  numeric constant, pool range, enum, slot ID, command URL, and documented
  default from the pinned headers/SDI/resources.
- Correct `RES_CHRATR_FONT` to 7 and `RES_CHRATR_CJK_FONT` to 22; audit all
  remaining values instead of assuming adjacent constants are correct.
- Make local tests consume or compare with the manifest. Never duplicate an
  expected wrong literal in a snapshot test.
- Bump browser persistence schemas affected by corrected IDs and reject old
  incompatible records with a user-visible recovery diagnostic.

Acceptance: generated parity checks fail when any used pinned invariant changes;
all local pools, ODF mappings, and snapshots use the corrected IDs.

#### P0.2 Semantic provenance and boundary checks

- Extend runtime inventory with `upstreamFile`, upstream symbol(s), local
  symbol(s), contract status, behavior status, default status, divergence class,
  and justification/evidence.
- Add AST/API checks for expected inheritance, exported method shape, and
  prohibited imports.
- Add a source-responsibility rule: a local file under an upstream-equivalent
  path may not claim a different source unit's behavior.
- Add boundary linting for React/DOM/browser globals in core, `inc`, Sfx shell,
  filter-core, and uiconfig data modules.
- Fail inventory when a placeholder is `upstream-mechanism`, a browser adapter is
  in an upstream implementation path, or a `B` divergence lacks evidence.

Acceptance: the current `SwDoc extends SwModify`, React-in-uiview, DOM-in-
`swdtflvr`, custom command namespace, and placeholder `listsh` cases are caught
automatically.

#### P0.3 Re-attest the 35 capabilities

- Add separate `implemented`, `contractParity`, `behaviorParity`,
  `defaultParity`, and `verified` fields.
- Retain `CAP-0130` as explicitly bounded, not general ODT parity.
- Demote any capability whose only evidence is path presence, custom tests that
  encode local behavior, or a placeholder UI.
- Attach exact upstream tests/resources and local differential assertions.

Acceptance: the summary cannot conflate a locally working feature with upstream
parity and cannot pass with unresolved P0 contract defects.

### Phase 1 — Restore identifiers, items, dispatch, and resources

#### P1.1 Item and attribute contracts

- Audit and port the exact used `SfxPoolItem`/`SfxItemSet`/`SfxItemPool` subset,
  including invalid/disabled states and pool ranges.
- Remove snapshot methods from item classes; implement codecs under
  `sw/browser/persistence`.
- Add cross-checks for clone/equality/default-item behavior and script-specific
  Writer attributes.

#### P1.2 Sfx slot and command pipeline

- Introduce the bounded `SfxRequest`, dispatcher, bindings, shell-interface,
  slot metadata, argument item, return item, enablement, and checked-state path.
- Replace every public `writer.*` command with its pinned `.uno:` URL and slot
  identity. Keep browser-only commands in a visibly browser-owned namespace and
  do not pretend they are upstream commands.
- Remove `command-source.ts` and the presentation-aware parts of
  `writercommands.ts` after migration.

#### P1.3 Generated UI resources

- Build a deterministic generator for the supported subset of Writer SDI,
  menubar, toolbar, accelerator, label, and localization resources.
- Preserve upstream ordering, context, command URLs, and default shortcuts.
- Record unsupported entries as filtered `X` capabilities rather than replacing
  them with custom IDs or labels.

Acceptance for Phase 1: a supported action has one identity from resource to
React event to slot execution to binding state, and no Writer-specific command
metadata is duplicated in presentation components.

### Phase 2 — Restore the Writer document graph

#### P2.1 Split `SwDoc` and add bounded managers

- Make `SwDoc` final in ownership terms and remove `SwModify` inheritance.
- Split construction, style, numbering/list, state, content operations, and undo
  access according to pinned source responsibilities.
- Port the manager interfaces/classes needed by the current 35 capabilities:
  content operations, lists/list items, state, undo, settings, and style pool.
- Route document modification through the state manager and shell contract.

#### P2.2 Canonical nodes and positions

- Complete the used `SwNodes`/`SwNodeIndex`/`SwPosition` invariants and introduce
  a bounded `SwPaM` as the only core selection/range contract.
- Remove persistent string IDs from `SwTextNode`, Writer snapshots, filters, and
  undo data.
- Provide an external WeakMap/versioned projection for React keys and DOM
  endpoint mapping.

#### P2.3 Listener and notification semantics

- Replace generic broadcaster shortcuts with the relevant
  `SwClient`/`SwModify` or modern `BroadcasterMixin` behavior.
- Test listener registration, replacement, parent-style propagation, object
  death, batched operations, and shell invalidation.
- Ensure `SwDoc` itself does not become a Writer modify node merely to notify UI.

#### P2.4 Remove the snapshot-shaped core

- Move document, node, hint, item, style, and numbering codecs to browser
  persistence and ODF filter adapters.
- Delete `writer.ts` and convert all callers to canonical model types.
- Replace mutable-reference `WriterViewSnapshot` with an explicit presentation
  projection carrying primitive/resource IDs and a model revision.

Acceptance for Phase 2: core model tests run without DOM/React/browser globals,
model state has one owner, and every selection/mutation is expressed through
canonical positions and document operations.

### Phase 3 — Restore styles, fonts, and list defaults

#### P3.1 Style pool parity

- Generate/port exact pool IDs and programmatic names from `poolfmt.hxx` and
  `SwStyleNameMapper` data.
- Port the supported `DocumentStylePoolManager` creation paths, real item sets,
  parent/follow links, outline assignments, and locale display names.
- Do not show a style in React until its supported upstream semantics exist.

#### P3.2 Default font policy

- Port the script/language default-font decision model used by Writer.
- Treat browser font enumeration and fallback resolution as a VCL device port.
- Test Western/CJK/CTL defaults under representative locales and unavailable
  font conditions without changing the document-level default contract.

#### P3.3 Numbering/list graph

- Port bounded `SwList`, `SwNodeNum`, `DocumentListsManager`, list-item
  registration, invalidation, and counter-tree behavior.
- Port `SwWrtShell::NumOrBulletOn` behavior for the supported subset: rule
  continuation/search, automatic rules, list IDs, ten levels, bullet font/
  characters, numbering formats, indents, and directionality.
- Replace scan-derived markers and fixed global rule names.
- Verify ODF list import/export and undo against the same model.

Acceptance for Phase 3: upstream fixture documents and equivalent edit sequences
produce the same style/list model, visible labels, and ODF structures for the
supported subset.

### Phase 4 — Restore shells, lifecycle, workflows, and undo integration

#### P4.1 `SfxMedium` and `SfxObjectShell`

- Replace `SfxMediumDescriptor` value copying with an object whose identity and
  load/save/filter state follow the used `SfxMedium` contract.
- Replace pure `OfficeDocument` transitions with `SfxObjectShell` state and
  modified/save-completion/close methods.
- Attach browser asynchronous generation and acknowledgement data as a narrow
  extension, not a second document type.
- Remove `markDocumentHistoryRestored` once no production path depends on it.

#### P4.2 `SwDocShell`, `SwView`, and `SwWrtShell`

- Make document/view/write shells own the operations assigned to them upstream.
- Move `SwView` to the upstream view source responsibility; remove pass-through
  workflow methods.
- Replace string cursor DTOs with `SwPaM` and shell-owned selection.
- Port the real bounded context shells, including list shell execution/state.

#### P4.3 Decompose browser workflows

- Move open/save/export coordination to object/document shell and medium.
- Move transfer creation and paste insertion to `SwTransferable`/`SwWrtShell`.
- Move view visibility to a bounded `SwViewOption`/view-state owner.
- Replace the central status union with Sfx command completion, bindings state,
  and explicit platform error results.

#### P4.4 Undo conformance

- Re-run undo tests after the canonical node/list/style migrations.
- Match upstream action grouping, action comments, cursor restore, list/style
  actions, modified-state transitions, and configured history limit for the
  supported input slice.
- Delete full-paragraph replacement fallbacks used only by DOM reconciliation.

Acceptance for Phase 4: file, edit, format, list, link, undo/redo, save, recovery,
and close operations travel through the same shell/medium ownership graph and
produce the same supported default behavior as pinned LibreOffice.

### Phase 5 — Make the browser editor a projection

#### P5.1 Central DOM-to-model selection adapter

- Maintain one mapping from DOM leaf/key/offset to `SwPosition` and `SwPaM`.
- Update shell selection on browser `selectionchange`; command handlers never
  call `globalThis.getSelection()` independently.
- Treat `data-*` values as opaque lookup keys only.

#### P5.2 Input-intent coverage

- Map all supported `beforeinput`, keyboard, composition, pointer, drag/drop,
  and paste intents to shell operations.
- Prevent unsupported DOM mutations and reproject canonical state.
- Remove the diagnostic full-text reconciliation path and its dataset counters.
- Preserve browser-specific IME staging only in the editor adapter.

#### P5.3 Single rendering owner

- Render model runs with stable keys and deterministic selection restoration.
- Eliminate temporary-paragraph `innerHTML` comparison and `replaceChildren`
  reconciliation inside React components.
- Stress-test nested formatting, hyperlinks, bidirectional text, grapheme
  boundaries, IME, multi-paragraph selection, and rapid undo/redo.

#### P5.4 Model-based transfer

- Make `SwTransferable` consume `SwPaM` and Writer model data only.
- Keep browser ClipboardEvent/DataTransfer translation in `sw/browser/platform`
  or `vcl/browser`.
- Route HTML parsing through the bounded HTML filter/import path and insert the
  result through Writer operations.

Acceptance for Phase 5: DOM mutation cannot change document state without a
Writer operation, and copy/paste output is independent of the rendered DOM
shape.

### Phase 6 — Rebuild React presentation over upstream contracts

#### P6.1 File moves and composition cleanup

- Move all React components and browser composition out of upstream
  implementation paths.
- Keep `SwModule`, `SwView`, shells, dispatch, and resources React-free.
- Move generic suite launcher cards/pages to `framework/browser`; remove stale
  task IDs and lifecycle previews that suggest module implementation.

#### P6.2 Generic resource-driven command surfaces

- Implement shared menu, toolbar, shortcut, and command-control presenters over
  Sfx bindings and generated resources.
- Switch object bars by active context instead of merging text and numbering
  controls.
- Centralize focus, typeahead, submenu, teardown, and ARIA behavior.

#### P6.3 Dialog controller boundary

- Dispatch hyperlink and other dialog commands normally.
- Let the shell/controller emit a typed dialog request; React presents it and
  returns the result to complete the request.
- Delete fabricated successful command results and UI-side argument discovery.

#### P6.4 Honest chrome and localization

- Connect properties controls, status bar, page information, language, and ruler
  to real shell/layout state.
- Hide features that have no real model/layout state instead of rendering
  decorative placeholders.
- Generate command labels and localized style names from pinned resources and
  route locale selection through one browser localization service.

Acceptance for Phase 6: changing React component structure cannot alter command
semantics, defaults, or stored document data; all shown state is real and all
shown controls operate through bindings/dispatch.

### Phase 7 — Align filters, persistence, and recovery

#### P7.1 XML context model

- Convert the supported procedural XML importer/exporter pieces into the
  corresponding bounded context/token ownership used by `xmloff`.
- Preserve streaming via `saxes` and Worker execution as `B` adaptations.
- Remove lifecycle DTOs from filter contracts.

#### P7.2 Browser persistence boundary

- Define versioned codecs outside core with explicit model-version and baseline
  identifiers.
- Add migrations only for valid prior schemas; reject the known wrong-ID schema
  rather than perpetuating it in core.
- Keep IndexedDB implementation behind `SfxMedium`/recovery ports and test
  interrupted write, lease, corruption, and newest-valid-generation behavior.

#### P7.3 AutoRecovery ownership

- Keep timers, `pagehide`, visibility events, and cross-tab leases in browser
  composition.
- Align registered-document, modified-state, recovery entry, and completion
  behavior with framework AutoRecovery and object-shell contracts.
- Keep the React recovery prompt as presentation over a controller, not the
  owner of recovery policy.

#### P7.4 Broaden bounded ODT parity evidence

- Add pinned Writer fixtures covering the currently supported paragraph,
  character, hyperlink, style, list, metadata, and manifest cases.
- Compare normalized package/XML output and reopen behavior with headless pinned
  LibreOffice where deterministic execution is available.
- Keep explicit limits for ZIP32, store-only output, unsupported package parts,
  and maximum browser memory size.

Acceptance for Phase 7: the same canonical Writer graph feeds primary storage,
recovery, clipboard, and ODT filters; no persistence DTO becomes a core model.

### Phase 8 — Differential verification and capability closure

For every `CAP-0101`–`CAP-0135` record:

1. name the exact pinned source symbols, resources, and relevant upstream tests;
2. run invariant/API checks;
3. run local unit and browser interaction tests;
4. run a differential operation/fixture test where LibreOffice can execute the
   same scenario;
5. compare defaults before applying any explicit user setting;
6. verify import, mutation, undo/redo, export, and reopen where applicable; and
7. record remaining `B` and `X` differences with evidence.

A capability becomes `verified` only when contract, ownership, behavior,
defaults, and relevant serialization all pass. Phase 8 closes with zero
unclassified divergences and no placeholder counted as module parity.

## Dependency order

```text
P0 invariant/provenance guards
  -> P1 item IDs + dispatch/resources
    -> P2 document graph + positions + listeners
      -> P3 styles/fonts/lists
        -> P4 shells/lifecycle/undo
          -> P5 browser editor/transfer
            -> P6 React presentation
              -> P7 filters/persistence/recovery
                -> P8 capability re-verification
```

P7 fixture work may run alongside P3–P6, but persistence schema finalization
depends on the corrected P1–P4 model contracts. React cleanup must not introduce
another interim command or document model.

## Required verification for every implementation task

Each task must run the narrowest relevant tests plus these repository gates:

```bash
npm run inventory:parity
npm test
node .agentplane/policy/check-routing.mjs
ap doctor
git diff --check
```

Additional required evidence by area:

- invariant changes: generated pinned-value comparison;
- model changes: model-only tests with no DOM environment dependency;
- command changes: `.uno:` URL/slot/request/state and bindings invalidation tests;
- UI changes: component tests plus browser end-to-end keyboard, pointer, IME,
  clipboard, and accessibility flows;
- ODF changes: package/XML fixture comparison and reopen round trip;
- persistence changes: upgrade/rejection, corruption, concurrency, and recovery
  generation tests; and
- path moves: provenance inventory and prohibited-import checks.

Tests that merely restate a local implementation literal are not parity
evidence. Where upstream behavior is difficult to execute automatically, retain
the exact pinned source excerpt/symbol and a focused golden fixture explaining
the derivation.

## Principal risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Large-bang replacement destabilizes the working Writer slice | Regressions become hard to attribute | Deliver manager/contract seams in dependency order and keep every work package independently green |
| Temporary adapters become permanent | A third architecture survives beside old and target models | Every temporary adapter needs an owner, deletion condition, and same-phase or next-phase removal task |
| Correct IDs invalidate IndexedDB/recovery records | Old local documents may not reopen | Version the codec, detect the affected schema, provide explicit rejection/recovery messaging, and never translate wrong IDs inside core |
| Upstream behavior depends on desktop-only services | Port can accidentally replace semantics with browser guesses | Preserve the interface/default decision first, inject a documented `B` port, and exclude only the unavailable backend |
| React refactoring changes editing semantics | Selection, IME, clipboard, and undo regressions | Establish canonical selection/input tests before moving components and verify with real-browser E2E flows |
| Generated SDI/XML resources drift from pinned upstream | Command identity and placement silently diverge again | Make generation deterministic, record the baseline SHA, and compare generated output in CI |
| Differential output contains nondeterministic metadata | Golden tests become noisy or weak | Normalize only enumerated volatile fields; compare all domain XML/model state |
| Existing tests encode local behavior as truth | A green suite can preserve known defects | Require independent pinned invariant, source-symbol, resource, or differential evidence for parity status |
| File moves obscure history and provenance | Reviewers cannot distinguish moves from rewrites | Separate mechanical moves from behavioral commits and regenerate the path inventory after each move |
| Unsupported UI remains visible | Users mistake decorative controls for implemented parity | Hide or mark unsupported resource entries and require real bindings state for every visible control |

## Stop and re-approval rules

Stop the program and revise this plan before proceeding if:

- the pinned LibreOffice baseline changes;
- a required browser adaptation changes a public Writer/Sfx/xmloff contract;
- an existing user document cannot be migrated or explicitly rejected without
  data loss beyond the approved wrong-schema cleanup;
- a supposedly browser-only exclusion is required by an implemented contract;
- the migration would require maintaining two writable document models; or
- the work expands to implementing a placeholder suite.

## Definition of upstream parity for the current slice

The current implemented slice is at parity only when all of the following hold:

- every used invariant and default is mechanically checked against the pinned
  baseline;
- all supported commands retain upstream identity, arguments, state, placement,
  shortcut, enablement, and default behavior;
- Writer data has one canonical `SwDoc`/nodes/items/styles/lists model and one
  canonical `SwPaM` selection contract;
- document, view, write, context, lifecycle, undo, and transfer ownership is
  traceable to the corresponding upstream shell/manager architecture;
- React and DOM code are presentation/input adapters only;
- browser platform differences are narrow, injected, classified, and tested;
- upstream-equivalent paths contain equivalent source-unit responsibilities;
- no decorative or placeholder UI is counted as functional parity;
- all 35 capability records have explicit contract/default/behavior results;
- all remaining differences are justified `B` or intentional `X` records; and
- the full repository verification gates pass with a clean tracked state.

The next feature iteration should start only after Phase 0 and the affected
Phase 1 contract work are complete. Otherwise every new feature increases the
cost of removing the current parallel command, lifecycle, selection, and
persistence models.
