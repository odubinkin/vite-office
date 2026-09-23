---
id: "202609231700-TZMGXV"
title: "Consolidate Writer transfer workflow ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-23T17:00:30.034Z"
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
    body: "Start: Consolidate Writer transfer policy and native browser clipboard paths against pinned LibreOffice ownership, with focused tests and full verification."
events:
  -
    type: "status"
    at: "2026-09-23T17:00:31.020Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Consolidate Writer transfer policy and native browser clipboard paths against pinned LibreOffice ownership, with focused tests and full verification."
doc_version: 3
doc_updated_at: "2026-09-23T17:00:31.020Z"
doc_updated_by: "CODER"
description: "Implement section 7 transfer and browser workflow ownership audit against pinned LibreOffice swdtflvr.cxx"
sections:
  Summary: |-
    Consolidate Writer transfer workflow ownership

    Implement section 7 transfer and browser workflow ownership audit against pinned LibreOffice swdtflvr.cxx
  Scope: "In scope: Writer transfer/shell ownership for Copy, Cut, Paste, and drag/drop; browser adapter MIME I/O; focused behavior tests and docs. Expected paths: swdtflvr.ts, edtwin.ts, browser-writer-edit-window.ts, writer-clipboard-events.ts, writer-workflows.ts, their focused tests, and docs/program/writer-clipboard.md. No document storage model change, network access, or unrelated command expansion."
  Plan: "1. Compare current entrypoints with pinned swdtflvr.cxx Copy/Cut/Paste ownership and supported formats. 2. Move transfer format choice, selection preconditions, delete-after-copy, and target conversion/insertion into Writer transfer/shell code while leaving DOM and Clipboard API calls in the browser adapter. 3. Apply one behavior table to command and native event paths, including drag/drop. 4. Add focused source-derived tests, update behavior docs, run repository checks, record evidence, and finish."
  Verify Steps: "1. Run focused Vitest suites for SwTransferable, Writer workflows, browser edit window, and React editor; assert menu/toolbar/keyboard/native/drag-drop behavior, rich/plain, nested lists, hyperlink, collapsed/ranged selection, failure, and undo. 2. Run npm run verify; expect all static, type, boundary, provenance, unit, browser, and documentation checks to pass. 3. Review diff against pinned swdtflvr.cxx and confirm browser-only API use stays in browser modules, document storage shape is unchanged, and git status contains only task changes."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation and close commits, then rerun focused transfer tests and npm run verify."
  Findings: ""
id_source: "generated"
---
## Summary

Consolidate Writer transfer workflow ownership

Implement section 7 transfer and browser workflow ownership audit against pinned LibreOffice swdtflvr.cxx

## Scope

In scope: Writer transfer/shell ownership for Copy, Cut, Paste, and drag/drop; browser adapter MIME I/O; focused behavior tests and docs. Expected paths: swdtflvr.ts, edtwin.ts, browser-writer-edit-window.ts, writer-clipboard-events.ts, writer-workflows.ts, their focused tests, and docs/program/writer-clipboard.md. No document storage model change, network access, or unrelated command expansion.

## Plan

1. Compare current entrypoints with pinned swdtflvr.cxx Copy/Cut/Paste ownership and supported formats. 2. Move transfer format choice, selection preconditions, delete-after-copy, and target conversion/insertion into Writer transfer/shell code while leaving DOM and Clipboard API calls in the browser adapter. 3. Apply one behavior table to command and native event paths, including drag/drop. 4. Add focused source-derived tests, update behavior docs, run repository checks, record evidence, and finish.

## Verify Steps

1. Run focused Vitest suites for SwTransferable, Writer workflows, browser edit window, and React editor; assert menu/toolbar/keyboard/native/drag-drop behavior, rich/plain, nested lists, hyperlink, collapsed/ranged selection, failure, and undo. 2. Run npm run verify; expect all static, type, boundary, provenance, unit, browser, and documentation checks to pass. 3. Review diff against pinned swdtflvr.cxx and confirm browser-only API use stays in browser modules, document storage shape is unchanged, and git status contains only task changes.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation and close commits, then rerun focused transfer tests and npm run verify.

## Findings
