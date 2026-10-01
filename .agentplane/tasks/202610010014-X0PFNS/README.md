---
id: "202610010014-X0PFNS"
title: "Restore native hierarchical list counter calculation"
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
  updated_at: "2026-10-01T00:15:08.583Z"
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
    body: "Start: restore native hierarchical first/sibling counter calculation and source ownership in the current direct checkout under the persistent approved goal."
events:
  -
    type: "status"
    at: "2026-10-01T00:15:17.665Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore native hierarchical first/sibling counter calculation and source ownership in the current direct checkout under the persistent approved goal."
doc_version: 3
doc_updated_at: "2026-10-01T00:15:17.665Z"
doc_updated_by: "CODER"
description: "Iteration 28 of persistent upstream parity goal: remove zero-as-uninitialized counter emulation, restore source-owned first/sibling hierarchical calculation and node count/restart/start contracts for existing list trees; preserve registered save/open/recovery deviations."
sections:
  Summary: "Restore native hierarchical numbering after zero starts/restarts and remove list-owned counter emulation. Iteration 28 under parent 202609240501-C9TN6M; safe local work remains authorized by the persistent goal."
  Scope: "sw/source/core/SwNumberTree/SwNumberTree.ts (new), SwNodeNum.ts, doc/list.ts and focused list/tree tests; genuine ODT counter fixtures; runtime inventory and source provenance; bounded native probes and task evidence. Existing Arabic/bullet hierarchical lists only. Preserve current save/open/recovery, ODF version and Worker v16. No network/outside access, schema/gate/threshold changes or whole-module promotion. Full phantom construction, continuous numbering, redline variants, lazy validity/notifications and broader native lifecycle remain separate unresolved obligations."
  Plan: "Refactor existing hierarchical counter calculation into source-owned SwNumberTreeNode, with SwNodeNum providing counted/restart/start state and SwList retaining list registration, bounded document-order tree construction and invalidation. Use structural first-child and sibling position, not a numeric sentinel: initialize from native start, decrement only an uncounted first child without counted descendants, ignore restart on later uncounted items, increment counted siblings even after zero, and preserve native previous-subtree continuation below uncounted parents. Retain signed native counters and root-to-item vectors. Introduce native-style root records and preserve explicitly bounded missing-level grouping until phantom construction is audited separately; do not claim full phantom/tree lifecycle parity. Compare complete legal no-phantom hierarchies to unmodified extracted pinned ValidateHierarchical and node-state bodies with bounded shims. Add source-derived core and genuine common/automatic ODT state/label/clone/Worker/export/reopen checks, then unchanged full mandatory gates, quality review and scoped local commits."
  Verify Steps: "Compare first/sibling counters and continuation flags on complete existing no-phantom hierarchies against compiled unmodified pinned SwNumberTreeNode::ValidateHierarchical and SwNodeNum counted/restart/start excerpts. Assert ordinary and zero starts, zero restart then increment, repeated zero restarts, uncounted first/after-zero/later items, ignored restart on uncounted later siblings, counted descendants, nested starts/resets and previous-subtree continuation below uncounted parents. Core assertions must verify numbers, vectors, structural ownership, labels and invalidation/reparenting/removal. Genuine common and automatic ODT fixtures must assert literal zero-start/restart counter sequences, node labels, cloned document/rule, Worker v16, selected XML and reopen. Preserve existing missing-level behavior as explicitly unverified until phantom construction audit. Run npm run verify unchanged with both 100% coverage suites and all browser/source/provenance/ODT gates, ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check. Record actual implementation hash and clean tracked state."
  Verification: "Pending implementation and declared checks; no skipped mandatory checks."
  Rollback Plan: "Revert only the scoped implementation commit using a new executable task if needed; retain immutable completed-task evidence and the active full parity goal."
  Findings: "Previous goal turn is progress: iteration27 202609302342-JM15NR DONE, implementation c8d63aa66bdeba160dbcf355c0ec2ed059f66259, parent progress 020f47d9df69; main/direct is clean and only parent is active at preflight. Native pin libreoffice-26.8.0.2 /9bc445578031fecf56086729d8e4940c77e14d65. Local SwList tests counters[level]===0 as uninitialized and repeats zero for consecutive counted items. Primary SwNumberTreeNode::ValidateHierarchical initializes first structurally and increments counted siblings independent of numeric value; native SwNodeNum supplies IsCounted/IsRestart/GetStartValue. Native first uncounted with counted descendants does not decrement; uncounted later restart does not advance/reset; child continuation below uncounted parents has source-defined prior-subtree search. This leaf restores these existing hierarchical contracts and source ownership; full phantoms, continuous/redline/lazy notification/lifecycle remain unverified."
