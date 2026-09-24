---
id: "202609241135-RF2T8B"
title: "F3 Move Writer edit and transfer operations to upstream owners"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on:
  - "202609241135-WGR5X8"
tags:
  - "code"
  - "parity"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T12:01:59.326Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-24T12:16:21.302Z"
  updated_by: "CODER"
  note: "F3 model editing and transfer ownership now matches pinned Writer modules; full npm run verify passed with 100% coverage and 14 browser scenarios."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-24T12:16:48.797Z"
  updated_by: "EVALUATOR"
  note: "F3 moved hyperlink editing, paste orchestration, text-node projection and transfer DTO normalization to their pinned or explicit filter owners."
  evaluated_sha: "2fea3c136b0d379ae5219db1a42246ef0191df2a"
  blueprint_digest: "991bbd9eaf8b9eb21ea14fd2b5af4018679a95fbe79bc3377ef743d1d0d4b722"
  evidence_refs:
    - ".agentplane/tasks/202609241135-RF2T8B/README.md"
    - ".agentplane/tasks/202609241135-RF2T8B/quality/20260924-121648797-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609241135-RF2T8B/quality/20260924-121648797-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609241135-RF2T8B/quality/20260924-121648797-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609241135-RF2T8B/blueprint/resolved-snapshot.json"
    - "npm run verify: 482 office tests, 98 inventory tests, 14 browser tests, 100% coverage"
    - "apps/office/src/sw/source/core/edit/editsh.ts"
    - "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts"
  findings:
    - "All references and source records resolve to active files; source tree, type, lint, unit, browser, ODT and build checks pass."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement F3 ownership corrections against pinned Writer edit and transfer modules, preserving the browser boundary."
events:
  -
    type: "status"
    at: "2026-09-24T12:02:00.244Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement F3 ownership corrections against pinned Writer edit and transfer modules, preserving the browser boundary."
  -
    type: "verify"
    at: "2026-09-24T12:16:21.302Z"
    author: "CODER"
    state: "ok"
    note: "F3 model editing and transfer ownership now matches pinned Writer modules; full npm run verify passed with 100% coverage and 14 browser scenarios."
doc_version: 3
doc_updated_at: "2026-09-24T12:16:21.382Z"
doc_updated_by: "CODER"
description: "Implement F3: put edit and transfer logic under upstream-corresponding core/edit and uibase/dochdl owners; keep browser DTOs at boundaries."
sections:
  Summary: |-
    F3 Move Writer edit and transfer operations to upstream owners

    Implement F3: put edit and transfer logic under upstream-corresponding core/edit and uibase/dochdl owners; keep browser DTOs at boundaries.
  Scope: |-
    - In scope: Implement F3: put edit and transfer logic under upstream-corresponding core/edit and uibase/dochdl owners; keep browser DTOs at boundaries.
    - Out of scope: unrelated refactors not required for "F3 Move Writer edit and transfer operations to upstream owners".
  Plan: |-
    1. Trace F3 exports and imports to pinned ndtxt.cxx/ndhints.cxx, editsh.cxx and swdtflvr.cxx.
    2. Move ownership and boundary DTOs to the closest upstream or browser module; remove forwarding files after imports migrate.
    3. Update only existing provenance/inventory data, run focused and full checks, then record verification.
  Verify Steps: |-
    1. Hyperlink editing resolves to the core/edit editsh owner and transfer preparation/paste to uibase/dochdl swdtflvr; run DTO normalization lives in a browser boundary and filter DTOs sit with their producer/consumer.
    2. Existing hyperlink, clipboard, HTML and ODT tests plus focused boundary checks pass; source provenance and runtime inventory data match every moved export.
    3. npm run verify and git diff --check pass.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T12:16:21.302Z — VERIFY — ok

    By: CODER

    Note: F3 model editing and transfer ownership now matches pinned Writer modules; full npm run verify passed with 100% coverage and 14 browser scenarios.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T12:16:16.001Z, excerpt_hash=sha256:bfe67e36ed605b45f98ea0526d1ce116e685923215b381ab0f135a8179437bf7

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241135-RF2T8B/blueprint/resolved-snapshot.json
    - old_digest: 991bbd9eaf8b9eb21ea14fd2b5af4018679a95fbe79bc3377ef743d1d0d4b722
    - current_digest: 991bbd9eaf8b9eb21ea14fd2b5af4018679a95fbe79bc3377ef743d1d0d4b722
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241135-RF2T8B

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609241135-RF2T8B
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
    Command: npm run verify. Result: pass. Evidence: 482 office unit tests, 98 inventory tests, both coverage groups 100%, 14 browser tests, static build, source-tree, provenance and inventory gates passed. Scope: full F3 ownership and transfer refactor.
    Command: npm exec --workspace @vite-office/office -- vitest run src/sw/source/uibase/dochdl/swdtflvr.test.ts src/sw/source/uibase/wrtsh/wrtsh-transfer.test.ts src/sw/source/uibase/wrtsh/wrtsh.test.ts src/sw/source/core/txtnode/ndtxt.test.ts src/sw/browser/filter/html. Result: pass. Evidence: 28 focused tests. Scope: clipboard, hyperlink, HTML and text-run behavior.
    Command: git diff --check; node .agentplane/policy/check-routing.mjs. Result: pass. Evidence: no whitespace errors; routing OK. Scope: task diff and source-tree path data.
