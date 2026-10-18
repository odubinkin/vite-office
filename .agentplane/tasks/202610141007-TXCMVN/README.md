---
id: "202610141007-TXCMVN"
title: "Implement Calc conditional-format index and page-scale value attributes"
result_summary: "Completed task113 prerequisites; document storage, UI and ODS filters remain pending. Goal active, nextfull121."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-14T10:11:28.732Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-14T10:22:12.962Z"
  updated_by: "CODER"
  note: "WholeCalc158tests and actual shared10tests pass; complete Calc33/shared2owners rawS/B/F/L100 everycounterpositive. Checker23tests and12focused gates pass. Exact committed28paths and3469hashes verified;9native source pins, same-agent evaluation not independent. Initial failures retained and corrected within scope. Full121next; document/UI/ODS integration remains pending."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-14T10:21:58.256Z"
  updated_by: "EVALUATOR"
  note: "Same-agent source-bound review passed28intentional paths, wholeCalc158tests and changed shared owners raw100; not independent review."
  evaluated_sha: "2fe041285719cbf3e0169e3d037bb014b8fcaefe"
  blueprint_digest: "44bc9569063193b06d8be9599825d51bfe0cd74e12ff77e87585faa22acb828d"
  evidence_refs:
    - ".agentplane/tasks/202610141007-TXCMVN/README.md"
    - ".agentplane/tasks/202610141007-TXCMVN/quality/20261014-102158256-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610141007-TXCMVN/quality/20261014-102158256-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610141007-TXCMVN/quality/20261014-102158256-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610141007-TXCMVN/blueprint/resolved-snapshot.json"
    - "output/playwright/task113-checks/exact-review.json"
    - "output/playwright/task113-checks/gates-results.json"
    - "output/playwright/task113-checks/value-coverage-audit.json"
  findings:
    - "Original vector duplicate preservation, item copy/Clone Which histories and real typed Any conversion retained. Complete native presentation/diagnostics/ABI/document/UI/ODS remain pending."
commit:
  hash: "2fe041285719cbf3e0169e3d037bb014b8fcaefe"
  message: "🧩 TXCMVN core: preserve native conditional-index and page-scale values"
comments:
  -
    author: "CODER"
    body: "Start: port native condition-index/page-scale values over real SortedVector and Any, preserving initializer duplicates and shared value moves without lifetime machinery."
  -
    author: "CODER"
    body: "Verified: native conditional-index and page-scale value scope with actual shared vector/hash/Any reuse; wholeCalc158tests, related10tests, checker23tests, strict raw100 and12focused gates pass."
events:
  -
    type: "status"
    at: "2026-10-14T10:11:47.350Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port native condition-index/page-scale values over real SortedVector and Any, preserving initializer duplicates and shared value moves without lifetime machinery."
  -
    type: "verify"
    at: "2026-10-14T10:22:12.962Z"
    author: "CODER"
    state: "ok"
    note: "WholeCalc158tests and actual shared10tests pass; complete Calc33/shared2owners rawS/B/F/L100 everycounterpositive. Checker23tests and12focused gates pass. Exact committed28paths and3469hashes verified;9native source pins, same-agent evaluation not independent. Initial failures retained and corrected within scope. Full121next; document/UI/ODS integration remains pending."
  -
    type: "status"
    at: "2026-10-14T10:22:28.183Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native conditional-index and page-scale value scope with actual shared vector/hash/Any reuse; wholeCalc158tests, related10tests, checker23tests, strict raw100 and12focused gates pass."
