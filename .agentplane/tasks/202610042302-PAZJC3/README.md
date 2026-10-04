---
id: "202610042302-PAZJC3"
title: "Restore the hyperlink document-pool style default"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "ap doctor"
  - "node .agentplane/policy/check-routing.mjs"
  - "npm exec -- playwright test --config apps/office/playwright.config.ts"
  - "npm exec -- tsx scripts/generate-writer-ui-resources.ts --check"
  - "npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts"
  - "npm run check:dependencies"
  - "npm run check:docs"
  - "npm run check:file-size"
  - "npm run check:source-provenance"
  - "npm run check:source-tree"
  - "npm run format:check"
  - "npm run inventory:invariants"
  - "npm run inventory:parity"
  - "npm run lint"
  - "npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure"
  - "npm run test:inventory:coverage -- --coverage.reportOnFailure"
  - "npm run test:static"
  - "npm run typecheck"
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T23:03:15.912Z"
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
  updated_at: "2026-10-04T23:13:45.430Z"
  updated_by: "EVALUATOR"
  note: "Same-actor read-only review of exact semantic SHA e91ad56567462e07507c301f96d2ff21b5e9c120 passes the bounded styled internet document-pool default/IDs slice;no independent-agent or whole parity claim."
  evaluated_sha: "e91ad56567462e07507c301f96d2ff21b5e9c120"
  blueprint_digest: "c586f544347c39b4e7e3c874ec71d9d83512c2934636ca2981c0326f52557e0c"
  evidence_refs:
    - ".agentplane/tasks/202610042302-PAZJC3/README.md"
    - ".agentplane/tasks/202610042302-PAZJC3/quality/20261004-231345430-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610042302-PAZJC3/quality/20261004-231345430-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610042302-PAZJC3/quality/20261004-231345430-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610042302-PAZJC3/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610042302-PAZJC3/evidence/scope-and-native-hashes.json"
    - ".agentplane/tasks/202610042302-PAZJC3/evidence/absent-profile.json"
    - ".agentplane/tasks/202610042302-PAZJC3/evidence/restored-source-audits.json"
    - "exact semantic SHA e91ad56567462e07507c301f96d2ff21b5e9c120"
  findings:
    - "Reviewed all nine committed semantic paths against approved scope and independent literal cases. All350 prior tests byte-identical;237prior states/defaults/exceptions and manifest fields retained except four bounded appendices;new mapper wholly unverified. Native zero and styled defaults differ as pinned init.cxx requires;copy/equality retain both IDs;default registration is independent of browser codecs and unknown snapshots still reject. Six static gates pass with failed-lint-only correction;one absent five-gate profile passes2680/109/5/99 and coverage100%,no test replays;five restored audits semantic0. Seven native hashes checked;ignored-inclusive3844APfiles/0forbidden;doctor0errors/two unchanged warnings/routingpass."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: restore styled hyperlink pool default, independent native IDs and optional snapshot factory within nine paths."
events:
  -
    type: "status"
    at: "2026-10-04T23:03:16.360Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore styled hyperlink pool default, independent native IDs and optional snapshot factory within nine paths."
