---
id: "202610141343-S1NTHP"
title: "Migrate shared border Color ownership and Writer consumers"
result_summary: "Canonical Color contracts replace represented numeric border state; Writer consumers migrated, inventory updated, all focused checks pass. Full Calc UI/ODS readiness still pending."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-14T13:44:28.949Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-14T13:57:42.453Z"
  updated_by: "CODER"
  note: "Actual source38ab159e2225,58paths3696hashes12nativepins. Canonical Color ownership and all Writer consumers; shared6owners raw100, Calc171tests raw100, related299tests and18Chromiumcases pass.12gates31boundaries. Writer gaps exempt; same-agent review not independent."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-14T13:57:27.082Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review, not independent: canonical represented border Color ownership and migrated Writer consumers verified"
  evaluated_sha: "38ab159e2225e771b0b0d3e3fb7553734afd8b6e"
  blueprint_digest: "d7ce75d45e9eab11c263ee7ac1b50a264793bc0c1795979935eba770e35af9ba"
  evidence_refs:
    - ".agentplane/tasks/202610141343-S1NTHP/README.md"
    - ".agentplane/tasks/202610141343-S1NTHP/quality/20261014-135727082-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610141343-S1NTHP/quality/20261014-135727082-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610141343-S1NTHP/quality/20261014-135727082-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610141343-S1NTHP/blueprint/resolved-snapshot.json"
    - "output/playwright/task129-checks/exact-review.json"
    - "output/playwright/task129-checks/value-coverage-audit.json"
    - "output/playwright/task129-checks/browser-manifest.json"
  findings:
    - "Exact58paths57existing1new,3696hashes12nativepins; shared6wholeowners raw100, Calc171tests raw100, related299tests24files and18Chromiumcases pass. Twelve focused gates31boundaries. Original Color copy/value/out contracts; IO schemas retained."
    - "Writer-only coverage gaps reported under explicit exception. Stale Writer Which equality acceptance corrected against native source; implementation unchanged. Opening JSDoc relocation retains byte-identical runtime body and statement locations."
commit:
  hash: "38ab159e2225e771b0b0d3e3fb7553734afd8b6e"
  message: "🚧 S1NTHP core: use shared Color for border owners and Writer consumers"
comments:
  -
    author: "CODER"
    body: "Start: explicit human authorization for shared canonical Color contracts and all Writer consumers, no numeric compatibility core."
  -
    author: "CODER"
    body: "Verified: shared border Color ownership, native copy/out semantics and all Writer consumer migrations; strict shared/Calc100 and related/browser checks."
events:
  -
    type: "status"
    at: "2026-10-14T13:44:39.207Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: explicit human authorization for shared canonical Color contracts and all Writer consumers, no numeric compatibility core."
  -
    type: "verify"
    at: "2026-10-14T13:57:42.453Z"
    author: "CODER"
    state: "ok"
    note: "Actual source38ab159e2225,58paths3696hashes12nativepins. Canonical Color ownership and all Writer consumers; shared6owners raw100, Calc171tests raw100, related299tests and18Chromiumcases pass.12gates31boundaries. Writer gaps exempt; same-agent review not independent."
  -
    type: "status"
    at: "2026-10-14T13:58:01.825Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: shared border Color ownership, native copy/out semantics and all Writer consumer migrations; strict shared/Calc100 and related/browser checks."
