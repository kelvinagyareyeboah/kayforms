

      <form onSubmit={handleSubmit}>
        <EmailField />
        <PasswordField />
        <button disabled={!valid || submitting}>Login</button>
      </form>
    </FormProvider>
  );
}

function EmailField() {
  const { inputProps, error, touched } = useField('email');
  return (
    <div>
      <input {...inputProps} type="email" placeholder="Email" />
      {touched && error && <span className="error">{error}</span>}
    </div>
  );
}
```

### Vanilla JS

```ts
import { createForm, validators } from '@kayforms/core';
import { bindForm } from '@kayforms/vanilla';

const form = createForm({
  initialValues: { email: '', password: '' },
  fieldValidators: {
    email: [validators.required(), validators.email()],
    password: [validators.required(), validators.minLength(8)],
  },
  onSubmit: (values) => console.log('Submit:', values),
});

const unbind = bindForm(document.querySelector('#login-form'), form);
```

```html
<form id="login-form">
  <input name="email" type="email" />
  <input name="password" type="password" />
  <button type="submit">Login</button>
</form>
```

---

## Cross-form signals

Forms can react to each other through the registry:

```ts
import { createForm, createComputed, getFormRegistry } from '@kayforms/core';

const registry = getFormRegistry();

const profileForm = createForm({ id: 'profile', initialValues: { name: '' } });
const paymentForm = createForm({ id: 'payment', initialValues: { card: '' } });

registry.register(profileForm);
registry.register(paymentForm);

// Reactive: updates automatically when either form changes
const canCheckout = createComputed(() => {
  const profile = registry.get('profile');
  const payment = registry.get('payment');
  return (profile?.valid.value ?? false) && (payment?.valid.value ?? false);
});
```

---

## Time-travel debugging

One line to enable:

```ts
import { connectDevTools } from '@kayforms/devtools';

const devtools = connectDevTools(form);
// That's it! A floating panel appears with timeline + state inspector
```

Features:
- ⏪ **Undo/Redo** — Step backward and forward through form history
- 🎚️ **Timeline scrubber** — Drag to any point in time
- 🌳 **State inspector** — Tree view of form values, errors, touched state
- 📊 **Action log** — Every mutation with timestamps and value diffs
- 🔮 **Minimizable** — Collapses to a floating orb when not needed

---

## Schema validation (Zod, Yup, Valibot)

```ts
import { createForm, withSchema } from '@kayforms/core';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const form = createForm({
  initialValues: { email: '', password: '' },
  validate: withSchema(schema),
});
```

---

## Signals API

Kayforms is built on its own signal engine. You can use it directly:

```ts
import { createSignal, createComputed, createEffect, batch } from '@kayforms/core';

const count = createSignal(0);
const doubled = createComputed(() => count.value * 2);

createEffect(() => {
  console.log(`Count: ${count.value}, Doubled: ${doubled.value}`);
});

batch(() => {
  count.set(5);
  count.set(10); // Only one notification
});
```

---

## Packages

| Package | Size | Description |
|---------|------|-------------|
| `@kayforms/core` | ~2kb | Signal engine + form logic + validation |
| `@kayforms/react` | ~1kb | React hooks (useForm, useField, FormProvider) |
| `@kayforms/vanilla` | ~1kb | DOM binding (bindForm, bindField, autoBindForm) |
| `@kayforms/devtools` | ~3kb | Floating debug panel with time-travel |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Your App                        │
├──────────┬──────────┬───────────┬────────────────┤
│  React   │  Vue*    │  Vanilla  │  Svelte*       │
│  Adapter │  Adapter │  Adapter  │  Adapter       │
├──────────┴──────────┴───────────┴────────────────┤
│              @kayforms/core                       │
│  ┌──────────┬───────────┬────────────┬─────────┐ │
│  │ Signals  │ FormStore │ Validation │ Registry│ │
│  │ Engine   │ + Fields  │ Pipeline   │ (Cross) │ │
│  └──────────┴───────────┴────────────┴─────────┘ │
│              @kayforms/devtools                   │
│  ┌──────────┬───────────┬────────────┐           │
│  │ History  │ Timeline  │ State      │           │
│  │ Engine   │ Scrubber  │ Inspector  │           │
│  └──────────┴───────────┴────────────┘           │
└─────────────────────────────────────────────────┘
  * Vue, Svelte, Solid, Angular adapters coming soon
```

---

## License

MIT
