---
id: "202610042302-PAZJC3"
title: "Restore the hyperlink document-pool style default"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
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
doc_updated_at: "2026-10-04T23:03:16.360Z"
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
  Verification: "Pending declared verification."
  Rollback Plan: "Revert the semantic leaf commit without history rewriting."
  Findings: "Pinned LibreOffice26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. fmtatr2.cxx zero/type-info constructor sets ZERO IDs and empty strings;URL/target constructor sets CHR_INET_NORMAL/VISIT and fills UI names. Copy/equality retain both IDs. init.cxx registers the styled empty URL/target constructor at RES_TXTATR_INETFMT,not CreateDefault. Poolfmt enum offsets1024+6/7 give1030/1031;strings.hrc English resources are Internet Link/Visited Internet Link. Local pool lacks54 default and requires a browser snapshot factory. This task restores real pool lookup while explicitly leaving existing DTO ingestion/ODF style identity conversions and full mapper/localization incomplete. Standing user authorizes safe local iterative leaves and forbids saved source/helpers/upstream test access."
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

Pending declared verification.

## Rollback Plan

Revert the semantic leaf commit without history rewriting.

## Findings

Pinned LibreOffice26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. fmtatr2.cxx zero/type-info constructor sets ZERO IDs and empty strings;URL/target constructor sets CHR_INET_NORMAL/VISIT and fills UI names. Copy/equality retain both IDs. init.cxx registers the styled empty URL/target constructor at RES_TXTATR_INETFMT,not CreateDefault. Poolfmt enum offsets1024+6/7 give1030/1031;strings.hrc English resources are Internet Link/Visited Internet Link. Local pool lacks54 default and requires a browser snapshot factory. This task restores real pool lookup while explicitly leaving existing DTO ingestion/ODF style identity conversions and full mapper/localization incomplete. Standing user authorizes safe local iterative leaves and forbids saved source/helpers/upstream test access.
