---
id: "202610192106-5G2DBD"
title: "Connect Calc alignment controls to native items and ODS properties"
status: "DOING"
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
  updated_at: "2026-10-19T21:06:45.145Z"
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
    body: "Start: implement the authorized native alignment toolbar/menu and ODS slice,using shared Writer controls,original item/history ownership and scoped raw100 checks;calc checkout only."
events:
  -
    type: "status"
    at: "2026-10-19T21:06:50.979Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the authorized native alignment toolbar/menu and ODS slice,using shared Writer controls,original item/history ownership and scoped raw100 checks;calc checkout only."
doc_version: 3
doc_updated_at: "2026-10-19T21:06:50.979Z"
doc_updated_by: "CODER"
description: "Task39 of the authorized Calc UI goal:actual shared Writer command buttons and Format menu use original horizontal/vertical alignment slots,toggle versus explicit semantics,native selection/history and ODS property handlers. Work only vite-office-calc on calc. Full Calc and changed executable owner raw100,related tests,fresh1280/390browser evidence;next all-app task40."
sections:
  Summary: "Task39 continues the active Calc UI goal with horizontal/vertical native cell alignment. Previous turn made verified progress:task38 completed with implementation c83f70943eb3,Calc363cases and related11891cases raw100 plus21browser cases;checkout clean on calc."
  Scope: "Only /Users/odubinkin/Projects/vite-office-calc on calc. Up to80non-task paths:existing Calc formatsh/controller/SDI/grid and formatting resource tests;native cell-alignment XML handlers/maps/contexts/export plus consumed shared token/base handler contracts if required;focused unit/native/ODS/browser tests;affected Calc/shared runtime/provenance/capability records,boundary rules and suspected-upstream-issue documentation. Actual shared Writer toolbar/menu composition remains reused. No network,other checkout,merge,branch,recovery/save-policy change or unrelated dependency programme. Native full rich/wrapped/bidirectional layout,configuration and named-style services stay unported and unverified."
  Plan: "Implement original toolbar alignment toggles and explicit Format-menu operations using actual horizontal129/vertical132 native items;preserve mixed/default state,selection/history and failed-input behavior. Bind existing shared Writer command components;paint supported plain cells using actual native values. Port consumed original Calc ODS horizontal/source/repeat and vertical property handlers with exact Any types,merge/default behavior and explicit unsupported diagnostics;test independently authored XML and real bytes/reopens. Run Calc and full changed executable owner raw S/B/F/L100,related tests,fresh1280/390browser and all declared static/source/resource/scoped inventory gates;record quality and clean local closure. Full all-app next task40."
  Verify Steps: "Run npm run test:coverage:calc with nonempty raw S/B/F/L100,without coverage exclusions/threshold changes. Verify all changed executable application owners100 with current source hashes and related tests. Exercise actual toolbar toggle versus explicit menu selection,native enum/default/mixed states,unrelated item preservation,sparse/grouped/full-axis selection,history,failed input and disabled/unimplemented requests. Verify real ODS bytes,repeated reopen,independent horizontal/source/repeat/vertical XML,all consumed handler branches and merge/default/type semantics. Compare source functions/defaults to pinned local upstream9bc445578031fecf56086729d8e4940c77e14d65. Fresh build and1280/390browser verify actual buttons/menu,CSS geometry,history and no exceptions;page/Worker ODS keeps native attributes. Root/app types,changed-path ESLint/Prettier,JSDoc,size/tree,dependencies,boundary tests,provenance,resources,affected Calc/shared/Writer scoped inventories,static smoke,routing,doctor,diff;retained raw evidence and quality review;clean calc tree. Full all-app regression next task40 per user cadence."
  Verification: "Pending implementation and concrete source-matched evidence. No acceptance claim."
  Rollback Plan: "Revert only intentional task39 implementation commits if necessary;preserve task evidence and unrelated active tasks. No merge/reset or save/recovery-policy changes."
  Findings: "Preflight:direct workflow;branch calc;clean tree. No nested source AGENTS or .agentplane/user-instructions.md found. Network approval required and unused. Existing native SvxHorJustifyItem/SvxVerJustifyItem and contiguous pool defaults129/132 are available. Native toolbar ExecuteTextAttr toggles matching alignment to Standard;Format-menu ExecuteAlignment applies explicit values. Actual source XML mapping merges paragraph fo:text-align and cell style:text-align-source/style:repeat-content into one horizontal UNO property;vertical is a typed32cell property. Existing browser grid paints only scalar-derived left/right;new UI must consume actual native attributes. Full RTL/rich/wrapped/device rendering is not assumed."
