---
id: "202608130643-JD4KF6"
title: "Promote and demote active Writer list levels"
result_summary: "Implemented Writer list-level Promote and Demote at the pinned list-shell, menu, numbering-toolbar, document-view, and parity ownership boundaries."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-13T06:43:46.723Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-13T07:00:43.098Z"
  updated_by: "CODER"
  note: "Verified: npm run test:coverage passed 79 tests at 100 percent; focused Writer list Chromium test passed; parity inventory resolved 112 evidence items with 0 exceptions; format, lint, typecheck, JSDoc, file-size, source-tree, doctor, and routing checks passed. Full suite remains deferred under the approved ten-task cadence."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-13T07:00:37.989Z"
  updated_by: "EVALUATOR"
  note: "Bounded active Writer list levels are implemented at matching list-shell, menu, toolbar, document-view, and source-tree ownership paths."
  evaluated_sha: "5ebfb3fb060525ae7a641f978b1816c00c54ab67"
  blueprint_digest: "623f2db54c27ccc215b8c381a1deffcbbc5ba8d99f57832c94078726705d7d11"
  evidence_refs:
    - ".agentplane/tasks/202608130643-JD4KF6/README.md"
    - ".agentplane/tasks/202608130643-JD4KF6/quality/20260813-070037989-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608130643-JD4KF6/quality/20260813-070037989-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608130643-JD4KF6/quality/20260813-070037989-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608130643-JD4KF6/blueprint/resolved-snapshot.json"
    - "5ebfb3fb0605"
  findings:
    - "Fast coverage, focused Chromium, parity inventory, source-tree gate, and static quality checks passed; full suite is deferred under the approved ten-task cadence."
commit:
  hash: "5ebfb3fb060525ae7a641f978b1816c00c54ab67"
  message: "✨ JD4KF6 code: add Writer list-level commands"
comments:
  -
    author: "CODER"
    body: "Start: Implementing bounded Writer list-level Promote and Demote commands in their pinned list-shell and UI configuration ownership paths."
  -
    author: "CODER"
    body: "Verified: bounded Writer Promote and Demote list levels passed fast coverage, focused Chromium, parity/source-tree evidence, and quality gates; full suite is deferred by cadence."
events:
  -
    type: "status"
    at: "2026-08-13T06:43:47.313Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implementing bounded Writer list-level Promote and Demote commands in their pinned list-shell and UI configuration ownership paths."
  -
    type: "verify"
    at: "2026-08-13T07:00:43.098Z"
    author: "CODER"
    state: "ok"
    note: "Verified: npm run test:coverage passed 79 tests at 100 percent; focused Writer list Chromium test passed; parity inventory resolved 112 evidence items with 0 exceptions; format, lint, typecheck, JSDoc, file-size, source-tree, doctor, and routing checks passed. Full suite remains deferred under the approved ten-task cadence."
  -
    type: "status"
    at: "2026-08-13T07:01:08.923Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: bounded Writer Promote and Demote list levels passed fast coverage, focused Chromium, parity/source-tree evidence, and quality gates; full suite is deferred by cadence."
