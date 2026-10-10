---
id: "202610101854-FSYVCZ"
title: "Restore original text-frame ownership and lifetime"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-10T18:55:12.714Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-10T19:19:01.537Z"
  updated_by: "CODER"
  note: "Actual current entire five modules Istanbul all-four100%,13925cases/497files plus22Chromium/11files,9fresh core/React and1fresh browser.810old test files preserved802byte-identical/8native fixtures, all other tokens/cases/matrices/device inputs/matcher arguments unchanged; eight canonical prefixes/new ssfrm unverified. All static/build/source-metadata gates pass; refs restored, no source/helper/raw artifacts. Exact semantic3e4a04a9c4c60bbc13868c86a8ce5d994157e58c; no full native flow/root/page/geometry promotion."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-10T19:19:31.781Z"
  updated_by: "EVALUATOR"
  note: "Same-agent non-independent review of exact semantic3e4a04a9c4c60bbc13868c86a8ce5d994157e58c: approved original text-frame ownership/lifetime scope accepted with actual entire five-module100%,13925related and22Chromium cases, current hashes and preserved old acceptance."
  evaluated_sha: "3e4a04a9c4c60bbc13868c86a8ce5d994157e58c"
  blueprint_digest: "d16694b347c9124af8bd9f5a54f2a4ff0817c35d5e18df378460d34f86b16632"
  evidence_refs:
    - ".agentplane/tasks/202610101854-FSYVCZ/README.md"
    - ".agentplane/tasks/202610101854-FSYVCZ/quality/20261010-191931781-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610101854-FSYVCZ/quality/20261010-191931781-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610101854-FSYVCZ/quality/20261010-191931781-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610101854-FSYVCZ/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/source/core/layout/native-text-frame-owner.test.ts"
    - "apps/office/src/sw/browser/editor/native-text-frame-owner.test.tsx"
    - "apps/office/e2e/writer-native-text-frame-owner.spec.ts"
    - "docs/program/registry/writer/runtime/sw/source/core/layout/ssfrm.ts.json"
  findings:
    - "Original SwTextNode clients now follow SwContentFrame/SwFrame with Txt and unmerged GetTextNodeFirst, receive native pooled invalidation, and release on cursor replacement, pagination candidate reuse/discard/error, document replacement and per-view close. Required real owner input prevents the old detached frozen frame path."
    - "810old test files:802byte-identical and8native owner fixture migrations; all other AST tokens/cases/matrices/device inputs/expected matcher arguments preserved. Eight canonical prefixes/status/default/classification/exception values retained, two new ssfrm unverified records; nine metadata gates pass. Runtime/static/build/browser upstream-absent, refs restored."
commit:
  hash: "3e4a04a9c4c60bbc13868c86a8ce5d994157e58c"
  message: "🧩 FSYVCZ code: register and release original text-frame owners"
comments:
  -
    author: "CODER"
    body: "Start: restore original SwTextNode-owned frame registration and lifetime under standing iterative human goal authorization, retaining explicit device geometry and native hierarchy/flow gaps."
  -
    author: "CODER"
    body: "Implementation: original text-frame registration and lifetime restored; actual five-module100%,13925related and22Chromium cases pass with current hashes, eight native fixture migrations preserve all other old tokens. Semantic commit3e4a04a9c4c60bbc13868c86a8ce5d994157e58c."
events:
  -
    type: "status"
    at: "2026-10-10T18:55:13.944Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore original SwTextNode-owned frame registration and lifetime under standing iterative human goal authorization, retaining explicit device geometry and native hierarchy/flow gaps."
  -
    type: "status"
    at: "2026-10-10T19:19:00.532Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Implementation: original text-frame registration and lifetime restored; actual five-module100%,13925related and22Chromium cases pass with current hashes, eight native fixture migrations preserve all other old tokens. Semantic commit3e4a04a9c4c60bbc13868c86a8ce5d994157e58c."
  -
    type: "verify"
    at: "2026-10-10T19:19:01.537Z"
    author: "CODER"
    state: "ok"
    note: "Actual current entire five modules Istanbul all-four100%,13925cases/497files plus22Chromium/11files,9fresh core/React and1fresh browser.810old test files preserved802byte-identical/8native fixtures, all other tokens/cases/matrices/device inputs/matcher arguments unchanged; eight canonical prefixes/new ssfrm unverified. All static/build/source-metadata gates pass; refs restored, no source/helper/raw artifacts. Exact semantic3e4a04a9c4c60bbc13868c86a8ce5d994157e58c; no full native flow/root/page/geometry promotion."
