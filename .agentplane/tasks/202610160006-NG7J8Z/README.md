---
id: "202610160006-NG7J8Z"
title: "Implement native rich-text sections and shared string normalization"
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
  updated_at: "2026-10-16T00:07:07.563Z"
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
    body: "Start: port actual section extraction and paragraph normalization using existing core owners;preserve upstream behavior without a fake text-object constructor or EditEngine pool."
events:
  -
    type: "status"
    at: "2026-10-16T00:07:08.828Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port actual section extraction and paragraph normalization using existing core owners;preserve upstream behavior without a fake text-object constructor or EditEngine pool."
doc_version: 3
doc_updated_at: "2026-10-16T00:07:08.828Z"
doc_updated_by: "CODER"
description: "Task180: original EditTextObjectImpl GetAllSections payload responsibility over actual ContentInfo/XEditAttribute,actual editeng Section and ContentInfo NormalizeString using existing SharedStringPool. Prerequisite for real rich-text ODS/cell/header-footer model;do not fabricate EditTextObjectImpl or EditEngineItemPool constructors."
sections:
  Summary: "Implement original rich-text section extraction and actual paragraph shared-string normalization required by future Calc cell/header-footer objects and ODS export. Existing ContentInfo,attributes,items and SharedStringPool are reused;full EditTextObjectImpl/pool construction remains pending."
  Scope: "Actual Section constructor/header,editobj section-responsibility shard and internal export,ContentInfo NormalizeString plus tests,browser case,inventory/readiness/suspected source cases. Maximum45non-task paths. Original native valid signed32 spans and actual initialized ContentInfo producers;do not implement native memory layout,provider callbacks,pool or document substitutes,localized presentation or all-app testing."
  Plan: "Implement genuine editeng Section field/constructor values and source-owned GetAllSections algorithm over actual ContentInfo/XEditAttribute arrays;split large editobj implementation by native section responsibility without creating a fake EditTextObjectImpl or pool. Preserve ordered paragraph/border partitioning,empty paragraphs,borrowed item identities,first-Which duplicate suppression,unformatted spans and output replacement/unchanged-empty behavior. Add missing ContentInfo NormalizeString using actual SharedStringPool;existing value methods remain unchanged. Update inventory/readiness/suspected cases;maximum45non-task paths. Verify original source/QA context and unchanged old methods,whole Calc and related shared strict raw S/B/F/L100,13gates,build and actual Chromium sections plus Writer startup/load/edit with4refs absent/restored. No native probes,full all-app run,pool fallback substitute,localization or full rich-text/document/UI/ODS claim."
  Verify Steps: "Pin original Section hxx/cxx,EditTextObjectImpl GetAllSections,ContentInfo NormalizeString,editobj2 and SharedStringPool definitions plus actual related QA context. Test multiple/empty/unformatted paragraphs,overlapping/adjacent/zero spans,duplicate Which first wins,empty/null holder attributes,borrowed item identities and unchanged caller output when source is empty;defined initialized signed32 producer domain. Test actual normalization preserves text and stable SharedString member while interning actual equal/case-related values;old ContentInfo/attribute methods emitted tokens unchanged. Whole Calc and related shared raw S/B/F/L100,every raw counter positive;Writer-only gaps exempt.13source gates,production build,real Chromium rich-text sections and Writer startup/load/edit with4refs absent/restored. No native compiler/probe,all-app run or fake full text/pool/document claim."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task180 commits;preserve calc branch,other work and reference links. No merges,history rewriting,gate weakening or unrelated Writer-only coverage repairs."
  Findings: ""
id_source: "generated"
---
## Summary

Implement original rich-text section extraction and actual paragraph shared-string normalization required by future Calc cell/header-footer objects and ODS export. Existing ContentInfo,attributes,items and SharedStringPool are reused;full EditTextObjectImpl/pool construction remains pending.

## Scope

Actual Section constructor/header,editobj section-responsibility shard and internal export,ContentInfo NormalizeString plus tests,browser case,inventory/readiness/suspected source cases. Maximum45non-task paths. Original native valid signed32 spans and actual initialized ContentInfo producers;do not implement native memory layout,provider callbacks,pool or document substitutes,localized presentation or all-app testing.

## Plan

Implement genuine editeng Section field/constructor values and source-owned GetAllSections algorithm over actual ContentInfo/XEditAttribute arrays;split large editobj implementation by native section responsibility without creating a fake EditTextObjectImpl or pool. Preserve ordered paragraph/border partitioning,empty paragraphs,borrowed item identities,first-Which duplicate suppression,unformatted spans and output replacement/unchanged-empty behavior. Add missing ContentInfo NormalizeString using actual SharedStringPool;existing value methods remain unchanged. Update inventory/readiness/suspected cases;maximum45non-task paths. Verify original source/QA context and unchanged old methods,whole Calc and related shared strict raw S/B/F/L100,13gates,build and actual Chromium sections plus Writer startup/load/edit with4refs absent/restored. No native probes,full all-app run,pool fallback substitute,localization or full rich-text/document/UI/ODS claim.

## Verify Steps

Pin original Section hxx/cxx,EditTextObjectImpl GetAllSections,ContentInfo NormalizeString,editobj2 and SharedStringPool definitions plus actual related QA context. Test multiple/empty/unformatted paragraphs,overlapping/adjacent/zero spans,duplicate Which first wins,empty/null holder attributes,borrowed item identities and unchanged caller output when source is empty;defined initialized signed32 producer domain. Test actual normalization preserves text and stable SharedString member while interning actual equal/case-related values;old ContentInfo/attribute methods emitted tokens unchanged. Whole Calc and related shared raw S/B/F/L100,every raw counter positive;Writer-only gaps exempt.13source gates,production build,real Chromium rich-text sections and Writer startup/load/edit with4refs absent/restored. No native compiler/probe,all-app run or fake full text/pool/document claim.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task180 commits;preserve calc branch,other work and reference links. No merges,history rewriting,gate weakening or unrelated Writer-only coverage repairs.

## Findings
