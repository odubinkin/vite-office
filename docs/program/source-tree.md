# LibreOffice-derived source tree

The browser project uses LibreOffice-derived module names to make each local
implementation, test, and parity record easy to locate against the pinned
`libreoffice-26.8.0.2` checkout. Every newly implemented capability must map
to a concrete upstream file as well as an ownership directory; a similar
directory name alone is insufficient. The tree preserves ownership boundaries,
not C++ implementation details: React, TypeScript, and browser APIs remain the
runtime of this static application.

| Local browser path | Pinned LibreOffice region | Current responsibility |
| --- | --- | --- |
| `apps/office/src/framework/source/services` | `framework/source/services` | Static React desktop composition, module-manager suite inventory, and explicit browser bootstrap/worker protocol contracts |
| `apps/office/src/framework/source/dispatch` | `framework/source/dispatch` | Typed command dispatch |
| `apps/office/src/framework/source/accelerators` | `framework/source/accelerators` | Browser shortcut normalization |
| `apps/office/src/sfx2/source/doc` | `sfx2/source/doc` | Shared document identity, document undo manager, and bounded browser document-medium contract |
| `apps/office/src/svl/source/misc` | `svl/source/misc` | Recovery orchestration |
| `apps/office/src/vcl/browser` | `vcl` | Browser-only clipboard, download, IndexedDB, and styling adapters |
| `apps/office/src/sw/source/core/doc` | `sw/source/core/doc` | Serializable Writer document transitions |
| `apps/office/src/sw/source/core/docnode` | `sw/source/core/docnode` | Serializable Writer paragraph-node transitions |
| `apps/office/src/sw/source/uibase/docvw` | `sw/source/uibase/docvw` | Document-page editor and editable paragraphs |
| `apps/office/src/sw/source/uibase/wrtsh` | `sw/source/uibase/wrtsh` | Writer selection shell and browser DOM caret bridge |
| `apps/office/src/sw/source/uibase/dochdl` | `sw/source/uibase/dochdl` | Selection transfer-document preparation and clipboard ownership |
| `apps/office/src/sw/source/filter/html` | `sw/source/filter/html` | Writer HTML transfer serialization |
| `apps/office/src/sw/source/filter/ascii` | `sw/source/filter/ascii` | Writer plain-text transfer serialization |
| `apps/office/src/sw/source/uibase/ribbar` | `sw/source/uibase/ribbar` | Writer formatting toolbar |
| `apps/office/src/sw/source/uibase/sidebar` | `sw/source/uibase/sidebar` | Writer properties sidebar |
| `apps/office/src/sw/source/uibase/shells` | `sw/source/uibase/shells` | Writer command-shell shortcut adapters |
| `apps/office/src/sw/source/uibase/uiview` | `sw/source/uibase/uiview` | Writer workbench state and workspace view chrome |
| `apps/office/src/sw/uiconfig/swriter/menubar` | `sw/uiconfig/swriter/menubar` | Writer menu declaration and browser menu control |
| `apps/office/src/sw/uiconfig/swriter/toolbar` | `sw/uiconfig/swriter/toolbar` | Writer toolbar declaration and browser toolbar controls |

Tests remain colocated with the module they protect, matching the local source
ownership rather than imitating LibreOffice's CppUnit/Python harnesses. Browser
end-to-end tests remain in `apps/office/e2e`, because they are Playwright test
entrypoints rather than implementations of an upstream C++ module.

This mapping is architectural provenance, not a parity claim. Capability-level
source, test, and Help evidence remains in the machine-readable
[Writer command mappings](parity/writer-command-slice.json).

## Complete current runtime provenance

[`source-provenance.json`](source-provenance.json) is the authoritative,
machine-readable exhaustive mapping for every current non-test TypeScript or
TSX runtime module in `apps/office/src`. Each entry is either `mapped`, with an
existing concrete path in the pinned LibreOffice checkout, or `browser-only`,
with a detailed explanation of why a browser entrypoint, DOM component, Web
Worker protocol, download adapter, or IndexedDB adapter has no honest native
source-file implementation.

`npm run check:source-provenance` collects the runtime tree at validation time,
rejects missing, stale, and duplicate entries, verifies every declared upstream
path, and checks the pinned commit and tag. It is deliberately separate from
capability parity: a source mapping records ownership and exceptions, while a
capability may remain incomplete until its implementation, upstream tests, and
documentation have dedicated parity evidence.

## Intentional mapped filename divergences

Mapped modules ordinarily use the exact LibreOffice filename. The exhaustive
`filenameDivergences` manifest field and provenance gate allow the following
six cases only; adding, removing, or renaming one must update both the table and
machine-checked record.

