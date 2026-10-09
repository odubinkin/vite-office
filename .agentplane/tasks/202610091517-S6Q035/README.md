---
id: "202610091517-S6Q035"
title: "Port shared mdds flat segment tree for Calc row segments"
status: "DOING"
priority: "med"
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
  updated_at: "2026-10-09T15:20:02.789Z"
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
    body: "Start: Implement approved shared pinned mdds segment storage prerequisite in calc with exact native source evidence."
events:
  -
    type: "status"
    at: "2026-10-09T15:20:11.900Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved shared pinned mdds segment storage prerequisite in calc with exact native source evidence."
doc_version: 3
doc_updated_at: "2026-10-09T16:05:05.887Z"
doc_updated_by: "CODER"
description: "Build original pinned mdds3.2.1 flat_segment_tree prerequisite for Calc ScFlatBoolRowSegments and ScMultiSel, preserving storage/tree/iterator contracts and documenting upstream observations. Seventh task of resumed interval."
sections:
  Summary: "Implement the original mdds flat_segment_tree prerequisite used by pinned Calc ScFlatBoolRowSegments and ScMultiSel. Preserve real segment storage/search/iterator architecture rather than supplying a substitute union algorithm."
  Scope: "Calc checkout/branch only, task7 of resumed10. Shared external/mdds TypeScript owners shaped after the original include/mdds headers, their portable tests/native fixture, dedicated source-verification/native-probe script, explicit external module dependency allowlist/test, new shared runtime/provenance/capability records, calc-core and suspected-issues documentation. Optional native reference stays ignored at vendor/mdds-reference (add narrow ignore entries); bootstrap/reference docs identify exact pinned download/version/hash and LibreOffice patch. Registry external reference mock support may be adapted in related inventory tests as needed. No Writer consumers, document/formula/string stand-ins, engine wrappers before dependencies, network writes or merges. Existing user authorization permits upstream network source reads; LibreOffice Makefile.fetch/download.lst identify authoritative archive and SHA256."
  Plan: "Port original pinned shared mdds flat_segment_tree with leaf/tree/iterator ownership and actual native comparisons; preserve behavior and scoped100 gates, task7 of10."
  Verify Steps: "Verify reference archive SHA256673f5bb94612dbba581fc92b99b5e5dd1a53e29496a5dbc936432f6b0687c112 from pinned LibreOffice download.lst and original patch. Run dedicated native probe --write/--check with source hashes and ASan/UBSan. Compare ordered segment boundaries/defaults, insertion outcomes/change flags, invalid ranges, clipping, search output preservation/tree readiness, iterator positioning and copies, defined shifts/erase/clear behavior. Use real original mdds headers in the comparison, no replacement native tree. Portable ordinary tests require neither upstream nor compiler/network. Run Calc actual100 coverage plus targeted new shared-owner test/coverage (all four actual Istanbul metrics100), TS7 typecheck, affected ESLint/Prettier, dependency/tooling tests, affected provenance/inventory tests as applicable, ownership/docs/size/tree/provenance checks, Calc and shared registry checks with zero semantic violations, routing/doctor/diff/final clean status. Full Writer/full-suite validation remains at task10; no Writer coverage repair. Do not claim whole generic native memory/template/pointer lifetime parity from finite fixtures."
  Verification: |-
    - Command: node scripts/mdds-flat-segment-native-probe.mjs --write; node scripts/mdds-flat-segment-native-probe.mjs --check; node scripts/mdds-flat-segment-native-probe.mjs --suspected-clipping.
      Result: pass.
      Evidence:3020 initialized boolean/numeric sequences,16256 command steps,490 distinct full snapshots; exact pinned LibreOffice Git blobs/archive checksums/original patch and every genuine mdds/Boost compiler header verified. Original unchanged headers compile with assertions/ASan/UBSan; defined inputs clean. Isolated unsupported clipped-zero-span input produces expected Boost null intrusive-pointer assertion. Ordinary fixture stores every result and both owner observations by deduplicated snapshot index.
      Scope: Shared flat segment leaves/index/insertion/search/defaults/copy/move/clear/shifts/hints and forward/reverse/segment iteration. Undefined clipping is observed, not assigned invented parity semantics.
    - Command: npm run test:coverage:calc.
      Result: pass.
      Evidence:77 tests/17files; actual100 Istanbul statements1496/1496, branches1315/1315, functions270/270, lines1316/1316.
      Scope: All current Calc runtime modules.
    - Command: npm run test:coverage:shared -- src/external/mdds/include/mdds/flat_segment_tree.test.ts --coverage.include='src/external/mdds/include/mdds/*.ts'.
      Result: pass.
      Evidence:5 tests; actual100 Istanbul statements486/486, branches284/284, functions86/86, lines433/433. No coverage exclusions or altered native bodies.
      Scope: All four new shared mdds runtime owners, native step observations and source node/iterator contracts. Separate forward/reverse handler type parameters prevent cross-handler assignments/comparisons.
    - Command: npm run typecheck; npx eslint changed TypeScript/tooling files --max-warnings 0; npx prettier --check changed source/fixture/registry/docs files; git diff --check.
      Result: pass.
      Evidence: TS7 tools/app validation and affected lint/format checks pass. Only combinable erased constructor signatures/docs were adjusted to enforcement.
      Scope: New owners/tests/probe, dependency check/tests, external evidence resolver and affected inventory tests/docs.
    - Command: npm run test:tooling; npm run test:source-provenance; npx vitest run --config scripts/libreoffice-inventory/vitest.config.ts scripts/libreoffice-inventory/registry-validation.test.ts scripts/libreoffice-inventory/runtime-inventory.test.ts scripts/libreoffice-inventory/registry-storage.test.ts scripts/libreoffice-inventory/parity-mappings.test.ts scripts/libreoffice-inventory/parity-mapping-cli.test.ts.
      Result: pass.
      Evidence:14 tooling tests/3files,3 provenance tests,30 related inventory tests/5files. Deliberately missing global capability assertion now checks the correct diagnostic independently of incidental source ordering; Writer positive assertions retained.
      Scope: Explicit sc->external edge, forbidden reverse/browser edges, genuine external source evidence resolution and portable registry fixtures.
    - Command: npm run test:shared -- src/external/mdds/include/mdds/flat_segment_tree.test.ts; same30 related inventory tests with both vendor/libreoffice-reference and vendor/mdds-reference temporarily detached, then restored via shell EXIT trap.
      Result: pass.
      Evidence:5 shared and30 inventory tests pass without either upstream reference; no native compiler or network invoked by ordinary tests. Both original calc-local symlinks restored.
      Scope: Portable ordinary-test contract; shared upstream checkout untouched.
    - Command: npm run inventory:parity:calc; npm run inventory:parity:shared.
      Result: pass.
      Evidence: Calc16 capabilities/131 modules; shared1 capability/116 modules; zero semantic violations. Four runtime/provenance records and one UUID capability added; all parity attestations remain unverified. External header/test paths resolve directly rather than claiming fictitious files inside the LibreOffice source tree.
      Scope: Calc plus shared registry, exact runtime discovery and external dependency responsibility/evidence.
    - Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; node .agentplane/policy/check-routing.mjs; ap doctor.
      Result: pass.
      Evidence:339 runtime sources/1595 imports/29 actual allowed edges;1120 authored source files documented; file size gate passes, original tree owner remains a coherent original header/definition translation above the500-line review threshold and below1000 (review-only size finding). Source tree114 paths/33 retired roots; provenance340 entries/249 mapped/74 browser/17 local. Routing passes; doctor0 errors and2 inherited warnings (managed readiness shim and old PJV0JK missing hash), left unchanged.
      Scope: Approved source/module ownership, documentation and repository gates.
    Residual scope: Wider C++ template/key/value specializations, generic diagnostics/exceptions, native allocation/refcount/deletion timing/dangling pointers, malformed mutation and undefined arithmetic remain uncertified. Finite snapshots are not whole-module/Calc parity. No Writer coverage changes, browser scenarios, native stand-ins, merges or external writes. Full-suite validation remains due at resumed task10; this is task7. All intended implementation files will be committed on calc, with the final clean status recorded after closure.
  Rollback Plan: "Revert only this task's implementation commits and optional local mdds reference link; existing Calc numerical and row-mark owners remain intact."
  Findings: |-
    LibreOffice pins mdds3.2.1 by exact archive checksum and an original gcc warning patch. The source-only reference has no unpacked external headers/archive. Optional source-discovery path solenv/bin/download-sources was absent; bounded fallback found exact fetch URL in Makefile.fetch. Network reads of upstream are already authorized by the user. No source changes or engine stand-ins have been made in this task yet.

    - Observation: mdds archive fetched from LibreOffice authoritative source URL and checksum matches pinned673f5b... Native include probe found missing Boost intrusive_ptr dependency in the source-only workspace. Original mdds archive is MIT licensed.
      Impact: Native comparison needs real Boost headers rather than a pointer shim; LibreOffice pins Boost1.91.0 with checksum in the same download.lst. Ignored research dependency only; production port scope and gates unchanged.
      Resolution: Fetch exact pinned Boost source under existing upstream-read authorization and compile original mdds headers; preserve source patch and archive hashes.

    - Observation: Exact Boost archive checksum matches; original LibreOffice mdds patch applied and genuine include smoke compiles/runs under sanitizers. Shared node/iterator/ref_pair owners started. Optional eslint.config.mjs path was absent; bounded file inventory found eslint.config.js. Iterator-only search and range clipping reveal suspicious source conditions for later native examination.
      Impact: Reference dependencies are genuine; no pointer or segment shims. Source owners are not yet complete or verified; task7 remains DOING.
      Resolution: Continue original flat_segment_tree translation and dedicated native comparisons, document only proven suspicious outcomes, and finish declared gates before closing.

    - Observation: Large owner patch did not apply because Prettier expanded the prior iterator return statement used as context. No part of that patch mutated files.
      Impact: Only patch context failed; node/iterator/reference work already present remains intact. Optional naming-rule grep returned no matches in correct eslint.config.js.
      Resolution: Apply the small iterator context change separately, then add original flat-segment owner without coupling file creation to stale formatted lines.

    - Observation: First native driver run returned EPIPE through the synchronous pipe transport. Input inspection also found an extra hint word serialized for front/back operations.
      Impact: No fixture accepted; original headers compiled. Native transport and command framing need bounded corrections before parity comparison.
      Resolution: Serialize hints only for hinted insertions, and use explicit ignored input/output files for the large synchronous native run.

    - Observation: Portable comparisons pass all3002 genuine native sequences; initial Istanbul gate exposes10 statements and3 branch outcomes in gap-only left shifts and minimum-position value-carrying right shifts.
      Impact: Behavior comparisons pass but the approved shared actual100 gate is not yet satisfied.
      Resolution: Extend native initialized cases to cover those original meaningful interval shapes, retaining all original guards and no exclusions.

    - Observation: TS7 rejects tests that inferred literal Value=0 rather than the original explicit numeric template specialization. Optional guessed help/source paths were absent and were resolved through file inventory or documented commands.
      Impact: Runtime native comparisons and shared actual100 gate pass; static test typing needs explicit value specialization.
      Resolution: Use explicit number templates in literal tests, matching native template arguments; production algorithm remains unchanged.

    - Observation: The isolated clipped-zero-span diagnostic hits the original Boost debug null-pointer assertion before UBSan; native defined3020 sequences stay sanitizer-clean.
      Impact: No assertion or sanitizer fault occurs in certified inputs. This undefined-input observation must not be represented as an ordinary output or fixed guard.
      Resolution: Accept only the exact expected native debug assertion in the optional diagnostic mode; record CALC-008 alongside the independently reproduced hinted-search CALC-009, preserving both original code paths.

    - Observation: Final3020 native comparisons, both actual100 coverage gates,14 tooling tests and provenance tests pass. Repository gates detect opening JSDoc placement, callback/bounds parameter docs, one combinable TypeScript overload and capability schema framing.
      Impact: These are bounded authoring/inventory corrections, with no observed runtime parity failure or verification relaxation.
      Resolution: Correct exact repo contracts, retain source notices and native overload dispatch, then rerun affected gates.

    - Observation: Calc/shared registries pass with zero semantic violations. One related inventory test hardcodes the former alphabetically first Writer capability for a deliberately empty-capability failure; new external owner sorts first.
      Impact: Negative validation still fails correctly; the test expectation is coupled to global module ordering. All other29 affected inventory tests pass.
      Resolution: Derive the expected first referenced capability from the actual sorted runtime manifest, retaining the unknown-capability failure assertion; rerun the affected inventory group.

    - Observation: The revised first-runtime-ID assertion still included a Writer capability that remains available from the selected Writer mapping manifest even when the injected global registry is empty.
      Impact: Unknown-ID failure is correctly for the first capability outside the Writer slice, now shared external. Earlier wording identifying the old ID as Writer was imprecise; it was the Calc address capability.
      Resolution: Assert the expected unknown-capability diagnostic class independently of incidental runtime ordering; preserve the deliberate missing-global-registry check and all positive report assertions.
