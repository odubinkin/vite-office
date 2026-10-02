---
id: "202610020438-HRK7Q8"
title: "Match comparator-equivalent child removal and callback ownership"
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
  updated_at: "2026-10-02T04:39:20.900Z"
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
    body: "Start: Correct comparator-equivalent stored-child removal with supplied-argument callback; validate actual document ownership, topology and notifications without upstream access in tests or source artifacts."
events:
  -
    type: "status"
    at: "2026-10-02T04:39:21.547Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Correct comparator-equivalent stored-child removal with supplied-argument callback; validate actual document ownership, topology and notifications without upstream access in tests or source artifacts."
doc_version: 3
doc_updated_at: "2026-10-02T04:39:21.547Z"
doc_updated_by: "CODER"
description: "Iteration 50: match pinned SwNumberTree RemoveChild selection, stored-node detachment/descendant transfer and supplied-argument PostRemove semantics. Keep existing document registry equivalence unchanged; cover actual document rule/registry ownership and retained topology with tests that never access upstream. No comparison helper sources in Agentplane artifacts; preserve deliberate deviations and avoid broad parity promotion."
sections:
  Summary: "Iteration 50 corrects comparator-equivalent RemoveChild selection and distinguishes the stored node from the supplied callback argument."
  Scope: "Four semantic paths: apps/office/src/sw/source/core/SwNumberTree/SwNumberTree.ts; new SwNumberTree-removal.test.ts in the same directory; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Active leaf and parent findings/verification bookkeeping only. Preserve registered IO/recovery deviations, existing expectations and gates; no module/status promotion."
  Plan: "Iteration50: fresh source/hash audit; RED/GREEN actual-document removal tests; GetIterator-based stored-child removal with supplied-argument PostRemove; four semantic files only, additive bounded provenance evidence; independent focused and unchanged full verification, same-actor quality, separate implementation commit and leaf close. No helper sources in Agentplane artifacts or upstream access in tests; parent/full goal stays open."
  Verify Steps: |-
    1. Pin equals 9bc445578031fecf56086729d8e4940c77e14d65. Fresh native file and selected symbol hashes plus manual control-flow conclusions cover sorted equivalence, stored-node detachment/transfer, predecessor/phantom prefix handling, and supplied PostRemove on found or missing real arguments. Existing document registry equivalence needs no implementation change. Evidence is source inspection, not a claim of new compiled native execution or full owner/lifetime parity.
    2. Planned RED and GREEN project tests prove first/middle/last equivalent arguments remove the stored node, preserve argument ownership/subtree, transfer descendants and invoke the correct callback, preserving rule client and numbered-registry effects. Include exact identity control, distinct-key miss and phantom no-op plus normal/reading notification behavior. Every prior test expectation remains unchanged.
    3. Focused tree suite passes while upstream path is temporarily unavailable and restored in finally; unchanged npm run verify passes all gates including both100% coverage. Routing and doctor have no new errors, source artifacts remain absent and diff is limited to the four semantic paths and task bookkeeping.
    4. Canonical verification and distinct same-actor EVALUATOR quality phase reference the actual implementation commit. Close leaf DONE with clean tracked/untracked state; parent/full goal remains open, no blanket parity promotion.
  Verification: "Pending execution."
  Rollback Plan: "Revert the implementation commit if required, retaining task result/hash evidence and preserving source-artifact prohibitions."
  Findings: "Current native RemoveChild selects pRemove through GetIterator and mutates that stored object; local RemoveChild currently uses children.indexOf(child). Native PostRemove belongs to supplied pChild after selection/notification, including a miss. Existing DocumentListItemsManager.removeListItem already uses comparator equivalence. Fresh inspection also preserves known native access/lifetime and wider lookup consumer obligations outside this leaf."
id_source: "generated"
---
## Summary

Iteration 50 corrects comparator-equivalent RemoveChild selection and distinguishes the stored node from the supplied callback argument.

## Scope

Four semantic paths: apps/office/src/sw/source/core/SwNumberTree/SwNumberTree.ts; new SwNumberTree-removal.test.ts in the same directory; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Active leaf and parent findings/verification bookkeeping only. Preserve registered IO/recovery deviations, existing expectations and gates; no module/status promotion.

## Plan

Iteration50: fresh source/hash audit; RED/GREEN actual-document removal tests; GetIterator-based stored-child removal with supplied-argument PostRemove; four semantic files only, additive bounded provenance evidence; independent focused and unchanged full verification, same-actor quality, separate implementation commit and leaf close. No helper sources in Agentplane artifacts or upstream access in tests; parent/full goal stays open.

## Verify Steps

1. Pin equals 9bc445578031fecf56086729d8e4940c77e14d65. Fresh native file and selected symbol hashes plus manual control-flow conclusions cover sorted equivalence, stored-node detachment/transfer, predecessor/phantom prefix handling, and supplied PostRemove on found or missing real arguments. Existing document registry equivalence needs no implementation change. Evidence is source inspection, not a claim of new compiled native execution or full owner/lifetime parity.
2. Planned RED and GREEN project tests prove first/middle/last equivalent arguments remove the stored node, preserve argument ownership/subtree, transfer descendants and invoke the correct callback, preserving rule client and numbered-registry effects. Include exact identity control, distinct-key miss and phantom no-op plus normal/reading notification behavior. Every prior test expectation remains unchanged.
3. Focused tree suite passes while upstream path is temporarily unavailable and restored in finally; unchanged npm run verify passes all gates including both100% coverage. Routing and doctor have no new errors, source artifacts remain absent and diff is limited to the four semantic paths and task bookkeeping.
4. Canonical verification and distinct same-actor EVALUATOR quality phase reference the actual implementation commit. Close leaf DONE with clean tracked/untracked state; parent/full goal remains open, no blanket parity promotion.

## Verification

Pending execution.

## Rollback Plan

Revert the implementation commit if required, retaining task result/hash evidence and preserving source-artifact prohibitions.

## Findings

Current native RemoveChild selects pRemove through GetIterator and mutates that stored object; local RemoveChild currently uses children.indexOf(child). Native PostRemove belongs to supplied pChild after selection/notification, including a miss. Existing DocumentListItemsManager.removeListItem already uses comparator equivalence. Fresh inspection also preserves known native access/lifetime and wider lookup consumer obligations outside this leaf.
