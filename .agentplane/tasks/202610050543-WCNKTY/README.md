---
id: "202610050543-WCNKTY"
title: "Share Writer paragraph rendering between body text and table cells"
result_summary: "Shared body/cell paragraph rendering now displays native alignment,style,indent,color and list labels;duplicate cell assembler removed and supported history/ODT path verified."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T06:04:22.608Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-05T06:11:22.330Z"
  updated_by: "CODER"
  note: "Verified 41c08db25de40c8c822bdd7e89df1da7b02139be:shared body/cell paragraph display;one absent profile plus exact2failed closure,100 cumulative coverage,101 first-pass Chromium,prior assertions retained. Progress only;full parity unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-05T06:10:46.246Z"
  updated_by: "EVALUATOR"
  note: "Verified progress on exact 41c08db25de40c8c822bdd7e89df1da7b02139be: shared native paragraph display for body and cells;one full absent profile plus exact two failed-case closure. Same-actor readonly quality phase,not independent review;full parity unverified."
  evaluated_sha: "41c08db25de40c8c822bdd7e89df1da7b02139be"
  blueprint_digest: "55005116749c53ae7708b00bbf9e6cf8d171a1eee21d1974e54e483815e4c654"
  evidence_refs:
    - ".agentplane/tasks/202610050543-WCNKTY/README.md"
    - ".agentplane/tasks/202610050543-WCNKTY/quality/20261005-061046246-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610050543-WCNKTY/quality/20261005-061046246-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610050543-WCNKTY/quality/20261005-061046246-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610050543-WCNKTY/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610050543-WCNKTY/evidence/scope-and-native-hashes.json"
    - ".agentplane/tasks/202610050543-WCNKTY/evidence/absent-profile.json"
    - ".agentplane/tasks/202610050543-WCNKTY/evidence/failed-only-replay.json"
    - ".agentplane/tasks/202610050543-WCNKTY/evidence/cumulative-coverage.json"
    - ".agentplane/tasks/202610050543-WCNKTY/evidence/static-gates.json"
    - ".agentplane/tasks/202610050543-WCNKTY/evidence/changed-source-static-checks.json"
    - ".agentplane/tasks/202610050543-WCNKTY/evidence/restored-source-audits.json"
    - "41c08db25de40c8c822bdd7e89df1da7b02139be"
  findings:
    - "Exact SHA contains only nine approved semantic paths. Cell-only attribute/text-run assembler and synthetic fallback removed;visible and measurement tables consume common actual native projections with native stable IDs. Shell edit/history owners unchanged. Twelve new app and one real Chromium contracts verify supported display;all101browser cases passed firstprofile."
    - "All367prior test files preserved except two observed fixtures with required native projection plumbing;inverse reconstruction proves prior assertions unchanged. Fullapp11881pass/2fail;two exact failed cases close2pass/24skipped. Production identical after firstprofile,zero passing/fullbuild replays. Actual Istanbul countmap merge closes100fourmetrics;firstinventory100. All244states/defaults/exceptions unchanged;five native hashes."
commit:
  hash: "2267abb0e9fadf1eb82be51adf8031cacff176b8"
  message: "✅ WCNKTY task: record shared paragraph display verification"
comments:
  -
    author: "CODER"
    body: "Start: remove the partial table cell renderer and share actual paragraph projection, native list labels and display behavior with body and measurement text."
  -
    author: "CODER"
    body: "Verified: 41c08db25de40c8c822bdd7e89df1da7b02139be shares body/cell native paragraph display,removes partial cell assembler and synthetic ID fallback. One absent profile and exact2failed closure pass;101Chromium firstpass,cumulative app100,prior assertions and244states preserved. Verified progress;full native/UI parity unverified,goal active."
