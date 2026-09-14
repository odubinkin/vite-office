# Vite Office upstream parity refactoring plan

## Status and baseline

This document is the executable refactoring plan for bringing the currently
implemented Vite Office runtime closer to the architecture, ownership model,
and document semantics of the pinned LibreOffice baseline.

- Baseline tag: `libreoffice-26.8.0.2`.
- Baseline commit: `9bc445578031fecf56086729d8e4940c77e14d65`.
- Local reference checkout: `vendor/libreoffice-reference`.
- Scope: the functionality already implemented in `apps/office` and the
  inventory that describes it.
- Primary suite: Writer. Calc, Impress, Draw, Base, Math, and Chart remain
  explicit placeholders.
- UI constraint: React and browser DOM architecture may differ from native VCL,
  but command identity, document semantics, state ownership, and observable
  behavior should remain compatible with Writer wherever the browser permits.

The pinned baseline and update policy are documented in
[libreoffice-baseline.md](libreoffice-baseline.md). The current machine-readable
sources are [source-provenance.json](source-provenance.json),
[runtime-inventory.json](parity/runtime-inventory.json), and
[writer-command-slice.json](parity/writer-command-slice.json).

## Executive summary

The current implementation has a sound Writer core direction: production edits
mutate an identity-bearing `SwDoc` graph through `SwWrtShell`, use action-based
undo, own paragraph attributes through pooled items, and keep numbering rules in
the document. Browser file, clipboard, IndexedDB, Worker, and React boundaries
are legitimate platform adaptations.

The main parity risk is architectural ambiguity around that core:

1. source provenance accepts files whose local responsibility does not match the
   mapped LibreOffice source;
2. old immutable cloning helpers coexist with the production mutable command
   path;
3. positions are not registered and therefore cannot be corrected globally
   after edits;
4. document notifications are implemented as local callback sets rather than a
   model-level broadcaster/client graph;
5. browser persistence generations leak into `SwDoc` and are duplicated inside
   `SfxMediumDescriptor`;
6. XML import constructs a complete DOM-like tree and a second paragraph DTO
   before creating the Writer model;
7. React menu, toolbar, view, and editor components own too much command and
   browser behavior;
8. one `contenteditable` host per paragraph forces manual cross-paragraph
   selection and reconciliation workarounds;
9. Writer sessions and AutoRecovery start eagerly at application bootstrap;
10. parity records and prose contain statements from the retired immutable
    architecture.

The plan therefore fixes inventory truth first, establishes one model mutation
path, restores core Writer invariants, isolates browser and React adapters, and
then replaces the XML intermediate models. Feature expansion should resume only
through those stabilized boundaries.

## Goals

### Architectural goals

- Preserve LibreOffice subsystem ownership across `svl`, `sfx2`, `sw`,
  `package`, `sax`, and `xmloff` when the responsibility exists in the browser.
- Preserve the Writer document graph and its mutation semantics rather than
  translating every operation through browser-friendly DTOs.
- Keep `.uno` command identity, state queries, enablement, and execution shared
  across menus, toolbars, keyboard shortcuts, and future accessibility surfaces.
- Treat React as a presentation adapter and the DOM editor as an input/rendering
  adapter, not as owners of Writer document behavior.
- Keep storage, clipboard, file selection, downloads, Worker transport, and
  lifecycle events behind explicit browser interfaces.
- Make parity claims assertion-based and verifiable against exact upstream
  symbols, tests, resources, and behavior.

### Functional goals

- Preserve all currently implemented editing, formatting, list, clipboard,
  local persistence, AutoRecovery, and bounded ODT behavior during refactoring.
- Eliminate divergent duplicate implementations before adding new commands.
- Provide stable foundations for cross-node ranges, marks, fields, tables,
  anchored objects, redlines, layout, and broader ODT support.
- Keep unsupported features explicit rather than silently flattening or losing
  document data.

## Non-goals

- Pixel-level reproduction of native LibreOffice UI.
- Porting native VCL windows, weld widgets, operating-system dialogs, native
  lock files, desktop printing, process startup, or platform event loops.
- Reproducing UNO transport where a local typed interface provides the required
  model contract and no external UNO client is supported.
- Implementing unneeded desktop integrations, macros, extension hosting, Java,
  Base connectivity, or native accessibility bridges.
- Implementing placeholder suites as part of this refactoring program.
- Expanding file-format coverage before the corresponding model concepts exist.

Native-only implementations may be omitted, but their document-level semantics
must not be omitted merely because the original implementation is native.

## Current implementation inventory

The runtime inventory currently contains 87 production modules:

| Classification | Count | Intended meaning |
| --- | ---: | --- |
| `upstream-mechanism` | 58 | A bounded implementation of a LibreOffice mechanism |
| `browser-adaptation` | 14 | Browser APIs or browser execution constraints |
| `local-infrastructure` | 15 | Application infrastructure without direct source parity |

