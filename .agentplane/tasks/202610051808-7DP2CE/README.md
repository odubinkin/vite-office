---
id: "202610051808-7DP2CE"
title: "Resolve numbering undo through native node coordinates"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 17
origin:
  system: "manual"
depends_on: []
tags:
  - "lists"
  - "parity"
  - "undo"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T18:09:01.221Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-05T18:23:09.427Z"
  updated_by: "CODER"
  note: "Six statics once; ONEfull absent profile and original1failed-only fixture closure1pass20skipped;12271distinct app,109inventory,5scripts,120Chromium exact final production;21new/410prior unchanged/250records preserved;actual100%L/S/F/B;5restored audits0violations;exact semantic93facdef7baf305d671411b01e04bbfb25cf7660 same-agent EVALUATOR pass; goal active."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-05T18:22:35.820Z"
  updated_by: "EVALUATOR"
  note: "Source-confirmed represented numbering numeric ownership verified at semantic 93facdef7baf305d671411b01e04bbfb25cf7660; broad parity remains unverified."
  evaluated_sha: "93facdef7baf305d671411b01e04bbfb25cf7660"
  blueprint_digest: "dca97c760e50ec09dfd433e07b4ac4af3cb0f812927e6a967ee870fe0f1da1e6"
  evidence_refs:
    - ".agentplane/tasks/202610051808-7DP2CE/README.md"
    - ".agentplane/tasks/202610051808-7DP2CE/quality/20261005-182235820-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610051808-7DP2CE/quality/20261005-182235820-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610051808-7DP2CE/quality/20261005-182235820-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610051808-7DP2CE/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610051808-7DP2CE/evidence/exact-sha-review.json"
    - ".agentplane/tasks/202610051808-7DP2CE/evidence/scope-audit.json"
    - ".agentplane/tasks/202610051808-7DP2CE/evidence/final-coverage.json"
  findings:
    - "21new cases,410prior testfiles/250records preserved;12271distinct app/109inventory/5scripts/120Chromium final production. ONEfull absent profile then original1failed-only1pass20skipped; fixture correction only, unchanged production hashes; actual app/inventory100%L/S/F/B;5source audits0violations. Same agent explicit EVALUATOR, no independent review claim."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-10-05T18:09:16.662Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-10-05T18:23:09.427Z"
    author: "CODER"
    state: "ok"
    note: "Six statics once; ONEfull absent profile and original1failed-only fixture closure1pass20skipped;12271distinct app,109inventory,5scripts,120Chromium exact final production;21new/410prior unchanged/250records preserved;actual100%L/S/F/B;5restored audits0violations;exact semantic93facdef7baf305d671411b01e04bbfb25cf7660 same-agent EVALUATOR pass; goal active."
