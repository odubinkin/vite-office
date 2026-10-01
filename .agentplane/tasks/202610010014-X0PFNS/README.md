---
id: "202610010014-X0PFNS"
title: "Restore native hierarchical list counter calculation"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
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
  state: "ok"
  updated_at: "2026-10-01T00:34:38.734Z"
  updated_by: "CODER"
  note: "Final unchanged verify exits 0: 640 application/109 inventory/19 browser checks and both 100% coverage suites. Compiled unmodified native hierarchy/node/vector excerpts match 1048 trees / 5016 states; source-derived zero/restart/uncounted/continuation and genuine common/automatic ODT/copy/Worker/XML/reopen assertions pass. Doctor zero errors with two prior warnings; routing/diff pass. Full phantom/lazy/continuous/redline/lifecycle and uncounted XML transport remain unverified; no full parity claim."
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
  -
    type: "verify"
    at: "2026-10-01T00:34:38.734Z"
    author: "CODER"
    state: "ok"
    note: "Final unchanged verify exits 0: 640 application/109 inventory/19 browser checks and both 100% coverage suites. Compiled unmodified native hierarchy/node/vector excerpts match 1048 trees / 5016 states; source-derived zero/restart/uncounted/continuation and genuine common/automatic ODT/copy/Worker/XML/reopen assertions pass. Doctor zero errors with two prior warnings; routing/diff pass. Full phantom/lazy/continuous/redline/lifecycle and uncounted XML transport remain unverified; no full parity claim."
