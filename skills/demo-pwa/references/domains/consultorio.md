# Domain playbook: consultorio, clínica, estética, servicios con cita

## Matches
Consultorio médico, dental, veterinaria, fisioterapia, nutrición, psicología, estética, barbería, spa: anything where the core is an appointment.

## Roles and areas
| Role | Area | Can do |
|---|---|---|
| paciente / cliente | `/app` (phone) | Book an appointment, see upcoming and past visits, reschedule or cancel within the rules, see indications or receipts, profile |
| admin (recepción) | `/admin` (desktop) | Agenda by day and professional, confirm, check in, mark attended or no-show, patients, services and prices, payments of the day |

Professional-only notes (clinical records) are sensitive: in a demo show only non-clinical info (visit reason, indications text written for the patient).

## Entities
- **Servicio**: nombre, duración (min), precio, profesional(es) que lo dan.
- **Profesional**: nombre, especialidad, horario por día.
- **Cita**: folio, paciente, servicio, profesional, fecha y hora, estado, motivo, notas para el paciente, pago.
  - Estados: `solicitada` Solicitada, `confirmada` Confirmada, `en_sala` En sala de espera, `atendida` Atendida, `no_asistio` No asistió, `cancelada` Cancelada.
  - Transiciones: solicitada → confirmada; confirmada → en_sala → atendida; confirmada → no_asistio (after the time passed); cancel by patient until N hours before (from the brief, default 12 h), by reception any time with a reason.
  - Slots: only free slots inside the professional's schedule; no double booking.
- **Paciente**: nombre, teléfono, correo, fecha de nacimiento (optional), mascotas (veterinaria).

## Screens
Patient: Inicio (next appointment card with date, time, place, "cómo llegar", reschedule), Agendar (service, professional, day, free slot, confirm), Mis citas (upcoming and past), Indicaciones / recibos, Perfil.
Admin: Agenda del día (columns per professional, the main screen), Detalle de cita (status changes, notes for the patient, payment), Pacientes, Servicios y precios, Cobros del día.

## Flows to show in the meeting
1. Patient books a cleaning for Thursday at 10:30 with Dra. Reyes; sees it confirmed.
2. Reception sees it in the agenda, checks the patient in, marks attended, registers payment.
3. Patient sees the visit in history with the indications.
4. Patient tries to cancel 2 hours before: the app explains the policy and offers to call.
5. Reception's day view: who is next, who did not show.

## Seed data
Professionals with titles (Dra. Ana Reyes, Dr. Luis Herrera), Mexican patient names, phones with lada, services with real prices for the region (limpieza dental $600 a $900, consulta general $400 a $700, corte de cabello $150 a $350). Appointments for today and the next 7 days in every status, history over 3 months.

## Concept seeds for the design
Tarjeta de cita, carnet de citas, receta con membrete, odontograma, agenda de papel por horas, turnero de sala de espera.

## Pitfalls
- Time zones and formats: 24 h or 12 h consistently, day names in Spanish.
- No double booking; show why a slot is not available.
- Privacy: no diagnoses in the demo; keep data clearly fictitious.
- Owners care about: fewer no-shows, less phone time, a full agenda.

## Not built by default
WhatsApp/SMS reminders, online payment or deposits, clinical records, insurance, electronic prescriptions, multi-branch.
