# Native package input connection

ZipStorage READ input now returns a genuine OInputCompStream instead of a bare
SequenceInputStream. Its actual initialized PropertyValue sequence contains
MediaType, Compressed, Size and RelationsInfo in original order. Source data is a
real signed byte Sequence; the native component owns the input, property snapshot
and readonly relationship interface. Every open remains an independent snapshot.
Stored input derives compression from the actual entry method and Size from
validated bytes. Writable snapshots retain the original pending compression
default; the existing STORE-only ZIP output binding is unchanged.

ZipPackage now applies parseContentType rules over the existing flat catalog
binding. Native parsed StringPair rows apply defaults first and explicit overrides
afterward. Leading-dot extensions, exact short-name suffixes, duplicate assignment
and case sensitivity remain source-defined. This deliberately differs from
GetContentTypeByName's extension-first search. The internal content-type entry is
required, and excluded from exposed storage streams after metadata application.
Tests that previously treated an incomplete ZIP as an OOXML package now include
valid content metadata; internal metadata assertions read the raw ZipFile entry.

Own relationship metadata follows missing-empty and malformed-BROKEN refusal.
Native I/O failures return an empty Reference at the ZipStorage boundary. The
existing host SAX/ZIP transport remains explicit; no complete parser or storage
service is manufactured. The asynchronous content cache retains only field data
or a diagnostic. It destroys a failed initialization exception once and creates a
separate native exception for each failed open, preserving owned exception
lifetimes under concurrent calls.

Writer now retains an actual XStream, calls getInputStream and queries the real
XRelationshipAccess to retrieve part relationships. The private part relationship
mirror and its repeated side-stream parse are removed. Root storage relationships
still use the existing explicit binding pending a complete XStorage owner. Native
input disposal now produces DisposedException through the same real component;
related fragment cleanup tests preserve that exception contract.

The snapshot constructor domain is the genuine standalone native overload. It
does not impersonate the unported parent-bound OWriteStream_Impl path. Complete
parent invalidation/locking, native mutex/ABI/allocation guarantees, XStorage and
hierarchical SEEKABLEREAD remain unported or unverified. DOCX/XLSX document model,
filter, Worker and existing UI acceptance remain incomplete. Browser open/save,
autosave and recovery decisions are unchanged.

Verification passes82 scenarios in the six-file scoped coverage profile and98
in a separate six-file integration run, including four actual pinned
Strict/Transitional DOCX/XLSX packages. These counts describe separate runs and
include overlapping cases. Related ODS Worker/Writer ODT/component tests pass29
scenarios. Whole-three-owner coverage is statements478/483, branches217/222,
functions45/45 and lines420/421, passing the user-authorized global90 floor.
ZipStorage alone has89.79 percent branch coverage; unexercised native-Exception
transport alternatives are not forced to inflate coverage. Production thresholds
and exclusions are unchanged. These checks prove package/component integration,
not complete document-model or UI acceptance.

Typecheck, production build, module/source/provenance/registry, size, resources,
lint, formatting, doctor and routing checks pass. Global JSDoc still reports only
the two existing diagnostics in unchanged test/css-style-matchers.ts; no full
documentation-gate success is claimed.
