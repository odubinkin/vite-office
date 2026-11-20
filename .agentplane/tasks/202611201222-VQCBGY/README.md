---
id: "202611201222-VQCBGY"
title: "Align Calc ODS row and column default cell styles"
result_summary: "Calc ODS imports native row and column cell styles and emits native column defaults through the package and Worker boundaries."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T12:23:10.729Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-20T12:40:56.335Z"
  updated_by: "CODER"
  note: "Calc ODS imports native row and column cell styles and emits native column defaults through the package and Worker boundaries."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-20T12:40:42.958Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review against pinned Calc XML range helpers, document pattern selection and final deterministic checks."
  evaluated_sha: "28ab3177d2f442d13732212cdb306bb98f75b481"
  blueprint_digest: "176bf10945c138f1f6eb7868e822c8f9ea4e70339825b1194f623e56d4025115"
  evidence_refs:
    - ".agentplane/tasks/202611201222-VQCBGY/README.md"
    - ".agentplane/tasks/202611201222-VQCBGY/quality/20261120-124042958-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611201222-VQCBGY/quality/20261120-124042958-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611201222-VQCBGY/quality/20261120-124042958-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611201222-VQCBGY/blueprint/resolved-snapshot.json"
    - "28ab3177d2f4: final 106-test Calc XML filter and Worker profile, office typecheck and static checks"
    - "apps/office/src/sc/source/filter/xml/ods-default-cell-styles.test.ts"
    - "apps/office/src/sc/source/filter/xml/ods-typed-values.test.ts"
    - "docs/program/calc-upstream-suspected-issues.md"
  findings:
    - "The default shapes follow Calc row and column range precedence, deferred row-default timing and final declared column fallback."
    - "The core picks column defaults by native pattern coverage and first-row tie-break; XML keeps automatic and named runs distinct and writes direct overrides."
    - "The updated fixture retains original column default declarations and data styles and verifies both upstream date assertions."
commit:
  hash: "28ab3177d2f442d13732212cdb306bb98f75b481"
  message: "🧩 VQCBGY code: port Calc ODS default cell style ranges"
comments:
  -
    author: "CODER"
    body: "Start: Port the native Calc ODS cell style range and column default selection paths."
  -
    author: "CODER"
    body: "Verified: Calc ODS imports native row and column cell styles and emits native column defaults through the package and Worker boundaries.. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-11-20T12:23:18.961Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Port the native Calc ODS cell style range and column default selection paths."
  -
    type: "verify"
    at: "2026-11-20T12:40:42.333Z"
    author: "CODER"
    state: "ok"
    note: "The pinned Calc date fixture, native ODS style range tests, Worker round trips and all 106 tests in the declared Calc XML profile passed on the implementation commit."
  -
    type: "verify"
    at: "2026-11-20T12:40:56.335Z"
    author: "CODER"
    state: "ok"
    note: "Calc ODS imports native row and column cell styles and emits native column defaults through the package and Worker boundaries."
  -
    type: "status"
    at: "2026-11-20T12:40:56.437Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Calc ODS imports native row and column cell styles and emits native column defaults through the package and Worker boundaries.. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-11-20T12:40:56.438Z"
doc_updated_by: "CODER"
description: "Port the native Calc XML default-style range import and column default export selection, preserving formatted empties, repeated ranges, typed values and native pattern ownership. Replay the original tdf126116 FODS scenario with inherited formatting."
sections:
  Summary: |-
    Align Calc ODS row and column default cell styles

    Port the native Calc XML default-style range import and column default export selection, preserving formatted empties, repeated ranges, typed values and native pattern ownership. Replay the original tdf126116 FODS scenario with inherited formatting.
  Scope: "Calc ODF range style import and export, native Calc document column attribute selection, represented typed-value interaction and Worker round trip, focused Calc tests using pinned LibreOffice data, and Calc suspected upstream issues."
  Plan: "Port the represented native style range helper and its row and column default resolution, applying styles before type-based number formats. Reuse the native cell pattern ranges to select column defaults by covered row count and first-row tie-break, then use ODF cell and column styles with the original omission rules. Verify native fixture and repeated styled ranges through ODS and Worker."
  Verify Steps: |-
    1. npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml --maxWorkers 2 --testTimeout 120000. Cover original tdf126116 with column defaults, mixed explicit and inherited styles, repeats, typed values, export column defaults and Worker transfer.
    2. npm run typecheck --workspace @vite-office/office.
    3. Run scoped ESLint and Prettier, git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-20T12:40:42.333Z — VERIFY — ok

    By: CODER

    Note: The pinned Calc date fixture, native ODS style range tests, Worker round trips and all 106 tests in the declared Calc XML profile passed on the implementation commit.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T12:23:18.961Z, excerpt_hash=sha256:461f552e0515e6e00853ba135c539ecedb41d8e9f81391553d17bfeef4174e46

    Details:

    Command: npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml --maxWorkers 2 --testTimeout 120000
    Result: pass
    Evidence: 23 files, 106 tests passed on 28ab3177d2f4. The original tdf126116 fixture retains both short-date assertions with only the XML root adapted to the package content reader.
    Scope: Calc ODF range formats, typed values, repeated styled empties, worker records and package reopening.

    Command: npm run typecheck --workspace @vite-office/office
    Result: pass
    Evidence: tsc --noEmit completed with exit code zero.
    Scope: office type checking.

    Command: scoped ESLint and Prettier for all changed TypeScript, git diff HEAD^ HEAD --check, npm run check:dependencies, npm run check:source-tree, node .agentplane/policy/check-routing.mjs, and ap doctor
    Result: pass
    Evidence: formatting, lint, module boundaries, pinned source-tree paths and routing passed. Doctor OK with the existing managed hook readiness warning.
    Scope: changed sources and process checks.

    Initial declared run recorded two export assertions and a protection-test timeout. The source-backed export correction and assertion update passed individually and the final declared rerun passed all 106 tests.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611201222-VQCBGY/blueprint/resolved-snapshot.json
    - old_digest: 176bf10945c138f1f6eb7868e822c8f9ea4e70339825b1194f623e56d4025115
    - current_digest: 176bf10945c138f1f6eb7868e822c8f9ea4e70339825b1194f623e56d4025115
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611201222-VQCBGY

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611201222-VQCBGY
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-11-20T12:40:56.335Z — VERIFY — ok

    By: CODER

    Note: Calc ODS imports native row and column cell styles and emits native column defaults through the package and Worker boundaries.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T12:40:42.388Z, excerpt_hash=sha256:461f552e0515e6e00853ba135c539ecedb41d8e9f81391553d17bfeef4174e46

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611201222-VQCBGY/blueprint/resolved-snapshot.json
    - old_digest: 176bf10945c138f1f6eb7868e822c8f9ea4e70339825b1194f623e56d4025115
    - current_digest: 176bf10945c138f1f6eb7868e822c8f9ea4e70339825b1194f623e56d4025115
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611201222-VQCBGY

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202611201222-VQCBGY --result verified-202611201222-VQCBGY --commit b0043038982551edb04c172ce9dd73d2e3eb26e2
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the committed Calc ODF cell-style range and column default implementation with its tests and audit findings."
  Findings: ""
