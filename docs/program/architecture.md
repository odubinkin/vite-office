# Browser Architecture

## Architectural intent

Vite Office reimplements LibreOffice's recognizable product and document
domains in TypeScript. Document models, ownership boundaries, algorithms, and
format semantics follow the pinned LibreOffice sources as closely as the browser
runtime permits. Rendering, input, storage, workers, and other platform concerns
use browser adapters and may deliberately differ from VCL or operating-system
code.

The deployable boundary is a set of static assets. All document processing runs
in the user's browser.

## Implemented source boundary

The current `apps/office/src` tree is a browser-native realization of the
target boundaries, not a source-level port of LibreOffice C++. Its names and
nesting deliberately follow the corresponding pinned LibreOffice modules:

| Source area | Responsibility | LibreOffice continuity |
| --- | --- | --- |
| `framework/source/services`, `dispatch`, and `accelerators` | React composition, suite services, command dispatch, and browser shortcut adaptation | `framework` shell and dispatch ownership |
| `sfx2/source/doc` | Suite-neutral document identity, history, and storage contracts | `sfx2` document framework |
| `svl/source/items` and `svl/source/misc` | WhichId item pool/set primitives and generic recovery orchestration | `svl` item and shared utility layers |
| `vcl/browser` | Tested adapters around IndexedDB, downloads, clipboard, and browser styling | `vcl` platform/widget layer, specialized for static-browser runtime |
| `sw/source/core/attr`, `doc`, `docnode`, `para`, `txtnode`, and `crsr` | Writer document graph, attribute pool, style collections, ordered nodes, text attributes, numbering items, and model ranges | `SwDoc`, `SwAttrSet`, `SwTextFormatColl`, `SwNodes`, `SwTextNode`, `SwpHints`, `SwTextAttr`, `SwPosition`, and `SwPaM` ownership |
| `sw/source/uibase/docvw`, `ribbar`, `sidebar`, `shells`, `uiview`, and `utlui` | Writer document view, formatting bar, sidebar, command shells, workbench view, and common Writer UI helpers | Matching `sw/source/uibase` regions |
| `sw/uiconfig/swriter` | Browser declarations for Writer menu/toolbar placement | Writer UI configuration ownership |

The browser implementation keeps React and browser objects out of Writer core.
`SwDoc` owns `SwAttrPool`, paragraph styles, numbering rules, and `SwNodes`; that
array contains the same fixed section sentinels as the pinned `SwNodes`
constructor and owns `SwTextNode` content. Paragraph properties resolve through
node-local `SwAttrSet` deltas, `SwTextFormatColl` parents, and pool defaults. Text attributes
are stored as `SwTextAttr` ranges in `SwpHints`, while `SwPosition` and `SwPaM`
identify model positions and selections. React receives derived paragraph and
run projections from this graph. The document editor separately owns DOM caret
conversion and editable-paragraph presentation in `docvw`.

The TypeScript core is source-guided rather than ABI-compatible: it preserves
the applicable LibreOffice model and algorithms, while substituting browser
transactions and explicit snapshots where C++ pointers, notifications,
and native UI services do not yet exist. The exact implemented boundary and its
remaining gaps are recorded in the [Writer core model](writer-core-model.md).

The Vite production base is relative (`./`), and the static smoke check rejects
remote or root-absolute asset references and application-backend endpoints.
The [source-tree map](source-tree.md) records every currently instantiated
LibreOffice-derived browser area and its responsibility.

The remaining package boundaries below are architectural targets. They do not
exist until their own feature tasks create and verify them.

## Planned top-level module boundaries

The current source tree keeps LibreOffice-derived top-level ownership as later
static-browser modules are added. Exact library choices still require an
architecture decision record and a license/maintenance review.

| Boundary | Responsibility | LibreOffice continuity |
| --- | --- | --- |
| `framework`, `sfx2`, `svl`, `vcl` | Browser shell, shared document services, utilities, and platform adapters | Corresponding LibreOffice shared modules |
| `sw` | Writer model, layout semantics, editing, UI, configuration, and tests | Writer domain |
| `sc` | Spreadsheet model, dependency graph, formulas, recalculation, UI, and tests | Calc domain |
| `sd` | Presentation and drawing pages, masters, animation, playback, and tests | Impress/Draw domain |
| `dbaccess` | Browser-feasible database documents and tools | Base domain |
| `starmath` | Formula syntax tree, editing, layout, and embedding | Math domain |
| `chart2` | Shared chart model, editor, renderer, and embedding | Chart domain |
| `filter` | Import/export and conformance adapters | Filter and storage domains |
| `i18nlangtag`, `linguistic`, `translations`, `dictionaries` | Locale, language, and message resources | Localization infrastructure |
| `qa` | Fixtures, parity helpers, visual and format assertions | Test ownership regions |

