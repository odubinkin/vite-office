# Calc browser GC adaptation

## Token references and object lifetime

The user explicitly requires JavaScript garbage collection instead of reproducing C++ object memory management. Task82 removes the partial Boost intrusive_ptr runtime, its ADL hooks and FormulaToken's reference count, atomic operations, reference policy and delete-on-zero machinery. FormulaTokenRef and FormulaConstTokenRef are nullable TS aliases over ordinary JS references. FormulaFAPToken retains the original token directly and its clones retain the same identity. No allocator, smart-pointer replacement, weak reference or finalizer is added.

Token semantic type/opcode/value/equality contracts remain original-shaped. Payload Clone operations remain independent where the original copies values. Assigning a JS reference preserves identity and dropping one alias does not destroy an object retained elsewhere. Native count, pointer-copy/move bookkeeping and destructor timing are deliberately not runtime requirements.

Original C++ GetRef branches in token-array/compiler/interpreter code are not yet ported. When those owners are implemented, protect shared mutation with semantic copies or an otherwise demonstrated equivalent algorithm; do not fabricate GC reference counts or port native token-cache ownership merely to mirror allocation optimizations.

## Existing shared value boundary

SAL OUString and SVL SharedString are existing shared owners used by Writer and Calc. Their current value copy/move/assignment and explicit cleanup API remain unchanged in this focused task. Token dispose methods retain that shared-value cleanup boundary, not token deallocation; FAP cleanup never invokes cleanup of its original token. A migration of those shared owners would require its own actual-consumer audit. This checkpoint does not claim that every native-style lifetime API throughout the repository has already been removed.

## Evidence and inventory

The original native fixtures are unchanged. Classification, stack, constructor and empty/hybrid result comparisons explicitly remove only native token count/policy columns. Semantic flags, IEEE/error values, opcode/type queries, aliases, value copies and equality remain checked. Tests for the retired smart-pointer manager are replaced with live-alias and FAP clone behavior; no test forces collection or assumes deterministic GC timing.

Current Boost mechanism capability/runtime/provenance records are removed. Changed token/ref records declare the user-authorized browser adaptation and retain unverified broad parity flags. Historical task75/76 native lifetime evidence remains historical, not a claim about the new runtime.

The task's whole Calc/affected shared raw100, source-absent checks, repository gates and exact-source review are recorded in [the task README](../../.agentplane/tasks/202610130501-G2BDHD/README.md). At task82 completion the main Calc goal was paused; the user resumed it before iteration83.

## Scoped verification checkpoint

All125Calc tests36files and242directly affected shared tests48files pass with raw S/B/F/L100 and every statement/function/branch counter positive. Calc totals3080S2092B526F2721L; shared39executable owners4028S2063B829F3611L. Four original links are absent during portable checks and restored; static build and actual Calc browser profile pass with0UI scenarios. All16final repository/tooling/inventory gates pass, including36tooling tests10files and123inventory tests38files with configured coverage100. Initial stale evidence/retired-edge assertions were corrected and failed logs retained; runtime semantic tests needed no expectation weakening beyond the explicit native-memory field projection. Exact-source review and canonical closure are tracked by task202610130501-G2BDHD. The task82 pause was subsequently revoked by the user before iteration83.


### Matrix storage

Iteration83 introduces the original internal `ScMatrixImpl` storage/coordinate slice over existing shared mdds. It stores containers through ordinary JavaScript references. The C++ constructors debit a global `nElementsMax` allocation ledger, and the destructor credits it; these mechanisms are omitted because JS collection has no deterministic destructor schedule. No replacement counter, allocator, finalizer, weak-reference manager or memory-pool emulation is introduced. `Clear` remains an explicit content operation. The public matrix allocation-limit contract and interpreter binding are still unported and must be considered at their actual owner boundary, rather than implied by this internal storage slice. Existing shared-value cleanup APIs remain unchanged. Native observations compare initialized data/flags, dimensions/count, numeric queries and coordinate replication, excluding pool/refcount/destructor timing.


