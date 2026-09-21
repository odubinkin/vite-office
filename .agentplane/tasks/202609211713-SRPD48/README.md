---
id: "202609211713-SRPD48"
title: "Implement P2 Writer view and ownership boundaries"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-21T17:14:18.306Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-21T17:42:02.734Z"
  updated_by: "CODER"
  note: "verified-202609211713-SRPD48"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-21T17:42:14.946Z"
  updated_by: "EVALUATOR"
  note: "P2 ownership refactor is complete and all declared verification gates pass."
  evaluated_sha: "99116e38599dd82e8f1e2bc856f18b013a537781"
  blueprint_digest: "47e80c7318b1989f57c8c26973479ff02816ecb9a9f915d35d573c45c8e2cfdc"
  evidence_refs:
    - ".agentplane/tasks/202609211713-SRPD48/README.md"
    - ".agentplane/tasks/202609211713-SRPD48/quality/20260921-174214946-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609211713-SRPD48/quality/20260921-174214946-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609211713-SRPD48/quality/20260921-174214946-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609211713-SRPD48/blueprint/resolved-snapshot.json"
    - "npm run verify"
    - "node .agentplane/policy/check-routing.mjs"
    - "apps/office/src/sw/source/uibase/uiview/view.ts"
    - "scripts/check-module-boundaries.test.ts"
  findings:
    - "SwView now owns only Writer/Sfx coordination; browser workflow commands terminate in sw/browser, inner-layer reverse dependencies are rejected, and provenance/inventory describe the resulting responsibilities."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement approved P2 Writer view responsibility refactor and inner-layer ownership enforcement with focused and full verification."
events:
  -
    type: "status"
    at: "2026-09-21T17:14:26.534Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved P2 Writer view responsibility refactor and inner-layer ownership enforcement with focused and full verification."
  -
    type: "verify"
    at: "2026-09-21T17:41:08.220Z"
    author: "CODER"
    state: "ok"
    note: "P2 Writer view/workflow ownership, inner-layer dependency enforcement, provenance stack constraints, detailed inventory updates, focused tests, full npm run verify, routing check, and doctor all passed."
  -
    type: "verify"
    at: "2026-09-21T17:42:02.734Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609211713-SRPD48"
