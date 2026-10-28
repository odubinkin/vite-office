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
