---
id: "202611210516-8P7GCQ"
title: "Connect Calc page style settings to the Format dialog"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T05:17:08.468Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T05:49:41.334Z"
  updated_by: "CODER"
  note: "Verified: Page Style uses original tab order, shared native Calc item sets, and ODS persistence. 42 targeted Calc tests and 87 Writer regressions passed, along with production Chrome replay and static checks."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T05:49:41.964Z"
  updated_by: "EVALUATOR"
  note: "The original Calc Format Page Style slot edits the shared document style through native item-set transactions and can undo and redo the change."
  evaluated_sha: "1717a0bc486c34c327e5553ce426d21e06848e44"
  blueprint_digest: "8a05370b9135125114e8d960cdae937d8afc371c70ebff6e92473d0a66c7dcb9"
  evidence_refs:
    - ".agentplane/tasks/202611210516-8P7GCQ/README.md"
    - ".agentplane/tasks/202611210516-8P7GCQ/quality/20261121-054941964-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611210516-8P7GCQ/quality/20261121-054941964-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611210516-8P7GCQ/quality/20261121-054941964-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611210516-8P7GCQ/blueprint/resolved-snapshot.json"
    - "42 Calc and 87 Writer tests, TypeScript, generated resources, source provenance, file size, lint, dependency checks and the production Chrome replay passed."
  findings:
    - "Page geometry, header/footer settings, print flags, scale, border and solid color use actual native items and ODS persistence. The shared metric adapter preserves CUI dependency direction and Writer behavior."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Connect the canonical page style item sets and source-ordered dialog to the Calc Format slot."
events:
  -
    type: "status"
    at: "2026-11-21T05:17:08.832Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect the canonical page style item sets and source-ordered dialog to the Calc Format slot."
  -
    type: "verify"
    at: "2026-11-21T05:49:41.334Z"
    author: "CODER"
    state: "ok"
    note: "Verified: Page Style uses original tab order, shared native Calc item sets, and ODS persistence. 42 targeted Calc tests and 87 Writer regressions passed, along with production Chrome replay and static checks."
doc_version: 3
doc_updated_at: "2026-11-21T05:49:41.387Z"
doc_updated_by: "CODER"
description: "Connect native Calc page style editing to the shared style and item pool, preserving the LibreOffice tab structure and printed sheet settings."
sections:
  Summary: "Connect the original Calc Format Page Style dialog to canonical page styles."
  Scope: "Use original General, Page, Borders, Background, Header, Footer, and Sheet structure to edit existing page style state. Retain the typed Sfx item contract, style-sharing semantics, and existing ODS save and reopen route. Standalone header and footer content editing and printer rendering remain separate workflows."
  Plan: "Port the source Sheet and header/footer settings and reuse shared page controls. Build the source-ordered browser dialog, bind the original view-shell slot and document style transaction, and verify persisted and shared state."
  Verify Steps: |-
    - Run the focused Calc page-style, ODS and Excel page-settings, and relevant UI resource tests.
    - Run tooling and office TypeScript, changed-path ESLint and Prettier.
    - Verify Calc resource generation, provenance, file size, and patch whitespace.
  Verification: |-
    - Command: `npm run test:calc -- calc-page-style excelfilter.page-settings print-ranges ui-resources pageattr docpool-style-defaults ods-worker-runtime --maxWorkers 1 --testTimeout 600000`. Result: pass. Evidence: 42 tests across 7 files. Scope: the original page-style UI regressions, canonical shared style history, ODS reopen, XLSX page settings, controls and pool defaults.
    - Command: `npm run test:writer -- native-border-page native-collapsing-table-borders native-table-border --maxWorkers 1 --testTimeout 600000`. Result: pass. Evidence: 87 tests across 7 files. Scope: shared CUI border controls through Writer and its existing native regressions.
    - Commands: `npm run typecheck:tools` and `npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1`. Result: pass. Scope: tooling and office TypeScript.
    - Commands: changed-path `prettier --check`, `eslint --max-warnings 0`, `npm run check:calc-resources`, `npm run check:source-provenance`, `npm run check:file-size`, `npm run check:dependencies`, and `git diff --check`. Result: pass. Evidence: 465 generated Calc commands, 2926 classified runtime modules, all authored files below the size gate, and a clean dependency boundary check.
    - Command: `../../node_modules/.bin/vite build --outDir ../../output/calc-8P7GCQ-dist` from apps/office with production preview and Playwright CLI on installed Chrome. Result: pass. Evidence: the Format menu opens all seven native Page Style tabs, the Sheet tab accepts 2×2 fit scaling, the grid regains focus on OK, and reopening shows the same mode and both values.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T05:49:41.334Z — VERIFY — ok

    By: CODER

    Note: Verified: Page Style uses original tab order, shared native Calc item sets, and ODS persistence. 42 targeted Calc tests and 87 Writer regressions passed, along with production Chrome replay and static checks.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T05:49:40.783Z, excerpt_hash=sha256:211add81f654e3d22472d9b20c7250c91060f6a1ec70cfe75d954e8b4e9c9f09

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611210516-8P7GCQ/blueprint/resolved-snapshot.json
    - old_digest: 8a05370b9135125114e8d960cdae937d8afc371c70ebff6e92473d0a66c7dcb9
    - current_digest: 8a05370b9135125114e8d960cdae937d8afc371c70ebff6e92473d0a66c7dcb9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611210516-8P7GCQ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611210516-8P7GCQ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commit to remove the connected dialog and preserve previously stored page settings."
  Findings: |-
    The original Format Page Style slot edits the active sheet's shared Page-family style. Page formatting, borders, solid page background, header and footer settings, and the three Sheet scaling modes use the current native items. ODS master pages without a header or footer child are imported with the corresponding component off, even when the initialized style has native default geometry. CALC-787 and CALC-788 retain the observed source scaling comparisons and fallback order.

    The covered upstream UI scenarios are tdf123508 and tdf144940. The standalone and nested header/footer content editors, printer-driven pagination, and graphic page fills remain separate source work. The shared border presenter uses the existing Writer and Calc metric controls via their browser adapters, respecting the CUI module boundary.
