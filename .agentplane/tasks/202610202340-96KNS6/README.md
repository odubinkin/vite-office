---
id: "202610202340-96KNS6"
title: "Run block60 complete application verification and repair regressions"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-20T23:41:00.545Z"
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
    body: "Start:run required complete tenth-block application/Istanbul100 checkpoint,tooling/inventory and integration gates;preserve actual failures and repair source-backed causes without relaxing criteria."
events:
  -
    type: "status"
    at: "2026-10-20T23:41:16.489Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start:run required complete tenth-block application/Istanbul100 checkpoint,tooling/inventory and integration gates;preserve actual failures and repair source-backed causes without relaxing criteria."
doc_version: 3
doc_updated_at: "2026-10-20T23:41:16.489Z"
doc_updated_by: "CODER"
description: "Required tenth-block checkpoint for active Calc UI goal. Execute complete Writer/Calc/shared application test discovery with original Istanbul100 thresholds,all tooling and inventory tests,Calc/source/build/browser gates. Repair actual regressions or missing behavioral tests without weakening thresholds or source ownership. Inspect actual native contracts for implementation fixes. Preserve full raw reports/source pins and evaluator. Only calc checkout/branch;no network/global files/merges. Goal stays active after this checkpoint."
sections:
  Summary: |-
    Run block60 complete application verification and repair regressions

    Required tenth-block checkpoint for active Calc UI goal. Execute complete Writer/Calc/shared application test discovery with original Istanbul100 thresholds,all tooling and inventory tests,Calc/source/build/browser gates. Repair actual regressions or missing behavioral tests without weakening thresholds or source ownership. Inspect actual native contracts for implementation fixes. Preserve full raw reports/source pins and evaluator. Only calc checkout/branch;no network/global files/merges. Goal stays active after this checkpoint.
  Scope: "Complete all application/common unit/coverage,authored tooling and inventory suites plus representative existing Calc/Writer/shared browser/Worker integration. Actual failure repairs only in up to40implementation/test/support files,plus task/quality/evidence/readiness metadata. Native algorithm/contracts preserved;no test thresholds or actual source filters weakened. Source application tests remain full scope. This is the required tenth-block checkpoint,not a complete UI parity claim. Only calc checkout/branch;no external access or merges."
  Plan: "Block60 required full checkpoint:run all actual application projects with original100coverage thresholds and no application source exclusions;derive per-owner Calc/shared/Writer counts from the same raw report. Run all authored tooling and inventory suites,source static/types/resources/registry/provenance/routing/doctor/build gates and actual Calc/Writer/shared Chromium/Worker regressions. Exclude only ignored historical output copies from root tooling discovery,not actual source tests. Repair genuine failures with native-source comparison and behavior-focused tests;up to40implementation/test/support files plus evidence/docs. Do not change thresholds,coverage counters,production guards or ignored lists to get green. Preserve failing and passing raw reports,source/native pins and portable audit. Full EVALUATOR pass and clean direct close;do not pause/complete the broader goal."
  Verify Steps: "Run complete application test:coverage discovery(all Writer,Calc,shared projects) at original100statements/branches/functions/lines;keep actual discovered file/test counts and raw maps. Independently audit every coverage owner and positive counters,derive Calc/shared/Writer scope totals. Run all scripts/*.test.ts authored tooling excluding only ignored historical output copies,and inventory coverage with original thresholds. Full types,authored-source lint/format,dependencies,resources,docs,size,source-tree,provenance,registry,routing,doctor,production/static build. Actual Calc font/wrap/ODS/pool/Worker,Writer page/style/font and shared paper/Worker browser regressions;inspect screenshots. If a failure occurs,preserve initial evidence,compare actual source/native semantics,repair bounded cause and rerun affected checks;rerun whole suite only when runtime changes or unresolved failures justify it. Preserve source/native pins and raw original reports in portable audit;EVALUATOR pass and clean close. No weakened thresholds,hand-edited coverage or unsupported whole-goal completion."
  Verification: "Pending full checkpoint;no passing or coverage claim yet."
  Rollback Plan: "Revert only intentional block60 failure-repair commits after inspecting scoped source/evidence. Keep task59 common paper owner and Writer reuse. User handles integration."
  Findings: "Task59 closed64159a19ec55;528Calc and changed4owners100,33related/19XML/48current tooling cases and3browsers passed. Current Calc FormatCellsDialog is still absent and upstream requires genuine8page composition;Writer does not have a shared font dialog to reuse. No fake partial dialog is introduced. This required checkpoint runs complete authored application tests before further real UI/native work. Three unrelated stale DOING tasks remain untouched. Existing root tooling filters match ignored historical output copies by substring;this checkpoint explicitly excludes output/**only for tooling discovery and preserves all authored sources."
