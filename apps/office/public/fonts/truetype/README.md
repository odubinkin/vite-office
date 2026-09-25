# LibreOffice runtime fonts

The 127 TTF and OTF files in this directory were copied from the locally installed LibreOffice
application at `Contents/Resources/fonts/truetype` on 2026-09-25. They are runtime fonts, not test
fixtures. Their location mirrors LibreOffice's `$(LIBO_SHARE_FOLDER)/fonts/truetype` destination in
`vendor/libreoffice-reference/external/more_fonts/ExternalPackage_*.mk`. The application registers
them in `apps/office/src/vcl/browser/lo-runtime-fonts.css` so document fonts are available to the
browser as well.

The upstream source tree contains package recipes and download declarations, rather than these font
binaries. LibreOffice's bundled license document lists the individual font licenses in
`vendor/libreoffice-reference/readlicense_oo/license/license.xml`.