It also declares 10 UI behaviors, 9 internal operations, and 6 placeholder
suites. The Writer parity slice contains 34 atomic records marked `implemented`,
68 recorded gaps, no exceptions, and no `verified` records.

### Implemented shared and framework functionality

- React/Vite application bootstrap and suite routing.
- Typed command registration, dispatch, shell stacking, and command state.
- Keyboard shortcut normalization.
- Web Clipboard, file selection, byte reading, and downloads.
- IndexedDB primary and recovery storage with generation retention and leases.
- Worker request protocol, cancellation, timeout, stale-result rejection, and
  worker restart behavior.
- AutoRecovery interval, `pagehide`, and visibility-change scheduling.

### Implemented Sfx, Svl, and Editeng functionality

- Document lifecycle metadata and save/recovery generations.
- An `SfxMedium`-like descriptor for browser destinations and sources.
- Action-based undo/redo, list actions, action merging, maximum history, and a
  primary-save position.
- `SfxPoolItem`, `SfxItemPool`, and `SfxItemSet` subsets.
- Writer-specialized attribute sets and paragraph/character items.

### Implemented Writer core functionality

- `SwDoc` ownership of `SwNodes`, attribute pools, paragraph styles, and
  numbering rules.
- Fixed postits, inserts, autotext, redlines, and content node sections.
- Identity-bearing text nodes and derived paragraph/run projections.
- Default Paragraph Style and Heading 1 inheritance.
- Paragraph alignment and bounded list state.
- Ten numbering levels for default bullet and numbered rules.
- Direct bold, italic, and single underline stored as text hints.
- `SwPosition`, `SwPaM`, same-node range operations, paragraph split/merge, and
  action-based Writer undo objects.
- `SwDocShell`, `SwWrtShell`, view command shells, and frame dispatch.

### Implemented format and transfer functionality

- Bounded ODF 1.3 ZIP32 package import/export.
- Manifest, styles, content, and metadata parts.
- Paragraph styles, alignment, lists, significant whitespace, and bounded
  character formatting.
- DEFLATE import and STORE export.
- Worker isolation for import/export.
- Plain text and sanitized HTML clipboard serialization and parsing.

### Implemented Writer UI functionality

- Workspace title, menus, standard and formatting toolbars, ruler, page canvas,
  properties sidebar, and status bar.
- File New, Open ODT, Save ODT, browser-local save/load, and text download.
- Undo, redo, cut, copy, paste, and select all.
- Default/Heading 1 style selection, alignment, bullet/numbered list controls,
  list promotion/demotion, and direct bold/italic/underline.
- Per-paragraph editing, native selection bridging, pointer selection across
  paragraphs, caret boundary navigation, and IME staging.
- Explicit unavailable states for visible but unimplemented menus.

## Parity classification rules

Every module must be classified by responsibility, not by filename similarity.

### Upstream mechanism

A module may be marked `upstream-mechanism` only when all of the following are
recorded:

- exact upstream source or resource path;
- exact upstream symbols or declarative command identifiers;
- local symbols implementing the bounded responsibility;
- preserved invariants and observable assertions;
- upstream obligations deliberately omitted from the bounded implementation;
- tests that distinguish the claimed responsibility from adjacent ones.

### Browser adaptation

A browser adaptation must:

- contain browser, DOM, Worker, structured-clone, IndexedDB, Blob, File,
  Clipboard, timer, or lifecycle-event mechanics;
- expose a model-neutral interface at its inward boundary;
- avoid owning Writer mutation or command policy;
- document why the native implementation cannot be used in a static browser;
- remain replaceable in tests.

### Local infrastructure

Local infrastructure must not claim a LibreOffice source mapping. It may compose
upstream-shaped and browser-specific services, but its name and placement must
make that composition responsibility explicit.

## Confirmed responsibility mismatches

