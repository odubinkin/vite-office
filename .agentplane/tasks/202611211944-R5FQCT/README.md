---
id: "202611211944-R5FQCT"
title: "Connect Calc Paste Only commands"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T19:44:47.541Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T19:55:31.878Z"
  updated_by: "CODER"
  note: "170 focused Calc tests passed in 22 files, including the CalcPasteOnly port. Office TypeScript, changed-path formatting and lint, resources, provenance, dependencies, routing and doctor passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-21T19:55:43.151Z"
  updated_by: "EVALUATOR"
  note: "Source Paste Only slot masks, typed results, date discrimination and full destination Undo verified."
  evaluated_sha: "9afda05bed158df6b1c7f65891d3c4d3e88d976b"
  blueprint_digest: "61a0fd38ecbfab1f6eb271d7729167e969b127f39c603fea66c31d7f2914c11c"
  evidence_refs:
    - ".agentplane/tasks/202611211944-R5FQCT/README.md"
    - ".agentplane/tasks/202611211944-R5FQCT/quality/20261121-195543151-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611211944-R5FQCT/quality/20261121-195543151-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611211944-R5FQCT/quality/20261121-195543151-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611211944-R5FQCT/blueprint/resolved-snapshot.json"
    - "output/calc-task8-focused-final.log"
    - "output/calc-task8-verification.md"
    - "9afda05bed158df6b1c7f65891d3c4d3e88d976b"
  findings:
    - "The port of CalcPasteOnly preserves the numeric zero, the rebased formula and the text result rules. Full targeted coverage also checks hard errors, multiline results and sparse clipboard rectangles."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: connect native Calc typed clipboard masks, source Paste Only slots and undo."
events:
  -
    type: "status"
    at: "2026-11-21T19:45:00.281Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect native Calc typed clipboard masks, source Paste Only slots and undo."
  -
    type: "verify"
    at: "2026-11-21T19:55:31.878Z"
    author: "CODER"
    state: "ok"
    note: "170 focused Calc tests passed in 22 files, including the CalcPasteOnly port. Office TypeScript, changed-path formatting and lint, resources, provenance, dependencies, routing and doctor passed."
