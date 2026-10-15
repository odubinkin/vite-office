---
id: "202610152236-5C73DD"
title: "Implement shared ODF manifest export for Writer and Calc packages"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 21
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T22:54:37.907Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-15T23:02:25.090Z"
  updated_by: "CODER"
  note: "Command:native-audit.mjs,portable.mjs,source-gates.mjs,build-browser-portable.mjs,final-audit.mjs under output/playwright/task177-checks. Result:pass. Evidence:78related/11files,187Calc/76files;exact5shared raw S252/B90/F45/L224 and33Calc S4179/B2731/F821/L3727 every counter positive100;one Writer-only docsh coverage gap exempt.13gates,build,actual shared Chromium plus dedicated DOM-free Worker identical XML,and Writer startup/load/edit.16pinned original blobs,16MIME literals,40existing algorithms unchanged except declared Writer call,66436source-derived native-JS UTF16 cases;guard algorithm unchanged outside original edge metadata. Scope:plain OASIS PropertyValue-sequence export,AttributeList,JS SAX payload/composition and Writer migration.4refs absent at runtime/restored;51paths within55. CALC161 preserved. No full all-app run;generic ManifestImport,Calc document/UI/same-model ODS remain pending."
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
  -
    type: "verify"
    at: "2026-10-15T23:02:25.090Z"
    author: "CODER"
    state: "ok"
    note: "Command:native-audit.mjs,portable.mjs,source-gates.mjs,build-browser-portable.mjs,final-audit.mjs under output/playwright/task177-checks. Result:pass. Evidence:78related/11files,187Calc/76files;exact5shared raw S252/B90/F45/L224 and33Calc S4179/B2731/F821/L3727 every counter positive100;one Writer-only docsh coverage gap exempt.13gates,build,actual shared Chromium plus dedicated DOM-free Worker identical XML,and Writer startup/load/edit.16pinned original blobs,16MIME literals,40existing algorithms unchanged except declared Writer call,66436source-derived native-JS UTF16 cases;guard algorithm unchanged outside original edge metadata. Scope:plain OASIS PropertyValue-sequence export,AttributeList,JS SAX payload/composition and Writer migration.4refs absent at runtime/restored;51paths within55. CALC161 preserved. No full all-app run;generic ManifestImport,Calc document/UI/same-model ODS remain pending."
