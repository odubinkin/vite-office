---
id: "202610201738-ANN4R2"
title: "Connect native Calc Wrap Text command through shared UI and ODS"
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
  updated_at: "2026-10-20T17:40:14.309Z"
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
    body: "Start: resume approved native Calc UI delivery with genuine Wrap Text slot, original ODS handler and shared Writer toolbar; retain source ownership and fixed/manual geometry contracts."
events:
  -
    type: "status"
    at: "2026-10-20T17:40:21.864Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: resume approved native Calc UI delivery with genuine Wrap Text slot, original ODS handler and shared Writer toolbar; retain source ownership and fixed/manual geometry contracts."
doc_version: 3
doc_updated_at: "2026-10-20T18:00:29.066Z"
doc_updated_by: "CODER"
description: "Continue approved Calc UI delivery after the user merge. Connect the existing native line-break cell item to its real formatting command, selection state, undo and ODS owners, and the existing shared Writer toolbar and menus. Preserve native defaults and mixed-selection behavior; do not introduce browser document state or a substitute text layout engine."
sections:
  Summary: |-
    Connect native Calc Wrap Text command through shared UI and ODS

    Continue approved Calc UI delivery after the user merge. Connect the existing native line-break cell item to its real formatting command, selection state, undo and ODS owners, and the existing shared Writer toolbar and menus. Preserve native defaults and mixed-selection behavior; do not introduce browser document state or a substitute text layout engine.
  Scope: "Native Calc Wrap Text slot, selection/attribute ownership, browser rendering, original ODS property handler, and real shared Writer toolbar use. Up to 25 source/test files plus generated registry/provenance/evidence and current-readiness documentation. No substitute wrapped text measurement service or claim of complete device/automatic wrapped row metrics."
  Plan: "Implement the original SID_ATTR_ALIGN_LINEBREAK slot 10230 through ScFormatShell, actual ScLineBreakCell ATTR_LINEBREAK 139, controller and Sfx registration; retain no-argument toggle, typed-item argument, request completion and mixed-selection contracts. Reuse the existing shared Writer toolbar/command widgets in the original resource placement. Project the actual native wrap item into browser cell whitespace behavior without document state or a new layout engine; retain source row geometry and explicitly document that the current device-based optimal wrapped-height path remains unported. Add the original XmlScPropHdl_IsTextWrapped contracts and fo:wrap-option table-cell mapping, explicit false/default behavior and same-model ODS transport. Cover native slot requests, grouped/filtered/mixed selection, history and reset, pending input, real shared toolbar interactions, independent ODF and repeated ODS/primary-store reopen, and desktop/mobile/Worker browser cases. Up to 25 source/test files plus generated registry/provenance records and current-readiness/journal documentation. Preserve thresholds/excludes/timeouts/retries, Writer browser file policy, branch calc and checkout. Run Calc coverage at 100 percent S/B/F/L and affected shared/Writer tests and changed shared-owner coverage, relevant static/build/resource/registry checks and focused e2e; retain complete shared baseline if production maps match. This is task52, so no full-suite checkpoint before the tenth task. No network, branches, merges, subagents or unrelated service work."
  Verify Steps: "Read task route/brief and native source contracts. Run complete Calc coverage with unchanged Istanbul gates and require 100 percent statements branches functions lines. Run tests for changed XML vocabulary/handler and affected Writer/shared controls, verify changed shared-owner raw coverage at 100 percent and compatibility with full baseline where applicable. Run types, changed-source lint/format, dependency/resource/docs/size/tree/provenance/registry, routing and doctor checks. Build and run focused Calc toolbar/wrap desktop/mobile/Worker and affected shared browser tests, inspect screenshots. Preserve exact commands/results/source evidence, evaluator pass and clean final calc checkout. Full suite is not due at task52."
  Verification: |-
    Command: `npm run test:coverage:calc -- --maxWorkers=1 --coverage.reporter=json --coverage.reporter=text --coverage.reportOnFailure=true --coverage.reportsDirectory=/Users/odubinkin/Projects/vite-office-calc/output/playwright/task52-calc-coverage --reporter=json --outputFile=/Users/odubinkin/Projects/vite-office-calc/output/playwright/task52-calc-results.json`.
    Result: pass, 153 files, 497/497 tests, zero failed/skipped. Unchanged Istanbul gates: statements10424/10424, branches6469/6469, functions1944/1944, lines9354/9354, all100 percent.
    Evidence: `evidence/calc-results.json.gz`, `calc-raw.json.gz`, `calc.log`, `proof.json`.
    Scope: all current Calc source and tests, including actual WrapText Sfx requests, native selected-item state, mixed/default toggles, filtered/grouped/disjoint marks, pending input refusal/admission, original request completion, real undo/redo/reset, ODS and manual row geometry. The new UI test also passed a fresh related replay after a TypeScript-only selector-option correction; all assertion identities and production source remain unchanged.

    Command: current Vite config related run with one worker, XML importer/namespace tests, Writer toolbar/menu/file-dialog integrations and the full new Calc UI test; exact CLI retained in `evidence/commands.json`. Coverage include selects the only changed shared source `src/xmloff/source/core/xmltoken.ts` with the original provider and100 thresholds.
    Result: pass, 6 files, 30/30 tests, changed shared owner100 percent S/B/F/L. Complete shared coverage remains100 percent using checkpoint51 raw counters only for unchanged owner hashes and replacing XML vocabulary with fresh counters.
    Evidence: `related-results.json.gz`, `changed-shared-raw.json.gz`, `shared-raw.json.gz`, `proof.json`. The proof checks every unchanged shared source against the accepted checkpoint51 SHA256 snapshot;no counters from changed source are reused. It also verifies that all prior XMLToken identities retain their original numbers.
    Scope: shared XML vocabulary and affected Writer components. This is related validation plus explicitly verified unchanged baseline reuse,not a new full-suite run.

    Command: production build, focused Playwright formatting toolbar, indentation/row geometry, Wrap Text, Writer foundation and shared popup pointer cases, with one worker during Calc coverage. The two new title-expectation failures were rerun alone with two workers after correcting their expectation to the actual shared auto-name `Native wrapping`; exact JSON/logs retained.
    Result: pass, 13 distinct browser cases current, zero skipped/flaky/retries. Initial11 passed/2 failed, repaired2/2 passed. Production was unchanged by this test-only fixture repair. Real1280/390px browser wrapping changes actual text block height,retains manual96px row height,passes real primary IndexedDB/ODS readback and reopen,with no page errors. DOM-free Worker validates original mapped Which139,request completion,history and ODS.
    Evidence: `initial-browser-results.json.gz`, `browser-repair-results.json.gz`, `browser.log`, `browser-repair.log`, `wrap-reopened-1280.png`, `wrap-reopened-390.png`. Both final screenshots were visually inspected.
    Scope: original shared Writer controls and appearance,actual grid and stored document in Chromium and Worker. Device-based automatic wrapped row height remains explicitly unported;the browser retains actual native manual geometry and adds no substitute metrics engine.

    Command: `npm run build`; changed-source ESLint/Prettier; `npm run typecheck`; dependency,Writer/Calc resource,JSDoc,size,source tree,provenance,registry,routing,doctor and static-build checks. Exact argv and original outcomes are recorded in `static-results.json` and `commands.json`; formatting was rechecked after formatting the repaired e2e fixture.
    Result: pass, all14 current static gates plus production build exit0. Original formatting failure remains in its log;final format log is green. Initial fixture/API/type errors were corrected against actual public contracts without changing native semantics or relaxing checks.
    Evidence: stage logs, `format-final.log`, `build2.log`, `native-source-hashes.json`, `source-snapshot.json`, and `proof.mjs`/`proof.json`.
    Scope: all changed production/test/data paths and repository dependency/resource/provenance boundaries. This is task52;full checkpoint51 remains valid for unchanged shared owners and next complete run is60. No full app replay was scheduled now.
  Rollback Plan: "Revert only the task implementation commit; retain native reference and test evidence. Do not rewrite history or modify other branches."
  Findings: |-
    The user explicitly resumed the UI goal after merging. Preflight confirmed clean branch calc at b2197fa4c;only the current calc checkout was modified. Task52 connects a concrete existing disabled toolbar action to the original cell attribute and existing Sfx/view/undo/filter ownership. The real Writer toolbar and WrapText Lucide resource are reused without a new Calc-specific toolbar widget or browser document model.

    Native source audit retained the special no-argument API completion and typed API incompletion asymmetry as CALC237. Strict XML wrap/no-wrap input preserves the destination Any on malformed lexical values;explicit no-wrap remains distinct from absent direct formatting. Prior XMLToken identities are unchanged. New capability records keep broad parity flags false and document remaining device,rich-edit,merged/rotated layout and full service/recording gaps.

    Browser whitespace reads the canonical ScLineBreakCell;manual row geometry survives real history and ODS/primary-store reopen. Automatic wrapped-height metrics remain unported,so this task does not claim complete Wrap Text layout or satisfy the entire Calc UI objective. That broader goal remains active. Complete native automatic layout and named-style delivery still require their consumed owners.

    New focused fixtures initially used unsupported multiline input and mistaken public method names;they were corrected to genuine supported plain input and actual document/mark APIs. A TypeScript-only RTL selector-option mistake was fixed. Two new e2e fixtures incorrectly expected the full input as auto-title;the existing Writer-shared first-two-word naming policy was retained and the tests corrected. All original failure reports are preserved. The final results are497 Calc,30 related and13 distinct browser cases passing,with current Calc and complete hash-verified shared coverage100 percent S/B/F/L. No thresholds,exclusions,timeouts,retries,dependencies,network,branches,merges or subagents changed.
