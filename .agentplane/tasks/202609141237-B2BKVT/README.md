---
id: "202609141237-B2BKVT"
title: "Implement Writer Workstream 2 core invariants"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 20
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-14T12:54:37.120Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-14T13:55:01.153Z"
  updated_by: "TESTER"
  note: "Workstream 2 verified in the target-only document model: registered content indices, typed svl/sw notifications, SfxObjectShell/SwDocShell lifecycle ownership, svl undo relocation, schema-v4 SwDoc snapshots and schema-v1 Writer persistence. npm run verify passed (246 unit tests and 84 inventory tests at 100% coverage, 9/9 E2E); target-schema rg assertions, ap doctor, routing policy, and git diff checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-14T13:55:52.408Z"
  updated_by: "EVALUATOR"
  note: "Workstream 2 satisfies the approved target-only parity scope and repository quality gates."
  evaluated_sha: "ae373a238b39ed7714a07519078c71553b1167ac"
  blueprint_digest: "5fbf1f94bd8cd05218ae9c641354efd39f141d5b98909f4cdb39dfacb4e7484a"
  evidence_refs:
    - ".agentplane/tasks/202609141237-B2BKVT/README.md"
    - ".agentplane/tasks/202609141237-B2BKVT/quality/20260914-135552408-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609141237-B2BKVT/quality/20260914-135552408-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609141237-B2BKVT/quality/20260914-135552408-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609141237-B2BKVT/blueprint/resolved-snapshot.json"
    - "npm run verify: exit 0; 246 unit and 84 inventory tests at 100% coverage; 9 E2E passed"
    - "Target-schema and ownership rg assertions passed"
    - "ap doctor: OK"
    - "node .agentplane/policy/check-routing.mjs: policy routing OK"
    - "git diff --check: passed"
  findings:
    - "Registered content indices cover cursor, mark, redline, anchor, affinity, structural edits, and ownership cleanup."
    - "Typed broadcaster/listener and SwModify/SwClient propagation replace generic shell listener sets while preserving one UI transaction boundary."
    - "SwDoc is model-only; SfxObjectShell and SwDocShell exclusively own lifecycle, save, recovery, medium, and undo responsibilities."
    - "Retired persistence shapes and old sfx2 docfac/docundomanager runtime paths are rejected or removed; only the target schemas remain."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-14T12:39:04.433Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-09-14T13:55:01.153Z"
    author: "TESTER"
    state: "ok"
    note: "Workstream 2 verified in the target-only document model: registered content indices, typed svl/sw notifications, SfxObjectShell/SwDocShell lifecycle ownership, svl undo relocation, schema-v4 SwDoc snapshots and schema-v1 Writer persistence. npm run verify passed (246 unit tests and 84 inventory tests at 100% coverage, 9/9 E2E); target-schema rg assertions, ap doctor, routing policy, and git diff checks passed."
