---
id: "202610160032-WW0KDX"
title: "Correct native Font IsSameInstance value comparison"
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
  updated_at: "2026-10-16T00:33:01.494Z"
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
    body: "Start: correct the proven Font IsSameInstance mismatch using existing value equality;preserve state and all unrelated methods,add exact source-chain evidence without porting ownership machinery."
events:
  -
    type: "status"
    at: "2026-10-16T00:33:02.758Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: correct the proven Font IsSameInstance mismatch using existing value equality;preserve state and all unrelated methods,add exact source-chain evidence without porting ownership machinery."
doc_version: 3
doc_updated_at: "2026-10-16T00:33:02.758Z"
doc_updated_by: "CODER"
description: "Task182: native Font IsSameInstance uses cow_wrapper operator==,which compares shared identity OR ImplFont values;correct current JS record identity-only implementation through existing represented Font equality. No cow wrapper/refcount library or memory manager. Update related tests and truthful inventory/suspected source case."
sections:
  Summary: "Correct a source-proven shared Font contract mismatch: IsSameInstance delegates to cow_wrapper equality,which permits equal values in distinct implementations. Reuse existing represented Font equality and remove the incorrect identity-only interpretation."
  Scope: "One shared Font method and its documentation;related metadata/value tests,actual Chromium case,inventory/readiness/suspected source note. Maximum20non-task paths. Existing state,copy/update guards,other algorithms and deliberate I/O/recovery deviations remain unchanged. No physical COW/refcount/weak/lifetime library,renderer/configuration/full-font expansion,native compiler/probe,network or all-app run."
  Plan: "Correct shared Font IsSameInstance to reuse actual represented Font value equality,matching original cow_wrapper operator== instead of JS state-object identity. Preserve all state/guarded assignments and existing Equals behavior;do not port cow_wrapper,refcounts or physical uniqueness. Update only the erroneous equal-value expectation in existing metadata tests plus misleading identity wording;add independent-equal and unequal paint/alignment/geometry regressions and Chromium case. Document source naming surprise CALC169 and correct truthful inventory/readiness claims while retaining prior history/parity statuses. Maximum20non-task paths. Verify native Font/ImplFont/cow_wrapper source chain and unchanged all other method bodies,related shared raw S/B/F/L100 plus whole Calc,13gates,build and actual Chromium/Writer startup-load-edit with4refs absent/restored. No native compiled probe or all-app run;full UI/ODS milestone remains pending."
  Verify Steps: "Pin Font IsSameInstance/operator== and ImplFont equality definitions plus font.hxx ImplType and cow_wrapper operator==/same_object. Prove source evaluates shared object OR value,not identity alone. Actual independent Font handles modified to equal metadata/paint/alignment/size must compare true;each represented unequal value must compare false. Preserve old metadata functional cases,change only equal-value identity expectation,add source-based regressions and browser independent-equal case. All other Font method bodies and reused Color/Size/wrapper-free implementation remain unchanged by emitted-token proof. Related shared exact raw S/B/F/L100 plus whole Calc,every raw counter positive;Writer-only gaps exempt.13source gates,production build,actual Chromium Font semantics and Writer startup/load/edit with4upstream refs absent/restored. Inventory remains broad-unverified and documents prior identity interpretation as corrected;no native probe,full font/pool/document/UI/ODS or all-app claim."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert task182 commits only,preserving calc branch,unrelated work and upstream links. No merges,history rewrite,gate weakening or unrelated Writer-only coverage repairs. Portable wrappers restore4references in finally."
  Findings: ""
id_source: "generated"
---
## Summary

Correct a source-proven shared Font contract mismatch: IsSameInstance delegates to cow_wrapper equality,which permits equal values in distinct implementations. Reuse existing represented Font equality and remove the incorrect identity-only interpretation.

## Scope

One shared Font method and its documentation;related metadata/value tests,actual Chromium case,inventory/readiness/suspected source note. Maximum20non-task paths. Existing state,copy/update guards,other algorithms and deliberate I/O/recovery deviations remain unchanged. No physical COW/refcount/weak/lifetime library,renderer/configuration/full-font expansion,native compiler/probe,network or all-app run.

## Plan

Correct shared Font IsSameInstance to reuse actual represented Font value equality,matching original cow_wrapper operator== instead of JS state-object identity. Preserve all state/guarded assignments and existing Equals behavior;do not port cow_wrapper,refcounts or physical uniqueness. Update only the erroneous equal-value expectation in existing metadata tests plus misleading identity wording;add independent-equal and unequal paint/alignment/geometry regressions and Chromium case. Document source naming surprise CALC169 and correct truthful inventory/readiness claims while retaining prior history/parity statuses. Maximum20non-task paths. Verify native Font/ImplFont/cow_wrapper source chain and unchanged all other method bodies,related shared raw S/B/F/L100 plus whole Calc,13gates,build and actual Chromium/Writer startup-load-edit with4refs absent/restored. No native compiled probe or all-app run;full UI/ODS milestone remains pending.

## Verify Steps

Pin Font IsSameInstance/operator== and ImplFont equality definitions plus font.hxx ImplType and cow_wrapper operator==/same_object. Prove source evaluates shared object OR value,not identity alone. Actual independent Font handles modified to equal metadata/paint/alignment/size must compare true;each represented unequal value must compare false. Preserve old metadata functional cases,change only equal-value identity expectation,add source-based regressions and browser independent-equal case. All other Font method bodies and reused Color/Size/wrapper-free implementation remain unchanged by emitted-token proof. Related shared exact raw S/B/F/L100 plus whole Calc,every raw counter positive;Writer-only gaps exempt.13source gates,production build,actual Chromium Font semantics and Writer startup/load/edit with4upstream refs absent/restored. Inventory remains broad-unverified and documents prior identity interpretation as corrected;no native probe,full font/pool/document/UI/ODS or all-app claim.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert task182 commits only,preserving calc branch,unrelated work and upstream links. No merges,history rewrite,gate weakening or unrelated Writer-only coverage repairs. Portable wrappers restore4references in finally.

## Findings
