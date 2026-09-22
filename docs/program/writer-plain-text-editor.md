# Browser Writer plain-text editor workbench

The Writer workbench exposes ordered editable paragraph blocks for the body of
an in-memory `SwDoc`. DOM-neutral
[`SwEditWin`](../../apps/office/src/sw/source/uibase/docvw/edtwin.ts) owns edit
operations over the persistent `SwWrtShell`. The single browser
[`BrowserWriterEditWindow`](../../apps/office/src/sw/browser/editor/browser-writer-edit-window.ts)
converts native selection and `beforeinput` events to current `SwNodes`
coordinates and then to `SwPosition`/`SwPaM`. `SwUndoInsert`, `SwUndoDelete`,
`SwUndoReplace`, and `SwUndoSplitNode` actions mutate the live Writer graph.

The blocks are integrated directly into the document page rather than displayed
as labelled textarea cards. Their focus drives the existing formatting toolbar
and properties sidebar. See the [integrated document canvas](writer-document-canvas.md)
for placement, accessibility, and upstream-provenance detail.

React receives immutable paragraph and cursor projections and binds one stable
browser edit-window instance; it does not retain mutable nodes or create
operation-specific mutation closures. The editor is visible only while Writer
is selected. The workbench owns document history and keyboard commands;
the application shell owns suite navigation. The Writer status bar reports
browser-local save/load and download feedback. Changing to another suite hides
the workbench while retaining the in-memory Writer session for the page session.

This is a bounded browser workbench, not a complete LibreOffice Writer parity
claim. It implements bounded rich text, selection replacement/deletion, lists,
clipboard transfer, IME, ODT I/O, and browser persistence, but not native layout,
spelling, full authored-content accessibility, or every document feature. The pinned upstream `sw/qa/core/text/text.cxx`
fixture records `APPEND_PARAGRAPH` behavior as limited append provenance; its
layout, PDF, and list assertions are not mapped by this feature.
