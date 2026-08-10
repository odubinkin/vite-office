# Browser Writer plain-text editor workbench

The Writer workbench exposes one labelled textarea for the initial paragraph of
an in-memory `WriterDocument`. The component at
[`apps/office/src/components/WriterPlainTextEditor.tsx`](../../apps/office/src/components/WriterPlainTextEditor.tsx)
is a controlled React view: each input event passes the complete text to the
owner, which uses `replaceWriterParagraph` from the pure Writer domain model.

The editor is visible only while Writer is selected. Its live status reports the
document lifecycle and revision: a new document starts at revision zero, and a
changed value becomes dirty at revision one. Changing to another suite hides the
control while retaining the in-memory Writer state for the page session.

This is a bounded browser workbench, not a LibreOffice Writer parity claim. It
does not provide rich text, multiple paragraphs, selection, undo or redo UI,
keyboard commands, layout, spelling, accessibility parity for authored content,
persistence, ODT import/export, or any other document format behavior. The
pinned upstream `sw/qa/core/text/text.cxx` fixture is recorded as background
evidence that Writer text behavior exists upstream; its layout, PDF, and list
assertions are not mapped by this feature.
