/** @fileoverview Original cppuhelper misc catch/throw QA through the actual JavaScript exception ABI and generated UNO values. C++ catch-scope/TLS and exception_ptr syntax are explicit host-language lowering. */
import { afterEach, expect, it } from "vitest";
import { throwException, getCaughtException } from "../inc/exc_hlp";
import { initializeExceptionAbi, withCaughtException } from "./exception-abi";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import {
  RuntimeException,
  cppu_detail_getUnoType as runtimeType,
} from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import {
  IllegalArgumentException,
  cppu_detail_getUnoType as argumentType,
} from "../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import {
  UnknownPropertyException,
  cppu_detail_getUnoType as propertyType,
} from "../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import {
  WrappedTargetRuntimeException,
  cppu_detail_getUnoType as wrappedType,
} from "../../cppu/inc/com/sun/star/lang/WrappedTargetRuntimeException";
import {
  DOMException,
  cppu_detail_getUnoType as domType,
} from "../../cppu/inc/com/sun/star/xml/dom/DOMException";
import { DOMExceptionType } from "../../cppu/inc/com/sun/star/xml/dom/DOMExceptionType";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { ActiveDataSink } from "../../ucbhelper/source/client/activedatasink";
import { own, u, read, releaseDomScope } from "../../test/native-dom";
initializeExceptionAbi();
afterEach(releaseDomScope);
it("ports cppuhelper misc Test::testCatchThrow", /** Original RuntimeException, saved Any and expected catch through an explicit host catch scope. @returns Nothing. */ () => {
  const saved = own(new Any());
  try {
    throw own(new RuntimeException(u("RuntimeException"), own(new Reference())));
  } catch (error) {
    expect(error).toBeInstanceOf(RuntimeException);
    withCaughtException(
      error as RuntimeException,
      /** Original first catch statement. @returns Nothing. */ () => {
        const caught = getCaughtException();
        try {
          saved.moveAssign(caught);
        } finally {
          caught.dispose();
        }
      },
    );
  }
  expect(saved.hasValue()).toBe(true);
  try {
    throwException(saved);
    expect.fail("Expected source rethrow");
  } catch (error) {
    expect(error).toBeInstanceOf(RuntimeException);
    own(error as RuntimeException);
  }
});
it("ports cppuhelper misc Test::testgetCaughtException", /** A retained actual exception object lowers the original exception_ptr and remains owned once. @returns Nothing. */ () => {
  let saved: RuntimeException | undefined;
  try {
    throw own(new RuntimeException(u("RuntimeException"), own(new Reference())));
  } catch (error) {
    saved = error as RuntimeException;
  }
  expect(Boolean(saved)).toBe(true);
  let savedAny: Any | undefined;
  try {
    throw saved;
  } catch (error) {
    expect(error).toBeInstanceOf(RuntimeException);
    withCaughtException(
      error as RuntimeException,
      /** Original first catch statement. @returns Nothing. */ () => {
        savedAny = own(getCaughtException());
      },
    );
  }
  expect(savedAny?.hasValue()).toBe(true);
});
it("throws actual generated derived classes with real nonempty Context and independent fields", /** Linked generated copy construction uses the existing typed source storage. @returns Nothing. */ () => {
  const context = own(new Reference(new ActiveDataSink())),
    source = own(new IllegalArgumentException(u("A\0尾"), context, -3)),
    payload = own(new Any(source, argumentType));
  let caught: IllegalArgumentException | undefined;
  try {
    throwException(payload);
  } catch (error) {
    expect(error).toBeInstanceOf(IllegalArgumentException);
    caught = own(error as IllegalArgumentException);
  }
  expect(caught?.ArgumentPosition).toBe(-3);
  expect(caught?.Context.get()).toBe(context.get());
  source.Message = u("changed");
  payload.clear();
  expect(read((caught as IllegalArgumentException).Message.copy(0))).toBe("A\0尾");
});
it("preserves nested exception Any dynamic types through both helper directions", /** Real generated wrapped exceptions retain their existing owned Any field. @returns Nothing. */ () => {
  const context = own(new Reference(new ActiveDataSink())),
    inner = own(new UnknownPropertyException(u("property"), context)),
    payload = own(new Any(inner, propertyType)),
    outer = own(new WrappedTargetRuntimeException(u("outer"), context, payload)),
    value = own(new Any(outer, wrappedType));
  try {
    throwException(value);
  } catch (error) {
    expect(error).toBeInstanceOf(WrappedTargetRuntimeException);
    const caught = own(error as WrappedTargetRuntimeException),
      copied = own(new UnknownPropertyException());
    expect(caught.TargetException.extract(copied, propertyType)).toBe(true);
    expect(read(copied.Message.copy(0))).toBe("property");
    withCaughtException(
      caught,
      /** Captures the actual outer dynamic type. @returns Nothing. */ () => {
        expect(own(getCaughtException()).getValueType().equals(wrappedType())).toBe(true);
      },
    );
  }
});
it("restores the enclosing current exception after a nested catch scope", /** Host catch nesting preserves the source dynamic class and fields. @returns Nothing. */ () => {
  const context = own(new Reference()),
    outer = own(new RuntimeException(u("outer"), context)),
    inner = own(new DOMException(u("dom"), context, DOMExceptionType.NAMESPACE_ERR));
  withCaughtException(
    outer,
    /** Enclosing catch body. @returns Nothing. */ () => {
      withCaughtException(
        inner,
        /** Nested catch body. @returns Nothing. */ () => {
          const payload = own(getCaughtException());
          expect(payload.getValueType().equals(domType())).toBe(true);
          try {
            throwException(payload);
          } catch (error) {
            expect(error).toBeInstanceOf(DOMException);
            const caught = own(error as DOMException);
            expect(caught.Code).toBe(DOMExceptionType.NAMESPACE_ERR);
          }
        },
      );
      expect(own(getCaughtException()).getValueType().equals(runtimeType())).toBe(true);
    },
  );
});
it("retains the original nonexception-Any rejection", /** Source explicitly guards TypeClass before mapping. @returns Nothing. */ () => {
  try {
    throwException(own(new Any(true)));
    expect.fail("Expected original rejection");
  } catch (error) {
    expect(error).toBeInstanceOf(RuntimeException);
    const caught = own(error as RuntimeException);
    expect(read(caught.Message.copy(0))).toBe(
      "no UNO exception given (must be derived from com::sun::star::uno::Exception)!",
    );
  }
});
it("borrows a Reference field without acquiring it or changing its address", /** The existing native owner retains pointer lifetime responsibility. @returns Nothing. */ () => {
  const owner = own(new Reference(new ActiveDataSink())),
    address = owner.getAddress(),
    view = Reference.unacquired(address);
  expect(view.get()).toBe(owner.get());
  expect(view.getAddress()).toBe(address);
  expect(Reference.unacquired(address)).toBe(view);
  owner.clear();
  expect(view.is()).toBe(false);
});
