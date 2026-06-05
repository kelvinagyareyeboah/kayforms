// ============================================================================
// @kayforms/vanilla — Vanilla JS Adapter
// ============================================================================
// Binds Kayforms signal-based forms to plain DOM elements.
// Supports both programmatic binding and declarative data-attribute binding.
// ============================================================================

import {
  createEffect,
  type FormStore,
  type FieldNode,
} from "@kayforms/core";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BindFieldOptions {
  /** Custom value extractor (default: el.value) */
  getValue?: (el: HTMLElement) => unknown;
  /** Custom value setter (default: el.value = ...) */
  setValue?: (el: HTMLElement, value: unknown) => void;
  /** CSS class to add when field has error */
  errorClass?: string;
  /** Element to display error message (created automatically if not provided) */
  errorElement?: HTMLElement;
}

export interface BindFormOptions extends BindFieldOptions {
  /** CSS class for error messages (default: 'kayform-error') */
  errorClass?: string;
  /** Whether to prevent default form submit (default: true) */
  preventDefault?: boolean;
}

// ---------------------------------------------------------------------------
// bindField — Bind a single input to a FieldNode
// ---------------------------------------------------------------------------

/**
 * Bind a DOM input element to a Kayforms FieldNode.
 * Automatically syncs value, error state, and touched state.
 * Returns an unbind function.
 *
 * @example
 * ```ts
 * const form = createForm({ initialValues: { email: '' } });
 * const emailInput = document.querySelector('#email');
 * const unbind = bindField(emailInput, form.getField('email'));
 * // Later: unbind();
 * ```
 */
export function bindField(
  element: HTMLElement,
  field: FieldNode,
  options: BindFieldOptions = {}
): () => void {
  const {
    getValue = (el) => (el as HTMLInputElement).value,
    setValue = (el, v) => {
      (el as HTMLInputElement).value = String(v ?? "");
    },
    errorClass = "kayform-error",
  } = options;

  const cleanups: (() => void)[] = [];

  // --- Sync value: signal → DOM ---
  const disposeValueEffect = createEffect(() => {
    const val = field.value.value;
    setValue(element, val);
  });
  cleanups.push(disposeValueEffect);

  // --- Sync value: DOM → signal ---
  const handleInput = () => {
    const domValue = getValue(element);
    field.onChange(domValue);
  };
  element.addEventListener("input", handleInput);
  cleanups.push(() => element.removeEventListener("input", handleInput));

  // For select, radio, checkbox
  const handleChange = () => {
    const el = element as HTMLInputElement;
    if (el.type === "checkbox") {
      field.onChange(el.checked);
    } else if (el.type === "radio") {
      if (el.checked) field.onChange(el.value);
    } else {
      field.onChange(getValue(element));
    }
  };
  element.addEventListener("change", handleChange);
  cleanups.push(() => element.removeEventListener("change", handleChange));

  // --- Blur → touched ---
  const handleBlur = () => field.onBlur();
  element.addEventListener("blur", handleBlur);
  cleanups.push(() => element.removeEventListener("blur", handleBlur));

  // --- Error display ---
  let errorEl = options.errorElement;
  if (!errorEl) {
    errorEl = document.createElement("span");
    errorEl.className = errorClass;
    errorEl.setAttribute("role", "alert");
    errorEl.setAttribute("aria-live", "polite");
    element.parentNode?.insertBefore(errorEl, element.nextSibling);
    cleanups.push(() => errorEl?.remove());
  }

  const disposeErrorEffect = createEffect(() => {
    const err = field.error.value;
    const isTouched = field.touched.value;
    if (errorEl) {
      errorEl.textContent = isTouched && err ? err : "";
      errorEl.style.display = isTouched && err ? "" : "none";
    }
    if (isTouched && err) {
      element.classList.add(errorClass);
      element.setAttribute("aria-invalid", "true");
    } else {
      element.classList.remove(errorClass);
      element.removeAttribute("aria-invalid");
    }
  });
  cleanups.push(disposeErrorEffect);

  // Return unbind function
  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
}

// ---------------------------------------------------------------------------
// bindForm — Bind an entire form element
// ---------------------------------------------------------------------------

/**
 * Bind a form element to a Kayforms FormStore.
 * Automatically binds all child inputs with `name` attributes.
 * Returns an unbind function.
 *
 * @example
 * ```ts
 * const form = createForm({
 *   initialValues: { email: '', password: '' },
 *   onSubmit: (values) => console.log(values),
 * });
 * const unbind = bindForm(document.querySelector('form'), form);
 * ```
 */
export function bindForm(
  formElement: HTMLFormElement,
  store: FormStore,
  options: BindFormOptions = {}
): () => void {
  const { preventDefault = true, ...fieldOptions } = options;
  const cleanups: (() => void)[] = [];

  // Find all named inputs
  const inputs = formElement.querySelectorAll<HTMLElement>(
    "input[name], select[name], textarea[name]"
  );

  for (const input of inputs) {
    const name = input.getAttribute("name");
    if (!name) continue;

    const field = store.getField(name);
    const unbind = bindField(input, field, fieldOptions);
    cleanups.push(unbind);
  }

  // Handle form submit
  const handleSubmit = (e: Event) => {
    if (preventDefault) {
      e.preventDefault();
    }
    store.submit();
  };
  formElement.addEventListener("submit", handleSubmit);
  cleanups.push(() =>
    formElement.removeEventListener("submit", handleSubmit)
  );

  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
}

// ---------------------------------------------------------------------------
// autoBindForm — Data-attribute-based declarative binding
// ---------------------------------------------------------------------------

/**
 * Automatically bind form elements using `data-kayform` attributes.
 *
 * @example
 * ```html
 * <form id="login">
 *   <input data-kayform="email" type="email" />
 *   <input data-kayform="password" type="password" />
 *   <button type="submit">Login</button>
 * </form>
 * ```
 * ```ts
 * const form = createForm({ initialValues: { email: '', password: '' } });
 * const unbind = autoBindForm(document.querySelector('#login'), form);
 * ```
 */
export function autoBindForm(
  formElement: HTMLFormElement,
  store: FormStore,
  options: BindFormOptions = {}
): () => void {
  const { preventDefault = true, ...fieldOptions } = options;
  const cleanups: (() => void)[] = [];

  // Find all elements with data-kayform attribute
  const elements = formElement.querySelectorAll<HTMLElement>("[data-kayform]");

  for (const el of elements) {
    const path = el.getAttribute("data-kayform");
    if (!path) continue;

    const field = store.getField(path);
    const unbind = bindField(el, field, fieldOptions);
    cleanups.push(unbind);
  }

  // Handle form submit
  const handleSubmit = (e: Event) => {
    if (preventDefault) {
      e.preventDefault();
    }
    store.submit();
  };
  formElement.addEventListener("submit", handleSubmit);
  cleanups.push(() =>
    formElement.removeEventListener("submit", handleSubmit)
  );

  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
}
