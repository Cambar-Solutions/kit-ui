# kit-ui

Herramientas de Cambar Solutions para construir demos y apps web con agentes de IA.

- **`demo-pwa`**: skill para agentes que arma una demo PWA lista para enseñar a un cliente a partir de un brief corto ("crea una demo para un taller de motos"). Diseña con la skill `impeccable`, construye un área de cliente para teléfono y un panel administrativo con datos de ejemplo mexicanos, y la verifica en un navegador real.
- **Componentes kit-ui**: componentes React + Tailwind v4 que se instalan uno por uno con el CLI de shadcn (estados, validación, accesibilidad y confirmaciones ya resueltos). Toman colores, tipografía y radios del tema del proyecto.

## Instalar la skill

Un comando revisa qué skills tienes, te dice cuáles faltan y las instala desde sus repos oficiales si aceptas:

```bash
npx github:Cambar-Solutions/kit-ui
```

| Skill | Nivel | Para qué | Se instala desde |
|---|---|---|---|
| `demo-pwa` | necesaria | constructor de demos | este repo |
| `impeccable` | recomendada | diseño, crítica y pulido | su instalador oficial (`npx impeccable install`) |
| `offline-first-pwa` | recomendada | reglas de PWA | github.com/mattiasgeniar/offline-first-pwa |
| `frontend-design` | opcional | diseño de respaldo | github.com/anthropics/skills |
| `pwa-review` | opcional | auditoría de PWA | github.com/NexFabric/pwa-review-skill |
| `shadcn` | opcional | reglas para componentes | github.com/shadcn-ui/ui |

Opciones:

```bash
npx github:Cambar-Solutions/kit-ui check                 # solo revisar, no instala nada
npx github:Cambar-Solutions/kit-ui --yes --scope global  # instalar todo sin preguntar
npx github:Cambar-Solutions/kit-ui --only demo-pwa,impeccable
npx github:Cambar-Solutions/kit-ui --harness claude      # kiro (por defecto), claude o codex
npx github:Cambar-Solutions/kit-ui --force               # reinstalar o actualizar
```

`global` instala en `~/.kiro/skills` (todos tus proyectos); `project` en `.kiro/skills` de la carpeta actual. Las skills de terceros se descargan de su fuente original en tu máquina; este repo no las copia.

Alternativa solo para un proyecto con `components.json`: `npx shadcn@latest add Cambar-Solutions/kit-ui/demo-pwa`.

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
