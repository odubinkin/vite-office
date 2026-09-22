# Vite Office upstream parity plan

## Status and intent

This document replaces the previous parity-iteration plan. It is based on a fresh audit of the
current checkout against the repository-pinned LibreOffice baseline; the deleted predecessor was
not used as input.

The objective is not to reproduce LibreOffice's native process, windowing, operating-system, or
UNO deployment machinery in a browser. The objective is to keep every implemented office
capability as close as practical to the corresponding LibreOffice source ownership, data model,
public and internal contracts, command identity, serialization behavior, and defaults. React is a
renderer and browser-event adapter. It must not become an alternative Writer model, command
framework, or persistence architecture.

Baseline used by this audit:

- tag: `libreoffice-26.8.0.2`;
- commit: `9bc445578031fecf56086729d8e4940c77e14d65`;
- local checkout: `vendor/libreoffice-reference`;
- application source: `apps/office/src`.

## Executive assessment

The repository has a substantial LibreOffice-shaped foundation, especially in Writer. It has real
`SfxPoolItem`/`SfxItemSet` ownership, a Writer node graph, `SwPaM`, text hints, Writer shells,
action-based undo, list rules, ODF package/XML code, shell-stack dispatch, and browser adapters
that are usually kept outside model code. Those are valuable assets and should be evolved rather
than replaced.

It is not yet valid to describe the implemented surface as upstream-parity complete. Inventory
counts below are audit context only, not a remediation stream. The program plans code changes only.
Each code task must update the existing inventory records for the source files and capabilities it
actually changes, using the current schema, tooling, and checks. Unrelated existing records are
left untouched.

The most important architectural problems are:

1. several LibreOffice command identities have different local semantics, most visibly
   `.uno:ExportTo`, which currently means a direct plain-text download;
2. defaults are not centrally extracted from pinned upstream configuration and already diverge;
3. `sfx2/source/control/dispatch.ts` and the Writer command registries form a custom command
   framework behind LibreOffice names instead of a bounded port of the Sfx slot/interface model;
4. Writer core and shell code still expose browser-era convenience DTOs beside the upstream-shaped
   item/node model;
5. React presentation owns too much orchestration and contains several overlapping adapters and
   copied projections;
6. the source-tree gate, source-tree documentation, and actual source tree disagree about Writer
   UI ownership;
7. browser persistence and transport codecs occupy upstream filter directories even where there is
   no corresponding upstream responsibility.

## Audit evidence and inventory

### Repository measurements

The audited checkout contains:

| Surface | Current size | Interpretation |
| --- | ---: | --- |
| Authored production TypeScript/TSX under `apps/office/src` | 149 files | Current executable application surface. |
| Runtime inventory entries | 150 | Includes 149 production modules plus `src/test/wrtsh-test-helpers.ts`. Test-only code must not be counted as runtime. |
| Application unit/integration test files | 74 | Broad local coverage, but mostly local-contract coverage. |
| Browser E2E specifications | 8 | Writer and foundation flows only. |
| Inventory implementation files | 37 | Baseline, module, test, help, translation, dictionary, and parity tooling. |
| Inventory test files | 34 | Good structural coverage of inventory code. |
| Program documentation files, excluding this plan | 44 | Several are stale relative to the latest UI relocation. |
| Recorded atomic capability records | 45 | `CAP-0101` through `CAP-0145`, all currently marked `verified`. |
| Placeholder suites | 6 | Calc, Impress, Draw, Base, Math, and Chart have no runtime implementation. |

Runtime inventory classification:

| Classification | Modules | Meaning |
| --- | ---: | --- |
| `upstream-mechanism` | 92 | Claims a corresponding LibreOffice responsibility. |
| `browser-adaptation` | 37 | React, DOM, Worker, IndexedDB, File, Clipboard, or font-platform boundary. |
| `local-infrastructure` | 21 | Composition or local transport/storage infrastructure. |

The inventory's own semantic status is materially less complete than the capability report:

| Dimension | Parity | Unverified | Not applicable | Divergent |
| --- | ---: | ---: | ---: | ---: |
| Behavior | 8 | 119 | 23 | 0 |
| Contract | 7 | 84 | 58 | 1 |
| Default | 8 | 74 | 68 | 0 |
| Source responsibility | 23 aligned | 67 unverified | 46 browser-owned | 14 divergent |

These counts describe the current documentation state. They do not create a standalone inventory
cleanup phase; records change only with their related source implementation.

### Implemented shared-office surface

