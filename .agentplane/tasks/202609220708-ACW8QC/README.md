---
id: "202609220708-ACW8QC"
title: "Rebuild Writer browser UI boundary for P1"
result_summary: "verified-202609220708-ACW8QC"
status: "DONE"
priority: "high"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on:
  - "202609220707-9JA4S3"
tags:
  - "code"
  - "frontend"
  - "parity"
task_kind: "code"
mutation_scope: "code"
blueprint_request: "code.direct"
verify:
  - "npm run check:writer-resources && npm run check:dependencies && npm run check:source-tree && npm run check:source-provenance && npm run inventory:parity"
  - "npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check"
  - "npm run test:coverage && npm run test:e2e"
plan_approval:
  state: "approved"
  updated_at: "2026-09-22T07:09:54.521Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-22T09:34:46.940Z"
  updated_by: "CODER"
  note: "verified-202609220708-ACW8QC"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-22T09:34:01.836Z"
  updated_by: "EVALUATOR"
  note: "Writer edit path and binding-backed UI match the approved P1.8-P1.12 scope."
  evaluated_sha: "31ab502dd07051da9f1e49745be5ac212605fa1e"
  blueprint_digest: "04a5f7c5c6401a463a788e5aacb9759161c41265bb2011de5eaad57dc1e3b032"
  evidence_refs:
    - ".agentplane/tasks/202609220708-ACW8QC/README.md"
    - ".agentplane/tasks/202609220708-ACW8QC/quality/20260922-093401836-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609220708-ACW8QC/quality/20260922-093401836-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609220708-ACW8QC/quality/20260922-093401836-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609220708-ACW8QC/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/source/uibase/docvw/edtwin.test.ts"
    - "apps/office/src/sw/browser/editor/browser-writer-edit-window.test.ts"
    - "apps/office/e2e/foundation.spec.ts"
  findings:
    - "Persistent SwEditWin owns editing semantics; browser controller owns DOM events; generated command resources and SfxControllerItem-backed state drive surfaces without React mutation logic."
commit:
  hash: "0ab4393ffc1b0b19bd0cf2832ff1d69d8f8b23a4"
  message: "🧪 ACW8QC parity: record Writer UI parity evidence"
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Verified: verified-202609220708-ACW8QC. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-09-22T08:20:49.103Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-09-22T09:33:53.742Z"
    author: "CODER"
    state: "ok"
    note: "P1.8-P1.12 verified: app 365/365 and inventory 96/96 tests with 100% coverage; Playwright 11/11; generated Writer resources, dependencies, source tree, provenance, parity inventory, static build, invariants, lint, typecheck, file-size, formatting, and git diff checks pass."
  -
    type: "verify"
    at: "2026-09-22T09:34:17.598Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609220708-ACW8QC"
  -
    type: "verify"
    at: "2026-09-22T09:34:46.940Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609220708-ACW8QC"
  -
    type: "status"
    at: "2026-09-22T09:34:47.139Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609220708-ACW8QC. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-09-22T09:34:47.140Z"
