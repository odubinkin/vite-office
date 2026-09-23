# Upstream parity plan for the implemented Vite Office slice

## Decision and baseline

This plan covers **code that already runs** in Vite Office. The comparison target is
the locally pinned LibreOffice `libreoffice-26.8.0.2` checkout at
`9bc445578031fecf56086729d8e4940c77e14d65` ([baseline](libreoffice-baseline.json)).
The target is equivalent behavior, defaults, model ownership, public and internal
contracts, and recognizable upstream module/file ownership for the implemented
slice. React rendering and browser input, storage, clipboard, file picker, download,
font-device, and Worker boundaries may differ where the platform requires it.
Browser-irrelevant native services are outside this plan. Work on inventory
generators, validators, schemas, or inventory data is outside this plan.
The [browser persistence decision](autosave-recovery.md) explicitly excludes
LibreOffice crash/session recovery, recovery snapshots, and recovery prompts.
Do not create parity work from native AutoRecovery defaults or inert local
provenance markers. A future full autosave policy for the primary browser save
path is a separate product decision, not recovery parity work.

This is a remediation plan, **not** a new parity attestation. A path or symbol
mapping is evidence of provenance, not of equivalent semantics. The 45
bounded [capability records](parity/writer-command-slice.json) explicitly
exclude adjacent behavior; their status must not be generalized to whole
LibreOffice modules. Conversely, a module marked `unverified` below is an audit
target, not a proven defect.

## What was audited

The [runtime inventory](parity/runtime-inventory.json) covers 159 production
modules: 99 upstream mechanisms, 41 browser adaptations, and 19 local
infrastructure modules. It also records ten UI behaviors, three internal
operations, and six placeholder suites. There are 153 active, four foundation,
and two internal modules. Its source-responsibility assessment has 27 aligned,
46 browser-owned, 13 divergent, and 73 unverified entries; 90 module contracts
and most defaults remain unverified even though 43 atomic Writer records are
verified and two native recovery records are approved browser exclusions. There
are 37 generated supported command resources and
five explicitly unsupported entries in
[`writer-ui.generated.json`](../../apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json).
These counts describe the current implementation, not overall suite completion.

The audit grouped **all** inventoried runtime modules by their actual
responsibility. The corresponding implementation work below applies to each
group, including its exported operations, default construction, and supported
command path:

| Current implemented group | Local ownership | Pinned upstream comparison | Plan work |
| --- | --- | --- | --- |
| Command registration, dispatch, bindings, accelerators, and menu/toolbar resources | `framework/{source,browser}`, `sfx2/source/control`, `sw/sdi`, `sw/uiconfig` | `framework/source/{dispatch,accelerators}`, `sfx2/source/control`, `sw/sdi`, `sw/uiconfig/swriter` | C, U |
| Document shell, medium, lifecycle, storage, and primary save | `sfx2/source/{doc,view}`, `sw/source/uibase/app`, `sw/browser/{storage,workflows}`, `svl/source/misc` | `sfx2/source/doc`, `sw/source/uibase/app` | D |
| Pooled formatting, defaults, styles, settings, page descriptors | `svl/source/items`, `editeng/source/items`, `sw/{inc,source/core/{attr,doc,layout,para}}` | Corresponding `svl`, `editeng`, and `sw` modules, especially `DocumentStylePoolManager.cxx`, `DocumentSettingManager.cxx`, `docdesc.cxx` | M, D, L |
| Writer nodes, text hints, cursor/ranges, content mutations, lists, numbering, and undo | `sw/source/core/{docnode,txtnode,crsr,doc,SwNumberTree,undo}`, `sw/source/uibase/{wrtsh,docvw,shells}` | Corresponding `sw/source/core` and `sw/source/uibase` modules | M, H, L |
| Clipboard HTML/text, ZIP/manifest, XML/ODF import and export | `sw/source/{filter,uibase/dochdl}`, `xmloff/source`, `package/source`, `sw/browser/filter` | Corresponding `sw`, `xmloff`, and `package` modules | F, H |
| Writer view, dialogs, ruler, properties, page canvas, editing DOM, and app shell | `sw/source/uibase/uiview`, `sw/browser/{presentation,editor,composition}`, `framework/browser` | `sw/source/uibase`, `sw/source/core/{layout,text}`, Writer UI resources | U, L |
| Browser platform ports | `vcl/browser`, Worker client/runtime, IndexedDB, browser localization | Native behavior at the applicable `vcl`, `sfx2`, `framework`, and filter boundary | B |

Calc, Impress, Draw, Base, Math, and Chart are currently launcher placeholders,
not implemented office suites. They are excluded from implementation work here;
the launcher must continue to label them unavailable. Test-only helpers are not
production model architecture.

## Confirmed departures and refactoring artifacts

### 1. Pagination and visible page layout (L; highest impact)