| Area | Implemented today | Principal local owners | Upstream reference families | Audit disposition |
| --- | --- | --- | --- | --- |
| Browser application bootstrap | Static Vite/React mount, suite launcher, pathname routing, lazy Writer session | `framework/browser/app`, `main.tsx` | `framework/source/services/desktop.cxx`, module manager services | Browser-specific composition is justified; suite and document identity must stop leaking into generic value DTOs. |
| Localization | Locale normalization, fallback catalog, React provider | `framework/browser/localization`, `framework/source/services/messages.ts` | officecfg/resource/translation catalogs | Browser provider is justified; current catalog and fallback model is local infrastructure, not parity evidence. |
| Command and dispatch foundation | Command registry, shell stack, slot requests, bindings invalidation, async result state | `sfx2/source/control`, `framework/source/dispatch` | `include/sfx2/{dispatch,request,bindings,shell}.hxx`, matching `sfx2/source/control` files | Directionally correct, but a custom descriptor framework is concentrated in `dispatch.ts`. |
| Item system | Pool items, item pool, item sets and Writer attribute pool | `svl/source/items`, `editeng/source/items`, `sw/source/core/attr` | `svl`, `editeng`, `sw` item implementations | Strongest reusable parity foundation; broaden contracts and eliminate browser-shaped projections from core APIs. |
| Notifications | `SfxBroadcaster`, `SfxListener`, `SwModify`, transactional model hints | `svl/source/notify`, `sw/inc/calbck.ts`, `DocumentStateManager.ts` | Svl broadcasters and Writer callback graph | Shape is useful; current coarse revision/hint model needs assertion-level comparison. |
| Undo/redo | Bounded `SfxUndoManager`, compound actions, save marks, Writer actions | `svl/source/undo`, `sw/source/core/undo` | `svl/source/undo/undo.cxx`, Writer undo files | Retain; expand from the supported text slice without snapshot-based fallbacks. |
| Document shell and medium | Modified state, save generations, medium identity and operation state | `sfx2/source/doc`, `sw/source/uibase/app/docsh.ts` | `SfxObjectShell`, `SfxMedium`, `SwDocShell` | Ownership is partly aligned, but the parallel `OfficeDocument` state machine and browser generations are mixed into upstream contracts. |
| Storage/recovery | IndexedDB primary/recovery stores, leases, autosave scheduling, recovery prompt | `svl/source/misc`, `framework/source/services/autorecovery.ts`, `vcl/browser/indexeddb-storage.ts` | framework AutoRecovery and document storage | IndexedDB and lease adapters are justified; defaults and service contract are not yet upstream-equivalent. |
| Worker protocol | Typed request IDs, cancellation, progress, stale-result rejection | `framework/source/services/worker-protocol.ts`, `sw/browser/filter/xml` | No direct native equivalent | Necessary browser infrastructure; it must remain outside filter/model contracts. |
| ZIP/manifest/XML | ZIP32 read/write, CRC32, manifest, SAX-like XML parser, text/style contexts | `package/source`, `xmloff/source` | Matching package/xmloff files and `sax/source/fastparser` | Useful bounded ports; most module contracts/defaults are still recorded as unverified. |
| Browser platform ports | Clipboard, file picker, download, local fonts, default-font device | `vcl/browser` | VCL/system services | Necessary stack divergence. Keep ports narrow and prevent their DTOs from becoming core types. |

### Implemented Writer surface

| Area | Implemented today | Principal local owners | Important limitations still inside normal Writer behavior |
| --- | --- | --- | --- |
| Document graph | Five fixed sections, text nodes, node indices, registered content positions | `sw/source/core/doc`, `docnode`, `bastyp` | No tables, sections, frames, fields, marks, redlines, content controls, anchored objects, or layout frames. |
| Text model | UTF-16 text, ranged auto-format and hyperlink hints, split/join/replace | `sw/source/core/txtnode` | A parallel boolean/run DTO remains widely used at shell, transfer, and test boundaries. |
| Cursor and selection | Directional point/mark `SwPaM`, cross-paragraph selection/deletion | `sw/source/core/crsr`, `sw/source/uibase/wrtsh` | Formatting and several transfer paths are still same-paragraph only; no multi-selection/table selection modes. |
| Paragraph formatting | Alignment, margins, line spacing, selected built-in paragraph styles | `editeng/source/items`, `sw/source/core/doc/fmtcol.ts`, `DocumentStylePoolManager.ts` | Only 26 of 126 catalogued styles are materialized; start/end and bidi semantics are flattened in presentation APIs. |
| Character formatting | Font family/size, bold, italic, single underline through pooled items | `editeng/source/items/textitem.ts`, `sw/source/core/txtnode` | Western/CJK/CTL values are often synchronized; color, language, complex underline/decoration, character styles, and many defaults are absent. |
| Lists and numbering | Bullet/decimal rules, ten levels, list identity, continuation, restart, promote/demote | `sw/source/core/doc/{list,number}.ts`, `SwNumberTree`, `listsh.ts` | Custom formats, complete numbering types, outline rules, full list tree behavior, and broader clipboard/ODF semantics are absent. |
| Editing shell | Insert, replace, delete, paragraph split/join, paste, IME staging, hyperlink operations | `sw/source/uibase/wrtsh` and `shells` | The public surface mixes upstream-like methods with local DTO methods and command convenience operations. |
| Command surfaces | 35 supported resources; menu, standard, text, and numbering toolbar subsets | `sw/sdi`, `sw/uiconfig/swriter`, `framework/browser/presentation` | Upstream menubar alone contains 557 unique command references; unsupported counts are 523/44/32/13/57 across the generated menu/toolbars/popup resources. |
| Browser editor | One contenteditable root, DOM selection mapping, beforeinput translation, IME, pointer geometry | `sw/browser/editor` | This is a necessary browser boundary, but it is split into more controllers and copied value shapes than React requires. |
| React workbench | Menu/toolbar/chrome/sidebar/status/dialog/recovery presentation | `sw/browser/presentation`, `sw/browser/composition` | Hand-wired orchestration, duplicated command state reads, handwritten visual defaults, and stale view-option behavior remain. |
| Clipboard | Native copy/cut/paste, plain text and bounded HTML, list serialization | `vcl/browser/browser-clipboard.ts`, `swdtflvr.ts`, HTML/ASCII filters | Full transfer flavors, RTF, objects, images, tables, tracked changes, Paste Special, and several cross-paragraph cases are absent. |
| ODT | Bounded ODF 1.3 ZIP/manifest, paragraph text/styles, fonts, alignment, lists, hyperlinks | `package`, `xmloff`, `sw/source/filter/xml` | It intentionally rejects most Writer content and does not yet constitute general Writer ODT compatibility. |
| Local persistence | Versioned complete graph snapshot plus shell state | `sw/source/filter/basflt`, `sfx2/source/doc`, IndexedDB adapter | Three related graph/transport/storage representations exist and old local schemas are deliberately rejected. |

