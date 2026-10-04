---
id: "202610041849-96ZZRB"
title: "Restore cut text hint reconstruction boundaries"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on:
  - "202610041827-K4YCSB"
tags:
  - "code"
  - "parity"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T18:50:37.537Z"
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
    body: "Start: implement approved strict cut-end flag boundaries and source-supported expectation correction under standing goal."
events:
  -
    type: "status"
    at: "2026-10-04T18:50:37.972Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved strict cut-end flag boundaries and source-supported expectation correction under standing goal."
doc_version: 3
doc_updated_at: "2026-10-04T18:54:32.104Z"
doc_updated_by: "CODER"
description: "Port native CutImpl strict end-boundary and split attribute construction into existing cross-node MoveRange; preserve snapshot semantics, correct the previous exact-end expectation, and leave same-node move adapter and native object lifetimes explicitly unverified."
sections:
  Summary: |-
    Restore cut text hint reconstruction boundaries

    Port native CutImpl strict end-boundary and split attribute construction into existing cross-node MoveRange; preserve snapshot semantics, correct the previous exact-end expectation, and leave same-node move adapter and native object lifetimes explicitly unverified.
  Scope: "Six semantic paths: apps/office/src/sw/source/core/txtnode/ndhints.ts, apps/office/src/sw/source/core/doc/DocumentContentOperationsManager.ts, apps/office/src/sw/source/core/doc/text-hint-cut.test.ts, apps/office/src/sw/source/core/doc/text-hint-copy.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Existing cross-node MoveRange must reconstruct hints that cross the cut start or reach/cross its exclusive end, and retain flags only for hints starting inside with end strictly before cut end. Separate state snapshot slices from cut slices through a shared range helper. Correct only the prior exact-end move expectation in text-hint-copy.test.ts; all332 other prior tests byte-identical. Same-node move adapter, native object identity/refcounts/listeners, full split/join/destination expansion and registered I/O deviations remain outside this leaf and unverified. No network/outside-repo reads, source/helper/Python AP artifacts or upstream-dependent product tests."
  Plan: |-
    1. Add explicit SwpHints.sliceForCut sharing clipping validation with snapshot slice; port native CutImpl constructor-versus-retained flag predicate including strict end inequality.
    2. Use cut slices for actual cross-node MoveRange, retaining captured snapshots and existing same-node adapter behavior.
    3. Add app-owned literal boundary matrix for both hint families and all eight source flag masks, retained source/history/shared handles, plain text, invalid ranges and same-node adapter stability; correct the previous exact-end expectation only.
    4. Append bounded source/inventory clarification without promoting any of234 module fields/statuses/defaults/exceptions; no new runtime module.
    5. Run six static gates and one sequential absent build/app/inventory/scripts/Chromium profile, then restored source audits, exact scope/AP/native hashes and same-actor quality review; commit/finish leaf and parent progress.
  Verify Steps: |-
    1. Inspect pinned ndtxt.cxx CutImpl/CutText, txatbase.cxx constructors, thints.cxx MakeTextAttr/InsertHint and nodes.cxx MoveRange; record hashes and bounded conclusions only. Expected: strict end-before-cut retention, fresh split/equal-end hints, source snapshot integrity; same-node and full native object lifetimes unclaimed.
    2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:dependencies, npm run check:docs and npm run check:file-size. Expected: all pass.
    3. Rename vendor/libreoffice-reference inside repo and restore in finally. Run once sequentially: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Expected: all pass and both four-metric coverage totals100%; no upstream invocation. Repeat only failed gates/cases for recovery.
    4. After restoration run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Expected: all pass, semantic violations0.
    5. Audit exact six paths,333 prior test files with332 unchanged and the single source-supported exact-end expectation correction,234 existing runtime fields/statuses/defaults/exceptions retained except bounded justification appendices, ignored-inclusive source/helper-free AP; run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: no scope drift or new errors.
    6. Same-actor read-only EVALUATOR at exact semantic SHA, quality pass; CODER records verify/finish with separate verification and implementation hashes; clean final main, vendor restored, parent/goal remains active.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert task implementation/docs through a new traceable task without history rewrite. Restore vendor directory in finally and after interruption."
  Findings: "Native CutImpl uses strict hint end before cut end for retained flags; exact-end prior expectation is corrected. Initial format gate passed; lint found two missing JSDoc comments on new test-only Span/CutCase declarations. Add the comments and recover only lint, then run pending static gates and the single absent test profile. No production behavior, scope, verification criteria or upstream-dependent test change."
