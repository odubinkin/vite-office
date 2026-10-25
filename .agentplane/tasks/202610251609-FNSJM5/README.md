---
id: "202610251609-FNSJM5"
title: "Connect native Writer TXT export and filter shell path"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-25T16:09:50.004Z"
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
    body: "Start: implement the approved Writer TXT native filter export and UI route in the current checkout."
events:
  -
    type: "status"
    at: "2026-10-25T16:09:53.382Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved Writer TXT native filter export and UI route in the current checkout."
doc_version: 3
doc_updated_at: "2026-10-25T16:09:53.382Z"
doc_updated_by: "CODER"
description: "Route Writer TXT download through native ASCII writer and document shell, preserving upstream filter boundaries and browser medium semantics; verify related core and UI behavior."
sections:
  Summary: |-
    Connect native Writer TXT export and filter shell path

    Route Writer TXT download through native ASCII writer and document shell, preserving upstream filter boundaries and browser medium semantics; verify related core and UI behavior.
  Scope: "In scope: Writer ASCII filter full-document range, SwDocShell TXT serialization, browser download adapter, related ASCII/core/UI tests and provenance. Out of scope: unrelated storage and autosave behavior."
  Plan: "Trace upstream ASCII writer defaults and full-document selection. Add a shell-owned TXT serialization path using SwASCWriter over native nodes. Route the browser TXT download through that path and preserve the export medium contract. Add focused core and UI tests, run declared checks, document findings and finish the task."
  Verify Steps: |-
    1. Run npx vitest run apps/office/src/sw/source/filter/ascii/native-ascii-range.test.ts apps/office/src/sw/browser/presentation/WriterFileDialog.test.tsx. Expect native range and TXT UI checks pass.
    2. Run npm run typecheck --workspace @vite-office/office. Expect no type errors.
    3. Run npx prettier --check on changed source and test files, and npx eslint on changed source and test files. Expect no diagnostics.
    4. Inspect TXT export through SwDocShell and SwASCWriter, including list labels, paragraph terminators and export medium status; record evidence and final git status.
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

Connect native Writer TXT export and filter shell path

Route Writer TXT download through native ASCII writer and document shell, preserving upstream filter boundaries and browser medium semantics; verify related core and UI behavior.

## Scope

In scope: Writer ASCII filter full-document range, SwDocShell TXT serialization, browser download adapter, related ASCII/core/UI tests and provenance. Out of scope: unrelated storage and autosave behavior.

## Plan

Trace upstream ASCII writer defaults and full-document selection. Add a shell-owned TXT serialization path using SwASCWriter over native nodes. Route the browser TXT download through that path and preserve the export medium contract. Add focused core and UI tests, run declared checks, document findings and finish the task.

## Verify Steps

1. Run npx vitest run apps/office/src/sw/source/filter/ascii/native-ascii-range.test.ts apps/office/src/sw/browser/presentation/WriterFileDialog.test.tsx. Expect native range and TXT UI checks pass.
2. Run npm run typecheck --workspace @vite-office/office. Expect no type errors.
3. Run npx prettier --check on changed source and test files, and npx eslint on changed source and test files. Expect no diagnostics.
4. Inspect TXT export through SwDocShell and SwASCWriter, including list labels, paragraph terminators and export medium status; record evidence and final git status.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
