---
id: "202609211752-HPT0S8"
title: "Fix P2 ownership enforcement gaps"
status: "DOING"
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
  updated_at: "2026-09-21T17:53:03.701Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-21T18:03:17.734Z"
  updated_by: "CODER"
  note: "verified-202609211752-HPT0S8"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-21T18:03:04.174Z"
  updated_by: "EVALUATOR"
  note: "P2 ownership enforcement gaps are closed with generalized browser/Sfx boundaries and structured provenance schema v3; all declared checks pass."
  evaluated_sha: "4cf8d39c115dfa6b5439193d42b1285762d3fb03"
  blueprint_digest: "0840e957630f72489d83e4ef8821ab53fb73f691be577610db67901cc8e22f47"
  evidence_refs:
    - ".agentplane/tasks/202609211752-HPT0S8/README.md"
    - ".agentplane/tasks/202609211752-HPT0S8/quality/20260921-180304174-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609211752-HPT0S8/quality/20260921-180304174-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609211752-HPT0S8/quality/20260921-180304174-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609211752-HPT0S8/blueprint/resolved-snapshot.json"
    - "scripts/check-module-boundaries.test.ts"
    - "scripts/check-source-provenance.test.ts"
    - "npm run verify"
    - "node .agentplane/policy/check-routing.mjs"
  findings:
    - "Cross-module browser imports and browser presentation packages are rejected from Writer, Sfx, and upstream source layers, while every filename divergence now carries a validated stackNecessity category."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-21T17:53:15.409Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-09-21T18:02:27.073Z"
    author: "CODER"
    state: "ok"
    note: "Focused ownership/provenance tests, static gates, full npm run verify, routing validation, and Agentplane doctor all passed for the P2 follow-up scope."
  -
    type: "verify"
    at: "2026-09-21T18:02:42.712Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609211752-HPT0S8"
  -
    type: "verify"
    at: "2026-09-21T18:03:17.734Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609211752-HPT0S8"
