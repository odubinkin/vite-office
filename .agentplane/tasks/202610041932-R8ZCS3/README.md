---
id: "202610041932-R8ZCS3"
title: "Restore native text hint tie ordering"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 18
origin:
  system: "manual"
depends_on:
  - "202610041906-VVXZ0Q"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T19:42:59.829Z"
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
    body: "Start: implement approved native hint Which tie order and post-merge resort; correct only declared order-dependent test reads and verify once absent upstream."
  -
    author: "CODER"
    body: "Start: refined order-only recovery includes edfcol-modifier test, production unchanged; repeat five failed cases only with pending absent suites."
events:
  -
    type: "status"
    at: "2026-10-04T19:34:03.177Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native hint Which tie order and post-merge resort; correct only declared order-dependent test reads and verify once absent upstream."
  -
    type: "status"
    at: "2026-10-04T19:43:26.263Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: refined order-only recovery includes edfcol-modifier test, production unchanged; repeat five failed cases only with pending absent suites."
doc_version: 3
doc_updated_at: "2026-10-04T19:47:02.026Z"
doc_updated_by: "CODER"
description: "Iteration118: fix native CompareSwpHtStart Which-descending tie ordering and restore final order after adjacent merge. Correct only existing tests that assumed AUTO before INET at equal ranges; add independent literal order/ownership/projection tests. Preserve all statuses/defaults/exceptions and registered I/O deviations. Tests once absent upstream; no AP sources/helpers."
sections:
  Summary: "Restore the native deterministic order of existing ranged automatic and internet hints."
  Scope: |-
    apps/office/src/sw/source/core/txtnode/ndhints.ts
    apps/office/src/sw/source/core/txtnode/native-hint-order.test.ts
    apps/office/src/sw/source/core/txtnode/hint-pool-ownership.test.ts
    apps/office/src/sw/source/core/txtnode/owned-hint-cut.test.ts
    apps/office/src/sw/source/core/txtnode/txtedt-selective.test.ts
    apps/office/src/sw/source/core/txtnode/txtedt-replacement.test.ts
    apps/office/src/sw/source/core/doc/text-hint-copy.test.ts
    apps/office/src/sw/source/core/doc/text-hint-cut.test.ts
    apps/office/src/sw/source/core/doc/owned-text-move.test.ts
    apps/office/src/sw/source/core/edit/edfcol-modifier.test.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Correct CompareSwpHtStart tie ordering to descending Which and re-sort normalized owned hints after adjacent merges can extend an end. Keep existing start ascending/end descending behavior and supported projection semantics. Add independent literal order tests for both supported families, input permutations/flags, source/clone/copy/cut/concat/replacement/undo and merge reorder. Correct only order-dependent family selection and literal54-before53 expectations in eight existing tests; other prior336 test files byte-identical. Preserve234 runtime rows/statuses/defaults/exceptions, append only ndhints bounded evidence. Native pointer ties, extra maps/lazy dirty-range owner notifications/backlinks/refcounts/listeners and full destination adjustment remain unverified. Static gates first, one absent upstream build/app/inventory/scripts/Chromium profile with finally restoration, source audits after. No sources/helpers in AP; sequential owner roles, same-actor exact-SHA quality review, leaf close and parent active. Evidence-driven refinement: add edfcol-modifier.test.ts for exactly the same order-dependent family selection and last-Which expectation found by first absent coverage. Initial2068passed/5failed, all four coverage metrics100%; production unchanged. Recover only five failed cases, then run pending inventory/scripts/Chromium first absent."
  Verify Steps: |-
    1. Inspect pinned ndhints.cxx CompareSwpHtStart/Insert/ResortStartMap and thints.cxx MergePortions, ndhints.hxx Get ownership. Record only hashes/prose. Expected start ascending/end descending/Which descending and correct final order after end-extending merge; native pointer ties/maps/owner notifications remain unclaimed.
    2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:dependencies, npm run check:docs and npm run check:file-size; all pass.
    3. Rename vendor/libreoffice-reference within repo and restore in finally. Run once sequentially npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. All pass; app/inventory four metrics100%. Recovery repeats failed gates/cases only, no present profile/source audit concurrency.
    4. After restoration run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. All pass, semanticViolationCount0.
    5. Audit exact12paths, prior336tests with only eight declared order-dependent corrections,234existing runtime fields unchanged except one appended justification, provenance only one bounded appendix, native hashes, ignored-inclusive AP no source/helpers. Run ap doctor and node .agentplane/policy/check-routing.mjs; no new errors.
    6. Same-actor read-only EVALUATOR pass on exact semantic SHA; CODER verification/finish with separate commit hashes; clean main/vendor restored; parent and goal active.
  Verification: "Six static gates pass after new-test tuple typecheck recovery; focused formatter/lint/typecheck pass on order-only EDF correction. First absent build and app2068+5failed legacy-order expectations coverage100%four metrics; failed five cases alone recovered after order-only test correction,production unchanged. First absent inventory109 coverage100%,scripts5,Chromium99 pass. Vendor restored before five source audits all pass semantic0. Twelve paths,328 unchanged prior tests/eight native-order corrections,67newcases,234 runtime fields unchanged except one justification appendix,one provenance appendix,five native hashes. APforbidden0,doctor0errors/two unchanged warnings,routing pass. Same-actor read-only exact semantic quality SHA required before verify/finish. Broad native/core/browser parity remains unverified."
  Rollback Plan: "Revert only this task's semantic commit through a new authorized follow-up; preserve existing intentional I/O deviations and unrelated task history."
  Findings: "Native start ascending/end descending already matched;118 restores descending Which tie and re-sorts normalized array after end-extending merges.67 literal matrix/merge cases pass, including both input orders/all8flags, actual nodes/copy/move/independent undo and visible overlap. Eight prior files correct only order-dependent AUTO/INET selection/native order;328 other prior tests byte-identical. Missing EDF file discovered by first absent gate, scope/plan refined and approved before correction. Six static gates pass after new-test tuple-spread typecheck recovery, focused formatter/lint/typecheck pass. First absent build pass; app2068pass5legacy ordering failures, coverage100%four metrics. Production unchanged; only five failed cases recovered absent,43 others skipped. Pending inventory109/36 coverage100%,scripts5/2,Chromium99 pass first absent. No successful suite/build repeats or present profile. Vendor restored before five source audits all pass semantic violations0. Twelve semantic paths,234 runtime fields/statuses/defaults/exceptions unchanged except one bounded appendix,provenance only one appendix, five native hashes; AP3765 ignored-inclusive files forbidden0; doctor0errors/two unchanged warnings,routing pass. Source appendix lookup corrected preservedResponsibilities before tests. Native pointer ties/maps/owner notifications/backlinks/refcounts/listeners, empty hints, destination Update/BuildPortions/merge identity, same-node move and split/join remain unverified; no full core/UI/goal promotion or I/O deviation change."
