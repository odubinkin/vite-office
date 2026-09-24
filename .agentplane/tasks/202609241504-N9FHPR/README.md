---
id: "202609241504-N9FHPR"
title: "Add upstream ODT fixture tests to certification plan"
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
  updated_at: "2026-09-24T15:05:01.179Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-24T15:08:25.805Z"
  updated_by: "DOCS"
  note: "Updated plan requires phase-mapped pinned upstream ODT fixture tests with semantic round trips, provenance, diagnostic assertions, and separate UI tests; paths and docs checks pass."
  attempts: 0
commit: null
comments:
  -
    author: "DOCS"
    body: "Start: document upstream ODT fixture tests for each planned feature phase."
events:
  -
    type: "status"
    at: "2026-09-24T15:05:15.023Z"
    author: "DOCS"
    from: "TODO"
    to: "DOING"
    note: "Start: document upstream ODT fixture tests for each planned feature phase."
  -
    type: "verify"
    at: "2026-09-24T15:08:25.805Z"
    author: "DOCS"
    state: "ok"
    note: "Updated plan requires phase-mapped pinned upstream ODT fixture tests with semantic round trips, provenance, diagnostic assertions, and separate UI tests; paths and docs checks pass."
doc_version: 3
doc_updated_at: "2026-09-24T15:08:25.884Z"
doc_updated_by: "DOCS"
description: "Update the certification ODT implementation plan so every new feature phase requires tests on pinned upstream ODT files, aligned with existing fixture-test patterns and provenance rules."
sections:
  Summary: |-
    Add upstream ODT fixture tests to certification plan

    Update the certification ODT implementation plan so every new feature phase requires tests on pinned upstream ODT files, aligned with existing fixture-test patterns and provenance rules.
  Scope: |-
    - In scope: Update the certification ODT implementation plan so every new feature phase requires tests on pinned upstream ODT files, aligned with existing fixture-test patterns and provenance rules.
    - Out of scope: unrelated refactors not required for "Add upstream ODT fixture tests to certification plan".
  Plan: "1. Inspect the existing pinned LibreOffice ODT fixture tests and relevant upstream fixture/source pairs. 2. Amend docs/program/certification-odt-import-plan.md with a per-phase upstream ODT test requirement, concrete candidate files, source-test mapping, import and round-trip assertions, and UI-test complement. 3. Preserve fixture provenance/privacy rules, validate paths/links and documentation policy, record verification, and close this docs-only task."
  Verify Steps: "1. Confirm the certification plan requires a real pinned LibreOffice ODT fixture test for every behavior phase, in addition to synthetic and UI tests. 2. Confirm all named candidate fixture paths and cited upstream source tests exist in the pinned checkout; confirm the existing local fixture-test pattern is accurately described. 3. Confirm the plan requires semantic import/export/reimport assertions, warning checks, provenance review, and CI-safe tracked fixtures. 4. Run relative-link/path checks, node .agentplane/policy/check-routing.mjs, ap doctor, and git diff --check. 5. Record verification and ensure only the approved documentation and task artifacts changed."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T15:08:25.805Z — VERIFY — ok

    By: DOCS

    Note: Updated plan requires phase-mapped pinned upstream ODT fixture tests with semantic round trips, provenance, diagnostic assertions, and separate UI tests; paths and docs checks pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T15:08:10.838Z, excerpt_hash=sha256:c79ad7a2735a7a8dd31c1f4dadd77c2820a262369e7d8a100e25baffca9c618f

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241504-N9FHPR/blueprint/resolved-snapshot.json
    - old_digest: 756380676220f8c30229b50a9ba7098c66a848741394a6b7d7cbc0bc19623ab6
    - current_digest: 756380676220f8c30229b50a9ba7098c66a848741394a6b7d7cbc0bc19623ab6
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241504-N9FHPR

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609241504-N9FHPR
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
    - Command: Python relative-link and pinned-fixture path check. Result: pass. Evidence: three links resolve, eleven explicitly named upstream ODT paths exist, and all seven phase rows are present. Scope: docs/program/certification-odt-import-plan.md. Links: docs/program/test-strategy.md and scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts.
    - Command: source-reference inspection with rg under vendor/libreoffice-reference/sw/qa. Result: pass. Evidence: the named source test files reference the selected bookmark, hyperlink, soft page-break, font, table, page and baseline fixtures; tdf94882.odt contains text:soft-page-break. Scope: candidate fixture matrix. Links: pinned LibreOffice checkout at the documented baseline.
    - Command: node .agentplane/policy/check-routing.mjs. Result: pass. Evidence: policy routing OK. Scope: docs workflow. Links: AGENTS.md.
    - Command: ap doctor. Result: pass. Evidence: doctor OK, with two pre-existing warnings unrelated to this docs change. Scope: repository workflow. Links: .agentplane/WORKFLOW.md.
    - Command: git diff --check. Result: pass. Evidence: no whitespace errors. Scope: changed plan and task README. Links: docs/program/certification-odt-import-plan.md.
    - Command: git status --short --untracked-files=all. Result: pass. Evidence: only the task README and approved plan document are modified. Scope: current task. Links: this task README.