doc_version: 3
doc_updated_at: "2026-10-14T10:22:28.185Z"
doc_updated_by: "CODER"
description: "Task113 prepares native document pool and ODS style values: complete logical ScCondFormatItem sorted index/copy/move/Clone/equality/hash contracts and ScPageScaleToItem size/validity/copy/Clone/member query/update contracts. Reuse existing SortedVector/Any/pool owners, add only native unsigned integer hash-combine arithmetic and exact Calc-to-CPPU dependency evidence. No memory manager or fake document/provider; raw100 Calc/affected owners and focused checks, full121."
sections:
  Summary: "Implement the actual conditional-format index and page-scale attribute value owners created by ScDocumentPool and needed by UI/ODS styles, reusing shared SortedVector/Any/pool values. Close native scalar initializer/copy/move vector behavior required to preserve legal duplicate indexes; add only integer hash arithmetic, never lifetime machinery."
  Scope: "Twenty-eight planned non-task paths: new sc/source/core/data/attrib.values.ts, o3tl/inc/hash_combine.ts, existing sc/source/core/data/attrib.ts and inc/attrib.ts/inc/scitems.ts; existing shared SortedVector source/test; module-boundary checker/test; two new Calc/hash tests; runtime/provenance for sixowners (newattrib.values,oldattrib,incattrib,scitems,hash,SortedVector =12records); two new Calc/shared capability records; three Calc core/GC/suspected-issues docs. Reuse existing Any/UnoType values unchanged, and add exact native sc-to-cppu allowlist edge with reverse/app/browser restrictions retained. No fake peer/provider, native compile, memory manager, Boost or source-threshold weakening."
  Plan: "Port complete logical ScCondFormatItem default/scalar/const-index-vector/implicitcopy/rvalue construction, stable readonly actual index-owner view, equality/Clone/hash support. Existing SortedVector gains native primitive initializer-list sorting without deduplication, primitive copy preserving all entries, and generic move by ordinary array-reference transfer, with no lifecycle policy library. Source initializer-list duplicates are preserved and documented. Hash helper ports scalar unsigned32-input 32/64seed arithmetic through native JS number/BigInt, explicit unsigned identity hash binding; native external stdlib/binary/ABI/generalT/pointer-count hashing parity is not certified. ScCond hash uses 64family BigInt; no hash persistence or memory library. Port ScPageScaleToItem Which187/default0,0/explicit sizes/copy/Clone/get/set/validity/equality/member queries and updates. Preserve actual DocPool creation1,1 separately. Support original Any output/query and input/extract using actual existing cppu owners plus existing plain unsigned16 browser scalar binding; memberu8 narrowing, failure leaves outputs/fields unchanged, no fabricated coercion provider. Native labels/localized presentation/XML dump/debug/invalid downcasts/ABI/cache and complete document/filter/UI integration remain excluded or pending. Shard new values to honor500line cap, with exact responsibility-split provenance. Source-absent wholeCalc and complete hash/SortedVector owners raw100, relevant existing vector consumers, exact checker test and focused code/metadata gates. Fresh baseline from actual current Git blobs, exact intentional changes, same-agent EVAL not independent, canonicalclose clean oncalc. Goalactive, next full121."
  Verify Steps: |-
    1. Review complete native new item header/value bodies, DocPool explicit defaults, SortedVector constructors and o3tl hash_combine families, actual Any extract/assign binding and source module includes. Test real public items, real actualAny typed widths/failures/untouched outputs, scalar browser domain, vector duplicate preservation/copy/move/borrow histories and both hash widths against independently expressed source arithmetic. No fake provider/private forcing or compiled native/stdlib/ABI/invalid-domain claims.
    2. Whole current Calc plus complete hash/SortedVector shared owner profiles rawS/B/F/L100/everycounterpositive, source links all4absent/restoredfinally. Include real existing vector consumers and unchanged Any reuse without claiming remeasured-owner coverage. No Writer-only coverage repairs or fulloffice before121.
    3. Focused format/lint, actual app typecheck, JSDoc/size/dependency/tree/provenance/registry/routing/doctor/diff and targeted module-boundary checker tests. Preserve failure logs and assertions/thresholds. No unrelated full tooling/inventory/browser replay.
    4. Derive baseline from current Git, never assume prior-cycle snapshot. Exact committed/current hashes and intentional paths/source pins/source-bound runtime/gate results; same-agent EVAL explicitly not independent. APverify/close clean branchcalc; original goal remains active/incomplete.
  Verification: |-
    Command: node output/playwright/task113-checks/portable.mjs
    Result: pass. Whole Calc158tests54files33owners rawS4113/B2723/F814/L3664; shared10tests3files complete2owners rawS73/B30/F18/L71. All S/B/F/L100 and every raw counterpositive. All4reference symlinks absent during tests and restored finally. Actual Writer container consumer retained.
    Command: npx vitest run scripts/check-module-boundaries.test.ts
    Result: pass23tests. Exact sc→cppu allowed, reverse and browser dependencies remain forbidden.
    Command: node output/playwright/task113-checks/gates.mjs
    Result: final focused12gate run recorded in gates-results.json after metadata corrections; exact source review and committed hashes recorded before final verification. Scope: intentional28paths only. Native source contracts reviewed, no native compilation.
    Full office/browser/static: next scheduled full121 under user once-per10tasks cadence; no Writer-only coverage work.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-14T10:22:12.962Z — VERIFY — ok

    By: CODER

    Note: WholeCalc158tests and actual shared10tests pass; complete Calc33/shared2owners rawS/B/F/L100 everycounterpositive. Checker23tests and12focused gates pass. Exact committed28paths and3469hashes verified;9native source pins, same-agent evaluation not independent. Initial failures retained and corrected within scope. Full121next; document/UI/ODS integration remains pending.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-14T10:21:22.656Z, excerpt_hash=sha256:d4d9abc86fb85e8d050f0792256066ea367823531f048dcaaf03c7b7a9d46c1d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610141007-TXCMVN/blueprint/resolved-snapshot.json
    - old_digest: 44bc9569063193b06d8be9599825d51bfe0cd74e12ff77e87585faa22acb828d
    - current_digest: 44bc9569063193b06d8be9599825d51bfe0cd74e12ff77e87585faa22acb828d
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610141007-TXCMVN

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610141007-TXCMVN -m 🧩 TXCMVN task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task113 intentional implementation/tests/metadata/docs. Preserve integrated Writer/main changes and unrelated tasks. Restore all4reference symlinks exactly in finally, no upstream tree edits/network/worktrees/merges/history reset."
  Findings: "Initial Calc157pass/1fail: new test incorrectly expected typed signed16 -1 rejection. Existing CPPU and original assign.hxx correctly reinterpret the16bits asunsigned65535. Test corrected to source behavior, retaining unchanged-output and invalid-type assertions; implementation unchanged. Initial lint rejected redundant overloads; merged erased seed signature without arithmetic change. Initial provenance and registry failed new metadata: hash needed original nSeed symbol evidence beyond basename; canonical attribute reexports are not runtime declarations. Corrected metadata, retaining prior history/status. CALC098duplicate initializer and CALC099typed signed dimension conversion documented; upstream behavior preserved. All initial logs retained. Same-agent evaluator is not independent review. Logical hash specialization makes no external stdlib/native ABI/binary parity claim. Whole document storage/configuration/UI/ODS filters and localized presentation remain pending. No fake document/provider or new memory ownership engine. Goal active; task121nextfull."
