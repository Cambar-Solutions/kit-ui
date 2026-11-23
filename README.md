# kit-ui

Herramientas de Cambar Solutions para construir demos y apps web con agentes de IA.

- **`demo-pwa`**: skill para agentes que arma una demo PWA lista para enseñar a un cliente a partir de un brief corto ("crea una demo para un taller de motos"). Diseña con la skill `impeccable`, construye un área de cliente para teléfono y un panel administrativo con datos de ejemplo mexicanos, y la verifica en un navegador real.
- **Componentes kit-ui**: componentes React + Tailwind v4 que se instalan uno por uno con el CLI de shadcn (estados, validación, accesibilidad y confirmaciones ya resueltos). Toman colores, tipografía y radios del tema del proyecto.

## Instalar la skill

En el proyecto (queda en `.kiro/skills/demo-pwa`):

```bash
npx shadcn@latest add Cambar-Solutions/kit-ui/demo-pwa
```

Para todos tus proyectos, copia `skills/demo-pwa` a `~/.kiro/skills/demo-pwa` (o a la carpeta de skills de tu herramienta, por ejemplo `~/.claude/skills/demo-pwa`).

Skills recomendadas que se usan por nombre (instálalas aparte): `impeccable` (diseño, crítica y pulido), y opcionalmente `frontend-design`, `offline-first-pwa`, `pwa-review`.

Uso: pídele al agente *"crea una demo para una cremería"*. Hará hasta 7 preguntas con respuesta propuesta; contesta "ok" para aceptarlas.

## Instalar componentes

```bash
npx shadcn@latest add Cambar-Solutions/kit-ui/button
npx shadcn@latest add Cambar-Solutions/kit-ui/table-view
npx shadcn@latest add Cambar-Solutions/kit-ui/all
npx shadcn@latest list Cambar-Solutions/kit-ui
```

Se instalan en `components/kit/`. Catálogo, ejemplos y cómo adaptarlos a un diseño propio: [docs/components.md](docs/components.md).

Con un agente: *"usa el Button de kit-ui"*.

## Estructura

```
registry.json          catálogo del registry (shadcn)
registry/kit/          código de los componentes
skills/demo-pwa/       la skill
docs/components.md     catálogo y ejemplos
```

## Uso interno

Este repositorio no tiene licencia: el código es de Cambar Solutions y su uso está reservado a su equipo. Si el repo vuelve a ser privado, la instalación sigue funcionando para quien tenga acceso, con `gh auth login` o con la variable `GH_TOKEN` (token de solo lectura del repo).
