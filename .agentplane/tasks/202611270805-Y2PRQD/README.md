---
id: "202611270805-Y2PRQD"
title: "Paint native cell orientation and line breaks in the Calc grid"
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
  updated_at: "2026-11-27T08:05:54.016Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-28T08:19:21.268Z"
  updated_by: "CODER"
  note: "40 targeted tests passed, followed by 8 after the final alignment change. Chromium viewport and Worker checks passed with the cached browser and a viewport timeout retry. Scoped source checks passed; global evidence markers retain inherited failures."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-28T08:19:36.619Z"
  updated_by: "EVALUATOR"
  note: "The original cell paint choices now feed the Calc grid. Scoped tests and real Chromium wrapping and ODS checks passed."
  evaluated_sha: "764c31ed57ad16427170621c84be5cbc6da1e1ad"
  blueprint_digest: "a0dde705beedc6d42c97b501e0e1520fe816228fde211ec406576aa92f2d89d2"
  evidence_refs:
    - ".agentplane/tasks/202611270805-Y2PRQD/README.md"
    - ".agentplane/tasks/202611270805-Y2PRQD/quality/20261128-081936619-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611270805-Y2PRQD/quality/20261128-081936619-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611270805-Y2PRQD/quality/20261128-081936619-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611270805-Y2PRQD/blueprint/resolved-snapshot.json"
    - "output/calc-next/Y2PRQD-final-tests.log"
    - "output/calc-next/Y2PRQD-layout-tests.log"
    - "output/calc-next/Y2PRQD-browser-relaxed.log"
  findings:
    - "Conditional orientation and the exact half-turn retain the pinned paint decisions."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-27T08:06:02.320Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-28T08:19:21.268Z"
    author: "CODER"
    state: "ok"
    note: "40 targeted tests passed, followed by 8 after the final alignment change. Chromium viewport and Worker checks passed with the cached browser and a viewport timeout retry. Scoped source checks passed; global evidence markers retain inherited failures."