doc_version: 3
doc_updated_at: "2026-09-21T17:42:02.815Z"
doc_updated_by: "CODER"
description: "Implement P2-1 and P2-2 from docs/program/vite-office-upstream-parity-plan.md: remove browser presentation/workflow responsibilities from SwView, move them to sw/browser adapters, enforce inner-layer ownership and browser-import prohibitions, and update provenance/inventory within the existing inventory model."
sections:
  Summary: "Implement parity-plan P2-1 and P2-2 by restoring upstream-shaped SwView ownership and enforcing responsibility boundaries between Writer core, uibase, filter, browser adapters, and Sfx."
  Scope: "Move browser workflow orchestration, clipboard/file/storage adapters, view projections, snapshots, subscriptions, and external-store concerns out of sw/source/uibase/uiview/view.ts into sw/browser/workflows and sw/browser/presentation. Keep SwView responsible for Writer shell/frame state and command coordination. Strengthen static ownership/import checks and provenance filename-divergence validation. Update existing runtime inventory records only as required by changed files; do not expand the inventory schema or supported feature model. Preserve current Writer behavior and follow pinned LibreOffice 26.8.0.2 responsibility anchors. No compatibility layer is required if stored document representation changes."
  Plan: "Implement approved P2-1/P2-2 scope: slim SwView to Writer/Sfx coordination, move browser workflows and observable presentation concerns to sw/browser, enforce inner-layer ownership and stack-necessity provenance, preserve behavior, update only existing inventory records, and verify with focused plus full repository gates."
  Verify Steps: "1. Run focused Vitest suites for SwView, writer workflows, writer presentation store, module boundaries, source tree, and source provenance. Expected: browser workflows execute through browser-owned adapters, SwView tests cover only Writer/Sfx responsibilities, and negative architecture fixtures are rejected. 2. Run npm run check:dependencies, npm run check:source-tree, npm run check:source-provenance, npm run inventory:invariants, and npm run inventory:parity. Expected: every ownership/provenance/inventory gate passes without broadening inventory semantics. 3. Run npm run verify. Expected: formatting, lint, typecheck, unit coverage, e2e, static checks, documentation, size, source ownership, provenance, and inventory checks all pass. 4. Run node .agentplane/policy/check-routing.mjs and ap doctor. Expected: repository policy and Agentplane health checks pass. 5. Inspect git diff and git status --short --untracked-files=all. Expected: only approved task files and Agentplane artifacts are changed, with no unintended files."
  Verification: |-
    Command: focused Vitest suites for Writer workflows, Writer view presentation, transfer serializers, module boundaries, and source provenance. Result: pass. Evidence: 33 focused tests passed. Scope: browser workflow shell, SwView integration, transfer DTO ownership, negative layer rules, and provenance validation.

    Command: npm run check:dependencies && npm run check:source-tree && npm run check:source-provenance && npm run inventory:invariants && npm run inventory:parity. Result: pass. Evidence: 148 dependency-scanned runtime sources; 105 required source paths; 149 provenance modules; 34 invariants valid; parity inventory valid with existing parityReady=false and no exceptions. Scope: ownership, source layout, provenance, and unchanged inventory semantics.

    Command: npm run verify. Result: pass. Evidence: 355 application tests and 96 inventory tests at 100% coverage, 11 Playwright tests, production/static builds, format, lint, typecheck, source, docs, size, provenance, and inventory gates passed. Scope: complete repository verification.

    Command: node .agentplane/policy/check-routing.mjs && ap doctor && git diff --check. Result: pass. Evidence: policy routing OK; doctor OK with one unrelated historical warning; no whitespace errors. Scope: repository workflow health and patch integrity.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-21T17:41:08.220Z — VERIFY — ok

    By: CODER

    Note: P2 Writer view/workflow ownership, inner-layer dependency enforcement, provenance stack constraints, detailed inventory updates, focused tests, full npm run verify, routing check, and doctor all passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T17:41:07.178Z, excerpt_hash=sha256:434b4694b13f92af4983b32f8e632e06189ccff7bc73441bb69368ac80c06d4c

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211713-SRPD48/blueprint/resolved-snapshot.json
    - old_digest: 47e80c7318b1989f57c8c26973479ff02816ecb9a9f915d35d573c45c8e2cfdc
    - current_digest: 47e80c7318b1989f57c8c26973479ff02816ecb9a9f915d35d573c45c8e2cfdc
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609211713-SRPD48

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609211713-SRPD48
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-21T17:42:02.734Z — VERIFY — ok

    By: CODER

    Note: verified-202609211713-SRPD48
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T17:41:08.294Z, excerpt_hash=sha256:434b4694b13f92af4983b32f8e632e06189ccff7bc73441bb69368ac80c06d4c

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211713-SRPD48/blueprint/resolved-snapshot.json
    - old_digest: 47e80c7318b1989f57c8c26973479ff02816ecb9a9f915d35d573c45c8e2cfdc
    - current_digest: 47e80c7318b1989f57c8c26973479ff02816ecb9a9f915d35d573c45c8e2cfdc
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609211713-SRPD48

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609211713-SRPD48 --result verified-202609211713-SRPD48 --commit 99116e38599dd82e8f1e2bc856f18b013a537781
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task commit. The refactor does not add compatibility shims or migrations; rollback restores the prior SwView/browser ownership arrangement and prior static checks."
  Findings: "No findings yet."
id_source: "generated"
---
## Summary

Implement parity-plan P2-1 and P2-2 by restoring upstream-shaped SwView ownership and enforcing responsibility boundaries between Writer core, uibase, filter, browser adapters, and Sfx.

## Scope

Move browser workflow orchestration, clipboard/file/storage adapters, view projections, snapshots, subscriptions, and external-store concerns out of sw/source/uibase/uiview/view.ts into sw/browser/workflows and sw/browser/presentation. Keep SwView responsible for Writer shell/frame state and command coordination. Strengthen static ownership/import checks and provenance filename-divergence validation. Update existing runtime inventory records only as required by changed files; do not expand the inventory schema or supported feature model. Preserve current Writer behavior and follow pinned LibreOffice 26.8.0.2 responsibility anchors. No compatibility layer is required if stored document representation changes.

