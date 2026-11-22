---
id: "202611220048-3WEPCK"
title: "Preserve Writer ODT character typography through native items"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "odt"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify:
  - "npm run check:dependencies && npm run check:source-provenance"
  - "npm run test:writer -- odt-native-character-values.test.ts odt-font-style-roundtrip.test.ts"
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T00:49:14.561Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T01:00:50.833Z"
  updated_by: "CODER"
  note: "Native Writer character typography passed focused ODT, Worker, shared handler and property metadata checks."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T01:00:51.683Z"
  updated_by: "EVALUATOR"
  note: "The represented native typography items survive the Writer ODT and Worker boundaries."
  evaluated_sha: "c6d4ad9c87931185d69dabd6b064448e0bb4f4d0"
  blueprint_digest: "34f099fa4c47b37dea5aac2e79962b28388a23ca0b9d60526367f32ce66720f5"
  evidence_refs:
    - ".agentplane/tasks/202611220048-3WEPCK/README.md"
    - ".agentplane/tasks/202611220048-3WEPCK/quality/20261122-010051683-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611220048-3WEPCK/quality/20261122-010051683-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611220048-3WEPCK/quality/20261122-010051683-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611220048-3WEPCK/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/source/filter/xml/odt-native-character-values.test.ts"
    - "apps/office/src/xmloff/source/text/txtprmap.test.ts"
    - "output/playwright/3WEPCK/registry.log"
  findings:
    - "Typed member writes retain concrete items. The pinned source fixture and focused packages cover scale, style inheritance, explicit resets, and normalized values."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: trace and implement Writer character typography through the native ODT item and property-handler contracts."
events:
  -
    type: "status"
    at: "2026-11-22T00:49:18.588Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: trace and implement Writer character typography through the native ODT item and property-handler contracts."
  -
    type: "verify"
    at: "2026-11-22T01:00:50.833Z"
    author: "CODER"
    state: "ok"
    note: "Native Writer character typography passed focused ODT, Worker, shared handler and property metadata checks."
doc_version: 3
doc_updated_at: "2026-11-22T01:00:50.905Z"
doc_updated_by: "CODER"
description: "Round trip represented Writer character scaling, rotation and fit, emphasis marks, two-line combination and automatic kerning through native ODT mappings, item sets and Worker records."
sections:
  Summary: "Round trip character typography that Writer already represents with native pooled items. Cover automatic kerning, emphasis, run rotation and fit, character scaling, and two-line combination and brackets through ODT and the existing Worker graph."
  Scope: |-
    - Shared xmloff text property handlers and maps for the specified Writer properties.
    - Native Writer item-set adoption and export, represented UNO metadata, style inheritance, and Worker records for the same item values.
    - Focused ODT tests and relevant pinned LibreOffice fixtures. Update source witnesses and record suspected native behavior when observed.
  Plan: |-
    1. Trace the property handlers and map flags in xmloff and the original editeng items, Writer property metadata and style application in the pinned source. Use Graphify to locate each local boundary.
    2. Reuse the existing native pooled items and typed value contracts. Implement missing shared property handlers, merge the original member properties and apply default and export omission rules. Connect named, automatic and direct styles through the existing item owners and preserve values in the Worker graph.
    3. Port relevant native fixture expectations, including the original tdf106001-2.odt scale value. Test signed angle, fit, emphasis and bracket handling, explicit resets under inheritance, independent properties, and a read, transmit, save and reopen cycle.
    4. Verify related Writer and shared owners, update runtime evidence and refresh Graphify during closeout.
  Verify Steps: |-
    - Run `npm run test:writer -- odt-native-character-values.test.ts odt-font-style-roundtrip.test.ts native-text-default-schema.test.ts` plus the new character typography and affected Worker owner tests.
    - Run the related shared xmloff handler and editeng item suites. Compare native defaults, normalized values, export suppression rules and the original ODT fixture with the pinned source.
    - Run scoped ESLint and Prettier, `npm run typecheck --workspace @vite-office/office`, `npm run check:dependencies`, `npm run check:source-provenance`, `node .agentplane/policy/check-routing.mjs`, `ap doctor`, and `git diff --check`.
    - Record the scoped checkout result. The next full regression follows the ten-task cadence.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T01:00:50.833Z — VERIFY — ok

    By: CODER

    Note: Native Writer character typography passed focused ODT, Worker, shared handler and property metadata checks.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T00:49:18.588Z, excerpt_hash=sha256:a69db049cec5fe6c007156537f55803c4fc2b7d6078efd523702dd8fcb05d557

    Details:

    Writer: 38 tests passed in eight related suites. Shared XML handlers: seven tests passed in two suites. The original tdf106001-2.odt preserves 900% across ODT output and reimport. Explicit style resets and native emphasis, rotation, fit, scale, two-line brackets and automatic kerning survive Worker transfer and package reopen. The original default table metadata checks 101 represented rows.
    Office typecheck, scoped lint and formatting, module boundaries, source provenance, Writer registry invariants, routing, doctor and diff checks passed. Doctor reported the existing hook shim warning. WRITER-733 and WRITER-734 document the preserved native bracket and emphasis behavior. The existing long source files remain above the repository file-size target. The full cadence count is two implementation tasks.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611220048-3WEPCK/blueprint/resolved-snapshot.json
    - old_digest: 34f099fa4c47b37dea5aac2e79962b28388a23ca0b9d60526367f32ce66720f5
    - current_digest: 34f099fa4c47b37dea5aac2e79962b28388a23ca0b9d60526367f32ce66720f5
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611220048-3WEPCK

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611220048-3WEPCK
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped implementation and evidence commits together. Existing ODT packages remain readable by the previous filter implementation."
  Findings: "The first post-checkpoint task closed as N26ZF8. This task is the second implementation task in the current ten-task cycle. Existing ODT parsing has a letter-kerning map and the Writer exporter reads its pooled item. The import path and the remaining existing character typography owners require verification through the package boundary."
