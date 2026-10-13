---
id: "202610131402-R2SM7K"
title: "Implement original Calc scalar cell reference boundary"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-13T14:02:47.979Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-13T14:17:47.828Z"
  updated_by: "CODER"
  note: "Verified: original scalar ScRefCellValue at18d66dae0a4da8f7fe154ba0da3770f6703701c0,1451-byte ordinary stream/6commands, Calc130/shared246 whole raw100 every counter positive, source-absent static/profile and16gates, exact3222hashes/11paths and same-agent separate EVALUATOR pass. No fake peers, new memory manager or Writer/shared runtime edits. UI/ODS real owners remain priority, next full91."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-13T14:17:03.201Z"
  updated_by: "EVALUATOR"
  note: "Same-agent separate EVALUATOR: original scalar ScRefCellValue borrowed boundary with legal typed getters and implicit memberwise copies verified; no independent-review claim."
  evaluated_sha: "18d66dae0a4da8f7fe154ba0da3770f6703701c0"
  blueprint_digest: "ec4a1d442aad745d13f308b1f3a6c56ee1b37b7d598efd4342785cec0480b39f"
  evidence_refs:
    - ".agentplane/tasks/202610131402-R2SM7K/README.md"
    - ".agentplane/tasks/202610131402-R2SM7K/quality/20261013-141703201-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610131402-R2SM7K/quality/20261013-141703201-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610131402-R2SM7K/quality/20261013-141703201-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610131402-R2SM7K/blueprint/resolved-snapshot.json"
    - "output/playwright/task87-checks/exact-review.json"
    - "output/playwright/task87-checks/value-coverage-audit.json"
    - "output/playwright/task87-checks/gates-results.json"
    - "output/playwright/calc-ref-cell-value-native/manifest.json"
  findings:
    - "Actual SharedString identity is borrowed without copy/acquire/dispose. Null retains STRING tag. Clear drops inactive JS reference for GC; original union ABI, assertions/invalid reads, rich-text/formula/document families unverified. No fake peers or memory manager."
    - "Whole Calc130 and related shared246 tests raw S/B/F/L100 with every raw counter positive; four original links absent/restored, static and Calc profile0UI pass. All16repository/tooling/inventory gates pass. Exact current/committed hashes and11 intentional non-task changes match source commit, Writer/shared runtime unchanged."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: original scalar borrowed ScRefCellValue contract and evidence, reused SharedString and ordinary JS refs; human UI/ODS goal authorization, no missing peer stand-in."
events:
  -
    type: "status"
    at: "2026-10-13T14:03:01.860Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: original scalar borrowed ScRefCellValue contract and evidence, reused SharedString and ordinary JS refs; human UI/ODS goal authorization, no missing peer stand-in."
  -
    type: "verify"
    at: "2026-10-13T14:17:47.828Z"
    author: "CODER"
    state: "ok"
    note: "Verified: original scalar ScRefCellValue at18d66dae0a4da8f7fe154ba0da3770f6703701c0,1451-byte ordinary stream/6commands, Calc130/shared246 whole raw100 every counter positive, source-absent static/profile and16gates, exact3222hashes/11paths and same-agent separate EVALUATOR pass. No fake peers, new memory manager or Writer/shared runtime edits. UI/ODS real owners remain priority, next full91."
