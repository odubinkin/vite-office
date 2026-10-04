---
id: "202610041742-KFYF73"
title: "Restore document-owned character style handles"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on:
  - "202610041718-TTJ3ZQ"
tags:
  - "code"
  - "parity"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T17:42:54.584Z"
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
    body: "Start: Approved iterative goal authorizes this bounded document-owned character handle architecture. Follow exact twelve paths and once-only absent verification."
events:
  -
    type: "status"
    at: "2026-10-04T17:42:55.139Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Approved iterative goal authorizes this bounded document-owned character handle architecture. Follow exact twelve paths and once-only absent verification."
doc_version: 3
doc_updated_at: "2026-10-04T17:42:55.139Z"
doc_updated_by: "CODER"
description: "Port the bounded character StylePool insertion owner into SwDoc and route ordinary character creation and browser snapshot decoding through shared handles; restore automatic-item shared-copy and pointer equality. Preserve raw synthetic state fixtures and leave selective reset interning as a source-domain follow-up."
sections:
  Summary: "Restore the document-owned automatic character style pool and shared-handle copy/equality architecture for existing ordinary character creation and browser snapshot import. One executable leaf under the approved iterative goal."
  Scope: "Exactly twelve semantic paths: svl poolitem.ts plus new stylepool.ts/stylepool.test.ts; new sw/inc/istyleaccess.ts and core/doc/swstylemanager.ts/automatic-style-handles.test.ts; core/doc/doc.ts; txtnode/txatbase.ts and automatic-itemset-equality.test.ts; browser/filter/xml/writer-document-codec.ts; source-provenance.json and runtime-inventory.json. Correct only the obsolete raw-value adjacent-merge expectation in one prior test file; all326 other prior tests unchanged. Character SET-only insertion domain; no claimed full paragraph/ignorable/name/cache/usage/native unordered iterator parity. Selective reset still constructs explicit handles and its pool interning remains follow-up. Existing browser persistence item-record QueryValue and registered I/O/recovery deviations retained. No AP sources/helpers/Python, network or outside-repo access."
  Plan: "Implement the bounded native parent-root/item-child/leaf-clone character StylePool and item shareability; add IStyleAccess and document-owned SwStyleManager character access. Route existing ordinary character factory and snapshot decode through the document pool. Retain explicit handles and share them on Clone/SetStyleHandle; compare reference identity. Add independent real-owner regressions, correct one obsolete raw-value merge assertion, register three new owners with all parity statuses unverified and precise residuals. Static then one absent-only profile then restored audits; same-actor exact-SHA quality and clean canonical closure."
  Verify Steps: |-
    1. Static gates before products: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Absent-only npm run test:static then suites.
    2. Rename vendor/libreoffice-reference to vendor/.offline-KFYF73 inside repo with try/finally. Sequential once-only absent runs: npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. All assertions pass, four required app/inventory metrics100%. Failed-gate recovery only; no present runs, no repeating passing suites, no concurrent source/scope/AP audits. Restore vendor.
    3. Independent real-owner tests prove pool parent identity, leaf/subset/empty/value/range/order sharing, immutable cloned input, non-shareable repeated insertion, explicit rejected non-SET domain, document isolation, ordinary factory and decoded snapshot shared handles, raw handle pointer inequality, copy/Setter identity and real hint/model/history merging. Only one prior test's obsolete equal-value raw-handle merge assertion/name changes; all326 other prior tests byte-identical.
    4. Restored-only resource generator --check, check:source-tree, check:source-provenance, inventory:invariants, inventory:parity; semantic violations0. Three new runtime owners classified upstream-mechanism but every parity status unverified. Existing statuses/defaults/exceptions retained; precise native hash/symbol evidence and residual scope; no source execution or storage.
    5. Exact twelve semantic paths, ignored-inclusive AP source/helper/Python/executable/raw-frame/diff scan forbidden0. Same-actor exact semantic SHA EVALUATOR pass, ap doctor zero errors and node .agentplane/policy/check-routing.mjs pass. Canonical verify and finish with semantic/verification/close hashes, clean final tracked/untracked checkout.
  Verification: "Pending implementation and one absent-only verification profile."
  Rollback Plan: "Revert semantic task commit in a new commit if necessary; no history rewrite. Restore vendor directory in finally."
  Findings: "Pinned native SwStyleManager owns the character StylePool; roots group parent pointers and child item equality. Leaf snapshots are cloned once for shareable items, freshly for non-shareable items. SwFormatAutoFormat is non-shareable, copies its handle and compares shared-pointer identity. Current native SfxItemIter includes invalid/disabled sentinels but their Clone returns null; StylePool findChildNode dereferences cloned items. This leaf bounds insertion to concrete SET items rather than pretending state-sentinel pooling is native-defined. Existing raw state-handle fixtures and selective reset are retained pending the separate native input-domain audit. Native QueryValue style names, cache/all-style usage and other families remain unverified; browser persisted record shape retained."
