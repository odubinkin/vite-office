---
id: "202610160019-654ZGX"
title: "Restore shared VCL font paint alignment and size values for Calc pool defaults"
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
  updated_at: "2026-10-16T00:20:11.173Z"
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
    body: "Start: restore native shared Font stored paint/alignment/size values with actual Color and Size;preserve guarded assignment side effects without new memory or renderer mechanisms."
events:
  -
    type: "status"
    at: "2026-10-16T00:20:12.433Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore native shared Font stored paint/alignment/size values with actual Color and Size;preserve guarded assignment side effects without new memory or renderer mechanisms."
doc_version: 3
doc_updated_at: "2026-10-16T00:20:12.433Z"
doc_updated_by: "CODER"
description: "Task181: extend actual shared Font with original color/fill/transparency/alignment and stored size contracts needed by native bullet/default-font values;reuse Color/Size and immutable JS value sharing,without renderer/configuration or memory machinery."
sections:
  Summary: "Restore source-backed Font color/fill/transparency/alignment/size value contracts required by native bullet and Calc/EditEngine defaults. Reuse existing shared Font,Color and Size without rendering or ownership-engine substitutes."
  Scope: "Shared vcl/source/font/font.ts and tools TextAlign declaration;native value tests,browser scenario,source audit,inventory/readiness/suspected source cases. Maximum40non-task paths. Preserve existing metadata interfaces and primitive UTF16 boundary. Stored geometry/paint state only;configuration lookup,device/font matching,rendering/metrics cache,unsupported full-font attributes,localization,physical COW uniqueness/refcounts and full Calc pool/document/UI/ODS remain pending. No new memory manager,native compiler/probe,network or all-app run."
  Plan: "Extend existing shared Font value owner with native transparent color/fill defaults,true transparency,TextAlign TOP and zero stored Size. Add original guarded setters/getters,height/average-width conveniences,copy/value equality over represented fields,EqualIgnoreColor and necessary const-view typing;reuse actual Color/Size. Preserve conditional fill-to-transparent side effect and identity-preserving no-op assignments. No new allocator/refcount/cache/weak/lifetime or font provider/config/rendering implementation. Existing metadata APIs remain unchanged;new fields stay immutable shared JS values until updates. Add original enum and evidence/inventory/readiness/suspected cases;maximum40non-task paths. Verify original source/defaults and unchanged existing method bodies,related shared raw S/B/F/L100 plus whole Calc,13source gates,build,actual Chromium font values and Writer startup/load/edit with4refs absent/restored. No all-app run or full font/pool/document/UI/ODS claim."
  Verify Steps: "Pin original Font/ImplFont getters,setters,defaults,copy and equality from font.cxx,impfont.hxx,font.hxx;TextAlign enumerators and actual native font QA context. Test transparent defaults,copy/isolation and no-op instance identity for colors/fill/transparency/alignment/size;fill transition only when color changes,and no forced false transition on opaque fill;real Color and Size copied by value,const views valid until owner mutation;size height/average-width aliases;EqualIgnoreColor still compares transparency/alignment/size/metadata while Equals compares paint too. Existing metadata method bodies except additive equality remain emitted-token identical;reused Color/Size and boundary guard unchanged. Whole Calc and related shared exact raw S/B/F/L100,every counter positive;Writer-only gaps exempt.13source gates,production build,actual Chromium font values and Writer startup/load/edit with4refs absent/restored. No full native font QA/pool/document/UI/ODS or physical COW/renderer claim."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task181 changes,preserving calc branch,other work and source references. No merges,history rewrite,gate weakening or unrelated Writer-only coverage repair;portable wrappers restore4links in finally."
  Findings: ""
id_source: "generated"
---
## Summary

Restore source-backed Font color/fill/transparency/alignment/size value contracts required by native bullet and Calc/EditEngine defaults. Reuse existing shared Font,Color and Size without rendering or ownership-engine substitutes.

## Scope

Shared vcl/source/font/font.ts and tools TextAlign declaration;native value tests,browser scenario,source audit,inventory/readiness/suspected source cases. Maximum40non-task paths. Preserve existing metadata interfaces and primitive UTF16 boundary. Stored geometry/paint state only;configuration lookup,device/font matching,rendering/metrics cache,unsupported full-font attributes,localization,physical COW uniqueness/refcounts and full Calc pool/document/UI/ODS remain pending. No new memory manager,native compiler/probe,network or all-app run.

## Plan

Extend existing shared Font value owner with native transparent color/fill defaults,true transparency,TextAlign TOP and zero stored Size. Add original guarded setters/getters,height/average-width conveniences,copy/value equality over represented fields,EqualIgnoreColor and necessary const-view typing;reuse actual Color/Size. Preserve conditional fill-to-transparent side effect and identity-preserving no-op assignments. No new allocator/refcount/cache/weak/lifetime or font provider/config/rendering implementation. Existing metadata APIs remain unchanged;new fields stay immutable shared JS values until updates. Add original enum and evidence/inventory/readiness/suspected cases;maximum40non-task paths. Verify original source/defaults and unchanged existing method bodies,related shared raw S/B/F/L100 plus whole Calc,13source gates,build,actual Chromium font values and Writer startup/load/edit with4refs absent/restored. No all-app run or full font/pool/document/UI/ODS claim.

## Verify Steps

Pin original Font/ImplFont getters,setters,defaults,copy and equality from font.cxx,impfont.hxx,font.hxx;TextAlign enumerators and actual native font QA context. Test transparent defaults,copy/isolation and no-op instance identity for colors/fill/transparency/alignment/size;fill transition only when color changes,and no forced false transition on opaque fill;real Color and Size copied by value,const views valid until owner mutation;size height/average-width aliases;EqualIgnoreColor still compares transparency/alignment/size/metadata while Equals compares paint too. Existing metadata method bodies except additive equality remain emitted-token identical;reused Color/Size and boundary guard unchanged. Whole Calc and related shared exact raw S/B/F/L100,every counter positive;Writer-only gaps exempt.13source gates,production build,actual Chromium font values and Writer startup/load/edit with4refs absent/restored. No full native font QA/pool/document/UI/ODS or physical COW/renderer claim.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task181 changes,preserving calc branch,other work and source references. No merges,history rewrite,gate weakening or unrelated Writer-only coverage repair;portable wrappers restore4links in finally.

## Findings
