---
id: "202610131543-CD8JQC"
title: "Implement shared formula token array storage and recalc state"
result_summary: "Implemented shared code/RPN defaults/copies/moves/edits/queries/finalization/8192stop/live ranges and recalc flags/priorities. Original alias traversal and moved-source flags preserved, CALC-079/080 and inventory/provenance/GC proof updated. No new memory/flags library or Calc-specific duplicate. Full array/ScTokenArray/ScFormulaCell/document/UI/ODS pending; goal active, next91full run."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-13T15:44:34.948Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-13T16:19:34.250Z"
  updated_by: "CODER"
  note: "Verified: original shared FormulaTokenArray storage/recalc family atf77a1b27249019fd9e2837d345cf18c0bebec47c. Normal463656/12009-byte streams/9commands, Calc132/shared250 all raw100, source-absent build/profile and16gates, exact3240hashes/13paths and same-agent separate EVALUATOR pass. Inventory/provenance/GC proof/CALC-079/080 updated, no runtime memory library. Actual ScTokenArray/formula cell/document/UI/ODS pending, goal active and full91 next."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-13T16:17:57.530Z"
  updated_by: "EVALUATOR"
  note: "Same-agent separate EVALUATOR: actual shared FormulaTokenArray initialized storage/recalc family with original live StandardRange and GC refs meets scoped Calc/UI/ODS prerequisite. Not independent review or full token/compiler/document completion."
  evaluated_sha: "f77a1b27249019fd9e2837d345cf18c0bebec47c"
  blueprint_digest: "76ba0068e1e034f21c2c13eb425e0adb023066e972430ca02bbaefddeb86798e"
  evidence_refs:
    - ".agentplane/tasks/202610131543-CD8JQC/README.md"
    - ".agentplane/tasks/202610131543-CD8JQC/quality/20261013-161757530-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610131543-CD8JQC/quality/20261013-161757530-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610131543-CD8JQC/quality/20261013-161757530-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610131543-CD8JQC/blueprint/resolved-snapshot.json"
    - "output/playwright/task90-checks/exact-review.json"
    - "output/playwright/task90-checks/value-coverage-audit.json"
    - "output/playwright/task90-checks/gates-results.json"
    - "output/playwright/formula-token-array-native/manifest.json"
  findings:
    - "463LO hashes/17Boost dependency headers,9positive normal native commands and complete463656-byte recalc/12009-byte array streams over unchanged selected original source/header scopes. Declaration scaffold/static compiler method only, no fake instantiated peer/full native layout or tail/count/sanitizer claim. Copy/move/finalize/8192stop/replace/remove/queries/live ranges and all256mode histories preserved; CALC-079/080 and GC RPN-gate proof recorded."
    - "Calc132tests43files raw3579S2400B658F3178L and shared250tests55files40owners raw4272S2147B897F3817L all100 every raw counter positive. Sources absent/restored, static/profile0UI and16gates/36tooling/123inventory pass after original Finalize case and provenance naming metadata correction; no threshold weakening. Exact3240current/committed hashes and13intentional paths, existing Writer/shared owners unchanged; two genuine new shared runtime owners and responsibility-split mapping registered."
commit:
  hash: "f77a1b27249019fd9e2837d345cf18c0bebec47c"
  message: "🧩 CD8JQC task: register original token array definition shard provenance"
comments:
  -
    author: "CODER"
    body: "Start: actual shared FormulaTokenArray code/RPN and recalc operation family needed by real Calc formula cell and ODS; existing token owners, original alias/copy/default logic and GC refs."
  -
    author: "CODER"
    body: "Verified: genuine shared FormulaTokenArray storage/recalc family and live StandardRange over actual token owners with ordinary JS refs. Native463656/12009-byte streams/9normal commands, Calc132/shared250 raw100, source-absent static/profile and16gates pass; exact3240hashes and same-agent separate EVALUATOR pass."
