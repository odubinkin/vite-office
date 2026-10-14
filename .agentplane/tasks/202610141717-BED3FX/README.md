---
id: "202610141717-BED3FX"
title: "Implement canonical diagonal border item and shared border struct conversion"
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
  updated_at: "2026-10-14T17:18:44.705Z"
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
    body: "Start: port missing native diagonal border item using real inherited line structs and shared canonical converters; migrate actual XML/Writer boundaries under standing authorization, no duplicate line engine."
events:
  -
    type: "status"
    at: "2026-10-14T17:19:20.656Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port missing native diagonal border item using real inherited line structs and shared canonical converters; migrate actual XML/Writer boundaries under standing authorization, no duplicate line engine."
doc_version: 3
doc_updated_at: "2026-10-14T17:19:20.656Z"
doc_updated_by: "CODER"
description: "Task137: missing ScDocPool SvxLineItem dependency; native owned optional border/default/copy/equality/metrics/typed Any member contracts. Real published BorderLine/BorderLine2 generated value/type inheritance over existing CPPU; canonical shared SvxBoxItem line converters and shared extract helper, actual browser/xmloff/Writer consumers migrated without duplicate model or compatibility stubs. Calc141142 and real item ownership tests; source quirks/inventory. UI/ODS critical path, no native lifetime machinery."
sections:
  Summary: "Task137 removes the missing native SvxLineItem dependency for Calc diagonal borders. Implement original optional owned SvxBorderLine value and complete typed Any contracts through real published BorderLine/BorderLine2 values, reusing existing CPPU and shared border converters. Canonically correct shared converter/consumer behavior rather than duplicate it. Standing human shared/Writer correction authorization, calccheckout only."
  Scope: "At most60source/doc/inventory paths, expected35-50: new frmitems.line.ts owner and lineitem.ts header, published BorderLine/BorderLine2 values and generated normal type getters with base inheritance; canonical existing SvxBoxItem line converters and shared lcl_extractBorderLine; explicit existing browser record projections; actual xmloff border handlers and materially affected Writer/shared tests migrate to proper value copies, no class object spread. Native editeng memberIDs and Calc141142, real item-set clones. Existing module edge checker/tests may admit original xmloff->offapi for actual BorderLine2.hpp. Exact runtime/provenance/capability/docs/suspected cases. No broad BoxItem Any/themed-color interface/presentation/callback/heap library port, no C++build/generator/probe or new memory/lifecycle engine. Native presentation/diagnostic XML/fullDocPool/document/UI/ODS remain pending."
  Plan: "Implement native optional border item defaults/copy/SetLine/Clone/equality/metrics and full Any query/put; add actual inherited published line structs over existing CPPU. Reuse actual shared SvxBoxItem source-shaped native conversion and extraction helpers, migrate old plain struct records to explicit browser projection and native XML boundary value copies. Preserve source memberbyte/convert semantics including unreachable MID_LINE_STYLE after CONVERT_TWIPS stripping, absent-line query success/untouched output and allocation before invalid scalar member rejection. Literal direct and actual Any tests, current related shared/Writer tests, strict raw100 whole changed shared and wholeCalc, build and narrow4border browser specs. Exact inventory and12source gates/boundaries/hashes/nativepins/clean calc. No full run until actualminimumUI+ODS readiness then repairs/pause."
  Verify Steps: "Native BorderLine default/copy/value/assignment/equality, signed32color/signed16components; BorderLine2 real inheritance, LineStyle signed16, LineWidth unsigned32, stable original compound lvalues, real cold/warm CPPU type metadata/base member layout from original typelib+cppumaker, typed Any derived/base extraction/copy. Source-faithful SvxBoxItem conversion missing line/width/style/component conversion, legacy direct BorderLine and extended paths, double-asymmetric guess and preservation of existing line identity/scale/mirror. Existing browser record and actual XML/native Writer consumer migration retains values, with source-backed signed-short correction, no compatibility aliases. SvxLineItem absent/default/copy/owned SetLine/null/equality/clone, native metric delegation, Query aggregate/scalar/convertbit/absent/unknown behavior; Put derived/base/failure, scalar color, allocation-before-invalid, and source-unreachable style case folded/documented rather than a fake test path. Actual Calc141142 independent item-set ownership. Strict raw S/B/F/L100 and every raw counter positive for all whole changed shared executable owners, npm run test:coverage:calc100, relevant existing border/Writer tests. Build and four existing specs writer-native-border-page,writer-native-cell-box,writer-table-border-common-state,writer-table-border-changed-items under writer project. Four reference links absent/restoredfinally. Writer-only gaps measured/reported not repaired.12format/lint/typecheck/docs/size/dependencies/tree/provenance/registry/routing/doctor/diff gates and boundary tests, exact60paths/nativepins/sourcehashes/finalclean calc. Full BoxItem Any/theme interfaces/presentation/diagnostic XML/fullDocPool/document/UI/ODS unclaimed; no full-suite checkpoint."
  Verification: "Pending."
  Rollback Plan: "Revert only task-owned changes in a later authorized task; never reset unrelated work, merge or publish."
  Findings: "Task136 closed clean at39ab0480. Native ScDocPool requires absent SvxLineItem for141142. Existing shared Box converters use plain records and private browser conversion helper, while native Any needs actual published structs; reuse/canonically fix instead of creating a second converter. Native LineToSvxLine mutates existing line and retains other state. Base struct occupies12logical bytes in existing real typelib, derived style at12 and width16 per native base.nSize and CPPU_GCC3_ALIGN source; no ABI/persisted binary claim. Native MID_LINE_STYLE0x90 overlaps CONVERT_TWIPS0x80 and is stripped to0x10 before its own case, making the style write unreachable; preserve and document. Native unsupported scalar member may allocate an empty line before failing. Shared boundaries and related Writer can be corrected under explicit human authorization. Same-agent EVALUATOR not independent; no subagents authorized."
