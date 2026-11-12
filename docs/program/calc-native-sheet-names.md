# Native sheet names for workbook import

The represented `ScDocumentImport` now uses original `getSheetIndex` and
`setSheetName` forwarding to the actual document. This is a prerequisite for the
native worksheet buffer; it does not implement the complete XLSX workbook filter.

`ScDocument::GetTable` retains the two source static COW strings, system character
classification, lazy actual-table uppercase names and missing-output zero.
`ScTable::SetName` clears its uppercase owner even for identical assignments.
`ValidNewTabName` uses the global classifier and table cache rather than a
separate document-locale comparison. The editing `RenameTab` path continues to
use its original transliteration comparison.

Counted UTF16 name validation rejects native forbidden characters and endpoint
apostrophes. It does not impose an invented 31-character bound or stop at NUL.
`GetAllTableNames` returns owned copies and preserves empty positions for sparse
clipboard/undo sheets. `SetTabNameOnLoad` retains signed16 conversion and native
validation order, without adding editing duplicate checks or stream invalidation.

The source `ScDocument::SetString` implementation is extracted unchanged into a
focused responsibility fragment to retain the strict authored file-size limit.
Table teardown now releases its actual uppercase and name string owners.

Sources: `sc/source/core/data/document.cxx`, `table1.cxx`,
`documentimport.cxx`, and `sc/inc/table.hxx` at the pinned baseline. A focused
search of `sc/qa` found no direct C++ test references to the four new naming
entry points; local tests exercise real document/import/table owners and a real
sparse clipboard. No original C++ execution or complete workbook parity is
claimed. Default-prefix generation, worksheet buffers, model document properties,
complete XLSX import/export and mounted file UI acceptance remain outstanding.
