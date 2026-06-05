// ============================================================================
// @kayforms/vue — Vue 3 Adapter
// ============================================================================
// Bridges Kayforms reactive signals to Vue's reactive ref system.
// Each useField() injects the parent form context and resolves field states.
// ============================================================================

import {
  inject,
  provide,
  shallowRef,
  onUnmounted,
  defineComponent,
  type InjectionKey,
  type ShallowRef,
} from "vue";
import {
  createForm,
  createEffect,
  type FormConfig,
  type FormStore,
  type FormErrors,
  type FieldNode,
  type Signal,
  type Computed,
} from "@kayforms/core";

// ---------------------------------------------------------------------------
// Signal → Vue Ref bridge
// ---------------------------------------------------------------------------

/**
 * Hook to convert a Kayforms Signal or Computed to a Vue Ref.
 * Subscribes to the signal and updates the ref value, cleaning up on unmount.
 */
export function useSignalValue<T>(signal: Signal<T> | Computed<T>): ShallowRef<T> {
  const r = shallowRef<T>(signal.peek());
  const dispose = createEffect(() => {
    r.value = signal.value;
  });
  onUnmounted(dispose);
  return r;
}

// ---------------------------------------------------------------------------
// Injection Context
// ---------------------------------------------------------------------------

const FORM_KEY: InjectionKey<FormStore> = Symbol("kayforms");

/** Provide form context in a parent component */
export function provideForm(store: FormStore) {
  provide(FORM_KEY, store);
}

/** Inject form context in a child component */
export function useFormContext(): FormStore {
  const store = inject(FORM_KEY);
  if (!store) {
    throw new Error(
      "[kayforms/vue] useField must be used inside a form context. " +
        "Wrap your form with <FormProvider :form=\"...\"> or call provideForm(form.store)."
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
  /** Current values (reactive) */
  values: ShallowRef<T>;
  /** Current errors (reactive) */
  errors: ShallowRef<FormErrors<T>>;
  /** Whether the form is dirty */
  dirty: ShallowRef<boolean>;
  /** Whether the form is valid */
  valid: ShallowRef<boolean>;
  /** Whether the form is submitting */
  submitting: ShallowRef<boolean>;
  /** Whether any async validation is running */
  validating: ShallowRef<boolean>;
  /** Handle form submission */
  handleSubmit: (e?: Event) => void;
  /** Reset the form */
  reset: (values?: Partial<T>) => void;
  /** Get a field node by path */
  getField: <V = unknown>(path: string) => FieldNode<V>;
}

/**
 * Create and manage a Kayforms form in a Vue component.
 */
export function useForm<T extends Record<string, unknown>>(
  config: FormConfig<T>
): UseFormReturn<T> {
  const store = createForm(config);

  onUnmounted(() => {
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
  /** Current field value */
  value: ShallowRef<V>;
  /** Current error message (undefined = valid) */
  error: ShallowRef<string | undefined>;
  /** Whether the field has been touched */
  touched: ShallowRef<boolean>;
  /** Whether the field value differs from initial */
  dirty: ShallowRef<boolean>;
  /** Whether async validation is in progress */
  validating: ShallowRef<boolean>;
  /** Update the field value */
  onChange: (value: V) => void;
  /** Mark as touched */
  onBlur: () => void;
  /** Input props for binding */
  inputProps: {
    value: V;
    onInput: (e: Event) => void;
    onBlur: () => void;
  };
}

/**
 * Subscribe to a single field's reactive state in a Vue component.
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

  const handleInput = (e: Event) => {
    const val = (e.target as HTMLInputElement).value;
    field.onChange(val as unknown as V);
  };

  return {
    value,
    error,
    touched,
    dirty,
    validating,
    onChange,
    onBlur,
    inputProps: {
      value: value.value,
      onInput: handleInput,
      onBlur,
    },
  };
}

// ---------------------------------------------------------------------------
// FormProvider
// ---------------------------------------------------------------------------

export const FormProvider = defineComponent({
  name: "FormProvider",
  props: {
    form: {
      type: Object as () => FormStore<any>,
      required: true,
    },
  },
  setup(props, { slots }) {
    provideForm(props.form);
    return () => slots.default?.();
  },
});
