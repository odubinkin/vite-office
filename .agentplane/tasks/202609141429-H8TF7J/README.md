---
id: "202609141429-H8TF7J"
title: "Implement Workstream 4 command and UI architecture"
result_summary: "verified-202609141429-H8TF7J"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-14T14:30:22.990Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-14T15:10:24.912Z"
  updated_by: "CODER"
  note: "verified-202609141429-H8TF7J"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-14T15:09:58.482Z"
  updated_by: "EVALUATOR"
  note: "Workstream 4 implementation satisfies the approved command/UI architecture scope and all repository gates."
  evaluated_sha: "cb4b75c96cca0c0f9bf71f81ce781ee419a17c20"
  blueprint_digest: "110896dd3bc3ff1ffa8eb77e46283fde984a45bc28a238fec144b56dc4943be9"
  evidence_refs:
    - ".agentplane/tasks/202609141429-H8TF7J/README.md"
    - ".agentplane/tasks/202609141429-H8TF7J/quality/20260914-150958482-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609141429-H8TF7J/quality/20260914-150958482-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609141429-H8TF7J/quality/20260914-150958482-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609141429-H8TF7J/blueprint/resolved-snapshot.json"
    - "npm run verify"
  findings:
    - "Shared command descriptors and dispatcher state now drive declarative Writer resources and generic browser presenters; interaction, provenance, and regression coverage pass."
commit:
  hash: "cb4b75c96cca0c0f9bf71f81ce781ee419a17c20"
  message: "♻️ H8TF7J code: align Writer command UI architecture"
comments:
  -
    author: "CODER"
    body: "Start: implement approved Workstream 4 command descriptors, declarative UI resources, corrected browser presenter identities, and accessible menu semantics against the pinned LibreOffice baseline."
  -
    author: "CODER"
    body: "Verified: verified-202609141429-H8TF7J. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-09-14T14:30:34.439Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Workstream 4 command descriptors, declarative UI resources, corrected browser presenter identities, and accessible menu semantics against the pinned LibreOffice baseline."
  -
    type: "verify"
    at: "2026-09-14T15:09:39.450Z"
    author: "CODER"
    state: "ok"
    note: "Verified Workstream 4: focused command/presentation suite ran 21/21 assertions (the focused coverage invocation cannot satisfy the repository-wide 100% aggregate by design); focused Writer menu Playwright 1/1 passed; full npm run verify passed with unit 252/252 at 100% statements/branches/functions/lines, inventory 84/84 at 100%, Playwright 9/9, static/docs/file-size/source-tree/source-provenance/parity checks; ap doctor OK with one unrelated historical-task warning; routing policy OK; implementation commit cb4b75c96cca."
  -
    type: "verify"
    at: "2026-09-14T15:09:49.130Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609141429-H8TF7J"
  -
    type: "verify"
    at: "2026-09-14T15:10:04.357Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609141429-H8TF7J"
  -
    type: "verify"
    at: "2026-09-14T15:10:24.912Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609141429-H8TF7J"
  -
    type: "status"
    at: "2026-09-14T15:10:25.046Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609141429-H8TF7J. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-09-14T15:10:25.047Z"
