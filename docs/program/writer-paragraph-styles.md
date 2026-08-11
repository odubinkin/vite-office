# Browser Writer paragraph styles

The Writer workbench supports two serializable paragraph styles: **Default
Paragraph Style** and **Heading 1**. Each `WriterParagraph` has a bounded
`style` literal, and `setWriterParagraphStyle` changes one named paragraph
immutably. A no-op retains the current document reference; a change shares the
existing lifecycle, transaction history, browser-local snapshot, undo, and redo
contracts.

The existing **Paragraph style** select in the formatting toolbar applies its
value to the focused editable paragraph. `Heading 1` is visibly larger and bold in the
bounded browser editing surface, and its accessible description and properties
sidebar state identify the style. This is paragraph-level styling, not an HTML
heading tree or a replacement for Writer's document semantics.

Older local snapshots that lack `style` receive the safe default value during
load, together with existing alignment normalization. This compatibility rule
only bridges prior Vite Office snapshots and does not parse or migrate ODT,
OOXML, or arbitrary third-party documents.

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

There is no style hierarchy, custom style creation/editing, inheritance,
outline numbering, character style, range selection, shortcut, locale-aware
style names, ODT/OOXML styles, pagination, navigation outline, print/PDF, or
full Writer compatibility. Each requires an independently mapped feature task.
