l" typ


import { connectDevTools } fr
tor** — Tree view of form values, errors, touched state
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
