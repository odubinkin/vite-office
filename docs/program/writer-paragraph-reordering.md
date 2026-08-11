# Browser Writer paragraph reordering

The Writer workbench can move one complete paragraph one adjacent position up or
down. [`moveWriterParagraph`](../../apps/office/src/domain/writer.ts) finds the
named paragraph, swaps its existing object with its adjacent neighbor, and
returns a dirty immutable document. Because the same paragraph object moves,
its text, identity, alignment, and bounded paragraph style are retained.

The formatting toolbar provides a **Paragraph actions** menu for the focused
paragraph. Its Move paragraph up/down items map the upstream notebookbar's
paragraph menu placement without adding persistent controls beside document
text. The first paragraph cannot move up and the last cannot move down. A
successful movement keeps the moved paragraph as the active formatting target
and is recorded in existing undo/redo history. Complete ordered bodies already
persist through the browser-local snapshot contract, so reordering survives
save and load without a new storage format.

## Pinned LibreOffice provenance

The pinned `libreoffice-26.8.0.2` source calls `SwEditShell::MoveParagraph` in
`sw/qa/extras/uiwriter/uiwriter10.cxx` while testing movement around tracked
changes. The local feature maps only the adjacent, non-tracked ordered-body
operation; it intentionally does not map redline semantics, cursor/range
selection, or the upstream test's layout consequences.

`sw/uiconfig/swriter/ui/notebookbar_groupedbar_compact.ui` and
`notebookbar_groupedbar_full.ui` also declare `MenuParagraph-MoveUp` and
`MenuParagraph-MoveDown`. The browser action menu is a placement-equivalent
control, not a native notebookbar reproduction.

## Deliberate limits

This is not drag-and-drop, multi-paragraph or range movement, keyboard movement,
change tracking, list/item movement, section/frame/table movement, pagination,
collaboration, ODT/OOXML import/export, or complete Writer parity. Each is a
separate mapped feature.
