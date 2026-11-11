# Native standalone package input component

OInputCompStream now implements its original standalone-copy constructor domain
using a real retained input/ByteReader reference and actual initialized
Sequence<PropertyValue> storage. Every declared XInputStream, XStream, XComponent,
XPropertySet and readonly XRelationshipAccess method is present. Native weak/query,
Any/Sequence/string and listener-container owners remain shared; no replacement
query, default/type provider, parent or mutex is created.

The original custom query order is retained, including the XTypeProvider bypass
recorded as CALC-495 and WRITER426. Only OFOPXML exposes XRelationshipAccess.
XStream and XExtendedStorageStream have their original normal cached metadata;
the latter has exactly its two required bases. Optional seek, encryption,
properties and transactions are not unconditional IDL inheritance. StorageFormats
retains the original constants1/2/3.

Reads share the wrapped stream position. Readonly getOutputStream and the source
TODO property descriptor return actual empty references. Relationships extract the
first real RelationsInfo Any and preserve ordered duplicate tags/IDs. Missing or
wrong metadata raises the original IOException, rather than producing an empty
provider. Property reads preserve IsEncrypted aliasing and hidden RelationsInfo;
known writes veto and unknown writes preserve original exception names. Original
TODO property-listener methods retain only the disposed check.

Public dispose notifies before closing and propagates close failure before setting
the flag. InternalDispose keeps its source event alive, catches only UNO close
exceptions and sets the flag. Last-release destruction retains itself while
notifying, then destroys member owners in reverse order. Tests use real
SequenceInputStream closure and native event listeners, not a fake stream or query
implementation. They check SDK/query identity, signed bytes, copied metadata,
readonly errors, property aliases, listener lifetime and close-failure ordering.
The upstream OFOPXML TestHelper::InternalCheckStream contract is replayed through
queried interfaces: one byte beyond EOF, exact contents, MediaType, Size and
relationships. Full Java storage-factory/transaction fixtures remain pending with
the unported storage graph.

The OWriteStream_Impl-bound constructor is unported. Native mutex scopes and
RefCountedMutex identity are not simulated; native synchronization, crosscasts,
physical ABI and allocation-failure unwind remain unverified. This component is
not yet connected to ZipStorage, whose current bare input binding remains in use.
Complete storage/output relationship services and DOCX/XLSX model/filter/Worker/UI
acceptance remain unfinished. Deliberate open/save/autosave/recovery choices are
unchanged; broad parity flags remain false.

Verification passes nine source-focused cases with whole-four-owner coverage
statements239/241, branches50/52, functions45/45 and lines221/221, above the
user-authorized90 floor. No tests force the remaining listener-present internal
disposal or non-UNO close-error alternatives solely to reach100. Related actual
input/container/StringPair/metadata/Writer stream regressions pass69 cases; module
boundary tests pass48 cases. Production coverage thresholds and exclusions are
unchanged. The global JSDoc gate still reports the two pre-existing diagnostics in
unchanged test/css-style-matchers.ts; its overall success is not claimed.
