---
id: "202610182145-APQYXE"
title: "Bind configured browser default fonts to source VCL metadata for Calc pool construction"
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
  - "Whole Calc raw100percent S/B/F/L;new shared metadata module100percent four metrics and related existing default-font device/config/native Font tests pass. Independent pinned GetDefaultFont source role/default contract test passes. Types/build,resource freshness,touched style,boundary/docs/size/tree/provenance,scopedCalc/shared inventories,doctor/routing pass. Task19 targeted;full regression at20."
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T21:45:53.915Z"
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
    body: "Start: implement approved shared configured-font metadata bridge from actual registered browser families and source VCL role/default semantics;no physical-device facade."
events:
  -
    type: "status"
    at: "2026-10-18T21:46:01.553Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved shared configured-font metadata bridge from actual registered browser families and source VCL role/default semantics;no physical-device facade."
doc_version: 3
doc_updated_at: "2026-10-18T21:46:01.553Z"
doc_updated_by: "CODER"
description: "Approved Calc UI goal task19: bridge existing registered/loaded default-font family selection to actual shared VCL Font values with pinned native role-family,pitch,charset,style and height semantics consumed by ScDocumentPool. Reuse existing generic browser device and core Font;no fake OutputDevice or guessed installed-family fallback. No pool construction before remaining native dependencies exist. Work only calc checkout/branch;no network."
sections:
  Summary: |-
    Bind configured browser default fonts to source VCL metadata for Calc pool construction

    Approved Calc UI goal task19: bridge existing registered/loaded default-font family selection to actual shared VCL Font values with pinned native role-family,pitch,charset,style and height semantics consumed by ScDocumentPool. Reuse existing generic browser device and core Font;no fake OutputDevice or guessed installed-family fallback. No pool construction before remaining native dependencies exist. Work only calc checkout/branch;no network.
  Scope: |-
    - In scope: Approved Calc UI goal task19: bridge existing registered/loaded default-font family selection to actual shared VCL Font values with pinned native role-family,pitch,charset,style and height semantics consumed by ScDocumentPool. Reuse existing generic browser device and core Font;no fake OutputDevice or guessed installed-family fallback. No pool construction before remaining native dependencies exist. Work only calc checkout/branch;no network.
    - Out of scope: unrelated refactors not required for "Bind configured browser default fonts to source VCL metadata for Calc pool construction".
  Plan: "1.CODER adds a shared browser metadata bridge over existing real default-font device and VCL Font values. Pin the represented GetDefaultFont configured/matched branch:role-family,pitch,style,explicit platform encoding,symbol encoding and12height;unknown physical fallback stays absent. Preserve existing Writer device API. 2.CODER tests all native roles and real existing browser face selection,absence/preparation,COW isolation plus pinned source switches. Run whole Calc raw100percent and targeted affected shared module raw100percent plus related existing tests. 3.CODER runs declared gates,records exact consumed metadata and unported native services,quality and closes task. Up to14non-task files including shared bridge/tests/registry,source tests and font/Calc docs. Existing explicit user approval covers this local dependency work. No fake OutputDevice,enabled formatting or font guessing. UI task19;full regression20."
  Verify Steps: "npm run test:coverage:calc raw100percent S/B/F/L. Targeted coverage for new shared default-font-metadata module must be raw100percent S/B/F/L;all native role mappings,real registered face selection/preparation/absence,explicit charset,symbol rule,empty style,12height and independent Font handles covered. Existing default-font-device/config/Font tests pass;source contract tests independently read pinned native role switch and ScDocumentPool consumed metadata fields. Types/build,Calc and Writer resource freshness,touched style,boundaries/docs/size/tree/provenance,scopedCalc/shared inventories,doctor/routing pass. Full suite next task20."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this metadata bridge and scoped tests/registry/docs. Preserve current default-font device API,Writer behavior,Calc UI and user changes;no merge or branch reset."
  Findings: ""
id_source: "generated"
---
## Summary

Bind configured browser default fonts to source VCL metadata for Calc pool construction

Approved Calc UI goal task19: bridge existing registered/loaded default-font family selection to actual shared VCL Font values with pinned native role-family,pitch,charset,style and height semantics consumed by ScDocumentPool. Reuse existing generic browser device and core Font;no fake OutputDevice or guessed installed-family fallback. No pool construction before remaining native dependencies exist. Work only calc checkout/branch;no network.

## Scope

- In scope: Approved Calc UI goal task19: bridge existing registered/loaded default-font family selection to actual shared VCL Font values with pinned native role-family,pitch,charset,style and height semantics consumed by ScDocumentPool. Reuse existing generic browser device and core Font;no fake OutputDevice or guessed installed-family fallback. No pool construction before remaining native dependencies exist. Work only calc checkout/branch;no network.
- Out of scope: unrelated refactors not required for "Bind configured browser default fonts to source VCL metadata for Calc pool construction".

## Plan

1.CODER adds a shared browser metadata bridge over existing real default-font device and VCL Font values. Pin the represented GetDefaultFont configured/matched branch:role-family,pitch,style,explicit platform encoding,symbol encoding and12height;unknown physical fallback stays absent. Preserve existing Writer device API. 2.CODER tests all native roles and real existing browser face selection,absence/preparation,COW isolation plus pinned source switches. Run whole Calc raw100percent and targeted affected shared module raw100percent plus related existing tests. 3.CODER runs declared gates,records exact consumed metadata and unported native services,quality and closes task. Up to14non-task files including shared bridge/tests/registry,source tests and font/Calc docs. Existing explicit user approval covers this local dependency work. No fake OutputDevice,enabled formatting or font guessing. UI task19;full regression20.

## Verify Steps

npm run test:coverage:calc raw100percent S/B/F/L. Targeted coverage for new shared default-font-metadata module must be raw100percent S/B/F/L;all native role mappings,real registered face selection/preparation/absence,explicit charset,symbol rule,empty style,12height and independent Font handles covered. Existing default-font-device/config/Font tests pass;source contract tests independently read pinned native role switch and ScDocumentPool consumed metadata fields. Types/build,Calc and Writer resource freshness,touched style,boundaries/docs/size/tree/provenance,scopedCalc/shared inventories,doctor/routing pass. Full suite next task20.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this metadata bridge and scoped tests/registry/docs. Preserve current default-font device API,Writer behavior,Calc UI and user changes;no merge or branch reset.

## Findings
