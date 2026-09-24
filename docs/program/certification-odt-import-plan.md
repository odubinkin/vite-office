# Certification ODT import plan

## Goal and evidence

Open the user-supplied `сертификация.odt` with its document structure and
formatting intact, without a flood of expected-feature console warnings. This is
an implementation plan, not a claim that the listed features already work.
The source file remains outside the repository; do not commit it or reproduce its
text in tests or logs.

A read-only ZIP/XML inventory of the supplied package found `content.xml`
(46,567 uncompressed bytes), `styles.xml` (27,368 bytes), `meta.xml`,
`settings.xml`, `manifest.rdf`, a thumbnail, and four embedded TTF entries under
`Fonts/`. `content.xml` contains 74 `text:p` elements, 66 `text:span`, 19
`text:a`, 8 `text:bookmark`, 9 `text:soft-page-break`, one `text:list`, and one
`table:table` with 5 `table:table-row` and 15 `table:table-cell` elements.
`styles.xml` contains 29 `style:style` definitions, 20 list-level property and
label-alignment pairs, and an embedded-font declaration. These are XML counts,
not a measured console-warning list or a claim that every occurrence is visible.

The current filter deliberately supports a bounded paragraph model. It warns
for unknown attributes in `xmloff/source/core/xmlimp.ts`, warns for known but
unhandled context attributes via `FastAttributeList.assertOnly`, and rejects
known unsupported child elements. The [current ODT contract](writer-odt-format.md)
explicitly says table cell paragraphs are lost. The phases below must first
measure the actual warning stream, then remove warnings by implementing or
explicitly classifying the underlying semantics. Changing logging alone does
not satisfy this plan.

## Architectural rule

Keep the pinned LibreOffice `libreoffice-26.8.0.2` ownership split:

| Concern | Local owner | Pinned upstream reference |
| --- | --- | --- |
| ZIP, manifest, package resources | `package/source/zipapi`, `package/source/manifest`, `sw/source/filter/xml` orchestration | `package/source`, `sw/source/filter/xml/xmlimp.cxx` |
| Namespace tokens and SAX contexts | `xmloff/source/core` | `xmloff/source/core/xmlimp.cxx` |
| Styles, lists, fonts, page layouts | `xmloff/source/style`, then Writer item/descriptor mapping | `xmloff/source/style/xmlstyle.cxx`, `sw/source/filter/xml/xmlimpit.cxx` |
| Paragraphs, inline content, tables | `xmloff/source/text` contexts into `SwDoc` | `xmloff/source/text/txtparai.cxx`, `sw/source/filter/xml/xmltexti.cxx` |
| Persistent structure and layout | `sw/source/core` canonical nodes and layout | `sw/source/core/docnode/ndtbl.cxx`, `sw/source/core/layout/tabfrm.cxx` |

Use the pinned checkout for behavior and test mapping; do not copy upstream
source into tracked files without the provenance review required by the
[baseline policy](libreoffice-baseline.md). Extend `SwDoc` and pooled items when
the feature is document state. Do not create an ODT-only shadow DOM, flatten
table cells into ordinary paragraphs, or let React become the canonical model.

Every new user-configurable capability is a vertical feature: import, canonical
model, rendering/editing, export, **and UI for changing the setting** ship in the
same task. Map the upstream command, menu/toolbar placement, dialog fields,
defaults, validation, keyboard behavior, and accessibility semantics to the
existing Writer command/dialog architecture. Use pinned
`sw/uiconfig/swriter/ui` resources as UI references; browser controls may differ
in implementation but must expose equivalent choices and effects. A parser-only
implementation does not complete a configurable feature. Metadata-only
declarations with no user-configurable document effect need no new dialog.

## Ordered implementation work

Each numbered phase should be a bounded AgentPlane task with its own tests and
parity evidence. Every phase that adds document behavior must include at least
one automated test opening a relevant ODT file from the pinned LibreOffice
upstream test corpus, alongside focused synthetic tests and UI tests. Later
phases depend on the earlier model and diagnostics work.