doc_version: 3
doc_updated_at: "2026-10-05T18:23:09.492Z"
doc_updated_by: "CODER"
description: "Iteration158: migrate represented NumUpDown, NumOrNoNum and DelNum undo ownership to native numeric SwUndRng/index coordinates, preserving current list semantics and conscious IO exceptions."
sections:
  Summary: "Remove stale paragraph identity from represented numbering undo actions; resolve current native document coordinates as pinned unnum.cxx."
  Scope: |-
    apps/office/src/sw/source/core/undo/unnum.ts
    apps/office/src/sw/source/core/undo/native-numbering-node-index.test.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Iteration158 migrate represented SwUndoNumUpDown and SwUndoDelNum retained cursor range objects to existing native numeric SwUndRng; replay actual current document PaM with native SetPaM. SwUndoNumOrNoNum stores m_nIndex and resolves current node with native nontext guard; SwUndoDelNum stores numeric history entries rather than paragraph pointers, preserves current direct-item/actual-level restoration and native DelNumRules replay. Source-confirmed unnum.cxx NumUpDown SwUndRng/m_nOffset, NumOrNoNum m_nIndex/nontext guard, DelNum numeric m_aNodes and range replay. No new adapter/helper/shared module, no stale node identity fallback. Full SwHistory migration, InsNum/ContinueNumbering payloads, split physical ownership and broad UI behavior remain unverified. Four scope paths, additive unnum metadata only,410prior testfiles byte-identical and250states/defaults/classifications/exceptions/prior evidence preserved. Native body/cell replacement, reversed and collapsed selections, structural range boundaries, list metadata independence/count-only contract, real shell UndoRedo tests. Six statics first and ONE full upstream-absent build/app/inventory/scripts/Chromium pass, vendor repository rename try/finally restore before5source audits. Tests never access upstream, exact failures/errors persist before assertions, only failed/new cases repeat and skipped=skipped. Actual app/inventory100%L/S/F/B, maps and any local initial source variants only ignored appcache; AP bounded English prose/counts/hashes/outcomes/exactnames only, no upstreamcopies/helpers/Python/probes/binaries/rawdiffs/sourceframes/diagnostics. Same agent explicit EVALUATOR exact semantic SHAreview, recorded verify, meaningful canonical finish and parent checkpoint clean main. Standing user iterative authorization applies; no network/outside/global/subagents; goal remains active."
  Verify Steps: |-
    1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates/changed-file remediation repeated.
    2. ONE sequential upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Vendor rename in repository try/finally restore before source audits; tests never invoke/access upstream. Persist exact failures/errors before assertions, failed/new-only repeats, skipped=skipped. Actual app/inventory L/S/F/B100%; maps only ignored appcache.
    3. New native numbering-index cases prove NumUpDown numeric range ownership across replacement of body and actual cell endpoints; reversed/collapsed shell cursor, independent unrelated list metadata and actual delta semantics. DelNum restores current numeric slots' native direct items/actual levels and replays inclusive range; count toggling targets only saved current native slot and ignores structural node as pinned source.410prior testfiles unchanged,250states/defaults/exceptions/prior evidence preserved;4paths/additive unnum owner, no broad promotion.
    4. After restoration run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Audit scope, prior tests/defaults/AP artifacts, doctor/routing, explicit same-agent EVALUATOR exact semantic SHApass, recordedverify/canonicalfinish/parentcheckpoint clean main.
  Verification: |-
    Command: six initial statics; ONEfull upstream-absent build/app/inventory/scripts/Chromium; original failed-only case; changed-file statics; five restored source audits; scope/AP/doctor/routing; exact semantic SHA EVALUATOR review. Result: pass after one new fixture-only correction. Evidence:12271distinct app/109inventory/5scripts/120Chromium final production;21new/410prior unchanged/250records preserved;actual100%app/inventory L/S/F/B;review93facdef7baf305d671411b01e04bbfb25cf7660 quality20261005-182235820-recovery-context same agent explicit EVALUATOR. Scope:4paths/additive unnum only, represented native numeric ownership;full native SwHistory/other payload/split/UI parity remains unverified. No passing replay/vendor restored/AP0forbidden/doctor0errors2oldwarnings/routingOK.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-05T18:23:09.427Z — VERIFY — ok

    By: CODER

    Note: Six statics once; ONEfull absent profile and original1failed-only fixture closure1pass20skipped;12271distinct app,109inventory,5scripts,120Chromium exact final production;21new/410prior unchanged/250records preserved;actual100%L/S/F/B;5restored audits0violations;exact semantic93facdef7baf305d671411b01e04bbfb25cf7660 same-agent EVALUATOR pass; goal active.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T18:22:57.070Z, excerpt_hash=sha256:ab8ea63ef85567afe47341f725ef0a34238cc9bcc13c2273d0d440633e8e1813

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610051808-7DP2CE/blueprint/resolved-snapshot.json
    - old_digest: dca97c760e50ec09dfd433e07b4ac4af3cb0f812927e6a967ee870fe0f1da1e6
    - current_digest: dca97c760e50ec09dfd433e07b4ac4af3cb0f812927e6a967ee870fe0f1da1e6
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610051808-7DP2CE

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610051808-7DP2CE
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the intentional semantic commit in a separately authorized follow-up task; preserve prior history and conscious IO exceptions."
  Findings: |-
    Iteration158 source-confirmed represented numbering history resolves current native SwNodes coordinates rather than retained SwTextNode objects. SwUndoNumUpDown captures existing SwUndRng and signed direction, Undo/Redo replay document NumUpDown through SetPaM; SwUndoNumOrNoNum stores pinned m_nIndex and changes only old/new counted flags on actual current text nodes, ignores structural nodes as native; SwUndoDelNum stores numeric index/direct-item/actual-level entries and SwUndRng, restores current entries and replays native DelNumRules. Current API/payload sizes/comments/defaults preserved. No new adapter, DTO, shared module or stale identity fallback. Complete native DelNum SwHistory restoration and InsNum/ContinueNumbering payloads remain unverified; this is a prerequisite for later split physical ownership migration, not fullmodule parity.
    Evidence:21new native body/cell section-preserving replacement cases, both delta directions and collapsed/forward/reversed selections, repeated UndoRedo3cycles, actual persistent current shell paragraph/cursor direction/content, untouched outside node, unrelated metadata independence, detached original immutability/independent direct-item snapshots and counted-state structural guard.410prior testfiles byte-identical;250states/defaults/classifications/exceptions/prior evidence preserved;4scopedpaths/additive unnum owner only.
    Six initial statics pass once. ONEfull upstream-absent profile:buildpass,12270app pass1fail/12271in314files,109inventory/36files100%,5scripts/2files,120Chromium pass exact final production variant. Exact originalfailure recorded beforeassertions: numeric count payload ignores a structural node at its saved index. Fixture mistakenly compared SwNodes SwTableNode to SwTable value; corrected comparison to actual GetTableNode only. Production source never changed afterfullprofile. Only originally failed1case repeated:1pass0fail20skipped. Initial20newpasses and all prior passes/inventory/browser/build/fullprofile not replayed. Changed-file Prettier/ESLint/JSDoc/actual no-emit tsconfig/1000line checks pass.
    Actual final app/inventory100%L/S/F/B:app12364lines/13538statements/3376functions/10070branches;inventory1464/1523/384/1080. Merge actual initial and failed-only case counters only after identical statement/function/branch location maps and unchanged final production hashes; no changed-source transfer or fabricated counters. Maps/results only ignored appcache, AP bounded Englishprose/counts/hashes/exactnames/outcomes only.5restored source audits pass0semanticviolations. AP ignoredinclusive scan4257files0forbidden, doctor0errors2oldwarnings,routingOK. Vendor restored infinally aftereach absent execution; no network/outside/global/subagents/upstreamcopies/helpers/Python/probes/binaries/rawdiffs/sourceframes/diagnostics inAP. Initial administrative task dependency incorrectly named the active composite parent as prerequisite, so start-ready refused; corrected dependency through PLANNER CLI and recomputedroute, no force bypass.
    Limits:represented numeric target/history behavior only. DelNum portable direct-item snapshots differ from full native SwHistory and conditional collection restoration; full numbering rule/outline/move/continue/section rings/merged/redline behavior and repeat contracts remain unverified. Other formatting/deletion action object payloads, retained split trailing-node bridge and native fresh-prefix/original-suffix split ownership remain open. Broad UI/list/table merged/nested/protected/layout/clipboard/rendering behavior remains open. Conscious save/open/recovery deviations preserved. Parent DOING/goalactive; no broad/fullmodule promotion.
    Same-agent explicit EVALUATOR exact semantic SHA93facdef7baf305d671411b01e04bbfb25cf7660 pass, quality20261005-182235820-recovery-context; no independent reviewer claimed. Commit-msg rejected generic code scope for lists/parity/undo task intent; route recomputed and same intentional staged change committed under allowed undo scope without bypass. Required evidence and validation limits are recorded in exact-sha-review,scope-audit,final-coverage. Goal remains active.
