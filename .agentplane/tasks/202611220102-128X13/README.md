---
id: "202611220102-128X13"
title: "Preserve and display Calc ODS conditional icon sets"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
  - "ods"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Build Office and run a focused production Chromium original-ODS icon set scenario."
  - "Run focused Calc icon-set, ODS conditional formatting, Worker, and conditional-format presenter suites."
  - "npm run check:dependencies && npm run check:source-provenance"
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T01:02:46.241Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T01:20:34.345Z"
  updated_by: "CODER"
  note: "Native Calc icon-set selection, ODS filters, Worker records, grid and editor passed focused checks."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T01:20:35.046Z"
  updated_by: "EVALUATOR"
  note: "The native Calc icon-set owner, original ODS fixtures and production render path satisfy the task."
  evaluated_sha: "dbc17b7a21900a966964a8f1db0c6d6ab7b4bdd7"
  blueprint_digest: "97756353d7231fda5585800931f480a89b5bb3fcb7b3d72d6ef36470d71e4a05"
  evidence_refs:
    - ".agentplane/tasks/202611220102-128X13/README.md"
    - ".agentplane/tasks/202611220102-128X13/quality/20261122-012035046-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611220102-128X13/quality/20261122-012035046-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611220102-128X13/quality/20261122-012035046-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611220102-128X13/blueprint/resolved-snapshot.json"
    - "apps/office/src/sc/source/filter/xml/ods-icon-sets.test.ts"
    - "output/playwright/128X13/calc-final.log"
    - "output/playwright/128X13/browser.json"
  findings:
    - "The two LibreOffice ODS cases, complete Worker record, source output conventions and live native bitmap changes have passing evidence."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement the native Calc icon-set owner and port the pinned LibreOffice ODS import, output and grid paths."
events:
  -
    type: "status"
    at: "2026-11-22T01:02:50.426Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the native Calc icon-set owner and port the pinned LibreOffice ODS import, output and grid paths."
  -
    type: "verify"
    at: "2026-11-22T01:20:34.345Z"
    author: "CODER"
    state: "ok"
    note: "Native Calc icon-set selection, ODS filters, Worker records, grid and editor passed focused checks."
doc_version: 3
doc_updated_at: "2026-11-22T01:20:34.397Z"
doc_updated_by: "CODER"
description: "Port the native icon-set owner, threshold selection, ODS and Worker transport, and the existing grid and conditional-format manager integration using the pinned LibreOffice icon resources and fixtures."
sections:
  Summary: "Bring Calc conditional icon sets from the pinned LibreOffice core through the ODS filters, Worker transfer, existing manager, and grid. Use the original format table, thresholds, reference ownership and icon resources."
  Scope: |-
    - Native ScIconSetFormat and settings, numeric result selection, threshold updates and conditional paint resolution.
    - ODS import and export, current Worker codec, existing browser conditional-format editor and the grid display of represented icons.
    - Pinned ODS regression fixtures, focused native and production tests, source witnesses, and suspected upstream behavior documentation.
  Plan: |-
    1. Trace the native icon-set type table, default settings, ordered threshold comparisons, formula reference changes and result geometry. Implement the owner next to the existing color-scale and data-bar owners.
    2. Wire the shared conditional threshold context into the native ODS icon-set context and exporter. Preserve native attribute ordering and conventions and document any input or output asymmetries. Carry the complete represented settings through native copies and current Worker records.
    3. Resolve the icon set independently from existing conditional results. Adapt the native output geometry and use the pinned Calc icon pixels from the repository theme. Open imported rules through the existing manager and retain unaffected settings when editing.
    4. Port the original tdf64401.ods and tdf101104.ods expectations and verify export, reopen and live reference thresholds. Add a focused production Chromium ODS case and run the relevant suites and invariant checks.
  Verify Steps: |-
    - Run focused Calc suites on the new icon-set ODS and geometry tests, existing ODS data-bar and conditional-format editor tests, and the affected Worker codec and view owners.
    - Build Office and run a targeted Chromium Calc original-ODS icon-set scenario with the installed repo-local browser. Confirm the selected native image and live change or reopen behavior.
    - Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Calc registry invariants, AgentPlane routing and doctor, and git diff checks.
    - Record the task-scoped checkout status and finish with the Graphify refresh. The next complete regression follows the ten-task cadence.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T01:20:34.345Z — VERIFY — ok

    By: CODER

    Note: Native Calc icon-set selection, ODS filters, Worker records, grid and editor passed focused checks.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T01:02:50.426Z, excerpt_hash=sha256:1c3116dbfe9cec2e8c73c68988225fea4988bf48c630185ec95d73bdf994b45f

    Details:

    Calc Vitest: 25 tests passed in six targeted files. The pinned tdf64401.ods and tdf101104.ods cases exercise live reference thresholds and the last matching icon. Worker transfer preserves the represented settings while ODS keeps the source attribute conventions. Imported rules open and edit through the existing manager.
    Office typecheck and production build passed. Two production Chromium cases passed for original ODS icons and existing ODS data bars. The original glyphs load and update when a referenced cell changes.
    Scoped formatting and lint, module boundaries, source provenance, Calc registry invariants, policy routing, AgentPlane doctor and diff checks passed. Doctor reported the existing hook shim warning. Reports are under output/playwright/128X13. CALC-816 through CALC-818 record the source visibility, custom settings and clone behavior. This is the third completed implementation task since the full checkpoint.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611220102-128X13/blueprint/resolved-snapshot.json
    - old_digest: 97756353d7231fda5585800931f480a89b5bb3fcb7b3d72d6ef36470d71e4a05
    - current_digest: 97756353d7231fda5585800931f480a89b5bb3fcb7b3d72d6ef36470d71e4a05
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611220102-128X13

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611220102-128X13
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the icon-set implementation and its registry witnesses together. Existing non-icon conditional rules retain their stored representation."
  Findings: "This is the third implementation task after CMXMAC. The pinned Calc suite includes two original ODS fixtures for formula thresholds and matching icon selection. The original exporter emits the extension formatting entries using the same conditional threshold family as data bars."
