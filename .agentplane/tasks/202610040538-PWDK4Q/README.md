---
id: "202610040538-PWDK4Q"
title: "Preserve Writer ruler tab item identity"
result_summary: "Preserved Writer ruler raw item identity and selected-tab collision metadata with working Undo/Redo;intentional I/O/recovery exceptions retained."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 29
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T05:54:19.142Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-04T05:57:09.163Z"
  updated_by: "CODER"
  note: "Final documentation/evidence revision verified without rerunning tests;exact unchanged semantic SHAe7e27e6398df1bf2e35adbce80569dd6b5124f8d has same-actor EVALUATOR pass. Final absent tests1134+109+12+63pass/restored,100%coverage,0semantic;9paths/3sourcehashes/AP forbidden0;full goal remains open."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-04T05:56:40.960Z"
  updated_by: "EVALUATOR"
  note: "Same-actor separate EVALUATOR review of exact semantic SHAe7e27e6398df1bf2e35adbce80569dd6b5124f8d:bounded raw-tab identity and collision ordering pass;full native/parent open."
  evaluated_sha: "e7e27e6398df1bf2e35adbce80569dd6b5124f8d"
  blueprint_digest: "1ab5fd5d7851409b9840c6c560b091d7ad052fc1f5e17dc09157d8bacca7881d"
  evidence_refs:
    - ".agentplane/tasks/202610040538-PWDK4Q/README.md"
    - ".agentplane/tasks/202610040538-PWDK4Q/quality/20261004-055640960-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610040538-PWDK4Q/quality/20261004-055640960-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610040538-PWDK4Q/quality/20261004-055640960-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610040538-PWDK4Q/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610040538-PWDK4Q/final-integrity.json"
    - ".agentplane/tasks/202610040538-PWDK4Q/source-inspection.json"
    - ".agentplane/tasks/202610040538-PWDK4Q/full-verify.json"
    - ".agentplane/tasks/202610040538-PWDK4Q/vendor-absent-runtime.json"
    - ".agentplane/tasks/202610040538-PWDK4Q/vendor-absent-browser.json"
    - ".agentplane/tasks/202610040538-PWDK4Q/semantic-audit.json"
  findings:
    - "Reviewed paired immutable raw index/position projection,compact label/raw callback boundary and item Clone/Remove/Insert ordering. Default/interleaved stops retain identity;selected metadata wins collision;owned actual Writer snapshots,reordering,Undo/Redo,cancellation and rebuilt1280/390Chromium show the accepted contract."
    - "9semantic paths;282of284oldtests unchanged;only4formatted DTO fixture payloads changed with every assertion retained.220rows each retain prior order/status/owner/default/exception fields,3append-only updates,no new rows/native promotion;3sourcehashes unchanged."
    - "Final tests with upstream unavailable:1134app+109tool+12scripts+63browser pass/restored;100%four app/inventory coverage metrics;0semantic. Source-present full verify completed before user steering is historical evidence;current already-live absent run finished without restart and no tests rerun afterwards. Future tests once without upstream;source CLI audits separate."
    - "Ignored-inclusive raw/decoded Agentplane source/helper/Python/frame/code-diff/archive findings0;only5historical prose-only diff refs. Doctor0errors/2knownwarnings/2info;registered save/open/recovery exceptions preserved."
commit:
  hash: "e7e27e6398df1bf2e35adbce80569dd6b5124f8d"
  message: "🎯 PWDK4Q code: preserve Writer ruler tab item identity"
comments:
  -
    author: "CODER"
    body: "Start:standing goal authorizes one tab item identity correction;source hashes/results only,owned fixtures and tests with no upstream invocation or helper artifacts."
  -
    author: "CODER"
    body: "Verified:raw tab item identity survives compact browser markers,reordering and default stops;selected metadata wins move collisions via native remove-then-insert ordering. Final absent1134+109+12+63tests pass/restored;no reruns after user single-run steering;100%coverage/0semantic,AP forbidden0,exact semantic same-actor quality pass. Full native/parent open."
