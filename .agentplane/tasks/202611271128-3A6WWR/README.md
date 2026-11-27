---
id: "202611271128-3A6WWR"
title: "Verify the native Calc Styles menu in compact browser layouts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "verification"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T11:28:23.933Z"
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
    body: "Start: verify the pinned Calc Styles root through the existing menu overflow scenarios."
events:
  -
    type: "status"
    at: "2026-11-27T11:28:24.741Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: verify the pinned Calc Styles root through the existing menu overflow scenarios."
doc_version: 3
doc_updated_at: "2026-11-27T11:28:24.741Z"
doc_updated_by: "CODER"
description: "Update the existing menu overflow acceptance to include the Calc Styles root from the pinned resource and verify all original desktop and compact menu reachability scenarios."
sections:
  Summary: |-
    Verify the native Calc Styles menu in compact browser layouts

    Update the existing menu overflow acceptance to include the Calc Styles root from the pinned resource and verify all original desktop and compact menu reachability scenarios.
  Scope: |-
    - In scope: Update the existing menu overflow acceptance to include the Calc Styles root from the pinned resource and verify all original desktop and compact menu reachability scenarios.
    - Out of scope: unrelated refactors not required for "Verify the native Calc Styles menu in compact browser layouts".
  Plan: "1. Compare the failure traces with the pinned Calc menubar root order. 2. Add the original Styles root to the expected Calc menu list. 3. Replay Writer and Calc at all existing widths and record evidence."
  Verify Steps: "Replay all five existing shared menubar scenarios on the checkpoint production build. Retain exact suffix ordering, reachability, keyboard and focus behavior, viewport fit and accessibility. Run focused lint, formatting and git diff checks."
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

Verify the native Calc Styles menu in compact browser layouts

Update the existing menu overflow acceptance to include the Calc Styles root from the pinned resource and verify all original desktop and compact menu reachability scenarios.

## Scope

- In scope: Update the existing menu overflow acceptance to include the Calc Styles root from the pinned resource and verify all original desktop and compact menu reachability scenarios.
- Out of scope: unrelated refactors not required for "Verify the native Calc Styles menu in compact browser layouts".

## Plan

1. Compare the failure traces with the pinned Calc menubar root order. 2. Add the original Styles root to the expected Calc menu list. 3. Replay Writer and Calc at all existing widths and record evidence.

## Verify Steps

Replay all five existing shared menubar scenarios on the checkpoint production build. Retain exact suffix ordering, reachability, keyboard and focus behavior, viewport fit and accessibility. Run focused lint, formatting and git diff checks.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
