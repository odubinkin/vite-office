---
id: "202610081647-HFS3EK"
title: "Publish native changed table property items from pages to shell"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 28
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-08T17:39:17.076Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-08T17:44:48.636Z"
  updated_by: "CODER"
  note: "Verified native table-property item exchange at d8d894a35fc37b51a90775e24707256083406740:412 targeted app/38 Chromium/45 fresh, passing replay0; actual current-source-bound app/inventory all-four100.17 semantic paths;635/639 prior files unchanged with4 exact native migrations;313 metadata records preserve311 originals. Static/build/source/governance/artifact/IO/pin/stash gates pass. No full suite; next247. Same-agent evaluator is not independent. Whole parent/goal parity remains unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-08T17:44:47.725Z"
  updated_by: "EVALUATOR"
  note: "Pass bounded native table-property item publication at d8d894a35fc37b51a90775e24707256083406740. Current-agent EVALUATOR is explicitly not independent. Reconstructed actual counters and case/scope/native-source certificates without executing tests;17 committed paths,412 app/38 Chromium/45 fresh, all-four coverage100, no passing replay, user full cadence237/247."
  evaluated_sha: "d8d894a35fc37b51a90775e24707256083406740"
  blueprint_digest: "08cc1f3072e9d4ec59c3ea6670e9d2c2362c645754e98176729a8ce5dd058bbc"
  evidence_refs:
    - ".agentplane/tasks/202610081647-HFS3EK/README.md"
    - ".agentplane/tasks/202610081647-HFS3EK/quality/20261008-174447725-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610081647-HFS3EK/quality/20261008-174447725-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610081647-HFS3EK/quality/20261008-174447725-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610081647-HFS3EK/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610081647-HFS3EK/evidence/actual-sha-quality.json"
    - ".agentplane/tasks/202610081647-HFS3EK/evidence/final-coverage.json"
    - ".agentplane/tasks/202610081647-HFS3EK/evidence/runtime-census.json"
    - ".agentplane/tasks/202610081647-HFS3EK/evidence/native-source-review.json"
  findings:
    - "Main properties UI sends SfxItemSet directly without DTO fallback; native pointer/explicit SET items, unconditional Columns output, created Borders admission and page-range Reset are source-bound. Four whole-file native expectation/input migrations preserve635 of639 prior files; four new acceptance files and313 metadata records retain311 prior fields/prefixes/states/defaults/classes."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement the approved native changed-item publication and actual UI-to-SfxItemSet shell path; one upstream-absent profile and exact-source evidence only."
events:
  -
    type: "status"
    at: "2026-10-08T16:48:18.640Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved native changed-item publication and actual UI-to-SfxItemSet shell path; one upstream-absent profile and exact-source evidence only."
  -
    type: "verify"
    at: "2026-10-08T17:44:48.636Z"
    author: "CODER"
    state: "ok"
    note: "Verified native table-property item exchange at d8d894a35fc37b51a90775e24707256083406740:412 targeted app/38 Chromium/45 fresh, passing replay0; actual current-source-bound app/inventory all-four100.17 semantic paths;635/639 prior files unchanged with4 exact native migrations;313 metadata records preserve311 originals. Static/build/source/governance/artifact/IO/pin/stash gates pass. No full suite; next247. Same-agent evaluator is not independent. Whole parent/goal parity remains unverified."
