---
id: "202611270634-7V3FEC"
title: "Complete Calc user-defined number format administration"
status: "DOING"
priority: "med"
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
doc_updated_at: "2026-11-27T07:05:04.620Z"
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
  Findings: |-
    The native Format Code group now uses the actual shared add, remove and selected comment paths. The original typed SvxNumberInfoItem carries the removal keys. XML number:title stores and restores the accepted comment when the assigned number style is exported and reopened. CALC-850 records the pinned two-list cancellation asymmetries and the focused shell tests retain them.

    Command: Office Vitest Calc Format Cells, Number Format and ODS suites plus the shared number-format shell, formatter-entry and picture suites. Result: 59 selected cases passed across the original run and the exact rerun. The first run found an incorrect assumption about an accepted quoted code and a cancellation assertion that ran before asynchronous cleanup. Both corrected cases passed on the exact rerun, along with the successful ODS comment reopen case.

    Commands: changed-source ESLint and Prettier, module boundaries, source tree, scoped provenance, AgentPlane routing and doctor. Result: pass. Global provenance and Calc/shared registry still stop on their already missing integrated Writer/shared ODF markers. No catalog or dialog change caused those inherited failures.
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

The native Format Code group now uses the actual shared add, remove and selected comment paths. The original typed SvxNumberInfoItem carries the removal keys. XML number:title stores and restores the accepted comment when the assigned number style is exported and reopened. CALC-850 records the pinned two-list cancellation asymmetries and the focused shell tests retain them.

Command: Office Vitest Calc Format Cells, Number Format and ODS suites plus the shared number-format shell, formatter-entry and picture suites. Result: 59 selected cases passed across the original run and the exact rerun. The first run found an incorrect assumption about an accepted quoted code and a cancellation assertion that ran before asynchronous cleanup. Both corrected cases passed on the exact rerun, along with the successful ODS comment reopen case.

Commands: changed-source ESLint and Prettier, module boundaries, source tree, scoped provenance, AgentPlane routing and doctor. Result: pass. Global provenance and Calc/shared registry still stop on their already missing integrated Writer/shared ODF markers. No catalog or dialog change caused those inherited failures.
