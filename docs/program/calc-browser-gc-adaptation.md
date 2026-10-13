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

The task's whole Calc/affected shared raw100, source-absent checks, repository gates and exact-source review are recorded in [the task README](../../.agentplane/tasks/202610130501-G2BDHD/README.md). The main Calc goal remains paused.

## Scoped verification checkpoint

All125Calc tests36files and242directly affected shared tests48files pass with raw S/B/F/L100 and every statement/function/branch counter positive. Calc totals3080S2092B526F2721L; shared39executable owners4028S2063B829F3611L. Four original links are absent during portable checks and restored; static build and actual Calc browser profile pass with0UI scenarios. All16final repository/tooling/inventory gates pass, including36tooling tests10files and123inventory tests38files with configured coverage100. Initial stale evidence/retired-edge assertions were corrected and failed logs retained; runtime semantic tests needed no expectation weakening beyond the explicit native-memory field projection. Exact-source review and canonical closure are tracked by task202610130501-G2BDHD. Main goal stays paused.
