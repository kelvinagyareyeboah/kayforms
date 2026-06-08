<div align="center">

```
██╗  ██╗ █████╗ ██╗   ██╗███████╗ ██████╗ ██████╗ ███╗   ███╗███████╗
██║ ██╔╝██╔══██╗╚██╗ ██╔╝██╔════╝██╔═══██╗██╔══██╗████╗ ████║██╔════╝
█████╔╝ ███████║ ╚████╔╝ █████╗  ██║   ██║██████╔╝██╔████╔██║███████╗
██╔═██╗ ██╔══██║  ╚██╔╝  ██╔══╝  ██║   ██║██╔══██╗██║╚██╔╝██║╚════██║
██║  ██╗██║  ██║   ██║   ██║     ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████║
╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝
```

### ⏰ Forms with superpowers. Under 3KB. Runs at 60fps. **Travels through time.**

<br/>

[![npm version](https://img.shields.io/npm/v/@kayforms/core?style=for-the-badge&color=FF6B6B&labelColor=1a1a2e)](https://www.npmjs.com/package/@kayforms/core)
[![license](https://img.shields.io/npm/l/@kayforms/core?style=for-the-badge&color=45B7D1&labelColor=1a1a2e)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&labelColor=1a1a2e)](https://www.typescriptlang.org)
[![GitHub stars](https://img.shields.io/github/stars/kelvinagyareyeboah/kayforms?style=for-the-badge&color=FFD93D&labelColor=1a1a2e)](https://github.com/kelvinagyareyeboah/kayforms/stargazers)

<br/>

[✨ Quick Start](#-quick-start) · [⏳ Time Travel](#-time-travel-debugging) · [📦 Frameworks](#-framework-support) · [📖 API Docs](#-api-reference) · [🚀 Performance](#-performance) · [🤝 Contributing](#-contributing)

</div>

---

## 🤔 Why does this exist?

Every form library forces a trade-off.

**Fast but inflexible.** Or **flexible but slow.** Or **React-only.** Or **too big.**

KayForms says: *nah.* You get speed, flexibility, framework freedom, and a debugging superpower no other form library has.

```
Your form bugs? Rewind them. Literally.
```

---

## ✨ What makes KayForms different

<table>
<tr>
<th align="left">Feature</th>
<th align="center">KayForms</th>
<th align="center">React Hook Form</th>
<th align="center">Formik</th>
</tr>
<tr>
<td>⏳ Time travel debugging</td>
<td align="center">✅</td>
<td align="center">❌</td>
<td align="center">❌</td>
</tr>
<tr>
<td>🌍 Framework agnostic</td>
<td align="center">✅</td>
<td align="center">❌ React only</td>
<td align="center">❌ React only</td>
</tr>
<tr>
<td>⚡ Fine-grained re-renders</td>
<td align="center">✅</td>
<td align="center">⚠️ Uncontrolled only</td>
<td align="center">❌</td>
</tr>
<tr>
<td>🔗 Cross-form signals</td>
<td align="center">✅</td>
<td align="center">❌</td>
<td align="center">❌</td>
</tr>
<tr>
<td>📦 Bundle size</td>
<td align="center"><strong>&lt;3KB</strong></td>
<td align="center">9.2KB</td>
<td align="center">12KB</td>
</tr>
<tr>
<td>🏎️ 1000+ fields at 60fps</td>
<td align="center">✅</td>
<td align="center">❌</td>
<td align="center">❌</td>
</tr>
</table>

---

## ⚡ Quick Start

### Install

```bash
# Core (required)
npm install @kayforms/core

# Pick your framework
npm install @kayforms/react    # or vue, solid, svelte, angular, vanilla
```

### Your first form (React)

```tsx
import { createForm, field } from '@kayforms/react';
import { required, email, minLength } from '@kayforms/core';

function SignupForm() {
  const form = createForm({
    email:    field('', [required(), email()]),
    password: field('', [minLength(8)]),
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <input {...form.email.bind} placeholder="Email" />
      {form.email.error && <span className="error">{form.email.error}</span>}

      <input {...form.password.bind} type="password" placeholder="Password" />
      {form.password.error && <span className="error">{form.password.error}</span>}

      <button type="submit" disabled={!form.isValid()}>
        Sign up
      </button>
    </form>
  );
}
```

That's it. No `register()`. No `watch()`. No wrapping your brain around controlled vs uncontrolled.

---

## ⏳ Time Travel Debugging

> *"It's like a dashcam for your forms."*

This is the feature that makes KayForms genuinely different.

### What it actually does

Every keystroke is recorded.  
Every validation error is timestamped.  
Every async API call is logged.

Then you can:

- ⏪ **Rewind 50 steps** in one click
- 📤 **Export** the full timeline as JSON
- 📥 **Import** it on any machine
- 🔁 **Replay** the exact bug your user saw — on your laptop

All of this in **less than 1KB.**

### Enable it

```tsx
import { createForm, field, enableTimeTravel } from '@kayforms/react';

function DebuggableForm() {
  const form = createForm({
    email:    field(''),
    password: field(''),
  });

  enableTimeTravel(form, { maxHistory: 100 });

  return (
    <div>
      <form onSubmit={form.handleSubmit}>
        <input {...form.email.bind} placeholder="Email" />
        <input {...form.password.bind} type="password" placeholder="Password" />
        <button type="submit">Submit</button>
      </form>

      {/* Time travel controls */}
      <div className="debug-controls">
        <button onClick={() => form.undo()}>⏪ Undo</button>
        <button onClick={() => form.redo()}>⏩ Redo</button>
        <button onClick={() => console.log(form.exportHistory())}>📤 Export</button>
      </div>
    </div>
  );
}
```

### Report a bug *with proof*

```javascript
// Attach this JSON to your GitHub issue and we can replay it exactly
const timeline = form.exportHistory();
console.log(JSON.stringify(timeline, null, 2));
```

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