doc_version: 3
doc_updated_at: "2026-10-14T13:58:01.828Z"
doc_updated_by: "CODER"
description: "Task129: replace represented numeric color ownership in SvxBorderLine and connected shared selector/frame/page contracts with actual Tools Color, migrate all Writer callers and browser serialization boundaries, no legacy numeric core overloads. Explicit repeated human authorization to fix shared and Writer contracts. Preserve all existing metric/style semantics; advanced theme and shading remain separately unported."
sections:
  Summary: "Task129: use actual shared Tools Color values throughout represented border ownership and migrate Writer consumers, under repeated explicit human authorization. Work only calc branch/checkout. Success is native copy and equality semantics, original serialized numeric records, strict Calc/shared coverage and related Writer checks. No full suite until true UI+ODS readiness, then pause as requested."
  Scope: "Shared editeng borderline/frmitems, svx framelink/frmsel, cui border page, xmloff border serialization, Writer table construction and browser presentation. All corresponding unit/browser fixtures and existing five affected writer e2e specs; exact runtime/provenance records for changed runtime owners, Color/border capability linkage and calc-core progress. At most80 scoped paths, no unrelated native feature, theme/shading or ODS implementation in this migration. No numeric core compatibility overloads."
  Plan: "Migrate shared border Color ownership and connected selector/frame/page plus all Writer consumers; native copies/borrowed references, only numeric IO boundaries. Strict whole changed shared and Calc raw100; related Writer tests and five affected Chromium specs. Inventory/provenance and exact-source review. No full suite before UI/ODS readiness."
  Verify Steps: "Read exact include/editeng/borderline.hxx and editeng/source/items/borderline.cxx, svx frame/selector and cui border source, editeng frmitems UNO boundaries. Run npm run test:coverage:calc, related boxitem/frame selector/style/cui border tests and all changed Writer testfiles; include complete changed shared runtime owners in strict100S/B/F/L coverage and independently inspect every raw counter. Include changed Writer runtime owners for gap reporting only, do not repair Writer-only coverage. No thresholds/counter-map mutation. Remove/restore4native symlinks around runtime tests. 12focused static gates; module-boundary31tests; production build and five affected Chromium writer e2e specs. Exact path allowlist/hash/nativepin review and clean calc. No C++/native memory arithmetic experiments."
  Verification: |-
    Command: node output/playwright/task129-checks/portable.mjs; expanded related-only closure node output/playwright/task129-checks/portable.mjs --shared-only --units-only. Result: pass. Evidence:299tests24files pass. Complete6shared owners828S675B197F739L100 everyrawcounterpositive. WholeCalc171tests66files33owners4161S2731B821F3709L100, unchanged Calc sources were not replayed after the unrelated Writer assertion correction. Production build and18Chromiumcases5migratedspecs pass. Four reference links absent/restoredfinally. No map/counter rewriting or merging. Three Writerowners gaps measured/reported and explicitly exempt, no runtime workaround or gap repair. No persistent threshold changes.

    Command: node output/playwright/task129-checks/gates.mjs; npx vitest run scripts/check-module-boundaries.test.ts. Result: pass. Evidence:12focused gates and31moduleboundary tests pass. Scope:58paths57changed1new within approved80,3695to3696sourceblobs,12nativeSHA256pins. Initial typecheck and registry-script schema errors fixed before successful runtime profile. Initial whole shared profile selection omitted unchanged Size/Protect/merge consumers; existing related cases added. An old Writer Which-sensitive equality expectation contradicted the canonical shared task115 fix, corrected one assertion to match native payload-only comparison. Initial static failures corrected opening fileoverview, exact Color-owning CUI->Tools edge with forbiddenreverse test, and it.each evidence marker. Pure opening overview/import relocation retains byte-identical runtime body and all existing statement locations; proof recorded without unnecessary runtime replay. Same-agent evaluator is not independent.

    Skipped: full application suites. Reason: explicit human nextfull checkpoint is actual minimum Calc UI/document and same-model ODS load/save readiness, still pending. Risk: full application and unrepresented ComplexColor/theme/shading/advanced APIs not recertified. Approval: human related-test, Writer-only coverage exemption and readiness/pause instructions. Scope explicitly does not claim complete SvxBorderLine/upstream/UI parity.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-14T13:57:42.453Z — VERIFY — ok

    By: CODER

    Note: Actual source38ab159e2225,58paths3696hashes12nativepins. Canonical Color ownership and all Writer consumers; shared6owners raw100, Calc171tests raw100, related299tests and18Chromiumcases pass.12gates31boundaries. Writer gaps exempt; same-agent review not independent.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-14T13:57:35.477Z, excerpt_hash=sha256:d2eaadc9c9f8d759ee9687bef9f6ef585542c647c38b54ec6ab62581e83c05e7

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610141343-S1NTHP/blueprint/resolved-snapshot.json
    - old_digest: d7ce75d45e9eab11c263ee7ac1b50a264793bc0c1795979935eba770e35af9ba
    - current_digest: d7ce75d45e9eab11c263ee7ac1b50a264793bc0c1795979935eba770e35af9ba
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610141343-S1NTHP

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610141343-S1NTHP -m 🧩 S1NTHP task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task implementation and metadata commits using a future approved task; never reset unrelated changes or merge branches."
  Findings: |-
    Preflight clean calc after task128. Shared core SvxBorderLine currently uses primitive color; native stores value Color and constructor/SetColor copy. Native GetColor is const reference; JS readonly return preserves actual backing Color identity. Style GetColorPrim returns Color by value, so return independent copy. Existing theme/shading/callback contracts remain unported and must not be falsely certified. Human explicitly authorizes Writer fixes and ordinary JS arithmetic.

    Initial typecheck caught an over-broad mechanical GetVisibleWidth return replacement and one assertion projection accidentally reused as SetColor input; both fixed within approved migration before runtime tests. Final related278tests21files pass, but selecting these border files alone leaves existing SvxProtectItem/SvxSizeItem and merge-page branch counters uncovered in the complete shared frmitems/cui owners. Add their existing native-format-attribute-notify, fmtfsize and native-collapsing-border-page tests to the related selection, retaining strict100 for all6shared owners and reporting Writer-only gaps. No implementation or threshold relaxation. Metadata generator initially assumed all records used upstreamPath/preservedResponsibilities; browser adaptations use responsibilities/local-only, corrected loader to preserve original schemas/history, read existing records from committed HEAD to avoid duplicate appends. No production change from these evidence-tool failures.

    The added existing protection-owner test file exposed one stale unrelated Writer expectation: CntUInt32Item equality was still expected to compare Which, despite the canonical shared fix in task115. Original cintitem.cxx compares payload after a same-type debug assertion, not Which. Update this one Writer expectation to true, without changing shared implementation; explicitly authorized canonical shared/Writer corrections. Retain failing24file diagnostic. Final56paths55existing1new within approved80;12nativepins.

    Final expanded related profile:299tests24files pass. Complete6shared owners828statements675branches197functions739lines have100 and every raw counter positive. Original three Writer owners measured but gaps retained: WriterEditableTable1S3B, WriterBorderPage1B, swtable88S114B8F. No coverage-map merging/rewriting, new counters or persistent threshold changes. Existing whole Calc171tests66files33owners pass raw100. Production build and18Chromiumcases5specs passed once; no replay after unrelated Writer assertion-only correction. All four symlinks restored by finally. Whole source metadata56paths55changed1new and12nativepins; no C++ compilation.

    Initial static gates9/12passed. Opening fileoverview moved before existing Color import without any import-order or runtime body/location change; exact proof retained, no passing runtime replay. Canonical native CUI directly uses Color/COL_BLACK and now needs allowed cui->tools edge; reverse tools->cui explicitly remains forbidden in existing boundary test. Capability tests with it.each use opening fileoverview evidence marker. Final58paths57changed1new within approved80; no runtime criterion relaxation.
