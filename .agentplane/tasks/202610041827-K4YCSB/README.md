---
id: "202610041827-K4YCSB"
title: "Restore destination-owned text hint copying"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on:
  - "202610041805-1QVN9H"
tags:
  - "code"
  - "parity"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T18:31:12.499Z"
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
    body: "Start: implement approved destination-owned copy boundaries under standing iterative goal."
events:
  -
    type: "status"
    at: "2026-10-04T18:31:12.930Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved destination-owned copy boundaries under standing iterative goal."
doc_version: 3
doc_updated_at: "2026-10-04T18:43:44.922Z"
doc_updated_by: "CODER"
description: "Restore native MakeTextAttr copying at existing text-node/container/fragment copy boundaries, converting automatic handles into destination pools and resetting copied hint flags while retaining same-pool snapshot clones for undo."
sections:
  Summary: |-
    Restore destination-owned text hint copying

    Restore native MakeTextAttr copying at existing text-node/container/fragment copy boundaries, converting automatic handles into destination pools and resetting copied hint flags while retaining same-pool snapshot clones for undo.
  Scope: "Seven semantic paths: apps/office/src/sw/source/core/txtnode/ndhints.ts, apps/office/src/sw/source/core/txtnode/ndtxt.ts, apps/office/src/sw/source/core/doc/DocumentContentOperationsManager.ts, apps/office/src/sw/source/core/txtnode/hint-pool-ownership.test.ts, apps/office/src/sw/source/core/doc/text-hint-copy.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Restore destination-owned automatic handles and constructor-default flags at actual copy boundaries. Preserve same-pool state snapshots for undo/move, existing manager ownership guards and registered save/open/recovery deviations. No upstream dependencies in product tests, no upstream/helper/source artifacts in Agentplane, no network or outside-repository access."
  Plan: |-
    1. Add explicit SwpHints.CopyTo destination-pool copying through MakeTextAttr; retain same-pool clone snapshot semantics and bind foreign containers/raw automatic handles before filtering empty hints.
    2. Bind SetTextHints and imported fragments to the destination pool; use actual-copy reconstruction in CloneTo and CopyRange.
    3. Add two app-owned test files covering all eight flag combinations, foreign pools, source isolation, state-only pruning, container operations and real document copy/import boundaries; leave all 331 previous test/spec files unchanged.
    4. Append bounded provenance/inventory notes without changing any of the 234 existing row statuses, defaults, exceptions or other runtime fields.
    5. Run six static gates followed by one sequential upstream-absent build, app/inventory coverage, scripts and Chromium profile; restore vendor before source audits. Record only bounded results/hashes/counts, review exact semantic SHA, finish this leaf and update parent.
  Verify Steps: |-
    1. Read pinned native ndtxt.cxx CopyText/CopyAttr/lcl_CopyHint, thints.cxx MakeTextAttr/InsertItem and txatbase.cxx constructors; record hashes and bounded conclusions only. Expected: destination ownership and fresh flags supported; partial move/native holder/listener parity remains unverified.
    2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:dependencies, npm run check:docs and npm run check:file-size. Expected: all pass.
    3. Temporarily rename vendor/libreoffice-reference inside the repo and restore in finally. Run once sequentially: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Expected: all pass, both coverage totals 100% in four metrics, no upstream dependencies. Recovery repeats only failed gates/cases.
    4. With vendor restored run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Expected: all pass, every semanticViolationCount zero.
    5. Audit exact seven semantic paths, unchanged 331 prior tests and 234 existing runtime fields/statuses, ignored-inclusive Agentplane artifacts source/helper-free; run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: zero new errors and no scope drift.
    6. Same-actor EVALUATOR read-only review at exact semantic SHA, quality pass and CODER verify/finish with distinct implementation/verification SHA. Expected: clean final main and restored vendor; broad upstream goal remains active.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this task's implementation and documentation commits through a new traceable task; restore vendor directory if interrupted. No history rewrite."
  Findings: "Iteration115 restores destination-owned automatic handles and constructor flags at actual CloneTo/CopyRange text copying via MakeTextAttr; same-pool historical clone/slice, state restoration and whole moves retain flags/shared handles. Foreign containers bind automatic and internet hints, including internet-only fragments; raw foreign automatic arrays convert before marker-only pruning. All 331 prior tests are byte-identical, 62 new app cases cover eight flag combinations, source isolation, pool separation/style reuse, parent/state exclusion, adjacent merging, real node/import/copy/move boundaries and later formatting/codec consumers. Six static gates passed. One upstream-absent build and app coverage run: 1762 initially passed, one new helper failed on its first-hint ordering assumption; the helper now selects WhichId53, and only that failed case was recovered absent. Production remained byte-identical after coverage; four app metrics100%. Inventory109/36 four metrics100%, scripts5/2, Chromium99 all first absent passes. No repeated passing suite/build. Vendor restored before five source audits; all passed with semantic violations0. Exact seven semantic paths, all234 runtime fields/statuses/defaults/exceptions unchanged except three appended justifications; nine native hashes only. Ignored-inclusive AP scan3734 files, forbidden0; doctor errors0 with two unchanged warnings; policy routing passed. Partial MoveText split semantics, native holder/refcount/client/character-style listener ownership, nullable automatic handles, unordered pool iteration and broader module/browser parity remain unverified. No broad goal/status promotion or registered I/O deviation changes."
