---
id: "202611211827-Q9AG7E"
title: "Round-trip Calc ODS drawing grid and view options"
result_summary: "Ported native Calc ODS drawing-grid settings, note and formula-mark display flags, value highlighting and legacy TabColor import."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T18:27:25.581Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T18:32:45.413Z"
  updated_by: "CODER"
  note: "34 targeted Calc tests passed across six files. Office typechecking, lint, formatting, dependency boundaries, registry provenance and task policy checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T18:32:46.130Z"
  updated_by: "EVALUATOR"
  note: "The current Calc drawing grid and display properties now round-trip through native ODS view properties and the Worker."
  evaluated_sha: "7381dcf1e15e8c78019789001e52c69962a2b038"
  blueprint_digest: "709b7a5756042aacf241273588172dee67b8d67e4c973872acd0617d4978281e"
  evidence_refs:
    - ".agentplane/tasks/202611211827-Q9AG7E/README.md"
    - ".agentplane/tasks/202611211827-Q9AG7E/quality/20261121-183246130-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611211827-Q9AG7E/quality/20261121-183246130-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611211827-Q9AG7E/quality/20261121-183246130-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611211827-Q9AG7E/blueprint/resolved-snapshot.json"
    - "34 focused Calc tests, office TypeScript, ESLint, Prettier, 2977 provenance records and AgentPlane gateway checks"
  findings:
    - "Native defaults, property types, unsigned drawing geometry, legacy tab color precedence and Worker rejection of invalid geometry are covered. The settings fixture exercises the pinned LibreOffice profile with supported sheet content."
commit:
  hash: "7381dcf1e15e8c78019789001e52c69962a2b038"
  message: "🧩 Q9AG7E code: preserve Calc ODS drawing grid and view options"
comments:
  -
    author: "CODER"
    body: "Start: implement native drawing-grid ownership and ODS view settings with Worker transfer and fixture coverage."
  -
    author: "CODER"
    body: "Verified: ODS drawing grid, display booleans, legacy sheet color and Worker adoption pass 34 targeted tests and static checks."
events:
  -
    type: "status"
    at: "2026-11-21T18:27:30.577Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native drawing-grid ownership and ODS view settings with Worker transfer and fixture coverage."
  -
    type: "verify"
    at: "2026-11-21T18:32:45.413Z"
    author: "CODER"
    state: "ok"
    note: "34 targeted Calc tests passed across six files. Office typechecking, lint, formatting, dependency boundaries, registry provenance and task policy checks passed."
  -
    type: "status"
    at: "2026-11-21T18:33:51.504Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: ODS drawing grid, display booleans, legacy sheet color and Worker adoption pass 34 targeted tests and static checks."
doc_version: 3
doc_updated_at: "2026-11-21T18:33:51.504Z"
doc_updated_by: "CODER"
description: "Port the native ScViewData settings for the existing drawing-grid value type and the remaining represented display flags. Import legacy per-sheet TabColor into the native model. Preserve the settings across the Calc Worker and verify the ODF XML contract with pinned LibreOffice fixtures and focused tests."
sections:
  Summary: "Preserve the drawing grid and represented display settings on Calc ODS import and export, including the native legacy tab color input."
  Scope: "ScViewOptions ownership, ODS view settings and Calc document Worker transfer. Use pinned LibreOffice viewdata.cxx, viewopti.hxx and the existing drawing-grid type."
  Plan: |-
    - Match the native ODF names, scalar types, defaults and legacy tab-color writer asymmetry.
    - Reuse the current Calc view-options and tab color owners and transfer their state through the Worker.
    - Cover the pinned ODS settings and critical XML/transfer behavior.
  Verify Steps: |-
    - Run `npm run test:calc -- viewdata.settings.test.ts viewopti.grid.test.ts ods-worker --maxWorkers 2 --testTimeout 120000` to cover ODS, view options and Worker boundaries.
    - Run the office workspace typecheck and ESLint and Prettier on changed TypeScript.
    - Run `npm run check:dependencies`, `npm run check:source-provenance`, `node .agentplane/policy/check-routing.mjs`, `ap doctor` and `git diff --check`.
  Verification: |-
    Pending.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T18:32:45.413Z — VERIFY — ok

    By: CODER

    Note: 34 targeted Calc tests passed across six files. Office typechecking, lint, formatting, dependency boundaries, registry provenance and task policy checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T18:31:15.586Z, excerpt_hash=sha256:dfadf295fa616551d414d3933da2cda21387cec795c5f53856059eccf1a3d039

    Details:

    Command: npm run test:calc -- viewdata.settings.test.ts viewopti.grid.test.ts ods-worker --maxWorkers 2 --testTimeout 120000
    Result: pass
    Evidence: 34 tests across 6 files, including pinned ManualColWidthRowHeight ODS, signed grid field and legacy tab color override.
    Scope: ODF view properties, native grid value semantics and Calc Worker transfer.

    Command: npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1 --incremental --tsBuildInfoFile ../../output/playwright/ods-odt-office.tsbuildinfo
    Result: pass
    Evidence: exit zero.
    Scope: office TypeScript.

    Command: npx eslint and npx prettier --check on viewopti.ts, viewdata.settings.ts, viewdata.settings.test.ts and calc-document-codec.ts
    Result: pass
    Evidence: no diagnostics.
    Scope: changed TypeScript.

    Command: npm run check:dependencies && npm run check:source-provenance
    Result: pass
    Evidence: 2976 dependency-checked runtime sources and 2977 provenance records.
    Scope: import boundaries and source registry.

    Command: node .agentplane/policy/check-routing.mjs && ap doctor && git diff --check
    Result: pass
    Evidence: routing OK, zero doctor errors, existing managed shim warning, no whitespace errors.
    Scope: task policy and implementation diff.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211827-Q9AG7E/blueprint/resolved-snapshot.json
    - old_digest: 709b7a5756042aacf241273588172dee67b8d67e4c973872acd0617d4978281e
    - current_digest: 709b7a5756042aacf241273588172dee67b8d67e4c973872acd0617d4978281e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611211827-Q9AG7E

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611211827-Q9AG7E
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped implementation commit."
  Findings: |-
    None recorded yet.

    - Observation: The first focused test run had 33 passes and one failed new fixture. LargeAnchorOffset.ods contains a measure-line shape outside the current Calc filter.
      Impact: The fixture cannot reach the view-settings reader with the represented drawing-object slice.
      Resolution: Use pinned ManualColWidthRowHeight.ods with native nondefault drawing-grid settings and supported sheet contents. Keep measure-line import outside this task.
