---
id: "202610201055-QMVA57"
title: "Implement native Calc cell indentation and manual row layout workflows"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-20T10:57:50.388Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-10-20T11:00:14.104Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-10-20T11:31:26.276Z"
doc_updated_by: "CODER"
description: "Task47 continues the authorized Calc UI goal in calc checkout/branch. Deliver a coherent cell-layout block: original ChangeIndent attribute/document/operation/history chain with native width limits,shared menu/toolbar controls and ODS indentation;manual row height,hide/show and actual hidden/filtered row storage,source geometry copy/history,shared metric dialog and compressed grid/scroll projection. Generalize existing column machinery using original axis contracts. Preserve native quirks and intentional browser save/open/no-recovery policies. Run only related module tests and focused browser/static checks;full all-app checkpoint40 retained,next50. No branch/worktree,merge,network,outside files or fake device/UNO/protection services."
sections:
  Summary: "Task47 delivers a coherent cell-layout editing block: indentation and manual row height/visibility with native mutation/history,shared Writer presentation and actual ODS persistence. Previous goal turn completed task46 and is progress;three unrelated active tasks remain untouched."
  Scope: "Only vite-office-calc checkout on calc. Up to150 non-task paths: actual attribute,column,table,document,ChangeIndentOperation/ScUndoIndent chains;real hidden/filtered row segments and dimension copying;generalized width/height commands,metric dialog and geometry undo;shared Writer menu/toolbar/dialog controls;real row/indent grid projections;ODS native indent/row visibility/manual geometry;related source-backed fixtures,tests,registry and docs. Preserve native defaults,casts,filtered-selection rules and suspicious source behavior. No fake font/device/UNO/protection/drawing/outline/alternate-view services or optimal-layout emulation. Existing primary/autosave/open/no-recovery policies remain. No branches,merges,network,outside files or unrelated task edits."
  Plan: "Port real row hidden/filtered geometry and dimension history;port native indentation through attribute/document/operation/undo owners;generalize existing metric and row/column command adapters;connect shared Writer controls and real grid projection;preserve ODS;verify only related modules and focused browser/static checks,then review,commit and close."
  Verify Steps: "Inspect pinned source defaults/anchors. Related tests must prove native200twip indentation,alignment coercion,actual width limits,UInt16 casts,disjoint/grouped and filtered selection,genuine attribute history and unchanged cell values;row-height typed HMM/Int32 Row requests,metric min/max/default/current restoration,cancel/close;actual hidden/filtered row spans,show-filtered behavior,geometry/flag snapshots,manual flags,history,cursor skipping and compressed pixel inversion without zero division or million-row expansion. Independent ODS and real byte reopens preserve represented indent/manual row geometry/visibility and diagnose unsupported properties. Run focused Vitest suites for touched/shared callers and focused production-browser cases at1280/390 with ODS/Worker and column-control regression. Types,authored lint/format,dependency boundaries,JSDoc,size,Calc/Writer resources,source tree/provenance,invariants/scoped parity,affected tooling,static build,routing,doctor,diff. Retain exact commands/exits,nonempty results,current source/test hashes,native audit and screenshots. Latest user instruction requires only related-module tests between full checkpoints;no complete Calc/global or blanket coverage run is required. Last full all-app checkpoint40,next50. Record verification,implementation commit,quality review and clean direct closure."
  Verification: |-
    Command/result/scope: `npm run test:calc -- cell-indent-row-height.test row-visibility.test ods-indent-rows.test column-width.test mtrindlg.test calc-column-width.test ods-native-alignment.test ods-native-columns.test` passed9files/31cases on final source. Related attribute/selection/height/grid/clear/sheet regressions passed7files/41cases. Shared `xmlbahdl.test` passed1case covering all three signed byte widths. Total nonduplicated related-module evidence:17files/73cases. Exact commands,exit codes,log hashes,current source/test hashes and source anchors are in `evidence/verification.json`.

    Command/result/scope: focused tooling invocation of actual boundary,provenance and Writer resource model tests passed4files/95cases. An auxiliary tooling smoke also passed129cases;these overlapping runs are not added together.

    Command/result/scope: final production build and focused Playwright indentation/row-height plus column-width regression passed6cases at1280/390,including real ODS packages,primary column-geometry reopen and DOM-free Worker execution. Dialog accessibility checks found no violations;app page-error collections were empty. Inspected desktop/mobile screenshots are retained in `evidence/indent-rows-1280.png` and `evidence/indent-rows-390.png`.

    Command/result/scope: types,authored lint/format,dependency boundaries,JSDoc,file-size limits,Calc/Writer resources,source tree/provenance,invariants,Calc/shared parity,static build,routing,doctor and `git diff --check` passed. Existing500kB bundle advisory remains. Native source audit and honest unported service/paint boundaries are in `evidence/native-audit.md`;semantic registry statuses remain unverified rather than claiming complete native parity.

    Full all-app and blanket coverage runs are not required by the latest explicit user instruction or this approved task contract. Last all-app checkpoint40,next50. No branches,merges,network,outside-repository files or unrelated active tasks changed. Implementation commit and quality review are recorded through the direct lifecycle before closure.
  Rollback Plan: "Revert only this task implementation/registration commits through a separately scoped authorized task;never reset unrelated changes or alter the pinned upstream reference."
  Findings: |-
    Native indentation uses200twip steps,visible column width limits,and justification coercion even when indentation is numerically unchanged. ScViewUtil captures source coordinates before filter subtraction can expand its multi-mark rectangle;review caught this distinction and a grouped-sheet regression now proves it. True hidden/filtered row runs remain independent;manual resizing skips filtered visibility,whereas explicit Show Rows clears filtering. Geometry-only documents preserve raw heights,manual flags and original grouped/disjoint spans.

    The common ScMetricInputDlg now has original dialog/current/default/unit/digits/maximum/minimum inputs;the factory adapter explicitly supplies minimum2. Actual shared Writer controls render both row and column dialogs. Shared XMLMeasurePropHdl implements original typed Any assignment,signed saturation and failed-conversion semantics. Native ODS indentation converts signed16 HMM to UInt16 twips,including negative narrowing;the initial missing implicit cast was corrected at that native call boundary. The obsolete regression expecting row sizing to throw was removed because row sizing is now represented.

    Source findings CALC224/CALC225/CALC226 are recorded in `docs/program/calc-upstream-suspected-issues.md`:signed ODF indentation narrowing,fully filtered selection fallback,and differing native string-cache refresh/right-indent behavior. Full string cache/device painting,optimal sizing,protection,merged/outline/drawing/alternate views,global undo enablement and complete UNO/property/recorder services remain explicitly unported. No fake native services were introduced. Browser primary/autosave/open/no-recovery policies remain unchanged.

    Task47 is progress on the continuing UI goal. Current user direction is larger coherent tasks and related-module tests between full checkpoints;checkpoint50 remains the next full all-app run. Three unrelated DOING tasks remain untouched. No scope or verification drift required re-approval.
