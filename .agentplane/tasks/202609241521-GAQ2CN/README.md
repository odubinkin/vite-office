---
id: "202609241521-GAQ2CN"
title: "Complete embedded fonts and page resources"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on:
  - "202609241521-9FJEHM"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run pinned embedded-font and page-layout ODT fixtures plus font/page UI persistence tests."
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T15:23:17.168Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-24T20:20:45.051Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-09-24T20:20:45.051Z"
doc_updated_by: "CODER"
description: "Phase 4: manifest-validated font declarations, deterministic fallback, page descriptor geometry and editable UI."
sections:
  Summary: |-
    Complete embedded fonts and page resources

    Phase 4: manifest-validated font declarations, deterministic fallback, page descriptor geometry and editable UI.
  Scope: "Manifest validated embedded-font resources and page descriptor geometry, deterministic fallback, font/Page Style controls and round trips."
  Plan: |-
    1. Inspect pinned `XMLFontStylesContext` and page descriptor implementation.
    2. Resolve only validated package font entries; bound and revoke browser loading.
    3. Preserve family/script identity with deterministic fallback and page layout items.
    4. Expose imported/editable settings in existing UI and verify round trips.
  Verify Steps: |-
    1. `npm run verify` passes.
    2. `embed-unrestricted1.odt`, `embedded-font-props.odt` and `tdf114287.odt` tests assert font/page state and fallback.
    3. Font and Page Style UI tests inspect, change, save and reopen settings.
    4. Private sample geometry/font metrics and warning deltas are recorded.
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

Complete embedded fonts and page resources

Phase 4: manifest-validated font declarations, deterministic fallback, page descriptor geometry and editable UI.

## Scope

Manifest validated embedded-font resources and page descriptor geometry, deterministic fallback, font/Page Style controls and round trips.

## Plan

1. Inspect pinned `XMLFontStylesContext` and page descriptor implementation.
2. Resolve only validated package font entries; bound and revoke browser loading.
3. Preserve family/script identity with deterministic fallback and page layout items.
4. Expose imported/editable settings in existing UI and verify round trips.

## Verify Steps

1. `npm run verify` passes.
2. `embed-unrestricted1.odt`, `embedded-font-props.odt` and `tdf114287.odt` tests assert font/page state and fallback.
3. Font and Page Style UI tests inspect, change, save and reopen settings.
4. Private sample geometry/font metrics and warning deltas are recorded.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
