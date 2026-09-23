# Browser Writer clipboard

The bounded browser Writer workbench implements **Cut**, **Copy**, and **Paste**
at their pinned Writer locations: **Edit** and the standard toolbar. The commands
use only browser clipboard APIs; they do not require a server, account, or network
request. Accessibility-only descriptions are never serialized into either clipboard
representation.

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
alignment and representative built-in paragraph-style presentation. It also
retains implemented direct character formatting as semantic `strong`, `em`,
single-underline spans, font-family spans, and sanitized foreground/highlight
styles, including a selected
partial span whose shared semantic ancestor would otherwise be lost by browser
range cloning. Selected hyperlinks retain their destinations in rich HTML. The
browser reader imports `http`, `https`, `mailto`, and relative destinations and
discards script and data URL destinations.
[`copyRichText`](../../apps/office/src/vcl/browser/browser-clipboard.ts)
prefers `navigator.clipboard.write` with `ClipboardItem`; another rich-text
editor can therefore retain the currently implemented paragraph formatting.
When that API is absent or rejects the write, `copyPlainText` uses
`navigator.clipboard.writeText`, then a temporary off-screen textarea and local
`document.execCommand("copy")` fallback. The temporary element is immediately
removed; if all mechanisms fail, the Writer status row reports that copying
failed.

When a selection contains complete adjacent list paragraphs, Writer prepares a
transfer document in
[`swdtflvr.ts`](../../apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts), then
the matching format writers serialize it. The HTML writer
[`htmlnumwriter.ts`](../../apps/office/src/sw/source/filter/html/htmlnumwriter.ts)
emits semantic nested `ul`/`ol`/`li` markup, including an `ol start` value for
a selected numbered-list suffix. The ASCII writer
[`ascatr.ts`](../../apps/office/src/sw/source/filter/ascii/ascatr.ts) emits four
spaces per list level, including the root level, followed by a visible marker
for a multi-item list transfer. Complete contiguous list fragments support
levels zero through nine. The first selected list item is re-rooted for a valid
clipboard fragment; a malformed upward level jump is limited to one nested
level, avoiding synthetic empty list items. A single or partial list item copies
only its selected text, preventing a fragment from being falsely promoted to a
complete list. Neither path serializes screen-reader descriptions nor the
marker-only DOM sibling.

`SwTransferable` owns the supported Copy, Cut, format preference, and Paste
target policy, following `SwTransferable::Copy`, `Cut`, and `Paste` in the pinned
`swdtflvr.cxx`. Copy leaves the live document and undo history untouched. A
missing selection reports **Select text to copy.** Cut writes the MIME pair
before deleting the canonical range; a rejected write leaves the document
untouched. Paste replaces a ranged selection or inserts at a collapsed Writer
caret as one undoable action. Native Paste reads its `ClipboardEvent`
synchronously; menu and toolbar Paste use a user-initiated
`navigator.clipboard.read` request, with `readText` fallback.

| Entry point | Browser operation | Writer transfer action | Failure or undo |
| --- | --- | --- | --- |
| Edit menu, toolbar, keyboard Copy | Asynchronous Clipboard API write, with plain fallback | `SwTransferable.Copy` prepares the selected rich/plain pair | Missing selection or failed write leaves the document untouched |
| Native `copy` | Synchronous `ClipboardEvent` MIME write | The same `SwTransferable.Copy` | Browser default is canceled; no Writer mutation |
| Edit menu, toolbar, keyboard Cut | Asynchronous Clipboard API write | `SwTransferable.Cut` deletes only after the write succeeds | Failed write preserves the selection; successful deletion is undoable |
| Native `cut` | Synchronous `ClipboardEvent` MIME write | The same `SwTransferable.Cut` | Browser default is canceled; deletion is undoable |
| Edit menu, toolbar, keyboard Paste | Asynchronous Clipboard API read | HTML is preferred when safe visible content is imported; otherwise plain text is inserted at the current Writer PaM | Empty or failed read leaves the document untouched; insertion is undoable |
| Native `paste`, drop | Synchronous event MIME read; drop also maps pointer coordinates to a Writer PaM | The same format selection and `SwTransferable.Paste` target conversion | Empty transfer is ignored; successful insertion is undoable |
| Drag start | Synchronous `DataTransfer` MIME write | `SwTransferable.CreateSelection` prepares the same rich/plain pair | No selection yields no transfer |

Paste accepts plain text and a strict rich subset: `strong`, `em`, safe links, single
underline, font family, foreground/highlight, paragraphs, and semantic nested
`ul`/`ol`/`li` structure. Unsupported tags are reduced to visible text; script
and style elements are discarded, CSS values are sanitized, and clipboard HTML
is never mounted in the editable document. The browser slice deliberately does
not yet support RTF, images, objects,
tables, Paste Special, multi-range transfer, or ODT/DOCX transfer filters.

The pinned LibreOffice `sw/uiconfig/swriter/menubar/menubar.xml` declares
`.uno:Cut`, `.uno:Copy`, and `.uno:Paste` in **Edit**, and
`sw/uiconfig/swriter/toolbar/standardbar.xml` declares the same commands in the
standard toolbar. This browser slice maps placement and bounded browser behavior
only. Rich transfer covers the implemented paragraph/list structure and direct
character formatting; full Writer transfer semantics remain future work.
