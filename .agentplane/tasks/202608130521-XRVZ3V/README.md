---
id: "202608130521-XRVZ3V"
title: "Add bounded Writer bullets and numbering"
result_summary: "Implemented active-paragraph bullets, numbering, and removal with tests, parity mapping, and documentation."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 22
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-13T05:54:23.923Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-13T06:10:14.352Z"
  updated_by: "CODER"
  note: "Verified 100% unit coverage, focused production Chromium list flow, parity mapping, formatting, lint, types, JSDoc, source-tree, and policy checks; aggregate suite deferred under approved ten-task cadence."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-13T06:10:14.789Z"
  updated_by: "EVALUATOR"
  note: "Bounded Writer list commands satisfy the approved active-paragraph scope with exact source, test, Help, and file-level provenance."
  evaluated_sha: "f6c6fb3545667daf4ddd4f7b87d222d0765e6ae2"
  blueprint_digest: "c6e2649b9607657fff765235168b573dee7e3fdc69ef1e04eb1f6a8501c6aa8d"
  evidence_refs:
    - ".agentplane/tasks/202608130521-XRVZ3V/README.md"
    - ".agentplane/tasks/202608130521-XRVZ3V/quality/20260813-061014789-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608130521-XRVZ3V/quality/20260813-061014789-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608130521-XRVZ3V/quality/20260813-061014789-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608130521-XRVZ3V/blueprint/resolved-snapshot.json"
    - "npm run test:coverage; npm run test:e2e -- --grep Writer bullets and numbering; npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference"
  findings:
    - "Default bullet, default numbering, and removal execute through list.ts, number.ts, and txtnum.ts; UI placement and marker behavior are covered."
commit:
  hash: "f6c6fb3545667daf4ddd4f7b87d222d0765e6ae2"
  message: "✨ XRVZ3V code: implement Writer bullets and numbering"
comments:
  -
    author: "CODER"
    body: "Start: implement bounded Writer bullets and numbering with pinned upstream placement and parity evidence."
  -
    author: "CODER"
    body: "Blocked: The user reprioritized a LibreOffice-aligned project-structure migration before further Writer feature additions. No implementation code was started; this task remains the follow-up list capability after the structural prerequisite is complete."
  -
    author: "CODER"
    body: "Start: resume the first interoperable Writer list layer inside the LibreOffice-derived source tree."
  -
    author: "CODER"
    body: "Start: apply file-level LibreOffice module provenance to the active Writer list capability."
  -
    author: "CODER"
    body: "Verified: bounded Writer bullets and numbering ship with exact file-level LibreOffice provenance and recorded targeted evidence."
events:
  -
    type: "status"
    at: "2026-08-13T05:21:50.811Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement bounded Writer bullets and numbering with pinned upstream placement and parity evidence."
  -
    type: "status"
    at: "2026-08-13T05:25:56.820Z"
    author: "CODER"
    from: "DOING"
    to: "BLOCKED"
    note: "Blocked: The user reprioritized a LibreOffice-aligned project-structure migration before further Writer feature additions. No implementation code was started; this task remains the follow-up list capability after the structural prerequisite is complete."
  -
    type: "status"
    at: "2026-08-13T05:47:30.098Z"
    author: "CODER"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: resume the first interoperable Writer list layer inside the LibreOffice-derived source tree."
  -
    type: "status"
    at: "2026-08-13T05:54:24.230Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: apply file-level LibreOffice module provenance to the active Writer list capability."
  -
    type: "verify"
    at: "2026-08-13T06:10:14.352Z"
    author: "CODER"
    state: "ok"
    note: "Verified 100% unit coverage, focused production Chromium list flow, parity mapping, formatting, lint, types, JSDoc, source-tree, and policy checks; aggregate suite deferred under approved ten-task cadence."
  -
    type: "status"
    at: "2026-08-13T06:10:54.527Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: bounded Writer bullets and numbering ship with exact file-level LibreOffice provenance and recorded targeted evidence."
