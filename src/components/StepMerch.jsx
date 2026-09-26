import Field from './Field';

const TSHIRT_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

const EVENT_PILLARS = [
  { value: 'Praise & Worship', emoji: '🎵' },
  { value: 'Word of God', emoji: '📖' },
  { value: 'Confession & Healing', emoji: '🕊️' },
  { value: 'Adoration', emoji: '🙏' },
  { value: 'Youth Fellowship', emoji: '🤝' },
  { value: 'Stage Celebration', emoji: '🔥' }
];

export default function StepMerch({
  data,
  errors,
  onChange,
  onToggleInterest,
  groupMembers = [],
  onAddAnotherPerson,
  onRemoveGroupMember
}) {
  return (
    <div className="step">
      <h2>Merchandise &amp; Event Preferences</h2>
      <p className="hint">Select T-Shirt size for the meet kit 👕</p>

      {/* Group Registrations Card */}
      {groupMembers.length > 0 && (
        <div style={{
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: 12,
          padding: 12,
          marginBottom: 16
        }}>
          <div style={{ fontSize: 11, fontWeight: 'bold', color: '#1d4ed8', marginBottom: 6 }}>
            👥 Added Delegates ({groupMembers.length + 1} People Total):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {groupMembers.map((member, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#fff',
                padding: '6px 10px',
                borderRadius: 8,
                fontSize: 10.5,
                border: '1px solid var(--ink-200)'
              }}>
                <div>
                  <strong>{idx + 1}. {member.name} {member.surname}</strong>
                  <span style={{ color: 'var(--ink-500)', marginLeft: 6 }}>({member.phone}) — Size: {member.tShirtSize || 'M'}</span>
                </div>
                {onRemoveGroupMember && (
                  <button
                    type="button"
                    onClick={() => onRemoveGroupMember(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--red-700)',
                      cursor: 'pointer',
                      fontSize: 12,
                      padding: '2px 6px'
                    }}
                    title="Remove Person"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <div style={{
              fontSize: 10.5,
              fontWeight: 'bold',
              color: 'var(--jy-crimson)',
              padding: '4px 6px'
            }}>
              ⭐ Current Form: Member #{groupMembers.length + 1} ({data.name || 'New Person'} {data.surname || ''})
            </div>
          </div>
        </div>
      )}

      <Field label="T-Shirt Size * (Select Size)" error={errors.tShirtSize}>
        <div className="tshirt-grid">
          {TSHIRT_SIZES.map((size) => {
            const checked = data.tShirtSize === size;
            return (
              <button
                key={size}
                type="button"
                className={`tshirt-btn ${checked ? 'selected' : ''}`}
                onClick={() => onChange('tShirtSize', size)}
              >
                {size}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Program Highlights You Are Most Excited For">
        <div className="checkbox-group">
          {EVENT_PILLARS.map(({ value, emoji }) => {
            const checked = data.interests.includes(value);
            return (
              <label key={value} className={checked ? 'selected' : ''} role="checkbox" aria-checked={checked}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleInterest(value)}
                />
                <span>
                  {emoji} {value}
                </span>
              </label>
            );
          })}
        </div>
      </Field>

      {/* Add Another Person Button */}
      {onAddAnotherPerson && (
        <div style={{
          marginTop: 20,
          padding: 12,
          borderRadius: 12,
          background: 'rgba(217, 4, 41, 0.05)',
          border: '1px dashed rgba(217, 4, 41, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--ink-800)', marginBottom: 4 }}>
            Are you registering with family or friends? 👥
          </div>
          <p style={{ fontSize: 10, color: 'var(--ink-600)', margin: '0 0 10px 0' }}>
            Add more people under your session and pay together in one easy payment (₹100 per person).
          </p>
          <button
            type="button"
            className="btn-secondary"
            onClick={onAddAnotherPerson}
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: 11.5,
              fontWeight: 'bold',
              color: 'var(--jy-crimson)',
              border: '1.5px solid var(--jy-crimson)',
              borderRadius: 8
            }}
          >
            ➕ Add Another Person ({groupMembers.length + 1} added so far — ₹{(groupMembers.length + 1) * 100})
          </button>
        </div>
      )}
    </div>
  );
}