doc_version: 3
doc_updated_at: "2026-10-15T23:02:25.152Z"
doc_updated_by: "CODER"
description: "Task177: replace Writer-specific manifest serialization with native PropertyValue sequence ManifestExport using shared SAX attributes and browser document handler. Reuse for Writer ODT and verify ODS MIME/entries without a fake Calc document; encrypted and legacy package branches remain explicitly outside this plain ODF scope."
sections:
  Summary: "Task177 replaces hardcoded Writer manifest export with shared native PropertyValue-sequence ManifestExport for ordinary unencrypted OASIS document packages,including ODT and ODS."
  Scope: "Actual ManifestExport nonencrypted OASIS branch;reused PropertyValue/Any/OUString;canonical comphelper AttributeList plus erased SAX contracts;platform-neutral JS string output/composition bindings in source SAX/package responsibilities;Writer export migration;tests/Chromium;runtime/provenance/capability/readiness/source suspicions. Maximum55non-task paths includes five existing Writer capability marker repairs and source-backed dependency-edge metadata only;guard algorithms and core-to-browser prohibitions remain unchanged. Existing Writer import validator stays bounded pending native ManifestImport;no ODS document/model/UI claim. No encryption algorithms,legacy DTD export,lifetime framework or all-app run."
  Plan: "Implement native comphelper AttributeList and borrowed SAX contracts;translate ordinary OASIS ManifestExport PropertyValue loops and attribute/event order,using worker-safe browser SAX serialization at the host boundary. Reject unsupported legacy/encrypted admission before output instead of silently discarding. Build actual Writer property sequences in its filter and remove Writer-only export assumptions from shared manifest owner. Verify ODT and ODS manifest events/semantic XML,actual shared values and Writer round trips,strict coverage/source/browser gates,truthful inventory and close task with full Calc model/ODS goal pending."
  Verify Steps: "Pin ManifestExport.cxx/hxx,ManifestDefines.hxx,AttributeList source/header,SAX IDLs and actual package QA evidence. Verify real PropertyValue/Any sequences and AttributeList copy/mutation/default/order semantics,all supported OASIS MIME/version decisions,attribute source order,root detection,Size int64 and unknown properties. Verify worker-safe handler escaping with actual SAX parser and Chromium. Migrate Writer actual ODT writer to same exporter;related Writer round trips/embedded fonts/export worker tests and targeted Writer browser startup/load/edit must pass. Whole Calc and exact changed shared executable owner raw S/B/F/L100;Writer-only coverage gaps exempt.13source gates,production build and shared manifest browser. Four reference links absent at runtime/restored. Unsupported encrypted/legacy branches remain explicit admission limits;no fake Calc document or broad parity."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-15T23:02:25.090Z — VERIFY — ok

    By: CODER

    Note: Command:native-audit.mjs,portable.mjs,source-gates.mjs,build-browser-portable.mjs,final-audit.mjs under output/playwright/task177-checks. Result:pass. Evidence:78related/11files,187Calc/76files;exact5shared raw S252/B90/F45/L224 and33Calc S4179/B2731/F821/L3727 every counter positive100;one Writer-only docsh coverage gap exempt.13gates,build,actual shared Chromium plus dedicated DOM-free Worker identical XML,and Writer startup/load/edit.16pinned original blobs,16MIME literals,40existing algorithms unchanged except declared Writer call,66436source-derived native-JS UTF16 cases;guard algorithm unchanged outside original edge metadata. Scope:plain OASIS PropertyValue-sequence export,AttributeList,JS SAX payload/composition and Writer migration.4refs absent at runtime/restored;51paths within55. CALC161 preserved. No full all-app run;generic ManifestImport,Calc document/UI/same-model ODS remain pending.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T22:57:54.672Z, excerpt_hash=sha256:d79db771432cacae6e4b17577aa7545a5834867dd76fc1f2238202c2319c94a6

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610152236-5C73DD/blueprint/resolved-snapshot.json
    - old_digest: e43ecc02a47f63b1cc996b8d921e7c6a7a362cb1d40dc7cbce9523fb270916c0
    - current_digest: e43ecc02a47f63b1cc996b8d921e7c6a7a362cb1d40dc7cbce9523fb270916c0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610152236-5C73DD

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610152236-5C73DD
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert task177 commits only;preserve calc branch,unrelated work and native links. No merges,history rewriting or gate/coverage weakening."
  Findings: |-
    - Observation: Removing the Writer-only shared helper leaves five existing Writer capability evidence markers pointing to createOdtManifestXml. Initial formatting also found one new manifest test requiring final normalization.
      Impact: Inventory must follow the actual replacement exporter instead of retaining stale callable references;this adds five existing evidence-only capability records within the same manifest migration.
      Resolution: Refresh the five markers to ManifestExport without changing their parity/verified flags;refine the path budget to50for this same approved migration and format the new test before rerunning gates.

    - Observation: Lint flags the constructor-only ManifestExport class even though the pinned upstream class intentionally exports synchronously from its constructor. Additional SAX writer review shows invalid XML characters and malformed UTF16 must fail attribute export.
      Impact: Replacing the native class with a utility would change its contract;the browser serialization adapter also needs source-backed character admission rather than emitting malformed XML.
      Resolution: Use a narrowly justified no-extraneous-class annotation for the canonical class. Native String.isWellFormed plus XML10 forbidden-character matching preserves the confirmed SAX invalid-character acceptance without porting UTF16/UTF8 memory machinery;add literal invalid-character cases and pin saxwriter.cxx.

    - Observation: Repository declarations target pre-ES2024 String and do not declare native isWellFormed although the Node/Chromium hosts provide it. The initial MIME audit also assumed formatter-independent declaration whitespace incorrectly.
      Impact: Typecheck and literal-source audit fail without indicating a runtime semantic mismatch.
      Resolution: Add an erased local method contract for the runtime-verified native String API without changing compiler configuration or adding a polyfill. Compare MIME declaration values independent of whitespace and retain initial diagnostics.

    - Observation: Dependency gate rejects newly reached original module edges and correctly rejects Writer filter importing a browser directory. The serialization/composition code has no browser globals,DOM,worker or platform APIs:it only uses shared values and JS string XML output.
      Impact: Host-independent serialization belongs to shared SAX/package implementation responsibilities;relaxing core-to-browser ownership rules would preserve the wrong architecture.
      Resolution: Move the platform-neutral JS output bindings to sax/source/expatwrap/saxwriter.ts and package/source/manifest/ManifestWriter.ts with explicit limited JS-binding provenance,no fabricated native SAXWriter service. Preserve the ownership guard algorithm exactly and add only source-backed module-edge metadata from native includes/Library_package2/Library_sax/Library_sw. No injection bypass or application-to-browser exception is added.

    - Observation: Source provenance discovery treats package/test/fixtures/manifest.ts as runtime;the repository fixture exemption is the established src/test/fixtures subtree.
      Impact: The test-only property producer must not be registered as production code or excluded through a weakened checker.
      Resolution: Move the fixture into src/test/fixtures and update unit imports;leave discovery/guard algorithms unchanged and retain the diagnostic.

    - Observation: Provenance correctly rejects AttributeList evidence consisting only of the class name matching the native basename.
      Impact: Header/source mapping needs method-level responsibility evidence,not filename similarity.
      Resolution: Add explicit original getValueByName and AttributeList::AddAttribute evidence and retain all broad parity flags as unverified;do not change the provenance validator.

    - Observation: Inventory rejects missing nullable upstreamFile and upstreamSymbols fields on the two local JS composition records;they intentionally do not claim native SAXWriter/service implementations.
      Impact: The browser-adaptation semantic schema requires explicit null and empty symbols rather than omitted fields.
      Resolution: Populate the existing nullable schema fields,retaining local-only provenance and all unverified parity flags. No validator changes.

    - Observation: Inventory correctly flags browser-adaptation classification under upstream source paths. The moved modules implement platform-neutral XML payload serialization/composition roles,with JS string carriers replacing native output buffers,not browser services.
      Impact: Their provenance must map the represented source responsibilities rather than declare browser ownership under a native path or suppress a structural violation.
      Resolution: Map only ManifestWriter::writeManifestSequence payload composition and SAXWriter::startElement/SaxWriterHelper::convertToXML payload callbacks as unverified upstream mechanisms with explicit JS carrier divergence. Keep full Writer/UNO/service/stream APIs omitted,no fabricated native service class or browser ownership exception. No checker changes or known-violation suppression.