### Explicitly out of current implementation scope

The current plan does not require desktop-only process/window integration, UCB/native filesystem
plumbing, native print drivers, operating-system clipboard internals, native extension loading,
Java integration, or desktop crash-lock-file mechanics. Calc, Impress, Draw, Base, Math, and Chart
are placeholder suites and are outside the refactoring scope of this plan because the request is to
bring the already implemented part to parity. Their eventual work must reuse the repaired shared
platform rather than copy the current Writer-specific shortcuts.

Browser replacements remain valid where the platform genuinely differs: React rendering, DOM
selection, `beforeinput` and composition events, Clipboard and File APIs, downloads, IndexedDB,
Dedicated Workers, CSS/font discovery, and browser lifecycle events. A browser replacement is not
permission to change the document model, UNO command meaning, Sfx request shape, default value, or
filter semantics.

## Confirmed divergences and refactoring artifacts

### P0 — command identity and behavior mismatch

`WriterWorkflowCommandShell` registers `.uno:ExportTo` as `ExportText()`. Pinned upstream declares
`ExportTo` (`SID_EXPORTDOC`) as a container request with URL, filter name, overwrite, filter options,
and save-a-copy arguments. A direct plain-text browser download is a useful feature, but it is not
the `.uno:ExportTo` contract.

Required correction:

- implement `.uno:ExportTo` through the Sfx medium/filter contract, including its arguments and
  format-selection behavior; or keep it disabled until that contract exists;
- give direct plain-text download a browser-owned URL such as
  `vnd.vite-office.browser:ExportText`, placed explicitly as a browser extension;
- audit all 35 registered commands for the same URL/slot/argument/result/state/default mismatch.

### P0 — default behavior is not upstream-derived

Concrete confirmed mismatches include:

- local `DEFAULT_AUTORECOVERY_INTERVAL_MS` is 60,000 ms; pinned
  `Office/Recovery.xcs` defaults `TimeIntervall` to 10 minutes and upstream multiplies it by 60,000;
- new Writer sessions use the fixed English title `Untitled Writer Document`; upstream uses the
  localized untitled-number service and document-specific naming;
- the `.uno:StartPara` path eventually calls `SetParagraphAlignment("left")`, and `getSvxAdjust`
  stores `SvxAdjust.Left` rather than preserving `SvxAdjust.ParaStart`; start/end semantics therefore
  collapse for RTL text;
- several browser UI defaults are handwritten rather than generated from officecfg/UI resources,
  including font-size options and workspace visibility decisions.

Required correction: add a generated default manifest from pinned officecfg, SDI, XCU, HRC, and UI
resources. Every constructor and factory default must cite and test one manifest value or be marked
browser-only with an explicit rationale.

### P0 — source ownership and documentation disagree

`scripts/check-lo-source-tree.mjs` forbids
`sw/source/uibase/docvw/edtwin.tsx` and `edtwin-paragraph.tsx`, while
`docs/program/source-tree.md`, `writer-plain-text-editor.md`,
`writer-document-canvas.md`, and `writer-paragraph-breaks.md` still describe those deleted files as
the implementation. The gate therefore certifies a tree that the architecture documentation says
should exist.

