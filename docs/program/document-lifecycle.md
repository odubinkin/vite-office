# Browser Document Lifecycle Contract

The initial browser document lifecycle contract is implemented in
[`apps/office/src/sfx2/source/doc/document.ts`](../../apps/office/src/sfx2/source/doc/document.ts).
It defines a JSON-serializable document header with a caller-provided identity,
suite ID, title, lifecycle state, and monotonic local revision.

The pure transitions are `createDocument`, `markDocumentDirty`,
`markDocumentSaved`, and `closeDocument`. They do not mutate inputs and reject
dirty/save transitions after close. A selected-suite workbench preview displays
only a new document header; it does not edit content, write files, persist
state, or claim a LibreOffice feature is complete.

This is shared platform infrastructure for later document-body, command,
storage, and format tasks. It has no atomic upstream parity mapping yet and
does not advance any parity-matrix row.
