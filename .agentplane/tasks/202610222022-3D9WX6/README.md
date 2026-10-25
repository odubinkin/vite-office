---
id: "202610222022-3D9WX6"
title: "Connect native AutoSum and formula-bar input actions"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 21
origin:
  system: "manual"
depends_on:
  - "202610222108-KVGGCR"
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-25T04:22:01.457Z"
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
    body: "Start: implement the approved native AutoSum and formula-bar input block in the current calc checkout."
  -
    author: "CODER"
    body: "Start: Continue already-active74 jointly with76 under human-approved final-stop plan;native clipboard implementation complete,final common verification pending. Pinned17-file reference restoration expressly approved."
events:
  -
    type: "status"
    at: "2026-10-22T20:23:13.842Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved native AutoSum and formula-bar input block in the current calc checkout."
  -
    type: "status"
    at: "2026-10-25T04:22:16.896Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: Continue already-active74 jointly with76 under human-approved final-stop plan;native clipboard implementation complete,final common verification pending. Pinned17-file reference restoration expressly approved."
doc_version: 3
doc_updated_at: "2026-10-25T04:36:41.612Z"
doc_updated_by: "CODER"
description: "Block74 after73: implement original ordinary AutoSum classification/search/range construction and selected-block insertion through native token/view/input owners. Enable real Sum and correct StartFormula/SetFuncString source text selection in the shared-style Calc formula bar. Preserve native detection priorities,20-cell seek bound,sum-of-sums,empty-selection behavior,history and ODS persistence. No browser evaluator or ad-hoc range inference. Existing unported filtered/subtotal/group/3D services stay explicit and do not receive fabricated state. Scope up to80 source/test/registry/probe paths in Calc and any genuinely shared consumed owners. Require complete Calc raw100 and changed shared raw100,related tests,actual UI/browser/Worker checks and static/build/source/registry gates. Full all-app checkpoint80."
sections:
  Summary: "Connect native AutoSum and formula-bar text/selection actions to the existing live Calc document and shared Writer-style controls."
  Scope: |-
    Block74:ordinary native AutoSum token classification,20-cell directional seek,sum-of-sums,range construction,selected-block insertion,StartFormula/SetFuncString and browser focus/caret routing. The human removed the numerical path cap on2026-10-25 solely to finish existing76/74;no branch/worktree changes,external writes or network. Native unported filtered/subtotal/group/3D services stay explicit;do not fabricate service state.

    Human confirmation2026-10-25 authorizes one exception to the earlier network/reference-restoration prohibition solely for final verification of existing tasks76/74:download the pinned liblangtag0.6.8 archive from https://dev-www.libreoffice.org/src/liblangtag-0.6.8.tar.bz2,verify SHA256 a96975b79ddd8fef6d9295c083fe3f1afa1a8898a57235d4069255ade44e5cf2,and restore only the17 absent regular files enumerated in output/playwright/task74-reference-audit.json. Keep the archive and audit in ignored output;do not execute downloaded code or restore any other references. All functional,branch,verification and final-pause constraints remain unchanged.
  Plan: |-
    Human approval2026-10-25 removes the numerical path cap only for completion of existing76/74;no new feature families or unrelated tasks. Read complete original consumed token/view/input methods;port real range inference and formula construction first,then native default block insertion/history and input selection,then expose Sum/Formula actions in existing shared-style presenters. Verify source boundary/priority vectors,actual document/history/ODS,mounted caret/focus behavior,Calc and changed shared raw100 and static/build/browser/registry gates. Human stop rule supersedes the former80 checkpoint:finish existing76 and74,then full all-application suites,fix failures/add missing scenarios,required100percent coverage,final task closure and pause the goal. Do not start78-80 or wait for ten tasks.

    Human confirmation2026-10-25 authorizes one exception to the earlier network/reference-restoration prohibition solely for final verification of existing tasks76/74:download the pinned liblangtag0.6.8 archive from https://dev-www.libreoffice.org/src/liblangtag-0.6.8.tar.bz2,verify SHA256 a96975b79ddd8fef6d9295c083fe3f1afa1a8898a57235d4069255ade44e5cf2,and restore only the17 absent regular files enumerated in output/playwright/task74-reference-audit.json. Keep the archive and audit in ignored output;do not execute downloaded code or restore any other references. All functional,branch,verification and final-pause constraints remain unchanged.
  Verify Steps: "Native vectors must cover directional priority,20-cell seek cutoff,adjacent outer-function references,sum-of-sums,empty/text/error cells,selected single/multi blocks and sheet/coordinate boundaries. Actual UI Sum and Formula actions must preserve source draft/selection/focus,commit/cancel,live recalculation,Undo/Redo and ODS save/reopen. Run complete Calc raw100 S/B/F/L with unchanged thresholds,changed shared owner raw100 and related consumers,actual browser/Worker,production build and all type/lint/format/boundary/JSDoc/size/source/provenance/registry/resource/static/routing/doctor gates. Human stop rule:finish existing76 and74,then full all-application suites/fixes/add missing scenarios/required100percent coverage/final closure/goal pause;do not wait for80 or ten tasks."
  Verification: "In progress;not verified.655 Calc scenarios/185files passed in a diagnostic,but raw coverage remains below the unchanged100 gate. Current19 focused native/UI scenarios,type/lint pass;actual Chromium Sum yields10 for4and6. Source-pinned progress evidence is under evidence/progress. Native clipboard/grouped-copy prerequisites and complete final acceptance remain required before closure."
  Rollback Plan: "Revert task-owned implementation commits only,preserving integrated user changes and completed prior work."
  Findings: |-
    Block74 remains DOING and unverified. Native ordinary AutoSum inference,20-position seek,sum-of-sums,relative range construction,nonempty selected-block totals and StartFormula text selection are implemented. Actual view/token/column/history owners are used;there is no browser evaluator or cell-copy substitute. Native SetFormulaOperation is connected for generated block formulas in the current normal enabled-recording profile. Browser availability rejects filtered SUBTOTAL and empty-marked clipboard-fill contexts while their native services are unavailable.

    Command:npm run test:coverage:calc -- --maxWorkers=1 --coverage.reportsDirectory=../../output/playwright/task74-calc-in-progress-coverage --reporter=default --reporter=json --outputFile.json=../../output/playwright/task74-calc-in-progress-results.json.
    Result:655 scenarios/185files pass;coverage gate fails as expected for incomplete acceptance work.
    Evidence:99.47 statements,99.13 branches,99.95 functions,99.56 lines. This diagnostic precedes source-only removal of unused initializers and strengthened pattern-reset assertions;it is not presented as final-head coverage. No thresholds/exclusions/skips changed.
    Scope:complete Calc-only diagnostic;final raw100 is still required.

    Command:npx vitest run --config vitest.calc.config.ts src/sc/source/ui/view/native-autosum.test.ts src/sc/browser/presentation/calc-workbench.test.tsx src/sc/browser/controller/calc-input-modification.test.ts.
    Result:current19 scenarios pass after real-owner setup and pattern-reset corrections.
    Evidence:actual native column/row totals,manual-calculation formula adoption,NeedHeight flags,directional/outer-reference vectors and mounted Sum/Formula selection/history. Tests use the ScTabViewShell-owned view rather than passing an incorrect second constructor argument. Whole-pattern reset uses native CellAttributeHolder/SetPattern instead of a no-op empty delta;each NeedHeight case is independently checked after clearing.
    Scope:current changed native/UI feature mechanisms. Typecheck,scoped lint,JSDoc,size,provenance and registry checks pass;production build/final browser/Worker/ODS/evidence/quality closure remain pending.

    Command:playwright-cli -s=calc71 actual input4,6,Sum,Accept;viewport screenshot inspection.
    Result:pass.
    Evidence:the actual browser proposes=SUM(A1:A2),then shows10 inA3. Shared Writer control styling is retained. Raw snapshots and screenshot are in task evidence/progress.
    Scope:reviewable current ordinary AutoSum UI,not full AutoSum/clipboard parity.

    Native dependency discovery:empty marked blocks route through EnterAutoSum -> EnterBlock -> PasteFromClip,not repeated EnterData calls. This requires real clipboard document/pool lifetime,relative-reference copying,shared formula groups,listening and native paste undo. Implementing a flat per-cell fill would change upstream architecture and contracts. These services remain explicit boundaries rather than fake implementations. Complete those kernel prerequisites before claiming block74 done;retain the original scope and full raw100 verification contract. CALC253 documents retained axis-only outer-reference adjacency.

    Final acceptance progress2026-10-25:human confirmation authorized restoring only17 missing liblangtag0.6.8 reference files. Pinned HTTPS archive SHA256 a96975b79ddd8fef6d9295c083fe3f1afa1a8898a57235d4069255ade44e5cf2 verified;only216050bytes of actual regular files restored inside this checkout through the existing reference symlink;no downloaded code executed. Full source provenance passes1237runtime modules. Direct canonical-record audit additionally identifies README,liblangtag/lt-tag.h and tests/check-lang.c;these three remain absent pending the separate explicit permission question. Global parity gate remains unwaived. Native registry declaration audit identifies15 headers/wrappers listing explicit re-exports as local declarations. Corrected only the local declaration lists and explained source-owner evidence;all original upstream symbols,statuses,responsibilities and semantic checker rules remain. Entire1237-module semantic audit passes;actual registry/mapping9case recheck passes. Whole inventory38files124cases retains timing failures but raw43-owner coverage is100 S1734/B1290/F437/L1670;both timing paths have passing unchanged-timeout rechecks via mapping9cases and ODT7cases. All-app main coverage suite is still running;no task completion or final acceptance is claimed.
