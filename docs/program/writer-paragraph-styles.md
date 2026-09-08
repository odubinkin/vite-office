# Browser Writer paragraph styles

The Writer workbench supports two document-owned `SwTextFormatColl` instances:
**Default Paragraph Style** and **Heading 1**. `SwDoc` owns their ordered table;
Heading 1 derives from the default collection through the same parent item-set
lookup used by Writer formats. Each `SwContentNode` registers in one collection,
and its optional direct `SwAttrSet` is reparented when the collection changes.
`WriterParagraph.style` is the collection ID projected for the browser.
`setWriterParagraphStyle` changes that registration immutably; a no-op retains
the current document reference and a change participates in lifecycle, history,
snapshot, undo, and redo contracts.

The existing **Paragraph style** select in the formatting toolbar applies its
value to the focused editable paragraph. `Heading 1` is visibly larger and bold in the
bounded browser editing surface, and its accessible description and properties
sidebar state identify the style. This is paragraph-level styling, not an HTML
heading tree or a replacement for Writer's document semantics.

Version-two snapshots persist collection definitions, their direct item deltas,
parent IDs, and each node's collection ID. Version-one and older local snapshots
are migrated to the safe default when their style is absent or unsupported.
This compatibility rule only bridges prior Vite Office snapshots and does not
parse or migrate ODT, OOXML, or arbitrary third-party documents.

## Pinned LibreOffice provenance

The pinned LibreOffice reference declares `.uno:StyleApply` and paragraph-style
entries such as `Heading 1` in
`sw/uiconfig/swriter/ui/notebookbar_compact.ui`. Its
`sw/qa/extras/uiwriter/uiwriter9.cxx` dispatches `.uno:StyleApply` and asserts
the `ParaStyleName` values for Writer paragraphs. The narrowed browser feature
maps only focused application of the two listed style choices; it does not map
the upstream test's multiple selections, list behavior, import/export, or
layout assertions.

## Deliberate limits

The bounded two-style hierarchy is not the complete Writer style system. There
is no custom style creation/editing UI, conditional style logic, automatic-style
cache, complete follow-style behavior, outline assignment, character/page/list
styles, locale-aware built-in style pool, ODT/OOXML style import/export,
pagination, navigation outline, or print/PDF parity. Each requires an
independently mapped feature task.
