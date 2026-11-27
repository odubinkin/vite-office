---
id: "202611270730-P86BEJ"
title: "Connect Calc Alignment to the native CUI control and item exchange"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T07:31:05.584Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T07:49:17.572Z"
  updated_by: "CODER"
  note: "39 targeted tests passed in six files. Office types, changed-source lint, format and JSDoc, scoped provenance, dependency/source-tree, routing and doctor passed. Full inventory and provenance retain unchanged integration marker failures."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T07:49:20.925Z"
  updated_by: "EVALUATOR"
  note: "The Calc notebook uses the shared CUI alignment owner and the original mouse angle calculation. Native value-state and ODS verification passed."
  evaluated_sha: "67e6b2314a35d474abfd232b2e2c00bcc583d9f6"
  blueprint_digest: "69022818e377fde1f6af27081bd11fa3eddb75e3bc3ce34b655e7f890307d461"
  evidence_refs:
    - ".agentplane/tasks/202611270730-P86BEJ/README.md"
    - ".agentplane/tasks/202611270730-P86BEJ/quality/20261127-074920925-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611270730-P86BEJ/quality/20261127-074920925-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611270730-P86BEJ/quality/20261127-074920925-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611270730-P86BEJ/blueprint/resolved-snapshot.json"
    - "output/calc-next/P86BEJ-final-tests.log"
    - "docs/program/calc-upstream-suspected-issues.md"
    - "output/calc-next/P86BEJ-findings.md"
  findings:
    - "The mixed selection source asymmetry is reproduced with no unvisited-page mutation."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-27T07:31:13.134Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-27T07:49:17.572Z"
    author: "CODER"
    state: "ok"
    note: "39 targeted tests passed in six files. Office types, changed-source lint, format and JSDoc, scoped provenance, dependency/source-tree, routing and doctor passed. Full inventory and provenance retain unchanged integration marker failures."
