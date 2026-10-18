---
id: "202610182014-EJ2ZC1"
title: "Match native Calc input modification and undo trigger semantics"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T20:15:17.575Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-18T20:19:53.553Z"
  updated_by: "CODER"
  note: "Native modification flag now gates writes and Undo instead of JSON equality. All280Calc cases raw100percent four metrics,110related menu cases,6source/tooling cases,types/build/style/source/inventory and built-browser no-edit versus same-value Undo review pass;see verification.md."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Replace browser JSON equality with source modification flag lifecycle and actual input-triggered history."
events:
  -
    type: "status"
    at: "2026-10-18T20:15:22.005Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Replace browser JSON equality with source modification flag lifecycle and actual input-triggered history."
  -
    type: "verify"
    at: "2026-10-18T20:19:53.553Z"
    author: "CODER"
    state: "ok"
    note: "Native modification flag now gates writes and Undo instead of JSON equality. All280Calc cases raw100percent four metrics,110related menu cases,6source/tooling cases,types/build/style/source/inventory and built-browser no-edit versus same-value Undo review pass;see verification.md."
doc_version: 3
doc_updated_at: "2026-10-18T20:19:53.622Z"
doc_updated_by: "CODER"
description: "Approved UI continuation task13. Replace browser JSON cell comparison with native ScInputHandler bModified default and modification lifecycle. F2/focus/caret-only input does not write;actual edits and explicit EnterString do write and create real history even when values match. Preserve modification through TYPE/TABLE/TOP toggles;reset after accepted input,cancel and document replacement;retain rejected draft. Port only actual flag lifecycle at source owner and browser platform boundary;no full EditEngine or operation services claimed. AllCalc100percent,related source/shared tests and standard gates. Up to24non-task files;full regression next task20;calc checkout/branch only."
sections:
  Summary: |-
    Match native Calc input modification and undo trigger semantics

    Approved UI continuation task13. Replace browser JSON cell comparison with native ScInputHandler bModified default and modification lifecycle. F2/focus/caret-only input does not write;actual edits and explicit EnterString do write and create real history even when values match. Preserve modification through TYPE/TABLE/TOP toggles;reset after accepted input,cancel and document replacement;retain rejected draft. Port only actual flag lifecycle at source owner and browser platform boundary;no full EditEngine or operation services claimed. AllCalc100percent,related source/shared tests and standard gates. Up to24non-task files;full regression next task20;calc checkout/branch only.
  Scope: |-
    - In scope: Approved UI continuation task13. Replace browser JSON cell comparison with native ScInputHandler bModified default and modification lifecycle. F2/focus/caret-only input does not write;actual edits and explicit EnterString do write and create real history even when values match. Preserve modification through TYPE/TABLE/TOP toggles;reset after accepted input,cancel and document replacement;retain rejected draft. Port only actual flag lifecycle at source owner and browser platform boundary;no full EditEngine or operation services claimed. AllCalc100percent,related source/shared tests and standard gates. Up to24non-task files;full regression next task20;calc checkout/branch only.
    - Out of scope: unrelated refactors not required for "Match native Calc input modification and undo trigger semantics".
  Plan: "Use pinned inputhdl.cxx constructor,SetMode(pInitText),DataChanged,EnterHandler2 and CancelHandler modification flag lifecycle. Extend actual ScInputHandler bounded owner with bModified,source SetModified and explicit browser read/reset boundary;do not claim full EditEngine services. Browser changes and explicit replacement input set flag,F2/focus/caret alone do not;TYPE/TABLE/TOP transitions preserve it. Commit follows modified guard,records actual action even for equal values,removes JSON comparison and retains failed-input state. Reset on accepted input,cancel and model replacement. Add source-backed lifecycle and production no-edit/same-value/reverted-input/history/invalid-draft cases;update stale no-op assertion to native behavior. AllCalc100percent,related UI/source tests,types/build/style/source/provenance/scoped inventories and browser review. Up to24non-task paths;task13,next full task20."
  Verify Steps: "1. npm run test:coverage:calc raw100percent on statements/branches/functions/lines. Native modification flag tests cover initialization,mark/reset and mode-preservation. Production controller/input tests cover F2 or focus with no edit (including formula errors),same-value/reverted edits creating history,dirty generation and native cancellation/error retention. 2. Related shared menu/input focus tests and pinned source contracts pass;source proves EnterHandler modified guard and unconditional operation undo after actual input. 3. App/tools typecheck,build,touched prettier/eslint,module/docs/size/source-tree/provenance,scoped Calc/shared inventories,doctor/routing pass. 4. Built browser verifies unchanged F2 leaves Undo/dirty untouched and same-value edit creates undo;all evidence stored in task. Full suite next task20."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-18T20:19:53.553Z — VERIFY — ok

    By: CODER

    Note: Native modification flag now gates writes and Undo instead of JSON equality. All280Calc cases raw100percent four metrics,110related menu cases,6source/tooling cases,types/build/style/source/inventory and built-browser no-edit versus same-value Undo review pass;see verification.md.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T20:19:52.985Z, excerpt_hash=sha256:7c55337f0c462a3f82b1d0ef77c73ed694334278cf75497e6b013015b11dc4bb

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610182014-EJ2ZC1/blueprint/resolved-snapshot.json
    - old_digest: cbe2708bdf75b58e88486dfb33c3e94704941f6334cad9ea0105aa19c69c67ce
    - current_digest: cbe2708bdf75b58e88486dfb33c3e94704941f6334cad9ea0105aa19c69c67ce
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610182014-EJ2ZC1

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610182014-EJ2ZC1 -m 🧩 EJ2ZC1 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    Command: npm run test:coverage:calc -- --maxWorkers=4 --reporter=dot
    Result: pass
    Evidence: calc-coverage-final.log;105 files,280 cases;raw statements6482/6482,branches4176/4176,functions1347/1347,lines5817/5817. No threshold reduction or coverage exclusion. Initial279-case run also passed before the additional production UI regression and history reset.
    Scope: all Calc runtime owners,including native mode/modification subset,production input,files and real model/history.

    Command: npm exec --workspace @vite-office/office -- vitest run CommandMenuBar WriterMenuBar --maxWorkers=4 --reporter=dot
    Result: pass
    Evidence: related.log;9 files,110 cases.
    Scope: actual shared menu and Writer consumers.

    Command: npm run typecheck; npm run build; npx vitest run scripts/calc-sheet-command-source.test.ts scripts/writer-ui-resource-model.test.ts; node .agentplane/tasks/202610182014-EJ2ZC1/touched-checks.mjs; npm run check:docs
    Result: pass
    Evidence: contracts.log and final-build-style.log;6 source/resource cases,app/tools types,production build,12 intentional non-task paths formatted/linted and JSDoc validation2267files. Existing bundle-size warnings remain.
    Scope: native flag constructor default,DataChanged/SetModified marking,EnterHandler2 guard/cancellation and operation Undo after actual input;source and type/style gates.

    Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs
    Result: pass
    Evidence: gates.log;module boundaries845sources,provenance846runtime modules,both scoped semanticViolationCount0,doctor OK with existing managed-shim readiness warning,policy routing OK.
    Scope: original module ownership and truthful bounded modification lifecycle;whole input subsystem parity remains unverified.

    Command: Production browser http://127.0.0.1:5176/calc using actual cell,keyboard and toolbar controls
    Result: pass
    Evidence: browser-review.json and tool transcript. Entered42 in A1,inspected via double-click/F2 and Enter,then Undo cleared A1 and disabled Undo. Redo restored42;typed42 again;first Undo retained42 with Undo enabled,second Undo cleared A1 and disabled Undo.
    Scope: built production UI proves unmodified inspection creates no extra action while explicit same-value input does.

    Source finding: ScCellValue::equalsWithoutFormat exists for value comparison but is not the input commit/Undo guard. ScInputHandler::EnterHandler2 uses bOldMod from bModified;SetNormalStringOperation creates ScUndoEnterData after SetString without equality suppression. Therefore the implementation removes JSON equality without replacing it with a different semantic no-op suppression. One existing browser test expecting duplicate EnterString suppression was corrected to native two-action behavior.

    Remaining scope: Input EditEngine,autocorrect/validation,format services,full source action ownership and group-sheet input remain incomplete. The mode owner exposes explicit browser read/reset projections for private native flag state;these are not claimed as upstream public methods or complete EnterHandler/CancelHandler implementations. Current real model,typed token history,shared Writer chrome and browser save deviations remain unchanged.

    Cadence: Approved UI task13;full application regression completed at task10,next task20. Original goal remains active.
