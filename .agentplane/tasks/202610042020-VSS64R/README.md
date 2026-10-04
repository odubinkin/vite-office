---
id: "202610042020-VSS64R"
title: "Restore native text hint secondary maps"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on:
  - "202610041956-2E6B9B"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T20:20:48.841Z"
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
    body: "Start: execute approved iteration120 secondary hint maps and indexed existing-family reads under the standing goal authorization; no upstream-dependent tests or AP helpers."
events:
  -
    type: "status"
    at: "2026-10-04T20:20:49.280Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: execute approved iteration120 secondary hint maps and indexed existing-family reads under the standing goal authorization; no upstream-dependent tests or AP helpers."
doc_version: 3
doc_updated_at: "2026-10-04T20:20:49.280Z"
doc_updated_by: "CODER"
description: "Iteration120 restores the missing end and Which/start maps on the existing SwpHints container, using the same actual owned attributes and native notification/sort/binary lookup contracts for supported automatic and internet ranges. Replace current whole-primary-map family scans with the existing-family indexed lookup; preserve public projection values,prior tests and registered I/O/recovery deviations. One upstream-absent product profile only."
sections:
  Summary: "Iteration120 restores the missing end and Which/start maps on the existing SwpHints container, using the same actual owned attributes and native notification/sort/binary lookup contracts for supported automatic and internet ranges. Replace current whole-primary-map family scans with the existing-family indexed lookup; preserve public projection values,prior tests and registered I/O/recovery deviations. One upstream-absent product profile only."
  Scope: |-
    apps/office/src/sw/source/core/txtnode/ndhints.ts
    apps/office/src/sw/source/core/txtnode/secondary-hint-maps.test.ts
    apps/office/src/sw/source/core/txtnode/secondary-hint-transfer.test.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    Task lifecycle/evidence prose,counts,hashes only. All339 existing test/spec files byte-identical;234 runtime fields unchanged except one justification appendix. Registered save/open/recovery deviations preserved.
  Plan: "Restore native m_HintsByEnd and m_HintsByWhichAndStart actual-object maps alongside existing primary map. Bind replacement survivors across all maps without cloning,clear consumed/removed maps,initialize native clean sentinels. SetStart dirties all maps; EndPosChanged tracks old/new end interval and lexicographic Which/start interval. Native end/start-reverse/Which and Which/start/end-reverse comparators,binary lower/upper bounds,lazy ResortEndMap/ResortWhichMap,SortIfNeedBe and lookup/getter contracts; primary map/raw iteration retained. Native failure size sentinel represented by Number.MAX_SAFE_INTEGER in number-indexed TS,explicitly no C++ABI/pointer-order claim. Replace existing repeated family scans for projections/caret/segments with indexed Which/start lookup,without changing current caret/range semantics. Add independent literal ordering/tie/full-partial-dirty/lookup bounds/actual identity/ownership/cut-transfer/snapshot/undo tests across both families and eight flags. All339 prior tests byte-identical,234 runtime fields/statuses/defaults/exceptions unchanged except one bounded justification/provenance appendix,no new runtime module. Keep ndhints below1000 physical lines through concise native map code and removal of duplicated family scans. Six static gates first;one sequential absent build/app/inventory/scripts/Chromium profile with finally restoration and failed-only recovery. Source/resource/invariant/parity audits only after restoration,scope/hashes/AP sourcefree/doctor/routing,exact-SHA same-actor read-only quality review,CODER verify/finish,clean main/active parent. No AP source/probe/helper files,no network. Class hierarchy/friend visibility/history/refcounts/destruction/listeners,native full Insert/Delete/nesting/pointer ties/empty hints/destination adjustment/same-node split/join and broad core/UI parity remain unverified."
  Verify Steps: |-
    1. Inspect pinned ndhints.hxx three maps/notifications/lookups,ndhints.cxx end/Which comparators/resort/binary queries,ndtxt.cxx existing native lookup callers and thints.cxx DeleteAtPos; record only hashes/prose. Expected three maps hold same owned object sets; native independent lazy full/partial sort and boundary queries; indexed family scans preserve existing output.
    2. Run npm run format:check,npm run lint,npm run typecheck,npm run check:dependencies,npm run check:docs,npm run check:file-size. All pass.
    3. Rename vendor/libreoffice-reference inside repo and restore in finally. Run once sequentially npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. All pass,app/inventory four metrics100%. Recover failed gates/cases only; no present profile or concurrent source/scope/AP audits.
    4. After restoration npm exec -- tsx scripts/generate-writer-ui-resources.ts --check;npm run check:source-tree;npm run check:source-provenance;npm run inventory:invariants;npm run inventory:parity. All pass,semantic violations0.
    5. Audit five semantic paths,all339previous tests byte-identical,234runtime fields/statuses/defaults/exceptions unchanged except one justification appendix,provenance only one bounded appendix,native hashes,ignored-inclusive AP source/helper-free. Run ap doctor,node .agentplane/policy/check-routing.mjs; no new errors.
    6. Same-actor read-only EVALUATOR exact semantic SHA quality pass; CODER verify/finish separate commit hashes; clean main/vendor restored;parent/goal active. No broad native/core/UI promotion.
  Verification: "Pending execution. No acceptance claims before evidence."
  Rollback Plan: "Revert only the semantic commit for this leaf through a new scoped task; preserve task history and other changes. Never rewrite Git history."
  Findings: "Read-only preflight clean main after verified119. Existing supported SwpHints holds only the start map and currently ignores the other native dirty maps. Pinned native secondary comparator/resort/query contracts and supported native callers inspected. Goal-authorized single correction; no external action or broad parity promotion."