This is evidence of a previous refactor that moved code without completing the ownership model.
React files do not need to impersonate `edtwin.cxx`, but the upstream document-view responsibility
must still have a corresponding non-React owner. The target split is:

- upstream-shaped document-view/controller responsibilities under
  `sw/source/uibase/docvw`;
- DOM and React adaptation under `sw/browser/editor` and `sw/browser/presentation`;
- an explicit one-way boundary between them.

The source-tree checker must validate responsibility pairs instead of forbidding upstream-shaped
paths.

### P1 — custom Sfx command framework under upstream names

`sfx2/source/control/dispatch.ts` is a 699-line module that combines generic command definitions,
shortcut normalization, generated/synthetic slot assignment, shell construction, dispatch,
asynchronous browser operation tracking, command URL parsing, request-item conversion, and failure
presentation state. Upstream distributes these responsibilities across `SfxShell`, `SfxInterface`,
`SfxSlot`, `SfxDispatcher`, `SfxRequest`, `SfxBindings`, and frame/view ownership.

`sw/source/uibase/shells/writercommands.ts` is an additional descriptor assembly layer with no one
upstream owner and is already classified as divergence `X`. `SwListShell` separately bypasses this
helper and repeats resource/slot attachment.

Required correction:

- introduce bounded `SfxSlot`, `SfxInterface`, and typed item-state concepts;
- generate slot/interface metadata from SDI/HRC inputs;
- keep command execution and `GetState` in their corresponding Writer shell files;
- move browser Promise tracking to a browser dispatch observer or medium operation, not the core
  dispatcher contract;
- remove synthetic slot IDs for upstream commands and make browser extension IDs visibly separate;
- delete `writercommands.ts` after its remaining type conversions are absorbed by request/item and
  generated metadata owners.

### P1 — parallel core-facing value models

The canonical model is text + `SwpHints` + pooled items, but several convenience models remain:

- `WriterCharacterAttributes` turns pooled items into booleans and is consumed throughout core,
  shell, undo, transfer, and tests;
- `WriterParagraphList` combines rule, list, restart, and presentation kind into one DTO and is
  passed through core undo and shell APIs;
- `SwTextNode` exposes compatibility getters such as `text`, `alignment`, `style`, and `list` in
  addition to upstream-shaped methods/items;
- `OfficeDocument` is a second immutable document lifecycle aggregate beside `SfxObjectShell`,
  `SfxMedium`, `SwDoc`, and the undo save position;
- `WriterPresentationProjection`, `WriterTextRun`, `WriterDocumentRecord`, ODT worker-transfer
  records, and browser-storage records overlap substantially.

Boundary DTOs are necessary for React, structured clone, clipboard, and IndexedDB. They are not
necessary as core mutation contracts. Required correction:

- make pooled items, `SwTextAttr`, `SwNumRule`, `SwList`, `SwPaM`, and Sfx items the only model/shell
  mutation vocabulary;
- keep DTO conversion at named outer boundaries;
- use one canonical graph serialization representation, with boundary-specific envelopes rather
  than separate graph schemas;
- remove compatibility getters once all consumers use the canonical APIs;
- model modified/save/recovery state on `SfxObjectShell` and `SfxMedium`; keep only browser
  concurrency generations as a documented extension.

### P1 — React composition duplicates controller work

High-complexity UI files are currently:

- `CommandMenuBar.tsx`: 431 lines;
- `WriterFormattingToolbar.tsx`: 345 lines;
- `writer-view-projection.ts`: 361 lines;
- `writer-view.tsx`: 453 lines;
- `WriterPlainTextEditor.tsx`: 320 lines;
- `WriterRecoveryPrompt.tsx`: 222 lines;
- `WriterWorkspaceChrome.tsx`: 194 lines.

`WriterWorkbench` constructs mutation closures for nearly every editor operation, creates command
sources, resolves resource localization, converts clipboard data, maps selection, formats status
messages, and renders all chrome. `WriterViewProjection` both projects immutable values and mutates
shell focus/selection through projection IDs. `WriterPlainTextEditor` then creates three more
controller objects, each repeating selection synchronization.

This layering is more elaborate than required by React and less similar to Writer's view/edit-window
ownership than it appears. Required correction:

- add one browser `SwEditWin`-equivalent controller that owns DOM event translation, selection
  synchronization, composition, clipboard, drag/drop, and focus;
- keep the React editor a declarative projection with event forwarding only;
- make projection IDs opaque render keys only; selection conversion belongs to the edit-window
  adapter;
- expose command state through binding/controller hooks analogous to `SfxControllerItem` instead of
  repeated `QueryState` calls during render;
- split status/error presentation by service and resource, not by a large conditional in
  `writer-view.tsx`;
- preserve generic accessible React menu/toolbar primitives, but remove Writer-specific behavior
  from them.

