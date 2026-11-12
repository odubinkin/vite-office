# Native DOM classic SAX serialization

CDocument now advertises the actual XSAXSerializable interface. serialize adds
the supplied native StringPair prefix/URI declarations to the existing root,
keeps the original xmlNewNs duplicate behavior, runs source nscleanup over the
children and dispatches the native tree through virtual saxify methods. It does
not construct a replacement XML tree or use browser DOM APIs.

The document starts and ends the handler around its actual native children.
Elements emit namespace declarations before ordinary attributes, build qualified
names from their actual prefix/local name, call startElement, traverse children
and call endElement. Attribute values and Unicode text remain raw SAX values.
Each callback receives a real acquired AttributeList component; handlers can
retain it after serialization and clone it through XCloneable.

Source CNode's default saxify validates the handler and otherwise does nothing.
Text calls characters. Comments, CDATA and processing instructions query
XExtendedDocumentHandler. CDATA and PI are entirely omitted for a basic handler,
even though processingInstruction exists on XDocumentHandler. This source behavior
is preserved and documented in CALC-555/WRITER489. Empty documents emit begin/end
without inventing a root. Callback failures propagate and skip remaining end
events. Root namespace additions persist in the actual source DOM.

AttributeList now uses the original WeakImplHelper<XAttributeList,XCloneable>
root, native string members, acquired clone return and reverse destruction.
Constructor failure unwinds partial member copies and releases an already acquired
name if a foreign value getter throws. An actual UNO forwarding list raises the
original RuntimeException after one entry; public native RTL refcounts return to
their original value. The former plain object with erased weak identity is removed. Existing
manifest/OFOPXML callbacks now pass actual UNO attribute references and retain
references explicitly where they outlive a callback. The lightweight manifest
string composition still implements only its explicit five-callback slice; it
is not advertised as the native SAX Writer service. ManifestImport now has its
original XDocumentHandler weak root. Unsupported encrypted manifest branches are
unchanged. Existing duplicate incomplete SAX declarations under udkapi are
removed in favor of the actual offapi IDL owners and the existing real XLocator.

Authored critical tests cover native order/identity, independent clones,
namespace deduplication, default declarations, raw Unicode, exception propagation,
basic/extended handlers, entity-reference no-op and original empty-handler checks.
The qadevOOo XCloneable createClone/name/implementation-ID criteria are adapted
for the actual AttributeList, retaining optional-interface and empty-default
criteria. The applicable domtest serializerTest parse and classic-facet query run
through the real registered DocumentBuilder. The original test then invokes fast
serialization; that remainder is explicitly pending, not a passing full port.

Native OSL locks, physical ABI/MI/std allocator traces and Java proxy harness
remain unqualified. XFastSAXSerializable and document IO facets stay unadvertised
until their concrete owners exist. Whole changed-owner coverage includes existing
DOM branch gaps; exact counters and the90 gate result are retained without
coverage exclusions or private state mutation. SfxDocumentMetaData and final
DOCX/XLSX core/shell/existing UI acceptance remain unfinished.
