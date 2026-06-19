import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useForm, useField, FormProvider, useSignalValue } from "@kayforms/react";
import { validators, getFormRegistry, createComputed, batch } from "@kayforms/core";
import { connectDevTools } from "@kayforms/devtools";

// ─── Styles ──────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:         #0b0c0e;
    --bg-surface: #111214;
    --bg-raised:  #18191d;
    --bg-input:   #1e1f24;
    --border:     rgba(255,255,255,0.07);
    --border-md:  rgba(255,255,255,0.12);
    --accent:     #5b6af7;
    --accent-dim: rgba(91,106,247,0.15);
    --accent-glow:rgba(91,106,247,0.35);
    --success:    #22c55e;
    --danger:     #f87171;
    --warning:    #fbbf24;
    --text-1:     #f0f0f2;
    --text-2:     #9a9ba8;
    --text-3:     #5a5b68;
    --mono:       'DM Mono', monospace;
    --sans:       'DM Sans', sans-serif;
    --radius-sm:  6px;
    --radius-md:  10px;
    --radius-lg:  16px;
    --radius-xl:  22px;
    --transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  body {
    font-family: var(--sans);
    background: var(--bg);
    color: var(--text-1);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  .shell {
    max-width: 1400px;
    margin: 0 auto;
    padding: 32px 24px 80px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* ─── Header ─────────────────────────────────── */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
    gap: 16px;
  }
  .header-left { display: flex; align-items: center; gap: 14px; }
  .logo {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, var(--accent), #7c8aff);
    border-radius: var(--radius-md);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 700; color: #fff;
    letter-spacing: -0.5px;
  }
  .brand-name {
    font-size: 18px; font-weight: 600; letter-spacing: -0.3px;
    background: linear-gradient(135deg, var(--text-1), var(--text-2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .brand-sub { font-size: 12px; color: var(--text-3); margin-top: 2px; }
  .header-badges { display: flex; gap: 8px; flex-wrap: wrap; }
  .badge {
    font-size: 11px; font-family: var(--mono);
    padding: 4px 12px; border-radius: 20px;
    border: 1px solid var(--border-md);
    color: var(--text-2);
    background: var(--bg-raised);
    letter-spacing: 0.2px;
    white-space: nowrap;
  }
  .badge.accent { border-color: var(--accent-glow); color: var(--accent); background: var(--accent-dim); }
  .badge.success { border-color: rgba(34,197,94,0.3); color: var(--success); background: rgba(34,197,94,0.08); }

  /* ─── Content grid ───────────────────────────── */
  .content-grid {
    display: grid;
    grid-template-columns: 1fr 420px;
    gap: 24px;
    align-items: start;
  }
  @media (max-width: 968px) { .content-grid { grid-template-columns: 1fr; } }

  /* ─── Cards ──────────────────────────────────── */
  .card {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    overflow: hidden;
    transition: border-color var(--transition);
  }
  .card:hover { border-color: var(--border-md); }
  .card-inner { padding: 28px; }

  /* ─── Wizard steps ───────────────────────────── */
  .wizard-nav {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 20px 28px;
    border-bottom: 1px solid var(--border);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .step-item {
    display: flex; align-items: center; gap: 10px;
    cursor: pointer; padding: 6px 0;
    flex-shrink: 0;
    transition: opacity var(--transition);
  }
  .step-item.disabled { opacity: 0.4; cursor: not-allowed; }
  .step-dot {
    width: 28px; height: 28px;
    border-radius: 50%;
    border: 2px solid var(--border-md);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 600; font-family: var(--mono);
    color: var(--text-3);
    transition: all var(--transition);
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
    background: rgba(34,197,94,0.12);
  }
  .step-item.error .step-dot {
    border-color: var(--danger);
    color: var(--danger);
    background: rgba(248,113,113,0.12);
  }
  .step-label {
    font-size: 12px; font-weight: 500; color: var(--text-3);
    transition: color var(--transition);
    white-space: nowrap;
  }
  .step-item.active .step-label { color: var(--text-1); }
  .step-item.done .step-label { color: var(--text-2); }
  .step-divider {
    flex: 1; height: 2px; background: var(--border); margin: 0 12px;
    min-width: 16px;
  }
  .step-divider.done { background: var(--success); opacity: 0.3; }

  /* ─── Form elements ──────────────────────────── */
  .form-body { padding: 28px; }
  .form-group { margin-bottom: 24px; }
  .form-group:last-child { margin-bottom: 0; }
  .form-label {
    display: block;
    font-size: 12px; font-weight: 600; letter-spacing: 0.4px;
    color: var(--text-2); text-transform: uppercase;
    margin-bottom: 8px;
  }
  .form-label .req { color: var(--accent); margin-left: 2px; }
  .form-label .optional { color: var(--text-3); font-weight: 400; text-transform: none; font-size: 11px; }

  .input-wrap { position: relative; }
  .input-wrap input,
  .input-wrap select,
  .input-wrap textarea {
    width: 100%;
    padding: 11px 16px;
    background: var(--bg-input);
    border: 1.5px solid var(--border-md);
    border-radius: var(--radius-md);
    color: var(--text-1);
    font-family: var(--sans);
    font-size: 14px;
    outline: none;
    transition: all var(--transition);
    appearance: none;
    -webkit-appearance: none;
  }
  .input-wrap input::placeholder { color: var(--text-3); }
  .input-wrap input:focus,
  .input-wrap select:focus,
  .input-wrap textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 4px var(--accent-dim);
    background: var(--bg-raised);
  }
  .input-wrap.has-error input,
  .input-wrap.has-error select,
  .input-wrap.has-error textarea {
    border-color: var(--danger);
    box-shadow: 0 0 0 4px rgba(248,113,113,0.12);
  }
  .input-wrap.is-valid input,
  .input-wrap.is-valid select,
  .input-wrap.is-valid textarea {
    border-color: rgba(34,197,94,0.4);
  }
  .input-wrap select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%236b7280' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 40px;
    cursor: pointer;
  }
  .input-wrap select option { background: #18191d; }
  .input-wrap textarea { resize: vertical; min-height: 80px; }

  .field-error {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; color: var(--danger);
    margin-top: 6px; font-weight: 500;
    animation: slideDown 0.2s ease;
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .field-error::before { content: '⚠'; font-size: 12px; }

  .field-hint {
    font-size: 11px; color: var(--text-3);
    margin-top: 4px;
  }

  .checkbox-row {
    display: flex; align-items: center; gap: 12px;
    cursor: pointer;
    padding: 12px 16px;
    background: var(--bg-input);
    border: 1.5px solid var(--border-md);
    border-radius: var(--radius-md);
    transition: all var(--transition);
  }
  .checkbox-row:hover { border-color: var(--border-md); background: var(--bg-raised); }
  .checkbox-row input[type=checkbox] {
    width: 18px; height: 18px; flex-shrink: 0;
    accent-color: var(--accent);
    cursor: pointer;
  }
  .checkbox-row span { font-size: 13px; color: var(--text-2); }

  .radio-group {
    display: flex; gap: 12px; flex-wrap: wrap;
  }
  .radio-option {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 16px;
    background: var(--bg-input);
    border: 1.5px solid var(--border-md);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition);
  }
  .radio-option:hover { border-color: var(--border-md); background: var(--bg-raised); }
  .radio-option.selected { border-color: var(--accent); background: var(--accent-dim); }
  .radio-option input[type=radio] {
    accent-color: var(--accent);
    cursor: pointer;
  }
  .radio-option label { font-size: 13px; color: var(--text-2); cursor: pointer; }

  /* ─── Inline info box ────────────────────────── */
  .info-box {
    padding: 14px 18px;
    background: var(--bg-input);
    border: 1px solid var(--border-md);
    border-radius: var(--radius-md);
    font-size: 13px;
    color: var(--text-2);
    line-height: 1.6;
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  .info-box .icon { font-size: 18px; flex-shrink: 0; }

  /* ─── Form footer / buttons ──────────────────── */
  .form-footer {
    display: flex; justify-content: space-between; align-items: center;
    padding: 20px 28px;
    border-top: 1px solid var(--border);
    gap: 12px;
    flex-wrap: wrap;
  }
  .form-footer .left { display: flex; gap: 8px; }
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 22px;
    font-family: var(--sans); font-size: 13px; font-weight: 600;
    border-radius: var(--radius-md);
    border: none; cursor: pointer;
    transition: all var(--transition);
    letter-spacing: 0.2px;
  }
  .btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none !important; }
  .btn-ghost {
    background: transparent;
    color: var(--text-2);
    border: 1.5px solid var(--border-md);
  }
  .btn-ghost:hover:not(:disabled) { background: var(--bg-raised); color: var(--text-1); border-color: var(--border-md); }
  .btn-primary {
    background: var(--accent);
    color: #fff;
  }
  .btn-primary:hover:not(:disabled) {
    background: #6b7af9;
    box-shadow: 0 4px 20px var(--accent-glow);
    transform: translateY(-2px);
  }
  .btn-success {
    background: var(--success);
    color: #0b1a0f;
  }
  .btn-success:hover:not(:disabled) { filter: brightness(1.15); transform: translateY(-2px); }
  .btn-danger { background: var(--danger); color: #2a0a0a; }
  .btn-danger:hover:not(:disabled) { filter: brightness(1.15); transform: translateY(-2px); }
  .btn-outline-success {
    background: transparent;
    color: var(--success);
    border: 1.5px solid var(--success);
  }
  .btn-outline-success:hover:not(:disabled) { background: rgba(34,197,94,0.08); }

  /* ─── Success screen ─────────────────────────── */
  .success-screen {
    padding: 48px 32px;
    display: flex; flex-direction: column; align-items: center;
    text-align: center; gap: 20px;
  }
  .success-icon {
    width: 64px; height: 64px;
    background: rgba(34,197,94,0.12);
    border: 2px solid rgba(34,197,94,0.35);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px;
    color: var(--success);
    animation: pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes pop {
    0% { transform: scale(0.6) rotate(-10deg); opacity: 0; }
    100% { transform: scale(1) rotate(0); opacity: 1; }
  }
  .success-title { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
  .success-sub { font-size: 14px; color: var(--text-2); max-width: 420px; line-height: 1.7; }
  .json-preview {
    width: 100%; text-align: left;
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 20px;
    font-family: var(--mono); font-size: 12px;
    color: var(--text-2);
    white-space: pre; overflow-x: auto;
    max-height: 280px; overflow-y: auto;
    line-height: 1.7;
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
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--success);
    box-shadow: 0 0 8px var(--success);
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.3; transform: scale(0.8); }
  }
  .inspector-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
  .form-block {
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    overflow: hidden;
    transition: border-color var(--transition);
  }
  .form-block:hover { border-color: var(--border-md); }
  .form-block-head {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 14px;
    background: var(--bg-raised);
    border-bottom: 1px solid var(--border);
  }
  .form-id {
    font-family: var(--mono); font-size: 11px; color: var(--text-2);
    display: flex; align-items: center; gap: 8px;
  }
  .form-id .dirty-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--warning);
  }
  .validity-tag {
    font-size: 10px; font-weight: 600; letter-spacing: 0.3px;
    padding: 2px 10px; border-radius: 12px;
  }
  .validity-tag.valid { background: rgba(34,197,94,0.12); color: var(--success); }
  .validity-tag.invalid { background: rgba(248,113,113,0.12); color: var(--danger); }
  .form-block pre {
    padding: 12px 14px;
    font-family: var(--mono); font-size: 10.5px;
    color: var(--text-3);
    line-height: 1.7; overflow-x: auto;
    white-space: pre;
    max-height: 200px; overflow-y: auto;
  }

  /* ─── Benchmark section ──────────────────────── */
  .bench-card { padding: 28px; }
  .bench-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 20px; margin-bottom: 24px;
    flex-wrap: wrap;
  }
  .bench-title { font-size: 16px; font-weight: 600; letter-spacing: -0.2px; margin-bottom: 4px; }
  .bench-sub { font-size: 12px; color: var(--text-3); line-height: 1.6; max-width: 520px; }
  .bench-controls { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
  .fps-box {
    text-align: center;
    background: var(--bg-raised);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 8px 20px;
    min-width: 80px;
  }
  .fps-val { font-family: var(--mono); font-size: 24px; font-weight: 600; color: var(--text-1); }
  .fps-label { font-size: 10px; color: var(--text-3); letter-spacing: 0.5px; text-transform: uppercase; }

  /* ─── Benchmark grid ─────────────────────────── */
  .bench-grid {
    display: grid;
    grid-template-columns: repeat(50, 1fr);
    gap: 2px;
  }
  .cell {
    aspect-ratio: 1;
    border-radius: 3px;
    background: var(--bg-raised);
    border: 1px solid var(--border);
    transition: all 0.08s ease;
  }
  .cell.err { background: rgba(248,113,113,0.6); border-color: rgba(248,113,113,0.8); }
  .cell.a0 { background: rgba(91,106,247,0.15); border-color: rgba(91,106,247,0.25); }
  .cell.a1 { background: rgba(91,106,247,0.35); border-color: rgba(91,106,247,0.5); }
  .cell.a2 { background: rgba(91,106,247,0.6); border-color: rgba(91,106,247,0.7); }
  .cell.a3 { background: rgba(91,106,247,0.85); border-color: var(--accent); }
`;

// ─── Form Field Components ────────────────────────────────────────────────────

function FieldRow({ label, required, field, type = "text", placeholder, hint }) {
  const hasError = field.touched && field.error;
  const isValid = field.touched && !field.error;
  
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required ? <span className="req"> *</span> : <span className="optional"> (optional)</span>}
      </label>
      <div className={`input-wrap ${hasError ? "has-error" : isValid ? "is-valid" : ""}`}>
        <input 
          type={type} 
          placeholder={placeholder} 
          {...field.inputProps} 
          aria-invalid={!!hasError}
        />
      </div>
      {hasError && <p className="field-error">{field.error}</p>}
      {hint && !hasError && <p className="field-hint">{hint}</p>}
    </div>
  );
}

function SelectRow({ label, required, field, options, placeholder }) {
  const hasError = field.touched && field.error;
  const isValid = field.touched && !field.error;
  
  return (
    <div className="form-group">
      <label className="form-label">
        {label}{required && <span className="req"> *</span>}
      </label>
      <div className={`input-wrap ${hasError ? "has-error" : isValid ? "is-valid" : ""}`}>
        <select {...field.inputProps}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
      {hasError && <p className="field-error">{field.error}</p>}
    </div>
  );
}

function ProfileFields() {
  const name = useField("name");
  const email = useField("email");
  const age = useField("age");

  return (
    <div className="form-body">
      <FieldRow 
        label="Full name" 
        required 
        field={name} 
        placeholder="John Doe" 
        hint="Minimum 3 characters"
      />
      <FieldRow 
        label="Email address" 
        required 
        field={email} 
        type="email" 
        placeholder="john@example.com" 
      />
      <FieldRow 
        label="Age" 
        required 
        field={age} 
        type="number" 
        placeholder="Must be 18 or older" 
      />
    </div>
  );
}

function PreferenceFields() {
  const country = useField("country");
  const newsletter = useField("newsletter");

  return (
    <div className="form-body">
      <SelectRow
        label="Country of residence"
        required
        field={country}
        options={[
          { value: "US", label: "United States — USD" },
          { value: "GB", label: "United Kingdom — GBP" },
          { value: "GH", label: "Ghana — GHS · Momo enabled" },
          { value: "NG", label: "Nigeria — NGN · Bank enabled" },
        ]}
      />
      
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

function PaymentFields() {
  const payMethod = useField("payMethod");
  const cardNumber = useField("cardNumber");
  const cardExpiry = useField("cardExpiry");
  const cardCvv = useField("cardCvv");
  const momoProvider = useField("momoProvider");
  const momoNumber = useField("momoNumber");
  const bankAccount = useField("bankAccount");

  const registry = getFormRegistry();
  const selectedCountry = useSignalValue(
    useMemo(
      () => createComputed(() => (registry.get("preferences")?.values.value?.country) || "US"),
      [registry]
    )
  );

  // Auto-select payment method based on country
  useEffect(() => {
    if (selectedCountry === "GH") payMethod.onChange("momo");
    else if (selectedCountry === "NG") payMethod.onChange("bank");
    else payMethod.onChange("card");
  }, [selectedCountry, payMethod]);

  const getPaymentOptions = () => {
    const options = [];
    if (selectedCountry === "GH") options.push({ value: "momo", label: "📱 Mobile Money (Momo)" });
    if (selectedCountry === "NG") options.push({ value: "bank", label: "🏦 Bank transfer" });
    options.push({ value: "card", label: "💳 Credit / debit card" });
    return options;
  };

  return (
    <div className="form-body">
      <SelectRow
        label="Payment method"
        required
        field={payMethod}
        options={getPaymentOptions()}
      />

      {payMethod.value === "momo" && (
        <>
          <SelectRow
            label="Momo provider"
            required
            field={momoProvider}
            options={[
              { value: "mtn", label: "MTN Mobile Money" },
              { value: "telecel", label: "Telecel Cash" },
              { value: "at", label: "AT Money" },
            ]}
          />
          <FieldRow 
            label="Momo number" 
            required 
            field={momoNumber} 
            placeholder="024XXXXXXX — 10 digits" 
            hint="Enter 10-digit phone number"
          />
        </>
      )}

      {payMethod.value === "bank" && (
        <>
          <div className="form-group">
            <div className="info-box">
              <span className="icon">🏦</span>
              <div>
                <strong>Bank transfer details</strong>
                <p style={{ marginTop: 4 }}>Bank details will be generated on checkout. Pay via OPay, GTBank, or your preferred bank.</p>
              </div>
            </div>
          </div>
          <FieldRow 
            label="Bank account" 
            field={bankAccount} 
            placeholder="Enter your bank account number" 
            hint="Optional — for faster verification"
          />
        </>
      )}

      {payMethod.value === "card" && (
        <>
          <FieldRow 
            label="Card number" 
            required 
            field={cardNumber} 
            placeholder="4111 2222 3333 4444" 
            hint="12-16 digits"
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FieldRow 
              label="Expiration" 
              required 
              field={cardExpiry} 
              placeholder="MM / YY" 
            />
            <FieldRow 
              label="CVV" 
              required 
              field={cardCvv} 
              type="password"
              placeholder="•••" 
              hint="3-4 digits"
            />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Benchmark Components ─────────────────────────────────────────────────────

function BenchmarkCell({ index }) {
  const cell = useField(`cell_${index}`);
  let cls = "cell";
  if (cell.error) cls += " err";
  else if (cell.value === 0) cls += " a0";
  else if (cell.value === 1) cls += " a1";
  else if (cell.value === 2) cls += " a2";
  else if (cell.value === 3) cls += " a3";
  return <div className={cls} title={`Cell ${index}: ${cell.value}`} />;
}

// ─── Wizard Navigation ───────────────────────────────────────────────────────

function WizardNav({ step, setStep, forms }) {
  const stepConfig = [
    { n: 1, label: "Profile", form: forms.profile },
    { n: 2, label: "Preferences", form: forms.preferences },
    { n: 3, label: "Payment", form: forms.payment },
  ];

  const canNavigateTo = useCallback((targetStep) => {
    if (targetStep < step) return true;
    // Check all previous forms are valid
    for (let i = 0; i < targetStep - 1; i++) {
      const form = stepConfig[i].form;
      if (!form.valid) return false;
    }
    return true;
  }, [step, stepConfig]);

  const getStepStatus = (n) => {
    if (step === n) return "active";
    if (step > n) {
      const form = stepConfig[n - 1].form;
      return form.valid ? "done" : "error";
    }
    return "";
  };

  return (
    <nav className="wizard-nav">
      {stepConfig.map(({ n, label, form }, idx) => {
        const status = getStepStatus(n);
        const disabled = !canNavigateTo(n);
        
        return (
          <React.Fragment key={n}>
            <div
              className={`step-item ${status} ${disabled ? "disabled" : ""}`}
              onClick={() => !disabled && setStep(n)}
            >
              <div className="step-dot">
                {status === "done" ? "✓" : status === "error" ? "!" : n}
              </div>
              <span className="step-label">{label}</span>
            </div>
            {idx < stepConfig.length - 1 && (
              <div className={`step-divider ${step > n + 1 ? "done" : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// ─── State Inspector ─────────────────────────────────────────────────────────

function StateInspector({ forms }) {
  const [expanded, setExpanded] = useState({});

  return (
    <div className="card">
      <div className="inspector-header">
        <span className="inspector-title">⚡ State Inspector</span>
        <div className="live-dot" />
      </div>
      <div className="inspector-body">
        {forms.map(({ id, form }) => {
          const isExpanded = expanded[id];
          const hasErrors = Object.keys(form.errors).length > 0;
          
          return (
            <div className="form-block" key={id}>
              <div 
                className="form-block-head"
                style={{ cursor: "pointer" }}
                onClick={() => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))}
              >
                <span className="form-id">
                  {id}
                  {form.dirty && <span className="dirty-dot" title="Dirty" />}
                </span>
                <span className={`validity-tag ${form.valid ? "valid" : "invalid"}`}>
                  {form.valid ? "✓ valid" : `✗ ${Object.keys(form.errors).length} error${Object.keys(form.errors).length > 1 ? "s" : ""}`}
                </span>
              </div>
              {isExpanded && (
                <pre>
                  {JSON.stringify(
                    { 
                      values: form.values, 
                      errors: form.errors, 
                      dirty: form.dirty,
                      touched: form.touched 
                    },
                    null,
                    2
                  )}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Benchmark Section ───────────────────────────────────────────────────────

function BenchmarkSection({ form, benchRunning, fps, onToggleBench }) {
  return (
    <div className="card">
      <div className="bench-card">
        <div className="bench-header">
          <div>
            <p className="bench-title">⚡ Fine-grained signal rendering — 1,000 fields</p>
            <p className="bench-sub">
              Each cell is an independent signal. Updates are batched and only changed cells re-render.
              No virtual DOM diffing — direct DOM updates for maximum performance.
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
              onClick={onToggleBench}
              aria-label={benchRunning ? "Stop benchmark" : "Run benchmark"}
            >
              {benchRunning ? "⏹ Stop" : "▶ Run"}
            </button>
          </div>
        </div>

        <FormProvider form={form.store}>
          <div className="bench-grid">
            {Array.from({ length: 1000 }, (_, i) => (
              <BenchmarkCell key={i} index={i} />
            ))}
          </div>
        </FormProvider>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [step, setStep] = useState(1);
  const [submittedData, setSubmittedData] = useState(null);
  const [benchRunning, setBenchRunning] = useState(false);
  const [fps, setFps] = useState(60);
  const frameRef = useRef(0);
  const lastRef = useRef(performance.now());
  const rafRef = useRef(null);

  // Form definitions with enhanced validation
  const profileForm = useForm({
    id: "profile",
    initialValues: { name: "", email: "", age: "" },
    fieldValidators: {
      name: [
        validators.required("Name is required"), 
        validators.minLength(3, "Minimum 3 characters"),
        validators.maxLength(50, "Maximum 50 characters"),
      ],
      email: [
        validators.required("Email is required"), 
        validators.email("Enter a valid email"),
        validators.maxLength(100, "Email too long"),
      ],
      age: [
        validators.required("Age is required"), 
        validators.custom((v) => {
          const n = Number(v);
          if (isNaN(n)) return "Must be a number";
          if (n < 18) return "Must be 18 or older";
          if (n > 120) return "Invalid age";
          return undefined;
        })
      ],
    },
  });

  const preferencesForm = useForm({
    id: "preferences",
    initialValues: { country: "GH", newsletter: false },
  });

  const paymentForm = useForm({
    id: "payment",
    initialValues: { 
      payMethod: "card", 
      cardNumber: "", 
      cardExpiry: "", 
      cardCvv: "",
      momoProvider: "mtn", 
      momoNumber: "",
      bankAccount: "",
    },
    fieldValidators: {
      cardNumber: [
        validators.custom((v) => {
          const m = getFormRegistry().get("payment")?.values.peek()?.payMethod;
          if (m !== "card") return undefined;
          if (!v) return "Card number required";
          const digits = v.replace(/\D/g, "");
          return digits.length >= 12 && digits.length <= 16 
            ? undefined 
            : "Must be 12-16 digits";
        })
      ],
      cardExpiry: [
        validators.custom((v) => {
          const m = getFormRegistry().get("payment")?.values.peek()?.payMethod;
          if (m !== "card") return undefined;
          if (!v) return "Expiry required";
          if (!/^\d{2}\/\d{2}$/.test(v)) return "Format MM/YY";
          const [month, year] = v.split("/").map(Number);
          if (month < 1 || month > 12) return "Invalid month";
          const now = new Date();
          const currentYear = now.getFullYear() % 100;
          const currentMonth = now.getMonth() + 1;
          if (year < currentYear || (year === currentYear && month < currentMonth)) {
            return "Card has expired";
          }
          return undefined;
        })
      ],
      cardCvv: [
        validators.custom((v) => {
          const m = getFormRegistry().get("payment")?.values.peek()?.payMethod;
          if (m !== "card") return undefined;
          if (!v) return "CVV required";
          return /^\d{3,4}$/.test(v) ? undefined : "Must be 3-4 digits";
        })
      ],
      momoNumber: [
        validators.custom((v) => {
          const m = getFormRegistry().get("payment")?.values.peek()?.payMethod;
          if (m !== "momo") return undefined;
          if (!v) return "Momo number required";
          const digits = v.replace(/\D/g, "");
          return digits.length === 10 ? undefined : "Must be 10 digits";
        })
      ],
    },
  });

  const benchmarkInitialValues = useMemo(() => {
    const v = {};
    for (let i = 0; i < 1000; i++) v[`cell_${i}`] = -1;
    return v;
  }, []);

  const benchmarkForm = useForm({ 
    id: "benchmark", 
    initialValues: benchmarkInitialValues 
  });

  // DevTools connection with better configuration
  useEffect(() => {
    const dt = connectDevTools(
      { 
        profile: profileForm.store, 
        preferences: preferencesForm.store, 
        payment: paymentForm.store,
        benchmark: benchmarkForm.store,
      },
      { 
        minimized: true,
        theme: "dark",
        position: "bottom-right",
      }
    );
    return () => dt.destroy();
  }, [profileForm.store, preferencesForm.store, paymentForm.store, benchmarkForm.store]);

  // Form actions with better error handling
  const handleNext = useCallback(async () => {
    const forms = [profileForm, preferencesForm, paymentForm];
    const currentForm = forms[step - 1];
    
    if (currentForm) {
      const errors = await currentForm.store.validateAll();
      if (!Object.keys(errors).length) {
        setStep(s => Math.min(s + 1, 4));
      }
    }
  }, [step, profileForm, preferencesForm, paymentForm]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate all forms
    const [profileErrors, preferenceErrors, paymentErrors] = await Promise.all([
      profileForm.store.validateAll(),
      preferencesForm.store.validateAll(),
      paymentForm.store.validateAll(),
    ]);
    
    if (!Object.keys(profileErrors).length && 
        !Object.keys(preferenceErrors).length && 
        !Object.keys(paymentErrors).length) {
      setSubmittedData({ 
        profile: profileForm.values, 
        preferences: preferencesForm.values, 
        payment: paymentForm.values,
        timestamp: new Date().toISOString(),
      });
      setStep(4);
    }
  }, [profileForm, preferencesForm, paymentForm]);

  const handleReset = useCallback(() => {
    batch(() => {
      profileForm.reset();
      preferencesForm.reset();
      paymentForm.reset();
    });
    setSubmittedData(null);
    setStep(1);
  }, [profileForm, preferencesForm, paymentForm]);

  // Benchmark loop with better performance
  const benchLoop = useCallback(() => {
    frameRef.current++;
    const now = performance.now();
    if (now - lastRef.current >= 1000) {
      setFps(Math.round((frameRef.current * 1000) / (now - lastRef.current)));
      frameRef.current = 0;
      lastRef.current = now;
    }
    
    batch(() => {
      // Update 50 random cells per frame
      for (let k = 0; k < 50; k++) {
        const i = Math.floor(Math.random() * 1000);
        const v = Math.random() > 0.08 ? Math.floor(Math.random() * 4) : -1;
        benchmarkForm.store.setFieldValue(`cell_${i}`, v);
        
        // Random errors
        const field = benchmarkForm.store.getField(`cell_${i}`);
        if (Math.random() > 0.95) field.error.set("err");
        else field.error.set(undefined);
      }
    });
    
    rafRef.current = requestAnimationFrame(benchLoop);
  }, [benchmarkForm.store]);

  useEffect(() => {
    if (benchRunning) {
      lastRef.current = performance.now();
      frameRef.current = 0;
      rafRef.current = requestAnimationFrame(benchLoop);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [benchRunning, benchLoop]);

  // Render success screen
  if (step === 4) {
    return (
      <>
        <style>{css}</style>
        <div className="shell">
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
              <span className="badge success">✓ Submitting</span>
            </div>
          </header>

          <div className="content-grid">
            <div className="card">
              <div className="success-screen">
                <div className="success-icon">✓</div>
                <p className="success-title">Order placed successfully</p>
                <p className="success-sub">
                  Your form state was batched and submitted atomically. 
                  Use the DevTools timeline (bottom right) to time-travel through history
                  and inspect every state change.
                </p>
                <pre className="json-preview">
                  {JSON.stringify(submittedData, null, 2)}
                </pre>
                <button type="button" className="btn btn-primary" onClick={handleReset}>
                  ← Submit another
                </button>
              </div>
            </div>
            <StateInspector 
              forms={[
                { id: "profile", form: profileForm },
                { id: "preferences", form: preferencesForm },
                { id: "payment", form: paymentForm },
              ]} 
            />
          </div>
        </div>
      </>
    );
  }

  // Main render
  return (
    <>
      <style>{css}</style>
      <div className="shell">
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
            <span className="badge">⚡ Signals</span>
          </div>
        </header>

        <div className="content-grid">
          <div className="card">
            <WizardNav 
              step={step} 
              setStep={setStep} 
              forms={{
                profile: profileForm,
                preferences: preferencesForm,
                payment: paymentForm,
              }}
            />

            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <FormProvider form={profileForm.store}>
                  <ProfileFields />
                </FormProvider>
              )}
              {step === 2 && (
                <FormProvider form={preferencesForm.store}>
                  <PreferenceFields />
                </FormProvider>
              )}
              {step === 3 && (
                <FormProvider form={paymentForm.store}>
                  <PaymentFields />
                </FormProvider>
              )}

              <div className="form-footer">
                <div className="left">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={step === 1}
                    onClick={() => setStep(s => s - 1)}
                  >
                    ← Back
                  </button>
                </div>
                {step < 3 ? (
                  <button type="button" className="btn btn-primary" onClick={handleNext}>
                    Continue →
                  </button>
                ) : (
                  <button type="submit" className="btn btn-success">
                    ✓ Complete checkout
                  </button>
                )}
              </div>
            </form>
          </div>

          <StateInspector 
            forms={[
              { id: "profile", form: profileForm },
              { id: "preferences", form: preferencesForm },
              { id: "payment", form: paymentForm },
            ]} 
          />
        </div>

        <BenchmarkSection 
          form={benchmarkForm}
          benchRunning={benchRunning}
          fps={fps}
          onToggleBench={() => setBenchRunning(!benchRunning)}
        />
      </div>
    </>
  );
}
