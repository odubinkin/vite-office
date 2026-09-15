---
id: "202609150422-02D0CJ"
title: "Align Writer ODT font and style round-trip with LibreOffice"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
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
doc_updated_at: "2026-09-15T04:22:54.718Z"
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
    PLANNER fallback scaffold. Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
    2. Run the most relevant validation step for the `code` task. Expected: it succeeds without unexpected regressions in touched scope.
    3. Compare the final result against the task summary and scope. Expected: any remaining follow-up is explicit in ## Findings.
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

PLANNER fallback scaffold. Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
2. Run the most relevant validation step for the `code` task. Expected: it succeeds without unexpected regressions in touched scope.
3. Compare the final result against the task summary and scope. Expected: any remaining follow-up is explicit in ## Findings.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
