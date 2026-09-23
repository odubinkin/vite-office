---
id: "202609231642-874Q7B"
title: "Record browser recovery parity exclusion"
status: "DOING"
priority: "med"
owner: "DOCS"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "docs"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-23T16:43:13.037Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-23T16:48:42.433Z"
  updated_by: "DOCS"
  note: "Declared documentation checks passed: recovery package removed, exclusion recorded, policy routing and doctor OK, formatting and diff checks clean; mapping schema validates 43 verified and two approved exceptions. Full inventory evidence resolution remains blocked by pre-existing unrelated primary-save markers recorded in Findings."
  attempts: 0
commit: null
comments:
  -
    author: "DOCS"
    body: "Start: record the confirmed browser recovery exclusion in parity planning and lifecycle documentation; preserve runtime behavior."
events:
  -
    type: "status"
    at: "2026-09-23T16:43:13.706Z"
    author: "DOCS"
    from: "TODO"
    to: "DOING"
    note: "Start: record the confirmed browser recovery exclusion in parity planning and lifecycle documentation; preserve runtime behavior."
  -
    type: "verify"
    at: "2026-09-23T16:48:42.433Z"
    author: "DOCS"
    state: "ok"
    note: "Declared documentation checks passed: recovery package removed, exclusion recorded, policy routing and doctor OK, formatting and diff checks clean; mapping schema validates 43 verified and two approved exceptions. Full inventory evidence resolution remains blocked by pre-existing unrelated primary-save markers recorded in Findings."
doc_version: 3
doc_updated_at: "2026-09-23T16:48:42.542Z"
doc_updated_by: "DOCS"
description: "Document the confirmed decision that native LibreOffice recovery is inapplicable to the browser product; remove recovery implementation work from the parity plan and correct stale lifecycle and capability claims without changing runtime behavior."
sections:
  Summary: |-
    Record browser recovery parity exclusion

    Document the confirmed decision that native LibreOffice recovery is inapplicable to the browser product; remove recovery implementation work from the parity plan and correct stale lifecycle and capability claims without changing runtime behavior.
  Scope: |-
    - In scope: Document the confirmed decision that native LibreOffice recovery is inapplicable to the browser product; remove recovery implementation work from the parity plan and correct stale lifecycle and capability claims without changing runtime behavior.
    - Out of scope: unrelated refactors not required for "Record browser recovery parity exclusion".
  Plan: "Record the user-confirmed browser product decision in the parity plan and canonical persistence/lifecycle docs. Remove the recovery work package and classify native crash/session recovery as an intentional browser exclusion. Explain that primary IndexedDB save/load and any future full autosave are separate. Correct stale recovery claims in planning guidance without changing runtime or inventory machinery. Validate links and docs gates."
  Verify Steps: "1. Inspect the final diff and search parity planning docs for a recovery implementation work package. Expected: recovery is explicitly excluded and no R task remains. 2. Run node .agentplane/policy/check-routing.mjs. Expected: pass. 3. Run ap doctor. Expected: pass. 4. Run git diff --check and check final status. Expected: only intentional documentation and task changes."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-23T16:48:42.433Z — VERIFY — ok

    By: DOCS

    Note: Declared documentation checks passed: recovery package removed, exclusion recorded, policy routing and doctor OK, formatting and diff checks clean; mapping schema validates 43 verified and two approved exceptions. Full inventory evidence resolution remains blocked by pre-existing unrelated primary-save markers recorded in Findings.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T16:47:48.557Z, excerpt_hash=sha256:0d9eb1935fc25debcec8811f340f382d0ca797ce2e3759e15e2ab1b0b1452bd9

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609231642-874Q7B/blueprint/resolved-snapshot.json
    - old_digest: 3d2ef77f2fea057d4563e69868fb718c44928b44caf28c90ba9a40db6782a629
    - current_digest: 3d2ef77f2fea057d4563e69868fb718c44928b44caf28c90ba9a40db6782a629
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609231642-874Q7B

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609231642-874Q7B
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    Command: node .agentplane/policy/check-routing.mjs; Result: pass; Evidence: policy routing OK; Scope: repository routing. Links: docs/program/vite-office-upstream-parity-plan.md.
    Command: ap doctor; Result: pass; Evidence: doctor (OK), with pre-existing hook and historical-task warnings; Scope: AgentPlane workflow.
    Command: ./node_modules/.bin/prettier --check docs/program/autosave-recovery.md docs/program/document-lifecycle.md docs/program/parity-matrix.md docs/program/vite-office-upstream-parity-plan.md docs/program/parity/writer-command-slice.json; Result: pass; Evidence: all matched files use Prettier code style; Scope: changed program docs and capability mapping.
    Command: parseParityMappingManifest on writer-command-slice.json; Result: pass; Evidence: 43 verified and 2 exception-approved records; Scope: mapping schema and disposition.
    Command: git diff --check; Result: pass; Evidence: no whitespace errors; Scope: final diff.
    Command: npm run inventory:parity; Result: fail; Evidence: pre-existing CAP-0131 and CAP-0132 references to absent docsh.ts MarkHistoryMutation marker, present in HEAD before this task; Scope: complete parity evidence resolution. Resolution: leave unrelated primary-save records for a separate mapping repair. This failure does not change the recovery exclusion decision.
