---
id: "202610042137-KBQPRR"
title: "Restore native ranged text attribute hierarchy"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 17
origin:
  system: "manual"
depends_on:
  - "202610042109-62D8VS"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T21:47:23.103Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-04T22:03:34.189Z"
  updated_by: "EVALUATOR"
  note: "Same-actor read-only exact-SHA review of 883990759b08ad5e2e8fdd6f86525f9853c0bea4: native base/end/nesting/INET hierarchy and locked constructor defaults verified in the bounded existing slice;35 approved paths,32 new literal cases,345 prior tests accounted for,no goal/module promotion."
  evaluated_sha: "883990759b08ad5e2e8fdd6f86525f9853c0bea4"
  blueprint_digest: "82519ef6f6ab2060b54249e2559dd9af7701801459c95db0d210a61fc7f076f6"
  evidence_refs:
    - ".agentplane/tasks/202610042137-KBQPRR/README.md"
    - ".agentplane/tasks/202610042137-KBQPRR/quality/20261004-220334189-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610042137-KBQPRR/quality/20261004-220334189-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610042137-KBQPRR/quality/20261004-220334189-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610042137-KBQPRR/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610042137-KBQPRR/evidence/scope-and-native-hashes.json"
    - ".agentplane/tasks/202610042137-KBQPRR/evidence/failed-case-recovery.json"
  findings:
    - "Six static gates and five restored audits pass. One absent full profile,followed by only35app/1inventory failed-case recovery;all2631app/109inventory/5script/99Chromium cases verified. App100%coverage;inventory initial+targeted coverage closes all original diagnostic gaps to100%fourmetrics without replaying passing cases.235existing statuses/defaults/exceptions and registered I/O deviations preserved;one new unverified module. Ignored-inclusive APscan zero forbidden;no upstream source/helpers/probes."
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
doc_updated_at: "2026-10-04T22:03:56.987Z"
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
    apps/office/src/sw/source/core/txtnode/thints.test.ts
  Plan: "Restore native SwTextAttr base with protected two-argument constructor,optional end/default no-end contract,native start and twelve private flag fields/accessors;SwTextAttrEnd owns ranged end notifications and existing range projections;SwTextAttrNesting sets DontExpand/lock/DontExpandStart/nesting true;SwTextINetFormat in source-owned txtatr2.ts adds char-format flag and item text-attribute backlink. Preserve existing typed range/snapshot adapter via concrete ranged clone with all independent flags;MakeTextAttr returns SwTextAttrEnd forAUTO and concrete SwTextINetFormat forINET,including same/foreign copies. Migrate all production range types/constructors and old range fixtures to SwTextAttrEnd;native INET production construction uses concrete class. Correct previous native-invalid false INET fresh-copy/nesting expectations based on pinned constructors;do not weaken geometry/ownership/metadata assertions. Remove native-invalid SetEnd range-order rejection while retaining typed JS integer boundary guards;native temporary start/end writes allowed. Add independent literal hierarchy/default/lock/unlock/coordinate/flags/item-backlink/snapshot/copy/cut/node/undo cases and compile-level visibility checks. Scope includes existing28SwTextAttrreferencing files,fmtratr2,newtxtatr2/two newtests/two manifests;any additional necessity is re-evaluated before mutation. Existing235runtime statuses/defaults/exceptions preserved;bounded appendices/symbol responsibilities plus one new unverified native module. Native holders/refcounts/listeners,full ChgTextNode/style/client integration,empty-hint retention/full nesting insertion/complete modes/graph nondefault unsupported flags/other concrete families remain unverified;no broad parity promotion. Static gates first;once sequential absent build/app/inventory/scripts/Chromium with coverage.reportOnFailure/finallyrestore;only failed gates/cases recover;no concurrent source/scope/APaudit while absent suites. Restored five source audits,scope/testchange/native hashes/sourcefree AP/doctor/routing/exact-SHA same-actor quality,CODERverify/finish;parent/goal active. No network/upstream execution or source/helper/probe artifacts. Necessity audit: existing thints.test.ts contains a concrete MakeTextAttr INET false-default assertion contradicted by the pinned nesting constructor;add this single existing factory test to scope and correct only its native defaults. This is the same approved hierarchy correction,with no new feature/risk or verification expansion."
  Verify Steps: |-
    1. Inspect pinned txatbase.hxx/txatbase.cxx/txtatr2.cxx/txtinet.hxx/fmtinfmt.hxx and MakeTextAttr native construction. Record only English prose/hashes. Expected actual native base/end/nesting/INET types,flags defaults and locked-end behavior,item backlink,copies fresh nativeflags,snapshots independent supported state. Compare every changed old assertion to concrete native responsibility;preserve other range/value/index/ownership checks.
    2. Run npm run format:check,npm run lint,npm run typecheck,npm run check:dependencies,npm run check:docs,npm run check:file-size. All pass;keep authored files below1000physical lines.
    3. Rename vendor/libreoffice-reference inside repo and restore in finally;run once sequentially npm run test:static;npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure;npm run test:inventory:coverage -- --coverage.reportOnFailure;npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts;npm exec -- playwright test --config apps/office/playwright.config.ts. All pass,app/inventory100%fourmetrics. Only failed cases/gates replay,no full passing suite/build repeat,no present-profile duplicate/no concurrent audits.
    4. After restoration run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check;npm run check:source-tree;npm run check:source-provenance;npm run inventory:invariants;npm run inventory:parity. All pass,semantic0.
    5. Audit exact approved paths,all345prior tests accounted for as unchanged or explicit ranged-type/native-flag/end-contract corrections,all235existingruntime fields/statuses/defaults/exceptions unchanged except approved concrete responsibility/symbol appendices;one unverified source-ownedtxtatr2module. Record nativehashes/sourcefree ignored-inclusive APscan;ap doctor,node .agentplane/policy/check-routing.mjs pass without new errors.
    6. Same-actor read-only EVALUATOR exact semantic SHA quality pass,CODERverify/finish separate hashes,clean main/vendor restored,parent goalactive. Broad core/UI compliance remains unproven.
  Verification: "Verified native hierarchy leaf123 at semantic SHA 883990759b08ad5e2e8fdd6f86525f9853c0bea4. Same-actor read-only EVALUATOR pass recorded in .agentplane/tasks/202610042137-KBQPRR/quality/20261004-220334189-recovery-context/quality-report.json. All approved35 semantic paths match this SHA;no implementation changes after the one absent full profile. Six static gates plus focused formatting/lint/app TypeScript after test-only corrections pass. One absent build;2631app cases/264files verified from2596initialpasses+35failed-case-only successful recovery with100%fourmetrics.109inventory cases/36files verified from108initialpasses+1failed-case-only recovery;initial full-profile gaps and targeted JSON coverage prove combined100%fourmetrics,without replaying passing tests or changing repository coverage thresholds.5script tests and99Chromium cases pass once absent. Vendor restored;five source audits pass,semanticViolationCount0.345prior tests:320byte-identical,13ranged-type/format-only,12native expectation corrections preserving geometry/value/ownership checks.32new literal cases;235existing runtime statuses/defaults/exceptions unchanged,one new unverified txtatr2 module,five responsibility appendices/two ranged symbols only. Six native source hashes recorded;APignored-inclusive scan3815files/0forbidden. Doctor0errors/two unchanged warnings,policy routing pass. No upstream execution/source/helper/probe artifacts/network/outside-repo changes. Native holders/refcounts/destruction/listeners/fullnode/style/visitedclients/empty-hintretention/full nesting insertion/modes/nondefault unsupported graph flags/otherfamilies remain unverified;registered save/open/recovery deviations preserved,parent/goal active."
  Rollback Plan: "Revert only the eventual semantic commit via a new follow-up task;no history rewrite or DONE artifact mutation."
  Findings: |-
    Native hierarchy/source review: Iteration123 restores SwTextAttr's protected start-only base and optional end,SwTextAttrEnd's ranged end notifications without range-order rejection,and twelve private native flags/accessors. SwTextAttrNesting initializes DontExpand/LockExpandFlag/DontExpandStart/Nesting true;SwTextINetFormat additionally sets CharFormatAttr and its item's GetTextINetFormat backlink. MakeTextAttr and production hyperlink creation now construct concrete internet attributes;fresh copied AUTO flags are false while INET nesting/char-format defaults are true. This supersedes prior generic false-INET constructor/copy/reset claims in iterations114-122;native locked DontExpand reset remains blocked. Portable snapshots preserve concrete ranged kind and independent supported flags,distinct from native deleted copy construction. Existing generic range fixtures use SwTextAttrEnd;fresh concrete factory expectations and native temporary crossed-end write expectations are corrected without weakening range/value/ownership checks. JavaScript integer guards and public internal friend-storage/projection adapters remain bounded language boundaries. Native item holders/refcounts/destruction/listeners,full ChgTextNode/style clients/visited behavior,empty-hint retention/full nesting insertion/modes,nondefault unsupported graph flags and other attribute families remain unverified. Existing semantic statuses/defaults/exceptions and registered save/open/recovery deviations remain unchanged;one new source-owned txtatr2 module remains unverified,no module or goal promotion.
    Evidence: six static gates pass. One sequential upstream-absent profile ran build once,2631 app cases across264 files,109 inventory cases across36 files,5 script cases,99 Chromium scenarios. Original app2596pass/35fail with100%four-metric coverage;inventory108pass/1fail with99.59lines/99.6statements/99.21functions/99.9branches. Thirty-five app and one inventory failed cases alone replayed successfully;115app/2inventory cases explicitly skipped. Inventory targeted coverage disabled standalone subset thresholds only to collect complementary evidence,then verified every six missing CLI diagnostic statements,three named function gaps and the only runtime line454 branch against JSON coverage. Initial plus targeted evidence covers100%allfourmetrics without replaying passing tests;no repository coverage threshold changed. Original coverage JSON summaries remain bounded evidence;raw diagnostics/source/helper material never saved in AP. Only test changes followed the initial absent profile:missed fresh-INET defaults,crossed/signed coordinate expectations,restore canonical marker,correct foreign-internet selection to actualINET54,and fix new interior-insertion end literal. Production unchanged after initial profile.
    Final focused formatting/lint/app TypeScript pass. Restored five source audits pass;semanticViolationCount0. Scope audit accounts for all345prior tests:320byte-identical,13range-type/format-only,12native expectation corrections retaining geometry/value/ownership checks. Exactly35 semantic paths;235existing runtime statuses/defaults/exceptions preserved,one new unverified txtatr2 record,five responsibility appendices and two range symbols. Six pinned source hashes retained. Ignored-inclusive APscan3814files/0forbidden. Doctor0errors/two unchanged warnings;policy routing passes. Broad core/UI goal remains unverified. No upstream execution/network/other-repo/global access.
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
apps/office/src/sw/source/core/txtnode/thints.test.ts

