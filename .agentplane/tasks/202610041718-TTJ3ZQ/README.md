---
id: "202610041718-TTJ3ZQ"
title: "Restore native item-set equality ownership and state contracts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on:
  - "202610041659-JF2KV2"
tags:
  - "code"
  - "parity"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T17:20:02.428Z"
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
    body: "Start: Restore approved native item-set equality states/owners and replace SET-only helper, keeping handle interning explicitly unresolved."
events:
  -
    type: "status"
    at: "2026-10-04T17:20:39.664Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore approved native item-set equality states/owners and replace SET-only helper, keeping handle interning explicitly unresolved."
doc_version: 3
doc_updated_at: "2026-10-04T17:32:04.439Z"
doc_updated_by: "CODER"
description: "Restore SfxItemSet::Equals pool/parent/count/direct-state/value contract and replace the existing Writer SET-only equality helper with the owner contract. Add independent actual-owner/item/adjacent-hint regressions. Native automatic-style handle interning and pointer equality remain the next architectural step, not certified by this leaf."
sections:
  Summary: "Restore native SfxItemSet::Equals direct states and owner identity and use this base-owner contract instead of the existing SET-only Writer helper. One executable leaf; automatic-style interning and pointer identity remain a subsequent architectural requirement."
  Scope: "Exactly six semantic paths: apps/office/src/svl/source/items/itemset.ts and new itemset-equality.test.ts; apps/office/src/sw/source/core/txtnode/txatbase.ts and new automatic-itemset-equality.test.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. All325 previous tests/specs unchanged. Bounded prose/hash/count task evidence only; no upstream sources/helpers in AP, network/outside-repo access or registered save/open/recovery changes. Native item-set comparison verified only; automatic-style handle/pool and whole-module parity remain unverified."
  Plan: "Port native Equals with explicit comparePool parameter: identity shortcut, conditional parent/pool identity, direct Count, empty equality regardless of ranges, keyed direct state and SET item value equality. Remove SET-only equalItemSets helper and delegate the existing automatic-style value comparison to its owning item set. Add independent actual-owner state/value/pool/parent/range/order and real adjacent-hint/projection/clone regressions. Append bounded existing-row evidence only. Static gates then one absent-only test profile then restored source audits; exact-SHA same-actor quality, verification and clean closure."
  Verify Steps: |-
    1. Static gates before suites: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Absent-only npm run test:static precedes product suites.
    2. Rename vendor/libreoffice-reference to vendor/.offline-TTJ3ZQ inside repo using try/finally. Sequential single absent-only runs: npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Require all assertions and four required app/inventory metrics100%. Recover failed gates only; no present-vendor runs or repetition of passing suites, no concurrent source/scope/AP audits. Restore vendor.
    3. New independent real-owner tests cover direct value/INVALID/DISABLED/unset states, keyed marker positions, pool/parent identity with comparePool true/false, self/empty/count/range/order semantics and clone/immutability. Actual Writer automatic items and adjacent hints must preserve distinct state and inherited-format ranges while equivalent direct sets still compare equal. All325 previous tests/specs byte-identical.
    4. Restored-only npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity, zero semantic violations. Pin native Equals and automatic-format/StylePool/manager source hashes as bounded evidence; do not execute or copy upstream.
    5. Exact six semantic paths;230 runtime rows preserve statuses/defaults/exceptions, only two bounded existing-row evidence appendices; provenance retains existing evidence with precise residual handle-interner gap. Complete ignored-inclusive AP audit rejects source/helpers/Python/executables/source frames/raw source diffs. Same-actor exact-SHA EVALUATOR pass; ap doctor zero errors and node .agentplane/policy/check-routing.mjs pass. Recorded canonical verification, semantic/verification/close hashes and clean tracked/untracked final checkout required.
  Verification: "Pending execution; product suites authorized once absent-only. No broad native automatic-style identity or whole-module parity claim."
  Rollback Plan: "Revert semantic task commit with a new commit if necessary; no history rewrite. Always restore vendor directory in finally."
  Findings: "Restored pinned base SfxItemSet::Equals explicit comparePool contract and removed Writer SET-only helper.49 new real-owner/item/hint/clone/direct-projection assertions cover direct states, keyed markers, parent/pool identity, Count/self/empty/range/order and retained inherited item access. Corrected a new fixture before product execution to distinguish owner inheritance from separately implemented browser inheritance projection; repeated only static gates affected by that new test edit. All product gates pass first single absent-only profile:1660app/244files,109inventory/36files,5scripts/2files,99Chromium; four required metrics100%. Six final static gates and absent build plus restored source/resource/provenance/invariant/parity audits pass, semantic violations0. All325 previous tests/specs byte-identical; exact six semantic paths,230 unchanged runtime statuses/defaults/exceptions with two bounded appendices; five native hashes bind pin; full ignored-inclusive AP scan3701files forbidden0. Upstream restored in finally, no network/outside-repo/source execution or AP source/helper storage, registered I/O/recovery deviations unchanged. Native automatic-format equality requires document-owned shared handles and pointer identity; that next architectural requirement remains open. Complete native style pools/other flags/notifications/layout/ranges/fields/marks/redlines/filter/UI contracts remain unverified; broad goal active."