events:
  -
    type: "status"
    at: "2026-10-13T15:44:44.000Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: actual shared FormulaTokenArray code/RPN and recalc operation family needed by real Calc formula cell and ODS; existing token owners, original alias/copy/default logic and GC refs."
  -
    type: "verify"
    at: "2026-10-13T16:19:34.250Z"
    author: "CODER"
    state: "ok"
    note: "Verified: original shared FormulaTokenArray storage/recalc family atf77a1b27249019fd9e2837d345cf18c0bebec47c. Normal463656/12009-byte streams/9commands, Calc132/shared250 all raw100, source-absent build/profile and16gates, exact3240hashes/13paths and same-agent separate EVALUATOR pass. Inventory/provenance/GC proof/CALC-079/080 updated, no runtime memory library. Actual ScTokenArray/formula cell/document/UI/ODS pending, goal active and full91 next."
  -
    type: "status"
    at: "2026-10-13T16:20:42.559Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: genuine shared FormulaTokenArray storage/recalc family and live StandardRange over actual token owners with ordinary JS refs. Native463656/12009-byte streams/9normal commands, Calc132/shared250 raw100, source-absent static/profile and16gates pass; exact3240hashes and same-agent separate EVALUATOR pass."
doc_version: 3
doc_updated_at: "2026-10-13T16:20:42.560Z"
doc_updated_by: "CODER"
description: "Iteration90 direct prerequisite for genuine ScTokenArray/ScFormulaCell and ODS formulas: original shared FormulaTokenArray code/RPN ownership semantics, construction/copy/move/edit/query/finalization and recalculation state over actual tokens with JS GC."
sections:
  Summary: "Iteration90 shared FormulaTokenArray storage and recalc owner required by genuine ScTokenArray/ScFormulaCell and ODS formula storage."
  Scope: "New original formula/inc/tokenarray boundary and one source-shaped token.array class shard mapped to formula/source/core/api/token.cxx. Original code/RPN nullable buffers and active lengths; default/copy/logical move/copy and move assignment/Clear/Finalize/DelRPN; Add/AddToken/Double/String/Error; XML placeholder Assign with count witness; initialized RPN assignment; ReplaceToken/ReplaceRPNToken/RemoveToken; first/last/index/PeekPrev/opcode and reference/name/opcode queries; original ScRecalcMode constants and all flags/priority setters/getters. Reuse actual FormulaToken classes and ordinary JS refs, no capacity32/unique_ptr/refcount/pool/allocator/finalizer emulation. Preserve8192limit/ocStop sentinel, finalized rejection, alias behavior and initialized active contents, fixed16/8 widths. Refcount gates in replace/remove specialize to actual RPN identity scans, preserving original forward-index/adjacent-skip traversal; break when native refcount1 implies no further RPN matches. No native None-policy/undefined pointer or tail read. Genuine partial declaration scaffold for selected complete original source methods, original static compiler declaration/function only with no fake instance; no dummy document/token array peer. Complete fixtures/tests/provenance/capability/Calc/GC/journal updates. Full UNO AddFormulaToken/Fill/opcode jump builder/compiler/rewrites/range iterators and ScTokenArray/ScFormulaCell/document/UI/ODS remain later real owners."
  Plan: "Actual shared FormulaTokenArray code/RPN storage and recalc state for ScTokenArray/formula-cell/ODS prerequisites. Genuine tokens and GC refs, original finalize/8192bound/stop/shallowcopy/move/replace/remove/query/flag contracts; no fake peers/capacity/refcount library. Native selected scopes all initialized data, Calc/complete affected shared raw100,16gates/inventory/exact review, next full91."
  Verify Steps: |-
    1. node scripts/formula-token-array-native-probe.mjs --check and full original array/recalc stream tests: default/meta/recalc bits/priority, append/finalize/8192stop, shallow copy/transfer/reset/self assignment, XML placeholder initialized arrays, RPN aliases and replacements/removals including duplicate adjacency, query ranges/flags/opcode/reference/name and index output preservation. Complete unchanged selected source/inlines and genuine headers; no tail/undefined cast, native count output or sanitizer.
    2. node output/playwright/task90-checks/portable.mjs whole Calc plus complete new shared FormulaTokenArray and affected shared owner/tests raw S/B/F/L100 every counter positive, sources absent/restored, static and actual Calc browser profile. No Writer-only repair or threshold weakening.
    3. node output/playwright/task90-checks/gates.mjs all16repository/tooling/inventory gates and registry/GC invariant/journal/docs updates.
    4. Exact current/committed non-task hashes, same-agent separate EVALUATOR, canonical DONE/clean calc. Partial array operation family and native declaration scaffold explicitly bounded; full array/ScTokenArray/ScFormulaCell/document/storage/UI/ODS still pending, full91.
  Verification: |-
    Pass: actual shared FormulaTokenArray initialized code/RPN storage operation family, live FormulaTokenArrayStandardRange and original ScRecalcMode.463LO hashes/17verified Boost dependency headers,9positive normal native commands and complete463656-byte recalc/12009-byte array streams over selected complete unchanged original source/header bodies. Default/copy/transfer/move/copy assignment/reset/finalize/8192stop/edit/query/predicate/live range and all256byte/priority histories match. Declaration scaffold/static compiler function only, no fake instance/full native class layout/unsupported virtual API claim. JS refs omit physical reserve/unique_ptr/refcount/allocator/finalizer; RPN gate/break specialization proof preserves original forward-index adjacency skip CALC-079 and moved-source finalized behavior CALC-080. Initial genuine log include omission fixed; first shared250cases all passed but1Finalize statement/branch uncovered. Added meaningful original nonempty open Finalize history, native regenerated/checked and whole shared rerun, thresholds unchanged. Initial map read with zero location146, original log retained; Vitest replaced map before attempted full archive, final complete raw map is acceptance evidence. Calc132tests43files25owners raw3579S2400B658F3178L and shared250tests55files40owners raw4272S2147B897F3817L all S/B/F/L100 every raw counter positive. Four source links absent/restored; static and Calc profile0UI pass. All16gates/36tooling tests10files/123inventory tests38files configured100 pass after responsibility-split filenameDivergence added to existing new provenance record. Exact3240current/committed non-task hashes matchf77a1b27249019fd9e2837d345cf18c0bebec47c,13intentional paths. Existing Writer/shared owners unchanged; two real new shared runtime files registered. Same-agent separate EVALUATOR pass (not independent review), quality/20261013-161757530-recovery-context/quality-report.json. Evidence output/playwright/task90-checks/exact-review.json,value-coverage-audit.json,gates-results.json and formula-token-array-native/manifest.json. Full UNO/opcode/jump/compiler/rewriter/reference-range/ScTokenArray/ScFormulaCell/document/UI/ODS remain pending; native ABI/vtable/capacity/tails/None-policy/invalid ranges/physical lifetime/assertions/full QA unverified. Goal active, next task91 full run.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-13T16:19:34.250Z — VERIFY — ok

    By: CODER

    Note: Verified: original shared FormulaTokenArray storage/recalc family atf77a1b27249019fd9e2837d345cf18c0bebec47c. Normal463656/12009-byte streams/9commands, Calc132/shared250 all raw100, source-absent build/profile and16gates, exact3240hashes/13paths and same-agent separate EVALUATOR pass. Inventory/provenance/GC proof/CALC-079/080 updated, no runtime memory library. Actual ScTokenArray/formula cell/document/UI/ODS pending, goal active and full91 next.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-13T16:19:33.799Z, excerpt_hash=sha256:b75e1b12a9a6e3d8c2f3b10cf3bc8f803e2b3b70b5e489662ca1266c9cd0d5bc

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610131543-CD8JQC/blueprint/resolved-snapshot.json
    - old_digest: 76ba0068e1e034f21c2c13eb425e0adb023066e972430ca02bbaefddeb86798e
    - current_digest: 76ba0068e1e034f21c2c13eb425e0adb023066e972430ca02bbaefddeb86798e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610131543-CD8JQC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610131543-CD8JQC -m 🧩 CD8JQC task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert intentional task90 changes through a new task only; no merge/history rewrite."
  Findings: |-
    Default ScFormulaCell requires actual ScTokenArray, whose base FormulaTokenArray is absent. This installs real shared storage rather than inventing Calc-specific sequences. Copy constructor shares token identity but finalizes nonempty code. Move empties source buffers/lengths but retains its other flags. Native refcount1 stop conditions imply no remaining RPN match; removing those memory gates does not justify changing forward-index traversal. Uninitialized array capacity/tails and jump token code are outside this leaf.

    - Observation: First normal selected-array compile needs original sal/log.hxx for unchanged SAL_WARN/SAL_WARN_IF stream macros in RemoveToken after omitting unused full compiler header.
      Impact: Include/declaration scaffold omission only; no original behavioral assertion ran, selected source methods unchanged.
      Resolution: Include genuine sal/log.hxx and rerun normal capture, no fake warning macro/peer or altered source/verification.

    - Observation: Whole Calc132 passes; shared250tests55files all pass but strict raw coverage leaves Finalize nonempty/unfinalized true path unexecuted:4271/4272statements2146/2147branches, functions/lines100. Empty finalization and already-finalized copy tested.
      Impact: Meaningful original mutation transition missing from fixture, no runtime or Writer defect and no threshold change.
      Resolution: Add original Finalize on nonempty open source array to normal native stream and portable replay, regenerate/check fixture then rerun only affected whole shared profile and remaining source-absent static/profile checks. Preserve initial failure logs/counters.

    - Observation: Final tests/type/lint/build/raw100 pass. Four inventory/provenance checks fail on the same missing filenameDivergence entry for original token.cxx class shard token.array.ts; inventory122pass1fail.
      Impact: Registry naming metadata incomplete, no runtime/coverage defect and no new path or scope.
      Resolution: Add responsibility-split filenameDivergence to existing new source provenance record using established token.values/token.string pattern, recheck failed provenance/registry/invariant/inventory and formatting gates. Runtime/native/test evidence unchanged. Initial raw coverage map was read with location146zero counter before Vitest replaced it; retained initial log records totals and failure, final full raw map is acceptance evidence.

    - Observation: Final real shared array storage/recalc owner matches463656/12009-byte normal streams with463LO hashes/17Boost dependencies/9commands. Calc132/shared250 whole raw100, source-absent static/profile0UI and16gates pass. Exact3240hashes/13intentional paths matchf77a1b27249019fd9e2837d345cf18c0bebec47c; same-agent separate EVALUATOR pass.
      Impact: Required actual shared FormulaTokenArray base for ScTokenArray/ScFormulaCell/ODS established with real tokens, live ranges, original defaults/copy/alias/limit/edit/flag logic and GC refs. No extra memory/flags library or Calc-specific duplicate sequence. CALC-079/080 preserved; incomplete array/compiler/document/UI/ODS families remain explicit.
      Resolution: Record final verification and canonical finish90. Next scheduled91full run; no merge, Writer-only coverage repair or goal completion/pause. Runtime evidence unchanged by final provenance naming metadata correction.
