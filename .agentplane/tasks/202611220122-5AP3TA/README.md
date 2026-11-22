---
id: "202611220122-5AP3TA"
title: "Connect Calc number format shortcuts and precision controls"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on:
  - "202611220105-51SY7G"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T01:23:14.001Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T01:49:27.720Z"
  updated_by: "CODER"
  note: "Verified: 169 focused cases, two upstream regressions, Chromium production UI, and numeric ODS round trips."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T01:49:42.423Z"
  updated_by: "EVALUATOR"
  note: "Pinned numeric shortcut contracts are connected and verified in the production Calc workbench."
  evaluated_sha: "84e2217447e8bd2bca3d062125ec9685b2ff61e7"
  blueprint_digest: "d4d3f46956b4e1955a152dbac4e66fad710e41a1cca511880360b9e4d7302510"
  evidence_refs:
    - ".agentplane/tasks/202611220122-5AP3TA/README.md"
    - ".agentplane/tasks/202611220122-5AP3TA/quality/20261122-014942423-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611220122-5AP3TA/quality/20261122-014942423-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611220122-5AP3TA/quality/20261122-014942423-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611220122-5AP3TA/blueprint/resolved-snapshot.json"
    - "output/calc-task17-verification.md"
    - "output/calc-task17-browser.log"
    - "84e2217447e8bd2bca3d062125ec9685b2ff61e7"
  findings:
    - "The original tdf133342 fixture and tdf82398 command path verify locale preservation and the actual Date slot."
    - "Generated time, fraction, currency and percent styles survive ODS round trips. The implementation retains the pinned handling recorded in CALC-828 through CALC-830."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: connect native Calc numeric formats and precision controls to the existing formatter and history."
events:
  -
    type: "status"
    at: "2026-11-22T01:23:14.389Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect native Calc numeric formats and precision controls to the existing formatter and history."
  -
    type: "verify"
    at: "2026-11-22T01:49:27.720Z"
    author: "CODER"
    state: "ok"
    note: "Verified: 169 focused cases, two upstream regressions, Chromium production UI, and numeric ODS round trips."
