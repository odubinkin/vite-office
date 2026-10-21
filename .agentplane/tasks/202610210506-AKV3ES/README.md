---
id: "202610210506-AKV3ES"
title: "Open ordinary ODS spreadsheets through the Calc file workflow"
status: "DOING"
priority: "high"
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
  updated_at: "2026-10-21T05:07:51.170Z"
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
    body: "Start: reproduce and repair ordinary ODS import routing using the supplied file, preserving existing native document and browser contracts."
events:
  -
    type: "status"
    at: "2026-10-21T05:08:26.864Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: reproduce and repair ordinary ODS import routing using the supplied file, preserving existing native document and browser contracts."
doc_version: 3
doc_updated_at: "2026-10-21T05:21:22.607Z"
doc_updated_by: "CODER"
description: "User reprioritized working Calc UI over generic UNO expansion. Reproduce opening the explicitly authorized Downloads/file_example_ODS_10.ods, fix the actual import blockers through existing upstream owners without alternate workbook models, and verify content, dimensions and browser open behavior. Follow with separate tasks for mouse sizing, native dialog units and formula gaps. Preserve unfinished task AJY2K0 separately. Full suite at block70 then fixes, coverage, final closure and pause remain required."
sections:
  Summary: "Make the user-supplied ordinary ODS open through Calc. The initial read fails on number:date-style in automatic-styles, before actual sheet content is read."
  Scope: "Calc XML automatic style routing, independent import regression tests, user-sample local browser QA and task evidence. Keep native document owners and supported formatting. No generic UNO expansion. No suppression of unsupported cell contents."
  Plan: "Reproduce the supplied real ODS through native import and browser open. Correct style-context routing to the original upstream fallback contract, retaining explicit diagnostics for number formats beyond the current slice and preserving all supported scalar content and formatting. Add independent regression XML and sample-file browser evidence, then all Calc coverage100 and related changed-owner coverage100, lint/types/provenance. Do not expand generic UNO work. Existing AJY2K0 work remains unverified and separate. Next follow-ups cover mouse dimensions, exposed units and formula execution gaps."
  Verify Steps: "The actual authorized file_example_ODS_10.ods opens with 1 sheet and all 10 rows/eight populated columns, original scalar types/text and imported dimensions. Independent metadata routing tests pass, including rejection of unsupported semantic cell content. All Calc tests and raw S/B/F/L coverage remain100; changed owner raw coverage100. Related XML tests pass. Lint/types/provenance/resource checks pass. Browser upload via File menu shows original cells without runtime errors. Record exact commands and remaining unported formatting features."
  Verification: "Partial verification, task remains DOING. Actual original package SHA256 be74bcfeba5fa5bb3cd400c54c6d0d9172074505b80e1a96e32ac08592f43c75 opens in435ms; independent Python XML extraction versus actual ScDocument confirms all80populated scalars. Shared browser file chooser opens it and screenshot shows10rows/eight populated columns,0application errors. Related11XML files/48cases pass;both changed owners raw coverage100 S121/B71/F22/L113. App typecheck,source provenance,module boundaries,Calc resources pass. Size check passes with existing decomposition candidates. Initial JSDoc check found2undocumented test callbacks;comments fixed and final JSDoc/lint rerun is pending. AllCalc586-case profile is still running with unchanged100thresholds; no allCalc acceptance or closure claimed. Previous generic UNO implementation is separately preserved in taskAJY2K0 and remains unverified. Next work focuses on mouse column/row dimensions and formula ranges/functions."
  Rollback Plan: "Revert only this task's source/test changes and retain diagnostic evidence. Do not revert unfinished AJY2K0 work."
  Findings: "Real supplied bytes initially fail on unknown number:date-style; after diagnostic-only omission the next failure is empty office:forms. Production fixes restore metadata style fallback and accept only the empty forms container. Actual controls and unknown sheet semantics remain rejected. Source file opens without byte preprocessing in 435ms with 1 sheet,last ID6548,width1280twips. Browser chooser displays First Name,Dulce,last ID6548 with0 application errors. Original source confirms styles fallback in xmloff/source/style/xmlstyle.cxx and forms dispatch in sc/source/filter/xml/xmltabi.cxx. Number formatter remains unported and dates in this sample are text. Related XML48cases pass;changed owners raw S121/B71/F22/L113 all100. Remaining allCalc/types checks are running;no completion claimed yet. User priorities are mouse geometry, then ranges/functions/dependency formula execution. Existing metric field already accepts explicit1in."
