# Browser Writer plain-text editor workbench

The Writer workbench exposes ordered labelled textareas for the plain-text
paragraph body of an in-memory `WriterDocument`. The
[`WriterPlainTextEditor`](../../apps/office/src/components/WriterPlainTextEditor.tsx)
is a controlled React view: each input event passes the complete text to its
[`WriterWorkbench`](../../apps/office/src/components/WriterWorkbench.tsx) owner,
which uses `replaceWriterParagraph` and `appendWriterParagraph` from the pure
Writer domain model.

The editor is visible only while Writer is selected. The workbench owns document
history, keyboard commands, local-storage feedback, and plain-text download;
the application shell owns suite navigation. Its live status reports the document
lifecycle and revision: a new document starts at revision zero, and a changed
value becomes dirty at revision one. Changing to another suite hides the
workbench while retaining the in-memory Writer session for the page session.

This is a bounded browser workbench, not a LibreOffice Writer parity claim. It
does not provide rich text, selection, range deletion or range reordering, layout,
spelling, accessibility parity for authored content, ODT import/export, or any
other document format behavior. The pinned upstream `sw/qa/core/text/text.cxx`
fixture records `APPEND_PARAGRAPH` behavior as limited append provenance; its
layout, PDF, and list assertions are not mapped by this feature.