doc_version: 3
doc_updated_at: "2026-09-14T13:55:01.207Z"
doc_updated_by: "CODER"
description: "Implement Workstream 2 from docs/program/vite-office-upstream-parity-plan.md using the pinned LibreOffice baseline: registered content indices, typed model broadcasters/clients, shell-owned lifecycle, and correct svl/sfx2 undo/factory ownership."
sections:
  Summary: "Restore the bounded Writer core invariants defined by Workstream 2: registered content positions, typed model notifications, shell-owned document lifecycle, and upstream-correct undo/factory module ownership. Preserve current editing, persistence, recovery, ODT, and command behavior."
  Scope: "Implement P2.1-P2.4 against pinned LibreOffice commit 9bc445578031fecf56086729d8e4940c77e14d65. Touch the relevant sw core node/cursor/document/format/numbering code, SwDocShell/SwWrtShell/SwView subscription path, svl notify and undo boundaries, sfx2 object-shell lifecycle support, Writer snapshots/storage/filter integration, tests, runtime inventory, source provenance, parity records, source-tree checks, and directly stale documentation. Do not expand Writer features, add desktop-only mechanisms, use network access, retain compatibility layers for the old document model, or create an empty SfxObjectFactory without a runtime registration need. Replace the old persisted Writer schema with the target model-only schema; existing IndexedDB snapshots may be rejected as unsupported."
  Plan: "Implement P2.1-P2.4 as one coherent Writer-core refactor with no old-model compatibility: upstream-derived registered indices; typed svl/sw notification graph and one React bridge; model-only SwDoc plus exclusively shell-owned lifecycle in the target snapshot schema; svl-owned undo and corrected sfx2 helper ownership; synchronized tests, inventory, provenance, checks, and docs; targeted plus full verification."
  Verify Steps: "1. Run targeted Vitest coverage for registered indices and all affected Writer text/node operations, including cursor, mark, redline-like, anchor-like, affinity, split, merge, remove, and transfer cases. 2. Run targeted Vitest coverage for svl broadcasters/listeners, SwModify/client registration, typed hints, one-transaction notification behavior, command invalidation, document replacement/disposal, and the single SwView external-store bridge. 3. Run targeted Vitest coverage for model-only SwDoc, exclusive SwDocShell lifecycle/save-position/recovery/close ownership, rejection of the retired snapshot schema, target-schema ODT open/save, and the relocated svl undo manager. 4. Assert with rg that SwDoc no longer owns or imports OfficeDocument/medium/generation fields, no compatibility reader/map/facade for the old document model exists, production SwDocShell/SwWrtShell no longer own generic listener sets, and no production import refers to sfx2/source/doc/docundomanager or docfac. 5. Run npm run verify. 6. Run ap doctor. 7. Run node .agentplane/policy/check-routing.mjs. 8. Inspect git diff --check and git status --short --untracked-files=all for intentional task-only changes."
  Verification: |-
    Pending implementation and independent TESTER verification.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-14T13:55:01.153Z — VERIFY — ok

    By: TESTER

    Note: Workstream 2 verified in the target-only document model: registered content indices, typed svl/sw notifications, SfxObjectShell/SwDocShell lifecycle ownership, svl undo relocation, schema-v4 SwDoc snapshots and schema-v1 Writer persistence. npm run verify passed (246 unit tests and 84 inventory tests at 100% coverage, 9/9 E2E); target-schema rg assertions, ap doctor, routing policy, and git diff checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T12:54:26.422Z, excerpt_hash=sha256:72880aa42318d3f0c5f784468b89092b4027b92c2913b9005174373df4a06901

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141237-B2BKVT/blueprint/resolved-snapshot.json
    - old_digest: 5fbf1f94bd8cd05218ae9c641354efd39f141d5b98909f4cdb39dfacb4e7484a
    - current_digest: 5fbf1f94bd8cd05218ae9c641354efd39f141d5b98909f4cdb39dfacb4e7484a
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609141237-B2BKVT

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609141237-B2BKVT
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the Workstream 2 implementation and task metadata commits together. The approved target intentionally removes compatibility with pre-Workstream-2 IndexedDB Writer snapshots; rollback restores the old schema code but does not migrate data written by the new schema."
  Findings: |-
    The local LibreOffice reference checkout is clean and exactly pinned to 9bc445578031fecf56086729d8e4940c77e14d65. Workstream 1 task 202609141201-7V5AK0 is closed before this task begins.

    - Observation: The user explicitly rejected all compatibility layers for the retired document model after implementation began.
      Impact: The target Writer snapshot schema may reject existing IndexedDB records and verification must prove old-schema rejection rather than backward compatibility.
      Resolution: Updated Scope, Plan, Verify Steps, and Rollback Plan to implement only the target model-only schema; no transitional metadata map or legacy reader will be added.

    - Observation: All required Workstream 2 mechanisms and ownership boundaries are implemented with upstream-aligned structures; retired document schema readers and old sfx2 facades are absent from production code.
      Impact: Writer positions remain valid across node/content edits, notification propagation is typed and mutation-safe, lifecycle/save/recovery ownership is centralized in shells, and persistence accepts only the target schema.
      Resolution: Full repository verification and explicit ownership/compatibility assertions completed successfully.
id_source: "generated"
---
## Summary

Restore the bounded Writer core invariants defined by Workstream 2: registered content positions, typed model notifications, shell-owned document lifecycle, and upstream-correct undo/factory module ownership. Preserve current editing, persistence, recovery, ODT, and command behavior.

## Scope

