/* AROMA CAFÉ BLANES · interacción de la portada.
   Sin dependencias ni módulos: un solo archivo que se carga con defer.
   Cada parte va protegida para que un fallo no deje al resto sin funcionar. */
(function () {
  "use strict";

  window.__aroma = true;

  // Horario: todos los días de 8:30 a 23:00 (hora de Blanes).
  var APERTURA = 8 * 60 + 30;
  var CIERRE = 23 * 60;
  // Si el local cierra por temporada, indicar aquí las fechas (AAAA-MM-DD),
  // por ejemplo { desde: "2027-01-07", hasta: "2027-02-14" }. null = sin cierre.
  var CIERRE_TEMPORADA = null;

  var reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function safe(fn, nombre) {
    try { fn(); } catch (e) { if (window.console) console.warn("[aroma] " + nombre, e); }
  }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- Cabecera: transparente sobre la portada, sólida después ---------- */
  function initCabecera() {
    var cab = $("[data-cab]");
    var portada = $("[data-portada]");
    if (!cab || !portada || !("IntersectionObserver" in window)) { if (cab) cab.classList.add("is-solida"); return; }
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { cab.classList.toggle("is-solida", !e.isIntersecting); });
    }, { rootMargin: "-" + (cab.offsetHeight + 1) + "px 0px 0px 0px", threshold: 0 });
    io.observe(portada);
  }

  /* ---------- Enlace activo del menú según la sección visible ---------- */
  function initSeccionActiva() {
    var enlaces = $$(".cab__nav a");
    if (!enlaces.length || !("IntersectionObserver" in window)) return;
    var porId = {};
    enlaces.forEach(function (a) { porId[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        var a = porId[e.target.id];
        if (!a) return;
        if (e.isIntersecting) {
          enlaces.forEach(function (x) { x.removeAttribute("aria-current"); });
          a.setAttribute("aria-current", "true");
        } else if (a.getAttribute("aria-current")) {
          a.removeAttribute("aria-current");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(porId).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- Menú móvil ---------- */
  function initMenu() {
    var menu = $("[data-menu]");
    var abrir = $("[data-menu-abrir]");
    var cerrar = $("[data-menu-cerrar]");
    if (!menu || !abrir) return;
    var ultimoFoco = null;

    function abrirMenu() {
      ultimoFoco = document.activeElement;
      menu.hidden = false;
      void menu.offsetWidth; // fuerza el estado inicial antes de animar
      menu.classList.add("is-abierto");
      abrir.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      setTimeout(function () { if (cerrar) cerrar.focus(); }, 60);
    }
    function cerrarMenu(volverFoco) {
      if (!menu.classList.contains("is-abierto")) return;
      menu.classList.remove("is-abierto");
      abrir.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      setTimeout(function () { if (!menu.classList.contains("is-abierto")) menu.hidden = true; }, reducido ? 200 : 540);
      if (volverFoco !== false && ultimoFoco) ultimoFoco.focus();
    }
    abrir.addEventListener("click", abrirMenu);
    if (cerrar) cerrar.addEventListener("click", function () { cerrarMenu(); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { cerrarMenu(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") cerrarMenu();
      if (e.key === "Tab" && menu.classList.contains("is-abierto")) {
        var f = $$("a, button", menu);
        var primero = f[0], ultimo = f[f.length - 1];
        if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
      }
    });
    window.matchMedia("(min-width: 1081px)").addEventListener("change", function (m) { if (m.matches) cerrarMenu(false); });
  }

  /* ---------- Estado abierto / cerrado ---------- */
  function horaBlanes() {
    var partes = new Intl.DateTimeFormat("es-ES", {
      timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date());
    var v = {};
    partes.forEach(function (p) { v[p.type] = p.value; });
    return { minutos: Number(v.hour) * 60 + Number(v.minute), fecha: v.year + "-" + v.month + "-" + v.day };
  }
  function initEstado() {
    var nodos = $$("[data-estado]");
    if (!nodos.length) return;
    function pintar() {
      var t = horaBlanes();
      var texto, abierto;
      if (CIERRE_TEMPORADA && t.fecha >= CIERRE_TEMPORADA.desde && t.fecha <= CIERRE_TEMPORADA.hasta) {
        abierto = false; texto = "Cerrado por temporada";
      } else if (t.minutos >= APERTURA && t.minutos < CIERRE) {
        abierto = true;
        texto = CIERRE - t.minutos <= 45 ? "Abierto ahora · cierra a las 23:00" : "Abierto ahora · hasta las 23:00";
      } else {
        abierto = false;
        texto = t.minutos < APERTURA ? "Cerrado · abre hoy a las 8:30" : "Cerrado · abre mañana a las 8:30";
      }
      nodos.forEach(function (n) {
        n.classList.toggle("is-abierto", abierto);
        n.classList.toggle("is-cerrado", !abierto);
        var t2 = $("[data-estado-texto]", n);
        if (t2) t2.textContent = texto;
      });
    }
    pintar();
    setInterval(pintar, 60 * 1000);
  }

  /* ---------- Apariciones al bajar ---------- */
  function initApariciones() {
    var els = $$("[data-revela], [data-desvela]");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("is-visible"); }); return; }
    // Escalonado suave entre elementos que entran a la vez
    var io = new IntersectionObserver(function (entradas) {
      var visibles = entradas.filter(function (e) { return e.isIntersecting; });
      visibles.forEach(function (e, i) {
        var el = e.target;
        if (el.hasAttribute("data-revela") && !el.style.transitionDelay) el.style.transitionDelay = Math.min(i * 90, 360) + "ms";
        el.classList.add("is-visible");
        io.unobserve(el);
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
    // Red de seguridad: a los 6 s se muestra todo lo que ya esté en pantalla o por encima
    setTimeout(function () {
      els.forEach(function (el) {
        if (!el.classList.contains("is-visible") && el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
      });
    }, 6000);
  }

  /* ---------- Del café a la copa: escenario fijo con relevo de fotos ---------- */
  function initDia() {
    var seccion = $("[data-dia]");
    if (!seccion || !("IntersectionObserver" in window)) return;
    var imgs = $$(".dia__img", seccion);
    var pasos = $$(".paso", seccion);
    var actual = 0;
    var capa = 2;

    function activar(i) {
      if (i === actual) return;
      var baja = i > actual;
      pasos.forEach(function (p, k) { p.classList.toggle("is-activo", k === i); });
      var nueva = imgs[i];
      if (!nueva) { actual = i; return; }
      imgs.forEach(function (im) { im.classList.remove("is-activa"); });
      nueva.style.zIndex = String(++capa);
      nueva.classList.add("is-activa");
      if (!reducido && nueva.animate) {
        nueva.animate(
          [{ clipPath: baja ? "inset(100% 0 0 0)" : "inset(0 0 100% 0)", transform: "scale(1.08)" },
           { clipPath: "inset(0 0 0 0)", transform: "scale(1)" }],
          { duration: 1000, easing: "cubic-bezier(0.77, 0, 0.175, 1)" }
        );
      } else if (nueva.animate) {
        nueva.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: "ease" });
      }
      actual = i;
    }

    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) activar(Number(e.target.getAttribute("data-paso")));
      });
    }, { rootMargin: "-48% 0px -48% 0px" });
    pasos.forEach(function (p) { io.observe(p); });
  }

  /* ---------- Pestañas de la carta ---------- */
  function initCarta() {
    var caja = $("[data-pestanas]");
    if (!caja) return;
    var lista = $("[role=tablist]", caja);
    var tabs = $$("[role=tab]", caja);
    var indicador = $("[data-indicador]", caja);

    function moverIndicador(tab) {
      if (!indicador || !tab) return;
      indicador.style.setProperty("--x", tab.offsetLeft + "px");
      indicador.style.setProperty("--w", String(tab.offsetWidth / 100));
    }
    function seleccionar(tab, enfocar) {
      tabs.forEach(function (t) {
        var si = t === tab;
        t.setAttribute("aria-selected", si ? "true" : "false");
        t.tabIndex = si ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (!panel) return;
        if (si) {
          panel.hidden = false;
          panel.classList.remove("is-entrando");
          void panel.offsetWidth;
          panel.classList.add("is-entrando");
        } else {
          panel.hidden = true;
          panel.classList.remove("is-entrando");
        }
      });
      moverIndicador(tab);
      if (enfocar) tab.focus();
      // En móvil, que la pestaña elegida quede a la vista
      var l = lista.getBoundingClientRect(), r = tab.getBoundingClientRect();
      if (r.left < l.left || r.right > l.right) lista.scrollBy({ left: r.left - l.left - 24, behavior: reducido ? "auto" : "smooth" });
    }

    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { seleccionar(t, false); });
      t.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") n = tabs[0];
        if (e.key === "End") n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); seleccionar(n, true); }
      });
    });

    var activa = function () { return tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0]; };
    moverIndicador(activa());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moverIndicador(activa()); });
    if ("ResizeObserver" in window) new ResizeObserver(function () { moverIndicador(activa()); }).observe(lista);
  }

  /* ---------- Visor de fotos ---------- */
  function initVisor() {
    var dialogo = $("[data-visor-dialogo]");
    var items = $$("[data-visor]");
    if (!dialogo || !items.length || typeof dialogo.showModal !== "function") return;
    var pie = $("[data-visor-pie]", dialogo);
    var img = document.createElement("img");
    img.className = "visor__img";
    img.decoding = "async";
    pie.parentNode.insertBefore(img, pie);
    var indice = 0;

    // La versión más grande de cada foto
    var fotos = items.map(function (b) {
      var im = $("img", b);
      var src = im.getAttribute("src");
      var set = im.getAttribute("srcset");
      if (set) {
        var mejor = 0;
        set.split(",").forEach(function (c) {
          var p = c.trim().split(/\s+/);
          var w = parseInt(p[1], 10) || 0;
          if (w > mejor) { mejor = w; src = p[0]; }
        });
      }
      return { src: src, alt: im.getAttribute("alt") || "" };
    });

    function mostrar(i) {
      indice = (i + fotos.length) % fotos.length;
      var f = fotos[indice];
      img.classList.add("is-cambiando");
      var nueva = new Image();
      nueva.onload = nueva.onerror = function () {
        img.src = f.src;
        img.alt = f.alt;
        pie.textContent = f.alt;
        img.classList.remove("is-cambiando");
      };
      nueva.src = f.src;
    }
    function abrirVisor(i) {
      mostrar(i);
      dialogo.showModal();
      document.body.style.overflow = "hidden";
    }
    items.forEach(function (b, i) { b.addEventListener("click", function () { abrirVisor(i); }); });
    $("[data-visor-cerrar]", dialogo).addEventListener("click", function () { dialogo.close(); });
    $("[data-visor-ant]", dialogo).addEventListener("click", function () { mostrar(indice - 1); });
    $("[data-visor-sig]", dialogo).addEventListener("click", function () { mostrar(indice + 1); });
    dialogo.addEventListener("close", function () {
      document.body.style.overflow = "";
      var origen = items[indice];
      if (origen) origen.focus();
    });
    dialogo.addEventListener("click", function (e) { if (e.target === dialogo) dialogo.close(); });
    dialogo.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") mostrar(indice + 1);
      if (e.key === "ArrowLeft") mostrar(indice - 1);
    });
    // Deslizar en pantallas táctiles
    var x0 = null;
    dialogo.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") x0 = e.clientX; });
    dialogo.addEventListener("pointerup", function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 50) mostrar(indice + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------- Mapa: solo se conecta con Google cuando se pide ---------- */
  function initMapa() {
    var caja = $("[data-mapa]");
    var boton = $("[data-mapa-cargar]");
    if (!caja || !boton) return;
    boton.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = "https://maps.google.com/maps?q=Aroma%20caf%C3%A9%20Blanes%2C%20Passeig%20de%20Dintre%204%2C%2017300%20Blanes&z=17&output=embed";
      f.title = "Mapa de Aroma Café en Google Maps";
      f.loading = "lazy";
      f.referrerPolicy = "no-referrer-when-downgrade";
      f.setAttribute("allowfullscreen", "");
      caja.appendChild(f);
      var capa = $(".mapa__capa", caja);
      if (capa) capa.remove();
    });
  }

  function initAnio() {
    var n = $("[data-anio]");
    if (n) n.textContent = String(new Date().getFullYear());
  }

  safe(initCabecera, "cabecera");
  safe(initSeccionActiva, "seccion activa");
  safe(initMenu, "menu");
  safe(initEstado, "estado");
  safe(initApariciones, "apariciones");
  safe(initDia, "dia");
  safe(initCarta, "carta");
  safe(initVisor, "visor");
  safe(initMapa, "mapa");
  safe(initAnio, "anio");
})();
