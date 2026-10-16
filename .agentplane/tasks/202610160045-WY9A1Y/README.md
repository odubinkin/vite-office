---
id: "202610160045-WY9A1Y"
title: "Preserve shared Font stored values through Writer Worker transport"
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
  updated_at: "2026-10-16T00:45:54.070Z"
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
    body: "Start: reproduce and fix dropped shared Font state in real Writer transport using one reusable browser codec,with native-default legacy restoration and strict validation;core/ODF algorithms stay unchanged."
events:
  -
    type: "status"
    at: "2026-10-16T00:45:55.335Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: reproduce and fix dropped shared Font state in real Writer transport using one reusable browser codec,with native-default legacy restoration and strict validation;core/ODF algorithms stay unchanged."
doc_version: 3
doc_updated_at: "2026-10-16T00:45:55.335Z"
doc_updated_by: "CODER"
description: "Task183: lossless transport for native Font paint/alignment/size fields added in181. Extract reusable browser Font metadata codec,update Writer record/validation/restore and real structured-clone/Worker round trips;preserve existing browser legacy records at their I/O boundary."
sections:
  Summary: "Preserve all currently represented shared Font values in Writer document/Worker records after task181 expanded Font. A reusable browser VCL codec owns primitive serialization and validation;core Font and ODF behavior remain authoritative."
  Scope: "New shared vcl/browser Font metadata codec/tests;Writer document codec record,delegation and related model/Worker tests;actual browser/Worker case and truthful inventory/readiness. Maximum40non-task paths. Preserve existing valid legacy browser records through native defaults at the same I/O boundary;do not add core compatibility aliases or duplicated serialization. Native Font/Color/Size/numbering/ODF algorithms and intentional Writer/Calc save/open/recovery deviations unchanged. No native compiler/probe,ownership engine,network,full all-app run or unsupported document/UI/ODS claim."
  Plan: "Demonstrate current Writer structured-clone transport drops new represented Font paint/alignment/size values. Implement one shared vcl/browser Font metadata codec over actual Font,Color and Size;Writer retains external family-name field and delegates metadata encoding/validation/restoration to it. Encode all current represented fields;decode existing four-field metadata through actual native Font defaults at the browser I/O boundary,accept only complete valid new-value groups and reject malformed primitive fields before mutation. Restore fill before explicit transparency to preserve independent source flags. Update actual Writer model/Worker transport tests and real Chromium/dedicated DOM-free Worker,inventory/readiness. Maximum40non-task paths. Existing Font/core/ODF algorithms and deliberate I/O/recovery deviations unchanged. Related shared exact raw S/B/F/L100 plus whole Calc,Writer-only gaps exempt,13gates and production build;4refs absent/restored. No native compiler/probe,new lifetime engine,full all-app run or UI/ODS milestone claim."
  Verify Steps: "Reproduce loss in actual SwDoc numbering Font structured-clone round trip before production changes. Pin native Font/ImplFont copy/equality/defaults and SvxNumberFormat Font copying as the preserved core value contract;browser codec is an explicit adaptation,not a fabricated upstream class. Test all represented metadata,color/fill including alpha,independent transparency,alignment and signed safe-integer size;input/output copies and whole Font/SwNumFormat equality after encode/clone/decode. Test actual native default restoration for legacy four-field/absent metadata,all malformed/partial new groups,enum/int/color/size bounds and validation-before-mutation. Related Writer round trips/Worker runtime/transfer plus actual shared raw S/B/F/L100,whole Calc raw100;Writer-only gaps exempt.13source gates,production build,actual Chromium and dedicated DOM-free Worker round trip plus Writer startup/load/edit;4refs absent/restored. Prove all existing core and ODF algorithm tokens unchanged,record strict owner sets and explicit data/admission limits. No native probe or all-app run."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert task183 commits only,preserving calc branch,other work and4reference links. No merges,history rewriting,gate weakening or unrelated Writer-only coverage repairs;portable wrappers restore refs in finally."
  Findings: ""
id_source: "generated"
---
## Summary

Preserve all currently represented shared Font values in Writer document/Worker records after task181 expanded Font. A reusable browser VCL codec owns primitive serialization and validation;core Font and ODF behavior remain authoritative.

## Scope

New shared vcl/browser Font metadata codec/tests;Writer document codec record,delegation and related model/Worker tests;actual browser/Worker case and truthful inventory/readiness. Maximum40non-task paths. Preserve existing valid legacy browser records through native defaults at the same I/O boundary;do not add core compatibility aliases or duplicated serialization. Native Font/Color/Size/numbering/ODF algorithms and intentional Writer/Calc save/open/recovery deviations unchanged. No native compiler/probe,ownership engine,network,full all-app run or unsupported document/UI/ODS claim.

## Plan

Demonstrate current Writer structured-clone transport drops new represented Font paint/alignment/size values. Implement one shared vcl/browser Font metadata codec over actual Font,Color and Size;Writer retains external family-name field and delegates metadata encoding/validation/restoration to it. Encode all current represented fields;decode existing four-field metadata through actual native Font defaults at the browser I/O boundary,accept only complete valid new-value groups and reject malformed primitive fields before mutation. Restore fill before explicit transparency to preserve independent source flags. Update actual Writer model/Worker transport tests and real Chromium/dedicated DOM-free Worker,inventory/readiness. Maximum40non-task paths. Existing Font/core/ODF algorithms and deliberate I/O/recovery deviations unchanged. Related shared exact raw S/B/F/L100 plus whole Calc,Writer-only gaps exempt,13gates and production build;4refs absent/restored. No native compiler/probe,new lifetime engine,full all-app run or UI/ODS milestone claim.

## Verify Steps

Reproduce loss in actual SwDoc numbering Font structured-clone round trip before production changes. Pin native Font/ImplFont copy/equality/defaults and SvxNumberFormat Font copying as the preserved core value contract;browser codec is an explicit adaptation,not a fabricated upstream class. Test all represented metadata,color/fill including alpha,independent transparency,alignment and signed safe-integer size;input/output copies and whole Font/SwNumFormat equality after encode/clone/decode. Test actual native default restoration for legacy four-field/absent metadata,all malformed/partial new groups,enum/int/color/size bounds and validation-before-mutation. Related Writer round trips/Worker runtime/transfer plus actual shared raw S/B/F/L100,whole Calc raw100;Writer-only gaps exempt.13source gates,production build,actual Chromium and dedicated DOM-free Worker round trip plus Writer startup/load/edit;4refs absent/restored. Prove all existing core and ODF algorithm tokens unchanged,record strict owner sets and explicit data/admission limits. No native probe or all-app run.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert task183 commits only,preserving calc branch,other work and4reference links. No merges,history rewriting,gate weakening or unrelated Writer-only coverage repairs;portable wrappers restore refs in finally.

## Findings