doc_updated_by: "CODER"
description: "Implement P4.1-P4.4 from docs/program/vite-office-upstream-parity-plan.md using pinned LibreOffice 26.8.0.2 sources, preserving upstream structure and semantics where browser constraints allow; do not retain old persisted document compatibility if storage model changes."
sections:
  Summary: "Align Writer command and browser UI architecture with Workstream 4 (P4.1-P4.4) and the pinned LibreOffice 26.8.0.2 baseline."
  Scope: "Extend presentation-neutral command descriptors and shared command state; replace manual WriterWorkbench command maps and callback chains; keep sw/uiconfig as declarative upstream-derived placement resources; move React presenters and browser adapters out of false upstream ownership paths; implement a reusable accessible menu state machine; update provenance/runtime inventories and focused documentation. No feature expansion outside Workstream 4. If persisted document shape changes unexpectedly, remove legacy compatibility instead of preserving old formats."
  Plan: "1. Inventory current command definitions, UI placements, browser adapters, tests, and pinned LibreOffice XML/symbol ownership. 2. Add validated presentation metadata, typed command state including asynchronous pending/error, argument semantics, shortcuts, and shell ownership to the shared descriptor contract. 3. Rebuild Writer menu/toolbar placement as TS declarative resources matching the supported subset and upstream order; add generic browser presenters driven only by descriptors, placements, QueryState, and Execute. 4. Remove manual command mapping/callback props from WriterWorkbench and converge menu, toolbar, and shortcuts on identical dispatcher state. 5. Relocate falsely named React/browser modules (mainwn, inputwin, WriterInspectorTextPanel, textsh hook, wrtsh/select DOM conversion) into explicit browser presentation/adapter paths and update imports, provenance, and inventories. 6. Implement and test reusable menu interaction state machine: roving focus, top-level and popup navigation, Home/End, Enter/Space, Escape/focus restoration, outside click, submenu focus, typeahead, and disabled skipping. 7. Run focused and full verification, record evidence, and finish the direct-mode task."
  Verify Steps: "1. npm run test:coverage --workspace @vite-office/office -- --run apps/office/src/framework/source/dispatch/dispatchprovider.test.ts apps/office/src/sw/source/uibase/uiview/view-session.test.tsx apps/office/src/sw/browser/presentation (or the final equivalent focused test paths). 2. npm run test:e2e -- --grep \"Writer menu keyboard|Writer command surfaces\" (use final exact Workstream 4 test titles). 3. npm run verify. 4. ap doctor. 5. node .agentplane/policy/check-routing.mjs. 6. git status --short --untracked-files=all; confirm only task-scoped files and Agentplane artifacts remain."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-14T15:09:39.450Z — VERIFY — ok

    By: CODER

    Note: Verified Workstream 4: focused command/presentation suite ran 21/21 assertions (the focused coverage invocation cannot satisfy the repository-wide 100% aggregate by design); focused Writer menu Playwright 1/1 passed; full npm run verify passed with unit 252/252 at 100% statements/branches/functions/lines, inventory 84/84 at 100%, Playwright 9/9, static/docs/file-size/source-tree/source-provenance/parity checks; ap doctor OK with one unrelated historical-task warning; routing policy OK; implementation commit cb4b75c96cca.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T14:30:34.439Z, excerpt_hash=sha256:88af327fe2969ed3f582bdfe6a3caed059ae94ddd8551cde8da494e198523e20

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141429-H8TF7J/blueprint/resolved-snapshot.json
    - old_digest: 110896dd3bc3ff1ffa8eb77e46283fde984a45bc28a238fec144b56dc4943be9
    - current_digest: 110896dd3bc3ff1ffa8eb77e46283fde984a45bc28a238fec144b56dc4943be9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609141429-H8TF7J

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609141429-H8TF7J
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-14T15:09:49.130Z — VERIFY — ok

    By: CODER

    Note: verified-202609141429-H8TF7J
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T15:09:39.530Z, excerpt_hash=sha256:88af327fe2969ed3f582bdfe6a3caed059ae94ddd8551cde8da494e198523e20

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141429-H8TF7J/blueprint/resolved-snapshot.json
    - old_digest: 110896dd3bc3ff1ffa8eb77e46283fde984a45bc28a238fec144b56dc4943be9
    - current_digest: 110896dd3bc3ff1ffa8eb77e46283fde984a45bc28a238fec144b56dc4943be9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609141429-H8TF7J

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609141429-H8TF7J --result verified-202609141429-H8TF7J --commit cb4b75c96cca0c0f9bf71f81ce781ee419a17c20
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-14T15:10:04.357Z — VERIFY — ok

    By: CODER

    Note: verified-202609141429-H8TF7J
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T15:09:49.204Z, excerpt_hash=sha256:88af327fe2969ed3f582bdfe6a3caed059ae94ddd8551cde8da494e198523e20

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141429-H8TF7J/blueprint/resolved-snapshot.json
    - old_digest: 110896dd3bc3ff1ffa8eb77e46283fde984a45bc28a238fec144b56dc4943be9
    - current_digest: 110896dd3bc3ff1ffa8eb77e46283fde984a45bc28a238fec144b56dc4943be9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609141429-H8TF7J

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609141429-H8TF7J --result verified-202609141429-H8TF7J --commit cb4b75c96cca0c0f9bf71f81ce781ee419a17c20
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-14T15:10:24.912Z — VERIFY — ok

    By: CODER

    Note: verified-202609141429-H8TF7J
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T15:10:04.430Z, excerpt_hash=sha256:88af327fe2969ed3f582bdfe6a3caed059ae94ddd8551cde8da494e198523e20

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141429-H8TF7J/blueprint/resolved-snapshot.json
    - old_digest: 110896dd3bc3ff1ffa8eb77e46283fde984a45bc28a238fec144b56dc4943be9
    - current_digest: 110896dd3bc3ff1ffa8eb77e46283fde984a45bc28a238fec144b56dc4943be9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609141429-H8TF7J

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609141429-H8TF7J --result verified-202609141429-H8TF7J --commit 58d0567e35b1e2d9e0404c07d7720a45a32ef848
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the Workstream 4 implementation commit and its task close commit. No data migration rollback is expected because this workstream must not change persisted document semantics."
  Findings: |-
    - Observation: Writer command descriptors, declarative uiconfig resources, browser presenters, and menu interaction state machine satisfy Workstream 4 acceptance criteria.
      Impact: Menus, toolbars, selectors, and accelerators share dispatcher metadata/state, while browser-only approximations no longer claim upstream source identities.
      Resolution: Accepted after complete project verification and provenance validation.