doc_version: 3
doc_updated_at: "2026-11-27T07:49:17.735Z"
doc_updated_by: "CODER"
description: "Route Calc Format Cells Alignment through the original CUI AlignmentTabPage and the existing Calc item pool. Move saved-value, mixed-selection and control sensitivity contracts into the CUI model with source slot-to-Which mapping. Present the Text Alignment, Text Orientation and Properties groups with the synchronized dial and angle entry, the three native reference-edge choices, Vertical Asian layout when enabled, and the pinned justify/wrap interactions. Keep the normal Calc attribute transaction and validate ODS properties and grouped history. Preserve existing browser storage and recovery policy."
sections:
  Summary: |-
    Connect Calc Alignment to the native CUI control and item exchange

    Route Calc Format Cells Alignment through the original CUI AlignmentTabPage and the existing Calc item pool. Move saved-value, mixed-selection and control sensitivity contracts into the CUI model with source slot-to-Which mapping. Present the Text Alignment, Text Orientation and Properties groups with the synchronized dial and angle entry, the three native reference-edge choices, Vertical Asian layout when enabled, and the pinned justify/wrap interactions. Keep the normal Calc attribute transaction and validate ODS properties and grouped history. Preserve existing browser storage and recovery policy.
  Scope: "Route Calc Format Cells Alignment through the original CUI AlignmentTabPage and the existing Calc item pool. Move saved-value, mixed-selection and control sensitivity contracts into the CUI model with source slot-to-Which mapping. Present the Text Alignment, Text Orientation and Properties groups with the synchronized dial and angle entry, the three native reference-edge choices, Vertical Asian layout when enabled, and the pinned justify/wrap interactions. Keep the normal Calc attribute transaction and validate ODS properties and grouped history. Preserve existing browser storage and recovery policy."
  Plan: "Model the native selection and exchange, connect the orientation and alignment controls, and verify original source UI cases, grouped history and ODS."
  Verify Steps: |-
    - Port and run the pinned Calc formatCells.py Alignment scenario. Verify direction, indent, stacked text, wrap and hyphenation through reopen.
    - Run targeted Calc Format Cells, alignment/angle owner, selected-cell history and ODS tests. Cover native three reference edges, dial and angle synchronization, mixed values, enablement rules, Reset and Cancel.
    - Run Office typecheck, changed-source lint, format and JSDoc, source/dependency structure, scoped provenance, Calc and shared inventories, routing and doctor. Record unchanged integration diagnostics separately.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T07:49:17.572Z — VERIFY — ok

    By: CODER

    Note: 39 targeted tests passed in six files. Office types, changed-source lint, format and JSDoc, scoped provenance, dependency/source-tree, routing and doctor passed. Full inventory and provenance retain unchanged integration marker failures.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T07:48:58.471Z, excerpt_hash=sha256:5b975034470b93b5e79ce8a3862edc393a872c4d4ab09a0171d65e836d01b205

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611270730-P86BEJ/blueprint/resolved-snapshot.json
    - old_digest: 69022818e377fde1f6af27081bd11fa3eddb75e3bc3ce34b655e7f890307d461
    - current_digest: 69022818e377fde1f6af27081bd11fa3eddb75e3bc3ce34b655e7f890307d461
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611270730-P86BEJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611270730-P86BEJ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - **Command:** From `apps/office`, run `../../node_modules/.bin/vitest run --config ../../output/calc-next/vitest.GE34WV.config.ts src/sc/browser/presentation/calc-format-cells.test.tsx src/sc/source/filter/xml/ods-native-alignment.test.ts src/sc/source/filter/xml/ods-native-colors.test.ts src/sc/source/core/data/docpool.test.ts src/sc/source/core/data/boolean-cellattr.test.ts src/sc/source/core/data/patattr.test.ts --maxWorkers=2 --testTimeout=180000 --reporter=verbose`. **Result:** pass. **Evidence:** 39 passed across six files. **Scope:** Format Cells, native mixed boolean controls and the pinned method exchange, rotation pointer capture and Escape, source alignment reopen actions, grouped undo, ODS glyph orientation and indent-only automatic styles.
    - **Command:** `npm run typecheck --workspace @vite-office/office`, changed-source ESLint, Prettier and JSDoc, `git diff --check`, `npm run check:dependencies`, `npm run check:source-tree`, `node .agentplane/policy/check-routing.mjs`, and `ap doctor`. **Result:** pass. **Evidence:** targeted checks and structural checks pass, with the inherited AgentPlane managed hook-shim readiness warning. **Scope:** all changed office sources, registry and task routing.
    - **Command:** `node_modules/.bin/tsx output/calc-next/P86BEJ-provenance.ts`. **Result:** pass. **Evidence:** two mapped owners and two browser adapters validated against local and pinned evidence. **Scope:** CUI Alignment and SVX DialControl.
    - **Command:** `npm run check:source-provenance`, `npm run inventory:parity:calc` and `npm run inventory:parity:shared`. **Result:** fail at inherited metadata. **Evidence:** global provenance reports the absent Writer native overline test marker. Both inventory scopes report the absent shared XML style `rawLineStart` marker. **Scope:** full source provenance and inventory only. Changed-owner provenance passes.
    - **Native behavior:** CALC-852 records the pinned independent justification method rewrite when an accepted mixed Alignment page has no active horizontal choice. Preserved that source rule and covered it through the normal dialog.
    - **Boundary:** The notebook and stored Calc properties use the original admission, item exchange and ODS mapping for the represented attributes. Calc's existing grid text layout remains a separate consumer.

    - Observation: The native justification method exchange derives Auto from an untouched mixed alignment combo with no active row.
      Impact: Visiting and accepting the page can replace a uniform stored Distribute method across a mixed alignment selection.
      Resolution: Kept the source rule, recorded CALC-852 and verified it through the real dialog and grouped history.
id_source: "generated"
---
## Summary

Connect Calc Alignment to the native CUI control and item exchange

Route Calc Format Cells Alignment through the original CUI AlignmentTabPage and the existing Calc item pool. Move saved-value, mixed-selection and control sensitivity contracts into the CUI model with source slot-to-Which mapping. Present the Text Alignment, Text Orientation and Properties groups with the synchronized dial and angle entry, the three native reference-edge choices, Vertical Asian layout when enabled, and the pinned justify/wrap interactions. Keep the normal Calc attribute transaction and validate ODS properties and grouped history. Preserve existing browser storage and recovery policy.

## Scope

