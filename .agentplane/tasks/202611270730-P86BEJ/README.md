---
id: "202611270730-P86BEJ"
title: "Connect Calc Alignment to the native CUI control and item exchange"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
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
doc_version: 3
doc_updated_at: "2026-11-27T07:48:58.471Z"
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
