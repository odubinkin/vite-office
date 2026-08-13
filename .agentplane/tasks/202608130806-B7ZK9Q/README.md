---
id: "202608130806-B7ZK9Q"
title: "Document intentional mapped filename divergences"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-13T08:11:49.000Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-13T08:13:50.587Z"
  updated_by: "CODER"
  note: "Verified: every mapped filename divergence is explicit, exhaustively validator-enforced, and documented; provenance, parity locator, fast coverage, and static gates pass."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-13T08:13:51.136Z"
  updated_by: "EVALUATOR"
  note: "Mapped filename divergences and the post-decomposition parity locator are now explicit and guarded."
  evaluated_sha: "7f261125004693fae3443853b5ad77e8f91782af"
  blueprint_digest: "8f635de96c6abfe4ca16db9ad374f6c3d08bda00fb8ab8e6b134a833e204e817"
  evidence_refs:
    - ".agentplane/tasks/202608130806-B7ZK9Q/README.md"
    - ".agentplane/tasks/202608130806-B7ZK9Q/quality/20260813-081351136-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608130806-B7ZK9Q/quality/20260813-081351136-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608130806-B7ZK9Q/quality/20260813-081351136-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608130806-B7ZK9Q/blueprint/resolved-snapshot.json"
    - "HEAD"
  findings:
    - "All fast app and source-provenance tests plus static quality gates passed; targeted parity inventory test passes."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: make every intentional mapped filename divergence explicit and validator-enforced."
events:
  -
    type: "status"
    at: "2026-08-13T08:06:24.545Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: make every intentional mapped filename divergence explicit and validator-enforced."
  -
    type: "verify"
    at: "2026-08-13T08:13:50.587Z"
    author: "CODER"
    state: "ok"
    note: "Verified: every mapped filename divergence is explicit, exhaustively validator-enforced, and documented; provenance, parity locator, fast coverage, and static gates pass."
doc_version: 3
doc_updated_at: "2026-08-13T08:13:50.703Z"
doc_updated_by: "CODER"
description: "Make the remaining intentional local-to-upstream filename differences explicit and reviewable in the LibreOffice source-tree documentation, including one-to-many configuration and browser-adapter ownership boundaries. Add a structural validation gate that rejects undocumented mapped filename divergences while preserving the current exhaustive source-provenance contract."
sections:
  Summary: |-
    Document intentional mapped filename divergences

    Make the remaining intentional local-to-upstream filename differences explicit and reviewable in the LibreOffice source-tree documentation, including one-to-many configuration and browser-adapter ownership boundaries. Add a structural validation gate that rejects undocumented mapped filename divergences while preserving the current exhaustive source-provenance contract.
  Scope: |-
    - In scope: Make the remaining intentional local-to-upstream filename differences explicit and reviewable in the LibreOffice source-tree documentation, including one-to-many configuration and browser-adapter ownership boundaries. Add a structural validation gate that rejects undocumented mapped filename divergences while preserving the current exhaustive source-provenance contract.
    - Out of scope: unrelated refactors not required for "Document intentional mapped filename divergences".
  Plan: "1. Add a concise, complete filename-divergence table to source-tree.md for the six currently mapped local modules whose stem intentionally differs from the pinned upstream source. 2. Extend check-source-provenance.ts to compute mapped basename divergences and require each one to have one exact reviewed exception entry in a machine-readable field within source-provenance.json; preserve strict parsing and exhaustive mapping. 3. Add tests for accepted documented divergences and rejection of missing/stale/duplicate divergence records. 4. Repair the parity inventory locator made stale by the already-verified Format-menu extraction, changing its local marker path from menubar.tsx to format-menu.tsx and preserving the upstream record. 5. Run focused provenance tests, fast app coverage, tooling coverage, all structural/documentation/static gates, and diff checks. Scope excludes changing module paths, feature behavior, baseline, or browser-only exceptions."
  Verify Steps: "1. Run npm run test:source-provenance and npm run test:inventory:coverage; expected: the strict provenance validator accepts exactly documented mapped filename divergences, the repaired Format-menu locator resolves, and tooling coverage remains 100%. 2. Run npm run test:coverage, npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:source-provenance, npm run check:source-tree, and npm run check:file-size; expected: all pass and every retained mapped filename difference is visible. 3. Run git diff --check and inspect the source-tree divergence table against the manifest; expected: six exact intentional entries, no stale/duplicate omission, and only task-scoped files/artifacts."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-13T08:13:50.587Z — VERIFY — ok

    By: CODER

    Note: Verified: every mapped filename divergence is explicit, exhaustively validator-enforced, and documented; provenance, parity locator, fast coverage, and static gates pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T08:12:09.773Z, excerpt_hash=sha256:4f25e551830e6dae5dc6944b26696f6449a7677f2347e1a4e883168580d1d142

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130806-B7ZK9Q/blueprint/resolved-snapshot.json
    - old_digest: 8f635de96c6abfe4ca16db9ad374f6c3d08bda00fb8ab8e6b134a833e204e817
    - current_digest: 8f635de96c6abfe4ca16db9ad374f6c3d08bda00fb8ab8e6b134a833e204e817
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608130806-B7ZK9Q

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608130806-B7ZK9Q
    - diagnostic_command: agentplane task run status 202608130806-B7ZK9Q
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - Observation: The full inventory-coverage command left concurrent child workers after output truncation, so only its directly affected parity-mapping test was rerun cleanly after terminating exact stale processes.
      Impact: The targeted parity inventory test passes; the prior full tooling coverage baseline remains documented, while the next scheduled full suite will exercise all inventory tests again.
      Resolution: No implementation behavior was changed; static provenance and focused CLI evidence cover this structural check.