id_source: "generated"
---
## Summary

Remove stale paragraph identity from represented numbering undo actions; resolve current native document coordinates as pinned unnum.cxx.

## Scope

apps/office/src/sw/source/core/undo/unnum.ts
apps/office/src/sw/source/core/undo/native-numbering-node-index.test.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Iteration158 migrate represented SwUndoNumUpDown and SwUndoDelNum retained cursor range objects to existing native numeric SwUndRng; replay actual current document PaM with native SetPaM. SwUndoNumOrNoNum stores m_nIndex and resolves current node with native nontext guard; SwUndoDelNum stores numeric history entries rather than paragraph pointers, preserves current direct-item/actual-level restoration and native DelNumRules replay. Source-confirmed unnum.cxx NumUpDown SwUndRng/m_nOffset, NumOrNoNum m_nIndex/nontext guard, DelNum numeric m_aNodes and range replay. No new adapter/helper/shared module, no stale node identity fallback. Full SwHistory migration, InsNum/ContinueNumbering payloads, split physical ownership and broad UI behavior remain unverified. Four scope paths, additive unnum metadata only,410prior testfiles byte-identical and250states/defaults/classifications/exceptions/prior evidence preserved. Native body/cell replacement, reversed and collapsed selections, structural range boundaries, list metadata independence/count-only contract, real shell UndoRedo tests. Six statics first and ONE full upstream-absent build/app/inventory/scripts/Chromium pass, vendor repository rename try/finally restore before5source audits. Tests never access upstream, exact failures/errors persist before assertions, only failed/new cases repeat and skipped=skipped. Actual app/inventory100%L/S/F/B, maps and any local initial source variants only ignored appcache; AP bounded English prose/counts/hashes/outcomes/exactnames only, no upstreamcopies/helpers/Python/probes/binaries/rawdiffs/sourceframes/diagnostics. Same agent explicit EVALUATOR exact semantic SHAreview, recorded verify, meaningful canonical finish and parent checkpoint clean main. Standing user iterative authorization applies; no network/outside/global/subagents; goal remains active.

