---
id: "202611270634-7V3FEC"
title: "Complete Calc user-defined number format administration"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T06:35:07.447Z"
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
    body: "Start: Connect the original user-format actions and typed formatter update in Calc Format Cells."
events:
  -
    type: "status"
    at: "2026-11-27T06:35:08.181Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect the original user-format actions and typed formatter update in Calc Format Cells."
doc_version: 3
doc_updated_at: "2026-11-27T06:35:08.181Z"
doc_updated_by: "CODER"
description: "Connect the pinned Add, Edit Comment and Remove controls, shared number-format shell lifecycle and original Calc formatter update exchange. Preserve native cancellation, accepted actions and inherited styles."
sections:
  Summary: "Connect the complete user-format control group in Calc Format Cells to the pinned shared formatter and its typed update payload."
  Scope: "Implement the consumed SvNumberFormatter DeleteEntry, the SvxNumberFormatShell add/remove/comment lifecycle, the SvxNumberInfoItem output carrier, the browser Format Code action group, and Calc application of deleted keys before cell attributes. Keep the existing isolated unsubmitted preview, accepted picture validation and primary storage and recovery behavior. Document suspected pinned lifecycle anomalies with exact retention."
  Plan: "Port the source number-format catalog lifecycle, original three controls, typed deletion update and focused verification."
  Verify Steps: |-
    - Run targeted Calc Format Cells and Number Format tests plus the shared number-format shell and formatter suites. Cover explicit Add and Remove, built-in controls, comments, Cancel, accepted group, and invalid code.
    - Run Office typecheck, changed-source ESLint and Prettier, dependencies, source tree, provenance and registry. Preserve existing integrated gate diagnostics where they apply.
  Verification: "Pending execution."
  Rollback Plan: "Revert the scoped UI, item and formatter changes."
  Findings: "Native spelling and placement come from numberingformatpage.ui. The formatter session maintains its add and remove lists separately; native output carries deleted keys via SID_ATTR_NUMBERFORMAT_INFO."
id_source: "generated"
---
## Summary

Connect the complete user-format control group in Calc Format Cells to the pinned shared formatter and its typed update payload.

## Scope

Implement the consumed SvNumberFormatter DeleteEntry, the SvxNumberFormatShell add/remove/comment lifecycle, the SvxNumberInfoItem output carrier, the browser Format Code action group, and Calc application of deleted keys before cell attributes. Keep the existing isolated unsubmitted preview, accepted picture validation and primary storage and recovery behavior. Document suspected pinned lifecycle anomalies with exact retention.

## Plan

Port the source number-format catalog lifecycle, original three controls, typed deletion update and focused verification.

## Verify Steps

- Run targeted Calc Format Cells and Number Format tests plus the shared number-format shell and formatter suites. Cover explicit Add and Remove, built-in controls, comments, Cancel, accepted group, and invalid code.
- Run Office typecheck, changed-source ESLint and Prettier, dependencies, source tree, provenance and registry. Preserve existing integrated gate diagnostics where they apply.

## Verification

Pending execution.

## Rollback Plan

Revert the scoped UI, item and formatter changes.

## Findings

Native spelling and placement come from numberingformatpage.ui. The formatter session maintains its add and remove lists separately; native output carries deleted keys via SID_ATTR_NUMBERFORMAT_INFO.
