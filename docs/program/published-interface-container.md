# Published interface container

The original published OInterfaceContainerHelper, OInterfaceIteratorHelper,
Type/signed32 multi-container specializations and Type-key OBroadcastHelper now
retain their original owners. They are direct prerequisites of the original
cppu property-set/state helpers used by the UNO PropertyBag service.

A singleton owns an acquired raw interface pointer. A list owns a vector of
actual UNO References. Iterators acquire a singleton, or share the vector until
mutation transfers the old vector to the iterator. A second iterator first
forces a copy, preserving both snapshots. Removal tries raw identity first,
then actual UNO root identity. Duplicates are removed one at a time. No newer
COW container is substituted for these distinct published contracts.

Disposal clears the live container before querying/calling listeners, preserving
new registrations made by callbacks. It swallows only RuntimeException.
forEach queries the actual declared facet outside its callback catch; it catches
only DisposedException, and removes the listener only for matching Context.
The method-pointer notifyEach adapter preserves the actual listener receiver.

The Type multi-container owns copied Type keys. The signed32 specialization
allocates its map on first addition. Both keep empty child containers and key
insertion order, return actual native key sequences excluding empty children,
and snapshot child pointers before disposal callbacks. OBroadcastHelper keeps
its original disposed/in-dispose registration/removal guards.

Native borrowed OSL Mutex fields/arguments and synchronous lock scopes are
explicitly erased. No no-op lock or successful substitute synchronization API
is introduced. Callbacks and logical owners stay within one JS realm; physical
shared-memory multithreading, ABI and STL allocator traces remain unqualified.
All consumed owners remain together in the original source-file structure.

Four original IfTest entry points retain all original assertions: create/dispose,
enumeration, Type and signed32 doContainerTest. Native mutex syntax is erased;
actual generated values, references and weak components are used. The fifth
entry point for generic Var remains unported with that unconsumed template.
Added cases separately cover simultaneous iterators, actual reference counts,
reentry, exceptions, stable child identities and broadcaster flags. This is
partial upstream QA replay, not complete-suite parity or compiled differential.

CALC-549/WRITER483 records original null acceptance/count inconsistency and an
undefined null dereference during singleton collapse. Defined public null
insertion is qualified; undefined native input is not repaired into a no-op.

Property-set/notification/state helpers, the separate UNO PropertyBag service,
SfxDocumentMetaData and full DOCX/XLSX core/shell/UI acceptance remain unfinished.
