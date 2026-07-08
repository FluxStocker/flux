# manifest.json

Todo complemento vive en su propia carpeta (`storage/app/plugins/<name>/`) con un
`manifest.json` en la raíz.

```json
{
  "package_name": "mi-plugin",
  "name": "Mi Plugin",
  "description": "Qué hace, en una frase.",
  "version": "1.0.0",
  "author": "Tu Nombre",
  "type": "script",
  "kind": "panel",
  "main": "dist/server.js",
  "client": "dist/client.js",
  "image": "dist/assets/icon.png",
  "permissions": []
}
```

| Campo | Obligatorio | Descripción |
|---|---|---|
| `package_name` | ✅ | Slug del complemento. **Debe coincidir con el nombre de la carpeta.** Minúsculas, números y guiones (`^[a-z0-9]+([-_][a-z0-9]+)*$`) |
| `name` | — | Nombre visible (por defecto, `package_name`) |
| `description` | — | Frase que ve el administrador |
| `version` | ✅ | Versión del complemento (SemVer recomendado) |
| `author` | — | Autor visible |
| `type` | ✅ | `script` (JS embebido) o `service` (proceso externo — en preparación) |
| `kind` | — | Tipo visual: `panel` (card lateral) o `view` (página completa); por defecto `panel` |
| `main` | ✅ | Entrada del lado servidor, relativa a la carpeta |
| `client` | — | Entrada del lado navegador (módulo ES), relativa a la carpeta |
| `image` | ✅ | Icono 500×500 del complemento, relativo a la carpeta |
| `permissions` | — | Scopes de dominio que el complemento solicita ([`scopes.md`](scopes.md)); se muestran al administrador antes de habilitar |

Un manifest inválido deja el complemento visible en la pantalla de Complementos con
el error explicado, y no se puede habilitar.

## Estructura de carpeta recomendada

Las rutas del manifest son libres (relativas a la carpeta del plugin), pero el
scaffold y la tienda usan esta convención: **la fuente vive solo en `src/` y todo
compilado sale a `dist/`** — nada corre sin compilar. El lenguaje es una carpeta
dentro de `src/` (`js/` hoy; otros lenguajes mañana con la misma forma), y cada
lenguaje separa `client/` y `server/`:

```
mi-plugin/
  manifest.json            # main/client/image apuntan a dist/*
  src/
    assets/                # activos fuente — compartidos entre lenguajes
    css/                   # CSS global — compartido
    js/                    # LENGUAJE
      client/              # navegador: client.ts, flux.d.ts, components/, views/…
      server/              # servidor: server.ts, flux.d.ts (tipado por scopes)
  dist/                    # SOLO salida de build (client.js, server.js, assets/)
```

En producción (tras «pasar a producción» o instalar de la tienda) la carpeta queda
reducida a `manifest.json` + `dist/`.
