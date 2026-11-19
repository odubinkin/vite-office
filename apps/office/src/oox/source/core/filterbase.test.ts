/** @fileoverview Original filter recursion/state over actual native mutexes, RTL values and application context. No model, factory or status implementation is substituted. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import type { XComponent } from "../../../udkapi/com/sun/star/lang/XComponent";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { own, u, releaseDomScope, expectRuntime } from "../../../test/native-dom";
import { FilterBaseImpl, FilterDirection, DocumentOpenedGuard } from "./filterbase";
import { OoxmlVersion } from "../../inc/core/filterbase";
beforeAll(initializeRuntime);
afterEach(releaseDomScope);
it("admits empty URLs concurrently and keeps exact case, fragment and counted UTF16 membership", /** Source set membership without URL canonicalization. @returns Nothing. */ () => {
  const first = own(new DocumentOpenedGuard(u(""))),
    second = own(new DocumentOpenedGuard(u("")));
  expect(first.isValid()).toBe(true);
  expect(second.isValid()).toBe(true);
  for (const value of [
    "file:///A",
    "file:///a",
    "file:///a#x",
    "file:///a\0tail",
    "file:///a\ud800",
  ]) {
    const url = u(value),
      guard = own(new DocumentOpenedGuard(url)),
      duplicate = own(new DocumentOpenedGuard(url));
    expect(guard.isValid()).toBe(true);
    expect(duplicate.isValid()).toBe(false);
  }
});
it("retains its URL value and only the successful claimant removes a claim", /** Duplicate snapshots remain invalid even after the owning scope ends. @returns Nothing. */ () => {
  const url = u("file:///owned"),
    owner = new DocumentOpenedGuard(url);
  try {
    url.assign(u("file:///changed"));
    const duplicate = new DocumentOpenedGuard(u("file:///owned"));
    expect(duplicate.isValid()).toBe(false);
    duplicate.dispose();
    const stillBlocked = own(new DocumentOpenedGuard(u("file:///owned")));
    expect(stillBlocked.isValid()).toBe(false);
    const distinct = own(new DocumentOpenedGuard(url));
    expect(distinct.isValid()).toBe(true);
  } finally {
    owner.dispose();
  }
  const next = own(new DocumentOpenedGuard(u("file:///owned")));
  expect(next.isValid()).toBe(true);
});
it("stores the original context, version, direction, flags and independent empty UNO values", /** Real bootstrap context admission does not manufacture model/factory interfaces. @returns Nothing. */ () => {
  const context = own(new Reference(getProcessComponentContext().get())),
    first = own(new FilterBaseImpl(context)),
    second = new FilterBaseImpl(context);
  expect(first.mxComponentContext.get()).toBe(context.get());
  expect(first.meDirection).toBe(FilterDirection.Unknown);
  expect([FilterDirection.Unknown, FilterDirection.Import, FilterDirection.Export]).toEqual([
    0, 1, 2,
  ]);
  expect(first.meVersion).toBe(OoxmlVersion.ECMA_376_1ST_EDITION);
  expect(OoxmlVersion.ISOIEC_29500_2008).toBe(1);
  expect(first.maFileUrl.isEmpty()).toBe(true);
  expect([first.mbExportVBA, first.mbExportTemplate, first.mbExportSlideShow]).toEqual([
    false,
    false,
    false,
  ]);
  for (const value of [first.maArguments, first.maFilterData, first.maMediaDesc])
    expect(value.empty()).toBe(true);
  for (const value of [
    first.mxModel,
    first.mxModelFactory,
    first.mxTargetFrame,
    first.mxInStream,
    first.mxOutStream,
    first.mxStatusIndicator,
  ])
    expect(value.is()).toBe(false);
  expect(second.maArguments).not.toBe(first.maArguments);
  second.dispose();
  expect(first.mxComponentContext.get()).toBe(context.get());
});
it("uses original throwing context admission and translates a missing document interface", /** Null references exercise actual UNO query/exception bodies. Full positive model admission remains unqualified. @returns Nothing. */ () => {
  const empty = own(new Reference<XComponentContext>());
  expectRuntime(
    /** Actual required-context admission. @returns Never. */ () => new FilterBaseImpl(empty),
  );
  const state = own(new FilterBaseImpl(getProcessComponentContext())),
    component = own(new Reference<XComponent>());
  let caught = false;
  try {
    state.setDocumentModel(component);
  } catch (error) {
    if (!(error instanceof IllegalArgumentException)) throw error;
    caught = true;
    error.dispose();
  }
  expect(caught).toBe(true);
  expect(state.mxModel.is()).toBe(false);
  expect(state.mxModelFactory.is()).toBe(false);
  expect(state.meDirection).toBe(FilterDirection.Unknown);
});
