---
id: "202610150526-ZX1WHA"
title: "Implement native XML attribute value containers for Calc pool"
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
  updated_at: "2026-10-15T05:27:00.073Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-15T05:37:06.619Z"
  updated_by: "CODER"
  note: "Verified20 related,183Calc,38boundary tests; four new shared owners and wholeCalc raw100, all13source gates/build/inventory pass,29paths/3865hashes/12pins/4links audited. Typed UNO transport/document remain explicit gaps; evaluation same-agent, not independent."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-15T05:37:05.500Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review, not independent: source-owned XML attribute value hierarchy implemented as a Calc pool prerequisite with real shared map/base reuse and explicit missing UNO transport."
  evaluated_sha: "68e1b7599d7fd5d8f4a5b8d3063a9710a73c2051"
  blueprint_digest: "847fa9ebdc26e94a3a358f52db6862c522f142e8f9d0939a41525004ce9a8e48"
  evidence_refs:
    - ".agentplane/tasks/202610150526-ZX1WHA/README.md"
    - ".agentplane/tasks/202610150526-ZX1WHA/quality/20261015-053705500-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610150526-ZX1WHA/quality/20261015-053705500-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610150526-ZX1WHA/quality/20261015-053705500-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610150526-ZX1WHA/blueprint/resolved-snapshot.json"
    - "output/playwright/task144-checks/verification.json"
    - "output/playwright/task144-checks/source-gates.json"
    - "output/playwright/task144-checks/boundary-source-audit.json"
    - "output/playwright/task144-checks/build-manifest.json"
  findings:
    - "Actual four native class/header pairs and Calc ATTR_USERDEF122 default are reflected in value/copy/overload/index/presentation contracts. Native memory management erased under JS GC; no fake UNO provider or document pool."
    - "20 related and183 whole Calc cases pass; every raw counter in all4 new shared owners and33 Calc owners is positive100. Assertions distinguish original Add4/Set4 conflict behavior, aliases/history, copy independence and uint16 item count/index narrowing."
    - "All13 source gates and portable production build pass;38 boundary tests enforce native editeng-to-xmloff and reject reverse, while AST audit proves all3 cycle-rejection functions unchanged. Initial test/JSDoc/metadata failures retained and corrected in scope without relaxing gates."
    - "29intentional paths/3865source hashes/12native pins/4restored links audited; inventory zero semantic violations, no parity promotion, CALC124/125 record suspicious source behavior unchanged."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement original XML attribute value/container/item prerequisites with shared namespace map and GC ownership; preserve source quirks and explicitly leave unsupported actual UNO transport."
events:
  -
    type: "status"
    at: "2026-10-15T05:27:04.954Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original XML attribute value/container/item prerequisites with shared namespace map and GC ownership; preserve source quirks and explicitly leave unsupported actual UNO transport."
  -
    type: "verify"
    at: "2026-10-15T05:37:06.619Z"
    author: "CODER"
    state: "ok"
    note: "Verified20 related,183Calc,38boundary tests; four new shared owners and wholeCalc raw100, all13source gates/build/inventory pass,29paths/3865hashes/12pins/4links audited. Typed UNO transport/document remain explicit gaps; evaluation same-agent, not independent."
