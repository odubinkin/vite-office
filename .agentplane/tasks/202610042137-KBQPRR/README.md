---
id: "202610042137-KBQPRR"
title: "Restore native ranged text attribute hierarchy"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on:
  - "202610042109-62D8VS"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T21:39:58.738Z"
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
    body: "Start: restore approved native attribute hierarchy/concrete nesting defaults and migrate supported ranged storage/factory/fixtures;verify once absent with failed-only recovery."
events:
  -
    type: "status"
    at: "2026-10-04T21:39:59.193Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore approved native attribute hierarchy/concrete nesting defaults and migrate supported ranged storage/factory/fixtures;verify once absent with failed-only recovery."
doc_version: 3
doc_updated_at: "2026-10-04T21:39:59.193Z"
doc_updated_by: "CODER"
description: "Iteration123 replaces the single generic ranged attribute with native SwTextAttr/SwTextAttrEnd/SwTextAttrNesting/SwTextINetFormat contracts and native locked nesting defaults. Migrate actual production constructors/factory/storage and range fixtures,add independent literal class/flag/copy/node tests,correct old expectations contradicted by concrete native INET defaults. One executable refactor leaf;no upstream execution or AP source/helpers;one absent suite profile only. Full reference-count/listener/empty hints and broader core/UI fidelity remain open."
sections:
  Summary: "Iteration123 restores actual ranged text attribute inheritance and native nesting defaults in the existing supported AUTO/INET core."
  Scope: |-
    apps/office/src/sw/browser/presentation/writer-style-modifier.test.tsx
    apps/office/src/sw/source/core/doc/automatic-style-handles.test.ts
    apps/office/src/sw/source/core/doc/owned-text-move.test.ts
    apps/office/src/sw/source/core/doc/text-hint-copy.test.ts
    apps/office/src/sw/source/core/doc/text-hint-cut.test.ts
    apps/office/src/sw/source/core/doc/writer-attributes.test.ts
    apps/office/src/sw/source/core/doc/writer-model.test.ts
    apps/office/src/sw/source/core/edit/edfcol-history.test.ts
    apps/office/src/sw/source/core/edit/edfcol-modifier.test.ts
    apps/office/src/sw/source/core/edit/edfcol-reset.test.ts
    apps/office/src/sw/source/core/txtnode/automatic-itemset-equality.test.ts
    apps/office/src/sw/source/core/txtnode/hint-owner-notifications.test.ts
    apps/office/src/sw/source/core/txtnode/hint-pool-ownership.test.ts
    apps/office/src/sw/source/core/txtnode/native-hint-order.test.ts
    apps/office/src/sw/source/core/txtnode/native-hyperlink-boundaries.test.ts
    apps/office/src/sw/source/core/txtnode/native-text-hint-update.test.ts
    apps/office/src/sw/source/core/txtnode/ndhints.ts
    apps/office/src/sw/source/core/txtnode/ndtxt-hint-update.ts
    apps/office/src/sw/source/core/txtnode/owned-hint-cut.test.ts
    apps/office/src/sw/source/core/txtnode/owned-hint-notifications.test.ts
    apps/office/src/sw/source/core/txtnode/owned-hyperlink-metadata.test.ts
    apps/office/src/sw/source/core/txtnode/secondary-hint-maps.test.ts
    apps/office/src/sw/source/core/txtnode/secondary-hint-transfer.test.ts
    apps/office/src/sw/source/core/txtnode/thints.ts
    apps/office/src/sw/source/core/txtnode/txatbase.ts
    apps/office/src/sw/source/core/txtnode/txtedt-replacement.test.ts
    apps/office/src/sw/source/core/txtnode/txtedt-selective.test.ts
    apps/office/src/sw/source/core/txtnode/txtedt-stylepool.test.ts
    apps/office/src/sw/source/core/txtnode/fmtatr2.ts
    apps/office/src/sw/source/core/txtnode/txtatr2.ts
    apps/office/src/sw/source/core/txtnode/text-attribute-hierarchy.test.ts
    apps/office/src/sw/source/core/txtnode/nesting-attribute-ownership.test.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Restore native SwTextAttr base with protected two-argument constructor,optional end/default no-end contract,native start and twelve private flag fields/accessors;SwTextAttrEnd owns ranged end notifications and existing range projections;SwTextAttrNesting sets DontExpand/lock/DontExpandStart/nesting true;SwTextINetFormat in source-owned txtatr2.ts adds char-format flag and item text-attribute backlink. Preserve existing typed range/snapshot adapter via concrete ranged clone with all independent flags;MakeTextAttr returns SwTextAttrEnd forAUTO and concrete SwTextINetFormat forINET,including same/foreign copies. Migrate all production range types/constructors and old range fixtures to SwTextAttrEnd;native INET production construction uses concrete class. Correct previous native-invalid false INET fresh-copy/nesting expectations based on pinned constructors;do not weaken geometry/ownership/metadata assertions. Remove native-invalid SetEnd range-order rejection while retaining typed JS integer boundary guards;native temporary start/end writes allowed. Add independent literal hierarchy/default/lock/unlock/coordinate/flags/item-backlink/snapshot/copy/cut/node/undo cases and compile-level visibility checks. Scope includes existing28SwTextAttrreferencing files,fmtratr2,newtxtatr2/two newtests/two manifests;any additional necessity is re-evaluated before mutation. Existing235runtime statuses/defaults/exceptions preserved;bounded appendices/symbol responsibilities plus one new unverified native module. Native holders/refcounts/listeners,full ChgTextNode/style/client integration,empty-hint retention/full nesting insertion/complete modes/graph nondefault unsupported flags/other concrete families remain unverified;no broad parity promotion. Static gates first;once sequential absent build/app/inventory/scripts/Chromium with coverage.reportOnFailure/finallyrestore;only failed gates/cases recover;no concurrent source/scope/APaudit while absent suites. Restored five source audits,scope/testchange/native hashes/sourcefree AP/doctor/routing/exact-SHA same-actor quality,CODERverify/finish;parent/goal active. No network/upstream execution or source/helper/probe artifacts."
  Verify Steps: |-
    1. Inspect pinned txatbase.hxx/txatbase.cxx/txtatr2.cxx/txtinet.hxx/fmtinfmt.hxx and MakeTextAttr native construction. Record only English prose/hashes. Expected actual native base/end/nesting/INET types,flags defaults and locked-end behavior,item backlink,copies fresh nativeflags,snapshots independent supported state. Compare every changed old assertion to concrete native responsibility;preserve other range/value/index/ownership checks.
    2. Run npm run format:check,npm run lint,npm run typecheck,npm run check:dependencies,npm run check:docs,npm run check:file-size. All pass;keep authored files below1000physical lines.
    3. Rename vendor/libreoffice-reference inside repo and restore in finally;run once sequentially npm run test:static;npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure;npm run test:inventory:coverage -- --coverage.reportOnFailure;npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts;npm exec -- playwright test --config apps/office/playwright.config.ts. All pass,app/inventory100%fourmetrics. Only failed cases/gates replay,no full passing suite/build repeat,no present-profile duplicate/no concurrent audits.
    4. After restoration run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check;npm run check:source-tree;npm run check:source-provenance;npm run inventory:invariants;npm run inventory:parity. All pass,semantic0.
    5. Audit exact approved paths,all345prior tests accounted for as unchanged or explicit ranged-type/native-flag/end-contract corrections,all235existingruntime fields/statuses/defaults/exceptions unchanged except approved concrete responsibility/symbol appendices;one unverified source-ownedtxtatr2module. Record nativehashes/sourcefree ignored-inclusive APscan;ap doctor,node .agentplane/policy/check-routing.mjs pass without new errors.
    6. Same-actor read-only EVALUATOR exact semantic SHA quality pass,CODERverify/finish separate hashes,clean main/vendor restored,parent goalactive. Broad core/UI compliance remains unproven.
  Verification: "Pending implementation and declared verification."
  Rollback Plan: "Revert only the eventual semantic commit via a new follow-up task;no history rewrite or DONE artifact mutation."
  Findings: "Previous122 turn was verified progress. Preflight123:clean main/base 0a573ab128f10dfbb1cd3c061d8759646a49d841,only parentDOING;direct workflow,4matchedpolicies,user instructions absent. Native SwTextAttrNesting constructor sets DontExpand(true),lock(true),DontExpandStart(true),nesting(true);SwTextINetFormat adds char-format flag/item backlink. Generic current range/FALSE INETcopy assumptions contradict native constructors and require actual hierarchy/factory correction. No tests/build run123;no external blocker,no network."
