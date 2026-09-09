# Writer core document model

## Implemented source-guided boundary

The canonical in-memory Writer state is an identity-bearing object graph, not a
React document DTO. The current TypeScript boundary follows the pinned
LibreOffice `sw` sources as follows:

| TypeScript model | Pinned LibreOffice source | Preserved responsibility |
| --- | --- | --- |
| `SfxPoolItem`, `SfxItemPool`, `SfxItemSet` | `svl/source/items/poolitem.cxx`, `itempool.cxx`, `itemset.cxx` | Represent WhichId-keyed values, pool defaults, direct deltas, parent lookup, and item state |
| `SwDoc` | `sw/inc/doc.hxx`, `sw/source/core/doc/docnew.cxx` | Owns the node array, `SwAttrPool`, paragraph-style collections, numbering rules, and modified state |
| `SwAttrPool`, `SwAttrSet` | `sw/source/core/attr/swatrset.cxx` | Specialize the item pool/set for document-owned Writer attributes |
| `SwFormat`, `SwFormatColl`, `SwTextFormatColl` | `sw/source/core/attr/format.cxx`, `sw/source/core/doc/fmtcol.cxx` | Own named paragraph-style deltas and their derived-from relationship |
| `SwNodes` | `sw/inc/ndarr.hxx`, `sw/source/core/docnode/nodes.cxx` | Owns the ordered node array and fixed document sections |
| `SwNode`, `SwStartNode`, `SwEndNode`, `SwContentNode` | `sw/inc/node.hxx`, `sw/source/core/docnode/node.cxx` | Represent section boundaries and content nodes; content nodes register in a format collection and lazily own direct attributes |
| `SwTextNode` | `sw/inc/ndtxt.hxx`, `sw/source/core/txtnode/ndtxt.cxx` | Owns paragraph text, optional hints, and item-backed paragraph properties |
| `SwNumRule`, `SwNumRuleItem` | `sw/source/core/doc/number.cxx`, `sw/source/core/para/paratr.cxx` | Separate document-owned numbering definitions from the rule name stored on a paragraph |
| `SvxWeightItem`, `SvxPostureItem`, `SvxUnderlineItem` | `editeng/source/items/textitem.cxx` | Preserve the exact font enum ordering and boolean interpretation used by Writer character commands |
| `SwTextAttr`, `SwFormatAutoFormat`, `SwpHints` | `sw/source/core/txtnode/txatbase.cxx`, `ndhints.cxx`, `thints.cxx` | Store start-sorted character-attribute ranges whose auto-format item owns a character `SfxItemSet` |
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
single Underline are represented by `SwTextAttr` ranges carrying the exact
`RES_TXTATR_AUTOFMT` WhichId. Each `SwFormatAutoFormat` owns an independent
`SfxItemSet` of `SvxWeightItem`, `SvxPostureItem`, and `SvxUnderlineItem`
deltas, including synchronized Western, CJK, and complex-text weight/posture
items. Insert, erase, replace, split, and append operations update both text and
applicable hint ranges.

Paragraph properties are not stored as parallel TypeScript fields. The pinned
numeric WhichIds from `sw/inc/hintids.hxx` identify `RES_PARATR_ADJUST`,
`RES_PARATR_NUMRULE`, `RES_PARATR_LIST_ID`, and `RES_PARATR_LIST_LEVEL` items.
`SwDoc` owns their defaults through `SwAttrPool`. A `SwContentNode` is registered
in a `SwTextFormatColl`; reads fall through the optional direct `SwAttrSet`, its
collection and parent collections, and finally the pool default. The direct set
is allocated on first mutation and released when its last delta is cleared.

The current style table contains Default Paragraph Style and Heading 1, with
Heading 1 derived from the default collection. Alignment is an
`SvxAdjustItem`. List application stores a `SwNumRuleItem` name, list identity,
and level while the corresponding `SwNumRule` and its ten per-level
`SwNumFormat` records are owned by `SwDoc`.
The browser-facing `alignment`, `style`, and `list` properties are derived
projections, like `runs`; they are not canonical storage.

Character items may also live on `SwTextFormatColl` or a node-local
`SwAttrSet`; browser runs resolve hint, node, style-parent, and pool-default
values in that order. Explicit normal values therefore override inherited
bold/italic/underline formatting without introducing a parallel boolean store.

The `runs` consumed by React and clipboard code are a derived boolean projection of the
text and pooled hints. They are not duplicated canonical state. `SwPosition` combines
a node with a UTF-16 content offset; `SwPaM` preserves LibreOffice's independent
point and optional mark, including selection direction, while exposing ordered
bounds for content operations.

## Browser transaction and persistence adapters

LibreOffice mutates its identity-bearing model and records undo objects. The
current browser workbench still needs immutable React roots, so each command
clones the `SwDoc` graph and then applies the source-shaped mutation to the
clone. This is a UI/history adapter, not the canonical document representation.

Persistence uses the explicit `swModelVersion: 3` snapshot produced by
`SwDoc.toSnapshot()`. It records the shared document header, document-owned
style and numbering definitions, text-node collection identities, direct item
deltas, and text hints. `SwDoc.fromSnapshot()` reconstructs those ownership and
inheritance links. Earlier DTO and snapshot schemas are deliberately rejected;
the current reimplementation does not preserve contracts from the preceding
non-canonical model.

## Deliberate remaining gaps

The bounded pool supports the paragraph items required by current browser
commands plus Western/CJK/CTL weight and posture and common underline. It does
not yet reproduce pool ranges for the complete Writer item
universe, invalid/disabled item payloads, item sharing/reference counts,
`SfxBroadcaster` notifications, conditional styles, automatic-style caches, or
the complete built-in style and numbering tables and format properties. Registered index correction,
nested non-body sections, tables, frames, fields, marks, redlines, content
controls, anchored objects, layout frames, native undo objects, and most Writer
file filters also remain. The bounded ODT filter maps this graph; DOCX and the
remaining formats must be reimplemented from their corresponding pinned filter
and storage sources. Serializing the browser snapshot is not a file-format
implementation.