events:
  -
    type: "status"
    at: "2026-10-05T05:44:38.596Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: remove the partial table cell renderer and share actual paragraph projection, native list labels and display behavior with body and measurement text."
  -
    type: "verify"
    at: "2026-10-05T06:11:22.330Z"
    author: "CODER"
    state: "ok"
    note: "Verified 41c08db25de40c8c822bdd7e89df1da7b02139be:shared body/cell paragraph display;one absent profile plus exact2failed closure,100 cumulative coverage,101 first-pass Chromium,prior assertions retained. Progress only;full parity unverified."
  -
    type: "status"
    at: "2026-10-05T06:11:46.139Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: 41c08db25de40c8c822bdd7e89df1da7b02139be shares body/cell native paragraph display,removes partial cell assembler and synthetic ID fallback. One absent profile and exact2failed closure pass;101Chromium firstpass,cumulative app100,prior assertions and244states preserved. Verified progress;full native/UI parity unverified,goal active."
doc_version: 3
doc_updated_at: "2026-10-05T06:11:46.141Z"
doc_updated_by: "CODER"
description: "Remove the partial cell font/spacing renderer and identity fallback; render actual cell paragraph projections and native list labels through the same paragraph component on visible and measurement surfaces. Preserve shared input/history ownership, registered I/O deviations and all semantic statuses."
sections:
  Summary: "Share Writer paragraph rendering between body text and table cells."
  Scope: |-
    - apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
    - apps/office/src/sw/browser/editor/WriterEditableTable.tsx
    - apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx
    - apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx
    - apps/office/src/sw/browser/editor/cell-paragraph-rendering.test.tsx
    - apps/office/e2e/writer-cell-paragraph-format.spec.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
    - apps/office/src/sw/browser/presentation/WriterPageLayout.test.tsx
  Plan: "Use one browser paragraph renderer and one immutable native-node projection for body and cell text,matching pinned SwCellFrame -> InsertCnt_ -> MakeTextFrame -> SwTextFrame ownership. Remove WriterEditableTableCell's partial attribute/font/spacing/readTextRuns assembly and synthetic node-index identity fallback. Require table paragraph projections keyed by actual SwNodes index;build the shared map once in WriterPlainTextEditor and pass the same values to visible and closed-shadow measurement tables. Reuse WriterEditableParagraph for actual effective alignment,style,color/highlight,font,indent and native node.GetListLabel/list-layout display,without editable DTO round-trip or React list numbering/history logic. Add only structural cell position/explicit editable-island/spacing context to the common paragraph;use native stable paragraph IDs for unique accessibility descriptions and React keys,retain empty-cell caret and shared DOM selection registration. Keep body fragment/layout/line-number contracts and existing shell edits unchanged. Independent owned projection/mounted and Chromium cases check literal alignment,signed/manual or automatic first-line values,supported list labels/level geometry,style and text colors,font runs,neighbor/body isolation,actual native model/history and ODT reopen;visible and measurement rendering share values. First-static observed old standalone table-prop fixtures receive required projection-map plumbing only,all prior assertions retained unless an exact first-profile source contradiction is observed. Three existing runtime rows receive bounded notes/evidence only;all244states/defaults/exceptions unchanged,no promotion/newmodule. Table-wide Home/navigation/selection,merged/nested cell/native table text-frame pagination/spacing collapse,full portion engine and list structural operations remain unverified,next leaves. Six static gates first;ONE sequential full build/app/inventory/scripts/Chromium profile with vendor renamed inside repository in try/finally and reportOnFailure;persist exact failed/error-causing names before collector assertions,both first coverage JSON countmaps only ignored appcache. Repeat failed/new-unexecuted cases only,zero passing replay;restore before five source audits. Scope/native hashes,exact-SHA same-actor readonly quality,doctor/routing,CODER Verification beforeverify and canonicalfinish. No network/outside/global/subagents/Agentplane sources/helpers/Python/probes/rawdiagnostics;oneleaf139 only,goalactive. First full absent profile additionally observed WriterPageLayout's table-pagination fixture omitting connected cell textNodes;add actual immutable WriterViewProjection textNodes plumbing to that sole failed case,all pagination assertions unchanged. New inherited Heading1 literal expected values will be checked against existing core and pinned native pool defaults before the two exact failed cases replay. No production change or passing replay."
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

    Owned literal native-node projection,mounted cell/body and Chromium format/list/history/ODT contracts. ONE absent full profile,exact failed/new-only closure,no passing replay. Both first countmaps retained only in ignored appcache. All244states/defaults/exceptions remain unchanged.
  Verification: |-
    CODER verified progress on semantic 41c08db25de40c8c822bdd7e89df1da7b02139be against approved shared body/cell paragraph display scope. Private cell attribute/font/spacing/text-run assembler and synthetic ID fallback removed;visible and measurement use common immutable actual-node projection and renderer. Actual shell edits/history unchanged. Six declared static gates pass after observed new formatting/constructor and fixture plumbing failures;focused changed tests and final typecheck pass. ONE sequential full upstream-absent profile:build0,app11881pass/2fail of11883/284files,inventory109pass and first100fourmetrics,scripts5pass,Chromium101pass including the new ODT/history case. Exact2failed replay closes2pass/24skipped,zero passing or full-build replays;production unchanged after firstprofile. Newapp12cases,11firstpass/1failed-only closure;Heading1 native360twips/18pt expected. Actual source-identical Istanbul map merge app100lines/statements/functions/branches,firstinventory100;both first countmaps only ignored appcache. All vendor renames restored in finally before five passing source audits/semanticviolations0. Scope367priorfiles365byteidentical;two old fixture files receive plumbing only,all original assertions retained by inverse proof. Existing244states/defaults/exceptions unchanged,no newrow/promotion,six bounded notes,five native hashes. Exact-SHA same-actor readonly audit exited0 before qualitypass;not independent review. Quality .agentplane/tasks/202610050543-WCNKTY/quality/20261005-061046246-recovery-context/quality-report.json. Doctor0errors/two preexisting warnings,routingpass,ignored-inclusive AP4006files0forbidden before quality;finalscan follows parent persistence. Native full table frames/pagination,spacing collapse,Home/navigation/wide selection,nested/merged cells,portion engine and list structural editing remain unverified. Readonly WriterTextRun projection remains. Registered I/O/recovery decisions untouched;one leaf only,goal active.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-05T06:11:22.330Z — VERIFY — ok

    By: CODER

    Note: Verified 41c08db25de40c8c822bdd7e89df1da7b02139be:shared body/cell paragraph display;one absent profile plus exact2failed closure,100 cumulative coverage,101 first-pass Chromium,prior assertions retained. Progress only;full parity unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T06:11:21.813Z, excerpt_hash=sha256:0dcd204e24fa84e23b12e459c6a0f28b1d3fb30d470adf883ae3b4c7ea6a118e

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610050543-WCNKTY/blueprint/resolved-snapshot.json
    - old_digest: 55005116749c53ae7708b00bbf9e6cf8d171a1eee21d1974e54e483815e4c654
    - current_digest: 55005116749c53ae7708b00bbf9e6cf8d171a1eee21d1974e54e483815e4c654
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610050543-WCNKTY

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610050543-WCNKTY
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the semantic leaf commit without history rewriting."
  Findings: |-
    Iteration139 preflight clean main beae94174aaffd5afdb6121f2d8718069a7976dc,direct,only parent active;previous138 classified verified progress DONE. Four matched policies loaded,user-instructions absent. Actual cell renderer still independently reads font/height/weight/posture/spacing and text runs,omits paragraph alignment,common direct/inherited style/color/indent and native list label display. WriterViewProjection already projects all connected text and actual native GetListLabel values,so no new core projection is needed. Pinned tabfrm.cxx5804/5817 SwCellFrame inserts native cell content through InsertCnt_;frmtool.cxx1622 chooses MakeTextFrame;txtfrm.cxx762/916 constructs the ordinary SwTextFrame for the node;itrcrsr.cxx uses common paragraph/list margins with table-specific guards. This is a concrete shared text-display owner gap,not a claim of full native table layout equivalence. Standing user goal and explicit UI/list/table instruction authorize safe local correction. Preserve all244 semantic states/defaults/exceptions and registered I/O/recovery decisions.

    Implementation139 removes the private partial cell font/spacing/text-run assembler and synthetic node-index identity fallback. One immutable actual-node map and common WriterEditableParagraph now render body,visible cells and closed-shadow measurement,including effective alignment,style,font,color/highlight,manual/signed/automatic indent and native GetListLabel geometry. Native stable IDs key paragraphs and accessibility descriptions;shared shell editing/history remains unchanged. First static formatting failure and incorrect new item-constructor/Dispose calls were corrected;standalone old table fixtures received required projection plumbing after observed type failures. All six static gates passed;focused changed-test formatting/lint and final typecheck passed. ONE sequential full vendor-absent profile:build pass,app11881pass/2fail of11883 across284files,inventory109pass/100fourmetrics,scripts5pass,Chromium101pass including new real cell format/list/history/ODT case. Exact failed names persisted immediately before collection. First app coverage lines/statements99.99/functions99.96/branches100;both first JSON countmaps preserved only ignored appcache. Newapp12cases,11firstpass;new inherited Heading1 expectation corrected24pt to literal native360twips/18pt bold from pinned DocumentStylePoolManager headline sizes. Sole old table-pagination failure required actual full textNodes;its pagination assertions unchanged. Exact2failed replay passed2/skipped24;zero passing replays or full build repeats,production source unchanged after firstprofile. Native source-identical Istanbul countmap merge closes app100fourmetrics without summary substitution;inventory retainsfirst100. Both absent scopes restored references in finally. Five restored source audits pass,semanticviolations0. Scope proof367priorfiles365byteidentical;inverse reconstruction proves both old fixture files retain all prior assertions. All244semanticstates/defaults/exceptions/classifications and I/O/recovery decisions unchanged,no newrow/promotion,six bounded notes,five native hashes. Doctor0errors/two unchanged oldwarnings,routingpass;ignored-inclusive AP4006files0forbidden. Full native table frames/pagination,spacing collapse,Home/navigation/wide selection,nested/merged cells,portion engine and list structural operations remain unverified;shared readonly WriterTextRun display remains. Verified progress only,goalactive.
