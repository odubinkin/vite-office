---
id: "202609250703-7XN317"
title: "Restore upstream Writer command and dialog entry points"
result_summary: "verified-202609250703-7XN317"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-25T07:04:04.053Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-25T07:56:10.782Z"
  updated_by: "CODER"
  note: "verified-202609250703-7XN317"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-25T07:55:46.007Z"
  updated_by: "EVALUATOR"
  note: "Implemented entry points match the pinned Writer resource order and quick-control behavior in the approved supported slice."
  evaluated_sha: "5f48b0640037e86f71120b5a4d1f161f259f6962"
  blueprint_digest: "9748aaf6fe4a57fe818cf53b1dc7336b5ffd49777a7bea81af9190cf892c4cab"
  evidence_refs:
    - ".agentplane/tasks/202609250703-7XN317/README.md"
    - ".agentplane/tasks/202609250703-7XN317/quality/20260925-075546007-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609250703-7XN317/quality/20260925-075546007-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609250703-7XN317/quality/20260925-075546007-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609250703-7XN317/blueprint/resolved-snapshot.json"
    - "docs/program/writer-command-placement.md"
    - "apps/office/src/sw/browser/presentation/WriterUpstreamEntryPoints.test.tsx"
    - "apps/office/e2e/writer-responsive-sidebar.spec.ts"
    - "npm run verify: passed with 547 office tests, 109 inventory tests, 18 browser tests, all coverage thresholds 100%"
  findings:
    - "Generated menu and toolbar placements expose all audited implemented actions; save and export command behavior is unchanged."
    - "Table grid, More Options, line spacing, line numbering, direct page break, and supported table dialog controls have focused and browser evidence."
commit:
  hash: "0ac04634084a223b365590de44fde621781363d3"
  message: "🚧 7XN317 task: Record Writer UI verification"
comments:
  -
    author: "CODER"
    body: "Start: audit all implemented Writer actions and match upstream command placements and supported dialog behavior."
  -
    author: "CODER"
    body: "Verified: verified-202609250703-7XN317. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-09-25T07:04:11.112Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: audit all implemented Writer actions and match upstream command placements and supported dialog behavior."
  -
    type: "verify"
    at: "2026-09-25T07:55:09.382Z"
    author: "CODER"
    state: "ok"
    note: "npm run verify passed; 547 office tests and 109 inventory tests at 100% coverage, 18 Playwright scenarios including mobile table grid; save/export unchanged. Commit 5f48b0640037."
  -
    type: "verify"
    at: "2026-09-25T07:55:22.576Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609250703-7XN317"
  -
    type: "verify"
    at: "2026-09-25T07:56:10.782Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609250703-7XN317"
  -
    type: "status"
    at: "2026-09-25T07:56:10.980Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609250703-7XN317. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-09-25T07:56:10.981Z"
