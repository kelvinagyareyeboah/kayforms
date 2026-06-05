// ============================================================================
// @kayforms/solid — Solid JS Adapter
// ============================================================================
// Bridges Kayforms reactive signals to Solid's reactive Signal/Context systems.
// ============================================================================

import {
  createSignal,
  onCleanup,
  createContext,
  useContext,
  type JSX,
  type Accessor,
} from "solid-js";
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
// Signal → Solid Accessor bridge
// ---------------------------------------------------------------------------

/**
 * Hook to convert a Kayforms Signal or Computed into a Solid read-only Accessor.
 * Automatically handles subscriptions and cleanups on component teardown.
 */
export function useSignalValue<T>(signal: Signal<T> | Computed<T>): Accessor<T> {
  const [val, setVal] = createSignal<T>(signal.peek());
  const unsubscribe = signal.subscribe((next) => {
    setVal(() => next);
  });
  onCleanup(unsubscribe);
  return val;
}

// ---------------------------------------------------------------------------
// Context System
// ---------------------------------------------------------------------------

const FormContext = createContext<FormStore<any>>();

export interface FormProviderProps {
  form: FormStore<any>;
  children: JSX.Element;
}

/** Provides form context to child Solid components */
export function FormProvider(props: FormProviderProps) {
  return FormContext.Provider({
    value: props.form,
    get children() {
      return props.children;
    },
  });
}

/** Injects form context into child Solid components */
export function useFormContext(): FormStore<any> {
  const store = useContext(FormContext);
  if (!store) {
    throw new Error(
      "[kayforms/solid] useField must be used inside a <FormProvider> component."
    );
  }
  return store;
}

// ---------------------------------------------------------------------------
// useForm
// ---------------------------------------------------------------------------

export interface UseFormReturn<T extends Record<string, unknown>> {
  /** The reactive form store */
  store: FormStore<T>;
  /** Solid Accessor for values */
  values: Accessor<T>;
  /** Solid Accessor for errors */
  errors: Accessor<FormErrors<T>>;
  /** Solid Accessor for dirty state */
  dirty: Accessor<boolean>;
  /** Solid Accessor for validity */
  valid: Accessor<boolean>;
  /** Solid Accessor for submitting state */
  submitting: Accessor<boolean>;
  /** Solid Accessor for validating state */
  validating: Accessor<boolean>;
  /** Submission handler */
  handleSubmit: (e?: Event) => void;
  /** Reset form values */
  reset: (values?: Partial<T>) => void;
  /** Get a field node by path */
  getField: <V = unknown>(path: string) => FieldNode<V>;
}

/**
 * Create and manage a Kayforms form in a Solid JS component.
 */
export function useForm<T extends Record<string, unknown>>(
  config: FormConfig<T>
): UseFormReturn<T> {
  const store = createForm(config);

  onCleanup(() => {
    store.dispose();
  });

  const values = useSignalValue(store.values);
  const errors = useSignalValue(store.errors);
  const dirty = useSignalValue(store.dirty);
  const valid = useSignalValue(store.valid);
  const submitting = useSignalValue(store.submitting);
  const validating = useSignalValue(store.validating);

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
// useField
// ---------------------------------------------------------------------------

export interface UseFieldReturn<V = unknown> {
  /** Solid Accessor for field value */
  value: Accessor<V>;
  /** Solid Accessor for field error */
  error: Accessor<string | undefined>;
  /** Solid Accessor for touched state */
  touched: Accessor<boolean>;
  /** Solid Accessor for dirty state */
  dirty: Accessor<boolean>;
  /** Solid Accessor for validating state */
  validating: Accessor<boolean>;
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
 * Bind a single field's reactive signals in a Solid JS component.
 */
export function useField<V = unknown>(path: string): UseFieldReturn<V> {
  const store = useFormContext();
  const field = store.getField<V>(path);

  const value = useSignalValue(field.value);
  const error = useSignalValue(field.error);
  const touched = useSignalValue(field.touched);
  const dirty = useSignalValue(field.dirty);
  const validating = useSignalValue(field.validating);

  const onChange = (v: V) => field.onChange(v);
  const onBlur = () => field.onBlur();

  const handleInput = (e: any) => {
    field.onChange(e.target.value as V);
  };

  return {
    value,
    error,
    touched,
    dirty,
    validating,
    onChange,
    onBlur,
    get inputProps() {
      return {
        value: value(),
        onInput: handleInput,
        onBlur,
      };
    },
  };
}
