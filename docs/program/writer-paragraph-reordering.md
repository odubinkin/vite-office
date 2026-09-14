# Browser Writer paragraph reordering

Paragraph reordering has no model helper or browser UI command at present.

The former browser **Paragraph actions** menu was removed because it did not
match an implemented Writer command placement and could be confused with the
numbering/list movement mechanisms in Writer. A future reordering capability
must first map a concrete Writer command, selection contract, UI placement, and
upstream test slice before introducing a model operation or browser action.

The pinned LibreOffice `sw/qa` tests remain provenance for a future command
slice, not a claim that the local primitive reproduces their behavior.
