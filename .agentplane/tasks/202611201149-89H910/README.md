---
id: "202611201149-89H910"
title: "Connect Calc sheet tab visibility selection and color commands"
result_summary: "verified-202611201149-89H910"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify:
  - "npm run check:calc-resources"
  - "npm run test:calc -- calc-sheet calc-goto-sheet sheet-visibility tab-color"
  - "npm run test:e2e:calc -- sheet-context-menu xlsx-tab-colors xlsx-sheet-visibility xlsx-sheet-group"
  - "npm run typecheck"
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T11:51:06.529Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-20T12:42:04.348Z"
  updated_by: "CODER"
  note: "verified-202611201149-89H910"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-20T12:41:10.418Z"
  updated_by: "EVALUATOR"
  note: "Calc sheet tab commands meet the approved slice"
  evaluated_sha: "b86ce70293fc1c104f95fe03240db46dd193b243"
  blueprint_digest: "4cb4d974f3a7df5a4644df9c6172ccc0080a26b266732a5ddb4365d56c69819e"
  evidence_refs:
    - ".agentplane/tasks/202611201149-89H910/README.md"
    - ".agentplane/tasks/202611201149-89H910/quality/20261120-124110418-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611201149-89H910/quality/20261120-124110418-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611201149-89H910/quality/20261120-124110418-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611201149-89H910/blueprint/resolved-snapshot.json"
    - "output/calc-89H910-scoped-test.log"
    - "output/calc-89H910-browser.log"
    - "output/calc-89H910-browser-color-replay.log"
  findings:
    - "Focused model and production Chrome cases cover sheet selection, visibility, tab colors, history and persistence."
commit:
  hash: "134a17ee396d018d117deee624b8001f0a80a332"
  message: "🧩 89H910 task: record browser verification"
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Verified: verified-202611201149-89H910. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-11-20T11:51:32.525Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-20T12:08:48.917Z"
    author: "CODER"
    state: "needs_rework"
    note: "Calc menu resources, source provenance, dependency boundaries, routing and changed-file lint/format pass. The required focused Vitest and full TypeScript checks are blocked by missing lockfile packages and the installed Vitest version mismatch; Chrome acceptance is pending."
  -
    type: "verify"
    at: "2026-11-20T12:40:01.951Z"
    author: "CODER"
    state: "ok"
    note: "Fifteen focused Calc tests and all five production Chrome scenarios passed, including ODS/XLSX visibility and assigned color persistence. Typecheck, build, resources, provenance, boundaries and targeted quality checks pass."
  -
    type: "verify"
    at: "2026-11-20T12:41:26.524Z"
    author: "CODER"
    state: "ok"
    note: "verified-202611201149-89H910"
  -
    type: "verify"
    at: "2026-11-20T12:42:04.348Z"
    author: "CODER"
    state: "ok"
    note: "verified-202611201149-89H910"
  -
    type: "status"
    at: "2026-11-20T12:42:04.477Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202611201149-89H910. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-11-20T12:42:04.477Z"