doc_version: 3
doc_updated_at: "2026-10-08T17:44:48.686Z"
doc_updated_by: "CODER"
description: "Iteration238 under ongoing authorized parity goal. Port native SwPtrItem/FN table identities and route mounted properties through SfxItemSet changed items. Empty acceptance must preserve full formats/history/defaults; page/name/spacing/headline/geometry/border/flow changes follow native publication and one grouped history. Keep declared IO deviations, no network or outside access, no upstream/Python/raw evidence in AgentPlane, tests only upstream absent exactly one full profile then failed/new closures."
sections:
  Summary: "Iteration238 publishes native changed table-property items rather than materializing unchanged UI defaults. Standing iterative goal authorizes local parity/refactoring; no new permission needed."
  Scope: |-
    Seventeen intentional semantic paths: seven production files, four fresh acceptance files, four exact source-backed baseline observation/input migrations, and two metadata manifests. Preserve635 of639 prior acceptance files byte-identically. Append two partial native module records while preserving all311 prior record fields/prefixes/states/defaults/classes; total313. apps/office/src/sw/inc/cmdid.ts
    apps/office/src/sw/source/uibase/utlui/uiitems.ts
    apps/office/src/sw/inc/hintids.ts
    apps/office/src/sw/source/ui/table/tabledlg.ts
    apps/office/src/sw/source/uibase/shells/tabsh.ts
    apps/office/src/sw/browser/presentation/WriterTableDialog.tsx
    apps/office/src/sw/browser/presentation/writer-view.tsx
    apps/office/src/sw/source/uibase/utlui/native-pointer-items.test.ts
    apps/office/src/sw/source/ui/table/native-table-property-output.test.ts
    apps/office/src/sw/source/uibase/shells/native-table-property-item-input.test.ts
    apps/office/src/sw/browser/presentation/native-table-property-output.test.tsx
    apps/office/src/sw/browser/presentation/native-independent-table-properties.test.tsx
    apps/office/e2e/writer-native-independent-table-properties.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    apps/office/src/sw/browser/presentation/native-table-properties.test.tsx
    apps/office/src/sw/browser/presentation/native-table-alignment.test.tsx
  Plan: |-
    Implement one source-owned native table-property changed-item path. Port exact table FN identities in sw/inc/cmdid and borrowed SwPtrItem in uibase/utlui/uiitems. Extend existing page publication to native SfxItemSet name/upper-lower/representation/headline/flow items using saved-value/change flags, and route the real mounted UI to the native overload of ItemSetToTableParam. Canonical native dispatch uses only explicitly set items and FN_TABLE_REP for geometry, preserving empty acceptance full native formats/defaults/history. Explicit old DTO ingress remains available separately for existing callers; do not put DTO translation in the main UI path. Add literal pointer/page/shell and mounted actual-owner tests. Migrate only the original direct-owner spy input projection and the previously declared untouched-dialog Chromium history observation to the source contract, preserving every geometry/owner/history-cycle/text assertion. Per the newly updated user objective, run only new tests and related module tests under one upstream-absent targeted coverage/profile; later only failed/new closures and exact-source cumulative coverage. Full suite cadence is once per10 executable AgentPlane parity leaves; leaf237 was the last full profile, next scheduled at247. Unchanged inventory/infra/unrelated app/Chromium cases are covered by exact unchanged-source certificates, not replayed. Scope15 semantic paths, preserving639 prior acceptance files except2 declared migrations; preserve all311 prior metadata records and append exactly2 mapped partial native records. Final actual-SHA evaluator explicitly not independent, verify/clean close, exact parent prefix append; goal remains active.
    Source refinement after targeted failures: implement native created-page admission for Borders so an unvisited page cannot publish initialization-only inner-border items. Once Borders is visited, native FillItemSet metadata output and its grouped history remain source-defined, including untouched widgets. Migrate two additional old mounted snapshot observations: native geometry output omits unchanged upper/lower spacing; FULL changes orientation without replacing stored frame width, and an unchanged LEFT radio preserves original omitted explicit orientation. Retain all actual layout widths, margins, owner/text/history assertions. Scope17; four declared old migrations,635 prior acceptance files byte-identical. Related failed-case-only closures retain356 already passing app and36 Chromium cases without replay.
    Final source refinement: native Columns DeactivatePage publishes FN_TABLE_REP unconditionally. Native SfxTabDialog exchange output survives page departures; Reset clears the represented item range for its page. Borders initialization-only items participate after actual page activation. Main properties dispatch has no DTO fallback. Fresh literal orientation/reset/admission/callback cases close changed-source coverage; previously unexecuted related WriterWorkbench/insertion cases execute once. All current412 app/38 Chromium cases pass with45 fresh cases and no passing replay; three fresh draft assumptions are explicitly superseded by pinned source contracts. Coverage all-four100 uses certified exact-source/maps/contiguous-region proofs. Remaining broad native item/frame/layout/page completeness stays unverified.
  Verify Steps: |-
    1. Source read pinned uiitems.hxx61-75/uiitems.cxx192-208 borrowed pointer Clone/equality/GetValue, cmdid.h native FN offsets, tabledlg.cxx FillItemSet/DeactivatePage/name/spacing/FN_TABLE_REP gates and Text Flow saved-value publication, tabsh.cxx277-445 explicitly set items/geometry/grouping. Literal pointer/page/shell and mounted tests prove empty input preserves full formats/defaults/history, cloned pointer borrows actual SwTableRep, isolated name/upper-lower/headline/flow/border/geometry changes and one grouped owner/cursor Undo/Redo. Corrected existing Chromium1280/390 scenarios retain all independent physical-cell width and text assertions while requiring untouched OK to create no Undo.
    2. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Source<1000 physical lines without compression. Preserve639 prior acceptance files except4 declared native input-spy and known untouched-dialog observation migrations; no unrelated assertion weakening/skip/exclusion.
    3. Updated explicit user testing instruction: targeted upstream-absent build/coverage for fresh pointer/page/shell/mounted tests and existing related table/page/shell/Writer UI tests; related Chromium table-properties/format/column/flow/border files only. No full suite this leaf; full cadence once per10 executable AgentPlane parity leaves, last237/next247. Terminal finally restoration, tests never read/invoke upstream. Later only failed or genuinely new closure cases, retain skips/raw threshold exits, no passing replay in closures. Reconstruct app/inventory all-four100 from current actual targeted counters and certified237 whole byte-identical sources/maps or complete contiguous declarations/bodies/enclosing branches/all locations; no sanitation. Unchanged inventory/infra/unrelated runtime cases require source/certificate equality and are not executed.
    4. After terminal/restoration: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Scope17; preserve311 prior metadata records/fields/evidence prefixes/states/defaults/classes and append2 mapped partial native records for313 total. Pin9bc445578031fecf56086729d8e4940c77e14d65; stashc85f4a0e453dfd06d6e199554784f2c286737472; exact parent686947-character prefix932660520332dc5a66cc4cef46608459128d9b84b2795a4615c8920bb1bd0b3b unchanged. Protected4 IO/bridge files byte-identical; writer-view sole native table-property input dispatch, complete registered IO handlers unchanged. No upstream/application/Python/raw maps/results in AgentPlane; ignored cache only.
    5. ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Actual implementation SHA current-agent EVALUATOR explicitly not independent reconstructs reports without tests; record owner verification/quality and clean checkpoint, supported meaningful task complete actual SHA. DONE immutable. Append entire parent prefix and final clean source/IO/stash/AP audit. Parent/goal ACTIVE, no full architecture/module parity promotion. Native SfxTabDialogController::Ok only calls instantiated pages; unvisited Borders publishes no initialization item, while visited Borders native info-only changes remain admitted. Additional two old snapshot-input assertions migrate to native changed-item/stored-versus-layout width contracts with all literal rendered geometry retained.
    Final source clarification: validate unconditional Columns representation output even without edits, page-exchange item retention, Reset item-range clearing, Borders created-page admission, and absence of a main UI DTO fallback. Literal native orientation matrices, row-split-only, active-columns, four Reset scopes and insertion callback branches must be covered. Three fresh draft expectations superseded by pinned source contracts are reported explicitly; no baseline acceptance case removed. Current runtime census412 app/38 Chromium/45 fresh, no passing replay. Final build/static smoke and metadata provenance/parity checks pass; ordering repair changes only insertion position of the two new metadata identities.
  Verification: |-
    Command: targeted upstream-absent Vitest coverage and related Chromium profile, followed only by failed/new cases and two previously unexecuted related WriterWorkbench/insertion module files.
    Result: pass for412 current unique app cases,38 Chromium cases,45 fresh cases; passing replay0. Three source-disproved fresh draft expectations superseded explicitly in runtime-census.json; all639 baseline acceptance files remain represented with635 byte-identical files and4 exact source-backed migrations. App17457 lines/19171 statements/4389 functions/14267 branches and inventory1464/1523/384/1081 reach100% via actual targeted counters plus237 certified whole identical-source/maps or complete contiguous declaration/body/enclosing branch/location proof; raw partial-profile threshold exits remain recorded.
    Command: format:check, lint, typecheck, check:dependencies, check:docs, check:file-size, resource generator --check, source-tree, provenance, inventory invariants/parity, final production build/static smoke.
    Result: pass. Inventory path ordering repair preserves311 prior records and inserts2 new partial native identities in lexical order. Current metadata provenance/parity checks pass for313 modules. Final build terminal70393 exit0, relative assets/no backend endpoints; existing large-chunk warning retained.
    Scope:17 semantic files; source pin9bc445578031fecf56086729d8e4940c77e14d65, four protected IO files and all complete writer-view IO regions preserved, native caller only; parent686947-character prefix unchanged and stashc85f4a0e453dfd06d6e199554784f2c286737472 retained. No full suite this leaf; user cadence last237/next247. Raw scripts/source/maps/results remain only ignored cache. Actual implementation SHA and governance/current-agent quality/clean close follow.
    Actual implementation: d8d894a35fc37b51a90775e24707256083406740. Current-agent EVALUATOR explicitly not independent reconstructed four certificates without tests and verified all17 actual committed byte sequences; structured quality pass recorded. ap doctor/routing/diff checks pass; two pre-existing readiness-shim/immutable-DONE warnings retained.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-08T17:44:48.636Z — VERIFY — ok

    By: CODER

    Note: Verified native table-property item exchange at d8d894a35fc37b51a90775e24707256083406740:412 targeted app/38 Chromium/45 fresh, passing replay0; actual current-source-bound app/inventory all-four100.17 semantic paths;635/639 prior files unchanged with4 exact native migrations;313 metadata records preserve311 originals. Static/build/source/governance/artifact/IO/pin/stash gates pass. No full suite; next247. Same-agent evaluator is not independent. Whole parent/goal parity remains unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-08T17:44:48.260Z, excerpt_hash=sha256:e72ededff5aa6363c1ceabc92eee52e0158967ae5238635e2189a77ddeb0cef3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610081647-HFS3EK/blueprint/resolved-snapshot.json
    - old_digest: 08cc1f3072e9d4ec59c3ea6670e9d2c2362c645754e98176729a8ce5dd058bbc
    - current_digest: 08cc1f3072e9d4ec59c3ea6670e9d2c2362c645754e98176729a8ce5dd058bbc
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610081647-HFS3EK

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610081647-HFS3EK -m 🧩 HFS3EK task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the actual implementation commit through a new authorized task; preserve task evidence and completed leaves."
  Findings: |-
    Observation: native Columns DeactivatePage always publishes the borrowed representation, and SfxTabDialog Ok admits only created pages. Fresh draft expectations of empty Columns/visited Borders output were incorrect and were superseded by direct pinned-source evidence. Initial Table OK now has no default-materialization history. Shared exchange output and Reset clearing follow native page item ranges.
    Impact: main UI passes SfxItemSet directly with no DTO fallback, while explicitly SET-only shell writes retain original owner/cursor/history. Four exact baseline migrations preserve actual physical geometry and owner/text/history contracts; FULL stored width differs from automatic layout width, and unchanged LEFT retains omitted explicit fields. Complete native item factories/frame formats/page orchestration/layout and whole module/goal parity remain unverified.
    Resolution:45 fresh pointer/page/shell/mounted scenarios plus related tests yield412 app/38 Chromium passes, passing replay0, all-four current source-bound coverage100; all static/source/meta gates pass after bounded native-contract and metadata ordering corrections. All311 prior metadata fields/prefixes/states/defaults/classes retained;313 total. Tests never read/invoke upstream. Source verification is separate from runtime tests. Full cadence237 to247; parent/goal remain active.