id_source: "generated"
---
## Summary

Round trip character typography that Writer already represents with native pooled items. Cover automatic kerning, emphasis, run rotation and fit, character scaling, and two-line combination and brackets through ODT and the existing Worker graph.

## Scope

- Shared xmloff text property handlers and maps for the specified Writer properties.
- Native Writer item-set adoption and export, represented UNO metadata, style inheritance, and Worker records for the same item values.
- Focused ODT tests and relevant pinned LibreOffice fixtures. Update source witnesses and record suspected native behavior when observed.

## Plan

1. Trace the property handlers and map flags in xmloff and the original editeng items, Writer property metadata and style application in the pinned source. Use Graphify to locate each local boundary.
2. Reuse the existing native pooled items and typed value contracts. Implement missing shared property handlers, merge the original member properties and apply default and export omission rules. Connect named, automatic and direct styles through the existing item owners and preserve values in the Worker graph.
3. Port relevant native fixture expectations, including the original tdf106001-2.odt scale value. Test signed angle, fit, emphasis and bracket handling, explicit resets under inheritance, independent properties, and a read, transmit, save and reopen cycle.
4. Verify related Writer and shared owners, update runtime evidence and refresh Graphify during closeout.

## Verify Steps

- Run `npm run test:writer -- odt-native-character-values.test.ts odt-font-style-roundtrip.test.ts native-text-default-schema.test.ts` plus the new character typography and affected Worker owner tests.
- Run the related shared xmloff handler and editeng item suites. Compare native defaults, normalized values, export suppression rules and the original ODT fixture with the pinned source.
- Run scoped ESLint and Prettier, `npm run typecheck --workspace @vite-office/office`, `npm run check:dependencies`, `npm run check:source-provenance`, `node .agentplane/policy/check-routing.mjs`, `ap doctor`, and `git diff --check`.
- Record the scoped checkout result. The next full regression follows the ten-task cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T01:00:50.833Z — VERIFY — ok

By: CODER

Note: Native Writer character typography passed focused ODT, Worker, shared handler and property metadata checks.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T00:49:18.588Z, excerpt_hash=sha256:a69db049cec5fe6c007156537f55803c4fc2b7d6078efd523702dd8fcb05d557

Details:

Writer: 38 tests passed in eight related suites. Shared XML handlers: seven tests passed in two suites. The original tdf106001-2.odt preserves 900% across ODT output and reimport. Explicit style resets and native emphasis, rotation, fit, scale, two-line brackets and automatic kerning survive Worker transfer and package reopen. The original default table metadata checks 101 represented rows.
Office typecheck, scoped lint and formatting, module boundaries, source provenance, Writer registry invariants, routing, doctor and diff checks passed. Doctor reported the existing hook shim warning. WRITER-733 and WRITER-734 document the preserved native bracket and emphasis behavior. The existing long source files remain above the repository file-size target. The full cadence count is two implementation tasks.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611220048-3WEPCK/blueprint/resolved-snapshot.json
- old_digest: 34f099fa4c47b37dea5aac2e79962b28388a23ca0b9d60526367f32ce66720f5
- current_digest: 34f099fa4c47b37dea5aac2e79962b28388a23ca0b9d60526367f32ce66720f5
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611220048-3WEPCK

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611220048-3WEPCK
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped implementation and evidence commits together. Existing ODT packages remain readable by the previous filter implementation.

## Findings

The first post-checkpoint task closed as N26ZF8. This task is the second implementation task in the current ten-task cycle. Existing ODT parsing has a letter-kerning map and the Writer exporter reads its pooled item. The import path and the remaining existing character typography owners require verification through the package boundary.
