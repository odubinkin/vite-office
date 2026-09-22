---
id: "202609220707-9JA4S3"
title: "Canonicalize Writer core models and graph serialization"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on:
  - "202609220707-76AZJP"
tags:
  - "code"
  - "parity"
  - "writer"
task_kind: "code"
mutation_scope: "code"
blueprint_request: "code.direct"
verify:
  - "npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check"
  - "npm run test:coverage"
  - "npm run test:inventory:coverage && npm run check:dependencies && npm run check:source-provenance && npm run inventory:parity"
plan_approval:
  state: "approved"
  updated_at: "2026-09-22T07:09:54.070Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-22T08:20:08.847Z"
  updated_by: "CODER"
  note: "Verified canonical SfxItemSet character/list mutation, removed SwTextNode compatibility accessors, and shared Writer graph serialization. Full app coverage: 76 files/367 tests at 100%; inventory coverage: 34 files/96 tests at 100%; static build, focused tests, format, lint, typecheck, dependencies, source provenance, parity inventory, file-size, docs, source-tree, Writer resources, and git diff checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-22T08:20:15.625Z"
  updated_by: "EVALUATOR"
  note: "P1.4-P1.7 converge character formatting, list state, text-node APIs, and persistence on canonical Writer/Sfx graph contracts."
  evaluated_sha: "777e1f4f65927cfbd56ce890e2d0325d00307a47"
  blueprint_digest: "d900c31a348076b92398a88d9ff9ff503f2e9efb456100979c8f0a5e6a7c1bb1"
  evidence_refs:
    - ".agentplane/tasks/202609220707-9JA4S3/README.md"
    - ".agentplane/tasks/202609220707-9JA4S3/quality/20260922-082015625-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609220707-9JA4S3/quality/20260922-082015625-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609220707-9JA4S3/quality/20260922-082015625-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609220707-9JA4S3/blueprint/resolved-snapshot.json"
    - "777e1f4f6592"
  findings:
    - "All declared verification steps pass; obsolete storage and Worker envelope versions are intentionally rejected with no compatibility path."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-22T07:47:29.282Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-09-22T08:20:08.847Z"
    author: "CODER"
    state: "ok"
    note: "Verified canonical SfxItemSet character/list mutation, removed SwTextNode compatibility accessors, and shared Writer graph serialization. Full app coverage: 76 files/367 tests at 100%; inventory coverage: 34 files/96 tests at 100%; static build, focused tests, format, lint, typecheck, dependencies, source provenance, parity inventory, file-size, docs, source-tree, Writer resources, and git diff checks passed."
doc_version: 3
doc_updated_at: "2026-09-22T08:20:08.902Z"
doc_updated_by: "CODER"
description: "Implement P1.4-P1.7: make pooled items, Writer attributes, numbering/list objects and SwPaM the model mutation vocabulary; remove core compatibility DTOs and unify graph serialization without legacy-schema compatibility."
sections:
  Summary: |-
    Canonicalize Writer core models and graph serialization

    Implement P1.4-P1.7: make pooled items, Writer attributes, numbering/list objects and SwPaM the model mutation vocabulary; remove core compatibility DTOs and unify graph serialization without legacy-schema compatibility.
  Scope: |-
    - In scope: Implement P1.4-P1.7: make pooled items, Writer attributes, numbering/list objects and SwPaM the model mutation vocabulary; remove core compatibility DTOs and unify graph serialization without legacy-schema compatibility.
    - Out of scope: unrelated refactors not required for "Canonicalize Writer core models and graph serialization".
  Plan: |-
    1. Inventory core/shell consumers of WriterCharacterAttributes, WriterParagraphList, SwTextNode compatibility getters, OfficeDocument, and overlapping graph records.
    2. Convert mutation and undo contracts to SfxItemSet/pool items, SwTextAttr, SwNumRule/SwList, SwPaM, and upstream-shaped node methods.
    3. Move render/clipboard DTO projection to named browser boundaries and remove core compatibility accessors after all consumers migrate.
    4. Establish one canonical versioned graph record with thin Worker and IndexedDB envelopes; bump schema and reject every earlier stored schema without migration.
    5. Update affected inventory/provenance/docs and verify WhichIds, inheritance, list identity, cursors, undo, transfer, cache restore, and ODT paths.
  Verify Steps: |-
    1. Run focused core, undo, clipboard, storage, Worker, and ODT round-trip tests. Expected: all mutation paths use canonical Writer/Sfx objects and preserve identifiers, items, list ownership, and cursor state.
    2. Run npm run test:coverage && npm run test:inventory:coverage. Expected: suites and coverage pass.
    3. Run npm run check:dependencies && npm run check:source-provenance && npm run inventory:parity. Expected: no browser/storage DTO crosses into core mutation APIs and affected evidence is current.
    4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check. Expected: static and hygiene checks pass.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-22T08:20:08.847Z — VERIFY — ok

    By: CODER

    Note: Verified canonical SfxItemSet character/list mutation, removed SwTextNode compatibility accessors, and shared Writer graph serialization. Full app coverage: 76 files/367 tests at 100%; inventory coverage: 34 files/96 tests at 100%; static build, focused tests, format, lint, typecheck, dependencies, source provenance, parity inventory, file-size, docs, source-tree, Writer resources, and git diff checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T07:47:29.282Z, excerpt_hash=sha256:186f606c19b42658afac5edf300d6f4b026fd0c23aa306c584c0a780eca7bdc2

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220707-9JA4S3/blueprint/resolved-snapshot.json
    - old_digest: d900c31a348076b92398a88d9ff9ff503f2e9efb456100979c8f0a5e6a7c1bb1
    - current_digest: d900c31a348076b92398a88d9ff9ff503f2e9efb456100979c8f0a5e6a7c1bb1
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609220707-9JA4S3

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609220707-9JA4S3
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

