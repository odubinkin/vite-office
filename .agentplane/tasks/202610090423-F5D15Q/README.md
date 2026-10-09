---
id: "202610090423-F5D15Q"
title: "Repair table Undo acceptance tests for native row lifetime"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T04:24:46.701Z"
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
    body: "Start: repair four full247 acceptance failures using pre-Undo value snapshots and native released-registration assertions; validate related tests once upstream absent, retain exact-source coverage evidence then pause under updated human instruction."
events:
  -
    type: "status"
    at: "2026-10-09T04:24:47.189Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: repair four full247 acceptance failures using pre-Undo value snapshots and native released-registration assertions; validate related tests once upstream absent, retain exact-source coverage evidence then pause under updated human instruction."
doc_version: 3
doc_updated_at: "2026-10-09T04:24:47.189Z"
doc_updated_by: "CODER"
description: "Resolve four full247 failures by comparing live Redo rows/cells with values captured before native destruction; assert old registrations are released, retain all existing behavior assertions, validate targeted native table history tests once upstream absent and pause after remediation."
sections:
  Summary: "Repair four full247 table Undo failures by respecting native destroyed-row lifetime, then pause as the user requested."
  Scope: "Only native-table-tab.test.tsx, native-row-insertion.test.ts and native-insert-table-history.test.ts; new248 task subtree and exact parent Findings append. Production/metadata/other acceptance files unchanged."
  Plan: "Repair exactly three acceptance files implicated in four full247 failures. Capture independent row/cell format values while original owners are live, compare Redo owners with those values, and explicitly assert old Writer registrations were released by Undo. Preserve all remaining identity/content/cursor/history/DOM assertions and every unrelated test/source/metadata byte. Pinned SwTableLine destructor and KillEmptyFrameFormat confirm destroying native rows/formats; do not revive disposed owners or add fallback adapters. One targeted upstream-absent run covers changed tests and related native row/table/format lifetime history modules; build/static plus scoped format/lint/typecheck and source-bound coverage certification100/all-four. Production is unchanged, so prior246 entire actual coverage maps may be reused only after exact current source hashes and whole map/proof digest validation; retain full247 raw failures/coverage truth. No network/global/subagents, no upstream/raw source/results/maps/scripts/Python in AP, no full replay. Record bounded evidence and exact parent prefix append, complete repair leaf then pause under user's updated instruction."
  Verify Steps: |-
    1. Inspect pinned SwTableLine::~SwTableLine and KillEmptyFrameFormat and actual RemoveTableRow/SwClient.Dispose; record identifier/hash anchors only. Capture baseline hashes for unchanged production/metadata and all666 acceptance files.
    2. Migrate only three implicated acceptance files: snapshot complete independent row/cell values and paragraph style before Undo; retain Redo identity/attributes/content/cursor/DOM/history assertions and assert removed row/box GetRegisteredIn becomes undefined. No test removals/skips/only or production edits.
    3. Once upstream physically absent, run scoped Prettier/ESLint, app/tools typecheck, build/static, and targeted app tests with V8 coverage reportOnFailure/json reporters for the changed3files plus related native format/history/table modules. Restore upstream in finally. Resolve actual failures within approved remediation scope; do not replay the complete full suite.
    4. Require all selected cases pass and source-bound app/inventory100 lines/statements/functions/branches. Unchanged production can retain entire prior246 actual certificate only after source-by-source bytes and raw map/proof digests match; never normalize counters or hide247 failures. Save raw evidence/scripts/maps/snapshots only ignored app cache. Record exact case counts and source preservation.
    5. ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check; source-size/AP artifact census and exact parent prefix append pass. Record verified repair with actual test-fix commit; retain247 historical failed profile/rework evidence. Stop and pause goal after successful remediation, without new implementation tasks.
  Verification: "Pending targeted remediation validation and exact-source coverage certification. Historical full247 failures remain recorded unchanged."
  Rollback Plan: "Revert only the three scoped acceptance migrations if invalid. Restore upstream in finally. Preserve historical full247 results and current changes; no destructive history operations."
  Findings: "Four failures read SwTableLine.GetFormat on a row destroyed by Undo. Pin9bc445578031fecf56086729d8e4940c77e14d65 SwTableLine destructor removes last Writer client and deletes format; local RemoveTableRow destroys row/boxes. Tests must capture expected values before deletion. New user instruction explicitly authorizes repairing these failures before pausing; previous prohibition on repair after full247 is superseded."
