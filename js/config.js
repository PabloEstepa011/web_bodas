/* =====================================================================
   CONFIGURACIÓN DE LA BODA
   ---------------------------------------------------------------------
   Este es el ÚNICO archivo que hace falta tocar para personalizar la web.
   Cambia los textos entre comillas y guarda. No hace falta saber programar.
   ===================================================================== */

window.BODA = {
  // --- Los novios ---------------------------------------------------
  novio1: "Aurora",
  novio2: "Mariano",

  // Fecha de la boda (formato AAAA-MM-DDTHH:MM). Se usa para la cuenta atrás.
  fecha: "2026-10-24T12:00",
  mostrarFecha: false,   // true = enseña la fecha escrita en la portada
  lugar: "",             // déjalo vacío para no mostrarlo

  // Hashtag que aparece en la web y en la pantalla
  hashtag: "#AuroraYMariano2026",

  // Dirección pública de la web (se usa en el código QR).
  // Si se deja vacío se detecta automáticamente.
  urlWeb: "https://pabloestepa011.github.io/web_bodas/",

  // --- Nube de fotos (Cloudinary, gratis) ---------------------------
  // Si cloudName está vacío la web funciona en "modo demo"
  // (las fotos solo se ven en tu móvil y no se guardan).
  cloudinary: {
    cloudName: "qanrnlz9",
    uploadPreset: "boda_invitados", // preset de tipo Unsigned
    etiqueta: "boda",     // etiqueta común de todas las fotos (solo letras, números y guiones)
  },

  // --- Las misiones -------------------------------------------------
  // Añade, quita o cambia retos. El "id" debe ser único y sin espacios.
  retos: [
    { id: "selfie-novios",   emoji: "🤳", titulo: "Selfie con los novios",        descripcion: "Consigue una foto sonriendo junto a los recién casados." },
    { id: "brindis",         emoji: "🥂", titulo: "El brindis más divertido",      descripcion: "Captura el momento exacto del brindis con la mejor actitud y energía." },
    { id: "abuelos-pista",   emoji: "👵", titulo: "Los abuelos en la pista",       descripcion: "Inmortaliza a los abuelos (o a la pareja más veterana) dándolo todo bailando." },
    { id: "abrazo-sorpresa", emoji: "🤗", titulo: "Abrazo sorpresa",               descripcion: "Hazle una foto a alguien recibiendo un abrazo inesperado y emotivo." },
    { id: "look",            emoji: "👠", titulo: "El look de la noche",           descripcion: "Fotografía el detalle de vestuario o accesorio más original de la fiesta (unos zapatos locos, unos gemelos divertidos, un tocado...)." },
    { id: "lagrimas",        emoji: "🥹", titulo: "Lágrimas de felicidad",         descripcion: "Captura una sonrisa tan intensa que parezca que van a llover lágrimas de emoción." },
    { id: "mesa-animada",    emoji: "🍽️", titulo: "La mesa más animada",           descripcion: "Retrata a un grupo disfrutando de la cena o el aperitivo riendo a carcajadas." },
    { id: "duelo-baile",     emoji: "🕺", titulo: "Duelo en la pista de baile",    descripcion: "Una foto de los pasos de baile más locos o divertidos de la noche." },
    { id: "momento-dulce",   emoji: "🎂", titulo: "El momento dulce",              descripcion: "Fotografía el instante en que alguien le hinca el diente a un postre, tarta o chuche con cara de felicidad." },
    { id: "amigos",          emoji: "👯", titulo: "Amigos de toda la vida",        descripcion: "Una foto de un grupo de amigos de la infancia o la universidad recordando anécdotas." },
    { id: "beso-robado",     emoji: "💋", titulo: "Beso robado",                   descripcion: "Fotografía un beso espontáneo entre cualquier pareja de invitados que se quiera mucho." },
    { id: "peques",          emoji: "🧸", titulo: "Los peques de la boda",         descripcion: "Captura alguna travesura, baile o momento tierno de los niños invitados." },
    { id: "ramo",            emoji: "💐", titulo: "El momento del ramo",           descripcion: "Captura la tensión, los saltos y las risas justo en el aire antes de que alguien atrape el ramo o la liga." },
    { id: "alma-fiesta",     emoji: "🎉", titulo: "El alma de la fiesta",          descripcion: "Retrata a esa persona que no ha pisado una silla en toda la noche y está animando a todo el mundo." },
    { id: "ultima-foto",     emoji: "🌙", titulo: "La última foto de la noche",    descripcion: "Una selfie grupal con los que queden al pie del cañón cerrando la fiesta." },
  ],
};
