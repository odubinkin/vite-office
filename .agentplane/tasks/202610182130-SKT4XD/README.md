---
id: "202610182130-SKT4XD"
title: "Port Calc native cell pattern ownership and item-set contracts for formatting"
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
  - "Whole Calc raw100percent four metrics;new source-backed pattern/helper/holder tests including schema/invalid/copy/equality/conditional/default/key/lifecycle and related SVL item-set tests pass. Types/build,source resource checks,touched style,boundary/docs/size/tree/provenance,Calc/shared inventories,doctor/routing pass. Full regression at task20."
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T21:30:24.462Z"
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
    body: "Start: implement source-owned Calc pattern itemsets and canonical helper/holder lifecycle as the required formatting prerequisite;no fake document pool or defaults."
events:
  -
    type: "status"
    at: "2026-10-18T21:30:43.236Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement source-owned Calc pattern itemsets and canonical helper/holder lifecycle as the required formatting prerequisite;no fake document pool or defaults."
doc_version: 3
doc_updated_at: "2026-10-18T21:30:43.236Z"
doc_updated_by: "CODER"
description: "Approved UI goal task18: implement actual CellAttributeHelper,CellAttributeHolder and ScPatternAttr data/ownership subset at native patattr boundaries over existing shared SfxItemPool/SfxItemSet. Preserve 100..155 schema,INVALID selection states,copy/style-name/conditional precedence,key and holder semantics. No fabricated document pool,font defaults,style sheet,rendering or enabled formatting slots. Correct source formatting resource audit:cell context uses formatobjectbar,not textobjectbar. Work only calc checkout/branch;no network."
sections:
  Summary: |-
    Port Calc native cell pattern ownership and item-set contracts for formatting

    Approved UI goal task18: implement actual CellAttributeHelper,CellAttributeHolder and ScPatternAttr data/ownership subset at native patattr boundaries over existing shared SfxItemPool/SfxItemSet. Preserve 100..155 schema,INVALID selection states,copy/style-name/conditional precedence,key and holder semantics. No fabricated document pool,font defaults,style sheet,rendering or enabled formatting slots. Correct source formatting resource audit:cell context uses formatobjectbar,not textobjectbar. Work only calc checkout/branch;no network.
  Scope: |-
    - In scope: Approved UI goal task18: implement actual CellAttributeHelper,CellAttributeHolder and ScPatternAttr data/ownership subset at native patattr boundaries over existing shared SfxItemPool/SfxItemSet. Preserve 100..155 schema,INVALID selection states,copy/style-name/conditional precedence,key and holder semantics. No fabricated document pool,font defaults,style sheet,rendering or enabled formatting slots. Correct source formatting resource audit:cell context uses formatobjectbar,not textobjectbar. Work only calc checkout/branch;no network.
    - Out of scope: unrelated refactors not required for "Port Calc native cell pattern ownership and item-set contracts for formatting".
  Plan: "1.CODER ports native patattr data owners and header at original paths:actual SfxItemSet schema,INVALID copy,style-name snapshots,conditional precedence,equality,mutation/key,selected-item filtering. Helper/holder implement source registration identity and lifecycle;JS-managed references erase physical allocation and hash-prefilter optimization,not canonical value identity. ScGlobal/style/document-pool/VCL services remain explicitly unavailable. 2.CODER tests literal pinned source contracts and all current represented branches against actual shared item/pool values;records real formatting resource context. 3.CODER runs all Calc raw100percent plus related SVL checks/types/build/source/gates and records quality/closeout. Up to25 non-task paths including native core/header/schema,tests,registry/capability evidence and source tests. Existing explicit user goal approval applies. No UI-only fake defaults/slots. Task18;full regression at20."
  Verify Steps: "npm run test:coverage:calc raw100percent statements/branches/functions/lines. Native pattern/helper/holder fixtures cover fixed100..155 ranges,invalid/disabled state,copy and value isolation,style names,pool identity,conditional precedence,parent/default lookup,key/canonical registration/holder lifecycle,DeleteUnchanged and zero-terminated item lists,unsupported-precondition rejection. Related existing SVL item-set/pool tests pass. Source tests pin actual patattr/schema and formatobjectbar native cell context. App/tools types/build,Calc/Writer resource freshness,touched style,dependencies/docs/size/tree/provenance,scopedCalc/shared inventories,doctor/routing pass. Full regression next task20."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this native pattern prerequisite task and its registry/test artifacts;preserve existing Calc UI and user changes. No branch reset or merge."
  Findings: ""
id_source: "generated"
---
## Summary

Port Calc native cell pattern ownership and item-set contracts for formatting

Approved UI goal task18: implement actual CellAttributeHelper,CellAttributeHolder and ScPatternAttr data/ownership subset at native patattr boundaries over existing shared SfxItemPool/SfxItemSet. Preserve 100..155 schema,INVALID selection states,copy/style-name/conditional precedence,key and holder semantics. No fabricated document pool,font defaults,style sheet,rendering or enabled formatting slots. Correct source formatting resource audit:cell context uses formatobjectbar,not textobjectbar. Work only calc checkout/branch;no network.

## Scope

- In scope: Approved UI goal task18: implement actual CellAttributeHelper,CellAttributeHolder and ScPatternAttr data/ownership subset at native patattr boundaries over existing shared SfxItemPool/SfxItemSet. Preserve 100..155 schema,INVALID selection states,copy/style-name/conditional precedence,key and holder semantics. No fabricated document pool,font defaults,style sheet,rendering or enabled formatting slots. Correct source formatting resource audit:cell context uses formatobjectbar,not textobjectbar. Work only calc checkout/branch;no network.
- Out of scope: unrelated refactors not required for "Port Calc native cell pattern ownership and item-set contracts for formatting".

## Plan

1.CODER ports native patattr data owners and header at original paths:actual SfxItemSet schema,INVALID copy,style-name snapshots,conditional precedence,equality,mutation/key,selected-item filtering. Helper/holder implement source registration identity and lifecycle;JS-managed references erase physical allocation and hash-prefilter optimization,not canonical value identity. ScGlobal/style/document-pool/VCL services remain explicitly unavailable. 2.CODER tests literal pinned source contracts and all current represented branches against actual shared item/pool values;records real formatting resource context. 3.CODER runs all Calc raw100percent plus related SVL checks/types/build/source/gates and records quality/closeout. Up to25 non-task paths including native core/header/schema,tests,registry/capability evidence and source tests. Existing explicit user goal approval applies. No UI-only fake defaults/slots. Task18;full regression at20.

## Verify Steps

npm run test:coverage:calc raw100percent statements/branches/functions/lines. Native pattern/helper/holder fixtures cover fixed100..155 ranges,invalid/disabled state,copy and value isolation,style names,pool identity,conditional precedence,parent/default lookup,key/canonical registration/holder lifecycle,DeleteUnchanged and zero-terminated item lists,unsupported-precondition rejection. Related existing SVL item-set/pool tests pass. Source tests pin actual patattr/schema and formatobjectbar native cell context. App/tools types/build,Calc/Writer resource freshness,touched style,dependencies/docs/size/tree/provenance,scopedCalc/shared inventories,doctor/routing pass. Full regression next task20.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this native pattern prerequisite task and its registry/test artifacts;preserve existing Calc UI and user changes. No branch reset or merge.

## Findings
