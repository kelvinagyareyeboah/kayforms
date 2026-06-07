// ============================================================================
// @kayforms/core — FormStore
// ============================================================================
// The main entry point for creating and managing forms. Creates a reactive
// FormStore with per-field granularity, form-level validation, and integration
// hooks for DevTools and cross-form registry.
// ============================================================================

import {
  createSignal,
  createComputed,
  batch,
  type Signal,
  type Computed,
} from "./signal";
import { createFieldNode, type FieldNode, type FieldNodeConfig } from "./field";
import {
  type ValidatorFn,
  type ValidationResult,
  type FieldValidator,
} from "./validation";
import { createScheduler, type Scheduler, type SchedulerOptions } from "./batch";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Nested error type: mirrors the form values shape with string errors */
export type FormErrors<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown>
    ? FormErrors<T[K]>
    : string;
};

/** Configuration for per-field validators */
export type FieldValidators<T> = {
  [K in keyof T]?: FieldValidator<T[K]>[];
};

/** Form configuration passed to createForm() */
export interface FormConfig<T extends Record<string, unknown>> {
  /** Unique form ID (required for cross-form signals and DevTools) */
  id?: string;
  /** Initial values for all fields */
  initialValues: T;
  /** Form-level validation function */
  validate?: ValidatorFn<T>;
  /** Per-field validators */
  fieldValidators?: FieldValidators<T>;
  /** When to trigger validation (default: 'blur') */
  validateOn?: "change" | "blur" | "submit";
  /** Submit handler */
  onSubmit?: (values: T) => void | Promise<void>;
  /** Scheduler options */
  scheduler?: SchedulerOptions;
}

/** The reactive form store returned by createForm() */
export interface FormStore<T extends Record<string, unknown> = Record<string, unknown>> {
  /** Unique form ID */
  readonly id: string | undefined;
  /** Reactive object containing all current values */
  readonly values: Signal<T>;
  /** Computed form-level errors */
  readonly errors: Computed<FormErrors<T>>;
  /** Whether any field has been touched */
  readonly touched: Computed<boolean>;
  /** Whether any field value differs from initial */
  readonly dirty: Computed<boolean>;
  /** Whether all fields are valid (no errors) */
  readonly valid: Computed<boolean>;
  /** Whether the form is currently submitting */
  readonly submitting: Signal<boolean>;
  /** Number of fields currently async-validating */
  readonly validating: Computed<boolean>;

  /** Get or create a FieldNode by dot-path */
  getField<V = unknown>(path: string): FieldNode<V>;
  /** Set a field value programmatically */
  setFieldValue(path: string, value: unknown): void;
  /** Set a field as touched */
  setFieldTouched(path: string, isTouched?: boolean): void;
  /** Reset the entire form (optionally with new initial values) */
  reset(values?: Partial<T>): void;
  /** Submit the form */
  submit(): Promise<void>;
  /** Validate all fields and return errors */
  validateAll(): Promise<FormErrors<T>>;
  /** Dispose the form and all subscriptions */
  dispose(): void;

  /** Access the internal scheduler */
  readonly _scheduler: Scheduler;
  /** Internal map of field nodes (for DevTools/time-travel) */
  readonly _fields?: Map<string, FieldNode<any>>;
  /** Internal form-level errors signal (for DevTools/time-travel) */
  readonly _formLevelErrors?: Signal<Record<string, string | undefined>>;
  /** DevTools action listener */
  _onAction?: (
    action: string,
    path: string | undefined,
    prevValue: unknown,
    nextValue: unknown
  ) => void;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Get a value from a nested object by dot path */
function getByPath(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

/** Set a value in a nested object by dot path (immutable — returns new object) */
function setByPath<T extends Record<string, unknown>>(
  obj: T,
  path: string,
  value: unknown
): T {
  const keys = path.split(".");
  if (keys.length === 1) {
    return { ...obj, [keys[0]]: value } as T;
  }

  const [head, ...rest] = keys;
  const child = (obj[head] ?? {}) as Record<string, unknown>;
  return {
    ...obj,
    [head]: setByPath(child, rest.join("."), value),
  } as T;
}

/** Flatten a nested object into dot-path keys */
function flattenKeys(
  obj: Record<string, unknown>,
  prefix = ""
): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      keys.push(...flattenKeys(value as Record<string, unknown>, fullPath));
    } else {
      keys.push(fullPath);
    }
  }
  return keys;
}

// ---------------------------------------------------------------------------
// createForm()
// ---------------------------------------------------------------------------

/**
 * Create a reactive form store.
 *
 * @example
 * ```ts
 * const form = createForm({
 *   id: 'login',
 *   initialValues: { email: '', password: '' },
 *   fieldValidators: {
 *     email: [validators.required(), validators.email()],
 *     password: [validators.required(), validators.minLength(8)],
 *   },
 *   validateOn: 'blur',
 *   onSubmit: async (values) => {
 *     await api.login(values);
 *   },
 * });
 * ```
 */
