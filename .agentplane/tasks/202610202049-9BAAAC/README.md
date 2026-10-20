---
id: "202610202049-9BAAAC"
title: "Implement native XCS schema parsing and full cadence regression"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-20T20:51:10.248Z"
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
    body: "Start: port approved complete XCS schema parser and actual Common.xcs default tree, then perform tenth-task full regression without weakening strict gates."
events:
  -
    type: "status"
    at: "2026-10-20T20:51:17.730Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port approved complete XCS schema parser and actual Common.xcs default tree, then perform tenth-task full regression without weakening strict gates."
doc_version: 3
doc_updated_at: "2026-10-20T20:51:17.730Z"
doc_updated_by: "CODER"
description: "Continue Writer search configuration with complete native Parser/ParseManager driver, xmldata lexical contracts and XcsParser schema/template/merge behavior; parse actual pinned Common.xcs and run the tenth-task full regression."
sections:
  Summary: "Port the complete original XCS schema/template responsibility family so actual pinned Common.xcs defaults become real configmgr nodes needed by Writer search. Complete the tenth-task full regression without weakening gates."
  Scope: "Only vite-office-writer on writer. Up to 65 non-task paths: actual Parser/ParseManager, xmldata and XcsParser owners; unchanged original Common.xcs asset under officecfg; source-shaped tests including real-schema/default/template/merge/resume/error histories; exact import data and runtime/provenance records; suspected issues; relevant repairs/test evidence for changes since full checkpoint 6a7dd8660 if full regression exposes gaps. No global configuration service/provider/locale default substitute, ICU/network reads, branch merge, publication, exclusions or threshold changes. Parser URL/file mapping takes the existing explicit loaded-byte browser boundary used by actual XmlReader."
  Plan: "1. Inspect pinned parser, parsemanager, xmldata, xcsparser and Common.xcs with existing real Node/Data/ValueParser contracts. 2. Implement original abstract/dispatch/resume/namespace and lexical helpers, complete XcsParser states/attribute handlers/conservative merge, preserving quirks. 3. Bundle unchanged pinned Common.xcs at the matching officecfg path, with source hash/license context, and test actual full schema/defaults plus independent source-derived cases. 4. Run scoped development checks, required static/source registries and full cadence: npm test (application and inventory coverage), npm run test:tooling, npm run test:e2e and npm run test:static, sequential around shared build/browser artifacts. Keep strict gates; address only related in-scope findings with targeted tests/repairs and retain raw failure evidence. 5. Record truthful evidence/review, commit/finish only when declared checks pass, leaving XCU/services/search item and browser UI parent open."
  Verify Steps: "Run focused xmldata, ParseManager and XcsParser tests plus existing configuration/ValueParser/XMLReader suites. Parse the complete unchanged Common.xcs and independently verify complete SearchOptions property/defaults, ordinary/localized types and template/group/set nodes; verify source hashes and retained license. Test type namespace grammar, strict schema booleans, template references/clones, duplicates, layer/finalized gates, extensible-only conservative merge, ignored/description states, empty schemas and ParseManager false/resume/exception timing. Run build, changed Prettier/ESLint, dependencies, source-provenance/tree/docs/file-size, writer/shared inventories, doctor, policy routing, diff/status. Run exact-edge boundary tooling when import data changes. Full cadence task10: npm test; npm run test:tooling; npm run test:e2e; npm run test:static. Do not overlap rebuild/static mutations with browser runs. Preserve strict coverage thresholds and all existing tests; if full evidence fails, keep task open and repair related gaps without invented native behaviors. No claim to compiled complete native service/ABI or whole Writer fidelity."
  Verification: "Pending implementation, targeted checks and the tenth-task full regression."
  Rollback Plan: "Revert only this XCS schema/parser leaf and related repairs/assets/registry changes. Preserve previous real value parser/search work, task history and user files; no destructive checkout or merge."
  Findings: "Nine tasks have completed since full checkpoint 6a7dd8660, including generated task-subject closure commits that a close-only log grep would miss. Full canonical npm test includes strict100 percent application and inventory coverage; no exclusions/threshold changes are authorized. XcsParser source ignores desc nodes even while collecting info text, allows ignored markup at illegal places and conservatively retains existing property values during merges; preserve these source contracts and document suspicious findings. Existing local LibreOffice read approval covers Common.xcs; ICU/network remain unapproved and unused."