extensions:
  implementation_commit:
    hash: "41c08db25de40c8c822bdd7e89df1da7b02139be"
    message: "♻️ WCNKTY code: share native paragraph display with table cells"
id_source: "generated"
---
## Summary

Share Writer paragraph rendering between body text and table cells.

## Scope

- apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
- apps/office/src/sw/browser/editor/WriterEditableTable.tsx
- apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx
- apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx
- apps/office/src/sw/browser/editor/cell-paragraph-rendering.test.tsx
- apps/office/e2e/writer-cell-paragraph-format.spec.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json
- apps/office/src/sw/browser/presentation/WriterPageLayout.test.tsx

## Plan

Use one browser paragraph renderer and one immutable native-node projection for body and cell text,matching pinned SwCellFrame -> InsertCnt_ -> MakeTextFrame -> SwTextFrame ownership. Remove WriterEditableTableCell's partial attribute/font/spacing/readTextRuns assembly and synthetic node-index identity fallback. Require table paragraph projections keyed by actual SwNodes index;build the shared map once in WriterPlainTextEditor and pass the same values to visible and closed-shadow measurement tables. Reuse WriterEditableParagraph for actual effective alignment,style,color/highlight,font,indent and native node.GetListLabel/list-layout display,without editable DTO round-trip or React list numbering/history logic. Add only structural cell position/explicit editable-island/spacing context to the common paragraph;use native stable paragraph IDs for unique accessibility descriptions and React keys,retain empty-cell caret and shared DOM selection registration. Keep body fragment/layout/line-number contracts and existing shell edits unchanged. Independent owned projection/mounted and Chromium cases check literal alignment,signed/manual or automatic first-line values,supported list labels/level geometry,style and text colors,font runs,neighbor/body isolation,actual native model/history and ODT reopen;visible and measurement rendering share values. First-static observed old standalone table-prop fixtures receive required projection-map plumbing only,all prior assertions retained unless an exact first-profile source contradiction is observed. Three existing runtime rows receive bounded notes/evidence only;all244states/defaults/exceptions unchanged,no promotion/newmodule. Table-wide Home/navigation/selection,merged/nested cell/native table text-frame pagination/spacing collapse,full portion engine and list structural operations remain unverified,next leaves. Six static gates first;ONE sequential full build/app/inventory/scripts/Chromium profile with vendor renamed inside repository in try/finally and reportOnFailure;persist exact failed/error-causing names before collector assertions,both first coverage JSON countmaps only ignored appcache. Repeat failed/new-unexecuted cases only,zero passing replay;restore before five source audits. Scope/native hashes,exact-SHA same-actor readonly quality,doctor/routing,CODER Verification beforeverify and canonicalfinish. No network/outside/global/subagents/Agentplane sources/helpers/Python/probes/rawdiagnostics;oneleaf139 only,goalactive. First full absent profile additionally observed WriterPageLayout's table-pagination fixture omitting connected cell textNodes;add actual immutable WriterViewProjection textNodes plumbing to that sole failed case,all pagination assertions unchanged. New inherited Heading1 literal expected values will be checked against existing core and pinned native pool defaults before the two exact failed cases replay. No production change or passing replay.

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

