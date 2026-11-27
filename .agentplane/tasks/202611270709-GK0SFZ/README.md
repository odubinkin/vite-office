---
id: "202611270709-GK0SFZ"
title: "Connect Calc Background to the native Area and brush exchange"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T07:10:06.997Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T07:25:32.328Z"
  updated_by: "CODER"
  note: "82 focused tests passed across Calc, ODS, Writer Area, and shared fill items. Types, lint, format, scoped JSDoc and provenance, routing, and structural checks passed. Global inventory, provenance and documentation findings remain on untouched integration paths."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T07:25:43.601Z"
  updated_by: "EVALUATOR"
  note: "The represented Background modes now use common CUI Area controls and source brush comparison. Original palette and recent-color assertions and affected Writer paths pass."
  evaluated_sha: "ad14827a84ac9f67e6faab395a11db845b8c6a73"
  blueprint_digest: "c2c70213486e0860a2b498b46302313f2c66c26e5fffced9eeea7a810dd5ca8c"
  evidence_refs:
    - ".agentplane/tasks/202611270709-GK0SFZ/README.md"
    - ".agentplane/tasks/202611270709-GK0SFZ/quality/20261127-072543601-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611270709-GK0SFZ/quality/20261127-072543601-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611270709-GK0SFZ/quality/20261127-072543601-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611270709-GK0SFZ/blueprint/resolved-snapshot.json"
    - "output/calc-next/GK0SFZ-final-tests.log"
    - "docs/program/calc-upstream-suspected-issues.md"
    - "output/calc-next/GK0SFZ-findings.md"
  findings:
    - "The accepted selection preserves equal opaque themed brushes and reproduces the pinned partial-opacity transfer."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Replace Calc Background with the shared native palette and typed brush exchange."
events:
  -
    type: "status"
    at: "2026-11-27T07:10:07.434Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Replace Calc Background with the shared native palette and typed brush exchange."
  -
    type: "verify"
    at: "2026-11-27T07:25:32.328Z"
    author: "CODER"
    state: "ok"
    note: "82 focused tests passed across Calc, ODS, Writer Area, and shared fill items. Types, lint, format, scoped JSDoc and provenance, routing, and structural checks passed. Global inventory, provenance and documentation findings remain on untouched integration paths."