doc_version: 3
doc_updated_at: "2026-11-28T08:19:21.321Z"
doc_updated_by: "CODER"
description: "Consume native Calc text orientation and wrapping attributes in the normal grid painter. Route the represented plain and rich text display through the original orientation, Asian vertical and wrap decisions, honor source rotation reference positions, and use DOM/CSS layout for the resulting cell text. Preserve the existing value display, script font runs, conditional style precedence, direction, protection and editor focus. Extend the source owner only where the grid needs an original decision that is currently missing. Keep dependent drawing and editing behavior within the supported browser grid slice."
sections:
  Summary: |-
    Paint native cell orientation and line breaks in the Calc grid

    Consume native Calc text orientation and wrapping attributes in the normal grid painter. Route the represented plain and rich text display through the original orientation, Asian vertical and wrap decisions, honor source rotation reference positions, and use DOM/CSS layout for the resulting cell text. Preserve the existing value display, script font runs, conditional style precedence, direction, protection and editor focus. Extend the source owner only where the grid needs an original decision that is currently missing. Keep dependent drawing and editing behavior within the supported browser grid slice.
  Scope: "Consume native Calc text orientation and wrapping attributes in the normal grid painter. Route the represented plain and rich text display through the original orientation, Asian vertical and wrap decisions, honor source rotation reference positions, and use DOM/CSS layout for the resulting cell text. Preserve the existing value display, script font runs, conditional style precedence, direction, protection and editor focus. Extend the source owner only where the grid needs an original decision that is currently missing. Keep dependent drawing and editing behavior within the supported browser grid slice."
  Plan: "Trace native geometry and triage text modes, integrate the regular grid display path, and verify loaded and edited styles with focused browser and native tests."
  Verify Steps: |-
    - Trace the pinned ScOutputData and ScPatternAttr orientation and line-break decisions and the existing browser grid entry points.
    - Verify the real Format Cells to grid path, conditional cell patterns, wrapped and stacked text, Asian layout, quarter-turn and represented rotation reference modes, and undo and ODS reopen. Keep existing grid selection and input tests targeted.
    - Run Office typecheck, changed-source lint/format/JSDoc, dependency and source structure, scoped provenance, inventory, routing and doctor. Record unrelated integration metadata failures separately.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-28T08:19:21.268Z — VERIFY — ok

    By: CODER

    Note: 40 targeted tests passed, followed by 8 after the final alignment change. Chromium viewport and Worker checks passed with the cached browser and a viewport timeout retry. Scoped source checks passed; global evidence markers retain inherited failures.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T08:19:20.659Z, excerpt_hash=sha256:58c17814adf83203d244bfbd3f4ccab163167f64c4c36dcdbe6d86eef077a72a

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611270805-Y2PRQD/blueprint/resolved-snapshot.json
    - old_digest: a0dde705beedc6d42c97b501e0e1520fe816228fde211ec406576aa92f2d89d2
    - current_digest: a0dde705beedc6d42c97b501e0e1520fe816228fde211ec406576aa92f2d89d2
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611270805-Y2PRQD

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611270805-Y2PRQD
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
    - **Command:** From apps/office, run the scope-configured Vitest suite against calc-cell-text-layout, calc-wrap-text, calc-cell-selection, calc-font-family, calc-conditional-format and ods-native-alignment with two workers. **Result:** pass. **Evidence:** 40 passed across six files. **Scope:** Format Cells to grid, ordinary and conditional styles, undo, ODS, numeric wrap suppression, script font runs and selection.
    - **Command:** Repeat calc-cell-text-layout and calc-wrap-text with one worker after adding the pinned top-right Asian default. **Result:** pass. **Evidence:** see Y2PRQD-layout-tests.log. **Scope:** final changed grid behavior and the pinned tdf121040 workbook.
    - **Command:** Office typecheck, scoped ESLint, Prettier, JSDoc and provenance, dependency/source-tree checks, AgentPlane routing and doctor. **Result:** pass. **Evidence:** scoped checks and two provenance records validated. **Scope:** affected sources, registry and workflow. The existing AgentPlane hook warning remains.
    - **Command:** Global source provenance and Calc/shared inventory. **Result:** fail at inherited integration evidence. **Evidence:** absent Writer overline marker and shared rawLineStart marker. **Scope:** pre-existing global verification drift outside these changes.
    - **Source behavior:** CALC-853 records the pinned exact half-turn adjustment to 179.5 degrees and inside-cell reference. Default Asian vertical layout starts top-right.
    - **Rendering boundary:** Browser writing modes and transforms keep the grid's existing clipping. Native cross-cell rotated overflow and output-device text metrics remain separate work.
    - **Command:** `npm run build` and targeted `wrap-text.spec.ts` on Calc with one Chromium worker. **Result:** pass across the worker run and viewport retries. **Evidence:** the bundled Chromium revision was absent. The retry selected the locally cached Chromium 1228, passed the DOM-free Worker case and reached the existing 30-second timeout on both viewport cases. Re-running those two cases with a 90-second command timeout passed their layout, Undo/Redo, IndexedDB and ODS reopen checks. **Scope:** baseline wrapping and persistence at 1280 px and 390 px.

    - Observation: The pinned DrawRotated path maps the exact half-turn to 179.5 degrees with standard inside-cell rotation.
      Impact: The displayed half-turn differs from the stored angle and reference.
      Resolution: Preserved the paint decision and recorded CALC-853 with a mounted grid regression.
id_source: "generated"
---
## Summary

Paint native cell orientation and line breaks in the Calc grid

Consume native Calc text orientation and wrapping attributes in the normal grid painter. Route the represented plain and rich text display through the original orientation, Asian vertical and wrap decisions, honor source rotation reference positions, and use DOM/CSS layout for the resulting cell text. Preserve the existing value display, script font runs, conditional style precedence, direction, protection and editor focus. Extend the source owner only where the grid needs an original decision that is currently missing. Keep dependent drawing and editing behavior within the supported browser grid slice.

## Scope

