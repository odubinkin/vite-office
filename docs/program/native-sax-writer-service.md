# Native SAX Writer service

The actual SAXWriter now derives from the original WeakImplHelper<XWriter,
XServiceInfo> and owns its acquired output, helper and five original state
members. All published methods retain source guards, state transitions,
indentation/72-column estimates, deferred tags, CDATA handling, exception
classes/messages and source callback order. Stream replacement constructs the
new helper before releasing the old one, and final destruction follows helper,
output and weak-base member order. No substitute Writer model/provider is added.

XActiveDataSource, two-base XWriter, Writer.create and the derived
SAXInvalidCharacterException are original complete declarations with normal
shared CPPUMaker types, exact direct-base order, native Reference results and
actual inherited exception fields/Any storage. Source factory context/arguments
are ignored exactly as upstream. The production registry uses the exact
expwrap.component constructor, implementation and service names. Creation,
interface queries and stream operations run through the actual service manager.

All original OSaxWriterTest entry points from sax/test/sax/testwriter.cxx execute:
invariant queries, complete testSimple with original Symbol bytes and
writeParagraph breaks, all testExceptions checks, testDTD and the complete
125-by-450 performance event workload plus125 nested closing tags. Only the
source filesystem output is replaced by the genuine UNOMemoryStream component;
original OSL timing, stdio/filesystem behavior and native performance claims are
unqualified. Stronger authored observations supplement the original criteria.
Additional tests use actual connected/closed OSequenceOutputStream owners for
flush and final-close exception wrapping, source warning/error/depth behavior,
real missing-service configuration, SDK inheritance/exception transport and
source flag retention.

Chromium main and DOM-free Worker create the registered service, connect an
actual native output and serialize a genuine native CDocument through
XSAXSerializable into Writer. Exact XML and source interface identity agree in
both realms. This is a real document-to-registered-writer path, with no browser
DOM or fake SAX document handler.

The normal NDEBUG/non-DBG_UTIL profile matches the existing helper qualification;
debug element-name stacks/grammar assertions, physical native MI/allocator/
pointer/shared-memory behavior and an independently compiled C++ differential
remain unqualified. CALC567..570/WRITER502..505 preserve source flag retention,
post-endDocument state and the raw XML-prefix skip. Earlier helper findings,
including custom-entity nontermination and pointer-overflow analysis, remain.

The existing limited XmlStringDocumentHandler carrier still serves the old
manifest/OFOP string-returning paths and is explicitly distinct from the actual
registered service. Its caller migration remains the next export integration
step, along with actual SfxDocumentMetaData service/storage and complete
DOCX/XLSX core/shell/UI acceptance. This service checkpoint does not certify
those pending consumers or erase earlier metadata/DOM coverage gaps.

The unchanged scoped90 profile contains all six complete changed/new production
owners. All 77 related cases in eight files pass: statements90.90%, branches92.61%,
functions97.95% and lines92.27%. No source branches/functions/lines are excluded or
selected out. Constructor translation branches that the actual source manager
does not produce are retained, not manufactured with a substitute provider.

The desktop-to-SAX composition edge follows Library_sax.mk's expwrap component
registration in the services registry, bound statically at browser bootstrap.
The reverse SAX-to-desktop edge remains forbidden. The module-cycle and core
ownership guards are unchanged; no cycle exception or provider bypass is added.