id_source: "generated"
---
## Summary

Connect native AutoSum and formula-bar text/selection actions to the existing live Calc document and shared Writer-style controls.

## Scope

Block74:ordinary native AutoSum token classification,20-cell directional seek,sum-of-sums,range construction,selected-block insertion,StartFormula/SetFuncString and browser focus/caret routing. The human removed the numerical path cap on2026-10-25 solely to finish existing76/74;no branch/worktree changes,external writes or network. Native unported filtered/subtotal/group/3D services stay explicit;do not fabricate service state.

Human confirmation2026-10-25 authorizes one exception to the earlier network/reference-restoration prohibition solely for final verification of existing tasks76/74:download the pinned liblangtag0.6.8 archive from https://dev-www.libreoffice.org/src/liblangtag-0.6.8.tar.bz2,verify SHA256 a96975b79ddd8fef6d9295c083fe3f1afa1a8898a57235d4069255ade44e5cf2,and restore only the17 absent regular files enumerated in output/playwright/task74-reference-audit.json. Keep the archive and audit in ignored output;do not execute downloaded code or restore any other references. All functional,branch,verification and final-pause constraints remain unchanged.

## Plan

Human approval2026-10-25 removes the numerical path cap only for completion of existing76/74;no new feature families or unrelated tasks. Read complete original consumed token/view/input methods;port real range inference and formula construction first,then native default block insertion/history and input selection,then expose Sum/Formula actions in existing shared-style presenters. Verify source boundary/priority vectors,actual document/history/ODS,mounted caret/focus behavior,Calc and changed shared raw100 and static/build/browser/registry gates. Human stop rule supersedes the former80 checkpoint:finish existing76 and74,then full all-application suites,fix failures/add missing scenarios,required100percent coverage,final task closure and pause the goal. Do not start78-80 or wait for ten tasks.