doc_version: 3
doc_updated_at: "2026-10-01T00:34:38.788Z"
doc_updated_by: "CODER"
description: "Iteration 28 of persistent upstream parity goal: remove zero-as-uninitialized counter emulation, restore source-owned first/sibling hierarchical calculation and node count/restart/start contracts for existing list trees; preserve registered save/open/recovery deviations."
sections:
  Summary: "Restore native hierarchical numbering after zero starts/restarts and remove list-owned counter emulation. Iteration 28 under parent 202609240501-C9TN6M; safe local work remains authorized by the persistent goal."
  Scope: "sw/source/core/SwNumberTree/SwNumberTree.ts (new), SwNodeNum.ts, doc/list.ts and focused list/tree tests; genuine ODT counter fixtures; runtime inventory and source provenance; bounded native probes and task evidence. Existing Arabic/bullet hierarchical lists only. Preserve current save/open/recovery, ODF version and Worker v16. No network/outside access, schema/gate/threshold changes or whole-module promotion. Full phantom construction, continuous numbering, redline variants, lazy validity/notifications and broader native lifecycle remain separate unresolved obligations."
  Plan: "Refactor existing hierarchical counter calculation into source-owned SwNumberTreeNode, with SwNodeNum providing counted/restart/start state and SwList retaining list registration, bounded document-order tree construction and invalidation. Use structural first-child and sibling position, not a numeric sentinel: initialize from native start, decrement only an uncounted first child without counted descendants, ignore restart on later uncounted items, increment counted siblings even after zero, and preserve native previous-subtree continuation below uncounted parents. Retain signed native counters and root-to-item vectors. Introduce native-style root records and preserve explicitly bounded missing-level grouping until phantom construction is audited separately; do not claim full phantom/tree lifecycle parity. Compare complete legal no-phantom hierarchies to unmodified extracted pinned ValidateHierarchical and node-state bodies with bounded shims. Add source-derived core and genuine common/automatic ODT state/label/clone/Worker/export/reopen checks, then unchanged full mandatory gates, quality review and scoped local commits."
  Verify Steps: "Compare first/sibling counters and continuation flags on complete existing no-phantom hierarchies against compiled unmodified pinned SwNumberTreeNode::ValidateHierarchical and SwNodeNum counted/restart/start excerpts. Assert ordinary and zero starts, zero restart then increment, repeated zero restarts, uncounted first/after-zero/later items, ignored restart on uncounted later siblings, counted descendants, nested starts/resets and previous-subtree continuation below uncounted parents. Core assertions must verify numbers, vectors, structural ownership, labels and invalidation/reparenting/removal. Genuine common and automatic ODT fixtures must assert literal zero-start/restart counter sequences, node labels, cloned document/rule, Worker v16, selected XML and reopen. Preserve existing missing-level behavior as explicitly unverified until phantom construction audit. Run npm run verify unchanged with both 100% coverage suites and all browser/source/provenance/ODT gates, ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check. Record actual implementation hash and clean tracked state."
  Verification: |-
    Pending implementation and declared checks; no skipped mandatory checks.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-01T00:34:38.734Z — VERIFY — ok

    By: CODER

    Note: Final unchanged verify exits 0: 640 application/109 inventory/19 browser checks and both 100% coverage suites. Compiled unmodified native hierarchy/node/vector excerpts match 1048 trees / 5016 states; source-derived zero/restart/uncounted/continuation and genuine common/automatic ODT/copy/Worker/XML/reopen assertions pass. Doctor zero errors with two prior warnings; routing/diff pass. Full phantom/lazy/continuous/redline/lifecycle and uncounted XML transport remain unverified; no full parity claim.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-01T00:34:38.287Z, excerpt_hash=sha256:54eb9a55ed7a095dc95f57c5e0d468818799b9f9b8b6389a9418703f73ea73bd

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610010014-X0PFNS/blueprint/resolved-snapshot.json
    - old_digest: 50b3b661567b1012825f5b656cf628e6da5c1e71950b94c69b7b78a719e9af19
    - current_digest: 50b3b661567b1012825f5b656cf628e6da5c1e71950b94c69b7b78a719e9af19
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610010014-X0PFNS

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610010014-X0PFNS
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the scoped implementation commit using a new executable task if needed; retain immutable completed-task evidence and the active full parity goal."
  Findings: |-
    Previous goal turn is progress: iteration27 202609302342-JM15NR DONE, implementation c8d63aa66bdeba160dbcf355c0ec2ed059f66259, parent progress 020f47d9df69; main/direct is clean and only parent is active at preflight. Native pin libreoffice-26.8.0.2 /9bc445578031fecf56086729d8e4940c77e14d65. Local SwList tests counters[level]===0 as uninitialized and repeats zero for consecutive counted items. Primary SwNumberTreeNode::ValidateHierarchical initializes first structurally and increments counted siblings independent of numeric value; native SwNodeNum supplies IsCounted/IsRestart/GetStartValue. Native first uncounted with counted descendants does not decrement; uncounted later restart does not advance/reset; child continuation below uncounted parents has source-defined prior-subtree search. This leaf restores these existing hierarchical contracts and source ownership; full phantoms, continuous/redline/lazy notification/lifecycle remain unverified.

    - Observation: Compiled unmodified pinned hierarchy/node-policy/vector bodies match all 1048 complete no-phantom cases / 5016 counter, continuation and vector states. Five focused assertions (four core tests plus genuine-package loop) pass. First full verify exits 1 at lint on two test non-null assertions and a this-alias in vector traversal.
      Impact: Source style violates unchanged lint; no semantic counter mismatch is observed. Native header inspection also confirms descendant numbering policy is a SwNodeNum override, and parent-first vector recursion belongs to the base tree.
      Resolution: Use typed fixture casts, native parent-first recursion and Writer-owned descendant/numbering-present overrides; rerun native comparison and unchanged full gates. Preserve explicit eager/no-phantom/missing-level limits and all registered divergences.

    - Observation: Final unchanged npm run verify exits 0 (session 39633): 640 application tests / 137 files, 109 inventory tests / 36 files, 19 browser tests. Application coverage 100% statements 9874, branches 7423, functions 2720, lines 9083; inventory coverage 100% 1523/1080/384/1464. Source provenance checks 200 modules; 34 invariants valid; semanticViolationCount 0. Native comparison rerun after final ownership/recursion change matches all 1048 complete no-phantom trees / 5016 counter/continuation/vector states. Doctor has zero errors and the same two prior warnings; routing and diff pass.
      Impact: Approved hierarchical counter/refactor criteria pass, including source-owned root and counted/restart/start policy, zero siblings, uncounted descendants/parent continuation and genuine ODT/copy/Worker/XML/reopen checks. No mandatory check is skipped. Existing SwNodeNum blanket parity metadata is downgraded to unverified because constructor/lifecycle/phantom/lazy/redline/continuous obligations are not established by bounded evidence.
      Resolution: Close this leaf with the real code hash and keep parent/full goal active. Next separate audit is native phantom construction for existing skipped levels: with starts [7,5,3] and a first level-2 item, current vector [0,0,3] and label 0.0.3. retain the old missing-level bridge. Pinned AddChild/CreatePhantom, mbCountPhantoms=true, IsCounted and ValidateHierarchical imply ancestor counters must be constructed from native rule levels; confirm with an extracted phantom-enabled oracle before changing this in a new task. A separate read-only uncounted-item export audit rejects WhichId 87 and importer rejects list-header; these transport gaps remain open, not silently lossy or resolved. Registered save/open/recovery deviations remain unchanged.
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

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-01T00:34:38.734Z — VERIFY — ok

