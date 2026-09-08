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
| `apps/office/src/vcl/browser` | `vcl` | Browser-only clipboard, download, IndexedDB, and styling adapters |
| `apps/office/src/xmloff/source/text` | `xmloff/source/text` | Writer-neutral ODF paragraph, automatic-style, and significant-whitespace conversion |
| `apps/office/src/sw/inc` | `sw/inc` | Pinned numeric Writer WhichIds and bounded item ranges |
| `apps/office/src/sw/source/core/attr` | `sw/source/core/attr` | Writer attribute pool/set specialization and format inheritance |
| `apps/office/src/sw/source/core/doc` | `sw/source/core/doc` | `SwDoc` ownership, style collections, numbering rules, content operations, Writer command façade, and snapshot conversion |
| `apps/office/src/sw/source/core/docnode` | `sw/source/core/docnode` | Ordered `SwNodes` storage, fixed section sentinels, and node types |
| `apps/office/src/sw/source/core/para` | `sw/source/core/para` | Writer paragraph pool items, currently `SwNumRuleItem` |
| `apps/office/src/sw/source/core/txtnode` | `sw/source/core/txtnode` | `SwTextNode` text storage and `SwpHints`/`SwTextAttr` character attributes |
| `apps/office/src/sw/source/core/crsr` | `sw/source/core/crsr` | `SwNodeIndex`, `SwPosition`, and directional `SwPaM` model ranges |
| `apps/office/src/sw/source/uibase/docvw` | `sw/source/uibase/docvw` | Document-page editor and editable paragraphs |
| `apps/office/src/sw/source/uibase/wrtsh` | `sw/source/uibase/wrtsh` | Writer selection shell and browser DOM caret bridge |
| `apps/office/src/sw/source/uibase/dochdl` | `sw/source/uibase/dochdl` | Selection transfer-document preparation and clipboard ownership |
| `apps/office/src/sw/source/filter/html` | `sw/source/filter/html` | Writer HTML transfer serialization |
| `apps/office/src/sw/source/filter/ascii` | `sw/source/filter/ascii` | Writer plain-text transfer serialization |
| `apps/office/src/sw/source/filter/xml` | `sw/source/filter/xml` | ODF package orchestration and `SwDoc` XML import/export bridges |
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
| `sw/source/core/doc/writer.ts` | `sw/source/core/doc/docnew.cxx` | Browser command façade around the `SwDoc` graph rather than only document construction |
| `sw/source/uibase/docvw/edtwin-paragraph.tsx` | `sw/source/uibase/docvw/edtwin.cxx` | React paragraph decomposition beneath the one editor boundary |
| `sw/uiconfig/swriter/menubar/menubar-commands.ts` | `sw/uiconfig/swriter/menubar/menubar.xml` | Typed command declaration extracted from XML configuration |
| `sw/uiconfig/swriter/menubar/format-menu.tsx` | `sw/uiconfig/swriter/menubar/menubar.xml` | React Format-popup decomposition of the same menu hierarchy |
| `vcl/browser/browser-clipboard.ts` | `vcl/source/app/ClipboardBase.cxx` | Explicit static-browser clipboard platform adapter |

## File-level provenance in active Writer list, character-formatting, clipboard, and model slices

