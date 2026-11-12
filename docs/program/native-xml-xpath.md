# Native XML XPath

The production registry now links the original CXPathAPI service. Complete
XXPathAPI, XXPathObject, XXPathExtension, XPathObjectType, XPathException and
Libxml2ExtensionHandle declarations retain their original names, scalar widths,
defaults and normal shared UNO type registration.

Evaluation uses native xmlXPathNewContext/xmlXPathEval and native casts. Actual
CNode/CDocument owners supply the native context and identity cache. Each query
copies namespace values and extension References before evaluation. Namespace
registration preserves source std::map first-insertion semantics and UTF16 key
order. Namespace collection walks child declarations before parent declarations.
The original named-prefix QA is unchanged.

CXPathObject and CNodeList share one native result with xmlXPathFreeObject as
its last-owner deleter. A list retains the document and native node-set result
when the query object has been released. Non-node-set results produce empty
lists. This shared_ptr control block is an explicit host-language lowering,
not a replacement XPath evaluator, document tree or native allocator. Source
mutex scopes execute synchronously within a realm; native concurrent scheduling
and physical C++ object layout are unqualified.

C accessors are generated from the actual pinned headers. A C varargs trampoline
retains xpathapi.cxx's bounded 1000-byte vsnprintf formatting; host console output
is the SAL diagnostic sink. The source global generic-error callback is reset
to NULL at the original point after evaluation, without restoring a previous
callback or moving reset into a finally block. Structured diagnostics remain
context-local. The native implementation remains unchanged libxml2 2.15.3;
the rebuilt package adds actual field access, with 144 exports and108 header enums.

The full original testXXPathAPI and testXXPathObject assertions run through the
real production context/manager and registered DocumentBuilder/XPathAPI. Added
critical checks cover last-list document lifetime, native identity, scalar/empty
results, first namespace insertion, child namespace shadowing, normal signed64
handle transport and actual application-extension reference ownership with zero
native lookup handles. Real Chromium main and DOM-free Worker evaluate and
select from the registered native services; only scalar observations cross realms.

Suspected unchecked namespace lookup, NULL prefix strlen operands and global
callback reset are documented as CALC-544..546 and WRITER478..480. Undefined C++
inputs are not assigned fabricated native outcomes. In particular a NULL namespace
prefix is an explicit host precondition failure, not an empty-prefix substitute.
Actual native function/variable lookup table callbacks also run with source
userdata and NULL results for missing names; native XPath raises XPathException.
Successful custom function values, nonfinite/out-of-range float-to-integral casts,
native allocation failures and physical ABI/thread behavior remain unqualified.
Real UCB/URI provider QA, metadata and complete DOCX/XLSX/UI remain unfinished.