| Local browser module | Pinned upstream module | Reason |
| --- | --- | --- |
| `svl/source/misc/recovery.ts` | `svl/source/misc/lockfilecommon.cxx` | Browser recovery coordinator at the shared lockfile ownership boundary |
| `sw/source/core/doc/writer.ts` | `sw/source/core/doc/docnew.cxx` | Browser Writer aggregate rather than only document creation |
| `sw/source/uibase/docvw/edtwin-paragraph.tsx` | `sw/source/uibase/docvw/edtwin.cxx` | React paragraph decomposition beneath the one editor boundary |
| `sw/uiconfig/swriter/menubar/menubar-commands.ts` | `sw/uiconfig/swriter/menubar/menubar.xml` | Typed command declaration extracted from XML configuration |
| `sw/uiconfig/swriter/menubar/format-menu.tsx` | `sw/uiconfig/swriter/menubar/menubar.xml` | React Format-popup decomposition of the same menu hierarchy |
| `vcl/browser/browser-clipboard.ts` | `vcl/source/app/ClipboardBase.cxx` | Explicit static-browser clipboard platform adapter |

## File-level provenance in the active Writer list slice

| Local browser module | Pinned LibreOffice source/configuration module | Responsibility |
| --- | --- | --- |
| `sw/source/core/doc/list.ts` | `sw/source/core/doc/list.cxx` | Serializable list metadata and legacy normalization |
| `sw/source/core/doc/number.ts` | `sw/source/core/doc/number.cxx` | Deterministic visible bullet and numbering marker calculation |
| `sw/source/uibase/shells/txtnum.ts` | `sw/source/uibase/shells/txtnum.cxx` | Default bullet, default numbering, and remove-bullets command transition |
| `sw/source/uibase/shells/listsh.ts` | `sw/source/uibase/shells/listsh.cxx` | Active-list Promote and Demote level transition |
| `sw/source/uibase/shells/textsh.ts` | `sw/source/uibase/shells/textsh.cxx` | Browser-owned Copy, plain-text download, and Undo/Redo shortcut command shell |
| `sw/source/uibase/docvw/edtwin.tsx` | `sw/source/uibase/docvw/edtwin.cxx` | Browser document-view integration for markers and editing hosts |
| `sw/source/uibase/dochdl/swdtflvr.ts` | `sw/source/uibase/dochdl/swdtflvr.cxx` | Selection transfer-document preparation and format-writer dispatch |
| `sw/source/filter/html/htmlnumwriter.ts` | `sw/source/filter/html/htmlnumwriter.cxx` | Bounded nested semantic `ul`/`ol`/`li` clipboard HTML serialization |
| `sw/source/filter/ascii/ascatr.ts` | `sw/source/filter/ascii/ascatr.cxx` | Level-indented plain-text list-marker clipboard serialization |
| `sw/uiconfig/swriter/menubar/menubar.tsx` | `sw/uiconfig/swriter/menubar/menubar.xml` | Writer menu control and Format → Bullets and Numbering declaration |
| `sw/uiconfig/swriter/menubar/menubar-commands.ts` | `sw/uiconfig/swriter/menubar/menubar.xml` | Declarative Writer menu order and list command definitions |
| `sw/uiconfig/swriter/toolbar/standardbar.tsx` | `sw/uiconfig/swriter/toolbar/standardbar.xml` | Browser Writer standard-toolbar control |
| `sw/uiconfig/swriter/toolbar/textobjectbar.ts` | `sw/uiconfig/swriter/toolbar/textobjectbar.xml` | Text-object toolbar list command declaration |
| `sw/uiconfig/swriter/toolbar/numobjectbar.ts` | `sw/uiconfig/swriter/toolbar/numobjectbar.xml` | Numbering-toolbar Promote and Demote command declaration |

## Existing Writer view-module identities

| Local browser module | Pinned LibreOffice module | Responsibility |
| --- | --- | --- |
| `sw/source/uibase/uiview/view.tsx` | `sw/source/uibase/uiview/view.cxx` | Browser Writer view/workbench ownership |
| `sw/source/uibase/uiview/viewfunc.ts` | `sw/source/uibase/uiview/viewfunc.hxx` | Pure focused-document, identity, formatting-command, and command-history helpers |
| `sw/source/uibase/uiview/viewstat.ts` | `sw/source/uibase/uiview/viewstat.cxx` | Browser view-status and visibility state |
| `sw/source/uibase/app/mainwn.tsx` | `sw/source/uibase/app/mainwn.cxx` | Main Writer window/chrome regions |
| `sw/source/uibase/docvw/edtwin.tsx` | `sw/source/uibase/docvw/edtwin.cxx` | Editable browser document-view orchestration |
| `sw/source/uibase/docvw/edtwin-paragraph.tsx` | `sw/source/uibase/docvw/edtwin.cxx` | Browser-only editable paragraph leaf beneath the matching editor module |
| `sw/source/uibase/wrtsh/select.ts` | `sw/source/uibase/wrtsh/select.cxx` | Browser selection shell and collapsed-caret bridge |
| `sw/source/uibase/ribbar/inputwin.tsx` | `sw/source/uibase/ribbar/inputwin.cxx` | Formatting-toolbar controls |
| `sw/source/uibase/sidebar/WriterInspectorTextPanel.tsx` | `sw/source/uibase/sidebar/WriterInspectorTextPanel.cxx` | Focused Writer paragraph inspector |