| Local module | Current mapping | Problem | Required disposition |
| --- | --- | --- | --- |
| [`sw/source/uibase/ribbar/inputwin.tsx`](../../apps/office/src/sw/source/uibase/ribbar/inputwin.tsx) | [`sw/source/uibase/ribbar/inputwin.cxx`](../../vendor/libreoffice-reference/sw/source/uibase/ribbar/inputwin.cxx) | Local generic formatting toolbar; upstream `SwInputWindow` is the table formula input window | Move the React toolbar to browser presentation; reserve `inputwin` for formula input if implemented |
| [`sw/source/uibase/app/mainwn.tsx`](../../apps/office/src/sw/source/uibase/app/mainwn.tsx) | [`sw/source/uibase/app/mainwn.cxx`](../../vendor/libreoffice-reference/sw/source/uibase/app/mainwn.cxx) | Local complete workspace chrome; upstream owns Writer progress helpers | Reclassify and move workspace chrome; map progress behavior separately |
| [`sfx2/source/doc/docfac.ts`](../../apps/office/src/sfx2/source/doc/docfac.ts) | [`sfx2/source/doc/docfac.cxx`](../../vendor/libreoffice-reference/sfx2/source/doc/docfac.cxx) | Local lifecycle value functions; upstream owns `SfxObjectFactory` | Move lifecycle state to object shell support; implement a bounded factory only when needed |
| [`svl/source/misc/recovery.ts`](../../apps/office/src/svl/source/misc/recovery.ts) | `svl/source/misc/lockfilecommon.cxx` | Local deterministic autosave storage helper; upstream file parses lock files | Reclassify as recovery storage support and map orchestration to framework AutoRecovery |
| [`sfx2/source/doc/docundomanager.ts`](../../apps/office/src/sfx2/source/doc/docundomanager.ts) | [`sfx2/source/doc/docundomanager.cxx`](../../vendor/libreoffice-reference/sfx2/source/doc/docundomanager.cxx) | Local core `SfxUndoManager`; upstream file is a document/UNO adapter over the core manager | Move core manager to `svl/source/undo`; create a separate document adapter only if required |
| [`sw/source/uibase/sidebar/WriterInspectorTextPanel.tsx`](../../apps/office/src/sw/source/uibase/sidebar/WriterInspectorTextPanel.tsx) | [`WriterInspectorTextPanel.cxx`](../../vendor/libreoffice-reference/sw/source/uibase/sidebar/WriterInspectorTextPanel.cxx) | Local three-value properties summary; upstream is a property/source inspector with bookmarks, sections, and metadata | Rename current UI as a properties panel; retain Inspector naming for real inspector functionality |
| [`sw/source/core/doc/writer.ts`](../../apps/office/src/sw/source/core/doc/writer.ts) | `sw/source/core/doc/docnew.cxx` | Local barrel plus cloning command facade; upstream source owns document construction | Retain construction under `SwDoc`; remove or isolate legacy cloning helpers |
| [`sw/source/uibase/shells/textsh.ts`](../../apps/office/src/sw/source/uibase/shells/textsh.ts) | `sw/source/uibase/shells/textsh.cxx` | Local React/global-keydown hook; upstream is a text command shell | Move browser shortcuts out; keep text command execution/state in the shell boundary |
| [`sw/source/uibase/wrtsh/select.ts`](../../apps/office/src/sw/source/uibase/wrtsh/select.ts) | `sw/source/uibase/wrtsh/select.cxx` | Local code primarily converts DOM selections | Move DOM conversion to browser editor adapter; keep model selection operations in Writer shell code |
| [`xmloff/source/core/xml-parser.ts`](../../apps/office/src/xmloff/source/core/xml-parser.ts) | [`sax/source/fastparser/fastparser.cxx`](../../vendor/libreoffice-reference/sax/source/fastparser/fastparser.cxx) | Local parser constructs a full immutable DOM-like tree; upstream dispatches tokenized events to context handlers | Introduce a fast-context event interface and remove the full document tree |

## Target architecture

The target preserves upstream ownership internally and adapts only at the outer
browser boundary.

```text
React presenters
  menu / toolbar / sidebar / workspace / document projection
                       |
Browser UI adapters    | command IDs + state snapshots
  DOM input, selection, IME, clipboard, file, storage, lifecycle
                       |
Framework and Sfx
  SfxDispatcher -> SfxShell -> SwDocShell / SwView / SwWrtShell
                       |
Writer core
  SwDoc -> SwNodes -> SwTextNode / formats / numbering / marks
        -> content operations -> undo objects -> model hints
                       |
Package, SAX, xmloff, and Writer filters
  streams -> token contexts -> canonical model operations
```

The following dependency rules are mandatory:

- Writer core must not import React, DOM, browser storage, Clipboard, File, or
  Worker types.
- Sfx/Writer shells may depend on abstract service contracts but not concrete
  browser APIs.
- React presenters may query commands and invoke command IDs but must not call
  low-level `SwDoc` mutations.
- DOM selection objects must terminate at the browser editor adapter and become
  `SwPosition`/`SwPaM` before entering Writer command code.
- xmloff may depend on model-facing import/export interfaces but must not create
  a parallel persistent Writer document representation.

## Workstream 0: make inventory authoritative

### P0.1 Extend the provenance contract

Change `source-provenance.json` and its validator so every mapped entry records:

- `upstreamPath`;
- one or more `upstreamSymbols` or resource command IDs;
- one or more `localSymbols`;
- `preservedResponsibilities`;
- `omittedResponsibilities`;
- `stackDivergence`, when applicable;
- evidence paths and markers.

The validator must reject a mapping when only file existence or basename
similarity is demonstrated. It should also reject an upstream mechanism whose
runtime inventory classification says browser-only, and vice versa.

