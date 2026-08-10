# Browser Architecture

## Architectural intent

Vite Office preserves LibreOffice's recognizable product and document domains
without copying its native runtime architecture into the browser. Shared models,
commands, formats, and services remain independent of suite-specific UI. Browser
adapters isolate storage, workers, rendering, and platform APIs.

The deployable boundary is a set of static assets. All document processing runs
in the user's browser.

## Proposed workspace boundaries

The bootstrap task should create a workspace that can grow into these logical
packages. Exact library choices require an architecture decision record and a
license/maintenance review.

| Boundary | Responsibility | LibreOffice continuity |
| --- | --- | --- |
| `apps/office` | Static application entry, routing, workbench, suite selection | Desktop/frame shell concepts |
| `packages/core` | Document identity, lifecycle, transactions, events, errors | Shared office framework concepts |
| `packages/commands` | Typed commands, dispatch, undo/redo, key bindings | Command/dispatch model |
| `packages/model` | Shared immutable or transactional document primitives | Shared document model concepts |
| `packages/writer` | Writer model, layout semantics, editing operations | Writer domain |
| `packages/calc` | Spreadsheet model, dependency graph, formulas, recalculation | Calc domain |
| `packages/impress` | Presentation model, masters, animations, playback | Impress domain |
| `packages/draw` | Vector page, shape, layer, and connector behavior | Draw domain |
| `packages/base` | Browser-feasible database documents and tools | Base domain |
| `packages/math` | Formula syntax tree, editing, layout, and embedding | Math domain |
| `packages/chart` | Shared chart model, editor, and renderer | Chart domain |
| `packages/formats` | Import/export and conformance adapters | Filter and storage domains |
| `packages/rendering` | Layout primitives, canvas/SVG/DOM/WebGL adapters | View and rendering boundaries |
| `packages/platform` | Storage, clipboard, printing, workers, feature detection | Platform abstraction |
| `packages/ui` | Accessible primitives and Tailwind-backed design tokens | Shared widget/toolkit role |
| `packages/i18n` | Messages, locale data, writing direction, formatting | Localization infrastructure |
| `packages/testing` | Fixtures, parity helpers, visual and format assertions | Shared test infrastructure |

Suite packages must depend on shared contracts, not application-shell internals.
Format adapters must translate through stable document contracts and must not
silently encode UI state.

## Runtime layers

1. **Workbench layer** owns tabs, commands, panels, dialogs, focus, and document
   lifecycle presentation.
2. **Application/domain layer** implements typed use cases and suite behavior.
3. **Document layer** owns serializable state, transactions, undo/redo, and
   deterministic calculation or layout inputs.
4. **Format layer** parses and emits external formats, preferably in workers.
5. **Rendering layer** projects document state into accessible UI and printable
   or exportable output.
6. **Platform layer** wraps browser capabilities behind tested interfaces.

Direct imports may only point inward toward stable contracts. Platform APIs are
not called from document-domain code.

## State and commands

- Every user-visible mutation is represented by a typed command with explicit
  preconditions, deterministic state effects, undo information, and parity IDs.
- Document state must be serializable independently of React or another view
  library. UI framework objects do not belong in the document model.
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

No dependency is selected by this document. The bootstrap and feature tasks own
their decisions and must record them.

## Architecture verification

Future CI should enforce workspace dependency boundaries, TypeScript strictness,
public API documentation, worker contract tests, static-build smoke tests, file
size rules, and parity-ID traceability. See the [test strategy](test-strategy.md)
and [roadmap](roadmap.md).