id_source: "generated"
---
## Summary

Align Calc ODS row and column default cell styles

Port the native Calc XML default-style range import and column default export selection, preserving formatted empties, repeated ranges, typed values and native pattern ownership. Replay the original tdf126116 FODS scenario with inherited formatting.

## Scope

Calc ODF range style import and export, native Calc document column attribute selection, represented typed-value interaction and Worker round trip, focused Calc tests using pinned LibreOffice data, and Calc suspected upstream issues.

## Plan

Port the represented native style range helper and its row and column default resolution, applying styles before type-based number formats. Reuse the native cell pattern ranges to select column defaults by covered row count and first-row tie-break, then use ODF cell and column styles with the original omission rules. Verify native fixture and repeated styled ranges through ODS and Worker.

## Verify Steps

1. npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml --maxWorkers 2 --testTimeout 120000. Cover original tdf126116 with column defaults, mixed explicit and inherited styles, repeats, typed values, export column defaults and Worker transfer.
2. npm run typecheck --workspace @vite-office/office.
3. Run scoped ESLint and Prettier, git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-20T12:40:42.333Z — VERIFY — ok

By: CODER

Note: The pinned Calc date fixture, native ODS style range tests, Worker round trips and all 106 tests in the declared Calc XML profile passed on the implementation commit.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T12:23:18.961Z, excerpt_hash=sha256:461f552e0515e6e00853ba135c539ecedb41d8e9f81391553d17bfeef4174e46

Details:

Command: npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml --maxWorkers 2 --testTimeout 120000
Result: pass
Evidence: 23 files, 106 tests passed on 28ab3177d2f4. The original tdf126116 fixture retains both short-date assertions with only the XML root adapted to the package content reader.
Scope: Calc ODF range formats, typed values, repeated styled empties, worker records and package reopening.

Command: npm run typecheck --workspace @vite-office/office
Result: pass
Evidence: tsc --noEmit completed with exit code zero.
Scope: office type checking.

Command: scoped ESLint and Prettier for all changed TypeScript, git diff HEAD^ HEAD --check, npm run check:dependencies, npm run check:source-tree, node .agentplane/policy/check-routing.mjs, and ap doctor
Result: pass
Evidence: formatting, lint, module boundaries, pinned source-tree paths and routing passed. Doctor OK with the existing managed hook readiness warning.
Scope: changed sources and process checks.

Initial declared run recorded two export assertions and a protection-test timeout. The source-backed export correction and assertion update passed individually and the final declared rerun passed all 106 tests.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611201222-VQCBGY/blueprint/resolved-snapshot.json
- old_digest: 176bf10945c138f1f6eb7868e822c8f9ea4e70339825b1194f623e56d4025115
- current_digest: 176bf10945c138f1f6eb7868e822c8f9ea4e70339825b1194f623e56d4025115
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611201222-VQCBGY

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611201222-VQCBGY
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-11-20T12:40:56.335Z — VERIFY — ok

By: CODER

Note: Calc ODS imports native row and column cell styles and emits native column defaults through the package and Worker boundaries.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T12:40:42.388Z, excerpt_hash=sha256:461f552e0515e6e00853ba135c539ecedb41d8e9f81391553d17bfeef4174e46

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611201222-VQCBGY/blueprint/resolved-snapshot.json
- old_digest: 176bf10945c138f1f6eb7868e822c8f9ea4e70339825b1194f623e56d4025115
- current_digest: 176bf10945c138f1f6eb7868e822c8f9ea4e70339825b1194f623e56d4025115
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611201222-VQCBGY

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202611201222-VQCBGY --result verified-202611201222-VQCBGY --commit b0043038982551edb04c172ce9dd73d2e3eb26e2
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the committed Calc ODF cell-style range and column default implementation with its tests and audit findings.

## Findings
