# LibreOffice-derived source tree

The browser project uses LibreOffice-derived module names to make each local
implementation, test, and parity record easy to locate against the pinned
`libreoffice-26.8.0.2` checkout. Every newly implemented capability must map
to a concrete upstream file as well as an ownership directory; a similar
directory name alone is insufficient. The tree preserves applicable ownership,
model structure, and algorithms while using TypeScript and browser APIs for the
static application runtime.

| Local browser path | Pinned LibreOffice region | Current responsibility |
| --- | --- | --- |
| `apps/office/src/framework/source/services` | `framework/source/services` | Static React desktop composition, module-manager suite inventory, and explicit browser bootstrap/worker protocol contracts |
| `apps/office/src/framework/source/dispatch` | `framework/source/dispatch` | Typed command dispatch |
| `apps/office/src/framework/source/accelerators` | `framework/source/accelerators` | Browser shortcut normalization |
| `apps/office/src/sfx2/source/doc` | `sfx2/source/doc` | Shared document identity, document undo manager, and bounded browser document-medium contract |
| `apps/office/src/editeng/source/items` | `editeng/source/items` | EditEngine paragraph items, currently `SvxAdjustItem` |
| `apps/office/src/svl/source/items` | `svl/source/items` | WhichId-keyed pool items, defaults, item-set deltas, state, and parent lookup |
| `apps/office/src/svl/source/misc` | `svl/source/misc` | Recovery orchestration |
| `apps/office/src/package/source/zipapi` | `package/source/zipapi` | CRC-32 plus bounded ZIP32 STORE/DEFLATE package input and deterministic STORE output |
| `apps/office/src/package/source/manifest` | `package/source/manifest` | ODF 1.3 manifest emission and mandatory-stream validation |
| `apps/office/src/vcl/browser` | `vcl` | Browser-only clipboard, file selection, byte download, IndexedDB, and styling adapters |
| `apps/office/src/xmloff/source/text` | `xmloff/source/text` | Writer-neutral ODF paragraph, automatic-style, and significant-whitespace conversion |
| `apps/office/src/sw/inc` | `sw/inc` | Pinned numeric Writer WhichIds and bounded item ranges |
| `apps/office/src/sw/source/core/attr` | `sw/source/core/attr` | Writer attribute pool/set specialization and format inheritance |
| `apps/office/src/sw/source/core/doc` | `sw/source/core/doc` | `SwDoc` ownership, style collections, numbering rules, content operations, Writer command façade, and snapshot conversion |
| `apps/office/src/sw/source/core/docnode` | `sw/source/core/docnode` | Ordered `SwNodes` storage, fixed section sentinels, and node types |
| `apps/office/src/sw/source/core/para` | `sw/source/core/para` | Writer paragraph pool items, currently `SwNumRuleItem` |
| `apps/office/src/sw/source/core/txtnode` | `sw/source/core/txtnode` | `SwTextNode` text storage and `SwpHints`/`SwTextAttr` character attributes |
| `apps/office/src/sw/source/core/crsr` | `sw/source/core/crsr` | `SwNodeIndex`, `SwPosition`, and directional `SwPaM` model ranges |
| `apps/office/src/sw/source/uibase/docvw` | `sw/source/uibase/docvw` | DOM-neutral `SwEditWin` ownership and current `SwNodes` coordinate conversion |
| `apps/office/src/sw/source/uibase/wrtsh` | `sw/source/uibase/wrtsh` | Writer shell selection and editing operations |
| `apps/office/src/sw/source/uibase/dochdl` | `sw/source/uibase/dochdl` | Selection transfer-document preparation and clipboard ownership |
| `apps/office/src/sw/source/filter/html` | `sw/source/filter/html` | Writer HTML transfer serialization |
| `apps/office/src/sw/source/filter/ascii` | `sw/source/filter/ascii` | Writer plain-text transfer serialization |
| `apps/office/src/sw/source/filter/xml` | `sw/source/filter/xml` | ODF package orchestration and `SwDoc` XML import/export bridges |
| `apps/office/src/sw/source/uibase/shells` | `sw/source/uibase/shells` | Writer command execution and state ownership |
| `apps/office/src/sw/source/uibase/uiview` | `sw/source/uibase/uiview` | Persistent Writer view/session composition |
| `apps/office/src/sw/source/uibase/app` | `sw/source/uibase/app` | `SwDocShell` new/load/save ownership and module composition |
| `apps/office/src/sw/uiconfig/swriter` | `sw/uiconfig/swriter` | Presentation-free menu and toolbar placement data derived from pinned XML resources |
| `apps/office/src/sw/browser` | Browser-only | React projections plus the single DOM edit-window, accelerator, filter, and storage adapters |

