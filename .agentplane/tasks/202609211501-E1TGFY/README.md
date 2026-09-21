---
id: "202609211501-E1TGFY"
title: "Close Writer P1 upstream parity gaps"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-21T15:02:19.616Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-21T15:30:39.370Z"
  updated_by: "CODER"
  note: "verified-202609211501-E1TGFY"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-21T15:30:27.957Z"
  updated_by: "EVALUATOR"
  note: "Writer P1 remediation follows the pinned upstream ownership boundaries and passes the complete verification contract."
  evaluated_sha: "c3a0aa6af3798b91bc3697f53fafaab398852a8e"
  blueprint_digest: "7e504fa92e780088f7ef2348919b59b8e3f4d29b81bb93a326836dda19d3483f"
  evidence_refs:
    - ".agentplane/tasks/202609211501-E1TGFY/README.md"
    - ".agentplane/tasks/202609211501-E1TGFY/quality/20260921-153027957-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609211501-E1TGFY/quality/20260921-153027957-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609211501-E1TGFY/quality/20260921-153027957-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609211501-E1TGFY/blueprint/resolved-snapshot.json"
    - "npm run verify"
  findings:
    - "Document operations are document-bound; shell registration is split by text/view/list ownership; worker and durable DTOs are independent; ODT claims are atomic and conservatively unverified where upstream evidence is incomplete."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement the approved Writer P1 gap remediation in the current direct-mode checkout with upstream ownership and canonical mutation boundaries."
events:
  -
    type: "status"
    at: "2026-09-21T15:02:26.586Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved Writer P1 gap remediation in the current direct-mode checkout with upstream ownership and canonical mutation boundaries."
  -
    type: "verify"
    at: "2026-09-21T15:30:12.439Z"
    author: "CODER"
    state: "ok"
    note: "Full repository verification passed: 353 office tests and 95 inventory tests at 100% coverage, 11 E2E tests, builds, lint, typecheck, architecture, provenance, policy routing, and doctor."
  -
    type: "verify"
    at: "2026-09-21T15:30:21.957Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609211501-E1TGFY"
  -
    type: "verify"
    at: "2026-09-21T15:30:39.370Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609211501-E1TGFY"