Route Calc Format Cells Alignment through the original CUI AlignmentTabPage and the existing Calc item pool. Move saved-value, mixed-selection and control sensitivity contracts into the CUI model with source slot-to-Which mapping. Present the Text Alignment, Text Orientation and Properties groups with the synchronized dial and angle entry, the three native reference-edge choices, Vertical Asian layout when enabled, and the pinned justify/wrap interactions. Keep the normal Calc attribute transaction and validate ODS properties and grouped history. Preserve existing browser storage and recovery policy.

## Plan

Model the native selection and exchange, connect the orientation and alignment controls, and verify original source UI cases, grouped history and ODS.

## Verify Steps

- Port and run the pinned Calc formatCells.py Alignment scenario. Verify direction, indent, stacked text, wrap and hyphenation through reopen.
- Run targeted Calc Format Cells, alignment/angle owner, selected-cell history and ODS tests. Cover native three reference edges, dial and angle synchronization, mixed values, enablement rules, Reset and Cancel.
- Run Office typecheck, changed-source lint, format and JSDoc, source/dependency structure, scoped provenance, Calc and shared inventories, routing and doctor. Record unchanged integration diagnostics separately.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T07:49:17.572Z — VERIFY — ok

By: CODER

Note: 39 targeted tests passed in six files. Office types, changed-source lint, format and JSDoc, scoped provenance, dependency/source-tree, routing and doctor passed. Full inventory and provenance retain unchanged integration marker failures.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T07:48:58.471Z, excerpt_hash=sha256:5b975034470b93b5e79ce8a3862edc393a872c4d4ab09a0171d65e836d01b205

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611270730-P86BEJ/blueprint/resolved-snapshot.json
- old_digest: 69022818e377fde1f6af27081bd11fa3eddb75e3bc3ce34b655e7f890307d461
- current_digest: 69022818e377fde1f6af27081bd11fa3eddb75e3bc3ce34b655e7f890307d461
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611270730-P86BEJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611270730-P86BEJ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- **Command:** From `apps/office`, run `../../node_modules/.bin/vitest run --config ../../output/calc-next/vitest.GE34WV.config.ts src/sc/browser/presentation/calc-format-cells.test.tsx src/sc/source/filter/xml/ods-native-alignment.test.ts src/sc/source/filter/xml/ods-native-colors.test.ts src/sc/source/core/data/docpool.test.ts src/sc/source/core/data/boolean-cellattr.test.ts src/sc/source/core/data/patattr.test.ts --maxWorkers=2 --testTimeout=180000 --reporter=verbose`. **Result:** pass. **Evidence:** 39 passed across six files. **Scope:** Format Cells, native mixed boolean controls and the pinned method exchange, rotation pointer capture and Escape, source alignment reopen actions, grouped undo, ODS glyph orientation and indent-only automatic styles.
- **Command:** `npm run typecheck --workspace @vite-office/office`, changed-source ESLint, Prettier and JSDoc, `git diff --check`, `npm run check:dependencies`, `npm run check:source-tree`, `node .agentplane/policy/check-routing.mjs`, and `ap doctor`. **Result:** pass. **Evidence:** targeted checks and structural checks pass, with the inherited AgentPlane managed hook-shim readiness warning. **Scope:** all changed office sources, registry and task routing.
- **Command:** `node_modules/.bin/tsx output/calc-next/P86BEJ-provenance.ts`. **Result:** pass. **Evidence:** two mapped owners and two browser adapters validated against local and pinned evidence. **Scope:** CUI Alignment and SVX DialControl.
- **Command:** `npm run check:source-provenance`, `npm run inventory:parity:calc` and `npm run inventory:parity:shared`. **Result:** fail at inherited metadata. **Evidence:** global provenance reports the absent Writer native overline test marker. Both inventory scopes report the absent shared XML style `rawLineStart` marker. **Scope:** full source provenance and inventory only. Changed-owner provenance passes.
- **Native behavior:** CALC-852 records the pinned independent justification method rewrite when an accepted mixed Alignment page has no active horizontal choice. Preserved that source rule and covered it through the normal dialog.
- **Boundary:** The notebook and stored Calc properties use the original admission, item exchange and ODS mapping for the represented attributes. Calc's existing grid text layout remains a separate consumer.

- Observation: The native justification method exchange derives Auto from an untouched mixed alignment combo with no active row.
  Impact: Visiting and accepting the page can replace a uniform stored Distribute method across a mixed alignment selection.
  Resolution: Kept the source rule, recorded CALC-852 and verified it through the real dialog and grouped history.
