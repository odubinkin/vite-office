---
id: "202610050217-Y5P172"
title: "Restore shell insertion modes and stored undo flags"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "parity"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T02:18:51.401Z"
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
    body: "Start: restore collapsed shell modes and stored undo flags under the standing parity goal."
events:
  -
    type: "status"
    at: "2026-10-05T02:18:37.730Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore collapsed shell modes and stored undo flags under the standing parity goal."
doc_version: 3
doc_updated_at: "2026-10-05T02:18:51.021Z"
doc_updated_by: "CODER"
description: "Continuation 133: restore collapsed SwEditShell Insert2 EMPTYEXPAND policy and required stored SwUndoInsert insertion flags, including the current FORCE grouping barrier; preserve selection adapters until native attribute history exists."
sections:
  Summary: "Restore shell insertion modes and stored undo flags."
  Scope: |-
    - apps/office/src/sw/source/core/edit/editsh.ts
    - apps/office/src/sw/source/core/undo/unins.ts
    - apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
    - apps/office/src/sw/source/core/undo/undobj.test.ts
    - apps/office/src/sw/source/uibase/wrtsh/native-typing-internet-ownership.test.ts
    - apps/office/src/sw/source/core/txtnode/native-empty-hint-ownership.test.ts
    - apps/office/src/sw/source/uibase/wrtsh/native-shell-insert-modes.test.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
  Plan: "Restore source-owned SwEditShell Insert2 collapsed insertion policy: normal EMPTYEXPAND1 and forced EMPTYEXPAND|FORCEHINTEXPAND5 factory in existing editsh. Require SwUndoInsert stored native flags before optional pending items;typed redo forwards stored flags;new candidate FORCE cannot group,ordinary after forced remains eligible under existing bounded payload checks and retains original mode. Collapsed Insert,Replace and composition use factory;keep current same-node and cross-node selection adapters pending native SwHistory/SwHistorySetText rollback. Hyperlink fragment adapter and two prior constructor test files migrate with explicit DEFAULT only,unchanged expectations. New source-independent literal mode/mask/lock/oldIgnore/boundary/owned INET metadata/IDs/map/node/backlink/caret/undo/redo/pending clone/grouping tests cover actual paths. Only the prior empty-internet typing undo/redo case may change after concrete first-profile failure,from DEFAULT-shifted zero to EMPTY-expanded range;all other356of359prior tests byte-identical. Preserve242runtime rows/status/defaults/exceptions with three bounded responsibility appendices and mapped factory/symbol;no promotions/newmodule. Sixstatic gates first;one sequential absent full build/app/inventory/scripts/Chromium with finally restore and immediate exact failed full names;only failed gates/cases repeated,no passing suite/case/build replays. Restore before five source audits,scope/native hashes/AP forbidden scan/exact semantic SHA same-actor readonly EVALUATOR/doctor/routing/CODER verification/canonical finish. Bounded English prose/counts/hashes only in AP,no source/code/helper/Python/rawdiagnostics. Registered I/O deviations untouched;selection history/full native grouping/redline/multicursor/index overloads/GCAttr/COPY/BuildPortions/families/styleclients/UNO/refcounts/core/UI remain unverified."
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

    Static first;one full absent profile,exact failed names captured immediately;only failures replayed. Restore before source/scope/AP audits. Audit359prior test files,242runtime rows,native hashes and exact semantic SHA.
  Verification: "Pending implementation and validation."
  Rollback Plan: "Revert the semantic leaf commit without rewriting history."
  Findings: "Preflight133:cleanmain ce6c0d1c16fefe6a071a07a370580fd2053ae9a3,direct,onlyparentactive;132 verified progress,notblocked. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native editsh.cxx98 normal1/forced5;unins.cxx102 stores flags and340 reuses them;DocumentContentOperationsManager.cxx2902 currentFORCE skips grouping while ordinary may group after forced. Native insert undo erases text without restoring consumed DontExpand;first and redo ranges may differ. Selection delete+force requires missing SwHistory/SwHistorySetText rollback;retained adapters explicitly unverified. Fourmatchedpolicies loaded,user-instructions absent,standing usergoal authorizes safe local scope,no network/outside/globalaccess."
id_source: "generated"
---
## Summary

Restore shell insertion modes and stored undo flags.

## Scope

- apps/office/src/sw/source/core/edit/editsh.ts
- apps/office/src/sw/source/core/undo/unins.ts
- apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
- apps/office/src/sw/source/core/undo/undobj.test.ts
- apps/office/src/sw/source/uibase/wrtsh/native-typing-internet-ownership.test.ts
- apps/office/src/sw/source/core/txtnode/native-empty-hint-ownership.test.ts
- apps/office/src/sw/source/uibase/wrtsh/native-shell-insert-modes.test.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

## Plan

Restore source-owned SwEditShell Insert2 collapsed insertion policy: normal EMPTYEXPAND1 and forced EMPTYEXPAND|FORCEHINTEXPAND5 factory in existing editsh. Require SwUndoInsert stored native flags before optional pending items;typed redo forwards stored flags;new candidate FORCE cannot group,ordinary after forced remains eligible under existing bounded payload checks and retains original mode. Collapsed Insert,Replace and composition use factory;keep current same-node and cross-node selection adapters pending native SwHistory/SwHistorySetText rollback. Hyperlink fragment adapter and two prior constructor test files migrate with explicit DEFAULT only,unchanged expectations. New source-independent literal mode/mask/lock/oldIgnore/boundary/owned INET metadata/IDs/map/node/backlink/caret/undo/redo/pending clone/grouping tests cover actual paths. Only the prior empty-internet typing undo/redo case may change after concrete first-profile failure,from DEFAULT-shifted zero to EMPTY-expanded range;all other356of359prior tests byte-identical. Preserve242runtime rows/status/defaults/exceptions with three bounded responsibility appendices and mapped factory/symbol;no promotions/newmodule. Sixstatic gates first;one sequential absent full build/app/inventory/scripts/Chromium with finally restore and immediate exact failed full names;only failed gates/cases repeated,no passing suite/case/build replays. Restore before five source audits,scope/native hashes/AP forbidden scan/exact semantic SHA same-actor readonly EVALUATOR/doctor/routing/CODER verification/canonical finish. Bounded English prose/counts/hashes only in AP,no source/code/helper/Python/rawdiagnostics. Registered I/O deviations untouched;selection history/full native grouping/redline/multicursor/index overloads/GCAttr/COPY/BuildPortions/families/styleclients/UNO/refcounts/core/UI remain unverified.

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

Static first;one full absent profile,exact failed names captured immediately;only failures replayed. Restore before source/scope/AP audits. Audit359prior test files,242runtime rows,native hashes and exact semantic SHA.

## Verification

Pending implementation and validation.

## Rollback Plan

Revert the semantic leaf commit without rewriting history.

## Findings

Preflight133:cleanmain ce6c0d1c16fefe6a071a07a370580fd2053ae9a3,direct,onlyparentactive;132 verified progress,notblocked. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native editsh.cxx98 normal1/forced5;unins.cxx102 stores flags and340 reuses them;DocumentContentOperationsManager.cxx2902 currentFORCE skips grouping while ordinary may group after forced. Native insert undo erases text without restoring consumed DontExpand;first and redo ranges may differ. Selection delete+force requires missing SwHistory/SwHistorySetText rollback;retained adapters explicitly unverified. Fourmatchedpolicies loaded,user-instructions absent,standing usergoal authorizes safe local scope,no network/outside/globalaccess.
