export default function StepSuccess({ onReset }) {
  return (
    <div className="step success">
      <div className="success-icon">✓</div>
      <h2>Thank You!</h2>
      <p>
        Your registration has been successfully received. Our local KCYM VITAMIN C PAROPPADY team will reach out to you shortly.
      </p>
      <p style={{ marginTop: 12, fontWeight: 600, color: 'var(--red-700)' }}>
        God Bless You! 🙏
      </p>

      <div className="whatsapp-box">
        <h3>Join our Official WhatsApp Group</h3>
        <p>Get instant updates on upcoming retreats, prayer meetings, and youth gatherings.</p>
        <a
          href="https://chat.whatsapp.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp"
        >
          <span>💬 Join WhatsApp Group</span>
        </a>
      </div>

      <div style={{ marginTop: 24 }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={onReset}
          style={{ fontSize: 13, padding: '10px 18px' }}
        >
          Submit Another Registration
        </button>
      </div>
    </div>
  );
}