id_source: "generated"
---
## Summary

Bring Calc conditional icon sets from the pinned LibreOffice core through the ODS filters, Worker transfer, existing manager, and grid. Use the original format table, thresholds, reference ownership and icon resources.

## Scope

- Native ScIconSetFormat and settings, numeric result selection, threshold updates and conditional paint resolution.
- ODS import and export, current Worker codec, existing browser conditional-format editor and the grid display of represented icons.
- Pinned ODS regression fixtures, focused native and production tests, source witnesses, and suspected upstream behavior documentation.

## Plan

1. Trace the native icon-set type table, default settings, ordered threshold comparisons, formula reference changes and result geometry. Implement the owner next to the existing color-scale and data-bar owners.
2. Wire the shared conditional threshold context into the native ODS icon-set context and exporter. Preserve native attribute ordering and conventions and document any input or output asymmetries. Carry the complete represented settings through native copies and current Worker records.
3. Resolve the icon set independently from existing conditional results. Adapt the native output geometry and use the pinned Calc icon pixels from the repository theme. Open imported rules through the existing manager and retain unaffected settings when editing.
4. Port the original tdf64401.ods and tdf101104.ods expectations and verify export, reopen and live reference thresholds. Add a focused production Chromium ODS case and run the relevant suites and invariant checks.

## Verify Steps

- Run focused Calc suites on the new icon-set ODS and geometry tests, existing ODS data-bar and conditional-format editor tests, and the affected Worker codec and view owners.
- Build Office and run a targeted Chromium Calc original-ODS icon-set scenario with the installed repo-local browser. Confirm the selected native image and live change or reopen behavior.
- Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Calc registry invariants, AgentPlane routing and doctor, and git diff checks.
- Record the task-scoped checkout status and finish with the Graphify refresh. The next complete regression follows the ten-task cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T01:20:34.345Z — VERIFY — ok

By: CODER

Note: Native Calc icon-set selection, ODS filters, Worker records, grid and editor passed focused checks.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T01:02:50.426Z, excerpt_hash=sha256:1c3116dbfe9cec2e8c73c68988225fea4988bf48c630185ec95d73bdf994b45f

Details:

Calc Vitest: 25 tests passed in six targeted files. The pinned tdf64401.ods and tdf101104.ods cases exercise live reference thresholds and the last matching icon. Worker transfer preserves the represented settings while ODS keeps the source attribute conventions. Imported rules open and edit through the existing manager.
Office typecheck and production build passed. Two production Chromium cases passed for original ODS icons and existing ODS data bars. The original glyphs load and update when a referenced cell changes.
Scoped formatting and lint, module boundaries, source provenance, Calc registry invariants, policy routing, AgentPlane doctor and diff checks passed. Doctor reported the existing hook shim warning. Reports are under output/playwright/128X13. CALC-816 through CALC-818 record the source visibility, custom settings and clone behavior. This is the third completed implementation task since the full checkpoint.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611220102-128X13/blueprint/resolved-snapshot.json
- old_digest: 97756353d7231fda5585800931f480a89b5bb3fcb7b3d72d6ef36470d71e4a05
- current_digest: 97756353d7231fda5585800931f480a89b5bb3fcb7b3d72d6ef36470d71e4a05
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611220102-128X13

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611220102-128X13
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the icon-set implementation and its registry witnesses together. Existing non-icon conditional rules retain their stored representation.

## Findings

This is the third implementation task after CMXMAC. The pinned Calc suite includes two original ODS fixtures for formula thresholds and matching icon selection. The original exporter emits the extension formatting entries using the same conditional threshold family as data bars.
