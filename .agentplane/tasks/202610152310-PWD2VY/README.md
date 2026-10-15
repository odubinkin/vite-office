---
id: "202610152310-PWD2VY"
title: "Implement native shared plain manifest import and migrate Writer package reading"
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
  updated_at: "2026-10-15T23:12:08.682Z"
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
    body: "Start: implement the approved shared plain manifest reading stack and thin native SAL entry points;replace Writer-only shared parsing and preserve original package/optional-stream behavior with source-backed tests."
events:
  -
    type: "status"
    at: "2026-10-15T23:12:15.782Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved shared plain manifest reading stack and thin native SAL entry points;replace Writer-only shared parsing and preserve original package/optional-stream behavior with source-backed tests."
doc_version: 3
doc_updated_at: "2026-10-15T23:12:15.782Z"
doc_updated_by: "CODER"
description: "Task178: actual plain ManifestImport/ManifestReader over PropertyValue and namespace stack;reuse SAL integer parser through missing native OUString/C terminated wrappers;remove duplicated Writer-only shared parser and migrate Writer with native missing-stream behavior and source-backed package metadata policy. ODS kernel/document remains pending."
sections:
  Summary: "Task178 implements real shared plain ManifestImport/ManifestReader property sequences and namespace stack,then replaces duplicated Writer-only manifest parsing and restores native absent-stream behavior. Required by the shared ODS read path;no spreadsheet document facade."
  Scope: "Shared package ManifestImport/Reader/constants and bounded plain package metadata/consistency payload responsibilities;existing SAL OUString/C terminated signed64 wrappers reuse existing strtmpl parser without algorithm duplication;Writer reader/import coordinator and related tests;runtime/provenance/capabilities/readiness/suspected source cases. Maximum80non-task files. Remove old shared Writer-only validator rather than preserve duplicate parser/compatibility aliases. Existing ZIP32/declaration/depth/XML-stream limits remain explicit browser admission bounds. No crypto algorithm/key storage,legacy DTD resolution,recovery engine,full UNO service/stream classes,native compiler/memory framework or all-app run."
  Plan: "Implement original plain manifest namespace/validity stack and fixed PropertyValue slots,plus native reader error-result behavior over existing SAX binding. Reuse existing SAL signed64 conversion through missing thin terminated C/OUString entry points. Add shared source-backed plain package metadata application/MIME/consistency projection over real ZipFile,without inventing ZipPackage services. Migrate Writer from the retired shared ODT validator to shared manifest/package metadata and native absent-stream early returns with real SwDoc defaults. Preserve original suspicious cases,API/source boundaries and JS GC;update truthful inventory. Verify native source maps and existing algorithm identities,portable related/Calc strict100,13gates,build and real Chromium/Worker;review/close only after evidence while actual Calc document/UI/ODS goal stays active."
  Verify Steps: "Pin original ManifestImport/Reader/constants,ZipPackage/ZipPackageFolder,SwXMLReader,OUString/C/strtmpl definitions and actual package fixture/QA. Test actual PropertyValue/Any,AttributeList and SAX namespace/validity stack,default/missing attributes,first-entry version fallback,int64 Size,unknown/nested elements,mismatched end guard,native parse-failure empty result,unsupported encryption/declaration/depth admission. Test source-backed plain package MIME fallback/conflict,duplicate metadata and ODF12 consistency using actual ZipFile;preserve suspicious original folder/namespace/parent behavior and document limits. Writer must reuse this shared path and skip absent streams through actual SwDoc defaults,without dummy XML/document objects. Related Writer round trips/fonts/worker/missing-stream cases plus whole Calc;exact measured shared executable raw S/B/F/L100,Writer-only coverage gaps exempt.13source gates,production build,actual shared Chromium/main-and-DOM-free-Worker reading and1Writer startup/load/edit;four references absent at runtime/restored. No broad whole-module parity or full ODS model/UI claim."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert task178 commits only,preserving calc branch,unrelated work and native links. No merges,history rewriting,gate weakening or other-branch Writer-only coverage repairs."
  Findings: ""
id_source: "generated"
---
## Summary

Task178 implements real shared plain ManifestImport/ManifestReader property sequences and namespace stack,then replaces duplicated Writer-only manifest parsing and restores native absent-stream behavior. Required by the shared ODS read path;no spreadsheet document facade.

## Scope

Shared package ManifestImport/Reader/constants and bounded plain package metadata/consistency payload responsibilities;existing SAL OUString/C terminated signed64 wrappers reuse existing strtmpl parser without algorithm duplication;Writer reader/import coordinator and related tests;runtime/provenance/capabilities/readiness/suspected source cases. Maximum80non-task files. Remove old shared Writer-only validator rather than preserve duplicate parser/compatibility aliases. Existing ZIP32/declaration/depth/XML-stream limits remain explicit browser admission bounds. No crypto algorithm/key storage,legacy DTD resolution,recovery engine,full UNO service/stream classes,native compiler/memory framework or all-app run.

## Plan

Implement original plain manifest namespace/validity stack and fixed PropertyValue slots,plus native reader error-result behavior over existing SAX binding. Reuse existing SAL signed64 conversion through missing thin terminated C/OUString entry points. Add shared source-backed plain package metadata application/MIME/consistency projection over real ZipFile,without inventing ZipPackage services. Migrate Writer from the retired shared ODT validator to shared manifest/package metadata and native absent-stream early returns with real SwDoc defaults. Preserve original suspicious cases,API/source boundaries and JS GC;update truthful inventory. Verify native source maps and existing algorithm identities,portable related/Calc strict100,13gates,build and real Chromium/Worker;review/close only after evidence while actual Calc document/UI/ODS goal stays active.

## Verify Steps

Pin original ManifestImport/Reader/constants,ZipPackage/ZipPackageFolder,SwXMLReader,OUString/C/strtmpl definitions and actual package fixture/QA. Test actual PropertyValue/Any,AttributeList and SAX namespace/validity stack,default/missing attributes,first-entry version fallback,int64 Size,unknown/nested elements,mismatched end guard,native parse-failure empty result,unsupported encryption/declaration/depth admission. Test source-backed plain package MIME fallback/conflict,duplicate metadata and ODF12 consistency using actual ZipFile;preserve suspicious original folder/namespace/parent behavior and document limits. Writer must reuse this shared path and skip absent streams through actual SwDoc defaults,without dummy XML/document objects. Related Writer round trips/fonts/worker/missing-stream cases plus whole Calc;exact measured shared executable raw S/B/F/L100,Writer-only coverage gaps exempt.13source gates,production build,actual shared Chromium/main-and-DOM-free-Worker reading and1Writer startup/load/edit;four references absent at runtime/restored. No broad whole-module parity or full ODS model/UI claim.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert task178 commits only,preserving calc branch,unrelated work and native links. No merges,history rewriting,gate weakening or other-branch Writer-only coverage repairs.

## Findings
