---
id: "202611211835-BN5ECR"
title: "Round-trip Writer ODT character line and relief effects"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T18:36:03.963Z"
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
    body: "Start: port Writer character overline, contour, shadow and relief effects through the native item and ODF property maps."
events:
  -
    type: "status"
    at: "2026-11-21T18:36:08.434Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port Writer character overline, contour, shadow and relief effects through the native item and ODF property maps."
doc_version: 3
doc_updated_at: "2026-11-21T18:36:08.434Z"
doc_updated_by: "CODER"
description: "Port the native character overline style, type, width and color mappings and the native contour, shadow and relief effects. Reuse EditEngine items, the Writer property maps and the xmloff handlers for named and automatic styles. Verify direct formatting and ODT package round trips."
sections:
  Summary: "Preserve native character overline, contour, shadow and relief through Writer ODT."
  Scope: "Shared xmloff character handlers and format projection, Writer UNO property maps and export, focused regression tests and source registry. Preserve native lexical conversion and defaults. Document suspicious upstream behavior where found."
  Plan: |-
    - Use the original mappings and the existing EditEngine types and xmloff property handlers.
    - Connect the properties for named, paragraph and automatic text styles and export from the native items.
    - Verify ODT XML, model values and package round trips, using reference regression scenarios where the model supports them.
  Verify Steps: |-
    - Run `npm run test:writer -- odt-property-roundtrip.test.ts txtprmap.test.ts native-import-style-contracts.test.ts native-text-import-api.test.ts odt-worker --maxWorkers 2 --testTimeout 120000`.
    - Run the office workspace typecheck and ESLint and Prettier on changed TypeScript.
    - Run `npm run check:dependencies`, `npm run check:source-provenance`, `node .agentplane/policy/check-routing.mjs`, `ap doctor` and `git diff --check`.
  Verification: "Pending."
  Rollback Plan: "Revert the scoped implementation commit."
  Findings: "None recorded yet."
id_source: "generated"
---
## Summary

Preserve native character overline, contour, shadow and relief through Writer ODT.

## Scope

Shared xmloff character handlers and format projection, Writer UNO property maps and export, focused regression tests and source registry. Preserve native lexical conversion and defaults. Document suspicious upstream behavior where found.

## Plan

- Use the original mappings and the existing EditEngine types and xmloff property handlers.
- Connect the properties for named, paragraph and automatic text styles and export from the native items.
- Verify ODT XML, model values and package round trips, using reference regression scenarios where the model supports them.

## Verify Steps

- Run `npm run test:writer -- odt-property-roundtrip.test.ts txtprmap.test.ts native-import-style-contracts.test.ts native-text-import-api.test.ts odt-worker --maxWorkers 2 --testTimeout 120000`.
- Run the office workspace typecheck and ESLint and Prettier on changed TypeScript.
- Run `npm run check:dependencies`, `npm run check:source-provenance`, `node .agentplane/policy/check-routing.mjs`, `ap doctor` and `git diff --check`.

## Verification

Pending.

## Rollback Plan

Revert the scoped implementation commit.

## Findings

None recorded yet.