doc_version: 3
doc_updated_at: "2026-11-22T01:49:27.772Z"
doc_updated_by: "CODER"
description: "Connect native Calc menu and toolbar format commands, their state and history, and the shared source numeric picture generation needed by decimal and thousands controls."
sections:
  Summary: |-
    Connect Calc number format shortcuts and precision controls

    Connect native Calc menu and toolbar format commands, their state and history, and the shared source numeric picture generation needed by decimal and thousands controls.
  Scope: "Cover the ten pinned NumberFormat shortcut slots, including explicit currency key input, menu and visible toolbar actions, expanded marked-range format state, decimal steps, and thousands separator toggling. Route source locale, metadata and generated format strings through the existing SvNumberFormatter. The full Format Cells dialog, generic sidebar number formatting and currency chooser are separate bindings."
  Plan: "Connect native Calc preset and precision commands using compiled document formats, actual locale and checked state, the existing model and selection format history. Port source numeric picture generation and test both menu and toolbar."
  Verify Steps: |-
    - Run focused Calc tests for native toolbar and menu commands, exact format keys and display, selected ranges, history, language context, and ODS reopening. Port the tdf133342 localized percent precision regression.
    - Run focused shared number formatting tests, application typecheck, changed-source lint/format, Calc resources, dependency and source provenance/inventory, AgentPlane routing and doctor.
    - Verify production build and Chromium toolbar/menu behavior. This is task seven of the current ten-task checkpoint interval.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T01:49:27.720Z — VERIFY — ok

    By: CODER

    Note: Verified: 169 focused cases, two upstream regressions, Chromium production UI, and numeric ODS round trips.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T01:48:38.539Z, excerpt_hash=sha256:b51edbe6b6c85fbac8acf517e8db886159d150f3e93dc76b570c70279b717e95

    Details:

    - `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 src/sc/browser/presentation/calc-number-format.test.tsx src/sc/uiconfig/scalc/ui-resources.test.tsx src/sc/source/ui/view/format-boundaries.test.ts src/sc/source/filter/xml/ods.test.ts src/sc/source/filter/oox/excelfilter.test.ts` passed 58 checks. A later focused pass with `--reporter=verbose` for calc-number-format, calc-text-to-columns, ui-resources and format-boundaries passed 24 checks and added seven distinct cases for a total of 65. Logs are `output/calc-task17-target-calc.log` and `output/calc-task17-target-ui-final.log`.
    - `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.shared.config.ts --maxWorkers 2 --testTimeout 180000 zforlist.picture.test.ts zforlist.test.ts zformat.fraction.test.ts zformat.native-number.test.ts zforlist.recognition.test.ts` passed 99 formatter checks. Evidence is `output/calc-task17-target-shared.log`.
    - `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.writer.config.ts --maxWorkers 2 --testTimeout 180000 odt-table-values.test.ts odt-list-label-alignment-roundtrip.test.ts` passed five shared ODF consumer checks. Evidence is `output/calc-task17-target-writer.log`.
    - `npm run --workspace apps/office typecheck`, `npm run test:static`, changed-path `prettier --check`, changed-source `eslint --max-warnings 0`, and `git diff --check` passed. Logs are `output/calc-task17-types-final.log`, `output/calc-task17-static.log`, `output/calc-task17-format-final.log`, and `output/calc-task17-eslint-final.log`.
    - `npm run check:dependencies`, `npm run check:calc-resources`, `npm run check:source-provenance`, `npm run inventory:parity:calc`, `npm run check:source-tree`, `node .agentplane/policy/check-routing.mjs`, and `ap doctor` passed. The inventory reports zero semantic violations. Doctor retains the existing managed-hook readiness warning. Logs carry the `output/calc-task17-` prefix.
    - `playwright-cli -s=calc-task17 run-code --filename=output/playwright/calc-task17/smoke.js` passed in Chromium against the production preview. The formatting toolbar and Number Format menu applied presets, decimal steps and grouping with checked states and undo and redo. Evidence is `output/calc-task17-browser.log`.
    - `npm run check:file-size` reports six pre-existing violations outside the changed source. The shared ODF token vocabulary now sits in its source-matched declaration module. All changed sources pass the size limit. Evidence is `output/calc-task17-file-size.log`.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611220122-5AP3TA/blueprint/resolved-snapshot.json
    - old_digest: d4d3f46956b4e1955a152dbac4e66fad710e41a1cca511880360b9e4d7302510
    - current_digest: d4d3f46956b4e1955a152dbac4e66fad710e41a1cca511880360b9e4d7302510
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611220122-5AP3TA

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611220122-5AP3TA
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commits. Actual number formats and persisted styles remain in the existing formatter and workbook filter owners."
  Findings: |-
    The original French percent fixture exposed a Calc import defect. Calc assigned the ODS style's format key and inherited the system format language. The source UNO property applies both. Binding both items retained the French style, the exact space before the percent sign, and the generated decimal precision on reopening.

    The same ODS path now carries generated fractional seconds, elapsed-time overflow, fraction grouping and the currency-symbol language. The original tdf82398 regression now applies Date through the toolbar before running Text to Columns and checks all sixteen cells.

    CALC-828 through CALC-830 record the source localized Number toggle, the active-edit Time branch, and the category difference between contiguous and separate marked runs. The task retains each behavior. The dedicated Format Cells dialog, sidebar controls and currency chooser are separate bindings.
id_source: "generated"
---
## Summary

Connect Calc number format shortcuts and precision controls

Connect native Calc menu and toolbar format commands, their state and history, and the shared source numeric picture generation needed by decimal and thousands controls.

## Scope

Cover the ten pinned NumberFormat shortcut slots, including explicit currency key input, menu and visible toolbar actions, expanded marked-range format state, decimal steps, and thousands separator toggling. Route source locale, metadata and generated format strings through the existing SvNumberFormatter. The full Format Cells dialog, generic sidebar number formatting and currency chooser are separate bindings.

## Plan

Connect native Calc preset and precision commands using compiled document formats, actual locale and checked state, the existing model and selection format history. Port source numeric picture generation and test both menu and toolbar.

## Verify Steps

