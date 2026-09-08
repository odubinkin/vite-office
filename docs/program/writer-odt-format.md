# Writer ODF 1.3 package slice

## Implemented boundary

The Writer format layer now reads and writes a bounded OpenDocument Text package
directly against the canonical `SwDoc` graph. It follows the pinned LibreOffice
ownership split: `package/source` handles ZIP and the manifest,
`xmloff/source/text` converts UI-neutral paragraph content, and
`sw/source/filter/xml` maps Writer styles, nodes, and hints while orchestrating
the package streams.

`SwXMLWriter` emits these deterministic STORE entries in order:

1. uncompressed `mimetype` containing
   `application/vnd.oasis.opendocument.text`;
2. `META-INF/manifest.xml`;
3. `styles.xml`;
4. `content.xml`;
5. `meta.xml`.

The reader accepts STORE and raw-DEFLATE ZIP32 entries. It imports named styles
before content, matching the ordering in the pinned Writer XML filter.

## Model mapping

The implemented ODF subset preserves ordered `SwTextNode` paragraphs, Default
Paragraph Style and Heading 1 collection membership and names, style inheritance,
style-level and node-local alignment, title metadata, and bold, italic, and
single-underline pooled items. Named and automatic paragraph styles may carry
character properties. ODF automatic paragraph and text styles are converted
into node `SwAttrSet` deltas and `SfxItemSet`-backed `SwFormatAutoFormat` hints
rather than becoming parallel view fields. Explicit normal text properties can
override inherited formatting and survive a package round trip.

Spaces are emitted as `text:s`, including `text:c` for runs, while tabs and
in-paragraph line breaks use `text:tab` and `text:line-break`. This retains exact
current `SwTextNode` text through semantic round trips. Internal browser paragraph
IDs are regenerated deterministically on import because this bounded filter does
not yet define an ODF identity extension.

## Security and failure behavior

The ZIP reader validates the end record, central-directory bounds, local-header
agreement, UTF-8 or ASCII-safe names, duplicate paths, sizes, CRC-32, methods,
and archive structure. It rejects encryption, ZIP64, multi-disk archives,
path traversal, invalid DEFLATE, and packages exceeding configurable archive,
entry-count, entry-size, total-size, or expansion-ratio ceilings. XML parsing
rejects document type declarations, malformed or incorrect roots, invalid
manifests, duplicate styles, unsupported semantic style properties, and
differing Western/CJK/CTL weight or posture values until script-specific
browser projections are implemented.

Lossy export is not permitted. Writer list state and paragraph item IDs outside
the implemented alignment and character subset fail explicitly. Imported tables, lists,
images, fields, annotations, tracked changes, sections, page styles, objects,
scripts, signatures, encryption, RDF, and arbitrary style properties likewise
remain unsupported rather than being silently discarded.

## Current product limit

The filter API is implemented and tested, but the workbench does not yet expose
ODT in browser File Open or Save controls. That browser/platform wiring and the
next ODF semantic slices are separate Writer tasks. This record is therefore a
bounded compatibility claim, not complete ODT or LibreOffice format parity.
