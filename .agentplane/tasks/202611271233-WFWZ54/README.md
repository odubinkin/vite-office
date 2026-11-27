---
id: "202611271233-WFWZ54"
title: "Preserve native Calc document configuration in ODS settings"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "configuration"
  - "ods"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Verify original Calc ODS settings and string reference semantics, typed group and view precedence, native state across Worker and ODS reopen, existing related Calc view, formula, Worker and Writer shared-settings tests, and focused static validation."
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T12:33:46.383Z"
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
    body: "Start: trace the native typed settings sequence and link it to the represented Calc configuration owner in an isolated checkout of the live checkpoint baseline."
events:
  -
    type: "status"
    at: "2026-11-27T12:33:47.277Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: trace the native typed settings sequence and link it to the represented Calc configuration owner in an isolated checkout of the live checkpoint baseline."
doc_version: 3
doc_updated_at: "2026-11-27T12:33:47.277Z"
doc_updated_by: "CODER"
description: "Connect the represented Calc document configuration property owner to the original ODS settings groups, native typed scalar values, ordinary calculation setup, and Worker transport. Preserve native view and raster option precedence, AutoCalculate state, and explicit and fallback SyntaxStringRef conventions. Retain existing shell lifecycle, UI, autosave, recovery, and link handling. Verify pinned LibreOffice ODS fixtures and relevant existing Calc, Writer shared settings and graph tests."
sections:
  Summary: |-
    Preserve native Calc document configuration in ODS settings

    Connect the represented Calc document configuration property owner to the original ODS settings groups, native typed scalar values, ordinary calculation setup, and Worker transport. Preserve native view and raster option precedence, AutoCalculate state, and explicit and fallback SyntaxStringRef conventions. Retain existing shell lifecycle, UI, autosave, recovery, and link handling. Verify pinned LibreOffice ODS fixtures and relevant existing Calc, Writer shared settings and graph tests.
  Scope: |-
    - In scope: Connect the represented Calc document configuration property owner to the original ODS settings groups, native typed scalar values, ordinary calculation setup, and Worker transport. Preserve native view and raster option precedence, AutoCalculate state, and explicit and fallback SyntaxStringRef conventions. Retain existing shell lifecycle, UI, autosave, recovery, and link handling. Verify pinned LibreOffice ODS fixtures and relevant existing Calc, Writer shared settings and graph tests.
    - Out of scope: unrelated refactors not required for "Preserve native Calc document configuration in ODS settings".
  Plan: "Inspect the pinned ScDocumentConfiguration property map, calculation fallback and settings stream ownership. Implement the represented typed configuration service over existing Calc document and view state, reuse shared xmloff scalar and collection contracts for combined settings import/export, and preserve that state across Worker transfer. Apply native settings and content import order. Carry existing view precedence and lifecycle decisions. Verify an original ODS fixture through normal import, Worker and reopen, plus related formula/view/shared XML tests and native provenance."
  Verify Steps: |-
    PLANNER fallback scaffold for "Preserve native Calc document configuration in ODS settings". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Preserve native Calc document configuration in ODS settings". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
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

Preserve native Calc document configuration in ODS settings

Connect the represented Calc document configuration property owner to the original ODS settings groups, native typed scalar values, ordinary calculation setup, and Worker transport. Preserve native view and raster option precedence, AutoCalculate state, and explicit and fallback SyntaxStringRef conventions. Retain existing shell lifecycle, UI, autosave, recovery, and link handling. Verify pinned LibreOffice ODS fixtures and relevant existing Calc, Writer shared settings and graph tests.

## Scope

- In scope: Connect the represented Calc document configuration property owner to the original ODS settings groups, native typed scalar values, ordinary calculation setup, and Worker transport. Preserve native view and raster option precedence, AutoCalculate state, and explicit and fallback SyntaxStringRef conventions. Retain existing shell lifecycle, UI, autosave, recovery, and link handling. Verify pinned LibreOffice ODS fixtures and relevant existing Calc, Writer shared settings and graph tests.
- Out of scope: unrelated refactors not required for "Preserve native Calc document configuration in ODS settings".

## Plan

Inspect the pinned ScDocumentConfiguration property map, calculation fallback and settings stream ownership. Implement the represented typed configuration service over existing Calc document and view state, reuse shared xmloff scalar and collection contracts for combined settings import/export, and preserve that state across Worker transfer. Apply native settings and content import order. Carry existing view precedence and lifecycle decisions. Verify an original ODS fixture through normal import, Worker and reopen, plus related formula/view/shared XML tests and native provenance.

## Verify Steps

PLANNER fallback scaffold for "Preserve native Calc document configuration in ODS settings". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Preserve native Calc document configuration in ODS settings". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