doc_version: 3
doc_updated_at: "2026-11-27T07:25:32.384Z"
doc_updated_by: "CODER"
description: "Replace the browser-only Calc Background form with the pinned SvxBkgTabPage controls, shared palette and preview, original brush exchange, and selected-cell history and ODS verification."
sections:
  Summary: "Use the original Calc Background page with the shared Area palette, preview and real item exchange."
  Scope: "Replace the local select and direct color widget with the pinned SvxBkgTabPage behavior in Calc Format Cells. Expose only the fill families used by Calc and preserve the palette, selected source brush, original comparison, Reset, Cancel and grouped history. Reuse the shared browser Area page and native SVX brush bridge. Document and preserve any verified native color-transfer asymmetry."
  Plan: "Connect the pinned CUI background page, existing palette and brush bridge, and native selected-cell exchange with focused ODS and history checks."
  Verify Steps: |-
    - Run the Calc Format Cells, ODS and shared native fill-item tests.
    - Confirm None/Color, the palette and preview, matching complex-color retention, visited partial opacity, Reset, Cancel, selected-cell grouped undo and ODS round trip.
    - Run Office typecheck, changed-source lint and format, dependency/source-tree checks, source provenance, Calc/shared inventory, routing and doctor. Record inherited integration evidence failures separately.
  Verification: |-
    Pending execution.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T07:25:32.328Z — VERIFY — ok

    By: CODER

    Note: 82 focused tests passed across Calc, ODS, Writer Area, and shared fill items. Types, lint, format, scoped JSDoc and provenance, routing, and structural checks passed. Global inventory, provenance and documentation findings remain on untouched integration paths.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T07:25:21.576Z, excerpt_hash=sha256:ee1a554364bc26e2fd24fca579a647f0a362e366a9f37aa30b799d82358bd4fa

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611270709-GK0SFZ/blueprint/resolved-snapshot.json
    - old_digest: c2c70213486e0860a2b498b46302313f2c66c26e5fffced9eeea7a810dd5ca8c
    - current_digest: c2c70213486e0860a2b498b46302313f2c66c26e5fffced9eeea7a810dd5ca8c
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611270709-GK0SFZ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611270709-GK0SFZ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped Background owner, UI and registry changes."
  Findings: |-
    - **Command:** From `apps/office`, run `../../node_modules/.bin/vitest run --config ../../output/calc-next/vitest.GE34WV.config.ts src/sc/browser/presentation/calc-format-cells.test.tsx src/sc/source/filter/xml/ods.test.ts src/sc/source/filter/xml/ods-native-colors.test.ts src/svx/source/unodraw/unobrushitemhelper.test.ts src/svx/browser/fill-item-boundaries.test.ts src/sw/browser/presentation/WriterParagraphAreaDialog.test.tsx src/sw/browser/presentation/WriterPageAreaDialog.test.tsx --maxWorkers=2 --testTimeout=180000 --reporter=verbose`. **Result:** pass. **Evidence:** 82 tests across seven files. **Scope:** native None and Color, palette names and indices, recent colors across different cells, Reset, Cancel, history, matching complex colors, accepted partial opacity, ODS and shared Writer Area.
    - **Command:** `npm run typecheck --workspace @vite-office/office`, changed-source ESLint, Prettier and JSDoc, `git diff --check`, `npm run check:dependencies`, `npm run check:source-tree`, `node .agentplane/policy/check-routing.mjs`, `ap doctor`. **Result:** pass. **Evidence:** checks passed, with the existing AgentPlane hook-shim readiness warning. **Scope:** shared Area and Calc sources, registry JSON, office types and repository structure.
    - **Command:** `node_modules/.bin/tsx output/calc-next/GK0SFZ-provenance.ts` and `cmp` for each installed SOC against its pinned native counterpart. **Result:** pass. **Evidence:** two changed runtime owners matched their scoped provenance and all eight resources were byte-identical. **Scope:** new Background native owner and browser palette adapter.
    - **Command:** `npm run check:source-provenance`, `npm run inventory:parity:calc`, `npm run inventory:parity:shared` and `npm run check:docs`. **Result:** fail at inherited integration findings. **Evidence:** the global provenance reports the absent Writer native overline test marker. Both inventory scopes report the absent shared XML style `rawLineStart` marker. Global JSDoc reports issues in unchanged sources. **Scope:** repository-wide checks. All changed sources pass the corresponding scoped checks.
    - **Native behavior:** As recorded in CALC-851, accepting the visited solid page can turn a partially transparent brush opaque. The unvisited page and Cancel preserve it. Original opaque colors retain their complex color when the resolved color matches.
    - **Boundary:** The port uses installed SOC resources, a profile-backed named recent palette and the browser color chooser. Custom palette editing, document theme palette editing and the native component editor are outside this slice.

    - Observation: Accepting a visited source Background page transfers the separate partial-alpha brush to opaque RGB.
      Impact: Unvisited and cancelled dialogs preserve partial opacity. Equal opaque colors retain their original complex color.
      Resolution: Preserved the pinned comparison and documented CALC-851 with a regression that also checks undo.
id_source: "generated"
---
## Summary

Use the original Calc Background page with the shared Area palette, preview and real item exchange.

## Scope

Replace the local select and direct color widget with the pinned SvxBkgTabPage behavior in Calc Format Cells. Expose only the fill families used by Calc and preserve the palette, selected source brush, original comparison, Reset, Cancel and grouped history. Reuse the shared browser Area page and native SVX brush bridge. Document and preserve any verified native color-transfer asymmetry.

## Plan

Connect the pinned CUI background page, existing palette and brush bridge, and native selected-cell exchange with focused ODS and history checks.

## Verify Steps