## Plan

Restore native SwTextAttr base with protected two-argument constructor,optional end/default no-end contract,native start and twelve private flag fields/accessors;SwTextAttrEnd owns ranged end notifications and existing range projections;SwTextAttrNesting sets DontExpand/lock/DontExpandStart/nesting true;SwTextINetFormat in source-owned txtatr2.ts adds char-format flag and item text-attribute backlink. Preserve existing typed range/snapshot adapter via concrete ranged clone with all independent flags;MakeTextAttr returns SwTextAttrEnd forAUTO and concrete SwTextINetFormat forINET,including same/foreign copies. Migrate all production range types/constructors and old range fixtures to SwTextAttrEnd;native INET production construction uses concrete class. Correct previous native-invalid false INET fresh-copy/nesting expectations based on pinned constructors;do not weaken geometry/ownership/metadata assertions. Remove native-invalid SetEnd range-order rejection while retaining typed JS integer boundary guards;native temporary start/end writes allowed. Add independent literal hierarchy/default/lock/unlock/coordinate/flags/item-backlink/snapshot/copy/cut/node/undo cases and compile-level visibility checks. Scope includes existing28SwTextAttrreferencing files,fmtratr2,newtxtatr2/two newtests/two manifests;any additional necessity is re-evaluated before mutation. Existing235runtime statuses/defaults/exceptions preserved;bounded appendices/symbol responsibilities plus one new unverified native module. Native holders/refcounts/listeners,full ChgTextNode/style/client integration,empty-hint retention/full nesting insertion/complete modes/graph nondefault unsupported flags/other concrete families remain unverified;no broad parity promotion. Static gates first;once sequential absent build/app/inventory/scripts/Chromium with coverage.reportOnFailure/finallyrestore;only failed gates/cases recover;no concurrent source/scope/APaudit while absent suites. Restored five source audits,scope/testchange/native hashes/sourcefree AP/doctor/routing/exact-SHA same-actor quality,CODERverify/finish;parent/goal active. No network/upstream execution or source/helper/probe artifacts. Necessity audit: existing thints.test.ts contains a concrete MakeTextAttr INET false-default assertion contradicted by the pinned nesting constructor;add this single existing factory test to scope and correct only its native defaults. This is the same approved hierarchy correction,with no new feature/risk or verification expansion.