id_source: "generated"
---
## Summary

Restore destination-owned text hint copying

Restore native MakeTextAttr copying at existing text-node/container/fragment copy boundaries, converting automatic handles into destination pools and resetting copied hint flags while retaining same-pool snapshot clones for undo.

## Scope

Seven semantic paths: apps/office/src/sw/source/core/txtnode/ndhints.ts, apps/office/src/sw/source/core/txtnode/ndtxt.ts, apps/office/src/sw/source/core/doc/DocumentContentOperationsManager.ts, apps/office/src/sw/source/core/txtnode/hint-pool-ownership.test.ts, apps/office/src/sw/source/core/doc/text-hint-copy.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Restore destination-owned automatic handles and constructor-default flags at actual copy boundaries. Preserve same-pool state snapshots for undo/move, existing manager ownership guards and registered save/open/recovery deviations. No upstream dependencies in product tests, no upstream/helper/source artifacts in Agentplane, no network or outside-repository access.

## Plan

1. Add explicit SwpHints.CopyTo destination-pool copying through MakeTextAttr; retain same-pool clone snapshot semantics and bind foreign containers/raw automatic handles before filtering empty hints.
2. Bind SetTextHints and imported fragments to the destination pool; use actual-copy reconstruction in CloneTo and CopyRange.
3. Add two app-owned test files covering all eight flag combinations, foreign pools, source isolation, state-only pruning, container operations and real document copy/import boundaries; leave all 331 previous test/spec files unchanged.
4. Append bounded provenance/inventory notes without changing any of the 234 existing row statuses, defaults, exceptions or other runtime fields.
5. Run six static gates followed by one sequential upstream-absent build, app/inventory coverage, scripts and Chromium profile; restore vendor before source audits. Record only bounded results/hashes/counts, review exact semantic SHA, finish this leaf and update parent.

## Verify Steps

1. Read pinned native ndtxt.cxx CopyText/CopyAttr/lcl_CopyHint, thints.cxx MakeTextAttr/InsertItem and txatbase.cxx constructors; record hashes and bounded conclusions only. Expected: destination ownership and fresh flags supported; partial move/native holder/listener parity remains unverified.
2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:dependencies, npm run check:docs and npm run check:file-size. Expected: all pass.
3. Temporarily rename vendor/libreoffice-reference inside the repo and restore in finally. Run once sequentially: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Expected: all pass, both coverage totals 100% in four metrics, no upstream dependencies. Recovery repeats only failed gates/cases.
4. With vendor restored run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Expected: all pass, every semanticViolationCount zero.
5. Audit exact seven semantic paths, unchanged 331 prior tests and 234 existing runtime fields/statuses, ignored-inclusive Agentplane artifacts source/helper-free; run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: zero new errors and no scope drift.
6. Same-actor EVALUATOR read-only review at exact semantic SHA, quality pass and CODER verify/finish with distinct implementation/verification SHA. Expected: clean final main and restored vendor; broad upstream goal remains active.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this task's implementation and documentation commits through a new traceable task; restore vendor directory if interrupted. No history rewrite.

## Findings

Iteration115 restores destination-owned automatic handles and constructor flags at actual CloneTo/CopyRange text copying via MakeTextAttr; same-pool historical clone/slice, state restoration and whole moves retain flags/shared handles. Foreign containers bind automatic and internet hints, including internet-only fragments; raw foreign automatic arrays convert before marker-only pruning. All 331 prior tests are byte-identical, 62 new app cases cover eight flag combinations, source isolation, pool separation/style reuse, parent/state exclusion, adjacent merging, real node/import/copy/move boundaries and later formatting/codec consumers. Six static gates passed. One upstream-absent build and app coverage run: 1762 initially passed, one new helper failed on its first-hint ordering assumption; the helper now selects WhichId53, and only that failed case was recovered absent. Production remained byte-identical after coverage; four app metrics100%. Inventory109/36 four metrics100%, scripts5/2, Chromium99 all first absent passes. No repeated passing suite/build. Vendor restored before five source audits; all passed with semantic violations0. Exact seven semantic paths, all234 runtime fields/statuses/defaults/exceptions unchanged except three appended justifications; nine native hashes only. Ignored-inclusive AP scan3734 files, forbidden0; doctor errors0 with two unchanged warnings; policy routing passed. Partial MoveText split semantics, native holder/refcount/client/character-style listener ownership, nullable automatic handles, unordered pool iteration and broader module/browser parity remain unverified. No broad goal/status promotion or registered I/O deviation changes.