By: CODER

Note: Final unchanged verify exits 0: 640 application/109 inventory/19 browser checks and both 100% coverage suites. Compiled unmodified native hierarchy/node/vector excerpts match 1048 trees / 5016 states; source-derived zero/restart/uncounted/continuation and genuine common/automatic ODT/copy/Worker/XML/reopen assertions pass. Doctor zero errors with two prior warnings; routing/diff pass. Full phantom/lazy/continuous/redline/lifecycle and uncounted XML transport remain unverified; no full parity claim.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-01T00:34:38.287Z, excerpt_hash=sha256:54eb9a55ed7a095dc95f57c5e0d468818799b9f9b8b6389a9418703f73ea73bd

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610010014-X0PFNS/blueprint/resolved-snapshot.json
- old_digest: 50b3b661567b1012825f5b656cf628e6da5c1e71950b94c69b7b78a719e9af19
- current_digest: 50b3b661567b1012825f5b656cf628e6da5c1e71950b94c69b7b78a719e9af19
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610010014-X0PFNS

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610010014-X0PFNS
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the scoped implementation commit using a new executable task if needed; retain immutable completed-task evidence and the active full parity goal.

## Findings

Previous goal turn is progress: iteration27 202609302342-JM15NR DONE, implementation c8d63aa66bdeba160dbcf355c0ec2ed059f66259, parent progress 020f47d9df69; main/direct is clean and only parent is active at preflight. Native pin libreoffice-26.8.0.2 /9bc445578031fecf56086729d8e4940c77e14d65. Local SwList tests counters[level]===0 as uninitialized and repeats zero for consecutive counted items. Primary SwNumberTreeNode::ValidateHierarchical initializes first structurally and increments counted siblings independent of numeric value; native SwNodeNum supplies IsCounted/IsRestart/GetStartValue. Native first uncounted with counted descendants does not decrement; uncounted later restart does not advance/reset; child continuation below uncounted parents has source-defined prior-subtree search. This leaf restores these existing hierarchical contracts and source ownership; full phantoms, continuous/redline/lazy notification/lifecycle remain unverified.

- Observation: Compiled unmodified pinned hierarchy/node-policy/vector bodies match all 1048 complete no-phantom cases / 5016 counter, continuation and vector states. Five focused assertions (four core tests plus genuine-package loop) pass. First full verify exits 1 at lint on two test non-null assertions and a this-alias in vector traversal.
  Impact: Source style violates unchanged lint; no semantic counter mismatch is observed. Native header inspection also confirms descendant numbering policy is a SwNodeNum override, and parent-first vector recursion belongs to the base tree.
  Resolution: Use typed fixture casts, native parent-first recursion and Writer-owned descendant/numbering-present overrides; rerun native comparison and unchanged full gates. Preserve explicit eager/no-phantom/missing-level limits and all registered divergences.

- Observation: Final unchanged npm run verify exits 0 (session 39633): 640 application tests / 137 files, 109 inventory tests / 36 files, 19 browser tests. Application coverage 100% statements 9874, branches 7423, functions 2720, lines 9083; inventory coverage 100% 1523/1080/384/1464. Source provenance checks 200 modules; 34 invariants valid; semanticViolationCount 0. Native comparison rerun after final ownership/recursion change matches all 1048 complete no-phantom trees / 5016 counter/continuation/vector states. Doctor has zero errors and the same two prior warnings; routing and diff pass.
  Impact: Approved hierarchical counter/refactor criteria pass, including source-owned root and counted/restart/start policy, zero siblings, uncounted descendants/parent continuation and genuine ODT/copy/Worker/XML/reopen checks. No mandatory check is skipped. Existing SwNodeNum blanket parity metadata is downgraded to unverified because constructor/lifecycle/phantom/lazy/redline/continuous obligations are not established by bounded evidence.
  Resolution: Close this leaf with the real code hash and keep parent/full goal active. Next separate audit is native phantom construction for existing skipped levels: with starts [7,5,3] and a first level-2 item, current vector [0,0,3] and label 0.0.3. retain the old missing-level bridge. Pinned AddChild/CreatePhantom, mbCountPhantoms=true, IsCounted and ValidateHierarchical imply ancestor counters must be constructed from native rule levels; confirm with an extracted phantom-enabled oracle before changing this in a new task. A separate read-only uncounted-item export audit rejects WhichId 87 and importer rejects list-header; these transport gaps remain open, not silently lossy or resolved. Registered save/open/recovery deviations remain unchanged.