[`writer-page-pagination.ts`](../../apps/office/src/sw/browser/editor/writer-page-pagination.ts)
estimates lines from `text.length`, average glyph width, and CSS heights, then
places each **whole paragraph** on a page. A paragraph taller than the available
page body is never split. [`WriterPlainTextEditor.tsx`](../../apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx)
then creates the physical pages from that browser grouping. In upstream,
[`sw/source/core/text/txtfrm.cxx`](../../vendor/libreoffice-reference/sw/source/core/text/txtfrm.cxx)
uses text-frame follow chains, and
[`sw/source/core/layout/newfrm.cxx`](../../vendor/libreoffice-reference/sw/source/core/layout/newfrm.cxx)
owns page-frame creation. Browser glyph measurement is necessary; making React
the owner of page breaks and using one paragraph as the indivisible layout unit
is not. This affects the already visible page canvas, page style, ruler, and
caret geometry, even without tables or other unimplemented features.

**Target:** a Writer-owned, DOM-neutral layout result with page frames and
split text-frame fragments for the supported paragraphs. A browser measurement
port may supply shaped line metrics; React renders the result and maps DOM
positions back to `SwPaM`. Preserve single `SwTextNode` ownership across
fragments. Test long paragraphs, mixed font runs, margins, spacing, list labels,
page changes, resize, selection, and ODT reopen against pinned source-derived
expectations. Remove the character-count estimator after equivalent results
are in use.

### 2. New-document defaults lose the construction context (D; confirmed)

The initial session injects browser locale and font device through
[`writer-module.tsx`](../../apps/office/src/sw/browser/composition/writer-module.tsx)
and [`viewfunc.ts`](../../apps/office/src/sw/source/uibase/uiview/viewfunc.ts).
`SwDocShell.InitNew` instead calls bare `new SwDoc()` in
[`docsh.ts`](../../apps/office/src/sw/source/uibase/app/docsh.ts); the constructor
then defaults to `en-US` in
[`doc.ts`](../../apps/office/src/sw/source/core/doc/doc.ts). That changes
locale-dependent paper, font, and style defaults after **File → New**.
Upstream document creation and shell initialization retain their configured
default context ([`docnew.cxx`](../../vendor/libreoffice-reference/sw/source/core/doc/docnew.cxx),
[`docshini.cxx`](../../vendor/libreoffice-reference/sw/source/uibase/app/docshini.cxx),
[`DocumentStylePoolManager.cxx`](../../vendor/libreoffice-reference/sw/source/core/doc/DocumentStylePoolManager.cxx)).

**Target:** carry one explicit locale/device/configuration context through
initial creation, New, import, and cache restore. Keep the selected locale or
document language as model/format state where upstream does; never silently
recreate with `en-US`. Verify metric and imperial locales, script-specific
fonts, page defaults, New, save/reopen, and worker round trips.

**Implementation:** `SwDocShell` retains the session construction context for
New and ODT import. The canonical document record stores locale; cache and
worker restoration attach the current output device. ODT metadata carries
document language through `dc:language`. Focused tests cover metric and
imperial New defaults, script fonts, cache restore, and ODT worker transfer.

### 3. Writer undo ownership is reduced to the shared Sfx manager (H; confirmed)

[`SwDoc`](../../apps/office/src/sw/source/core/doc/doc.ts) directly owns
`SfxUndoManager<SwUndoRedoContext>` from
[`svl/source/undo/undo.ts`](../../apps/office/src/svl/source/undo/undo.ts).
Pinned `SwDoc` owns `sw::UndoManager`, with document-owned undo nodes and Writer
operation semantics ([`docnew.cxx`](../../vendor/libreoffice-reference/sw/source/core/doc/docnew.cxx),
[`undobj.cxx`](../../vendor/libreoffice-reference/sw/source/core/undo/undobj.cxx),
[`undel.cxx`](../../vendor/libreoffice-reference/sw/source/core/undo/undel.cxx)).
The shared Sfx base remains useful, but the missing Writer layer is a model
contract difference, not a browser requirement.

**Target:** add a Writer-owned undo manager at the matching `sw/source/core/undo`
boundary, retaining the Sfx base where upstream does. Move action grouping,
cursor restoration, undo-node ownership for text removal, retention and save
mark semantics into that layer. Replay supported insert/delete, split/join,
format, list, page-style, and hyperlink operations; assert undo/redo and
modified state over save boundaries.

### 4. Page descriptor and settings contracts are flattened (M/D; confirmed
structure, behavior requires differential tests)

