
cons, [required(), uniqueUsername]),
});
```

---

## 🚀 Performance

> Benchmarked on MacBook Pro M1 · Chrome 120 · 10 runs averaged

| Fields  | KayForms   | React Hook Form | | 100     | **60fps**  | 58fps           | 42fps    |
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
