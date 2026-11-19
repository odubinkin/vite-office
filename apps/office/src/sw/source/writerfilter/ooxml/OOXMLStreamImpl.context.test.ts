/** @fileoverview Real cold-module source context initialization/retry and retained static URI factory, without service substitutes. */
import { expect, it } from "vitest";
import { OOXMLStreamImpl } from "./OOXMLStreamImpl";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import { defaultBootstrap_InitialComponentContext } from "../../../../cppuhelper/source/defaultbootstrap";
import { getProcessComponentContext } from "../../../../comphelper/inc/processfactory";
import { DeploymentException } from "../../../../cppu/inc/com/sun/star/uno/DeploymentException";
it("retries failed static service initialization and retains the first successfully supplied context", /** Checks that retries failed static service initialization and retains the first successfully supplied context. @returns Nothing. */ async () => {
  const missing = defaultBootstrap_InitialComponentContext([]);
  try {
    let caught: unknown;
    try {
      const unexpected = await OOXMLStreamImpl.createStream(missing, new ZipStorage());
      unexpected.dispose();
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(DeploymentException);
    const error = caught as DeploymentException;
    try {
      expect(error.Context.get()).toBe(missing.get());
    } finally {
      error.dispose();
    }
    const first = await OOXMLStreamImpl.createStream(
      getProcessComponentContext(),
      new ZipStorage(),
    );
    try {
      expect(first.getTarget()).toBe("");
    } finally {
      first.dispose();
    }
    // Native function-local static has already captured the successful context.
    const later = await OOXMLStreamImpl.createStream(missing, new ZipStorage());
    try {
      expect(later.getTarget()).toBe("");
    } finally {
      later.dispose();
    }
  } finally {
    missing.dispose();
  }
});