doc_version: 3
doc_updated_at: "2026-09-21T18:03:17.786Z"
doc_updated_by: "CODER"
description: "Follow up P2 by enforcing browser and Sfx ownership across runtime modules, strengthening filename-divergence stack-necessity evidence, and adding negative tests."
sections:
  Summary: "Close the two P2-2 enforcement gaps found during review: browser/Sfx ownership coverage and auditable filename-divergence stack necessity."
  Scope: "Update scripts/check-module-boundaries.mjs and its tests to classify browser directories across runtime modules, enforce upstream-mechanism/core-to-browser prohibitions, and cover Sfx responsibility edges. Update the source-provenance filename-divergence contract, manifest records, and tests with structured stack-necessity evidence. Do not change Writer product behavior or broaden parity claims."
  Plan: "1. Generalize runtime ownership classification and add negative cases for cross-module browser imports plus Sfx boundaries. 2. Replace the phrase heuristic for filename divergences with structured necessity evidence and migrate every manifest divergence. 3. Run focused tests and static checks, then full npm run verify, routing check, and ap doctor. 4. Review the final diff, commit only task files, record verification, and close the direct task."
  Verify Steps: "1. Run npx vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts. Expected: negative fixtures reject sw core/uibase and Sfx imports of browser adapters, and malformed or convenience-only filename divergences fail. 2. Run npm run check:dependencies && npm run check:source-provenance && npm run inventory:parity. Expected: runtime ownership, exhaustive provenance, and existing inventory semantics pass. 3. Run npm run verify. Expected: all formatting, lint, typecheck, unit, inventory, e2e, static, documentation, size, source-tree, provenance, invariant, and parity gates pass. 4. Run node .agentplane/policy/check-routing.mjs && ap doctor. Expected: routing and repository health pass without new task-scoped warnings. 5. Inspect git diff and git status --short --untracked-files=all. Expected: only approved implementation, tests, provenance manifest, and Agentplane task artifacts are changed."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-21T18:02:27.073Z — VERIFY — ok

    By: CODER

    Note: Focused ownership/provenance tests, static gates, full npm run verify, routing validation, and Agentplane doctor all passed for the P2 follow-up scope.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T18:02:16.293Z, excerpt_hash=sha256:588f5e3012f5ab9ae49d14bfae002938241e8739e194719af7c565ecde89922b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211752-HPT0S8/blueprint/resolved-snapshot.json
    - old_digest: 0840e957630f72489d83e4ef8821ab53fb73f691be577610db67901cc8e22f47
    - current_digest: 0840e957630f72489d83e4ef8821ab53fb73f691be577610db67901cc8e22f47
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609211752-HPT0S8

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609211752-HPT0S8
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-21T18:02:42.712Z — VERIFY — ok

    By: CODER

    Note: verified-202609211752-HPT0S8
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T18:02:27.123Z, excerpt_hash=sha256:588f5e3012f5ab9ae49d14bfae002938241e8739e194719af7c565ecde89922b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211752-HPT0S8/blueprint/resolved-snapshot.json
    - old_digest: 0840e957630f72489d83e4ef8821ab53fb73f691be577610db67901cc8e22f47
    - current_digest: 0840e957630f72489d83e4ef8821ab53fb73f691be577610db67901cc8e22f47
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609211752-HPT0S8

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609211752-HPT0S8 --result verified-202609211752-HPT0S8 --commit 4cf8d39c115dfa6b5439193d42b1285762d3fb03
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-21T18:03:17.734Z — VERIFY — ok

    By: CODER

    Note: verified-202609211752-HPT0S8
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T18:02:42.763Z, excerpt_hash=sha256:588f5e3012f5ab9ae49d14bfae002938241e8739e194719af7c565ecde89922b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211752-HPT0S8/blueprint/resolved-snapshot.json
    - old_digest: 0840e957630f72489d83e4ef8821ab53fb73f691be577610db67901cc8e22f47
    - current_digest: 0840e957630f72489d83e4ef8821ab53fb73f691be577610db67901cc8e22f47
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609211752-HPT0S8

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609211752-HPT0S8 --result verified-202609211752-HPT0S8 --commit 4cf8d39c115dfa6b5439193d42b1285762d3fb03
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commit and task close commit; this restores the prior ownership/provenance validators and schema without touching Writer runtime behavior."
  Findings: |-
    Initial review proved current gates pass but do not reject cross-module browser imports from Writer/Sfx upstream-mechanism layers; filename-divergence validation relies on a phrase heuristic rather than structured necessity evidence.

    - Observation: The first implementation commit attempt was rejected because the subject omitted the required task scope separator.
      Impact: No source changes or verification evidence were lost; the intended files remained staged.
      Resolution: Recomputed task next-action, reread Verify Steps, and committed the same staged scope with a policy-compliant subject.

    - Observation: Ownership enforcement now rejects browser directories and presentation packages from Writer, Sfx, and general upstream source layers; provenance schema v3 requires a typed stackNecessity for every filename divergence.
      Impact: The two P2-2 review gaps are closed without changing Writer runtime behavior or parity inventory semantics.
      Resolution: Added generalized layer classification, cross-module negative tests, structured divergence categories, and migrated all existing divergence records.
id_source: "generated"
---
## Summary

Close the two P2-2 enforcement gaps found during review: browser/Sfx ownership coverage and auditable filename-divergence stack necessity.

## Scope

Update scripts/check-module-boundaries.mjs and its tests to classify browser directories across runtime modules, enforce upstream-mechanism/core-to-browser prohibitions, and cover Sfx responsibility edges. Update the source-provenance filename-divergence contract, manifest records, and tests with structured stack-necessity evidence. Do not change Writer product behavior or broaden parity claims.

## Plan

1. Generalize runtime ownership classification and add negative cases for cross-module browser imports plus Sfx boundaries. 2. Replace the phrase heuristic for filename divergences with structured necessity evidence and migrate every manifest divergence. 3. Run focused tests and static checks, then full npm run verify, routing check, and ap doctor. 4. Review the final diff, commit only task files, record verification, and close the direct task.