Human confirmation2026-10-25 authorizes one exception to the earlier network/reference-restoration prohibition solely for final verification of existing tasks76/74:download the pinned liblangtag0.6.8 archive from https://dev-www.libreoffice.org/src/liblangtag-0.6.8.tar.bz2,verify SHA256 a96975b79ddd8fef6d9295c083fe3f1afa1a8898a57235d4069255ade44e5cf2,and restore only the17 absent regular files enumerated in output/playwright/task74-reference-audit.json. Keep the archive and audit in ignored output;do not execute downloaded code or restore any other references. All functional,branch,verification and final-pause constraints remain unchanged.

## Verify Steps

Native vectors must cover directional priority,20-cell seek cutoff,adjacent outer-function references,sum-of-sums,empty/text/error cells,selected single/multi blocks and sheet/coordinate boundaries. Actual UI Sum and Formula actions must preserve source draft/selection/focus,commit/cancel,live recalculation,Undo/Redo and ODS save/reopen. Run complete Calc raw100 S/B/F/L with unchanged thresholds,changed shared owner raw100 and related consumers,actual browser/Worker,production build and all type/lint/format/boundary/JSDoc/size/source/provenance/registry/resource/static/routing/doctor gates. Human stop rule:finish existing76 and74,then full all-application suites/fixes/add missing scenarios/required100percent coverage/final closure/goal pause;do not wait for80 or ten tasks.

## Verification

In progress;not verified.655 Calc scenarios/185files passed in a diagnostic,but raw coverage remains below the unchanged100 gate. Current19 focused native/UI scenarios,type/lint pass;actual Chromium Sum yields10 for4and6. Source-pinned progress evidence is under evidence/progress. Native clipboard/grouped-copy prerequisites and complete final acceptance remain required before closure.