id_source: "generated"
---
## Summary

Connect native Calc Wrap Text command through shared UI and ODS

Continue approved Calc UI delivery after the user merge. Connect the existing native line-break cell item to its real formatting command, selection state, undo and ODS owners, and the existing shared Writer toolbar and menus. Preserve native defaults and mixed-selection behavior; do not introduce browser document state or a substitute text layout engine.

## Scope

Native Calc Wrap Text slot, selection/attribute ownership, browser rendering, original ODS property handler, and real shared Writer toolbar use. Up to 25 source/test files plus generated registry/provenance/evidence and current-readiness documentation. No substitute wrapped text measurement service or claim of complete device/automatic wrapped row metrics.

## Plan

Implement the original SID_ATTR_ALIGN_LINEBREAK slot 10230 through ScFormatShell, actual ScLineBreakCell ATTR_LINEBREAK 139, controller and Sfx registration; retain no-argument toggle, typed-item argument, request completion and mixed-selection contracts. Reuse the existing shared Writer toolbar/command widgets in the original resource placement. Project the actual native wrap item into browser cell whitespace behavior without document state or a new layout engine; retain source row geometry and explicitly document that the current device-based optimal wrapped-height path remains unported. Add the original XmlScPropHdl_IsTextWrapped contracts and fo:wrap-option table-cell mapping, explicit false/default behavior and same-model ODS transport. Cover native slot requests, grouped/filtered/mixed selection, history and reset, pending input, real shared toolbar interactions, independent ODF and repeated ODS/primary-store reopen, and desktop/mobile/Worker browser cases. Up to 25 source/test files plus generated registry/provenance records and current-readiness/journal documentation. Preserve thresholds/excludes/timeouts/retries, Writer browser file policy, branch calc and checkout. Run Calc coverage at 100 percent S/B/F/L and affected shared/Writer tests and changed shared-owner coverage, relevant static/build/resource/registry checks and focused e2e; retain complete shared baseline if production maps match. This is task52, so no full-suite checkpoint before the tenth task. No network, branches, merges, subagents or unrelated service work.

