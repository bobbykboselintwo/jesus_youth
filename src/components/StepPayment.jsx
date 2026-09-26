import { useState } from 'react';

export default function StepPayment({
  data,
  groupMembers = [],
  onSubmitPayment,
  submitting,
  submitError,
  paymentSuccess
}) {
  const [copied, setCopied] = useState(false);
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
                maxHeight: 280,
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
              <li>Click the button below to confirm payment and receive Unique Registration IDs for all delegates.</li>
            </ol>
          </div>

          {submitError && (
            <div style={{ color: 'var(--red-700)', fontSize: 11, marginBottom: 12, textAlign: 'center' }}>
              {submitError}
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn-primary"
              onClick={onSubmitPayment}
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
