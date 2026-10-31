/** @fileoverview Original generated NumberText constructor over explicit prepared context/manager boundaries, actual WeakImplHelper/Reference/UNO exceptions and the real NumberText component. Production context/manager implementations are not substituted or certified. */
import { expect, it } from "vitest";
import { NumberText } from "./NumberText";
import { Manager, Context, construct } from "../../../../../test/numbertext-service-fixture";
import { XNumberText } from "./XNumberText";
import { XComponentContext } from "../../../../../udkapi/com/sun/star/uno/XComponentContext";
import { XMultiComponentFactory } from "../../../../../udkapi/com/sun/star/lang/XMultiComponentFactory";
import { WeakImplHelper } from "../../../../../cppuhelper/inc/implbase";
import { WeakReferenceHelper } from "../../../../../cppuhelper/inc/weakref";
import { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import { Exception } from "../../../../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../../../../cppu/inc/com/sun/star/uno/RuntimeException";
import {
  DeploymentException,
  cppu_detail_getUnoType,
} from "../../../../../cppu/inc/com/sun/star/uno/DeploymentException";
import { Locale } from "../../../../../udkapi/com/sun/star/lang/Locale";
import { unicode, text } from "../../../../../i18nlangtag/source/isolang/isolang.tables";

const prefix =
  "component context fails to supply service com.sun.star.linguistic2.NumberText of type com.sun.star.linguistic2.XNumberText";

it("returns the queried real component with its own lifetime after temporary manager/root references end", /** Exercises actual creation, service method and weak destruction through the generated constructor. @returns Nothing. */ () => {
  const body = new Manager(construct),
    manager = new Reference<XMultiComponentFactory>(body),
    context = new Reference<XComponentContext>(new Context(manager)),
    weak = new WeakReferenceHelper(context);
  const instance = NumberText.create(context);
  expect(body.calls).toEqual([["com.sun.star.linguistic2.NumberText", context.get()]]);
  context.dispose();
  manager.dispose();
  const gone = weak.get();
  try {
    expect(gone.is()).toBe(false);
  } finally {
    gone.dispose();
    weak.dispose();
  }
  const locale = new Locale(),
    language = unicode("en"),
    input = unicode("2");
  locale.Language.assign(language);
  try {
    const output = (instance.get() as XNumberText).getNumberText(input, locale);
    try {
      expect(text(output)).toBe("two");
    } finally {
      output.dispose();
    }
  } finally {
    input.dispose();
    language.dispose();
    locale.dispose();
    instance.dispose();
  }
});

it.each(["null", "wrong"])(
  "raises the original DeploymentException for a %s interface",
  /** Neither a null result nor an unsupported queried interface gets a substitute or a query-throw exception. @param mode - Prepared manager outcome. @returns Nothing. */ (
    mode,
  ) => {
    const manager = new Reference<XMultiComponentFactory>(
      new Manager(
        /** Supplies the explicit source creation outcome. @returns Acquired root or empty reference. */ () =>
          mode === "null" ? new Reference() : new Reference(new (WeakImplHelper.specialize())()),
      ),
    );
    const context = new Reference<XComponentContext>(new Context(manager));
    try {
      try {
        NumberText.create(context);
        throw new Error("expected DeploymentException");
      } catch (error) {
        expect(error).toBeInstanceOf(DeploymentException);
        const failure = error as DeploymentException;
        try {
          expect(text(failure.Message)).toBe(prefix);
          expect(failure.Context.get()).toBe(context.get());
        } finally {
          failure.dispose();
        }
      }
    } finally {
      context.dispose();
      manager.dispose();
    }
  },
);

it("wraps only checked UNO exceptions and retains the original caller context", /** Checks exact message, inherited exception value/type and lifetime of the wrapper context after caller release. @returns Nothing. */ () => {
  const manager = new Reference<XMultiComponentFactory>(
    new Manager(
      /** Throws the original checked UNO value at the creation boundary. @param context - Caller context. @returns Never. */ (
        context,
      ) => {
        const message = unicode("missing\u0000module");
        try {
          throw new Exception(message, context);
        } finally {
          message.dispose();
        }
      },
    ),
  );
  const context = new Reference<XComponentContext>(new Context(manager)),
    weak = new WeakReferenceHelper(context);
  let caught: DeploymentException | undefined;
  try {
    NumberText.create(context);
    throw new Error("expected DeploymentException");
  } catch (error) {
    expect(error).toBeInstanceOf(DeploymentException);
    caught = error as DeploymentException;
  }
  const failure = caught as DeploymentException;
  context.dispose();
  manager.dispose();
  try {
    expect(failure).toBeInstanceOf(RuntimeException);
    expect(text(failure.Message)).toBe(prefix + ": missing\u0000module");
    const alive = weak.get();
    try {
      expect(alive.is()).toBe(true);
      expect(failure.Context.get()).toBe(alive.get());
    } finally {
      alive.dispose();
    }
    const name = cppu_detail_getUnoType().getTypeName();
    try {
      expect(text(name)).toBe("com.sun.star.uno.DeploymentException");
    } finally {
      name.dispose();
    }
  } finally {
    failure.dispose();
  }
  const dead = weak.get();
  try {
    expect(dead.is()).toBe(false);
  } finally {
    dead.dispose();
    weak.dispose();
  }
});

it.each(["runtime", "host"])(
  "rethrows %s failures unchanged",
  /** RuntimeException and non-UNO failures bypass checked-exception wrapping. @param mode - Prepared source failure class. @returns Nothing. */ (
    mode,
  ) => {
    const failure =
      mode === "runtime" ? new RuntimeException() : new Error("allocation failure fixture");
    const manager = new Reference<XMultiComponentFactory>(
      new Manager(
        /** Raises the actual prepared failure value without a replacement exception. @returns Never. */ () => {
          throw failure;
        },
      ),
    );
    const context = new Reference<XComponentContext>(new Context(manager));
    try {
      let caught: unknown;
      try {
        NumberText.create(context);
      } catch (error) {
        caught = error;
      }
      expect(caught).toBe(failure);
    } finally {
      context.dispose();
      manager.dispose();
      if (failure instanceof RuntimeException) failure.dispose();
    }
  },
);