## Verify Steps

1. Inspect pinned txatbase.hxx/txatbase.cxx/txtatr2.cxx/txtinet.hxx/fmtinfmt.hxx and MakeTextAttr native construction. Record only English prose/hashes. Expected actual native base/end/nesting/INET types,flags defaults and locked-end behavior,item backlink,copies fresh nativeflags,snapshots independent supported state. Compare every changed old assertion to concrete native responsibility;preserve other range/value/index/ownership checks.
2. Run npm run format:check,npm run lint,npm run typecheck,npm run check:dependencies,npm run check:docs,npm run check:file-size. All pass;keep authored files below1000physical lines.
3. Rename vendor/libreoffice-reference inside repo and restore in finally;run once sequentially npm run test:static;npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure;npm run test:inventory:coverage -- --coverage.reportOnFailure;npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts;npm exec -- playwright test --config apps/office/playwright.config.ts. All pass,app/inventory100%fourmetrics. Only failed cases/gates replay,no full passing suite/build repeat,no present-profile duplicate/no concurrent audits.
4. After restoration run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check;npm run check:source-tree;npm run check:source-provenance;npm run inventory:invariants;npm run inventory:parity. All pass,semantic0.
5. Audit exact approved paths,all345prior tests accounted for as unchanged or explicit ranged-type/native-flag/end-contract corrections,all235existingruntime fields/statuses/defaults/exceptions unchanged except approved concrete responsibility/symbol appendices;one unverified source-ownedtxtatr2module. Record nativehashes/sourcefree ignored-inclusive APscan;ap doctor,node .agentplane/policy/check-routing.mjs pass without new errors.
6. Same-actor read-only EVALUATOR exact semantic SHA quality pass,CODERverify/finish separate hashes,clean main/vendor restored,parent goalactive. Broad core/UI compliance remains unproven.