id_source: "generated"
---
## Summary

Implement the original mdds flat_segment_tree prerequisite used by pinned Calc ScFlatBoolRowSegments and ScMultiSel. Preserve real segment storage/search/iterator architecture rather than supplying a substitute union algorithm.

## Scope

Calc checkout/branch only, task7 of resumed10. Shared external/mdds TypeScript owners shaped after the original include/mdds headers, their portable tests/native fixture, dedicated source-verification/native-probe script, explicit external module dependency allowlist/test, new shared runtime/provenance/capability records, calc-core and suspected-issues documentation. Optional native reference stays ignored at vendor/mdds-reference (add narrow ignore entries); bootstrap/reference docs identify exact pinned download/version/hash and LibreOffice patch. Registry external reference mock support may be adapted in related inventory tests as needed. No Writer consumers, document/formula/string stand-ins, engine wrappers before dependencies, network writes or merges. Existing user authorization permits upstream network source reads; LibreOffice Makefile.fetch/download.lst identify authoritative archive and SHA256.

## Plan

Port original pinned shared mdds flat_segment_tree with leaf/tree/iterator ownership and actual native comparisons; preserve behavior and scoped100 gates, task7 of10.

## Verify Steps

Verify reference archive SHA256673f5bb94612dbba581fc92b99b5e5dd1a53e29496a5dbc936432f6b0687c112 from pinned LibreOffice download.lst and original patch. Run dedicated native probe --write/--check with source hashes and ASan/UBSan. Compare ordered segment boundaries/defaults, insertion outcomes/change flags, invalid ranges, clipping, search output preservation/tree readiness, iterator positioning and copies, defined shifts/erase/clear behavior. Use real original mdds headers in the comparison, no replacement native tree. Portable ordinary tests require neither upstream nor compiler/network. Run Calc actual100 coverage plus targeted new shared-owner test/coverage (all four actual Istanbul metrics100), TS7 typecheck, affected ESLint/Prettier, dependency/tooling tests, affected provenance/inventory tests as applicable, ownership/docs/size/tree/provenance checks, Calc and shared registry checks with zero semantic violations, routing/doctor/diff/final clean status. Full Writer/full-suite validation remains at task10; no Writer coverage repair. Do not claim whole generic native memory/template/pointer lifetime parity from finite fixtures.