id_source: "generated"
---
## Summary

Add upstream ODT fixture tests to certification plan

Update the certification ODT implementation plan so every new feature phase requires tests on pinned upstream ODT files, aligned with existing fixture-test patterns and provenance rules.

## Scope

- In scope: Update the certification ODT implementation plan so every new feature phase requires tests on pinned upstream ODT files, aligned with existing fixture-test patterns and provenance rules.
- Out of scope: unrelated refactors not required for "Add upstream ODT fixture tests to certification plan".

## Plan

1. Inspect the existing pinned LibreOffice ODT fixture tests and relevant upstream fixture/source pairs. 2. Amend docs/program/certification-odt-import-plan.md with a per-phase upstream ODT test requirement, concrete candidate files, source-test mapping, import and round-trip assertions, and UI-test complement. 3. Preserve fixture provenance/privacy rules, validate paths/links and documentation policy, record verification, and close this docs-only task.

## Verify Steps

1. Confirm the certification plan requires a real pinned LibreOffice ODT fixture test for every behavior phase, in addition to synthetic and UI tests. 2. Confirm all named candidate fixture paths and cited upstream source tests exist in the pinned checkout; confirm the existing local fixture-test pattern is accurately described. 3. Confirm the plan requires semantic import/export/reimport assertions, warning checks, provenance review, and CI-safe tracked fixtures. 4. Run relative-link/path checks, node .agentplane/policy/check-routing.mjs, ap doctor, and git diff --check. 5. Record verification and ensure only the approved documentation and task artifacts changed.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T15:08:25.805Z — VERIFY — ok

By: DOCS

Note: Updated plan requires phase-mapped pinned upstream ODT fixture tests with semantic round trips, provenance, diagnostic assertions, and separate UI tests; paths and docs checks pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T15:08:10.838Z, excerpt_hash=sha256:c79ad7a2735a7a8dd31c1f4dadd77c2820a262369e7d8a100e25baffca9c618f

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241504-N9FHPR/blueprint/resolved-snapshot.json
- old_digest: 756380676220f8c30229b50a9ba7098c66a848741394a6b7d7cbc0bc19623ab6
- current_digest: 756380676220f8c30229b50a9ba7098c66a848741394a6b7d7cbc0bc19623ab6
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241504-N9FHPR

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609241504-N9FHPR
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

- Command: Python relative-link and pinned-fixture path check. Result: pass. Evidence: three links resolve, eleven explicitly named upstream ODT paths exist, and all seven phase rows are present. Scope: docs/program/certification-odt-import-plan.md. Links: docs/program/test-strategy.md and scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts.
- Command: source-reference inspection with rg under vendor/libreoffice-reference/sw/qa. Result: pass. Evidence: the named source test files reference the selected bookmark, hyperlink, soft page-break, font, table, page and baseline fixtures; tdf94882.odt contains text:soft-page-break. Scope: candidate fixture matrix. Links: pinned LibreOffice checkout at the documented baseline.
- Command: node .agentplane/policy/check-routing.mjs. Result: pass. Evidence: policy routing OK. Scope: docs workflow. Links: AGENTS.md.
- Command: ap doctor. Result: pass. Evidence: doctor OK, with two pre-existing warnings unrelated to this docs change. Scope: repository workflow. Links: .agentplane/WORKFLOW.md.
- Command: git diff --check. Result: pass. Evidence: no whitespace errors. Scope: changed plan and task README. Links: docs/program/certification-odt-import-plan.md.
- Command: git status --short --untracked-files=all. Result: pass. Evidence: only the task README and approved plan document are modified. Scope: current task. Links: this task README.
