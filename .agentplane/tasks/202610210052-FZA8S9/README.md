---
id: "202610210052-FZA8S9"
title: "Implement native Calc connected-area and whole-sheet selection"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "npm run test:coverage:calc -- --maxWorkers=1"
plan_approval:
  state: "approved"
  updated_at: "2026-10-21T00:52:59.936Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-21T01:14:31.317Z"
  updated_by: "CODER"
  note: "All537 Calc tests and130 owners100percent;11 shared/Writer tests and changed shared owner100percent. Types,lint,format,build/static,resources,registry,provenance,routing,doctor pass. Chromium desktop/mobile and native Mac input selection accepted;portable audit rechecks78 raw artifacts,41 source pins and14 native pins. Complete full-app checkpoint next70."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement original connected-area selection and source UI command routing in calc only under the resumed approved goal."
events:
  -
    type: "status"
    at: "2026-10-21T00:53:07.206Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement original connected-area selection and source UI command routing in calc only under the resumed approved goal."
  -
    type: "verify"
    at: "2026-10-21T01:14:31.317Z"
    author: "CODER"
    state: "ok"
    note: "All537 Calc tests and130 owners100percent;11 shared/Writer tests and changed shared owner100percent. Types,lint,format,build/static,resources,registry,provenance,routing,doctor pass. Chromium desktop/mobile and native Mac input selection accepted;portable audit rechecks78 raw artifacts,41 source pins and14 native pins. Complete full-app checkpoint next70."
