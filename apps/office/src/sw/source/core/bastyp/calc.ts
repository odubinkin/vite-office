/** @fileoverview Writer's native scalar field-expression parser and variable table. */
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { rtl_math_uStringToDouble } from "../../../../sal/inc/rtl/math.h";
import {
  getSystemDecimalSeparator,
  getSystemThousandSeparator,
} from "../../../../unotools/source/misc/syslocale";

/** Scalar members of the represented SwSbxValue. */
type CalcValue = number | string;

/** One token in the native numeric expression grammar. */
type CalcToken =
  | { kind: "number"; value: number }
  | { kind: "string"; value: string }
  | { kind: "name"; value: string }
  | { kind: "operator"; value: string }
  | { kind: "end" };

const tokenPattern =
  /\s*(?:(\d+(?:\.\d*)?|\.\d+)([Ee][+-]?\d+)?|([\p{Letter}_][\p{Letter}\p{Number}_.]*)|\[((?:\\\]|[^\]])*)\]|(==|!=|<=|>=|[=+\-*/^()%<>!|])|"((?:[^"]|"")*)")/uy;
const termOperators = new Set([
  "*",
  "/",
  "==",
  "!=",
  "<",
  ">",
  "<=",
  ">=",
  "and",
  "or",
  "xor",
  "mod",
  "min-in",
  "max-in",
]);
const operatorNames = new Map([
  ["add", "+"],
  ["sub", "-"],
  ["mul", "*"],
  ["div", "/"],
  ["eq", "=="],
  ["neq", "!="],
  ["l", "<"],
  ["g", ">"],
  ["leq", "<="],
  ["geq", ">="],
  ["phd", "%"],
  ["pow", "^"],
]);
const listOperators = new Map([
  ["sum", "+"],
  ["mean", "+"],
  ["average", "+"],
  ["count", "+"],
  ["product", "*"],
  ["min", "min-in"],
  ["max", "max-in"],
]);
const unaryFunctions: Readonly<Record<string, (value: number) => number>> = {
  abs: Math.abs,
  acos: Math.acos,
  asin: Math.asin,
  atan: Math.atan,
  cos: Math.cos,
  int: (value) => value | 0,
  sign: Math.sign,
  sin: Math.sin,
  tan: Math.tan,
};

/** Projects the native SwSbxValue numeric coercion. @param value - Original scalar or void. @returns Numeric cell/formula value. */
function getDouble(value: CalcValue | undefined): number {
  if (typeof value !== "string") return value ?? 0;
  const source = unicode(value);
  try {
    return rtl_math_uStringToDouble(
      source.getStr(),
      source.getLength(),
      getSystemDecimalSeparator().charCodeAt(0),
      getSystemThousandSeparator().charCodeAt(0) || 0,
    );
  } finally {
    source.dispose();
  }
}

/** Compares numeric and string Sbx variants in native order. @param left - First operand. @param right - Second operand. @returns Relative order. */
function compare(left: CalcValue, right: CalcValue): number {
  if (typeof left !== typeof right) return typeof left === "number" ? -1 : 1;
  return left === right ? 0 : left < right ? -1 : 1;
}

/** Scalar portion of the original Writer field calculator. */
export class SwCalc {
  private readonly variables = new Map<string, CalcValue>([
    ["false", 0],
    ["true", 1],
    ["pi", Math.PI],
    ["e", Math.E],
  ]);
  private expression = "";
  private index = 0;
  private current: CalcToken = { kind: "end" };
  private error = false;
  private list: { operator: string; length: number; hasNumber: boolean } | undefined;

  /** Changes the original case-insensitive scalar variable table. @param name - Writer variable name. @param value - Native scalar value. @returns Nothing. */
  public VarChange(name: string, value: CalcValue): void {
    this.variables.set(name.toLowerCase(), value);
  }

  /** Reads the existing value of an original named expression. @param name - Writer variable name. @returns Last assigned scalar value. */
  public GetVariable(name: string): CalcValue | undefined {
    return this.variables.get(name.toLowerCase());
  }

  /** Evaluates a native numeric field expression. @param formula - Writer expression. @returns Calculated value when the expression is valid and non-void. */
  public Calculate(formula: string): number | undefined {
    const result = this.CalculateValue(formula);
    if (result === undefined) return undefined;
    const number = getDouble(result);
    return Number.isFinite(number) ? number : undefined;
  }

  /** Calculates native SwSbxValue truthiness, preserving a void expression. @param formula - Original condition. @returns Logical value or void. */
  public CalculateCondition(formula: string): boolean | undefined {
    const result = this.CalculateValue(formula);
    return result === undefined ? undefined : Boolean(result);
  }

  /** Evaluates the represented scalar expression. @param formula - Original expression. @returns Scalar result or void. */
  private CalculateValue(formula: string): CalcValue | undefined {
    this.expression = formula.trim();
    this.index = 0;
    this.error = false;
    this.list = undefined;
    this.GetToken();
    const result = this.Expr();
    return this.error ||
      this.current.kind !== "end" ||
      (typeof result === "number" && !Number.isFinite(result))
      ? undefined
      : result;
  }

