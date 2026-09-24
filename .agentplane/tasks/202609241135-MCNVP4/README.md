---
id: "202609241135-MCNVP4"
title: "F6 Resolve source identity and filename divergences"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on:
  - "202609241135-JV2933"
tags:
  - "code"
  - "parity"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T12:30:24.133Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-24T12:43:14.242Z"
  updated_by: "CODER"
  note: "All remaining source identity divergences audited; renamed, relocated, or documented with concrete constraints. Full npm run verify and git diff --check passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-24T12:43:32.917Z"
  updated_by: "EVALUATOR"
  note: "F6 source identity audit and filename alignment verified."
  evaluated_sha: "34c8be798f5c12f265d41b012855f8cf22236478"
  blueprint_digest: "1f1bab0576a9d6045480daa586fd7effe898a31d0fe79f7d0f36fb48b5db21b7"
  evidence_refs:
    - ".agentplane/tasks/202609241135-MCNVP4/README.md"
    - ".agentplane/tasks/202609241135-MCNVP4/quality/20260924-124332917-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609241135-MCNVP4/quality/20260924-124332917-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609241135-MCNVP4/quality/20260924-124332917-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609241135-MCNVP4/blueprint/resolved-snapshot.json"
    - "docs/program/source-provenance.json"
    - "apps/office/src/sw/source/core/crsr/pam.ts"
    - "apps/office/src/sw/source/core/undo/undobj.ts"
  findings:
    - "Eleven historical filenames aligned to upstream, retired selection helper dissolved into core owners, false source mappings corrected, and five explicit constraints retained. Full verify passed."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: audit and resolve all remaining filename/source identity divergences."
events:
  -
    type: "status"
    at: "2026-09-24T12:30:30.795Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: audit and resolve all remaining filename/source identity divergences."
  -
    type: "verify"
    at: "2026-09-24T12:43:14.242Z"
    author: "CODER"
    state: "ok"
    note: "All remaining source identity divergences audited; renamed, relocated, or documented with concrete constraints. Full npm run verify and git diff --check passed."
doc_version: 3
doc_updated_at: "2026-09-24T12:43:14.323Z"
doc_updated_by: "CODER"
description: "Implement F6: review all 20 source-provenance filename divergences and fix ownership or record concrete browser/TypeScript necessity."
sections:
  Summary: |-
    F6 Resolve source identity and filename divergences

    Implement F6: review all 20 source-provenance filename divergences and fix ownership or record concrete browser/TypeScript necessity.
  Scope: |-
    - In scope: Implement F6: review all 20 source-provenance filename divergences and fix ownership or record concrete browser/TypeScript necessity.
    - Out of scope: unrelated refactors not required for "F6 Resolve source identity and filename divergences".
  Plan: "Audit all 17 remaining filename divergence entries after F1/F3/F4. Rename mechanically safe mismatches to pinned upstream filenames and move browser-only dialog adaptation to browser ownership. Preserve intentional generated-resource and TypeScript decomposition exceptions only with concrete rationale tied to actual module composition or generated files. Update imports, tests, source provenance and inventory data, then run focused and full verification."
  Verify Steps: "1. Review every current filenameDivergences entry against its pinned upstream source and current implementation. Rename or move files when there is no concrete stack constraint; retain only specific documented browser, generated resource, or TypeScript decomposition exceptions. No compatibility wrapper solely for an old path. 2. Update exact source provenance, runtime inventory, source tree, and all imports for active ownership; confirm no stale retired paths remain. 3. Run focused tests for touched modules, npm run verify, and git diff --check."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T12:43:14.242Z — VERIFY — ok

    By: CODER

    Note: All remaining source identity divergences audited; renamed, relocated, or documented with concrete constraints. Full npm run verify and git diff --check passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T12:43:07.829Z, excerpt_hash=sha256:901580716e75e40e4c85dace4038bb8b7bae14dba4d61eaeac5fcd2c50be7c73

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241135-MCNVP4/blueprint/resolved-snapshot.json
    - old_digest: 1f1bab0576a9d6045480daa586fd7effe898a31d0fe79f7d0f36fb48b5db21b7
    - current_digest: 1f1bab0576a9d6045480daa586fd7effe898a31d0fe79f7d0f36fb48b5db21b7
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241135-MCNVP4

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609241135-MCNVP4
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
  Findings: "Audited all 17 filename divergence records. Eleven historical names were replaced with pinned upstream basenames; retired select.ts was removed by placing cursor-range logic in core/crsr/pam.ts, undo cursor snapshots in core/undo/undobj.ts, and IME state in wrtsh1.ts. Two composite modules (WriterDialogController and SwViewCommandShell) were reclassified local-only rather than claiming unrelated upstream source owners. Five remaining filename exceptions now document concrete injected-device, TypeScript-port, or generated-resource constraints. Imports, E2E and fixture tests, source-tree, provenance, runtime inventory and command-slice evidence were updated. Focused tests: 40 and 41 passed. npm run verify passed: 482 office tests, 98 inventory tests, 14 E2E tests, 100% coverage in both suites, static build and all gates. git diff --check passed. No network used."
