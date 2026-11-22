---
id: "202611220250-KE98GA"
title: "Connect Calc Format Cells typography and borders"
result_summary: "calc-format-cells-typography-and-borders"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on:
  - "202611220211-TEJDRR"
tags:
  - "calc"
  - "code"
verify:
  - "Run focused Calc dialog, grouped frame, ODS and shared border and font checks. Run TypeScript, changed-source lint and format, dependencies, provenance, Calc inventory, production and AgentPlane routing diagnostics. Close the tenth task before launching the full test checkpoint."
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T02:50:47.688Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T03:07:40.016Z"
  updated_by: "CODER"
  note: "Verified: native Calc typography and frame pages pass focused Office, ODS and production Chromium checks"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T03:08:00.468Z"
  updated_by: "EVALUATOR"
  note: "The Font, Font Effects and Borders pages use native pooled attributes and one view history operation. Exact source responsibilities for padding, diagonal lines, shadow and script language are covered by document and UI evidence."
  evaluated_sha: "93530ea32cf4e8be624a34b46b23a29da90e6a36"
  blueprint_digest: "590cb9cdc0fd7f413fe1a896007557757ffcf9d94b5228c0b1d310e349b2774b"
  evidence_refs:
    - ".agentplane/tasks/202611220250-KE98GA/README.md"
    - ".agentplane/tasks/202611220250-KE98GA/quality/20261122-030800468-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611220250-KE98GA/quality/20261122-030800468-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611220250-KE98GA/quality/20261122-030800468-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611220250-KE98GA/blueprint/resolved-snapshot.json"
    - "output/calc-task20-verification.md"
    - "output/calc-task20-tests-final.log"
    - "output/calc-task20-browser.log"
    - "output/calc-task20-types-final.log"
  findings:
    - "Same-agent review of the staged item ownership, actual frame and ODS state, pinned regression ports and browser paint."
commit:
  hash: "93530ea32cf4e8be624a34b46b23a29da90e6a36"
  message: "🧩 KE98GA code: connect Calc typography, borders and native cell ODS attributes"
comments:
  -
    author: "CODER"
    body: "Start: bind native Calc typography and border pages to the active Format Cells dialog and verify their document history."
  -
    author: "CODER"
    body: "Verified: Calc typography and border pages, native frame and ODS properties, single Undo and targeted Chromium checks"
events:
  -
    type: "status"
    at: "2026-11-22T02:50:48.131Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: bind native Calc typography and border pages to the active Format Cells dialog and verify their document history."
  -
    type: "verify"
    at: "2026-11-22T03:07:40.016Z"
    author: "CODER"
    state: "ok"
    note: "Verified: native Calc typography and frame pages pass focused Office, ODS and production Chromium checks"
  -
    type: "status"
    at: "2026-11-22T03:09:54.600Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Calc typography and border pages, native frame and ODS properties, single Undo and targeted Chromium checks"
doc_version: 3
doc_updated_at: "2026-11-22T03:09:54.601Z"
doc_updated_by: "CODER"
description: "Connect native Font, Font Effects and Borders pages over Calc item sets, selection frame, shared widgets, history and existing document representations."
sections:
  Summary: |-
    Connect Calc Format Cells typography and borders

    Connect native Font, Font Effects and Borders pages over Calc item sets, selection frame, shared widgets, history and existing document representations.
  Scope: "Port the Calc Format Cells Font, Font Effects and Borders tabs in upstream order for represented script and border items. Reuse shared font catalogs and frame-selector owner. Capture the original frame query, normalize the RTL sides like upstream, and apply scoped item deltas through the existing single reversible dialog. Extend existing Calc presentation and serialization only where needed for those represented attributes. Add source-derived focused cases and source registry evidence. Asian Typography admission and expanded background/custom-format administration remain subsequent."
  Plan: "Match shared border and font descriptors to pinned Calc snapshots and add the browser tabs in source order. Connect native items to the current shared dialog output and test selection, persistence and reversible history. Close with targeted evidence, then execute the requested full checkpoint."
  Verify Steps: "Run targeted Calc Format Cells, selection frame, grouped history and ODS and related shared border coverage. Verify production browser, types, changed-source lint/format, dependency and source registry checks, routing and doctor. Close this tenth task, then run the scheduled full Office, tooling, inventory and browser tests and repair in-scope failures without pausing the goal."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T03:07:40.016Z — VERIFY — ok

    By: CODER

    Note: Verified: native Calc typography and frame pages pass focused Office, ODS and production Chromium checks
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T03:07:20.036Z, excerpt_hash=sha256:8e0953df9ef1c3b1fb64ce34af163aa2fd91286b1833ad1ac21b61ea6ee5b73b

    Details:

    - Command: Office Calc Vitest config with calc-format-cells, ods-native-borders, border-frame, calc-shadow-relief, calc-overline and calc-strikeout. Result: pass, 33 tests in six files. The source-derived dialogue examples check all script sizes, effects, the restricted frame style choices and their two default widths, padding, the diagonal frame, cell shadow, ODS and one Undo.
    - Command: Office shared Vitest config with native-border-page, native-collapsing-border-page, chrlohdl and shadwhdl. Result: pass, 60 tests in four files. Scope includes the unchanged Writer border path, original locale conversion and shadow transport.
    - Command: vite build, check-static-build.mjs and production Playwright Chrome smoke. Result: pass. Confirmed the native Font, Font Effects and Borders pages, persisted emphasis position, live grid, original border default and Undo.
    - Commands: Office TypeScript, changed-source ESLint and Prettier, dependency validation, source tree, source provenance, Calc parity inventory, routing and AgentPlane doctor. Result: pass. Inventory has zero semantic violations. Doctor reports the existing managed-hook readiness warning.
    - The source format dialog's conditional Asian Typography and expanded number-format and fill administration are future work. Full suite follows this task closure per the tenth-task cadence.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611220250-KE98GA/blueprint/resolved-snapshot.json
    - old_digest: 590cb9cdc0fd7f413fe1a896007557757ffcf9d94b5228c0b1d310e349b2774b
    - current_digest: 590cb9cdc0fd7f413fe1a896007557757ffcf9d94b5228c0b1d310e349b2774b
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611220250-KE98GA

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611220250-KE98GA
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - Calc uses the original three font script groups and pooled font effects. The common Format Cells request applies font, effects and borders together through native attribute history. Native device fonts and CSS own browser-specific previews and paint.
    - Calc Borders uses the original selection frame and RTL normalization, the seven supported line styles, the 0.75 pt default, the separate margin item, the two diagonal line items and the Calc adjacent-border erase option.
    - Source ODS cell mapping now writes and reads independent padding, shadow, script language, emphasis and line-mode attributes using the shared locale/shadow handlers and native item values. The former padding diagnostic test now verifies actual imported padding alongside unchanged border diagnostics.
    - Conditional Asian Typography, advanced custom number-format administration and additional background selectors remain follow-up work. This task implements the three Font script groups independently of the Asian Typography tab.
    - The full scheduled test checkpoint starts after closure. Retain the existing open/save/autosave/recovery decisions.
