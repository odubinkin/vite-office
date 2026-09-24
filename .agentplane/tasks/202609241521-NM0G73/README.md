---
id: "202609241521-NM0G73"
title: "Recognize harmless ODT declarations and style attributes"
result_summary: "Classified declaration metadata and retained semantic diagnostics."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on:
  - "202609241521-XXW124"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run source-backed ODT declaration tests and import/export checks; assert expected diagnostics without broad console suppression."
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T15:23:15.911Z"
  updated_by: "ORCHESTRATOR"
  note: "User requested implementation of the seven ordered phases in docs/program/certification-odt-import-plan.md; outside-repo sample access remains pending separate authorization."
verification:
  state: "ok"
  updated_at: "2026-09-24T16:23:21.845Z"
  updated_by: "CODER"
  note: "Classified declaration metadata and retained semantic diagnostics."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-24T16:23:08.488Z"
  updated_by: "EVALUATOR"
  note: "Upstream-aligned declaration classification is complete and verified."
  evaluated_sha: "159b4ae159dd09c07617a61f9b24399a8250e5fd"
  blueprint_digest: "d2d070347a41d772e0cd33f144be5be1e1096347b8af26e9e3d8614188b6c37f"
  evidence_refs:
    - ".agentplane/tasks/202609241521-NM0G73/README.md"
    - ".agentplane/tasks/202609241521-NM0G73/quality/20260924-162308488-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609241521-NM0G73/quality/20260924-162308488-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609241521-NM0G73/quality/20260924-162308488-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609241521-NM0G73/blueprint/resolved-snapshot.json"
    - ".agentplane/tmp/verify-phase1.log"
    - "docs/program/certification-odt-declaration-classification.md"
  findings:
    - "Harmless metadata declarations are explicitly ignored; semantic unimplemented properties retain diagnostics. Canonical import of the authorized sample is unchanged."
commit:
  hash: "159b4ae159dd09c07617a61f9b24399a8250e5fd"
  message: "🧪 NM0G73 code: classify harmless ODT declarations"
comments:
  -
    author: "CODER"
    body: "Start: recognize observed harmless ODT declarations using pinned xmloff contexts and source-backed fixtures."
  -
    author: "CODER"
    body: "Verified: full npm run verify and local sample diagnostic passed."
events:
  -
    type: "status"
    at: "2026-09-24T16:05:13.640Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: recognize observed harmless ODT declarations using pinned xmloff contexts and source-backed fixtures."
  -
    type: "verify"
    at: "2026-09-24T16:22:48.510Z"
    author: "CODER"
    state: "ok"
    note: "Full verification passed; declaration classification preserved canonical semantics and retained semantic diagnostics."
  -
    type: "verify"
    at: "2026-09-24T16:23:21.845Z"
    author: "CODER"
    state: "ok"
    note: "Classified declaration metadata and retained semantic diagnostics."
  -
    type: "status"
    at: "2026-09-24T16:23:21.983Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: full npm run verify and local sample diagnostic passed."
