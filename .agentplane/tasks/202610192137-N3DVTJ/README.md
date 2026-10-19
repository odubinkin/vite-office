---
id: "202610192137-N3DVTJ"
title: "Validate integrated Calc and Writer UI at the task40 regression checkpoint"
status: "DOING"
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
  updated_at: "2026-10-19T21:38:16.800Z"
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
    body: "Start: execute the authorized task40 full integrated regression checkpoint,repair proven native/UI contract regressions without weakening gates,and retain current-source raw100/browser evidence;calc checkout only."
events:
  -
    type: "status"
    at: "2026-10-19T21:38:23.942Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: execute the authorized task40 full integrated regression checkpoint,repair proven native/UI contract regressions without weakening gates,and retain current-source raw100/browser evidence;calc checkout only."
doc_version: 3
doc_updated_at: "2026-10-19T21:48:31.064Z"
doc_updated_by: "CODER"
description: "Task40 of the active authorized Calc UI goal:execute the full all-application regression cadence after tasks31-39,repair source-backed regressions in the integrated Calc/shared/Writer UI and contracts,retain current-source raw100 evidence and fresh all-project browser checks. Only vite-office-calc branch calc;next full checkpoint50."
sections:
  Summary: "Task40 executes the user-required full all-application regression checkpoint after tasks31-39 of the active Calc UI goal. Previous goal turn made verified progress:task39 implemented native alignment/shared boolean command state/ODS properties,c40360f375e1c,closed82008dd4003a,Calc372cases and complete changed owners raw100,23browser cases;clean calc tree. The overall UI goal remains active."
  Scope: "Only /Users/odubinkin/Projects/vite-office-calc on calc. Up to60non-task paths for source-backed integration repairs if failures establish a need:current Calc UI/controller/formatting/ODS owners,shared framework/SVX/SFX/VCL/ODF contracts and their actual Writer consumers,related tests and current runtime/provenance/capability records. Do not invent new unrelated services or rewrite tests to erase native behavior. Task artifacts retain complete test/coverage/command/source-hash/browser evidence. No network,outside-repo reads,other checkouts,branches,merges,recovery or primary-save policy changes;no unrelated active-task artifacts. No coverage exclusions,threshold reductions,test removal or timeout/retry inflation."
  Plan: "Run complete all-application tests and raw S/B/F/L100 at checkpoint40,full tooling and inventory coverage,all source/resource/static gates and a fresh build/all-project browser suite. Diagnose failures against pinned upstream9bc445578031fecf56086729d8e4940c77e14d65 and preserve observable native quirks. Repair established integrated UI/core/test-contract regressions within scope. Revalidate affected tests and complete changed executable owners,current-source hashes and raw100;reuse passing unchanged evidence only with explicit source/test reconciliation. Retain raw reports and source-backed findings,record quality and close cleanly on calc. Next full checkpoint50;resume feasible UI work after this required integration boundary."
  Verify Steps: "Execute npm run test:coverage over all Writer/Calc/shared projects with raw JSON,text and reportOnFailure diagnostics;all configured S/B/F/L100 and no unaccounted test failures. Preserve initial and repaired evidence;when replaying only failed/affected tests,prove executable hashes unchanged for reused outcomes and include every changed test/current executable owner with meaningful raw100. If production changes,run Calc100 and all affected related modules/complete changed owners;combine only source-matched compatible coverage evidence. Execute npm run test:tooling and npm run test:inventory:coverage with their complete gates. Execute root format/lint/types,dependencies,Writer/Calc resources,JSDoc,size,source tree/provenance,inventory invariants/parity,routing and doctor. Fresh npm run build;all projects in npx playwright test --config apps/office/playwright.config.ts,then node scripts/check-static-build.mjs. Inspect relevant fresh browser evidence;no uncaught application exceptions. Retain command exits,test counts,raw coverage/digests/current owner hashes,diagnosed source comparisons and quality review. git diff --check and clean final tracked/untracked calc status. Full checkpoint50 follows user cadence;no mandatory checks silently skipped."
  Verification: "Pending full checkpoint evidence. No broad parity or complete-goal claim."
  Rollback Plan: "Revert only intentional task40 repair commits if needed,preserving evidence and unrelated tasks. Keep user-owned merge/branch decisions and existing save/recovery deviations untouched."
  Findings: |-
    Preflight:direct workflow,branch calc,clean tracked/untracked tree;network approval required and unused. No user-instructions file present. Unrelated active C9TN6M,X6VV8G,Z7BW2Y remain untouched. The user explicitly authorized ongoing UI/core/common-module work and a full test run once per10tasks;this is checkpoint40,last recorded full checkpoint30. Prior task39 full related graph467files8582cases found9stale Writer expectations,now corrected and revalidated with213fresh cases and4complete shared owners raw100. Full application coverage uses disjoint Writer/Calc/shared projects and unchanged Istanbul100 thresholds;default report has raw JSON. Diagnostic reportOnFailure changes artifact emission only,not pass criteria. No specific new regression is assumed.

    Initial global lint reports78errors exclusively in old generated output/playwright scratch scripts;git ls-files confirms that directory has no tracked files,and git check-ignore confirms the existing generated-output exclusion. This is not a source regression. Repeat npm run lint -- --ignore-pattern output/playwright/** to apply the same full-source rules while respecting the existing repository artifact boundary;no implementation/test/coverage exclusions or lint rules are changed. Preserve the initial failure log. Root/app typecheck passes.

    Full application and inventory attempts are terminal ENOSPC failures;the application stopped writing temporary coverage chunk137 and produced no final report or test result. These attempts are not accepted evidence and will be repeated sequentially after space recovery. Nine old generated observation inputs/outputs were reversibly gzip-preserved with exact decompressed SHA256 and unchanged-source stat verification before removing the uncompressed duplicates;manifest cache-compaction.json records restoration paths/hashes. Own failed incomplete coverage chunks are discarded as ineligible temporary output. No source or canonical task evidence is removed.

    The full tooling run passes126cases and fails2:an old native-tools test still forbids sc->tools although the current source-backed guard permits the real Calc dependency;and actual shared-project discovery exposes one Writer integration test editeng/browser/text-line-item-codec.test.ts importing real Writer document/Which identities. Correct the source expectation and assign that existing test to the established writerIntegrationTests list,retaining all cases and actual discovery/coverage rules. Pinned patattr.cxx includes tools/fract.hxx and tools/UnitConversion.hxx. No runtime application behavior change is required by these failures.
id_source: "generated"
---
## Summary

Task40 executes the user-required full all-application regression checkpoint after tasks31-39 of the active Calc UI goal. Previous goal turn made verified progress:task39 implemented native alignment/shared boolean command state/ODS properties,c40360f375e1c,closed82008dd4003a,Calc372cases and complete changed owners raw100,23browser cases;clean calc tree. The overall UI goal remains active.

## Scope

Only /Users/odubinkin/Projects/vite-office-calc on calc. Up to60non-task paths for source-backed integration repairs if failures establish a need:current Calc UI/controller/formatting/ODS owners,shared framework/SVX/SFX/VCL/ODF contracts and their actual Writer consumers,related tests and current runtime/provenance/capability records. Do not invent new unrelated services or rewrite tests to erase native behavior. Task artifacts retain complete test/coverage/command/source-hash/browser evidence. No network,outside-repo reads,other checkouts,branches,merges,recovery or primary-save policy changes;no unrelated active-task artifacts. No coverage exclusions,threshold reductions,test removal or timeout/retry inflation.

## Plan

Run complete all-application tests and raw S/B/F/L100 at checkpoint40,full tooling and inventory coverage,all source/resource/static gates and a fresh build/all-project browser suite. Diagnose failures against pinned upstream9bc445578031fecf56086729d8e4940c77e14d65 and preserve observable native quirks. Repair established integrated UI/core/test-contract regressions within scope. Revalidate affected tests and complete changed executable owners,current-source hashes and raw100;reuse passing unchanged evidence only with explicit source/test reconciliation. Retain raw reports and source-backed findings,record quality and close cleanly on calc. Next full checkpoint50;resume feasible UI work after this required integration boundary.

## Verify Steps

Execute npm run test:coverage over all Writer/Calc/shared projects with raw JSON,text and reportOnFailure diagnostics;all configured S/B/F/L100 and no unaccounted test failures. Preserve initial and repaired evidence;when replaying only failed/affected tests,prove executable hashes unchanged for reused outcomes and include every changed test/current executable owner with meaningful raw100. If production changes,run Calc100 and all affected related modules/complete changed owners;combine only source-matched compatible coverage evidence. Execute npm run test:tooling and npm run test:inventory:coverage with their complete gates. Execute root format/lint/types,dependencies,Writer/Calc resources,JSDoc,size,source tree/provenance,inventory invariants/parity,routing and doctor. Fresh npm run build;all projects in npx playwright test --config apps/office/playwright.config.ts,then node scripts/check-static-build.mjs. Inspect relevant fresh browser evidence;no uncaught application exceptions. Retain command exits,test counts,raw coverage/digests/current owner hashes,diagnosed source comparisons and quality review. git diff --check and clean final tracked/untracked calc status. Full checkpoint50 follows user cadence;no mandatory checks silently skipped.

## Verification

Pending full checkpoint evidence. No broad parity or complete-goal claim.

## Rollback Plan

Revert only intentional task40 repair commits if needed,preserving evidence and unrelated tasks. Keep user-owned merge/branch decisions and existing save/recovery deviations untouched.

## Findings

Preflight:direct workflow,branch calc,clean tracked/untracked tree;network approval required and unused. No user-instructions file present. Unrelated active C9TN6M,X6VV8G,Z7BW2Y remain untouched. The user explicitly authorized ongoing UI/core/common-module work and a full test run once per10tasks;this is checkpoint40,last recorded full checkpoint30. Prior task39 full related graph467files8582cases found9stale Writer expectations,now corrected and revalidated with213fresh cases and4complete shared owners raw100. Full application coverage uses disjoint Writer/Calc/shared projects and unchanged Istanbul100 thresholds;default report has raw JSON. Diagnostic reportOnFailure changes artifact emission only,not pass criteria. No specific new regression is assumed.

Initial global lint reports78errors exclusively in old generated output/playwright scratch scripts;git ls-files confirms that directory has no tracked files,and git check-ignore confirms the existing generated-output exclusion. This is not a source regression. Repeat npm run lint -- --ignore-pattern output/playwright/** to apply the same full-source rules while respecting the existing repository artifact boundary;no implementation/test/coverage exclusions or lint rules are changed. Preserve the initial failure log. Root/app typecheck passes.

Full application and inventory attempts are terminal ENOSPC failures;the application stopped writing temporary coverage chunk137 and produced no final report or test result. These attempts are not accepted evidence and will be repeated sequentially after space recovery. Nine old generated observation inputs/outputs were reversibly gzip-preserved with exact decompressed SHA256 and unchanged-source stat verification before removing the uncompressed duplicates;manifest cache-compaction.json records restoration paths/hashes. Own failed incomplete coverage chunks are discarded as ineligible temporary output. No source or canonical task evidence is removed.

The full tooling run passes126cases and fails2:an old native-tools test still forbids sc->tools although the current source-backed guard permits the real Calc dependency;and actual shared-project discovery exposes one Writer integration test editeng/browser/text-line-item-codec.test.ts importing real Writer document/Which identities. Correct the source expectation and assign that existing test to the established writerIntegrationTests list,retaining all cases and actual discovery/coverage rules. Pinned patattr.cxx includes tools/fract.hxx and tools/UnitConversion.hxx. No runtime application behavior change is required by these failures.