doc_updated_by: "CODER"
description: "Implement P1.8-P1.12: add the edit-window controller boundary, make React projection-only, publish binding-backed command state, generate the complete resource graph with dispositions, and reduce Writer-specific presentation orchestration."
sections:
  Summary: |-
    Rebuild Writer browser UI boundary for P1

    Implement P1.8-P1.12: add the edit-window controller boundary, make React projection-only, publish binding-backed command state, generate the complete resource graph with dispositions, and reduce Writer-specific presentation orchestration.
  Scope: |-
    - In scope: Implement P1.8-P1.12: add the edit-window controller boundary, make React projection-only, publish binding-backed command state, generate the complete resource graph with dispositions, and reduce Writer-specific presentation orchestration.
    - Out of scope: unrelated refactors not required for "Rebuild Writer browser UI boundary for P1".
  Plan: |-
    1. Introduce a non-DOM Writer document-view/edit-window contract under sw/source/uibase/docvw and one browser DOM implementation.
    2. Consolidate selection, beforeinput, composition, pointer, clipboard, drag/drop, and focus translation behind that controller.
    3. Make Writer React components consume render-only projections and stable forwarded handlers; remove projection-ID mutations and per-render command queries.
    4. Add SfxControllerItem-like binding subscriptions and generate the complete resource/disposition graph, keeping browser additions explicit.
    5. Reduce presentation orchestration, update affected inventory/docs, and verify accessibility, menus, toolbar, dialogs, keyboard, IME, selection, clipboard, and command state.
  Verify Steps: |-
    1. Run focused controller, projection, bindings, presentation, and Writer component tests. Expected: React is projection-only and Writer operations work independently of React.
    2. Run npm run test:coverage && npm run test:e2e. Expected: unit/integration coverage and production browser flows pass for keyboard, focus, dialogs, selection, IME, clipboard, and command enablement.
    3. Run npm run check:writer-resources && npm run check:dependencies && npm run check:source-tree && npm run check:source-provenance && npm run inventory:parity. Expected: complete disposition and ownership checks pass.
    4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check. Expected: static and hygiene checks pass.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-22T09:33:53.742Z — VERIFY — ok

    By: CODER

    Note: P1.8-P1.12 verified: app 365/365 and inventory 96/96 tests with 100% coverage; Playwright 11/11; generated Writer resources, dependencies, source tree, provenance, parity inventory, static build, invariants, lint, typecheck, file-size, formatting, and git diff checks pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T08:20:49.103Z, excerpt_hash=sha256:904a91636bc20588f24dad214d87bb5b02a4b4efb799845e3b5a279350b623b8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220708-ACW8QC/blueprint/resolved-snapshot.json
    - old_digest: 04a5f7c5c6401a463a788e5aacb9759161c41265bb2011de5eaad57dc1e3b032
    - current_digest: 04a5f7c5c6401a463a788e5aacb9759161c41265bb2011de5eaad57dc1e3b032
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609220708-ACW8QC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609220708-ACW8QC
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-22T09:34:17.598Z — VERIFY — ok

    By: CODER

    Note: verified-202609220708-ACW8QC
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T09:33:53.819Z, excerpt_hash=sha256:904a91636bc20588f24dad214d87bb5b02a4b4efb799845e3b5a279350b623b8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220708-ACW8QC/blueprint/resolved-snapshot.json
    - old_digest: 04a5f7c5c6401a463a788e5aacb9759161c41265bb2011de5eaad57dc1e3b032
    - current_digest: 04a5f7c5c6401a463a788e5aacb9759161c41265bb2011de5eaad57dc1e3b032
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609220708-ACW8QC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609220708-ACW8QC --result verified-202609220708-ACW8QC --commit 31ab502dd07051da9f1e49745be5ac212605fa1e
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-22T09:34:46.940Z — VERIFY — ok

    By: CODER

    Note: verified-202609220708-ACW8QC
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T09:34:17.667Z, excerpt_hash=sha256:904a91636bc20588f24dad214d87bb5b02a4b4efb799845e3b5a279350b623b8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220708-ACW8QC/blueprint/resolved-snapshot.json
    - old_digest: 04a5f7c5c6401a463a788e5aacb9759161c41265bb2011de5eaad57dc1e3b032
    - current_digest: 04a5f7c5c6401a463a788e5aacb9759161c41265bb2011de5eaad57dc1e3b032
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609220708-ACW8QC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609220708-ACW8QC --result verified-202609220708-ACW8QC --commit 0ab4393ffc1b0b19bd0cf2832ff1d69d8f8b23a4
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
    hash: "31ab502dd07051da9f1e49745be5ac212605fa1e"
    message: "🚧 ACW8QC task: implement Writer edit window and command bindings"
id_source: "generated"
---
## Summary

Rebuild Writer browser UI boundary for P1

Implement P1.8-P1.12: add the edit-window controller boundary, make React projection-only, publish binding-backed command state, generate the complete resource graph with dispositions, and reduce Writer-specific presentation orchestration.