Implement P2.1-P2.4 against pinned LibreOffice commit 9bc445578031fecf56086729d8e4940c77e14d65. Touch the relevant sw core node/cursor/document/format/numbering code, SwDocShell/SwWrtShell/SwView subscription path, svl notify and undo boundaries, sfx2 object-shell lifecycle support, Writer snapshots/storage/filter integration, tests, runtime inventory, source provenance, parity records, source-tree checks, and directly stale documentation. Do not expand Writer features, add desktop-only mechanisms, use network access, retain compatibility layers for the old document model, or create an empty SfxObjectFactory without a runtime registration need. Replace the old persisted Writer schema with the target model-only schema; existing IndexedDB snapshots may be rejected as unsupported.

## Plan

Implement P2.1-P2.4 as one coherent Writer-core refactor with no old-model compatibility: upstream-derived registered indices; typed svl/sw notification graph and one React bridge; model-only SwDoc plus exclusively shell-owned lifecycle in the target snapshot schema; svl-owned undo and corrected sfx2 helper ownership; synchronized tests, inventory, provenance, checks, and docs; targeted plus full verification.

## Verify Steps

1. Run targeted Vitest coverage for registered indices and all affected Writer text/node operations, including cursor, mark, redline-like, anchor-like, affinity, split, merge, remove, and transfer cases. 2. Run targeted Vitest coverage for svl broadcasters/listeners, SwModify/client registration, typed hints, one-transaction notification behavior, command invalidation, document replacement/disposal, and the single SwView external-store bridge. 3. Run targeted Vitest coverage for model-only SwDoc, exclusive SwDocShell lifecycle/save-position/recovery/close ownership, rejection of the retired snapshot schema, target-schema ODT open/save, and the relocated svl undo manager. 4. Assert with rg that SwDoc no longer owns or imports OfficeDocument/medium/generation fields, no compatibility reader/map/facade for the old document model exists, production SwDocShell/SwWrtShell no longer own generic listener sets, and no production import refers to sfx2/source/doc/docundomanager or docfac. 5. Run npm run verify. 6. Run ap doctor. 7. Run node .agentplane/policy/check-routing.mjs. 8. Inspect git diff --check and git status --short --untracked-files=all for intentional task-only changes.

## Verification

Pending implementation and independent TESTER verification.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-14T13:55:01.153Z — VERIFY — ok

By: TESTER

Note: Workstream 2 verified in the target-only document model: registered content indices, typed svl/sw notifications, SfxObjectShell/SwDocShell lifecycle ownership, svl undo relocation, schema-v4 SwDoc snapshots and schema-v1 Writer persistence. npm run verify passed (246 unit tests and 84 inventory tests at 100% coverage, 9/9 E2E); target-schema rg assertions, ap doctor, routing policy, and git diff checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T12:54:26.422Z, excerpt_hash=sha256:72880aa42318d3f0c5f784468b89092b4027b92c2913b9005174373df4a06901

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141237-B2BKVT/blueprint/resolved-snapshot.json
- old_digest: 5fbf1f94bd8cd05218ae9c641354efd39f141d5b98909f4cdb39dfacb4e7484a
- current_digest: 5fbf1f94bd8cd05218ae9c641354efd39f141d5b98909f4cdb39dfacb4e7484a
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609141237-B2BKVT

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609141237-B2BKVT
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the Workstream 2 implementation and task metadata commits together. The approved target intentionally removes compatibility with pre-Workstream-2 IndexedDB Writer snapshots; rollback restores the old schema code but does not migrate data written by the new schema.

## Findings

The local LibreOffice reference checkout is clean and exactly pinned to 9bc445578031fecf56086729d8e4940c77e14d65. Workstream 1 task 202609141201-7V5AK0 is closed before this task begins.

- Observation: The user explicitly rejected all compatibility layers for the retired document model after implementation began.
  Impact: The target Writer snapshot schema may reject existing IndexedDB records and verification must prove old-schema rejection rather than backward compatibility.
  Resolution: Updated Scope, Plan, Verify Steps, and Rollback Plan to implement only the target model-only schema; no transitional metadata map or legacy reader will be added.

- Observation: All required Workstream 2 mechanisms and ownership boundaries are implemented with upstream-aligned structures; retired document schema readers and old sfx2 facades are absent from production code.
  Impact: Writer positions remain valid across node/content edits, notification propagation is typed and mutation-safe, lifecycle/save/recovery ownership is centralized in shells, and persistence accepts only the target schema.
  Resolution: Full repository verification and explicit ownership/compatibility assertions completed successfully.
