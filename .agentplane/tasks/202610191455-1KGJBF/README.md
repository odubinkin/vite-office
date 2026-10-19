---
id: "202610191455-1KGJBF"
title: "Connect Calc bold italic underline UI to native attributes and ODS"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "Whole Calc raw S/B/F/L100,complete changed executable owner coverage100 and related shared/tooling tests;real shared toolbar/menu/keyboard and ODS/undo/group-selection cases at desktop/mobile;types/build/static,changed-path lint/format,docs/size/tree/dependencies/provenance/resources/scoped inventories,doctor/routing/diff. Full all-app regression next task40."
plan_approval:
  state: "approved"
  updated_at: "2026-10-19T14:55:27.544Z"
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
    body: "Start: connect approved native character formatting actions through shared Writer UI,actual Calc attributes and same-model ODS within calc checkout."
events:
  -
    type: "status"
    at: "2026-10-19T14:55:32.917Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect approved native character formatting actions through shared Writer UI,actual Calc attributes and same-model ODS within calc checkout."
doc_version: 3
doc_updated_at: "2026-10-19T14:55:32.917Z"
doc_updated_by: "CODER"
description: "Task36: connect existing shared Writer controls and Calc native commands for bold,italic and underline through actual selection attributes,script groups,history,painting and same-model ODS. Stay in calc checkout;no full constructor or codec work."
sections:
  Summary: "Connect currently available character-formatting UI actions to real Calc attributes and ODS using shared Writer presentation."
  Scope: "Native format slots,toggle/state selection semantics,existing controller and shared toolbar consumers,cell painting,automatic cell styles,history and selected sheets. Canonical registry/readiness records and targeted evidence. Up to120non-task paths. Rich text,named-style inheritance,full script/device painting and all remaining Calc actions stay explicit later work."
  Plan: "Connect Bold10009,Italic10008,Underline10014 to existing shared Writer command controls using source ScFormatShell toggles and real three-script/native underline items. Reuse actual selection pattern runs and ScUndoSelectionAttr,extract common apply path rather than duplicate font-size editing. Preserve source mixed-selection and all-script toggle semantics;plain whole-cell selection only,not rich character editing. Paint actual weight/posture/line items,extend same-model ODS styles via shared text-style mappings where suitable without a shadow format model. Preserve row-height adjustment and Writer primary-save/no-recovery deviations. Register bounded capabilities and source evidence;budget120non-task paths including canonical records/docs. Check whole Calc and complete changed owner raw100%,related tests,real toolbar/menu/keyboard/history/grouped-sheet/ODS at1280/390 with fresh build,and declared static/registry gates. No full all-app run before task40;no network,branch or merge work."
  Verify Steps: "Run npm run test:coverage:calc at raw S/B/F/L100 with no new exclusions and complete changed executable owner coverage100;related shared/tooling tests. Check original toggle values,all-three-script equality/mixed cases,underline preservation,invalid arguments,no-op and failed input,range/full-row/full-column/grouped-sheet/history and actual ODS bytes plus independent XML. Exercise real shared toolbar,Format menu and accelerators at1280/390 after fresh build;assert model-based cell CSS,pressed/mixed states,undo/redo and row geometry. Run root types,build/static,changed-path ESLint/Prettier,JSDoc,size/tree/dependencies/provenance/resources,scoped Calc/shared inventories,doctor/routing/diff;record raw evidence,quality review and clean calc state. Full all-app tests next task40 under user cadence."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task implementation commit and retain previous font-size/row-height controls and data;never reset unrelated tasks or branches."
  Findings: ""
id_source: "generated"
---
## Summary

Connect currently available character-formatting UI actions to real Calc attributes and ODS using shared Writer presentation.

## Scope

Native format slots,toggle/state selection semantics,existing controller and shared toolbar consumers,cell painting,automatic cell styles,history and selected sheets. Canonical registry/readiness records and targeted evidence. Up to120non-task paths. Rich text,named-style inheritance,full script/device painting and all remaining Calc actions stay explicit later work.

## Plan

Connect Bold10009,Italic10008,Underline10014 to existing shared Writer command controls using source ScFormatShell toggles and real three-script/native underline items. Reuse actual selection pattern runs and ScUndoSelectionAttr,extract common apply path rather than duplicate font-size editing. Preserve source mixed-selection and all-script toggle semantics;plain whole-cell selection only,not rich character editing. Paint actual weight/posture/line items,extend same-model ODS styles via shared text-style mappings where suitable without a shadow format model. Preserve row-height adjustment and Writer primary-save/no-recovery deviations. Register bounded capabilities and source evidence;budget120non-task paths including canonical records/docs. Check whole Calc and complete changed owner raw100%,related tests,real toolbar/menu/keyboard/history/grouped-sheet/ODS at1280/390 with fresh build,and declared static/registry gates. No full all-app run before task40;no network,branch or merge work.

## Verify Steps

Run npm run test:coverage:calc at raw S/B/F/L100 with no new exclusions and complete changed executable owner coverage100;related shared/tooling tests. Check original toggle values,all-three-script equality/mixed cases,underline preservation,invalid arguments,no-op and failed input,range/full-row/full-column/grouped-sheet/history and actual ODS bytes plus independent XML. Exercise real shared toolbar,Format menu and accelerators at1280/390 after fresh build;assert model-based cell CSS,pressed/mixed states,undo/redo and row geometry. Run root types,build/static,changed-path ESLint/Prettier,JSDoc,size/tree/dependencies/provenance/resources,scoped Calc/shared inventories,doctor/routing/diff;record raw evidence,quality review and clean calc state. Full all-app tests next task40 under user cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task implementation commit and retain previous font-size/row-height controls and data;never reset unrelated tasks or branches.

## Findings