id_source: "generated"
---
## Summary

Task47 delivers a coherent cell-layout editing block: indentation and manual row height/visibility with native mutation/history,shared Writer presentation and actual ODS persistence. Previous goal turn completed task46 and is progress;three unrelated active tasks remain untouched.

## Scope

Only vite-office-calc checkout on calc. Up to150 non-task paths: actual attribute,column,table,document,ChangeIndentOperation/ScUndoIndent chains;real hidden/filtered row segments and dimension copying;generalized width/height commands,metric dialog and geometry undo;shared Writer menu/toolbar/dialog controls;real row/indent grid projections;ODS native indent/row visibility/manual geometry;related source-backed fixtures,tests,registry and docs. Preserve native defaults,casts,filtered-selection rules and suspicious source behavior. No fake font/device/UNO/protection/drawing/outline/alternate-view services or optimal-layout emulation. Existing primary/autosave/open/no-recovery policies remain. No branches,merges,network,outside files or unrelated task edits.

## Plan

Port real row hidden/filtered geometry and dimension history;port native indentation through attribute/document/operation/undo owners;generalize existing metric and row/column command adapters;connect shared Writer controls and real grid projection;preserve ODS;verify only related modules and focused browser/static checks,then review,commit and close.

## Verify Steps

Inspect pinned source defaults/anchors. Related tests must prove native200twip indentation,alignment coercion,actual width limits,UInt16 casts,disjoint/grouped and filtered selection,genuine attribute history and unchanged cell values;row-height typed HMM/Int32 Row requests,metric min/max/default/current restoration,cancel/close;actual hidden/filtered row spans,show-filtered behavior,geometry/flag snapshots,manual flags,history,cursor skipping and compressed pixel inversion without zero division or million-row expansion. Independent ODS and real byte reopens preserve represented indent/manual row geometry/visibility and diagnose unsupported properties. Run focused Vitest suites for touched/shared callers and focused production-browser cases at1280/390 with ODS/Worker and column-control regression. Types,authored lint/format,dependency boundaries,JSDoc,size,Calc/Writer resources,source tree/provenance,invariants/scoped parity,affected tooling,static build,routing,doctor,diff. Retain exact commands/exits,nonempty results,current source/test hashes,native audit and screenshots. Latest user instruction requires only related-module tests between full checkpoints;no complete Calc/global or blanket coverage run is required. Last full all-app checkpoint40,next50. Record verification,implementation commit,quality review and clean direct closure.

