---
id: "202609151717-Z8ZB8Z"
title: "Implement Writer upstream parity Phase 7"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
  - "parity"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T17:18:01.675Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-15T17:34:17.170Z"
  updated_by: "CODER"
  note: "verified-202609151717-Z8ZB8Z"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-15T17:34:00.032Z"
  updated_by: "EVALUATOR"
  note: "Phase 7 implementation matches the approved filter, persistence, recovery, and ODT evidence scope."
  evaluated_sha: "aa5f1c7df1784a03d09e03a1ee2ccbd076ebc52a"
  blueprint_digest: "bd9e4edb0798b69a7f11dd9b15b3ea852b723c5d6d7e63e0f44e97e26f07d521"
  evidence_refs:
    - ".agentplane/tasks/202609151717-Z8ZB8Z/README.md"
    - ".agentplane/tasks/202609151717-Z8ZB8Z/quality/20260915-173400032-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609151717-Z8ZB8Z/quality/20260915-173400032-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609151717-Z8ZB8Z/quality/20260915-173400032-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609151717-Z8ZB8Z/blueprint/resolved-snapshot.json"
    - "npm run verify"
  findings:
    - "ODT filter transport no longer carries lifecycle snapshots; browser storage is current-only and baseline-identified; recovery failure modes and pinned fixture reopen behavior are covered."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved Phase 7 filter, persistence, recovery, and bounded ODT parity scope against pinned LibreOffice evidence."
events:
  -
    type: "status"
    at: "2026-09-15T17:18:07.740Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Phase 7 filter, persistence, recovery, and bounded ODT parity scope against pinned LibreOffice evidence."
  -
    type: "verify"
    at: "2026-09-15T17:33:50.628Z"
    author: "CODER"
    state: "ok"
    note: "Verified: npm run verify passed with 321 office unit tests and 91 inventory tests at 100% coverage, 10 Playwright tests, static build, source-tree, provenance, invariant and parity checks; routing check and agentplane doctor also passed."
  -
    type: "verify"
    at: "2026-09-15T17:34:17.170Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609151717-Z8ZB8Z"
doc_version: 3
doc_updated_at: "2026-09-15T17:34:17.221Z"
doc_updated_by: "CODER"
description: "Align Writer XML filters, browser persistence, AutoRecovery ownership, and bounded ODT parity evidence with pinned LibreOffice 26.8.0.2. Reject prior persisted schemas without compatibility."
sections:
  Summary: "Implement Phase 7 of the approved upstream parity plan: bounded xmloff context ownership, external versioned Writer codecs, SfxMedium-backed browser persistence, framework-owned AutoRecovery, and broadened pinned ODT parity evidence."
  Scope: "In scope: apps/office Writer XML/package filters, xmloff contexts used by the supported slice, browser persistence codecs and IndexedDB ports, SfxObjectShell/SfxMedium recovery integration, browser recovery composition, focused tests/fixtures, and parity inventory updates required by changed modules. Preserve the pinned LibreOffice 26.8.0.2 ownership and source layout where browser/TypeScript constraints permit. Reject every prior stored schema; do not add compatibility or migrations. Exclude unrelated Writer features and non-Writer suites."
  Plan: |-
    1. Compare current filter, persistence, and recovery contracts with pinned upstream source and tests.
    2. Refactor supported XML import/export into bounded xmloff context/token ownership and remove lifecycle DTOs from filter APIs.
    3. Introduce explicit current-only storage envelopes carrying codec, model-version, and pinned baseline identifiers outside the core graph.
    4. Route primary and recovery storage through SfxMedium/object-shell contracts; harden interrupted writes, leases, corruption fallback, and newest-valid-generation selection.
    5. Align framework AutoRecovery registration, modified-state checks, recovery entry lifecycle, and completion while retaining browser timers/events in composition.
    6. Add pinned ODT fixtures and normalized package/XML plus reopen tests for the supported Writer feature slice and documented browser limits.
    7. Run targeted tests, full repository verification, routing checks, record evidence, commit only Phase 7 changes, finish the task, and push main.
  Verify Steps: |-
    1. npm run typecheck
    2. npm run test:coverage
    3. npm run test:inventory:coverage
    4. npm run test:e2e
    5. npm run verify
    6. node .agentplane/policy/check-routing.mjs
    7. ap doctor
    8. git status --short --untracked-files=all
    Acceptance: current storage envelope includes explicit codec/model/baseline identifiers and rejects all prior schemas; filters accept canonical Writer graph plus filter-owned metadata rather than lifecycle DTOs; primary and recovery paths use SfxMedium/object-shell contracts; recovery tests cover modified registration, completion, lease contention, corruption and newest-valid fallback; ODT tests cover paragraph, character, hyperlink, style, list, metadata and manifest reopen behavior.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-15T17:33:50.628Z — VERIFY — ok

    By: CODER

    Note: Verified: npm run verify passed with 321 office unit tests and 91 inventory tests at 100% coverage, 10 Playwright tests, static build, source-tree, provenance, invariant and parity checks; routing check and agentplane doctor also passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T17:18:07.740Z, excerpt_hash=sha256:c56704a3792d8bd2ff1e904b857f26332e27ed89386ddde118bf42493ca3f791

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151717-Z8ZB8Z/blueprint/resolved-snapshot.json
    - old_digest: bd9e4edb0798b69a7f11dd9b15b3ea852b723c5d6d7e63e0f44e97e26f07d521
    - current_digest: bd9e4edb0798b69a7f11dd9b15b3ea852b723c5d6d7e63e0f44e97e26f07d521
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609151717-Z8ZB8Z

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609151717-Z8ZB8Z
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T17:34:17.170Z — VERIFY — ok

    By: CODER

    Note: verified-202609151717-Z8ZB8Z
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T17:33:50.682Z, excerpt_hash=sha256:c56704a3792d8bd2ff1e904b857f26332e27ed89386ddde118bf42493ca3f791

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151717-Z8ZB8Z/blueprint/resolved-snapshot.json
    - old_digest: bd9e4edb0798b69a7f11dd9b15b3ea852b723c5d6d7e63e0f44e97e26f07d521
    - current_digest: bd9e4edb0798b69a7f11dd9b15b3ea852b723c5d6d7e63e0f44e97e26f07d521
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609151717-Z8ZB8Z

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609151717-Z8ZB8Z --result verified-202609151717-Z8ZB8Z --commit aa5f1c7df1784a03d09e03a1ee2ccbd076ebc52a
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the Phase 7 implementation commit and deterministic task-close commit. Browser copies written with the new schema may be discarded; no backward compatibility is promised. Restore only the previous filter/persistence/recovery code and tests without touching unrelated user changes."
  Findings: ""