id_source: "generated"
---
## Summary

Task39 continues the active Calc UI goal with horizontal/vertical native cell alignment. Previous turn made verified progress:task38 completed with implementation c83f70943eb3,Calc363cases and related11891cases raw100 plus21browser cases;checkout clean on calc.

## Scope

Only /Users/odubinkin/Projects/vite-office-calc on calc. Up to80non-task paths:existing Calc formatsh/controller/SDI/grid and formatting resource tests;native cell-alignment XML handlers/maps/contexts/export plus consumed shared token/base handler contracts if required;focused unit/native/ODS/browser tests;affected Calc/shared runtime/provenance/capability records,boundary rules and suspected-upstream-issue documentation. Actual shared Writer toolbar/menu composition remains reused. No network,other checkout,merge,branch,recovery/save-policy change or unrelated dependency programme. Native full rich/wrapped/bidirectional layout,configuration and named-style services stay unported and unverified.

## Plan

Implement original toolbar alignment toggles and explicit Format-menu operations using actual horizontal129/vertical132 native items;preserve mixed/default state,selection/history and failed-input behavior. Bind existing shared Writer command components;paint supported plain cells using actual native values. Port consumed original Calc ODS horizontal/source/repeat and vertical property handlers with exact Any types,merge/default behavior and explicit unsupported diagnostics;test independently authored XML and real bytes/reopens. Run Calc and full changed executable owner raw S/B/F/L100,related tests,fresh1280/390browser and all declared static/source/resource/scoped inventory gates;record quality and clean local closure. Full all-app next task40.

## Verify Steps

Run npm run test:coverage:calc with nonempty raw S/B/F/L100,without coverage exclusions/threshold changes. Verify all changed executable application owners100 with current source hashes and related tests. Exercise actual toolbar toggle versus explicit menu selection,native enum/default/mixed states,unrelated item preservation,sparse/grouped/full-axis selection,history,failed input and disabled/unimplemented requests. Verify real ODS bytes,repeated reopen,independent horizontal/source/repeat/vertical XML,all consumed handler branches and merge/default/type semantics. Compare source functions/defaults to pinned local upstream9bc445578031fecf56086729d8e4940c77e14d65. Fresh build and1280/390browser verify actual buttons/menu,CSS geometry,history and no exceptions;page/Worker ODS keeps native attributes. Root/app types,changed-path ESLint/Prettier,JSDoc,size/tree,dependencies,boundary tests,provenance,resources,affected Calc/shared/Writer scoped inventories,static smoke,routing,doctor,diff;retained raw evidence and quality review;clean calc tree. Full all-app regression next task40 per user cadence.

## Verification

Pending implementation and concrete source-matched evidence. No acceptance claim.

## Rollback Plan

Revert only intentional task39 implementation commits if necessary;preserve task evidence and unrelated active tasks. No merge/reset or save/recovery-policy changes.

## Findings

Preflight:direct workflow;branch calc;clean tree. No nested source AGENTS or .agentplane/user-instructions.md found. Network approval required and unused. Existing native SvxHorJustifyItem/SvxVerJustifyItem and contiguous pool defaults129/132 are available. Native toolbar ExecuteTextAttr toggles matching alignment to Standard;Format-menu ExecuteAlignment applies explicit values. Actual source XML mapping merges paragraph fo:text-align and cell style:text-align-source/style:repeat-content into one horizontal UNO property;vertical is a typed32cell property. Existing browser grid paints only scalar-derived left/right;new UI must consume actual native attributes. Full RTL/rich/wrapped/device rendering is not assumed.
