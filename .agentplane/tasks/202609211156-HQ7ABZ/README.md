---
id: "202609211156-HQ7ABZ"
title: "Complete Writer P0 upstream parity remediation"
result_summary: "Completed Writer P0-2 through P0-5 parity remediation"
status: "DONE"
priority: "high"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
task_kind: "code"
mutation_scope: "code"
blueprint_request: "code.direct"
verify:
  - "ap doctor"
  - "node .agentplane/policy/check-routing.mjs"
  - "npm run check:dependencies"
  - "npm run check:source-provenance"
  - "npm run check:source-tree"
  - "npm run lint"
  - "npm run test:coverage"
  - "npm run test:e2e"
  - "npm run test:inventory:coverage"
  - "npm run typecheck"
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-21T11:56:42.456Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-21T12:32:40.632Z"
  updated_by: "CODER"
  note: "verified-202609211156-HQ7ABZ"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-21T12:32:07.456Z"
  updated_by: "EVALUATOR"
  note: "Approved P0-2 through P0-5 remediation is complete and fully verified; P0-1 remains unchanged by design."
  evaluated_sha: "c3a6e0f581b7c289de97edfa9f2af6271a474b0b"
  blueprint_digest: "b2967a2de731344879a100ced820d655312bcf3325e8e46a272e66788299b9b5"
  evidence_refs:
    - ".agentplane/tasks/202609211156-HQ7ABZ/README.md"
    - ".agentplane/tasks/202609211156-HQ7ABZ/quality/20260921-123207456-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609211156-HQ7ABZ/quality/20260921-123207456-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609211156-HQ7ABZ/quality/20260921-123207456-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609211156-HQ7ABZ/blueprint/resolved-snapshot.json"
    - "npm run verify"
  findings:
    - "No blocking defects found in implementation commit c3a6e0f581b7."
commit:
  hash: "09214a1bf3811e3b1a02353fb51698c548b0b4e7"
  message: "🧪 HQ7ABZ task: record verification evidence"
comments:
  -
    author: "CODER"
    body: "Start: complete the approved P0-2 through P0-5 remediation without changing P0-1 mechanics."
  -
    author: "CODER"
    body: "Verified: verified-202609211156-HQ7ABZ. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
  -
    author: "CODER"
    body: "Verified: completed Writer P0-2 through P0-5 remediation; P0-1 remains unchanged."
events:
  -
    type: "status"
    at: "2026-09-21T11:56:52.414Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: complete the approved P0-2 through P0-5 remediation without changing P0-1 mechanics."
  -
    type: "verify"
    at: "2026-09-21T12:31:58.687Z"
    author: "REVIEWER"
    state: "ok"
    note: "P0-2 through P0-5 remediation verified; P0-1 intentionally unchanged."
  -
    type: "verify"
    at: "2026-09-21T12:32:22.552Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609211156-HQ7ABZ"
  -
    type: "verify"
    at: "2026-09-21T12:32:40.632Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609211156-HQ7ABZ"
  -
    type: "status"
    at: "2026-09-21T12:32:40.768Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609211156-HQ7ABZ. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
  -
    type: "status"
    at: "2026-09-21T12:33:21.354Z"
    author: "CODER"
    from: "DONE"
    to: "DONE"
    note: "Verified: completed Writer P0-2 through P0-5 remediation; P0-1 remains unchanged."
