---
id: "202610152352-CZ3K8Y"
title: "Restore shared native size item contracts for Calc pool construction"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T23:53:03.284Z"
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
    body: "Start: restore shared size value/Any behavior and necessary Writer derived contracts using existing geometry,CPPU and conversions;preserve upstream quirks and test without native probes."
events:
  -
    type: "status"
    at: "2026-10-15T23:53:04.566Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore shared size value/Any behavior and necessary Writer derived contracts using existing geometry,CPPU and conversions;preserve upstream quirks and test without native probes."
doc_version: 3
doc_updated_at: "2026-10-15T23:53:04.566Z"
doc_updated_by: "CODER"
description: "Task179: canonical SvxSizeItem over actual tools Size and generated awt Size/Any,correct native member conversion/equality/scaling and necessary Writer frame-size caller migration;reuse shared geometry/conversion/CPPU. Direct prerequisite for ScDocumentPool page-size defaults,not a document or UI facade."
sections:
  Summary: "Restore the existing shared size item to native value and UNO member behavior before Calc document-pool construction;reuse tools Size,CPPU Any and unit conversions. Correct the necessary Writer derived owner and callers instead of duplicating the base."
  Scope: "SvxSizeItem shard/header and existing frmitems facade;genuine generated awt Size/Type binding;native SVL/Writer member constants;necessary SwFormatFrameSize construction,geometry access,Any query/put and native HasMetrics override;related tests,evidence,inventory/readiness/suspected cases. Maximum80non-task paths. Native finite safe-integer geometry domain and existing scalar transport stay explicit;no native binary ABI,allocator,localization/presentation service,document substitute,network or all-app run."
  Plan: "Restore actual shared SvxSizeItem native constructors,stable tools::Size value member,equality independent of Which,CreateDefault,metric scaling and complete Size/width/height Any member contracts using existing geometry,CPPU and unit conversions. Add the genuine awt Size IDL value/type binding and required native member constants. Move the single size implementation into a source responsibility shard and canonical sizeitem header;update necessary Writer frame-size construction/access/query overrides and tests to native contracts without duplicate base logic. Preserve explicit browser no-argument query transport only where actually used,without bypassing native Any calls. Do not add localization/presentation services,full pool/document facades,memory managers,native probes or all-app run. Update inventory/readiness/suspected cases;maximum80non-task paths. Verify exact source definitions/IDL/constants and unchanged unrelated algorithms;whole Calc and affected shared raw S/B/F/L100,Writer-only gaps exempt,related Writer tests,13source gates,production build and real shared Chromium plus Writer startup/load/edit. Keep overall goal active until connected UI/same-model ODS milestone."
  Verify Steps: "Pin sizeitem.hxx,frmitems.cxx,tools gen.hxx,awt Size.idl,generated struct/type-generation contracts,svl memberid.h,Writer fmtfsize.hxx/atrfrm.cxx/unomid.h and existing unit conversion definitions. Test default/explicit/copy,stable borrowed geometry and copy assignment,Which-independent payload equality,clone,all3native Any members and convert flags,int32 narrowing,bad Any failure destinations including native HEIGHT success-without-write,metric scaling signs/ties. Writer must retain native derived member contracts,always-converted queries,Put conversion selection,percent/sync/type/clamp behavior and nonmetric override. Related Writer tests and whole Calc;all measured shared executable owners raw S/B/F/L100,every raw counter positive;Writer-only gaps exempt.13source gates,production build,actual Chromium shared size scenario and Writer startup/load/edit,all4upstream refs absent at runtime and restored. No native probes or full all-app run;full UI/ODS milestone remains pending."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert task179 changes only,preserving calc branch and other work;no merges or history rewriting. Restore reference symlinks in portable wrappers finally blocks. Do not weaken gates or repair Writer-only coverage gaps."
  Findings: ""
id_source: "generated"
---
## Summary

Restore the existing shared size item to native value and UNO member behavior before Calc document-pool construction;reuse tools Size,CPPU Any and unit conversions. Correct the necessary Writer derived owner and callers instead of duplicating the base.

## Scope

SvxSizeItem shard/header and existing frmitems facade;genuine generated awt Size/Type binding;native SVL/Writer member constants;necessary SwFormatFrameSize construction,geometry access,Any query/put and native HasMetrics override;related tests,evidence,inventory/readiness/suspected cases. Maximum80non-task paths. Native finite safe-integer geometry domain and existing scalar transport stay explicit;no native binary ABI,allocator,localization/presentation service,document substitute,network or all-app run.

## Plan

Restore actual shared SvxSizeItem native constructors,stable tools::Size value member,equality independent of Which,CreateDefault,metric scaling and complete Size/width/height Any member contracts using existing geometry,CPPU and unit conversions. Add the genuine awt Size IDL value/type binding and required native member constants. Move the single size implementation into a source responsibility shard and canonical sizeitem header;update necessary Writer frame-size construction/access/query overrides and tests to native contracts without duplicate base logic. Preserve explicit browser no-argument query transport only where actually used,without bypassing native Any calls. Do not add localization/presentation services,full pool/document facades,memory managers,native probes or all-app run. Update inventory/readiness/suspected cases;maximum80non-task paths. Verify exact source definitions/IDL/constants and unchanged unrelated algorithms;whole Calc and affected shared raw S/B/F/L100,Writer-only gaps exempt,related Writer tests,13source gates,production build and real shared Chromium plus Writer startup/load/edit. Keep overall goal active until connected UI/same-model ODS milestone.

## Verify Steps

Pin sizeitem.hxx,frmitems.cxx,tools gen.hxx,awt Size.idl,generated struct/type-generation contracts,svl memberid.h,Writer fmtfsize.hxx/atrfrm.cxx/unomid.h and existing unit conversion definitions. Test default/explicit/copy,stable borrowed geometry and copy assignment,Which-independent payload equality,clone,all3native Any members and convert flags,int32 narrowing,bad Any failure destinations including native HEIGHT success-without-write,metric scaling signs/ties. Writer must retain native derived member contracts,always-converted queries,Put conversion selection,percent/sync/type/clamp behavior and nonmetric override. Related Writer tests and whole Calc;all measured shared executable owners raw S/B/F/L100,every raw counter positive;Writer-only gaps exempt.13source gates,production build,actual Chromium shared size scenario and Writer startup/load/edit,all4upstream refs absent at runtime and restored. No native probes or full all-app run;full UI/ODS milestone remains pending.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert task179 changes only,preserving calc branch and other work;no merges or history rewriting. Restore reference symlinks in portable wrappers finally blocks. Do not weaken gates or repair Writer-only coverage gaps.

## Findings