doc_version: 3
doc_updated_at: "2026-10-15T05:37:06.705Z"
doc_updated_by: "CODER"
description: "Task144 ports actual SvXMLAttr, SvXMLAttrCollection, SvXMLAttrContainerData and SvXMLAttrContainerItem value/copy/accessor/presentation contracts using existing shared SvXMLNamespaceMap and SfxPoolItem. Original UNO XNameContainer/Any transport remains an explicit missing dependency, not a fake provider; preserve GC lifetime and native observable namespace behavior."
sections:
  Summary: "Task144 implements the native XML attribute value hierarchy needed by actual Calc ATTR_USERDEF122 in ScDocumentPool. Reuse shared namespace map and pooled item infrastructure. This moves core toward connected UI and same-model ODS without claiming the document model or UNO transport is complete."
  Scope: "At most35intentional non-agent paths: xmloff source/core/SvXMLAttr.ts, SvXMLAttrCollection.ts, xmlcnimp.ts plus canonical inc/xmlcnimp.ts; editeng source/items/xmlcnitm.ts plus inc/xmlcnitm.ts; related tests and actual Calc attribute witness, native editeng-to-xmloff boundary admission/test without cycle exceptions; matched runtime/provenance/capability inventory, calc-core and Calc suspected-source notes. Retain actual overloads, copy/assignment, namespace alias/history and conflicting-prefix behavior, index/count widths, defaultWhich0, payload equality and presentationfalse. Native debug preconditions become host errors; undefined C++ accesses not emulated. Erase native unique_ptr/move/lifetime mechanics under GC. No fake XNameContainer/Any provider, no whole UNO mapper, no ScDocumentPool facade. Existing shared namespace source unchanged unless real contract correction is necessary and approved."
  Plan: "Implement four source-owned XML attribute classes and two canonical headers, preserve original observable contracts with native JS storage/GC, add original editeng-to-xmloff edge after prior task removed its wrong reverse, test whole new shared owners and full Calc at strict raw100 plus existing namespace/SVL related suites, update honest inventory and suspected source cases; run portable build/source gates, audit paths/pins/hashes and close clean calc. Bound35paths. No native probes, cycle exceptions, fake UNO transport or Writer coverage work."
  Verify Steps: "Source compare four native class/header pairs and actual Calc docpool ATTR_USERDEF122; defaults/copy independence/assignment/self-copy/payload equality, all AddAttr/SetAt overloads, reject-before-namespace mutation, Add versus Set conflicting-prefix difference, unknown-prefix false, aliases/canonical prefix history, remove/index/no-pruning, namespace traversal membership, name assertion domains, uint16 item count/index wrap and false presentation text preservation. Reuse actual shared map/base; no memory manager, fake UNO adapter, compatibility facade or cycle exception. Entire new shared executable owners and whole Calc raw S/B/F/L100 every counter positive; run related namespace/SVL tests and boundary tests. Tests and production build with4source reference links absent/restored finally; scoped format/lint, typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff. Inventory zero semantic violations with explicit missing UNO transport and full document/UI/ODS. Audit35path bound/source hashes/native pins/restored links/clean calc. Full all-app suite only when actual minimum connected UI plus same-model ODS ready, then fix applicable failures and pause; Writer-only coverage gaps exempt as user instructed."
  Verification: |-
    - Command: `node output/playwright/task144-checks/portable.mjs` (exact argv/cwd/reference absence in value-shared-manifest.json and value-calc-manifest.json).
      Result: pass after two new test-only OUString assertion corrections recorded in Findings; original failing logs retained.
      Evidence:20 related tests/5 files,183 whole Calc tests/73 files; all4 new shared executable owners raw S120/B77/F54/L104 at100; all33 Calc executable owners raw S4173/B2731/F821/L3721 at100, every raw counter positive. No source-map/counter/exclusion/repository-threshold changes or Writer coverage repairs.
      Scope: native attribute fields/copy/self-assignment/overloads/assertion domains, namespace lookup/traversal/alias/history, Add4-versus-Set4 conflict/nonmutation, item default/clone/Which-independent payload comparison/false unchanged presentation/unsigned16 count and indices; existing namespace-map and SVL set/default consumers. Actual Calc ATTR_USERDEF122 witness only, not a document-pool facade. Four source-reference links absent during execution and restored finally.
    - Command: every exact argv in `output/playwright/task144-checks/source-gates.json`; `git diff --check`.
      Result: pass.
      Evidence: all13 gates exit0: scoped prettier/eslint, TS typecheck, JSDoc1909 authored sources, size, dependency graph646runtime sources/2860relative imports/94allowed cross-module edges, source-tree, provenance647runtime modules, inventory zero semantic violations, routing, doctor, diff and38boundary tests. Initial JSDoc/metadata failures were corrected, retained and documented without weakening gates or promoting parity. Tests were not repeated for callback JSDoc/metadata-only corrections.
      Scope:29intentional non-agent source/test/doc/inventory paths, within35 approved bound. Native editeng xmlcnitm.hxx includes xmloff/xmlcnimp.hxx and Library_editeng links xo; wrong reverse remains rejected. No new cycle exception or policy change.
    - Command: `node output/playwright/task144-checks/build-portable.mjs`.
      Result: pass.
      Evidence: actual production `npm run build` exit0 with all4 source-reference links absent; exact targets restored finally. Existing chunk/hook advisories retained. build-manifest.json and build-portable.log record actual result.
      Scope: portable production app build, no UI path changed and no new browser behavior claimed. Full all-app suite intentionally remains deferred until genuine minimum connected UI plus same-model ODS readiness, then repair applicable failures and pause as user instructed.
    - Command: `npx tsx output/playwright/task144-checks/audit-boundaries.ts`; `python3 output/playwright/task144-checks/audit-final.py`.
      Result: pass.
      Evidence: all3 cycle-rejection functions AST-identical; native12pins remain at9bc445578031fecf56086729d8e4940c77e14d65;4reference targets restored;3865source hashes (3843baseline,7changed existing,22new,3836unchanged),29intentional paths. Detailed verification.json, final-source-hashes.json and intentional-paths.json retained. CALC-124/125 preserve suspicious native behavior. Runtime/provenance/capability records are mapped/unverified/divergent foundation, with accurate method witnesses and explicit omitted responsibilities.
      Scope: value hierarchy needed by Calc pool; native XNameContainer/Any transport, complete Calc pool/document/connected UI/ODS remain pending. Native Java CellProperties QA is a broader transport reference, explicitly not claimed ported. No native compiler/probe/memory manager. Same-agent EVALUATOR is not independent. Clean calc and post-commit hash proof required at closure.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-15T05:37:06.619Z — VERIFY — ok

    By: CODER

    Note: Verified20 related,183Calc,38boundary tests; four new shared owners and wholeCalc raw100, all13source gates/build/inventory pass,29paths/3865hashes/12pins/4links audited. Typed UNO transport/document remain explicit gaps; evaluation same-agent, not independent.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T05:36:42.513Z, excerpt_hash=sha256:7af8f973f3a980714f8dccdac4e0683dc3038db3f7e488b8d707f3853497361f

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610150526-ZX1WHA/blueprint/resolved-snapshot.json
    - old_digest: 847fa9ebdc26e94a3a358f52db6862c522f142e8f9d0939a41525004ce9a8e48
    - current_digest: 847fa9ebdc26e94a3a358f52db6862c522f142e8f9d0939a41525004ce9a8e48
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610150526-ZX1WHA

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610150526-ZX1WHA -m 🧩 ZX1WHA task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only intentional task changes in a later authorized task; no reset, merge or publication."
  Findings: |-
    Source behavior is authoritative even where AddAttr4 appends UNKNOWN while SetAt4 rejects it, or namespace history survives removal and affects equality. Record suspicious cases in Calc-only source notes without correcting upstream behavior. Native typed UNO transport requires actual SvUnoAttributeContainer/XNameContainer; it is not fabricated for value prerequisites. Same-agent evaluator is not independent.

    - Observation: Initial new item test incorrectly assumed OUString has JS toString override; observed inherited object string.
      Impact: One test assertion failed while the native presentation method correctly left the actual OUString untouched; no source behavior failure.
      Resolution: Use the existing native OUString getter, as existing SfxSetItem presentation tests do, and rerun the affected shared suite. No production string or presentation changes.

    - Observation: The corrected OUString getter exposes native backing storage including a terminator, so an assertion comparing the whole buffer with logical characters also failed.
      Impact: Same single new presentation test assertion; production false/unchanged contract remains correct.
      Resolution: Compare backing storage before and after and separately assert logical length1. Retain both initial logs; no production changes.

    - Observation: Metadata gates reject basename-only upstream symbols for SvXMLAttr and an empty capability upstream.tests array.
      Impact: Registry/provenance evidence is incomplete; runtime tests and source implementation pass unchanged.
      Resolution: Use precise native method witnesses in each primary counterpart and a real upstream attribute-container QA reference with its bounded scope stated. Preserve failed logs and rerun affected metadata gates only after correction; no gate relaxation or parity promotion.

    - Observation: JSDoc gate also found nine undocumented assertion callback functions in the new test.
      Impact: Documentation-only test callbacks need canonical descriptions; all production source and passing behavioral coverage remain unchanged.
      Resolution: Document each callback and run docs/lint/format again; use actual CellProperties Java QA as bounded broader transport evidence, never claim its missing UNO pipeline ported.