### Public matrix allocation policy

Iteration84 preserves the original64bit initial536870912-element default for each matrix. Zero by zero is valid, exactly one zero dimension is invalid, and division-based overflow validation precedes allocation. It deliberately does not deduct other matrices from a global budget or read `SC_MAX_MATRIX_ELEMENTS`; the browser has no native process pool or deterministic destructor schedule. This is an explicit resource-policy adaptation, not equivalence to the C++ live-allocation ledger. Native boundary observations are captured before any matrix exists. No native large allocation, memory pressure handling or GC timing is certified. Original constructor/Resize value fallback behavior remains unchanged, including CALC-072.


Iteration84 also corrects generic shared `delayed_delete_vector` scalar fill: ordinary assignments retain encoded NaN error values where `Array.fill` canonicalized them. The public matrix native replay covers actual MatrixSize538/StackOverflow514 behavior through shared storage. No memory manager or Calc-specific error representation is introduced in mdds.


Generic vector reserved slots are also initialized with `undefined`, matching the existing optional-slot representation, before scalar assignments. This prevents numeric array transitions from losing encoded errors during allocation/copy. The fix is in the shared owner and adds no error decoder, alternate number wrapper or memory manager.

## Formula result references and state invariants

Task89 ScFormulaResult retains original value/type/cache/empty/error fields
and ordinary references to actual token owners. No mbNoneRefCnt field,
IncRef/DecRef calls, policy checks or manual token deletion is added. Original
HandleStuffAfterParallelCalculation performs only removed native ownership
fixups and is a value-preserving no-op for JS GC. Clearing a native union into
a number drops the inactive JS token reference; shared token aliases survive.
Existing SAL/SVL value-copy/cleanup remains its separate current boundary.

Result/error query specialization follows actual public-state invariants.
ResolveToken consumes scalar errors, so with mnError NONE a svError cell
result only originates in a matrix upper-left. The redundant native direct
stored-error tests in GetErrorOrDouble/GetResult/GetResultError are removed.
The non-token string guard in GetResult is impossible after numeric
classification, since GetType returns svDouble when mbToken is false and
there is no error/empty flag. No coverage counter is ignored or invented,
and no private/native invalid state is forced to cover those guards.

Native complete source/class comparisons certify initialized public values
and identities, not physical memory layout/ownership timing, invalid derived
casts, assertions or native parallel policy handling. Actual stored matrix
formula tokens and interpreter transport inputs reuse original distinct
classes and dispatch responsibilities.

## Token array references and active buffers

Task90 FormulaTokenArray stores ordinary references to the real shared token
owners in nullable code/RPN arrays with original active lengths and flags.
Copies duplicate buffers while sharing tokens; logical moves transfer buffers
and zero source lengths, preserving other source flags. Finalization and the
8192token/ocStop boundary are logical contracts, not an allocation pool.
Physical reserve32/growth/unique_ptr/refcount/finalizer management is omitted.
Clear and deletion drop references; other token/array aliases survive.

Native replacement/removal uses GetRef to avoid useless RPN scans and stops
when only the old code reference remains. With ordinary references, scanning
actual RPN identities preserves value behavior: if a match exists it supplies
another native reference, and after GetRef1 no later match exists. Original
forward-index scanning after a removal is retained, including adjacent-token
skip CALC-079; no corrective deduplication or ownership ledger is introduced.
Typed_flags7f masks are implemented as native bitops. StandardRange keeps an
actual borrowed buffer and fixed end, with JS iteration adapting native
pointer traversal, without a custom pointer/iterator memory library.

Only active initialized slots and valid removal ranges are certified; native
tail/capacity, invalid UInt16 overflow ranges, vtable/layout, None-policy and
physical cleanup timing are outside parity. Existing SAL/SVL value cleanup
remains its current separate shared boundary.

