# Domain playbook: cremería, panadería, carnicería, tienda de alimentos

## Matches
Cremería, quesería, panadería, pastelería, carnicería, frutería, abarrotes con pedidos, cocina económica con pedidos para recoger o a domicilio.

## Roles and areas
| Role | Area | Can do |
|---|---|---|
| cliente | `/app` (phone) | Browse products, build an order, choose pickup or delivery, track the order, repeat a past order, favorites |
| admin (mostrador) | `/admin` (desktop or tablet at the counter) | Incoming orders board, change status, products and availability, today's sales, customers |

## Entities
- **Producto**: nombre, categoría (quesos, cremas, embutidos, lácteos, abarrotes; or pan dulce, pasteles...), unidad (`kg`, `pieza`, `paquete`, `litro`), precio por unidad, presentación (p. ej. "Queso Oaxaca, 1 kg"), disponible hoy (sí/no), mínimo y paso para productos por peso (0.25 kg), descripción corta.
- **Pedido**: folio (P-1187), cliente, partidas (producto, cantidad con unidad, precio), total, tipo (`recoger` o `domicilio`), horario de entrega o recolección, dirección si domicilio, notas ("rebanado delgado"), estado, historial.
  - Estados: `recibido` Recibido, `preparando` En preparación, `listo` Listo para recoger / `en_camino` En camino (domicilio), `entregado` Entregado, `cancelado` Cancelado.
  - Transiciones: recibido → preparando → listo (recoger) o en_camino (domicilio) → entregado. Cancelar solo antes de `listo`/`en_camino`, con motivo.
  - Productos por peso: el total final puede variar ±10 %; show "aprox." and the final weighed amount when ready.
- **Cliente**: nombre, teléfono, direcciones, favoritos.

## Screens
Customer: Inicio (active order status, "repetir mi último pedido", today's specials), Productos (categories, search, quantity by weight or piece), Carrito (pickup or delivery, time slot, notes), Mis pedidos (active and past, repeat), Perfil.
Admin: Pedidos de hoy as a board by status (the main screen), Detalle de pedido (weigh and confirm final amount, status), Productos (availability today, price), Ventas del día, Clientes.

## Flows to show in the meeting
1. Customer repeats last week's order, changes 1 kg to 1.5 kg, picks a pickup time, sends it.
2. Counter sees it arrive on the board, marks "En preparación", weighs and confirms final amount, marks "Listo".
3. Customer sees "Listo para recoger" with the final total.
4. Counter marks a product as not available today; it disappears from the customer catalog.
5. Today's sales at a glance.

## Seed data
Products with real Mexican names: queso Oaxaca, panela, Chihuahua, manchego, cotija, crema ácida, jocoque, requesón, mantequilla, jamón de pierna, chorizo, salchicha; pan: concha, cuerno, oreja, bolillo, telera, rosca. Prices per kg in MXN that make sense for the region. Customers from the colonia, phones with lada, delivery addresses in nearby colonias. Orders today in every status, and history over 4 weeks.

## Concept seeds for the design
Papel de estraza, etiqueta de báscula con peso y precio, pizarrón de "hoy tenemos", ticket de mostrador, charola de pan, bolsa de papel con sello.

## Pitfalls
- Weight-based products: never show a fixed total without "aprox." until weighed.
- Availability changes daily; out-of-stock must be obvious.
- Owners care about: fewer WhatsApp messages to answer, orders ready on time, repeat customers.

## Not built by default
Online payment, real delivery tracking, WhatsApp integration, loyalty points, inventory by batch and expiration, invoicing.