id_source: "generated"
---
## Summary

Implement the actual conditional-format index and page-scale attribute value owners created by ScDocumentPool and needed by UI/ODS styles, reusing shared SortedVector/Any/pool values. Close native scalar initializer/copy/move vector behavior required to preserve legal duplicate indexes; add only integer hash arithmetic, never lifetime machinery.

## Scope

Twenty-eight planned non-task paths: new sc/source/core/data/attrib.values.ts, o3tl/inc/hash_combine.ts, existing sc/source/core/data/attrib.ts and inc/attrib.ts/inc/scitems.ts; existing shared SortedVector source/test; module-boundary checker/test; two new Calc/hash tests; runtime/provenance for sixowners (newattrib.values,oldattrib,incattrib,scitems,hash,SortedVector =12records); two new Calc/shared capability records; three Calc core/GC/suspected-issues docs. Reuse existing Any/UnoType values unchanged, and add exact native sc-to-cppu allowlist edge with reverse/app/browser restrictions retained. No fake peer/provider, native compile, memory manager, Boost or source-threshold weakening.

## Plan

Port complete logical ScCondFormatItem default/scalar/const-index-vector/implicitcopy/rvalue construction, stable readonly actual index-owner view, equality/Clone/hash support. Existing SortedVector gains native primitive initializer-list sorting without deduplication, primitive copy preserving all entries, and generic move by ordinary array-reference transfer, with no lifecycle policy library. Source initializer-list duplicates are preserved and documented. Hash helper ports scalar unsigned32-input 32/64seed arithmetic through native JS number/BigInt, explicit unsigned identity hash binding; native external stdlib/binary/ABI/generalT/pointer-count hashing parity is not certified. ScCond hash uses 64family BigInt; no hash persistence or memory library. Port ScPageScaleToItem Which187/default0,0/explicit sizes/copy/Clone/get/set/validity/equality/member queries and updates. Preserve actual DocPool creation1,1 separately. Support original Any output/query and input/extract using actual existing cppu owners plus existing plain unsigned16 browser scalar binding; memberu8 narrowing, failure leaves outputs/fields unchanged, no fabricated coercion provider. Native labels/localized presentation/XML dump/debug/invalid downcasts/ABI/cache and complete document/filter/UI integration remain excluded or pending. Shard new values to honor500line cap, with exact responsibility-split provenance. Source-absent wholeCalc and complete hash/SortedVector owners raw100, relevant existing vector consumers, exact checker test and focused code/metadata gates. Fresh baseline from actual current Git blobs, exact intentional changes, same-agent EVAL not independent, canonicalclose clean oncalc. Goalactive, next full121.