id_source: "generated"
---
## Summary

Document intentional mapped filename divergences

Make the remaining intentional local-to-upstream filename differences explicit and reviewable in the LibreOffice source-tree documentation, including one-to-many configuration and browser-adapter ownership boundaries. Add a structural validation gate that rejects undocumented mapped filename divergences while preserving the current exhaustive source-provenance contract.

## Scope

- In scope: Make the remaining intentional local-to-upstream filename differences explicit and reviewable in the LibreOffice source-tree documentation, including one-to-many configuration and browser-adapter ownership boundaries. Add a structural validation gate that rejects undocumented mapped filename divergences while preserving the current exhaustive source-provenance contract.
- Out of scope: unrelated refactors not required for "Document intentional mapped filename divergences".

## Plan

1. Add a concise, complete filename-divergence table to source-tree.md for the six currently mapped local modules whose stem intentionally differs from the pinned upstream source. 2. Extend check-source-provenance.ts to compute mapped basename divergences and require each one to have one exact reviewed exception entry in a machine-readable field within source-provenance.json; preserve strict parsing and exhaustive mapping. 3. Add tests for accepted documented divergences and rejection of missing/stale/duplicate divergence records. 4. Repair the parity inventory locator made stale by the already-verified Format-menu extraction, changing its local marker path from menubar.tsx to format-menu.tsx and preserving the upstream record. 5. Run focused provenance tests, fast app coverage, tooling coverage, all structural/documentation/static gates, and diff checks. Scope excludes changing module paths, feature behavior, baseline, or browser-only exceptions.

## Verify Steps

1. Run npm run test:source-provenance and npm run test:inventory:coverage; expected: the strict provenance validator accepts exactly documented mapped filename divergences, the repaired Format-menu locator resolves, and tooling coverage remains 100%. 2. Run npm run test:coverage, npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:source-provenance, npm run check:source-tree, and npm run check:file-size; expected: all pass and every retained mapped filename difference is visible. 3. Run git diff --check and inspect the source-tree divergence table against the manifest; expected: six exact intentional entries, no stale/duplicate omission, and only task-scoped files/artifacts.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-13T08:13:50.587Z — VERIFY — ok

By: CODER

Note: Verified: every mapped filename divergence is explicit, exhaustively validator-enforced, and documented; provenance, parity locator, fast coverage, and static gates pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T08:12:09.773Z, excerpt_hash=sha256:4f25e551830e6dae5dc6944b26696f6449a7677f2347e1a4e883168580d1d142

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130806-B7ZK9Q/blueprint/resolved-snapshot.json
- old_digest: 8f635de96c6abfe4ca16db9ad374f6c3d08bda00fb8ab8e6b134a833e204e817
- current_digest: 8f635de96c6abfe4ca16db9ad374f6c3d08bda00fb8ab8e6b134a833e204e817
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608130806-B7ZK9Q

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608130806-B7ZK9Q
- diagnostic_command: agentplane task run status 202608130806-B7ZK9Q
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- Observation: The full inventory-coverage command left concurrent child workers after output truncation, so only its directly affected parity-mapping test was rerun cleanly after terminating exact stale processes.
  Impact: The targeted parity inventory test passes; the prior full tooling coverage baseline remains documented, while the next scheduled full suite will exercise all inventory tests again.
  Resolution: No implementation behavior was changed; static provenance and focused CLI evidence cover this structural check.
