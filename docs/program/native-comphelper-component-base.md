# Public component ownership for document metadata

Public comphelper helpers are distinct from the existing internal cppuhelper URE
copies. WeakComponentImplHelper/Base and WeakImplHelper/Base preserve their
original interface/query order, independent static class_data and Type sequences,
actual weak identity, default empty implementation IDs and virtual disposed flag
on the same receiver. Physical multiple inheritance and mutex tokens are erased
by the existing synchronous class binding; no mutex token, extra state owner or
positive UNO provider is fabricated.

Component disposal sets the flag before invoking the hook, then notifies the
snapshot. Hook failure retains the flag and skips remaining notifications.
Late registration is ignored. disposeOnDestruct is a separate protected source
API: only an explicitly opting-in concrete destructor calls it. It checks the
zero native reference count, marks disposed, takes the original guard acquisition
and invokes the hook without sending event notifications or undoing that guard.
The public base destructor itself does not call this API. The plain weak helper
never advertises XComponent.

Public container4 has its own lazily initialized DEFAULT singleton, reverse COW
iterator/snapshots, original identity erase, complete defaulted moves and listener
release. Its extra forEach/notifyEach overload catches other UNO exceptions by
value and invokes the zero-argument exceptionFunc. The actual base catch parameter
is separate from the active original thrown value. A single platform-neutral
compiler catch scope lets getCaughtException retain that original dynamic class,
then restores the enclosing scope. The browser ABI consumes that same compiler
state; core owners never import a browser adapter. DisposedException retains its
earlier matching-Context removal path; non-UNO failures propagate.

Critical tests use real listeners, References, Type/Any values, COW sequences and
weak component lifecycle. The complete four-scenario TestInterfaceContainer2::test1
caller is replayed against the public version4 template, explicitly adapting only
the template selection and erased lock syntax; the original helper2 port remains
in the related run. Native shared-memory interleavings, physical ABI, static
shutdown, allocator exhaustion and native noexcept process termination are not
certified. This implements direct metadata dependencies; actual property-bag,
SfxDocumentMetaData and full DOCX/XLSX core/shell/UI remain unfinished.

The real Chromium qualification also runs public component/plain listener helpers
in both main and DOM-free Worker realms. It observes one notification with the
actual component Source, ignores late registration/repeated disposal, and retains
the original three default component Type entries. No fake lifecycle/provider
or native pointer crosses realms.