id_source: "generated"
---
## Summary

Iteration238 publishes native changed table-property items rather than materializing unchanged UI defaults. Standing iterative goal authorizes local parity/refactoring; no new permission needed.

## Scope

Seventeen intentional semantic paths: seven production files, four fresh acceptance files, four exact source-backed baseline observation/input migrations, and two metadata manifests. Preserve635 of639 prior acceptance files byte-identically. Append two partial native module records while preserving all311 prior record fields/prefixes/states/defaults/classes; total313. apps/office/src/sw/inc/cmdid.ts
apps/office/src/sw/source/uibase/utlui/uiitems.ts
apps/office/src/sw/inc/hintids.ts
apps/office/src/sw/source/ui/table/tabledlg.ts
apps/office/src/sw/source/uibase/shells/tabsh.ts
apps/office/src/sw/browser/presentation/WriterTableDialog.tsx
apps/office/src/sw/browser/presentation/writer-view.tsx
apps/office/src/sw/source/uibase/utlui/native-pointer-items.test.ts
apps/office/src/sw/source/ui/table/native-table-property-output.test.ts
apps/office/src/sw/source/uibase/shells/native-table-property-item-input.test.ts
apps/office/src/sw/browser/presentation/native-table-property-output.test.tsx
apps/office/src/sw/browser/presentation/native-independent-table-properties.test.tsx
apps/office/e2e/writer-native-independent-table-properties.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
apps/office/src/sw/browser/presentation/native-table-properties.test.tsx
apps/office/src/sw/browser/presentation/native-table-alignment.test.tsx

