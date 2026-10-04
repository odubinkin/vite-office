---
id: "202610041932-R8ZCS3"
title: "Restore native text hint tie ordering"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on:
  - "202610041906-VVXZ0Q"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T19:33:49.788Z"
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
events:
  -
    type: "status"
    at: "2026-10-04T19:34:03.177Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native hint Which tie order and post-merge resort; correct only declared order-dependent test reads and verify once absent upstream."
doc_version: 3
doc_updated_at: "2026-10-04T19:34:03.177Z"
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
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Correct CompareSwpHtStart tie ordering to descending Which and re-sort normalized owned hints after adjacent merges can extend an end. Keep existing start ascending/end descending behavior and supported projection semantics. Add independent literal order tests for both supported families, input permutations/flags, source/clone/copy/cut/concat/replacement/undo and merge reorder. Correct only order-dependent family selection and literal54-before53 expectations in seven existing tests; other prior336 test files byte-identical. Preserve234 runtime rows/statuses/defaults/exceptions, append only ndhints bounded evidence. Native pointer ties, extra maps/lazy dirty-range owner notifications/backlinks/refcounts/listeners and full destination adjustment remain unverified. Static gates first, one absent upstream build/app/inventory/scripts/Chromium profile with finally restoration, source audits after. No sources/helpers in AP; sequential owner roles, same-actor exact-SHA quality review, leaf close and parent active."
  Verify Steps: |-
    1. Inspect pinned ndhints.cxx CompareSwpHtStart/Insert/ResortStartMap and thints.cxx MergePortions, ndhints.hxx Get ownership. Record only hashes/prose. Expected start ascending/end descending/Which descending and correct final order after end-extending merge; native pointer ties/maps/owner notifications remain unclaimed.
    2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:dependencies, npm run check:docs and npm run check:file-size; all pass.
    3. Rename vendor/libreoffice-reference within repo and restore in finally. Run once sequentially npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. All pass; app/inventory four metrics100%. Recovery repeats failed gates/cases only, no present profile/source audit concurrency.
    4. After restoration run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. All pass, semanticViolationCount0.
    5. Audit exact11paths, prior336tests with only seven declared order-dependent corrections,234existing runtime fields unchanged except one appended justification, provenance only one bounded appendix, native hashes, ignored-inclusive AP no source/helpers. Run ap doctor and node .agentplane/policy/check-routing.mjs; no new errors.
    6. Same-actor read-only EVALUATOR pass on exact semantic SHA; CODER verification/finish with separate commit hashes; clean main/vendor restored; parent and goal active.
  Verification: "Pending approved implementation and upstream-absent verification."
  Rollback Plan: "Revert only this task's semantic commit through a new authorized follow-up; preserve existing intentional I/O deviations and unrelated task history."
  Findings: "Read-only preflight clean main;117 completed verified progress. Native comparator uses start ascending, end descending, Which descending; current comparator omits Which. Existing adjacent merge extends an end without re-sorting normalized array. No outside-repo/network access."
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
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Correct CompareSwpHtStart tie ordering to descending Which and re-sort normalized owned hints after adjacent merges can extend an end. Keep existing start ascending/end descending behavior and supported projection semantics. Add independent literal order tests for both supported families, input permutations/flags, source/clone/copy/cut/concat/replacement/undo and merge reorder. Correct only order-dependent family selection and literal54-before53 expectations in seven existing tests; other prior336 test files byte-identical. Preserve234 runtime rows/statuses/defaults/exceptions, append only ndhints bounded evidence. Native pointer ties, extra maps/lazy dirty-range owner notifications/backlinks/refcounts/listeners and full destination adjustment remain unverified. Static gates first, one absent upstream build/app/inventory/scripts/Chromium profile with finally restoration, source audits after. No sources/helpers in AP; sequential owner roles, same-actor exact-SHA quality review, leaf close and parent active.

## Verify Steps

1. Inspect pinned ndhints.cxx CompareSwpHtStart/Insert/ResortStartMap and thints.cxx MergePortions, ndhints.hxx Get ownership. Record only hashes/prose. Expected start ascending/end descending/Which descending and correct final order after end-extending merge; native pointer ties/maps/owner notifications remain unclaimed.
2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:dependencies, npm run check:docs and npm run check:file-size; all pass.
3. Rename vendor/libreoffice-reference within repo and restore in finally. Run once sequentially npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. All pass; app/inventory four metrics100%. Recovery repeats failed gates/cases only, no present profile/source audit concurrency.
4. After restoration run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. All pass, semanticViolationCount0.
5. Audit exact11paths, prior336tests with only seven declared order-dependent corrections,234existing runtime fields unchanged except one appended justification, provenance only one bounded appendix, native hashes, ignored-inclusive AP no source/helpers. Run ap doctor and node .agentplane/policy/check-routing.mjs; no new errors.
6. Same-actor read-only EVALUATOR pass on exact semantic SHA; CODER verification/finish with separate commit hashes; clean main/vendor restored; parent and goal active.

## Verification

Pending approved implementation and upstream-absent verification.

## Rollback Plan

Revert only this task's semantic commit through a new authorized follow-up; preserve existing intentional I/O deviations and unrelated task history.

## Findings

Read-only preflight clean main;117 completed verified progress. Native comparator uses start ascending, end descending, Which descending; current comparator omits Which. Existing adjacent merge extends an end without re-sorting normalized array. No outside-repo/network access.