doc_version: 3
doc_updated_at: "2026-08-13T06:10:54.529Z"
doc_updated_by: "CODER"
description: "Implement Default Bullet, Default Numbering, and Remove Bullets for the active Writer paragraph with pinned LibreOffice menu and formatting-toolbar placement, history, tests, documentation, and parity evidence."
sections:
  Summary: |-
    Implement the first interoperable Writer list layer on the path to LibreOffice list parity.

    This task maps pinned LibreOffice commands, source, tests, and Help evidence for ordinary bullets and numbering. Its output is intentionally a foundation for subsequent list-level, range-selection, style, restart/continue, import/export, and compatibility tasks; it does not declare those capabilities unnecessary or permanently unsupported.
  Scope: |-
    - In scope: a serializable Writer list model in `apps/office/src/sw/source/core/doc` that can evolve toward LibreOffice list semantics; current active-paragraph none/bullet/numbered operations; document rendering; undo/redo; menu and toolbar UI at pinned Writer locations; and upstream/local evidence mapping.
    - In scope: `.uno:DefaultBullet`, `.uno:DefaultNumbering`, and `.uno:RemoveBullets` from the pinned LibreOffice baseline, retaining source-level provenance for later command expansion. Browser placement declarations belong in `apps/office/src/sw/uiconfig/swriter`; rendering belongs below matching `sw/source/uibase` areas.
    - Deferred to separately mapped follow-up tasks, not exceptions: multi-paragraph/range list application, nesting/levels, custom list styles, restart/continue, outline numbering, automatic lists, ODT/DOCX list import/export, and complex numbering compatibility.
    - Out of scope only for this task: unrelated suites and changes not needed to establish the initial Writer list architecture.
  Plan: "1. Map each local list module to a concrete pinned LibreOffice source/configuration file, not merely a top-level directory; retain the map in source-tree and the parity record. 2. Implement the list document model in sw/source/core/doc/list.ts and sw/source/core/doc/number.ts, with the command transition in sw/source/uibase/shells/txtnum.ts. 3. Wire the command through matching Writer view, menu, and text-object-toolbar modules, rendering through the document view while keeping marker text outside editable and clipboard paragraph content. 4. Add unit, component, storage, and focused browser tests plus exact upstream source, test, Help, and file-level mappings. 5. Validate targeted checks now; defer the aggregate suite under the approved ten-task cadence."
  Verify Steps: |-
    1. Run `npm run test:coverage`. Expected: all office tests pass at 100 percent coverage, including list state transitions, history, visible markers, and command placement.
    2. Run `npm run test:e2e -- --grep "Writer bullets and numbering"`. Expected: production Chromium applies bullet and numbering commands at their Writer locations, renders markers, and removes them without editing paragraph text.
    3. Run `npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference`. Expected: the new Writer list record resolves all source, test, and documentation markers at the pinned baseline.
    4. Run `npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs`. Expected: all pass.
    5. Defer aggregate `npm run verify`, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-13T06:10:14.352Z — VERIFY — ok

    By: CODER

    Note: Verified 100% unit coverage, focused production Chromium list flow, parity mapping, formatting, lint, types, JSDoc, source-tree, and policy checks; aggregate suite deferred under approved ten-task cadence.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T06:09:47.479Z, excerpt_hash=sha256:0158df4ea289c6d1852c7514992a68952808d9de5701bdeebf9f779dc0a2dcf3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130521-XRVZ3V/blueprint/resolved-snapshot.json
    - old_digest: c6e2649b9607657fff765235168b573dee7e3fdc69ef1e04eb1f6a8501c6aa8d
    - current_digest: c6e2649b9607657fff765235168b573dee7e3fdc69ef1e04eb1f6a8501c6aa8d
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608130521-XRVZ3V

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608130521-XRVZ3V
    - diagnostic_command: agentplane task run status 202608130521-XRVZ3V
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-scoped implementation and task-artifact commits.
    - Re-run coverage and the focused Writer bullets and numbering E2E scenario to confirm existing paragraph editing and history behavior.
  Findings: |-
    Command: npm run test:coverage
    Result: pass
    Evidence: 24 test files, 69 tests, 100 percent statements, branches, functions, and lines.
    Scope: list model, shell command, rendering, storage, menu, toolbar, and existing Writer behavior.

    Command: npm run test:e2e -- --grep "Writer bullets and numbering"
    Result: pass
    Evidence: 1 production Chromium scenario passed.
    Scope: Format submenu, text-object-toolbar placement, markers, inherited list state, and removal without editable-text contamination.

    Command: npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference
    Result: pass
    Evidence: LO-WRITER-0105 resolved pinned implementation, test, Help, and local markers; 0 exceptions.
    Scope: list capability parity evidence.

    Command: npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && npm run check:source-tree && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs
    Result: pass
    Evidence: formatting, lint, types, JSDoc, file-size, source-tree, diff, doctor, and policy routing passed.
    Scope: changed implementation, documentation, and source-tree gate.

    Skipped: npm run verify, static smoke, inventory coverage, and full browser matrix.
    Reason: user-approved full-run cadence is every ten closed tasks.
    Risk: unrelated aggregate integration regressions remain unobserved until the scheduled full run.
    Approval: user blanket approval and explicit cadence instruction.
id_source: "generated"
---
## Summary

Implement the first interoperable Writer list layer on the path to LibreOffice list parity.

