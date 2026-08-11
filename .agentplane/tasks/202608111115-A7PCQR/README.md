---
id: "202608111115-A7PCQR"
title: "Add Writer plain-text browser download"
status: "DOING"
priority: "high"
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
  updated_at: "2026-08-11T11:15:56.345Z"
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
    body: "Start: implement approved Writer plain-text browser download."
events:
  -
    type: "status"
    at: "2026-08-11T11:15:57.049Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Writer plain-text browser download."
doc_version: 3
doc_updated_at: "2026-08-11T11:15:57.049Z"
doc_updated_by: "CODER"
description: "Provide an accessible Writer workbench action that exports the current bounded plain-text paragraph through a browser Blob download adapter, without a backend or OpenDocument format claim."
sections:
  Summary: |-
    Add Writer plain-text browser download

    Provide an accessible Writer workbench action that exports the current bounded plain-text paragraph through a browser Blob download adapter, without a backend or OpenDocument format claim.
  Scope: |-
    - In scope: Provide an accessible Writer workbench action that exports the current bounded plain-text paragraph through a browser Blob download adapter, without a backend or OpenDocument format claim.
    - Out of scope: unrelated refactors not required for "Add Writer plain-text browser download".
  Plan: "Scope: export the current bounded Writer plain-text paragraph through a browser Blob URL download adapter. The UI has an accessible Download text button, and the platform adapter creates a UTF-8 text/plain Blob, invokes an injected anchor click, and revokes the object URL after use. Tests cover exact text, MIME type, deterministic filename, URL lifecycle, UI action, and unavailable browser APIs while retaining 100 percent coverage. Docs identify this as text export only. Non-goals: ODT, OOXML, PDF, multi-paragraph serialization, File System Access, download history, print, network, or broad parity claims. Verification: npm run verify, ap doctor, routing validation."
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

Add Writer plain-text browser download

Provide an accessible Writer workbench action that exports the current bounded plain-text paragraph through a browser Blob download adapter, without a backend or OpenDocument format claim.

## Scope

- In scope: Provide an accessible Writer workbench action that exports the current bounded plain-text paragraph through a browser Blob download adapter, without a backend or OpenDocument format claim.
- Out of scope: unrelated refactors not required for "Add Writer plain-text browser download".

## Plan

Scope: export the current bounded Writer plain-text paragraph through a browser Blob URL download adapter. The UI has an accessible Download text button, and the platform adapter creates a UTF-8 text/plain Blob, invokes an injected anchor click, and revokes the object URL after use. Tests cover exact text, MIME type, deterministic filename, URL lifecycle, UI action, and unavailable browser APIs while retaining 100 percent coverage. Docs identify this as text export only. Non-goals: ODT, OOXML, PDF, multi-paragraph serialization, File System Access, download history, print, network, or broad parity claims. Verification: npm run verify, ap doctor, routing validation.

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