doc_version: 3
doc_updated_at: "2026-11-21T19:55:31.948Z"
doc_updated_by: "CODER"
description: "Expose the native selected-type clipboard routes and preserve formula results, destination styles and undo."
sections:
  Summary: "Connect the three original Calc Paste Only commands through the internal clipboard, native insertion masks and shared Undo."
  Scope: "Task eight of the ten-task cycle. Expose the source Edit > Paste Special > Text, Number and Formula items for supported in-workbook selections. Port the native typed copy, number-format date discrimination, evaluated results, reference relocation, current replacement warnings, typed overwrite and Undo. Preserve external text as a separate clipboard route. Paste Special dialog, transpose, links, movement and Cut are separate workflow blocks."
  Plan: "Port native typed clipboard cell selection, route Paste Only Text, Number and Formula through the original masks, and verify source behavior, numeric/date distinction, references and Undo."
  Verify Steps: "Run focused Calc clipboard, paste block and selection, formula result, rich text and mounted workspace suites. Run Office TypeScript and changed-path ESLint and Prettier. Check Calc resources, provenance, module boundaries, policy routing and AgentPlane doctor."
  Verification: |-
    - Command: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 clipboard paste-block paste-selection paste-editability reference-protocol formularesult rich-text richstring calc-workbench calc-recalculation`. Result: pass. Evidence: 170 tests in 22 files. Scope: mounted Calc clipboard and workspace, native clipboard storage, selected paste, references, deletion, formula results, rich text, Undo and calculation.
    - Command: `node_modules/.bin/tsc --noEmit --project apps/office/tsconfig.json --singleThreaded --checkers 1 --incremental --tsBuildInfoFile output/calc-458SWH-office.tsbuildinfo`. Result: pass. Evidence: zero diagnostics. Scope: Office TypeScript.
    - Commands: `xargs node_modules/.bin/prettier --check < output/calc-task8-paths.txt` and `rg '^apps/.*\.tsx?$' output/calc-task8-paths.txt | xargs node_modules/.bin/eslint --max-warnings 0`. Result: pass. Evidence: all changed paths formatted and zero lint warnings. Scope: changed sources, tests and registry.
    - Commands: `npm run check:calc-resources`, `npm run check:source-provenance`, and `npm run check:dependencies`. Result: pass. Evidence: 477 Calc commands, 11 menus, 3,010 classified modules and valid imports. Scope: Calc resources and Office boundaries.
    - Commands: `node .agentplane/policy/check-routing.mjs` and `ap doctor`. Result: pass. Evidence: policy routing and doctor OK with the existing startup-readiness warning. Scope: workspace task routing.
    - Scheduled coverage: this is task eight of ten. Full coverage follows task ten.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T19:55:31.878Z — VERIFY — ok

    By: CODER

    Note: 170 focused Calc tests passed in 22 files, including the CalcPasteOnly port. Office TypeScript, changed-path formatting and lint, resources, provenance, dependencies, routing and doctor passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T19:55:30.999Z, excerpt_hash=sha256:0320c13b0a5bfad9a7d7e98e20b65b0897730368775a25a7288ad4035a702459

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611211944-R5FQCT/blueprint/resolved-snapshot.json
    - old_digest: 61a0fd38ecbfab1f6eb271d7729167e969b127f39c603fea66c31d7f2914c11c
    - current_digest: 61a0fd38ecbfab1f6eb271d7729167e969b127f39c603fea66c31d7f2914c11c
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611211944-R5FQCT

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611211944-R5FQCT
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped implementation commit to restore normal clipboard masks and the previous menu availability."
  Findings: |-
    The pinned menu commands use the original Sfx slots and flags: S for Paste Only Text, V for Paste Only Numbers and F for Paste Only Formula. The mounted port of CalcPasteOnly verifies the original empty C1, numeric zero in D1 and relative SUM(E2:E3) in E1. Browser menu dispatch revalidates the actual custom clipboard identity at execution. For plain external clipboard data, the separate Paste and Paste Unformatted Text paths remain available.

    The general native clipboard column handler distinguishes dates and times from other numbers using the source format. It preserves evaluated scalar results, empty and multiline distinctions, and tokenless hard errors. The latter source representation is recorded as CALC-815. Selective paste retains destination formatting and uses the original all-content Undo snapshot. Selective deletion now uses the same native date and time classification as insertion.

    The original assertion remains in the single-row fast path for an invalid missing source column. The document routes sparse clip rectangles to the existing general paste path before calling that fast path. This preserves trailing empty columns without requiring eagerly allocated clipboard columns. Rich text and typed cells use the general path.

    The activated commands cover represented simple same-workbook selections. The source custom clipboard identity is available only in browsers supporting the format. Until the browser reads a current ClipboardItem, its menu state is based on the last in-workbook source. The Paste Special dialog, transpose, links, shifts and cut are separate workflow work.

    AgentPlane doctor passed with its pre-existing managed-hook readiness warning.
id_source: "generated"
---
## Summary

Connect the three original Calc Paste Only commands through the internal clipboard, native insertion masks and shared Undo.

## Scope

Task eight of the ten-task cycle. Expose the source Edit > Paste Special > Text, Number and Formula items for supported in-workbook selections. Port the native typed copy, number-format date discrimination, evaluated results, reference relocation, current replacement warnings, typed overwrite and Undo. Preserve external text as a separate clipboard route. Paste Special dialog, transpose, links, movement and Cut are separate workflow blocks.

## Plan

Port native typed clipboard cell selection, route Paste Only Text, Number and Formula through the original masks, and verify source behavior, numeric/date distinction, references and Undo.

## Verify Steps

Run focused Calc clipboard, paste block and selection, formula result, rich text and mounted workspace suites. Run Office TypeScript and changed-path ESLint and Prettier. Check Calc resources, provenance, module boundaries, policy routing and AgentPlane doctor.

## Verification

- Command: `cd apps/office && ../../node_modules/.bin/vitest run --config vitest.calc.config.ts --maxWorkers 2 --testTimeout 180000 clipboard paste-block paste-selection paste-editability reference-protocol formularesult rich-text richstring calc-workbench calc-recalculation`. Result: pass. Evidence: 170 tests in 22 files. Scope: mounted Calc clipboard and workspace, native clipboard storage, selected paste, references, deletion, formula results, rich text, Undo and calculation.
- Command: `node_modules/.bin/tsc --noEmit --project apps/office/tsconfig.json --singleThreaded --checkers 1 --incremental --tsBuildInfoFile output/calc-458SWH-office.tsbuildinfo`. Result: pass. Evidence: zero diagnostics. Scope: Office TypeScript.
- Commands: `xargs node_modules/.bin/prettier --check < output/calc-task8-paths.txt` and `rg '^apps/.*\.tsx?$' output/calc-task8-paths.txt | xargs node_modules/.bin/eslint --max-warnings 0`. Result: pass. Evidence: all changed paths formatted and zero lint warnings. Scope: changed sources, tests and registry.
- Commands: `npm run check:calc-resources`, `npm run check:source-provenance`, and `npm run check:dependencies`. Result: pass. Evidence: 477 Calc commands, 11 menus, 3,010 classified modules and valid imports. Scope: Calc resources and Office boundaries.
- Commands: `node .agentplane/policy/check-routing.mjs` and `ap doctor`. Result: pass. Evidence: policy routing and doctor OK with the existing startup-readiness warning. Scope: workspace task routing.
- Scheduled coverage: this is task eight of ten. Full coverage follows task ten.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T19:55:31.878Z — VERIFY — ok

By: CODER

Note: 170 focused Calc tests passed in 22 files, including the CalcPasteOnly port. Office TypeScript, changed-path formatting and lint, resources, provenance, dependencies, routing and doctor passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T19:55:30.999Z, excerpt_hash=sha256:0320c13b0a5bfad9a7d7e98e20b65b0897730368775a25a7288ad4035a702459

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611211944-R5FQCT/blueprint/resolved-snapshot.json
- old_digest: 61a0fd38ecbfab1f6eb271d7729167e969b127f39c603fea66c31d7f2914c11c
- current_digest: 61a0fd38ecbfab1f6eb271d7729167e969b127f39c603fea66c31d7f2914c11c
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611211944-R5FQCT

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611211944-R5FQCT
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped implementation commit to restore normal clipboard masks and the previous menu availability.

## Findings

The pinned menu commands use the original Sfx slots and flags: S for Paste Only Text, V for Paste Only Numbers and F for Paste Only Formula. The mounted port of CalcPasteOnly verifies the original empty C1, numeric zero in D1 and relative SUM(E2:E3) in E1. Browser menu dispatch revalidates the actual custom clipboard identity at execution. For plain external clipboard data, the separate Paste and Paste Unformatted Text paths remain available.

The general native clipboard column handler distinguishes dates and times from other numbers using the source format. It preserves evaluated scalar results, empty and multiline distinctions, and tokenless hard errors. The latter source representation is recorded as CALC-815. Selective paste retains destination formatting and uses the original all-content Undo snapshot. Selective deletion now uses the same native date and time classification as insertion.

The original assertion remains in the single-row fast path for an invalid missing source column. The document routes sparse clip rectangles to the existing general paste path before calling that fast path. This preserves trailing empty columns without requiring eagerly allocated clipboard columns. Rich text and typed cells use the general path.

The activated commands cover represented simple same-workbook selections. The source custom clipboard identity is available only in browsers supporting the format. Until the browser reads a current ClipboardItem, its menu state is based on the last in-workbook source. The Paste Special dialog, transpose, links, shifts and cut are separate workflow work.

AgentPlane doctor passed with its pre-existing managed-hook readiness warning.