Owned literal native-node projection,mounted cell/body and Chromium format/list/history/ODT contracts. ONE absent full profile,exact failed/new-only closure,no passing replay. Both first countmaps retained only in ignored appcache. All244states/defaults/exceptions remain unchanged.

## Verification

CODER verified progress on semantic 41c08db25de40c8c822bdd7e89df1da7b02139be against approved shared body/cell paragraph display scope. Private cell attribute/font/spacing/text-run assembler and synthetic ID fallback removed;visible and measurement use common immutable actual-node projection and renderer. Actual shell edits/history unchanged. Six declared static gates pass after observed new formatting/constructor and fixture plumbing failures;focused changed tests and final typecheck pass. ONE sequential full upstream-absent profile:build0,app11881pass/2fail of11883/284files,inventory109pass and first100fourmetrics,scripts5pass,Chromium101pass including the new ODT/history case. Exact2failed replay closes2pass/24skipped,zero passing or full-build replays;production unchanged after firstprofile. Newapp12cases,11firstpass/1failed-only closure;Heading1 native360twips/18pt expected. Actual source-identical Istanbul map merge app100lines/statements/functions/branches,firstinventory100;both first countmaps only ignored appcache. All vendor renames restored in finally before five passing source audits/semanticviolations0. Scope367priorfiles365byteidentical;two old fixture files receive plumbing only,all original assertions retained by inverse proof. Existing244states/defaults/exceptions unchanged,no newrow/promotion,six bounded notes,five native hashes. Exact-SHA same-actor readonly audit exited0 before qualitypass;not independent review. Quality .agentplane/tasks/202610050543-WCNKTY/quality/20261005-061046246-recovery-context/quality-report.json. Doctor0errors/two preexisting warnings,routingpass,ignored-inclusive AP4006files0forbidden before quality;finalscan follows parent persistence. Native full table frames/pagination,spacing collapse,Home/navigation/wide selection,nested/merged cells,portion engine and list structural editing remain unverified. Readonly WriterTextRun projection remains. Registered I/O/recovery decisions untouched;one leaf only,goal active.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-05T06:11:22.330Z — VERIFY — ok