id_source: "generated"
---
## Summary

Iteration123 restores actual ranged text attribute inheritance and native nesting defaults in the existing supported AUTO/INET core.

## Scope

apps/office/src/sw/browser/presentation/writer-style-modifier.test.tsx
apps/office/src/sw/source/core/doc/automatic-style-handles.test.ts
apps/office/src/sw/source/core/doc/owned-text-move.test.ts
apps/office/src/sw/source/core/doc/text-hint-copy.test.ts
apps/office/src/sw/source/core/doc/text-hint-cut.test.ts
apps/office/src/sw/source/core/doc/writer-attributes.test.ts
apps/office/src/sw/source/core/doc/writer-model.test.ts
apps/office/src/sw/source/core/edit/edfcol-history.test.ts
apps/office/src/sw/source/core/edit/edfcol-modifier.test.ts
apps/office/src/sw/source/core/edit/edfcol-reset.test.ts
apps/office/src/sw/source/core/txtnode/automatic-itemset-equality.test.ts
apps/office/src/sw/source/core/txtnode/hint-owner-notifications.test.ts
apps/office/src/sw/source/core/txtnode/hint-pool-ownership.test.ts
apps/office/src/sw/source/core/txtnode/native-hint-order.test.ts
apps/office/src/sw/source/core/txtnode/native-hyperlink-boundaries.test.ts
apps/office/src/sw/source/core/txtnode/native-text-hint-update.test.ts
apps/office/src/sw/source/core/txtnode/ndhints.ts
apps/office/src/sw/source/core/txtnode/ndtxt-hint-update.ts
apps/office/src/sw/source/core/txtnode/owned-hint-cut.test.ts
apps/office/src/sw/source/core/txtnode/owned-hint-notifications.test.ts
apps/office/src/sw/source/core/txtnode/owned-hyperlink-metadata.test.ts
apps/office/src/sw/source/core/txtnode/secondary-hint-maps.test.ts
apps/office/src/sw/source/core/txtnode/secondary-hint-transfer.test.ts
apps/office/src/sw/source/core/txtnode/thints.ts
apps/office/src/sw/source/core/txtnode/txatbase.ts
apps/office/src/sw/source/core/txtnode/txtedt-replacement.test.ts
apps/office/src/sw/source/core/txtnode/txtedt-selective.test.ts
apps/office/src/sw/source/core/txtnode/txtedt-stylepool.test.ts
apps/office/src/sw/source/core/txtnode/fmtatr2.ts
apps/office/src/sw/source/core/txtnode/txtatr2.ts
apps/office/src/sw/source/core/txtnode/text-attribute-hierarchy.test.ts
apps/office/src/sw/source/core/txtnode/nesting-attribute-ownership.test.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Restore native SwTextAttr base with protected two-argument constructor,optional end/default no-end contract,native start and twelve private flag fields/accessors;SwTextAttrEnd owns ranged end notifications and existing range projections;SwTextAttrNesting sets DontExpand/lock/DontExpandStart/nesting true;SwTextINetFormat in source-owned txtatr2.ts adds char-format flag and item text-attribute backlink. Preserve existing typed range/snapshot adapter via concrete ranged clone with all independent flags;MakeTextAttr returns SwTextAttrEnd forAUTO and concrete SwTextINetFormat forINET,including same/foreign copies. Migrate all production range types/constructors and old range fixtures to SwTextAttrEnd;native INET production construction uses concrete class. Correct previous native-invalid false INET fresh-copy/nesting expectations based on pinned constructors;do not weaken geometry/ownership/metadata assertions. Remove native-invalid SetEnd range-order rejection while retaining typed JS integer boundary guards;native temporary start/end writes allowed. Add independent literal hierarchy/default/lock/unlock/coordinate/flags/item-backlink/snapshot/copy/cut/node/undo cases and compile-level visibility checks. Scope includes existing28SwTextAttrreferencing files,fmtratr2,newtxtatr2/two newtests/two manifests;any additional necessity is re-evaluated before mutation. Existing235runtime statuses/defaults/exceptions preserved;bounded appendices/symbol responsibilities plus one new unverified native module. Native holders/refcounts/listeners,full ChgTextNode/style/client integration,empty-hint retention/full nesting insertion/complete modes/graph nondefault unsupported flags/other concrete families remain unverified;no broad parity promotion. Static gates first;once sequential absent build/app/inventory/scripts/Chromium with coverage.reportOnFailure/finallyrestore;only failed gates/cases recover;no concurrent source/scope/APaudit while absent suites. Restored five source audits,scope/testchange/native hashes/sourcefree AP/doctor/routing/exact-SHA same-actor quality,CODERverify/finish;parent/goal active. No network/upstream execution or source/helper/probe artifacts.

