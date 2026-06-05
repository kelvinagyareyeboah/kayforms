// ============================================================================
// @kayforms/core — Public API
// ============================================================================

// Signal primitives
export {
  createSignal,
  createComputed,
  createEffect,
  batch,
  untrack,
  type Signal,
  type Computed,
  type EffectCleanup,
} from "./signal";

// Form engine
export {
  createForm,
  type FormConfig,
  type FormStore,
  type FormErrors,
  type FieldValidators,
} from "./form";

// Field nodes
export { createFieldNode, type FieldNode, type FieldNodeConfig } from "./field";

// Validation
export {
  validators,
  withSchema,
  runFieldValidators,
  runFieldValidatorsSync,
  type ValidatorFn,
  type FieldValidator,
  type FieldValidationConfig,
  type ValidationResult,
} from "./validation";

// Batching / Scheduling
export {
  createScheduler,
  type Scheduler,
  type SchedulerOptions,
} from "./batch";

// Cross-form registry
export {
  getFormRegistry,
  createFormRegistry,
  resetGlobalRegistry,
  type FormRegistry,
} from "./registry";

// DevTools
export {
  createDevTools,
  type DevToolsBridge,
  type DevToolsConfig,
  type HistoryEntry,
} from "./devtools";
