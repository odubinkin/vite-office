---
id: "202610101723-QH6XM1"
title: "Restore native MoveLeftMargin range and attribute history"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-10T17:24:42.990Z"
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
    body: "Start: Restore approved native MoveLeftMargin range and attribute history with owned source-shaped rollback, current-source validation and preserved inventory/deviations."
events:
  -
    type: "status"
    at: "2026-10-10T17:24:49.814Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore approved native MoveLeftMargin range and attribute history with owned source-shaped rollback, current-source validation and preserved inventory/deviations."
doc_version: 3
doc_updated_at: "2026-10-10T17:24:49.814Z"
doc_updated_by: "CODER"
description: "Replace per-node scalar margin action/group with original SwDoc range mutation and SwUndoMoveLeftMargin retained SwHistory; native attr-set deltas feed SwRegHistory, preserving direct/inherited typed left/first state and recomputing redo from document tabs. One correction2/10 after BZ14P4."
sections:
  Summary: "Restore native MoveLeftMargin range mutation and owned attribute history for existing body/cell paragraphs. Source fidelity includes typed first/left values, direct/inherited restoration, independent list indentation applicability and redo using current tabs."
  Scope: |-
    Eight production modules: apps/office/src/sw/source/core/bastyp/index.ts, apps/office/src/sw/source/core/docnode/node.ts, apps/office/src/sw/source/core/doc/doc.ts, apps/office/src/sw/source/core/doc/docfmt.ts, apps/office/src/sw/source/core/edit/edattr.ts, apps/office/src/sw/source/core/undo/rolbck.ts, apps/office/src/sw/source/core/undo/unattr.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts. Sixteen corresponding canonical runtime/provenance records, parent audit Findings, optional source-backed suspected-issue note; exact native constructor/initial-operation fixture migrations in native-format-node-index.test.ts and undobj.test.ts; up to three fresh acceptance files for history/deltas/range/list/current-index behavior. Preserve all old cases/inputs/expected values except explicit native history payload semantics.

    No new core/browser serialization adapter or arbitrary native flattening. BroadcastingModify identity is supplied through the current TypeScript linear base of node/content-index registry; the C++ three independent bases are not claimed fully identical and their future physical hierarchy refactor remains explicit. No native style registration, frame/vertical/redline merged-layout or complete rich numbering-unit/transport/pooling/hash/general UNO/Repeat infrastructure parity claim. Existing numbering-format profile stores TWIP first-line indentation only; preserve its represented list unit rather than invent an unsupported format state. Existing edit-shell admission guard remains a separate correction. Registered recovery/open/save/settings UI deviations preserved.
  Plan: "Restore original range-based MoveLeftMargin with typed first/left attributes, native attr-set broadcasting and SwRegHistory direct/reset history; redo recomputes current tabs. Approved eight production modules, sixteen canonical records, two exact old fixture migrations, three fresh files. Current JS linear broadcaster base/profile limitations remain explicit. Related/upstream-absent100%actual whole modules and static/browser/restored metadata evidence, preserve history/deviations, exact semantic review and closure2/10; goal active."
  Verify Steps: |-
    1. Source-only pinned contracts and hashes with no upstream source/helper copies in AgentPlane. Native history direct/reset discriminants, independent owned measures and percentages, source record order and temporary rollback lifetime; unchanged node/style/cursor/indices.
    2. Actual initialized ranges and body/cells: default/empty/custom tabs, modulus/signs, direct/inherited margins, independent list-left/first flags and modes, one range history action, zero/full initial history payload, undo through replacement slots and repeated cycles, redo recomputation from current document defaults without new undo recording. Unsupported source profiles explicitly remain unverified.
    3. Changed format/lint; whole TS7/type/dependencies/file-size/JSDoc/build/static; then Vitest related actual whole eight modules100% lines/statements/functions/branches with complete current source/maps and nonnegative counters plus fresh tests, and related Chromium. Both references absent throughout runtime/static, restore in finally; no with/without double run and no passing replay for helper/metadata repair.
    4. Restored registry-build/source-tree/provenance/registry/resource-generation/invariants/parity/doctor/routing. Historical status/default/classification/evidence prefixes and old test case/input/expectation contracts preserved modulo declared source representation/initial-operation/payload changes. No source/classification promotion to hide gaps.
    5. Exact semantic commit binds current-source hashes; explicit same-agent non-independent evaluator, verification and finish via CLI; clean branch writer and references restored. No full run due this second correction since BZ14P4.
  Verification: "Pending current-source implementation and required checks. No earlier accepted runtime maps are reused."
  Rollback Plan: "Revert only semantic task commits, retain historical evidence and redo scoped checks if rollback is requested. No unrelated checkout/merge/installation changes."
  Findings: "Preflight clean writer, direct mode, standing user goal/resume authorization. Previous7RCNDA turn made verified authoritative progress. SwContentNode currently exposes only generic browser model delta, making native SwRegHistory impossible without native attr-set broadcast. Direct content/history identities are the correction target; independent C++ base hierarchy/native full style registration and full Repeat manager infrastructure remain unverified. No network/subagents; ignored helpers/maps/logs only node_modules cache."