## Reference token values and retained bounds

Task95 single/range tokens keep copied reference-data members and an ordinary shared reference to ScSheetLimits. Mutable getters return those exact owned endpoint objects; implicit copy/Clone creates independent data while retaining the same bounds owner. No native reference counter, destructor timing, weak reference, finalizer, pool or custom allocator is reproduced. Text/value comparison and receiver-bound behavior remain original. Native observations cover initialized values and logical member identity, excluding physical addresses and counts.

## Reference lists and structured-table areas

Task96 list tokens own ordinary arrays of initialized reference-data values. Native vector insertion is translated as explicit data copy, not shared element insertion; copies/Clone copy each value, while logical move transfers elements and preserves/empties the source collection owner. Physical vector capacity/reallocation and pointer arithmetic are excluded. List-object identity equality stays original. Table area tokens use ordinary retained references; copy/Clone invokes the actual area token Clone. No refcounts, smart pointers, weak references, finalizers, pools or memory library are added. Existing shared SAL/SVL cleanup remains its separate unchanged boundary.

## External token string and reference values

Task97 concrete external tokens are ordinary JS objects with copied UInt16 file-id/type and initialized reference-data values. SharedString member construction/copy/move uses the existing genuine shared value owner: ordinary string input is copied, explicit rvalue input is moved, and implicit token move clears only the original shared string member while reference fields remain. Stable borrowed string/reference getters and independent cloned value members retain original behavior. Existing SAL/SVL cleanup stays its separate unchanged boundary; no external token counts, ownership policy, pointer wrapper, allocator, pool, weak reference or finalizer is added. Native observations exclude raw counts/addresses/lifetime/ABI/memory and require real initialized concrete types.

## Range matrix and column cell-state values

Task98 RangeMatrix retains ordinary nullable ScMatrix references and six signed32 coordinate values. Copy/assignment share matrix identity and copy coordinates; logical move clears source matrix while retaining source coordinates, and self-move retains initialized value. No intrusive_ptr/counter/weakref/finalizer/library is introduced. Public field assignment uses JS bitops to preserve original scalar widths, independent from native physical memory/layout. Matrix-range tokens share matrix identity and own copied reference data; inherited identity comparison omits range. Column cell-state values are plain scalar fields with original row32/column16/stateUInt8/defaults. Existing shared SAL/SVL cleanup remains unchanged, native actual peer observations exclude counts/addresses/pools/lifetime/memory/ABI.

## Range operator cloning and native uniqueness

Task99 extendRangeReference retains original logical range construction/extension over actual value owners. Native bReuseDoubleRef additionally checks GetRef1 to mutate a uniquely owned double token instead of cloning. Ordinary JS references cannot supply that native ownership count, and the user explicitly forbids rebuilding ownership/count libraries. The browser implementation therefore always clones existing doubles, retaining the original hint argument without inventing uniqueness detection.

Explicit divergence: original unique-owner token identity and input-side mutation optimization are not reproduced/certified. Returned range values/flags/metadata and native clone-path input histories match. Native evidence covers bReusefalse and reusetrue with actual aliased C++ token owners, not a fake count setter or unique-lifetime experiment. No global token ledger, weak reference, refcount, pool, finalizer or custom allocator is introduced. This is a documented GC adaptation, not a suspected upstream defect or claim of full identity parity; original logical range/external/list behavior remains.

## Shared grid value settings

Task100 SvxOptionsGrid is one shared ordinary value owner: four UInt32 field parameters and three bool fields, original defaults, independent scalar copies and stable value updates. Native integer narrowing uses JSunsigned32 bitops; no SAL/allocator/ownership library, refcounts, pools, weakrefs or finalizers. Actual service/GUI/Calc-derived defaults are separate pending owners and must use this sharedbase rather than duplicate it. No native physical layout/lifetime or memory proof is claimed.

