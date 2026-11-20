---
id: "202611201238-Q3GS36"
title: "Connect Calc freeze rows and sheet pane commands"
result_summary: "Connect Calc row freezing and sheet pane commands"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify:
  - "Playwright Calc pane specs for XLSX frozen and split grids"
  - "npm run check:calc-resources"
  - "npm run test:calc -- calc-pane-commands viewdata"
  - "npm run typecheck"
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T12:39:22.091Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-20T13:37:28.969Z"
  updated_by: "CODER"
  note: "All 16 focused Calc cases and three production Chrome cases passed. Freeze First Row works from the scrolled View menu and exports the expected XLSX pane. Final types, resources, provenance and related gates pass."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-20T13:38:01.323Z"
  updated_by: "EVALUATOR"
  note: "Calc pane commands meet the approved desktop slice"
  evaluated_sha: "a68b5031718386d2c100716d5f31dbbe92d6f251"
  blueprint_digest: "070b8625598388b2760f69c3002c156f739f8f94de762feb4cc2b126152adf26"
  evidence_refs:
    - ".agentplane/tasks/202611201238-Q3GS36/README.md"
    - ".agentplane/tasks/202611201238-Q3GS36/quality/20261120-133801323-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611201238-Q3GS36/quality/20261120-133801323-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611201238-Q3GS36/quality/20261120-133801323-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611201238-Q3GS36/blueprint/resolved-snapshot.json"
    - "output/calc-Q3GS36-tests-final.log"
    - "output/calc-Q3GS36-browser-dist.log"
    - "output/calc-Q3GS36-browser-row-replay.log"
  findings:
    - "Chrome verifies freezing a scrolled-away first row and XLSX persistence; focused source tests verify typed row counts, pane transitions and the native GoToStart regression."
commit:
  hash: "a68b5031718386d2c100716d5f31dbbe92d6f251"
  message: "🧩 Q3GS36 code: connect Calc freeze rows and pane commands"
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Verified: Calc first row stays frozen while the lower pane scrolls and exports correctly to XLSX. All focused cases, Chrome pane cases, types and source gates passed."
events:
  -
    type: "status"
    at: "2026-11-20T12:43:45.925Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-20T13:37:28.969Z"
    author: "CODER"
    state: "ok"
    note: "All 16 focused Calc cases and three production Chrome cases passed. Freeze First Row works from the scrolled View menu and exports the expected XLSX pane. Final types, resources, provenance and related gates pass."
  -
    type: "status"
    at: "2026-11-20T13:38:25.506Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Calc first row stays frozen while the lower pane scrolls and exports correctly to XLSX. All focused cases, Chrome pane cases, types and source gates passed."
doc_version: 3
doc_updated_at: "2026-11-20T13:38:25.507Z"
doc_updated_by: "CODER"
description: "Prioritize Freeze First Row, then connect the related cursor and column freeze and split commands to the real pane owners. Preserve source mode transitions, active pane, applicable navigation and XLSX view settings; exercise production Calc with focused tests."
sections:
  Summary: "Connect the existing Calc pane model and grid to the source View menu and toolbar, starting with Freeze First Row."
  Scope: "Calc freeze and split slot state and execution, current-sheet pane modes, origins, active pane, and the source freeze-aware start-of-sheet navigation exercised by native QA. Reuse the existing browser pane renderer and supported XLSX view settings. Preserve the browser file workflow."
  Plan: "Implement Freeze First Row first, then the companion pane commands and their source-backed focused tests."
  Verify Steps: |-
    - `npm run test:calc -- calc-pane-commands viewdata` verifies pane slot, view ownership, origin, cursor and settings behavior.
    - `npm run typecheck` checks app and tooling types.
    - `npm run check:calc-resources` preserves pinned resource placements.
    - Run the related Calc XLSX frozen-grid and split-grid Playwright specs against a fresh production build.
    - `git diff --check` checks patch whitespace.
  Verification: |-
    Final scoped Calc Vitest run passed all 16 tests in three files. The three pane command cases cover the off-screen first row, typed row index, per-sheet and independent axes, native GoToStart and split conversions. Five slow view-settings cases in the first run timed out during host contention; all recovered in targeted and final runs with unchanged assertions. Final npm run typecheck passed. Vite built the production bundle into an isolated ignored output path. Production Playwright used installed Google Chrome and an isolated port. Both pinned frozen/normal XLSX grid specs passed, and the new first-row menu test passed its isolated replay after its XML assertion was corrected to include the exporter’s explicit xSplit=0. Calc resources, provenance, module boundaries, file size, changed-file lint, routing and diff checks passed. Doctor reported only the existing managed hook shim warning.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-20T13:37:28.969Z — VERIFY — ok

    By: CODER

    Note: All 16 focused Calc cases and three production Chrome cases passed. Freeze First Row works from the scrolled View menu and exports the expected XLSX pane. Final types, resources, provenance and related gates pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T13:37:28.256Z, excerpt_hash=sha256:eb0921816f29470fb87c718bf5de216b1af2f36b99da3bcb6b1ff66acf928a38

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611201238-Q3GS36/blueprint/resolved-snapshot.json
    - old_digest: 070b8625598388b2760f69c3002c156f739f8f94de762feb4cc2b126152adf26
    - current_digest: 070b8625598388b2760f69c3002c156f739f8f94de762feb4cc2b126152adf26
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611201238-Q3GS36

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611201238-Q3GS36
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the pane command implementation and keep the previously supported XLSX pane imports and renderer."
  Findings: "Source Freeze First Row restores row zero when it is above the viewport and retains the lower origin. The desktop cursor toggle removes a fixed split, and Split Window turns a fixed split into normal panes. GoToStart follows tdf107994 and uses the editable side of fixed panes. The source can mark an already-unsplit view modified when freezing a zero boundary (CALC-782). The view uses the existing browser device geometry and per-sheet view model. The LibreOfficeKit window profile and native drawing-window services are outside this desktop command slice."