Acceptance criteria:

- all 87 runtime modules have one consistent classification;
- every mapped module names an exact responsibility and symbol;
- the confirmed mismatches in this document are removed or reclassified;
- filename divergences explain necessary naming differences without using a
  nearby but unrelated source as ownership evidence.

### P0.2 Make capability inventory atomic

Split broad records into independently verifiable capabilities:

- model operation;
- undo/redo semantics;
- command registration and state;
- menu/toolbar/shortcut placement;
- browser input behavior;
- persistence/filter behavior;
- round-trip and compatibility evidence.

Require each active production module either to reference at least one atomic
capability or to carry an explicit infrastructure exemption.

Acceptance criteria:

- UI behaviors cover selection, pointer extension, keyboard movement, IME,
  clipboard events, menu navigation, file workflows, and recovery prompts;
- internal operations include every exported mutation helper;
- a capability cannot be `verified` solely because its implementation file and
  test file exist;
- verification requires assertion-level local and upstream evidence.

### P0.3 Repair stale documentation and gates

Reconcile [writer-core-model.md](writer-core-model.md),
[writer-paragraph-body.md](writer-paragraph-body.md),
[transaction-history.md](transaction-history.md), and
[writer-local-storage.md](writer-local-storage.md) with the production path.

Remove obsolete statements that interactive commands clone `SwDoc`, that Paste
is absent, or that AutoRecovery scheduling is not wired. Historical limitations
may remain only when explicitly dated and scoped to a previous capability.

Repair `check:source-tree`, which currently requires a missing `viewstat.ts`,
and add the following to the default verification pipeline:

- source tree validation;
- source provenance validation;
- parity mapping validation.

## Workstream 1: establish one mutation and undo path

Status: implemented on 2026-09-14. Interactive editing now mutates the live
`SwDoc` exclusively through `SwWrtShell` and action undo. The former cloning
facades and their duplicate behavioral tests were removed. Primary-save
completion now carries storage evidence back to `SwDocShell`, which acknowledges
the captured document generation and undo boundary only after persistence
succeeds.

### P1.1 Retire cloning command facades

Inventory every exported helper that calls `SwDoc.clone()`, including functions
in `writer.ts`, `DocumentContentOperationsManager.ts`, `listsh.ts`, `txtnum.ts`,
and `txtattr.ts`.

For each helper:

1. replace production callers with the matching `SwWrtShell` or core operation;
2. migrate tests to use the same mutable operation and undo path;
3. keep a test fixture builder only when construction cannot reasonably use the
   public model API;
4. move fixture-only helpers under test utilities and remove them from runtime
   inventory;
5. delete the obsolete helper after all callers are migrated.

Acceptance criteria:

- no production command clones the document graph;
- no formatting/list operation has both functional-clone and shell mutation
  implementations;
- test fixtures do not accidentally define a second behavioral contract;
- action undo remains the sole interactive history mechanism;
- snapshot cloning remains limited to persistence, Worker transfer, and explicit
  test isolation.

### P1.2 Remove persistence acknowledgement clones

Change `saveWriterDocument` to return storage evidence rather than a cloned and
acknowledged document. `SwDocShell` must acknowledge the exact saved generation
after the adapter confirms persistence.

Acceptance criteria:

- saving does not clone `SwDoc`;
- a concurrent mutation after save start leaves the document modified;
- primary-save and recovery generations remain independent;
- failed storage writes never move the save mark.

## Workstream 2: restore Writer core invariants

### P2.1 Implement registered content indices

Introduce a bounded `SwContentIndex` and a registry owned by each content node.
Each index must carry an owner kind sufficient for cursors, marks, redlines, and
anchors. Define upstream-compatible update modes for insertion, deletion,
replacement, and node transfer.

Update all text and structural operations:

- insert text;
- erase text;
- replace text;
- split text node;
- append/merge text node;
- remove node;
- move content between nodes.

Acceptance criteria:

- multiple live positions before, at, and after an edit are corrected without
  shell-specific cursor restoration;
- point and mark direction is preserved;
- split and merge move registered indices to the correct node;
- deleted ranges apply deterministic boundary affinity;
- tests cover cursor, mark, redline-like, and anchor-like owners.

### P2.2 Introduce model broadcasters and clients

Create bounded equivalents of `SfxBroadcaster`/`SfxListener` and
`SwModify`/client registration. Add typed hints for:

- document modified state;
- node insertion/removal/content change;
- attribute set change;
- format inheritance change;
- numbering change;
- cursor/selection change;
- document replacement and disposal.

Replace shell-local generic listener sets with subscriptions derived from these
model notifications. Keep one React `useSyncExternalStore` bridge that produces
the immutable presentation snapshot.

Acceptance criteria:

- model consumers can subscribe without importing React;
- mutations issue one bounded notification transaction;
- command state invalidation is driven by typed model hints;
- replacing or disposing a document detaches clients safely;
- no notification requires cloning the document.

### P2.3 Correct lifecycle ownership

Move document identity, title, open/closed state, save generation, recovery
generation, and current medium ownership out of `SwDoc` and into an
`SfxObjectShell`/`SwDocShell`-shaped layer.

`SwDoc` should own Writer model state and emit model-modified notifications.
`SwDocShell` should reconcile that state with undo save position and persistence
acknowledgements.

Acceptance criteria:

- Writer core is independent of IndexedDB generation terminology;
- undoing to the save position clears modified state through shell policy;
- recovery acknowledgement does not alter primary-save state;
- import creates model data before committing shell lifecycle/medium changes;
- closed shells reject persistence and command execution without mutating the
  underlying document.

### P2.4 Correct undo and factory module ownership

- Move the local core `SfxUndoManager` implementation to a `svl/source/undo`
  boundary matching upstream.
- Keep a separate `sfx2` document undo adapter only if a document-model API or
  listener bridge needs it.
- Move the current lifecycle helpers out of `sfx2/source/doc/docfac.ts`.
- Introduce a bounded `SfxObjectFactory` only when view/filter/module factory
  registration is required by the runtime.

Avoid empty source-shaped files created only to satisfy source-tree checks.

## Workstream 3: simplify medium and browser persistence

### P3.1 Normalize `SfxMediumDescriptor`

Replace duplicate flat and nested generation fields with one authoritative
representation. Remove `lastOperationStatus` when `lastOperation.state` is the
source of truth. Replace the broad backward-compatible `Partial` input with
discriminated construction inputs for:

- untitled document;
- browser-local IndexedDB document;
- opened ODT Blob/File source;
- downloadable ODT destination;
- recovery source.

Acceptance criteria:

- invalid field combinations are unrepresentable or rejected at construction;
- `GetMedium()` does not reconstruct and freeze the descriptor on every read;
- browser references remain opaque adapter handles;
- source and destination are distinct without duplicating document lifecycle.

### P3.2 Keep browser storage behind shell-neutral ports

Define narrow ports for primary save, recovery save, open, and export. Keep
IndexedDB transaction, quota, lease, and browser event behavior in `vcl/browser`
or another explicit browser platform directory.

Acceptance criteria:

- `SwDoc`, text nodes, formats, and undo objects do not import storage types;
- primary and recovery stores can be replaced independently in tests;
- storage serialization is versioned but is not described as a file filter;
- storage failures preserve the previous medium and generation state.

## Workstream 4: align command and UI architecture

### P4.1 Make command descriptors the single presentation source

Extend the command registry with presentation-neutral metadata:

- command ID;
- label/message key;
- state type;
- check/radio semantics;
- optional argument schema;
- placement references from menu and toolbar resources;
- keyboard bindings;
- execution shell ownership.

Menus, toolbars, context menus, and shortcuts must use the same descriptor and
query the same dispatcher state.

Acceptance criteria:

- `WriterWorkbench` contains no manual style/alignment/list-to-command maps;
- adding a command does not require a new callback prop through every UI layer;
- enabled, checked, and selected state is identical across all surfaces;
- all state-changing UI actions dispatch command IDs;
- asynchronous browser commands expose pending/error state through the command
  state contract rather than component-local special cases.

### P4.2 Separate `uiconfig` resources from React presenters

Keep `sw/uiconfig` as declarative menu and toolbar placement data derived from
the pinned XML resources. Move React rendering components to an explicit
browser presentation layer.

The presentation layer may use a browser-specific visual design, but it must
preserve:

- menu hierarchy;
- command ordering;
- check/radio grouping;
- unavailable states;
- accelerator display;
- command enablement.

Acceptance criteria:

- no TSX component is claimed as a port of an upstream XML resource;
- resource parity can be tested without rendering React;
- one generic menu/toolbar renderer handles current commands;
- custom components are reserved for controls whose interaction cannot be
  expressed by a command item.

### P4.3 Correct UI component identities

- Rename the current paragraph summary as a Properties panel.
- Move workspace chrome out of `mainwn` ownership.
- Move the generic formatting toolbar out of `inputwin` ownership.
- Move global shortcut hooks out of `textsh` ownership.
- Move DOM selection conversion out of `wrtsh/select` ownership.

If the corresponding upstream feature is later implemented, use the source-like
name for that actual responsibility instead of sharing it with an approximation.

### P4.4 Implement complete menu interaction semantics

Add a reusable menu state machine with:

- roving focus;
- Left/Right navigation between top-level menus;
- Up/Down navigation inside menus;
- Home/End;
- Enter/Space activation;
- Escape close and focus restoration;
- outside-click dismissal;
- submenu focus management;
- typeahead;
- disabled-item skipping.

