---
id: "202610050149-HENBJ9"
title: "Restore native text insertion flags and manager defaults"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
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
  updated_at: "2026-10-05T01:50:18.542Z"
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
    body: "Start: restore native insertion mode contract and all supported flag combinations with one upstream-absent validation profile;preserve registered deviations and existing shell callers for their dependent leaf."
events:
  -
    type: "status"
    at: "2026-10-05T01:50:19.121Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore native insertion mode contract and all supported flag combinations with one upstream-absent validation profile;preserve registered deviations and existing shell callers for their dependent leaf."
doc_version: 3
doc_updated_at: "2026-10-05T01:50:19.121Z"
doc_updated_by: "CODER"
description: "Restore pinned SwInsertFlags and actual third-argument mode/default contract,full supported hint flag combinations and manager EMPTYEXPAND default;move explicit attributes/link adapters to fourth/fifth positions,retaining existing shell caller behavior for the next dependent leaf. Source-independent tests only,no upstream/helper/code artifacts."
sections:
  Summary: "Restore native text insertion flags and manager defaults."
  Scope: |-
    - apps/office/src/sw/inc/IDocumentContentOperations.ts
    - apps/office/src/sw/source/core/txtnode/ndtxt.ts
    - apps/office/src/sw/source/core/txtnode/ndtxt-hints.ts
    - apps/office/src/sw/source/core/txtnode/ndhints.ts
    - apps/office/src/sw/source/core/txtnode/ndhints-range.ts
    - apps/office/src/sw/source/core/txtnode/ndtxt-hint-update.ts
    - apps/office/src/sw/source/core/doc/DocumentContentOperationsManager.ts
    - apps/office/src/sw/source/core/undo/unins.ts
    - apps/office/src/sw/source/core/doc/writer-model.test.ts
    - apps/office/src/sw/source/core/txtnode/native-text-hint-update.test.ts
    - apps/office/src/sw/source/core/txtnode/nesting-attribute-ownership.test.ts
    - apps/office/src/sw/source/core/txtnode/internet-node-transitions.test.ts
    - apps/office/src/sw/source/uibase/wrtsh/native-typing-internet-ownership.test.ts
    - apps/office/src/sw/source/core/txtnode/native-insert-flags.test.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
  Plan: "Port SwInsertFlags at native IDocumentContentOperations header owner:DEFAULT0,EMPTYEXPAND1,NOHINTEXPAND2,FORCEHINTEXPAND4 and all combinations0..7. Native SwTextNode.InsertText third parameter is mode=DEFAULT;portable explicit item/link adapters move to fourth/fifth positions rather than retaining an ambiguous third-argument union. Restore node-owned temporary FORCE override around pure coordinate Update,restore old Ignore state in finally before insertion postphase;NOHINT wins end-equal restore,EMPTY expands eligible zeros and continues before prefix,FORCE bypasses DontExpand,NOHINT blocks paragraph-prefix. Pass mode through actual bound native maps;new map binding remains node-owned. Extract insertion hint preparation into existing ndtxt-hints under1000-line gate;move two secondary comparators and,if needed,the boundary-pair comparator unchanged into existing ndhints-range. Map added exports only;no broad normalization/newhelpermodule. Manager InsertString third mode defaultsEMPTYEXPAND and forwards it. SwUndoInsert existing portable typed redo and five prior test files receive only positional migration with explicitDEFAULT,unchanged existing shell DEFAULT behavior;native collapsed EMPTY/selection FORCE caller/history changes are the next dependent task rather than conflated with core contracts. Add one source-independent literal flag/8mask/2family/lock/oldIgnore/boundary matrix and actual item/map/node/backlink/7INET/ID preservation,manager defaults/explicitmodes,temporary restoration and plain/empty/UTF16/error/item/link adapters. Preserve353of358prior test files byte-identical;five positional migrations preserve expectations. Preserve241existingruntime states/defaults/exceptions except bounded responsibility appendices and mapped helperexports;one new enum module remains unverified,242rows,no promotion. Static6first;one sequential full absent-reference build/app/inventory/scripts/Chromium with finally restoration and immediate exactfailedname evidence;repeat only actualfailedcases/gates,zero passing case/suite/build repeats. Restore before5source/scope/APaudits;exact native hashes/scope/SHA review/doctor/routing/verify/canonicalfinish. English bounded APprose/counts/hashes only,no code/source/helpers/Python/rawdiagnostics;no upstream invocation bytests,no network/outside/globalaccess. Registered save/open/recovery deviations unchanged. Full native manager undo/grouping/redline/multicursor/shell selection/native SwContentIndex argument/GCAttr/COPY/BuildPortions/families/style clients/UNO/refcounts/core/UI remain unverified."
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

    Static first,one absent-reference full profile with exactfailednames saved immediately;only failed gates/cases repeated. Restore upstream before source/scope/APaudits. Review358prior tests(353unchanged/5syntax-only migrations),241existingruntime states and new unverified enum row/native hashes. No upstream/test invocations or source/helper/code/Python/rawdiagnostic artifacts.
  Verification: "Pending implementation and validation."
  Rollback Plan: "Revert the semantic leaf commit without rewriting history."
  Findings: "Preflight132:cleanmain35f1a0e9048e23a88ea20fe2754d57ba0633a6c7,direct,onlyparentactive. Iteration131 verified progress,notblocked. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native IDocumentContentOperations.hxx57 flags0/1/2/4 and167 managerdefaultEMPTY;ndtxt.hxx287 node thirdmodeDEFAULT. ndtxt.cxx2449 saves old Ignore,temporarily forces aroundUpdate,restores before end-equal mode processing;NOHINT overridesFORCE,EMPTY eligiblezero expansion continues,prefix requires!NOHINT. Current node thirdparameter isSfxItemSet and manager passes nodeDEFAULT incorrectly. SwUndoInsert typed redo andfive oldtestfiles useportableattrs thirdposition and need syntax-only migration. Shell editsh.cxx98 normalEMPTY/forced5,selectionwrtsh1.cxx240..288 deleteplusforced insertion and undo storedflags are next dependent leaf. Existing131 owner/coordinate/postphase mechanism established;registered I/O deviations preserved. Fourmatched policies read;user-instructions absent;standing goal authorizes safe local scope;no network/outside/globalaccess."
