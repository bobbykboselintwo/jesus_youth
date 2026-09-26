import { useState, useEffect } from 'react';
import './App.css';
import ProgressBar from './components/ProgressBar';
import StepWelcome from './components/StepWelcome';
import StepPersonal from './components/StepPersonal';
import StepFaith from './components/StepFaith';
import StepMerch from './components/StepMerch';
import StepConsent from './components/StepConsent';
import StepPayment from './components/StepPayment';
import StepStatusView from './components/StepStatusView';
import StepSuccess from './components/StepSuccess';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import UpiCheckPage from './components/UpiCheckPage';
import BackgroundPoster from './components/BackgroundPoster';
import { getDeviceId } from './utils/device';
import { saveDraft, loadDraft, clearDraft } from './utils/storage';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://jesus-youth-ru8k.onrender.com').replace(/\/$/, '');

const TOTAL_FORM_STEPS = 4;

const INITIAL_DATA = {
  // Step 1 — Personal Info
  name: '',
  surname: '',
  phone: '',
  email: '',
  // Step 2 — Faith & Community
  parish: '',
  diocese: '',
  // Step 3 — Event Options & Merchandise
  tShirtSize: '',
  interests: [],
  // Step 4 — Emergency Contact & Consent
  emergencyName: '',
  emergencyPhone: '',
  dataConsent: false,
  // Payment
  paymentRef: 'DIRECT_PAYMENT',
};

// Initial MVP sample registrations with persistent device IDs and structured Reg IDs
const INITIAL_MVP_SUBMISSIONS = [
  {
    regId: 'Maria-Joseph-+91 9207200525-maria@example.com-0001',
    device_id: 'demo_device_maria',
    name: 'Maria',
    surname: 'Joseph',
    phone: '+91 9207200525',
    email: 'maria@example.com',
    parish: "St. Mary's Cathedral, Paroppady",
    diocese: 'Ernakulam-Angamaly',
    tShirtSize: 'M',
    paymentRef: 'DIRECT_PAYMENT',
    registrationStatus: 'PENDING',
    submittedAt: new Date().toISOString()
  },
  {
    regId: 'Naveen-Kurian-+91 9061915105-naveen@example.com-0002',
    device_id: 'demo_device_naveen',
    name: 'Naveen',
    surname: 'Kurian',
    phone: '+91 9061915105',
    email: 'naveen@example.com',
    parish: 'Lourdes Cathedral',
    diocese: 'Thrissur',
    tShirtSize: 'L',
    paymentRef: 'DIRECT_PAYMENT',
    registrationStatus: 'APPROVED',
    submittedAt: new Date().toISOString()
  },
  {
    regId: 'Leema-Varghese-+91 9207200525-leema@example.com-0003',
    device_id: 'demo_device_leema',
    name: 'Leema',
    surname: 'Varghese',
    phone: '+91 9207200525',
    email: 'leema@example.com',
    parish: 'St. Joseph Cathedral',
    diocese: 'Kannur',
    tShirtSize: 'S',
    paymentRef: 'DIRECT_PAYMENT',
    registrationStatus: 'REJECTED',
    submittedAt: new Date().toISOString()
  }
];

