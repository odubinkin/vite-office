---
id: "202610281658-B8TCAE"
title: "Close integrated runtime coverage gaps without changing upstream behavior"
status: "DOING"
priority: "high"
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
  updated_at: "2026-10-28T16:59:07.481Z"
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
    body: "Start: Close the user-approved integrated runtime coverage gaps while preserving upstream behavior and strict verification gates."
events:
  -
    type: "status"
    at: "2026-10-28T16:59:17.464Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Close the user-approved integrated runtime coverage gaps while preserving upstream behavior and strict verification gates."
doc_version: 3
doc_updated_at: "2026-10-28T16:59:17.464Z"
doc_updated_by: "CODER"
description: "User explicitly approved expanding the integration work to100 percent coverage, with individually reviewed unreachable branches. Add meaningful source-backed regression tests for the255-file diagnostic gap set, repair actual bugs from evidence, preserve coverage thresholds and native contracts, record suspected upstream issues, and validate current-code full coverage before unblocking the integration publication task."
sections:
  Summary: "Close the full integration coverage gaps before publication. On2026-10-28 (Asia/Bangkok), the user explicitly chose100 percent coverage and separate review of unreachable branches."
  Scope: "The255-file diagnostic gap set from integration task581KM2, meaningful tests and evidence-backed bug repairs across ICU/calendars, formatting, Writer and remaining runtime owners. Preserve upstream contracts,100 percent thresholds and test discovery. Suspected native defects go into the named Writer/Calc journals. No automatic exclusions or acceptance of unreachable branches."
  Plan: "Execute the user-approved full coverage expansion across the255-file gap set using actual-owner source-backed tests, individual unreachable-branch review, unchanged strict gates and final complete verification."
  Verify Steps: |-
    1. Run targeted Vitest/Istanbul profiles for changed runtime owners and meaningful regression cases; retain raw counters and report any unresolved source-domain branches.
    2. Keep coverage thresholds and discovery unchanged; obtain explicit user decision before any unreachable-branch exception.
    3. Run npm run verify on final code, plus ap doctor and policy routing; record exact results. No broad success claim from a narrowed profile.
  Verification: "Pending. Initial integration report:255 files,4303 statements and4050 branch arms uncovered, including documented native edge paths. Both prior failing integration assertions were repaired and147 focused tests pass. All537 browser plus5 final-build Calc checks pass."
  Rollback Plan: "Keep test and source changes in traceable commits. Revert a faulty change through a new commit; never rewrite published history. Preserve existing Calc untracked output."
  Findings: "The BinaryInputStream smaller remaining-count arm is theoretically reachable after281474976710655 full32768-byte reads; EOF before that terminates the loop. No exception has been approved. User asked for explanation and explicitly chose to expand coverage work. Integration task202610281559-581KM2 awaits this deliverable."
id_source: "generated"
---
## Summary

Close the full integration coverage gaps before publication. On2026-10-28 (Asia/Bangkok), the user explicitly chose100 percent coverage and separate review of unreachable branches.

## Scope

The255-file diagnostic gap set from integration task581KM2, meaningful tests and evidence-backed bug repairs across ICU/calendars, formatting, Writer and remaining runtime owners. Preserve upstream contracts,100 percent thresholds and test discovery. Suspected native defects go into the named Writer/Calc journals. No automatic exclusions or acceptance of unreachable branches.

## Plan

Execute the user-approved full coverage expansion across the255-file gap set using actual-owner source-backed tests, individual unreachable-branch review, unchanged strict gates and final complete verification.

## Verify Steps

1. Run targeted Vitest/Istanbul profiles for changed runtime owners and meaningful regression cases; retain raw counters and report any unresolved source-domain branches.
2. Keep coverage thresholds and discovery unchanged; obtain explicit user decision before any unreachable-branch exception.
3. Run npm run verify on final code, plus ap doctor and policy routing; record exact results. No broad success claim from a narrowed profile.

## Verification

Pending. Initial integration report:255 files,4303 statements and4050 branch arms uncovered, including documented native edge paths. Both prior failing integration assertions were repaired and147 focused tests pass. All537 browser plus5 final-build Calc checks pass.

## Rollback Plan

Keep test and source changes in traceable commits. Revert a faulty change through a new commit; never rewrite published history. Preserve existing Calc untracked output.

## Findings

The BinaryInputStream smaller remaining-count arm is theoretically reachable after281474976710655 full32768-byte reads; EOF before that terminates the loop. No exception has been approved. User asked for explanation and explicitly chose to expand coverage work. Integration task202610281559-581KM2 awaits this deliverable.
