import { useState } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [form, setForm] = useState({ name: '', email: '', subject: 'Generell henvendelse', message: '' });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    // Placeholder: in production, swap with Formspree or a Vercel serverless
    // function at /api/contact that emails post@trondknutli.no.
    try {
      await new Promise((r) => setTimeout(r, 500));
      setStatus('sent');
      setForm({ name: '', email: '', subject: 'Generell henvendelse', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <label htmlFor="name">Navn</label>
        <input id="name" name="name" required value={form.name} onChange={handleChange} />
      </div>
      <div className="form-row">
        <label htmlFor="email">E-post</label>
        <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
      </div>
      <div className="form-row">
        <label htmlFor="subject">Emne</label>
        <select id="subject" name="subject" value={form.subject} onChange={handleChange}>
          <option>Generell henvendelse</option>
          <option>Kjøp av original</option>
          <option>Digitaltrykk</option>
          <option>Utstilling / utsmykning</option>
          <option>Annet</option>
        </select>
      </div>
      <div className="form-row">
        <label htmlFor="message">Melding</label>
        <textarea id="message" name="message" required value={form.message} onChange={handleChange} />
      </div>
      <button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sender…' : 'Send melding'}
      </button>
      {status === 'sent' && <p className="form__status">Takk. Meldingen er mottatt. Jeg svarer så snart jeg kan.</p>}
      {status === 'error' && <p className="form__status" style={{ color: 'var(--warm-red)' }}>Noe gikk galt. Prøv igjen eller send e-post direkte.</p>}
    </form>
  );
}
