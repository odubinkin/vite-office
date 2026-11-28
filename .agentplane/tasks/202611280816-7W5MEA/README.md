---
id: "202611280816-7W5MEA"
title: "Align Calc ODS row styles and height scheduling"
result_summary: "Aligned native ODS row style ownership, saved row sizing and selected height updates."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T08:16:33.912Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-28T08:22:14.345Z"
  updated_by: "CODER"
  note: "Twelve related Calc tests passed, including the original row-height-import ODS, row background with explicit cell override and native row height core. TypeScript, lint, formatting, dependencies, provenance and zero Calc parity violations passed. No full suite."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-28T08:22:14.802Z"
  updated_by: "EVALUATOR"
  note: "ODS row styles and native selected-height update verified."
  evaluated_sha: "b2b3eee89c7a76198e14df97cdf872822e66ab59"
  blueprint_digest: "f86caf2aeed8d95490ec208241a91a2698ed053872f4c245188d8de34ee4077c"
  evidence_refs:
    - ".agentplane/tasks/202611280816-7W5MEA/README.md"
    - ".agentplane/tasks/202611280816-7W5MEA/quality/20261128-082214802-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611280816-7W5MEA/quality/20261128-082214802-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611280816-7W5MEA/quality/20261128-082214802-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611280816-7W5MEA/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-next-checkpoint/calc-ods-row-styles-verification.md"
  findings:
    - "Original manual and automatic row settings survive ODS and imported row backgrounds become actual cell patterns."
commit:
  hash: "b2b3eee89c7a76198e14df97cdf872822e66ab59"
  message: "🧩 7W5MEA calc: align ODS row styles and height scheduling"
comments:
  -
    author: "CODER"
    body: "Start: align ODS row-style properties, native cell-pattern routing, and the bounded saved-height recalculation pass."
  -
    author: "CODER"
    body: "Verified: twelve related Calc tests and associated static checks."
events:
  -
    type: "status"
    at: "2026-11-28T08:16:35.431Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align ODS row-style properties, native cell-pattern routing, and the bounded saved-height recalculation pass."
  -
    type: "verify"
    at: "2026-11-28T08:22:14.345Z"
    author: "CODER"
    state: "ok"
    note: "Twelve related Calc tests passed, including the original row-height-import ODS, row background with explicit cell override and native row height core. TypeScript, lint, formatting, dependencies, provenance and zero Calc parity violations passed. No full suite."
  -
    type: "status"
    at: "2026-11-28T08:23:37.778Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: twelve related Calc tests and associated static checks."
doc_version: 3
doc_updated_at: "2026-11-28T08:23:37.779Z"
doc_updated_by: "CODER"
description: "Port the pinned row-property mapping, saved and calculated height scheduling, and imported row cell backgrounds into their native Calc owners. Verify original row-height fixtures and the affected ODS geometry and style modules."
sections:
  Summary: |-
    Align Calc ODS row styles and height scheduling

    Port the pinned row-property mapping, saved and calculated height scheduling, and imported row cell backgrounds into their native Calc owners. Verify original row-height fixtures and the affected ODS geometry and style modules.
  Scope: |-
    - In scope: Port the pinned row-property mapping, saved and calculated height scheduling, and imported row cell backgrounds into their native Calc owners. Verify original row-height fixtures and the affected ODS geometry and style modules.
    - Out of scope: unrelated refactors not required for "Align Calc ODS row styles and height scheduling".
  Plan: "Read pinned XML row contexts and property mappers, UNO row geometry and ScDocRowHeightUpdater. Port row scope background and theme color into native cell patterns, convert saved row sizes through native UNO units, and move the selected-row height pass to the native document iterator owner. Preserve represented headless sizing and row geometry outside its supported scope. Use original row-height ODS fixtures and related Calc filter and row-core tests only. No full suite."
  Verify Steps: |-
    PLANNER fallback scaffold for "Align Calc ODS row styles and height scheduling". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Align Calc ODS row styles and height scheduling". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-28T08:22:14.345Z — VERIFY — ok

    By: CODER

    Note: Twelve related Calc tests passed, including the original row-height-import ODS, row background with explicit cell override and native row height core. TypeScript, lint, formatting, dependencies, provenance and zero Calc parity violations passed. No full suite.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T08:16:35.431Z, excerpt_hash=sha256:b31f44cbeb435fe4dbace7efb35e1bc1d5a3cd0b7d9c2de3a84ef24c93703b5d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611280816-7W5MEA/blueprint/resolved-snapshot.json
    - old_digest: f86caf2aeed8d95490ec208241a91a2698ed053872f4c245188d8de34ee4077c
    - current_digest: f86caf2aeed8d95490ec208241a91a2698ed053872f4c245188d8de34ee4077c
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611280816-7W5MEA

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611280816-7W5MEA
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
  Findings: ""
id_source: "generated"
---
## Summary

Align Calc ODS row styles and height scheduling

Port the pinned row-property mapping, saved and calculated height scheduling, and imported row cell backgrounds into their native Calc owners. Verify original row-height fixtures and the affected ODS geometry and style modules.

## Scope

- In scope: Port the pinned row-property mapping, saved and calculated height scheduling, and imported row cell backgrounds into their native Calc owners. Verify original row-height fixtures and the affected ODS geometry and style modules.
- Out of scope: unrelated refactors not required for "Align Calc ODS row styles and height scheduling".

## Plan

Read pinned XML row contexts and property mappers, UNO row geometry and ScDocRowHeightUpdater. Port row scope background and theme color into native cell patterns, convert saved row sizes through native UNO units, and move the selected-row height pass to the native document iterator owner. Preserve represented headless sizing and row geometry outside its supported scope. Use original row-height ODS fixtures and related Calc filter and row-core tests only. No full suite.

## Verify Steps

PLANNER fallback scaffold for "Align Calc ODS row styles and height scheduling". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Align Calc ODS row styles and height scheduling". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-28T08:22:14.345Z — VERIFY — ok

By: CODER

Note: Twelve related Calc tests passed, including the original row-height-import ODS, row background with explicit cell override and native row height core. TypeScript, lint, formatting, dependencies, provenance and zero Calc parity violations passed. No full suite.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T08:16:35.431Z, excerpt_hash=sha256:b31f44cbeb435fe4dbace7efb35e1bc1d5a3cd0b7d9c2de3a84ef24c93703b5d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611280816-7W5MEA/blueprint/resolved-snapshot.json
- old_digest: f86caf2aeed8d95490ec208241a91a2698ed053872f4c245188d8de34ee4077c
- current_digest: f86caf2aeed8d95490ec208241a91a2698ed053872f4c245188d8de34ee4077c
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611280816-7W5MEA

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611280816-7W5MEA
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