- Run focused Calc tests for native toolbar and menu commands, exact format keys and display, selected ranges, history, language context, and ODS reopening. Port the tdf133342 localized percent precision regression.
- Run focused shared number formatting tests, application typecheck, changed-source lint/format, Calc resources, dependency and source provenance/inventory, AgentPlane routing and doctor.
- Verify production build and Chromium toolbar/menu behavior. This is task seven of the current ten-task checkpoint interval.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T01:49:27.720Z — VERIFY — ok

By: CODER

Note: Verified: 169 focused cases, two upstream regressions, Chromium production UI, and numeric ODS round trips.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T01:48:38.539Z, excerpt_hash=sha256:b51edbe6b6c85fbac8acf517e8db886159d150f3e93dc76b570c70279b717e95

Details:

- `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 src/sc/browser/presentation/calc-number-format.test.tsx src/sc/uiconfig/scalc/ui-resources.test.tsx src/sc/source/ui/view/format-boundaries.test.ts src/sc/source/filter/xml/ods.test.ts src/sc/source/filter/oox/excelfilter.test.ts` passed 58 checks. A later focused pass with `--reporter=verbose` for calc-number-format, calc-text-to-columns, ui-resources and format-boundaries passed 24 checks and added seven distinct cases for a total of 65. Logs are `output/calc-task17-target-calc.log` and `output/calc-task17-target-ui-final.log`.
- `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.shared.config.ts --maxWorkers 2 --testTimeout 180000 zforlist.picture.test.ts zforlist.test.ts zformat.fraction.test.ts zformat.native-number.test.ts zforlist.recognition.test.ts` passed 99 formatter checks. Evidence is `output/calc-task17-target-shared.log`.
- `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.writer.config.ts --maxWorkers 2 --testTimeout 180000 odt-table-values.test.ts odt-list-label-alignment-roundtrip.test.ts` passed five shared ODF consumer checks. Evidence is `output/calc-task17-target-writer.log`.
- `npm run --workspace apps/office typecheck`, `npm run test:static`, changed-path `prettier --check`, changed-source `eslint --max-warnings 0`, and `git diff --check` passed. Logs are `output/calc-task17-types-final.log`, `output/calc-task17-static.log`, `output/calc-task17-format-final.log`, and `output/calc-task17-eslint-final.log`.
- `npm run check:dependencies`, `npm run check:calc-resources`, `npm run check:source-provenance`, `npm run inventory:parity:calc`, `npm run check:source-tree`, `node .agentplane/policy/check-routing.mjs`, and `ap doctor` passed. The inventory reports zero semantic violations. Doctor retains the existing managed-hook readiness warning. Logs carry the `output/calc-task17-` prefix.
- `playwright-cli -s=calc-task17 run-code --filename=output/playwright/calc-task17/smoke.js` passed in Chromium against the production preview. The formatting toolbar and Number Format menu applied presets, decimal steps and grouping with checked states and undo and redo. Evidence is `output/calc-task17-browser.log`.
- `npm run check:file-size` reports six pre-existing violations outside the changed source. The shared ODF token vocabulary now sits in its source-matched declaration module. All changed sources pass the size limit. Evidence is `output/calc-task17-file-size.log`.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611220122-5AP3TA/blueprint/resolved-snapshot.json
- old_digest: d4d3f46956b4e1955a152dbac4e66fad710e41a1cca511880360b9e4d7302510
- current_digest: d4d3f46956b4e1955a152dbac4e66fad710e41a1cca511880360b9e4d7302510
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611220122-5AP3TA

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611220122-5AP3TA
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commits. Actual number formats and persisted styles remain in the existing formatter and workbook filter owners.

## Findings

The original French percent fixture exposed a Calc import defect. Calc assigned the ODS style's format key and inherited the system format language. The source UNO property applies both. Binding both items retained the French style, the exact space before the percent sign, and the generated decimal precision on reopening.

The same ODS path now carries generated fractional seconds, elapsed-time overflow, fraction grouping and the currency-symbol language. The original tdf82398 regression now applies Date through the toolbar before running Text to Columns and checks all sixteen cells.

CALC-828 through CALC-830 record the source localized Number toggle, the active-edit Time branch, and the category difference between contiguous and separate marked runs. The task retains each behavior. The dedicated Format Cells dialog, sidebar controls and currency chooser are separate bindings.
