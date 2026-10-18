---
id: "202610181353-EGPAKC"
title: "Add canonical row-major cell traversal for ODS export"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T13:54:27.230Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-18T14:05:35.960Z"
  updated_by: "CODER"
  note: "Passed217Calc cases/exact50owners raw100;175related cases;build+6Chromium/DOM-free Worker scenarios;13source gates;8pinned native sources and23path/hash closure. Actual typed row-major traversal complete;ODS filters/UI readiness unclaimed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-18T14:07:09.342Z"
  updated_by: "EVALUATOR"
  note: "Same-agent quality review passes the native row-major traversal at ad5b8b305819;23current source hashes and24commit paths match the reviewed evidence. Minimum ODS/UI handoff remains pending."
  evaluated_sha: "ad5b8b30581969a44178a5e2c6d5cfe85e89e30c"
  blueprint_digest: "cb56bb3970d6e971689ea7bf7469b438eecc660b6280e3fb6e01f7a2082d720e"
  evidence_refs:
    - ".agentplane/tasks/202610181353-EGPAKC/README.md"
    - ".agentplane/tasks/202610181353-EGPAKC/quality/20261018-140709342-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610181353-EGPAKC/quality/20261018-140709342-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610181353-EGPAKC/quality/20261018-140709342-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610181353-EGPAKC/blueprint/resolved-snapshot.json"
    - "output/playwright/task203-checks/quality-source-audit.json"
    - "output/playwright/task203-checks/final-audit.json"
    - "output/playwright/task203-checks/source-audit.json"
    - "output/playwright/task203-checks/source-gates.json"
    - "output/playwright/task203-checks/value-coverage-audit.json"
    - "output/playwright/task203-checks/build-browser-manifest.json"
  findings:
    - "ScHorizontalCellIterator retains source vector/block cursor ordering,empty-block skip and sparse-row jumps,stable borrowed maCurCell and original constructor clamp. Native GetCellStore/ClampToAllocatedColumns/toRefCell reuse the actual typed stores and views;no copied grid,heap scheduler or shared mdds algorithm change."
    - "217Calc cases and exact50owners pass every raw S/B/F/L counter100;175related tests,build+6Chromium/DOM-free Worker scenarios and13source gates pass. Native source evidence covers8files;all5source links restored. Invalid SetTab allocation-domain rejection is explicit and journaled CALC-188;no native UB or physical memory manager is emulated."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: add actual row-major typed-block traversal for same-model ODS export,reusing native column views and shared mdds without a second grid or UI."
events:
  -
    type: "status"
    at: "2026-10-18T13:54:27.647Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: add actual row-major typed-block traversal for same-model ODS export,reusing native column views and shared mdds without a second grid or UI."
  -
    type: "verify"
    at: "2026-10-18T14:05:35.960Z"
    author: "CODER"
    state: "ok"
    note: "Passed217Calc cases/exact50owners raw100;175related cases;build+6Chromium/DOM-free Worker scenarios;13source gates;8pinned native sources and23path/hash closure. Actual typed row-major traversal complete;ODS filters/UI readiness unclaimed."