## Plan

Implement one source-owned native table-property changed-item path. Port exact table FN identities in sw/inc/cmdid and borrowed SwPtrItem in uibase/utlui/uiitems. Extend existing page publication to native SfxItemSet name/upper-lower/representation/headline/flow items using saved-value/change flags, and route the real mounted UI to the native overload of ItemSetToTableParam. Canonical native dispatch uses only explicitly set items and FN_TABLE_REP for geometry, preserving empty acceptance full native formats/defaults/history. Explicit old DTO ingress remains available separately for existing callers; do not put DTO translation in the main UI path. Add literal pointer/page/shell and mounted actual-owner tests. Migrate only the original direct-owner spy input projection and the previously declared untouched-dialog Chromium history observation to the source contract, preserving every geometry/owner/history-cycle/text assertion. Per the newly updated user objective, run only new tests and related module tests under one upstream-absent targeted coverage/profile; later only failed/new closures and exact-source cumulative coverage. Full suite cadence is once per10 executable AgentPlane parity leaves; leaf237 was the last full profile, next scheduled at247. Unchanged inventory/infra/unrelated app/Chromium cases are covered by exact unchanged-source certificates, not replayed. Scope15 semantic paths, preserving639 prior acceptance files except2 declared migrations; preserve all311 prior metadata records and append exactly2 mapped partial native records. Final actual-SHA evaluator explicitly not independent, verify/clean close, exact parent prefix append; goal remains active.
Source refinement after targeted failures: implement native created-page admission for Borders so an unvisited page cannot publish initialization-only inner-border items. Once Borders is visited, native FillItemSet metadata output and its grouped history remain source-defined, including untouched widgets. Migrate two additional old mounted snapshot observations: native geometry output omits unchanged upper/lower spacing; FULL changes orientation without replacing stored frame width, and an unchanged LEFT radio preserves original omitted explicit orientation. Retain all actual layout widths, margins, owner/text/history assertions. Scope17; four declared old migrations,635 prior acceptance files byte-identical. Related failed-case-only closures retain356 already passing app and36 Chromium cases without replay.
Final source refinement: native Columns DeactivatePage publishes FN_TABLE_REP unconditionally. Native SfxTabDialog exchange output survives page departures; Reset clears the represented item range for its page. Borders initialization-only items participate after actual page activation. Main properties dispatch has no DTO fallback. Fresh literal orientation/reset/admission/callback cases close changed-source coverage; previously unexecuted related WriterWorkbench/insertion cases execute once. All current412 app/38 Chromium cases pass with45 fresh cases and no passing replay; three fresh draft assumptions are explicitly superseded by pinned source contracts. Coverage all-four100 uses certified exact-source/maps/contiguous-region proofs. Remaining broad native item/frame/layout/page completeness stays unverified.