By: CODER

Note: Verified 41c08db25de40c8c822bdd7e89df1da7b02139be:shared body/cell paragraph display;one absent profile plus exact2failed closure,100 cumulative coverage,101 first-pass Chromium,prior assertions retained. Progress only;full parity unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T06:11:21.813Z, excerpt_hash=sha256:0dcd204e24fa84e23b12e459c6a0f28b1d3fb30d470adf883ae3b4c7ea6a118e

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610050543-WCNKTY/blueprint/resolved-snapshot.json
- old_digest: 55005116749c53ae7708b00bbf9e6cf8d171a1eee21d1974e54e483815e4c654
- current_digest: 55005116749c53ae7708b00bbf9e6cf8d171a1eee21d1974e54e483815e4c654
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610050543-WCNKTY

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610050543-WCNKTY
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the semantic leaf commit without history rewriting.

## Findings

Iteration139 preflight clean main beae94174aaffd5afdb6121f2d8718069a7976dc,direct,only parent active;previous138 classified verified progress DONE. Four matched policies loaded,user-instructions absent. Actual cell renderer still independently reads font/height/weight/posture/spacing and text runs,omits paragraph alignment,common direct/inherited style/color/indent and native list label display. WriterViewProjection already projects all connected text and actual native GetListLabel values,so no new core projection is needed. Pinned tabfrm.cxx5804/5817 SwCellFrame inserts native cell content through InsertCnt_;frmtool.cxx1622 chooses MakeTextFrame;txtfrm.cxx762/916 constructs the ordinary SwTextFrame for the node;itrcrsr.cxx uses common paragraph/list margins with table-specific guards. This is a concrete shared text-display owner gap,not a claim of full native table layout equivalence. Standing user goal and explicit UI/list/table instruction authorize safe local correction. Preserve all244 semantic states/defaults/exceptions and registered I/O/recovery decisions.