### P1 — generated UI resources are still a handwritten allowlist

The generator reads pinned menus, toolbars, accelerators, SDI, HRC, and XCU files, but its `specs`,
aliases, capability IDs, semantics, dialog flags, browser labels, and visible subset are handwritten.
It supports 35 commands while recording hundreds of excluded resource references.

That is acceptable for feature staging, but not for claiming resource parity. It also produces
current inconsistencies:

- `.uno:Ruler` has a view state and handler but `writer-command-surfaces.ts` explicitly removes it;
- older documentation still claims a visible ruler and corresponding command behavior;
- unsupported top-level menus can render as local unavailable states rather than matching upstream
  enablement and population rules;
- `STANDARD_FONT_SIZES_PT` is handwritten inside a React component;
- icon selection is a component-local map rather than generated command/image metadata.

Required correction: generate the complete command/resource graph first, then attach one explicit
disposition to every entry: implemented, disabled-unimplemented, browser-inapplicable, or
browser-extension. Rendering must not silently filter a command that the view claims to implement.

### P1 — browser persistence is placed in filter ownership

`sw/source/filter/basflt/writer-document-codec.ts`, `writer-storage-codec.ts`, and
`writer-storage.ts` implement browser-local graph persistence rather than the corresponding
LibreOffice `basflt` responsibilities. The path gives a false upstream ownership signal. The
storage schema also embeds the Vite Office codec name, baseline commit, and rapidly changing model
versions, and deliberately rejects all prior local schemas.

Required correction:

- place browser snapshot envelope and migration code under `sw/browser/storage` or the VCL browser
  adapter layer;
- retain upstream-corresponding basic-filter code under `sw/source/filter/basflt` only when such a
  source responsibility is actually implemented;
- reuse the canonical graph serializer also used at the worker boundary;
- define forward migrations for browser-owned schemas independently from the pinned upstream
  commit;
- keep ODT as the durable interoperable document format and browser snapshots as recoverable cache,
  not an alternative document model.

### P1 — browser workflow adapter stack is wider than necessary

`writer-workflows.ts` contains three small controller classes plus a command shell, while
`writer-document-io.ts`, `SwDocShell`, `SfxMedium`, VCL browser ports, and the React view also
participate in the same operations. This creates multiple pass-through layers and splits error and
pending-state ownership.

Required correction: retain VCL browser ports and a thin browser Sfx shell, but route file and save
operations directly through `SwDocShell`/`SfxMedium`. Remove controllers that only forward one
operation and consolidate operation state in the medium or browser port that owns it.

### P2 — smaller concrete artifacts

- `SwTextNode.SetListRestart` writes the same `RES_PARATR_LIST_RESTARTVALUE` item twice.
- `WriterWorkspaceChrome` accepts no horizontal-ruler state and renders no ruler although `SwView`,
  generated resources, and older docs retain that concept.
- `writer-view-projection.ts` carries both `textLeftMargin` and a computed first-line/right-margin
  style, an example of view DTO growth around item APIs.
- `writer-command-surfaces.ts` is a second resource policy layer after generation.
- source-tree docs contain broken links to deleted `docvw` files.
- several large source files are below the hard 1,000-line limit but above the 500-line review
  threshold; file size is a symptom of mixed responsibility and should be addressed during the
  relevant architectural task, not by arbitrary splitting.

## Target architecture

### Dependency and ownership rules

1. `svl`, `editeng`, `sfx2`, `package`, `xmloff`, and `sw/source` contain bounded ports of upstream
   concepts, named and placed after the corresponding upstream owner.
2. `*/browser/**` contains all React, DOM, browser API, Worker scheduling, IndexedDB, and browser
   lifecycle code.
3. Browser code may depend inward on upstream-shaped code. Upstream-shaped code receives browser
   capabilities through narrow interfaces and never imports browser DTOs or globals.
4. A local infrastructure module must not be placed at an upstream path merely to look similar.
   Conversely, an implemented upstream responsibility must have a corresponding owner even if its
   final drawing is performed by React.
5. Generated resource/configuration data is allowed beside its upstream source area. Handwritten
   browser additions are stored in separate extension manifests and never masquerade as upstream
   commands.

### Model rules

- `SwDoc`, `SwNodes`, `SwNode`/`SwTextNode`, `SwPaM`, pooled items, text attributes, formats,
  `SwNumRule`, `SwList`, and Writer managers are the canonical model.
- Commands and undo actions operate on those objects and item sets, not on render/storage DTOs.
- Render, clipboard, worker, and storage DTOs are immutable one-way boundary products with no
  mutation methods.
- One graph serializer owns canonical primitive encoding. ODT import/export remains a semantic
  filter, not a persistence shortcut.
- Default values come from a pinned generated manifest and retain script, locale, bidi, and unit
  semantics.

### Command rules