events:
  -
    type: "status"
    at: "2026-10-04T05:39:10.710Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start:standing goal authorizes one tab item identity correction;source hashes/results only,owned fixtures and tests with no upstream invocation or helper artifacts."
  -
    type: "verify"
    at: "2026-10-04T05:56:02.333Z"
    author: "CODER"
    state: "ok"
    note: "Pass:9paths;282of284prior tests unchanged,4DTOpayloads/all old assertions retained;220rows/3append-only updates/no status promotion;3pinned hashes;AP forbidden0. Final vendor-absent1134+109+12+63pass/restored,100%four coverage metrics,0semantic. Pre-steering full verify historical only;no further suite reruns. Exact semantic quality pending;full native/parent open."
  -
    type: "verify"
    at: "2026-10-04T05:57:09.163Z"
    author: "CODER"
    state: "ok"
    note: "Final documentation/evidence revision verified without rerunning tests;exact unchanged semantic SHAe7e27e6398df1bf2e35adbce80569dd6b5124f8d has same-actor EVALUATOR pass. Final absent tests1134+109+12+63pass/restored,100%coverage,0semantic;9paths/3sourcehashes/AP forbidden0;full goal remains open."
  -
    type: "status"
    at: "2026-10-04T05:57:24.695Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified:raw tab item identity survives compact browser markers,reordering and default stops;selected metadata wins move collisions via native remove-then-insert ordering. Final absent1134+109+12+63tests pass/restored;no reruns after user single-run steering;100%coverage/0semantic,AP forbidden0,exact semantic same-actor quality pass. Full native/parent open."
