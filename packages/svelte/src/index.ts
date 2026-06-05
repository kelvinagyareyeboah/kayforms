// ============================================================================
// @kayforms/svelte — Svelte Adapter
// ============================================================================
// Bridges Kayforms signals to Svelte's reactive stores.
// Enables using the Svelte `$store` template syntax directly.
// ============================================================================

import { onDestroy, setContext, getContext } from "svelte";
import {
  createForm,
  type FormConfig,
  type FormStore,
  type FormErrors,
  type FieldNode,
  type Signal,
  type Computed,
} from "@kayforms/core";

// ---------------------------------------------------------------------------
// Svelte Store Wrapper
// ---------------------------------------------------------------------------

export interface ReadableStore<T> {
  subscribe(run: (value: T) => void): () => void;
}

/**
 * Wrap a Kayforms Signal or Computed in a Svelte readable store.
 * Synchronously fires the current value to comply with Svelte store specifications.
 */
export function toStore<T>(signal: Signal<T> | Computed<T>): ReadableStore<T> {
  return {
    subscribe(run: (value: T) => void): () => void {
      // Svelte stores must call the callback immediately upon subscription
      run(signal.peek());
      return signal.subscribe(run);
    },
  };
}

// ---------------------------------------------------------------------------
// Context System
// ---------------------------------------------------------------------------

const FORM_KEY = "kayforms-form-context";

/** Provide form context inside a parent Svelte component */
export function setFormContext(store: FormStore<any>): void {
  setContext(FORM_KEY, store);
}

/** Retrieve form context inside a child Svelte component */
export function getFormContext(): FormStore<any> {
  const store = getContext<FormStore<any>>(FORM_KEY);
  if (!store) {
    throw new Error(
      "[kayforms/svelte] getFormContext must be used inside a component " +
        "where setFormContext(form.store) was called."
    );
  }
  return store;
}

// ---------------------------------------------------------------------------
// useForm (createFormStore)
// ---------------------------------------------------------------------------

export interface UseFormReturn<T extends Record<string, unknown>> {
  /** The reactive form store */
  store: FormStore<T>;
  /** Svelte store for values */
  values: ReadableStore<T>;
  /** Svelte store for errors */
  errors: ReadableStore<FormErrors<T>>;
  /** Svelte store for dirty state */
  dirty: ReadableStore<boolean>;
  /** Svelte store for validity */
  valid: ReadableStore<boolean>;
  /** Svelte store for submitting state */
  submitting: ReadableStore<boolean>;
  /** Svelte store for validating state */
  validating: ReadableStore<boolean>;
  /** Submit handler */
  handleSubmit: (e?: Event) => void;
  /** Reset form values */
  reset: (values?: Partial<T>) => void;
  /** Get a field node by path */
  getField: <V = unknown>(path: string) => FieldNode<V>;
}

/**
 * Create and manage a Kayforms form in a Svelte component.
 */
export function useForm<T extends Record<string, unknown>>(
  config: FormConfig<T>
): UseFormReturn<T> {
  const store = createForm(config);

  onDestroy(() => {
    store.dispose();
  });

  const values = toStore(store.values);
  const errors = toStore(store.errors);
  const dirty = toStore(store.dirty);
  const valid = toStore(store.valid);
  const submitting = toStore(store.submitting);
  const validating = toStore(store.validating);

  const handleSubmit = (e?: Event) => {
    e?.preventDefault();
    store.submit();
  };

  const reset = (newValues?: Partial<T>) => {
    store.reset(newValues);
  };

  return {
    store,
    values,
    errors,
    dirty,
    valid,
    submitting,
    validating,
    handleSubmit,
    reset,
    getField: store.getField,
  };
}

// ---------------------------------------------------------------------------
// useField (getFieldStore)
// ---------------------------------------------------------------------------

export interface UseFieldReturn<V = unknown> {
  /** Underlying field node */
  field: FieldNode<V>;
  /** Svelte store for field value */
  value: ReadableStore<V>;
  /** Svelte store for field error */
  error: ReadableStore<string | undefined>;
  /** Svelte store for touched state */
  touched: ReadableStore<boolean>;
  /** Svelte store for dirty state */
  dirty: ReadableStore<boolean>;
  /** Svelte store for validating state */
  validating: ReadableStore<boolean>;
  /** Triggered value update */
  onChange: (value: V) => void;
  /** Blur handler */
  onBlur: () => void;
  /** Props for binding to plain DOM inputs */
  inputProps: {
    value: V;
    onInput: (e: any) => void;
    onBlur: () => void;
  };
}

/**
 * Bind a single field's reactive signals in a Svelte component.
 */
export function useField<V = unknown>(path: string): UseFieldReturn<V> {
  const store = getFormContext();
  const field = store.getField<V>(path);

  const value = toStore(field.value);
  const error = toStore(field.error);
  const touched = toStore(field.touched);
  const dirty = toStore(field.dirty);
  const validating = toStore(field.validating);

  const onChange = (v: V) => field.onChange(v);
  const onBlur = () => field.onBlur();

  const handleInput = (e: any) => {
    field.onChange(e.target.value as V);
  };

  return {
    field,
    value,
    error,
    touched,
    dirty,
    validating,
    onChange,
    onBlur,
    get inputProps() {
      return {
        value: field.value.peek(),
        onInput: handleInput,
        onBlur,
      };
    },
  };
}
