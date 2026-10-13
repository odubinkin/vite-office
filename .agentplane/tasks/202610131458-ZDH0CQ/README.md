---
id: "202610131458-ZDH0CQ"
title: "Implement original Calc formula result state owner"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-13T14:59:53.160Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: full original ScFormulaResult state/query/hybrid owner over actual existing peers, preserve legal value/cache/error/matrix transitions with GC refs and no memory manager."
events:
  -
    type: "status"
    at: "2026-10-13T15:00:01.401Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: full original ScFormulaResult state/query/hybrid owner over actual existing peers, preserve legal value/cache/error/matrix transitions with GC refs and no memory manager."
doc_version: 3
doc_updated_at: "2026-10-13T15:00:01.401Z"
doc_updated_by: "CODER"
description: "Iteration89 actual ScFormulaResult over real existing tokens/matrices/shared values, cached results and hybrid import transitions for ScFormulaCell/UI/ODS; ordinary JS refs, no memory manager."
sections:
  Summary: "Iteration89 actual ScFormulaResult state owner for ScFormulaCell and ODS cached formula results."
  Scope: "Extend original sc/inc/formularesult and core/tool/formularesult owner over existing FormulaResultValue and actual shared/Calc tokens/matrices. Implement default/token/copy constructors, Assign and assignment adaptation, original reset/scalar resolution/matrix updates, complete queries/results/errors/multiline cache and hybrid import setters/SetMatrix. Ordinary JS refs replace refcount/None-policy/union physical ownership; parallel ownership fixup becomes no-op, no manager. Preserve public-state/cache/error precedence and copy/alias behavior. Group GetErrorOrDouble output refs. In three result/error query bodies specialize provably unreachable direct svError token and non-token string guards: ResolveToken always consumes scalar error tokens, and GetType returns svDouble for non-token non-empty/non-error states. Prove these from original complete methods rather than force private/native invalid state or ignore coverage. Native full genuine result class/source over verified matrix/token scopes, complete stream fixtures/tests/helpers; existing runtime/provenance records, new capability, Calc docs/GC adaptation/journal. Source-shaped shard only if measured size requires it, no duplicate model/fake ScFormulaCell/document/engine. Full document/storage/UI/ODS remain later owners."
  Plan: "Real ScFormulaResult state/query/hybrid owner, reused actual token/matrix/value dependencies and GC refs. Original cache/error/empty/type/copy/matrix transitions retained; only proven impossible guards specialized without fake states or coverage ignores. Full original native streams, whole Calc/shared raw100,16gates and inventory/exact review; actual ScFormulaCell/document/UI/ODS next priority, full91."
  Verify Steps: |-
    1. node scripts/calc-formula-result-native-probe.mjs --check and complete native stream replay with default/scalar/error/empty/string/hybrid/matrix/unsupported actual tokens, type/error/cache precedence, copies/assignments/self-assignment, matrix dimensions/result updates/borrowed aliases, GetResult/GetErrorOrDouble output preservation, multiline cache and all hybrid import transitions. Original full scopes/genuine dependencies, no fake peer, native count output or sanitizer. Document reachable-state proof for removed redundant legacy guards.
    2. node output/playwright/task89-checks/portable.mjs whole Calc and full related shared owners/tests raw S/B/F/L100 every raw counter positive, four original links absent/restored, static and actual Calc browser profile. No Writer-only repair/threshold weakening.
    3. node output/playwright/task89-checks/gates.mjs all16repository/tooling/inventory gates and current provenance/capability/docs/journal.
    4. Exact current/committed non-task hashes and same-agent separate EVALUATOR, canonical DONE/clean calc. Full ScFormulaCell/document/storage/editing/UI/ODS remain pending, original QA unexecuted context, native ABI/invalid casts/refcount/concurrency not certified; next full91.
  Verification: "Pending implementation."
  Rollback Plan: "Revert intentional task89 changes through a new task only; no merge or history rewrite."
  Findings: "Real matrix token dependency is present from88. Original GetResult non-token string guard cannot be reached after isValue(GetCellResultType), by GetType precedence. Scalar svError token storage is immediately resolved to mnError/mfValue; only matrix upper-left can yield svError after mnError NONE. GC removes physical token policy fields and fixups, preserving all value/copy/default behavior. Existing shared SAL/SVL cleanup boundary remains unchanged."
id_source: "generated"
---
## Summary

Iteration89 actual ScFormulaResult state owner for ScFormulaCell and ODS cached formula results.

## Scope

Extend original sc/inc/formularesult and core/tool/formularesult owner over existing FormulaResultValue and actual shared/Calc tokens/matrices. Implement default/token/copy constructors, Assign and assignment adaptation, original reset/scalar resolution/matrix updates, complete queries/results/errors/multiline cache and hybrid import setters/SetMatrix. Ordinary JS refs replace refcount/None-policy/union physical ownership; parallel ownership fixup becomes no-op, no manager. Preserve public-state/cache/error precedence and copy/alias behavior. Group GetErrorOrDouble output refs. In three result/error query bodies specialize provably unreachable direct svError token and non-token string guards: ResolveToken always consumes scalar error tokens, and GetType returns svDouble for non-token non-empty/non-error states. Prove these from original complete methods rather than force private/native invalid state or ignore coverage. Native full genuine result class/source over verified matrix/token scopes, complete stream fixtures/tests/helpers; existing runtime/provenance records, new capability, Calc docs/GC adaptation/journal. Source-shaped shard only if measured size requires it, no duplicate model/fake ScFormulaCell/document/engine. Full document/storage/UI/ODS remain later owners.

## Plan

Real ScFormulaResult state/query/hybrid owner, reused actual token/matrix/value dependencies and GC refs. Original cache/error/empty/type/copy/matrix transitions retained; only proven impossible guards specialized without fake states or coverage ignores. Full original native streams, whole Calc/shared raw100,16gates and inventory/exact review; actual ScFormulaCell/document/UI/ODS next priority, full91.

## Verify Steps

1. node scripts/calc-formula-result-native-probe.mjs --check and complete native stream replay with default/scalar/error/empty/string/hybrid/matrix/unsupported actual tokens, type/error/cache precedence, copies/assignments/self-assignment, matrix dimensions/result updates/borrowed aliases, GetResult/GetErrorOrDouble output preservation, multiline cache and all hybrid import transitions. Original full scopes/genuine dependencies, no fake peer, native count output or sanitizer. Document reachable-state proof for removed redundant legacy guards.
2. node output/playwright/task89-checks/portable.mjs whole Calc and full related shared owners/tests raw S/B/F/L100 every raw counter positive, four original links absent/restored, static and actual Calc browser profile. No Writer-only repair/threshold weakening.
3. node output/playwright/task89-checks/gates.mjs all16repository/tooling/inventory gates and current provenance/capability/docs/journal.
4. Exact current/committed non-task hashes and same-agent separate EVALUATOR, canonical DONE/clean calc. Full ScFormulaCell/document/storage/editing/UI/ODS remain pending, original QA unexecuted context, native ABI/invalid casts/refcount/concurrency not certified; next full91.

## Verification

Pending implementation.

## Rollback Plan

Revert intentional task89 changes through a new task only; no merge or history rewrite.

## Findings

Real matrix token dependency is present from88. Original GetResult non-token string guard cannot be reached after isValue(GetCellResultType), by GetType precedence. Scalar svError token storage is immediately resolved to mnError/mfValue; only matrix upper-left can yield svError after mnError NONE. GC removes physical token policy fields and fixups, preserving all value/copy/default behavior. Existing shared SAL/SVL cleanup boundary remains unchanged.