id_source: "generated"
---
## Summary

Task129: use actual shared Tools Color values throughout represented border ownership and migrate Writer consumers, under repeated explicit human authorization. Work only calc branch/checkout. Success is native copy and equality semantics, original serialized numeric records, strict Calc/shared coverage and related Writer checks. No full suite until true UI+ODS readiness, then pause as requested.

## Scope

Shared editeng borderline/frmitems, svx framelink/frmsel, cui border page, xmloff border serialization, Writer table construction and browser presentation. All corresponding unit/browser fixtures and existing five affected writer e2e specs; exact runtime/provenance records for changed runtime owners, Color/border capability linkage and calc-core progress. At most80 scoped paths, no unrelated native feature, theme/shading or ODS implementation in this migration. No numeric core compatibility overloads.

## Plan

Migrate shared border Color ownership and connected selector/frame/page plus all Writer consumers; native copies/borrowed references, only numeric IO boundaries. Strict whole changed shared and Calc raw100; related Writer tests and five affected Chromium specs. Inventory/provenance and exact-source review. No full suite before UI/ODS readiness.

## Verify Steps

Read exact include/editeng/borderline.hxx and editeng/source/items/borderline.cxx, svx frame/selector and cui border source, editeng frmitems UNO boundaries. Run npm run test:coverage:calc, related boxitem/frame selector/style/cui border tests and all changed Writer testfiles; include complete changed shared runtime owners in strict100S/B/F/L coverage and independently inspect every raw counter. Include changed Writer runtime owners for gap reporting only, do not repair Writer-only coverage. No thresholds/counter-map mutation. Remove/restore4native symlinks around runtime tests. 12focused static gates; module-boundary31tests; production build and five affected Chromium writer e2e specs. Exact path allowlist/hash/nativepin review and clean calc. No C++/native memory arithmetic experiments.

## Verification

Command: node output/playwright/task129-checks/portable.mjs; expanded related-only closure node output/playwright/task129-checks/portable.mjs --shared-only --units-only. Result: pass. Evidence:299tests24files pass. Complete6shared owners828S675B197F739L100 everyrawcounterpositive. WholeCalc171tests66files33owners4161S2731B821F3709L100, unchanged Calc sources were not replayed after the unrelated Writer assertion correction. Production build and18Chromiumcases5migratedspecs pass. Four reference links absent/restoredfinally. No map/counter rewriting or merging. Three Writerowners gaps measured/reported and explicitly exempt, no runtime workaround or gap repair. No persistent threshold changes.