id_source: "generated"
---
## Summary

Restore cut text hint reconstruction boundaries

Port native CutImpl strict end-boundary and split attribute construction into existing cross-node MoveRange; preserve snapshot semantics, correct the previous exact-end expectation, and leave same-node move adapter and native object lifetimes explicitly unverified.

## Scope

Six semantic paths: apps/office/src/sw/source/core/txtnode/ndhints.ts, apps/office/src/sw/source/core/doc/DocumentContentOperationsManager.ts, apps/office/src/sw/source/core/doc/text-hint-cut.test.ts, apps/office/src/sw/source/core/doc/text-hint-copy.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Existing cross-node MoveRange must reconstruct hints that cross the cut start or reach/cross its exclusive end, and retain flags only for hints starting inside with end strictly before cut end. Separate state snapshot slices from cut slices through a shared range helper. Correct only the prior exact-end move expectation in text-hint-copy.test.ts; all332 other prior tests byte-identical. Same-node move adapter, native object identity/refcounts/listeners, full split/join/destination expansion and registered I/O deviations remain outside this leaf and unverified. No network/outside-repo reads, source/helper/Python AP artifacts or upstream-dependent product tests.

## Plan

1. Add explicit SwpHints.sliceForCut sharing clipping validation with snapshot slice; port native CutImpl constructor-versus-retained flag predicate including strict end inequality.
2. Use cut slices for actual cross-node MoveRange, retaining captured snapshots and existing same-node adapter behavior.
3. Add app-owned literal boundary matrix for both hint families and all eight source flag masks, retained source/history/shared handles, plain text, invalid ranges and same-node adapter stability; correct the previous exact-end expectation only.
4. Append bounded source/inventory clarification without promoting any of234 module fields/statuses/defaults/exceptions; no new runtime module.
5. Run six static gates and one sequential absent build/app/inventory/scripts/Chromium profile, then restored source audits, exact scope/AP/native hashes and same-actor quality review; commit/finish leaf and parent progress.

## Verify Steps

1. Inspect pinned ndtxt.cxx CutImpl/CutText, txatbase.cxx constructors, thints.cxx MakeTextAttr/InsertHint and nodes.cxx MoveRange; record hashes and bounded conclusions only. Expected: strict end-before-cut retention, fresh split/equal-end hints, source snapshot integrity; same-node and full native object lifetimes unclaimed.
2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:dependencies, npm run check:docs and npm run check:file-size. Expected: all pass.
3. Rename vendor/libreoffice-reference inside repo and restore in finally. Run once sequentially: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Expected: all pass and both four-metric coverage totals100%; no upstream invocation. Repeat only failed gates/cases for recovery.
4. After restoration run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Expected: all pass, semantic violations0.
5. Audit exact six paths,333 prior test files with332 unchanged and the single source-supported exact-end expectation correction,234 existing runtime fields/statuses/defaults/exceptions retained except bounded justification appendices, ignored-inclusive source/helper-free AP; run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: no scope drift or new errors.
6. Same-actor read-only EVALUATOR at exact semantic SHA, quality pass; CODER records verify/finish with separate verification and implementation hashes; clean final main, vendor restored, parent/goal remains active.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert task implementation/docs through a new traceable task without history rewrite. Restore vendor directory in finally and after interruption.

## Findings

Native CutImpl uses strict hint end before cut end for retained flags; exact-end prior expectation is corrected. Initial format gate passed; lint found two missing JSDoc comments on new test-only Span/CutCase declarations. Add the comments and recover only lint, then run pending static gates and the single absent test profile. No production behavior, scope, verification criteria or upstream-dependent test change.