## Verify Steps

1. Run npx vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts. Expected: negative fixtures reject sw core/uibase and Sfx imports of browser adapters, and malformed or convenience-only filename divergences fail. 2. Run npm run check:dependencies && npm run check:source-provenance && npm run inventory:parity. Expected: runtime ownership, exhaustive provenance, and existing inventory semantics pass. 3. Run npm run verify. Expected: all formatting, lint, typecheck, unit, inventory, e2e, static, documentation, size, source-tree, provenance, invariant, and parity gates pass. 4. Run node .agentplane/policy/check-routing.mjs && ap doctor. Expected: routing and repository health pass without new task-scoped warnings. 5. Inspect git diff and git status --short --untracked-files=all. Expected: only approved implementation, tests, provenance manifest, and Agentplane task artifacts are changed.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-21T18:02:27.073Z — VERIFY — ok

By: CODER

Note: Focused ownership/provenance tests, static gates, full npm run verify, routing validation, and Agentplane doctor all passed for the P2 follow-up scope.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T18:02:16.293Z, excerpt_hash=sha256:588f5e3012f5ab9ae49d14bfae002938241e8739e194719af7c565ecde89922b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211752-HPT0S8/blueprint/resolved-snapshot.json
- old_digest: 0840e957630f72489d83e4ef8821ab53fb73f691be577610db67901cc8e22f47
- current_digest: 0840e957630f72489d83e4ef8821ab53fb73f691be577610db67901cc8e22f47
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609211752-HPT0S8

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609211752-HPT0S8
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-21T18:02:42.712Z — VERIFY — ok

By: CODER

Note: verified-202609211752-HPT0S8
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T18:02:27.123Z, excerpt_hash=sha256:588f5e3012f5ab9ae49d14bfae002938241e8739e194719af7c565ecde89922b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211752-HPT0S8/blueprint/resolved-snapshot.json
- old_digest: 0840e957630f72489d83e4ef8821ab53fb73f691be577610db67901cc8e22f47
- current_digest: 0840e957630f72489d83e4ef8821ab53fb73f691be577610db67901cc8e22f47
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609211752-HPT0S8

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609211752-HPT0S8 --result verified-202609211752-HPT0S8 --commit 4cf8d39c115dfa6b5439193d42b1285762d3fb03
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-21T18:03:17.734Z — VERIFY — ok

By: CODER

Note: verified-202609211752-HPT0S8
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T18:02:42.763Z, excerpt_hash=sha256:588f5e3012f5ab9ae49d14bfae002938241e8739e194719af7c565ecde89922b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211752-HPT0S8/blueprint/resolved-snapshot.json
- old_digest: 0840e957630f72489d83e4ef8821ab53fb73f691be577610db67901cc8e22f47
- current_digest: 0840e957630f72489d83e4ef8821ab53fb73f691be577610db67901cc8e22f47
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609211752-HPT0S8

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609211752-HPT0S8 --result verified-202609211752-HPT0S8 --commit 4cf8d39c115dfa6b5439193d42b1285762d3fb03
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commit and task close commit; this restores the prior ownership/provenance validators and schema without touching Writer runtime behavior.

## Findings

Initial review proved current gates pass but do not reject cross-module browser imports from Writer/Sfx upstream-mechanism layers; filename-divergence validation relies on a phrase heuristic rather than structured necessity evidence.

- Observation: The first implementation commit attempt was rejected because the subject omitted the required task scope separator.
  Impact: No source changes or verification evidence were lost; the intended files remained staged.
  Resolution: Recomputed task next-action, reread Verify Steps, and committed the same staged scope with a policy-compliant subject.

- Observation: Ownership enforcement now rejects browser directories and presentation packages from Writer, Sfx, and general upstream source layers; provenance schema v3 requires a typed stackNecessity for every filename divergence.
  Impact: The two P2-2 review gaps are closed without changing Writer runtime behavior or parity inventory semantics.
  Resolution: Added generalized layer classification, cross-module negative tests, structured divergence categories, and migrated all existing divergence records.