### 0. Reproduce and classify the import diagnostics

Add a local, privacy-safe diagnostic harness around the existing Worker/filter
entry point. Capture unique warning/error messages, XML stream and element path,
frequency, and whether content is lost, styling is lost, or the attribute is
pure metadata. Use the supplied ODT only in an untracked local acceptance run;
derive small synthetic ODT fixtures for committed tests. Record a baseline of
paragraph text, table cells, links, bookmarks, page breaks, page geometry, and
style metrics before changing the filter. This phase establishes exact targets;
the static inventory above alone cannot identify every runtime warning.

**Gate:** a reproducible, categorized warning inventory and semantic baseline
exist; the original file is still untracked and no document text enters logs.
Inventory upstream commands/dialogs and existing local controls for every
planned configurable feature in the same diagnostic matrix.

### 1. Recognize harmless declarations and common style attributes

Extend `xmloff/source/core/xmltoken.ts` and the owning contexts for attributes
actually encountered in the sample, starting with `style:default-outline-level`,
`style:class`, `style:font-family-generic`, `style:font-pitch`,
`style:font-charset`, `text:display-outline-level`, and the relevant `loext`
extensions. Add intentional ignore contexts for declarations that have no
document effect in this browser slice, such as unused theme colors or font
format metadata. Keep namespace matching exact, retain validation of values
that affect state, and document each ignored field and why it is safe for this
sample. `settings.xml` and RDF/thumbnail entries need package recognition,
not invented Writer content nodes.

**Gate:** mapped harmless declarations produce no repeated warnings; malformed
or unsupported semantic values still fail or remain explicit in diagnostics.
Any declaration found to change user-configurable document state moves to a
later vertical phase with UI; this metadata-only phase adds no controls.

### 2. Finish scalar paragraph, character, and page-style properties

Map the sample's unsupported style properties through
`xmloff/source/style/xmlstyle.ts`, `xmloff/source/text/txtparae.ts`, and pooled
Writer items. Prioritize `fo:keep-together`, `fo:break-before`/`break-after`,
widows/orphans, `style:auto-text-indent`, `style:master-page-name`,
`style:page-number`, and the observed underline/color/shading combinations.
Preserve named/automatic style inheritance and distinguish default values from
explicit overrides. For properties the current model already stores, fix the
context/token route instead of adding parallel fields. Measure text and page
layout effects after each group; defer properties with no meaningful browser
projection only with an explicit, tested classification.
Extend the existing `WriterParagraphDialog`, `WriterPageStyleDialog`, formatting
toolbar, and character controls for each newly editable property. Map upstream
Paragraph, Character, and Page Style dialog choices to local controls; imported
values must appear there, and edits must update canonical Writer items.

**Gate:** import and export/reimport preserve supported style semantics, and
focused tests cover representative inherited, direct, and invalid values.
UI tests must set and reopen each new property through its control or dialog.

### 3. Add inline structural markers

Handle `text:bookmark` as a named position in the canonical document, with
name validation and stable placement through edits and export. Handle
`text:soft-page-break` as an imported pagination hint rather than user text or a
hard page break. Preserve its position through Worker transfer and save/reopen;
render only when the page-layout engine can honor it. Confirm `text:a` and
`text:span` behavior for nesting present in the sample, including the visited
style metadata, before claiming link fidelity. Keep these in the
`xmloff/source/text` context and `SwDoc` hint/mark ownership path, following
upstream `txtparai.cxx` and Writer mark handling.
Provide Insert/Edit Bookmark and navigation controls corresponding to upstream
`insertbookmark.ui` and `bookmarkmenu.ui`. Provide the applicable break command
and dialog behavior following `insertbreak.ui`; keep an imported soft page break
distinct from a user-inserted hard break. Reuse the existing hyperlink dialog
for any link-editing extension.

**Gate:** all 8 bookmarks and the 6 soft page breaks in body paragraphs remain
at the same logical positions after import/export/reimport; links retain their
targets and displayed text. The 3 soft page breaks owned by the table are
verified with the canonical table graph in phase 5.
UI tests must create, navigate, rename, and remove bookmarks and exercise the
applicable break and hyperlink controls.

