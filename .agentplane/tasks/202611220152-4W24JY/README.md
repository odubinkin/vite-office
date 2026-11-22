---
id: "202611220152-4W24JY"
title: "Connect Calc Number Format sidebar and currency controls"
result_summary: "Connected Calc Properties number formatting and native currency selection."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on:
  - "202611220122-5AP3TA"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T01:52:58.331Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T02:08:14.501Z"
  updated_by: "CODER"
  note: "Verified: 116 focused checks and production Chromium cover the Calc Number Format panel, native currency selection, selection history and paint."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T02:08:25.148Z"
  updated_by: "EVALUATOR"
  note: "Calc Number Format sidebar and currency split buttons satisfy the approved native control scope."
  evaluated_sha: "46ce7b4a8e4afd0d9f9ad37d4c506d016eb04c31"
  blueprint_digest: "13d73ead5a213c5d12d3436e9ba7b304ba2084d018aa7789ab786247c3d9aab1"
  evidence_refs:
    - ".agentplane/tasks/202611220152-4W24JY/README.md"
    - ".agentplane/tasks/202611220152-4W24JY/quality/20261122-020825148-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611220152-4W24JY/quality/20261122-020825148-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611220152-4W24JY/quality/20261122-020825148-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611220152-4W24JY/blueprint/resolved-snapshot.json"
    - "output/calc-task18-verification.md"
    - "output/calc-task18-browser.log"
    - "46ce7b4a8e4afd0d9f9ad37d4c506d016eb04c31"
  findings:
    - "Verified category and option requests use the original selection and current document formatter, including the native mixed-state and comma termination behaviors."
    - "The pinned currency accessor case passes. Chromium confirms grid resize, red output, currency selection and retained sidebar reveal."
commit:
  hash: "46ce7b4a8e4afd0d9f9ad37d4c506d016eb04c31"
  message: "🧩 4W24JY code: connect Calc Number Format sidebar and currency controls"
comments:
  -
    author: "CODER"
    body: "Start: connect native Calc number format sidebar, request and currency control contracts."
  -
    author: "CODER"
    body: "Verified: connected the native Number Format panel, currency split buttons, formatter color and document currency lookup."
events:
  -
    type: "status"
    at: "2026-11-22T01:52:58.527Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect native Calc number format sidebar, request and currency control contracts."
  -
    type: "verify"
    at: "2026-11-22T02:08:14.501Z"
    author: "CODER"
    state: "ok"
    note: "Verified: 116 focused checks and production Chromium cover the Calc Number Format panel, native currency selection, selection history and paint."
  -
    type: "status"
    at: "2026-11-22T02:09:38.797Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: connected the native Number Format panel, currency split buttons, formatter color and document currency lookup."
