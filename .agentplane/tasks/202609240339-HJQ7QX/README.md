---
id: "202609240339-HJQ7QX"
title: "Expose imported Writer formatting controls"
result_summary: "verified-202609240339-HJQ7QX"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T03:40:05.887Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-24T04:31:34.348Z"
  updated_by: "CODER"
  note: "verified-202609240339-HJQ7QX"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-24T04:31:10.065Z"
  updated_by: "EVALUATOR"
  note: "Writer formatting controls and ODT paths are implemented and verified."
  evaluated_sha: "ccc1df74542e0075ef1acb07f03d7220b5070a97"
  blueprint_digest: "0329d87b49c14d199e6a15db90330c8cc252e89ff658693da7504873a6e1d483"
  evidence_refs:
    - ".agentplane/tasks/202609240339-HJQ7QX/README.md"
    - ".agentplane/tasks/202609240339-HJQ7QX/quality/20260924-043110065-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609240339-HJQ7QX/quality/20260924-043110065-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609240339-HJQ7QX/quality/20260924-043110065-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609240339-HJQ7QX/blueprint/resolved-snapshot.json"
    - "commit ccc1df74542e0075ef1acb07f03d7220b5070a97"
    - "npm run test:coverage -w @vite-office/office: 443 pass, 100% coverage"
    - "npm run test:e2e: 13 pass"
    - "npm run build -w @vite-office/office: pass"
  findings:
    - "No blocking issues in the reviewed diff; the color button accessible name was corrected after E2E exposed a selector collision."
commit:
  hash: "5b2d8b407b26ad34bfa9384d543986e2e70ed1f9"
  message: "🧩 HJQ7QX task: record quality review"
comments:
  -
    author: "CODER"
    body: "Start: Implement approved Writer formatting controls, canonical editing behavior, ODT round trips, and focused verification."
  -
    author: "CODER"
    body: "Verified: verified-202609240339-HJQ7QX. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-09-24T03:40:11.908Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved Writer formatting controls, canonical editing behavior, ODT round trips, and focused verification."
  -
    type: "verify"
    at: "2026-09-24T04:30:43.079Z"
    author: "CODER"
    state: "ok"
    note: "Writer formatting controls, ODT round trip, undo, pagination, 443 unit tests at 100% coverage, 13 E2E tests, typecheck, build, doctor and routing checks passed."
  -
    type: "verify"
    at: "2026-09-24T04:30:53.344Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609240339-HJQ7QX"
  -
    type: "verify"
    at: "2026-09-24T04:31:34.348Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609240339-HJQ7QX"
  -
    type: "status"
    at: "2026-09-24T04:31:34.532Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609240339-HJQ7QX. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-09-24T04:31:34.533Z"