doc_version: 3
doc_updated_at: "2026-10-21T01:14:31.405Z"
doc_updated_by: "CODER"
description: "Block61: port actual column occupancy and table/document connected data-area algorithms; restore original initial one-column allocation; bind SelectData and SelectAll through native view/cell shell and existing shared Writer menus/accelerators/corner. Preserve native first-range then whole-sheet behavior and all document/history invariants. Calc checkout/branch only, no merge/network. Related tests and all Calc coverage100; next full checkpoint70."
sections:
  Summary: |-
    Implement native Calc connected-area and whole-sheet selection

    Block61: port actual column occupancy and table/document connected data-area algorithms; restore original initial one-column allocation; bind SelectData and SelectAll through native view/cell shell and existing shared Writer menus/accelerators/corner. Preserve native first-range then whole-sheet behavior and all document/history invariants. Calc checkout/branch only, no merge/network. Related tests and all Calc coverage100; next full checkpoint70.
  Scope: "Original column2 occupancy/range/last-row queries,table1 connected-area expansion/shrink and document delegation; INITIALCOLCOUNT=1 constructor default. Actual SelectAll/MarkDataArea native view/cell-shell routing;shared SDI menus,platform accelerator and grid corner browser bindings. Up to30 source/test/browser acceptance files plus registry/provenance/evidence/readiness docs. Existing supported plain scalar/formula model;no fake services,rich edit,protection or drawing owner. Only calc checkout and branch."
  Plan: "Restore actual initial one-column storage;port native occupancy and complete connected-area expansion/shrink modifiers against genuine typed stores without browser data copies. Bind source SelectData and first-range/then-whole-sheet SelectAll semantics to actual marks and cursor. Reuse existing Writer menus,shortcut resolution and focus handling;corner selects whole sheet directly. Preserve selected sheets,cursor,content,dirty state and history;input widgets retain their own native text selection. Validate all Calc100,affected shared owners if any,related tests,types/lint/format/source/resource/registry/static gates and actual browser selection at desktop/mobile. Archive evidence,evaluator pass,clean close. Full all-app next70."
  Verify Steps: "Run all Calc tests with unchanged100percent Istanbul thresholds;native cases for all area directions,diagonals,holes,separated blocks,includeOld/onlyDown,clamping,empty tables,column occupancy and initial allocation. Real SDI/menu/accelerator/corner commands,repeat SelectAll,unchanged cursor/sheets/content/history and nested input selection. Related modified shared tests and100coverage if applicable. npm run typecheck;source-scoped eslint/prettier;module boundaries,docs,size,tree,resources,provenance,registry,routing,doctor;production build/static. Actual Chromium desktop/mobile selection acceptance. Preserve raw results and native/source pins,evaluator pass and clean finish. Next full all-app checkpoint70."
  Verification: |-
    Command: npm run test:coverage:calc -- --maxWorkers=1 --coverage.reportOnFailure --coverage.reportsDirectory=../../output/playwright/task61-calc-final-coverage --reporter=default --reporter=json --outputFile=../../output/playwright/task61-calc-final-results.json. Result: pass,exit0. Evidence:537tests/164files;130owners;S10830/B6741/F2006/L9724,all100percent. Scope: complete Calc application tests and coverage. Command(apps/office): node ../../node_modules/vitest/vitest.mjs run src/framework/browser/accelerators/keymapping.test.ts src/framework/browser/presentation/use-command-shortcuts.test.tsx src/sw/browser/presentation/WriterMenuBar.test.tsx --maxWorkers=1 --coverage --coverage.include=src/framework/browser/accelerators/keymapping.ts --coverage.reportsDirectory=../../output/playwright/task61-shared-final-coverage --reporter=default --reporter=json --outputFile=../../output/playwright/task61-shared-final-results.json. Result: pass. Evidence:11tests,shared key owner S25/B22/F6/L23,all100. Scope: actual changed shared owner and Writer menu consumers. Commands: source-scoped eslint and prettier;tools types;production build including app types and static smoke;dependencies,docs,size,source-tree,writer/calc resources,registry,provenance,routing,doctor. Result: pass;existing size/build advisories and doctor shim warning only. Browser: actual built preview4175 with installed Playwright CLI,1280/390px;area,repeat whole-sheet,corner,shared menu SelectData and native Mac input Meta+A. Result: pass;raw snapshots/screens and native input selection retained. Original Ctrl+A on Mac input uses OS control-key behavior,so native text selection verified using Meta+A. Full all-app next70;checkpoint60 retained.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-21T01:14:31.317Z — VERIFY — ok

    By: CODER

    Note: All537 Calc tests and130 owners100percent;11 shared/Writer tests and changed shared owner100percent. Types,lint,format,build/static,resources,registry,provenance,routing,doctor pass. Chromium desktop/mobile and native Mac input selection accepted;portable audit rechecks78 raw artifacts,41 source pins and14 native pins. Complete full-app checkpoint next70.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-21T01:12:09.823Z, excerpt_hash=sha256:50289ab55994b0b6082827fbc79e6c6eda0547c5545e131f920af8e5f1f21edf

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610210052-FZA8S9/blueprint/resolved-snapshot.json
    - old_digest: 4fe63e239a4c198e0ea51486400fbe0d55a9f507387eb250dbbf9ab3ad058adc
    - current_digest: 4fe63e239a4c198e0ea51486400fbe0d55a9f507387eb250dbbf9ab3ad058adc
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610210052-FZA8S9

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610210052-FZA8S9
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only source and metadata commits for this task;retain task evidence and do not reset user history or merge branches."
  Findings: "Initial diagnostic Calc run retained ten stale zero-column assertions,all updated to native INITIALCOLCOUNT=1. Second run:537tests pass;coverage statements10831/10832,branches6743/6751. Added genuine missing area/failed-input cases. Three nonnegative column-allocation guards are invariant under actual initial1/grow-only columns and nonnegative valid coordinates;the port specializes these proved true branches without adding synthetic zero-column states or source coverage exclusions. Original conditional bodies and all valid-state behavior remain. Browser initial dev invocation passed --host through npm incorrectly;stopped only that task process and used actual built preview4175. A resized shared menubar recreated item references;refreshed snapshot before mobile acceptance. Known favicon404 is the only console resource error. Full all-app checkpoint60 is retained;next70. CALC247 records original clamping despite includeOld/onlyDown commentary;behavior unchanged."
id_source: "generated"
---
## Summary

Implement native Calc connected-area and whole-sheet selection

Block61: port actual column occupancy and table/document connected data-area algorithms; restore original initial one-column allocation; bind SelectData and SelectAll through native view/cell shell and existing shared Writer menus/accelerators/corner. Preserve native first-range then whole-sheet behavior and all document/history invariants. Calc checkout/branch only, no merge/network. Related tests and all Calc coverage100; next full checkpoint70.

## Scope

Original column2 occupancy/range/last-row queries,table1 connected-area expansion/shrink and document delegation; INITIALCOLCOUNT=1 constructor default. Actual SelectAll/MarkDataArea native view/cell-shell routing;shared SDI menus,platform accelerator and grid corner browser bindings. Up to30 source/test/browser acceptance files plus registry/provenance/evidence/readiness docs. Existing supported plain scalar/formula model;no fake services,rich edit,protection or drawing owner. Only calc checkout and branch.

## Plan

Restore actual initial one-column storage;port native occupancy and complete connected-area expansion/shrink modifiers against genuine typed stores without browser data copies. Bind source SelectData and first-range/then-whole-sheet SelectAll semantics to actual marks and cursor. Reuse existing Writer menus,shortcut resolution and focus handling;corner selects whole sheet directly. Preserve selected sheets,cursor,content,dirty state and history;input widgets retain their own native text selection. Validate all Calc100,affected shared owners if any,related tests,types/lint/format/source/resource/registry/static gates and actual browser selection at desktop/mobile. Archive evidence,evaluator pass,clean close. Full all-app next70.

