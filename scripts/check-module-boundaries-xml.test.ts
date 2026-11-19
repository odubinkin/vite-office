/** @fileoverview Source XML/exception boundaries retained independently of browser composition. */
import { expect, it } from "vitest";
import { isForbiddenModuleEdge, getRuntimeOwnershipViolation } from "./check-module-boundaries.mjs";
it("admits the original package temporary-stream dependency without reverse package ownership", /** Library_package2 links utl and original persistence instantiates TempFileFastService. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("package", "unotools")).toBe(false);
  expect(isForbiddenModuleEdge("unotools", "package")).toBe(true);
});
it("retains native DocumentBuilder dependencies while rejecting reverse browser ownership", /** The source builder consumes processfactory and UCB Content; host exception execution stays injected. @returns Nothing. */ () => {
  for (const dependency of ["comphelper", "ucbhelper", "external"])
    expect(isForbiddenModuleEdge("unoxml", dependency)).toBe(false);
  for (const dependency of ["sc", "sw", "framework"])
    expect(isForbiddenModuleEdge("unoxml", dependency)).toBe(true);
  expect(
    getRuntimeOwnershipViolation(
      "cppu/inc/com/sun/star/uno/exception-values.ts",
      "cppu/inc/uno/exception-bindings.ts",
      "../../../../uno/exception-bindings",
    ),
  ).toBeUndefined();
  expect(
    getRuntimeOwnershipViolation(
      "cppuhelper/inc/exc_hlp.ts",
      "cppuhelper/browser/exception-abi.ts",
      "../browser/exception-abi",
    ),
  ).toMatch(/injected contract/u);
});

it("retains the source metadata converter dependency without reverse Sfx coupling", /** SfxDocumentMetaData.cxx calls sax::Converter and Library_sfx links sax. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("sfx2", "sax")).toBe(false);
  expect(isForbiddenModuleEdge("sax", "sfx2")).toBe(true);
});

it("admits desktop service composition of native SAX without reverse application ownership", /** Library_sax sets expwrap as a services component and Desktop bootstrap loads the registry; the browser statically links that exact factory. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("desktop", "sax")).toBe(false);
  expect(isForbiddenModuleEdge("sax", "desktop")).toBe(true);
});

it("admits registered package services only in the desktop composition direction", /** Library_package2 registers package2.component in services, with the source ManifestWriter factory. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("desktop", "package")).toBe(false);
  expect(isForbiddenModuleEdge("package", "desktop")).toBe(true);
  expect(isForbiddenModuleEdge("sw", "desktop")).toBe(true);
});

it("retains native metadata storage-format dependencies without reverse Sfx ownership", /** Library_sfx links sot; Library_sot links native SDK/runtime libraries. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("sfx2", "sot")).toBe(false);
  for (const dependency of ["comphelper", "cppu", "offapi", "sal", "udkapi"])
    expect(isForbiddenModuleEdge("sot", dependency)).toBe(false);
  for (const dependency of ["sfx2", "sc", "sw", "desktop", "framework"])
    expect(isForbiddenModuleEdge("sot", dependency)).toBe(true);
});

it("admits the source MediaDescriptor process context and URI composition direction only", /** Library_utl links comphelper, while SDK headers and stoc URI code do not depend on the desktop application. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("unotools", "comphelper")).toBe(false);
  expect(isForbiddenModuleEdge("comphelper", "unotools")).toBe(true);
  expect(isForbiddenModuleEdge("desktop", "stoc")).toBe(false);
  expect(isForbiddenModuleEdge("stoc", "desktop")).toBe(true);
  expect(isForbiddenModuleEdge("udkapi", "stoc")).toBe(true);
});

it("admits the source registered OOXML token component and CPPU helper dependencies", /** Library_oox registers oox.component and links cppuhelper; no reverse desktop/core edge is introduced. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("desktop", "oox")).toBe(false);
  expect(isForbiddenModuleEdge("oox", "cppuhelper")).toBe(false);
  expect(isForbiddenModuleEdge("oox", "desktop")).toBe(true);
  expect(isForbiddenModuleEdge("cppuhelper", "oox")).toBe(true);
});

it("admits the original SAX libxml2 dependency while retaining reverse ownership rejection", /** fastparser.cxx includes libxml/parser.h and Library_sax.mk declares libxml2; the native locator/producer call actual C APIs. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("sax", "external")).toBe(false);
  expect(isForbiddenModuleEdge("external", "sax")).toBe(true);
  for (const application of ["sw", "sc", "desktop"])
    expect(isForbiddenModuleEdge("sax", application)).toBe(true);
});
it("admits original TempFile service composition and native runtime dependencies only in source direction", /** utl.component registers the real factory; tempfile/XTempFile use libc and std::mutex. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("desktop", "unotools")).toBe(false);
  expect(isForbiddenModuleEdge("unotools", "desktop")).toBe(true);
  expect(isForbiddenModuleEdge("unotools", "external")).toBe(false);
  expect(isForbiddenModuleEdge("external", "unotools")).toBe(true);
});

it("retains the original ZIP-access UCB client dependency", /** zipfileaccess.cxx includes ucbhelper/content.hxx and Library_package2 links ucbhelper. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("package", "ucbhelper")).toBe(false);
  expect(isForbiddenModuleEdge("ucbhelper", "package")).toBe(true);
});

it("retains file-UCP stream ownership over OSL and UNO without application coupling", /** Original Library_ucpfile1 and filstr.hxx establish these dependencies. @returns Nothing. */ () => {
  for (const dependency of ["comphelper", "cppu", "cppuhelper", "external", "sal", "udkapi"])
    expect(isForbiddenModuleEdge("ucb", dependency)).toBe(false);
  for (const application of ["desktop", "sw", "sc", "sfx2"])
    expect(isForbiddenModuleEdge("ucb", application)).toBe(true);
});

it("retains original broker command/identifier SDK dependencies without reverse application imports", /** Library_ucb1 uses SDK command descriptors and identifiers alongside CPPU/SAL. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("ucb", "offapi")).toBe(false);
  expect(isForbiddenModuleEdge("offapi", "ucb")).toBe(true);
});

it("retains original OOXML/Calc complex-color dependencies without reversing docmodel ownership", /** Library_oox and Library_scfilt link docmodel and their real font/color owners include ComplexColor.hxx. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("oox", "docmodel")).toBe(false);
  expect(isForbiddenModuleEdge("sc", "docmodel")).toBe(false);
  expect(isForbiddenModuleEdge("docmodel", "oox")).toBe(true);
  expect(isForbiddenModuleEdge("docmodel", "sc")).toBe(true);
});