id_source: "generated"
---
## Summary

Run block60 complete application verification and repair regressions

Required tenth-block checkpoint for active Calc UI goal. Execute complete Writer/Calc/shared application test discovery with original Istanbul100 thresholds,all tooling and inventory tests,Calc/source/build/browser gates. Repair actual regressions or missing behavioral tests without weakening thresholds or source ownership. Inspect actual native contracts for implementation fixes. Preserve full raw reports/source pins and evaluator. Only calc checkout/branch;no network/global files/merges. Goal stays active after this checkpoint.

## Scope

Complete all application/common unit/coverage,authored tooling and inventory suites plus representative existing Calc/Writer/shared browser/Worker integration. Actual failure repairs only in up to40implementation/test/support files,plus task/quality/evidence/readiness metadata. Native algorithm/contracts preserved;no test thresholds or actual source filters weakened. Source application tests remain full scope. This is the required tenth-block checkpoint,not a complete UI parity claim. Only calc checkout/branch;no external access or merges.

## Plan

Block60 required full checkpoint:run all actual application projects with original100coverage thresholds and no application source exclusions;derive per-owner Calc/shared/Writer counts from the same raw report. Run all authored tooling and inventory suites,source static/types/resources/registry/provenance/routing/doctor/build gates and actual Calc/Writer/shared Chromium/Worker regressions. Exclude only ignored historical output copies from root tooling discovery,not actual source tests. Repair genuine failures with native-source comparison and behavior-focused tests;up to40implementation/test/support files plus evidence/docs. Do not change thresholds,coverage counters,production guards or ignored lists to get green. Preserve failing and passing raw reports,source/native pins and portable audit. Full EVALUATOR pass and clean direct close;do not pause/complete the broader goal.

## Verify Steps

Run complete application test:coverage discovery(all Writer,Calc,shared projects) at original100statements/branches/functions/lines;keep actual discovered file/test counts and raw maps. Independently audit every coverage owner and positive counters,derive Calc/shared/Writer scope totals. Run all scripts/*.test.ts authored tooling excluding only ignored historical output copies,and inventory coverage with original thresholds. Full types,authored-source lint/format,dependencies,resources,docs,size,source-tree,provenance,registry,routing,doctor,production/static build. Actual Calc font/wrap/ODS/pool/Worker,Writer page/style/font and shared paper/Worker browser regressions;inspect screenshots. If a failure occurs,preserve initial evidence,compare actual source/native semantics,repair bounded cause and rerun affected checks;rerun whole suite only when runtime changes or unresolved failures justify it. Preserve source/native pins and raw original reports in portable audit;EVALUATOR pass and clean close. No weakened thresholds,hand-edited coverage or unsupported whole-goal completion.

## Verification

Pending full checkpoint;no passing or coverage claim yet.

## Rollback Plan

Revert only intentional block60 failure-repair commits after inspecting scoped source/evidence. Keep task59 common paper owner and Writer reuse. User handles integration.

## Findings

Task59 closed64159a19ec55;528Calc and changed4owners100,33related/19XML/48current tooling cases and3browsers passed. Current Calc FormatCellsDialog is still absent and upstream requires genuine8page composition;Writer does not have a shared font dialog to reuse. No fake partial dialog is introduced. This required checkpoint runs complete authored application tests before further real UI/native work. Three unrelated stale DOING tasks remain untouched. Existing root tooling filters match ignored historical output copies by substring;this checkpoint explicitly excludes output/**only for tooling discovery and preserves all authored sources.