- UNO URL, numeric slot, argument item set, result item, enablement, checked/mixed/value state, and
  default shortcut are one generated command contract.
- `SfxDispatcher` resolves slots through an active `SfxShell`/`SfxInterface` stack.
- Writer execution and state live in the matching `textsh`, `listsh`, `viewsh`, `docsh`, or other
  upstream owner.
- Browser asynchronous observation decorates execution without changing the core request result.
- Browser-only commands use a separate URL namespace and explicit UI-resource extensions.

### UI rules

- React owns rendering, accessibility semantics, focusable elements, and browser event attachment.
- Sfx bindings own command state; Writer view/edit-window controllers own selection and editing
  semantics; the Writer model owns document state.
- Menus and toolbars are generated from complete pinned resource graphs plus explicit browser
  extensions and dispositions.
- The React tree may differ from VCL's widget tree, but visible commands, default state, keyboard
  behavior, labels, ordering, and enablement must match the implemented upstream surface.
- UI tests distinguish browser accessibility behavior from Writer command/model parity.

## Execution plan

Each work item below should be an independent Agentplane task unless two adjacent items prove to
have the same owner and verification boundary. Do not mark a parent feature parity-complete merely
because one atomic operation passes.

### Phase 1 — fix known contract and default mismatches

#### P0.1 Correct command identities

Audit all 35 registered commands against pinned SDI/XCU/UI definitions. Fix `.uno:ExportTo` first,
then verify slot, arguments, return item, state, default shortcut, menu/toolbar placement, and owning
shell for every command. Browser local-save/load and text-download commands remain extensions.

Acceptance:

- `.uno:ExportTo` no longer directly means plain-text download;
- browser extension commands have no upstream slot claim;
- parameterized `.uno:StyleApply` requests retain upstream item arguments through `SfxRequest`;
- differential command tests cover success, disabled, invalid argument, and cancellation behavior.

#### P0.2 Generate and apply upstream defaults

Generate supported defaults from `Office/Recovery.xcs`, command configuration, Writer item defaults,
style pool definitions, numbering defaults, locale data, and UI resources.

Immediate corrections:

- AutoRecovery interval: 10 minutes before user configuration;
- untitled document naming/numbering and localization;
- `ParaStart`/`ParaEnd` preservation, including RTL projection;
- toolbar/menu visibility and enablement defaults;
- default font/size lists and script-specific values.

Acceptance: no implemented constructor/factory has an unexplained product default literal.

#### P0.3 Remove confirmed stale artifacts

Remove the duplicate list-restart write, reconcile ruler implementation or remove its unsupported
claim consistently, repair stale source-tree docs, and make the source-tree gate validate the target
responsibility split.

### Phase 2 — converge Sfx command architecture

#### P1.1 Port bounded Sfx slot/interface metadata

Introduce `SfxSlot` and `SfxInterface` equivalents and generate their supported metadata from pinned
SDI/HRC/XCU resources. Keep source files aligned with the corresponding Sfx control modules.

#### P1.2 Decompose dispatch responsibilities

Reduce `dispatch.ts` to dispatcher stack/resolution/execution. Move shortcut normalization to
accelerators, request conversion to `request.ts`, binding state/cache to `bindings.ts`, shell metadata
to the interface/slot modules, and browser async observation to `framework/browser`.

#### P1.3 Delete Writer registry glue

Move `Execute`/`GetState` declarations into generated interfaces and the corresponding Writer shell
owners. Remove `writercommands.ts` and duplicate resource attachment in `listsh.ts`.

Acceptance for Phase 2:

- the active shell stack and shadowing behavior match pinned Sfx assertions;
- no React/browser type is present in Sfx core;
- no upstream command uses a synthetic slot;
- adding a supported command requires upstream resource selection plus its shell handler, not edits
  in several unrelated registries.

### Phase 3 — remove parallel model contracts

Implementation status: P1.4-P1.7 are complete in the current checkout. Character
insertion and undo cursor state use character `SfxItemSet` values; numbering undo
captures list WhichIds in `SfxItemSet`; `SwTextNode` compatibility accessors have
been removed; and Worker plus IndexedDB envelopes share `WriterDocumentRecord`.
The new envelope versions intentionally reject all earlier local schemas.

#### P1.4 Canonicalize character formatting

Change shell and undo APIs to accept `SfxItemSet`/pool items and Writer text-attribute operations.
Keep `WriterCharacterAttributes` only as a browser/clipboard projection, then rename and move it to
the boundary that owns it.

#### P1.5 Canonicalize list state

Replace `WriterParagraphList` mutation and undo contracts with `SwNumRuleItem`, list attribute items,
`SwNumRule`, `SwList`, and explicit captured item sets. Keep a render-only list projection outside
core.

#### P1.6 Remove `SwTextNode` compatibility accessors