id_source: "generated"
---
## Summary

Task177 replaces hardcoded Writer manifest export with shared native PropertyValue-sequence ManifestExport for ordinary unencrypted OASIS document packages,including ODT and ODS.

## Scope

Actual ManifestExport nonencrypted OASIS branch;reused PropertyValue/Any/OUString;canonical comphelper AttributeList plus erased SAX contracts;platform-neutral JS string output/composition bindings in source SAX/package responsibilities;Writer export migration;tests/Chromium;runtime/provenance/capability/readiness/source suspicions. Maximum55non-task paths includes five existing Writer capability marker repairs and source-backed dependency-edge metadata only;guard algorithms and core-to-browser prohibitions remain unchanged. Existing Writer import validator stays bounded pending native ManifestImport;no ODS document/model/UI claim. No encryption algorithms,legacy DTD export,lifetime framework or all-app run.

## Plan

Implement native comphelper AttributeList and borrowed SAX contracts;translate ordinary OASIS ManifestExport PropertyValue loops and attribute/event order,using worker-safe browser SAX serialization at the host boundary. Reject unsupported legacy/encrypted admission before output instead of silently discarding. Build actual Writer property sequences in its filter and remove Writer-only export assumptions from shared manifest owner. Verify ODT and ODS manifest events/semantic XML,actual shared values and Writer round trips,strict coverage/source/browser gates,truthful inventory and close task with full Calc model/ODS goal pending.

## Verify Steps

Pin ManifestExport.cxx/hxx,ManifestDefines.hxx,AttributeList source/header,SAX IDLs and actual package QA evidence. Verify real PropertyValue/Any sequences and AttributeList copy/mutation/default/order semantics,all supported OASIS MIME/version decisions,attribute source order,root detection,Size int64 and unknown properties. Verify worker-safe handler escaping with actual SAX parser and Chromium. Migrate Writer actual ODT writer to same exporter;related Writer round trips/embedded fonts/export worker tests and targeted Writer browser startup/load/edit must pass. Whole Calc and exact changed shared executable owner raw S/B/F/L100;Writer-only coverage gaps exempt.13source gates,production build and shared manifest browser. Four reference links absent at runtime/restored. Unsupported encrypted/legacy branches remain explicit admission limits;no fake Calc document or broad parity.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-15T23:02:25.090Z — VERIFY — ok

By: CODER

Note: Command:native-audit.mjs,portable.mjs,source-gates.mjs,build-browser-portable.mjs,final-audit.mjs under output/playwright/task177-checks. Result:pass. Evidence:78related/11files,187Calc/76files;exact5shared raw S252/B90/F45/L224 and33Calc S4179/B2731/F821/L3727 every counter positive100;one Writer-only docsh coverage gap exempt.13gates,build,actual shared Chromium plus dedicated DOM-free Worker identical XML,and Writer startup/load/edit.16pinned original blobs,16MIME literals,40existing algorithms unchanged except declared Writer call,66436source-derived native-JS UTF16 cases;guard algorithm unchanged outside original edge metadata. Scope:plain OASIS PropertyValue-sequence export,AttributeList,JS SAX payload/composition and Writer migration.4refs absent at runtime/restored;51paths within55. CALC161 preserved. No full all-app run;generic ManifestImport,Calc document/UI/same-model ODS remain pending.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T22:57:54.672Z, excerpt_hash=sha256:d79db771432cacae6e4b17577aa7545a5834867dd76fc1f2238202c2319c94a6

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610152236-5C73DD/blueprint/resolved-snapshot.json
- old_digest: e43ecc02a47f63b1cc996b8d921e7c6a7a362cb1d40dc7cbce9523fb270916c0
- current_digest: e43ecc02a47f63b1cc996b8d921e7c6a7a362cb1d40dc7cbce9523fb270916c0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610152236-5C73DD

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610152236-5C73DD
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert task177 commits only;preserve calc branch,unrelated work and native links. No merges,history rewriting or gate/coverage weakening.