## Verify Steps

1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates/changed-file remediation repeated.
2. ONE sequential upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Vendor rename in repository try/finally restore before source audits; tests never invoke/access upstream. Persist exact failures/errors before assertions, failed/new-only repeats, skipped=skipped. Actual app/inventory L/S/F/B100%; maps only ignored appcache.
3. New native numbering-index cases prove NumUpDown numeric range ownership across replacement of body and actual cell endpoints; reversed/collapsed shell cursor, independent unrelated list metadata and actual delta semantics. DelNum restores current numeric slots' native direct items/actual levels and replays inclusive range; count toggling targets only saved current native slot and ignores structural node as pinned source.410prior testfiles unchanged,250states/defaults/exceptions/prior evidence preserved;4paths/additive unnum owner, no broad promotion.
4. After restoration run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Audit scope, prior tests/defaults/AP artifacts, doctor/routing, explicit same-agent EVALUATOR exact semantic SHApass, recordedverify/canonicalfinish/parentcheckpoint clean main.

## Verification

Command: six initial statics; ONEfull upstream-absent build/app/inventory/scripts/Chromium; original failed-only case; changed-file statics; five restored source audits; scope/AP/doctor/routing; exact semantic SHA EVALUATOR review. Result: pass after one new fixture-only correction. Evidence:12271distinct app/109inventory/5scripts/120Chromium final production;21new/410prior unchanged/250records preserved;actual100%app/inventory L/S/F/B;review93facdef7baf305d671411b01e04bbfb25cf7660 quality20261005-182235820-recovery-context same agent explicit EVALUATOR. Scope:4paths/additive unnum only, represented native numeric ownership;full native SwHistory/other payload/split/UI parity remains unverified. No passing replay/vendor restored/AP0forbidden/doctor0errors2oldwarnings/routingOK.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-05T18:23:09.427Z — VERIFY — ok

By: CODER

Note: Six statics once; ONEfull absent profile and original1failed-only fixture closure1pass20skipped;12271distinct app,109inventory,5scripts,120Chromium exact final production;21new/410prior unchanged/250records preserved;actual100%L/S/F/B;5restored audits0violations;exact semantic93facdef7baf305d671411b01e04bbfb25cf7660 same-agent EVALUATOR pass; goal active.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T18:22:57.070Z, excerpt_hash=sha256:ab8ea63ef85567afe47341f725ef0a34238cc9bcc13c2273d0d440633e8e1813

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610051808-7DP2CE/blueprint/resolved-snapshot.json
- old_digest: dca97c760e50ec09dfd433e07b4ac4af3cb0f812927e6a967ee870fe0f1da1e6
- current_digest: dca97c760e50ec09dfd433e07b4ac4af3cb0f812927e6a967ee870fe0f1da1e6
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610051808-7DP2CE

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610051808-7DP2CE
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the intentional semantic commit in a separately authorized follow-up task; preserve prior history and conscious IO exceptions.

