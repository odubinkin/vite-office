# Native package transfer contracts

OStorageHelper.CopyInputToOutput now uses the pinned32000-byte do/while transfer.
If the input has ByteReader and the output has ByteWriter, it uses the original
raw-pointer path. Otherwise it allocates a genuine signed-byte UNO Sequence,
reads through XInputStream, resizes the final short value and writes through
XOutputStream. Both paths preserve a final zero-byte write for empty input or
an exact multiple of the buffer size. Neither flush nor closure is introduced,
and exceptions propagate to the caller.

The non-UNO byte bases now have explicit compiler RTTI declarations. Each actual
implementing class declares its corresponding unique-symbol identity; inherited
implementations inherit that declaration. Symbol.hasInstance lowers the original
dynamic_cast through these declarations. It neither probes method names nor
queries UNO, constructs a provider or maintains a registry of implementations.
SequenceInputStream/MemoryInputStream and OInputCompStream declare ByteReader;
UNOMemoryStream independently declares both byte bases. OSequenceOutputStream
retains its original lack of ByteWriter. The source raw stack array is represented
by scoped primitive uninitialized byte-address cells. Only the initialized prefix
returned by the reader is consumed. Native RTTI/vtable/stack allocation and ABI
are not certified by this compiler binding.

ZipStorage's explicit flat seekable-snapshot transport now transfers its actual
SequenceInputStream into the genuine UNOMemoryStream through this helper before
rewinding. It does not advertise the missing XStorage service or implement
OWriteStream/parent storage. Standard READ components are unchanged.

The complete published XTransactedObject, XTransactionBroadcaster and
XTransactionListener method declarations and normal generated type bindings are
available for the forthcoming write component. The listener retains its required
XEventListener base and the exact published commited spelling. Genuine
WeakImplHelper/Reference/container callers validate query identities and method
signatures; they do not stand in for a package transaction implementation.

CALC-499/WRITER430 records the original short-read completion convention.
CALC-500/WRITER431 records the historical published spelling. Neither behavior is
corrected. No direct CopyInputToOutput test was found in the pinned comphelper/qa
C++ sources; critical transfer boundaries, exact byte content, native errors and
real component integration are tested locally. Actual package transactions,
OWriteStream ownership, services and full DOCX/XLSX model/filter/Worker/UI acceptance
remain unfinished. Browser file/autosave/recovery policies are unchanged.