doc_version: 3
doc_updated_at: "2026-08-13T07:01:08.925Z"
doc_updated_by: "CODER"
description: "Implement the pinned Writer .uno:IncrementLevel and .uno:DecrementLevel commands for the active list paragraph, including bounded list-level state transitions, LO-positioned menu and numbering toolbar controls, document indentation, tests, parity evidence, and documentation."
sections:
  Summary: |-
    Promote and demote active Writer list levels

    Implement the pinned Writer .uno:IncrementLevel and .uno:DecrementLevel commands for the active list paragraph, including bounded list-level state transitions, LO-positioned menu and numbering toolbar controls, document indentation, tests, parity evidence, and documentation.
  Scope: |-
    - In scope: Implement the pinned Writer .uno:IncrementLevel and .uno:DecrementLevel commands for the active list paragraph, including bounded list-level state transitions, LO-positioned menu and numbering toolbar controls, document indentation, tests, parity evidence, and documentation.
    - Out of scope: unrelated refactors not required for "Promote and demote active Writer list levels".
  Plan: "1. Map Writer Promote and Demote level commands to the pinned list-shell, core-numbering, menu, toolbar, test, and Help sources. 2. Add a bounded immutable list-level transition in sw/source/uibase/shells/listsh.ts, retaining list kind, text, style, and sibling identity. 3. Place Promote and Demote in Format → Bullets and Numbering and a concrete sw/uiconfig/swriter/toolbar/numobjectbar browser control; disable them outside lists or at the 0 and 9 bounds. 4. Render level-based document indentation without adding marker text to editable content. 5. Add unit, workbench, Chromium, source-tree, parity, and documentation evidence. 6. Run fast coverage, focused Writer list E2E, parity, and static gates; defer full suite under the approved ten-task cadence."
  Verify Steps: "1. Run npm run test:coverage. Expected: all tests pass at 100 percent coverage, including list-level bounds and no-op paths. 2. Run npm run test:e2e -- --grep Writer bullets and numbering. Expected: production Chromium promotes and demotes the active list item through Writer-positioned controls while keeping text editable. 3. Run npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Expected: LO-WRITER-0107 resolves pinned implementation, test, Help, and local evidence. 4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass. 5. Defer npm run verify, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-13T07:00:43.098Z — VERIFY — ok

    By: CODER

    Note: Verified: npm run test:coverage passed 79 tests at 100 percent; focused Writer list Chromium test passed; parity inventory resolved 112 evidence items with 0 exceptions; format, lint, typecheck, JSDoc, file-size, source-tree, doctor, and routing checks passed. Full suite remains deferred under the approved ten-task cadence.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T06:43:47.313Z, excerpt_hash=sha256:2d5cfd7140bd41c2ffa6141e2021fb84f2a011898b468a373c018ea17c587e7e

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130643-JD4KF6/blueprint/resolved-snapshot.json
    - old_digest: 623f2db54c27ccc215b8c381a1deffcbbc5ba8d99f57832c94078726705d7d11
    - current_digest: 623f2db54c27ccc215b8c381a1deffcbbc5ba8d99f57832c94078726705d7d11
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608130643-JD4KF6

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202608130643-JD4KF6 -m 🧩 JD4KF6 task: persist canonical task artifacts --allow-tasks
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
  Findings: ""
id_source: "generated"
---
## Summary

Promote and demote active Writer list levels

Implement the pinned Writer .uno:IncrementLevel and .uno:DecrementLevel commands for the active list paragraph, including bounded list-level state transitions, LO-positioned menu and numbering toolbar controls, document indentation, tests, parity evidence, and documentation.

## Scope

- In scope: Implement the pinned Writer .uno:IncrementLevel and .uno:DecrementLevel commands for the active list paragraph, including bounded list-level state transitions, LO-positioned menu and numbering toolbar controls, document indentation, tests, parity evidence, and documentation.
- Out of scope: unrelated refactors not required for "Promote and demote active Writer list levels".

## Plan

1. Map Writer Promote and Demote level commands to the pinned list-shell, core-numbering, menu, toolbar, test, and Help sources. 2. Add a bounded immutable list-level transition in sw/source/uibase/shells/listsh.ts, retaining list kind, text, style, and sibling identity. 3. Place Promote and Demote in Format → Bullets and Numbering and a concrete sw/uiconfig/swriter/toolbar/numobjectbar browser control; disable them outside lists or at the 0 and 9 bounds. 4. Render level-based document indentation without adding marker text to editable content. 5. Add unit, workbench, Chromium, source-tree, parity, and documentation evidence. 6. Run fast coverage, focused Writer list E2E, parity, and static gates; defer full suite under the approved ten-task cadence.

## Verify Steps

1. Run npm run test:coverage. Expected: all tests pass at 100 percent coverage, including list-level bounds and no-op paths. 2. Run npm run test:e2e -- --grep Writer bullets and numbering. Expected: production Chromium promotes and demotes the active list item through Writer-positioned controls while keeping text editable. 3. Run npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Expected: LO-WRITER-0107 resolves pinned implementation, test, Help, and local evidence. 4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass. 5. Defer npm run verify, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-13T07:00:43.098Z — VERIFY — ok

By: CODER

Note: Verified: npm run test:coverage passed 79 tests at 100 percent; focused Writer list Chromium test passed; parity inventory resolved 112 evidence items with 0 exceptions; format, lint, typecheck, JSDoc, file-size, source-tree, doctor, and routing checks passed. Full suite remains deferred under the approved ten-task cadence.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T06:43:47.313Z, excerpt_hash=sha256:2d5cfd7140bd41c2ffa6141e2021fb84f2a011898b468a373c018ea17c587e7e

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130643-JD4KF6/blueprint/resolved-snapshot.json
- old_digest: 623f2db54c27ccc215b8c381a1deffcbbc5ba8d99f57832c94078726705d7d11
- current_digest: 623f2db54c27ccc215b8c381a1deffcbbc5ba8d99f57832c94078726705d7d11
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608130643-JD4KF6

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202608130643-JD4KF6 -m 🧩 JD4KF6 task: persist canonical task artifacts --allow-tasks
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
