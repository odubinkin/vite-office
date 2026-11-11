# Native relationship result sequences

ReadRelationsInfoSequence now returns actual nested UNO Sequence<StringPair>
values. It uses the existing normal StringPair type and CPPU allocation, default,
copy, COW and destruction paths. The original outer growth, four-field row
allocation, ordered Id/Type/Target/TargetMode assignments and final row shrink are
retained. Field assignments use actual SAL string owners and exact UTF16 units.
The returned result owns its fields, including when XML parsing fails after a
partially initialized row.

The erased compiler lvalue binding Sequence.unacquired addresses an existing
initialized Sequence field. It constructs no value, acquires no reference and
introduces no separate destruction. Its borrowed view follows original COW and
reallocation pointer replacement. The native lifetime belongs to the enclosing
value; the TypeScript reference type omits dispose. This is a compiler/address
binding, not a new sequence, data, default or type provider.

Writer OOXMLStreamImpl scans these native rows and StringPair field views and
releases actual root/part relationship owners on success, failure and destruction.
The existing UTF16 URI boundary is retained. Ordered duplicates, Id-only entries,
external-ID cache, Strict/Transitional lookup and relative target behavior remain
covered by the existing Writer cases. New tests check genuine nested ownership,
COW, pointer replacement and destruction, together with the existing native
public Sequence lifecycle fixtures.

The pinned comphelper/source/xml/ofopxmlhelper.cxx is the algorithm source;
include/com/sun/star/uno/Sequence.h and Sequence.hxx define the actual value
operations. No dedicated OFOPXMLHelper test was found in the pinned comphelper/qa
or sw/qa C++ sources. Existing public Sequence native fixture replay remains part
of targeted validation; no new compiled native witness is claimed.

Content-type and output metadata still use their existing host pair contracts.
The synchronous SAX transport and shape-error envelopes, complete relationship
and storage services, physical ABI, allocation failures, thread behavior and full
DOCX/XLSX model/filter/Worker/UI acceptance remain incomplete or unverified. This
checkpoint does not alter deliberate browser open/save/autosave/recovery choices.

Targeted verification passes 62 scenarios in the six-file coverage profile and
27 scenarios in a separate related regression run; Writer resources pass two
scenarios. Whole changed-owner coverage is statements337/341, branches188/188,
functions59/60 and lines306/310. The uncovered code is the existing toUnoSequence
bridge, outside this profile. Every owner exceeds the user-authorized90 floor;
the initial unchanged100 threshold run correctly reports failure. No coverage
exclusion or production guard modification was introduced.

Typecheck, production build/static smoke, scoped ESLint/Prettier, module/source
boundaries, provenance/registry, file size, resources, doctor and routing pass.
The global JSDoc command reports two pre-existing errors in unchanged
apps/office/src/test/css-style-matchers.ts (lines17/76). These are recorded as
baseline failures; the overall documentation gate is not claimed green.
