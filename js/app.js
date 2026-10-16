/* Misión Secreta de Boda — lógica de la web de invitados */
(function () {
  "use strict";

  const cfg = window.BODA;
  const retos = cfg.retos || [];
  const retoById = Object.fromEntries(retos.map((r, i) => [r.id, { ...r, n: i + 1 }]));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------------------------------------------------------- Almacén local */
  const store = {
    get(k, def) { try { const v = localStorage.getItem("boda:" + k); return v == null ? def : JSON.parse(v); } catch { return def; } },
    set(k, v) { try { localStorage.setItem("boda:" + k, JSON.stringify(v)); } catch {} },
  };
  let guest = store.get("guest", null);           // null = aún no preguntado, "" = anónimo
  let done = store.get("done", {});               // { retoId: { thumb, time } }
  let mine = store.get("mine", []);               // [{ id, deleteToken, time }]
  const recent = [];                              // fotos subidas en esta sesión (la lista de la nube tarda ~1 min en refrescarse)

  /* ---------------------------------------------------------- Textos */
  $$("[data-bind]").forEach((el) => { el.textContent = cfg[el.dataset.bind] || ""; });
  document.title = `Misión Secreta · ${cfg.novio1} & ${cfg.novio2}`;
  if (!Cloud.configured) $("#demo-banner").hidden = false;

  const weddingDate = new Date(cfg.fecha);
  if (!isNaN(weddingDate)) {
    const f = (o) => new Intl.DateTimeFormat("es-ES", o).format(weddingDate);
    $("#hero-date").textContent = `${f({ day: "numeric" })} · ${f({ month: "long" })} · ${f({ year: "numeric" })}`;
  }

  /* ---------------------------------------------------------- Cuenta atrás */
  const cd = $("#countdown");
  function tickCountdown() {
    if (isNaN(weddingDate)) { cd.hidden = true; return; }
    const now = new Date();
    const diff = weddingDate - now;
    const sameDay = now.toDateString() === weddingDate.toDateString();
    if (diff <= 0 || sameDay && diff < 6 * 3600e3) {
      const afterDay = !sameDay && diff < 0;
      cd.innerHTML = `<p class="today">${afterDay ? "Gracias por formar parte de nuestro día" : "¡Hoy es el gran día!"}</p>`;
      return;
    }
    const d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24,
          m = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
    const unit = (n, l) => `<div class="unit"><span class="num">${String(n).padStart(2, "0")}</span><span class="lbl">${l}</span></div>`;
    cd.innerHTML = unit(d, d === 1 ? "día" : "días") + unit(h, "horas") + unit(m, "min") + unit(s, "seg");
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ---------------------------------------------------------- Navegación */
  const tabbar = $(".tabbar");
  const hero = $(".hero");
  const onScroll = () => tabbar.classList.toggle("show", window.scrollY > hero.offsetHeight * 0.45);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  let activeTab = "misiones";
  function showTab(name, scroll = true) {
    activeTab = name;
    $$(".panel").forEach((p) => p.classList.toggle("is-active", p.id === name));
    $$(".tab[data-tab]").forEach((t) => t.classList.toggle("is-active", t.dataset.tab === name));
    if (scroll) $(".main").scrollIntoView({ behavior: "smooth" });
    if (name === "galeria") loadGallery();
    history.replaceState(null, "", "#" + name);
  }
  $$("[data-tab]").forEach((el) => el.addEventListener("click", (e) => {
    e.preventDefault();
    showTab(el.dataset.tab);
    if (el.closest(".hero") && guest === null) setTimeout(askName, 700);
  }));

  /* ---------------------------------------------------------- Diálogos */
  function openDialog(d) {
    if (d.open) return;
    d.showModal();
    document.body.classList.add("no-scroll");
  }
  function closeDialog(d) { if (d.open) d.close(); }
  $$("dialog").forEach((d) => {
    d.addEventListener("close", () => {
      if (!$$("dialog").some((x) => x.open)) document.body.classList.remove("no-scroll");
    });
    d.addEventListener("click", (e) => { if (e.target === d && !d.classList.contains("lightbox")) d.close("cancel"); });
  });

  /* ---------------------------------------------------------- Nombre */
  const nameModal = $("#name-modal");
  let afterName = null;
  function askName(then) {
    afterName = then || null;
    $("#name-input").value = guest || "";
    openDialog(nameModal);
    setTimeout(() => $("#name-input").focus(), 350);
  }
  nameModal.addEventListener("close", () => {
    const rv = nameModal.returnValue;
    if (rv === "ok") guest = $("#name-input").value.trim().slice(0, 40);
    else if (guest === null) guest = "";
    store.set("guest", guest);
    renderGuestLine();
    const cb = afterName; afterName = null;
    if (cb) setTimeout(cb, 250);
  });
  function renderGuestLine() {
    const el = $("#guest-line");
    el.innerHTML = "";
    if (guest) {
      el.append("Tus fotos irán firmadas como ");
      const b = document.createElement("strong"); b.textContent = guest; el.append(b, " · ");
    } else if (guest === "") {
      el.append("Tus fotos se subirán sin nombre · ");
    } else return;
    const btn = document.createElement("button");
    btn.type = "button"; btn.textContent = "cambiar";
    btn.onclick = () => askName();
    el.append(btn);
  }
  renderGuestLine();

  /* ---------------------------------------------------------- Retos */
  const checkSvg = `<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;
  const camSvg = `<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>`;

  function renderRetos() {
    const ol = $("#retos");
    ol.innerHTML = "";
    retos.forEach((r, i) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "reto" + (done[r.id] ? " done" : "");
      btn.dataset.id = r.id;
      btn.innerHTML = `
        <span class="reto-media"></span>
        <span class="reto-body">
          <span class="reto-num"></span>
          <span class="reto-title"></span>
          <span class="reto-desc"></span>
        </span>
        <span class="reto-state">${done[r.id] ? checkSvg : camSvg}</span>`;
      const media = $(".reto-media", btn);
      media.textContent = r.emoji || "📸";
      if (done[r.id]?.thumb) {
        const img = new Image(); img.src = done[r.id].thumb; img.alt = ""; img.loading = "lazy";
        img.onerror = () => img.remove();
        media.append(img);
      }
      $(".reto-num", btn).textContent = done[r.id] ? `Reto ${i + 1} · completado` : `Reto ${i + 1}`;
      $(".reto-title", btn).textContent = r.titulo;
      $(".reto-desc", btn).textContent = r.descripcion;
      btn.addEventListener("click", () => openSheet(r.id));
      li.append(btn);
      ol.append(li);
    });
    // aparición escalonada
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) {
        const el = en.target;
        setTimeout(() => el.classList.add("in"), (Number(el.dataset.delay) || 0));
        io.unobserve(el);
      }
    }), { threshold: 0.1 });
    $$(".reto", ol).forEach((el, i) => { el.dataset.delay = (i % 6) * 60; io.observe(el); });
    renderProgress();
  }

  function renderProgress() {
    const total = retos.length;
    const n = retos.filter((r) => done[r.id]).length;
    $("#progress-count").textContent = n;
    $("#progress-total").textContent = `/ ${total}`;
    const C = 2 * Math.PI * 52;
    $(".ring-bar").style.strokeDashoffset = total ? C * (1 - n / total) : C;
    $("#progress-ring").classList.toggle("is-complete", total > 0 && n === total);
    $("#progress-ring").setAttribute("aria-label", `${n} de ${total} retos completados`);
  }
  renderRetos();

  /* ---------------------------------------------------------- Hoja de subida */
  const sheet = $("#sheet");
  const inCam = $("#input-camera"), inGal = $("#input-gallery");
  let current = { reto: null, files: [], urls: [], uploading: false };

  function openSheet(retoId) {
    const isFree = !retoId || retoId === "libre";
    const r = isFree ? null : retoById[retoId];
    if (guest === null) return askName(() => openSheet(retoId));

    current = { reto: isFree ? "libre" : retoId, files: [], urls: [], uploading: false };
    $("#sheet-emoji").textContent = r ? r.emoji || "📸" : "📷";
    $("#sheet-eyebrow").textContent = r ? (done[retoId] ? `Reto ${r.n} · completado ✓` : `Reto ${r.n}`) : "Sin reto";
    $("#sheet-title").textContent = r ? r.titulo : "Fotos libres";
    $("#sheet-desc").textContent = r ? r.descripcion : "Sube todas las fotos que quieras de la boda. Puedes elegir varias a la vez.";
    inGal.multiple = isFree;
    resetSheet();
    if (r && done[retoId]?.thumb) showPreview([done[retoId].thumb], true);
    openDialog(sheet);
  }

  function resetSheet() {
    current.urls.forEach((u) => URL.revokeObjectURL(u));
    current.files = []; current.urls = [];
    inCam.value = ""; inGal.value = "";
    $("#sheet-preview").hidden = true;
    $("#sheet-preview").innerHTML = "";
    $("#sheet-pick").hidden = false;
    $("#sheet-confirm").hidden = true;
    $("#sheet-progress").hidden = true;
    $("#btn-upload").disabled = false;
    $("#label-camera").textContent = current.reto !== "libre" && done[current.reto] ? "Repetir foto" : "Hacer foto";
    $("#label-gallery").textContent = current.reto === "libre" ? "Elegir fotos" : "Elegir de la galería";
  }

  function showPreview(srcs, existing = false) {
    const box = $("#sheet-preview");
    box.innerHTML = "";
    box.classList.toggle("single", srcs.length === 1);
    srcs.slice(0, 12).forEach((s) => { const img = new Image(); img.src = s; img.alt = ""; box.append(img); });
    if (srcs.length > 12) {
      const more = document.createElement("p");
      more.className = "muted"; more.textContent = `+${srcs.length - 12} más`;
      box.append(more);
    }
    box.hidden = false;
    if (existing) box.style.opacity = ".9";
    else box.style.opacity = "";
  }

  function onFiles(e) {
    const files = [...e.target.files].filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
    if (!files.length) return;
    current.urls.forEach((u) => URL.revokeObjectURL(u));
    current.files = files;
    current.urls = files.map((f) => URL.createObjectURL(f));
    showPreview(current.urls);
    $("#sheet-pick").hidden = true;
    $("#sheet-confirm").hidden = false;
    $("#btn-upload-label").textContent = files.length > 1 ? `Subir ${files.length} fotos` : "Subir foto";
  }
  inCam.addEventListener("change", onFiles);
  inGal.addEventListener("change", onFiles);
  $("#btn-change").addEventListener("click", resetSheet);
  sheet.addEventListener("cancel", (e) => { if (current.uploading) e.preventDefault(); });
  $("#sheet-form").addEventListener("submit", (e) => { if (current.uploading) e.preventDefault(); });
  sheet.addEventListener("close", () => { if (!current.uploading) resetSheet(); });

  $("#btn-upload").addEventListener("click", async () => {
    const files = current.files;
    if (!files.length || current.uploading) return;
    current.uploading = true;
    $("#btn-upload").disabled = true;
    $("#sheet-confirm").hidden = true;
    $("#sheet-progress").hidden = false;
    const fill = $("#progress-fill"), txt = $("#progress-text");
    const retoId = current.reto;
    const uploaded = [];
    let failed = 0;

    for (let i = 0; i < files.length; i++) {
      txt.textContent = files.length > 1 ? `Subiendo ${i + 1} de ${files.length}…` : "Subiendo tu foto…";
      try {
        const photo = await Cloud.upload(files[i], { reto: retoId, guest }, (p) => {
          fill.style.width = `${((i + p) / files.length) * 100}%`;
        });
        uploaded.push(photo);
        recent.unshift(photo);
        mine.unshift({ id: photo.id, deleteToken: photo.deleteToken, time: Date.now() });
      } catch (err) {
        failed++;
        console.error(err);
        if (files.length === 1) toast(err.message || "No se pudo subir la foto", { error: true });
      }
    }
    mine = mine.slice(0, 200);
    store.set("mine", mine);
    fill.style.width = "100%";
    current.uploading = false;

    if (!uploaded.length) {
      $("#sheet-progress").hidden = true;
      $("#sheet-confirm").hidden = false;
      $("#btn-upload").disabled = false;
      if (files.length > 1) toast("No se pudo subir ninguna foto. Revisa tu conexión.", { error: true });
      return;
    }

    closeDialog(sheet);
    galleryStale = true;

    if (retoId !== "libre") {
      const wasDone = !!done[retoId];
      done[retoId] = { thumb: uploaded[0].demo ? null : uploaded[0].square, time: Date.now() };
      store.set("done", done);
      renderRetos();
      const card = $(`.reto[data-id="${CSS.escape(retoId)}"]`);
      card?.classList.add("in", "just-done");
      const total = retos.length, n = retos.filter((r) => done[r.id]).length;
      if (!wasDone && n === total) {
        celebrate(true);
        toast("¡Misión cumplida! Has completado todos los retos 🎉");
      } else {
        celebrate(false);
        toast(wasDone ? "Foto añadida al reto" : `¡Reto completado! Llevas ${n} de ${total}`, undoFor(uploaded[0]));
      }
    } else {
      celebrate(false);
      const msg = failed
        ? `${uploaded.length} subidas, ${failed} con error`
        : uploaded.length > 1 ? `¡${uploaded.length} fotos subidas!` : "¡Foto subida!";
      toast(msg, uploaded.length === 1 ? undoFor(uploaded[0]) : {});
    }
  });

  function undoFor(photo) {
    if (!photo.deleteToken && !photo.demo) return {};
    return {
      action: "Deshacer",
      onAction: async () => {
        try {
          await Cloud.remove(photo);
          forget(photo);
          toast("Foto eliminada");
        } catch (e) { toast(e.message, { error: true }); }
      },
    };
  }

  function forget(photo) {
    const i = recent.findIndex((p) => p.id === photo.id);
    if (i >= 0) recent.splice(i, 1);
    mine = mine.filter((m) => m.id !== photo.id);
    store.set("mine", mine);
    if (photo.reto && done[photo.reto] && (photo.demo || photo.square === done[photo.reto].thumb)) {
      delete done[photo.reto];
      store.set("done", done);
      renderRetos();
    }
    galleryPhotos = galleryPhotos.filter((p) => p.id !== photo.id);
    renderGallery();
  }

  $("#free-card").addEventListener("click", () => openSheet("libre"));
  $("#fab").addEventListener("click", () => openSheet("libre"));

  /* ---------------------------------------------------------- Confeti */
  let shoot = null;
  function celebrate(big) {
    if (!window.confetti) return;
    shoot = shoot || window.confetti.create($("#confetti"), { resize: true, useWorker: true });
    const colors = ["#B8945A", "#7D8F69", "#EBCFC5", "#F1E6D2", "#ffffff"];
    if (!big) {
      shoot({ particleCount: 90, spread: 75, origin: { y: 0.75 }, colors, scalar: 0.9 });
      return;
    }
    const end = Date.now() + 1800;
    (function frame() {
      shoot({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.8 }, colors });
      shoot({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.8 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  /* ---------------------------------------------------------- Avisos */
  function toast(msg, { error = false, action, onAction } = {}) {
    const el = document.createElement("div");
    el.className = "toast" + (error ? " error" : "");
    const span = document.createElement("span"); span.textContent = msg; el.append(span);
    if (action) {
      const b = document.createElement("button"); b.type = "button"; b.textContent = action;
      b.onclick = () => { dismiss(); onAction(); };
      el.append(b);
    }
    $("#toasts").append(el);
    const t = setTimeout(dismiss, action ? 7000 : 3800);
    function dismiss() { clearTimeout(t); el.classList.add("out"); setTimeout(() => el.remove(), 300); }
  }

  /* ---------------------------------------------------------- Galería */
  let filter = "all";
  let galleryPhotos = [];
  let galleryStale = true;
  let loading = false;

  function renderChips() {
    const chips = $("#chips");
    const items = [["all", "Todas"], ...retos.map((r) => [r.id, `${r.emoji || ""} ${r.titulo}`.trim()]), ["libre", "📷 Libres"]];
    chips.innerHTML = "";
    items.forEach(([id, label]) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "chip"; b.role = "tab";
      b.textContent = label;
      b.setAttribute("aria-selected", String(id === filter));
      b.onclick = () => {
        if (filter === id) return;
        filter = id;
        $$(".chip", chips).forEach((c) => c.setAttribute("aria-selected", String(c === b)));
        galleryStale = true;
        loadGallery();
      };
      chips.append(b);
    });
  }
  renderChips();

  async function loadGallery(force = false) {
    if (loading || (!galleryStale && !force)) { renderGallery(); return; }
    loading = true;
    const btn = $("#refresh-btn");
    btn.classList.add("is-spinning");
    if (!galleryPhotos.length) renderSkeleton();
    $("#gallery-error").hidden = true;
    try {
      const want = filter;
      const list = await Cloud.list(want === "all" ? null : want);
      if (want !== filter) return; // el usuario cambió de filtro mientras cargaba
      const ids = new Set(list.map((p) => p.id));
      const extra = recent.filter((p) => !ids.has(p.id) && (want === "all" || p.reto === want));
      galleryPhotos = [...extra, ...list];
      galleryStale = false;
    } catch (e) {
      $("#gallery-error").textContent = e.message;
      $("#gallery-error").hidden = false;
      galleryPhotos = recent.filter((p) => filter === "all" || p.reto === filter);
    } finally {
      loading = false;
      btn.classList.remove("is-spinning");
      renderGallery();
    }
  }

  function renderSkeleton() {
    const g = $("#gallery");
    g.innerHTML = "";
    for (let i = 0; i < 6; i++) {
      const d = document.createElement("div");
      d.className = "tile skeleton";
      d.style.setProperty("--ar", [1, .75, 1.25, .8, 1, 1.3][i]);
      g.append(d);
    }
    $("#gallery-empty").hidden = true;
  }

  function renderGallery() {
    const g = $("#gallery");
    const mineIds = new Set(mine.map((m) => m.id));
    const existing = new Map($$(".tile[data-id]", g).map((t) => [t.dataset.id, t]));
    g.innerHTML = "";
    galleryPhotos.forEach((p, i) => {
      let tile = existing.get(p.id);
      if (!tile) {
        tile = document.createElement("button");
        tile.type = "button";
        tile.className = "tile";
        tile.dataset.id = p.id;
        // proporción real (limitada para que no haya fotos larguísimas)
        const ar = p.width && p.height ? Math.min(1.6, Math.max(0.6, p.width / p.height)) : 1;
        tile.style.setProperty("--ar", ar.toFixed(3));
        const img = new Image();
        img.alt = p.guest ? `Foto de ${p.guest}` : "Foto de la boda";
        img.loading = "lazy"; img.decoding = "async";
        img.onload = () => img.classList.add("loaded");
        img.src = p.thumb;
        tile.append(img);
        if (p.guest) {
          const cap = document.createElement("span");
          cap.className = "tile-cap"; cap.textContent = p.guest;
          tile.append(cap);
        }
      }
      tile.classList.toggle("mine", mineIds.has(p.id));
      tile.onclick = () => openLightbox(i);
      g.append(tile);
    });
    const n = galleryPhotos.length;
    $("#gallery-empty").hidden = n > 0 || !$("#gallery-error").hidden;
    $("#gallery-count").textContent = n ? `${n} ${n === 1 ? "foto" : "fotos"}` : "";
  }

  $("#refresh-btn").addEventListener("click", () => { galleryStale = true; loadGallery(true); });
  setInterval(() => {
    if (activeTab === "galeria" && document.visibilityState === "visible" && !lightbox.open) {
      galleryStale = true; loadGallery();
    }
  }, 45000);

  /* ---------------------------------------------------------- Visor */
  const lightbox = $("#lightbox");
  const lbImg = $("#lb-img");
  let lbIndex = 0;

  function openLightbox(i) {
    lbIndex = i;
    showLb();
    openDialog(lightbox);
  }
  function showLb(dir = 0) {
    const p = galleryPhotos[lbIndex];
    if (!p) return closeDialog(lightbox);
    lbImg.style.opacity = "0";
    lbImg.style.transform = `translateX(${dir * 30}px)`;
    const img = new Image();
    img.onload = img.onerror = () => {
      lbImg.src = img.src;
      lbImg.style.opacity = "1";
      lbImg.style.transform = "none";
    };
    img.src = p.url;
    $("#lb-counter").textContent = `${lbIndex + 1} / ${galleryPhotos.length}`;
    $("#lb-guest").textContent = p.guest || "Invitado anónimo";
    const r = retoById[p.reto];
    $("#lb-reto").textContent = r ? `${r.emoji || ""} ${r.titulo}` : p.reto === "libre" ? "Foto libre" : "";
    const dl = $("#lb-download");
    dl.href = p.download;
    const m = mine.find((x) => x.id === p.id);
    $("#lb-delete").hidden = !(p.demo || (m?.deleteToken && Date.now() - m.time < 9.5 * 60e3));
    // precarga la siguiente
    const nx = galleryPhotos[lbIndex + 1];
    if (nx) new Image().src = nx.url;
  }
  function step(d) {
    if (!galleryPhotos.length) return;
    lbIndex = (lbIndex + d + galleryPhotos.length) % galleryPhotos.length;
    showLb(d);
  }
  $("#lb-prev").onclick = () => step(-1);
  $("#lb-next").onclick = () => step(1);
  $("#lb-close").onclick = () => closeDialog(lightbox);
  $("#lb-delete").onclick = async () => {
    const p = galleryPhotos[lbIndex];
    const m = mine.find((x) => x.id === p.id);
    if (!confirm("¿Borrar esta foto?")) return;
    try {
      await Cloud.remove({ ...p, deleteToken: p.deleteToken || m?.deleteToken });
      closeDialog(lightbox);
      forget(p);
      toast("Foto eliminada");
    } catch (e) { toast(e.message, { error: true }); }
  };
  lightbox.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });
  // deslizar con el dedo
  let sx = 0, sy = 0;
  $("#lb-stage").addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  $("#lb-stage").addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) closeDialog(lightbox);
  });
  $("#lb-stage").addEventListener("click", (e) => { if (e.target !== lbImg) closeDialog(lightbox); });

  /* ---------------------------------------------------------- Arranque */
  if (location.hash === "#galeria") showTab("galeria", false);
})();
