---
id: "202610181411-WFPT6E"
title: "Read and write basic ODS on the actual Calc document"
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
  updated_at: "2026-10-18T14:14:35.163Z"
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
    body: "Start: implement basic same-model ODS content filters through native Calc owners and shared ZIP/XML/manifest services;no UI or alternate document model."
events:
  -
    type: "status"
    at: "2026-10-18T14:14:35.559Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement basic same-model ODS content filters through native Calc owners and shared ZIP/XML/manifest services;no UI or alternate document model."
doc_version: 3
doc_updated_at: "2026-10-18T14:14:35.559Z"
doc_updated_by: "CODER"
description: "Task204: implement Calc XML/package import/export of scalar cells and supported ODFF formulas on the actual ScDocument,using existing shared ZIP/manifest/SAX/XML services. Add necessary namespace-resolved formula-value binding and scalar ODF tokens to shared XML owners. Preserve native defaults,repeat and sparse semantics;no alternate document model,UI,locale or style-engine detour."
sections:
  Summary: "Task204 connects basic ODS content import/export to the existing ScDocument and typed cells,using existing common ZIP,manifest,SAX/XML,number and string owners. No UI is implemented."
  Scope: "Calc native owners: sc/inc/documentimport.ts and core/data/documentimport.ts scalar/string/formula setters;filter/xml/xmlwrap.ts package composition,xmlimprt.ts root/import grammar owner,xmlbodyi.ts spreadsheet context,xmltabi.ts sheet context,xmlrowi.ts row/repeat context,xmlcelli.ts scalar/formula cell context,xmltextp.ts simple paragraph context,and xmlexprt.ts actual document/row-major export. Namespace-resolved attributes use the current SAX namespace binding through shared xmloff FastAttributeList;append scalar formula/value tokens without renumbering old tokens. Reuse shared ZIP/manifest/native PropertyValue composition;factor Writer private manifest-property helper into common ManifestWriter and import it unchanged from Writer. Necessary native module-boundary edges may be added only with pinned source/dependency proof and matching guard tests,not bypassed. Supported content:valid sheet names,numeric float values,literal simple text,existing same-sheet ODFF formulas,scalar/empty repeats,sparse coordinates,namespace aliases and empty sheets. Native defaults include nonfinite/missing numeric values zero and repeat count at least1. Full style/format/layout,rich text,matrix/group/external/legacy grammar,complex objects and complete native constructor/shell services remain explicitly unimplemented;applied unsupported content must reject or issue concrete diagnostics,not masquerade as lossless full-file parity. Repeated formulas,complex cell types and merged content are explicit unsupported boundaries until their actual native services exist. Shared resource/cancellation ceilings remain enforced;expanded data is bounded. Paired inventory/provenance/capabilities/readiness/journal and focused tests including affected Writer package behavior. No source copies,C++ execution,memory manager,network,UI or recovery."
  Plan: "1. Audit pinned Calc XML import/default/namespace/repeat and export/package owners,plus real shared XML/ZIP/manifest APIs. 2. Implement source-shaped Calc contexts directly mutating the real document through scalar ScDocumentImport,and actual row-major ODS export using native formula serialization;reuse common infrastructure and expose unsupported format diagnostics. 3. Test independent ODF inputs,namespace rebinding,repeats,sparse/multiple/empty sheets,numeric/text/formula edit-save-reload,resource/error boundaries and actual Chromium/Worker bytes. 4. Update inventory and run whole Calc strict raw100,changed shared strict raw100 and related Writer/XML/ZIP tests,existing source gates and source/path/hash audits;commit and same-agent review. 5. Assess minimum UI handoff and basic ODS evidence;only after that milestone run one all-app verification and pause the goal as requested."
  Verify Steps: |-
    node output/playwright/task204-checks/source-audit.mjs: pinned native import/export/default/namespace/repeat/package responsibilities and shared factor proof,no native compilation.
    node output/playwright/task204-checks/portable.mjs: whole Calc strict raw S/B/F/L100 exact owners,changed shared owners every raw counter positive and related XML/manifest/ZIP/Writer package consumers;Writer-only coverage gaps exempt;all5native source links absent/restored.
    node output/playwright/task204-checks/browser-portable.mjs: build and real ODS import/edit/save/reload in Chromium and DOM-free Worker,without native source references.
    node output/playwright/task204-checks/source-gates.mjs: all13existing format/lint/types/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff/boundary gates,no threshold or guard bypass. Native dependency expansion only as documented in Scope.
    Final exact path/hash/reference/coverage audit,record verification/source commit/same-agent quality review. Minimum readiness assessment must distinguish basic supported content from full ODF/UI parity. Full all-app run and requested pause follow the actual milestone,not an arbitrary task number.
  Verification: "Pending approved implementation and declared checks."
  Rollback Plan: "Revert only task204 implementation and paired records. Preserve task203 traversal,task202 serialization and existing user changes;no branch integration."
  Findings: "Prior goal turn completed task203 atad5b8b305819/close4485629027f6 and is progress. Standing user authorization covers minimal canonical core/basic ODS,shared-module corrections and Writer adjustments needed for canonical reuse. The full language/core parity detour remains deferred. Shared SAX namespace scopes already exist in native JS parser state;passing that actual binding avoids porting a second namespace-scope engine. Existing real PropertyValue/manifest/ZIP owners will be reused."
