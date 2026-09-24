---
id: "202609241521-XXW124"
title: "Reproduce and classify certification ODT diagnostics"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run the diagnostic harness on tracked upstream ODT fixtures and record categorized warnings and semantic counts without document text."
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T15:23:15.282Z"
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
    body: "Start: implement privacy-safe import diagnostics and semantic baseline using pinned LibreOffice references and existing ODT fixtures."
events:
  -
    type: "status"
    at: "2026-09-24T15:23:42.078Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement privacy-safe import diagnostics and semantic baseline using pinned LibreOffice references and existing ODT fixtures."
doc_version: 3
doc_updated_at: "2026-09-24T15:23:42.078Z"
doc_updated_by: "CODER"
description: "Phase 0: privacy-safe import diagnostic harness, semantic baseline and upstream command/dialog matrix; use private file only with separate outside-repo approval."
sections:
  Summary: |-
    Reproduce and classify certification ODT diagnostics

    Phase 0: privacy-safe import diagnostic harness, semantic baseline and upstream command/dialog matrix; use private file only with separate outside-repo approval.
  Scope: "Import diagnostics in Worker/filter, privacy-safe stream/path/count report, canonical semantic baseline, and upstream command/dialog inventory. Private ODT read only after user authorizes its absolute path."
  Plan: |-
    1. Inspect pinned LibreOffice import handlers and current Worker/filter diagnostics.
    2. Add a local harness that records warning/error type, stream, element path, frequency and loss class without document text.
    3. Assert baseline semantics on existing pinned upstream fixtures and minimized synthetic ODTs.
    4. Run the private sample locally after authorization; record counts and feature-control mapping.
  Verify Steps: |-
    1. `npm run verify` passes.
    2. Run `npx vitest run scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts` and the new diagnostic tests; record exact commands and results.
    3. The private sample report records paragraph/table/link/bookmark/break/page/style baseline and categorized warning counts without text or fonts in Git/logs.
    4. Record upstream command/dialog paths and existing local controls for every planned editable property.
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

Reproduce and classify certification ODT diagnostics

Phase 0: privacy-safe import diagnostic harness, semantic baseline and upstream command/dialog matrix; use private file only with separate outside-repo approval.

## Scope

Import diagnostics in Worker/filter, privacy-safe stream/path/count report, canonical semantic baseline, and upstream command/dialog inventory. Private ODT read only after user authorizes its absolute path.

## Plan

1. Inspect pinned LibreOffice import handlers and current Worker/filter diagnostics.
2. Add a local harness that records warning/error type, stream, element path, frequency and loss class without document text.
3. Assert baseline semantics on existing pinned upstream fixtures and minimized synthetic ODTs.
4. Run the private sample locally after authorization; record counts and feature-control mapping.

## Verify Steps

1. `npm run verify` passes.
2. Run `npx vitest run scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts` and the new diagnostic tests; record exact commands and results.
3. The private sample report records paragraph/table/link/bookmark/break/page/style baseline and categorized warning counts without text or fonts in Git/logs.
4. Record upstream command/dialog paths and existing local controls for every planned editable property.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