### 4. Complete fonts and page resources needed for visual fidelity

Resolve `svg:font-face-src`/`svg:font-face-uri` references against validated
package entries and the manifest. Add a bounded, revocable font-loading path
only if the browser is allowed to use the embedded TTFs; preserve fallback font
family and script-specific font identity when it cannot. Account for the
sample's page-layout, header/footer style declarations, and outline numbering
without inventing visible content. Use `XMLFontStylesContext` for declarations,
Writer pooled font items for document state, and the page descriptor/layout
path for geometry. Avoid loading a font merely to silence a parser warning.
Show imported font and page settings in the existing font selector and Page
Style dialog. Extend editable page settings using upstream page-format panels
and `pagestylespanel.ui` as references. Expose unavailable embedded fonts with
a deterministic fallback instead of silently showing another selected family.

**Gate:** chosen fonts, page dimensions/margins, and paragraph metrics are
stable across opening and reopening; fallback behavior is deterministic.
UI tests must inspect and change corresponding font/page controls.

### 5. Implement the canonical Writer table slice

The sample's single 5-row, 15-cell table is the largest structural gap.
Introduce `SwTable`/table-node equivalents in `sw/source/core` with ordered
rows, cells, cell paragraphs, column widths, and the observed row/cell styles.
Extend `xmloff/source/text` import contexts for `table:table`,
`table:table-column`, `table:table-row`, and `table:table-cell`. Map the observed
`style:table-properties`, `style:table-row-properties`,
`style:table-column-properties`, and `style:table-cell-properties` to canonical
layout values, including width, minimum row height, padding, border, and cell
vertical alignment. Extend browser layout, selection/editing, Worker transfer,
and ODT export from the same graph. Preserve the document order around the
table; do not append cell text to the surrounding body.
Add upstream-shaped Insert Table, Table Properties, and contextual table
controls. Start with row/column count, widths, minimum row height, cell
padding/borders, vertical alignment, and row selection. Map the Writer command
registry and dialog controller to `tableproperties.ui`, `tablecolumnpage.ui`,
and `tabletextflowpage.ui`; expose more upstream table settings as their model
support arrives.

**Gate:** the imported table has exactly 5 rows and 15 cells with ordered cell
content, visible boundaries and widths, usable selection, and a structural
export/reimport round trip. Its 3 soft page breaks retain their logical
table/cell positions after import/export/reimport. Existing paragraph/list tests remain green.
UI tests must insert a table, edit its properties, and verify those changes
after reopening.

### 6. Whole-document acceptance and compatibility closure

Run the complete local sample through Open, render, edit, Save As, and reopen.
Compare the semantic inventory from phase 0, document order, link/bookmark
targets, page breaks, list labels, page geometry, fonts/fallbacks, and table
layout. Separate harmless, deliberately ignored metadata from any remaining
unsupported semantics. Update [the ODT contract](writer-odt-format.md), the
parity matrix, and user-facing limitations to match verified behavior.
Inspect each imported setting in its dialog, change representative values
through the UI, save, and reopen.

**Gate:** the file opens without uncaught errors or repetitive expected-feature
console warnings; no text or table cells disappear; every remaining omission is
documented and has a targeted test or an explicit follow-up. A clean console by
itself is insufficient.

## Verification approach

- Keep the original ODT and its embedded fonts outside Git. Use minimized
  synthetic fixtures for edge cases **and** pinned upstream ODT files for
  feature-level regression tests.
- Add context-level tests for each new token/attribute and model-level tests for
  canonical state, malformed values, and import/export/reimport.
- Add UI tests for commands, dialogs, keyboard/accessibility behavior, and
  persistence of edits.
- Reuse the pattern in
  `scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts`: load the real
  upstream ODT bytes, assert specific canonical content and layout, export,
  reopen, and compare supported semantics. Extend the test's semantic
  projection when adding bookmarks, page breaks, fonts, or tables; paragraph
  text alone must not count as coverage for those features. Existing examples
  include `feature_text*.odt`, `tdf114287.odt`, `styles.odt`,
  `hyperlink.odt`, and list fixtures. Do not broadly suppress `console.warn`
  in the new cases; assert the allowed diagnostics explicitly.
