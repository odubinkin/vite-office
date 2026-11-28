/** @fileoverview Writer's native numeric field-expression parser and variable table. */

/** One token in the native numeric expression grammar. */
type CalcToken =
  | { kind: "number"; value: number }
  | { kind: "name"; value: string }
  | { kind: "operator"; value: string }
  | { kind: "end" };

const tokenPattern =
  /\s*(?:(\d+(?:\.\d*)?|\.\d+)([Ee][+-]?\d+)?|([\p{Letter}_][\p{Letter}\p{Number}_.]*)|\[((?:\\\]|[^\]])*)\]|(==|!=|<=|>=|[=+\-*/^()%<>!]))/uy;
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

/** Numeric portion of the original Writer field calculator. */
export class SwCalc {
  private readonly variables = new Map<string, number>();
  private expression = "";
  private index = 0;
  private current: CalcToken = { kind: "end" };
  private error = false;

  /** Changes the original case-insensitive numeric variable table. @param name - Writer variable name. @param value - Native numeric value. */
  public VarChange(name: string, value: number): void {
    this.variables.set(name.toLowerCase(), value);
  }

  /** Reads the existing value of an original named expression. @param name - Writer variable name. @returns Last assigned numeric value. */
  public GetVariable(name: string): number | undefined {
    return this.variables.get(name.toLowerCase());
  }

  /** Evaluates a native numeric field expression. @param formula - Writer expression. @returns Calculated value when the expression is valid and non-void. */
  public Calculate(formula: string): number | undefined {
    this.expression = formula.trim();
    this.index = 0;
    this.error = false;
    this.GetToken();
    const result = this.Expr();
    return this.error || this.current.kind !== "end" || !Number.isFinite(result)
      ? undefined
      : result;
  }

  /** Reads the next numeric token of the original expression. */
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
      this.current =
        termOperators.has(name) || name === "not"
          ? { kind: "operator", value: name }
          : { kind: "name", value: name };
    } else {
      this.current = { kind: "operator", value: match[5] as string };
    }
  }

  /** Checks the active operator without advancing the token stream. @param operator - Native operation. @returns Whether active. */
  private At(operator: string): boolean {
    return this.current.kind === "operator" && this.current.value === operator;
  }

  /** Original additive expression level. @returns Number or void. */
  private Expr(): number | undefined {
    let left = this.Term();
    while (this.At("+") || this.At("-")) {
      const add = this.At("+");
      this.GetToken();
      const right = this.Term() ?? 0;
      left = (left ?? 0) + (add ? right : -right);
    }
    return left;
  }

  /** Original shared level for multiplication, comparison and numeric boolean operators. @returns Number or void. */
  private Term(): number | undefined {
    let left = this.Prim();
    while (this.current.kind === "operator" && termOperators.has(this.current.value)) {
      const operator = this.current.value;
      this.GetToken();
      const right = this.Prim() ?? 0;
      const a = left ?? 0;
      switch (operator) {
        case "*":
          left = a * right;
          break;
        case "/":
          left = a / right;
          break;
        case "mod":
          left = (a | 0) % (right | 0);
          break;
        case "==":
          left = Number(a === right);
          break;
        case "!=":
          left = Number(a !== right);
          break;
        case "<":
          left = Number(a < right);
          break;
        case ">":
          left = Number(a > right);
          break;
        case "<=":
          left = Number(a <= right);
          break;
        case ">=":
          left = Number(a >= right);
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
      if (!Number.isFinite(left)) this.error = true;
    }
    return left;
  }

  /** Original right-recursive power and primary expression level. @returns Number or void. */
  private Prim(): number | undefined {
    const token = this.current;
    this.GetToken();
    let value: number | undefined;
    switch (token.kind) {
      case "number":
        if (this.At("%")) {
          this.GetToken();
          return token.value * 0.01;
        }
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
        if (func) return func(this.Prim() ?? 0);
        value = this.variables.get(token.value);
        if (value === undefined && this.At("(")) this.error = true;
        break;
      }
      case "operator":
        if (token.value === "-") return -(this.Prim() ?? 0);
        if (token.value === "!" || token.value === "not") return Number(!(this.Prim() ?? 0));
        if (token.value !== "(") {
          this.error = true;
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
      value = (value ?? 0) ** (this.Prim() ?? 0);
      if (!Number.isFinite(value)) this.error = true;
    }
    return value;
  }
}
