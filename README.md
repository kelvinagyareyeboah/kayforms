makes KayForm          <input {...form.email.bind} placeholder="      <div className="debug-controls">
        <button onClick={() => form.undo()}>⏪ Undo</button>
        <button onClick={() => form.redo()}>⏩ Redo</button>
        <button onClick={() => console.lo// Attach this JSON to your GitHub issue and we can replay it exactly
const timeline = form.e
console.log(JSON.s

No more "I can't reproduce it." No more guessing. Just facts.

---

## 📦 Framework Support

KayForms runs anywhere JavaScript runs.

| Framework  | Package               | Status      |
|------------|-----------------------|-------------|
| ⚛️ React   | `@kayforms/react`     | ✅ Stable   |
| 💚 Vue     | `@kayforms/vue`       | ✅ Stable   |
| 🔥 Solid   | `@kayforms/solid`     | ✅ Stable   |
| 🔶 Svelte  | `@kayforms/svelte`    | ✅ Stable   |
| 🔴 Angular | `@kayforms/angular`   | ✅ Stable   |
| 🟨 Vanilla | `@kayforms/vanilla`   | ✅ Stable   |

```bash
npm install @kayforms/core          # Always required
npm install @kayforms/[framework]   # Your choice
npm install @kayforms/devtools      # Optional Chrome DevTools panel
```

---

## 📖 API Reference

### `createForm`

```typescript
import { createForm, field, fieldGroup, fieldArray } from '@kayforms/core';

const form = createForm(schema, options);

form.getValue()            // → entire form state
form.setValue(data)        // ← set entire form state
form.reset()               // ← reset to initial values
form.validate()            // → runs all validators
form.isValid()             // → boolean
form.subscribe(callback)   // → unsubscribe function
```

### Time Travel

```typescript
enableTimeTravel(form, { maxHistory: 100 });

form.undo()                // step back
form.redo()                // step forward
form.jumpTo(index)         // jump to specific point in history
form.getHistory()          // → full history array
form.clearHistory()        // wipe the timeline
form.exportHistory()       // → JSON string
form.importHistory(json)   // ← load from JSON
```

### Built-in Validators

```typescript
import { required, email, minLength, maxLength, pattern, match } from '@kayforms/core';

const form = createForm({
  username: field('',  [required()]),
  email:    field('',  [required(), email()]),
  password: field('',  [required(), minLength(8), maxLength(100)]),
  confirm:  field('',  [match('password')]),
});
```

### Custom Async Validators

```typescript
const uniqueUsername = async (value: string) => {
  const res = await fetch(`/api/users/check/${value}`);
  const { exists } = await res.json();
  return exists ? 'Username is already taken' : null;
};

const form = createForm({
  username: field('', [required(), uniqueUsername]),
});
```

---

## 🚀 Performance

> Benchmarked on MacBook Pro M1 · Chrome 120 · 10 runs averaged

| Fields  | KayForms   | React Hook Form | Formik   |
|---------|------------|-----------------|----------|
| 10      | **60fps**  | 60fps           | 55fps    |
| 100     | **60fps**  | 58fps           | 42fps    |
| 500     | **60fps**  | 52fps           | 28fps    |
| 1,000+  | **60fps**  | 45fps           | 15fps    |

KayForms uses a fine-grained signal architecture — only the exact field that changed re-renders. Nothing else. Not the parent. Not the siblings. Just the signal.

---

## 🤝 Contributing

Open source. PRs welcome. Here's how to jump in.

### Setup

```bash
git clone https://github.com/kelvinagyareyeboah/kayforms.git
cd kayforms
npm install
npm run dev    # start dev server
npm run test   # run test suite
```

### Ways to help

- 🐛 **Found a bug?** Export your timeline JSON and [open an issue](https://github.com/kelvinagyareyeboah/kayforms/issues) — we can replay it exactly
- 💡 **Have an idea?** Open a discussion before a PR so we can align first
- 📝 **Docs unclear?** PRs for docs are always welcome, no issue needed
- ⭐ **Just want to help?** Star the repo — it matters more than you'd think

---

## 📄 License

MIT © [Kelvin Agyare-Yeboah](https://github.com/kelvinagyareyeboah)

Use it. Modify it. Ship it. Just keep the copyright notice.

---

<div align="center">

**Built for developers tired of fighting their form library.**

If KayForms made your life easier, [give it a star](https://github.com/kelvinagyareyeboah/kayforms/stargazers) ⭐

*It helps more people find it.*

</div>
