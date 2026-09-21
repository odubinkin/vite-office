---
id: "202609211156-HQ7ABZ"
title: "Complete Writer P0 upstream parity remediation"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
task_kind: "code"
mutation_scope: "code"
blueprint_request: "code.direct"
verify:
  - "ap doctor"
  - "node .agentplane/policy/check-routing.mjs"
  - "npm run check:dependencies"
  - "npm run check:source-provenance"
  - "npm run check:source-tree"
  - "npm run lint"
  - "npm run test:coverage"
  - "npm run test:e2e"
  - "npm run test:inventory:coverage"
  - "npm run typecheck"
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-21T11:56:42.456Z"
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
    body: "Start: complete the approved P0-2 through P0-5 remediation without changing P0-1 mechanics."
events:
  -
    type: "status"
    at: "2026-09-21T11:56:52.414Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: complete the approved P0-2 through P0-5 remediation without changing P0-1 mechanics."
doc_version: 3
doc_updated_at: "2026-09-21T11:56:52.414Z"
doc_updated_by: "CODER"
description: "Complete the missing P0-2 through P0-5 requirements identified by review; keep P0-1 inventory model and behavior unchanged."
sections:
  Summary: "Finish the approved P0-2 through P0-5 remediation: upstream-shaped Sfx slot execution, projection-only browser identities, hint/item-native Writer mutations and undo, and complete honest style/font defaults."
  Scope: "In scope: remove custom target/undo execution metadata from Sfx descriptors; keep presentation metadata declarative; remove string paragraph/node identities from sw/core and shell-facing uibase contracts; mutate canonical text/hints/items directly and store undo payloads as Writer-native text/range/attribute state; either implement source-derived defaults for every exposed built-in style or make unsupported families unavailable; separate requested, device-resolved, and serialized font identities; update focused tests and truthful existing-schema inventory records. Out of scope: P0-1 inventory schema/closure redesign, P1/P2 refactors, legacy persisted-schema compatibility, external publication."
  Plan: "1. Load direct/code policy and current route. 2. Replace residual custom Sfx execution metadata with slot/request/shell execute-state contracts and tests. 3. Remove core/uibase paragraph string identities, keeping browser keys exclusively in projection adapters. 4. Rework SwTextNode and undo mutations to operate directly on text plus SwpHints/SwTextAttr/SfxItemSet; retain WriterTextRun only for immutable boundary projection and import conversion. 5. Complete source-derived defaults for every exposed style or restrict the exposed set, and model requested versus resolved font identity explicitly. 6. Update tests and existing inventory/provenance records without changing P0-1 mechanics. 7. Run focused and full verification, inspect diff/status, record verification, commit, and finish the task."
  Verify Steps: |-
    1. Run focused Sfx tests proving shell priority, slot/request argument flow, state queries, invalidation, and absence of custom target/undo execution metadata.
    2. Run focused Writer model tests proving core and shell-facing APIs use node references, SwPosition, and SwPaM while browser projection IDs terminate in sw/browser.
    3. Run focused text/hint/undo tests proving insert, delete, replace, format, hyperlink, split, join, undo, and redo mutate or restore text plus SwpHints/SwTextAttr/SfxItemSet without WriterTextRun payloads in core mutation or undo APIs.
    4. Run style/font tests proving every exposed built-in style has its required source-derived supported defaults, unsupported families are unavailable, Western/CJK/CTL requests are covered, and requested versus resolved/serialized font identity is distinguishable.
    5. Run npm run typecheck, npm run lint, npm run check:dependencies, npm run check:source-tree, and npm run check:source-provenance.
    6. Run npm run test:coverage, npm run test:inventory:coverage, npm run test:e2e, and npm run verify.
    7. Run ap doctor and node .agentplane/policy/check-routing.mjs.
    8. Inspect git diff and final git status; only intentional P0-2 through P0-5 task files and AgentPlane artifacts may change, while P0-1 mechanics remain untouched.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commit and the deterministic AgentPlane close commit; no legacy schema migration is added."
  Findings: ""
id_source: "generated"
---
## Summary

Finish the approved P0-2 through P0-5 remediation: upstream-shaped Sfx slot execution, projection-only browser identities, hint/item-native Writer mutations and undo, and complete honest style/font defaults.

## Scope

In scope: remove custom target/undo execution metadata from Sfx descriptors; keep presentation metadata declarative; remove string paragraph/node identities from sw/core and shell-facing uibase contracts; mutate canonical text/hints/items directly and store undo payloads as Writer-native text/range/attribute state; either implement source-derived defaults for every exposed built-in style or make unsupported families unavailable; separate requested, device-resolved, and serialized font identities; update focused tests and truthful existing-schema inventory records. Out of scope: P0-1 inventory schema/closure redesign, P1/P2 refactors, legacy persisted-schema compatibility, external publication.

## Plan

1. Load direct/code policy and current route. 2. Replace residual custom Sfx execution metadata with slot/request/shell execute-state contracts and tests. 3. Remove core/uibase paragraph string identities, keeping browser keys exclusively in projection adapters. 4. Rework SwTextNode and undo mutations to operate directly on text plus SwpHints/SwTextAttr/SfxItemSet; retain WriterTextRun only for immutable boundary projection and import conversion. 5. Complete source-derived defaults for every exposed style or restrict the exposed set, and model requested versus resolved font identity explicitly. 6. Update tests and existing inventory/provenance records without changing P0-1 mechanics. 7. Run focused and full verification, inspect diff/status, record verification, commit, and finish the task.

## Verify Steps

1. Run focused Sfx tests proving shell priority, slot/request argument flow, state queries, invalidation, and absence of custom target/undo execution metadata.
2. Run focused Writer model tests proving core and shell-facing APIs use node references, SwPosition, and SwPaM while browser projection IDs terminate in sw/browser.
3. Run focused text/hint/undo tests proving insert, delete, replace, format, hyperlink, split, join, undo, and redo mutate or restore text plus SwpHints/SwTextAttr/SfxItemSet without WriterTextRun payloads in core mutation or undo APIs.
4. Run style/font tests proving every exposed built-in style has its required source-derived supported defaults, unsupported families are unavailable, Western/CJK/CTL requests are covered, and requested versus resolved/serialized font identity is distinguishable.
5. Run npm run typecheck, npm run lint, npm run check:dependencies, npm run check:source-tree, and npm run check:source-provenance.
6. Run npm run test:coverage, npm run test:inventory:coverage, npm run test:e2e, and npm run verify.
7. Run ap doctor and node .agentplane/policy/check-routing.mjs.
8. Inspect git diff and final git status; only intentional P0-2 through P0-5 task files and AgentPlane artifacts may change, while P0-1 mechanics remain untouched.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commit and the deterministic AgentPlane close commit; no legacy schema migration is added.

## Findings
