# Browser Writer paragraph reordering

[`moveWriterParagraph`](../../apps/office/src/sw/source/core/doc/writer.ts)
remains a pure, tested document-model primitive: it can swap one complete
paragraph with an adjacent sibling while retaining its text, identity,
alignment, style, and list metadata. It has no browser UI command at present.

The former browser **Paragraph actions** menu was removed because it did not
match an implemented Writer command placement and could be confused with the
numbering/list movement mechanisms in Writer. A future reordering capability
must first map a concrete Writer command, selection contract, UI placement, and
upstream test slice before reintroducing a browser action. The primitive does
not itself advance any parity record.

The pinned LibreOffice `sw/qa` tests remain provenance for a future command
slice, not a claim that the local primitive reproduces their behavior.
