---
id: "202609240948-5BCBDY"
title: "Port upstream Continue Numbering ODT regression"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "Run focused list, undo, and ODT fixture Vitest suites, typecheck, lint, and format checks on changed paths."
  - "Run npm run verify and agentplane doctor; record results and any residual risks."
  - "Run the pinned tdf113213_addToList.odt fixture test: initial label 1., continue numbering produces 3 with restart cleared, Undo restores 1. and original list state; Redo reapplies the join."
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T09:48:53.726Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-24T10:16:00.370Z"
  updated_by: "CODER"
  note: "verified-202609240948-5BCBDY"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-24T10:16:06.658Z"
  updated_by: "EVALUATOR"
  note: "Continue Numbering ODT regression and local fixtures are implemented and verified."
  evaluated_sha: "bddae073566a8948eebfb806dddb205e49b8c5b4"
  blueprint_digest: "4795a69e63c56d1c73a3a82c1ff8a75597545deb523caf3753315b51eecf4df1"
  evidence_refs:
    - ".agentplane/tasks/202609240948-5BCBDY/README.md"
    - ".agentplane/tasks/202609240948-5BCBDY/quality/20260924-101606658-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609240948-5BCBDY/quality/20260924-101606658-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609240948-5BCBDY/quality/20260924-101606658-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609240948-5BCBDY/blueprint/resolved-snapshot.json"
    - "/tmp/vite-office-verify-1.log"
    - "apps/office/src/sw/source/uibase/shells/listsh-odt.test.ts"
    - "scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts"
  findings:
    - "Real ODT command, one-step Undo/Redo, and export/reopen assertions pass; generated command and suffix semantics have dedicated checks; full npm run verify passed at 100% coverage."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement Continue Numbering and exact undo semantics against the pinned upstream ODT fixture, then verify all declared assertions."
events:
  -
    type: "status"
    at: "2026-09-24T09:49:01.228Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement Continue Numbering and exact undo semantics against the pinned upstream ODT fixture, then verify all declared assertions."
  -
    type: "verify"
    at: "2026-09-24T10:14:54.943Z"
    author: "CODER"
    state: "ok"
    note: "Local tdf113213 ODT command, Undo/Redo, and reopen passed; npm run verify passed with 100% office and inventory coverage, 14 browser tests, static build, and all repository gates; ap doctor OK."
  -
    type: "verify"
    at: "2026-09-24T10:16:00.370Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609240948-5BCBDY"
doc_version: 3
doc_updated_at: "2026-09-24T10:16:00.424Z"
doc_updated_by: "CODER"
description: "Implement Writer Continue Numbering with atomic undo and port every behavioral assertion of pinned LibreOffice testTdf113213_addToList using the existing vendor ODT fixture."
sections:
  Summary: |-
    Port upstream Continue Numbering ODT regression

    Implement Writer Continue Numbering with atomic undo and port every behavioral assertion of pinned LibreOffice testTdf113213_addToList using the existing vendor ODT fixture.
  Scope: "Implement .uno:ContinueNumbering in Writer list command dispatch and shell, including list identity/rule adoption, restart removal, counter refresh, and one-step Undo/Redo. Port pinned testTdf113213_addToList into the local ODT fixture suite. Copy the three discussed ODT fixtures and every other ODT consumed by this suite into apps/office/src/sw/qa so these tests run without vendor/libreoffice-reference. Update the generated Writer resource and its affected toolbar expectation."
  Plan: |-
    1. Inspect the pinned upstream test, Writer list identifiers, command registration, and list undo action.
    2. Implement Continue Numbering for the selected second list as one reversible model transition, preserving previous state and providing a visible label.
    3. Add a real-ODT regression that checks initial label, resulting label and restart state, Undo, and Redo.
    4. Run focused tests and repository verification; record exact evidence and finish the scoped task.
  Verify Steps: "1. Run the real tdf113213_addToList.odt regression: initial paragraph 6 label is 1.; Continue Numbering produces 3, clears restart, and joins the preceding list; one Undo restores the initial label, list identity, rule, and restart; Redo restores the joined state. 2. Run focused Writer list/undo and ODT fixture tests. 3. Run npm run typecheck, npm run lint, npm run format:check, npm run verify, and ap doctor; record command results. 4. Confirm task-scoped diff and final tracked state contain no unintended changes."
  Verification: |-
    Command: npx vitest run --config scripts/libreoffice-inventory/vitest.config.ts scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts; Result: pass; Evidence: 7 tests passed, including local tdf113213 command/Undo/Redo and ODT reopen; Scope: repository-owned ODT fixtures.
    Command: npm exec --workspace @vite-office/office -- vitest run src/sw/source/uibase/shells/listsh-odt.test.ts src/sw/source/filter/xml/odt-roundtrip.test.ts src/xmloff/source/text/txtparae.test.ts; Result: pass; Evidence: 16 tests passed; Scope: command, suffix import/export, undo.
    Command: npm run verify; Result: pass; Evidence: Writer 105 files/473 tests and inventory 34 files/97 tests at 100% coverage, 14 browser tests passed, static build and all remaining gates passed; Scope: complete repository verification.
    Command: ap doctor; Result: pass; Evidence: doctor OK with two pre-existing warnings; Scope: AgentPlane workspace health.
    Command: git diff --check && npm run format:check; Result: pass; Evidence: no whitespace errors; Scope: final task diff.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T10:14:54.943Z — VERIFY — ok

    By: CODER

    Note: Local tdf113213 ODT command, Undo/Redo, and reopen passed; npm run verify passed with 100% office and inventory coverage, 14 browser tests, static build, and all repository gates; ap doctor OK.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T10:14:50.129Z, excerpt_hash=sha256:6f18645b60e5eeff94702c531dddc695efee59739a4ce6a54c6a01bef6201953

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240948-5BCBDY/blueprint/resolved-snapshot.json
    - old_digest: 4795a69e63c56d1c73a3a82c1ff8a75597545deb523caf3753315b51eecf4df1
    - current_digest: 4795a69e63c56d1c73a3a82c1ff8a75597545deb523caf3753315b51eecf4df1
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609240948-5BCBDY

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609240948-5BCBDY
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-09-24T10:16:00.370Z — VERIFY — ok

    By: CODER

    Note: verified-202609240948-5BCBDY
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T10:14:54.994Z, excerpt_hash=sha256:6f18645b60e5eeff94702c531dddc695efee59739a4ce6a54c6a01bef6201953

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240948-5BCBDY/blueprint/resolved-snapshot.json
    - old_digest: 4795a69e63c56d1c73a3a82c1ff8a75597545deb523caf3753315b51eecf4df1
    - current_digest: 4795a69e63c56d1c73a3a82c1ff8a75597545deb523caf3753315b51eecf4df1
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609240948-5BCBDY

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609240948-5BCBDY --result verified-202609240948-5BCBDY --commit bddae073566a8948eebfb806dddb205e49b8c5b4
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