Acceptance criteria must be asserted with DOM interaction tests and Playwright
accessibility checks, not only ARIA-role snapshots.

## Workstream 5: isolate and stabilize browser editing

### P5.1 Split the editor controller from React rendering

Decompose the current editor into:

- `BrowserWriterEditController`: translates browser edit intent to commands;
- `BrowserWriterSelectionMapper`: converts DOM points/ranges to registered
  Writer positions and back;
- `BrowserWriterCompositionAdapter`: owns IME temporary text and commit/cancel;
- `BrowserWriterClipboardEvents`: handles native copy/cut/paste events;
- React document projection: renders model state and binds controller entry
  points;
- geometry helper: resolves pointer positions when browser range APIs are
  required.

These names are illustrative; final placement must follow the provenance rules
and must not claim nonexistent upstream modules.

Acceptance criteria:

- the React component does not contain document mutation algorithms;
- browser globals are injected or isolated for deterministic tests;
- the controller accepts normalized edit intents rather than React events;
- composition commits as one undo transaction;
- selection mapping is independently testable.

### P5.2 Replace paragraph editing islands

Move toward one logical document editing host. Paragraphs may remain separate
DOM projection nodes, but they must not behave as unrelated native editors.

The migration should be incremental:

1. introduce a root-level editing/selection controller while retaining current
   paragraph rendering;
2. centralize `beforeinput`, keyboard, clipboard, and composition handling;
3. remove paragraph-local `contenteditable` ownership or make descendants part
   of one root editing host;
4. remove manual pointer range restoration once native cross-paragraph ranges
   remain stable;
5. make the canonical Writer selection authoritative after every accepted
   intent.

Acceptance criteria:

- drag selection, Shift+Arrow, Ctrl/Cmd+A, copy, and deletion work across
  paragraphs through one selection model;
- IME remains stable at paragraph boundaries;
- Enter and Backspace/Delete merge/split through Writer commands;
- formatting is not lost during fallback reconciliation;
- unsupported native mutations are rolled back and surfaced during development.

### P5.3 Eliminate whole-paragraph reconciliation as a normal path

Normalize supported `beforeinput` types into explicit Writer operations. Keep a
DOM text diff only as a guarded compatibility fallback.

Acceptance criteria:

- ordinary typing, deletion, paragraph breaks, paste, and composition do not
  replace the entire paragraph;
- direct character hints survive every supported input path;
- fallback use is observable in tests/development diagnostics;
- unknown input types fail safely without silently flattening formatting.

## Workstream 6: replace the XML intermediate architecture

### P6.1 Introduce tokenized SAX events and context handlers

Retain `saxes` as the browser-compatible tokenizer if it continues to satisfy
security and correctness requirements. Replace the returned immutable tree with
an event contract analogous to LibreOffice fast contexts:

- namespace and local-name token tables;
- fast start/end element callbacks;
- unknown-element callbacks;
- attribute token access;
- character callbacks;
- context creation and stack ownership;
- explicit depth and resource limits.

Acceptance criteria:

- parsing does not retain the entire XML tree;
- DTD/entity rejection and depth limits remain enforced;
- namespace and event ordering tests remain deterministic;
- unknown elements are handled by declared context policy.

### P6.2 Import directly into canonical Writer model operations

Replace the neutral `OdfParagraph` import model with Writer XML import contexts.
Contexts should create styles, numbering rules, text nodes, hints, and paragraph
properties through model-facing interfaces.

Use a transaction boundary so malformed or unsupported input cannot partially
replace the active document. A temporary `SwDoc` is acceptable; a persistent
parallel DTO graph is not.

Acceptance criteria:

- import builds one canonical `SwDoc` graph;
- style and list references are resolved through document-owned tables;
- unsupported constructs are explicit and do not silently flatten existing
  supported semantics;
- the active shell swaps documents only after complete validation.

### P6.3 Export through model-aware contexts

Replace `SwTextNode -> OdfParagraph -> XML` projection with export contexts that
read canonical model interfaces directly.

Acceptance criteria:

- paragraph and text properties are emitted from pooled item state;
- styles and numbering definitions are emitted before references;
- text whitespace and inline spans preserve current behavior;
- the exporter does not construct a second complete document graph.

### P6.4 Add scale and compatibility verification

Add tests for:

- large paragraph counts;
- deeply nested but allowed content;
- many inline spans;
- list/style tables;
- malformed XML and ZIP limits;
- Worker cancellation during parsing/export;
- upstream-generated ODT fixtures;
- import/export/import semantic equality for the supported subset.

Memory acceptance should be expressed as bounded growth relative to the active
context and canonical model, not a fragile exact byte threshold.

## Workstream 7: split view services and make module lifecycle lazy