doc_version: 3
doc_updated_at: "2026-09-24T16:23:21.984Z"
doc_updated_by: "CODER"
description: "Phase 1: exact namespace token/context recognition and intentional metadata ignore classification, preserving invalid semantic diagnostics."
sections:
  Summary: |-
    Recognize harmless ODT declarations and style attributes

    Phase 1: exact namespace token/context recognition and intentional metadata ignore classification, preserving invalid semantic diagnostics.
  Scope: "Exact namespace token and owning-context handling for observed harmless declarations, style attributes and package entries. No semantic properties or new UI."
  Plan: |-
    1. Compare sample diagnostics with pinned `xmloff` contexts.
    2. Add precise tokens and safe ignore contexts; classify each ignored field.
    3. Keep malformed semantic values explicit and package entry validation intact.
    4. Add synthetic and pinned upstream declaration tests.
  Verify Steps: |-
    1. `npm run verify` passes.
    2. New declaration tests and `npx vitest run scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts` pass.
    3. Re-run the phase 0 diagnostic command and record warning-count deltas and unchanged canonical semantics.
    4. Every ignored field has an upstream source and tested harmless classification; malformed values remain errors/diagnostics.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T16:22:48.510Z — VERIFY — ok

    By: CODER

    Note: Full verification passed; declaration classification preserved canonical semantics and retained semantic diagnostics.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T16:22:41.174Z, excerpt_hash=sha256:f0df7c1dc2c1b127fb6ce9efc5f4486ab5b4fe891b0d8d331a4592c21472d5aa

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241521-NM0G73/blueprint/resolved-snapshot.json
    - old_digest: d2d070347a41d772e0cd33f144be5be1e1096347b8af26e9e3d8614188b6c37f
    - current_digest: d2d070347a41d772e0cd33f144be5be1e1096347b8af26e9e3d8614188b6c37f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241521-NM0G73

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609241521-NM0G73
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-09-24T16:23:21.845Z — VERIFY — ok

    By: CODER

    Note: Classified declaration metadata and retained semantic diagnostics.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T16:22:48.582Z, excerpt_hash=sha256:f0df7c1dc2c1b127fb6ce9efc5f4486ab5b4fe891b0d8d331a4592c21472d5aa

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241521-NM0G73/blueprint/resolved-snapshot.json
    - old_digest: d2d070347a41d772e0cd33f144be5be1e1096347b8af26e9e3d8614188b6c37f
    - current_digest: d2d070347a41d772e0cd33f144be5be1e1096347b8af26e9e3d8614188b6c37f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241521-NM0G73

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609241521-NM0G73 --result verified-202609241521-NM0G73 --commit 0cc664e91751fa9c0cfd13953059eac45f3d4f5f
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
  Findings: "Verification: npm run verify passed. App Vitest: 495 tests, 100% coverage; inventory Vitest: 107 tests, 100% coverage; Playwright: 14 tests. Focused declaration/roundtrip/diagnostic tests: 20 passed; inventory fixture/diagnostic tests: 15 passed. Authorized private ODT local diagnostic only: warning occurrences 490 to 445, grouped warnings 184 to 173, canonical model and XML projection unchanged. Semantic unsupported properties remain explicit diagnostics. Private ODT is not a tracked test fixture."
id_source: "generated"
---
## Summary

Recognize harmless ODT declarations and style attributes

Phase 1: exact namespace token/context recognition and intentional metadata ignore classification, preserving invalid semantic diagnostics.

## Scope

Exact namespace token and owning-context handling for observed harmless declarations, style attributes and package entries. No semantic properties or new UI.

## Plan

1. Compare sample diagnostics with pinned `xmloff` contexts.
2. Add precise tokens and safe ignore contexts; classify each ignored field.
3. Keep malformed semantic values explicit and package entry validation intact.
4. Add synthetic and pinned upstream declaration tests.

## Verify Steps

1. `npm run verify` passes.
2. New declaration tests and `npx vitest run scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts` pass.
3. Re-run the phase 0 diagnostic command and record warning-count deltas and unchanged canonical semantics.
4. Every ignored field has an upstream source and tested harmless classification; malformed values remain errors/diagnostics.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T16:22:48.510Z — VERIFY — ok

By: CODER

Note: Full verification passed; declaration classification preserved canonical semantics and retained semantic diagnostics.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T16:22:41.174Z, excerpt_hash=sha256:f0df7c1dc2c1b127fb6ce9efc5f4486ab5b4fe891b0d8d331a4592c21472d5aa

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241521-NM0G73/blueprint/resolved-snapshot.json
- old_digest: d2d070347a41d772e0cd33f144be5be1e1096347b8af26e9e3d8614188b6c37f
- current_digest: d2d070347a41d772e0cd33f144be5be1e1096347b8af26e9e3d8614188b6c37f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241521-NM0G73

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609241521-NM0G73
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-09-24T16:23:21.845Z — VERIFY — ok

By: CODER

Note: Classified declaration metadata and retained semantic diagnostics.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T16:22:48.582Z, excerpt_hash=sha256:f0df7c1dc2c1b127fb6ce9efc5f4486ab5b4fe891b0d8d331a4592c21472d5aa

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241521-NM0G73/blueprint/resolved-snapshot.json
- old_digest: d2d070347a41d772e0cd33f144be5be1e1096347b8af26e9e3d8614188b6c37f
- current_digest: d2d070347a41d772e0cd33f144be5be1e1096347b8af26e9e3d8614188b6c37f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241521-NM0G73

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609241521-NM0G73 --result verified-202609241521-NM0G73 --commit 0cc664e91751fa9c0cfd13953059eac45f3d4f5f
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

Verification: npm run verify passed. App Vitest: 495 tests, 100% coverage; inventory Vitest: 107 tests, 100% coverage; Playwright: 14 tests. Focused declaration/roundtrip/diagnostic tests: 20 passed; inventory fixture/diagnostic tests: 15 passed. Authorized private ODT local diagnostic only: warning occurrences 490 to 445, grouped warnings 184 to 173, canonical model and XML projection unchanged. Semantic unsupported properties remain explicit diagnostics. Private ODT is not a tracked test fixture.
