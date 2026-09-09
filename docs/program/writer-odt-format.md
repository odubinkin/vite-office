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

Default bullets, decimal numbering, and levels zero through nine use the same
split ownership as Writer: `SwDoc` owns a `SwNumRule` with one `SwNumFormat`
per level, while each listed `SwTextNode` stores the rule name, list identity,
and level in `RES_PARATR_NUMRULE`, `RES_PARATR_LIST_ID`, and
`RES_PARATR_LIST_LEVEL`. The xmloff boundary writes automatic
`text:list-style` definitions and nests flat Writer nodes in `text:list` and
`text:list-item` elements. Root `xml:id` and `text:continue-list` segments
retain list identity across intervening ordinary paragraphs. Import performs
the inverse traversal, including LibreOffice output that declares only the
levels used by a list style; missing internal formats are completed when the
ten-level `SwNumRule` is built.

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

Lossy export is not permitted. Paragraph item IDs outside the implemented
alignment, list, and character subset fail explicitly. Imported tables, images,
fields, annotations, tracked changes, sections, page styles, objects, scripts,
signatures, encryption, RDF, custom bullet glyphs, non-decimal numbering, list
headers, and arbitrary style properties likewise remain unsupported rather than
being silently discarded.

## Browser File integration

The Writer workbench exposes **File → Open ODT…**, **File → Save as ODT…**, and
matching standard-toolbar actions. A browser-only VCL adapter obtains user-selected
bytes or starts a sandboxed byte download; it does not parse or own the document.
The LibreOffice-shaped `SwDocShell` remains the active `SwDoc` owner and delegates
load/save to `SwXMLReader` and `SwXMLWriter`. Import builds and validates a candidate
graph before replacing the current session, so cancellation, malformed packages,
and unsupported semantics leave the active document and history intact. Successful
New or Open resets browser selection state and starts a fresh undo history.

Browsers do not grant this static application an in-place filesystem handle, so
Save As starts a download with a sanitized `.odt` filename. IndexedDB local copies
and plain-text download remain available as separately labelled File commands.
This record is a bounded compatibility claim, not complete ODT or LibreOffice
format parity; the unsupported model and package cases above still fail explicitly.
