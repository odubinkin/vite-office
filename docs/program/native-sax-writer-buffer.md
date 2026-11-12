# Native SAX Writer buffer

The original SaxWriterHelper now owns an acquired actual XOutputStream, the real
1024-byte UNO Sequence and its borrowed pointer, line-feed position, delayed
start-tag flag and original replacement vector. Construction acquires the stream
before allocating the sequence and unwinds initialized members on failure.
Destruction releases members without inventing an implicit flush or stream close.

The entire consumed helper algorithm is ported: cache writes and recursive tail
copies, UTF16-to-UTF8 conversion, native character status and surrogate ordering,
markup/attribute-whitespace escaping, custom entity copying/sorting/prefix lookup,
separate byte estimation, indentation, declaration/tags/PI/CDATA/comments, final
shrink/write and same-stream flush with pointer refresh. Exact-full and continue
boundaries, lowercase hexadecimal escapes and original defaults are retained.
The split functions bind the same helper receiver, not another state object.

The concrete consumed Pair<OUString,OUString> instantiation uses its original UNO
name com.sun.star.beans.Pair<string,string>, parameterized member flags and normal
shared CPPUMaker type registration. The two actual RTL members support native
compound/Any/Sequence copying, lvalue projection and destruction. Other Pair
instantiations are not advertised; no polymorphic default/type/value factory is
introduced.

Tests operate on the real OSequenceOutputStream, AttributeList, native Pair and
actual exception execution ABI. They verify UTF8 and escape output across cache
boundaries, all conversion flags, source invalid/surrogate output and status,
indentation/flush, error severity, replacement ownership/order and a genuine
closed-stream IOException wrapped as SAXException. Chromium main and a DOM-free
module Worker execute the same helper over actual native sequences/streams and
custom entities. The original testExceptions forbidden-character input is also
exercised at the helper boundary. It does not establish a passing full service QA
port.

This slice uses the original normal NDEBUG/non-DBG_UTIL helper profile:
CheckValidName is the compiled source no-op and debug-only element/name stacks
are absent. Debug grammar assertions, native binary/allocator/physical pointer
behavior, equal-key std::sort implementation order and shared-memory scheduling
remain unqualified. The surprising source branches are recorded as
CALC563..566/WRITER498..501 without changing them. Empty-replacement nontermination
and exact-full replacement pointer overflow are source-analysis findings, not
safe workloads to execute or claim parity for.

The SAXWriter UNO state machine, XWriter/Writer declarations, service registration,
original OSaxWriterTest testSimple/testExceptions/testDTD and performance workload,
and replacement of the existing limited manifest string carrier remain pending.
The helper is not registered as a replacement Writer service. These next owners
are required before metadata storeToStorage can use the original Writer route.
Full SfxDocumentMetaData and DOCX/XLSX core/shell/UI acceptance remain unfinished;
earlier metadata/DOM branch coverage gaps remain open in their own evidence.

All 36 related cases in five files pass. The unchanged scoped90 Istanbul profile
includes all three complete new production owners: statements95.61%,
branches90.68%, functions100% and lines98.43%. No source branches, functions or
lines are excluded or selected out. This bounded helper profile does not resolve
coverage gaps recorded for earlier metadata/DOM owners and does not certify the
pending Writer service or complete format/UI flows.