Suite modules depend on shared contracts, never browser shell internals. Format
adapters translate through stable document contracts and never silently encode
UI state.

## Runtime layers

1. **Workbench layer** owns tabs, commands, panels, dialogs, focus, and document
   lifecycle presentation.
2. **Application/domain layer** implements typed use cases and suite behavior.
3. **Document layer** owns the canonical in-memory object graph, transactions,
   explicit persistence snapshots, undo/redo inputs, and deterministic
   calculation or layout inputs.
4. **Format layer** parses and emits external formats, preferably in workers.
5. **Rendering layer** projects document state into accessible UI and printable
   or exportable output.
6. **Platform layer** wraps browser capabilities behind tested interfaces.

Direct imports may only point inward toward stable contracts. Platform APIs are
not called from document-domain code.

## State and commands

- Every user-visible mutation is represented by a typed command with explicit
  preconditions, deterministic state effects, undo information, and parity IDs.
- The canonical document model may be an identity-bearing, cyclic object graph,
  as in Writer. Persistence and browser history use explicit, versioned snapshot
  conversion rather than forcing the runtime model into a view DTO.
- Document snapshots must be serializable independently of React or another
  view library. UI framework objects do not belong in the document model.
- Expensive parsing, calculation, layout, and export work should run in Web
  Workers behind versioned message contracts.
- Worker messages and persistence schemas are documented and compatibility
  tested like public APIs.
- Concurrency rules must specify cancellation, stale result rejection, and
  deterministic ordering.

## Persistence and static deployment

The product cannot depend on backend persistence. The platform layer may use:

- user-mediated open/save through the File System Access API where supported;
- `<input type="file">` and download fallbacks;
- IndexedDB or Origin Private File System for autosave and recovery;
- Service Worker caching for offline static assets after initial installation.

Stored content needs versioned schemas, migrations, quota handling, corruption
recovery, and tests. Browser storage is not a substitute for explicit file-save
behavior.

## Rendering and accessibility

The renderer may combine DOM, Canvas, SVG, and WebGL, but interactive semantics
must remain available to assistive technology. A canvas-only visual match is not
functional parity. Rendering decisions must account for high DPI, zoom, font
metrics, bidirectional text, IME input, selection, pagination, print CSS, and
deterministic visual testing.

## Import and export

Format support is a collection of separately testable adapters. Prefer mature
libraries for ZIP, XML, PDF, images, formula parsing, and other primitives after
security, license, maintenance, bundle-size, and fidelity review. Untrusted
documents must be parsed with resource limits and without executing embedded
active content.

Round-trip tests must distinguish semantic equality from byte equality and must
record expected normalization. Reference fixtures derived from LibreOffice need
documented provenance and licensing.

## Browser feasibility boundaries

The following remain required parity areas but need dedicated feasibility tasks:

- Base connections to local or remote database engines;
- UNO, native extensions, plugins, and macro execution;
- operating-system services, global fonts, scanners, and native dialogs;
- exact printing, PDF, color-management, and font-metric behavior;
- external links, network data sources, collaboration, and email integration;
- platform-specific accessibility APIs and input methods.

A feasibility task may propose a sandboxed browser implementation, WebAssembly
port, standards-based substitute, or explicit exception. Only the user may
approve a parity exception, and the matrix must retain it as visible debt.

## Dependency selection gates

Each production dependency must have recorded evidence for:

- relevant capability and parity IDs;
- license compatibility and attribution;
- browser/static-hosting compatibility;
- security posture and untrusted-input handling;
- maintenance activity and replacement strategy;
- bundle and runtime cost;
- testability, determinism, accessibility, and localization impact.

The bootstrap selects React, Vite, Tailwind CSS, Lucide React, Vitest, Testing
Library, Playwright, and axe for the narrow foundation scope. These choices do
not pre-authorize format, model, rendering, storage, or office-feature
dependencies; later tasks must pass the same gates for their own selections.

## Architecture verification

The bootstrap enforces TypeScript strictness, linting, formatting, initial unit
coverage, Chromium/axe smoke behavior, relative-path static builds, authored
JSDoc, and file-size rules. Future tasks still need package-boundary checks,
worker contract tests, generated API documentation, cross-browser coverage, and
parity-ID traceability. See the [test strategy](test-strategy.md) and
[roadmap](roadmap.md).
