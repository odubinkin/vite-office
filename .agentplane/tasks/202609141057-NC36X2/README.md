---
id: "202609141057-NC36X2"
title: "Document upstream parity refactoring plan"
status: "DOING"
priority: "high"
owner: "DOCS"
revision: 20
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
  updated_at: "2026-09-14T11:04:41.519Z"
  updated_by: "CODER"
  note: "verified-202609141057-NC36X2"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-14T11:05:38.524Z"
  updated_by: "EVALUATOR"
  note: "The committed document satisfies the approved docs scope and provides an evidence-based, dependency-ordered refactoring program."
  evaluated_sha: "686ba3e3bc20b610e38f289ed0b29833cc8fa7bc"
  blueprint_digest: "678ff9a063164d13c2271d044ac741b6e8d0ccfacedad3650e7273fe41d6066b"
  evidence_refs:
    - ".agentplane/tasks/202609141057-NC36X2/README.md"
    - ".agentplane/tasks/202609141057-NC36X2/quality/20260914-110538524-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609141057-NC36X2/quality/20260914-110538524-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609141057-NC36X2/quality/20260914-110538524-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609141057-NC36X2/blueprint/resolved-snapshot.json"
    - "docs/program/vite-office-upstream-parity-plan.md"
  findings:
    - "The plan distinguishes confirmed current behavior from target work, covers all audited architecture and inventory defects, defines browser-specific exceptions, acceptance criteria, migration safeguards, verification requirements, and immediate delivery slices; all recorded docs checks passed."
commit: null
comments:
  -
    author: "DOCS"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "DOCS"
    body: "Blocked: closeout requires the mandatory EVALUATOR quality review after successful documentation verification; document scope and implementation are unchanged."
  -
    author: "DOCS"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "DOCS"
    body: "Blocked: commit-msg policy rejected the evaluator artifact commit because its subject used an unsupported review scope; retry requires the allowed task scope."
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
  -
    type: "verify"
    at: "2026-09-14T11:04:41.519Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609141057-NC36X2"
  -
    type: "status"
    at: "2026-09-14T11:05:08.159Z"
    author: "DOCS"
    from: "DOING"
    to: "BLOCKED"
    note: "Blocked: closeout requires the mandatory EVALUATOR quality review after successful documentation verification; document scope and implementation are unchanged."
  -
    type: "status"
    at: "2026-09-14T11:05:24.729Z"
    author: "DOCS"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "status"
    at: "2026-09-14T11:06:16.559Z"
    author: "DOCS"
    from: "DOING"
    to: "BLOCKED"
    note: "Blocked: commit-msg policy rejected the evaluator artifact commit because its subject used an unsupported review scope; retry requires the allowed task scope."
  -
    type: "status"
    at: "2026-09-14T11:06:25.561Z"
    author: "DOCS"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-09-14T11:06:25.561Z"
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

    ### 2026-09-14T11:04:41.519Z — VERIFY — ok

    By: CODER

    Note: verified-202609141057-NC36X2
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T11:03:59.979Z, excerpt_hash=sha256:623f263005996fa84909f6a687397fe60e40b8f0fee5766a6cbb92a5fc30ac8f

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
    - safe_command: agentplane task complete 202609141057-NC36X2 --result verified-202609141057-NC36X2 --commit 686ba3e3bc20b610e38f289ed0b29833cc8fa7bc
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only docs/program/vite-office-upstream-parity-plan.md and the task-local state generated for this task if the document is rejected; no implementation or policy files are in scope."
  Findings: |-
    The audit found false-positive provenance mappings, stale parity records, duplicated immutable command adapters, missing registered position correction and model notifications, browser lifecycle leakage into SwDoc, an eager Writer session, an oversized UI controller, and a DOM-like xmloff intermediate tree.

    - Observation: Direct task completion was attempted after successful verification but Agentplane rejected closeout because the required EVALUATOR quality review was not yet recorded.
      Impact: The plan document and implementation commit are complete, but the task cannot be finished until the mandatory quality gate is satisfied.
      Resolution: Record an EVALUATOR review against the document and verification evidence, then recompute the route and complete the task.
      Promotion: incident-candidate
      Fixability: repo-fixable

    - Observation: The task-artifact persistence commit was rejected by the commit-msg hook because the subject used the unsupported scope word review.
      Impact: Evaluator evidence is valid but remains staged and the task cannot close until those canonical artifacts are committed.
      Resolution: Retry the same task-scoped artifact commit with an allowed task intent token such as task; do not change the reviewed document.
      Promotion: incident-candidate
      Fixability: repo-fixable
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

### 2026-09-14T11:04:41.519Z — VERIFY — ok

By: CODER

Note: verified-202609141057-NC36X2
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T11:03:59.979Z, excerpt_hash=sha256:623f263005996fa84909f6a687397fe60e40b8f0fee5766a6cbb92a5fc30ac8f

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
- safe_command: agentplane task complete 202609141057-NC36X2 --result verified-202609141057-NC36X2 --commit 686ba3e3bc20b610e38f289ed0b29833cc8fa7bc
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

- Observation: Direct task completion was attempted after successful verification but Agentplane rejected closeout because the required EVALUATOR quality review was not yet recorded.
  Impact: The plan document and implementation commit are complete, but the task cannot be finished until the mandatory quality gate is satisfied.
  Resolution: Record an EVALUATOR review against the document and verification evidence, then recompute the route and complete the task.
  Promotion: incident-candidate
  Fixability: repo-fixable

- Observation: The task-artifact persistence commit was rejected by the commit-msg hook because the subject used the unsupported scope word review.
  Impact: Evaluator evidence is valid but remains staged and the task cannot close until those canonical artifacts are committed.
  Resolution: Retry the same task-scoped artifact commit with an allowed task intent token such as task; do not change the reviewed document.
  Promotion: incident-candidate
  Fixability: repo-fixable