## Findings

Iteration158 source-confirmed represented numbering history resolves current native SwNodes coordinates rather than retained SwTextNode objects. SwUndoNumUpDown captures existing SwUndRng and signed direction, Undo/Redo replay document NumUpDown through SetPaM; SwUndoNumOrNoNum stores pinned m_nIndex and changes only old/new counted flags on actual current text nodes, ignores structural nodes as native; SwUndoDelNum stores numeric index/direct-item/actual-level entries and SwUndRng, restores current entries and replays native DelNumRules. Current API/payload sizes/comments/defaults preserved. No new adapter, DTO, shared module or stale identity fallback. Complete native DelNum SwHistory restoration and InsNum/ContinueNumbering payloads remain unverified; this is a prerequisite for later split physical ownership migration, not fullmodule parity.
Evidence:21new native body/cell section-preserving replacement cases, both delta directions and collapsed/forward/reversed selections, repeated UndoRedo3cycles, actual persistent current shell paragraph/cursor direction/content, untouched outside node, unrelated metadata independence, detached original immutability/independent direct-item snapshots and counted-state structural guard.410prior testfiles byte-identical;250states/defaults/classifications/exceptions/prior evidence preserved;4scopedpaths/additive unnum owner only.
Six initial statics pass once. ONEfull upstream-absent profile:buildpass,12270app pass1fail/12271in314files,109inventory/36files100%,5scripts/2files,120Chromium pass exact final production variant. Exact originalfailure recorded beforeassertions: numeric count payload ignores a structural node at its saved index. Fixture mistakenly compared SwNodes SwTableNode to SwTable value; corrected comparison to actual GetTableNode only. Production source never changed afterfullprofile. Only originally failed1case repeated:1pass0fail20skipped. Initial20newpasses and all prior passes/inventory/browser/build/fullprofile not replayed. Changed-file Prettier/ESLint/JSDoc/actual no-emit tsconfig/1000line checks pass.
Actual final app/inventory100%L/S/F/B:app12364lines/13538statements/3376functions/10070branches;inventory1464/1523/384/1080. Merge actual initial and failed-only case counters only after identical statement/function/branch location maps and unchanged final production hashes; no changed-source transfer or fabricated counters. Maps/results only ignored appcache, AP bounded Englishprose/counts/hashes/exactnames/outcomes only.5restored source audits pass0semanticviolations. AP ignoredinclusive scan4257files0forbidden, doctor0errors2oldwarnings,routingOK. Vendor restored infinally aftereach absent execution; no network/outside/global/subagents/upstreamcopies/helpers/Python/probes/binaries/rawdiffs/sourceframes/diagnostics inAP. Initial administrative task dependency incorrectly named the active composite parent as prerequisite, so start-ready refused; corrected dependency through PLANNER CLI and recomputedroute, no force bypass.
Limits:represented numeric target/history behavior only. DelNum portable direct-item snapshots differ from full native SwHistory and conditional collection restoration; full numbering rule/outline/move/continue/section rings/merged/redline behavior and repeat contracts remain unverified. Other formatting/deletion action object payloads, retained split trailing-node bridge and native fresh-prefix/original-suffix split ownership remain open. Broad UI/list/table merged/nested/protected/layout/clipboard/rendering behavior remains open. Conscious save/open/recovery deviations preserved. Parent DOING/goalactive; no broad/fullmodule promotion.
Same-agent explicit EVALUATOR exact semantic SHA93facdef7baf305d671411b01e04bbfb25cf7660 pass, quality20261005-182235820-recovery-context; no independent reviewer claimed. Commit-msg rejected generic code scope for lists/parity/undo task intent; route recomputed and same intentional staged change committed under allowed undo scope without bypass. Required evidence and validation limits are recorded in exact-sha-review,scope-audit,final-coverage. Goal remains active.
