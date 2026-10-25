---
id: "202610251549-R2DJ64"
title: "Implement shared OOXML package relationships and filter infrastructure"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "ooxml"
verify:
  - "Focused OOXML package, ZIP, SAX and filter-routing tests; typecheck and relevant repository quality gates; doctor and routing."
plan_approval:
  state: "approved"
  updated_at: "2026-10-25T15:51:20.234Z"
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
    body: "Start: Implement the approved shared OOXML package and fragment contracts from the local pinned LibreOffice source, with focused tests and unchanged product storage behavior."
events:
  -
    type: "status"
    at: "2026-10-25T15:51:20.681Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement the approved shared OOXML package and fragment contracts from the local pinned LibreOffice source, with focused tests and unchanged product storage behavior."
doc_version: 3
doc_updated_at: "2026-10-25T15:51:20.681Z"
doc_updated_by: "CODER"
description: "User-approved first of three cohesive OOXML tasks. Implement upstream-owned OPC storage, content types, relationships, XML fragment import/export and format identities for Writer DOCX and Calc XLSX using existing ZIP/SAX and medium contracts. Preserve browser persistence decisions. Local pinned source research only; related tests and integration gates; no full suite due after SWRD7X checkpoint."
sections:
  Summary: |-
    Implement shared OOXML package relationships and filter infrastructure

    User-approved first of three cohesive OOXML tasks. Implement upstream-owned OPC storage, content types, relationships, XML fragment import/export and format identities for Writer DOCX and Calc XLSX using existing ZIP/SAX and medium contracts. Preserve browser persistence decisions. Local pinned source research only; related tests and integration gates; no full suite due after SWRD7X checkpoint.
  Scope: "Implement oox/source/core/{relations,relationshandler,fragmenthandler,xmlfilterbase}.ts, oox/source/helper/zipstorage.ts, comphelper/source/xml/ofopxmlhelper.ts and native package content-type responsibilities if required. Reuse ZIP and SAX infrastructure; update the dependency graph and paired shared registry records. Include related colocated tests, upstream fixture tests and shared suspected-issue evidence in the two user-requested issue documents when relevant. Approximately 8 production modules plus paired records and tests. No app feature/UI changes in this prerequisite; Writer/Calc integration follows in V4DQJW/J0Z0KF. No network, recovery, autosave, release or publication changes."
  Plan: "1. Compare pinned Relations, RelationsFragment, XmlFilterBase, ZipStorage, OFOPXMLHelper and ZipPackage contracts. 2. Translate the consumed package and XML-context responsibilities, preserving native first-ID ordering, type comparison, relative paths, optional fragment handling, output content types and relationship ownership. 3. Add real package roundtrips and pinned DOCX/XLSX package tests, including errors and strict/transitional relationships. 4. Update source ownership evidence, run scoped verification, record results and close locally. User approved all three tasks in chat on 2026-10-25. CODER owns implementation and verification; self-activate roles sequentially."
  Verify Steps: "Run npm run test:shared -- src/oox src/comphelper/source/xml/ofopxmlhelper.test.ts src/package/source/zipapi/ZipFile.test.ts src/sax/source/fastparser/fastparser.test.ts. Require tests for native sorted-ID/duplicate/type/relative-target contracts, missing/malformed fragments, caching, root and part relations, strict/transitional input and actual pinned DOCX/XLSX ZIP packages plus export/reopen and XML escaping. Measure new executable modules with unchanged 100% scoped coverage thresholds. Run npm run typecheck, scoped eslint/prettier, npm run build, npm run check:dependencies, npm run check:docs, npm run check:file-size, npm run check:source-tree, npm run check:source-provenance, npm run inventory:registry:build, npm run inventory:invariants, npm run inventory:parity, node scripts/check-static-build.mjs, ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check. Full suite is not due: first task after the SWRD7X full checkpoint."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: "Preflight: clean main at 95c155081; direct mode; local pinned LibreOffice baseline 9bc445578031fecf56086729d8e4940c77e14d65. Existing ZIP32/SAX can be reused. Native imports use ZIP storage independent of ODF manifests. RelationsFragment ignores incomplete entries, retains the first duplicate ID and treats any non-Internal TargetMode as external. Relations traverses std::map lexical ID order and uses ASCII-only case folding. Preserve these contracts. No code has been implemented or verified yet."
id_source: "generated"
---
## Summary

Implement shared OOXML package relationships and filter infrastructure

User-approved first of three cohesive OOXML tasks. Implement upstream-owned OPC storage, content types, relationships, XML fragment import/export and format identities for Writer DOCX and Calc XLSX using existing ZIP/SAX and medium contracts. Preserve browser persistence decisions. Local pinned source research only; related tests and integration gates; no full suite due after SWRD7X checkpoint.

## Scope

Implement oox/source/core/{relations,relationshandler,fragmenthandler,xmlfilterbase}.ts, oox/source/helper/zipstorage.ts, comphelper/source/xml/ofopxmlhelper.ts and native package content-type responsibilities if required. Reuse ZIP and SAX infrastructure; update the dependency graph and paired shared registry records. Include related colocated tests, upstream fixture tests and shared suspected-issue evidence in the two user-requested issue documents when relevant. Approximately 8 production modules plus paired records and tests. No app feature/UI changes in this prerequisite; Writer/Calc integration follows in V4DQJW/J0Z0KF. No network, recovery, autosave, release or publication changes.

## Plan

1. Compare pinned Relations, RelationsFragment, XmlFilterBase, ZipStorage, OFOPXMLHelper and ZipPackage contracts. 2. Translate the consumed package and XML-context responsibilities, preserving native first-ID ordering, type comparison, relative paths, optional fragment handling, output content types and relationship ownership. 3. Add real package roundtrips and pinned DOCX/XLSX package tests, including errors and strict/transitional relationships. 4. Update source ownership evidence, run scoped verification, record results and close locally. User approved all three tasks in chat on 2026-10-25. CODER owns implementation and verification; self-activate roles sequentially.

## Verify Steps

Run npm run test:shared -- src/oox src/comphelper/source/xml/ofopxmlhelper.test.ts src/package/source/zipapi/ZipFile.test.ts src/sax/source/fastparser/fastparser.test.ts. Require tests for native sorted-ID/duplicate/type/relative-target contracts, missing/malformed fragments, caching, root and part relations, strict/transitional input and actual pinned DOCX/XLSX ZIP packages plus export/reopen and XML escaping. Measure new executable modules with unchanged 100% scoped coverage thresholds. Run npm run typecheck, scoped eslint/prettier, npm run build, npm run check:dependencies, npm run check:docs, npm run check:file-size, npm run check:source-tree, npm run check:source-provenance, npm run inventory:registry:build, npm run inventory:invariants, npm run inventory:parity, node scripts/check-static-build.mjs, ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check. Full suite is not due: first task after the SWRD7X full checkpoint.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Preflight: clean main at 95c155081; direct mode; local pinned LibreOffice baseline 9bc445578031fecf56086729d8e4940c77e14d65. Existing ZIP32/SAX can be reused. Native imports use ZIP storage independent of ODF manifests. RelationsFragment ignores incomplete entries, retains the first duplicate ID and treats any non-Internal TargetMode as external. Relations traverses std::map lexical ID order and uses ASCII-only case folding. Preserve these contracts. No code has been implemented or verified yet.
