# Browser Writer paragraph styles

The Writer workbench supports all 126 built-in paragraph styles from the pinned
LibreOffice Writer pool. `sw/inc/poolfmt.ts` retains the six upstream ranges,
numeric pool identities, programmatic names, parent links, and follow-style
links. `SwDoc` owns their ordered `SwTextFormatColl` table, and each
`SwContentNode` registers in one collection. Direct `SwAttrSet` values continue
to inherit through the collection parent graph.

`SwWrtShell.SetParagraphStyle` changes the live registration through
`SwUndoFormatColl`, so application participates in lifecycle, history,
snapshots, Undo, and Redo. Enter uses the current collection's follow style;
headings continue with Text body, matching Writer's pool behavior.

The formatting toolbar groups the complete catalog into Text, List, Special,
Index, Chapter/Document, and HTML ranges. Options are indented by parent depth.
The browser renders representative built-in typography while canonical style
identity and hierarchy remain model-owned rather than inferred from HTML tags.

Snapshots persist collection definitions, pool/group identities, direct item
deltas, parent/follow IDs, and each node's collection ID. The ODT filter emits
the complete built-in named-style table with parent and next-style names and
resolves those identities on import.

## Pinned LibreOffice provenance

The catalog and hierarchy map `sw/inc/poolfmt.hxx`,
`sw/source/core/doc/poolfmt.cxx`, `sw/source/core/doc/SwStyleNameMapper.cxx`,
and `sw/source/core/doc/DocumentStylePoolManager.cxx`. Command placement maps
`.uno:StyleApply` entries in Writer UI resources.

## Deliberate limits

Custom style creation/editing, conditional styles, locale-translated UI names,
page/frame/character style families, complete print layout, and OOXML style
interchange remain outside this slice. Properties whose exact result depends on
pagination, printer metrics, or locale retain their style identity/hierarchy but
use representative browser presentation.