doc_version: 3
doc_updated_at: "2026-10-13T14:17:47.904Z"
doc_updated_by: "CODER"
description: "Iteration87 UI and ODS prerequisite: actual ScRefCellValue scalar borrowed value boundary at original cellvalue header/core, no fake formula/text/document peers or memory management."
sections:
  Summary: "Iteration87 original scalar ScRefCellValue boundary for actual document/UI/ODS prerequisites."
  Scope: "Extend original sc/inc/cellvalue and core/data/cellvalue with ScRefCellValue default/number/borrowed-string constructors, compiler-provided copy construction/assignment, clear, getType/getDouble/getSharedString/isEmpty. Reuse real SharedString; null string pointers retain STRING tag. No ownership/refcount library, fake rich-text/formula/document peers or wrong-type union access certification. Add native unchanged original scalar scopes and fixture/test, update existing cell-value inventory records/capability and Calc checkpoint. Full formula-dependent methods remain subsequent real owners."
  Plan: "Implement original scalar ScRefCellValue borrowed owner boundary with real shared strings and original tags; ordinary JS memberwise reference/value copy, no new memory library. Native closed scalar family and complete portable raw100; inventory/docs16gates/exact review; next actual store/document/ODS priority, full91."
  Verify Steps: |-
    1. node scripts/calc-ref-cell-value-native-probe.mjs --check and complete original scalar stream test; finite/IEEE/error numbers, borrowed UTF16/null/empty strings, identity retention and implicit memberwise copy/assignment/self-copy, clear/type/emptiness; no sanitizer/fake peer/undefined getter exercise.
    2. node output/playwright/task87-checks/portable.mjs: whole Calc and complete affected shared owners/tests S/B/F/L100 every raw counter positive, four source links absent/restored, static and Calc browser profile. No Writer-only repair.
    3. node output/playwright/task87-checks/gates.mjs:16repository/tooling/inventory gates and updated scoped inventory.
    4. Exact current/committed non-task hashes and same-agent separate EVALUATOR review, canonical DONE and clean calc branch. Broad ScRefCellValue, document/UI/ODS remain unverified; next full91.
  Verification: |-
    Pass: complete1451-byte ordinary original scalar ScRefCellValue stream over451pinned sources and6positive commands, unchanged constructors/clear/isEmpty/inline getters and compiler-provided memberwise copies. Borrowed actual SharedString identity, reassignment visibility, null/empty STRING tags, finite/IEEE/encoded errors, copy/assignment/self-copy and clears match. No sanitizer, invalid union reads/ABI, fake peer or memory manager certification. Whole Calc130tests41files25owners raw3289S2209B602F2912L and related shared246tests52files39owners raw4042S2063B829F3620L all S/B/F/L100 every raw counter positive. Four original links absent/restored; static build and Calc profile0UI pass. All16gates pass,36tooling tests10files,123inventory tests38files configured100. Exact3222current/committed non-task hashes match18d66dae0a4da8f7fe154ba0da3770f6703701c0,11intentional non-task paths and no Writer/shared runtime change. Same-agent separate EVALUATOR pass (not independent review), quality/20261013-141703201-recovery-context/quality-report.json. Evidence output/playwright/task87-checks/exact-review.json,value-coverage-audit.json,gates-results.json and calc-ref-cell-value-native/manifest.json. Actual scalar borrowed boundary only; rich-text/formula/document/storage/editing/UI/ODS pending real owners, original QA anchors unexecuted context. Inventory checkpoint updated, no suspicious behavior beyond already preserved cases, goal active, next full91.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-13T14:17:47.828Z — VERIFY — ok

    By: CODER

    Note: Verified: original scalar ScRefCellValue at18d66dae0a4da8f7fe154ba0da3770f6703701c0,1451-byte ordinary stream/6commands, Calc130/shared246 whole raw100 every counter positive, source-absent static/profile and16gates, exact3222hashes/11paths and same-agent separate EVALUATOR pass. No fake peers, new memory manager or Writer/shared runtime edits. UI/ODS real owners remain priority, next full91.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-13T14:17:47.178Z, excerpt_hash=sha256:e72f935a47904a5ad203502779fb767d47958613edb33eb5726f006699bcc52d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610131402-R2SM7K/blueprint/resolved-snapshot.json
    - old_digest: ec4a1d442aad745d13f308b1f3a6c56ee1b37b7d598efd4342785cec0480b39f
    - current_digest: ec4a1d442aad745d13f308b1f3a6c56ee1b37b7d598efd4342785cec0480b39f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610131402-R2SM7K

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610131402-R2SM7K -m 🧩 R2SM7K task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert intentional task87 changes through a new task, no merge/history rewrite."
  Findings: |-
    Original scalar borrowed values do not own/copy SharedString. Formula methods must wait for actual ScFormulaCell, not fake peers. Constructor null-pointer disambiguation uses explicit JS null argument for string family; missing argument remains NONE. Native union ABI and wrong-type reads are outside legal typed contract.

    - Observation: Original ScRefCellValue scalar views borrow actual SharedString object; copies observe subsequent source assignment and null pointers retain STRING. Complete1451-byte stream, Calc130/shared246 raw100, source-absent checks and16gates pass. Exact3222hashes and11intentional non-task changes match18d66dae0a4da8f7fe154ba0da3770f6703701c0, same-agent separate EVALUATOR pass.
      Impact: UI/ODS document cell access prerequisite established without fake peers, alternate DTO or string ownership manager. Wrong-type union access and real document/formula/text owners remain unverified; no editable sheet or ODS filter claim.
      Resolution: Record verified scalar boundary and finish task87. Continue toward original storage, ScColumn/ScTable/ScDocument/editing and shared-backed ODS; goal active, full91. Initial commit subject missed required task: scope token; CLI rejected it before commit, route recomputed and same11paths committed with valid subject, no code/verification drift.
id_source: "generated"
---
## Summary

Iteration87 original scalar ScRefCellValue boundary for actual document/UI/ODS prerequisites.

## Scope

Extend original sc/inc/cellvalue and core/data/cellvalue with ScRefCellValue default/number/borrowed-string constructors, compiler-provided copy construction/assignment, clear, getType/getDouble/getSharedString/isEmpty. Reuse real SharedString; null string pointers retain STRING tag. No ownership/refcount library, fake rich-text/formula/document peers or wrong-type union access certification. Add native unchanged original scalar scopes and fixture/test, update existing cell-value inventory records/capability and Calc checkpoint. Full formula-dependent methods remain subsequent real owners.

