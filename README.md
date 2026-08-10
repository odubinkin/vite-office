# Vite Office

Vite Office is a from-scratch, browser-only office suite targeting functional,
test, and documentation parity with a pinned LibreOffice baseline. The product
is delivered as static frontend assets built with TypeScript, Vite, and Tailwind
CSS; it does not depend on an application backend.

The repository is at the program-foundation stage. No application capability
is considered implemented until its source, upstream behavior, tests, and
documentation are linked by evidence in the parity matrix.

## Program documents

- [Program charter](docs/program/README.md)
- [Parity matrix](docs/program/parity-matrix.md)
- [Architecture](docs/program/architecture.md)
- [Test strategy](docs/program/test-strategy.md)
- [Documentation strategy](docs/program/documentation-strategy.md)
- [Roadmap](docs/program/roadmap.md)

## Current status

The first implementation task after this documentation foundation will create
the TypeScript, Vite, Tailwind CSS, test, documentation, and static-build
toolchain. Upstream reference acquisition and every subsequent feature are
separate AgentPlane tasks so scope, verification, and parity evidence remain
auditable.

The complete LibreOffice parity target is not yet achieved. See the
[parity matrix](docs/program/parity-matrix.md) for the authoritative status and
the [roadmap](docs/program/roadmap.md) for the delivery sequence.