Consume native Calc text orientation and wrapping attributes in the normal grid painter. Route the represented plain and rich text display through the original orientation, Asian vertical and wrap decisions, honor source rotation reference positions, and use DOM/CSS layout for the resulting cell text. Preserve the existing value display, script font runs, conditional style precedence, direction, protection and editor focus. Extend the source owner only where the grid needs an original decision that is currently missing. Keep dependent drawing and editing behavior within the supported browser grid slice.

## Plan

Trace native geometry and triage text modes, integrate the regular grid display path, and verify loaded and edited styles with focused browser and native tests.

## Verify Steps

- Trace the pinned ScOutputData and ScPatternAttr orientation and line-break decisions and the existing browser grid entry points.
- Verify the real Format Cells to grid path, conditional cell patterns, wrapped and stacked text, Asian layout, quarter-turn and represented rotation reference modes, and undo and ODS reopen. Keep existing grid selection and input tests targeted.
- Run Office typecheck, changed-source lint/format/JSDoc, dependency and source structure, scoped provenance, inventory, routing and doctor. Record unrelated integration metadata failures separately.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-28T08:19:21.268Z — VERIFY — ok

By: CODER

Note: 40 targeted tests passed, followed by 8 after the final alignment change. Chromium viewport and Worker checks passed with the cached browser and a viewport timeout retry. Scoped source checks passed; global evidence markers retain inherited failures.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T08:19:20.659Z, excerpt_hash=sha256:58c17814adf83203d244bfbd3f4ccab163167f64c4c36dcdbe6d86eef077a72a

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611270805-Y2PRQD/blueprint/resolved-snapshot.json
- old_digest: a0dde705beedc6d42c97b501e0e1520fe816228fde211ec406576aa92f2d89d2
- current_digest: a0dde705beedc6d42c97b501e0e1520fe816228fde211ec406576aa92f2d89d2
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611270805-Y2PRQD

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611270805-Y2PRQD
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

- **Command:** From apps/office, run the scope-configured Vitest suite against calc-cell-text-layout, calc-wrap-text, calc-cell-selection, calc-font-family, calc-conditional-format and ods-native-alignment with two workers. **Result:** pass. **Evidence:** 40 passed across six files. **Scope:** Format Cells to grid, ordinary and conditional styles, undo, ODS, numeric wrap suppression, script font runs and selection.
- **Command:** Repeat calc-cell-text-layout and calc-wrap-text with one worker after adding the pinned top-right Asian default. **Result:** pass. **Evidence:** see Y2PRQD-layout-tests.log. **Scope:** final changed grid behavior and the pinned tdf121040 workbook.
- **Command:** Office typecheck, scoped ESLint, Prettier, JSDoc and provenance, dependency/source-tree checks, AgentPlane routing and doctor. **Result:** pass. **Evidence:** scoped checks and two provenance records validated. **Scope:** affected sources, registry and workflow. The existing AgentPlane hook warning remains.
- **Command:** Global source provenance and Calc/shared inventory. **Result:** fail at inherited integration evidence. **Evidence:** absent Writer overline marker and shared rawLineStart marker. **Scope:** pre-existing global verification drift outside these changes.
- **Source behavior:** CALC-853 records the pinned exact half-turn adjustment to 179.5 degrees and inside-cell reference. Default Asian vertical layout starts top-right.
- **Rendering boundary:** Browser writing modes and transforms keep the grid's existing clipping. Native cross-cell rotated overflow and output-device text metrics remain separate work.
- **Command:** `npm run build` and targeted `wrap-text.spec.ts` on Calc with one Chromium worker. **Result:** pass across the worker run and viewport retries. **Evidence:** the bundled Chromium revision was absent. The retry selected the locally cached Chromium 1228, passed the DOM-free Worker case and reached the existing 30-second timeout on both viewport cases. Re-running those two cases with a 90-second command timeout passed their layout, Undo/Redo, IndexedDB and ODS reopen checks. **Scope:** baseline wrapping and persistence at 1280 px and 390 px.

- Observation: The pinned DrawRotated path maps the exact half-turn to 179.5 degrees with standard inside-cell rotation.
  Impact: The displayed half-turn differs from the stored angle and reference.
  Resolution: Preserved the paint decision and recorded CALC-853 with a mounted grid regression.
