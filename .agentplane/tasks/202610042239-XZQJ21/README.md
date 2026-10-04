---
id: "202610042239-XZQJ21"
title: "Restore native empty hyperlink item values"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202610042214-JKRYVR"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T22:40:12.534Z"
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
    body: "Start: Restore native empty string and default/copy item semantics with one absent-reference verification profile under the standing iterative goal."
events:
  -
    type: "status"
    at: "2026-10-04T22:40:12.976Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore native empty string and default/copy item semantics with one absent-reference verification profile under the standing iterative goal."
doc_version: 3
doc_updated_at: "2026-10-04T22:40:12.976Z"
doc_updated_by: "CODER"
description: "Replace canonical hyperlink DTO storage with the five native owned strings, restore zero-valued default/copy construction and native empty-string equality, and retain UI normalization at its existing boundary. Correct only prior tests that assert non-native empty rejection, optional-empty inequality or caller JSON property order. Validate the existing ownership/history/browser paths once with upstream absent; preserve registered IO deviations and unverified residual native style IDs/UNO/macros/clients."
sections:
  Summary: "Restore native empty hyperlink item values and string ownership."
  Scope: |-
    - apps/office/src/sw/source/core/txtnode/fmtatr2.ts
    - apps/office/src/sw/source/core/txtnode/internet-item-defaults.test.ts
    - apps/office/src/sw/source/core/txtnode/hyperlink-metadata-ownership.test.ts
    - apps/office/src/sw/source/core/doc/writer-model.test.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
  Plan: "Within six listed paths, refactor canonical SwFormatINetFormat storage to native msURL/msTargetFrame/msINetFormatName/msVisitedFormatName/msHyperlinkName strings. Restore zero default and copy construction,CreateDefault,GetName/SetName/GetTargetFrame/GetINetFormat/GetVisitedFormat;empty URLs remain valid core values,and absent/explicit-empty optional fields compare identically. Clone copies values and starts with no text-attribute backlink. Portable DTO ingestion/projection remains an explicit adapter;GetHyperlink omits empty optional strings and emits deterministic value order rather than caller JSON order. Existing normalizeWriterHyperlink/browser validation still rejects blank user destinations. Add independent literal empty/default/equality/copy/input ownership and actual map/node/filter/history tests. Correct only prior metadata and writer-model cases expecting native-invalid empty rejection,optional empty inequality or caller key order;other347prior files remain unchanged. Append bounded responsibility evidence only,all237existing runtime statuses/defaults/exceptions preserved,no status promotion. Run six static gates then one sequential five-suite absent-reference profile with finally restoration;only failed cases/gates may repeat. Five source audits occur after restoration. Review exact semantic SHA as same-actor EVALUATOR,doctor/routing,ignored-inclusive no-source/helper artifact audit,record verification and close via finish with concrete body/result. Native URL/target styled constructor,style pool IDs/locale names,UNO member QueryValue/PutValue,macros/broadcaster/clients/destruction/full core/UI parity remain unverified and are not silently claimed implemented."
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

    Static gates precede one absent-reference profile. Repeat only failed cases/gates. Audit exact committed scope,349prior test files with only two declared native corrections,237existing runtime states,manual pinned file hashes,and ignored-inclusive forbidden artifact absence. No network/upstream invocation/executable helper artifacts.
  Verification: "Pending implementation and declared verification."
  Rollback Plan: "Revert the leaf semantic commit if required;do not rewrite history."
  Findings: "Pinned LibreOffice26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. fmtinfmt.hxx declares five owned strings. fmtatr2.cxx zero constructor initializes all five empty and null backlink;CreateDefault returns that constructor;copy constructor copies strings but not backlink;operator== compares string values. Current local model stores optional DTO fields,throws for empty URL and distinguishes missing from empty. Existing nonempty normalization and browser dialog validation are separate and remain active. Native pool default in init.cxx uses the styled URL/target constructor,distinct from type-info/CreateDefault zero constructor;do not falsely claim the native pool-style defaults restored. Native style IDs/styled constructor/UNO/macros/clients require a later separate ownership audit. Standing user authorizes iterative local leaves,prohibits saved source/helpers,and requires tests once absent."
id_source: "generated"
---
## Summary

Restore native empty hyperlink item values and string ownership.

## Scope

- apps/office/src/sw/source/core/txtnode/fmtatr2.ts
- apps/office/src/sw/source/core/txtnode/internet-item-defaults.test.ts
- apps/office/src/sw/source/core/txtnode/hyperlink-metadata-ownership.test.ts
- apps/office/src/sw/source/core/doc/writer-model.test.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

## Plan

Within six listed paths, refactor canonical SwFormatINetFormat storage to native msURL/msTargetFrame/msINetFormatName/msVisitedFormatName/msHyperlinkName strings. Restore zero default and copy construction,CreateDefault,GetName/SetName/GetTargetFrame/GetINetFormat/GetVisitedFormat;empty URLs remain valid core values,and absent/explicit-empty optional fields compare identically. Clone copies values and starts with no text-attribute backlink. Portable DTO ingestion/projection remains an explicit adapter;GetHyperlink omits empty optional strings and emits deterministic value order rather than caller JSON order. Existing normalizeWriterHyperlink/browser validation still rejects blank user destinations. Add independent literal empty/default/equality/copy/input ownership and actual map/node/filter/history tests. Correct only prior metadata and writer-model cases expecting native-invalid empty rejection,optional empty inequality or caller key order;other347prior files remain unchanged. Append bounded responsibility evidence only,all237existing runtime statuses/defaults/exceptions preserved,no status promotion. Run six static gates then one sequential five-suite absent-reference profile with finally restoration;only failed cases/gates may repeat. Five source audits occur after restoration. Review exact semantic SHA as same-actor EVALUATOR,doctor/routing,ignored-inclusive no-source/helper artifact audit,record verification and close via finish with concrete body/result. Native URL/target styled constructor,style pool IDs/locale names,UNO member QueryValue/PutValue,macros/broadcaster/clients/destruction/full core/UI parity remain unverified and are not silently claimed implemented.

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

Static gates precede one absent-reference profile. Repeat only failed cases/gates. Audit exact committed scope,349prior test files with only two declared native corrections,237existing runtime states,manual pinned file hashes,and ignored-inclusive forbidden artifact absence. No network/upstream invocation/executable helper artifacts.

## Verification

Pending implementation and declared verification.

## Rollback Plan

Revert the leaf semantic commit if required;do not rewrite history.

## Findings

Pinned LibreOffice26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. fmtinfmt.hxx declares five owned strings. fmtatr2.cxx zero constructor initializes all five empty and null backlink;CreateDefault returns that constructor;copy constructor copies strings but not backlink;operator== compares string values. Current local model stores optional DTO fields,throws for empty URL and distinguishes missing from empty. Existing nonempty normalization and browser dialog validation are separate and remain active. Native pool default in init.cxx uses the styled URL/target constructor,distinct from type-info/CreateDefault zero constructor;do not falsely claim the native pool-style defaults restored. Native style IDs/styled constructor/UNO/macros/clients require a later separate ownership audit. Standing user authorizes iterative local leaves,prohibits saved source/helpers,and requires tests once absent.
