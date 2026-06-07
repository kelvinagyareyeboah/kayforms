2kb | Signal engine + form logic + validation |
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
