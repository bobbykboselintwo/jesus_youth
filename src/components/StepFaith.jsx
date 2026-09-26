import Field from './Field';

const DIOCESES = [
  'Thiruvananthapuram',
  'Quilon (Kollam)',
  'Punalur',
  'Pathanamthitta',
  'Thiruvalla',
  'Kottayam',
  'Changanacherry',
  'Kanjirapally',
  'Palai',
  'Ernakulam-Angamaly',
  'Kothamangalam',
  'Idukki',
  'Thrissur',
  'Irinjalakuda',
  'Palakkad',
  'Thamarassery',
  'Calicut',
  'Mananthavady',
  'Kannur',
  'Kasaragod',
  'Verapoly',
  'Vijayapuram',
  'Other',
  'Not Catholic'
];

export default function StepFaith({ data, errors, onChange }) {
  const set = (name) => (e) => onChange(name, e.target.value);

  return (
    <div className="step">
      <h2>Parish & Diocese</h2>
      <p className="hint">Help us identify your home parish and diocese 🙏</p>

      <Field label="Parish Name *" error={errors.parish}>
        <input
          type="text"
          value={data.parish}
          onChange={set('parish')}
          placeholder="e.g. St. Mary's Cathedral, Paroppady"
          autoCapitalize="words"
          enterKeyHint="next"
        />
      </Field>

      <Field label="Diocese *" error={errors.diocese}>
        <select value={data.diocese} onChange={set('diocese')}>
          <option value="">Select diocese</option>
          {DIOCESES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}