id_source: "generated"
---
## Summary

Task204 connects basic ODS content import/export to the existing ScDocument and typed cells,using existing common ZIP,manifest,SAX/XML,number and string owners. No UI is implemented.

## Scope

Calc native owners: sc/inc/documentimport.ts and core/data/documentimport.ts scalar/string/formula setters;filter/xml/xmlwrap.ts package composition,xmlimprt.ts root/import grammar owner,xmlbodyi.ts spreadsheet context,xmltabi.ts sheet context,xmlrowi.ts row/repeat context,xmlcelli.ts scalar/formula cell context,xmltextp.ts simple paragraph context,and xmlexprt.ts actual document/row-major export. Namespace-resolved attributes use the current SAX namespace binding through shared xmloff FastAttributeList;append scalar formula/value tokens without renumbering old tokens. Reuse shared ZIP/manifest/native PropertyValue composition;factor Writer private manifest-property helper into common ManifestWriter and import it unchanged from Writer. Necessary native module-boundary edges may be added only with pinned source/dependency proof and matching guard tests,not bypassed. Supported content:valid sheet names,numeric float values,literal simple text,existing same-sheet ODFF formulas,scalar/empty repeats,sparse coordinates,namespace aliases and empty sheets. Native defaults include nonfinite/missing numeric values zero and repeat count at least1. Full style/format/layout,rich text,matrix/group/external/legacy grammar,complex objects and complete native constructor/shell services remain explicitly unimplemented;applied unsupported content must reject or issue concrete diagnostics,not masquerade as lossless full-file parity. Repeated formulas,complex cell types and merged content are explicit unsupported boundaries until their actual native services exist. Shared resource/cancellation ceilings remain enforced;expanded data is bounded. Paired inventory/provenance/capabilities/readiness/journal and focused tests including affected Writer package behavior. No source copies,C++ execution,memory manager,network,UI or recovery.

## Plan

1. Audit pinned Calc XML import/default/namespace/repeat and export/package owners,plus real shared XML/ZIP/manifest APIs. 2. Implement source-shaped Calc contexts directly mutating the real document through scalar ScDocumentImport,and actual row-major ODS export using native formula serialization;reuse common infrastructure and expose unsupported format diagnostics. 3. Test independent ODF inputs,namespace rebinding,repeats,sparse/multiple/empty sheets,numeric/text/formula edit-save-reload,resource/error boundaries and actual Chromium/Worker bytes. 4. Update inventory and run whole Calc strict raw100,changed shared strict raw100 and related Writer/XML/ZIP tests,existing source gates and source/path/hash audits;commit and same-agent review. 5. Assess minimum UI handoff and basic ODS evidence;only after that milestone run one all-app verification and pause the goal as requested.

## Verify Steps

node output/playwright/task204-checks/source-audit.mjs: pinned native import/export/default/namespace/repeat/package responsibilities and shared factor proof,no native compilation.
node output/playwright/task204-checks/portable.mjs: whole Calc strict raw S/B/F/L100 exact owners,changed shared owners every raw counter positive and related XML/manifest/ZIP/Writer package consumers;Writer-only coverage gaps exempt;all5native source links absent/restored.
node output/playwright/task204-checks/browser-portable.mjs: build and real ODS import/edit/save/reload in Chromium and DOM-free Worker,without native source references.
node output/playwright/task204-checks/source-gates.mjs: all13existing format/lint/types/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff/boundary gates,no threshold or guard bypass. Native dependency expansion only as documented in Scope.
Final exact path/hash/reference/coverage audit,record verification/source commit/same-agent quality review. Minimum readiness assessment must distinguish basic supported content from full ODF/UI parity. Full all-app run and requested pause follow the actual milestone,not an arbitrary task number.

## Verification

Pending approved implementation and declared checks.

## Rollback Plan

Revert only task204 implementation and paired records. Preserve task203 traversal,task202 serialization and existing user changes;no branch integration.

## Findings

Prior goal turn completed task203 atad5b8b305819/close4485629027f6 and is progress. Standing user authorization covers minimal canonical core/basic ODS,shared-module corrections and Writer adjustments needed for canonical reuse. The full language/core parity detour remains deferred. Shared SAX namespace scopes already exist in native JS parser state;passing that actual binding avoids porting a second namespace-scope engine. Existing real PropertyValue/manifest/ZIP owners will be reused.