## Scope

- In scope: Implement P1.8-P1.12: add the edit-window controller boundary, make React projection-only, publish binding-backed command state, generate the complete resource graph with dispositions, and reduce Writer-specific presentation orchestration.
- Out of scope: unrelated refactors not required for "Rebuild Writer browser UI boundary for P1".

## Plan

1. Introduce a non-DOM Writer document-view/edit-window contract under sw/source/uibase/docvw and one browser DOM implementation.
2. Consolidate selection, beforeinput, composition, pointer, clipboard, drag/drop, and focus translation behind that controller.
3. Make Writer React components consume render-only projections and stable forwarded handlers; remove projection-ID mutations and per-render command queries.
4. Add SfxControllerItem-like binding subscriptions and generate the complete resource/disposition graph, keeping browser additions explicit.
5. Reduce presentation orchestration, update affected inventory/docs, and verify accessibility, menus, toolbar, dialogs, keyboard, IME, selection, clipboard, and command state.

## Verify Steps

1. Run focused controller, projection, bindings, presentation, and Writer component tests. Expected: React is projection-only and Writer operations work independently of React.
2. Run npm run test:coverage && npm run test:e2e. Expected: unit/integration coverage and production browser flows pass for keyboard, focus, dialogs, selection, IME, clipboard, and command enablement.
3. Run npm run check:writer-resources && npm run check:dependencies && npm run check:source-tree && npm run check:source-provenance && npm run inventory:parity. Expected: complete disposition and ownership checks pass.
4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check. Expected: static and hygiene checks pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-22T09:33:53.742Z — VERIFY — ok

By: CODER

Note: P1.8-P1.12 verified: app 365/365 and inventory 96/96 tests with 100% coverage; Playwright 11/11; generated Writer resources, dependencies, source tree, provenance, parity inventory, static build, invariants, lint, typecheck, file-size, formatting, and git diff checks pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T08:20:49.103Z, excerpt_hash=sha256:904a91636bc20588f24dad214d87bb5b02a4b4efb799845e3b5a279350b623b8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220708-ACW8QC/blueprint/resolved-snapshot.json
- old_digest: 04a5f7c5c6401a463a788e5aacb9759161c41265bb2011de5eaad57dc1e3b032
- current_digest: 04a5f7c5c6401a463a788e5aacb9759161c41265bb2011de5eaad57dc1e3b032
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609220708-ACW8QC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609220708-ACW8QC
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-22T09:34:17.598Z — VERIFY — ok

By: CODER

Note: verified-202609220708-ACW8QC
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T09:33:53.819Z, excerpt_hash=sha256:904a91636bc20588f24dad214d87bb5b02a4b4efb799845e3b5a279350b623b8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220708-ACW8QC/blueprint/resolved-snapshot.json
- old_digest: 04a5f7c5c6401a463a788e5aacb9759161c41265bb2011de5eaad57dc1e3b032
- current_digest: 04a5f7c5c6401a463a788e5aacb9759161c41265bb2011de5eaad57dc1e3b032
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609220708-ACW8QC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609220708-ACW8QC --result verified-202609220708-ACW8QC --commit 31ab502dd07051da9f1e49745be5ac212605fa1e
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-22T09:34:46.940Z — VERIFY — ok

By: CODER

Note: verified-202609220708-ACW8QC
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T09:34:17.667Z, excerpt_hash=sha256:904a91636bc20588f24dad214d87bb5b02a4b4efb799845e3b5a279350b623b8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220708-ACW8QC/blueprint/resolved-snapshot.json
- old_digest: 04a5f7c5c6401a463a788e5aacb9759161c41265bb2011de5eaad57dc1e3b032
- current_digest: 04a5f7c5c6401a463a788e5aacb9759161c41265bb2011de5eaad57dc1e3b032
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609220708-ACW8QC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609220708-ACW8QC --result verified-202609220708-ACW8QC --commit 0ab4393ffc1b0b19bd0cf2832ff1d69d8f8b23a4
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
