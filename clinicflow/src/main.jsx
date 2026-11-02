import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, ArrowRight, BadgeCheck, CalendarDays, Check, CheckCircle2, ChevronDown, Clock3, HeartPulse, MapPin, Menu, Plus, Search, ShieldCheck, Stethoscope, UserRound, Users, X } from 'lucide-react';
import './style.css';

const doctors = [
  { id: 'mira', name: 'Dr. Mira Shah', specialty: 'Cardiology', exp: '12 years experience', initials: 'MS', color: 'rose', fee: 800, days: 'Mon – Fri' },
  { id: 'arjun', name: 'Dr. Arjun Menon', specialty: 'Dermatology', exp: '9 years experience', initials: 'AM', color: 'blue', fee: 650, days: 'Mon – Sat' },
  { id: 'sana', name: 'Dr. Sana Iyer', specialty: 'Pediatrics', exp: '10 years experience', initials: 'SI', color: 'green', fee: 700, days: 'Tue – Sat' },
  { id: 'rohan', name: 'Dr. Rohan Das', specialty: 'General Medicine', exp: '15 years experience', initials: 'RD', color: 'violet', fee: 500, days: 'Mon – Fri' }
];
const slots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'];
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const prettyDate = value => new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const loadBookings = () => { try { return JSON.parse(localStorage.getItem('clinicflow-bookings') || '[]'); } catch { return []; } };

