# LibreOffice-derived source tree

The browser project uses LibreOffice-derived module names to make each local
implementation, test, and parity record easy to locate against the pinned
`libreoffice-26.8.0.2` checkout. The tree preserves ownership boundaries, not
C++ implementation details: React, TypeScript, and browser APIs remain the
runtime of this static application.

| Local browser path | Pinned LibreOffice region | Current responsibility |
| --- | --- | --- |
| `apps/office/src/framework/source/services` | `framework/source/services` | Static React application composition, suite services, and worker protocol contracts |
| `apps/office/src/framework/source/dispatch` | `framework/source/dispatch` | Typed command dispatch |
| `apps/office/src/framework/source/accelerators` | `framework/source/accelerators` | Browser shortcut normalization |
| `apps/office/src/sfx2/source/doc` | `sfx2/source/doc` | Shared document identity, transactions, and storage contracts |
| `apps/office/src/svl/source/misc` | `svl/source/misc` | Recovery orchestration |
| `apps/office/src/vcl/browser` | `vcl` | Browser-only clipboard, download, IndexedDB, and styling adapters |
| `apps/office/src/sw/source/core/doc` | `sw/source/core/doc` | Serializable Writer document and paragraph transitions |
| `apps/office/src/sw/source/uibase/docvw` | `sw/source/uibase/docvw` | Document-page editor, DOM selection, and editable paragraphs |
| `apps/office/src/sw/source/uibase/ribbar` | `sw/source/uibase/ribbar` | Writer formatting toolbar |
| `apps/office/src/sw/source/uibase/sidebar` | `sw/source/uibase/sidebar` | Writer properties sidebar |
| `apps/office/src/sw/source/uibase/shells` | `sw/source/uibase/shells` | Writer command-shell shortcut adapters |
| `apps/office/src/sw/source/uibase/uiview` | `sw/source/uibase/uiview` | Writer workbench state and workspace view chrome |
| `apps/office/src/sw/source/uibase/utlui` | `sw/source/uibase/utlui` | Writer menus, standard toolbar, clipboard-selection helpers |
| `apps/office/src/sw/uiconfig/swriter` | `sw/uiconfig/swriter` | Declarative browser command-placement data |

Tests remain colocated with the module they protect, matching the local source
ownership rather than imitating LibreOffice's CppUnit/Python harnesses. Browser
end-to-end tests remain in `apps/office/e2e`, because they are Playwright test
entrypoints rather than implementations of an upstream C++ module.

This mapping is architectural provenance, not a parity claim. Capability-level
source, test, and Help evidence remains in the machine-readable
[Writer command mappings](parity/writer-command-slice.json).
