# Writer Hyperlinks

Writer supports text hyperlinks as ranged `RES_TXTATR_INETFMT` attributes. A link retains its URL,
optional name, target frame, unvisited style name, and visited style name independently from direct
character formatting. Formatting, insertion, split, copy, undo, snapshot restoration, and ODT
round trips preserve the hyperlink range.

Use **Insert → Hyperlink…**, the Hyperlink button on the standard toolbar, or `Ctrl+K`/`Cmd+K`.
When text is selected, the dialog links that range. At a collapsed caret, the dialog inserts its Text
value or the URL when Text is empty. **Edit → Edit Hyperlink…** changes the complete contiguous
link containing the caret, and **Edit → Remove Hyperlink** removes only its hyperlink metadata.
Links remain semantic anchors in the editable projection, but clicks do not navigate away while the
document is being edited.

ODT import accepts `text:a` with `xlink:href`, `office:name`, `office:target-frame-name`,
`xlink:show`, `text:style-name`, and `text:visited-style-name`. Supported nested inline formatting and
character controls remain inside the link. An empty or missing `xlink:href` imports its content as
plain text. Export groups adjacent portions with identical hyperlink metadata and emits one `text:a`
around their text and formatting spans.

## Upstream fixture provenance

The executable import/export tests use byte-for-byte copies from the pinned LibreOffice
`libreoffice-26.8.0.2` baseline at commit `9bc445578031fecf56086729d8e4940c77e14d65`:

- `sw/qa/extras/tiledrendering/data/hyperlink.odt` →
  `apps/office/src/sw/qa/extras/tiledrendering/data/hyperlink.odt`, SHA-256
  `bb7e0817a28327981df3569f8b8a6fb5d0f365c78684c32ed4cea735be28f8a5`.
- `sw/qa/extras/ooxmlexport/data/151384Hyperlink.odt` →
  `apps/office/src/sw/qa/extras/ooxmlexport/data/151384Hyperlink.odt`, SHA-256
  `9af7a47bc25ab21bc357cdfb29f54a3d610b67277bd70fa966c56d0cfb700eb3`.

The first fixture covers a normal text hyperlink. The second covers a hyperlink containing a nested
formatted `text:span`. Local round-trip tests reopen the generated ODT and compare the resulting
Writer runs, while Chromium verifies creation, editing, removal, Undo, export, and reopening through
the real browser file boundaries.

## Current scope

This slice implements text hyperlinks. Native LibreOffice features such as hyperlink macro events,
visited-state mutation, Ctrl-click navigation policy, image-map links, and links on drawing objects
remain outside the bounded text-link capability.