export function createForm<T extends Record<string, unknown>>(
  config: FormConfig<T>
): FormStore<T> {
  const {
    id,
    initialValues,
    validate: formValidator,
    fieldValidators: fieldValidatorsMap = {} as FieldValidators<T>,
    validateOn = "blur",
    onSubmit,
    scheduler: schedulerOptions,
  } = config;

  const scheduler = createScheduler(schedulerOptions);
  const fieldNodes = new Map<string, FieldNode>();
  let _initialValues = { ...initialValues };

  // --- Core signals ---
  const values = createSignal<T>({ ...initialValues });
  const submitting = createSignal(false);
  const formLevelErrors = createSignal<ValidationResult>({});

  // DevTools action listener (set by registry/devtools)
  let _onAction:
    | ((
        action: string,
        path: string | undefined,
        prevValue: unknown,
        nextValue: unknown
      ) => void)
    | undefined;

  // --- Computed signals ---
  const errors = createComputed<FormErrors<T>>(() => {
    const allErrors: Record<string, string | undefined> = {
      ...formLevelErrors.value,
    };

    // Collect field-level errors
    for (const [path, field] of fieldNodes) {
      const fieldError = field.error.value;
      if (fieldError) {
        allErrors[path] = fieldError;
      }
    }

    // Convert flat errors to nested object matching T shape
    const nested: Record<string, unknown> = {};
    for (const [path, error] of Object.entries(allErrors)) {
      if (error) {
        const keys = path.split(".");
        let current = nested;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]] || typeof current[keys[i]] !== "object") {
            current[keys[i]] = {};
          }
          current = current[keys[i]] as Record<string, unknown>;
        }
        current[keys[keys.length - 1]] = error;
      }
    }

    return nested as FormErrors<T>;
  });

  const touched = createComputed(() => {
    for (const field of fieldNodes.values()) {
      if (field.touched.value) return true;
    }
    return false;
  });

  const dirty = createComputed(() => {
    for (const field of fieldNodes.values()) {
      if (field.dirty.value) return true;
    }
    return false;
  });

  const valid = createComputed(() => {
    // Check form-level errors
    const fErrors = formLevelErrors.value;
    for (const key of Object.keys(fErrors)) {
      if (fErrors[key]) return false;
    }
    // Check field-level errors
    for (const field of fieldNodes.values()) {
      if (field.error.value) return false;
    }
    return true;
  });

  const validating = createComputed(() => {
    for (const field of fieldNodes.values()) {
      if (field.validating.value) return true;
    }
    return false;
  });

  // --- Field management ---
  function getField<V = unknown>(path: string): FieldNode<V> {
    let field = fieldNodes.get(path);
    if (!field) {
      const initialValue = getByPath(_initialValues, path);
      const fieldConfig: FieldNodeConfig = {
        path,
        initialValue,
        validators: (fieldValidatorsMap as Record<string, FieldValidator[]>)[path] ?? [],
        scheduler,
        validateOn,
        onValueChange: (p: string, v: unknown) => {
          const current = values.peek();
          values.set(setByPath(current, p, v));

          // Run form-level validation if configured
          if (formValidator) {
            scheduler.debounced("form-validate", () => {
              const result = formValidator(values.peek());
              if (result instanceof Promise) {
                result.then((r) => formLevelErrors.set(r));
              } else {
                formLevelErrors.set(result);
              }
            });
          }
        },
        onAction: (action, p, prev, next) => {
          _onAction?.(action, p, prev, next);
        },
      };
      field = createFieldNode(fieldConfig);
      fieldNodes.set(path, field);
    }
    return field as FieldNode<V>;
  }

  // Pre-create field nodes for all initial value paths
  const initialPaths = flattenKeys(initialValues as Record<string, unknown>);
  for (const path of initialPaths) {
    getField(path);
  }

  // --- Form store ---
  const store: FormStore<T> = {
    id,
    values,
    errors,
    touched,
    dirty,
    valid,
    submitting,
    validating,
    _scheduler: scheduler,
    _fields: fieldNodes,
    _formLevelErrors: formLevelErrors,

    get _onAction() {
      return _onAction;
    },
    set _onAction(
      fn:
        | ((
            action: string,
            path: string | undefined,
            prevValue: unknown,
            nextValue: unknown
          ) => void)
        | undefined
    ) {
      _onAction = fn;
    },

    getField,

    setFieldValue(path: string, value: unknown): void {
      const field = getField(path);
      field.onChange(value);
    },

    setFieldTouched(path: string, isTouched = true): void {
      const field = getField(path);
      if (isTouched) {
        field.onBlur();
      }
    },

    reset(newValues?: Partial<T>): void {
      const resetValues = { ..._initialValues, ...newValues } as T;
      _initialValues = { ...resetValues };

      batch(() => {
        values.set({ ...resetValues });
        formLevelErrors.set({});
        submitting.set(false);

        // Reset all field nodes
        for (const [path, field] of fieldNodes) {
          const fieldValue = getByPath(resetValues, path);
          field.reset(fieldValue);
        }
      });

      _onAction?.("RESET", undefined, undefined, resetValues);
    },

    async submit(): Promise<void> {
      // Touch all fields
      for (const field of fieldNodes.values()) {
        field.onBlur();
      }

      // Validate all fields
      const allErrors = await store.validateAll();
      const hasErrors = Object.keys(allErrors).length > 0;

      if (hasErrors) {
        return;
      }

      submitting.set(true);
      _onAction?.("SUBMIT", undefined, undefined, values.peek());

      try {
        await onSubmit?.(values.peek());
      } finally {
        submitting.set(false);
      }
    },

    async validateAll(): Promise<FormErrors<T>> {
      const fieldErrors: Record<string, string | undefined> = {};

      // Validate all fields
      const validationPromises = [...fieldNodes.entries()].map(
        async ([path, field]) => {
          const error = await field.validate();
          if (error) {
            fieldErrors[path] = error;
          }
        }
      );
      await Promise.all(validationPromises);

      // Run form-level validation
      if (formValidator) {
        const result = formValidator(values.peek());
        const formErrors =
          result instanceof Promise ? await result : result;
        formLevelErrors.set(formErrors);
        Object.assign(fieldErrors, formErrors);
      }

      return fieldErrors as FormErrors<T>;
    },

    dispose(): void {
      scheduler.cancelAll();
      fieldNodes.clear();
    },
  };

  return store;
}