## Verify Steps

Read task route/brief and native source contracts. Run complete Calc coverage with unchanged Istanbul gates and require 100 percent statements branches functions lines. Run tests for changed XML vocabulary/handler and affected Writer/shared controls, verify changed shared-owner raw coverage at 100 percent and compatibility with full baseline where applicable. Run types, changed-source lint/format, dependency/resource/docs/size/tree/provenance/registry, routing and doctor checks. Build and run focused Calc toolbar/wrap desktop/mobile/Worker and affected shared browser tests, inspect screenshots. Preserve exact commands/results/source evidence, evaluator pass and clean final calc checkout. Full suite is not due at task52.

## Verification

Command: `npm run test:coverage:calc -- --maxWorkers=1 --coverage.reporter=json --coverage.reporter=text --coverage.reportOnFailure=true --coverage.reportsDirectory=/Users/odubinkin/Projects/vite-office-calc/output/playwright/task52-calc-coverage --reporter=json --outputFile=/Users/odubinkin/Projects/vite-office-calc/output/playwright/task52-calc-results.json`.
Result: pass, 153 files, 497/497 tests, zero failed/skipped. Unchanged Istanbul gates: statements10424/10424, branches6469/6469, functions1944/1944, lines9354/9354, all100 percent.
Evidence: `evidence/calc-results.json.gz`, `calc-raw.json.gz`, `calc.log`, `proof.json`.
Scope: all current Calc source and tests, including actual WrapText Sfx requests, native selected-item state, mixed/default toggles, filtered/grouped/disjoint marks, pending input refusal/admission, original request completion, real undo/redo/reset, ODS and manual row geometry. The new UI test also passed a fresh related replay after a TypeScript-only selector-option correction; all assertion identities and production source remain unchanged.