id_source: "generated"
---
## Summary

Record browser recovery parity exclusion

Document the confirmed decision that native LibreOffice recovery is inapplicable to the browser product; remove recovery implementation work from the parity plan and correct stale lifecycle and capability claims without changing runtime behavior.

## Scope

- In scope: Document the confirmed decision that native LibreOffice recovery is inapplicable to the browser product; remove recovery implementation work from the parity plan and correct stale lifecycle and capability claims without changing runtime behavior.
- Out of scope: unrelated refactors not required for "Record browser recovery parity exclusion".

## Plan

Record the user-confirmed browser product decision in the parity plan and canonical persistence/lifecycle docs. Remove the recovery work package and classify native crash/session recovery as an intentional browser exclusion. Explain that primary IndexedDB save/load and any future full autosave are separate. Correct stale recovery claims in planning guidance without changing runtime or inventory machinery. Validate links and docs gates.

## Verify Steps

1. Inspect the final diff and search parity planning docs for a recovery implementation work package. Expected: recovery is explicitly excluded and no R task remains. 2. Run node .agentplane/policy/check-routing.mjs. Expected: pass. 3. Run ap doctor. Expected: pass. 4. Run git diff --check and check final status. Expected: only intentional documentation and task changes.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-23T16:48:42.433Z — VERIFY — ok

By: DOCS

Note: Declared documentation checks passed: recovery package removed, exclusion recorded, policy routing and doctor OK, formatting and diff checks clean; mapping schema validates 43 verified and two approved exceptions. Full inventory evidence resolution remains blocked by pre-existing unrelated primary-save markers recorded in Findings.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T16:47:48.557Z, excerpt_hash=sha256:0d9eb1935fc25debcec8811f340f382d0ca797ce2e3759e15e2ab1b0b1452bd9

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609231642-874Q7B/blueprint/resolved-snapshot.json
- old_digest: 3d2ef77f2fea057d4563e69868fb718c44928b44caf28c90ba9a40db6782a629
- current_digest: 3d2ef77f2fea057d4563e69868fb718c44928b44caf28c90ba9a40db6782a629
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609231642-874Q7B

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609231642-874Q7B
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Command: node .agentplane/policy/check-routing.mjs; Result: pass; Evidence: policy routing OK; Scope: repository routing. Links: docs/program/vite-office-upstream-parity-plan.md.
Command: ap doctor; Result: pass; Evidence: doctor (OK), with pre-existing hook and historical-task warnings; Scope: AgentPlane workflow.
Command: ./node_modules/.bin/prettier --check docs/program/autosave-recovery.md docs/program/document-lifecycle.md docs/program/parity-matrix.md docs/program/vite-office-upstream-parity-plan.md docs/program/parity/writer-command-slice.json; Result: pass; Evidence: all matched files use Prettier code style; Scope: changed program docs and capability mapping.
Command: parseParityMappingManifest on writer-command-slice.json; Result: pass; Evidence: 43 verified and 2 exception-approved records; Scope: mapping schema and disposition.
Command: git diff --check; Result: pass; Evidence: no whitespace errors; Scope: final diff.
Command: npm run inventory:parity; Result: fail; Evidence: pre-existing CAP-0131 and CAP-0132 references to absent docsh.ts MarkHistoryMutation marker, present in HEAD before this task; Scope: complete parity evidence resolution. Resolution: leave unrelated primary-save records for a separate mapping repair. This failure does not change the recovery exclusion decision.
