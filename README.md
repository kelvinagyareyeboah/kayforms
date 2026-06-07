
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