## Plan

Implement original scalar ScRefCellValue borrowed owner boundary with real shared strings and original tags; ordinary JS memberwise reference/value copy, no new memory library. Native closed scalar family and complete portable raw100; inventory/docs16gates/exact review; next actual store/document/ODS priority, full91.

## Verify Steps

1. node scripts/calc-ref-cell-value-native-probe.mjs --check and complete original scalar stream test; finite/IEEE/error numbers, borrowed UTF16/null/empty strings, identity retention and implicit memberwise copy/assignment/self-copy, clear/type/emptiness; no sanitizer/fake peer/undefined getter exercise.
2. node output/playwright/task87-checks/portable.mjs: whole Calc and complete affected shared owners/tests S/B/F/L100 every raw counter positive, four source links absent/restored, static and Calc browser profile. No Writer-only repair.
3. node output/playwright/task87-checks/gates.mjs:16repository/tooling/inventory gates and updated scoped inventory.
4. Exact current/committed non-task hashes and same-agent separate EVALUATOR review, canonical DONE and clean calc branch. Broad ScRefCellValue, document/UI/ODS remain unverified; next full91.

## Verification

Pass: complete1451-byte ordinary original scalar ScRefCellValue stream over451pinned sources and6positive commands, unchanged constructors/clear/isEmpty/inline getters and compiler-provided memberwise copies. Borrowed actual SharedString identity, reassignment visibility, null/empty STRING tags, finite/IEEE/encoded errors, copy/assignment/self-copy and clears match. No sanitizer, invalid union reads/ABI, fake peer or memory manager certification. Whole Calc130tests41files25owners raw3289S2209B602F2912L and related shared246tests52files39owners raw4042S2063B829F3620L all S/B/F/L100 every raw counter positive. Four original links absent/restored; static build and Calc profile0UI pass. All16gates pass,36tooling tests10files,123inventory tests38files configured100. Exact3222current/committed non-task hashes match18d66dae0a4da8f7fe154ba0da3770f6703701c0,11intentional non-task paths and no Writer/shared runtime change. Same-agent separate EVALUATOR pass (not independent review), quality/20261013-141703201-recovery-context/quality-report.json. Evidence output/playwright/task87-checks/exact-review.json,value-coverage-audit.json,gates-results.json and calc-ref-cell-value-native/manifest.json. Actual scalar borrowed boundary only; rich-text/formula/document/storage/editing/UI/ODS pending real owners, original QA anchors unexecuted context. Inventory checkpoint updated, no suspicious behavior beyond already preserved cases, goal active, next full91.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-13T14:17:47.828Z — VERIFY — ok

By: CODER

Note: Verified: original scalar ScRefCellValue at18d66dae0a4da8f7fe154ba0da3770f6703701c0,1451-byte ordinary stream/6commands, Calc130/shared246 whole raw100 every counter positive, source-absent static/profile and16gates, exact3222hashes/11paths and same-agent separate EVALUATOR pass. No fake peers, new memory manager or Writer/shared runtime edits. UI/ODS real owners remain priority, next full91.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-13T14:17:47.178Z, excerpt_hash=sha256:e72f935a47904a5ad203502779fb767d47958613edb33eb5726f006699bcc52d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610131402-R2SM7K/blueprint/resolved-snapshot.json
- old_digest: ec4a1d442aad745d13f308b1f3a6c56ee1b37b7d598efd4342785cec0480b39f
- current_digest: ec4a1d442aad745d13f308b1f3a6c56ee1b37b7d598efd4342785cec0480b39f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610131402-R2SM7K

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610131402-R2SM7K -m 🧩 R2SM7K task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert intentional task87 changes through a new task, no merge/history rewrite.

## Findings

Original scalar borrowed values do not own/copy SharedString. Formula methods must wait for actual ScFormulaCell, not fake peers. Constructor null-pointer disambiguation uses explicit JS null argument for string family; missing argument remains NONE. Native union ABI and wrong-type reads are outside legal typed contract.

- Observation: Original ScRefCellValue scalar views borrow actual SharedString object; copies observe subsequent source assignment and null pointers retain STRING. Complete1451-byte stream, Calc130/shared246 raw100, source-absent checks and16gates pass. Exact3222hashes and11intentional non-task changes match18d66dae0a4da8f7fe154ba0da3770f6703701c0, same-agent separate EVALUATOR pass.
  Impact: UI/ODS document cell access prerequisite established without fake peers, alternate DTO or string ownership manager. Wrong-type union access and real document/formula/text owners remain unverified; no editable sheet or ODS filter claim.
  Resolution: Record verified scalar boundary and finish task87. Continue toward original storage, ScColumn/ScTable/ScDocument/editing and shared-backed ODS; goal active, full91. Initial commit subject missed required task: scope token; CLI rejected it before commit, route recomputed and same11paths committed with valid subject, no code/verification drift.
