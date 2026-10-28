# Model and controller SDK contracts

The OOXML filter base requires an actual `XModel` and an actual
`XMultiServiceFactory` on its document component. Its model queries and controller
locking must use those original interfaces before the Writer and Calc filters can
be connected to the existing file UI.

The model SDK declaration graph now includes thirteen complete interfaces:
`XModel`, `XController`, `XFrame`, `XFramesSupplier`, `XFrames`,
`XFrameActionListener`, `XWindow`, and its six event listener interfaces.
Declarations retain their original direct bases, Reference/Sequence/Any/string
contracts and normal CPPUMaker cached type getters. Existing `XComponent`,
`XEventListener` and `XIndexAccess` owners supply the shared base types.

Eight event/rectangle files declare the original IDL fields and inheritance only.
They do not implement generated value construction, copying, destruction, binary
layout or struct type metadata. `FrameAction` preserves its eight ordered literal
values; its generated enum type getter remains unported. No incomplete model,
controller, window, listener or event object is instantiated as a substitute for
its native implementation.

Targeted tests inspect every new interface's actual shared CPPU Type, original
name, direct base and acquired descriptor lifetime. Type checks cover all XModel
and XController methods and the frame/window attachment boundary. These checks
are declaration evidence, not an independently compiled native SDK differential
or complete component behavior evidence.

The remaining integration requires concrete SfxBaseModel/ScModelObj XModel and
factory ownership, model entry guards, controller locking and undo, FilterBase
model admission, workbook context and the native DOCX/XLSX filter paths. Existing
Open/download UI round trips remain pending. Registered browser autosave, recovery
and file UI decisions are unchanged.

## Model component ownership

SfxBaseModel and ScModelObj now use the actual shared WeakImplHelper and the
same-identity SfxListener role. Only their fully implemented XChild interface is
declared at this stage. The original complete interface list remains pending;
XModel and XMultiServiceFactory queries do not receive substitute implementations.

The native parent getter copies an acquired Reference and requires initialization.
The setter permits assignment before initialization. Both preserve the original
ordered disposed/initialization entry checks. Actual generated UNO exceptions
retain an empty message and the real model Context. The synchronous binding
inlines the guard entry check; it does not implement native SolarMutex behavior.

The model's weak base revokes weak references before most-derived destruction.
Calc removes its actual document registration; model data and parent ownership
are destroyed before the SfxListener base releases shell registrations. The
existing explicit Dispose method remains a C++ destructor binding, separate from
the unported UNO close/dispose workflow. Disposed-branch tests observe this host
binding rather than claiming calls on destroyed native C++ instances.

SfxModelSubComponent borrows the same model and delegates reference counts and
entry checks to it. Tests use real model/shell/document owners and the existing
shared Reference, weak-reference, exception and type factories. Full native
interface registration, XModel/factory/controller/undo services, synchronization
and format/UI round trips remain pending.