## Verification

- Command: node scripts/mdds-flat-segment-native-probe.mjs --write; node scripts/mdds-flat-segment-native-probe.mjs --check; node scripts/mdds-flat-segment-native-probe.mjs --suspected-clipping.
  Result: pass.
  Evidence:3020 initialized boolean/numeric sequences,16256 command steps,490 distinct full snapshots; exact pinned LibreOffice Git blobs/archive checksums/original patch and every genuine mdds/Boost compiler header verified. Original unchanged headers compile with assertions/ASan/UBSan; defined inputs clean. Isolated unsupported clipped-zero-span input produces expected Boost null intrusive-pointer assertion. Ordinary fixture stores every result and both owner observations by deduplicated snapshot index.
  Scope: Shared flat segment leaves/index/insertion/search/defaults/copy/move/clear/shifts/hints and forward/reverse/segment iteration. Undefined clipping is observed, not assigned invented parity semantics.
- Command: npm run test:coverage:calc.
  Result: pass.
  Evidence:77 tests/17files; actual100 Istanbul statements1496/1496, branches1315/1315, functions270/270, lines1316/1316.
  Scope: All current Calc runtime modules.
- Command: npm run test:coverage:shared -- src/external/mdds/include/mdds/flat_segment_tree.test.ts --coverage.include='src/external/mdds/include/mdds/*.ts'.
  Result: pass.
  Evidence:5 tests; actual100 Istanbul statements486/486, branches284/284, functions86/86, lines433/433. No coverage exclusions or altered native bodies.
  Scope: All four new shared mdds runtime owners, native step observations and source node/iterator contracts. Separate forward/reverse handler type parameters prevent cross-handler assignments/comparisons.