doc_version: 3
doc_updated_at: "2026-10-10T19:19:01.591Z"
doc_updated_by: "CODER"
description: "Replace unregistered frozen text-frame geometry objects with original SwTextNode-registered SwContentFrame/SwTextFrame identities in body pagination and cursor geometry; release replaced/discarded/closed frames. Standing human goal authorizes iterative core/UI refactoring and inventory. Fourth correction after BZ14P4; pause after next full checkpoint and required repairs."
sections:
  Summary: "Restore original native text-node registration and mutable frame identity instead of frozen unregistered geometry records."
  Scope: "Five production paths: wsfrm.ts, new ssfrm.ts, txtfrm.ts, newfrm.ts, SwView view.ts. Eight existing canonical runtime/provenance plus two new ssfrm native mappings and only automatically required affected mutation operation mappings; parent Findings. Up to eight existing native constructor/geometry fixtures may add real source nodes or lifecycle cleanup, preserving original cases/inputs/expected matcher arguments. Up to two fresh core/React files and one Chromium file. No source copies/helpers/Python/raw logs/maps in AgentPlane; no registered save/open/recovery changes."
  Plan: "Restore original native text-frame ownership/lifetime: five production paths, eight old/two new canonical mappings, bounded native fixture migration and fresh core/React/Chromium. Register original nodes through source class hierarchy, retire frozen frame records, reconcile/destroy stale or discarded frames and release root at view close. Existing device geometry and full flow/root/redline gaps explicit. Whole five modules100% and related current-source upstream-absent verification; exact semantic same-agent quality and clean closure4/10. Standing human goal authorization; pause after next full and repairs."
  Verify Steps: |-
    1. Pinned source-only registration/constructor/destruction/GetTextNodeFirst/Txt proof; no native-source calls in tests. Retain explicit browser fragment geometry boundary, no assertion of full SwFlowFrame/root/page/text notification/layout parity.

    2. Real initialized SwDoc/SwTextNode/native frames, body/cell master/follow, original registration/identity/type, mutable invalidation, cursor replacement/stale text, pagination reuse/discard/document replacement and root/view release. Actual mounted React/native owner lifetimes and Chromium page/cell Home/End/format/edit/undo/reopen behavior. No mocks or imported upstream tests.

    3. Current changed format/lint, TS7/types/dependencies/docs/file-size/build/static, fresh and related tests with actual whole five-module100% all four metrics and complete current hashes/nonnegative maps; related Chromium. Both reference symlinks absent throughout all runtime/build/static and restored finally. Failed/affected reruns only; no passing replay for metadata/helper fixes.

    4. Source-only restored registry build/source-tree/provenance/registry/resource generation/invariant/parity/routing/doctor. Historical canonical values/status/default/classification/evidence retained, new mapping status unverified; old cases/inputs/matchers preserved except native-constructor fixture/lifetime obligations. Clean writer, source/test current hashes and exact semantic commit/same-agent non-independent quality and closure.
  Verification: |-
    Command: source-only pinned audit of SwFrame325/SwContentFrame415/SwTextFrame762/GetTextNodeFirst1461 and SwRootFrame::DestroyImpl533. Result: pass. Evidence: pin9bc445578031fecf56086729d8e4940c77e14d65, seven source hashes retained only in ignored cache; no source copies, helpers, Python, raw logs/maps in AgentPlane. Scope: original registration/discriminator/unmerged owner identity and represented release, not complete native flow/root/page/merged/redline/text callbacks or geometry.

    Command: changed Prettier and ESLint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run build; npm exec -- node scripts/check-static-build.mjs, with both reference symlinks physically absent and finally restored. Result: pass. Evidence: required current five production modules, eight fixture migrations and three fresh files pass; initial fixture API/non-null/documentation/formatter failures repaired within approved scope and retained in Findings. No production runtime failures. Scope: current code/test static and built application.

    Command: npm exec -- vitest related src/sw/source/core/layout/wsfrm.ts src/sw/source/core/layout/ssfrm.ts src/sw/source/core/text/txtfrm.ts src/sw/source/core/layout/newfrm.ts src/sw/source/uibase/uiview/view.ts --run --coverage with exact five coverage.include paths, reportOnFailure and ignored cache report directories. Result: pass. Evidence: 13925/13925 cases, 497 files, 9 fresh core/React cases; entire actual five modules all-four100%, 573lines/630statements/147functions/492branches, 1269nonnegative counters, no omitted map or reused previous-task counters. Complete current 1150 production/test hashes match final files; map5c7d9e37c6660c2fcadc5c36efb1336905dabd54aa187518efe0a181836d8ba2, report1872bdec19f4287c1f5f523c05fcd3229da603811facc0d041bef79705389ed0. Scope: actual original node clients, body/cell masters/follows, mutable native attribute invalidation, cursor replacement/stale text, reused/candidate/discarded/error graph ownership, document replacement, actual React native editing/history and explicit view/root close. Both reference symlinks absent throughout, restored finally.

    Command: npm exec -- playwright test --config apps/office/playwright.config.ts --project=writer writer-native-text-frame-owner.spec.ts native-line-margin.spec.ts writer-layout-ratios.spec.ts writer-table-headlines.spec.ts writer-native-table-layout-split.spec.ts writer-native-table-text-flow-split.spec.ts writer-native-table-text-flow-headline.spec.ts writer-cell-paragraph-format.spec.ts writer-counted-list-layout.spec.ts writer-uncounted-list-layout.spec.ts writer-native-margin-admission.spec.ts --reporter=list,json. Result: pass. Evidence: 22cases/11files, one fresh real Chromium reformat/body/cell/history/reopen case, zero skips/flaky/unexpected; report18d322bb1da63af74f2ca1bf544a651a1802209f7d39e607b96685d81179b3aa. Scope: physical pages, native Home/End/Shift/edit/format/history/table/list/document replacement behavior. Both reference symlinks absent throughout, restored finally.

    Command: bounded TypeScript AST old-fixture and historical canonical prefix proof. Result: pass. Evidence: 810 existing acceptance files: 802 byte-identical, exactly 8 native constructor/input/lifetime fixtures; all other old tokens/cases/matrices/device inputs/expected matcher arguments unchanged. Eight historical canonical prefixes/status/default/classification/exception values retained, two new mappings unverified. Scope: old acceptance preserved, no save/open/recovery changes or parity promotion.

    Command: npm run inventory:registry:build; npm run check:source-tree; npm run check:source-provenance; npm run inventory:registry:check; node_modules/.bin/tsx scripts/generate-writer-ui-resources.ts --check; npm run inventory:invariants; npm run inventory:parity; node .agentplane/policy/check-routing.mjs; ap doctor, with references restored for metadata-only gates. Result: pass. Evidence: all nine gates pass. Scope: exhaustive authored runtime/source provenance/resource/invariant/parity policy metadata. Pending semantic commit hash and same-agent non-independent exact-commit evaluator/clean closure are recorded by lifecycle commands. Fourth correction since full BZ14P4; next full after ten, then pause human goal after all required repairs.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-10T19:19:01.537Z — VERIFY — ok

    By: CODER

    Note: Actual current entire five modules Istanbul all-four100%,13925cases/497files plus22Chromium/11files,9fresh core/React and1fresh browser.810old test files preserved802byte-identical/8native fixtures, all other tokens/cases/matrices/device inputs/matcher arguments unchanged; eight canonical prefixes/new ssfrm unverified. All static/build/source-metadata gates pass; refs restored, no source/helper/raw artifacts. Exact semantic3e4a04a9c4c60bbc13868c86a8ce5d994157e58c; no full native flow/root/page/geometry promotion.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-10T19:19:00.532Z, excerpt_hash=sha256:5bc6ac78c69637c8de434b7e20422682fc74e45d82d40df639a82f75971e4c65

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610101854-FSYVCZ/blueprint/resolved-snapshot.json
    - old_digest: d16694b347c9124af8bd9f5a54f2a4ff0817c35d5e18df378460d34f86b16632
    - current_digest: d16694b347c9124af8bd9f5a54f2a4ff0817c35d5e18df378460d34f86b16632
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610101854-FSYVCZ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610101854-FSYVCZ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the semantic task commit if requested; preserve prior evidence and rerun affected checks, no unrelated checkout/history changes."
  Findings: |-
    Previous PW1696 is verified progress: semantic892b9b4c, close039d4e95, clean writer/current hashes/restored references revalidated. No live producer. Frozen unregistered text-frame snapshots and independent cursor weak cache remain authoritative architecture gaps. Source constructors register original nodes through SwContentFrame/SwFrame and root destruction releases native children. Standing human iterative goal/resume explicitly authorizes this safe core/UI refactor and inventory. No network/subagents/global files. Native full frame/layout/flow/redlines/text callbacks/rich units/global Repeat remain unverified. Stop after next full checkpoint and required repairs.

    Command: npm run typecheck with both reference symlinks hidden. Result: fail. Evidence: TS7 rejected eight old geometry-only fixture files under the required native node constructor/input contract. Scope: preserve all old cases, scalar inputs and expected matcher arguments; add original fixture nodes and lifecycle release within the approved eight-file boundary. Read-only missing path probes are not evidence; route recomputed, required Verify Steps re-read before continuation. No required criteria were weakened.

    Command: npm run typecheck (fresh fixture pass). Result: fail. Evidence: new line-info fixture called GetValue instead of its actual public QueryValue; corrected only new test fixture API. All five production paths and eight migrated fixtures typechecked. Scope: fresh native fixture repair.

    Command: changed Prettier check. Result: fail. Evidence: the first formatting pass of the dense new Chromium fixture was not idempotent; only that new browser file required a second format pass. Scope: no production/matcher changes; recheck current changed set then continue pending statics.

    Command: changed ESLint. Result: fail. Evidence: nine forbidden non-null assertions in the bounded original-node fixtures, no production findings. Scope: replace assertions with explicit initialized owner guards and original fixture references, preserving device inputs/matchers.

    Command: npm run check:docs. Result: fail. Evidence: the new expected-error formatter callback lacked mandatory JSDoc; added comment only. Scope: fresh native test documentation. Passing production formatting/lint/type/dependency gates retained; rerun changed new file formatting/lint and remaining docs/build gates.

    Command: bounded old-fixture preservation helper. Result: fail. Evidence: a plain scanner did not rescan template/JSX token context and compared whitespace embedded in a falsely combined template token. Scope: helper-only parser repair to actual TypeScript AST leaf tokens; no source/tests/cases/matcher edits or runtime replays.
