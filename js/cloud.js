/* Capa de almacenamiento: sube y lista fotos en Cloudinary.
   Sin Cloudinary configurado funciona en "modo demo" (solo en memoria). */
(function () {
  const cfg = window.BODA.cloudinary || {};
  const cloudName = (cfg.cloudName || "").trim();
  const preset = (cfg.uploadPreset || "").trim();
  const baseTag = slug(cfg.etiqueta || "boda") || "boda";
  const configured = Boolean(cloudName && preset);

  const demoPhotos = [];

  function slug(s) {
    return String(s)
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function tagFor(retoId) {
    if (!retoId) return baseTag;
    return `${baseTag}-${retoId === "libre" ? "libre" : "reto-" + slug(retoId)}`;
  }

  // Valores de contexto: hay que escapar "|" y "=".
  const ctxEscape = (v) => String(v).replace(/([|=\\])/g, "\\$1");

  /* Reduce la foto a un tamaño razonable antes de subirla
     (ahorra datos móviles y espacio en la nube). */
  async function compress(file, maxSide = 2560, quality = 0.85) {
    if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
      const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
      if (scale === 1 && file.size < 2.5 * 1024 * 1024) { bmp.close?.(); return file; }
      const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(bmp, 0, 0, w, h);
      bmp.close?.();
      const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", quality));
      return blob && blob.size < file.size ? blob : file;
    } catch {
      return file; // p. ej. HEIC en navegadores que no lo leen: Cloudinary lo convierte
    }
  }

  function upload(file, { reto, guest }, onProgress = () => {}) {
    if (!configured) return demoUpload(file, { reto, guest }, onProgress);

    return compress(file).then((blob) => new Promise((resolve, reject) => {
      const fd = new FormData();
      fd.append("file", blob, file.name || "foto.jpg");
      fd.append("upload_preset", preset);
      fd.append("tags", [baseTag, tagFor(reto || "libre")].join(","));
      const ctx = [`reto=${ctxEscape(reto || "libre")}`];
      if (guest) ctx.push(`guest=${ctxEscape(guest)}`);
      fd.append("context", ctx.join("|"));

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
      xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
      xhr.onerror = () => reject(new Error("Sin conexión. Inténtalo de nuevo."));
      xhr.onload = () => {
        let res = {};
        try { res = JSON.parse(xhr.responseText); } catch {}
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(normalize({ ...res, context: { custom: { guest, reto } } }, res.delete_token));
        } else {
          reject(new Error(res.error?.message || `Error al subir (${xhr.status})`));
        }
      };
      xhr.send(fd);
    }));
  }

  function demoUpload(file, { reto, guest }, onProgress) {
    return compress(file, 1600).then((blob) => new Promise((resolve) => {
      let p = 0;
      const t = setInterval(() => {
        p = Math.min(1, p + 0.12 + Math.random() * 0.1);
        onProgress(p);
        if (p >= 1) {
          clearInterval(t);
          const url = URL.createObjectURL(blob);
          const photo = {
            id: "demo-" + Date.now() + Math.random().toString(16).slice(2),
            url, thumb: url, download: url,
            guest: guest || "", reto: reto || "libre",
            createdAt: Date.now(), width: 0, height: 0, demo: true,
          };
          demoPhotos.unshift(photo);
          resolve(photo);
        }
      }, 120);
    }));
  }

  function deliveryUrl(r, transform) {
    const v = r.version ? `v${r.version}/` : "";
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${v}${r.public_id}.${r.format || "jpg"}`;
  }

  function normalize(r, deleteToken) {
    const custom = (r.context && (r.context.custom || r.context)) || {};
    return {
      id: r.public_id,
      thumb: deliveryUrl(r, "c_limit,w_600,h_900,f_auto,q_auto"),
      square: deliveryUrl(r, "c_fill,g_auto,w_300,h_300,f_auto,q_auto"),
      url: deliveryUrl(r, "c_limit,w_1800,h_1800,f_auto,q_auto"),
      slide: deliveryUrl(r, "c_limit,w_2400,h_2400,f_auto,q_auto:good"),
      download: deliveryUrl(r, "fl_attachment"),
      guest: custom.guest || "",
      reto: custom.reto || "",
      width: r.width || 0,
      height: r.height || 0,
      createdAt: r.created_at ? Date.parse(r.created_at) : Date.now(),
      deleteToken: deleteToken || null,
    };
  }

  /* Lista las fotos de una etiqueta (todas o las de un reto). */
  async function list(retoId) {
    if (!configured) {
      return retoId ? demoPhotos.filter((p) => p.reto === retoId) : demoPhotos.slice();
    }
    const tag = tagFor(retoId);
    const res = await fetch(`https://res.cloudinary.com/${cloudName}/image/list/${tag}.json?t=${Math.floor(Date.now() / 30000)}`);
    if (res.status === 404) return []; // aún no hay fotos con esa etiqueta
    if (!res.ok) throw new Error(res.status === 401
      ? "La galería está bloqueada: activa “Resource list” en Cloudinary (ver README)."
      : `No se pudo cargar la galería (${res.status})`);
    const data = await res.json();
    return (data.resources || [])
      .map((r) => {
        const p = normalize(r);
        if (retoId && !p.reto) p.reto = retoId;
        return p;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /* Permite borrar una foto propia durante los 10 minutos siguientes a subirla
     (requiere activar "Return delete token" en el upload preset). */
  async function remove(photo) {
    if (photo.demo) {
      const i = demoPhotos.findIndex((p) => p.id === photo.id);
      if (i >= 0) demoPhotos.splice(i, 1);
      return true;
    }
    if (!photo.deleteToken) throw new Error("Esta foto ya no se puede borrar desde aquí.");
    const fd = new FormData();
    fd.append("token", photo.deleteToken);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/delete_by_token`, { method: "POST", body: fd });
    if (!res.ok) throw new Error("Ya han pasado más de 10 minutos: pide a los novios que la borren.");
    return true;
  }

  window.Cloud = { configured, upload, list, remove, tagFor };
})();
