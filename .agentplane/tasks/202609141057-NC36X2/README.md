---
id: "202609141057-NC36X2"
title: "Document upstream parity refactoring plan"
status: "DOING"
priority: "high"
owner: "DOCS"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "docs"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-14T10:57:44.556Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-14T11:03:59.902Z"
  updated_by: "DOCS"
  note: "The detailed upstream parity refactoring plan is complete: all 24 local Markdown links resolve, formatting and docs checks pass, policy routing passes, Agentplane doctor is OK, and git diff has no whitespace errors."
  attempts: 0
commit: null
comments:
  -
    author: "DOCS"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-14T10:57:59.451Z"
    author: "DOCS"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-09-14T11:03:59.902Z"
    author: "DOCS"
    state: "ok"
    note: "The detailed upstream parity refactoring plan is complete: all 24 local Markdown links resolve, formatting and docs checks pass, policy routing passes, Agentplane doctor is OK, and git diff has no whitespace errors."
doc_version: 3
doc_updated_at: "2026-09-14T11:03:59.979Z"
doc_updated_by: "DOCS"
description: "Create a detailed, evidence-based refactoring plan for the implemented Vite Office scope, covering inventory corrections, unjustified LibreOffice architecture divergences, UI/browser adapter cleanup, sequencing, acceptance criteria, risks, and verification."
sections:
  Summary: "Produce the canonical detailed refactoring plan for bringing the currently implemented browser office scope closer to pinned LibreOffice architecture and data-model parity."
  Scope: "In scope: docs/program/vite-office-upstream-parity-plan.md and task traceability artifacts. The plan covers findings already confirmed against the local pinned LibreOffice reference. Out of scope: implementation changes, policy changes, dependency updates, network access, and upstream baseline updates."
  Plan: "1. Consolidate audit evidence and current implementation inventory. 2. Define target LibreOffice-aligned architecture and explicit browser exceptions. 3. Specify phased refactoring workstreams for inventory, core model, lifecycle, command routing, UI/DOM editing, xmloff, storage, and verification. 4. Add dependencies, acceptance criteria, migration safeguards, and prioritization. 5. Validate document links and repository docs gates."
  Verify Steps: "1. Run a local script to validate every repository-relative Markdown link in docs/program/vite-office-upstream-parity-plan.md. 2. Run npm run check:docs. 3. Run node .agentplane/policy/check-routing.mjs. 4. Run ap doctor. 5. Review git diff --check and git status --short --untracked-files=all."
  Verification: |-
    Command: local Node Markdown link validation. Result: pass. Evidence: 24 repository-relative links checked, 0 missing. Scope: docs/program/vite-office-upstream-parity-plan.md. Links: all linked local source, upstream reference, inventory, and program documentation paths. Command: npx prettier --check docs/program/vite-office-upstream-parity-plan.md. Result: pass. Evidence: Prettier reports compliant formatting. Scope: target plan. Command: npm run check:docs. Result: pass. Evidence: JSDoc validation passed for 224 authored source files. Scope: repository documentation gate. Command: node .agentplane/policy/check-routing.mjs. Result: pass. Evidence: policy routing OK. Scope: repository routing policy. Command: ap doctor. Result: pass. Evidence: doctor OK with one unrelated historical-task warning. Scope: Agentplane workspace. Command: git diff --check. Result: pass. Evidence: no whitespace errors. Scope: current task diff.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-14T11:03:59.902Z — VERIFY — ok

    By: DOCS

    Note: The detailed upstream parity refactoring plan is complete: all 24 local Markdown links resolve, formatting and docs checks pass, policy routing passes, Agentplane doctor is OK, and git diff has no whitespace errors.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T11:03:59.312Z, excerpt_hash=sha256:623f263005996fa84909f6a687397fe60e40b8f0fee5766a6cbb92a5fc30ac8f

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141057-NC36X2/blueprint/resolved-snapshot.json
    - old_digest: 678ff9a063164d13c2271d044ac741b6e8d0ccfacedad3650e7273fe41d6066b
    - current_digest: 678ff9a063164d13c2271d044ac741b6e8d0ccfacedad3650e7273fe41d6066b
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609141057-NC36X2

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609141057-NC36X2
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only docs/program/vite-office-upstream-parity-plan.md and the task-local state generated for this task if the document is rejected; no implementation or policy files are in scope."
  Findings: "The audit found false-positive provenance mappings, stale parity records, duplicated immutable command adapters, missing registered position correction and model notifications, browser lifecycle leakage into SwDoc, an eager Writer session, an oversized UI controller, and a DOM-like xmloff intermediate tree."
