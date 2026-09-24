# Certification ODT inline marker parity

This records phase 3 of the [import plan](certification-odt-import-plan.md).
The private certification document is read only in ignored local diagnostics and is
not a tracked test fixture.

## Upstream ownership

The pinned LibreOffice commit is `9bc445578031fecf56086729d8e4940c77e14d65`.
`xmloff/source/text/txtparai.cxx` owns the streaming inline contexts;
`sw/source/core/doc/docbm.cxx` owns document marks and their registered
positions; `sw/source/core/bastyp/index.cxx` adjusts positions through edits.
The local code follows those boundaries. Soft page breaks are zero-width
imported hints on registered positions. The browser emits no visible soft break
until its page layout can honor the hint. The Insert → More Breaks → Manual
Break command creates a separate hard page break on a Writer paragraph item.

The supported bookmark shape is a named collapsed position, including the
`text:bookmark-start`/`text:bookmark-end` pair when both have the same offset.
An actual ranged bookmark fails explicitly; a range cannot be flattened to a
point. `text:a` nested with `text:span` retains its visited style name and link
target through the existing `RES_TXTATR_INETFMT` item.

## New upstream fixture provenance

The two copied files below are byte-for-byte identical to the pinned
`LibreOffice/core` tree. The adjacent upstream test source headers identify
LibreOffice project material under MPL 2.0; the ODT packages contain Writer
XML, configuration entries and generated thumbnails with no separate notice
found in their package entries. They are retained solely as attributed QA
inputs. `COPYING.MPL` at the pinned root supplies the license text.

| Pinned path and blob | Tracked path and SHA-256 | Source test, assertion and selection reason |
| --- | --- | --- |
| `sw/qa/extras/uiwriter/data/collapsed_bookmark.odt`, `66cc65dd18633067c5803d8c60884729dd042440` | `apps/office/src/sw/qa/extras/uiwriter/data/collapsed_bookmark.odt`, `56f981b9fcf2dc656e07688f732af08028c24e224fa1e98c11328ea87be2a5ec` | `sw/qa/extras/uiwriter/uiwriter4.cxx::testBookmarkCollapsed` checks that a collapsed start/end pair exports as a point bookmark. The local `odt-upstream-fixtures.test.ts` checks its name and offset through reimport. |
| `sw/qa/extras/odfimport/data/tdf94882.odt`, `2aacb9836da2dd286ff2a234d04cbe56e921e024` | `apps/office/src/sw/qa/extras/odfimport/data/tdf94882.odt`, `c8330da0f5684c15c7fe38433c16410204c31dc0a2c06c1a12093bb61305d8ce` | `sw/qa/extras/odfimport/odfimport.cxx::testTdf94882` opens the page-style sample. Its paragraph contains one soft page break at offset zero, which the local test checks through reimport. |

Both source tests are under MPL 2.0 headers. These QA packages contain many
unrelated page, font and layout declarations, so the local test records their
existing diagnostic counts and rejects diagnostics for the bookmark/soft-break
elements. The already tracked `sw/qa/extras/tiledrendering/data/hyperlink.odt`
continues to cover hyperlink ranges and target metadata.

## Private acceptance checkpoint

The authorized local run changed from 393 warning occurrences in 160 groups
after phase 2 to 371 occurrences in 156 groups after inline marker import.
Paragraph and link projections remain 59 and 14. Eight body bookmarks and six
body soft page breaks retain their exact paragraph/UTF-16 offsets through ODT
export/reimport. The original XML has nine soft page breaks: six in body
paragraphs and three inside the table structure (one on `table:table`, two in
cells). The three table positions require the canonical table graph in phase 5;
they cannot be represented as body paragraph hints without losing document
order and table ownership.
