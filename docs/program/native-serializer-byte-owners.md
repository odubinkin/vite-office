# Native serializer byte owners

CachedOutputStream now owns the original1MiB SAL ByteSequence with NODEFAULT,
retains its actual sal_Sequence record, writes initialized bytes through its raw
storage, and changes that record's nElements on flush. toUnoSequence supplies the
actual shared UNO byte value to output. Oversized writes construct independent
native values; the strict-greater-than threshold and empty flush calls remain.
The constructor binding releases its temporary SAL owner before passing an
independent oversized UNO value to the destination.

ForMerge owns its actual SAL sequence and postponed primitive vector. Merge uses
native realloc, backward prepend copy and initialized pointer copies. ForSort
owns actual native sequences per bucket, retains the current token on unknown
input, converts sorted PREPEND into APPEND and preserves duplicate schema entries.
Pop/merge obtains a native value copy before removing the stack entry.

The std::shared_ptr ownership of marks is lowered to an explicit private control
count attached to the local ForMergeBase object. This is a compiler ownership
binding, not a native object-layout or UNO identity claim. Stack and cache each
acquire/release their own references; failed flush before publishing a new
cache destination retains the previous owner. Last release runs the virtual
native member destructor. FastSerializerHelper destroys its moved serializer
even when endDocument throws. Direct serializer/cache users call dispose exactly
once. No mark-value owner is silently left to garbage collection.

ZipFragmentStream and the existing package output binding now consume genuine
UNO Sequence<sal_Int8> values. Uint8Array chunks exist only after the ZIP archive
transport copies those initialized bytes. Relationship XML is initialized as a
native value before reaching the same output contract. Test-only byte fixtures
use test/oox-output.ts; production has no fixture provider or fake UNO component.

WRITER137/CALC-303 now has a local SAL/UNO ownership witness: an output retaining
Sequence copies observes reused buffer bytes and later length changes. Preserve
this original raw-buffer reuse without a COW correction. Source-level lifetime,
empty-flag error state, escaping, mark order and DOCX font serialization tests
remain in place. No dedicated serializer/cache test was found in the pinned sax/qa
C++ sources; relevant existing translated expectations and critical new ownership
scenarios are exercised.

The output write operation remains the explicit existing package transport
binding. Full XOutputStream Reference ownership, OWriteStream/OWriteStream_Impl,
parent storage/transactions, service construction and complete DOCX/XLSX model,
filter, Worker and UI acceptance remain unfinished. Numeric/invalid-encoding,
physical allocator/ABI, native shared_ptr layout and debug-only stack guarantees
remain unverified. Browser open/save/autosave/recovery policies are unchanged.