doc_version: 3
doc_updated_at: "2026-10-18T14:05:36.011Z"
doc_updated_by: "CODER"
description: "Task203: implement actual ScHorizontalCellIterator over existing typed column blocks and borrowed cell views, preserving native row-major state/skip behavior and sheet reset. Reuse native GetCellStore and allocated-column bounds;no copied grid or UI. This is the direct core traversal consumed by minimal same-model ODS export."
sections:
  Summary: "Task203 implements the real row-major nonempty-cell traversal required by same-model ODS export. It visits existing typed column blocks and borrowed ScRefCellValue owners,without a copied grid or UI implementation."
  Scope: "New sc/inc/dociter.ts facade and sc/source/core/data/dociter.ts ScHorizontalCellIterator with native constructor,SetTab,GetNext,GetPos,Advance,SkipInvalid,SkipInvalidInRow,FindNextNonEmptyRow;actual maColPositions/block cursors and stable maCurCell view. Existing ScColumn.GetCellStore,ScTable.ClampToAllocatedColumns and native sc::toRefCell in core/data/mtvelements.ts re-exported through inc/mtvelements.ts. Refactor existing Column.GetCellValue to the same native typed conversion helper instead of duplicating it. Valid bounded row/column range and existing sheet are native preconditions;SetTab does not widen the original constructor clamp and rejects an unallocated column range rather than manufacturing a fallback. Numeric/string/formula/empty families only;rich edit-text is still absent. Paired inventory/provenance/capability/readiness docs and focused tests. No shared mdds algorithm changes,ODS filter/UI claim,language detour,native compilation or new lifetime machinery."
  Plan: "1. Audit pinned dociter.cxx/hxx horizontal cursor state and mtvelements typed view conversion,allocated-column clamp. 2. Implement actual row-major block skip logic and reuse shared mdds const iterators and cell views. 3. Verify sparse/interleaved/contiguous blocks,bounded cuts,end state,stable view identity,empty and unallocated ranges,sheet reset and formula/string values without evaluation. 4. Record source-derived evidence and exact raw100 whole Calc/related tests,real browser/Worker traversal,existing13source gates,path/hash audit,commit and same-agent quality review. ODS filter work follows immediately after this traversal prerequisite."
  Verify Steps: |-
    node output/playwright/task203-checks/source-audit.mjs: pinned native cursor/helper/clamp proof,source markers/hashes,no C++ execution.
    node output/playwright/task203-checks/portable.mjs: whole Calc strict raw S/B/F/L100 exact executable owners and related mdds/token/string tests,with all5native references absent/restored;Writer-only coverage gaps exempt.
    node output/playwright/task203-checks/browser-portable.mjs: build and actual sparse row-major traversal in Chromium/DOM-free Worker,without source references.
    node output/playwright/task203-checks/source-gates.mjs: existing13format/lint/types/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff/boundary gates with no threshold/allowlist relaxation.
    Final exact path/hash/reference/coverage audit,recorded verification/source commit and same-agent review. No all-app full run until minimum core plus basic ODS milestone,then pause;UI remains separate.
  Verification: |-
    Command: node output/playwright/task203-checks/source-audit.mjs. Result: pass. Evidence:8pinned native source/header/QA files;native vector/block scan order,typed toRefCell conversion,allocated bounds and SetTab preconditions. Scope:source-derived valid-domain horizontal traversal;no C++ execution,physical memory probe or broad parity claim.
    Command: node output/playwright/task203-checks/portable.mjs. Result: pass. Evidence:whole Calc217cases/85files,exact50executable owners;raw5165statements/3312branches/1045functions/4633lines all100,every raw counter positive. Related175cases/26files cover actual mdds/token consumers plus traversal. No shared implementation changed,so related tests do not claim shared raw coverage. Scope:all Calc plus changed-module dependencies,all5source links absent/restored. Native explicit-coordinate test oracle covers400range windows and real borrowed scalar/string/formula owners.
    Command: node output/playwright/task203-checks/browser-portable.mjs. Result: pass. Evidence:production build and6Chromium scenarios,each executes actual modules in the page and DOM-free Worker;fresh sparse traversal reaches row900000,preserves ordering and formula dirty state,and retains allocated-column count. Scope:core portability,no UI implementation,all5native source links absent/restored.
    Command: node output/playwright/task203-checks/source-gates.mjs (all13gates with focused remediation/resume,final format/lint after browser tuple typing). Result: pass. Evidence:format,lint,types,docs,size,dependencies,tree,provenance,inventory,routing,doctor,diff,boundaries;no checker/allowlist/threshold edits. Existing managed-hook warning persists.
    Command: node output/playwright/task203-checks/final-audit.mjs. Result: pass. Evidence:23exact non-task paths and hashes match final portable browser snapshot,50Calc raw100,related zero exit,13gates,8native source files and restored5links. Runtime/unit-test files were unchanged after the Calc run;the retained format-write log confirms unchanged bytes and only the new browser fixture needed tuple typing,so the passing unit profile was not replayed. Scope:row-major traversal only;ODS filters and UI remain pending. Same-agent quality review follows the source commit. Full all-app verification remains due at the user minimum core/ODS milestone,then pause.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-18T14:05:35.960Z — VERIFY — ok

    By: CODER

    Note: Passed217Calc cases/exact50owners raw100;175related cases;build+6Chromium/DOM-free Worker scenarios;13source gates;8pinned native sources and23path/hash closure. Actual typed row-major traversal complete;ODS filters/UI readiness unclaimed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T14:05:35.487Z, excerpt_hash=sha256:d5c8900189800a49ffe53fc4759c1e572f90717c63a8874961aecae617590446

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181353-EGPAKC/blueprint/resolved-snapshot.json
    - old_digest: cb56bb3970d6e971689ea7bf7469b438eecc660b6280e3fb6e01f7a2082d720e
    - current_digest: cb56bb3970d6e971689ea7bf7469b438eecc660b6280e3fb6e01f7a2082d720e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610181353-EGPAKC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610181353-EGPAKC
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task203 code and metadata commits;retain task202 formula output and existing shared stores. No branch integration or user file changes."
  Findings: "Initial typecheck found two imports made unused by the native toRefCell refactor;removed them. A focused expectation assumed SetTextCell(\"\") retains a stored empty string,but the existing canonical document API clears it;the test now uses actual native Column.SetRawString to cover an explicitly stored empty string. No production behavior was changed for that expectation. Native ColContainer source confirms SetTab retained-allocation precondition;outside-domain JS rejection is documented and journaled CALC-188,without C++ memory probes. Browser test coordinates were made readonly tuples for TS7 indexing. Targeted start-ready incident advice was reviewed:forward Vitest flags directly,no second standalone separator,no counter rewriting or irrelevant Writer-parent/language scope. No shared implementation changes,no C++ compilation,no physical lifetime engine or UI. Whole Calc217/related175 cases pass;source gates pass;final browser/hash closure is pending."
