# manifest.json

Todo complemento vive en su propia carpeta (`storage/app/plugins/<name>/`) con un
`manifest.json` en la raíz.

```json
{
  "name": "mi-plugin",
  "title": "Mi Plugin",
  "description": "Qué hace, en una frase.",
  "version": "1.0.0",
  "author": "Tu Nombre",
  "type": "script",
  "main": "main.js",
  "client": "client.js",
  "permissions": []
}
```

| Campo | Obligatorio | Descripción |
|---|---|---|
| `name` | ✅ | Slug del complemento. **Debe coincidir con el nombre de la carpeta.** Minúsculas, números y guiones (`^[a-z0-9]+([-_][a-z0-9]+)*$`) |
| `title` | — | Nombre visible (por defecto, `name`) |
| `description` | — | Frase que ve el administrador |
| `version` | ✅ | Versión del complemento (SemVer recomendado) |
| `author` | — | Autor visible |
| `type` | ✅ | `script` (JS embebido) o `service` (proceso externo — en preparación) |
| `main` | ✅ | Entrada del lado servidor, relativa a la carpeta |
| `client` | — | Entrada del lado navegador (módulo ES), relativa a la carpeta |
| `permissions` | — | Scopes de dominio que el complemento solicita (se muestran al administrador antes de habilitar; el sistema de scopes está en preparación) |

Un manifest inválido deja el complemento visible en la pantalla de Complementos con
el error explicado, y no se puede habilitar.
