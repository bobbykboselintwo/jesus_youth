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

      {/* ALREADY REGISTERED SECTION */}
      <div className="already-registered-card" style={{
        marginTop: 20,
        padding: 16,
        borderRadius: 12,
        background: 'rgba(217, 4, 41, 0.05)',
        border: '1px dashed rgba(217, 4, 41, 0.3)',
        textAlign: 'center'
      }}>
        <h4 style={{ margin: '0 0 6px 0', fontSize: 13, color: 'var(--jy-crimson)', fontWeight: 'bold' }}>
          ALREADY Registered? 🔑
        </h4>
        <p style={{ margin: '0 0 12px 0', fontSize: 11, color: 'var(--ink-600)' }}>
          Enter your Unique ID to check your pass &amp; registration status:
        </p>

        <form onSubmit={handleLookupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Maria-Joseph-9207200525-maria@example.com-0001"
            value={uniqueIdInput}
            onChange={(e) => {
              setUniqueIdInput(e.target.value);
              if (setLookupError) setLookupError('');
            }}
            style={{
              padding: '10px 12px',
              fontSize: 11,
              borderRadius: 8,
              border: lookupError ? '1px solid var(--red-700)' : '1px solid var(--ink-300)',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />

          {lookupError && (
            <div style={{ color: 'var(--red-700)', fontSize: 11, fontWeight: 'bold' }}>
              ⚠️ {lookupError}
            </div>
          )}

          <button
            type="submit"
            className="btn-secondary"
            disabled={searching}
            style={{
              padding: '10px 16px',
              fontSize: 12,
              fontWeight: 'bold',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            {searching ? 'Searching...' : 'Check Status with Unique ID →'}
          </button>
        </form>
      </div>

      <div style={{ marginTop: 20, fontSize: 9, color: 'var(--ink-600)', textAlign: 'center', fontWeight: 'bold' }}>
        Contact Coordinators: ABRAHAM JOSEPH (<a href="tel:9567113383" style={{ color: 'var(--jy-crimson)' }}>9567113383</a>)
        <br />
        ANCY ALEXANDER (<a href="tel:8089012363" style={{ color: 'var(--jy-crimson)' }}>8089012363</a>)
      </div>
    </div>
  );
}
