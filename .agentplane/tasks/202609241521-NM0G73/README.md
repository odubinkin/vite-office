---
id: "202609241521-NM0G73"
title: "Recognize harmless ODT declarations and style attributes"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on:
  - "202609241521-XXW124"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run source-backed ODT declaration tests and import/export checks; assert expected diagnostics without broad console suppression."
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T15:23:15.911Z"
  updated_by: "ORCHESTRATOR"
  note: "User requested implementation of the seven ordered phases in docs/program/certification-odt-import-plan.md; outside-repo sample access remains pending separate authorization."
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
    body: "Start: recognize observed harmless ODT declarations using pinned xmloff contexts and source-backed fixtures."
events:
  -
    type: "status"
    at: "2026-09-24T16:05:13.640Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: recognize observed harmless ODT declarations using pinned xmloff contexts and source-backed fixtures."
doc_version: 3
doc_updated_at: "2026-09-24T16:05:13.640Z"
doc_updated_by: "CODER"
description: "Phase 1: exact namespace token/context recognition and intentional metadata ignore classification, preserving invalid semantic diagnostics."
sections:
  Summary: |-
    Recognize harmless ODT declarations and style attributes

    Phase 1: exact namespace token/context recognition and intentional metadata ignore classification, preserving invalid semantic diagnostics.
  Scope: "Exact namespace token and owning-context handling for observed harmless declarations, style attributes and package entries. No semantic properties or new UI."
  Plan: |-
    1. Compare sample diagnostics with pinned `xmloff` contexts.
    2. Add precise tokens and safe ignore contexts; classify each ignored field.
    3. Keep malformed semantic values explicit and package entry validation intact.
    4. Add synthetic and pinned upstream declaration tests.
  Verify Steps: |-
    1. `npm run verify` passes.
    2. New declaration tests and `npx vitest run scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts` pass.
    3. Re-run the phase 0 diagnostic command and record warning-count deltas and unchanged canonical semantics.
    4. Every ignored field has an upstream source and tested harmless classification; malformed values remain errors/diagnostics.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Recognize harmless ODT declarations and style attributes

Phase 1: exact namespace token/context recognition and intentional metadata ignore classification, preserving invalid semantic diagnostics.

## Scope

Exact namespace token and owning-context handling for observed harmless declarations, style attributes and package entries. No semantic properties or new UI.

## Plan

1. Compare sample diagnostics with pinned `xmloff` contexts.
2. Add precise tokens and safe ignore contexts; classify each ignored field.
3. Keep malformed semantic values explicit and package entry validation intact.
4. Add synthetic and pinned upstream declaration tests.

## Verify Steps

1. `npm run verify` passes.
2. New declaration tests and `npx vitest run scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts` pass.
3. Re-run the phase 0 diagnostic command and record warning-count deltas and unchanged canonical semantics.
4. Every ignored field has an upstream source and tested harmless classification; malformed values remain errors/diagnostics.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
