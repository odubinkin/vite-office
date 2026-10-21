---
id: "202610210152-BHWWEZ"
title: "Implement native Writer intrusive rings and search selection ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on:
  - "202610202049-9BAAAC"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-21T01:52:34.566Z"
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
    body: "Start: Continue approved parent search implementation with native intrusive rings, live selection traversal and result ownership; preserve source predicates and targeted cadence."
events:
  -
    type: "status"
    at: "2026-10-21T01:52:55.255Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Continue approved parent search implementation with native intrusive rings, live selection traversal and result ownership; preserve source predicates and targeted cadence."
doc_version: 3
doc_updated_at: "2026-10-21T01:52:55.255Z"
doc_updated_by: "CODER"
description: "Continue the approved Writer search feature with original sw/inc/ring.hxx Ring/RingIterator/RingContainer, consumed SwPaM ownership and native lcl_FindSelection/lcl_MakeSel search region and result-ring transfer. Preserve native predicates, ordering and suspicious contracts; targeted evidence only after the completed full cadence task."
sections:
  Summary: "Replace copied search-result lists with original intrusive Writer rings and source-shaped search selection traversal, within the already approved parent feature."
  Scope: "Only vite-office-writer on writer. Up to22 non-task paths: sw/inc/ring.ts and tests; SwPaM ring inheritance; swcrsr FindAll, original lcl_FindSelection and lcl_MakeSel helpers; related cursor/search/history tests; exact source runtime/provenance/import evidence; suspected upstream issues. Native checked assert uses existing SAL compiler binding. Preserve current endpoint storage and explicit unsupported notes/layout/readonly boundaries; no configuration/UI/ICU/network/storage/recovery changes, new dependencies, merges or publication. Existing parent approval covers search cursor ownership and local LibreOffice source reads. No full-suite rerun for this first leaf after cadence checkpoint9BAAAC."
  Plan: "1. Map pinned ring.hxx/uwriter and swcrsr search contracts. 2. Port original intrusive Ring/iterator/container and make SwPaM consume it without replacing endpoint storage. 3. Port live lcl_FindSelection, region admission helpers and actual result-ring merge into FindAll, preserving native quirks and unsupported dependency boundaries. 4. Add source-derived ring/real-document identity, scope, replacement and failure tests, updating source records honestly. 5. Run related unit/coverage/static/browser/quality gates, formal committed review and close only this leaf. This executes the approved parent Writer search cursor ownership plan; no external access or pass-criteria expansion."
  Verify Steps: "Port and exercise original uwriter testIntrusiveRing ordering, construction, MoveTo/self/unlink, container merge, iterator sentinel/equality and preserved merge assertions. Use actual Writer document/cursor strategies to verify live Create identity and result merge, selection-only/all directions, moving original ring endpoints, collapsed/empty/other-area entry, no-ring replacement and cancellation/threshold undo restoration. Run related cursor/shell/undo/search Vitest suites and strict scoped coverage for new Ring owner. Run build/static and related Chromium ring/table/cursor cases after production changes. Run changed Prettier/ESLint, dependency/provenance/tree/docs/file-size and writer/shared inventory checks; doctor/routing, diff/status and formal committed EVALUATOR review. Preserve old failure evidence; no test deletion, blanket exclusion, threshold change or full native service claim."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this leaf implementation and lifecycle commits if required, preserving all earlier approved Writer source contracts and user changes. Do not reset or merge branches."
  Findings: ""
id_source: "generated"
---
## Summary

Replace copied search-result lists with original intrusive Writer rings and source-shaped search selection traversal, within the already approved parent feature.

## Scope

Only vite-office-writer on writer. Up to22 non-task paths: sw/inc/ring.ts and tests; SwPaM ring inheritance; swcrsr FindAll, original lcl_FindSelection and lcl_MakeSel helpers; related cursor/search/history tests; exact source runtime/provenance/import evidence; suspected upstream issues. Native checked assert uses existing SAL compiler binding. Preserve current endpoint storage and explicit unsupported notes/layout/readonly boundaries; no configuration/UI/ICU/network/storage/recovery changes, new dependencies, merges or publication. Existing parent approval covers search cursor ownership and local LibreOffice source reads. No full-suite rerun for this first leaf after cadence checkpoint9BAAAC.

## Plan

1. Map pinned ring.hxx/uwriter and swcrsr search contracts. 2. Port original intrusive Ring/iterator/container and make SwPaM consume it without replacing endpoint storage. 3. Port live lcl_FindSelection, region admission helpers and actual result-ring merge into FindAll, preserving native quirks and unsupported dependency boundaries. 4. Add source-derived ring/real-document identity, scope, replacement and failure tests, updating source records honestly. 5. Run related unit/coverage/static/browser/quality gates, formal committed review and close only this leaf. This executes the approved parent Writer search cursor ownership plan; no external access or pass-criteria expansion.

## Verify Steps

Port and exercise original uwriter testIntrusiveRing ordering, construction, MoveTo/self/unlink, container merge, iterator sentinel/equality and preserved merge assertions. Use actual Writer document/cursor strategies to verify live Create identity and result merge, selection-only/all directions, moving original ring endpoints, collapsed/empty/other-area entry, no-ring replacement and cancellation/threshold undo restoration. Run related cursor/shell/undo/search Vitest suites and strict scoped coverage for new Ring owner. Run build/static and related Chromium ring/table/cursor cases after production changes. Run changed Prettier/ESLint, dependency/provenance/tree/docs/file-size and writer/shared inventory checks; doctor/routing, diff/status and formal committed EVALUATOR review. Preserve old failure evidence; no test deletion, blanket exclusion, threshold change or full native service claim.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this leaf implementation and lifecycle commits if required, preserving all earlier approved Writer source contracts and user changes. Do not reset or merge branches.

## Findings