id_source: "generated"
---
## Summary

Iteration90 shared FormulaTokenArray storage and recalc owner required by genuine ScTokenArray/ScFormulaCell and ODS formula storage.

## Scope

New original formula/inc/tokenarray boundary and one source-shaped token.array class shard mapped to formula/source/core/api/token.cxx. Original code/RPN nullable buffers and active lengths; default/copy/logical move/copy and move assignment/Clear/Finalize/DelRPN; Add/AddToken/Double/String/Error; XML placeholder Assign with count witness; initialized RPN assignment; ReplaceToken/ReplaceRPNToken/RemoveToken; first/last/index/PeekPrev/opcode and reference/name/opcode queries; original ScRecalcMode constants and all flags/priority setters/getters. Reuse actual FormulaToken classes and ordinary JS refs, no capacity32/unique_ptr/refcount/pool/allocator/finalizer emulation. Preserve8192limit/ocStop sentinel, finalized rejection, alias behavior and initialized active contents, fixed16/8 widths. Refcount gates in replace/remove specialize to actual RPN identity scans, preserving original forward-index/adjacent-skip traversal; break when native refcount1 implies no further RPN matches. No native None-policy/undefined pointer or tail read. Genuine partial declaration scaffold for selected complete original source methods, original static compiler declaration/function only with no fake instance; no dummy document/token array peer. Complete fixtures/tests/provenance/capability/Calc/GC/journal updates. Full UNO AddFormulaToken/Fill/opcode jump builder/compiler/rewrites/range iterators and ScTokenArray/ScFormulaCell/document/UI/ODS remain later real owners.

