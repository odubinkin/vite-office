# Native UNO exception value transport

Generated exception objects now expose their actual inherited Message/Context
field addresses to the existing shared UNO compound-data operations. The fields
remain owned by the original Exception value. There is no shadow record,
exception factory, reconstructed prototype, inferred value type or second
reference count.

The old UnknownPropertyException and PropertyVetoException address helpers
returned a temporary Context pointer cell. Construction could read that copy,
but extraction wrote the temporary rather than the real member. Both overrides
are removed; the shared base exposes the genuine Reference address. Missing
base transport for RuntimeException and other fieldless descendants is also
resolved by that same inherited binding.

IllegalArgumentException.ArgumentPosition and DOMException.Code retain their
original signed16/enum scalar semantics while using stable addressed storage.
Copy/move assignments retain each destination member address. Implicit move
construction creates the new scalar cell and copies the source scalar, as the
original generated value does. WrappedTargetException and
WrappedTargetRuntimeException expose their existing owned Any member at its
actual logical field address. Existing SAX/UCB/script exception implementations
only gain required explicit base-override declarations; their field bodies are
unchanged.

Critical tests use actual generated exceptions and a real ActiveDataSink as
nonempty Context. They verify Any construction/extraction, unchanged failed
casts, base extraction, original Unicode/embedded-zero messages, scalar moves,
nested dynamic exception data and object lifetime through real weak references.
The obsolete RuntimeException shadow address Map in the existing native Any
replay test is removed: that complete source-captured caller now uses the actual
exception value directly. Existing import-order and native Any/Reference/CPPU
source replays remain part of focused validation.

This fixes local representation defects. It does not change upstream exception
logic, generated metadata/defaults, message content or ownership policy. The
logical LP64 address binding is not a physical C++ ABI or native allocator/thread
claim. The complete C++/binary UNO exception bridge remains unimplemented. The browser
now has an explicit [JavaScript exception ABI and registered DocumentBuilder](javascript-uno-exceptions-and-document-builder.md), with the original misc catch/throw
assertions qualified at that language boundary. Physical native ABI parity and
complete metadata/DOCX/XLSX/UI acceptance remain unfinished.
