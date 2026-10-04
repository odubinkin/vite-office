---
id: "202610042214-JKRYVR"
title: "Bind internet attributes to their owning text nodes"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
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
quality_review:
  state: "pass"
  updated_at: "2026-10-04T22:32:28.764Z"
  updated_by: "EVALUATOR"
  note: "Same-actor read-only review of exact semantic SHA a97a25df9bafd49d37733ffa12a1fa2306c29da4 passes the bounded internet text-node ownership leaf; full upstream parity remains unverified."
  evaluated_sha: "a97a25df9bafd49d37733ffa12a1fa2306c29da4"
  blueprint_digest: "833f1d8a4614ba06d0e1e54ee7f56983d9c691de48ac132d3b3be89d57ecfc9a"
  evidence_refs:
    - ".agentplane/tasks/202610042214-JKRYVR/README.md"
    - ".agentplane/tasks/202610042214-JKRYVR/quality/20261004-223228764-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610042214-JKRYVR/quality/20261004-223228764-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610042214-JKRYVR/quality/20261004-223228764-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610042214-JKRYVR/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610042214-JKRYVR/evidence/scope-and-native-hashes.json"
    - ".agentplane/tasks/202610042214-JKRYVR/evidence/absent-profile.json"
    - ".agentplane/tasks/202610042214-JKRYVR/evidence/failed-case-recovery.json"
    - ".agentplane/tasks/202610042214-JKRYVR/evidence/restored-source-audits.json"
    - ".agentplane/tasks/202610042214-JKRYVR/evidence/static-gates.json"
    - ".agentplane/tasks/202610042214-JKRYVR/evidence/static-recovery.json"
  findings:
    - "Exact-head eight-path audit confirms actual node binding and old map detachment,347 prior tests byte-identical,18 new ownership/transition cases,unchanged projection bodies and re-export API,236 existing runtime statuses/defaults/exceptions preserved and one unverified helper."
    - "One absent full profile only: build,app2649 with100%coverage,scripts5,Chromium99 pass. Only the single failed inventory case replayed; lexical row ordering and relocated declaration markers corrected. Initial full inventory coverage plus final failed-case-only raw coverage covers all original CLI gaps. No passing suite/build replay or repository threshold change."
    - "Five restored source audits pass after filename-split registration;semantic violations0. Static docs comment failure repaired;latest six gates pass. Ignored-inclusive AP3824files/0forbidden. Doctor0errors/two unchanged legacy warnings;routingpass;clean reviewed checkout."
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
doc_updated_at: "2026-10-04T22:32:47.725Z"
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
  Verification: |-
    Command: six static gates listed in Verify Steps. Result: pass after new JSDoc comment repair. Evidence: format,lint,typecheck,dependencies passed once;docs failed then passed;file-size passed once. Scope: approved eight paths and whole repository static contracts.

    Command: one sequential upstream-absent build/application/inventory/scripts/Chromium profile listed in Verify Steps. Result: build,application,scripts,Chromium pass;inventory recovered using only its one failed case. Evidence: app2649/266files,coverage100%all metrics;scripts5/2files;Chromium99;inventory108initialpass/1fail,failed-case replay1fail then1pass/2skipped. Original full coverage four missing CLI statements/lines and three missing functions are all covered by final failed-case raw coverage;combined100%,standalone diagnostic CLI thresholds only,repository thresholds unchanged. Scope: actual existing model/history/browser behavior with reference directory absent. Vendor restored in finally each time;no passing suite or build replay.

    Command: five restored source audits listed in Verify Steps. Result: pass after filename responsibility registration. Evidence: source-tree/UI resources pass once;provenance fails then passes;invariants/parity pass,semantic violations0. Scope: pinned references inspected only after absent test runs.

    Command: scope-and-native-hashes,focused changed-manifest formatting,git diff --check,ignored-inclusive artifact audit. Result: pass. Evidence:347prior test files byte-identical;18newcases;eight semantic paths;236existing runtime fields/statuses/defaults/exceptions preserved except3bounded responsibility appendices and2relocated projection declarations;one unverified helper;unchanged projection bodies;six native file hashes;3824APfiles/0forbidden. Scope: bounded node ownership;full styles/clients/visited/refcounts/physical destruction/all families/core/UI goal remains unverified.

    Command: same-actor read-only EVALUATOR exact-head review of a97a25df9bafd49d37733ffa12a1fa2306c29da4;ap doctor;node .agentplane/policy/check-routing.mjs;git status --short --untracked-files=all. Result: pass. Evidence: eight committed source/test/manifest files equal reviewed checkout;all bounded evidence assertions pass;quality verdict pass at .agentplane/tasks/202610042214-JKRYVR/quality/20261004-223228764-recovery-context/quality-report.json;doctor0errors with two unchanged legacy warnings;routing OK;clean main before quality persistence. Scope: this leaf only;no independent-agent review claim or broader parity promotion.
  Rollback Plan: "Revert the task semantic commit if required; do not rewrite history or alter pre-existing changes."
  Findings: |-
    Pinned reference: LibreOffice 26.8.0.2, 9bc445578031fecf56086729d8e4940c77e14d65. Native txtinet.hxx defines a null node pointer with GetpTextNode/GetTextNode/ChgTextNode. txtatr2.cxx initializes null; thints.cxx insertion and ndtxt.cxx copy bind the node. InitINetFormat also registers a char style, so this task does not invent a pointer-only complete implementation. Local retained undo nodes own their existing contents after structural removal; clearing them would break undo identity. Retained old hint containers are portable detached snapshots; native physical destruction remains unverified. Full char-style, client notification, visited state, protection and all attribute-family parity remain unverified. User authorizes iterative safe local leaves and explicitly prohibits saved source/helper artifacts and duplicate present/absent test profiles.

    Iteration124 restores the native null internet text-node backlink and GetpTextNode/GetTextNode/ChgTextNode contracts. Existing text-node hint assignment binds concrete internet attributes; portable map replacement, removal and consumption detach obsolete backlinks while retaining actual map/item identities during ordinary text updates and owned transfers. Detached snapshots/fragments have no node owner; retained undo paragraph objects still own their live hints through split/join/undo/redo. Source-owned ndtxt-hints decomposition keeps the unchanged1000-line gates and re-exports existing projection APIs. Native InitINetFormat also registers a char style, so pointer binding is not claimed as its full implementation. Full char-style/client/visited/protection/refcount/physical destruction,empty hints,all families and broader core/UI parity remain unverified. Existing runtime statuses/defaults/exceptions and registered save/open/recovery deviations remain unchanged;the new extracted helper is unverified,no module or goal promotion.

    Validation: all347 pre-existing test files are byte-identical;18 independent application cases added. All2649 application cases/266files and Chromium99 passed on their sole absent-reference full run;app coverage100%all four metrics. Inventory initially108pass/1fail because new helper row was misplaced;only that failed case replayed twice. First replay exposed two extracted projection declarations still listed under ndtxt;correct markers relocated while existing re-export APIs and projection bodies remain unchanged. Second replay1pass/2skipped;initial full summary plus failed-case raw coverage confirms combined100%all four metrics,with repository thresholds unchanged. Source-provenance first failed for an omitted filename-split registration;registered approved decomposition and repeated only that failed gate before the pending invariant/parity gates. All five restored source audits pass,semantic violations0. Static docs failed only on missing new callback comments;documentation repaired and only failed docs gate repeated,then pending file-size gate ran. Existing236 runtime statuses/defaults/exceptions preserved;one new helper remains unverified. Ignored-inclusive Agentplane scan3824files,0forbidden. No source/helper/native artifacts,network,upstream execution,passing suite/build replay or registered I/O deviation change. Full broad existing core/UI parity remains unverified.
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