id_source: "generated"
---
## Summary

Task203 implements the real row-major nonempty-cell traversal required by same-model ODS export. It visits existing typed column blocks and borrowed ScRefCellValue owners,without a copied grid or UI implementation.

## Scope

New sc/inc/dociter.ts facade and sc/source/core/data/dociter.ts ScHorizontalCellIterator with native constructor,SetTab,GetNext,GetPos,Advance,SkipInvalid,SkipInvalidInRow,FindNextNonEmptyRow;actual maColPositions/block cursors and stable maCurCell view. Existing ScColumn.GetCellStore,ScTable.ClampToAllocatedColumns and native sc::toRefCell in core/data/mtvelements.ts re-exported through inc/mtvelements.ts. Refactor existing Column.GetCellValue to the same native typed conversion helper instead of duplicating it. Valid bounded row/column range and existing sheet are native preconditions;SetTab does not widen the original constructor clamp and rejects an unallocated column range rather than manufacturing a fallback. Numeric/string/formula/empty families only;rich edit-text is still absent. Paired inventory/provenance/capability/readiness docs and focused tests. No shared mdds algorithm changes,ODS filter/UI claim,language detour,native compilation or new lifetime machinery.

## Plan

1. Audit pinned dociter.cxx/hxx horizontal cursor state and mtvelements typed view conversion,allocated-column clamp. 2. Implement actual row-major block skip logic and reuse shared mdds const iterators and cell views. 3. Verify sparse/interleaved/contiguous blocks,bounded cuts,end state,stable view identity,empty and unallocated ranges,sheet reset and formula/string values without evaluation. 4. Record source-derived evidence and exact raw100 whole Calc/related tests,real browser/Worker traversal,existing13source gates,path/hash audit,commit and same-agent quality review. ODS filter work follows immediately after this traversal prerequisite.

## Verify Steps

node output/playwright/task203-checks/source-audit.mjs: pinned native cursor/helper/clamp proof,source markers/hashes,no C++ execution.
node output/playwright/task203-checks/portable.mjs: whole Calc strict raw S/B/F/L100 exact executable owners and related mdds/token/string tests,with all5native references absent/restored;Writer-only coverage gaps exempt.
node output/playwright/task203-checks/browser-portable.mjs: build and actual sparse row-major traversal in Chromium/DOM-free Worker,without source references.
node output/playwright/task203-checks/source-gates.mjs: existing13format/lint/types/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff/boundary gates with no threshold/allowlist relaxation.
Final exact path/hash/reference/coverage audit,recorded verification/source commit and same-agent review. No all-app full run until minimum core plus basic ODS milestone,then pause;UI remains separate.

