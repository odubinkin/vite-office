---
id: "202610050126-3HH6D5"
title: "Restore node-owned ignore-expansion state and pure hint Update"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "parity"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T01:28:26.850Z"
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
  updated_at: "2026-10-05T01:43:27.502Z"
  updated_by: "EVALUATOR"
  note: "Same-actor read-only review of exact semantic SHA 5d2851ce11906bdb470530beba6e4c8e83e31171 passes the bounded131leaf;full parity not promoted."
  evaluated_sha: "5d2851ce11906bdb470530beba6e4c8e83e31171"
  blueprint_digest: "d3fcdbe59a4a9d445a4e3a0aa14793cfcc8629123a43b2ecfb8806fd3c34d03d"
  evidence_refs:
    - ".agentplane/tasks/202610050126-3HH6D5/README.md"
    - ".agentplane/tasks/202610050126-3HH6D5/quality/20261005-014327502-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610050126-3HH6D5/quality/20261005-014327502-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610050126-3HH6D5/quality/20261005-014327502-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610050126-3HH6D5/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610050126-3HH6D5/evidence/scope-and-native-hashes.json"
    - ".agentplane/tasks/202610050126-3HH6D5/evidence/absent-profile.json"
    - ".agentplane/tasks/202610050126-3HH6D5/evidence/failed-only-replay-2.json"
    - ".agentplane/tasks/202610050126-3HH6D5/evidence/restored-source-audits.json"
    - "git exact SHA 5d2851ce11906bdb470530beba6e4c8e83e31171 source bytes and seven native hashes checked"
  findings:
    - "Native SwNode storage/accessors and end-equal ignore bypass match pinned owner contracts. Coordinate-only Update and DEFAULT postphase preserve actual identities,flags and retained values. Comparator extracted unchanged. Seven paths,357prior tests byte-identical,241runtime states/defaults/exceptions unchanged;four bounded appendices/two helper exports only."
    - "One absent-reference full profile:build,app3560(first3559pass/1fixturefail),inventory109,scripts5,Chromium99;app/inventory100%allfourcoverage. Exact firstfailedname captured;only failed locality case replayed twice,finally1passed/548skipped. Corrected AUTO shared-handle merge and native end-descending expectations;production unchanged after fullprofile. Zero passing case/suite/build replays. Static size-only failed recovery passed;five restored audits0semanticviolations;doctor0errors/two unchanged legacywarnings;routingOK;AP3899files0forbidden."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: port native SwNode ignore-expansion ownership and pure Update/default insertion separation under the standing parity goal;one absent profile and exact failed-name recovery only."
events:
  -
    type: "status"
    at: "2026-10-05T01:28:27.331Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port native SwNode ignore-expansion ownership and pure Update/default insertion separation under the standing parity goal;one absent profile and exact failed-name recovery only."
