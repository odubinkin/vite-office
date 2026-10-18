---
id: "202610182120-YSQ8VM"
title: "Restore native Calc standard toolbar composition using shared Writer controls and icons"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "All Calc coverage remains raw100percent in all four metrics; related framework and Writer toolbar tests pass; source/resource checks,typecheck/build,touched style,architecture/provenance/docs/size,scoped inventories,doctor/routing pass; built browser checks full toolbar order/icons/disabled state and accessibility at desktop/mobile. Full regression next task20."
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T21:21:08.876Z"
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
    body: "Start: implement approved native Calc standard toolbar composition through shared Writer controls and icons; preserve actual Sfx availability and save policy."
events:
  -
    type: "status"
    at: "2026-10-18T21:21:12.879Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native Calc standard toolbar composition through shared Writer controls and icons; preserve actual Sfx availability and save policy."
doc_version: 3
doc_updated_at: "2026-10-18T21:21:12.879Z"
doc_updated_by: "CODER"
description: "Approved Calc UI goal task17: retain all pinned visible standardbar entries after explicit browser save-policy deviations; remove presentation-owned slot filtering; share actual Writer icon choices; unavailable source commands remain disabled through Sfx state. Preserve Writer rendering and source command identities. Work only in calc checkout/branch. No network, merges or fake kernel handlers."
sections:
  Summary: |-
    Restore native Calc standard toolbar composition using shared Writer controls and icons

    Approved Calc UI goal task17: retain all pinned visible standardbar entries after explicit browser save-policy deviations; remove presentation-owned slot filtering; share actual Writer icon choices; unavailable source commands remain disabled through Sfx state. Preserve Writer rendering and source command identities. Work only in calc checkout/branch. No network, merges or fake kernel handlers.
  Scope: |-
    - In scope: Approved Calc UI goal task17: retain all pinned visible standardbar entries after explicit browser save-policy deviations; remove presentation-owned slot filtering; share actual Writer icon choices; unavailable source commands remain disabled through Sfx state. Preserve Writer rendering and source command identities. Work only in calc checkout/branch. No network, merges or fake kernel handlers.
    - Out of scope: unrelated refactors not required for "Restore native Calc standard toolbar composition using shared Writer controls and icons".
  Plan: "1.CODER projects the complete pinned visible standardbar after existing save-policy dispositions,without supported-slot filtering. 2.CODER shares Writer standard toolbar icons through framework and supplies Calc-specific icon additions without copying renderer or introducing handlers. Shared controls preserve unavailable entries disabled from actual Sfx bindings. 3.CODER adds source composition,bindings/dispatch,Writer regression and real-browser viewport/axe checks; runs all Calc raw100percent coverage plus related checks. Scope up to24 non-task files including four runtime owners,new shared icon module,tests and corresponding registry evidence. Goal approval already explicit; no external writes/network. UI task17; full regression at20."
  Verify Steps: "Run npm run test:coverage:calc with raw100percent statements,branches,functions,lines. Verify native visible standardbar order/visibility and every icon,unavailable entries disabled,real Open/Undo/Redo dispatch; no fake slots. Run related CommandToolbar and WriterCommandToolbar tests,source contracts and generated Calc/Writer resource freshness. Run app/tools typecheck/build,touched Prettier/eslint,dependency/docs/file-size/source-tree/provenance checks,Calc/shared/Writer scoped inventories,doctor/routing. Built browser tests desktop1280x800/mobile390x600 assert exact native toolbar order,SVG icons,disabled unsupported commands,actual edit Undo/Redo,toolbar overflow and unfiltered axe with no page errors. Full regression next task20."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task-scoped implementation commit and registry adaptations; preserve user changes and prior Calc sheet popup. Do not merge or reset branches."
  Findings: ""
id_source: "generated"
---
## Summary

Restore native Calc standard toolbar composition using shared Writer controls and icons

Approved Calc UI goal task17: retain all pinned visible standardbar entries after explicit browser save-policy deviations; remove presentation-owned slot filtering; share actual Writer icon choices; unavailable source commands remain disabled through Sfx state. Preserve Writer rendering and source command identities. Work only in calc checkout/branch. No network, merges or fake kernel handlers.

## Scope

- In scope: Approved Calc UI goal task17: retain all pinned visible standardbar entries after explicit browser save-policy deviations; remove presentation-owned slot filtering; share actual Writer icon choices; unavailable source commands remain disabled through Sfx state. Preserve Writer rendering and source command identities. Work only in calc checkout/branch. No network, merges or fake kernel handlers.
- Out of scope: unrelated refactors not required for "Restore native Calc standard toolbar composition using shared Writer controls and icons".

## Plan

1.CODER projects the complete pinned visible standardbar after existing save-policy dispositions,without supported-slot filtering. 2.CODER shares Writer standard toolbar icons through framework and supplies Calc-specific icon additions without copying renderer or introducing handlers. Shared controls preserve unavailable entries disabled from actual Sfx bindings. 3.CODER adds source composition,bindings/dispatch,Writer regression and real-browser viewport/axe checks; runs all Calc raw100percent coverage plus related checks. Scope up to24 non-task files including four runtime owners,new shared icon module,tests and corresponding registry evidence. Goal approval already explicit; no external writes/network. UI task17; full regression at20.

## Verify Steps

Run npm run test:coverage:calc with raw100percent statements,branches,functions,lines. Verify native visible standardbar order/visibility and every icon,unavailable entries disabled,real Open/Undo/Redo dispatch; no fake slots. Run related CommandToolbar and WriterCommandToolbar tests,source contracts and generated Calc/Writer resource freshness. Run app/tools typecheck/build,touched Prettier/eslint,dependency/docs/file-size/source-tree/provenance checks,Calc/shared/Writer scoped inventories,doctor/routing. Built browser tests desktop1280x800/mobile390x600 assert exact native toolbar order,SVG icons,disabled unsupported commands,actual edit Undo/Redo,toolbar overflow and unfiltered axe with no page errors. Full regression next task20.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task-scoped implementation commit and registry adaptations; preserve user changes and prior Calc sheet popup. Do not merge or reset branches.

## Findings
