# Native OOXML package input

ZipStorage.openInputStream now returns an owned Reference<XInputStream>, including
an empty Reference for an absent part. The existing ZIP byte backend initializes
actual signed sal_Int8 Sequence cells at the package boundary and constructs the
existing real SequenceInputStream component. Separate opens have independent
positions and retain their bytes across later output truncation. No substitute
query, sequence, stream component or service provider is introduced.

FragmentFilter and FragmentHandler expose that same input contract. XmlFilterBase
retains the original optional-fragment and lowercase-basename fallback, constructs
an actual InputSource with the resolved system identifier, and feeds the existing
expanded-name host SAX driver through Entity/XMLFile2UTFConverter. Caller-owned
input is released without implicit close. Actual caught UNO read exceptions are
destroyed before local input owners unwind. The expanded-name fragment receiver
is still a host binding; full native generated-token fragment services and the
StorageBase/component hierarchy remain unported.

OFOPXMLHelper accepts InputSource for relationships/content types as well as its
existing decoded-string binding. Writer OOXMLStreamImpl consumes relationship
streams through this path and returns real input Reference values for document
parts. Return values share the current input position. Its local XML decoder and
getDocumentXml shortcut have been removed. Member cleanup releases the parser,
locator and input; the VBA project intermediate and relationship-read failure
unwind now release their actual owners. Tests retain stream wrappers through
all document assertions and destroy each one once.

The existing host byte decoder handles UTF8/UTF16/UTF32 and available native RTL
legacy descriptors. Full libxml2 alias/diagnostic behavior is unverified. UTF16
signature fixtures now include an XML declaration for BOMless input instead of
relying on the removed permissive local decoder. Malformed-input/cancellation
fixtures contain enough bytes to reach native converter recognition. Explicit
short-prefix tests separately preserve CALC-363 / WRITER200: short accumulated
input can be discarded at EOF and the fragment can report success without a root.
This source behavior remains unchanged.

The ZIP backend is still a browser package binding, not the original complete
XStorage/XStream/XRelationshipAccess service hierarchy. In particular, native
XStream input-disconnection/getInputStream lifecycle, native ABI/synchronization,
constructor allocation failure unwind and complete generated UNO StringPair/SAX
services are not certified. Full DOCX/XLSX model/filter/Worker/UI import/export
and reopen remain pending. Existing browser open/save/autosave/recovery policy
is preserved.

The verified focused profile passes 156 tests. Five changed package/metadata/
Writer owners have 100% whole-file coverage in the same unedited map. The full
six-owner profile still fails the unchanged100 gate: statements 584/591,
branches 325/333, functions 110/110 and lines 533/535; remaining uncovered paths
belong to the existing shared SAX driver. No private-state injection, coverage
exclusion or threshold change is used. Related ODF/CSV tests pass 76 scenarios,
tooling eight and Writer resources two. Full suites remain on the approved
ten-completed-task cadence.