doc_version: 3
doc_updated_at: "2026-10-05T01:42:33.364Z"
doc_updated_by: "CODER"
description: "Port native SwNode IgnoreDontExpand default/state and separate generic hint Update coordinates from DEFAULT InsertText postprocessing for actual AUTO/INET owners,with source-independent tests and one absent-reference full profile."
sections:
  Summary: "Restore node-owned ignore-expansion state and pure hint Update."
  Scope: |-
    - apps/office/src/sw/source/core/docnode/node.ts
    - apps/office/src/sw/source/core/txtnode/ndtxt-hint-update.ts
    - apps/office/src/sw/source/core/txtnode/ndhints.ts
    - apps/office/src/sw/source/core/txtnode/ndhints-range.ts
    - apps/office/src/sw/source/core/txtnode/native-ignore-hint-expansion.test.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
  Plan: "Port native SwNode private m_bIgnoreDontExpand=false and zero-argument IsIgnoreDontExpand/boolean SetIgnoreDontExpand at the actual base-node owner from node.hxx/node.cxx. Supported positive SwpHints.Update reads its own bound node state;true bypasses end DontExpand and locked reset/suppression while preserving actual attributes/items/map/backlinks/flags. Generic Update becomes coordinate-only as native SwTextNode::Update;DEFAULT InsertText postprocessing is a separate source-owned AdjustInsertTextHints export in the existing hint-update module and operates after coordinate Update,restoring both zero and nonempty DontExpand end-equal ranges and preserving nonempty paragraph-start eligibility. Existing SwpHints.insertText ordinary/items-only paths use a private insertion coordinator that calls Update then the DEFAULT postphase;negative EraseText/Cut/explicit-link fragments retain their existing bounded contracts. Extract the existing compareHints comparator unchanged into existing ndhints-range only to retain1000-line gates,map its added export;no new module or broad normalization changes. Add one literal source-independent test file for both families/eight hint flags/locked-unlocked/ignore states,positive generic Update versus node insertion,end/before/interior/start/paragraph/zero/negative boundaries,base-node default/accessor/owner locality/silent setters,actual maps/items/backlinks/7INET fields/IDs and cloned node/graph16/Worker5 fresh false state. Preserve357prior test files and241existing runtime states/defaults/exceptions except four bounded responsibility appendices and two mapped helper exports,no promotions. Static6 first;one sequential full build/app/inventory/scripts/Chromium profile with upstream renamed inside repo and restored in finally;record bounded exact failed names immediately and repeat only concrete failed cases,never passing suites/cases/build. Five source audits only after restoration,then exact scope/native hashes/APartifact audit,same-actor readonly exact-SHAquality/doctor/routing/verification/canonical finish. No upstream execution by tests,no upstream/source/helper/Python/raw diagnostics artifacts,no network/outside/global access. All SwInsertFlags/EMPTY/FORCE/NOHINT temporary toggling/full API/default manager/caller/selection changes are a subsequent task after this owner contract;GCAttr/full zero slicing/COPY/BuildPortions/dummy/endless/other families/CharFormat generalization/style clients/UNO/refcounts/full core/UI remain unverified. Registered save/open/recovery deviations unchanged."
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

    Static first,one absent-reference full profile,record exact failed names immediately and replay only failed cases. Restore before five source audits and all scope/APaudits. Audit357prior test files/241runtime states and native hashes. No upstream/helper/source artifacts.
  Verification: "Pending implementation and validation."
  Rollback Plan: "Revert the semantic leaf commit without rewriting history."
  Findings: |-
    Preflight131:cleanmain99349e412e50dfcf0e90b3952f3e49dc81d86a52,direct,onlyparentDOING. Iteration130 verified progress,notblocked. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native IgnoreDontExpand lives on SwNode(node.hxx106/accessors168-169),not SwContentNode;all node.cxxconstructors initialize false. SwTextNode::Update ndtxt.cxx1374 expands an end-equal hint when IsIgnoreDontExpand is true,without resetting DontExpand even when locked. Native InsertText saves this state,temporarily overrides it forFORCE,restores it before native end-equal/post-prefix processing. DEFAULT postprocessing can undo nonempty end expansion while preserving DontExpand;current helper handles only zero end-equal hints and mixes insertion postprocessing into genericUpdate. This leaf repairs the owner/coordinate/postphase contract before implementing the flags and callers. CompareSwpHtStart ndhints.cxx33 establishes existing start/end/Which ordering;extraction preserves current bounded comparator body and leaves native pointer-tie/CHARFMT sorting unverified. Standing goal authorizes this safe local implementation/refactoring. Four matched policies read;user-instructions absent. No network/outside/global access.

    Implementation131: restored native SwNode IgnoreDontExpand=false and silent accessors, bound positive Update owner state, separate DEFAULT InsertText adjustment, unchanged comparator extraction. Seven semantic paths;357prior test files byte-identical;241runtime rows/status/default/exception fields preserved except four bounded prose appendices and two helper exports. Added549literal app cases. Static6:first five passed,file-size1001failed;only failed size gate repeated after compacting the call and passed,changed file formatting/lint passed. One upstream-absent full profile:buildpassed;app3559pass/1newfixturefail of3560/275files with100%allfourcoverage;inventory109/36files and100%allfourcoverage;scripts5;Chromium99. First exactfailedname saved immediately. AUTO collector shares the previous handle and merges; longer end sorts before shorter INET. Only this failed test repeated twice (first revealed stale order expectation,second passed1/548skipped);zero passing test cases/suites/builds repeated. Production unchanged after full profile. Five restored-source audits passed with0semanticviolations. Seven native source hashes recorded;ignored-inclusiveAPscan3899files/0forbidden. No upstream/code/helper/Python/rawdiagnostic artifacts. Native Insert flags/callers/selection/full3rd-paramAPI follow next leaf;full core/UI and other documented gaps remain unverified.
id_source: "generated"
---
## Summary

Restore node-owned ignore-expansion state and pure hint Update.

## Scope

- apps/office/src/sw/source/core/docnode/node.ts
- apps/office/src/sw/source/core/txtnode/ndtxt-hint-update.ts
- apps/office/src/sw/source/core/txtnode/ndhints.ts
- apps/office/src/sw/source/core/txtnode/ndhints-range.ts
- apps/office/src/sw/source/core/txtnode/native-ignore-hint-expansion.test.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

## Plan