### P7.1 Reduce `SwView` responsibilities

Keep `SwView` responsible for the active Writer view, its shell/frame
relationship, and view-level command routing. Extract:

- file/open/export workflow controller;
- clipboard workflow controller;
- local storage controller;
- transient chrome preference state;
- user-facing operation status presenter.

Acceptance criteria:

- `SwView` no longer directly opens browser file dialogs or downloads Blobs;
- browser workflows remain reachable through dispatcher commands;
- command completion updates typed state without embedding strings in model
  classes;
- extracted controllers have narrow injected ports.

### P7.2 Lazily create and dispose Writer sessions

Change the module factory so application bootstrap registers a factory without
creating `SwDoc`, `SwView`, frame, Worker, storage connection, or AutoRecovery.

Create the session when Writer is opened. Dispose it when the workspace is
closed, subject to an explicit document retention policy.

Acceptance criteria:

- launcher and placeholder routes install no Writer recovery timers/listeners;
- reopening Writer creates or restores exactly one session;
- closing unregisters document recovery, stops timers, terminates owned Workers,
  and removes subscriptions;
- multiple browser tabs retain independent lease ownership.

### P7.3 Add recovery presentation policy

Expose recovery candidates through a browser presentation controller and require
an explicit restore/discard/continue choice when a relevant candidate exists.

Acceptance criteria:

- recovery data is not silently applied;
- restored documents keep correct primary-save and recovery generations;
- discard removes retained recovery generations;
- inaccessible or corrupt candidates do not block opening a clean document.

## Workstream 8: verification and controlled feature expansion

### P8.1 Establish differential parity tests

For each supported capability, retain evidence at three levels:

1. upstream source/resource symbol and invariant;
2. upstream test or fixture demonstrating observable behavior;
3. local unit/integration/E2E assertion demonstrating the bounded equivalent.

Where feasible, run the same document fixtures through upstream LibreOffice and
Vite Office and compare normalized model or ODF results. Visual rendering should
use semantic/layout assertions until browser layout is stable enough for visual
regression baselines.

### P8.2 Promote capabilities from implemented to verified

A capability may be `verified` only when:

- its ownership mapping is valid;
- its model operation and undo semantics are covered;
- every exposed UI surface dispatches the same command;
- relevant browser edge cases are covered;
- file-format behavior has round-trip evidence when applicable;
- all declared gaps remain explicit and non-contradictory.

### P8.3 Resume feature work in model dependency order

After workstreams 0-7 stabilize the architecture, add browser-relevant Writer
features in this order:

1. cross-node ranges and editing;
2. fuller item/style inheritance and automatic styles;
3. marks and bookmarks;
4. fields and sections;
5. tables;
6. anchored objects;
7. redlines and tracked changes;
8. layout/page model required for pagination and status information;
9. broader ODT coverage;
10. DOCX and other requested filters;
11. React UI for commands whose model operation is already verified.

Each feature must extend the canonical model first. UI-only simulations of a
missing model feature are prohibited.

## Dependency order

```text
P0 inventory truth
  -> P1 single mutation path
     -> P2 registered indices and notifications
        -> P5 unified browser editing
        -> future cross-node/model features
  -> P2 lifecycle ownership
     -> P3 medium/storage simplification
        -> P7 lazy session and recovery UI
  -> P4 command/presentation split
     -> P5 editor decomposition
  -> P6 SAX/xmloff contexts
     -> broader ODT and additional filters
  -> P8 differential verification and feature expansion
```

P4 resource/presentation separation and P6 parser context work can proceed after
P0 in parallel with core work, provided they do not preserve or introduce a
second mutation model.

## Recommended delivery slices

Each slice should be a separate executable task with its own verification and a
clean tracked state.

| Order | Delivery slice | Primary output |
| ---: | --- | --- |
| 1 | Inventory schema and false mapping correction | Trustworthy provenance contract and corrected records |
| 2 | Stale parity/docs cleanup and source-tree gate repair | Consistent baseline and green inventory gates |
| 3 | Immutable helper retirement | One production/test mutation API |
| 4 | Persistence clone removal | Save acknowledgement through `SwDocShell` |
| 5 | Registered content indices | Automatically corrected positions |
| 6 | Broadcaster/client graph | Model-driven invalidation |
| 7 | Lifecycle and undo ownership correction | Source-shaped `svl`/`sfx2`/`sw` boundaries |
| 8 | Medium descriptor normalization | Non-duplicated persistence state |
| 9 | Command presentation descriptors | One command source for all UI surfaces |
| 10 | `uiconfig`/React separation and component renames | Honest resource and presenter ownership |
| 11 | Menu interaction state machine | Keyboard- and focus-complete menus |
| 12 | Editor controller decomposition | Isolated DOM/IME/selection adapters |
| 13 | Unified editing surface | Removal of paragraph editing islands |
| 14 | Lazy Writer module lifecycle | No background Writer session outside Writer |
| 15 | SAX fast-context layer | Streaming XML event pipeline |
| 16 | Direct Writer import/export contexts | No `OdfParagraph` document intermediary |
| 17 | Differential parity verification | Verified capability records |

