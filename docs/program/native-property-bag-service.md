# Native property bag service

The actual OPropertyBag UNO service now registers the pinned comphelp.component
implementation and constructor in the existing browser registry. Generated
PropertyBag.createDefault/createWithTypes helpers use the real context and
ServiceManager; the constructor ignores arguments and the manager performs
XInitialization once for the argument-bearing constructor.

One actual weak root serves XPropertyBag, XModifiable, XServiceInfo,
XInitialization, XSet and the original property/state facets. The original
weak-first query order, concatenated twelve-type list, obsolete empty identifier,
non-interface broadcast-base lifetime and reverse destructor order are retained.
No additional property model, fake provider or metadata service is registered.

Initialization accepts the original positional or NamedValueCollection forms.
Allowed types use the original terminated UTF16 type-name comparison and union;
empty-name permission remains sticky across repeated initialization. Absent named
automatic-addition arguments retain the previous flag. CALC-554/WRITER488 document
these potentially surprising source semantics without changing them.

The source prime1009/seed11 handle cycle and subsequent linear search remain.
Allowed-type validation precedes low-level validation in the original order.
Default-void properties use the original XSet::insert(Property) workaround;
Property.Handle is ignored and the other XSet operations remain deliberately
empty/unsupported. Property info snapshots survive later insertion/removal.
Property access copies/sorts native input, checks unknown names, optionally adds
properties with the requested initial default and keeps the original -1 handle
for those newly inserted properties. Existing multi-property overloads still use
the published helper. MAYBEDEFAULT gates state comparison. True modifications
notify even when already true; false assignments do not notify. The event hook
runs before bound filtering and notification suppression skips it.

NamedValueCollection owns native Unicode keys and Any values. Constructed maps
use last-duplicate precedence; static sequence lookup uses first-match precedence.
Missing typed values leave output untouched; actual UNO assignment performs
conversion or raises the exact original IllegalArgumentException. Property output
constructs complete generated structs, resetting Handle0/StateDIRECT even in
reused slots. Const NamedValue/PropertyValue projections borrow actual initialized
sequence fields, and generated copy/assignment/equality use those fields directly.
Unordered physical bucket order and unconsumed generic template wrappers are not
advertised. C++ std::sort physical move/acquire traces and native allocator ABI
remain unqualified; actual UNO values and input COW ownership are retained.

Adapted qadevOOo XPropertyAccess before/get/set checks run against a configured
String property. Source getter membership and setter success/error criteria are
retained, with an independent stronger stored-value assertion. The Java proxy
harness is not ported. XPropertyContainer source QA was inspected: Java null-object
and removal assumptions do not match this service configuration; no passing full
port is claimed. Authored tests cover initialization, typed failures, defaults,
listeners, snapshots, inherited facets and more than1008 unique handles.
Chromium main and DOM-free Worker run the same production registered service.

Native OSL mutex scopes and physical C++ MI/ABI/shared-memory scheduling remain
unqualified, with no successful lock substitute. SfxDocumentMetaData, document
SAX/storage facets and final DOCX/XLSX core/shell/existing UI acceptance remain
unfinished. This checkpoint supplies a required shared document-property service.