id_source: "generated"
---
## Summary

Match native Calc input modification and undo trigger semantics

Approved UI continuation task13. Replace browser JSON cell comparison with native ScInputHandler bModified default and modification lifecycle. F2/focus/caret-only input does not write;actual edits and explicit EnterString do write and create real history even when values match. Preserve modification through TYPE/TABLE/TOP toggles;reset after accepted input,cancel and document replacement;retain rejected draft. Port only actual flag lifecycle at source owner and browser platform boundary;no full EditEngine or operation services claimed. AllCalc100percent,related source/shared tests and standard gates. Up to24non-task files;full regression next task20;calc checkout/branch only.

## Scope

- In scope: Approved UI continuation task13. Replace browser JSON cell comparison with native ScInputHandler bModified default and modification lifecycle. F2/focus/caret-only input does not write;actual edits and explicit EnterString do write and create real history even when values match. Preserve modification through TYPE/TABLE/TOP toggles;reset after accepted input,cancel and document replacement;retain rejected draft. Port only actual flag lifecycle at source owner and browser platform boundary;no full EditEngine or operation services claimed. AllCalc100percent,related source/shared tests and standard gates. Up to24non-task files;full regression next task20;calc checkout/branch only.
- Out of scope: unrelated refactors not required for "Match native Calc input modification and undo trigger semantics".