## Verify Steps

1. Source read pinned uiitems.hxx61-75/uiitems.cxx192-208 borrowed pointer Clone/equality/GetValue, cmdid.h native FN offsets, tabledlg.cxx FillItemSet/DeactivatePage/name/spacing/FN_TABLE_REP gates and Text Flow saved-value publication, tabsh.cxx277-445 explicitly set items/geometry/grouping. Literal pointer/page/shell and mounted tests prove empty input preserves full formats/defaults/history, cloned pointer borrows actual SwTableRep, isolated name/upper-lower/headline/flow/border/geometry changes and one grouped owner/cursor Undo/Redo. Corrected existing Chromium1280/390 scenarios retain all independent physical-cell width and text assertions while requiring untouched OK to create no Undo.
2. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Source<1000 physical lines without compression. Preserve639 prior acceptance files except4 declared native input-spy and known untouched-dialog observation migrations; no unrelated assertion weakening/skip/exclusion.
3. Updated explicit user testing instruction: targeted upstream-absent build/coverage for fresh pointer/page/shell/mounted tests and existing related table/page/shell/Writer UI tests; related Chromium table-properties/format/column/flow/border files only. No full suite this leaf; full cadence once per10 executable AgentPlane parity leaves, last237/next247. Terminal finally restoration, tests never read/invoke upstream. Later only failed or genuinely new closure cases, retain skips/raw threshold exits, no passing replay in closures. Reconstruct app/inventory all-four100 from current actual targeted counters and certified237 whole byte-identical sources/maps or complete contiguous declarations/bodies/enclosing branches/all locations; no sanitation. Unchanged inventory/infra/unrelated runtime cases require source/certificate equality and are not executed.
4. After terminal/restoration: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Scope17; preserve311 prior metadata records/fields/evidence prefixes/states/defaults/classes and append2 mapped partial native records for313 total. Pin9bc445578031fecf56086729d8e4940c77e14d65; stashc85f4a0e453dfd06d6e199554784f2c286737472; exact parent686947-character prefix932660520332dc5a66cc4cef46608459128d9b84b2795a4615c8920bb1bd0b3b unchanged. Protected4 IO/bridge files byte-identical; writer-view sole native table-property input dispatch, complete registered IO handlers unchanged. No upstream/application/Python/raw maps/results in AgentPlane; ignored cache only.
5. ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Actual implementation SHA current-agent EVALUATOR explicitly not independent reconstructs reports without tests; record owner verification/quality and clean checkpoint, supported meaningful task complete actual SHA. DONE immutable. Append entire parent prefix and final clean source/IO/stash/AP audit. Parent/goal ACTIVE, no full architecture/module parity promotion. Native SfxTabDialogController::Ok only calls instantiated pages; unvisited Borders publishes no initialization item, while visited Borders native info-only changes remain admitted. Additional two old snapshot-input assertions migrate to native changed-item/stored-versus-layout width contracts with all literal rendered geometry retained.
Final source clarification: validate unconditional Columns representation output even without edits, page-exchange item retention, Reset item-range clearing, Borders created-page admission, and absence of a main UI DTO fallback. Literal native orientation matrices, row-split-only, active-columns, four Reset scopes and insertion callback branches must be covered. Three fresh draft expectations superseded by pinned source contracts are reported explicitly; no baseline acceptance case removed. Current runtime census412 app/38 Chromium/45 fresh, no passing replay. Final build/static smoke and metadata provenance/parity checks pass; ordering repair changes only insertion position of the two new metadata identities.