## Verify Steps

1. Review complete native new item header/value bodies, DocPool explicit defaults, SortedVector constructors and o3tl hash_combine families, actual Any extract/assign binding and source module includes. Test real public items, real actualAny typed widths/failures/untouched outputs, scalar browser domain, vector duplicate preservation/copy/move/borrow histories and both hash widths against independently expressed source arithmetic. No fake provider/private forcing or compiled native/stdlib/ABI/invalid-domain claims.
2. Whole current Calc plus complete hash/SortedVector shared owner profiles rawS/B/F/L100/everycounterpositive, source links all4absent/restoredfinally. Include real existing vector consumers and unchanged Any reuse without claiming remeasured-owner coverage. No Writer-only coverage repairs or fulloffice before121.
3. Focused format/lint, actual app typecheck, JSDoc/size/dependency/tree/provenance/registry/routing/doctor/diff and targeted module-boundary checker tests. Preserve failure logs and assertions/thresholds. No unrelated full tooling/inventory/browser replay.
4. Derive baseline from current Git, never assume prior-cycle snapshot. Exact committed/current hashes and intentional paths/source pins/source-bound runtime/gate results; same-agent EVAL explicitly not independent. APverify/close clean branchcalc; original goal remains active/incomplete.

## Verification

Command: node output/playwright/task113-checks/portable.mjs
Result: pass. Whole Calc158tests54files33owners rawS4113/B2723/F814/L3664; shared10tests3files complete2owners rawS73/B30/F18/L71. All S/B/F/L100 and every raw counterpositive. All4reference symlinks absent during tests and restored finally. Actual Writer container consumer retained.
Command: npx vitest run scripts/check-module-boundaries.test.ts
Result: pass23tests. Exact sc→cppu allowed, reverse and browser dependencies remain forbidden.
Command: node output/playwright/task113-checks/gates.mjs
Result: final focused12gate run recorded in gates-results.json after metadata corrections; exact source review and committed hashes recorded before final verification. Scope: intentional28paths only. Native source contracts reviewed, no native compilation.
Full office/browser/static: next scheduled full121 under user once-per10tasks cadence; no Writer-only coverage work.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-14T10:22:12.962Z — VERIFY — ok

By: CODER

Note: WholeCalc158tests and actual shared10tests pass; complete Calc33/shared2owners rawS/B/F/L100 everycounterpositive. Checker23tests and12focused gates pass. Exact committed28paths and3469hashes verified;9native source pins, same-agent evaluation not independent. Initial failures retained and corrected within scope. Full121next; document/UI/ODS integration remains pending.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-14T10:21:22.656Z, excerpt_hash=sha256:d4d9abc86fb85e8d050f0792256066ea367823531f048dcaaf03c7b7a9d46c1d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610141007-TXCMVN/blueprint/resolved-snapshot.json
- old_digest: 44bc9569063193b06d8be9599825d51bfe0cd74e12ff77e87585faa22acb828d
- current_digest: 44bc9569063193b06d8be9599825d51bfe0cd74e12ff77e87585faa22acb828d
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610141007-TXCMVN

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610141007-TXCMVN -m 🧩 TXCMVN task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task113 intentional implementation/tests/metadata/docs. Preserve integrated Writer/main changes and unrelated tasks. Restore all4reference symlinks exactly in finally, no upstream tree edits/network/worktrees/merges/history reset.

## Findings

Initial Calc157pass/1fail: new test incorrectly expected typed signed16 -1 rejection. Existing CPPU and original assign.hxx correctly reinterpret the16bits asunsigned65535. Test corrected to source behavior, retaining unchanged-output and invalid-type assertions; implementation unchanged. Initial lint rejected redundant overloads; merged erased seed signature without arithmetic change. Initial provenance and registry failed new metadata: hash needed original nSeed symbol evidence beyond basename; canonical attribute reexports are not runtime declarations. Corrected metadata, retaining prior history/status. CALC098duplicate initializer and CALC099typed signed dimension conversion documented; upstream behavior preserved. All initial logs retained. Same-agent evaluator is not independent review. Logical hash specialization makes no external stdlib/native ABI/binary parity claim. Whole document storage/configuration/UI/ODS filters and localized presentation remain pending. No fake document/provider or new memory ownership engine. Goal active; task121nextfull.