Port native SwNode private m_bIgnoreDontExpand=false and zero-argument IsIgnoreDontExpand/boolean SetIgnoreDontExpand at the actual base-node owner from node.hxx/node.cxx. Supported positive SwpHints.Update reads its own bound node state;true bypasses end DontExpand and locked reset/suppression while preserving actual attributes/items/map/backlinks/flags. Generic Update becomes coordinate-only as native SwTextNode::Update;DEFAULT InsertText postprocessing is a separate source-owned AdjustInsertTextHints export in the existing hint-update module and operates after coordinate Update,restoring both zero and nonempty DontExpand end-equal ranges and preserving nonempty paragraph-start eligibility. Existing SwpHints.insertText ordinary/items-only paths use a private insertion coordinator that calls Update then the DEFAULT postphase;negative EraseText/Cut/explicit-link fragments retain their existing bounded contracts. Extract the existing compareHints comparator unchanged into existing ndhints-range only to retain1000-line gates,map its added export;no new module or broad normalization changes. Add one literal source-independent test file for both families/eight hint flags/locked-unlocked/ignore states,positive generic Update versus node insertion,end/before/interior/start/paragraph/zero/negative boundaries,base-node default/accessor/owner locality/silent setters,actual maps/items/backlinks/7INET fields/IDs and cloned node/graph16/Worker5 fresh false state. Preserve357prior test files and241existing runtime states/defaults/exceptions except four bounded responsibility appendices and two mapped helper exports,no promotions. Static6 first;one sequential full build/app/inventory/scripts/Chromium profile with upstream renamed inside repo and restored in finally;record bounded exact failed names immediately and repeat only concrete failed cases,never passing suites/cases/build. Five source audits only after restoration,then exact scope/native hashes/APartifact audit,same-actor readonly exact-SHAquality/doctor/routing/verification/canonical finish. No upstream execution by tests,no upstream/source/helper/Python/raw diagnostics artifacts,no network/outside/global access. All SwInsertFlags/EMPTY/FORCE/NOHINT temporary toggling/full API/default manager/caller/selection changes are a subsequent task after this owner contract;GCAttr/full zero slicing/COPY/BuildPortions/dummy/endless/other families/CharFormat generalization/style clients/UNO/refcounts/full core/UI remain unverified. Registered save/open/recovery deviations unchanged.

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

Static first,one absent-reference full profile,record exact failed names immediately and replay only failed cases. Restore before five source audits and all scope/APaudits. Audit357prior test files/241runtime states and native hashes. No upstream/helper/source artifacts.

## Verification

Pending implementation and validation.

## Rollback Plan

Revert the semantic leaf commit without rewriting history.

## Findings

Preflight131:cleanmain99349e412e50dfcf0e90b3952f3e49dc81d86a52,direct,onlyparentDOING. Iteration130 verified progress,notblocked. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native IgnoreDontExpand lives on SwNode(node.hxx106/accessors168-169),not SwContentNode;all node.cxxconstructors initialize false. SwTextNode::Update ndtxt.cxx1374 expands an end-equal hint when IsIgnoreDontExpand is true,without resetting DontExpand even when locked. Native InsertText saves this state,temporarily overrides it forFORCE,restores it before native end-equal/post-prefix processing. DEFAULT postprocessing can undo nonempty end expansion while preserving DontExpand;current helper handles only zero end-equal hints and mixes insertion postprocessing into genericUpdate. This leaf repairs the owner/coordinate/postphase contract before implementing the flags and callers. CompareSwpHtStart ndhints.cxx33 establishes existing start/end/Which ordering;extraction preserves current bounded comparator body and leaves native pointer-tie/CHARFMT sorting unverified. Standing goal authorizes this safe local implementation/refactoring. Four matched policies read;user-instructions absent. No network/outside/global access.

Implementation131: restored native SwNode IgnoreDontExpand=false and silent accessors, bound positive Update owner state, separate DEFAULT InsertText adjustment, unchanged comparator extraction. Seven semantic paths;357prior test files byte-identical;241runtime rows/status/default/exception fields preserved except four bounded prose appendices and two helper exports. Added549literal app cases. Static6:first five passed,file-size1001failed;only failed size gate repeated after compacting the call and passed,changed file formatting/lint passed. One upstream-absent full profile:buildpassed;app3559pass/1newfixturefail of3560/275files with100%allfourcoverage;inventory109/36files and100%allfourcoverage;scripts5;Chromium99. First exactfailedname saved immediately. AUTO collector shares the previous handle and merges; longer end sorts before shorter INET. Only this failed test repeated twice (first revealed stale order expectation,second passed1/548skipped);zero passing test cases/suites/builds repeated. Production unchanged after full profile. Five restored-source audits passed with0semanticviolations. Seven native source hashes recorded;ignored-inclusiveAPscan3899files/0forbidden. No upstream/code/helper/Python/rawdiagnostic artifacts. Native Insert flags/callers/selection/full3rd-paramAPI follow next leaf;full core/UI and other documented gaps remain unverified.
