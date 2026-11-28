---
id: "202611280817-ED3879"
title: "Connect the native Writer Navigator Navigate By controls"
result_summary: "Connected the native Navigate By controls and physical viewport movement."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "navigator"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run only affected Writer Navigator, cursor, search and command tests and scoped static checks. Run focused Chromium Navigator scenarios for physical viewport scrolling, direction and focus."
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T08:17:40.488Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-28T08:27:38.418Z"
  updated_by: "CODER"
  note: "Verified: 35 focused Vitest cases, nine existing Chromium cases and two new focused Chromium scenarios. TypeScript, production Vite, scoped lint, formatting, Writer resources, module boundaries, source tree, routing and eight scoped provenance checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-28T08:27:38.858Z"
  updated_by: "EVALUATOR"
  note: "Writer Navigator connects the native navigation selector and directional view slots for model targets and physical pages."
  evaluated_sha: "e649f15cbb14e426828d37130fd4fb3ca3e5393e"
  blueprint_digest: "8c95f60c1221deea8f9b0b5ba49466423e5bbcbcdc66b426f35a08b404babf44"
  evidence_refs:
    - ".agentplane/tasks/202611280817-ED3879/README.md"
    - ".agentplane/tasks/202611280817-ED3879/quality/20261128-082738858-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611280817-ED3879/quality/20261128-082738858-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611280817-ED3879/quality/20261128-082738858-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611280817-ED3879/blueprint/resolved-snapshot.json"
    - "output/playwright/writer-navigator-movement-final-vitest.log"
    - "output/playwright/writer-navigator-movement-chromium.log"
    - "output/playwright/writer-navigator-movement-chromium-recheck.log"
  findings:
    - "Direction, bookmark ranges, heading edge behavior, browser focus, page wrapping and caret preservation were exercised."
commit:
  hash: "e649f15cbb14e426828d37130fd4fb3ca3e5393e"
  message: "🧩 ED3879 code: Connect Writer Navigator movement"
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Verified: affected Writer suites, eleven Chromium cases and production build."
events:
  -
    type: "status"
    at: "2026-11-28T08:17:55.423Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-28T08:27:38.418Z"
    author: "CODER"
    state: "ok"
    note: "Verified: 35 focused Vitest cases, nine existing Chromium cases and two new focused Chromium scenarios. TypeScript, production Vite, scoped lint, formatting, Writer resources, module boundaries, source tree, routing and eight scoped provenance checks passed."
  -
    type: "status"
    at: "2026-11-28T08:29:07.139Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: affected Writer suites, eleven Chromium cases and production build."
doc_version: 3
doc_updated_at: "2026-11-28T08:29:07.141Z"
doc_updated_by: "CODER"
description: "Expose the native Navigate By selector and previous and next controls for represented document targets. Connect the view slots, physical page viewport movement with wrapping, and model traversal for headings, tables, bookmarks, comments and repeat search."
sections:
  Summary: |-
    Connect the native Writer Navigator Navigate By controls

    Expose the native Navigate By selector and previous and next controls for represented document targets. Connect the view slots, physical page viewport movement with wrapping, and model traversal for headings, tables, bookmarks, comments and repeat search.
  Scope: |-
    - In scope: Expose the native Navigate By selector and previous and next controls for represented document targets. Connect the view slots, physical page viewport movement with wrapping, and model traversal for headings, tables, bookmarks, comments and repeat search.
    - Out of scope: unrelated refactors not required for "Connect the native Writer Navigator Navigate By controls".
  Plan: "Use both Graphify indexes and pinned workctrl, viewmdi and navigatorpanel sources to port the represented Navigate By IDs, order and relevant slots. Keep model traversal and current selection in Writer, expose viewport paging through the browser view, and reuse the existing annotation and search owners. Split the Navigator navigation toolbar from the content-tree renderer. Add focused checks for ordering, wrap, unchanged cursor during viewport scrolling, and real keyboard and pointer use. Run only affected suites and scoped static checks."
  Verify Steps: "Run affected Navigator, cursor, view-slot, repeat-search and configuration cases as applicable, the focused Chromium Navigator flows, and scoped source checks, TypeScript and Vite build. No full test run."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-28T08:27:38.418Z — VERIFY — ok

    By: CODER

    Note: Verified: 35 focused Vitest cases, nine existing Chromium cases and two new focused Chromium scenarios. TypeScript, production Vite, scoped lint, formatting, Writer resources, module boundaries, source tree, routing and eight scoped provenance checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T08:27:37.845Z, excerpt_hash=sha256:13867a9a09be6c4284cea625b1f90f46d200efa047790a4e8cd5fc39aedba7ab

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611280817-ED3879/blueprint/resolved-snapshot.json
    - old_digest: 8c95f60c1221deea8f9b0b5ba49466423e5bbcbcdc66b426f35a08b404babf44
    - current_digest: 8c95f60c1221deea8f9b0b5ba49466423e5bbcbcdc66b426f35a08b404babf44
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611280817-ED3879

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611280817-ED3879
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
  Findings: "Native Navigate By uses the represented IDs and chooser order from workctrl. Page arrows use the browser viewport and preserve the model caret. Heading traversal retains the source edge documented as WRITER-760. Bookmark traversal selects the range with the original moving end. Comment movement uses visible model fields and the existing annotation manager, and Repeat Search temporarily uses the chosen direction. Table navigation covers represented body table starts. Native layout eligibility for protected or nested tables and navigation families outside this document profile remain open. The focused standard configuration skipped six optional ICU-probe cases. The Chromium focus fixture now checks the actual editing host."
