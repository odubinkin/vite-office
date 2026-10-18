---
id: "202610160534-Z7BW2Y"
title: "Implement shared LanguageTag normal value and registry owner"
status: "DOING"
priority: "low"
owner: "CODER"
revision: 17
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-16T05:36:58.788Z"
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
    body: "Start: implement actual normal shared LanguageTag value/private canonicalization/cache/registry owner using completed source components,with observable ID semantics and JS GC ownership."
events:
  -
    type: "status"
    at: "2026-10-16T05:37:04.443Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement actual normal shared LanguageTag value/private canonicalization/cache/registry owner using completed source components,with observable ID semantics and JS GC ownership."
doc_version: 3
doc_updated_at: "2026-10-16T06:33:22.744Z"
doc_updated_by: "CODER"
description: "Task197: implement the actual LibreOffice LanguageTag normal constructors/reset/lazy private state,known fast canonicalization,normal fields/ISO validity,semantic tag/ID registry and on-the-fly IDs using completed parser and shared owners;connect actual normal API needed by Font,without physical ownership engine or fake facade."
sections:
  Summary: "Task197 implements the real shared LibreOffice LanguageTag normal value/private-state/semantic-registry owner needed by Font,using the completed normal liblangtag parser and existing actual MsLangId/Locale/OUString/extraction/fallback/conversion components."
  Scope: "Only vite-office-calc branch calc. Up to50non-task paths: normal LanguageTag constructors/copy/reset/lazy synchronization,private canonicalization/cache/ISO/field/conversion responsibilities,known fallback discovery,actual tag/ID/system registries and finite on-the-fly language IDs/script metadata,public header boundary,source-backed ID scalar helpers,tests/browser evidence and truthful runtime/provenance/capability/readiness/suspected-case records. Preserve original defaults,query order,raw ID round-trips,shared semantic identity,source first-wins behavior and configured-system origin. Use JS GC and native Map/Set only for observable registry state;no allocator/refcount/weak/pool/lock/lifetime engine. Reuse actual shared Writer-era components;correct in-scope shared callers if necessary. Only add the witnessed i18nlangtag->external allowed-edge metadata and matching expected-data test from native Library_i18nlangtag.mk/source includes;do not alter guard algorithms/exemptions. No network,native compilation/probes/generators,localized UI labels,POSIX rtl_Locale/glibc conversion or unrelated full library API stubs,Font attributes/UI/ODS/full all-app run. Standing user approval covers this necessary core/shared implementation."
  Plan: "Implement coherent real normal LanguageTag value/private canonical/cache/field/conversion and semantic tag/ID/system registry owner with finite on-the-fly IDs,using actual shared components and parser. Verify strict related/Calc raw100,source/QA/query-order contracts,13gates and actual browser/Worker without5refs;record/review/finish only the approved normal-owner scope. No physical ownership or unsupported POSIX stubs."
  Verify Steps: |-
    - node output/playwright/task197-checks/native-audit.mjs: pinned LibreOffice source/header/QA and external source hashes,exact normal public/private/registry responsibilities,source-backed edge evidence and unchanged scalar/data dependencies;no native execution/generator.
    - node output/playwright/task197-checks/portable.mjs: related LanguageTag/source scalar/registry/canonical/fallback/parser tests plus wholeCalc with5reference links absent/restored;exact declared changed/new shared executable owners and36Calc owners raw S/B/F/L100,every counter positive. Related Writer functional checks;Writer-only coverage gaps exempt.
    - node output/playwright/task197-checks/browser-portable.mjs: production build and actual Chromium/DOM-free Worker normal LanguageTag/registry/Font-facing value contracts with5source refs absent/restored;selected Writer functional smoke.
    - node output/playwright/task197-checks/source-gates.mjs: all13existing gates including inventory/provenance/boundaries/routing/doctor and the source-backed boundary expected-data test;no guard algorithm/config changes.
    - node output/playwright/task197-checks/final-audit.mjs: exact source/path/ref/owner/QA evidence and remaining Font/defaults/pools/model/UI/ODS gaps;record verify,source commit,same-agent EVALUATOR review and descriptive finish. Keep task active if complete approved scope is not yet verified.
  Verification: "Pending implementation and declared checks."
  Rollback Plan: "Revert only this task source/registry/metadata/test/doc commit. Preserve user work,earlier core/parser owners and all5source-reference links. No resets,merges or destructive cleanup."
  Findings: "Deferred by explicit user priority correction:full normal LanguageTag is not a prerequisite for minimal core/UI readiness and ODS. Preserve the complete38-path unverified snapshot as task-local artifacts/deferred-source.patch and manifest;restore only its unchanged own tracked implementation/metadata/guard files and remove only its hash-verified backed-up new files from active discovery. Keep current task198 readiness-map edits. Completed tasks194-196 stay untouched. This is reversible deferral,not completion or deletion of user work. Task197 remains DOING/low/unverified and must not resume before the minimal-core/ODS milestone. Last related427tests/24files passed but raw coverage was incomplete. Root goal remains active;UI implementation is explicitly separate."