- Command: npm run typecheck; npx eslint changed TypeScript/tooling files --max-warnings 0; npx prettier --check changed source/fixture/registry/docs files; git diff --check.
  Result: pass.
  Evidence: TS7 tools/app validation and affected lint/format checks pass. Only combinable erased constructor signatures/docs were adjusted to enforcement.
  Scope: New owners/tests/probe, dependency check/tests, external evidence resolver and affected inventory tests/docs.
- Command: npm run test:tooling; npm run test:source-provenance; npx vitest run --config scripts/libreoffice-inventory/vitest.config.ts scripts/libreoffice-inventory/registry-validation.test.ts scripts/libreoffice-inventory/runtime-inventory.test.ts scripts/libreoffice-inventory/registry-storage.test.ts scripts/libreoffice-inventory/parity-mappings.test.ts scripts/libreoffice-inventory/parity-mapping-cli.test.ts.
  Result: pass.
  Evidence:14 tooling tests/3files,3 provenance tests,30 related inventory tests/5files. Deliberately missing global capability assertion now checks the correct diagnostic independently of incidental source ordering; Writer positive assertions retained.
  Scope: Explicit sc->external edge, forbidden reverse/browser edges, genuine external source evidence resolution and portable registry fixtures.
- Command: npm run test:shared -- src/external/mdds/include/mdds/flat_segment_tree.test.ts; same30 related inventory tests with both vendor/libreoffice-reference and vendor/mdds-reference temporarily detached, then restored via shell EXIT trap.
  Result: pass.
  Evidence:5 shared and30 inventory tests pass without either upstream reference; no native compiler or network invoked by ordinary tests. Both original calc-local symlinks restored.
  Scope: Portable ordinary-test contract; shared upstream checkout untouched.