doc_version: 3
doc_updated_at: "2026-11-22T02:09:38.798Z"
doc_updated_by: "CODER"
description: "Mount the native Properties sidebar number panel and currency selector, with original Sfx category and option arguments, formatter-backed document currencies, and grid number-format colors."
sections:
  Summary: |-
    Connect Calc Number Format sidebar and currency controls

    Mount the native Properties sidebar number panel and currency selector, with original Sfx category and option arguments, formatter-backed document currencies, and grid number-format colors.
  Scope: "Connect the native Calc Properties child and Number Format panel over shared sidebar components. Represent category selection, decimal and denominator inputs, leading zeros, red negatives, grouping and engineering. Bind the native UInt16 and comma-separated String Sfx commands, existing formatting shortcuts, currency split buttons and the formatter-backed current document currency list. Include currency-key insertion, original currency ordering and sticky split-button selection, formatter colors in grid rendering, native regression ports, and canonical inventory updates. Other sidebar content, complete Format Cells dialog and persistence subsystems remain separate."
  Plan: "Derive category and option state from the selected pattern and cursor format. Build the shared right-docked Calc child and source panel controls, with native binds and selection history. Add formatter-owned currency resolution and current-document entries, shared toolbar chooser, and number-format drawing colors. Verify upstream tests and isolated browser acceptance."
  Verify Steps: |-
    - Run focused Calc tests for Properties, category and option selection, currency request and document list, mixed state, leading-zero and enabling rules, undo and stack isolation, formatted grid color and resize/focus behavior. Port the native currency-accessor regression and look for matching number-panel UI tests.
    - Run focused shared formatter and sidebar tests, typecheck, changed-path lint and format, resource and dependency checks, source provenance and inventory, AgentPlane doctor and routing.
    - Verify on a production build in Chromium. This is task eight of the ten-task checkpoint interval.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T02:08:14.501Z — VERIFY — ok

    By: CODER

    Note: Verified: 116 focused checks and production Chromium cover the Calc Number Format panel, native currency selection, selection history and paint.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T02:07:40.477Z, excerpt_hash=sha256:ab1fd0bcddf35bbd67eb276125337b726986cfb0002edb7dae11fb2de728bcb1

    Details:

    - The focused Calc command from `apps/office` ran `../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 --reporter=verbose src/sc/browser/presentation/calc-number-format-sidebar.test.tsx src/sc/browser/presentation/calc-number-format.test.tsx src/sc/uiconfig/scalc/ui-resources.test.tsx src/sc/browser/presentation/calc-pointer-selection.test.tsx src/sc/browser/presentation/calc-view-options.test.tsx`. All 33 tests passed, including the pinned document currency fixture, typed requests, mixed state, grid color, dock focus, selection and currency replay. Evidence is `output/calc-task18-target-calc.log`.
    - The shared `../../node_modules/.bin/vitest run --config vitest.shared.config.ts --maxWorkers 2 --testTimeout 180000 src/svx/source/tbxctrls/tbcontrl.currency.test.ts src/sfx2/browser/presentation/SidebarDeck.test.tsx src/sfx2/browser/presentation/SidebarDeck-scroll.test.tsx src/svl/source/numbers/zforlist.picture.test.ts src/svl/source/numbers/zforlist.test.ts src/svl/source/numbers/zforlist.recognition.test.ts` command passed 73 tests. Evidence is `output/calc-task18-target-shared.log`.
    - The Writer `../../node_modules/.bin/vitest run --config vitest.writer.config.ts --maxWorkers 2 --testTimeout 180000 src/sw/browser/presentation/writer-view-sidebar-deck.test.tsx src/sw/browser/presentation/writer-view-sidebar-navigation.test.tsx src/sw/browser/presentation/writer-view-sidebar-scroll.test.tsx` command passed ten tests for shared sidebar behavior. Evidence is `output/calc-task18-target-writer.log`.
    - `npm run --workspace apps/office typecheck`, changed-file `prettier --check`, changed-source `eslint --max-warnings 0`, `git diff --check` and `npm run test:static` passed. Logs are `output/calc-task18-types.log`, `output/calc-task18-format-final.log`, `output/calc-task18-lint-final.log`, and `output/calc-task18-static.log`.
    - `npm run check:dependencies`, `npm run check:calc-resources`, `npm run check:source-provenance`, `npm run inventory:parity:calc`, `npm run check:source-tree`, `node .agentplane/policy/check-routing.mjs` and `ap doctor` passed. The inventory reports zero semantic violations. Doctor reports the existing hook readiness warning. Logs carry the `output/calc-task18-` prefix.
    - `playwright-cli -s=calc-task18 run-code --filename=output/playwright/calc-task18/smoke.js` passed in Chromium against the production preview. It measured the docked grid width and verified field edits, actual red text, currency choice, and View sidebar hide and reveal. Evidence is `output/calc-task18-browser.log`.
    - `npm run check:file-size` reports six existing violations outside changed source. The Calc sheet dock now owns the layout and status markup to keep the workbench below the file limit. Evidence is `output/calc-task18-size.log`.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611220152-4W24JY/blueprint/resolved-snapshot.json
    - old_digest: 13d73ead5a213c5d12d3436e9ba7b304ba2084d018aa7789ab786247c3d9aab1
    - current_digest: 13d73ead5a213c5d12d3436e9ba7b304ba2084d018aa7789ab786247c3d9aab1
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611220152-4W24JY

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611220152-4W24JY
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation and associated registry records. Workbook numeric formats and file ownership stay with their existing native model owners."
  Findings: |-
    The first-start Properties deck has a visible collapsed rail. The View command hides its child without deleting the expanded deck. The browser number panel follows the two original typed Calc bindings and projects native category-dependent options, including the original General blank precision. The grid consumes the formatter color for display.

    The native document accessor reads the format table, including explicit currency formats already entered but not currently used by a cell. The toolbar resolves those identities to the shared table and projects the original system, used-symbol, other-symbol and bank rows. A focused port checks the pinned Slovenian euro fixture and deduplication. The browser uses its platform collation.

    CALC-831 and CALC-832 retain the pinned mixed-to-General no-op and terminated options fields. The full Format Cells dialog and other Properties sections remain separate application bindings.
id_source: "generated"
---
## Summary

Connect Calc Number Format sidebar and currency controls

Mount the native Properties sidebar number panel and currency selector, with original Sfx category and option arguments, formatter-backed document currencies, and grid number-format colors.

## Scope

Connect the native Calc Properties child and Number Format panel over shared sidebar components. Represent category selection, decimal and denominator inputs, leading zeros, red negatives, grouping and engineering. Bind the native UInt16 and comma-separated String Sfx commands, existing formatting shortcuts, currency split buttons and the formatter-backed current document currency list. Include currency-key insertion, original currency ordering and sticky split-button selection, formatter colors in grid rendering, native regression ports, and canonical inventory updates. Other sidebar content, complete Format Cells dialog and persistence subsystems remain separate.

## Plan

Derive category and option state from the selected pattern and cursor format. Build the shared right-docked Calc child and source panel controls, with native binds and selection history. Add formatter-owned currency resolution and current-document entries, shared toolbar chooser, and number-format drawing colors. Verify upstream tests and isolated browser acceptance.

