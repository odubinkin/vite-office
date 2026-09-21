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
before content, matching the ordering in the pinned Writer XML filter. Export is
deliberately STORE-only: the result remains a valid ODF ZIP package, avoids adding
a second compression implementation to the browser bundle, and is bounded by a
64 MiB complete-output ceiling.

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
ten-level `SwNumRule` is built. Explicit `text:start-value` values on
`text:list-item` map to Writer restart items and are emitted again on export.

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
uses a namespace-aware SAX event stream, following LibreOffice's fast-parser
boundary without requiring `Window.DOMParser` in the worker. It rejects document
type declarations, malformed or incorrect roots, nesting beyond 256 elements,
mandatory XML streams larger than 16 MiB, invalid manifests, duplicate supported
styles, unsupported semantic values, and differing Western/CJK/CTL weight or
posture values until script-specific browser projections are implemented.

Lossy export is not permitted. Paragraph item IDs outside the implemented
alignment, list, and character subset fail explicitly. Imported tables, images,
fields, annotations, tracked changes, sections, objects, scripts, signatures,
encryption, RDF, custom bullet glyphs, non-decimal numbering, and list headers
remain unsupported. Unrelated style families, page-style data, and properties
outside the bounded Writer model are ignored during import, matching the scoped
upstream import-context behavior instead of inventing browser document fields.

## Browser File integration

The Writer workbench exposes **File → Open ODT…**, **File → Save as ODT…**, and
matching standard-toolbar actions. A browser-only VCL adapter obtains user-selected
bytes or starts a sandboxed byte download; it does not parse or own the document.
Production import and export cross a version-one Dedicated Worker protocol using
monotonic request IDs and transferable `ArrayBuffer` payloads. The worker performs
ZIP, manifest, SAX/xmloff, Writer XML mapping, and package serialization, returning
only a versioned ODT filter transfer or complete ODT bytes. The filter transfer is
not the durable browser snapshot schema: `odt-transfer.ts` owns the worker-only
structured-clone envelope, while `writer-storage-codec.ts` owns the current durable
model envelope and `writer-storage.ts` combines it with Sfx lifecycle metadata.
The current worker envelope uses `transferVersion: 3` and a filter-owned `graph`
record; it neither imports nor embeds the durable `writer-document-codec` record.
Its graph decoder reconstructs text through the document-bound content-operations
manager. Neither boundary is treated as the live Writer model, and retired storage
or worker transfer versions are rejected without migration.

The LibreOffice-shaped `SwDocShell` remains the active `SwDoc` owner. It validates
the returned snapshot on the main thread and replaces the current graph only after
the request is still current. A newer operation, explicit cancellation, timeout,
worker error, malformed package, or unsupported semantic value terminates or
rejects the candidate and leaves the active document and history intact. Successful
New or Open resets browser selection state and starts a fresh undo history.

Browsers do not grant this static application an in-place filesystem handle, so
Save As starts a download with a sanitized `.odt` filename. IndexedDB local copies
and plain-text download remain available as separately labelled File commands.
This record is a bounded compatibility claim, not complete ODT or LibreOffice
format parity; the unsupported model and package cases above still fail explicitly.

The compatibility suite also imports the exact pinned LibreOffice
`feature_text.odt`, `feature_text_bold.odt`, and `feature_text_italic.odt` fixtures
used by `sw/qa/extras/odfimport/odffeatures.cxx`, then verifies the supported text
and character semantics through a local export/reimport round trip.
