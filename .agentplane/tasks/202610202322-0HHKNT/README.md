---
id: "202610202322-0HHKNT"
title: "Implement shared native paper geometry and reuse Writer page sizes"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-20T23:22:50.647Z"
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
    body: "Start: port native shared paper geometry and original matching/locale algorithms;reuse that genuine owner for Writer physical page sizes and preserve explicit absent services."
events:
  -
    type: "status"
    at: "2026-10-20T23:22:59.250Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port native shared paper geometry and original matching/locale algorithms;reuse that genuine owner for Writer physical page sizes and preserve explicit absent services."
doc_version: 3
doc_updated_at: "2026-10-20T23:22:59.250Z"
doc_updated_by: "CODER"
description: "Block59: original i18nutil Paper enum/table and PaperInfo physical-size,exact/rotated matching,sloppy matching/dimension snapping and locale defaults. Reuse actual Locale and o3tl conversions;derive existing Writer A4/Letter geometry from the shared native owner. Preserve source order,rounding and strict tolerance. Native platform paper discovery,OString PS-name return and printer/map-device services stay explicitly unported;no fake provider. This unblocks Calc page-style construction. Only calc checkout/branch;full all-app checkpoint60."
sections:
  Summary: |-
    Implement shared native paper geometry and reuse Writer page sizes

    Block59: original i18nutil Paper enum/table and PaperInfo physical-size,exact/rotated matching,sloppy matching/dimension snapping and locale defaults. Reuse actual Locale and o3tl conversions;derive existing Writer A4/Letter geometry from the shared native owner. Preserve source order,rounding and strict tolerance. Native platform paper discovery,OString PS-name return and printer/map-device services stay explicitly unported;no fake provider. This unblocks Calc page-style construction. Only calc checkout/branch;full all-app checkpoint60.
  Scope: "Original i18nutil paper.hxx/paper.cxx portable physical geometry and locale algorithms,shared table and enum;existing Writer pagedesc A4/Letter geometry consumer. Up to15source/test files plus metadata/evidence. Platform paper discovery,PostScript name string owner,printing/device map conversions and Calc style construction remain subsequent real owners. Only calc branch/checkout,no network/global access or merging."
  Plan: "Port original portable paper geometry and locale value algorithms with full86entry ordered enum/table. Native exact dimensions precede rotated recognition;sloppy tolerance and first-match order remain untouched. Reuse genuine shared Locale and o3tl conversion. Existing Writer A4/Letter physical constants derive from this common owner without browser-model duplication. Do not fabricate native printer/platform/config/OString services;omitted APIs explicit. Up to15source/test files plus registry/provenance/docs/evidence. Verify native table fixture,all constructor/matching/tolerance/locale branches,shared changed owners100,all Calc100,related Writer tests,types/source lint/format/static gates,real Chromium/Worker geometry and existing page-style UI acceptance. Archive raw proofs and evaluator;close clean. Full all-app checkpoint60."
  Verify Steps: "Pinned native86entry enum/table numeric fixture and strict44mm100 tolerance;normal-before-rotated,duplicate first-match,sloppy snapping,unknown/custom and original case-sensitive locale countries. All new/changed emitted runtime owners100coverage;all Calc tests/coverage100;related Writer page descriptor/layout/XML/dialog tests. Types,source lint/format,module boundaries,docs,size,tree,resources,provenance,registry,routing,doctor,build/static. Real Chromium/DOM-freeWorker paper geometry and Writer page dialog acceptance. Preserve source/native pins,raw failures/reports and portable audit. EVALUATOR pass and clean task close. Full all-app next60."
  Verification: "Pending implementation and all declared checks."
  Rollback Plan: "Revert only intentional task59 commits after checking source and evidence paths. Preserve task58 complete Calc pool. User handles merges."
  Findings: "Task58 is verified and closed ad9505622894. Next page-style construction consumes absent shared PaperInfo/SvxPaperInfo. Shared86entry portable PaperInfo is the genuine dependency;native system discovery and printer APIs must not be replaced by a browser pseudo-service. Writer currently duplicates physical A4/Letter constants and will consume common geometry."
id_source: "generated"
---
## Summary

Implement shared native paper geometry and reuse Writer page sizes

Block59: original i18nutil Paper enum/table and PaperInfo physical-size,exact/rotated matching,sloppy matching/dimension snapping and locale defaults. Reuse actual Locale and o3tl conversions;derive existing Writer A4/Letter geometry from the shared native owner. Preserve source order,rounding and strict tolerance. Native platform paper discovery,OString PS-name return and printer/map-device services stay explicitly unported;no fake provider. This unblocks Calc page-style construction. Only calc checkout/branch;full all-app checkpoint60.

## Scope

Original i18nutil paper.hxx/paper.cxx portable physical geometry and locale algorithms,shared table and enum;existing Writer pagedesc A4/Letter geometry consumer. Up to15source/test files plus metadata/evidence. Platform paper discovery,PostScript name string owner,printing/device map conversions and Calc style construction remain subsequent real owners. Only calc branch/checkout,no network/global access or merging.

## Plan

Port original portable paper geometry and locale value algorithms with full86entry ordered enum/table. Native exact dimensions precede rotated recognition;sloppy tolerance and first-match order remain untouched. Reuse genuine shared Locale and o3tl conversion. Existing Writer A4/Letter physical constants derive from this common owner without browser-model duplication. Do not fabricate native printer/platform/config/OString services;omitted APIs explicit. Up to15source/test files plus registry/provenance/docs/evidence. Verify native table fixture,all constructor/matching/tolerance/locale branches,shared changed owners100,all Calc100,related Writer tests,types/source lint/format/static gates,real Chromium/Worker geometry and existing page-style UI acceptance. Archive raw proofs and evaluator;close clean. Full all-app checkpoint60.

## Verify Steps

Pinned native86entry enum/table numeric fixture and strict44mm100 tolerance;normal-before-rotated,duplicate first-match,sloppy snapping,unknown/custom and original case-sensitive locale countries. All new/changed emitted runtime owners100coverage;all Calc tests/coverage100;related Writer page descriptor/layout/XML/dialog tests. Types,source lint/format,module boundaries,docs,size,tree,resources,provenance,registry,routing,doctor,build/static. Real Chromium/DOM-freeWorker paper geometry and Writer page dialog acceptance. Preserve source/native pins,raw failures/reports and portable audit. EVALUATOR pass and clean task close. Full all-app next60.

## Verification

Pending implementation and all declared checks.

## Rollback Plan

Revert only intentional task59 commits after checking source and evidence paths. Preserve task58 complete Calc pool. User handles merges.

## Findings

Task58 is verified and closed ad9505622894. Next page-style construction consumes absent shared PaperInfo/SvxPaperInfo. Shared86entry portable PaperInfo is the genuine dependency;native system discovery and printer APIs must not be replaced by a browser pseudo-service. Writer currently duplicates physical A4/Letter constants and will consume common geometry.