- For every new upstream fixture, record the exact path and test case in the
  pinned checkout, the expected assertion, license/provenance review, parity ID,
  and reason for selecting it. Copy a fixture into the tracked QA tree only
  after the baseline provenance gate permits it. Pin checks to the baseline
  commit; do not rely on a developer's ignored `vendor/` checkout in CI.
- Preserve existing ZIP/XML size, depth, expansion, and path-traversal limits.
- Run the local sample acceptance check after each phase and record warning
  counts plus semantic deltas; do not merge a phase whose warnings fall only
  because logs were suppressed.

### Upstream ODT coverage to add by phase

The filenames below are candidate source-backed fixtures in the pinned
LibreOffice checkout, not a claim that the current importer can open them.
Select the smallest fixture that exercises the implemented slice, inspect its
actual XML and upstream assertions, and document any unrelated features before
copying it into the tracked QA tree. An unsuitable candidate must be replaced
with another upstream ODT, not with a synthetic-only test.

| Phase | Upstream ODT coverage and source test | Required local assertion |
| --- | --- | --- |
| 0: baseline | Existing `sw/qa/extras/odfimport/data/feature_text.odt`, `sw/qa/extras/odfimport/data/feature_text_bold.odt`, and `sw/qa/extras/odfimport/data/feature_text_italic.odt` in `odffeatures.cxx`; existing list, style, and hyperlink fixtures in `odt-upstream-fixtures.test.ts` | Keep the existing import/export/reimport tests running and record current diagnostics for each file. |
| 1: declarations | Reuse `sw/qa/uitest/data/styles.odt` from `styleInspector.py`, plus an upstream ODT that actually contains the targeted `loext` or font declaration after XML inspection | Assert that the declaration is recognized or intentionally ignored without changing canonical semantics; reject invalid semantic values. |
| 2: scalar properties | Existing `sw/qa/extras/odfexport/data/tdf114287.odt` from `odfexport4.cxx`, and `styles.odt` | Assert paragraph print bounds, inherited/direct style properties, and the values shown in Paragraph/Page Style controls after opening. Add another upstream ODT if these do not contain a newly supported property. |
| 3: inline markers | `sw/qa/extras/uiwriter/data/collapsed_bookmark.odt` from `uiwriter4.cxx`; existing `sw/qa/extras/tiledrendering/data/hyperlink.odt` from `tiledrendering.cxx`; `sw/qa/extras/odfimport/data/tdf94882.odt` from `odfimport.cxx` (contains `text:soft-page-break`) | Assert bookmark positions and edit stability, hyperlink ranges/targets, and soft page-break positions through export/reimport. Confirm the relevant UI opens on imported values. |
| 4: fonts and pages | `sw/qa/extras/embedded_fonts/data/embed-unrestricted1.odt` and `embedded-font-props.odt` from `embedded_fonts.cxx`; `tdf114287.odt` for page geometry | Assert font-face resolution or deterministic fallback, page descriptor values, rendered metrics, and font/Page Style control state after opening and reopening. |
| 5: tables | `sw/qa/extras/odfimport/data/tdf41542_borderlessPadding.odt` from `odfimport.cxx`; `sw/qa/extras/indexing/data/IndexingExport_Tables.odt` from `IndexingExportTest.cxx` | Assert ordered row/cell paragraphs, cell padding/borders, layout, editing, and structural export/reimport. Add an upstream fixture for any supported table property absent from these files. |
| 6: closure | A representative upstream ODT from each prior phase, run together with the private local certification sample | Assert no loss of supported semantics and no unexpected warnings across the fixture matrix, the UI workflow, and repeated save/reopen. |

Each phase's verification record must name the upstream ODT test command and
result. UI tests remain separate because opening an ODT does not prove that its
settings can be changed through the interface.
