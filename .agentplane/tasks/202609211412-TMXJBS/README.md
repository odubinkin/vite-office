---
id: "202609211412-TMXJBS"
title: "Fix formatted typing undo grouping"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-21T14:12:33.106Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-21T14:16:33.057Z"
  updated_by: "CODER"
  note: "Command: npx vitest run src/sw/source/uibase/wrtsh/wrtsh.test.ts; npm run verify; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Result: pass. Evidence: focused 17/17; full 350 office and 95 inventory tests at 100% coverage, 11 E2E, all build/static/architecture/provenance/invariant/parity checks pass; routing OK; doctor OK with one pre-existing historical-task warning; diff check clean. Scope: SwUndoInsert formatted hint grouping and SwWrtShell undo/redo regression."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-21T14:16:53.832Z"
  updated_by: "EVALUATOR"
  note: "Formatted Writer typing now groups native hints without cyclic serialization and retains correct undo/redo behavior."
  evaluated_sha: "05857819ade66d6a02369a618c680b2aebfe74be"
  blueprint_digest: "07846ca0c1d2954cbf9f1d0a8bbd673e4f84e718a66e786ed2795ba7eb5e946c"
  evidence_refs:
    - ".agentplane/tasks/202609211412-TMXJBS/README.md"
    - ".agentplane/tasks/202609211412-TMXJBS/quality/20260921-141653832-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609211412-TMXJBS/quality/20260921-141653832-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609211412-TMXJBS/quality/20260921-141653832-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609211412-TMXJBS/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/source/core/undo/unins.ts"
    - "apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts"
  findings:
    - "SwUndoInsert uses SwpHints.equals for structural native hint comparison; focused regression and full repository verification pass."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-21T14:12:44.614Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-09-21T14:16:33.057Z"
    author: "CODER"
    state: "ok"
    note: "Command: npx vitest run src/sw/source/uibase/wrtsh/wrtsh.test.ts; npm run verify; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Result: pass. Evidence: focused 17/17; full 350 office and 95 inventory tests at 100% coverage, 11 E2E, all build/static/architecture/provenance/invariant/parity checks pass; routing OK; doctor OK with one pre-existing historical-task warning; diff check clean. Scope: SwUndoInsert formatted hint grouping and SwWrtShell undo/redo regression."
doc_version: 3
doc_updated_at: "2026-09-21T14:16:33.136Z"
doc_updated_by: "CODER"
description: "Replace cyclic JSON hint comparison in SwUndoInsert grouping, add regression coverage for consecutive formatted typing and undo consistency, and run the repository verification contract."
sections:
  Summary: |-
    Fix formatted typing undo grouping

    Replace cyclic JSON hint comparison in SwUndoInsert grouping, add regression coverage for consecutive formatted typing and undo consistency, and run the repository verification contract.
  Scope: |-
    - In scope: Replace cyclic JSON hint comparison in SwUndoInsert grouping, add regression coverage for consecutive formatted typing and undo consistency, and run the repository verification contract.
    - Out of scope: unrelated refactors not required for "Fix formatted typing undo grouping".
  Plan: "1. Replace JSON serialization in SwUndoInsert boundary-hint comparison with canonical structural equality. 2. Add a regression test for consecutive formatted typing, grouped undo, and redo. 3. Run focused unit coverage, full npm run verify, policy routing, AgentPlane doctor, and final diff/status checks."
  Verify Steps: |-
    1. Run the focused SwWrtShell test file; consecutive formatted typing must not throw, must form one undo action, and Undo/Redo must restore exact text and formatting.
    2. Run npm run verify; formatting, lint, typecheck, architecture checks, unit/inventory coverage, E2E, builds, docs, source provenance, invariants, and parity checks must pass.
    3. Run node .agentplane/policy/check-routing.mjs and ap doctor; repository policy and AgentPlane health must pass.
    4. Inspect git diff --check and git status --short --untracked-files=all; only intentional implementation, test, and task artifacts may remain.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-21T14:16:33.057Z — VERIFY — ok

    By: CODER

    Note: Command: npx vitest run src/sw/source/uibase/wrtsh/wrtsh.test.ts; npm run verify; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Result: pass. Evidence: focused 17/17; full 350 office and 95 inventory tests at 100% coverage, 11 E2E, all build/static/architecture/provenance/invariant/parity checks pass; routing OK; doctor OK with one pre-existing historical-task warning; diff check clean. Scope: SwUndoInsert formatted hint grouping and SwWrtShell undo/redo regression.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T14:12:44.614Z, excerpt_hash=sha256:af280dd9404baf417213aca5effb476b237227d1311845c3966c032a011eb22c

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211412-TMXJBS/blueprint/resolved-snapshot.json
    - old_digest: 07846ca0c1d2954cbf9f1d0a8bbd673e4f84e718a66e786ed2795ba7eb5e946c
    - current_digest: 07846ca0c1d2954cbf9f1d0a8bbd673e4f84e718a66e786ed2795ba7eb5e946c
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609211412-TMXJBS

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202609211412-TMXJBS -m 🧩 TMXJBS task: persist canonical task artifacts --allow-tasks
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

Fix formatted typing undo grouping

Replace cyclic JSON hint comparison in SwUndoInsert grouping, add regression coverage for consecutive formatted typing and undo consistency, and run the repository verification contract.

## Scope

- In scope: Replace cyclic JSON hint comparison in SwUndoInsert grouping, add regression coverage for consecutive formatted typing and undo consistency, and run the repository verification contract.
- Out of scope: unrelated refactors not required for "Fix formatted typing undo grouping".

## Plan

1. Replace JSON serialization in SwUndoInsert boundary-hint comparison with canonical structural equality. 2. Add a regression test for consecutive formatted typing, grouped undo, and redo. 3. Run focused unit coverage, full npm run verify, policy routing, AgentPlane doctor, and final diff/status checks.

## Verify Steps

1. Run the focused SwWrtShell test file; consecutive formatted typing must not throw, must form one undo action, and Undo/Redo must restore exact text and formatting.
2. Run npm run verify; formatting, lint, typecheck, architecture checks, unit/inventory coverage, E2E, builds, docs, source provenance, invariants, and parity checks must pass.
3. Run node .agentplane/policy/check-routing.mjs and ap doctor; repository policy and AgentPlane health must pass.
4. Inspect git diff --check and git status --short --untracked-files=all; only intentional implementation, test, and task artifacts may remain.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-21T14:16:33.057Z — VERIFY — ok

By: CODER

Note: Command: npx vitest run src/sw/source/uibase/wrtsh/wrtsh.test.ts; npm run verify; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Result: pass. Evidence: focused 17/17; full 350 office and 95 inventory tests at 100% coverage, 11 E2E, all build/static/architecture/provenance/invariant/parity checks pass; routing OK; doctor OK with one pre-existing historical-task warning; diff check clean. Scope: SwUndoInsert formatted hint grouping and SwWrtShell undo/redo regression.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T14:12:44.614Z, excerpt_hash=sha256:af280dd9404baf417213aca5effb476b237227d1311845c3966c032a011eb22c

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211412-TMXJBS/blueprint/resolved-snapshot.json
- old_digest: 07846ca0c1d2954cbf9f1d0a8bbd673e4f84e718a66e786ed2795ba7eb5e946c
- current_digest: 07846ca0c1d2954cbf9f1d0a8bbd673e4f84e718a66e786ed2795ba7eb5e946c
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609211412-TMXJBS

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202609211412-TMXJBS -m 🧩 TMXJBS task: persist canonical task artifacts --allow-tasks
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