- Run the Calc Format Cells, ODS and shared native fill-item tests.
- Confirm None/Color, the palette and preview, matching complex-color retention, visited partial opacity, Reset, Cancel, selected-cell grouped undo and ODS round trip.
- Run Office typecheck, changed-source lint and format, dependency/source-tree checks, source provenance, Calc/shared inventory, routing and doctor. Record inherited integration evidence failures separately.

## Verification

Pending execution.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T07:25:32.328Z — VERIFY — ok

By: CODER

Note: 82 focused tests passed across Calc, ODS, Writer Area, and shared fill items. Types, lint, format, scoped JSDoc and provenance, routing, and structural checks passed. Global inventory, provenance and documentation findings remain on untouched integration paths.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T07:25:21.576Z, excerpt_hash=sha256:ee1a554364bc26e2fd24fca579a647f0a362e366a9f37aa30b799d82358bd4fa

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611270709-GK0SFZ/blueprint/resolved-snapshot.json
- old_digest: c2c70213486e0860a2b498b46302313f2c66c26e5fffced9eeea7a810dd5ca8c
- current_digest: c2c70213486e0860a2b498b46302313f2c66c26e5fffced9eeea7a810dd5ca8c
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611270709-GK0SFZ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611270709-GK0SFZ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped Background owner, UI and registry changes.

## Findings

- **Command:** From `apps/office`, run `../../node_modules/.bin/vitest run --config ../../output/calc-next/vitest.GE34WV.config.ts src/sc/browser/presentation/calc-format-cells.test.tsx src/sc/source/filter/xml/ods.test.ts src/sc/source/filter/xml/ods-native-colors.test.ts src/svx/source/unodraw/unobrushitemhelper.test.ts src/svx/browser/fill-item-boundaries.test.ts src/sw/browser/presentation/WriterParagraphAreaDialog.test.tsx src/sw/browser/presentation/WriterPageAreaDialog.test.tsx --maxWorkers=2 --testTimeout=180000 --reporter=verbose`. **Result:** pass. **Evidence:** 82 tests across seven files. **Scope:** native None and Color, palette names and indices, recent colors across different cells, Reset, Cancel, history, matching complex colors, accepted partial opacity, ODS and shared Writer Area.
- **Command:** `npm run typecheck --workspace @vite-office/office`, changed-source ESLint, Prettier and JSDoc, `git diff --check`, `npm run check:dependencies`, `npm run check:source-tree`, `node .agentplane/policy/check-routing.mjs`, `ap doctor`. **Result:** pass. **Evidence:** checks passed, with the existing AgentPlane hook-shim readiness warning. **Scope:** shared Area and Calc sources, registry JSON, office types and repository structure.
- **Command:** `node_modules/.bin/tsx output/calc-next/GK0SFZ-provenance.ts` and `cmp` for each installed SOC against its pinned native counterpart. **Result:** pass. **Evidence:** two changed runtime owners matched their scoped provenance and all eight resources were byte-identical. **Scope:** new Background native owner and browser palette adapter.
- **Command:** `npm run check:source-provenance`, `npm run inventory:parity:calc`, `npm run inventory:parity:shared` and `npm run check:docs`. **Result:** fail at inherited integration findings. **Evidence:** the global provenance reports the absent Writer native overline test marker. Both inventory scopes report the absent shared XML style `rawLineStart` marker. Global JSDoc reports issues in unchanged sources. **Scope:** repository-wide checks. All changed sources pass the corresponding scoped checks.
- **Native behavior:** As recorded in CALC-851, accepting the visited solid page can turn a partially transparent brush opaque. The unvisited page and Cancel preserve it. Original opaque colors retain their complex color when the resolved color matches.
- **Boundary:** The port uses installed SOC resources, a profile-backed named recent palette and the browser color chooser. Custom palette editing, document theme palette editing and the native component editor are outside this slice.

- Observation: Accepting a visited source Background page transfers the separate partial-alpha brush to opaque RGB.
  Impact: Unvisited and cancelled dialogs preserve partial opacity. Equal opaque colors retain their original complex color.
  Resolution: Preserved the pinned comparison and documented CALC-851 with a regression that also checks undo.