Tests remain colocated with the module they protect, matching the local source
ownership rather than imitating LibreOffice's CppUnit/Python harnesses. Browser
end-to-end tests remain in `apps/office/e2e`, because they are Playwright test
entrypoints rather than implementations of an upstream C++ module.

This mapping is architectural provenance, not a parity claim. Capability-level
source, test, and Help evidence remains in the machine-readable
[Writer command mappings](parity/writer-command-slice.json).

Stage 0 additionally maintains an exhaustive
[`runtime-inventory.json`](parity/runtime-inventory.json). It classifies every
production runtime module and its exported operations as an upstream mechanism,
browser adaptation, local infrastructure, overly broad mapping, or explicitly
out of parity scope. The same validation covers visible command IDs, UI-only
behavior, internal operations, and placeholder suites; this makes active code
without a capability record a hard inventory failure. Schema version 3 also
records each module's exact upstream file and symbols, local symbols, independent
contract/behavior/default status, source responsibility, divergence class,
justification, evidence, and the complete set of currently detected semantic or
browser-boundary violations. AST/API validation makes those violations an exact
set: an unrecorded defect or a stale resolved finding both fail the inventory.

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
`filenameDivergences` array in `source-provenance.json` is the authoritative
machine-checked list of intentional responsibility splits, browser boundaries,
generated-resource modules, and ECMAScript module-resolution names. The current
Writer edit-window owner uses the exact `sw/source/uibase/docvw/edtwin` identity;
its DOM implementation is separately and honestly classified under `sw/browser`.

## File-level provenance in active Writer list, character-formatting, clipboard, and model slices

The same table now also includes the active ODT file-command boundary.

