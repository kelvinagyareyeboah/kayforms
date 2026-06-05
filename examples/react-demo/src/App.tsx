import { useState, useEffect, useRef, useMemo } from "react";
import { useForm, useField, FormProvider, useSignalValue } from "@kayforms/react";
import { validators, getFormRegistry, createComputed, batch } from "@kayforms/core";
import { connectDevTools } from "@kayforms/devtools";

// ---------------------------------------------------------------------------
// Form Step 1: User Profile Field Components
// ---------------------------------------------------------------------------
function ProfileFields() {
  const nameField = useField<string>("name");
  const emailField = useField<string>("email");
  const ageField = useField<string>("age");

  return (
    <div className="form-section">
      <div className="form-group">
        <label>
          Full Name <span className="required-star">*</span>
        </label>
        <div className={`input-wrapper ${nameField.touched && nameField.error ? "error" : nameField.touched ? "valid" : ""}`}>
          <input
            type="text"
            placeholder="Enter your name (min 3 chars)"
            {...nameField.inputProps}
          />
        </div>
        {nameField.touched && nameField.error && (
          <span className="validation-error">⚠️ {nameField.error}</span>
        )}
      </div>

      <div className="form-group">
        <label>
          Email Address <span className="required-star">*</span>
        </label>
        <div className={`input-wrapper ${emailField.touched && emailField.error ? "error" : emailField.touched ? "valid" : ""}`}>
          <input
            type="email"
            placeholder="you@example.com"
            {...emailField.inputProps}
          />
        </div>
        {emailField.touched && emailField.error && (
          <span className="validation-error">⚠️ {emailField.error}</span>
        )}
      </div>

      <div className="form-group">
        <label>
          Age <span className="required-star">*</span>
        </label>
        <div className={`input-wrapper ${ageField.touched && ageField.error ? "error" : ageField.touched ? "valid" : ""}`}>
          <input
            type="number"
            placeholder="Must be 18 or older"
            {...ageField.inputProps}
          />
        </div>
        {ageField.touched && ageField.error && (
          <span className="validation-error">⚠️ {ageField.error}</span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form Step 2: Preferences Field Components
// ---------------------------------------------------------------------------
function PreferenceFields() {
  const countryField = useField<string>("country");
  const newsletterField = useField<boolean>("newsletter");

  return (
    <div className="form-section">
      <div className="form-group">
        <label>Country of Residence</label>
        <div className="input-wrapper">
          <select {...countryField.inputProps}>
            <option value="US">United States (USD)</option>
            <option value="GB">United Kingdom (GBP)</option>
            <option value="GH">Ghana (GHS - Momo Enabled)</option>
            <option value="NG">Nigeria (NGN - Bank Enabled)</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="checkbox-group">
          <input
            type="checkbox"
            checked={!!newsletterField.value}
            onChange={(e) => newsletterField.onChange(e.target.checked)}
            onBlur={newsletterField.onBlur}
          />
          <div className="checkbox-box"></div>
          <span>Subscribe to developer updates & newsletters</span>
        </label>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form Step 3: Payment Field Components (Dynamic based on Step 2 Country)
// ---------------------------------------------------------------------------
function PaymentFields() {
  const payMethodField = useField<string>("payMethod");
  const cardNumberField = useField<string>("cardNumber");
  const cardExpiryField = useField<string>("cardExpiry");
  const momoProviderField = useField<string>("momoProvider");
  const momoNumberField = useField<string>("momoNumber");

  // Read the country value from the preferences form using a cross-form computed signal
  const registry = getFormRegistry();
  const selectedCountry = useSignalValue(
    useMemo(
      () =>
        createComputed(() => {
          const prefForm = registry.get("preferences");
          return (prefForm?.values.value?.country as string) || "US";
        }),
      [registry]
    )
  );

  // If country changes, adjust payment options
  useEffect(() => {
    if (selectedCountry === "GH") {
      payMethodField.onChange("momo");
    } else if (selectedCountry === "NG") {
      payMethodField.onChange("bank");
    } else {
      payMethodField.onChange("card");
    }
  }, [selectedCountry]);

  const isMomoAvailable = selectedCountry === "GH";
  const isBankAvailable = selectedCountry === "NG";

  return (
    <div className="form-section">
      <div className="form-group">
        <label>Payment Method</label>
        <div className="input-wrapper">
          <select {...payMethodField.inputProps}>
            {isMomoAvailable && <option value="momo">Mobile Money (Momo)</option>}
            {isBankAvailable && <option value="bank">Bank Transfer</option>}
            <option value="card">Credit / Debit Card</option>
          </select>
        </div>
      </div>

      {payMethodField.value === "momo" && (
        <>
          <div className="form-group">
            <label>Momo Provider <span className="required-star">*</span></label>
            <div className="input-wrapper">
              <select {...momoProviderField.inputProps}>
                <option value="mtn">MTN Mobile Money</option>
                <option value="telecel">Telecel Cash</option>
                <option value="at">AT Money</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Momo Number <span className="required-star">*</span></label>
            <div className={`input-wrapper ${momoNumberField.touched && momoNumberField.error ? "error" : momoNumberField.touched ? "valid" : ""}`}>
              <input
                type="text"
                placeholder="024XXXXXXX (10 digits)"
                {...momoNumberField.inputProps}
              />
            </div>
            {momoNumberField.touched && momoNumberField.error && (
              <span className="validation-error">⚠️ {momoNumberField.error}</span>
            )}
          </div>
        </>
      )}

      {payMethodField.value === "bank" && (
        <div className="form-group">
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", padding: "10px", background: "var(--bg-tertiary)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            🏦 Bank details will be generated on completion. Use checkout to pay via OPay / GTBank.
          </p>
        </div>
      )}

      {payMethodField.value === "card" && (
        <>
          <div className="form-group">
            <label>Card Number <span className="required-star">*</span></label>
            <div className={`input-wrapper ${cardNumberField.touched && cardNumberField.error ? "error" : cardNumberField.touched ? "valid" : ""}`}>
              <input
                type="text"
                placeholder="4111 2222 3333 4444"
                {...cardNumberField.inputProps}
              />
            </div>
            {cardNumberField.touched && cardNumberField.error && (
              <span className="validation-error">⚠️ {cardNumberField.error}</span>
            )}
          </div>

          <div className="form-group">
            <label>Expiration Date <span className="required-star">*</span></label>
            <div className={`input-wrapper ${cardExpiryField.touched && cardExpiryField.error ? "error" : cardExpiryField.touched ? "valid" : ""}`}>
              <input
                type="text"
                placeholder="MM/YY"
                {...cardExpiryField.inputProps}
              />
            </div>
            {cardExpiryField.touched && cardExpiryField.error && (
              <span className="validation-error">⚠️ {cardExpiryField.error}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Benchmark Cell Component (Uses granular signals - does NOT trigger main grid re-renders)
// ---------------------------------------------------------------------------
interface CellProps {
  index: number;
}
function BenchmarkCell({ index }: CellProps) {
  // Bind only to this cell's field node in the benchmark form
  const fieldName = `cell_${index}`;
  const cellField = useField<number>(fieldName);

  const isActive = cellField.value;
  const isErr = cellField.error;

  let className = "cell";
  if (isErr) {
    className += " err";
  } else if (typeof isActive === "number" && isActive >= 0) {
    className += ` active-${isActive}`;
  }

  return (
    <div
      className={className}
      title={`Field ${index}`}
      data-id={index}
    />
  );
}

// ---------------------------------------------------------------------------
// Main App Component
// ---------------------------------------------------------------------------
export default function App() {
  const [step, setStep] = useState(1);
  const [submittedData, setSubmittedData] = useState<any>(null);
  
  // Benchmark state
  const [isBenchmarkRunning, setIsBenchmarkRunning] = useState(false);
  const [fps, setFps] = useState(60);
  const renderedCellCount = 1000;
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const benchmarkTimerRef = useRef<any>(null);

  // Initialize Step 1: Profile Form
  const profileForm = useForm({
    id: "profile",
    initialValues: { name: "", email: "", age: "" },
    fieldValidators: {
      name: [validators.required("Name is required"), validators.minLength(3, "Name must be at least 3 characters")],
      email: [validators.required("Email is required"), validators.email("Please enter a valid email address")],
      age: [validators.required("Age is required"), validators.custom((val) => {
        const num = Number(val);
        if (isNaN(num)) return "Age must be a number";
        return num >= 18 ? undefined : "Must be 18 or older";
      })],
    },
  });

  // Initialize Step 2: Preferences Form
  const preferencesForm = useForm({
    id: "preferences",
    initialValues: { country: "US", newsletter: false },
  });

  // Initialize Step 3: Payment Form
  const paymentForm = useForm({
    id: "payment",
    initialValues: {
      payMethod: "card",
      cardNumber: "",
      cardExpiry: "",
      momoProvider: "mtn",
      momoNumber: "",
    },
    fieldValidators: {
      cardNumber: [
        validators.custom((val: any) => {
          // Only validate if card payment is active
          const paymentStore = getFormRegistry().get("payment");
          const method = paymentStore?.values.peek()?.payMethod;
          if (method !== "card") return undefined;
          
          if (!val) return "Card number is required";
          const digits = val.replace(/\D/g, "");
          return digits.length >= 12 ? undefined : "Invalid card format";
        }),
      ],
      cardExpiry: [
        validators.custom((val: any) => {
          const paymentStore = getFormRegistry().get("payment");
          const method = paymentStore?.values.peek()?.payMethod;
          if (method !== "card") return undefined;

          if (!val) return "Expiry date is required";
          return /^\d{2}\/\d{2}$/.test(val) ? undefined : "Format MM/YY";
        }),
      ],
      momoNumber: [
        validators.custom((val: any) => {
          const paymentStore = getFormRegistry().get("payment");
          const method = paymentStore?.values.peek()?.payMethod;
          if (method !== "momo") return undefined;

          if (!val) return "Momo number is required";
          const digits = val.replace(/\D/g, "");
          return digits.length === 10 ? undefined : "Momo number must be 10 digits";
        }),
      ],
    },
  });

  // Benchmark Form: 1000 fields
  const benchmarkInitialValues = useMemo(() => {
    const vals: any = {};
    for (let i = 0; i < 1000; i++) {
      vals[`cell_${i}`] = -1;
    }
    return vals;
  }, []);

  const benchmarkForm = useForm({
    id: "benchmark",
    initialValues: benchmarkInitialValues,
  });

  // Connect forms to DevTools on mount
  useEffect(() => {
    const devtools = connectDevTools(
      profileForm.store,
      preferencesForm.store,
      paymentForm.store,
      { minimized: true } // Start as a small floating orb in the bottom-right corner
    );
    return () => devtools.destroy();
  }, [profileForm.store, preferencesForm.store, paymentForm.store]);

  // Handle wizard next / submit
  const handleNext = async () => {
    if (step === 1) {
      const errors = await profileForm.store.validateAll();
      if (Object.keys(errors).length === 0) {
        setStep(2);
      }
    } else if (step === 2) {
      const errors = await preferencesForm.store.validateAll();
      if (Object.keys(errors).length === 0) {
        setStep(3);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const profileErrors = await profileForm.store.validateAll();
    const prefErrors = await preferencesForm.store.validateAll();
    const payErrors = await paymentForm.store.validateAll();

    if (
      Object.keys(profileErrors).length === 0 &&
      Object.keys(prefErrors).length === 0 &&
      Object.keys(payErrors).length === 0
    ) {
      // All forms are valid!
      setSubmittedData({
        profile: profileForm.values,
        preferences: preferencesForm.values,
        payment: paymentForm.values,
      });
      setStep(4);
    }
  };

  const handleResetWizard = () => {
    profileForm.reset();
    preferencesForm.reset();
    paymentForm.reset();
    setSubmittedData(null);
    setStep(1);
  };

  // 1000 Fields 60fps Benchmark Loop
  const runBenchmarkFrame = () => {
    if (!isBenchmarkRunning) return;

    // Calculate FPS
    frameCountRef.current++;
    const now = performance.now();
    if (now - lastTimeRef.current >= 1000) {
      setFps(Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current)));
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }

    // Mutate 50 random fields on each frame
    batch(() => {
      for (let k = 0; k < 50; k++) {
        const randIndex = Math.floor(Math.random() * 1000);
        const cellVal = Math.random() > 0.08 ? Math.floor(Math.random() * 4) : -1;
        
        // Randomly set validation errors to test error visualizer cells
        const isErr = Math.random() > 0.95;
        const fieldName = `cell_${randIndex}`;
        
        benchmarkForm.store.setFieldValue(fieldName, cellVal);
        const cellField = benchmarkForm.store.getField(fieldName);
        
        if (isErr) {
          cellField.error.set("Benchmark simulated error");
        } else {
          cellField.error.set(undefined);
        }
      }
    });

    benchmarkTimerRef.current = requestAnimationFrame(runBenchmarkFrame);
  };

  useEffect(() => {
    if (isBenchmarkRunning) {
      lastTimeRef.current = performance.now();
      frameCountRef.current = 0;
      benchmarkTimerRef.current = requestAnimationFrame(runBenchmarkFrame);
    } else {
      if (benchmarkTimerRef.current) {
        cancelAnimationFrame(benchmarkTimerRef.current);
      }
    }
    return () => {
      if (benchmarkTimerRef.current) {
        cancelAnimationFrame(benchmarkTimerRef.current);
      }
    };
  }, [isBenchmarkRunning]);

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-box">K</div>
          <div>
            <h1>Kayforms</h1>
            <p>The first framework-agnostic reactive form library with time-travel debugging</p>
          </div>
        </div>
        <div className="badge-container">
          <div className="badge size">&lt;3kb gzipped</div>
          <div className="badge speed">60fps rendering</div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left Side: Wizard Forms */}
        <main className="glass-card">
          {step < 4 ? (
            <>
              {/* Wizard Steps indicator */}
              <div className="wizard-header">
                <div className="wizard-steps">
                  <div className={`step-indicator ${step === 1 ? "active" : "completed"}`} onClick={() => setStep(1)}>
                    <div className="step-circle">1</div>
                    <span className="step-label">Profile</span>
                  </div>
                  <div className={`step-indicator ${step === 2 ? "active" : step > 2 ? "completed" : ""}`} onClick={() => { if(profileForm.valid) setStep(2); }}>
                    <div className="step-circle">2</div>
                    <span className="step-label">Preferences</span>
                  </div>
                  <div className={`step-indicator ${step === 3 ? "active" : ""}`} onClick={() => { if(profileForm.valid && preferencesForm.valid) setStep(3); }}>
                    <div className="step-circle">3</div>
                    <span className="step-label">Payment</span>
                  </div>
                </div>
              </div>

              {/* Form step screens */}
              <form onSubmit={handleCheckoutSubmit}>
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

                {/* Wizard navigation buttons */}
                <div className="button-row">
                  {step > 1 ? (
                    <button type="button" className="btn-btn btn-secondary" onClick={handleBack}>
                      Back
                    </button>
                  ) : (
                    <button type="button" className="btn-btn btn-secondary" disabled>
                      Back
                    </button>
                  )}

                  {step < 3 ? (
                    <button type="button" className="btn-btn btn-primary" onClick={handleNext}>
                      Next Step
                    </button>
                  ) : (
                    <button type="submit" className="btn-btn btn-primary" style={{ background: "var(--gradient-success)" }}>
                      Complete Checkout
                    </button>
                  )}
                </div>
              </form>
            </>
          ) : (
            /* Checkout Success screen */
            <div className="success-overlay">
              <div className="success-icon">✓</div>
              <h2>Order Completed Successfully!</h2>
              <p>
                Your registration and checkout values have been batched and submitted.
                Use the DevTools timeline (bottom right) to review your history and time-travel back!
              </p>
              <div style={{ textAlign: "left", width: "100%", background: "var(--bg-tertiary)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", marginBottom: "24px" }}>
                <h4 style={{ marginBottom: "8px", fontFamily: "var(--font-mono)", fontSize: "14px" }}>BATON SUBMITTED SNAPSHOT</h4>
                <pre className="json-block">{JSON.stringify(submittedData, null, 2)}</pre>
              </div>
              <button type="button" className="btn-btn btn-primary" onClick={handleResetWizard}>
                Submit Another Form
              </button>
            </div>
          )}
        </main>

        {/* Right Side: Reactive State Visualizer */}
        <aside className="glass-card">
          <div className="visualizer-title">
            <span>Reactive State Inspector</span>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--accent-success)", animation: "logo-glow 1s infinite alternate" }}></div>
          </div>
          
          <div className="state-grid">
            {/* Profile Form State */}
            <div className={`state-form-block ${profileForm.valid ? "valid" : "invalid"}`}>
              <div className="state-form-block-header">
                <span className="form-id-title">profileForm</span>
                <span className={`state-tag ${profileForm.valid ? "valid" : "invalid"}`}>
                  {profileForm.valid ? "valid" : "invalid"}
                </span>
              </div>
              <pre className="json-block">
                {JSON.stringify(
                  {
                    values: profileForm.values,
                    errors: profileForm.errors,
                    dirty: profileForm.dirty,
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            {/* Preferences Form State */}
            <div className={`state-form-block ${preferencesForm.valid ? "valid" : "invalid"}`}>
              <div className="state-form-block-header">
                <span className="form-id-title">preferencesForm</span>
                <span className={`state-tag ${preferencesForm.valid ? "valid" : "invalid"}`}>
                  {preferencesForm.valid ? "valid" : "invalid"}
                </span>
              </div>
              <pre className="json-block">
                {JSON.stringify(
                  {
                    values: preferencesForm.values,
                    errors: preferencesForm.errors,
                    dirty: preferencesForm.dirty,
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            {/* Payment Form State */}
            <div className={`state-form-block ${paymentForm.valid ? "valid" : "invalid"}`}>
              <div className="state-form-block-header">
                <span className="form-id-title">paymentForm</span>
                <span className={`state-tag ${paymentForm.valid ? "valid" : "invalid"}`}>
                  {paymentForm.valid ? "valid" : "invalid"}
                </span>
              </div>
              <pre className="json-block">
                {JSON.stringify(
                  {
                    values: paymentForm.values,
                    errors: paymentForm.errors,
                    dirty: paymentForm.dirty,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </aside>
      </div>

      {/* Benchmark Panel */}
      <section className="glass-card benchmark-card">
        <div className="benchmark-header">
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Smart Batching &amp; Fine-grained Rendering Demo</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              Renders {renderedCellCount} independent field nodes. Clicking "Run" updates 50 fields per frame via signals at 60fps,
              meaning ONLY the changed cell components re-render!
            </p>
          </div>
          <div className="benchmark-stats">
            <div className="benchmark-stat-box">
              <div className="stat-value">{fps}</div>
              <div className="stat-label">FPS</div>
            </div>
            <button
              type="button"
              className="btn-btn btn-primary"
              onClick={() => setIsBenchmarkRunning(!isBenchmarkRunning)}
              style={{ background: isBenchmarkRunning ? "var(--gradient-error)" : "var(--gradient-accent)" }}
            >
              {isBenchmarkRunning ? "Stop Benchmark" : "Run 60fps Benchmark"}
            </button>
          </div>
        </div>

        {/* 1000 cells grid */}
        <FormProvider form={benchmarkForm.store}>
          <div className="benchmark-grid-visualizer">
            {Array.from({ length: 1000 }).map((_, index) => (
              <BenchmarkCell
                key={index}
                index={index}
              />
            ))}
          </div>
        </FormProvider>
      </section>
    </div>
  );
}