## Plan

Implement approved P2-1/P2-2 scope: slim SwView to Writer/Sfx coordination, move browser workflows and observable presentation concerns to sw/browser, enforce inner-layer ownership and stack-necessity provenance, preserve behavior, update only existing inventory records, and verify with focused plus full repository gates.

## Verify Steps

1. Run focused Vitest suites for SwView, writer workflows, writer presentation store, module boundaries, source tree, and source provenance. Expected: browser workflows execute through browser-owned adapters, SwView tests cover only Writer/Sfx responsibilities, and negative architecture fixtures are rejected. 2. Run npm run check:dependencies, npm run check:source-tree, npm run check:source-provenance, npm run inventory:invariants, and npm run inventory:parity. Expected: every ownership/provenance/inventory gate passes without broadening inventory semantics. 3. Run npm run verify. Expected: formatting, lint, typecheck, unit coverage, e2e, static checks, documentation, size, source ownership, provenance, and inventory checks all pass. 4. Run node .agentplane/policy/check-routing.mjs and ap doctor. Expected: repository policy and Agentplane health checks pass. 5. Inspect git diff and git status --short --untracked-files=all. Expected: only approved task files and Agentplane artifacts are changed, with no unintended files.

## Verification

Command: focused Vitest suites for Writer workflows, Writer view presentation, transfer serializers, module boundaries, and source provenance. Result: pass. Evidence: 33 focused tests passed. Scope: browser workflow shell, SwView integration, transfer DTO ownership, negative layer rules, and provenance validation.

Command: npm run check:dependencies && npm run check:source-tree && npm run check:source-provenance && npm run inventory:invariants && npm run inventory:parity. Result: pass. Evidence: 148 dependency-scanned runtime sources; 105 required source paths; 149 provenance modules; 34 invariants valid; parity inventory valid with existing parityReady=false and no exceptions. Scope: ownership, source layout, provenance, and unchanged inventory semantics.

Command: npm run verify. Result: pass. Evidence: 355 application tests and 96 inventory tests at 100% coverage, 11 Playwright tests, production/static builds, format, lint, typecheck, source, docs, size, provenance, and inventory gates passed. Scope: complete repository verification.

Command: node .agentplane/policy/check-routing.mjs && ap doctor && git diff --check. Result: pass. Evidence: policy routing OK; doctor OK with one unrelated historical warning; no whitespace errors. Scope: repository workflow health and patch integrity.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-21T17:41:08.220Z — VERIFY — ok

By: CODER

Note: P2 Writer view/workflow ownership, inner-layer dependency enforcement, provenance stack constraints, detailed inventory updates, focused tests, full npm run verify, routing check, and doctor all passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T17:41:07.178Z, excerpt_hash=sha256:434b4694b13f92af4983b32f8e632e06189ccff7bc73441bb69368ac80c06d4c

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211713-SRPD48/blueprint/resolved-snapshot.json
- old_digest: 47e80c7318b1989f57c8c26973479ff02816ecb9a9f915d35d573c45c8e2cfdc
- current_digest: 47e80c7318b1989f57c8c26973479ff02816ecb9a9f915d35d573c45c8e2cfdc
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609211713-SRPD48

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609211713-SRPD48
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-21T17:42:02.734Z — VERIFY — ok

By: CODER

Note: verified-202609211713-SRPD48
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T17:41:08.294Z, excerpt_hash=sha256:434b4694b13f92af4983b32f8e632e06189ccff7bc73441bb69368ac80c06d4c

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211713-SRPD48/blueprint/resolved-snapshot.json
- old_digest: 47e80c7318b1989f57c8c26973479ff02816ecb9a9f915d35d573c45c8e2cfdc
- current_digest: 47e80c7318b1989f57c8c26973479ff02816ecb9a9f915d35d573c45c8e2cfdc
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609211713-SRPD48

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609211713-SRPD48 --result verified-202609211713-SRPD48 --commit 99116e38599dd82e8f1e2bc856f18b013a537781
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task commit. The refactor does not add compatibility shims or migrations; rollback restores the prior SwView/browser ownership arrangement and prior static checks.

## Findings

No findings yet.
