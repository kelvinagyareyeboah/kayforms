// ============================================================================
// @kayforms/core — FieldNode
// ============================================================================
// Per-field reactive state. Each FieldNode is an isolated reactive island:
// changing field A does NOT trigger subscribers of field B.
// ============================================================================

import { createSignal, createComputed, type Signal, type Computed } from "./signal";
import {
  type FieldValidator,
  type FieldValidationConfig,
  runFieldValidatorsSync,
  runFieldValidators,
} from "./validation";
import { type Scheduler } from "./batch";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FieldNode<V = unknown> {
  /** Dot-separated path (e.g., 'address.city') */
  readonly path: string;
  /** Current value signal */
  readonly value: Signal<V>;
  /** Current error message (undefined = valid) */
  readonly error: Signal<string | undefined>;
  /** Whether the field has been touched (blurred) */
  readonly touched: Signal<boolean>;
  /** Whether the value differs from initial */
  readonly dirty: Computed<boolean>;
  /** Whether the field is currently validating (async) */
  readonly validating: Signal<boolean>;

  /** Update the value (triggers validation per config) */
  onChange(value: V): void;
  /** Mark as touched and trigger blur validation */
  onBlur(): void;
  /** Reset field to its initial value */
  reset(value?: V): void;
  /** Run validation manually */
  validate(): Promise<string | undefined>;
}

export interface FieldNodeConfig<V = unknown> extends FieldValidationConfig<V> {
  path: string;
  initialValue: V;
  scheduler: Scheduler;
  validateOn: "change" | "blur" | "submit";
  /** Callback when value changes (used by FormStore to update the values object) */
  onValueChange?: (path: string, value: V) => void;
  /** Callback when an action occurs (used by DevTools bridge) */
  onAction?: (action: string, path: string, prevValue: V, nextValue: V) => void;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export function createFieldNode<V = unknown>(
  config: FieldNodeConfig<V>
): FieldNode<V> {
  const {
    path,
    initialValue,
    validators: fieldValidators = [],
    scheduler,
    validateOn,
    onValueChange,
    onAction,
  } = config;

  let _initialValue = initialValue;

  const value = createSignal<V>(initialValue);
  const error = createSignal<string | undefined>(undefined);
  const touched = createSignal(false);
  const validating = createSignal(false);

  const dirty = createComputed(() => !Object.is(value.value, _initialValue));

  // Run sync validators immediately, schedule async validators
  function runValidation(val: V): void {
    // Immediate sync validation
    const syncError = runFieldValidatorsSync(val, fieldValidators as FieldValidator<V>[]);
    error.set(syncError);

    // Check if there are async validators (functions that return promises)
    const hasAsync = fieldValidators.some((v) => {
      const result = v(val);
      if (result instanceof Promise) {
        // Clean up the test promise
        result.catch(() => {});
        return true;
      }
      return false;
    });

    if (hasAsync && !syncError) {
      validating.set(true);
      scheduler.debounced(`validate:${path}`, async () => {
        const asyncError = await runFieldValidators(
          val,
          fieldValidators as FieldValidator<V>[]
        );
        error.set(asyncError);
        validating.set(false);
      });
    }
  }

  const field: FieldNode<V> = {
    path,
    value,
    error,
    touched,
    dirty,
    validating,

    onChange(next: V): void {
      const prev = value.peek();
      if (Object.is(prev, next)) return;

      value.set(next);
      onValueChange?.(path, next);
      onAction?.("SET_VALUE", path, prev, next);

      if (validateOn === "change") {
        runValidation(next);
      }
    },

    onBlur(): void {
      if (!touched.peek()) {
        touched.set(true);
        onAction?.("SET_TOUCHED", path, false as unknown as V, true as unknown as V);
      }

      if (validateOn === "blur" || validateOn === "change") {
        runValidation(value.peek());
      }
    },

    reset(newValue?: V): void {
      const resetValue = newValue ?? _initialValue;
      _initialValue = resetValue;
      value.set(resetValue);
      error.set(undefined);
      touched.set(false);
      validating.set(false);
      scheduler.cancel(`validate:${path}`);
    },

    async validate(): Promise<string | undefined> {
      validating.set(true);
      const result = await runFieldValidators(
        value.peek(),
        fieldValidators as FieldValidator<V>[]
      );
      error.set(result);
      validating.set(false);
      return result;
    },
  };

  return field;
}