export default function App() {
  const [step, setStep] = useState(0); 
  // Step key:
  // -2 = Admin Dashboard, -1 = Admin Login, 0 = Welcome, 1..4 = Form, 5 = Payment Screen, 6 = Status View, 7 = Final Success
  const [data, setData] = useState(INITIAL_DATA);
  const [groupMembers, setGroupMembers] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  const [deviceId] = useState(getDeviceId());
  const [userRegistration, setUserRegistration] = useState(null);
  const [mvpSubmissions, setMvpSubmissions] = useState(INITIAL_MVP_SUBMISSIONS);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Restore draft from localStorage on initial render
  useEffect(() => {
    const saved = loadDraft();
    if (saved && saved.data && saved.step > 0 && saved.step <= TOTAL_FORM_STEPS) {
      setData((prev) => ({ ...prev, ...saved.data }));
      setStep(saved.step);
      setDraftRestored(true);
    }
  }, []);

  // Check URL pathname, hash, or search query for /admin or /upi-check on load
  useEffect(() => {
    const href = window.location.href.toLowerCase();
    if (href.includes('/upi-check') || href.includes('#upi-check') || href.includes('?upi-check')) {
      setStep(-3);
    } else if (href.includes('/admin') || href.includes('#admin') || href.includes('?admin')) {
      setStep(-1);
    } else {
      checkDeviceRegistration();
    }
  }, []);


  // Check if current device has already registered (via API or state)
  const checkDeviceRegistration = async () => {
    try {
      // 1. Try FastAPI REST endpoint
      const res = await fetch(`${API_BASE_URL}/api/status/${deviceId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.registered && json.registration) {
          setUserRegistration(json.registration);
          setStep(6); // Render device status view
          return;
        }
      }
    } catch (err) {
      console.warn('API status check offline, checking local device state:', err);
    }

    // 2. Check local state match by device_id
    const existing = mvpSubmissions.find((s) => s.device_id === deviceId);
    if (existing) {
      setUserRegistration(existing);
      setStep(6);
    }
  };

  // Lookup Unique ID function for Welcome Page
  const handleLookupUniqueId = async (inputQuery) => {
    const query = inputQuery.trim().toLowerCase();
    setLookupError('');

    // 1. Check local submissions first
    const foundLocal = mvpSubmissions.find((s) => {
      const rId = (s.regId || s.registration_id || '').toLowerCase();
      const ph = (s.phone || '').toLowerCase();
      const em = (s.email || '').toLowerCase();
      return rId === query || rId.includes(query) || ph === query || em === query;
    });

    if (foundLocal) {
      setUserRegistration(foundLocal);
      setStep(6);
      return;
    }

    // 2. Try fetching from FastAPI backend
    try {
      const res = await fetch(`${API_BASE_URL}/api/status/${encodeURIComponent(inputQuery.trim())}`);
      if (res.ok) {
        const json = await res.json();
        if (json.registered && json.registration) {
          setUserRegistration(json.registration);
          setStep(6);
          return;
        }
      }
    } catch (err) {
      console.warn('FastAPI lookup offline:', err);
    }

    setLookupError(`Registration not found for Unique ID: "${inputQuery.trim()}". Please check your ID and try again.`);
  };

  // Group Registration Handlers
  const handleAddAnotherPerson = () => {
    if (!data.name.trim() || !data.surname.trim()) {
      setErrors({
        name: !data.name.trim() ? 'Please enter name' : '',
        surname: !data.surname.trim() ? 'Please enter surname' : ''
      });
      setStep(1);
      return;
    }

    const newMember = {
      ...data,
      fullName: `${data.name} ${data.surname}`.trim()
    };

    setGroupMembers((prev) => [...prev, newMember]);

    // Reset data for next person, keeping parish & diocese prefilled
    setData({
      ...INITIAL_DATA,
      name: '',
      surname: '',
      phone: '',
      email: '',
      parish: data.parish || INITIAL_DATA.parish,
      diocese: data.diocese || INITIAL_DATA.diocese,
      emergencyName: data.emergencyName || INITIAL_DATA.emergencyName,
      emergencyPhone: data.emergencyPhone || INITIAL_DATA.emergencyPhone
    });
    setErrors({});
    setStep(1); // Return to Personal details step for person 2+
  };

  const handleRemoveGroupMember = (indexToRemove) => {
    setGroupMembers((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Auto-save draft on data or step changes
  useEffect(() => {
    if (step >= 1 && step <= TOTAL_FORM_STEPS) {
      saveDraft(data, step);
    }
  }, [data, step]);

  // Scroll to top on step change
  useEffect(() => {
    const body = document.querySelector('.step-body');
    if (body) body.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const updateField = (name, value) => {
    setData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const toggleInterest = (interest) => {
    setData((prev) => {
      const has = prev.interests.includes(interest);
      return {
        ...prev,
        interests: has
          ? prev.interests.filter((i) => i !== interest)
          : [...prev.interests, interest],
      };
    });
    setErrors((prev) => ({ ...prev, interests: '' }));
  };

  // Step Validation
  const validateStep = () => {
    const e = {};

    if (step === 1) {
      if (!data.name.trim()) e.name = 'Please enter your name';
      if (!data.surname.trim()) e.surname = 'Please enter your surname';

      const cleanPhone = data.phone.replace(/[\s-]/g, '');
      if (!cleanPhone) e.phone = 'Please enter mobile number';
      else if (!/^(\+91)?\d{10}$/.test(cleanPhone)) e.phone = 'Enter valid 10-digit mobile number';

      if (!data.email.trim()) e.email = 'Please enter email address';
      else if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) e.email = 'Enter a valid email address';
    }

    if (step === 2) {
      if (!data.parish.trim()) e.parish = 'Please enter your parish name';
      if (!data.diocese) e.diocese = 'Please select your diocese';
    }

    if (step === 3) {
      if (!data.tShirtSize) e.tShirtSize = 'Please select your T-Shirt size';
    }

    if (step === 4) {
      if (!data.dataConsent) e.dataConsent = 'You must agree to data consent to submit';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => s + 1);
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  const start = () => {
    if (userRegistration) {
      setStep(6);
    } else {
      setStep(1);
    }
  };

  const resetForm = () => {
    clearDraft();
    setData(INITIAL_DATA);
    setGroupMembers([]);
    setErrors({});
    setUserRegistration(null);
    setStep(0);
  };

  // Step 4 -> Step 5 Transition (Form Completed -> Payment Screen)
  const submitFormToPayment = () => {
    if (!validateStep()) return;
    setStep(5); // Show Payment Screen
  };

  // Step 5 Submit Payment Details for Group / Individual
  const handlePaymentSubmit = async (screenshotFile, ocrResult) => {
    setSubmitting(true);
    setSubmitError('');

    const currentMember = {
      ...data,
      fullName: `${data.name} ${data.surname}`.trim()
    };
    const allMembers = groupMembers.length > 0 ? [...groupMembers, currentMember] : [currentMember];

    const primaryPerson = allMembers[0];
    const primaryFullName = `${primaryPerson.name} ${primaryPerson.surname}`.trim();

    let newRecords = [];
    let uniqueIdsSummary = [];
    let currentSeq = mvpSubmissions.length + 1;

    // Determine registration status based on OCR result
    const calculatedStatus = ocrResult?.status === 'APPROVED' ? 'APPROVED' : 'PENDING';

    for (let i = 0; i < allMembers.length; i++) {
      const m = allMembers[i];
      const seqStr = String(currentSeq++).padStart(4, '0');
      const uniqueId = `${m.name.trim()}-${m.surname.trim()}-${m.phone.trim() || 'phone'}-${m.email.trim() || 'email'}-${seqStr}`;

      const isPrimary = i === 0;
      const record = {
        ...m,
        regId: uniqueId,
        device_id: isPrimary ? deviceId : `device_${m.phone || Math.random().toString(36).substring(2, 9)}`,
        registeredBy: isPrimary ? 'Primary / Self' : primaryFullName,
        registrationStatus: calculatedStatus,
        paymentStatus: calculatedStatus === 'APPROVED' ? 'VERIFIED' : 'SUBMITTED',
        amount: 100.0,
        ocrStatus: ocrResult?.status || null,
        ocrMessage: ocrResult?.message || null,
        submittedAt: new Date().toISOString()
      };

      try {
        const res = await fetch(`${API_BASE_URL}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.regId) record.regId = json.regId;
        }
      } catch (err) {
        console.warn('FastAPI backend offline, persisting locally:', err);
      }

      newRecords.push(record);
      uniqueIdsSummary.push(`${i + 1}. ${m.fullName}: ${record.regId}`);
    }

    // If a screenshot file was attached, send to FastAPI for backend OCR verification & Mongo sync
    if (screenshotFile) {
      try {
        const formData = new FormData();
        formData.append('file', screenshotFile);
        formData.append('device_id', deviceId);
        formData.append('expected_amount', allMembers.length * 100);

        await fetch(`${API_BASE_URL}/api/verify-payment`, {
          method: 'POST',
          body: formData,
        });
      } catch (err) {
        console.warn('FastAPI backend payment verification offline, updated local state:', err);
      }
    }

    // Persist in local state
    setMvpSubmissions((prev) => [...newRecords, ...prev.filter((s) => s.device_id !== deviceId)]);
    setUserRegistration(newRecords[0]); // Set Primary delegate for Status View
    setPaymentSuccess(true);
    clearDraft();
    setSubmitting(false);

    // Show alert informing registrant to remember their Unique IDs
    alert(`🎉 REGISTRATION SUBMITTED SUCCESSFULLY FOR ${allMembers.length} DELEGATE(S)!\n\nIMPORTANT: SAVE YOUR UNIQUE REGISTRATION IDs:\n\n${uniqueIdsSummary.join('\n')}\n\nYou will need these Unique IDs to check registration passes anytime!`);

    setTimeout(() => {
      setStep(6); // Show Device Status View
    }, 1200);
  };


  // Fetch all registrations from MongoDB for Admin Dashboard
  const fetchAdminRegistrations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/registrations`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setMvpSubmissions(data);
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch registrations from backend, using local state:', err);
    }
  };

  // Admin Actions: Approve or Reject a registration
  const handleAdminUpdateStatus = async (targetDeviceId, newStatus) => {
    try {
      // API call to FastAPI admin endpoint
      await fetch(`${API_BASE_URL}/api/admin/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: targetDeviceId, status: newStatus }),
      });
    } catch (e) {
      console.warn('FastAPI admin action API offline, updating local state:', e);
    }

    // Update local state immediately for instant UI feedback
    setMvpSubmissions((prev) =>
      prev.map((item) =>
        item.device_id === targetDeviceId || item.phone === targetDeviceId || item.regId === targetDeviceId
          ? { ...item, registrationStatus: newStatus }
          : item
      )
    );

    // If target device is current user, update current user view instantly
    if (targetDeviceId === deviceId || userRegistration?.phone === targetDeviceId || userRegistration?.regId === targetDeviceId) {
      setUserRegistration((prev) => (prev ? { ...prev, registrationStatus: newStatus } : null));
    }

    // Re-fetch from MongoDB to ensure admin dashboard reflects the real database state
    await fetchAdminRegistrations();
  };

  const progressPercent =
    step === 0 ? 0 : step > TOTAL_FORM_STEPS ? 100 : (step / TOTAL_FORM_STEPS) * 100;
  const inForm = step >= 1 && step <= TOTAL_FORM_STEPS;

  return (
    <div className="app">
      <BackgroundPoster />
      <div className="card">

        {/* Header Bar */}
        <div className="header">
          <div className="logo">✝</div>
          <h1>KCYM SMYM PAROPPADY MEKHALA</h1>
          <p className="subtitle">VITAMIN C</p>

          <div className="header-actions" style={{ display: 'flex', gap: 6 }}>
            {step === -3 ? (
              <button
                type="button"
                className="btn-icon-tag"
                onClick={() => setStep(userRegistration ? 6 : 0)}
              >
                App Form 📋
              </button>
            ) : (
              <button
                type="button"
                className="btn-icon-tag"
                onClick={() => setStep(-3)}
                style={{ background: 'rgba(217, 4, 41, 0.1)', color: 'var(--jy-crimson)' }}
              >
                UPI Check 🔍
              </button>
            )}

            {step === -2 || step === -1 ? (
              <button
                type="button"
                className="btn-icon-tag"
                onClick={() => setStep(userRegistration ? 6 : 0)}
              >
                App Form
              </button>
            ) : (
              <button
                type="button"
                className="btn-icon-tag"
                onClick={() => setIsAdminLoggedIn(true) || setStep(isAdminLoggedIn ? -2 : -1)}
              >
                Admin 🔐
              </button>
            )}
          </div>
        </div>

        {/* Malayalam Banner Announcement */}
        <div className="malayalam-banner">
          <p>
            ക്രിസ്തുവിൽ ജീവിക്കാം! വിശ്വാസത്തിൽ ജ്വലിക്കം! ആവേശത്തിൽ ഒന്നിക്കാം!
          </p>
          <div className="tagline" style={{ marginTop: 4, fontStyle: 'italic', fontWeight: 700 }}>
            Not just a Meeting ....... It's a Life Changing Dose
          </div>
        </div>

        {/* Sticky Progress Bar */}
        {inForm && (
          <div className="progress-wrap">
            <ProgressBar percent={progressPercent} />
          </div>
        )}

        {/* Step Body Container */}
        <div className="step-body">
          {draftRestored && inForm && (
            <div className="draft-notice">
              <span>📋 Your saved draft was restored.</span>
              <button type="button" onClick={() => setDraftRestored(false)}>
                Dismiss
              </button>
            </div>
          )}

          {/* Step -3: Standalone UPI Screenshot Inspector (/upi-check) */}
          {step === -3 && (
            <UpiCheckPage
              onBackToForm={() => setStep(userRegistration ? 6 : 0)}
            />
          )}

          {/* Step -1: Admin Login */}
          {step === -1 && (
            <AdminLogin
              onLoginSuccess={() => {
                setIsAdminLoggedIn(true);
                fetchAdminRegistrations();
                setStep(-2);
              }}
            />
          )}


          {/* Step -2: Admin Portal Dashboard */}
          {step === -2 && (
            <AdminDashboard
              submissions={mvpSubmissions}
              onUpdateStatus={handleAdminUpdateStatus}
              onLogout={() => {
                setIsAdminLoggedIn(false);
                setStep(0);
              }}
              onBackToForm={() => setStep(userRegistration ? 6 : 0)}
            />
          )}

          {step === 0 && (
            <StepWelcome
              onStart={start}
              isRegistered={!!userRegistration}
              registrationStatus={userRegistration?.registrationStatus}
              onLookupUniqueId={handleLookupUniqueId}
              lookupError={lookupError}
              setLookupError={setLookupError}
            />
          )}

          {step === 1 && (
            <StepPersonal data={data} errors={errors} onChange={updateField} />
          )}

          {step === 2 && (
            <StepFaith data={data} errors={errors} onChange={updateField} />
          )}

          {step === 3 && (
            <StepMerch
              data={data}
              errors={errors}
              onChange={updateField}
              onToggleInterest={toggleInterest}
              groupMembers={groupMembers}
              onAddAnotherPerson={handleAddAnotherPerson}
              onRemoveGroupMember={handleRemoveGroupMember}
            />
          )}

          {step === 4 && (
            <StepConsent
              data={data}
              errors={errors}
              onChange={updateField}
              submitting={submitting}
              submitError={submitError}
              groupMembers={groupMembers}
              onAddAnotherPerson={handleAddAnotherPerson}
              onRemoveGroupMember={handleRemoveGroupMember}
            />
          )}

          {/* Step 5: UPI Payment Screen */}
          {step === 5 && (
            <StepPayment
              data={data}
              groupMembers={groupMembers}
              onChange={updateField}
              onSubmitPayment={handlePaymentSubmit}
              submitting={submitting}
              submitError={submitError}
              paymentSuccess={paymentSuccess}
            />
          )}

          {/* Step 6: Device Status View */}
          {step === 6 && (
            <StepStatusView
              registration={userRegistration}
              onRefreshStatus={checkDeviceRegistration}
              onGoToWelcome={() => setStep(0)}
            />
          )}

          {step === 7 && <StepSuccess onReset={resetForm} />}
        </div>

        {/* Navigation Controls */}
        {inForm && (
          <div className="nav">
            {step > 1 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={back}
                disabled={submitting}
                aria-label="Go back"
              >
                ← Back
              </button>
            )}

            {step < TOTAL_FORM_STEPS ? (
              <button type="button" className="btn-primary" onClick={next}>
                Next →
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={submitFormToPayment}
                disabled={submitting}
              >
                Proceed to Payment (₹100) →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


