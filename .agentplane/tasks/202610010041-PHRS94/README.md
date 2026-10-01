---
id: "202610010041-PHRS94"
title: "Restore native phantom ancestors for skipped list levels"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-01T00:42:13.476Z"
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
    body: "Start: restore source-owned phantom ancestors and counting under the persistent approved upstream goal."
events:
  -
    type: "status"
    at: "2026-10-01T00:42:14.123Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore source-owned phantom ancestors and counting under the persistent approved upstream goal."
doc_version: 3
doc_updated_at: "2026-10-01T00:47:56.765Z"
doc_updated_by: "CODER"
description: "Iteration29 of persistent upstream goal: replace bounded missing-level groups with source-owned phantom construction and native hierarchical phantom counting for existing Arabic/bullet lists. Preserve registered save/open/recovery deviations."
sections:
  Summary: "Restore native phantom ancestors and hierarchical phantom counting for skipped levels in the existing Arabic/bullet Writer list tree. This is iteration29 under the persistent approved upstream goal."
  Scope: "SwNumberTree.ts, SwNodeNum.ts, doc/list.ts and focused tree/list tests; genuine ODT phantom counter roundtrips; runtime inventory/source provenance and task-local native probes. Preserve registered save/open/recovery differences, ODF version, Worker v16 and mandatory gates. Existing rule policy remains hierarchical and count-phantoms=true; adding persisted configurable rule flags, continuous/redline numbering, complete lazy validity/notifications and direct incremental removal are separate obligations."
  Plan: "Move skipped-level construction into SwNumberTreeNode AddChild/CreatePhantom and remove SwList missing-level roots/zero vectors. Derive levels and number vectors from parent links; preserve native phantom counted-parent, first-node decrement and subtree continuation conditions, with SwNodeNum supplying rule/start/count policy and phantom factory. Compare to compiled unmodified pinned AddChild/CreatePhantom/cleanup/counting/vector excerpts with explicit document-order, eager and notification shims. Verify source-derived deep/uneven/uncounted/restart/zero shapes and rebuild after removal/reorder; genuine common/automatic ODT state/labels/copy/Worker/XML/reopen. Finish only after unchanged full verification, quality review and intentional scoped local commits."
  Verify Steps: "Compile unmodified pinned phantom AddChild/CreatePhantom/cleanup/hierarchical validation, counted-parent and Writer node-policy/vector bodies; compare canonical SwList numbers, vectors, continuation, phantom topology over bounded skipped/deep/uneven hierarchies with zero/custom starts, counted/uncounted/restarts. Assert first level2 starts [7,5,3] yields [7,5,3] and 7.5.3.; phantom with only uncounted leaves, counted descendants and counted-parent barriers; level9; removal/reinsertion and ordering rebuild. Genuine common and automatic ODT fixtures must assert literal counters/vectors/labels, owned rule/item-set copying, Worker v16, selected standard XML and reopen. Run npm run verify unchanged, both 100% coverage suites and all browser/source/provenance/ODT gates; ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check. Record actual code hash and clean final tracked state."
  Verification: "Pending implementation and declared checks; no mandatory check is skipped."
  Rollback Plan: "Revert the scoped implementation commit through a new executable task if necessary; keep DONE evidence immutable and the parent goal active."
  Findings: |-
    Preflight: clean main/direct; only parent 202609240501-C9TN6M DOING. Previous turn is progress: iteration28 X0PFNS DONE, real implementation 203555bcef7d193f0ff1ec7869d4c4f021d2a994, full verify exit0. Pin libreoffice-26.8.0.2 /9bc445578031fecf56086729d8e4940c77e14d65. Current missing-level groups produce [0,0,3] for initial level2 with starts [7,5,3]. Native AddChild/CreatePhantom, true default phantom policy and validation define source-owned ancestors, not zero-filled projection. Compiled phantom-enabled evidence is required before asserting corrected behavior. No network/outside access or delegation. Full parity remains incomplete; uncounted ODT list-header transport is a separate known gap.

    - Observation: Focused test command referenced absent apps/office/vitest.config.ts and exited1 before running tests.
      Impact: No semantic result; installed app uses its actual Vite configuration.
      Resolution: Locate repository test configuration and rerun focused checks without changing gates.

    - Observation: Focused source tree checks: 13 pass; unattached-policy fixture reuses a root after resetting only its child, leaving the old phantom container populated.
      Impact: AddChild correctly rejects duplicate-equivalent insertion; the fixture must discard both old links for the eager rebuild contract.
      Resolution: Reset the fixture root before reinsertion, preserving native orphan/equivalence contracts; rerun checks.

    - Observation: ODT focused check reaches correct [7,5,3] labels/copy/Worker/export, then fails an assertion that assumed adjacent XML attribute order.
      Impact: Selected declaration contains the expected values with num-suffix between attributes; semantic transport is not failing.
      Resolution: Assert each value inside the selected level declaration independently and rerun genuine package roundtrips.
