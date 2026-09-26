import Field from './Field';

const KERALA_DISTRICTS = [
  'Thiruvananthapuram',
  'Kollam',
  'Pathanamthitta',
  'Alappuzha',
  'Kottayam',
  'Idukki',
  'Ernakulam',
  'Thrissur',
  'Palakkad',
  'Malappuram',
  'Kozhikode',
  'Wayanad',
  'Kannur',
  'Kasaragod'
];

export default function StepAcademic({ data, errors, onChange }) {
  const set = (name) => (e) => onChange(name, e.target.value);

  return (
    <div className="step">
      <h2>Academics & Location</h2>
      <p className="hint">Helps us group students by institution and region 🎓</p>

      <Field label="School / College *" error={errors.institution}>
        <input
          type="text"
          value={data.institution}
          onChange={set('institution')}
          placeholder="e.g. St. Teresa's College, Kochi"
          autoCapitalize="words"
          enterKeyHint="next"
        />
      </Field>

      <Field label="Course / Grade *" error={errors.course}>
        <input
          type="text"
          value={data.course}
          onChange={set('course')}
          placeholder="e.g. B.Com Finance, +2 Computer Science"
          enterKeyHint="next"
        />
      </Field>

      <Field label="Year of Study *" error={errors.year}>
        <select value={data.year} onChange={set('year')}>
          <option value="">Select year</option>
          <option>1st Year</option>
          <option>2nd Year</option>
          <option>3rd Year</option>
          <option>4th Year</option>
          <option>5th Year+</option>
          <option>Other / Completed</option>
        </select>
      </Field>

      <Field label="City / Town *" error={errors.city}>
        <input
          type="text"
          value={data.city}
          onChange={set('city')}
          placeholder="e.g. Aluva, Pala, Thodupuzha"
          autoCapitalize="words"
          enterKeyHint="next"
        />
      </Field>

      <Field label="District (Kerala) *" error={errors.district}>
        <select value={data.district} onChange={set('district')}>
          <option value="">Select district</option>
          {KERALA_DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}