id_source: "generated"
---
## Summary

Restore native SfxItemSet::Equals direct states and owner identity and use this base-owner contract instead of the existing SET-only Writer helper. One executable leaf; automatic-style interning and pointer identity remain a subsequent architectural requirement.

## Scope

Exactly six semantic paths: apps/office/src/svl/source/items/itemset.ts and new itemset-equality.test.ts; apps/office/src/sw/source/core/txtnode/txatbase.ts and new automatic-itemset-equality.test.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. All325 previous tests/specs unchanged. Bounded prose/hash/count task evidence only; no upstream sources/helpers in AP, network/outside-repo access or registered save/open/recovery changes. Native item-set comparison verified only; automatic-style handle/pool and whole-module parity remain unverified.

## Plan

Port native Equals with explicit comparePool parameter: identity shortcut, conditional parent/pool identity, direct Count, empty equality regardless of ranges, keyed direct state and SET item value equality. Remove SET-only equalItemSets helper and delegate the existing automatic-style value comparison to its owning item set. Add independent actual-owner state/value/pool/parent/range/order and real adjacent-hint/projection/clone regressions. Append bounded existing-row evidence only. Static gates then one absent-only test profile then restored source audits; exact-SHA same-actor quality, verification and clean closure.

## Verify Steps

1. Static gates before suites: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Absent-only npm run test:static precedes product suites.
2. Rename vendor/libreoffice-reference to vendor/.offline-TTJ3ZQ inside repo using try/finally. Sequential single absent-only runs: npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Require all assertions and four required app/inventory metrics100%. Recover failed gates only; no present-vendor runs or repetition of passing suites, no concurrent source/scope/AP audits. Restore vendor.
3. New independent real-owner tests cover direct value/INVALID/DISABLED/unset states, keyed marker positions, pool/parent identity with comparePool true/false, self/empty/count/range/order semantics and clone/immutability. Actual Writer automatic items and adjacent hints must preserve distinct state and inherited-format ranges while equivalent direct sets still compare equal. All325 previous tests/specs byte-identical.
4. Restored-only npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity, zero semantic violations. Pin native Equals and automatic-format/StylePool/manager source hashes as bounded evidence; do not execute or copy upstream.
5. Exact six semantic paths;230 runtime rows preserve statuses/defaults/exceptions, only two bounded existing-row evidence appendices; provenance retains existing evidence with precise residual handle-interner gap. Complete ignored-inclusive AP audit rejects source/helpers/Python/executables/source frames/raw source diffs. Same-actor exact-SHA EVALUATOR pass; ap doctor zero errors and node .agentplane/policy/check-routing.mjs pass. Recorded canonical verification, semantic/verification/close hashes and clean tracked/untracked final checkout required.

## Verification

Pending execution; product suites authorized once absent-only. No broad native automatic-style identity or whole-module parity claim.

## Rollback Plan

Revert semantic task commit with a new commit if necessary; no history rewrite. Always restore vendor directory in finally.

## Findings

Restored pinned base SfxItemSet::Equals explicit comparePool contract and removed Writer SET-only helper.49 new real-owner/item/hint/clone/direct-projection assertions cover direct states, keyed markers, parent/pool identity, Count/self/empty/range/order and retained inherited item access. Corrected a new fixture before product execution to distinguish owner inheritance from separately implemented browser inheritance projection; repeated only static gates affected by that new test edit. All product gates pass first single absent-only profile:1660app/244files,109inventory/36files,5scripts/2files,99Chromium; four required metrics100%. Six final static gates and absent build plus restored source/resource/provenance/invariant/parity audits pass, semantic violations0. All325 previous tests/specs byte-identical; exact six semantic paths,230 unchanged runtime statuses/defaults/exceptions with two bounded appendices; five native hashes bind pin; full ignored-inclusive AP scan3701files forbidden0. Upstream restored in finally, no network/outside-repo/source execution or AP source/helper storage, registered I/O/recovery deviations unchanged. Native automatic-format equality requires document-owned shared handles and pointer identity; that next architectural requirement remains open. Complete native style pools/other flags/notifications/layout/ranges/fields/marks/redlines/filter/UI contracts remain unverified; broad goal active.