## Plan

Use pinned inputhdl.cxx constructor,SetMode(pInitText),DataChanged,EnterHandler2 and CancelHandler modification flag lifecycle. Extend actual ScInputHandler bounded owner with bModified,source SetModified and explicit browser read/reset boundary;do not claim full EditEngine services. Browser changes and explicit replacement input set flag,F2/focus/caret alone do not;TYPE/TABLE/TOP transitions preserve it. Commit follows modified guard,records actual action even for equal values,removes JSON comparison and retains failed-input state. Reset on accepted input,cancel and model replacement. Add source-backed lifecycle and production no-edit/same-value/reverted-input/history/invalid-draft cases;update stale no-op assertion to native behavior. AllCalc100percent,related UI/source tests,types/build/style/source/provenance/scoped inventories and browser review. Up to24non-task paths;task13,next full task20.

## Verify Steps

1. npm run test:coverage:calc raw100percent on statements/branches/functions/lines. Native modification flag tests cover initialization,mark/reset and mode-preservation. Production controller/input tests cover F2 or focus with no edit (including formula errors),same-value/reverted edits creating history,dirty generation and native cancellation/error retention. 2. Related shared menu/input focus tests and pinned source contracts pass;source proves EnterHandler modified guard and unconditional operation undo after actual input. 3. App/tools typecheck,build,touched prettier/eslint,module/docs/size/source-tree/provenance,scoped Calc/shared inventories,doctor/routing pass. 4. Built browser verifies unchanged F2 leaves Undo/dirty untouched and same-value edit creates undo;all evidence stored in task. Full suite next task20.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-18T20:19:53.553Z — VERIFY — ok