| Local browser module | Pinned LibreOffice source/configuration module | Responsibility |
| --- | --- | --- |
| `editeng/source/items/paraitem.ts` | `editeng/source/items/paraitem.cxx` | `SvxAdjustItem` paragraph-alignment value |
| `editeng/source/items/textitem.ts` | `editeng/source/items/textitem.cxx` | `SvxWeightItem`, `SvxPostureItem`, and `SvxUnderlineItem` character values |
| `svl/source/items/poolitem.ts` | `svl/source/items/poolitem.cxx` | Base and primitive pooled item values |
| `sw/source/core/doc/doc.ts` | `sw/source/core/doc/doc.cxx`, `docnew.cxx` | Final `SwDoc` aggregate composing document managers without a parallel Writer facade |
| `sw/source/core/doc/DocumentListsManager.ts` | `sw/source/core/doc/DocumentListsManager.cxx` | Document list and numbering-rule ownership |
| `sw/source/core/doc/DocumentSettingManager.ts` | `sw/source/core/doc/DocumentSettingManager.cxx` | Document setting ownership |
| `sw/source/core/doc/DocumentStateManager.ts` | `sw/source/core/doc/DocumentStateManager.cxx` | Model revision state and batched mutation notifications |
| `sw/source/core/doc/DocumentStylePoolManager.ts` | `sw/source/core/doc/DocumentStylePoolManager.cxx` | Paragraph-style pool ownership |
| `sw/source/filter/basflt/writer-document-codec.ts` | TypeScript filter adaptation | Versioned primitive transport shared by filters and storage ports |
| `sw/source/filter/basflt/writer-storage.ts` | TypeScript filter adaptation | Port-neutral storage orchestration outside Writer core |
| `sw/browser/presentation/writer-view-projection.ts` | Browser adaptation | Immutable primitive React projection with external node labels |
| `svl/source/items/itempool.ts` | `svl/source/items/itempool.cxx` | Pool defaults and persisted-item factories |
| `svl/source/items/itemset.ts` | `svl/source/items/itemset.cxx` | Direct item deltas, parent/default lookup, state, clone, and clear operations |
| `package/source/zipapi/CRC32.ts` | `package/source/zipapi/CRC32.cxx` | Incremental ZIP CRC-32 calculation |
| `package/source/zipapi/ZipFile.ts` | `package/source/zipapi/ZipFile.cxx` | Central/local ZIP32 validation, resource ceilings, and STORE/DEFLATE input |
| `package/source/zipapi/ZipOutputStream.ts` | `package/source/zipapi/ZipOutputStream.cxx` | Deterministic unencrypted STORE package output |
| `package/source/manifest/ManifestExport.ts` | `package/source/manifest/ManifestExport.cxx` | ODF 1.3 manifest stream |
| `vcl/browser/browser-file.ts` | Browser-only | Sandboxed user file selection and byte reading without document ownership |
| `vcl/browser/browser-download.ts` | Browser-only | Sandboxed byte and plain-text download dispatch |
| `xmloff/source/core/xml-parser.ts` | `sax/source/fastparser/fastparser.cxx` | Worker-safe namespace-aware SAX tree with DTD and depth rejection |
| `xmloff/source/text/txtparae.ts` | `xmloff/source/text/txtparae.cxx` | Neutral ODF paragraph, inline, list-style, and nested-list export |
| `xmloff/source/text/txtparai.ts` | `xmloff/source/text/txtparai.cxx` | Neutral ODF paragraph, inline, and recursive list import |
| `sw/inc/hintids.ts` | `sw/inc/hintids.hxx` | Numeric WhichIds and bounded Writer ranges |
| `sw/source/core/attr/swatrset.ts` | `sw/source/core/attr/swatrset.cxx` | Document-owned `SwAttrPool` and Writer-specialized `SwAttrSet` |
| `sw/source/core/attr/format.ts` | `sw/source/core/attr/format.cxx` | `SwFormat` attributes and derived-from links |
| `sw/source/core/doc/fmtcol.ts` | `sw/source/core/doc/fmtcol.cxx` | Named `SwFormatColl` and paragraph `SwTextFormatColl` |
| `sw/source/core/para/paratr.ts` | `sw/source/core/para/paratr.cxx` | Paragraph `SwNumRuleItem` rule-name value |
| `sw/source/core/doc/list.ts` | `sw/source/core/doc/list.cxx` | Document-owned list tree plus explicit boundary projection to and from canonical numbering items |
| `sw/source/core/doc/number.ts` | `sw/source/core/doc/number.cxx` | Document-owned per-level numbering rules and deterministic visible markers |
| `sw/source/core/doc/doc.ts` | `sw/source/core/doc/doc.cxx` | `SwDoc` owner of `SwNodes` plus explicit browser snapshot conversion |
| `sw/source/core/docnode/nodes.ts` | `sw/source/core/docnode/nodes.cxx` | Ordered nodes and LibreOffice-matching fixed section sentinels |
| `sw/source/core/crsr/pam.ts` | `sw/source/core/crsr/pam.cxx` | Model positions and directional point/mark ranges |
| `sw/source/core/txtnode/ndhints.ts` | `sw/source/core/txtnode/ndhints.cxx` | Start-sorted item-set-backed text attribute hints and derived browser runs |
| `sw/source/core/txtnode/fmtinfmt.ts` | `sw/source/core/txtnode/fmtatr2.cxx` / `sw/inc/fmtinfmt.hxx` | `SwFormatINetFormat` hyperlink range metadata and snapshots |
| `sw/source/core/txtnode/txatbase.ts` | `sw/source/core/txtnode/txatbase.cxx` | `SwTextAttr` ranges and `SfxItemSet`-backed `SwFormatAutoFormat` items |
| `sw/source/core/doc/DocumentContentOperationsManager.ts` | `sw/source/core/doc/DocumentContentOperationsManager.cxx` | Bounded same-text-node Insert, Delete, and Replace operations through `SwPaM` |
| `sw/source/uibase/shells/listsh.ts` | `sw/source/uibase/shells/listsh.cxx` | Bounded Promote and Demote command identity |
| `sw/browser/accelerators/writer-shortcuts.ts` | Browser-only | Global keyboard-event adaptation to the shared dispatcher |
| `sw/browser/presentation/WriterHyperlinkDialog.tsx` | Browser-only | Accessible hyperlink create/edit dialog behind Writer commands |
| `sw/source/uibase/wrtsh/wrtsh.ts` | `sw/source/uibase/wrtsh/wrtsh1.cxx` | Persistent cursor, undo orchestration, notification transactions, and command-shell facades |
| `sw/source/uibase/wrtsh/wrtsh-editing.ts` | `sw/source/uibase/wrtsh/wrtsh1.cxx` | Action-based text, range, paste, split, and join editing algorithms |
| `sw/source/uibase/wrtsh/wrtsh-hyperlink.ts` | `sw/source/core/edit/editsh.cxx` | Selection-aware hyperlink insertion, replacement, and removal actions |
| `sw/source/core/txtnode/ndtxt.ts` | `sw/source/core/txtnode/ndtxt.cxx` | Canonical text-node storage, item-set formatting/list mutation, hint-aware editing, and split/append |
| `sw/source/uibase/docvw/edtwin.ts` | `sw/source/uibase/docvw/edtwin.cxx` | DOM-neutral edit-window operations and DOM-coordinate-to-`SwPaM` ownership |
| `sw/browser/editor/browser-writer-edit-window.ts` | Browser-only | Single DOM adapter for selection, beforeinput, IME, pointer, clipboard, drag/drop, and focus |
| `sw/source/uibase/dochdl/swdtflvr.ts` | `sw/source/uibase/dochdl/swdtflvr.cxx` | Selection transfer-document preparation and format-writer dispatch |
| `sw/source/filter/html/htmlnumwriter.ts` | `sw/source/filter/html/htmlnumwriter.cxx` | Bounded nested semantic `ul`/`ol`/`li` clipboard HTML serialization |
| `sw/source/filter/ascii/ascatr.ts` | `sw/source/filter/ascii/ascatr.cxx` | Level-indented plain-text list-marker clipboard serialization |
| `sw/source/filter/xml/odt-filter-service.ts` | Browser-only | Asynchronous neutral snapshot/byte filter boundary |
| `sw/browser/filter/html/swhtml.ts` | Browser-only | DOM parsing adapter feeding neutral Writer HTML-filter records |
| `sw/browser/filter/xml/odt-worker-client.ts` | Browser-only | Transferable requests, cancellation, timeout, stale-result rejection, and worker lifecycle |
| `sw/browser/filter/xml/odt-worker-runtime.ts` | Browser-only | Dedicated Worker request dispatch, progress, and structured failures |
| `sw/browser/filter/xml/odt-worker.ts` | Browser-only | Vite module-worker entrypoint |
| `sw/source/filter/xml/xmlexp.ts` | `sw/source/filter/xml/xmlexp.cxx` | `SwDoc` to ODF styles/content/meta stream bridge |
| `sw/source/filter/xml/xmlimp.ts` | `sw/source/filter/xml/xmlimp.cxx` | ODF styles/content/meta stream to `SwDoc` bridge |
| `sw/source/filter/xml/wrtxml.ts` | `sw/source/filter/xml/wrtxml.cxx` | Styles-before-content ODT package writer orchestration |
| `sw/source/filter/xml/swxml.ts` | `sw/source/filter/xml/swxml.cxx` | Validated ODT package reader orchestration |
| `sw/source/uibase/app/docsh.ts` | `sw/source/uibase/app/docsh.cxx` | Active `SwDoc` ownership and atomic New, ODT Load, and ODT Save As bridge |
| `sw/browser/presentation/WriterMenuBar.tsx` | Browser-only | Generic React menu renderer and interaction state machine |
| `sw/uiconfig/swriter/menubar/menubar-commands.ts` | `sw/uiconfig/swriter/menubar/menubar.xml` | Declarative Writer menu order and list command definitions |
| `sw/uiconfig/swriter/toolbar/standardbar.ts` | `sw/uiconfig/swriter/toolbar/standardbar.xml` | Declarative standard-toolbar placement data |
| `sw/uiconfig/swriter/toolbar/textobjectbar.ts` | `sw/uiconfig/swriter/toolbar/textobjectbar.xml` | Text-object toolbar list command declaration |
| `sw/uiconfig/swriter/toolbar/numobjectbar.ts` | `sw/uiconfig/swriter/toolbar/numobjectbar.xml` | Numbering-toolbar Promote and Demote command declaration |