id_source: "generated"
---
## Summary

Make the user-supplied ordinary ODS open through Calc. The initial read fails on number:date-style in automatic-styles, before actual sheet content is read.

## Scope

Calc XML automatic style routing, independent import regression tests, user-sample local browser QA and task evidence. Keep native document owners and supported formatting. No generic UNO expansion. No suppression of unsupported cell contents.

## Plan

Reproduce the supplied real ODS through native import and browser open. Correct style-context routing to the original upstream fallback contract, retaining explicit diagnostics for number formats beyond the current slice and preserving all supported scalar content and formatting. Add independent regression XML and sample-file browser evidence, then all Calc coverage100 and related changed-owner coverage100, lint/types/provenance. Do not expand generic UNO work. Existing AJY2K0 work remains unverified and separate. Next follow-ups cover mouse dimensions, exposed units and formula execution gaps.

## Verify Steps

The actual authorized file_example_ODS_10.ods opens with 1 sheet and all 10 rows/eight populated columns, original scalar types/text and imported dimensions. Independent metadata routing tests pass, including rejection of unsupported semantic cell content. All Calc tests and raw S/B/F/L coverage remain100; changed owner raw coverage100. Related XML tests pass. Lint/types/provenance/resource checks pass. Browser upload via File menu shows original cells without runtime errors. Record exact commands and remaining unported formatting features.

## Verification

Partial verification, task remains DOING. Actual original package SHA256 be74bcfeba5fa5bb3cd400c54c6d0d9172074505b80e1a96e32ac08592f43c75 opens in435ms; independent Python XML extraction versus actual ScDocument confirms all80populated scalars. Shared browser file chooser opens it and screenshot shows10rows/eight populated columns,0application errors. Related11XML files/48cases pass;both changed owners raw coverage100 S121/B71/F22/L113. App typecheck,source provenance,module boundaries,Calc resources pass. Size check passes with existing decomposition candidates. Initial JSDoc check found2undocumented test callbacks;comments fixed and final JSDoc/lint rerun is pending. AllCalc586-case profile is still running with unchanged100thresholds; no allCalc acceptance or closure claimed. Previous generic UNO implementation is separately preserved in taskAJY2K0 and remains unverified. Next work focuses on mouse column/row dimensions and formula ranges/functions.

## Rollback Plan

Revert only this task's source/test changes and retain diagnostic evidence. Do not revert unfinished AJY2K0 work.

## Findings

Real supplied bytes initially fail on unknown number:date-style; after diagnostic-only omission the next failure is empty office:forms. Production fixes restore metadata style fallback and accept only the empty forms container. Actual controls and unknown sheet semantics remain rejected. Source file opens without byte preprocessing in 435ms with 1 sheet,last ID6548,width1280twips. Browser chooser displays First Name,Dulce,last ID6548 with0 application errors. Original source confirms styles fallback in xmloff/source/style/xmlstyle.cxx and forms dispatch in sc/source/filter/xml/xmltabi.cxx. Number formatter remains unported and dates in this sample are text. Related XML48cases pass;changed owners raw S121/B71/F22/L113 all100. Remaining allCalc/types checks are running;no completion claimed yet. User priorities are mouse geometry, then ranges/functions/dependency formula execution. Existing metric field already accepts explicit1in.