This task maps pinned LibreOffice commands, source, tests, and Help evidence for ordinary bullets and numbering. Its output is intentionally a foundation for subsequent list-level, range-selection, style, restart/continue, import/export, and compatibility tasks; it does not declare those capabilities unnecessary or permanently unsupported.

## Scope

- In scope: a serializable Writer list model in `apps/office/src/sw/source/core/doc` that can evolve toward LibreOffice list semantics; current active-paragraph none/bullet/numbered operations; document rendering; undo/redo; menu and toolbar UI at pinned Writer locations; and upstream/local evidence mapping.
- In scope: `.uno:DefaultBullet`, `.uno:DefaultNumbering`, and `.uno:RemoveBullets` from the pinned LibreOffice baseline, retaining source-level provenance for later command expansion. Browser placement declarations belong in `apps/office/src/sw/uiconfig/swriter`; rendering belongs below matching `sw/source/uibase` areas.
- Deferred to separately mapped follow-up tasks, not exceptions: multi-paragraph/range list application, nesting/levels, custom list styles, restart/continue, outline numbering, automatic lists, ODT/DOCX list import/export, and complex numbering compatibility.
- Out of scope only for this task: unrelated suites and changes not needed to establish the initial Writer list architecture.

## Plan

1. Map each local list module to a concrete pinned LibreOffice source/configuration file, not merely a top-level directory; retain the map in source-tree and the parity record. 2. Implement the list document model in sw/source/core/doc/list.ts and sw/source/core/doc/number.ts, with the command transition in sw/source/uibase/shells/txtnum.ts. 3. Wire the command through matching Writer view, menu, and text-object-toolbar modules, rendering through the document view while keeping marker text outside editable and clipboard paragraph content. 4. Add unit, component, storage, and focused browser tests plus exact upstream source, test, Help, and file-level mappings. 5. Validate targeted checks now; defer the aggregate suite under the approved ten-task cadence.

## Verify Steps

1. Run `npm run test:coverage`. Expected: all office tests pass at 100 percent coverage, including list state transitions, history, visible markers, and command placement.
2. Run `npm run test:e2e -- --grep "Writer bullets and numbering"`. Expected: production Chromium applies bullet and numbering commands at their Writer locations, renders markers, and removes them without editing paragraph text.
3. Run `npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference`. Expected: the new Writer list record resolves all source, test, and documentation markers at the pinned baseline.
4. Run `npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs`. Expected: all pass.
5. Defer aggregate `npm run verify`, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-13T06:10:14.352Z — VERIFY — ok

By: CODER

Note: Verified 100% unit coverage, focused production Chromium list flow, parity mapping, formatting, lint, types, JSDoc, source-tree, and policy checks; aggregate suite deferred under approved ten-task cadence.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T06:09:47.479Z, excerpt_hash=sha256:0158df4ea289c6d1852c7514992a68952808d9de5701bdeebf9f779dc0a2dcf3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130521-XRVZ3V/blueprint/resolved-snapshot.json
- old_digest: c6e2649b9607657fff765235168b573dee7e3fdc69ef1e04eb1f6a8501c6aa8d
- current_digest: c6e2649b9607657fff765235168b573dee7e3fdc69ef1e04eb1f6a8501c6aa8d
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608130521-XRVZ3V

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608130521-XRVZ3V
- diagnostic_command: agentplane task run status 202608130521-XRVZ3V
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-scoped implementation and task-artifact commits.
- Re-run coverage and the focused Writer bullets and numbering E2E scenario to confirm existing paragraph editing and history behavior.

## Findings

Command: npm run test:coverage
Result: pass
Evidence: 24 test files, 69 tests, 100 percent statements, branches, functions, and lines.
Scope: list model, shell command, rendering, storage, menu, toolbar, and existing Writer behavior.

Command: npm run test:e2e -- --grep "Writer bullets and numbering"
Result: pass
Evidence: 1 production Chromium scenario passed.
Scope: Format submenu, text-object-toolbar placement, markers, inherited list state, and removal without editable-text contamination.

Command: npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference
Result: pass
Evidence: LO-WRITER-0105 resolved pinned implementation, test, Help, and local markers; 0 exceptions.
Scope: list capability parity evidence.

Command: npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && npm run check:source-tree && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: formatting, lint, types, JSDoc, file-size, source-tree, diff, doctor, and policy routing passed.
Scope: changed implementation, documentation, and source-tree gate.

Skipped: npm run verify, static smoke, inventory coverage, and full browser matrix.
Reason: user-approved full-run cadence is every ten closed tasks.
Risk: unrelated aggregate integration regressions remain unobserved until the scheduled full run.
Approval: user blanket approval and explicit cadence instruction.