id_source: "generated"
---
## Summary

Task144 implements the native XML attribute value hierarchy needed by actual Calc ATTR_USERDEF122 in ScDocumentPool. Reuse shared namespace map and pooled item infrastructure. This moves core toward connected UI and same-model ODS without claiming the document model or UNO transport is complete.

## Scope

At most35intentional non-agent paths: xmloff source/core/SvXMLAttr.ts, SvXMLAttrCollection.ts, xmlcnimp.ts plus canonical inc/xmlcnimp.ts; editeng source/items/xmlcnitm.ts plus inc/xmlcnitm.ts; related tests and actual Calc attribute witness, native editeng-to-xmloff boundary admission/test without cycle exceptions; matched runtime/provenance/capability inventory, calc-core and Calc suspected-source notes. Retain actual overloads, copy/assignment, namespace alias/history and conflicting-prefix behavior, index/count widths, defaultWhich0, payload equality and presentationfalse. Native debug preconditions become host errors; undefined C++ accesses not emulated. Erase native unique_ptr/move/lifetime mechanics under GC. No fake XNameContainer/Any provider, no whole UNO mapper, no ScDocumentPool facade. Existing shared namespace source unchanged unless real contract correction is necessary and approved.

## Plan

Implement four source-owned XML attribute classes and two canonical headers, preserve original observable contracts with native JS storage/GC, add original editeng-to-xmloff edge after prior task removed its wrong reverse, test whole new shared owners and full Calc at strict raw100 plus existing namespace/SVL related suites, update honest inventory and suspected source cases; run portable build/source gates, audit paths/pins/hashes and close clean calc. Bound35paths. No native probes, cycle exceptions, fake UNO transport or Writer coverage work.

