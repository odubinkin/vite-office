# Classic SAX Parser dependency proposal

## Reviewed boundary

Pinned `package/source/zippackage/ZipPackage.cxx::parseContentType` calls `comphelper::OFOPXMLHelper::ReadContentTypeSequence`, which constructs `com.sun.star.xml.sax.Parser`. The existing registered FastParser and LegacyFastParser are different upstream services. No alias will be installed. The original classic implementation is `sax/source/expatwrap/sax_expat.cxx`, backed by Expat, not libxml2.

The repository contains no browser-loadable Expat library. Installed `saxes` has a different callback, error, entity and encoding API; substituting it would require reimplementing observable Expat behavior. The existing Python extension is a host binary, unusable in browser/Worker. The existing Emscripten SDK and runtime build can compile the actual C dependency.

## Proposed dependency action

Download only `expat-2.8.2.tar.xz` into repository-owned `vendor/expat-reference`, from the official LibreOffice source mirror or libexpat release. Verify SHA256 `3ad89b8588e6644bd4e49981480d48b21289eebbcd4f0a1a4afb1c29f99b6ab4` from pinned `vendor/libreoffice-reference/download.lst`. Compile with the existing repository-owned pinned SDK, retaining upstream API/defaults. Add consumed C exports/callback bindings and the real classic SAX component. This is a separate dependency, not a replacement for libxml2/FastParser or ZIP compression.

## Security-sensitive parser scope

Preserve the original source parser creation, callbacks, encoding conversion and error propagation. Original default `m_bEnableDoS=false` installs the internal-entity declaration callback, which stops parsing with the original SAXParseException. Original XInitialization admits the exact `DoSmeplease` opt-in and then omits this callback. Request approval for this exact original parser control as well as the default rejection. No host file access, network resolver, external DNS, credential access, filesystem mount or arbitrary host provider is included. External-entity processing may consume only the actual explicitly supplied UNO resolver/input stream; unavailable resolver/provider paths remain unqualified rather than silently enabled.

## Approval basis and evidence

`.agentplane/policy/security.must.md` requires approval for network and security-critical changes. `agents.approvals.require_network=true` applies. The earlier libxml2 and FastParser flags approvals are not assumed to cover this separate library/parser.

Run original SAX/package tests and critical error/encoding/handler-lifetime tests over actual owners. Verify content types from unchanged DOCX/XLSX fixtures, raw/member regressions and main/DOM-free Worker. Preserve90 coverage gate and original semantics; do not claim complete document/UI import/export from parser tests.
