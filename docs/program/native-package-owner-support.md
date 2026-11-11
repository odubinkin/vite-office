# Native package owner support

OWriteStream depends on cppu::OTypeCollection and
comphelper::OMultiTypeInterfaceContainerHelper2. Their actual supporting owners
are now ported without creating an incomplete output stream or parent storage.

OTypeCollection retains all twelve original constructor arities, optional default
empty tail, input order and duplicate types. The native helper sequence is
constructed and populated through actual Type-field assignments. getTypes returns
a real Sequence value copy; implicit collection copy/assignment and destruction
retain the native COW ownership. The internal const-reference overload,
OImplementationId and physical allocation operators remain separate unported
responsibilities. The Reference query constructor also accepts the original bare
XInterface pointer independently of its target template type; direct ownership's
erased pointer is explicitly cast to its original root-query precondition for
identity comparison. These are type-only corrections, without changed query bodies.

OInterfaceContainerHelper2 preserves its original union: no interface, one acquired
raw pointer, or a vector of genuine Reference values. It is not implemented with
Helper3. Iterators borrow that vector until mutation or a second iterator detaches
it, and destroy detached snapshots themselves. Removal retains pointer-first then
root-identity comparison, duplicates, single/list transitions and reverse order.
getElements returns owned Reference copies; getInterface returns an owned Reference.
Every iterator must be destroyed before its container, as in the source contract.

Disposal detaches the container before querying/calling listeners, suppresses only
RuntimeException, and retains same-container reentrant registrations. Typed
forEach removes matching-context DisposedException listeners and suppresses other
DisposedException values without removing them. Other exceptions propagate.
Multi-type storage uses actual Type equality and retains empty keyed containers;
it snapshots container pointers before notification, so newly introduced keys
are not visited in that pass. A previously existing later container can still
observe registrations added by an earlier callback, as upstream.

The original mutex parameter/scopes are erased for synchronous calls, consistently
with existing Helper3/Helper4 ports. No mutex surrogate, query provider, parent
storage or service factory is fabricated. Native locking/concurrency, physical
union layout/ABI, allocation failure and complete package/write/model/filter/UI
acceptance remain unverified or unfinished. These modules are prerequisites for
OWriteStream, not a claim that its missing ownership graph is already connected.
Browser open/save/autosave/recovery policy is unchanged.

Tests translate both comphelper_ifcontainer::IfTest cases and all four scopes of
TestInterfaceContainer2::test1 from the pinned upstream QA, then exercise critical
snapshot, duplicate, null, reentrant and exception paths. OTypeCollection tests
cover all constructor arities with and without tails, copied collections and COW
returns. CALC-497/WRITER428 records null-insertion documentation versus behavior;
CALC-498/WRITER429 records the debug clear predicate. Both source behaviors remain.