## Verification

Command: node output/playwright/task203-checks/source-audit.mjs. Result: pass. Evidence:8pinned native source/header/QA files;native vector/block scan order,typed toRefCell conversion,allocated bounds and SetTab preconditions. Scope:source-derived valid-domain horizontal traversal;no C++ execution,physical memory probe or broad parity claim.
Command: node output/playwright/task203-checks/portable.mjs. Result: pass. Evidence:whole Calc217cases/85files,exact50executable owners;raw5165statements/3312branches/1045functions/4633lines all100,every raw counter positive. Related175cases/26files cover actual mdds/token consumers plus traversal. No shared implementation changed,so related tests do not claim shared raw coverage. Scope:all Calc plus changed-module dependencies,all5source links absent/restored. Native explicit-coordinate test oracle covers400range windows and real borrowed scalar/string/formula owners.
Command: node output/playwright/task203-checks/browser-portable.mjs. Result: pass. Evidence:production build and6Chromium scenarios,each executes actual modules in the page and DOM-free Worker;fresh sparse traversal reaches row900000,preserves ordering and formula dirty state,and retains allocated-column count. Scope:core portability,no UI implementation,all5native source links absent/restored.
Command: node output/playwright/task203-checks/source-gates.mjs (all13gates with focused remediation/resume,final format/lint after browser tuple typing). Result: pass. Evidence:format,lint,types,docs,size,dependencies,tree,provenance,inventory,routing,doctor,diff,boundaries;no checker/allowlist/threshold edits. Existing managed-hook warning persists.
Command: node output/playwright/task203-checks/final-audit.mjs. Result: pass. Evidence:23exact non-task paths and hashes match final portable browser snapshot,50Calc raw100,related zero exit,13gates,8native source files and restored5links. Runtime/unit-test files were unchanged after the Calc run;the retained format-write log confirms unchanged bytes and only the new browser fixture needed tuple typing,so the passing unit profile was not replayed. Scope:row-major traversal only;ODS filters and UI remain pending. Same-agent quality review follows the source commit. Full all-app verification remains due at the user minimum core/ODS milestone,then pause.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-18T14:05:35.960Z — VERIFY — ok

By: CODER

Note: Passed217Calc cases/exact50owners raw100;175related cases;build+6Chromium/DOM-free Worker scenarios;13source gates;8pinned native sources and23path/hash closure. Actual typed row-major traversal complete;ODS filters/UI readiness unclaimed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T14:05:35.487Z, excerpt_hash=sha256:d5c8900189800a49ffe53fc4759c1e572f90717c63a8874961aecae617590446

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181353-EGPAKC/blueprint/resolved-snapshot.json
- old_digest: cb56bb3970d6e971689ea7bf7469b438eecc660b6280e3fb6e01f7a2082d720e
- current_digest: cb56bb3970d6e971689ea7bf7469b438eecc660b6280e3fb6e01f7a2082d720e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610181353-EGPAKC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610181353-EGPAKC
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task203 code and metadata commits;retain task202 formula output and existing shared stores. No branch integration or user file changes.

## Findings

Initial typecheck found two imports made unused by the native toRefCell refactor;removed them. A focused expectation assumed SetTextCell("") retains a stored empty string,but the existing canonical document API clears it;the test now uses actual native Column.SetRawString to cover an explicitly stored empty string. No production behavior was changed for that expectation. Native ColContainer source confirms SetTab retained-allocation precondition;outside-domain JS rejection is documented and journaled CALC-188,without C++ memory probes. Browser test coordinates were made readonly tuples for TS7 indexing. Targeted start-ready incident advice was reviewed:forward Vitest flags directly,no second standalone separator,no counter rewriting or irrelevant Writer-parent/language scope. No shared implementation changes,no C++ compilation,no physical lifetime engine or UI. Whole Calc217/related175 cases pass;source gates pass;final browser/hash closure is pending.