id_source: "generated"
---
## Summary

Connect the original Calc Format Page Style dialog to canonical page styles.

## Scope

Use original General, Page, Borders, Background, Header, Footer, and Sheet structure to edit existing page style state. Retain the typed Sfx item contract, style-sharing semantics, and existing ODS save and reopen route. Standalone header and footer content editing and printer rendering remain separate workflows.

## Plan

Port the source Sheet and header/footer settings and reuse shared page controls. Build the source-ordered browser dialog, bind the original view-shell slot and document style transaction, and verify persisted and shared state.

## Verify Steps

- Run the focused Calc page-style, ODS and Excel page-settings, and relevant UI resource tests.
- Run tooling and office TypeScript, changed-path ESLint and Prettier.
- Verify Calc resource generation, provenance, file size, and patch whitespace.

## Verification

- Command: `npm run test:calc -- calc-page-style excelfilter.page-settings print-ranges ui-resources pageattr docpool-style-defaults ods-worker-runtime --maxWorkers 1 --testTimeout 600000`. Result: pass. Evidence: 42 tests across 7 files. Scope: the original page-style UI regressions, canonical shared style history, ODS reopen, XLSX page settings, controls and pool defaults.
- Command: `npm run test:writer -- native-border-page native-collapsing-table-borders native-table-border --maxWorkers 1 --testTimeout 600000`. Result: pass. Evidence: 87 tests across 7 files. Scope: shared CUI border controls through Writer and its existing native regressions.
- Commands: `npm run typecheck:tools` and `npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1`. Result: pass. Scope: tooling and office TypeScript.
- Commands: changed-path `prettier --check`, `eslint --max-warnings 0`, `npm run check:calc-resources`, `npm run check:source-provenance`, `npm run check:file-size`, `npm run check:dependencies`, and `git diff --check`. Result: pass. Evidence: 465 generated Calc commands, 2926 classified runtime modules, all authored files below the size gate, and a clean dependency boundary check.
- Command: `../../node_modules/.bin/vite build --outDir ../../output/calc-8P7GCQ-dist` from apps/office with production preview and Playwright CLI on installed Chrome. Result: pass. Evidence: the Format menu opens all seven native Page Style tabs, the Sheet tab accepts 2×2 fit scaling, the grid regains focus on OK, and reopening shows the same mode and both values.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T05:49:41.334Z — VERIFY — ok

By: CODER

Note: Verified: Page Style uses original tab order, shared native Calc item sets, and ODS persistence. 42 targeted Calc tests and 87 Writer regressions passed, along with production Chrome replay and static checks.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T05:49:40.783Z, excerpt_hash=sha256:211add81f654e3d22472d9b20c7250c91060f6a1ec70cfe75d954e8b4e9c9f09

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611210516-8P7GCQ/blueprint/resolved-snapshot.json
- old_digest: 8a05370b9135125114e8d960cdae937d8afc371c70ebff6e92473d0a66c7dcb9
- current_digest: 8a05370b9135125114e8d960cdae937d8afc371c70ebff6e92473d0a66c7dcb9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611210516-8P7GCQ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611210516-8P7GCQ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commit to remove the connected dialog and preserve previously stored page settings.

## Findings

The original Format Page Style slot edits the active sheet's shared Page-family style. Page formatting, borders, solid page background, header and footer settings, and the three Sheet scaling modes use the current native items. ODS master pages without a header or footer child are imported with the corresponding component off, even when the initialized style has native default geometry. CALC-787 and CALC-788 retain the observed source scaling comparisons and fallback order.

The covered upstream UI scenarios are tdf123508 and tdf144940. The standalone and nested header/footer content editors, printer-driven pagination, and graphic page fills remain separate source work. The shared border presenter uses the existing Writer and Calc metric controls via their browser adapters, respecting the CUI module boundary.