id_source: "generated"
---
## Summary

Align Writer command and browser UI architecture with Workstream 4 (P4.1-P4.4) and the pinned LibreOffice 26.8.0.2 baseline.

## Scope

Extend presentation-neutral command descriptors and shared command state; replace manual WriterWorkbench command maps and callback chains; keep sw/uiconfig as declarative upstream-derived placement resources; move React presenters and browser adapters out of false upstream ownership paths; implement a reusable accessible menu state machine; update provenance/runtime inventories and focused documentation. No feature expansion outside Workstream 4. If persisted document shape changes unexpectedly, remove legacy compatibility instead of preserving old formats.

## Plan

1. Inventory current command definitions, UI placements, browser adapters, tests, and pinned LibreOffice XML/symbol ownership. 2. Add validated presentation metadata, typed command state including asynchronous pending/error, argument semantics, shortcuts, and shell ownership to the shared descriptor contract. 3. Rebuild Writer menu/toolbar placement as TS declarative resources matching the supported subset and upstream order; add generic browser presenters driven only by descriptors, placements, QueryState, and Execute. 4. Remove manual command mapping/callback props from WriterWorkbench and converge menu, toolbar, and shortcuts on identical dispatcher state. 5. Relocate falsely named React/browser modules (mainwn, inputwin, WriterInspectorTextPanel, textsh hook, wrtsh/select DOM conversion) into explicit browser presentation/adapter paths and update imports, provenance, and inventories. 6. Implement and test reusable menu interaction state machine: roving focus, top-level and popup navigation, Home/End, Enter/Space, Escape/focus restoration, outside click, submenu focus, typeahead, and disabled skipping. 7. Run focused and full verification, record evidence, and finish the direct-mode task.

## Verify Steps

1. npm run test:coverage --workspace @vite-office/office -- --run apps/office/src/framework/source/dispatch/dispatchprovider.test.ts apps/office/src/sw/source/uibase/uiview/view-session.test.tsx apps/office/src/sw/browser/presentation (or the final equivalent focused test paths). 2. npm run test:e2e -- --grep "Writer menu keyboard|Writer command surfaces" (use final exact Workstream 4 test titles). 3. npm run verify. 4. ap doctor. 5. node .agentplane/policy/check-routing.mjs. 6. git status --short --untracked-files=all; confirm only task-scoped files and Agentplane artifacts remain.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-14T15:09:39.450Z — VERIFY — ok