## Verification

Command: targeted upstream-absent Vitest coverage and related Chromium profile, followed only by failed/new cases and two previously unexecuted related WriterWorkbench/insertion module files.
Result: pass for412 current unique app cases,38 Chromium cases,45 fresh cases; passing replay0. Three source-disproved fresh draft expectations superseded explicitly in runtime-census.json; all639 baseline acceptance files remain represented with635 byte-identical files and4 exact source-backed migrations. App17457 lines/19171 statements/4389 functions/14267 branches and inventory1464/1523/384/1081 reach100% via actual targeted counters plus237 certified whole identical-source/maps or complete contiguous declaration/body/enclosing branch/location proof; raw partial-profile threshold exits remain recorded.
Command: format:check, lint, typecheck, check:dependencies, check:docs, check:file-size, resource generator --check, source-tree, provenance, inventory invariants/parity, final production build/static smoke.
Result: pass. Inventory path ordering repair preserves311 prior records and inserts2 new partial native identities in lexical order. Current metadata provenance/parity checks pass for313 modules. Final build terminal70393 exit0, relative assets/no backend endpoints; existing large-chunk warning retained.
Scope:17 semantic files; source pin9bc445578031fecf56086729d8e4940c77e14d65, four protected IO files and all complete writer-view IO regions preserved, native caller only; parent686947-character prefix unchanged and stashc85f4a0e453dfd06d6e199554784f2c286737472 retained. No full suite this leaf; user cadence last237/next247. Raw scripts/source/maps/results remain only ignored cache. Actual implementation SHA and governance/current-agent quality/clean close follow.
Actual implementation: d8d894a35fc37b51a90775e24707256083406740. Current-agent EVALUATOR explicitly not independent reconstructed four certificates without tests and verified all17 actual committed byte sequences; structured quality pass recorded. ap doctor/routing/diff checks pass; two pre-existing readiness-shim/immutable-DONE warnings retained.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-08T17:44:48.636Z — VERIFY — ok

