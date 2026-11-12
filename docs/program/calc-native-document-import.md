# Native import cell transfer and workbook setup

ScDocumentImport now represents all four native setFormulaCell overload paths:
source with an optional numeric cache, source with a Unicode hybrid-string cache,
an owned ScTokenArray and a raw ScFormulaCell pointer. Every non-null formula goes
through the actual document CheckLinkFormulaNeedingCheck. The token-array path
uses the original constructor default GRAM_DEFAULT; source input keeps its
explicit grammar. Neither cached result clears the original dirty flag.

The raw-pointer setter unshares an overwritten formula through the actual mdds
position and SharedFormulaUtil before insertion. Source/token overloads retain
their original distinct order and do not gain an extra unshare repair. The
owned-token overload releases its local array on target rejection, while a
rejected raw cell remains caller-owned. For allocated source/token cells the
native unique_ptr release happens before the storage call; no post-transfer
exception cleanup is added. Physical token/array destruction remains subject to
the existing GC binding, not a new smart-pointer manager.

ScFormulaCell now has the original clean empty constructor and default grammar
arguments, plus the SetHybridString forwarder to its actual ScFormulaResult.
Initial native UI grammar resolves its reference convention from the real
document, as in SetGrammarAndRefConvention. Existing supported conventions retain
their prior lexer. Full symbol-map/localization and later unspecified-convention
transitions remain unported; unsupported conventions still reject. The existing
array parameter is the owning-pointer binding; the separate native const-array
constructor is not certified here.

The import owner also appends actual ScTable instances without editing-side
reference/name-update transactions, exposes its sheet count and assigns the
origin date directly to the existing document options. It does not substitute
the broader SetDocOptions formatter-update path. This core profile already owns
its options; native nullable-options construction remains outside this slice.

fillDownCells bulk-copies only numbers and SharedString values, exactly as in the
source. It uses the native cached GetCellValue overload, existing vector storage
and mdds range insertion. Shared-string temporaries release after copying;
numeric storage retains signed zero and encoded error NaNs. Empty, formula and
rich-text sources retain the source no-op behavior. Numeric-script/text-width
metadata and formula listeners remain deferred until existing finalization.

Tests use actual documents, sheets, typed stores, formula groups and caches.
Valid precompiled single-argument WEBSERVICE tokens exercise only the existing
link-inspection flag; they are never evaluated or sent to an external service.
No parser/service/allocator or private graph is replaced to manufacture cases.
The inspected sc/qa tree has no direct ScDocumentImport test. Broader native
formula grouping and filter fixtures remain separate obligations, not claimed
ported by the new critical-owner tests.

Full style/Latin-format hints, matrix/data-table/merge/visibility import,
outline/cache finalization, workbook buffers and complete XLSX/DOCX filter/UI
acceptance remain required. This checkpoint does not certify full import-owner,
workbook or native ABI parity.
