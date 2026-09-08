# Writer core document model

## Implemented source-guided boundary

The canonical in-memory Writer state is an identity-bearing object graph, not a
React document DTO. The current TypeScript boundary follows the pinned
LibreOffice `sw` sources as follows:

| TypeScript model | Pinned LibreOffice source | Preserved responsibility |
| --- | --- | --- |
| `SwDoc` | `sw/inc/doc.hxx`, `sw/source/core/doc/docnew.cxx` | Owns the document node array and modified state |
| `SwNodes` | `sw/inc/ndarr.hxx`, `sw/source/core/docnode/nodes.cxx` | Owns the ordered node array and fixed document sections |
| `SwNode`, `SwStartNode`, `SwEndNode`, `SwContentNode` | `sw/inc/node.hxx`, `sw/source/core/docnode/node.cxx` | Represent section boundaries and content nodes with array identity |
| `SwTextNode` | `sw/inc/ndtxt.hxx`, `sw/source/core/txtnode/ndtxt.cxx` | Owns paragraph text, optional hints, and bounded paragraph properties |
| `SwTextAttr`, `SwpHints` | `sw/source/core/txtnode/txatbase.cxx`, `ndhints.cxx`, `thints.cxx` | Store start-sorted character-attribute ranges |
| `SwNodeIndex`, `SwPosition`, `SwPaM` | `sw/inc/pam.hxx`, `sw/source/core/crsr/pam.cxx` | Address nodes, content offsets, and directional point/mark selections |
| `DocumentContentOperationsManager` | `sw/source/core/doc/DocumentContentOperationsManager.cxx` | Applies bounded Insert, Delete, and Replace operations through a `SwPaM` |

This is a bounded reimplementation of those source responsibilities. Similar
names alone are not treated as parity evidence; the source-provenance manifest,
tests, and parity record identify the concrete implemented subset.

## Node array and document body

`SwNodes` creates the same five fixed sections, in the same start/end order, as
the pinned constructor:

1. postits start and end;
2. inserts start and end;
3. autotext start and end;
4. redlines start and end;
5. content start and end.

Body `SwTextNode` instances are inserted immediately before the content end
node. A node belongs to one `SwNodes` instance, and model positions reject nodes
from a different array. This preserves the ownership and ordering invariants
needed for later sections, redlines, tables, fields, and layout work.

## Text, attributes, and ranges

Visible paragraph text lives only in `SwTextNode`. Direct Bold, Italic, and
single Underline are represented by `RES_TXTATR_AUTOFMT`-like `SwTextAttr`
ranges stored in an optional start-sorted `SwpHints`. Insert, erase, replace,
split, and append operations update both text and applicable hint ranges.

The `runs` consumed by React and clipboard code are a derived projection of the
text and hints. They are not duplicated canonical state. `SwPosition` combines
a node with a UTF-16 content offset; `SwPaM` preserves LibreOffice's independent
point and optional mark, including selection direction, while exposing ordered
bounds for content operations.

## Browser transaction and persistence adapters

LibreOffice mutates its identity-bearing model and records undo objects. The
current browser workbench still needs immutable React roots, so each command
clones the `SwDoc` graph and then applies the source-shaped mutation to the
clone. This is a UI/history adapter, not the canonical document representation.

Persistence uses the explicit `swModelVersion: 1` snapshot produced by
`SwDoc.toSnapshot()`. The snapshot records the shared document header and text
node snapshots; `SwDoc.fromSnapshot()` reconstructs node ownership, hints, and
identity. Loading also accepts the earlier `paragraphs`/`runs` DTO as a migration
input, converting it immediately into the canonical graph.

## Deliberate remaining gaps

The model does not yet reproduce the full Sfx item-pool and style inheritance
system, registered index correction, notification clients, nested non-body
sections, tables, frames, fields, marks, redlines, content controls, anchored
objects, layout frames, native undo objects, or Writer's file filters. ODT and
DOCX support must be reimplemented from the corresponding pinned filter and
storage sources against this graph; serializing the browser projection is not a
format implementation.