id_source: "generated"
---
## Summary

F6 Resolve source identity and filename divergences

Implement F6: review all 20 source-provenance filename divergences and fix ownership or record concrete browser/TypeScript necessity.

## Scope

- In scope: Implement F6: review all 20 source-provenance filename divergences and fix ownership or record concrete browser/TypeScript necessity.
- Out of scope: unrelated refactors not required for "F6 Resolve source identity and filename divergences".

## Plan

Audit all 17 remaining filename divergence entries after F1/F3/F4. Rename mechanically safe mismatches to pinned upstream filenames and move browser-only dialog adaptation to browser ownership. Preserve intentional generated-resource and TypeScript decomposition exceptions only with concrete rationale tied to actual module composition or generated files. Update imports, tests, source provenance and inventory data, then run focused and full verification.

## Verify Steps

1. Review every current filenameDivergences entry against its pinned upstream source and current implementation. Rename or move files when there is no concrete stack constraint; retain only specific documented browser, generated resource, or TypeScript decomposition exceptions. No compatibility wrapper solely for an old path. 2. Update exact source provenance, runtime inventory, source tree, and all imports for active ownership; confirm no stale retired paths remain. 3. Run focused tests for touched modules, npm run verify, and git diff --check.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T12:43:14.242Z — VERIFY — ok

By: CODER

Note: All remaining source identity divergences audited; renamed, relocated, or documented with concrete constraints. Full npm run verify and git diff --check passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T12:43:07.829Z, excerpt_hash=sha256:901580716e75e40e4c85dace4038bb8b7bae14dba4d61eaeac5fcd2c50be7c73

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241135-MCNVP4/blueprint/resolved-snapshot.json
- old_digest: 1f1bab0576a9d6045480daa586fd7effe898a31d0fe79f7d0f36fb48b5db21b7
- current_digest: 1f1bab0576a9d6045480daa586fd7effe898a31d0fe79f7d0f36fb48b5db21b7
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241135-MCNVP4

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609241135-MCNVP4
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

Audited all 17 filename divergence records. Eleven historical names were replaced with pinned upstream basenames; retired select.ts was removed by placing cursor-range logic in core/crsr/pam.ts, undo cursor snapshots in core/undo/undobj.ts, and IME state in wrtsh1.ts. Two composite modules (WriterDialogController and SwViewCommandShell) were reclassified local-only rather than claiming unrelated upstream source owners. Five remaining filename exceptions now document concrete injected-device, TypeScript-port, or generated-resource constraints. Imports, E2E and fixture tests, source-tree, provenance, runtime inventory and command-slice evidence were updated. Focused tests: 40 and 41 passed. npm run verify passed: 482 office tests, 98 inventory tests, 14 E2E tests, 100% coverage in both suites, static build and all gates. git diff --check passed. No network used.