Command: current Vite config related run with one worker, XML importer/namespace tests, Writer toolbar/menu/file-dialog integrations and the full new Calc UI test; exact CLI retained in `evidence/commands.json`. Coverage include selects the only changed shared source `src/xmloff/source/core/xmltoken.ts` with the original provider and100 thresholds.
Result: pass, 6 files, 30/30 tests, changed shared owner100 percent S/B/F/L. Complete shared coverage remains100 percent using checkpoint51 raw counters only for unchanged owner hashes and replacing XML vocabulary with fresh counters.
Evidence: `related-results.json.gz`, `changed-shared-raw.json.gz`, `shared-raw.json.gz`, `proof.json`. The proof checks every unchanged shared source against the accepted checkpoint51 SHA256 snapshot;no counters from changed source are reused. It also verifies that all prior XMLToken identities retain their original numbers.
Scope: shared XML vocabulary and affected Writer components. This is related validation plus explicitly verified unchanged baseline reuse,not a new full-suite run.

Command: production build, focused Playwright formatting toolbar, indentation/row geometry, Wrap Text, Writer foundation and shared popup pointer cases, with one worker during Calc coverage. The two new title-expectation failures were rerun alone with two workers after correcting their expectation to the actual shared auto-name `Native wrapping`; exact JSON/logs retained.
Result: pass, 13 distinct browser cases current, zero skipped/flaky/retries. Initial11 passed/2 failed, repaired2/2 passed. Production was unchanged by this test-only fixture repair. Real1280/390px browser wrapping changes actual text block height,retains manual96px row height,passes real primary IndexedDB/ODS readback and reopen,with no page errors. DOM-free Worker validates original mapped Which139,request completion,history and ODS.
Evidence: `initial-browser-results.json.gz`, `browser-repair-results.json.gz`, `browser.log`, `browser-repair.log`, `wrap-reopened-1280.png`, `wrap-reopened-390.png`. Both final screenshots were visually inspected.
Scope: original shared Writer controls and appearance,actual grid and stored document in Chromium and Worker. Device-based automatic wrapped row height remains explicitly unported;the browser retains actual native manual geometry and adds no substitute metrics engine.

Command: `npm run build`; changed-source ESLint/Prettier; `npm run typecheck`; dependency,Writer/Calc resource,JSDoc,size,source tree,provenance,registry,routing,doctor and static-build checks. Exact argv and original outcomes are recorded in `static-results.json` and `commands.json`; formatting was rechecked after formatting the repaired e2e fixture.
Result: pass, all14 current static gates plus production build exit0. Original formatting failure remains in its log;final format log is green. Initial fixture/API/type errors were corrected against actual public contracts without changing native semantics or relaxing checks.
Evidence: stage logs, `format-final.log`, `build2.log`, `native-source-hashes.json`, `source-snapshot.json`, and `proof.mjs`/`proof.json`.
Scope: all changed production/test/data paths and repository dependency/resource/provenance boundaries. This is task52;full checkpoint51 remains valid for unchanged shared owners and next complete run is60. No full app replay was scheduled now.

## Rollback Plan

Revert only the task implementation commit; retain native reference and test evidence. Do not rewrite history or modify other branches.

## Findings

The user explicitly resumed the UI goal after merging. Preflight confirmed clean branch calc at b2197fa4c;only the current calc checkout was modified. Task52 connects a concrete existing disabled toolbar action to the original cell attribute and existing Sfx/view/undo/filter ownership. The real Writer toolbar and WrapText Lucide resource are reused without a new Calc-specific toolbar widget or browser document model.

Native source audit retained the special no-argument API completion and typed API incompletion asymmetry as CALC237. Strict XML wrap/no-wrap input preserves the destination Any on malformed lexical values;explicit no-wrap remains distinct from absent direct formatting. Prior XMLToken identities are unchanged. New capability records keep broad parity flags false and document remaining device,rich-edit,merged/rotated layout and full service/recording gaps.

Browser whitespace reads the canonical ScLineBreakCell;manual row geometry survives real history and ODS/primary-store reopen. Automatic wrapped-height metrics remain unported,so this task does not claim complete Wrap Text layout or satisfy the entire Calc UI objective. That broader goal remains active. Complete native automatic layout and named-style delivery still require their consumed owners.

New focused fixtures initially used unsupported multiline input and mistaken public method names;they were corrected to genuine supported plain input and actual document/mark APIs. A TypeScript-only RTL selector-option mistake was fixed. Two new e2e fixtures incorrectly expected the full input as auto-title;the existing Writer-shared first-two-word naming policy was retained and the tests corrected. All original failure reports are preserved. The final results are497 Calc,30 related and13 distinct browser cases passing,with current Calc and complete hash-verified shared coverage100 percent S/B/F/L. No thresholds,exclusions,timeouts,retries,dependencies,network,branches,merges or subagents changed.