doc_version: 3
doc_updated_at: "2026-10-04T23:14:35.992Z"
doc_updated_by: "CODER"
description: "Restore the existing RES_TXTATR_INETFMT document-pool default through native URL/target constructor, distinct from zero CreateDefault. Add native ZERO/CHR_INET_NORMAL/CHR_INET_VISIT pool IDs, normal/visited ID storage/getters/paired setters, copy and equality. Add bounded source-owned SwStyleNameMapper.GetUIName(poolId,fallback) for two English internet resources; all other/localized families remain unverified. Keep portable DTO ingestion semantics separate and unchanged; active-link DTO migration and XML UI/programmatic name conversion remain later obligations. Decouple SfxItemPool default registration from optional browser snapshot factory; register new SwFormatINetFormat(emptyURL,emptyTarget) in real SwAttrPool without fabricated generic JSON restore. Existing specialized internet snapshot codec remains separate. Add two independent literal test files covering defaults/IDs/names/copy/backlinks/equality/setters/actual document-node-item-set lookup, inheritance/direct clear, registry ownership/duplicate/missing restore/existing factory. All350 prior test files byte-identical. Append bounded responsibility notes to four existing manifest rows and register one new unverified mapper module, preserving all237 prior states/defaults/exceptions and I/O deviations. Run six static gates then one sequential five-suite absent-reference profile with finally restoration; only failed gates/cases repeat. Five source audits after restoration; scope/native hashes/ignored-inclusive artifact checks; same-actor readonly exact-SHA EVALUATOR and doctor/routing; verified canonical finish with concrete result. No full native style resolution, UNO/macros/broadcaster/client lifetime, global registry or whole-core/UI parity claim."
sections:
  Summary: "Restore the hyperlink document-pool style default."
  Scope: |-
    - apps/office/src/sw/source/core/txtnode/fmtatr2.ts
    - apps/office/src/sw/inc/poolfmt.ts
    - apps/office/src/svl/source/items/itempool.ts
    - apps/office/src/sw/source/core/attr/swatrset.ts
    - apps/office/src/sw/source/core/doc/SwStyleNameMapper.ts
    - apps/office/src/sw/source/core/attr/internet-pool-default.test.ts
    - apps/office/src/svl/source/items/itempool-default-registration.test.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
  Plan: "Restore the existing RES_TXTATR_INETFMT document-pool default through native URL/target constructor, distinct from zero CreateDefault. Add native ZERO/CHR_INET_NORMAL/CHR_INET_VISIT pool IDs, normal/visited ID storage/getters/paired setters, copy and equality. Add bounded source-owned SwStyleNameMapper.GetUIName(poolId,fallback) for two English internet resources; all other/localized families remain unverified. Keep portable DTO ingestion semantics separate and unchanged; active-link DTO migration and XML UI/programmatic name conversion remain later obligations. Decouple SfxItemPool default registration from optional browser snapshot factory; register new SwFormatINetFormat(emptyURL,emptyTarget) in real SwAttrPool without fabricated generic JSON restore. Existing specialized internet snapshot codec remains separate. Add two independent literal test files covering defaults/IDs/names/copy/backlinks/equality/setters/actual document-node-item-set lookup, inheritance/direct clear, registry ownership/duplicate/missing restore/existing factory. All350 prior test files byte-identical. Append bounded responsibility notes to four existing manifest rows and register one new unverified mapper module, preserving all237 prior states/defaults/exceptions and I/O deviations. Run six static gates then one sequential five-suite absent-reference profile with finally restoration; only failed gates/cases repeat. Five source audits after restoration; scope/native hashes/ignored-inclusive artifact checks; same-actor readonly exact-SHA EVALUATOR and doctor/routing; verified canonical finish with concrete result. No full native style resolution, UNO/macros/broadcaster/client lifetime, global registry or whole-core/UI parity claim."
  Verify Steps: |-
    - `npm run format:check`
    - `npm run lint`
    - `npm run typecheck`
    - `npm run check:dependencies`
    - `npm run check:docs`
    - `npm run check:file-size`
    - `npm run test:static`
    - `npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure`
    - `npm run test:inventory:coverage -- --coverage.reportOnFailure`
    - `npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts`
    - `npm exec -- playwright test --config apps/office/playwright.config.ts`
    - `npm exec -- tsx scripts/generate-writer-ui-resources.ts --check`
    - `npm run check:source-tree`
    - `npm run check:source-provenance`
    - `npm run inventory:invariants`
    - `npm run inventory:parity`
    - `ap doctor`
    - `node .agentplane/policy/check-routing.mjs`

    Static gates precede one absent-reference profile;repeat only failed cases/gates. Audit all350 prior tests unchanged,237 prior runtime states and native file hashes. No network,upstream execution or saved source/helpers.
  Verification: |-
    Command: six static gates listed in Verify Steps. Result: pass. Evidence: initial lint rejected a static-only class;mapper converted to repository object namespace form,only failed lint repeated;five other gates first attempts. Scope: nine approved semantic paths;no thresholds or policies changed.

    Command: five sequential absent-reference gates listed in Verify Steps. Result: pass. Evidence: one build;app2680/269files;inventory109/36files;scripts5/2files;Chromium99;app/inventory lines/statements/functions/branches100%;all test gates first attempts,no replays. Scope: real model/default/item-set/browser/filter paths with vendor reference absent. Vendor restored in finally before source audits.

    Command: five restored source audits listed in Verify Steps. Result: pass. Evidence: resources/source-tree/provenance/invariants/parity exits0;semantic violations0. Scope: pinned source references audited after profile completion.

    Command: scope-and-native-hashes,git diff --check,ignored-inclusive artifact audit. Result: pass. Evidence: nine semantic paths,seven new independent literal cases;all350prior test files byte-identical;237existing runtime states/defaults/exceptions and other manifest fields retained,four bounded responsibility appendices,one new unverified mapper;seven native file hashes;3844APfiles/0forbidden. Scope: native zero/styled pool default distinction,two style IDs/copy/equality/paired setters/real document pool lookup and independent optional snapshot factory. No upstream source/helpers/raw diagnostics saved.

    Command: same-actor read-only EVALUATOR review of exact semantic SHA e91ad56567462e07507c301f96d2ff21b5e9c120;ap doctor;node .agentplane/policy/check-routing.mjs;git status --short --untracked-files=all. Result: pass. Evidence: nine committed paths equal reviewed checkout;quality report .agentplane/tasks/202610042302-PAZJC3/quality/20261004-231345430-recovery-context/quality-report.json;doctor0errors/two unchanged legacy warnings;routingOK;cleanmain before quality persistence. Scope: bounded slice only,no independent-agent claim or whole parity promotion. Existing active DTO style-ID ingestion/persistence/native constructor routing,ODF UI/programmatic conversion,other/localized style families,full UNO/macros/visited clients/broadcaster/refcounts/lifetimes/global pools/core/UI remain unverified. Registered save/open/recovery deviations preserved;goal active.
  Rollback Plan: "Revert the semantic leaf commit without history rewriting."
  Findings: |-
    Pinned LibreOffice26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. fmtatr2.cxx zero/type-info constructor sets ZERO IDs and empty strings;URL/target constructor sets CHR_INET_NORMAL/VISIT and fills UI names. Copy/equality retain both IDs. init.cxx registers the styled empty URL/target constructor at RES_TXTATR_INETFMT,not CreateDefault. Poolfmt enum offsets1024+6/7 give1030/1031;strings.hrc English resources are Internet Link/Visited Internet Link. Local pool lacks54 default and requires a browser snapshot factory. This task restores real pool lookup while explicitly leaving existing DTO ingestion/ODF style identity conversions and full mapper/localization incomplete. Standing user authorizes safe local iterative leaves and forbids saved source/helpers/upstream test access.

    Iteration126 restores the styled RES_TXTATR_INETFMT pool default and two native style IDs,distinct from CreateDefault zero item. Copy/equality preserve both IDs;paired setters retain independent style names/IDs. Default registration no longer requires browser restore factory;unregistered snapshot decode still rejects. English two-entry pool-name mapping is bounded;localized/all-family/custom style resolution,active DTO styled-constructor migration,ODF programmatic/UI conversion,UNO/macros/visited-style clients/lifetime and whole core/UI remain unverified. All pre-existing semantic statuses/defaults/exceptions and registered save/open/recovery deviations remain unchanged.

    Verified evidence: nine semantic paths;seven new independent literal cases;all350prior test files byte-identical. Six static gates pass;initial lint rejected a static-only class,changed mapper to the repository's object namespace pattern and reran only failed lint before remaining first-attempt static gates. One absent full profile passed build1,app2680/269files,inventory109/36files,scripts5/2files,Chromium99;app/inventory coverage100%allfour. No test failures/replays/passing suite repeats. Five restored source audits pass,semantic0. All237prior runtime states/defaults/exceptions and other manifest fields retained,four bounded responsibility appendices,one new unverified mapper. Seven native file hashes;ignored-inclusive AP3844files/zero forbidden;git diff --check pass. Default-only54 has no invented generic snapshot factory;existing specialized browser codec stays separate. Existing active DTO constructor still retains its portable semantics and zero style IDs;native active-link routing,nondefault ID persistence and UI/programmatic ODF identity conversions remain separate unverified obligations. English two-entry name mapper is incomplete beyond these resources;full localization/families/custom resolution,UNO/macros/style clients/broadcaster/lifetime/global pool architecture and full core/UI parity remain unverified. No network/global access/native invocation/source/helpers/artifact diagnostics/I/O deviation changes.