Migrate consumers of `text`, `style`, `alignment`, `list`, and `textLeftMargin` to upstream-shaped
methods and item queries. Do not remove them until all filters, undo actions, tests, and UI
boundaries have been migrated.

#### P1.7 Unify graph serialization

Use one versioned canonical graph record for structured clone and browser cache. Give Worker and
IndexedDB their own small envelopes. Add browser-cache migrations. Keep the pinned upstream commit
as evidence metadata, not as a reason to reject otherwise compatible user data.

Acceptance for Phase 3:

- core and shell mutation APIs contain no browser/render/storage DTOs;
- one canonical object graph is tested across edit, undo, Worker transfer, cache restore, ODT
  export/import, and reopen;
- differential tests preserve WhichIds, inherited/direct distinction, list identity, cursor
  positions, and defaults.

### Phase 4 — rebuild the UI boundary around Writer ownership

#### P1.8 Add the Writer edit-window controller boundary

Create an upstream-corresponding document-view/edit-window owner under
`sw/source/uibase/docvw` without importing React or DOM. Create one browser implementation under
`sw/browser/editor` for DOM selection, `beforeinput`, composition, pointer geometry, clipboard,
drag/drop, and focus.

Then remove the separate edit, composition, clipboard-event, and pointer controller objects where
they only repeat selection synchronization.

#### P1.9 Make React a projection-only layer

Refactor `WriterWorkbench`, `WriterPlainTextEditor`, and `WriterViewProjection` so:

- projections contain render values only;
- projection IDs are not used to mutate the shell;
- the edit-window controller owns DOM-to-`SwPaM` conversion;
- one stable controller hook exposes event handlers;
- React does not construct Writer mutation closures per operation.

#### P1.10 Add binding-backed command controls

Introduce a browser hook/controller corresponding to `SfxControllerItem`. It subscribes once to
bindings and publishes stable state per slot. Menus, toolbar buttons, selectors, and dialogs consume
that state and dispatch an `SfxRequest`.

#### P1.11 Generate complete UI resources and dispositions

Generate the complete Writer resource graph and a reviewable disposition manifest. Separate
browser additions. Generate labels, shortcuts, semantics, selection lists, icons, and supported
argument schemas where upstream defines them.

#### P1.12 Reduce presentation components

Split generic accessibility primitives from Writer presenters. Move service-specific status and
error strings to resource-backed presenters. Replace the display-only properties panel with a
command/binding-backed sidebar panel or explicitly classify it as a temporary read-only preview.

Acceptance for Phase 4:

- all visible controls use generated resource order and binding state;
- no implemented command is silently filtered by a second handwritten policy;
- menu keyboard behavior, focus restoration, shortcuts, dialogs, and enablement have browser tests;
- editing, selection, IME, and clipboard tests assert the same Writer operations independently of
  React;
- React component size falls because responsibilities disappear, not because code is mechanically
  split.

### Phase 5 — align lifecycle, medium, persistence, and filters

#### P1.13 Consolidate document lifecycle ownership

Move title, modified state, save position, and primary medium behavior onto `SfxObjectShell`,
`SfxMedium`, and `SwDocShell` contracts. Keep browser generation IDs only for asynchronous race
prevention and recovery leases.

#### P1.14 Collapse browser workflow pass-through layers

Route Open, Save As, Export, local cache, Copy, Cut, and Paste from a thin browser Sfx shell to the
owning document shell/transferable/medium. Remove workflow controllers that add no policy.

#### P1.15 Relocate browser snapshot code

Move local-cache envelope/migrations out of `sw/source/filter/basflt`. Update source provenance and
source-tree gates. Leave actual upstream basic-filter ports in that directory only when implemented.

#### P1.16 Expand ODF by upstream import/export contexts

After architecture convergence, expand the implemented ODT surface in dependency order: complete
paragraph and character properties, styles and automatic styles, lists/outline, sections, tables,
fields, frames/images, annotations/redlines, metadata/settings, then embedded objects where the
browser runtime supports them.

Acceptance for Phase 5:

- save/open/export identities and arguments match upstream;
- local cache failure never changes document-format semantics;
- AutoRecovery defaults and dirty/save transitions match upstream before browser concurrency
  extensions;
- supported ODT features round-trip against pinned LibreOffice fixtures and a runnable upstream
  oracle when one is added.

### Phase 6 — complete the currently implemented Writer feature families

This phase implements missing breadth currently documented as limitations of already verified
capabilities. Split work into atomic tasks, but do not claim broader parity until the code is
complete.

Priority order:

1. multi-paragraph character formatting and transfer behavior;
2. complete text/paragraph item coverage required by the visible formatting UI;
3. bidi/script/language and locale-sensitive defaults;
4. full default list and outline behavior for the exposed list commands;
5. style family behavior for every style currently shown in the selector;
6. complete implemented command state/undo/redo behavior;
7. ODT coverage for every implemented model item;
8. accessibility and keyboard behavior for every visible UI control;
9. recovery, cancellation, concurrency, and damaged-cache behavior;
10. performance for large text, hint, list, and ODT inputs.