Command: node output/playwright/task129-checks/gates.mjs; npx vitest run scripts/check-module-boundaries.test.ts. Result: pass. Evidence:12focused gates and31moduleboundary tests pass. Scope:58paths57changed1new within approved80,3695to3696sourceblobs,12nativeSHA256pins. Initial typecheck and registry-script schema errors fixed before successful runtime profile. Initial whole shared profile selection omitted unchanged Size/Protect/merge consumers; existing related cases added. An old Writer Which-sensitive equality expectation contradicted the canonical shared task115 fix, corrected one assertion to match native payload-only comparison. Initial static failures corrected opening fileoverview, exact Color-owning CUI->Tools edge with forbiddenreverse test, and it.each evidence marker. Pure opening overview/import relocation retains byte-identical runtime body and all existing statement locations; proof recorded without unnecessary runtime replay. Same-agent evaluator is not independent.

Skipped: full application suites. Reason: explicit human nextfull checkpoint is actual minimum Calc UI/document and same-model ODS load/save readiness, still pending. Risk: full application and unrepresented ComplexColor/theme/shading/advanced APIs not recertified. Approval: human related-test, Writer-only coverage exemption and readiness/pause instructions. Scope explicitly does not claim complete SvxBorderLine/upstream/UI parity.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-14T13:57:42.453Z — VERIFY — ok

By: CODER

Note: Actual source38ab159e2225,58paths3696hashes12nativepins. Canonical Color ownership and all Writer consumers; shared6owners raw100, Calc171tests raw100, related299tests and18Chromiumcases pass.12gates31boundaries. Writer gaps exempt; same-agent review not independent.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-14T13:57:35.477Z, excerpt_hash=sha256:d2eaadc9c9f8d759ee9687bef9f6ef585542c647c38b54ec6ab62581e83c05e7

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610141343-S1NTHP/blueprint/resolved-snapshot.json
- old_digest: d7ce75d45e9eab11c263ee7ac1b50a264793bc0c1795979935eba770e35af9ba
- current_digest: d7ce75d45e9eab11c263ee7ac1b50a264793bc0c1795979935eba770e35af9ba
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610141343-S1NTHP

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610141343-S1NTHP -m 🧩 S1NTHP task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task implementation and metadata commits using a future approved task; never reset unrelated changes or merge branches.

## Findings

Preflight clean calc after task128. Shared core SvxBorderLine currently uses primitive color; native stores value Color and constructor/SetColor copy. Native GetColor is const reference; JS readonly return preserves actual backing Color identity. Style GetColorPrim returns Color by value, so return independent copy. Existing theme/shading/callback contracts remain unported and must not be falsely certified. Human explicitly authorizes Writer fixes and ordinary JS arithmetic.

Initial typecheck caught an over-broad mechanical GetVisibleWidth return replacement and one assertion projection accidentally reused as SetColor input; both fixed within approved migration before runtime tests. Final related278tests21files pass, but selecting these border files alone leaves existing SvxProtectItem/SvxSizeItem and merge-page branch counters uncovered in the complete shared frmitems/cui owners. Add their existing native-format-attribute-notify, fmtfsize and native-collapsing-border-page tests to the related selection, retaining strict100 for all6shared owners and reporting Writer-only gaps. No implementation or threshold relaxation. Metadata generator initially assumed all records used upstreamPath/preservedResponsibilities; browser adaptations use responsibilities/local-only, corrected loader to preserve original schemas/history, read existing records from committed HEAD to avoid duplicate appends. No production change from these evidence-tool failures.

The added existing protection-owner test file exposed one stale unrelated Writer expectation: CntUInt32Item equality was still expected to compare Which, despite the canonical shared fix in task115. Original cintitem.cxx compares payload after a same-type debug assertion, not Which. Update this one Writer expectation to true, without changing shared implementation; explicitly authorized canonical shared/Writer corrections. Retain failing24file diagnostic. Final56paths55existing1new within approved80;12nativepins.

Final expanded related profile:299tests24files pass. Complete6shared owners828statements675branches197functions739lines have100 and every raw counter positive. Original three Writer owners measured but gaps retained: WriterEditableTable1S3B, WriterBorderPage1B, swtable88S114B8F. No coverage-map merging/rewriting, new counters or persistent threshold changes. Existing whole Calc171tests66files33owners pass raw100. Production build and18Chromiumcases5specs passed once; no replay after unrelated Writer assertion-only correction. All four symlinks restored by finally. Whole source metadata56paths55changed1new and12nativepins; no C++ compilation.

Initial static gates9/12passed. Opening fileoverview moved before existing Color import without any import-order or runtime body/location change; exact proof retained, no passing runtime replay. Canonical native CUI directly uses Color/COL_BLACK and now needs allowed cui->tools edge; reverse tools->cui explicitly remains forbidden in existing boundary test. Capability tests with it.each use opening fileoverview evidence marker. Final58paths57changed1new within approved80; no runtime criterion relaxation.
