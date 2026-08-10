# Iterative Delivery Roadmap

## Operating model

The full parity objective is delivered as a dependency graph of bounded
AgentPlane tasks. Every newly implemented feature receives a separate task with
implementation, tests, documentation, and parity evidence. Task completion never
redefines or narrows the program-level LibreOffice parity target.

This roadmap names task families, not completion claims. The
[parity matrix](parity-matrix.md) is the status source of truth.

## Phase 0: program controls

### Task 0.1 — Program foundation

Create the charter, initial parity matrix, browser architecture, test strategy,
documentation strategy, roadmap, and designated reference path. This is
documentation-only and does not scaffold application code. Repository policy
classifies `.gitignore` as an implementation path, so its required reference
entry moves to Task 0.2 rather than widening this task after approval.

### Task 0.2 — Project and quality-tooling bootstrap

Create the TypeScript + Vite + Tailwind static application and a modular
workspace baseline. Add strict type checking, formatting/linting, unit tests and
coverage, browser E2E smoke tests, accessibility smoke tests, production static
build verification, JSDoc validation, authored-file size reporting, and initial
developer documentation. Every authored source file and function introduced in
the task must meet the charter's JSDoc contract.

Add `vendor/libreoffice-reference/` to `.gitignore` in this code-classified task
before any reference acquisition is permitted.

Acceptance must demonstrate that the built application runs from static assets
without an application backend.

Implementation and verification are tracked by AgentPlane task
`202608100659-GY449B`. Its application is an explicitly labelled foundation
preview, not a shared-shell parity implementation. The task's verification and
closure records are the authoritative delivery evidence.

### Task 0.3 — Pinned LibreOffice reference acquisition

Completed by AgentPlane task `202608100753-FYEAQ6`. The ignored research checkout
uses LibreOffice `libreoffice-26.8.0.2` at commit
`9bc445578031fecf56086729d8e4940c77e14d65`. The
[baseline specification](libreoffice-baseline.md) records its tag object,
reproducible shallow acquisition, local verification, and per-file licensing
boundary. No upstream asset or fixture was copied into tracked paths, and no
parity row advances until Task 0.4 inventories the pinned corpus.

### Task 0.3a — Pinned help, translation, and dictionary corpora

Completed by AgentPlane task `202608100814-2TT1YA`. The three gitlinks in the
selected core tree are initialized as shallow, exact-commit checkouts and have
locally verifiable annotated release tags. The baseline now covers 13,398 help
files, 25,704 translation files, and 859 dictionary files without tracking or
copying their content into Vite Office. Counts prove acquisition integrity only;
inventory and parity remain pending.

### Task 0.4 — Source, test, and documentation inventory tooling

Build deterministic scripts and schemas that validate all four pinned corpus
identities, inventory upstream modules, tests, fixtures, help, translations, and
dictionaries, and fail below the acquisition counts in the
[baseline specification](libreoffice-baseline.md). Expand seed matrix rows into
atomic records and report all unmapped items. Generated results must be diffable
and validated in CI.

### Task 0.4a — Baseline contract validator

Completed by AgentPlane task `202608100830-MT7ETT`. The TypeScript validator and
deterministic JSON report gate all later inventory generation. It validates the
complete four-corpus pinned checkout and its acquisition floors, but
intentionally does not create atomic inventory records or advance parity status.
The remaining Task 0.4 extractors will use this contract as their input boundary.

### Task 0.4b — Core build-module extractor

Completed by AgentPlane task `202608100853-D91P3V`. The generated 237-record
core build-module inventory has exact core-commit provenance and explicit
`unmapped` status. It is a structural handoff for later atomic source, test, and
documentation extractors; it does not change a parity-matrix capability status.

### Task 0.4c — Core test-constructor extractor

Completed by AgentPlane task `202608100905-Q9AWEJ`. The generated 565-record
core test inventory covers exact gbuild constructor invocations: 415 CppUnit,
58 JUnit, 13 Python, and 79 UI tests. Records are provenance-only and
`unmapped`; assertion, fixture, and documentation mapping remains separate work.

### Task 0.4d — Help XHP topic extractor

Completed by AgentPlane task `202608100919-2WRBJ2`. The generated 2,746-record
help-topic inventory covers every pinned `source/text/<area>/**/*.xhp` path in
the `helpcontent2` corpus. Its records retain only path-level provenance and
explicit `unmapped` status; topic-content, license, local-documentation, and
behavioral mappings remain separate work.

### Task 0.4e — Translation PO catalog extractor

Completed by AgentPlane task `202608100934-CXVVNV`. The generated 25,699-record
translation-catalog inventory covers every pinned `source/<locale>/**/*.po`
path across 131 locale directories in the `translations` corpus. Its records
retain only path-level provenance and explicit `unmapped` status; message-level,
locale-behavior, license, and local-UI mappings remain separate work.

### Task 0.4f — Dictionary AFF/DIC file extractor

Completed by AgentPlane task `202608100946-H1P6AN`. The generated 245-record
dictionary-file inventory covers every pinned AFF and DIC path in the
`dictionaries` corpus: 98 AFF files and 147 DIC files. Records retain only
path-level provenance and explicit `unmapped` status; lexical behavior, license,
and local language-tool mappings remain separate work.

### Task 0.4g — Core CppunitTest source-target extractor

