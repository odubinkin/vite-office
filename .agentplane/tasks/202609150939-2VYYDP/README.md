---
id: "202609150939-2VYYDP"
title: "Phase 0.1 exact upstream invariant manifest"
result_summary: "Implemented Phase 0.1 exact invariant manifest and persistence compatibility gate."
status: "DONE"
priority: "high"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "parity"
task_kind: "code"
mutation_scope: "code"
verify:
  - "npm run inventory:parity"
  - "npm run test:coverage --workspace @vite-office/office"
  - "npm run test:inventory:coverage"
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T09:40:34.939Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-15T09:49:28.804Z"
  updated_by: "CODER"
  note: "P0.1 invariant generation, corrected WhichIds, model/snapshot schema rejection, inventory coverage, office coverage, and parity validation all pass."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-15T09:50:03.656Z"
  updated_by: "EVALUATOR"
  note: "P0.1 invariants and incompatible persistence rejection satisfy the approved acceptance contract."
  evaluated_sha: "d600a28dd584da5a255cc5e05f67acca42f73f46"
  blueprint_digest: "0cf005cd44c7d09a93fa65184380c5e1a2a2736d6c0bdbd224963a4a1a385072"
  evidence_refs:
    - ".agentplane/tasks/202609150939-2VYYDP/README.md"
    - ".agentplane/tasks/202609150939-2VYYDP/quality/20260915-095003656-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609150939-2VYYDP/quality/20260915-095003656-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609150939-2VYYDP/quality/20260915-095003656-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609150939-2VYYDP/blueprint/resolved-snapshot.json"
    - "docs/program/parity/upstream-invariants.json"
  findings:
    - "Exact pinned markers, corrected 7/22 IDs, model v6 and snapshot schema v2 are covered by 100% inventory and office tests."
commit:
  hash: "d600a28dd584da5a255cc5e05f67acca42f73f46"
  message: "🚧 2VYYDP task: implement pinned Writer invariant gate"
comments:
  -
    author: "CODER"
    body: "Start: implement exact upstream invariant manifest, corrected WhichIds, and incompatible persistence rejection for Phase 0.1."
  -
    author: "CODER"
    body: "Verified: 34 pinned invariants, corrected WhichIds, schema rejection, inventory coverage, office coverage, and parity validation all pass."
events:
  -
    type: "status"
    at: "2026-09-15T09:40:53.250Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement exact upstream invariant manifest, corrected WhichIds, and incompatible persistence rejection for Phase 0.1."
  -
    type: "verify"
    at: "2026-09-15T09:49:28.804Z"
    author: "CODER"
    state: "ok"
    note: "P0.1 invariant generation, corrected WhichIds, model/snapshot schema rejection, inventory coverage, office coverage, and parity validation all pass."
  -
    type: "status"
    at: "2026-09-15T09:50:21.875Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: 34 pinned invariants, corrected WhichIds, schema rejection, inventory coverage, office coverage, and parity validation all pass."
doc_version: 3
doc_updated_at: "2026-09-15T09:50:21.877Z"
doc_updated_by: "CODER"
description: "Generate and enforce pinned Writer/editeng/svl invariants, correct character WhichIds, and reject incompatible browser persistence records."
sections:
  Summary: "Implement P0.1 from docs/program/vite-office-upstream-parity-plan.md: make pinned upstream invariants machine-checkable, correct used Writer character WhichIds, and invalidate incompatible persisted snapshots."
  Scope: "In scope: invariant generation/validation tooling and fixtures; used Writer/editeng/svl constants and defaults; local mappings/tests; browser persistence schema validation and recovery diagnostics affected by corrected IDs. Out of scope: Phase 1 dispatch/item architecture and unrelated Writer behavior."
  Plan: |-
    1. Inventory every invariant currently consumed by the implemented Writer slice and resolve it against the pinned LibreOffice checkout.
    2. Add a deterministic checked-in manifest and generator/validator with focused tests.
    3. Correct RES_CHRATR_FONT and RES_CHRATR_CJK_FONT plus all affected mappings and snapshots.
    4. Bump affected persistence formats and reject incompatible records with an explicit recovery diagnostic.
    5. Run focused inventory and office tests, then record evidence.
  Verify Steps: |-
    1. Run the invariant generator/check command in check mode; expect the checked-in manifest to match the pinned LibreOffice checkout.
    2. Run focused invariant tests; expect mutation of any used value to be rejected and WhichIds 7/22 to be asserted from the manifest rather than duplicated snapshots.
    3. Run focused persistence tests; expect obsolete records to be rejected with a recovery diagnostic.
    4. Run npm run test:inventory:coverage.
    5. Run npm run test:coverage --workspace @vite-office/office.
    6. Run npm run inventory:parity.
  Verification: |-
    Command: npm run inventory:invariants. Result: pass. Evidence: 34 exact pinned invariants valid. Scope: generated manifest and local/upstream markers.

    Command: npm run test:inventory:coverage. Result: pass. Evidence: 33 files, 87 tests, 100% statements/branches/functions/lines. Scope: inventory tooling including invariant drift diagnostics.

    Command: npm run test:coverage --workspace @vite-office/office. Result: pass. Evidence: 60 files, 296 tests, 100% coverage. Scope: Writer model, persistence, mappings, and UI behavior.

    Command: npm run inventory:parity. Result: pass. Evidence: 35 records resolved against baseline 9bc445578031fecf56086729d8e4940c77e14d65. Scope: current parity mappings and runtime inventory.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-15T09:49:28.804Z — VERIFY — ok

    By: CODER

    Note: P0.1 invariant generation, corrected WhichIds, model/snapshot schema rejection, inventory coverage, office coverage, and parity validation all pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T09:49:28.434Z, excerpt_hash=sha256:67e6bb62f8624789bcd8ec60b93590bce275ea2786d64c206845234cdd93d0c8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150939-2VYYDP/blueprint/resolved-snapshot.json
    - old_digest: 0cf005cd44c7d09a93fa65184380c5e1a2a2736d6c0bdbd224963a4a1a385072
    - current_digest: 0cf005cd44c7d09a93fa65184380c5e1a2a2736d6c0bdbd224963a4a1a385072
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150939-2VYYDP

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609150939-2VYYDP
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task commit, restoring the prior generated artifacts, constants, mappings, and persistence schema. No compatibility shim will be retained for incorrect IDs."
  Findings: "None yet."