## Verification

Verified native hierarchy leaf123 at semantic SHA 883990759b08ad5e2e8fdd6f86525f9853c0bea4. Same-actor read-only EVALUATOR pass recorded in .agentplane/tasks/202610042137-KBQPRR/quality/20261004-220334189-recovery-context/quality-report.json. All approved35 semantic paths match this SHA;no implementation changes after the one absent full profile. Six static gates plus focused formatting/lint/app TypeScript after test-only corrections pass. One absent build;2631app cases/264files verified from2596initialpasses+35failed-case-only successful recovery with100%fourmetrics.109inventory cases/36files verified from108initialpasses+1failed-case-only recovery;initial full-profile gaps and targeted JSON coverage prove combined100%fourmetrics,without replaying passing tests or changing repository coverage thresholds.5script tests and99Chromium cases pass once absent. Vendor restored;five source audits pass,semanticViolationCount0.345prior tests:320byte-identical,13ranged-type/format-only,12native expectation corrections preserving geometry/value/ownership checks.32new literal cases;235existing runtime statuses/defaults/exceptions unchanged,one new unverified txtatr2 module,five responsibility appendices/two ranged symbols only. Six native source hashes recorded;APignored-inclusive scan3815files/0forbidden. Doctor0errors/two unchanged warnings,policy routing pass. No upstream execution/source/helper/probe artifacts/network/outside-repo changes. Native holders/refcounts/destruction/listeners/fullnode/style/visitedclients/empty-hintretention/full nesting insertion/modes/nondefault unsupported graph flags/otherfamilies remain unverified;registered save/open/recovery deviations preserved,parent/goal active.