By: CODER

Note: Verified Workstream 4: focused command/presentation suite ran 21/21 assertions (the focused coverage invocation cannot satisfy the repository-wide 100% aggregate by design); focused Writer menu Playwright 1/1 passed; full npm run verify passed with unit 252/252 at 100% statements/branches/functions/lines, inventory 84/84 at 100%, Playwright 9/9, static/docs/file-size/source-tree/source-provenance/parity checks; ap doctor OK with one unrelated historical-task warning; routing policy OK; implementation commit cb4b75c96cca.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T14:30:34.439Z, excerpt_hash=sha256:88af327fe2969ed3f582bdfe6a3caed059ae94ddd8551cde8da494e198523e20

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141429-H8TF7J/blueprint/resolved-snapshot.json
- old_digest: 110896dd3bc3ff1ffa8eb77e46283fde984a45bc28a238fec144b56dc4943be9
- current_digest: 110896dd3bc3ff1ffa8eb77e46283fde984a45bc28a238fec144b56dc4943be9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609141429-H8TF7J

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609141429-H8TF7J
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-14T15:09:49.130Z — VERIFY — ok

By: CODER

Note: verified-202609141429-H8TF7J
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T15:09:39.530Z, excerpt_hash=sha256:88af327fe2969ed3f582bdfe6a3caed059ae94ddd8551cde8da494e198523e20

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141429-H8TF7J/blueprint/resolved-snapshot.json
- old_digest: 110896dd3bc3ff1ffa8eb77e46283fde984a45bc28a238fec144b56dc4943be9
- current_digest: 110896dd3bc3ff1ffa8eb77e46283fde984a45bc28a238fec144b56dc4943be9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609141429-H8TF7J

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609141429-H8TF7J --result verified-202609141429-H8TF7J --commit cb4b75c96cca0c0f9bf71f81ce781ee419a17c20
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-14T15:10:04.357Z — VERIFY — ok

By: CODER

Note: verified-202609141429-H8TF7J
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T15:09:49.204Z, excerpt_hash=sha256:88af327fe2969ed3f582bdfe6a3caed059ae94ddd8551cde8da494e198523e20

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141429-H8TF7J/blueprint/resolved-snapshot.json
- old_digest: 110896dd3bc3ff1ffa8eb77e46283fde984a45bc28a238fec144b56dc4943be9
- current_digest: 110896dd3bc3ff1ffa8eb77e46283fde984a45bc28a238fec144b56dc4943be9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609141429-H8TF7J

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609141429-H8TF7J --result verified-202609141429-H8TF7J --commit cb4b75c96cca0c0f9bf71f81ce781ee419a17c20
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-14T15:10:24.912Z — VERIFY — ok

By: CODER

Note: verified-202609141429-H8TF7J
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T15:10:04.430Z, excerpt_hash=sha256:88af327fe2969ed3f582bdfe6a3caed059ae94ddd8551cde8da494e198523e20

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141429-H8TF7J/blueprint/resolved-snapshot.json
- old_digest: 110896dd3bc3ff1ffa8eb77e46283fde984a45bc28a238fec144b56dc4943be9
- current_digest: 110896dd3bc3ff1ffa8eb77e46283fde984a45bc28a238fec144b56dc4943be9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609141429-H8TF7J

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609141429-H8TF7J --result verified-202609141429-H8TF7J --commit 58d0567e35b1e2d9e0404c07d7720a45a32ef848
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the Workstream 4 implementation commit and its task close commit. No data migration rollback is expected because this workstream must not change persisted document semantics.

## Findings

- Observation: Writer command descriptors, declarative uiconfig resources, browser presenters, and menu interaction state machine satisfy Workstream 4 acceptance criteria.
  Impact: Menus, toolbars, selectors, and accelerators share dispatcher metadata/state, while browser-only approximations no longer claim upstream source identities.
  Resolution: Accepted after complete project verification and provenance validation.