doc_updated_by: "CODER"
description: "Audit implemented Writer operations against pinned LibreOffice UI; restore missing command placements and faithful quick/full dialog behavior while preserving existing save/export UI."
sections:
  Summary: |-
    Restore upstream Writer command and dialog entry points

    Audit implemented Writer operations against pinned LibreOffice UI; restore missing command placements and faithful quick/full dialog behavior while preserving existing save/export UI.
  Scope: "Writer command resource generation, toolbar and menubar placement, table quick popover, existing Writer dialogs, model-backed line-number settings, and focused tests. Audit every currently implemented document action against local pinned LibreOffice UI resources. Preserve save/export controls and behavior. No network or outside-repository access."
  Plan: "Audit implemented Writer actions and supported dialog fields against pinned LibreOffice UI; restore missing upstream placements and quick/full table interaction; validate with targeted and full tests without altering save/export."
  Verify Steps: "Check the audited implemented-action/UI placement matrix against pinned LibreOffice XML and popup source. Run focused Vitest tests for generated resources, menus, toolbar, table grid, table dialog, line numbering, and existing dialogs. Run browser e2e at desktop and mobile widths for table grid, More Options, menu/dialog entry points and dismissal. Run npm run verify. Confirm save/export controls and behavior remain unchanged."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-25T07:55:09.382Z — VERIFY — ok

    By: CODER

    Note: npm run verify passed; 547 office tests and 109 inventory tests at 100% coverage, 18 Playwright scenarios including mobile table grid; save/export unchanged. Commit 5f48b0640037.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-25T07:54:15.944Z, excerpt_hash=sha256:21398da9f21da5e32e90750f8310ddd48ede82d945ddb3fc05052bf1dd15d5c8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609250703-7XN317/blueprint/resolved-snapshot.json
    - old_digest: 9748aaf6fe4a57fe818cf53b1dc7336b5ffd49777a7bea81af9190cf892c4cab
    - current_digest: 9748aaf6fe4a57fe818cf53b1dc7336b5ffd49777a7bea81af9190cf892c4cab
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609250703-7XN317

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609250703-7XN317
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-09-25T07:55:22.576Z — VERIFY — ok

    By: CODER

    Note: verified-202609250703-7XN317
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-25T07:55:09.467Z, excerpt_hash=sha256:21398da9f21da5e32e90750f8310ddd48ede82d945ddb3fc05052bf1dd15d5c8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609250703-7XN317/blueprint/resolved-snapshot.json
    - old_digest: 9748aaf6fe4a57fe818cf53b1dc7336b5ffd49777a7bea81af9190cf892c4cab
    - current_digest: 9748aaf6fe4a57fe818cf53b1dc7336b5ffd49777a7bea81af9190cf892c4cab
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609250703-7XN317

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609250703-7XN317 --result verified-202609250703-7XN317 --commit 5f48b0640037e86f71120b5a4d1f161f259f6962
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-25T07:56:10.782Z — VERIFY — ok

    By: CODER

    Note: verified-202609250703-7XN317
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-25T07:55:22.654Z, excerpt_hash=sha256:21398da9f21da5e32e90750f8310ddd48ede82d945ddb3fc05052bf1dd15d5c8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609250703-7XN317/blueprint/resolved-snapshot.json
    - old_digest: 9748aaf6fe4a57fe818cf53b1dc7336b5ffd49777a7bea81af9190cf892c4cab
    - current_digest: 9748aaf6fe4a57fe818cf53b1dc7336b5ffd49777a7bea81af9190cf892c4cab
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609250703-7XN317

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609250703-7XN317 --result verified-202609250703-7XN317 --commit 0ac04634084a223b365590de44fde621781363d3
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commit for this task only; do not change existing save/export workflow or the unrelated active task."
  Findings: "Audited implemented Writer actions against pinned menubar.xml, standardbar.xml, textobjectbar.xml, tablewindow.ui, paralinespacingcontrol.ui, and linenumbering.ui. Restored missing entry points: Insert Table in standard toolbar and Table menu; Table Properties in Table menu; direct Page Break in Insert menu and standard toolbar; Line Numbering in Tools; Single Underline in Format > Text; active Line Spacing quick control in formatting toolbar. The standard toolbar Table button now opens the 10 by 15 grid with keyboard sizing and More Options; repeat-header settings moved to Table Properties > Text Flow. The supported action matrix is recorded in docs/program/writer-command-placement.md. Save and export command specifications, placements, and handlers remain unchanged. Validation: npm run verify passed, including 547 office tests and 109 inventory tests at 100 percent coverage, 18 browser e2e tests including mobile table grid, static build, provenance, and parity."
extensions:
  implementation_commit:
    hash: "5f48b0640037e86f71120b5a4d1f161f259f6962"
    message: "🚧 7XN317 task: Restore Writer upstream command entry points"
id_source: "generated"
---
## Summary

Restore upstream Writer command and dialog entry points

Audit implemented Writer operations against pinned LibreOffice UI; restore missing command placements and faithful quick/full dialog behavior while preserving existing save/export UI.

## Scope

Writer command resource generation, toolbar and menubar placement, table quick popover, existing Writer dialogs, model-backed line-number settings, and focused tests. Audit every currently implemented document action against local pinned LibreOffice UI resources. Preserve save/export controls and behavior. No network or outside-repository access.