## Migration safeguards

- Do not combine inventory relabeling with behavior changes in the same task
  unless the mapping cannot be corrected without moving the implementation.
- Preserve current public command IDs throughout UI refactoring.
- Add characterization tests before deleting a legacy helper.
- Keep old and new XML import paths behind a test-only comparison switch until
  the supported fixture corpus is semantically equivalent; do not expose both as
  long-lived production paths.
- Introduce registered indices before adding persistent marks or cross-node undo
  actions.
- Move lifecycle state only after save-mark, concurrent save, failed save, and
  recovery tests describe current intended behavior.
- Make session creation lazy before expanding Worker or recovery background work.
- Avoid compatibility aliases after all in-repository callers migrate; aliases
  would perpetuate the previous architecture.

## Required verification by workstream

### Inventory and documentation

- schema validation;
- source path and symbol resolution against the pinned checkout;
- contradiction checks between runtime inventory and provenance;
- repository-relative Markdown link validation;
- docs and routing checks.

### Core model and undo

- unit tests for identity preservation;
- multi-position correction matrices;
- undo/redo and save-position tests;
- notification ordering and disposal tests;
- snapshots only at explicit serialization boundaries.

### Browser UI and editing

- component tests for command state and dispatch;
- DOM tests for focus, keyboard menus, input intent, and IME;
- Playwright tests for cross-paragraph selection/editing and clipboard;
- accessibility checks with keyboard-only navigation;
- no direct core mutation imports from React presenters.

### XML and ODT

- tokenizer/context ordering tests;
- parser security/resource-limit tests;
- upstream-produced fixture import;
- local export accepted by upstream LibreOffice;
- semantic round-trip tests;
- cancellation, timeout, stale response, and Worker restart tests;
- large-document memory and latency characterization.

### Lifecycle and storage

- no session/timer/listener on non-Writer routes;
- concurrent mutation during save;
- failed primary and recovery saves;
- recovery lease contention and expiry;
- clean disposal and reopen behavior;
- schema migration/rejection tests for IndexedDB snapshots.

## Definition of done for the refactoring program

The implemented scope is considered structurally aligned when all of the
following hold:

- every runtime module has an honest, non-contradictory classification;
- every upstream mapping identifies matching symbols and responsibilities;
- the default verification command runs inventory, provenance, and source-tree
  gates;
- no interactive operation clones the Writer document;
- one mutable command path is shared by production and behavior tests;
- registered indices preserve all live model positions through supported edits;
- model broadcasters drive command and view invalidation;
- browser lifecycle and persistence state no longer live in `SwDoc`;
- menu, toolbar, shortcut, and editor surfaces dispatch the same command IDs;
- React resources and upstream `uiconfig` descriptors have distinct ownership;
- DOM input, selection, IME, and clipboard code is isolated from Writer model
  operations;
- the editor behaves as one logical editing surface;
- XML import/export uses streaming contexts and the canonical Writer model;
- Writer session and recovery work are lazy and disposable;
- each implemented capability has assertion-level parity evidence or a precise,
  justified stack divergence;
- all currently supported behavior remains covered and no unsupported document
  construct is silently flattened.

## Residual risks

- Browser `contenteditable`, selection, and IME behavior differs across engines;
  the adapter needs cross-browser characterization even after decomposition.
- A source-shaped architecture can become filename mimicry if symbol and
  invariant evidence are not enforced.
- Removing fixture helpers may initially increase test setup verbosity; shared
  mutable fixture builders should solve construction only, not reintroduce
  alternate behavior.
- Streaming XML contexts are more complex than a DOM walk and require stronger
  parser-state tests.
- Moving lifecycle ownership can expose previously hidden races between save,
  recovery, undo, and document replacement.
- Upstream behavior sometimes depends on layout or UNO services that are not yet
  present. Such dependencies must be recorded explicitly rather than approximated
  in UI code.

## Immediate next tasks

The first implementation wave contains the following tasks (`[x]` means the
task is complete):

1. extend provenance/inventory schemas and correct the confirmed false mappings;
2. repair stale documentation and make source-tree/provenance/parity checks part
   of the normal verification gate;
3. [x] characterize and remove the legacy immutable command helpers;
4. [x] remove the persistence acknowledgement clone;
5. design and implement registered content indices with exhaustive edit-matrix
   tests;
6. introduce model broadcasters and a single React subscription bridge.

UI restructuring, XML context migration, and lifecycle movement should begin
after those tasks establish trustworthy evidence and stable core mutation
semantics.