doc_updated_by: "CODER"
description: "Add LibreOffice Writer-style UI and editing commands for text color, highlight, line and paragraph spacing, tab stops, keep-with-next, and line numbering participation; preserve ODT round trips."
sections:
  Summary: |-
    Expose imported Writer formatting controls

    Add LibreOffice Writer-style UI and editing commands for text color, highlight, line and paragraph spacing, tab stops, keep-with-next, and line numbering participation; preserve ODT round trips.
  Scope: "In scope: Writer character color and highlight, paragraph line and above/below spacing, contextual spacing, multiple tab stops, keep-with-next, line numbering participation; shell commands, Writer-style toolbar/dialog/ruler/sidebar controls, ODT import/export, rendering and pagination, targeted tests. Out of scope: unrelated document features and external publication."
  Plan: "1. Extend canonical Writer model and selection-aware editing commands for all approved formatting properties. 2. Add Writer-style toolbar palettes, spacing menu, paragraph dialog, tab controls and relevant sidebar feedback using generated resource conventions. 3. Extend ODT tab-stop mapping and layout behavior for multiple stops, keep-with-next and line numbering participation. 4. Cover command state, UI interactions, rendering and ODT round trips with focused checks. 5. Verify and finish with a clean tracked state."
  Verify Steps: "1. Run targeted Writer command, UI and ODT tests covering application, mixed selection, undo/redo, import/export, and multi-tab round trip. Expected: all pass. 2. Run office typecheck and build. Expected: both pass. 3. Run repository doctor and routing check. Expected: both pass. 4. Inspect final diff and git status. Expected: only task files changed and no unintended artifacts."
  Verification: |-
    - Command: npm run test:coverage -w @vite-office/office
      Result: pass
      Evidence: 98 files, 443 tests; statements, branches, functions and lines all 100%.
      Scope: Writer model, UI, ODT mapping and regression suite.
    - Command: npm run test:e2e
      Result: pass
      Evidence: 13 browser scenarios pass, including hyperlinks and ODT reopen.
      Scope: Writer browser interaction and existing workflows.
    - Command: npm run typecheck -w @vite-office/office; npm run build -w @vite-office/office
      Result: pass
      Evidence: TypeScript succeeds and Vite produces the production bundle.
      Scope: office source and application bundle.
    - Command: npm run format:check; npm run lint; npm run check:docs; npm run check:dependencies; git diff --check
      Result: pass
      Evidence: style, documentation, module boundaries and diff checks succeed.
      Scope: changed repository files.
    - Command: ap doctor; node .agentplane/policy/check-routing.mjs
      Result: pass
      Evidence: doctor exits OK with unrelated existing hook-shim and historical task warnings; policy routing OK.
      Scope: task workflow and repository policy.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T04:30:43.079Z — VERIFY — ok

    By: CODER

    Note: Writer formatting controls, ODT round trip, undo, pagination, 443 unit tests at 100% coverage, 13 E2E tests, typecheck, build, doctor and routing checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T04:30:10.924Z, excerpt_hash=sha256:02ca425bdcd877b8fd28dedc06d6ba20bb3d7d8932af5f8271010a7985be1262

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240339-HJQ7QX/blueprint/resolved-snapshot.json
    - old_digest: 0329d87b49c14d199e6a15db90330c8cc252e89ff658693da7504873a6e1d483
    - current_digest: 0329d87b49c14d199e6a15db90330c8cc252e89ff658693da7504873a6e1d483
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609240339-HJQ7QX

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609240339-HJQ7QX
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-09-24T04:30:53.344Z — VERIFY — ok

    By: CODER

    Note: verified-202609240339-HJQ7QX
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T04:30:43.160Z, excerpt_hash=sha256:02ca425bdcd877b8fd28dedc06d6ba20bb3d7d8932af5f8271010a7985be1262

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240339-HJQ7QX/blueprint/resolved-snapshot.json
    - old_digest: 0329d87b49c14d199e6a15db90330c8cc252e89ff658693da7504873a6e1d483
    - current_digest: 0329d87b49c14d199e6a15db90330c8cc252e89ff658693da7504873a6e1d483
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609240339-HJQ7QX

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609240339-HJQ7QX --result verified-202609240339-HJQ7QX --commit ccc1df74542e0075ef1acb07f03d7220b5070a97
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-24T04:31:34.348Z — VERIFY — ok

    By: CODER

    Note: verified-202609240339-HJQ7QX
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T04:30:53.420Z, excerpt_hash=sha256:02ca425bdcd877b8fd28dedc06d6ba20bb3d7d8932af5f8271010a7985be1262

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240339-HJQ7QX/blueprint/resolved-snapshot.json
    - old_digest: 0329d87b49c14d199e6a15db90330c8cc252e89ff658693da7504873a6e1d483
    - current_digest: 0329d87b49c14d199e6a15db90330c8cc252e89ff658693da7504873a6e1d483
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609240339-HJQ7QX

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609240339-HJQ7QX --result verified-202609240339-HJQ7QX --commit 5b2d8b407b26ad34bfa9384d543986e2e70ed1f9
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
extensions:
  implementation_commit:
    hash: "ccc1df74542e0075ef1acb07f03d7220b5070a97"
    message: "🧩 HJQ7QX task: add Writer formatting controls"
id_source: "generated"
---
## Summary

Expose imported Writer formatting controls

Add LibreOffice Writer-style UI and editing commands for text color, highlight, line and paragraph spacing, tab stops, keep-with-next, and line numbering participation; preserve ODT round trips.

## Scope

In scope: Writer character color and highlight, paragraph line and above/below spacing, contextual spacing, multiple tab stops, keep-with-next, line numbering participation; shell commands, Writer-style toolbar/dialog/ruler/sidebar controls, ODT import/export, rendering and pagination, targeted tests. Out of scope: unrelated document features and external publication.