id_source: "generated"
---
## Summary

Repair four full247 table Undo failures by respecting native destroyed-row lifetime, then pause as the user requested.

## Scope

Only native-table-tab.test.tsx, native-row-insertion.test.ts and native-insert-table-history.test.ts; new248 task subtree and exact parent Findings append. Production/metadata/other acceptance files unchanged.

## Plan

Repair exactly three acceptance files implicated in four full247 failures. Capture independent row/cell format values while original owners are live, compare Redo owners with those values, and explicitly assert old Writer registrations were released by Undo. Preserve all remaining identity/content/cursor/history/DOM assertions and every unrelated test/source/metadata byte. Pinned SwTableLine destructor and KillEmptyFrameFormat confirm destroying native rows/formats; do not revive disposed owners or add fallback adapters. One targeted upstream-absent run covers changed tests and related native row/table/format lifetime history modules; build/static plus scoped format/lint/typecheck and source-bound coverage certification100/all-four. Production is unchanged, so prior246 entire actual coverage maps may be reused only after exact current source hashes and whole map/proof digest validation; retain full247 raw failures/coverage truth. No network/global/subagents, no upstream/raw source/results/maps/scripts/Python in AP, no full replay. Record bounded evidence and exact parent prefix append, complete repair leaf then pause under user's updated instruction.

## Verify Steps

1. Inspect pinned SwTableLine::~SwTableLine and KillEmptyFrameFormat and actual RemoveTableRow/SwClient.Dispose; record identifier/hash anchors only. Capture baseline hashes for unchanged production/metadata and all666 acceptance files.
2. Migrate only three implicated acceptance files: snapshot complete independent row/cell values and paragraph style before Undo; retain Redo identity/attributes/content/cursor/DOM/history assertions and assert removed row/box GetRegisteredIn becomes undefined. No test removals/skips/only or production edits.
3. Once upstream physically absent, run scoped Prettier/ESLint, app/tools typecheck, build/static, and targeted app tests with V8 coverage reportOnFailure/json reporters for the changed3files plus related native format/history/table modules. Restore upstream in finally. Resolve actual failures within approved remediation scope; do not replay the complete full suite.
4. Require all selected cases pass and source-bound app/inventory100 lines/statements/functions/branches. Unchanged production can retain entire prior246 actual certificate only after source-by-source bytes and raw map/proof digests match; never normalize counters or hide247 failures. Save raw evidence/scripts/maps/snapshots only ignored app cache. Record exact case counts and source preservation.
5. ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check; source-size/AP artifact census and exact parent prefix append pass. Record verified repair with actual test-fix commit; retain247 historical failed profile/rework evidence. Stop and pause goal after successful remediation, without new implementation tasks.

## Verification

Pending targeted remediation validation and exact-source coverage certification. Historical full247 failures remain recorded unchanged.

## Rollback Plan

Revert only the three scoped acceptance migrations if invalid. Restore upstream in finally. Preserve historical full247 results and current changes; no destructive history operations.

## Findings

Four failures read SwTableLine.GetFormat on a row destroyed by Undo. Pin9bc445578031fecf56086729d8e4940c77e14d65 SwTableLine destructor removes last Writer client and deletes format; local RemoveTableRow destroys row/boxes. Tests must capture expected values before deletion. New user instruction explicitly authorizes repairing these failures before pausing; previous prohibition on repair after full247 is superseded.