doc_updated_by: "CODER"
description: "Connect native Hide, Show, SelectTables and SetTabBgColor slots to the actual Calc sheet state, shared menus, dialogs and undo. Use local pinned LibreOffice sources and focused tests of browser commands and file persistence."
sections:
  Summary: "Connect the upstream Hide, Show, SelectTables and SetTabBgColor sheet-tab commands to the existing Calc document and view."
  Scope: "Calc sheet command/workflow owners, document operations and history for visibility and color, native-shaped dialog presentation, shared menu consumption, and focused tests. Record any suspected upstream issue in the program ledgers. Use the approved local LibreOffice reference read."
  Plan: "Port the pinned sheet-tab slot state, execution, dialog widgets and document/history operations; validate group and visibility rules and ODS/XLSX persistence with focused tests."
  Verify Steps: |-
    - `npm run test:calc -- calc-sheet calc-goto-sheet sheet-visibility tab-color` exercises related Calc workflows, document state and dialog regressions.
    - `npm run typecheck` checks app and tooling contracts.
    - `npm run check:calc-resources` checks source-backed menu resources.
    - `npm run test:e2e:calc -- sheet-context-menu xlsx-tab-colors xlsx-sheet-visibility xlsx-sheet-group` verifies the built browser paths.
    - `git diff --check` validates patch whitespace.
  Verification: |-
    Locked install restored the checkout without manifest changes. Typecheck, production build, static build, Calc resources, source provenance, module boundaries, changed-file lint and format, routing, doctor and diff validation passed. The targeted Calc Vitest run passed 15 tests in five files with a 120-second test timeout, and the final dialog replay passed three tests. Scoped production Playwright used installed Google Chrome through a temporary config, dedicated server port, and one worker. Four browser scenarios passed together; the XLSX tab-color scenario passed in a separate 43-second replay after the initial test-wide timeout. Menu accessibility at 1280 and 390 pixels and the XLSX grouped, visibility and color file flows passed. An early runner argument mistake was interrupted during its first unrelated scenario; the valid run was constrained to exactly the approved five scenarios. Existing warning: managed AgentPlane hook shim lacks runner startup readiness.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-20T12:40:01.951Z — VERIFY — ok

    By: CODER

    Note: Fifteen focused Calc tests and all five production Chrome scenarios passed, including ODS/XLSX visibility and assigned color persistence. Typecheck, build, resources, provenance, boundaries and targeted quality checks pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T12:40:00.570Z, excerpt_hash=sha256:d2a3af777ce7e8c12dba04e7b536481a05a3488c0b56ea3e31647fe72abc3c08

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611201149-89H910/blueprint/resolved-snapshot.json
    - old_digest: 4cb4d974f3a7df5a4644df9c6172ccc0080a26b266732a5ddb4365d56c69819e
    - current_digest: 4cb4d974f3a7df5a4644df9c6172ccc0080a26b266732a5ddb4365d56c69819e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611201149-89H910

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611201149-89H910
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-11-20T12:41:26.524Z — VERIFY — ok

    By: CODER

    Note: verified-202611201149-89H910
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T12:40:02.069Z, excerpt_hash=sha256:d2a3af777ce7e8c12dba04e7b536481a05a3488c0b56ea3e31647fe72abc3c08

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611201149-89H910/blueprint/resolved-snapshot.json
    - old_digest: 4cb4d974f3a7df5a4644df9c6172ccc0080a26b266732a5ddb4365d56c69819e
    - current_digest: 4cb4d974f3a7df5a4644df9c6172ccc0080a26b266732a5ddb4365d56c69819e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611201149-89H910

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202611201149-89H910 --result verified-202611201149-89H910 --commit b86ce70293fc1c104f95fe03240db46dd193b243
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-11-20T12:42:04.348Z — VERIFY — ok

    By: CODER

    Note: verified-202611201149-89H910
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T12:41:26.583Z, excerpt_hash=sha256:d2a3af777ce7e8c12dba04e7b536481a05a3488c0b56ea3e31647fe72abc3c08

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611201149-89H910/blueprint/resolved-snapshot.json
    - old_digest: 4cb4d974f3a7df5a4644df9c6172ccc0080a26b266732a5ddb4365d56c69819e
    - current_digest: 4cb4d974f3a7df5a4644df9c6172ccc0080a26b266732a5ddb4365d56c69819e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611201149-89H910

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202611201149-89H910 --result verified-202611201149-89H910 --commit 134a17ee396d018d117deee624b8001f0a80a332
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation while preserving existing import/export visibility and color owners."
  Findings: "Native sheet selection includes hidden sheets and Hide compares selected count to visible count. The tab color request records the previous color. Typed Show can record an already-visible sheet. These paths remain source-compatible and are documented as CALC-770 through CALC-772. The browser uses the shared palette set and HTML lists. Desktop workbook structure protection, sharing and macro services are outside the represented slice."
extensions:
  implementation_commit:
    hash: "b86ce70293fc1c104f95fe03240db46dd193b243"
    message: "🧩 89H910 code: connect Calc sheet tab commands"
id_source: "generated"
---
## Summary

Connect the upstream Hide, Show, SelectTables and SetTabBgColor sheet-tab commands to the existing Calc document and view.

## Scope

Calc sheet command/workflow owners, document operations and history for visibility and color, native-shaped dialog presentation, shared menu consumption, and focused tests. Record any suspected upstream issue in the program ledgers. Use the approved local LibreOffice reference read.