id_source: "generated"
---
## Summary

Restore original native text-node registration and mutable frame identity instead of frozen unregistered geometry records.

## Scope

Five production paths: wsfrm.ts, new ssfrm.ts, txtfrm.ts, newfrm.ts, SwView view.ts. Eight existing canonical runtime/provenance plus two new ssfrm native mappings and only automatically required affected mutation operation mappings; parent Findings. Up to eight existing native constructor/geometry fixtures may add real source nodes or lifecycle cleanup, preserving original cases/inputs/expected matcher arguments. Up to two fresh core/React files and one Chromium file. No source copies/helpers/Python/raw logs/maps in AgentPlane; no registered save/open/recovery changes.

## Plan

Restore original native text-frame ownership/lifetime: five production paths, eight old/two new canonical mappings, bounded native fixture migration and fresh core/React/Chromium. Register original nodes through source class hierarchy, retire frozen frame records, reconcile/destroy stale or discarded frames and release root at view close. Existing device geometry and full flow/root/redline gaps explicit. Whole five modules100% and related current-source upstream-absent verification; exact semantic same-agent quality and clean closure4/10. Standing human goal authorization; pause after next full and repairs.

## Verify Steps

1. Pinned source-only registration/constructor/destruction/GetTextNodeFirst/Txt proof; no native-source calls in tests. Retain explicit browser fragment geometry boundary, no assertion of full SwFlowFrame/root/page/text notification/layout parity.

