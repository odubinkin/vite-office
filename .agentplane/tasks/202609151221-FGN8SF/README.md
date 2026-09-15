---
id: "202609151221-FGN8SF"
title: "Implement Phase 2 Writer document graph parity"
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
  updated_at: "2026-09-15T13:14:41.578Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-15T13:18:41.253Z"
  updated_by: "CODER"
  note: "verified-202609151221-FGN8SF"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-15T13:18:21.811Z"
  updated_by: "EVALUATOR"
  note: "Phase 2 architecture and persistence boundary verified by the complete repository gate."
  evaluated_sha: "2a8ea1144828aa89bdd3ae7b29ad971e067239de"
  blueprint_digest: "e3870c68a8da8ea1e327b6cad3bb068a152b9fb88dd883eaeb7a6bbb3e31c50b"
  evidence_refs:
    - ".agentplane/tasks/202609151221-FGN8SF/README.md"
    - ".agentplane/tasks/202609151221-FGN8SF/quality/20260915-131821811-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609151221-FGN8SF/quality/20260915-131821811-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609151221-FGN8SF/quality/20260915-131821811-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609151221-FGN8SF/blueprint/resolved-snapshot.json"
    - "npm run verify"
  findings:
    - "SwDoc manager composition, canonical node-reference undo, SwModify reparenting, browser-owned codecs, and primitive presentation projection pass all declared checks."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved Phase 2 Writer document graph parity with upstream-derived ownership, positions, listeners, codecs, projections, tests, and parity evidence."
events:
  -
    type: "status"
    at: "2026-09-15T12:22:05.005Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Phase 2 Writer document graph parity with upstream-derived ownership, positions, listeners, codecs, projections, tests, and parity evidence."
  -
    type: "verify"
    at: "2026-09-15T13:18:10.853Z"
    author: "CODER"
    state: "ok"
    note: "npm run verify passed: 306 app tests and 88 inventory tests at 100% coverage, 10 Playwright E2E tests, production/static build, lint, typecheck, JSDoc, file-size, source-tree, provenance, invariants, and parity checks; routing check, doctor, and git diff check also passed."
  -
    type: "verify"
    at: "2026-09-15T13:18:41.253Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609151221-FGN8SF"
doc_version: 3
doc_updated_at: "2026-09-15T13:18:41.338Z"
doc_updated_by: "CODER"
description: "Implement Phase 2 from docs/program/vite-office-upstream-parity-plan.md against pinned LibreOffice upstream: document managers, canonical positions and SwPaM, Writer listener semantics, persistence codecs, presentation projection, and removal of snapshot-shaped core."
sections:
  Summary: "Restore the Writer document graph for the implemented 35-capability slice, following LibreOffice 26.8.0.2 ownership, node/position, listener, and serialization boundaries."
  Scope: "Implement Phase 2 (P2.1-P2.4) from docs/program/vite-office-upstream-parity-plan.md. Touch Writer core, shell adapters, browser persistence/projection, filters, tests, and parity evidence only where required by the dependency graph. No backward compatibility for the prior persisted model."
  Plan: "1. Compare current Writer graph with the pinned upstream source units and inventory all Phase 2 leaks. 2. Split SwDoc responsibilities into bounded managers and route modification through document state/shell ownership. 3. make SwNodes/SwNodeIndex/SwPosition/SwPaM the canonical identity and range model; remove persistent paragraph IDs. 4. Implement bounded SwClient/SwModify registration, reparenting, object-death, and propagation semantics without SwDoc inheritance. 5. Move document/node/hint/style/numbering codecs to browser/filter adapters, replace WriterViewSnapshot with a primitive versioned projection, and delete writer.ts. 6. Update callers, fixtures, parity records, and verify the full supported slice."
  Verify Steps: |-
    - npm run verify
    - node .agentplane/policy/check-routing.mjs
    - ap doctor
    - git diff --check
    - git status --short --untracked-files=all
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-15T13:18:10.853Z — VERIFY — ok

    By: CODER

    Note: npm run verify passed: 306 app tests and 88 inventory tests at 100% coverage, 10 Playwright E2E tests, production/static build, lint, typecheck, JSDoc, file-size, source-tree, provenance, invariants, and parity checks; routing check, doctor, and git diff check also passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T13:14:41.124Z, excerpt_hash=sha256:e9179102a2fc0b00e62bfbbce96b1d41c9cb342e3dd9fd310eb5546bd40a3334

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151221-FGN8SF/blueprint/resolved-snapshot.json
    - old_digest: e3870c68a8da8ea1e327b6cad3bb068a152b9fb88dd883eaeb7a6bbb3e31c50b
    - current_digest: e3870c68a8da8ea1e327b6cad3bb068a152b9fb88dd883eaeb7a6bbb3e31c50b
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609151221-FGN8SF

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609151221-FGN8SF
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T13:18:41.253Z — VERIFY — ok

    By: CODER

    Note: verified-202609151221-FGN8SF
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T13:18:10.943Z, excerpt_hash=sha256:e9179102a2fc0b00e62bfbbce96b1d41c9cb342e3dd9fd310eb5546bd40a3334

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151221-FGN8SF/blueprint/resolved-snapshot.json
    - old_digest: e3870c68a8da8ea1e327b6cad3bb068a152b9fb88dd883eaeb7a6bbb3e31c50b
    - current_digest: e3870c68a8da8ea1e327b6cad3bb068a152b9fb88dd883eaeb7a6bbb3e31c50b
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609151221-FGN8SF

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609151221-FGN8SF --result verified-202609151221-FGN8SF --commit 2a8ea1144828aa89bdd3ae7b29ad971e067239de
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commit and deterministic task-close commit. The persisted schema intentionally has no old-model compatibility path; rollback restores the previous code and schema together."
  Findings: "No findings yet."