id_source: "generated"
---
## Summary

Preserve the drawing grid and represented display settings on Calc ODS import and export, including the native legacy tab color input.

## Scope

ScViewOptions ownership, ODS view settings and Calc document Worker transfer. Use pinned LibreOffice viewdata.cxx, viewopti.hxx and the existing drawing-grid type.

## Plan

- Match the native ODF names, scalar types, defaults and legacy tab-color writer asymmetry.
- Reuse the current Calc view-options and tab color owners and transfer their state through the Worker.
- Cover the pinned ODS settings and critical XML/transfer behavior.

## Verify Steps

- Run `npm run test:calc -- viewdata.settings.test.ts viewopti.grid.test.ts ods-worker --maxWorkers 2 --testTimeout 120000` to cover ODS, view options and Worker boundaries.
- Run the office workspace typecheck and ESLint and Prettier on changed TypeScript.
- Run `npm run check:dependencies`, `npm run check:source-provenance`, `node .agentplane/policy/check-routing.mjs`, `ap doctor` and `git diff --check`.

## Verification

Pending.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T18:32:45.413Z — VERIFY — ok

By: CODER

Note: 34 targeted Calc tests passed across six files. Office typechecking, lint, formatting, dependency boundaries, registry provenance and task policy checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T18:31:15.586Z, excerpt_hash=sha256:dfadf295fa616551d414d3933da2cda21387cec795c5f53856059eccf1a3d039

Details:

Command: npm run test:calc -- viewdata.settings.test.ts viewopti.grid.test.ts ods-worker --maxWorkers 2 --testTimeout 120000
Result: pass
Evidence: 34 tests across 6 files, including pinned ManualColWidthRowHeight ODS, signed grid field and legacy tab color override.
Scope: ODF view properties, native grid value semantics and Calc Worker transfer.

Command: npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1 --incremental --tsBuildInfoFile ../../output/playwright/ods-odt-office.tsbuildinfo
Result: pass
Evidence: exit zero.
Scope: office TypeScript.

Command: npx eslint and npx prettier --check on viewopti.ts, viewdata.settings.ts, viewdata.settings.test.ts and calc-document-codec.ts
Result: pass
Evidence: no diagnostics.
Scope: changed TypeScript.

Command: npm run check:dependencies && npm run check:source-provenance
Result: pass
Evidence: 2976 dependency-checked runtime sources and 2977 provenance records.
Scope: import boundaries and source registry.

Command: node .agentplane/policy/check-routing.mjs && ap doctor && git diff --check
Result: pass
Evidence: routing OK, zero doctor errors, existing managed shim warning, no whitespace errors.
Scope: task policy and implementation diff.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211827-Q9AG7E/blueprint/resolved-snapshot.json
- old_digest: 709b7a5756042aacf241273588172dee67b8d67e4c973872acd0617d4978281e
- current_digest: 709b7a5756042aacf241273588172dee67b8d67e4c973872acd0617d4978281e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611211827-Q9AG7E

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611211827-Q9AG7E
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped implementation commit.

## Findings

None recorded yet.

- Observation: The first focused test run had 33 passes and one failed new fixture. LargeAnchorOffset.ods contains a measure-line shape outside the current Calc filter.
  Impact: The fixture cannot reach the view-settings reader with the represented drawing-object slice.
  Resolution: Use pinned ManualColWidthRowHeight.ods with native nondefault drawing-grid settings and supported sheet contents. Keep measure-line import outside this task.