Implementation139 removes the private partial cell font/spacing/text-run assembler and synthetic node-index identity fallback. One immutable actual-node map and common WriterEditableParagraph now render body,visible cells and closed-shadow measurement,including effective alignment,style,font,color/highlight,manual/signed/automatic indent and native GetListLabel geometry. Native stable IDs key paragraphs and accessibility descriptions;shared shell editing/history remains unchanged. First static formatting failure and incorrect new item-constructor/Dispose calls were corrected;standalone old table fixtures received required projection plumbing after observed type failures. All six static gates passed;focused changed-test formatting/lint and final typecheck passed. ONE sequential full vendor-absent profile:build pass,app11881pass/2fail of11883 across284files,inventory109pass/100fourmetrics,scripts5pass,Chromium101pass including new real cell format/list/history/ODT case. Exact failed names persisted immediately before collection. First app coverage lines/statements99.99/functions99.96/branches100;both first JSON countmaps preserved only ignored appcache. Newapp12cases,11firstpass;new inherited Heading1 expectation corrected24pt to literal native360twips/18pt bold from pinned DocumentStylePoolManager headline sizes. Sole old table-pagination failure required actual full textNodes;its pagination assertions unchanged. Exact2failed replay passed2/skipped24;zero passing replays or full build repeats,production source unchanged after firstprofile. Native source-identical Istanbul countmap merge closes app100fourmetrics without summary substitution;inventory retainsfirst100. Both absent scopes restored references in finally. Five restored source audits pass,semanticviolations0. Scope proof367priorfiles365byteidentical;inverse reconstruction proves both old fixture files retain all prior assertions. All244semanticstates/defaults/exceptions/classifications and I/O/recovery decisions unchanged,no newrow/promotion,six bounded notes,five native hashes. Doctor0errors/two unchanged oldwarnings,routingpass;ignored-inclusive AP4006files0forbidden. Full native table frames/pagination,spacing collapse,Home/navigation/wide selection,nested/merged cells,portion engine and list structural operations remain unverified;shared readonly WriterTextRun display remains. Verified progress only,goalactive.