id_source: "generated"
---
## Summary

Implement Phase 7 of the approved upstream parity plan: bounded xmloff context ownership, external versioned Writer codecs, SfxMedium-backed browser persistence, framework-owned AutoRecovery, and broadened pinned ODT parity evidence.

## Scope

In scope: apps/office Writer XML/package filters, xmloff contexts used by the supported slice, browser persistence codecs and IndexedDB ports, SfxObjectShell/SfxMedium recovery integration, browser recovery composition, focused tests/fixtures, and parity inventory updates required by changed modules. Preserve the pinned LibreOffice 26.8.0.2 ownership and source layout where browser/TypeScript constraints permit. Reject every prior stored schema; do not add compatibility or migrations. Exclude unrelated Writer features and non-Writer suites.

## Plan

1. Compare current filter, persistence, and recovery contracts with pinned upstream source and tests.
2. Refactor supported XML import/export into bounded xmloff context/token ownership and remove lifecycle DTOs from filter APIs.
3. Introduce explicit current-only storage envelopes carrying codec, model-version, and pinned baseline identifiers outside the core graph.
4. Route primary and recovery storage through SfxMedium/object-shell contracts; harden interrupted writes, leases, corruption fallback, and newest-valid-generation selection.
5. Align framework AutoRecovery registration, modified-state checks, recovery entry lifecycle, and completion while retaining browser timers/events in composition.
6. Add pinned ODT fixtures and normalized package/XML plus reopen tests for the supported Writer feature slice and documented browser limits.
7. Run targeted tests, full repository verification, routing checks, record evidence, commit only Phase 7 changes, finish the task, and push main.

## Verify Steps

1. npm run typecheck
2. npm run test:coverage
3. npm run test:inventory:coverage
4. npm run test:e2e
5. npm run verify
6. node .agentplane/policy/check-routing.mjs
7. ap doctor
8. git status --short --untracked-files=all
Acceptance: current storage envelope includes explicit codec/model/baseline identifiers and rejects all prior schemas; filters accept canonical Writer graph plus filter-owned metadata rather than lifecycle DTOs; primary and recovery paths use SfxMedium/object-shell contracts; recovery tests cover modified registration, completion, lease contention, corruption and newest-valid fallback; ODT tests cover paragraph, character, hyperlink, style, list, metadata and manifest reopen behavior.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-15T17:33:50.628Z — VERIFY — ok

By: CODER

Note: Verified: npm run verify passed with 321 office unit tests and 91 inventory tests at 100% coverage, 10 Playwright tests, static build, source-tree, provenance, invariant and parity checks; routing check and agentplane doctor also passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T17:18:07.740Z, excerpt_hash=sha256:c56704a3792d8bd2ff1e904b857f26332e27ed89386ddde118bf42493ca3f791

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151717-Z8ZB8Z/blueprint/resolved-snapshot.json
- old_digest: bd9e4edb0798b69a7f11dd9b15b3ea852b723c5d6d7e63e0f44e97e26f07d521
- current_digest: bd9e4edb0798b69a7f11dd9b15b3ea852b723c5d6d7e63e0f44e97e26f07d521
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609151717-Z8ZB8Z

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609151717-Z8ZB8Z
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T17:34:17.170Z — VERIFY — ok

By: CODER

Note: verified-202609151717-Z8ZB8Z
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T17:33:50.682Z, excerpt_hash=sha256:c56704a3792d8bd2ff1e904b857f26332e27ed89386ddde118bf42493ca3f791

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151717-Z8ZB8Z/blueprint/resolved-snapshot.json
- old_digest: bd9e4edb0798b69a7f11dd9b15b3ea852b723c5d6d7e63e0f44e97e26f07d521
- current_digest: bd9e4edb0798b69a7f11dd9b15b3ea852b723c5d6d7e63e0f44e97e26f07d521
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609151717-Z8ZB8Z

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609151717-Z8ZB8Z --result verified-202609151717-Z8ZB8Z --commit aa5f1c7df1784a03d09e03a1ee2ccbd076ebc52a
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the Phase 7 implementation commit and deterministic task-close commit. Browser copies written with the new schema may be discarded; no backward compatibility is promised. Restore only the previous filter/persistence/recovery code and tests without touching unrelated user changes.

## Findings