Command: six static gates listed in Verify Steps. Result: pass after new JSDoc comment repair. Evidence: format,lint,typecheck,dependencies passed once;docs failed then passed;file-size passed once. Scope: approved eight paths and whole repository static contracts.

Command: one sequential upstream-absent build/application/inventory/scripts/Chromium profile listed in Verify Steps. Result: build,application,scripts,Chromium pass;inventory recovered using only its one failed case. Evidence: app2649/266files,coverage100%all metrics;scripts5/2files;Chromium99;inventory108initialpass/1fail,failed-case replay1fail then1pass/2skipped. Original full coverage four missing CLI statements/lines and three missing functions are all covered by final failed-case raw coverage;combined100%,standalone diagnostic CLI thresholds only,repository thresholds unchanged. Scope: actual existing model/history/browser behavior with reference directory absent. Vendor restored in finally each time;no passing suite or build replay.

Command: five restored source audits listed in Verify Steps. Result: pass after filename responsibility registration. Evidence: source-tree/UI resources pass once;provenance fails then passes;invariants/parity pass,semantic violations0. Scope: pinned references inspected only after absent test runs.

Command: scope-and-native-hashes,focused changed-manifest formatting,git diff --check,ignored-inclusive artifact audit. Result: pass. Evidence:347prior test files byte-identical;18newcases;eight semantic paths;236existing runtime fields/statuses/defaults/exceptions preserved except3bounded responsibility appendices and2relocated projection declarations;one unverified helper;unchanged projection bodies;six native file hashes;3824APfiles/0forbidden. Scope: bounded node ownership;full styles/clients/visited/refcounts/physical destruction/all families/core/UI goal remains unverified.