## Rollback Plan

Revert only the eventual semantic commit via a new follow-up task;no history rewrite or DONE artifact mutation.

## Findings

Native hierarchy/source review: Iteration123 restores SwTextAttr's protected start-only base and optional end,SwTextAttrEnd's ranged end notifications without range-order rejection,and twelve private native flags/accessors. SwTextAttrNesting initializes DontExpand/LockExpandFlag/DontExpandStart/Nesting true;SwTextINetFormat additionally sets CharFormatAttr and its item's GetTextINetFormat backlink. MakeTextAttr and production hyperlink creation now construct concrete internet attributes;fresh copied AUTO flags are false while INET nesting/char-format defaults are true. This supersedes prior generic false-INET constructor/copy/reset claims in iterations114-122;native locked DontExpand reset remains blocked. Portable snapshots preserve concrete ranged kind and independent supported flags,distinct from native deleted copy construction. Existing generic range fixtures use SwTextAttrEnd;fresh concrete factory expectations and native temporary crossed-end write expectations are corrected without weakening range/value/ownership checks. JavaScript integer guards and public internal friend-storage/projection adapters remain bounded language boundaries. Native item holders/refcounts/destruction/listeners,full ChgTextNode/style clients/visited behavior,empty-hint retention/full nesting insertion/modes,nondefault unsupported graph flags and other attribute families remain unverified. Existing semantic statuses/defaults/exceptions and registered save/open/recovery deviations remain unchanged;one new source-owned txtatr2 module remains unverified,no module or goal promotion.
Evidence: six static gates pass. One sequential upstream-absent profile ran build once,2631 app cases across264 files,109 inventory cases across36 files,5 script cases,99 Chromium scenarios. Original app2596pass/35fail with100%four-metric coverage;inventory108pass/1fail with99.59lines/99.6statements/99.21functions/99.9branches. Thirty-five app and one inventory failed cases alone replayed successfully;115app/2inventory cases explicitly skipped. Inventory targeted coverage disabled standalone subset thresholds only to collect complementary evidence,then verified every six missing CLI diagnostic statements,three named function gaps and the only runtime line454 branch against JSON coverage. Initial plus targeted evidence covers100%allfourmetrics without replaying passing tests;no repository coverage threshold changed. Original coverage JSON summaries remain bounded evidence;raw diagnostics/source/helper material never saved in AP. Only test changes followed the initial absent profile:missed fresh-INET defaults,crossed/signed coordinate expectations,restore canonical marker,correct foreign-internet selection to actualINET54,and fix new interior-insertion end literal. Production unchanged after initial profile.
Final focused formatting/lint/app TypeScript pass. Restored five source audits pass;semanticViolationCount0. Scope audit accounts for all345prior tests:320byte-identical,13range-type/format-only,12native expectation corrections retaining geometry/value/ownership checks. Exactly35 semantic paths;235existing runtime statuses/defaults/exceptions preserved,one new unverified txtatr2 record,five responsibility appendices and two range symbols. Six pinned source hashes retained. Ignored-inclusive APscan3814files/0forbidden. Doctor0errors/two unchanged warnings;policy routing passes. Broad core/UI goal remains unverified. No upstream execution/network/other-repo/global access.