## Findings

- Observation: Removing the Writer-only shared helper leaves five existing Writer capability evidence markers pointing to createOdtManifestXml. Initial formatting also found one new manifest test requiring final normalization.
  Impact: Inventory must follow the actual replacement exporter instead of retaining stale callable references;this adds five existing evidence-only capability records within the same manifest migration.
  Resolution: Refresh the five markers to ManifestExport without changing their parity/verified flags;refine the path budget to50for this same approved migration and format the new test before rerunning gates.

- Observation: Lint flags the constructor-only ManifestExport class even though the pinned upstream class intentionally exports synchronously from its constructor. Additional SAX writer review shows invalid XML characters and malformed UTF16 must fail attribute export.
  Impact: Replacing the native class with a utility would change its contract;the browser serialization adapter also needs source-backed character admission rather than emitting malformed XML.
  Resolution: Use a narrowly justified no-extraneous-class annotation for the canonical class. Native String.isWellFormed plus XML10 forbidden-character matching preserves the confirmed SAX invalid-character acceptance without porting UTF16/UTF8 memory machinery;add literal invalid-character cases and pin saxwriter.cxx.

- Observation: Repository declarations target pre-ES2024 String and do not declare native isWellFormed although the Node/Chromium hosts provide it. The initial MIME audit also assumed formatter-independent declaration whitespace incorrectly.
  Impact: Typecheck and literal-source audit fail without indicating a runtime semantic mismatch.
  Resolution: Add an erased local method contract for the runtime-verified native String API without changing compiler configuration or adding a polyfill. Compare MIME declaration values independent of whitespace and retain initial diagnostics.

- Observation: Dependency gate rejects newly reached original module edges and correctly rejects Writer filter importing a browser directory. The serialization/composition code has no browser globals,DOM,worker or platform APIs:it only uses shared values and JS string XML output.
  Impact: Host-independent serialization belongs to shared SAX/package implementation responsibilities;relaxing core-to-browser ownership rules would preserve the wrong architecture.
  Resolution: Move the platform-neutral JS output bindings to sax/source/expatwrap/saxwriter.ts and package/source/manifest/ManifestWriter.ts with explicit limited JS-binding provenance,no fabricated native SAXWriter service. Preserve the ownership guard algorithm exactly and add only source-backed module-edge metadata from native includes/Library_package2/Library_sax/Library_sw. No injection bypass or application-to-browser exception is added.

- Observation: Source provenance discovery treats package/test/fixtures/manifest.ts as runtime;the repository fixture exemption is the established src/test/fixtures subtree.
  Impact: The test-only property producer must not be registered as production code or excluded through a weakened checker.
  Resolution: Move the fixture into src/test/fixtures and update unit imports;leave discovery/guard algorithms unchanged and retain the diagnostic.

- Observation: Provenance correctly rejects AttributeList evidence consisting only of the class name matching the native basename.
  Impact: Header/source mapping needs method-level responsibility evidence,not filename similarity.
  Resolution: Add explicit original getValueByName and AttributeList::AddAttribute evidence and retain all broad parity flags as unverified;do not change the provenance validator.

- Observation: Inventory rejects missing nullable upstreamFile and upstreamSymbols fields on the two local JS composition records;they intentionally do not claim native SAXWriter/service implementations.
  Impact: The browser-adaptation semantic schema requires explicit null and empty symbols rather than omitted fields.
  Resolution: Populate the existing nullable schema fields,retaining local-only provenance and all unverified parity flags. No validator changes.

- Observation: Inventory correctly flags browser-adaptation classification under upstream source paths. The moved modules implement platform-neutral XML payload serialization/composition roles,with JS string carriers replacing native output buffers,not browser services.
  Impact: Their provenance must map the represented source responsibilities rather than declare browser ownership under a native path or suppress a structural violation.
  Resolution: Map only ManifestWriter::writeManifestSequence payload composition and SAXWriter::startElement/SaxWriterHelper::convertToXML payload callbacks as unverified upstream mechanisms with explicit JS carrier divergence. Keep full Writer/UNO/service/stream APIs omitted,no fabricated native service class or browser ownership exception. No checker changes or known-violation suppression.
