# Native property array

The original complete IPropertyArrayHelper/OPropertyArrayHelper and anonymous
OPropertySetHelperInfo_Impl component now operate on actual generated Property
values and native shared UNO sequences. They are prerequisites for the separate
UNO OPropertyBag and document metadata. The low-level PropertyBag is not
registered as that service.

The array constructor copies either a sequence or initialized array/count.
Original nonconst sequence subscripts trigger COW even when only reading during
initialization. An incorrect sorted hint is diagnostic only: inversion still
sorts. The indexed-handle optimization applies only when all sorted handles
match their indexes, including the empty array. Sparse and negative handles use
the original linear scan. Missing lookups preserve output cells and throw the
actual UnknownPropertyException(name) where the original method specifies it.

The batch algorithm retains the source logarithm heuristic, cursor updates and
sorted-name assumptions. Its repeated-name behavior changes when it switches
between linear and binary search (CALC-548/WRITER482). No extra deduplication,
reset or corrected fallback is added. Tests cover empty/dense/sparse ranges,
below/between/above misses and both repeated-name branches.

PropertySetInfo owns its description snapshot independently of the helper. Its
actual WeakImplHelper implementation exposes the original XPropertySetInfo,
weak and root identities. Returned sequences retain native COW; descriptors are
owned generated copies. The anonymous source class is exported only for the
compiler-erased same-owner factory binding. No placeholder OPropertySetHelper
class or substitute property provider is introduced. IEventNotificationHook is
only the original structural declaration, without a dispatch implementation.

Host sorting temporaries use actual generated Property copies and shared UNO
assignment. Native qsort bitwise permutation/refcount/move traces and duplicate
key selection, physical ABI and multithread scheduling remain unqualified.
The pinned cppuhelper QA tree and bounded comphelper/qadevOOo searches contain
no dedicated OPropertyArrayHelper/fillHandles QA. Added cases are independent
source-backed contract tests; no upstream QA replay is claimed.

Property notification/set/state helpers, the separate UNO OPropertyBag service,
SfxDocumentMetaData and full DOCX/XLSX core/shell and existing UI acceptance are
still unfinished.

The capability upstream QA reference is the unchanged weak-owner dependency
`testReferenceDispose`, replayed in the related run. It does not represent
dedicated array/info QA or certify complete metadata/filter behavior.
