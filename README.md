# 📸 Misión Secreta de Boda

Web para que los invitados de una boda completen **retos fotográficos** desde el móvil y suban sus fotos a una galería compartida en directo.

Todo es **gratis**:

| Pieza | Servicio | Coste |
|---|---|---|
| Alojamiento de la web | GitHub Pages | Gratis |
| Almacenamiento de las fotos | Cloudinary (plan Free, ~25 GB/mes) | Gratis, sin tarjeta |

No hay servidor ni base de datos: la web sube las fotos directamente desde el móvil a Cloudinary.

## Qué incluye

- **`index.html`**: la web de los invitados. Portada con cuenta atrás, lista de retos con progreso, subida de fotos (cámara o galería, se reducen de tamaño automáticamente), fotos libres (varias a la vez), galería en directo con filtros por reto, visor a pantalla completa con descarga y opción de borrar tu foto durante 10 minutos.
- **`pantalla.html`**: presentación en directo para poner en una tele o proyector en el salón. Las fotos nuevas salen primero, con un QR en la esquina para que se una más gente.
- **`qr.html`**: tarjetas con el QR para imprimir y poner en las mesas (4 por folio A4).

## Personalizar

Todo lo personalizable está en **[`js/config.js`](js/config.js)**: nombres, fecha, lugar, hashtag y la lista de retos. Basta con cambiar los textos entre comillas.

Después de cambiar CSS o JS, sube el número `?v=` en los `<script>`/`<link>` de los `.html` para que los móviles no usen una versión antigua guardada.

## Configurar Cloudinary (una sola vez)

1. Crea una cuenta gratis en <https://cloudinary.com/users/register_free>.
2. En el **Dashboard**, copia el **Cloud name**.
3. **Settings → Upload → Upload presets → Add upload preset**:
   - *Upload preset name*: `boda_invitados`
   - *Signing mode*: **Unsigned**
   - *Asset folder*: `boda`
   - En *Optional parameters* / *Advanced*, activa **Return delete token** (permite deshacer una subida durante 10 minutos).
   - Guarda.
4. **Settings → Security → Restricted media types**: **desmarca "Resource list"** y guarda. Así funciona la galería. Hazlo antes de abrir la galería por primera vez, porque Cloudinary guarda en caché los errores.
5. Pon el Cloud name y el nombre del preset en `js/config.js`:

   ```js
   cloudinary: { cloudName: "tu-cloud-name", uploadPreset: "boda_invitados", etiqueta: "boda" },
   ```

Mientras `cloudName` esté vacío, la web funciona en **modo demo**: se puede probar todo, pero las fotos no se guardan.

### Descargar todas las fotos después de la boda

En Cloudinary, entra en **Media Library → carpeta `boda`**, selecciona todas las fotos y pulsa **Download** para bajarlas en un ZIP.

### Borrar una foto inapropiada

Desde la Media Library de Cloudinary. Puede tardar un minuto en desaparecer de la galería.

## Probar en local

```bash
python3 -m http.server 5500
```

Y abre <http://localhost:5500>.

## Publicación

La web se publica con GitHub Pages desde la rama `main` (carpeta raíz). Cada `git push` la actualiza en un minuto más o menos.