## Existing Writer view-module identities

| Local browser module | Pinned LibreOffice module | Responsibility |
| --- | --- | --- |
| `sw/source/uibase/uiview/view.ts` | `sw/source/uibase/uiview/view.cxx` | Persistent Writer view shell, frame, and command ownership |
| `sw/browser/presentation/writer-view.tsx` | Browser-only | React projection of the persistent `SwView` |
| `sw/source/uibase/uiview/viewfunc.ts` | `sw/source/uibase/uiview/viewfunc.hxx` | Pure focused-document, identity, formatting-command, and command-history helpers |
| `sw/source/uibase/uiview/viewstat.ts` | `sw/source/uibase/uiview/viewstat.cxx` | Browser view-status and visibility state |
| `sw/browser/presentation/WriterWorkspaceChrome.tsx` | Browser-only | Writer workspace chrome regions |
| `sw/source/uibase/docvw/edtwin.ts` | `sw/source/uibase/docvw/edtwin.cxx` | Persistent DOM-neutral Writer edit-window owner |
| `sw/browser/editor/browser-writer-edit-window.ts` | Browser-only | One browser implementation of the edit-window platform boundary |
| `sw/browser/editor/WriterPlainTextEditor.tsx` | Browser-only | Immutable React paragraph projection and stable controller binding |
| `sw/browser/editor/writer-selection.ts` | Browser-only | DOM selection and collapsed-caret mapping |
| `sw/browser/presentation/WriterFormattingToolbar.tsx` | Browser-only | Generic formatting-toolbar presenter |
| `sw/browser/presentation/WriterPropertiesPanel.tsx` | Browser-only | Binding-backed paragraph command panel plus immutable current-value projection |