id_source: "generated"
---
## Summary

Connect the native Writer Navigator Navigate By controls

Expose the native Navigate By selector and previous and next controls for represented document targets. Connect the view slots, physical page viewport movement with wrapping, and model traversal for headings, tables, bookmarks, comments and repeat search.

## Scope

- In scope: Expose the native Navigate By selector and previous and next controls for represented document targets. Connect the view slots, physical page viewport movement with wrapping, and model traversal for headings, tables, bookmarks, comments and repeat search.
- Out of scope: unrelated refactors not required for "Connect the native Writer Navigator Navigate By controls".

## Plan

Use both Graphify indexes and pinned workctrl, viewmdi and navigatorpanel sources to port the represented Navigate By IDs, order and relevant slots. Keep model traversal and current selection in Writer, expose viewport paging through the browser view, and reuse the existing annotation and search owners. Split the Navigator navigation toolbar from the content-tree renderer. Add focused checks for ordering, wrap, unchanged cursor during viewport scrolling, and real keyboard and pointer use. Run only affected suites and scoped static checks.

## Verify Steps

Run affected Navigator, cursor, view-slot, repeat-search and configuration cases as applicable, the focused Chromium Navigator flows, and scoped source checks, TypeScript and Vite build. No full test run.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-28T08:27:38.418Z — VERIFY — ok

By: CODER

Note: Verified: 35 focused Vitest cases, nine existing Chromium cases and two new focused Chromium scenarios. TypeScript, production Vite, scoped lint, formatting, Writer resources, module boundaries, source tree, routing and eight scoped provenance checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T08:27:37.845Z, excerpt_hash=sha256:13867a9a09be6c4284cea625b1f90f46d200efa047790a4e8cd5fc39aedba7ab

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611280817-ED3879/blueprint/resolved-snapshot.json
- old_digest: 8c95f60c1221deea8f9b0b5ba49466423e5bbcbcdc66b426f35a08b404babf44
- current_digest: 8c95f60c1221deea8f9b0b5ba49466423e5bbcbcdc66b426f35a08b404babf44
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611280817-ED3879

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611280817-ED3879
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

Native Navigate By uses the represented IDs and chooser order from workctrl. Page arrows use the browser viewport and preserve the model caret. Heading traversal retains the source edge documented as WRITER-760. Bookmark traversal selects the range with the original moving end. Comment movement uses visible model fields and the existing annotation manager, and Repeat Search temporarily uses the chosen direction. Table navigation covers represented body table starts. Native layout eligibility for protected or nested tables and navigation families outside this document profile remain open. The focused standard configuration skipped six optional ICU-probe cases. The Chromium focus fixture now checks the actual editing host.
