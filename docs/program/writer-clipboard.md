# Browser Writer clipboard copy

The bounded browser Writer workbench implements **Copy** at both pinned Writer
locations: **Edit → Copy** and the standard toolbar. The command reads the
browser's current native selection and writes visible paragraph text with no
server, account, or network request. Accessibility-only descriptions are never
serialized into either clipboard representation.

Both the Writer **Copy** command and native **Ctrl/Cmd+C** are covered. The
document body intercepts the browser's `copy` event and writes the same
sanitized `text/plain` and `text/html` pair, so browser-native selection cannot
leak the invisible `Paragraph style: …` screen-reader description into another
editor.

## Document selection and caret continuity

**Edit → Select All** and native **Ctrl/Cmd+A** select the complete bounded
Writer document. Individual editable paragraphs retain reliable browser text
entry: Enter creates and focuses the following paragraph, and immutable React
updates restore the current typing caret rather than moving it to the line
start. Backspace and Delete paragraph joins restore the caret at their join
boundary. Arrow Left/Up at a paragraph start and Arrow Right/Down at its end
continue into an adjacent rendered paragraph.

Mouse dragging from one paragraph into another selects the full crossed
paragraph interval in either direction. This intentionally uses paragraph
boundaries once a drag crosses separate browser editing hosts, while native
selection remains responsible for partial text selection inside one paragraph.

The Writer selection adapter emits paired `text/plain` and `text/html` values.
The rich HTML uses portable inline styles for the bounded model's paragraph
alignment plus Default Paragraph Style or Heading 1 sizing, weight, and line
height. [`copyRichText`](../../apps/office/src/vcl/browser/browser-clipboard.ts)
prefers `navigator.clipboard.write` with `ClipboardItem`; another rich-text
editor can therefore retain the currently implemented paragraph formatting.
When that API is absent or rejects the write, `copyPlainText` uses
`navigator.clipboard.writeText`, then a temporary off-screen textarea and local
`document.execCommand("copy")` fallback. The temporary element is immediately
removed; if all mechanisms fail, the Writer status row reports that copying
failed.

Copy does not alter the immutable Writer document, transaction history,
properties, or browser-local snapshot. A missing selection reports **Select
text to copy.** rather than serializing the whole document implicitly.

The pinned LibreOffice `sw/uiconfig/swriter/menubar/menubar.xml` declares
`.uno:Copy` in **Edit**, and `sw/uiconfig/swriter/toolbar/standardbar.xml`
declares the same command in the standard toolbar. This browser slice maps the
placement and bounded browser behavior only. Rich copy covers just the
implemented paragraph-level styles; Cut, Paste, Paste Special, inline character
formatting, objects, tables, tracked changes, and full LibreOffice transfer
semantics remain separate feature tasks.
