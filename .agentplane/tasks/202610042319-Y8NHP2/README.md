---
id: "202610042319-Y8NHP2"
title: "Preserve native hyperlink style identities through Worker records"
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
  updated_at: "2026-10-04T23:19:34.068Z"
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
    body: "Start: preserve native internet style IDs through one browser-owned record codec reused by pooled snapshots and Worker16 graph."
events:
  -
    type: "status"
    at: "2026-10-04T23:19:34.505Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: preserve native internet style IDs through one browser-owned record codec reused by pooled snapshots and Worker16 graph."
doc_version: 3
doc_updated_at: "2026-10-04T23:19:34.505Z"
doc_updated_by: "CODER"
description: "Preserve both native internet style pool IDs through the existing browser item snapshot and canonical Worker16 graph. Add one browser-owned internet value-record type and encode/decode pair in existing item-codec.ts;reuse it from JSON item encoding and graph hint encoding/restoration,leaving core QueryValue and GetHyperlink browser metadata projection unchanged. Encode optional native inetFormatId/visitedFormatId when nonzero;absence in existing current-schema records restores ZERO without changing350+existing assumptions. Validate provided IDs as integer unsigned16 before invoking native paired name/ID setters;reject malformed IDs,retain existing blank-active-link snapshot rejection and default-only pool54 generic restore boundary. Native Clone/MakeTextAttr/node copying already preserve IDs and must remain authoritative;no duplicate core persistence class. Add two source-independent literal test files:16literal ID pairs/zero/built-in/custom/sentinel item snapshots,current-schema omitted IDs,all invalid-ID boundary branches,actual node/copy/fragment/history/undo and structured-clone Worker envelope ownership/restoration. All352 prior test files byte-identical. Append bounded responsibility notes only to two existing manifest rows;all238 runtime states/defaults/exceptions and I/O deviations preserved,no new module or promotion. Six static gates then one sequential five-suite absent-reference profile with finally restoration;only failed cases/gates repeat;five restored source audits afterward. Exact committed scope/native hashes/ignored-inclusive artifact audit,same-actor readonly EVALUATOR,doctor/routing,recorded verification and canonical finish with concrete result. Native active DTO constructor/style identity ingestion,ODF UI/programmatic name conversion/localization/custom style copying/visited clients/UNO/macros/broadcaster/lifetime/full core/UI parity remain separate unverified obligations."
sections:
  Summary: "Preserve native hyperlink style identities through existing item and Worker records."
  Scope: |-
    - apps/office/src/sw/browser/filter/xml/item-codec.ts
    - apps/office/src/sw/browser/filter/xml/writer-document-codec.ts
    - apps/office/src/sw/source/core/txtnode/internet-style-id-transport.test.ts
    - apps/office/src/sw/source/filter/xml/hyperlink-item-codec.test.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
  Plan: "Preserve both native internet style pool IDs through the existing browser item snapshot and canonical Worker16 graph. Add one browser-owned internet value-record type and encode/decode pair in existing item-codec.ts;reuse it from JSON item encoding and graph hint encoding/restoration,leaving core QueryValue and GetHyperlink browser metadata projection unchanged. Encode optional native inetFormatId/visitedFormatId when nonzero;absence in existing current-schema records restores ZERO without changing350+existing assumptions. Validate provided IDs as integer unsigned16 before invoking native paired name/ID setters;reject malformed IDs,retain existing blank-active-link snapshot rejection and default-only pool54 generic restore boundary. Native Clone/MakeTextAttr/node copying already preserve IDs and must remain authoritative;no duplicate core persistence class. Add two source-independent literal test files:16literal ID pairs/zero/built-in/custom/sentinel item snapshots,current-schema omitted IDs,all invalid-ID boundary branches,actual node/copy/fragment/history/undo and structured-clone Worker envelope ownership/restoration. All352 prior test files byte-identical. Append bounded responsibility notes only to two existing manifest rows;all238 runtime states/defaults/exceptions and I/O deviations preserved,no new module or promotion. Six static gates then one sequential five-suite absent-reference profile with finally restoration;only failed cases/gates repeat;five restored source audits afterward. Exact committed scope/native hashes/ignored-inclusive artifact audit,same-actor readonly EVALUATOR,doctor/routing,recorded verification and canonical finish with concrete result. Native active DTO constructor/style identity ingestion,ODF UI/programmatic name conversion/localization/custom style copying/visited clients/UNO/macros/broadcaster/lifetime/full core/UI parity remain separate unverified obligations."
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

    Static gates precede one sequential absent-reference profile;repeat only failed cases/gates. Audit all352prior test files unchanged,all238existing runtime states/defaults/exceptions and native hashes. No network/upstream execution/saved source/helper artifacts.
  Verification: "Pending declared implementation and validation."
  Rollback Plan: "Revert the semantic leaf commit without history rewriting."
  Findings: "Pinned LibreOffice26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. fmtinfmt.hxx owns mnINetFormatId/mnVisitedFormatId;fmtatr2.cxx native copy and operator== retain both IDs. Local core Clone/MakeTextAttr preserve them after iteration126. item-codec currently serializes only five string QueryValue fields and decode normalizes into a DTO constructor,losing IDs. writer-document-codec independently stores GetHyperlink strings and restores same DTO,also losing IDs. Actual Worker envelope uses this canonical graph. This task repairs both serialization boundaries through one browser-owned value record,without claiming browser DTO creation/ODF style conversion/native client resolution complete. Standing goal authorizes safe local leaf work;tests once absent;no saved source/helper artifacts/network/global reads/native test invocation."
