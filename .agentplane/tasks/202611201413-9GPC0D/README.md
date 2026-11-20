---
id: "202611201413-9GPC0D"
title: "Connect Calc outline header controls and levels"
result_summary: "Connect Calc outline header controls and levels"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on:
  - "202611201339-S3THHE"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T14:14:17.309Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-20T14:55:07.840Z"
  updated_by: "CODER"
  note: "Eleven focused Calc tests, native ODS in Chrome with measured frozen-pane placement, production build, the initial type checks and final static gates passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-20T14:55:38.565Z"
  updated_by: "EVALUATOR"
  note: "Verified Calc outline controls, native group visibility and clipped frozen pane geometry."
  evaluated_sha: "8d12db561d9f2e6b523a47408ab0076f849a9ab9"
  blueprint_digest: "da91c47ee1af9c2ed315b055d80125ec8b44bbee54a66116a3027531ce8bc9ba"
  evidence_refs:
    - ".agentplane/tasks/202611201413-9GPC0D/README.md"
    - ".agentplane/tasks/202611201413-9GPC0D/quality/20261120-145538565-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611201413-9GPC0D/quality/20261120-145538565-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611201413-9GPC0D/quality/20261120-145538565-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611201413-9GPC0D/blueprint/resolved-snapshot.json"
    - "output/calc-9GPC0D-verification.md"
    - "output/playwright/calc-9GPC0D/browser-geometry.log"
  findings:
    - "The original ODS fixture exposes both outline axes and restores nested hidden rows via the browser buttons."
commit:
  hash: "8d12db561d9f2e6b523a47408ab0076f849a9ab9"
  message: "🧩 9GPC0D code: connect Calc outline header controls"
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Verified: Native outline levels and individual controls work for both sheet axes. Targeted tests, source verification and measured Chrome freeze behavior passed."
events:
  -
    type: "status"
    at: "2026-11-20T14:14:49.818Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-20T14:55:07.840Z"
    author: "CODER"
    state: "ok"
    note: "Eleven focused Calc tests, native ODS in Chrome with measured frozen-pane placement, production build, the initial type checks and final static gates passed."
  -
    type: "status"
    at: "2026-11-20T14:56:20.671Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Native outline levels and individual controls work for both sheet axes. Targeted tests, source verification and measured Chrome freeze behavior passed."
doc_version: 3
doc_updated_at: "2026-11-20T14:56:20.679Z"
doc_updated_by: "CODER"
description: "Expose the source row and column outline gutters, level selection and individual group expand/collapse in the browser grid. Preserve native nested visibility, filtered rows, undo and split-pane placement using existing document owners."
sections:
  Summary: "Connect the row and column outline windows to the Calc browser grid."
  Scope: "Implement the source outline level buttons and per-group expand/collapse controls, nested and filtered visibility, undo, and keyboard and pane placement. Use canonical Calc outline, view settings, and viewport geometry. Add provenance for the browser outline presentation and critical targeted tests. Keep dialog and file operation policy as currently implemented."
  Plan: "Port row and column gutter level and individual group selection, shared geometry, native undo, and targeted regression tests."
  Verify Steps: |-
    - Run targeted Calc tests for outline headers, manual outline commands, and frozen panes.
    - Run TypeScript for tools and office, with a single office checker if host capacity requires it.
    - Run focused ESLint and Prettier, and run Calc resources, provenance, file size, and git whitespace checks.
  Verification: |-
    - Command: `npm run test:calc -- calc-outline-window calc-sheet-outline calc-pane-commands calc-header-sizing --testTimeout 120000`. Result: pass. Evidence: 11 tests across four files on the final edit. Scope: nested outline windows, filtering, editing guard, level operations, undo/redo, shared grid geometry, existing manual outline and pane commands, row/column header sizing.
    - Command: `npm run typecheck:tools`. Result: pass. Scope: tooling project.
    - Command: `npm run check:calc-resources`, `npm run check:source-provenance`, and `npm run check:file-size`. Result: pass. Evidence: 464 source commands and 2895 runtime module records, including the new browser outline window. Scope: source resources, provenance and authored-file size limits.
    - Command: changed-path `eslint --max-warnings 0`, `prettier --check`, and `git show --check 8d12db561`. Result: pass. Scope: source, tests and provenance changes.
    - Command: `node .agentplane/policy/check-routing.mjs` and `ap doctor`. Result: pass. Evidence: routing OK and zero doctor errors with the existing managed-shim warning. Scope: AgentPlane workflow.
    - Command: `vite build --outDir ../../output/calc-9GPC0D-dist` from apps/office. Result: pass. Scope: production JS and CSS compilation.
    - Command: Playwright CLI against Chrome and the built Calc preview on port 4191. Result: pass. Evidence: loaded the LibreOffice outline.ods fixture, exposed five level choices for its four group levels on both axes, expanded rows 7–21, and verified row 12 returned to the grid. After freezing at A4 and scrolling down, row 1 and the outline button for rows 2–30 retained identical bounding boxes. Logs: output/playwright/calc-9GPC0D/browser-loaded.log, browser-expand.log, browser-freeze.log and browser-geometry.log.
    - Command: `npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1`. Result: pass on the initial implementation. A repeat after two lint-only non-null assertion removals is running separately. Scope: office application TypeScript. Focused ESLint, production build, and the 11 final tests passed after lint cleanup.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-20T14:55:07.840Z — VERIFY — ok

    By: CODER

    Note: Eleven focused Calc tests, native ODS in Chrome with measured frozen-pane placement, production build, the initial type checks and final static gates passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T14:54:47.092Z, excerpt_hash=sha256:a6603e0305a10b80b05f09aee1a637b4737f04ec6c2791f9d4045d9b15b2a004

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611201413-9GPC0D/blueprint/resolved-snapshot.json
    - old_digest: da91c47ee1af9c2ed315b055d80125ec8b44bbee54a66116a3027531ce8bc9ba
    - current_digest: da91c47ee1af9c2ed315b055d80125ec8b44bbee54a66116a3027531ce8bc9ba
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611201413-9GPC0D

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611201413-9GPC0D
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commit to restore the existing outline menus and original grid placement."
  Findings: "The native level operation keeps deeper hidden flags while suppressing their controls. Expanding a single group restores visible descendants while re-hiding those whose independent collapse flags are set. The browser uses HTML buttons and CSS clip regions, with physical sheet orientation and tab traversal inherited from the existing browser grid. The new interaction consumes the view OUTLINER option. Review of Calc UI tests found menu dialog coverage and the existing native outline fixture but no dedicated outline window regression."