id_source: "generated"
---
## Summary

Restore the document-owned automatic character style pool and shared-handle copy/equality architecture for existing ordinary character creation and browser snapshot import. One executable leaf under the approved iterative goal.

## Scope

Exactly twelve semantic paths: svl poolitem.ts plus new stylepool.ts/stylepool.test.ts; new sw/inc/istyleaccess.ts and core/doc/swstylemanager.ts/automatic-style-handles.test.ts; core/doc/doc.ts; txtnode/txatbase.ts and automatic-itemset-equality.test.ts; browser/filter/xml/writer-document-codec.ts; source-provenance.json and runtime-inventory.json. Correct only the obsolete raw-value adjacent-merge expectation in one prior test file; all326 other prior tests unchanged. Character SET-only insertion domain; no claimed full paragraph/ignorable/name/cache/usage/native unordered iterator parity. Selective reset still constructs explicit handles and its pool interning remains follow-up. Existing browser persistence item-record QueryValue and registered I/O/recovery deviations retained. No AP sources/helpers/Python, network or outside-repo access.

## Plan

Implement the bounded native parent-root/item-child/leaf-clone character StylePool and item shareability; add IStyleAccess and document-owned SwStyleManager character access. Route existing ordinary character factory and snapshot decode through the document pool. Retain explicit handles and share them on Clone/SetStyleHandle; compare reference identity. Add independent real-owner regressions, correct one obsolete raw-value merge assertion, register three new owners with all parity statuses unverified and precise residuals. Static then one absent-only profile then restored audits; same-actor exact-SHA quality and clean canonical closure.

## Verify Steps

1. Static gates before products: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Absent-only npm run test:static then suites.
2. Rename vendor/libreoffice-reference to vendor/.offline-KFYF73 inside repo with try/finally. Sequential once-only absent runs: npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. All assertions pass, four required app/inventory metrics100%. Failed-gate recovery only; no present runs, no repeating passing suites, no concurrent source/scope/AP audits. Restore vendor.
3. Independent real-owner tests prove pool parent identity, leaf/subset/empty/value/range/order sharing, immutable cloned input, non-shareable repeated insertion, explicit rejected non-SET domain, document isolation, ordinary factory and decoded snapshot shared handles, raw handle pointer inequality, copy/Setter identity and real hint/model/history merging. Only one prior test's obsolete equal-value raw-handle merge assertion/name changes; all326 other prior tests byte-identical.
4. Restored-only resource generator --check, check:source-tree, check:source-provenance, inventory:invariants, inventory:parity; semantic violations0. Three new runtime owners classified upstream-mechanism but every parity status unverified. Existing statuses/defaults/exceptions retained; precise native hash/symbol evidence and residual scope; no source execution or storage.
5. Exact twelve semantic paths, ignored-inclusive AP source/helper/Python/executable/raw-frame/diff scan forbidden0. Same-actor exact semantic SHA EVALUATOR pass, ap doctor zero errors and node .agentplane/policy/check-routing.mjs pass. Canonical verify and finish with semantic/verification/close hashes, clean final tracked/untracked checkout.

## Verification

Pending implementation and one absent-only verification profile.

## Rollback Plan

Revert semantic task commit in a new commit if necessary; no history rewrite. Restore vendor directory in finally.

## Findings

Pinned native SwStyleManager owns the character StylePool; roots group parent pointers and child item equality. Leaf snapshots are cloned once for shareable items, freshly for non-shareable items. SwFormatAutoFormat is non-shareable, copies its handle and compares shared-pointer identity. Current native SfxItemIter includes invalid/disabled sentinels but their Clone returns null; StylePool findChildNode dereferences cloned items. This leaf bounds insertion to concrete SET items rather than pretending state-sentinel pooling is native-defined. Existing raw state-handle fixtures and selective reset are retained pending the separate native input-domain audit. Native QueryValue style names, cache/all-style usage and other families remain unverified; browser persisted record shape retained.