id_source: "generated"
---
## Summary

Restore the hyperlink document-pool style default.

## Scope

- apps/office/src/sw/source/core/txtnode/fmtatr2.ts
- apps/office/src/sw/inc/poolfmt.ts
- apps/office/src/svl/source/items/itempool.ts
- apps/office/src/sw/source/core/attr/swatrset.ts
- apps/office/src/sw/source/core/doc/SwStyleNameMapper.ts
- apps/office/src/sw/source/core/attr/internet-pool-default.test.ts
- apps/office/src/svl/source/items/itempool-default-registration.test.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

## Plan

Restore the existing RES_TXTATR_INETFMT document-pool default through native URL/target constructor, distinct from zero CreateDefault. Add native ZERO/CHR_INET_NORMAL/CHR_INET_VISIT pool IDs, normal/visited ID storage/getters/paired setters, copy and equality. Add bounded source-owned SwStyleNameMapper.GetUIName(poolId,fallback) for two English internet resources; all other/localized families remain unverified. Keep portable DTO ingestion semantics separate and unchanged; active-link DTO migration and XML UI/programmatic name conversion remain later obligations. Decouple SfxItemPool default registration from optional browser snapshot factory; register new SwFormatINetFormat(emptyURL,emptyTarget) in real SwAttrPool without fabricated generic JSON restore. Existing specialized internet snapshot codec remains separate. Add two independent literal test files covering defaults/IDs/names/copy/backlinks/equality/setters/actual document-node-item-set lookup, inheritance/direct clear, registry ownership/duplicate/missing restore/existing factory. All350 prior test files byte-identical. Append bounded responsibility notes to four existing manifest rows and register one new unverified mapper module, preserving all237 prior states/defaults/exceptions and I/O deviations. Run six static gates then one sequential five-suite absent-reference profile with finally restoration; only failed gates/cases repeat. Five source audits after restoration; scope/native hashes/ignored-inclusive artifact checks; same-actor readonly exact-SHA EVALUATOR and doctor/routing; verified canonical finish with concrete result. No full native style resolution, UNO/macros/broadcaster/client lifetime, global registry or whole-core/UI parity claim.

