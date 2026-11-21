---
id: "202611210443-QJ6DRG"
title: "Connect Calc manual page break commands and normal-grid indicators"
result_summary: "Connect Calc manual page break commands and normal-grid indicators"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on:
  - "202611210412-B3P0ZB"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T04:44:32.999Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T04:52:04.291Z"
  updated_by: "CODER"
  note: "47 focused cases, browser geometry and undo, production build, type checks and static gates passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T04:52:05.373Z"
  updated_by: "EVALUATOR"
  note: "Native Calc row and column break actions and normal-grid indicators are verified."
  evaluated_sha: "862b79811c4369fd09fd8da5a43ccea37fea107d"
  blueprint_digest: "3f57849ae73030f93dd5044748ece2919d478193036caf8304f41f0e82d38466"
  evidence_refs:
    - ".agentplane/tasks/202611210443-QJ6DRG/README.md"
    - ".agentplane/tasks/202611210443-QJ6DRG/quality/20261121-045205373-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611210443-QJ6DRG/quality/20261121-045205373-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611210443-QJ6DRG/quality/20261121-045205373-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611210443-QJ6DRG/blueprint/resolved-snapshot.json"
    - "output/calc-QJ6DRG-verification.md"
    - "output/playwright/calc-QJ6DRG/browser-check.log"
  findings:
    - "Both menu pairs update the canonical flags and preserve protected sheets, history and native output."
commit:
  hash: "862b79811c4369fd09fd8da5a43ccea37fea107d"
  message: "🧩 QJ6DRG code: connect Calc manual page breaks"
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Verified: The four native page-break menu commands, normal-grid indicators, undo, and native package persistence passed targeted tests and an actual Chrome session."
events:
  -
    type: "status"
    at: "2026-11-21T04:45:18.350Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-21T04:52:04.291Z"
    author: "CODER"
    state: "ok"
    note: "47 focused cases, browser geometry and undo, production build, type checks and static gates passed."
  -
    type: "status"
    at: "2026-11-21T04:52:10.106Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: The four native page-break menu commands, normal-grid indicators, undo, and native package persistence passed targeted tests and an actual Chrome session."
doc_version: 3
doc_updated_at: "2026-11-21T04:52:10.109Z"
doc_updated_by: "CODER"
description: "Connect the native insert/remove row and column page break slots, history, and ordinary grid indicators to the canonical break sets. Preserve protected sheets, cursor behavior, ODS/XLSX persistence and the native ShowPageBreaks view flag."
sections:
  Summary: "Connect the native Calc row and column page-break commands and show the actual breaks in normal view."
  Scope: "Bind the four existing Sheet menu resources to native slot IDs, cursor-based state, ScDocFunc changes and shared undo. Render stored manual and computed breaks with the normal Calc grid geometry and honor the persisted ShowPageBreaks view flag. Use existing break persistence for ODS and XLSX. Page Break Preview, its bulk action and printer pagination are distinct source mechanisms."
  Plan: "Connect native page-break commands and normal-grid overlays using canonical break state and undo, with narrow ODS/XLSX and browser checks."
  Verify Steps: |-
    - Run targeted Calc tests for page break commands, table history, the Calc view and the relevant ODS and XLSX page settings and worker cases.
    - Run tools and office type checks, changed-path ESLint and Prettier, Calc resource and source provenance checks, file size, and git whitespace checks.
  Verification: |-
    - Command: `npm run test:calc -- calc-page-breaks calc-view-options calc-pane-commands native-table-undo /filter/excel/xepage.test.ts /filter/oox/excelfilter.page-settings.test.ts ods-worker-runtime --maxWorkers 1 --testTimeout 600000`. Result: pass. Evidence: 47 tests in seven files. Scope: existing Calc break persistence and Excel page settings, worker transfer, view options, panes, undo, and three new manual page-break regressions.
    - Command: `npm run typecheck:tools` and `npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1`. Result: pass. Scope: tooling and office.
    - Command: `vite build --outDir ../../output/calc-QJ6DRG-dist` from apps/office and Playwright CLI on the production preview with the installed Chrome channel. Result: pass. Evidence: inserted row and column breaks at C5, verified both visible 1-pixel dashed boundaries on the correct sides of C5, removed a break and restored it through toolbar Undo. See output/playwright/calc-QJ6DRG/browser-check.log.
    - Command: `npm run check:calc-resources`, `npm run check:source-provenance`, `npm run check:file-size`, and `node .agentplane/policy/check-routing.mjs`. Result: pass. Evidence: 464 commands and 2,911 runtime records checked. Scope: resource identity and implementation ownership.
    - Command: changed-file ESLint and Prettier and `git show --check 862b79811`. Result: pass. Scope: the implementation, source registry, and tests.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T04:52:04.291Z — VERIFY — ok

    By: CODER

    Note: 47 focused cases, browser geometry and undo, production build, type checks and static gates passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T04:52:03.725Z, excerpt_hash=sha256:504b3bdc8032d3f9265278d5121ece9094fb4f19096cf426cbdc3dba65c8e6aa

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611210443-QJ6DRG/blueprint/resolved-snapshot.json
    - old_digest: 3f57849ae73030f93dd5044748ece2919d478193036caf8304f41f0e82d38466
    - current_digest: 3f57849ae73030f93dd5044748ece2919d478193036caf8304f41f0e82d38466
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611210443-QJ6DRG

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611210443-QJ6DRG
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commit. Existing imported break sets and page styles remain compatible."
  Findings: "The native cell-shell slots use the current cursor, reject the first position, and disable both directions for protected sheets. Removing a manual break retains any existing computed flag. Normal grid painting independently honors ShowPageBreaks and collapses coincident hidden-row boundaries to the first native break. ODS, XLSX and the Worker already own manual-break persistence. This normal-grid slice displays the stored computed sets and preserves their invalidation; printer-driven recalculation and Page Break Preview are separate source mechanisms. The existing 65535 XLSX exporter limit is recorded in the Calc suspected-issues ledger."
