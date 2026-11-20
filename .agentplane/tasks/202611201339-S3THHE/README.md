---
id: "202611201339-S3THHE"
title: "Connect Calc manual outline grouping and detail commands"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify:
  - "npm run check:calc-resources"
  - "npm run test:calc -- calc-sheet-outline"
  - "npm run typecheck"
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T13:40:27.277Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-20T14:12:32.975Z"
  updated_by: "CODER"
  note: "Five outline-focused regressions passed on the final implementation, including the native fixture, and the broader worksheet runs passed 15 tests. TypeScript, Calc resources, provenance and static checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-20T14:12:47.979Z"
  updated_by: "EVALUATOR"
  note: "Manual outline slots, axis choices, visibility, history and source persistence are verified."
  evaluated_sha: "ff18fb0740c5d4cf929c7bc1acc327f4187b8467"
  blueprint_digest: "8d15e1c236bc4907105949f02b39dd7de3d90fc73eb10da2c26e07ab4ba8a03c"
  evidence_refs:
    - ".agentplane/tasks/202611201339-S3THHE/README.md"
    - ".agentplane/tasks/202611201339-S3THHE/quality/20261120-141247979-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611201339-S3THHE/quality/20261120-141247979-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611201339-S3THHE/quality/20261120-141247979-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611201339-S3THHE/blueprint/resolved-snapshot.json"
    - "output/calc-S3THHE-verification.md"
    - "output/calc-S3THHE-targeted.log"
    - "output/calc-S3THHE-typecheck-office-serial.log"
  findings:
    - "Marked Show Details retains the upstream bounding-span behavior documented as CALC-774 while keeping filtered rows hidden."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-20T13:40:51.355Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-20T14:12:32.975Z"
    author: "CODER"
    state: "ok"
    note: "Five outline-focused regressions passed on the final implementation, including the native fixture, and the broader worksheet runs passed 15 tests. TypeScript, Calc resources, provenance and static checks passed."
doc_version: 3
doc_updated_at: "2026-11-20T14:12:33.183Z"
doc_updated_by: "CODER"
description: "Expose native manual Group, Ungroup, Clear Outline, Hide Detail and Show Detail over the current outline tree and segmented row/column geometry. Preserve the source grouping dialog, command state, history and file persistence."
sections:
  Summary: "Connect manual row and column groups to the Calc Data menu."
  Scope: "Manual Group, Ungroup, Clear Outline, Show Detail and Hide Detail. Use the existing outline tree and row and column visibility owners. Match source dialog axis selection, undo, and file behavior. AutoOutline and DataPilot are separate operations."
  Plan: "Port and verify manual Calc outline commands and the native grouping dialog."
  Verify Steps: |-
    - `npm run test:calc -- calc-sheet-outline` exercises actual outline commands and state.
    - `npm run typecheck` checks app and tooling.
    - `npm run check:calc-resources` checks source paths.
    - `npm run check:source-provenance` and `git diff --check` check source ownership and patch.
  Verification: |-
    - Command: `npm run test:calc -- calc-sheet-outline worksheethelper --testTimeout 120000`. Result: pass. Evidence: 15 tests in two files. Scope: manual outline commands and the Calc worksheet import/export module.
    - Command: `npm run test:calc -- calc-sheet-outline worksheethelper -t 'groups rows|ungroups the touched|preserves filtered|four outline levels|native insertion and outline exporter|preserves nested' --testTimeout 120000`. Result: pass. Evidence: all three manual outline tests and two worksheet outline regressions passed after the final history changes. Scope: modal, menu availability, group promotion, visibility runs, undo/redo and the upstream four-level ODS/XLSX fixture.
    - Command: `npm run check:calc-resources`. Result: pass. Evidence: source resources agree with 464 commands and 11 top menus. Scope: Calc command menu and native labels.
    - Command: `npm run check:source-provenance`. Result: pass. Evidence: 2,894 runtime modules verified. Scope: source and browser implementation ownership.
    - Command: `npm run check:file-size`, changed-path ESLint and Prettier, `git show --check ff18fb074`. Result: pass. Scope: code and docs changed in this task.
    - Command: `node .agentplane/policy/check-routing.mjs` and `ap doctor`. Result: pass. Evidence: routing OK and doctor reported zero errors with the existing managed hook shim warning. Scope: AgentPlane direct workflow.
    - Command: `npm run typecheck:tools` as part of `npm run typecheck`, plus `npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1`. Result: pass. Evidence: tools and office compile without diagnostics. The office checker was rerun with one checker after the parallel compiler caused memory pressure on the shared machine. Scope: TypeScript tooling and office application.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-20T14:12:32.975Z — VERIFY — ok

    By: CODER

    Note: Five outline-focused regressions passed on the final implementation, including the native fixture, and the broader worksheet runs passed 15 tests. TypeScript, Calc resources, provenance and static checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T14:12:30.147Z, excerpt_hash=sha256:4a21331381b448b703962db486629dc9437d776f6115f8a382b293ec377d075b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611201339-S3THHE/blueprint/resolved-snapshot.json
    - old_digest: 8d15e1c236bc4907105949f02b39dd7de3d90fc73eb10da2c26e07ab4ba8a03c
    - current_digest: 8d15e1c236bc4907105949f02b39dd7de3d90fc73eb10da2c26e07ab4ba8a03c
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611201339-S3THHE

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611201339-S3THHE
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the command implementation and preserve existing outline import and export."
  Findings: "CALC-774 records the source marked Show Details expansion across manually hidden gaps between matched groups. The port preserves that behavior and excludes filtered row runs. Outline level buttons, AutoOutline and DataPilot grouping use separate source interactions. The browser undo stack stores detached group trees and compressed row/column visibility instead of copying an undo document."
