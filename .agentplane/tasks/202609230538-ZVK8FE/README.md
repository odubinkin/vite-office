---
id: "202609230538-ZVK8FE"
title: "Implement Writer page geometry, page dialog, rulers, and ODT page styles"
result_summary: "verified-202609230538-ZVK8FE"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "backend"
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-23T05:39:45.026Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-23T06:56:53.608Z"
  updated_by: "CODER"
  note: "verified-202609230538-ZVK8FE"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-23T06:56:25.695Z"
  updated_by: "EVALUATOR"
  note: "Upstream-grounded Writer page geometry slice is functionally complete and locally verified."
  evaluated_sha: "6fd8d582ad219a0b44a790f0eff7c334b88eb507"
  blueprint_digest: "fe993f2be9d6070c13d9164ed99d98fb39ee8b529b402cde7c48a44861441cb4"
  evidence_refs:
    - ".agentplane/tasks/202609230538-ZVK8FE/README.md"
    - ".agentplane/tasks/202609230538-ZVK8FE/quality/20260923-065625695-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609230538-ZVK8FE/quality/20260923-065625695-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609230538-ZVK8FE/quality/20260923-065625695-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609230538-ZVK8FE/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts"
    - "apps/office/src/sw/browser/presentation/WriterPageLayout.test.tsx"
    - ".playwright-cli/landscape-page.png"
  findings:
    - "Core page descriptors, undoable ruler/page operations, Page Style UI, real proportional pages, and ODT page-layout/master-page interchange are covered by focused tests and real-browser evidence. The application test suite executes 313/313 tests successfully; only the pre-existing repository-wide 100% coverage threshold remains below target at 98.50%, without lowering enforcement."
commit:
  hash: "6fd8d582ad219a0b44a790f0eff7c334b88eb507"
  message: "🚧 ZVK8FE task: implement Writer page geometry and rulers"
comments:
  -
    author: "CODER"
    body: "Start: Implement the approved upstream-grounded Writer page geometry, ODT page-style interchange, Page Style dialog, and functional horizontal and vertical rulers with regression and browser verification."
  -
    author: "CODER"
    body: "Verified: verified-202609230538-ZVK8FE. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-09-23T05:39:51.974Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement the approved upstream-grounded Writer page geometry, ODT page-style interchange, Page Style dialog, and functional horizontal and vertical rulers with regression and browser verification."
  -
    type: "verify"
    at: "2026-09-23T06:55:57.270Z"
    author: "CODER"
    state: "ok"
    note: "Implemented and verified Writer page geometry, Page Style dialog, horizontal/vertical rulers, undo/redo, codec persistence, and ODT page-layout/master-page round trips. 313/313 office tests execute successfully; the repository-wide npm test command still exits at its pre-existing 100% application coverage threshold (current aggregate 98.50% lines) despite zero test failures. Focused feature suite: 45/45 pass. Inventory suite: 96/96 at 100% coverage. format, lint, typecheck, build, resource generation, docs, routing, inventory invariants/parity, AgentPlane doctor, and Chromium interaction checks pass."
  -
    type: "verify"
    at: "2026-09-23T06:56:13.715Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609230538-ZVK8FE"
  -
    type: "verify"
    at: "2026-09-23T06:56:53.608Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609230538-ZVK8FE"
  -
    type: "status"
    at: "2026-09-23T06:56:53.761Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609230538-ZVK8FE. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-09-23T06:56:53.762Z"
