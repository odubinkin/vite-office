# Vite Office

Vite Office is a from-scratch, browser-only office suite targeting functional, test, and
documentation parity with a pinned LibreOffice baseline. The product is delivered as static frontend
assets built with TypeScript, Vite, and Tailwind CSS; it does not depend on an application backend.

The repository is at the program-foundation stage. No application capability is considered
implemented until its source, upstream behavior, tests, and documentation are linked by evidence in
the parity matrix.

## Program documents

- [Program charter](docs/program/README.md)
- [LibreOffice baseline](docs/program/libreoffice-baseline.md)
- [Parity matrix](docs/program/parity-matrix.md)
- [Architecture](docs/program/architecture.md)
- [Test strategy](docs/program/test-strategy.md)
- [Documentation strategy](docs/program/documentation-strategy.md)
- [Roadmap](docs/program/roadmap.md)

## Current status

The repository now contains the initial TypeScript, React, Vite, and Tailwind CSS workspace under
`apps/office`. It renders an accessible workbench, builds with relative asset paths, and does not
use an application backend. Writer includes one bounded in-memory plain-text paragraph editor; the
other suites remain previews. This does not advance a LibreOffice parity row because its upstream
behavior, tests, and documentation are not yet atomically mapped.

The bootstrap includes strict TypeScript, ESLint and Prettier, 100% initial Vitest coverage
thresholds for authored application behavior, a Chromium and axe smoke test, static-distribution
validation, JSDoc validation, and authored file-size gates. The ignored research checkout is pinned
to LibreOffice `libreoffice-26.8.0.2` at commit `9bc445578031fecf56086729d8e4940c77e14d65`; its
source, test, fixture, and documentation inventory and every office feature remain separate
AgentPlane tasks so scope, verification, and parity evidence stay auditable.

## Local development

Prerequisites are Node.js 22 or newer and npm.

```bash
npm install
npm run dev
```

The development server prints its local URL. The production output is generated under
`apps/office/dist`:

```bash
npm run build
npm run preview
```

Run the complete bootstrap quality contract with:

```bash
npm run verify
```

Playwright requires the task-approved Chromium download before the first E2E run:

```bash
npx playwright install chromium
npm run test:e2e
```

The complete LibreOffice parity target is not yet achieved. See the
[parity matrix](docs/program/parity-matrix.md) for the authoritative status and the
[roadmap](docs/program/roadmap.md) for the delivery sequence.
