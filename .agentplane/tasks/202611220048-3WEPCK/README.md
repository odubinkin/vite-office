---
id: "202611220048-3WEPCK"
title: "Preserve Writer ODT character typography through native items"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 4
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
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
doc_version: 3
doc_updated_at: "2026-11-22T00:49:18.588Z"
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
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped implementation and evidence commits together. Existing ODT packages remain readable by the previous filter implementation.

## Findings

The first post-checkpoint task closed as N26ZF8. This task is the second implementation task in the current ten-task cycle. Existing ODT parsing has a letter-kerning map and the Writer exporter reads its pooled item. The import path and the remaining existing character typography owners require verification through the package boundary.