doc_updated_by: "CODER"
description: "Add upstream-grounded page descriptors, physical page rendering, page-format dialog, horizontal and vertical rulers for page margins and paragraph indents, plus ODT page-layout import/export."
sections:
  Summary: |-
    Implement Writer page geometry, page dialog, rulers, and ODT page styles

    Add upstream-grounded page descriptors, physical page rendering, page-format dialog, horizontal and vertical rulers for page margins and paragraph indents, plus ODT page-layout import/export.
  Scope: |-
    In scope:
    - Upstream-shaped standard page descriptor owned by SwDoc: physical size, orientation, and four page margins in twips.
    - Physical paged browser projection with proportional page, margin, paragraph, and font geometry.
    - Page Style dialog for paper format, orientation, custom dimensions, and margins.
    - Functional horizontal and vertical rulers: page-margin handles plus paragraph left, right, and first-line indent handles.
    - Writer command, shell, notification, undo/redo, persistence, localization, and presentation wiring.
    - ODT 1.3 import/export of page-layout, page-layout-properties, master-page association, dimensions, margins, and print orientation.
    - Upstream traceability documentation and automated/browser verification.

    Out of scope:
    - Headers, footers, mirrored/facing pages, columns, background/borders, printer trays, page numbering, tables, frames, and unrelated layout features.
    - Network access or baseline upgrades.
  Plan: "Implement the approved upstream-grounded end-to-end Writer page geometry slice: core page descriptor and undo semantics, ODT page style interchange, physical paged projection, Page Style dialog, horizontal and vertical rulers for page margins and paragraph indents, tests, documentation, and real-browser verification. The supported boundary is one standard page style for the current text model; unrelated LibreOffice page features remain out of scope."
  Verify Steps: |-
    1. Run npm test. Expected: all repository unit, integration, ODT, command, and presentation tests pass.
    2. Run npm run lint. Expected: ESLint completes without errors.
    3. Run npm run typecheck. Expected: all TypeScript projects compile without errors.
    4. Run npm run build. Expected: the production static build completes successfully.
    5. Run node .agentplane/policy/check-routing.mjs. Expected: AgentPlane routing and policy budgets pass.
    6. Run ap doctor. Expected: repository workflow state is healthy.
    7. Run the Playwright CLI against the local production or development build. Expected: Page Style opens from the Writer command surface; applying paper size, orientation, and margins changes the page geometry; horizontal and vertical ruler drags change page margins and paragraph indents; Cancel is non-mutating; undo and redo restore changes.
    8. Inspect an exported ODT and re-import it. Expected: page width, height, orientation, four margins, and paragraph indents survive import-export-import and are represented by ODF page-layout/master-page attributes.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-23T06:55:57.270Z — VERIFY — ok

    By: CODER

    Note: Implemented and verified Writer page geometry, Page Style dialog, horizontal/vertical rulers, undo/redo, codec persistence, and ODT page-layout/master-page round trips. 313/313 office tests execute successfully; the repository-wide npm test command still exits at its pre-existing 100% application coverage threshold (current aggregate 98.50% lines) despite zero test failures. Focused feature suite: 45/45 pass. Inventory suite: 96/96 at 100% coverage. format, lint, typecheck, build, resource generation, docs, routing, inventory invariants/parity, AgentPlane doctor, and Chromium interaction checks pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T05:39:51.974Z, excerpt_hash=sha256:ff23f27c04f35c62626cfb6dd03f934a88571f62cbbd2280d34e499adfd0949b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609230538-ZVK8FE/blueprint/resolved-snapshot.json
    - old_digest: fe993f2be9d6070c13d9164ed99d98fb39ee8b529b402cde7c48a44861441cb4
    - current_digest: fe993f2be9d6070c13d9164ed99d98fb39ee8b529b402cde7c48a44861441cb4
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609230538-ZVK8FE

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609230538-ZVK8FE
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-23T06:56:13.715Z — VERIFY — ok

    By: CODER

    Note: verified-202609230538-ZVK8FE
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T06:55:57.367Z, excerpt_hash=sha256:ff23f27c04f35c62626cfb6dd03f934a88571f62cbbd2280d34e499adfd0949b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609230538-ZVK8FE/blueprint/resolved-snapshot.json
    - old_digest: fe993f2be9d6070c13d9164ed99d98fb39ee8b529b402cde7c48a44861441cb4
    - current_digest: fe993f2be9d6070c13d9164ed99d98fb39ee8b529b402cde7c48a44861441cb4
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609230538-ZVK8FE

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609230538-ZVK8FE --result verified-202609230538-ZVK8FE --commit 6fd8d582ad219a0b44a790f0eff7c334b88eb507
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-23T06:56:53.608Z — VERIFY — ok

    By: CODER

    Note: verified-202609230538-ZVK8FE
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T06:56:13.802Z, excerpt_hash=sha256:ff23f27c04f35c62626cfb6dd03f934a88571f62cbbd2280d34e499adfd0949b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609230538-ZVK8FE/blueprint/resolved-snapshot.json
    - old_digest: fe993f2be9d6070c13d9164ed99d98fb39ee8b529b402cde7c48a44861441cb4
    - current_digest: fe993f2be9d6070c13d9164ed99d98fb39ee8b529b402cde7c48a44861441cb4
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609230538-ZVK8FE

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609230538-ZVK8FE --result verified-202609230538-ZVK8FE --commit 85eb8f689a24f2772ce02a5e3fd2ed1863fd4574
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
    - Observation: npm test reaches 313 passing tests but the global application coverage threshold is 100%; aggregate coverage remains 98.50% because multiple pre-existing modules have uncovered paths.
      Impact: No functional test failure; coverage gate remains non-zero and should be addressed as repository-wide test-debt work rather than by weakening thresholds.
      Resolution: Added focused coverage for page descriptors, all ruler handles, dialog validation, pagination, undo payloads, and ODT geometry; preserved the 100% threshold and recorded the residual repository-wide gap.
id_source: "generated"
---
## Summary

Implement Writer page geometry, page dialog, rulers, and ODT page styles

Add upstream-grounded page descriptors, physical page rendering, page-format dialog, horizontal and vertical rulers for page margins and paragraph indents, plus ODT page-layout import/export.

## Scope

In scope:
- Upstream-shaped standard page descriptor owned by SwDoc: physical size, orientation, and four page margins in twips.
- Physical paged browser projection with proportional page, margin, paragraph, and font geometry.
- Page Style dialog for paper format, orientation, custom dimensions, and margins.
- Functional horizontal and vertical rulers: page-margin handles plus paragraph left, right, and first-line indent handles.
- Writer command, shell, notification, undo/redo, persistence, localization, and presentation wiring.
- ODT 1.3 import/export of page-layout, page-layout-properties, master-page association, dimensions, margins, and print orientation.
- Upstream traceability documentation and automated/browser verification.

