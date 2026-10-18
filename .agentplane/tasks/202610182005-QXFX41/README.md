---
id: "202610182005-QXFX41"
title: "Implement native Calc cell input mode transitions and F2 command"
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
  updated_at: "2026-10-18T20:05:52.308Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-18T20:12:38.313Z"
  updated_by: "CODER"
  note: "Native input modes and original F2 slot pass275Calc cases with raw100percent four metrics,110related menu cases,source contracts,types/build/style/source/inventory gates and built-browser caret,draft,commit/history review. Original UI goal remains active;see verification.md."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement source-backed Calc input mode owner and original F2 command under existing approved UI scope."
events:
  -
    type: "status"
    at: "2026-10-18T20:05:56.884Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement source-backed Calc input mode owner and original F2 command under existing approved UI scope."
  -
    type: "verify"
    at: "2026-10-18T20:12:38.313Z"
    author: "CODER"
    state: "ok"
    note: "Native input modes and original F2 slot pass275Calc cases with raw100percent four metrics,110related menu cases,source contracts,types/build/style/source/inventory gates and built-browser caret,draft,commit/history review. Original UI goal remains active;see verification.md."
doc_version: 3
doc_updated_at: "2026-10-18T20:12:38.364Z"
doc_updated_by: "CODER"
description: "Approved Calc UI continuation task12. Port native ScInputMode enum and bounded ScInputHandler mode owner at source paths;preserve NONE/TYPE/TABLE/TOP semantics and F2 toggle without committing TYPE/TABLE drafts. Bind original SetInputMode slot26552 and shared menu/accelerator,route direct typing and scalar cursor keys according to source shell contract,retain real model/undo/file behavior. Add source-backed and user-facing regression tests,allCalc100percent and related tests. Up to35non-task paths including truthful runtime/provenance records. No network,merges or full suite before task20."
sections:
  Summary: |-
    Implement native Calc cell input mode transitions and F2 command

    Approved Calc UI continuation task12. Port native ScInputMode enum and bounded ScInputHandler mode owner at source paths;preserve NONE/TYPE/TABLE/TOP semantics and F2 toggle without committing TYPE/TABLE drafts. Bind original SetInputMode slot26552 and shared menu/accelerator,route direct typing and scalar cursor keys according to source shell contract,retain real model/undo/file behavior. Add source-backed and user-facing regression tests,allCalc100percent and related tests. Up to35non-task paths including truthful runtime/provenance records. No network,merges or full suite before task20.
  Scope: |-
    - In scope: Approved Calc UI continuation task12. Port native ScInputMode enum and bounded ScInputHandler mode owner at source paths;preserve NONE/TYPE/TABLE/TOP semantics and F2 toggle without committing TYPE/TABLE drafts. Bind original SetInputMode slot26552 and shared menu/accelerator,route direct typing and scalar cursor keys according to source shell contract,retain real model/undo/file behavior. Add source-backed and user-facing regression tests,allCalc100percent and related tests. Up to35non-task paths including truthful runtime/provenance records. No network,merges or full suite before task20.
    - Out of scope: unrelated refactors not required for "Implement native Calc cell input mode transitions and F2 command".
  Plan: "Use pinned global.hxx,inputhdl.hxx/inputhdl.cxx,cellsh4.cxx and tabvwsh4.cxx as contracts. Port four native input mode values and bounded mode owner/predicates/toggle,with explicit omitted EditEngine services. Browser retains one transient draft bound to actual document;direct typing uses TYPE,F2 toggles TABLE/TYPE without commit,TOP commits before F2. Original SetInputMode slot26552 consumes same owner through shared menu and F2 dispatch. Scalar TYPE cursor movement commits and moves;TABLE/TOP keep caret navigation. Preserve invalid draft,IME and modal guards. AllCalc raw100percent and affected shared/Writer/source tests,types/build/style/source/provenance/inventory,doctor/routing and production browser F2 review. Up to35non-task paths,task12,next full suite task20."
  Verify Steps: "1. npm run test:coverage:calc passes raw100percent statements/branches/functions/lines. Native mode predicates,toggle and original slot identity have source-backed checks;production input tests cover TYPE vs TABLE arrows,F2 draft retention,TOP commit,error retention,IME and menu dispatch. 2. Related shared menu/Writer tests and tooling source tests pass;resource freshness remains unchanged. 3. App/tools typecheck,build,touched prettier/eslint,module/docs/size/source/provenance and scoped Calc/shared inventory gates,ap doctor and node .agentplane/policy/check-routing.mjs pass. 4. Real browser uses menu and F2 on actual document and verifies draft/cursor/history transitions. Full regression cadence next task20."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-18T20:12:38.313Z — VERIFY — ok

    By: CODER

    Note: Native input modes and original F2 slot pass275Calc cases with raw100percent four metrics,110related menu cases,source contracts,types/build/style/source/inventory gates and built-browser caret,draft,commit/history review. Original UI goal remains active;see verification.md.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T20:12:37.890Z, excerpt_hash=sha256:f0eef3ee7f0bff3380991eedef366a88aef1cb0889afc2043d8e9075bb8729d6

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610182005-QXFX41/blueprint/resolved-snapshot.json
    - old_digest: df99142ec7b3817c9f4062749b2b7d82c5ea9b7e9ba06aa1eeab3666947835c0
    - current_digest: df99142ec7b3817c9f4062749b2b7d82c5ea9b7e9ba06aa1eeab3666947835c0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610182005-QXFX41

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610182005-QXFX41 -m 🧩 QXFX41 task: persist canonical task artifacts --allow-tasks
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
    Evidence: calc-coverage.log;104 files,275 cases;raw statements6471/6471,branches4174/4174,functions1344/1344,lines5807/5807. No coverage exclusions or lower thresholds.
    Scope: all current Calc runtime owners including native input mode subset,real controller and production presenters.

    Command: npm exec --workspace @vite-office/office -- vitest run CommandMenuBar WriterMenuBar --maxWorkers=4 --reporter=dot
    Result: pass
    Evidence: related.log;9 files,110 cases.
    Scope: shared menu behavior and Writer consumption.

    Command: npm run typecheck; npx vitest run scripts/calc-sheet-command-source.test.ts scripts/writer-ui-resource-model.test.ts; npm run check:calc-resources; npm run check:writer-resources
    Result: pass
    Evidence: contracts-final.log;tools/app types,5 source/tooling cases,2 Writer resource cases;450 Calc commands,11 menus,17 explicit save-policy dispositions;generated resources unchanged.
    Scope: native mode enum,source mode guard/toggle and original slot26552;resource freshness.

    Command: npm run build; node .agentplane/tasks/202610182005-QXFX41/touched-checks.mjs; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance
    Result: pass
    Evidence: build.log,style-final.log,gates-final.log;32 intentional non-task paths;846 runtime modules,730 mapped,98 browser adaptations,18 infrastructure. Existing bundle-size warnings unchanged.
    Scope: production build,touched style,source/module/documentation/provenance constraints.

    Command: npm run inventory:parity:calc; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs
    Result: pass
    Evidence: inventory-final.log;both scoped semanticViolationCount0;doctor OK with existing managed-shim readiness warning;policy routing OK.
    Scope: truthful bounded mode subset and source ownership;no whole Calc parity certification.

    Command: Production browser http://127.0.0.1:5176/calc using actual keyboard/menu controls
    Result: pass
    Evidence: browser-review.json and tool transcript. Typed72 in F10,F2 entered TABLE,ArrowLeft moved caret to1 without modifying cell/history. Shared Edit/Cell Edit Mode switched to TYPE;ArrowRight committed72 and selected G10. Actual Undo cleared F10. TOP input42,F2 and Escape retained committed42 with Undo available.
    Scope: built application,focus/caret,draft preservation,cell movement and real history.

    Observations: Initial JSDoc gate found two missing comments on test act callbacks;added comments and reran gates successfully. Metadata update initially assumed native provenance shape for a browser-owned record;corrected to its actual responsibilities schema and all source/inventory checks passed. An intermediate task-artifact commit attempt encountered a log still changing after staging;execution/test handles were polled to terminal and final task-owned staging refreshes those logs. No source work was discarded and no test process restarted.

    Cadence: This is approved UI task12. Full application regression was completed/repaired at task10;next full regression task20. The original goal remains active.
