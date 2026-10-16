/* =====================================================================
   CONFIGURACIÓN DE LA BODA
   ---------------------------------------------------------------------
   Este es el ÚNICO archivo que hace falta tocar para personalizar la web.
   Cambia los textos entre comillas y guarda. No hace falta saber programar.
   ===================================================================== */

window.BODA = {
  // --- Los novios ---------------------------------------------------
  novio1: "Laura",
  novio2: "Javier",

  // Fecha y hora de la ceremonia (formato AAAA-MM-DDTHH:MM)
  fecha: "2026-11-21T17:00",
  lugar: "Finca El Olivar · Córdoba",

  // Hashtag que aparece en la web y en la pantalla
  hashtag: "#LauraYJavier2026",

  // Dirección pública de la web (se usa en el código QR).
  // Si se deja vacío se detecta automáticamente.
  urlWeb: "",

  // --- Nube de fotos (Cloudinary, gratis) ---------------------------
  // Si cloudName está vacío la web funciona en "modo demo"
  // (las fotos solo se ven en tu móvil y no se guardan).
  cloudinary: {
    cloudName: "",        // p. ej. "dxyz123ab"
    uploadPreset: "",     // p. ej. "boda_invitados" (tipo Unsigned)
    etiqueta: "boda",     // etiqueta común de todas las fotos (solo letras, números y guiones)
  },

  // --- Las misiones -------------------------------------------------
  // Añade, quita o cambia retos. El "id" debe ser único y sin espacios.
  retos: [
    { id: "selfie-novios",   emoji: "🤳", titulo: "Selfie con los novios",          descripcion: "Encuentra a los novios y hazte un selfie con ellos. ¡Sonrisa obligatoria!" },
    { id: "brindis",         emoji: "🥂", titulo: "El brindis más divertido",        descripcion: "Captura el momento exacto del brindis con la mejor actitud." },
    { id: "desconocido",     emoji: "🤝", titulo: "Nuevo amigo",                     descripcion: "Foto con alguien a quien no conocías antes de hoy." },
    { id: "abuelos",         emoji: "👵", titulo: "Sabiduría",                       descripcion: "Una foto con el invitado o invitada de más edad de la boda." },
    { id: "baile",           emoji: "💃", titulo: "Rey o reina de la pista",          descripcion: "Pilla a alguien en pleno paso de baile legendario." },
    { id: "zapatos",         emoji: "👠", titulo: "Zapatos fuera",                   descripcion: "Los primeros zapatos abandonados de la noche." },
    { id: "detalle",         emoji: "🌿", titulo: "Ojo de fotógrafo",                descripcion: "El detalle de la decoración que más te haya gustado." },
    { id: "mesa",            emoji: "🍽️", titulo: "La mesa más loca",                descripcion: "Toda tu mesa en una sola foto haciendo la pose más original." },
    { id: "lagrima",         emoji: "🥹", titulo: "Momento emoción",                 descripcion: "Alguien emocionado. Discreción, por favor… pero que se vea." },
    { id: "salto",           emoji: "🦘", titulo: "¡Todos arriba!",                  descripcion: "Un grupo saltando a la vez. Puntos extra si nadie sale borroso." },
    { id: "imitacion",       emoji: "🎭", titulo: "Imitadores",                      descripcion: "Imita con alguien una pose típica de los novios." },
    { id: "tarta",           emoji: "🎂", titulo: "Dulce final",                     descripcion: "La tarta… o alguien disfrutándola demasiado." },
  ],
};