[`pagedesc.ts`](../../apps/office/src/sw/source/core/layout/pagedesc.ts)
models one `Standard` value object and rejects other names;
[`doc.ts`](../../apps/office/src/sw/source/core/doc/doc.ts) exposes singular
`GetPageDesc()`. Upstream has a collection of page descriptors, master/follow
relationships and page-dependent application
([`pagedesc.cxx`](../../vendor/libreoffice-reference/sw/source/core/layout/pagedesc.cxx),
[`docdesc.cxx`](../../vendor/libreoffice-reference/sw/source/core/doc/docdesc.cxx)).
[`DocumentSettingManager.ts`](../../apps/office/src/sw/source/core/doc/DocumentSettingManager.ts)
only accepts `HTML_MODE`, whereas the pinned
[`DocumentSettingManager.cxx`](../../vendor/libreoffice-reference/sw/source/core/doc/DocumentSettingManager.cxx)
owns compatibility defaults that can affect the implemented paragraph,
numbering, tab, spacing, and line-layout paths. The browser does not require
these model contractions. This finding does **not** demand unrelated page
styles or settings used only by unimplemented features.

**Target:** restore the relevant descriptor identities, follow links, and
document-setting values that the currently supported page, text, list, import,
and export operations consume. Preserve upstream twip units and default
derivation. Test blank and loaded documents with standard/changed page geometry,
paragraph spacing, list tabs, and style inheritance. Keep the Page Style dialog
as a React projection of these model contracts.

### 5. UI state and duplicate presentation policy (U; confirmed)

The view flag can report the Properties sidebar visible, while
[`WriterWorkspaceChrome.tsx`](../../apps/office/src/sw/browser/presentation/WriterWorkspaceChrome.tsx)
unconditionally applies `hidden ... lg:block` to the sidebar at smaller widths.
That produces a command checked state without a visible, reachable panel. The
same component owns an inline editable title, which is useful in React but
must remain a projection of `SwDocShell` identity. Supported command placement
comes from upstream-derived resources, yet labels and command metadata are
re-wrapped separately in [`writer-view.tsx`](../../apps/office/src/sw/browser/presentation/writer-view.tsx),
[`WriterCommandToolbar.tsx`](../../apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx),
[`WriterFormattingToolbar.tsx`](../../apps/office/src/sw/browser/presentation/WriterFormattingToolbar.tsx),
and [`WriterPropertiesPanel.tsx`](../../apps/office/src/sw/browser/presentation/WriterPropertiesPanel.tsx).
The repeated wrappers are a maintenance artifact: they can cause menu,
toolbar, and sidebar state or localization to drift, although the renderers
themselves are valid React adapters. Upstream command identity and placement
remain in [`menubar.xml`](../../vendor/libreoffice-reference/sw/uiconfig/swriter/menubar/menubar.xml)
and the Writer toolbar resources.

**Target:** use one browser presentation resource/bindings selector for labels,
accessible names, shortcut hints, enablement, checked/selected state, and
argument schema. Keep separate React components for each surface. On narrow
screens, present the sidebar through a reachable responsive surface, or expose
an explicit hidden state that agrees with the view command. Verify keyboard,
screen reader, touch viewport, focus, locale change, and command-state parity.

### 6. Browser recovery exclusion (resolved product decision; no work package)

[`framework/source/services/autorecovery.ts`](../../apps/office/src/framework/source/services/autorecovery.ts),
[`svl/source/misc/recovery.ts`](../../apps/office/src/svl/source/misc/recovery.ts), and
[`WriterRecoveryPrompt.tsx`](../../apps/office/src/sw/browser/presentation/WriterRecoveryPrompt.tsx)
only export `{}`. They are inert provenance artifacts of the deliberate removal,
not implementations or incomplete tasks. Pinned
[`autorecovery.cxx`](../../vendor/libreoffice-reference/framework/source/services/autorecovery.cxx)
distinguishes temporary recovery files and session restoration from ordinary
document saving. That native crash/session mechanism is outside this browser
product's document lifecycle by explicit decision
([`autosave-recovery.md`](autosave-recovery.md)). The browser uses primary
IndexedDB save/load; it has no recovery copy, timer, lease, restore state, or
prompt. The empty modules preserve source provenance only. Their names and the
native default must not be used to reopen recovery as a parity gap or work item.
Future frequent full autosave, if specified, belongs to primary persistence and
requires its own product policy.

### 7. Transfer and browser workflow ownership (F/U; architectural audit)

[`swdtflvr.ts`](../../apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts)
owns a bounded transferable, but
[`writer-workflows.ts`](../../apps/office/src/sw/browser/workflows/writer-workflows.ts)
also sequences copy/cut/paste, including selection and deletion, while
[`writer-clipboard-events.ts`](../../apps/office/src/sw/browser/editor/writer-clipboard-events.ts)
adapts native events and
[`wrtsh-paste.ts`](../../apps/office/src/sw/source/uibase/wrtsh/wrtsh-paste.ts)
applies the payload. Upstream
[`swdtflvr.cxx`](../../vendor/libreoffice-reference/sw/source/uibase/dochdl/swdtflvr.cxx)
is the transfer/paste policy owner. Browser clipboard read/write must remain
outside Writer core; policy duplicated across the adapter and workflow shell
does not follow from that constraint.