id_source: "generated"
---
## Summary

Implement native Calc cell input mode transitions and F2 command

Approved Calc UI continuation task12. Port native ScInputMode enum and bounded ScInputHandler mode owner at source paths;preserve NONE/TYPE/TABLE/TOP semantics and F2 toggle without committing TYPE/TABLE drafts. Bind original SetInputMode slot26552 and shared menu/accelerator,route direct typing and scalar cursor keys according to source shell contract,retain real model/undo/file behavior. Add source-backed and user-facing regression tests,allCalc100percent and related tests. Up to35non-task paths including truthful runtime/provenance records. No network,merges or full suite before task20.

## Scope

- In scope: Approved Calc UI continuation task12. Port native ScInputMode enum and bounded ScInputHandler mode owner at source paths;preserve NONE/TYPE/TABLE/TOP semantics and F2 toggle without committing TYPE/TABLE drafts. Bind original SetInputMode slot26552 and shared menu/accelerator,route direct typing and scalar cursor keys according to source shell contract,retain real model/undo/file behavior. Add source-backed and user-facing regression tests,allCalc100percent and related tests. Up to35non-task paths including truthful runtime/provenance records. No network,merges or full suite before task20.
- Out of scope: unrelated refactors not required for "Implement native Calc cell input mode transitions and F2 command".

## Plan