Out of scope:
- Headers, footers, mirrored/facing pages, columns, background/borders, printer trays, page numbering, tables, frames, and unrelated layout features.
- Network access or baseline upgrades.

## Plan

Implement the approved upstream-grounded end-to-end Writer page geometry slice: core page descriptor and undo semantics, ODT page style interchange, physical paged projection, Page Style dialog, horizontal and vertical rulers for page margins and paragraph indents, tests, documentation, and real-browser verification. The supported boundary is one standard page style for the current text model; unrelated LibreOffice page features remain out of scope.

## Verify Steps

1. Run npm test. Expected: all repository unit, integration, ODT, command, and presentation tests pass.
2. Run npm run lint. Expected: ESLint completes without errors.
3. Run npm run typecheck. Expected: all TypeScript projects compile without errors.
4. Run npm run build. Expected: the production static build completes successfully.
5. Run node .agentplane/policy/check-routing.mjs. Expected: AgentPlane routing and policy budgets pass.
6. Run ap doctor. Expected: repository workflow state is healthy.
7. Run the Playwright CLI against the local production or development build. Expected: Page Style opens from the Writer command surface; applying paper size, orientation, and margins changes the page geometry; horizontal and vertical ruler drags change page margins and paragraph indents; Cancel is non-mutating; undo and redo restore changes.
8. Inspect an exported ODT and re-import it. Expected: page width, height, orientation, four margins, and paragraph indents survive import-export-import and are represented by ODF page-layout/master-page attributes.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-23T06:55:57.270Z — VERIFY — ok

By: CODER

Note: Implemented and verified Writer page geometry, Page Style dialog, horizontal/vertical rulers, undo/redo, codec persistence, and ODT page-layout/master-page round trips. 313/313 office tests execute successfully; the repository-wide npm test command still exits at its pre-existing 100% application coverage threshold (current aggregate 98.50% lines) despite zero test failures. Focused feature suite: 45/45 pass. Inventory suite: 96/96 at 100% coverage. format, lint, typecheck, build, resource generation, docs, routing, inventory invariants/parity, AgentPlane doctor, and Chromium interaction checks pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T05:39:51.974Z, excerpt_hash=sha256:ff23f27c04f35c62626cfb6dd03f934a88571f62cbbd2280d34e499adfd0949b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609230538-ZVK8FE/blueprint/resolved-snapshot.json
- old_digest: fe993f2be9d6070c13d9164ed99d98fb39ee8b529b402cde7c48a44861441cb4
- current_digest: fe993f2be9d6070c13d9164ed99d98fb39ee8b529b402cde7c48a44861441cb4
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609230538-ZVK8FE

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609230538-ZVK8FE
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-23T06:56:13.715Z — VERIFY — ok

By: CODER

Note: verified-202609230538-ZVK8FE
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T06:55:57.367Z, excerpt_hash=sha256:ff23f27c04f35c62626cfb6dd03f934a88571f62cbbd2280d34e499adfd0949b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609230538-ZVK8FE/blueprint/resolved-snapshot.json
- old_digest: fe993f2be9d6070c13d9164ed99d98fb39ee8b529b402cde7c48a44861441cb4
- current_digest: fe993f2be9d6070c13d9164ed99d98fb39ee8b529b402cde7c48a44861441cb4
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609230538-ZVK8FE

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609230538-ZVK8FE --result verified-202609230538-ZVK8FE --commit 6fd8d582ad219a0b44a790f0eff7c334b88eb507
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-23T06:56:53.608Z — VERIFY — ok

By: CODER

Note: verified-202609230538-ZVK8FE
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T06:56:13.802Z, excerpt_hash=sha256:ff23f27c04f35c62626cfb6dd03f934a88571f62cbbd2280d34e499adfd0949b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609230538-ZVK8FE/blueprint/resolved-snapshot.json
- old_digest: fe993f2be9d6070c13d9164ed99d98fb39ee8b529b402cde7c48a44861441cb4
- current_digest: fe993f2be9d6070c13d9164ed99d98fb39ee8b529b402cde7c48a44861441cb4
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609230538-ZVK8FE

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609230538-ZVK8FE --result verified-202609230538-ZVK8FE --commit 85eb8f689a24f2772ce02a5e3fd2ed1863fd4574
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

- Observation: npm test reaches 313 passing tests but the global application coverage threshold is 100%; aggregate coverage remains 98.50% because multiple pre-existing modules have uncovered paths.
  Impact: No functional test failure; coverage gate remains non-zero and should be addressed as repository-wide test-debt work rather than by weakening thresholds.
  Resolution: Added focused coverage for page descriptors, all ruler handles, dialog validation, pagination, undo payloads, and ODT geometry; preserved the 100% threshold and recorded the residual repository-wide gap.