id_source: "generated"
---
## Summary

Connect Calc Format Cells typography and borders

Connect native Font, Font Effects and Borders pages over Calc item sets, selection frame, shared widgets, history and existing document representations.

## Scope

Port the Calc Format Cells Font, Font Effects and Borders tabs in upstream order for represented script and border items. Reuse shared font catalogs and frame-selector owner. Capture the original frame query, normalize the RTL sides like upstream, and apply scoped item deltas through the existing single reversible dialog. Extend existing Calc presentation and serialization only where needed for those represented attributes. Add source-derived focused cases and source registry evidence. Asian Typography admission and expanded background/custom-format administration remain subsequent.

## Plan

Match shared border and font descriptors to pinned Calc snapshots and add the browser tabs in source order. Connect native items to the current shared dialog output and test selection, persistence and reversible history. Close with targeted evidence, then execute the requested full checkpoint.

## Verify Steps

Run targeted Calc Format Cells, selection frame, grouped history and ODS and related shared border coverage. Verify production browser, types, changed-source lint/format, dependency and source registry checks, routing and doctor. Close this tenth task, then run the scheduled full Office, tooling, inventory and browser tests and repair in-scope failures without pausing the goal.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T03:07:40.016Z — VERIFY — ok

By: CODER

Note: Verified: native Calc typography and frame pages pass focused Office, ODS and production Chromium checks
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T03:07:20.036Z, excerpt_hash=sha256:8e0953df9ef1c3b1fb64ce34af163aa2fd91286b1833ad1ac21b61ea6ee5b73b

Details:

- Command: Office Calc Vitest config with calc-format-cells, ods-native-borders, border-frame, calc-shadow-relief, calc-overline and calc-strikeout. Result: pass, 33 tests in six files. The source-derived dialogue examples check all script sizes, effects, the restricted frame style choices and their two default widths, padding, the diagonal frame, cell shadow, ODS and one Undo.
- Command: Office shared Vitest config with native-border-page, native-collapsing-border-page, chrlohdl and shadwhdl. Result: pass, 60 tests in four files. Scope includes the unchanged Writer border path, original locale conversion and shadow transport.
- Command: vite build, check-static-build.mjs and production Playwright Chrome smoke. Result: pass. Confirmed the native Font, Font Effects and Borders pages, persisted emphasis position, live grid, original border default and Undo.
- Commands: Office TypeScript, changed-source ESLint and Prettier, dependency validation, source tree, source provenance, Calc parity inventory, routing and AgentPlane doctor. Result: pass. Inventory has zero semantic violations. Doctor reports the existing managed-hook readiness warning.
- The source format dialog's conditional Asian Typography and expanded number-format and fill administration are future work. Full suite follows this task closure per the tenth-task cadence.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611220250-KE98GA/blueprint/resolved-snapshot.json
- old_digest: 590cb9cdc0fd7f413fe1a896007557757ffcf9d94b5228c0b1d310e349b2774b
- current_digest: 590cb9cdc0fd7f413fe1a896007557757ffcf9d94b5228c0b1d310e349b2774b
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611220250-KE98GA

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611220250-KE98GA
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- Calc uses the original three font script groups and pooled font effects. The common Format Cells request applies font, effects and borders together through native attribute history. Native device fonts and CSS own browser-specific previews and paint.
- Calc Borders uses the original selection frame and RTL normalization, the seven supported line styles, the 0.75 pt default, the separate margin item, the two diagonal line items and the Calc adjacent-border erase option.
- Source ODS cell mapping now writes and reads independent padding, shadow, script language, emphasis and line-mode attributes using the shared locale/shadow handlers and native item values. The former padding diagnostic test now verifies actual imported padding alongside unchanged border diagnostics.
- Conditional Asian Typography, advanced custom number-format administration and additional background selectors remain follow-up work. This task implements the three Font script groups independently of the Asian Typography tab.
- The full scheduled test checkpoint starts after closure. Retain the existing open/save/autosave/recovery decisions.
