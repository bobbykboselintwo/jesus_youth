import Field from './Field';

export default function StepPersonal({ data, errors, onChange }) {
  const set = (name) => (e) => onChange(name, e.target.value);

  return (
    <div className="step">
      <h2>Personal Details</h2>
      <p className="hint">Welcome to KCYM SMYM PAROPPADY MEKHALA 👋</p>

      <Field label="Name (First Name) *" error={errors.name}>
        <input
          type="text"
          value={data.name}
          onChange={set('name')}
          placeholder="e.g. Maria"
          autoComplete="given-name"
          autoCapitalize="words"
          enterKeyHint="next"
        />
      </Field>

      <Field label="Surname (Last Name) *" error={errors.surname}>
        <input
          type="text"
          value={data.surname}
          onChange={set('surname')}
          placeholder="e.g. Joseph"
          autoComplete="family-name"
          autoCapitalize="words"
          enterKeyHint="next"
        />
      </Field>

      <Field label="Mobile Number *" error={errors.phone}>
        <input
          type="tel"
          value={data.phone}
          onChange={set('phone')}
          placeholder="+91 98765 43210"
          inputMode="tel"
          autoComplete="tel"
          enterKeyHint="next"
        />
      </Field>

      <Field label="Email Address *" error={errors.email}>
        <input
          type="email"
          value={data.email}
          onChange={set('email')}
          placeholder="you@email.com"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          enterKeyHint="next"
        />
      </Field>
    </div>
  );
}