## Verify Steps

Run all Calc tests with unchanged100percent Istanbul thresholds;native cases for all area directions,diagonals,holes,separated blocks,includeOld/onlyDown,clamping,empty tables,column occupancy and initial allocation. Real SDI/menu/accelerator/corner commands,repeat SelectAll,unchanged cursor/sheets/content/history and nested input selection. Related modified shared tests and100coverage if applicable. npm run typecheck;source-scoped eslint/prettier;module boundaries,docs,size,tree,resources,provenance,registry,routing,doctor;production build/static. Actual Chromium desktop/mobile selection acceptance. Preserve raw results and native/source pins,evaluator pass and clean finish. Next full all-app checkpoint70.

## Verification

Command: npm run test:coverage:calc -- --maxWorkers=1 --coverage.reportOnFailure --coverage.reportsDirectory=../../output/playwright/task61-calc-final-coverage --reporter=default --reporter=json --outputFile=../../output/playwright/task61-calc-final-results.json. Result: pass,exit0. Evidence:537tests/164files;130owners;S10830/B6741/F2006/L9724,all100percent. Scope: complete Calc application tests and coverage. Command(apps/office): node ../../node_modules/vitest/vitest.mjs run src/framework/browser/accelerators/keymapping.test.ts src/framework/browser/presentation/use-command-shortcuts.test.tsx src/sw/browser/presentation/WriterMenuBar.test.tsx --maxWorkers=1 --coverage --coverage.include=src/framework/browser/accelerators/keymapping.ts --coverage.reportsDirectory=../../output/playwright/task61-shared-final-coverage --reporter=default --reporter=json --outputFile=../../output/playwright/task61-shared-final-results.json. Result: pass. Evidence:11tests,shared key owner S25/B22/F6/L23,all100. Scope: actual changed shared owner and Writer menu consumers. Commands: source-scoped eslint and prettier;tools types;production build including app types and static smoke;dependencies,docs,size,source-tree,writer/calc resources,registry,provenance,routing,doctor. Result: pass;existing size/build advisories and doctor shim warning only. Browser: actual built preview4175 with installed Playwright CLI,1280/390px;area,repeat whole-sheet,corner,shared menu SelectData and native Mac input Meta+A. Result: pass;raw snapshots/screens and native input selection retained. Original Ctrl+A on Mac input uses OS control-key behavior,so native text selection verified using Meta+A. Full all-app next70;checkpoint60 retained.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-21T01:14:31.317Z — VERIFY — ok

By: CODER

Note: All537 Calc tests and130 owners100percent;11 shared/Writer tests and changed shared owner100percent. Types,lint,format,build/static,resources,registry,provenance,routing,doctor pass. Chromium desktop/mobile and native Mac input selection accepted;portable audit rechecks78 raw artifacts,41 source pins and14 native pins. Complete full-app checkpoint next70.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-21T01:12:09.823Z, excerpt_hash=sha256:50289ab55994b0b6082827fbc79e6c6eda0547c5545e131f920af8e5f1f21edf

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610210052-FZA8S9/blueprint/resolved-snapshot.json
- old_digest: 4fe63e239a4c198e0ea51486400fbe0d55a9f507387eb250dbbf9ab3ad058adc
- current_digest: 4fe63e239a4c198e0ea51486400fbe0d55a9f507387eb250dbbf9ab3ad058adc
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610210052-FZA8S9

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610210052-FZA8S9
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only source and metadata commits for this task;retain task evidence and do not reset user history or merge branches.

## Findings

Initial diagnostic Calc run retained ten stale zero-column assertions,all updated to native INITIALCOLCOUNT=1. Second run:537tests pass;coverage statements10831/10832,branches6743/6751. Added genuine missing area/failed-input cases. Three nonnegative column-allocation guards are invariant under actual initial1/grow-only columns and nonnegative valid coordinates;the port specializes these proved true branches without adding synthetic zero-column states or source coverage exclusions. Original conditional bodies and all valid-state behavior remain. Browser initial dev invocation passed --host through npm incorrectly;stopped only that task process and used actual built preview4175. A resized shared menubar recreated item references;refreshed snapshot before mobile acceptance. Known favicon404 is the only console resource error. Full all-app checkpoint60 is retained;next70. CALC247 records original clamping despite includeOld/onlyDown commentary;behavior unchanged.