id_source: "generated"
---
## Summary

Connect the native Calc row and column page-break commands and show the actual breaks in normal view.

## Scope

Bind the four existing Sheet menu resources to native slot IDs, cursor-based state, ScDocFunc changes and shared undo. Render stored manual and computed breaks with the normal Calc grid geometry and honor the persisted ShowPageBreaks view flag. Use existing break persistence for ODS and XLSX. Page Break Preview, its bulk action and printer pagination are distinct source mechanisms.

## Plan

Connect native page-break commands and normal-grid overlays using canonical break state and undo, with narrow ODS/XLSX and browser checks.

## Verify Steps

- Run targeted Calc tests for page break commands, table history, the Calc view and the relevant ODS and XLSX page settings and worker cases.
- Run tools and office type checks, changed-path ESLint and Prettier, Calc resource and source provenance checks, file size, and git whitespace checks.

## Verification

- Command: `npm run test:calc -- calc-page-breaks calc-view-options calc-pane-commands native-table-undo /filter/excel/xepage.test.ts /filter/oox/excelfilter.page-settings.test.ts ods-worker-runtime --maxWorkers 1 --testTimeout 600000`. Result: pass. Evidence: 47 tests in seven files. Scope: existing Calc break persistence and Excel page settings, worker transfer, view options, panes, undo, and three new manual page-break regressions.
- Command: `npm run typecheck:tools` and `npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1`. Result: pass. Scope: tooling and office.
- Command: `vite build --outDir ../../output/calc-QJ6DRG-dist` from apps/office and Playwright CLI on the production preview with the installed Chrome channel. Result: pass. Evidence: inserted row and column breaks at C5, verified both visible 1-pixel dashed boundaries on the correct sides of C5, removed a break and restored it through toolbar Undo. See output/playwright/calc-QJ6DRG/browser-check.log.
- Command: `npm run check:calc-resources`, `npm run check:source-provenance`, `npm run check:file-size`, and `node .agentplane/policy/check-routing.mjs`. Result: pass. Evidence: 464 commands and 2,911 runtime records checked. Scope: resource identity and implementation ownership.
- Command: changed-file ESLint and Prettier and `git show --check 862b79811`. Result: pass. Scope: the implementation, source registry, and tests.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T04:52:04.291Z — VERIFY — ok

By: CODER

Note: 47 focused cases, browser geometry and undo, production build, type checks and static gates passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T04:52:03.725Z, excerpt_hash=sha256:504b3bdc8032d3f9265278d5121ece9094fb4f19096cf426cbdc3dba65c8e6aa

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611210443-QJ6DRG/blueprint/resolved-snapshot.json
- old_digest: 3f57849ae73030f93dd5044748ece2919d478193036caf8304f41f0e82d38466
- current_digest: 3f57849ae73030f93dd5044748ece2919d478193036caf8304f41f0e82d38466
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611210443-QJ6DRG

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611210443-QJ6DRG
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commit. Existing imported break sets and page styles remain compatible.

## Findings

The native cell-shell slots use the current cursor, reject the first position, and disable both directions for protected sheets. Removing a manual break retains any existing computed flag. Normal grid painting independently honors ShowPageBreaks and collapses coincident hidden-row boundaries to the first native break. ODS, XLSX and the Worker already own manual-break persistence. This normal-grid slice displays the stored computed sets and preserves their invalidation; printer-driven recalculation and Page Break Preview are separate source mechanisms. The existing 65535 XLSX exporter limit is recorded in the Calc suspected-issues ledger.