**Target:** audit every Copy/Cut/Paste entrypoint and consolidate transfer
format choice, selection preconditions, delete-after-copy, and paste target
semantics in the Writer transfer/shell layer. Keep DOM events and Clipboard API
calls in one thin browser adapter. Use one behavior table for menu, toolbar,
keyboard, native events, and drag/drop; compare rich/plain, nested lists,
hyperlinks, collapsed and ranged selections, failure, and undo.

## Work packages and order

Each package changes only implementation, focused tests, and behavior docs.
The package is complete only when supported public/internal contracts,
defaults before user configuration, UI results, and save/import/export behavior
match the pinned source for its current operation. A discrepancy uncovered in
an `unverified` module becomes a concrete fix in the same owning package, not
an automatic claim that all upstream behavior is required.

1. **D — Defaults and lifecycle.** Repair New's construction context first;
   compare `SfxMedium`, `SfxObjectShell`, `SwDocShell`, default fonts, page
   defaults, save acknowledgement, and cache/ODT reopen. Produce locale and
   lifecycle golden cases. Depends on no layout work.
2. **M — Canonical model and settings.** Review all current `svl`/`editeng` item,
   `SwNodes`, `SwTextNode`, `SwPaM`, style, list, number, page descriptor, and
   `DocumentSettingManager` operations against their mapped upstream files.
   Restore missing owner/contract/default behavior used by existing commands;
   remove model conveniences that duplicate canonical state. Depends on D for
   construction defaults.
3. **H — Undo and editing.** Introduce Writer undo ownership and validate
   shell/operation boundaries for typing, selection, split/join, indent,
   list-level, formatting, page geometry, and hyperlink commands. Depends on M
   for canonical mutation contracts.
4. **L — Layout and editing projection.** Replace paragraph-only page grouping
   with supported upstream-shaped frame/follow layout, using browser text
   measurement only as a device port. Align caret mapping, rulers, and page
   rendering with the same result. Depends on M; integrate H for edits.
5. **F — Transfer and ODF.** Compare ZIP/manifest/XML, HTML/plain clipboard,
   filter orchestration, supported item serialization, and default handling
   with pinned fixtures. Consolidate transfer ownership. Keep Workers and DOM
   parsing as platform ports. Depends on M/H so round trips use one model.
6. **C — Command contract and resources.** Review `Sfx` interface, request,
   dispatch, bindings, command state, shortcuts, resource order and parameter
   semantics for all currently enabled commands. Ensure a single shell result
   drives every presentation surface. Depends on relevant M/H/F outcomes.
7. **U — React cleanup and UI parity.** Remove redundant resource wrappers and
   presentation-only state policy, fix responsive sidebar reachability, and
   verify menus, toolbars, dialogs, keyboard, IME, pointer/drag, focus, a11y,
   and locale behavior. Preserve React composition and browser event adapters.
   Depends on C/L/F for stable contracts.
8. **B — Boundary and file-layout pass.** For every current runtime module,
   confirm the exact upstream responsibility is in the corresponding local
   directory/file. Move domain policy out of `sw/browser` where it does not
   require browser APIs, retain justified `browser` ports, and remove obsolete
   adapters after callers migrate. Review the currently recorded filename
   divergences individually; a TypeScript import requirement alone is not a
   reason to change ownership. Run this incrementally with D–U, then do one
   final dependency and dead-code pass.

## Verification contract for every package

- Pin each claim to a concrete upstream function, default, resource entry, or
  test assertion and a local entrypoint. Compare behavior **before** explicit
  user settings as well as after the operation. Use source-derived golden tests
  when no runnable upstream binary is available; state that limit explicitly.
- Exercise the whole supported command path: UI/native event → Sfx dispatch →
  Writer shell → model → undo → export/cache → reopen → React projection. Include
  cancel/failure and repeated-operation cases. Keep model and filter tests
  independent of React; keep browser-only tests for browser APIs and layout.
- Verify supported file formats and clipboard transfers by structural
  round trips, not only string equality. Reject unsupported input without
  mutating the active document.
- Run the repository's relevant unit, browser, static build, type, boundary,
  source-tree/provenance, and documentation checks before closing each package.
  Use the existing inventory as a read-only coverage checklist; this plan does
  not schedule changes to its mechanisms or records.
- Close only when the current supported slice matches upstream semantics and
  its justified browser/React differences are explicit. Keep unrelated
  LibreOffice suites, native-only integration, and not-yet-implemented
  Writer features out of the scope of these remediation packages.
- Apply the documented browser recovery exclusion when interpreting inventory
  and upstream defaults; inert recovery markers do not create implementation
  requirements.
