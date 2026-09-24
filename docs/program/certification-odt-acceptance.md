# Certification ODT acceptance, phase 6

## Reproducible matrix

The pinned LibreOffice source is `9bc445578031fecf56086729d8e4940c77e14d65`
(`libreoffice-26.8.0.2`). The tracked suite opens real ODT bytes, asserts the
supported canonical semantics, exports and reimports them. `npm run verify`
passed after phase 6, including the app and inventory suites and Chromium e2e.

| Phase | Source-backed ODT and local check | Verified slice |
| --- | --- | --- |
| 0–1 | `feature_text.odt`, its bold/italic variants, and `styles.odt` in `scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts` | Paragraph runs, declaration diagnostics and structural roundtrip |
| 2 | `tdf114287.odt` and `styles.odt` in the same suite and `odt-layout-parity.test.ts` | Paragraph metrics, inheritance and page geometry |
| 3 | `collapsed_bookmark.odt`, `tdf94882.odt` and `hyperlink.odt` in the same suite | Inline mark, soft break and link positions |
| 4 | `embed-unrestricted1.odt` and `embedded-font-props.odt` in `odt-embedded-fonts.test.ts` | Embedded-font resolution/fallback and package roundtrip |
| 5–6 | `tdf132642_keepWithNextTable.odt` in `odt-table-roundtrip.test.ts` and `odt-filter-service.test.ts` | Table rows/cells, geometry, structural roundtrip and browser warning summary |
| 6 UI | Synthetic ODT in `apps/office/e2e/writer-odt-file.spec.ts` | Keyboard typing in a cell, Export, Open, and retained cell content |

The pinned table fixture replaces the plan's two candidates for the reasons
recorded in [table parity](certification-odt-table-parity.md). It tests only the
bounded table structure; the upstream two-page row-splitting assertion remains
outside the browser layout model.

## Authorized private-file acceptance

The supplied file was read only for local acceptance. Neither it nor a test
scenario containing its path or content is tracked. A fresh Chromium session
opened it without an uncaught application error and displayed one table with
five rows, fifteen cells and five browser pages. Keyboard entry into its first
cell and a Table Properties vertical-alignment change were exported to an ODT,
opened in another Chromium session and saved again. The second exported package
was byte-for-byte identical to the first.

A private, ignored comparison script loaded the source and first saved copy
through `readOdtDocument`. It compared the supported semantic projection in
memory and printed only counts and booleans. All 59 body paragraphs and their
formatted runs, the other fourteen cells, eight bookmarks, eight paragraph/cell
soft-break positions, the table-owned break before row three, and page descriptor
matched. The edited first cell and changed vertical alignment were present. The
body retained fourteen link runs. Embedded font availability and page metrics
were already checked in [phase 4](certification-odt-font-page-parity.md). No
private text, URL, bookmark name or font bytes entered tracked output.

The initial source produced 260 structured diagnostics in 119 groups, down from
490 occurrences and 184 groups in [phase 0](certification-odt-diagnostic-baseline.md).
They contain 214 unknown-attribute occurrences, 40 known-but-unsupported
attribute occurrences and six unknown-element occurrences. The browser now
shows one aggregate warning for these on Open, while the structural diagnostic
callback retains every occurrence and XML path. No table-element diagnostic
remains for this sample. The ordinary console's missing `favicon.ico` response
in the development server is unrelated to ODT import.

## Remaining compatibility work

The remaining 260 diagnostics do not represent lost body text or table cells.
They do indicate declarations that are not mapped to all of LibreOffice's
behavior. Of these, 217 occurrences concern styling: script-specific font
sizes and family variants, outline/list geometry, opacity, graphic properties,
line-breaking and other properties. Thirty-eight of the 43 previously
unclassified occurrences concern list/outline label formatting and require a
separate vertical feature before visual parity can be claimed. The other five
are `text:use-soft-page-breaks` (logical breaks are imported) and note
configuration attributes; this sample has no `text:note` element. They have no
additional visible effect in this document. Unknown semantic values still raise
errors or remain in the detailed diagnostics; the one-line console summary is
only a presentation change.

Follow-up scope is explicit: add script-specific character metrics and full
list/outline label properties with Writer controls, then extend table row
pagination, merged/nested cells, table keep-with-next, cursor navigation and
undo. Add source-backed tests for each property before removing its diagnostic.
Current browser page count and detailed formatting are bounded compatibility
results, not a claim of LibreOffice visual parity.