id_source: "generated"
---
## Summary

Task197 implements the real shared LibreOffice LanguageTag normal value/private-state/semantic-registry owner needed by Font,using the completed normal liblangtag parser and existing actual MsLangId/Locale/OUString/extraction/fallback/conversion components.

## Scope

Only vite-office-calc branch calc. Up to50non-task paths: normal LanguageTag constructors/copy/reset/lazy synchronization,private canonicalization/cache/ISO/field/conversion responsibilities,known fallback discovery,actual tag/ID/system registries and finite on-the-fly language IDs/script metadata,public header boundary,source-backed ID scalar helpers,tests/browser evidence and truthful runtime/provenance/capability/readiness/suspected-case records. Preserve original defaults,query order,raw ID round-trips,shared semantic identity,source first-wins behavior and configured-system origin. Use JS GC and native Map/Set only for observable registry state;no allocator/refcount/weak/pool/lock/lifetime engine. Reuse actual shared Writer-era components;correct in-scope shared callers if necessary. Only add the witnessed i18nlangtag->external allowed-edge metadata and matching expected-data test from native Library_i18nlangtag.mk/source includes;do not alter guard algorithms/exemptions. No network,native compilation/probes/generators,localized UI labels,POSIX rtl_Locale/glibc conversion or unrelated full library API stubs,Font attributes/UI/ODS/full all-app run. Standing user approval covers this necessary core/shared implementation.

## Plan

Implement coherent real normal LanguageTag value/private canonical/cache/field/conversion and semantic tag/ID/system registry owner with finite on-the-fly IDs,using actual shared components and parser. Verify strict related/Calc raw100,source/QA/query-order contracts,13gates and actual browser/Worker without5refs;record/review/finish only the approved normal-owner scope. No physical ownership or unsupported POSIX stubs.

## Verify Steps

- node output/playwright/task197-checks/native-audit.mjs: pinned LibreOffice source/header/QA and external source hashes,exact normal public/private/registry responsibilities,source-backed edge evidence and unchanged scalar/data dependencies;no native execution/generator.
- node output/playwright/task197-checks/portable.mjs: related LanguageTag/source scalar/registry/canonical/fallback/parser tests plus wholeCalc with5reference links absent/restored;exact declared changed/new shared executable owners and36Calc owners raw S/B/F/L100,every counter positive. Related Writer functional checks;Writer-only coverage gaps exempt.
- node output/playwright/task197-checks/browser-portable.mjs: production build and actual Chromium/DOM-free Worker normal LanguageTag/registry/Font-facing value contracts with5source refs absent/restored;selected Writer functional smoke.
- node output/playwright/task197-checks/source-gates.mjs: all13existing gates including inventory/provenance/boundaries/routing/doctor and the source-backed boundary expected-data test;no guard algorithm/config changes.
- node output/playwright/task197-checks/final-audit.mjs: exact source/path/ref/owner/QA evidence and remaining Font/defaults/pools/model/UI/ODS gaps;record verify,source commit,same-agent EVALUATOR review and descriptive finish. Keep task active if complete approved scope is not yet verified.

## Verification

Pending implementation and declared checks.

## Rollback Plan

Revert only this task source/registry/metadata/test/doc commit. Preserve user work,earlier core/parser owners and all5source-reference links. No resets,merges or destructive cleanup.

## Findings

Deferred by explicit user priority correction:full normal LanguageTag is not a prerequisite for minimal core/UI readiness and ODS. Preserve the complete38-path unverified snapshot as task-local artifacts/deferred-source.patch and manifest;restore only its unchanged own tracked implementation/metadata/guard files and remove only its hash-verified backed-up new files from active discovery. Keep current task198 readiness-map edits. Completed tasks194-196 stay untouched. This is reversible deferral,not completion or deletion of user work. Task197 remains DOING/low/unverified and must not resume before the minimal-core/ODS milestone. Last related427tests/24files passed but raw coverage was incomplete. Root goal remains active;UI implementation is explicitly separate.