## Plan

Actual shared FormulaTokenArray code/RPN storage and recalc state for ScTokenArray/formula-cell/ODS prerequisites. Genuine tokens and GC refs, original finalize/8192bound/stop/shallowcopy/move/replace/remove/query/flag contracts; no fake peers/capacity/refcount library. Native selected scopes all initialized data, Calc/complete affected shared raw100,16gates/inventory/exact review, next full91.

## Verify Steps

1. node scripts/formula-token-array-native-probe.mjs --check and full original array/recalc stream tests: default/meta/recalc bits/priority, append/finalize/8192stop, shallow copy/transfer/reset/self assignment, XML placeholder initialized arrays, RPN aliases and replacements/removals including duplicate adjacency, query ranges/flags/opcode/reference/name and index output preservation. Complete unchanged selected source/inlines and genuine headers; no tail/undefined cast, native count output or sanitizer.
2. node output/playwright/task90-checks/portable.mjs whole Calc plus complete new shared FormulaTokenArray and affected shared owner/tests raw S/B/F/L100 every counter positive, sources absent/restored, static and actual Calc browser profile. No Writer-only repair or threshold weakening.
3. node output/playwright/task90-checks/gates.mjs all16repository/tooling/inventory gates and registry/GC invariant/journal/docs updates.
4. Exact current/committed non-task hashes, same-agent separate EVALUATOR, canonical DONE/clean calc. Partial array operation family and native declaration scaffold explicitly bounded; full array/ScTokenArray/ScFormulaCell/document/storage/UI/ODS still pending, full91.

