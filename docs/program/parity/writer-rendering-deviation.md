# Writer rendering deviation from LibreOffice

Status: open, recorded at task `202609250842-2ZV4Z6` on 2026-09-25. The implemented rendering work is retained, while exact LibreOffice visual parity is not claimed.

## Reproduction

- Open the user-supplied `сертификация.odt` in the installed LibreOffice GUI and in Vite Office Writer.
- Compare the first physical page at the same document zoom, then compare page count and text wrapping.
- The observed LibreOffice GUI page 1 ends at the `Dell Technologies Info Hub` link. Vite Office page 1 continues through the following DelfiN and EQTY paragraphs. The observed GUI view has nine pages; the browser view has six.
- The installed LibreOffice GUI and its headless PDF export paginate this document differently. The GUI view is the reference for this observation.

## Current implementation and remaining cause

The browser now lays out supported table rows at document width, flows them between pages, and suppresses editor selection and controls in print. ODF embedded font style and weight metadata survive import/export. The 127 runtime TTF/OTF files shipped by the locally installed LibreOffice application are copied to `apps/office/public/fonts/truetype` and registered for browser rendering.

The document requests `Overpass Light`, which is absent from the ODT package, the pinned LibreOffice source tree, and the installed LibreOffice runtime font directory. Vite Office currently uses the ODF generic family as a browser fallback. This does not reproduce the physical-font search and attribute scoring in `vcl/source/font/PhysicalFontCollection.cxx` (`FindFontFamily`), `vcl/source/font/PhysicalFontFamily.cxx` (`CalcType`), and macOS CoreText font enumeration in `vcl/quartz/SystemFontList.cxx`. Browser text metrics and the page-flow calculation have not been isolated from that font difference. The first-page boundary remains a known deviation in `runtime-inventory.json` for `writer-font-family.ts` and `newfrm.ts`.

## Verification boundary

Focused model, ODT round-trip, table-flow, and browser print tests cover the changes. They verify those features, not a pixel-identical first page. A future parity claim requires a GUI-derived font selection oracle and a visual regression check against the supplied document, including first-page content boundary and paragraph wraps.
