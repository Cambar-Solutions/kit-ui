# Domain playbook: taller de motos o autos

## Matches
Taller de motos, taller mecánico, servicio automotriz, refaccionaria con taller, taller de bicicletas (same model, change the vocabulary).

## Roles and areas
| Role | Area | Can do |
|---|---|---|
| cliente | `/app` (phone) | See own vehicles, current service, pending items, history, approve or reject a quote, catalog, reserve parts, purchases |
| admin (recepción) | `/admin` (desktop) | Everything: orders, status changes with notes, quotes, customers, catalog and stock, sales, reset demo |

Mention "mecánico" (sees only assigned orders) as a next step unless asked.

## Entities
- **Cliente**: nombre, teléfono, correo, desde cuándo, vehículos.
- **Vehículo**: marca, modelo, año, placas, color, kilometraje.
- **Orden de servicio**: folio legible (F-2481), cliente, vehículo, motivo (lo que reportó el cliente), diagnóstico, partidas (mano de obra o refacción, cantidad, precio unitario, "pieza por llegar"), subtotal, IVA 16 %, total, mecánico, ingreso, entrega estimada, estado, bitácora (estado, fecha, nota, quién).
  - Estados: `recibida` Recibida, `diagnostico` En diagnóstico, `por_aprobar` Esperando tu aprobación (cliente) / Por aprobar (taller), `esperando_refacciones` Esperando refacciones, `reparacion` En reparación, `lista` Lista para entrega, `entregada` Entregada, `pausada` Pausada (presupuesto rechazado), `cancelada` Cancelada.
  - Transiciones del taller: recibida → diagnostico; diagnostico → por_aprobar; por_aprobar → reparacion o esperando_refacciones (solo después de la aprobación del cliente); esperando_refacciones ↔ reparacion; reparacion → lista; lista → entregada. Cancelar desde cualquier estado antes de `lista`, con motivo. **Nunca** saltar a `entregada` desde otro estado que no sea `lista`.
  - Cliente: en `por_aprobar` aprueba (pasa a reparación o a refacciones si hay piezas por llegar) o rechaza (pasa a `pausada`, con motivo opcional).
  - "Pendientes" para el cliente: por_aprobar, esperando_refacciones, pausada. "Historial": entregada y cancelada.
- **Producto**: SKU, nombre, marca, categoría (refacciones, lubricantes, llantas, accesorios, protección), precio, existencias, compatible con. Existencias 0 = agotado; 1 a 3 = pocas piezas.
- **Venta / apartado**: folio (V-0042), cliente, partidas, total, fecha, estado (`apartado`, `pagado`, `cancelado`). El apartado se paga en mostrador; vence en 48 h.

## Screens
Customer:
| Tab | Answers | Notes |
|---|---|---|
| Inicio | "¿Cómo va mi moto?" | Active order with status and progress; quote waiting approval with total and a big action; ready for pickup; reserved items |
| Servicios | "¿Qué tengo pendiente y qué se ha hecho?" | Pendientes, En taller, Historial |
| Detalle | "¿Qué le hacen y cuánto cuesta?" | Progress, motivo, diagnóstico, partidas, IVA, total, approve/reject, bitácora, call the shop |
| Catálogo | "¿Tienen lo que necesito?" | Categories, search, "para mis motos", stock, reserve |
| Compras | "¿Qué compré o aparté?" | Purchases and reservations, cancel a reservation |
| Perfil | | Vehicles, shop hours and address, sign out |

Admin: Tablero (orders per stage, needs attention today with what is missing, recent sales, low stock), Órdenes (search, filter by stage), Detalle de orden (change status with note following transitions, edit quote lines, send quote, bitácora, customer contact), Nueva orden, Clientes, Inventario (stock adjust), Ventas (counter sale, collect or cancel reservations).

## Flows to show in the meeting
1. Customer opens the app and sees the order waiting for approval, reviews lines and total with IVA, approves. Failure: the quote was already answered; show the current state.
2. Admin sees it moved, sets "Esperando refacciones" with a note; the customer sees the note.
3. Admin marks "Lista para entrega"; customer home shows it ready.
4. Customer reserves a part; admin sees the reservation in Ventas and collects it.
5. Admin dashboard: what needs attention today.

## Seed data
Customers with Mexican names and two last names (Carlos Mendoza Ruiz, Mariana Treviño Garza), phones with lada (442 318 7740). Motorcycles common in Mexico: Italika FT150, Italika 250Z, Honda CB190R, Honda XR150L, Yamaha FZ-25, Yamaha MT-03, Suzuki Gixxer 250, Bajaj Pulsar NS200, Vento Crossmax 250, KTM Duke 390, Kawasaki Ninja 400 (cars: Nissan Versa, Aveo, Jetta, March). Plates like Q64-NXK. Services: afinación, cambio de aceite y filtro, balatas, kit de arrastre, servicio de 10,000 km, diagnóstico eléctrico, ajuste de válvulas. Brands for parts: Motul, NGK, EBC, SBS, DID, RK, Hiflo, Yuasa. Prices in MXN that make sense (aceite 1 L $180 a $400, kit de arrastre $900 a $1,900, mano de obra $250 a $1,900). At least 15 orders across every status, 20 or more products with a few low or out of stock, sales over the last 30 days. Dates relative to today.

## Concept seeds for the design
Hoja de orden de servicio con folio y troquel, despiece o diagrama de refacciones con números, tablero de estaciones del taller, etiqueta de llanta, ticket de mostrador, luces del tablero de la moto.

## Pitfalls
- The customer only sees their own data.
- Folios are human readable; never show internal ids.
- IVA: show subtotal, IVA 16 % and total when the shop invoices; ask in the intake if unsure.
- Overdue promised date: warn the shop ("Retrasada"), be neutral with the customer.
- Owners care about: fewer phone calls asking "¿ya está mi moto?", quotes approved faster, and not losing track of parts on order.

## Not built by default
WhatsApp or push notifications, online payment, CFDI invoicing, photos of the vehicle at reception, appointment booking, mechanic role and commissions, multi-branch.