id_source: "generated"
---
## Summary

Restore native phantom ancestors and hierarchical phantom counting for skipped levels in the existing Arabic/bullet Writer list tree. This is iteration29 under the persistent approved upstream goal.

## Scope

SwNumberTree.ts, SwNodeNum.ts, doc/list.ts and focused tree/list tests; genuine ODT phantom counter roundtrips; runtime inventory/source provenance and task-local native probes. Preserve registered save/open/recovery differences, ODF version, Worker v16 and mandatory gates. Existing rule policy remains hierarchical and count-phantoms=true; adding persisted configurable rule flags, continuous/redline numbering, complete lazy validity/notifications and direct incremental removal are separate obligations.

## Plan

Move skipped-level construction into SwNumberTreeNode AddChild/CreatePhantom and remove SwList missing-level roots/zero vectors. Derive levels and number vectors from parent links; preserve native phantom counted-parent, first-node decrement and subtree continuation conditions, with SwNodeNum supplying rule/start/count policy and phantom factory. Compare to compiled unmodified pinned AddChild/CreatePhantom/cleanup/counting/vector excerpts with explicit document-order, eager and notification shims. Verify source-derived deep/uneven/uncounted/restart/zero shapes and rebuild after removal/reorder; genuine common/automatic ODT state/labels/copy/Worker/XML/reopen. Finish only after unchanged full verification, quality review and intentional scoped local commits.

## Verify Steps

Compile unmodified pinned phantom AddChild/CreatePhantom/cleanup/hierarchical validation, counted-parent and Writer node-policy/vector bodies; compare canonical SwList numbers, vectors, continuation, phantom topology over bounded skipped/deep/uneven hierarchies with zero/custom starts, counted/uncounted/restarts. Assert first level2 starts [7,5,3] yields [7,5,3] and 7.5.3.; phantom with only uncounted leaves, counted descendants and counted-parent barriers; level9; removal/reinsertion and ordering rebuild. Genuine common and automatic ODT fixtures must assert literal counters/vectors/labels, owned rule/item-set copying, Worker v16, selected standard XML and reopen. Run npm run verify unchanged, both 100% coverage suites and all browser/source/provenance/ODT gates; ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check. Record actual code hash and clean final tracked state.

## Verification

Pending implementation and declared checks; no mandatory check is skipped.

## Rollback Plan

Revert the scoped implementation commit through a new executable task if necessary; keep DONE evidence immutable and the parent goal active.

## Findings

Preflight: clean main/direct; only parent 202609240501-C9TN6M DOING. Previous turn is progress: iteration28 X0PFNS DONE, real implementation 203555bcef7d193f0ff1ec7869d4c4f021d2a994, full verify exit0. Pin libreoffice-26.8.0.2 /9bc445578031fecf56086729d8e4940c77e14d65. Current missing-level groups produce [0,0,3] for initial level2 with starts [7,5,3]. Native AddChild/CreatePhantom, true default phantom policy and validation define source-owned ancestors, not zero-filled projection. Compiled phantom-enabled evidence is required before asserting corrected behavior. No network/outside access or delegation. Full parity remains incomplete; uncounted ODT list-header transport is a separate known gap.

- Observation: Focused test command referenced absent apps/office/vitest.config.ts and exited1 before running tests.
  Impact: No semantic result; installed app uses its actual Vite configuration.
  Resolution: Locate repository test configuration and rerun focused checks without changing gates.

- Observation: Focused source tree checks: 13 pass; unattached-policy fixture reuses a root after resetting only its child, leaving the old phantom container populated.
  Impact: AddChild correctly rejects duplicate-equivalent insertion; the fixture must discard both old links for the eager rebuild contract.
  Resolution: Reset the fixture root before reinsertion, preserving native orphan/equivalence contracts; rerun checks.

- Observation: ODT focused check reaches correct [7,5,3] labels/copy/Worker/export, then fails an assertion that assumed adjacent XML attribute order.
  Impact: Selected declaration contains the expected values with num-suffix between attributes; semantic transport is not failing.
  Resolution: Assert each value inside the selected level declaration independently and rerun genuine package roundtrips.
