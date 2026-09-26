import { useState, useEffect } from 'react';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://jesus-youth-ru8k.onrender.com').replace(/\/$/, '');

export default function StepPayment({
  data,
  groupMembers = [],
  onSubmitPayment,
  submitting,
  submitError,
  paymentSuccess
}) {
  const [copied, setCopied] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [verifyingOcr, setVerifyingOcr] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);

  const upiId = 'abrahamjosephthadathil200@okhdfcbank';
  const accountName = 'Abraham Joseph Thadathil';

  const totalPeople = groupMembers.length + 1;
  const totalAmount = totalPeople * 100;
  const allMembersList = [...groupMembers, data];

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clean up object URL when component unmounts or previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setScreenshotFile(file);
    setVerifyingOcr(true);
    setOcrResult(null);

    // Call FastAPI backend /api/verify-payment endpoint for OCR analysis
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('expected_amount', totalAmount);

      const res = await fetch(`${API_BASE_URL}/api/verify-payment`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const json = await res.json();
        if (json.verification) {
          setOcrResult(json.verification);
        }
      } else {
        // Fallback default OCR structure if API error
        setOcrResult({
          status: 'MANUAL_REVIEW',
          message: 'Screenshot attached successfully. Queued for Admin verification.'
        });
      }
    } catch (err) {
      console.warn('Backend OCR verification offline, queuing screenshot locally:', err);
      setOcrResult({
        status: 'MANUAL_REVIEW',
        message: 'Screenshot uploaded. Queued for fast Admin verification.'
      });
    } finally {
      setVerifyingOcr(false);
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setOcrResult(null);
  };

  return (
    <div className="step">
      <h2>Fee Payment (₹{totalAmount})</h2>
      <p className="hint">
        {totalPeople > 1
          ? `Group Payment for ${totalPeople} Delegates (${totalPeople} × ₹100 = ₹${totalAmount}) 👥💳`
          : 'Scan QR code or use UPI ID to complete payment 💳'}
      </p>

      {/* Group Members List Summary */}
      {totalPeople > 1 && (
        <div style={{
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: 10,
          padding: '10px 12px',
          marginBottom: 14,
          fontSize: 11
        }}>
          <div style={{ fontWeight: 'bold', color: '#1d4ed8', marginBottom: 4 }}>
            📋 Delegates Included in this Payment ({totalPeople} Total):
          </div>
          <ol style={{ margin: 0, paddingLeft: 18, color: 'var(--ink-800)' }}>
            {allMembersList.map((m, idx) => (
              <li key={idx} style={{ margin: '2px 0' }}>
                <strong>{m.name} {m.surname}</strong>
                {idx === 0 && <span style={{ color: 'var(--jy-crimson)', fontWeight: 'bold' }}> (Primary / Leader)</span>}
                <span style={{ color: 'var(--ink-500)', fontSize: 10 }}> — T-Shirt: {m.tShirtSize || 'M'}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {paymentSuccess ? (
        <div className="payment-success-banner">
          <div className="success-check-icon">✓</div>
          <h3>Registration &amp; Payment Submitted!</h3>
          <p>
            Your registration for {totalPeople} delegate(s) (Total: ₹{totalAmount}) has been submitted successfully and is pending review by the admin team.
          </p>
        </div>
      ) : (
        <>
          <div className="qr-container" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 8, color: 'var(--jy-crimson)' }}>
              Payee: {accountName}
            </div>

            <img
              src="/upi_qrcode.jpg"
              alt={`UPI QR Code - Abraham Joseph Thadathil ₹${totalAmount}`}
              className="qr-image"
              style={{
                maxWidth: '100%',
                maxHeight: 260,
                borderRadius: 12,
                border: '1px solid var(--ink-200)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
            <div className="qr-amount-tag" style={{ marginTop: 8, fontSize: 12, fontWeight: 'bold' }}>
              Total Registration Fee: ₹{totalAmount} {totalPeople > 1 ? `(${totalPeople} × ₹100)` : ''}
            </div>

            <div className="upi-id-box" style={{ marginTop: 10, wordBreak: 'break-all' }}>
              <span>UPI ID: <strong>{upiId}</strong></span>
              <button type="button" className="btn-copy" onClick={copyUpi}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="payment-instructions" style={{ marginTop: 16 }}>
            <ol>
              <li>Scan the QR code above using GPay, PhonePe, Paytm, or any UPI App.</li>
              <li>Verify payee name: <strong>{accountName}</strong>.</li>
              <li>Pay the total registration fee of <strong>₹{totalAmount}</strong> ({totalPeople} delegate{totalPeople > 1 ? 's' : ''}).</li>
              <li>Upload your GPay / UPI payment screenshot below for automated verification.</li>
            </ol>
          </div>

          {/* Screenshot Upload Box */}
          <div style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 12,
            background: 'var(--card-bg, #ffffff)',
            border: '2px dashed var(--ink-300, #cbd5e1)',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, color: 'var(--ink-800)' }}>
              📱 Upload GPay / UPI Payment Screenshot (Optional / Recommended)
            </div>

            {!previewUrl ? (
              <label style={{
                display: 'inline-block',
                background: 'var(--jy-crimson, #d90429)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                marginTop: 4
              }}>
                📷 Choose Screenshot File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            ) : (
              <div style={{ marginTop: 8 }}>
                <img
                  src={previewUrl}
                  alt="Payment Screenshot Preview"
                  style={{
                    maxHeight: 180,
                    maxWidth: '100%',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    marginBottom: 8
                  }}
                />
                <div>
                  <button
                    type="button"
                    onClick={handleRemoveScreenshot}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#dc2626',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    🗑 Remove / Change Screenshot
                  </button>
                </div>
              </div>
            )}

            {/* OCR Progress & Result Banner */}
            {verifyingOcr && (
              <div style={{ marginTop: 10, fontSize: 11, color: '#2563eb', fontWeight: 600 }}>
                <span className="spinner" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />
                Analyzing payment screenshot with OCR engine...
              </div>
            )}

            {ocrResult && (
              <div style={{
                marginTop: 10,
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 11,
                textAlign: 'left',
                background: ocrResult.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                border: `1px solid ${ocrResult.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(234, 179, 8, 0.4)'}`,
                color: ocrResult.status === 'APPROVED' ? '#15803d' : '#a16207'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: 2 }}>
                  {ocrResult.status === 'APPROVED' ? '✅ Automated OCR Match: APPROVED' : '⚡ Screenshot Attached: queued for review'}
                </div>
                <div>{ocrResult.message}</div>
              </div>
            )}
          </div>

          {submitError && (
            <div style={{ color: 'var(--red-700)', fontSize: 11, marginTop: 12, textAlign: 'center' }}>
              {submitError}
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => onSubmitPayment(screenshotFile, ocrResult)}
              disabled={submitting}
              style={{ width: '100%', minHeight: 44 }}
            >
              {submitting ? <span className="spinner" /> : `Confirm Payment (₹${totalAmount}) & Complete Registration ✓`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