doc_version: 3
doc_updated_at: "2026-09-21T12:33:21.355Z"
doc_updated_by: "CODER"
description: "Complete the missing P0-2 through P0-5 requirements identified by review; keep P0-1 inventory model and behavior unchanged."
sections:
  Summary: "Finish the approved P0-2 through P0-5 remediation: upstream-shaped Sfx slot execution, projection-only browser identities, hint/item-native Writer mutations and undo, and complete honest style/font defaults."
  Scope: "In scope: remove custom target/undo execution metadata from Sfx descriptors; keep presentation metadata declarative; remove string paragraph/node identities from sw/core and shell-facing uibase contracts; mutate canonical text/hints/items directly and store undo payloads as Writer-native text/range/attribute state; either implement source-derived defaults for every exposed built-in style or make unsupported families unavailable; separate requested, device-resolved, and serialized font identities; update focused tests and truthful existing-schema inventory records. Out of scope: P0-1 inventory schema/closure redesign, P1/P2 refactors, legacy persisted-schema compatibility, external publication."
  Plan: "1. Load direct/code policy and current route. 2. Replace residual custom Sfx execution metadata with slot/request/shell execute-state contracts and tests. 3. Remove core/uibase paragraph string identities, keeping browser keys exclusively in projection adapters. 4. Rework SwTextNode and undo mutations to operate directly on text plus SwpHints/SwTextAttr/SfxItemSet; retain WriterTextRun only for immutable boundary projection and import conversion. 5. Complete source-derived defaults for every exposed style or restrict the exposed set, and model requested versus resolved font identity explicitly. 6. Update tests and existing inventory/provenance records without changing P0-1 mechanics. 7. Run focused and full verification, inspect diff/status, record verification, commit, and finish the task."
  Verify Steps: |-
    1. Run focused Sfx tests proving shell priority, slot/request argument flow, state queries, invalidation, and absence of custom target/undo execution metadata.
    2. Run focused Writer model tests proving core and shell-facing APIs use node references, SwPosition, and SwPaM while browser projection IDs terminate in sw/browser.
    3. Run focused text/hint/undo tests proving insert, delete, replace, format, hyperlink, split, join, undo, and redo mutate or restore text plus SwpHints/SwTextAttr/SfxItemSet without WriterTextRun payloads in core mutation or undo APIs.
    4. Run style/font tests proving every exposed built-in style has its required source-derived supported defaults, unsupported families are unavailable, Western/CJK/CTL requests are covered, and requested versus resolved/serialized font identity is distinguishable.
    5. Run npm run typecheck, npm run lint, npm run check:dependencies, npm run check:source-tree, and npm run check:source-provenance.
    6. Run npm run test:coverage, npm run test:inventory:coverage, npm run test:e2e, and npm run verify.
    7. Run ap doctor and node .agentplane/policy/check-routing.mjs.
    8. Inspect git diff and final git status; only intentional P0-2 through P0-5 task files and AgentPlane artifacts may change, while P0-1 mechanics remain untouched.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-21T12:31:58.687Z — VERIFY — ok

    By: REVIEWER

    Note: P0-2 through P0-5 remediation verified; P0-1 intentionally unchanged.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T11:56:52.414Z, excerpt_hash=sha256:b3901a9d1bd7c8cc3a7a3cad13305b891b7f43a3a66f9303e3e8eb39b7c23678

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211156-HQ7ABZ/blueprint/resolved-snapshot.json
    - old_digest: b2967a2de731344879a100ced820d655312bcf3325e8e46a272e66788299b9b5
    - current_digest: b2967a2de731344879a100ced820d655312bcf3325e8e46a272e66788299b9b5
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609211156-HQ7ABZ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609211156-HQ7ABZ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-21T12:32:22.552Z — VERIFY — ok

    By: CODER

    Note: verified-202609211156-HQ7ABZ
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T12:31:58.742Z, excerpt_hash=sha256:b3901a9d1bd7c8cc3a7a3cad13305b891b7f43a3a66f9303e3e8eb39b7c23678

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211156-HQ7ABZ/blueprint/resolved-snapshot.json
    - old_digest: b2967a2de731344879a100ced820d655312bcf3325e8e46a272e66788299b9b5
    - current_digest: b2967a2de731344879a100ced820d655312bcf3325e8e46a272e66788299b9b5
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609211156-HQ7ABZ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609211156-HQ7ABZ --result verified-202609211156-HQ7ABZ --commit c3a6e0f581b7c289de97edfa9f2af6271a474b0b
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-21T12:32:40.632Z — VERIFY — ok

    By: CODER

    Note: verified-202609211156-HQ7ABZ
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T12:32:22.612Z, excerpt_hash=sha256:b3901a9d1bd7c8cc3a7a3cad13305b891b7f43a3a66f9303e3e8eb39b7c23678

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211156-HQ7ABZ/blueprint/resolved-snapshot.json
    - old_digest: b2967a2de731344879a100ced820d655312bcf3325e8e46a272e66788299b9b5
    - current_digest: b2967a2de731344879a100ced820d655312bcf3325e8e46a272e66788299b9b5
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609211156-HQ7ABZ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609211156-HQ7ABZ --result verified-202609211156-HQ7ABZ --commit 09214a1bf3811e3b1a02353fb51698c548b0b4e7
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commit and the deterministic AgentPlane close commit; no legacy schema migration is added."
  Findings: |-
    - Observation: npm run verify passed: 348 unit tests and 95 inventory tests at 100% coverage, 11 Playwright E2E tests, build/static/docs/file-size/source/provenance/invariant/parity gates.
      Impact: Sfx execution metadata removed; Writer core uses node references and native text/hint undo payloads; only supported style defaults are exposed; requested and resolved fonts are distinct.
      Resolution: Implementation commit c3a6e0f581b7 satisfies the approved scope.
extensions:
  implementation_commit:
    hash: "c3a6e0f581b7c289de97edfa9f2af6271a474b0b"
    message: "🚧 HQ7ABZ task: implement Writer P0 parity remediation"
id_source: "generated"
---
## Summary

Finish the approved P0-2 through P0-5 remediation: upstream-shaped Sfx slot execution, projection-only browser identities, hint/item-native Writer mutations and undo, and complete honest style/font defaults.

## Scope

In scope: remove custom target/undo execution metadata from Sfx descriptors; keep presentation metadata declarative; remove string paragraph/node identities from sw/core and shell-facing uibase contracts; mutate canonical text/hints/items directly and store undo payloads as Writer-native text/range/attribute state; either implement source-derived defaults for every exposed built-in style or make unsupported families unavailable; separate requested, device-resolved, and serialized font identities; update focused tests and truthful existing-schema inventory records. Out of scope: P0-1 inventory schema/closure redesign, P1/P2 refactors, legacy persisted-schema compatibility, external publication.

