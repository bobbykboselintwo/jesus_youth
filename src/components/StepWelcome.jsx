import { useState } from 'react';

export default function StepWelcome({ onStart, onLookupUniqueId, lookupError, setLookupError }) {
  const [uniqueIdInput, setUniqueIdInput] = useState('');
  const [searching, setSearching] = useState(false);

  const handleLookupSubmit = async (e) => {
    e.preventDefault();
    if (!uniqueIdInput.trim()) {
      if (setLookupError) setLookupError('Please enter your Unique ID');
      return;
    }
    setSearching(true);
    if (onLookupUniqueId) {
      await onLookupUniqueId(uniqueIdInput.trim());
    }
    setSearching(false);
  };

  return (
    <div className="step">
      <h2>VITAMIN C</h2>
      <p className="hint">
        <strong>KCYM SMYM PAROPPADY MEKHALA</strong>
      </p>

      <div className="scripture-quote">
        “I came that they may have life, and have it abundantly.”
        <br />
        <span style={{ fontWeight: 600 }}>— John 10:10</span>
      </div>

      <div className="event-info-box">
        <div className="info-row">
          <span>📅 <strong>Date:</strong> Saturday 17 Oct, 2026 (17/10/2026)</span>
        </div>
        <div className="info-row">
          <span>⏰ <strong>Time:</strong> 02:00 PM – 10:00 PM</span>
        </div>
        <div className="info-row">
          <span>📍 <strong>Venue:</strong> DEVAGIRI COLLEGE, KOZHIKODE</span>
        </div>
      </div>

      <div className="pillars-strip">
        <span>PRAISE • WORD • CONFESSION • ADORATION • FELLOWSHIP • CELEBRATION</span>
      </div>

      <div className="nav" style={{ marginTop: 16, position: 'static', padding: 0, boxShadow: 'none' }}>
        <button type="button" className="btn-primary" onClick={onStart} style={{ width: '100%' }}>
          Register Now →
        </button>
      </div>

      <div style={{ marginTop: 20, fontSize: 9, color: 'var(--ink-600)', textAlign: 'center', fontWeight: 'bold' }}>
        Contact Coordinators: ABRAHAM JOSEPH (<a href="tel:9567113383" style={{ color: 'var(--jy-crimson)' }}>9567113383</a>)
        <br />
        ANCY ALEXANDER (<a href="tel:8089012363" style={{ color: 'var(--jy-crimson)' }}>8089012363</a>)
      </div>
    </div>
  );
}