## Merge/filter/pivot attribute values

Task102 reuses the Writer/shared SfxInt16Item and SfxPoolItem directly for ScMergeFlagAttr. Native enum-to-signed16 storage conversion uses JS bit operations; copies/clones are ordinary value-owning objects. No duplicate integer/pool/refcount/allocator/Boost library is added. Original itemset transport follows the existing shared browser boundary. The diagnostic XML hook, native UNO/assertion/ABI behavior and real Calc document/filter pipeline remain unported or unverified.

## Merge span attribute values

ScMergeAttr uses the existing shared SfxPoolItem. Scalar copies/assignment and signed coordinate widths use ordinary objects/native JS bits; no count/pool/allocator library is added. The shared unsupported query default returnsundefined within the existing browser generic-value boundary; concrete overrides remain unchanged. This does not serialize merge spans or certify native Any/status/ABI; real ODS must use original filter/model span responsibilities. Original diagnosticXML remains unported.

## Cell protection and shared IDL values

Actual shared CellProtection owns four ordinary boolean fields; copies and output values are independent objects, no new memory/count/type-provider library. ScProtectionAttr uses the existing shared SfxPoolItem and existing browser QueryValue/PutValue unwrapped value convention. This is not a native Any/status/ABI binding and does not install a counterfeit UNO type provider. The original common unsupported PutValue false default is restored; descendant overrides remain runtime-identical. Original localized presentation/diagnostics/document/ODS integration stays pending.

## Configuration node lifetimes

Task105 configmgr nodes use ordinary JS references. Native SimpleReferenceObject inheritance, CreateStaticizedNodes, setStaticizedFlag, staticize and reference-count lifetime machinery are omitted under the user instruction to trust GC. NodeMap keeps actual mutable node aliases and deep clones through real node methods. Existing shared OUString/RuntimeException/Reference/SAL values are reused unchanged; this task does not add or certify their legacy lifetime internals. SortedVector supplies key order without a new STL allocator/tree engine. Native iterator/operator syntax is represented by stable first/second entries, undefined end and getOrInsert; no pointer/ABI/staticization/private-copy accessibility claim. Description omission in copies is observable logic and remains preserved.

## Localized configuration values

Task106 localized nodes use ordinary JS references and reuse the existing genuine CPPU Any/UnoType value owners. Independent Any copies and stable member identity preserve observable value behavior; no new lifetime/count/allocator/finalizer mechanism is added. Existing shared ownership internals remain unchanged. Native const borrowing/private-copy syntax is erased explicitly; callers retain the original read-only contract for getValue. The dynamic classifier uses original type metadata and assignability, including unsigned compatibility behavior, rather than inferring a schema type from a JS value. Actual services/backend remain pending.

## Configuration modification paths

Task107 modification nodes are ordinary JS objects. Existing SortedVector/ConfigEntry/LengthContentsCompare supply content-unique copied OUString keys and stable child values; no Boost hash/allocator/refcount/lifetime facade is added. Native unordered iteration permutation is not represented: actual writemodfile sorts children explicitly, but other traversal/callback order remains unverified. Additions is a pure native-array path-list type; actual consumers must implement value copies where original code copies vectors, not rely on JS assignment as a C++ copy. The original ENABLE_DCONF clear body is a logical value operation without a backend or build-conditioned API parity claim. Native invalid/dangling pointers, empty-remove assertions and ABI remain outside certified behavior.

## Configuration Data and set values

Task108 Data owns actual shared root/templates/modification/addition objects, and ExtensionXcu uses ordinary JS refs without SimpleReferenceObject/refcount inheritance. The actual add operation initializes layer before exposing its record; no native uninitialized default is invented. Existing SortedVector/config_map/NodeMap key/value contracts are reused. Native arrays erase vector references: actual Set clone and resolved path output explicitly copy OUString values; callers copy values when translating native vector insertion. Native implicit container copy/ABI/const/private-copy/logging machinery is not certified. Local std::u16string_view and OUStringBuffer temporary operations use exact native JS UTF16 strings without a new string-buffer, ICU or memory library. Public strings and output identities remain actual OUString owners. Type-only Data-to-Set binding avoids an eager class cycle, while template validation calls the actual Data implementation.