## Plan

1. Load direct/code policy and current route. 2. Replace residual custom Sfx execution metadata with slot/request/shell execute-state contracts and tests. 3. Remove core/uibase paragraph string identities, keeping browser keys exclusively in projection adapters. 4. Rework SwTextNode and undo mutations to operate directly on text plus SwpHints/SwTextAttr/SfxItemSet; retain WriterTextRun only for immutable boundary projection and import conversion. 5. Complete source-derived defaults for every exposed style or restrict the exposed set, and model requested versus resolved font identity explicitly. 6. Update tests and existing inventory/provenance records without changing P0-1 mechanics. 7. Run focused and full verification, inspect diff/status, record verification, commit, and finish the task.

## Verify Steps

1. Run focused Sfx tests proving shell priority, slot/request argument flow, state queries, invalidation, and absence of custom target/undo execution metadata.
2. Run focused Writer model tests proving core and shell-facing APIs use node references, SwPosition, and SwPaM while browser projection IDs terminate in sw/browser.
3. Run focused text/hint/undo tests proving insert, delete, replace, format, hyperlink, split, join, undo, and redo mutate or restore text plus SwpHints/SwTextAttr/SfxItemSet without WriterTextRun payloads in core mutation or undo APIs.
4. Run style/font tests proving every exposed built-in style has its required source-derived supported defaults, unsupported families are unavailable, Western/CJK/CTL requests are covered, and requested versus resolved/serialized font identity is distinguishable.
5. Run npm run typecheck, npm run lint, npm run check:dependencies, npm run check:source-tree, and npm run check:source-provenance.
6. Run npm run test:coverage, npm run test:inventory:coverage, npm run test:e2e, and npm run verify.
7. Run ap doctor and node .agentplane/policy/check-routing.mjs.
8. Inspect git diff and final git status; only intentional P0-2 through P0-5 task files and AgentPlane artifacts may change, while P0-1 mechanics remain untouched.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-21T12:31:58.687Z — VERIFY — ok

By: REVIEWER

Note: P0-2 through P0-5 remediation verified; P0-1 intentionally unchanged.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T11:56:52.414Z, excerpt_hash=sha256:b3901a9d1bd7c8cc3a7a3cad13305b891b7f43a3a66f9303e3e8eb39b7c23678

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211156-HQ7ABZ/blueprint/resolved-snapshot.json
- old_digest: b2967a2de731344879a100ced820d655312bcf3325e8e46a272e66788299b9b5
- current_digest: b2967a2de731344879a100ced820d655312bcf3325e8e46a272e66788299b9b5
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609211156-HQ7ABZ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609211156-HQ7ABZ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-21T12:32:22.552Z — VERIFY — ok

By: CODER

Note: verified-202609211156-HQ7ABZ
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T12:31:58.742Z, excerpt_hash=sha256:b3901a9d1bd7c8cc3a7a3cad13305b891b7f43a3a66f9303e3e8eb39b7c23678

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211156-HQ7ABZ/blueprint/resolved-snapshot.json
- old_digest: b2967a2de731344879a100ced820d655312bcf3325e8e46a272e66788299b9b5
- current_digest: b2967a2de731344879a100ced820d655312bcf3325e8e46a272e66788299b9b5
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609211156-HQ7ABZ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609211156-HQ7ABZ --result verified-202609211156-HQ7ABZ --commit c3a6e0f581b7c289de97edfa9f2af6271a474b0b
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-21T12:32:40.632Z — VERIFY — ok

By: CODER

Note: verified-202609211156-HQ7ABZ
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T12:32:22.612Z, excerpt_hash=sha256:b3901a9d1bd7c8cc3a7a3cad13305b891b7f43a3a66f9303e3e8eb39b7c23678

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211156-HQ7ABZ/blueprint/resolved-snapshot.json
- old_digest: b2967a2de731344879a100ced820d655312bcf3325e8e46a272e66788299b9b5
- current_digest: b2967a2de731344879a100ced820d655312bcf3325e8e46a272e66788299b9b5
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609211156-HQ7ABZ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609211156-HQ7ABZ --result verified-202609211156-HQ7ABZ --commit 09214a1bf3811e3b1a02353fb51698c548b0b4e7
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commit and the deterministic AgentPlane close commit; no legacy schema migration is added.

## Findings

- Observation: npm run verify passed: 348 unit tests and 95 inventory tests at 100% coverage, 11 Playwright E2E tests, build/static/docs/file-size/source/provenance/invariant/parity gates.
  Impact: Sfx execution metadata removed; Writer core uses node references and native text/hint undo payloads; only supported style defaults are exposed; requested and resolved fonts are distinct.
  Resolution: Implementation commit c3a6e0f581b7 satisfies the approved scope.