id_source: "generated"
---
## Summary

Iteration120 restores the missing end and Which/start maps on the existing SwpHints container, using the same actual owned attributes and native notification/sort/binary lookup contracts for supported automatic and internet ranges. Replace current whole-primary-map family scans with the existing-family indexed lookup; preserve public projection values,prior tests and registered I/O/recovery deviations. One upstream-absent product profile only.

## Scope

apps/office/src/sw/source/core/txtnode/ndhints.ts
apps/office/src/sw/source/core/txtnode/secondary-hint-maps.test.ts
apps/office/src/sw/source/core/txtnode/secondary-hint-transfer.test.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
Task lifecycle/evidence prose,counts,hashes only. All339 existing test/spec files byte-identical;234 runtime fields unchanged except one justification appendix. Registered save/open/recovery deviations preserved.

## Plan

Restore native m_HintsByEnd and m_HintsByWhichAndStart actual-object maps alongside existing primary map. Bind replacement survivors across all maps without cloning,clear consumed/removed maps,initialize native clean sentinels. SetStart dirties all maps; EndPosChanged tracks old/new end interval and lexicographic Which/start interval. Native end/start-reverse/Which and Which/start/end-reverse comparators,binary lower/upper bounds,lazy ResortEndMap/ResortWhichMap,SortIfNeedBe and lookup/getter contracts; primary map/raw iteration retained. Native failure size sentinel represented by Number.MAX_SAFE_INTEGER in number-indexed TS,explicitly no C++ABI/pointer-order claim. Replace existing repeated family scans for projections/caret/segments with indexed Which/start lookup,without changing current caret/range semantics. Add independent literal ordering/tie/full-partial-dirty/lookup bounds/actual identity/ownership/cut-transfer/snapshot/undo tests across both families and eight flags. All339 prior tests byte-identical,234 runtime fields/statuses/defaults/exceptions unchanged except one bounded justification/provenance appendix,no new runtime module. Keep ndhints below1000 physical lines through concise native map code and removal of duplicated family scans. Six static gates first;one sequential absent build/app/inventory/scripts/Chromium profile with finally restoration and failed-only recovery. Source/resource/invariant/parity audits only after restoration,scope/hashes/AP sourcefree/doctor/routing,exact-SHA same-actor read-only quality review,CODER verify/finish,clean main/active parent. No AP source/probe/helper files,no network. Class hierarchy/friend visibility/history/refcounts/destruction/listeners,native full Insert/Delete/nesting/pointer ties/empty hints/destination adjustment/same-node split/join and broad core/UI parity remain unverified.

## Verify Steps

1. Inspect pinned ndhints.hxx three maps/notifications/lookups,ndhints.cxx end/Which comparators/resort/binary queries,ndtxt.cxx existing native lookup callers and thints.cxx DeleteAtPos; record only hashes/prose. Expected three maps hold same owned object sets; native independent lazy full/partial sort and boundary queries; indexed family scans preserve existing output.
2. Run npm run format:check,npm run lint,npm run typecheck,npm run check:dependencies,npm run check:docs,npm run check:file-size. All pass.
3. Rename vendor/libreoffice-reference inside repo and restore in finally. Run once sequentially npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. All pass,app/inventory four metrics100%. Recover failed gates/cases only; no present profile or concurrent source/scope/AP audits.
4. After restoration npm exec -- tsx scripts/generate-writer-ui-resources.ts --check;npm run check:source-tree;npm run check:source-provenance;npm run inventory:invariants;npm run inventory:parity. All pass,semantic violations0.
5. Audit five semantic paths,all339previous tests byte-identical,234runtime fields/statuses/defaults/exceptions unchanged except one justification appendix,provenance only one bounded appendix,native hashes,ignored-inclusive AP source/helper-free. Run ap doctor,node .agentplane/policy/check-routing.mjs; no new errors.
6. Same-actor read-only EVALUATOR exact semantic SHA quality pass; CODER verify/finish separate commit hashes; clean main/vendor restored;parent/goal active. No broad native/core/UI promotion.

## Verification

Pending execution. No acceptance claims before evidence.

## Rollback Plan

Revert only the semantic commit for this leaf through a new scoped task; preserve task history and other changes. Never rewrite Git history.

## Findings

Read-only preflight clean main after verified119. Existing supported SwpHints holds only the start map and currently ignores the other native dirty maps. Pinned native secondary comparator/resort/query contracts and supported native callers inspected. Goal-authorized single correction; no external action or broad parity promotion.