id_source: "generated"
---
## Summary

Connect manual row and column groups to the Calc Data menu.

## Scope

Manual Group, Ungroup, Clear Outline, Show Detail and Hide Detail. Use the existing outline tree and row and column visibility owners. Match source dialog axis selection, undo, and file behavior. AutoOutline and DataPilot are separate operations.

## Plan

Port and verify manual Calc outline commands and the native grouping dialog.

## Verify Steps

- `npm run test:calc -- calc-sheet-outline` exercises actual outline commands and state.
- `npm run typecheck` checks app and tooling.
- `npm run check:calc-resources` checks source paths.
- `npm run check:source-provenance` and `git diff --check` check source ownership and patch.

## Verification

- Command: `npm run test:calc -- calc-sheet-outline worksheethelper --testTimeout 120000`. Result: pass. Evidence: 15 tests in two files. Scope: manual outline commands and the Calc worksheet import/export module.
- Command: `npm run test:calc -- calc-sheet-outline worksheethelper -t 'groups rows|ungroups the touched|preserves filtered|four outline levels|native insertion and outline exporter|preserves nested' --testTimeout 120000`. Result: pass. Evidence: all three manual outline tests and two worksheet outline regressions passed after the final history changes. Scope: modal, menu availability, group promotion, visibility runs, undo/redo and the upstream four-level ODS/XLSX fixture.
- Command: `npm run check:calc-resources`. Result: pass. Evidence: source resources agree with 464 commands and 11 top menus. Scope: Calc command menu and native labels.
- Command: `npm run check:source-provenance`. Result: pass. Evidence: 2,894 runtime modules verified. Scope: source and browser implementation ownership.
- Command: `npm run check:file-size`, changed-path ESLint and Prettier, `git show --check ff18fb074`. Result: pass. Scope: code and docs changed in this task.
- Command: `node .agentplane/policy/check-routing.mjs` and `ap doctor`. Result: pass. Evidence: routing OK and doctor reported zero errors with the existing managed hook shim warning. Scope: AgentPlane direct workflow.
- Command: `npm run typecheck:tools` as part of `npm run typecheck`, plus `npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1`. Result: pass. Evidence: tools and office compile without diagnostics. The office checker was rerun with one checker after the parallel compiler caused memory pressure on the shared machine. Scope: TypeScript tooling and office application.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-20T14:12:32.975Z — VERIFY — ok

By: CODER

Note: Five outline-focused regressions passed on the final implementation, including the native fixture, and the broader worksheet runs passed 15 tests. TypeScript, Calc resources, provenance and static checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T14:12:30.147Z, excerpt_hash=sha256:4a21331381b448b703962db486629dc9437d776f6115f8a382b293ec377d075b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611201339-S3THHE/blueprint/resolved-snapshot.json
- old_digest: 8d15e1c236bc4907105949f02b39dd7de3d90fc73eb10da2c26e07ab4ba8a03c
- current_digest: 8d15e1c236bc4907105949f02b39dd7de3d90fc73eb10da2c26e07ab4ba8a03c
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611201339-S3THHE

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611201339-S3THHE
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the command implementation and preserve existing outline import and export.

## Findings

CALC-774 records the source marked Show Details expansion across manually hidden gaps between matched groups. The port preserves that behavior and excludes filtered row runs. Outline level buttons, AutoOutline and DataPilot grouping use separate source interactions. The browser undo stack stores detached group trees and compressed row/column visibility instead of copying an undo document.