## Plan

Port the pinned sheet-tab slot state, execution, dialog widgets and document/history operations; validate group and visibility rules and ODS/XLSX persistence with focused tests.

## Verify Steps

- `npm run test:calc -- calc-sheet calc-goto-sheet sheet-visibility tab-color` exercises related Calc workflows, document state and dialog regressions.
- `npm run typecheck` checks app and tooling contracts.
- `npm run check:calc-resources` checks source-backed menu resources.
- `npm run test:e2e:calc -- sheet-context-menu xlsx-tab-colors xlsx-sheet-visibility xlsx-sheet-group` verifies the built browser paths.
- `git diff --check` validates patch whitespace.

## Verification

Locked install restored the checkout without manifest changes. Typecheck, production build, static build, Calc resources, source provenance, module boundaries, changed-file lint and format, routing, doctor and diff validation passed. The targeted Calc Vitest run passed 15 tests in five files with a 120-second test timeout, and the final dialog replay passed three tests. Scoped production Playwright used installed Google Chrome through a temporary config, dedicated server port, and one worker. Four browser scenarios passed together; the XLSX tab-color scenario passed in a separate 43-second replay after the initial test-wide timeout. Menu accessibility at 1280 and 390 pixels and the XLSX grouped, visibility and color file flows passed. An early runner argument mistake was interrupted during its first unrelated scenario; the valid run was constrained to exactly the approved five scenarios. Existing warning: managed AgentPlane hook shim lacks runner startup readiness.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-20T12:40:01.951Z — VERIFY — ok

By: CODER

Note: Fifteen focused Calc tests and all five production Chrome scenarios passed, including ODS/XLSX visibility and assigned color persistence. Typecheck, build, resources, provenance, boundaries and targeted quality checks pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T12:40:00.570Z, excerpt_hash=sha256:d2a3af777ce7e8c12dba04e7b536481a05a3488c0b56ea3e31647fe72abc3c08

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611201149-89H910/blueprint/resolved-snapshot.json
- old_digest: 4cb4d974f3a7df5a4644df9c6172ccc0080a26b266732a5ddb4365d56c69819e
- current_digest: 4cb4d974f3a7df5a4644df9c6172ccc0080a26b266732a5ddb4365d56c69819e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611201149-89H910

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611201149-89H910
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-11-20T12:41:26.524Z — VERIFY — ok

By: CODER

Note: verified-202611201149-89H910
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T12:40:02.069Z, excerpt_hash=sha256:d2a3af777ce7e8c12dba04e7b536481a05a3488c0b56ea3e31647fe72abc3c08

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611201149-89H910/blueprint/resolved-snapshot.json
- old_digest: 4cb4d974f3a7df5a4644df9c6172ccc0080a26b266732a5ddb4365d56c69819e
- current_digest: 4cb4d974f3a7df5a4644df9c6172ccc0080a26b266732a5ddb4365d56c69819e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611201149-89H910

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202611201149-89H910 --result verified-202611201149-89H910 --commit b86ce70293fc1c104f95fe03240db46dd193b243
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-11-20T12:42:04.348Z — VERIFY — ok

By: CODER

Note: verified-202611201149-89H910
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T12:41:26.583Z, excerpt_hash=sha256:d2a3af777ce7e8c12dba04e7b536481a05a3488c0b56ea3e31647fe72abc3c08

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611201149-89H910/blueprint/resolved-snapshot.json
- old_digest: 4cb4d974f3a7df5a4644df9c6172ccc0080a26b266732a5ddb4365d56c69819e
- current_digest: 4cb4d974f3a7df5a4644df9c6172ccc0080a26b266732a5ddb4365d56c69819e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611201149-89H910

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202611201149-89H910 --result verified-202611201149-89H910 --commit 134a17ee396d018d117deee624b8001f0a80a332
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation while preserving existing import/export visibility and color owners.

## Findings

Native sheet selection includes hidden sheets and Hide compares selected count to visible count. The tab color request records the previous color. Typed Show can record an already-visible sheet. These paths remain source-compatible and are documented as CALC-770 through CALC-772. The browser uses the shared palette set and HTML lists. Desktop workbook structure protection, sharing and macro services are outside the represented slice.
