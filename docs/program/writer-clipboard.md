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
alignment plus Default Paragraph Style or Heading 1 sizing, weight, and line
height. It also retains implemented direct character formatting as semantic
`strong`, `em`, and single-underline `span` elements, including a selected
partial span whose shared semantic ancestor would otherwise be lost by browser
range cloning. [`copyRichText`](../../apps/office/src/vcl/browser/browser-clipboard.ts)
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

Copy does not alter the immutable Writer document, transaction history,
properties, or browser-local snapshot. A missing selection reports **Select
text to copy.** rather than serializing the whole document implicitly. Cut first
writes the same paired clipboard data, then removes one non-empty selection inside
one Writer paragraph as an undoable immutable text-range transition. Paste replaces
one same-paragraph selection or inserts at a collapsed Writer caret. Native Paste
reads its `ClipboardEvent` synchronously; menu and toolbar Paste use a
user-initiated `navigator.clipboard.read` request, with `readText` fallback.

Paste accepts plain text and a strict rich subset: `strong`, `em`, and a single
underline `span`. Other tags are reduced to their visible text; scripts and styles
are discarded, and no clipboard HTML is mounted in the editable document. The
browser slice deliberately does not yet support cross-paragraph Cut/Paste, lists or
paragraph structure on Paste, RTF, images, objects, tables, Paste Special,
multi-range transfer, or ODT/DOCX transfer filters.

The pinned LibreOffice `sw/uiconfig/swriter/menubar/menubar.xml` declares
`.uno:Cut`, `.uno:Copy`, and `.uno:Paste` in **Edit**, and
`sw/uiconfig/swriter/toolbar/standardbar.xml` declares the same commands in the
standard toolbar. This browser slice maps placement and bounded browser behavior
only. Rich transfer covers just the implemented direct character formatting; full
Writer transfer semantics remain future work.
