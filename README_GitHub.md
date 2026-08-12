# Ayuno Intermitente 16:8 — Despliegue en GitHub Pages (PWA Instalable)

La aplicación es **100% estática y autocontenida**: ya no depende de Google Sheets ni de ningún servidor.
Todos los datos se guardan en una **base de datos local (IndexedDB + localStorage)** dentro de tu dispositivo,
por lo que **todas las funciones siguen activas** (cronómetro 16:8, peso 82 kg, ejercicio, pasos, fármacos,
logros, Dashboard y Agente IA TensorFlow.js) incluso sin conexión a internet.

Además es una **PWA**: se puede **instalar en el teléfono o PC con un bonito icono y abrir en pantalla
completa**, fuera del navegador (sin la barra de direcciones).

---

## Opción A: Instalar localmente (para probar ya)

1. Abre `index.html` directamente en tu navegador (doble clic).
2. Todo funciona y tus datos se guardan en la base de datos local del navegador.

> Nota: al abrir con `file://` el Service Worker no se activa. Para instalar como PWA usa la Opción B (GitHub Pages) o cualquier servidor local (por ejemplo `python -m http.server 8080`).

---

## Opción B: Publicar en GitHub Pages (recomendado)

1. Crea un repositorio en [github.com](https://github.com) (público o privado).
2. Sube **todos los archivos** de esta carpeta al repositorio (o copia toda la carpeta a la raíz):
   - `index.html` (la app completa)
   - `manifest.json`
   - `sw.js`
   - Los iconos de la PWA **en la raíz** (sube los archivos sueltos, uno por uno con
     **Add file → Upload files**; no intentes subir la carpeta `icons/`, GitHub no la acepta):
     - `icon-192.png`
     - `icon-512.png`
     - `icon-512-maskable.png`
     - `apple-touch-icon.png`
     - `favicon.svg`
3. Ve a **Settings → Pages**.
   - En *Build and deployment* selecciona **Deploy from a branch**.
   - Branch: `main` (o `master`) y carpeta `/ (root)`.
   - Guarda. GitHub te dará la URL, por ejemplo:
     `https://tu-usuario.github.io/ayuno-intermitente/`
4. Abre esa URL desde tu teléfono o PC.

---

## Opción C: Instalar como aplicación de pantalla completa

Con la app abierta desde la URL de GitHub Pages:

- **Android (Chrome):** toca el menú ⋮ → **"Agregar a pantalla principal"** / **"Instalar aplicación"**.
  O usa el botón **📲 Instalar** que aparece en la cabecera de la app.
- **iPhone/iPad (Safari):** toca el botón *Compartir* ⎋ → **"Añadir a pantalla de inicio"**.
- **PC (Chrome/Edge):** haz clic en el icono **Instalar** de la barra de direcciones, o el botón **📲 Instalar** de la app.

El icono que verás es el generado en `icons/` (anillo de temporizador + rayo + texto "16:8").
La app se abrirá **a pantalla completa**, sin barra del navegador, con soporte **offline**.

---

## Base de datos autocontenida

- **IndexedDB** (`ayuno_intermitente_db`) es la base de datos principal y guarda todos los registros de forma
  persistente y con mayor capacidad.
- **localStorage** actúa como caché espejo para respuestas instantáneas.
- Al iniciar, la app **fusiona automáticamente** ambos almacenes, de modo que aunque limpies el historial de
  navegación (pero no los datos del sitio) conservas tu progreso.
- Si IndexedDB no está disponible (navegación privada, etc.), la app usa solo `localStorage` y sigue funcionando.

### Nota sobre Google Sheets (legacy)

Si publicabas antes con Google Apps Script, esos archivos (`Code.gs`, `appsscript.json`,
`README_AppsScript.md`) ya **no son necesarios** y pueden eliminarse. La app sigue conservando el código de
sincronización por si algún día la vuelves a publicar en Apps Script, pero en GitHub Pages usa su propia
base de datos local.

---

## Regenerar los iconos

Si quieres cambiar el diseño del icono, edita `icons/generate-icons.ps1` y ejecuta:

```powershell
powershell -ExecutionPolicy Bypass -File icons\generate-icons.ps1
```