id_source: "generated"
---
## Summary

Preserve native hyperlink style identities through existing item and Worker records.

## Scope

- apps/office/src/sw/browser/filter/xml/item-codec.ts
- apps/office/src/sw/browser/filter/xml/writer-document-codec.ts
- apps/office/src/sw/source/core/txtnode/internet-style-id-transport.test.ts
- apps/office/src/sw/source/filter/xml/hyperlink-item-codec.test.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

## Plan

Preserve both native internet style pool IDs through the existing browser item snapshot and canonical Worker16 graph. Add one browser-owned internet value-record type and encode/decode pair in existing item-codec.ts;reuse it from JSON item encoding and graph hint encoding/restoration,leaving core QueryValue and GetHyperlink browser metadata projection unchanged. Encode optional native inetFormatId/visitedFormatId when nonzero;absence in existing current-schema records restores ZERO without changing350+existing assumptions. Validate provided IDs as integer unsigned16 before invoking native paired name/ID setters;reject malformed IDs,retain existing blank-active-link snapshot rejection and default-only pool54 generic restore boundary. Native Clone/MakeTextAttr/node copying already preserve IDs and must remain authoritative;no duplicate core persistence class. Add two source-independent literal test files:16literal ID pairs/zero/built-in/custom/sentinel item snapshots,current-schema omitted IDs,all invalid-ID boundary branches,actual node/copy/fragment/history/undo and structured-clone Worker envelope ownership/restoration. All352 prior test files byte-identical. Append bounded responsibility notes only to two existing manifest rows;all238 runtime states/defaults/exceptions and I/O deviations preserved,no new module or promotion. Six static gates then one sequential five-suite absent-reference profile with finally restoration;only failed cases/gates repeat;five restored source audits afterward. Exact committed scope/native hashes/ignored-inclusive artifact audit,same-actor readonly EVALUATOR,doctor/routing,recorded verification and canonical finish with concrete result. Native active DTO constructor/style identity ingestion,ODF UI/programmatic name conversion/localization/custom style copying/visited clients/UNO/macros/broadcaster/lifetime/full core/UI parity remain separate unverified obligations.

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

Static gates precede one sequential absent-reference profile;repeat only failed cases/gates. Audit all352prior test files unchanged,all238existing runtime states/defaults/exceptions and native hashes. No network/upstream execution/saved source/helper artifacts.

## Verification

Pending declared implementation and validation.

## Rollback Plan

Revert the semantic leaf commit without history rewriting.

## Findings

Pinned LibreOffice26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. fmtinfmt.hxx owns mnINetFormatId/mnVisitedFormatId;fmtatr2.cxx native copy and operator== retain both IDs. Local core Clone/MakeTextAttr preserve them after iteration126. item-codec currently serializes only five string QueryValue fields and decode normalizes into a DTO constructor,losing IDs. writer-document-codec independently stores GetHyperlink strings and restores same DTO,also losing IDs. Actual Worker envelope uses this canonical graph. This task repairs both serialization boundaries through one browser-owned value record,without claiming browser DTO creation/ODF style conversion/native client resolution complete. Standing goal authorizes safe local leaf work;tests once absent;no saved source/helper artifacts/network/global reads/native test invocation.