## Plan

1. Extend canonical Writer model and selection-aware editing commands for all approved formatting properties. 2. Add Writer-style toolbar palettes, spacing menu, paragraph dialog, tab controls and relevant sidebar feedback using generated resource conventions. 3. Extend ODT tab-stop mapping and layout behavior for multiple stops, keep-with-next and line numbering participation. 4. Cover command state, UI interactions, rendering and ODT round trips with focused checks. 5. Verify and finish with a clean tracked state.

## Verify Steps

1. Run targeted Writer command, UI and ODT tests covering application, mixed selection, undo/redo, import/export, and multi-tab round trip. Expected: all pass. 2. Run office typecheck and build. Expected: both pass. 3. Run repository doctor and routing check. Expected: both pass. 4. Inspect final diff and git status. Expected: only task files changed and no unintended artifacts.

## Verification

- Command: npm run test:coverage -w @vite-office/office
  Result: pass
  Evidence: 98 files, 443 tests; statements, branches, functions and lines all 100%.
  Scope: Writer model, UI, ODT mapping and regression suite.
- Command: npm run test:e2e
  Result: pass
  Evidence: 13 browser scenarios pass, including hyperlinks and ODT reopen.
  Scope: Writer browser interaction and existing workflows.
- Command: npm run typecheck -w @vite-office/office; npm run build -w @vite-office/office
  Result: pass
  Evidence: TypeScript succeeds and Vite produces the production bundle.
  Scope: office source and application bundle.
- Command: npm run format:check; npm run lint; npm run check:docs; npm run check:dependencies; git diff --check
  Result: pass
  Evidence: style, documentation, module boundaries and diff checks succeed.
  Scope: changed repository files.
- Command: ap doctor; node .agentplane/policy/check-routing.mjs
  Result: pass
  Evidence: doctor exits OK with unrelated existing hook-shim and historical task warnings; policy routing OK.
  Scope: task workflow and repository policy.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T04:30:43.079Z — VERIFY — ok

By: CODER

Note: Writer formatting controls, ODT round trip, undo, pagination, 443 unit tests at 100% coverage, 13 E2E tests, typecheck, build, doctor and routing checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T04:30:10.924Z, excerpt_hash=sha256:02ca425bdcd877b8fd28dedc06d6ba20bb3d7d8932af5f8271010a7985be1262

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240339-HJQ7QX/blueprint/resolved-snapshot.json
- old_digest: 0329d87b49c14d199e6a15db90330c8cc252e89ff658693da7504873a6e1d483
- current_digest: 0329d87b49c14d199e6a15db90330c8cc252e89ff658693da7504873a6e1d483
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609240339-HJQ7QX

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609240339-HJQ7QX
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-09-24T04:30:53.344Z — VERIFY — ok

By: CODER

Note: verified-202609240339-HJQ7QX
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T04:30:43.160Z, excerpt_hash=sha256:02ca425bdcd877b8fd28dedc06d6ba20bb3d7d8932af5f8271010a7985be1262

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240339-HJQ7QX/blueprint/resolved-snapshot.json
- old_digest: 0329d87b49c14d199e6a15db90330c8cc252e89ff658693da7504873a6e1d483
- current_digest: 0329d87b49c14d199e6a15db90330c8cc252e89ff658693da7504873a6e1d483
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609240339-HJQ7QX

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609240339-HJQ7QX --result verified-202609240339-HJQ7QX --commit ccc1df74542e0075ef1acb07f03d7220b5070a97
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-24T04:31:34.348Z — VERIFY — ok

By: CODER

Note: verified-202609240339-HJQ7QX
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T04:30:53.420Z, excerpt_hash=sha256:02ca425bdcd877b8fd28dedc06d6ba20bb3d7d8932af5f8271010a7985be1262

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240339-HJQ7QX/blueprint/resolved-snapshot.json
- old_digest: 0329d87b49c14d199e6a15db90330c8cc252e89ff658693da7504873a6e1d483
- current_digest: 0329d87b49c14d199e6a15db90330c8cc252e89ff658693da7504873a6e1d483
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609240339-HJQ7QX

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609240339-HJQ7QX --result verified-202609240339-HJQ7QX --commit 5b2d8b407b26ad34bfa9384d543986e2e70ed1f9
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