Canonicalize Writer core models and graph serialization

Implement P1.4-P1.7: make pooled items, Writer attributes, numbering/list objects and SwPaM the model mutation vocabulary; remove core compatibility DTOs and unify graph serialization without legacy-schema compatibility.

## Scope

- In scope: Implement P1.4-P1.7: make pooled items, Writer attributes, numbering/list objects and SwPaM the model mutation vocabulary; remove core compatibility DTOs and unify graph serialization without legacy-schema compatibility.
- Out of scope: unrelated refactors not required for "Canonicalize Writer core models and graph serialization".

## Plan

1. Inventory core/shell consumers of WriterCharacterAttributes, WriterParagraphList, SwTextNode compatibility getters, OfficeDocument, and overlapping graph records.
2. Convert mutation and undo contracts to SfxItemSet/pool items, SwTextAttr, SwNumRule/SwList, SwPaM, and upstream-shaped node methods.
3. Move render/clipboard DTO projection to named browser boundaries and remove core compatibility accessors after all consumers migrate.
4. Establish one canonical versioned graph record with thin Worker and IndexedDB envelopes; bump schema and reject every earlier stored schema without migration.
5. Update affected inventory/provenance/docs and verify WhichIds, inheritance, list identity, cursors, undo, transfer, cache restore, and ODT paths.

## Verify Steps

1. Run focused core, undo, clipboard, storage, Worker, and ODT round-trip tests. Expected: all mutation paths use canonical Writer/Sfx objects and preserve identifiers, items, list ownership, and cursor state.
2. Run npm run test:coverage && npm run test:inventory:coverage. Expected: suites and coverage pass.
3. Run npm run check:dependencies && npm run check:source-provenance && npm run inventory:parity. Expected: no browser/storage DTO crosses into core mutation APIs and affected evidence is current.
4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check. Expected: static and hygiene checks pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-22T08:20:08.847Z — VERIFY — ok

By: CODER

Note: Verified canonical SfxItemSet character/list mutation, removed SwTextNode compatibility accessors, and shared Writer graph serialization. Full app coverage: 76 files/367 tests at 100%; inventory coverage: 34 files/96 tests at 100%; static build, focused tests, format, lint, typecheck, dependencies, source provenance, parity inventory, file-size, docs, source-tree, Writer resources, and git diff checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T07:47:29.282Z, excerpt_hash=sha256:186f606c19b42658afac5edf300d6f4b026fd0c23aa306c584c0a780eca7bdc2

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220707-9JA4S3/blueprint/resolved-snapshot.json
- old_digest: d900c31a348076b92398a88d9ff9ff503f2e9efb456100979c8f0a5e6a7c1bb1
- current_digest: d900c31a348076b92398a88d9ff9ff503f2e9efb456100979c8f0a5e6a7c1bb1
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609220707-9JA4S3

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609220707-9JA4S3
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