- Command: npm run inventory:parity:calc; npm run inventory:parity:shared.
  Result: pass.
  Evidence: Calc16 capabilities/131 modules; shared1 capability/116 modules; zero semantic violations. Four runtime/provenance records and one UUID capability added; all parity attestations remain unverified. External header/test paths resolve directly rather than claiming fictitious files inside the LibreOffice source tree.
  Scope: Calc plus shared registry, exact runtime discovery and external dependency responsibility/evidence.
- Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; node .agentplane/policy/check-routing.mjs; ap doctor.
  Result: pass.
  Evidence:339 runtime sources/1595 imports/29 actual allowed edges;1120 authored source files documented; file size gate passes, original tree owner remains a coherent original header/definition translation above the500-line review threshold and below1000 (review-only size finding). Source tree114 paths/33 retired roots; provenance340 entries/249 mapped/74 browser/17 local. Routing passes; doctor0 errors and2 inherited warnings (managed readiness shim and old PJV0JK missing hash), left unchanged.
  Scope: Approved source/module ownership, documentation and repository gates.
Residual scope: Wider C++ template/key/value specializations, generic diagnostics/exceptions, native allocation/refcount/deletion timing/dangling pointers, malformed mutation and undefined arithmetic remain uncertified. Finite snapshots are not whole-module/Calc parity. No Writer coverage changes, browser scenarios, native stand-ins, merges or external writes. Full-suite validation remains due at resumed task10; this is task7. All intended implementation files will be committed on calc, with the final clean status recorded after closure.

## Rollback Plan

Revert only this task's implementation commits and optional local mdds reference link; existing Calc numerical and row-mark owners remain intact.

## Findings

LibreOffice pins mdds3.2.1 by exact archive checksum and an original gcc warning patch. The source-only reference has no unpacked external headers/archive. Optional source-discovery path solenv/bin/download-sources was absent; bounded fallback found exact fetch URL in Makefile.fetch. Network reads of upstream are already authorized by the user. No source changes or engine stand-ins have been made in this task yet.