id_source: "generated"
---
## Summary

Restore native hierarchical numbering after zero starts/restarts and remove list-owned counter emulation. Iteration 28 under parent 202609240501-C9TN6M; safe local work remains authorized by the persistent goal.

## Scope

sw/source/core/SwNumberTree/SwNumberTree.ts (new), SwNodeNum.ts, doc/list.ts and focused list/tree tests; genuine ODT counter fixtures; runtime inventory and source provenance; bounded native probes and task evidence. Existing Arabic/bullet hierarchical lists only. Preserve current save/open/recovery, ODF version and Worker v16. No network/outside access, schema/gate/threshold changes or whole-module promotion. Full phantom construction, continuous numbering, redline variants, lazy validity/notifications and broader native lifecycle remain separate unresolved obligations.

## Plan

Refactor existing hierarchical counter calculation into source-owned SwNumberTreeNode, with SwNodeNum providing counted/restart/start state and SwList retaining list registration, bounded document-order tree construction and invalidation. Use structural first-child and sibling position, not a numeric sentinel: initialize from native start, decrement only an uncounted first child without counted descendants, ignore restart on later uncounted items, increment counted siblings even after zero, and preserve native previous-subtree continuation below uncounted parents. Retain signed native counters and root-to-item vectors. Introduce native-style root records and preserve explicitly bounded missing-level grouping until phantom construction is audited separately; do not claim full phantom/tree lifecycle parity. Compare complete legal no-phantom hierarchies to unmodified extracted pinned ValidateHierarchical and node-state bodies with bounded shims. Add source-derived core and genuine common/automatic ODT state/label/clone/Worker/export/reopen checks, then unchanged full mandatory gates, quality review and scoped local commits.

## Verify Steps

Compare first/sibling counters and continuation flags on complete existing no-phantom hierarchies against compiled unmodified pinned SwNumberTreeNode::ValidateHierarchical and SwNodeNum counted/restart/start excerpts. Assert ordinary and zero starts, zero restart then increment, repeated zero restarts, uncounted first/after-zero/later items, ignored restart on uncounted later siblings, counted descendants, nested starts/resets and previous-subtree continuation below uncounted parents. Core assertions must verify numbers, vectors, structural ownership, labels and invalidation/reparenting/removal. Genuine common and automatic ODT fixtures must assert literal zero-start/restart counter sequences, node labels, cloned document/rule, Worker v16, selected XML and reopen. Preserve existing missing-level behavior as explicitly unverified until phantom construction audit. Run npm run verify unchanged with both 100% coverage suites and all browser/source/provenance/ODT gates, ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check. Record actual implementation hash and clean tracked state.

## Verification

Pending implementation and declared checks; no skipped mandatory checks.

## Rollback Plan

Revert only the scoped implementation commit using a new executable task if needed; retain immutable completed-task evidence and the active full parity goal.

## Findings

Previous goal turn is progress: iteration27 202609302342-JM15NR DONE, implementation c8d63aa66bdeba160dbcf355c0ec2ed059f66259, parent progress 020f47d9df69; main/direct is clean and only parent is active at preflight. Native pin libreoffice-26.8.0.2 /9bc445578031fecf56086729d8e4940c77e14d65. Local SwList tests counters[level]===0 as uninitialized and repeats zero for consecutive counted items. Primary SwNumberTreeNode::ValidateHierarchical initializes first structurally and increments counted siblings independent of numeric value; native SwNodeNum supplies IsCounted/IsRestart/GetStartValue. Native first uncounted with counted descendants does not decrement; uncounted later restart does not advance/reset; child continuation below uncounted parents has source-defined prior-subtree search. This leaf restores these existing hierarchical contracts and source ownership; full phantoms, continuous/redline/lazy notification/lifecycle remain unverified.