doc_version: 3
doc_updated_at: "2026-10-04T05:57:24.696Z"
doc_updated_by: "CODER"
description: "Iteration91:stop compact visible-tab ordinal from addressing hidden default tab in the raw SvxTabStopItem;retain model index in immutable browser projection and verify actual Writer/Undo/Chromium without upstream test dependencies."
sections:
  Summary: "Iteration91 preserves native tab item identity through the compact browser ruler projection."
  Scope: "apps/office/src/sw/browser/presentation/writer-view-projection.ts; apps/office/src/sw/browser/presentation/WriterRulers.tsx; apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts; apps/office/src/sw/browser/presentation/WriterPageLayout.test.tsx; apps/office/src/sw/browser/presentation/WriterRulers-tracking.test.tsx; apps/office/src/sw/browser/presentation/writer-view-ruler-tab-identity.test.tsx; apps/office/e2e/writer-ruler-tab-identity.spec.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json;core move operation refactor only,no command/resource/policy/save/open/recovery edits."
  Plan: |-
    Standing iterative parity goal authorizes one local correction:read-only pinned Ruler ImplHitTest/SvxRuler UpdateTabs and ApplyTabs confirm default tabs do not admit dragging but the selected tab retains its item index. Reproduce hidden default preceding explicit tab in actual Writer and Chromium. Add immutable browser ruler-tab records pairing position with raw item index;derive explicit CSS positions from those records and use raw item index for shell movement. Do not add parallel-array index hacks,position search,timers or core filtering;SwWrtShell raw index and SvxTabStop metadata/undo contracts stay unchanged. Ruler DTO absence means no explicit marker;old hand-authored ruler fixtures supply the new owned DTO and removed-handle fixture updates it,retaining all assertions. Verify crossing/reordering/collision,default+explicit metadata and hidden defaults,one accepted undo,cancellation/redo and later editing. Preserve old tests and manifest metadata;append evidence/responsibility only to two existing browser rows,220rows unchanged. Full verify/100%four coverage/0semantic;vendor-absent tests/restoration;exact8paths/sourcehash/ignored-inclusive artifact checks;same-actor exact semantic EVALUATOR;close leaf and record parent progress. No helpers/source/native artifacts,upstream test reads/compilation/execution,network/outside-repo or I/O/recovery deviations. Full native ruler/UI/parent remain unverified.

    Internal scope refinement under standing goal:owned collision baseline proves moved tab loses adjustment/decimal/fill to later destination because shell rebuilds all stops in original iteration order. Pinned SvxRuler ApplyTabs removes the selected raw index then inserts its copied moved stop;SvxTabStopItem Insert replaces any colliding position. Include wrtsh1.ts as9thsemantic path and editeng/source/items/paraitem.cxx as3rdread-only sourcehash. Refactor existing move to Clone/Remove/Insert while retaining invalid-input/nonpositive deletion/item default distance/undo contracts. This is the same end-to-end selected-tab identity correction,no new gesture feature. Baseline4expected owned failures/1pass and2browser failures on existing built product;initial build intentionally cannot typecheck new DTO assertions before interface addition. Final fresh builds/fullverify required;no gates skipped.

    Metadata evidence is appended to the existing SwWrtShell row as well as WriterRulers/projection:three updated rows,no new rows/status changes. This is traceability for the approved core refactor within the same two manifest paths. Old fixture edits are exactly3DTO payload additions plus1removed-handle DTO update;formatter changes confined to those payloads,all old assertions and bytes outside them retained.

    User steering on2026-10-04:do not run each suite once with upstream and again without it. Tests must run once with vendor/libreoffice-reference unavailable;source-dependent static CLI audits run separately after restoration. The source-present full verify already completed before this instruction is historical evidence;the current live vendor-absent process is completed without restarting or an additional suite run. Future verification plans split existing npm verify gates into non-test static checks and one vendor-absent test/coverage/browser pass;no helper files or upstream test dependencies.
  Verify Steps: "1.Read pinned editeng/source/items/paraitem.cxx Insert plus svtools/source/control/ruler.cxx ImplHitTest and svx/source/dialog/svxruler.cxx UpdateTabs/ApplyTabs read-only,hashes/conclusions only. 2.Add owned actual Writer/immutable projection/Undo regression and desktop/mobile Chromium new tab drag;record pre-fix failures;confirm raw item index despite preceding/interleaved defaults,unchanged other stops/all metadata/default distance,reordering/collision,Escape and accepted single undo/redo with new snapshot indices. Existing ruler/paragraph-ruler cases retained. 3.Exact9semantic paths;284prior test/spec files,282byte-identical;only3owned DTO additions in old WriterPageLayout fixtures and1removed-handle DTO update in WriterRulers-tracking,all assertions and bytes outside those formatted fixture payloads preserved.220prior manifest rows/order/status/default/owner/exception fields unchanged,three append-only evidence/responsibility/justification updates;no new rows/status promotion;3pinned hashes unchanged. 4.Declared full gates already passed before user steering:1134app+109tool+63browser+2resources,type/lint/static,100%statements/branches/functions/lines app/inventory,0semantic. Do not rerun full suites with source present. Complete the already-live vendor-absent test pass once;source-dependent static CLI audits are separate from tests and no suite reads/compiles/invokes upstream. 5.Rename vendor/libreoffice-reference inside vendor;npm run test;npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts;npm run test:e2e pass;restore in finally. 6.git diff --check,routing,doctor0errors/knownwarnings,ignored-inclusive raw/decoded AP source/helper/Python/frame/diff/archive findings0. 7.Same-actor separate EVALUATOR exact semantic SHA pass,clean final tracked state,leafDONE,parentDOING;full native/goal remain unproven."
  Verification: |-
    Command: npm run test; npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e, with vendor/libreoffice-reference renamed inside vendor and restored in finally.
    Result: pass. Evidence: 1134 application tests/218 files, 109 inventory tests/36 files, 12 script tests/3 files (including 2 resource cases), 63 Chromium scenarios; every result records upstreamDirectoryPresent=false; restoration=true. Scope: final owned tests and browser behavior without pinned source availability. Native compilation/execution=false.
    Command: npm run verify (completed before the user's single-run steering). Result: pass. Evidence: format/lint/type/dependency/resources/static build/JSDoc/file size/source tree/provenance/invariants/parity gates; 100% statements/branches/functions/lines in app and inventory; semanticViolationCount=0 separately captured by npm run inventory:parity. This is historical pre-steering evidence; no additional full verify or test suite was run after the steering.
    Command: focused owned Vitest and fresh-build Chromium (before steering). Result: pass. Evidence: 49 tests/6 files and 2 widths1280/390; pre-fix 4 owned failures/1 pass and 2 browser failures establish wrong raw index and collision metadata. Scope: raw/default/interleaved tab identity, reordering, complete item metadata/default distance, one accepted Undo/Redo, Escape and immutable retained snapshots.
    Command: exact scope/manifest/source hash checks, ignored-inclusive Agentplane raw/decoded audit, git diff --check, node .agentplane/policy/check-routing.mjs, ap doctor. Result: pass. Evidence: 9 semantic paths; 282 of284 old test files byte-identical; 4 fixture DTO updates in2oldfiles,all assertions and bytes outside formatted payloads preserved; 220 rows/order/metadata retained,3append-only updates,no new rows/status promotion; 3 pinned hashes unchanged; Agentplane source/helper/Python/frame/code-diff/archive findings0,5historical prose-only diffs; doctor0errors/2knownwarnings/2info.
    Future verification follows user steering: one suite pass without upstream, source-dependent static CLI audits separate after restoration. Same-actor separate EVALUATOR pass: quality/20261004-055640960-recovery-context/quality-report.json evaluated_sha=e7e27e6398df1bf2e35adbce80569dd6b5124f8d. This is not independent-agent review. Semantic and pinned source hashes remain unchanged; canonical finish records final clean closure. Full native ruler geometry/default glyphs/type glyphs/RTL/modifiers/deletion/capture/Writer/browser/parent remain unverified. Registered save/open/recovery exceptions unchanged.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-04T05:56:02.333Z — VERIFY — ok

    By: CODER

    Note: Pass:9paths;282of284prior tests unchanged,4DTOpayloads/all old assertions retained;220rows/3append-only updates/no status promotion;3pinned hashes;AP forbidden0. Final vendor-absent1134+109+12+63pass/restored,100%four coverage metrics,0semantic. Pre-steering full verify historical only;no further suite reruns. Exact semantic quality pending;full native/parent open.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T05:55:33.612Z, excerpt_hash=sha256:fc1d0dfad4ab1afe8b863d0234ff060e06111f1c9a187dd626e4f640c199a5c6

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610040538-PWDK4Q/blueprint/resolved-snapshot.json
    - old_digest: 1ab5fd5d7851409b9840c6c560b091d7ad052fc1f5e17dc09157d8bacca7881d
    - current_digest: 1ab5fd5d7851409b9840c6c560b091d7ad052fc1f5e17dc09157d8bacca7881d
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610040538-PWDK4Q

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610040538-PWDK4Q
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-10-04T05:57:09.163Z — VERIFY — ok

    By: CODER

    Note: Final documentation/evidence revision verified without rerunning tests;exact unchanged semantic SHAe7e27e6398df1bf2e35adbce80569dd6b5124f8d has same-actor EVALUATOR pass. Final absent tests1134+109+12+63pass/restored,100%coverage,0semantic;9paths/3sourcehashes/AP forbidden0;full goal remains open.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T05:57:08.816Z, excerpt_hash=sha256:fc1d0dfad4ab1afe8b863d0234ff060e06111f1c9a187dd626e4f640c199a5c6

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610040538-PWDK4Q/blueprint/resolved-snapshot.json
    - old_digest: 1ab5fd5d7851409b9840c6c560b091d7ad052fc1f5e17dc09157d8bacca7881d
    - current_digest: 1ab5fd5d7851409b9840c6c560b091d7ad052fc1f5e17dc09157d8bacca7881d
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610040538-PWDK4Q

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610040538-PWDK4Q --result verified-202610040538-PWDK4Q --commit e7e27e6398df1bf2e35adbce80569dd6b5124f8d
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert isolated semantic commit if needed,keep bounded results/hashes and restore temporarily renamed vendor in finally;no history rewrite."
  Findings: |-
    Previous goal turn is verified progress:iteration90 leafDONE semantic2a667d6fc8db with clean main/base11a7405467db. Current projection filters SvxTabAdjust.Default before assigning ruler ordinal;WriterRulers passes this compact ordinal to MoveRulerTabStop while the shell indexes complete item. Pinned Ruler skips default hit targets but preserves nAryPos;SvxRuler ApplyTabs uses that raw item index. Preceding default can therefore be moved instead of the explicit handle. Native full geometry/default glyph generation/type glyphs/RTL/snap/delete/capture/platform and parent goal remain open.

    Internal scope refinement under standing goal:owned collision baseline proves moved tab loses adjustment/decimal/fill to later destination because shell rebuilds all stops in original iteration order. Pinned SvxRuler ApplyTabs removes the selected raw index then inserts its copied moved stop;SvxTabStopItem Insert replaces any colliding position. Include wrtsh1.ts as9thsemantic path and editeng/source/items/paraitem.cxx as3rdread-only sourcehash. Refactor existing move to Clone/Remove/Insert while retaining invalid-input/nonpositive deletion/item default distance/undo contracts. This is the same end-to-end selected-tab identity correction,no new gesture feature. Baseline4expected owned failures/1pass and2browser failures on existing built product;initial build intentionally cannot typecheck new DTO assertions before interface addition. Final fresh builds/fullverify required;no gates skipped.

    User steering on2026-10-04:do not run each suite once with upstream and again without it. Tests must run once with vendor/libreoffice-reference unavailable;source-dependent static CLI audits run separately after restoration. The source-present full verify already completed before this instruction is historical evidence;the current live vendor-absent process is completed without restarting or an additional suite run. Future verification plans split existing npm verify gates into non-test static checks and one vendor-absent test/coverage/browser pass;no helper files or upstream test dependencies.

    Final identity correction is source-shaped across the browser/core boundary: frozen explicit ruler records preserve raw item indices while compact labels retain visible ordinals; computedStyle positions derive from those records. Existing MoveRulerTabStop clones the item, removes the selected raw index and inserts its copied moved stop, so the selected adjustment/decimal/fill wins a destination collision as inspected in SvxRuler ApplyTabs and SvxTabStopItem Insert. All unrelated stops/default distance and existing validation/removal/undo contracts retained. Existing tests retain all assertions; only4owned fixture DTO payloads change. Three manifest rows append responsibility/evidence without native promotion.
    Final owned deltas are exact291/1198/314twips for mixed item fixtures; Chromium new tab1200twips moves274twips at both widths,with actual Undo/Redo,cancellation and later editing. Initial fresh-build attempt preceded the new DTO interface and failed only fixture type references; final build and all mandatory gates pass. Pre-fix browser evidence used the unchanged previously built product; final rebuilt product is covered.
    User single-run steering is authoritative: no repeated source-present/source-absent verification pairs in future. The already-live absent run was completed without restarting and no tests were run after it. Bounded results/hashes/conclusions only, no helpers/source/native artifacts. Same-actor separate EVALUATOR review is required and is not independent-agent review.
    Read-only follow-up source comparison: SvxRuler Click constructs and inserts a new tab, replacing any colliding default/existing stop; current AddRulerTabStop delegates position rebuilding to CreateTabStops,which reuses existing metadata at a matching position. That separate insertion-at-existing-position contract remains to repair in a subsequent coherent task. Full native/parent parity remains open.
extensions:
  implementation_commit:
    hash: "e7e27e6398df1bf2e35adbce80569dd6b5124f8d"
    message: "🎯 PWDK4Q code: preserve Writer ruler tab item identity"
id_source: "generated"
---
## Summary

Iteration91 preserves native tab item identity through the compact browser ruler projection.

## Scope

apps/office/src/sw/browser/presentation/writer-view-projection.ts; apps/office/src/sw/browser/presentation/WriterRulers.tsx; apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts; apps/office/src/sw/browser/presentation/WriterPageLayout.test.tsx; apps/office/src/sw/browser/presentation/WriterRulers-tracking.test.tsx; apps/office/src/sw/browser/presentation/writer-view-ruler-tab-identity.test.tsx; apps/office/e2e/writer-ruler-tab-identity.spec.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json;core move operation refactor only,no command/resource/policy/save/open/recovery edits.

## Plan

Standing iterative parity goal authorizes one local correction:read-only pinned Ruler ImplHitTest/SvxRuler UpdateTabs and ApplyTabs confirm default tabs do not admit dragging but the selected tab retains its item index. Reproduce hidden default preceding explicit tab in actual Writer and Chromium. Add immutable browser ruler-tab records pairing position with raw item index;derive explicit CSS positions from those records and use raw item index for shell movement. Do not add parallel-array index hacks,position search,timers or core filtering;SwWrtShell raw index and SvxTabStop metadata/undo contracts stay unchanged. Ruler DTO absence means no explicit marker;old hand-authored ruler fixtures supply the new owned DTO and removed-handle fixture updates it,retaining all assertions. Verify crossing/reordering/collision,default+explicit metadata and hidden defaults,one accepted undo,cancellation/redo and later editing. Preserve old tests and manifest metadata;append evidence/responsibility only to two existing browser rows,220rows unchanged. Full verify/100%four coverage/0semantic;vendor-absent tests/restoration;exact8paths/sourcehash/ignored-inclusive artifact checks;same-actor exact semantic EVALUATOR;close leaf and record parent progress. No helpers/source/native artifacts,upstream test reads/compilation/execution,network/outside-repo or I/O/recovery deviations. Full native ruler/UI/parent remain unverified.

Internal scope refinement under standing goal:owned collision baseline proves moved tab loses adjustment/decimal/fill to later destination because shell rebuilds all stops in original iteration order. Pinned SvxRuler ApplyTabs removes the selected raw index then inserts its copied moved stop;SvxTabStopItem Insert replaces any colliding position. Include wrtsh1.ts as9thsemantic path and editeng/source/items/paraitem.cxx as3rdread-only sourcehash. Refactor existing move to Clone/Remove/Insert while retaining invalid-input/nonpositive deletion/item default distance/undo contracts. This is the same end-to-end selected-tab identity correction,no new gesture feature. Baseline4expected owned failures/1pass and2browser failures on existing built product;initial build intentionally cannot typecheck new DTO assertions before interface addition. Final fresh builds/fullverify required;no gates skipped.

Metadata evidence is appended to the existing SwWrtShell row as well as WriterRulers/projection:three updated rows,no new rows/status changes. This is traceability for the approved core refactor within the same two manifest paths. Old fixture edits are exactly3DTO payload additions plus1removed-handle DTO update;formatter changes confined to those payloads,all old assertions and bytes outside them retained.

User steering on2026-10-04:do not run each suite once with upstream and again without it. Tests must run once with vendor/libreoffice-reference unavailable;source-dependent static CLI audits run separately after restoration. The source-present full verify already completed before this instruction is historical evidence;the current live vendor-absent process is completed without restarting or an additional suite run. Future verification plans split existing npm verify gates into non-test static checks and one vendor-absent test/coverage/browser pass;no helper files or upstream test dependencies.

## Verify Steps

1.Read pinned editeng/source/items/paraitem.cxx Insert plus svtools/source/control/ruler.cxx ImplHitTest and svx/source/dialog/svxruler.cxx UpdateTabs/ApplyTabs read-only,hashes/conclusions only. 2.Add owned actual Writer/immutable projection/Undo regression and desktop/mobile Chromium new tab drag;record pre-fix failures;confirm raw item index despite preceding/interleaved defaults,unchanged other stops/all metadata/default distance,reordering/collision,Escape and accepted single undo/redo with new snapshot indices. Existing ruler/paragraph-ruler cases retained. 3.Exact9semantic paths;284prior test/spec files,282byte-identical;only3owned DTO additions in old WriterPageLayout fixtures and1removed-handle DTO update in WriterRulers-tracking,all assertions and bytes outside those formatted fixture payloads preserved.220prior manifest rows/order/status/default/owner/exception fields unchanged,three append-only evidence/responsibility/justification updates;no new rows/status promotion;3pinned hashes unchanged. 4.Declared full gates already passed before user steering:1134app+109tool+63browser+2resources,type/lint/static,100%statements/branches/functions/lines app/inventory,0semantic. Do not rerun full suites with source present. Complete the already-live vendor-absent test pass once;source-dependent static CLI audits are separate from tests and no suite reads/compiles/invokes upstream. 5.Rename vendor/libreoffice-reference inside vendor;npm run test;npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts;npm run test:e2e pass;restore in finally. 6.git diff --check,routing,doctor0errors/knownwarnings,ignored-inclusive raw/decoded AP source/helper/Python/frame/diff/archive findings0. 7.Same-actor separate EVALUATOR exact semantic SHA pass,clean final tracked state,leafDONE,parentDOING;full native/goal remain unproven.

## Verification

Command: npm run test; npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e, with vendor/libreoffice-reference renamed inside vendor and restored in finally.
Result: pass. Evidence: 1134 application tests/218 files, 109 inventory tests/36 files, 12 script tests/3 files (including 2 resource cases), 63 Chromium scenarios; every result records upstreamDirectoryPresent=false; restoration=true. Scope: final owned tests and browser behavior without pinned source availability. Native compilation/execution=false.
Command: npm run verify (completed before the user's single-run steering). Result: pass. Evidence: format/lint/type/dependency/resources/static build/JSDoc/file size/source tree/provenance/invariants/parity gates; 100% statements/branches/functions/lines in app and inventory; semanticViolationCount=0 separately captured by npm run inventory:parity. This is historical pre-steering evidence; no additional full verify or test suite was run after the steering.
Command: focused owned Vitest and fresh-build Chromium (before steering). Result: pass. Evidence: 49 tests/6 files and 2 widths1280/390; pre-fix 4 owned failures/1 pass and 2 browser failures establish wrong raw index and collision metadata. Scope: raw/default/interleaved tab identity, reordering, complete item metadata/default distance, one accepted Undo/Redo, Escape and immutable retained snapshots.
Command: exact scope/manifest/source hash checks, ignored-inclusive Agentplane raw/decoded audit, git diff --check, node .agentplane/policy/check-routing.mjs, ap doctor. Result: pass. Evidence: 9 semantic paths; 282 of284 old test files byte-identical; 4 fixture DTO updates in2oldfiles,all assertions and bytes outside formatted payloads preserved; 220 rows/order/metadata retained,3append-only updates,no new rows/status promotion; 3 pinned hashes unchanged; Agentplane source/helper/Python/frame/code-diff/archive findings0,5historical prose-only diffs; doctor0errors/2knownwarnings/2info.
Future verification follows user steering: one suite pass without upstream, source-dependent static CLI audits separate after restoration. Same-actor separate EVALUATOR pass: quality/20261004-055640960-recovery-context/quality-report.json evaluated_sha=e7e27e6398df1bf2e35adbce80569dd6b5124f8d. This is not independent-agent review. Semantic and pinned source hashes remain unchanged; canonical finish records final clean closure. Full native ruler geometry/default glyphs/type glyphs/RTL/modifiers/deletion/capture/Writer/browser/parent remain unverified. Registered save/open/recovery exceptions unchanged.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-04T05:56:02.333Z — VERIFY — ok

By: CODER

Note: Pass:9paths;282of284prior tests unchanged,4DTOpayloads/all old assertions retained;220rows/3append-only updates/no status promotion;3pinned hashes;AP forbidden0. Final vendor-absent1134+109+12+63pass/restored,100%four coverage metrics,0semantic. Pre-steering full verify historical only;no further suite reruns. Exact semantic quality pending;full native/parent open.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T05:55:33.612Z, excerpt_hash=sha256:fc1d0dfad4ab1afe8b863d0234ff060e06111f1c9a187dd626e4f640c199a5c6

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610040538-PWDK4Q/blueprint/resolved-snapshot.json
- old_digest: 1ab5fd5d7851409b9840c6c560b091d7ad052fc1f5e17dc09157d8bacca7881d
- current_digest: 1ab5fd5d7851409b9840c6c560b091d7ad052fc1f5e17dc09157d8bacca7881d
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610040538-PWDK4Q

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610040538-PWDK4Q
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-10-04T05:57:09.163Z — VERIFY — ok

By: CODER

Note: Final documentation/evidence revision verified without rerunning tests;exact unchanged semantic SHAe7e27e6398df1bf2e35adbce80569dd6b5124f8d has same-actor EVALUATOR pass. Final absent tests1134+109+12+63pass/restored,100%coverage,0semantic;9paths/3sourcehashes/AP forbidden0;full goal remains open.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T05:57:08.816Z, excerpt_hash=sha256:fc1d0dfad4ab1afe8b863d0234ff060e06111f1c9a187dd626e4f640c199a5c6

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610040538-PWDK4Q/blueprint/resolved-snapshot.json
- old_digest: 1ab5fd5d7851409b9840c6c560b091d7ad052fc1f5e17dc09157d8bacca7881d
- current_digest: 1ab5fd5d7851409b9840c6c560b091d7ad052fc1f5e17dc09157d8bacca7881d
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610040538-PWDK4Q

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610040538-PWDK4Q --result verified-202610040538-PWDK4Q --commit e7e27e6398df1bf2e35adbce80569dd6b5124f8d
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert isolated semantic commit if needed,keep bounded results/hashes and restore temporarily renamed vendor in finally;no history rewrite.

## Findings

Previous goal turn is verified progress:iteration90 leafDONE semantic2a667d6fc8db with clean main/base11a7405467db. Current projection filters SvxTabAdjust.Default before assigning ruler ordinal;WriterRulers passes this compact ordinal to MoveRulerTabStop while the shell indexes complete item. Pinned Ruler skips default hit targets but preserves nAryPos;SvxRuler ApplyTabs uses that raw item index. Preceding default can therefore be moved instead of the explicit handle. Native full geometry/default glyph generation/type glyphs/RTL/snap/delete/capture/platform and parent goal remain open.

Internal scope refinement under standing goal:owned collision baseline proves moved tab loses adjustment/decimal/fill to later destination because shell rebuilds all stops in original iteration order. Pinned SvxRuler ApplyTabs removes the selected raw index then inserts its copied moved stop;SvxTabStopItem Insert replaces any colliding position. Include wrtsh1.ts as9thsemantic path and editeng/source/items/paraitem.cxx as3rdread-only sourcehash. Refactor existing move to Clone/Remove/Insert while retaining invalid-input/nonpositive deletion/item default distance/undo contracts. This is the same end-to-end selected-tab identity correction,no new gesture feature. Baseline4expected owned failures/1pass and2browser failures on existing built product;initial build intentionally cannot typecheck new DTO assertions before interface addition. Final fresh builds/fullverify required;no gates skipped.

User steering on2026-10-04:do not run each suite once with upstream and again without it. Tests must run once with vendor/libreoffice-reference unavailable;source-dependent static CLI audits run separately after restoration. The source-present full verify already completed before this instruction is historical evidence;the current live vendor-absent process is completed without restarting or an additional suite run. Future verification plans split existing npm verify gates into non-test static checks and one vendor-absent test/coverage/browser pass;no helper files or upstream test dependencies.

Final identity correction is source-shaped across the browser/core boundary: frozen explicit ruler records preserve raw item indices while compact labels retain visible ordinals; computedStyle positions derive from those records. Existing MoveRulerTabStop clones the item, removes the selected raw index and inserts its copied moved stop, so the selected adjustment/decimal/fill wins a destination collision as inspected in SvxRuler ApplyTabs and SvxTabStopItem Insert. All unrelated stops/default distance and existing validation/removal/undo contracts retained. Existing tests retain all assertions; only4owned fixture DTO payloads change. Three manifest rows append responsibility/evidence without native promotion.
Final owned deltas are exact291/1198/314twips for mixed item fixtures; Chromium new tab1200twips moves274twips at both widths,with actual Undo/Redo,cancellation and later editing. Initial fresh-build attempt preceded the new DTO interface and failed only fixture type references; final build and all mandatory gates pass. Pre-fix browser evidence used the unchanged previously built product; final rebuilt product is covered.
User single-run steering is authoritative: no repeated source-present/source-absent verification pairs in future. The already-live absent run was completed without restarting and no tests were run after it. Bounded results/hashes/conclusions only, no helpers/source/native artifacts. Same-actor separate EVALUATOR review is required and is not independent-agent review.
Read-only follow-up source comparison: SvxRuler Click constructs and inserts a new tab, replacing any colliding default/existing stop; current AddRulerTabStop delegates position rebuilding to CreateTabStops,which reuses existing metadata at a matching position. That separate insertion-at-existing-position contract remains to repair in a subsequent coherent task. Full native/parent parity remains open.