id_source: "generated"
---
## Summary

Restore the native deterministic order of existing ranged automatic and internet hints.

## Scope

apps/office/src/sw/source/core/txtnode/ndhints.ts
apps/office/src/sw/source/core/txtnode/native-hint-order.test.ts
apps/office/src/sw/source/core/txtnode/hint-pool-ownership.test.ts
apps/office/src/sw/source/core/txtnode/owned-hint-cut.test.ts
apps/office/src/sw/source/core/txtnode/txtedt-selective.test.ts
apps/office/src/sw/source/core/txtnode/txtedt-replacement.test.ts
apps/office/src/sw/source/core/doc/text-hint-copy.test.ts
apps/office/src/sw/source/core/doc/text-hint-cut.test.ts
apps/office/src/sw/source/core/doc/owned-text-move.test.ts
apps/office/src/sw/source/core/edit/edfcol-modifier.test.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Correct CompareSwpHtStart tie ordering to descending Which and re-sort normalized owned hints after adjacent merges can extend an end. Keep existing start ascending/end descending behavior and supported projection semantics. Add independent literal order tests for both supported families, input permutations/flags, source/clone/copy/cut/concat/replacement/undo and merge reorder. Correct only order-dependent family selection and literal54-before53 expectations in eight existing tests; other prior336 test files byte-identical. Preserve234 runtime rows/statuses/defaults/exceptions, append only ndhints bounded evidence. Native pointer ties, extra maps/lazy dirty-range owner notifications/backlinks/refcounts/listeners and full destination adjustment remain unverified. Static gates first, one absent upstream build/app/inventory/scripts/Chromium profile with finally restoration, source audits after. No sources/helpers in AP; sequential owner roles, same-actor exact-SHA quality review, leaf close and parent active. Evidence-driven refinement: add edfcol-modifier.test.ts for exactly the same order-dependent family selection and last-Which expectation found by first absent coverage. Initial2068passed/5failed, all four coverage metrics100%; production unchanged. Recover only five failed cases, then run pending inventory/scripts/Chromium first absent.