2. Real initialized SwDoc/SwTextNode/native frames, body/cell master/follow, original registration/identity/type, mutable invalidation, cursor replacement/stale text, pagination reuse/discard/document replacement and root/view release. Actual mounted React/native owner lifetimes and Chromium page/cell Home/End/format/edit/undo/reopen behavior. No mocks or imported upstream tests.

3. Current changed format/lint, TS7/types/dependencies/docs/file-size/build/static, fresh and related tests with actual whole five-module100% all four metrics and complete current hashes/nonnegative maps; related Chromium. Both reference symlinks absent throughout all runtime/build/static and restored finally. Failed/affected reruns only; no passing replay for metadata/helper fixes.

4. Source-only restored registry build/source-tree/provenance/registry/resource generation/invariant/parity/routing/doctor. Historical canonical values/status/default/classification/evidence retained, new mapping status unverified; old cases/inputs/matchers preserved except native-constructor fixture/lifetime obligations. Clean writer, source/test current hashes and exact semantic commit/same-agent non-independent quality and closure.

## Verification

Command: source-only pinned audit of SwFrame325/SwContentFrame415/SwTextFrame762/GetTextNodeFirst1461 and SwRootFrame::DestroyImpl533. Result: pass. Evidence: pin9bc445578031fecf56086729d8e4940c77e14d65, seven source hashes retained only in ignored cache; no source copies, helpers, Python, raw logs/maps in AgentPlane. Scope: original registration/discriminator/unmerged owner identity and represented release, not complete native flow/root/page/merged/redline/text callbacks or geometry.

