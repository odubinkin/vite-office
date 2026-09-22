---
id: "202609221113-N9GZ47"
title: "Remove browser document recovery mechanism"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-22T11:14:15.952Z"
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
    body: "Start: remove recovery only; preserve IndexedDB primary document storage and all other persistence."
events:
  -
    type: "status"
    at: "2026-09-22T11:14:21.815Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: remove recovery only; preserve IndexedDB primary document storage and all other persistence."
doc_version: 3
doc_updated_at: "2026-09-22T11:14:21.815Z"
doc_updated_by: "CODER"
description: "Remove only the browser document-recovery mechanism (recovery scheduling, candidate persistence/restore, recovery UI, lifecycle APIs, and tests). Preserve existing IndexedDB document storage and all non-recovery persistence paths. Record the intentional, durable decision not to implement recovery because frequent full autosave will be the future browser strategy."
sections:
  Summary: |-
    Remove browser document recovery mechanism

    Remove only the browser document-recovery mechanism (recovery scheduling, candidate persistence/restore, recovery UI, lifecycle APIs, and tests). Preserve existing IndexedDB document storage and all non-recovery persistence paths. Record the intentional, durable decision not to implement recovery because frequent full autosave will be the future browser strategy.
  Scope: |-
    - In scope: delete browser recovery scheduling, recovery candidates and restore/discard flow, recovery-only lifecycle state/APIs, recovery UI, and their tests.
    - Preserve: IndexedDB primary document storage; normal document load/save; all non-recovery persistence and browser mechanisms.
    - Do not implement or redesign autosave in this task.
    - Documentation/inventory must state that browser recovery is intentionally unsupported and must not be reintroduced; frequent full autosave is the planned future strategy.
  Plan: |-
    1. Identify and remove recovery-only modules, browser composition wiring, recovery lifecycle APIs, and recovery UI/tests.
    2. Preserve IndexedDB primary document storage, loading, saving, and all non-recovery browser persistence behavior; do not redesign autosave in this task.
    3. Update documentation and runtime inventory with an explicit permanent product decision: browser recovery is intentionally unsupported and must not be reintroduced; frequent full autosave is the planned future protection strategy.
    4. Run focused tests plus inventory validation and repository verification; record evidence.
  Verify Steps: |-
    1. Run focused recovery/storage/composition tests and TypeScript checks for touched modules. Expected: recovery code is absent and remaining primary IndexedDB save/load behavior passes.
    2. Run the inventory validation that reads runtime-inventory.json. Expected: the inventory explicitly classifies recovery as intentionally unsupported/deferred and no active recovery implementation claim remains.
    3. Run npm run verify. Expected: repository verification passes.
    4. Run ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check, and git status --short --untracked-files=all. Expected: policy, whitespace, and task state checks pass; only intended task artifacts and changes remain.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Remove browser document recovery mechanism

Remove only the browser document-recovery mechanism (recovery scheduling, candidate persistence/restore, recovery UI, lifecycle APIs, and tests). Preserve existing IndexedDB document storage and all non-recovery persistence paths. Record the intentional, durable decision not to implement recovery because frequent full autosave will be the future browser strategy.

## Scope

- In scope: delete browser recovery scheduling, recovery candidates and restore/discard flow, recovery-only lifecycle state/APIs, recovery UI, and their tests.
- Preserve: IndexedDB primary document storage; normal document load/save; all non-recovery persistence and browser mechanisms.
- Do not implement or redesign autosave in this task.
- Documentation/inventory must state that browser recovery is intentionally unsupported and must not be reintroduced; frequent full autosave is the planned future strategy.

## Plan

1. Identify and remove recovery-only modules, browser composition wiring, recovery lifecycle APIs, and recovery UI/tests.
2. Preserve IndexedDB primary document storage, loading, saving, and all non-recovery browser persistence behavior; do not redesign autosave in this task.
3. Update documentation and runtime inventory with an explicit permanent product decision: browser recovery is intentionally unsupported and must not be reintroduced; frequent full autosave is the planned future protection strategy.
4. Run focused tests plus inventory validation and repository verification; record evidence.

## Verify Steps

1. Run focused recovery/storage/composition tests and TypeScript checks for touched modules. Expected: recovery code is absent and remaining primary IndexedDB save/load behavior passes.
2. Run the inventory validation that reads runtime-inventory.json. Expected: the inventory explicitly classifies recovery as intentionally unsupported/deferred and no active recovery implementation claim remains.
3. Run npm run verify. Expected: repository verification passes.
4. Run ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check, and git status --short --untracked-files=all. Expected: policy, whitespace, and task state checks pass; only intended task artifacts and changes remain.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