id_source: "generated"
---
## Summary

Restore the Writer document graph for the implemented 35-capability slice, following LibreOffice 26.8.0.2 ownership, node/position, listener, and serialization boundaries.

## Scope

Implement Phase 2 (P2.1-P2.4) from docs/program/vite-office-upstream-parity-plan.md. Touch Writer core, shell adapters, browser persistence/projection, filters, tests, and parity evidence only where required by the dependency graph. No backward compatibility for the prior persisted model.

## Plan

1. Compare current Writer graph with the pinned upstream source units and inventory all Phase 2 leaks. 2. Split SwDoc responsibilities into bounded managers and route modification through document state/shell ownership. 3. make SwNodes/SwNodeIndex/SwPosition/SwPaM the canonical identity and range model; remove persistent paragraph IDs. 4. Implement bounded SwClient/SwModify registration, reparenting, object-death, and propagation semantics without SwDoc inheritance. 5. Move document/node/hint/style/numbering codecs to browser/filter adapters, replace WriterViewSnapshot with a primitive versioned projection, and delete writer.ts. 6. Update callers, fixtures, parity records, and verify the full supported slice.

## Verify Steps

- npm run verify
- node .agentplane/policy/check-routing.mjs
- ap doctor
- git diff --check
- git status --short --untracked-files=all

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-15T13:18:10.853Z — VERIFY — ok

By: CODER

Note: npm run verify passed: 306 app tests and 88 inventory tests at 100% coverage, 10 Playwright E2E tests, production/static build, lint, typecheck, JSDoc, file-size, source-tree, provenance, invariants, and parity checks; routing check, doctor, and git diff check also passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T13:14:41.124Z, excerpt_hash=sha256:e9179102a2fc0b00e62bfbbce96b1d41c9cb342e3dd9fd310eb5546bd40a3334

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151221-FGN8SF/blueprint/resolved-snapshot.json
- old_digest: e3870c68a8da8ea1e327b6cad3bb068a152b9fb88dd883eaeb7a6bbb3e31c50b
- current_digest: e3870c68a8da8ea1e327b6cad3bb068a152b9fb88dd883eaeb7a6bbb3e31c50b
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609151221-FGN8SF

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609151221-FGN8SF
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T13:18:41.253Z — VERIFY — ok

By: CODER

Note: verified-202609151221-FGN8SF
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T13:18:10.943Z, excerpt_hash=sha256:e9179102a2fc0b00e62bfbbce96b1d41c9cb342e3dd9fd310eb5546bd40a3334

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151221-FGN8SF/blueprint/resolved-snapshot.json
- old_digest: e3870c68a8da8ea1e327b6cad3bb068a152b9fb88dd883eaeb7a6bbb3e31c50b
- current_digest: e3870c68a8da8ea1e327b6cad3bb068a152b9fb88dd883eaeb7a6bbb3e31c50b
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609151221-FGN8SF

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609151221-FGN8SF --result verified-202609151221-FGN8SF --commit 2a8ea1144828aa89bdd3ae7b29ad971e067239de
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commit and deterministic task-close commit. The persisted schema intentionally has no old-model compatibility path; rollback restores the previous code and schema together.

## Findings

No findings yet.