## Verification

Command/result/scope: `npm run test:calc -- cell-indent-row-height.test row-visibility.test ods-indent-rows.test column-width.test mtrindlg.test calc-column-width.test ods-native-alignment.test ods-native-columns.test` passed9files/31cases on final source. Related attribute/selection/height/grid/clear/sheet regressions passed7files/41cases. Shared `xmlbahdl.test` passed1case covering all three signed byte widths. Total nonduplicated related-module evidence:17files/73cases. Exact commands,exit codes,log hashes,current source/test hashes and source anchors are in `evidence/verification.json`.

Command/result/scope: focused tooling invocation of actual boundary,provenance and Writer resource model tests passed4files/95cases. An auxiliary tooling smoke also passed129cases;these overlapping runs are not added together.

Command/result/scope: final production build and focused Playwright indentation/row-height plus column-width regression passed6cases at1280/390,including real ODS packages,primary column-geometry reopen and DOM-free Worker execution. Dialog accessibility checks found no violations;app page-error collections were empty. Inspected desktop/mobile screenshots are retained in `evidence/indent-rows-1280.png` and `evidence/indent-rows-390.png`.

Command/result/scope: types,authored lint/format,dependency boundaries,JSDoc,file-size limits,Calc/Writer resources,source tree/provenance,invariants,Calc/shared parity,static build,routing,doctor and `git diff --check` passed. Existing500kB bundle advisory remains. Native source audit and honest unported service/paint boundaries are in `evidence/native-audit.md`;semantic registry statuses remain unverified rather than claiming complete native parity.

Full all-app and blanket coverage runs are not required by the latest explicit user instruction or this approved task contract. Last all-app checkpoint40,next50. No branches,merges,network,outside-repository files or unrelated active tasks changed. Implementation commit and quality review are recorded through the direct lifecycle before closure.

## Rollback Plan

Revert only this task implementation/registration commits through a separately scoped authorized task;never reset unrelated changes or alter the pinned upstream reference.

## Findings

Native indentation uses200twip steps,visible column width limits,and justification coercion even when indentation is numerically unchanged. ScViewUtil captures source coordinates before filter subtraction can expand its multi-mark rectangle;review caught this distinction and a grouped-sheet regression now proves it. True hidden/filtered row runs remain independent;manual resizing skips filtered visibility,whereas explicit Show Rows clears filtering. Geometry-only documents preserve raw heights,manual flags and original grouped/disjoint spans.

The common ScMetricInputDlg now has original dialog/current/default/unit/digits/maximum/minimum inputs;the factory adapter explicitly supplies minimum2. Actual shared Writer controls render both row and column dialogs. Shared XMLMeasurePropHdl implements original typed Any assignment,signed saturation and failed-conversion semantics. Native ODS indentation converts signed16 HMM to UInt16 twips,including negative narrowing;the initial missing implicit cast was corrected at that native call boundary. The obsolete regression expecting row sizing to throw was removed because row sizing is now represented.

Source findings CALC224/CALC225/CALC226 are recorded in `docs/program/calc-upstream-suspected-issues.md`:signed ODF indentation narrowing,fully filtered selection fallback,and differing native string-cache refresh/right-indent behavior. Full string cache/device painting,optimal sizing,protection,merged/outline/drawing/alternate views,global undo enablement and complete UNO/property/recorder services remain explicitly unported. No fake native services were introduced. Browser primary/autosave/open/no-recovery policies remain unchanged.

Task47 is progress on the continuing UI goal. Current user direction is larger coherent tasks and related-module tests between full checkpoints;checkpoint50 remains the next full all-app run. Three unrelated DOING tasks remain untouched. No scope or verification drift required re-approval.
