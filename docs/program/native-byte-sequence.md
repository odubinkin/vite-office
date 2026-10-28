# Native SAL ByteSequence and UNO sharing

The original SAL byte-sequence C operations and rtl::ByteSequence owner are now
represented over the existing sal_Sequence record. Default empty storage remains
separate from UNO's empty sequence. No-default allocation does not certify values
of indeterminate bytes. Initialized byte copy, COW, reference counts, equality,
shared zero-tail growth, unique-prefix resize, copy/adopt and transfer/null move
semantics preserve the pinned source rules. Allocation resource failure, physical
realloc addresses, undefined pointers/bytes and native binary ABI remain unverified.
Original wrapper bad-allocation checks are retained; tests do not inject an
allocator or private state to reach native allocation-failure branches.

The compiler binding for the address of sal_Sequence.nRefCount is shared by SAL
and CPPU. The existing UNO empty initializer still owns its original {1,0,{0}}
record and returns that same live field address. This moves ordinary addressed
count storage out of the CPPU-only helper without introducing another sequence,
count/default factory or value provider. Actual UNO construction/reallocation,
copy and destruction continue to use their existing real source owners.

Original toUnoSequence retains the exact ByteSequence record and elements. Its
reinterpret-view copy lowers to real OSL acquisition plus the existing native
Sequence adopt constructor. It neither rebuilds bytes nor allocates another
sequence header. Actual SAL/UNO COW and lifetime tests exercise both directions
of handle sharing and the empty shared count.

A reproducible native probe compiles unchanged original ByteSequence C and inline
C++ bodies, original SAL allocator bodies and the original GCC-builtin OSL atomic
branch. Platform declarations and unused diagnostics are bound explicitly; no
replacement allocator/byte-sequence/UNO behavior is supplied. The committed
initialized-domain trace records input source hashes and matches actual runtime
counts, byte values, copy/COW and moves. It is not a full native UNO, allocation
failure, ABI, threading or service certificate.

CALC-367 / WRITER242 preserve the original zero-length COW branch that omits old
reference decrement. CALC-368 / WRITER243 record a conditional retaining-sink
aliasing concern in the original serializer cache; that source observation is
separate from this byte-owner witness. Connecting the real cache and
XOutputStream/package output owners remains pending, as do complete DOCX/XLSX
model/filter/Worker/UI import/export and reopen. Existing browser file,
autosave and recovery policy is unchanged.

The final profile passes107 related SAL/UNO/stream tests. Its unchanged seven-owner
coverage100 gate fails statements374/379 and branches179/187, with functions93/93
and lines342/342. Retained native allocation-failure checks are not reached by
replacing allocators or forcing private state. Five whole-file existing/header
owners are100 in the same map; this does not make the full profile pass.
Actual OOXML package and ODT/ODS worker regressions pass47 tests, tooling five
and Writer resources two. Typecheck, build, static/module/source/provenance/
registry/resource checks pass. Full suites remain on the approved ten-completed-
task cadence; this checkpoint does not finish the DOCX/XLSX epic.
