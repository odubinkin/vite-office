---
id: "202609241135-FVV0N3"
title: "F8 Restore Writer layout measurement ownership"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202609241135-GT2KTZ"
tags:
  - "code"
  - "parity"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T13:24:10.588Z"
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
    body: "Start: bind Writer layout to canonical nodes and narrow browser line measurements."
events:
  -
    type: "status"
    at: "2026-09-24T13:24:11.377Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: bind Writer layout to canonical nodes and narrow browser line measurements."
doc_version: 3
doc_updated_at: "2026-09-24T13:24:11.377Z"
doc_updated_by: "CODER"
description: "Implement F8: keep browser measurement behind a device port and persistent Writer frame ownership in core layout/text."
sections:
  Summary: |-
    F8 Restore Writer layout measurement ownership

    Implement F8: keep browser measurement behind a device port and persistent Writer frame ownership in core layout/text.
  Scope: |-
    - In scope: Implement F8: keep browser measurement behind a device port and persistent Writer frame ownership in core layout/text.
    - Out of scope: unrelated refactors not required for "F8 Restore Writer layout measurement ownership".
  Plan: "Bind persistent SwRootFrame and SwTextFrame layout to canonical SwTextNode identity and pooled paragraph items. Keep DOM Range shaping and font metrics in sw/browser/editor; pass only measured line boundaries/heights plus source node identity into core. Remove style, spacing, line-number and keep-with-next values derived from Writer view DTOs at the browser boundary; core reads them from nodes. Preserve page-fragment identity, page flow and rendering contracts; add focused default/non-default tests and update exact provenance/inventory data without changing validators."
  Verify Steps: "1. sw/browser/editor owns DOM Range and font measurement; core layout receives a narrow measurement port bound to SwTextNode and reads paragraph spacing, style, keep-with-next and line-number flags from canonical pooled items rather than WriterParagraphProjection. 2. Page breaks, follow frames, contextual spacing, keep-with-next, line numbering and unchanged frame identity pass focused tests with default and non-default inputs; browser rendering maps page fragments to the same canonical nodes. 3. Source provenance and runtime inventory show exact ownership, no browser or React object enters core, npm run verify and git diff --check pass."
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

F8 Restore Writer layout measurement ownership

Implement F8: keep browser measurement behind a device port and persistent Writer frame ownership in core layout/text.

## Scope

- In scope: Implement F8: keep browser measurement behind a device port and persistent Writer frame ownership in core layout/text.
- Out of scope: unrelated refactors not required for "F8 Restore Writer layout measurement ownership".

## Plan

Bind persistent SwRootFrame and SwTextFrame layout to canonical SwTextNode identity and pooled paragraph items. Keep DOM Range shaping and font metrics in sw/browser/editor; pass only measured line boundaries/heights plus source node identity into core. Remove style, spacing, line-number and keep-with-next values derived from Writer view DTOs at the browser boundary; core reads them from nodes. Preserve page-fragment identity, page flow and rendering contracts; add focused default/non-default tests and update exact provenance/inventory data without changing validators.

## Verify Steps

1. sw/browser/editor owns DOM Range and font measurement; core layout receives a narrow measurement port bound to SwTextNode and reads paragraph spacing, style, keep-with-next and line-number flags from canonical pooled items rather than WriterParagraphProjection. 2. Page breaks, follow frames, contextual spacing, keep-with-next, line numbering and unchanged frame identity pass focused tests with default and non-default inputs; browser rendering maps page fragments to the same canonical nodes. 3. Source provenance and runtime inventory show exact ownership, no browser or React object enters core, npm run verify and git diff --check pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