id_source: "generated"
---
## Summary

Restore native text insertion flags and manager defaults.

## Scope

- apps/office/src/sw/inc/IDocumentContentOperations.ts
- apps/office/src/sw/source/core/txtnode/ndtxt.ts
- apps/office/src/sw/source/core/txtnode/ndtxt-hints.ts
- apps/office/src/sw/source/core/txtnode/ndhints.ts
- apps/office/src/sw/source/core/txtnode/ndhints-range.ts
- apps/office/src/sw/source/core/txtnode/ndtxt-hint-update.ts
- apps/office/src/sw/source/core/doc/DocumentContentOperationsManager.ts
- apps/office/src/sw/source/core/undo/unins.ts
- apps/office/src/sw/source/core/doc/writer-model.test.ts
- apps/office/src/sw/source/core/txtnode/native-text-hint-update.test.ts
- apps/office/src/sw/source/core/txtnode/nesting-attribute-ownership.test.ts
- apps/office/src/sw/source/core/txtnode/internet-node-transitions.test.ts
- apps/office/src/sw/source/uibase/wrtsh/native-typing-internet-ownership.test.ts
- apps/office/src/sw/source/core/txtnode/native-insert-flags.test.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

## Plan

Port SwInsertFlags at native IDocumentContentOperations header owner:DEFAULT0,EMPTYEXPAND1,NOHINTEXPAND2,FORCEHINTEXPAND4 and all combinations0..7. Native SwTextNode.InsertText third parameter is mode=DEFAULT;portable explicit item/link adapters move to fourth/fifth positions rather than retaining an ambiguous third-argument union. Restore node-owned temporary FORCE override around pure coordinate Update,restore old Ignore state in finally before insertion postphase;NOHINT wins end-equal restore,EMPTY expands eligible zeros and continues before prefix,FORCE bypasses DontExpand,NOHINT blocks paragraph-prefix. Pass mode through actual bound native maps;new map binding remains node-owned. Extract insertion hint preparation into existing ndtxt-hints under1000-line gate;move two secondary comparators and,if needed,the boundary-pair comparator unchanged into existing ndhints-range. Map added exports only;no broad normalization/newhelpermodule. Manager InsertString third mode defaultsEMPTYEXPAND and forwards it. SwUndoInsert existing portable typed redo and five prior test files receive only positional migration with explicitDEFAULT,unchanged existing shell DEFAULT behavior;native collapsed EMPTY/selection FORCE caller/history changes are the next dependent task rather than conflated with core contracts. Add one source-independent literal flag/8mask/2family/lock/oldIgnore/boundary matrix and actual item/map/node/backlink/7INET/ID preservation,manager defaults/explicitmodes,temporary restoration and plain/empty/UTF16/error/item/link adapters. Preserve353of358prior test files byte-identical;five positional migrations preserve expectations. Preserve241existingruntime states/defaults/exceptions except bounded responsibility appendices and mapped helperexports;one new enum module remains unverified,242rows,no promotion. Static6first;one sequential full absent-reference build/app/inventory/scripts/Chromium with finally restoration and immediate exactfailedname evidence;repeat only actualfailedcases/gates,zero passing case/suite/build repeats. Restore before5source/scope/APaudits;exact native hashes/scope/SHA review/doctor/routing/verify/canonicalfinish. English bounded APprose/counts/hashes only,no code/source/helpers/Python/rawdiagnostics;no upstream invocation bytests,no network/outside/globalaccess. Registered save/open/recovery deviations unchanged. Full native manager undo/grouping/redline/multicursor/shell selection/native SwContentIndex argument/GCAttr/COPY/BuildPortions/families/style clients/UNO/refcounts/core/UI remain unverified.

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