  /** Reads the next scalar token of the original expression. @returns Nothing. */
  private GetToken(): void {
    if (this.index >= this.expression.length) {
      this.current = { kind: "end" };
      return;
    }
    tokenPattern.lastIndex = this.index;
    const match = tokenPattern.exec(this.expression);
    if (!match) {
      this.error = true;
      this.current = { kind: "end" };
      return;
    }
    this.index = tokenPattern.lastIndex;
    if (match[1] !== undefined) {
      this.current = { kind: "number", value: Number(match[1] + (match[2] ?? "")) };
    } else if (match[4] !== undefined) {
      this.current = { kind: "name", value: match[4].replaceAll("\\]", "]").toLowerCase() };
    } else if (match[3] !== undefined) {
      const name = match[3].toLowerCase();
      const operator = operatorNames.get(name);
      this.current =
        operator !== undefined || termOperators.has(name) || name === "not"
          ? { kind: "operator", value: operator ?? name }
          : { kind: "name", value: name };
    } else if (match[6] !== undefined) {
      this.current = { kind: "string", value: match[6].replaceAll('""', '"') };
    } else if (match[5] === "|" && this.list) {
      ++this.list.length;
      this.current = { kind: "operator", value: this.list.operator };
    } else {
      this.current = { kind: "operator", value: match[5] as string };
    }
  }

  /** Checks the active operator without advancing the token stream. @param operator - Native operation. @returns Whether active. */
  private At(operator: string): boolean {
    return this.current.kind === "operator" && this.current.value === operator;
  }

  /** Original additive expression level. @returns Scalar value or void. */
  private Expr(): CalcValue | undefined {
    let left = this.Term();
    while (this.At("+") || this.At("-")) {
      const add = this.At("+");
      this.GetToken();
      const right = getDouble(this.Term());
      left = getDouble(left) + (add ? right : -right);
    }
    return left;
  }

  /** Original shared level for multiplication, comparison and numeric boolean operators. @returns Scalar value or void. */
  private Term(): CalcValue | undefined {
    let left = this.Prim();
    while (this.current.kind === "operator" && termOperators.has(this.current.value)) {
      const operator = this.current.value;
      this.GetToken();
      const right = this.Prim() ?? 0;
      const a = left ?? 0;
      switch (operator) {
        case "*":
          left = getDouble(a) * getDouble(right);
          break;
        case "/":
          left = getDouble(a) / getDouble(right);
          break;
        case "mod":
          left = (getDouble(a) | 0) % (getDouble(right) | 0);
          break;
        case "min-in":
          left = getDouble(a) < getDouble(right) ? a : right;
          break;
        case "max-in":
          left = getDouble(a) > getDouble(right) ? a : right;
          break;
        case "==":
          left = Number(compare(a, right) === 0);
          break;
        case "!=":
          left = Number(compare(a, right) !== 0);
          break;
        case "<":
          left = Number(compare(a, right) < 0);
          break;
        case ">":
          left = Number(compare(a, right) > 0);
          break;
        case "<=":
          left = Number(compare(a, right) <= 0);
          break;
        case ">=":
          left = Number(compare(a, right) >= 0);
          break;
        case "and":
          left = Number(Boolean(a) && Boolean(right));
          break;
        case "or":
          left = Number(Boolean(a) || Boolean(right));
          break;
        case "xor":
          left = Number(Boolean(a) !== Boolean(right));
          break;
      }
      if (typeof left === "number" && !Number.isFinite(left)) this.error = true;
    }
    return left;
  }

  /** Original right-recursive power and primary expression level. @returns Scalar value or void. */
  private Prim(): CalcValue | undefined {
    const token = this.current;
    if (token.kind === "name") {
      const operator = listOperators.get(token.value);
      if (operator) return this.ReadList(token.value, operator);
    }
    this.GetToken();
    let value: CalcValue | undefined;
    switch (token.kind) {
      case "number":
        if (this.list) this.list.hasNumber = true;
        if (this.At("%")) {
          this.GetToken();
          return token.value * 0.01;
        }
        value = token.value;
        break;
      case "string":
        value = token.value;
        break;
      case "name": {
        if (this.At("=")) {
          this.GetToken();
          const assigned = this.Expr();
          if (assigned !== undefined) this.VarChange(token.value, assigned);
          return assigned;
        }
        const func = Object.hasOwn(unaryFunctions, token.value)
          ? unaryFunctions[token.value]
          : undefined;
        if (func) return func(getDouble(this.Prim()));
        value = this.variables.get(token.value);
        if (typeof value === "number" && this.list) this.list.hasNumber = true;
        if (value === undefined && this.At("(")) this.error = true;
        break;
      }
      case "operator":
        if (token.value === "-") return -getDouble(this.Prim());
        if (token.value === "!" || token.value === "not") return Number(!(this.Prim() ?? 0));
        if (token.value !== "(") {
          this.error = true;
          return undefined;
        }
        if (this.At(")")) {
          this.GetToken();
          return undefined;
        }
        value = this.Expr();
        if (!this.At(")")) this.error = true;
        else this.GetToken();
        break;
      default:
        this.error = true;
        return undefined;
    }
    if (this.At("^")) {
      this.GetToken();
      value = getDouble(value) ** getDouble(this.Prim());
      if (!Number.isFinite(value)) this.error = true;
    }
    return value;
  }

  /** Applies the original list operation and count while parsing the nested expression. @param name - Native aggregate. @param operator - Active list separator operation. @returns Aggregated numeric result. */
  private ReadList(name: string, operator: string): CalcValue | undefined {
    const parent = this.list;
    const list = { operator, length: 1, hasNumber: false };
    this.list = list;
    try {
      this.GetToken();
      const value = this.Expr();
      if (name === "count") return list.hasNumber ? list.length : 0;
      if (name === "average" || name === "mean") {
        if (name === "average" && !list.hasNumber) {
          this.error = true;
          return undefined;
        }
        return getDouble(value) / list.length;
      }
      return value;
    } finally {
      this.list = parent;
    }
  }
}