id_source: "generated"
---
## Summary

Task137 removes the missing native SvxLineItem dependency for Calc diagonal borders. Implement original optional owned SvxBorderLine value and complete typed Any contracts through real published BorderLine/BorderLine2 values, reusing existing CPPU and shared border converters. Canonically correct shared converter/consumer behavior rather than duplicate it. Standing human shared/Writer correction authorization, calccheckout only.

## Scope

At most60source/doc/inventory paths, expected35-50: new frmitems.line.ts owner and lineitem.ts header, published BorderLine/BorderLine2 values and generated normal type getters with base inheritance; canonical existing SvxBoxItem line converters and shared lcl_extractBorderLine; explicit existing browser record projections; actual xmloff border handlers and materially affected Writer/shared tests migrate to proper value copies, no class object spread. Native editeng memberIDs and Calc141142, real item-set clones. Existing module edge checker/tests may admit original xmloff->offapi for actual BorderLine2.hpp. Exact runtime/provenance/capability/docs/suspected cases. No broad BoxItem Any/themed-color interface/presentation/callback/heap library port, no C++build/generator/probe or new memory/lifecycle engine. Native presentation/diagnostic XML/fullDocPool/document/UI/ODS remain pending.

## Plan

Implement native optional border item defaults/copy/SetLine/Clone/equality/metrics and full Any query/put; add actual inherited published line structs over existing CPPU. Reuse actual shared SvxBoxItem source-shaped native conversion and extraction helpers, migrate old plain struct records to explicit browser projection and native XML boundary value copies. Preserve source memberbyte/convert semantics including unreachable MID_LINE_STYLE after CONVERT_TWIPS stripping, absent-line query success/untouched output and allocation before invalid scalar member rejection. Literal direct and actual Any tests, current related shared/Writer tests, strict raw100 whole changed shared and wholeCalc, build and narrow4border browser specs. Exact inventory and12source gates/boundaries/hashes/nativepins/clean calc. No full run until actualminimumUI+ODS readiness then repairs/pause.

## Verify Steps

Native BorderLine default/copy/value/assignment/equality, signed32color/signed16components; BorderLine2 real inheritance, LineStyle signed16, LineWidth unsigned32, stable original compound lvalues, real cold/warm CPPU type metadata/base member layout from original typelib+cppumaker, typed Any derived/base extraction/copy. Source-faithful SvxBoxItem conversion missing line/width/style/component conversion, legacy direct BorderLine and extended paths, double-asymmetric guess and preservation of existing line identity/scale/mirror. Existing browser record and actual XML/native Writer consumer migration retains values, with source-backed signed-short correction, no compatibility aliases. SvxLineItem absent/default/copy/owned SetLine/null/equality/clone, native metric delegation, Query aggregate/scalar/convertbit/absent/unknown behavior; Put derived/base/failure, scalar color, allocation-before-invalid, and source-unreachable style case folded/documented rather than a fake test path. Actual Calc141142 independent item-set ownership. Strict raw S/B/F/L100 and every raw counter positive for all whole changed shared executable owners, npm run test:coverage:calc100, relevant existing border/Writer tests. Build and four existing specs writer-native-border-page,writer-native-cell-box,writer-table-border-common-state,writer-table-border-changed-items under writer project. Four reference links absent/restoredfinally. Writer-only gaps measured/reported not repaired.12format/lint/typecheck/docs/size/dependencies/tree/provenance/registry/routing/doctor/diff gates and boundary tests, exact60paths/nativepins/sourcehashes/finalclean calc. Full BoxItem Any/theme interfaces/presentation/diagnostic XML/fullDocPool/document/UI/ODS unclaimed; no full-suite checkpoint.

## Verification

Pending.

## Rollback Plan

Revert only task-owned changes in a later authorized task; never reset unrelated work, merge or publish.

## Findings

Task136 closed clean at39ab0480. Native ScDocPool requires absent SvxLineItem for141142. Existing shared Box converters use plain records and private browser conversion helper, while native Any needs actual published structs; reuse/canonically fix instead of creating a second converter. Native LineToSvxLine mutates existing line and retains other state. Base struct occupies12logical bytes in existing real typelib, derived style at12 and width16 per native base.nSize and CPPU_GCC3_ALIGN source; no ABI/persisted binary claim. Native MID_LINE_STYLE0x90 overlaps CONVERT_TWIPS0x80 and is stripped to0x10 before its own case, making the style write unreachable; preserve and document. Native unsupported scalar member may allocate an empty line before failing. Shared boundaries and related Writer can be corrected under explicit human authorization. Same-agent EVALUATOR not independent; no subagents authorized.