## Verify Steps

Source compare four native class/header pairs and actual Calc docpool ATTR_USERDEF122; defaults/copy independence/assignment/self-copy/payload equality, all AddAttr/SetAt overloads, reject-before-namespace mutation, Add versus Set conflicting-prefix difference, unknown-prefix false, aliases/canonical prefix history, remove/index/no-pruning, namespace traversal membership, name assertion domains, uint16 item count/index wrap and false presentation text preservation. Reuse actual shared map/base; no memory manager, fake UNO adapter, compatibility facade or cycle exception. Entire new shared executable owners and whole Calc raw S/B/F/L100 every counter positive; run related namespace/SVL tests and boundary tests. Tests and production build with4source reference links absent/restored finally; scoped format/lint, typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff. Inventory zero semantic violations with explicit missing UNO transport and full document/UI/ODS. Audit35path bound/source hashes/native pins/restored links/clean calc. Full all-app suite only when actual minimum connected UI plus same-model ODS ready, then fix applicable failures and pause; Writer-only coverage gaps exempt as user instructed.

## Verification

- Command: `node output/playwright/task144-checks/portable.mjs` (exact argv/cwd/reference absence in value-shared-manifest.json and value-calc-manifest.json).
  Result: pass after two new test-only OUString assertion corrections recorded in Findings; original failing logs retained.
  Evidence:20 related tests/5 files,183 whole Calc tests/73 files; all4 new shared executable owners raw S120/B77/F54/L104 at100; all33 Calc executable owners raw S4173/B2731/F821/L3721 at100, every raw counter positive. No source-map/counter/exclusion/repository-threshold changes or Writer coverage repairs.
  Scope: native attribute fields/copy/self-assignment/overloads/assertion domains, namespace lookup/traversal/alias/history, Add4-versus-Set4 conflict/nonmutation, item default/clone/Which-independent payload comparison/false unchanged presentation/unsigned16 count and indices; existing namespace-map and SVL set/default consumers. Actual Calc ATTR_USERDEF122 witness only, not a document-pool facade. Four source-reference links absent during execution and restored finally.
- Command: every exact argv in `output/playwright/task144-checks/source-gates.json`; `git diff --check`.
  Result: pass.
  Evidence: all13 gates exit0: scoped prettier/eslint, TS typecheck, JSDoc1909 authored sources, size, dependency graph646runtime sources/2860relative imports/94allowed cross-module edges, source-tree, provenance647runtime modules, inventory zero semantic violations, routing, doctor, diff and38boundary tests. Initial JSDoc/metadata failures were corrected, retained and documented without weakening gates or promoting parity. Tests were not repeated for callback JSDoc/metadata-only corrections.
  Scope:29intentional non-agent source/test/doc/inventory paths, within35 approved bound. Native editeng xmlcnitm.hxx includes xmloff/xmlcnimp.hxx and Library_editeng links xo; wrong reverse remains rejected. No new cycle exception or policy change.