## Plan

Audit implemented Writer actions and supported dialog fields against pinned LibreOffice UI; restore missing upstream placements and quick/full table interaction; validate with targeted and full tests without altering save/export.

## Verify Steps

Check the audited implemented-action/UI placement matrix against pinned LibreOffice XML and popup source. Run focused Vitest tests for generated resources, menus, toolbar, table grid, table dialog, line numbering, and existing dialogs. Run browser e2e at desktop and mobile widths for table grid, More Options, menu/dialog entry points and dismissal. Run npm run verify. Confirm save/export controls and behavior remain unchanged.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-25T07:55:09.382Z — VERIFY — ok

By: CODER

Note: npm run verify passed; 547 office tests and 109 inventory tests at 100% coverage, 18 Playwright scenarios including mobile table grid; save/export unchanged. Commit 5f48b0640037.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-25T07:54:15.944Z, excerpt_hash=sha256:21398da9f21da5e32e90750f8310ddd48ede82d945ddb3fc05052bf1dd15d5c8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609250703-7XN317/blueprint/resolved-snapshot.json
- old_digest: 9748aaf6fe4a57fe818cf53b1dc7336b5ffd49777a7bea81af9190cf892c4cab
- current_digest: 9748aaf6fe4a57fe818cf53b1dc7336b5ffd49777a7bea81af9190cf892c4cab
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609250703-7XN317

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609250703-7XN317
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-09-25T07:55:22.576Z — VERIFY — ok

By: CODER

Note: verified-202609250703-7XN317
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-25T07:55:09.467Z, excerpt_hash=sha256:21398da9f21da5e32e90750f8310ddd48ede82d945ddb3fc05052bf1dd15d5c8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609250703-7XN317/blueprint/resolved-snapshot.json
- old_digest: 9748aaf6fe4a57fe818cf53b1dc7336b5ffd49777a7bea81af9190cf892c4cab
- current_digest: 9748aaf6fe4a57fe818cf53b1dc7336b5ffd49777a7bea81af9190cf892c4cab
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609250703-7XN317

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609250703-7XN317 --result verified-202609250703-7XN317 --commit 5f48b0640037e86f71120b5a4d1f161f259f6962
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-25T07:56:10.782Z — VERIFY — ok

By: CODER

Note: verified-202609250703-7XN317
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-25T07:55:22.654Z, excerpt_hash=sha256:21398da9f21da5e32e90750f8310ddd48ede82d945ddb3fc05052bf1dd15d5c8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609250703-7XN317/blueprint/resolved-snapshot.json
- old_digest: 9748aaf6fe4a57fe818cf53b1dc7336b5ffd49777a7bea81af9190cf892c4cab
- current_digest: 9748aaf6fe4a57fe818cf53b1dc7336b5ffd49777a7bea81af9190cf892c4cab
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609250703-7XN317

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609250703-7XN317 --result verified-202609250703-7XN317 --commit 0ac04634084a223b365590de44fde621781363d3
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commit for this task only; do not change existing save/export workflow or the unrelated active task.

## Findings

Audited implemented Writer actions against pinned menubar.xml, standardbar.xml, textobjectbar.xml, tablewindow.ui, paralinespacingcontrol.ui, and linenumbering.ui. Restored missing entry points: Insert Table in standard toolbar and Table menu; Table Properties in Table menu; direct Page Break in Insert menu and standard toolbar; Line Numbering in Tools; Single Underline in Format > Text; active Line Spacing quick control in formatting toolbar. The standard toolbar Table button now opens the 10 by 15 grid with keyboard sizing and More Options; repeat-header settings moved to Table Properties > Text Flow. The supported action matrix is recorded in docs/program/writer-command-placement.md. Save and export command specifications, placements, and handlers remain unchanged. Validation: npm run verify passed, including 547 office tests and 109 inventory tests at 100 percent coverage, 18 browser e2e tests including mobile table grid, static build, provenance, and parity.
