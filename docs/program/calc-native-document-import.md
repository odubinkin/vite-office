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

## ODS package fonts

Calc reads font-face declarations through the shared xmloff context and attaches
font bytes after the same path, manifest, size and OpenType checks used by
Writer. The document owns the package resource records and the five native
embedding configuration flags. Successful resource import enables embedding.
With embedding enabled, ODS save writes the retained font-specific declarations,
font streams and manifest entries. The Worker retains the flags and validated
bytes. The browser package path covers fonts already in the document. Native
system font discovery and collection of used fonts by script remain outside
this path.

## ODS sheet writing direction

Calc reads the table-family writing mode through xmloff's original token map,
including the short ODF aliases. The sheet property applies right-to-left
layout for `RL_TB` and left-to-right layout for the other accepted modes.
During XML import, ScDocument defers the change through ScTable's loading flag
and applies it when parsing completes.

ODS export writes the resulting horizontal mode as `lr-tb` or `rl-tb`. The
Worker transfers the native sheet flag, defaulting to left-to-right for older
records. The original mixed-direction `cell-invalidations.ods` exercises both
directions. Drawing mirroring and tiled rendering remain outside this slice.

## ODS sheet background

Calc reads the table-family background color and transparency into the native
cell background item. It applies that item to the sheet's sparse default column
and allocated columns before applying cell styles. An explicit cell style can
replace the background, including with transparency.

The Worker transfers the resulting cell formatting. ODS export uses automatic
cell styles and the existing default-cell-style resolution for columns. Calc
preserves LibreOffice's handling of the table-family complex-color child.

## ODS database filter values

Calc stores text and background filter criteria as native color values. The
original automatic color is carried as a packed value through the Worker and
written as `window-font-color` for text or `transparent` for backgrounds.
The filter reads and writes numeric criteria with the RTL conversions and
keeps lexical criteria, including date strings, in their original form.

## ODS workbook structure protection

Calc adopts the native workbook protection owner after importing the sheets.
The spreadsheet and sheet protection owners share the original option and
verifier implementation. ODS export uses the native digest preference,
normalizes both accepted SHA-256 URIs to the original ODF output URI, and
preserves the extended legacy Excel double hash. The Worker preserves the workbook
state separately from sheet protection. The existing sheet insertion command
uses the workbook editability guard.

## ODS tracked cell content

Calc adopts the native change track after sheets and their cell values are
available. The original content action number, range, acceptance state,
previous cell, dependencies, author, comment and timestamp cross ODS and
Worker transport. Historical formulas use the native position, storage
grammar and matrix metadata. Historical edit cells share the workbook's
text styles. The track restores the latest content value from the actual
cell model when the document is imported.

ODS writes the original author/date anonymization under the two
Security/Scripting flags. The tracked changes key crosses the native
configuration settings item. Loaded row, column and sheet insertions keep
their native whole-axis ranges and dependencies through ODS and Worker.
Loaded deletion and movement actions retain source and target ranges, linked
and generated cell snapshots, multi-deletion offsets and cutoff references.
Interactive change recording and the accept/reject commands remain outside
this slice.