## Verification

Pass: actual shared FormulaTokenArray initialized code/RPN storage operation family, live FormulaTokenArrayStandardRange and original ScRecalcMode.463LO hashes/17verified Boost dependency headers,9positive normal native commands and complete463656-byte recalc/12009-byte array streams over selected complete unchanged original source/header bodies. Default/copy/transfer/move/copy assignment/reset/finalize/8192stop/edit/query/predicate/live range and all256byte/priority histories match. Declaration scaffold/static compiler function only, no fake instance/full native class layout/unsupported virtual API claim. JS refs omit physical reserve/unique_ptr/refcount/allocator/finalizer; RPN gate/break specialization proof preserves original forward-index adjacency skip CALC-079 and moved-source finalized behavior CALC-080. Initial genuine log include omission fixed; first shared250cases all passed but1Finalize statement/branch uncovered. Added meaningful original nonempty open Finalize history, native regenerated/checked and whole shared rerun, thresholds unchanged. Initial map read with zero location146, original log retained; Vitest replaced map before attempted full archive, final complete raw map is acceptance evidence. Calc132tests43files25owners raw3579S2400B658F3178L and shared250tests55files40owners raw4272S2147B897F3817L all S/B/F/L100 every raw counter positive. Four source links absent/restored; static and Calc profile0UI pass. All16gates/36tooling tests10files/123inventory tests38files configured100 pass after responsibility-split filenameDivergence added to existing new provenance record. Exact3240current/committed non-task hashes matchf77a1b27249019fd9e2837d345cf18c0bebec47c,13intentional paths. Existing Writer/shared owners unchanged; two real new shared runtime files registered. Same-agent separate EVALUATOR pass (not independent review), quality/20261013-161757530-recovery-context/quality-report.json. Evidence output/playwright/task90-checks/exact-review.json,value-coverage-audit.json,gates-results.json and formula-token-array-native/manifest.json. Full UNO/opcode/jump/compiler/rewriter/reference-range/ScTokenArray/ScFormulaCell/document/UI/ODS remain pending; native ABI/vtable/capacity/tails/None-policy/invalid ranges/physical lifetime/assertions/full QA unverified. Goal active, next task91 full run.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-13T16:19:34.250Z — VERIFY — ok

By: CODER

