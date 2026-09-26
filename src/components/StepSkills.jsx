import Field from './Field';

const MEETING_TIMES = [
  'Weekday evenings (after 6 PM)',
  'Saturday morning',
  'Saturday afternoon',
  'Saturday evening',
  'Sunday afternoon',
  'Sunday evening',
  'Flexible / Anytime'
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const LEADERSHIP_OPTIONS = [
  'Not at this time',
  'Yes — willing to help coordinate',
  'Yes — willing to lead a small group',
  'Yes — willing to lead a ministry',
  'Undecided'
];

export default function StepSkills({ data, errors, onChange, onToggleDay }) {
  const set = (name) => (e) => onChange(name, e.target.value);

  return (
    <div className="step">
      <h2>Skills & Availability</h2>
      <p className="hint">So we can match you to ministry & service opportunities ✨</p>

      <Field label="Talents / Skills">
        <textarea
          rows={3}
          value={data.skills}
          onChange={set('skills')}
          placeholder="e.g. singing, acoustic guitar, videography, graphic design, public speaking, teaching"
          maxLength={300}
        />
      </Field>

      <Field label="Musical Instruments Played">
        <input
          type="text"
          value={data.instruments}
          onChange={set('instruments')}
          placeholder="e.g. guitar, keyboard, drums, violin (comma separated)"
        />
      </Field>

      <Field label="Preferred Meeting Time *" error={errors.meetingTime}>
        <select value={data.meetingTime} onChange={set('meetingTime')}>
          <option value="">Select preferred time</option>
          {MEETING_TIMES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Available Days * (Pick at least one)" error={errors.availableDays}>
        <div className="checkbox-group" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {DAYS.map((day) => {
            const checked = data.availableDays.includes(day);
            return (
              <label key={day} className={checked ? 'selected' : ''} role="checkbox" aria-checked={checked}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleDay(day)}
                />
                <span style={{ textAlign: 'center', width: '100%' }}>{day}</span>
              </label>
            );
          })}
        </div>
      </Field>

      <Field label="Leadership Interest *" error={errors.leadership}>
        <select value={data.leadership} onChange={set('leadership')}>
          <option value="">Select preference</option>
          {LEADERSHIP_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}
