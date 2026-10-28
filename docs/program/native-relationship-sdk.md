# Native package relationship SDK

StringPair now provides the original two OUString field owners and normal cached
struct metadata. Default/copy/all-field construction, field assignment, equality,
memberwise moves, actual compound field addresses and reverse destruction reuse
the existing SAL/CPPU owners. A compiler const-reference binding borrows existing
initialized aggregate fields through actual OUString field views without copying,
acquiring or creating another value/default provider.

The complete XRelationshipAccess IDL method set now has its normal cached
interface type with the original implicit XInterface root. Signatures retain
actual OUString and nested Sequence<StringPair> contracts. This is an SDK
interface, not an instantiated storage/relationship service. No substitute query,
relationship table or incomplete component is advertised.

Tests exercise StringPair through real Any and initialized struct Sequence COW,
including retained const views, exact UTF16 strings and member ownership. The
interface tests exercise cached type identity and empty-reference query behavior;
they do not claim that a relationship service exists. Physical ABI, complete
reflection/marshalling, constructor allocation-failure unwind and native
synchronization remain unverified.

This closes a dependency discovered before serializer output migration. Existing
OFOPXMLHelper host pairs, package properties/relationships, CachedOutputStream,
XOutputStream export ownership and complete DOCX/XLSX model/filter/Worker/UI
acceptance still require further integration. The current block does not change
browser open/save, autosave or recovery behavior.

Verification passes five focused tests with unchanged whole-two-owner coverage100:
statements45/45, branches14/14, functions17/17 and lines44/44. Related compound/
Sequence/metadata/package tests pass42 scenarios; Writer resources pass two.
Typecheck, production build, static smoke, source/module/provenance/registry,
JSDoc, file-size, lint and formatting checks pass. These bounded checks do not
verify a package relationship service or complete DOCX/XLSX acceptance.