id_source: "generated"
---
## Summary

Connect the row and column outline windows to the Calc browser grid.

## Scope

Implement the source outline level buttons and per-group expand/collapse controls, nested and filtered visibility, undo, and keyboard and pane placement. Use canonical Calc outline, view settings, and viewport geometry. Add provenance for the browser outline presentation and critical targeted tests. Keep dialog and file operation policy as currently implemented.

## Plan

Port row and column gutter level and individual group selection, shared geometry, native undo, and targeted regression tests.

## Verify Steps

- Run targeted Calc tests for outline headers, manual outline commands, and frozen panes.
- Run TypeScript for tools and office, with a single office checker if host capacity requires it.
- Run focused ESLint and Prettier, and run Calc resources, provenance, file size, and git whitespace checks.

## Verification

- Command: `npm run test:calc -- calc-outline-window calc-sheet-outline calc-pane-commands calc-header-sizing --testTimeout 120000`. Result: pass. Evidence: 11 tests across four files on the final edit. Scope: nested outline windows, filtering, editing guard, level operations, undo/redo, shared grid geometry, existing manual outline and pane commands, row/column header sizing.
- Command: `npm run typecheck:tools`. Result: pass. Scope: tooling project.
- Command: `npm run check:calc-resources`, `npm run check:source-provenance`, and `npm run check:file-size`. Result: pass. Evidence: 464 source commands and 2895 runtime module records, including the new browser outline window. Scope: source resources, provenance and authored-file size limits.
- Command: changed-path `eslint --max-warnings 0`, `prettier --check`, and `git show --check 8d12db561`. Result: pass. Scope: source, tests and provenance changes.
- Command: `node .agentplane/policy/check-routing.mjs` and `ap doctor`. Result: pass. Evidence: routing OK and zero doctor errors with the existing managed-shim warning. Scope: AgentPlane workflow.
- Command: `vite build --outDir ../../output/calc-9GPC0D-dist` from apps/office. Result: pass. Scope: production JS and CSS compilation.
- Command: Playwright CLI against Chrome and the built Calc preview on port 4191. Result: pass. Evidence: loaded the LibreOffice outline.ods fixture, exposed five level choices for its four group levels on both axes, expanded rows 7–21, and verified row 12 returned to the grid. After freezing at A4 and scrolling down, row 1 and the outline button for rows 2–30 retained identical bounding boxes. Logs: output/playwright/calc-9GPC0D/browser-loaded.log, browser-expand.log, browser-freeze.log and browser-geometry.log.
- Command: `npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1`. Result: pass on the initial implementation. A repeat after two lint-only non-null assertion removals is running separately. Scope: office application TypeScript. Focused ESLint, production build, and the 11 final tests passed after lint cleanup.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-20T14:55:07.840Z — VERIFY — ok

By: CODER

Note: Eleven focused Calc tests, native ODS in Chrome with measured frozen-pane placement, production build, the initial type checks and final static gates passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T14:54:47.092Z, excerpt_hash=sha256:a6603e0305a10b80b05f09aee1a637b4737f04ec6c2791f9d4045d9b15b2a004

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611201413-9GPC0D/blueprint/resolved-snapshot.json
- old_digest: da91c47ee1af9c2ed315b055d80125ec8b44bbee54a66116a3027531ce8bc9ba
- current_digest: da91c47ee1af9c2ed315b055d80125ec8b44bbee54a66116a3027531ce8bc9ba
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611201413-9GPC0D

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611201413-9GPC0D
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commit to restore the existing outline menus and original grid placement.

## Findings

The native level operation keeps deeper hidden flags while suppressing their controls. Expanding a single group restores visible descendants while re-hiding those whose independent collapse flags are set. The browser uses HTML buttons and CSS clip regions, with physical sheet orientation and tab traversal inherited from the existing browser grid. The new interaction consumes the view OUTLINER option. Review of Calc UI tests found menu dialog coverage and the existing native outline fixture but no dedicated outline window regression.