## Verify Steps

- Run focused Calc tests for Properties, category and option selection, currency request and document list, mixed state, leading-zero and enabling rules, undo and stack isolation, formatted grid color and resize/focus behavior. Port the native currency-accessor regression and look for matching number-panel UI tests.
- Run focused shared formatter and sidebar tests, typecheck, changed-path lint and format, resource and dependency checks, source provenance and inventory, AgentPlane doctor and routing.
- Verify on a production build in Chromium. This is task eight of the ten-task checkpoint interval.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T02:08:14.501Z — VERIFY — ok

By: CODER

Note: Verified: 116 focused checks and production Chromium cover the Calc Number Format panel, native currency selection, selection history and paint.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T02:07:40.477Z, excerpt_hash=sha256:ab1fd0bcddf35bbd67eb276125337b726986cfb0002edb7dae11fb2de728bcb1

Details:

- The focused Calc command from `apps/office` ran `../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 --reporter=verbose src/sc/browser/presentation/calc-number-format-sidebar.test.tsx src/sc/browser/presentation/calc-number-format.test.tsx src/sc/uiconfig/scalc/ui-resources.test.tsx src/sc/browser/presentation/calc-pointer-selection.test.tsx src/sc/browser/presentation/calc-view-options.test.tsx`. All 33 tests passed, including the pinned document currency fixture, typed requests, mixed state, grid color, dock focus, selection and currency replay. Evidence is `output/calc-task18-target-calc.log`.
- The shared `../../node_modules/.bin/vitest run --config vitest.shared.config.ts --maxWorkers 2 --testTimeout 180000 src/svx/source/tbxctrls/tbcontrl.currency.test.ts src/sfx2/browser/presentation/SidebarDeck.test.tsx src/sfx2/browser/presentation/SidebarDeck-scroll.test.tsx src/svl/source/numbers/zforlist.picture.test.ts src/svl/source/numbers/zforlist.test.ts src/svl/source/numbers/zforlist.recognition.test.ts` command passed 73 tests. Evidence is `output/calc-task18-target-shared.log`.
- The Writer `../../node_modules/.bin/vitest run --config vitest.writer.config.ts --maxWorkers 2 --testTimeout 180000 src/sw/browser/presentation/writer-view-sidebar-deck.test.tsx src/sw/browser/presentation/writer-view-sidebar-navigation.test.tsx src/sw/browser/presentation/writer-view-sidebar-scroll.test.tsx` command passed ten tests for shared sidebar behavior. Evidence is `output/calc-task18-target-writer.log`.
- `npm run --workspace apps/office typecheck`, changed-file `prettier --check`, changed-source `eslint --max-warnings 0`, `git diff --check` and `npm run test:static` passed. Logs are `output/calc-task18-types.log`, `output/calc-task18-format-final.log`, `output/calc-task18-lint-final.log`, and `output/calc-task18-static.log`.
- `npm run check:dependencies`, `npm run check:calc-resources`, `npm run check:source-provenance`, `npm run inventory:parity:calc`, `npm run check:source-tree`, `node .agentplane/policy/check-routing.mjs` and `ap doctor` passed. The inventory reports zero semantic violations. Doctor reports the existing hook readiness warning. Logs carry the `output/calc-task18-` prefix.
- `playwright-cli -s=calc-task18 run-code --filename=output/playwright/calc-task18/smoke.js` passed in Chromium against the production preview. It measured the docked grid width and verified field edits, actual red text, currency choice, and View sidebar hide and reveal. Evidence is `output/calc-task18-browser.log`.
- `npm run check:file-size` reports six existing violations outside changed source. The Calc sheet dock now owns the layout and status markup to keep the workbench below the file limit. Evidence is `output/calc-task18-size.log`.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611220152-4W24JY/blueprint/resolved-snapshot.json
- old_digest: 13d73ead5a213c5d12d3436e9ba7b304ba2084d018aa7789ab786247c3d9aab1
- current_digest: 13d73ead5a213c5d12d3436e9ba7b304ba2084d018aa7789ab786247c3d9aab1
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611220152-4W24JY

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611220152-4W24JY
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation and associated registry records. Workbook numeric formats and file ownership stay with their existing native model owners.

## Findings

The first-start Properties deck has a visible collapsed rail. The View command hides its child without deleting the expanded deck. The browser number panel follows the two original typed Calc bindings and projects native category-dependent options, including the original General blank precision. The grid consumes the formatter color for display.

The native document accessor reads the format table, including explicit currency formats already entered but not currently used by a cell. The toolbar resolves those identities to the shared table and projects the original system, used-symbol, other-symbol and bank rows. A focused port checks the pinned Slovenian euro fixture and deduplication. The browser uses its platform collation.

CALC-831 and CALC-832 retain the pinned mixed-to-General no-op and terminated options fields. The full Format Cells dialog and other Properties sections remain separate application bindings.
