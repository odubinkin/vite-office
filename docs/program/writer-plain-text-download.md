# Writer plain-text download

The Writer workbench **Download text** action exports its ordered bounded
paragraph body, with one line-feed between paragraphs, as a UTF-8 `text/plain`
Blob. The browser receives a temporary object URL and a filename derived from
the document title; the URL is released after the click dispatch. No server,
account, or network request participates.

The action reports whether browser download dispatch started or could not start.
It is plain-text export only: ODT, OOXML, PDF, File System Access, download
history, printing, and LibreOffice format parity remain separate tasks.
