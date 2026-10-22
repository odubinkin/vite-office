---
id: "202610221940-TV1H69"
title: "Complete native Writer row height balancing and layout publication"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-22T19:43:18.463Z"
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
    body: "Start: port native row balancing through actual frame geometry and shell layout completion, fix natural device measurement, and connect source sizing controls with related evidence."
events:
  -
    type: "status"
    at: "2026-10-22T19:44:18.008Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port native row balancing through actual frame geometry and shell layout completion, fix natural device measurement, and connect source sizing controls with related evidence."
doc_version: 3
doc_updated_at: "2026-10-22T19:44:53.290Z"
doc_updated_by: "CODER"
description: "Port native BalanceRowHeight through actual registered row frame areas, synchronous shell layout completion and source UI commands; correct natural row device measurement and remove layout mutation from browser paint."
sections:
  Summary: |-
    Complete native Writer row height balancing and layout publication

    Port native BalanceRowHeight through actual registered row frame areas, synchronous shell layout completion and source UI commands; correct natural row device measurement and remove layout mutation from browser paint.
  Scope: "Only vite-office-writer on writer. Native row frame geometry/publication, existing root layout completion and browser natural-row device measurement, document/shell BalanceRowHeight, two original table sizing slots and their menu/sidebar controls, related core/layout/UI/ODT/browser tests and conservative provenance/runtime records. Port source selection, history and arithmetic without model snapshots or browser-supplied command height arrays. No column auto-fit, structural deletion, network/branch/merge operations, locale expansion or recovery/save/open policy changes."
  Plan: "Publish represented row frame/print area height during core Format and remove Format calls from browser paint; measure natural row content independently of authored fixed/minimum height. Complete root layout synchronously from its existing device inputs at the native shell action boundary. Port native BalanceRowHeight test-only admission, registered SwFrame maximums and optimize-average/normal-maximum modes through actual row formats and history. Connect SetOptimalRowHeight and DistributeRows with source two-pass ordering, state, menu placements and full consumed row-sizing sidebar group. Verify natural-content shrink/growth, selection, callbacks, frame identity, history and ODT on desktop/mobile; document any suspected upstream arithmetic issue and preserve it. Continue goal after task closure."
  Verify Steps: "Verify real registered row frame areas, print-height publication and invalidation; test-only command must not mutate history/layout/model. Cover current versus table-selected and ordinary marks, multiple frame clients, optimize mean and normal running maximum, exact item/history/cursor behavior and arithmetic boundaries from source. Verify shell completion between two optimal-height passes using original root-owned measured geometry. Browser tests at1280/390 must prove content-dependent natural sizing, shrinking after fixed height, distribution of unequal rows, proper source UI sensitivity and repeated Undo/Redo, actual ODT roundtrip and original cursor owners. Run related row/table layout, measurement, native owner, sizing/sidebar/menu and I/O regressions; strict coverage for changed responsibilities, typecheck, changed-source lint/format, build/static, resources/boundaries/JSDoc/file-size/source-tree/provenance/invariants/parity and AgentPlane doctor/routing. Task3 after ACR55N full checkpoint; do not repeat full suites until the ten-task cadence."
  Verification: "Pending source implementation and related checks."
  Rollback Plan: "Revert only task implementation commits while retaining completed table flow and column sizing functionality. No branch/integration operations."
  Findings: |-
    Previous goal turn made verified progress: AAX9TR closed with native column width command/dialog, document-bound size drafts and clean writer state. Current inspection found row Format returns height without publishing actual frame areas, browser paint calls Format(0), and offscreen measurement inherits authored fixed/minimum heights. These prevent faithful native balancing and content shrink. Existing root already owns real registered frames and measured device inputs; extend that ownership without parallel geometry registries. Broad user continuation/mutation authorization remains in force; use pinned local sources, no network or outside access.

    - Observation: A read-only task-brief command piped through head reported EPIPE after the consumer closed stdout; canonical task state was already DOING and its route remained artifact persistence.
      Impact: No implementation mutation occurred; this is output handling rather than a source or scope failure.
      Resolution: Recompute authoritative route and use bounded tool output instead of early-closing stdout pipes. Retain original failure and continue approved artifact persistence.
id_source: "generated"
---
## Summary

Complete native Writer row height balancing and layout publication

Port native BalanceRowHeight through actual registered row frame areas, synchronous shell layout completion and source UI commands; correct natural row device measurement and remove layout mutation from browser paint.

## Scope

Only vite-office-writer on writer. Native row frame geometry/publication, existing root layout completion and browser natural-row device measurement, document/shell BalanceRowHeight, two original table sizing slots and their menu/sidebar controls, related core/layout/UI/ODT/browser tests and conservative provenance/runtime records. Port source selection, history and arithmetic without model snapshots or browser-supplied command height arrays. No column auto-fit, structural deletion, network/branch/merge operations, locale expansion or recovery/save/open policy changes.

## Plan

Publish represented row frame/print area height during core Format and remove Format calls from browser paint; measure natural row content independently of authored fixed/minimum height. Complete root layout synchronously from its existing device inputs at the native shell action boundary. Port native BalanceRowHeight test-only admission, registered SwFrame maximums and optimize-average/normal-maximum modes through actual row formats and history. Connect SetOptimalRowHeight and DistributeRows with source two-pass ordering, state, menu placements and full consumed row-sizing sidebar group. Verify natural-content shrink/growth, selection, callbacks, frame identity, history and ODT on desktop/mobile; document any suspected upstream arithmetic issue and preserve it. Continue goal after task closure.

## Verify Steps

Verify real registered row frame areas, print-height publication and invalidation; test-only command must not mutate history/layout/model. Cover current versus table-selected and ordinary marks, multiple frame clients, optimize mean and normal running maximum, exact item/history/cursor behavior and arithmetic boundaries from source. Verify shell completion between two optimal-height passes using original root-owned measured geometry. Browser tests at1280/390 must prove content-dependent natural sizing, shrinking after fixed height, distribution of unequal rows, proper source UI sensitivity and repeated Undo/Redo, actual ODT roundtrip and original cursor owners. Run related row/table layout, measurement, native owner, sizing/sidebar/menu and I/O regressions; strict coverage for changed responsibilities, typecheck, changed-source lint/format, build/static, resources/boundaries/JSDoc/file-size/source-tree/provenance/invariants/parity and AgentPlane doctor/routing. Task3 after ACR55N full checkpoint; do not repeat full suites until the ten-task cadence.

## Verification

Pending source implementation and related checks.

## Rollback Plan

Revert only task implementation commits while retaining completed table flow and column sizing functionality. No branch/integration operations.

## Findings

Previous goal turn made verified progress: AAX9TR closed with native column width command/dialog, document-bound size drafts and clean writer state. Current inspection found row Format returns height without publishing actual frame areas, browser paint calls Format(0), and offscreen measurement inherits authored fixed/minimum heights. These prevent faithful native balancing and content shrink. Existing root already owns real registered frames and measured device inputs; extend that ownership without parallel geometry registries. Broad user continuation/mutation authorization remains in force; use pinned local sources, no network or outside access.

- Observation: A read-only task-brief command piped through head reported EPIPE after the consumer closed stdout; canonical task state was already DOING and its route remained artifact persistence.
  Impact: No implementation mutation occurred; this is output handling rather than a source or scope failure.
  Resolution: Recompute authoritative route and use bounded tool output instead of early-closing stdout pipes. Retain original failure and continue approved artifact persistence.
