/** @fileoverview Original VCL task priorities and Task header boundary. */
export enum TaskPriority {
  HIGHEST,
  DEFAULT,
  HIGH_IDLE,
  RESIZE,
  REPAINT,
  SKIA_FLUSH,
  POST_PAINT,
  DEFAULT_IDLE,
  LOWEST,
  TOOLKIT_DEBUG,
}
/** Original number of priority queues. */
export const PRIO_COUNT = TaskPriority.TOOLKIT_DEBUG + 1;
export { Task } from "../source/app/scheduler";
