---
id: "202609211546-N289BQ"
title: "Complete Writer P1 parity remediation"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-21T15:46:55.053Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: correct the remaining Writer P1 shell responsibility and ODT parity-evidence gaps under the approved bounded scope."
events:
  -
    type: "status"
    at: "2026-09-21T15:47:00.270Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: correct the remaining Writer P1 shell responsibility and ODT parity-evidence gaps under the approved bounded scope."
doc_version: 3
doc_updated_at: "2026-09-21T15:47:00.270Z"
doc_updated_by: "CODER"
description: "Fix the remaining P1-2 responsibility decomposition and P1-6 ODT parity-evidence overclaim identified by review."
sections:
  Summary: "Complete the remaining Writer P1 remediation by enforcing honest atomic ODT parity evidence and moving Writer text/list/presentation responsibilities out of catch-all model and shell modules."
  Scope: "Downgrade the unsupported LO-WRITER-0130 umbrella parity claim; add contradiction coverage for unrelated evidence; move character/paragraph/list command behavior to the matching shell responsibility; move WriterTextRun projection/conversion out of SwTextNode where feasible while preserving canonical text and hints. No new Writer feature families, network access, schema migrations, or changes outside the approved Writer/parity/test scope. Expected maximum scope: 12 implementation, inventory, documentation, and test files."
  Plan: "Correct P1-6 parity evidence, complete P1-2 responsibility decomposition, preserve behavior, and verify the complete repository contract."
  Verify Steps: "1. Run targeted Vitest suites covering Writer shell dispatch, model editing, run projection, ODT round trips, and parity mappings. 2. Run npm run inventory:parity and confirm LO-WRITER-0130 is not counted as verified while atomic ODT gaps remain explicit. 3. Run npm run verify. 4. Run node .agentplane/policy/check-routing.mjs. 5. Run ap doctor. 6. Confirm git status --short --untracked-files=all contains only intentional task artifacts and implementation changes."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only commits attributed to task 202609211546-N289BQ to restore the previous shell ownership and parity records together."
  Findings: "No findings recorded yet."
id_source: "generated"
---
## Summary

Complete the remaining Writer P1 remediation by enforcing honest atomic ODT parity evidence and moving Writer text/list/presentation responsibilities out of catch-all model and shell modules.

## Scope

Downgrade the unsupported LO-WRITER-0130 umbrella parity claim; add contradiction coverage for unrelated evidence; move character/paragraph/list command behavior to the matching shell responsibility; move WriterTextRun projection/conversion out of SwTextNode where feasible while preserving canonical text and hints. No new Writer feature families, network access, schema migrations, or changes outside the approved Writer/parity/test scope. Expected maximum scope: 12 implementation, inventory, documentation, and test files.

## Plan

Correct P1-6 parity evidence, complete P1-2 responsibility decomposition, preserve behavior, and verify the complete repository contract.

## Verify Steps

1. Run targeted Vitest suites covering Writer shell dispatch, model editing, run projection, ODT round trips, and parity mappings. 2. Run npm run inventory:parity and confirm LO-WRITER-0130 is not counted as verified while atomic ODT gaps remain explicit. 3. Run npm run verify. 4. Run node .agentplane/policy/check-routing.mjs. 5. Run ap doctor. 6. Confirm git status --short --untracked-files=all contains only intentional task artifacts and implementation changes.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only commits attributed to task 202609211546-N289BQ to restore the previous shell ownership and parity records together.

## Findings

No findings recorded yet.