## Rollback Plan

Revert task-owned implementation commits only,preserving integrated user changes and completed prior work.

## Findings

Block74 remains DOING and unverified. Native ordinary AutoSum inference,20-position seek,sum-of-sums,relative range construction,nonempty selected-block totals and StartFormula text selection are implemented. Actual view/token/column/history owners are used;there is no browser evaluator or cell-copy substitute. Native SetFormulaOperation is connected for generated block formulas in the current normal enabled-recording profile. Browser availability rejects filtered SUBTOTAL and empty-marked clipboard-fill contexts while their native services are unavailable.

Command:npm run test:coverage:calc -- --maxWorkers=1 --coverage.reportsDirectory=../../output/playwright/task74-calc-in-progress-coverage --reporter=default --reporter=json --outputFile.json=../../output/playwright/task74-calc-in-progress-results.json.
Result:655 scenarios/185files pass;coverage gate fails as expected for incomplete acceptance work.
Evidence:99.47 statements,99.13 branches,99.95 functions,99.56 lines. This diagnostic precedes source-only removal of unused initializers and strengthened pattern-reset assertions;it is not presented as final-head coverage. No thresholds/exclusions/skips changed.
Scope:complete Calc-only diagnostic;final raw100 is still required.

Command:npx vitest run --config vitest.calc.config.ts src/sc/source/ui/view/native-autosum.test.ts src/sc/browser/presentation/calc-workbench.test.tsx src/sc/browser/controller/calc-input-modification.test.ts.
Result:current19 scenarios pass after real-owner setup and pattern-reset corrections.
Evidence:actual native column/row totals,manual-calculation formula adoption,NeedHeight flags,directional/outer-reference vectors and mounted Sum/Formula selection/history. Tests use the ScTabViewShell-owned view rather than passing an incorrect second constructor argument. Whole-pattern reset uses native CellAttributeHolder/SetPattern instead of a no-op empty delta;each NeedHeight case is independently checked after clearing.
Scope:current changed native/UI feature mechanisms. Typecheck,scoped lint,JSDoc,size,provenance and registry checks pass;production build/final browser/Worker/ODS/evidence/quality closure remain pending.

Command:playwright-cli -s=calc71 actual input4,6,Sum,Accept;viewport screenshot inspection.
Result:pass.
Evidence:the actual browser proposes=SUM(A1:A2),then shows10 inA3. Shared Writer control styling is retained. Raw snapshots and screenshot are in task evidence/progress.
Scope:reviewable current ordinary AutoSum UI,not full AutoSum/clipboard parity.

Native dependency discovery:empty marked blocks route through EnterAutoSum -> EnterBlock -> PasteFromClip,not repeated EnterData calls. This requires real clipboard document/pool lifetime,relative-reference copying,shared formula groups,listening and native paste undo. Implementing a flat per-cell fill would change upstream architecture and contracts. These services remain explicit boundaries rather than fake implementations. Complete those kernel prerequisites before claiming block74 done;retain the original scope and full raw100 verification contract. CALC253 documents retained axis-only outer-reference adjacency.

Final acceptance progress2026-10-25:human confirmation authorized restoring only17 missing liblangtag0.6.8 reference files. Pinned HTTPS archive SHA256 a96975b79ddd8fef6d9295c083fe3f1afa1a8898a57235d4069255ade44e5cf2 verified;only216050bytes of actual regular files restored inside this checkout through the existing reference symlink;no downloaded code executed. Full source provenance passes1237runtime modules. Direct canonical-record audit additionally identifies README,liblangtag/lt-tag.h and tests/check-lang.c;these three remain absent pending the separate explicit permission question. Global parity gate remains unwaived. Native registry declaration audit identifies15 headers/wrappers listing explicit re-exports as local declarations. Corrected only the local declaration lists and explained source-owner evidence;all original upstream symbols,statuses,responsibilities and semantic checker rules remain. Entire1237-module semantic audit passes;actual registry/mapping9case recheck passes. Whole inventory38files124cases retains timing failures but raw43-owner coverage is100 S1734/B1290/F437/L1670;both timing paths have passing unchanged-timeout rechecks via mapping9cases and ODT7cases. All-app main coverage suite is still running;no task completion or final acceptance is claimed.