By: CODER

Note: Native modification flag now gates writes and Undo instead of JSON equality. All280Calc cases raw100percent four metrics,110related menu cases,6source/tooling cases,types/build/style/source/inventory and built-browser no-edit versus same-value Undo review pass;see verification.md.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T20:19:52.985Z, excerpt_hash=sha256:7c55337f0c462a3f82b1d0ef77c73ed694334278cf75497e6b013015b11dc4bb

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610182014-EJ2ZC1/blueprint/resolved-snapshot.json
- old_digest: cbe2708bdf75b58e88486dfb33c3e94704941f6334cad9ea0105aa19c69c67ce
- current_digest: cbe2708bdf75b58e88486dfb33c3e94704941f6334cad9ea0105aa19c69c67ce
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610182014-EJ2ZC1

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610182014-EJ2ZC1 -m 🧩 EJ2ZC1 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Command: npm run test:coverage:calc -- --maxWorkers=4 --reporter=dot
Result: pass
Evidence: calc-coverage-final.log;105 files,280 cases;raw statements6482/6482,branches4176/4176,functions1347/1347,lines5817/5817. No threshold reduction or coverage exclusion. Initial279-case run also passed before the additional production UI regression and history reset.
Scope: all Calc runtime owners,including native mode/modification subset,production input,files and real model/history.

Command: npm exec --workspace @vite-office/office -- vitest run CommandMenuBar WriterMenuBar --maxWorkers=4 --reporter=dot
Result: pass
Evidence: related.log;9 files,110 cases.
Scope: actual shared menu and Writer consumers.

Command: npm run typecheck; npm run build; npx vitest run scripts/calc-sheet-command-source.test.ts scripts/writer-ui-resource-model.test.ts; node .agentplane/tasks/202610182014-EJ2ZC1/touched-checks.mjs; npm run check:docs
Result: pass
Evidence: contracts.log and final-build-style.log;6 source/resource cases,app/tools types,production build,12 intentional non-task paths formatted/linted and JSDoc validation2267files. Existing bundle-size warnings remain.
Scope: native flag constructor default,DataChanged/SetModified marking,EnterHandler2 guard/cancellation and operation Undo after actual input;source and type/style gates.

Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: gates.log;module boundaries845sources,provenance846runtime modules,both scoped semanticViolationCount0,doctor OK with existing managed-shim readiness warning,policy routing OK.
Scope: original module ownership and truthful bounded modification lifecycle;whole input subsystem parity remains unverified.

Command: Production browser http://127.0.0.1:5176/calc using actual cell,keyboard and toolbar controls
Result: pass
Evidence: browser-review.json and tool transcript. Entered42 in A1,inspected via double-click/F2 and Enter,then Undo cleared A1 and disabled Undo. Redo restored42;typed42 again;first Undo retained42 with Undo enabled,second Undo cleared A1 and disabled Undo.
Scope: built production UI proves unmodified inspection creates no extra action while explicit same-value input does.

Source finding: ScCellValue::equalsWithoutFormat exists for value comparison but is not the input commit/Undo guard. ScInputHandler::EnterHandler2 uses bOldMod from bModified;SetNormalStringOperation creates ScUndoEnterData after SetString without equality suppression. Therefore the implementation removes JSON equality without replacing it with a different semantic no-op suppression. One existing browser test expecting duplicate EnterString suppression was corrected to native two-action behavior.

Remaining scope: Input EditEngine,autocorrect/validation,format services,full source action ownership and group-sheet input remain incomplete. The mode owner exposes explicit browser read/reset projections for private native flag state;these are not claimed as upstream public methods or complete EnterHandler/CancelHandler implementations. Current real model,typed token history,shared Writer chrome and browser save deviations remain unchanged.

Cadence: Approved UI task13;full application regression completed at task10,next task20. Original goal remains active.
