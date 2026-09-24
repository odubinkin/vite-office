# Certification ODT font and page resource parity

This records phase 4 of the [import plan](certification-odt-import-plan.md).
The private certification document is used only for ignored local acceptance
checks and is not a tracked fixture.

## Pinned ownership and browser boundary

The pinned LibreOffice commit is `9bc445578031fecf56086729d8e4940c77e14d65`.
`xmloff/source/style/XMLFontStylesContext.cxx` owns font face, source, URI and
format contexts. `sw/source/filter/xml/swxml.cxx` resolves package resources;
`sw/source/filter/xml/xmlfonte.cxx` and `xmloff/source/style/XMLFontAutoStylePool.cxx`
emit font declarations. `package/source/manifest/ManifestExport.cxx` owns
manifest entries. The browser adaptation under `vcl/browser` uses the FontFace
API in place of `vcl/source/gdi/embeddedfontsmanager.cxx`, and revokes each
loaded face when its document leaves the view. ODF Latin, Asian and complex
font face names remain distinct in the corresponding Writer `SvxFontItem`
slots during import and export.

The importer accepts only manifest-declared `Fonts/` entries. It bounds each
font to 4 MiB and all fonts to 16 MiB, checks OpenType table bounds and the
OS/2 restricted-license bit, and retains bytes and family identity even when
browser loading is forbidden or unavailable. The toolbar keeps the selected
family and announces the Liberation Serif fallback when the embedded face is
unavailable. The page descriptor remains the canonical geometry owner; the
existing Page Style dialog edits it and ODT export retains it.

## Upstream QA inputs

Both copied packages are byte-for-byte identical to the pinned LibreOffice
tree. `sw/qa/extras/embedded_fonts/embedded_fonts.cxx` carries the MPL 2.0
header and `COPYING.MPL` at the pinned root supplies the license text. No
separate notice was found inside these QA ZIP packages.

| Pinned source path and blob | Tracked path and SHA-256 | Check |
| --- | --- | --- |
| `sw/qa/extras/embedded_fonts/data/embed-unrestricted1.odt`, `168d10051048971c4164e42054e6869d2594dfec` | `apps/office/src/sw/qa/extras/embedded_fonts/data/embed-unrestricted1.odt`, `dba6839437ce7e30f58786af2f53652ae7e247684224a2e7d70be4ba149003d5` | `testTdf167849` opens the Manbow Solid package face; local tests assert the 26,932-byte resource, Worker transfer, export/reimport, manifest and fallback limits. |
| `sw/qa/extras/embedded_fonts/data/embedded-font-props.odt`, `c191223424bf4bb99c689006618c4e7c63144c87` | `apps/office/src/sw/qa/extras/embedded_fonts/data/embedded-font-props.odt`, `97a91802bd3e685af83739146746b42313c907fcddccf3a7c5edcb6b1af1d0c6` | `testEmbeddedFontProps` has font declarations without package bytes; local tests assert that no embedded font is fabricated and that its page descriptor can be edited and reopened. |

The already tracked `sw/qa/extras/odfexport/data/tdf114287.odt` continues to
check distinct paragraph print widths and page geometry in
`odt-layout-parity.test.ts` and `scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts`.

## Private acceptance checkpoint

The authorized local file declares four Linux Libertine G TTFs in its manifest;
all four have unrestricted OpenType `fsType=0`. Import, canonical transfer and
export/reimport each retain four byte-identical resources. The imported and
reopened page descriptor is A4 portrait, 11,906 × 16,838 twips, with 1,417
twips on every margin. Both runs retain 59 body paragraphs, 14 link runs and
the same Latin, Asian and complex font families on every named style, and
the same left margins (`0, 600, 720, 1440`), right margins (`0, 600`), first
line indents (`-360, 0, 720`) and print widths (`7631, 7871, 8351, 8711,
9071`). Structural warnings fall from 371 occurrences in 156 groups after
phase 3 to 327 occurrences in 142 groups.

The document has one header style, one footer style and ten outline levels,
but zero header/footer content nodes and zero heading elements. These style
declarations therefore create no visible header, footer or heading numbering
in this document. The remaining related diagnostics stay explicit; no content
or page geometry is fabricated from unused declarations.