| Local browser module | Pinned LibreOffice source/configuration module | Responsibility |
| --- | --- | --- |
| `editeng/source/items/paraitem.ts` | `editeng/source/items/paraitem.cxx` | `SvxAdjustItem` paragraph-alignment value |
| `editeng/source/items/textitem.ts` | `editeng/source/items/textitem.cxx` | `SvxWeightItem`, `SvxPostureItem`, and `SvxUnderlineItem` character values |
| `svl/source/items/poolitem.ts` | `svl/source/items/poolitem.cxx` | Base and primitive pooled item values |
| `svl/source/items/itempool.ts` | `svl/source/items/itempool.cxx` | Pool defaults and persisted-item factories |
| `svl/source/items/itemset.ts` | `svl/source/items/itemset.cxx` | Direct item deltas, parent/default lookup, state, clone, and clear operations |
| `package/source/zipapi/CRC32.ts` | `package/source/zipapi/CRC32.cxx` | Incremental ZIP CRC-32 calculation |
| `package/source/zipapi/ZipFile.ts` | `package/source/zipapi/ZipFile.cxx` | Central/local ZIP32 validation, resource ceilings, and STORE/DEFLATE input |
| `package/source/zipapi/ZipOutputStream.ts` | `package/source/zipapi/ZipOutputStream.cxx` | Deterministic unencrypted STORE package output |
| `package/source/manifest/ManifestExport.ts` | `package/source/manifest/ManifestExport.cxx` | ODF 1.3 manifest stream |
| `xmloff/source/text/txtparae.ts` | `xmloff/source/text/txtparae.cxx` | Neutral ODF paragraph and inline export |
| `xmloff/source/text/txtparai.ts` | `xmloff/source/text/txtparai.cxx` | Neutral ODF paragraph and inline import |
| `sw/inc/hintids.ts` | `sw/inc/hintids.hxx` | Numeric WhichIds and bounded Writer ranges |
| `sw/source/core/attr/swatrset.ts` | `sw/source/core/attr/swatrset.cxx` | Document-owned `SwAttrPool` and Writer-specialized `SwAttrSet` |
| `sw/source/core/attr/format.ts` | `sw/source/core/attr/format.cxx` | `SwFormat` attributes and derived-from links |
| `sw/source/core/doc/fmtcol.ts` | `sw/source/core/doc/fmtcol.cxx` | Named `SwFormatColl` and paragraph `SwTextFormatColl` |
| `sw/source/core/para/paratr.ts` | `sw/source/core/para/paratr.cxx` | Paragraph `SwNumRuleItem` rule-name value |
| `sw/source/core/doc/list.ts` | `sw/source/core/doc/list.cxx` | Serializable list metadata and legacy normalization |
| `sw/source/core/doc/number.ts` | `sw/source/core/doc/number.cxx` | Deterministic visible bullet and numbering marker calculation |
| `sw/source/core/doc/doc.ts` | `sw/source/core/doc/doc.cxx` | `SwDoc` owner of `SwNodes` plus explicit browser snapshot conversion |
| `sw/source/core/docnode/nodes.ts` | `sw/source/core/docnode/nodes.cxx` | Ordered nodes and LibreOffice-matching fixed section sentinels |
| `sw/source/core/crsr/pam.ts` | `sw/source/core/crsr/pam.cxx` | Model positions and directional point/mark ranges |
| `sw/source/core/txtnode/ndhints.ts` | `sw/source/core/txtnode/ndhints.cxx` | Start-sorted item-set-backed text attribute hints and derived browser runs |
| `sw/source/core/txtnode/txatbase.ts` | `sw/source/core/txtnode/txatbase.cxx` | `SwTextAttr` ranges and `SfxItemSet`-backed `SwFormatAutoFormat` items |
| `sw/source/core/doc/DocumentContentOperationsManager.ts` | `sw/source/core/doc/DocumentContentOperationsManager.cxx` | Bounded same-text-node Insert, Delete, and Replace operations through `SwPaM` |
| `sw/source/uibase/shells/txtnum.ts` | `sw/source/uibase/shells/txtnum.cxx` | Default bullet, default numbering, and remove-bullets command transition |
| `sw/source/uibase/shells/listsh.ts` | `sw/source/uibase/shells/listsh.cxx` | Active-list Promote and Demote level transition |
| `sw/source/uibase/shells/textsh.ts` | `sw/source/uibase/shells/textsh.cxx` | Browser-owned Cut, Copy, Paste, download, and Undo/Redo command shell |
| `sw/source/core/txtnode/ndtxt.ts` | `sw/source/core/txtnode/ndtxt.cxx` | Canonical text-node storage, hint-aware editing, split/append, and derived rendering runs |
| `sw/source/uibase/shells/txtattr.ts` | `sw/source/uibase/shells/txtattr.cxx` | Bold, Italic, and single Underline command transition |
| `sw/source/uibase/docvw/edtwin.tsx` | `sw/source/uibase/docvw/edtwin.cxx` | Browser document-view integration for markers and editing hosts |
| `sw/source/uibase/dochdl/swdtflvr.ts` | `sw/source/uibase/dochdl/swdtflvr.cxx` | Selection transfer-document preparation and format-writer dispatch |
| `sw/source/filter/html/htmlnumwriter.ts` | `sw/source/filter/html/htmlnumwriter.cxx` | Bounded nested semantic `ul`/`ol`/`li` clipboard HTML serialization |
| `sw/source/filter/ascii/ascatr.ts` | `sw/source/filter/ascii/ascatr.cxx` | Level-indented plain-text list-marker clipboard serialization |
| `sw/source/filter/xml/xmlexp.ts` | `sw/source/filter/xml/xmlexp.cxx` | `SwDoc` to ODF styles/content/meta stream bridge |
| `sw/source/filter/xml/xmlimp.ts` | `sw/source/filter/xml/xmlimp.cxx` | ODF styles/content/meta stream to `SwDoc` bridge |
| `sw/source/filter/xml/wrtxml.ts` | `sw/source/filter/xml/wrtxml.cxx` | Styles-before-content ODT package writer orchestration |
| `sw/source/filter/xml/swxml.ts` | `sw/source/filter/xml/swxml.cxx` | Validated ODT package reader orchestration |
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