## XML byte views and accumulation

Task109 xmlreader Span is a shallow byte-view value and Pad accumulates token bytes with ordinary JS arrays. First stable input is borrowed, append flushes it, ephemeral bytes copy immediately and get returns independent span fields over the current backing. Native OStringBuffer capacity256/allocation/reallocation/address/ABI/postmutation borrowing is not emulated; no buffer allocation/ownership library, pool or finalizer is added. Strict UTF8 uses native TextDecoder with fatal:true and ignoreBOM:true because the original RTL flags reject malformed input and retain BOM. All scalar planes, all two-byte classifications and representative malformed longer sequences are source-backed runtime evidence, not a new converter/ICU port or compiled native/fullQA claim. Existing actual OUString and UNO exception values are reused unchanged.


## Shared configuration XML pull reader

Task110 ports the complete logical xmlreader event parser over actual shared Span/Pad/OUString/UNO values. Browser construction binds the native URL/file mapping to a copied URL and supplied private byte copy; native open/mmap/close/destructor/OS errors are not implemented or claimed. All three text modes, event/output timing, scoped/default/unknown/legacy xsi namespaces, attributes, references, permissive names/DTD skipping and root termination follow the pinned source. Numeric byte offsets and actual Uint8Array/DataView replace pointer syntax without ownership/capacity/refcount machinery. Helper shards operate this actual reader through an erased state type, without a second object. Fields use TypeScript protected visibility for cross-file implementation and unused-private diagnostics; native private access, deleted-copy enforcement, debug assertions, invalid ranges, pointer/address/ABI/postmutation borrow behavior and native file I/O are excluded. Out-of-range invalid native accesses retain host DataView RangeError, not a promised native outcome. Native JS single-byte parseInt hex conversion is checked for all256bytes; the source hex accumulation omission/sentinel, normalized CDATA prefix markup and attribute CR global peek remain unchanged and are recorded as CALC-094..096. The native hex overflow check is unreachable after valid0..15 digits or invalid-sentinel break and is source-reviewed rather than reproduced as a dead throw. Source-backed tests, not compiled native differential/full configuration QA. Configmgr schema/backend/defaults, Calc document/grid/ODS integration remain pending. Existing Writer SAX/document XML remains shared separately, as upstream does. Nextfull111 then requestedpause after relevant repairs; no Writer-only repair.


## Boolean cell-format values and shared bool items

Task112 implements the four false-default Calc bool cell attributes with IDs140/134/139/125 over the actual shared SfxBoolItem. Implicit copies retain sourceWhich, while Clone reconstructs fixedWhich from payload. Shared bool default factory/copy/Clone/unchanged SetValue/payload-only same-type equality/bool-only PutValue/uppercase parameter-driven OUString text follow original value scopes. Existing browser scalar QueryValue/PutValue transport is retained, without another UNO wrapper. Same-type bool equality ignoresWhich; item-set key identity remains separate. Host cross-type comparisons returnfalse outside the native asserted domain. Native bool instance/refcount/address cache is not ported under the requested GC adaptation. Existing legacy statuses/evidence/history remain, not new whole-module/native certification. Presentation/localization/XML diagnostics/native caches/debug/invalid downcasts/ABI and complete DocPool/document/configuration/UI/ODS integration remain excluded or pending. Actual Calc155tests/raw100 and affected Bool67tests/8files/raw100 pass after a new fixture range correction and one existing related shared equality expectation migration. No fake document/provider, native compilation, sanitizer or new ownership engine. Goal resumed active; next scheduled full121.
