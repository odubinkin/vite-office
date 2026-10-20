/** @fileoverview Consumed original Operation default-admission/run dispatch for default sheet views;alternate-view conversion/protection/sync services remain unported. */
/** Native operation identities used by the represented deletion paths. */
export enum OperationType {
  DeleteContent = 4,
  DeleteCell = 5,
}
/** Original run dispatch for operations whose inherited canRunTheOperation returns true;no alternate-view service is simulated. */
export abstract class Operation {
  /** Stores original operation kind and recording/API controls. @param meType - Native kind. @param mbRecord - Record history. @param mbApi - API mode. @returns Operation. */
  protected constructor(
    readonly meType: OperationType,
    protected mbRecord: boolean,
    protected mbApi: boolean,
  ) {}
  /** Original default-admission run dispatch. @returns Actual operation result. */
  run(): boolean {
    return this.runImplementation();
  }
  /** Actual derived mutation. @returns Operation result. */
  protected abstract runImplementation(): boolean;
}