function App() {
  const [bookings, setBookings] = useState(loadBookings);
  const [doctorId, setDoctorId] = useState('mira');
  const [date, setDate] = useState(today());
  const [slot, setSlot] = useState('10:00 AM');
  const [visitType, setVisitType] = useState('Consultation');
  const [patient, setPatient] = useState('');
  const [phone, setPhone] = useState('');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [release, setRelease] = useState('standard');
  const [filter, setFilter] = useState('All');
  useEffect(() => { localStorage.setItem('clinicflow-bookings', JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { fetch('/release.json').then(r => r.ok ? r.json() : null).then(d => d?.release && setRelease(d.release)).catch(() => {}); }, []);

  const doctor = doctors.find(d => d.id === doctorId) || doctors[0];
  const taken = bookings.filter(b => b.doctorId === doctorId && b.date === date && b.status !== 'Cancelled').map(b => b.slot);
  const upcoming = bookings.filter(b => b.status !== 'Cancelled').sort((a,b) => (a.date+a.slot).localeCompare(b.date+b.slot));
  const filteredDoctors = useMemo(() => doctors.filter(d => (filter === 'All' || d.specialty === filter) && (d.name+d.specialty).toLowerCase().includes(query.toLowerCase())), [filter, query]);
  const book = e => {
    e.preventDefault(); setMessage('');
    if (patient.trim().length < 2) return setMessage('Please enter your name.');
    if (!/^[6-9]\d{9}$/.test(phone.trim())) return setMessage('Enter a valid 10-digit mobile number.');
    if (date < today()) return setMessage('Choose today or a future date.');
    if (taken.includes(slot)) return setMessage('That slot was just booked. Please choose another.');
    const item = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), doctorId, doctor: doctor.name, specialty: doctor.specialty, patient: patient.trim(), phone: phone.trim(), date, slot, visitType, fee: doctor.fee, status: 'Confirmed', createdAt: new Date().toISOString() };
    setBookings(current => [item, ...current]); setPatient(''); setPhone(''); setMessage(`Appointment confirmed with ${doctor.name} on ${prettyDate(date)} at ${slot}.`);
  };
  const cancel = id => setBookings(current => current.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b));
  const specialties = ['All', ...doctors.map(d => d.specialty)];

  return <div className="app-shell">
    <header className="topbar"><a className="logo" href="#home"><span className="logo-icon"><HeartPulse size={21}/></span><span>clinic<span>flow</span><small>CARE, MADE SIMPLE</small></span></a><button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen?<X/>:<Menu/>}</button><nav className={menuOpen?'open':''}><a href="#doctors" onClick={()=>setMenuOpen(false)}>Find a doctor</a><a href="#booking" onClick={()=>setMenuOpen(false)}>Book appointment</a><a href="#appointments" onClick={()=>setMenuOpen(false)}>My appointments</a></nav><a className="top-cta" href="#booking">Book a visit <ArrowRight size={15}/></a></header>
    <main id="home">
      <section className="hero"><div className="hero-copy"><div className="eyebrow"><span/> YOUR HEALTH, YOUR TIME</div><h1>Better care starts<br/>with <em>one good visit.</em></h1><p>Find the right specialist, choose a time that works for you, and keep your appointments organised — all in one place.</p><div className="hero-actions"><a className="primary-btn" href="#booking">Book an appointment <ArrowRight size={16}/></a><a className="secondary-link" href="#doctors">Meet our doctors</a></div><div className="hero-trust"><span><CheckCircle2 size={15}/> Easy booking</span><span><ShieldCheck size={15}/> Privacy-conscious demo</span></div></div><div className="hero-visual"><div className="visual-card"><div className="visual-top"><span className="pulse"><Activity size={18}/></span><span className="open-tag"><i/> ACCEPTING APPOINTMENTS</span></div><div className="visual-title">Your care, coordinated.</div><p>Appointments with trusted specialists, without the waiting-room guesswork.</p><div className="visual-stat-row"><div><strong>4</strong><small>Specialists</small></div><div><strong>10</strong><small>Daily slots</small></div><div><strong>7 days</strong><small>Booking window</small></div></div><div className="visual-bottom"><div className="avatar-stack"><i>MS</i><i>AM</i><i>SI</i><i>RD</i></div><span>Care from people who listen</span></div></div><div className="floating-note"><CalendarDays size={17}/><span><b>Simple scheduling</b><small>Pick a slot that suits you</small></span></div><div className="decor decor-one"/><div className="decor decor-two"/></div></section>
      <section className="quick-strip"><div><Users/><span><b>Specialist-led care</b><small>Choose from focused specialties</small></span></div><div><Clock3/><span><b>Convenient time slots</b><small>Morning and afternoon visits</small></span></div><div><BadgeCheck/><span><b>Clear confirmations</b><small>Keep track of every booking</small></span></div></section>
      <section className="section doctors-section" id="doctors"><div className="section-heading"><div><div className="eyebrow">OUR SPECIALISTS</div><h2>Care that fits your needs.</h2><p>Browse our specialists and choose the right person for your visit.</p></div><div className="doctor-tools"><label className="search-box"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search doctors"/></label><select value={filter} onChange={e=>setFilter(e.target.value)} aria-label="Filter specialty">{specialties.map(s=><option key={s}>{s}</option>)}</select></div></div><div className="doctor-grid">{filteredDoctors.map(d=><article className="doctor-card" key={d.id}><div className={`doctor-avatar ${d.color}`}>{d.initials}</div><div className="doctor-info"><span className="specialty-tag">{d.specialty}</span><h3>{d.name}</h3><p>{d.exp}</p><div className="doctor-meta"><span><CalendarDays size={13}/>{d.days}</span><b>₹{d.fee}</b></div></div><button className="choose-btn" onClick={()=>{setDoctorId(d.id);document.getElementById('booking').scrollIntoView({behavior:'smooth'});}}>Choose doctor <ArrowRight size={14}/></button></article>)}</div>{filteredDoctors.length===0&&<div className="empty-state">No specialists match your search. Try another name or specialty.</div>}</section>
      <section className="booking-section" id="booking"><div className="booking-intro"><div className="eyebrow">BOOK IN A FEW STEPS</div><h2>Make time for<br/><em>your health.</em></h2><p>Select a specialist, pick an available slot, and confirm your visit. Your booking appears in My appointments.</p><div className="booking-help"><Stethoscope size={18}/><span><b>Need help choosing?</b><small>General Medicine is a good starting point for routine consultations.</small></span></div></div><form className="booking-form" onSubmit={book}><div className="form-head"><div><span className="step-label">NEW APPOINTMENT</span><h3>Appointment details</h3></div><span className="secure-label"><ShieldCheck size={14}/> Demo booking</span></div><label>Specialist<select value={doctorId} onChange={e=>setDoctorId(e.target.value)}>{doctors.map(d=><option value={d.id} key={d.id}>{d.name} — {d.specialty}</option>)}</select></label><div className="form-row"><label>Preferred date<input type="date" min={today()} value={date} onChange={e=>setDate(e.target.value)}/></label><label>Visit type<select value={visitType} onChange={e=>setVisitType(e.target.value)}><option>Consultation</option><option>Follow-up</option><option>Routine check-up</option></select></label></div><div className="slot-label"><span>Available time slots</span><small>{taken.length} booked for this doctor on this date</small></div><div className="slot-grid">{slots.map(s=><button type="button" key={s} disabled={taken.includes(s)} className={slot===s?'selected':''} onClick={()=>setSlot(s)}>{taken.includes(s)?'Booked':s}</button>)}</div><div className="form-row"><label>Your name<input value={patient} onChange={e=>setPatient(e.target.value)} placeholder="Enter full name" maxLength={60}/></label><label>Mobile number<input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="10-digit number" inputMode="numeric"/></label></div><div className="fee-row"><span>Consultation fee</span><b>₹{doctor.fee}</b></div><button className="submit-btn" type="submit">Confirm appointment <ArrowRight size={16}/></button>{message&&<div className={`form-message ${message.startsWith('Appointment confirmed')?'ok':'error'}`} role="status">{message}</div>}<p className="privacy-note">Demo only: bookings are saved in this browser. Do not enter real patient or medical information.</p></form></section>
      <section className="section appointments-section" id="appointments"><div className="section-heading"><div><div className="eyebrow">YOUR SCHEDULE</div><h2>My appointments.</h2><p>Review or cancel bookings made on this device.</p></div><div className="appointment-count"><CalendarDays size={17}/><b>{upcoming.length}</b><span>upcoming</span></div></div>{upcoming.length===0?<div className="empty-state appointment-empty"><CalendarDays size={24}/><b>No appointments yet</b><span>Your confirmed bookings will appear here.</span><a href="#booking">Book your first appointment <ArrowRight size={14}/></a></div>:<div className="appointments-list">{upcoming.map(b=><article className="appointment-item" key={b.id}><div className="date-tile"><b>{new Date(`${b.date}T00:00:00`).getDate()}</b><span>{new Date(`${b.date}T00:00:00`).toLocaleDateString('en-IN',{month:'short'})}</span></div><div className="appointment-details"><b>{b.doctor}</b><span>{b.specialty} · {b.visitType}</span><small><Clock3 size={12}/>{b.slot} · {prettyDate(b.date)}</small></div><span className="confirmed"><Check size={13}/>{b.status}</span><button className="cancel-btn" onClick={()=>cancel(b.id)}>Cancel</button></article>)}</div>}</section>
      <section className="bottom-banner"><div><div className="eyebrow">HERE WHEN YOU NEED US</div><h2>A healthier routine can start today.</h2><p>Choose a specialist and make your next appointment in just a few clicks.</p></div><a className="primary-btn" href="#booking">Schedule a visit <ArrowRight size={15}/></a></section>
    </main>
    <footer><a className="logo footer-logo" href="#home"><span className="logo-icon"><HeartPulse size={18}/></span><span>clinic<span>flow</span><small>CARE, MADE SIMPLE</small></span></a><div><span><MapPin size={13}/> Demo clinic · Chennai</span><span><ShieldCheck size={13}/> No real patient data stored</span><span className="release-label">Release: {release}</span></div><small>© 2026 ClinicFlow · Educational demonstration</small></footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