Port upstream Continue Numbering ODT regression

Implement Writer Continue Numbering with atomic undo and port every behavioral assertion of pinned LibreOffice testTdf113213_addToList using the existing vendor ODT fixture.

## Scope

Implement .uno:ContinueNumbering in Writer list command dispatch and shell, including list identity/rule adoption, restart removal, counter refresh, and one-step Undo/Redo. Port pinned testTdf113213_addToList into the local ODT fixture suite. Copy the three discussed ODT fixtures and every other ODT consumed by this suite into apps/office/src/sw/qa so these tests run without vendor/libreoffice-reference. Update the generated Writer resource and its affected toolbar expectation.

## Plan

1. Inspect the pinned upstream test, Writer list identifiers, command registration, and list undo action.
2. Implement Continue Numbering for the selected second list as one reversible model transition, preserving previous state and providing a visible label.
3. Add a real-ODT regression that checks initial label, resulting label and restart state, Undo, and Redo.
4. Run focused tests and repository verification; record exact evidence and finish the scoped task.

## Verify Steps

1. Run the real tdf113213_addToList.odt regression: initial paragraph 6 label is 1.; Continue Numbering produces 3, clears restart, and joins the preceding list; one Undo restores the initial label, list identity, rule, and restart; Redo restores the joined state. 2. Run focused Writer list/undo and ODT fixture tests. 3. Run npm run typecheck, npm run lint, npm run format:check, npm run verify, and ap doctor; record command results. 4. Confirm task-scoped diff and final tracked state contain no unintended changes.

## Verification

Command: npx vitest run --config scripts/libreoffice-inventory/vitest.config.ts scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts; Result: pass; Evidence: 7 tests passed, including local tdf113213 command/Undo/Redo and ODT reopen; Scope: repository-owned ODT fixtures.
Command: npm exec --workspace @vite-office/office -- vitest run src/sw/source/uibase/shells/listsh-odt.test.ts src/sw/source/filter/xml/odt-roundtrip.test.ts src/xmloff/source/text/txtparae.test.ts; Result: pass; Evidence: 16 tests passed; Scope: command, suffix import/export, undo.
Command: npm run verify; Result: pass; Evidence: Writer 105 files/473 tests and inventory 34 files/97 tests at 100% coverage, 14 browser tests passed, static build and all remaining gates passed; Scope: complete repository verification.
Command: ap doctor; Result: pass; Evidence: doctor OK with two pre-existing warnings; Scope: AgentPlane workspace health.
Command: git diff --check && npm run format:check; Result: pass; Evidence: no whitespace errors; Scope: final task diff.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T10:14:54.943Z — VERIFY — ok

By: CODER

Note: Local tdf113213 ODT command, Undo/Redo, and reopen passed; npm run verify passed with 100% office and inventory coverage, 14 browser tests, static build, and all repository gates; ap doctor OK.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T10:14:50.129Z, excerpt_hash=sha256:6f18645b60e5eeff94702c531dddc695efee59739a4ce6a54c6a01bef6201953

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240948-5BCBDY/blueprint/resolved-snapshot.json
- old_digest: 4795a69e63c56d1c73a3a82c1ff8a75597545deb523caf3753315b51eecf4df1
- current_digest: 4795a69e63c56d1c73a3a82c1ff8a75597545deb523caf3753315b51eecf4df1
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609240948-5BCBDY

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609240948-5BCBDY
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-09-24T10:16:00.370Z — VERIFY — ok

By: CODER

Note: verified-202609240948-5BCBDY
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T10:14:54.994Z, excerpt_hash=sha256:6f18645b60e5eeff94702c531dddc695efee59739a4ce6a54c6a01bef6201953

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240948-5BCBDY/blueprint/resolved-snapshot.json
- old_digest: 4795a69e63c56d1c73a3a82c1ff8a75597545deb523caf3753315b51eecf4df1
- current_digest: 4795a69e63c56d1c73a3a82c1ff8a75597545deb523caf3753315b51eecf4df1
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609240948-5BCBDY

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609240948-5BCBDY --result verified-202609240948-5BCBDY --commit bddae073566a8948eebfb806dddb205e49b8c5b4
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