Completed by AgentPlane task `202608100959-2TZGN0`. The generated 686-record
source-target inventory links every in-scope declaration to an existing
CppunitTest constructor ID: 684 records resolve to Git-tracked physical `.cxx`
paths and 2 retain explicit unevaluated Make expressions. It is
provenance-only and `unmapped`; assertions, fixtures, platform evaluation, and
local executable test mappings remain separate work.

### Task 0.4h — Core JunitTest Java source-target extractor

Completed by AgentPlane task `202608101030-KVFYSK`. The generated 160-record
Java source-target inventory links every `gb_JunitTest_add_sourcefiles`
declaration to an existing JunitTest constructor ID. It confirms 156
Git-tracked `.java` paths and preserves 4 declared-but-absent literal paths as
explicit `missing` evidence; assertion, fixture, platform evaluation, and local
executable test mappings remain separate work.

### Task 0.4i — Core PythonTest module extractor

Completed by AgentPlane task `202608101043-PBNYCF`. The generated 59-record
Python module inventory links every `gb_PythonTest_add_modules` declaration to
an existing PythonTest constructor ID. All 59 derived `.py` paths are
Git-tracked at the pinned core commit; the extractor retains no unevaluated
Make expressions and no declared-but-absent paths. It is provenance-only and
`unmapped`; assertions, fixtures, platform evaluation, and local executable
test mappings remain separate work.

## Phase 1: shared office platform

Deliver each item as its own task or smaller bounded tasks:

1. accessible static application shell and workbench;
2. typed command dispatch and key-binding registry;
3. document lifecycle and serializable core model;
4. transaction, selection, undo, and redo infrastructure;
5. browser storage, autosave, recovery, open, save, and download adapters;
6. worker protocol and cancellation infrastructure;
7. localization, locale data, writing direction, and message loading;
8. accessible UI primitives, dialogs, menus, toolbars, panels, and focus model;
9. rendering primitives and deterministic visual-test harness;
10. secure archive/XML/binary parsing and format adapter contracts.

Each task maps atomic upstream behavior before implementation begins.

## Phase 2: first vertical document slices

Implement small end-to-end slices that exercise the shared platform:

- Writer: create a document, edit paragraphs, format text, undo/redo, save/open
  a minimal ODT subset, and document the behavior through separate feature tasks.
- Calc: create a workbook, edit cells, evaluate a minimal formula set, recalculate,
  save/open a minimal ODS subset, and document each behavior separately.
- Impress/Draw: create pages/slides, add basic text and shapes, render, reorder,
  and save/open minimal ODP/ODG subsets through separate feature tasks.
- Math: parse, edit, render, and embed a minimal formula subset through separate
  tasks.

Minimal slices are scaffolding toward parity, not substitutes for complete suite
behavior. Their matrix status remains below `verified` wherever mapped upstream
assertions or topics are missing.

## Phase 3: suite breadth and compatibility

Use the atomic inventory to schedule one bounded feature task at a time for:

- Writer layout, sections, styles, lists, tables, fields, references, review,
  mail merge, pagination, printing, PDF, and format compatibility;
- Calc formulas, dependency/cycle behavior, arrays, names, formatting, sheets,
  charts, pivot/data tools, validation, collaboration semantics, and formats;
- Impress masters, layouts, notes, animations, transitions, media, playback,
  presenter behavior, printing, PDF, and formats;
- Draw shapes, connectors, layers, transformations, text, images, diagrams,
  printing, export, and formats;
- Chart types, data binding, axes, legends, labels, styling, embedding, and export;
- Math grammar, symbols, layout, accessibility, embedding, import, and export;
- shared templates, styles, search, spelling, language tools, clipboard, links,
  fields, printing, PDF, images, and interoperability.

Ordering is driven by dependencies and upstream evidence, not by suite-wide
tasks that are too large to verify.

## Phase 4: high-risk feasibility areas

Create independent research-and-implementation tasks for Base, macros, scripting,
UNO/extension compatibility, native integrations, external data, printing/color
fidelity, fonts, complex text, and platform accessibility. Each task must retain
the original parity requirement, compare browser/WebAssembly/library options,
prototype where needed, and request user approval for any genuine exception.

## Phase 5: parity closure

Closure requires generated evidence that:

- every upstream feature/test/documentation inventory item has stable mappings;
- all mapped capabilities meet functional, test, and documentation gates;
- static builds pass supported-browser, offline, accessibility, localization,
  format, visual, performance, and security suites;
- no hidden skipped tests, undocumented APIs, oversized authored files, unknown
  parity IDs, or unexplained exceptions remain;
- final documentation and release artifacts reflect the pinned baseline.

Only then may the program-level goal be considered achieved.

## Standard feature-task contract

Every feature task must specify:

1. stable parity IDs and upstream evidence in scope;
2. one bounded user outcome and explicit non-goals;
3. affected architectural packages and dependency decisions;
4. implementation and migration steps;
5. mapped unit, integration, format, visual, accessibility, localization, and
   E2E tests as applicable;
6. JSDoc, user, developer, API, and format documentation changes;
7. file-size review and performance/security considerations;
8. exact verification commands, expected evidence, rollback, and remaining gaps;
9. parity-matrix updates that prevent unsupported completion claims.

The [architecture](architecture.md), [test strategy](test-strategy.md), and
[documentation strategy](documentation-strategy.md) provide the corresponding
quality gates.
