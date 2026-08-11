# Browser Writer clipboard copy

The bounded browser Writer workbench implements **Copy** at both pinned Writer
locations: **Edit → Copy** and the standard toolbar. The command reads the
browser's current native selection and writes its plain text with no server,
account, or network request.

[`copyPlainText`](../../apps/office/src/platform/browser-clipboard.ts) first
uses `navigator.clipboard.writeText`. When that asynchronous API is missing or
the browser rejects it, the adapter creates a temporary off-screen textarea and
uses the browser's local `document.execCommand("copy")` fallback. The temporary
element is immediately removed; if both mechanisms fail, the Writer status row
reports that copying failed.

Copy does not alter the immutable Writer document, transaction history,
properties, or browser-local snapshot. A missing selection reports **Select
text to copy.** rather than serializing the whole document implicitly.

The pinned LibreOffice `sw/uiconfig/swriter/menubar/menubar.xml` declares
`.uno:Copy` in **Edit**, and `sw/uiconfig/swriter/toolbar/standardbar.xml`
declares the same command in the standard toolbar. This browser slice maps the
placement and plain-text browser behavior only; Cut, Paste, rich clipboard
formats, range replacement, and cross-application compatibility are separate
feature tasks.
