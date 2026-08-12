# Guía de Despliegue en Google Apps Script & Google Sheets

Esta aplicación web de **Ayuno Intermitente 18:6 y Meta de 82 kg** está diseñada para funcionar inmediatamente en tu navegador local y también para ser desplegada en **Google Apps Script** para que todos tus datos de ayuno y peso se guarden automáticamente en tu propio **Google Sheets**.

---

## Opción A: Probar Inmediatamente en tu Navegador Local

1. Abre directamente el archivo `index.html` en cualquier navegador web (Chrome, Safari, Edge, Firefox).
2. ¡Listo! La app utilizará el almacenamiento local (`localStorage`) de tu navegador de manera ultra rápida. Todo tu progreso se conservará.

---

## Opción B: Desplegar en Google Apps Script (Conectado a Google Sheets)

Sigue estos 4 sencillos pasos para tener tu propia URL de la aplicación en la nube accesible desde tu teléfono móvil:

### Paso 1: Crear un nuevo proyecto en Google Apps Script
1. Ve a [script.google.com](https://script.google.com) e inicia sesión con tu cuenta de Google.
2. Haz clic en **"Nuevo proyecto"** en la esquina superior izquierda.
3. Cambia el nombre del proyecto a: `Ayuno Intermitente 18:6`.

### Paso 2: Copiar los Archivos del Proyecto

1. **Archivo `Code.gs`**:
   - Reemplaza todo el contenido del archivo `Código.gs` por el contenido del archivo [`Code.gs`](file:///c:/Users/diazp/Desktop/Ayuno%20Intermitente/Code.gs).

2. **Crear archivo `index.html`**:
   - En el menú lateral izquierdo de Apps Script, haz clic en el botón **`+`** al lado de Archivos y selecciona **HTML**.
   - Nómbralo exactamente `index`.
   - Copia todo el contenido de [`index.html`](file:///c:/Users/diazp/Desktop/Ayuno%20Intermitente/index.html) y pega los estilos de `styles.css` e instrucciones dentro de las etiquetas `<style>` y `<script>` correspondientes.

### Paso 3: Desplegar como Aplicación Web

1. En la esquina superior derecha de Google Apps Script, haz clic en **Implementar > Nueva implementación**.
2. Haz clic en el ícono de engranaje ⚙️ y selecciona **Aplicación web**.
3. Configura los parámetros:
   - **Descripción**: `Versión 1.0 Ayuno 18:6`
   - **Ejecutar como**: `Yo (tu correo de Google)`
   - **Quién tiene acceso**: `Cualquier persona` *(o Solo yo)*
4. Haz clic en **Implementar**.
5. Otorga los permisos de acceso a Google Drive/Sheets cuando te lo solicite.

### Paso 4: Instalar en la Pantalla de Inicio de tu Móvil (iOS / Android)

1. Copia la **URL de la Aplicación Web** que te proporciona Google Apps Script.
2. Abre la URL en el navegador de tu teléfono móvil (Safari en iPhone o Chrome en Android).
3. **En iPhone (iOS)**: Toca el botón *Compartir* ⎋ y selecciona **"Añadir a la pantalla de inicio"**.
4. **En Android**: Toca el menú de tres puntos ⋮ y selecciona **"Agregar a la pantalla principal"**.

¡Listo! Tendrás un ícono en tu teléfono que abrirá tu aplicación con diseño **iOS Glassmorphism en tonos azules**, tu cronómetro 18:6, etapas del cuerpo en vivo, control de peso a 82 kg y registro directo en tu hoja de cálculo **Google Sheets**.