By: CODER

Note: Verified native table-property item exchange at d8d894a35fc37b51a90775e24707256083406740:412 targeted app/38 Chromium/45 fresh, passing replay0; actual current-source-bound app/inventory all-four100.17 semantic paths;635/639 prior files unchanged with4 exact native migrations;313 metadata records preserve311 originals. Static/build/source/governance/artifact/IO/pin/stash gates pass. No full suite; next247. Same-agent evaluator is not independent. Whole parent/goal parity remains unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-08T17:44:48.260Z, excerpt_hash=sha256:e72ededff5aa6363c1ceabc92eee52e0158967ae5238635e2189a77ddeb0cef3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610081647-HFS3EK/blueprint/resolved-snapshot.json
- old_digest: 08cc1f3072e9d4ec59c3ea6670e9d2c2362c645754e98176729a8ce5dd058bbc
- current_digest: 08cc1f3072e9d4ec59c3ea6670e9d2c2362c645754e98176729a8ce5dd058bbc
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610081647-HFS3EK

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610081647-HFS3EK -m 🧩 HFS3EK task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the actual implementation commit through a new authorized task; preserve task evidence and completed leaves.

## Findings

Observation: native Columns DeactivatePage always publishes the borrowed representation, and SfxTabDialog Ok admits only created pages. Fresh draft expectations of empty Columns/visited Borders output were incorrect and were superseded by direct pinned-source evidence. Initial Table OK now has no default-materialization history. Shared exchange output and Reset clearing follow native page item ranges.
Impact: main UI passes SfxItemSet directly with no DTO fallback, while explicitly SET-only shell writes retain original owner/cursor/history. Four exact baseline migrations preserve actual physical geometry and owner/text/history contracts; FULL stored width differs from automatic layout width, and unchanged LEFT retains omitted explicit fields. Complete native item factories/frame formats/page orchestration/layout and whole module/goal parity remain unverified.
Resolution:45 fresh pointer/page/shell/mounted scenarios plus related tests yield412 app/38 Chromium passes, passing replay0, all-four current source-bound coverage100; all static/source/meta gates pass after bounded native-contract and metadata ordering corrections. All311 prior metadata fields/prefixes/states/defaults/classes retained;313 total. Tests never read/invoke upstream. Source verification is separate from runtime tests. Full cadence237 to247; parent/goal remain active.