Do not broaden into tables, drawings, fields, tracked changes, or other new feature families until
the shared architecture needed by that feature is upstream-shaped. When such a feature begins, add
its complete parent contract and record partial status honestly in the existing inventory.

### Phase 7 — documentation and closure

#### P1.17 Reconcile documentation for changed code

Update architecture, source tree, command placement, UI shell, storage, recovery, ODT, test
strategy, and roadmap where the preceding code changes make them stale. For each changed source or
capability, update its related existing inventory records with the implemented behavior and
evidence. Do not use this phase to audit or rewrite unrelated inventory entries. Inventory updates
use the current formats, commands, and checks only; no new documentation pipeline or parity gate is
introduced.

## Delivery sequence and dependencies

```text
P0.1 command audit
  -> P0.2 defaults
  -> P0.3 stale artifacts
      -> Phase 2 Sfx convergence
          -> Phase 3 model convergence
              -> Phase 4 UI convergence
              -> Phase 5 lifecycle/filter convergence
                  -> Phase 6 feature-family completion
                      -> Phase 7 documentation for changed code
```

Phase 4 can begin after the command contracts and canonical model boundaries are stable. Phase 5
can proceed in parallel with Phase 4 only where it does not touch shared `SwDocShell`, `SfxMedium`,
dispatch, or graph-codec contracts. Feature breadth must not race ahead of Phases 1–3.
Every code task must update the existing inventory records associated with the source files and
capabilities it changes. It must not expand into cleanup of unrelated inventory records.

## Required verification strategy

Every implementation task must include the applicable checks below in addition to repository-wide
verification.

### Structural checks

- source path and module responsibility match an existing upstream owner or an explicit browser
  owner;
- dependency direction remains inward from browser adapters;
- no browser global or DTO enters protected core/source code;
- every generated resource is fresh against the pinned checkout;
- no stale or broken program-document links remain.

### Contract checks

- exported symbols and method signatures map to pinned upstream symbols;
- command URL, slot, request items, result items, state and shortcut match;
- item WhichIds, defaults, inheritance and serialization match;
- browser extensions are namespaced and cannot be confused with upstream commands.

### Behavioral checks

- port the exact upstream test setup/operation/assertion where executable;
- record any normalization needed for browser rendering separately from model behavior;
- cover edit -> undo -> redo and import -> mutate -> export -> reopen cycles;
- cover cancellation, failure, stale asynchronous completion, and concurrent edits;
- use real pinned fixtures for document-format claims.

### Default checks

- assert state before any user action;
- source values from pinned configuration or source code;
- cover locale, script, bidi, font availability, and browser capability absence;
- test default changes separately from user-configured overrides.

### UI checks

- unit-test controller behavior without React;
- integration-test bindings and generated resources with React;
- E2E-test keyboard, pointer, clipboard, IME, focus, dialogs, responsive layout, and accessibility;
- add visual regression only for stable rendering contracts; do not use screenshots as model parity
  evidence.

### Performance and safety checks

- maintain ZIP/XML limits and malformed-input rejection;
- benchmark projection and serialization so model edits do not clone the full document on every
  keystroke;
- verify large documents do not produce unbounded React reconciliation, undo payloads, or worker
  copies;
- keep pasted HTML sanitized and browser storage isolated by document identity.

## Definition of done for this parity program

The implemented portion of Vite Office reaches parity only when all of the following are true:

1. every production module changed by this program is accurately documented in its existing
   inventory records and has an upstream or browser responsibility;
2. every implemented upstream responsibility has contract, behavior, default, ownership, and
   applicable serialization/operation-cycle evidence;
3. inventory records updated by this program do not infer broad parity from a narrower green slice;
4. every visible command preserves upstream identity, arguments, state, default placement, and
   owning shell, or is visibly a browser extension;
5. canonical document state exists only in upstream-shaped model objects; boundary DTOs cannot be
   used to mutate the model;
6. React contains presentation and browser event adaptation, not Writer business rules;
7. file paths correspond to their actual upstream or browser responsibility and all documentation
   references current files;
8. all supported defaults match the pinned LibreOffice baseline before user configuration;
9. all known unjustified adapters and refactor artifacts listed in this audit are removed;
10. existing repository verification, semantic parity tests, available differential fixtures,
    browser E2E, accessibility, performance, and security checks pass with no hidden exclusions;
11. each code change includes valid updates to its related existing inventory records, while
    unrelated records, inventory tooling, schemas, reports, validators, and deterministic checks
    remain outside this plan.

Until these conditions hold, reports should use precise phrases such as “implemented bounded
operation”, “source-mapped”, or “locally verified”, not “LibreOffice parity”.