Command: changed Prettier and ESLint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run build; npm exec -- node scripts/check-static-build.mjs, with both reference symlinks physically absent and finally restored. Result: pass. Evidence: required current five production modules, eight fixture migrations and three fresh files pass; initial fixture API/non-null/documentation/formatter failures repaired within approved scope and retained in Findings. No production runtime failures. Scope: current code/test static and built application.

Command: npm exec -- vitest related src/sw/source/core/layout/wsfrm.ts src/sw/source/core/layout/ssfrm.ts src/sw/source/core/text/txtfrm.ts src/sw/source/core/layout/newfrm.ts src/sw/source/uibase/uiview/view.ts --run --coverage with exact five coverage.include paths, reportOnFailure and ignored cache report directories. Result: pass. Evidence: 13925/13925 cases, 497 files, 9 fresh core/React cases; entire actual five modules all-four100%, 573lines/630statements/147functions/492branches, 1269nonnegative counters, no omitted map or reused previous-task counters. Complete current 1150 production/test hashes match final files; map5c7d9e37c6660c2fcadc5c36efb1336905dabd54aa187518efe0a181836d8ba2, report1872bdec19f4287c1f5f523c05fcd3229da603811facc0d041bef79705389ed0. Scope: actual original node clients, body/cell masters/follows, mutable native attribute invalidation, cursor replacement/stale text, reused/candidate/discarded/error graph ownership, document replacement, actual React native editing/history and explicit view/root close. Both reference symlinks absent throughout, restored finally.

Command: npm exec -- playwright test --config apps/office/playwright.config.ts --project=writer writer-native-text-frame-owner.spec.ts native-line-margin.spec.ts writer-layout-ratios.spec.ts writer-table-headlines.spec.ts writer-native-table-layout-split.spec.ts writer-native-table-text-flow-split.spec.ts writer-native-table-text-flow-headline.spec.ts writer-cell-paragraph-format.spec.ts writer-counted-list-layout.spec.ts writer-uncounted-list-layout.spec.ts writer-native-margin-admission.spec.ts --reporter=list,json. Result: pass. Evidence: 22cases/11files, one fresh real Chromium reformat/body/cell/history/reopen case, zero skips/flaky/unexpected; report18d322bb1da63af74f2ca1bf544a651a1802209f7d39e607b96685d81179b3aa. Scope: physical pages, native Home/End/Shift/edit/format/history/table/list/document replacement behavior. Both reference symlinks absent throughout, restored finally.

Command: bounded TypeScript AST old-fixture and historical canonical prefix proof. Result: pass. Evidence: 810 existing acceptance files: 802 byte-identical, exactly 8 native constructor/input/lifetime fixtures; all other old tokens/cases/matrices/device inputs/expected matcher arguments unchanged. Eight historical canonical prefixes/status/default/classification/exception values retained, two new mappings unverified. Scope: old acceptance preserved, no save/open/recovery changes or parity promotion.

