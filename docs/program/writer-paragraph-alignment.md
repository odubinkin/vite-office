# Browser Writer paragraph alignment

The Writer workbench supports one direct paragraph-formatting property: left,
center, right, or justified alignment. Canonical state is a `SvxAdjustItem`
stored under the pinned numeric `RES_PARATR_ADJUST` WhichId in the paragraph's
lazy `SwAttrSet`; `WriterParagraph.alignment` is a derived browser projection. The pure
[`setWriterParagraphAlignment`](../../apps/office/src/sw/source/core/doc/writer.ts) transition
changes exactly one named paragraph, marks a changed document dirty, preserves
an identical state by reference, and participates in the existing immutable
undo/redo history.

The active editable paragraph determines the target paragraph. The four controls are in
the Writer formatting toolbar, and their pressed state uses accessible toggle
semantics. The same active alignment appears in the right properties sidebar.
The browser editable paragraph receives the corresponding CSS `text-align` value, so the
result remains visible without pretending that browser editing implements
LibreOffice line layout or justification algorithms.

New and appended paragraphs resolve the pool's start/left default. Version-three
browser-local snapshots retain only direct item deltas plus style definitions;
older non-canonical schemas are rejected. The same `RES_PARATR_ADJUST` value is
mapped to and from `fo:text-align` by the bounded ODT filter.

## Pinned LibreOffice provenance

The pinned `libreoffice-26.8.0.2` reference UI declares Writer paragraph
commands in
`sw/uiconfig/swriter/ui/notebookbar_groupedbar_full.ui`: `.uno:StartPara`,
`.uno:CenterPara`, `.uno:EndPara`, and `.uno:JustifyPara`. The pinned help topic
`helpcontent2/source/text/shared/01/05080400.xhp` identifies `.uno:JustifyPara`
as a paragraph command and describes its container-margin behavior. The pinned
`sw/qa/extras/htmlexport/htmlexport.cxx` test
`testReqifParagraphAlignment` sets the `ParaAdjust` paragraph property to right;
its export assertion is outside this browser-only feature.

Local domain, storage, React integration, and production-browser tests cover
the model transition, no-op and invalid cases, current snapshot restoration,
focused targeting, undo/redo, serialization, toolbar semantics, sidebar
feedback, and visible CSS alignment. They do not map the upstream export
assertion or establish parity for its fixture.

## Deliberate limits

This feature has no selection ranges, keyboard paragraph-alignment shortcuts,
writing-direction-aware start/end behavior, distributed alignment,
last-line rules, line-breaking, pagination, OOXML import or export, print/PDF
output, localization, or full LibreOffice Writer parity.
Each remains a separately mapped capability.
