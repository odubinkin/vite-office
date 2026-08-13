# Browser Writer plain-text editor workbench

The Writer workbench exposes ordered editable paragraph blocks for the
plain-text body of an in-memory `WriterDocument`. The
[`edtwin`](../../apps/office/src/sw/source/uibase/docvw/edtwin.tsx)
is a browser-owned `contenteditable` view: each input event passes the complete text to its
[`view`](../../apps/office/src/sw/source/uibase/uiview/view.tsx) owner,
which uses `replaceWriterParagraph` and `splitWriterParagraph` from the pure
Writer domain model.

The blocks are integrated directly into the document page rather than displayed
as labelled textarea cards. Their focus drives the existing formatting toolbar
and properties sidebar. See the [integrated document canvas](writer-document-canvas.md)
for placement, accessibility, and upstream-provenance detail.

The editor is visible only while Writer is selected. The workbench owns document
history, keyboard commands, local-storage feedback, and plain-text download;
the application shell owns suite navigation. The Writer status bar reports
browser-local save/load and download feedback. Changing to another suite hides
the workbench while retaining the in-memory Writer session for the page session.

This is a bounded browser workbench, not a LibreOffice Writer parity claim. It
does not provide rich text, selection-range replacement, range deletion or range reordering, layout,
spelling, accessibility parity for authored content, ODT import/export, or any
other document format behavior. The pinned upstream `sw/qa/core/text/text.cxx`
fixture records `APPEND_PARAGRAPH` behavior as limited append provenance; its
layout, PDF, and list assertions are not mapped by this feature.