Command: npm run inventory:registry:build; npm run check:source-tree; npm run check:source-provenance; npm run inventory:registry:check; node_modules/.bin/tsx scripts/generate-writer-ui-resources.ts --check; npm run inventory:invariants; npm run inventory:parity; node .agentplane/policy/check-routing.mjs; ap doctor, with references restored for metadata-only gates. Result: pass. Evidence: all nine gates pass. Scope: exhaustive authored runtime/source provenance/resource/invariant/parity policy metadata. Pending semantic commit hash and same-agent non-independent exact-commit evaluator/clean closure are recorded by lifecycle commands. Fourth correction since full BZ14P4; next full after ten, then pause human goal after all required repairs.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-10T19:19:01.537Z — VERIFY — ok

By: CODER

Note: Actual current entire five modules Istanbul all-four100%,13925cases/497files plus22Chromium/11files,9fresh core/React and1fresh browser.810old test files preserved802byte-identical/8native fixtures, all other tokens/cases/matrices/device inputs/matcher arguments unchanged; eight canonical prefixes/new ssfrm unverified. All static/build/source-metadata gates pass; refs restored, no source/helper/raw artifacts. Exact semantic3e4a04a9c4c60bbc13868c86a8ce5d994157e58c; no full native flow/root/page/geometry promotion.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-10T19:19:00.532Z, excerpt_hash=sha256:5bc6ac78c69637c8de434b7e20422682fc74e45d82d40df639a82f75971e4c65

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610101854-FSYVCZ/blueprint/resolved-snapshot.json
- old_digest: d16694b347c9124af8bd9f5a54f2a4ff0817c35d5e18df378460d34f86b16632
- current_digest: d16694b347c9124af8bd9f5a54f2a4ff0817c35d5e18df378460d34f86b16632
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610101854-FSYVCZ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610101854-FSYVCZ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the semantic task commit if requested; preserve prior evidence and rerun affected checks, no unrelated checkout/history changes.

## Findings

Previous PW1696 is verified progress: semantic892b9b4c, close039d4e95, clean writer/current hashes/restored references revalidated. No live producer. Frozen unregistered text-frame snapshots and independent cursor weak cache remain authoritative architecture gaps. Source constructors register original nodes through SwContentFrame/SwFrame and root destruction releases native children. Standing human iterative goal/resume explicitly authorizes this safe core/UI refactor and inventory. No network/subagents/global files. Native full frame/layout/flow/redlines/text callbacks/rich units/global Repeat remain unverified. Stop after next full checkpoint and required repairs.

Command: npm run typecheck with both reference symlinks hidden. Result: fail. Evidence: TS7 rejected eight old geometry-only fixture files under the required native node constructor/input contract. Scope: preserve all old cases, scalar inputs and expected matcher arguments; add original fixture nodes and lifecycle release within the approved eight-file boundary. Read-only missing path probes are not evidence; route recomputed, required Verify Steps re-read before continuation. No required criteria were weakened.

Command: npm run typecheck (fresh fixture pass). Result: fail. Evidence: new line-info fixture called GetValue instead of its actual public QueryValue; corrected only new test fixture API. All five production paths and eight migrated fixtures typechecked. Scope: fresh native fixture repair.

Command: changed Prettier check. Result: fail. Evidence: the first formatting pass of the dense new Chromium fixture was not idempotent; only that new browser file required a second format pass. Scope: no production/matcher changes; recheck current changed set then continue pending statics.

Command: changed ESLint. Result: fail. Evidence: nine forbidden non-null assertions in the bounded original-node fixtures, no production findings. Scope: replace assertions with explicit initialized owner guards and original fixture references, preserving device inputs/matchers.

Command: npm run check:docs. Result: fail. Evidence: the new expected-error formatter callback lacked mandatory JSDoc; added comment only. Scope: fresh native test documentation. Passing production formatting/lint/type/dependency gates retained; rerun changed new file formatting/lint and remaining docs/build gates.

Command: bounded old-fixture preservation helper. Result: fail. Evidence: a plain scanner did not rescan template/JSX token context and compared whitespace embedded in a falsely combined template token. Scope: helper-only parser repair to actual TypeScript AST leaf tokens; no source/tests/cases/matcher edits or runtime replays.