id_source: "generated"
---
## Summary

Produce the canonical detailed refactoring plan for bringing the currently implemented browser office scope closer to pinned LibreOffice architecture and data-model parity.

## Scope

In scope: docs/program/vite-office-upstream-parity-plan.md and task traceability artifacts. The plan covers findings already confirmed against the local pinned LibreOffice reference. Out of scope: implementation changes, policy changes, dependency updates, network access, and upstream baseline updates.

## Plan

1. Consolidate audit evidence and current implementation inventory. 2. Define target LibreOffice-aligned architecture and explicit browser exceptions. 3. Specify phased refactoring workstreams for inventory, core model, lifecycle, command routing, UI/DOM editing, xmloff, storage, and verification. 4. Add dependencies, acceptance criteria, migration safeguards, and prioritization. 5. Validate document links and repository docs gates.

## Verify Steps

1. Run a local script to validate every repository-relative Markdown link in docs/program/vite-office-upstream-parity-plan.md. 2. Run npm run check:docs. 3. Run node .agentplane/policy/check-routing.mjs. 4. Run ap doctor. 5. Review git diff --check and git status --short --untracked-files=all.

## Verification

Command: local Node Markdown link validation. Result: pass. Evidence: 24 repository-relative links checked, 0 missing. Scope: docs/program/vite-office-upstream-parity-plan.md. Links: all linked local source, upstream reference, inventory, and program documentation paths. Command: npx prettier --check docs/program/vite-office-upstream-parity-plan.md. Result: pass. Evidence: Prettier reports compliant formatting. Scope: target plan. Command: npm run check:docs. Result: pass. Evidence: JSDoc validation passed for 224 authored source files. Scope: repository documentation gate. Command: node .agentplane/policy/check-routing.mjs. Result: pass. Evidence: policy routing OK. Scope: repository routing policy. Command: ap doctor. Result: pass. Evidence: doctor OK with one unrelated historical-task warning. Scope: Agentplane workspace. Command: git diff --check. Result: pass. Evidence: no whitespace errors. Scope: current task diff.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-14T11:03:59.902Z — VERIFY — ok

By: DOCS

Note: The detailed upstream parity refactoring plan is complete: all 24 local Markdown links resolve, formatting and docs checks pass, policy routing passes, Agentplane doctor is OK, and git diff has no whitespace errors.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T11:03:59.312Z, excerpt_hash=sha256:623f263005996fa84909f6a687397fe60e40b8f0fee5766a6cbb92a5fc30ac8f

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141057-NC36X2/blueprint/resolved-snapshot.json
- old_digest: 678ff9a063164d13c2271d044ac741b6e8d0ccfacedad3650e7273fe41d6066b
- current_digest: 678ff9a063164d13c2271d044ac741b6e8d0ccfacedad3650e7273fe41d6066b
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609141057-NC36X2

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609141057-NC36X2
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only docs/program/vite-office-upstream-parity-plan.md and the task-local state generated for this task if the document is rejected; no implementation or policy files are in scope.

## Findings

The audit found false-positive provenance mappings, stale parity records, duplicated immutable command adapters, missing registered position correction and model notifications, browser lifecycle leakage into SwDoc, an eager Writer session, an oversized UI controller, and a DOM-like xmloff intermediate tree.