Static first,one absent-reference full profile with exactfailednames saved immediately;only failed gates/cases repeated. Restore upstream before source/scope/APaudits. Review358prior tests(353unchanged/5syntax-only migrations),241existingruntime states and new unverified enum row/native hashes. No upstream/test invocations or source/helper/code/Python/rawdiagnostic artifacts.

## Verification

Pending implementation and validation.

## Rollback Plan

Revert the semantic leaf commit without rewriting history.

## Findings

Preflight132:cleanmain35f1a0e9048e23a88ea20fe2754d57ba0633a6c7,direct,onlyparentactive. Iteration131 verified progress,notblocked. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native IDocumentContentOperations.hxx57 flags0/1/2/4 and167 managerdefaultEMPTY;ndtxt.hxx287 node thirdmodeDEFAULT. ndtxt.cxx2449 saves old Ignore,temporarily forces aroundUpdate,restores before end-equal mode processing;NOHINT overridesFORCE,EMPTY eligiblezero expansion continues,prefix requires!NOHINT. Current node thirdparameter isSfxItemSet and manager passes nodeDEFAULT incorrectly. SwUndoInsert typed redo andfive oldtestfiles useportableattrs thirdposition and need syntax-only migration. Shell editsh.cxx98 normalEMPTY/forced5,selectionwrtsh1.cxx240..288 deleteplusforced insertion and undo storedflags are next dependent leaf. Existing131 owner/coordinate/postphase mechanism established;registered I/O deviations preserved. Fourmatched policies read;user-instructions absent;standing goal authorizes safe local scope;no network/outside/globalaccess.
