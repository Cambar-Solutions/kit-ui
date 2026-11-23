# Intake

One message, 5 to 7 numbered questions, each with a proposed default in bold so the user can answer "ok". Infer the defaults from the request and the domain playbook. Write in the user's language.

## Template (adapt to the business)

```
Antes de armar la demo, confirma o ajusta (responde "ok" para aceptar todo):

1. Nombre del negocio: **<propuesto o "Taller Ramírez">**. ¿Tienes logo? Si no, hago un monograma con las iniciales.
2. Color de marca: **<propuesto según el giro>**, o dime el suyo (hex o "el rojo de su letrero").
3. Lo que el cliente debe ver funcionando (máximo 5): **<3 a 5 flujos del playbook>**.
4. Roles: **<del playbook, p. ej. cliente y administrador>**.
5. Ciudad o región: **<CDMX>** (para nombres, teléfonos, horarios y precios de ejemplo).
6. ¿Algo que evitar o que su competencia ya tiene y no le gusta? **<ninguno>**.
```

Add one question only if the trade needs it (for example "¿cobran con IVA desglosado?" for workshops, "¿venden por kilo o por pieza?" for food shops).

## Rules

- Never more than 7 questions. Never ask what the request already says.
- If the user replies "ok", use every default. If they answer some, keep the defaults for the rest.
- If a logo file is provided, put it in `public/` and use it for the app header, the favicon and the PWA icons (convert to a square PNG first if needed).
- Write `docs/BRIEF.md`:

```md
# Brief
- Negocio: ...
- Giro: ... (playbook: <file>)
- Marca: nombre, logo (ruta o "monograma"), color
- Debe verse funcionando: 1. ... 2. ...
- Roles: ...
- Región y moneda: ...
- Evitar: ...
- Supuestos: ... (what you decided without asking)
```

## Picking the playbook

Match on the trade, not on the words "app" or "sistema". A creamery that sells online is still `food-shop` with ordering; a workshop that sells parts is still `taller-mecanico`. If two fit, pick the one whose main daily task matches the client's, and say which.
