---
id: "202609141614-R0Y17Q"
title: "Replace the XML intermediate architecture"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-14T16:14:37.578Z"
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
    body: "Start: Implementing Workstream 6 with tokenized SAX contexts, direct temporary-SwDoc import, direct model-aware export, and bounded scale/cancellation verification from the pinned LibreOffice reference."
events:
  -
    type: "status"
    at: "2026-09-14T16:14:43.633Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implementing Workstream 6 with tokenized SAX contexts, direct temporary-SwDoc import, direct model-aware export, and bounded scale/cancellation verification from the pinned LibreOffice reference."
doc_version: 3
doc_updated_at: "2026-09-14T16:14:43.633Z"
doc_updated_by: "CODER"
description: "Implement Workstream 6 (P6.1-P6.4) from docs/program/vite-office-upstream-parity-plan.md using the pinned LibreOffice source as the behavioral and structural reference: tokenized SAX contexts, direct canonical SwDoc import, model-aware export, and scale/compatibility verification; no legacy stored-model compatibility."
sections:
  Summary: "Replace the retained ODF XML tree and OdfParagraph DTO pipeline with bounded SAX fast contexts that import directly into a temporary canonical SwDoc and export directly from Writer model state."
  Scope: "Implement P6.1-P6.4 in apps/office/src/xmloff/source/core, apps/office/src/xmloff/source/text, and apps/office/src/sw/source/filter/xml, plus focused tests and directly related program documentation/provenance mappings when required. Preserve the supported ODF behavior, transaction boundary, ZIP safety, and Worker cancellation. Use vendor/libreoffice-reference at the pinned baseline as the structural and behavioral reference. Remove obsolete intermediate-model code without backward compatibility for prior stored document representations."
  Plan: "1. Introduce namespace/local-name token tables, fast attributes, SAX context callbacks, unknown-element policy, resource limits, and deterministic stack ownership over saxes. 2. Rework styles, numbering, metadata, paragraphs, inline spans, whitespace, and lists into Writer import contexts that mutate only a temporary SwDoc. 3. Rework XML export contexts to read named styles, numbering rules, text nodes, pooled paragraph items, and inline hints directly from SwDoc. 4. Remove the OdfParagraph and retained OdfXmlElement/OdfXmlDocument paths. 5. Add parser ordering/limit tests, scale cases, malformed inputs, Worker cancellation, upstream fixtures, and semantic import-export-import assertions. 6. Run focused and repository-wide verification, record evidence, and finish the task."
  Verify Steps: "1. Run npm run test:coverage --workspace @vite-office/office -- --runInBand if supported, otherwise npm run test:coverage --workspace @vite-office/office. Expected: XML parser/context, ODT round-trip, Worker runtime/client, filter service, Writer model, and existing UI unit tests pass with coverage thresholds. 2. Run npm run typecheck. Expected: all workspace and tooling TypeScript checks pass. 3. Run npm run lint && npm run format:check && npm run check:dependencies && npm run check:docs && npm run check:file-size && npm run check:source-tree && npm run check:source-provenance && npm run inventory:parity. Expected: architectural, documentation, size, provenance, and parity checks pass. 4. Run npm run test:e2e && npm run test:static. Expected: browser ODT workflows and production static build checks pass. 5. Run npm run test:inventory:coverage. Expected: inventory tooling remains green. 6. Run node .agentplane/policy/check-routing.mjs && ap doctor. Expected: repository workflow policy and Agentplane state pass. 7. Inspect git status --short --untracked-files=all. Expected: only intentional Workstream 6 artifacts plus the pre-existing Workstream 5 task README modification remain."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the Workstream 6 implementation and task artifacts through a new approved change. The pre-existing Workstream 5 README modification must remain untouched. No migration or compatibility layer is required because the old intermediate/stored representation is intentionally unsupported."
  Findings: "Planning baseline: the pinned LibreOffice checkout is present locally, so implementation research requires no network access. Pre-existing unrelated change: .agentplane/tasks/202609141518-C5V3TD/README.md."
id_source: "generated"
---
## Summary

Replace the retained ODF XML tree and OdfParagraph DTO pipeline with bounded SAX fast contexts that import directly into a temporary canonical SwDoc and export directly from Writer model state.

## Scope

Implement P6.1-P6.4 in apps/office/src/xmloff/source/core, apps/office/src/xmloff/source/text, and apps/office/src/sw/source/filter/xml, plus focused tests and directly related program documentation/provenance mappings when required. Preserve the supported ODF behavior, transaction boundary, ZIP safety, and Worker cancellation. Use vendor/libreoffice-reference at the pinned baseline as the structural and behavioral reference. Remove obsolete intermediate-model code without backward compatibility for prior stored document representations.

## Plan

1. Introduce namespace/local-name token tables, fast attributes, SAX context callbacks, unknown-element policy, resource limits, and deterministic stack ownership over saxes. 2. Rework styles, numbering, metadata, paragraphs, inline spans, whitespace, and lists into Writer import contexts that mutate only a temporary SwDoc. 3. Rework XML export contexts to read named styles, numbering rules, text nodes, pooled paragraph items, and inline hints directly from SwDoc. 4. Remove the OdfParagraph and retained OdfXmlElement/OdfXmlDocument paths. 5. Add parser ordering/limit tests, scale cases, malformed inputs, Worker cancellation, upstream fixtures, and semantic import-export-import assertions. 6. Run focused and repository-wide verification, record evidence, and finish the task.

## Verify Steps

1. Run npm run test:coverage --workspace @vite-office/office -- --runInBand if supported, otherwise npm run test:coverage --workspace @vite-office/office. Expected: XML parser/context, ODT round-trip, Worker runtime/client, filter service, Writer model, and existing UI unit tests pass with coverage thresholds. 2. Run npm run typecheck. Expected: all workspace and tooling TypeScript checks pass. 3. Run npm run lint && npm run format:check && npm run check:dependencies && npm run check:docs && npm run check:file-size && npm run check:source-tree && npm run check:source-provenance && npm run inventory:parity. Expected: architectural, documentation, size, provenance, and parity checks pass. 4. Run npm run test:e2e && npm run test:static. Expected: browser ODT workflows and production static build checks pass. 5. Run npm run test:inventory:coverage. Expected: inventory tooling remains green. 6. Run node .agentplane/policy/check-routing.mjs && ap doctor. Expected: repository workflow policy and Agentplane state pass. 7. Inspect git status --short --untracked-files=all. Expected: only intentional Workstream 6 artifacts plus the pre-existing Workstream 5 task README modification remain.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the Workstream 6 implementation and task artifacts through a new approved change. The pre-existing Workstream 5 README modification must remain untouched. No migration or compatibility layer is required because the old intermediate/stored representation is intentionally unsupported.

## Findings

Planning baseline: the pinned LibreOffice checkout is present locally, so implementation research requires no network access. Pre-existing unrelated change: .agentplane/tasks/202609141518-C5V3TD/README.md.