doc_version: 3
doc_updated_at: "2026-09-21T15:30:39.458Z"
doc_updated_by: "CODER"
description: "Correct the reviewed P1-1, P1-2, P1-5, and P1-6 gaps: document-bound canonical mutations and import, upstream-responsibility shell decomposition, independent storage and worker DTOs, and atomic ODT parity evidence."
sections:
  Summary: "Close the independently reviewed Writer P1 parity gaps while preserving the bounded browser feature set and pinned LibreOffice ownership model."
  Scope: "Bind IDocumentContentOperations to its owning SwDoc; route supported content/attribute/import reconstruction through canonical operations; split Writer text/view/list command registration and shell responsibilities; separate durable storage records from worker-transfer DTOs; replace broad ODT parity claims with atomic stream/property records and executable evidence. No new Writer feature families, network access, or persisted-schema backward compatibility."
  Plan: "1. Add document ownership and upstream-shaped content/attribute/import methods with cross-document guards and tests. 2. Move text and view command registries out of writercommands and extract shell operation helpers by upstream responsibility. 3. Define independent durable and worker DTOs and reconstruct through canonical operations. 4. Atomize ODT capability records and add contradiction/evidence tests. 5. Run targeted tests, full verification, policy routing, and doctor."
  Verify Steps: "1. Run targeted Vitest suites for DocumentContentOperationsManager, Writer shell registries, storage/worker codecs, ODT round trips, and parity mappings. 2. Run npm run verify. 3. Run node .agentplane/policy/check-routing.mjs. 4. Run ap doctor. 5. Confirm git status --short --untracked-files=all contains only intentional task artifacts and implementation changes."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-21T15:30:12.439Z — VERIFY — ok

    By: CODER

    Note: Full repository verification passed: 353 office tests and 95 inventory tests at 100% coverage, 11 E2E tests, builds, lint, typecheck, architecture, provenance, policy routing, and doctor.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T15:30:06.011Z, excerpt_hash=sha256:7ba7a1a702ae75f2903b5745e0f6934bc8d9e65a36406bcf1b8a762023f0a8af

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211501-E1TGFY/blueprint/resolved-snapshot.json
    - old_digest: 7e504fa92e780088f7ef2348919b59b8e3f4d29b81bb93a326836dda19d3483f
    - current_digest: 7e504fa92e780088f7ef2348919b59b8e3f4d29b81bb93a326836dda19d3483f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609211501-E1TGFY

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609211501-E1TGFY
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-21T15:30:21.957Z — VERIFY — ok

    By: CODER

    Note: verified-202609211501-E1TGFY
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T15:30:12.513Z, excerpt_hash=sha256:7ba7a1a702ae75f2903b5745e0f6934bc8d9e65a36406bcf1b8a762023f0a8af

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211501-E1TGFY/blueprint/resolved-snapshot.json
    - old_digest: 7e504fa92e780088f7ef2348919b59b8e3f4d29b81bb93a326836dda19d3483f
    - current_digest: 7e504fa92e780088f7ef2348919b59b8e3f4d29b81bb93a326836dda19d3483f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609211501-E1TGFY

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609211501-E1TGFY --result verified-202609211501-E1TGFY --commit c3a0aa6af3798b91bc3697f53fafaab398852a8e
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-21T15:30:39.370Z — VERIFY — ok

    By: CODER

    Note: verified-202609211501-E1TGFY
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T15:30:22.034Z, excerpt_hash=sha256:7ba7a1a702ae75f2903b5745e0f6934bc8d9e65a36406bcf1b8a762023f0a8af

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211501-E1TGFY/blueprint/resolved-snapshot.json
    - old_digest: 7e504fa92e780088f7ef2348919b59b8e3f4d29b81bb93a326836dda19d3483f
    - current_digest: 7e504fa92e780088f7ef2348919b59b8e3f4d29b81bb93a326836dda19d3483f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609211501-E1TGFY

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609211501-E1TGFY --result verified-202609211501-E1TGFY --commit c3a0aa6af3798b91bc3697f53fafaab398852a8e
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only commits attributed to task 202609211501-E1TGFY; this restores the prior P1 implementation and its schema/evidence records together."
  Findings: |-
    Command: npx vitest run src/sw/source/core/doc/writer-model.test.ts src/sw/source/core/undo/undobj.test.ts src/sw/source/filter/xml/odt-filter-service.test.ts src/sw/source/filter/xml/odt-roundtrip.test.ts src/sw/source/uibase/wrtsh/wrtsh.test.ts
    Result: pass
    Evidence: 5 files, 58 tests passed after the document-operation, undo, worker-transfer, ODT, and shell changes.
    Scope: canonical mutations, undo split/join, worker DTO, ODT round trip, and editing shell behavior.

    Command: npm run inventory:parity
    Result: pass
    Evidence: 44 implemented records, 32 verified records, 12 explicit unresolved atomic ODT parity gaps, zero exceptions and zero unclassified divergences.
    Scope: Writer parity mapping, runtime inventory, local/upstream markers, and semantic ownership.

    Command: npm run verify
    Result: pass
    Evidence: 353 office tests and 95 inventory tests passed with 100% coverage; 11 Playwright E2E tests passed; production/static builds, lint, typecheck, dependencies, docs, source tree, provenance, invariants, and parity checks passed.
    Scope: complete repository verification contract.

    Command: node .agentplane/policy/check-routing.mjs
    Result: pass
    Evidence: policy routing OK.
    Scope: AgentPlane routing policy.

    Command: ap doctor
    Result: pass
    Evidence: doctor OK; one pre-existing DONE-task commit warning and informational fallback-hook notice are unrelated to this task.
    Scope: workspace and workflow health.

    Command: git status --short --untracked-files=all
    Result: pass
    Evidence: before implementation commit, only the 16 intentional task implementation, test, parity, provenance, and documentation paths were modified; task artifacts were persisted separately.
    Scope: final change-set hygiene.
id_source: "generated"
---
## Summary

Close the independently reviewed Writer P1 parity gaps while preserving the bounded browser feature set and pinned LibreOffice ownership model.

## Scope

Bind IDocumentContentOperations to its owning SwDoc; route supported content/attribute/import reconstruction through canonical operations; split Writer text/view/list command registration and shell responsibilities; separate durable storage records from worker-transfer DTOs; replace broad ODT parity claims with atomic stream/property records and executable evidence. No new Writer feature families, network access, or persisted-schema backward compatibility.

## Plan

1. Add document ownership and upstream-shaped content/attribute/import methods with cross-document guards and tests. 2. Move text and view command registries out of writercommands and extract shell operation helpers by upstream responsibility. 3. Define independent durable and worker DTOs and reconstruct through canonical operations. 4. Atomize ODT capability records and add contradiction/evidence tests. 5. Run targeted tests, full verification, policy routing, and doctor.