Command: same-actor read-only EVALUATOR exact-head review of a97a25df9bafd49d37733ffa12a1fa2306c29da4;ap doctor;node .agentplane/policy/check-routing.mjs;git status --short --untracked-files=all. Result: pass. Evidence: eight committed source/test/manifest files equal reviewed checkout;all bounded evidence assertions pass;quality verdict pass at .agentplane/tasks/202610042214-JKRYVR/quality/20261004-223228764-recovery-context/quality-report.json;doctor0errors with two unchanged legacy warnings;routing OK;clean main before quality persistence. Scope: this leaf only;no independent-agent review claim or broader parity promotion.

## Rollback Plan

Revert the task semantic commit if required; do not rewrite history or alter pre-existing changes.

## Findings

Pinned reference: LibreOffice 26.8.0.2, 9bc445578031fecf56086729d8e4940c77e14d65. Native txtinet.hxx defines a null node pointer with GetpTextNode/GetTextNode/ChgTextNode. txtatr2.cxx initializes null; thints.cxx insertion and ndtxt.cxx copy bind the node. InitINetFormat also registers a char style, so this task does not invent a pointer-only complete implementation. Local retained undo nodes own their existing contents after structural removal; clearing them would break undo identity. Retained old hint containers are portable detached snapshots; native physical destruction remains unverified. Full char-style, client notification, visited state, protection and all attribute-family parity remain unverified. User authorizes iterative safe local leaves and explicitly prohibits saved source/helper artifacts and duplicate present/absent test profiles.

Iteration124 restores the native null internet text-node backlink and GetpTextNode/GetTextNode/ChgTextNode contracts. Existing text-node hint assignment binds concrete internet attributes; portable map replacement, removal and consumption detach obsolete backlinks while retaining actual map/item identities during ordinary text updates and owned transfers. Detached snapshots/fragments have no node owner; retained undo paragraph objects still own their live hints through split/join/undo/redo. Source-owned ndtxt-hints decomposition keeps the unchanged1000-line gates and re-exports existing projection APIs. Native InitINetFormat also registers a char style, so pointer binding is not claimed as its full implementation. Full char-style/client/visited/protection/refcount/physical destruction,empty hints,all families and broader core/UI parity remain unverified. Existing runtime statuses/defaults/exceptions and registered save/open/recovery deviations remain unchanged;the new extracted helper is unverified,no module or goal promotion.

Validation: all347 pre-existing test files are byte-identical;18 independent application cases added. All2649 application cases/266files and Chromium99 passed on their sole absent-reference full run;app coverage100%all four metrics. Inventory initially108pass/1fail because new helper row was misplaced;only that failed case replayed twice. First replay exposed two extracted projection declarations still listed under ndtxt;correct markers relocated while existing re-export APIs and projection bodies remain unchanged. Second replay1pass/2skipped;initial full summary plus failed-case raw coverage confirms combined100%all four metrics,with repository thresholds unchanged. Source-provenance first failed for an omitted filename-split registration;registered approved decomposition and repeated only that failed gate before the pending invariant/parity gates. All five restored source audits pass,semantic violations0. Static docs failed only on missing new callback comments;documentation repaired and only failed docs gate repeated,then pending file-size gate ran. Existing236 runtime statuses/defaults/exceptions preserved;one new helper remains unverified. Ignored-inclusive Agentplane scan3824files,0forbidden. No source/helper/native artifacts,network,upstream execution,passing suite/build replay or registered I/O deviation change. Full broad existing core/UI parity remains unverified.
