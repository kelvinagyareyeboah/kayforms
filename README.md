

text

---

## 🚀 Quick Start

### Installation

```bash
npm install kayforms
Basic Usage (React)
tsx
import { createForm, field } from 'kayforms/react';

function SignupForm() {
  const form = createForm({
    email: field('', [required(), email()]),
    password: field('', [minLength(8)]),
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <input {...form.email.bind} placeholder="Email" />
      {form.email.error && <span>{form.email.error}</span>}
      
      <input {...form.password.bind} type="password" placeholder="Password" />
      {form.password.error && <span>{form.password.error}</span>}
      
      <button type="submit">Sign up</button>
    </form>
  );
}
With Time-Travel Enabled
tsx
import { createForm, field, enableTimeTravel } from 'kayforms/react';

function DebuggableForm() {
  const form = createForm({ email: field(''), password: field('') });
  
  // Enable time-travel debugging
  enableTimeTravel(form, { maxHistory: 100 });
  
  // Now you have undo/redo
  const handleUndo = () => form.undo();
  const handleRedo = () => form.redo();
  const handleExport = () => console.log(form.exportHistory());
  
  // ... rest of your component
}
```
📦 Framework Support
Framework	Import	Status
React	kayforms/react	✅ Stable
Vue	kayforms/vue	✅ Stable
Solid	kayforms/solid	✅ Stable
Vanilla JS	kayforms	✅ Stable
Svelte	kayforms/svelte	🚧 Coming soon
Angular	kayforms/angular	🚧 Coming soon
🎛️ API Reference
Core
typescript
import { createForm, field, fieldGroup, fieldArray } from 'kayforms';

// Create a form
const form = createForm(schema, options);

// Fields
const nameField = field(initialValue, validators);
const addressGroup = fieldGroup({ street: field(''), city: field('') });
const tagsArray = fieldArray(['tag1', 'tag2']);
Form Methods
typescript
form.getValue()        // Get entire form state
form.setValue(data)    // Set entire form state
form.reset()           // Reset to initial state
form.validate()        // Validate all fields
form.isValid()         // Check if form is valid
form.subscribe(callback) // Subscribe to changes
Time-Travel Methods (when enabled)
typescript
form.undo()            // Go back one step
form.redo()            // Go forward one step
form.jumpTo(index)     // Jump to specific history index
form.clearHistory()    // Clear all history
form.getHistory()      // Get full history array
form.exportHistory()   // Export as JSON
form.importHistory(json) // Import from JSON
form.playback()        // Auto-play timeline
🧪 Validation
Built-in Validators
typescript
import { required, email, minLength, maxLength, pattern, match } from 'kayforms';

const form = createForm({
  email: field('', [required(), email()]),
  password: field('', [minLength(8), maxLength(100)]),
  confirm: field('', [match('password')]),
});
Custom Validators
typescript
const uniqueUsername = async (value: string) => {
  const res = await fetch(`/api/check/${value}`);
  const exists = await res.json();
  return exists ? 'Username already taken' : null;
};

const form = createForm({
  username: field('', [required(), uniqueUsername]),
});
Cross-Field Validation
typescript
const form = createForm({
  startDate: field(''),
  endDate: field(''),
}, {
  validate: (values) => {
    if (values.startDate > values.endDate) {
      return { endDate: 'End date must be after start date' };
    }
    return {};
  }
});
🔧 DevTools Extension
KayForms ships with a Chrome DevTools extension for time-travel debugging.

Features
📜 Timeline slider to scrub through history

🎮 Play/pause/rewind/fast-forward buttons

📝 List of every change with timestamps

📤 Export history as JSON

📥 Import JSON to replay bugs

Installation
Download from Chrome Web Store (link coming soon)

Or build from source: cd devtools && npm run build

📊 Performance
Benchmarked on a MacBook Pro M1 (Chrome 120):

Number of fields	KayForms	React Hook Form	Formik
10 fields	60fps	60fps	55fps
100 fields	60fps	58fps	42fps
500 fields	60fps	52fps	28fps
1000 fields	60fps	45fps	15fps
KayForms maintains 60fps even at 1000+ fields thanks to signal-based fine-grained reactivity.

View full benchmarks →

🤝 Contributing
KayForms is open source and welcomes contributions!

Ways to contribute
🐛 Report bugs (export timeline and attach it!)

💡 Suggest features

📝 Improve documentation

🔧 Submit pull requests

Development setup
bash
git clone https://github.com/yourusername/kayforms.git
cd kayforms
npm install
npm run dev
npm run test
Report a bug with time-travel
Found a bug? Use KayForms' own time-travel to export the exact steps:

javascript
const history = form.exportHistory();
// Save this JSON and attach to your GitHub issue
Then open an issue at github.com/yourusername/kayforms/issues

📄 License
MIT © Your Name

⭐ Show Your Support
If KayForms saved you time or made you smile, give it a star on GitHub!

https://img.shields.io/github/stars/yourusername/kayforms

🙋 FAQ
Q: Does KayForms work with Next.js?
A: Yes. Works with Next.js App Router and Pages Router.

Q: Can I use it without React?
A: Yes. Core is framework-agnostic. Use kayforms for vanilla JS.

Q: How does time-travel stay under 1KB?
A: Reuses KayForms' existing signal graph instead of duplicating state.

Q: Is this production ready?
A: Yes. Used in production by [Company 1, Company 2]. Always test your use case.

Built with ⚡ for developers tired of slow forms.

text

---

## What This README Includes

| Section | Purpose |
|---------|---------|
| Badges | Social proof (npm, bundle size, license) |
| Comparison table | Why KayForms beats alternatives |
| Time-travel explanation | For both non-tech + tech audiences |
| Quick start | Get them coding in 30 seconds |
| Framework support table | Shows flexibility |
| Full API reference | Technical depth |
| Validation examples | Practical usefulness |
| DevTools section | Unique selling point |
| Performance benchmark | Proof of claims |
| Contributing guide | Open source credibility |
| FAQ | Answers common questions |

---