- Observation: mdds archive fetched from LibreOffice authoritative source URL and checksum matches pinned673f5b... Native include probe found missing Boost intrusive_ptr dependency in the source-only workspace. Original mdds archive is MIT licensed.
  Impact: Native comparison needs real Boost headers rather than a pointer shim; LibreOffice pins Boost1.91.0 with checksum in the same download.lst. Ignored research dependency only; production port scope and gates unchanged.
  Resolution: Fetch exact pinned Boost source under existing upstream-read authorization and compile original mdds headers; preserve source patch and archive hashes.

- Observation: Exact Boost archive checksum matches; original LibreOffice mdds patch applied and genuine include smoke compiles/runs under sanitizers. Shared node/iterator/ref_pair owners started. Optional eslint.config.mjs path was absent; bounded file inventory found eslint.config.js. Iterator-only search and range clipping reveal suspicious source conditions for later native examination.
  Impact: Reference dependencies are genuine; no pointer or segment shims. Source owners are not yet complete or verified; task7 remains DOING.
  Resolution: Continue original flat_segment_tree translation and dedicated native comparisons, document only proven suspicious outcomes, and finish declared gates before closing.

- Observation: Large owner patch did not apply because Prettier expanded the prior iterator return statement used as context. No part of that patch mutated files.
  Impact: Only patch context failed; node/iterator/reference work already present remains intact. Optional naming-rule grep returned no matches in correct eslint.config.js.
  Resolution: Apply the small iterator context change separately, then add original flat-segment owner without coupling file creation to stale formatted lines.

- Observation: First native driver run returned EPIPE through the synchronous pipe transport. Input inspection also found an extra hint word serialized for front/back operations.
  Impact: No fixture accepted; original headers compiled. Native transport and command framing need bounded corrections before parity comparison.
  Resolution: Serialize hints only for hinted insertions, and use explicit ignored input/output files for the large synchronous native run.

- Observation: Portable comparisons pass all3002 genuine native sequences; initial Istanbul gate exposes10 statements and3 branch outcomes in gap-only left shifts and minimum-position value-carrying right shifts.
  Impact: Behavior comparisons pass but the approved shared actual100 gate is not yet satisfied.
  Resolution: Extend native initialized cases to cover those original meaningful interval shapes, retaining all original guards and no exclusions.

- Observation: TS7 rejects tests that inferred literal Value=0 rather than the original explicit numeric template specialization. Optional guessed help/source paths were absent and were resolved through file inventory or documented commands.
  Impact: Runtime native comparisons and shared actual100 gate pass; static test typing needs explicit value specialization.
  Resolution: Use explicit number templates in literal tests, matching native template arguments; production algorithm remains unchanged.

- Observation: The isolated clipped-zero-span diagnostic hits the original Boost debug null-pointer assertion before UBSan; native defined3020 sequences stay sanitizer-clean.
  Impact: No assertion or sanitizer fault occurs in certified inputs. This undefined-input observation must not be represented as an ordinary output or fixed guard.
  Resolution: Accept only the exact expected native debug assertion in the optional diagnostic mode; record CALC-008 alongside the independently reproduced hinted-search CALC-009, preserving both original code paths.

- Observation: Final3020 native comparisons, both actual100 coverage gates,14 tooling tests and provenance tests pass. Repository gates detect opening JSDoc placement, callback/bounds parameter docs, one combinable TypeScript overload and capability schema framing.
  Impact: These are bounded authoring/inventory corrections, with no observed runtime parity failure or verification relaxation.
  Resolution: Correct exact repo contracts, retain source notices and native overload dispatch, then rerun affected gates.

- Observation: Calc/shared registries pass with zero semantic violations. One related inventory test hardcodes the former alphabetically first Writer capability for a deliberately empty-capability failure; new external owner sorts first.
  Impact: Negative validation still fails correctly; the test expectation is coupled to global module ordering. All other29 affected inventory tests pass.
  Resolution: Derive the expected first referenced capability from the actual sorted runtime manifest, retaining the unknown-capability failure assertion; rerun the affected inventory group.

- Observation: The revised first-runtime-ID assertion still included a Writer capability that remains available from the selected Writer mapping manifest even when the injected global registry is empty.
  Impact: Unknown-ID failure is correctly for the first capability outside the Writer slice, now shared external. Earlier wording identifying the old ID as Writer was imprecise; it was the Calc address capability.
  Resolution: Assert the expected unknown-capability diagnostic class independently of incidental runtime ordering; preserve the deliberate missing-global-registry check and all positive report assertions.
