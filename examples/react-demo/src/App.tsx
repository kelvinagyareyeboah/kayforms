ottom: 32px;
    border-bottom: 1px s  .header-left { display: flex; align-items: center; gap
    width: 38px; height: 38px;
    background: var(--accent);
    border-radius: var(--radius-md);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 600; color: #fff;
    letter-spacing: -0.5px;
  }
  .brand-name {
    font-size: 17px; font-weight: 600; letter-spacing: -0.3px; color: var(--text-1);
  }
  .brand-sub { font-size: 12px; color: var(--text-3); margin-top: 1px; }
  .header-badges { display: flex; gap: 8px; }
  .badge {
    font-size: 11px; font-family: var(--mono);
    padding: 4px 10px; border-radius: 20px;
    border: 1px solid var(--border-md);
    color: var(--text-2);
    background: var(--bg-raised);
    letter-spacing: 0.2px;
  }
  .badge.accent { border-color: var(--accent-glow); color: var(--accent); background: var(--accent-dim); }

  /* ─── Content grid ───────────────────────────── */
  .content-grid {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 16px;
    align-items: start;
  }
  @media (max-width: 900px) { .content-grid { grid-template-columns: 1fr; } }

  /* ─── Cards ──────────────────────────────────── */
  .card {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    overflow: hidden;
  }
  .card-inner { padding: 28px; }

  /* ─── Wizard steps ───────────────────────────── */
  .wizard-nav {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 20px 28px;
    border-bottom: 1px solid var(--border);
  }
  .step-item {
    display: flex; align-items: center; gap: 10px;
    cursor: pointer; padding: 6px 0;
  }
  .step-dot {
    width: 26px; height: 26px;
    border-radius: 50%;
    border: 1.5px solid var(--border-md);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 600; font-family: var(--mono);
    color: var(--text-3);
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .step-item.active .step-dot {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-dim);
    box-shadow: 0 0 0 4px var(--accent-dim);
  }
  .step-item.done .step-dot {
    border-color: var(--success);
    color: var(--success);
    background: rgba(34,197,94,0.1);
  }
  .step-label {
    font-size: 12px; font-weight: 500; color: var(--text-3);
    transition: color 0.2s;
    white-space: nowrap;
  }
  .step-item.active .step-label { color: var(--text-1); }
  .step-item.done .step-label { color: var(--text-2); }
  .step-divider {
    flex: 1; height: 1px; background: var(--border); margin: 0 10px;
  }

  /* ─── Form elements ──────────────────────────── */
  .form-body { padding: 28px; }
  .form-group { margin-bottom: 20px; }
  .form-label {
    display: block;
    font-size: 12px; font-weight: 500; letter-spacing: 0.4px;
    color: var(--text-2); text-transform: uppercase;
    margin-bottom: 8px;
  }
  .form-label .req { color: var(--accent); margin-left: 2px; }

  .input-wrap { position: relative; }
  .input-wrap input,
  .input-wrap select {
    width: 100%;
    padding: 10px 14px;
    background: var(--bg-input);
    border: 1px solid var(--border-md);
    border-radius: var(--radius-md);
    color: var(--text-1);
    font-family: var(--sans);
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    appearance: none;
    -webkit-appearance: none;
  }
  .input-wrap input::placeholder { color: var(--text-3); }
  .input-wrap input:focus,
  .input-wrap select:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-dim);
  }
  .input-wrap.has-error input,
  .input-wrap.has-error select {
    border-color: var(--danger);
    box-shadow: 0 0 0 3px rgba(248,113,113,0.12);
  }
  .input-wrap.is-valid input,
  .input-wrap.is-valid select {
    border-color: rgba(34,197,94,0.4);
  }
  .input-wrap select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%236b7280' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
    cursor: pointer;
  }
  .input-wrap select option { background: #18191d; }

  .field-error {
    display: flex; align-items: center; gap: 5px;
    font-size: 11px; color: var(--danger);
    margin-top: 6px; font-weight: 500;
  }
  .field-error::before { content: '●'; font-size: 6px; }

  .checkbox-row {
    display: flex; align-items: center; gap: 10px;
    cursor: pointer;
    padding: 12px 14px;
    background: var(--bg-input);
    border: 1px solid var(--border-md);
    border-radius: var(--radius-md);
    transition: border-color 0.15s;
  }
  .checkbox-row:hover { border-color: var(--border-md); }
  .checkbox-row input[type=checkbox] {
    width: 16px; height: 16px; flex-shrink: 0;
    accent-color: var(--accent);
    cursor: pointer;
  }
  .checkbox-row span { font-size: 13px; color: var(--text-2); }

  /* ─── Inline info box ────────────────────────── */
  .info-box {
    padding: 12px 14px;
    background: var(--bg-input);
    border: 1px solid var(--border-md);
    border-radius: var(--radius-md);
    font-size: 13px;
    color: var(--text-2);
    line-height: 1.5;
  }

  /* ─── Form footer / buttons ──────────────────── */
  .form-footer {
    display: flex; justify-content: space-between; align-items: center;
    padding: 20px 28px;
    border-top: 1px solid var(--border);
  }
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 20px;
    font-family: var(--sans); font-size: 13px; font-weight: 500;
    border-radius: var(--radius-md);
    border: none; cursor: pointer;
    transition: all 0.15s;
    letter-spacing: 0.1px;
  }
  .btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .btn-ghost {
    background: transparent;
    color: var(--text-2);
    border: 1px solid var(--border-md);
  }
  .btn-ghost:hover:not(:disabled) { background: var(--bg-raised); color: var(--text-1); }
  .btn-primary {
    background: var(--accent);
    color: #fff;
  }
  .btn-primary:hover:not(:disabled) {
    background: #6b7af9;
    box-shadow: 0 4px 16px var(--accent-glow);
    transform: translateY(-1px);
  }
  .btn-success {
    background: var(--success);
    color: #0b1a0f;
  }
  .btn-success:hover { filter: brightness(1.1); }
  .btn-danger { background: var(--danger); color: #2a0a0a; }
  .btn-danger:hover { filter: brightness(1.1); }

  /* ─── Success screen ─────────────────────────── */
  .success-screen {
    padding: 48px 28px;
    display: flex; flex-direction: column; align-items: center;
    text-align: center; gap: 16px;
  }
  .success-icon {
    width: 56px; height: 56px;
    background: rgba(34,197,94,0.12);
    border: 1.5px solid rgba(34,197,94,0.35);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    color: var(--success);
    animation: pop 0.3s ease;
  }
  @keyframes pop {
    0% { transform: scale(0.6); opacity: 0; }
    80% { transform: scale(1.08); }
    100% { transform: scale(1); opacity: 1; }
  }
  .success-title { font-size: 22px; font-weight: 600; letter-spacing: -0.4px; }
  .success-sub { font-size: 13px; color: var(--text-2); max-width: 380px; line-height: 1.6; }
  .json-preview {
    width: 100%; text-align: left;
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 16px;
    font-family: var(--mono); font-size: 11.5px;
    color: var(--text-2);
    white-space: pre; overflow-x: auto;
    max-height: 240px; overflow-y: auto;
    line-height: 1.6;
  }

  /* ─── Right panel: State inspector ───────────── */
  .inspector-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 22px;
    border-bottom: 1px solid var(--border);
  }
  .inspector-title {
    font-size: 11px; font-weight: 600; letter-spacing: 0.6px;
    color: var(--text-3); text-transform: uppercase;
  }
  .live-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--success);
    box-shadow: 0 0 6px var(--success);
    animation: pulse 1.6s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  .inspector-body { padding: 14px; display: flex; flex-direction: column; gap: 10px; }
  .form-block {
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    overflow: hidden;
  }
  .form-block-head {
    display: flex; justify-content: space-between; align-items: center;
    padding: 9px 12px;
    background: var(--bg-raised);
    border-bottom: 1px solid var(--border);
  }
  .form-id {
    font-family: var(--mono); font-size: 11px; color: var(--text-2);
  }
  .validity-tag {
    font-size: 10px; font-weight: 600; letter-spacing: 0.3px;
    padding: 2px 8px; border-radius: 10px;
  }
  .validity-tag.valid { background: rgba(34,197,94,0.1); color: var(--success); }
  .validity-tag.invalid { background: rgba(248,113,113,0.1); color: var(--danger); }
  .form-block pre {
    padding: 10px 12px;
    font-family: var(--mono); font-size: 10.5px;
    color: var(--text-3);
    line-height: 1.65; overflow-x: auto;
    white-space: pre;
    max-height: 180px; overflow-y: auto;
  }

  /* ─── Benchmark section ──────────────────────── */
  .bench-card { padding: 24px 28px; }
  .bench-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 16px; margin-bottom: 24px;
  }
  .bench-title { font-size: 15px; font-weight: 600; letter-spacing: -0.2px; margin-bottom: 4px; }
  .bench-sub { font-size: 12px; color: var(--text-3); line-height: 1.5; max-width: 480px; }
  .bench-controls { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
  .fps-box {
    text-align: center;
    background: var(--bg-raised);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 6px 16px;
    min-width: 70px;
  }
  .fps-val { font-family: var(--mono); font-size: 22px; font-weight: 500; color: var(--text-1); }
  .fps-label { font-size: 10px; color: var(--text-3); letter-spacing: 0.5px; text-transform: uppercase; }

  /* ─── Benchmark grid ─────────────────────────── */
  .bench-grid {
    display: grid;
    grid-template-columns: repeat(50, 1fr);
    gap: 2px;
  }
  .cell {
    aspect-ratio: 1;
    border-radius: 2px;
    background: var(--bg-raised);
    border: 1px solid var(--border);
    transition: background 0.06s, border-color 0.06s;
  }
  .cell.err { background: rgba(248,113,113,0.5); border-color: rgba(248,113,113,0.7); }
  .cell.a0 { background: rgba(91,106,247,0.15); border-color: rgba(91,106,247,0.25); }
  .cell.a1 { background: rgba(91,106,247,0.35); border-color: rgba(91,106,247,0.5); }
  .cell.a2 { background: rgba(91,106,247,0.6); border-color: rgba(91,106,247,0.7); }
  .cell.a3 { background: rgba(91,106,247,0.85); border-color: var(--accent); }

  /* ─── Section label ──────────────────────────── */
  .section-label {
    font-size: 11px; font-weight: 600; letter-spacing: 0.6px;
    color: var(--text-3); text-transform: uppercase; margin-bottom: 10px;
  }
`;

// ─── Profile Fields ───────────────────────────────────────────────────────────
function ProfileFields() {
  const name = useField("name");
  const email = useField("email");
  const age = useField("age");

  return (
    <div className="form-body">
      <FieldRow label="Full name" required field={name} type="text" placeholder="Your full name" />
      <FieldRow label="Email address" required field={email} type="email" placeholder="you@example.com" />
      <FieldRow label="Age" required field={age} type="number" placeholder="Must be 18 or older" />
    </div>
  );
}

// ─── Preference Fields ────────────────────────────────────────────────────────
function PreferenceFields() {
  const country = useField("country");
  const newsletter = useField("newsletter");

  return (
    <div className="form-body">
      <div className="form-group">
        <label className="form-label">Country of residence</label>
        <div className="input-wrap">
          <select {...country.inputProps}>
            <option value="US">United States — USD</option>
            <option value="GB">United Kingdom — GBP</option>
            <option value="GH">Ghana — GHS · Momo enabled</option>
            <option value="NG">Nigeria — NGN · Bank enabled</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Notifications</label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={!!newsletter.value}
            onChange={(e) => newsletter.onChange(e.target.checked)}
            onBlur={newsletter.onBlur}
          />
          <span>Subscribe to developer updates &amp; changelogs</span>
        </label>
      </div>
    </div>
  );
}

// ─── Payment Fields ───────────────────────────────────────────────────────────
function PaymentFields() {
  const payMethod = useField("payMethod");
  const cardNumber = useField("cardNumber");
  const cardExpiry = useField("cardExpiry");
  const momoProvider = useField("momoProvider");
  const momoNumber = useField("momoNumber");

  const registry = getFormRegistry();
  const selectedCountry = useSignalValue(
    useMemo(
      () => createComputed(() => (registry.get("preferences")?.values.value?.country) || "US"),
      [registry]
    )
  );

  useEffect(() => {
    if (selectedCountry === "GH") payMethod.onChange("momo");
    else if (selectedCountry === "NG") payMethod.onChange("bank");
    else payMethod.onChange("card");
  }, [selectedCountry]);

  return (
    <div className="form-body">
      <div className="form-group">
        <label className="form-label">Payment method</label>
        <div className="input-wrap">
          <select {...payMethod.inputProps}>
            {selectedCountry === "GH" && <option value="momo">Mobile Money (Momo)</option>}
            {selectedCountry === "NG" && <option value="bank">Bank transfer</option>}
            <option value="card">Credit / debit card</option>
          </select>
        </div>
      </div>

      {payMethod.value === "momo" && (
        <>
          <div className="form-group">
            <label className="form-label">Momo provider</label>
            <div className="input-wrap">
              <select {...momoProvider.inputProps}>
                <option value="mtn">MTN Mobile Money</option>
                <option value="telecel">Telecel Cash</option>
                <option value="at">AT Money</option>
              </select>
            </div>
          </div>
          <FieldRow label="Momo number" required field={momoNumber} type="text" placeholder="024XXXXXXX — 10 digits" />
        </>
      )}

      {payMethod.value === "bank" && (
        <div className="form-group">
          <div className="info-box">
            Bank details are generated on checkout. Pay via OPay or GTBank after submission.
          </div>
        </div>
      )}

      {payMethod.value === "card" && (
        <>
          <FieldRow label="Card number" required field={cardNumber} type="text" placeholder="4111 2222 3333 4444" />
          <FieldRow label="Expiration" required field={cardExpiry} type="text" placeholder="MM / YY" />
        </>
      )}
    </div>
  );
}

// ─── Shared FieldRow ──────────────────────────────────────────────────────────
function FieldRow({ label, required, field, type, placeholder }) {
  const hasError = field.touched && field.error;
  const isValid = field.touched && !field.error;
  return (
    <div className="form-group">
      <label className="form-label">
        {label}{required && <span className="req"> *</span>}
      </label>
      <div className={`input-wrap ${hasError ? "has-error" : isValid ? "is-valid" : ""}`}>
        <input type={type} placeholder={placeholder} {...field.inputProps} />
      </div>
      {hasError && <p className="field-error">{field.error}</p>}
    </div>
  );
}

// ─── Benchmark Cell ───────────────────────────────────────────────────────────
function BenchmarkCell({ index }) {
  const cell = useField(`cell_${index}`);
  let cls = "cell";
  if (cell.error) cls += " err";
  else if (cell.value === 0) cls += " a0";
  else if (cell.value === 1) cls += " a1";
  else if (cell.value === 2) cls += " a2";
  else if (cell.value === 3) cls += " a3";
  return <div className={cls} />;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(1);
  const [submittedData, setSubmittedData] = useState(null);
  const [benchRunning, setBenchRunning] = useState(false);
  const [fps, setFps] = useState(60);
  const frameRef = useRef(0);
  const lastRef = useRef(performance.now());
  const rafRef = useRef(null);

  const profileForm = useForm({
    id: "profile",
    initialValues: { name: "", email: "", age: "" },
    fieldValidators: {
      name: [validators.required("Name is required"), validators.minLength(3, "Minimum 3 characters")],
      email: [validators.required("Email is required"), validators.email("Enter a valid email")],
      age: [validators.required("Age is required"), validators.custom((v) => {
        const n = Number(v);
        return isNaN(n) ? "Must be a number" : n >= 18 ? undefined : "Must be 18 or older";
      })],
    },
  });

  const preferencesForm = useForm({
    id: "preferences",
    initialValues: { country: "GH", newsletter: false },
  });

  const paymentForm = useForm({
    id: "payment",
    initialValues: { payMethod: "card", cardNumber: "", cardExpiry: "", momoProvider: "mtn", momoNumber: "" },
    fieldValidators: {
      cardNumber: [validators.custom((v) => {
        const m = getFormRegistry().get("payment")?.values.peek()?.payMethod;
        if (m !== "card") return undefined;
        if (!v) return "Card number required";
        return v.replace(/\D/g, "").length >= 12 ? undefined : "Invalid card number";
      })],
      cardExpiry: [validators.custom((v) => {
        const m = getFormRegistry().get("payment")?.values.peek()?.payMethod;
        if (m !== "card") return undefined;
        if (!v) return "Expiry required";
        return /^\d{2}\/\d{2}$/.test(v) ? undefined : "Format MM/YY";
      })],
      momoNumber: [validators.custom((v) => {
        const m = getFormRegistry().get("payment")?.values.peek()?.payMethod;
        if (m !== "momo") return undefined;
        if (!v) return "Momo number required";
        return v.replace(/\D/g, "").length === 10 ? undefined : "Must be 10 digits";
      })],
    },
  });

  const benchmarkInitialValues = useMemo(() => {
    const v = {};
    for (let i = 0; i < 1000; i++) v[`cell_${i}`] = -1;
    return v;
  }, []);

  const benchmarkForm = useForm({ id: "benchmark", initialValues: benchmarkInitialValues });

  useEffect(() => {
    const dt = connectDevTools(profileForm.store, preferencesForm.store, paymentForm.store, { minimized: true });
    return () => dt.destroy();
  }, []);

  const handleNext = async () => {
    if (step === 1) {
      const e = await profileForm.store.validateAll();
      if (!Object.keys(e).length) setStep(2);
    } else if (step === 2) {
      const e = await preferencesForm.store.validateAll();
      if (!Object.keys(e).length) setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pe = await profileForm.store.validateAll();
    const pre = await preferencesForm.store.validateAll();
    const paye = await paymentForm.store.validateAll();
    if (!Object.keys(pe).length && !Object.keys(pre).length && !Object.keys(paye).length) {
      setSubmittedData({ profile: profileForm.values, preferences: preferencesForm.values, payment: paymentForm.values });
      setStep(4);
    }
  };

  const handleReset = () => {
    profileForm.reset(); preferencesForm.reset(); paymentForm.reset();
    setSubmittedData(null); setStep(1);
  };

  // Bench loop
  const benchLoop = () => {
    frameRef.current++;
    const now = performance.now();
    if (now - lastRef.current >= 1000) {
      setFps(Math.round((frameRef.current * 1000) / (now - lastRef.current)));
      frameRef.current = 0;
      lastRef.current = now;
    }
    batch(() => {
      for (let k = 0; k < 50; k++) {
        const i = Math.floor(Math.random() * 1000);
        const v = Math.random() > 0.08 ? Math.floor(Math.random() * 4) : -1;
        benchmarkForm.store.setFieldValue(`cell_${i}`, v);
        const f = benchmarkForm.store.getField(`cell_${i}`);
        if (Math.random() > 0.95) f.error.set("err");
        else f.error.set(undefined);
      }
    });
    rafRef.current = requestAnimationFrame(benchLoop);
  };

  useEffect(() => {
    if (benchRunning) {
      lastRef.current = performance.now();
      frameRef.current = 0;
      rafRef.current = requestAnimationFrame(benchLoop);
    } else if (rafRef.current) cancelAnimationFrame(rafRef.current);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [benchRunning]);

  const stepConfig = [
    { n: 1, label: "Profile" },
    { n: 2, label: "Preferences" },
    { n: 3, label: "Payment" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="shell">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <div className="logo">K</div>
            <div>
              <div className="brand-name">Kayforms</div>
              <div className="brand-sub">Reactive form library with time-travel debugging</div>
            </div>
          </div>
          <div className="header-badges">
            <span className="badge">&lt; 3 kb gzip</span>
            <span className="badge accent">60 fps</span>
          </div>
        </header>

        {/* Main grid */}
        <div className="content-grid">
          {/* Wizard card */}
          <div className="card">
            {step < 4 ? (
              <>
                {/* Step nav */}
                <nav className="wizard-nav">
                  {stepConfig.map(({ n, label }, idx) => (
                    <>
                      <div
                        key={n}
                        className={`step-item ${step === n ? "active" : step > n ? "done" : ""}`}
                        onClick={() => {
                          if (n < step) setStep(n);
                          else if (n === 2 && profileForm.valid) setStep(2);
                          else if (n === 3 && profileForm.valid && preferencesForm.valid) setStep(3);
                        }}
                      >
                        <div className="step-dot">
                          {step > n ? "✓" : n}
                        </div>
                        <span className="step-label">{label}</span>
                      </div>
                      {idx < stepConfig.length - 1 && <div className="step-divider" key={`d${n}`} />}
                    </>
                  ))}
                </nav>

                {/* Form content */}
                <form onSubmit={handleSubmit}>
                  {step === 1 && <FormProvider form={profileForm.store}><ProfileFields /></FormProvider>}
                  {step === 2 && <FormProvider form={preferencesForm.store}><PreferenceFields /></FormProvider>}
                  {step === 3 && <FormProvider form={paymentForm.store}><PaymentFields /></FormProvider>}

                  <div className="form-footer">
                    <button
                      type="button" className="btn btn-ghost"
                      disabled={step === 1}
                      onClick={() => setStep(step - 1)}
                    >
                      ← Back
                    </button>
                    {step < 3
                      ? <button type="button" className="btn btn-primary" onClick={handleNext}>Continue →</button>
                      : <button type="submit" className="btn btn-success">Complete checkout ✓</button>
                    }
                  </div>
                </form>
              </>
            ) : (
              <div className="success-screen">
                <div className="success-icon">✓</div>
                <p className="success-title">Order placed successfully</p>
                <p className="success-sub">
                  Your form state was batched and submitted atomically. Use the DevTools timeline (bottom right) to time-travel through history.
                </p>
                <pre className="json-preview">{JSON.stringify(submittedData, null, 2)}</pre>
                <button type="button" className="btn btn-ghost" onClick={handleReset}>
                  ← Submit another
                </button>
              </div>
            )}
          </div>

          {/* State inspector */}
          <div className="card">
            <div className="inspector-header">
              <span className="inspector-title">State Inspector</span>
              <div className="live-dot" />
            </div>
            <div className="inspector-body">
              {[
                { id: "profileForm", form: profileForm },
                { id: "preferencesForm", form: preferencesForm },
                { id: "paymentForm", form: paymentForm },
              ].map(({ id, form }) => (
                <div className="form-block" key={id}>
                  <div className="form-block-head">
                    <span className="form-id">{id}</span>
                    <span className={`validity-tag ${form.valid ? "valid" : "invalid"}`}>
                      {form.valid ? "valid" : "invalid"}
                    </span>
                  </div>
                  <pre>{JSON.stringify({ values: form.values, errors: form.errors, dirty: form.dirty }, null, 2)}</pre>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benchmark */}
        <div className="card">
          <div className="bench-card">
            <div className="bench-header">
              <div>
                <p className="bench-title">Fine-grained signal rendering — 1,000 fields</p>
                <p className="bench-sub">
                  50 fields update per frame via granular signals. Only the changed cell re-renders — no virtual DOM diffing, no full tree reconciliation.
                </p>
              </div>
              <div className="bench-controls">
                <div className="fps-box">
                  <div className="fps-val">{fps}</div>
                  <div className="fps-label">fps</div>
                </div>
                <button
                  type="button"
                  className={`btn ${benchRunning ? "btn-danger" : "btn-primary"}`}
                  onClick={() => setBenchRunning(!benchRunning)}
                >
                  {benchRunning ? "Stop" : "Run benchmark"}
                </button>
              </div>
            </div>

            <FormProvider form={benchmarkForm.store}>
              <div className="bench-grid">
                {Array.from({ length: 1000 }, (_, i) => <BenchmarkCell key={i} index={i} />)}
              </div>
            </FormProvider>
          </div>
        </div>
      </div>
    </>
  );
}
