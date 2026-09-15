---
id: "202609150422-02D0CJ"
title: "Align Writer ODT font and style round-trip with LibreOffice"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T04:22:42.446Z"
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
    body: "Start: implement upstream-compatible Writer ODT font-face declarations, style naming, hierarchy import/export, and open-save-reopen verification."
events:
  -
    type: "status"
    at: "2026-09-15T04:22:54.718Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement upstream-compatible Writer ODT font-face declarations, style naming, hierarchy import/export, and open-save-reopen verification."
doc_version: 3
doc_updated_at: "2026-09-15T04:39:43.121Z"
doc_updated_by: "CODER"
description: "Implement upstream-compatible ODF style-name encoding, font-face declarations and font-name references for all built-in Writer paragraph styles and font formatting across open, save, and reopen workflows."
sections:
  Summary: |-
    Align Writer ODT font and style round-trip with LibreOffice

    Implement upstream-compatible ODF style-name encoding, font-face declarations and font-name references for all built-in Writer paragraph styles and font formatting across open, save, and reopen workflows.
  Scope: |-
    - In scope: Implement upstream-compatible ODF style-name encoding, font-face declarations and font-name references for all built-in Writer paragraph styles and font formatting across open, save, and reopen workflows.
    - Out of scope: unrelated refactors not required for "Align Writer ODT font and style round-trip with LibreOffice".
  Plan: "1. Port LibreOffice-compatible ODF NCName encoding and decoding for built-in Writer paragraph style names. 2. Extend styles.xml and content.xml export with office:font-face-decls, style:font-face declarations, and style:font-name references while retaining fo:font-family compatibility. 3. Extend streaming import contexts to resolve declared font faces and all built-in paragraph parent/follow relationships from LibreOffice-shaped ODT. 4. Add fixture and round-trip tests for all built-ins, style hierarchy, style/direct fonts, open-save-reopen, and malformed declarations. 5. Update documentation, parity, runtime inventory, and provenance as required. 6. Run focused tests, npm run verify, ap doctor, and routing validation."
  Verify Steps: |-
    1. Run npm run test:coverage --workspace @vite-office/office. Expected: all Writer, xmloff, and UI tests pass with 100% statements, branches, functions, and lines.
    2. Run npm run typecheck and npm run lint. Expected: both complete without errors or warnings.
    3. Run npm run check:dependencies, npm run check:source-provenance, npm run check:source-tree, and npm run check:file-size. Expected: all repository structure gates pass.
    4. Run npm run test:e2e and npm run test:static. Expected: opening/editing/saving browser flows and the production static build pass.
    5. Inspect the ODT round-trip tests. Expected: all 126 built-in paragraph styles retain encoded ODF names, parent/follow hierarchy, and selected fonts through open-save-reopen using office:font-face-decls and style:font-name.
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

Align Writer ODT font and style round-trip with LibreOffice

Implement upstream-compatible ODF style-name encoding, font-face declarations and font-name references for all built-in Writer paragraph styles and font formatting across open, save, and reopen workflows.

## Scope

- In scope: Implement upstream-compatible ODF style-name encoding, font-face declarations and font-name references for all built-in Writer paragraph styles and font formatting across open, save, and reopen workflows.
- Out of scope: unrelated refactors not required for "Align Writer ODT font and style round-trip with LibreOffice".

## Plan

1. Port LibreOffice-compatible ODF NCName encoding and decoding for built-in Writer paragraph style names. 2. Extend styles.xml and content.xml export with office:font-face-decls, style:font-face declarations, and style:font-name references while retaining fo:font-family compatibility. 3. Extend streaming import contexts to resolve declared font faces and all built-in paragraph parent/follow relationships from LibreOffice-shaped ODT. 4. Add fixture and round-trip tests for all built-ins, style hierarchy, style/direct fonts, open-save-reopen, and malformed declarations. 5. Update documentation, parity, runtime inventory, and provenance as required. 6. Run focused tests, npm run verify, ap doctor, and routing validation.

## Verify Steps

1. Run npm run test:coverage --workspace @vite-office/office. Expected: all Writer, xmloff, and UI tests pass with 100% statements, branches, functions, and lines.
2. Run npm run typecheck and npm run lint. Expected: both complete without errors or warnings.
3. Run npm run check:dependencies, npm run check:source-provenance, npm run check:source-tree, and npm run check:file-size. Expected: all repository structure gates pass.
4. Run npm run test:e2e and npm run test:static. Expected: opening/editing/saving browser flows and the production static build pass.
5. Inspect the ODT round-trip tests. Expected: all 126 built-in paragraph styles retain encoded ODF names, parent/follow hierarchy, and selected fonts through open-save-reopen using office:font-face-decls and style:font-name.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