id_source: "generated"
---
## Summary

Port the complete original XCS schema/template responsibility family so actual pinned Common.xcs defaults become real configmgr nodes needed by Writer search. Complete the tenth-task full regression without weakening gates.

## Scope

Only vite-office-writer on writer. Up to 65 non-task paths: actual Parser/ParseManager, xmldata and XcsParser owners; unchanged original Common.xcs asset under officecfg; source-shaped tests including real-schema/default/template/merge/resume/error histories; exact import data and runtime/provenance records; suspected issues; relevant repairs/test evidence for changes since full checkpoint 6a7dd8660 if full regression exposes gaps. No global configuration service/provider/locale default substitute, ICU/network reads, branch merge, publication, exclusions or threshold changes. Parser URL/file mapping takes the existing explicit loaded-byte browser boundary used by actual XmlReader.

## Plan

1. Inspect pinned parser, parsemanager, xmldata, xcsparser and Common.xcs with existing real Node/Data/ValueParser contracts. 2. Implement original abstract/dispatch/resume/namespace and lexical helpers, complete XcsParser states/attribute handlers/conservative merge, preserving quirks. 3. Bundle unchanged pinned Common.xcs at the matching officecfg path, with source hash/license context, and test actual full schema/defaults plus independent source-derived cases. 4. Run scoped development checks, required static/source registries and full cadence: npm test (application and inventory coverage), npm run test:tooling, npm run test:e2e and npm run test:static, sequential around shared build/browser artifacts. Keep strict gates; address only related in-scope findings with targeted tests/repairs and retain raw failure evidence. 5. Record truthful evidence/review, commit/finish only when declared checks pass, leaving XCU/services/search item and browser UI parent open.

## Verify Steps

Run focused xmldata, ParseManager and XcsParser tests plus existing configuration/ValueParser/XMLReader suites. Parse the complete unchanged Common.xcs and independently verify complete SearchOptions property/defaults, ordinary/localized types and template/group/set nodes; verify source hashes and retained license. Test type namespace grammar, strict schema booleans, template references/clones, duplicates, layer/finalized gates, extensible-only conservative merge, ignored/description states, empty schemas and ParseManager false/resume/exception timing. Run build, changed Prettier/ESLint, dependencies, source-provenance/tree/docs/file-size, writer/shared inventories, doctor, policy routing, diff/status. Run exact-edge boundary tooling when import data changes. Full cadence task10: npm test; npm run test:tooling; npm run test:e2e; npm run test:static. Do not overlap rebuild/static mutations with browser runs. Preserve strict coverage thresholds and all existing tests; if full evidence fails, keep task open and repair related gaps without invented native behaviors. No claim to compiled complete native service/ABI or whole Writer fidelity.

## Verification

Pending implementation, targeted checks and the tenth-task full regression.

## Rollback Plan

Revert only this XCS schema/parser leaf and related repairs/assets/registry changes. Preserve previous real value parser/search work, task history and user files; no destructive checkout or merge.

## Findings

Nine tasks have completed since full checkpoint 6a7dd8660, including generated task-subject closure commits that a close-only log grep would miss. Full canonical npm test includes strict100 percent application and inventory coverage; no exclusions/threshold changes are authorized. XcsParser source ignores desc nodes even while collecting info text, allows ignored markup at illegal places and conservatively retains existing property values during merges; preserve these source contracts and document suspicious findings. Existing local LibreOffice read approval covers Common.xcs; ICU/network remain unapproved and unused.