id_source: "generated"
---
## Summary

Implement P0.1 from docs/program/vite-office-upstream-parity-plan.md: make pinned upstream invariants machine-checkable, correct used Writer character WhichIds, and invalidate incompatible persisted snapshots.

## Scope

In scope: invariant generation/validation tooling and fixtures; used Writer/editeng/svl constants and defaults; local mappings/tests; browser persistence schema validation and recovery diagnostics affected by corrected IDs. Out of scope: Phase 1 dispatch/item architecture and unrelated Writer behavior.

## Plan

1. Inventory every invariant currently consumed by the implemented Writer slice and resolve it against the pinned LibreOffice checkout.
2. Add a deterministic checked-in manifest and generator/validator with focused tests.
3. Correct RES_CHRATR_FONT and RES_CHRATR_CJK_FONT plus all affected mappings and snapshots.
4. Bump affected persistence formats and reject incompatible records with an explicit recovery diagnostic.
5. Run focused inventory and office tests, then record evidence.

## Verify Steps

1. Run the invariant generator/check command in check mode; expect the checked-in manifest to match the pinned LibreOffice checkout.
2. Run focused invariant tests; expect mutation of any used value to be rejected and WhichIds 7/22 to be asserted from the manifest rather than duplicated snapshots.
3. Run focused persistence tests; expect obsolete records to be rejected with a recovery diagnostic.
4. Run npm run test:inventory:coverage.
5. Run npm run test:coverage --workspace @vite-office/office.
6. Run npm run inventory:parity.

## Verification

Command: npm run inventory:invariants. Result: pass. Evidence: 34 exact pinned invariants valid. Scope: generated manifest and local/upstream markers.

Command: npm run test:inventory:coverage. Result: pass. Evidence: 33 files, 87 tests, 100% statements/branches/functions/lines. Scope: inventory tooling including invariant drift diagnostics.

Command: npm run test:coverage --workspace @vite-office/office. Result: pass. Evidence: 60 files, 296 tests, 100% coverage. Scope: Writer model, persistence, mappings, and UI behavior.

Command: npm run inventory:parity. Result: pass. Evidence: 35 records resolved against baseline 9bc445578031fecf56086729d8e4940c77e14d65. Scope: current parity mappings and runtime inventory.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-15T09:49:28.804Z — VERIFY — ok

By: CODER

Note: P0.1 invariant generation, corrected WhichIds, model/snapshot schema rejection, inventory coverage, office coverage, and parity validation all pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T09:49:28.434Z, excerpt_hash=sha256:67e6bb62f8624789bcd8ec60b93590bce275ea2786d64c206845234cdd93d0c8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150939-2VYYDP/blueprint/resolved-snapshot.json
- old_digest: 0cf005cd44c7d09a93fa65184380c5e1a2a2736d6c0bdbd224963a4a1a385072
- current_digest: 0cf005cd44c7d09a93fa65184380c5e1a2a2736d6c0bdbd224963a4a1a385072
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150939-2VYYDP

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609150939-2VYYDP
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task commit, restoring the prior generated artifacts, constants, mappings, and persistence schema. No compatibility shim will be retained for incorrect IDs.

## Findings

None yet.