Note: Verified: original shared FormulaTokenArray storage/recalc family atf77a1b27249019fd9e2837d345cf18c0bebec47c. Normal463656/12009-byte streams/9commands, Calc132/shared250 all raw100, source-absent build/profile and16gates, exact3240hashes/13paths and same-agent separate EVALUATOR pass. Inventory/provenance/GC proof/CALC-079/080 updated, no runtime memory library. Actual ScTokenArray/formula cell/document/UI/ODS pending, goal active and full91 next.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-13T16:19:33.799Z, excerpt_hash=sha256:b75e1b12a9a6e3d8c2f3b10cf3bc8f803e2b3b70b5e489662ca1266c9cd0d5bc

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610131543-CD8JQC/blueprint/resolved-snapshot.json
- old_digest: 76ba0068e1e034f21c2c13eb425e0adb023066e972430ca02bbaefddeb86798e
- current_digest: 76ba0068e1e034f21c2c13eb425e0adb023066e972430ca02bbaefddeb86798e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610131543-CD8JQC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610131543-CD8JQC -m 🧩 CD8JQC task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert intentional task90 changes through a new task only; no merge/history rewrite.

## Findings

Default ScFormulaCell requires actual ScTokenArray, whose base FormulaTokenArray is absent. This installs real shared storage rather than inventing Calc-specific sequences. Copy constructor shares token identity but finalizes nonempty code. Move empties source buffers/lengths but retains its other flags. Native refcount1 stop conditions imply no remaining RPN match; removing those memory gates does not justify changing forward-index traversal. Uninitialized array capacity/tails and jump token code are outside this leaf.

- Observation: First normal selected-array compile needs original sal/log.hxx for unchanged SAL_WARN/SAL_WARN_IF stream macros in RemoveToken after omitting unused full compiler header.
  Impact: Include/declaration scaffold omission only; no original behavioral assertion ran, selected source methods unchanged.
  Resolution: Include genuine sal/log.hxx and rerun normal capture, no fake warning macro/peer or altered source/verification.

- Observation: Whole Calc132 passes; shared250tests55files all pass but strict raw coverage leaves Finalize nonempty/unfinalized true path unexecuted:4271/4272statements2146/2147branches, functions/lines100. Empty finalization and already-finalized copy tested.
  Impact: Meaningful original mutation transition missing from fixture, no runtime or Writer defect and no threshold change.
  Resolution: Add original Finalize on nonempty open source array to normal native stream and portable replay, regenerate/check fixture then rerun only affected whole shared profile and remaining source-absent static/profile checks. Preserve initial failure logs/counters.

- Observation: Final tests/type/lint/build/raw100 pass. Four inventory/provenance checks fail on the same missing filenameDivergence entry for original token.cxx class shard token.array.ts; inventory122pass1fail.
  Impact: Registry naming metadata incomplete, no runtime/coverage defect and no new path or scope.
  Resolution: Add responsibility-split filenameDivergence to existing new source provenance record using established token.values/token.string pattern, recheck failed provenance/registry/invariant/inventory and formatting gates. Runtime/native/test evidence unchanged. Initial raw coverage map was read with location146zero counter before Vitest replaced it; retained initial log records totals and failure, final full raw map is acceptance evidence.

- Observation: Final real shared array storage/recalc owner matches463656/12009-byte normal streams with463LO hashes/17Boost dependencies/9commands. Calc132/shared250 whole raw100, source-absent static/profile0UI and16gates pass. Exact3240hashes/13intentional paths matchf77a1b27249019fd9e2837d345cf18c0bebec47c; same-agent separate EVALUATOR pass.
  Impact: Required actual shared FormulaTokenArray base for ScTokenArray/ScFormulaCell/ODS established with real tokens, live ranges, original defaults/copy/alias/limit/edit/flag logic and GC refs. No extra memory/flags library or Calc-specific duplicate sequence. CALC-079/080 preserved; incomplete array/compiler/document/UI/ODS families remain explicit.
  Resolution: Record final verification and canonical finish90. Next scheduled91full run; no merge, Writer-only coverage repair or goal completion/pause. Runtime evidence unchanged by final provenance naming metadata correction.
