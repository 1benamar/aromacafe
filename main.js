/* AROMA CAFÉ BLANES · interacción de la página.
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

  /* ---------- Hora de Blanes ---------- */
  function ahoraEnBlanes() {
    var partes = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short"
    }).formatToParts(new Date());
    var v = {};
    partes.forEach(function (p) { v[p.type] = p.value; });
    return {
      minutos: Number(v.hour) * 60 + Number(v.minute),
      fecha: v.year + "-" + v.month + "-" + v.day,
      dia: String(v.weekday).slice(0, 3).toLowerCase()
    };
  }

  /* ---------- Abierto / cerrado: faro de la carta, tabla de hoy y barra de llamada ---------- */
  function initEstado() {
    var textos = $$("[data-estado-texto]");
    var barra = $("[data-estado-barra]");
    var faro = $("[data-estado-carta]");
    var tabla = $("[data-tabla]");

    function pintar() {
      var t = ahoraEnBlanes();
      var abierto, largo, corto, carta;
      if (CIERRE_TEMPORADA && t.fecha >= CIERRE_TEMPORADA.desde && t.fecha <= CIERRE_TEMPORADA.hasta) {
        abierto = false; largo = "Cerrado por temporada"; corto = largo; carta = "Luz apagada por temporada";
      } else if (t.minutos >= APERTURA && t.minutos < CIERRE) {
        abierto = true; largo = "Abierto ahora · hasta las 23:00"; corto = largo; carta = "Luz verde encendida hasta las 23:00";
      } else {
        abierto = false;
        largo = t.minutos < APERTURA ? "Cerrado ahora · abre a las 8:30" : "Cerrado ahora · abre mañana a las 8:30";
        corto = "Cerrado · abre a las 8:30";
        carta = "Luz verde de 8:30 a 23:00";
      }
      document.body.setAttribute("data-estado", abierto ? "abierto" : "cerrado");
      textos.forEach(function (n) {
        n.textContent = largo;
        var caja = n.closest("[data-estado]");
        if (caja) caja.classList.toggle("is-cerrado", !abierto);
      });
      if (barra) barra.textContent = corto;
      if (faro) faro.textContent = carta;
      if (tabla) {
        $$("tbody tr", tabla).forEach(function (tr) {
          var hoy = tr.getAttribute("data-dia") === t.dia;
          tr.classList.toggle("is-hoy", hoy);
          if (hoy) tr.setAttribute("aria-current", "date"); else tr.removeAttribute("aria-current");
        });
      }
    }
    pintar();
    setInterval(pintar, 60 * 1000);
  }

  /* ---------- Encuadre de la carta: en móvil, centrado en el café y la playa ---------- */
  function initEncuadre() {
    var svg = $(".carta-nautica");
    if (!svg) return;
    var mq = window.matchMedia("(max-width: 719px)");
    function aplicar() { svg.setAttribute("viewBox", mq.matches ? "590 170 900 900" : "0 0 1800 1000"); }
    aplicar();
    if (mq.addEventListener) mq.addEventListener("change", aplicar);
  }

  /* ---------- Barra de llamada en móvil: se recoge mientras se ven las notas de la carta ---------- */
  function initBarra() {
    var barra = $("[data-barra-llamar]");
    var notas = $("[data-notas]");
    if (!barra || !notas || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { barra.classList.toggle("is-recogida", e.isIntersecting); });
    }).observe(notas);
  }

  /* ---------- Apariciones al bajar ---------- */
  function initApariciones() {
    var els = $$("[data-revela]");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("is-visible"); }); return; }
    var io = new IntersectionObserver(function (entradas) {
      var visibles = entradas.filter(function (e) { return e.isIntersecting; });
      visibles.forEach(function (e, i) {
        var el = e.target;
        if (!el.style.transitionDelay) el.style.transitionDelay = Math.min(i * 90, 360) + "ms";
        el.classList.add("is-visible");
        io.unobserve(el);
        setTimeout(function () { el.style.transitionDelay = ""; }, 1400);
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
    // Red de seguridad: a los 6 s se muestra lo que ya esté en pantalla o por encima
    setTimeout(function () {
      els.forEach(function (el) {
        if (!el.classList.contains("is-visible") && el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
      });
    }, 6000);
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
    items.forEach(function (b, i) {
      b.addEventListener("click", function () {
        mostrar(i);
        dialogo.showModal();
        document.body.style.overflow = "hidden";
      });
    });
    $("[data-visor-cerrar]", dialogo).addEventListener("click", function () { dialogo.close(); });
    $("[data-visor-ant]", dialogo).addEventListener("click", function () { mostrar(indice - 1); });
    $("[data-visor-sig]", dialogo).addEventListener("click", function () { mostrar(indice + 1); });
    dialogo.addEventListener("close", function () {
      document.body.style.overflow = "";
      if (items[indice]) items[indice].focus();
    });
    dialogo.addEventListener("click", function (e) { if (e.target === dialogo) dialogo.close(); });
    dialogo.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") mostrar(indice + 1);
      if (e.key === "ArrowLeft") mostrar(indice - 1);
    });
    var x0 = null;
    dialogo.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") x0 = e.clientX; });
    dialogo.addEventListener("pointerup", function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 50) mostrar(indice + (dx < 0 ? 1 : -1));
    });
  }

  function initAnio() {
    var n = $("[data-anio]");
    if (n) n.textContent = String(new Date().getFullYear());
  }

  safe(initEncuadre, "encuadre");
  safe(initEstado, "estado");
  safe(initApariciones, "apariciones");
  safe(initBarra, "barra");
  safe(initVisor, "visor");
  safe(initAnio, "anio");
})();