- Command: `node output/playwright/task144-checks/build-portable.mjs`.
  Result: pass.
  Evidence: actual production `npm run build` exit0 with all4 source-reference links absent; exact targets restored finally. Existing chunk/hook advisories retained. build-manifest.json and build-portable.log record actual result.
  Scope: portable production app build, no UI path changed and no new browser behavior claimed. Full all-app suite intentionally remains deferred until genuine minimum connected UI plus same-model ODS readiness, then repair applicable failures and pause as user instructed.
- Command: `npx tsx output/playwright/task144-checks/audit-boundaries.ts`; `python3 output/playwright/task144-checks/audit-final.py`.
  Result: pass.
  Evidence: all3 cycle-rejection functions AST-identical; native12pins remain at9bc445578031fecf56086729d8e4940c77e14d65;4reference targets restored;3865source hashes (3843baseline,7changed existing,22new,3836unchanged),29intentional paths. Detailed verification.json, final-source-hashes.json and intentional-paths.json retained. CALC-124/125 preserve suspicious native behavior. Runtime/provenance/capability records are mapped/unverified/divergent foundation, with accurate method witnesses and explicit omitted responsibilities.
  Scope: value hierarchy needed by Calc pool; native XNameContainer/Any transport, complete Calc pool/document/connected UI/ODS remain pending. Native Java CellProperties QA is a broader transport reference, explicitly not claimed ported. No native compiler/probe/memory manager. Same-agent EVALUATOR is not independent. Clean calc and post-commit hash proof required at closure.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-15T05:37:06.619Z — VERIFY — ok

By: CODER

Note: Verified20 related,183Calc,38boundary tests; four new shared owners and wholeCalc raw100, all13source gates/build/inventory pass,29paths/3865hashes/12pins/4links audited. Typed UNO transport/document remain explicit gaps; evaluation same-agent, not independent.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T05:36:42.513Z, excerpt_hash=sha256:7af8f973f3a980714f8dccdac4e0683dc3038db3f7e488b8d707f3853497361f

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610150526-ZX1WHA/blueprint/resolved-snapshot.json
- old_digest: 847fa9ebdc26e94a3a358f52db6862c522f142e8f9d0939a41525004ce9a8e48
- current_digest: 847fa9ebdc26e94a3a358f52db6862c522f142e8f9d0939a41525004ce9a8e48
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610150526-ZX1WHA

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610150526-ZX1WHA -m 🧩 ZX1WHA task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only intentional task changes in a later authorized task; no reset, merge or publication.

## Findings

Source behavior is authoritative even where AddAttr4 appends UNKNOWN while SetAt4 rejects it, or namespace history survives removal and affects equality. Record suspicious cases in Calc-only source notes without correcting upstream behavior. Native typed UNO transport requires actual SvUnoAttributeContainer/XNameContainer; it is not fabricated for value prerequisites. Same-agent evaluator is not independent.

- Observation: Initial new item test incorrectly assumed OUString has JS toString override; observed inherited object string.
  Impact: One test assertion failed while the native presentation method correctly left the actual OUString untouched; no source behavior failure.
  Resolution: Use the existing native OUString getter, as existing SfxSetItem presentation tests do, and rerun the affected shared suite. No production string or presentation changes.

- Observation: The corrected OUString getter exposes native backing storage including a terminator, so an assertion comparing the whole buffer with logical characters also failed.
  Impact: Same single new presentation test assertion; production false/unchanged contract remains correct.
  Resolution: Compare backing storage before and after and separately assert logical length1. Retain both initial logs; no production changes.

- Observation: Metadata gates reject basename-only upstream symbols for SvXMLAttr and an empty capability upstream.tests array.
  Impact: Registry/provenance evidence is incomplete; runtime tests and source implementation pass unchanged.
  Resolution: Use precise native method witnesses in each primary counterpart and a real upstream attribute-container QA reference with its bounded scope stated. Preserve failed logs and rerun affected metadata gates only after correction; no gate relaxation or parity promotion.

- Observation: JSDoc gate also found nine undocumented assertion callback functions in the new test.
  Impact: Documentation-only test callbacks need canonical descriptions; all production source and passing behavioral coverage remain unchanged.
  Resolution: Document each callback and run docs/lint/format again; use actual CellProperties Java QA as bounded broader transport evidence, never claim its missing UNO pipeline ported.
