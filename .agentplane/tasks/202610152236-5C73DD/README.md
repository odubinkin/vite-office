---
id: "202610152236-5C73DD"
title: "Implement shared ODF manifest export for Writer and Calc packages"
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
  updated_at: "2026-10-15T22:37:48.249Z"
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
    body: "Start: implement the approved shared plain-ODF manifest exporter and actual SAX attribute values,then migrate Writer and verify ODS manifest streams without a fabricated spreadsheet model."
events:
  -
    type: "status"
    at: "2026-10-15T22:37:53.485Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved shared plain-ODF manifest exporter and actual SAX attribute values,then migrate Writer and verify ODS manifest streams without a fabricated spreadsheet model."
doc_version: 3
doc_updated_at: "2026-10-15T22:37:53.485Z"
doc_updated_by: "CODER"
description: "Task177: replace Writer-specific manifest serialization with native PropertyValue sequence ManifestExport using shared SAX attributes and browser document handler. Reuse for Writer ODT and verify ODS MIME/entries without a fake Calc document; encrypted and legacy package branches remain explicitly outside this plain ODF scope."
sections:
  Summary: "Task177 replaces hardcoded Writer manifest export with shared native PropertyValue-sequence ManifestExport for ordinary unencrypted OASIS document packages,including ODT and ODS."
  Scope: "Actual ManifestExport nonencrypted OASIS branch;reused PropertyValue/Any/OUString;canonical comphelper AttributeList plus erased SAX attribute/document contracts and worker-safe browser handler;Writer export migration;tests/Chromium;runtime/provenance/capability/readiness and source suspicions. Maximum45non-task paths. Existing Writer-specific import validator stays explicitly bounded pending native ManifestImport;no claim of ODS document import/export or connected UI. No encryption algorithms,legacy DTD export,native lifetime engine or all-app run."
  Plan: "Implement native comphelper AttributeList and borrowed SAX contracts;translate ordinary OASIS ManifestExport PropertyValue loops and attribute/event order,using worker-safe browser SAX serialization at the host boundary. Reject unsupported legacy/encrypted admission before output instead of silently discarding. Build actual Writer property sequences in its filter and remove Writer-only export assumptions from shared manifest owner. Verify ODT and ODS manifest events/semantic XML,actual shared values and Writer round trips,strict coverage/source/browser gates,truthful inventory and close task with full Calc model/ODS goal pending."
  Verify Steps: "Pin ManifestExport.cxx/hxx,ManifestDefines.hxx,AttributeList source/header,SAX IDLs and actual package QA evidence. Verify real PropertyValue/Any sequences and AttributeList copy/mutation/default/order semantics,all supported OASIS MIME/version decisions,attribute source order,root detection,Size int64 and unknown properties. Verify worker-safe handler escaping with actual SAX parser and Chromium. Migrate Writer actual ODT writer to same exporter;related Writer round trips/embedded fonts/export worker tests and targeted Writer browser startup/load/edit must pass. Whole Calc and exact changed shared executable owner raw S/B/F/L100;Writer-only coverage gaps exempt.13source gates,production build and shared manifest browser. Four reference links absent at runtime/restored. Unsupported encrypted/legacy branches remain explicit admission limits;no fake Calc document or broad parity."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert task177 commits only;preserve calc branch,unrelated work and native links. No merges,history rewriting or gate/coverage weakening."
  Findings: ""
id_source: "generated"
---
## Summary

Task177 replaces hardcoded Writer manifest export with shared native PropertyValue-sequence ManifestExport for ordinary unencrypted OASIS document packages,including ODT and ODS.

## Scope

Actual ManifestExport nonencrypted OASIS branch;reused PropertyValue/Any/OUString;canonical comphelper AttributeList plus erased SAX attribute/document contracts and worker-safe browser handler;Writer export migration;tests/Chromium;runtime/provenance/capability/readiness and source suspicions. Maximum45non-task paths. Existing Writer-specific import validator stays explicitly bounded pending native ManifestImport;no claim of ODS document import/export or connected UI. No encryption algorithms,legacy DTD export,native lifetime engine or all-app run.

## Plan

Implement native comphelper AttributeList and borrowed SAX contracts;translate ordinary OASIS ManifestExport PropertyValue loops and attribute/event order,using worker-safe browser SAX serialization at the host boundary. Reject unsupported legacy/encrypted admission before output instead of silently discarding. Build actual Writer property sequences in its filter and remove Writer-only export assumptions from shared manifest owner. Verify ODT and ODS manifest events/semantic XML,actual shared values and Writer round trips,strict coverage/source/browser gates,truthful inventory and close task with full Calc model/ODS goal pending.

## Verify Steps

Pin ManifestExport.cxx/hxx,ManifestDefines.hxx,AttributeList source/header,SAX IDLs and actual package QA evidence. Verify real PropertyValue/Any sequences and AttributeList copy/mutation/default/order semantics,all supported OASIS MIME/version decisions,attribute source order,root detection,Size int64 and unknown properties. Verify worker-safe handler escaping with actual SAX parser and Chromium. Migrate Writer actual ODT writer to same exporter;related Writer round trips/embedded fonts/export worker tests and targeted Writer browser startup/load/edit must pass. Whole Calc and exact changed shared executable owner raw S/B/F/L100;Writer-only coverage gaps exempt.13source gates,production build and shared manifest browser. Four reference links absent at runtime/restored. Unsupported encrypted/legacy branches remain explicit admission limits;no fake Calc document or broad parity.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert task177 commits only;preserve calc branch,unrelated work and native links. No merges,history rewriting or gate/coverage weakening.

## Findings