## Verify Steps

1. Run targeted Vitest suites for DocumentContentOperationsManager, Writer shell registries, storage/worker codecs, ODT round trips, and parity mappings. 2. Run npm run verify. 3. Run node .agentplane/policy/check-routing.mjs. 4. Run ap doctor. 5. Confirm git status --short --untracked-files=all contains only intentional task artifacts and implementation changes.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-21T15:30:12.439Z — VERIFY — ok

By: CODER

Note: Full repository verification passed: 353 office tests and 95 inventory tests at 100% coverage, 11 E2E tests, builds, lint, typecheck, architecture, provenance, policy routing, and doctor.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T15:30:06.011Z, excerpt_hash=sha256:7ba7a1a702ae75f2903b5745e0f6934bc8d9e65a36406bcf1b8a762023f0a8af

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211501-E1TGFY/blueprint/resolved-snapshot.json
- old_digest: 7e504fa92e780088f7ef2348919b59b8e3f4d29b81bb93a326836dda19d3483f
- current_digest: 7e504fa92e780088f7ef2348919b59b8e3f4d29b81bb93a326836dda19d3483f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609211501-E1TGFY

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609211501-E1TGFY
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-21T15:30:21.957Z — VERIFY — ok

By: CODER

Note: verified-202609211501-E1TGFY
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T15:30:12.513Z, excerpt_hash=sha256:7ba7a1a702ae75f2903b5745e0f6934bc8d9e65a36406bcf1b8a762023f0a8af

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211501-E1TGFY/blueprint/resolved-snapshot.json
- old_digest: 7e504fa92e780088f7ef2348919b59b8e3f4d29b81bb93a326836dda19d3483f
- current_digest: 7e504fa92e780088f7ef2348919b59b8e3f4d29b81bb93a326836dda19d3483f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609211501-E1TGFY

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609211501-E1TGFY --result verified-202609211501-E1TGFY --commit c3a0aa6af3798b91bc3697f53fafaab398852a8e
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-21T15:30:39.370Z — VERIFY — ok

By: CODER

Note: verified-202609211501-E1TGFY
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T15:30:22.034Z, excerpt_hash=sha256:7ba7a1a702ae75f2903b5745e0f6934bc8d9e65a36406bcf1b8a762023f0a8af

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211501-E1TGFY/blueprint/resolved-snapshot.json
- old_digest: 7e504fa92e780088f7ef2348919b59b8e3f4d29b81bb93a326836dda19d3483f
- current_digest: 7e504fa92e780088f7ef2348919b59b8e3f4d29b81bb93a326836dda19d3483f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609211501-E1TGFY

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609211501-E1TGFY --result verified-202609211501-E1TGFY --commit c3a0aa6af3798b91bc3697f53fafaab398852a8e
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only commits attributed to task 202609211501-E1TGFY; this restores the prior P1 implementation and its schema/evidence records together.

## Findings

Command: npx vitest run src/sw/source/core/doc/writer-model.test.ts src/sw/source/core/undo/undobj.test.ts src/sw/source/filter/xml/odt-filter-service.test.ts src/sw/source/filter/xml/odt-roundtrip.test.ts src/sw/source/uibase/wrtsh/wrtsh.test.ts
Result: pass
Evidence: 5 files, 58 tests passed after the document-operation, undo, worker-transfer, ODT, and shell changes.
Scope: canonical mutations, undo split/join, worker DTO, ODT round trip, and editing shell behavior.

Command: npm run inventory:parity
Result: pass
Evidence: 44 implemented records, 32 verified records, 12 explicit unresolved atomic ODT parity gaps, zero exceptions and zero unclassified divergences.
Scope: Writer parity mapping, runtime inventory, local/upstream markers, and semantic ownership.

Command: npm run verify
Result: pass
Evidence: 353 office tests and 95 inventory tests passed with 100% coverage; 11 Playwright E2E tests passed; production/static builds, lint, typecheck, dependencies, docs, source tree, provenance, invariants, and parity checks passed.
Scope: complete repository verification contract.

Command: node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: policy routing OK.
Scope: AgentPlane routing policy.

Command: ap doctor
Result: pass
Evidence: doctor OK; one pre-existing DONE-task commit warning and informational fallback-hook notice are unrelated to this task.
Scope: workspace and workflow health.

Command: git status --short --untracked-files=all
Result: pass
Evidence: before implementation commit, only the 16 intentional task implementation, test, parity, provenance, and documentation paths were modified; task artifacts were persisted separately.
Scope: final change-set hygiene.
