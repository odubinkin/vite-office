---
id: "202610042214-JKRYVR"
title: "Bind internet attributes to their owning text nodes"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202610042137-KBQPRR"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T22:15:06.556Z"
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
    body: "Start: Restore bounded internet text-node ownership under the standing iterative goal and absent-reference verification contract."
events:
  -
    type: "status"
    at: "2026-10-04T22:15:07.011Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore bounded internet text-node ownership under the standing iterative goal and absent-reference verification contract."
doc_version: 3
doc_updated_at: "2026-10-04T22:15:07.011Z"
doc_updated_by: "CODER"
description: "Restore the native internet attribute text-node backlink at existing insertion, copy, move and node transition boundaries. Keep retained undo paragraph identity and registered save/open/recovery deviations. No upstream source or executable helper artifacts; verification suites run once with the pinned reference directory absent."
sections:
  Summary: "Restore existing internet attribute ownership on actual Writer text nodes."
  Scope: |-
    - apps/office/src/sw/source/core/txtnode/txtatr2.ts
    - apps/office/src/sw/source/core/txtnode/ndhints.ts
    - apps/office/src/sw/source/core/txtnode/ndtxt.ts
    - apps/office/src/sw/source/core/txtnode/ndtxt-hints.ts
    - apps/office/src/sw/source/core/txtnode/internet-node-ownership.test.ts
    - apps/office/src/sw/source/core/txtnode/internet-node-transitions.test.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
  Plan: "Within eight listed source/test/manifest paths, restore the native null text-node backlink and GetpTextNode/GetTextNode/ChgTextNode contracts on concrete internet attributes. Centralize text-node hint assignment and portable map binding, clearing replaced/consumed internet links and rebinding surviving attributes without changing their maps, ranges, flags or items. Preserve empty GetOrCreate containers and detached snapshot semantics. Split hint projection, fragment creation and copied-hint validation from the near-limit node file into one source-owned helper. Add independent literal identity tests for default/unbound access, same/foreign document copy, owned cut/insert, replacement, formatting, split/join and undo/redo. Retained removed paragraph nodes keep their live hint ownership. Preserve the 347 existing tests and inventory statuses/defaults/exceptions; add bounded unverified responsibility evidence. Run six static gates, then the five declared suites once sequentially with reference directory renamed in try/finally; repeat only failed cases/gates. Restore references before five source audits. Review the exact semantic commit locally as EVALUATOR, persist English bounded outcome evidence, doctor/routing, verify and close the leaf. Full char-style/client/visited/native destruction parity is excluded and remains unverified."
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

    Static gates precede one sequential absent-reference profile. Only failed cases/gates may repeat. Exact-head scope/previous-test/manifest review and ignored-inclusive artifact audit are required. No network, upstream invocation or executable Agentplane evidence.
  Verification: "Pending implementation and declared validation."
  Rollback Plan: "Revert the task semantic commit if required; do not rewrite history or alter pre-existing changes."
  Findings: "Pinned reference: LibreOffice 26.8.0.2, 9bc445578031fecf56086729d8e4940c77e14d65. Native txtinet.hxx defines a null node pointer with GetpTextNode/GetTextNode/ChgTextNode. txtatr2.cxx initializes null; thints.cxx insertion and ndtxt.cxx copy bind the node. InitINetFormat also registers a char style, so this task does not invent a pointer-only complete implementation. Local retained undo nodes own their existing contents after structural removal; clearing them would break undo identity. Retained old hint containers are portable detached snapshots; native physical destruction remains unverified. Full char-style, client notification, visited state, protection and all attribute-family parity remain unverified. User authorizes iterative safe local leaves and explicitly prohibits saved source/helper artifacts and duplicate present/absent test profiles."
id_source: "generated"
---
## Summary

Restore existing internet attribute ownership on actual Writer text nodes.

## Scope

- apps/office/src/sw/source/core/txtnode/txtatr2.ts
- apps/office/src/sw/source/core/txtnode/ndhints.ts
- apps/office/src/sw/source/core/txtnode/ndtxt.ts
- apps/office/src/sw/source/core/txtnode/ndtxt-hints.ts
- apps/office/src/sw/source/core/txtnode/internet-node-ownership.test.ts
- apps/office/src/sw/source/core/txtnode/internet-node-transitions.test.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

## Plan

Within eight listed source/test/manifest paths, restore the native null text-node backlink and GetpTextNode/GetTextNode/ChgTextNode contracts on concrete internet attributes. Centralize text-node hint assignment and portable map binding, clearing replaced/consumed internet links and rebinding surviving attributes without changing their maps, ranges, flags or items. Preserve empty GetOrCreate containers and detached snapshot semantics. Split hint projection, fragment creation and copied-hint validation from the near-limit node file into one source-owned helper. Add independent literal identity tests for default/unbound access, same/foreign document copy, owned cut/insert, replacement, formatting, split/join and undo/redo. Retained removed paragraph nodes keep their live hint ownership. Preserve the 347 existing tests and inventory statuses/defaults/exceptions; add bounded unverified responsibility evidence. Run six static gates, then the five declared suites once sequentially with reference directory renamed in try/finally; repeat only failed cases/gates. Restore references before five source audits. Review the exact semantic commit locally as EVALUATOR, persist English bounded outcome evidence, doctor/routing, verify and close the leaf. Full char-style/client/visited/native destruction parity is excluded and remains unverified.

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

Static gates precede one sequential absent-reference profile. Only failed cases/gates may repeat. Exact-head scope/previous-test/manifest review and ignored-inclusive artifact audit are required. No network, upstream invocation or executable Agentplane evidence.

## Verification

Pending implementation and declared validation.

## Rollback Plan

Revert the task semantic commit if required; do not rewrite history or alter pre-existing changes.

## Findings

Pinned reference: LibreOffice 26.8.0.2, 9bc445578031fecf56086729d8e4940c77e14d65. Native txtinet.hxx defines a null node pointer with GetpTextNode/GetTextNode/ChgTextNode. txtatr2.cxx initializes null; thints.cxx insertion and ndtxt.cxx copy bind the node. InitINetFormat also registers a char style, so this task does not invent a pointer-only complete implementation. Local retained undo nodes own their existing contents after structural removal; clearing them would break undo identity. Retained old hint containers are portable detached snapshots; native physical destruction remains unverified. Full char-style, client notification, visited state, protection and all attribute-family parity remain unverified. User authorizes iterative safe local leaves and explicitly prohibits saved source/helper artifacts and duplicate present/absent test profiles.