id_source: "generated"
---
## Summary

Restore native MoveLeftMargin range mutation and owned attribute history for existing body/cell paragraphs. Source fidelity includes typed first/left values, direct/inherited restoration, independent list indentation applicability and redo using current tabs.

## Scope

Eight production modules: apps/office/src/sw/source/core/bastyp/index.ts, apps/office/src/sw/source/core/docnode/node.ts, apps/office/src/sw/source/core/doc/doc.ts, apps/office/src/sw/source/core/doc/docfmt.ts, apps/office/src/sw/source/core/edit/edattr.ts, apps/office/src/sw/source/core/undo/rolbck.ts, apps/office/src/sw/source/core/undo/unattr.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts. Sixteen corresponding canonical runtime/provenance records, parent audit Findings, optional source-backed suspected-issue note; exact native constructor/initial-operation fixture migrations in native-format-node-index.test.ts and undobj.test.ts; up to three fresh acceptance files for history/deltas/range/list/current-index behavior. Preserve all old cases/inputs/expected values except explicit native history payload semantics.

No new core/browser serialization adapter or arbitrary native flattening. BroadcastingModify identity is supplied through the current TypeScript linear base of node/content-index registry; the C++ three independent bases are not claimed fully identical and their future physical hierarchy refactor remains explicit. No native style registration, frame/vertical/redline merged-layout or complete rich numbering-unit/transport/pooling/hash/general UNO/Repeat infrastructure parity claim. Existing numbering-format profile stores TWIP first-line indentation only; preserve its represented list unit rather than invent an unsupported format state. Existing edit-shell admission guard remains a separate correction. Registered recovery/open/save/settings UI deviations preserved.

## Plan

Restore original range-based MoveLeftMargin with typed first/left attributes, native attr-set broadcasting and SwRegHistory direct/reset history; redo recomputes current tabs. Approved eight production modules, sixteen canonical records, two exact old fixture migrations, three fresh files. Current JS linear broadcaster base/profile limitations remain explicit. Related/upstream-absent100%actual whole modules and static/browser/restored metadata evidence, preserve history/deviations, exact semantic review and closure2/10; goal active.

## Verify Steps

1. Source-only pinned contracts and hashes with no upstream source/helper copies in AgentPlane. Native history direct/reset discriminants, independent owned measures and percentages, source record order and temporary rollback lifetime; unchanged node/style/cursor/indices.
2. Actual initialized ranges and body/cells: default/empty/custom tabs, modulus/signs, direct/inherited margins, independent list-left/first flags and modes, one range history action, zero/full initial history payload, undo through replacement slots and repeated cycles, redo recomputation from current document defaults without new undo recording. Unsupported source profiles explicitly remain unverified.
3. Changed format/lint; whole TS7/type/dependencies/file-size/JSDoc/build/static; then Vitest related actual whole eight modules100% lines/statements/functions/branches with complete current source/maps and nonnegative counters plus fresh tests, and related Chromium. Both references absent throughout runtime/static, restore in finally; no with/without double run and no passing replay for helper/metadata repair.
4. Restored registry-build/source-tree/provenance/registry/resource-generation/invariants/parity/doctor/routing. Historical status/default/classification/evidence prefixes and old test case/input/expectation contracts preserved modulo declared source representation/initial-operation/payload changes. No source/classification promotion to hide gaps.
5. Exact semantic commit binds current-source hashes; explicit same-agent non-independent evaluator, verification and finish via CLI; clean branch writer and references restored. No full run due this second correction since BZ14P4.

## Verification

Pending current-source implementation and required checks. No earlier accepted runtime maps are reused.

## Rollback Plan

Revert only semantic task commits, retain historical evidence and redo scoped checks if rollback is requested. No unrelated checkout/merge/installation changes.

## Findings

Preflight clean writer, direct mode, standing user goal/resume authorization. Previous7RCNDA turn made verified authoritative progress. SwContentNode currently exposes only generic browser model delta, making native SwRegHistory impossible without native attr-set broadcast. Direct content/history identities are the correction target; independent C++ base hierarchy/native full style registration and full Repeat manager infrastructure remain unverified. No network/subagents; ignored helpers/maps/logs only node_modules cache.
