/* Utilidades compartidas por pantalla.html y qr.html */
window.BodaShared = {
  // Dirección de la web de invitados (para el QR)
  guestUrl() {
    if (window.BODA.urlWeb) return window.BODA.urlWeb;
    const u = new URL(location.href);
    u.hash = ""; u.search = "";
    u.pathname = u.pathname.replace(/[^/]*$/, "");
    return u.toString();
  },
  // Devuelve un <svg> con el QR de la URL
  qrSvg(text, { margin = 0, dark = "#2E2A26" } = {}) {
    const qr = qrcode(0, "M");
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount();
    let d = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c + margin} ${r + margin}h1v1h-1z`;
    const size = n + margin * 2;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><path fill="${dark}" stroke="none" d="${d}"/></svg>`;
  },
};