id_source: "generated"
---
## Summary

F3 Move Writer edit and transfer operations to upstream owners

Implement F3: put edit and transfer logic under upstream-corresponding core/edit and uibase/dochdl owners; keep browser DTOs at boundaries.

## Scope

- In scope: Implement F3: put edit and transfer logic under upstream-corresponding core/edit and uibase/dochdl owners; keep browser DTOs at boundaries.
- Out of scope: unrelated refactors not required for "F3 Move Writer edit and transfer operations to upstream owners".

## Plan

1. Trace F3 exports and imports to pinned ndtxt.cxx/ndhints.cxx, editsh.cxx and swdtflvr.cxx.
2. Move ownership and boundary DTOs to the closest upstream or browser module; remove forwarding files after imports migrate.
3. Update only existing provenance/inventory data, run focused and full checks, then record verification.

## Verify Steps

1. Hyperlink editing resolves to the core/edit editsh owner and transfer preparation/paste to uibase/dochdl swdtflvr; run DTO normalization lives in a browser boundary and filter DTOs sit with their producer/consumer.
2. Existing hyperlink, clipboard, HTML and ODT tests plus focused boundary checks pass; source provenance and runtime inventory data match every moved export.
3. npm run verify and git diff --check pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T12:16:21.302Z — VERIFY — ok

By: CODER

Note: F3 model editing and transfer ownership now matches pinned Writer modules; full npm run verify passed with 100% coverage and 14 browser scenarios.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T12:16:16.001Z, excerpt_hash=sha256:bfe67e36ed605b45f98ea0526d1ce116e685923215b381ab0f135a8179437bf7

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241135-RF2T8B/blueprint/resolved-snapshot.json
- old_digest: 991bbd9eaf8b9eb21ea14fd2b5af4018679a95fbe79bc3377ef743d1d0d4b722
- current_digest: 991bbd9eaf8b9eb21ea14fd2b5af4018679a95fbe79bc3377ef743d1d0d4b722
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241135-RF2T8B

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609241135-RF2T8B
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

Command: npm run verify. Result: pass. Evidence: 482 office unit tests, 98 inventory tests, both coverage groups 100%, 14 browser tests, static build, source-tree, provenance and inventory gates passed. Scope: full F3 ownership and transfer refactor.
Command: npm exec --workspace @vite-office/office -- vitest run src/sw/source/uibase/dochdl/swdtflvr.test.ts src/sw/source/uibase/wrtsh/wrtsh-transfer.test.ts src/sw/source/uibase/wrtsh/wrtsh.test.ts src/sw/source/core/txtnode/ndtxt.test.ts src/sw/browser/filter/html. Result: pass. Evidence: 28 focused tests. Scope: clipboard, hyperlink, HTML and text-run behavior.
Command: git diff --check; node .agentplane/policy/check-routing.mjs. Result: pass. Evidence: no whitespace errors; routing OK. Scope: task diff and source-tree path data.