## Verify Steps

1. Inspect pinned ndhints.cxx CompareSwpHtStart/Insert/ResortStartMap and thints.cxx MergePortions, ndhints.hxx Get ownership. Record only hashes/prose. Expected start ascending/end descending/Which descending and correct final order after end-extending merge; native pointer ties/maps/owner notifications remain unclaimed.
2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:dependencies, npm run check:docs and npm run check:file-size; all pass.
3. Rename vendor/libreoffice-reference within repo and restore in finally. Run once sequentially npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. All pass; app/inventory four metrics100%. Recovery repeats failed gates/cases only, no present profile/source audit concurrency.
4. After restoration run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. All pass, semanticViolationCount0.
5. Audit exact12paths, prior336tests with only eight declared order-dependent corrections,234existing runtime fields unchanged except one appended justification, provenance only one bounded appendix, native hashes, ignored-inclusive AP no source/helpers. Run ap doctor and node .agentplane/policy/check-routing.mjs; no new errors.
6. Same-actor read-only EVALUATOR pass on exact semantic SHA; CODER verification/finish with separate commit hashes; clean main/vendor restored; parent and goal active.

## Verification

Six static gates pass after new-test tuple typecheck recovery; focused formatter/lint/typecheck pass on order-only EDF correction. First absent build and app2068+5failed legacy-order expectations coverage100%four metrics; failed five cases alone recovered after order-only test correction,production unchanged. First absent inventory109 coverage100%,scripts5,Chromium99 pass. Vendor restored before five source audits all pass semantic0. Twelve paths,328 unchanged prior tests/eight native-order corrections,67newcases,234 runtime fields unchanged except one justification appendix,one provenance appendix,five native hashes. APforbidden0,doctor0errors/two unchanged warnings,routing pass. Same-actor read-only exact semantic quality SHA required before verify/finish. Broad native/core/browser parity remains unverified.

## Rollback Plan

Revert only this task's semantic commit through a new authorized follow-up; preserve existing intentional I/O deviations and unrelated task history.

## Findings

Native start ascending/end descending already matched;118 restores descending Which tie and re-sorts normalized array after end-extending merges.67 literal matrix/merge cases pass, including both input orders/all8flags, actual nodes/copy/move/independent undo and visible overlap. Eight prior files correct only order-dependent AUTO/INET selection/native order;328 other prior tests byte-identical. Missing EDF file discovered by first absent gate, scope/plan refined and approved before correction. Six static gates pass after new-test tuple-spread typecheck recovery, focused formatter/lint/typecheck pass. First absent build pass; app2068pass5legacy ordering failures, coverage100%four metrics. Production unchanged; only five failed cases recovered absent,43 others skipped. Pending inventory109/36 coverage100%,scripts5/2,Chromium99 pass first absent. No successful suite/build repeats or present profile. Vendor restored before five source audits all pass semantic violations0. Twelve semantic paths,234 runtime fields/statuses/defaults/exceptions unchanged except one bounded appendix,provenance only one appendix, five native hashes; AP3765 ignored-inclusive files forbidden0; doctor0errors/two unchanged warnings,routing pass. Source appendix lookup corrected preservedResponsibilities before tests. Native pointer ties/maps/owner notifications/backlinks/refcounts/listeners, empty hints, destination Update/BuildPortions/merge identity, same-node move and split/join remain unverified; no full core/UI/goal promotion or I/O deviation change.