## Verify Steps

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run check:dependencies`
- `npm run check:docs`
- `npm run check:file-size`
- `npm run test:static`
- `npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure`
- `npm run test:inventory:coverage -- --coverage.reportOnFailure`
- `npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts`
- `npm exec -- playwright test --config apps/office/playwright.config.ts`
- `npm exec -- tsx scripts/generate-writer-ui-resources.ts --check`
- `npm run check:source-tree`
- `npm run check:source-provenance`
- `npm run inventory:invariants`
- `npm run inventory:parity`
- `ap doctor`
- `node .agentplane/policy/check-routing.mjs`

Static gates precede one absent-reference profile;repeat only failed cases/gates. Audit all350 prior tests unchanged,237 prior runtime states and native file hashes. No network,upstream execution or saved source/helpers.

## Verification

Command: six static gates listed in Verify Steps. Result: pass. Evidence: initial lint rejected a static-only class;mapper converted to repository object namespace form,only failed lint repeated;five other gates first attempts. Scope: nine approved semantic paths;no thresholds or policies changed.

Command: five sequential absent-reference gates listed in Verify Steps. Result: pass. Evidence: one build;app2680/269files;inventory109/36files;scripts5/2files;Chromium99;app/inventory lines/statements/functions/branches100%;all test gates first attempts,no replays. Scope: real model/default/item-set/browser/filter paths with vendor reference absent. Vendor restored in finally before source audits.

Command: five restored source audits listed in Verify Steps. Result: pass. Evidence: resources/source-tree/provenance/invariants/parity exits0;semantic violations0. Scope: pinned source references audited after profile completion.

Command: scope-and-native-hashes,git diff --check,ignored-inclusive artifact audit. Result: pass. Evidence: nine semantic paths,seven new independent literal cases;all350prior test files byte-identical;237existing runtime states/defaults/exceptions and other manifest fields retained,four bounded responsibility appendices,one new unverified mapper;seven native file hashes;3844APfiles/0forbidden. Scope: native zero/styled pool default distinction,two style IDs/copy/equality/paired setters/real document pool lookup and independent optional snapshot factory. No upstream source/helpers/raw diagnostics saved.

Command: same-actor read-only EVALUATOR review of exact semantic SHA e91ad56567462e07507c301f96d2ff21b5e9c120;ap doctor;node .agentplane/policy/check-routing.mjs;git status --short --untracked-files=all. Result: pass. Evidence: nine committed paths equal reviewed checkout;quality report .agentplane/tasks/202610042302-PAZJC3/quality/20261004-231345430-recovery-context/quality-report.json;doctor0errors/two unchanged legacy warnings;routingOK;cleanmain before quality persistence. Scope: bounded slice only,no independent-agent claim or whole parity promotion. Existing active DTO style-ID ingestion/persistence/native constructor routing,ODF UI/programmatic conversion,other/localized style families,full UNO/macros/visited clients/broadcaster/refcounts/lifetimes/global pools/core/UI remain unverified. Registered save/open/recovery deviations preserved;goal active.

## Rollback Plan

Revert the semantic leaf commit without history rewriting.

## Findings

Pinned LibreOffice26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. fmtatr2.cxx zero/type-info constructor sets ZERO IDs and empty strings;URL/target constructor sets CHR_INET_NORMAL/VISIT and fills UI names. Copy/equality retain both IDs. init.cxx registers the styled empty URL/target constructor at RES_TXTATR_INETFMT,not CreateDefault. Poolfmt enum offsets1024+6/7 give1030/1031;strings.hrc English resources are Internet Link/Visited Internet Link. Local pool lacks54 default and requires a browser snapshot factory. This task restores real pool lookup while explicitly leaving existing DTO ingestion/ODF style identity conversions and full mapper/localization incomplete. Standing user authorizes safe local iterative leaves and forbids saved source/helpers/upstream test access.

Iteration126 restores the styled RES_TXTATR_INETFMT pool default and two native style IDs,distinct from CreateDefault zero item. Copy/equality preserve both IDs;paired setters retain independent style names/IDs. Default registration no longer requires browser restore factory;unregistered snapshot decode still rejects. English two-entry pool-name mapping is bounded;localized/all-family/custom style resolution,active DTO styled-constructor migration,ODF programmatic/UI conversion,UNO/macros/visited-style clients/lifetime and whole core/UI remain unverified. All pre-existing semantic statuses/defaults/exceptions and registered save/open/recovery deviations remain unchanged.

Verified evidence: nine semantic paths;seven new independent literal cases;all350prior test files byte-identical. Six static gates pass;initial lint rejected a static-only class,changed mapper to the repository's object namespace pattern and reran only failed lint before remaining first-attempt static gates. One absent full profile passed build1,app2680/269files,inventory109/36files,scripts5/2files,Chromium99;app/inventory coverage100%allfour. No test failures/replays/passing suite repeats. Five restored source audits pass,semantic0. All237prior runtime states/defaults/exceptions and other manifest fields retained,four bounded responsibility appendices,one new unverified mapper. Seven native file hashes;ignored-inclusive AP3844files/zero forbidden;git diff --check pass. Default-only54 has no invented generic snapshot factory;existing specialized browser codec stays separate. Existing active DTO constructor still retains its portable semantics and zero style IDs;native active-link routing,nondefault ID persistence and UI/programmatic ODF identity conversions remain separate unverified obligations. English two-entry name mapper is incomplete beyond these resources;full localization/families/custom resolution,UNO/macros/style clients/broadcaster/lifetime/global pool architecture and full core/UI parity remain unverified. No network/global access/native invocation/source/helpers/artifact diagnostics/I/O deviation changes.