## Verify Steps

1. Inspect pinned txatbase.hxx/txatbase.cxx/txtatr2.cxx/txtinet.hxx/fmtinfmt.hxx and MakeTextAttr native construction. Record only English prose/hashes. Expected actual native base/end/nesting/INET types,flags defaults and locked-end behavior,item backlink,copies fresh nativeflags,snapshots independent supported state. Compare every changed old assertion to concrete native responsibility;preserve other range/value/index/ownership checks.
2. Run npm run format:check,npm run lint,npm run typecheck,npm run check:dependencies,npm run check:docs,npm run check:file-size. All pass;keep authored files below1000physical lines.
3. Rename vendor/libreoffice-reference inside repo and restore in finally;run once sequentially npm run test:static;npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure;npm run test:inventory:coverage -- --coverage.reportOnFailure;npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts;npm exec -- playwright test --config apps/office/playwright.config.ts. All pass,app/inventory100%fourmetrics. Only failed cases/gates replay,no full passing suite/build repeat,no present-profile duplicate/no concurrent audits.
4. After restoration run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check;npm run check:source-tree;npm run check:source-provenance;npm run inventory:invariants;npm run inventory:parity. All pass,semantic0.
5. Audit exact approved paths,all345prior tests accounted for as unchanged or explicit ranged-type/native-flag/end-contract corrections,all235existingruntime fields/statuses/defaults/exceptions unchanged except approved concrete responsibility/symbol appendices;one unverified source-ownedtxtatr2module. Record nativehashes/sourcefree ignored-inclusive APscan;ap doctor,node .agentplane/policy/check-routing.mjs pass without new errors.
6. Same-actor read-only EVALUATOR exact semantic SHA quality pass,CODERverify/finish separate hashes,clean main/vendor restored,parent goalactive. Broad core/UI compliance remains unproven.

## Verification

Pending implementation and declared verification.

## Rollback Plan

Revert only the eventual semantic commit via a new follow-up task;no history rewrite or DONE artifact mutation.

## Findings

Previous122 turn was verified progress. Preflight123:clean main/base 0a573ab128f10dfbb1cd3c061d8759646a49d841,only parentDOING;direct workflow,4matchedpolicies,user instructions absent. Native SwTextAttrNesting constructor sets DontExpand(true),lock(true),DontExpandStart(true),nesting(true);SwTextINetFormat adds char-format flag/item backlink. Generic current range/FALSE INETcopy assumptions contradict native constructors and require actual hierarchy/factory correction. No tests/build run123;no external blocker,no network.
