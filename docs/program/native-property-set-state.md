# Native property set and state

The consumed original OPropertySetHelper/2 and OPropertyStateHelper algorithms
now use the existing native Any/Property/Sequence owners and original published
listener containers. OStatefulPropertySet retains its actual OWeakObject root,
explicit type-provider query order and seven-type list. The actual non-interface
OMutexAndBroadcastHelper base subobject owns the broadcaster before dependent
property facets and is destroyed in the original base order.

The property helper preserves name/handle validation, readonly checks, ignored
unbound/unconstrained registrations, disposal registration guards, conversion,
veto-before-storage and bound-after-storage ordering. Native event sequences are
filtered by original attributes. Named listeners precede unnamed listeners and
multi-property callbacks. Source hook invocation precedes the zero-count return;
notification suppression skips the hook as well. Explicit current-value events
include all matching names and set old=new.

Dependent setters bypass readonly/veto checks and queue normalized events before
the initiating event. Pending vectors clear before callbacks. Single setters
notify the requested value but store its normalized value, unlike batch/dependent
paths (CALC-550/WRITER484). Unexpected ordinary exceptions serialize only the
Exception base; dependent capture retains dynamic type/members (551/485).
The two source catch blocks remain separate, including assignment order and
allowed-exception filters. Actual CommandFailedException Reason and Context
survive dynamic capture. Disposed setter flags remain diagnostic-only (552/486).

Property states compare actual current/default values with shared UNO equality.
Reset delegates to the ordinary setter. The base default remains VOID without
invented handle validation. Bulk lookup keeps the original forward-only cursor
and breaks on a missing name, leaving remaining native DIRECT_VALUE defaults
instead of the exception declared by IDL (553/487). This source behavior is
preserved and explicitly tested.

Const event field projections borrow actual initialized sequence storage, without
copying an event or Any. Generated SDK copy/equality accepts those real fields.
Any member calls remain nonvirtual at their actual C addresses. No event DTO,
parallel value store, inferred type/default provider or metadata service stub
is supplied.

Compiler multiple-inheritance binding specializes over the current actual
zero-argument weak roots, keeping one real weak count/identity. The helper's
propertySet_m_pReserved denotes OPropertySetHelper::m_pReserved separately from
OWeakObject::m_pReserved. An explicit self-cast token lowers the original base
initializer's this pointer without a mutable hook substitute. Concrete owners
qualify their base destructor order; readFastPropertyValue names only the
protected output overload. Native OSL Mutex/GetMutex/scopes are erased rather
than replaced with a successful lock API. Nonweak/argument-bearing root bindings,
physical C++ ABI/allocator/MI casts and shared-memory threading remain unqualified.
The separate source file keeps the complete array/info and property-set owners
within the authored file budget while preserving their original public inc path.

Tests include adapted qadevOOo XPropertyState's four and XMultiPropertySet's six
entry-point checks against actual configured sal_Int32 callers, plus original
unchanged listener-container dependency QA. Java proxy/event-idle harness and
other ValueChanger configurations are not claimed. The original weak QA criteria
remain visible: XMultiPropertySet's result accumulator never becomes false on
mismatch, and XPropertyState's reset comparison checks the first descriptor's
flag. Independent authored cases verify actual values, default transitions,
exception payloads, callback order and identity.

Actual Chromium main and DOM-free module Worker also run a concrete caller over
these real helpers: long42 storage, short42 notification from old41, actual Source
identity, initial states1/0 for A/missing, subsequent DIRECT state and seven
original types. This is helper qualification, not a registered metadata service
or complete file workflow.

The real UNO OPropertyBag service, SfxDocumentMetaData and complete DOCX/XLSX
core/shell and existing desktop/mobile UI acceptance remain unfinished.