id_source: "generated"
---
## Summary

Connect the existing Calc pane model and grid to the source View menu and toolbar, starting with Freeze First Row.

## Scope

Calc freeze and split slot state and execution, current-sheet pane modes, origins, active pane, and the source freeze-aware start-of-sheet navigation exercised by native QA. Reuse the existing browser pane renderer and supported XLSX view settings. Preserve the browser file workflow.

## Plan

Implement Freeze First Row first, then the companion pane commands and their source-backed focused tests.

## Verify Steps

- `npm run test:calc -- calc-pane-commands viewdata` verifies pane slot, view ownership, origin, cursor and settings behavior.
- `npm run typecheck` checks app and tooling types.
- `npm run check:calc-resources` preserves pinned resource placements.
- Run the related Calc XLSX frozen-grid and split-grid Playwright specs against a fresh production build.
- `git diff --check` checks patch whitespace.

## Verification

Final scoped Calc Vitest run passed all 16 tests in three files. The three pane command cases cover the off-screen first row, typed row index, per-sheet and independent axes, native GoToStart and split conversions. Five slow view-settings cases in the first run timed out during host contention; all recovered in targeted and final runs with unchanged assertions. Final npm run typecheck passed. Vite built the production bundle into an isolated ignored output path. Production Playwright used installed Google Chrome and an isolated port. Both pinned frozen/normal XLSX grid specs passed, and the new first-row menu test passed its isolated replay after its XML assertion was corrected to include the exporter’s explicit xSplit=0. Calc resources, provenance, module boundaries, file size, changed-file lint, routing and diff checks passed. Doctor reported only the existing managed hook shim warning.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-20T13:37:28.969Z — VERIFY — ok

By: CODER

Note: All 16 focused Calc cases and three production Chrome cases passed. Freeze First Row works from the scrolled View menu and exports the expected XLSX pane. Final types, resources, provenance and related gates pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T13:37:28.256Z, excerpt_hash=sha256:eb0921816f29470fb87c718bf5de216b1af2f36b99da3bcb6b1ff66acf928a38

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611201238-Q3GS36/blueprint/resolved-snapshot.json
- old_digest: 070b8625598388b2760f69c3002c156f739f8f94de762feb4cc2b126152adf26
- current_digest: 070b8625598388b2760f69c3002c156f739f8f94de762feb4cc2b126152adf26
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611201238-Q3GS36

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611201238-Q3GS36
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the pane command implementation and keep the previously supported XLSX pane imports and renderer.

## Findings

Source Freeze First Row restores row zero when it is above the viewport and retains the lower origin. The desktop cursor toggle removes a fixed split, and Split Window turns a fixed split into normal panes. GoToStart follows tdf107994 and uses the editable side of fixed panes. The source can mark an already-unsplit view modified when freezing a zero boundary (CALC-782). The view uses the existing browser device geometry and per-sheet view model. The LibreOfficeKit window profile and native drawing-window services are outside this desktop command slice.