Use pinned global.hxx,inputhdl.hxx/inputhdl.cxx,cellsh4.cxx and tabvwsh4.cxx as contracts. Port four native input mode values and bounded mode owner/predicates/toggle,with explicit omitted EditEngine services. Browser retains one transient draft bound to actual document;direct typing uses TYPE,F2 toggles TABLE/TYPE without commit,TOP commits before F2. Original SetInputMode slot26552 consumes same owner through shared menu and F2 dispatch. Scalar TYPE cursor movement commits and moves;TABLE/TOP keep caret navigation. Preserve invalid draft,IME and modal guards. AllCalc raw100percent and affected shared/Writer/source tests,types/build/style/source/provenance/inventory,doctor/routing and production browser F2 review. Up to35non-task paths,task12,next full suite task20.

## Verify Steps

1. npm run test:coverage:calc passes raw100percent statements/branches/functions/lines. Native mode predicates,toggle and original slot identity have source-backed checks;production input tests cover TYPE vs TABLE arrows,F2 draft retention,TOP commit,error retention,IME and menu dispatch. 2. Related shared menu/Writer tests and tooling source tests pass;resource freshness remains unchanged. 3. App/tools typecheck,build,touched prettier/eslint,module/docs/size/source/provenance and scoped Calc/shared inventory gates,ap doctor and node .agentplane/policy/check-routing.mjs pass. 4. Real browser uses menu and F2 on actual document and verifies draft/cursor/history transitions. Full regression cadence next task20.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-18T20:12:38.313Z — VERIFY — ok

By: CODER

Note: Native input modes and original F2 slot pass275Calc cases with raw100percent four metrics,110related menu cases,source contracts,types/build/style/source/inventory gates and built-browser caret,draft,commit/history review. Original UI goal remains active;see verification.md.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T20:12:37.890Z, excerpt_hash=sha256:f0eef3ee7f0bff3380991eedef366a88aef1cb0889afc2043d8e9075bb8729d6

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610182005-QXFX41/blueprint/resolved-snapshot.json
- old_digest: df99142ec7b3817c9f4062749b2b7d82c5ea9b7e9ba06aa1eeab3666947835c0
- current_digest: df99142ec7b3817c9f4062749b2b7d82c5ea9b7e9ba06aa1eeab3666947835c0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610182005-QXFX41

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610182005-QXFX41 -m 🧩 QXFX41 task: persist canonical task artifacts --allow-tasks
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
Evidence: calc-coverage.log;104 files,275 cases;raw statements6471/6471,branches4174/4174,functions1344/1344,lines5807/5807. No coverage exclusions or lower thresholds.
Scope: all current Calc runtime owners including native input mode subset,real controller and production presenters.

Command: npm exec --workspace @vite-office/office -- vitest run CommandMenuBar WriterMenuBar --maxWorkers=4 --reporter=dot
Result: pass
Evidence: related.log;9 files,110 cases.
Scope: shared menu behavior and Writer consumption.

Command: npm run typecheck; npx vitest run scripts/calc-sheet-command-source.test.ts scripts/writer-ui-resource-model.test.ts; npm run check:calc-resources; npm run check:writer-resources
Result: pass
Evidence: contracts-final.log;tools/app types,5 source/tooling cases,2 Writer resource cases;450 Calc commands,11 menus,17 explicit save-policy dispositions;generated resources unchanged.
Scope: native mode enum,source mode guard/toggle and original slot26552;resource freshness.

Command: npm run build; node .agentplane/tasks/202610182005-QXFX41/touched-checks.mjs; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance
Result: pass
Evidence: build.log,style-final.log,gates-final.log;32 intentional non-task paths;846 runtime modules,730 mapped,98 browser adaptations,18 infrastructure. Existing bundle-size warnings unchanged.
Scope: production build,touched style,source/module/documentation/provenance constraints.

Command: npm run inventory:parity:calc; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: inventory-final.log;both scoped semanticViolationCount0;doctor OK with existing managed-shim readiness warning;policy routing OK.
Scope: truthful bounded mode subset and source ownership;no whole Calc parity certification.

Command: Production browser http://127.0.0.1:5176/calc using actual keyboard/menu controls
Result: pass
Evidence: browser-review.json and tool transcript. Typed72 in F10,F2 entered TABLE,ArrowLeft moved caret to1 without modifying cell/history. Shared Edit/Cell Edit Mode switched to TYPE;ArrowRight committed72 and selected G10. Actual Undo cleared F10. TOP input42,F2 and Escape retained committed42 with Undo available.
Scope: built application,focus/caret,draft preservation,cell movement and real history.

Observations: Initial JSDoc gate found two missing comments on test act callbacks;added comments and reran gates successfully. Metadata update initially assumed native provenance shape for a browser-owned record;corrected to its actual responsibilities schema and all source/inventory checks passed. An intermediate task-artifact commit attempt encountered a log still changing after staging;execution/test handles were polled to terminal and final task-owned staging refreshes those logs. No source work was discarded and no test process restarted.

Cadence: This is approved UI task12. Full application regression was completed/repaired at task10;next full regression task20. The original goal remains active.
